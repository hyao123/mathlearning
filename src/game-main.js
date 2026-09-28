import "../game/game.css";
import goldReviewManifest from "../content/humanReview/candidates/gold-v3.json";

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
    for (const key of Array.isArray(registryKey) ? registryKey : [registryKey]) {
      commonJsRegistry.set(key, exported);
    }
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

const GameChapterConfig = await loadCommonJs(() => import("../game/chapterConfig.js"), "./chapterConfig.js");
const ChapterExpansionData = await loadCommonJs(() => import("../game/chapterExpansionData.js"), "./chapterExpansionData.js");
const MaterialProcessingData = await loadCommonJs(() => import("../game/materialProcessingData.js"), "./materialProcessingData.js");
const GameItemCatalog = await loadCommonJs(() => import("../game/itemCatalog.js"), "./itemCatalog.js");
const MethodQuestionPackFactory = await loadCommonJs(() => import("../game/methodQuestionPackFactory.js"), "./methodQuestionPackFactory.js");
const MathThinkingMethods = await loadCommonJs(() => import("../game/mathThinkingMethods.js"), "./mathThinkingMethods.js");
const GameChapterQuestionPacks = await loadCommonJs(() => import("../game/chapterQuestionPacks.js"), "./chapterQuestionPacks.js");
const Chapter02QuestionPacks = await loadCommonJs(() => import("../game/chapter02QuestionPacks.js"), "./chapter02QuestionPacks.js");
const Chapter03QuestionPacks = await loadCommonJs(() => import("../game/chapter03QuestionPacks.js"), "./chapter03QuestionPacks.js");
const Chapter04QuestionPacks = await loadCommonJs(() => import("../game/chapter04QuestionPacks.js"), "./chapter04QuestionPacks.js");
const Chapter05QuestionPacks = await loadCommonJs(() => import("../game/chapter05QuestionPacks.js"), "./chapter05QuestionPacks.js");
const Chapter06QuestionPacks = await loadCommonJs(() => import("../game/chapter06QuestionPacks.js"), "./chapter06QuestionPacks.js");
const Chapter07QuestionPacks = await loadCommonJs(() => import("../game/chapter07QuestionPacks.js"), "./chapter07QuestionPacks.js");
const Chapter08QuestionPacks = await loadCommonJs(() => import("../game/chapter08QuestionPacks.js"), "./chapter08QuestionPacks.js");
const Chapter09QuestionPacks = await loadCommonJs(() => import("../game/chapter09QuestionPacks.js"), "./chapter09QuestionPacks.js");
const NativeQuestionPacks = await loadCommonJs(() => import("../game/nativeQuestionPacks.js"), "./nativeQuestionPacks.js");
const AnswerPolicy = await loadCommonJs(() => import("../game/curriculum/answerPolicy.js"), [
  "./curriculum/answerPolicy.js", "./answerPolicy.js", "./game/curriculum/answerPolicy.js"
]);
const AnswerMatcher = await loadCommonJs(() => import("../answerMatcher.js"), ["../answerMatcher.js", "../../answerMatcher.js"]);
const QuestionContract = await loadCommonJs(() => import("../game/questionContract.js"), ["./questionContract.js", "../questionContract.js"]);
const CurriculumContract = await loadCommonJs(() => import("../game/curriculum/curriculumContract.js"), [
  "./curriculum/curriculumContract.js", "./curriculumContract.js"
]);
const SolutionEngine = await loadCommonJs(() => import("../game/curriculum/solutionEngine.js"), [
  "./curriculum/solutionEngine.js", "./solutionEngine.js"
]);
const DifficultyEngine = await loadCommonJs(() => import("../game/curriculum/difficultyEngine.js"), [
  "./curriculum/difficultyEngine.js", "./difficultyEngine.js"
]);
const Readability = await loadCommonJs(() => import("../game/curriculum/readability.js"), [
  "./curriculum/readability.js", "./readability.js"
]);
const QuestionQualityV3 = await loadCommonJs(() => import("../game/curriculum/questionQualityV3.js"), [
  "./curriculum/questionQualityV3.js", "./questionQualityV3.js"
]);
const RuntimeAdapter = await loadCommonJs(() => import("../game/curriculum/runtimeAdapter.js"), [
  "./curriculum/runtimeAdapter.js", "./runtimeAdapter.js"
]);
const CurriculumMap = await loadCommonJs(() => import("../game/curriculum/curriculumMap.js"), [
  "./curriculum/curriculumMap.js", "./curriculumMap.js"
]);
const CompatibilityMap = await loadCommonJs(() => import("../game/curriculum/compatibilityMap.js"), [
  "./curriculum/compatibilityMap.js", "./compatibilityMap.js"
]);
const ContentBatchRegistry = await loadCommonJs(() => import("../game/curriculum/contentBatchRegistry.js"), "./curriculum/contentBatchRegistry.js");
await loadCommonJs(() => import("../game/curriculum/gold/chickenRabbit.js"), [
  "./curriculum/gold/chickenRabbit.js", "./gold/chickenRabbit.js", "./chickenRabbit.js"
]);
await loadCommonJs(() => import("../game/curriculum/gold/shortestPath.js"), [
  "./curriculum/gold/shortestPath.js", "./gold/shortestPath.js", "./shortestPath.js"
]);
await loadCommonJs(() => import("../game/curriculum/gold/integratedModeling.js"), [
  "./curriculum/gold/integratedModeling.js", "./gold/integratedModeling.js", "./integratedModeling.js"
]);
const GoldContentBatch = await loadCommonJs(() => import("../game/curriculum/gold/index.js"), [
  "./curriculum/gold/index.js", "./gold/index.js"
]);
const approvedGoldBatch = GoldContentBatch.buildGoldV3Batch(goldReviewManifest);
if (approvedGoldBatch.status !== "approved" || !ContentBatchRegistry.registerContentBatch(approvedGoldBatch)) {
  throw new Error("Reviewed gold-v3 content batch could not be activated");
}
const ContentVersionModel = await loadCommonJs(() => import("../game/curriculum/contentVersionModel.js"), "./curriculum/contentVersionModel.js");
const QuestionContractFixes = await loadCommonJs(() => import("../game/questionContractFixes.js"), "./questionContractFixes.js");
const StoryMissionModel = await loadCommonJs(() => import("../game/storyMissionModel.js"), "./storyMissionModel.js");
const QuestionQuality = await loadCommonJs(() => import("../game/questionQuality.js"), "./questionQuality.js");
const ChapterQualityProfiles = await loadCommonJs(() => import("../game/chapterQualityProfiles.js"), "./chapterQualityProfiles.js");
const ChapterQuestionOverrides = await loadCommonJs(() => import("../game/chapterQuestionOverrides.js"), "./chapterQuestionOverrides.js");
const RewardPresentation = await loadCommonJs(() => import("../game/rewardPresentation.js"), "./rewardPresentation.js");
const ChapterVisualManifest = await loadCommonJs(() => import("../game/chapterVisualManifest.js"), "./chapterVisualManifest.js");
const ItemVisuals = await loadCommonJs(() => import("../game/itemVisuals.js"), "./itemVisuals.js");
const ChapterRegistrations = await loadCommonJs(() => import("../game/chapterRegistrations.js"), "./chapterRegistrations.js");
const GameChapterRegistry = await loadCommonJs(() => import("../game/chapterRegistry.js"), "./chapterRegistry.js");
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
const ExperienceMetrics = await loadCommonJs(() => import("../game/experienceMetrics.js"), "./experienceMetrics.js");
const SoundEngine = await loadCommonJs(() => import("../game/soundEngine.js"), "./soundEngine.js");
const AssemblyFX = await loadCommonJs(() => import("../game/assemblyFX.js"), "./assemblyFX.js");
await loadCommonJs(() => import("../game/visualizers/visualizerCore.js"), ["./visualizers/visualizerCore.js", "./visualizerCore.js"]);
await loadCommonJs(() => import("../game/visualizers/geometryVisuals.js"), ["./visualizers/geometryVisuals.js", "./geometryVisuals.js"]);
await loadCommonJs(() => import("../game/visualizers/algebraVisuals.js"), ["./visualizers/algebraVisuals.js", "./algebraVisuals.js"]);
await loadCommonJs(() => import("../game/visualizers/discreteVisuals.js"), ["./visualizers/discreteVisuals.js", "./discreteVisuals.js"]);
await loadCommonJs(() => import("../game/visualizers/wordProblemVisuals.js"), ["./visualizers/wordProblemVisuals.js", "./wordProblemVisuals.js"]);
const QuestionVisualizer = await loadCommonJs(() => import("../game/questionVisualizer.js"), "./questionVisualizer.js");
const HintScaffold = await loadCommonJs(() => import("../game/hintScaffold.js"), "./hintScaffold.js");
const AchievementModel = await loadCommonJs(() => import("../game/achievementModel.js"), "./achievementModel.js");

