/**
 * Knowledge Constellation View (知识星图拓扑视图)
 * 渲染科技感十足的知识星图拓扑网络：
 * 1. 动态 SVG 能量光轨连接线（展现知识先验与分支脉络）
 * 2. 6大思维领域色彩光晕与节点标注
 * 3. 领域筛选器（Strand Filter）与视图切换（星图 / 列表）
 * 4. 思维罗盘战术简报（Mind Compass Briefing）
 */

import KnowledgeTopologyAdapter from "./knowledgeTopologyAdapter.js";
import KnowledgeMotionExplainer from "./knowledgeMotionExplainer.js";
import { appendText } from "./gameAppView.js";

const VIEW_MODE_STORAGE_KEY = "math-quest-map-view-mode";

// 预设星图节点在 1000 x 580 画布上的拓扑坐标分布（基于认知前置与思维分支精心布局）
const CONSTELLATION_COORDINATES_BY_CHAPTER = {
  "chapter-01": [
    // 1: patterns (根节点，中心偏左)
    { x: 100, y: 290 },
    // 分支A：观察与周期线（向上发散）
    // 2: quick-calculation
    { x: 260, y: 160 },
    // 3: arithmetic-series
    { x: 440, y: 110 },
    // 4: periodicity
    { x: 300, y: 280 },
    // 分支B：计数与集合线（向下发散）
    // 5: enumeration
    { x: 240, y: 440 },
    // 6: add-multiply-principle
    { x: 440, y: 460 },
    // 7: inclusion-exclusion
    { x: 630, y: 460 },
    // 分支C：数量关系线（中轴推进）
    // 8: sum-diff
    { x: 440, y: 270 },
    // 9: unit-rate
    { x: 610, y: 230 },
    // 10: surplus-deficit
    { x: 570, y: 340 },
    // 11: chicken-rabbit (多源汇聚)
    { x: 740, y: 340 },
    // 12: average (变化与效率高潮)
    { x: 860, y: 220 }
  ],
  "chapter-02": [
    { x: 100, y: 290 },
    { x: 270, y: 160 },
    { x: 450, y: 120 },
    { x: 630, y: 120 },
    { x: 460, y: 220 },
    { x: 280, y: 380 },
    { x: 640, y: 240 },
    { x: 470, y: 440 },
    { x: 650, y: 440 },
    { x: 840, y: 280 },
    { x: 780, y: 440 },
    { x: 820, y: 140 }
  ]
};

function getDefaultNodeCoordinates(index, total) {
  // 通用双弧形星轨布局
  const row = index % 2;
  const col = Math.floor(index / 2);
  const totalCols = Math.ceil(total / 2);
  const x = 90 + col * (820 / Math.max(1, totalCols - 1));
  const y = row === 0 ? 170 + (col % 2) * 50 : 390 - (col % 2) * 50;
  return { x, y };
}

function getNodeCoordinates(chapterId, index, total) {
  const coords = CONSTELLATION_COORDINATES_BY_CHAPTER[chapterId];
  if (coords && coords[index]) {
    return coords[index];
  }
  return getDefaultNodeCoordinates(index, total);
}

/**
 * 渲染思维罗盘战术简报卡片（入关前置与思维武器）：
 * 彻底消除文字说教，以【趣味动图演示】与【极简三拍口诀】为核心
 */
