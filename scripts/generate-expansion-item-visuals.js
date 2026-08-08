const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { EXPANSION_VISUALS, getGeneratedVisualSource } = require("../game/itemVisuals.js");

const root = path.resolve(__dirname, "..");
const outputDirectory = path.join(root, "public", "assets", "items");
const iconSize = 128;

async function rasterize(page, source) {
  return page.evaluate(async ({ src, size }) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, size, size);
    return canvas.toDataURL("image/webp", 0.72);
  }, { src: source, size: iconSize });
}

async function main() {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: iconSize, height: iconSize } });
  let written = 0;
  let skipped = 0;
  try {
    for (const itemId of Object.keys(EXPANSION_VISUALS)) {
      const filename = `${itemId}-v2.webp`;
      const outputPath = path.join(outputDirectory, filename);
      if (fs.existsSync(outputPath)) {
        skipped += 1;
        continue;
      }
      const source = getGeneratedVisualSource(itemId);
      if (!source?.startsWith("data:image/svg+xml")) {
        throw new Error(`Expected a generated vector source for ${itemId}`);
      }
      const dataUrl = await rasterize(page, source);
      const output = Buffer.from(dataUrl.split(",")[1], "base64");
      fs.writeFileSync(outputPath, output);
      written += 1;
      console.log(`Wrote ${filename} (${output.length} bytes)`);
    }
  } finally {
    await browser.close();
  }
  console.log(`OK expansion visuals: wrote ${written}, skipped ${skipped}, total ${Object.keys(EXPANSION_VISUALS).length}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { iconSize, rasterize };
