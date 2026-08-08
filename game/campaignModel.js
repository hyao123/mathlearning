const ProgressionModel = require("./progressionModel.js");
const { FIRST_CHAPTER_ID } = require("./chapterConfig.js");
const GameItemCatalog = require("./itemCatalog.js");

const STORAGE_KEY = "math-quest-campaign-v2";

function parse(value) {
  try { return typeof value === "string" ? JSON.parse(value) : value; } catch { return null; }
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeInventory(inventory) {
  if (!isRecord(inventory)) return {};
  return Object.fromEntries(Object.entries(inventory).flatMap(([itemId, quantity]) => {
    const item = GameItemCatalog.getItem(itemId);
    return item && Number.isInteger(quantity) && quantity > 0
      ? [[itemId, Math.min(quantity, item.stackLimit)]]
      : [];
  }));
}

function mergeInventories(...inventories) {
  const result = {};
  for (const inventory of inventories) {
    for (const [itemId, quantity] of Object.entries(sanitizeInventory(inventory))) {
      const item = GameItemCatalog.getItem(itemId);
      result[itemId] = Math.min((result[itemId] || 0) + quantity, item.stackLimit);
    }
  }
  return result;
}

function inventoryFingerprint(inventory) {
  return JSON.stringify(Object.entries(sanitizeInventory(inventory)).sort(([left], [right]) => left.localeCompare(right)));
}

function mergeDistinctInventories(...inventories) {
  const uniqueInventories = new Map();
  for (const inventory of inventories) {
    const sanitized = sanitizeInventory(inventory);
    if (Object.keys(sanitized).length) uniqueInventories.set(inventoryFingerprint(sanitized), sanitized);
  }
  return mergeInventories(...uniqueInventories.values());
}

function resolveCampaignInventory(stored, legacy, rawStates, explicitInventory) {
  const explicit = sanitizeInventory(explicitInventory);
  if (Object.keys(explicit).length) return explicit;

  const storedRoot = sanitizeInventory(stored?.inventory);
  if (Object.keys(storedRoot).length) return storedRoot;

  return mergeDistinctInventories(
    legacy?.inventory,
    ...Object.values(rawStates || {}).map((state) => state?.inventory)
  );
}

function withInventory(state, chapter, inventory) {
  return ProgressionModel.hydrate(JSON.stringify({
    ...JSON.parse(ProgressionModel.serialize(state)),
    inventory: { ...inventory }
  }), chapter);
}

function resolveUnlockedChapterIds(chapters, chapterStates) {
  const byId = Object.fromEntries(chapters.map((chapter) => [chapter.chapterId, chapter]));
  const unlocked = new Set(chapters.filter((chapter) => !chapter.prerequisiteChapterId).map((chapter) => chapter.chapterId));
  let changed = true;
  while (changed) {
    changed = false;
    chapters.forEach((chapter) => {
      const prerequisiteId = chapter.prerequisiteChapterId;
      if (unlocked.has(chapter.chapterId) || !prerequisiteId || !byId[prerequisiteId] || !unlocked.has(prerequisiteId)) return;
      const prerequisite = byId[prerequisiteId];
      const completion = ProgressionModel.getChapterCompletion(chapterStates[prerequisiteId], prerequisite);
      if (completion.isChapterCleared && completion.isFinalProjectComplete) {
        unlocked.add(chapter.chapterId);
        changed = true;
      }
    });
  }
  return chapters.filter((chapter) => unlocked.has(chapter.chapterId)).map((chapter) => chapter.chapterId);
}

function createCampaign(chapters, storedValue, inventory = {}, legacyValue = null) {
  const stored = parse(storedValue);
  const legacy = parse(legacyValue);
  const byId = Object.fromEntries(chapters.map((chapter) => [chapter.chapterId, chapter]));
  const rawStates = stored?.chapterStates || (legacy ? { [FIRST_CHAPTER_ID]: legacy } : stored?.activeChapterId ? { [stored.activeChapterId]: stored } : {});
  const globalInventory = resolveCampaignInventory(stored, legacy, rawStates, inventory);
  const chapterStates = Object.fromEntries(chapters.map((chapter) => {
    const raw = rawStates[chapter.chapterId];
    const state = ProgressionModel.hydrate(raw ? JSON.stringify(raw) : null, chapter);
    return [chapter.chapterId, withInventory(state, chapter, globalInventory)];
  }));
  const unlockedChapterIds = resolveUnlockedChapterIds(chapters, chapterStates);
  const requestedId = stored?.activeChapterId;
  const activeChapterId = unlockedChapterIds.includes(requestedId) && byId[requestedId] ? requestedId : unlockedChapterIds.at(-1) || chapters[0]?.chapterId;
  return { version: STORAGE_KEY, activeChapterId, unlockedChapterIds, inventory: { ...globalInventory }, chapterStates };
}

function synchronizeInventory(campaign, chapters, inventory) {
  const globalInventory = sanitizeInventory(inventory);
  const chapterStates = Object.fromEntries(chapters.map((chapter) => [
    chapter.chapterId,
    withInventory(campaign.chapterStates[chapter.chapterId] || ProgressionModel.createInitialState(chapter), chapter, globalInventory)
  ]));
  const unlockedChapterIds = resolveUnlockedChapterIds(chapters, chapterStates);
  return {
    ...campaign,
    inventory: globalInventory,
    unlockedChapterIds,
    chapterStates
  };
}

function serializeCampaign(campaign) {
  const rootInventory = sanitizeInventory(campaign.inventory);
  const inventory = Object.keys(rootInventory).length
    ? rootInventory
    : sanitizeInventory(campaign.chapterStates?.[campaign.activeChapterId]?.inventory);
  return JSON.stringify({
    version: STORAGE_KEY,
    activeChapterId: campaign.activeChapterId,
    unlockedChapterIds: [...campaign.unlockedChapterIds],
    inventory,
    chapterStates: Object.fromEntries(Object.entries(campaign.chapterStates).map(([chapterId, state]) => {
      const serialized = JSON.parse(ProgressionModel.serialize(state));
      delete serialized.inventory;
      return [chapterId, serialized];
    }))
  });
}

module.exports = { STORAGE_KEY, createCampaign, synchronizeInventory, serializeCampaign, resolveUnlockedChapterIds };
