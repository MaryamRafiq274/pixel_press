import {
  NextRequest,
  NextResponse,
} from "next/server";

import archiver from "archiver";

export const runtime = "nodejs";

export const dynamic =
  "force-dynamic";

// =====================================================
// TYPES
// =====================================================

type ZipFile = {
  filename: string;
  data: string;
  mime?: string;
};

// =====================================================
// POST
// =====================================================

export async function POST(
  req: NextRequest
) {
  try {
    const body =
      await req.json();

    const files =
      body?.files as ZipFile[];

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !Array.isArray(files) ||
      files.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No files provided for ZIP download.",
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
      "IMAGE RESIZER ZIP"
    );

    console.log(
      "Files:",
      files.length
    );

    console.log(
      "========================================"
    );

    // =================================================
    // CREATE ARCHIVE
    // =================================================

    const archive =
      archiver("zip", {
        zlib: {
          level: 9,
        },
      });

    const chunks: Buffer[] = [];

    archive.on(
      "data",
      (chunk: Buffer) => {
        chunks.push(chunk);
      }
    );

    // =================================================
    // APPEND FILES
    // =================================================

    for (
      const file of files
    ) {
      if (
        !file ||
        typeof file.filename !==
          "string" ||
        typeof file.data !==
          "string"
      ) {
        continue;
      }

      const buffer =
        Buffer.from(
          file.data,
          "base64"
        );

      if (!buffer.length) {
        continue;
      }

      archive.append(
        buffer,
        {
          name:
            file.filename,
        }
      );
    }

    // =================================================
    // FINALIZE
    // =================================================

    await archive.finalize();

    const zipBuffer =
      Buffer.concat(chunks);

    if (!zipBuffer.length) {
      throw new Error(
        "ZIP archive was created but contains no data."
      );
    }

    console.log(
      "ZIP created:",
      (
        zipBuffer.length /
        1024
      ).toFixed(2),
      "KB"
    );

    // =================================================
    // RESPONSE
    // =================================================

    return new NextResponse(
      zipBuffer,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/zip",

          "Content-Disposition":
            'attachment; filename="resized-images.zip"',

          "Content-Length":
            String(
              zipBuffer.length
            ),

          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (
    error: any
  ) {
    console.error(
      "========================================"
    );

    console.error(
      "IMAGE RESIZER ZIP ERROR"
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
          "ZIP download failed.",
      },
      {
        status: 500,
      }
    );
  }
}