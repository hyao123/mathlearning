const SVG_NS = "http://www.w3.org/2000/svg";

const PIXEL_SHAPES = Object.freeze({
  log: [[3, 2, 10, 12, 0], [5, 2, 2, 12, 1], [10, 2, 2, 12, 1], [2, 4, 1, 8, 0]],
  stone: [[4, 2, 7, 2, 1], [2, 5, 12, 6, 0], [4, 12, 8, 2, 1], [5, 6, 2, 2, 1], [10, 9, 2, 2, 1]],
  coal: [[5, 2, 6, 2, 0], [3, 4, 10, 8, 0], [5, 12, 6, 2, 0], [5, 5, 2, 2, 1]],
  ingot: [[4, 3, 8, 2, 1], [2, 5, 12, 6, 0], [4, 11, 8, 2, 1], [5, 6, 6, 2, 1]],
  dust: [[7, 2, 2, 3, 1], [3, 6, 10, 4, 0], [5, 11, 2, 2, 0], [10, 11, 2, 2, 1]],
  gem: [[7, 1, 2, 2, 1], [4, 3, 8, 3, 0], [2, 6, 12, 4, 0], [5, 10, 6, 4, 1]],
  emerald: [[6, 1, 4, 2, 1], [4, 3, 8, 3, 0], [3, 6, 10, 5, 0], [5, 11, 6, 3, 1]],
  diamond: [[6, 1, 4, 2, 1], [3, 3, 10, 4, 0], [5, 7, 6, 6, 0], [7, 13, 2, 2, 1]],
  scrap: [[3, 2, 9, 3, 0], [5, 5, 8, 3, 1], [2, 8, 9, 4, 0], [5, 12, 7, 2, 1]],
  core: [[6, 1, 4, 2, 1], [3, 3, 10, 3, 0], [2, 6, 12, 5, 0], [4, 11, 8, 3, 1], [7, 5, 2, 6, 1]]
});

const SUBMISSION_FEEDBACK = Object.freeze({
  correct: Object.freeze([
    "真棒，线索收集成功！",
    "答得漂亮，继续向下一题出发！",
    "太好了，你的判断很稳！",
    "这一题拿下了，探险能量上升！",
    "思路很清楚，奖励正在装进背包！",
    "好样的，又点亮了一小段路线！"
  ]),
  retry: Object.freeze([
    "别急，勇敢的尝试也在积累经验。",
    "差一点点，换个角度再来一次。",
    "这题还没通过，但你已经找到入口了。",
    "继续试试，探险队需要你的坚持。",
    "先稳住，我们再收集一次线索。",
    "没关系，跳过或再试都能继续前进。"
  ])
});
const CHINESE_NUMERALS = Object.freeze(["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]);

function requireDependencies() {
  const dependencies = {
    AnswerMatcher: globalThis.AnswerMatcher,
    GameItemCatalog: globalThis.GameItemCatalog,
    InventoryModel: globalThis.InventoryModel,
    LevelRewardConfig: globalThis.LevelRewardConfig,
    RewardPresentation: globalThis.RewardPresentation,
    ChapterMissionModel: globalThis.ChapterMissionModel,
    CampaignModel: globalThis.CampaignModel,
    ProgressionModel: globalThis.ProgressionModel,
    ChallengeModel: globalThis.ChallengeModel,
    ContentVersionModel: globalThis.ContentVersionModel,
    SoundEngine: globalThis.SoundEngine,
    QuestionVisualizer: globalThis.QuestionVisualizer,
    HintScaffold: globalThis.HintScaffold,
    AchievementModel: globalThis.AchievementModel || (typeof require === "function" ? require("./achievementModel.js") : null),
    StorageAdapter: globalThis.StorageAdapter || (typeof require === "function" ? require("./storageAdapter.js") : null)
  };
  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency) throw new Error(`${name} is required before GameApp.mount`);
  }
  return dependencies;
}

function createPixelIcon(item, className = "pixel-icon") {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", item.name);
  svg.setAttribute("shape-rendering", "crispEdges");
  svg.setAttribute("class", className);
  const palette = item.icon?.palette || ["#6d58a6", "#f3c969"];
  const pixels = PIXEL_SHAPES[item.icon?.shape] || PIXEL_SHAPES.core;
  pixels.forEach(([x, y, width, height, tone]) => {
    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    rect.setAttribute("fill", palette[tone] || palette[0]);
    svg.append(rect);
  });
  return svg;
}

