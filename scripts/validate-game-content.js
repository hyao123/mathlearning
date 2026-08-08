const path = require("node:path");
const fs = require("node:fs");

const root = path.resolve(__dirname, "..");
const GameChapterBuilder = require(path.join(root, "game", "chapterBuilder.js"));
const QuestionQuality = require(path.join(root, "game", "questionQuality.js"));
const { CHAPTER_IDS } = require(path.join(root, "game", "chapterConfig.js"));
const GameItemCatalog = require(path.join(root, "game", "itemCatalog.js"));
const { RUNTIME_SOURCE_FILES } = require(path.join(root, "game", "runtimeSources.js"));
const { getManifestContentHash, getQuestionContentHash, normalizeReviewedPrompt } = require("./humanReviewIntegrity.js");

const contentFiles = RUNTIME_SOURCE_FILES;

function loadExpandedModules() {
  global.window = globalThis;
  contentFiles.forEach((file) => require(path.join(root, file)));
  return globalThis.MATH_LEARNING_DATA || [];
}

function loadReviewManifest(chapterId = "chapter-01", reviewPath = path.join(root, "content", "humanReview", `${chapterId}.json`)) {
  if (!fs.existsSync(reviewPath)) return null;
  const payload = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Human review manifest must be an object");
  }
  return payload;
}

function validateBuiltChapter(chapter, { requireHumanReview = false, reviewManifest = null } = {}) {
  const questions = chapter.levels.flatMap((level) => level.questions);
  const storyCoverage = chapter.levels.map((level) => ({
    levelId: level.levelId,
    uniqueBeats: new Set(level.questions.map((question) => question.storyBeat)).size
  }));
  const errors = [
    ...questions.flatMap((question) => QuestionQuality
      .validateQuestionQuality(question)
      .map((error) => `${question.id}: ${error}`)),
    ...storyCoverage
      .filter((entry) => entry.uniqueBeats < 4)
      .map((entry) => `${entry.levelId}: story variants must contain at least 4 stable beats; found ${entry.uniqueBeats}`)
  ];
  if (/^chapter-0[789]$/.test(chapter.chapterId)) {
    chapter.levels.forEach((level) => {
      QuestionQuality.validateTopicTemplateDiversity(level.questions).forEach((error) => {
        errors.push(`${level.levelId}: ${error}`);
      });
    });
  }
  const warnings = QuestionQuality.detectTemplateDuplicates(questions)
    .map(({ questionIds }) => `suspected numeric template duplicate: ${questionIds.join(", ")}`);

  if (requireHumanReview) {
    if (!reviewManifest) {
      errors.push(`missing human review manifest: content/humanReview/${chapter.chapterId}.json`);
    } else if (reviewManifest.status !== "approved") {
      errors.push(`human review manifest is not approved: ${reviewManifest.status || "unknown"}`);
    } else {
      errors.push(...QuestionQuality.validateHumanReviewRecords(reviewManifest.records, questions.map((question) => question.id)));
      if (reviewManifest.schemaVersion !== 2) errors.push("human review manifest schemaVersion must be 2");
      const expectedRecords = questions.map((question) => ({ questionId: question.id, contentHash: getQuestionContentHash(question) }));
      const recordsById = new Map((reviewManifest.records || []).map((record) => [record.questionId, record]));
      expectedRecords.forEach(({ questionId, contentHash }) => {
        const question = questions.find((candidate) => candidate.id === questionId);
        const record = recordsById.get(questionId);
        if (record?.contentHash !== contentHash || record?.title !== question?.title || normalizeReviewedPrompt(record?.prompt) !== normalizeReviewedPrompt(question?.prompt)) {
          errors.push(`human review content hash mismatch: ${questionId}`);
        }
      });
      if (reviewManifest.contentHash !== getManifestContentHash(expectedRecords)) errors.push("human review manifest content hash mismatch");
    }
  }
  return { valid: errors.length === 0, errors, warnings, questionCount: questions.length, storyCoverage };
}

