import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import sharp from "sharp";

import { convertImage } from "@/lib/converter";
import { compressPNG } from "@/lib/pngquant";
import { optimizeJPEG } from "@/lib/jpegoptim";
import { compressSVG } from "@/lib/svgo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =====================================================
   TYPES
===================================================== */

type ZipFile = {
  originalName?: string;
  compressedName?: string;
  currentExtension?: string;
  mime?: string;
  originalMime?: string;
  data?: string;
  originalData?: string;
  selectedFormat?: string;
};

const SUPPORTED_FORMATS = [
  "jpg",
  "png",
  "webp",
  "avif",
  "svg",
] as const;

type SupportedFormat =
  (typeof SUPPORTED_FORMATS)[number];

/* =====================================================
   NORMALIZE FORMAT
===================================================== */

function normalizeFormat(
  format: string
): SupportedFormat {
  const value = String(format)
    .toLowerCase()
    .trim();

  if (value === "jpeg") {
    return "jpg";
  }

  if (
    SUPPORTED_FORMATS.includes(
      value as SupportedFormat
    )
  ) {
    return value as SupportedFormat;
  }

  throw new Error(
    `Unsupported format: ${format}`
  );
}

/* =====================================================
   MIME TYPE
===================================================== */

function getMimeType(
  format: SupportedFormat
): string {
  switch (format) {
    case "jpg":
      return "image/jpeg";

    case "png":
      return "image/png";

    case "webp":
      return "image/webp";

    case "avif":
      return "image/avif";

    case "svg":
      return "image/svg+xml";

    default:
      return "application/octet-stream";
  }
}

/* =====================================================
   SAFE BASE64 DECODER
===================================================== */

function decodeBase64(
  data: string,
  filename: string
): Buffer {
  if (!data || typeof data !== "string") {
    throw new Error(
      `Invalid data for ${filename}`
    );
  }

  /*
   * Support both:
   *
   * abcdef...
   *
   * and:
   *
   * data:image/png;base64,abcdef...
   */

  const cleanData =
    data.includes(",")
      ? data.split(",").pop() || ""
      : data;

  const buffer =
    Buffer.from(
      cleanData,
      "base64"
    );

  if (!buffer.length) {
    throw new Error(
      `Empty image data for ${filename}`
    );
  }

  return buffer;
}

/* =====================================================
   GET SOURCE FORMAT
===================================================== */

function getSourceFormat(
  file: ZipFile
): SupportedFormat {
  const candidates = [
    file.originalName,
    file.currentExtension,
    file.originalMime,
    file.mime,
  ];

  for (const value of candidates) {
    if (!value) {
      continue;
    }

    const text =
      String(value)
        .toLowerCase()
        .trim();

    /*
     * Filename
     */

    if (text.includes(".")) {
      const extension =
        text
          .split(".")
          .pop();

      if (extension) {
        try {
          return normalizeFormat(
            extension
          );
        } catch {
          // Continue checking MIME.
        }
      }
    }

    /*
     * MIME
     */

    if (
      text === "image/jpeg" ||
      text === "image/jpg"
    ) {
      return "jpg";
    }

    if (text === "image/png") {
      return "png";
    }

    if (text === "image/webp") {
      return "webp";
    }

    if (text === "image/avif") {
      return "avif";
    }

    if (
      text === "image/svg+xml"
    ) {
      return "svg";
    }
  }

  throw new Error(
    `Unable to determine source format for ${file.originalName || "image"
    }`
  );
}

/* =====================================================
   CREATE FILENAME
===================================================== */

