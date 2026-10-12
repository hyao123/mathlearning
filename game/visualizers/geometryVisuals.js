const { SVG_NS, createSvg, parseNumbers, cleanPrompt, cleanParseNumbers, extractLabeledParams, extractSolutionContext, safeAddListener, createControlBtn, safeClassAdd, safeClassRemove } = require('./visualizerCore.js');

function renderRouteMap(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--route-map";
  card.dataset.visualType = "route-map";

  // Case 1: Coordinate-based route (e.g. 第X列第Y行走到第A列第B行 or (x,y))
  const colRowPairs = [];
  const regex = /第\s*(\d+)\s*列\s*第\s*(\d+)\s*行/g;
  let match;
  while ((match = regex.exec(prompt)) !== null) {
    colRowPairs.push({ col: Number(match[1]), row: Number(match[2]) });
  }

  if (colRowPairs.length === 0) {
    const coordRegex = /(?:[A-Za-z]\s*)?\((\d+)\s*,\s*(\d+)\)/g;
    let cm;
    while ((cm = coordRegex.exec(prompt)) !== null) {
      colRowPairs.push({ col: Number(cm[1]), row: Number(cm[2]) });
    }
    if (colRowPairs.length === 1) {
      const p0 = colRowPairs[0];
      const east = prompt.match(/向东(?:移动)?\s*(\d+)\s*格/);
      const west = prompt.match(/向西(?:移动)?\s*(\d+)\s*格/);
      const north = prompt.match(/向北(?:移动)?\s*(\d+)\s*格/);
      const south = prompt.match(/向南(?:移动)?\s*(\d+)\s*格/);
      let newCol = p0.col;
      let newRow = p0.row;
      if (east) newCol += Number(east[1]);
      if (west) newCol = Math.max(0, newCol - Number(west[1]));
      if (north) newRow += Number(north[1]);
      if (south) newRow = Math.max(0, newRow - Number(south[1]));
      colRowPairs.push({ col: newCol, row: newRow });
    } else if (colRowPairs.length === 0 && prompt.includes("P(x,") && prompt.includes("Q(")) {
      const qMatch = prompt.match(/Q\((\d+)\s*,\s*(\d+)\)/);
      if (qMatch) {
        const qCol = Number(qMatch[1]);
        const qRow = Number(qMatch[2]);
        const distMatch = prompt.match(/相距\s*(\d+)\s*格/);
        const dist = distMatch ? Number(distMatch[1]) : 5;
        colRowPairs.push({ col: Math.max(0, qCol - dist), row: qRow });
        colRowPairs.push({ col: qCol, row: qRow });
      }
    }
  }

  if (colRowPairs.length === 0) {
    const gridMatch = prompt.match(/(\d+)\s*[×x*]\s*(\d+)/);
    if (gridMatch) {
      const w = Number(gridMatch[1]);
      const h = Number(gridMatch[2]);
      if (prompt.includes("左上角") && prompt.includes("右下角")) {
        colRowPairs.push({ col: 0, row: h });
        colRowPairs.push({ col: w, row: 0 });
      } else {
        colRowPairs.push({ col: 0, row: 0 });
        colRowPairs.push({ col: w, row: h });
      }
    } else if (prompt.includes("最左边走到最右边") || prompt.includes("封闭")) {
      const nums = parseNumbers(prompt);
      const totalLen = nums.length > 0 ? nums[0] : 6;
      colRowPairs.push({ col: 0, row: 0 });
      colRowPairs.push({ col: 2, row: 0 });
      colRowPairs.push({ col: 3, row: 1 });
      colRowPairs.push({ col: Math.min(totalLen, 10), row: 0 });
    } else if (prompt.includes("起点") || prompt.includes("中转") || prompt.includes("车站") || prompt.includes("固定点") || prompt.includes("最少走多少格") || prompt.includes("最短走多少格") || ["coordinates-routes", "shortest-path"].includes(question.moduleId)) {
      const nums = parseNumbers(prompt);
      let curr = 0;
      colRowPairs.push({ col: 0, row: 0 });
      for (const n of nums.slice(0, 3)) {
        if (n > 0 && n <= 20) {
          curr += n;
          colRowPairs.push({ col: curr, row: 0 });
        }
      }
      if (colRowPairs.length === 1) {
        colRowPairs.push({ col: 8, row: 0 });
      }
    }
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
 * 1. 数列与找规律：数字光能胶囊车道 (Sequence Capsule Track)
 */

function renderGeometryCounting(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--geometry-counting";
  card.dataset.visualType = "geometry-counting";

  const nums = parseNumbers(prompt);

  if (prompt.includes("线段")) {
    const isReverse = prompt.includes("36 条线段") || prompt.includes("36条线段");
    const ptCount = isReverse ? 9 : (nums.find(n => n >= 3 && n <= 10) || 5);
    const totalSegs = ptCount * (ptCount - 1) / 2;

    const header = document.createElement("div");
    header.className = "question-visual__header";
    header.innerHTML = `
      <span class="question-visual__badge">📐 直线点对与线段组合计数</span>
      <span class="question-visual__subbadge">任意 2 个端点确定 1 条线段</span>
    `;
    card.append(header);

    const svgWidth = 460;
    const svgHeight = 155;
    const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

    const lineY = 110;
    const pStartX = 45;
    const pEndX = 415;
    const step = (pEndX - pStartX) / (ptCount - 1);

    const baseLine = document.createElementNS(SVG_NS, "line");
    baseLine.setAttribute("x1", "30");
    baseLine.setAttribute("y1", String(lineY));
    baseLine.setAttribute("x2", "430");
    baseLine.setAttribute("y2", String(lineY));
    baseLine.setAttribute("stroke", "#64748b");
    baseLine.setAttribute("stroke-width", "3");
    svg.append(baseLine);

    const arcColors = ["#38bdf8", "#ec4899", "#10b981", "#f59e0b", "#a855f7", "#06b6d4"];
    for (let span = 1; span < Math.min(ptCount, 4); span++) {
      const color = arcColors[(span - 1) % arcColors.length];
      const arcH = 18 + span * 14;
      for (let i = 0; i < ptCount - span; i++) {
        const x1 = pStartX + i * step;
        const x2 = pStartX + (i + span) * step;
        const mx = (x1 + x2) / 2;
        const my = lineY - arcH;
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", `M ${x1} ${lineY} Q ${mx} ${my} ${x2} ${lineY}`);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("opacity", span === 1 ? "0.85" : "0.65");
        svg.append(path);
      }
    }

    for (let i = 0; i < ptCount; i++) {
      const px = pStartX + i * step;
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("cx", String(px));
      dot.setAttribute("cy", String(lineY));
      dot.setAttribute("r", "5");
      dot.setAttribute("fill", "#38bdf8");
      dot.setAttribute("stroke", "#f8fafc");
      dot.setAttribute("stroke-width", "2");
      svg.append(dot);

      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("x", String(px));
      label.setAttribute("y", String(lineY + 18));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "11");
      label.setAttribute("font-weight", "bold");
      label.setAttribute("fill", "#94a3b8");
      label.textContent = String.fromCharCode(65 + i);
      svg.append(label);
    }

    const fBox = document.createElementNS(SVG_NS, "text");
    fBox.setAttribute("x", "230");
    fBox.setAttribute("y", "26");
    fBox.setAttribute("text-anchor", "middle");
    fBox.setAttribute("font-size", "12");
    fBox.setAttribute("font-weight", "bold");
    fBox.setAttribute("fill", "#22c55e");
    if (isReverse) {
      fBox.textContent = isRevealed ? `逆推: n × (n - 1) ÷ 2 ＝ 36 ➔ n(n-1) ＝ 72 ➔ n ＝ 9 个点` : "两两连线成线段公式: n × (n - 1) ÷ 2 ＝ 36 ➔ n ＝ ?";
    } else {
      fBox.textContent = isRevealed ? `线段数 ＝ ${ptCount} × (${ptCount} - 1) ÷ 2 ＝ ${totalSegs} 条` : `线段数 ＝ ${ptCount} × (${ptCount} - 1) ÷ 2 ＝ ? 条`;
    }
    svg.append(fBox);

    card.append(svg);

    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = isReverse
      ? `📐 逆推思维：两两连线成线段公式为 n(n-1)/2 ＝ 36，由于 9×8÷2＝36，所以直线上共有 9 个点。`
      : `📐 计数公式：${ptCount} 个点中任选 2 个点组成一条线段，按端点组合计数为 ${ptCount}×(${ptCount}-1)÷2 ＝ ${totalSegs} 条。`;
    card.append(legend);

    return card;
  }

  if (prompt.includes("角")) {
    const rayCount = nums.find(n => n >= 3 && n <= 8) || 4;
    const totalAngles = rayCount * (rayCount - 1) / 2;

    const header = document.createElement("div");
    header.className = "question-visual__header";
    header.innerHTML = `
      <span class="question-visual__badge">📐 射线与成角组合计数</span>
      <span class="question-visual__subbadge">两两射线夹成一个角</span>
    `;
    card.append(header);

    const svgWidth = 460;
    const svgHeight = 155;
    const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

    const ox = 230;
    const oy = 135;

    const angles = [-60, -20, 20, 60];
    angles.forEach((deg, idx) => {
      const rad = (deg - 90) * Math.PI / 180;
      const rx = ox + 110 * Math.cos(rad);
      const ry = oy + 110 * Math.sin(rad);

      const ray = document.createElementNS(SVG_NS, "line");
      ray.setAttribute("x1", String(ox));
      ray.setAttribute("y1", String(oy));
      ray.setAttribute("x2", String(rx));
      ray.setAttribute("y2", String(ry));
      ray.setAttribute("stroke", "#38bdf8");
      ray.setAttribute("stroke-width", "2");
      svg.append(ray);

      const rLabel = document.createElementNS(SVG_NS, "text");
      rLabel.setAttribute("x", String(rx + (deg < 0 ? -12 : 12)));
      rLabel.setAttribute("y", String(ry - 4));
      rLabel.setAttribute("font-size", "11");
      rLabel.setAttribute("font-weight", "bold");
      rLabel.setAttribute("fill", "#60a5fa");
      rLabel.textContent = `射线${idx + 1}`;
      svg.append(rLabel);
    });

    const vDot = document.createElementNS(SVG_NS, "circle");
    vDot.setAttribute("cx", String(ox));
    vDot.setAttribute("cy", String(oy));
    vDot.setAttribute("r", "5");
    vDot.setAttribute("fill", "#f59e0b");
    svg.append(vDot);

    const fText = document.createElementNS(SVG_NS, "text");
    fText.setAttribute("x", "230");
    fText.setAttribute("y", "26");
    fText.setAttribute("text-anchor", "middle");
    fText.setAttribute("font-size", "12");
    fText.setAttribute("font-weight", "bold");
    fText.setAttribute("fill", "#22c55e");
    fText.textContent = isRevealed ? `角的总数 ＝ ${rayCount} × (${rayCount} - 1) ÷ 2 ＝ ${totalAngles} 个角` : `角的总数 ＝ ${rayCount} × (${rayCount} - 1) ÷ 2 ＝ ? 个角`;
    svg.append(fText);

    card.append(svg);

    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = `📐 规律：从同一点射出的 ${rayCount} 条射线，任意选两条夹成一个角，共有 ${rayCount}×(${rayCount}-1)÷2 ＝ ${totalAngles} 个角。`;
    card.append(legend);

    return card;
  }

  if (prompt.includes("三角形")) {
    const isDiagonalRect = (prompt.includes("对角线") || prompt.includes("交于一点")) && (prompt.includes("长方形") || prompt.includes("正方形"));
    const segMatch = prompt.match(/分成\s*(\d+)\s*段/);
    const lineMatch = prompt.match(/(\d+)\s*条分割线/);
    const baseSegs = segMatch ? Number(segMatch[1]) : (lineMatch ? Number(lineMatch[1]) + 1 : (nums.find((n) => n >= 2 && n <= 8) || 5));
    const totalTris = Math.round(baseSegs * (baseSegs + 1) / 2);

    const header = document.createElement("div");
    header.className = "question-visual__header";
    header.innerHTML = `
      <span class="question-visual__badge">📐 三角形图形有序计数</span>
      <span class="question-visual__subbadge">${isDiagonalRect ? "对角线交汇区域分解" : "底边线段与顶点组合对应"}</span>
    `;
    card.append(header);

    const svgWidth = 460;
    const svgHeight = 155;
    const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

    if (isDiagonalRect) {
      const rx = 55, ry = 25, rw = 120, rh = 90;
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", String(rx)); rect.setAttribute("y", String(ry));
      rect.setAttribute("width", String(rw)); rect.setAttribute("height", String(rh));
      rect.setAttribute("fill", "rgba(56, 189, 248, 0.1)");
      rect.setAttribute("stroke", "#38bdf8"); rect.setAttribute("stroke-width", "2");
      svg.append(rect);

      const d1 = document.createElementNS(SVG_NS, "line");
      d1.setAttribute("x1", String(rx)); d1.setAttribute("y1", String(ry));
      d1.setAttribute("x2", String(rx + rw)); d1.setAttribute("y2", String(ry + rh));
      d1.setAttribute("stroke", "#f59e0b"); d1.setAttribute("stroke-width", "2");
      svg.append(d1);

      const d2 = document.createElementNS(SVG_NS, "line");
      d2.setAttribute("x1", String(rx + rw)); d2.setAttribute("y1", String(ry));
      d2.setAttribute("x2", String(rx)); d2.setAttribute("y2", String(ry + rh));
      d2.setAttribute("stroke", "#f59e0b"); d2.setAttribute("stroke-width", "2");
      svg.append(d2);

      const tx = 210;
      const l1 = document.createElementNS(SVG_NS, "text");
      l1.setAttribute("x", String(tx)); l1.setAttribute("y", "48");
      l1.setAttribute("font-size", "12"); l1.setAttribute("font-weight", "bold");
      l1.setAttribute("fill", "#38bdf8"); l1.textContent = "▪ 基本三角形区域 (单个): 4 个";
      svg.append(l1);

      const l2 = document.createElementNS(SVG_NS, "text");
      l2.setAttribute("x", String(tx)); l2.setAttribute("y", "76");
      l2.setAttribute("font-size", "12"); l2.setAttribute("font-weight", "bold");
      l2.setAttribute("fill", "#a78bfa"); l2.textContent = "▪ 组合三角形区域 (由2个拼接): 4 个";
      svg.append(l2);

      const l3 = document.createElementNS(SVG_NS, "text");
      l3.setAttribute("x", String(tx)); l3.setAttribute("y", "106");
      l3.setAttribute("font-size", "13"); l3.setAttribute("font-weight", "bold");
      l3.setAttribute("fill", isRevealed ? "#22c55e" : "#f59e0b");
      l3.textContent = isRevealed ? "▪ 三角形总数 ＝ 4 ＋ 4 ＝ 8 个" : "▪ 三角形总数 ＝ 4 ＋ 4 ＝ ? 个";
      svg.append(l3);
    } else {
      const apexX = 110, apexY = 25;
      const baseY = 120;
      const bStartX = 25, bEndX = 195;
      const step = (bEndX - bStartX) / baseSegs;

      for (let i = 0; i <= baseSegs; i++) {
        const bx = bStartX + i * step;
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", String(apexX)); line.setAttribute("y1", String(apexY));
        line.setAttribute("x2", String(bx)); line.setAttribute("y2", String(baseY));
        line.setAttribute("stroke", i === 0 || i === baseSegs ? "#38bdf8" : "#94a3b8");
        line.setAttribute("stroke-width", i === 0 || i === baseSegs ? "2.5" : "1.5");
        svg.append(line);
      }

      const bLine = document.createElementNS(SVG_NS, "line");
      bLine.setAttribute("x1", String(bStartX)); bLine.setAttribute("y1", String(baseY));
      bLine.setAttribute("x2", String(bEndX)); bLine.setAttribute("y2", String(baseY));
      bLine.setAttribute("stroke", "#38bdf8"); bLine.setAttribute("stroke-width", "3");
      svg.append(bLine);

      const tx = 220;
      const l1 = document.createElementNS(SVG_NS, "text");
      l1.setAttribute("x", String(tx)); l1.setAttribute("y", "45");
      l1.setAttribute("font-size", "12"); l1.setAttribute("font-weight", "bold");
      l1.setAttribute("fill", "#38bdf8"); l1.textContent = `▪ 底边基本线段数: ${baseSegs} 段`;
      svg.append(l1);

      const l2 = document.createElementNS(SVG_NS, "text");
      l2.setAttribute("x", String(tx)); l2.setAttribute("y", "72");
      l2.setAttribute("font-size", "12"); l2.setAttribute("font-weight", "bold");
      l2.setAttribute("fill", "#a78bfa"); l2.textContent = "▪ 对应法则: 底边每条线段对应 1 个三角形";
      svg.append(l2);

      const l3 = document.createElementNS(SVG_NS, "text");
      l3.setAttribute("x", String(tx)); l3.setAttribute("y", "102");
      l3.setAttribute("font-size", "13"); l3.setAttribute("font-weight", "bold");
      l3.setAttribute("fill", isRevealed ? "#22c55e" : "#f59e0b");
      l3.textContent = isRevealed
        ? `▪ 三角形总数 ＝ ${baseSegs} × (${baseSegs} + 1) ÷ 2 ＝ ${totalTris} 个`
        : `▪ 三角形总数 ＝ ${baseSegs} × (${baseSegs} + 1) ÷ 2 ＝ ? 个`;
      svg.append(l3);
    }

    card.append(svg);

    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = `📐 计数原理：从三角形顶点向底边引分割线时，底边上共有多少条线段，就能组成多少个三角形。`;
    card.append(legend);

    return card;
  }

  const is3x3 = prompt.includes("3×3") || prompt.includes("九宫");
  const is2x3 = prompt.includes("2×3");
  const is2x2 = prompt.includes("2×2") || prompt.includes("2 行 2 列");
  const is1x4 = prompt.includes("4 个边长为 1") || prompt.includes("排成一行");

  const rows = is1x4 ? 1 : is3x3 ? 3 : 2;
  const cols = is1x4 ? 4 : is3x3 ? 3 : is2x3 ? 3 : 2;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🔲 网格图形分类统计</span>
    <span class="question-visual__subbadge">${rows}×${cols} 方格规格分解</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 155;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const cellSz = 32;
  const gx = 45;
  const gy = 32;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", String(gx + c * cellSz));
      rect.setAttribute("y", String(gy + r * cellSz));
      rect.setAttribute("width", String(cellSz));
      rect.setAttribute("height", String(cellSz));
      rect.setAttribute("fill", "rgba(56, 189, 248, 0.1)");
      rect.setAttribute("stroke", "#38bdf8");
      rect.setAttribute("stroke-width", "1.5");
      svg.append(rect);
    }
  }

  const rx = gx + cols * cellSz + 35;
  const t1 = document.createElementNS(SVG_NS, "text");
  t1.setAttribute("x", String(rx));
  t1.setAttribute("y", "48");
  t1.setAttribute("font-size", "12");
  t1.setAttribute("font-weight", "bold");
  t1.setAttribute("fill", "#38bdf8");
  t1.textContent = `▪ 1×1 小正方形: ${rows * cols} 个`;
  svg.append(t1);

  if (rows >= 2 && cols >= 2) {
    const s2 = (rows - 1) * (cols - 1);
    const t2 = document.createElementNS(SVG_NS, "text");
    t2.setAttribute("x", String(rx));
    t2.setAttribute("y", "72");
    t2.setAttribute("font-size", "12");
    t2.setAttribute("font-weight", "bold");
    t2.setAttribute("fill", "#f59e0b");
    t2.textContent = `▪ 2×2 中正方形: ${s2} 个`;
    svg.append(t2);
  }

  if (rows >= 3 && cols >= 3) {
    const t3 = document.createElementNS(SVG_NS, "text");
    t3.setAttribute("x", String(rx));
    t3.setAttribute("y", "96");
    t3.setAttribute("font-size", "12");
    t3.setAttribute("font-weight", "bold");
    t3.setAttribute("fill", "#ec4899");
    t3.textContent = `▪ 3×3 大正方形: 1 个`;
    svg.append(t3);
  }

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = is1x4
    ? `🔲 一行 4 个方格中只有 1×1 的正方形，无法组成 2×2，因此正方形总数为 4 个。`
    : is3x3
    ? `🔲 3×3 方格包含 1×1(9个)、2×2(4个)、3×3(1个)，合计 9+4+1 ＝ 14 个正方形。`
    : `🔲 网格计数方法：按规格（1×1、2×2等）分别有序数出，最后分类相加。`;
  card.append(legend);

  return card;
}

/**
 * 15. 逻辑推理交叉排除表 (Logic Deduction Matrix)
 */

