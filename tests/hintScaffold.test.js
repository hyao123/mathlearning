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

test("HintScaffold.diagnoseMistake identifies interval/planting tree off-by-one error", () => {
  const treeQ = {
    prompt: "一条长50米的小路一侧植树，每隔5米植一棵，两端都植。一共植树多少棵？",
    answer: "11"
  };
  const diagMinus1 = HintScaffold.diagnoseMistake(treeQ, "10");
  assert.ok(diagMinus1.includes("比正确答案少了 1"));
  assert.ok(diagMinus1.includes("两端都植树"));

  const diagPlus1 = HintScaffold.diagnoseMistake(treeQ, "12");
  assert.ok(diagPlus1.includes("比正确答案多了 1"));
});

test("HintScaffold.diagnoseMistake identifies chicken-rabbit head swap error", () => {
  const crQ = {
    prompt: "笼子里有鸡和兔共 10 只，共有 28 条腿。兔子有几只？",
    answer: "4" // 兔子4只，鸡6只
  };
  const diag = HintScaffold.diagnoseMistake(crQ, "6"); // 学生算成了鸡的数量
  assert.ok(diag.includes("另一种对象"));
  assert.ok(diag.includes("10"));
});

test("HintScaffold.diagnoseMistake identifies scale and unit conversion errors", () => {
  const unitQ = {
    prompt: "操场一圈长 400 米，小明跑了 5 圈，共跑了多少米？",
    answer: "2000"
  };
  const diag10x = HintScaffold.diagnoseMistake(unitQ, "200");
  assert.ok(diag10x.includes("相差 10 倍"));

  const timeQ = {
    prompt: "汽车行驶了 180 分钟，相当于多少小时？",
    answer: "3"
  };
  const diag60x = HintScaffold.diagnoseMistake(timeQ, "180");
  assert.ok(diag60x.includes("相差 60 倍"));
});

