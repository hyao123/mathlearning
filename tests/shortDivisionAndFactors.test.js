const test = require("node:test");
const assert = require("node:assert/strict");

// Simple mock DOM environment for Node.js unit testing
function createMockElement(tag) {
  const el = {
    tagName: tag.toUpperCase(),
    children: [],
    attributes: {},
    className: "",
    innerHTML: "",
    textContent: "",
    classList: {
      classes: [],
      add(cls) { el.classList.classes.push(cls); },
      contains(cls) {
        const names = (el.className || "").split(/\s+/).concat(el.classList.classes);
        return names.includes(cls);
      }
    },
    dataset: {},
    setAttribute(key, val) { el.attributes[key] = String(val); },
    getAttribute(key) { return el.attributes[key]; },
    append(...children) { el.children.push(...children); }
  };
  return el;
}

if (!globalThis.document) {
  globalThis.document = {
    createElement: (tag) => createMockElement(tag),
    createElementNS: (ns, tag) => createMockElement(tag)
  };
}

const QuestionVisualizer = require("../game/questionVisualizer.js");
const MathThinkingMethods = require("../game/mathThinkingMethods.js");
const HintScaffold = require("../game/hintScaffold.js");
const fs = require("node:fs");
const path = require("node:path");

function getMockText(el) {
  if (!el) return "";
  let text = el.textContent || el.innerHTML || "";
  if (Array.isArray(el.children)) {
    text += " " + el.children.map(getMockText).join(" ");
  }
  return text;
}

test("短除法阶梯可视化器：两数求GCD与LCM及恒等定理自检", () => {
  const q = {
    id: "test-gcd-lcm-1",
    moduleId: "factors-multiples",
    prompt: "求 24 和 36 的最大公因数与最小公倍数是多少？"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "factor-tree");
  assert.ok(visual.classList.contains("question-visual--factor-tree"));

  const fullText = getMockText(visual);
  // 必须包含最大公因数、最小公倍数、底行互质、恒等定理
  assert.ok(fullText.includes("最大公因数 (GCD)"), "Should explain GCD");
  assert.ok(fullText.includes("最小公倍数 (LCM)"), "Should explain LCM");
  assert.ok(fullText.includes("12"), "GCD of 24 and 36 is 12");
  assert.ok(fullText.includes("72"), "LCM of 24 and 36 is 72");
  assert.ok(fullText.includes("互质"), "Should mark coprime stopping condition");
  assert.ok(fullText.includes("A × B = GCD × LCM") || fullText.includes("864"), "Should output fundamental identity");
});

test("短除法阶梯可视化器：自适应互质两数与单数分解", () => {
  // 互质两数
  const qCoprime = {
    id: "test-coprime",
    prompt: "4 和 5 的最小公倍数是多少？"
  };
  const vCoprime = QuestionVisualizer.createQuestionVisual(qCoprime);
  assert.ok(vCoprime);
  const textCoprime = getMockText(vCoprime);
  assert.ok(textCoprime.includes("互质") || textCoprime.includes("20"));

  // 单数质因数分解
  const qSingle = {
    id: "test-single-factor",
    prompt: "把 48 分解质因数，最大的两位数因数是多少？"
  };
  const vSingle = QuestionVisualizer.createQuestionVisual(qSingle);
  assert.ok(vSingle);
  const textSingle = getMockText(vSingle);
  assert.ok(textSingle.includes("质因数分解") || textSingle.includes("48"));
});

test("题目可视化路由器对公约数、公倍数、短除法各种词型的鲁棒路由", () => {
  const prompts = [
    "求 18 和 24 的最大公约数是多少？",
    "求 12 和 18 的公倍数中最小的一个是多少？",
    "利用短除法求解两数的公因数",
    "判断 15 是不是 5 的倍数",
    "24 的所有因数中最小的是多少？"
  ];

  for (const prompt of prompts) {
    const visual = QuestionVisualizer.createQuestionVisual({ prompt });
    assert.ok(visual, `Prompt should be routed: ${prompt}`);
    assert.equal(visual.dataset.visualType, "factor-tree", `Should route to factor-tree: ${prompt}`);
  }
});

