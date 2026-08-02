import "../game/game.css";

const commonJsRegistry = new Map();

async function loadCommonJs(load, registryKey) {
  const previousModule = globalThis.module;
  const previousExports = globalThis.exports;
  const previousRequire = globalThis.require;
  const localModule = { exports: {} };
  globalThis.module = localModule;
  globalThis.exports = localModule.exports;
  globalThis.require = (request) => {
    if (!commonJsRegistry.has(request)) throw new Error(`Game module dependency was not loaded: ${request}`);
    return commonJsRegistry.get(request);
  };
  try {
    const namespace = await load();
    const exported = namespace.default || localModule.exports;
    commonJsRegistry.set(registryKey, exported);
    return exported;
  } finally {
    if (previousModule === undefined) delete globalThis.module;
    else globalThis.module = previousModule;
    if (previousExports === undefined) delete globalThis.exports;
    else globalThis.exports = previousExports;
    if (previousRequire === undefined) delete globalThis.require;
    else globalThis.require = previousRequire;
  }
}

const GameRuntimeSources = await loadCommonJs(() => import("../game/runtimeSources.js"), "./runtimeSources.js");
const runtimeSourceLoaders = {
  "data.js": () => import("../data.js"),
  "contentExpansion.js": () => import("../contentExpansion.js"),
  "knowledgeContinuityExpansion.js": () => import("../knowledgeContinuityExpansion.js"),
  "priorityContentExpansion.js": () => import("../priorityContentExpansion.js"),
  "supplementalContentExpansion.js": () => import("../supplementalContentExpansion.js"),
  "supplementalContentFixes.js": () => import("../supplementalContentFixes.js"),
  "knowledgeTopology.js": () => import("../knowledgeTopology.js"),
  "supplementalTopologyExpansion.js": () => import("../supplementalTopologyExpansion.js"),
  "answerMatcher.js": () => import("../answerMatcher.js")
};

for (const sourceFile of GameRuntimeSources.RUNTIME_SOURCE_FILES) {
  const loadSource = runtimeSourceLoaders[sourceFile];
  if (!loadSource) throw new Error(`Missing game runtime source loader: ${sourceFile}`);
  await loadSource();
}

