const assert = require("node:assert/strict");
const test = require("node:test");

const { expansionModules, mergeContentModules } = require("../contentExpansion.js");

function getPractices() {
  return expansionModules.flatMap((module) => module.practices.map((practice) => ({ ...practice, moduleId: module.id })));
}

test("adds multiple new knowledge modules", () => {
  assert.equal(expansionModules.length, 5);
  assert.deepEqual(
    expansionModules.map((module) => module.id),
    ["tree-planting", "chicken-rabbit", "motion", "age", "average"]
  );
});

test("new modules include examples and enough practice items", () => {
  expansionModules.forEach((module) => {
    assert.ok(module.examples.length >= 3, `${module.id} should include examples`);
    assert.ok(module.practices.length >= 6, `${module.id} should include practice items`);
  });
  assert.equal(getPractices().length, 30);
});

test("new practice items include learning support", () => {
  getPractices().forEach((practice) => {
    assert.ok(practice.id, "practice id is required");
    assert.ok(practice.prompt, `${practice.id} prompt is required`);
    assert.ok(practice.answer, `${practice.id} answer is required`);
    assert.ok(practice.explanation, `${practice.id} explanation is required`);
    assert.ok(Array.isArray(practice.hints) && practice.hints.length > 0, `${practice.id} needs hints`);
    assert.ok(Array.isArray(practice.solutionSteps) && practice.solutionSteps.length > 0, `${practice.id} needs solution steps`);
    assert.ok(Array.isArray(practice.commonMistakes) && practice.commonMistakes.length > 0, `${practice.id} needs common mistakes`);
  });
});

test("practice ids are unique", () => {
  const ids = getPractices().map((practice) => practice.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("mergeContentModules appends only missing modules", () => {
  const existing = [{ id: "tree-planting", title: "Existing", examples: [], practices: [] }];
  const merged = mergeContentModules(existing, expansionModules);
  assert.equal(merged.filter((module) => module.id === "tree-planting").length, 1);
  assert.ok(merged.some((module) => module.id === "chicken-rabbit"));
  assert.equal(merged.length, expansionModules.length);
});
