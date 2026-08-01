const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const { CHAPTER_VISUAL_MANIFEST } = require(path.join(root, "game", "chapterVisualManifest.js"));
const { getItemVisual } = require(path.join(root, "game", "itemVisuals.js"));
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
    return canvas.toDataURL("image/webp", 0.62);
  }, { src: source, size: iconSize });
}

async function main() {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: iconSize, height: iconSize } });
  try {
    for (const visual of CHAPTER_VISUAL_MANIFEST.filter(({ chapterId }) => chapterId === "chapter-04")) {
      const source = getItemVisual(visual.itemId)?.src;
      if (!source?.startsWith("data:image/svg+xml")) {
        throw new Error(`Expected a vector source for ${visual.itemId}`);
      }
      const dataUrl = await rasterize(page, source);
      const output = Buffer.from(dataUrl.split(",")[1], "base64");
      fs.writeFileSync(path.join(outputDirectory, visual.filename), output);
      console.log(`Wrote ${visual.filename} (${output.length} bytes)`);
    }
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { iconSize, rasterize };