function renderAngleVisual(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--angle";
  card.dataset.visualType = "angle";

  const cleaned = cleanPrompt(prompt);
  const cleanNums = cleanParseNumbers(prompt);

  // 1. 细分角度模型判别
  const isPolygonAngleSum = (prompt.includes("多边形") || prompt.includes("边形")) && prompt.includes("内角和");
  const isParallelZigzag = prompt.includes("平行") && (prompt.includes("折线") || prompt.includes("内折角") || prompt.includes("尖角"));
  const isQuadAngles = (prompt.includes("平行四边形") || prompt.includes("梯形") || prompt.includes("四边形")) && (prompt.includes("角") || prompt.includes("底角"));
  const isAltitudeBisector = prompt.includes("高") && (prompt.includes("角平分线") || prompt.includes("平分线"));
  const isClockAngle = prompt.includes("钟") || (prompt.includes("时针") && prompt.includes("分针"));
  const isParallelTransversal = prompt.includes("平行") && (prompt.includes("截") || prompt.includes("同旁内角"));
  const isCompSuppRelation = prompt.includes("补角") && prompt.includes("余角");
  const isBarToSectorAngle = prompt.includes("扇形") && prompt.includes("圆心角");
  const isCircleSectors = (prompt.includes("360°") || prompt.includes("圆周") || prompt.includes("观测盘")) && prompt.includes("扇区");

  const isRightTriangle = !isPolygonAngleSum && !isParallelZigzag && !isQuadAngles && !isAltitudeBisector && !isClockAngle &&
    (prompt.includes("直角三角形") || (prompt.includes("直角") && prompt.includes("三角形")));
  const isIsosceles = !isPolygonAngleSum && !isParallelZigzag && !isQuadAngles && !isAltitudeBisector && !isClockAngle && prompt.includes("等腰");
  const isTriangleSum = isRightTriangle || isIsosceles || (!isPolygonAngleSum && !isParallelZigzag && !isQuadAngles && !isAltitudeBisector && !isClockAngle && !isBarToSectorAngle && !isCircleSectors && (prompt.includes("三角形") && (prompt.includes("度") || prompt.includes("角"))));
  const isSupplementary = prompt.includes("补角") || prompt.includes("平角");
  const isComplementary = !isRightTriangle && (prompt.includes("余角") || prompt.includes("直角"));

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📐 角度度量与空间方位模型</span>
    <span class="question-visual__subbadge">${
      isPolygonAngleSum ? "多边形内角和定理：(n － 2) × 180°" :
      isParallelZigzag ? "平行线折线转折角模型 (内错角转化法)" :
      isAltitudeBisector ? "三角形高与角平分线夹角定理" :
      isClockAngle ? "钟表时针分针动态追及夹角模型" :
      isParallelTransversal ? "两平行线被第三线所截模型 (同旁内角互补)" :
      isCompSuppRelation ? "余角与补角代数方程模型" :
      isBarToSectorAngle ? "统计扇形圆心角转换模型" :
      isCircleSectors ? "周角 360° 扇区分割与补角模型" :
      isQuadAngles ? (prompt.includes("梯形") ? "梯形同旁内角互补与底角模型" : prompt.includes("平行四边形") ? "平行四边形邻角互补定理" : "四边形内角和定理 (360°)") :
      isRightTriangle ? "直角三角形模型：两锐角互余 (和为90°)" :
      isTriangleSum ? "三角形内角和定理 (180°)" :
      isSupplementary ? "平角与邻补角模型 (180°)" : "射线张角与量角标尺"
    }</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  // 模型 1：多边形内角和
  if (isPolygonAngleSum) {
    const isTruncated = prompt.includes("截去一个角");
    const sumVal = cleanNums.find(n => n >= 360) || (isTruncated ? 1260 : 900);
    const n = Math.round(sumVal / 180) + 2;
    const finalAns = isTruncated ? (n - 1) : n;

    // 绘制正多边形及从一个顶点出发的对角线分割 (三角形分割法)
    const cx = 110, cy = 80, r = 55;
    const sidesDraw = Math.min(Math.max(n, 5), 8);
    const pts = [];
    for (let i = 0; i < sidesDraw; i++) {
      const angle = (i * 2 * Math.PI / sidesDraw) - Math.PI / 2;
      pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }

    // 多边形外框
    const poly = document.createElementNS(SVG_NS, "polygon");
    poly.setAttribute("points", pts.map(p => `${p.x},${p.y}`).join(" "));
    poly.setAttribute("fill", "rgba(56, 189, 248, 0.15)");
    poly.setAttribute("stroke", "#38bdf8"); poly.setAttribute("stroke-width", "2");
    svg.append(poly);

    // 从顶点 0 连接对角线，展示 (n - 2) 个三角形
    for (let i = 2; i < sidesDraw - 1; i++) {
      const diag = document.createElementNS(SVG_NS, "line");
      diag.setAttribute("x1", String(pts[0].x)); diag.setAttribute("y1", String(pts[0].y));
      diag.setAttribute("x2", String(pts[i].x)); diag.setAttribute("y2", String(pts[i].y));
      diag.setAttribute("stroke", "#f59e0b"); diag.setAttribute("stroke-width", "1.5");
      diag.setAttribute("stroke-dasharray", "3 2");
      svg.append(diag);
    }

    const tCenter = document.createElementNS(SVG_NS, "text");
    tCenter.setAttribute("x", String(cx)); tCenter.setAttribute("y", String(cy + 4));
    tCenter.setAttribute("text-anchor", "middle"); tCenter.setAttribute("font-size", "11");
    tCenter.setAttribute("font-weight", "bold"); tCenter.setAttribute("fill", "#f8fafc");
    tCenter.textContent = `${sidesDraw} 边形`;
    svg.append(tCenter);

    const rx = 190;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `多边形内角和公式: (n － 2) × 180° ＝ ${sumVal}°`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = isTruncated
      ? `新多边形边数 m ＝ ${sumVal} ÷ 180 ＋ 2 ＝ ${n} 条边`
      : `边数 n ＝ ${sumVal} ÷ 180 ＋ 2 ＝ ${n} 条边`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a78bfa");
    f3.textContent = isTruncated ? `截去一角边数最多增加 1: 原边数最少为 ${n} － 1 ＝ ${finalAns}` : `由单顶点引对角线分割成 (n － 2) 个三角形`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? (isTruncated ? `原多边形最少边数 ＝ ${finalAns}` : `边数 ＝ ${finalAns} 条边`) : `答案 ＝ ?`;
    svg.append(f4);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 多边形内角和原理：从 n 边形的一个顶点出发，可以作 (n - 3) 条对角线，将多边形分成 (n - 2) 个三角形，每个三角形内角和为 180°。";
    card.append(legend);
    return card;
  }

  // 模型 2：两平行线折线夹角 (拐点辅助线)
  if (isParallelZigzag) {
    const a1 = cleanNums[0] || 38;
    const a2 = cleanNums[1] || 47;
    const sumA = a1 + a2;

    // 绘制两条水平平行线
    const l1 = document.createElementNS(SVG_NS, "line");
    l1.setAttribute("x1", "30"); l1.setAttribute("y1", "35");
    l1.setAttribute("x2", "190"); l1.setAttribute("y2", "35");
    l1.setAttribute("stroke", "#38bdf8"); l1.setAttribute("stroke-width", "2");
    svg.append(l1);

    const l2 = document.createElementNS(SVG_NS, "line");
    l2.setAttribute("x1", "30"); l2.setAttribute("y1", "125");
    l2.setAttribute("x2", "190"); l2.setAttribute("y2", "125");
    l2.setAttribute("stroke", "#38bdf8"); l2.setAttribute("stroke-width", "2");
    svg.append(l2);

    // 拐点 P
    const px = 145, py = 80;
    // 折线光路
    const ray1 = document.createElementNS(SVG_NS, "line");
    ray1.setAttribute("x1", "60"); ray1.setAttribute("y1", "35");
    ray1.setAttribute("x2", String(px)); ray1.setAttribute("y2", String(py));
    ray1.setAttribute("stroke", "#ec4899"); ray1.setAttribute("stroke-width", "2.5");
    svg.append(ray1);

    const ray2 = document.createElementNS(SVG_NS, "line");
    ray2.setAttribute("x1", String(px)); ray2.setAttribute("y1", String(py));
    ray2.setAttribute("x2", "60"); ray2.setAttribute("y2", "125");
    ray2.setAttribute("stroke", "#ec4899"); ray2.setAttribute("stroke-width", "2.5");
    svg.append(ray2);

    // 过 P 的黄色虚线平行辅助线
    const aux = document.createElementNS(SVG_NS, "line");
    aux.setAttribute("x1", "30"); aux.setAttribute("y1", String(py));
    aux.setAttribute("x2", "190"); aux.setAttribute("y2", String(py));
    aux.setAttribute("stroke", "#f59e0b"); aux.setAttribute("stroke-width", "1.5");
    aux.setAttribute("stroke-dasharray", "4 2");
    svg.append(aux);

    const tag1 = document.createElementNS(SVG_NS, "text");
    tag1.setAttribute("x", "75"); tag1.setAttribute("y", "52");
    tag1.setAttribute("font-size", "11"); tag1.setAttribute("font-weight", "bold"); tag1.setAttribute("fill", "#38bdf8");
    tag1.textContent = `${a1}°`;
    svg.append(tag1);

    const tag2 = document.createElementNS(SVG_NS, "text");
    tag2.setAttribute("x", "75"); tag2.setAttribute("y", "118");
    tag2.setAttribute("font-size", "11"); tag2.setAttribute("font-weight", "bold"); tag2.setAttribute("fill", "#38bdf8");
    tag2.textContent = `${a2}°`;
    svg.append(tag2);

    const pDot = document.createElementNS(SVG_NS, "circle");
    pDot.setAttribute("cx", String(px)); pDot.setAttribute("cy", String(py));
    pDot.setAttribute("r", "4"); pDot.setAttribute("fill", "#ec4899");
    svg.append(pDot);

    const rx = 210;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `平行线折线模型: 上折角 ${a1}°，下折角 ${a2}°`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `过拐点作平行辅助线，由内错角相等:`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a78bfa");
    f3.textContent = `向右尖角 ∠P ＝ ∠1 ＋ ∠2 ＝ ${a1}° ＋ ${a2}°`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `尖角度数 ＝ ${a1}° ＋ ${a2}° ＝ ${sumA}°` : `尖角度数 ＝ ?`;
    svg.append(f4);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 拐点辅助线定理：在两条平行线之间的折线拐点处作平行辅助线，将折角分解为两组内错角，尖角等于两侧内错角之和。";
    card.append(legend);
    return card;
  }

  // 模型 3：四边形内角与邻角互补
  if (isQuadAngles) {
    const isTrapezoidAngle = prompt.includes("梯形");
    const isParallelogramAngle = prompt.includes("平行四边形");
    const isRatioQuad = prompt.includes("比") || prompt.includes("四个内角");

    if (isTrapezoidAngle) {
      const lower = cleanNums.find(n => n > 0 && n < 180) || 65;
      const upper = 180 - lower;

      const ox = 40, oy = 35, ow = 135, oh = 85, tx = 40;
      const trap = document.createElementNS(SVG_NS, "polygon");
      trap.setAttribute("points", `${ox+tx},${oy} ${ox+ow-tx},${oy} ${ox+ow},${oy+oh} ${ox},${oy+oh}`);
      trap.setAttribute("fill", "rgba(168, 85, 247, 0.15)"); trap.setAttribute("stroke", "#c084fc"); trap.setAttribute("stroke-width", "2");
      svg.append(trap);

      const tLow = document.createElementNS(SVG_NS, "text");
      tLow.setAttribute("x", String(ox + 10)); tLow.setAttribute("y", String(oy + oh - 8));
      tLow.setAttribute("font-size", "11"); tLow.setAttribute("font-weight", "bold"); tLow.setAttribute("fill", "#38bdf8");
      tLow.textContent = `${lower}°`;
      svg.append(tLow);

      const tUp = document.createElementNS(SVG_NS, "text");
      tUp.setAttribute("x", String(ox + tx + 10)); tUp.setAttribute("y", String(oy + 20));
      tUp.setAttribute("font-size", "11"); tUp.setAttribute("font-weight", "bold"); tUp.setAttribute("fill", "#22c55e");
      tUp.textContent = isRevealed ? `${upper}°` : `?°`;
      svg.append(tUp);

      const rx = 205;
      const f1 = document.createElementNS(SVG_NS, "text");
      f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
      f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#c084fc");
      f1.textContent = `等腰梯形特性: 上底 ∥ 下底，同一底两底角相等`;
      svg.append(f1);

      const f2 = document.createElementNS(SVG_NS, "text");
      f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
      f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
      f2.textContent = `同旁内角互补定理: 上底角 ＋ 下底角 ＝ 180°`;
      svg.append(f2);

      const f3 = document.createElementNS(SVG_NS, "text");
      f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
      f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#38bdf8");
      f3.textContent = `已知下底角为 ${lower}°`;
      svg.append(f3);

      const f4 = document.createElementNS(SVG_NS, "text");
      f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
      f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
      f4.textContent = isRevealed ? `相邻上底角 ＝ 180° － ${lower}° ＝ ${upper}°` : `相邻上底角 ＝ ?`;
      svg.append(f4);

      card.append(svg);
      const legend = document.createElement("p");
      legend.className = "question-visual__legend";
      legend.textContent = "📐 梯形同旁内角性质：因为上下底互相平行，所以一条腰上的两个角互为同旁内角，其度数之和恒为 180°。";
      card.append(legend);
      return card;
    } else if (isParallelogramAngle) {
      const g1 = cleanNums.find(n => n > 0 && n < 180) || 72;
      const g2 = 180 - g1;

      const ox = 40, oy = 35, ow = 130, oh = 80, dx = 35;
      const poly = document.createElementNS(SVG_NS, "polygon");
      poly.setAttribute("points", `${ox+dx},${oy} ${ox+ow+dx},${oy} ${ox+ow},${oy+oh} ${ox},${oy+oh}`);
      poly.setAttribute("fill", "rgba(56, 189, 248, 0.15)"); poly.setAttribute("stroke", "#38bdf8"); poly.setAttribute("stroke-width", "2");
      svg.append(poly);

      const t1 = document.createElementNS(SVG_NS, "text");
      t1.setAttribute("x", String(ox + 12)); t1.setAttribute("y", String(oy + oh - 8));
      t1.setAttribute("font-size", "11"); t1.setAttribute("font-weight", "bold"); t1.setAttribute("fill", "#38bdf8");
      t1.textContent = `${g1}°`;
      svg.append(t1);

      const t2 = document.createElementNS(SVG_NS, "text");
      t2.setAttribute("x", String(ox + dx + 12)); t2.setAttribute("y", String(oy + 22));
      t2.setAttribute("font-size", "11"); t2.setAttribute("font-weight", "bold"); t2.setAttribute("fill", "#22c55e");
      t2.textContent = isRevealed ? `${g2}°` : `?°`;
      svg.append(t2);

      const rx = 210;
      const f1 = document.createElementNS(SVG_NS, "text");
      f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
      f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
      f1.textContent = `平行四边形性质: 对边平行且相等，对角相等`;
      svg.append(f1);

      const f2 = document.createElementNS(SVG_NS, "text");
      f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
      f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
      f2.textContent = `邻角互补定理: 相邻两内角之和恒等于 180°`;
      svg.append(f2);

      const f3 = document.createElementNS(SVG_NS, "text");
      f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
      f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a78bfa");
      f3.textContent = `已知其中一个内角为 ${g1}°`;
      svg.append(f3);

      const f4 = document.createElementNS(SVG_NS, "text");
      f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
      f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
      f4.textContent = isRevealed ? `相邻内角 ＝ 180° － ${g1}° ＝ ${g2}°` : `相邻内角 ＝ ?`;
      svg.append(f4);

      card.append(svg);
      const legend = document.createElement("p");
      legend.className = "question-visual__legend";
      legend.textContent = "📐 平行四边形角度规律：对角相等，邻角互补；已知任意一个角的度数，其余三个角的度数均可唯一确定。";
      card.append(legend);
      return card;
    } else if (isRatioQuad) {
      // 四边形内角之比 2:3:3:4
      const rx = 190;
      const f1 = document.createElementNS(SVG_NS, "text");
      f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
      f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
      f1.textContent = `任意凸四边形内角和恒为 360°`;
      svg.append(f1);

      const f2 = document.createElementNS(SVG_NS, "text");
      f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
      f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
      f2.textContent = `内角之比 2:3:3:4，总份数 ＝ 2＋3＋3＋4 ＝ 12 份`;
      svg.append(f2);

      const f3 = document.createElementNS(SVG_NS, "text");
      f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
      f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a78bfa");
      f3.textContent = `每份角度 ＝ 360° ÷ 12 ＝ 30°`;
      svg.append(f3);

      const f4 = document.createElementNS(SVG_NS, "text");
      f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
      f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
      f4.textContent = isRevealed ? `最大内角 ＝ 30° × 4 ＝ 120°` : `最大内角 ＝ ?`;
      svg.append(f4);

      // 绘制示意凸四边形
      const qPoly = document.createElementNS(SVG_NS, "polygon");
      qPoly.setAttribute("points", "50,40 140,30 160,120 40,110");
      qPoly.setAttribute("fill", "rgba(56, 189, 248, 0.15)"); qPoly.setAttribute("stroke", "#38bdf8"); qPoly.setAttribute("stroke-width", "2");
      svg.append(qPoly);

      card.append(svg);
      const legend = document.createElement("p");
      legend.className = "question-visual__legend";
      legend.textContent = "📐 四边形内角和模型：由一条对角线分为两个三角形，总内角和恒为 180° × 2 = 360°。";
      card.append(legend);
      return card;
    }
  }

  // 模型 4：三角形高与角平分线夹角
  if (isAltitudeBisector) {
    const bMatch = prompt.match(/∠B\s*=\s*(\d+)/)?.[1] || 40;
    const cMatch = prompt.match(/∠C\s*=\s*(\d+)/)?.[1] || 60;
    const bDeg = Number(bMatch);
    const cDeg = Number(cMatch);
    const ansDeg = Math.abs(bDeg - cDeg) / 2;

    const pA = { x: 95, y: 30 };
    const pB = { x: 30, y: 125 };
    const pC = { x: 175, y: 125 };
    const pD = { x: 95, y: 125 }; // 高垂足
    const pE = { x: 110, y: 125 }; // 角平分线交点

    const tri = document.createElementNS(SVG_NS, "polygon");
    tri.setAttribute("points", `${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`);
    tri.setAttribute("fill", "rgba(56, 189, 248, 0.15)"); tri.setAttribute("stroke", "#38bdf8"); tri.setAttribute("stroke-width", "2");
    svg.append(tri);

    // 高 AD (黄色实线)
    const ad = document.createElementNS(SVG_NS, "line");
    ad.setAttribute("x1", String(pA.x)); ad.setAttribute("y1", String(pA.y));
    ad.setAttribute("x2", String(pD.x)); ad.setAttribute("y2", String(pD.y));
    ad.setAttribute("stroke", "#f59e0b"); ad.setAttribute("stroke-width", "2");
    svg.append(ad);

    // 角平分线 AE (粉色实线)
    const ae = document.createElementNS(SVG_NS, "line");
    ae.setAttribute("x1", String(pA.x)); ae.setAttribute("y1", String(pA.y));
    ae.setAttribute("x2", String(pE.x)); ae.setAttribute("y2", String(pE.y));
    ae.setAttribute("stroke", "#ec4899"); ae.setAttribute("stroke-width", "2");
    svg.append(ae);

    const rx = 195;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `三角形参数: ∠B ＝ ${bDeg}°，∠C ＝ ${cDeg}°`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `AD 为高，AE 为 ∠A 的角平分线`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a78bfa");
    f3.textContent = `经典夹角公式: ∠DAE ＝ |∠B － ∠C| ÷ 2`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `∠DAE ＝ |${bDeg}° － ${cDeg}°| ÷ 2 ＝ ${ansDeg}°` : `∠DAE ＝ ?`;
    svg.append(f4);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 高与角平分线夹角公式：在任意三角形中，顶角处的高与角平分线的夹角恒等于另外两底角之差的绝对值的一半。";
    card.append(legend);
    return card;
  }

  // 模型 5：钟表时针分针夹角
  if (isClockAngle) {
    const hour = 3, min = 40;
    const minAngle = min * 6; // 240°
    const hourAngle = hour * 30 + min * 0.5; // 110°
    const diffAngle = Math.abs(minAngle - hourAngle); // 130°

    const cx = 95, cy = 80, r = 50;
    const dial = document.createElementNS(SVG_NS, "circle");
    dial.setAttribute("cx", String(cx)); dial.setAttribute("cy", String(cy));
    dial.setAttribute("r", String(r));
    dial.setAttribute("fill", "rgba(15, 23, 42, 0.85)"); dial.setAttribute("stroke", "#38bdf8"); dial.setAttribute("stroke-width", "2");
    svg.append(dial);

    // 12 个表盘刻度
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180;
      const x1 = cx + (r - 6) * Math.cos(a), y1 = cy + (r - 6) * Math.sin(a);
      const x2 = cx + r * Math.cos(a), y2 = cy + r * Math.sin(a);
      const tick = document.createElementNS(SVG_NS, "line");
      tick.setAttribute("x1", String(x1)); tick.setAttribute("y1", String(y1));
      tick.setAttribute("x2", String(x2)); tick.setAttribute("y2", String(y2));
      tick.setAttribute("stroke", i % 3 === 0 ? "#f8fafc" : "#64748b");
      tick.setAttribute("stroke-width", i % 3 === 0 ? "2" : "1");
      svg.append(tick);
    }

    // 分针 (指向 8，即 240°)
    const minRad = (minAngle - 90) * Math.PI / 180;
    const mx = cx + 42 * Math.cos(minRad), my = cy + 42 * Math.sin(minRad);
    const mHand = document.createElementNS(SVG_NS, "line");
    mHand.setAttribute("x1", String(cx)); mHand.setAttribute("y1", String(cy));
    mHand.setAttribute("x2", String(mx)); mHand.setAttribute("y2", String(my));
    mHand.setAttribute("stroke", "#38bdf8"); mHand.setAttribute("stroke-width", "2.5");
    svg.append(mHand);

    // 时针 (指向 3点40分，即 110°)
    const hourRad = (hourAngle - 90) * Math.PI / 180;
    const hx = cx + 28 * Math.cos(hourRad), hy = cy + 28 * Math.sin(hourRad);
    const hHand = document.createElementNS(SVG_NS, "line");
    hHand.setAttribute("x1", String(cx)); hHand.setAttribute("y1", String(cy));
    hHand.setAttribute("x2", String(hx)); hHand.setAttribute("y2", String(hy));
    hHand.setAttribute("stroke", "#f59e0b"); hHand.setAttribute("stroke-width", "3.5");
    svg.append(hHand);

    const pin = document.createElementNS(SVG_NS, "circle");
    pin.setAttribute("cx", String(cx)); pin.setAttribute("cy", String(cy));
    pin.setAttribute("r", "4"); pin.setAttribute("fill", "#f8fafc");
    svg.append(pin);

    const rx = 180;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `分针位置: ${min}分 × 6°/分 ＝ ${minAngle}°`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `时针位置: ${hour}点 × 30° ＋ ${min} × 0.5° ＝ ${hourAngle}°`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a78bfa");
    f3.textContent = `两针夹角 ＝ |${minAngle}° － ${hourAngle}°| ＝ ${diffAngle}°`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `较小夹角 ＝ ${diffAngle}°` : `较小夹角 ＝ ?`;
    svg.append(f4);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 钟表追及问题核心：分针每分钟走 6°，时针每分钟走 0.5°；两针速度差为 5.5°/分。";
    card.append(legend);
    return card;
  }

  // 模型 6：平行线同旁内角
  if (isParallelTransversal) {
    const rx = 190;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `平行线同旁内角性质: 两角互补，和为 180°`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `内角比为 4:5，总份数 ＝ 4 ＋ 5 ＝ 9 份`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a78bfa");
    f3.textContent = `每份角度 ＝ 180° ÷ 9 ＝ 20°`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `较小内角 ＝ 20° × 4 ＝ 80°` : `较小内角 ＝ ?`;
    svg.append(f4);

    // 绘制两条水平平行线被斜截线所截
    const l1 = document.createElementNS(SVG_NS, "line");
    l1.setAttribute("x1", "25"); l1.setAttribute("y1", "40");
    l1.setAttribute("x2", "165"); l1.setAttribute("y2", "40");
    l1.setAttribute("stroke", "#38bdf8"); l1.setAttribute("stroke-width", "2");
    svg.append(l1);

    const l2 = document.createElementNS(SVG_NS, "line");
    l2.setAttribute("x1", "25"); l2.setAttribute("y1", "120");
    l2.setAttribute("x2", "165"); l2.setAttribute("y2", "120");
    l2.setAttribute("stroke", "#38bdf8"); l2.setAttribute("stroke-width", "2");
    svg.append(l2);

    const trans = document.createElementNS(SVG_NS, "line");
    trans.setAttribute("x1", "55"); trans.setAttribute("y1", "135");
    trans.setAttribute("x2", "135"); trans.setAttribute("y2", "25");
    trans.setAttribute("stroke", "#f59e0b"); trans.setAttribute("stroke-width", "2");
    svg.append(trans);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 平行线性质：两直线平行，同位角相等，内错角相等，同旁内角互补（相加等于 180°）。";
    card.append(legend);
    return card;
  }

  // 模型 7：余角与补角倍数关系
  if (isCompSuppRelation) {
    const rx = 190;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `余角定义: 90° － x；补角定义: 180° － x`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `依题意列方程: 180° － x ＝ 3(90° － x)`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a78bfa");
    f3.textContent = `化简: 180° － x ＝ 270° － 3x ⇒ 2x ＝ 90°`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `解得角 A ＝ 90° ÷ 2 ＝ 45°` : `角 A ＝ ?`;
    svg.append(f4);

    // 绘制 45° 射线与 90° 直角及 180° 平角参照
    const ox = 90, oy = 110;
    const baseLine = document.createElementNS(SVG_NS, "line");
    baseLine.setAttribute("x1", String(ox - 60)); baseLine.setAttribute("y1", String(oy));
    baseLine.setAttribute("x2", String(ox + 60)); baseLine.setAttribute("y2", String(oy));
    baseLine.setAttribute("stroke", "#475569"); baseLine.setAttribute("stroke-width", "1.5");
    svg.append(baseLine);

    const vertLine = document.createElementNS(SVG_NS, "line");
    vertLine.setAttribute("x1", String(ox)); vertLine.setAttribute("y1", String(oy));
    vertLine.setAttribute("x2", String(ox)); vertLine.setAttribute("y2", String(oy - 60));
    vertLine.setAttribute("stroke", "#64748b"); vertLine.setAttribute("stroke-width", "1.5");
    vertLine.setAttribute("stroke-dasharray", "3 2");
    svg.append(vertLine);

    const ray45 = document.createElementNS(SVG_NS, "line");
    ray45.setAttribute("x1", String(ox)); ray45.setAttribute("y1", String(oy));
    ray45.setAttribute("x2", String(ox + 50)); ray45.setAttribute("y2", String(oy - 50));
    ray45.setAttribute("stroke", "#22c55e"); ray45.setAttribute("stroke-width", "2.5");
    svg.append(ray45);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 余角与补角代数化：两角和为 90° 互为余角，和为 180° 互为补角。同一个角的补角比余角恒大 90°。";
    card.append(legend);
    return card;
  }

  // 模型 8：统计扇形圆心角转换
  if (isBarToSectorAngle) {
    const part = cleanNums.find(n => n === 48) || 48;
    const total = cleanNums.find(n => n === 120) || 120;
    const ratio = part / total;
    const deg = Math.round(360 * ratio);

    const rx = 190;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `条形频数部分量: ${part}，样本总量: ${total}`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `所占百分比 ＝ ${part} ÷ ${total} ＝ ${ratio * 100}%`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a78bfa");
    f3.textContent = `扇形圆心角 ＝ 360° × 百分比 ＝ 360° × ${ratio}`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `圆心角 ＝ 360° × (${part}/${total}) ＝ ${deg}°` : `圆心角 ＝ ?`;
    svg.append(f4);

    // 绘制圆盘与对应 144° 扇形
    const cx = 95, cy = 80, r = 50;
    const dial = document.createElementNS(SVG_NS, "circle");
    dial.setAttribute("cx", String(cx)); dial.setAttribute("cy", String(cy));
    dial.setAttribute("r", String(r));
    dial.setAttribute("fill", "rgba(56, 189, 248, 0.15)"); dial.setAttribute("stroke", "#38bdf8"); dial.setAttribute("stroke-width", "2");
    svg.append(dial);

    const rad = (deg * Math.PI) / 180;
    const endX = cx + r * Math.sin(rad), endY = cy - r * Math.cos(rad);
    const largeArc = deg > 180 ? 1 : 0;
    const piePath = document.createElementNS(SVG_NS, "path");
    piePath.setAttribute("d", `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY} Z`);
    piePath.setAttribute("fill", "rgba(34, 197, 94, 0.4)"); piePath.setAttribute("stroke", "#22c55e"); piePath.setAttribute("stroke-width", "1.5");
    svg.append(piePath);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 扇形统计图法则：圆心角大小与频数占比成正比，扇形圆心角 ＝ 360° × (该分类频数 ÷ 总样本数)。";
    card.append(legend);
    return card;
  }

  // 模型 9：周角 360° 扇区分割
  if (isCircleSectors) {
    const knowns = [70, 110, 85];
    const knownSum = knowns.reduce((a, b) => a + b, 0); // 265
    const remain = 360 - knownSum; // 95

    const rx = 190;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `整周角圆盘一周总度数恒为 360°`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `已知三个扇区: 70° ＋ 110° ＋ 85° ＝ ${knownSum}°`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a78bfa");
    f3.textContent = `第四个扇区 ＝ 360° － 前三扇区之和`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `第四扇区度数 ＝ 360° － ${knownSum}° ＝ ${remain}°` : `第四扇区 ＝ ?`;
    svg.append(f4);

    const cx = 95, cy = 80, r = 50;
    const dial = document.createElementNS(SVG_NS, "circle");
    dial.setAttribute("cx", String(cx)); dial.setAttribute("cy", String(cy));
    dial.setAttribute("r", String(r));
    dial.setAttribute("fill", "rgba(56, 189, 248, 0.1)"); dial.setAttribute("stroke", "#38bdf8"); dial.setAttribute("stroke-width", "2");
    svg.append(dial);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 周角性质：一条射线绕端点旋转一周所形成的角叫做周角，1 周角 = 360°。各扇形圆心角之和恒等于 360°。";
    card.append(legend);
    return card;
  }

  // 模型 10：三角形内角和 (常规)
  if (isTriangleSum) {
    let a1 = 60, a2 = 50, a3 = 70;
    let formulaDesc = "";

    if (isRightTriangle) {
      a1 = 90;
      const acuteGiven = cleanNums.find(n => n > 0 && n < 90) || 35;
      a2 = acuteGiven;
      a3 = 90 - a2;
      formulaDesc = isRevealed
        ? `直角三角形锐角互余: 90° － ${a2}° ＝ ${a3}° (总内角和 180°)`
        : `直角三角形锐角互余: 90° － ${a2}° ＝ ?°`;
    } else if (isIsosceles) {
      const topMatch = cleaned.match(/顶角(?:为|是)?\s*(\d+)/);
      const baseMatch = cleaned.match(/底角(?:为|是)?\s*(\d+)/);
      if (topMatch) {
        a1 = Number(topMatch[1]);
        a2 = Math.round((180 - a1) / 2);
        a3 = a2;
        formulaDesc = isRevealed
          ? `等腰两底角相等: (180° － ${a1}°) ÷ 2 ＝ ${a2}°`
          : `等腰两底角相等: (180° － ${a1}°) ÷ 2 ＝ ?°`;
      } else if (baseMatch) {
        a2 = Number(baseMatch[1]);
        a3 = a2;
        a1 = 180 - 2 * a2;
        formulaDesc = isRevealed
          ? `等腰求顶角: 180° － ${a2}° × 2 ＝ ${a1}°`
          : `等腰求顶角: 180° － ${a2}° × 2 ＝ ?°`;
      } else {
        a1 = 80; a2 = 50; a3 = 50;
        formulaDesc = `等腰两底角相等: ∠B ＝ ∠C ＝ 50°`;
      }
    } else {
      const angles = cleanNums.filter(n => n > 0 && n < 180);
      if (angles.length >= 2) {
        a1 = angles[0];
        a2 = angles[1];
        a3 = Math.max(1, 180 - a1 - a2);
      } else if (angles.length === 1) {
        a1 = angles[0];
        a2 = Math.round((180 - a1) * 0.6);
        a3 = 180 - a1 - a2;
      }
      formulaDesc = isRevealed
        ? `内角和定理: 180° － ${a1}° － ${a2}° ＝ ${a3}°`
        : `内角和定理: 180° － ${a1}° － ${a2}° ＝ ?°`;
    }

    const pA = { x: 230, y: 35 };
    const pB = { x: 90, y: 125 };
    const pC = { x: 370, y: 125 };

    const tri = document.createElementNS(SVG_NS, "polygon");
    tri.setAttribute("points", `${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`);
    tri.setAttribute("fill", "rgba(56, 189, 248, 0.12)");
    tri.setAttribute("stroke", "#38bdf8");
    tri.setAttribute("stroke-width", "2.5");
    svg.append(tri);

    const tA = document.createElementNS(SVG_NS, "text");
    tA.setAttribute("x", "230"); tA.setAttribute("y", "25");
    tA.setAttribute("text-anchor", "middle");
    tA.setAttribute("font-size", "12"); tA.setAttribute("font-weight", "bold");
    tA.setAttribute("fill", "#f59e0b"); tA.textContent = `∠A = ${a1}°`;
    svg.append(tA);

    const tB = document.createElementNS(SVG_NS, "text");
    tB.setAttribute("x", "75"); tB.setAttribute("y", "140");
    tB.setAttribute("font-size", "12"); tB.setAttribute("font-weight", "bold");
    tB.setAttribute("fill", "#10b981"); tB.textContent = `∠B = ${a2}°`;
    svg.append(tB);

    const tC = document.createElementNS(SVG_NS, "text");
    tC.setAttribute("x", "380"); tC.setAttribute("y", "140");
    tC.setAttribute("font-size", "12"); tC.setAttribute("font-weight", "bold");
    tC.setAttribute("fill", "#ec4899"); tC.textContent = `∠C = ${a3}°`;
    svg.append(tC);

    const sumTag = document.createElementNS(SVG_NS, "text");
    sumTag.setAttribute("x", "230"); sumTag.setAttribute("y", "95");
    sumTag.setAttribute("text-anchor", "middle");
    sumTag.setAttribute("font-size", "12"); sumTag.setAttribute("font-weight", "bold");
    sumTag.setAttribute("fill", "#f8fafc");
    sumTag.textContent = formulaDesc;
    svg.append(sumTag);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = isRightTriangle
      ? "📐 直角三角形特性：直角为 90°，两锐角之和恒为 90°（互余）。"
      : "📐 核心性质：任意三角形内角和恒为 180°；已知两个角，第三角 = 180° - 另外两角之和。";
    card.append(legend);
    return card;
  }

  // 模型 11：常规单角 / 互补角 / 互余角射线标尺
  const ox = 230, oy = 115;
  const deg = cleanNums.find(n => n > 0 && n < 180) || 45;

  const arcPath = document.createElementNS(SVG_NS, "path");
  arcPath.setAttribute("d", `M ${ox - 90} ${oy} A 90 90 0 0 1 ${ox + 90} ${oy}`);
  arcPath.setAttribute("fill", "none"); arcPath.setAttribute("stroke", "#475569");
  arcPath.setAttribute("stroke-width", "1.5"); arcPath.setAttribute("stroke-dasharray", "3 2");
  svg.append(arcPath);

  const rayOA = document.createElementNS(SVG_NS, "line");
  rayOA.setAttribute("x1", String(ox)); rayOA.setAttribute("y1", String(oy));
  rayOA.setAttribute("x2", String(ox + 100)); rayOA.setAttribute("y2", String(oy));
  rayOA.setAttribute("stroke", "#38bdf8"); rayOA.setAttribute("stroke-width", "2.5");
  svg.append(rayOA);

  const rad = (deg * Math.PI) / 180;
  const bx = ox + 100 * Math.cos(-rad);
  const by = oy + 100 * Math.sin(-rad);

  const rayOB = document.createElementNS(SVG_NS, "line");
  rayOB.setAttribute("x1", String(ox)); rayOB.setAttribute("y1", String(oy));
  rayOB.setAttribute("x2", String(bx)); rayOB.setAttribute("y2", String(by));
  rayOB.setAttribute("stroke", "#ec4899"); rayOB.setAttribute("stroke-width", "2.5");
  svg.append(rayOB);

  const arcR = 36;
  const arcEndX = ox + arcR * Math.cos(-rad);
  const arcEndY = oy + arcR * Math.sin(-rad);
  const sector = document.createElementNS(SVG_NS, "path");
  sector.setAttribute("d", `M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 0 0 ${arcEndX} ${arcEndY}`);
  sector.setAttribute("fill", "none"); sector.setAttribute("stroke", "#fbbf24");
  sector.setAttribute("stroke-width", "2");
  svg.append(sector);

  const aText = document.createElementNS(SVG_NS, "text");
  aText.setAttribute("x", String(ox + 48 * Math.cos(-rad / 2)));
  aText.setAttribute("y", String(oy + 48 * Math.sin(-rad / 2) - 4));
  aText.setAttribute("font-size", "12"); aText.setAttribute("font-weight", "bold");
  aText.setAttribute("fill", "#fbbf24"); aText.textContent = `${deg}°`;
  svg.append(aText);

  const vDot = document.createElementNS(SVG_NS, "circle");
  vDot.setAttribute("cx", String(ox)); vDot.setAttribute("cy", String(oy));
  vDot.setAttribute("r", "4"); vDot.setAttribute("fill", "#f8fafc");
  svg.append(vDot);

  const formula = document.createElementNS(SVG_NS, "text");
  formula.setAttribute("x", "230"); formula.setAttribute("y", "28");
  formula.setAttribute("text-anchor", "middle");
  formula.setAttribute("font-size", "12"); formula.setAttribute("font-weight", "bold");
  formula.setAttribute("fill", "#22c55e");
  formula.textContent = isRevealed
    ? (isSupplementary ? `互补角: ${deg}° + ${180 - deg}° = 180° (平角)` : isComplementary ? `互余角: ${deg}° + ${90 - deg}° = 90° (直角)` : `角的大小由两边张开程度决定 (${deg}°)`)
    : (isSupplementary ? `互补角: ${deg}° + ? = 180° (平角)` : isComplementary ? `互余角: ${deg}° + ? = 90° (直角)` : "角的大小由两边张开程度决定");
  svg.append(formula);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "📐 角度性质：锐角 < 90°，直角 = 90°，钝角在 90° 到 180° 之间，平角 = 180°。";
  card.append(legend);

  return card;
}

