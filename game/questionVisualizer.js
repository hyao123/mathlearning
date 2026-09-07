// Question Representation Visualizer
// Parses and renders SVG diagrams, data tables, route maps, and bar models
// for math learning questions according to curriculum contracts.

const SVG_NS = "http://www.w3.org/2000/svg";

function createSvg(width, height, viewBox) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", viewBox || `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.classList.add("question-visual__svg");
  return svg;
}

function parseNumbers(text) {
  const matches = String(text).match(/\d+(\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Renders an interactive or visual Route Map / Grid Diagram
 */
function renderRouteMap(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--route-map";
  card.dataset.visualType = "route-map";

  // Case 1: Coordinate-based route (e.g. 第X列第Y行走到第A列第B行)
  const colRowPairs = [];
  const regex = /第\s*(\d+)\s*列\s*第\s*(\d+)\s*行/g;
  let match;
  while ((match = regex.exec(prompt)) !== null) {
    colRowPairs.push({ col: Number(match[1]), row: Number(match[2]) });
  }

  if (colRowPairs.length >= 2) {
    const start = colRowPairs[0];
    const end = colRowPairs[colRowPairs.length - 1];
    const waypoint = colRowPairs.length > 2 ? colRowPairs[1] : null;

    const minCol = Math.min(0, start.col, end.col, waypoint ? waypoint.col : 0);
    const maxCol = Math.max(start.col, end.col, waypoint ? waypoint.col : 0, 8) + 1;
    const minRow = Math.min(0, start.row, end.row, waypoint ? waypoint.row : 0);
    const maxRow = Math.max(start.row, end.row, waypoint ? waypoint.row : 0, 6) + 1;

    const cellWidth = 32;
    const cellHeight = 28;
    const padding = 34;
    const cols = maxCol - minCol + 1;
    const rows = maxRow - minRow + 1;
    const svgWidth = Math.min(480, cols * cellWidth + padding * 2);
    const svgHeight = rows * cellHeight + padding * 2;

    const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

    // Grid lines
    for (let c = 0; c < cols; c += 1) {
      const x = padding + c * cellWidth;
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", String(x));
      line.setAttribute("y1", String(padding));
      line.setAttribute("x2", String(x));
      line.setAttribute("y2", String(padding + (rows - 1) * cellHeight));
      line.setAttribute("stroke", "#c2b092");
      line.setAttribute("stroke-width", "1");
      svg.append(line);

      // Col label
      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("x", String(x));
      label.setAttribute("y", String(padding + (rows - 1) * cellHeight + 16));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "11");
      label.setAttribute("fill", "#665a48");
      label.textContent = String(minCol + c);
      svg.append(label);
    }

    for (let r = 0; r < rows; r += 1) {
      const y = padding + (rows - 1 - r) * cellHeight;
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", String(padding));
      line.setAttribute("y1", String(y));
      line.setAttribute("x2", String(padding + (cols - 1) * cellWidth));
      line.setAttribute("y2", String(y));
      line.setAttribute("stroke", "#c2b092");
      line.setAttribute("stroke-width", "1");
      svg.append(line);

      // Row label
      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("x", String(padding - 8));
      label.setAttribute("y", String(y + 4));
      label.setAttribute("text-anchor", "end");
      label.setAttribute("font-size", "11");
      label.setAttribute("fill", "#665a48");
      label.textContent = String(minRow + r);
      svg.append(label);
    }

    // Helper: col/row to SVG x/y
    const toX = (c) => padding + (c - minCol) * cellWidth;
    const toY = (r) => padding + (rows - 1 - (r - minRow)) * cellHeight;

    // Detour or blocked edge check
    if (prompt.includes("封闭") || prompt.includes("障碍")) {
      const blockedMatch = prompt.match(/第\s*(\d+)\s*列.*到.*第\s*(\d+)\s*列/);
      if (blockedMatch) {
        const c1 = Number(blockedMatch[1]);
        const c2 = Number(blockedMatch[2]);
        const bx1 = toX(c1);
        const bx2 = toX(c2);
        const by = toY(0);
        const redLine = document.createElementNS(SVG_NS, "line");
        redLine.setAttribute("x1", String(bx1));
        redLine.setAttribute("y1", String(by));
        redLine.setAttribute("x2", String(bx2));
        redLine.setAttribute("y2", String(by));
        redLine.setAttribute("stroke", "#ad4d49");
        redLine.setAttribute("stroke-width", "4");
        redLine.setAttribute("stroke-dasharray", "4,2");
        svg.append(redLine);

        const xMark = document.createElementNS(SVG_NS, "text");
        xMark.setAttribute("x", String((bx1 + bx2) / 2));
        xMark.setAttribute("y", String(by - 6));
        xMark.setAttribute("text-anchor", "middle");
        xMark.setAttribute("font-size", "12");
        xMark.setAttribute("font-weight", "bold");
        xMark.setAttribute("fill", "#ad4d49");
        xMark.textContent = "✕ 封闭";
        svg.append(xMark);
      }
    }

    // Path preview dashed line
    const pathD = waypoint
      ? `M ${toX(start.col)} ${toY(start.row)} L ${toX(waypoint.col)} ${toY(waypoint.row)} L ${toX(end.col)} ${toY(end.row)}`
      : `M ${toX(start.col)} ${toY(start.row)} L ${toX(end.col)} ${toY(start.row)} L ${toX(end.col)} ${toY(end.row)}`;
    const pathEl = document.createElementNS(SVG_NS, "path");
    pathEl.setAttribute("d", pathD);
    pathEl.setAttribute("fill", "none");
    pathEl.setAttribute("stroke", "#6d58a6");
    pathEl.setAttribute("stroke-width", "3");
    pathEl.setAttribute("stroke-dasharray", "5,4");
    svg.append(pathEl);

    // Nodes
    const nodes = [
      { pt: start, label: "起点", fill: "#258366", stroke: "#18243a" },
      ...(waypoint ? [{ pt: waypoint, label: "水站/必经", fill: "#3a7bd5", stroke: "#18243a" }] : []),
      { pt: end, label: "终点", fill: "#ad4d49", stroke: "#18243a" }
    ];

    nodes.forEach(({ pt, label, fill, stroke }) => {
      const cx = toX(pt.col);
      const cy = toY(pt.row);
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", String(cx));
      circle.setAttribute("cy", String(cy));
      circle.setAttribute("r", "7");
      circle.setAttribute("fill", fill);
      circle.setAttribute("stroke", stroke);
      circle.setAttribute("stroke-width", "2");
      svg.append(circle);

      const tag = document.createElementNS(SVG_NS, "text");
      tag.setAttribute("x", String(cx));
      tag.setAttribute("y", String(cy - 10));
      tag.setAttribute("text-anchor", "middle");
      tag.setAttribute("font-size", "11");
      tag.setAttribute("font-weight", "bold");
      tag.setAttribute("fill", "#18243a");
      tag.textContent = `${label} (${pt.col}, ${pt.row})`;
      svg.append(tag);
    });

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = waypoint
      ? `路线示意：从 (${start.col},${start.row}) 出发，必经 (${waypoint.col},${waypoint.row})，到达 (${end.col},${end.row})`
      : `路线示意：从 (${start.col},${start.row}) 直达 (${end.col},${end.row})（向右 / 向上）`;
    card.append(legend);
    return card;
  }

  // Case 2: Multi-plan route comparison (甲方案 vs 乙方案)
  if (prompt.includes("甲") && prompt.includes("乙")) {
    const table = document.createElement("table");
    table.className = "question-visual__table";
    table.innerHTML = `
      <thead>
        <tr><th>路线方案</th><th>分段距离与单价</th><th>计价规则</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>方案甲</strong></td>
          <td>${prompt.includes("甲：") ? prompt.split("甲：")[1].split("；")[0] : "分段路线 A"}</td>
          <td>各段费用累计</td>
        </tr>
        <tr>
          <td><strong>方案乙</strong></td>
          <td>${prompt.includes("乙：") ? prompt.split("乙：")[1].split("。")[0] : "分段路线 B"}</td>
          <td>各段费用累计</td>
        </tr>
      </tbody>
    `;
    card.append(table);
    return card;
  }

  return null;
}

/**
 * Renders a structured Olympiad Data Table
 */
function renderTable(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--table";
  card.dataset.visualType = "table";

  const table = document.createElement("table");
  table.className = "question-visual__table";

  // Match 1: Vehicle wheel tables (两轮车 / 四轮车 / 三轮车)
  if (prompt.includes("两轮") || prompt.includes("四轮") || prompt.includes("自行车") || prompt.includes("三轮车") || prompt.includes("硬币")) {
    const nums = parseNumbers(prompt);
    if (nums.length >= 4) {
      table.innerHTML = `
        <thead>
          <tr><th>分类项目</th><th>单件数量/面值</th><th>总量关系</th><th>已知总数</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>项目 A</strong></td>
            <td>${nums[0]} 单位</td>
            <td rowspan="2">两类总数共 <strong>${nums[2]}</strong> 件</td>
            <td rowspan="2">总合计量 <strong>${nums[3]}</strong></td>
          </tr>
          <tr>
            <td><strong>项目 B</strong></td>
            <td>${nums[1]} 单位</td>
          </tr>
        </tbody>
      `;
      card.append(table);
      return card;
    }
  }

  // Match 2: Material length table (彩带、木材)
  if (prompt.includes("彩带") || prompt.includes("米") || prompt.includes("厘米")) {
    const parts = prompt.match(/([^，。；：\s]+?\d+(\.\d+)?(米|厘米))/g);
    if (parts && parts.length >= 2) {
      const rows = parts.map((part) => `<tr><td><strong>材料段</strong></td><td>${part}</td></tr>`).join("");
      table.innerHTML = `
        <thead><tr><th>分段材料</th><th>测量规格</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td><strong>接合总长</strong></td><td>求接起来一共多少厘米</td></tr></tfoot>
      `;
      card.append(table);
      return card;
    }
  }

  // Match 3: Vehicle delivery capacity table (配送方案、车次)
  if (prompt.includes("配送表格") || prompt.includes("车辆方案") || (prompt.includes("甲车") && prompt.includes("乙车"))) {
    table.innerHTML = `
      <thead>
        <tr><th>车辆方案</th><th>单趟容量</th><th>单趟耗费</th><th>目标运量</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>甲车方案</strong></td><td>9 箱 / 趟</td><td>4 点 / 趟</td><td rowspan="2">共需运送 45 箱物资</td></tr>
        <tr><td><strong>乙车方案</strong></td><td>15 箱 / 趟</td><td>7 点 / 趟</td></tr>
      </tbody>
      <tfoot>
        <tr><td colspan="4">目标：比较两方案完成 45 箱所需最少资源点数</td></tr>
      </tfoot>
    `;
    card.append(table);
    return card;
  }

  // Match 4: Packing or scheduling table (装箱、排班、平均成绩)
  if (prompt.includes("装箱") || prompt.includes("排班") || prompt.includes("平均") || prompt.includes("补给")) {
    const nums = parseNumbers(prompt);
    table.innerHTML = `
      <thead>
        <tr><th>核心条件</th><th>已知参数</th><th>优化约束</th></tr>
      </thead>
      <tbody>
        <tr><td>数据总量</td><td>${nums[0] || "--"}</td><td rowspan="2">严格满足装箱/排班要求，计算极值或综合最优解</td></tr>
        <tr><td>单元容量/基准</td><td>${nums[1] || "--"}</td></tr>
      </tbody>
    `;
    card.append(table);
    return card;
  }

  // Generic fallback table for table representation
  const sentences = prompt.split(/[，；。]/).filter(Boolean);
  if (sentences.length >= 2) {
    const rows = sentences.slice(0, 4).map((s, idx) => `<tr><td>条件 ${idx + 1}</td><td>${s}</td></tr>`).join("");
    table.innerHTML = `
      <thead><tr><th>已知信息</th><th>题面条件</th></tr></thead>
      <tbody>${rows}</tbody>
    `;
    card.append(table);
    return card;
  }

  return null;
}

/**
 * Renders a Bar Model / Segment comparison diagram
 */
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
function renderDiagram(question) {
  const prompt = question.prompt || "";

  // If prompt has route coordinates, defer to route map
  if (prompt.includes("列") && prompt.includes("行")) {
    return renderRouteMap(question);
  }

  // Rectangle perimeter detour
  if (prompt.includes("长方形") && (prompt.includes("长") || prompt.includes("宽"))) {
    const card = document.createElement("div");
    card.className = "question-visual question-visual--diagram";
    card.dataset.visualType = "diagram";

    const nums = parseNumbers(prompt);
    const len = nums[0] || 8;
    const wid = nums[1] || 5;

    const svg = createSvg(380, 160, "0 0 380 160");
    const rx = 50;
    const ry = 30;
    const rw = 220;
    const rh = 90;

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", String(rx));
    rect.setAttribute("y", String(ry));
    rect.setAttribute("width", String(rw));
    rect.setAttribute("height", String(rh));
    rect.setAttribute("fill", "#fffaf0");
    rect.setAttribute("stroke", "#18243a");
    rect.setAttribute("stroke-width", "2");
    svg.append(rect);

    // Diagonal corners
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", `M ${rx} ${ry + rh} L ${rx + rw} ${ry + rh} L ${rx + rw} ${ry}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#6d58a6");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("stroke-dasharray", "4,3");
    svg.append(path);

    // Dimension labels
    const lenLabel = document.createElementNS(SVG_NS, "text");
    lenLabel.setAttribute("x", String(rx + rw / 2));
    lenLabel.setAttribute("y", String(ry + rh + 20));
    lenLabel.setAttribute("text-anchor", "middle");
    lenLabel.setAttribute("font-weight", "bold");
    lenLabel.setAttribute("fill", "#18243a");
    lenLabel.textContent = `长 = ${len} 格`;
    svg.append(lenLabel);

    const widLabel = document.createElementNS(SVG_NS, "text");
    widLabel.setAttribute("x", String(rx + rw + 28));
    widLabel.setAttribute("y", String(ry + rh / 2 + 4));
    widLabel.setAttribute("text-anchor", "middle");
    widLabel.setAttribute("font-weight", "bold");
    widLabel.setAttribute("fill", "#18243a");
    widLabel.textContent = `宽 = ${wid} 格`;
    svg.append(widLabel);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = `几何对角沿边捷径：长 (${len}) ＋ 宽 (${wid}) ＝ 半周长 (${len + wid})`;
    card.append(legend);
    return card;
  }

  // Symmetry axis
  if (prompt.includes("对称线") || prompt.includes("镜像")) {
    const card = document.createElement("div");
    card.className = "question-visual question-visual--diagram";
    card.dataset.visualType = "diagram";

    const svg = createSvg(380, 110, "0 0 380 110");
    const axisX = 180;

    const axis = document.createElementNS(SVG_NS, "line");
    axis.setAttribute("x1", String(axisX));
    axis.setAttribute("y1", "15");
    axis.setAttribute("x2", String(axisX));
    axis.setAttribute("y2", "95");
    axis.setAttribute("stroke", "#ad4d49");
    axis.setAttribute("stroke-width", "2");
    axis.setAttribute("stroke-dasharray", "5,3");
    svg.append(axis);

    const axisLabel = document.createElementNS(SVG_NS, "text");
    axisLabel.setAttribute("x", String(axisX));
    axisLabel.setAttribute("y", "12");
    axisLabel.setAttribute("text-anchor", "middle");
    axisLabel.setAttribute("font-size", "11");
    axisLabel.setAttribute("fill", "#ad4d49");
    axisLabel.textContent = "对称轴 (第5列)";
    svg.append(axisLabel);

    // Left point (Col 2)
    const ptA = document.createElementNS(SVG_NS, "circle");
    ptA.setAttribute("cx", "70");
    ptA.setAttribute("cy", "55");
    ptA.setAttribute("r", "6");
    ptA.setAttribute("fill", "#258366");
    svg.append(ptA);

    const labelA = document.createElementNS(SVG_NS, "text");
    labelA.setAttribute("x", "70");
    labelA.setAttribute("y", "78");
    labelA.setAttribute("text-anchor", "middle");
    labelA.setAttribute("font-size", "11");
    labelA.textContent = "甲点 (第2列)";
    svg.append(labelA);

    // Mirror point (Col 8)
    const ptMirror = document.createElementNS(SVG_NS, "circle");
    ptMirror.setAttribute("cx", "290");
    ptMirror.setAttribute("cy", "55");
    ptMirror.setAttribute("r", "6");
    ptMirror.setAttribute("fill", "#6d58a6");
    svg.append(ptMirror);

    const labelMirror = document.createElementNS(SVG_NS, "text");
    labelMirror.setAttribute("x", "290");
    labelMirror.setAttribute("y", "78");
    labelMirror.setAttribute("text-anchor", "middle");
    labelMirror.setAttribute("font-size", "11");
    labelMirror.textContent = "镜像点 (第8列)";
    svg.append(labelMirror);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "轴对称模型：甲点距离对称线 3 格，镜像点在另一侧等距离位置。";
    card.append(legend);
    return card;
  }

  return null;
}

/**
 * Main entrance: inspects question representation and returns visual container or null
 */
function createQuestionVisual(question) {
  if (!question || typeof question !== "object") return null;
  const rep = question.representation;

  if (rep === "route-map") {
    return renderRouteMap(question) || renderTable(question);
  }
  if (rep === "table") {
    return renderTable(question);
  }
  if (rep === "bar-model") {
    return renderBarModel(question);
  }
  if (rep === "equation") {
    return renderEquation(question);
  }
  if (rep === "diagram") {
    return renderDiagram(question) || renderRouteMap(question);
  }

  // If prompt explicitly contains visual keywords even if rep is default
  const prompt = question.prompt || "";
  if (prompt.includes("第") && prompt.includes("列") && prompt.includes("行")) {
    return renderRouteMap(question);
  }
  if (prompt.includes("表格") || prompt.includes("下表")) {
    return renderTable(question);
  }
  if (prompt.includes("条形图") || (prompt.includes("比") && prompt.includes("多") && prompt.includes("共"))) {
    return renderBarModel(question);
  }

  return null;
}

const QuestionVisualizer = {
  createQuestionVisual,
  renderRouteMap,
  renderTable,
  renderBarModel,
  renderEquation,
  renderDiagram
};
module.exports = QuestionVisualizer;
