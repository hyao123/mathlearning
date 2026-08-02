const assert = require("node:assert/strict");
const test = require("node:test");

const profiles = require("../game/chapterQualityProfiles.js");
const stories = require("../game/storyMissionModel.js");

test("each first-chapter module has a specific quality profile with ten cognitive missions", () => {
  assert.equal(Object.keys(profiles.PROFILE_BY_MODULE).length, 12);
  Object.values(profiles.PROFILE_BY_MODULE).forEach((profile) => {
    assert.equal(profile.goals.length, 10);
    assert.equal(typeof profile.objective, "string");
    assert.equal(typeof profile.observation, "string");
  });
});

test("profile generation gives every slot a distinct mission and a boss-level difficulty profile", () => {
  const module = { id: "patterns" };
  const question = { answer: "48", explanation: "每次都乘 2，所以 24 乘 2 得 48。" };
  const early = profiles.getQuestionQualityProfile(module, question, 1);
  const boss = profiles.getQuestionQualityProfile(module, question, 10);
  assert.notEqual(early.storyBeat, boss.storyBeat);
  assert.equal(early.difficultyProfile.steps, 1);
  assert.equal(early.solutionReview.steps.length, 3);
  assert.equal(boss.difficultyProfile.steps, 4);
  assert.equal(boss.solutionReview.steps.length, 4);
  assert.equal(boss.difficultyProfile.transfer, "boss-integration");
  assert.equal(boss.solutionReview.answer, "48");
});

test("story mission variants are topic-specific and stable across rebuilds", () => {
  const module = { id: "discount-tax", title: "折扣与税率" };
  const first = Array.from({ length: 10 }, (_, index) => stories.getStoryMission(module, { chapterId: "chapter-05", slot: index + 1, difficulty: index < 2 ? "基础" : "提高" }));
  const second = Array.from({ length: 10 }, (_, index) => stories.getStoryMission(module, { chapterId: "chapter-05", slot: index + 1, difficulty: index < 2 ? "基础" : "提高" }));

  assert.deepEqual(first, second);
  assert.equal(new Set(first.map((entry) => entry.storyBeat)).size >= 4, true);
  assert.equal(first.every((entry) => entry.storyBeat.includes("折扣与税率")), true);
  assert.equal(first.every((entry) => entry.scene && entry.variantIndex >= 0), true);
});
