const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const builder = require("../game/chapterBuilder.js");
const { RUNTIME_SOURCE_FILES } = require("../game/runtimeSources.js");

const chapterOneModuleIds = [
  "patterns", "quick-calculation", "arithmetic-series", "periodicity", "enumeration", "add-multiply-principle",
  "inclusion-exclusion", "sum-diff", "unit-rate", "surplus-deficit", "chicken-rabbit", "average"
];

function createSupplementalPacks() {
  return Object.fromEntries(chapterOneModuleIds.map((moduleId) => [
    moduleId,
    Array.from({ length: 4 }, (_, index) => ({
      id: `chapter-01-${moduleId}-${index + 1}`,
      title: `Question ${index + 1}`,
      difficulty: "基础",
      prompt: `Prompt ${index + 1}`,
      answer: `Answer ${index + 1}`,
      explanation: `Explanation ${index + 1}`
    }))
  ]));
}

function loadExpandedModules() {
  global.window = globalThis;
  RUNTIME_SOURCE_FILES.forEach((file) => require(path.join(root, file)));
  return globalThis.MATH_LEARNING_DATA;
}

test("builds ten stable questions in the approved difficulty slots", () => {
  const modules = loadExpandedModules();
  const level = builder.buildChapter("chapter-01", modules).levels[0];

  assert.equal(level.questions.length, 10);
  assert.deepEqual(level.questions.map((question) => question.difficulty), ["基础", "基础", "进阶", "进阶", "进阶", "提高", "提高", "提高", "挑战", "挑战"]);
  assert.deepEqual(level.questions.map((question) => question.slot), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(level.questions[9].isBoss, true);
  assert.deepEqual(level.questions.map((question) => question.id), [
    "patterns-1", "patterns-2", "patterns-3", "patterns-4", "chapter-01-patterns-advance-1",
    "patterns-5", "patterns-8", "patterns-9", "patterns-6", "patterns-12"
  ]);
});

test("builds 120 structured numeric questions for the polar icebreaker route without source modules", () => {
  const chapter = builder.buildChapter("chapter-04", []);
  const questions = chapter.levels.flatMap((level) => level.questions);

  assert.equal(chapter.levels.length, 12);
  assert.equal(questions.length, 120);
  assert.equal(chapter.levels.every((level) => level.questions.length === 10), true);
  assert.equal(questions.every((question) => /^\d+(?:\.\d+)?(?:\/\d+)?$/.test(question.answer)), true);
  assert.equal(questions.every((question) => question.answerType === "numeric"), true);
  assert.equal(questions.every((question) => question.learningObjective && question.storyBeat && question.solutionReview?.steps?.length), true);
});

test("builds 120 structured numeric questions for the armored assault route from the native chapter registry", () => {
  const chapter = builder.buildChapter("chapter-05", []);
  const questions = chapter.levels.flatMap((level) => level.questions);

  assert.equal(chapter.name, "装甲突击演练");
  assert.equal(chapter.levels.length, 12);
  assert.equal(questions.length, 120);
  assert.equal(chapter.levels.every((level) => level.questions.length === 10), true);
  assert.equal(questions.every((question) => /^\d+(?:\.\d+)?(?:\/\d+)?$/.test(question.answer)), true);
  assert.equal(questions.every((question) => question.answerType === "numeric"), true);
  assert.equal(questions.every((question) => /装甲突击演练任务/.test(question.prompt)), true);
  assert.equal(questions.every((question) => /装甲突击/.test(question.storyBeat)), true);
});

test("builds 120 structured numeric questions for the star-sea probability route", () => {
  const chapter = builder.buildChapter("chapter-06", []);
  const questions = chapter.levels.flatMap((level) => level.questions);

  assert.equal(chapter.name, "星海数据与概率远征");
  assert.equal(chapter.levels.length, 12);
  assert.equal(questions.length, 120);
  assert.equal(chapter.levels.every((level) => level.questions.length === 10), true);
  assert.equal(questions.every((question) => /^\d+(?:\.\d+)?(?:\/\d+)?$/.test(question.answer)), true);
  assert.equal(questions.every((question) => question.answerType === "numeric"), true);
  assert.equal(questions.every((question) => /星海数据与概率远征任务/.test(question.prompt)), true);
  assert.equal(questions.every((question) => /星海数据与概率远征/.test(question.storyBeat)), true);
});

test("all enabled chapters expose only contract-safe numeric answers", () => {
  const modules = loadExpandedModules();
  const chapters = ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06"]
    .map((chapterId) => builder.buildChapter(chapterId, modules));
  const questions = chapters.flatMap((chapter) => chapter.levels.flatMap((level) => level.questions));

  assert.equal(questions.length, 720);
  assert.equal(questions.every((question) => question.answerType === "numeric"), true);
  assert.equal(questions.every((question) => /\d/.test(String(question.answer))), true);
  assert.equal(questions.every((question) => ["integer", "decimal", "fraction", "percent"].includes(question.answerFormat)), true);
});

test("never mutates original practice prompts, answers, or accepted answers", () => {
  const modules = loadExpandedModules();
  const before = structuredClone(modules);

  builder.buildChapter("chapter-01", modules);

  assert.deepEqual(modules, before);
});

test("rewrites former numeric-template prompts into distinct child-readable mission contexts", () => {
  const modules = loadExpandedModules();
  const chapter = builder.buildChapter("chapter-01", modules);
  const questions = chapter.levels.flatMap((level) => level.questions);
  const scanningQuestion = questions.find((question) => question.id === "patterns-3");
  const vehicleQuestion = questions.find((question) => question.id === "chicken-rabbit-1");
  assert.match(scanningQuestion.prompt, /探测器/);
  assert.match(vehicleQuestion.prompt, /两轮小车/);
  assert.equal(scanningQuestion.answer, "48");
  assert.equal(vehicleQuestion.answer, "2");
});

test("reports every missing level and difficulty slot instead of silently degrading", () => {
  const report = builder.validateChapter("chapter-01", [{ id: "patterns", practices: [] }]);

  assert.equal(report.valid, false);
  assert.match(report.errors.join("\n"), /quick-calculation/);
  assert.match(report.errors.join("\n"), /第 1 题/);
});

test("reports every malformed supplemental-pack invariant", () => {
  const packs = createSupplementalPacks();
  packs.patterns = packs.patterns.slice(0, 3);
  packs.patterns[0] = {
    id: " ",
    title: " ",
    difficulty: "unsupported",
    prompt: "",
    answer: " ",
    explanation: ""
  };
  packs["quick-calculation"][0].id = "outside-quick-calculation";
  packs["arithmetic-series"][0].id = "outside-quick-calculation";

  const report = builder.validateSupplementalPacks("chapter-01", packs);
  const errors = report.errors.join("\n");

  assert.equal(report.valid, false);
  assert.match(errors, /patterns must contain exactly 4 supplemental questions; found 3/);
  assert.match(errors, /patterns\[0\]: missing id/);
  assert.match(errors, /patterns\[0\]: missing title/);
  assert.match(errors, /patterns\[0\]: invalid difficulty "unsupported"/);
  assert.match(errors, /patterns\[0\]: missing prompt/);
  assert.match(errors, /patterns\[0\]: missing answer/);
  assert.match(errors, /patterns\[0\]: missing explanation/);
  assert.match(errors, /quick-calculation\[0\]: id must start with "chapter-01-"/);
  assert.match(errors, /arithmetic-series\[0\]: duplicate supplemental id "outside-quick-calculation"/);
});