/**
 * 20. 平面多边形与几何面积标尺 (Polygon & Area Model)
 */

function renderPolygonVisual(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--polygon";
  card.dataset.visualType = "polygon";

  const cleaned = cleanPrompt(prompt);
  const cleanNums = cleanParseNumbers(prompt);

  // 1. 复合模型识别
  const isChordSquare = prompt.includes("弦图") ||
    (prompt.includes("大正方形") && (prompt.includes("中间留出") || prompt.includes("小正方形") || prompt.includes("空洞"))) ||
    (prompt.includes("完全一样的") && prompt.includes("大正方形"));

  const isPointPTriangles = (prompt.includes("点 P") || prompt.includes("点P")) ||
    (prompt.includes("对顶三角形") || (prompt.includes("上下两三角形") && prompt.includes("左右两三角形")));

  const isSingleCornerCutPerimeter = prompt.includes("周长") &&
    (prompt.includes("从一个角剪去") || prompt.includes("剪去一个边长") || (prompt.includes("长方形") && prompt.includes("剪去") && prompt.includes("剩下图形的周长")));

  const isStaircasePerimeter = prompt.includes("台阶") && prompt.includes("周长");

  const isCutRectPerimeterIncrease = prompt.includes("两小长方形周长之和比原长方形多") ||
    (prompt.includes("平行于短边剪成两个") && prompt.includes("周长"));

  const isSplitRectGridPerimeter = prompt.includes("分割成 16 个小长方形") || prompt.includes("小长方形的周长总和");

  const isPerimeterCornerCut = (prompt.includes("周长") && (prompt.includes("剪去") || prompt.includes("切去")) && (prompt.includes("凹槽") || prompt.includes("凹进") || prompt.includes("挖去"))) ||
    (prompt.includes("围栏") && prompt.includes("凹"));

  const isPathTranslationArea = (prompt.includes("小路") || prompt.includes("修路")) && (prompt.includes("草坪") || prompt.includes("绿地") || prompt.includes("剩余"));

  const isTriangleInequality = (prompt.includes("三角") || prompt.includes("三边")) && (prompt.includes("第三根") || prompt.includes("第三边") || (prompt.includes("杆") && prompt.includes("最短")));

  const isIsoscelesPerimeter = prompt.includes("等腰") && prompt.includes("周长") && (prompt.includes("腰长") || prompt.includes("底边"));

  const isMedianArea = prompt.includes("三角形") && (prompt.includes("中点") || prompt.includes("中线")) && prompt.includes("面积");

  const isRhombusPerimeter = prompt.includes("菱形") && (prompt.includes("周长") || prompt.includes("边长"));

  const isParallelogramPerimeter = prompt.includes("平行四边形") && prompt.includes("周长") && (prompt.includes("另一条边") || prompt.includes("相邻"));

  const isTrapezoidButterfly = prompt.includes("梯形") && prompt.includes("对角线") &&
    (prompt.includes("两翼") || prompt.includes("两翅") || prompt.includes("翅") || prompt.includes("点 O") || prompt.includes("点O") || prompt.includes("相交于"));

  const isConvexQuadDiagonal = prompt.includes("对角线") && prompt.includes("周长") && (prompt.includes("四边形") || prompt.includes("两个三角形"));

  const isRightTriAreaFromSum = prompt.includes("直角三角形") && prompt.includes("直角边之和") && prompt.includes("斜边");

  const isParallelogramHalfArea = prompt.includes("平行四边形") && (prompt.includes("任意一点") || prompt.includes("同底等高")) && prompt.includes("面积");

  const isGridPolygonDecomp = prompt.includes("半格") || (prompt.includes("网格纸") && prompt.includes("完整小方格"));

  const isSquareCutQuarterArea = prompt.includes("正方形") && prompt.includes("折线") && prompt.includes("1/4");

  const isSideBySideSquaresTriangle = prompt.includes("两个正方形并排") && prompt.includes("连接") && prompt.includes("三角形面积");

  const isSemicircleTriangleComposite = prompt.includes("半圆") && prompt.includes("等腰三角形");

  const isCornerTrianglesCutout = prompt.includes("长方形") && prompt.includes("四个角各剪去") && prompt.includes("直角三角形");

  const isTrapezoidAltitudeDecomp = prompt.includes("直角梯形") && (prompt.includes("辅助线") || prompt.includes("分割为") || prompt.includes("分割出"));

  const isAttachedComposite = prompt.includes("两端各拼接") || prompt.includes("L 型") || prompt.includes("L型") || prompt.includes("两级台阶") || prompt.includes("阶梯花坛");

  const isInscribedCircleExcess = (prompt.includes("内接一个圆") || prompt.includes("内切圆")) && prompt.includes("余料");

  const isTrapezoidInteriorTriangle = prompt.includes("梯形") && prompt.includes("以上底为底且高相同的三角形");

  const isPicksTheorem = prompt.includes("皮克定理") || (prompt.includes("格点") && prompt.includes("内部点"));

  const isHoleCutout = !isPerimeterCornerCut && !isSingleCornerCutPerimeter && !isStaircasePerimeter && !prompt.includes("周长") &&
    (prompt.includes("挖去") || prompt.includes("减重孔") || prompt.includes("蓄水池") || prompt.includes("环形阴影") ||
    (prompt.includes("孔洞") && !prompt.includes("长方体") && !prompt.includes("正方体")));

  const hasSpecializedModel = isChordSquare || isPointPTriangles || isHoleCutout || isPerimeterCornerCut ||
    isSingleCornerCutPerimeter || isStaircasePerimeter || isCutRectPerimeterIncrease || isSplitRectGridPerimeter ||
    isPathTranslationArea || isTriangleInequality || isIsoscelesPerimeter || isMedianArea || isRhombusPerimeter ||
    isParallelogramPerimeter || isTrapezoidButterfly || isConvexQuadDiagonal || isRightTriAreaFromSum ||
    isParallelogramHalfArea || isGridPolygonDecomp || isSquareCutQuarterArea || isSideBySideSquaresTriangle ||
    isSemicircleTriangleComposite || isCornerTrianglesCutout || isTrapezoidAltitudeDecomp || isAttachedComposite ||
    isInscribedCircleExcess || isTrapezoidInteriorTriangle || isPicksTheorem;

  const isTriangle = !hasSpecializedModel && prompt.includes("三角形");
  const isTrapezoid = !hasSpecializedModel && prompt.includes("梯形");
  const isParallelogram = !hasSpecializedModel && prompt.includes("平行四边形");

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📏 平面几何图形与面积模型</span>
    <span class="question-visual__subbadge">${
      isChordSquare ? "赵爽弦图·旋转拼方与中心空洞模型" :
      isPointPTriangles ? "矩形内任意点 P 对顶三角形面积守恒模型" :
      isHoleCutout ? "复合图形·中心镂空与环形阴影面积模型" :
      isPerimeterCornerCut ? "周长转化·剪角平移守恒与凹槽增益模型" :
      isSingleCornerCutPerimeter ? "长方形剪角·平移等长外推周长守恒" :
      isStaircasePerimeter ? "阶梯多边形·投影平移化为长方形周长" :
      isCutRectPerimeterIncrease ? "截断增边·平行短边剪开增加两个切口" :
      isSplitRectGridPerimeter ? "正方形井字分割·内部切线周长累加模型" :
      isPathTranslationArea ? "草坪十字小路·平移拼合等效模型" :
      isTriangleInequality ? "三角形三边关系·两边之和大于第三边" :
      isIsoscelesPerimeter ? "等腰三角形·两腰相等周长解构" :
      isMedianArea ? "三角形等底等高·中线平分面积模型" :
      isRhombusPerimeter ? "菱形周长·四边等长逆运算" :
      isParallelogramPerimeter ? "平行四边形周长·对边相等与半周长模型" :
      isTrapezoidButterfly ? "梯形蝴蝶模型·两侧对顶翅膀等积定理" :
      isConvexQuadDiagonal ? "凸四边形对角线·双三角形周长重叠扣减" :
      isRightTriAreaFromSum ? "勾股与完全平方·和与斜边推导面积模型" :
      isParallelogramHalfArea ? "同底等高模型·平行四边形内任意点三角形面积" :
      isGridPolygonDecomp ? "网格多边形·整格与半格面积拼合" :
      isSquareCutQuarterArea ? "正方形割补平移·对称旋转 1/4 面积模型" :
      isSideBySideSquaresTriangle ? "双正方形并排·经典斜拉大三角形模型" :
      isSemicircleTriangleComposite ? "半圆与三角形拼接·分块求和模型" :
      isCornerTrianglesCutout ? "长方形剪四角·整体减空白剩余面积模型" :
      isTrapezoidAltitudeDecomp ? "直角梯形·垂直高辅助线割补分解模型" :
      isAttachedComposite ? "复合拼接图形·分块求和模型" :
      isInscribedCircleExcess ? "方内切圆·四角余料割补模型" :
      isTrapezoidInteriorTriangle ? "梯形同高三角形与剩余空白面积模型" :
      isPicksTheorem ? "网格多边形·皮克定理格点面积公式" :
      isTrapezoid ? "梯形底高面积" : isTriangle ? "三角形底高面积" : isParallelogram ? "平行四边形割补法" : "长方形与正方形度量"
    }</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  // 模型 1：赵爽弦图 / 4 块拼接大正方形留空洞
  if (isChordSquare) {
    const isTriangles = prompt.includes("全等直角三角形") || prompt.includes("直角边分别");
    let desc1 = "", desc2 = "", desc3 = "";
    if (isTriangles) {
      const a = Number(prompt.match(/(\d+)\s*(?:米|厘米)?\s*和\s*(\d+)/)?.[1] || 8);
      const b = Number(prompt.match(/(\d+)\s*(?:米|厘米)?\s*和\s*(\d+)/)?.[2] || 6);
      const innerSide = Math.abs(a - b);
      const innerArea = innerSide * innerSide;
      desc1 = `4个直角三角形直角边: a ＝ ${a}, b ＝ ${b}`;
      desc2 = `中间小正方形边长: |a － b| ＝ |${a} － ${b}| ＝ ${innerSide}`;
      desc3 = isRevealed ? `中间小正方形面积 ＝ ${innerSide}² ＝ ${innerArea}` : `中间小正方形面积 ＝ ?`;
    } else {
      const l = Number(prompt.match(/长\s*(\d+)/)?.[1] || 5);
      const w = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 3);
      const diff = 4 * l * w;
      const innerSide = Math.abs(l - w);
      desc1 = `4个长方形: 长 ＝ ${l}, 宽 ＝ ${w}`;
      desc2 = `大正方形边长: ${l}＋${w} ＝ ${l+w}；小正方形边长: ${l}－${w} ＝ ${innerSide}`;
      desc3 = isRevealed ? `大正方形面积 － 小正方形面积 ＝ 4 × (${l} × ${w}) ＝ ${diff}` : `大正方形面积 － 小正方形面积 ＝ ?`;
    }

    // 绘制弦图 (外框大正方形与 4 块环绕图)
    const cx = 115, cy = 75, sz = 90;
    const outerSq = document.createElementNS(SVG_NS, "rect");
    outerSq.setAttribute("x", String(cx - sz / 2)); outerSq.setAttribute("y", String(cy - sz / 2));
    outerSq.setAttribute("width", String(sz)); outerSq.setAttribute("height", String(sz));
    outerSq.setAttribute("fill", "rgba(56, 189, 248, 0.2)");
    outerSq.setAttribute("stroke", "#38bdf8"); outerSq.setAttribute("stroke-width", "2");
    svg.append(outerSq);

    // 内部小正方形空洞
    const isz = sz * 0.35;
    const innerSq = document.createElementNS(SVG_NS, "rect");
    innerSq.setAttribute("x", String(cx - isz / 2)); innerSq.setAttribute("y", String(cy - isz / 2));
    innerSq.setAttribute("width", String(isz)); innerSq.setAttribute("height", String(isz));
    innerSq.setAttribute("fill", "rgba(15, 23, 42, 0.95)");
    innerSq.setAttribute("stroke", "#f59e0b"); innerSq.setAttribute("stroke-width", "1.5");
    innerSq.setAttribute("stroke-dasharray", "3 2");
    svg.append(innerSq);

    const holeText = document.createElementNS(SVG_NS, "text");
    holeText.setAttribute("x", String(cx)); holeText.setAttribute("y", String(cy + 4));
    holeText.setAttribute("text-anchor", "middle"); holeText.setAttribute("font-size", "10");
    holeText.setAttribute("font-weight", "bold"); holeText.setAttribute("fill", "#f59e0b");
    holeText.textContent = "孔洞";
    svg.append(holeText);

    // 4 块旋转分界线
    const lines = [
      [cx - sz / 2, cy - isz / 2, cx - isz / 2, cy - isz / 2],
      [cx + isz / 2, cy - sz / 2, cx + isz / 2, cy - isz / 2],
      [cx + sz / 2, cy + isz / 2, cx + isz / 2, cy + isz / 2],
      [cx - isz / 2, cy + sz / 2, cx - isz / 2, cy + isz / 2]
    ];
    lines.forEach(([x1, y1, x2, y2]) => {
      const l = document.createElementNS(SVG_NS, "line");
      l.setAttribute("x1", String(x1)); l.setAttribute("y1", String(y1));
      l.setAttribute("x2", String(x2)); l.setAttribute("y2", String(y2));
      l.setAttribute("stroke", "#38bdf8"); l.setAttribute("stroke-width", "1.5");
      svg.append(l);
    });

    // 右侧公式说明
    const rx = 210;
    const t1 = document.createElementNS(SVG_NS, "text");
    t1.setAttribute("x", String(rx)); t1.setAttribute("y", "42");
    t1.setAttribute("font-size", "11"); t1.setAttribute("font-weight", "bold"); t1.setAttribute("fill", "#38bdf8");
    t1.textContent = desc1; svg.append(t1);

    const t2 = document.createElementNS(SVG_NS, "text");
    t2.setAttribute("x", String(rx)); t2.setAttribute("y", "72");
    t2.setAttribute("font-size", "11"); t2.setAttribute("font-weight", "bold"); t2.setAttribute("fill", "#f59e0b");
    t2.textContent = desc2; svg.append(t2);

    const t3 = document.createElementNS(SVG_NS, "text");
    t3.setAttribute("x", String(rx)); t3.setAttribute("y", "108");
    t3.setAttribute("font-size", "12"); t3.setAttribute("font-weight", "bold"); t3.setAttribute("fill", "#22c55e");
    t3.textContent = desc3; svg.append(t3);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 赵爽弦图核心模型：四个全等多边形环绕旋转形成大正方形，中心留出正方形孔洞；大正方形与小正方形面积之差严格等于 4 个拼接图形的面积之和！";
    card.append(legend);
    return card;
  }

  // 模型 2：长方形内点 P 对顶三角形模型
  if (isPointPTriangles) {
    const l = Number(prompt.match(/长\s*(\d+)/)?.[1] || 18);
    const w = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 12);
    const givenSum = Number(prompt.match(/面积和为\s*(\d+)/)?.[1] || 80);
    const totalArea = l * w;
    const otherSum = totalArea - givenSum;

    const rx = 35, ry = 25, rw = 160, rh = 100;
    const px = rx + rw * 0.45, py = ry + rh * 0.55;

    // 上三角形
    const topTri = document.createElementNS(SVG_NS, "polygon");
    topTri.setAttribute("points", `${rx},${ry} ${rx+rw},${ry} ${px},${py}`);
    topTri.setAttribute("fill", "rgba(56, 189, 248, 0.28)"); topTri.setAttribute("stroke", "#38bdf8");
    svg.append(topTri);

    // 下三角形
    const btmTri = document.createElementNS(SVG_NS, "polygon");
    btmTri.setAttribute("points", `${rx},${ry+rh} ${rx+rw},${ry+rh} ${px},${py}`);
    btmTri.setAttribute("fill", "rgba(56, 189, 248, 0.28)"); btmTri.setAttribute("stroke", "#38bdf8");
    svg.append(btmTri);

    // 左三角形
    const leftTri = document.createElementNS(SVG_NS, "polygon");
    leftTri.setAttribute("points", `${rx},${ry} ${rx},${ry+rh} ${px},${py}`);
    leftTri.setAttribute("fill", "rgba(245, 158, 11, 0.28)"); leftTri.setAttribute("stroke", "#f59e0b");
    svg.append(leftTri);

    // 右三角形
    const rightTri = document.createElementNS(SVG_NS, "polygon");
    rightTri.setAttribute("points", `${rx+rw},${ry} ${rx+rw},${ry+rh} ${px},${py}`);
    rightTri.setAttribute("fill", "rgba(245, 158, 11, 0.28)"); rightTri.setAttribute("stroke", "#f59e0b");
    svg.append(rightTri);

    // 顶点 P
    const pDot = document.createElementNS(SVG_NS, "circle");
    pDot.setAttribute("cx", String(px)); pDot.setAttribute("cy", String(py));
    pDot.setAttribute("r", "4"); pDot.setAttribute("fill", "#ffffff");
    svg.append(pDot);

    const pText = document.createElementNS(SVG_NS, "text");
    pText.setAttribute("x", String(px + 8)); pText.setAttribute("y", String(py - 4));
    pText.setAttribute("font-size", "11"); pText.setAttribute("font-weight", "bold"); pText.setAttribute("fill", "#ffffff");
    pText.textContent = "P"; svg.append(pText);

    // 右侧公式说明
    const fx = 215;
    const t1 = document.createElementNS(SVG_NS, "text");
    t1.setAttribute("x", String(fx)); t1.setAttribute("y", "38");
    t1.setAttribute("font-size", "11"); t1.setAttribute("font-weight", "bold"); t1.setAttribute("fill", "#38bdf8");
    t1.textContent = `长方形总面积 ＝ ${l} × ${w} ＝ ${totalArea} 平方米`;
    svg.append(t1);

    const t2 = document.createElementNS(SVG_NS, "text");
    t2.setAttribute("x", String(fx)); t2.setAttribute("y", "66");
    t2.setAttribute("font-size", "11"); t2.setAttribute("font-weight", "bold"); t2.setAttribute("fill", "#38bdf8");
    t2.textContent = `已知上下对顶面积和 S(上)＋S(下) ＝ ${givenSum}`;
    svg.append(t2);

    const t3 = document.createElementNS(SVG_NS, "text");
    t3.setAttribute("x", String(fx)); t3.setAttribute("y", "94");
    t3.setAttribute("font-size", "11"); t3.setAttribute("font-weight", "bold"); t3.setAttribute("fill", "#f59e0b");
    t3.textContent = `对顶面积和恒等定理: 上下和 ＋ 左右和 ＝ 总面积`;
    svg.append(t3);

    const t4 = document.createElementNS(SVG_NS, "text");
    t4.setAttribute("x", String(fx)); t4.setAttribute("y", "124");
    t4.setAttribute("font-size", "12"); t4.setAttribute("font-weight", "bold"); t4.setAttribute("fill", "#22c55e");
    t4.textContent = isRevealed ? `S(左)＋S(右) ＝ ${totalArea} － ${givenSum} ＝ ${otherSum} 平方米` : `S(左)＋S(右) ＝ ${totalArea} － ${givenSum} ＝ ?`;
    svg.append(t4);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 矩形内点定理：长方形内部任意一点连接四个顶点，对顶两三角形面积之和恒等于长方形总面积的一半！";
    card.append(legend);
    return card;
  }

  // 模型 3：中心挖孔与环形阴影
  if (isHoleCutout) {
    const isTriHole = prompt.includes("直角三角形");
    const fx = 215;

    if (isTriHole) {
      const outerLeg = Number(prompt.match(/直角边为\s*(\d+)/)?.[1] || 10);
      const innerLeg = Number(prompt.match(/直角边为\s*(\d+).*?孔洞/)?.[1] || 4);
      const outerArea = (outerLeg * outerLeg) / 2;
      const innerArea = (innerLeg * innerLeg) / 2;
      const shadeArea = outerArea - innerArea;

      // 外大三角形
      const ox = 40, oy = 125, sz = 100;
      const triOuter = document.createElementNS(SVG_NS, "polygon");
      triOuter.setAttribute("points", `${ox},${oy} ${ox+sz},${oy} ${ox},${oy-sz}`);
      triOuter.setAttribute("fill", "rgba(56, 189, 248, 0.25)");
      triOuter.setAttribute("stroke", "#38bdf8"); triOuter.setAttribute("stroke-width", "2");
      svg.append(triOuter);

      // 内挖孔小三角形
      const isz = sz * (innerLeg / outerLeg);
      const triInner = document.createElementNS(SVG_NS, "polygon");
      triInner.setAttribute("points", `${ox},${oy} ${ox+isz},${oy} ${ox},${oy-isz}`);
      triInner.setAttribute("fill", "rgba(15, 23, 42, 0.95)");
      triInner.setAttribute("stroke", "#f59e0b"); triInner.setAttribute("stroke-width", "1.5");
      triInner.setAttribute("stroke-dasharray", "3 2");
      svg.append(triInner);

      const f1 = document.createElementNS(SVG_NS, "text");
      f1.setAttribute("x", String(fx)); f1.setAttribute("y", "42");
      f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
      f1.textContent = `外等腰直角三角形: 10 × 10 ÷ 2 ＝ ${outerArea}`;
      svg.append(f1);

      const f2 = document.createElementNS(SVG_NS, "text");
      f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
      f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
      f2.textContent = `内等腰直角孔洞: 4 × 4 ÷ 2 ＝ ${innerArea}`;
      svg.append(f2);

      const f3 = document.createElementNS(SVG_NS, "text");
      f3.setAttribute("x", String(fx)); f3.setAttribute("y", "108");
      f3.setAttribute("font-size", "12"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#22c55e");
      f3.textContent = isRevealed ? `环形阴影面积 ＝ ${outerArea} － ${innerArea} ＝ ${shadeArea} 平方厘米` : `环形阴影面积 ＝ ?`;
      svg.append(f3);
    } else {
      const outerSide = Number(prompt.match(/边长\s*(\d+)/)?.[1] || 12);
      const holeL = Number(prompt.match(/长\s*(\d+)/)?.[1] || (prompt.match(/边长\s*(\d+).*?小正方形/)?.[1] || 6));
      const holeW = Number(prompt.match(/宽\s*(\d+)/)?.[1] || (prompt.match(/边长\s*(\d+).*?小正方形/)?.[1] || 4));
      const outerArea = outerSide * outerSide;
      const holeArea = holeL * holeW;
      const remainArea = question.answer ? Number(question.answer) : (outerArea - holeArea);

      // 外正方形
      const ox = 45, oy = 25, sz = 100;
      const sqOuter = document.createElementNS(SVG_NS, "rect");
      sqOuter.setAttribute("x", String(ox)); sqOuter.setAttribute("y", String(oy));
      sqOuter.setAttribute("width", String(sz)); sqOuter.setAttribute("height", String(sz));
      sqOuter.setAttribute("fill", "rgba(56, 189, 248, 0.25)");
      sqOuter.setAttribute("stroke", "#38bdf8"); sqOuter.setAttribute("stroke-width", "2");
      svg.append(sqOuter);

      // 中心减重孔
      const hw = sz * (holeL / outerSide) * 0.7;
      const hh = sz * (holeW / outerSide) * 0.7;
      const hx = ox + (sz - hw) / 2, hy = oy + (sz - hh) / 2;
      const holeRect = document.createElementNS(SVG_NS, "rect");
      holeRect.setAttribute("x", String(hx)); holeRect.setAttribute("y", String(hy));
      holeRect.setAttribute("width", String(hw)); holeRect.setAttribute("height", String(hh));
      holeRect.setAttribute("fill", "rgba(15, 23, 42, 0.95)");
      holeRect.setAttribute("stroke", "#f59e0b"); holeRect.setAttribute("stroke-width", "1.5");
      holeRect.setAttribute("stroke-dasharray", "3 2");
      svg.append(holeRect);

      const f1 = document.createElementNS(SVG_NS, "text");
      f1.setAttribute("x", String(fx)); f1.setAttribute("y", "42");
      f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
      f1.textContent = `外正方形面积: ${outerSide} × ${outerSide} ＝ ${outerArea}`;
      svg.append(f1);

      const f2 = document.createElementNS(SVG_NS, "text");
      f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
      f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
      f2.textContent = `中心挖去孔洞: ${holeL} × ${holeW} ＝ ${holeArea}`;
      svg.append(f2);

      const f3 = document.createElementNS(SVG_NS, "text");
      f3.setAttribute("x", String(fx)); f3.setAttribute("y", "108");
      f3.setAttribute("font-size", "12"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#22c55e");
      f3.textContent = isRevealed ? `剩余阴影面积 ＝ ${outerArea} － ${holeArea} ＝ ${remainArea} 平方米` : `剩余面积 ＝ ?`;
      svg.append(f3);
    }

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 挖孔阴影模型：复合图形求阴影/剩余面积，采用整体减空白思想，阴影面积 ＝ 外围总面积 － 挖去孔洞面积。";
    card.append(legend);
    return card;
  }

  // 模型 4：剪角与挖槽周长转化
  if (isPerimeterCornerCut) {
    const l = Number(prompt.match(/长\s*(\d+)/)?.[1] || 20);
    const w = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 12);
    const origC = (l + w) * 2;
    const notchMatch = prompt.match(/宽\s*(\d+)\s*(?:米|厘米|分米|m|cm|dm)?(?:的)?凹槽/) || prompt.match(/凹槽.*?宽\s*(\d+)/);
    const notchD = Number(notchMatch?.[1] || 2);
    const addedC = notchD * 2;
    const newC = origC + addedC;

    const fx = 215;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `原长方形周长: (${l} ＋ ${w}) × 2 ＝ ${origC} 米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "70");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `四角剪正方形: 平移等长外推，周长守恒不变 (+0)`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "100");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#ec4899");
    f3.textContent = `内挖凹槽: 新增 2 条垂直深度边 (＋2 × ${notchD} ＝ ＋${addedC})`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "130");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `新图形周长 ＝ ${origC} ＋ ${addedC} ＝ ${newC} 米` : `新图形周长 ＝ ?`;
    svg.append(f4);

    // 绘制剪角凹槽示意图
    const ox = 35, oy = 35, ow = 140, oh = 80, cSz = 14, nW = 24, nD = 14;
    const pathD = `
      M ${ox + cSz} ${oy}
      L ${ox + ow / 2 - nW / 2} ${oy}
      L ${ox + ow / 2 - nW / 2} ${oy + nD}
      L ${ox + ow / 2 + nW / 2} ${oy + nD}
      L ${ox + ow / 2 + nW / 2} ${oy}
      L ${ox + ow - cSz} ${oy}
      L ${ox + ow - cSz} ${oy + cSz}
      L ${ox + ow} ${oy + cSz}
      L ${ox + ow} ${oy + oh - cSz}
      L ${ox + ow - cSz} ${oy + oh - cSz}
      L ${ox + ow - cSz} ${oy + oh}
      L ${ox + cSz} ${oy + oh}
      L ${ox + cSz} ${oy + oh - cSz}
      L ${ox} ${oy + oh - cSz}
      L ${ox} ${oy + cSz}
      L ${ox + cSz} ${oy + cSz}
      Z
    `;
    const cutPath = document.createElementNS(SVG_NS, "path");
    cutPath.setAttribute("d", pathD.replace(/\s+/g, " ").trim());
    cutPath.setAttribute("fill", "rgba(56, 189, 248, 0.2)");
    cutPath.setAttribute("stroke", "#38bdf8"); cutPath.setAttribute("stroke-width", "2");
    svg.append(cutPath);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 剪角与挖槽周长规律：角上剪去矩形，外推平移周长保持不变；边上向内挖凹槽，周长增加 2 条凹槽深度垂直边！";
    card.append(legend);
    return card;
  }

  // 模型 5：直角梯形垂线分割
  if (isTrapezoidAltitudeDecomp) {
    const top = Number(prompt.match(/上底\s*(\d+)/)?.[1] || 4);
    const btm = Number(prompt.match(/下底\s*(\d+)/)?.[1] || 7);
    const h = Number(prompt.match(/高\s*(\d+)/)?.[1] || 6);
    const triBase = btm - top;
    const triArea = (triBase * h) / 2;

    const ox = 40, oy = 35, ow = 130, oh = 85;
    const tx = ow * (top / btm);

    const poly = document.createElementNS(SVG_NS, "polygon");
    poly.setAttribute("points", `${ox},${oy} ${ox+tx},${oy} ${ox+ow},${oy+oh} ${ox},${oy+oh}`);
    poly.setAttribute("fill", "rgba(168, 85, 247, 0.15)");
    poly.setAttribute("stroke", "#c084fc"); poly.setAttribute("stroke-width", "2");
    svg.append(poly);

    // 垂直辅助线
    const altLine = document.createElementNS(SVG_NS, "line");
    altLine.setAttribute("x1", String(ox + tx)); altLine.setAttribute("y1", String(oy));
    altLine.setAttribute("x2", String(ox + tx)); altLine.setAttribute("y2", String(oy + oh));
    altLine.setAttribute("stroke", "#f59e0b"); altLine.setAttribute("stroke-width", "2");
    altLine.setAttribute("stroke-dasharray", "4 3");
    svg.append(altLine);

    // 三角形填充
    const tri = document.createElementNS(SVG_NS, "polygon");
    tri.setAttribute("points", `${ox+tx},${oy} ${ox+ow},${oy+oh} ${ox+tx},${oy+oh}`);
    tri.setAttribute("fill", "rgba(56, 189, 248, 0.3)");
    svg.append(tri);

    const fx = 205;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "42");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#c084fc");
    f1.textContent = `梯形参数: 上底 ＝ ${top}, 下底 ＝ ${btm}, 高 ＝ ${h}`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `作垂直高辅助线: 分割出矩形 (${top}×${h}) 与直角三角形`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "102");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#38bdf8");
    f3.textContent = `直角三角形底 ＝ 下底 － 上底 ＝ ${btm} － ${top} ＝ ${triBase} 米`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "132");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `三角形面积 ＝ ${triBase} × ${h} ÷ 2 ＝ ${triArea} 平方米` : `三角形面积 ＝ ?`;
    svg.append(f4);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 梯形割补模型：沿直角梯形上底端点作高，将其精准解构为一个长方形和一个直角三角形，化繁为简。";
    card.append(legend);
    return card;
  }

  // 模型 6：两端拼接 / 组合图形
  if (isAttachedComposite) {
    const isPlatform = prompt.includes("两端各拼接");
    const fx = 210;

    if (isPlatform) {
      const l = Number(prompt.match(/长\s*(\d+)/)?.[1] || 16);
      const w = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 10);
      const th = Number(prompt.match(/高(?:为)?\s*(\d+)/)?.[1] || 5);
      const rectArea = l * w;
      const triArea = (w * th) / 2;
      const totalArea = rectArea + 2 * triArea;

      const f1 = document.createElementNS(SVG_NS, "text");
      f1.setAttribute("x", String(fx)); f1.setAttribute("y", "42");
      f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
      f1.textContent = `中间长方形: ${l} × ${w} ＝ ${rectArea}`;
      svg.append(f1);

      const f2 = document.createElementNS(SVG_NS, "text");
      f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
      f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
      f2.textContent = `两端各1个三角形: 2 × (${w} × ${th} ÷ 2) ＝ ${2 * triArea}`;
      svg.append(f2);

      const f3 = document.createElementNS(SVG_NS, "text");
      f3.setAttribute("x", String(fx)); f3.setAttribute("y", "108");
      f3.setAttribute("font-size", "12"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#22c55e");
      f3.textContent = isRevealed ? `平台总面积 ＝ ${rectArea} ＋ ${2 * triArea} ＝ ${totalArea} 平方米` : `总面积 ＝ ?`;
      svg.append(f3);
    } else {
      const nums = cleanNums;
      const s1 = (nums[0] || 8) * (nums[1] || 6);
      const s2 = (nums[2] || 4) * (nums[3] || 4);
      const total = question.answer || (s1 + s2);

      const f1 = document.createElementNS(SVG_NS, "text");
      f1.setAttribute("x", String(fx)); f1.setAttribute("y", "50");
      f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
      f1.textContent = `分块 1 面积 ＝ ${s1}`;
      svg.append(f1);

      const f2 = document.createElementNS(SVG_NS, "text");
      f2.setAttribute("x", String(fx)); f2.setAttribute("y", "80");
      f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
      f2.textContent = `分块 2 面积 ＝ ${s2}`;
      svg.append(f2);

      const f3 = document.createElementNS(SVG_NS, "text");
      f3.setAttribute("x", String(fx)); f3.setAttribute("y", "115");
      f3.setAttribute("font-size", "12"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#22c55e");
      f3.textContent = isRevealed ? `组合总面积 ＝ ${s1} ＋ ${s2} ＝ ${total}` : `组合总面积 ＝ ?`;
      svg.append(f3);
    }

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 复合拼接模型：复杂多边形采用分块求和策略，分别计算各独立图形面积并相加。";
    card.append(legend);
    return card;
  }

  // 模型 7：正方形内切圆四角余料
  if (isInscribedCircleExcess) {
    const side = Number(prompt.match(/边长(?:为)?\s*(\d+)/)?.[1] || 10);
    const r = side / 2;
    const sqArea = side * side;
    const cirArea = Math.round(3.14 * r * r * 100) / 100;
    const excess = Math.round((sqArea - cirArea) * 100) / 100;

    const ox = 50, oy = 25, sz = 100;
    const sq = document.createElementNS(SVG_NS, "rect");
    sq.setAttribute("x", String(ox)); sq.setAttribute("y", String(oy));
    sq.setAttribute("width", String(sz)); sq.setAttribute("height", String(sz));
    sq.setAttribute("fill", "rgba(245, 158, 11, 0.35)"); sq.setAttribute("stroke", "#f59e0b"); sq.setAttribute("stroke-width", "2");
    svg.append(sq);

    const cir = document.createElementNS(SVG_NS, "circle");
    cir.setAttribute("cx", String(ox + sz / 2)); cir.setAttribute("cy", String(oy + sz / 2));
    cir.setAttribute("r", String(sz / 2));
    cir.setAttribute("fill", "rgba(15, 23, 42, 0.95)"); cir.setAttribute("stroke", "#38bdf8"); cir.setAttribute("stroke-width", "2");
    svg.append(cir);

    const fx = 195;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "42");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#f59e0b");
    f1.textContent = `正方形面积: ${side} × ${side} ＝ ${sqArea}`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#38bdf8");
    f2.textContent = `内切圆面积: π × r² ＝ 3.14 × ${r}² ＝ ${cirArea}`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "108");
    f3.setAttribute("font-size", "12"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#22c55e");
    f3.textContent = isRevealed ? `四角余料面积 ＝ ${sqArea} － ${cirArea} ＝ ${excess} 平方厘米` : `余料总面积 ＝ ?`;
    svg.append(f3);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 割补几何：正方形内切圆四角余料面积 ＝ 正方形总面积 － 内切圆面积。";
    card.append(legend);
    return card;
  }

  // 模型 8：长方形剪单角周长守恒
  if (isSingleCornerCutPerimeter) {
    const l = Number(prompt.match(/长\s*(\d+)/)?.[1] || 18);
    const w = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 10);
    const cut = Number(prompt.match(/边长(?:为)?\s*(\d+)/)?.[1] || 3);
    const origC = (l + w) * 2;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `原长方形周长: (${l} ＋ ${w}) × 2 ＝ ${origC} 厘米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `剪去边长 ${cut} 厘米小角: 切口凹入两条垂直边`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `平移等价原理: 凹入直角边外推等同原直角 (+0)`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `剩下图形周长 ＝ ${origC} 厘米 (周长守恒)` : `剩下图形周长 ＝ ?`;
    svg.append(f4);

    const ox = 30, oy = 35, ow = 140, oh = 85, cSz = 24;
    const cutPoly = document.createElementNS(SVG_NS, "polygon");
    cutPoly.setAttribute("points", `${ox},${oy} ${ox+ow-cSz},${oy} ${ox+ow-cSz},${oy+cSz} ${ox+ow},${oy+cSz} ${ox+ow},${oy+oh} ${ox},${oy+oh}`);
    cutPoly.setAttribute("fill", "rgba(56, 189, 248, 0.2)");
    cutPoly.setAttribute("stroke", "#38bdf8"); cutPoly.setAttribute("stroke-width", "2");
    svg.append(cutPoly);

    const dashBox = document.createElementNS(SVG_NS, "polygon");
    dashBox.setAttribute("points", `${ox+ow-cSz},${oy} ${ox+ow},${oy} ${ox+ow},${oy+cSz} ${ox+ow-cSz},${oy+cSz}`);
    dashBox.setAttribute("fill", "rgba(245, 158, 11, 0.15)");
    dashBox.setAttribute("stroke", "#f59e0b"); dashBox.setAttribute("stroke-width", "1.5");
    dashBox.setAttribute("stroke-dasharray", "3 2");
    svg.append(dashBox);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 剪角周长守恒模型：从长方形任意一角剪去小矩形，凹入的横竖两边向外平移后恰好复原原直角，周长完全不变！";
    card.append(legend);
    return card;
  }

  // 模型 9：阶梯多边形平移周长
  if (isStaircasePerimeter) {
    const horiz = Number(prompt.match(/横向总长\s*(\d+)/)?.[1] || 16);
    const vert = Number(prompt.match(/竖向总高\s*(\d+)/)?.[1] || 12);
    const c = (horiz + vert) * 2;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `横向台阶线段总长 ＝ 底边长 ＝ ${horiz} 米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `竖向台阶线段总高 ＝ 左侧高 ＝ ${vert} 米`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `平移投影等价原理: 阶梯外周长 ＝ 外接矩形周长`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `外周长 C ＝ (${horiz} ＋ ${vert}) × 2 ＝ ${c} 米` : `外周长 C ＝ ?`;
    svg.append(f4);

    const ox = 35, oy = 35, ow = 130, oh = 85;
    const stepPath = document.createElementNS(SVG_NS, "path");
    stepPath.setAttribute("d", `M ${ox} ${oy+oh} L ${ox+ow} ${oy+oh} L ${ox+ow} ${oy+oh*0.66} L ${ox+ow*0.66} ${oy+oh*0.66} L ${ox+ow*0.66} ${oy+oh*0.33} L ${ox+ow*0.33} ${oy+oh*0.33} L ${ox+ow*0.33} ${oy} L ${ox} ${oy} Z`);
    stepPath.setAttribute("fill", "rgba(56, 189, 248, 0.2)");
    stepPath.setAttribute("stroke", "#38bdf8"); stepPath.setAttribute("stroke-width", "2");
    svg.append(stepPath);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 阶梯周长投影模型：所有横向台阶线段向下平移等于底长，所有竖向台阶线段向左平移等于总高，周长等价于 (总长 + 总高) × 2。";
    card.append(legend);
    return card;
  }

  // 模型 10：平行短边剪开增加两个切口
  if (isCutRectPerimeterIncrease) {
    const l = Number(prompt.match(/长\s*(\d+)/)?.[1] || 14);
    const w = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 6);
    const increase = w * 2;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "42");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `原长方形尺寸: 长 ＝ ${l} 厘米, 宽 ＝ ${w} 厘米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "74");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `沿平行于短边剪开: 切口形成 2 条全新短边 (+2 × 宽)`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "112");
    f3.setAttribute("font-size", "12"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#22c55e");
    f3.textContent = isRevealed ? `两小长方形周长和比原长方形多 ＝ 2 × ${w} ＝ ${increase} 厘米` : `增加周长 ＝ ?`;
    svg.append(f3);

    const ox = 30, oy = 40, rw = 65, rh = 70, gap = 12;
    const r1 = document.createElementNS(SVG_NS, "rect");
    r1.setAttribute("x", String(ox)); r1.setAttribute("y", String(oy));
    r1.setAttribute("width", String(rw)); r1.setAttribute("height", String(rh));
    r1.setAttribute("fill", "rgba(56, 189, 248, 0.2)");
    r1.setAttribute("stroke", "#38bdf8"); r1.setAttribute("stroke-width", "2");
    svg.append(r1);

    const r2 = document.createElementNS(SVG_NS, "rect");
    r2.setAttribute("x", String(ox + rw + gap)); r2.setAttribute("y", String(oy));
    r2.setAttribute("width", String(rw)); r2.setAttribute("height", String(rh));
    r2.setAttribute("fill", "rgba(56, 189, 248, 0.2)");
    r2.setAttribute("stroke", "#38bdf8"); r2.setAttribute("stroke-width", "2");
    svg.append(r2);

    const cutL = document.createElementNS(SVG_NS, "line");
    cutL.setAttribute("x1", String(ox + rw + gap/2)); cutL.setAttribute("y1", String(oy - 8));
    cutL.setAttribute("x2", String(ox + rw + gap/2)); cutL.setAttribute("y2", String(oy + rh + 8));
    cutL.setAttribute("stroke", "#ef4444"); cutL.setAttribute("stroke-width", "2");
    cutL.setAttribute("stroke-dasharray", "4 3");
    svg.append(cutL);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 剪开增边模型：将多边形一刀切开为两个图形，原边界保持不变，但切口处会产生 2 条全新重叠边，周长增加量 ＝ 2 × 切口长度。";
    card.append(legend);
    return card;
  }

  // 模型 11：正方形井字分割周长总和
  if (isSplitRectGridPerimeter) {
    const totalC = Number(prompt.match(/总和(?:是)?\s*(\d+)/)?.[1] || 240);
    const side = Math.round(totalC / 16);
    const fx = 205;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `3 横 3 竖等分大正方形: 形成 4 × 4 ＝ 16 个小长方形`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `内部切线重复计算: 横向 8 边 + 竖向 8 边 ＝ 16 边长`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `总周长关系: 16 × 正方形边长 a ＝ ${totalC} 厘米`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `大正方形边长 a ＝ ${totalC} ÷ 16 ＝ ${side} 厘米` : `大正方形边长 a ＝ ?`;
    svg.append(f4);

    const ox = 35, oy = 30, sz = 90;
    const sq = document.createElementNS(SVG_NS, "rect");
    sq.setAttribute("x", String(ox)); sq.setAttribute("y", String(oy));
    sq.setAttribute("width", String(sz)); sq.setAttribute("height", String(sz));
    sq.setAttribute("fill", "rgba(56, 189, 248, 0.15)");
    sq.setAttribute("stroke", "#38bdf8"); sq.setAttribute("stroke-width", "2");
    svg.append(sq);

    for (let i = 1; i < 4; i++) {
      const glH = document.createElementNS(SVG_NS, "line");
      glH.setAttribute("x1", String(ox)); glH.setAttribute("y1", String(oy + (sz/4)*i));
      glH.setAttribute("x2", String(ox + sz)); glH.setAttribute("y2", String(oy + (sz/4)*i));
      glH.setAttribute("stroke", "#f59e0b"); glH.setAttribute("stroke-width", "1.5");
      svg.append(glH);

      const glV = document.createElementNS(SVG_NS, "line");
      glV.setAttribute("x1", String(ox + (sz/4)*i)); glV.setAttribute("y1", String(oy));
      glV.setAttribute("x2", String(ox + (sz/4)*i)); glV.setAttribute("y2", String(oy + sz));
      glV.setAttribute("stroke", "#f59e0b"); glV.setAttribute("stroke-width", "1.5");
      svg.append(glV);
    }

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 网格切分周长模型：正方形被 3 横 3 竖均分时，所有横向边长总和等于 8 个大正方形边长，竖向亦然，总周长为 16a。";
    card.append(legend);
    return card;
  }

  // 模型 12：草坪十字交叉小路平移拼合
  if (isPathTranslationArea) {
    const l = Number(prompt.match(/长\s*(\d+)/)?.[1] || 20);
    const w = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 15);
    const roadW = Number(prompt.match(/宽\s*(\d+)\s*米的小路/)?.[1] || 2);
    const newL = l - roadW;
    const newW = w - roadW;
    const remArea = newL * newW;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `原草坪尺寸: 长 ＝ ${l} 米, 宽 ＝ ${w} 米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `平移转化策略: 横竖小路平移到边缘，4 块绿地拼合成矩形`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `拼成长方形长: ${l} － ${roadW} ＝ ${newL} 米, 宽: ${w} － ${roadW} ＝ ${newW} 米`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `绿地实际面积 ＝ ${newL} × ${newW} ＝ ${remArea} 平方米` : `绿地实际面积 ＝ ?`;
    svg.append(f4);

    const ox = 30, oy = 35, ow = 135, oh = 85, rw = 12;
    const lawn = document.createElementNS(SVG_NS, "rect");
    lawn.setAttribute("x", String(ox)); lawn.setAttribute("y", String(oy));
    lawn.setAttribute("width", String(ow)); lawn.setAttribute("height", String(oh));
    lawn.setAttribute("fill", "rgba(34, 197, 94, 0.25)");
    lawn.setAttribute("stroke", "#22c55e"); lawn.setAttribute("stroke-width", "2");
    svg.append(lawn);

    const roadH = document.createElementNS(SVG_NS, "rect");
    roadH.setAttribute("x", String(ox)); roadH.setAttribute("y", String(oy + (oh - rw) / 2));
    roadH.setAttribute("width", String(ow)); roadH.setAttribute("height", String(rw));
    roadH.setAttribute("fill", "rgba(148, 163, 184, 0.5)");
    svg.append(roadH);

    const roadV = document.createElementNS(SVG_NS, "rect");
    roadV.setAttribute("x", String(ox + (ow - rw) / 2)); roadV.setAttribute("y", String(oy));
    roadV.setAttribute("width", String(rw)); roadV.setAttribute("height", String(oh));
    roadV.setAttribute("fill", "rgba(148, 163, 184, 0.5)");
    svg.append(roadV);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 平移法求面积模型：十字交叉小路通过平移推至外侧边缘，原本分散的四片绿地合体为一个规则长方形，直接 (长-路宽) × (宽-路宽)。";
    card.append(legend);
    return card;
  }

  // 模型 13：三角形三边不等式支撑杆
  if (isTriangleInequality) {
    const a = Number(prompt.match(/(\d+)\s*米和\s*(\d+)/)?.[1] || 5);
    const b = Number(prompt.match(/(\d+)\s*米和\s*(\d+)/)?.[2] || 9);
    const minSide = Math.min(a, b);
    const maxSide = Math.max(a, b);
    const diff = maxSide - minSide;
    const sum = maxSide + minSide;
    const shortestInt = diff + 1;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `已知两边长: a ＝ ${minSide} 米, b ＝ ${maxSide} 米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `三角形三边不等式: 两边之差 ＜ 第三边 ＜ 两边之和`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `取值范围: ${maxSide} － ${minSide} ＜ c ＜ ${maxSide} ＋ ${minSide}  ⇒  ${diff} ＜ c ＜ ${sum}`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `最短整数杆长 ＝ ${diff} ＋ 1 ＝ ${shortestInt} 米` : `最短整数杆长 ＝ ?`;
    svg.append(f4);

    const ox = 35, oy = 110, ax = 145, ay = 110, bx = 65, by = 40;
    const lineB = document.createElementNS(SVG_NS, "line");
    lineB.setAttribute("x1", String(ox)); lineB.setAttribute("y1", String(oy));
    lineB.setAttribute("x2", String(ax)); lineB.setAttribute("y2", String(ay));
    lineB.setAttribute("stroke", "#38bdf8"); lineB.setAttribute("stroke-width", "3");
    svg.append(lineB);

    const lineA = document.createElementNS(SVG_NS, "line");
    lineA.setAttribute("x1", String(ox)); lineA.setAttribute("y1", String(oy));
    lineA.setAttribute("x2", String(bx)); lineA.setAttribute("y2", String(by));
    lineA.setAttribute("stroke", "#f59e0b"); lineA.setAttribute("stroke-width", "3");
    svg.append(lineA);

    const lineC = document.createElementNS(SVG_NS, "line");
    lineC.setAttribute("x1", String(bx)); lineC.setAttribute("y1", String(by));
    lineC.setAttribute("x2", String(ax)); lineC.setAttribute("y2", String(ay));
    lineC.setAttribute("stroke", "#22c55e"); lineC.setAttribute("stroke-width", "2");
    lineC.setAttribute("stroke-dasharray", "4 3");
    svg.append(lineC);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 三角形三边关系定理：两边之差 ＜ 第三边 ＜ 两边之和。若第三边为整数，最短取 (差 + 1)，最长取 (和 - 1)。";
    card.append(legend);
    return card;
  }

  // 模型 14：等腰三角形周长存在性判断
  if (isIsoscelesPerimeter) {
    const c = Number(prompt.match(/周长(?:是)?\s*(\d+)/)?.[1] || 20);
    const side = Number(prompt.match(/边长(?:是)?\s*(\d+)/)?.[1] || 4);
    const leg = (c - side) / 2;
    const fx = 205;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `等腰三角形周长: C ＝ 2 × 腰长 ＋ 底边 ＝ ${c}`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `三边存在性检验: 若腰长为 ${side}, 则底为 ${c - 2*side} (2×${side}＜${c - 2*side} 无法成三角形)`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `因此已知边 ${side} 必为底边: 两腰必须相等`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `腰长 ＝ (${c} － ${side}) ÷ 2 ＝ ${leg}` : `腰长 ＝ ?`;
    svg.append(f4);

    const ox = 30, oy = 115, w = 110, h = 80;
    const isoTri = document.createElementNS(SVG_NS, "polygon");
    isoTri.setAttribute("points", `${ox},${oy} ${ox+w},${oy} ${ox+w/2},${oy-h}`);
    isoTri.setAttribute("fill", "rgba(168, 85, 247, 0.2)");
    isoTri.setAttribute("stroke", "#a855f7"); isoTri.setAttribute("stroke-width", "2");
    svg.append(isoTri);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 等腰三角形周长规律：两腰长度必定相等，已知一条边必须结合三角形三边存在性定理判断是底边还是腰长。";
    card.append(legend);
    return card;
  }

  // 模型 15：三角形中线等底等高平分面积
  if (isMedianArea) {
    const isDoubleMid = prompt.includes("E 是 AD") || prompt.includes("E 是 AD 边中点");
    const fx = 210;

    if (isDoubleMid) {
      const totalArea = Number(prompt.match(/面积(?:为)?\s*(\d+)/)?.[1] || 48);
      const halfArea = totalArea / 2;
      const quarterArea = halfArea / 2;

      const f1 = document.createElementNS(SVG_NS, "text");
      f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
      f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
      f1.textContent = `原三角形 ABC 面积 ＝ ${totalArea} 平方厘米`;
      svg.append(f1);

      const f2 = document.createElementNS(SVG_NS, "text");
      f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
      f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
      f2.textContent = `D 是 BC 中点 ⇒ S(△ABD) ＝ ${totalArea} ÷ 2 ＝ ${halfArea}`;
      svg.append(f2);

      const f3 = document.createElementNS(SVG_NS, "text");
      f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
      f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
      f3.textContent = `E 是 AD 中点 ⇒ S(△ABE) ＝ S(△ABD) ÷ 2 ＝ ${quarterArea}`;
      svg.append(f3);

      const f4 = document.createElementNS(SVG_NS, "text");
      f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
      f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
      f4.textContent = isRevealed ? `三角形 ABE 面积 ＝ ${quarterArea} 平方厘米` : `三角形 ABE 面积 ＝ ?`;
      svg.append(f4);

      const ax = 75, ay = 30, bx = 25, by = 115, cx = 155, cy = 115;
      const dx = (bx + cx) / 2, dy = 115;
      const ex = (ax + dx) / 2, ey = (ay + dy) / 2;

      const triAll = document.createElementNS(SVG_NS, "polygon");
      triAll.setAttribute("points", `${ax},${ay} ${bx},${by} ${cx},${cy}`);
      triAll.setAttribute("fill", "rgba(56, 189, 248, 0.1)");
      triAll.setAttribute("stroke", "#38bdf8"); triAll.setAttribute("stroke-width", "2");
      svg.append(triAll);

      const triABE = document.createElementNS(SVG_NS, "polygon");
      triABE.setAttribute("points", `${ax},${ay} ${bx},${by} ${ex},${ey}`);
      triABE.setAttribute("fill", "rgba(34, 197, 94, 0.35)");
      triABE.setAttribute("stroke", "#22c55e"); triABE.setAttribute("stroke-width", "1.5");
      svg.append(triABE);

      const lineAD = document.createElementNS(SVG_NS, "line");
      lineAD.setAttribute("x1", String(ax)); lineAD.setAttribute("y1", String(ay));
      lineAD.setAttribute("x2", String(dx)); lineAD.setAttribute("y2", String(dy));
      lineAD.setAttribute("stroke", "#f59e0b"); lineAD.setAttribute("stroke-width", "1.5");
      lineAD.setAttribute("stroke-dasharray", "3 2");
      svg.append(lineAD);
    } else {
      const b = Number(prompt.match(/底边\s*(?:BC)?\s*长\s*(\d+)/)?.[1] || 12);
      const h = Number(prompt.match(/高(?:为)?\s*(\d+)/)?.[1] || 6);
      const totalArea = (b * h) / 2;
      const subArea = totalArea / 2;

      const f1 = document.createElementNS(SVG_NS, "text");
      f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
      f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
      f1.textContent = `全三角形 ABC 面积: ${b} × ${h} ÷ 2 ＝ ${totalArea} 平方厘米`;
      svg.append(f1);

      const f2 = document.createElementNS(SVG_NS, "text");
      f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
      f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
      f2.textContent = `中线 AD 平分底边: BD ＝ DC ＝ ${b / 2} 厘米 (等底等高)`;
      svg.append(f2);

      const f3 = document.createElementNS(SVG_NS, "text");
      f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
      f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
      f3.textContent = `中线等积性质: 任意三角形中线平分总面积`;
      svg.append(f3);

      const f4 = document.createElementNS(SVG_NS, "text");
      f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
      f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
      f4.textContent = isRevealed ? `三角形 ABD 面积 ＝ ${totalArea} ÷ 2 ＝ ${subArea} 平方厘米` : `三角形 ABD 面积 ＝ ?`;
      svg.append(f4);

      const ax = 75, ay = 30, bx = 25, by = 115, cx = 155, cy = 115;
      const dx = (bx + cx) / 2, dy = 115;

      const triAll = document.createElementNS(SVG_NS, "polygon");
      triAll.setAttribute("points", `${ax},${ay} ${bx},${by} ${cx},${cy}`);
      triAll.setAttribute("fill", "rgba(56, 189, 248, 0.1)");
      triAll.setAttribute("stroke", "#38bdf8"); triAll.setAttribute("stroke-width", "2");
      svg.append(triAll);

      const triABD = document.createElementNS(SVG_NS, "polygon");
      triABD.setAttribute("points", `${ax},${ay} ${bx},${by} ${dx},${dy}`);
      triABD.setAttribute("fill", "rgba(34, 197, 94, 0.35)");
      triABD.setAttribute("stroke", "#22c55e"); triABD.setAttribute("stroke-width", "1.5");
      svg.append(triABD);
    }

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 三角形中线等积模型：三角形中线将底边二等分，分割出的两个小三角形同高且底相等，因而面积恒相等！";
    card.append(legend);
    return card;
  }

  // 模型 16：菱形四边等长周长逆运算
  if (isRhombusPerimeter) {
    const c = Number(prompt.match(/周长(?:是)?\s*(\d+)/)?.[1] || 52);
    const side = c / 4;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "42");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `菱形几何性质: 四条边长全部相等 (a ＝ b ＝ c ＝ d)`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "74");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `周长计算公式: 周长 C ＝ 4 × 边长 a ＝ ${c} 米`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "112");
    f3.setAttribute("font-size", "12"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#22c55e");
    f3.textContent = isRevealed ? `一条边长 a ＝ ${c} ÷ 4 ＝ ${side} 米` : `边长 a ＝ ?`;
    svg.append(f3);

    const cx = 95, cy = 75, rx = 55, ry = 42;
    const rPoly = document.createElementNS(SVG_NS, "polygon");
    rPoly.setAttribute("points", `${cx},${cy-ry} ${cx+rx},${cy} ${cx},${cy+ry} ${cx-rx},${cy}`);
    rPoly.setAttribute("fill", "rgba(56, 189, 248, 0.2)");
    rPoly.setAttribute("stroke", "#38bdf8"); rPoly.setAttribute("stroke-width", "2");
    svg.append(rPoly);

    const t = document.createElementNS(SVG_NS, "text");
    t.setAttribute("x", String(cx)); t.setAttribute("y", String(cy + 5));
    t.setAttribute("text-anchor", "middle"); t.setAttribute("font-size", "12");
    t.setAttribute("font-weight", "bold"); t.setAttribute("fill", "#22c55e");
    t.textContent = `a = ${side}m`;
    svg.append(t);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 菱形周长模型：菱形四边等长，边长等于周长除以 4。";
    card.append(legend);
    return card;
  }

  // 模型 17：平行四边形半周长与相邻边
  if (isParallelogramPerimeter) {
    const c = Number(prompt.match(/周长(?:是)?\s*(\d+)/)?.[1] || 46);
    const a = Number(prompt.match(/边长(?:是)?\s*(\d+)/)?.[1] || 15);
    const halfC = c / 2;
    const b = halfC - a;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `平行四边形性质: 两组对边分别相等 (两边为 a 和 b)`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `半周长(邻边之和): a ＋ b ＝ ${c} ÷ 2 ＝ ${halfC} 米`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `已知邻边 a ＝ ${a} 米 ⇒ 另一邻边 b ＝ ${halfC} － ${a}`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `另一条边长 b ＝ ${b} 米` : `另一条边长 b ＝ ?`;
    svg.append(f4);

    const ox = 35, oy = 40, pw = 95, ph = 65, skew = 25;
    const pPoly = document.createElementNS(SVG_NS, "polygon");
    pPoly.setAttribute("points", `${ox+skew},${oy} ${ox+pw+skew},${oy} ${ox+pw},${oy+ph} ${ox},${oy+ph}`);
    pPoly.setAttribute("fill", "rgba(16, 185, 129, 0.2)");
    pPoly.setAttribute("stroke", "#10b981"); pPoly.setAttribute("stroke-width", "2");
    svg.append(pPoly);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 平行四边形周长模型：周长 ＝ (邻边 a + 邻边 b) × 2，已知周长和一边，用半周长减已知边即得相邻边。";
    card.append(legend);
    return card;
  }

  // 模型 18：梯形蝴蝶定理
  if (isTrapezoidButterfly) {
    const isSumGiven = prompt.includes("全梯形总面积为");
    const fx = 210;

    if (isSumGiven) {
      const topS = Number(prompt.match(/AOD\s*面积为\s*(\d+)/)?.[1] || 6);
      const btmS = Number(prompt.match(/BOC\s*面积为\s*(\d+)/)?.[1] || 12);
      const totalS = Number(prompt.match(/全梯形总面积为\s*(\d+)/)?.[1] || 32);
      const wingS = (totalS - topS - btmS) / 2;

      const f1 = document.createElementNS(SVG_NS, "text");
      f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
      f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
      f1.textContent = `梯形总面积: S ＝ ${totalS}, 上三角 S₁ ＝ ${topS}, 下三角 S₂ ＝ ${btmS}`;
      svg.append(f1);

      const f2 = document.createElementNS(SVG_NS, "text");
      f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
      f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
      f2.textContent = `梯形蝴蝶定理: 左右两翅面积严格相等 (S_左 ＝ S_右)`;
      svg.append(f2);

      const f3 = document.createElementNS(SVG_NS, "text");
      f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
      f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
      f3.textContent = `两翅面积之和: ${totalS} － ${topS} － ${btmS} ＝ ${totalS - topS - btmS} 平方厘米`;
      svg.append(f3);

      const f4 = document.createElementNS(SVG_NS, "text");
      f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
      f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
      f4.textContent = isRevealed ? `三角形 AOB(左翅) 面积 ＝ ${wingS} 平方厘米` : `三角形 AOB 面积 ＝ ?`;
      svg.append(f4);
    } else {
      const topS = Number(prompt.match(/两三角形面积分别为\s*(\d+)\s*和\s*(\d+)/)?.[1] || 4);
      const btmS = Number(prompt.match(/两三角形面积分别为\s*(\d+)\s*和\s*(\d+)/)?.[2] || 9);
      const wingS = Math.round(Math.sqrt(topS * btmS));

      const f1 = document.createElementNS(SVG_NS, "text");
      f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
      f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
      f1.textContent = `梯形对角线交于 O: 上底三角 S₁ ＝ ${topS}, 下底三角 S₂ ＝ ${btmS}`;
      svg.append(f1);

      const f2 = document.createElementNS(SVG_NS, "text");
      f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
      f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
      f2.textContent = `蝴蝶定理积相等: S_左 × S_右 ＝ S₁ × S₂ ＝ ${topS * btmS}`;
      svg.append(f2);

      const f3 = document.createElementNS(SVG_NS, "text");
      f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
      f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
      f3.textContent = `两翅对称等积: S_左 ＝ S_右 ＝ √(S₁ × S₂) ＝ √(${topS} × ${btmS})`;
      svg.append(f3);

      const f4 = document.createElementNS(SVG_NS, "text");
      f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
      f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
      f4.textContent = isRevealed ? `两翼三角形面积 ＝ ${wingS}` : `两翼三角形面积 ＝ ?`;
      svg.append(f4);
    }

    const ax = 55, ay = 35, dx = 115, dy = 35, bx = 25, by = 115, cx = 145, cy = 115;
    const ox = 85, oy = 72;

    const trap = document.createElementNS(SVG_NS, "polygon");
    trap.setAttribute("points", `${ax},${ay} ${dx},${dy} ${cx},${cy} ${bx},${by}`);
    trap.setAttribute("fill", "none"); trap.setAttribute("stroke", "#38bdf8"); trap.setAttribute("stroke-width", "2");
    svg.append(trap);

    const leftWing = document.createElementNS(SVG_NS, "polygon");
    leftWing.setAttribute("points", `${ax},${ay} ${bx},${by} ${ox},${oy}`);
    leftWing.setAttribute("fill", "rgba(245, 158, 11, 0.35)");
    leftWing.setAttribute("stroke", "#f59e0b"); leftWing.setAttribute("stroke-width", "1.5");
    svg.append(leftWing);

    const rightWing = document.createElementNS(SVG_NS, "polygon");
    rightWing.setAttribute("points", `${dx},${dy} ${cx},${cy} ${ox},${oy}`);
    rightWing.setAttribute("fill", "rgba(245, 158, 11, 0.35)");
    rightWing.setAttribute("stroke", "#f59e0b"); rightWing.setAttribute("stroke-width", "1.5");
    svg.append(rightWing);

    const d1 = document.createElementNS(SVG_NS, "line");
    d1.setAttribute("x1", String(ax)); d1.setAttribute("y1", String(ay));
    d1.setAttribute("x2", String(cx)); d1.setAttribute("y2", String(cy));
    d1.setAttribute("stroke", "#94a3b8"); d1.setAttribute("stroke-width", "1.5");
    svg.append(d1);

    const d2 = document.createElementNS(SVG_NS, "line");
    d2.setAttribute("x1", String(dx)); d2.setAttribute("y1", String(dy));
    d2.setAttribute("x2", String(bx)); d2.setAttribute("y2", String(by));
    d2.setAttribute("stroke", "#94a3b8"); d2.setAttribute("stroke-width", "1.5");
    svg.append(d2);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 梯形蝴蝶定理模型：梯形对角线相交形成的左右两个翅膀三角形面积恒等，且两翅面积之积等于上下两底三角形面积之积！";
    card.append(legend);
    return card;
  }

  // 模型 19：凸四边形对角线周长扣除
  if (isConvexQuadDiagonal) {
    const d = Number(prompt.match(/(\d+)\s*厘米的对角线/)?.[1] || 10);
    const c1 = Number(prompt.match(/周长分别为\s*(\d+)/)?.[1] || 25);
    const c2 = Number(prompt.match(/和\s*(\d+)/)?.[1] || 29);
    const totalC = c1 + c2 - 2 * d;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `两三角形周长: C₁ ＝ ${c1} 厘米, C₂ ＝ ${c2} 厘米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `对角线重叠共享: 两三角形周长和包含了 2 条对角线`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `四边形周长公式: C ＝ C₁ ＋ C₂ － 2 × 对角线 d`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `原四边形周长 ＝ ${c1} ＋ ${c2} － 2 × ${d} ＝ ${totalC} 厘米` : `原四边形周长 ＝ ?`;
    svg.append(f4);

    const p1x = 35, p1y = 75, p2x = 85, p2y = 30, p3x = 145, p3y = 75, p4x = 95, p4y = 120;
    const quad = document.createElementNS(SVG_NS, "polygon");
    quad.setAttribute("points", `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}`);
    quad.setAttribute("fill", "rgba(56, 189, 248, 0.15)");
    quad.setAttribute("stroke", "#38bdf8"); quad.setAttribute("stroke-width", "2");
    svg.append(quad);

    const diag = document.createElementNS(SVG_NS, "line");
    diag.setAttribute("x1", String(p1x)); diag.setAttribute("y1", String(p1y));
    diag.setAttribute("x2", String(p3x)); diag.setAttribute("y2", String(p3y));
    diag.setAttribute("stroke", "#f59e0b"); diag.setAttribute("stroke-width", "2");
    diag.setAttribute("stroke-dasharray", "4 3");
    svg.append(diag);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 凸四边形对角线周长扣除模型：内部对角线被两个分割三角形各自计算了一次（共 2 次），原多边形外周长等于两三角形周长之和减去 2 倍对角线长。";
    card.append(legend);
    return card;
  }

  // 模型 20：直角三角形和与斜边面积模型
  if (isRightTriAreaFromSum) {
    const sumLegs = Number(prompt.match(/直角边之和为\s*(\d+)/)?.[1] || 17);
    const hyp = Number(prompt.match(/斜边长\s*(\d+)/)?.[1] || 13);
    const area = (sumLegs * sumLegs - hyp * hyp) / 4;
    const fx = 205;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `两直角边 a ＋ b ＝ ${sumLegs}, 斜边 c ＝ ${hyp}`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `勾股定理: a² ＋ b² ＝ c² ＝ ${hyp}² ＝ ${hyp * hyp}`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `完全平方代数转化: (a＋b)² ＝ a²＋b²＋2ab ＝ c² ＋ 4S`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `直角三角形面积 S ＝ (${sumLegs}² － ${hyp}²) ÷ 4 ＝ ${area} 平方厘米` : `直角三角形面积 S ＝ ?`;
    svg.append(f4);

    const ox = 35, oy = 115, legA = 110, legB = 75;
    const rt = document.createElementNS(SVG_NS, "polygon");
    rt.setAttribute("points", `${ox},${oy} ${ox+legA},${oy} ${ox},${oy-legB}`);
    rt.setAttribute("fill", "rgba(56, 189, 248, 0.2)");
    rt.setAttribute("stroke", "#38bdf8"); rt.setAttribute("stroke-width", "2");
    svg.append(rt);

    const hypT = document.createElementNS(SVG_NS, "text");
    hypT.setAttribute("x", String(ox + legA/2 + 8)); hypT.setAttribute("y", String(oy - legB/2 - 4));
    hypT.setAttribute("font-size", "11"); hypT.setAttribute("fill", "#f59e0b"); hypT.textContent = `c = ${hyp}`;
    svg.append(hypT);

    const sqCorner = document.createElementNS(SVG_NS, "rect");
    sqCorner.setAttribute("x", String(ox)); sqCorner.setAttribute("y", String(oy - 12));
    sqCorner.setAttribute("width", "12"); sqCorner.setAttribute("height", "12");
    sqCorner.setAttribute("fill", "none"); sqCorner.setAttribute("stroke", "#38bdf8"); sqCorner.setAttribute("stroke-width", "1.5");
    svg.append(sqCorner);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 勾股弦图完全平方模型：(a+b)² = a² + b² + 2ab = c² + 4S，无需分别求出两直角边，直接由和的平方减斜边平方除以 4 即得面积！";
    card.append(legend);
    return card;
  }

  // 模型 21：平行四边形内任意点同底等高面积减半
  if (isParallelogramHalfArea) {
    const totalS = Number(prompt.match(/面积(?:为)?\s*(\d+)/)?.[1] || 60);
    const triS = totalS / 2;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `平行四边形 ABCD 面积 ＝ 底 × 高 ＝ ${totalS} 平方厘米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `E 为对边 CD 上任意点: 三角形 ABE 与四边形同底等高`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `同底等高面积定理: 三角形面积 ＝ 平行四边形面积 ÷ 2`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `三角形 ABE 面积 ＝ ${totalS} ÷ 2 ＝ ${triS} 平方厘米` : `三角形 ABE 面积 ＝ ?`;
    svg.append(f4);

    const ox = 30, oy = 40, pw = 95, ph = 65, skew = 25;
    const pPoly = document.createElementNS(SVG_NS, "polygon");
    pPoly.setAttribute("points", `${ox+skew},${oy} ${ox+pw+skew},${oy} ${ox+pw},${oy+ph} ${ox},${oy+ph}`);
    pPoly.setAttribute("fill", "rgba(56, 189, 248, 0.1)");
    pPoly.setAttribute("stroke", "#38bdf8"); pPoly.setAttribute("stroke-width", "2");
    svg.append(pPoly);

    const ex = ox + skew + 40, ey = oy;
    const triABE = document.createElementNS(SVG_NS, "polygon");
    triABE.setAttribute("points", `${ox},${oy+ph} ${ox+pw},${oy+ph} ${ex},${ey}`);
    triABE.setAttribute("fill", "rgba(34, 197, 94, 0.35)");
    triABE.setAttribute("stroke", "#22c55e"); triABE.setAttribute("stroke-width", "2");
    svg.append(triABE);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 同底等高面积模型：三角形与平行四边形共用同一直线底边且顶点在对边平行线上时，三角形面积恒等于平行四边形总面积的一半！";
    card.append(legend);
    return card;
  }

  // 模型 22：网格多边形整格与半格拼合
  if (isGridPolygonDecomp) {
    const full = Number(prompt.match(/(\d+)\s*个完整小方格/)?.[1] || 6);
    const half = Number(prompt.match(/(\d+)\s*个半格/)?.[1] || 4);
    const area = full * 1 + half * 0.5;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `完整方格: ${full} 个 × 1 平方厘米 ＝ ${full} 平方厘米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `斜角半格: ${half} 个 × 0.5 平方厘米 ＝ ${half * 0.5} 平方厘米`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `数格法面积模型: 总面积 ＝ 整格之和 ＋ 半格之和`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `多边形面积 ＝ ${full} ＋ ${half * 0.5} ＝ ${area} 平方厘米` : `多边形面积 ＝ ?`;
    svg.append(f4);

    const ox = 40, oy = 35, gSz = 25;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const cell = document.createElementNS(SVG_NS, "rect");
        cell.setAttribute("x", String(ox + c * gSz)); cell.setAttribute("y", String(oy + r * gSz));
        cell.setAttribute("width", String(gSz)); cell.setAttribute("height", String(gSz));
        cell.setAttribute("fill", "rgba(15, 23, 42, 0.4)");
        cell.setAttribute("stroke", "rgba(148, 163, 184, 0.3)"); cell.setAttribute("stroke-width", "1");
        svg.append(cell);
      }
    }

    const poly = document.createElementNS(SVG_NS, "polygon");
    poly.setAttribute("points", `${ox},${oy+gSz} ${ox+gSz*3},${oy} ${ox+gSz*4},${oy+gSz*2} ${ox+gSz*2},${oy+gSz*3} ${ox},${oy+gSz*2}`);
    poly.setAttribute("fill", "rgba(56, 189, 248, 0.3)");
    poly.setAttribute("stroke", "#38bdf8"); poly.setAttribute("stroke-width", "2");
    svg.append(poly);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 网格数格法：规则多边形在方格纸上直接统计完整方格数与半格数，整格每格为 1，半格每格为 0.5。";
    card.append(legend);
    return card;
  }

  // 模型 23：正方形割补旋转 1/4 面积
  if (isSquareCutQuarterArea) {
    const side = Number(prompt.match(/边长\s*(\d+)/)?.[1] || 6);
    const totalS = side * side;
    const shadeS = totalS / 4;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `正方形总面积: S ＝ ${side} × ${side} ＝ ${totalS} 平方厘米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `割补平移比例: 阴影部分恰好拼成总面积的 1/4`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `阴影面积公式: S_阴影 ＝ S_正方形 × (1/4)`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `阴影实际面积 ＝ ${totalS} × (1/4) ＝ ${shadeS} 平方厘米` : `阴影实际面积 ＝ ?`;
    svg.append(f4);

    const ox = 45, oy = 30, sz = 90;
    const sq = document.createElementNS(SVG_NS, "rect");
    sq.setAttribute("x", String(ox)); sq.setAttribute("y", String(oy));
    sq.setAttribute("width", String(sz)); sq.setAttribute("height", String(sz));
    sq.setAttribute("fill", "rgba(56, 189, 248, 0.1)");
    sq.setAttribute("stroke", "#38bdf8"); sq.setAttribute("stroke-width", "2");
    svg.append(sq);

    const shadeRect = document.createElementNS(SVG_NS, "rect");
    shadeRect.setAttribute("x", String(ox)); shadeRect.setAttribute("y", String(oy));
    shadeRect.setAttribute("width", String(sz/2)); shadeRect.setAttribute("height", String(sz/2));
    shadeRect.setAttribute("fill", "rgba(34, 197, 94, 0.4)");
    shadeRect.setAttribute("stroke", "#22c55e"); shadeRect.setAttribute("stroke-width", "1.5");
    svg.append(shadeRect);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 割补比例平移模型：复杂折线分割阴影通过平移与旋转旋转补齐，转化成标准比例（1/4）直接求解。";
    card.append(legend);
    return card;
  }

  // 模型 24：双正方形并排斜拉大三角形
  if (isSideBySideSquaresTriangle) {
    const s1 = Number(prompt.match(/边长为\s*(\d+)/)?.[1] || 8);
    const s2 = Number(prompt.match(/和\s*(\d+)/)?.[1] || 6);
    const totalBase = s1 + s2;
    const h = Math.max(s1, s2);
    const area = (totalBase * h) / 2;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `两正方形并排底边总长: ${s1} ＋ ${s2} ＝ ${totalBase} 厘米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `大正方形左上角为顶点: 三角形的高 h ＝ ${h} 厘米`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `三角形底高面积公式: S ＝ 底 × 高 ÷ 2`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `大三角形面积 ＝ ${totalBase} × ${h} ÷ 2 ＝ ${area} 平方厘米` : `大三角形面积 ＝ ?`;
    svg.append(f4);

    const ox = 30, oy = 35, sz1 = 80, sz2 = 60;
    const sq1 = document.createElementNS(SVG_NS, "rect");
    sq1.setAttribute("x", String(ox)); sq1.setAttribute("y", String(oy));
    sq1.setAttribute("width", String(sz1)); sq1.setAttribute("height", String(sz1));
    sq1.setAttribute("fill", "rgba(56, 189, 248, 0.15)");
    sq1.setAttribute("stroke", "#38bdf8"); sq1.setAttribute("stroke-width", "2");
    svg.append(sq1);

    const sq2 = document.createElementNS(SVG_NS, "rect");
    sq2.setAttribute("x", String(ox + sz1)); sq2.setAttribute("y", String(oy + (sz1 - sz2)));
    sq2.setAttribute("width", String(sz2)); sq2.setAttribute("height", String(sz2));
    sq2.setAttribute("fill", "rgba(245, 158, 11, 0.15)");
    sq2.setAttribute("stroke", "#f59e0b"); sq2.setAttribute("stroke-width", "2");
    svg.append(sq2);

    const bigTri = document.createElementNS(SVG_NS, "polygon");
    bigTri.setAttribute("points", `${ox},${oy} ${ox+sz1+sz2},${oy+sz1} ${ox},${oy+sz1}`);
    bigTri.setAttribute("fill", "rgba(34, 197, 94, 0.35)");
    bigTri.setAttribute("stroke", "#22c55e"); bigTri.setAttribute("stroke-width", "2");
    svg.append(bigTri);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 经典拼方斜拉模型：两个正方形并排放在水平线上，连接大正方形顶点与小正方形右下角，所得直角大三角形底等于两边长之和，高等于大正方形边长！";
    card.append(legend);
    return card;
  }

  // 模型 25：半圆与等腰三角形复合拼接
  if (isSemicircleTriangleComposite) {
    const d = Number(prompt.match(/直径\s*(\d+)/)?.[1] || 10);
    const h = Number(prompt.match(/高\s*(\d+)/)?.[1] || 6);
    const r = d / 2;
    const semiArea = Math.round((3.14 * r * r / 2) * 100) / 100;
    const triArea = (d * h) / 2;
    const totalArea = Math.round((semiArea + triArea) * 100) / 100;
    const fx = 205;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `半圆面积: π × r² ÷ 2 ＝ 3.14 × ${r}² ÷ 2 ＝ ${semiArea}`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `等腰三角形面积: 底 × 高 ÷ 2 ＝ ${d} × ${h} ÷ 2 ＝ ${triArea}`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `组合总面积: 半圆面积 ＋ 等腰三角形面积`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `总面积 ＝ ${semiArea} ＋ ${triArea} ＝ ${totalArea} 平方米` : `总面积 ＝ ?`;
    svg.append(f4);

    const cx = 95, cy = 75, sr = 45, th = 45;
    const semi = document.createElementNS(SVG_NS, "path");
    semi.setAttribute("d", `M ${cx-sr} ${cy} A ${sr} ${sr} 0 0 1 ${cx+sr} ${cy} Z`);
    semi.setAttribute("fill", "rgba(56, 189, 248, 0.25)");
    semi.setAttribute("stroke", "#38bdf8"); semi.setAttribute("stroke-width", "2");
    svg.append(semi);

    const tri = document.createElementNS(SVG_NS, "polygon");
    tri.setAttribute("points", `${cx-sr},${cy} ${cx+sr},${cy} ${cx},${cy+th}`);
    tri.setAttribute("fill", "rgba(245, 158, 11, 0.25)");
    tri.setAttribute("stroke", "#f59e0b"); tri.setAttribute("stroke-width", "2");
    svg.append(tri);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 半圆与三角形复合拼接：半圆面积加上等腰三角形面积，分块求和直接得出总面积。";
    card.append(legend);
    return card;
  }

  // 模型 26：长方形剪四角直角三角形
  if (isCornerTrianglesCutout) {
    const l = Number(prompt.match(/长\s*(\d+)/)?.[1] || 20);
    const w = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 12);
    const tA = Number(prompt.match(/直角边分别为\s*(\d+)/)?.[1] || 3);
    const tB = Number(prompt.match(/和\s*(\d+)/)?.[1] || 4);
    const origArea = l * w;
    const oneTriArea = (tA * tB) / 2;
    const cutArea = 4 * oneTriArea;
    const remArea = origArea - cutArea;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `原长方形面积: ${l} × ${w} ＝ ${origArea} 平方米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `四角剪角总面积: 4 × (${tA} × ${tB} ÷ 2) ＝ ${cutArea} 平方米`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `剩余面积计算: 整体减空白 (原面积 － 四角剪切面积)`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `剩余面积 ＝ ${origArea} － ${cutArea} ＝ ${remArea} 平方米` : `剩余面积 ＝ ?`;
    svg.append(f4);

    const ox = 30, oy = 35, ow = 140, oh = 85, cX = 18, cY = 18;
    const oct = document.createElementNS(SVG_NS, "polygon");
    oct.setAttribute("points", `${ox+cX},${oy} ${ox+ow-cX},${oy} ${ox+ow},${oy+cY} ${ox+ow},${oy+oh-cY} ${ox+ow-cX},${oy+oh} ${ox+cX},${oy+oh} ${ox},${oy+oh-cY} ${ox},${oy+cY}`);
    oct.setAttribute("fill", "rgba(56, 189, 248, 0.25)");
    oct.setAttribute("stroke", "#38bdf8"); oct.setAttribute("stroke-width", "2");
    svg.append(oct);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 剪角剩余面积模型：四个角各切掉一个直角三角形，总剩余面积 ＝ 外围长方形面积 － 4 × (直角边 × 直角边 ÷ 2)。";
    card.append(legend);
    return card;
  }

  // 模型 27：梯形同底同高三角形及剩余空白面积
  if (isTrapezoidInteriorTriangle) {
    const top = Number(prompt.match(/上底\s*(\d+)/)?.[1] || 10);
    const btm = Number(prompt.match(/下底\s*(\d+)/)?.[1] || 16);
    const topTriArea = Number(prompt.match(/三角形面积是\s*(\d+)/)?.[1] || 35);
    const h = (topTriArea * 2) / top;
    const btmTriArea = (btm * h) / 2;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `同高三角形求高: h ＝ 面积 × 2 ÷ 上底 ＝ ${topTriArea} × 2 ÷ ${top} ＝ ${h} 米`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `梯形剩余空白部分: 即以下底为底、同高的三角形`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `剩余空白面积: S ＝ 下底 × 高 ÷ 2 ＝ ${btm} × ${h} ÷ 2`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `剩余空白面积 ＝ ${btmTriArea} 平方米` : `剩余空白面积 ＝ ?`;
    svg.append(f4);

    const ax = 55, ay = 35, dx = 115, dy = 35, bx = 25, by = 115, cx = 145, cy = 115;
    const trap = document.createElementNS(SVG_NS, "polygon");
    trap.setAttribute("points", `${ax},${ay} ${dx},${dy} ${cx},${cy} ${bx},${by}`);
    trap.setAttribute("fill", "rgba(245, 158, 11, 0.2)");
    trap.setAttribute("stroke", "#f59e0b"); trap.setAttribute("stroke-width", "2");
    svg.append(trap);

    const midBtm = (bx + cx) / 2;
    const tri = document.createElementNS(SVG_NS, "polygon");
    tri.setAttribute("points", `${ax},${ay} ${dx},${dy} ${midBtm},${by}`);
    tri.setAttribute("fill", "rgba(56, 189, 248, 0.4)");
    tri.setAttribute("stroke", "#38bdf8"); tri.setAttribute("stroke-width", "2");
    svg.append(tri);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 梯形同高三角形解构：梯形上底三角形与下底三角形高相同，面积之比等于上底与下底之比。";
    card.append(legend);
    return card;
  }

  // 模型 28：皮克定理格点面积公式
  if (isPicksTheorem) {
    const inDots = Number(prompt.match(/内部含有\s*(\d+)/)?.[1] || 5);
    const borderDots = Number(prompt.match(/边界上含有\s*(\d+)/)?.[1] || 6);
    const area = inDots + borderDots / 2 - 1;
    const fx = 210;

    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(fx)); f1.setAttribute("y", "40");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `多边形内部格点数 N_内 ＝ ${inDots}`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(fx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `多边形边界格点数 N_边 ＝ ${borderDots}`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(fx)); f3.setAttribute("y", "104");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#a855f7");
    f3.textContent = `皮克定理公式: S ＝ N_内 ＋ N_边 ÷ 2 － 1`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(fx)); f4.setAttribute("y", "136");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `多边形面积 ＝ ${inDots} ＋ ${borderDots} ÷ 2 － 1 ＝ ${area} 平方厘米` : `多边形面积 ＝ ?`;
    svg.append(f4);

    const ox = 35, oy = 30, gSz = 24;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 6; c++) {
        const dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx", String(ox + c * gSz)); dot.setAttribute("cy", String(oy + r * gSz));
        dot.setAttribute("r", "1.5"); dot.setAttribute("fill", "#475569");
        svg.append(dot);
      }
    }

    const poly = document.createElementNS(SVG_NS, "polygon");
    poly.setAttribute("points", `${ox+gSz},${oy+gSz*3} ${ox+gSz*4},${oy+gSz} ${ox+gSz*5},${oy+gSz*3} ${ox+gSz*3},${oy+gSz*4}`);
    poly.setAttribute("fill", "rgba(56, 189, 248, 0.2)");
    poly.setAttribute("stroke", "#38bdf8"); poly.setAttribute("stroke-width", "2");
    svg.append(poly);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📐 皮克定理 (Pick's Theorem)：对于顶点都在格点上的多边形，其面积精确等于“内部格点数 + 边界格点数 ÷ 2 - 1”。";
    card.append(legend);
    return card;
  }

  // 常规多边形分支（精细化参数提取）
  const areaMatch = cleaned.match(/(?:面积是|面积为|面积)\s*(\d+(?:\.\d+)?)\s*(?:平方厘米|平方米|平方分米|cm²|m²|平方)?/) || cleaned.match(/(\d+(?:\.\d+)?)\s*(?:平方厘米|平方米|平方分米|cm²|m²)/);
  const baseMatch = cleaned.match(/(?:底是|底长|底为|底)\s*(\d+(?:\.\d+)?)/);
  const heightMatch = cleaned.match(/(?:高是|高为|高)\s*(\d+(?:\.\d+)?)/);
  const isGivenArea = !!areaMatch;

  if (isTriangle) {
    let base = 8;
    let height = 5;
    let area = 20;
    let formulaDesc = "";

    // 检查斜边高特殊题型
    const hypMatch = prompt.match(/直角边.*?(\d+).*?和\s*(\d+).*?斜边.*?(\d+).*?斜边上的高/);
    if (hypMatch) {
      const a = Number(hypMatch[1]), b = Number(hypMatch[2]), c = Number(hypMatch[3]);
      const hHyp = Math.round((a * b / c) * 10) / 10;
      formulaDesc = isRevealed ? `等面积求斜边高: h ＝ a × b ÷ c ＝ ${a} × ${b} ÷ ${c} ＝ ${hHyp}` : `斜边上的高 ＝ ?`;
      base = c; height = hHyp;
    } else if (isGivenArea) {
      area = Number(areaMatch[1]);
      if (baseMatch) {
        base = Number(baseMatch[1]);
        height = Math.round((area * 2) / base);
        formulaDesc = isRevealed ? `三角形高 h ＝ 面积 × 2 ÷ 底 ＝ ${area} × 2 ÷ ${base} ＝ ${height}` : `三角形高 h ＝ 面积 × 2 ÷ 底 ＝ ?`;
      } else if (heightMatch) {
        height = Number(heightMatch[1]);
        base = Math.round((area * 2) / height);
        formulaDesc = isRevealed ? `三角形底 a ＝ 面积 × 2 ÷ 高 ＝ ${area} × 2 ÷ ${height} ＝ ${base}` : `三角形底 a ＝ 面积 × 2 ÷ 高 ＝ ?`;
      } else {
        const other = cleanNums.find(n => n !== area) || 8;
        base = other;
        height = Math.round((area * 2) / base);
        formulaDesc = isRevealed ? `三角形高 h ＝ 面积 × 2 ÷ 底 ＝ ${area} × 2 ÷ ${base} ＝ ${height}` : `三角形高 h ＝ 面积 × 2 ÷ 底 ＝ ?`;
      }
    } else {
      base = baseMatch ? Number(baseMatch[1]) : (cleanNums[0] || 8);
      height = heightMatch ? Number(heightMatch[1]) : (cleanNums[1] || 5);
      area = Math.round((base * height) / 2);
      formulaDesc = isRevealed ? `三角形面积 S ＝ 底 × 高 ÷ 2 ＝ ${base} × ${height} ÷ 2 ＝ ${area}` : `三角形面积 S ＝ 底 × 高 ÷ 2 ＝ ?`;
    }

    const poly = document.createElementNS(SVG_NS, "polygon");
    poly.setAttribute("points", "130,120 330,120 250,40");
    poly.setAttribute("fill", "rgba(56, 189, 248, 0.15)");
    poly.setAttribute("stroke", "#38bdf8"); poly.setAttribute("stroke-width", "2.5");
    svg.append(poly);

    const alt = document.createElementNS(SVG_NS, "line");
    alt.setAttribute("x1", "250"); alt.setAttribute("y1", "40");
    alt.setAttribute("x2", "250"); alt.setAttribute("y2", "120");
    alt.setAttribute("stroke", "#f59e0b"); alt.setAttribute("stroke-width", "2");
    alt.setAttribute("stroke-dasharray", "4 3");
    svg.append(alt);

    const bText = document.createElementNS(SVG_NS, "text");
    bText.setAttribute("x", "230"); bText.setAttribute("y", "138");
    bText.setAttribute("text-anchor", "middle");
    bText.setAttribute("font-size", "12"); bText.setAttribute("font-weight", "bold");
    bText.setAttribute("fill", "#38bdf8"); bText.textContent = `底 a = ${base}`;
    svg.append(bText);

    const hText = document.createElementNS(SVG_NS, "text");
    hText.setAttribute("x", "265"); hText.setAttribute("y", "80");
    hText.setAttribute("font-size", "12"); hText.setAttribute("font-weight", "bold");
    hText.setAttribute("fill", "#f59e0b"); hText.textContent = `高 h = ${height}`;
    svg.append(hText);

    const fText = document.createElementNS(SVG_NS, "text");
    fText.setAttribute("x", "230"); fText.setAttribute("y", "24");
    fText.setAttribute("text-anchor", "middle");
    fText.setAttribute("font-size", "12"); fText.setAttribute("font-weight", "bold");
    fText.setAttribute("fill", "#22c55e");
    fText.textContent = formulaDesc;
    svg.append(fText);
  } else if (isTrapezoid) {
    const topMatch = cleaned.match(/(?:上底|上底长)\s*(?:为|是)?\s*(\d+(?:\.\d+)?)/);
    const btmMatch = cleaned.match(/(?:下底|下底长)\s*(?:为|是)?\s*(\d+(?:\.\d+)?)/);
    const hMatch = cleaned.match(/(?:高|高度)\s*(?:为|是)?\s*(\d+(?:\.\d+)?)/);
    const top = topMatch ? Number(topMatch[1]) : (cleanNums[0] || 4);
    const btm = btmMatch ? Number(btmMatch[1]) : (cleanNums[1] || 8);
    const h = hMatch ? Number(hMatch[1]) : (cleanNums[2] || 5);
    const area = Math.round(((top + btm) * h) / 2);

    const poly = document.createElementNS(SVG_NS, "polygon");
    poly.setAttribute("points", "180,45 280,45 340,120 120,120");
    poly.setAttribute("fill", "rgba(168, 85, 247, 0.15)");
    poly.setAttribute("stroke", "#c084fc"); poly.setAttribute("stroke-width", "2.5");
    svg.append(poly);

    const alt = document.createElementNS(SVG_NS, "line");
    alt.setAttribute("x1", "180"); alt.setAttribute("y1", "45");
    alt.setAttribute("x2", "180"); alt.setAttribute("y2", "120");
    alt.setAttribute("stroke", "#f59e0b"); alt.setAttribute("stroke-width", "2");
    alt.setAttribute("stroke-dasharray", "4 3");
    svg.append(alt);

    const tText = document.createElementNS(SVG_NS, "text");
    tText.setAttribute("x", "230"); tText.setAttribute("y", "38");
    tText.setAttribute("text-anchor", "middle");
    tText.setAttribute("font-size", "11"); tText.setAttribute("font-weight", "bold");
    tText.setAttribute("fill", "#c084fc"); tText.textContent = `上底 a = ${top}`;
    svg.append(tText);

    const bText = document.createElementNS(SVG_NS, "text");
    bText.setAttribute("x", "230"); bText.setAttribute("y", "138");
    bText.setAttribute("text-anchor", "middle");
    bText.setAttribute("font-size", "11"); bText.setAttribute("font-weight", "bold");
    bText.setAttribute("fill", "#c084fc"); bText.textContent = `下底 b = ${btm}`;
    svg.append(bText);

    const fText = document.createElementNS(SVG_NS, "text");
    fText.setAttribute("x", "230"); fText.setAttribute("y", "20");
    fText.setAttribute("text-anchor", "middle");
    fText.setAttribute("font-size", "12"); fText.setAttribute("font-weight", "bold");
    fText.setAttribute("fill", "#22c55e");
    fText.textContent = isRevealed ? `梯形面积 S = (上底 + 下底) × 高 ÷ 2 = (${top} + ${btm}) × ${h} ÷ 2 = ${area}` : `梯形面积 S = (上底 + 下底) × 高 ÷ 2 = ?`;
    svg.append(fText);
  } else if (isParallelogram) {
    let base = 10;
    let h = 6;
    let area = 60;
    let formulaDesc = "";

    if (isGivenArea) {
      area = Number(areaMatch[1]);
      base = baseMatch ? Number(baseMatch[1]) : (cleanNums.find(n => n !== area) || 10);
      h = Math.round(area / base);
      formulaDesc = isRevealed ? `平行四边形高 h ＝ 面积 ÷ 底 ＝ ${area} ÷ ${base} ＝ ${h}` : `平行四边形高 h ＝ 面积 ÷ 底 ＝ ?`;
    } else {
      base = baseMatch ? Number(baseMatch[1]) : (cleanNums[0] || 10);
      h = heightMatch ? Number(heightMatch[1]) : (cleanNums[1] || 6);
      area = base * h;
      formulaDesc = isRevealed ? `平行四边形面积 S ＝ 底 × 高 ＝ ${base} × ${h} ＝ ${area}` : `平行四边形面积 S ＝ 底 × 高 ＝ ?`;
    }

    const poly = document.createElementNS(SVG_NS, "polygon");
    poly.setAttribute("points", "160,45 340,45 300,120 120,120");
    poly.setAttribute("fill", "rgba(16, 185, 129, 0.15)");
    poly.setAttribute("stroke", "#10b981"); poly.setAttribute("stroke-width", "2.5");
    svg.append(poly);

    const alt = document.createElementNS(SVG_NS, "line");
    alt.setAttribute("x1", "160"); alt.setAttribute("y1", "45");
    alt.setAttribute("x2", "160"); alt.setAttribute("y2", "120");
    alt.setAttribute("stroke", "#f59e0b"); alt.setAttribute("stroke-width", "2");
    alt.setAttribute("stroke-dasharray", "4 3");
    svg.append(alt);

    const fText = document.createElementNS(SVG_NS, "text");
    fText.setAttribute("x", "230"); fText.setAttribute("y", "24");
    fText.setAttribute("text-anchor", "middle");
    fText.setAttribute("font-size", "12"); fText.setAttribute("font-weight", "bold");
    fText.setAttribute("fill", "#22c55e");
    fText.textContent = formulaDesc;
    svg.append(fText);
  } else {
    // 长方形与正方形度量
    const lMatch = cleaned.match(/长\s*(?:为|是)?\s*(\d+(?:\.\d+)?)/);
    const wMatch = cleaned.match(/宽\s*(?:为|是)?\s*(\d+(?:\.\d+)?)/);
    const sideMatch = cleaned.match(/边长\s*(?:为|是)?\s*(\d+(?:\.\d+)?)/);
    const isSquare = prompt.includes("正方形") && !lMatch && !wMatch;

    let w = 9, h = 4;
    if (isSquare) {
      const s = sideMatch ? Number(sideMatch[1]) : (cleanNums[0] || 6);
      w = s; h = s;
    } else {
      w = lMatch ? Number(lMatch[1]) : (cleanNums[0] || 9);
      h = wMatch ? Number(wMatch[1]) : (cleanNums[1] || 4);
    }

    const isPerimeter = prompt.includes("周长");
    const res = isPerimeter ? (w + h) * 2 : w * h;

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", "140"); rect.setAttribute("y", "45");
    rect.setAttribute("width", "180"); rect.setAttribute("height", "75");
    rect.setAttribute("rx", "4");
    rect.setAttribute("fill", "rgba(56, 189, 248, 0.15)");
    rect.setAttribute("stroke", "#38bdf8"); rect.setAttribute("stroke-width", "2.5");
    svg.append(rect);

    const wText = document.createElementNS(SVG_NS, "text");
    wText.setAttribute("x", "230"); wText.setAttribute("y", "38");
    wText.setAttribute("text-anchor", "middle");
    wText.setAttribute("font-size", "12"); wText.setAttribute("font-weight", "bold");
    wText.setAttribute("fill", "#38bdf8"); wText.textContent = isSquare ? `边长 = ${w}` : `长 = ${w}`;
    svg.append(wText);

    const hText = document.createElementNS(SVG_NS, "text");
    hText.setAttribute("x", "332"); hText.setAttribute("y", "86");
    hText.setAttribute("font-size", "12"); hText.setAttribute("font-weight", "bold");
    hText.setAttribute("fill", "#38bdf8"); hText.textContent = isSquare ? `边长 = ${h}` : `宽 = ${h}`;
    svg.append(hText);

    const fText = document.createElementNS(SVG_NS, "text");
    fText.setAttribute("x", "230"); fText.setAttribute("y", "20");
    fText.setAttribute("text-anchor", "middle");
    fText.setAttribute("font-size", "12"); fText.setAttribute("font-weight", "bold");
    fText.setAttribute("fill", "#22c55e");
    fText.textContent = isRevealed
      ? (isPerimeter
          ? (isSquare ? `正方形周长 C = 边长 × 4 = ${w} × 4 = ${res}` : `长方形周长 C = (长 + 宽) × 2 = (${w} + ${h}) × 2 = ${res}`)
          : (isSquare ? `正方形面积 S = 边长² = ${w} × ${w} = ${res}` : `长方形面积 S = 长 × 宽 = ${w} × ${h} = ${res}`))
      : (isPerimeter ? `周长 C ＝ ?` : `面积 S ＝ ?`);
    svg.append(fText);
  }

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = isTriangle
    ? "📐 三角形面积计算核心：底和高必须相互垂直对应，千万不要忘记公式中的“除以 2”！"
    : "📐 平面多边形面积牢记底高垂直对应，周长为所有外边长度之和。";
  card.append(legend);

  return card;
}

