const test = require("node:test");
const assert = require("node:assert/strict");
const HintScaffold = require("../game/hintScaffold.js");

test("HintScaffold generates three progressive tiers for Gold questions", () => {
  const q = {
    prompt: "方格图中从第3列第2行走到第8列第6行，只能向右或向上走。最短走多少格？",
    commonPitfall: "不能把列数和行数直接相减后只算一次。",
    solution: {
      strategy: "横竖距离相加",
      summary: "横着走5格，竖着走4格，共9格。",
      steps: [
        { name: "横向距离", explanation: "第8列比第3列多5列，向右走5格。" },
        { name: "竖向距离", explanation: "第6行比第2行多4行，向上走4格。" }
      ]
    }
  };

  const hints = HintScaffold.buildTieredHints(q);
  assert.equal(hints.length, 3);
  assert.equal(hints[0].tier, 1);
  assert.ok(hints[0].text.includes("不能把列数和行数直接相减"));
  assert.equal(hints[1].tier, 2);
  assert.ok(hints[1].text.includes("横竖距离相加"));
  assert.equal(hints[2].tier, 3);
  assert.ok(hints[2].text.includes("横向距离"));
});

test("HintScaffold provides fallback guidance for legacy questions gracefully", () => {
  const legacyQ = {
    prompt: "一个笼子里有鸡和兔共10只，共有28条腿。兔子有几只？"
  };
  const hints = HintScaffold.buildTieredHints(legacyQ);
  assert.equal(hints.length, 3);
  assert.ok(hints[0].text.length > 5);
  assert.ok(hints[1].text.length > 5);
  assert.ok(hints[2].text.length > 5);
});
