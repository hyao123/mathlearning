// Tiered Hint Scaffold System
// Generates three progressive pedagogical hints for learners without revealing the raw final answer:
// Tier 1: Clue & Condition Focus (avoid pitfalls, identify key quantities)
// Tier 2: Method & Model Direction (how to think about the problem)
// Tier 3: Formula & Step Scaffold (intermediate operation guidance)

function buildTieredHints(question) {
  if (!question || typeof question !== "object") return [];

  const hints = [];
  const prompt = String(question.prompt || "");
  const moduleId = String(question.moduleId || "");
  const isFactorProblem = /最大公因数|最大公约数|最小公倍数|公因数|公约数|公倍数|质因数|短除|互质/.test(prompt) || ["factors-multiples", "prime-factorization"].includes(moduleId);

  // Tier 1: Clue & Condition Focus (关键审题与避坑)
  let tier1Text = "";
  if (question.commonPitfall) {
    tier1Text = `⚠️ 避坑提醒：${question.commonPitfall}`;
  } else if (question.solutionReview?.pitfall) {
    tier1Text = `⚠️ 避坑提醒：${question.solutionReview.pitfall}`;
  } else if (question.storyBeat) {
    tier1Text = `🔍 审题线索：${question.storyBeat}`;
  } else if (isFactorProblem) {
    tier1Text = "🔍 审题线索：圈出题目中的两个关键数字，明确求的是【最大公因数 (GCD)】还是【最小公倍数 (LCM)】，倍数因数关系莫混淆。";
  } else {
    tier1Text = "🔍 审题线索：圈出题目中的已知数字和单位，明确最终所求的单一量还是总量。";
  }
  hints.push({
    tier: 1,
    label: "第一阶 · 关键审题",
    text: tier1Text
  });

  // Tier 2: Method & Model Direction (思维模型与解题策略)
  let tier2Text = "";
  if (question.methodPrompt) {
    tier2Text = `💡 思维方法：${question.methodPrompt}`;
  } else if (question.solutionReview?.method) {
    tier2Text = `💡 推荐策略【${question.solutionReview.method}】：${question.solutionReview.observation || "先找出最核心的数量对应关系与差量。"}`;
  } else if (question.solution?.strategy) {
    tier2Text = `💡 推荐策略【${question.solution.strategy}】：${question.solution.summary || "先抓住题目中最核心的一对数量差量或对应关系。"}`;
  } else if (question.thinkingMethodLabel) {
    tier2Text = `💡 思维模型：本题可运用【${question.thinkingMethodLabel}】进行结构化分析。`;
  } else if (question.typicalModel) {
    tier2Text = `💡 思维模型：本题对应【${question.typicalModel}】经典数学模型。`;
  } else if (isFactorProblem) {
    tier2Text = "💡 推荐策略【短除法与因倍数分解】：两数并排画出短除阶梯，从公质因数 2、3、5... 依次试除，直到商互质（公因数只有 1）为止。";
  } else {
    tier2Text = "💡 思维模型：通过画线段图或列表，对比前后变化量或建立等量关系。";
  }
  hints.push({
    tier: 2,
    label: "第二阶 · 思维模型",
    text: tier2Text
  });

  // Tier 3: Formula & Step Scaffold (算式骨架 - 中间运算指引，不直接剧透最终数字)
  let tier3Text = "";
  const solSteps = question.solution?.steps;
  const reviewSteps = question.solutionReview?.steps;

  if (Array.isArray(solSteps) && solSteps.length > 0) {
    const stepLines = solSteps.map((s, idx) => {
      const stepName = s.name || `第 ${idx + 1} 步`;
      const stepExpl = s.explanation || "";
      return `• 步骤 ${idx + 1}【${stepName}】：${stepExpl}`;
    });
    tier3Text = `📐 计算骨架：\n${stepLines.join("\n")}`;
  } else if (Array.isArray(reviewSteps) && reviewSteps.length > 0) {
    const rawAnswer = String(question.answer ?? "").trim();
    const stepLines = reviewSteps.map((stepText, idx) => {
      let masked = stepText;
      if (rawAnswer && rawAnswer.length > 0 && masked.includes(rawAnswer)) {
        masked = masked.split(rawAnswer).join("(待求结果)");
      }
      return `• 步骤 ${idx + 1}：${masked}`;
    });
    tier3Text = `📐 算式骨架：\n${stepLines.join("\n")}\n• 最终关键步骤：根据上述中间算式，独立计算得出最终数值。`;
  } else if (question.solutionReview?.calculation) {
    const calc = question.solutionReview.calculation;
    const rawAnswer = String(question.answer ?? "").trim();
    const maskedCalc = rawAnswer ? calc.split(rawAnswer).join("?") : calc;
    tier3Text = `📐 算式骨架：解题运算路径为【${maskedCalc}】，请独立计算得出最终数值。`;
  } else if (question.verification?.summary) {
    tier3Text = `📐 验算指引：${question.verification.summary}，可根据此对应关系倒推算式。`;
  } else if (isFactorProblem) {
    tier3Text = "📐 算式骨架：\n• 半边（左竖列公质因数）相乘 ＝ 最大公因数 (GCD)；\n• 一圈（“L”型整环所有因数）连乘 ＝ 最小公倍数 (LCM)；\n• 恒等定理验算：两数之积 ＝ GCD × LCM。";
  } else {
    tier3Text = "📐 算式指引：分步列出算式，先计算中间差量或单位量，再计算最终所求。";
  }
  hints.push({
    tier: 3,
    label: "第三阶 · 算式骨架",
    text: tier3Text
  });

  return hints;
}

