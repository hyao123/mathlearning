const assert = require("node:assert/strict");
const test = require("node:test");

const config = require("../game/levelRewardConfig.js");
const { CHAPTER_IDS } = require("../game/chapterConfig.js");

test("each first-chapter level has exactly ten fixed mainline reward slots", () => {
  const levelIds = config.listLevelIds("chapter-01");
  assert.equal(levelIds.length, 12);

  for (const levelId of levelIds) {
    const row = config.getLevelRewardConfig(levelId);
    assert.equal(row.fixedRewards.length, 10, levelId);
    assert.deepEqual(row.fixedRewards.map((reward) => reward.questionSlot), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }
});

test("fixed first-clear rewards alone can craft every J-20 component, part, and final fighter", () => {
  const report = config.simulateFullClearCraft("chapter-01");
  assert.equal(report.ok, true, report.errors.join("; "));
  assert.equal(report.canCraftFinal, true);
  assert.equal(report.usedOnlyFixedRewards, true);
  assert.equal(report.inventory["j20-sky-fighter"], 1);
});

test("fixed chapter-four clears alone craft the polar icebreaker", () => {
  const report = config.simulateFullClearCraft("chapter-04");

  assert.equal(config.listLevelIds("chapter-04").length, 12);
  assert.equal(report.ok, true, report.errors.join("; "));
  assert.equal(report.canCraftFinal, true);
  assert.equal(report.usedOnlyFixedRewards, true);
  assert.equal(report.inventory["polar-icebreaker"], 1);
});

test("fixed chapter-five clears alone craft the 99A main battle tank", () => {
  const report = config.simulateFullClearCraft("chapter-05");

  assert.equal(config.listLevelIds("chapter-05").length, 12);
  assert.equal(report.ok, true, report.errors.join("; "));
  assert.equal(report.canCraftFinal, true);
  assert.equal(report.inventory["99a-main-battle-tank"], 1);
});

test("fixed chapter-six clears alone craft the quantum communication satellite", () => {
  const report = config.simulateFullClearCraft("chapter-06");

  assert.equal(config.listLevelIds("chapter-06").length, 12);
  assert.equal(report.ok, true, report.errors.join("; "));
  assert.equal(report.canCraftFinal, true);
  assert.equal(report.inventory["quantum-communication-satellite"], 1);
});

test("every enabled chapter has twelve complete reward tracks and can finish its project with fixed rewards", () => {
  for (const chapterId of CHAPTER_IDS) {
    const levelIds = config.listLevelIds(chapterId);
    assert.equal(levelIds.length, 12, chapterId);

    for (const levelId of levelIds) {
      const row = config.getLevelRewardConfig(levelId);
      assert.equal(row.fixedRewards.length, 10, levelId);
      assert.deepEqual(row.fixedRewards.map((reward) => reward.questionSlot), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], levelId);
    }

    const report = config.simulateFullClearCraft(chapterId);
    assert.equal(report.ok, true, `${chapterId}: ${report.errors.join("; ")}`);
    assert.equal(report.canCraftFinal, true, chapterId);
    assert.equal(report.usedOnlyFixedRewards, true, chapterId);
  }
});

test("fixed rewards can traverse raw materials through processing before final assembly", () => {
  for (const chapterId of CHAPTER_IDS) {
    const report = config.simulateFullClearCraft(chapterId);
    assert.equal(report.processingComplete, true, chapterId);
    assert.equal(report.canCraftFinal, true, chapterId);
  }
});

test("the canonical reward track resolves by level and question slot", () => {
  const track = config.getRewardTrack("chapter-01-level-1");
  assert.equal(track.chapterId, "chapter-01");
  assert.equal(track.levelId, "chapter-01-level-1");
  assert.equal(track.questionSlots.length, 10);
  assert.deepEqual(track.questionSlots.map((slot) => slot.questionSlot), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const entry = config.getQuestionRewardTrack("chapter-01-level-1", 1);
  assert.deepEqual(entry.fixedReward, { questionSlot: 1, itemId: "oak-log", quantity: 1 });
  assert.equal(Array.isArray(entry.bonusPool), true);
  assert.equal(typeof entry.streakItemId, "string");
});
