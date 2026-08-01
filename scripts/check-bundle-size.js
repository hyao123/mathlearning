const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const budgets = {
  // Five locally playable chapters include 600 reviewed questions and their chapter registries.
  jsGzipBytes: 150 * 1024,
  cssGzipBytes: 20 * 1024,
  totalGzipBytes: 170 * 1024,
  // Existing artwork is retained; compact WebP chapter assets are loaded only when their inventory cards render.
  itemVisualBytes: Math.ceil(3.1 * 1024 * 1024)
};

if (!fs.existsSync(dist)) {
  console.error("FAIL dist is missing. Run `npm run build` first.");
  process.exit(1);
}

const assets = listFiles(dist).filter((file) => /\.(js|css|html)$/.test(file));
const itemVisuals = listFiles(path.join(dist, "assets", "items")).filter((file) => /\.webp$/.test(file));
const summary = assets.reduce(
  (result, file) => {
    const bytes = fs.readFileSync(file);
    const gzipBytes = zlib.gzipSync(bytes).length;
    const ext = path.extname(file);
    result.totalGzipBytes += gzipBytes;
    if (ext === ".js") {
      result.jsGzipBytes += gzipBytes;
    }
    if (ext === ".css") {
      result.cssGzipBytes += gzipBytes;
    }
    result.assets.push({ file: path.relative(root, file), bytes: bytes.length, gzipBytes });
    return result;
  },
  { assets: [], cssGzipBytes: 0, jsGzipBytes: 0, totalGzipBytes: 0 }
);
summary.itemVisualBytes = itemVisuals.reduce((total, file) => total + fs.statSync(file).size, 0);

const failures = Object.entries(budgets)
  .filter(([key, budget]) => summary[key] > budget)
  .map(([key, budget]) => `${key} ${summary[key]} > budget ${budget}`);

if (failures.length > 0) {
  console.error("FAIL bundle budget exceeded:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log(`OK bundle size: js gzip ${format(summary.jsGzipBytes)}, css gzip ${format(summary.cssGzipBytes)}, total gzip ${format(summary.totalGzipBytes)}, item visuals ${format(summary.itemVisualBytes)}`);

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

function format(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}
