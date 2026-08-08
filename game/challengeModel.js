const GameItemCatalog = require("./itemCatalog.js");
const QuestionAccess = require("./questionAccess.js");

const CHALLENGE_QUESTION_COUNT = 10;
const CHALLENGE_STATUSES = new Set(["active", "retry", "resolved"]);
const CHALLENGE_TRANSACTION_STATUSES = new Set(["awarded", "already-owned", "stack-capped"]);

function listQuestions(chapter) {
  return chapter.levels.flatMap((level) => level.questions.map((question, questionIndex) => ({
    question,
    levelId: level.levelId,
    questionIndex
  })));
}

function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const cursor = Math.max(0, Math.min(0.999999999, Number(random()) || 0));
    const swapIndex = Math.floor(cursor * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function getMissingRawMaterials(chapterId, inventory = {}) {
  const project = GameItemCatalog.getSuperProject(chapterId);
  if (!project) return [];
  const recipes = [...(project.materialRecipes || []), ...project.componentRecipes, ...project.partRecipes, project.finalRecipe];
  const recipeByOutput = new Map(recipes.map((recipe) => [recipe.output.itemId, recipe]));
  const missing = new Map();
  const available = new Map(Object.entries(inventory || {}).filter(([, quantity]) => Number.isInteger(quantity) && quantity > 0));
  const visiting = new Set();
  function requireItem(itemId, quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) return;
    const have = Math.min(quantity, available.get(itemId) || 0);
    if (have > 0) available.set(itemId, (available.get(itemId) || 0) - have);
    const deficit = quantity - have;
    if (!deficit) return;
    const recipe = recipeByOutput.get(itemId);
    if (!recipe || visiting.has(itemId)) {
      missing.set(itemId, (missing.get(itemId) || 0) + deficit);
      return;
    }
    visiting.add(itemId);
    const outputQuantity = Number.isInteger(recipe.output?.quantity) && recipe.output.quantity > 0 ? recipe.output.quantity : 1;
    const batchCount = Math.ceil(deficit / outputQuantity);
    recipe.inputs.forEach((entry) => requireItem(entry.itemId, batchCount * entry.quantity));
    const surplus = batchCount * outputQuantity - deficit;
    if (surplus > 0) available.set(itemId, (available.get(itemId) || 0) + surplus);
    visiting.delete(itemId);
  }
  requireItem(project.finalRecipe.output.itemId, project.finalRecipe.output.quantity);
  const preferredOrder = (project.materialRecipes || []).flatMap((recipe) => recipe.inputs.map(({ itemId }) => itemId));
  const orderedIds = [...new Set([...preferredOrder, ...missing.keys()])];
  return orderedIds
    .filter((itemId) => (missing.get(itemId) || 0) > 0)
    .map((itemId) => ({ itemId, quantity: missing.get(itemId) }));
}

function getTargetMaterial(chapterId, inventory) {
  return getMissingRawMaterials(chapterId, inventory)[0] || null;
}

function toChallengeEntry(entry) {
  return {
    question: QuestionAccess.toChallengeQuestion(entry.question),
    levelId: entry.levelId,
    questionIndex: entry.questionIndex,
    questionId: entry.question.id
  };
}

function summarizeAwardedTransactions(transactions) {
  const totals = new Map();
  transactions.forEach((transaction) => {
    if (transaction.status !== "awarded" || transaction.awardedQuantity <= 0) return;
    totals.set(transaction.itemId, (totals.get(transaction.itemId) || 0) + transaction.awardedQuantity);
  });
  return [...totals].map(([itemId, quantity]) => ({ itemId, quantity }));
}

function sameItemTotals(left, right) {
  const normalize = (entries) => new Map((Array.isArray(entries) ? entries : []).map((entry) => [entry?.itemId, entry?.quantity]));
  const a = normalize(left);
  const b = normalize(right);
  if (a.size !== b.size) return false;
  return [...a].every(([itemId, quantity]) => b.get(itemId) === quantity);
}

function sanitizeChallengeQuestionIds(ids, permittedIds) {
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string" || !permittedIds.has(id))) return null;
  const unique = [...new Set(ids)];
  return unique.length === ids.length ? unique : null;
}

