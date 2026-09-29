const assert = require("node:assert/strict");
const test = require("node:test");
const { COGNITIVE_PHASE_SLOTS, getCognitivePhaseSlot } = require("../game/chapterConfig.js");
const { buildChapter } = require("../game/chapterBuilder.js");
const HintScaffold = require("../game/hintScaffold.js");
const KnowledgeTopology = require("../knowledgeTopology.js");

test("Five-Stage Cognitive Ladder slots definition and boundary safety", () => {
  assert.equal(COGNITIVE_PHASE_SLOTS.length, 10);
  
  // Slot 0-1: anchor
  assert.equal(getCognitivePhaseSlot(0).phase, "anchor");
  assert.equal(getCognitivePhaseSlot(0).badge, "🎯 母题定模");
  assert.equal(getCognitivePhaseSlot(1).phase, "anchor");

  // Slot 2-4: transfer
  assert.equal(getCognitivePhaseSlot(2).phase, "transfer");
  assert.equal(getCognitivePhaseSlot(2).badge, "🔄 情境迁移");
  assert.equal(getCognitivePhaseSlot(3).phase, "transfer");
  assert.equal(getCognitivePhaseSlot(4).phase, "transfer");

  // Slot 5-6: inverse
  assert.equal(getCognitivePhaseSlot(5).phase, "inverse");
  assert.equal(getCognitivePhaseSlot(5).badge, "⏪ 逆向还原");
  assert.equal(getCognitivePhaseSlot(6).phase, "inverse");

  // Slot 7-8: boundary
  assert.equal(getCognitivePhaseSlot(7).phase, "boundary");
  assert.equal(getCognitivePhaseSlot(7).badge, "⚡ 边界极值");
  assert.equal(getCognitivePhaseSlot(8).phase, "boundary");

  // Slot 9: mastery
  assert.equal(getCognitivePhaseSlot(9).phase, "mastery");
  assert.equal(getCognitivePhaseSlot(9).badge, "👑 复合建模");

  // Boundary checks
  assert.equal(getCognitivePhaseSlot(-1).slot, 0);
  assert.equal(getCognitivePhaseSlot(99).slot, 9);
});

test("Built chapter questions inherit cognitive ladder properties", () => {
  const chapter1 = buildChapter("chapter-01", []);
  const level1Questions = chapter1.levels[0].questions;
  assert.equal(level1Questions.length, 10);

  // Check first question (Anchor)
  assert.equal(level1Questions[0].cognitivePhase, "anchor");
  assert.equal(level1Questions[0].cognitiveBadge, "🎯 母题定模");
  assert.equal(typeof level1Questions[0].cognitiveGoal, "string");

  // Check transfer questions
  assert.equal(level1Questions[2].cognitivePhase, "transfer");
  assert.equal(level1Questions[2].cognitiveBadge, "🔄 情境迁移");

  // Check inverse questions
  assert.equal(level1Questions[5].cognitivePhase, "inverse");
  assert.equal(level1Questions[5].cognitiveBadge, "⏪ 逆向还原");

  // Check boundary questions
  assert.equal(level1Questions[7].cognitivePhase, "boundary");
  assert.equal(level1Questions[7].cognitiveBadge, "⚡ 边界极值");

  // Check mastery question (Boss)
  assert.equal(level1Questions[9].cognitivePhase, "mastery");
  assert.equal(level1Questions[9].cognitiveBadge, "👑 复合建模");
});

test("DiagnoseMistake correctly flags Train-Bridge length traps", () => {
  const qBridge = {
    prompt: "一列长200米的列车以20米/秒的速度过桥，桥长800米，通过大桥需要多少秒？",
    answer: 50
  };
  // Student submitted 40 (only used bridge length 800 / 20, omitted train length)
  const diagnosis = HintScaffold.diagnoseMistake(qBridge, 40);
  assert.match(diagnosis, /触碰列车行程雷区/);
  assert.match(diagnosis, /桥长\/隧道长 ＋ 列车车长/);
});

