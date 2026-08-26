import {
  NextRequest,
  NextResponse,
} from "next/server";

import sharp from "sharp";

import { compressPNG } from "@/lib/pngquant";
//import { optimizeJPEG } from "@/lib/jpegoptim";
import { compressSVG } from "@/lib/svgo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// POST
// =====================================================

export async function POST(
  req: NextRequest
) {
  try {
    const formData =
      await req.formData();

    const files =
      formData.getAll("files") as File[];

    // ===================================================
    // Validate files
    // ===================================================

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

    const compressedFiles = [];

    // ===================================================
    // Process every uploaded file
    // ===================================================

    for (const file of files) {
      // =================================================
      // Read ORIGINAL uploaded file
      // =================================================

      const arrayBuffer =
        await file.arrayBuffer();

      const inputBuffer =
        Buffer.from(
          arrayBuffer
        );

      if (!inputBuffer.length) {
        console.log(
          "Skipping empty file:",
          file.name
        );

        continue;
      }

      // =================================================
      // IMPORTANT
      //
      // Keep the untouched original.
      //
      // This is useful if the user later selects
      // another conversion format.
      //
      // Example:
      //
      // PNG → SVG
      // JPG → SVG
      // WEBP → SVG
      // AVIF → SVG
      //
      // =================================================

      const originalData =
        inputBuffer.toString(
          "base64"
        );

      let outputBuffer: Buffer;

      let extension = "";

      let mime = "";

      // =================================================
      // Compress according to ORIGINAL format
      // =================================================

      switch (file.type) {
        // ===============================================
        // SVG → SVGO
        // ===============================================

        case "image/svg+xml": {
          console.log(
            "Using SVGO for:",
            file.name
          );

          outputBuffer =
            await compressSVG(
              inputBuffer
            );

          extension =
            "svg";

          mime =
            "image/svg+xml";

          break;
        }

        // ===============================================
        // PNG → PNGQuant
        // ===============================================

        case "image/png": {
          console.log(
            "Using pngquant for:",
            file.name
          );

          outputBuffer =
            await compressPNG(
              inputBuffer
            );

          extension =
            "png";

          mime =
            "image/png";

          break;
        }

        // ===============================================
        // WEBP → Sharp
        // ===============================================

        case "image/webp": {
          console.log(
            "Using Sharp WebP for:",
            file.name
          );

          outputBuffer =
            await sharp(
              inputBuffer
            )
              .webp({
                quality: 80,
              })
              .toBuffer();

          extension =
            "webp";

          mime =
            "image/webp";

          break;
        }

        // ===============================================
        // AVIF → Sharp
        // ===============================================

        case "image/avif": {
          console.log(
            "Using Sharp AVIF for:",
            file.name
          );

          outputBuffer =
            await sharp(
              inputBuffer
            )
              .avif({
                quality: 45,
                effort: 9,
              })
              .toBuffer();

          extension =
            "avif";

          mime =
            "image/avif";

          break;
        }

        // ===============================================
        // JPG / JPEG
        //
        // Sharp MozJPEG
        //       ↓
        // JPEGoptim
        // ===============================================

        case "image/jpeg":
        case "image/jpg": {

          console.log(
            "Using Sharp MozJPEG for:",
            file.name
          );

          outputBuffer = await sharp(inputBuffer)
            .rotate()
            .jpeg({
              quality: 65,
              mozjpeg: true,
              chromaSubsampling: "4:2:0",
            })
            .toBuffer();

          extension = "jpg";
          mime = "image/jpeg";

          break;
        }

        // ===============================================
        // Unsupported file type
        // ===============================================

        default: {
          console.log(
            "Unsupported image MIME type:",
            file.type,
            file.name
          );

          return NextResponse.json(
            {
              success: false,
              message:
                `Unsupported image type: ${file.type || "unknown"}`,
              file:
                file.name,
            },
            {
              status: 400,
            }
          );
        }
      }

      // =================================================
      // Never return a compressed file larger than
      // the original.
      //
      // IMPORTANT:
      //
      // If compression makes the file larger, keep the
      // original file as the current downloadable file.
      //
      // originalData is ALWAYS preserved separately.
      // =================================================

      if (
        outputBuffer.length >=
        inputBuffer.length
      ) {
        console.log(
          "Compression increased size. Keeping original:",
          file.name
        );

        outputBuffer =
          inputBuffer;

        // Keep the original extension.
        const originalExtension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase();

        // Normalize JPEG → JPG
        if (
          file.type ===
          "image/jpeg" ||
          file.type ===
          "image/jpg"
        ) {
          extension =
            "jpg";

          mime =
            "image/jpeg";
        } else {
          extension =
            originalExtension ||
            extension;

          mime =
            file.type ||
            mime;
        }
      }

      // =================================================
      // Calculate sizes
      // =================================================

      const originalSize =
        inputBuffer.length;

      const compressedSize =
        outputBuffer.length;

      const saved = (
        (
          (
            originalSize -
            compressedSize
          ) /
          originalSize
        ) *
        100
      ).toFixed(2);

      // =================================================
      // Determine whether this is a raster image
      //
      // Raster images can be converted to SVG through:
      //
      // VTracer → SVGO
      //
      // =================================================

      const isRaster =
        file.type ===
        "image/png" ||
        file.type ===
        "image/jpeg" ||
        file.type ===
        "image/jpg" ||
        file.type ===
        "image/webp" ||
        file.type ===
        "image/avif";

      const isSVG =
        file.type ===
        "image/svg+xml";

      // =================================================
      // Available conversion formats
      //
      // This information is returned to the frontend.
      //
      // Raster:
      //
      // JPG
      // PNG
      // WEBP
      // AVIF
      // SVG
      //
      // SVG:
      //
      // JPG
      // PNG
      // WEBP
      // AVIF
      // SVG
      //
      // =================================================

      const availableFormats =
        isRaster
          ? [
            "jpg",
            "png",
            "webp",
            "avif",
            "svg",
          ]
          : isSVG
            ? [
              "jpg",
              "png",
              "webp",
              "avif",
              "svg",
            ]
            : [
              extension,
            ];

      // =================================================
      // Logging
      // =================================================

      console.log({
        file:
          file.name,

        originalKB:
          (
            originalSize /
            1024
          ).toFixed(2),

        compressedKB:
          (
            compressedSize /
            1024
          ).toFixed(2),

        saved:
          saved + "%",

        output:
          extension,

        availableFormats,
      });

      // =================================================
      // Filename
      // =================================================

      const compressedName =
        file.name.replace(
          /\.[^/.]+$/,
          ""
        ) +
        "." +
        extension;

      // =================================================
      // Return:
      //
      // data
      //       → compressed current file
      //
      // originalData
      //       → untouched uploaded file
      //
      // currentExtension
      //       → current compressed format
      //
      // availableFormats
      //       → formats frontend can show
      //
      // =================================================

      compressedFiles.push({
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

        // ===============================================
        // Current compressed file
        // ===============================================

        data:
          outputBuffer.toString(
            "base64"
          ),

        // ===============================================
        // Completely untouched original file
        //
        // Kept for future conversions.
        // ===============================================

        originalData,

        // ===============================================
        // Available output formats
        // ===============================================

        availableFormats,
      });
    }

    // ===================================================
    // No valid files
    // ===================================================

    if (
      compressedFiles.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No valid image files were processed.",
        },
        {
          status: 400,
        }
      );
    }

    // ===================================================
    // Response
    // ===================================================

    return NextResponse.json({
      success: true,

      files:
        compressedFiles,
    });
  } catch (
  error: any
  ) {
    console.error(
      "========================================"
    );

    console.error(
      "COMPRESSION ERROR"
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
          "Compression failed",
      },
      {
        status: 500,
      }
    );
  }
}