function sanitizeChallengeTransactions(transactions, completedIds) {
  if (!Array.isArray(transactions)) return null;
  const seenQuestions = new Set();
  const sanitized = [];
  for (const transaction of transactions) {
    if (!transaction || typeof transaction !== "object" || Array.isArray(transaction)) return null;
    if (transaction.rewardType !== "challenge-recovery"
      || typeof transaction.questionId !== "string"
      || !completedIds.has(transaction.questionId)
      || seenQuestions.has(transaction.questionId)
      || transaction.targetItemId !== transaction.itemId
      || !GameItemCatalog.getItem(transaction.itemId)
      || transaction.requestedQuantity !== 1
      || !Number.isInteger(transaction.awardedQuantity)
      || transaction.awardedQuantity < 0
      || transaction.awardedQuantity > transaction.requestedQuantity
      || !CHALLENGE_TRANSACTION_STATUSES.has(transaction.status)
      || (transaction.status === "awarded" && transaction.awardedQuantity !== transaction.requestedQuantity)
      || (transaction.status !== "awarded" && transaction.awardedQuantity !== 0)) return null;
    seenQuestions.add(transaction.questionId);
    sanitized.push({
      questionId: transaction.questionId,
      rewardType: transaction.rewardType,
      targetItemId: transaction.targetItemId,
      itemId: transaction.itemId,
      requestedQuantity: transaction.requestedQuantity,
      awardedQuantity: transaction.awardedQuantity,
      status: transaction.status
    });
  }
  return sanitized;
}

function sanitizeChallengeSettlement(stored, chapter) {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return null;
  if (typeof stored.id !== "string" || !stored.id
    || !["review", "random"].includes(stored.mode)
    || !Number.isInteger(stored.correctCount) || stored.correctCount < 0
    || !Number.isInteger(stored.skippedCount) || stored.skippedCount < 0
    || stored.correctCount + stored.skippedCount > CHALLENGE_QUESTION_COUNT) return null;
  const questionIds = new Set(listQuestions(chapter).map((entry) => entry.question.id));
  const rewardTransactions = sanitizeChallengeTransactions(stored.rewardTransactions, questionIds);
  if (!rewardTransactions || !Array.isArray(stored.earnedItems) || !sameItemTotals(stored.earnedItems, summarizeAwardedTransactions(rewardTransactions))) return null;
  return {
    id: stored.id,
    mode: stored.mode,
    correctCount: stored.correctCount,
    skippedCount: stored.skippedCount,
    earnedItems: summarizeAwardedTransactions(rewardTransactions),
    rewardTransactions
  };
}

function createChallengeRun(chapter, state, mode = "review", random = Math.random) {
  const entries = listQuestions(chapter);
  const mistakeIds = new Set(Object.entries(state.mistakeQuestionIds || {}).filter(([, value]) => value === true).map(([id]) => id));
  const mistakes = entries.filter((entry) => mistakeIds.has(entry.question.id));
  const candidates = mode === "random" ? shuffle(entries, random) : [...mistakes, ...shuffle(entries.filter((entry) => !mistakeIds.has(entry.question.id)), random)];
  const selected = candidates.slice(0, CHALLENGE_QUESTION_COUNT).map(toChallengeEntry);
  const target = getTargetMaterial(chapter.chapterId, state.inventory);
  return {
    id: `${chapter.chapterId}-recovery-${(state.challengeSequence || 0) + 1}`,
    mode: mode === "random" ? "random" : "review",
    questionIndex: 0,
    questions: selected,
    question: selected[0]?.question || null,
    status: "active",
    correctCount: 0,
    skippedCount: 0,
    rewardedQuestionIds: [],
    skippedQuestionIds: [],
    earnedItems: [],
    rewardTransactions: [],
    targetMaterialId: target?.itemId || null,
    targetRemaining: target?.quantity || 0
  };
}

