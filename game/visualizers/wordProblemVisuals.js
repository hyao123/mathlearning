const { SVG_NS, createSvg, parseNumbers, safeAddListener, createControlBtn, safeClassAdd, safeClassRemove } = require('./visualizerCore.js');

function renderChickenRabbitPen(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--chicken-rabbit";
  card.dataset.visualType = "chicken-rabbit";

  const isVehicle = prompt.includes("轮") || prompt.includes("车");
  const nums = parseNumbers(prompt);
  const totalHeads = nums.length >= 2 ? nums[0] : 10;
  const totalLegs = nums.length >= 2 ? nums[1] : 28;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">${isVehicle ? "🚗 车辆与轮子泊位检视台" : "🐔🐰 头脚方阵检视台"}</span>
    <span class="question-visual__subbadge">假设置换修正模型</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const leftX = 35;
  const cardW = 175;
  const cardH = 75;

  const rectA = document.createElementNS(SVG_NS, "rect");
  rectA.setAttribute("x", String(leftX));
  rectA.setAttribute("y", "20");
  rectA.setAttribute("width", String(cardW));
  rectA.setAttribute("height", String(cardH));
  rectA.setAttribute("rx", "10");
  rectA.setAttribute("fill", "#1e293b");
  rectA.setAttribute("stroke", "#38bdf8");
  rectA.setAttribute("stroke-width", "2");
  svg.append(rectA);

  const titleA = document.createElementNS(SVG_NS, "text");
  titleA.setAttribute("x", String(leftX + cardW / 2));
  titleA.setAttribute("y", "46");
  titleA.setAttribute("text-anchor", "middle");
  titleA.setAttribute("font-size", "14");
  titleA.setAttribute("font-weight", "bold");
  titleA.setAttribute("fill", "#38bdf8");
  titleA.textContent = isVehicle ? "🚲 自行车 / 2轮车" : "🐔 鸡（标配 2 脚）";
  svg.append(titleA);

  const subA = document.createElementNS(SVG_NS, "text");
  subA.setAttribute("x", String(leftX + cardW / 2));
  subA.setAttribute("y", "72");
  subA.setAttribute("text-anchor", "middle");
  subA.setAttribute("font-size", "12");
  subA.setAttribute("fill", "#94a3b8");
  subA.textContent = isVehicle ? "单车轮数 = 2 轮" : "每只脚数 = 2 只";
  svg.append(subA);

  const rightX = 250;
  const isTricycle = prompt.includes("三轮");
  const bRate = isTricycle ? 3 : 4;

  const rectB = document.createElementNS(SVG_NS, "rect");
  rectB.setAttribute("x", String(rightX));
  rectB.setAttribute("y", "20");
  rectB.setAttribute("width", String(cardW));
  rectB.setAttribute("height", String(cardH));
  rectB.setAttribute("rx", "10");
  rectB.setAttribute("fill", "#1e293b");
  rectB.setAttribute("stroke", "#a855f7");
  rectB.setAttribute("stroke-width", "2");
  svg.append(rectB);

  const titleB = document.createElementNS(SVG_NS, "text");
  titleB.setAttribute("x", String(rightX + cardW / 2));
  titleB.setAttribute("y", "46");
  titleB.setAttribute("text-anchor", "middle");
  titleB.setAttribute("font-size", "14");
  titleB.setAttribute("font-weight", "bold");
  titleB.setAttribute("fill", "#a855f7");
  titleB.textContent = isVehicle ? (isTricycle ? "🛺 三轮车（3轮）" : "🚗 四轮车（4轮）") : "🐰 兔子（标配 4 脚）";
  svg.append(titleB);

  const subB = document.createElementNS(SVG_NS, "text");
  subB.setAttribute("x", String(rightX + cardW / 2));
  subB.setAttribute("y", "72");
  subB.setAttribute("text-anchor", "middle");
  subB.setAttribute("font-size", "12");
  subB.setAttribute("fill", "#94a3b8");
  subB.textContent = isVehicle ? `单车轮数 = ${bRate} 轮` : "每只脚数 = 4 只";
  svg.append(subB);

  const bottomBox = document.createElementNS(SVG_NS, "rect");
  bottomBox.setAttribute("x", "35");
  bottomBox.setAttribute("y", "106");
  bottomBox.setAttribute("width", "390");
  bottomBox.setAttribute("height", "32");
  bottomBox.setAttribute("rx", "6");
  bottomBox.setAttribute("fill", "#0f172a");
  bottomBox.setAttribute("stroke", "#334155");
  bottomBox.setAttribute("stroke-width", "1");
  svg.append(bottomBox);

  const statsText = document.createElementNS(SVG_NS, "text");
  statsText.setAttribute("x", "230");
  statsText.setAttribute("y", "127");
  statsText.setAttribute("text-anchor", "middle");
  statsText.setAttribute("font-size", "12");
  statsText.setAttribute("font-weight", "bold");
  statsText.setAttribute("fill", "#f59e0b");
  statsText.textContent = `总数：共 ${totalHeads} ${isVehicle ? "辆车" : "只头"}，实际共 ${totalLegs} ${isVehicle ? "个轮子" : "只脚"} ➔ 单次置换差 = ${bRate - 2}`;
  svg.append(statsText);

  // Interactive manipulative control bar
  const controls = document.createElement("div");
  controls.className = "question-visual__controls question-visual__controls--chicken-rabbit";
  controls.dataset.manipulative = "chicken-rabbit";

  const btnRow = document.createElement("div");
  btnRow.className = "question-visual__control-row";

  const nameA = isVehicle ? "两轮车" : "鸡";
  const nameB = isVehicle ? (isTricycle ? "三轮车" : "四轮车") : "兔子";

  const btnAllA = createControlBtn(`全设为${nameA}`, "", `假设全部为${nameA}`);
  btnAllA.setAttribute("data-solve-btn", "true");
  const btnSubB = createControlBtn("➖ 换回1只", "", `减少1只${nameB}`);
  const btnAddB = createControlBtn(`➕ 置换1只为${nameB}`, "", `增加1只${nameB}`);
  const btnAllB = createControlBtn(`全设为${nameB}`, "", `假设全部为${nameB}`);
  btnAllB.setAttribute("data-solve-btn", "true");
  btnRow.append(btnAllA, btnSubB, btnAddB, btnAllB);

  const sliderRow = document.createElement("div");
  sliderRow.className = "question-visual__slider-row";
  const sliderLabel = document.createElement("label");
  sliderLabel.className = "question-visual__slider-label";
  sliderLabel.innerHTML = `<span>${isVehicle ? "🚗 多轮车" : "🐰 兔子"}置换数: <strong class="cr-count-b">0</strong> / ${totalHeads}</span>`;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.className = "question-visual__slider";
  slider.min = "0";
  slider.max = String(totalHeads);
  slider.value = "0";
  slider.setAttribute("aria-label", "置换数量滑块");
  sliderLabel.append(slider);
  sliderRow.append(sliderLabel);

  const metricsRow = document.createElement("div");
  metricsRow.className = "question-visual__metrics";
  const m1 = document.createElement("span");
  m1.className = "question-visual__metric";
  m1.innerHTML = `${nameA}: <strong class="cr-stat-a">${totalHeads}</strong>`;
  const m2 = document.createElement("span");
  m2.className = "question-visual__metric";
  m2.innerHTML = `${nameB}: <strong class="cr-stat-b">0</strong>`;
  const m3 = document.createElement("span");
  m3.className = "question-visual__metric question-visual__metric--highlight";
  m3.innerHTML = `总脚数: <strong class="cr-stat-legs">${totalHeads * 2}</strong> / 目标 ${totalLegs}`;
  metricsRow.append(m1, m2, m3);

  const statusBox = document.createElement("div");
  statusBox.className = "question-visual__status";

  function updateCR(rabbitCount) {
    const r = Math.max(0, Math.min(totalHeads, Number(rabbitCount) || 0));
    slider.value = String(r);
    const countBLabel = sliderLabel.querySelector ? sliderLabel.querySelector(".cr-count-b") : null;
    if (countBLabel) countBLabel.textContent = String(r);

    const a = totalHeads - r;
    const statA = metricsRow.querySelector ? metricsRow.querySelector(".cr-stat-a") : null;
    const statB = metricsRow.querySelector ? metricsRow.querySelector(".cr-stat-b") : null;
    const statLegs = metricsRow.querySelector ? metricsRow.querySelector(".cr-stat-legs") : null;
    if (statA) statA.textContent = String(a);
    if (statB) statB.textContent = String(r);

    const calcLegs = a * 2 + r * bRate;
    if (statLegs) statLegs.textContent = String(calcLegs);

    const stepDiff = bRate - 2;
    if (calcLegs === totalLegs) {
      statusBox.className = "question-visual__status is-balanced";
      statusBox.textContent = isRevealed ? `🎉 达成完美平衡！${nameB} ${r} ${isVehicle ? "辆" : "只"}，${nameA} ${a} ${isVehicle ? "辆" : "只"}！` : `🎉 达成数量平衡！当前脚数与目标脚数完全吻合！`;
      safeClassAdd(card, "is-balanced");
      statsText.textContent = isRevealed ? `🌟 平衡达成！${nameB}=${r}, ${nameA}=${a}，脚数刚好为 ${totalLegs}` : `🌟 平衡达成！当前总脚数刚好为 ${totalLegs}`;
      statsText.setAttribute("fill", "#22c55e");
    } else if (calcLegs < totalLegs) {
      statusBox.className = "question-visual__status";
      const need = totalLegs - calcLegs;
      const needR = Math.ceil(need / stepDiff);
      statusBox.textContent = isRevealed ? `脚数尚缺 ${need} 只 ➔ 还需将 ${needR} 只${nameA}置换为${nameB}` : `脚数尚缺 ${need} 只 ➔ 尝试继续置换以补齐脚数`;
      safeClassRemove(card, "is-balanced");
      statsText.textContent = `总数：共 ${totalHeads} ${isVehicle ? "辆车" : "只头"}，当前 ${calcLegs} 脚（缺 ${need} 脚）`;
      statsText.setAttribute("fill", "#f59e0b");
    } else {
      statusBox.className = "question-visual__status";
      const over = calcLegs - totalLegs;
      const overR = Math.ceil(over / stepDiff);
      statusBox.textContent = isRevealed ? `脚数超出 ${over} 只 ➔ 需将 ${overR} 只${nameB}换回为${nameA}` : `脚数超出 ${over} 只 ➔ 尝试减少置换以配平脚数`;
      safeClassRemove(card, "is-balanced");
      statsText.textContent = `总数：共 ${totalHeads} ${isVehicle ? "辆车" : "只头"}，当前 ${calcLegs} 脚（多 ${over} 脚）`;
      statsText.setAttribute("fill", "#f59e0b");
    }
  }

  safeAddListener(slider, "input", (e) => updateCR(e.target.value));
  safeAddListener(btnAllA, "click", () => updateCR(0));
  safeAddListener(btnAllB, "click", () => updateCR(totalHeads));
  safeAddListener(btnSubB, "click", () => updateCR(Number(slider.value) - 1));
  safeAddListener(btnAddB, "click", () => updateCR(Number(slider.value) + 1));

  controls.append(btnRow, sliderRow, metricsRow, statusBox);
  updateCR(0);

  card.append(svg);
  card.append(controls);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "💡 假设法导引：先假设全部是 2 脚（或 2 轮），算出脚数差额，再除以单件差值即可得出多脚对象数量。";
  card.append(legend);

  return card;
}

/**
 * 4. 双方案盈亏平衡对比台 (Dual Balance Scale)
 */

function renderSurplusDeficitBalance(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--surplus-deficit";
  card.dataset.visualType = "surplus-deficit";

  const nums = parseNumbers(prompt);
  const r1Rate = nums.length >= 1 ? nums[0] : 4;
  const r1Surplus = nums.length >= 2 ? nums[1] : 8;
  const r2Rate = nums.length >= 3 ? nums[2] : 6;
  const r2Deficit = nums.length >= 4 ? nums[3] : 2;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">⚖️ 双方案盈亏天平对比台</span>
    <span class="question-visual__subbadge">两次分配差额平衡</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const leftRect = document.createElementNS(SVG_NS, "rect");
  leftRect.setAttribute("x", "30");
  leftRect.setAttribute("y", "20");
  leftRect.setAttribute("width", "185");
  leftRect.setAttribute("height", "80");
  leftRect.setAttribute("rx", "10");
  leftRect.setAttribute("fill", "rgba(34, 197, 94, 0.08)");
  leftRect.setAttribute("stroke", "#22c55e");
  leftRect.setAttribute("stroke-width", "2");
  svg.append(leftRect);

  const p1Title = document.createElementNS(SVG_NS, "text");
  p1Title.setAttribute("x", "122");
  p1Title.setAttribute("y", "44");
  p1Title.setAttribute("text-anchor", "middle");
  p1Title.setAttribute("font-size", "13");
  p1Title.setAttribute("font-weight", "bold");
  p1Title.setAttribute("fill", "#22c55e");
  p1Title.textContent = `方案一：每人分 ${r1Rate} 个`;
  svg.append(p1Title);

  const p1Surplus = document.createElementNS(SVG_NS, "text");
  p1Surplus.setAttribute("x", "122");
  p1Surplus.setAttribute("y", "76");
  p1Surplus.setAttribute("text-anchor", "middle");
  p1Surplus.setAttribute("font-size", "15");
  p1Surplus.setAttribute("font-weight", "bold");
  p1Surplus.setAttribute("fill", "#4ade80");
  p1Surplus.textContent = `📦 剩余: +${r1Surplus} 个 (盈)`;
  svg.append(p1Surplus);

  const rightRect = document.createElementNS(SVG_NS, "rect");
  rightRect.setAttribute("x", "245");
  rightRect.setAttribute("y", "20");
  rightRect.setAttribute("width", "185");
  rightRect.setAttribute("height", "80");
  rightRect.setAttribute("rx", "10");
  rightRect.setAttribute("fill", "rgba(239, 68, 68, 0.08)");
  rightRect.setAttribute("stroke", "#ef4444");
  rightRect.setAttribute("stroke-width", "2");
  svg.append(rightRect);

  const p2Title = document.createElementNS(SVG_NS, "text");
  p2Title.setAttribute("x", "337");
  p2Title.setAttribute("y", "44");
  p2Title.setAttribute("text-anchor", "middle");
  p2Title.setAttribute("font-size", "13");
  p2Title.setAttribute("font-weight", "bold");
  p2Title.setAttribute("fill", "#ef4444");
  p2Title.textContent = `方案二：每人分 ${r2Rate} 个`;
  svg.append(p2Title);

  const p2Deficit = document.createElementNS(SVG_NS, "text");
  p2Deficit.setAttribute("x", "337");
  p2Deficit.setAttribute("y", "76");
  p2Deficit.setAttribute("text-anchor", "middle");
  p2Deficit.setAttribute("font-size", "15");
  p2Deficit.setAttribute("font-weight", "bold");
  p2Deficit.setAttribute("fill", "#f87171");
  p2Deficit.textContent = `⚠️ 短缺: -${r2Deficit} 个 (亏)`;
  svg.append(p2Deficit);

  const vsTag = document.createElementNS(SVG_NS, "text");
  vsTag.setAttribute("x", "230");
  vsTag.setAttribute("y", "64");
  vsTag.setAttribute("text-anchor", "middle");
  vsTag.setAttribute("font-size", "12");
  vsTag.setAttribute("font-weight", "bold");
  vsTag.setAttribute("fill", "#f59e0b");
  vsTag.textContent = "VS";
  svg.append(vsTag);

  const singleDiff = Math.abs(r2Rate - r1Rate) || 1;
  const totalDiff = r1Surplus + r2Deficit;
  const fText = document.createElementNS(SVG_NS, "text");
  fText.setAttribute("x", "230");
  fText.setAttribute("y", "128");
  fText.setAttribute("text-anchor", "middle");
  fText.setAttribute("font-size", "12");
  fText.setAttribute("font-weight", "bold");
  fText.setAttribute("fill", "#38bdf8");
  fText.textContent = isRevealed ? `总差额 (${r1Surplus} + ${r2Deficit} = ${totalDiff}) ÷ 单人差额 (${r2Rate} - ${r1Rate} = ${singleDiff}) = 人数 (${Math.round(totalDiff / singleDiff) || "?"} 人)` : `总差额 (${r1Surplus} + ${r2Deficit} = ${totalDiff}) ÷ 单人差额 (|${r2Rate} - ${r1Rate}| = ${singleDiff}) = 人数 ?`;
  svg.append(fText);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "⚖️ 盈亏对比导引：一盈一亏，把剩余量与缺少量相加得到总差额，除以两次每人分配差即可。";
  card.append(legend);

  return card;
}