/**
 * 21. 立体几何轴测与三维度量模型 (3D Solid & Measurement)
 */

function renderSolid3DVisual(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--solid3d";
  card.dataset.visualType = "solid3d";

  const cleaned = cleanPrompt(prompt);
  const cleanNums = cleanParseNumbers(prompt);
  const nums = parseNumbers(prompt);

  // 场景识别
  const isSubmerged = prompt.includes("浸没") || (prompt.includes("水箱") && (prompt.includes("水面升高") || prompt.includes("水面上升")));
  const isHole3D = prompt.includes("贯穿") || prompt.includes("打通") || (prompt.includes("孔洞") && (prompt.includes("长方体") || prompt.includes("正方体") || prompt.includes("打孔")));
  const isAntSurfaceUnfold = (prompt.includes("蚂蚁") && prompt.includes("长方体")) || (prompt.includes("展开") && prompt.includes("直角三角形") && prompt.includes("直角边之和"));
  const isCornerCut3D = prompt.includes("顶点处挖去") || prompt.includes("角上挖去");
  const isRecast = (prompt.includes("融化") || prompt.includes("重铸")) && (prompt.includes("正方体") || prompt.includes("长方体"));
  const isSlice = (prompt.includes("切成两") || prompt.includes("截成两")) && prompt.includes("长方体");
  const sqBaseMatch = prompt.match(/底面(?:是)?(?:边长)?\s*(\d+(?:\.\d+)?)\s*(?:分米|厘米|米)?(?:的)?正方形/);
  const isSquareBase = !!sqBaseMatch;
  const isCube = prompt.includes("正方体") || (prompt.includes("棱长") && !prompt.includes("长方体"));
  const isSurfaceArea = prompt.includes("表面积") || prompt.includes("展开图") || prompt.includes("涂漆") || prompt.includes("贴上");

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📦 立体几何与三维度量模型</span>
    <span class="question-visual__subbadge">${
      isAntSurfaceUnfold ? "长方体表面展开与最短路径 (蚂蚁爬行直角边之和)" :
      isSubmerged ? "水箱完全浸没排开体积模型 (Δh = V ÷ S底)" :
      isHole3D ? "长方体垂直打孔贯穿模型 (内壁增益表面积)" :
      isCornerCut3D ? "顶点切除正方体模型 (三截面守恒表面积)" :
      isRecast ? "等积重铸与融化模型 (体积守恒)" :
      isSlice ? "平行截面切割模型 (每切一刀增加两个底面)" :
      isSquareBase ? "正方底长方体三维轴测" :
      isCube ? "正方体等长六面体 (V = a³, S = 6a²)" : "长方体三维透视轴测 (V = abc)"
    }</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 155;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  if (isAntSurfaceUnfold) {
    const l = Number(prompt.match(/长\s*(\d+)/)?.[1] || 4);
    const w = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 3);
    const h = Number(prompt.match(/高\s*(\d+)/)?.[1] || 2);
    const legSum = l + w + h;

    const ox = 40, oy = 30, fw = 75, fh = 55, topH = 35;
    const frontRect = document.createElementNS(SVG_NS, "rect");
    frontRect.setAttribute("x", String(ox)); frontRect.setAttribute("y", String(oy + topH));
    frontRect.setAttribute("width", String(fw)); frontRect.setAttribute("height", String(fh));
    frontRect.setAttribute("fill", "rgba(56, 189, 248, 0.2)");
    frontRect.setAttribute("stroke", "#38bdf8"); frontRect.setAttribute("stroke-width", "2");
    svg.append(frontRect);

    const topRect = document.createElementNS(SVG_NS, "rect");
    topRect.setAttribute("x", String(ox)); topRect.setAttribute("y", String(oy));
    topRect.setAttribute("width", String(fw)); topRect.setAttribute("height", String(topH));
    topRect.setAttribute("fill", "rgba(168, 85, 247, 0.2)");
    topRect.setAttribute("stroke", "#c084fc"); topRect.setAttribute("stroke-width", "1.5");
    svg.append(topRect);

    const path = document.createElementNS(SVG_NS, "line");
    path.setAttribute("x1", String(ox)); path.setAttribute("y1", String(oy + topH + fh));
    path.setAttribute("x2", String(ox + fw)); path.setAttribute("y2", String(oy));
    path.setAttribute("stroke", "#ef4444"); path.setAttribute("stroke-width", "2.5");
    path.setAttribute("stroke-dasharray", "4 2");
    svg.append(path);

    const leg1 = document.createElementNS(SVG_NS, "line");
    leg1.setAttribute("x1", String(ox)); leg1.setAttribute("y1", String(oy + topH + fh));
    leg1.setAttribute("x2", String(ox + fw)); leg1.setAttribute("y2", String(oy + topH + fh));
    leg1.setAttribute("stroke", "#f59e0b"); leg1.setAttribute("stroke-width", "1.5");
    svg.append(leg1);

    const leg2 = document.createElementNS(SVG_NS, "line");
    leg2.setAttribute("x1", String(ox + fw)); leg2.setAttribute("y1", String(oy + topH + fh));
    leg2.setAttribute("x2", String(ox + fw)); leg2.setAttribute("y2", String(oy));
    leg2.setAttribute("stroke", "#f59e0b"); leg2.setAttribute("stroke-width", "1.5");
    svg.append(leg2);

    const antTag = document.createElementNS(SVG_NS, "text");
    antTag.setAttribute("x", String(ox - 8)); antTag.setAttribute("y", String(oy + topH + fh + 4));
    antTag.setAttribute("font-size", "12"); antTag.textContent = "🐜";
    svg.append(antTag);

    const rx = 160;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold"); f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `长方体三维尺寸: 长 a = ${l}, 宽 b = ${w}, 高 c = ${h}`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(rx)); f2.setAttribute("y", "66");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold"); f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `展开为平面直角三角形，两条直角边为 (a + b) 与 c`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(rx)); f3.setAttribute("y", "94");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold"); f3.setAttribute("fill", "#c084fc");
    f3.textContent = `无论如何展开，两条直角边之和恒为 a + b + c`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(rx)); f4.setAttribute("y", "124");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold"); f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `直角边之和 ＝ ${l} ＋ ${w} ＋ ${h} ＝ ${legSum} 厘米` : `直角边之和 ＝ a ＋ b ＋ c ＝ ? 厘米`;
    svg.append(f4);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📦 蚂蚁爬行表面展开模型：在三维立体表面上求两点间最短距离，必须将立体表面展开成平面；两点之间线段最短，对应展开图中的直角三角形斜边。";
    card.append(legend);
    return card;
  }

  if (isSubmerged) {
    // 水箱完全浸没铁块模型
    const tankL = Number(prompt.match(/底面长\s*(\d+(?:\.\d+)?)/)?.[1] || 12);
    const tankW = Number(prompt.match(/宽\s*(\d+(?:\.\d+)?)/)?.[1] || 10);
    const ironSide = Number(prompt.match(/棱长(?:为|是)?\s*(\d+(?:\.\d+)?)/)?.[1] || 6);
    const ironV = Math.round(ironSide ** 3);
    const baseArea = tankL * tankW;
    const deltaH = question.answer ? Number(question.answer) : (Math.round((ironV / baseArea) * 10) / 10);

    // 水箱轴测透视
    const tx = 60, ty = 40, tw = 180, th = 85, tdx = 40, tdy = -20;
    // 水箱后虚线
    const bLine = document.createElementNS(SVG_NS, "line");
    bLine.setAttribute("x1", String(tx + tdx)); bLine.setAttribute("y1", String(ty + th + tdy));
    bLine.setAttribute("x2", String(tx + tw + tdx)); bLine.setAttribute("y2", String(ty + th + tdy));
    bLine.setAttribute("stroke", "#334155"); bLine.setAttribute("stroke-dasharray", "3 2");
    svg.append(bLine);

    // 水位主体 (半透明蓝)
    const waterBody = document.createElementNS(SVG_NS, "rect");
    waterBody.setAttribute("x", String(tx)); waterBody.setAttribute("y", String(ty + 25));
    waterBody.setAttribute("width", String(tw)); waterBody.setAttribute("height", String(th - 25));
    waterBody.setAttribute("fill", "rgba(56, 189, 248, 0.25)");
    waterBody.setAttribute("stroke", "#0284c7");
    svg.append(waterBody);

    // 浸没正方体铁块
    const ix = tx + 40, iy = ty + th - 35, iw = 35, ih = 35;
    const ironRect = document.createElementNS(SVG_NS, "rect");
    ironRect.setAttribute("x", String(ix)); ironRect.setAttribute("y", String(iy));
    ironRect.setAttribute("width", String(iw)); ironRect.setAttribute("height", String(ih));
    ironRect.setAttribute("fill", "rgba(100, 116, 139, 0.75)");
    ironRect.setAttribute("stroke", "#cbd5e1"); ironRect.setAttribute("stroke-width", "1.5");
    svg.append(ironRect);

    const ironText = document.createElementNS(SVG_NS, "text");
    ironText.setAttribute("x", String(ix + iw / 2)); ironText.setAttribute("y", String(iy + ih / 2 + 4));
    ironText.setAttribute("text-anchor", "middle"); ironText.setAttribute("font-size", "10");
    ironText.setAttribute("fill", "#ffffff"); ironText.setAttribute("font-weight", "bold");
    ironText.textContent = `铁块 ${ironSide}³`;
    svg.append(ironText);

    // 水位上升指示箭头
    const riseArrow = document.createElementNS(SVG_NS, "line");
    riseArrow.setAttribute("x1", String(tx + tw + 12)); riseArrow.setAttribute("y1", String(ty + 25));
    riseArrow.setAttribute("x2", String(tx + tw + 12)); riseArrow.setAttribute("y2", String(ty + 45));
    riseArrow.setAttribute("stroke", "#22c55e"); riseArrow.setAttribute("stroke-width", "2.5");
    svg.append(riseArrow);

    const riseTag = document.createElementNS(SVG_NS, "text");
    riseTag.setAttribute("x", String(tx + tw + 20)); riseTag.setAttribute("y", String(ty + 38));
    riseTag.setAttribute("font-size", "11"); riseTag.setAttribute("font-weight", "bold");
    riseTag.setAttribute("fill", "#22c55e");
    riseTag.textContent = `Δh = ${deltaH}`;
    svg.append(riseTag);

    // 右侧公式与步骤
    const rx = 295;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(rx)); f1.setAttribute("y", "45");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold");
    f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `水箱底面积 S = ${tankL} × ${tankW} = ${baseArea} dm²`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(rx)); f2.setAttribute("y", "72");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold");
    f2.setAttribute("fill", "#f59e0b");
    f2.textContent = `完全浸没排开体积 V = ${ironSide}³ = ${ironV} dm³`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(rx)); f3.setAttribute("y", "105");
    f3.setAttribute("font-size", "12"); f3.setAttribute("font-weight", "bold");
    f3.setAttribute("fill", "#22c55e");
    f3.textContent = isRevealed ? `升高度 Δh = ${ironV} ÷ ${baseArea} = ${deltaH} 分米` : `升高度 Δh = ${ironV} ÷ ${baseArea} = ? 分米`;
    svg.append(f3);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📦 排水体积原理：完全浸没且水未溢出时，排开水的体积恒等于浸入铁块的体积。水面升高高度 ＝ 排开体积 ÷ 水箱底面积。";
    card.append(legend);
    return card;
  }

  if (isHole3D) {
    // 垂直打孔贯穿长方体模型
    const l = Number(prompt.match(/长\s*(\d+)/)?.[1] || 8);
    const w = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 6);
    const h = Number(prompt.match(/高\s*(\d+)/)?.[1] || 5);
    const hole = Number(prompt.match(/(\d+)\s*[×x*]\s*(\d+)/)?.[1] || 2);
    const origS = 2 * (l * w + w * h + l * h);
    const holeEnd = 2 * (hole * hole);
    const innerWall = 4 * (hole * h);
    const totalS = origS - holeEnd + innerWall;

    const fx = 80, fy = 55, fw = 120, fh = 65, dx = 45, dy = -25;
    // 外长方体正前表面
    const front = document.createElementNS(SVG_NS, "rect");
    front.setAttribute("x", String(fx)); front.setAttribute("y", String(fy));
    front.setAttribute("width", String(fw)); front.setAttribute("height", String(fh));
    front.setAttribute("fill", "rgba(56, 189, 248, 0.15)"); front.setAttribute("stroke", "#38bdf8"); front.setAttribute("stroke-width", "2");
    svg.append(front);

    // 顶面
    const topP = document.createElementNS(SVG_NS, "polygon");
    topP.setAttribute("points", `${fx},${fy} ${fx+dx},${fy+dy} ${fx+fw+dx},${fy+dy} ${fx+fw},${fy}`);
    topP.setAttribute("fill", "rgba(56, 189, 248, 0.25)"); topP.setAttribute("stroke", "#38bdf8"); topP.setAttribute("stroke-width", "2");
    svg.append(topP);

    // 右面
    const rightP = document.createElementNS(SVG_NS, "polygon");
    rightP.setAttribute("points", `${fx+fw},${fy} ${fx+fw+dx},${fy+dy} ${fx+fw+dx},${fy+fh+dy} ${fx+fw},${fy+fh}`);
    rightP.setAttribute("fill", "rgba(14, 165, 233, 0.35)"); rightP.setAttribute("stroke", "#38bdf8"); rightP.setAttribute("stroke-width", "2");
    svg.append(rightP);

    // 中间垂直打通方孔 (顶面镂空)
    const hx = fx + fw / 2 - 12 + dx / 2, hy = fy + dy / 2 - 4;
    const holeTop = document.createElementNS(SVG_NS, "rect");
    holeTop.setAttribute("x", String(hx)); holeTop.setAttribute("y", String(hy));
    holeTop.setAttribute("width", "24"); holeTop.setAttribute("height", "14");
    holeTop.setAttribute("fill", "rgba(15, 23, 42, 0.95)"); holeTop.setAttribute("stroke", "#f59e0b"); holeTop.setAttribute("stroke-width", "1.5");
    svg.append(holeTop);

    // 内部打孔虚线管道
    const shaft1 = document.createElementNS(SVG_NS, "line");
    shaft1.setAttribute("x1", String(hx)); shaft1.setAttribute("y1", String(hy + 14));
    shaft1.setAttribute("x2", String(hx)); shaft1.setAttribute("y2", String(hy + 14 + fh));
    shaft1.setAttribute("stroke", "#f59e0b"); shaft1.setAttribute("stroke-width", "1.5"); shaft1.setAttribute("stroke-dasharray", "3 3");
    svg.append(shaft1);

    const shaft2 = document.createElementNS(SVG_NS, "line");
    shaft2.setAttribute("x1", String(hx + 24)); shaft2.setAttribute("y1", String(hy + 14));
    shaft2.setAttribute("x2", String(hx + 24)); shaft2.setAttribute("y2", String(hy + 14 + fh));
    shaft2.setAttribute("stroke", "#f59e0b"); shaft2.setAttribute("stroke-width", "1.5"); shaft2.setAttribute("stroke-dasharray", "3 3");
    svg.append(shaft2);

    const holeTag = document.createElementNS(SVG_NS, "text");
    holeTag.setAttribute("x", String(hx + 12)); holeTag.setAttribute("y", String(hy - 8));
    holeTag.setAttribute("text-anchor", "middle"); holeTag.setAttribute("font-size", "11");
    holeTag.setAttribute("font-weight", "bold"); holeTag.setAttribute("fill", "#f59e0b");
    holeTag.textContent = `孔洞 ${hole}×${hole}`;
    svg.append(holeTag);

    // 右侧解题步骤与公式
    const rx = 270;
    const f1 = document.createElementNS(SVG_NS, "text");
    f1.setAttribute("x", String(rx)); f1.setAttribute("y", "38");
    f1.setAttribute("font-size", "11"); f1.setAttribute("font-weight", "bold");
    f1.setAttribute("fill", "#38bdf8");
    f1.textContent = `原表面积 S₀ = 2(8×6 + 6×5 + 8×5) = ${origS}`;
    svg.append(f1);

    const f2 = document.createElementNS(SVG_NS, "text");
    f2.setAttribute("x", String(rx)); f2.setAttribute("y", "62");
    f2.setAttribute("font-size", "11"); f2.setAttribute("font-weight", "bold");
    f2.setAttribute("fill", "#ec4899");
    f2.textContent = `上下孔口损失 = 2 × (${hole}×${hole}) = -${holeEnd}`;
    svg.append(f2);

    const f3 = document.createElementNS(SVG_NS, "text");
    f3.setAttribute("x", String(rx)); f3.setAttribute("y", "86");
    f3.setAttribute("font-size", "11"); f3.setAttribute("font-weight", "bold");
    f3.setAttribute("fill", "#f59e0b");
    f3.textContent = `孔洞内壁新增 = 4 × (${hole}×${h}) = +${innerWall}`;
    svg.append(f3);

    const f4 = document.createElementNS(SVG_NS, "text");
    f4.setAttribute("x", String(rx)); f4.setAttribute("y", "118");
    f4.setAttribute("font-size", "12"); f4.setAttribute("font-weight", "bold");
    f4.setAttribute("fill", "#22c55e");
    f4.textContent = isRevealed ? `总表面积 = ${origS} - ${holeEnd} + ${innerWall} = ${totalS} dm²` : `总表面积 = ${origS} - ${holeEnd} + ${innerWall} = ?`;
    svg.append(f4);

    card.append(svg);
    const legend = document.createElement("p");
    legend.className = "question-visual__legend";
    legend.textContent = "📦 贯穿打孔表面积规律：打孔虽然扣除了上下两个孔口面积，但垂直贯穿在内部多出了 4 面孔壁，总表面积反而增加！";
    card.append(legend);
    return card;
  }

  // 通用或正方底长方体尺寸精准解析
  let a = 6, b = 4, c = 3;
  if (isSquareBase) {
    const baseSide = Number(sqBaseMatch[1]);
    const hMatch = prompt.match(/高\s*(\d+(?:\.\d+)?)/);
    const heightVal = hMatch ? Number(hMatch[1]) : (cleanNums.find(n => n !== baseSide) || 7);
    a = baseSide;
    b = baseSide;
    c = heightVal;
  } else if (isCube) {
    const sideMatch = prompt.match(/棱长(?:为|是)?\s*(\d+(?:\.\d+)?)/);
    const side = sideMatch ? Number(sideMatch[1]) : (cleanNums[0] || 4);
    a = side; b = side; c = side;
  } else {
    const lMatch = prompt.match(/长\s*(?:为|是)?\s*(\d+(?:\.\d+)?)/);
    const wMatch = prompt.match(/宽\s*(?:为|是)?\s*(\d+(?:\.\d+)?)/);
    const hMatch = prompt.match(/(?:高|深)\s*(?:为|是)?\s*(\d+(?:\.\d+)?)/);
    a = lMatch ? Number(lMatch[1]) : (cleanNums[0] || 6);
    b = wMatch ? Number(wMatch[1]) : (cleanNums[1] || 4);
    c = hMatch ? Number(hMatch[1]) : (cleanNums[2] || 3);
  }

  const volume = Math.round(a * b * c * 100) / 100;
  const surfaceArea = isCube ? 6 * a * a : 2 * (a * b + b * c + a * c);

  const fx = 150, fy = 62, fw = 110, fh = 65;
  const dx = 45, dy = -25;

  const d1 = document.createElementNS(SVG_NS, "line");
  d1.setAttribute("x1", String(fx)); d1.setAttribute("y1", String(fy + fh));
  d1.setAttribute("x2", String(fx + dx)); d1.setAttribute("y2", String(fy + fh + dy));
  d1.setAttribute("stroke", "#475569"); d1.setAttribute("stroke-width", "1.5");
  d1.setAttribute("stroke-dasharray", "3 3");
  svg.append(d1);

  const d2 = document.createElementNS(SVG_NS, "line");
  d2.setAttribute("x1", String(fx + dx)); d2.setAttribute("y1", String(fy + fh + dy));
  d2.setAttribute("x2", String(fx + fw + dx)); d2.setAttribute("y2", String(fy + fh + dy));
  d2.setAttribute("stroke", "#475569"); d2.setAttribute("stroke-width", "1.5");
  d2.setAttribute("stroke-dasharray", "3 3");
  svg.append(d2);

  const d3 = document.createElementNS(SVG_NS, "line");
  d3.setAttribute("x1", String(fx + dx)); d3.setAttribute("y1", String(fy + fh + dy));
  d3.setAttribute("x2", String(fx + dx)); d3.setAttribute("y2", String(fy + dy));
  d3.setAttribute("stroke", "#475569"); d3.setAttribute("stroke-width", "1.5");
  d3.setAttribute("stroke-dasharray", "3 3");
  svg.append(d3);

  const topFace = document.createElementNS(SVG_NS, "polygon");
  topFace.setAttribute("points", `${fx},${fy} ${fx+dx},${fy+dy} ${fx+fw+dx},${fy+dy} ${fx+fw},${fy}`);
  topFace.setAttribute("fill", "rgba(56, 189, 248, 0.25)");
  topFace.setAttribute("stroke", "#38bdf8"); topFace.setAttribute("stroke-width", "2");
  svg.append(topFace);

  const rightFace = document.createElementNS(SVG_NS, "polygon");
  rightFace.setAttribute("points", `${fx+fw},${fy} ${fx+fw+dx},${fy+dy} ${fx+fw+dx},${fy+fh+dy} ${fx+fw},${fy+fh}`);
  rightFace.setAttribute("fill", "rgba(14, 165, 233, 0.35)");
  rightFace.setAttribute("stroke", "#38bdf8"); rightFace.setAttribute("stroke-width", "2");
  svg.append(rightFace);

  const frontFace = document.createElementNS(SVG_NS, "rect");
  frontFace.setAttribute("x", String(fx)); frontFace.setAttribute("y", String(fy));
  frontFace.setAttribute("width", String(fw)); frontFace.setAttribute("height", String(fh));
  frontFace.setAttribute("fill", "rgba(56, 189, 248, 0.15)");
  frontFace.setAttribute("stroke", "#38bdf8"); frontFace.setAttribute("stroke-width", "2");
  svg.append(frontFace);

  const lTag = document.createElementNS(SVG_NS, "text");
  lTag.setAttribute("x", String(fx + fw / 2)); lTag.setAttribute("y", String(fy + fh + 16));
  lTag.setAttribute("text-anchor", "middle");
  lTag.setAttribute("font-size", "11"); lTag.setAttribute("font-weight", "bold");
  lTag.setAttribute("fill", "#38bdf8"); lTag.textContent = isSquareBase ? `底面长 a = ${a}` : (isCube ? `棱长 a = ${a}` : `长 a = ${a}`);
  svg.append(lTag);

  const wTag = document.createElementNS(SVG_NS, "text");
  wTag.setAttribute("x", String(fx + fw + dx / 2 + 10)); wTag.setAttribute("y", String(fy + dy / 2 + 6));
  wTag.setAttribute("font-size", "11"); wTag.setAttribute("font-weight", "bold");
  wTag.setAttribute("fill", "#f59e0b"); wTag.textContent = isSquareBase ? `底面宽 b = ${b}` : (isCube ? `棱长 b = ${b}` : `宽 b = ${b}`);
  svg.append(wTag);

  const hTag = document.createElementNS(SVG_NS, "text");
  hTag.setAttribute("x", String(fx + fw + dx + 8)); hTag.setAttribute("y", String(fy + fh / 2 + dy));
  hTag.setAttribute("font-size", "11"); hTag.setAttribute("font-weight", "bold");
  hTag.setAttribute("fill", "#ec4899"); hTag.textContent = `高 c = ${c}`;
  svg.append(hTag);

  const fTag = document.createElementNS(SVG_NS, "text");
  fTag.setAttribute("x", "230"); fTag.setAttribute("y", "22");
  fTag.setAttribute("text-anchor", "middle");
  fTag.setAttribute("font-size", "12"); fTag.setAttribute("font-weight", "bold");
  fTag.setAttribute("fill", "#22c55e");
  fTag.textContent = isRevealed
    ? (isSurfaceArea
        ? (isCube ? `正方体表面积 S = 6 × a² = 6 × ${a}² = ${surfaceArea}` : (isSquareBase ? `表面积 S = 2a² + 4ac = 2×${a}² + 4×(${a}×${c}) = ${surfaceArea}` : `长方体表面积 S = 2(ab + bc + ac) = ${surfaceArea}`))
        : (isCube ? `正方体体积 V = a³ = ${a}³ = ${volume}` : (isSquareBase ? `长方体体积 V = (底面积) × 高 = (${a} × ${b}) × ${c} = ${volume}` : `长方体体积 V = 长 × 宽 × 高 = ${a} × ${b} × ${c} = ${volume}`)))
    : (isSurfaceArea
        ? (isCube ? "正方体表面积 S = 6 × a² = ?" : "长方体表面积 S = 2(ab + bc + ac) = ?")
        : (isCube ? "正方体体积 V = a³ = ?" : "长方体体积 V = 长 × 宽 × 高 = ?"));
  svg.append(fTag);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = isSurfaceArea
    ? "📦 表面积导引：长方体有 6 个面，相对的两个面面积相等；正方体 6 个面完全相同。"
    : "📦 体积导引：体积表示所占空间大小，长方体 V = abc，正方体 V = a³，柱体体积均为底面积乘以高。";
  card.append(legend);

  return card;
}

