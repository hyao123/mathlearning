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

test("preserves previously unlocked chapters and active chapter on campaign reload or upgrade", () => {
  const chapters = loadChapters();
  // Simulate saved state where chapter-01, chapter-02, chapter-03 were previously unlocked,
  // even if final project or exact route completion status is partially populated or migrating
  const savedState = JSON.stringify({
    activeChapterId: "chapter-03",
    unlockedChapterIds: ["chapter-01", "chapter-02", "chapter-03"],
    chapterStates: {
      "chapter-01": {
        unlockedLevelIds: chapters[0].levels.map((l) => l.levelId),
        levelRecords: { [chapters[0].levels[0].levelId]: { starCount: 3 } }
      },
      "chapter-02": {
        unlockedLevelIds: chapters[1].levels.map((l) => l.levelId),
        levelRecords: { [chapters[1].levels[0].levelId]: { starCount: 3 } }
      },
      "chapter-03": {
        unlockedLevelIds: [chapters[2].levels[0].levelId],
        levelRecords: {}
      }
    }
  });

  const restored = campaign.createCampaign(chapters, savedState);
  assert.deepEqual(restored.unlockedChapterIds, ["chapter-01", "chapter-02", "chapter-03"]);
  assert.equal(restored.activeChapterId, "chapter-03");
});

test("unlocks any chapter immediately when its freePractice toggle is enabled without requiring prior chapter completion", () => {
  const chapters = loadChapters();
  // Chapter 1 is initial, Chapter 2~6 are locked.
  // Enable freePractice on Chapter 4 directly
  const savedState = JSON.stringify({
    activeChapterId: "chapter-01",
    chapterStates: {
      "chapter-04": { freePractice: true }
    }
  });

  const camp = campaign.createCampaign(chapters, savedState);
  assert.ok(camp.unlockedChapterIds.includes("chapter-01"));
  assert.ok(camp.unlockedChapterIds.includes("chapter-04"));
  assert.equal(camp.unlockedChapterIds.includes("chapter-02"), false);
  assert.equal(camp.unlockedChapterIds.includes("chapter-03"), false);
  assert.equal(camp.chapterStates["chapter-04"].freePractice, true);
});

test("allows toggling freePractice on and off for specific chapters with setChapterFreePractice", () => {
  const chapters = loadChapters();
  let camp = campaign.createCampaign(chapters, null);
  assert.deepEqual(camp.unlockedChapterIds, ["chapter-01"]);

  // Turn on freePractice for chapter-03
  camp = campaign.setChapterFreePractice(camp, chapters, "chapter-03", true);
  assert.deepEqual(camp.unlockedChapterIds, ["chapter-01", "chapter-03"]);
  assert.equal(camp.chapterStates["chapter-03"].freePractice, true);

  // Turn on freePractice for chapter-05
  camp = campaign.setChapterFreePractice(camp, chapters, "chapter-05", true);
  assert.deepEqual(camp.unlockedChapterIds, ["chapter-01", "chapter-03", "chapter-05"]);
  assert.equal(camp.chapterStates["chapter-05"].freePractice, true);

  // Turn off freePractice for chapter-03 (prerequisites not met -> relocks)
  camp = campaign.setChapterFreePractice(camp, chapters, "chapter-03", false);
  assert.deepEqual(camp.unlockedChapterIds, ["chapter-01", "chapter-05"]);
  assert.equal(camp.chapterStates["chapter-03"].freePractice, false);
});

test("allows batch toggling freePractice for all chapters with setAllChaptersFreePractice", () => {
  const chapters = loadChapters();
  let camp = campaign.createCampaign(chapters, null);

  // Enable all chapters free practice
  camp = campaign.setAllChaptersFreePractice(camp, chapters, true);
  assert.equal(camp.unlockedChapterIds.length, chapters.length);
  chapters.forEach((ch) => {
    assert.ok(camp.unlockedChapterIds.includes(ch.chapterId));
    assert.equal(camp.chapterStates[ch.chapterId].freePractice, true);
  });

  // Re-serialize and restore: all chapters remain unlocked and freePractice
  const serialized = campaign.serializeCampaign(camp);
  const restored = campaign.createCampaign(chapters, serialized);
  assert.equal(restored.unlockedChapterIds.length, chapters.length);
  chapters.forEach((ch) => {
    assert.equal(restored.chapterStates[ch.chapterId].freePractice, true);
  });

  // Turn off all chapters free practice (only chapter-01 remains because no completions recorded)
  camp = campaign.setAllChaptersFreePractice(camp, chapters, false);
  assert.deepEqual(camp.unlockedChapterIds, ["chapter-01"]);
  chapters.forEach((ch) => {
    assert.equal(camp.chapterStates[ch.chapterId].freePractice, false);
  });
});
