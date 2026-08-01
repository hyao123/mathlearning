const { CHAPTERS, DIFFICULTY_SLOTS } = require("./chapterConfig.js");
const { supplementalQuestionsByModule } = require("./chapterQuestionPacks.js");
const { supplementalQuestionsByModule: chapter02SupplementalQuestions } = require("./chapter02QuestionPacks.js");
const { supplementalQuestionsByModule: chapter03SupplementalQuestions } = require("./chapter03QuestionPacks.js");
const { supplementalQuestionsByModule: chapter04SupplementalQuestions, chapterModules: chapter04Modules } = require("./chapter04QuestionPacks.js");
const { supplementalQuestionsByModule: chapter05SupplementalQuestions, chapterModules: chapter05Modules } = require("./chapter05QuestionPacks.js");
const QuestionQuality = require("./questionQuality.js");
const ChapterQualityProfiles = require("./chapterQualityProfiles.js");
const ChapterQuestionOverrides = require("./chapterQuestionOverrides.js");

const REQUIRED_SUPPLEMENTAL_FIELDS = ["id", "title", "prompt", "answer", "explanation"];
const NATIVE_CHAPTER_MODULES = Object.freeze({
  "chapter-04": chapter04Modules,
  "chapter-05": chapter05Modules
});
const ALL_SUPPLEMENTAL_QUESTIONS = Object.freeze({ ...supplementalQuestionsByModule, ...chapter02SupplementalQuestions, ...chapter03SupplementalQuestions, ...chapter04SupplementalQuestions, ...chapter05SupplementalQuestions });
const MISSION_PHASES = Object.freeze(["启航", "校准", "侦察", "推进", "协作", "加固", "巡航", "穿越", "攻坚", "决战"]);

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getChapter(chapterId) {
  const chapter = CHAPTERS[chapterId];
  if (!chapter) {
    throw new Error(`Missing configured chapter: ${chapterId}`);
  }
  return chapter;
}

function inferReasoningType(moduleId) {
  if (/(patterns|periodicity|arithmetic-series)/.test(moduleId)) return "规律归纳";
  if (/(enumeration|add-multiply|inclusion-exclusion)/.test(moduleId)) return "分类计数";
  if (/(chicken-rabbit|sum-diff|surplus-deficit|unit-rate|average)/.test(moduleId)) return "关系建模";
  return "直接计算";
}

function enrichQuestion(candidate, module, slot, difficulty) {
  const overriddenCandidate = { ...candidate, ...(ChapterQuestionOverrides.getQuestionOverride(candidate.id) || {}) };
  const moduleProfile = ChapterQualityProfiles.getQuestionQualityProfile(module, overriddenCandidate, slot);
  const explanation = hasText(overriddenCandidate.explanation) ? overriddenCandidate.explanation : "根据题目条件一步一步计算。";
  return {
    ...overriddenCandidate,
    prompt: `${overriddenCandidate.prompt}【${MISSION_PHASES[slot - 1]}任务】`,
    answerType: overriddenCandidate.answerType || "numeric",
    slot,
    difficulty,
    isBoss: slot === 10,
    learningObjective: overriddenCandidate.learningObjective || moduleProfile?.learningObjective || `掌握${module.title}的核心方法`,
    reasoningType: overriddenCandidate.reasoningType || moduleProfile?.reasoningType || inferReasoningType(module.id),
    difficultyProfile: overriddenCandidate.difficultyProfile || moduleProfile?.difficultyProfile || {
      steps: slot <= 3 ? 1 : slot <= 7 ? 2 : 3,
      conditions: slot <= 3 ? 1 : 2,
      representation: "word-problem",
      direction: "forward",
      transfer: slot >= 8 ? "contextual" : "direct"
    },
    storyBeat: overriddenCandidate.storyBeat || moduleProfile?.storyBeat || `完成${module.title}任务，推进工程路线。`,
    solutionReview: overriddenCandidate.solutionReview || moduleProfile?.solutionReview || {
      observation: `先找出题目中和“${module.title}”有关的数量关系。`,
      steps: [explanation],
      answer: String(candidate.answer),
      check: "把结果代回题目条件核对。",
      pitfall: "注意读清数量、单位和题目所问。"
    }
  };
}

function findModule(moduleId, modules = [], chapterId = null) {
  const nativeModules = NATIVE_CHAPTER_MODULES[chapterId] || [];
  return modules.find((item) => item.id === moduleId) || nativeModules.find((item) => item.id === moduleId);
}

function buildLevel(levelConfig, modules = [], chapterId = null) {
  const module = findModule(levelConfig.moduleId, modules, chapterId);
  if (!module) throw new Error(`Missing configured module: ${levelConfig.moduleId}`);
  const supplemental = ALL_SUPPLEMENTAL_QUESTIONS[module.id] || [];
  const allPractices = [...(module.practices || []), ...supplemental].map((practice) => ({ ...practice }));
  const slots = DIFFICULTY_SLOTS.map((difficulty, index) => ({ difficulty, slot: index + 1 }));
  const selectedIds = new Set();
  const questions = slots.map(({ difficulty, slot }) => {
    const candidate = allPractices.find((practice) => practice.difficulty === difficulty && !selectedIds.has(practice.id));
    if (!candidate) throw new Error(`${module.id} 缺少第 ${slot} 题所需的${difficulty}题`);
    selectedIds.add(candidate.id);
    return enrichQuestion(candidate, module, slot, difficulty);
  });
  return { levelId: levelConfig.id, moduleId: module.id, title: module.title, questions };
}

function buildChapter(chapterId, modules) {
  const chapter = getChapter(chapterId);
  return {
    chapterId: chapter.id,
    name: chapter.name,
    rewardTheme: chapter.rewardTheme,
    levels: chapter.levels.map((levelConfig) => buildLevel(levelConfig, modules, chapter.id))
  };
}

function validateSupplementalPacks(chapterId, packs = ALL_SUPPLEMENTAL_QUESTIONS, modules = []) {
  let chapter;
  try {
    chapter = getChapter(chapterId);
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }

  const errors = [];
  const configuredModuleIds = chapter.levels.map((level) => level.moduleId);
  const configuredModuleIdSet = new Set(configuredModuleIds);
  const allowedDifficulties = new Set(DIFFICULTY_SLOTS);
  const supplementalIds = new Set();

  if (!packs || typeof packs !== "object" || Array.isArray(packs)) {
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
    const rows = packs[moduleId];
    const expectedCount = NATIVE_CHAPTER_MODULES[chapterId] ? 10 : chapterId === "chapter-03" ? 1 : 4;
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

  const supplementalReport = validateSupplementalPacks(chapterId, ALL_SUPPLEMENTAL_QUESTIONS, modules);
  errors.push(...supplementalReport.errors);

  chapter.levels.forEach((levelConfig) => {
    const module = findModule(levelConfig.moduleId, modules, chapterId);
    if (!module) {
      errors.push(`Missing configured module: ${levelConfig.moduleId}`);
      return;
    }

    const allPractices = [...(module.practices || []), ...(ALL_SUPPLEMENTAL_QUESTIONS[module.id] || [])];
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
