import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { readFile, writeFile, unlink } from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const files = ["qso-dates-wordmark.png", "ipadintro.png"];

async function removeDarkBackground(fileName) {
  const filePath = path.join(root, "public", fileName);
  const input = await readFile(filePath);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= 48 && g <= 48 && b <= 48) {
      data[i + 3] = 0;
    }
  }

  const output = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const tempPath = `${filePath}.tmp`;
  await writeFile(tempPath, output);
  try {
    await unlink(filePath);
  } catch {
    /* ignore */
  }
  await writeFile(filePath, output);
  try {
    await unlink(tempPath);
  } catch {
    /* ignore */
  }

  console.log(`Updated ${fileName} (${info.width}x${info.height})`);
}

for (const file of files) {
  await removeDarkBackground(file);
}