function createFilename(
  originalName: string,
  extension: SupportedFormat
): string {
  const baseName =
    originalName
      .replace(
        /\.[^/.]+$/,
        ""
      )
      .replace(
        /[<>:"/\\|?*]/g,
        "_"
      )
      .trim() ||
    "image";

  return `${baseName}.${extension}`;
}

/* =====================================================
   UNIQUE ZIP FILENAME
===================================================== */

function getUniqueFilename(
  filename: string,
  usedNames: Set<string>
): string {
  if (!usedNames.has(filename)) {
    usedNames.add(filename);
    return filename;
  }

  const extensionIndex =
    filename.lastIndexOf(".");

  const base =
    extensionIndex > 0
      ? filename.substring(
        0,
        extensionIndex
      )
      : filename;

  const extension =
    extensionIndex > 0
      ? filename.substring(
        extensionIndex
      )
      : "";

  let counter = 2;

  let newName =
    `${base}-${counter}${extension}`;

  while (
    usedNames.has(newName)
  ) {
    counter++;

    newName =
      `${base}-${counter}${extension}`;
  }

  usedNames.add(newName);

  return newName;
}

/* =====================================================
   VERIFY BUFFER FORMAT
===================================================== */

function verifyBufferFormat(
  buffer: Buffer,
  format: SupportedFormat
): boolean {
  if (!buffer.length) {
    return false;
  }

  /*
   * JPEG
   *
   * FF D8 FF
   */

  if (format === "jpg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  /*
   * PNG
   *
   * 89 50 4E 47 0D 0A 1A 0A
   */

  if (format === "png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  /*
   * WEBP
   *
   * RIFF....WEBP
   */

  if (format === "webp") {
    return (
      buffer.length >= 12 &&
      buffer.toString(
        "ascii",
        0,
        4
      ) === "RIFF" &&
      buffer.toString(
        "ascii",
        8,
        12
      ) === "WEBP"
    );
  }

  /*
   * AVIF
   *
   * ISO BMFF
   *
   * Check ftyp and AVIF brands.
   */

  if (format === "avif") {
    if (
      buffer.length < 12 ||
      buffer.toString(
        "ascii",
        4,
        8
      ) !== "ftyp"
    ) {
      return false;
    }

    const brands =
      buffer.toString(
        "ascii",
        8,
        Math.min(
          buffer.length,
          32
        )
      );

    return (
      brands.includes("avif") ||
      brands.includes("avis")
    );
  }

  /*
   * SVG
   */

  if (format === "svg") {
    const text =
      buffer
        .toString("utf8")
        .trim()
        .toLowerCase();

    return (
      text.includes("<svg") ||
      text.includes("<?xml")
    );
  }

  return false;
}

/* =====================================================
   ENCODE TARGET FORMAT
===================================================== */

async function encodeTargetFormat(
  buffer: Buffer,
  format: SupportedFormat
): Promise<Buffer> {

  /*
   * IMPORTANT:
   *
   * ALWAYS encode the source into the
   * requested target format.
   *
   * We NEVER return the original buffer here.
   */

  if (format === "jpg") {
    return await sharp(buffer)
      .rotate()
      .jpeg({
        quality: 65,
        mozjpeg: true,
        chromaSubsampling: "4:2:0",
      })
      .toBuffer();
  }

  if (format === "png") {
    return await sharp(buffer)
      .rotate()
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toBuffer();
  }

  if (format === "webp") {
    return await sharp(buffer)
      .rotate()
      .webp({
        quality: 80,
      })
      .toBuffer();
  }

  if (format === "avif") {
    return await sharp(buffer)
      .rotate()
      .avif({
        quality: 45,
        effort: 9,
      })
      .toBuffer();
  }

  if (format === "svg") {
    const converted =
      await convertImage(
        buffer,
        "svg"
      );

    return converted.buffer;
  }

  throw new Error(
    `Unsupported target format: ${format}`
  );
}

/* =====================================================
   COMPRESS TARGET FORMAT
===================================================== */

async function compressTargetFormat(
  buffer: Buffer,
  format: SupportedFormat
): Promise<Buffer> {

  /*
   * JPG
   */

  if (format === "jpg") {
    try {
      const optimized =
        await optimizeJPEG(
          buffer
        );

      if (
        optimized &&
        optimized.length > 0 &&
        verifyBufferFormat(
          optimized,
          "jpg"
        )
      ) {
        return optimized;
      }

      return buffer;
    } catch (error) {
      console.warn(
        "JPEG optimization failed. Keeping Sharp JPEG.",
        error
      );

      return buffer;
    }
  }

  /*
   * PNG
   */

  if (format === "png") {
    try {
      const optimized =
        await compressPNG(
          buffer
        );

      if (
        optimized &&
        optimized.length > 0 &&
        verifyBufferFormat(
          optimized,
          "png"
        )
      ) {
        return optimized;
      }

      console.warn(
        "PNG compressor returned invalid output. Keeping Sharp PNG."
      );

      return buffer;
    } catch (error) {
      console.warn(
        "PNG compression failed. Keeping Sharp-generated PNG.",
        error
      );

      return buffer;
    }
  }

  /*
   * WEBP
   */

  if (format === "webp") {
    return buffer;
  }

  /*
   * AVIF
   */

  if (format === "avif") {
    return buffer;
  }

  /*
   * SVG
   */

  if (format === "svg") {
    try {
      const optimized =
        await compressSVG(
          buffer
        );

      if (
        optimized &&
        optimized.length > 0 &&
        verifyBufferFormat(
          optimized,
          "svg"
        )
      ) {
        return optimized;
      }

      return buffer;
    } catch (error) {
      console.warn(
        "SVG optimization failed. Keeping generated SVG.",
        error
      );

      return buffer;
    }
  }

  return buffer;
}

/* =====================================================
   PROCESS QUICK ZIP FILE
===================================================== */

async function processQuickZipFile(
  file: ZipFile,
  quickFormat: SupportedFormat
): Promise<{
  buffer: Buffer;
  filename: string;
}> {
  const displayName =
    file.originalName ||
    file.compressedName ||
    "image";

  console.log(
    "----------------------------------------"
  );

  console.log(
    "QUICK ZIP:"
  );

  console.log(
    "File:",
    displayName
  );

  console.log(
    "Target:",
    quickFormat
  );

  const sourceData =
    file.originalData ||
    file.data;

  if (!sourceData) {
    throw new Error(
      `No source data for ${displayName}`
    );
  }

  const sourceBuffer =
    decodeBase64(
      sourceData,
      displayName
    );

  console.log(
    "Source size:",
    (
      sourceBuffer.length /
      1024
    ).toFixed(2),
    "KB"
  );

  const sourceFormat =
    getSourceFormat(file);

  console.log(
    "Source format:",
    sourceFormat
  );

  /*
   * ALWAYS ENCODE TARGET
   */

  console.log(
    `${displayName}: ${sourceFormat} → ${quickFormat}`
  );

  const convertedBuffer =
    await encodeTargetFormat(
      sourceBuffer,
      quickFormat
    );

  /*
   * VERIFY TARGET
   */

  if (
    !verifyBufferFormat(
      convertedBuffer,
      quickFormat
    )
  ) {
    throw new Error(
      `Conversion produced invalid ${quickFormat} data for ${displayName}`
    );
  }

  console.log(
    "Converted format:",
    quickFormat
  );

  console.log(
    "Converted size:",
    (
      convertedBuffer.length /
      1024
    ).toFixed(2),
    "KB"
  );

  /*
   * COMPRESS TARGET
   */

  const finalBuffer =
    await compressTargetFormat(
      convertedBuffer,
      quickFormat
    );

  /*
   * FINAL VERIFICATION
   */

  if (
    !verifyBufferFormat(
      finalBuffer,
      quickFormat
    )
  ) {
    throw new Error(
      `Final buffer is not valid ${quickFormat} data for ${displayName}`
    );
  }

  console.log(
    "Final format:",
    quickFormat
  );

  console.log(
    "Final size:",
    (
      finalBuffer.length /
      1024
    ).toFixed(2),
    "KB"
  );

  /*
   * FINAL FILENAME
   */

  const filename =
    createFilename(
      displayName,
      quickFormat
    );

  console.log(
    "ZIP filename:",
    filename
  );

  return {
    buffer: finalBuffer,
    filename,
  };
}

/* =====================================================
   POST
===================================================== */

export async function POST(
  req: NextRequest
) {
  try {
    const body =
      await req.json();

    const files =
      body?.files as ZipFile[];

    /*
     * QUICK ZIP FORMAT
     */

    const quickFormat =
      body?.format
        ? normalizeFormat(
          body.format
        )
        : null;

    /*
     * VALIDATE
     */

    if (
      !Array.isArray(files) ||
      files.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No files received",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "========================================"
    );

    console.log(
      "ZIP REQUEST"
    );

    console.log(
      "Files:",
      files.length
    );

    console.log(
      "Quick format:",
      quickFormat || "none"
    );

    console.log(
      "========================================"
    );

    /*
     * CREATE ARCHIVE
     */

    const archive =
      archiver("zip", {
        zlib: {
          level: 6,
        },
      });

    const chunks: Buffer[] =
      [];

    archive.on(
      "data",
      (chunk: Buffer) => {
        chunks.push(
          Buffer.from(chunk)
        );
      }
    );

    /*
     * PROCESS ARCHIVE ERRORS
     */

    const archiveError =
      new Promise<never>(
        (_, reject) => {
          archive.once(
            "error",
            reject
          );
        }
      );

    /*
     * USED FILENAMES
     */

    const usedNames =
      new Set<string>();

    /* =================================================
       QUICK ZIP
    ================================================= */

    if (quickFormat) {

      for (const file of files) {

        if (
          !file ||
          (!file.data &&
            !file.originalData)
        ) {
          console.warn(
            "Skipping invalid file:",
            file?.originalName
          );

          continue;
        }

        const result =
          await processQuickZipFile(
            file,
            quickFormat
          );

        const uniqueFilename =
          getUniqueFilename(
            result.filename,
            usedNames
          );

        /*
         * FINAL SAFETY CHECK BEFORE ZIP
         */

        if (
          !verifyBufferFormat(
            result.buffer,
            quickFormat
          )
        ) {
          throw new Error(
            `Refusing to add invalid ${quickFormat} file: ${uniqueFilename}`
          );
        }

        archive.append(
          result.buffer,
          {
            name:
              uniqueFilename,
          }
        );

        console.log(
          `Added to ZIP: ${uniqueFilename} (${quickFormat})`
        );
      }

    }

    /* =================================================
       NORMAL ZIP
    ================================================= */

    else {

      for (const file of files) {

        if (
          !file?.data &&
          !file?.originalData
        ) {
          console.warn(
            "Skipping file:",
            file?.originalName
          );

          continue;
        }

        /*
         * IMPORTANT:
         *
         * selectedFormat comes from the
         * user's dropdown selection.
         *
         * Do NOT use currentExtension
         * when selectedFormat exists.
         */

        const selectedFormat =
          file.selectedFormat
            ? normalizeFormat(
              file.selectedFormat
            )
            : normalizeFormat(
              file.currentExtension ||
              "jpg"
            );

        const displayName =
          file.originalName ||
          file.compressedName ||
          "image";

        console.log(
          "----------------------------------------"
        );

        console.log(
          "NORMAL ZIP:"
        );

        console.log(
          "File:",
          displayName
        );

        console.log(
          "Selected format:",
          selectedFormat
        );

        /*
         * =================================================
         * SOURCE
         * =================================================
         *
         * Always use originalData when available.
         */

        const sourceData =
          file.originalData ||
          file.data;

        if (!sourceData) {
          throw new Error(
            `No source data for ${displayName}`
          );
        }

        const sourceBuffer =
          decodeBase64(
            sourceData,
            displayName
          );

        /*
         * =================================================
         * ALWAYS ENCODE SELECTED FORMAT
         * =================================================
         *
         * This is the important fix.
         *
         * Example:
         *
         * JPG → PNG
         * PNG → WEBP
         * WEBP → AVIF
         * PNG → JPG
         * JPG → JPG
         * PNG → PNG
         *
         * Every case is actually encoded.
         */

        console.log(
          `${displayName}: encoding → ${selectedFormat}`
        );

        const convertedBuffer =
          await encodeTargetFormat(
            sourceBuffer,
            selectedFormat
          );

        /*
         * =================================================
         * VERIFY ENCODED DATA
         * =================================================
         */

        if (
          !verifyBufferFormat(
            convertedBuffer,
            selectedFormat
          )
        ) {
          throw new Error(
            `Conversion produced invalid ${selectedFormat} data for ${displayName}`
          );
        }

        console.log(
          "Encoded format:",
          selectedFormat
        );

        console.log(
          "Encoded size:",
          (
            convertedBuffer.length /
            1024
          ).toFixed(2),
          "KB"
        );

        /*
         * =================================================
         * COMPRESS SELECTED FORMAT
         * =================================================
         */

        const finalBuffer =
          await compressTargetFormat(
            convertedBuffer,
            selectedFormat
          );

        /*
         * =================================================
         * FINAL FORMAT VERIFICATION
         * =================================================
         */

        if (
          !verifyBufferFormat(
            finalBuffer,
            selectedFormat
          )
        ) {
          throw new Error(
            `Invalid final ${selectedFormat} data for ${displayName}`
          );
        }

        /*
         * =================================================
         * CREATE CORRECT EXTENSION
         * =================================================
         *
         * This is also important.
         *
         * We NEVER use the original extension here.
         *
         * If selectedFormat = png:
         *
         * image.png
         *
         * If selectedFormat = webp:
         *
         * image.webp
         */

        const filename =
          createFilename(
            displayName,
            selectedFormat
          );

        const uniqueFilename =
          getUniqueFilename(
            filename,
            usedNames
          );

        /*
         * =================================================
         * ADD FINAL BUFFER TO ZIP
         * =================================================
         */

        archive.append(
          finalBuffer,
          {
            name:
              uniqueFilename,
          }
        );

        console.log(
          `Added to ZIP: ${uniqueFilename} (${selectedFormat})`
        );
      }
    }

    /*
     * ===================================================
     * MAKE SURE FILES WERE ADDED
     * ===================================================
     */

    if (usedNames.size === 0) {
      throw new Error(
        "No valid files could be added to ZIP"
      );
    }

    /*
     * ===================================================
     * FINALIZE
     * ===================================================
     */

    const finalizePromise =
      new Promise<void>(
        (resolve, reject) => {

          archive.once(
            "end",
            resolve
          );

          archive.once(
            "error",
            reject
          );
        }
      );

    await archive.finalize();

    await Promise.race([
      finalizePromise,
      archiveError,
    ]);

    /*
     * ===================================================
     * ZIP BUFFER
     * ===================================================
     */

    const zipBuffer =
      Buffer.concat(chunks);

    if (!zipBuffer.length) {
      throw new Error(
        "Generated ZIP is empty"
      );
    }

    console.log(
      "========================================"
    );

    console.log(
      "ZIP CREATED"
    );

    console.log(
      "Files:",
      usedNames.size
    );

    console.log(
      "ZIP size:",
      (
        zipBuffer.length /
        1024
      ).toFixed(2),
      "KB"
    );

    /*
     * ===================================================
     * ZIP FILENAME
     * ===================================================
     */

    const zipFilename =
      quickFormat
        ? `all-images-${quickFormat}.zip`
        : "compressed-images.zip";

    /*
     * ===================================================
     * RESPONSE
     * ===================================================
     */

    return new NextResponse(
      new Uint8Array(
        zipBuffer
      ),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/zip",

          "Content-Disposition":
            `attachment; filename="${zipFilename}"`,

          "Content-Length":
            String(
              zipBuffer.length
            ),

          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          Pragma:
            "no-cache",
        },
      }
    );

  } catch (error: any) {

    console.error(
      "========================================"
    );

    console.error(
      "ZIP CREATION ERROR"
    );

    console.error(
      error
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "========================================"
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "ZIP creation failed",
      },
      {
        status: 500,
      }
    );
  }
}

