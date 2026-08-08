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
    ChallengeModel: globalThis.ChallengeModel
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
  const blueprint = state !== "completed";
  const stroke = blueprint ? "#2d6aa3" : "#f7d774";
  const line = blueprint ? "#66a8e8" : "#99f1ff";
  const shadow = blueprint ? "rgba(49, 90, 147, 0.2)" : "rgba(21, 235, 255, 0.5)";
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
  const bodyGradient = add("linearGradient", { id: `fighter-body-${state}`, x1: "20%", y1: "0%", x2: "100%", y2: "100%" }, defs);
  addStops(bodyGradient, blueprint
    ? [["0%", "#dff1ff", 0.18], ["50%", "#65a6e8", 0.16], ["100%", "#224d7e", 0.2]]
    : [["0%", "#10182f"], ["42%", "#303d77"], ["72%", "#121a34"], ["100%", "#6d5cff"]]);
  const canopyGradient = add("linearGradient", { id: `fighter-canopy-${state}`, x1: "0%", y1: "0%", x2: "100%", y2: "100%" }, defs);
  addStops(canopyGradient, blueprint
    ? [["0%", "#ffffff", 0.75], ["100%", "#7bd7ff", 0.36]]
    : [["0%", "#ffffff"], ["40%", "#7cf6ff"], ["100%", "#3448ff"]]);
  const flameGradient = add("radialGradient", { id: `fighter-flame-${state}`, cx: "50%", cy: "50%", r: "70%" }, defs);
  addStops(flameGradient, [["0%", "#ffffff"], ["35%", "#f8d66e"], ["65%", "#ff6a3d"], ["100%", "#7c5cff", 0]]);

  add("ellipse", {
    cx: "132",
    cy: "74",
    rx: "112",
    ry: "38",
    fill: shadow,
    opacity: blueprint ? "0.28" : "0.42",
    filter: "blur(6px)"
  });

  if (!blueprint) {
    const flames = add("g", { "data-fighter-detail": "afterburner-glow" });
    add("path", { d: "M21 59 C-5 51 -8 67 21 70 C-8 74 -5 91 21 81 Z", fill: `url(#fighter-flame-${state})`, opacity: "0.92" }, flames);
    add("path", { d: "M18 65 C3 62 -1 70 18 73 C1 76 3 83 18 78 Z", fill: "#fff6b8", opacity: "0.86" }, flames);
  }

  const guide = add("g", {
    opacity: blueprint ? "0.42" : "0.22",
    stroke: line,
    "stroke-width": "1.5",
    "stroke-dasharray": blueprint ? "7 6" : "0",
    fill: "none"
  });
  ["M26 70 H238", "M132 22 V118", "M48 38 L210 102", "M48 102 L210 38"].forEach((d) => add("path", { d }, guide));

  const airframe = add("g", { "data-fighter-detail": "stealth-airframe" });
  add("path", {
    d: "M238 70 L186 55 L139 30 L91 38 L43 15 L64 56 L22 62 L22 78 L64 84 L43 125 L91 102 L139 110 L186 85 Z",
    fill: blueprint ? `url(#fighter-body-${state})` : `url(#fighter-body-${state})`,
    stroke,
    "stroke-width": "4",
    "stroke-linejoin": "round"
  }, airframe);
  add("path", {
    d: "M229 70 L178 65 L132 50 L72 57 L104 70 L72 83 L132 90 L178 75 Z",
    fill: blueprint ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.13)",
    stroke: line,
    "stroke-width": "2",
    "stroke-linejoin": "round"
  }, airframe);
  add("path", {
    d: "M92 39 L122 60 M92 101 L122 80 M141 31 L151 56 M141 109 L151 84 M64 56 L103 65 M64 84 L103 75",
    fill: "none",
    stroke: line,
    "stroke-width": "2.2",
    "stroke-linecap": "round",
    opacity: blueprint ? "0.86" : "0.55"
  }, airframe);

  add("path", {
    "data-fighter-detail": "cockpit",
    d: "M188 63 C207 60 224 64 235 70 C224 76 207 80 188 77 C181 73 181 67 188 63 Z",
    fill: `url(#fighter-canopy-${state})`,
    stroke: blueprint ? "#7bd7ff" : "#e8ffff",
    "stroke-width": "2.4",
    "stroke-linejoin": "round"
  });
  add("path", {
    d: "M194 66 C207 65 219 67 228 70",
    fill: "none",
    stroke: "#ffffff",
    "stroke-width": "2",
    opacity: blueprint ? "0.7" : "0.9",
    "stroke-linecap": "round"
  });

  const engines = add("g", { "data-fighter-detail": "engine-nozzles" });
  add("path", { d: "M21 62 L54 59 L61 67 L21 68 Z", fill: blueprint ? "rgba(28,70,110,0.18)" : "#0b1020", stroke, "stroke-width": "2.4", "stroke-linejoin": "round" }, engines);
  add("path", { d: "M21 72 L61 73 L54 81 L21 78 Z", fill: blueprint ? "rgba(28,70,110,0.18)" : "#0b1020", stroke, "stroke-width": "2.4", "stroke-linejoin": "round" }, engines);
  add("path", { d: "M30 65 H55 M30 76 H55", stroke: blueprint ? "#67b7ff" : "#ffcf6a", "stroke-width": "2.3", "stroke-linecap": "round" }, engines);

  const spark = add("g", { opacity: blueprint ? "0.56" : "0.9" });
  [[210, 35, 2.2], [225, 99, 1.8], [66, 29, 1.7], [156, 116, 1.4]].forEach(([cx, cy, r]) => {
    add("circle", { cx, cy, r, fill: blueprint ? "#65a6e8" : "#f5d06f" }, spark);
  });
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


export { CHINESE_NUMERALS, appendItem, appendRewardOutcome, appendText, createFighterArt, createItemIcon, createProjectHeroArt, createSubmissionFeedback, getLevelNumber, getRewardStatusText, getStoredAnswerDraft, getStoredScreen, requireDependencies };
