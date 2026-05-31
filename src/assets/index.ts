import { PathLike } from "node:fs";
import { glob, readFile, stat } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp, { Sharp } from "sharp";

const assets = new Map<string, Sharp>();

export async function loadAssets(dir: PathLike) {
  const statDir = await stat(dir);

  if (!statDir.isDirectory()) {
    throw new Error(`The directory '${dir}' is not a directory.`);
  }

  const basePath = dir instanceof URL ? fileURLToPath(dir) : dir.toString();
  const pattern = resolve(basePath, "**/*.png");

  for await (const file of glob(pattern)) {
    const ident = relative(basePath, file).replace(".png", "");
    
    const data = await readFile(file);
    const image = sharp(data);

    assets.set(ident, image);
  }

  console.log(`Loaded ${assets.size} assets!`)
}

export function resetAssets() {
  assets.clear();
}
