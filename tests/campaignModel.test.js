const assert = require("node:assert/strict");
const test = require("node:test");

const campaign = require("../game/campaignModel.js");
const builder = require("../game/chapterBuilder.js");

function loadChapters() {
  global.window = globalThis;
  ["data.js", "contentExpansion.js", "knowledgeContinuityExpansion.js", "priorityContentExpansion.js", "supplementalContentExpansion.js", "supplementalContentFixes.js", "knowledgeTopology.js", "supplementalTopologyExpansion.js"].forEach((file) => require(`../${file}`));
  return ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06"].map((id) => builder.buildChapter(id, globalThis.MATH_LEARNING_DATA));
}

test("migrates a chapter-one save into a campaign while preserving inventory", () => {
  const chapters = loadChapters();
  const result = campaign.createCampaign(chapters, null, { "oak-log": 2 }, JSON.stringify({
    activeChapterId: "chapter-01",
    unlockedLevelIds: ["chapter-01-level-1", "chapter-01-level-2"],
    levelRecords: { "chapter-01-level-1": { starCount: 2 } }
  }));
  assert.deepEqual(result.unlockedChapterIds, ["chapter-01"]);
  assert.equal(result.chapterStates["chapter-01"].inventory["oak-log"], 2);
  assert.equal(result.chapterStates["chapter-01"].levelRecords["chapter-01-level-1"].starCount, 2);
});

test("persists independent chapter states in one campaign envelope", () => {
  const chapters = loadChapters();
  const initial = campaign.createCampaign(chapters, null, { quartz: 3 });
  const saved = campaign.serializeCampaign(initial);
  const restored = campaign.createCampaign(chapters, saved, { quartz: 3 });
  assert.equal(restored.activeChapterId, "chapter-01");
  assert.equal(Object.keys(JSON.parse(saved).chapterStates).length, 6);
  assert.equal(restored.chapterStates["chapter-03"].inventory.quartz, 3);
  assert.equal(restored.chapterStates["chapter-04"].inventory.quartz, 3);
});

test("serializes one canonical root inventory instead of chapter inventory copies", () => {
  const chapters = loadChapters();
  const campaignState = campaign.createCampaign(chapters, null, { quartz: 3, "oak-log": 2 });
  const saved = JSON.parse(campaign.serializeCampaign(campaignState));

  assert.deepEqual(saved.inventory, { quartz: 3, "oak-log": 2 });
  Object.values(saved.chapterStates).forEach((state) => assert.equal(Object.hasOwn(state, "inventory"), false));
});

test("merges legacy chapter inventories into one global inventory during migration", () => {
  const chapters = loadChapters();
  const legacy = JSON.stringify({
    activeChapterId: "chapter-02",
    chapterStates: {
      "chapter-01": { inventory: { "oak-log": 2, quartz: 1 } },
      "chapter-02": { inventory: { "oak-log": 3, quartz: 2 } }
    }
  });
  const restored = campaign.createCampaign(chapters, legacy);

  assert.deepEqual(restored.inventory, { "oak-log": 5, quartz: 3 });
  chapters.forEach((chapter) => assert.deepEqual(restored.chapterStates[chapter.chapterId].inventory, restored.inventory));
});

test("deduplicates mirrored legacy chapter inventories during migration", () => {
  const chapters = loadChapters();
  const legacy = JSON.stringify({
    chapterStates: {
      "chapter-01": { inventory: { "oak-log": 2, quartz: 1 } },
      "chapter-02": { inventory: { "oak-log": 2, quartz: 1 } }
    }
  });
  const restored = campaign.createCampaign(chapters, legacy);
  assert.deepEqual(restored.inventory, { "oak-log": 2, quartz: 1 });
});

test("unlocks the next chapter only after the prior route is cleared and its final project is assembled", () => {
  const chapters = loadChapters();
  const completedRoute = (chapter) => ({
    unlockedLevelIds: chapter.levels.map((level) => level.levelId),
    levelRecords: Object.fromEntries(chapter.levels.map((level) => [level.levelId, { starCount: 3 }]))
  });

  const projectOnly = campaign.createCampaign(chapters, null, { "j20-sky-fighter": 1 });
  assert.deepEqual(projectOnly.unlockedChapterIds, ["chapter-01"]);

  const chapterOneComplete = campaign.createCampaign(chapters, JSON.stringify({
    activeChapterId: "chapter-01",
    chapterStates: { "chapter-01": completedRoute(chapters[0]) }
  }), { "j20-sky-fighter": 1 });
  assert.deepEqual(chapterOneComplete.unlockedChapterIds, ["chapter-01", "chapter-02"]);

  const chapterTwoComplete = campaign.createCampaign(chapters, JSON.stringify({
    activeChapterId: "chapter-02",
    chapterStates: {
      "chapter-01": completedRoute(chapters[0]),
      "chapter-02": completedRoute(chapters[1])
    }
  }), { "j20-sky-fighter": 1, "deep-sea-explorer": 1 });
  assert.deepEqual(chapterTwoComplete.unlockedChapterIds, ["chapter-01", "chapter-02", "chapter-03"]);

  const chapterThreeComplete = campaign.createCampaign(chapters, JSON.stringify({
    activeChapterId: "chapter-03",
    chapterStates: {
      "chapter-01": completedRoute(chapters[0]),
      "chapter-02": completedRoute(chapters[1]),
      "chapter-03": completedRoute(chapters[2])
    }
  }), { "j20-sky-fighter": 1, "deep-sea-explorer": 1, "orbital-science-station": 1 });
  assert.deepEqual(chapterThreeComplete.unlockedChapterIds, ["chapter-01", "chapter-02", "chapter-03", "chapter-04"]);

  const chapterFourComplete = campaign.createCampaign(chapters, JSON.stringify({
    activeChapterId: "chapter-04",
    chapterStates: {
      "chapter-01": completedRoute(chapters[0]),
      "chapter-02": completedRoute(chapters[1]),
      "chapter-03": completedRoute(chapters[2]),
      "chapter-04": completedRoute(chapters[3])
    }
  }), {
    "j20-sky-fighter": 1,
    "deep-sea-explorer": 1,
    "orbital-science-station": 1,
    "polar-icebreaker": 1
  });
  assert.deepEqual(chapterFourComplete.unlockedChapterIds, ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05"]);

  const chapterFiveComplete = campaign.createCampaign(chapters, JSON.stringify({
    activeChapterId: "chapter-05",
    chapterStates: {
      "chapter-01": completedRoute(chapters[0]),
      "chapter-02": completedRoute(chapters[1]),
      "chapter-03": completedRoute(chapters[2]),
      "chapter-04": completedRoute(chapters[3]),
      "chapter-05": completedRoute(chapters[4])
    }
  }), {
    "j20-sky-fighter": 1,
    "deep-sea-explorer": 1,
    "orbital-science-station": 1,
    "polar-icebreaker": 1,
    "99a-main-battle-tank": 1
  });
  assert.deepEqual(chapterFiveComplete.unlockedChapterIds, ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06"]);
  assert.equal(Object.keys(chapterFiveComplete.chapterStates["chapter-06"].levelRecords).length, 0);
});
