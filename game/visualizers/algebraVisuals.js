const { SVG_NS, createSvg, parseNumbers, safeAddListener, createControlBtn, safeClassAdd, safeClassRemove } = require('./visualizerCore.js');

function renderBarModel(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--bar-model";
  card.dataset.visualType = "bar-model";

  // Large box vs Small box (大箱 / 小箱和差倍)
  const isBoxes = prompt.includes("大箱") && prompt.includes("小箱");
  const nums = parseNumbers(prompt);
  const diff = nums.length >= 2 ? nums[0] : 3;
  const total = nums.length >= 2 ? nums[1] : 17;

  const svg = createSvg(420, 150, "0 0 420 150");

  // Bar 1: Small box
  // Base bar
  const baseWidth = 140;
  const barHeight = 24;

  // Small box label
  const text1 = document.createElementNS(SVG_NS, "text");
  text1.setAttribute("x", "20");
  text1.setAttribute("y", "42");
  text1.setAttribute("font-size", "13");
  text1.setAttribute("font-weight", "bold");
  text1.setAttribute("fill", "#18243a");
  text1.textContent = isBoxes ? "小箱数量：" : "较小数：";
  svg.append(text1);

  const rect1 = document.createElementNS(SVG_NS, "rect");
  rect1.setAttribute("x", "95");
  rect1.setAttribute("y", "24");
  rect1.setAttribute("width", String(baseWidth));
  rect1.setAttribute("height", String(barHeight));
  rect1.setAttribute("fill", "#6d58a6");
  rect1.setAttribute("rx", "3");
  svg.append(rect1);

  // Large box label
  const text2 = document.createElementNS(SVG_NS, "text");
  text2.setAttribute("x", "20");
  text2.setAttribute("y", "86");
  text2.setAttribute("font-size", "13");
  text2.setAttribute("font-weight", "bold");
  text2.setAttribute("fill", "#18243a");
  text2.textContent = isBoxes ? "大箱数量：" : "较大数：";
  svg.append(text2);

  // Large box base bar
  const rect2Base = document.createElementNS(SVG_NS, "rect");
  rect2Base.setAttribute("x", "95");
  rect2Base.setAttribute("y", "68");
  rect2Base.setAttribute("width", String(baseWidth));
  rect2Base.setAttribute("height", String(barHeight));
  rect2Base.setAttribute("fill", "#6d58a6");
  rect2Base.setAttribute("rx", "3");
  svg.append(rect2Base);

  // Difference part
  const diffWidth = 55;
  const rect2Diff = document.createElementNS(SVG_NS, "rect");
  rect2Diff.setAttribute("x", String(95 + baseWidth));
  rect2Diff.setAttribute("y", "68");
  rect2Diff.setAttribute("width", String(diffWidth));
  rect2Diff.setAttribute("height", String(barHeight));
  rect2Diff.setAttribute("fill", "#e9b949");
  rect2Diff.setAttribute("stroke", "#18243a");
  rect2Diff.setAttribute("stroke-width", "1");
  rect2Diff.setAttribute("stroke-dasharray", "3,2");
  rect2Diff.setAttribute("rx", "3");
  svg.append(rect2Diff);

  // Difference tag
  const diffTag = document.createElementNS(SVG_NS, "text");
  diffTag.setAttribute("x", String(95 + baseWidth + diffWidth / 2));
  diffTag.setAttribute("y", "84");
  diffTag.setAttribute("text-anchor", "middle");
  diffTag.setAttribute("font-size", "11");
  diffTag.setAttribute("font-weight", "bold");
  diffTag.setAttribute("fill", "#18243a");
  diffTag.textContent = `+${diff}`;
  svg.append(diffTag);

  // Total curly bracket line
  const totalLine = document.createElementNS(SVG_NS, "path");
  const endX = 95 + baseWidth + diffWidth + 15;
  totalLine.setAttribute("d", `M ${endX} 24 L ${endX + 10} 24 L ${endX + 10} 58 L ${endX + 18} 58 L ${endX + 10} 58 L ${endX + 10} 92 L ${endX} 92`);
  totalLine.setAttribute("fill", "none");
  totalLine.setAttribute("stroke", "#258366");
  totalLine.setAttribute("stroke-width", "2");
  svg.append(totalLine);

  const totalTag = document.createElementNS(SVG_NS, "text");
  totalTag.setAttribute("x", String(endX + 24));
  totalTag.setAttribute("y", "62");
  totalTag.setAttribute("font-size", "13");
  totalTag.setAttribute("font-weight", "bold");
  totalTag.setAttribute("fill", "#258366");
  totalTag.textContent = `合计 ${total} 个`;
  svg.append(totalTag);

  card.append(svg);
  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = `线段图模型：两者相差 ${diff}，合计 ${total}。先移去多出的差量，即可求出基准量。`;
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

  const nums = parseNumbers(prompt);
  const xCount = prompt.includes("2 个未知数") || prompt.includes("2个未知数") || prompt.includes("2x") ? 2 : 1;
  const xWeight = nums[0] || 5;
  const rightTotal = nums[1] || (xWeight * 2 + 10);
  const targetX = Math.max(1, Math.round((rightTotal - xWeight) / xCount));
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

  const nums = parseNumbers(prompt);
  const isPercent = prompt.includes("%") || prompt.includes("折") || prompt.includes("成");
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
 * 27. 溶液浓度与溶质配比模型 (Concentration Model)
 */

function renderFactorTreeVisual(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--factor-tree";
  card.dataset.visualType = "factor-tree";

  const nums = parseNumbers(prompt);
  const n1 = nums[0] || 24;
  const n2 = nums[1] || 36;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🔢 质因数分解与因倍数短除法</span>
    <span class="question-visual__subbadge">最大公因数与最小公倍数求法</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const l1 = document.createElementNS(SVG_NS, "path");
  l1.setAttribute("d", "M 100 40 L 100 65 L 220 65");
  l1.setAttribute("stroke", "#38bdf8"); l1.setAttribute("stroke-width", "2"); l1.setAttribute("fill", "none");
  svg.append(l1);

  const dNum = document.createElementNS(SVG_NS, "text");
  dNum.setAttribute("x", "85"); dNum.setAttribute("y", "58");
  dNum.setAttribute("font-size", "14"); dNum.setAttribute("font-weight", "bold");
  dNum.setAttribute("fill", "#f59e0b"); dNum.textContent = "2";
  svg.append(dNum);

  const topNums = document.createElementNS(SVG_NS, "text");
  topNums.setAttribute("x", "120"); topNums.setAttribute("y", "58");
  topNums.setAttribute("font-size", "14"); topNums.setAttribute("font-weight", "bold");
  topNums.setAttribute("fill", "#f8fafc"); topNums.textContent = `${n1}    ${n2}`;
  svg.append(topNums);

  const btmNums = document.createElementNS(SVG_NS, "text");
  btmNums.setAttribute("x", "120"); btmNums.setAttribute("y", "88");
  btmNums.setAttribute("font-size", "14"); btmNums.setAttribute("font-weight", "bold");
  btmNums.setAttribute("fill", "#94a3b8"); btmNums.textContent = `${Math.round(n1/2)}    ${Math.round(n2/2)}`;
  svg.append(btmNums);

  const rx = 250;
  const gcdText = document.createElementNS(SVG_NS, "text");
  gcdText.setAttribute("x", String(rx)); gcdText.setAttribute("y", "55");
  gcdText.setAttribute("font-size", "12"); gcdText.setAttribute("font-weight", "bold");
  gcdText.setAttribute("fill", "#38bdf8"); gcdText.textContent = "最大公因数 (GCD): 左侧公质因数之积";
  svg.append(gcdText);

  const lcmText = document.createElementNS(SVG_NS, "text");
  lcmText.setAttribute("x", String(rx)); lcmText.setAttribute("y", "85");
  lcmText.setAttribute("font-size", "12"); lcmText.setAttribute("font-weight", "bold");
  lcmText.setAttribute("fill", "#22c55e"); lcmText.textContent = "最小公倍数 (LCM): 左侧因数 × 底部商连乘";
  svg.append(lcmText);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "🔢 短除法口诀：两个数同时除以公有的质因数，除到互质为止。半边乘起来是最大公因数，一圈乘起来是最小公倍数。";
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
