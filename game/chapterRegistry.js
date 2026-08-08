const { CHAPTERS, CHAPTER_IDS } = require("./chapterConfig.js");
const { CHAPTER_REGISTRATIONS, CHAPTER_REGISTRATION_BY_ID, getChapterRegistration } = require("./chapterRegistrations.js");
const GameItemCatalog = require("./itemCatalog.js");
const { CHAPTER_VISUAL_MANIFEST } = require("./chapterVisualManifest.js");

const CHAPTER_SOURCES = CHAPTER_REGISTRATION_BY_ID;

function requireChapter(chapterId) {
  const chapter = CHAPTERS[chapterId];
  if (!chapter) throw new Error(`Missing configured chapter: ${chapterId}`);
  return chapter;
}

function getChapterSource(chapterId) {
  return getChapterRegistration(chapterId);
}

function getChapterEntry(chapterId) {
  const chapter = requireChapter(chapterId);
  const source = getChapterSource(chapterId);
  const moduleIds = chapter.levels.map((level) => level.moduleId);
  const project = GameItemCatalog.getSuperProject(chapterId);
  const visuals = Object.freeze({
    chapterId,
    manifest: Object.freeze(CHAPTER_VISUAL_MANIFEST.filter((visual) => visual.chapterId === chapterId)),
    source: "itemVisuals"
  });
  return Object.freeze({
    chapter,
    chapterId,
    moduleIds: Object.freeze(moduleIds),
    nativeModules: source.nativeModules,
    supplementalCount: source.supplementalCount,
    moduleSource: source.moduleSource,
    registration: source,
    reward: Object.freeze({
      theme: chapter.rewardTheme,
      projectId: chapter.projectId,
      project
    }),
    review: Object.freeze({
      manifestPath: `content/humanReview/${chapterId}.json`,
      questionCount: moduleIds.length * 10
    }),
    visuals
  });
}

function findModule(chapterId, moduleId, legacyModules = []) {
  const entry = getChapterEntry(chapterId);
  const sources = entry.moduleSource === "legacy"
    ? [legacyModules, entry.nativeModules]
    : [entry.nativeModules, legacyModules];
  return sources.flat().find((module) => module?.id === moduleId);
}

function getSupplementalQuestions(chapterId, moduleId) {
  return getChapterSource(chapterId).supplementalQuestionsByModule?.[moduleId] || [];
}

function getSupplementalQuestionsByModule(chapterId) {
  return getChapterSource(chapterId).supplementalQuestionsByModule || {};
}

const ChapterRegistry = {
  CHAPTER_IDS,
  CHAPTER_SOURCES,
  CHAPTER_REGISTRATIONS,
  getChapterEntry,
  getChapterSource,
  findModule,
  getSupplementalQuestions,
  getSupplementalQuestionsByModule
};

if (typeof globalThis !== "undefined") globalThis.GameChapterRegistry = ChapterRegistry;

module.exports = ChapterRegistry;
