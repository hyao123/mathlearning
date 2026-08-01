const GameItemCatalog = require("./itemCatalog.js");
const InventoryModel = require("./inventoryModel.js");
const GameChapterConfig = require("./chapterConfig.js");
const QuestionAccess = require("./questionAccess.js");
const RewardEconomy = require("./rewardEconomy.js");

const STORAGE_KEY = "math-quest-game-v1";
const ANSWERABLE_STATUSES = new Set(["active", "retry"]);
const PERSISTABLE_RUN_STATUSES = new Set(["active", "retry", "resolved"]);

function toLearnerQuestion(question) {
  return QuestionAccess.toChallengeQuestion(question);
}

function requireChapter(chapter) {
  if (!chapter || typeof chapter !== "object" || typeof chapter.chapterId !== "string" || !Array.isArray(chapter.levels) || chapter.levels.length === 0) {
    throw new Error("Invalid compiled chapter");
  }
  return chapter;
}

function attachChapter(state, chapter) {
  Object.defineProperty(state, "_chapter", {
    value: requireChapter(chapter),
    enumerable: false,
    configurable: false,
    writable: false
  });
  return state;
}

function getAttachedChapter(state) {
  if (!state || !state._chapter) throw new Error("Progression state is not hydrated");
  return state._chapter;
}

function getLevel(chapter, levelId) {
  const level = chapter.levels.find((entry) => entry && entry.levelId === levelId);
  if (!level) throw new Error(`Unknown level: ${levelId}`);
  if (!Array.isArray(level.questions) || level.questions.length !== 10) throw new Error(`Invalid level questions: ${levelId}`);
  return level;
}

function getQuestion(level, questionIndex) {
  const question = level.questions[questionIndex];
  if (!question || typeof question.id !== "string") throw new Error(`Invalid question at slot ${questionIndex + 1}`);
  return question;
}

function getStarCount(correctCount, skippedCount) {
  if (correctCount >= 9 && skippedCount === 0) return 3;
  if (correctCount >= 7) return 2;
  return 1;
}

function createDefaultExtensions() {
  return {
    crafting: { enabled: GameChapterConfig.FEATURE_FLAGS.crafting === true },
    equipment: { enabled: GameChapterConfig.FEATURE_FLAGS.equipment === true, slots: {} },
    shop: { enabled: GameChapterConfig.FEATURE_FLAGS.shop === true, purchases: {} }
  };
}

function createInitialState(chapter) {
  const compiled = requireChapter(chapter);
  const firstLevel = getLevel(compiled, compiled.levels[0].levelId);
  const extensions = createDefaultExtensions();
  return attachChapter({
    activeChapterId: compiled.chapterId,
    unlockedLevelIds: [firstLevel.levelId],
    levelRecords: {},
    inventory: InventoryModel.createInventory(),
    attemptSequence: 0,
    claimedFixedRewards: {},
    claimedMissionRewards: {},
    craftedProjectRecipeIds: {},
    pityEnergy: 0,
    streak: 0,
    attemptSettlements: {},
    activeRun: null,
    lastSettlement: null,
    ...extensions
  }, compiled);
}

function sanitizeCraftedProjectRecipeIds(value, inventory, chapter) {
  const recipes = InventoryModel.getProjectRecipes(chapter.chapterId);
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const recipeByOutputId = new Map(recipes.flatMap((recipe) => recipe.outputs.map(({ itemId }) => [itemId, recipe])));
  const crafted = Object.fromEntries(Object.entries(value && typeof value === "object" && !Array.isArray(value) ? value : {})
    .filter(([recipeId, isCrafted]) => recipeById.has(recipeId) && isCrafted === true));
  const markRecipeAndDependencies = (recipe) => {
    if (!recipe || crafted[recipe.id]) return;
    crafted[recipe.id] = true;
    recipe.inputs.forEach(({ itemId }) => markRecipeAndDependencies(recipeByOutputId.get(itemId)));
  };
  Object.entries(inventory || {}).forEach(([itemId, quantity]) => {
    if (Number.isInteger(quantity) && quantity > 0) markRecipeAndDependencies(recipeByOutputId.get(itemId));
  });
  return crafted;
}

