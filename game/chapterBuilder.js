const { DIFFICULTY_SLOTS } = require("./chapterConfig.js");
const ChapterRegistry = require("./chapterRegistry.js");
const QuestionQuality = require("./questionQuality.js");
const ChapterQualityProfiles = require("./chapterQualityProfiles.js");
const ChapterQuestionOverrides = require("./chapterQuestionOverrides.js");
const QuestionContract = require("./questionContract.js");
const QuestionContractFixes = require("./questionContractFixes.js");

const REQUIRED_SUPPLEMENTAL_FIELDS = ["id", "title", "prompt", "answer", "explanation"];
const MISSION_PHASES = Object.freeze(["启航", "校准", "侦察", "推进", "协作", "加固", "巡航", "穿越", "攻坚", "决战"]);

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getChapter(chapterId) {
  return ChapterRegistry.getChapterEntry(chapterId).chapter;
}

function inferReasoningType(moduleId) {
  if (/(patterns|periodicity|arithmetic-series)/.test(moduleId)) return "规律归纳";
  if (/(enumeration|add-multiply|inclusion-exclusion)/.test(moduleId)) return "分类计数";
  if (/(chicken-rabbit|sum-diff|surplus-deficit|unit-rate|average)/.test(moduleId)) return "关系建模";
  return "直接计算";
}

function enrichQuestion(candidate, module, slot, difficulty, chapterId) {
  const overriddenCandidate = {
    ...candidate,
    ...(ChapterQuestionOverrides.getQuestionOverride(candidate.id) || {}),
    ...(QuestionContractFixes.getQuestionContractFix(candidate.id) || {})
  };
  const moduleProfile = ChapterQualityProfiles.getQuestionQualityProfile(
    { ...module, chapterId },
    { ...overriddenCandidate, chapterId },
    slot
  );
  const explanation = hasText(overriddenCandidate.explanation) ? overriddenCandidate.explanation : "根据题目条件一步一步计算。";
  return {
    ...overriddenCandidate,
    prompt: `${overriddenCandidate.prompt}【${MISSION_PHASES[slot - 1]}任务】`,
    answerType: overriddenCandidate.answerType || "numeric",
    answerFormat: overriddenCandidate.answerFormat || QuestionContract.getAnswerFormat(overriddenCandidate.answer),
    slot,
    difficulty,
    isBoss: slot === 10,
    learningObjective: overriddenCandidate.learningObjective || moduleProfile?.learningObjective || `掌握${module.title}的核心方法`,
    knowledgeGoal: overriddenCandidate.knowledgeGoal || moduleProfile?.knowledgeGoal || overriddenCandidate.learningObjective || `掌握${module.title}的核心方法`,
    typicalModel: overriddenCandidate.typicalModel || moduleProfile?.typicalModel || overriddenCandidate.difficultyProfile?.representation || "word-problem",
    commonPitfall: overriddenCandidate.commonPitfall || moduleProfile?.commonPitfall || moduleProfile?.pitfall || "不要省略最后的验算。",
    transferType: overriddenCandidate.transferType || moduleProfile?.transferType || (slot >= 10 ? "boss-integration" : slot >= 8 ? "contextual" : "direct"),
    verificationMethod: overriddenCandidate.verificationMethod || moduleProfile?.verificationMethod || moduleProfile?.solutionReview?.verification || "把结果代回题目条件，确认数量、单位和所求量一致。",
    reasoningType: overriddenCandidate.reasoningType || moduleProfile?.reasoningType || inferReasoningType(module.id),
    thinkingMethodId: overriddenCandidate.thinkingMethodId || moduleProfile?.thinkingMethodId,
    thinkingMethodLabel: overriddenCandidate.thinkingMethodLabel || moduleProfile?.thinkingMethodLabel,
    methodPrompt: overriddenCandidate.methodPrompt || moduleProfile?.methodPrompt,
    methodReview: overriddenCandidate.methodReview || moduleProfile?.methodReview,
    difficultyProfile: overriddenCandidate.difficultyProfile || moduleProfile?.difficultyProfile || {
      steps: slot <= 3 ? 1 : slot <= 7 ? 2 : 3,
      conditions: slot <= 3 ? 1 : 2,
      representation: "word-problem",
      direction: "forward",
      transfer: slot >= 8 ? "contextual" : "direct"
    },
    storyBeat: overriddenCandidate.storyBeat || moduleProfile?.storyBeat || `完成${module.title}任务，推进工程路线。`,
    solutionReview: {
      ...(moduleProfile?.solutionReview || {
        schemaVersion: 2,
        method: "word-problem",
        stepKinds: ["observe", "calculate", "verify"],
        observation: `\u5148\u627e\u51fa${module.title}\u4e2d\u7684\u6570\u91cf\u5173\u7cfb\u3002`,
        steps: ["\u89c2\u5bdf\u9898\u76ee\u6761\u4ef6", explanation, "\u628a\u7ed3\u679c\u4ee3\u56de\u9898\u76ee\u6838\u5bf9"],
        calculation: explanation,
        answer: String(overriddenCandidate.answer),
        answerFormat: QuestionContract.getAnswerFormat(overriddenCandidate.answer),
        verification: "\u628a\u7ed3\u679c\u4ee3\u56de\u9898\u76ee\u6761\u4ef6\uff0c\u786e\u8ba4\u6570\u91cf\u3001\u5355\u4f4d\u548c\u6240\u6c42\u91cf\u5747\u6b63\u786e\u3002",
        check: "\u6838\u5bf9\u7ed3\u679c\u4e0e\u9898\u76ee\u6761\u4ef6\u662f\u5426\u4e00\u81f4\u3002",
        errorTrap: "\u63d0\u4ea4\u524d\u68c0\u67e5\u8fd0\u7b97\u987a\u5e8f\u548c\u5355\u4f4d\u3002",
        pitfall: "\u4e0d\u8981\u7701\u7565\u6700\u540e\u7684\u9a8c\u7b97\u3002"
      }),
      ...(overriddenCandidate.solutionReview || {})
    }
  };
}

