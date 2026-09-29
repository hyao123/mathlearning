const { SVG_NS, createSvg, parseNumbers, cleanPrompt, cleanParseNumbers, extractLabeledParams, extractSolutionContext, safeAddListener, createControlBtn, safeClassAdd, safeClassRemove } = require('./visualizerCore.js');

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

function renderSequenceTrack(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--sequence";
  card.dataset.visualType = "sequence";

  // 规范化题目占位符及标点符号
  const normalized = prompt
    .replace(/[\(（]\s*[\?？]?\s*[\)）]/g, " ❓ ")
    .replace(/[?？]/g, " ❓ ")
    .replace(/……+/g, " … ");

  const parseParts = (text) =>
    text
      .split(/[，,、\s]+/)
      .filter(Boolean)
      .map((p) => {
        if (p.includes("❓")) return "❓";
        if (p.includes("…")) return "…";
        const digits = p.replace(/[^\d]/g, "");
        return digits ? String(Number(digits)) : "";
      })
      .filter(Boolean);

  let items = [];
  // 1. 优先提取冒号后紧跟的数列（避免前缀如“2 倍：3、6、12、24”误把倍数当成首项）
  const colonMatch = normalized.match(/[:：]\s*([0-9\s，,、\.…❓]+)/);
  if (colonMatch) {
    const candidate = parseParts(colonMatch[1]);
    if (candidate.length >= 3) {
      items = candidate;
    }
  }

  // 2. 匹配由顿号、逗号分隔的数字序列
  if (items.length < 3) {
    const seqRegex = /(?:(?:\d+|[❓…])\s*[、,，]\s*)+(?:\d+|[❓…])/g;
    const matches = [...normalized.matchAll(seqRegex)];
    if (matches.length > 0) {
      let chosen = matches[matches.length - 1][0];
      for (const m of matches) {
        if (m[0].includes("❓")) {
          chosen = m[0];
          break;
        }
      }
      if (matches.length > 1) {
        const firstIdx = matches[0].index;
        const prefix = normalized.slice(Math.max(0, firstIdx - 3), firstIdx);
        if (prefix.includes("第") && !matches[1][0].startsWith("第")) {
          chosen = matches[1][0];
        }
      }
      const candidate = parseParts(chosen);
      if (candidate.length >= 3) {
        items = candidate;
      }
    }
  }

  // 3. 兜底提取全部数字
  if (items.length < 3) {
    const matches = String(prompt).match(/\d+(\.\d+)?/g);
    const parsedNums = matches ? matches.map(Number) : [];
    if (parsedNums.length >= 3) {
      items = parsedNums.slice(0, 5).map(String);
    } else {
      items = ["1", "4", "9", "16"];
    }
  }

  // 题目要求推导后续项，追加 ❓
  if (!items.includes("❓")) {
    items.push("❓");
  }

  const displayItems = items.slice(0, 6);
  if (!displayItems.includes("❓") && items.length > 6) {
    displayItems.push("…", "❓");
  }

  const validNums = displayItems.filter((it) => it !== "❓" && it !== "…").map(Number);

  // 规律类型推导：等比数列 vs 等差数列 vs 差阶数列
  let isGeometric = false;
  let ratio = 1;
  if (validNums.length >= 2 && validNums[0] > 0) {
    ratio = Math.round((validNums[1] / validNums[0]) * 100) / 100;
    if (ratio > 1 && validNums.every((n, i) => i === 0 || Math.round((n / validNums[i - 1]) * 100) / 100 === ratio)) {
      isGeometric = true;
    }
  }

  let isArithmetic = false;
  let commonDiff = 0;
  if (!isGeometric && validNums.length >= 2) {
    commonDiff = validNums[1] - validNums[0];
    if (commonDiff !== 0 && validNums.every((n, i) => i === 0 || n - validNums[i - 1] === commonDiff)) {
      isArithmetic = true;
    }
  }

  const svgWidth = 460;
  const svgHeight = 135;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const header = document.createElement("div");
  header.className = "question-visual__header";
  const subbadgeText = isGeometric
    ? `观察前后项倍数跃迁 (×${ratio})`
    : isArithmetic
    ? `观察前后项公差跃迁 (${commonDiff >= 0 ? "+" : ""}${commonDiff})`
    : "观察前后项跨步跃迁";
  header.innerHTML = `
    <span class="question-visual__badge">🔢 数列递增胶囊轨</span>
    <span class="question-visual__subbadge">${subbadgeText}</span>
  `;
  card.append(header);

  // Background track
  const trackLine = document.createElementNS(SVG_NS, "line");
  trackLine.setAttribute("x1", "30");
  trackLine.setAttribute("y1", "80");
  trackLine.setAttribute("x2", "430");
  trackLine.setAttribute("y2", "80");
  trackLine.setAttribute("stroke", "rgba(56, 189, 248, 0.35)");
  trackLine.setAttribute("stroke-width", "4");
  trackLine.setAttribute("stroke-linecap", "round");
  svg.append(trackLine);

  const n = displayItems.length;
  const stepX = 400 / (n - 1);

  // Jump arcs between adjacent nodes
  for (let i = 0; i < n - 1; i++) {
    const x1 = 30 + i * stepX;
    const x2 = 30 + (i + 1) * stepX;
    const midX = (x1 + x2) / 2;
    const arcH = 38;

    const arc = document.createElementNS(SVG_NS, "path");
    arc.setAttribute("d", `M ${x1} 62 Q ${midX} ${62 - arcH} ${x2} 62`);
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", i === n - 2 ? "#f59e0b" : "#38bdf8");
    arc.setAttribute("stroke-width", "2");
    arc.setAttribute("stroke-dasharray", i === n - 2 ? "3,3" : "none");
    svg.append(arc);

    const v1 = Number(displayItems[i]);
    const v2 = Number(displayItems[i + 1]);
    let arcText = "+?";
    if (isGeometric) {
      arcText = i === n - 2 ? "×?" : `×${ratio}`;
    } else if (isArithmetic) {
      arcText = i === n - 2 ? "+?" : `${commonDiff >= 0 ? "+" : ""}${commonDiff}`;
    } else {
      if (!isNaN(v1) && !isNaN(v2)) {
        const diff = v2 - v1;
        arcText = (diff >= 0 ? "+" : "") + diff;
      } else {
        arcText = "+?";
      }
    }

    const tag = document.createElementNS(SVG_NS, "text");
    tag.setAttribute("x", String(midX));
    tag.setAttribute("y", String(62 - arcH / 2 - 4));
    tag.setAttribute("text-anchor", "middle");
    tag.setAttribute("font-size", "11");
    tag.setAttribute("font-weight", "bold");
    tag.setAttribute("fill", i === n - 2 ? "#f59e0b" : "#38bdf8");
    tag.textContent = arcText;
    svg.append(tag);
  }

  // Node capsules
  displayItems.forEach((item, i) => {
    const cx = 30 + i * stepX;
    const isTarget = item === "❓";

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", String(cx - 22));
    rect.setAttribute("y", "62");
    rect.setAttribute("width", "44");
    rect.setAttribute("height", "36");
    rect.setAttribute("rx", "18");
    rect.setAttribute("fill", isTarget ? "#f59e0b" : "#1e293b");
    rect.setAttribute("stroke", isTarget ? "#fbbf24" : "#38bdf8");
    rect.setAttribute("stroke-width", isTarget ? "3" : "2");
    svg.append(rect);

    const txt = document.createElementNS(SVG_NS, "text");
    txt.setAttribute("x", String(cx));
    txt.setAttribute("y", "85");
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("font-size", isTarget ? "16" : "14");
    txt.setAttribute("font-weight", "bold");
    txt.setAttribute("fill", isTarget ? "#0f172a" : "#f8fafc");
    txt.textContent = item;
    svg.append(txt);

    const idxTag = document.createElementNS(SVG_NS, "text");
    idxTag.setAttribute("x", String(cx));
    idxTag.setAttribute("y", "116");
    idxTag.setAttribute("text-anchor", "middle");
    idxTag.setAttribute("font-size", "10");
    idxTag.setAttribute("fill", "#64748b");
    idxTag.textContent = `第${i + 1}项`;
    svg.append(idxTag);
  });

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  if (isGeometric) {
    legend.textContent = `🔍 形象观察导引：比对相邻两项之间的倍数关系（每轮扩大为 ${ratio} 倍），推导末尾待求项。`;
  } else if (isArithmetic) {
    legend.textContent = `🔍 形象观察导引：相邻两项之间的差值保持恒定（公差为 ${commonDiff}），推导末尾待求项。`;
  } else {
    legend.textContent = "🔍 形象观察导引：比对相邻两项之间的递增跳跃步长，推导末尾待求项。";
  }
  card.append(legend);

  return card;
}