function copyRunWithQuestion(run, level) {
  return { ...run, question: toLearnerQuestion(getQuestion(level, run.questionIndex)) };
}

function startLevel(state, levelId) {
  const chapter = getAttachedChapter(state);
  const level = getLevel(chapter, levelId);
  if (!state.unlockedLevelIds.includes(levelId)) throw new Error(`Level is locked: ${levelId}`);
  if (state.activeRun) throw new Error("A level is already active");
  const run = {
    levelId,
    questionIndex: 0,
    question: toLearnerQuestion(getQuestion(level, 0)),
    status: "active",
    correctCount: 0,
    skippedCount: 0,
    rewardedQuestionIds: [],
    skippedQuestionIds: [],
    earnedItems: [],
    rewardTransactions: []
  };
  return attachChapter({ ...state, activeRun: run, lastSettlement: null }, chapter);
}

function requireActiveRun(state) {
  if (!state || !state.activeRun) throw new Error("No active level run");
  return state.activeRun;
}

function summarizeEarnedItems(transactions) {
  const totals = new Map();
  for (const transaction of transactions) {
    if (transaction.status !== "awarded" || transaction.awardedQuantity <= 0) continue;
    totals.set(transaction.itemId, (totals.get(transaction.itemId) || 0) + transaction.awardedQuantity);
  }
  return [...totals].map(([itemId, quantity]) => ({ itemId, quantity }));
}

function resolveRandom(options) {
  return typeof options?.random === "function" ? options.random : Math.random;
}

function awardQuestionReward(inventory, chapterId, questionIndex, questionId, options = {}) {
  const rewardPlan = GameItemCatalog.rollRewardForSlot(chapterId, questionIndex, resolveRandom(options)());
  return rewardPlan.rewards
    .reduce((result, reward) => {
      const grant = InventoryModel.grantItem(result.inventory, reward.itemId, reward.quantity);
      return {
        inventory: grant.inventory,
        rewardTransactions: [
          ...result.rewardTransactions,
          { questionId, rewardType: rewardPlan.type, ...grant.transaction }
        ]
      };
    }, { inventory, rewardTransactions: [] });
}

function unlockNextLevel(unlockedLevelIds, chapter, levelId) {
  const currentIndex = chapter.levels.findIndex((level) => level.levelId === levelId);
  const nextLevelId = chapter.levels[currentIndex + 1]?.levelId;
  const allowed = new Set([...unlockedLevelIds, ...(nextLevelId ? [nextLevelId] : [])]);
  return chapter.levels.map((level) => level.levelId).filter((candidateId) => allowed.has(candidateId));
}

function settleRun(state, run, chapter) {
  const starCount = getStarCount(run.correctCount, run.skippedCount);
  const existingRecord = state.levelRecords[run.levelId];
  const record = { starCount: Math.max(existingRecord?.starCount || 0, starCount) };
  const settlement = {
    levelId: run.levelId,
    starCount,
    correctCount: run.correctCount,
    skippedCount: run.skippedCount,
    earnedItems: (run.earnedItems || []).map((entry) => ({ ...entry })),
    rewardTransactions: (run.rewardTransactions || []).map((entry) => ({ ...entry }))
  };
  return attachChapter({
    ...state,
    unlockedLevelIds: unlockNextLevel(state.unlockedLevelIds, chapter, run.levelId),
    levelRecords: { ...state.levelRecords, [run.levelId]: record },
    activeRun: null,
    lastSettlement: settlement
  }, chapter);
}

function createAttemptId(levelId, questionId, attemptSequence) {
  return `${levelId}:${questionId}:${attemptSequence}`;
}

