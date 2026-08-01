const assert = require("node:assert/strict");
const test = require("node:test");

const profiles = require("../game/chapterQualityProfiles.js");

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
  assert.equal(boss.difficultyProfile.steps, 4);
  assert.equal(boss.difficultyProfile.transfer, "boss-integration");
  assert.equal(boss.solutionReview.answer, "48");
});
