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
  ],
  "chapter-03": [
    { x: 110, y: 280 },
    { x: 260, y: 150 },
    { x: 440, y: 120 },
    { x: 270, y: 410 },
    { x: 450, y: 430 },
    { x: 460, y: 270 },
    { x: 630, y: 150 },
    { x: 640, y: 410 },
    { x: 650, y: 280 },
    { x: 790, y: 180 },
    { x: 800, y: 380 },
    { x: 890, y: 280 }
  ],
  "chapter-04": [
    { x: 100, y: 270 },
    { x: 240, y: 160 },
    { x: 410, y: 130 },
    { x: 250, y: 390 },
    { x: 420, y: 420 },
    { x: 430, y: 270 },
    { x: 600, y: 160 },
    { x: 590, y: 390 },
    { x: 610, y: 270 },
    { x: 770, y: 170 },
    { x: 780, y: 380 },
    { x: 880, y: 270 }
  ],
  "chapter-05": [
    { x: 100, y: 290 },
    { x: 250, y: 150 },
    { x: 430, y: 130 },
    { x: 260, y: 420 },
    { x: 440, y: 430 },
    { x: 440, y: 280 },
    { x: 620, y: 140 },
    { x: 630, y: 420 },
    { x: 620, y: 280 },
    { x: 790, y: 190 },
    { x: 790, y: 370 },
    { x: 890, y: 280 }
  ],
  "chapter-06": [
    { x: 100, y: 280 },
    { x: 250, y: 160 },
    { x: 420, y: 120 },
    { x: 250, y: 400 },
    { x: 420, y: 430 },
    { x: 430, y: 270 },
    { x: 610, y: 150 },
    { x: 610, y: 400 },
    { x: 620, y: 270 },
    { x: 780, y: 170 },
    { x: 780, y: 390 },
    { x: 890, y: 280 }
  ],
  "chapter-07": [
    { x: 110, y: 280 },
    { x: 260, y: 140 },
    { x: 430, y: 120 },
    { x: 270, y: 420 },
    { x: 440, y: 430 },
    { x: 440, y: 270 },
    { x: 620, y: 150 },
    { x: 620, y: 400 },
    { x: 630, y: 270 },
    { x: 790, y: 180 },
    { x: 790, y: 380 },
    { x: 890, y: 280 }
  ],
  "chapter-08": [
    { x: 100, y: 280 },
    { x: 240, y: 150 },
    { x: 410, y: 130 },
    { x: 260, y: 410 },
    { x: 430, y: 420 },
    { x: 430, y: 270 },
    { x: 600, y: 150 },
    { x: 610, y: 400 },
    { x: 610, y: 270 },
    { x: 770, y: 170 },
    { x: 780, y: 390 },
    { x: 880, y: 280 }
  ],
  "chapter-09": [
    { x: 110, y: 280 },
    { x: 250, y: 150 },
    { x: 430, y: 120 },
    { x: 260, y: 410 },
    { x: 440, y: 430 },
    { x: 440, y: 270 },
    { x: 620, y: 140 },
    { x: 630, y: 410 },
    { x: 630, y: 270 },
    { x: 790, y: 180 },
    { x: 790, y: 380 },
    { x: 890, y: 280 }
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
  const { learningBridge, strand, title, levelNumber, moduleId } = levelData;
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

  const transfer = learningBridge?.transferTargets?.[0];
  if (transfer) {
    const transferPill = document.createElement("div");
    transferPill.className = "mind-compass-box mind-compass-box--transfer";
    appendText(transferPill, "div", "🔭 思维跃迁", "mind-compass-box__tag");
    appendText(transferPill, "p", transfer.reason, "mind-compass-box__desc");
    tacticalPills.append(transferPill);
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

/**
 * 战略数学思维知识全景图鉴与认知跃迁模态窗 (Knowledge Nexus Modal)
 * 1. 四大奥数螺旋演进主轴（代数消元、空间割补、数论结构、组合极值）
 * 2. 7大跨域底层逻辑跃迁桥梁（小学原型 ➜ 初高公理化 ➜ 大国重器算力支撑）
 * 3. 关联关卡进度透视与一键跨章节出征跳转
 */
export function createKnowledgeNexusModal(options = {}) {
  const {
    campaign,
    allChapters = [],
    activeTab = "axes",
    onClose,
    onSelectLevel,
    onSwitchTab
  } = options;

  const overlay = document.createElement("div");
  overlay.className = "knowledge-nexus-modal-overlay";
  overlay.dataset.knowledgeNexusModalOverlay = "";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "战略数学思维知识全景图鉴与认知跃迁");

  const modal = document.createElement("div");
  modal.className = "knowledge-nexus-modal";
  modal.dataset.knowledgeNexusModal = "";

  // 1. 模态窗头部
  const modalHeader = document.createElement("div");
  modalHeader.className = "knowledge-nexus-modal__header";

  const titleGroup = document.createElement("div");
  titleGroup.className = "knowledge-nexus-modal__title-group";
  const eyebrow = document.createElement("span");
  eyebrow.className = "knowledge-nexus-modal__eyebrow";
  eyebrow.textContent = "🌌 宏观知识脉络 · 战略数学思维图鉴";
  titleGroup.append(eyebrow);
  const titleH2 = document.createElement("h2");
  titleH2.className = "knowledge-nexus-modal__title";
  titleH2.textContent = "战略数学思维知识全景图鉴与认知跃迁";
  titleGroup.append(titleH2);
  modalHeader.append(titleGroup);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "knowledge-nexus-modal__close-btn";
  closeBtn.textContent = "✕";
  closeBtn.dataset.closeKnowledgeNexus = "";
  closeBtn.setAttribute("aria-label", "关闭知识全景图鉴");
  closeBtn.addEventListener("click", () => {
    overlay.remove();
    if (typeof onClose === "function") onClose();
  });
  modalHeader.append(closeBtn);
  modal.append(modalHeader);

  // 2. 选项卡导航
  const tabsNav = document.createElement("nav");
  tabsNav.className = "knowledge-nexus-tabs";
  tabsNav.setAttribute("role", "tablist");

  const axesTabBtn = document.createElement("button");
  axesTabBtn.type = "button";
  axesTabBtn.className = `knowledge-nexus-tab-btn ${activeTab === "axes" ? "is-active" : ""}`;
  axesTabBtn.dataset.nexusTab = "axes";
  axesTabBtn.setAttribute("role", "tab");
  axesTabBtn.setAttribute("aria-selected", String(activeTab === "axes"));
  axesTabBtn.innerHTML = `<span>⚡</span> <span>四大奥数螺旋演进主轴</span>`;
  tabsNav.append(axesTabBtn);

  const bridgesTabBtn = document.createElement("button");
  bridgesTabBtn.type = "button";
  bridgesTabBtn.className = `knowledge-nexus-tab-btn ${activeTab === "bridges" ? "is-active" : ""}`;
  bridgesTabBtn.dataset.nexusTab = "bridges";
  bridgesTabBtn.setAttribute("role", "tab");
  bridgesTabBtn.setAttribute("aria-selected", String(activeTab === "bridges"));
  bridgesTabBtn.innerHTML = `<span>🌉</span> <span>跨域底层逻辑跃迁桥梁</span>`;
  tabsNav.append(bridgesTabBtn);

  modal.append(tabsNav);

  // 3. 模态窗主体内容
  const body = document.createElement("div");
  body.className = "knowledge-nexus-modal__body";

  if (activeTab === "axes") {
    // 3A. 四大奥数主轴视图
    const intro = document.createElement("div");
    intro.className = "knowledge-nexus-intro";
    intro.innerHTML = `
      <p class="knowledge-nexus-intro__lead">
        <strong>数学思维并非孤立的题型记忆，而是沿四大认知主轴由浅入深、螺旋上升的有机生命体。</strong>
        从小学低阶直观模型，到中高阶复杂约束，再到初高中方程与函数公理化，每一主轴均串联起跨章节的战役关卡。
      </p>
    `;
    body.append(intro);

    const axesGrid = document.createElement("div");
    axesGrid.className = "knowledge-nexus-axes-grid";

    KnowledgeTopologyAdapter.OLYMPIAD_SPIRAL_AXES.forEach((axis) => {
      const progress = KnowledgeTopologyAdapter.calculateSpineProgress(axis.id, campaign);
      const card = document.createElement("article");
      card.className = "knowledge-nexus-axis-card";
      card.dataset.axisId = axis.id;
      card.style.setProperty("--axis-color", axis.color);

      // 卡片头部
      const cardHeader = document.createElement("div");
      cardHeader.className = "knowledge-nexus-axis-card__header";

      const axisTitleWrap = document.createElement("div");
      axisTitleWrap.className = "knowledge-nexus-axis-card__title-wrap";
      appendText(axisTitleWrap, "span", axis.icon, "knowledge-nexus-axis-card__icon");
      appendText(axisTitleWrap, "h3", axis.name, "knowledge-nexus-axis-card__title");
      cardHeader.append(axisTitleWrap);

      const progressBadge = document.createElement("div");
      progressBadge.className = "knowledge-nexus-axis-card__progress-badge";
      progressBadge.innerHTML = `
        <span class="nexus-progress-pill">${progress.clearedCount} / ${progress.totalCount} 关突破</span>
        <span class="nexus-progress-pct">${progress.percentage}%</span>
      `;
      cardHeader.append(progressBadge);
      card.append(cardHeader);

      // 进度条
      const progressTrack = document.createElement("div");
      progressTrack.className = "knowledge-nexus-progress-track";
      const progressBar = document.createElement("div");
      progressBar.className = "knowledge-nexus-progress-bar";
      progressBar.style.width = `${progress.percentage}%`;
      progressTrack.append(progressBar);
      card.append(progressTrack);

      // 描述
      appendText(card, "p", axis.description, "knowledge-nexus-axis-card__desc");

      // 里程碑演化阶梯
      if (axis.milestones?.length) {
        const milestonesWrap = document.createElement("div");
        milestonesWrap.className = "knowledge-nexus-milestones";
        appendText(milestonesWrap, "h4", "🎯 认知演变四阶里程碑", "knowledge-nexus-section-label");
        const list = document.createElement("div");
        list.className = "knowledge-nexus-milestones__list";
        axis.milestones.forEach((m) => {
          const mItem = document.createElement("div");
          mItem.className = "knowledge-nexus-milestone-item";
          appendText(mItem, "span", m.phase, "knowledge-nexus-milestone-item__phase");
          appendText(mItem, "strong", m.focus, "knowledge-nexus-milestone-item__focus");
          appendText(mItem, "span", m.milestone, "knowledge-nexus-milestone-item__text");
          list.append(mItem);
        });
        milestonesWrap.append(list);
        card.append(milestonesWrap);
      }

      // 覆盖关卡列表与直接跳转
      if (axis.levels?.length) {
        const levelsWrap = document.createElement("div");
        levelsWrap.className = "knowledge-nexus-axis-levels";
        appendText(levelsWrap, "h4", "🗺️ 串联远征关卡路线", "knowledge-nexus-section-label");
        const levelNodes = document.createElement("div");
        levelNodes.className = "knowledge-nexus-axis-levels__grid";

        axis.levels.forEach((axisLevel) => {
          const targetChapter = allChapters.find((c) => c.chapterId === axisLevel.chapterId);
          const chState = campaign?.chapterStates?.[axisLevel.chapterId];
          const targetLevel = targetChapter?.levels?.find((l) => l.moduleId === axisLevel.moduleId);
          const levelId = targetLevel?.levelId || `${axisLevel.chapterId}-L01`;
          const starCount = chState?.levelRecords?.[levelId]?.starCount || 0;
          const isCleared = starCount > 0;
          const isUnlocked = Boolean(chState?.unlockedLevelIds?.includes(levelId) || chState?.freePractice);

          const nodeBtn = document.createElement("button");
          nodeBtn.type = "button";
          nodeBtn.className = `knowledge-nexus-level-btn ${isCleared ? "is-cleared" : isUnlocked ? "is-unlocked" : "is-locked"}`;
          nodeBtn.dataset.nexusJumpLevel = levelId;
          nodeBtn.dataset.chapterId = axisLevel.chapterId;
          nodeBtn.dataset.levelId = levelId;
          nodeBtn.title = `${targetChapter?.name || axisLevel.chapterId} · ${axisLevel.label} (${isCleared ? `已通关 ★${starCount}` : isUnlocked ? "已解锁可出征" : "未解锁"})`;

          nodeBtn.innerHTML = `
            <span class="nexus-level-tag">${targetChapter ? targetChapter.name.slice(0, 4) : axisLevel.chapterId}</span>
            <span class="nexus-level-label">${axisLevel.label}</span>
            <span class="nexus-level-status">${isCleared ? "★".repeat(starCount) : isUnlocked ? "出征" : "🔒"}</span>
          `;

          nodeBtn.addEventListener("click", () => {
            overlay.remove();
            if (typeof onSelectLevel === "function") {
              onSelectLevel(axisLevel.chapterId, levelId);
            }
          });

          levelNodes.append(nodeBtn);
        });

        levelsWrap.append(levelNodes);
        card.append(levelsWrap);
      }

      axesGrid.append(card);
    });

    body.append(axesGrid);
  } else {
    // 3B. 7大跨域底层逻辑跃迁桥梁视图
    const intro = document.createElement("div");
    intro.className = "knowledge-nexus-intro";
    intro.innerHTML = `
      <p class="knowledge-nexus-intro__lead">
        <strong>打破“小学奥数就是奇技淫巧”的误区：每一个经典奥数模型，都是高等数学思想在大脑中的萌芽投影。</strong>
        在这里领略鸡兔同笼到消元代数、割补拼图到乘法公式、几何沙漏到相似射影、抽屉极值到可行域规划的宏伟认知跃迁。
      </p>
    `;
    body.append(intro);

    const bridgesGrid = document.createElement("div");
    bridgesGrid.className = "knowledge-nexus-bridges-grid";

    KnowledgeTopologyAdapter.INTRINSIC_LOGIC_BRIDGES.forEach((bridge) => {
      const card = document.createElement("article");
      card.className = "knowledge-nexus-bridge-card";
      card.dataset.bridgeId = bridge.id;

      // 卡片头部
      const header = document.createElement("div");
      header.className = "knowledge-nexus-bridge-card__header";
      appendText(header, "span", bridge.icon, "knowledge-nexus-bridge-card__icon");
      const titleWrap = document.createElement("div");
      appendText(titleWrap, "h3", bridge.name, "knowledge-nexus-bridge-card__title");
      appendText(titleWrap, "p", `跨学段思维蜕变：从小学经验模型到公理化与现代科技`, "knowledge-nexus-bridge-card__sub");
      header.append(titleWrap);
      card.append(header);

      // 三段跃迁流图
      const stream = document.createElement("div");
      stream.className = "knowledge-nexus-bridge-stream";

      // 阶段 1：小学根基
      const step1 = document.createElement("div");
      step1.className = "knowledge-nexus-bridge-step knowledge-nexus-bridge-step--root";
      appendText(step1, "div", "🐣 小学经典直观经验", "knowledge-nexus-bridge-step__tag");
      appendText(step1, "p", bridge.elementaryRoot, "knowledge-nexus-bridge-step__content");
      stream.append(step1);

      // 箭头
      const arrow1 = document.createElement("div");
      arrow1.className = "knowledge-nexus-bridge-arrow";
      arrow1.textContent = "➔";
      stream.append(arrow1);

      // 阶段 2：公理化飞跃
      const step2 = document.createElement("div");
      step2.className = "knowledge-nexus-bridge-step knowledge-nexus-bridge-step--leap";
      appendText(step2, "div", "⚡ 初高公理化质变跃迁", "knowledge-nexus-bridge-step__tag");
      appendText(step2, "p", bridge.axiomaticLeap, "knowledge-nexus-bridge-step__content");
      stream.append(step2);

      // 箭头
      const arrow2 = document.createElement("div");
      arrow2.className = "knowledge-nexus-bridge-arrow";
      arrow2.textContent = "➔";
      stream.append(arrow2);

      // 阶段 3：大国重器算力
      const step3 = document.createElement("div");
      step3.className = "knowledge-nexus-bridge-step knowledge-nexus-bridge-step--engineering";
      appendText(step3, "div", `🛰️ 大国重器算力共振 · ${bridge.engineeringAffinity?.system || "国家工程"}`, "knowledge-nexus-bridge-step__tag");
      appendText(step3, "p", `${bridge.engineeringAffinity?.subsystem}：${bridge.engineeringAffinity?.role}`, "knowledge-nexus-bridge-step__content");
      stream.append(step3);

      card.append(stream);

      // 数学本质箴言
      const essenceBox = document.createElement("blockquote");
      essenceBox.className = "knowledge-nexus-bridge-essence";
      essenceBox.innerHTML = `<strong>💡 数学思维本质：</strong>${bridge.mathematicalEssence}`;
      card.append(essenceBox);

      // 关联关卡
      if (bridge.levels?.length) {
        const levelsRow = document.createElement("div");
        levelsRow.className = "knowledge-nexus-bridge-levels";
        appendText(levelsRow, "span", "🎯 体验关卡：", "knowledge-nexus-bridge-levels__label");

        bridge.levels.forEach((bl) => {
          const targetChapter = allChapters.find((c) => c.chapterId === bl.chapterId);
          const targetLevel = targetChapter?.levels?.find((l) => l.moduleId === bl.moduleId);
          const levelId = targetLevel?.levelId || `${bl.chapterId}-L01`;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "nexus-bridge-level-btn";
          btn.dataset.nexusJumpLevel = levelId;
          btn.dataset.chapterId = bl.chapterId;
          btn.dataset.levelId = levelId;
          btn.textContent = `${targetChapter?.name ? targetChapter.name.slice(0, 4) : bl.chapterId} · ${bl.label}`;
          btn.addEventListener("click", () => {
            overlay.remove();
            if (typeof onSelectLevel === "function") {
              onSelectLevel(bl.chapterId, levelId);
            }
          });
          levelsRow.append(btn);
        });
        card.append(levelsRow);
      }

      bridgesGrid.append(card);
    });

    body.append(bridgesGrid);
  }

  modal.append(body);
  overlay.append(modal);

  // 事件委托：切换选项卡
  tabsNav.addEventListener("click", (e) => {
    const tabBtn = e.target.closest("[data-nexus-tab]");
    if (tabBtn && typeof onSwitchTab === "function") {
      const nextTab = tabBtn.dataset.nexusTab;
      if (nextTab !== activeTab) {
        onSwitchTab(nextTab);
      }
    }
  });

  return overlay;
}

const KnowledgeConstellationView = {
  createMindCompassBriefing,
  createConstellationBoard,
  renderKnowledgeConstellation,
  createKnowledgeNexusModal,
  getNodeCoordinates,
  CONSTELLATION_COORDINATES_BY_CHAPTER
};

if (typeof globalThis !== "undefined") {
  globalThis.KnowledgeConstellationView = KnowledgeConstellationView;
}

export default KnowledgeConstellationView;