function diagnoseMistake(question, studentAnswer) {
  if (!question || studentAnswer === undefined || studentAnswer === null) return null;
  const prompt = String(question.prompt || "");
  const sAnsStr = String(studentAnswer).trim();
  const cAnsStr = String(question.answer ?? "").trim();
  if (!sAnsStr || !cAnsStr) return null;

  const sNum = parseFloat(sAnsStr);
  const cNum = parseFloat(cAnsStr);
  const isNumeric = !isNaN(sNum) && !isNaN(cNum);

  // 1. 单位转换与数量级偏差 (10x, 60x, 100x, 1000x)
  if (isNumeric && cNum !== 0 && sNum !== 0) {
    const ratio = sNum / cNum;
    if (Math.abs(ratio - 10) < 0.001 || Math.abs(ratio - 0.1) < 0.001) {
      return "你的计算数值相差 10 倍，请仔细核对题目单位是否统一（例如厘米与分米，或十进制进退位）。";
    }
    if (Math.abs(ratio - 60) < 0.001 || Math.abs(ratio - (1 / 60)) < 0.001) {
      return "你的计算数值相差 60 倍，请检查时间单位换算（1 小时 = 60 分钟，1 分钟 = 60 秒）。";
    }
    if (Math.abs(ratio - 100) < 0.001 || Math.abs(ratio - 0.01) < 0.001) {
      return "你的计算数值相差 100 倍，请检查面积单位换算（1 平方米 = 100 平方分米）或百分数/小数转换。";
    }
    if (Math.abs(ratio - 1000) < 0.001 || Math.abs(ratio - 0.001) < 0.001) {
      return "你的计算数值相差 1000 倍，请检查长度（千米与米）或重量（千克与克）单位换算。";
    }
  }

  // 2. 植树问题 / 间隔问题 (端点差一)
  if (/植树|路灯|电线杆|锯木|切段|爬楼|阶梯|敲钟|间隔/.test(prompt) && isNumeric) {
    const diff = sNum - cNum;
    if (diff === -1) {
      return "你的答案比正确答案少了 1。请检查是否漏算了端点？两端都植树时：棵数 = 间隔数 + 1；敲钟问题从第 1 下开始算起。";
    }
    if (diff === 1) {
      return "你的答案比正确答案多了 1。请检查是否多算了端点？两端都不植树（如两座楼之间）时：棵数 = 间隔数 - 1；锯木头次数 = 段数 - 1。";
    }
  }

  // 3. 鸡兔同笼 / 置换问题 (算成了另一种动物)
  if (/鸡|兔|头|腿|足|自行车|三轮车|蜘蛛|蜻蜓|轮子/.test(prompt) && isNumeric) {
    const headMatch = prompt.match(/共(?:有)?\s*(\d+)\s*(?:只|头|辆)/);
    if (headMatch) {
      const totalHeads = parseInt(headMatch[1], 10);
      if (Math.abs(sNum + cNum - totalHeads) < 0.001) {
        return `你算出的可能是另一种对象的数量（二者之和为 ${totalHeads}）。题目问的是特定对象，记得用总数减去你算出的量！`;
      }
    }
  }

  // 4. 行程问题 (相遇与追及速度混淆)
  if (/相遇|追及|相向|同向|背向|迎面|速度/.test(prompt)) {
    if (isNumeric && /相遇|相向/.test(prompt) && !/追及|追上/.test(prompt)) {
      return "相向而行时两人距离在快速缩短，求解相遇时间应用【路程和 ÷ 速度和】，注意不要误用速度差！";
    }
    if (isNumeric && /追及|追上|同向/.test(prompt)) {
      return "同向追及时后车缩短与前车的距离，求解追及时间应用【路程差 ÷ 速度差】，注意不要误用速度和！";
    }
  }

  // 5. 和倍与差倍问题 (份数多算或少算 1 份)
  if (/倍/.test(prompt) && isNumeric) {
    const diff = sNum - cNum;
    if (Math.abs(diff) === 1) {
      return "倍数问题中请注意：较小数作为 1 倍基准量；求和时总份数为 (倍数 + 1)，求差时总份数为 (倍数 - 1)。";
    }
  }

  // 6. 还原 / 逆推问题
  if (/还原|倒推|原来|又拿走|又放入/.test(prompt)) {
    return "还原逆推问题口诀：从最后的结果倒着推回去，加变减、减变加、乘变除、除变乘！";
  }

  // 7. 最大公因数与最小公倍数混淆，或短除未除尽到互质
  if (/最大公因数|最大公约数|最小公倍数|公因数|公约数|公倍数|短除|质因数|互质/.test(prompt) && isNumeric) {
    if (/最大公因数|最大公约数/.test(prompt) && sNum > cNum) {
      return "你计算的可能是【最小公倍数(LCM)】或两者乘积！短除法中，最大公因数(GCD)只乘【左侧竖列】的公质因数，结果不会大于任何一个原数。";
    }
    if (/最小公倍数|公倍数/.test(prompt) && sNum < cNum) {
      return "你计算的可能是【最大公因数(GCD)】！求最小公倍数(LCM)时，必须把【左侧竖列公质因数】和【底行互质商】呈“L”型全部连乘。";
    }
    return "短除法关键警示：必须连续除以公质因数，直到商【互质】（公因数只有 1）为止！检查底部的商是否还能继续提取公因数。";
  }

  // 8. 若有针对性的 commonPitfall 则作为高价值诊断
  if (question.commonPitfall) {
    return `诊断提醒：${question.commonPitfall}`;
  }

  return "审题指引：仔细对比题目所求量与中间计算量，先列出线段图或等量关系再验算一步。";
}