export function createMindCompassBriefing(levelData, chapter, onStart) {
  const { learningBridge, engineeringAffinity, strand, title, levelNumber, moduleId } = levelData;
  const overlay = document.createElement("div");
  overlay.className = "mind-compass-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", `${title} 思维罗盘战术简报`);

  const card = document.createElement("div");
  card.className = "mind-compass-card";
  card.style.setProperty("--strand-color", strand.color);
  card.style.setProperty("--strand-accent", strand.accentColor);

  // 1. 头部标题
  const header = document.createElement("div");
  header.className = "mind-compass-card__header";
  appendText(header, "span", `${strand.icon} ${strand.title} · 第 ${levelNumber} 关`, "mind-compass-card__eyebrow");
  appendText(header, "h2", title, "mind-compass-card__title");
  card.append(header);

  // 2. 核心趣味动图演示（纯 SVG 60fps 动态演绎数学本质，拒绝文字说教）
  const motionCard = KnowledgeMotionExplainer.renderMotionCard(
    {
      methodId: moduleId,
      prompt: title,
      method: learningBridge?.methodSummary?.label
    },
    { title: `${learningBridge?.methodSummary?.label || title} · 动态模型` }
  );
  card.append(motionCard);

  // 3. 极简战术胶囊（一目了然）
  const tacticalPills = document.createElement("div");
  tacticalPills.className = "mind-compass-bridge";

  const methodPill = document.createElement("div");
  methodPill.className = "mind-compass-box mind-compass-box--method";
  appendText(methodPill, "div", `⚔️ 思维要诀 · ${learningBridge?.methodSummary?.label || "模型破局"}`, "mind-compass-box__tag");
  appendText(methodPill, "p", learningBridge?.methodSummary?.description || "识别核心变量建立模型", "mind-compass-box__desc");
  tacticalPills.append(methodPill);

  if (engineeringAffinity) {
    const techPill = document.createElement("div");
    techPill.className = "mind-compass-box mind-compass-box--transfer";
    appendText(techPill, "div", `🚀 重器赋能 · ${engineeringAffinity.subsystem}`, "mind-compass-box__tag");
    appendText(techPill, "p", engineeringAffinity.algorithmRole, "mind-compass-box__desc");
    tacticalPills.append(techPill);
  }

  card.append(tacticalPills);

  // 4. 行动按钮
  const actions = document.createElement("div");
  actions.className = "mind-compass-actions";
  const startBtn = appendText(actions, "button", "进入关卡出征", "pixel-button pixel-button--primary mind-compass-actions__start");
  startBtn.type = "button";
  startBtn.addEventListener("click", () => {
    overlay.remove();
    if (typeof onStart === "function") onStart();
  });

  const closeBtn = appendText(actions, "button", "返回星图", "pixel-button pixel-button--quiet");
  closeBtn.type = "button";
  closeBtn.addEventListener("click", () => overlay.remove());

  actions.append(startBtn, closeBtn);
  card.append(actions);
  overlay.append(card);
  return overlay;
}

/**
 * 构建并返回纯粹的星图拓扑画布 DOM 元素（包含 SVG 能量光轨连线与 12 关星辰节点）
 */
