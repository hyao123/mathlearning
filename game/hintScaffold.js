// Tiered Hint Scaffold System
// Generates three progressive pedagogical hints for learners without revealing the raw final answer:
// Tier 1: Clue & Condition Focus (avoid pitfalls, identify key quantities)
// Tier 2: Method & Model Direction (how to think about the problem)
// Tier 3: Formula & Step Scaffold (intermediate operation guidance)

function buildTieredHints(question) {
  if (!question || typeof question !== "object") return [];

  const hints = [];

  // Tier 1: Clue & Condition Focus
  let tier1Text = "";
  if (question.commonPitfall) {
    tier1Text = `⚠️ 避坑提醒：${question.commonPitfall}`;
  } else if (question.storyBeat) {
    tier1Text = `🔍 审题线索：${question.storyBeat}`;
  } else {
    tier1Text = "🔍 审题线索：圈出题目中的已知数字和单位，分清求的是单一量还是总量。";
  }
  hints.push({
    tier: 1,
    label: "第一阶 · 关键审题",
    text: tier1Text
  });

  // Tier 2: Method & Model Direction
  let tier2Text = "";
  if (question.methodPrompt) {
    tier2Text = `💡 思维方法：${question.methodPrompt}`;
  } else if (question.solution?.strategy) {
    tier2Text = `💡 推荐策略【${question.solution.strategy}】：${question.solution.summary || "先抓住题目中最核心的一对数量差量或对应关系。"}`;
  } else if (question.thinkingMethodLabel) {
    tier2Text = `💡 思维模型：本题可使用【${question.thinkingMethodLabel}】进行思考。`;
  } else {
    tier2Text = "💡 思维模型：先假设极端情况，或者列表对比前后两种状态的差量。";
  }
  hints.push({
    tier: 2,
    label: "第二阶 · 思维模型",
    text: tier2Text
  });

  // Tier 3: Formula & Step Scaffold
  let tier3Text = "";
  const steps = question.solution?.steps;
  if (Array.isArray(steps) && steps.length > 0) {
    const stepLines = steps.map((s, idx) => {
      const stepName = s.name || `第 ${idx + 1} 步`;
      const stepExpl = s.explanation || "";
      return `• 步骤 ${idx + 1}【${stepName}】：${stepExpl}`;
    });
    tier3Text = `📐 计算骨架：\n${stepLines.join("\n")}`;
  } else if (question.verification?.summary) {
    tier3Text = `📐 验算指引：${question.verification.summary}，根据此关系反推算式。`;
  } else {
    tier3Text = "📐 算式指引：列出算式，用总量减去已知分量，再求出单位量。";
  }
  hints.push({
    tier: 3,
    label: "第三阶 · 算式骨架",
    text: tier3Text
  });

  return hints;
}

const HintScaffold = {
  buildTieredHints
};
module.exports = HintScaffold;