function hydrateChallengeRun(stored, chapter, inventory = {}) {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return null;
  const entriesById = new Map(listQuestions(chapter).map((entry) => [entry.question.id, toChallengeEntry(entry)]));
  const questionIds = sanitizeChallengeQuestionIds(stored.questionIds, new Set(entriesById.keys()));
  if (!questionIds) return null;
  if (questionIds.length === 0 || questionIds.length > CHALLENGE_QUESTION_COUNT || !questionIds.every((id) => entriesById.has(id))) return null;
  if (!Number.isInteger(stored.questionIndex) || stored.questionIndex < 0 || stored.questionIndex >= questionIds.length) return null;
  if (!CHALLENGE_STATUSES.has(stored.status)) return null;
  const current = entriesById.get(questionIds[stored.questionIndex]);
  if (stored.questionId !== current.questionId) return null;
  const resolved = stored.status === "resolved" ? stored.resolved : null;
  if (stored.status === "resolved"
    ? (!resolved || typeof resolved !== "object" || Array.isArray(resolved) || resolved.questionId !== current.questionId || !["correct", "skipped"].includes(resolved.resolution) || resolved.advanced !== false)
    : stored.resolved !== undefined) return null;
  const completedCount = stored.questionIndex + (resolved ? 1 : 0);
  const completedIds = new Set(questionIds.slice(0, completedCount));
  if (!Number.isInteger(stored.correctCount) || !Number.isInteger(stored.skippedCount)
    || stored.correctCount < 0 || stored.skippedCount < 0
    || stored.correctCount + stored.skippedCount !== completedCount) return null;
  const rewardedQuestionIds = sanitizeChallengeQuestionIds(stored.rewardedQuestionIds, completedIds);
  const skippedQuestionIds = sanitizeChallengeQuestionIds(stored.skippedQuestionIds, completedIds);
  if (!rewardedQuestionIds || !skippedQuestionIds
    || rewardedQuestionIds.some((id) => skippedQuestionIds.includes(id))
    || rewardedQuestionIds.length !== stored.correctCount
    || skippedQuestionIds.length !== stored.skippedCount) return null;
  if (resolved?.resolution === "correct" && !rewardedQuestionIds.includes(current.questionId)) return null;
  if (resolved?.resolution === "skipped" && !skippedQuestionIds.includes(current.questionId)) return null;
  const rewardTransactions = sanitizeChallengeTransactions(stored.rewardTransactions, completedIds);
  if (!rewardTransactions || !Array.isArray(stored.earnedItems) || !sameItemTotals(stored.earnedItems, summarizeAwardedTransactions(rewardTransactions))) return null;
  const target = getTargetMaterial(chapter.chapterId, inventory);
  const expectedTargetId = target?.itemId || null;
  const expectedTargetRemaining = target?.quantity || 0;
  if (stored.targetMaterialId !== expectedTargetId || stored.targetRemaining !== expectedTargetRemaining) return null;
  return {
    id: typeof stored.id === "string" && stored.id ? stored.id : `${chapter.chapterId}-recovery-restored`,
    mode: stored.mode === "random" ? "random" : "review",
    questionIndex: stored.questionIndex,
    questions: questionIds.map((id) => entriesById.get(id)),
    question: current.question,
    status: stored.status,
    correctCount: stored.correctCount,
    skippedCount: stored.skippedCount,
    rewardedQuestionIds,
    skippedQuestionIds,
    earnedItems: summarizeAwardedTransactions(rewardTransactions),
    rewardTransactions,
    targetMaterialId: expectedTargetId,
    targetRemaining: expectedTargetRemaining,
    ...(resolved ? { resolved: { questionId: resolved.questionId, resolution: resolved.resolution, advanced: false } } : {})
  };
}

function serializeChallengeRun(run) {
  if (!run) return null;
  return {
    id: run.id,
    mode: run.mode,
    questionIds: (run.questions || []).map((entry) => entry.questionId),
    questionIndex: run.questionIndex,
    questionId: run.question?.id || run.questions?.[run.questionIndex]?.questionId,
    status: run.status,
    correctCount: run.correctCount,
    skippedCount: run.skippedCount,
    rewardedQuestionIds: [...(run.rewardedQuestionIds || [])],
    skippedQuestionIds: [...(run.skippedQuestionIds || [])],
    earnedItems: (run.earnedItems || []).map((entry) => ({ ...entry })),
    rewardTransactions: (run.rewardTransactions || []).map((entry) => ({ ...entry })),
    targetMaterialId: run.targetMaterialId,
    targetRemaining: run.targetRemaining,
    resolved: run.resolved ? { ...run.resolved, advanced: false } : undefined
  };
}

module.exports = { CHALLENGE_QUESTION_COUNT, listQuestions, getMissingRawMaterials, getTargetMaterial, createChallengeRun, hydrateChallengeRun, sanitizeChallengeSettlement, serializeChallengeRun };