test("思维方法体系中质因数分解与短除法解构独立映射", () => {
  const method = MathThinkingMethods.getThinkingMethod("factor-decomposition");
  assert.ok(method, "factor-decomposition method should exist");
  assert.equal(method.label, "质因数分解与短除法");
  assert.equal(method.reasoningType, "关系建模");
  assert.match(method.review, /短除|互质|最大公因数|最小公倍数/);
  assert.match(method.verification, /A × B = GCD × LCM/);

  // 运行时有效方法映射：因倍数/短除法题目精准解析至 factor-decomposition
  const effective = MathThinkingMethods.getEffectiveThinkingMethod({ id: "factors-multiples" });
  assert.equal(effective.id, "factor-decomposition");
  const effectivePrime = MathThinkingMethods.getEffectiveThinkingMethod({ id: "prime-factorization" });
  assert.equal(effectivePrime.id, "factor-decomposition");
  const effectivePrompt = MathThinkingMethods.getEffectiveThinkingMethod({ prompt: "求 24 和 36 的最大公约数" });
  assert.equal(effectivePrompt.id, "factor-decomposition");

  // 历史发布指纹保护：传统构建模块保持稳定
  const legacy = MathThinkingMethods.getMethodForModule({ id: "factors-multiples" });
  assert.equal(legacy.id, "verify-eliminate");

});

test("动图解释引擎 factors-multiples 模型与动画组件存在", () => {
  const code = fs.readFileSync(path.join(__dirname, "../game/knowledgeMotionExplainer.js"), "utf-8");
  assert.ok(code.includes('"factors-multiples"'), "Should register factors-multiples in MOTION_MODELS");
  assert.ok(code.includes("renderFactorsMultiplesAnimation"), "Should define renderFactorsMultiplesAnimation");
  assert.ok(code.includes("短除梯级 · 因倍数分解模型"), "Should have title");
  assert.ok(code.includes("左侧竖列相乘 = 最大公因数(GCD)"), "Should have formula");
});

test("知识拓扑树中 factors-multiples 认知桥梁与大国重器工程共振", () => {
  const code = fs.readFileSync(path.join(__dirname, "../game/knowledgeTopologyAdapter.js"), "utf-8");
  assert.ok(code.includes('"factors-multiples": {'), "Should register factors-multiples in MODULE_TOPOLOGY");
  assert.ok(code.includes("空间站椭圆轨道交会对接控制"), "Should have engineering affinity");
  assert.ok(code.includes("阶梯短除法"), "Should have methodSummary label");
});

test("分层阶梯提示与智能错因诊断：精准识别 GCD 与 LCM 混淆", () => {
  const qGCD = {
    prompt: "求 24 和 36 的最大公因数是多少？",
    answer: "12"
  };
  const hints = HintScaffold.buildTieredHints(qGCD);
  assert.equal(hints.length, 3);
  assert.match(hints[0].text, /最大公因数|最小公倍数/);
  assert.match(hints[1].text, /短除/);
  assert.match(hints[2].text, /GCD|LCM|两数之积/);

  // 学生把 GCD 误算成了 LCM (72 > 12)
  const diagGCD = HintScaffold.diagnoseMistake(qGCD, "72");
  assert.ok(diagGCD);
  assert.match(diagGCD, /最小公倍数/);

  // 学生把 LCM 误算成了 GCD (12 < 72)
  const qLCM = {
    prompt: "求 24 和 36 的最小公倍数是多少？",
    answer: "72"
  };
  const diagLCM = HintScaffold.diagnoseMistake(qLCM, "12");
  assert.ok(diagLCM);
  assert.match(diagLCM, /最大公因数/);
});
