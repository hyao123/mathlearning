const test = require("node:test");
const assert = require("node:assert/strict");
const { CHAPTER_IDS } = require("../game/chapterConfig.js");
const ChapterBuilder = require("../game/chapterBuilder.js");
const ChapterRegistry = require("../game/chapterRegistry.js");
const Catalog = require("../game/itemCatalog.js");
const QuestionQuality = require("../game/questionQuality.js");

const NEW_CHAPTERS = ["chapter-07", "chapter-08", "chapter-09"];

test("第七至第九章按顺序注册并锁定前置章节", () => {
  assert.deepEqual(CHAPTER_IDS.slice(-3), NEW_CHAPTERS);
  assert.equal(ChapterRegistry.getChapterEntry("chapter-07").chapter.prerequisiteChapterId, "chapter-06");
  assert.equal(ChapterRegistry.getChapterEntry("chapter-08").chapter.prerequisiteChapterId, "chapter-07");
  assert.equal(ChapterRegistry.getChapterEntry("chapter-09").chapter.prerequisiteChapterId, "chapter-08");
});

test("三章各有12个专题，每个专题严格10道自动判定数值题", () => {
  for (const chapterId of NEW_CHAPTERS) {
    const chapter = ChapterBuilder.buildChapter(chapterId);
    assert.equal(chapter.levels.length, 12);
    chapter.levels.forEach((level) => {
      assert.equal(level.questions.length, 10, `${chapterId}/${level.levelId}`);
      level.questions.forEach((question) => {
        assert.equal(question.answerType, "numeric", question.id);
        assert.match(String(question.answer), /^[+-]?(?:\d+(?:\.\d+)?|\d+\/\d+)%?$/, question.id);
        assert.ok(question.thinkingMethodId, question.id);
        assert.ok(question.solutionReview?.steps?.length >= 3, question.id);
      });
    });
  }
});

test("第七至九章每个专题具备至少4种真实题面模板", () => {
  for (const chapterId of NEW_CHAPTERS) {
    const chapter = ChapterBuilder.buildChapter(chapterId);
    chapter.levels.forEach((level) => {
      const families = new Set(level.questions.map((question) => question.semanticProfile?.templateFamily));
      assert.ok(families.size >= 4, `${chapterId}/${level.levelId} should expose at least 4 template families`);
      assert.equal(QuestionQuality.validateTopicTemplateDiversity(level.questions).length, 0, `${chapterId}/${level.levelId}`);
    });
  }
});

test("离散数量题不产生分数答案，最不利原则有递进变化", () => {
  const chapter = ChapterBuilder.buildChapter("chapter-08");
  const elimination = chapter.levels.find((level) => level.title === "表格排除");
  const contradiction = chapter.levels.find((level) => level.title === "反证启蒙");
  const worstCase = chapter.levels.find((level) => level.title === "最不利原则");

  for (const question of [...elimination.questions, ...contradiction.questions]) {
    assert.equal(question.semanticProfile?.integerAnswer, true, question.id);
    assert.match(question.answer, /^\d+$/, question.id);
  }
  assert.ok(new Set(worstCase.questions.map((question) => question.answer)).size >= 2);
  assert.ok(worstCase.questions.every((question) => question.semanticProfile?.integerAnswer === true));
});

test("三章终极工程具备12组件、4大型部件和固定奖励路线", () => {
  for (const chapterId of NEW_CHAPTERS) {
    const project = Catalog.getSuperProject(chapterId);
    assert.equal(project.componentRecipes.length, 12, chapterId);
    assert.equal(project.partRecipes.length, 4, chapterId);
    assert.equal(project.finalRecipe.inputs.length, 4, chapterId);
    assert.equal(Catalog.getChapterTheme(chapterId).rewardPool.length, 11, chapterId);
  }
});
