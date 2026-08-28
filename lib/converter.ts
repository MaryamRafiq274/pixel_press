import sharp from "sharp";

import { compressPNG } from "@/lib/pngquant";
import { compressSVG } from "@/lib/svgo";

type ConvertFormat =
  | "png"
  | "jpg"
  | "jpeg"
  | "webp"
  | "avif"
  | "svg";

interface ConvertResult {
  buffer: Buffer;
  mime: string;
  extension: string;
}

// =====================================================
// Detect SVG from the actual file buffer
// =====================================================
//
// We do not rely on:
//     metadata.format === "svg"
//
// Instead we inspect the SVG contents directly.
//
// This allows:
//
// SVG
//   ↓
// SVGO
//
// to work reliably.
//
// =====================================================

function isSVGBuffer(
  buffer: Buffer
): boolean {
  const header =
    buffer
      .subarray(
        0,
        Math.min(
          buffer.length,
          8192
        )
      )
      .toString("utf8")
      .trim()
      .toLowerCase();

  return (
    header.startsWith("<svg") ||
    (
      header.startsWith("<?xml") &&
      header.includes("<svg")
    )
  );
}

// =====================================================
// Optimize existing SVG
//
// SVG
//  ↓
// SVGO
//  ↓
// Optimized SVG
// =====================================================

async function optimizeExistingSVG(
  buffer: Buffer
): Promise<Buffer> {
  console.log(
    "SVG → SVGO"
  );

  const optimizedSVG =
    await compressSVG(
      buffer
    );

  console.log(
    "After SVGO:",
    (
      optimizedSVG.length /
      1024
    ).toFixed(2),
    "KB"
  );

  return optimizedSVG;
}

// =====================================================
// Create Sharp image
//
// For SVG input:
//
// SVG
//  ↓
// SVGO
//  ↓
// Sharp
//
// For raster input:
//
// Raster
//  ↓
// Sharp
//
// =====================================================

async function createSharpImage(
  buffer: Buffer,
  inputIsSVG: boolean
) {
  if (inputIsSVG) {
    console.log(
      "SVG input detected."
    );

    console.log(
      "SVG → SVGO → Sharp"
    );

    const optimizedSVG =
      await optimizeExistingSVG(
        buffer
      );

    return sharp(
      optimizedSVG,
      {
        failOn: "none",
        limitInputPixels: false,
      }
    );
  }

  console.log(
    "Raster input detected."
  );

  return sharp(
    buffer,
    {
      failOn: "none",
      limitInputPixels: false,
    }
  );
}

// =====================================================
// Raster → Embedded SVG
//
// IMPORTANT:
//
// This does NOT vectorize the image.
//
// Instead:
//
// JPG / PNG / WEBP / AVIF
//          ↓
//       Base64
//          ↓
//     SVG <image>
//          ↓
//        SVG
//
// This preserves the original raster image visually.
//
// =====================================================

