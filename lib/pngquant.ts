import { execa } from "execa";
import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

export async function compressPNG(
  buffer: Buffer
): Promise<Buffer> {
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty PNG buffer.");
  }

  const id = crypto.randomUUID();

  const inputPath = path.join(
    os.tmpdir(),
    `${id}.png`
  );

  const outputPath = path.join(
    os.tmpdir(),
    `${id}-compressed.png`
  );

  try {
    await fs.writeFile(
      inputPath,
      buffer
    );

    // Find the PNGQuant executable manually
    const pngquantVendorPath =
      path.join(
        process.cwd(),
        "node_modules",
        "pngquant-bin",
        "vendor"
      );

    const possiblePaths = [
      path.join(
        pngquantVendorPath,
        "pngquant"
      ),

      path.join(
        pngquantVendorPath,
        "pngquant.exe"
      ),
    ];

    let pngquantPath = "";

    for (
      const possiblePath of possiblePaths
    ) {
      try {
        await fs.access(
          possiblePath
        );

        pngquantPath =
          possiblePath;

        break;
      } catch {
        // Continue checking
      }
    }

    if (!pngquantPath) {
      throw new Error(
        `PNGQuant executable not found. Checked: ${possiblePaths.join(
          ", "
        )}`
      );
    }

    console.log(
      "Platform:",
      process.platform
    );

    console.log(
      "PNGQuant executable:",
      pngquantPath
    );

    await execa(
      pngquantPath,
      [
        "--quality=40-70",
        "--speed=1",
        "--strip",
        "--force",
        "--output",
        outputPath,
        inputPath,
      ]
    );

    const compressedBuffer =
      await fs.readFile(
        outputPath
      );

    if (
      compressedBuffer.length <
      buffer.length
    ) {
      return compressedBuffer;
    }

    return buffer;
  } catch (error: any) {
    console.error(
      "PNGQuant compression error:",
      error?.message
    );

    throw new Error(
      `PNGQuant compression failed: ${
        error?.message ||
        "Unknown error"
      }`
    );
  } finally {
    await fs
      .unlink(inputPath)
      .catch(() => {});

    await fs
      .unlink(outputPath)
      .catch(() => {});
  }
}