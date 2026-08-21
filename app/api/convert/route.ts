import {
  NextRequest,
  NextResponse,
} from "next/server";

import { convertImage } from "@/lib/converter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// Supported formats
// =====================================================

const SUPPORTED_FORMATS = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "avif",
  "svg",
] as const;

type SupportedFormat =
  (typeof SUPPORTED_FORMATS)[number];

// =====================================================
// MIME helper
// =====================================================

function getMimeType(
  format: string
): string {
  switch (format) {
    case "png":
      return "image/png";

    case "jpg":
    case "jpeg":
      return "image/jpeg";

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

// =====================================================
// POST
// =====================================================

export async function POST(
  req: NextRequest
) {
  try {
    const body =
      await req.json();

    const {
      data,
      filename,
      format,
      currentExtension,
      originalMime,
    } = body;

    // ===================================================
    // Validate request
    // ===================================================

    if (
      !data ||
      !filename ||
      !format ||
      !currentExtension
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required conversion fields",
        },
        {
          status: 400,
        }
      );
    }

    // ===================================================
    // Normalize formats
    // ===================================================

    const selectedFormat =
      String(format)
        .toLowerCase()
        .trim();

    const currentFormat =
      String(currentExtension)
        .toLowerCase()
        .trim();

    console.log(
      "========================================"
    );

    console.log(
      "Conversion API"
    );

    console.log(
      "Filename:",
      filename
    );

    console.log(
      "Current format:",
      currentFormat
    );

    console.log(
      "Selected format:",
      selectedFormat
    );

    console.log(
      "Original MIME:",
      originalMime
    );

    // ===================================================
    // Validate selected format
    // ===================================================

    if (
      !SUPPORTED_FORMATS.includes(
        selectedFormat as SupportedFormat
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Unsupported format: ${selectedFormat}`,
        },
        {
          status: 400,
        }
      );
    }

    // ===================================================
    // SAME FORMAT
    //
    // IMPORTANT:
    //
    // The image has already been compressed by
    // /api/compress.
    //
    // Do NOT call convertImage().
    //
    // Return the already-compressed image.
    //
    // ===================================================

    const sameFormat =
      currentFormat ===
        selectedFormat ||
      (
        currentFormat === "jpeg" &&
        selectedFormat === "jpg"
      ) ||
      (
        currentFormat === "jpg" &&
        selectedFormat === "jpeg"
      );

    if (sameFormat) {
      console.log(
        "Same format detected."
      );

      console.log(
        "Returning existing compressed file."
      );

      const existingBuffer =
        Buffer.from(
          data,
          "base64"
        );

      const mime =
        getMimeType(
          currentFormat
        );

      // =================================================
      // Normalize extension
      //
      // jpeg → jpg
      //
      // This keeps downloaded filenames consistent.
      // =================================================

      const outputExtension =
        currentFormat === "jpeg"
          ? "jpg"
          : currentFormat;

      const outputFilename =
        filename.replace(
          /\.[^/.]+$/,
          ""
        ) +
        "." +
        outputExtension;

      return NextResponse.json({
        success: true,

        filename:
          outputFilename,

        extension:
          outputExtension,

        mime,

        size:
          existingBuffer.length,

        data,
      });
    }

    // ===================================================
    // Decode already-compressed image
    //
    // IMPORTANT:
    //
    // /api/compress has already processed the image.
    //
    // Example:
    //
    // Original PNG
    //      ↓
    // pngquant
    //      ↓
    // Compressed PNG
    //      ↓
    // HERE
    //      ↓
    // convertImage()
    //      ↓
    // Target format
    //
    // ===================================================

    const inputBuffer =
      Buffer.from(
        data,
        "base64"
      );

    if (
      !inputBuffer.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or empty image data.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "Input to converter:",
      (
        inputBuffer.length /
        1024
      ).toFixed(2),
      "KB"
    );

    // ===================================================
    // Conversion
    // ===================================================

    console.log(
      "Starting conversion:",
      `${currentFormat} → ${selectedFormat}`
    );

    const result =
      await convertImage(
        inputBuffer,
        selectedFormat as SupportedFormat
      );

    console.log(
      "Conversion successful:",
      {
        format:
          selectedFormat,

        size:
          (
            result.buffer.length /
            1024
          ).toFixed(2) +
          " KB",

        extension:
          result.extension,
      }
    );

    // ===================================================
    // Filename
    // ===================================================

    const outputFilename =
      filename.replace(
        /\.[^/.]+$/,
        ""
      ) +
      "." +
      result.extension;

    // ===================================================
    // Response
    // ===================================================

    return NextResponse.json({
      success: true,

      filename:
        outputFilename,

      extension:
        result.extension,

      mime:
        result.mime,

      size:
        result.buffer.length,

      data:
        result.buffer.toString(
          "base64"
        ),
    });
  } catch (
    error: any
  ) {
    console.error(
      "========================================"
    );

    console.error(
      "IMAGE CONVERSION ERROR"
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
          "Image conversion failed",
      },
      {
        status: 500,
      }
    );
  }
}

