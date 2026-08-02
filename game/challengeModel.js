const GameItemCatalog = require("./itemCatalog.js");
const QuestionAccess = require("./questionAccess.js");

const CHALLENGE_QUESTION_COUNT = 10;

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
  const visiting = new Set();
  function requireItem(itemId, quantity) {
    const have = Number.isInteger(inventory[itemId]) && inventory[itemId] > 0 ? inventory[itemId] : 0;
    const deficit = Math.max(quantity - have, 0);
    if (!deficit) return;
    const recipe = recipeByOutput.get(itemId);
    if (!recipe || visiting.has(itemId)) {
      missing.set(itemId, (missing.get(itemId) || 0) + deficit);
      return;
    }
    visiting.add(itemId);
    recipe.inputs.forEach((entry) => requireItem(entry.itemId, deficit * entry.quantity));
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

function hydrateChallengeRun(stored, chapter) {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return null;
  const entriesById = new Map(listQuestions(chapter).map((entry) => [entry.question.id, toChallengeEntry(entry)]));
  const questionIds = Array.isArray(stored.questionIds) ? [...new Set(stored.questionIds)] : [];
  if (questionIds.length === 0 || questionIds.length > CHALLENGE_QUESTION_COUNT || !questionIds.every((id) => entriesById.has(id))) return null;
  if (!Number.isInteger(stored.questionIndex) || stored.questionIndex < 0 || stored.questionIndex >= questionIds.length) return null;
  if (!new Set(["active", "retry", "resolved"]).has(stored.status)) return null;
  const current = entriesById.get(questionIds[stored.questionIndex]);
  if (stored.questionId !== current.questionId) return null;
  return {
    id: typeof stored.id === "string" && stored.id ? stored.id : `${chapter.chapterId}-recovery-restored`,
    mode: stored.mode === "random" ? "random" : "review",
    questionIndex: stored.questionIndex,
    questions: questionIds.map((id) => entriesById.get(id)),
    question: current.question,
    status: stored.status,
    correctCount: Number.isInteger(stored.correctCount) && stored.correctCount >= 0 ? stored.correctCount : 0,
    skippedCount: Number.isInteger(stored.skippedCount) && stored.skippedCount >= 0 ? stored.skippedCount : 0,
    rewardedQuestionIds: Array.isArray(stored.rewardedQuestionIds) ? [...new Set(stored.rewardedQuestionIds.filter((id) => questionIds.includes(id)))] : [],
    skippedQuestionIds: Array.isArray(stored.skippedQuestionIds) ? [...new Set(stored.skippedQuestionIds.filter((id) => questionIds.includes(id)))] : [],
    earnedItems: Array.isArray(stored.earnedItems) ? stored.earnedItems.map((entry) => ({ ...entry })) : [],
    rewardTransactions: Array.isArray(stored.rewardTransactions) ? stored.rewardTransactions.map((entry) => ({ ...entry })) : [],
    targetMaterialId: typeof stored.targetMaterialId === "string" ? stored.targetMaterialId : null,
    targetRemaining: Number.isInteger(stored.targetRemaining) && stored.targetRemaining > 0 ? stored.targetRemaining : 0,
    ...(stored.resolved ? { resolved: { ...stored.resolved, advanced: false } } : {})
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

module.exports = { CHALLENGE_QUESTION_COUNT, listQuestions, getMissingRawMaterials, getTargetMaterial, createChallengeRun, hydrateChallengeRun, serializeChallengeRun };