function findModule(moduleId, modules = [], chapterId = null) {
  return chapterId
    ? ChapterRegistry.findModule(chapterId, moduleId, modules)
    : modules.find((item) => item.id === moduleId);
}

function buildLevel(levelConfig, modules = [], chapterId = null) {
  const module = findModule(levelConfig.moduleId, modules, chapterId);
  if (!module) throw new Error(`Missing configured module: ${levelConfig.moduleId}`);
  const supplemental = ChapterRegistry.getSupplementalQuestions(chapterId, module.id);
  const allPractices = [...(module.practices || []), ...supplemental].map((practice) => ({ ...practice }));
  const slots = DIFFICULTY_SLOTS.map((difficulty, index) => ({ difficulty, slot: index + 1 }));
  const selectedIds = new Set();
  const questions = slots.map(({ difficulty, slot }) => {
    const candidate = allPractices.find((practice) => practice.difficulty === difficulty && !selectedIds.has(practice.id));
    if (!candidate) throw new Error(`${module.id} 缺少第 ${slot} 题所需的${difficulty}题`);
    selectedIds.add(candidate.id);
    return enrichQuestion(candidate, module, slot, difficulty, chapterId);
  });
  return { levelId: levelConfig.id, moduleId: module.id, title: module.title, questions };
}

function buildChapter(chapterId, modules) {
  const chapter = getChapter(chapterId);
  return {
    chapterId: chapter.id,
    name: chapter.name,
    rewardTheme: chapter.rewardTheme,
    prerequisiteChapterId: chapter.prerequisiteChapterId,
    levels: chapter.levels.map((levelConfig) => buildLevel(levelConfig, modules, chapter.id))
  };
}