/**
 * 2. 周期循环：传送带与转盘刻度 (Cycle Conveyor Wheel)
 */

function renderCycleWheel(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--cycle";
  card.dataset.visualType = "cycle";

  let symbols = [];
  if (prompt.includes("红、黄、蓝")) symbols = ["🔴红", "🟡黄", "🔵蓝"];
  else if (prompt.includes("春、夏、秋、冬")) symbols = ["🌸春", "☀️夏", "🍁秋", "❄️冬"];
  else if (prompt.includes("A、B、C、D、E")) symbols = ["A", "B", "C", "D", "E"];
  else if (prompt.includes("★、●、▲、■、♥")) symbols = ["★", "●", "▲", "■", "♥"];
  else if (prompt.includes("星期")) symbols = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  else {
    const quoteMatch = prompt.match(/“([^”]+)”/);
    if (quoteMatch) symbols = quoteMatch[1].split(/[、,\s]+/).filter(Boolean);
    else {
      const listMatch = prompt.match(/按([^循环，。！？]+)循环/);
      if (listMatch) symbols = listMatch[1].split(/[、,\s]+/).filter(Boolean);
    }
  }
  if (symbols.length < 2) symbols = ["①", "②", "③", "④"];

  const targetMatch = prompt.match(/第\s*(\d+)\s*个/);
  const nums = parseNumbers(prompt);
  const targetN = targetMatch ? Number(targetMatch[1]) : (nums.length > 0 ? nums[nums.length - 1] : 18);
  const cycleLen = symbols.length;
  const remainder = targetN % cycleLen;
  const matchIdx = remainder === 0 ? cycleLen - 1 : remainder - 1;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🔄 周期循环传送带</span>
    <span class="question-visual__subbadge">周期长度 T = ${cycleLen}</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const boxWidth = Math.min(410, cycleLen * 56 + 24);
  const startX = (svgWidth - boxWidth) / 2;

  const cycleRect = document.createElementNS(SVG_NS, "rect");
  cycleRect.setAttribute("x", String(startX));
  cycleRect.setAttribute("y", "20");
  cycleRect.setAttribute("width", String(boxWidth));
  cycleRect.setAttribute("height", "76");
  cycleRect.setAttribute("rx", "12");
  cycleRect.setAttribute("fill", "rgba(56, 189, 248, 0.08)");
  cycleRect.setAttribute("stroke", "#38bdf8");
  cycleRect.setAttribute("stroke-width", "2");
  cycleRect.setAttribute("stroke-dasharray", "4,3");
  svg.append(cycleRect);

  const cycleTag = document.createElementNS(SVG_NS, "text");
  cycleTag.setAttribute("x", String(startX + 14));
  cycleTag.setAttribute("y", "15");
  cycleTag.setAttribute("font-size", "11");
  cycleTag.setAttribute("font-weight", "bold");
  cycleTag.setAttribute("fill", "#38bdf8");
  cycleTag.textContent = `⟳ 1个完整周期（共 ${cycleLen} 项）`;
  svg.append(cycleTag);

  symbols.forEach((sym, i) => {
    const cx = startX + 16 + i * 56 + 24;
    const isMatched = i === matchIdx && isRevealed;

    const block = document.createElementNS(SVG_NS, "rect");
    block.setAttribute("x", String(cx - 22));
    block.setAttribute("y", "32");
    block.setAttribute("width", "44");
    block.setAttribute("height", "44");
    block.setAttribute("rx", "8");
    block.setAttribute("fill", isMatched ? "#f59e0b" : "#1e293b");
    block.setAttribute("stroke", isMatched ? "#fbbf24" : "#475569");
    block.setAttribute("stroke-width", isMatched ? "2.5" : "1.5");
    svg.append(block);

    const txt = document.createElementNS(SVG_NS, "text");
    txt.setAttribute("x", String(cx));
    txt.setAttribute("y", "58");
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("font-size", "13");
    txt.setAttribute("font-weight", "bold");
    txt.setAttribute("fill", isMatched ? "#0f172a" : "#f8fafc");
    txt.textContent = sym;
    svg.append(txt);

    const ordTag = document.createElementNS(SVG_NS, "text");
    ordTag.setAttribute("x", String(cx));
    ordTag.setAttribute("y", "92");
    ordTag.setAttribute("text-anchor", "middle");
    ordTag.setAttribute("font-size", "10");
    ordTag.setAttribute("fill", isMatched ? "#f59e0b" : "#64748b");
    ordTag.textContent = isRevealed ? (isMatched ? `余${remainder === 0 ? cycleLen : remainder}★目标` : `余${(i + 1) % cycleLen}`) : `第${i + 1}项`;
    svg.append(ordTag);
  });

  const formulaText = document.createElementNS(SVG_NS, "text");
  formulaText.setAttribute("x", String(svgWidth / 2));
  formulaText.setAttribute("y", "125");
  formulaText.setAttribute("text-anchor", "middle");
  formulaText.setAttribute("font-size", "12");
  formulaText.setAttribute("font-weight", "bold");
  formulaText.setAttribute("fill", "#22c55e");
  formulaText.textContent = isRevealed ? `余数公式：目标第 ${targetN} 项 ÷ 周期 ${cycleLen} = ${Math.floor(targetN / cycleLen)} 组 ... 余 ${remainder} 项 ➔ 锁定目标` : `周期规律：周期长度 T = ${cycleLen} 项，目标第 ${targetN} 项 ➔ 用余数定位目标`;
  svg.append(formulaText);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "🎯 周期循环导引：总位置除以周期长度，看余数即可快速锁定目标元素。";
  card.append(legend);

  return card;
}

/**
 * 3. 鸡兔同笼与轮子：头脚检视台 (Silhouette Pen)
 */