/**
 * 5. 速算与巧算：磁吸重组桥梁 (Magnetic Snap Pairing)
 */

function renderTreePlantingRoad(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--tree-planting";
  card.dataset.visualType = "tree-planting";

  const nums = parseNumbers(prompt);
  const isClosed = prompt.includes("环形") || prompt.includes("圆形") || prompt.includes("圆周") || prompt.includes("封闭") || prompt.includes("四周") || prompt.includes("池塘");
  const isNoEnd = prompt.includes("两端都不") || prompt.includes("两端均不") || prompt.includes("两头都不") || prompt.includes("两头均不");
  const isOneEnd = prompt.includes("只种一端") || prompt.includes("只在一端") || prompt.includes("只装一端") || prompt.includes("一端放") || prompt.includes("一端种");
  const isBothSides = prompt.includes("两旁") || prompt.includes("两侧") || prompt.includes("两边都");

  // 间距解析（例如“每隔 5 米”）
  const intervalMatch = prompt.match(/每隔\s*(\d+)\s*米/);
  const interval = intervalMatch ? Number(intervalMatch[1]) : (nums.length >= 2 ? (nums[0] < nums[1] ? nums[0] : nums[1]) : 4);

  // 全长或总数解析
  const totalLenMatch = prompt.match(/(\d+)\s*米长/) || prompt.match(/(?:一条|长|全长)\s*(\d+)\s*米/);
  const countMatch = prompt.match(/(?:共有|放|装|种)\s*(\d+)\s*个/) || prompt.match(/(\d+)\s*(?:个|盏|棵)(?:标杆|浮标|树|灯)/);

  let totalLen = 20;
  let intervalsCount = 4;
  let singleSideTrees = 5;

  if (totalLenMatch) {
    totalLen = Number(totalLenMatch[1]);
    intervalsCount = Math.max(1, Math.floor(totalLen / interval));
    if (isClosed) singleSideTrees = intervalsCount;
    else if (isNoEnd) singleSideTrees = Math.max(0, intervalsCount - 1);
    else if (isOneEnd) singleSideTrees = intervalsCount;
    else singleSideTrees = intervalsCount + 1;
  } else if (countMatch) {
    const givenCount = Number(countMatch[1]);
    if (isClosed) {
      intervalsCount = givenCount;
      singleSideTrees = givenCount;
    } else if (isNoEnd) {
      singleSideTrees = givenCount;
      intervalsCount = givenCount + 1;
    } else if (isOneEnd) {
      singleSideTrees = givenCount;
      intervalsCount = givenCount;
    } else {
      singleSideTrees = givenCount;
      intervalsCount = Math.max(1, givenCount - 1);
    }
    totalLen = intervalsCount * interval;
  } else {
    totalLen = nums[0] || 20;
    intervalsCount = Math.max(1, Math.floor(totalLen / interval));
    singleSideTrees = isClosed ? intervalsCount : isNoEnd ? Math.max(0, intervalsCount - 1) : isOneEnd ? intervalsCount : intervalsCount + 1;
  }

  const multiplier = isBothSides ? 2 : 1;
  const totalTrees = singleSideTrees * multiplier;

  const modelName = isClosed ? "封闭环形模型" : isNoEnd ? "两端不种模型" : isOneEnd ? "只种一端模型" : "两端都种模型";
  const formulaDesc = isClosed
    ? "棵数 ＝ 间隔数"
    : isNoEnd
    ? "棵数 ＝ 间隔数 － 1"
    : isOneEnd
    ? "棵数 ＝ 间隔数"
    : "棵数 ＝ 间隔数 ＋ 1";

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">${isClosed ? "🔄 封闭环形间隔模型" : "🌲 绿化小道与植树标尺"}</span>
    <span class="question-visual__subbadge">${modelName}（${formulaDesc}${isBothSides ? " · 两侧双倍" : ""}）</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  if (isClosed) {
    // 环形封闭路线可视化
    const cx = 230, cy = 76, r = 44;
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", String(cx));
    circle.setAttribute("cy", String(cy));
    circle.setAttribute("r", String(r));
    circle.setAttribute("fill", "rgba(56, 189, 248, 0.08)");
    circle.setAttribute("stroke", "#38bdf8");
    circle.setAttribute("stroke-width", "3");
    circle.setAttribute("stroke-dasharray", "4 3");
    svg.append(circle);

    const centerText = document.createElementNS(SVG_NS, "text");
    centerText.setAttribute("x", String(cx));
    centerText.setAttribute("y", String(cy - 2));
    centerText.setAttribute("text-anchor", "middle");
    centerText.setAttribute("font-size", "11");
    centerText.setAttribute("font-weight", "bold");
    centerText.setAttribute("fill", "#38bdf8");
    centerText.textContent = `周长 ${totalLen} 米`;
    svg.append(centerText);

    const centerSub = document.createElementNS(SVG_NS, "text");
    centerSub.setAttribute("x", String(cx));
    centerSub.setAttribute("y", String(cy + 14));
    centerSub.setAttribute("text-anchor", "middle");
    centerSub.setAttribute("font-size", "10");
    centerSub.setAttribute("fill", "#94a3b8");
    centerSub.textContent = `${intervalsCount} 个间隔`;
    svg.append(centerSub);

    const displayCount = Math.min(intervalsCount, 6);
    for (let i = 0; i < displayCount; i++) {
      const angle = (i * 2 * Math.PI) / displayCount - Math.PI / 2;
      const tx = cx + r * Math.cos(angle);
      const ty = cy + r * Math.sin(angle);

      const tree = document.createElementNS(SVG_NS, "text");
      tree.setAttribute("x", String(tx));
      tree.setAttribute("y", String(ty + 5));
      tree.setAttribute("text-anchor", "middle");
      tree.setAttribute("font-size", "16");
      tree.textContent = "📍";
      svg.append(tree);
    }

    const formulaTag = document.createElementNS(SVG_NS, "text");
    formulaTag.setAttribute("x", "230");
    formulaTag.setAttribute("y", "138");
    formulaTag.setAttribute("text-anchor", "middle");
    formulaTag.setAttribute("font-size", "11.5");
    formulaTag.setAttribute("font-weight", "bold");
    formulaTag.setAttribute("fill", "#22c55e");
    formulaTag.textContent = isRevealed ? `封闭路线：间隔段数 ＝ 标点数 ＝ ${intervalsCount} 个` : `封闭路线：间隔段数 ＝ 标点数 ＝ ?`;
    svg.append(formulaTag);
  } else {
    // 直线路线可视化（自适应防重叠）
    const roadY = 82;
    const startX = 45;
    const endX = 415;

    const road = document.createElementNS(SVG_NS, "line");
    road.setAttribute("x1", String(startX));
    road.setAttribute("y1", String(roadY));
    road.setAttribute("x2", String(endX));
    road.setAttribute("y2", String(roadY));
    road.setAttribute("stroke", "#64748b");
    road.setAttribute("stroke-width", "6");
    road.setAttribute("stroke-linecap", "round");
    svg.append(road);

    const dimLine = document.createElementNS(SVG_NS, "line");
    dimLine.setAttribute("x1", String(startX));
    dimLine.setAttribute("y1", "24");
    dimLine.setAttribute("x2", String(endX));
    dimLine.setAttribute("y2", "24");
    dimLine.setAttribute("stroke", "#f59e0b");
    dimLine.setAttribute("stroke-width", "2");
    svg.append(dimLine);

    const dimTag = document.createElementNS(SVG_NS, "text");
    dimTag.setAttribute("x", "230");
    dimTag.setAttribute("y", "18");
    dimTag.setAttribute("text-anchor", "middle");
    dimTag.setAttribute("font-size", "12");
    dimTag.setAttribute("font-weight", "bold");
    dimTag.setAttribute("fill", "#f59e0b");
    const isAskLen = prompt.includes("长多少米");
    dimTag.textContent = isAskLen
      ? (isRevealed ? `全长 ＝ 间隔数 (${intervalsCount}) × 间距 (${interval}米) ＝ ${totalLen} 米` : `全长 ＝ 间隔数 (${intervalsCount}) × 间距 (${interval}米) ＝ ? 米`)
      : `全长 ${totalLen} 米`;
    svg.append(dimTag);

    if (intervalsCount <= 6) {
      const step = (endX - startX) / intervalsCount;
      for (let i = 0; i <= intervalsCount; i++) {
        const tx = startX + i * step;
        const isStartNoTree = i === 0 && isNoEnd;
        const isEndNoTree = i === intervalsCount && (isNoEnd || isOneEnd);
        const hasTree = !isStartNoTree && !isEndNoTree;

        const tree = document.createElementNS(SVG_NS, "text");
        tree.setAttribute("x", String(tx));
        tree.setAttribute("y", String(roadY - 10));
        tree.setAttribute("text-anchor", "middle");
        tree.setAttribute("font-size", hasTree ? "18" : "12");
        tree.textContent = hasTree ? "🌲" : "⭕";
        svg.append(tree);

        const tNum = document.createElementNS(SVG_NS, "text");
        tNum.setAttribute("x", String(tx));
        tNum.setAttribute("y", String(roadY + 20));
        tNum.setAttribute("text-anchor", "middle");
        tNum.setAttribute("font-size", "10");
        tNum.setAttribute("fill", hasTree ? "#22c55e" : "#94a3b8");
        tNum.textContent = hasTree ? `第${i + (isNoEnd ? 0 : 1)}棵` : "不种";
        svg.append(tNum);

        if (i < intervalsCount) {
          const midX = tx + step / 2;
          const iLabel = document.createElementNS(SVG_NS, "text");
          iLabel.setAttribute("x", String(midX));
          iLabel.setAttribute("y", String(roadY + 36));
          iLabel.setAttribute("text-anchor", "middle");
          iLabel.setAttribute("font-size", "10");
          iLabel.setAttribute("fill", "#cbd5e1");
          iLabel.textContent = `[${interval}m]`;
          svg.append(iLabel);
        }
      }
    } else {
      // 大尺度自适应模式（防重叠）：首段 + 省略 + 末段
      const p1 = startX + 15;
      const p2 = startX + 90;
      const p3 = endX - 90;
      const p4 = endX - 15;

      const hasStart = !isNoEnd;
      const t1 = document.createElementNS(SVG_NS, "text");
      t1.setAttribute("x", String(p1)); t1.setAttribute("y", String(roadY - 10));
      t1.setAttribute("text-anchor", "middle"); t1.setAttribute("font-size", hasStart ? "18" : "12");
      t1.textContent = hasStart ? "🌲" : "⭕";
      svg.append(t1);

      const l1 = document.createElementNS(SVG_NS, "text");
      l1.setAttribute("x", String(p1)); l1.setAttribute("y", String(roadY + 20));
      l1.setAttribute("text-anchor", "middle"); l1.setAttribute("font-size", "10");
      l1.setAttribute("fill", hasStart ? "#22c55e" : "#94a3b8");
      l1.textContent = hasStart ? "起点" : "不种";
      svg.append(l1);

      const t2 = document.createElementNS(SVG_NS, "text");
      t2.setAttribute("x", String(p2)); t2.setAttribute("y", String(roadY - 10));
      t2.setAttribute("text-anchor", "middle"); t2.setAttribute("font-size", "18");
      t2.textContent = "🌲";
      svg.append(t2);

      const br1 = document.createElementNS(SVG_NS, "text");
      br1.setAttribute("x", String((p1 + p2) / 2)); br1.setAttribute("y", String(roadY + 36));
      br1.setAttribute("text-anchor", "middle"); br1.setAttribute("font-size", "10");
      br1.setAttribute("fill", "#cbd5e1"); br1.textContent = `[${interval}m]`;
      svg.append(br1);

      // 中间省略区
      const midBox = document.createElementNS(SVG_NS, "rect");
      midBox.setAttribute("x", "160"); midBox.setAttribute("y", "58");
      midBox.setAttribute("width", "140"); midBox.setAttribute("height", "26");
      midBox.setAttribute("rx", "13"); midBox.setAttribute("fill", "#0f172a");
      midBox.setAttribute("stroke", "#38bdf8"); midBox.setAttribute("stroke-width", "1.5");
      svg.append(midBox);

      const midText = document.createElementNS(SVG_NS, "text");
      midText.setAttribute("x", "230"); midText.setAttribute("y", "75");
      midText.setAttribute("text-anchor", "middle"); midText.setAttribute("font-size", "11");
      midText.setAttribute("font-weight", "bold"); midText.setAttribute("fill", "#38bdf8");
      midText.textContent = `…… 共 ${intervalsCount} 个间隔 ……`;
      svg.append(midText);

      const t3 = document.createElementNS(SVG_NS, "text");
      t3.setAttribute("x", String(p3)); t3.setAttribute("y", String(roadY - 10));
      t3.setAttribute("text-anchor", "middle"); t3.setAttribute("font-size", "18");
      t3.textContent = "🌲";
      svg.append(t3);

      const hasEnd = !isNoEnd && !isOneEnd;
      const t4 = document.createElementNS(SVG_NS, "text");
      t4.setAttribute("x", String(p4)); t4.setAttribute("y", String(roadY - 10));
      t4.setAttribute("text-anchor", "middle"); t4.setAttribute("font-size", hasEnd ? "18" : "12");
      t4.textContent = hasEnd ? "🌲" : "⭕";
      svg.append(t4);

      const l4 = document.createElementNS(SVG_NS, "text");
      l4.setAttribute("x", String(p4)); l4.setAttribute("y", String(roadY + 20));
      l4.setAttribute("text-anchor", "middle"); l4.setAttribute("font-size", "10");
      l4.setAttribute("fill", hasEnd ? "#22c55e" : "#94a3b8");
      l4.textContent = hasEnd ? "终点" : "不种";
      svg.append(l4);

      const br2 = document.createElementNS(SVG_NS, "text");
      br2.setAttribute("x", String((p3 + p4) / 2)); br2.setAttribute("y", String(roadY + 36));
      br2.setAttribute("text-anchor", "middle"); br2.setAttribute("font-size", "10");
      br2.setAttribute("fill", "#cbd5e1"); br2.textContent = `[${interval}m]`;
      svg.append(br2);
    }

    const summaryText = document.createElementNS(SVG_NS, "text");
    summaryText.setAttribute("x", "230");
    summaryText.setAttribute("y", "138");
    summaryText.setAttribute("text-anchor", "middle");
    summaryText.setAttribute("font-size", "11.5");
    summaryText.setAttribute("font-weight", "bold");
    summaryText.setAttribute("fill", "#22c55e");
    if (isAskLen) {
      summaryText.textContent = isRevealed ? `根据题意：全长 ＝ ${intervalsCount} × ${interval} ＝ ${totalLen} 米` : "根据植树模型分析全长";
    } else {
      summaryText.textContent = isRevealed
        ? (isBothSides ? `单侧 ${singleSideTrees} 棵 × 2侧 ＝ 共需 ${totalTrees} 棵` : `总计棵数 ＝ ${totalTrees} 棵`)
        : (isBothSides ? `单侧 ${formulaDesc} × 2 ＝ 共需 ? 棵` : `总计棵数 ＝ ${formulaDesc} ＝ ? 棵`);
    }
    svg.append(summaryText);
  }

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  if (isClosed) {
    legend.textContent = `🌲 封闭环形植树：封闭路线上首尾相接，间隔数刚好等于棵数（${intervalsCount} 个间隔 ➔ 需 ${singleSideTrees} 棵/盏）。${isBothSides ? "两旁双侧需乘以 2。" : ""}`;
  } else if (isNoEnd) {
    legend.textContent = `🌲 两端都不种：棵数比间隔数少 1（${intervalsCount} 个间隔 ➔ 需 ${singleSideTrees} 棵/盏）。${isBothSides ? "两旁双侧需乘以 2。" : ""}`;
  } else if (isOneEnd) {
    legend.textContent = `🌲 只种一端：一头种一头不种，棵数等于间隔数（${intervalsCount} 个间隔 ➔ 需 ${singleSideTrees} 棵/盏）。${isBothSides ? "两旁双侧需乘以 2。" : ""}`;
  } else {
    legend.textContent = `🌲 两端都种：棵数比间隔数多 1（${intervalsCount} 个间隔 ➔ 需 ${singleSideTrees} 棵/盏）。${isBothSides ? "两旁双侧需乘以 2。" : ""}`;
  }
  card.append(legend);

  return card;
}

