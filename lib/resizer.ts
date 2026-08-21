import sharp from "sharp";

// =====================================================
// TYPES
// =====================================================

export type ResizeMode =
  | "fit"
  | "fill"
  | "crop"
  | "stretch";

export type ResizeMethod =
  | "dimensions"
  | "percentage"
  | "aspect-ratio"
  | "preset";

export interface ResizeOptions {
  method: ResizeMethod;

  width?: number;
  height?: number;

  percentage?: number;

  aspectRatio?: number;

  mode?: ResizeMode;

  quality?: number;

  presetWidth?: number;
  presetHeight?: number;
}

export interface ResizeResult {
  buffer: Buffer;
  mime: string;
  extension: string;
  width: number;
  height: number;
}

// =====================================================
// MIME
// =====================================================

function getMimeType(format?: string): string {
  switch (format?.toLowerCase()) {
    case "png":
      return "image/png";

    case "jpg":
    case "jpeg":
      return "image/jpeg";

    case "webp":
      return "image/webp";

    case "avif":
      return "image/avif";

    case "gif":
      return "image/gif";

    case "tiff":
    case "tif":
      return "image/tiff";

    case "heic":
      return "image/heic";

    default:
      return "application/octet-stream";
  }
}

// =====================================================
// EXTENSION
// =====================================================

function getExtension(format?: string): string {
  switch (format?.toLowerCase()) {
    case "jpeg":
      return "jpg";

    case "jpg":
      return "jpg";

    case "png":
      return "png";

    case "webp":
      return "webp";

    case "avif":
      return "avif";

    case "gif":
      return "gif";

    case "tiff":
    case "tif":
      return "tiff";

    default:
      return format || "png";
  }
}

// =====================================================
// CLAMP
// =====================================================

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    Math.max(value, min),
    max
  );
}

// =====================================================
// CALCULATE DIMENSIONS
// =====================================================

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  options: ResizeOptions
): {
  width: number;
  height: number;
} {
  // ===================================================
  // DIMENSIONS
  // ===================================================

  if (options.method === "dimensions") {
    let width =
      Number(options.width) ||
      originalWidth;

    let height =
      Number(options.height) ||
      originalHeight;

    // -----------------------------------------------
    // Width only + Fit
    // -----------------------------------------------

    if (
      options.mode === "fit" &&
      options.width &&
      !options.height
    ) {
      const ratio =
        originalHeight /
        originalWidth;

      height =
        Math.round(
          width * ratio
        );
    }

    // -----------------------------------------------
    // Height only + Fit
    // -----------------------------------------------

    if (
      options.mode === "fit" &&
      options.height &&
      !options.width
    ) {
      const ratio =
        originalWidth /
        originalHeight;

      width =
        Math.round(
          height * ratio
        );
    }

    return {
      width: Math.max(
        1,
        Math.round(width)
      ),

      height: Math.max(
        1,
        Math.round(height)
      ),
    };
  }

  // ===================================================
  // PERCENTAGE
  // ===================================================

  if (
    options.method === "percentage"
  ) {
    const percentage =
      clamp(
        Number(
          options.percentage
        ) || 100,
        1,
        1000
      );

    return {
      width: Math.max(
        1,
        Math.round(
          originalWidth *
          (percentage / 100)
        )
      ),

      height: Math.max(
        1,
        Math.round(
          originalHeight *
          (percentage / 100)
        )
      ),
    };
  }

  // ===================================================
  // ASPECT RATIO
  // ===================================================

  if (
    options.method ===
    "aspect-ratio"
  ) {
    const ratio =
      Number(
        options.aspectRatio
      );

    if (
      !ratio ||
      ratio <= 0
    ) {
      throw new Error(
        "Invalid aspect ratio."
      );
    }

    let width =
      Number(options.width) ||
      originalWidth;

    let height =
      Number(options.height) ||
      Math.round(
        width / ratio
      );

    // -----------------------------------------------
    // Height supplied only
    // -----------------------------------------------

    if (
      !options.width &&
      options.height
    ) {
      height =
        Number(options.height);

      width =
        Math.round(
          height * ratio
        );
    }

    return {
      width: Math.max(
        1,
        Math.round(width)
      ),

      height: Math.max(
        1,
        Math.round(height)
      ),
    };
  }

  // ===================================================
  // PRESET
  // ===================================================

  if (
    options.method === "preset"
  ) {
    const presetWidth =
      Number(
        options.presetWidth
      );

    const presetHeight =
      Number(
        options.presetHeight
      );

    console.log(
      "Preset width:",
      presetWidth
    );

    console.log(
      "Preset height:",
      presetHeight
    );

    if (
      !Number.isFinite(
        presetWidth
      ) ||
      !Number.isFinite(
        presetHeight
      ) ||
      presetWidth <= 0 ||
      presetHeight <= 0
    ) {
      throw new Error(
        "Invalid resize preset dimensions."
      );
    }

    return {
      width:
        Math.round(
          presetWidth
        ),

      height:
        Math.round(
          presetHeight
        ),
    };
  }

  throw new Error(
    `Unsupported resize method: ${options.method}`
  );
}

