const assert = require("node:assert/strict");
const test = require("node:test");

const selectors = require("../appSelectors.js");

const modules = [
  {
    id: "patterns",
    title: "找规律",
    grades: ["一年级", "二年级"],
    examples: [{ difficulty: "基础" }, { difficulty: "提高" }],
    practices: [{ id: "p1", difficulty: "基础" }, { id: "p2", difficulty: "提高" }]
  },
  {
    id: "logic",
    title: "逻辑推理",
    grades: ["三年级"],
    examples: [{ difficulty: "挑战" }],
    practices: [{ id: "l1", difficulty: "挑战" }]
  }
];

test("filters modules and builds practice pools by grade and difficulty", () => {
  const visible = selectors.getVisibleModules(modules, "一年级", "基础");
  assert.equal(visible.length, 1);
  assert.equal(visible[0].id, "patterns");

  const pool = selectors.getPracticePool(modules, "全部", "提高");
  assert.deepEqual(pool.map((item) => item.id), ["p2"]);
  assert.equal(pool[0].moduleTitle, "找规律");
});

test("calculates completion and correct rate", () => {
  assert.equal(selectors.getModuleCompletedCount(modules[0], { p1: true, p2: false }), 1);
  assert.equal(selectors.getTotalPracticeCount(modules), 3);
  assert.equal(selectors.getCorrectRate({ attempts: 4, correct: 3 }), "75%");
  assert.equal(selectors.getCorrectRate({ attempts: 0, correct: 0 }), "0%");
});

test("groups modules by primary grade using configured grade order", () => {
  const grouped = selectors.groupModulesByPrimaryGrade(modules, "全部", ["一年级", "二年级", "三年级"]);
  assert.deepEqual([...grouped.keys()], ["一年级", "三年级"]);
});