/**
 * 8. 平均数问题：移多补少水银柱 (Leveling Bar Chart)
 */

function renderAverageLeveling(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--average";
  card.dataset.visualType = "average";

  const nums = parseNumbers(prompt);
  const values = nums.length >= 2 ? nums.slice(0, 5) : [85, 90, 95, 86];
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / values.length);

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📊 移多补少均值水银柱</span>
    <span class="question-visual__subbadge">各柱对齐基准水平线</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const minV = Math.min(...values, avg) - 5;
  const maxV = Math.max(...values, avg) + 5;
  const range = maxV - minV || 10;

  const barW = 44;
  const count = values.length;
  const stepX = 360 / (count + 1);

  const meanY = 110 - ((avg - minV) / range) * 70;
  const meanLine = document.createElementNS(SVG_NS, "line");
  meanLine.setAttribute("x1", "40");
  meanLine.setAttribute("y1", String(meanY));
  meanLine.setAttribute("x2", "420");
  meanLine.setAttribute("y2", String(meanY));
  meanLine.setAttribute("stroke", "#f59e0b");
  meanLine.setAttribute("stroke-width", "2");
  meanLine.setAttribute("stroke-dasharray", "4,3");
  svg.append(meanLine);

  const meanTag = document.createElementNS(SVG_NS, "text");
  meanTag.setAttribute("x", "422");
  meanTag.setAttribute("y", String(meanY + 4));
  meanTag.setAttribute("font-size", "11");
  meanTag.setAttribute("font-weight", "bold");
  meanTag.setAttribute("fill", "#f59e0b");
  meanTag.textContent = isRevealed ? `均值线 ${avg}` : `均值线 ?`;
  svg.append(meanTag);

  values.forEach((v, i) => {
    const cx = 50 + (i + 1) * stepX;
    const barH = ((v - minV) / range) * 70;
    const y = 110 - barH;

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", String(cx - barW / 2));
    rect.setAttribute("y", String(y));
    rect.setAttribute("width", String(barW));
    rect.setAttribute("height", String(barH));
    rect.setAttribute("rx", "6");
    rect.setAttribute("fill", v >= avg ? "rgba(56, 189, 248, 0.4)" : "rgba(148, 163, 184, 0.4)");
    rect.setAttribute("stroke", v >= avg ? "#38bdf8" : "#94a3b8");
    rect.setAttribute("stroke-width", "1.5");
    svg.append(rect);

    const valTag = document.createElementNS(SVG_NS, "text");
    valTag.setAttribute("x", String(cx));
    valTag.setAttribute("y", String(y - 6));
    valTag.setAttribute("text-anchor", "middle");
    valTag.setAttribute("font-size", "12");
    valTag.setAttribute("font-weight", "bold");
    valTag.setAttribute("fill", v >= avg ? "#38bdf8" : "#f8fafc");
    valTag.textContent = String(v);
    svg.append(valTag);

    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", String(cx));
    label.setAttribute("y", "128");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "10");
    label.setAttribute("fill", "#64748b");
    label.textContent = `第${i + 1}次`;
    svg.append(label);
  });

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "📊 平均数导引：将高于均值线的各部分多出量，移补至低于均值线的低洼柱，实现总体拉平。";
  card.append(legend);

  return card;
}

/**
 * 9. 火车过桥问题：全景标尺 (Train & Bridge Panorama)
 */

function renderTrainBridgeTrack(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--train-bridge";
  card.dataset.visualType = "train-bridge";

  const nums = parseNumbers(prompt);

  // Case 1: Chasing vehicle / relative speed (追赶补给车, 追上, 追及, 车尾相距)
  if (prompt.includes("追赶") || prompt.includes("追上") || prompt.includes("超过慢车") || prompt.includes("车尾相距") || prompt.includes("补给车")) {
    const isRearTailGiven = prompt.includes("车尾相距") || prompt.includes("车尾与");
    const rearL = nums.length >= 1 ? nums[0] : 100;
    const v1 = nums.length >= 2 ? nums[1] : 25;
    const v2 = nums.length >= 3 ? nums[2] : 15;
    const rawGap = nums.length >= 4 ? nums[3] : 200;
    const netGap = isRearTailGiven ? (rawGap - rearL) : rawGap;
    const speedDiff = Math.abs(v1 - v2) || 10;
    const time = Math.round(netGap / speedDiff) || 10;

    const header = document.createElement("div");
    header.className = "question-visual__header";
    header.innerHTML = `
      <span class="question-visual__badge">🚄 列车追及与车距全景标尺</span>
      <span class="question-visual__subbadge">净追及距离 ＝ 车尾间距 － 后车车长</span>
    `;
    card.append(header);

    const svgWidth = 460;
    const svgHeight = 150;
    const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

    // Track
    const track = document.createElementNS(SVG_NS, "line");
    track.setAttribute("x1", "20");
    track.setAttribute("y1", "90");
    track.setAttribute("x2", "440");
    track.setAttribute("y2", "90");
    track.setAttribute("stroke", "#475569");
    track.setAttribute("stroke-width", "4");
    svg.append(track);

    // Rear Train (x=30 to 130)
    const rearTrain = document.createElementNS(SVG_NS, "rect");
    rearTrain.setAttribute("x", "30");
    rearTrain.setAttribute("y", "64");
    rearTrain.setAttribute("width", "100");
    rearTrain.setAttribute("height", "26");
    rearTrain.setAttribute("rx", "4");
    rearTrain.setAttribute("fill", "#f59e0b");
    rearTrain.setAttribute("stroke", "#fbbf24");
    rearTrain.setAttribute("stroke-width", "2");
    svg.append(rearTrain);

    const rText = document.createElementNS(SVG_NS, "text");
    rText.setAttribute("x", "80");
    rText.setAttribute("y", "81");
    rText.setAttribute("text-anchor", "middle");
    rText.setAttribute("font-size", "11");
    rText.setAttribute("font-weight", "bold");
    rText.setAttribute("fill", "#0f172a");
    rText.textContent = `列车 ${rearL}m (${v1}m/s)`;
    svg.append(rText);

    // Front Supply Car (x=230 to 280)
    const frontCar = document.createElementNS(SVG_NS, "rect");
    frontCar.setAttribute("x", "230");
    frontCar.setAttribute("y", "64");
    frontCar.setAttribute("width", "50");
    frontCar.setAttribute("height", "26");
    frontCar.setAttribute("rx", "4");
    frontCar.setAttribute("fill", "#38bdf8");
    frontCar.setAttribute("stroke", "#60a5fa");
    frontCar.setAttribute("stroke-width", "2");
    svg.append(frontCar);

    const fText = document.createElementNS(SVG_NS, "text");
    fText.setAttribute("x", "255");
    fText.setAttribute("y", "81");
    fText.setAttribute("text-anchor", "middle");
    fText.setAttribute("font-size", "11");
    fText.setAttribute("font-weight", "bold");
    fText.setAttribute("fill", "#0f172a");
    fText.textContent = `补给车 (${v2}m/s)`;
    svg.append(fText);

    // Top dimension: Tail to Tail = 200m
    const d1 = document.createElementNS(SVG_NS, "path");
    d1.setAttribute("d", "M 30 45 L 230 45");
    d1.setAttribute("stroke", "#ec4899");
    d1.setAttribute("stroke-width", "2");
    svg.append(d1);

    const d1Text = document.createElementNS(SVG_NS, "text");
    d1Text.setAttribute("x", "130");
    d1Text.setAttribute("y", "38");
    d1Text.setAttribute("text-anchor", "middle");
    d1Text.setAttribute("font-size", "11");
    d1Text.setAttribute("font-weight", "bold");
    d1Text.setAttribute("fill", "#ec4899");
    d1Text.textContent = `车尾到车尾初始相距: ${rawGap}米`;
    svg.append(d1Text);

    // Bottom dimension: Head to Tail = 100m
    const d2 = document.createElementNS(SVG_NS, "path");
    d2.setAttribute("d", "M 130 115 L 230 115");
    d2.setAttribute("stroke", "#22c55e");
    d2.setAttribute("stroke-width", "2");
    svg.append(d2);

    const d2Text = document.createElementNS(SVG_NS, "text");
    d2Text.setAttribute("x", "180");
    d2Text.setAttribute("y", "132");
    d2Text.setAttribute("text-anchor", "middle");
    d2Text.setAttribute("font-size", "11");
    d2Text.setAttribute("font-weight", "bold");
    d2Text.setAttribute("fill", "#22c55e");
    d2Text.textContent = isRevealed ? `净追及距离: ${netGap}米` : `净追及距离: ? 米`;
    svg.append(d2Text);

    // Speed diff tag
    const diffTag = document.createElementNS(SVG_NS, "text");
    diffTag.setAttribute("x", "375");
    diffTag.setAttribute("y", "72");
    diffTag.setAttribute("text-anchor", "middle");
    diffTag.setAttribute("font-size", "11");
    diffTag.setAttribute("font-weight", "bold");
    diffTag.setAttribute("fill", "#fbbf24");
    diffTag.textContent = `速度差: ${speedDiff} m/s`;
    svg.append(diffTag);

    const timeTag = document.createElementNS(SVG_NS, "text");
    timeTag.setAttribute("x", "375");
    timeTag.setAttribute("y", "95");
    timeTag.setAttribute("text-anchor", "middle");
    timeTag.setAttribute("font-size", "11");
    timeTag.setAttribute("font-weight", "bold");
    timeTag.setAttribute("fill", "#22c55e");
    timeTag.textContent = isRevealed ? `追及: ${time} 秒` : `追及: ? 秒`;
    svg.append(timeTag);

    card.append(svg);

    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = `🚆 追及原理：后车车尾到前车车尾相距 ${rawGap} 米，减去后车长 ${rearL} 米，后车车头追前车车尾的实际追及距离为 ${netGap} 米。追及时间 ＝ ${netGap} ÷ (${v1} - ${v2}) ＝ ${time} 秒。`;
    card.append(legend);

    return card;
  }

  // Case 2: Standard train passing bridge or tunnel
  const trainL = nums.length >= 1 ? nums[0] : 150;
  const bridgeL = nums.length >= 2 ? nums[1] : 850;
  const totalL = trainL + bridgeL;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🚄 火车过桥全景动态标尺</span>
    <span class="question-visual__subbadge">车身长度参与路程运动</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const track = document.createElementNS(SVG_NS, "line");
  track.setAttribute("x1", "20");
  track.setAttribute("y1", "90");
  track.setAttribute("x2", "440");
  track.setAttribute("y2", "90");
  track.setAttribute("stroke", "#475569");
  track.setAttribute("stroke-width", "4");
  svg.append(track);

  const bridge = document.createElementNS(SVG_NS, "rect");
  bridge.setAttribute("x", "120");
  bridge.setAttribute("y", "62");
  bridge.setAttribute("width", "200");
  bridge.setAttribute("height", "28");
  bridge.setAttribute("rx", "4");
  bridge.setAttribute("fill", "rgba(56, 189, 248, 0.15)");
  bridge.setAttribute("stroke", "#38bdf8");
  bridge.setAttribute("stroke-width", "2");
  svg.append(bridge);

  const bText = document.createElementNS(SVG_NS, "text");
  bText.setAttribute("x", "220");
  bText.setAttribute("y", "80");
  bText.setAttribute("text-anchor", "middle");
  bText.setAttribute("font-size", "12");
  bText.setAttribute("font-weight", "bold");
  bText.setAttribute("fill", "#38bdf8");
  bText.textContent = prompt.includes("隧道") ? `🚇 隧道长 ${bridgeL} 米` : `🌉 桥长 ${bridgeL} 米`;
  svg.append(bText);

  const train = document.createElementNS(SVG_NS, "rect");
  train.setAttribute("x", "320");
  train.setAttribute("y", "62");
  train.setAttribute("width", "80");
  train.setAttribute("height", "28");
  train.setAttribute("rx", "4");
  train.setAttribute("fill", "#f59e0b");
  train.setAttribute("stroke", "#fbbf24");
  train.setAttribute("stroke-width", "2");
  svg.append(train);

  const tText = document.createElementNS(SVG_NS, "text");
  tText.setAttribute("x", "360");
  tText.setAttribute("y", "80");
  tText.setAttribute("text-anchor", "middle");
  tText.setAttribute("font-size", "11");
  tText.setAttribute("font-weight", "bold");
  tText.setAttribute("fill", "#0f172a");
  tText.textContent = `🚆 ${trainL}m`;
  svg.append(tText);

  const dimLine = document.createElementNS(SVG_NS, "path");
  dimLine.setAttribute("d", "M 120 40 L 400 40");
  dimLine.setAttribute("stroke", "#22c55e");
  dimLine.setAttribute("stroke-width", "2");
  svg.append(dimLine);

  const dimTag = document.createElementNS(SVG_NS, "text");
  dimTag.setAttribute("x", "260");
  dimTag.setAttribute("y", "32");
  dimTag.setAttribute("text-anchor", "middle");
  dimTag.setAttribute("font-size", "12");
  dimTag.setAttribute("font-weight", "bold");
  dimTag.setAttribute("fill", "#22c55e");
  dimTag.textContent = isRevealed ? `完全通过路程 ＝ 桥长 (${bridgeL}) ＋ 车长 (${trainL}) ＝ ${totalL} 米` : `完全通过路程 ＝ 桥长 (${bridgeL}) ＋ 车长 (${trainL}) ＝ ? 米`;
  svg.append(dimTag);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "🚆 火车过桥导引：从车头上桥到车尾离桥，列车实际位移必须加上自身的车身长度。";
  card.append(legend);

  return card;
}