// =====================================================
// RESIZE IMAGE
// =====================================================

export async function resizeImage(
  buffer: Buffer,
  options: ResizeOptions
): Promise<ResizeResult> {
  // ===================================================
  // VALIDATION
  // ===================================================

  if (
    !Buffer.isBuffer(buffer)
  ) {
    throw new Error(
      "Invalid image buffer."
    );
  }

  if (
    !buffer.length
  ) {
    throw new Error(
      "Image buffer is empty."
    );
  }

  // ===================================================
  // METADATA
  // ===================================================

  const metadata =
    await sharp(
      buffer,
      {
        failOn: "none",
        limitInputPixels:
          false,
      }
    ).metadata();

  const originalWidth =
    metadata.width || 1;

  const originalHeight =
    metadata.height || 1;

const inputFormat =
  String(metadata.format || "png").toLowerCase();

  console.log(
    "========================================"
  );

  console.log(
    "IMAGE RESIZER"
  );

  console.log(
    "Original:",
    `${originalWidth} x ${originalHeight}`
  );

  console.log(
    "Format:",
    inputFormat
  );

  console.log(
    "Method:",
    options.method
  );

  console.log(
    "Mode:",
    options.mode
  );

  // ===================================================
  // CALCULATE TARGET DIMENSIONS
  // ===================================================

  const dimensions =
    calculateDimensions(
      originalWidth,
      originalHeight,
      options
    );

  const targetWidth =
    dimensions.width;

  const targetHeight =
    dimensions.height;

  console.log(
    "Target:",
    `${targetWidth} x ${targetHeight}`
  );

  // ===================================================
  // IMPORTANT PRESET LOGGING
  // ===================================================

  if (
    options.method ===
    "preset"
  ) {
    console.log(
      "PRESET RESIZE"
    );

    console.log(
      "Preset dimensions:",
      `${targetWidth} x ${targetHeight}`
    );
  }

  // ===================================================
  // MODE
  // ===================================================

  const requestedMode =
    options.mode || "fit";

  // ===================================================
  // SHARP
  // ===================================================

  let image =
    sharp(
      buffer,
      {
        failOn: "none",
        limitInputPixels:
          false,
      }
    );

  // ===================================================
  // FIT
  //
  // IMPORTANT:
  //
  // "inside" prevents any background/canvas.
  //
  // The image maintains its aspect ratio.
  // ===================================================

  if (
    requestedMode ===
    "fit"
  ) {
    image =
      image.resize({
        width:
          targetWidth,

        height:
          targetHeight,

        fit:
          "inside",

        withoutEnlargement:
          false,

        kernel:
          "lanczos3",
      });
  }

  // ===================================================
  // FILL
  //
  // Image completely covers target dimensions.
  //
  // Excess is cropped.
  //
  // No background.
  // ===================================================

  else if (
    requestedMode ===
    "fill"
  ) {
    image =
      image.resize({
        width:
          targetWidth,

        height:
          targetHeight,

        fit:
          "cover",

        position:
          "centre",

        withoutEnlargement:
          false,

        kernel:
          "lanczos3",
      });
  }

  // ===================================================
  // CROP
  // ===================================================

  else if (
    requestedMode ===
    "crop"
  ) {
    image =
      image.resize({
        width:
          targetWidth,

        height:
          targetHeight,

        fit:
          "cover",

        position:
          "centre",

        withoutEnlargement:
          false,

        kernel:
          "lanczos3",
      });
  }

  // ===================================================
  // STRETCH
  // ===================================================

  else if (
    requestedMode ===
    "stretch"
  ) {
    image =
      image.resize({
        width:
          targetWidth,

        height:
          targetHeight,

        fit:
          "fill",

        withoutEnlargement:
          false,

        kernel:
          "lanczos3",
      });
  }

  // ===================================================
  // INVALID MODE
  // ===================================================

  else {
    throw new Error(
      `Unsupported resize mode: ${requestedMode}`
    );
  }

  // ===================================================
  // QUALITY
  // ===================================================

  const quality =
    clamp(
      Number(
        options.quality
      ) || 90,
      1,
      100
    );

  // ===================================================
  // OUTPUT
  // ===================================================

  let outputBuffer: Buffer;

  // ===================================================
  // JPEG
  // ===================================================

  switch (
  inputFormat
  ) {
    case "jpeg":
    case "jpg": {
      outputBuffer =
        await image
          .jpeg({
            quality,

            mozjpeg:
              true,

            chromaSubsampling:
              "4:4:4",
          })
          .toBuffer();

      break;
    }

    // =================================================
    // PNG
    // =================================================

    case "png": {
      outputBuffer =
        await image
          .png({
            compressionLevel:
              9,

            adaptiveFiltering:
              true,
          })
          .toBuffer();

      break;
    }

    // =================================================
    // WEBP
    // =================================================

    case "webp": {
      outputBuffer =
        await image
          .webp({
            quality,

            effort:
              6,

            smartSubsample:
              true,
          })
          .toBuffer();

      break;
    }

    // =================================================
    // AVIF
    // =================================================

    case "avif": {
      outputBuffer =
        await image
          .avif({
            quality,

            effort:
              6,
          })
          .toBuffer();

      break;
    }

    // =================================================
    // GIF
    // =================================================

    case "gif": {
      outputBuffer =
        await image
          .gif()
          .toBuffer();

      break;
    }

    // =================================================
    // TIFF
    // =================================================

    case "tiff":
    case "tif": {
      outputBuffer =
        await image
          .tiff({
            quality,

            compression:
              "lzw",
          })
          .toBuffer();

      break;
    }

    // =================================================
    // UNSUPPORTED
    // =================================================

    default: {
      throw new Error(
        `Unsupported image format: ${inputFormat}`
      );
    }
  }

  // ===================================================
  // FINAL METADATA
  // ===================================================

  const finalMetadata =
    await sharp(
      outputBuffer,
      {
        failOn: "none",
        limitInputPixels:
          false,
      }
    ).metadata();

  console.log(
    "Final:",
    `${finalMetadata.width} x ${finalMetadata.height}`
  );

  console.log(
    "Final size:",
    (
      outputBuffer.length /
      1024
    ).toFixed(2),
    "KB"
  );

  console.log(
    "========================================"
  );

  // ===================================================
  // RESULT
  // ===================================================

  return {
    buffer:
      outputBuffer,

    mime:
      getMimeType(
        inputFormat
      ),

    extension:
      getExtension(
        inputFormat
      ),

    width:
      finalMetadata.width ||
      targetWidth,

    height:
      finalMetadata.height ||
      targetHeight,
  };
}