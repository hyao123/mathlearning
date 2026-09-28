const { SVG_NS, createSvg, parseNumbers, safeAddListener, createControlBtn, safeClassAdd, safeClassRemove } = require('./visualizerCore.js');

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

  const nums = parseNumbers(prompt);
  const isTriangleSum = prompt.includes("内角和") || (prompt.includes("三角形") && (prompt.includes("度") || prompt.includes("角")));
  const isSupplementary = prompt.includes("补角") || prompt.includes("平角");
  const isComplementary = prompt.includes("余角") || prompt.includes("直角");

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📐 角度度量与空间方位模型</span>
    <span class="question-visual__subbadge">${isTriangleSum ? "三角形内角和定理 (180°)" : isSupplementary ? "平角与邻补角模型 (180°)" : "射线张角与量角标尺"}</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  if (isTriangleSum) {
    const a1 = nums[0] || 60;
    const a2 = nums[1] || 50;
    const a3 = 180 - a1 - a2 > 0 ? 180 - a1 - a2 : 70;

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
    sumTag.textContent = isRevealed ? `内角和定理: ${a1}° + ${a2}° + ${a3}° = 180°` : "内角和定理: ∠A + ∠B + ∠C = 180°";
    svg.append(sumTag);
  } else {
    const ox = 230, oy = 115;
    const deg = nums.find(n => n > 0 && n < 180) || 45;

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
  }

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = isTriangleSum
    ? "📐 核心性质：任意三角形内角和恒为 180°；已知两个角，第三角 = 180° - 另外两角之和。"
    : "📐 角度性质：锐角 < 90°，直角 = 90°，钝角在 90° 到 180° 之间，平角 = 180°。";
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

  const nums = parseNumbers(prompt);
  const isTriangle = prompt.includes("三角形");
  const isTrapezoid = prompt.includes("梯形");
  const isParallelogram = prompt.includes("平行四边形");

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📏 平面几何图形与面积模型</span>
    <span class="question-visual__subbadge">${isTrapezoid ? "梯形底高面积" : isTriangle ? "三角形底高对应" : isParallelogram ? "平行四边形割补法" : "长方形与正方形度量"}</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  if (isTriangle) {
    const base = nums[0] || 8;
    const height = nums[1] || 5;
    const area = Math.round((base * height) / 2);

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
    fText.textContent = isRevealed ? `三角形面积 S = 底 × 高 ÷ 2 = ${base} × ${height} ÷ 2 = ${area}` : `三角形面积 S = 底 × 高 ÷ 2 = ${base} × ${height} ÷ 2 = ?`;
    svg.append(fText);
  } else if (isTrapezoid) {
    const top = nums[0] || 4;
    const btm = nums[1] || 8;
    const h = nums[2] || 5;
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
    fText.textContent = isRevealed ? `梯形面积 S = (上底 + 下底) × 高 ÷ 2 = (${top} + ${btm}) × ${h} ÷ 2 = ${area}` : `梯形面积 S = (上底 + 下底) × 高 ÷ 2 = (${top} + ${btm}) × ${h} ÷ 2 = ?`;
    svg.append(fText);
  } else if (isParallelogram) {
    const base = nums[0] || 10;
    const h = nums[1] || 6;
    const area = base * h;

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
    fText.textContent = isRevealed ? `平行四边形面积 S = 底 × 高 = ${base} × ${h} = ${area}` : `平行四边形面积 S = 底 × 高 = ${base} × ${h} = ?`;
    svg.append(fText);
  } else {
    const w = nums[0] || 9;
    const h = nums[1] || 4;
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
    wText.setAttribute("fill", "#38bdf8"); wText.textContent = `长 = ${w}`;
    svg.append(wText);

    const hText = document.createElementNS(SVG_NS, "text");
    hText.setAttribute("x", "332"); hText.setAttribute("y", "86");
    hText.setAttribute("font-size", "12"); hText.setAttribute("font-weight", "bold");
    hText.setAttribute("fill", "#38bdf8"); hText.textContent = `宽 = ${h}`;
    svg.append(hText);

    const fText = document.createElementNS(SVG_NS, "text");
    fText.setAttribute("x", "230"); fText.setAttribute("y", "20");
    fText.setAttribute("text-anchor", "middle");
    fText.setAttribute("font-size", "12"); fText.setAttribute("font-weight", "bold");
    fText.setAttribute("fill", "#22c55e");
    fText.textContent = isRevealed
      ? (isPerimeter ? `长方形周长 C = (长 + 宽) × 2 = (${w} + ${h}) × 2 = ${res}` : `长方形面积 S = 长 × 宽 = ${w} × ${h} = ${res}`)
      : (isPerimeter ? `长方形周长 C = (长 + 宽) × 2 = (${w} + ${h}) × 2 = ?` : `长方形面积 S = 长 × 宽 = ${w} × ${h} = ?`);
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

  const nums = parseNumbers(prompt);
  const isCube = prompt.includes("正方体") || prompt.includes("棱长");
  const isSurfaceArea = prompt.includes("表面积") || prompt.includes("展开图") || prompt.includes("涂漆");
  const a = nums[0] || (isCube ? 4 : 6);
  const b = isCube ? a : (nums[1] || 4);
  const c = isCube ? a : (nums[2] || 3);

  const volume = a * b * c;
  const surfaceArea = isCube ? 6 * a * a : 2 * (a * b + b * c + a * c);

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📦 立体几何与三维度量模型</span>
    <span class="question-visual__subbadge">${isCube ? "正方体等长六面体" : "长方体三维透视轴测"}</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 155;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const fx = 160, fy = 65, fw = 110, fh = 65;
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
  lTag.setAttribute("fill", "#38bdf8"); lTag.textContent = `长 a = ${a}`;
  svg.append(lTag);

  const wTag = document.createElementNS(SVG_NS, "text");
  wTag.setAttribute("x", String(fx + fw + dx / 2 + 10)); wTag.setAttribute("y", String(fy + dy / 2 + 6));
  wTag.setAttribute("font-size", "11"); wTag.setAttribute("font-weight", "bold");
  wTag.setAttribute("fill", "#f59e0b"); wTag.textContent = `宽 b = ${b}`;
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
    ? (isSurfaceArea ? (isCube ? `正方体表面积 S = 6 × a² = 6 × ${a}² = ${surfaceArea}` : `长方体表面积 S = 2(ab + bc + ac) = ${surfaceArea}`) : (isCube ? `正方体体积 V = a³ = ${a}³ = ${volume}` : `长方体体积 V = 长 × 宽 × 高 = ${a} × ${b} × ${c} = ${volume}`))
    : (isSurfaceArea ? (isCube ? "正方体表面积 S = 6 × a² = ?" : "长方体表面积 S = 2(ab + bc + ac) = ?") : (isCube ? "正方体体积 V = a³ = ?" : "长方体体积 V = 长 × 宽 × 高 = ?"));
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

module.exports = {
  renderRouteMap,
  renderDiagram,
  renderGeometryCounting,
  renderAngleVisual,
  renderPolygonVisual,
  renderSolid3DVisual
};
