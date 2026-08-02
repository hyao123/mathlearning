const { CHAPTER_VISUAL_MANIFEST } = require("./chapterVisualManifest.js");

const ITEM_VISUALS = Object.freeze({
  "oak-log": Object.freeze({
    src: "/assets/items/oak-log-v1.png", width: 1280, height: 1280,
    alt: "橡木原木的高写实微缩模型", fallbackIcon: "material-generic", preloadPriority: "inventory-material"
  }),
  cobblestone: Object.freeze({
    src: "/assets/items/cobblestone-v1.png", width: 1280, height: 1280,
    alt: "圆石的高写实微缩模型", fallbackIcon: "material-generic", preloadPriority: "inventory-material"
  }),
  coal: Object.freeze({
    src: "/assets/items/coal-v1.png", width: 1280, height: 1280,
    alt: "煤炭的高写实微缩模型", fallbackIcon: "material-generic", preloadPriority: "inventory-material"
  }),
  "iron-ingot": Object.freeze({
    src: "/assets/items/iron-ingot-v1.png", width: 1280, height: 1280,
    alt: "铁锭的高写实微缩模型", fallbackIcon: "material-generic", preloadPriority: "inventory-material"
  }),
  "redstone-dust": Object.freeze({
    src: "/assets/items/redstone-dust-v1.png", width: 1280, height: 1280,
    alt: "红石粉的高写实微缩模型", fallbackIcon: "material-generic", preloadPriority: "inventory-material"
  }),
  "lapis-lazuli": Object.freeze({
    src: "/assets/items/lapis-lazuli-v1.png", width: 1280, height: 1280,
    alt: "青金石的高写实微缩模型", fallbackIcon: "material-generic", preloadPriority: "inventory-material"
  }),
  "gold-ingot": Object.freeze({
    src: "/assets/items/gold-ingot-v1.png", width: 1280, height: 1280,
    alt: "金锭的高写实微缩模型", fallbackIcon: "material-generic", preloadPriority: "inventory-material"
  }),
  emerald: Object.freeze({
    src: "/assets/items/emerald-v1.png", width: 1280, height: 1280,
    alt: "绿宝石的高写实微缩模型", fallbackIcon: "material-generic", preloadPriority: "inventory-material"
  }),
  diamond: Object.freeze({
    src: "/assets/items/diamond-v1.png", width: 1280, height: 1280,
    alt: "钻石的高写实微缩模型", fallbackIcon: "material-generic", preloadPriority: "inventory-material"
  }),
  "netherite-scrap": Object.freeze({
    src: "/assets/items/netherite-scrap-v1.png", width: 1280, height: 1280,
    alt: "高密度合金碎片的高写实微缩模型", fallbackIcon: "material-generic", preloadPriority: "inventory-material"
  }),
  "expedition-core": Object.freeze({
    src: "/assets/items/expedition-core-v1.png", width: 1280, height: 1280,
    alt: "远征核心的高写实微缩模型", fallbackIcon: "material-generic", preloadPriority: "inventory-material"
  }),
  "j20-energy-bus": Object.freeze({
    src: "/assets/items/j20-energy-bus-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 能量总线的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-vector-vane": Object.freeze({
    src: "/assets/items/j20-vector-vane-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 矢量控制叶片的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-turbine-ring": Object.freeze({
    src: "/assets/items/j20-turbine-ring-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 涡轮环的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-edge-flap": Object.freeze({
    src: "/assets/items/j20-edge-flap-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 翼缘襟翼的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-weapon-rail": Object.freeze({
    src: "/assets/items/j20-weapon-rail-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 模块挂载导轨的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-absorbing-coat": Object.freeze({
    src: "/assets/items/j20-absorbing-coat-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 吸波涂层的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-radar-dish": Object.freeze({
    src: "/assets/items/j20-radar-dish-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 雷达天线的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-frame-rib": Object.freeze({
    src: "/assets/items/j20-frame-rib-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 机体肋梁的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-wing-spar": Object.freeze({
    src: "/assets/items/j20-wing-spar-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 翼面梁架的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-skin-panel": Object.freeze({
    src: "/assets/items/j20-skin-panel-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 机体蒙皮的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-sensor-array": Object.freeze({
    src: "/assets/items/j20-sensor-array-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 传感阵列的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-flight-computer": Object.freeze({
    src: "/assets/items/j20-flight-computer-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 飞控计算机的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-component"
  }),
  "j20-sky-fighter": Object.freeze({
    src: "/assets/items/j20-sky-fighter-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 苍穹战机的高写实微缩模型",
    fallbackIcon: "fighter-art",
    preloadPriority: "project-final"
  }),
  "j20-airframe": Object.freeze({
    src: "/assets/items/j20-airframe-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 机身结构部件的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-part"
  }),
  "j20-avionics": Object.freeze({
    src: "/assets/items/j20-avionics-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 航电雷达部件的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-part"
  }),
  "j20-stealth-wing": Object.freeze({
    src: "/assets/items/j20-stealth-wing-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 隐身武装部件的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-part"
  }),
  "j20-vector-engine": Object.freeze({
    src: "/assets/items/j20-vector-engine-v1.png",
    width: 1280,
    height: 1280,
    alt: "J-20 矢量动力部件的高写实微缩模型",
    fallbackIcon: "project-art",
    preloadPriority: "project-part"
  })
});

const EXPANSION_ITEM_IDS = Object.freeze([
  "j20-processed-frame-plate", "j20-structural-steel", "j20-carbon-shell", "j20-signal-board", "j20-optical-lens", "j20-gold-alloy", "j20-emerald-conductor", "j20-diamond-edge", "j20-netherite-composite", "j20-turbine-alloy", "j20-energy-crystal", "j20-expedition-alloy",
  "prismarine-shard", "nautilus-shell", "sponge", "ink-sac", "glow-ink-sac", "turtle-scute", "clay-ball", "amethyst-shard", "conduit-core", "coral-fan", "heart-of-the-sea",
  "sub-pressure-steel", "sub-ballast-ceramic", "sub-wing-composite", "sub-sonar-crystal", "sub-navigation-gyro", "sub-searchlight-lens", "sub-seal-ring", "sub-sampling-armature", "sub-data-storage", "sub-propeller-alloy", "sub-energy-conduit", "sub-deep-core",
  ...Array.from({ length: 12 }, (_, index) => `sub-${index + 1}`), ...Array.from({ length: 4 }, (_, index) => `sub-part-${index + 1}`), "deep-sea-explorer",
  ...Array.from({ length: 5 }, (_, index) => `chapter-02-mission-${index + 1}`),
  "quartz", "glowstone-dust", "ender-pearl", "echo-shard", "blaze-rod", "phantom-membrane", "obsidian", "nether-star", "shulker-shell", "slimeball", "firework-star",
  "station-truss-alloy", "station-solar-cell", "station-thermal-panel", "station-star-sensor", "station-communication-crystal", "station-navigation-gyro", "station-lab-console", "station-observation-lens", "station-docking-ring", "station-orbit-thruster", "station-energy-bus", "station-orbit-core",
  ...Array.from({ length: 12 }, (_, index) => `station-${index + 1}`), ...Array.from({ length: 4 }, (_, index) => `station-part-${index + 1}`), "orbital-science-station",
  ...Array.from({ length: 5 }, (_, index) => `chapter-03-mission-${index + 1}`),
  "ice-crystal-shard", "cold-iron-ingot", "aurora-core", "thermal-alloy", "polar-quartz", "compass-core", "icebreaker-plate", "insulation-fiber", "deep-sea-battery", "snow-beacon", "aurora-prism",
  "icebreaker-steel", "icebreaker-keel-core", "icebreaker-window-glass", "icebreaker-navigation-gyro", "icebreaker-sonar-crystal", "icebreaker-propulsion-alloy", "icebreaker-thermal-pipe", "icebreaker-crane-frame", "icebreaker-radar-lens", "icebreaker-aurora-antenna", "icebreaker-fuel-bus", "icebreaker-ice-core",
  ...Array.from({ length: 12 }, (_, index) => `icebreaker-${index + 1}`), ...Array.from({ length: 4 }, (_, index) => `icebreaker-part-${index + 1}`), "polar-icebreaker",
  ...Array.from({ length: 5 }, (_, index) => `chapter-04-mission-${index + 1}`),
  "carbon-titanium-plate", "nano-ceramic-chip", "quantum-armor-fiber", "reactive-armor-unit", "thermal-imaging-chip", "pulse-circuit", "maglev-track-link", "coolant-gel", "plasma-energy-core", "tactical-data-core", "fusion-drive-rod",
  "tank-steel-ingot", "tank-armor-ceramic", "tank-fire-control-chip", "tank-turret-ring", "tank-thermal-lens", "tank-pulse-module", "tank-track-steel", "tank-vector-core", "tank-coolant-canister", "tank-power-bus", "tank-tactical-chip", "tank-engineering-alloy",
  ...Array.from({ length: 12 }, (_, index) => `tank-${index + 1}`), ...Array.from({ length: 4 }, (_, index) => `tank-part-${index + 1}`), "99a-main-battle-tank",
  ...Array.from({ length: 5 }, (_, index) => `chapter-05-mission-${index + 1}`),
  "starlight-crystal", "spectral-glass", "signal-dust", "quantum-sand", "ion-battery", "photon-chip", "nebula-alloy", "gravity-lens", "data-prism", "pulse-core", "cosmic-iron",
  "satellite-truss-alloy", "satellite-solar-film", "satellite-data-board", "satellite-sensor-lens", "satellite-gyro-core", "satellite-antenna-array", "satellite-telemetry-chip", "satellite-signal-filter", "satellite-thermal-shell", "satellite-orbit-engine", "satellite-quantum-core", "satellite-command-core",
  ...Array.from({ length: 12 }, (_, index) => `satellite-${index + 1}`), ...Array.from({ length: 4 }, (_, index) => `satellite-part-${index + 1}`), "quantum-communication-satellite",
  ...Array.from({ length: 5 }, (_, index) => `chapter-06-mission-${index + 1}`)
]);

function polarVisualVariant(itemId) {
  if (!/^(icebreaker|ice-crystal|cold-iron|aurora|thermal|polar|compass|insulation|deep-sea-battery|snow-beacon|chapter-04)/.test(itemId)) return null;
  if (itemId === "polar-icebreaker") return "polar-final-project";
  if (itemId.startsWith("icebreaker-part-")) return "polar-part";
  if (itemId.startsWith("icebreaker-")) return "polar-component";
  if (itemId.startsWith("chapter-04-mission-")) return "polar-mission";
  return "polar-material";
}

function polarArt(itemId, visualVariant) {
  const index = Number((itemId.match(/-(\d+)$/) || [])[1] || 0);
  const materialShape = [
    '<path d="M128 38 178 88 150 188 106 218 72 152 82 84Z" fill="#dffaff" stroke="#63cbe8" stroke-width="8"/><path d="m128 38 22 150-44-36Z" fill="#7ce7ff" opacity=".9"/>',
    '<path d="M54 96 172 62l33 44-118 38Z" fill="#aec7dd" stroke="#e8fbff" stroke-width="7"/><path d="m75 151 118-38-12 31-118 37Z" fill="#52728d"/>',
    '<circle cx="128" cy="128" r="64" fill="#155d8d" stroke="#8dffff" stroke-width="8"/><circle cx="128" cy="128" r="32" fill="#d4ffff"/><path d="M128 30v35M128 191v35M30 128h35M191 128h35" stroke="#e8ffff" stroke-width="8"/>',
    '<path d="m48 166 43-85 56 17 61 68-45 30-80-9Z" fill="#64b8d7" stroke="#eafcff" stroke-width="8"/><path d="m75 144 76-24 29 33-88 24Z" fill="#d3f6ff" opacity=".75"/>'
  ][index % 4];
  const componentShape = [
    '<path d="M24 158 128 58l104 100-42 37H66Z" fill="#7bd8ef" stroke="#efffff" stroke-width="8"/><path d="M35 158h186l-35 23H70Z" fill="#1d5b86"/><path d="m101 97 27-26 27 26-27 25Z" fill="#e7ffff"/>',
    '<path d="M48 128a80 80 0 1 0 160 0 80 80 0 1 0-160 0" fill="#184e78" stroke="#aef5ff" stroke-width="10"/><circle cx="128" cy="128" r="39" fill="#8ce9ff"/><path d="M128 45v39M128 172v39M45 128h39M172 128h39" stroke="#efffff" stroke-width="9"/>',
    '<path d="M47 154h162l-28-64H75Z" fill="#80d7ed" stroke="#ecffff" stroke-width="8"/><path d="m67 154 22 45h78l22-45" fill="#245d86" stroke="#aef5ff" stroke-width="8"/><circle cx="128" cy="112" r="19" fill="#e9ffff"/>',
    '<path d="M54 173 78 73h100l24 100-44 34H98Z" fill="#1e628e" stroke="#cefaff" stroke-width="8"/><path d="M84 108h88M76 145h104" stroke="#8be8ff" stroke-width="10"/><circle cx="128" cy="174" r="15" fill="#f5feff"/>',
    '<path d="M39 152c31-15 41-65 89-83 32 14 56 48 89 83l-32 40H71Z" fill="#61c4df" stroke="#e9ffff" stroke-width="8"/><path d="m81 163 47-45 47 45" fill="none" stroke="#194a75" stroke-width="12"/><circle cx="128" cy="105" r="15" fill="#e9ffff"/>'
  ][index % 5];
  const partShape = [
    '<path d="M23 154c46-2 68-29 105-72l88 41-42 59H62Z" fill="#4c94bd" stroke="#e7ffff" stroke-width="8"/><path d="m26 154 62 29h86l42-60-33 17-65 1Z" fill="#173f68"/><path d="m108 104 42 20-20 22-42-7Z" fill="#b7f9ff"/>',
    '<path d="M51 168 88 76h77l40 92-41 40H91Z" fill="#1c5e8b" stroke="#c9f8ff" stroke-width="8"/><path d="M101 167h54l21-56H80Z" fill="#83e6fa"/><path d="M106 196h44" stroke="#f5ffff" stroke-width="11"/>',
    '<path d="M57 190V93h142v97Z" fill="#1d608c" stroke="#d7fbff" stroke-width="8"/><path d="M82 123h92M82 154h92" stroke="#85eaff" stroke-width="12"/><circle cx="128" cy="91" r="38" fill="#75dff5" stroke="#efffff" stroke-width="8"/>',
    '<path d="M50 186 78 65h100l28 121-50 31H100Z" fill="#4c97bd" stroke="#e3fbff" stroke-width="8"/><path d="M93 104h70v66H93Z" fill="#a6f5ff"/><path d="M107 124h42M128 103v68" stroke="#23577f" stroke-width="8"/>'
  ][Math.max(0, index - 1) % 4];

  if (visualVariant === "polar-final-project") {
    return '<path d="M20 164 85 78h106l48 86-48 42H71Z" fill="#3d87b1" stroke="#edffff" stroke-width="9"/><path d="m20 164 70 33h101l48-33-55 12-107-4Z" fill="#173e67"/><path d="m77 141 33-44h61l27 44Z" fill="#b7f7ff" stroke="#74dff4" stroke-width="7"/><path d="M92 91h20V56h15v35h19V46h15v45h17v-26h14v35" fill="none" stroke="#dfffff" stroke-width="8"/><path d="m32 154 39-8-20 24M211 151l-33-10 20 28" fill="none" stroke="#c3fbff" stroke-width="9"/><circle cx="74" cy="177" r="9" fill="#ffdf72"/><circle cx="178" cy="179" r="9" fill="#ffdf72"/>';
  }
  if (visualVariant === "polar-part") return partShape;
  if (visualVariant === "polar-component") return componentShape;
  if (visualVariant === "polar-mission") return '<path d="m128 31 23 48 53 8-38 38 9 54-47-26-48 26 10-54-39-38 54-8Z" fill="#f5cf63" stroke="#fff1b7" stroke-width="8"/><circle cx="128" cy="114" r="21" fill="#1b5883"/><path d="m118 114 8 9 17-23" fill="none" stroke="#ecffff" stroke-width="8"/>';
  return materialShape;
}

function quantumVisualVariant(itemId) {
  if (!/^(quantum-communication|satellite|starlight|spectral|signal-dust|quantum-sand|ion-battery|photon|nebula|gravity|data-prism|pulse-core|cosmic-iron|chapter-06)/.test(itemId)) return null;
  if (itemId === "quantum-communication-satellite") return "quantum-final-project";
  if (itemId.startsWith("satellite-part-")) return "quantum-part";
  if (/^satellite-\d+$/.test(itemId)) return "quantum-component";
  if (itemId.startsWith("chapter-06-mission-")) return "quantum-mission";
  return "quantum-material";
}

function quantumArt(itemId, visualVariant) {
  if (visualVariant === "quantum-final-project") return '<path d="M30 126 86 82h84l56 44-56 44H86Z" fill="#122e70" stroke="#a8f5ff" stroke-width="7"/><path d="M86 82 52 36h34l42 46M170 82l34-46h-34l-42 46M86 170l-34 46h34l42-46M170 170l34 46h-34l-42-46" fill="#5c8cff" stroke="#d1fbff" stroke-width="6"/><ellipse cx="128" cy="126" rx="27" ry="19" fill="#d7ffff" stroke="#7dffff" stroke-width="6"/><path d="M128 107v38M109 126h38" stroke="#5a6dff" stroke-width="5"/>';
  if (visualVariant === "quantum-part") return '<path d="M35 171 68 71h120l33 100-42 35H77Z" fill="#263a8d" stroke="#9cf6ff" stroke-width="7"/><path d="M68 71h120M78 104h100M88 137h80" stroke="#e6ffff" stroke-width="6" opacity=".8"/><circle cx="128" cy="171" r="18" fill="#f3d56f" stroke="#fff4bd" stroke-width="5"/>';
  if (visualVariant === "quantum-component") return '<rect x="48" y="60" width="160" height="136" rx="14" fill="#1d397f" stroke="#8defff" stroke-width="7"/><path d="M70 92h116M70 126h116M70 160h116" stroke="#78b9ff" stroke-width="8"/><circle cx="86" cy="92" r="7" fill="#f5d06f"/><circle cx="86" cy="126" r="7" fill="#8dffff"/><circle cx="86" cy="160" r="7" fill="#f5d06f"/>';
  if (visualVariant === "quantum-mission") return '<path d="m128 28 24 48 53 8-38 38 9 54-48-26-48 26 10-54-39-38 53-8Z" fill="#f5d06f" stroke="#f5f0bb" stroke-width="8"/><circle cx="128" cy="116" r="22" fill="#273e9e"/><path d="m116 116 9 10 19-24" fill="none" stroke="#d8ffff" stroke-width="7"/>';
  return '<path d="M74 176 88 78l40-30 40 30 14 98-54 28Z" fill="#3867c7" stroke="#b7fbff" stroke-width="7"/><path d="M96 94h64M92 122h72M88 150h80" stroke="#e7ffff" stroke-width="6"/><circle cx="128" cy="66" r="13" fill="#f5d06f" stroke="#fff3ae" stroke-width="5"/>';
}

function createVectorVisual(itemId) {
  const ocean = /^(sub|prismarine|nautilus|sponge|ink|glow-ink|turtle|clay|amethyst|conduit|coral|heart|chapter-02)/.test(itemId);
  const visualVariant = polarVisualVariant(itemId);
  const quantumVariant = quantumVisualVariant(itemId);
  const polar = Boolean(visualVariant);
  const quantum = Boolean(quantumVariant);
  const a = ocean ? "#26c6da" : polar ? "#c8f4ff" : quantum ? "#70d8ff" : "#7b61ff";
  const b = ocean ? "#063d6b" : polar ? "#1a4d78" : quantum ? "#1c2774" : "#1c214a";
  const glyph = polar ? (itemId.includes("mission") ? "✥" : itemId.includes("part") ? "⬢" : itemId === "polar-icebreaker" ? "⚓" : "❄") : itemId.startsWith("sub") || itemId === "deep-sea-explorer" ? "◈" : itemId.startsWith("station") || itemId === "orbital-science-station" ? "✦" : "◆";
  const art = quantum ? quantumArt(itemId, quantumVariant) : polar ? polarArt(itemId, visualVariant) : `<path d="M42 160 Q128 210 214 160" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="10"/><path d="M48 96 Q128 46 208 96" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="8"/><text x="128" y="155" text-anchor="middle" font-size="102" font-family="Arial" fill="#fff">${glyph}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" data-visual-kind="${quantumVariant || visualVariant || "expansion-generic"}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="256" height="256" rx="42" fill="#10182a"/><circle cx="128" cy="128" r="94" fill="url(#g)" opacity=".92"/>${art}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const EXPANSION_VISUALS = Object.freeze(Object.fromEntries(EXPANSION_ITEM_IDS.map((itemId) => [itemId, Object.freeze({
  src: createVectorVisual(itemId), width: 256, height: 256, alt: `${itemId} 的章节任务图标`, fallbackIcon: "project-art",
  visualVariant: quantumVisualVariant(itemId) || polarVisualVariant(itemId) || "expansion-generic",
  preloadPriority: itemId === "polar-icebreaker" || itemId.includes("explorer") || itemId.includes("station") || itemId === "quantum-communication-satellite" ? "project-final" : itemId.startsWith("icebreaker-part-") || itemId.startsWith("satellite-part-") ? "project-part" : itemId.startsWith("icebreaker-") || /^satellite-\d+$/.test(itemId) ? "project-component" : "lazy"
})])));

const POLAR_PROJECT_VISUALS = Object.freeze(Object.fromEntries(
  CHAPTER_VISUAL_MANIFEST
    .filter(({ chapterId }) => chapterId === "chapter-04")
    .map(({ itemId, filename, alt, preloadPriority, kind }) => [itemId, Object.freeze({
      src: `/assets/items/${filename}`,
      width: 128,
      height: 128,
      alt,
      fallbackIcon: "project-art",
      visualVariant: kind === "mission-badge" ? "polar-mission" : kind === "project-component" ? "polar-component" : kind === "project-part" ? "polar-part" : "polar-final-project",
      preloadPriority
    })])
));

const ARMORED_PROJECT_VISUALS = Object.freeze(Object.fromEntries(
  CHAPTER_VISUAL_MANIFEST
    .filter(({ chapterId }) => chapterId === "chapter-05")
    .map(({ itemId, filename, alt, preloadPriority, kind }) => [itemId, Object.freeze({
      src: `/assets/items/${filename}`,
      width: 128,
      height: 128,
      alt,
      fallbackIcon: "project-art",
      visualVariant: kind === "mission-badge" ? "armor-mission" : kind === "project-component" ? "armor-component" : kind === "project-part" ? "armor-part" : "armor-final-project",
      preloadPriority
    })])
));

function getItemVisual(itemId) {
  const visual = ITEM_VISUALS[itemId] || POLAR_PROJECT_VISUALS[itemId] || ARMORED_PROJECT_VISUALS[itemId] || EXPANSION_VISUALS[itemId];
  return visual ? { ...visual, src: visual.src.replace(/\.png$/, ".webp") } : null;
}

module.exports = { ITEM_VISUALS, EXPANSION_VISUALS, POLAR_PROJECT_VISUALS, ARMORED_PROJECT_VISUALS, getItemVisual };