function renderVennDiagram(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--venn";
  card.dataset.visualType = "venn";

  const cleaned = cleanPrompt(prompt);
  const nums = cleanParseNumbers(prompt);
  const totalMatch = cleaned.match(/(?:全班|一共有|共有|班级有|调查了)\s*(\d+)\s*人/);

  // Stop at clause boundaries so condition clauses don't bleed into question clauses
  const askNeither = /(两[项种样]?都不|都不)[^，,。；;！？?!]*?(多少|几人|是多少|几名)/.test(prompt);
  const askOnlyOne = /(只[会喜欢参加订选]|只[^，,。；;！？?!]*?一[项种样])[^，,。；;！？?!]*?(多少|几人|是多少|几名)/.test(prompt);
  const askOverlap = /两[项种样]都[^，,。；;！？?!]*?(多少|几人|是多少|几名)/.test(prompt);
  const askUnion = /至少[^，,。；;！？?!]*?(多少|几人|是多少|几名)/.test(prompt);

  let questionType = "union";
  let aCount = 9;
  let bCount = 8;
  let bothCount = 3;
  let totalCount = totalMatch ? Number(totalMatch[1]) : null;
  let unionCount = 14;
  let neitherCount = 0;
  let subbadgeText = "并集去重模型";
  let formulaText = "";
  let legendText = "";

  if (askNeither) {
    questionType = "neither";
    subbadgeText = "全集补集模型：全班总数 - 并集 = 两项都不选";
    if (totalCount !== null) {
      const candidates = nums.filter(n => n !== totalCount);
      aCount = candidates[0] || 18;
      bCount = candidates[1] || 15;
      bothCount = candidates[2] || 5;
    } else if (nums.length >= 4) {
      totalCount = nums[0];
      aCount = nums[1];
      bCount = nums[2];
      bothCount = nums[3];
    } else {
      aCount = nums[0] || 18;
      bCount = nums[1] || 15;
      bothCount = nums[2] || 5;
      totalCount = 40;
    }
    unionCount = aCount + bCount - bothCount;
    neitherCount = Math.max(0, totalCount - unionCount);
    formulaText = `容斥公式：并集 = ${aCount} + ${bCount} - ${bothCount} = ${unionCount}；都不选 = ${totalCount} - ${unionCount} = ${neitherCount}`;
    legendText = `⭕ 容斥求补集：先求至少选一项的并集 (${unionCount}人)，再用全班总数 (${totalCount}人) 减去并集得到都不选的人数 (${neitherCount}人)。`;
  } else if (askOnlyOne) {
    questionType = "only-one";
    subbadgeText = "对称差模型：(A - 重叠) + (B - 重叠) = 只选一项";
    if (totalCount !== null) {
      const candidates = nums.filter(n => n !== totalCount);
      aCount = candidates[0] || 15;
      bCount = candidates[1] || 13;
      bothCount = candidates[2] || 4;
    } else if (nums.length >= 4 && (prompt.includes("全班") || prompt.includes("中") || prompt.includes("共"))) {
      totalCount = nums[0];
      aCount = nums[1];
      bCount = nums[2];
      bothCount = nums[3];
    } else {
      aCount = nums[0] || 15;
      bCount = nums[1] || 13;
      bothCount = nums[2] || 4;
    }
    const onlyAVal = Math.max(0, aCount - bothCount);
    const onlyBVal = Math.max(0, bCount - bothCount);
    const onlyOne = onlyAVal + onlyBVal;
    unionCount = aCount + bCount - bothCount;
    formulaText = `容斥公式：只会一项 = (${aCount} - ${bothCount}) + (${bCount} - ${bothCount}) = ${onlyAVal} + ${onlyBVal} = ${onlyOne}`;
    legendText = `⭕ 只选一项：从每类中分别扣除两项都选的重叠部分，A单独有 ${onlyAVal}人，B单独有 ${onlyBVal}人，合计 ${onlyOne}人。`;
  } else if (askOverlap) {
    questionType = "overlap";
    subbadgeText = "反求重叠模型：A + B - 并集 = 两项都选";
    if (totalCount !== null) {
      const candidates = nums.filter(n => n !== totalCount);
      aCount = candidates[0] || 16;
      bCount = candidates[1] || 14;
      unionCount = candidates[2] || (aCount + bCount - 6);
    } else if (nums.length >= 4) {
      totalCount = nums[0];
      aCount = nums[1];
      bCount = nums[2];
      unionCount = nums[3];
    } else {
      aCount = nums[0] || 16;
      bCount = nums[1] || 14;
      unionCount = nums[2] || 24;
    }
    bothCount = Math.max(0, aCount + bCount - unionCount);
    formulaText = `容斥公式：两项都选 = A (${aCount}) + B (${bCount}) - 至少选一项 (${unionCount}) = ${bothCount}`;
    legendText = `⭕ 容斥反求重叠：两类人数直接相加比实际并集总人数多算出的量，就是两项都选的重叠部分 (${bothCount}人)。`;
  } else {
    questionType = "union";
    subbadgeText = "并集去重模型：A + B - 重叠 = 至少选一项";
    if (totalCount !== null) {
      const candidates = nums.filter(n => n !== totalCount);
      aCount = candidates[0] || 9;
      bCount = candidates[1] || 8;
      bothCount = candidates[2] || 3;
    } else if (nums.length >= 4 && (prompt.includes("全班") || prompt.includes("中") || prompt.includes("共") || prompt.includes("调查"))) {
      totalCount = nums[0];
      aCount = nums[1];
      bCount = nums[2];
      bothCount = nums[3];
    } else {
      aCount = nums.length >= 1 ? nums[0] : 9;
      bCount = nums.length >= 2 ? nums[1] : 8;
      bothCount = nums.length >= 3 ? nums[2] : 3;
    }
    unionCount = aCount + bCount - bothCount;
    formulaText = `容斥公式：至少选一项 = A (${aCount}) + B (${bCount}) - 重叠 (${bothCount}) = ${unionCount}`;
    legendText = `⭕ 容斥求并集：中间重叠部分被计算了两次，求总数时必须扣除 1 次多算的重叠量 (${bothCount}人)。`;
  }

  const onlyA = Math.max(0, aCount - bothCount);
  const onlyB = Math.max(0, bCount - bothCount);

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">⭕ 容斥双圈集合图</span>
    <span class="question-visual__subbadge">${subbadgeText}</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = totalCount !== null ? 168 : 158;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const centerY = totalCount !== null ? 74 : 70;

  if (totalCount !== null) {
    const universeRect = document.createElementNS(SVG_NS, "rect");
    universeRect.setAttribute("x", "12");
    universeRect.setAttribute("y", "8");
    universeRect.setAttribute("width", "436");
    universeRect.setAttribute("height", "116");
    universeRect.setAttribute("rx", "8");
    universeRect.setAttribute("fill", "rgba(15, 23, 42, 0.45)");
    universeRect.setAttribute("stroke", "rgba(148, 163, 184, 0.3)");
    universeRect.setAttribute("stroke-width", "1.5");
    universeRect.setAttribute("stroke-dasharray", "4 3");
    svg.append(universeRect);

    const txtUniverse = document.createElementNS(SVG_NS, "text");
    txtUniverse.setAttribute("x", "24");
    txtUniverse.setAttribute("y", "26");
    txtUniverse.setAttribute("font-size", "11");
    txtUniverse.setAttribute("font-weight", "bold");
    txtUniverse.setAttribute("fill", "#94a3b8");
    txtUniverse.textContent = `全集 U (全班共 ${totalCount} 人)`;
    svg.append(txtUniverse);

    if (questionType === "neither") {
      const txtNeither = document.createElementNS(SVG_NS, "text");
      txtNeither.setAttribute("x", "436");
      txtNeither.setAttribute("y", "26");
      txtNeither.setAttribute("text-anchor", "end");
      txtNeither.setAttribute("font-size", "11");
      txtNeither.setAttribute("font-weight", "bold");
      txtNeither.setAttribute("fill", "#f87171");
      txtNeither.textContent = isRevealed ? `两项都不选: ${neitherCount} 人` : "两项都不选: ? 人";
      svg.append(txtNeither);
    }
  }

  const circleA = document.createElementNS(SVG_NS, "circle");
  circleA.setAttribute("cx", "180");
  circleA.setAttribute("cy", String(centerY));
  circleA.setAttribute("r", "52");
  circleA.setAttribute("fill", questionType === "only-one" ? "rgba(56, 189, 248, 0.28)" : "rgba(56, 189, 248, 0.18)");
  circleA.setAttribute("stroke", "#38bdf8");
  circleA.setAttribute("stroke-width", "2.5");
  svg.append(circleA);

  const circleB = document.createElementNS(SVG_NS, "circle");
  circleB.setAttribute("cx", "280");
  circleB.setAttribute("cy", String(centerY));
  circleB.setAttribute("r", "52");
  circleB.setAttribute("fill", questionType === "only-one" ? "rgba(168, 85, 247, 0.28)" : "rgba(168, 85, 247, 0.18)");
  circleB.setAttribute("stroke", "#a855f7");
  circleB.setAttribute("stroke-width", "2.5");
  svg.append(circleB);

  const txtOnlyA = document.createElementNS(SVG_NS, "text");
  txtOnlyA.setAttribute("x", "148");
  txtOnlyA.setAttribute("y", String(centerY + 4));
  txtOnlyA.setAttribute("text-anchor", "middle");
  txtOnlyA.setAttribute("font-size", questionType === "only-one" ? "16" : "14");
  txtOnlyA.setAttribute("font-weight", "bold");
  txtOnlyA.setAttribute("fill", questionType === "only-one" ? "#38bdf8" : "#7dd3fc");
  txtOnlyA.textContent = (questionType === "only-one" && !isRevealed) ? "?" : `${onlyA}`;
  svg.append(txtOnlyA);

  const labelA = document.createElementNS(SVG_NS, "text");
  labelA.setAttribute("x", "148");
  labelA.setAttribute("y", String(centerY + 22));
  labelA.setAttribute("text-anchor", "middle");
  labelA.setAttribute("font-size", "10");
  labelA.setAttribute("fill", "#94a3b8");
  labelA.textContent = "只选A";
  svg.append(labelA);

  const txtBoth = document.createElementNS(SVG_NS, "text");
  txtBoth.setAttribute("x", "230");
  txtBoth.setAttribute("y", String(centerY + 4));
  txtBoth.setAttribute("text-anchor", "middle");
  txtBoth.setAttribute("font-size", questionType === "overlap" ? "18" : "15");
  txtBoth.setAttribute("font-weight", "bold");
  txtBoth.setAttribute("fill", "#fbbf24");
  txtBoth.textContent = (questionType === "overlap" && !isRevealed) ? "?" : `${bothCount}`;
  svg.append(txtBoth);

  const labelBoth = document.createElementNS(SVG_NS, "text");
  labelBoth.setAttribute("x", "230");
  labelBoth.setAttribute("y", String(centerY + 22));
  labelBoth.setAttribute("text-anchor", "middle");
  labelBoth.setAttribute("font-size", "10");
  labelBoth.setAttribute("fill", "#f59e0b");
  labelBoth.textContent = "两项都选";
  svg.append(labelBoth);

  const txtOnlyB = document.createElementNS(SVG_NS, "text");
  txtOnlyB.setAttribute("x", "312");
  txtOnlyB.setAttribute("y", String(centerY + 4));
  txtOnlyB.setAttribute("text-anchor", "middle");
  txtOnlyB.setAttribute("font-size", questionType === "only-one" ? "16" : "14");
  txtOnlyB.setAttribute("font-weight", "bold");
  txtOnlyB.setAttribute("fill", questionType === "only-one" ? "#c084fc" : "#d8b4fe");
  txtOnlyB.textContent = (questionType === "only-one" && !isRevealed) ? "?" : `${onlyB}`;
  svg.append(txtOnlyB);

  const labelB = document.createElementNS(SVG_NS, "text");
  labelB.setAttribute("x", "312");
  labelB.setAttribute("y", String(centerY + 22));
  labelB.setAttribute("text-anchor", "middle");
  labelB.setAttribute("font-size", "10");
  labelB.setAttribute("fill", "#94a3b8");
  labelB.textContent = "只选B";
  svg.append(labelB);

  const titleA = document.createElementNS(SVG_NS, "text");
  titleA.setAttribute("x", "160");
  titleA.setAttribute("y", totalCount !== null ? "38" : "22");
  titleA.setAttribute("text-anchor", "middle");
  titleA.setAttribute("font-size", "12");
  titleA.setAttribute("font-weight", "bold");
  titleA.setAttribute("fill", "#38bdf8");
  titleA.textContent = `集合 A (共 ${aCount} 人)`;
  svg.append(titleA);

  const titleB = document.createElementNS(SVG_NS, "text");
  titleB.setAttribute("x", "300");
  titleB.setAttribute("y", totalCount !== null ? "38" : "22");
  titleB.setAttribute("text-anchor", "middle");
  titleB.setAttribute("font-size", "12");
  titleB.setAttribute("font-weight", "bold");
  titleB.setAttribute("fill", "#a855f7");
  titleB.textContent = `集合 B (共 ${bCount} 人)`;
  svg.append(titleB);

  const fText = document.createElementNS(SVG_NS, "text");
  fText.setAttribute("x", "230");
  fText.setAttribute("y", String(svgHeight - 12));
  fText.setAttribute("text-anchor", "middle");
  fText.setAttribute("font-size", "11.5");
  fText.setAttribute("font-weight", "bold");
  fText.setAttribute("fill", "#22c55e");
  fText.textContent = isRevealed ? formulaText : "容斥原理：总数 = A + B - 重叠 (不重不漏)";
  svg.append(fText);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = legendText;
  card.append(legend);

  return card;
}

