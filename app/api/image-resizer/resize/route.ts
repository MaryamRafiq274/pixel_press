import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  resizeImage,
  ResizeMethod,
  ResizeMode,
} from "@/lib/resizer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// Supported methods
// =====================================================

const SUPPORTED_METHODS = [
  "dimensions",
  "percentage",
  "aspect-ratio",
  "preset",
] as const;

// =====================================================
// Supported modes
// =====================================================

const SUPPORTED_MODES = [
  "fit",
  "fill",
  "crop",
  "stretch",
] as const;

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

      method,

      width,
      height,

      percentage,

      aspectRatio,

      presetWidth,
      presetHeight,

      mode,

      quality,
    } = body;

    // =================================================
    // Validate
    // =================================================

    if (
      !data ||
      typeof data !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image data is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !filename ||
      typeof filename !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Filename is required.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // Normalize
    // =================================================

    const selectedMethod =
      String(
        method || "dimensions"
      )
        .toLowerCase()
        .trim();

    const selectedMode =
      String(
        mode || "fit"
      )
        .toLowerCase()
        .trim();

    // =================================================
    // Validate method
    // =================================================

    if (
      !SUPPORTED_METHODS.includes(
        selectedMethod as ResizeMethod
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Unsupported resize method: ${selectedMethod}`,
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // Validate mode
    // =================================================

    if (
      !SUPPORTED_MODES.includes(
        selectedMode as ResizeMode
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Unsupported resize mode: ${selectedMode}`,
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // Decode
    // =================================================

    const inputBuffer =
      Buffer.from(
        data,
        "base64"
      );

    if (!inputBuffer.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid image data.",
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
      "IMAGE RESIZE API"
    );

    console.log(
      "Filename:",
      filename
    );

    console.log(
      "Method:",
      selectedMethod
    );

    console.log(
      "Mode:",
      selectedMode
    );

    // =================================================
    // Resize
    // =================================================

    const result =
      await resizeImage(
        inputBuffer,
        {
          method:
            selectedMethod as ResizeMethod,

          width:
            width
              ? Number(width)
              : undefined,

          height:
            height
              ? Number(height)
              : undefined,

          percentage:
            percentage
              ? Number(percentage)
              : undefined,

          aspectRatio:
            aspectRatio
              ? Number(aspectRatio)
              : undefined,

          presetWidth:
            presetWidth
              ? Number(presetWidth)
              : undefined,

          presetHeight:
            presetHeight
              ? Number(presetHeight)
              : undefined,

          mode:
            selectedMode as ResizeMode,

          quality:
            quality
              ? Number(quality)
              : 90,
        }
      );

    // =================================================
    // Filename
    // =================================================

    const outputFilename =
      filename.replace(
        /\.[^/.]+$/,
        ""
      ) +
      "-resized." +
      result.extension;

    // =================================================
    // Response
    // =================================================

    return NextResponse.json({
      success: true,

      filename:
        outputFilename,

      extension:
        result.extension,

      mime:
        result.mime,

      width:
        result.width,

      height:
        result.height,

      size:
        result.buffer.length,

      data:
        result.buffer.toString(
          "base64"
        ),
    });
  } catch (error: any) {
    console.error(
      "========================================"
    );

    console.error(
      "IMAGE RESIZE ERROR"
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
          "Image resize failed.",
      },
      {
        status: 500,
      }
    );
  }
}