/**
 * 22. 条形统计图与数据频数分布 (Bar Chart & Frequency Distribution)
 */

function renderAreaUnitsVisual(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--area-units";
  card.dataset.visualType = "area-units";

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📐 面积单位进率与空间网格矩阵</span>
    <span class="question-visual__subbadge">1m² ＝ 100dm² ＝ 10,000cm² | 1km² ＝ 100公顷 ＝ 1,000,000m²</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 155;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  // Left: 10x10 Micro Grid Matrix visual (100 cells)
  const mx = 25, my = 25, sz = 95;
  const bgBox = document.createElementNS(SVG_NS, "rect");
  bgBox.setAttribute("x", String(mx)); bgBox.setAttribute("y", String(my));
  bgBox.setAttribute("width", String(sz)); bgBox.setAttribute("height", String(sz));
  bgBox.setAttribute("fill", "rgba(15, 23, 42, 0.6)");
  bgBox.setAttribute("stroke", "#38bdf8"); bgBox.setAttribute("stroke-width", "2");
  bgBox.setAttribute("rx", "4");
  svg.append(bgBox);

  // 10x10 grid cells
  const cellSize = sz / 10;
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = document.createElementNS(SVG_NS, "rect");
      cell.setAttribute("x", String(mx + c * cellSize + 0.5));
      cell.setAttribute("y", String(my + r * cellSize + 0.5));
      cell.setAttribute("width", String(cellSize - 1));
      cell.setAttribute("height", String(cellSize - 1));
      cell.setAttribute("fill", (r + c) % 2 === 0 ? "rgba(56, 189, 248, 0.3)" : "rgba(56, 189, 248, 0.15)");
      svg.append(cell);
    }
  }

  const gTag = document.createElementNS(SVG_NS, "text");
  gTag.setAttribute("x", String(mx + sz / 2));
  gTag.setAttribute("y", String(my + sz + 18));
  gTag.setAttribute("text-anchor", "middle");
  gTag.setAttribute("font-size", "11");
  gTag.setAttribute("font-weight", "bold");
  gTag.setAttribute("fill", "#38bdf8");
  gTag.textContent = "10 × 10 ＝ 100 格小单位";
  svg.append(gTag);

  // Parse prompt units and numbers
  const nums = parseNumbers(prompt);
  const val = nums[0] !== undefined ? nums[0] : 3;

  let srcUnit = "平方米";
  let targetUnit = "平方分米";
  let factor = 100;
  let isMul = true;

  if (prompt.includes("平方厘米") && prompt.includes("平方分米")) {
    if (prompt.indexOf("平方厘米") < prompt.indexOf("平方分米")) {
      srcUnit = "平方厘米"; targetUnit = "平方分米"; factor = 100; isMul = false;
    } else {
      srcUnit = "平方分米"; targetUnit = "平方厘米"; factor = 100; isMul = true;
    }
  } else if (prompt.includes("平方米") && prompt.includes("平方分米")) {
    if (prompt.indexOf("平方米") < prompt.indexOf("平方分米")) {
      srcUnit = "平方米"; targetUnit = "平方分米"; factor = 100; isMul = true;
    } else {
      srcUnit = "平方分米"; targetUnit = "平方米"; factor = 100; isMul = false;
    }
  } else if (prompt.includes("平方千米") && prompt.includes("公顷")) {
    if (prompt.indexOf("平方千米") < prompt.indexOf("公顷")) {
      srcUnit = "平方千米"; targetUnit = "公顷"; factor = 100; isMul = true;
    } else {
      srcUnit = "公顷"; targetUnit = "平方千米"; factor = 100; isMul = false;
    }
  } else if (prompt.includes("公顷") && prompt.includes("平方米")) {
    if (prompt.indexOf("公顷") < prompt.indexOf("平方米")) {
      srcUnit = "公顷"; targetUnit = "平方米"; factor = 10000; isMul = true;
    } else {
      srcUnit = "平方米"; targetUnit = "公顷"; factor = 10000; isMul = false;
    }
  } else if (prompt.includes("平方厘米") && prompt.includes("平方米")) {
    if (prompt.indexOf("平方厘米") < prompt.indexOf("平方米")) {
      srcUnit = "平方厘米"; targetUnit = "平方米"; factor = 10000; isMul = false;
    } else {
      srcUnit = "平方米"; targetUnit = "平方厘米"; factor = 10000; isMul = true;
    }
  } else if (prompt.includes("平方米") && prompt.includes("平方千米")) {
    if (prompt.indexOf("平方米") < prompt.indexOf("平方千米")) {
      srcUnit = "平方米"; targetUnit = "平方千米"; factor = 1000000; isMul = false;
    } else {
      srcUnit = "平方千米"; targetUnit = "平方米"; factor = 1000000; isMul = true;
    }
  }

  const calcResult = isMul ? val * factor : (val / factor);

  // Right side: Unit staircase & calculation capsule
  const rx = 145;
  const ladderUnits = ["cm²", "dm²", "m²", "公顷", "km²"];
  const ladderRates = ["×100", "×100", "×10000", "×100"];
  const ladderX = rx + 16;
  const stepW = 56;
  ladderUnits.forEach((u, i) => {
    const lx = ladderX + i * stepW;
    const ly = 38;
    const uDot = document.createElementNS(SVG_NS, "circle");
    uDot.setAttribute("cx", String(lx)); uDot.setAttribute("cy", String(ly));
    uDot.setAttribute("r", "13");
    uDot.setAttribute("fill", "#1e293b");
    uDot.setAttribute("stroke", (srcUnit.includes(u.slice(0, 2)) || targetUnit.includes(u.slice(0, 2))) ? "#f59e0b" : "#64748b");
    uDot.setAttribute("stroke-width", "2");
    svg.append(uDot);

    const uTxt = document.createElementNS(SVG_NS, "text");
    uTxt.setAttribute("x", String(lx)); uTxt.setAttribute("y", String(ly + 4));
    uTxt.setAttribute("text-anchor", "middle");
    uTxt.setAttribute("font-size", "10");
    uTxt.setAttribute("font-weight", "bold");
    uTxt.setAttribute("fill", "#f8fafc");
    uTxt.textContent = u;
    svg.append(uTxt);

    if (i < ladderRates.length) {
      const arrTxt = document.createElementNS(SVG_NS, "text");
      arrTxt.setAttribute("x", String(lx + stepW / 2)); arrTxt.setAttribute("y", String(ly - 5));
      arrTxt.setAttribute("text-anchor", "middle");
      arrTxt.setAttribute("font-size", "9");
      arrTxt.setAttribute("fill", "#38bdf8");
      arrTxt.textContent = ladderRates[i];
      svg.append(arrTxt);

      const arrLine = document.createElementNS(SVG_NS, "line");
      arrLine.setAttribute("x1", String(lx + 15)); arrLine.setAttribute("y1", String(ly));
      arrLine.setAttribute("x2", String(lx + stepW - 15)); arrLine.setAttribute("y2", String(ly));
      arrLine.setAttribute("stroke", "rgba(56, 189, 248, 0.4)");
      arrLine.setAttribute("stroke-width", "1.5");
      svg.append(arrLine);
    }
  });

  const capBox = document.createElementNS(SVG_NS, "rect");
  capBox.setAttribute("x", String(rx + 10)); capBox.setAttribute("y", "72");
  capBox.setAttribute("width", "280"); capBox.setAttribute("height", "45");
  capBox.setAttribute("rx", "6");
  capBox.setAttribute("fill", "rgba(30, 41, 59, 0.7)");
  capBox.setAttribute("stroke", "#3b82f6"); capBox.setAttribute("stroke-width", "1.5");
  svg.append(capBox);

  const opSign = isMul ? "×" : "÷";
  const formulaText = isRevealed
    ? `${val} ${srcUnit} ${opSign} ${factor} ＝ ${question.answer !== undefined ? question.answer : calcResult} ${targetUnit}`
    : `${val} ${srcUnit} ${opSign} ${factor} ＝ ? ${targetUnit}`;

  const fTxt = document.createElementNS(SVG_NS, "text");
  fTxt.setAttribute("x", String(rx + 150)); fTxt.setAttribute("y", "100");
  fTxt.setAttribute("text-anchor", "middle");
  fTxt.setAttribute("font-size", "13");
  fTxt.setAttribute("font-weight", "bold");
  fTxt.setAttribute("fill", isRevealed ? "#22c55e" : "#f59e0b");
  fTxt.textContent = formulaText;
  svg.append(fTxt);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = `📐 面积进率核心：长度进率是 10 时，面积进率是 10×10 ＝ 100；高级单位化低级单位乘进率，低级单位化高级单位除以进率。`;
  card.append(legend);

  return card;
}

