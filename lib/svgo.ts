import { optimize } from "svgo";


export async function compressSVG(
  buffer: Buffer
): Promise<Buffer> {

  const svgString = buffer.toString("utf-8");


  const result = optimize(svgString, {

    multipass: true,

    plugins: [
      "preset-default",

      "removeDimensions",

      "cleanupIds",
    ],

  });


  return Buffer.from(
    result.data,
    "utf-8"
  );

}