/**
 * 7. 植树问题与间隔模型：林荫小道标尺 (Tree Road Ruler)
 */

function renderEnumerationTree(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--tree";
  card.dataset.visualType = "tree";

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🌳 有序穷举与加乘分类树</span>
    <span class="question-visual__subbadge">不重不漏分支展开</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 140;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const rootCircle = document.createElementNS(SVG_NS, "circle");
  rootCircle.setAttribute("cx", "60");
  rootCircle.setAttribute("cy", "70");
  rootCircle.setAttribute("r", "20");
  rootCircle.setAttribute("fill", "#38bdf8");
  svg.append(rootCircle);

  const rTxt = document.createElementNS(SVG_NS, "text");
  rTxt.setAttribute("x", "60");
  rTxt.setAttribute("y", "75");
  rTxt.setAttribute("text-anchor", "middle");
  rTxt.setAttribute("font-size", "12");
  rTxt.setAttribute("font-weight", "bold");
  rTxt.setAttribute("fill", "#0f172a");
  rTxt.textContent = "起点";
  svg.append(rTxt);

  const branches = [
    { y: 35, label: "选项 A (3种)", leafY: [22, 35, 48] },
    { y: 105, label: "选项 B (2种)", leafY: [95, 115] }
  ];

  branches.forEach((b) => {
    const line = document.createElementNS(SVG_NS, "path");
    line.setAttribute("d", `M 80 70 Q 140 70 170 ${b.y}`);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "#38bdf8");
    line.setAttribute("stroke-width", "2");
    svg.append(line);

    const midCircle = document.createElementNS(SVG_NS, "rect");
    midCircle.setAttribute("x", "170");
    midCircle.setAttribute("y", String(b.y - 14));
    midCircle.setAttribute("width", "100");
    midCircle.setAttribute("height", "28");
    midCircle.setAttribute("rx", "6");
    midCircle.setAttribute("fill", "#1e293b");
    midCircle.setAttribute("stroke", "#38bdf8");
    midCircle.setAttribute("stroke-width", "1.5");
    svg.append(midCircle);

    const mTxt = document.createElementNS(SVG_NS, "text");
    mTxt.setAttribute("x", "220");
    mTxt.setAttribute("y", String(b.y + 4));
    mTxt.setAttribute("text-anchor", "middle");
    mTxt.setAttribute("font-size", "11");
    mTxt.setAttribute("font-weight", "bold");
    mTxt.setAttribute("fill", "#f8fafc");
    mTxt.textContent = b.label;
    svg.append(mTxt);

    b.leafY.forEach((ly, k) => {
      const leafLine = document.createElementNS(SVG_NS, "path");
      leafLine.setAttribute("d", `M 270 ${b.y} Q 320 ${b.y} 340 ${ly}`);
      leafLine.setAttribute("fill", "none");
      leafLine.setAttribute("stroke", "#22c55e");
      leafLine.setAttribute("stroke-width", "1.5");
      svg.append(leafLine);

      const leafDot = document.createElementNS(SVG_NS, "circle");
      leafDot.setAttribute("cx", "345");
      leafDot.setAttribute("cy", String(ly));
      leafDot.setAttribute("r", "5");
      leafDot.setAttribute("fill", "#22c55e");
      svg.append(leafDot);

      const leafTag = document.createElementNS(SVG_NS, "text");
      leafTag.setAttribute("x", "358");
      leafTag.setAttribute("y", String(ly + 4));
      leafTag.setAttribute("font-size", "10");
      leafTag.setAttribute("fill", "#4ade80");
      leafTag.textContent = `路径 ${k + 1} ✔`;
      svg.append(leafTag);
    });
  });

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "🌳 树状图导引：有序分类列出各级分支，分类相加、分步相乘，确保不重不漏。";
  card.append(legend);

  return card;
}

/**
 * 12. 抽屉原理与最不利原则可视化 (Pigeonhole & Worst-Case Drawer Model)
 */

