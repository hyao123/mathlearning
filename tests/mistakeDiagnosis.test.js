const assert = require("node:assert/strict");
const test = require("node:test");

const diagnosis = require("../mistakeDiagnosis.js");

test("normalizes explicit mistake tags", () => {
  assert.deepEqual(diagnosis.normalizeTags(["余数定位", "point-interval", "unknown"]), ["remainder-position", "point-interval"]);
});

test("infers tags from prompt text", () => {
  const tags = diagnosis.inferTagsFromText("按红黄蓝循环排列，第 20 个是什么颜色？");
  assert.ok(tags.includes("remainder-position"));
});

test("uses explicit practice tags before inferred tags", () => {
  const practice = {
    id: "p1",
    prompt: "今天是星期五，10 天后是星期几？",
    mistakeTags: ["arithmetic-care"]
  };
  assert.deepEqual(diagnosis.getTagsForPractice(practice, { id: "periodicity" }), ["arithmetic-care"]);
});

test("adds module-level tags to practices", () => {
  const modules = [
    {
      id: "tree-planting",
      title: "植树问题",
      practices: [{ id: "p1", prompt: "24 米每隔 4 米，两端都种，种几棵？" }]
    }
  ];
  const [module] = diagnosis.applyMistakeTagsToModules(modules);
  assert.ok(module.practices[0].mistakeTags.includes("point-interval"));
});

test("summarizes wrong-book items by diagnosis tags", () => {
  const modules = [
    {
      id: "motion",
      title: "行程问题",
      practices: [{ id: "m1", prompt: "两人相遇，速度分别是 50 和 40。", mistakeTags: ["motion-relative"] }]
    },
    {
      id: "average",
      title: "平均数问题",
      practices: [{ id: "a1", prompt: "求平均数。", mistakeTags: ["average-total"] }]
    }
  ];
  const summary = diagnosis.summarizeWrongBook([{ id: "m1" }, { id: "a1" }, { id: "m1" }], modules);
  assert.equal(summary[0].id, "motion-relative");
  assert.equal(summary[0].count, 2);
  assert.equal(summary[1].id, "average-total");
});