function resolveCurrentQuestion(state, run, chapter, { correct, skipped, rewardOptions, now = Date.now() }) {
  const level = getLevel(chapter, run.levelId);
  const question = getQuestion(level, run.questionIndex);
  const attemptSequence = state.attemptSequence + 1;
  const attemptId = createAttemptId(level.levelId, question.id, attemptSequence);
  const rewardResult = RewardEconomy.settleResolution({
    chapterId: chapter.chapterId,
    inventory: state.inventory,
    claimedFixedRewards: state.claimedFixedRewards,
    pityEnergy: state.pityEnergy,
    streak: state.streak,
    attemptSettlements: state.attemptSettlements,
    questionId: question.id,
    questionSlot: run.questionIndex + 1,
    levelId: level.levelId,
    difficulty: question.difficulty,
    resolution: correct ? "correct" : "skipped",
    attemptId,
    random: resolveRandom(rewardOptions)
  });
  const rewardTransactions = [...(run.rewardTransactions || []), ...rewardResult.transactions];
  const resolved = {
    questionId: question.id,
    resolution: correct ? "correct" : "skipped",
    attemptId,
    resolvedAt: now,
    advanced: false
  };
  const resolvedRun = {
    ...run,
    status: "resolved",
    correctCount: run.correctCount + (correct ? 1 : 0),
    skippedCount: run.skippedCount + (skipped ? 1 : 0),
    rewardedQuestionIds: correct && !run.rewardedQuestionIds.includes(question.id)
      ? [...run.rewardedQuestionIds, question.id]
      : [...run.rewardedQuestionIds],
    skippedQuestionIds: skipped && !run.skippedQuestionIds.includes(question.id)
      ? [...run.skippedQuestionIds, question.id]
      : [...run.skippedQuestionIds],
    rewardTransactions,
    earnedItems: summarizeEarnedItems(rewardTransactions),
    resolved
  };
  return attachChapter({
    ...state,
    inventory: rewardResult.inventory,
    attemptSequence,
    claimedFixedRewards: rewardResult.claimedFixedRewards,
    pityEnergy: rewardResult.pityEnergy,
    streak: rewardResult.streak,
    attemptSettlements: rewardResult.attemptSettlements,
    activeRun: resolvedRun
  }, chapter);
}

function submitAnswer(state, userAnswer, answerMatcher, options = {}) {
  const chapter = getAttachedChapter(state);
  const run = requireActiveRun(state);
  if (run.status !== "active") throw new Error("Retry the question before submitting again");
  const level = getLevel(chapter, run.levelId);
  const question = getQuestion(level, run.questionIndex);
  const result = QuestionAccess.judgeAnswer(question, userAnswer, answerMatcher);
  if (!result.correct) return attachChapter({ ...state, activeRun: { ...run, status: "retry" } }, chapter);
  return resolveCurrentQuestion(state, run, chapter, {
    correct: true,
    skipped: false,
    rewardOptions: options,
    now: typeof options.now === "function" ? options.now() : Date.now()
  });
}

function retryQuestion(state) {
  const chapter = getAttachedChapter(state);
  const run = requireActiveRun(state);
  if (run.status !== "retry") throw new Error("Question is not awaiting retry");
  return attachChapter({ ...state, activeRun: { ...run, status: "active" } }, chapter);
}

function skipQuestion(state, options = {}) {
  const chapter = getAttachedChapter(state);
  const run = requireActiveRun(state);
  if (!ANSWERABLE_STATUSES.has(run.status)) throw new Error("Question cannot be skipped");
  return resolveCurrentQuestion(state, run, chapter, {
    correct: false,
    skipped: true,
    now: typeof options.now === "function" ? options.now() : Date.now()
  });
}

function continueFromResolved(state) {
  const chapter = getAttachedChapter(state);
  const run = requireActiveRun(state);
  if (run.status !== "resolved" || !run.resolved || run.resolved.advanced) {
    throw new Error("No resolved question to continue from");
  }

  const level = getLevel(chapter, run.levelId);
  const nextRun = {
    ...run,
    questionIndex: run.questionIndex + 1,
    status: "active"
  };
  delete nextRun.resolved;
  const nextState = { ...state, activeRun: nextRun };
  if (nextRun.questionIndex === level.questions.length) return settleRun(nextState, nextRun, chapter);
  return attachChapter({ ...nextState, activeRun: copyRunWithQuestion(nextRun, level) }, chapter);
}

function getResolvedReview(state) {
  const run = state?.activeRun;
  if (!run || run.status !== "resolved" || !run.resolved) return null;
  const chapter = getAttachedChapter(state);
  const level = getLevel(chapter, run.levelId);
  const question = getQuestion(level, run.questionIndex);
  if (question.id !== run.resolved.questionId) return null;
  return QuestionAccess.buildSolutionReview(question);
}

