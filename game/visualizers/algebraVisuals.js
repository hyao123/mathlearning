const { SVG_NS, createSvg, parseNumbers, cleanPrompt, cleanParseNumbers, extractLabeledParams, extractSolutionContext, safeAddListener, createControlBtn, safeClassAdd, safeClassRemove } = require('./visualizerCore.js');

function renderBarModel(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const cleaned = cleanPrompt(prompt);
  const card = document.createElement("div");
  card.className = "question-visual question-visual--bar-model";
  card.dataset.visualType = "bar-model";

  // Entity label extraction
  let labelSmall = "较小数";
  let labelLarge = "较大数";
  if (cleaned.includes("大箱") && cleaned.includes("小箱")) {
    labelSmall = "小箱数量";
    labelLarge = "大箱数量";
  } else if (cleaned.includes("男生") && cleaned.includes("女生")) {
    if (cleaned.includes("男生比女生多") || cleaned.includes("女生比男生少")) {
      labelSmall = "女生人数";
      labelLarge = "男生人数";
    } else {
      labelSmall = "男生人数";
      labelLarge = "女生人数";
    }
  } else if (cleaned.includes("甲") && cleaned.includes("乙")) {
    if (cleaned.includes("甲比乙多") || cleaned.includes("乙比甲少")) {
      labelSmall = "乙";
      labelLarge = "甲";
    } else {
      labelSmall = "甲";
      labelLarge = "乙";
    }
  } else if (cleaned.includes("哥哥") && cleaned.includes("弟弟")) {
    labelSmall = "弟弟";
    labelLarge = "哥哥";
  }

  // Value extraction: difference & sum
  const sumMatch = cleaned.match(/(?:和(?:是|为)?|共有|一共|合计|总共|总数(?:是|为)?)\s*(\d+)/);
  const diffMatch = cleaned.match(/(?:相差|差(?:是|为)?|(?:比[^\s，。]+)?多|(?:比[^\s，。]+)?少)\s*(\d+)/);

  let total = 17;
  let diff = 3;

  if (sumMatch && diffMatch) {
    total = parseInt(sumMatch[1], 10);
    diff = parseInt(diffMatch[1], 10);
  } else {
    const nums = cleanParseNumbers(cleaned);
    if (nums.length >= 2) {
      total = Math.max(nums[0], nums[1]);
      diff = Math.min(nums[0], nums[1]);
    }
  }

  // Safety: total must be >= diff
  if (total < diff) {
    const tmp = total;
    total = diff;
    diff = tmp;
  }

  const smallVal = (total - diff) / 2;
  const largeVal = (total + diff) / 2;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📊 和差倍数线段图模型</span>
    <span class="question-visual__subbadge">移多补少与基准量消元法</span>
  `;
  card.append(header);

  const svg = createSvg(440, 150, "0 0 440 150");

  const baseWidth = 130;
  const barHeight = 24;
  const diffRatio = total > 0 ? Math.min(diff / total, 0.6) : 0.2;
  const diffWidth = Math.max(35, Math.min(95, Math.round(diffRatio * 160)));

  // Bar 1: Small entity
  const text1 = document.createElementNS(SVG_NS, "text");
  text1.setAttribute("x", "15");
  text1.setAttribute("y", "42");
  text1.setAttribute("font-size", "12");
  text1.setAttribute("font-weight", "bold");
  text1.setAttribute("fill", "#cbd5e1");
  text1.textContent = `${labelSmall}：`;
  svg.append(text1);

  const rect1 = document.createElementNS(SVG_NS, "rect");
  rect1.setAttribute("x", "95");
  rect1.setAttribute("y", "24");
  rect1.setAttribute("width", String(baseWidth));
  rect1.setAttribute("height", String(barHeight));
  rect1.setAttribute("fill", "#3b82f6");
  rect1.setAttribute("rx", "4");
  svg.append(rect1);

  if (isRevealed && smallVal > 0) {
    const tVal1 = document.createElementNS(SVG_NS, "text");
    tVal1.setAttribute("x", String(95 + baseWidth / 2));
    tVal1.setAttribute("y", "40");
    tVal1.setAttribute("text-anchor", "middle");
    tVal1.setAttribute("font-size", "11");
    tVal1.setAttribute("font-weight", "bold");
    tVal1.setAttribute("fill", "#ffffff");
    tVal1.textContent = `基准 ＝ ${smallVal}`;
    svg.append(tVal1);
  }

  // Bar 2: Large entity
  const text2 = document.createElementNS(SVG_NS, "text");
  text2.setAttribute("x", "15");
  text2.setAttribute("y", "86");
  text2.setAttribute("font-size", "12");
  text2.setAttribute("font-weight", "bold");
  text2.setAttribute("fill", "#cbd5e1");
  text2.textContent = `${labelLarge}：`;
  svg.append(text2);

  const rect2Base = document.createElementNS(SVG_NS, "rect");
  rect2Base.setAttribute("x", "95");
  rect2Base.setAttribute("y", "68");
  rect2Base.setAttribute("width", String(baseWidth));
  rect2Base.setAttribute("height", String(barHeight));
  rect2Base.setAttribute("fill", "#3b82f6");
  rect2Base.setAttribute("rx", "4");
  svg.append(rect2Base);

  // Difference segment
  const rect2Diff = document.createElementNS(SVG_NS, "rect");
  rect2Diff.setAttribute("x", String(95 + baseWidth));
  rect2Diff.setAttribute("y", "68");
  rect2Diff.setAttribute("width", String(diffWidth));
  rect2Diff.setAttribute("height", String(barHeight));
  rect2Diff.setAttribute("fill", "#f59e0b");
  rect2Diff.setAttribute("stroke", "#fbbf24");
  rect2Diff.setAttribute("stroke-width", "1.5");
  rect2Diff.setAttribute("stroke-dasharray", "3,2");
  rect2Diff.setAttribute("rx", "4");
  svg.append(rect2Diff);

  const diffTag = document.createElementNS(SVG_NS, "text");
  diffTag.setAttribute("x", String(95 + baseWidth + diffWidth / 2));
  diffTag.setAttribute("y", "84");
  diffTag.setAttribute("text-anchor", "middle");
  diffTag.setAttribute("font-size", "11");
  diffTag.setAttribute("font-weight", "bold");
  diffTag.setAttribute("fill", "#0f172a");
  diffTag.textContent = `多 ${diff}`;
  svg.append(diffTag);

  // Curly bracket line
  const endX = 95 + baseWidth + diffWidth + 12;
  const totalLine = document.createElementNS(SVG_NS, "path");
  totalLine.setAttribute("d", `M ${endX} 24 L ${endX + 8} 24 L ${endX + 8} 58 L ${endX + 16} 58 L ${endX + 8} 58 L ${endX + 8} 92 L ${endX} 92`);
  totalLine.setAttribute("fill", "none");
  totalLine.setAttribute("stroke", "#10b981");
  totalLine.setAttribute("stroke-width", "2");
  svg.append(totalLine);

  const totalTag = document.createElementNS(SVG_NS, "text");
  totalTag.setAttribute("x", String(endX + 22));
  totalTag.setAttribute("y", "63");
  totalTag.setAttribute("font-size", "12");
  totalTag.setAttribute("font-weight", "bold");
  totalTag.setAttribute("fill", "#10b981");
  totalTag.textContent = `和: ${total}`;
  svg.append(totalTag);

  // Bottom formula guidance
  const bottomFormula = document.createElementNS(SVG_NS, "text");
  bottomFormula.setAttribute("x", "220");
  bottomFormula.setAttribute("y", "128");
  bottomFormula.setAttribute("text-anchor", "middle");
  bottomFormula.setAttribute("font-size", "12");
  bottomFormula.setAttribute("fill", "#38bdf8");
  bottomFormula.textContent = isRevealed
    ? `基准较小数 ＝ (${total} - ${diff}) ÷ 2 ＝ ${smallVal} ｜ 较大数 ＝ ${smallVal} + ${diff} ＝ ${largeVal}`
    : `线段公式：较小数 ＝ (和 - 差) ÷ 2 ｜ 较大数 ＝ (和 + 差) ÷ 2`;
  svg.append(bottomFormula);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = `📊 和差极简心法：从总数 ${total} 中减去多出的差量 ${diff}，剩下就是 2 份完全相等的基准量 (${labelSmall})。`;
  card.append(legend);

  return card;
}

/**
 * Renders an Equation or Formula Card
 */

function renderEquation(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--equation";
  card.dataset.visualType = "equation";

  let eqText = "";
  if (prompt.includes("算式：") || prompt.includes("算式是")) {
    const match = prompt.match(/算式[：是]([^，。]+)/);
    if (match) eqText = match[1].trim();
  }
  if (!eqText) {
    const eqMatch = prompt.match(/([^\s，。]+[\+\-\×\÷\=][^\s，。]+)/);
    if (eqMatch) eqText = eqMatch[1].trim();
  }
  if (!eqText) eqText = "等式平衡模型 · 逆向还原推导";

  const badge = document.createElement("div");
  badge.className = "question-visual__equation-box";
  badge.innerHTML = `
    <span class="question-visual__equation-icon">∑</span>
    <span class="question-visual__equation-formula">${eqText}</span>
  `;
  card.append(badge);

  const hint = document.createElement("p");
  hint.className = "question-visual__legend";
  hint.textContent = "数学等式模型：等号两侧保持平衡，利用逆运算反推初始未知量。";
  card.append(hint);
  return card;
}

/**
 * Renders a Geometric or Relational Diagram
 */

function renderQuickCalcBridge(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--quick-calc";
  card.dataset.visualType = "quick-calc";

  const nums = parseNumbers(prompt);
  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">⚡ 算式磁吸重组桥梁</span>
    <span class="question-visual__subbadge">互补结合律秒口算</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const count = Math.min(nums.length || 3, 5);
  const stepX = (svgWidth - 60) / count;

  for (let i = 0; i < count; i++) {
    const val = nums[i] || (i === 0 ? 684 : i === 1 ? 199 : 316);
    const cx = 50 + i * stepX;
    const isPair = (val === 684 || val === 316 || val === 1 || val === 999 || val === 278 || val === 722 || val === 125 || val === 8 || val === 24);

    const block = document.createElementNS(SVG_NS, "rect");
    block.setAttribute("x", String(cx - 28));
    block.setAttribute("y", "70");
    block.setAttribute("width", "56");
    block.setAttribute("height", "40");
    block.setAttribute("rx", "8");
    block.setAttribute("fill", isPair ? "#1e3a8a" : "#1e293b");
    block.setAttribute("stroke", isPair ? "#38bdf8" : "#475569");
    block.setAttribute("stroke-width", isPair ? "2.5" : "1.5");
    svg.append(block);

    const txt = document.createElementNS(SVG_NS, "text");
    txt.setAttribute("x", String(cx));
    txt.setAttribute("y", "95");
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("font-size", "14");
    txt.setAttribute("font-weight", "bold");
    txt.setAttribute("fill", isPair ? "#38bdf8" : "#f8fafc");
    txt.textContent = String(val);
    svg.append(txt);

    if (i < count - 1) {
      const op = document.createElementNS(SVG_NS, "text");
      op.setAttribute("x", String(cx + stepX / 2));
      op.setAttribute("y", "95");
      op.setAttribute("text-anchor", "middle");
      op.setAttribute("font-size", "16");
      op.setAttribute("fill", "#64748b");
      op.textContent = prompt.includes("×") ? "×" : "+";
      svg.append(op);
    }
  }

  let pair1 = 0;
  let pair2 = count - 1;
  let targetSum = 1000;
  let foundPair = false;
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const s = (nums[i] || 0) + (nums[j] || 0);
      if (s > 0 && s % 10 === 0) {
        pair1 = i;
        pair2 = j;
        targetSum = s;
        foundPair = true;
        break;
      }
    }
    if (foundPair) break;
  }

  const x1 = 50 + pair1 * stepX;
  const x2 = 50 + pair2 * stepX;
  const midX = (x1 + x2) / 2;

  const arc = document.createElementNS(SVG_NS, "path");
  arc.setAttribute("d", `M ${x1} 64 Q ${midX} 15 ${x2} 64`);
  arc.setAttribute("fill", "none");
  arc.setAttribute("stroke", "#f59e0b");
  arc.setAttribute("stroke-width", "3");
  arc.setAttribute("stroke-dasharray", "4,3");
  svg.append(arc);

  const snapTag = document.createElementNS(SVG_NS, "text");
  snapTag.setAttribute("x", String(midX));
  snapTag.setAttribute("y", "26");
  snapTag.setAttribute("text-anchor", "middle");
  snapTag.setAttribute("font-size", "13");
  snapTag.setAttribute("font-weight", "bold");
  snapTag.setAttribute("fill", "#f59e0b");
  snapTag.textContent = `🧲 互补凑整 ➔ ${targetSum}`;
  svg.append(snapTag);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "💡 速算巧算导引：观察首尾数或互补数，先将它们结合成整百、整千，繁琐计算瞬间变口算。";
  card.append(legend);

  return card;
}

/**
 * 6. 容斥原理与重叠集合：发光双圈韦恩图 (Luminous Venn Diagram)
 */

function renderParityDivisibilityCard(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--parity";
  card.dataset.visualType = "parity";

  const isDivisible = prompt.includes("整除") || prompt.includes("余数") || prompt.includes("倍数") || prompt.includes("除以");

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🔢 ${isDivisible ? "整除特性与数字位和规律" : "奇偶性成对配对模型"}</span>
    <span class="question-visual__subbadge">${isDivisible ? "各位数字和是3或9的倍数" : "成对配对：偶数可成对，奇数必落单"}</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  if (isDivisible) {
    const nums = parseNumbers(prompt);
    const testNum = nums.find(n => n >= 20) || 528;
    const digits = String(testNum).split("").map(Number);
    const digitSum = digits.reduce((a, b) => a + b, 0);

    const t1 = document.createElementNS(SVG_NS, "text");
    t1.setAttribute("x", "230");
    t1.setAttribute("y", "45");
    t1.setAttribute("text-anchor", "middle");
    t1.setAttribute("font-size", "14");
    t1.setAttribute("font-weight", "bold");
    t1.setAttribute("fill", "#38bdf8");
    t1.textContent = `待检数: ${testNum} ➔ 各位数字之和: ${digits.join(" + ")} ＝ ${digitSum}`;
    svg.append(t1);

    const t2 = document.createElementNS(SVG_NS, "text");
    t2.setAttribute("x", "230");
    t2.setAttribute("y", "80");
    t2.setAttribute("text-anchor", "middle");
    t2.setAttribute("font-size", "13");
    t2.setAttribute("font-weight", "bold");
    t2.setAttribute("fill", digitSum % 3 === 0 ? "#22c55e" : "#ec4899");
    t2.textContent = digitSum % 3 === 0
      ? `✔ 各位数字和 ${digitSum} 是 3 的倍数 ➔ 原数 ${testNum} 必然能被整除！`
      : `✖ 各位数字和 ${digitSum} 不是 3 的倍数 ➔ 原数 ${testNum} 不能被整除。`;
    svg.append(t2);

    const t3 = document.createElementNS(SVG_NS, "text");
    t3.setAttribute("x", "230");
    t3.setAttribute("y", "115");
    t3.setAttribute("text-anchor", "middle");
    t3.setAttribute("font-size", "11");
    t3.setAttribute("fill", "#94a3b8");
    t3.textContent = "整除秘诀：3 和 9 的倍数看各位数字之和；2 和 5 的倍数只看个位！";
    svg.append(t3);
  } else {
    const tEven = document.createElementNS(SVG_NS, "text");
    tEven.setAttribute("x", "60");
    tEven.setAttribute("y", "40");
    tEven.setAttribute("font-size", "12");
    tEven.setAttribute("font-weight", "bold");
    tEven.setAttribute("fill", "#38bdf8");
    tEven.textContent = "偶数 (两两成对):";
    svg.append(tEven);

    for (let i = 0; i < 3; i++) {
      const g = document.createElementNS(SVG_NS, "rect");
      g.setAttribute("x", String(180 + i * 42));
      g.setAttribute("y", "26");
      g.setAttribute("width", "36");
      g.setAttribute("height", "20");
      g.setAttribute("rx", "4");
      g.setAttribute("fill", "#3b82f6");
      g.setAttribute("opacity", "0.7");
      svg.append(g);

      const d1 = document.createElementNS(SVG_NS, "circle");
      d1.setAttribute("cx", String(190 + i * 42));
      d1.setAttribute("cy", "36");
      d1.setAttribute("r", "5");
      d1.setAttribute("fill", "#f8fafc");
      svg.append(d1);

      const d2 = document.createElementNS(SVG_NS, "circle");
      d2.setAttribute("cx", String(206 + i * 42));
      d2.setAttribute("cy", "36");
      d2.setAttribute("r", "5");
      d2.setAttribute("fill", "#f8fafc");
      svg.append(d2);
    }

    const tOdd = document.createElementNS(SVG_NS, "text");
    tOdd.setAttribute("x", "60");
    tOdd.setAttribute("y", "75");
    tOdd.setAttribute("font-size", "12");
    tOdd.setAttribute("font-weight", "bold");
    tOdd.setAttribute("fill", "#ec4899");
    tOdd.textContent = "奇数 (必留单数):";
    svg.append(tOdd);

    for (let i = 0; i < 2; i++) {
      const g = document.createElementNS(SVG_NS, "rect");
      g.setAttribute("x", String(180 + i * 42));
      g.setAttribute("y", "61");
      g.setAttribute("width", "36");
      g.setAttribute("height", "20");
      g.setAttribute("rx", "4");
      g.setAttribute("fill", "#ec4899");
      g.setAttribute("opacity", "0.7");
      svg.append(g);

      const d1 = document.createElementNS(SVG_NS, "circle");
      d1.setAttribute("cx", String(190 + i * 42));
      d1.setAttribute("cy", "71");
      d1.setAttribute("r", "5");
      d1.setAttribute("fill", "#f8fafc");
      svg.append(d1);

      const d2 = document.createElementNS(SVG_NS, "circle");
      d2.setAttribute("cx", String(206 + i * 42));
      d2.setAttribute("cy", "71");
      d2.setAttribute("r", "5");
      d2.setAttribute("fill", "#f8fafc");
      svg.append(d2);
    }

    const lone = document.createElementNS(SVG_NS, "circle");
    lone.setAttribute("cx", "275");
    lone.setAttribute("cy", "71");
    lone.setAttribute("r", "6");
    lone.setAttribute("fill", "#fbbf24");
    lone.setAttribute("stroke", "#f8fafc");
    lone.setAttribute("stroke-width", "2");
    svg.append(lone);

    const lText = document.createElementNS(SVG_NS, "text");
    lText.setAttribute("x", "290");
    lText.setAttribute("y", "75");
    lText.setAttribute("font-size", "11");
    lText.setAttribute("font-weight", "bold");
    lText.setAttribute("fill", "#fbbf24");
    lText.textContent = "👈 余1落单";
    svg.append(lText);

    const rSummary = document.createElementNS(SVG_NS, "text");
    rSummary.setAttribute("x", "230");
    rSummary.setAttribute("y", "115");
    rSummary.setAttribute("text-anchor", "middle");
    rSummary.setAttribute("font-size", "12");
    rSummary.setAttribute("font-weight", "bold");
    rSummary.setAttribute("fill", "#22c55e");
    rSummary.textContent = "奇数 ＋ 偶数 ＝ 奇数 ｜ 奇数 × 偶数 ＝ 偶数 ｜ 连续整数乘积必为偶数";
    svg.append(rSummary);
  }

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = isDivisible
    ? "🔢 整除判别法：3 或 9 的倍数只要把每个数位上的数字相加，和能被整除，原数就能被整除。"
    : "🔢 奇偶规律：偶数代表能刚好成双配对，奇数代表总会多出 1 个落单。有偶数参与乘法，积必然能被 2 整除。";
  card.append(legend);

  return card;
}

/**
 * 辅助：检测题目是否含有应形象化呈现的数学模型关键词
 */

/**
 * 19. 角度度量与空间方位模型 (Angle & Protractor Model)
 */

function renderEquationBalanceVisual(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--balance";
  card.dataset.visualType = "balance";

  const cleaned = cleanPrompt(prompt);
  let xCount = 1;
  let xWeight = 5;
  let rightTotal = 20;

  const eqAddMatch = cleaned.match(/(\d*)\s*x\s*\+\s*(\d+)\s*=\s*(\d+)/i) || cleaned.match(/(\d+)\s*\+\s*(\d*)\s*x\s*=\s*(\d+)/i);
  const eqSubMatch = cleaned.match(/(\d*)\s*x\s*-\s*(\d+)\s*=\s*(\d+)/i);

  if (eqAddMatch) {
    xCount = eqAddMatch[1] ? (parseInt(eqAddMatch[1], 10) || 1) : 1;
    xWeight = parseInt(eqAddMatch[2], 10);
    rightTotal = parseInt(eqAddMatch[3], 10);
  } else if (eqSubMatch) {
    xCount = eqSubMatch[1] ? (parseInt(eqSubMatch[1], 10) || 1) : 1;
    xWeight = parseInt(eqSubMatch[2], 10);
    rightTotal = parseInt(eqSubMatch[3], 10);
  } else {
    const nums = cleanParseNumbers(cleaned);
    xCount = cleaned.includes("2 个未知数") || cleaned.includes("2个未知数") || cleaned.includes("2x") ? 2 : 1;
    if (nums.length >= 2) {
      xWeight = Math.min(nums[0], nums[1]);
      rightTotal = Math.max(nums[0], nums[1]);
    } else if (nums.length === 1) {
      xWeight = nums[0];
      rightTotal = xWeight * 2 + 10;
    }
  }

  const targetX = Math.max(1, Math.round(Math.abs(rightTotal - xWeight) / xCount));
  const maxRange = Math.max(20, targetX * 2);

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">⚖️ 方程等式与天平平衡模型</span>
    <span class="question-visual__subbadge">等式两边同时增减乘除值不变</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const fx = 230, fy = 125;
  const fulcrum = document.createElementNS(SVG_NS, "polygon");
  fulcrum.setAttribute("points", `${fx},${fy-40} ${fx-22},${fy} ${fx+22},${fy}`);
  fulcrum.setAttribute("fill", "#475569"); fulcrum.setAttribute("stroke", "#64748b"); fulcrum.setAttribute("stroke-width", "2");
  svg.append(fulcrum);

  const beam = document.createElementNS(SVG_NS, "line");
  beam.setAttribute("x1", "70"); beam.setAttribute("y1", String(fy - 40));
  beam.setAttribute("x2", "390"); beam.setAttribute("y2", String(fy - 40));
  beam.setAttribute("stroke", "#38bdf8"); beam.setAttribute("stroke-width", "4");
  beam.setAttribute("stroke-linecap", "round");
  svg.append(beam);

  const pin = document.createElementNS(SVG_NS, "circle");
  pin.setAttribute("cx", String(fx)); pin.setAttribute("cy", String(fy - 40));
  pin.setAttribute("r", "5"); pin.setAttribute("fill", "#f59e0b");
  svg.append(pin);

  const lpX = 110, panY = fy - 10;
  const lChain1 = document.createElementNS(SVG_NS, "line");
  lChain1.setAttribute("x1", "80"); lChain1.setAttribute("y1", String(fy - 40));
  lChain1.setAttribute("x2", String(lpX - 35)); lChain1.setAttribute("y2", String(panY));
  lChain1.setAttribute("stroke", "#94a3b8"); lChain1.setAttribute("stroke-width", "1.5");
  svg.append(lChain1);

  const lChain2 = document.createElementNS(SVG_NS, "line");
  lChain2.setAttribute("x1", "140"); lChain2.setAttribute("y1", String(fy - 40));
  lChain2.setAttribute("x2", String(lpX + 35)); lChain2.setAttribute("y2", String(panY));
  lChain2.setAttribute("stroke", "#94a3b8"); lChain2.setAttribute("stroke-width", "1.5");
  svg.append(lChain2);

  const lPan = document.createElementNS(SVG_NS, "path");
  lPan.setAttribute("d", `M ${lpX - 40} ${panY} Q ${lpX} ${panY + 12} ${lpX + 40} ${panY} Z`);
  lPan.setAttribute("fill", "#1e293b"); lPan.setAttribute("stroke", "#38bdf8"); lPan.setAttribute("stroke-width", "2");
  svg.append(lPan);

  const xBox = document.createElementNS(SVG_NS, "rect");
  xBox.setAttribute("x", String(lpX - 25)); xBox.setAttribute("y", String(panY - 28));
  xBox.setAttribute("width", "26"); xBox.setAttribute("height", "26");
  xBox.setAttribute("rx", "4"); xBox.setAttribute("fill", "#a855f7");
  xBox.setAttribute("stroke", "#c084fc"); xBox.setAttribute("stroke-width", "1.5");
  svg.append(xBox);

  const xLabel = document.createElementNS(SVG_NS, "text");
  xLabel.setAttribute("x", String(lpX - 12)); xLabel.setAttribute("y", String(panY - 11));
  xLabel.setAttribute("text-anchor", "middle");
  xLabel.setAttribute("font-size", "12"); xLabel.setAttribute("font-weight", "bold");
  xLabel.setAttribute("fill", "#f8fafc"); xLabel.textContent = "x";
  svg.append(xLabel);

  const rpX = 350;
  const rChain1 = document.createElementNS(SVG_NS, "line");
  rChain1.setAttribute("x1", "320"); rChain1.setAttribute("y1", String(fy - 40));
  rChain1.setAttribute("x2", String(rpX - 35)); rChain1.setAttribute("y2", String(panY));
  rChain1.setAttribute("stroke", "#94a3b8"); rChain1.setAttribute("stroke-width", "1.5");
  svg.append(rChain1);

  const rChain2 = document.createElementNS(SVG_NS, "line");
  rChain2.setAttribute("x1", "380"); rChain2.setAttribute("y1", String(fy - 40));
  rChain2.setAttribute("x2", String(rpX + 35)); rChain2.setAttribute("y2", String(panY));
  rChain2.setAttribute("stroke", "#94a3b8"); rChain2.setAttribute("stroke-width", "1.5");
  svg.append(rChain2);

  const rPan = document.createElementNS(SVG_NS, "path");
  rPan.setAttribute("d", `M ${rpX - 40} ${panY} Q ${rpX} ${panY + 12} ${rpX + 40} ${panY} Z`);
  rPan.setAttribute("fill", "#1e293b"); rPan.setAttribute("stroke", "#38bdf8"); rPan.setAttribute("stroke-width", "2");
  svg.append(rPan);

  const wRight = document.createElementNS(SVG_NS, "rect");
  wRight.setAttribute("x", String(rpX - 22)); wRight.setAttribute("y", String(panY - 28));
  wRight.setAttribute("width", "44"); wRight.setAttribute("height", "26");
  wRight.setAttribute("rx", "4"); wRight.setAttribute("fill", "#22c55e");
  svg.append(wRight);

  const rText = document.createElementNS(SVG_NS, "text");
  rText.setAttribute("x", String(rpX)); rText.setAttribute("y", String(panY - 11));
  rText.setAttribute("text-anchor", "middle");
  rText.setAttribute("font-size", "11"); rText.setAttribute("font-weight", "bold");
  rText.setAttribute("fill", "#0f172a"); rText.textContent = `${rightTotal}g`;
  svg.append(rText);

  const eqText = document.createElementNS(SVG_NS, "text");
  eqText.setAttribute("x", "230"); eqText.setAttribute("y", "24");
  eqText.setAttribute("text-anchor", "middle");
  eqText.setAttribute("font-size", "13"); eqText.setAttribute("font-weight", "bold");
  eqText.setAttribute("fill", "#22c55e");
  eqText.textContent = isRevealed ? `天平平衡：左盘 (${xCount === 2 ? "2个" : ""}未知数 x ＋ 砝码 ${xWeight}g) ＝ 右盘 ${rightTotal}g ➔ x ＝ ${targetX}` : `天平平衡：左盘 (${xCount === 2 ? "2个" : ""}未知数 x ＋ 砝码 ${xWeight}g) ＝ 右盘 ${rightTotal}g`;
  svg.append(eqText);

  // Interactive balance manipulative controls
  const controls = document.createElement("div");
  controls.className = "question-visual__controls question-visual__controls--balance";
  controls.dataset.manipulative = "equation-balance";

  const ctrlRow = document.createElement("div");
  ctrlRow.className = "question-visual__control-row";

  const btnDec = createControlBtn("➖ x 减 1", "", "减少未知数x数值");
  const btnInc = createControlBtn("➕ x 加 1", "", "增加未知数x数值");
  const btnSolve = createControlBtn("⚡ 自动配平", "", "直接调整到平衡解");
  btnSolve.setAttribute("data-solve-btn", "true");
  ctrlRow.append(btnDec, btnInc, btnSolve);

  const sliderRow = document.createElement("div");
  sliderRow.className = "question-visual__slider-row";
  const sliderLabel = document.createElement("label");
  sliderLabel.className = "question-visual__slider-label";
  sliderLabel.innerHTML = `<span>未知数 <strong>x ＝ <span class="balance-x-val">1</span></strong></span>`;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.className = "question-visual__slider";
  slider.min = "1";
  slider.max = String(maxRange);
  slider.value = "1";
  slider.setAttribute("aria-label", "未知数x调整滑块");
  sliderLabel.append(slider);
  sliderRow.append(sliderLabel);

  const metricsRow = document.createElement("div");
  metricsRow.className = "question-visual__metrics";
  const m1 = document.createElement("span");
  m1.className = "question-visual__metric";
  m1.innerHTML = `左盘重量: <strong class="balance-left-w">--</strong> 克`;
  const m2 = document.createElement("span");
  m2.className = "question-visual__metric";
  m2.innerHTML = `右盘重量: <strong class="balance-right-w">${rightTotal}</strong> 克`;
  const m3 = document.createElement("span");
  m3.className = "question-visual__metric question-visual__metric--highlight";
  m3.innerHTML = `天平状态: <strong class="balance-state">右倾（偏轻）</strong>`;
  metricsRow.append(m1, m2, m3);

  const statusBox = document.createElement("div");
  statusBox.className = "question-visual__status";

  function updateBalance(currX) {
    const x = Math.max(1, Math.min(maxRange, Number(currX) || 1));
    slider.value = String(x);
    const xValElem = sliderLabel.querySelector ? sliderLabel.querySelector(".balance-x-val") : null;
    if (xValElem) xValElem.textContent = String(x);

    const leftW = xCount * x + xWeight;
    const diff = rightTotal - leftW;
    const angle = Math.max(-12, Math.min(12, diff * 1.5));

    beam.setAttribute("transform", `rotate(${angle} ${fx} ${fy - 40})`);

    const leftWElem = metricsRow.querySelector ? metricsRow.querySelector(".balance-left-w") : null;
    const stateElem = metricsRow.querySelector ? metricsRow.querySelector(".balance-state") : null;
    if (leftWElem) leftWElem.textContent = String(leftW);

    if (diff === 0) {
      if (stateElem) stateElem.textContent = "⚖️ 完美平衡";
      statusBox.className = "question-visual__status is-balanced";
      statusBox.textContent = isRevealed ? `⚖️ 天平完美平衡！两边重量相等 (${rightTotal}g)，解得未知数 x ＝ ${x}！` : `⚖️ 天平完美平衡！两边重量相等 (${rightTotal}g)！`;
      safeClassAdd(card, "is-balanced");
      beam.setAttribute("stroke", "#22c55e");
    } else if (diff > 0) {
      if (stateElem) stateElem.textContent = `右倾（偏轻 ${diff}g）`;
      statusBox.className = "question-visual__status";
      statusBox.textContent = `天平右倾（左边偏轻 ${diff}g）➔ 需调大未知数 x`;
      safeClassRemove(card, "is-balanced");
      beam.setAttribute("stroke", "#38bdf8");
    } else {
      if (stateElem) stateElem.textContent = `左倾（偏重 ${-diff}g）`;
      statusBox.className = "question-visual__status";
      statusBox.textContent = `天平左倾（左边偏重 ${-diff}g）➔ 需调小未知数 x`;
      safeClassRemove(card, "is-balanced");
      beam.setAttribute("stroke", "#38bdf8");
    }
  }

  safeAddListener(slider, "input", (e) => updateBalance(e.target.value));
  safeAddListener(btnDec, "click", () => updateBalance(Number(slider.value) - 1));
  safeAddListener(btnInc, "click", () => updateBalance(Number(slider.value) + 1));
  safeAddListener(btnSolve, "click", () => updateBalance(targetX));

  controls.append(ctrlRow, sliderRow, metricsRow, statusBox);
  updateBalance(1);

  card.append(svg);
  card.append(controls);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "⚖️ 等式性质：天平两端保持平衡，犹如方程左右两边相等。两边同时减去相同量，天平依然平衡。";
  card.append(legend);

  return card;
}

/**
 * 26. 分数、百分比与经济折扣标尺 (Fraction & Percent Model)
 */

function renderFractionPercentVisual(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--fraction";
  card.dataset.visualType = "fraction";

  const cleaned = cleanPrompt(prompt);
  const nums = cleanParseNumbers(cleaned);
  const isPercent = cleaned.includes("%") || cleaned.includes("折") || cleaned.includes("成");
  const pct = nums.find(n => n >= 10 && n <= 95) || 80;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🏷️ 分数、百分比与经济标尺</span>
    <span class="question-visual__subbadge">${isPercent ? "折扣与百分比份额映射" : "几分之几整体与部分分割"}</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const bx = 45, by = 45, bw = 370, bh = 34;

  const bgBar = document.createElementNS(SVG_NS, "rect");
  bgBar.setAttribute("x", String(bx)); bgBar.setAttribute("y", String(by));
  bgBar.setAttribute("width", String(bw)); bgBar.setAttribute("height", String(bh));
  bgBar.setAttribute("rx", "6");
  bgBar.setAttribute("fill", "rgba(30, 41, 59, 0.8)");
  bgBar.setAttribute("stroke", "#475569"); bgBar.setAttribute("stroke-width", "2");
  svg.append(bgBar);

  const activeW = (pct / 100) * bw;
  const fillBar = document.createElementNS(SVG_NS, "rect");
  fillBar.setAttribute("x", String(bx)); fillBar.setAttribute("y", String(by));
  fillBar.setAttribute("width", String(activeW)); fillBar.setAttribute("height", String(bh));
  fillBar.setAttribute("rx", "6");
  fillBar.setAttribute("fill", "#0284c7");
  fillBar.setAttribute("stroke", "#38bdf8"); fillBar.setAttribute("stroke-width", "2");
  svg.append(fillBar);

  const fillText = document.createElementNS(SVG_NS, "text");
  fillText.setAttribute("x", String(bx + activeW / 2));
  fillText.setAttribute("y", String(by + 22));
  fillText.setAttribute("text-anchor", "middle");
  fillText.setAttribute("font-size", "12"); fillText.setAttribute("font-weight", "bold");
  fillText.setAttribute("fill", "#f8fafc"); fillText.textContent = `${pct}% 部分`;
  svg.append(fillText);

  const restText = document.createElementNS(SVG_NS, "text");
  restText.setAttribute("x", String(bx + activeW + (bw - activeW) / 2));
  restText.setAttribute("y", String(by + 22));
  restText.setAttribute("text-anchor", "middle");
  restText.setAttribute("font-size", "11"); restText.setAttribute("fill", "#94a3b8");
  restText.textContent = `${100 - pct}%`;
  svg.append(restText);

  const topText = document.createElementNS(SVG_NS, "text");
  topText.setAttribute("x", "230"); topText.setAttribute("y", "26");
  topText.setAttribute("text-anchor", "middle");
  topText.setAttribute("font-size", "12"); topText.setAttribute("font-weight", "bold");
  topText.setAttribute("fill", "#38bdf8"); topText.textContent = "单位“1” (总量 100%)";
  svg.append(topText);

  const bText = document.createElementNS(SVG_NS, "text");
  bText.setAttribute("x", "230"); bText.setAttribute("y", "115");
  bText.setAttribute("text-anchor", "middle");
  bText.setAttribute("font-size", "12"); bText.setAttribute("font-weight", "bold");
  bText.setAttribute("fill", "#22c55e");
  bText.textContent = `部分量 ＝ 单位“1”的总量 × 对应分率 (${pct}%)`;
  svg.append(bText);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "🏷️ 分数百分数核心解法：先找准单位“1”。求分率对应量用乘法，求单位“1”本身用除法。";
  card.append(legend);

  return card;
}

/**
 * 28. 质因数分解与阶梯短除法 (Short Division Ladder & Factorization)
 * 求最大公因数 (GCD)、最小公倍数 (LCM) 与质因数分解的深层数理模型
 */

function isPrimeNumber(n) {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function computeShortDivisionLadder(numA, numB) {
  let a = Math.abs(Math.round(numA));
  let b = Math.abs(Math.round(numB));
  if (!a || a < 1) a = 24;
  if (!b || b < 1) b = 36;

  const steps = [];
  const commonDivisors = [];
  let curA = a;
  let curB = b;

  function findSmallestCommonPrime(x, y) {
    const minVal = Math.min(x, y);
    if (minVal < 2) return null;
    if (x % 2 === 0 && y % 2 === 0) return 2;
    for (let p = 3; p * p <= minVal; p += 2) {
      if (x % p === 0 && y % p === 0 && isPrimeNumber(p)) return p;
    }
    // Check remaining divisors
    for (let d = 3; d <= minVal; d += 2) {
      if (x % d === 0 && y % d === 0 && isPrimeNumber(d)) return d;
    }
    if (isPrimeNumber(minVal) && x % minVal === 0 && y % minVal === 0) return minVal;
    return null;
  }

  let safety = 0;
  while (safety++ < 12) {
    const p = findSmallestCommonPrime(curA, curB);
    if (!p) break;
    const nextA = curA / p;
    const nextB = curB / p;
    steps.push({
      stepIndex: steps.length + 1,
      divisor: p,
      inA: curA,
      inB: curB,
      outA: nextA,
      outB: nextB
    });
    commonDivisors.push(p);
    curA = nextA;
    curB = nextB;
  }

  const gcd = commonDivisors.length > 0 ? commonDivisors.reduce((acc, v) => acc * v, 1) : 1;
  const lcm = gcd * curA * curB;

  return {
    mode: "two-numbers",
    origA: a,
    origB: b,
    steps,
    commonDivisors,
    finalA: curA,
    finalB: curB,
    gcd,
    lcm,
    isAlreadyCoprime: commonDivisors.length === 0
  };
}

function computeSingleNumberLadder(num) {
  let val = Math.abs(Math.round(num));
  if (!val || val < 2) val = 24;

  const steps = [];
  const primeFactors = [];
  let cur = val;

  function findSmallestPrime(x) {
    if (x < 2) return null;
    if (x % 2 === 0) return 2;
    for (let p = 3; p * p <= x; p += 2) {
      if (x % p === 0) return p;
    }
    return x; // x is prime
  }

  let safety = 0;
  while (cur > 1 && safety++ < 12) {
    const p = findSmallestPrime(cur);
    const next = cur / p;
    steps.push({
      stepIndex: steps.length + 1,
      divisor: p,
      inVal: cur,
      outVal: next
    });
    primeFactors.push(p);
    if (isPrimeNumber(next) || next === 1) {
      break;
    }
    cur = next;
  }

  return {
    mode: "single-number",
    origVal: val,
    steps,
    primeFactors,
    finalVal: steps.length > 0 ? steps[steps.length - 1].outVal : val
  };
}

function renderFactorTreeVisual(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--factor-tree";
  card.dataset.visualType = "factor-tree";

  const cleaned = cleanPrompt(prompt);
  const parsed = cleanParseNumbers(cleaned);
  let n1 = 24;
  let n2 = 36;
  let isSingle = false;

  if (parsed.length >= 2) {
    // If prompt contains multiple numbers like "30 以内既是 2 的倍数又是 3 的倍数"
    if (cleaned.includes("既是") && cleaned.includes("又是") && parsed.length >= 3) {
      n1 = parsed[1];
      n2 = parsed[2];
    } else {
      n1 = parsed[0];
      n2 = parsed[1];
    }
  } else if (parsed.length === 1) {
    // Single number decomposition
    if (cleaned.includes("因数") && !cleaned.includes("公因数") && !cleaned.includes("公倍数")) {
      isSingle = true;
      n1 = parsed[0];
    } else {
      n1 = parsed[0];
      n2 = n1 === 24 ? 36 : 24;
    }
  }

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🔢 质因数阶梯短除法 (Short Division Ladder)</span>
    <span class="question-visual__subbadge">${isSingle ? `合数 ${n1} 的质因数结构分解` : `求 ${n1} 与 ${n2} 的最大公因数 (GCD) 与 最小公倍数 (LCM)`}</span>
  `;
  card.append(header);

  if (isSingle) {
    // 单数质因数分解阶梯
    const singleData = computeSingleNumberLadder(n1);
    const steps = singleData.steps;
    const rowCount = Math.max(steps.length, 1);
    const rowHeight = 32;
    const startY = 36;
    const totalHeight = Math.max(160, startY + rowCount * rowHeight + 35);
    const svgWidth = 520;
    const svg = createSvg(svgWidth, totalHeight, `0 0 ${svgWidth} ${totalHeight}`);

    // 背景卡片
    const bg = document.createElementNS(SVG_NS, "rect");
    bg.setAttribute("width", String(svgWidth));
    bg.setAttribute("height", String(totalHeight));
    bg.setAttribute("rx", "8");
    bg.setAttribute("fill", "#0b1329");
    svg.append(bg);

    // 阶梯绘制
    steps.forEach((st, idx) => {
      const curY = startY + idx * rowHeight;
      // 阶梯折线 L 形
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", `M 65 ${curY - 14} L 65 ${curY + 8} L 155 ${curY + 8}`);
      path.setAttribute("stroke", "#38bdf8");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("fill", "none");
      svg.append(path);

      // 左侧质因数除数
      const dText = document.createElementNS(SVG_NS, "text");
      dText.setAttribute("x", "52");
      dText.setAttribute("y", String(curY + 2));
      dText.setAttribute("font-size", "14");
      dText.setAttribute("font-weight", "bold");
      dText.setAttribute("fill", "#f59e0b");
      dText.setAttribute("text-anchor", "end");
      dText.textContent = String(st.divisor);
      svg.append(dText);

      // 被除数
      const inText = document.createElementNS(SVG_NS, "text");
      inText.setAttribute("x", "100");
      inText.setAttribute("y", String(curY + 2));
      inText.setAttribute("font-size", "14");
      inText.setAttribute("font-weight", "bold");
      inText.setAttribute("fill", "#f8fafc");
      inText.textContent = String(st.inVal);
      svg.append(inText);

      // 最后一步底部的最终质数商
      if (idx === steps.length - 1) {
        const outY = curY + rowHeight;
        const outText = document.createElementNS(SVG_NS, "text");
        outText.setAttribute("x", "100");
        outText.setAttribute("y", String(outY + 2));
        outText.setAttribute("font-size", "14");
        outText.setAttribute("font-weight", "bold");
        outText.setAttribute("fill", "#22c55e");
        outText.textContent = String(st.outVal);
        svg.append(outText);

        const badge = document.createElementNS(SVG_NS, "text");
        badge.setAttribute("x", "140");
        badge.setAttribute("y", String(outY + 2));
        badge.setAttribute("font-size", "11");
        badge.setAttribute("fill", "#10b981");
        badge.textContent = "✔ 质数底 (短除终止)";
        svg.append(badge);
      }
    });

    // 右侧原理说明
    const rx = 200;
    const factorFormula = singleData.primeFactors.join(" × ") + (singleData.finalVal > 1 && singleData.finalVal !== singleData.primeFactors[singleData.primeFactors.length - 1] ? ` × ${singleData.finalVal}` : "");
    const titleText = document.createElementNS(SVG_NS, "text");
    titleText.setAttribute("x", String(rx));
    titleText.setAttribute("y", "42");
    titleText.setAttribute("font-size", "13");
    titleText.setAttribute("font-weight", "bold");
    titleText.setAttribute("fill", "#38bdf8");
    titleText.textContent = `🎯 质因数分解：${n1} = ${factorFormula}`;
    svg.append(titleText);

    const desc1 = document.createElementNS(SVG_NS, "text");
    desc1.setAttribute("x", String(rx));
    desc1.setAttribute("y", "72");
    desc1.setAttribute("font-size", "12");
    desc1.setAttribute("fill", "#cbd5e1");
    desc1.textContent = "💡 数理本质：算术基本定理（唯一质因数分解定理）";
    svg.append(desc1);

    const desc2 = document.createElementNS(SVG_NS, "text");
    desc2.setAttribute("x", String(rx));
    desc2.setAttribute("y", "98");
    desc2.setAttribute("font-size", "11");
    desc2.setAttribute("fill", "#94a3b8");
    desc2.textContent = "合数由质数像积木一样乘积构成，短除法能逐层提取这些基础原子。";
    svg.append(desc2);

    card.append(svg);
    return card;
  }

  // 双数短除法求 GCD 与 LCM
  const ladder = computeShortDivisionLadder(n1, n2);
  const steps = ladder.steps;
  const rowCount = Math.max(steps.length, 1);
  const rowHeight = 32;
  const startY = 38;
  const totalHeight = Math.max(180, startY + (rowCount + 1) * rowHeight + 25);
  const svgWidth = 530;
  const svg = createSvg(svgWidth, totalHeight, `0 0 ${svgWidth} ${totalHeight}`);

  // 背景底板
  const bg = document.createElementNS(SVG_NS, "rect");
  bg.setAttribute("width", String(svgWidth));
  bg.setAttribute("height", String(totalHeight));
  bg.setAttribute("rx", "10");
  bg.setAttribute("fill", "#0c152a");
  svg.append(bg);

  if (steps.length === 0) {
    // 已经互质的情况 (例如 4 和 5)
    const curY = startY + 10;
    const textCoprime = document.createElementNS(SVG_NS, "text");
    textCoprime.setAttribute("x", "30");
    textCoprime.setAttribute("y", String(curY));
    textCoprime.setAttribute("font-size", "14");
    textCoprime.setAttribute("font-weight", "bold");
    textCoprime.setAttribute("fill", "#38bdf8");
    textCoprime.textContent = `${n1} 与 ${n2} 本身已经互质（公因数只有 1）`;
    svg.append(textCoprime);

    const textGCD = document.createElementNS(SVG_NS, "text");
    textGCD.setAttribute("x", "30");
    textGCD.setAttribute("y", String(curY + 32));
    textGCD.setAttribute("font-size", "13");
    textGCD.setAttribute("fill", "#f59e0b");
    textGCD.textContent = `最大公因数 (GCD)：1`;
    svg.append(textGCD);

    const textLCM = document.createElementNS(SVG_NS, "text");
    textLCM.setAttribute("x", "30");
    textLCM.setAttribute("y", String(curY + 60));
    textLCM.setAttribute("font-size", "13");
    textLCM.setAttribute("fill", "#22c55e");
    textLCM.textContent = `最小公倍数 (LCM)：${n1} × ${n2} = ${n1 * n2}`;
    svg.append(textLCM);

    const textTheory = document.createElementNS(SVG_NS, "text");
    textTheory.setAttribute("x", "30");
    textTheory.setAttribute("y", String(curY + 95));
    textTheory.setAttribute("font-size", "12");
    textTheory.setAttribute("fill", "#94a3b8");
    textTheory.textContent = `💡 原理：两数互质时无大于1的公质因数，最小公倍数直接为两数乘积，A × B = GCD × LCM 恒成立。`;
    svg.append(textTheory);

    card.append(svg);
    return card;
  }

  // 1. 绘制短除梯级 (Ladder steps)
  steps.forEach((st, idx) => {
    const curY = startY + idx * rowHeight;
    // 短除折线 L (bracket)
    const bracket = document.createElementNS(SVG_NS, "path");
    bracket.setAttribute("d", `M 52 ${curY - 14} L 52 ${curY + 8} L 175 ${curY + 8}`);
    bracket.setAttribute("stroke", "#38bdf8");
    bracket.setAttribute("stroke-width", "2");
    bracket.setAttribute("fill", "none");
    svg.append(bracket);

    // 左列除数 (公质因数)
    const dText = document.createElementNS(SVG_NS, "text");
    dText.setAttribute("x", "42");
    dText.setAttribute("y", String(curY + 2));
    dText.setAttribute("font-size", "14");
    dText.setAttribute("font-weight", "bold");
    dText.setAttribute("fill", "#f59e0b");
    dText.setAttribute("text-anchor", "end");
    dText.textContent = String(st.divisor);
    svg.append(dText);

    // 梯内两数
    const numText = document.createElementNS(SVG_NS, "text");
    numText.setAttribute("x", "75");
    numText.setAttribute("y", String(curY + 2));
    numText.setAttribute("font-size", "14");
    numText.setAttribute("font-weight", "bold");
    numText.setAttribute("fill", "#f8fafc");
    numText.textContent = `${String(st.inA).padEnd(6, " ")}${String(st.inB)}`;
    svg.append(numText);
  });

  // 2. 底部互质商 (Bottom coprime quotients)
  const bottomY = startY + steps.length * rowHeight;
  const btmText = document.createElementNS(SVG_NS, "text");
  btmText.setAttribute("x", "75");
  btmText.setAttribute("y", String(bottomY + 2));
  btmText.setAttribute("font-size", "14");
  btmText.setAttribute("font-weight", "bold");
  btmText.setAttribute("fill", "#22c55e");
  btmText.textContent = `${String(ladder.finalA).padEnd(6, " ")}${String(ladder.finalB)}`;
  svg.append(btmText);

  // 互质终止胶囊徽章
  const coprimePill = document.createElementNS(SVG_NS, "g");
  coprimePill.innerHTML = `
    <rect x="155" y="${bottomY - 12}" width="80" height="20" rx="10" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" stroke-width="1.2" />
    <text x="195" y="${bottomY + 2}" fill="#22c55e" font-size="10" font-weight="bold" text-anchor="middle">✔ 商互质·停止</text>
  `;
  svg.append(coprimePill);

  // 3. 左侧竖列高亮光轨 (GCD Track)
  const topDivY = startY - 12;
  const btmDivY = startY + (steps.length - 1) * rowHeight + 10;
  const gcdTrack = document.createElementNS(SVG_NS, "rect");
  gcdTrack.setAttribute("x", "18");
  gcdTrack.setAttribute("y", String(topDivY));
  gcdTrack.setAttribute("width", "32");
  gcdTrack.setAttribute("height", String(btmDivY - topDivY));
  gcdTrack.setAttribute("rx", "6");
  gcdTrack.setAttribute("fill", "rgba(56, 189, 248, 0.12)");
  gcdTrack.setAttribute("stroke", "#38bdf8");
  gcdTrack.setAttribute("stroke-width", "1.5");
  gcdTrack.setAttribute("stroke-dasharray", "3,2");
  svg.append(gcdTrack);

  // 4. “L”型回路光轨 (LCM L-loop)
  const lPath = document.createElementNS(SVG_NS, "path");
  lPath.setAttribute("d", `M 15 ${topDivY + 2} L 15 ${bottomY + 12} L 150 ${bottomY + 12}`);
  lPath.setAttribute("stroke", "#f59e0b");
  lPath.setAttribute("stroke-width", "2.5");
  lPath.setAttribute("stroke-linecap", "round");
  lPath.setAttribute("stroke-linejoin", "round");
  lPath.setAttribute("stroke-dasharray", "4,3");
  lPath.setAttribute("fill", "none");
  svg.append(lPath);

  // 5. 右侧数理本质与定理面板 (Deep Mathematical Principles)
  const rx = 248;
  const gcdFormulaStr = ladder.commonDivisors.join(" × ");
  const lcmFormulaStr = `${gcdFormulaStr} × ${ladder.finalA} × ${ladder.finalB}`;

  // GCD 卡片
  const gcdCard = document.createElementNS(SVG_NS, "g");
  gcdCard.innerHTML = `
    <rect x="${rx}" y="22" width="268" height="52" rx="6" fill="#131d36" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.2" />
    <text x="${rx + 10}" y="40" fill="#38bdf8" font-size="12" font-weight="bold">🔵 最大公因数 (GCD)：左竖列乘积</text>
    <text x="${rx + 10}" y="60" fill="#f8fafc" font-size="12" font-family="monospace">${gcdFormulaStr} = <tspan fill="#38bdf8" font-weight="bold">${ladder.gcd}</tspan></text>
    <text x="${rx + 145}" y="60" fill="#94a3b8" font-size="11">（两数共有质因数的交集）</text>
  `;
  svg.append(gcdCard);

  // LCM 卡片
  const lcmCard = document.createElementNS(SVG_NS, "g");
  lcmCard.innerHTML = `
    <rect x="${rx}" y="80" width="268" height="52" rx="6" fill="#131d36" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.2" />
    <text x="${rx + 10}" y="98" fill="#f59e0b" font-size="12" font-weight="bold">🟡 最小公倍数 (LCM)：“L”型回路整环连乘</text>
    <text x="${rx + 10}" y="118" fill="#f8fafc" font-size="11" font-family="monospace">${lcmFormulaStr} = <tspan fill="#22c55e" font-weight="bold">${ladder.lcm}</tspan></text>
    <text x="${rx + 175}" y="118" fill="#94a3b8" font-size="11">（质因数完整并集）</text>
  `;
  svg.append(lcmCard);

  // 核心定理验算卡片: A × B = GCD × LCM
  const theoremCard = document.createElementNS(SVG_NS, "g");
  const prodAB = n1 * n2;
  const prodGL = ladder.gcd * ladder.lcm;
  theoremCard.innerHTML = `
    <rect x="${rx}" y="138" width="268" height="34" rx="6" fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" stroke-width="1" />
    <text x="${rx + 10}" y="154" fill="#10b981" font-size="11" font-weight="bold">✨ 底层恒等定理验算：A × B = GCD × LCM</text>
    <text x="${rx + 10}" y="166" fill="#cbd5e1" font-size="10">${n1} × ${n2} = ${prodAB} 恒等于 ${ladder.gcd} × ${ladder.lcm} = ${prodGL}</text>
  `;
  svg.append(theoremCard);

  card.append(svg);

  // 底部极简思维要诀
  const legend = document.createElement("div");
  legend.className = "question-visual__legend factor-ladder-legend";
  legend.innerHTML = `
    <div class="factor-ladder-legend__summary">
      <strong>🔢 短除法通透口诀：</strong>
      <span>① 两数并排用公质因数连续除；</span>
      <span>② 商互质（公因数只有 1）即终止；</span>
      <span>③ <strong>半边（左竖列）相乘得最大公因数 (GCD)</strong>；</span>
      <span>④ <strong>一圈（“L”型整环）连乘得最小公倍数 (LCM)</strong>。</span>
    </div>
  `;
  card.append(legend);

  return card;
}

/**
 * 31. 逆向思维与还原回溯流程图 (Reverse Thinking & Restoration Flow)
 */

module.exports = {
  renderBarModel,
  renderEquation,
  renderQuickCalcBridge,
  renderParityDivisibilityCard,
  renderEquationBalanceVisual,
  renderFractionPercentVisual,
  renderFactorTreeVisual
};
