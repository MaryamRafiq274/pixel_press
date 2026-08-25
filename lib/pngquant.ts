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
    // =====================================================
    // Write temporary PNG
    // =====================================================

    await fs.writeFile(
      inputPath,
      buffer
    );

    console.log(
      "PNG input:",
      (buffer.length / 1024).toFixed(2),
      "KB"
    );

    // =====================================================
    // Determine PNGQuant binary
    // =====================================================

    const pngquantVendorPath =
      path.join(
        process.cwd(),
        "node_modules",
        "pngquant-bin",
        "vendor"
      );

    let pngquantPath: string;

    if (process.platform === "win32") {
      pngquantPath = path.join(
        pngquantVendorPath,
        "pngquant"
      );
    } else if (
      process.platform === "linux"
    ) {
      pngquantPath = path.join(
        pngquantVendorPath,
        "pngquant"
      );
    } else if (
      process.platform === "darwin"
    ) {
      pngquantPath = path.join(
        pngquantVendorPath,
        "pngquant"
      );
    } else {
      throw new Error(
        `Unsupported operating system: ${process.platform}`
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

    // =====================================================
    // Verify executable exists
    // =====================================================

    const exists =
      await fs
        .access(pngquantPath)
        .then(() => true)
        .catch(() => false);

    if (!exists) {
      throw new Error(
        `PNGQuant executable not found: ${pngquantPath}`
      );
    }

    // =====================================================
    // Run PNGQuant
    // =====================================================

    const result = await execa(
      pngquantPath,
      [
        "--quality=40-70",
        "--speed=1",
        "--strip",
        "--force",
        "--output",
        outputPath,
        inputPath,
      ],
      {
        reject: true,
      }
    );

    console.log(
      "PNGQuant stdout:",
      result.stdout
    );

    console.log(
      "PNGQuant stderr:",
      result.stderr
    );

    // =====================================================
    // Check output
    // =====================================================

    const outputExists =
      await fs
        .access(outputPath)
        .then(() => true)
        .catch(() => false);

    if (!outputExists) {
      throw new Error(
        "PNGQuant did not create output file."
      );
    }

    // =====================================================
    // Read compressed PNG
    // =====================================================

    const compressedBuffer =
      await fs.readFile(
        outputPath
      );

    console.log(
      "PNGQuant output:",
      (
        compressedBuffer.length /
        1024
      ).toFixed(2),
      "KB"
    );

    // =====================================================
    // Keep smaller file
    // =====================================================

    if (
      compressedBuffer.length <
      buffer.length
    ) {
      console.log(
        "Using PNGQuant compressed PNG."
      );

      return compressedBuffer;
    }

    console.log(
      "PNGQuant did not reduce size. Using original."
    );

    return buffer;

  } catch (error: any) {

    console.error(
      "========================================"
    );

    console.error(
      "PNGQUANT ERROR"
    );

    console.error(
      "Platform:",
      process.platform
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

    throw new Error(
      `PNGQuant compression failed: ${
        error?.message ||
        "Unknown error"
      }`
    );

  } finally {

    // =====================================================
    // Cleanup
    // =====================================================

    await fs
      .unlink(inputPath)
      .catch(() => {});

    await fs
      .unlink(outputPath)
      .catch(() => {});
  }
}