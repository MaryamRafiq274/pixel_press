import {
  vectorize,
  ColorMode,
  Hierarchical,
  PathSimplifyMode,
} from "@neplex/vectorizer";

import { optimize } from "svgo";

/**
 * Convert a raster image into SVG.
 *
 * Supported raster inputs:
 * - PNG
 * - JPG
 * - JPEG
 * - WEBP
 * - AVIF
 *
 * Processing:
 *
 * Raster Image
 *      ↓
 * VTracer
 *      ↓
 * SVG paths
 *      ↓
 * SVGO
 *      ↓
 * Optimized SVG
 */
export async function rasterToSVG(
  buffer: Buffer
): Promise<Buffer> {
  console.log(
    "========================================"
  );

  console.log(
    "Starting raster → SVG vectorization..."
  );

  console.log(
    "Raster input size:",
    (
      buffer.length / 1024
    ).toFixed(2),
    "KB"
  );

  // =====================================================
  // VTRACER
  //
  // Raster image
  //      ↓
  // VTracer
  //      ↓
  // SVG paths
  // =====================================================

  console.log(
    "Running VTracer..."
  );

  const svgString =
    await vectorize(
      buffer,
      {
        // -------------------------------------------------
        // Full-color vectorization
        // -------------------------------------------------

        colorMode:
          ColorMode.Color,

        // -------------------------------------------------
        // Color accuracy
        // -------------------------------------------------

        colorPrecision: 6,

        // -------------------------------------------------
        // Remove very small noisy areas
        // -------------------------------------------------

        filterSpeckle: 4,

        // -------------------------------------------------
        // Controls color/path joining
        // -------------------------------------------------

        spliceThreshold: 45,

        // -------------------------------------------------
        // Corner detection
        // -------------------------------------------------

        cornerThreshold: 60,

        // -------------------------------------------------
        // Layering
        // -------------------------------------------------

        hierarchical:
          Hierarchical.Stacked,

        // -------------------------------------------------
        // Smooth curves
        // -------------------------------------------------

        mode:
          PathSimplifyMode.Spline,

        // -------------------------------------------------
        // Color layer difference
        // -------------------------------------------------

        layerDifference: 5,

        // -------------------------------------------------
        // Ignore extremely short paths
        // -------------------------------------------------

        lengthThreshold: 5,

        // -------------------------------------------------
        // Vectorization iterations
        // -------------------------------------------------

        maxIterations: 2,

        // -------------------------------------------------
        // SVG coordinate precision
        // -------------------------------------------------

        pathPrecision: 5,
      }
    );

  const vTracerSize =
    Buffer.byteLength(
      svgString,
      "utf8"
    );

  console.log(
    "VTracer SVG size:",
    (
      vTracerSize / 1024
    ).toFixed(2),
    "KB"
  );

  // =====================================================
  // SVGO
  //
  // VTracer SVG
  //      ↓
  // SVGO
  //      ↓
  // Optimized SVG
  // =====================================================

  console.log(
    "Running SVGO..."
  );

  const optimized =
    optimize(
      svgString,
      {
        multipass: true,

        plugins: [
          "preset-default",

          {
            name:
              "removeDimensions",
          },

          {
            name:
              "cleanupIds",
          },
        ],
      }
    );

  // =====================================================
  // Validate SVGO result
  // =====================================================

  if (
    !("data" in optimized)
  ) {
    throw new Error(
      "SVG optimization failed"
    );
  }

  // =====================================================
  // Final SVG
  // =====================================================

  const finalSVG =
    Buffer.from(
      optimized.data,
      "utf8"
    );

  console.log(
    "Final optimized SVG:",
    (
      finalSVG.length /
      1024
    ).toFixed(2),
    "KB"
  );

  console.log(
    "Raster → SVG completed successfully."
  );

  console.log(
    "========================================"
  );

  return finalSVG;
}

