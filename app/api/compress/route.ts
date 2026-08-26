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
          message: "No files uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const compressedFiles = [];

    for (const file of files) {
      const arrayBuffer =
        await file.arrayBuffer();

      const inputBuffer =
        Buffer.from(arrayBuffer);

      if (!inputBuffer.length) {
        continue;
      }

      let outputBuffer: Buffer;
      let extension = "";
      let mime = "";

      switch (file.type) {
        case "image/png": {
          console.log(
            "Using Sharp PNG:",
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
          mime = "image/png";

          break;
        }

        case "image/jpeg":
        case "image/jpg": {
          console.log(
            "Using Sharp JPEG:",
            file.name
          );

          outputBuffer =
            await sharp(inputBuffer)
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

        case "image/webp": {
          outputBuffer =
            await sharp(inputBuffer)
              .webp({
                quality: 80,
              })
              .toBuffer();

          extension = "webp";
          mime = "image/webp";

          break;
        }

        case "image/avif": {
          outputBuffer =
            await sharp(inputBuffer)
              .avif({
                quality: 45,
                effort: 9,
              })
              .toBuffer();

          extension = "avif";
          mime = "image/avif";

          break;
        }

        default: {
          return NextResponse.json(
            {
              success: false,
              message:
                `Unsupported image type: ${file.type}`,
            },
            {
              status: 400,
            }
          );
        }
      }

      // Never return a larger file
      if (
        outputBuffer.length >=
        inputBuffer.length
      ) {
        outputBuffer =
          inputBuffer;
      }

      const originalSize =
        inputBuffer.length;

      const compressedSize =
        outputBuffer.length;

      const saved =
        originalSize > 0
          ? (
              (
                (originalSize -
                  compressedSize) /
                originalSize
              ) *
              100
            ).toFixed(2)
          : "0";

      const compressedName =
        file.name.replace(
          /\.[^/.]+$/,
          ""
        ) +
        "." +
        extension;

      compressedFiles.push({
        originalName: file.name,
        compressedName,
        currentExtension: extension,
        mime,
        originalMime: file.type,
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

    return NextResponse.json({
      success: true,
      files: compressedFiles,
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