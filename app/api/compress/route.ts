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

      // Test Sharp only
      const outputBuffer =
        await sharp(inputBuffer)
          .rotate()
          .jpeg({
            quality: 65,
            mozjpeg: true,
          })
          .toBuffer();

      processedFiles.push({
        originalName:
          file.name,

        compressedName:
          file.name,

        currentExtension:
          "jpg",

        mime:
          "image/jpeg",

        originalMime:
          file.type,

        originalSize:
          inputBuffer.length,

        compressedSize:
          outputBuffer.length,

        saved:
          "0",

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

    return NextResponse.json({
      success: true,
      files:
        processedFiles,
    });
  } catch (error: any) {
    console.error(
      "SHARP TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Sharp test failed",
      },
      {
        status: 500,
      }
    );
  }
}