const GameChapterConfig = await loadCommonJs(() => import("../game/chapterConfig.js"), "./chapterConfig.js");
const ChapterExpansionData = await loadCommonJs(() => import("../game/chapterExpansionData.js"), "./chapterExpansionData.js");
const MaterialProcessingData = await loadCommonJs(() => import("../game/materialProcessingData.js"), "./materialProcessingData.js");
const GameItemCatalog = await loadCommonJs(() => import("../game/itemCatalog.js"), "./itemCatalog.js");
const GameChapterQuestionPacks = await loadCommonJs(() => import("../game/chapterQuestionPacks.js"), "./chapterQuestionPacks.js");
const Chapter02QuestionPacks = await loadCommonJs(() => import("../game/chapter02QuestionPacks.js"), "./chapter02QuestionPacks.js");
const Chapter03QuestionPacks = await loadCommonJs(() => import("../game/chapter03QuestionPacks.js"), "./chapter03QuestionPacks.js");
const Chapter04QuestionPacks = await loadCommonJs(() => import("../game/chapter04QuestionPacks.js"), "./chapter04QuestionPacks.js");
const Chapter05QuestionPacks = await loadCommonJs(() => import("../game/chapter05QuestionPacks.js"), "./chapter05QuestionPacks.js");
const Chapter06QuestionPacks = await loadCommonJs(() => import("../game/chapter06QuestionPacks.js"), "./chapter06QuestionPacks.js");
const QuestionContract = await loadCommonJs(() => import("../game/questionContract.js"), "./questionContract.js");
const QuestionContractFixes = await loadCommonJs(() => import("../game/questionContractFixes.js"), "./questionContractFixes.js");
const StoryMissionModel = await loadCommonJs(() => import("../game/storyMissionModel.js"), "./storyMissionModel.js");
const QuestionQuality = await loadCommonJs(() => import("../game/questionQuality.js"), "./questionQuality.js");
const ChapterQualityProfiles = await loadCommonJs(() => import("../game/chapterQualityProfiles.js"), "./chapterQualityProfiles.js");
const ChapterQuestionOverrides = await loadCommonJs(() => import("../game/chapterQuestionOverrides.js"), "./chapterQuestionOverrides.js");
const RewardPresentation = await loadCommonJs(() => import("../game/rewardPresentation.js"), "./rewardPresentation.js");
const ChapterVisualManifest = await loadCommonJs(() => import("../game/chapterVisualManifest.js"), "./chapterVisualManifest.js");
const ItemVisuals = await loadCommonJs(() => import("../game/itemVisuals.js"), "./itemVisuals.js");
const GameChapterBuilder = await loadCommonJs(() => import("../game/chapterBuilder.js"), "./chapterBuilder.js");
const InventoryModel = await loadCommonJs(() => import("../game/inventoryModel.js"), "./inventoryModel.js");
const QuestionAccess = await loadCommonJs(() => import("../game/questionAccess.js"), "./questionAccess.js");
const LevelRewardConfig = await loadCommonJs(() => import("../game/levelRewardConfig.js"), "./levelRewardConfig.js");
const RewardEconomy = await loadCommonJs(() => import("../game/rewardEconomy.js"), "./rewardEconomy.js");
const ChapterMissionModel = await loadCommonJs(() => import("../game/chapterMissionModel.js"), "./chapterMissionModel.js");
const ChallengeModel = await loadCommonJs(() => import("../game/challengeModel.js"), "./challengeModel.js");
const ProgressionModel = await loadCommonJs(() => import("../game/progressionModel.js"), "./progressionModel.js");
const CampaignModel = await loadCommonJs(() => import("../game/campaignModel.js"), "./campaignModel.js");
const StorageAdapter = await loadCommonJs(() => import("../game/storageAdapter.js"), "./storageAdapter.js");

Object.assign(globalThis, {
  GameChapterConfig,
  ChapterExpansionData,
  MaterialProcessingData,
  GameItemCatalog,
  GameChapterQuestionPacks,
  Chapter02QuestionPacks,
  Chapter03QuestionPacks,
  Chapter04QuestionPacks,
  Chapter05QuestionPacks,
  Chapter06QuestionPacks,
  QuestionContract,
  QuestionContractFixes,
  StoryMissionModel,
  QuestionQuality,
  ChapterQualityProfiles,
  ChapterQuestionOverrides,
  RewardPresentation,
  ChapterVisualManifest,
  ItemVisuals,
  GameChapterBuilder,
  InventoryModel,
  QuestionAccess,
  LevelRewardConfig,
  RewardEconomy,
  ChapterMissionModel,
  CampaignModel,
  ProgressionModel,
  ChallengeModel
});

const { default: GameApp } = await import("../game/gameApp.js");
const chapters = GameChapterConfig.CHAPTER_IDS.map((chapterId) => GameChapterBuilder.buildChapter(chapterId, globalThis.MATH_LEARNING_DATA));
const root = document.getElementById("game-root");
const stateStore = StorageAdapter.createResilientStateStore(
  () => globalThis.localStorage,
  CampaignModel.STORAGE_KEY
);
const legacyStateStore = StorageAdapter.createResilientStateStore(() => globalThis.localStorage, ProgressionModel.STORAGE_KEY);
const inventoryStore = StorageAdapter.createInventoryStore(
  () => globalThis.localStorage,
  { legacyStateKeys: [ProgressionModel.STORAGE_KEY, CampaignModel.STORAGE_KEY] }
);

GameApp.mount({ root, chapters, stateStore, inventoryStore, legacyState: legacyStateStore.load() });
