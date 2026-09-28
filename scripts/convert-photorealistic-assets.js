const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const brainDir = "C:\\Users\\24960\\.gemini\\antigravity-ide\\brain\\763b6a51-7969-4c89-ad59-19894cb763b7";
const outputDir = path.resolve(__dirname, "..", "public", "assets", "items");

const ASSET_MAPPING = [
  {
    itemId: "j20-sky-fighter",
    sourceFile: "j20_fighter_photorealistic_1789180333317.jpg",
    targets: ["j20-sky-fighter-v1.webp", "j20-sky-fighter-v1.png"],
    resolution: 1024
  },
  {
    itemId: "deep-sea-explorer",
    sourceFile: "deepsea_submersible_photorealistic_1789180416613.jpg",
    targets: ["deep-sea-explorer-v2.webp", "deep-sea-explorer-v2.png"],
    resolution: 1024
  },
  {
    itemId: "orbital-science-station",
    sourceFile: "orbital_station_photorealistic_1789180563796.jpg",
    targets: ["orbital-science-station-v2.webp"],
    resolution: 1024
  },
  {
    itemId: "polar-icebreaker",
    sourceFile: "polar_icebreaker_photorealistic_1789180581811.jpg",
    targets: ["polar-icebreaker-v2.webp"],
    resolution: 1024
  },
  {
    itemId: "99a-main-battle-tank",
    sourceFile: "type99a_tank_photorealistic_1789180633785.jpg",
    targets: ["99a-main-battle-tank-v2.webp"],
    resolution: 1024
  },
  {
    itemId: "quantum-communication-satellite",
    sourceFile: "quantum_satellite_photorealistic_1789180807211.jpg",
    targets: ["quantum-communication-satellite-v2.webp"],
    resolution: 1024
  },
  {
    itemId: "math-explorer-rover",
    sourceFile: "mars_rover_photorealistic_1789180843313.jpg",
    targets: ["math-explorer-rover-v2.webp"],
    resolution: 1024
  },
  {
    itemId: "deep-space-navigation-ship",
    sourceFile: "deepspace_ship_photorealistic_1789180865170.jpg",
    targets: ["deep-space-navigation-ship-v2.webp"],
    resolution: 1024
  },
  {
    itemId: "smart-city-hub",
    sourceFile: "smart_city_photorealistic_1789180950740.jpg",
    targets: ["smart-city-hub-v2.webp"],
    resolution: 1024
  }
];

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Starting conversion of photorealistic super project assets...");

  for (const item of ASSET_MAPPING) {
    const inputPath = path.join(brainDir, item.sourceFile);
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    const fileBase64 = fs.readFileSync(inputPath).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${fileBase64}`;

    for (const targetName of item.targets) {
      const isPng = targetName.endsWith(".png");
      const mimeType = isPng ? "image/png" : "image/webp";
      const quality = isPng ? undefined : 0.88;

      const convertedDataUrl = await page.evaluate(async ({ src, size, mime, qual }) => {
        const img = new Image();
        img.src = src;
        await img.decode();

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, size, size);

        return canvas.toDataURL(mime, qual);
      }, { src: dataUrl, size: item.resolution, mime: mimeType, qual: quality });

      const targetPath = path.join(outputDir, targetName);
      const buffer = Buffer.from(convertedDataUrl.split(",")[1], "base64");
      fs.writeFileSync(targetPath, buffer);
      console.log(`[CONVERTED] ${targetName} (${buffer.length} bytes, ${item.resolution}x${item.resolution})`);
    }
  }

  await browser.close();
  console.log("ALL photorealistic assets converted and deployed successfully!");
}

main().catch(err => {
  console.error("Conversion error:", err);
  process.exit(1);
});