Object.assign(globalThis, {
  StorageAdapter,
  AchievementModel,
  SoundEngine,
  AssemblyFX,
  QuestionVisualizer,
  HintScaffold,
  GameChapterConfig,
  ChapterExpansionData,
  MaterialProcessingData,
  GameItemCatalog,
  MethodQuestionPackFactory,
  MathThinkingMethods,
  GameChapterQuestionPacks,
  Chapter02QuestionPacks,
  Chapter03QuestionPacks,
  Chapter04QuestionPacks,
  Chapter05QuestionPacks,
  Chapter06QuestionPacks,
  Chapter07QuestionPacks,
  Chapter08QuestionPacks,
  Chapter09QuestionPacks,
  NativeQuestionPacks,
  AnswerPolicy,
  CurriculumContract,
  SolutionEngine,
  DifficultyEngine,
  Readability,
  QuestionQualityV3,
  RuntimeAdapter,
  CurriculumMap,
  CompatibilityMap,
  ContentBatchRegistry,
  GoldContentBatch,
  ContentVersionModel,
  ChapterRegistrations,
  GameChapterRegistry,
  QuestionContract,
  QuestionContractFixes,
  AnswerMatcher,
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
  ChallengeModel,
  ExperienceMetrics
});

const { default: GameApp } = await import("../game/gameApp.js");
const chapters = GameChapterConfig.CHAPTER_IDS.map((chapterId) => GameChapterBuilder.buildChapter(chapterId));
const root = document.getElementById("game-root");
const legacyStateStore = StorageAdapter.createResilientStateStore(() => globalThis.localStorage, ProgressionModel.STORAGE_KEY);
const saveStore = StorageAdapter.createAtomicSaveStore(
  () => globalThis.localStorage,
  {
    legacyStateKeys: [CampaignModel.STORAGE_KEY, ProgressionModel.STORAGE_KEY],
    legacyInventoryKeys: [StorageAdapter.INVENTORY_STORAGE_KEY]
  }
);
const metricsStore = ExperienceMetrics.createExperienceMetrics(() => globalThis.localStorage);

