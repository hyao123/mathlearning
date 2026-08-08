const assert = require("node:assert/strict");
const test = require("node:test");

const registry = require("../game/chapterRegistry.js");
const { CHAPTER_IDS } = require("../game/chapterConfig.js");

test("every enabled chapter has one registry entry for content, rewards, visuals, and review", () => {
  CHAPTER_IDS.forEach((chapterId) => {
    const entry = registry.getChapterEntry(chapterId);
    assert.equal(entry.chapter.id, chapterId);
    assert.equal(entry.moduleIds.length, 12);
    assert.equal(entry.moduleIds.every((moduleId) => registry.findModule(chapterId, moduleId)), true, chapterId);
    assert.equal(entry.supplementalCount >= 0, true, chapterId);
    assert.equal(entry.moduleIds.every((moduleId) => Array.isArray(registry.getSupplementalQuestions(chapterId, moduleId))), true, chapterId);
    assert.equal(entry.reward.projectId, entry.chapter.projectId, chapterId);
    assert.equal(entry.review.questionCount, 120, chapterId);
    assert.equal(entry.visuals.chapterId, chapterId, chapterId);
  });
});

test("registry resolves native modules without the legacy full source", () => {
  const module = registry.findModule("chapter-01", "patterns", []);
  assert.equal(module.id, "patterns");
  assert.equal(module.practices.length > 0, true);
  assert.deepEqual(registry.getSupplementalQuestions("chapter-01", "patterns").map((question) => question.id).length, 4);
});

test("chapter content is resolved through one declaration for every enabled chapter", () => {
  assert.equal(Array.isArray(registry.CHAPTER_REGISTRATIONS), true);
  assert.equal(registry.CHAPTER_REGISTRATIONS.length, CHAPTER_IDS.length);
  CHAPTER_IDS.forEach((chapterId) => {
    const source = registry.getChapterSource(chapterId);
    assert.equal(source.chapterId, chapterId);
    assert.ok(Array.isArray(source.nativeModules), chapterId);
    assert.equal(typeof source.supplementalQuestionsByModule, "object");
    assert.equal(Number.isInteger(source.supplementalCount), true);
  });
  assert.doesNotMatch(registry.findModule.toString(), /chapter-0\[7-9\]/);
});
