const assert = require("node:assert/strict");
const test = require("node:test");

const learningModes = require("../learningModes.js");

test("normalizes learning mode values", () => {
  assert.equal(learningModes.normalizeMode("knowledge"), "knowledge");
  assert.equal(learningModes.normalizeMode("grade"), "grade");
  assert.equal(learningModes.normalizeMode("unknown"), "grade");
  assert.equal(learningModes.normalizeMode(undefined), "grade");
});

test("matches modules by difficulty", () => {
  const module = {
    examples: [{ difficulty: "基础" }],
    practices: [{ difficulty: "提高" }]
  };
  assert.equal(learningModes.moduleMatchesDifficulty(module, "全部"), true);
  assert.equal(learningModes.moduleMatchesDifficulty(module, "基础"), true);
  assert.equal(learningModes.moduleMatchesDifficulty(module, "提高"), true);
  assert.equal(learningModes.moduleMatchesDifficulty(module, "挑战"), false);
});

test("groups modules by knowledge strand", () => {
  const modules = [
    { id: "patterns", title: "找规律", knowledgeTopology: { strand: "观察与周期" }, examples: [], practices: [{ difficulty: "基础" }] },
    { id: "enumeration", title: "有序枚举", knowledgeTopology: { strand: "计数与集合" }, examples: [], practices: [{ difficulty: "提高" }] },
    { id: "custom", title: "自定义", examples: [], practices: [{ difficulty: "基础" }] }
  ];
  const groups = learningModes.groupModulesByKnowledgeStrand(modules, "基础");
  assert.deepEqual([...groups.keys()], ["观察与周期", "综合拓展"]);
  assert.equal(groups.get("观察与周期")[0].id, "patterns");
  assert.equal(groups.get("综合拓展")[0].id, "custom");
});
