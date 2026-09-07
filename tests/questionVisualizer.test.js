const test = require("node:test");
const assert = require("node:assert/strict");

// Simple mock DOM environment for Node.js unit testing
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

const QuestionVisualizer = require("../game/questionVisualizer.js");

test("QuestionVisualizer renders Route Map for coordinate shortest-path questions", () => {
  const q = {
    prompt: "方格图中从第3列第2行走到第8列第6行，只能向右或向上走。最短走多少格？",
    representation: "route-map"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual, "Should render visual element");
  assert.equal(visual.dataset.visualType, "route-map");
  assert.ok(visual.classList.contains("question-visual--route-map"));
});

test("QuestionVisualizer renders Table for vehicle wheel comparisons", () => {
  const q = {
    prompt: "表格中两轮车每辆2个轮子，四轮车每辆4个轮子，共有12辆玩具车和32个轮子。四轮车有多少辆？",
    representation: "table"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "table");
});

test("QuestionVisualizer renders Bar Model for sum-difference questions", () => {
  const q = {
    prompt: "条形图表示大箱比小箱多3个，两种箱共17个；大箱每个装12瓶，小箱每个装8瓶。一共能装多少瓶？",
    representation: "bar-model"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "bar-model");
});

test("QuestionVisualizer renders Diagram for rectangle perimeter questions", () => {
  const q = {
    prompt: "长方形示意图长8格、宽5格，从一个角沿边走到对角。两条边路一样短，最少走多少格？",
    representation: "diagram"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "diagram");
});

test("QuestionVisualizer returns null for plain text without visual keywords", () => {
  const q = {
    prompt: "小明有5个苹果，小红有3个苹果，两人一共有几个苹果？",
    representation: "text"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.equal(visual, null);
});
