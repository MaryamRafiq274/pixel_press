import {
  NextRequest,
  NextResponse,
} from "next/server";

import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
) {
  try {
    const formData =
      await req.formData();

    const files =
      formData.getAll(
        "files"
      ) as File[];

    if (!files.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No files uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const processedFiles = [];

    for (const file of files) {
      const arrayBuffer =
        await file.arrayBuffer();

      const inputBuffer =
        Buffer.from(
          arrayBuffer
        );

      if (!inputBuffer.length) {
        continue;
      }

      let outputBuffer: Buffer;
      let extension: string;
      let mime: string;

      // ============================================
      // PNG
      // ============================================

      if (
        file.type ===
        "image/png"
      ) {
        console.log(
          "Compressing PNG:",
          file.name
        );

        outputBuffer =
          await sharp(inputBuffer)
            .png({
              compressionLevel: 9,
              adaptiveFiltering: true,
            })
            .toBuffer();

        extension = "png";

        mime =
          "image/png";
      }

      // ============================================
      // JPG / JPEG
      // ============================================

      else if (
        file.type ===
          "image/jpeg" ||
        file.type ===
          "image/jpg"
      ) {
        console.log(
          "Compressing JPG:",
          file.name
        );

        outputBuffer =
          await sharp(inputBuffer)
            .rotate()
            .jpeg({
              quality: 65,
              mozjpeg: true,
              chromaSubsampling:
                "4:2:0",
            })
            .toBuffer();

        extension = "jpg";

        mime =
          "image/jpeg";
      }

      // ============================================
      // WEBP
      // ============================================

      else if (
        file.type ===
        "image/webp"
      ) {
        console.log(
          "Compressing WEBP:",
          file.name
        );

        outputBuffer =
          await sharp(inputBuffer)
            .webp({
              quality: 75,
              effort: 6,
            })
            .toBuffer();

        extension = "webp";

        mime =
          "image/webp";
      }

      // ============================================
      // AVIF
      // ============================================

      else if (
        file.type ===
        "image/avif"
      ) {
        console.log(
          "Compressing AVIF:",
          file.name
        );

        outputBuffer =
          await sharp(inputBuffer)
            .avif({
              quality: 45,
              effort: 9,
            })
            .toBuffer();

        extension = "avif";

        mime =
          "image/avif";
      }

      // ============================================
      // SVG
      // ============================================

      else if (
        file.type ===
        "image/svg+xml"
      ) {
        console.log(
          "SVG received:",
          file.name
        );

        // Keep original for now.
        // SVG optimization should use SVGO.

        outputBuffer =
          inputBuffer;

        extension = "svg";

        mime =
          "image/svg+xml";
      }

      // ============================================
      // Unsupported
      // ============================================

      else {
        return NextResponse.json(
          {
            success: false,
            message:
              `Unsupported image type: ${
                file.type ||
                "unknown"
              }`,
          },
          {
            status: 400,
          }
        );
      }

      // ============================================
      // Never return a larger file
      // ============================================

      if (
        outputBuffer.length >=
        inputBuffer.length
      ) {
        console.log(
          "Compressed file is larger. Keeping original:",
          file.name
        );

        outputBuffer =
          inputBuffer;
      }

      // ============================================
      // Calculate sizes
      // ============================================

      const originalSize =
        inputBuffer.length;

      const compressedSize =
        outputBuffer.length;

      const saved =
        originalSize > 0
          ? (
              (
                (
                  originalSize -
                  compressedSize
                ) /
                originalSize
              ) *
              100
            ).toFixed(2)
          : "0";

      // ============================================
      // Filename
      // ============================================

      const compressedName =
        file.name.replace(
          /\.[^/.]+$/,
          ""
        ) +
        "." +
        extension;

      // ============================================
      // Response object
      // ============================================

      processedFiles.push({
        originalName:
          file.name,

        compressedName,

        currentExtension:
          extension,

        mime,

        originalMime:
          file.type,

        originalSize,

        compressedSize,

        saved,

        data:
          outputBuffer.toString(
            "base64"
          ),

        originalData:
          inputBuffer.toString(
            "base64"
          ),

        availableFormats: [
          "jpg",
          "png",
          "webp",
          "avif",
          "svg",
        ],
      });
    }

    if (
      processedFiles.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No valid files processed",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,

      files:
        processedFiles,
    });

  } catch (error: any) {
    console.error(
      "COMPRESSION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Compression failed",
      },
      {
        status: 500,
      }
    );
  }
}