try {
  const currentSave = saveStore.load();
  let parsed = null;
  try {
    parsed = typeof currentSave === "string" ? JSON.parse(currentSave) : currentSave;
  } catch {
    parsed = null;
  }
  const isRequestedViaQuery = typeof window !== "undefined" && window.location?.search?.includes("ch3");
  if (isRequestedViaQuery) {
    const completedRoute = (ch) => ({
      unlockedLevelIds: ch.levels.map((lvl) => lvl.levelId),
      levelRecords: Object.fromEntries(ch.levels.map((lvl) => [lvl.levelId, { starCount: 3 }]))
    });
    const prevInventory = parsed?.inventory && typeof parsed.inventory === "object" ? parsed.inventory : {};
    const newInventory = {
      ...prevInventory,
      "j20-sky-fighter": 1,
      "deep-sea-explorer": 1
    };
    const chapterStates = {
      ...(parsed?.chapterStates || {}),
      "chapter-01": completedRoute(chapters[0]),
      "chapter-02": completedRoute(chapters[1])
    };
    const unlockedChapterIds = ["chapter-01", "chapter-02", "chapter-03"];
    const newCampaign = {
      version: CampaignModel.STORAGE_KEY,
      activeChapterId: "chapter-03",
      unlockedChapterIds,
      inventory: newInventory,
      chapterStates
    };
    saveStore.save(JSON.stringify(newCampaign));
  }
} catch (err) {
  console.warn("Auto-unlock Chapter 3 fallback:", err);
}

GameApp.mount({ root, chapters, saveStore, metricsStore, legacyState: legacyStateStore.load() });