function createFighterArt(state = "blueprint", className = "fighter-art") {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 260 140");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "J-20 苍穹战机");
  svg.setAttribute("class", className);
  svg.dataset.fighterArt = "j20-sky-fighter";
  svg.dataset.fighterState = state;
  svg.dataset.tacticalMode = "normal";
  const blueprint = state !== "completed";
  const stroke = blueprint ? "#38bdf8" : "#f5d06f";
  const line = blueprint ? "#60a5fa" : "#99f1ff";
  const shadow = blueprint ? "rgba(2, 132, 199, 0.25)" : "rgba(21, 235, 255, 0.55)";
  const add = (tag, attrs = {}, parent = svg) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    parent.append(node);
    return node;
  };
  const addStops = (gradient, stops) => stops.forEach(([offset, color, opacity]) => {
    add("stop", { offset, "stop-color": color, ...(opacity === undefined ? {} : { "stop-opacity": opacity }) }, gradient);
  });
  const defs = add("defs", {});
  const bodyGradient = add("linearGradient", { id: `fighter-body-${state}`, x1: "0%", y1: "0%", x2: "100%", y2: "100%" }, defs);
  addStops(bodyGradient, blueprint
    ? [["0%", "#1e3a8a", 0.55], ["50%", "#0284c7", 0.35], ["100%", "#0369a1", 0.55]]
    : [["0%", "#1e293b"], ["45%", "#0f172a"], ["85%", "#1e293b"], ["100%", "#334155"]]);
  const canopyGradient = add("linearGradient", { id: `fighter-canopy-${state}`, x1: "0%", y1: "0%", x2: "100%", y2: "100%" }, defs);
  addStops(canopyGradient, blueprint
    ? [["0%", "#ffffff", 0.85], ["100%", "#38bdf8", 0.45]]
    : [["0%", "#ffffff"], ["25%", "#fde047"], ["60%", "#ca8a04"], ["90%", "#1e3a8a"], ["100%", "#0f172a"]]);
  const flameGradient = add("radialGradient", { id: `fighter-flame-${state}`, cx: "50%", cy: "50%", r: "70%" }, defs);
  addStops(flameGradient, [["0%", "#ffffff"], ["25%", "#fef08a"], ["50%", "#f97316"], ["80%", "#ef4444"], ["100%", "#7c3aed", 0]]);
  const machGradient = add("linearGradient", { id: `fighter-mach-${state}`, x1: "0%", y1: "50%", x2: "100%", y2: "50%" }, defs);
  addStops(machGradient, [["0%", "#ffffff"], ["40%", "#67e8f9"], ["80%", "#06b6d4"], ["100%", "#3b82f6", 0]]);

  // Technical Runway / Blueprint CAD Drafting Guidelines
  const guide = add("g", {
    opacity: blueprint ? "0.45" : "0.26",
    stroke: blueprint ? "#38bdf8" : "#f5d06f",
    "stroke-width": "1.2",
    "stroke-dasharray": "6 4",
    fill: "none"
  });
  ["M26 70 H238", "M130 12 V128"].forEach((d) => add("path", { d }, guide));
  add("circle", { cx: "130", cy: "70", r: "52", fill: "none", stroke: "#38bdf8", "stroke-width": "0.8", "stroke-dasharray": "5 5", opacity: "0.5" }, guide);

  // Ground Aerodynamic Shadow
  add("ellipse", {
    cx: "130",
    cy: "74",
    rx: "115",
    ry: "36",
    fill: shadow,
    filter: "blur(8px)"
  });

  // Photorealistic High-Resolution Underlay (activated in photo mode)
  if (!blueprint) {
    const photoGroup = add("g", { "data-fighter-detail": "photo-layer", class: "fighter-photo-layer" });
    add("image", {
      href: "/assets/items/j20-sky-fighter-v1.webp",
      x: "12",
      y: "6",
      width: "236",
      height: "128",
      preserveAspectRatio: "xMidYMid slice",
      class: "fighter-realistic-img"
    }, photoGroup);
    add("rect", {
      x: "12",
      y: "6",
      width: "236",
      height: "128",
      rx: "10",
      fill: "none",
      stroke: "#38bdf8",
      "stroke-width": "1.5",
      opacity: "0.8"
    }, photoGroup);
  }

  // Afterburner Plumes (WS-15 Twin Engines with Mach Shock Diamonds & Expansion Rings)
  if (!blueprint) {
    const flames = add("g", { "data-fighter-detail": "afterburner-glow", class: "fighter-afterburner-group" });
    // Upper engine plume
    add("path", { d: "M22 61 C-12 56 -18 64 22 65 C-18 66 -12 74 22 69 Z", fill: `url(#fighter-flame-${state})`, class: "plasma-plume-outer", opacity: "0.95" }, flames);
    add("path", { d: "M20 62 C-2 60 -6 64 20 65 C-6 66 -2 70 20 68 Z", fill: "#ffffff", opacity: "0.92", class: "plasma-plume-core" }, flames);
    // Lower engine plume
    add("path", { d: "M22 71 C-12 66 -18 74 22 75 C-18 76 -12 84 22 79 Z", fill: `url(#fighter-flame-${state})`, class: "plasma-plume-outer", opacity: "0.95" }, flames);
    add("path", { d: "M20 72 C-2 70 -6 74 20 75 C-6 76 -2 80 20 78 Z", fill: "#ffffff", opacity: "0.92", class: "plasma-plume-core" }, flames);

    // 4 Mach shock diamonds
    add("polygon", { points: "16,62.5 19,63.5 16,64.5 13,63.5", fill: `url(#fighter-mach-${state})`, class: "mach-diamond diamond-1" }, flames);
    add("polygon", { points: "8,62.5 11,63.5 8,64.5 5,63.5", fill: `url(#fighter-mach-${state})`, class: "mach-diamond diamond-2" }, flames);
    add("polygon", { points: "16,73.5 19,74.5 16,75.5 13,74.5", fill: `url(#fighter-mach-${state})`, class: "mach-diamond diamond-3" }, flames);
    add("polygon", { points: "8,73.5 11,74.5 8,75.5 5,74.5", fill: `url(#fighter-mach-${state})`, class: "mach-diamond diamond-4" }, flames);

    // 2 Mach shock expansion rings
    add("ellipse", { cx: "14", cy: "63.5", rx: "3", ry: "8", fill: "none", stroke: "#7cf6ff", "stroke-width": "1.2", opacity: "0.85", class: "mach-shock-ring" }, flames);
    add("ellipse", { cx: "14", cy: "74.5", rx: "3", ry: "8", fill: "none", stroke: "#7cf6ff", "stroke-width": "1.2", opacity: "0.85", class: "mach-shock-ring" }, flames);
  }

  // Stealth Airframe Outline & Aerodynamic Surfaces (J-20 True Aerodynamics)
  const airframe = add("g", { "data-fighter-detail": "stealth-airframe" });

  // Rear Canted All-Moving Vertical Stabilizers (外倾全动双垂尾)
  add("polygon", { points: "40,48 10,22 8,28 20,52", fill: blueprint ? "#172554" : "#1e293b", stroke: blueprint ? "#60a5fa" : "#38bdf8", "stroke-width": "1.5" }, airframe);
  add("polygon", { points: "40,92 10,118 8,112 20,88", fill: blueprint ? "#172554" : "#1e293b", stroke: blueprint ? "#60a5fa" : "#38bdf8", "stroke-width": "1.5" }, airframe);

  // Ventral Fins (机腹腹鳍)
  add("polygon", { points: "34,51 14,44 18,52", fill: "#0f172a", stroke: "#0284c7", "stroke-width": "1" }, airframe);
  add("polygon", { points: "34,89 14,96 18,88", fill: "#0f172a", stroke: "#0284c7", "stroke-width": "1" }, airframe);

  // Main Airframe Polygon (Chine Nose + Canards + Large Delta Wing + Twin Engine Nacelles)
  const airframePath = "M246 70 L228 64 L202 60 L182 56 L150 25 L142 26 L148 56 L60 13 L48 14 L42 48 L22 52 L18 60 L24 62 L24 67 L20 70 L24 73 L24 78 L18 80 L22 88 L42 92 L48 126 L60 127 L148 84 L142 114 L150 115 L182 84 L202 80 L228 76 Z";
  add("path", {
    d: airframePath,
    fill: `url(#fighter-body-${state})`,
    stroke,
    "stroke-width": blueprint ? "2" : "2.2",
    "stroke-linejoin": "round"
  }, airframe);

  // Wing Panels & Flaperon Control Surfaces
  add("path", { d: "M146 56 L62 15 M136 56 L66 24 M58 14 L46 48", fill: "none", stroke: blueprint ? "#60a5fa" : "#38bdf8", "stroke-width": "1.2", opacity: "0.75" }, airframe);
  add("path", { d: "M146 84 L62 125 M136 84 L66 116 M58 126 L46 92", fill: "none", stroke: blueprint ? "#60a5fa" : "#38bdf8", "stroke-width": "1.2", opacity: "0.75" }, airframe);

  // Canards Pivot Seams (全动鸭翼转轴缝隙)
  add("line", { x1: "154", y1: "56", x2: "148", y2: "36", stroke, "stroke-width": "1.4", opacity: "0.8" }, airframe);
  add("line", { x1: "154", y1: "84", x2: "148", y2: "104", stroke, "stroke-width": "1.4", opacity: "0.8" }, airframe);

  // Chine Line & DSI Bump Intakes (DSI 蚌条式无附面层隔板进气道)
  add("path", { d: "M242 70 L202 61 L178 57 M242 70 L202 79 L178 83", fill: "none", stroke: "#93c5fd", "stroke-width": "1.4", opacity: "0.9" }, airframe);
  add("path", { d: "M176 57 C168 59 168 65 176 67 M176 83 C168 81 168 75 176 73", fill: "none", stroke: "#38bdf8", "stroke-width": "1.6", opacity: "0.85" }, airframe);

  // Center Fuselage Spine & Engine Nacelle Ridges
  add("line", { x1: "188", y1: "70", x2: "24", y2: "70", stroke: blueprint ? "#60a5fa" : "#64748b", "stroke-width": "1.2", "stroke-dasharray": "6 3" }, airframe);
  add("path", { d: "M120 62 L32 60 M120 78 L32 80", fill: "none", stroke: blueprint ? "#3b82f6" : "#475569", "stroke-width": "1.5" }, airframe);

  // Low-Visibility PLAAF Insignia (八一军徽，低可视度战机涂装)
  if (!blueprint) {
    const insignia = add("g", { opacity: "0.85" }, airframe);
    add("polygon", { points: "92,36 94,40 98,40 95,43 96,47 92,44 88,47 89,43 86,40 90,40", fill: "#ef4444", stroke: "#f5d06f", "stroke-width": "0.6" }, insignia);
    add("polygon", { points: "92,104 94,108 98,108 95,111 96,115 92,112 88,115 89,111 86,108 90,108", fill: "#ef4444", stroke: "#f5d06f", "stroke-width": "0.6" }, insignia);
  }

  // Cockpit Canopy (Water-Bubble Radar Shielded Gold Glass)
  add("path", {
    "data-fighter-detail": "cockpit",
    d: "M228 70 C222 65 204 63 190 64 C184 67 184 73 190 76 C204 77 222 75 228 70 Z",
    fill: `url(#fighter-canopy-${state})`,
    stroke: blueprint ? "#93c5fd" : "#38bdf8",
    "stroke-width": "1.8",
    "stroke-linejoin": "round"
  });
  add("path", {
    d: "M222 69 C216 66 204 65 194 66",
    fill: "none",
    stroke: "#ffffff",
    "stroke-width": "1.8",
    "stroke-linecap": "round",
    opacity: blueprint ? "0.75" : "0.95"
  });

  // Engine Nozzles (WS-15 Twin Stealth Serrated Petals)
  const engines = add("g", { "data-fighter-detail": "engine-nozzles" });
  add("path", { d: "M24 60 L14 59 L12 62 L15 63 L12 65 L14 67 L24 66 Z", fill: blueprint ? "#0f172a" : "#090d16", stroke, "stroke-width": "1.5", "stroke-linejoin": "round" }, engines);
  add("path", { d: "M24 74 L14 73 L12 76 L15 77 L12 79 L14 81 L24 80 Z", fill: blueprint ? "#0f172a" : "#090d16", stroke, "stroke-width": "1.5", "stroke-linejoin": "round" }, engines);
  if (!blueprint) {
    add("circle", { cx: "18", cy: "63", r: "2.5", fill: "#ff8800", opacity: "0.8" }, engines);
    add("circle", { cx: "18", cy: "77", r: "2.5", fill: "#ff8800", opacity: "0.8" }, engines);
  }

  // Hexagonal Energy Shield
  if (!blueprint) {
    const shield = add("g", { "data-fighter-detail": "energy-shield", class: "fighter-energy-shield" });
    const hexPoints = (cx, cy, r) => {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
      }
      return pts.join(" ");
    };
    [
      [140, 70, 42], [90, 50, 24], [90, 90, 24],
      [180, 70, 24], [130, 36, 20], [130, 104, 20],
      [65, 30, 18], [65, 110, 18]
    ].forEach(([hx, hy, hr]) => {
      add("polygon", { points: hexPoints(hx, hy, hr), class: "shield-hex", fill: "rgba(56,189,248,0.05)", stroke: "#38bdf8", "stroke-width": "0.9", opacity: "0.55" }, shield);
    });
  }

  // Tactical HUD Targeting Reticle & Avionics Readouts
  if (!blueprint) {
    const hud = add("g", { "data-fighter-detail": "tactical-hud", class: "fighter-tactical-hud" });
    add("circle", { cx: "215", cy: "70", r: "20", class: "hud-ring-outer", fill: "none", stroke: "#38bdf8", "stroke-width": "1.2", "stroke-dasharray": "6 4", opacity: "0.8" }, hud);
    add("circle", { cx: "215", cy: "70", r: "10", class: "hud-ring-inner", fill: "none", stroke: "#f5d06f", "stroke-width": "1", opacity: "0.85" }, hud);
    add("circle", { cx: "215", cy: "70", r: "2.5", class: "hud-dot", fill: "#ef4444", opacity: "0.9" }, hud);
    add("line", { x1: "192", y1: "70", x2: "199", y2: "70", stroke: "#38bdf8", "stroke-width": "1.4" }, hud);
    add("line", { x1: "231", y1: "70", x2: "238", y2: "70", stroke: "#38bdf8", "stroke-width": "1.4" }, hud);
    add("line", { x1: "215", y1: "47", x2: "215", y2: "54", stroke: "#38bdf8", "stroke-width": "1.4" }, hud);
    add("line", { x1: "215", y1: "86", x2: "215", y2: "93", stroke: "#38bdf8", "stroke-width": "1.4" }, hud);
    const textAttrs = { fill: "#38bdf8", "font-size": "6.5", "font-weight": "800", "font-family": "Consolas, monospace", opacity: "0.85" };
    add("text", { ...textAttrs, x: "188", y: "42" }, hud).textContent = "MACH 2.8+";
    add("text", { ...textAttrs, x: "188", y: "104" }, hud).textContent = "AESA LOCK";
    add("text", { ...textAttrs, x: "85", y: "18", fill: "#f5d06f", "font-family": "Microsoft YaHei UI, sans-serif" }, hud).textContent = "⚡ 威龙巡航态 · 100% 满功率";
  }

  // Formation Nav Beacons
  if (!blueprint) {
    const navLights = add("g", { "data-fighter-detail": "nav-lights", class: "fighter-nav-lights" });
    add("circle", { cx: "54", cy: "13", r: "2.8", class: "nav-beacon nav-beacon--red", fill: "#ef4444" }, navLights);
    add("circle", { cx: "54", cy: "127", r: "2.8", class: "nav-beacon nav-beacon--green", fill: "#22c55e" }, navLights);
    add("circle", { cx: "130", cy: "48", r: "2", class: "nav-beacon nav-beacon--strobe", fill: "#ffffff" }, navLights);
  }

  // X-Ray Internal Skeleton (Avionics, Turbines, Wing Spars)
  if (!blueprint) {
    const xray = add("g", { "data-fighter-detail": "xray-skeleton", class: "fighter-xray-skeleton" });
    add("line", { x1: "90", y1: "54", x2: "75", y2: "25", stroke: "#93c5fd", "stroke-width": "1.5", "stroke-dasharray": "2 2", class: "xray-part xray-part--rib" }, xray);
    add("line", { x1: "110", y1: "54", x2: "95", y2: "25", stroke: "#93c5fd", "stroke-width": "1.5", "stroke-dasharray": "2 2", class: "xray-part xray-part--rib" }, xray);
    add("line", { x1: "90", y1: "86", x2: "75", y2: "115", stroke: "#93c5fd", "stroke-width": "1.5", "stroke-dasharray": "2 2", class: "xray-part xray-part--rib" }, xray);
    add("line", { x1: "110", y1: "86", x2: "95", y2: "115", stroke: "#93c5fd", "stroke-width": "1.5", "stroke-dasharray": "2 2", class: "xray-part xray-part--rib" }, xray);
    add("rect", { x: "168", y: "63", width: "14", height: "14", rx: "2", fill: "rgba(56,189,248,0.2)", stroke: "#38bdf8", "stroke-width": "1.4", class: "xray-part xray-part--avionics" }, xray);
    add("path", { d: "M55 52 L75 42 M55 88 L75 98", fill: "none", stroke: "#a855f7", "stroke-width": "2", class: "xray-part xray-part--stealth" }, xray);
    add("circle", { cx: "42", cy: "63", r: "5", fill: "none", stroke: "#f59e0b", "stroke-width": "1.8", class: "xray-part xray-part--turbine" }, xray);
    add("circle", { cx: "42", cy: "77", r: "5", fill: "none", stroke: "#f59e0b", "stroke-width": "1.8", class: "xray-part xray-part--turbine" }, xray);
  }

  // Interactive Sonic Boom Overdrive
  if (!blueprint) {
    svg.style.cursor = "pointer";
    svg.setAttribute("title", "点击触发超音速加力试车！");
    svg.addEventListener("click", () => {
      globalThis.SoundEngine?.playSuperProjectIgnition?.();
      svg.classList.add("is-supersonic-overdrive");
      const canvas = svg.closest(".assembly-modal")?.querySelector(".assembly-shockwave-canvas");
      if (canvas && globalThis.AssemblyFX?.triggerAssemblyShockwave) {
        globalThis.AssemblyFX.triggerAssemblyShockwave(canvas, {
          colors: ["#ffe600", "#00ffff", "#ffffff", "#ff4400"],
          count: 70
        });
      }
      setTimeout(() => svg.classList.remove("is-supersonic-overdrive"), 850);
    });
  }

  return svg;
}

