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
    ProgressionModel: globalThis.ProgressionModel
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

function createItemIcon(item, className = "pixel-icon") {
  const visual = globalThis.ItemVisuals?.getItemVisual?.(item.id);
  if (visual) {
    const image = document.createElement("img");
    image.src = visual.src;
    image.width = visual.width;
    image.height = visual.height;
    image.alt = visual.alt;
    image.className = `${className} item-visual`;
    image.decoding = "async";
    const eagerVisual = ["final-project", "project-final"].includes(visual.preloadPriority);
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
  return `${transaction.rewardType === "random" ? "随机奖励" : "固定奖励"} × ${transaction.awardedQuantity}`;
}

function appendRewardOutcome(parent, item, transaction, className = "reward-chip") {
  const chip = document.createElement("div");
  chip.className = className;
  chip.dataset.itemId = item.id;
  chip.dataset.rewardStatus = transaction.status;
  chip.dataset.rewardType = transaction.rewardType || "fixed";
  if (transaction.previewKind === "random-option") chip.dataset.randomRewardOption = "";
  chip.append(createItemIcon(item));
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
    return stored?.lastScreen === "map" || stored?.lastScreen === "settlement" ? stored.lastScreen : null;
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

function mount({ root, chapter: initialChapter, chapters, stateStore, inventoryStore, legacyState }) {
  if (!(root instanceof Element)) throw new Error("GameApp.mount requires a root element");
  const allChapters = Array.isArray(chapters) && chapters.length ? chapters : [initialChapter];
  if (!allChapters.every((entry) => entry?.levels?.length)) throw new Error("GameApp.mount requires compiled chapters");
  const chaptersById = Object.fromEntries(allChapters.map((entry) => [entry.chapterId, entry]));
  const { AnswerMatcher, GameItemCatalog, InventoryModel, LevelRewardConfig, RewardPresentation, ChapterMissionModel, CampaignModel, ProgressionModel } = requireDependencies();
  let storedState = null;
  try {
    storedState = typeof stateStore?.load === "function" ? stateStore.load() : null;
  } catch {
    storedState = null;
  }
  let initialInventory = {};
  if (inventoryStore && typeof inventoryStore.loadInventory === "function") {
    try { initialInventory = inventoryStore.loadInventory({}); } catch { initialInventory = {}; }
  }
  let campaign = CampaignModel.createCampaign(allChapters, storedState, initialInventory, legacyState);
  let chapter = chaptersById[campaign.activeChapterId];
  let state = campaign.chapterStates[chapter.chapterId];
  function replaceInventory(nextInventory, craftedRecipeId = null) {
    const serializedState = JSON.parse(ProgressionModel.serialize(state));
    if (craftedRecipeId) {
      serializedState.craftedProjectRecipeIds = {
        ...(serializedState.craftedProjectRecipeIds || {}),
        [craftedRecipeId]: true
      };
    }
    state = ProgressionModel.hydrate(JSON.stringify({
      ...serializedState,
      inventory: nextInventory
    }), chapter);
    campaign = { ...campaign, chapterStates: { ...campaign.chapterStates, [chapter.chapterId]: state } };
    campaign = CampaignModel.synchronizeInventory(campaign, allChapters, nextInventory);
    state = campaign.chapterStates[chapter.chapterId];
  }
  const persistedScreenSource = storedState || legacyState;
  const storedScreen = getStoredScreen(persistedScreenSource);
  let screen = state.activeRun ? "challenge" : storedScreen === "settlement" && state.lastSettlement ? "settlement" : "map";
  let inventoryReturnScreen = "map";
  let answerDraft = state.activeRun ? getStoredAnswerDraft(persistedScreenSource) : "";
  let answerFeedback = null;
  let rewardReveal = null;
  let craftingFeedback = null;
  let missionFeedback = [];
  let destroyed = false;

  const persist = () => {
    const missionResult = ChapterMissionModel.claimEligibleMissions(chapter.chapterId, state);
    if (missionResult.transactions.length) {
      state = ProgressionModel.hydrate(JSON.stringify({
        ...JSON.parse(ProgressionModel.serialize(state)),
        inventory: missionResult.inventory,
        claimedMissionRewards: missionResult.claimedMissionRewards
      }), chapter);
      missionFeedback = missionResult.transactions;
    }
    campaign = { ...campaign, chapterStates: { ...campaign.chapterStates, [chapter.chapterId]: state } };
    campaign = CampaignModel.synchronizeInventory(campaign, allChapters, state.inventory);
    state = campaign.chapterStates[chapter.chapterId];
    if (typeof stateStore?.save !== "function") return;
    const serialized = JSON.parse(CampaignModel.serializeCampaign(campaign));
    serialized.lastScreen = screen === "settlement" ? "settlement" : "map";
    serialized.activeAnswerDraft = state.activeRun ? answerDraft : "";
    try {
      stateStore.save(JSON.stringify(serialized));
    } catch {
      // Persistence is non-fatal; the in-memory state is still rendered below.
    }
    if (inventoryStore && typeof inventoryStore.saveInventory === "function") {
      inventoryStore.saveInventory(state.inventory);
    }
  };

  const getLevel = (levelId) => chapter.levels.find((level) => level.levelId === levelId);

  function captureAnswerDraft() {
    if (screen === "challenge" && state.activeRun?.status === "active") {
      answerDraft = root.querySelector("[data-answer-input]")?.value || "";
    }
  }

  function renderHeader(parent, eyebrow, title, allowInventory = true) {
    const header = document.createElement("header");
    header.className = "quest-game__header";
    const heading = document.createElement("div");
    appendText(heading, "p", eyebrow, "quest-game__eyebrow");
    appendText(heading, "h1", title);
    header.append(heading);
    if (allowInventory) {
      const button = appendText(header, "button", "背包", "pixel-button pixel-button--inventory");
      button.type = "button";
      button.dataset.openInventory = "";
      button.setAttribute("aria-label", "打开背包");
    }
    parent.append(header);
  }

  function renderSubmissionFeedback(parent) {
    if (!answerFeedback?.text) return;
    const feedback = appendText(
      parent,
      "p",
      answerFeedback.text,
      `answer-feedback answer-feedback--${answerFeedback.type === "correct" ? "correct" : "retry"}`
    );
    feedback.dataset.answerFeedback = answerFeedback.type;
    feedback.setAttribute("role", "status");
  }

  function getRewardPresentation() {
    return RewardPresentation.getRewardPresentation(
      rewardReveal?.transactions || [],
      (itemId) => GameItemCatalog.getItem(itemId)
    );
  }

  function renderRewardPopover(parent) {
    const presentation = getRewardPresentation();
    const { transactions } = presentation;
    if (!transactions.length) return;
    const overlay = document.createElement("aside");
    overlay.className = `reward-popover reward-popover--${presentation.mode}`;
    if (presentation.mode === "reveal") overlay.dataset.rewardPopover = "";
    else overlay.dataset.rewardToast = "";
    overlay.setAttribute("role", "status");
    appendText(overlay, "p", presentation.mode === "reveal" ? "奖励揭晓" : "材料入库", "quest-game__eyebrow");
    appendText(overlay, "h2", presentation.mode === "reveal" ? "获得特别补给！" : "材料已装进背包", "reward-popover__title");
    const rewards = document.createElement("div");
    rewards.className = "reward-popover__items";
    transactions.forEach((transaction) => {
      const item = GameItemCatalog.getItem(transaction.itemId);
      if (item) appendRewardOutcome(rewards, item, transaction, "item-chip reward-popover__item");
    });
    overlay.append(rewards);
    if (presentation.mode === "reveal") {
      const button = appendText(overlay, "button", "继续前进", "pixel-button pixel-button--primary reward-popover__action");
      button.type = "button";
      button.dataset.dismissRewardPopover = "";
    }
    parent.append(overlay);
  }

  function renderChapterStages(parent) {
    const cleared = new Set(Object.keys(state.levelRecords || {}));
      const stageCount = Math.ceil(chapter.levels.length / 3);
      const stages = document.createElement("section");
      stages.className = "chapter-stages";
      stages.setAttribute("aria-label", `${chapter.name}阶段进度`);
    Array.from({ length: stageCount }, (_, index) => {
      const start = index * 3;
      const stageLevels = chapter.levels.slice(start, start + 3);
      const clearedCount = stageLevels.filter((level) => cleared.has(level.levelId)).length;
      const card = document.createElement("article");
      card.className = "chapter-stage";
      card.dataset.chapterStage = String(index + 1);
      card.dataset.stageStatus = clearedCount === stageLevels.length ? "completed" : clearedCount > 0 ? "active" : "locked";
      appendText(card, "strong", `阶段 ${index + 1}`, "chapter-stage__title");
      appendText(card, "span", `${clearedCount} / ${stageLevels.length}`, "chapter-stage__count");
      appendText(card, "small", stageLevels.map((level, levelIndex) => `${start + levelIndex + 1}. ${level.title}`).join(" · "), "chapter-stage__levels");
      const meter = document.createElement("span");
      meter.className = "chapter-stage__meter";
      meter.style.setProperty("--stage-progress", `${(clearedCount / stageLevels.length) * 100}%`);
      card.append(meter);
      stages.append(card);
    });
    parent.append(stages);
  }

  function renderChapterMissions(parent) {
    const missions = ChapterMissionModel.getMissionStatus(chapter.chapterId, state, state.inventory);
    if (!missions.length) return;
    const section = document.createElement("section");
    section.className = "chapter-missions";
    section.dataset.chapterMissions = chapter.chapterId;
    appendText(section, "p", "章节任务收藏", "quest-game__eyebrow");
    appendText(section, "h2", "完成任务，收集专属徽记", "chapter-missions__title");
    missions.forEach((mission) => {
      const item = GameItemCatalog.getItem(mission.reward.itemId);
      const card = document.createElement("article");
      card.className = "chapter-mission";
      card.dataset.missionId = mission.id;
      card.dataset.missionStatus = mission.claimed ? "claimed" : mission.progress >= mission.value ? "ready" : "active";
      if (item) card.append(createItemIcon(item, "chapter-mission__icon"));
      const copy = document.createElement("div");
      appendText(copy, "strong", item?.name || "任务奖励");
      appendText(copy, "small", mission.claimed ? "已收藏" : `${Math.min(mission.progress, mission.value)} / ${mission.value}`);
      card.append(copy);
      section.append(card);
    });
    parent.append(section);
  }

  function renderStageCraftingCallout(parent, levelNumber) {
    if (levelNumber % 3 !== 0) return;
    const stageNumber = Math.ceil(levelNumber / 3);
    const recipe = InventoryModel.getProjectRecipes(chapter.chapterId).find((candidate) => candidate.unlockLevelNumber === levelNumber
      && candidate.outputs.some(({ itemId }) => GameItemCatalog.getItem(itemId)?.tags?.includes("project-part")));
    if (!recipe) return;
    const output = recipe.outputs[0];
    const outputItem = GameItemCatalog.getItem(output.itemId);
    const callout = document.createElement("aside");
    callout.className = "stage-crafting-callout";
    callout.dataset.stageCraftingCallout = "";
    if (hasRecipeOutput(recipe)) {
      callout.dataset.stageCraftingStatus = "complete";
      appendText(callout, "strong", `阶段 ${stageNumber} 的${outputItem?.name || "大型部件"}已完成`, "stage-crafting-callout__title");
      appendText(callout, "p", "这部分工程已装入蓝图，继续挑战下一段路线。", "stage-crafting-callout__copy");
    } else if (InventoryModel.canCraft(state.inventory, recipe, { crafting: true })) {
      callout.dataset.stageCraftingStatus = "ready";
      appendText(callout, "strong", `阶段 ${stageNumber} 可以拼装${outputItem?.name || "大型部件"}`, "stage-crafting-callout__title");
      appendText(callout, "p", "三个专题组件已到位，去背包完成这次大型拼装。", "stage-crafting-callout__copy");
    } else {
      callout.dataset.stageCraftingStatus = "missing";
      const missing = InventoryModel.getMissingIngredients(state.inventory, recipe, { crafting: true });
      const missingText = missing.map(({ itemId, missing: quantity }) => `${GameItemCatalog.getItem(itemId)?.name || itemId} ×${quantity}`).join("、");
      appendText(callout, "strong", `阶段 ${stageNumber} 还差材料`, "stage-crafting-callout__title");
      appendText(callout, "p", `尚缺：${missingText || "组件材料"}。可重玩已完成关卡补领固定材料。`, "stage-crafting-callout__copy");
    }
    const action = appendText(callout, "button", "查看背包与蓝图", "pixel-button pixel-button--primary stage-crafting-callout__action");
    action.type = "button";
    action.dataset.stageCraftingAction = "";
    action.dataset.openInventory = "";
    parent.append(callout);
  }

  function renderChapterFinale(parent) {
    const completion = ProgressionModel.getChapterCompletion(state, chapter);
    if (!completion.isChapterCleared) return;
    const project = completion.finalProjectId ? GameItemCatalog.getSuperProject(chapter.chapterId) : null;
    const finale = document.createElement("article");
    finale.className = "chapter-finale";
    finale.dataset.chapterFinale = "";
    finale.dataset.finaleStatus = completion.status;
    const copy = completion.isFinalProjectComplete
      ? {
          eyebrow: `${chapter.name}完全闭环`,
          title: `${project?.name || "章节工程"}验收完成！`,
          lead: "12 个知识点全部突破，超级工程已经入库。下一章路线已准备就绪。"
        }
      : {
          eyebrow: `${chapter.name}通关`,
          title: "超级工程进入最终验收",
          lead: "12 个知识点路线已点亮。现在去背包把大型部件装配成最终工程。"
        };
    appendText(finale, "p", copy.eyebrow, "quest-game__eyebrow");
    appendText(finale, "h2", copy.title, "chapter-finale__title");
    appendText(finale, "p", copy.lead, "chapter-finale__lead");
    appendText(finale, "strong", `${completion.clearedLevels} / ${completion.totalLevels} 关卡路线完成`, "chapter-finale__progress");
    if (project) {
      const artWrap = document.createElement("div");
      artWrap.className = "chapter-finale__art";
      const finalItem = GameItemCatalog.getItem(project.id);
      artWrap.append(project.id === "j20-sky-fighter"
        ? createFighterArt(completion.isFinalProjectComplete ? "completed" : "blueprint", "fighter-art fighter-art--finale")
        : createItemIcon(finalItem, "fighter-art fighter-art--finale"));
      finale.append(artWrap);
    }
    const action = appendText(
      finale,
        "button",
        completion.isFinalProjectComplete ? `查看${project?.name || "工程"}收藏` : "进入背包完成最终组装",
      "pixel-button pixel-button--primary chapter-finale__action"
    );
    action.type = "button";
    action.dataset.chapterFinaleAction = "";
    action.dataset.openInventory = "";
    parent.append(finale);
  }

  function renderCampaignOverview(parent) {
    const overview = document.createElement("section");
      overview.className = "campaign-overview";
      overview.dataset.campaignOverview = "";
      const chapterCount = CHINESE_NUMERALS[allChapters.length] || String(allChapters.length);
      appendText(overview, "p", `${chapterCount}章数学远征`, "quest-game__eyebrow");
    allChapters.forEach((candidate, index) => {
      const candidateState = campaign.chapterStates[candidate.chapterId];
      const completion = ProgressionModel.getChapterCompletion(candidateState, candidate);
      const unlocked = campaign.unlockedChapterIds.includes(candidate.chapterId);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "campaign-chapter";
      card.dataset.chapterId = candidate.chapterId;
      card.dataset.chapterStatus = candidate.chapterId === chapter.chapterId ? "active" : unlocked ? "unlocked" : "locked";
      card.disabled = !unlocked || Boolean(state.activeRun);
      appendText(card, "span", `第 ${index + 1} 章`, "campaign-chapter__number");
      appendText(card, "strong", candidate.name, "campaign-chapter__name");
      appendText(card, "small", unlocked ? `${completion.clearedLevels} / ${completion.totalLevels} 关` : "完成上一章工程后解锁", "campaign-chapter__progress");
      overview.append(card);
    });
    parent.append(overview);
  }

  function renderMap() {
    const main = document.createElement("main");
    main.className = "quest-game quest-game--map";
    main.dataset.gameScreen = "map";
    renderHeader(main, "知识远征", chapter.name);
    renderCampaignOverview(main);

    const summary = document.createElement("section");
    summary.className = "chapter-summary";
    const cleared = Object.keys(state.levelRecords).length;
    appendText(summary, "p", "沿着像素路标，完成每一组十题挑战。", "chapter-summary__lead");
    appendText(summary, "p", `${cleared} / ${chapter.levels.length} 关已完成`, "chapter-summary__progress");
    main.append(summary);
    renderChapterStages(main);
    renderChapterMissions(main);

    const map = document.createElement("section");
      map.dataset.levelMap = "";
      map.className = "level-map";
      map.setAttribute("aria-label", `${chapter.name}关卡地图`);
    chapter.levels.forEach((level, index) => {
      const record = state.levelRecords[level.levelId];
      const unlocked = state.unlockedLevelIds.includes(level.levelId);
      const isPausedLevel = state.activeRun?.levelId === level.levelId;
      const status = isPausedLevel ? "paused" : !unlocked ? "locked" : record?.starCount === 3 ? "full-star" : record ? "cleared" : "current";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "level-node";
      button.dataset.levelId = level.levelId;
      button.dataset.status = status;
      button.disabled = !unlocked || Boolean(state.activeRun && !isPausedLevel);
      button.setAttribute("aria-label", `第 ${index + 1} 关 ${level.title}，${status === "paused" ? "继续挑战" : status === "locked" ? "未解锁" : "可挑战"}`);
      appendText(button, "span", String(index + 1).padStart(2, "0"), "level-node__number");
      appendText(button, "strong", level.title, "level-node__title");
      appendText(button, "small", status === "paused" ? "继续挑战" : record ? `${"★".repeat(record.starCount)}${"☆".repeat(3 - record.starCount)}` : status === "locked" ? "待解锁" : "开始挑战", "level-node__status");
      map.append(button);
    });
    main.append(map);
    root.append(main);
  }

  function renderRewardPreview(parent, run) {
    const rewardConfig = LevelRewardConfig.getLevelRewardConfig(run.levelId);
    const fixedReward = rewardConfig?.fixedRewards.find((reward) => reward.questionSlot === run.questionIndex + 1);
    const hasRandomBonus = ["进阶", "提高", "挑战"].includes(run.question.difficulty);
    parent.dataset.rewardType = hasRandomBonus ? "fixed-plus-random" : "fixed";
    if (fixedReward) {
      const item = GameItemCatalog.getItem(fixedReward.itemId);
      if (item) {
        appendRewardOutcome(parent, item, {
          ...InventoryModel.previewItemGrant(state.inventory, fixedReward.itemId, fixedReward.quantity),
          rewardType: "fixed"
        }, "reward-chip");
      }
    }
    if (hasRandomBonus) {
      const note = appendText(parent, "p", "进阶挑战：额外随机补给", "reward-preview__bonus");
      note.dataset.randomRewardBonus = "";
    }
  }

  function renderTacticalReview(parent, run) {
    const reviewPanel = document.createElement("section");
    reviewPanel.className = "tactical-review";
    reviewPanel.dataset.tacticalReview = "";
    const isCorrect = run.resolved?.resolution === "correct";
    appendText(
      reviewPanel,
      "p",
      isCorrect ? (answerFeedback?.text || "线索已收集，准备复盘后继续前进。") : "这条路线先记下，看看关键方法再继续前进。",
      "tactical-review__cheer"
    );
    if (isCorrect) {
      const presentation = getRewardPresentation();
      const streakLabel = presentation.hasStreakChest
        ? `连胜 ${state.streak} 题，补给箱已解锁！`
        : `当前连胜：${state.streak} 题`;
      appendText(reviewPanel, "p", streakLabel, "tactical-review__streak");
    }

    const details = document.createElement("details");
    details.dataset.reviewDetails = "";
    const summary = appendText(details, "summary", "展开战术复盘", "tactical-review__summary");
    summary.setAttribute("aria-label", "展开战术复盘");
    const review = ProgressionModel.getResolvedReview(state);
    if (review) {
      appendText(details, "p", `关键观察：${review.observation || "观察题目中的数量关系。"}`, "tactical-review__observation");
      if (review.steps?.length) {
        const steps = document.createElement("ol");
        steps.className = "tactical-review__steps";
        review.steps.forEach((step) => appendText(steps, "li", step));
        details.append(steps);
      }
      if (review.answer) appendText(details, "p", `答案：${review.answer}`, "tactical-review__answer");
      if (review.check) appendText(details, "p", `检查方法：${review.check}`, "tactical-review__check");
      if (review.pitfall) appendText(details, "p", `易错提醒：${review.pitfall}`, "tactical-review__pitfall");
    } else {
      appendText(details, "p", "这题的复盘记录正在整理，先带着刚才的思路进入下一题。", "tactical-review__empty");
    }
    reviewPanel.append(details);
    const continueButton = appendText(reviewPanel, "button", "继续下一题", "pixel-button pixel-button--primary tactical-review__continue");
    continueButton.type = "button";
    continueButton.dataset.continueResolved = "";
    parent.append(reviewPanel);
  }

  function renderChallenge() {
    const run = state.activeRun;
    if (!run) {
      screen = state.lastSettlement ? "settlement" : "map";
      render();
      return;
    }
    const level = getLevel(run.levelId);
    const main = document.createElement("main");
    main.className = "quest-game quest-game--challenge";
    main.dataset.gameScreen = "challenge";
    renderHeader(main, `第 ${getLevelNumber(chapter, level.levelId)} 关`, level.title, run.status !== "retry");

    const challenge = document.createElement("section");
    challenge.className = "challenge-card";
    const returnMap = appendText(challenge, "button", "返回地图", "pixel-button pixel-button--quiet challenge-return");
    returnMap.type = "button";
    returnMap.dataset.challengeReturnMap = "";
    returnMap.hidden = run.status === "retry";
    renderSubmissionFeedback(challenge);
    const meta = document.createElement("div");
    meta.className = "challenge-meta";
    const counter = appendText(meta, "p", `第 ${run.questionIndex + 1} / 10 题`, "question-counter");
    counter.dataset.questionCounter = "";
    const difficulty = appendText(meta, "p", run.question.isBoss ? "Boss · 挑战" : run.question.difficulty, "difficulty-badge");
    difficulty.dataset.difficulty = "";
    challenge.append(meta);

    const heading = appendText(challenge, "h2", `第 ${getLevelNumber(chapter, level.levelId)} 关 · ${level.title}`, "challenge-card__heading");
    heading.dataset.levelHeading = "";
    const hasRandomBonus = ["进阶", "提高", "挑战"].includes(run.question.difficulty);
    const rewardLabel = appendText(challenge, "p", hasRandomBonus ? "本题固定材料 · 额外随机补给" : "本题固定材料", "challenge-card__label");
    rewardLabel.id = "reward-preview-label";
    const rewardPreview = document.createElement("div");
    rewardPreview.dataset.rewardPreview = "";
    rewardPreview.className = "reward-preview";
    rewardPreview.setAttribute("aria-labelledby", rewardLabel.id);
    renderRewardPreview(rewardPreview, run);
    challenge.append(rewardPreview);

    const storyBeat = appendText(
      challenge,
      "p",
      run.question.storyBeat || "工程小队正在整理这条线索。",
      "question-story-beat"
    );
    storyBeat.dataset.questionStoryBeat = "";
    const prompt = appendText(challenge, "p", run.question.prompt, "question-prompt");
    prompt.dataset.questionPrompt = "";
    if (run.status === "resolved") {
      renderTacticalReview(challenge, run);
    } else {
      const form = document.createElement("div");
      form.className = "answer-controls";
      const textAnswer = /[\u4e00-\u9fffA-Za-z]/.test(String(run.question.answer || ""));
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "text";
      input.autocomplete = "off";
      input.placeholder = "输入你的答案";
      input.setAttribute("aria-label", "本题答案");
      input.dataset.answerInput = "";
      input.disabled = run.status === "retry";
      if (run.status === "active") input.value = answerDraft;
      if (textAnswer) {
        const choices = [...new Set([String(run.question.answer), "是", "否", "能", "不能", "甲", "乙", "丙", "无法确定"].filter((choice) => choice === String(run.question.answer) || !String(run.question.answer).includes(choice)))].slice(0, 4);
        choices.forEach((choice) => {
          const option = appendText(form, "button", choice, "pixel-button answer-option");
          option.type = "button";
          option.dataset.answerOption = choice;
          option.disabled = run.status === "retry";
        });
      } else form.append(input);

      const submit = appendText(form, "button", "提交", "pixel-button pixel-button--primary");
      submit.type = "button";
      submit.dataset.submitAnswer = "";
      submit.hidden = run.status === "retry" || textAnswer;
      const retry = appendText(form, "button", "再试一次", "pixel-button pixel-button--primary");
      retry.type = "button";
      retry.dataset.retryQuestion = "";
      retry.hidden = run.status !== "retry";
      const skip = appendText(form, "button", "跳过", "pixel-button pixel-button--quiet");
      skip.type = "button";
      skip.dataset.skipQuestion = "";
      skip.hidden = run.status !== "retry";
      challenge.append(form);
    }

    if (run.status === "retry") {
      const feedback = appendText(challenge, "p", "这次没有通过。可以再试一次，或跳过继续前进。", "retry-message");
      feedback.setAttribute("role", "status");
    }
    renderRewardPopover(challenge);
    main.append(challenge);
    root.append(main);
    if (run.status === "active") root.querySelector("[data-answer-input]")?.focus({ preventScroll: true });
  }

  function renderSettlement() {
    const settlement = ProgressionModel.getSettlement(state);
    if (!settlement) {
      screen = "map";
      render();
      return;
    }
    const level = getLevel(settlement.levelId);
    const levelNumber = getLevelNumber(chapter, level.levelId);
    const nextLevel = chapter.levels[levelNumber];
    const section = document.createElement("section");
    section.className = "quest-game quest-game--settlement";
    section.dataset.gameScreen = "settlement";
    renderSubmissionFeedback(section);
    renderHeader(section, `第 ${levelNumber} 关完成`, level.title, false);
    appendText(section, "p", "远征结算", "quest-game__eyebrow");
    const celebration = document.createElement("article");
    celebration.className = "settlement-celebration";
    celebration.dataset.settlementCelebration = "";
    appendText(celebration, "h2", "关卡突破！", "settlement-celebration__title");
    appendText(celebration, "p", `第 ${levelNumber} 关完成，远征路线继续点亮。`, "settlement-celebration__copy");
    const unlockText = nextLevel
      ? `第 ${levelNumber + 1} 关已解锁 · ${nextLevel.title}`
      : `${chapter.name}全部通关 · 超级工程等待最终验收`;
    const unlock = appendText(celebration, "p", unlockText, "settlement-celebration__unlock");
    unlock.dataset.unlockedNextLevel = "";
    section.append(celebration);
    renderStageCraftingCallout(section, levelNumber);
    renderChapterFinale(section);
    const stars = appendText(section, "output", `${"★".repeat(settlement.starCount)}${"☆".repeat(3 - settlement.starCount)}`, "settlement-stars");
    stars.dataset.settlementStars = "";
    stars.setAttribute("aria-label", `获得 ${settlement.starCount} 星`);
    appendText(section, "p", `答对 ${settlement.correctCount} 题 · 跳过 ${settlement.skippedCount} 题`, "settlement-score");
    appendText(section, "h2", "本次新获得", "settlement-title");
    const items = document.createElement("div");
    items.dataset.settlementItems = "";
    items.className = "inventory-grid settlement-items";
    settlement.rewardTransactions
      .filter((transaction) => transaction.status === "awarded" && transaction.awardedQuantity > 0)
      .forEach((transaction) => {
        const item = GameItemCatalog.getItem(transaction.itemId);
        if (item) appendRewardOutcome(items, item, transaction, "inventory-item");
      });
    if (!items.children.length) appendText(items, "p", "本次没有获得物品。", "empty-state");
    section.append(items);
    const skippedRewards = settlement.rewardTransactions.filter((transaction) => transaction.status !== "awarded");
    if (skippedRewards.length) {
      appendText(section, "h3", "未新增的奖励", "settlement-title settlement-title--secondary");
      const skippedItems = document.createElement("div");
      skippedItems.dataset.settlementSkippedRewards = "";
      skippedItems.className = "inventory-grid settlement-items";
      skippedRewards.forEach((transaction) => {
        const item = GameItemCatalog.getItem(transaction.itemId);
        if (item) appendRewardOutcome(skippedItems, item, transaction, "inventory-item");
      });
      section.append(skippedItems);
    }
    const nextIndex = levelNumber;
    const hasNextLevel = Boolean(chapter.levels[nextIndex]);
    const next = appendText(section, "button", hasNextLevel ? "下一关" : "返回地图", "pixel-button pixel-button--primary settlement-next");
    next.type = "button";
    next.dataset.nextLevel = "";
    if (hasNextLevel) {
      const mapButton = appendText(section, "button", "返回地图", "pixel-button pixel-button--quiet settlement-map");
      mapButton.type = "button";
      mapButton.dataset.returnMap = "";
    }
    root.append(section);
  }

  function renderInventory() {
    const aside = document.createElement("aside");
    aside.className = "quest-game quest-game--inventory";
    aside.dataset.gameScreen = "inventory";
    aside.setAttribute("aria-label", "远征背包");
    renderHeader(aside, "收藏一览", "远征背包", false);
    const close = appendText(aside, "button", "返回", "pixel-button pixel-button--quiet inventory-close");
    close.type = "button";
    close.dataset.closeInventory = "";
    if (craftingFeedback) {
      const feedback = appendText(aside, "p", `合成成功：${craftingFeedback.name}`, "crafting-feedback");
      feedback.dataset.craftingFeedback = "";
      feedback.setAttribute("role", "status");
    }
    const grid = document.createElement("div");
    grid.className = "inventory-grid";
    const entries = Object.entries(state.inventory).filter(([, quantity]) => quantity > 0);
    if (!entries.length) {
      const empty = appendText(grid, "p", "还没有收集到物品。完成挑战就能装满背包。", "empty-state");
      empty.dataset.inventoryEmpty = "";
    } else {
      entries.forEach(([itemId, quantity]) => {
        const item = GameItemCatalog.getItem(itemId);
        if (!item) return;
        const card = appendItem(grid, item, quantity, "inventory-item");
        appendText(card, "p", `类别：${item.category}`, "inventory-item__detail");
        appendText(card, "p", `稀有度：${item.rarity}`, "inventory-item__detail");
      });
    }
    aside.append(grid);
    renderFinalProjectCeremony(aside);
    renderSuperProject(aside);
    root.append(aside);
  }

  function renderFinalProjectCeremony(parent) {
    const project = GameItemCatalog.getSuperProject(chapter.chapterId);
    if (!project || craftingFeedback?.itemId !== project.id) return;
    const finalItem = GameItemCatalog.getItem(project.id);
    const ceremony = document.createElement("article");
    ceremony.className = "final-project-ceremony";
    ceremony.dataset.finalProjectCeremony = "";
    appendText(ceremony, "p", "最终验收", "quest-game__eyebrow");
    appendText(ceremony, "h2", project.id === "j20-sky-fighter" ? `${project.name} 起飞！` : `${project.name} 完工！`, "final-project-ceremony__title");
    appendText(ceremony, "p", "知识路线、材料收集、组件合成和大型部件拼装全部完成。超级工程正式入库。", "final-project-ceremony__lead");
    ceremony.append(createProjectHeroArt(project, finalItem, "completed"));
    parent.append(ceremony);
  }

  function getClearedLevelCount() {
    return Object.keys(state.levelRecords || {}).length;
  }

  function formatRecipeRequirement(entry) {
    const item = GameItemCatalog.getItem(entry.itemId);
    return `${item?.name || entry.itemId} × ${entry.quantity}`;
  }

  function appendRecipeMaterials(parent, recipe) {
    const list = document.createElement("ul");
    list.className = "project-recipe__materials";
    recipe.inputs.forEach((entry) => {
      const owned = state.inventory[entry.itemId] || 0;
      const line = appendText(list, "li", `${formatRecipeRequirement(entry)}（已有 ${owned}）`);
      line.dataset.materialReady = owned >= entry.quantity ? "true" : "false";
    });
    parent.append(list);
  }

  function getCraftableRecipe(recipeId) {
    return InventoryModel.getProjectRecipes(chapter.chapterId).find((recipe) => recipe.id === recipeId);
  }

  function isRecipeUnlocked(recipe) {
    return getClearedLevelCount() >= (recipe.unlockLevelNumber || 0);
  }

  function hasRecipeOutput(recipe) {
    return recipe.outputs.every(({ itemId, quantity }) => (state.inventory[itemId] || 0) >= quantity);
  }

  function isRecipeCrafted(recipe) {
    return state.craftedProjectRecipeIds?.[recipe.id] === true || hasRecipeOutput(recipe);
  }

  function getProjectProgress(project) {
    const recipes = InventoryModel.getProjectRecipes(chapter.chapterId);
    const total = recipes.length;
    const completed = recipes.filter(isRecipeCrafted).length;
    return { completed, total };
  }

  function renderProjectProgress(parent, project) {
    const { completed, total } = getProjectProgress(project);
    const progress = document.createElement("section");
    progress.className = "project-progress";
    progress.dataset.projectProgress = "";
    appendText(progress, "strong", "工程进度", "project-progress__title");
    appendText(progress, "span", `${completed} / ${total}`, "project-progress__count");
    const meter = document.createElement("div");
    meter.className = "project-progress__meter";
    meter.dataset.projectProgressMeter = "";
    meter.setAttribute("role", "progressbar");
    meter.setAttribute("aria-valuemin", "0");
    meter.setAttribute("aria-valuemax", String(total));
    meter.setAttribute("aria-valuenow", String(completed));
    meter.setAttribute("aria-label", `${project.name} 工程进度 ${completed} / ${total}`);
    meter.style.setProperty("--project-progress", `${total ? (completed / total) * 100 : 0}%`);
    progress.append(meter);
    appendText(progress, "small", completed === total ? `超级工程完成，${project.name}已入库。` : `合成组件和大型部件，逐步点亮${project.name}。`, "project-progress__hint");
    parent.append(progress);
  }

  function renderProjectRecipe(parent, recipe, { final = false } = {}) {
    const output = recipe.outputs[0];
    const outputItem = GameItemCatalog.getItem(output.itemId);
    const categoryLabel = outputItem?.category?.endsWith("-component")
        ? `组件 ${String(recipe.unlockLevelNumber).padStart(2, "0")}`
        : outputItem?.category?.endsWith("-part")
        ? "大型部件"
        : "最终组装";
    const card = document.createElement("article");
    card.className = `project-recipe${final ? " project-recipe--final" : ""}`;
    card.dataset.projectRecipeCardId = recipe.id;
    card.dataset.recipeStatus = isRecipeCrafted(recipe) ? "completed" : isRecipeUnlocked(recipe) ? "available" : "locked";
    if (outputItem) {
      const visual = document.createElement("div");
      visual.className = "project-recipe__visual";
      visual.append(createItemIcon(outputItem, "project-recipe__icon"));
      card.append(visual);
    }
    appendText(card, "h3", `${final ? "最终组装" : categoryLabel} · ${outputItem?.name || recipe.name}`);
    appendRecipeMaterials(card, recipe);
    const actionLabel = isRecipeCrafted(recipe)
      ? "已完成"
      : final
        ? `组装 ${GameItemCatalog.getSuperProject(chapter.chapterId)?.name || outputItem?.name || "超级工程"}`
        : outputItem?.category?.endsWith("-part")
          ? "拼装大型部件"
          : "合成组件";
    const action = appendText(card, "button", actionLabel, "pixel-button pixel-button--primary project-recipe__action");
    action.type = "button";
    action.dataset.projectRecipeId = recipe.id;
    action.disabled = isRecipeCrafted(recipe) || !isRecipeUnlocked(recipe) || !InventoryModel.canCraft(state.inventory, recipe, { crafting: true });
    if (!isRecipeUnlocked(recipe)) {
      appendText(card, "p", `完成第 ${recipe.unlockLevelNumber} 个专题后解锁。`, "project-recipe__hint");
    } else if (!isRecipeCrafted(recipe) && action.disabled) {
      appendText(card, "p", "材料还不够，继续闯关收集。", "project-recipe__hint");
    }
    parent.append(card);
  }

  function renderSuperProject(parent) {
    const project = GameItemCatalog.getSuperProject(chapter.chapterId);
    if (!project) return;
    const section = document.createElement("section");
    section.className = "super-project";
    section.dataset.superProject = project.id;
    appendText(section, "p", "超级工程蓝图", "quest-game__eyebrow");
    appendText(section, "h2", project.name, "super-project__title");
    const projectState = (state.inventory[project.id] || 0) > 0 ? "completed" : "blueprint";
    section.append(createProjectHeroArt(project, GameItemCatalog.getItem(project.id), projectState));
    appendText(section, "p", project.description, "super-project__lead");
    renderProjectProgress(section, project);
    const recipeGrid = document.createElement("div");
    recipeGrid.className = "super-project__recipes";
    InventoryModel.getProjectRecipes(chapter.chapterId)
      .filter((recipe) => recipe.id !== project.finalRecipe.id)
      .forEach((recipe) => renderProjectRecipe(recipeGrid, recipe));
    renderProjectRecipe(recipeGrid, getCraftableRecipe(project.finalRecipe.id), { final: true });
    section.append(recipeGrid);
    parent.append(section);
  }

  function render() {
    if (destroyed) return;
    root.replaceChildren();
    if (screen === "challenge") renderChallenge();
    else if (screen === "settlement") renderSettlement();
    else if (screen === "inventory") renderInventory();
    else renderMap();
  }

  function openInventory() {
    if (screen === "challenge") answerDraft = root.querySelector("[data-answer-input]")?.value || "";
    rewardReveal = null;
    inventoryReturnScreen = screen;
    screen = "inventory";
    render();
  }

  function closeInventory() {
    screen = inventoryReturnScreen;
    render();
  }

  function submitCurrentAnswer(selectedAnswer = null) {
    const input = root.querySelector("[data-answer-input]");
    const value = selectedAnswer || input?.value;
    if (!value?.trim()) {
      input?.focus();
      return;
    }
    const beforeRun = state.activeRun;
    const previousRewardCount = beforeRun?.rewardTransactions?.length || 0;
    answerDraft = "";
    state = ProgressionModel.submitAnswer(state, value, AnswerMatcher);
    answerFeedback = createSubmissionFeedback(state.activeRun?.status === "retry" ? "retry" : "correct");
    if (answerFeedback.type === "correct") {
      const transactions = (state.activeRun?.rewardTransactions || state.lastSettlement?.rewardTransactions || [])
        .slice(previousRewardCount);
      rewardReveal = { transactions };
    } else {
      rewardReveal = null;
    }
    screen = state.activeRun ? "challenge" : "settlement";
    persist();
    render();
  }

  function handleClick(event) {
    const target = event.target.closest("button");
    if (!target || !root.contains(target)) return;
    if (target.matches("[data-chapter-id]") && !target.disabled) {
      const nextChapter = chaptersById[target.dataset.chapterId];
      if (!nextChapter || !campaign.unlockedChapterIds.includes(nextChapter.chapterId)) return;
      campaign = { ...campaign, activeChapterId: nextChapter.chapterId, chapterStates: { ...campaign.chapterStates, [chapter.chapterId]: state } };
      chapter = nextChapter;
      state = campaign.chapterStates[chapter.chapterId];
      answerDraft = "";
      answerFeedback = null;
      rewardReveal = null;
      craftingFeedback = null;
      screen = "map";
      persist();
      render();
    } else if (target.matches("[data-level-id]") && !target.disabled) {
      answerFeedback = null;
      rewardReveal = null;
      craftingFeedback = null;
      if (state.activeRun?.levelId === target.dataset.levelId) {
        screen = "challenge";
      } else {
        answerDraft = "";
        state = ProgressionModel.startLevel(state, target.dataset.levelId);
        screen = "challenge";
      }
      persist();
      render();
    } else if (target.matches("[data-challenge-return-map]")) {
      captureAnswerDraft();
      answerFeedback = null;
      rewardReveal = null;
      screen = "map";
      persist();
      render();
    } else if (target.matches("[data-project-recipe-id]")) {
      const recipe = getCraftableRecipe(target.dataset.projectRecipeId);
      if (recipe && isRecipeUnlocked(recipe) && InventoryModel.canCraft(state.inventory, recipe, { crafting: true })) {
        const result = InventoryModel.craftRecipe(state.inventory, recipe, { crafting: true });
        replaceInventory(result.inventory, recipe.id);
        const output = recipe.outputs[0];
        const item = output ? GameItemCatalog.getItem(output.itemId) : null;
        craftingFeedback = { itemId: output?.itemId, name: item?.name || recipe.name };
        persist();
        render();
      }
    } else if (target.matches("[data-dismiss-reward-popover]")) {
      rewardReveal = null;
      render();
    } else if (target.matches("[data-open-inventory]")) openInventory();
    else if (target.matches("[data-close-inventory]")) {
      craftingFeedback = null;
      closeInventory();
    }
    else if (target.matches("[data-submit-answer]")) submitCurrentAnswer();
    else if (target.matches("[data-answer-option]")) submitCurrentAnswer(target.dataset.answerOption);
    else if (target.matches("[data-retry-question]")) {
      answerDraft = "";
      answerFeedback = null;
      rewardReveal = null;
      state = ProgressionModel.retryQuestion(state);
      persist();
      render();
      root.querySelector("[data-answer-input]")?.focus();
    } else if (target.matches("[data-skip-question]")) {
      answerDraft = "";
      answerFeedback = null;
      rewardReveal = null;
      state = ProgressionModel.skipQuestion(state);
      screen = state.activeRun ? "challenge" : "settlement";
      persist();
      render();
    } else if (target.matches("[data-continue-resolved]")) {
      answerDraft = "";
      answerFeedback = null;
      rewardReveal = null;
      state = ProgressionModel.continueFromResolved(state);
      screen = state.activeRun ? "challenge" : "settlement";
      persist();
      render();
    } else if (target.matches("[data-next-level]")) {
      const settlement = ProgressionModel.getSettlement(state);
      const currentIndex = chapter.levels.findIndex((level) => level.levelId === settlement?.levelId);
      const nextLevel = chapter.levels[currentIndex + 1];
      if (nextLevel && state.unlockedLevelIds.includes(nextLevel.levelId)) {
        answerDraft = "";
        answerFeedback = null;
        rewardReveal = null;
        craftingFeedback = null;
        state = ProgressionModel.startLevel(state, nextLevel.levelId);
        screen = "challenge";
        persist();
      } else {
        screen = "map";
        persist();
      }
      render();
    } else if (target.matches("[data-return-map]")) {
      answerFeedback = null;
      rewardReveal = null;
      craftingFeedback = null;
      screen = "map";
      persist();
      render();
    }
  }

  function handleKeydown(event) {
    if (event.key === "Enter" && screen === "challenge" && state.activeRun?.status === "active") submitCurrentAnswer();
    if (event.key === "Escape" && screen === "inventory") closeInventory();
  }

  root.addEventListener("click", handleClick);
  root.addEventListener("keydown", handleKeydown);
  render();

  return {
    render,
    destroy() {
      destroyed = true;
      root.removeEventListener("click", handleClick);
      root.removeEventListener("keydown", handleKeydown);
      root.replaceChildren();
    }
  };
}

const GameApp = { mount };
globalThis.GameApp = GameApp;

export default GameApp;
