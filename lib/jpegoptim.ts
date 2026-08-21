import { execa } from "execa";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";


export async function optimizeJPEG(
  buffer: Buffer
): Promise<Buffer> {


  const id = crypto.randomUUID();


  const filePath = path.join(
    os.tmpdir(),
    `${id}.jpg`
  );


  try {

    await fs.writeFile(
      filePath,
      buffer
    );


    const jpegoptimPath = path.join(
      process.cwd(),
      "tools",
      "jpegoptim.exe"
    );


    console.log(
      "Running JPEGoptim:",
      jpegoptimPath
    );


    await execa(
      jpegoptimPath,
      [
        "--max=65",
        "--strip-all",
        "--all-progressive",
        "--force",
        filePath
      ]
    );


    const result =
      await fs.readFile(filePath);


    return result;


  } finally {


    await fs.unlink(filePath)
      .catch(()=>{});

  }
}