function getSettlement(state) {
  return state?.lastSettlement ? {
    ...state.lastSettlement,
    earnedItems: (state.lastSettlement.earnedItems || []).map((entry) => ({ ...entry })),
    rewardTransactions: (state.lastSettlement.rewardTransactions || []).map((entry) => ({ ...entry }))
  } : null;
}

function getChapterCompletion(state, chapter = null) {
  const compiled = chapter ? requireChapter(chapter) : getAttachedChapter(state);
  const records = state?.levelRecords || {};
  const clearedLevels = compiled.levels.filter((level) => records[level.levelId]).length;
  const totalLevels = compiled.levels.length;
  const project = GameItemCatalog.getSuperProject(compiled.chapterId);
  const finalProjectId = project?.id || null;
  const isChapterCleared = clearedLevels === totalLevels;
  const isFinalProjectComplete = Boolean(
    finalProjectId
    && (state?.inventory?.[finalProjectId] || 0) > 0
    && state?.craftedProjectRecipeIds?.[project?.finalRecipe?.id] === true
  );
  return {
    chapterId: compiled.chapterId,
    clearedLevels,
    totalLevels,
    isChapterCleared,
    finalProjectId,
    isFinalProjectComplete,
    status: isFinalProjectComplete ? "project-complete" : isChapterCleared ? "chapter-cleared" : "in-progress"
  };
}

function serialize(state) {
  const activeRun = state?.activeRun
    ? {
      levelId: state.activeRun.levelId,
      questionIndex: state.activeRun.questionIndex,
      questionId: state.activeRun.question?.id,
      status: state.activeRun.status,
      correctCount: state.activeRun.correctCount,
      skippedCount: state.activeRun.skippedCount,
      rewardedQuestionIds: [...(state.activeRun.rewardedQuestionIds || [])],
      skippedQuestionIds: [...(state.activeRun.skippedQuestionIds || [])],
      rewardTransactions: (state.activeRun.rewardTransactions || []).map((entry) => ({ ...entry })),
      resolved: state.activeRun.status === "resolved" && state.activeRun.resolved ? {
        questionId: state.activeRun.resolved.questionId,
        resolution: state.activeRun.resolved.resolution,
        attemptId: state.activeRun.resolved.attemptId,
        resolvedAt: state.activeRun.resolved.resolvedAt,
        advanced: false
      } : undefined
    }
    : null;
  const inventory = sanitizeInventory(state?.inventory);
  return JSON.stringify({
    version: STORAGE_KEY,
    activeChapterId: state?.activeChapterId,
    attemptSequence: Number.isInteger(state?.attemptSequence) && state.attemptSequence >= 0 ? state.attemptSequence : 0,
    claimedFixedRewards: sanitizeClaimedFixedRewards(state?.claimedFixedRewards),
    claimedMissionRewards: sanitizeClaimedFixedRewards(state?.claimedMissionRewards),
    craftedProjectRecipeIds: sanitizeClaimedFixedRewards(state?.craftedProjectRecipeIds),
    pityEnergy: sanitizePityEnergy(state?.pityEnergy),
    streak: sanitizePityEnergy(state?.streak),
    attemptSettlements: sanitizeAttemptSettlements(state?.attemptSettlements),
    unlockedLevelIds: [...(state?.unlockedLevelIds || [])],
    levelRecords: state?.levelRecords || {},
    inventory,
    activeRun,
    lastSettlement: state?.lastSettlement || null,
    crafting: sanitizeCrafting(state?.crafting),
    equipment: sanitizeEquipment(state?.equipment, inventory),
    shop: sanitizeShop(state?.shop)
  });
}

function positiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function sanitizeInventory(inventory) {
  if (!inventory || typeof inventory !== "object" || Array.isArray(inventory)) return {};
  return Object.fromEntries(Object.entries(inventory).flatMap(([itemId, quantity]) => {
    const item = GameItemCatalog.getItem(itemId);
    return positiveInteger(quantity) && item && quantity <= item.stackLimit ? [[itemId, quantity]] : [];
  }));
}

