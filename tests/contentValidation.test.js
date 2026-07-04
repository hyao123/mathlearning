const assert = require("node:assert/strict");
const test = require("node:test");

const validator = require("../scripts/validate-content.js");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("content validator exposes injectable validation helpers", () => {
  assert.equal(typeof validator.loadContentState, "function");
  assert.equal(typeof validator.validateContentState, "function");
});

test("content validator rejects broken learning-effect references", () => {
  const state = validator.loadContentState();
  const broken = clone(state);
  broken.gradePath["二年级"].push("missing-module");
  broken.reviewSets[0].moduleIds.push("missing-review-module");
  broken.reviewSets[0].practiceIds.push("missing-review-practice");

  const result = validator.validateContentState(broken);

  assert.ok(result.errors.some((error) => error.includes("unknown grade path module id")));
  assert.ok(result.errors.some((error) => error.includes("unknown review set module id")));
  assert.ok(result.errors.some((error) => error.includes("unknown review set practice id")));
});

test("content validator rejects unexpected fallback strands", () => {
  const state = validator.loadContentState();
  const broken = clone(state);
  broken.modules[0].knowledgeTopology.strand = "综合迁移";

  const result = validator.validateContentState(broken);

  assert.ok(result.errors.some((error) => error.includes("unexpected fallback strand")));
});

test("content validator rejects incompatible remediation tags", () => {
  const state = validator.loadContentState();
  const broken = clone(state);
  const motion = broken.modules.find((module) => module.id === "motion");
  motion.practices[0].remediationTags.push("work-unit");

  const result = validator.validateContentState(broken);

  assert.ok(result.errors.some((error) => error.includes("remediation tag \"work-unit\" is not allowed")));
});