function createSubmersibleArt(state = "blueprint", className = "") {
  const blueprint = state === "blueprint";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 280 140");
  svg.setAttribute("class", `submersible-art ${className} ${blueprint ? "is-blueprint" : "is-completed"}`);
  svg.dataset.submersibleArt = "deep-sea-explorer";
  svg.dataset.projectHero = "deep-sea-explorer";
  svg.dataset.projectState = state;

  const add = (tag, attrs = {}, parent = svg) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    parent.append(el);
    return el;
  };

  const defs = add("defs");
  // Hull gradient
  const hullGrad = add("linearGradient", { id: `sub-hull-${state}`, x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
  add("stop", { offset: "0%", "stop-color": blueprint ? "#0e2946" : "#1e476b" }, hullGrad);
  add("stop", { offset: "50%", "stop-color": blueprint ? "#071c32" : "#0d2b45" }, hullGrad);
  add("stop", { offset: "100%", "stop-color": blueprint ? "#041222" : "#06182a" }, hullGrad);

  // Pressure Sphere gradient (Titanium cabin)
  const sphereGrad = add("linearGradient", { id: `sub-sphere-${state}`, x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
  add("stop", { offset: "0%", "stop-color": blueprint ? "#164e63" : "#38bdf8" }, sphereGrad);
  add("stop", { offset: "60%", "stop-color": blueprint ? "#0e3346" : "#0f3458" }, sphereGrad);
  add("stop", { offset: "100%", "stop-color": blueprint ? "#071c2a" : "#081d33" }, sphereGrad);

  // Searchlight beam gradient
  const beamGrad = add("linearGradient", { id: `sub-beam-${state}`, x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
  add("stop", { offset: "0%", "stop-color": "#38bdf8", "stop-opacity": blueprint ? "0.3" : "0.55" }, beamGrad);
  add("stop", { offset: "35%", "stop-color": "#22d3ee", "stop-opacity": blueprint ? "0.15" : "0.3" }, beamGrad);
  add("stop", { offset: "100%", "stop-color": "#0ea5e9", "stop-opacity": "0" }, beamGrad);

  // Viewport glow gradient
  const glassGrad = add("linearGradient", { id: `sub-glass-${state}`, x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
  add("stop", { offset: "0%", "stop-color": "#e0f2fe" }, glassGrad);
  add("stop", { offset: "50%", "stop-color": "#06b6d4" }, glassGrad);
  add("stop", { offset: "100%", "stop-color": "#083344" }, glassGrad);

  const stroke = blueprint ? "#22d3ee" : "#38bdf8";

  // Background coordinate grid & sonar sweep
  const bg = add("g", { class: "sub-ocean-grid" });
  for (let x = 20; x < 280; x += 20) {
    add("line", { x1: String(x), y1: "0", x2: String(x), y2: "140", stroke: blueprint ? "#0e334d" : "#0a2640", "stroke-width": "0.5", opacity: "0.5" }, bg);
  }
  for (let y = 20; y < 140; y += 20) {
    add("line", { x1: "0", y1: String(y), x2: "280", y2: String(y), stroke: blueprint ? "#0e334d" : "#0a2640", "stroke-width": "0.5", opacity: "0.5" }, bg);
  }

  // Sonar Rings from bow sensor
  const sonar = add("g", { class: "sub-sonar-waves" });
  [30, 60, 95].forEach((r, idx) => {
    add("circle", { cx: "220", cy: "70", r: String(r), fill: "none", stroke: "#22d3ee", "stroke-width": "0.9", "stroke-dasharray": "4 4", class: `sonar-ring ring-${idx + 1}` }, sonar);
  });

  // Photorealistic High-Resolution Underlay (activated in photo mode)
  if (!blueprint) {
    const photoGroup = add("g", { "data-sub-detail": "photo-layer", class: "submersible-photo-layer" });
    add("image", {
      href: "/assets/items/deep-sea-explorer-v2.webp",
      x: "15",
      y: "8",
      width: "250",
      height: "124",
      preserveAspectRatio: "xMidYMid slice",
      class: "submersible-realistic-img"
    }, photoGroup);
    add("rect", {
      x: "15",
      y: "8",
      width: "250",
      height: "124",
      rx: "10",
      fill: "none",
      stroke: "#22d3ee",
      "stroke-width": "1.5",
      opacity: "0.8"
    }, photoGroup);
  }

  // Searchlight Cones
  const lights = add("g", { class: "sub-searchlights" });
  // Upper searchlight beam
  add("polygon", { points: "216,56 280,24 280,72 222,62", fill: `url(#sub-beam-${state})`, class: "searchlight-beam beam-upper" }, lights);
  // Lower searchlight beam
  add("polygon", { points: "216,84 280,68 280,116 222,78", fill: `url(#sub-beam-${state})`, class: "searchlight-beam beam-lower" }, lights);

  // Cavitation bubbles trailing from aft thrusters
  const bubbles = add("g", { class: "sub-cavitation-bubbles" });
  [
    [40, 50, 2.5], [26, 47, 1.8], [14, 53, 3],
    [40, 90, 2.5], [24, 93, 2], [10, 87, 3.2],
    [32, 70, 2], [18, 68, 1.5]
  ].forEach(([bx, by, br]) => {
    add("circle", { cx: String(bx), cy: String(by), r: String(br), fill: "none", stroke: "#7dd3fc", "stroke-width": "0.9", opacity: "0.75", class: "cavitation-bubble" }, bubbles);
  });

  // Main Submersible Structure Group
  const hullGroup = add("g", { class: "sub-hull-group" });

  // Streamlined Hydrodynamic Body Shroud
  const bodyPath = "M46 54 C46 38 76 28 135 28 C185 28 222 44 232 70 C222 96 185 112 135 112 C76 112 46 102 46 86 Z";
  add("path", {
    d: bodyPath,
    fill: `url(#sub-hull-${state})`,
    stroke,
    "stroke-width": blueprint ? "2" : "2.2",
    "stroke-linejoin": "round"
  }, hullGroup);

  // Ballast Tanks & Flanges
  add("path", { d: "M75 34 C120 30 170 34 200 45 L190 56 C165 48 120 45 75 48 Z", fill: blueprint ? "#082138" : "#164e63", stroke: blueprint ? "#22d3ee" : "#38bdf8", "stroke-width": "1.2" }, hullGroup);
  add("path", { d: "M75 106 C120 110 170 106 200 95 L190 84 C165 92 120 95 75 92 Z", fill: blueprint ? "#082138" : "#164e63", stroke: blueprint ? "#22d3ee" : "#38bdf8", "stroke-width": "1.2" }, hullGroup);

  // Titanium Spherical Cabin (Center-Forward)
  const sphere = add("g", { class: "sub-pressure-sphere" }, hullGroup);
  add("circle", { cx: "172", cy: "70", r: "26", fill: `url(#sub-sphere-${state})`, stroke: blueprint ? "#67e8f9" : "#0284c7", "stroke-width": "2" }, sphere);
  // Spherical Cabin Bolt Pattern
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    const rx = 172 + 22 * Math.cos(a);
    const ry = 70 + 22 * Math.sin(a);
    add("circle", { cx: rx.toFixed(1), cy: ry.toFixed(1), r: "1.2", fill: "#f5d06f", opacity: "0.8" }, sphere);
  }

  // Viewports
  const viewports = add("g", { class: "sub-viewports" }, hullGroup);
  // Main forward viewing port
  add("ellipse", { cx: "216", cy: "70", rx: "9", ry: "13", fill: `url(#sub-glass-${state})`, stroke: "#facc15", "stroke-width": "1.8" }, viewports);
  add("ellipse", { cx: "214", cy: "68", rx: "6", ry: "9", fill: "none", stroke: "#ffffff", "stroke-width": "1.2", opacity: "0.9" }, viewports);
  // Upper and lower observation ports
  add("ellipse", { cx: "188", cy: "50", rx: "5", ry: "6", fill: `url(#sub-glass-${state})`, stroke: stroke, "stroke-width": "1.2" }, viewports);
  add("ellipse", { cx: "188", cy: "90", rx: "5", ry: "6", fill: `url(#sub-glass-${state})`, stroke: stroke, "stroke-width": "1.2" }, viewports);

  // Dive Wings & Horizontal Stabilizers
  const stabilizers = add("g", { class: "sub-stabilizers" }, hullGroup);
  add("polygon", { points: "115,28 92,12 120,14 138,28", fill: blueprint ? "#071f34" : "#1e3a5f", stroke: stroke, "stroke-width": "1.4" }, stabilizers);
  add("polygon", { points: "115,112 92,128 120,126 138,112", fill: blueprint ? "#071f34" : "#1e3a5f", stroke: stroke, "stroke-width": "1.4" }, stabilizers);
  // Stabilizer lights
  if (!blueprint) {
    add("circle", { cx: "106", cy: "13", r: "2.5", fill: "#ef4444" }, stabilizers); // Port red
    add("circle", { cx: "106", cy: "127", r: "2.5", fill: "#22c55e" }, stabilizers); // Starboard green
  }

  // Sail Tower & Communication Antenna
  const tower = add("g", { class: "sub-sail-tower" }, hullGroup);
  add("path", { d: "M130 28 L142 16 L158 16 L164 28 Z", fill: blueprint ? "#0c2842" : "#0f375c", stroke, "stroke-width": "1.4" }, tower);
  add("line", { x1: "150", y1: "16", x2: "150", y2: "6", stroke: "#facc15", "stroke-width": "1.5" }, tower);
  add("circle", { cx: "150", cy: "6", r: "2", fill: "#ef4444", class: "sub-beacon-light" }, tower);

  // Articulated Hydraulic Robotic Arm (Below Front)
  const roboticArm = add("g", { class: "sub-robotic-arm" }, hullGroup);
  add("circle", { cx: "186", cy: "104", r: "4", fill: "#facc15", stroke: "#0f172a", "stroke-width": "1" }, roboticArm); // Shoulder
  add("line", { x1: "186", y1: "104", x2: "208", y2: "118", stroke: stroke, "stroke-width": "3", "stroke-linecap": "round" }, roboticArm); // Upper arm
  add("circle", { cx: "208", cy: "118", r: "3", fill: "#38bdf8" }, roboticArm); // Elbow
  add("line", { x1: "208", y1: "118", x2: "228", y2: "114", stroke: "#f5d06f", "stroke-width": "2.5", "stroke-linecap": "round" }, roboticArm); // Forearm
  add("path", { d: "M228 112 L236 109 M228 116 L236 119", stroke: "#ffffff", "stroke-width": "2", "stroke-linecap": "round" }, roboticArm); // Claw
  // Specimen canister held by claw
  add("rect", { x: "235", y: "110", width: "8", height: "8", rx: "2", fill: "#00e5ff", stroke: "#ffffff", "stroke-width": "1" }, roboticArm);

  // Ducted Vector Thrusters (Stern)
  const thrusters = add("g", { class: "sub-thrusters" }, hullGroup);
  // Upper ducted thruster
  add("rect", { x: "32", y: "42", width: "22", height: "18", rx: "3", fill: "#071c30", stroke, "stroke-width": "1.5" }, thrusters);
  add("ellipse", { cx: "32", cy: "51", rx: "3", ry: "8", fill: "#04101e", stroke: "#38bdf8", "stroke-width": "1" }, thrusters);
  add("line", { x1: "36", y1: "44", x2: "36", y2: "58", stroke: "#f5d06f", "stroke-width": "2" }, thrusters);
  // Lower ducted thruster
  add("rect", { x: "32", y: "80", width: "22", height: "18", rx: "3", fill: "#071c30", stroke, "stroke-width": "1.5" }, thrusters);
  add("ellipse", { cx: "32", cy: "89", rx: "3", ry: "8", fill: "#04101e", stroke: "#38bdf8", "stroke-width": "1" }, thrusters);
  add("line", { x1: "36", y1: "82", x2: "36", y2: "96", stroke: "#f5d06f", "stroke-width": "2" }, thrusters);

  // Tactical HUD Telemetry
  if (!blueprint) {
    const hud = add("g", { class: "sub-tactical-hud" });
    const textAttrs = { fill: "#38bdf8", "font-size": "6.5", "font-weight": "800", "font-family": "Consolas, monospace", opacity: "0.9" };
    add("text", { ...textAttrs, x: "22", y: "22", fill: "#facc15", "font-family": "Microsoft YaHei UI, sans-serif" }, hud).textContent = "◈ 奋斗者号深潜态 · 万米自适应";
    add("text", { ...textAttrs, x: "172", y: "22" }, hud).textContent = "DEPTH: 10,909m";
    add("text", { ...textAttrs, x: "172", y: "134" }, hud).textContent = "SONAR: 4.2kHz PING";
    add("text", { ...textAttrs, x: "22", y: "134" }, hud).textContent = "BALLAST: 100% OK";

    // Depth bar
    add("rect", { x: "266", y: "25", width: "3", height: "90", fill: "#0c2842", stroke: "#38bdf8", "stroke-width": "0.6" }, hud);
    add("rect", { x: "266", y: "90", width: "3", height: "25", fill: "#22d3ee" }, hud);
  }

  // Interactive Click (Dive Pulse)
  if (!blueprint) {
    svg.style.cursor = "pointer";
    svg.setAttribute("title", "点击触发万米深潜声呐脉冲！");
    svg.addEventListener("click", () => {
      globalThis.SoundEngine?.playSuperProjectIgnition?.();
      svg.classList.add("is-deepsea-dive");
      const canvas = svg.closest(".assembly-modal")?.querySelector(".assembly-shockwave-canvas");
      if (canvas && globalThis.AssemblyFX?.triggerAssemblyShockwave) {
        globalThis.AssemblyFX.triggerAssemblyShockwave(canvas, {
          colors: ["#00ffff", "#38bdf8", "#ffffff", "#facc15"],
          count: 70
        });
      }
      setTimeout(() => svg.classList.remove("is-deepsea-dive"), 850);
    });
  }

  return svg;
}

const PROJECT_ART_SPECS = Object.freeze({
  "j20-frame-rib": { shape: "rib", a: "#9cc7ff", b: "#345f91", label: "肋" },
  "j20-wing-spar": { shape: "spar", a: "#a7d7ff", b: "#47789e", label: "翼" },
  "j20-skin-panel": { shape: "panel", a: "#c7d4df", b: "#5b6d82", label: "蒙" },
  "j20-sensor-array": { shape: "sensor", a: "#9ff4ff", b: "#315a93", label: "感" },
  "j20-flight-computer": { shape: "chip", a: "#ff7c8f", b: "#6b2c55", label: "控" },
  "j20-radar-dish": { shape: "dish", a: "#76e3ff", b: "#27527c", label: "雷" },
  "j20-absorbing-coat": { shape: "coat", a: "#3c4760", b: "#111827", label: "隐" },
  "j20-weapon-rail": { shape: "rail", a: "#f5d06f", b: "#8a5a18", label: "挂" },
  "j20-edge-flap": { shape: "flap", a: "#8ef0ff", b: "#4c5cff", label: "边" },
  "j20-turbine-ring": { shape: "ring", a: "#ffb86a", b: "#4a2c4f", label: "涡" },
  "j20-vector-vane": { shape: "vane", a: "#d1b5ff", b: "#4d37a5", label: "矢" },
  "j20-energy-bus": { shape: "bus", a: "#fff089", b: "#d1562c", label: "能" },
  "j20-airframe": { shape: "airframe", a: "#9cc7ff", b: "#16213e", label: "机身" },
  "j20-avionics": { shape: "avionics", a: "#7ff4ff", b: "#23345f", label: "航电" },
  "j20-stealth-wing": { shape: "stealthWing", a: "#a992ff", b: "#15192c", label: "隐翼" },
  "j20-vector-engine": { shape: "engine", a: "#ffcf6a", b: "#2a1f37", label: "动力" }
});

function createProjectItemArt(item, className = "project-art") {
  const spec = PROJECT_ART_SPECS[item.id];
  if (!spec) return null;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", item.name);
  svg.setAttribute("class", className);
  svg.dataset.projectArt = item.id;
  svg.dataset.projectArtType = item.category === "j20-part" ? "part" : "component";
  const add = (tag, attrs = {}, parent = svg) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    parent.append(node);
    return node;
  };
  const defs = add("defs");
  const gradient = add("linearGradient", { id: `project-art-${item.id}`, x1: "12%", y1: "0%", x2: "88%", y2: "100%" }, defs);
  [[0, spec.a], [0.55, "#ffffff"], [1, spec.b]].forEach(([offset, color]) => add("stop", { offset, "stop-color": color }, gradient));
  add("rect", { x: "4", y: "4", width: "56", height: "56", rx: "10", fill: "#111827", stroke: spec.a, "stroke-width": "2.5" });
  add("path", { d: "M10 48 L54 16", stroke: spec.a, "stroke-width": "1.4", opacity: "0.28" });
  add("path", { d: "M11 18 H53 M11 32 H53 M11 46 H53", stroke: "#ffffff", "stroke-width": "1", opacity: "0.12" });
  const fill = `url(#project-art-${item.id})`;
  const stroke = "#f5d06f";
  const common = { fill, stroke, "stroke-width": "2.4", "stroke-linejoin": "round", "stroke-linecap": "round" };
  if (spec.shape === "rib") {
    add("path", { d: "M18 48 C24 28 32 17 46 12 L50 19 C38 25 31 36 27 52 Z", ...common });
    add("path", { d: "M27 42 L43 31 M31 34 L47 22", stroke: "#fff", "stroke-width": "2", opacity: "0.68" });
  } else if (spec.shape === "spar") {
    add("path", { d: "M12 36 L52 18 L42 34 L52 46 Z", ...common });
    add("path", { d: "M20 36 H47", stroke: "#fff", "stroke-width": "2", opacity: "0.65" });
  } else if (spec.shape === "panel") {
    add("path", { d: "M15 19 L46 13 L52 42 L20 51 Z", ...common });
    add("path", { d: "M24 24 L43 20 M26 35 L47 31 M29 45 L45 41", stroke: "#fff", "stroke-width": "1.8", opacity: "0.55" });
  } else if (spec.shape === "sensor") {
    add("circle", { cx: "32", cy: "32", r: "15", ...common });
    add("circle", { cx: "32", cy: "32", r: "6", fill: "#fff", opacity: "0.8" });
    add("path", { d: "M13 32 H20 M44 32 H51 M32 13 V20 M32 44 V51", stroke: spec.a, "stroke-width": "2.2" });
  } else if (spec.shape === "chip") {
    add("rect", { x: "18", y: "18", width: "28", height: "28", rx: "4", ...common });
    add("path", { d: "M24 12 V18 M32 12 V18 M40 12 V18 M24 46 V52 M32 46 V52 M40 46 V52 M12 24 H18 M12 32 H18 M12 40 H18 M46 24 H52 M46 32 H52 M46 40 H52", stroke: spec.a, "stroke-width": "2" });
    add("path", { d: "M25 32 H39 M32 25 V39", stroke: "#fff", "stroke-width": "2", opacity: "0.75" });
  } else if (spec.shape === "dish") {
    add("path", { d: "M16 18 C34 19 46 28 50 46 C32 44 21 34 16 18 Z", ...common });
    add("path", { d: "M22 23 C34 26 41 33 45 43 M18 50 L32 38", stroke: "#fff", "stroke-width": "2", opacity: "0.65" });
  } else if (spec.shape === "coat") {
    add("path", { d: "M16 18 L48 14 L44 48 L20 52 Z", ...common });
    add("path", { d: "M20 24 C29 30 38 29 46 21 M19 36 C28 42 37 41 45 33", stroke: "#7ff4ff", "stroke-width": "2", opacity: "0.72" });
  } else if (spec.shape === "rail") {
    add("path", { d: "M14 25 H50 L45 39 H19 Z", ...common });
    add("path", { d: "M20 18 H44 M22 46 H42", stroke: spec.a, "stroke-width": "4" });
  } else if (spec.shape === "flap") {
    add("path", { d: "M13 42 L51 16 L43 45 Z", ...common });
    add("path", { d: "M22 40 L42 25 M29 44 L47 31", stroke: "#fff", "stroke-width": "2", opacity: "0.65" });
  } else if (spec.shape === "ring") {
    add("circle", { cx: "32", cy: "32", r: "18", ...common });
    add("circle", { cx: "32", cy: "32", r: "9", fill: "#111827", stroke: "#fff", "stroke-width": "2", opacity: "0.9" });
    add("path", { d: "M32 14 V23 M32 41 V50 M14 32 H23 M41 32 H50", stroke: "#fff", "stroke-width": "2" });
  } else if (spec.shape === "vane") {
    add("path", { d: "M16 48 L30 15 L39 31 L51 17 L44 50 L32 39 Z", ...common });
    add("path", { d: "M30 16 L32 39 M39 31 L44 50", stroke: "#fff", "stroke-width": "1.8", opacity: "0.7" });
  } else if (spec.shape === "bus") {
    add("path", { d: "M16 32 H48 M31 15 L22 33 H34 L28 50 L44 27 H32 Z", fill, stroke, "stroke-width": "2.4", "stroke-linejoin": "round" });
    add("circle", { cx: "16", cy: "32", r: "4", fill: spec.a });
    add("circle", { cx: "48", cy: "32", r: "4", fill: spec.a });
  } else if (spec.shape === "airframe") {
    add("path", { d: "M52 32 L39 24 L25 13 L17 19 L25 32 L17 45 L25 51 L39 40 Z", ...common });
    add("path", { d: "M22 32 H48 M28 18 L35 30 M28 46 L35 34", stroke: "#fff", "stroke-width": "2", opacity: "0.65" });
  } else if (spec.shape === "avionics") {
    add("rect", { x: "16", y: "18", width: "32", height: "28", rx: "5", ...common });
    add("circle", { cx: "26", cy: "32", r: "5", fill: "#fff", opacity: "0.75" });
    add("path", { d: "M37 25 C45 30 45 35 37 40 M40 20 C52 28 52 37 40 45", fill: "none", stroke: "#7ff4ff", "stroke-width": "2" });
  } else if (spec.shape === "stealthWing") {
    add("path", { d: "M10 38 L54 15 L45 39 L54 49 L28 45 Z", ...common });
    add("path", { d: "M20 38 H48 M30 31 L45 39", stroke: "#fff", "stroke-width": "2", opacity: "0.64" });
  } else if (spec.shape === "engine") {
    add("path", { d: "M18 20 H43 L52 32 L43 44 H18 L27 32 Z", ...common });
    add("circle", { cx: "42", cy: "32", r: "8", fill: "#111827", stroke: "#ffcf6a", "stroke-width": "2.3" });
    add("path", { d: "M12 25 C3 29 3 35 12 39", fill: "none", stroke: "#ff8a45", "stroke-width": "4", "stroke-linecap": "round" });
  }
  add("text", {
    x: "32",
    y: "58",
    fill: "#f5d06f",
    "font-size": spec.label.length > 1 ? "7" : "9",
    "font-weight": "900",
    "text-anchor": "middle",
    "font-family": "Microsoft YaHei UI, sans-serif"
  }).textContent = spec.label;
  return svg;
}

function createItemIcon(item, className = "pixel-icon", options = {}) {
  const visual = globalThis.ItemVisuals?.getItemVisual?.(item.id);
  if (visual) {
    const image = document.createElement("img");
    image.src = visual.src;
    image.width = visual.width;
    image.height = visual.height;
    image.alt = visual.alt;
    image.className = `${className} item-visual`;
    image.decoding = "async";
    const eagerVisual = options.priority === "high" || ["final-project", "project-final"].includes(visual.preloadPriority);
    image.loading = eagerVisual ? "eager" : "lazy";
    image.fetchPriority = eagerVisual ? "high" : "low";
    image.dataset.itemVisual = item.id;
    if (item.category?.endsWith("-component") || item.category?.endsWith("-part")) {
      image.dataset.projectArt = item.id;
      image.dataset.projectArtType = item.category.endsWith("-part") ? "part" : "component";
    }
    if (item.id === "j20-sky-fighter") {
      image.dataset.fighterArt = item.id;
      image.dataset.fighterState = "completed";
    }
    image.addEventListener("error", () => image.replaceWith(item.id === "j20-sky-fighter"
      ? createFighterArt("completed", `${className} fighter-art--item`)
      : createPixelIcon(item, className)), { once: true });
    return image;
  }
  if (item.id === "j20-sky-fighter") return createFighterArt("completed", `${className} fighter-art--item`);
  return createProjectItemArt(item, `${className} project-art--item`) || createPixelIcon(item, className);
}

function createProjectHeroArt(project, item, state = "blueprint") {
  if (project.id === "j20-sky-fighter") return createFighterArt(state, "fighter-art fighter-art--blueprint");
  if (project.id === "deep-sea-explorer") return createSubmersibleArt(state, "submersible-art submersible-art--blueprint");
  const hero = createItemIcon(item, "project-hero");
  hero.dataset.projectHero = project.id;
  hero.dataset.projectState = state;
  return hero;
}

function appendText(parent, tagName, text, className) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function pickFeedbackText(type) {
  const entries = SUBMISSION_FEEDBACK[type] || SUBMISSION_FEEDBACK.retry;
  return entries[Math.floor(Math.random() * entries.length)];
}

function createSubmissionFeedback(type) {
  return { type, text: pickFeedbackText(type) };
}

function appendItem(parent, item, quantity, className = "item-chip") {
  const chip = document.createElement("div");
  chip.className = className;
  chip.dataset.itemId = item.id;
  chip.append(createItemIcon(item));
  const copy = document.createElement("span");
  appendText(copy, "strong", item.name);
  appendText(copy, "small", `× ${quantity}`);
  chip.append(copy);
  parent.append(chip);
  return chip;
}

function getRewardStatusText(transaction) {
  if (transaction.previewKind === "random-option") return `随机池 · 可能获得 × ${transaction.requestedQuantity}`;
  if (transaction.status === "already-owned") return "已拥有，不会重复获得";
  if (transaction.status === "stack-capped") return "已达堆叠上限，不会新增";
  const rewardTypes = transaction.rewardTypes || [transaction.rewardType];
  const label = rewardTypes.includes("fixed") && rewardTypes.includes("random")
    ? "固定 + 随机奖励"
    : rewardTypes.includes("random")
      ? "随机奖励"
      : "固定奖励";
  return `${label} × ${transaction.awardedQuantity}`;
}

function appendRewardOutcome(parent, item, transaction, className = "reward-chip") {
  const chip = document.createElement("div");
  chip.className = className;
  chip.dataset.itemId = item.id;
  chip.dataset.rewardStatus = transaction.status;
  chip.dataset.rewardType = transaction.rewardType || "fixed";
  if (transaction.previewKind === "random-option") chip.dataset.randomRewardOption = "";
  const highPriority = parent.matches?.("[data-reward-preview], [data-reward-popover]") || parent.closest?.("[data-reward-preview], [data-reward-popover]");
  chip.append(createItemIcon(item, "pixel-icon", { priority: highPriority ? "high" : "auto" }));
  const copy = document.createElement("span");
  appendText(copy, "strong", item.name);
  appendText(copy, "small", getRewardStatusText(transaction));
  chip.append(copy);
  parent.append(chip);
  return chip;
}

function getLevelNumber(chapter, levelId) {
  return chapter.levels.findIndex((level) => level.levelId === levelId) + 1;
}

function getStoredScreen(serialized) {
  try {
    const stored = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
    return ["map", "settlement", "recovery-challenge"].includes(stored?.lastScreen) ? stored.lastScreen : null;
  } catch {
    return null;
  }
}

function getStoredAnswerDraft(serialized) {
  try {
    const stored = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
    return typeof stored?.activeAnswerDraft === "string" ? stored.activeAnswerDraft : "";
  } catch {
    return "";
  }
}


function createDossierCard(project, state, options = {}) {
  const itemCatalog = options.itemCatalog || globalThis.GameItemCatalog;
  const finalItem = itemCatalog?.getItem?.(project.id) || { id: project.id, name: project.name };
  const card = document.createElement("article");
  card.className = "assembly-dossier-card";
  card.dataset.assemblyDossier = project.id;

  const holoFoil = document.createElement("div");
  holoFoil.className = "assembly-dossier-holo-layer";
  card.append(holoFoil);

  const header = document.createElement("header");
  header.className = "assembly-dossier-card__header";
  appendText(header, "span", "🎖️ 共和国大国重器工程档案", "assembly-dossier-card__tag");
  const serialNo = `NO. ${project.id.toUpperCase()}-2026-CH${options.chapterNumber || "01"}`;
  appendText(header, "span", serialNo, "assembly-dossier-card__serial");
  card.append(header);

  const heroWrapper = document.createElement("div");
  heroWrapper.className = "assembly-dossier-card__hero-wrap";
  heroWrapper.append(createProjectHeroArt(project, finalItem, "completed"));
  card.append(heroWrapper);

  const seal = document.createElement("div");
  seal.className = "assembly-dossier-card__seal";
  seal.innerHTML = `
    <span class="seal-star">★ ★ ★</span>
    <span class="seal-title">大国重器</span>
    <span class="seal-text">工程验收合格</span>
    <span class="seal-grade">TOP CLASS</span>
  `;
  card.append(seal);

  const body = document.createElement("div");
  body.className = "assembly-dossier-card__body";
  appendText(body, "h3", `「 ${project.name} · 总装完成 」`, "assembly-dossier-card__title");
  appendText(body, "p", project.description || "全算法知识路线贯通，四大核心模块完美咬合，算力矩阵 100% 满负荷驱动。", "assembly-dossier-card__desc");

  const radarWrap = document.createElement("div");
  radarWrap.className = "assembly-dossier-card__radar-section";
  radarWrap.innerHTML = `
    <div class="radar-header">
      <span class="radar-title">📊 五维战力算法全息评估</span>
      <span class="radar-score">综合战力指数: 99.8 巅峰级</span>
    </div>
    <div class="radar-metrics-grid">
      <div class="radar-metric"><span>极速巡航</span><strong>98</strong><div class="metric-bar"><div class="metric-fill" style="width:98%"></div></div></div>
      <div class="radar-metric"><span>隐身吸波</span><strong>99</strong><div class="metric-bar"><div class="metric-fill" style="width:99%"></div></div></div>
      <div class="radar-metric"><span>算法算力</span><strong>100</strong><div class="metric-bar"><div class="metric-fill" style="width:100%"></div></div></div>
      <div class="radar-metric"><span>超机动性</span><strong>97</strong><div class="metric-bar"><div class="metric-fill" style="width:97%"></div></div></div>
      <div class="radar-metric"><span>全态感知</span><strong>100</strong><div class="metric-bar"><div class="metric-fill" style="width:100%"></div></div></div>
    </div>
  `;
  body.append(radarWrap);

  const specsGrid = document.createElement("div");
  specsGrid.className = "assembly-dossier-card__specs";
  const specs = [
    { label: "工程代号", val: project.name.split(" ")[0] || "重器" },
    { label: "算法算力", val: "100% 满负荷" },
    { label: "核心部件", val: "4 / 4 完美拼装" },
    { label: "建造评级", val: "⭐⭐⭐ 卓越总师" }
  ];
  specs.forEach(({ label, val }) => {
    const item = document.createElement("div");
    item.className = "assembly-dossier-spec";
    appendText(item, "span", label, "assembly-dossier-spec__label");
    appendText(item, "strong", val, "assembly-dossier-spec__val");
    specsGrid.append(item);
  });
  body.append(specsGrid);
  card.append(body);

  const actions = document.createElement("footer");
  actions.className = "assembly-dossier-card__actions";

  const reigniteBtn = appendText(actions, "button", "🚀 试车巡航 / 再次点火", "pixel-button pixel-button--secondary assembly-action-reignite");
  reigniteBtn.type = "button";
  reigniteBtn.dataset.assemblyReignite = project.id;

  const completeBtn = appendText(actions, "button", "🏆 验收完成 · 凯旋入库", "pixel-button pixel-button--primary assembly-action-finish");
  completeBtn.type = "button";
  completeBtn.dataset.assemblyFinish = project.id;

  card.append(actions);
  return card;
}

function createAssemblySequenceModal(project, parts, state, options = {}) {
  const modal = document.createElement("div");
  modal.className = "assembly-modal";
  modal.dataset.assemblyModal = project.id;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", `${project.name}终极组装大典`);

  const backdrop = document.createElement("div");
  backdrop.className = "assembly-modal__backdrop";
  modal.append(backdrop);

  const hud = document.createElement("header");
  hud.className = "assembly-modal__hud";
  const hudLeft = document.createElement("div");
  hudLeft.className = "assembly-modal__hud-left";
  appendText(hudLeft, "span", "⚙️ 大国装备总装车间 · 终极组装序列", "assembly-modal__title-badge");
  appendText(hudLeft, "h2", project.name, "assembly-modal__hud-title");
  hud.append(hudLeft);

  const stepsBar = document.createElement("div");
  stepsBar.className = "assembly-modal__steps";
  [
    { id: 1, label: "舱段咬合" },
    { id: 2, label: "回路走线" },
    { id: 3, label: "动力觉醒" },
    { id: 4, label: "典藏档案" }
  ].forEach((step) => {
    const stepEl = document.createElement("span");
    stepEl.className = "assembly-modal__step-pill";
    stepEl.dataset.assemblyStepPill = step.id;
    stepEl.textContent = `${step.id}. ${step.label}`;
    stepsBar.append(stepEl);
  });
  hud.append(stepsBar);

  const backBtn = appendText(hud, "button", "⬅️ 返回", "assembly-modal__back-btn assembly-modal__skip-btn");
  backBtn.type = "button";
  backBtn.title = "返回上一页面 (Esc)";
  backBtn.dataset.assemblyBack = "";
  backBtn.dataset.assemblyClose = "";
  backBtn.dataset.assemblySkip = "";
  modal.append(hud);

  const stage = document.createElement("div");
  stage.className = "assembly-modal__stage";
  stage.dataset.assemblyStage = "1";

  const scanner = document.createElement("div");
  scanner.className = "assembly-stage-scanner";
  stage.append(scanner);

  const finalItem = globalThis.GameItemCatalog?.getItem?.(project.id) || { id: project.id, name: project.name };
  const coreAssembly = document.createElement("div");
  coreAssembly.className = "assembly-core-target";
  coreAssembly.append(createProjectHeroArt(project, finalItem, "completed"));

  const laserOverlay = document.createElementNS(SVG_NS, "svg");
  laserOverlay.setAttribute("viewBox", "0 0 400 240");
  laserOverlay.setAttribute("class", "assembly-laser-overlay");
  laserOverlay.innerHTML = `
    <defs>
      <linearGradient id="laser-glow-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00ffff" stop-opacity="0" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="1" />
        <stop offset="100%" stop-color="#00ffff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="laser-glow-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffe600" />
        <stop offset="100%" stop-color="#ff7700" />
      </linearGradient>
    </defs>
    <path class="laser-circuit-path path-1" d="M 40 120 L 120 120 L 160 80 L 240 80 L 280 120 L 360 120" />
    <path class="laser-circuit-path path-2" d="M 80 40 L 140 90 L 260 90 L 320 40" />
    <path class="laser-circuit-path path-3" d="M 80 200 L 140 150 L 260 150 L 320 200" />
    <circle cx="200" cy="120" r="16" class="laser-core-pulse" />
  `;
  coreAssembly.append(laserOverlay);
  stage.append(coreAssembly);

  const canvas = document.createElement("canvas");
  canvas.className = "assembly-shockwave-canvas";
  stage.append(canvas);

  const dockPositions = ["dock-tl", "dock-tr", "dock-bl", "dock-br"];
  (parts || []).slice(0, 4).forEach((part, index) => {
    const pos = dockPositions[index] || dockPositions[0];
    const dockItem = document.createElement("div");
    dockItem.className = `assembly-dock-part ${pos}`;
    dockItem.dataset.assemblyDockPart = index + 1;
    const icon = createItemIcon(part, "assembly-dock-part__icon");
    dockItem.append(icon);
    const label = document.createElement("span");
    label.className = "assembly-dock-part__label";
    label.textContent = part.name;
    dockItem.append(label);
    const crosshair = document.createElement("div");
    crosshair.className = "assembly-dock-part__reticle";
    dockItem.append(crosshair);
    stage.append(dockItem);
  });

  const dossierContainer = document.createElement("div");
  dossierContainer.className = "assembly-dossier-wrapper";
  const dossierCard = createDossierCard(project, state, options);
  dossierContainer.append(dossierCard);
  stage.append(dossierContainer);

  modal.append(stage);
  return modal;
}

export { CHINESE_NUMERALS, appendItem, appendRewardOutcome, appendText, createFighterArt, createSubmersibleArt, createItemIcon, createProjectHeroArt, createSubmissionFeedback, getLevelNumber, getRewardStatusText, getStoredAnswerDraft, getStoredScreen, requireDependencies, createDossierCard, createAssemblySequenceModal };