function sanitizeCrafting() {
  return { enabled: GameChapterConfig.FEATURE_FLAGS.crafting === true };
}

function sanitizeEquipment(equipment, inventory) {
  const slots = equipment?.slots;
  if (!slots || typeof slots !== "object" || Array.isArray(slots)) {
    return { enabled: GameChapterConfig.FEATURE_FLAGS.equipment === true, slots: {} };
  }
  return {
    enabled: GameChapterConfig.FEATURE_FLAGS.equipment === true,
    slots: Object.fromEntries(Object.entries(slots).flatMap(([slot, itemId]) => {
      return InventoryModel.isValidEquipmentAssignment(slot, itemId, inventory)
        ? [[slot, itemId]]
        : [];
    }))
  };
}

function sanitizeShop(shop) {
  const purchases = shop?.purchases;
  if (!purchases || typeof purchases !== "object" || Array.isArray(purchases)) {
    return { enabled: GameChapterConfig.FEATURE_FLAGS.shop === true, purchases: {} };
  }
  return {
    enabled: GameChapterConfig.FEATURE_FLAGS.shop === true,
    purchases: Object.fromEntries(Object.entries(purchases).flatMap(([offerId, count]) => {
      return typeof offerId === "string" && offerId && positiveInteger(count) ? [[offerId, count]] : [];
    }))
  };
}

function sanitizeUnlockedLevelIds(ids, chapter) {
  const provided = new Set(Array.isArray(ids) ? ids : []);
  const result = [];
  for (const level of chapter.levels) {
    if (result.length === 0 || provided.has(level.levelId)) result.push(level.levelId);
    else break;
  }
  return result;
}

function sanitizeRecords(records, chapter, unlockedLevelIds) {
  if (!records || typeof records !== "object" || Array.isArray(records)) return {};
  const knownIds = new Set(unlockedLevelIds);
  return Object.fromEntries(Object.entries(records).flatMap(([levelId, record]) => {
    const starCount = record?.starCount;
    return knownIds.has(levelId) && Number.isInteger(starCount) && starCount >= 1 && starCount <= 3
      ? [[levelId, { starCount }]]
      : [];
  }));
}

function sanitizeIdList(ids, permittedIds) {
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string" && permittedIds.has(id))) return null;
  return [...new Set(ids)];
}

function sanitizeAttemptSequence(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function sanitizePityEnergy(value) {
  return Number.isInteger(value) && value >= 0 && value <= 9999 ? value : 0;
}

function sanitizeClaimedFixedRewards(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([questionId, claimed]) => {
    return typeof questionId === "string" && questionId && claimed === true ? [[questionId, true]] : [];
  }));
}

function sanitizeAttemptSettlements(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([attemptId, settlement]) => {
    if (typeof attemptId !== "string" || !attemptId || !settlement || typeof settlement !== "object" || Array.isArray(settlement)) return [];
    if (typeof settlement.questionId !== "string" || !settlement.questionId) return [];
    if (settlement.resolution !== "correct" && settlement.resolution !== "skipped") return [];
    if (!Array.isArray(settlement.transactionIds) || !settlement.transactionIds.every((id) => typeof id === "string" && id)) return [];
    return [[attemptId, {
      questionId: settlement.questionId,
      resolution: settlement.resolution,
      transactionIds: [...settlement.transactionIds]
    }]];
  }));
}

function sanitizeResolvedMetadata(resolved, currentQuestion) {
  if (!resolved || typeof resolved !== "object" || Array.isArray(resolved)) return null;
  if (resolved.questionId !== currentQuestion.id) return null;
  if (resolved.resolution !== "correct" && resolved.resolution !== "skipped") return null;
  if (typeof resolved.attemptId !== "string" || !resolved.attemptId) return null;
  if (!Number.isFinite(resolved.resolvedAt) || resolved.resolvedAt < 0) return null;
  if (resolved.advanced !== false) return null;
  return {
    questionId: resolved.questionId,
    resolution: resolved.resolution,
    attemptId: resolved.attemptId,
    resolvedAt: resolved.resolvedAt,
    advanced: false
  };
}

