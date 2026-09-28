const test = require("node:test");
const assert = require("node:assert/strict");
const HintScaffold = require("../game/hintScaffold.js");

test("HintScaffold.diagnoseMistake identifies interval/planting tree off-by-one errors", () => {
  const treeQ = {
    prompt: "在一条长 100 米的小路一旁植树，每隔 5 米种一棵，两端都种。一共要种多少棵？",
    answer: "21"
  };
  const diagMinus1 = HintScaffold.diagnoseMistake(treeQ, "20");
  assert.ok(diagMinus1);
  assert.ok(diagMinus1.includes("比正确答案少了 1"));
  assert.ok(diagMinus1.includes("两端都植树"));

  const diagPlus1 = HintScaffold.diagnoseMistake(treeQ, "22");
  assert.ok(diagPlus1);
  assert.ok(diagPlus1.includes("比正确答案多了 1"));

  // Check that forbidden strings never appear in pedagogical diagnostic
  for (const forbidden of ["答案：", "解析：", "提示：", "错因", "学习支持"]) {
    assert.equal(diagMinus1.includes(forbidden), false, `forbidden ${forbidden} in diagMinus1`);
    assert.equal(diagPlus1.includes(forbidden), false, `forbidden ${forbidden} in diagPlus1`);
  }
});

test("HintScaffold.diagnoseMistake identifies chicken-rabbit head swap", () => {
  const crQ = {
    prompt: "鸡兔同笼，共有 12 只头，34 条腿。兔子有几只？",
    answer: "5" // 兔子5只，鸡7只
  };
  const diag = HintScaffold.diagnoseMistake(crQ, "7"); // 学生算出了鸡
  assert.ok(diag);
  assert.ok(diag.includes("另一种对象"));
  assert.ok(diag.includes("12"));
});

test("HintScaffold.diagnoseMistake identifies motion encounter and chase speed confusion", () => {
  const encounterQ = {
    prompt: "甲乙两人相距 600 米，相向而行，甲每分钟走 60 米，乙每分钟走 40 米。两人几分钟相遇？",
    answer: "6"
  };
  const diag = HintScaffold.diagnoseMistake(encounterQ, "30"); // 600 / (60 - 40) = 30
  assert.ok(diag);
  assert.ok(diag.includes("相向而行"));
  assert.ok(diag.includes("速度和"));

  const chaseQ = {
    prompt: "弟弟在前面走，哥哥在后面追及，同向而行，哥哥每分钟走 80 米，弟弟每分钟走 50 米。哥哥几分钟追上？",
    answer: "10"
  };
  const diagChase = HintScaffold.diagnoseMistake(chaseQ, "2");
  assert.ok(diagChase);
  assert.ok(diagChase.includes("同向追及"));
  assert.ok(diagChase.includes("速度差"));
});

test("HintScaffold.diagnoseMistake identifies unit scale conversions", () => {
  const q10 = { prompt: "一根木料长 5 米，合多少分米？", answer: "50" };
  assert.ok(HintScaffold.diagnoseMistake(q10, "5").includes("相差 10 倍"));

  const q60 = { prompt: "小华做作业用了 2 小时，相当于多少分钟？", answer: "120" };
  assert.ok(HintScaffold.diagnoseMistake(q60, "2").includes("相差 60 倍"));

  const q100 = { prompt: "一张正方形桌布边长 1 米，面积是多少平方分米？", answer: "100" };
  assert.ok(HintScaffold.diagnoseMistake(q100, "1").includes("相差 100 倍"));

  const q1000 = { prompt: "大桥全长 3 千米，合多少米？", answer: "3000" };
  assert.ok(HintScaffold.diagnoseMistake(q1000, "3").includes("相差 1000 倍"));
});

test("HintScaffold.diagnoseMistake falls back to common pitfall gracefully", () => {
  const pitfallQ = {
    prompt: "几何图形中有几个角？",
    answer: "10",
    commonPitfall: "注意组合角，由两个小角拼成的复合角别漏数。"
  };
  const diag = HintScaffold.diagnoseMistake(pitfallQ, "4");
  assert.ok(diag);
  assert.ok(diag.includes("组合角"));
});

test("HintScaffold.diagnoseMistake handles null or empty inputs safely", () => {
  assert.equal(HintScaffold.diagnoseMistake(null, "1"), null);
  assert.equal(HintScaffold.diagnoseMistake({}, ""), null);
  assert.equal(HintScaffold.diagnoseMistake({}, undefined), null);
});