function validateProjectChain(chapterId) {
  const project = GameItemCatalog.getSuperProject(chapterId);
  if (!project) return [`${chapterId}: missing super project`];
  const errors = [];
  const materialRecipes = Array.isArray(project.materialRecipes) ? project.materialRecipes : [];
  const componentRecipes = Array.isArray(project.componentRecipes) ? project.componentRecipes : [];
  const partRecipes = Array.isArray(project.partRecipes) ? project.partRecipes : [];
  const theme = GameItemCatalog.getChapterTheme(chapterId);
  const seenOutputs = new Set();
  const validateEntry = (entry, recipeId, role) => {
    if (!entry || typeof entry.itemId !== "string" || !Number.isInteger(entry.quantity) || entry.quantity <= 0) {
      errors.push(`${chapterId}: ${recipeId} has an invalid ${role}`);
      return;
    }
    const item = GameItemCatalog.getItem(entry.itemId);
    if (!item) errors.push(`${chapterId}: ${recipeId} references missing item ${entry.itemId}`);
    else if (!item.tags?.includes(chapterId)) errors.push(`${chapterId}: ${recipeId} ${role} is not chapter-scoped`);
  };
  const validateRecipe = (recipe, role) => {
    if (!recipe || typeof recipe.id !== "string") {
      errors.push(`${chapterId}: invalid ${role} recipe`);
      return;
    }
    if (!Array.isArray(recipe.inputs) || !recipe.inputs.length || !recipe.output) {
      errors.push(`${chapterId}: ${recipe.id} must have inputs and an output`);
      return;
    }
    recipe.inputs.forEach((entry) => validateEntry(entry, recipe.id, "input"));
    validateEntry(recipe.output, recipe.id, "output");
  };

  if (materialRecipes.length !== 12) errors.push(`${chapterId}: material processing must expose 12 recipes`);
  materialRecipes.forEach((recipe, index) => {
    validateRecipe(recipe, "material-processing");
    if (recipe?.type !== "material-processing") errors.push(`${chapterId}: ${recipe?.id || `material-${index + 1}`} must be material-processing`);
    const output = GameItemCatalog.getItem(recipe?.output?.itemId);
    if (output && output.category !== "processed-material") errors.push(`${chapterId}: ${recipe.id} output must be processed-material`);
    if (recipe?.output?.itemId && seenOutputs.has(recipe.output.itemId)) errors.push(`${chapterId}: duplicate material output ${recipe.output.itemId}`);
    if (recipe?.output?.itemId) seenOutputs.add(recipe.output.itemId);
  });

  if (componentRecipes.length !== 12) errors.push(`${chapterId}: component assembly must expose 12 recipes`);
  componentRecipes.forEach((recipe, index) => {
    validateRecipe(recipe, "component");
    const processed = materialRecipes[index]?.output?.itemId;
    if (recipe?.inputs?.length !== 1 || recipe.inputs[0]?.itemId !== processed) {
      errors.push(`${chapterId}: component ${index + 1} must consume only its processed material`);
    }
    if (recipe?.output?.itemId && GameItemCatalog.getItem(recipe.output.itemId)?.category !== `${project.id.split("-")[0]}-component`) {
      // Expansion projects use a stable prefix category (sub-component, station-component, etc.).
      const output = GameItemCatalog.getItem(recipe.output.itemId);
      if (!output?.tags?.includes(chapterId) || !output.category?.endsWith("-component")) errors.push(`${chapterId}: component ${index + 1} output category is invalid`);
    }
  });

  if (partRecipes.length !== 4) errors.push(`${chapterId}: large-part assembly must expose 4 recipes`);
  partRecipes.forEach((recipe, index) => {
    validateRecipe(recipe, "large-part");
    const expected = componentRecipes.slice(index * 3, index * 3 + 3).map((candidate) => candidate.output?.itemId);
    if (JSON.stringify(recipe?.inputs?.map((entry) => entry.itemId)) !== JSON.stringify(expected)) {
      errors.push(`${chapterId}: large part ${index + 1} must combine its three components in order`);
    }
  });

  validateRecipe(project.finalRecipe, "final-project");
  const expectedParts = partRecipes.map((recipe) => recipe.output?.itemId);
  if (JSON.stringify(project.finalRecipe?.inputs?.map((entry) => entry.itemId)) !== JSON.stringify(expectedParts)) {
    errors.push(`${chapterId}: final project must combine all four large parts in order`);
  }
  if (project.finalRecipe?.output?.itemId !== project.id) errors.push(`${chapterId}: final recipe output must match project id`);
  if (!theme || !Array.isArray(theme.rewardPool) || theme.rewardPool.length !== 11) errors.push(`${chapterId}: reward pool must expose 11 raw materials`);
  if (theme?.rewardPool && new Set(theme.rewardPool).size !== theme.rewardPool.length) errors.push(`${chapterId}: reward pool must not duplicate raw materials`);
  (theme?.rewardPool || []).forEach((itemId) => {
    const item = GameItemCatalog.getItem(itemId);
    if (!item || !item.tags?.includes(chapterId)) errors.push(`${chapterId}: reward pool item ${itemId} is not chapter-scoped`);
  });
  const processedIds = new Set(materialRecipes.map((recipe) => recipe.output?.itemId).filter(Boolean));
  materialRecipes.flatMap((recipe) => recipe.inputs || []).forEach((entry) => {
    if (entry?.itemId && !processedIds.has(entry.itemId) && !theme?.rewardPool?.includes(entry.itemId)) {
      errors.push(`${chapterId}: ${entry.itemId} is used by processing but is not a chapter reward material`);
    }
  });
  return errors;
}

