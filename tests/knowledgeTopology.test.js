const assert = require("node:assert/strict");
const test = require("node:test");

const topology = require("../knowledgeTopology.js");
const { continuityModules } = require("../knowledgeContinuityExpansion.js");

test("orders modules by mathematical learning logic", () => {
  const modules = [
    { id: "logic", title: "逻辑推理" },
    { id: "periodicity", title: "周期问题" },
    { id: "patterns", title: "找规律" },
    { id: "surplus-deficit", title: "盈亏问题" }
  ];
  const ordered = topology.orderModulesByTopology(modules).map((module) => module.id);
  assert.deepEqual(ordered, ["patterns", "periodicity", "surplus-deficit", "logic"]);
});

test("adds prerequisite and next titles to modules", () => {
  const modules = [
    { id: "patterns", title: "找规律" },
    { id: "periodicity", title: "周期问题" },
    { id: "enumeration", title: "有序枚举" }
  ];
  const enhanced = topology.applyKnowledgeTopology(modules);
  const periodicity = enhanced.find((module) => module.id === "periodicity");
  assert.deepEqual(periodicity.knowledgeTopology.prerequisiteTitles, ["找规律"]);
  assert.deepEqual(periodicity.knowledgeTopology.nextTitles, ["有序枚举", "tree-planting"]);
});

test("continuity modules all have explicit topology", () => {
  continuityModules.forEach((module) => {
    const item = topology.getTopologyForModule(module);
    assert.notEqual(item.strand, "综合拓展", `${module.id} should have explicit topology`);
    assert.ok(item.whyNow);
    assert.ok(item.continuity);
  });
});

test("unknown modules get a safe fallback topology", () => {
  const item = topology.getTopologyForModule({ id: "unknown" });
  assert.equal(item.strand, "综合拓展");
  assert.ok(item.whyNow);
  assert.ok(item.continuity);
});

test("learning strands describe coherent groups", () => {
  assert.ok(topology.learningStrands.length >= 6);
  const counting = topology.learningStrands.find((strand) => strand.id === "counting");
  assert.deepEqual(counting.moduleIds, ["enumeration", "inclusion-exclusion"]);
});
