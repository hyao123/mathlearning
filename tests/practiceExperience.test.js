const assert = require("node:assert/strict");
const test = require("node:test");

const practiceExperience = require("../practiceExperience.js");

test("normalizes practice experience preferences", () => {
  assert.deepEqual(practiceExperience.normalizePreference(), { showOnlyUnfinished: false });
  assert.deepEqual(practiceExperience.normalizePreference({ showOnlyUnfinished: 1 }), { showOnlyUnfinished: true });
});

test("hides completed cards only when unfinished filter is on", () => {
  assert.equal(practiceExperience.shouldHidePracticeCard({ isCompleted: true, showOnlyUnfinished: true }), true);
  assert.equal(practiceExperience.shouldHidePracticeCard({ isCompleted: false, showOnlyUnfinished: true }), false);
  assert.equal(practiceExperience.shouldHidePracticeCard({ isCompleted: true, showOnlyUnfinished: false }), false);
});

test("finds the next selectable index with wraparound", () => {
  assert.equal(practiceExperience.getNextIndex([true, true, true], 0), 1);
  assert.equal(practiceExperience.getNextIndex([true, false, true], 0), 2);
  assert.equal(practiceExperience.getNextIndex([false, false, true], 2), 2);
  assert.equal(practiceExperience.getNextIndex([], 0), -1);
});