function renderPigeonholeDrawers(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--pigeonhole";
  card.dataset.visualType = "pigeonhole";

  const nums = parseNumbers(prompt);
  let totalItems = 0;
  let drawerCount = 3;
  let targetCount = 2;

  if (prompt.includes("海水样本") || prompt.includes("小艇") || prompt.includes("频道") || prompt.includes("书架") || prompt.includes("出生在同一个月份") || prompt.includes("余数相同")) {
    if (prompt.includes("月份")) {
      totalItems = nums[0] || 25;
      drawerCount = 12;
      targetCount = Math.floor(totalItems / drawerCount) + 1;
    } else if (prompt.includes("除以 3")) {
      totalItems = nums[0] || 8;
      drawerCount = 3;
      targetCount = Math.floor(totalItems / drawerCount) + 1;
    } else {
      totalItems = nums[0] || 17;
      drawerCount = nums[1] || 4;
      targetCount = Math.floor(totalItems / drawerCount) + 1;
    }
  } else {
    if (prompt.includes("红球") && prompt.includes("黄球") && prompt.includes("蓝球")) {
      drawerCount = 3;
    } else if (prompt.includes("黑") && prompt.includes("白")) {
      drawerCount = 2;
    } else if (prompt.includes("3 种颜色") || prompt.includes("三种颜色")) {
      drawerCount = 3;
    } else if (nums.length >= 2) {
      drawerCount = nums[1] <= 10 ? nums[1] : 3;
    }
    const targetMatch = prompt.match(/(\d+)\s*(?:张|个|枚).*?(?:同一种颜色|颜色相同)/);
    targetCount = targetMatch ? Number(targetMatch[1]) : (nums.find(n => n > 1 && n <= 5) || 2);
  }

  const isExtraction = totalItems === 0;
  const worstCase = isExtraction ? drawerCount * (targetCount - 1) : totalItems;
  const guaranteed = isExtraction ? worstCase + 1 : targetCount;

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🗄️ 抽屉原理与最不利原则</span>
    <span class="question-visual__subbadge">${isExtraction ? "极端分配 ＋ 1 必成匹配" : "平均分配余数定理"}</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 155;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const displayDrawers = Math.min(Math.max(drawerCount, 2), 4);
  const boxW = Math.floor((svgWidth - 60 - (displayDrawers - 1) * 12) / displayDrawers);
  const boxH = 75;
  const startY = 45;

  const drawerColors = ["#38bdf8", "#ec4899", "#10b981", "#f59e0b"];
  const drawerLabels = prompt.includes("潮汐") ? ["红潮卡", "蓝潮卡", "绿潮卡", "金潮卡"]
    : prompt.includes("球") ? ["红球箱", "黄球箱", "蓝球箱", "绿球箱"]
    : prompt.includes("棋子") ? ["黑棋盒", "白棋盒"]
    : ["检测槽 1", "检测槽 2", "检测槽 3", "检测槽 4"];

  for (let i = 0; i < displayDrawers; i++) {
    const bx = 30 + i * (boxW + 12);
    const color = drawerColors[i % drawerColors.length];

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", String(bx));
    rect.setAttribute("y", String(startY));
    rect.setAttribute("width", String(boxW));
    rect.setAttribute("height", String(boxH));
    rect.setAttribute("rx", "6");
    rect.setAttribute("fill", "rgba(30, 41, 59, 0.7)");
    rect.setAttribute("stroke", color);
    rect.setAttribute("stroke-width", "2");
    rect.setAttribute("stroke-dasharray", "4 2");
    svg.append(rect);

    const t = document.createElementNS(SVG_NS, "text");
    t.setAttribute("x", String(bx + boxW / 2));
    t.setAttribute("y", String(startY + boxH + 16));
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("font-size", "11");
    t.setAttribute("font-weight", "bold");
    t.setAttribute("fill", color);
    t.textContent = drawerLabels[i] || `抽屉 ${i + 1}`;
    svg.append(t);

    const itemsInBox = isExtraction ? Math.min(targetCount - 1, 3) : Math.min(Math.floor(totalItems / drawerCount), 4);
    for (let it = 0; it < itemsInBox; it++) {
      const cx = bx + 22 + it * 24;
      const cy = startY + 38;
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", String(cx));
      circle.setAttribute("cy", String(cy));
      circle.setAttribute("r", "9");
      circle.setAttribute("fill", color);
      circle.setAttribute("opacity", "0.85");
      svg.append(circle);

      const num = document.createElementNS(SVG_NS, "text");
      num.setAttribute("x", String(cx));
      num.setAttribute("y", String(cy + 4));
      num.setAttribute("text-anchor", "middle");
      num.setAttribute("font-size", "10");
      num.setAttribute("font-weight", "bold");
      num.setAttribute("fill", "#0f172a");
      num.textContent = String(it + 1);
      svg.append(num);
    }
  }

  if (isExtraction && isRevealed) {
    const sparkX = svgWidth - 75;
    const sparkY = 22;
    const keyCard = document.createElementNS(SVG_NS, "rect");
    keyCard.setAttribute("x", String(sparkX - 25));
    keyCard.setAttribute("y", String(sparkY - 14));
    keyCard.setAttribute("width", "54");
    keyCard.setAttribute("height", "26");
    keyCard.setAttribute("rx", "4");
    keyCard.setAttribute("fill", "#fbbf24");
    keyCard.setAttribute("stroke", "#f59e0b");
    keyCard.setAttribute("stroke-width", "2");
    svg.append(keyCard);

    const keyText = document.createElementNS(SVG_NS, "text");
    keyText.setAttribute("x", String(sparkX + 2));
    keyText.setAttribute("y", String(sparkY + 4));
    keyText.setAttribute("text-anchor", "middle");
    keyText.setAttribute("font-size", "11");
    keyText.setAttribute("font-weight", "bold");
    keyText.setAttribute("fill", "#0f172a");
    keyText.textContent = `＋1张✨`;
    svg.append(keyText);

    const arrow = document.createElementNS(SVG_NS, "path");
    arrow.setAttribute("d", `M ${sparkX} ${sparkY + 14} L ${sparkX - 30} ${startY + 20}`);
    arrow.setAttribute("stroke", "#fbbf24");
    arrow.setAttribute("stroke-width", "2");
    svg.append(arrow);
  }

  const formulaText = document.createElementNS(SVG_NS, "text");
  formulaText.setAttribute("x", "20");
  formulaText.setAttribute("y", "24");
  formulaText.setAttribute("font-size", "12");
  formulaText.setAttribute("font-weight", "bold");
  formulaText.setAttribute("fill", "#f8fafc");
  if (isExtraction) {
    formulaText.textContent = isRevealed ? `最不利情况: 各抽 ${targetCount - 1} 张共 ${worstCase} 张 ➔ 再抽 1 张必达标 (共 ${guaranteed} 张)` : `最不利情况: 各抽 ${targetCount - 1} 张共 ${worstCase} 张 ➔ 再抽 ? 张必达标`;
  } else {
    formulaText.textContent = isRevealed ? `${totalItems} ÷ ${drawerCount} ＝ ${Math.floor(totalItems/drawerCount)}……${totalItems%drawerCount} ➔ 至少有一个格至少有 ${targetCount} 个` : `抽屉分配模型：${totalItems} 个对象分配给 ${drawerCount} 个抽屉 ➔ 思考最大可能数`;
  }
  svg.append(formulaText);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = isExtraction
    ? `🎯 最不利原则：先按“每种颜色抽 ${targetCount - 1} 张”的极端情况考虑，已抽 ${worstCase} 张；第 ${guaranteed} 张不管什么颜色，都能保证有一种达到 ${targetCount} 张！`
    : `📦 抽屉原理：把 ${totalItems} 个对象平均分给 ${drawerCount} 个抽屉，至少有一个抽屉分得 ${targetCount} 个或更多。`;
  card.append(legend);

  return card;
}

/**
 * 13. 行程问题动态空间轨迹 (Motion Track)
 */