/**
 * 10. 归一问题：单位量缩放标尺 (Unit Rate Scale)
 */

function renderUnitRateScale(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--unit-rate";
  card.dataset.visualType = "unit-rate";

  const nums = parseNumbers(prompt);
  const baseCount = nums.length >= 1 ? nums[0] : 6;
  const baseTotal = nums.length >= 2 ? nums[1] : 48;
  const targetCount = nums.length >= 3 ? nums[2] : 9;
  const unitRate = Math.round(baseTotal / baseCount) || 8;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📏 单位量归一缩放标尺</span>
    <span class="question-visual__subbadge">先求单一基准量</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const b1 = document.createElementNS(SVG_NS, "rect");
  b1.setAttribute("x", "30");
  b1.setAttribute("y", "30");
  b1.setAttribute("width", "110");
  b1.setAttribute("height", "65");
  b1.setAttribute("rx", "8");
  b1.setAttribute("fill", "#1e293b");
  b1.setAttribute("stroke", "#64748b");
  b1.setAttribute("stroke-width", "1.5");
  svg.append(b1);

  const t1 = document.createElementNS(SVG_NS, "text");
  t1.setAttribute("x", "85");
  t1.setAttribute("y", "58");
  t1.setAttribute("text-anchor", "middle");
  t1.setAttribute("font-size", "13");
  t1.setAttribute("font-weight", "bold");
  t1.setAttribute("fill", "#f8fafc");
  t1.textContent = `${baseCount} 单位`;
  svg.append(t1);

  const sub1 = document.createElementNS(SVG_NS, "text");
  sub1.setAttribute("x", "85");
  sub1.setAttribute("y", "80");
  sub1.setAttribute("text-anchor", "middle");
  sub1.setAttribute("font-size", "12");
  sub1.setAttribute("fill", "#94a3b8");
  sub1.textContent = `共 ${baseTotal}`;
  svg.append(sub1);

  const a1 = document.createElementNS(SVG_NS, "text");
  a1.setAttribute("x", "165");
  a1.setAttribute("y", "68");
  a1.setAttribute("text-anchor", "middle");
  a1.setAttribute("font-size", "16");
  a1.setAttribute("fill", "#38bdf8");
  a1.textContent = "÷ ➔";
  svg.append(a1);

  const bUnit = document.createElementNS(SVG_NS, "rect");
  bUnit.setAttribute("x", "190");
  bUnit.setAttribute("y", "24");
  bUnit.setAttribute("width", "100");
  bUnit.setAttribute("height", "76");
  bUnit.setAttribute("rx", "10");
  bUnit.setAttribute("fill", "rgba(56, 189, 248, 0.15)");
  bUnit.setAttribute("stroke", "#38bdf8");
  bUnit.setAttribute("stroke-width", "2.5");
  svg.append(bUnit);

  const tUnit = document.createElementNS(SVG_NS, "text");
  tUnit.setAttribute("x", "240");
  tUnit.setAttribute("y", "54");
  tUnit.setAttribute("text-anchor", "middle");
  tUnit.setAttribute("font-size", "13");
  tUnit.setAttribute("font-weight", "bold");
  tUnit.setAttribute("fill", "#38bdf8");
  tUnit.textContent = "基准单倍量";
  svg.append(tUnit);

  const vUnit = document.createElementNS(SVG_NS, "text");
  vUnit.setAttribute("x", "240");
  vUnit.setAttribute("y", "82");
  vUnit.setAttribute("text-anchor", "middle");
  vUnit.setAttribute("font-size", "18");
  vUnit.setAttribute("font-weight", "bold");
  vUnit.setAttribute("fill", "#38bdf8");
  vUnit.textContent = isRevealed ? `[ 1份 = ${unitRate} ]` : `[ 1份 = ? ]`;
  svg.append(vUnit);

  const a2 = document.createElementNS(SVG_NS, "text");
  a2.setAttribute("x", "315");
  a2.setAttribute("y", "68");
  a2.setAttribute("text-anchor", "middle");
  a2.setAttribute("font-size", "16");
  a2.setAttribute("fill", "#22c55e");
  a2.textContent = "× ➔";
  svg.append(a2);

  const bTarget = document.createElementNS(SVG_NS, "rect");
  bTarget.setAttribute("x", "340");
  bTarget.setAttribute("y", "30");
  bTarget.setAttribute("width", "100");
  bTarget.setAttribute("height", "65");
  bTarget.setAttribute("rx", "8");
  bTarget.setAttribute("fill", "rgba(34, 197, 94, 0.12)");
  bTarget.setAttribute("stroke", "#22c55e");
  bTarget.setAttribute("stroke-width", "2");
  svg.append(bTarget);

  const tTarget = document.createElementNS(SVG_NS, "text");
  tTarget.setAttribute("x", "390");
  tTarget.setAttribute("y", "58");
  tTarget.setAttribute("text-anchor", "middle");
  tTarget.setAttribute("font-size", "13");
  tTarget.setAttribute("font-weight", "bold");
  tTarget.setAttribute("fill", "#22c55e");
  tTarget.textContent = `${targetCount} 目标份数`;
  svg.append(tTarget);

  const vTarget = document.createElementNS(SVG_NS, "text");
  vTarget.setAttribute("x", "390");
  vTarget.setAttribute("y", "80");
  vTarget.setAttribute("text-anchor", "middle");
  vTarget.setAttribute("font-size", "13");
  vTarget.setAttribute("font-weight", "bold");
  vTarget.setAttribute("fill", "#f59e0b");
  vTarget.textContent = isRevealed ? `求 = ${unitRate * targetCount}` : `求 = ?`;
  svg.append(vTarget);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = `📏 归一导引：无论求几倍，先计算出 1 个单位量（${baseTotal} ÷ ${baseCount} = ${unitRate}），再按目标份数放大。`;
  card.append(legend);

  return card;
}

/**
 * 11. 有序分类与加乘计数：分支树 (Branching Path / Tree Visual)
 */