test("DiagnoseMistake correctly flags Average Speed arithmetic mean trap", () => {
  const qSpeed = {
    prompt: "汽车去时速度40千米/时，返回时速度60千米/时，求往返的平均速度是多少？",
    answer: 48
  };
  // Student submitted 50 (directly computed (40+60)/2)
  const diagnosis = HintScaffold.diagnoseMistake(qSpeed, 50);
  assert.match(diagnosis, /平均速度绝不是两个速度相加除以 2/);
  assert.match(diagnosis, /总路程 ÷ 总时间/);
});

test("DiagnoseMistake correctly flags Surplus-Deficit same vs opposite rule", () => {
  const qOpposite = {
    prompt: "分苹果，每人4个还剩8个，每人6个还差4个，求有多少人？",
    answer: 6
  };
  // Opposite (one surplus, one deficit)
  const diagOpposite = HintScaffold.diagnoseMistake(qOpposite, 2);
  assert.match(diagOpposite, /一盈一亏，两次差量相加求总差/);

  const qSame = {
    prompt: "分糖果，每人5块还剩12块，每人7块还剩2块，求有多少人？",
    answer: 5
  };
  const diagSame = HintScaffold.diagnoseMistake(qSame, 7);
  assert.match(diagSame, /同盈同亏，两次差量相减求总差/);
});

test("DiagnoseMistake correctly flags Geometry Area omission of division by 2", () => {
  const qTriangle = {
    prompt: "计算底为12厘米，高为5厘米的三角形面积是多少平方厘米？",
    answer: 30
  };
  // Student submitted 60 (omitted / 2)
  const diagTriangle = HintScaffold.diagnoseMistake(qTriangle, 60);
  assert.match(diagTriangle, /三角形面积 ＝ 底 × 高 ÷ 2/);
  assert.match(diagTriangle, /切勿漏除了 2/);

  // Inverse height check: student submitted 2.5 instead of 5
  const qHeight = {
    prompt: "已知三角形面积为30平方厘米，底为12厘米，求高是多少厘米？",
    answer: 5
  };
  const diagHeight = HintScaffold.diagnoseMistake(qHeight, 2.5);
  assert.match(diagHeight, /先将面积乘 2/);
});

test("DiagnoseMistake correctly flags Age Problem invariant difference principle", () => {
  const qAge = {
    prompt: "爸爸今年38岁，儿子今年10岁，几年后爸爸的年龄是儿子的3倍？",
    answer: 4
  };
  const diagAge = HintScaffold.diagnoseMistake(qAge, 8);
  assert.match(diagAge, /年龄差永恒不变/);
  assert.match(diagAge, /倍数关系每一年都在动态改变/);
});

test("BuildTieredHints integrates cognitive badge when present", () => {
  const q = {
    prompt: "测试题目条件",
    answer: 10,
    cognitiveBadge: "🎯 母题定模",
    cognitiveGoal: "基准识别与公式锚定",
    commonPitfall: "注意进位"
  };
  const hints = HintScaffold.buildTieredHints(q);
  assert.equal(hints.length, 3);
  assert.match(hints[0].text, /🎯 母题定模/);
  assert.match(hints[0].text, /基准识别与公式锚定/);
  assert.match(hints[0].text, /注意进位/);
});

test("KnowledgeTopology exports four Olympiad spiral axes with complete milestones", () => {
  const axes = KnowledgeTopology.olympiadSpiralAxes;
  assert.equal(axes.length, 4);

  const axisIds = axes.map((a) => a.id);
  assert.deepEqual(axisIds, [
    "algebra-elimination",
    "geometry-transformation",
    "number-theory-structure",
    "combinatorics-optimization"
  ]);

  axes.forEach((axis) => {
    assert.equal(typeof axis.title, "string");
    assert.equal(typeof axis.strand, "string");
    assert.equal(typeof axis.summary, "string");
    assert.ok(axis.milestones.length >= 4);
    axis.milestones.forEach((ms) => {
      assert.equal(typeof ms.stage, "string");
      assert.ok(Array.isArray(ms.moduleIds) && ms.moduleIds.length > 0);
      assert.equal(typeof ms.summary, "string");
    });
  });
});