function renderLogicGrid(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--logic";
  card.dataset.visualType = "logic";

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🧩 逻辑推理交叉排除表</span>
    <span class="question-visual__subbadge">列表排除：否定已知锁定唯一真相</span>
  `;
  card.append(header);

  const isSpeed = prompt.includes("快") || prompt.includes("重");
  const table = document.createElement("table");
  table.className = "question-visual__table question-visual__logic-table";

  if (isSpeed) {
    table.innerHTML = isRevealed ? `
      <thead>
        <tr>
          <th>角色</th>
          <th>1号 (第一)</th>
          <th>2号 (第二)</th>
          <th>3号 (第三)</th>
          <th>推导结论</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>甲</strong></td><td><span class="logic-cell--check">✔ 最优</span></td><td>❌</td><td>❌</td><td>最快/最重</td></tr>
        <tr><td><strong>乙</strong></td><td>❌</td><td><span class="logic-cell--check">✔ 居中</span></td><td>❌</td><td>中间</td></tr>
        <tr><td><strong>丙</strong></td><td>❌</td><td>❌</td><td><span class="logic-cell--check">✔ 垫底</span></td><td>最慢/最轻</td></tr>
      </tbody>
    ` : `
      <thead>
        <tr>
          <th>角色</th>
          <th>1号 (第一)</th>
          <th>2号 (第二)</th>
          <th>3号 (第三)</th>
          <th>推导结论</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>甲</strong></td><td>❓</td><td>❓</td><td>❓</td><td>待推理</td></tr>
        <tr><td><strong>乙</strong></td><td>❓</td><td>❓</td><td>❓</td><td>待推理</td></tr>
        <tr><td><strong>丙</strong></td><td>❓</td><td>❓</td><td>❓</td><td>待推理</td></tr>
      </tbody>
    `;
  } else {
    const isABCD = prompt.includes("D");
    if (isABCD) {
      table.innerHTML = isRevealed ? `
        <thead>
          <tr><th>对象</th><th>1号位</th><th>2号位</th><th>3号位</th><th>4号位 (最后)</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>A</strong></td><td>—</td><td>—</td><td>—</td><td><span class="logic-cell--cross">❌ 不是最后</span></td></tr>
          <tr><td><strong>B</strong></td><td>—</td><td>—</td><td>—</td><td><span class="logic-cell--cross">❌ 不是最后</span></td></tr>
          <tr><td><strong>C</strong></td><td>—</td><td>—</td><td>—</td><td><span class="logic-cell--cross">❌ 不是最后</span></td></tr>
          <tr><td><strong>D</strong></td><td>—</td><td>—</td><td>—</td><td><span class="logic-cell--check">✔ 唯一确认</span></td></tr>
        </tbody>
      ` : `
        <thead>
          <tr><th>对象</th><th>1号位</th><th>2号位</th><th>3号位</th><th>4号位 (最后)</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>A</strong></td><td>—</td><td>—</td><td>—</td><td><span class="logic-cell--cross">❌ 否定条件</span></td></tr>
          <tr><td><strong>B</strong></td><td>—</td><td>—</td><td>—</td><td><span class="logic-cell--cross">❌ 否定条件</span></td></tr>
          <tr><td><strong>C</strong></td><td>—</td><td>—</td><td>—</td><td><span class="logic-cell--cross">❌ 否定条件</span></td></tr>
          <tr><td><strong>D</strong></td><td>—</td><td>—</td><td>—</td><td>❓ 待锁定</td></tr>
        </tbody>
      `;
    } else {
      table.innerHTML = isRevealed ? `
        <thead>
          <tr><th>对象</th><th>1号 (第一)</th><th>2号 (第二)</th><th>3号 (第三)</th><th>推理结论</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>甲 / A</strong></td><td><span class="logic-cell--cross">❌ 排除</span></td><td>—</td><td>—</td><td>排除 1 号</td></tr>
          <tr><td><strong>乙 / B</strong></td><td><span class="logic-cell--cross">❌ 排除</span></td><td>—</td><td>—</td><td>排除 1 号</td></tr>
          <tr><td><strong>丙 / C</strong></td><td><span class="logic-cell--check">✔ 必在1号</span></td><td>—</td><td>—</td><td>唯一锁定</td></tr>
        </tbody>
      ` : `
        <thead>
          <tr><th>对象</th><th>1号 (第一)</th><th>2号 (第二)</th><th>3号 (第三)</th><th>推理结论</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>甲 / A</strong></td><td><span class="logic-cell--cross">❌ 排除</span></td><td>—</td><td>—</td><td>排除 1 号</td></tr>
          <tr><td><strong>乙 / B</strong></td><td><span class="logic-cell--cross">❌ 排除</span></td><td>—</td><td>—</td><td>排除 1 号</td></tr>
          <tr><td><strong>丙 / C</strong></td><td>❓ 待推断</td><td>—</td><td>—</td><td>待锁定</td></tr>
        </tbody>
      `;
    }
  }

  card.append(table);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "🧩 排除法导引：根据题干中的“不是...”、“不在...”等否定条件在表格中打❌，唯一剩余的位置即为确定的解。";
  card.append(legend);

  return card;
}

/**
 * 16. 年龄问题年龄差与倍数模型 (Age Difference Bar Model)
 */

function renderBarChartVisual(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--barchart";
  card.dataset.visualType = "barchart";

  const nums = parseNumbers(prompt);
  const values = nums.length >= 3 ? nums.slice(0, 5) : [12, 18, 15, 9];
  const maxV = Math.max(...values, 20);

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📊 条形统计图与频数分析</span>
    <span class="question-visual__subbadge">直观柱高对比数量差异</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const axisX = document.createElementNS(SVG_NS, "line");
  axisX.setAttribute("x1", "50"); axisX.setAttribute("y1", "120");
  axisX.setAttribute("x2", "420"); axisX.setAttribute("y2", "120");
  axisX.setAttribute("stroke", "#64748b"); axisX.setAttribute("stroke-width", "2");
  svg.append(axisX);

  const axisY = document.createElementNS(SVG_NS, "line");
  axisY.setAttribute("x1", "50"); axisY.setAttribute("y1", "30");
  axisY.setAttribute("x2", "50"); axisY.setAttribute("y2", "120");
  axisY.setAttribute("stroke", "#64748b"); axisY.setAttribute("stroke-width", "2");
  svg.append(axisY);

  const barW = 38;
  const stepX = 350 / (values.length + 1);
  const colors = ["#38bdf8", "#ec4899", "#10b981", "#f59e0b", "#a855f7"];
  const labels = ["项目甲", "项目乙", "项目丙", "项目丁", "项目戊"];

  values.forEach((v, i) => {
    const cx = 60 + (i + 1) * stepX;
    const barH = (v / maxV) * 78;
    const cy = 120 - barH;
    const color = colors[i % colors.length];

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", String(cx - barW / 2)); rect.setAttribute("y", String(cy));
    rect.setAttribute("width", String(barW)); rect.setAttribute("height", String(barH));
    rect.setAttribute("rx", "4"); rect.setAttribute("fill", color); rect.setAttribute("opacity", "0.85");
    svg.append(rect);

    const valTag = document.createElementNS(SVG_NS, "text");
    valTag.setAttribute("x", String(cx)); valTag.setAttribute("y", String(cy - 5));
    valTag.setAttribute("text-anchor", "middle");
    valTag.setAttribute("font-size", "11"); valTag.setAttribute("font-weight", "bold");
    valTag.setAttribute("fill", "#f8fafc"); valTag.textContent = String(v);
    svg.append(valTag);

    const lbl = document.createElementNS(SVG_NS, "text");
    lbl.setAttribute("x", String(cx)); lbl.setAttribute("y", "136");
    lbl.setAttribute("text-anchor", "middle");
    lbl.setAttribute("font-size", "10"); lbl.setAttribute("fill", "#94a3b8");
    lbl.textContent = labels[i] || `组${i + 1}`;
    svg.append(lbl);
  });

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "📊 统计图读图导引：条形统计图用直条的高低表示数量的多少，直条越长，表示数值越大。";
  card.append(legend);

  return card;
}

/**
 * 23. 折线统计图与动态走势 (Line Chart & Trend Analysis)
 */

function renderLineChartVisual(question) {
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--linechart";
  card.dataset.visualType = "linechart";

  const nums = parseNumbers(prompt);
  const values = nums.length >= 3 ? nums.slice(0, 5) : [15, 22, 18, 28, 25];
  const maxV = Math.max(...values, 30);
  const minV = Math.min(...values, 0);

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">📈 折线统计图与趋势走势</span>
    <span class="question-visual__subbadge">点位起伏展现数量增减变化</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 150;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const pts = [];
  const stepX = 350 / (values.length - 1 || 1);
  values.forEach((v, i) => {
    const x = 55 + i * stepX;
    const y = 115 - ((v - minV) / (maxV - minV || 1)) * 75;
    pts.push({ x, y, v });
  });

  const poly = document.createElementNS(SVG_NS, "path");
  const pathD = pts.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  poly.setAttribute("d", pathD);
  poly.setAttribute("fill", "none"); poly.setAttribute("stroke", "#38bdf8"); poly.setAttribute("stroke-width", "3");
  svg.append(poly);

  pts.forEach((p, idx) => {
    const dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("cx", String(p.x)); dot.setAttribute("cy", String(p.y));
    dot.setAttribute("r", "5"); dot.setAttribute("fill", "#0284c7");
    dot.setAttribute("stroke", "#f8fafc"); dot.setAttribute("stroke-width", "2");
    svg.append(dot);

    const valTag = document.createElementNS(SVG_NS, "text");
    valTag.setAttribute("x", String(p.x)); valTag.setAttribute("y", String(p.y - 8));
    valTag.setAttribute("text-anchor", "middle");
    valTag.setAttribute("font-size", "11"); valTag.setAttribute("font-weight", "bold");
    valTag.setAttribute("fill", "#38bdf8"); valTag.textContent = String(p.v);
    svg.append(valTag);

    const xLabel = document.createElementNS(SVG_NS, "text");
    xLabel.setAttribute("x", String(p.x)); xLabel.setAttribute("y", "136");
    xLabel.setAttribute("text-anchor", "middle");
    xLabel.setAttribute("font-size", "10"); xLabel.setAttribute("fill", "#94a3b8");
    xLabel.textContent = `${idx + 1}月`;
    svg.append(xLabel);
  });

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "📈 折线图核心导引：折线统计图不仅能看出数量的多少，更能清晰看出数量增减变化的整体发展趋势。";
  card.append(legend);

  return card;
}

/**
 * 24. 概率轮盘与随机事件模型 (Probability Spinner & Random Urn)
 */

function renderProbabilitySpinnerVisual(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const card = document.createElement("div");
  card.className = "question-visual question-visual--spinner";
  card.dataset.visualType = "spinner";

  const nums = parseNumbers(prompt);
  const isBallOrBag = prompt.includes("球") || prompt.includes("信标") || prompt.includes("芯片") || prompt.includes("袋中") || prompt.includes("盒中") || prompt.includes("抽签") || prompt.includes("签");
  const isSpinner = prompt.includes("转盘") || prompt.includes("指针") || prompt.includes("扇区");

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🎯 概率事件与可能性模型</span>
    <span class="question-visual__subbadge">${isBallOrBag ? "随机抽取样本空间模型" : isSpinner ? "几何测度转盘面积占比模型" : "古典概型等可能样本空间"}</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 155;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  if (isBallOrBag) {
    // Draw Urn / Jar with colored spheres
    const jx = 45, jy = 22, jw = 95, jh = 110;
    const jar = document.createElementNS(SVG_NS, "rect");
    jar.setAttribute("x", String(jx)); jar.setAttribute("y", String(jy));
    jar.setAttribute("width", String(jw)); jar.setAttribute("height", String(jh));
    jar.setAttribute("rx", "12");
    jar.setAttribute("fill", "rgba(15, 23, 42, 0.65)");
    jar.setAttribute("stroke", "#38bdf8"); jar.setAttribute("stroke-width", "2");
    svg.append(jar);

    const n1 = nums[0] !== undefined ? nums[0] : 3;
    const n2 = nums[1] !== undefined ? nums[1] : 3;
    const total = nums.length >= 2 && prompt.includes("共") ? nums[0] : (n1 + n2);
    const targetCount = prompt.includes("共") && nums.length >= 2 ? (nums[1] || n1) : n1;

    // Draw balls inside jar
    const ballR = 7;
    const drawTotal = Math.min(Math.max(total, 6), 12);
    for (let i = 0; i < drawTotal; i++) {
      const isFirst = i < Math.min(targetCount, 6);
      const col = i % 3;
      const row = Math.floor(i / 3);
      const bx = jx + 22 + col * 26;
      const by = jy + jh - 20 - row * 22;

      const ball = document.createElementNS(SVG_NS, "circle");
      ball.setAttribute("cx", String(bx)); ball.setAttribute("cy", String(by));
      ball.setAttribute("r", String(ballR));
      ball.setAttribute("fill", isFirst ? "#38bdf8" : "#ef4444");
      ball.setAttribute("stroke", "#ffffff"); ball.setAttribute("stroke-width", "1");
      svg.append(ball);
    }

    const rx = 165;
    const t1 = document.createElementNS(SVG_NS, "text");
    t1.setAttribute("x", String(rx)); t1.setAttribute("y", "46");
    t1.setAttribute("font-size", "12"); t1.setAttribute("font-weight", "bold");
    t1.setAttribute("fill", "#38bdf8"); t1.textContent = `▪ 目标数量 (有利基本事件): ${targetCount} 个`;
    svg.append(t1);

    const t2 = document.createElementNS(SVG_NS, "text");
    t2.setAttribute("x", String(rx)); t2.setAttribute("y", "74");
    t2.setAttribute("font-size", "12"); t2.setAttribute("font-weight", "bold");
    t2.setAttribute("fill", "#94a3b8"); t2.textContent = `▪ 样本总数 (全部可能结果): ${total} 个`;
    svg.append(t2);

    const ansTxt = isRevealed ? (question.answer || `${targetCount}/${total}`) : "?";
    const t3 = document.createElementNS(SVG_NS, "text");
    t3.setAttribute("x", String(rx)); t3.setAttribute("y", "106");
    t3.setAttribute("font-size", "13"); t3.setAttribute("font-weight", "bold");
    t3.setAttribute("fill", isRevealed ? "#22c55e" : "#f59e0b");
    t3.textContent = `▪ 发生概率 ＝ ${targetCount} ÷ ${total} ＝ ${ansTxt}`;
    svg.append(t3);
  } else {
    // Spinner wheel
    const cx = 110, cy = 80, r = 55;
    const sectors = nums[0] && nums[0] <= 12 && nums[0] >= 2 ? nums[0] : 4;
    const angleStep = 360 / sectors;

    for (let i = 0; i < sectors; i++) {
      const a1 = (i * angleStep - 90) * Math.PI / 180;
      const a2 = ((i + 1) * angleStep - 90) * Math.PI / 180;
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2);
      const y2 = cy + r * Math.sin(a2);
      const largeArc = angleStep > 180 ? 1 : 0;

      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`);
      path.setAttribute("fill", i === 0 ? "#f59e0b" : i % 2 === 0 ? "#38bdf8" : "#3b82f6");
      path.setAttribute("stroke", "#0f172a"); path.setAttribute("stroke-width", "1.5");
      path.setAttribute("opacity", "0.85");
      svg.append(path);
    }

    const needle = document.createElementNS(SVG_NS, "polygon");
    needle.setAttribute("points", `${cx-4},${cy} ${cx+4},${cy} ${cx},${cy-48}`);
    needle.setAttribute("fill", "#f8fafc"); needle.setAttribute("stroke", "#0f172a");
    needle.setAttribute("stroke-width", "1.5");
    svg.append(needle);

    const hub = document.createElementNS(SVG_NS, "circle");
    hub.setAttribute("cx", String(cx)); hub.setAttribute("cy", String(cy));
    hub.setAttribute("r", "7"); hub.setAttribute("fill", "#f59e0b");
    svg.append(hub);

    const rx = 195;
    const p1 = document.createElementNS(SVG_NS, "text");
    p1.setAttribute("x", String(rx)); p1.setAttribute("y", "46");
    p1.setAttribute("font-size", "12"); p1.setAttribute("font-weight", "bold");
    p1.setAttribute("fill", "#f59e0b"); p1.textContent = `▪ 目标区域: 1 份 / ${sectors} 份`;
    svg.append(p1);

    const p2 = document.createElementNS(SVG_NS, "text");
    p2.setAttribute("x", String(rx)); p2.setAttribute("y", "74");
    p2.setAttribute("font-size", "12"); p2.setAttribute("font-weight", "bold");
    p2.setAttribute("fill", "#38bdf8"); p2.textContent = `▪ 几何概率: 面积份额占整体的比例`;
    svg.append(p2);

    const ansTxt = isRevealed ? (question.answer || `1/${sectors}`) : "?";
    const p3 = document.createElementNS(SVG_NS, "text");
    p3.setAttribute("x", String(rx)); p3.setAttribute("y", "106");
    p3.setAttribute("font-size", "13"); p3.setAttribute("font-weight", "bold");
    p3.setAttribute("fill", isRevealed ? "#22c55e" : "#f59e0b");
    p3.textContent = `▪ 发生概率 ＝ 1 ÷ ${sectors} ＝ ${ansTxt}`;
    svg.append(p3);
  }

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  legend.textContent = "🎯 概率法则：某事件发生的可能性大小等于该事件包含的有利基本结果数除以全部可能结果总数。";
  card.append(legend);

  return card;
}