function getExpectedRewardPlans(chapterId, questions) {
  const expected = new Map();
  questions.forEach((question, questionIndex) => {
    const plan = GameItemCatalog.getRewardPlanForSlot(chapterId, questionIndex);
    const rewards = plan.type === "random" ? plan.pool : plan.rewards;
    expected.set(question.id, {
      type: plan.type,
      maxTransactions: plan.type === "random" ? 1 : rewards.length,
      quantities: new Map(rewards.map(({ itemId, quantity }) => [itemId, quantity]))
    });
  });
  return expected;
}

function sanitizeRewardTransactions(transactions, permittedQuestionIds) {
  if (!Array.isArray(transactions)) return [];
  const seen = new Set();
  return transactions.flatMap((transaction) => {
    if (!transaction || typeof transaction !== "object" || Array.isArray(transaction)) return [];
    const item = GameItemCatalog.getItem(transaction.itemId);
    const rewardType = transaction.rewardType;
    const rewardKey = `${transaction.questionId}:${rewardType}:${transaction.itemId}`;
    const validStatus = transaction.status === "awarded" || transaction.status === "already-owned" || transaction.status === "stack-capped";
    const expectedAwarded = transaction.status === "awarded" ? transaction.requestedQuantity : 0;
    if (!item || !permittedQuestionIds.has(transaction.questionId) || !["fixed", "random", "streak-chest"].includes(rewardType) || seen.has(rewardKey) || !positiveInteger(transaction.requestedQuantity) || !validStatus || transaction.awardedQuantity !== expectedAwarded) return [];
    seen.add(rewardKey);
    return [{
      questionId: transaction.questionId,
      rewardType,
      itemId: transaction.itemId,
      requestedQuantity: transaction.requestedQuantity,
      awardedQuantity: transaction.awardedQuantity,
      status: transaction.status
    }];
  });
}

function hydrateActiveRun(activeRun, chapter, unlockedLevelIds, storedChapterId) {
  if (!activeRun || typeof activeRun !== "object" || Array.isArray(activeRun)) return null;
  if (storedChapterId !== undefined && storedChapterId !== chapter.chapterId) return null;
  let level;
  try {
    level = getLevel(chapter, activeRun.levelId);
  } catch {
    return null;
  }
  if (!unlockedLevelIds.includes(level.levelId)) return null;
  if (!Number.isInteger(activeRun.questionIndex) || activeRun.questionIndex < 0 || activeRun.questionIndex >= level.questions.length) return null;
  if (!PERSISTABLE_RUN_STATUSES.has(activeRun.status)) return null;
  const currentQuestion = getQuestion(level, activeRun.questionIndex);
  const resolved = activeRun.status === "resolved"
    ? sanitizeResolvedMetadata(activeRun.resolved, currentQuestion)
    : null;
  if (activeRun.status === "resolved" && !resolved) return null;
  if (activeRun.status !== "resolved" && activeRun.resolved !== undefined) return null;
  const completedQuestions = level.questions.slice(0, activeRun.questionIndex + (resolved ? 1 : 0));
  const completedIds = new Set(completedQuestions.map((question) => question.id));
  const rewardedQuestionIds = sanitizeIdList(activeRun.rewardedQuestionIds, completedIds);
  const skippedQuestionIds = sanitizeIdList(activeRun.skippedQuestionIds, completedIds);
  if (!rewardedQuestionIds || !skippedQuestionIds || rewardedQuestionIds.some((id) => skippedQuestionIds.includes(id))) return null;
  if (!Number.isInteger(activeRun.correctCount) || !Number.isInteger(activeRun.skippedCount) || activeRun.correctCount < 0 || activeRun.skippedCount < 0) return null;
  if (activeRun.correctCount + activeRun.skippedCount !== completedQuestions.length) return null;
  if (rewardedQuestionIds.length !== activeRun.correctCount || skippedQuestionIds.length !== activeRun.skippedCount) return null;
  if (activeRun.questionId !== currentQuestion.id) return null;
  if (resolved?.resolution === "correct" && !rewardedQuestionIds.includes(currentQuestion.id)) return null;
  if (resolved?.resolution === "skipped" && !skippedQuestionIds.includes(currentQuestion.id)) return null;
  const rewardTransactions = sanitizeRewardTransactions(activeRun.rewardTransactions, completedIds);
  return {
    levelId: level.levelId,
    questionIndex: activeRun.questionIndex,
    question: toLearnerQuestion(currentQuestion),
    status: activeRun.status,
    correctCount: activeRun.correctCount,
    skippedCount: activeRun.skippedCount,
    rewardedQuestionIds,
    skippedQuestionIds,
    rewardTransactions,
    earnedItems: summarizeEarnedItems(rewardTransactions),
    ...(resolved ? { resolved } : {})
  };
}