function renderCapacityVisual(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--capacity";
  card.dataset.visualType = "capacity";

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">💧 容积与液体度量模型</span>
    <span class="question-visual__subbadge">1升 (L) ＝ 1000毫升 (mL) ＝ 1立方分米 (dm³) | 1立方米 (m³) ＝ 1000升 (L)</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 155;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const fx = 45, fy = 20, fw = 75, fh = 105;
  const glass = document.createElementNS(SVG_NS, "rect");
  glass.setAttribute("x", String(fx)); glass.setAttribute("y", String(fy));
  glass.setAttribute("width", String(fw)); glass.setAttribute("height", String(fh));
  glass.setAttribute("rx", "6");
  glass.setAttribute("fill", "rgba(15, 23, 42, 0.6)");
  glass.setAttribute("stroke", "#38bdf8"); glass.setAttribute("stroke-width", "2");
  svg.append(glass);

  for (let i = 1; i <= 4; i++) {
    const ty = fy + fh - (i * fh / 4);
    const tick = document.createElementNS(SVG_NS, "line");
    tick.setAttribute("x1", String(fx)); tick.setAttribute("y1", String(ty));
    tick.setAttribute("x2", String(fx + 10)); tick.setAttribute("y2", String(ty));
    tick.setAttribute("stroke", "#94a3b8"); tick.setAttribute("stroke-width", "1.5");
    svg.append(tick);
  }

  const waterH = Math.round(fh * 0.65);
  const water = document.createElementNS(SVG_NS, "rect");
  water.setAttribute("x", String(fx + 3)); water.setAttribute("y", String(fy + fh - waterH));
  water.setAttribute("width", String(fw - 6)); water.setAttribute("height", String(waterH - 3));
  water.setAttribute("rx", "3");
  water.setAttribute("fill", "rgba(56, 189, 248, 0.45)");
  svg.append(water);

  const wave = document.createElementNS(SVG_NS, "ellipse");
  wave.setAttribute("cx", String(fx + fw / 2)); wave.setAttribute("cy", String(fy + fh - waterH));
  wave.setAttribute("rx", String(fw / 2 - 4)); wave.setAttribute("ry", "4");
  wave.setAttribute("fill", "#7dd3fc"); wave.setAttribute("opacity", "0.6");
  svg.append(wave);

  const nums = parseNumbers(prompt);
  const val = nums[0] !== undefined ? nums[0] : 8;

  let isLtoMl = prompt.includes("升") && prompt.includes("毫升") && prompt.indexOf("升") < prompt.indexOf("毫升");
  let isMltoL = prompt.includes("毫升") && prompt.includes("升") && prompt.indexOf("毫升") < prompt.indexOf("升");
  let isM3toL = prompt.includes("立方米") && prompt.includes("升");
  const isBoxCapacity = prompt.includes("长方体") && prompt.includes("长") && prompt.includes("宽") && (prompt.includes("深") || prompt.includes("高"));
  const isPouringTank = prompt.includes("倒入") && (prompt.includes("水深") || prompt.includes("水箱"));

  const rx = 150;
  const t1 = document.createElementNS(SVG_NS, "text");
  t1.setAttribute("x", String(rx)); t1.setAttribute("y", "42");
  t1.setAttribute("font-size", "12"); t1.setAttribute("font-weight", "bold");
  t1.setAttribute("fill", "#38bdf8");
  t1.textContent = isBoxCapacity ? "▪ 长方体容器容积: V ＝ 长 × 宽 × 深 (高)" : isPouringTank ? "▪ 倒水前后液体体积守恒: V(水) ＝ 恒定不变" : "▪ 容积核心公式: 1 升 (L) ＝ 1000 毫升 (mL)";
  svg.append(t1);

  const t2 = document.createElementNS(SVG_NS, "text");
  t2.setAttribute("x", String(rx)); t2.setAttribute("y", "68");
  t2.setAttribute("font-size", "12"); t2.setAttribute("font-weight", "bold");
  t2.setAttribute("fill", "#a78bfa");
  t2.textContent = isBoxCapacity ? "▪ 单位换算对应: 1000 立方厘米 (cm³) ＝ 1 升 (L)" : isPouringTank ? "▪ 倾倒后水深公式: 水深 h ＝ 液体体积 ÷ 新容器底面积" : "▪ 几何容积对应: 1 升 ＝ 1 立方分米 | 1 立方米 ＝ 1000 升";
  svg.append(t2);

  const calcBox = document.createElementNS(SVG_NS, "rect");
  calcBox.setAttribute("x", String(rx)); calcBox.setAttribute("y", "84");
  calcBox.setAttribute("width", "285"); calcBox.setAttribute("height", "42");
  calcBox.setAttribute("rx", "6");
  calcBox.setAttribute("fill", "rgba(30, 41, 59, 0.7)");
  calcBox.setAttribute("stroke", "#3b82f6"); calcBox.setAttribute("stroke-width", "1.5");
  svg.append(calcBox);

  let formulaText = "";
  if (isBoxCapacity) {
    const l = Number(prompt.match(/长\s*(\d+)/)?.[1] || 20);
    const w = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 15);
    const h = Number(prompt.match(/(?:深|高)\s*(\d+)/)?.[1] || 10);
    const vol = l * w * h;
    const liters = question.answer || (vol / 1000);
    formulaText = isRevealed ? `V ＝ ${l}×${w}×${h} ＝ ${vol} cm³ ＝ ${liters} 升` : `V ＝ ${l}×${w}×${h} ＝ ? 升`;
  } else if (isPouringTank) {
    const cubeSide = Number(prompt.match(/棱长\s*(\d+)/)?.[1] || 4);
    const cuboidL = Number(prompt.match(/底面长\s*(\d+)/)?.[1] || 8);
    const cuboidW = Number(prompt.match(/宽\s*(\d+)/)?.[1] || 4);
    const waterV = cubeSide ** 3;
    const baseS = cuboidL * cuboidW;
    const depth = question.answer || (waterV / baseS);
    formulaText = isRevealed ? `水 ${cubeSide}³＝${waterV}dm³ ⇒ 深 ＝ ${waterV}÷(${cuboidL}×${cuboidW}) ＝ ${depth} 分米` : `水深 ＝ 水总体积 ÷ 底面积 ＝ ? 分米`;
  } else if (isLtoMl) {
    formulaText = isRevealed ? `${val} 升 × 1000 ＝ ${question.answer || val * 1000} 毫升` : `${val} 升 × 1000 ＝ ? 毫升`;
  } else if (isMltoL) {
    formulaText = isRevealed ? `${val} 毫升 ÷ 1000 ＝ ${question.answer || val / 1000} 升` : `${val} 毫升 ÷ 1000 ＝ ? 升`;
  } else if (isM3toL) {
    formulaText = isRevealed ? `${val} 立方米 × 1000 ＝ ${question.answer || val * 1000} 升` : `${val} 立方米 × 1000 ＝ ? 升`;
  } else {
    formulaText = isRevealed ? `容积计算 ＝ ${question.answer || val}` : `容积计算 ＝ ?`;
  }

  const fTxt = document.createElementNS(SVG_NS, "text");
  fTxt.setAttribute("x", String(rx + 142)); fTxt.setAttribute("y", "110");
  fTxt.setAttribute("text-anchor", "middle");
  fTxt.setAttribute("font-size", "13");
  fTxt.setAttribute("font-weight", "bold");
  fTxt.setAttribute("fill", isRevealed ? "#22c55e" : "#f59e0b");
  fTxt.textContent = formulaText;
  svg.append(fTxt);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = `💧 容积测量法则：容器所能容纳液体的体积即为容积，升与毫升进率为 1000，1 升水刚好充满 1 立方分米空间。`;
  card.append(legend);

  return card;
}

module.exports = {
  renderRouteMap,
  renderDiagram,
  renderGeometryCounting,
  renderAngleVisual,
  renderPolygonVisual,
  renderSolid3DVisual,
  renderAreaUnitsVisual,
  renderCapacityVisual
};