/**
 * 25. 方程等式与天平平衡模型 (Equation & Balance Scale Model)
 */

function renderSquareArrayVisual(question, options = {}) {
  const isRevealed = options && options.status ? (options.status === "retry" || options.status === "resolved") : true;
  const prompt = question.prompt || "";
  const cleaned = cleanPrompt(prompt);
  const card = document.createElement("div");
  card.className = "question-visual question-visual--square-array";
  card.dataset.visualType = "square-array";

  const sideMatch = cleaned.match(/(?:每边|一边|每排|每行|每列)(?:一共有|一共|总共|共有|共|有|站)?\s*(\d+)\s*(?:人|个|颗|枚)?/);
  const outerMatch = cleaned.match(/(?:最外层|外围|最外圈)(?:一共有|一共|总共|共有|共|有)?\s*(\d+)\s*(?:人|个|颗|枚)?/);
  const totalMatch = cleaned.match(/(?:实心方阵|总人数|一共有|一共|共有|总共|全部)(?:一共有|一共|总共|共有|共|有)?\s*(\d+)\s*(?:人|个|颗|枚)?/);

  let actualN = 5;
  let isGivenOuter = false;

  if (sideMatch) {
    actualN = parseInt(sideMatch[1], 10);
  } else if (outerMatch) {
    const outerVal = parseInt(outerMatch[1], 10);
    actualN = Math.max(3, Math.round((outerVal + 4) / 4));
    isGivenOuter = true;
  } else if (totalMatch) {
    const totVal = parseInt(totalMatch[1], 10);
    const sq = Math.round(Math.sqrt(totVal));
    if (sq * sq === totVal && sq >= 3) {
      actualN = sq;
    }
  } else {
    const nums = cleanParseNumbers(cleaned);
    if (nums.length > 0) {
      if (nums[0] >= 3 && nums[0] <= 15) {
        actualN = nums[0];
      } else if (nums[0] > 15 && nums[0] % 4 === 0) {
        actualN = Math.round((nums[0] + 4) / 4);
        isGivenOuter = true;
      }
    }
  }

  const outerCount = actualN * 4 - 4;
  const totalCount = actualN * actualN;

  // Dot display sample grid (max 5x5 to prevent visual bloat, with indicator)
  const displayN = Math.min(Math.max(actualN, 3), 5);

  const header = document.createElement("div");
  header.className = "question-visual__header";
  header.innerHTML = `
    <span class="question-visual__badge">🔲 方阵点阵排列与圈层模型</span>
    <span class="question-visual__subbadge">${isGivenOuter ? "已知最外层逆求每边人数" : "最外层四角共用计数原理"}</span>
  `;
  card.append(header);

  const svgWidth = 460;
  const svgHeight = 160;
  const svg = createSvg(svgWidth, svgHeight, `0 0 ${svgWidth} ${svgHeight}`);

  const startX = 40, startY = 32;
  const spacing = 22;

  for (let r = 0; r < displayN; r++) {
    for (let c = 0; c < displayN; c++) {
      const isCorner = (r === 0 || r === displayN - 1) && (c === 0 || c === displayN - 1);
      const isBorder = r === 0 || r === displayN - 1 || c === 0 || c === displayN - 1;

      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("cx", String(startX + c * spacing));
      dot.setAttribute("cy", String(startY + r * spacing));
      dot.setAttribute("r", isCorner ? "6" : "4.5");
      dot.setAttribute("fill", isCorner ? "#fbbf24" : isBorder ? "#38bdf8" : "#64748b");
      svg.append(dot);
    }
  }

  if (actualN !== displayN) {
    const hint = document.createElementNS(SVG_NS, "text");
    hint.setAttribute("x", String(startX + (displayN * spacing) / 2));
    hint.setAttribute("y", String(startY + displayN * spacing + 18));
    hint.setAttribute("text-anchor", "middle");
    hint.setAttribute("font-size", "11");
    hint.setAttribute("fill", "#94a3b8");
    hint.textContent = `(结构图示: 实际每边 ${actualN} 人)`;
    svg.append(hint);
  }

  const rx = startX + displayN * spacing + 35;
  const t1 = document.createElementNS(SVG_NS, "text");
  t1.setAttribute("x", String(rx)); t1.setAttribute("y", "45");
  t1.setAttribute("font-size", "12"); t1.setAttribute("font-weight", "bold");
  t1.setAttribute("fill", "#fbbf24"); t1.textContent = "★ 四个角顶点: 4 点 (被两条边重复计算)";
  svg.append(t1);

  const t2 = document.createElementNS(SVG_NS, "text");
  t2.setAttribute("x", String(rx)); t2.setAttribute("y", "75");
  t2.setAttribute("font-size", "12"); t2.setAttribute("font-weight", "bold");
  t2.setAttribute("fill", "#38bdf8");
  if (isGivenOuter) {
    t2.textContent = isRevealed
      ? `▪ 每边人数: (${outerCount} + 4) ÷ 4 = ${actualN} 人 (或 ${outerCount} ÷ 4 + 1)`
      : `▪ 每边人数: (${outerCount} + 4) ÷ 4 = ? 人`;
  } else {
    t2.textContent = isRevealed
      ? `▪ 最外层总人数: ${actualN} × 4 - 4 = ${outerCount} 人`
      : `▪ 最外层总人数: ${actualN} × 4 - 4 = ? 人`;
  }
  svg.append(t2);

  const t3 = document.createElementNS(SVG_NS, "text");
  t3.setAttribute("x", String(rx)); t3.setAttribute("y", "105");
  t3.setAttribute("font-size", "12"); t3.setAttribute("font-weight", "bold");
  t3.setAttribute("fill", "#22c55e");
  t3.textContent = isRevealed ? `▪ 实心方阵总人数: ${actualN} × ${actualN} = ${totalCount} 人` : `▪ 实心方阵总人数: ${actualN} × ${actualN} = ? 人`;
  svg.append(t3);

  card.append(svg);

  const legend = document.createElement("p");
  legend.className = "question-visual__legend";
  if (isGivenOuter) {
    legend.textContent = `🔲 方阵逆推规律：已知最外层 ${outerCount} 人，加上 4 个角补齐为 4 条完整边，每边人数 ＝ (${outerCount} + 4) ÷ 4 ＝ ${actualN} 人。`;
  } else {
    legend.textContent = `🔲 方阵核心规律：最外层每边 ${actualN} 人，四角顶点均被两条边共用，最外层总数 ＝ (${actualN} - 1) × 4 ＝ ${outerCount} 人。`;
  }
  card.append(legend);

  return card;
}

/**
 * 29. 分段计费与阶梯阶跃标尺 (Tiered Pricing & Bracket Ruler)
 */

module.exports = {
  renderTable,
  renderSequenceTrack,
  renderCycleWheel,
  renderVennDiagram,
  renderEnumerationTree,
  renderPigeonholeDrawers,
  renderLogicGrid,
  renderBarChartVisual,
  renderLineChartVisual,
  renderProbabilitySpinnerVisual,
  renderSquareArrayVisual
};
