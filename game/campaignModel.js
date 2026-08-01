const ProgressionModel = require("./progressionModel.js");
const { FIRST_CHAPTER_ID } = require("./chapterConfig.js");

const STORAGE_KEY = "math-quest-campaign-v2";

function parse(value) {
  try { return typeof value === "string" ? JSON.parse(value) : value; } catch { return null; }
}

function withInventory(state, chapter, inventory) {
  return ProgressionModel.hydrate(JSON.stringify({
    ...JSON.parse(ProgressionModel.serialize(state)),
    inventory: { ...inventory }
  }), chapter);
}

function createCampaign(chapters, storedValue, inventory = {}, legacyValue = null) {
  const stored = parse(storedValue);
  const legacy = parse(legacyValue);
  const byId = Object.fromEntries(chapters.map((chapter) => [chapter.chapterId, chapter]));
  const rawStates = stored?.chapterStates || (legacy ? { [FIRST_CHAPTER_ID]: legacy } : stored?.activeChapterId ? { [stored.activeChapterId]: stored } : {});
  const chapterStates = Object.fromEntries(chapters.map((chapter) => {
    const raw = rawStates[chapter.chapterId];
    const state = ProgressionModel.hydrate(raw ? JSON.stringify(raw) : null, chapter);
    const effectiveInventory = Object.keys(inventory || {}).length ? inventory : state.inventory;
    return [chapter.chapterId, withInventory(state, chapter, effectiveInventory)];
  }));
  const unlockedChapterIds = chapters.reduce((unlocked, chapter, index) => {
    if (index === 0) return [chapter.chapterId];
    const previous = chapters[index - 1];
    const previousState = chapterStates[previous.chapterId];
    const completion = ProgressionModel.getChapterCompletion(previousState, previous);
    return completion.isChapterCleared && completion.isFinalProjectComplete ? [...unlocked, chapter.chapterId] : unlocked;
  }, []);
  const requestedId = stored?.activeChapterId;
  const activeChapterId = unlockedChapterIds.includes(requestedId) && byId[requestedId] ? requestedId : unlockedChapterIds.at(-1) || chapters[0]?.chapterId;
  return { version: STORAGE_KEY, activeChapterId, unlockedChapterIds, chapterStates };
}

function synchronizeInventory(campaign, chapters, inventory) {
  const chapterStates = Object.fromEntries(chapters.map((chapter) => [
    chapter.chapterId,
    withInventory(campaign.chapterStates[chapter.chapterId] || ProgressionModel.createInitialState(chapter), chapter, inventory)
  ]));
  const unlockedChapterIds = chapters.reduce((unlocked, chapter, index) => {
    if (index === 0) return [chapter.chapterId];
    const previous = chapters[index - 1];
    const completion = ProgressionModel.getChapterCompletion(chapterStates[previous.chapterId], previous);
    return completion.isChapterCleared && completion.isFinalProjectComplete ? [...unlocked, chapter.chapterId] : unlocked;
  }, []);
  return {
    ...campaign,
    unlockedChapterIds,
    chapterStates
  };
}

function serializeCampaign(campaign) {
  return JSON.stringify({
    version: STORAGE_KEY,
    activeChapterId: campaign.activeChapterId,
    unlockedChapterIds: [...campaign.unlockedChapterIds],
    chapterStates: Object.fromEntries(Object.entries(campaign.chapterStates).map(([chapterId, state]) => [chapterId, JSON.parse(ProgressionModel.serialize(state))]))
  });
}

module.exports = { STORAGE_KEY, createCampaign, synchronizeInventory, serializeCampaign };