function sanitizeSettlement(settlement, chapter, unlockedLevelIds) {
  if (!settlement || typeof settlement !== "object" || Array.isArray(settlement)) return null;
  if (!unlockedLevelIds.includes(settlement.levelId)) return null;
  const keys = ["starCount", "correctCount", "skippedCount"];
  if (!keys.every((key) => Number.isInteger(settlement[key]) && settlement[key] >= 0)) return null;
  if (settlement.starCount < 1 || settlement.starCount > 3 || settlement.correctCount + settlement.skippedCount !== 10) return null;
  const level = getLevel(chapter, settlement.levelId);
  const rewardTransactions = sanitizeRewardTransactions(settlement.rewardTransactions, new Set(level.questions.map((question) => question.id)));
  return {
    levelId: settlement.levelId,
    starCount: getStarCount(settlement.correctCount, settlement.skippedCount),
    correctCount: settlement.correctCount,
    skippedCount: settlement.skippedCount,
    earnedItems: summarizeEarnedItems(rewardTransactions),
    rewardTransactions
  };
}

function hydrate(serialized, chapter) {
  const initial = createInitialState(chapter);
  let stored;
  try {
    stored = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
  } catch {
    return initial;
  }
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return initial;
  const compiled = getAttachedChapter(initial);
  const unlockedLevelIds = sanitizeUnlockedLevelIds(stored.unlockedLevelIds, compiled);
  const inventory = sanitizeInventory(stored.inventory);
  const craftedProjectRecipeIds = sanitizeCraftedProjectRecipeIds(stored.craftedProjectRecipeIds, inventory, compiled);
  const lastSettlement = sanitizeSettlement(stored.lastSettlement, compiled, unlockedLevelIds);
  const levelRecords = sanitizeRecords(stored.levelRecords, compiled, unlockedLevelIds);
  if (lastSettlement) {
    const previousStarCount = levelRecords[lastSettlement.levelId]?.starCount || 0;
    levelRecords[lastSettlement.levelId] = { starCount: Math.max(previousStarCount, lastSettlement.starCount) };
  }
  return attachChapter({
    ...initial,
    activeChapterId: compiled.chapterId,
    attemptSequence: sanitizeAttemptSequence(stored.attemptSequence),
    claimedFixedRewards: sanitizeClaimedFixedRewards(stored.claimedFixedRewards),
    claimedMissionRewards: sanitizeClaimedFixedRewards(stored.claimedMissionRewards),
    craftedProjectRecipeIds,
    pityEnergy: sanitizePityEnergy(stored.pityEnergy),
    streak: sanitizePityEnergy(stored.streak),
    attemptSettlements: sanitizeAttemptSettlements(stored.attemptSettlements),
    unlockedLevelIds,
    levelRecords,
    inventory,
    activeRun: hydrateActiveRun(stored.activeRun, compiled, unlockedLevelIds, stored.activeChapterId),
    lastSettlement,
    crafting: sanitizeCrafting(stored.crafting),
    equipment: sanitizeEquipment(stored.equipment, inventory),
    shop: sanitizeShop(stored.shop)
  }, compiled);
}

const ProgressionModel = {
  STORAGE_KEY,
  createInitialState,
  startLevel,
  submitAnswer,
  retryQuestion,
  skipQuestion,
  continueFromResolved,
  getResolvedReview,
  getSettlement,
  getChapterCompletion,
  serialize,
  hydrate,
  getStarCount
};

if (typeof globalThis !== "undefined") globalThis.ProgressionModel = ProgressionModel;

module.exports = ProgressionModel;
