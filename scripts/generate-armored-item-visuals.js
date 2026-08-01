const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { CHAPTER_VISUAL_MANIFEST } = require("../game/chapterVisualManifest.js");

const root = path.resolve(__dirname, "..");
const outputDirectory = path.join(root, "public", "assets", "items");
const iconSize = 128;

function svgFor(visual, index) {
  const mission = '<path d="M128 25 153 80l60 6-45 40 13 59-53-30-53 30 13-59-45-40 60-6Z" fill="#f5c84c" stroke="#fff1b0" stroke-width="8"/><circle cx="128" cy="112" r="24" fill="#193447"/><path d="m115 112 10 10 20-26" fill="none" stroke="#dffeff" stroke-width="9"/>';
  const componentShapes = [
    '<path d="M32 160 94 77h68l62 83-36 37H68Z" fill="#52667a" stroke="#a9d8e5" stroke-width="8"/><path d="M68 160h120l-22 28H90Z" fill="#1e2936"/><circle cx="128" cy="121" r="25" fill="#58e6c6"/>',
    '<path d="M48 100h160v74H48z" fill="#445d70" stroke="#b6e5ee" stroke-width="8"/><path d="M69 121h118M69 145h118" stroke="#54e4ca" stroke-width="10"/><circle cx="84" cy="177" r="13" fill="#f4c95d"/><circle cx="172" cy="177" r="13" fill="#f4c95d"/>',
    '<path d="M58 174 87 65h82l29 109-32 30H90Z" fill="#5c7182" stroke="#d5f4f8" stroke-width="8"/><path d="M92 108h72v45H92z" fill="#152b3d"/><path d="M102 128h52" stroke="#60f2d0" stroke-width="8"/>',
    '<path d="m37 157 56-74h70l56 74-37 39H74Z" fill="#3f5569" stroke="#b4eced" stroke-width="8"/><path d="m84 153 44-44 44 44" fill="none" stroke="#f1ca62" stroke-width="10"/>',
    '<circle cx="128" cy="128" r="78" fill="#344d62" stroke="#bceff4" stroke-width="9"/><circle cx="128" cy="128" r="43" fill="#132c40" stroke="#5ce8cb" stroke-width="10"/><path d="M128 48v35M128 173v35M48 128h35M173 128h35" stroke="#f4cd62" stroke-width="9"/>'
  ];
  const partShapes = [
    '<path d="M22 167 77 108h110l47 59-47 34H70Z" fill="#445d68" stroke="#d1f2f1" stroke-width="9"/><path d="m35 168 55 18h98l38-19-42 34H72Z" fill="#1d2a34"/><circle cx="75" cy="190" r="11" fill="#f4c95d"/><circle cx="178" cy="190" r="11" fill="#f4c95d"/>',
    '<path d="M43 158 89 91h96l30 67-39 42H74Z" fill="#526a77" stroke="#d5f7f4" stroke-width="8"/><path d="M115 93h32l40 40-40 14H115Z" fill="#1d3345"/><path d="M146 115h70" stroke="#f5cc64" stroke-width="11"/>',
    '<path d="M28 174h200l-34 32H62Z" fill="#394d5f" stroke="#c8f3f1" stroke-width="8"/><path d="M43 151h170v30H43z" fill="#1e2c39"/><circle cx="72" cy="192" r="13" fill="#f4c95d"/><circle cx="184" cy="192" r="13" fill="#f4c95d"/>',
    '<path d="M53 178 82 69h92l29 109-41 31H94Z" fill="#496270" stroke="#d4f6f5" stroke-width="8"/><path d="M95 108h66v54H95z" fill="#1a3347"/><path d="M108 126h40M128 108v54" stroke="#5fe8cd" stroke-width="8"/>'
  ];
  const final = '<path d="M16 171 72 123h100l61 48-43 34H57Z" fill="#455c68" stroke="#d7f8f5" stroke-width="10"/><path d="m26 171 57 19h101l43-19-44 37H69Z" fill="#1c2833"/><path d="M93 122h68l25 31-28 17h-66l-26-17Z" fill="#607681" stroke="#bfeeea" stroke-width="7"/><path d="M147 119h77" stroke="#f5cb61" stroke-width="12"/><circle cx="74" cy="191" r="14" fill="#f5ca5c"/><circle cx="108" cy="191" r="14" fill="#f5ca5c"/><circle cx="160" cy="191" r="14" fill="#f5ca5c"/><circle cx="192" cy="191" r="14" fill="#f5ca5c"/><path d="M109 119h31" stroke="#5ce7cc" stroke-width="9"/>';
  const art = visual.kind === "mission-badge" ? mission : visual.kind === "project-component" ? componentShapes[index % componentShapes.length] : visual.kind === "project-part" ? partShapes[index % partShapes.length] : final;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><radialGradient id="bg"><stop stop-color="#31536a"/><stop offset="1" stop-color="#101922"/></radialGradient></defs><rect width="256" height="256" rx="42" fill="url(#bg)"/><circle cx="128" cy="128" r="104" fill="none" stroke="#65d8ce" stroke-opacity=".45" stroke-width="3"/>${art}</svg>`)}`;
}

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
  const visuals = CHAPTER_VISUAL_MANIFEST.filter(({ chapterId }) => chapterId === "chapter-05");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: iconSize, height: iconSize } });
  try {
    for (const [index, visual] of visuals.entries()) {
      const dataUrl = await rasterize(page, svgFor(visual, index));
      fs.writeFileSync(path.join(outputDirectory, visual.filename), Buffer.from(dataUrl.split(",")[1], "base64"));
      console.log(`Wrote ${visual.filename}`);
    }
  } finally {
    await browser.close();
  }
}

if (require.main === module) main().catch((error) => { console.error(error); process.exit(1); });

module.exports = { iconSize, svgFor, rasterize };
