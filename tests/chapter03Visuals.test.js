const test = require("node:test");
const assert = require("node:assert/strict");

function createMockElement(tag) {
  const el = {
    tagName: tag.toUpperCase(),
    children: [],
    attributes: {},
    className: "",
    classList: {
      classes: [],
      add(cls) { el.classList.classes.push(cls); },
      contains(cls) {
        const names = (el.className || "").split(/\s+/).concat(el.classList.classes);
        return names.includes(cls);
      }
    },
    dataset: {},
    setAttribute(key, val) { el.attributes[key] = String(val); },
    getAttribute(key) { return el.attributes[key]; },
    append(...children) { el.children.push(...children); }
  };
  return el;
}

globalThis.document = {
  createElement: (tag) => createMockElement(tag),
  createElementNS: (ns, tag) => createMockElement(tag)
};

const GameChapterBuilder = require("../game/chapterBuilder.js");
const QuestionVisualizer = require("../game/questionVisualizer.js");
const AnswerMatcher = require("../answerMatcher.js");

test("Chapter 3 has 12 levels and 120 questions, all with dedicated visual representations", () => {
  const ch3 = GameChapterBuilder.buildChapter("chapter-03");
  assert.equal(ch3.levels.length, 12);
  let totalQuestions = 0;
  ch3.levels.forEach((lvl) => {
    assert.equal(lvl.questions.length, 10);
    lvl.questions.forEach((q) => {
      totalQuestions++;
      const visual = QuestionVisualizer.createQuestionVisual(q);
      assert.ok(visual, `Question ${q.id} must have a visual representation`);
      assert.ok(visual.dataset?.visualType || visual.className, `Question ${q.id} must have visualType`);
    });
  });
  assert.equal(totalQuestions, 120);
});

test("Chapter 3 plan-design renders Plan Design visual without misrouting to tiered pricing", () => {
  const ch3 = GameChapterBuilder.buildChapter("chapter-03");
  const planLevel = ch3.levels.find((lvl) => lvl.moduleId === "plan-design");
  assert.ok(planLevel);
  planLevel.questions.forEach((q) => {
    const visual = QuestionVisualizer.createQuestionVisual(q);
    assert.equal(visual.dataset.visualType, "plan-design");
  });
});

test("Chapter 3 case-analysis-intro renders Case Analysis visual without misrouting to logic grid", () => {
  const ch3 = GameChapterBuilder.buildChapter("chapter-03");
  const caseLevel = ch3.levels.find((lvl) => lvl.moduleId === "case-analysis-intro");
  assert.ok(caseLevel);
  caseLevel.questions.forEach((q) => {
    const visual = QuestionVisualizer.createQuestionVisual(q);
    assert.equal(visual.dataset.visualType, "case-analysis");
  });
});

test("Chapter 3 ratio-proportion advance question does not misroute to solid3d volume", () => {
  const q = {
    id: "chapter-03-ratio-proportion-advance-1",
    moduleId: "ratio-proportion",
    prompt: "燃料和冷却液的比是 3∶2，燃料有 18 升，冷却液有多少升？【协作任务】",
    answer: "12"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.equal(visual.dataset.visualType, "bar-model");
});

test("Chapter 3 square-array advance question does not misroute to polygon visual", () => {
  const q = {
    id: "chapter-03-square-array-advance-1",
    moduleId: "square-array",
    prompt: "一块正方形太阳能阵列每边排 7 块电池，一共有多少块电池？【协作任务】",
    answer: "49"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.equal(visual.dataset.visualType, "square-array");
});

test("Chapter 3 factors-multiples questions are unambiguous, pedagogically sound and correct", () => {
  const ch3 = GameChapterBuilder.buildChapter("chapter-03");
  const fmLevel = ch3.levels.find((lvl) => lvl.moduleId === "factors-multiples");
  const q1 = fmLevel.questions.find((q) => q.id === "factors-multiples-1");
  const q2 = fmLevel.questions.find((q) => q.id === "factors-multiples-2");
  const q4 = fmLevel.questions.find((q) => q.id === "factors-multiples-4");

  assert.ok(q1.prompt.includes("12 一共有多少个不同的正因数"));
  assert.equal(q1.answer, "6");
  assert.ok(AnswerMatcher.isAnswerCorrect("6", q1.answer));

  assert.ok(q2.prompt.includes("3 是 14 的因数吗"));
  assert.equal(q2.answer, "0");
  assert.ok(AnswerMatcher.isAnswerCorrect("0", q2.answer));

  assert.ok(q4.prompt.includes("既是 6 的倍数又是 8 的倍数"));
  assert.equal(q4.answer, "48");
  assert.ok(AnswerMatcher.isAnswerCorrect("48", q4.answer));
});
