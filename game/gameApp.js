import { createSubmissionFeedback, getStoredAnswerDraft, getStoredScreen, requireDependencies } from "./gameAppView.js";
import { createGameRenderers } from "./gameAppRenderers.js";
import { createGameInteractions } from "./gameAppInteractions.js";

function mount({ root, chapter: initialChapter, chapters, stateStore, saveStore, inventoryStore, legacyState, metricsStore }) {
  if (!(root instanceof Element)) throw new Error("GameApp.mount requires a root element");
  const allChapters = Array.isArray(chapters) && chapters.length ? chapters : [initialChapter];
  if (!allChapters.every((entry) => entry?.levels?.length)) throw new Error("GameApp.mount requires compiled chapters");
  const chaptersById = Object.fromEntries(allChapters.map((entry) => [entry.chapterId, entry]));
  const { AnswerMatcher, GameItemCatalog, InventoryModel, LevelRewardConfig, RewardPresentation, ChapterMissionModel, CampaignModel, ProgressionModel, ChallengeModel } = requireDependencies();
  let storedState = null;
  const primaryStore = saveStore || stateStore;
  try {
    storedState = typeof primaryStore?.load === "function" ? primaryStore.load() : null;
  } catch {
    storedState = null;
  }
  let initialInventory = {};
  if (saveStore) {
    try {
      const parsedSave = typeof storedState === "string" ? JSON.parse(storedState) : storedState;
      if (parsedSave?.inventory && typeof parsedSave.inventory === "object" && !Array.isArray(parsedSave.inventory)) {
        initialInventory = parsedSave.inventory;
      }
    } catch {
      initialInventory = {};
    }
  } else if (inventoryStore && typeof inventoryStore.loadInventory === "function") {
    try { initialInventory = inventoryStore.loadInventory({}); } catch { initialInventory = {}; }
  }
  let campaign = CampaignModel.createCampaign(allChapters, storedState, initialInventory, legacyState);
  let chapter = chaptersById[campaign.activeChapterId];
  let state = campaign.chapterStates[chapter.chapterId];
  function replaceInventory(nextInventory, craftedRecipeId = null) {
    const serializedState = JSON.parse(ProgressionModel.serialize(state));
    if (craftedRecipeId) {
      serializedState.craftedProjectRecipeIds = {
        ...(serializedState.craftedProjectRecipeIds || {}),
        [craftedRecipeId]: true
      };
    }
    state = ProgressionModel.hydrate(JSON.stringify({
      ...serializedState,
      inventory: nextInventory
    }), chapter);
    campaign = { ...campaign, chapterStates: { ...campaign.chapterStates, [chapter.chapterId]: state } };
    campaign = CampaignModel.synchronizeInventory(campaign, allChapters, nextInventory);
    state = campaign.chapterStates[chapter.chapterId];
  }
  const persistedScreenSource = storedState || legacyState;
  const storedScreen = getStoredScreen(persistedScreenSource);
  let screen = state.activeRun ? "challenge" : state.activeChallengeRun ? "recovery-challenge" : storedScreen === "settlement" && state.lastSettlement ? "settlement" : "map";
  let inventoryReturnScreen = "map";
  let answerDraft = state.activeRun ? getStoredAnswerDraft(persistedScreenSource) : "";
  let answerFeedback = null;
  let rewardReveal = null;
  let craftingFeedback = null;
  let missionFeedback = [];
  let saveFeedback = null;
  let pendingFocusKey = null;
  let destroyed = false;

  const recordMetric = (method, ...args) => {
    if (typeof metricsStore?.[method] === "function") metricsStore[method](...args);
  };

  const persist = () => {
    const missionResult = ChapterMissionModel.claimEligibleMissions(chapter.chapterId, state);
    if (missionResult.transactions.length) {
      state = ProgressionModel.hydrate(JSON.stringify({
        ...JSON.parse(ProgressionModel.serialize(state)),
        inventory: missionResult.inventory,
        claimedMissionRewards: missionResult.claimedMissionRewards
      }), chapter);
      missionFeedback = missionResult.transactions;
    }
    campaign = { ...campaign, chapterStates: { ...campaign.chapterStates, [chapter.chapterId]: state } };
    campaign = CampaignModel.synchronizeInventory(campaign, allChapters, state.inventory);
    state = campaign.chapterStates[chapter.chapterId];
    if (typeof primaryStore?.save !== "function") return;
    const serialized = JSON.parse(CampaignModel.serializeCampaign(campaign));
    serialized.lastScreen = screen === "settlement" ? "settlement" : screen === "recovery-challenge" ? "recovery-challenge" : "map";
    serialized.activeAnswerDraft = (state.activeRun || state.activeChallengeRun) ? answerDraft : "";
    try {
      const result = primaryStore.save(JSON.stringify(serialized));
      if (result?.ok === false) saveFeedback = { text: "本机存档暂时不可用，当前进度仍保留在本次打开中。请稍后重试。" };
      else if (result?.ok === true) saveFeedback = null;
    } catch {
      saveFeedback = { text: "本机存档暂时不可用，当前进度仍保留在本次打开中。请稍后重试。" };
      // Persistence is non-fatal; the in-memory state is still rendered below.
    }
    if (!saveStore && inventoryStore && typeof inventoryStore.saveInventory === "function") {
      inventoryStore.saveInventory(state.inventory);
    }
  };

  const getLevel = (levelId) => chapter.levels.find((level) => level.levelId === levelId);

  function captureAnswerDraft() {
    if ((screen === "challenge" && state.activeRun?.status === "active") || (screen === "recovery-challenge" && state.activeChallengeRun?.status === "active")) {
      answerDraft = root.querySelector("[data-answer-input]")?.value || "";
    }
  }


  const appContext = {
    dependencies: { AnswerMatcher, GameItemCatalog, InventoryModel, LevelRewardConfig, RewardPresentation, ChapterMissionModel, CampaignModel, ProgressionModel, ChallengeModel },
    allChapters,
    chaptersById,
    getLevel,
    render: () => render(),
    persist,
    recordMetric,
    captureAnswerDraft,
    replaceInventory
  };
  Object.defineProperties(appContext, {
    root: { get: () => root },
    chapter: { get: () => chapter, set: (value) => { chapter = value; } },
    state: { get: () => state, set: (value) => { state = value; } },
    campaign: { get: () => campaign, set: (value) => { campaign = value; } },
    screen: { get: () => screen, set: (value) => { screen = value; } },
    answerFeedback: { get: () => answerFeedback, set: (value) => { answerFeedback = value; } },
    rewardReveal: { get: () => rewardReveal, set: (value) => { rewardReveal = value; } },
    craftingFeedback: { get: () => craftingFeedback, set: (value) => { craftingFeedback = value; } },
    saveFeedback: { get: () => saveFeedback, set: (value) => { saveFeedback = value; } },
    answerDraft: { get: () => answerDraft, set: (value) => { answerDraft = value; } },
    inventoryReturnScreen: { get: () => inventoryReturnScreen, set: (value) => { inventoryReturnScreen = value; } },
    pendingFocusKey: { get: () => pendingFocusKey, set: (value) => { pendingFocusKey = value; } },
    chaptersById: { get: () => chaptersById }
  });
  const renderers = createGameRenderers(appContext);
  Object.defineProperties(appContext, {
    getCraftableRecipe: { get: () => renderers.getCraftableRecipe },
    isRecipeUnlocked: { get: () => renderers.isRecipeUnlocked }
  });
  const interactions = createGameInteractions(appContext);


  function render() {
    if (destroyed) return;
    root.replaceChildren();
    if (screen === "challenge") renderers.renderChallenge();
    else if (screen === "recovery-challenge") renderers.renderRecoveryChallenge();
    else if (screen === "settlement") renderers.renderSettlement();
    else if (screen === "inventory") renderers.renderInventory();
    else renderers.renderMap();
    renderers.renderStatusOverlays();
    const activeAnswer = root.querySelector("[data-answer-input]:not([disabled])");
    if (activeAnswer) {
      activeAnswer.focus({ preventScroll: true });
      pendingFocusKey = null;
      return;
    }
    if (pendingFocusKey) {
      const target = Array.from(root.querySelectorAll("[data-focus-key]"))
        .find((element) => element.dataset.focusKey === pendingFocusKey);
      target?.focus({ preventScroll: true });
      pendingFocusKey = null;
    }
  }

  root.addEventListener("click", interactions.handleClick);
  root.addEventListener("keydown", interactions.handleKeydown);
  render();

  return {
    render,
    destroy() {
      destroyed = true;
      root.removeEventListener("click", interactions.handleClick);
      root.removeEventListener("keydown", interactions.handleKeydown);
      root.replaceChildren();
    }
  };
}

const GameApp = { mount };
globalThis.GameApp = GameApp;

export default GameApp;