function renderActiveThinkingScaffold(question) {
  if (!question || typeof question !== "object" || typeof document === "undefined") return null;
  const hints = buildTieredHints(question);
  if (!hints || hints.length === 0) return null;

  const container = document.createElement("details");
  container.className = "active-hints-scaffold";
  container.dataset.activeHintsScaffold = "";

  const summary = document.createElement("summary");
  summary.className = "active-hints-scaffold__summary";
  summary.innerHTML = `
    <span class="active-hints-scaffold__title">💡 解题遇到卡点？点击获取【阶梯思维点拨】</span>
    <span class="active-hints-scaffold__badge">分层启发 · 保护独立思考</span>
  `;
  container.append(summary);

  const content = document.createElement("div");
  content.className = "active-hints-scaffold__content";

  hints.forEach((hint) => {
    const card = document.createElement("div");
    card.className = `active-hints-scaffold__card active-hints-scaffold__card--tier${hint.tier}`;
    const header = document.createElement("div");
    header.className = "active-hints-scaffold__card-header";
    header.textContent = hint.label;
    const body = document.createElement("div");
    body.className = "active-hints-scaffold__card-body";
    body.textContent = hint.text;
    card.append(header, body);
    content.append(card);
  });

  container.append(content);
  return container;
}

const HintScaffold = {
  buildTieredHints,
  diagnoseMistake,
  renderActiveThinkingScaffold
};
module.exports = HintScaffold;