export function createConstellationBoard(options = {}) {
  const { chapter, state, activeStrandFilter = "all", onSelectLevel } = options;
  const graphLevels = KnowledgeTopologyAdapter.calculateChapterLevelGraph(chapter, state);

  // 映射 levelId -> 节点坐标
  const levelCoordinates = new Map();
  graphLevels.forEach((level, idx) => {
    levelCoordinates.set(level.levelId, getNodeCoordinates(chapter.chapterId, idx, graphLevels.length));
  });

  const board = document.createElement("div");
  board.className = "constellation-board";

  // 创建 SVG 画布（960 x 560）
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 960 560");
  svg.setAttribute("class", "constellation-svg");

  // 定义渐变与滤镜
  const defs = document.createElementNS(svgNS, "defs");
  defs.innerHTML = `
    <filter id="star-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <linearGradient id="energy-line-cleared" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5d06f" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.9" />
    </linearGradient>
    <linearGradient id="energy-line-unlocked" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#7c5cff" stop-opacity="0.5" />
    </linearGradient>
  `;
  svg.append(defs);

  // 绘制前置连线
  const linesGroup = document.createElementNS(svgNS, "g");
  linesGroup.setAttribute("class", "constellation-lines");

  graphLevels.forEach((targetNode) => {
    const targetCoord = levelCoordinates.get(targetNode.levelId);
    if (!targetCoord) return;

    (targetNode.internalPrereqLevelIds || []).forEach((sourceId) => {
      const sourceCoord = levelCoordinates.get(sourceId);
      if (!sourceCoord) return;

      const sourceNode = graphLevels.find((n) => n.levelId === sourceId);
      const isLineActive = sourceNode?.isCleared && targetNode.isUnlocked;
      const isLineCleared = sourceNode?.isCleared && targetNode.isCleared;

      const line = document.createElementNS(svgNS, "path");
      // 优雅二次贝塞尔曲线
      const midX = (sourceCoord.x + targetCoord.x) / 2;
      const midY = (sourceCoord.y + targetCoord.y) / 2 - 12;
      const d = `M ${sourceCoord.x} ${sourceCoord.y} Q ${midX} ${midY} ${targetCoord.x} ${targetCoord.y}`;
      line.setAttribute("d", d);
      line.setAttribute("class", `constellation-line ${isLineCleared ? "constellation-line--cleared" : isLineActive ? "constellation-line--active" : "constellation-line--locked"}`);
      linesGroup.append(line);
    });
  });
  svg.append(linesGroup);
  board.append(svg);

  // 节点层（HTML 按钮覆层，具备精确百分比位置与 100% 可访问性）
  const nodesLayer = document.createElement("div");
  nodesLayer.className = "constellation-nodes";

  graphLevels.forEach((node) => {
    const coord = levelCoordinates.get(node.levelId);
    if (!coord) return;

    const isCurrentFilter = activeStrandFilter === "all" || node.strand.id === activeStrandFilter;
    const isPaused = state?.activeRun?.levelId === node.levelId;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `constellation-node constellation-node--${node.status} ${isPaused ? "constellation-node--paused" : ""} ${!isCurrentFilter ? "is-dimmed" : ""}`;
    btn.dataset.constellationNode = node.levelId;
    btn.dataset.constellationLevelId = node.levelId;
    btn.dataset.focusKey = `constellation-${node.levelId}`;
    btn.dataset.strand = node.strand.id;
    btn.disabled = !node.isUnlocked || Boolean(state?.activeRun && !isPaused && !state?.freePractice);

    // 计算百分比坐标
    btn.style.left = `${(coord.x / 960) * 100}%`;
    btn.style.top = `${(coord.y / 560) * 100}%`;
    btn.style.setProperty("--node-color", node.strand.color);
    btn.style.setProperty("--node-accent", node.strand.accentColor);

    btn.setAttribute(
      "aria-label",
      `第 ${node.levelNumber} 关 ${node.title}（${node.strand.title}），${node.status === "full-star" ? "3星三星通关" : node.isCleared ? "已通关" : node.isUnlocked ? "可出征挑战" : "未解锁"}`
    );

    // 核心发光环与序号
    const core = document.createElement("div");
    core.className = "constellation-node__core";
    appendText(core, "span", String(node.levelNumber).padStart(2, "0"), "constellation-node__num");
    btn.append(core);

    // 关卡信息卡签
    const label = document.createElement("div");
    label.className = "constellation-node__label";
    appendText(label, "strong", node.title, "constellation-node__title");

    // 核心思维武器短标签
    const methodLabel = node.learningBridge?.methodSummary?.label;
    if (methodLabel) {
      appendText(label, "span", methodLabel, "constellation-node__method");
    }

    // 星级与状态
    if (node.isCleared) {
      appendText(label, "span", "★".repeat(node.starCount) + "☆".repeat(3 - node.starCount), "constellation-node__stars");
    } else if (isPaused) {
      appendText(label, "span", "▶ 继续挑战", "constellation-node__action");
    } else if (node.isUnlocked) {
      appendText(label, "span", "可挑战", "constellation-node__action");
    } else {
      appendText(label, "span", "待点亮", "constellation-node__action");
    }
    btn.append(label);

    btn.addEventListener("click", () => {
      if (typeof onSelectLevel === "function") {
        onSelectLevel(node);
      } else {
        const overlay = createMindCompassBriefing(node, chapter, () => {
          overlay.remove();
          const mainBtn = document.querySelector(`[data-level-map] [data-level-id='${node.levelId}']`);
          if (mainBtn && !mainBtn.disabled) {
            mainBtn.click();
          }
        });
        document.body.append(overlay);
      }
    });

    nodesLayer.append(btn);
  });

  board.append(nodesLayer);
  return board;
}

/**
 * 兼容模式渲染主星图拓扑组件（不产生多余重复列表）
 */
export function renderKnowledgeConstellation(container, options = {}) {
  const { chapter, state, onSelectLevel } = options;

  const wrapper = document.createElement("section");
  wrapper.className = "knowledge-constellation-section";
  wrapper.setAttribute("aria-label", `${chapter.name}知识拓扑网络`);

  const board = createConstellationBoard({
    chapter,
    state,
    onSelectLevel
  });

  wrapper.append(board);
  container.append(wrapper);
  return wrapper;
}

const KnowledgeConstellationView = {
  createMindCompassBriefing,
  createConstellationBoard,
  renderKnowledgeConstellation,
  getNodeCoordinates
};

if (typeof globalThis !== "undefined") {
  globalThis.KnowledgeConstellationView = KnowledgeConstellationView;
}

export default KnowledgeConstellationView;
