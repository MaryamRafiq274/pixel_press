import { optimize } from "svgo";

export async function compressSVG(
  buffer: Buffer
): Promise<Buffer> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error("Empty SVG buffer");
    }

    console.log(
      "SVG input:",
      (buffer.length / 1024).toFixed(2),
      "KB"
    );

    const svgString = buffer.toString("utf-8");

    const result = optimize(svgString, {
      multipass: true,

      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              cleanupNumericValues: {
                floatPrecision: 3,
              },
            },
          },
        },

        "removeDimensions",
      ],
    });

    const compressedBuffer = Buffer.from(
      result.data,
      "utf-8"
    );

    console.log(
      "SVG output:",
      (
        compressedBuffer.length / 1024
      ).toFixed(2),
      "KB"
    );

    // Never return a larger SVG
    if (
      compressedBuffer.length <
      buffer.length
    ) {
      console.log(
        "Using optimized SVG."
      );

      return compressedBuffer;
    }

    console.log(
      "SVG optimization did not reduce size. Using original."
    );

    return buffer;

  } catch (error: any) {
    console.error(
      "================================"
    );

    console.error(
      "SVG COMPRESSION ERROR"
    );

    console.error(
      error?.message
    );

    console.error(
      "================================"
    );

    // Do not crash the entire compression API
    return buffer;
  }
}