import { execa } from "execa";
import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

// Cached across warm invocations so we don't copy the binary on every request.
let cachedExecutablePath: string | null = null;

/**
 * Locates the pngquant binary shipped inside pngquant-bin's vendor folder,
 * copies it into /tmp (writable on Vercel/AWS Lambda, unlike node_modules
 * which is mounted read-only), and marks it executable there.
 *
 * This copy-to-tmp step is the part that makes this work on live serverless
 * deployments — running the binary directly out of node_modules often fails
 * on Vercel even when outputFileTracingIncludes ships it, because either the
 * filesystem is read-only (chmod fails) or the executable bit didn't survive
 * the trace/zip step.
 */
async function getExecutablePath(): Promise<string> {
  if (cachedExecutablePath) {
    try {
      await fs.access(cachedExecutablePath, fs.constants.X_OK);
      return cachedExecutablePath;
    } catch {
      // cache is stale (e.g. /tmp got wiped) — fall through and redo it
      cachedExecutablePath = null;
    }
  }

  const vendorDir = path.join(
    process.cwd(),
    "node_modules",
    "pngquant-bin",
    "vendor"
  );

  const candidateNames =
    process.platform === "win32"
      ? ["pngquant.exe", "pngquant"]
      : ["pngquant", "pngquant.exe"];

  let sourcePath = "";

  for (const name of candidateNames) {
    const candidate = path.join(vendorDir, name);

    try {
      await fs.access(candidate);
      sourcePath = candidate;
      break;
    } catch {
      // try next candidate
    }
  }

  console.log("========================================");
  console.log("PNGQUANT DEBUG");
  console.log("Platform:", process.platform);
  console.log("Working directory:", process.cwd());
  console.log("Vendor directory:", vendorDir);
  console.log("Found source executable:", sourcePath || "NOT FOUND");
  console.log("========================================");

  if (!sourcePath) {
    throw new Error(
      `pngquant executable not found in vendor directory on ${process.platform}: ${vendorDir}`
    );
  }

  const runtimeDir = path.join(os.tmpdir(), "pngquant-bin-runtime");
  await fs.mkdir(runtimeDir, { recursive: true });

  const runtimePath = path.join(runtimeDir, path.basename(sourcePath));

  // Copy fresh each cold start (tmp is ephemeral / per-instance), then chmod.
  await fs.copyFile(sourcePath, runtimePath);
  await fs.chmod(runtimePath, 0o755);

  console.log("Copied pngquant to writable runtime path:", runtimePath);

  cachedExecutablePath = runtimePath;

  return runtimePath;
}

export async function compressPNG(buffer: Buffer): Promise<Buffer> {
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty PNG buffer.");
  }

  const id = crypto.randomUUID();

  const inputPath = path.join(os.tmpdir(), `${id}.png`);
  const outputPath = path.join(os.tmpdir(), `${id}-compressed.png`);

  try {
    await fs.writeFile(inputPath, buffer);

    const pngquantPath = await getExecutablePath();

    console.log("Running pngquant from:", pngquantPath);

    try {
      await execa(pngquantPath, [
        "--quality=40-70",
        "--speed=1",
        "--strip",
        "--force",
        "--output",
        outputPath,
        inputPath,
      ]);
    } catch (execError: any) {
      // pngquant exits with code 99 when it can't hit the requested quality
      // range without visible loss — that's not a real failure, it just
      // declines to write the output file. Fall back to the original.
      if (execError?.exitCode === 99) {
        console.log(
          "pngquant: quality target not reachable, keeping original PNG."
        );
        return buffer;
      }

      throw execError;
    }

    const compressedBuffer = await fs.readFile(outputPath);

    if (compressedBuffer.length < buffer.length) {
      return compressedBuffer;
    }

    return buffer;
  } catch (error: any) {
    console.error("PNGQuant compression error:", error?.message);

    throw new Error(
      `PNGQuant compression failed: ${error?.message || "Unknown error"}`
    );
  } finally {
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});
  }
}