function shouldRequireHumanReview(argv = process.argv, env = process.env) {
  if (argv.includes("--strict")) return true;
  if (env.REQUIRE_HUMAN_REVIEW === "1") return true;
  return !argv.includes("--content-only");
}

function runCli() {
  const requireHumanReview = shouldRequireHumanReview();
  const modules = loadExpandedModules();
  const reports = CHAPTER_IDS.map((chapterId) => ({ chapterId, report: GameChapterBuilder.validateChapter(chapterId, modules), projectErrors: validateProjectChain(chapterId) }));
  const invalid = reports.filter(({ report, projectErrors }) => !report.valid || projectErrors.length);
  if (invalid.length) {
    console.error(`FAIL game content validation found ${invalid.reduce((sum, entry) => sum + entry.report.errors.length + entry.projectErrors.length, 0)} issue(s):`);
    invalid.flatMap(({ chapterId, report, projectErrors }) => [...report.errors.map((error) => `${chapterId}: ${error}`), ...projectErrors]).forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  const qualityReports = [];
  for (const chapterId of CHAPTER_IDS) {
    const chapter = GameChapterBuilder.buildChapter(chapterId, modules);
    let reviewManifest;
    try { reviewManifest = loadReviewManifest(chapterId); } catch (error) {
      console.error(`FAIL game content validation: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    qualityReports.push({ chapterId, reviewManifest, report: validateBuiltChapter(chapter, { requireHumanReview, reviewManifest }) });
  }
  const failed = qualityReports.filter(({ report }) => !report.valid);
  if (failed.length) {
    console.error(`FAIL game quality validation found ${failed.reduce((sum, entry) => sum + entry.report.errors.length, 0)} issue(s):`);
    failed.flatMap(({ chapterId, report }) => report.errors.map((error) => `${chapterId}: ${error}`)).forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  qualityReports.forEach(({ chapterId, reviewManifest, report }) => {
    report.warnings.forEach((warning) => console.warn(`WARN game content: ${chapterId}: ${warning}`));
  });
  const count = qualityReports.reduce((sum, entry) => sum + entry.report.questionCount, 0);
  console.log(`OK game content: ${CHAPTER_IDS.length} chapters, ${count} questions; human review: ${qualityReports.map(({ chapterId, reviewManifest }) => `${chapterId}=${reviewManifest?.status || "not-started"}`).join(", ")}`);
}

if (require.main === module) {
  runCli();
}

module.exports = { contentFiles, loadExpandedModules, loadReviewManifest, shouldRequireHumanReview, validateBuiltChapter, validateProjectChain, runCli };
