const fs = require("node:fs");
const path = require("node:path");
const { CHAPTER_VISUAL_MANIFEST } = require("../game/chapterVisualManifest.js");
const { getItemVisual } = require("../game/itemVisuals.js");
const catalog = require("../game/itemCatalog.js");

const root = path.resolve(__dirname, "..");
const publicDirectory = path.join(root, "public");
const failures = [];
const checked = new Set();

function checkAsset(itemId, source, expectedFilename = null) {
  if (typeof source !== "string" || !source.startsWith("/assets/items/")) {
    failures.push(`${itemId}: visual must reference a shipped /assets/items/ file`);
    return;
  }
  const relative = source.replace(/^\//, "");
  const filename = path.basename(relative);
  if (expectedFilename && filename !== expectedFilename) {
    failures.push(`${itemId}: expected ${expectedFilename}, got ${filename}`);
  }
  const absolute = path.join(publicDirectory, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`${itemId}: missing ${relative}`);
    return;
  }
  const bytes = fs.readFileSync(absolute);
  if (bytes.length < 100 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
    failures.push(`${itemId}: ${relative} is not a valid WebP asset`);
  }
  checked.add(relative);
}

CHAPTER_VISUAL_MANIFEST.forEach(({ itemId, filename }) => {
  checkAsset(itemId, getItemVisual(itemId)?.src, filename);
});

catalog.listItems().forEach((item) => {
  checkAsset(item.id, getItemVisual(item.id)?.src);
});

if (failures.length) {
  console.error(`FAIL visual asset coverage: ${failures.length} issue(s)`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`OK visual asset coverage: ${checked.size} unique WebP assets cover ${CHAPTER_VISUAL_MANIFEST.length} manifest entries and ${catalog.listItems().length} catalog items`);