function rasterToEmbeddedSVG(
  buffer: Buffer,
  mime: string,
  width: number,
  height: number
): Buffer {
  const base64 =
    buffer.toString(
      "base64"
    );

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
>
  <image
    x="0"
    y="0"
    width="${width}"
    height="${height}"
    preserveAspectRatio="none"
    href="data:${mime};base64,${base64}"
    xlink:href="data:${mime};base64,${base64}"
  />
</svg>`;

  return Buffer.from(
    svg,
    "utf8"
  );
}

// =====================================================
// Main conversion function
// =====================================================

export async function convertImage(
  buffer: Buffer,
  format: ConvertFormat
): Promise<ConvertResult> {
  const targetFormat =
    format.toLowerCase() as ConvertFormat;

  console.log(
    "========================================"
  );

  console.log(
    "Conversion requested:",
    targetFormat
  );

  console.log(
    "Input buffer:",
    (
      buffer.length /
      1024
    ).toFixed(2),
    "KB"
  );

  // ===================================================
  // Detect SVG input
  // ===================================================

  const inputIsSVG =
    isSVGBuffer(
      buffer
    );

  console.log(
    "Input is SVG:",
    inputIsSVG
  );

  // ===================================================
  // Get input image information
  // ===================================================

  const metadata =
    await sharp(
      buffer,
      {
        failOn: "none",
        limitInputPixels: false,
      }
    ).metadata();

  console.log(
    "Input image:",
    {
      format:
        metadata.format,

      width:
        metadata.width,

      height:
        metadata.height,

      channels:
        metadata.channels,

      hasAlpha:
        metadata.hasAlpha,
    }
  );

  // ===================================================
  // SVG
  //
  // EXISTING SVG:
  //
  // SVG
  //   ↓
  // SVGO
  //   ↓
  // Final SVG
  //
  //
  // RASTER:
  //
  // PNG/JPG/JPEG/WEBP/AVIF
  //   ↓
  // Embedded raster image
  //   ↓
  // SVG
  //
  // ===================================================

  if (
    targetFormat === "svg"
  ) {
    console.log(
      "Converting → SVG"
    );

    // =================================================
    // Existing SVG
    // =================================================

    if (inputIsSVG) {
      console.log(
        "Input is already SVG."
      );

      console.log(
        "SVG → SVGO → SVG"
      );

      const optimizedSVG =
        await optimizeExistingSVG(
          buffer
        );

      console.log(
        "Final optimized SVG:",
        (
          optimizedSVG.length /
          1024
        ).toFixed(2),
        "KB"
      );

      return {
        buffer:
          optimizedSVG,

        mime:
          "image/svg+xml",

        extension:
          "svg",
      };
    }

    // =================================================
    // Raster → Embedded SVG
    //
    // IMPORTANT:
    //
    // We intentionally do NOT use VTracer here.
    //
    // VTracer converts the raster image into vector
    // paths. This can significantly change photographs,
    // screenshots, gradients and detailed images.
    //
    // Instead we embed the original raster image
    // inside an SVG.
    //
    // This keeps the visual appearance intact.
    // =================================================

    console.log(
      "Input is raster."
    );

    console.log(
      "Raster → Embedded SVG"
    );

    const width =
      metadata.width ||
      1;

    const height =
      metadata.height ||
      1;

    // =================================================
    // Determine original MIME type
    // =================================================

    let inputMime = "image/png";

const inputFormat =
  String(metadata.format || "").toLowerCase();

switch (inputFormat) {
  case "jpeg":
  case "jpg":
    inputMime = "image/jpeg";
    break;

  case "png":
    inputMime = "image/png";
    break;

  case "webp":
    inputMime = "image/webp";
    break;

  case "avif":
    inputMime = "image/avif";
    break;

  case "svg":
    inputMime = "image/svg+xml";
    break;

  default:
    inputMime = "image/png";
    break;
}
    console.log(
      "Embedded MIME:",
      inputMime
    );

    console.log(
      "SVG dimensions:",
      `${width} x ${height}`
    );

    // =================================================
    // Create SVG
    // =================================================

    const embeddedSVG =
      rasterToEmbeddedSVG(
        buffer,
        inputMime,
        width,
        height
      );

    console.log(
      "Final embedded SVG:",
      (
        embeddedSVG.length /
        1024
      ).toFixed(2),
      "KB"
    );

    return {
      buffer:
        embeddedSVG,

      mime:
        "image/svg+xml",

      extension:
        "svg",
    };
  }

  // ===================================================
  // For all raster output formats
  //
  // Raster input:
  //
  // Raster → Sharp → Target
  //
  // SVG input:
  //
  // SVG → SVGO → Sharp → Target
  //
  // ===================================================

  let image =
    await createSharpImage(
      buffer,
      inputIsSVG
    );

  // ===================================================
  // PNG
  //
  // SVG:
  //
  // SVG
  // ↓
  // SVGO
  // ↓
  // Sharp → PNG
  // ↓
  // pngquant
  // ↓
  // Final PNG
  //
  // Raster:
  //
  // Raster
  // ↓
  // Sharp → PNG
  // ↓
  // pngquant
  // ↓
  // Final PNG
  //
  // ===================================================

  if (
    targetFormat === "png"
  ) {
    console.log(
      "Converting → PNG"
    );

    const convertedPNG =
      await image
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true,
        })
        .toBuffer();

    console.log(
      "After Sharp PNG:",
      (
        convertedPNG.length /
        1024
      ).toFixed(2),
      "KB"
    );

    const optimizedPNG =
      await compressPNG(
        convertedPNG
      );

    console.log(
      "After pngquant:",
      (
        optimizedPNG.length /
        1024
      ).toFixed(2),
      "KB"
    );

    const finalPNG =
      optimizedPNG.length <
      convertedPNG.length
        ? optimizedPNG
        : convertedPNG;

    return {
      buffer:
        finalPNG,

      mime:
        "image/png",

      extension:
        "png",
    };
  }

  // ===================================================
  // JPG / JPEG
  //
  // SVG:
  //
  // SVG
  // ↓
  // SVGO
  // ↓
  // Sharp
  // ↓
  // JPEG (mozjpeg)
  //
  // ===================================================

  if (
    targetFormat === "jpg" ||
    targetFormat === "jpeg"
  ) {
    console.log(
      "Converting → JPG"
    );

    // =================================================
    // JPEG does not support transparency.
    //
    // Transparent SVG areas are therefore placed
    // over a white background.
    // =================================================

    const convertedJPEG =
      await image
        .rotate()
        .flatten({
          background:
            "#ffffff",
        })
        .jpeg({
          quality: 65,
          mozjpeg: true,
          chromaSubsampling:
            "4:2:0",
        })
        .toBuffer();

    console.log(
      "Final JPEG (Sharp/mozjpeg):",
      (
        convertedJPEG.length /
        1024
      ).toFixed(2),
      "KB"
    );

    return {
      buffer:
        convertedJPEG,

      mime:
        "image/jpeg",

      extension:
        "jpg",
    };
  }

  // ===================================================
  // WEBP
  //
  // SVG:
  //
  // SVG
  // ↓
  // SVGO
  // ↓
  // Sharp
  // ↓
  // WEBP
  //
  // Raster:
  //
  // Raster
  // ↓
  // Sharp
  // ↓
  // WEBP
  //
  // ===================================================

  if (
    targetFormat === "webp"
  ) {
    console.log(
      "Converting → WEBP"
    );

    const inputMetadata =
      await sharp(
        buffer,
        {
          failOn: "none",
          limitInputPixels:
            false,
        }
      ).metadata();

    const width =
      inputMetadata.width ||
      1;

    const height =
      inputMetadata.height ||
      1;

    console.log(
      "WEBP input dimensions:",
      `${width} x ${height}`
    );

    // =================================================
    // WebP maximum dimension
    // is 16383px.
    // =================================================

    const WEBP_MAX =
      16383;

    // =================================================
    // Resize ONLY when required.
    // =================================================

    if (
      width > WEBP_MAX ||
      height > WEBP_MAX
    ) {
      console.log(
        "Image is too large for WebP."
      );

      console.log(
        `Resizing to maximum ${WEBP_MAX}px`
      );

      image =
        image.resize({
          width:
            WEBP_MAX,

          height:
            WEBP_MAX,

          fit:
            "inside",

          withoutEnlargement:
            true,

          kernel:
            "lanczos3",
        });
    }

    const convertedWEBP =
      await image
        .webp({
          quality: 80,
          effort: 6,
          smartSubsample: true,
        })
        .toBuffer();

    console.log(
      "Final WEBP:",
      (
        convertedWEBP.length /
        1024
      ).toFixed(2),
      "KB"
    );

    const finalMetadata =
      await sharp(
        convertedWEBP
      ).metadata();

    console.log(
      "WEBP final dimensions:",
      `${finalMetadata.width} x ${finalMetadata.height}`
    );

    return {
      buffer:
        convertedWEBP,

      mime:
        "image/webp",

      extension:
        "webp",
    };
  }

  // ===================================================
  // AVIF
  //
  // SVG:
  //
  // SVG
  // ↓
  // SVGO
  // ↓
  // Sharp
  // ↓
  // AVIF
  //
  // Raster:
  //
  // Raster
  // ↓
  // Sharp
  // ↓
  // AVIF
  //
  // ===================================================

  if (
    targetFormat === "avif"
  ) {
    console.log(
      "Converting → AVIF"
    );

    const inputMetadata =
      await sharp(
        buffer,
        {
          failOn: "none",
          limitInputPixels:
            false,
        }
      ).metadata();

    const width =
      inputMetadata.width ||
      1;

    const height =
      inputMetadata.height ||
      1;

    console.log(
      "AVIF input dimensions:",
      `${width} x ${height}`
    );

    // =================================================
    // Maximum dimension supported safely.
    // =================================================

    const AVIF_MAX =
      16384;

    // =================================================
    // Resize only if required
    // =================================================

    if (
      width > AVIF_MAX ||
      height > AVIF_MAX
    ) {
      console.log(
        "Image too large for AVIF."
      );

      image =
        image.resize({
          width:
            AVIF_MAX,

          height:
            AVIF_MAX,

          fit:
            "inside",

          withoutEnlargement:
            true,

          kernel:
            "lanczos3",
        });

      console.log(
        "Image resized for AVIF."
      );
    }

    // =================================================
    // AVIF encoding
    // =================================================

    const convertedAVIF =
      await image
        .avif({
          quality: 50,

          // Lower effort =
          // faster encoding.
          effort: 2,
        })
        .toBuffer();

    console.log(
      "Final AVIF:",
      (
        convertedAVIF.length /
        1024
      ).toFixed(2),
      "KB"
    );

    const finalMetadata =
      await sharp(
        convertedAVIF
      ).metadata();

    console.log(
      "AVIF final dimensions:",
      `${finalMetadata.width} x ${finalMetadata.height}`
    );

    return {
      buffer:
        convertedAVIF,

      mime:
        "image/avif",

      extension:
        "avif",
    };
  }

  // ===================================================
  // Unsupported format
  // ===================================================

  throw new Error(
    `Unsupported output format: ${format}`
  );
}