function validateSupplementalPacks(chapterId, packs = null, modules = []) {
  let chapter;
  try {
    chapter = getChapter(chapterId);
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }

  const errors = [];
  const configuredModuleIds = chapter.levels.map((level) => level.moduleId);
  const selectedPacks = packs || ChapterRegistry.getSupplementalQuestionsByModule(chapterId);
  const allowedDifficulties = new Set(DIFFICULTY_SLOTS);
  const supplementalIds = new Set();

  if (!selectedPacks || typeof selectedPacks !== "object" || Array.isArray(selectedPacks)) {
    return { valid: false, errors: ["Supplemental question packs must be an object"] };
  }

  const validatePackRows = (moduleId, rows) => {
    if (!Array.isArray(rows)) {
      errors.push(`${moduleId} supplemental pack must be an array`);
      return;
    }

    rows.forEach((question, index) => {
      const pathLabel = `${moduleId}[${index}]`;
      const row = question && typeof question === "object" ? question : {};

      REQUIRED_SUPPLEMENTAL_FIELDS.forEach((field) => {
        if (!hasText(row[field])) {
          errors.push(`${pathLabel}: missing ${field}`);
        }
      });

      if (hasText(row.id) && !row.id.startsWith(`${chapterId}-`)) {
        errors.push(`${pathLabel}: id must start with "${chapterId}-"`);
      }
      if (hasText(row.id)) {
        if (supplementalIds.has(row.id)) {
          errors.push(`${pathLabel}: duplicate supplemental id "${row.id}"`);
        }
        supplementalIds.add(row.id);
      }
      if (!allowedDifficulties.has(row.difficulty)) {
        errors.push(`${pathLabel}: invalid difficulty "${row.difficulty}"`);
      }
    });
  };

  configuredModuleIds.forEach((moduleId) => {
    const rows = selectedPacks[moduleId];
    const expectedCount = ChapterRegistry.getChapterEntry(chapterId).supplementalCount || 0;
    if (!Array.isArray(rows) || rows.length !== expectedCount) {
      errors.push(`${moduleId} must contain exactly ${expectedCount} supplemental questions; found ${Array.isArray(rows) ? rows.length : 0}`);
    }
    if (rows === undefined) return;
    validatePackRows(moduleId, rows);
  });

  // Packs are shared by all shipped chapters. Only validate the packs selected by this chapter;
  // another chapter's supplemental rows are neither orphaned nor an error here.

  const builtQuestions = chapter.levels.flatMap((levelConfig) => {
    try {
      return buildLevel(levelConfig, modules, chapterId).questions;
    } catch {
      return [];
    }
  });
  builtQuestions.forEach((question) => {
    QuestionQuality.validateQuestionQuality(question).forEach((error) => errors.push(`${question.id}: ${error}`));
  });
  QuestionQuality.detectTemplateDuplicates(builtQuestions).forEach(({ questionIds }) => errors.push(`疑似模板重复：${questionIds.join("、")}`));
  return { valid: errors.length === 0, errors };
}

function validateChapter(chapterId, modules) {
  const errors = [];
  let chapter;
  try {
    chapter = getChapter(chapterId);
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }

  const supplementalReport = validateSupplementalPacks(chapterId, null, modules);
  errors.push(...supplementalReport.errors);

  chapter.levels.forEach((levelConfig) => {
    const module = findModule(levelConfig.moduleId, modules, chapterId);
    if (!module) {
      errors.push(`Missing configured module: ${levelConfig.moduleId}`);
      return;
    }

    const allPractices = [...(module.practices || []), ...ChapterRegistry.getSupplementalQuestions(chapterId, module.id)];
    const selectedIds = new Set();
    DIFFICULTY_SLOTS.forEach((difficulty, index) => {
      const slot = index + 1;
      const candidate = allPractices.find((practice) => practice.difficulty === difficulty && !selectedIds.has(practice.id));
      if (!candidate) {
        errors.push(`${module.id} 缺少第 ${slot} 题所需的${difficulty}题`);
        return;
      }
      selectedIds.add(candidate.id);
    });
  });

  return { valid: errors.length === 0, errors };
}

const GameChapterBuilder = { buildChapter, buildLevel, validateChapter, validateSupplementalPacks };

if (typeof globalThis !== "undefined") {
  globalThis.GameChapterBuilder = GameChapterBuilder;
}

module.exports = GameChapterBuilder;