function renderMotionTrack(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--motion";
  card.dataset.visualType = "motion";

  const nums = parseNumbers(prompt);
  const isEncounter = prompt.includes("相向") || prompt.includes("相遇");
  const isChase = prompt.includes("追上") || prompt.includes("先跑") || prompt.includes("追");

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🚀 行程问题空间动态轨迹</span>
    <span class="question-visual__subbadge">${isEncounter ? "相向相遇：路程和 ＝ 速度和 × 时间" : isChase ? "同向追及：先行距离 ＝ 速度差 × 追及时间" : "速度、时间与路程核心关系"}</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  if (isEncounter) {
    const totalDist = nums.find(n => n >= 50 && n <= 5000) || 720;
    const v1 = nums[nums.indexOf(totalDist) === 0 ? 1 : 0] || 50;
    const v2 = nums[nums.indexOf(totalDist) === 0 ? 2 : 1] || 40;
    const time = Math.round(totalDist / (v1 + v2)) || 8;

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", "50");
    line.setAttribute("y1", "85");
    line.setAttribute("x2", "410");
    line.setAttribute("y2", "85");
    line.setAttribute("stroke", "#475569");
    line.setAttribute("stroke-width", "4");
    svg.append(line);

    const stA = document.createElementNS(SVG_NS, "text");
    stA.setAttribute("x", "40");
    stA.setAttribute("y", "70");
    stA.setAttribute("font-size", "12");
    stA.setAttribute("font-weight", "bold");
    stA.setAttribute("fill", "#38bdf8");
    stA.textContent = "🚩 甲地";
    svg.append(stA);

    const stB = document.createElementNS(SVG_NS, "text");
    stB.setAttribute("x", "385");
    stB.setAttribute("y", "70");
    stB.setAttribute("font-size", "12");
    stB.setAttribute("font-weight", "bold");
    stB.setAttribute("fill", "#a855f7");
    stB.textContent = "🚩 乙地";
    svg.append(stB);

    const a1 = document.createElementNS(SVG_NS, "text");
    a1.setAttribute("x", "90");
    a1.setAttribute("y", "108");
    a1.setAttribute("font-size", "11");
    a1.setAttribute("font-weight", "bold");
    a1.setAttribute("fill", "#38bdf8");
    a1.textContent = `甲 (${v1} 米/分) ──▶`;
    svg.append(a1);

    const a2 = document.createElementNS(SVG_NS, "text");
    a2.setAttribute("x", "310");
    a2.setAttribute("y", "108");
    a2.setAttribute("font-size", "11");
    a2.setAttribute("font-weight", "bold");
    a2.setAttribute("fill", "#a855f7");
    a2.textContent = `◀── 乙 (${v2} 米/分)`;
    svg.append(a2);

    const meetX = Math.round(50 + (360 * (v1 / (v1 + v2)))) || 250;
    const meetFlag = document.createElementNS(SVG_NS, "text");
    meetFlag.setAttribute("x", String(meetX));
    meetFlag.setAttribute("y", "72");
    meetFlag.setAttribute("text-anchor", "middle");
    meetFlag.setAttribute("font-size", "11");
    meetFlag.setAttribute("font-weight", "bold");
    meetFlag.setAttribute("fill", "#22c55e");
    meetFlag.textContent = isRevealed ? `🤝 相遇点 (${time}分)` : `🤝 相遇点 (? 分)`;
    svg.append(meetFlag);

    const dash = document.createElementNS(SVG_NS, "line");
    dash.setAttribute("x1", String(meetX));
    dash.setAttribute("y1", "76");
    dash.setAttribute("x2", String(meetX));
    dash.setAttribute("y2", "94");
    dash.setAttribute("stroke", "#22c55e");
    dash.setAttribute("stroke-width", "2");
    dash.setAttribute("stroke-dasharray", "3 2");
    svg.append(dash);

    const dim = document.createElementNS(SVG_NS, "path");
    dim.setAttribute("d", "M 50 40 L 410 40");
    dim.setAttribute("stroke", "#f8fafc");
    dim.setAttribute("stroke-width", "2");
    svg.append(dim);

    const dimT = document.createElementNS(SVG_NS, "text");
    dimT.setAttribute("x", "230");
    dimT.setAttribute("y", "32");
    dimT.setAttribute("text-anchor", "middle");
    dimT.setAttribute("font-size", "12");
    dimT.setAttribute("font-weight", "bold");
    dimT.setAttribute("fill", "#f8fafc");
    dimT.textContent = `总相距路程 S ＝ ${totalDist} 米`;
    svg.append(dimT);

    // Dynamic marker circles on the track
    const markerA = document.createElementNS(SVG_NS, "circle");
    markerA.setAttribute("cx", "50");
    markerA.setAttribute("cy", "85");
    markerA.setAttribute("r", "7");
    markerA.setAttribute("fill", "#38bdf8");
    markerA.setAttribute("stroke", "#0284c7");
    markerA.setAttribute("stroke-width", "2");
    svg.append(markerA);

    const markerB = document.createElementNS(SVG_NS, "circle");
    markerB.setAttribute("cx", "410");
    markerB.setAttribute("cy", "85");
    markerB.setAttribute("r", "7");
    markerB.setAttribute("fill", "#a855f7");
    markerB.setAttribute("stroke", "#7e22ce");
    markerB.setAttribute("stroke-width", "2");
    svg.append(markerB);

    // Interactive manipulative control bar
    const controls = document.createElement("div");
    controls.className = "question-visual__controls question-visual__controls--motion";
    controls.dataset.manipulative = "motion-encounter";

    const ctrlRow = document.createElement("div");
    ctrlRow.className = "question-visual__control-row";

    const btnPlay = createControlBtn("▶ 模拟行进", "question-visual__btn--play", "播放或暂停行进");
    const btnReset = createControlBtn("↺ 重置", "", "重置到起点");
    const btnMeet = createControlBtn("🤝 直达相遇", "", "直接跳转到相遇点");
    btnMeet.setAttribute("data-meet-btn", "true");
    ctrlRow.append(btnPlay, btnReset, btnMeet);

    const sliderRow = document.createElement("div");
    sliderRow.className = "question-visual__slider-row";
    const sliderLabel = document.createElement("label");
    sliderLabel.className = "question-visual__slider-label";
    sliderLabel.innerHTML = isRevealed ? `<span>⏱ 经过时间: <strong class="motion-time-val">0</strong> / ${time} 分钟</span>` : `<span>⏱ 经过时间: <strong class="motion-time-val">0</strong> 分钟</span>`;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.className = "question-visual__slider";
    slider.min = "0";
    slider.max = String(time);
    slider.step = "0.1";
    slider.value = "0";
    slider.setAttribute("aria-label", "相遇推演时间滑块");
    sliderLabel.append(slider);
    sliderRow.append(sliderLabel);

    const metricsRow = document.createElement("div");
    metricsRow.className = "question-visual__metrics";
    const m1 = document.createElement("span");
    m1.className = "question-visual__metric";
    m1.innerHTML = `甲已行: <strong class="motion-dist-a">0</strong> 米`;
    const m2 = document.createElement("span");
    m2.className = "question-visual__metric";
    m2.innerHTML = `乙已行: <strong class="motion-dist-b">0</strong> 米`;
    const m3 = document.createElement("span");
    m3.className = "question-visual__metric question-visual__metric--highlight";
    m3.innerHTML = `相隔距离: <strong class="motion-dist-gap">${totalDist}</strong> 米`;
    metricsRow.append(m1, m2, m3);

    const statusBox = document.createElement("div");
    statusBox.className = "question-visual__status";

    let animId = null;
    let isPlaying = false;

    function updateMotion(currT) {
      const t = Math.max(0, Math.min(time, Number(currT) || 0));
      slider.value = String(t);
      const timeVal = sliderLabel.querySelector ? sliderLabel.querySelector(".motion-time-val") : null;
      if (timeVal) timeVal.textContent = t.toFixed(1);

      const ratio = time > 0 ? t / time : 0;
      const curAX = 50 + (meetX - 50) * ratio;
      const curBX = 410 - (410 - meetX) * ratio;

      markerA.setAttribute("cx", String(curAX));
      markerB.setAttribute("cx", String(curBX));

      const distA = Math.round(v1 * t);
      const distB = Math.round(v2 * t);
      const gap = Math.max(0, totalDist - Math.round((v1 + v2) * t));

      const dAElem = metricsRow.querySelector ? metricsRow.querySelector(".motion-dist-a") : null;
      const dBElem = metricsRow.querySelector ? metricsRow.querySelector(".motion-dist-b") : null;
      const gapElem = metricsRow.querySelector ? metricsRow.querySelector(".motion-dist-gap") : null;
      if (dAElem) dAElem.textContent = String(distA);
      if (dBElem) dBElem.textContent = String(distB);
      if (gapElem) gapElem.textContent = String(gap);

      if (t >= time) {
        statusBox.className = "question-visual__status is-balanced";
        statusBox.textContent = isRevealed ? `🎉 恰好相遇！用时 ${time} 分钟，两队共行进 ${totalDist} 米！` : `🎉 恰好相遇！两队完成会合！`;
        safeClassAdd(card, "is-balanced");
      } else {
        statusBox.className = "question-visual__status";
        statusBox.textContent = `行进中：每分钟共同靠近 ${v1 + v2} 米，尚余 ${gap} 米相遇`;
        safeClassRemove(card, "is-balanced");
      }
    }

    function stopAnimation() {
      isPlaying = false;
      if (btnPlay) btnPlay.textContent = "▶ 模拟行进";
      if (animId && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    function startAnimation() {
      if (Number(slider.value) >= time) {
        updateMotion(0);
      }
      isPlaying = true;
      if (btnPlay) btnPlay.textContent = "⏸ 暂停";
      let lastTime = Date.now();
      function step() {
        if (!isPlaying) return;
        const now = Date.now();
        const deltaSec = (now - lastTime) / 1000;
        lastTime = now;
        const nextVal = Number(slider.value) + deltaSec * (time / 3.5);
        if (nextVal >= time) {
          updateMotion(time);
          stopAnimation();
        } else {
          updateMotion(nextVal);
          if (typeof requestAnimationFrame === "function") {
            animId = requestAnimationFrame(step);
          }
        }
      }
      if (typeof requestAnimationFrame === "function") {
        animId = requestAnimationFrame(step);
      }
    }

    safeAddListener(slider, "input", (e) => {
      stopAnimation();
      updateMotion(e.target.value);
    });
    safeAddListener(btnPlay, "click", () => {
      if (isPlaying) stopAnimation();
      else startAnimation();
    });
    safeAddListener(btnReset, "click", () => {
      stopAnimation();
      updateMotion(0);
    });
    safeAddListener(btnMeet, "click", () => {
      stopAnimation();
      updateMotion(time);
    });

    controls.append(ctrlRow, sliderRow, metricsRow, statusBox);
    updateMotion(0);

    card.append(svg);
    card.append(controls);

    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = `🤝 相遇问题：每分钟两人共同走 ${v1} ＋ ${v2} ＝ ${v1 + v2} 米。相遇时间 ＝ ${totalDist} ÷ ${v1 + v2} ＝ ${time} 分钟。`;
    card.append(legend);
    return card;
  }

  const v1 = nums[0] || 100;
  const v2 = nums[1] || 80;
  const t0 = nums[2] || 5;
  const leadDist = v2 * t0;
  const vDiff = (v1 - v2) > 0 ? (v1 - v2) : 20;
  const chaseTime = Math.round(leadDist / vDiff) || 5;

  const line = document.createElementNS(SVG_NS, "line");
  line.setAttribute("x1", "40");
  line.setAttribute("y1", "85");
  line.setAttribute("x2", "420");
  line.setAttribute("y2", "85");
  line.setAttribute("stroke", "#475569");
  line.setAttribute("stroke-width", "4");
  svg.append(line);

  const chaser = document.createElementNS(SVG_NS, "text");
  chaser.setAttribute("x", "40");
  chaser.setAttribute("y", "72");
  chaser.setAttribute("font-size", "11");
  chaser.setAttribute("font-weight", "bold");
  chaser.setAttribute("fill", "#38bdf8");
  chaser.textContent = `快者 (v=${v1})`;
  svg.append(chaser);

  const startBX = 190;
  const leader = document.createElementNS(SVG_NS, "text");
  leader.setAttribute("x", String(startBX));
  leader.setAttribute("y", "72");
  leader.setAttribute("font-size", "11");
  leader.setAttribute("font-weight", "bold");
  leader.setAttribute("fill", "#ec4899");
  leader.textContent = `慢者 (v=${v2})`;
  svg.append(leader);

  const dim = document.createElementNS(SVG_NS, "path");
  dim.setAttribute("d", `M 40 45 L ${startBX} 45`);
  dim.setAttribute("stroke", "#fbbf24");
  dim.setAttribute("stroke-width", "2");
  svg.append(dim);

  const dimT = document.createElementNS(SVG_NS, "text");
  dimT.setAttribute("x", String(40 + (startBX - 40) / 2));
  dimT.setAttribute("y", "38");
  dimT.setAttribute("text-anchor", "middle");
  dimT.setAttribute("font-size", "11");
  dimT.setAttribute("font-weight", "bold");
  dimT.setAttribute("fill", "#fbbf24");
  dimT.textContent = `先行距离差 ＝ ${leadDist} 米`;
  svg.append(dimT);

  const sTag = document.createElementNS(SVG_NS, "text");
  sTag.setAttribute("x", "320");
  sTag.setAttribute("y", "50");
  sTag.setAttribute("text-anchor", "middle");
  sTag.setAttribute("font-size", "12");
  sTag.setAttribute("font-weight", "bold");
  sTag.setAttribute("fill", "#22c55e");
  sTag.textContent = `速度差 ＝ ${v1} － ${v2} ＝ ${vDiff} 米/分`;
  svg.append(sTag);

  // Dynamic chase markers
  const markerChaseA = document.createElementNS(SVG_NS, "circle");
  markerChaseA.setAttribute("cx", "40");
  markerChaseA.setAttribute("cy", "85");
  markerChaseA.setAttribute("r", "7");
  markerChaseA.setAttribute("fill", "#38bdf8");
  markerChaseA.setAttribute("stroke", "#0284c7");
  markerChaseA.setAttribute("stroke-width", "2");
  svg.append(markerChaseA);

  const markerChaseB = document.createElementNS(SVG_NS, "circle");
  markerChaseB.setAttribute("cx", String(startBX));
  markerChaseB.setAttribute("cy", "85");
  markerChaseB.setAttribute("r", "7");
  markerChaseB.setAttribute("fill", "#ec4899");
  markerChaseB.setAttribute("stroke", "#be185d");
  markerChaseB.setAttribute("stroke-width", "2");
  svg.append(markerChaseB);

  const catchPointX = 390;
  const catchFlag = document.createElementNS(SVG_NS, "text");
  catchFlag.setAttribute("x", String(catchPointX));
  catchFlag.setAttribute("y", "72");
  catchFlag.setAttribute("text-anchor", "middle");
  catchFlag.setAttribute("font-size", "11");
  catchFlag.setAttribute("font-weight", "bold");
  catchFlag.setAttribute("fill", "#22c55e");
  catchFlag.textContent = isRevealed ? `🎯 追及点 (${chaseTime}分)` : `🎯 追及点 (? 分)`;
  svg.append(catchFlag);

  // Chase interactive manipulative control bar
  const controls = document.createElement("div");
  controls.className = "question-visual__controls question-visual__controls--motion";
  controls.dataset.manipulative = "motion-chase";

  const ctrlRow = document.createElement("div");
  ctrlRow.className = "question-visual__control-row";

  const btnPlay = createControlBtn("▶ 模拟追及", "question-visual__btn--play", "播放或暂停追及");
  const btnReset = createControlBtn("↺ 重置", "", "重置到起点");
  const btnCatch = createControlBtn("🎯 直达追上", "", "直接跳转到追及点");
  btnCatch.setAttribute("data-catch-btn", "true");
  ctrlRow.append(btnPlay, btnReset, btnCatch);

  const sliderRow = document.createElement("div");
  sliderRow.className = "question-visual__slider-row";
  const sliderLabel = document.createElement("label");
  sliderLabel.className = "question-visual__slider-label";
  sliderLabel.innerHTML = isRevealed ? `<span>⏱ 追及时间: <strong class="chase-time-val">0</strong> / ${chaseTime} 分钟</span>` : `<span>⏱ 追及时间: <strong class="chase-time-val">0</strong> 分钟</span>`;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.className = "question-visual__slider";
  slider.min = "0";
  slider.max = String(chaseTime);
  slider.step = "0.1";
  slider.value = "0";
  slider.setAttribute("aria-label", "追及推演时间滑块");
  sliderLabel.append(slider);
  sliderRow.append(sliderLabel);

  const metricsRow = document.createElement("div");
  metricsRow.className = "question-visual__metrics";
  const m1 = document.createElement("span");
  m1.className = "question-visual__metric";
  m1.innerHTML = `快者已行: <strong class="chase-dist-a">0</strong> 米`;
  const m2 = document.createElement("span");
  m2.className = "question-visual__metric";
  m2.innerHTML = `慢者位移: <strong class="chase-dist-b">${leadDist}</strong> 米`;
  const m3 = document.createElement("span");
  m3.className = "question-visual__metric question-visual__metric--highlight";
  m3.innerHTML = `差距剩余: <strong class="chase-gap">${leadDist}</strong> 米`;
  metricsRow.append(m1, m2, m3);

  const statusBox = document.createElement("div");
  statusBox.className = "question-visual__status";

  let animId = null;
  let isPlaying = false;

  function updateChase(currT) {
    const t = Math.max(0, Math.min(chaseTime, Number(currT) || 0));
    slider.value = String(t);
    const timeVal = sliderLabel.querySelector ? sliderLabel.querySelector(".chase-time-val") : null;
    if (timeVal) timeVal.textContent = t.toFixed(1);

    const ratio = chaseTime > 0 ? t / chaseTime : 0;
    const curAX = 40 + (catchPointX - 40) * ratio;
    const curBX = startBX + (catchPointX - startBX) * ratio;

    markerChaseA.setAttribute("cx", String(curAX));
    markerChaseB.setAttribute("cx", String(curBX));

    const distA = Math.round(v1 * t);
    const distB = Math.round(leadDist + v2 * t);
    const gap = Math.max(0, leadDist - Math.round(vDiff * t));

    const dAElem = metricsRow.querySelector ? metricsRow.querySelector(".chase-dist-a") : null;
    const dBElem = metricsRow.querySelector ? metricsRow.querySelector(".chase-dist-b") : null;
    const gapElem = metricsRow.querySelector ? metricsRow.querySelector(".chase-gap") : null;
    if (dAElem) dAElem.textContent = String(distA);
    if (dBElem) dBElem.textContent = String(distB);
    if (gapElem) gapElem.textContent = String(gap);

    if (t >= chaseTime) {
      statusBox.className = "question-visual__status is-balanced";
      statusBox.textContent = `🎯 追及成功！快者用时 ${chaseTime} 分钟追上先行 ${leadDist} 米！`;
      safeClassAdd(card, "is-balanced");
    } else {
      statusBox.className = "question-visual__status";
      statusBox.textContent = `追及中：每分钟拉近 ${vDiff} 米，尚差 ${gap} 米追上`;
      safeClassRemove(card, "is-balanced");
    }
  }

  function stopChaseAnimation() {
    isPlaying = false;
    if (btnPlay) btnPlay.textContent = "▶ 模拟追及";
    if (animId && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function startChaseAnimation() {
    if (Number(slider.value) >= chaseTime) {
      updateChase(0);
    }
    isPlaying = true;
    if (btnPlay) btnPlay.textContent = "⏸ 暂停";
    let lastTime = Date.now();
    function step() {
      if (!isPlaying) return;
      const now = Date.now();
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;
      const nextVal = Number(slider.value) + deltaSec * (chaseTime / 3.5);
      if (nextVal >= chaseTime) {
        updateChase(chaseTime);
        stopChaseAnimation();
      } else {
        updateChase(nextVal);
        if (typeof requestAnimationFrame === "function") {
          animId = requestAnimationFrame(step);
        }
      }
    }
    if (typeof requestAnimationFrame === "function") {
      animId = requestAnimationFrame(step);
    }
  }

  safeAddListener(slider, "input", (e) => {
    stopChaseAnimation();
    updateChase(e.target.value);
  });
  safeAddListener(btnPlay, "click", () => {
    if (isPlaying) stopChaseAnimation();
    else startChaseAnimation();
  });
  safeAddListener(btnReset, "click", () => {
    stopChaseAnimation();
    updateChase(0);
  });
  safeAddListener(btnCatch, "click", () => {
    stopChaseAnimation();
    updateChase(chaseTime);
  });

  controls.append(ctrlRow, sliderRow, metricsRow, statusBox);
  updateChase(0);

  card.append(svg);
  card.append(controls);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = `🏃 追及原理：追上所需时间 ＝ 先行距离 ÷ 速度差。每分钟拉近 ${v1 - v2} 米。`;
  card.append(legend);

  return card;
}

/**
 * 14. 几何组合计数可视化 (Geometry Counting: Segments, Rays, Grids)
 */

function renderAgeDifferenceBar(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--age";
  card.dataset.visualType = "age";

  const nums = parseNumbers(prompt);
  const a1 = nums[0] || 14;
  const a2 = nums[1] || 9;
  const diff = Math.abs(a1 - a2) || 5;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">⏳ 年龄问题核心模型</span>
    <span class="question-visual__subbadge">核心性质：年龄差终身不变</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const bar1 = document.createElementNS(SVG_NS, "rect");
  bar1.setAttribute("x", "80");
  bar1.setAttribute("y", "35");
  bar1.setAttribute("width", "260");
  bar1.setAttribute("height", "24");
  bar1.setAttribute("rx", "4");
  bar1.setAttribute("fill", "#f59e0b");
  svg.append(bar1);

  const t1 = document.createElementNS(SVG_NS, "text");
  t1.setAttribute("x", "40");
  t1.setAttribute("y", "51");
  t1.setAttribute("font-size", "11");
  t1.setAttribute("font-weight", "bold");
  t1.setAttribute("fill", "#fbbf24");
  t1.textContent = "长辈/大";
  svg.append(t1);

  const bar2 = document.createElementNS(SVG_NS, "rect");
  bar2.setAttribute("x", "80");
  bar2.setAttribute("y", "75");
  bar2.setAttribute("width", "180");
  bar2.setAttribute("height", "24");
  bar2.setAttribute("rx", "4");
  bar2.setAttribute("fill", "#38bdf8");
  svg.append(bar2);

  const t2 = document.createElementNS(SVG_NS, "text");
  t2.setAttribute("x", "40");
  t2.setAttribute("y", "91");
  t2.setAttribute("font-size", "11");
  t2.setAttribute("font-weight", "bold");
  t2.setAttribute("fill", "#38bdf8");
  t2.textContent = "晚辈/小";
  svg.append(t2);

  const diffBracket = document.createElementNS(SVG_NS, "path");
  diffBracket.setAttribute("d", "M 260 72 L 340 72");
  diffBracket.setAttribute("stroke", "#ec4899");
  diffBracket.setAttribute("stroke-width", "2");
  svg.append(diffBracket);

  const diffText = document.createElementNS(SVG_NS, "text");
  diffText.setAttribute("x", "300");
  diffText.setAttribute("y", "66");
  diffText.setAttribute("text-anchor", "middle");
  diffText.setAttribute("font-size", "11");
  diffText.setAttribute("font-weight", "bold");
  diffText.setAttribute("fill", "#ec4899");
  diffText.textContent = `年龄差 ＝ ${diff} 岁`;
  svg.append(diffText);

  const invTag = document.createElementNS(SVG_NS, "text");
  invTag.setAttribute("x", "230");
  invTag.setAttribute("y", "125");
  invTag.setAttribute("text-anchor", "middle");
  invTag.setAttribute("font-size", "12");
  invTag.setAttribute("font-weight", "bold");
  invTag.setAttribute("fill", "#22c55e");
  invTag.textContent = `无论过去多少年，两人的年龄差永远是 ${diff} 岁！`;
  svg.append(invTag);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = `⏳ 年龄问题解题金钥匙：抓住“年龄差永远不变”。利用年龄差对应倍数差，求出 1 倍量。`;
  card.append(legend);

  return card;
}

/**
 * 17. 工程问题合作效率进度图 (Engineering Progress Model)
 */

function renderEngineeringProgress(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--engineering";
  card.dataset.visualType = "engineering";

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">⚙️ 工程问题合作效率图</span>
    <span class="question-visual__subbadge">工作总量看作整体“1”</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const bar = document.createElementNS(SVG_NS, "rect");
  bar.setAttribute("x", "40");
  bar.setAttribute("y", "50");
  bar.setAttribute("width", "380");
  bar.setAttribute("height", "32");
  bar.setAttribute("rx", "6");
  bar.setAttribute("fill", "rgba(30, 41, 59, 0.8)");
  bar.setAttribute("stroke", "#38bdf8");
  bar.setAttribute("stroke-width", "2");
  svg.append(bar);

  const partA = document.createElementNS(SVG_NS, "rect");
  partA.setAttribute("x", "40");
  partA.setAttribute("y", "50");
  partA.setAttribute("width", "160");
  partA.setAttribute("height", "32");
  partA.setAttribute("rx", "6");
  partA.setAttribute("fill", "#3b82f6");
  partA.setAttribute("opacity", "0.75");
  svg.append(partA);

  const tA = document.createElementNS(SVG_NS, "text");
  tA.setAttribute("x", "120");
  tA.setAttribute("y", "70");
  tA.setAttribute("text-anchor", "middle");
  tA.setAttribute("font-size", "11");
  tA.setAttribute("font-weight", "bold");
  tA.setAttribute("fill", "#f8fafc");
  tA.textContent = "甲的工效 1/A";
  svg.append(tA);

  const partB = document.createElementNS(SVG_NS, "rect");
  partB.setAttribute("x", "200");
  partB.setAttribute("y", "50");
  partB.setAttribute("width", "120");
  partB.setAttribute("height", "32");
  partB.setAttribute("fill", "#10b981");
  partB.setAttribute("opacity", "0.75");
  svg.append(partB);

  const tB = document.createElementNS(SVG_NS, "text");
  tB.setAttribute("x", "260");
  tB.setAttribute("y", "70");
  tB.setAttribute("text-anchor", "middle");
  tB.setAttribute("font-size", "11");
  tB.setAttribute("font-weight", "bold");
  tB.setAttribute("fill", "#f8fafc");
  tB.textContent = "乙的工效 1/B";
  svg.append(tB);

  const topText = document.createElementNS(SVG_NS, "text");
  topText.setAttribute("x", "230");
  topText.setAttribute("y", "35");
  topText.setAttribute("text-anchor", "middle");
  topText.setAttribute("font-size", "12");
  topText.setAttribute("font-weight", "bold");
  topText.setAttribute("fill", "#38bdf8");
  topText.textContent = "工程总量 ＝ 整体 “1”";
  svg.append(topText);

  const bText = document.createElementNS(SVG_NS, "text");
  bText.setAttribute("x", "230");
  bText.setAttribute("y", "115");
  bText.setAttribute("text-anchor", "middle");
  bText.setAttribute("font-size", "12");
  bText.setAttribute("font-weight", "bold");
  bText.setAttribute("fill", "#22c55e");
  bText.textContent = "合作工效 ＝ 1/甲 ＋ 1/乙 ➔ 合作工期 ＝ 1 ÷ (合作工效)";
  svg.append(bText);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "⚙️ 工程问题原理：把总工程设为“1”，甲每天完成 1/甲，乙每天完成 1/乙。合做每天完成 (1/甲 + 1/乙)。";
  card.append(legend);

  return card;
}

/**
 * 18. 奇偶与整除特性卡 (Parity & Divisibility Card)
 */

function renderConcentrationVisual(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--concentration";
  card.dataset.visualType = "concentration";

  const nums = parseNumbers(prompt);
  const solute = nums[0] || 20;
  const solution = nums[1] || 100;
  const conc = Math.round((solute / solution) * 100) || 20;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🧪 溶液浓度与溶质配比模型</span>
    <span class="question-visual__subbadge">浓度 ＝ 溶质质量 ÷ 溶液总质量 × 100%</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const bx = 100, by = 35, bw = 80, bh = 85;
  const beaker = document.createElementNS(SVG_NS, "rect");
  beaker.setAttribute("x", String(bx)); beaker.setAttribute("y", String(by));
  beaker.setAttribute("width", String(bw)); beaker.setAttribute("height", String(bh));
  beaker.setAttribute("rx", "4");
  beaker.setAttribute("fill", "rgba(15, 23, 42, 0.6)");
  beaker.setAttribute("stroke", "#38bdf8"); beaker.setAttribute("stroke-width", "2");
  svg.append(beaker);

  const water = document.createElementNS(SVG_NS, "rect");
  water.setAttribute("x", String(bx + 3)); water.setAttribute("y", String(by + 25));
  water.setAttribute("width", String(bw - 6)); water.setAttribute("height", String(bh - 28));
  water.setAttribute("rx", "2");
  water.setAttribute("fill", "rgba(56, 189, 248, 0.4)");
  svg.append(water);

  const soluteLayer = document.createElementNS(SVG_NS, "rect");
  soluteLayer.setAttribute("x", String(bx + 3)); soluteLayer.setAttribute("y", String(by + bh - 18));
  soluteLayer.setAttribute("width", String(bw - 6)); soluteLayer.setAttribute("height", "15");
  soluteLayer.setAttribute("fill", "#f59e0b"); soluteLayer.setAttribute("opacity", "0.85");
  svg.append(soluteLayer);

  const bkrTag = document.createElementNS(SVG_NS, "text");
  bkrTag.setAttribute("x", String(bx + bw / 2)); bkrTag.setAttribute("y", String(by + 52));
  bkrTag.setAttribute("text-anchor", "middle");
  bkrTag.setAttribute("font-size", "11"); bkrTag.setAttribute("font-weight", "bold");
  bkrTag.setAttribute("fill", "#f8fafc"); bkrTag.textContent = `${conc}% 溶液`;
  svg.append(bkrTag);

  const rx = 220;
  const t1 = document.createElementNS(SVG_NS, "text");
  t1.setAttribute("x", String(rx)); t1.setAttribute("y", "50");
  t1.setAttribute("font-size", "12"); t1.setAttribute("font-weight", "bold");
  t1.setAttribute("fill", "#f59e0b"); t1.textContent = `▪ 溶质质量 (纯物): ${solute} 克`;
  svg.append(t1);

  const t2 = document.createElementNS(SVG_NS, "text");
  t2.setAttribute("x", String(rx)); t2.setAttribute("y", "75");
  t2.setAttribute("font-size", "12"); t2.setAttribute("font-weight", "bold");
  t2.setAttribute("fill", "#38bdf8"); t2.textContent = `▪ 溶剂质量 (水): ${solution - solute} 克`;
  svg.append(t2);

  const t3 = document.createElementNS(SVG_NS, "text");
  t3.setAttribute("x", String(rx)); t3.setAttribute("y", "100");
  t3.setAttribute("font-size", "12"); t3.setAttribute("font-weight", "bold");
  t3.setAttribute("fill", "#22c55e"); t3.textContent = `▪ 溶液总质量 = ${solution} 克`;
  svg.append(t3);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "🧪 浓度问题不变量解法：加水稀释时“溶质质量永远不变”；蒸发水分时“溶质质量依然不变”。";
  card.append(legend);

  return card;
}

/**
 * 28. 方阵点阵排列与圈层模型 (Square Array & Layer Matrix)
 */

function renderTieredPricingVisual(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--tiered-pricing";
  card.dataset.visualType = "tiered-pricing";

  const nums = parseNumbers(prompt);
  const baseRange = nums[0] || 3;
  const basePrice = nums[1] || 10;
  const extraRate = nums[2] || 2.4;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">⚡ 分段计费与阶梯阶跃标尺</span>
    <span class="question-visual__subbadge">基础区间与超额累进分别核算</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const b1 = document.createElementNS(SVG_NS, "rect");
  b1.setAttribute("x", "40"); b1.setAttribute("y", "45");
  b1.setAttribute("width", "160"); b1.setAttribute("height", "40");
  b1.setAttribute("rx", "6");
  b1.setAttribute("fill", "rgba(56, 189, 248, 0.2)");
  b1.setAttribute("stroke", "#38bdf8"); b1.setAttribute("stroke-width", "2");
  svg.append(b1);

  const t1 = document.createElementNS(SVG_NS, "text");
  t1.setAttribute("x", "120"); t1.setAttribute("y", "70");
  t1.setAttribute("text-anchor", "middle");
  t1.setAttribute("font-size", "12"); t1.setAttribute("font-weight", "bold");
  t1.setAttribute("fill", "#38bdf8"); t1.textContent = `基础段 (0 ~ ${baseRange}km): ${basePrice}元`;
  svg.append(t1);

  const b2 = document.createElementNS(SVG_NS, "rect");
  b2.setAttribute("x", "210"); b2.setAttribute("y", "45");
  b2.setAttribute("width", "210"); b2.setAttribute("height", "40");
  b2.setAttribute("rx", "6");
  b2.setAttribute("fill", "rgba(245, 158, 11, 0.2)");
  b2.setAttribute("stroke", "#f59e0b"); b2.setAttribute("stroke-width", "2");
  svg.append(b2);

  const t2 = document.createElementNS(SVG_NS, "text");
  t2.setAttribute("x", "315"); t2.setAttribute("y", "70");
  t2.setAttribute("text-anchor", "middle");
  t2.setAttribute("font-size", "12"); t2.setAttribute("font-weight", "bold");
  t2.setAttribute("fill", "#f59e0b"); t2.textContent = `超额段: 每km ${extraRate}元`;
  svg.append(t2);

  const topText = document.createElementNS(SVG_NS, "text");
  topText.setAttribute("x", "230"); topText.setAttribute("y", "24");
  topText.setAttribute("text-anchor", "middle");
  topText.setAttribute("font-size", "12"); topText.setAttribute("font-weight", "bold");
  topText.setAttribute("fill", "#22c55e");
  topText.textContent = "总费用 ＝ 基础价 ＋ (总里程 － 基础里程) × 超额单价";
  svg.append(topText);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "⚡ 分段计费导引：先扣除起步/基础额度，超出的部分再乘以高阶单价，两部分相加即为总费用。";
  card.append(legend);

  return card;
}

/**
 * 30. 质因数分解与短除法结构 (Factor Tree & Short Division)
 */

function renderReverseWorkflowVisual(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--reverse-flow";
  card.dataset.visualType = "reverse-flow";

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🔄 逆向思维与还原回溯流程图</span>
    <span class="question-visual__subbadge">从已知结果倒推初始状态</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const fText = document.createElementNS(SVG_NS, "text");
  fText.setAttribute("x", "45"); fText.setAttribute("y", "45");
  fText.setAttribute("font-size", "11"); fText.setAttribute("font-weight", "bold");
  fText.setAttribute("fill", "#94a3b8"); fText.textContent = "正向运算:";
  svg.append(fText);

  const forwardNodes = ["初始数", "＋加", "×乘", "终点值"];
  forwardNodes.forEach((node, i) => {
    const nx = 120 + i * 85;
    const box = document.createElementNS(SVG_NS, "rect");
    box.setAttribute("x", String(nx - 32)); box.setAttribute("y", "30");
    box.setAttribute("width", "64"); box.setAttribute("height", "24");
    box.setAttribute("rx", "4"); box.setAttribute("fill", "#1e293b");
    box.setAttribute("stroke", "#38bdf8"); box.setAttribute("stroke-width", "1.5");
    svg.append(box);

    const txt = document.createElementNS(SVG_NS, "text");
    txt.setAttribute("x", String(nx)); txt.setAttribute("y", "46");
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("font-size", "11"); txt.setAttribute("fill", "#f8fafc");
    txt.textContent = node;
    svg.append(txt);

    if (i < 3) {
      const arr = document.createElementNS(SVG_NS, "text");
      arr.setAttribute("x", String(nx + 42)); arr.setAttribute("y", "47");
      arr.setAttribute("font-size", "12"); arr.setAttribute("fill", "#38bdf8");
      arr.textContent = "➔";
      svg.append(arr);
    }
  });

  const rText = document.createElementNS(SVG_NS, "text");
  rText.setAttribute("x", "45"); rText.setAttribute("y", "95");
  rText.setAttribute("font-size", "11"); rText.setAttribute("font-weight", "bold");
  rText.setAttribute("fill", "#22c55e"); rText.textContent = "逆向还原:";
  svg.append(rText);

  const reverseNodes = ["求原数", "－减", "÷除", "已知结果"];
  reverseNodes.forEach((node, i) => {
    const nx = 120 + i * 85;
    const box = document.createElementNS(SVG_NS, "rect");
    box.setAttribute("x", String(nx - 32)); box.setAttribute("y", "80");
    box.setAttribute("width", "64"); box.setAttribute("height", "24");
    box.setAttribute("rx", "4"); box.setAttribute("fill", "rgba(34, 197, 94, 0.15)");
    box.setAttribute("stroke", "#22c55e"); box.setAttribute("stroke-width", "1.5");
    svg.append(box);

    const txt = document.createElementNS(SVG_NS, "text");
    txt.setAttribute("x", String(nx)); txt.setAttribute("y", "96");
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("font-size", "11"); txt.setAttribute("fill", "#22c55e");
    txt.textContent = node;
    svg.append(txt);

    if (i < 3) {
      const arr = document.createElementNS(SVG_NS, "text");
      arr.setAttribute("x", String(nx + 42)); arr.setAttribute("y", "97");
      arr.setAttribute("font-size", "12"); arr.setAttribute("fill", "#22c55e");
      arr.textContent = "⬅️";
      svg.append(arr);
    }
  });

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "🔄 还原问题金法则：从最后的结果出发，原来加上变为减去，原来乘以变为除以，步步逆推还原。";
  card.append(legend);

  return card;
}

/**
 * 32. 统筹优化与任务并行甘特图 (Scheduling & Parallel Tasks Gantt)
 */

function renderSchedulingGanttVisual(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--gantt";
  card.dataset.visualType = "gantt";

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">⏱️ 统筹优化与任务并行甘特图</span>
    <span class="question-visual__subbadge">合理安排工序实现最短总时间</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const t1 = document.createElementNS(SVG_NS, "rect");
  t1.setAttribute("x", "60"); t1.setAttribute("y", "35");
  t1.setAttribute("width", "280"); t1.setAttribute("height", "28");
  t1.setAttribute("rx", "4");
  t1.setAttribute("fill", "#0284c7"); t1.setAttribute("stroke", "#38bdf8"); t1.setAttribute("stroke-width", "1.5");
  svg.append(t1);

  const txt1 = document.createElementNS(SVG_NS, "text");
  txt1.setAttribute("x", "200"); txt1.setAttribute("y", "53");
  txt1.setAttribute("text-anchor", "middle");
  txt1.setAttribute("font-size", "11"); txt1.setAttribute("font-weight", "bold");
  txt1.setAttribute("fill", "#f8fafc"); txt1.textContent = "关键长任务 (如: 烧水 / 核心工序)";
  svg.append(txt1);

  const t2 = document.createElementNS(SVG_NS, "rect");
  t2.setAttribute("x", "60"); t2.setAttribute("y", "75");
  t2.setAttribute("width", "120"); t2.setAttribute("height", "24");
  t2.setAttribute("rx", "4");
  t2.setAttribute("fill", "rgba(34, 197, 94, 0.2)");
  t2.setAttribute("stroke", "#22c55e"); t2.setAttribute("stroke-width", "1.5");
  svg.append(t2);

  const txt2 = document.createElementNS(SVG_NS, "text");
  txt2.setAttribute("x", "120"); txt2.setAttribute("y", "91");
  txt2.setAttribute("text-anchor", "middle");
  txt2.setAttribute("font-size", "10"); txt2.setAttribute("fill", "#4ade80");
  txt2.textContent = "并行任务1 (同步穿插)";
  svg.append(txt2);

  const t3 = document.createElementNS(SVG_NS, "rect");
  t3.setAttribute("x", "190"); t3.setAttribute("y", "75");
  t3.setAttribute("width", "110"); t3.setAttribute("height", "24");
  t3.setAttribute("rx", "4");
  t3.setAttribute("fill", "rgba(245, 158, 11, 0.2)");
  t3.setAttribute("stroke", "#f59e0b"); t3.setAttribute("stroke-width", "1.5");
  svg.append(t3);

  const txt3 = document.createElementNS(SVG_NS, "text");
  txt3.setAttribute("x", "245"); txt3.setAttribute("y", "91");
  txt3.setAttribute("text-anchor", "middle");
  txt3.setAttribute("font-size", "10"); txt3.setAttribute("fill", "#fbbf24");
  txt3.textContent = "并行任务2 (同步穿插)";
  svg.append(txt3);

  const savText = document.createElementNS(SVG_NS, "text");
  savText.setAttribute("x", "230"); savText.setAttribute("y", "122");
  savText.setAttribute("text-anchor", "middle");
  savText.setAttribute("font-size", "12"); savText.setAttribute("font-weight", "bold");
  savText.setAttribute("fill", "#22c55e");
  savText.textContent = "💡 统筹省时秘诀：在等待长任务的过程中，把能同时做的事情穿插完成！";
  svg.append(savText);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "⏱️ 统筹规划原则：明确各工序先后顺序，找出哪些可以同时做，使设备不空闲、人不闲置。";
  card.append(legend);

  return card;
}

/**
 * 35. 方案设计与最优化决策看板 (Plan Design & Optimization Dashboard)
 */

function renderPlanDesignVisual(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--plan-design";
  card.dataset.visualType = "plan-design";

  const nums = parseNumbers(prompt);
  const isSequential = prompt.includes("先") || prompt.includes("再") || prompt.includes("最后") || prompt.includes("校准");
  const isGrouping = prompt.includes("每袋") || prompt.includes("每盒") || prompt.includes("每箱") || prompt.includes("最多买") || prompt.includes("每支");

  if (isSequential) {
    const header = document.createElement("div");
    header.className = "question-visual__header";
    header.innerHTML = `
      <span class="question-visual__badge">📋 任务工序串联时间轴</span>
      <span class="question-visual__subbadge">各阶段工序耗时累加得出总流程时间</span>
    `;
    card.append(header);

    const svgWidth = 460;
    const svgHeight = 130;
    const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

    const steps = [
      { name: "工序① 校准", val: nums[0] || 2, color: "#38bdf8" },
      { name: "工序② 采样", val: nums[1] || 5, color: "#a855f7" },
      { name: "工序③ 记录", val: nums[2] || 3, color: "#22c55e" }
    ];
    const total = steps.reduce((sum, s) => sum + s.val, 0);

    let currX = 35;
    steps.forEach((st, i) => {
      const blockWidth = Math.max(70, Math.round((st.val / total) * 230));
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", String(currX)); rect.setAttribute("y", "35");
      rect.setAttribute("width", String(blockWidth)); rect.setAttribute("height", "32");
      rect.setAttribute("rx", "6");
      rect.setAttribute("fill", st.color);
      rect.setAttribute("fill-opacity", "0.25");
      rect.setAttribute("stroke", st.color);
      rect.setAttribute("stroke-width", "1.5");
      svg.append(rect);

      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("x", String(currX + blockWidth / 2));
      label.setAttribute("y", "48");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "11");
      label.setAttribute("fill", "#f8fafc");
      label.textContent = st.name;
      svg.append(label);

      const valText = document.createElementNS(SVG_NS, "text");
      valText.setAttribute("x", String(currX + blockWidth / 2));
      valText.setAttribute("y", "62");
      valText.setAttribute("text-anchor", "middle");
      valText.setAttribute("font-size", "10");
      valText.setAttribute("font-weight", "bold");
      valText.setAttribute("fill", st.color);
      valText.textContent = `${st.val} 分钟`;
      svg.append(valText);

      currX += blockWidth + 12;
      if (i < steps.length - 1) {
        const arrow = document.createElementNS(SVG_NS, "text");
        arrow.setAttribute("x", String(currX - 9));
        arrow.setAttribute("y", "55");
        arrow.setAttribute("font-size", "12");
        arrow.setAttribute("fill", "#64748b");
        arrow.textContent = "➔";
        svg.append(arrow);
      }
    });

    const sumLine = document.createElementNS(SVG_NS, "line");
    sumLine.setAttribute("x1", "35"); sumLine.setAttribute("y1", "85");
    sumLine.setAttribute("x2", String(currX - 12)); sumLine.setAttribute("y2", "85");
    sumLine.setAttribute("stroke", "#64748b"); sumLine.setAttribute("stroke-dasharray", "4 4");
    svg.append(sumLine);

    const sumText = document.createElementNS(SVG_NS, "text");
    sumText.setAttribute("x", "230"); sumText.setAttribute("y", "105");
    sumText.setAttribute("text-anchor", "middle");
    sumText.setAttribute("font-size", "12");
    sumText.setAttribute("font-weight", "bold");
    sumText.setAttribute("fill", "#38bdf8");
    sumText.textContent = isRevealed ? `总工时 = ${steps.map((s) => s.val).join(" + ")} = ${total} 分钟` : `总工时 = ${steps.map((s) => s.val).join(" + ")} = ? 分钟`;
    svg.append(sumText);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "⏱️ 工序串联法则：前后有严格先后次序的独立工序，总时间等于各项工序耗时之和。";
    card.append(legend);
    return card;
  }

  if (isGrouping) {
    const totalItems = nums[0] || 18;
    const perContainer = nums[1] || 6;
    const count = Math.ceil(totalItems / perContainer) || 3;

    const header = document.createElement("div");
    header.className = "question-visual__header";
    header.innerHTML = `
      <span class="question-visual__badge">📦 配额装箱与容量分配模型</span>
      <span class="question-visual__subbadge">总量 ÷ 单份容量 = 所需容器数量</span>
    `;
    card.append(header);

    const svgWidth = 460;
    const svgHeight = 135;
    const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

    const totalBox = document.createElementNS(SVG_NS, "rect");
    totalBox.setAttribute("x", "30"); totalBox.setAttribute("y", "20");
    totalBox.setAttribute("width", "400"); totalBox.setAttribute("height", "24");
    totalBox.setAttribute("rx", "4");
    totalBox.setAttribute("fill", "rgba(56, 189, 248, 0.15)");
    totalBox.setAttribute("stroke", "#38bdf8");
    svg.append(totalBox);

    const totalText = document.createElementNS(SVG_NS, "text");
    totalText.setAttribute("x", "230"); totalText.setAttribute("y", "36");
    totalText.setAttribute("text-anchor", "middle");
    totalText.setAttribute("font-size", "11");
    totalText.setAttribute("font-weight", "bold");
    totalText.setAttribute("fill", "#38bdf8");
    totalText.textContent = `待分装总数量：${totalItems} 件 ｜ 每组容量：${perContainer} 件`;
    svg.append(totalText);

    const visibleContainers = Math.min(count, 5);
    const boxW = 68;
    const startX = 230 - (visibleContainers * (boxW + 12) - 12) / 2;
    for (let i = 0; i < visibleContainers; i++) {
      const bx = startX + i * (boxW + 12);
      const box = document.createElementNS(SVG_NS, "rect");
      box.setAttribute("x", String(bx)); box.setAttribute("y", "58");
      box.setAttribute("width", String(boxW)); box.setAttribute("height", "46");
      box.setAttribute("rx", "6");
      box.setAttribute("fill", "rgba(168, 85, 247, 0.2)");
      box.setAttribute("stroke", "#a855f7");
      box.setAttribute("stroke-width", "1.5");
      svg.append(box);

      const bTitle = document.createElementNS(SVG_NS, "text");
      bTitle.setAttribute("x", String(bx + boxW / 2)); bTitle.setAttribute("y", "75");
      bTitle.setAttribute("text-anchor", "middle");
      bTitle.setAttribute("font-size", "10");
      bTitle.setAttribute("fill", "#c084fc");
      bTitle.textContent = `容器 #${i + 1}`;
      svg.append(bTitle);

      const bCap = document.createElementNS(SVG_NS, "text");
      bCap.setAttribute("x", String(bx + boxW / 2)); bCap.setAttribute("y", "93");
      bCap.setAttribute("text-anchor", "middle");
      bCap.setAttribute("font-size", "11");
      bCap.setAttribute("font-weight", "bold");
      bCap.setAttribute("fill", "#f8fafc");
      bCap.textContent = `${perContainer} 件`;
      svg.append(bCap);
    }

    const formula = document.createElementNS(SVG_NS, "text");
    formula.setAttribute("x", "230"); formula.setAttribute("y", "124");
    formula.setAttribute("text-anchor", "middle");
    formula.setAttribute("font-size", "11");
    formula.setAttribute("font-weight", "bold");
    formula.setAttribute("fill", "#22c55e");
    formula.textContent = isRevealed ? `计算核算：${totalItems} ÷ ${perContainer} = ${count} 组（箱/袋）` : `计算核算：${totalItems} ÷ ${perContainer} = ? 组（箱/袋）`;
    svg.append(formula);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📦 均匀分组原理：将相同规格的物品按固定容量装载，容器数 = 物品总量 ÷ 单容器容量。";
    card.append(legend);
    return card;
  }

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">⚖️ 方案决策与效益对比看板</span>
    <span class="question-visual__subbadge">量化评估各套方案，直观优选最优决策</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 135;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  let plans = [];
  if (prompt.includes("三种方案")) {
    const p1 = nums[0] || 9;
    const p2 = nums[1] || 7;
    const p3 = nums[2] || 8;
    const minVal = Math.min(p1, p2, p3);
    const unit = prompt.includes("元") ? "元" : "分钟";
    plans = [
      { name: "方案 1", val: `${p1} ${unit}`, best: p1 === minVal, color: "#38bdf8" },
      { name: "方案 2", val: `${p2} ${unit}`, best: p2 === minVal, color: "#22c55e" },
      { name: "方案 3", val: `${p3} ${unit}`, best: p3 === minVal, color: "#a855f7" }
    ];
  } else {
    const v1 = nums[0] || (prompt.includes("12") ? 12 : 2);
    const v2 = nums[1] || (prompt.includes("10") ? 10 : 5);
    const unit = prompt.includes("箱") ? "个箱子" : prompt.includes("元") ? "元" : "";
    const minVal = Math.min(v1, v2);
    plans = [
      { name: "甲方案 (编号 1)", val: `${v1} ${unit}`, best: v1 === minVal, color: "#38bdf8" },
      { name: "乙方案 (编号 2)", val: `${v2} ${unit}`, best: v2 === minVal, color: "#22c55e" }
    ];
  }

  const pWidth = plans.length === 3 ? 125 : 185;
  const gap = plans.length === 3 ? 15 : 24;
  const totalW = plans.length * pWidth + (plans.length - 1) * gap;
  const sX = (svgWidth - totalW) / 2;

  plans.forEach((pl, idx) => {
    const px = sX + idx * (pWidth + gap);
    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", String(px)); rect.setAttribute("y", "25");
    rect.setAttribute("width", String(pWidth)); rect.setAttribute("height", "75");
    rect.setAttribute("rx", "8");
    const isBestHighlighted = pl.best && isRevealed;
    rect.setAttribute("fill", isBestHighlighted ? "rgba(34, 197, 94, 0.22)" : "rgba(30, 41, 59, 0.8)");
    rect.setAttribute("stroke", isBestHighlighted ? "#22c55e" : "#475569");
    rect.setAttribute("stroke-width", isBestHighlighted ? "2" : "1.2");
    svg.append(rect);

    const title = document.createElementNS(SVG_NS, "text");
    title.setAttribute("x", String(px + pWidth / 2)); title.setAttribute("y", "48");
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("font-size", "12");
    title.setAttribute("font-weight", "bold");
    title.setAttribute("fill", isBestHighlighted ? "#4ade80" : "#cbd5e1");
    title.textContent = pl.name;
    svg.append(title);

    const valTxt = document.createElementNS(SVG_NS, "text");
    valTxt.setAttribute("x", String(px + pWidth / 2)); valTxt.setAttribute("y", "72");
    valTxt.setAttribute("text-anchor", "middle");
    valTxt.setAttribute("font-size", "14");
    valTxt.setAttribute("font-weight", "bold");
    valTxt.setAttribute("fill", "#f8fafc");
    valTxt.textContent = pl.val;
    svg.append(valTxt);

    if (isBestHighlighted) {
      const badge = document.createElementNS(SVG_NS, "text");
      badge.setAttribute("x", String(px + pWidth / 2)); badge.setAttribute("y", "90");
      badge.setAttribute("text-anchor", "middle");
      badge.setAttribute("font-size", "10");
      badge.setAttribute("fill", "#22c55e");
      badge.setAttribute("font-weight", "bold");
      badge.textContent = "★ 最优方案（消耗最少）";
      svg.append(badge);
    }
  });

  const tip = document.createElementNS(SVG_NS, "text");
  tip.setAttribute("x", "230"); tip.setAttribute("y", "122");
  tip.setAttribute("text-anchor", "middle");
  tip.setAttribute("font-size", "11");
  tip.setAttribute("fill", "#38bdf8");
  tip.textContent = "💡 决策准则：在满足同等目标需求的前提下，优先选择资源消耗或时间成本最小的方案。";
  svg.append(tip);

  card.append(svg);
  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "⚖️ 方案优化模型：将各可选方案的关键指标量化对比，找出成本最低或效益最高的方案编号。";
  card.append(legend);
  return card;
}

/**
 * 36. 分类讨论与分支决策树 (Case Analysis & Branching Decision Tree)
 */

function renderCaseAnalysisVisual(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--case-analysis";
  card.dataset.visualType = "case-analysis";

  const nums = parseNumbers(prompt);
  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🌿 分类讨论与分支决策树</span>
    <span class="question-visual__subbadge">不重不漏 · 分类加法原理推演</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  let branches = [];
  let rootLabel = "分类讨论目标";
  let formulaText = "";

  if (prompt.includes("奇偶")) {
    rootLabel = "按奇偶分类";
    branches = [
      { name: "奇数类", desc: "1, 3, 5, 7, 9...", color: "#38bdf8" },
      { name: "偶数类", desc: "0, 2, 4, 6, 8...", color: "#f59e0b" }
    ];
    formulaText = "整数按能否被 2 整除，严格分为奇数与偶数 2 大类";
  } else if (prompt.includes("路线")) {
    rootLabel = "路线完整长度";
    const aBase = nums[0] || 4;
    const bBase = nums[1] || 6;
    const extra = nums[2] || 2;
    branches = [
      { name: "A 路线", desc: `${aBase} + ${extra} = ${aBase + extra} km`, color: "#38bdf8" },
      { name: "B 路线", desc: `${bBase} + ${extra} = ${bBase + extra} km`, color: "#22c55e" }
    ];
    formulaText = isRevealed ? `两线总长之和 = ${aBase + extra} + ${bBase + extra} = ${(aBase + extra) + (bBase + extra)} 千米` : `两线总长之和 = (${aBase} + ${extra}) + (${bBase} + ${extra}) = ? 千米`;
  } else if (prompt.includes("个位可能是") || prompt.includes("只能是")) {
    rootLabel = "符合条件的可能值";
    const candidates = nums.length > 0 ? nums : [3, 4];
    branches = candidates.map((val, idx) => ({
      name: `情况 ${idx + 1}`,
      desc: `数值: ${val}`,
      color: idx % 2 === 0 ? "#38bdf8" : "#22c55e"
    }));
    formulaText = isRevealed ? `共有 ${branches.length} 种独立可能取值（互不重叠）` : `符合条件的独立可能取值（互不重叠）`;
  } else if (nums.length >= 2) {
    rootLabel = "各类别情况总览";
    branches = nums.map((n, idx) => ({
      name: `类别 ${idx + 1}`,
      desc: `${n} 种情况`,
      color: ["#38bdf8", "#22c55e", "#a855f7", "#f59e0b"][idx % 4]
    }));
    const total = nums.reduce((s, x) => s + x, 0);
    formulaText = isRevealed ? `加法原理：总情况数 = ${nums.join(" + ")} = ${total} 种` : `加法原理：总情况数 = ${nums.join(" + ")} = ? 种`;
  } else {
    branches = [
      { name: "第一类", desc: "互斥情况 A", color: "#38bdf8" },
      { name: "第二类", desc: "互斥情况 B", color: "#22c55e" }
    ];
    formulaText = "分类标准明确，满足无遗漏、无重复原则";
  }

  const rootBox = document.createElementNS(SVG_NS, "rect");
  rootBox.setAttribute("x", "20"); rootBox.setAttribute("y", "42");
  rootBox.setAttribute("width", "110"); rootBox.setAttribute("height", "36");
  rootBox.setAttribute("rx", "6");
  rootBox.setAttribute("fill", "#0f172a");
  rootBox.setAttribute("stroke", "#38bdf8");
  rootBox.setAttribute("stroke-width", "2");
  svg.append(rootBox);

  const rootTxt = document.createElementNS(SVG_NS, "text");
  rootTxt.setAttribute("x", "75"); rootTxt.setAttribute("y", "64");
  rootTxt.setAttribute("text-anchor", "middle");
  rootTxt.setAttribute("font-size", "11");
  rootTxt.setAttribute("font-weight", "bold");
  rootTxt.setAttribute("fill", "#f8fafc");
  rootTxt.textContent = rootLabel;
  svg.append(rootTxt);

  const bCount = Math.min(branches.length, 5);
  const branchSpacing = Math.min(32, 100 / Math.max(1, bCount - 1));
  const startBranchY = bCount === 1 ? 60 : 60 - ((bCount - 1) * branchSpacing) / 2;

  branches.slice(0, bCount).forEach((br, i) => {
    const by = startBranchY + i * branchSpacing;
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", `M 130 60 C 160 60, 160 ${by}, 190 ${by}`);
    path.setAttribute("stroke", br.color);
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("fill", "none");
    svg.append(path);

    const bBox = document.createElementNS(SVG_NS, "rect");
    bBox.setAttribute("x", "190"); bBox.setAttribute("y", String(by - 12));
    bBox.setAttribute("width", "240"); bBox.setAttribute("height", "24");
    bBox.setAttribute("rx", "4");
    bBox.setAttribute("fill", "rgba(30, 41, 59, 0.7)");
    bBox.setAttribute("stroke", br.color);
    bBox.setAttribute("stroke-width", "1");
    svg.append(bBox);

    const bTitle = document.createElementNS(SVG_NS, "text");
    bTitle.setAttribute("x", "200"); bTitle.setAttribute("y", String(by + 4));
    bTitle.setAttribute("font-size", "11");
    bTitle.setAttribute("font-weight", "bold");
    bTitle.setAttribute("fill", br.color);
    bTitle.textContent = br.name;
    svg.append(bTitle);

    const bDesc = document.createElementNS(SVG_NS, "text");
    bDesc.setAttribute("x", "280"); bDesc.setAttribute("y", String(by + 4));
    bDesc.setAttribute("font-size", "10");
    bDesc.setAttribute("fill", "#cbd5e1");
    bDesc.textContent = br.desc;
    svg.append(bDesc);
  });

  const fText = document.createElementNS(SVG_NS, "text");
  fText.setAttribute("x", "230"); fText.setAttribute("y", "126");
  fText.setAttribute("text-anchor", "middle");
  fText.setAttribute("font-size", "11");
  fText.setAttribute("font-weight", "bold");
  fText.setAttribute("fill", "#22c55e");
  fText.textContent = formulaText;
  svg.append(fText);

  card.append(svg);
  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "🌿 加法分类准则：按统一标准将全部可能分成若干类，各类之间互不重复、互不遗漏，总数等于各分类数之和。";
  card.append(legend);
  return card;
}

module.exports = {
  renderChickenRabbitPen,
  renderSurplusDeficitBalance,
  renderTreePlantingRoad,
  renderAverageLeveling,
  renderTrainBridgeTrack,
  renderUnitRateScale,
  renderMotionTrack,
  renderAgeDifferenceBar,
  renderEngineeringProgress,
  renderConcentrationVisual,
  renderTieredPricingVisual,
  renderReverseWorkflowVisual,
  renderSchedulingGanttVisual,
  renderPlanDesignVisual,
  renderCaseAnalysisVisual
};
