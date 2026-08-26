import { optimize } from "svgo";

export async function compressSVG(
  buffer: Buffer
): Promise<Buffer> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error("Empty SVG buffer");
    }

    console.log("================================");
    console.log("SVG COMPRESSION STARTED");

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

        {
          name: "removeDimensions",
        },
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

    if (
      compressedBuffer.length <
      buffer.length
    ) {
      console.log(
        "SVG compression successful"
      );

      return compressedBuffer;
    }

    console.log(
      "Compressed SVG is not smaller. Keeping original."
    );

    return buffer;

  } catch (error: any) {
    console.error("================================");
    console.error("SVG COMPRESSION ERROR");
    console.error("Message:", error?.message);
    console.error("Stack:", error?.stack);
    console.error("================================");

    // Return original SVG instead of crashing API
    return buffer;
  }
}