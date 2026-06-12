const assert = require("node:assert/strict");
const test = require("node:test");

const conceptAnimations = require("../conceptAnimations.js");

const expectedModules = [
  "patterns",
  "periodicity",
  "enumeration",
  "inclusion-exclusion",
  "sum-diff",
  "unit-rate",
  "surplus-deficit",
  "chicken-rabbit",
  "average",
  "motion",
  "age",
  "tree-planting",
  "geometry",
  "logic"
];

test("provides concept animations for core knowledge modules", () => {
  expectedModules.forEach((moduleId) => {
    const animation = conceptAnimations.getAnimationForModule({ id: moduleId });
    assert.ok(animation.id, `${moduleId} should have animation id`);
    assert.ok(animation.title, `${moduleId} should have title`);
    assert.ok(animation.intro, `${moduleId} should have intro`);
    assert.ok(animation.sceneType, `${moduleId} should have scene type`);
    assert.ok(animation.steps.length >= 3, `${moduleId} should have at least 3 steps`);
  });
});

test("falls back to a generic animation for unknown modules", () => {
  const animation = conceptAnimations.getAnimationForModule({ id: "unknown" });
  assert.equal(animation.id, "generic-model");
  assert.equal(animation.steps.length, 3);
});

test("clamps step indexes safely", () => {
  assert.equal(conceptAnimations.normalizeStepIndex(-1, 3), 0);
  assert.equal(conceptAnimations.normalizeStepIndex(1, 3), 1);
  assert.equal(conceptAnimations.normalizeStepIndex(9, 3), 2);
  assert.equal(conceptAnimations.normalizeStepIndex(Number.NaN, 3), 0);
});

test("gets a valid step from animation", () => {
  const animation = conceptAnimations.getAnimationForModule({ id: "motion" });
  assert.equal(conceptAnimations.getStep(animation, -1).label, animation.steps[0].label);
  assert.equal(conceptAnimations.getStep(animation, 99).label, animation.steps[animation.steps.length - 1].label);
});

test("returns cloned animation data", () => {
  const first = conceptAnimations.getAnimationForModule({ id: "patterns" });
  const second = conceptAnimations.getAnimationForModule({ id: "patterns" });
  first.steps[0].label = "changed";
  assert.notEqual(second.steps[0].label, "changed");
});
