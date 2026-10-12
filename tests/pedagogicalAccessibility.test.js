const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const HintScaffold = require("../game/hintScaffold.js");

function loadFrontEndModule(relPath, customGlobals = {}) {
  const filePath = path.join(__dirname, "..", relPath);
  const code = fs.readFileSync(filePath, "utf-8");
  const sandbox = {
    ...customGlobals,
    console,
    Set,
    Map,
    Array,
    Object,
    document: {
      createElement(tag) {
        return {
          tagName: tag.toUpperCase(),
          className: "",
          dataset: {},
          innerHTML: "",
          textContent: "",
          style: {},
          children: [],
          append(...items) { this.children.push(...items); },
          setAttribute() {},
          getAttribute() { return ""; }
        };
      },
      createElementNS(ns, tag) {
        const el = this.createElement(tag);
        el.namespace = ns;
        return el;
      }
    }
  };
  sandbox.globalThis = sandbox;
  const transformed = code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, "")
                          .replace(/export\s+(async\s+)?function\s+/g, "$1function ")
                          .replace(/export\s+const\s+/g, "const ")
                          .replace(/export\s+let\s+/g, "let ")
                          .replace(/export\s+default\s+([a-zA-Z0-9_$]+);?/g, "globalThis.$1 = $1;");
  vm.runInNewContext(transformed, sandbox);
  return sandbox;
}

const motionSandbox = loadFrontEndModule("game/knowledgeMotionExplainer.js", { HintScaffold });
const KnowledgeMotionExplainer = motionSandbox.KnowledgeMotionExplainer;

test("Pedagogical Accessibility & Anti-Anxiety System", async (t) => {
  await t.test("Concrete analogies exist for all core primary school Olympiad models", () => {
    const testQuestions = [
      { prompt: "鸡和兔一共有10只，一共有28只脚，问鸡和兔各有多少只？" },
      { prompt: "甲乙两数的和是40，差是10，求这两个数分别是多少？" },
      { prompt: "在一条长20米的小路一边植树，每隔5米栽一棵，两端都栽，一共栽多少棵？" },
      { prompt: "小朋友分糖果，如果每人分4块多5块，如果每人分5块少3块，有多少个小朋友？" },
      { prompt: "一列火车长200米，穿过一条长800米的大桥，速度是20米/秒，全车通过需要多少秒？" },
      { prompt: "一个人在静水中划船速度是10千米/时，水流速度是2千米/时，顺水航行3小时走了多少千米？" },
      { prompt: "甲乙两人分别从相距100米的两地相向而行，甲速度6米/秒，乙速度4米/秒，几秒后相遇？" },
      { prompt: "快车速度25米/秒，慢车速度15米/秒，同向行驶，快车在慢车后方50米，几秒后追上？" },
      { prompt: "一个数乘以3加上6，再除以2等于9，求这个数？" },
      { prompt: "今年爸爸36岁，儿子10岁，几年后爸爸的年龄是儿子的3倍？" },
      { prompt: "一个实心方阵最外层每边有8人，最外层一共有多少人？" },
      { prompt: "班里有30人喜欢语文，25人喜欢数学，15人两门都喜欢，一共有多少人？" },
      { prompt: "小明有3件上衣，4条裤子，一共有多少种不同的搭配穿法？" },
      { prompt: "按3比2的比例把50个苹果分给甲乙两人，甲分得多少个？" },
      { prompt: "在100克水中加入25克白糖，糖水的浓度是多少？" },
      { prompt: "从A点走到B点，只能向右或向上，一共有多少种最短走法？" },
      { prompt: "一条线段上有5个点，一共有多少条不同的线段？" },
      { prompt: "一个四位数能被9整除，各位数字之和是多少？" },
      { prompt: "平底锅每次只能烙2张饼，烙熟一面要3分钟，烙3张饼最少需要几分钟？" },
      { prompt: "小红、小明、小刚三人中有一人说了真话，请列表推理出是谁？" }
    ];

    for (const q of testQuestions) {
      const analogy = HintScaffold.getConcreteAnalogy(q);
      assert.ok(analogy, `Should find concrete analogy for: ${q.prompt}`);
      assert.ok(analogy.name, "Analogy must have a friendly name");
      assert.ok(analogy.analogy.length > 10, "Analogy must contain detailed accessible metaphor");
      assert.ok(analogy.sketch, "Analogy must include visualization sketch hint");
    }
  });

  await t.test("Tiered scaffolding provides 3 progressive, gentle steps without spoiling", () => {
    const question = {
      prompt: "笼子里有鸡和兔子共12只，一共有32只脚，问鸡和兔各有多少只？",
      answer: "鸡8只，兔4只"
    };

    const hints = HintScaffold.buildTieredHints(question);
    assert.equal(hints.length, 3, "Must have exactly 3 progressive tiers");

    // Tier 1: 读懂故事
    assert.match(hints[0].label, /第[1一][层阶]|读懂故事|圈已知/);
    assert.ok(hints[0].text.includes("已知") || hints[0].text.includes("故事") || hints[0].text.includes("情境"));

    // Tier 2: 妙招点拨 / 动手画 / 生活比喻
    assert.match(hints[1].label, /第[2二][层阶]|妙招点拨|动手画/);
    assert.ok(hints[1].text.includes("生活小比喻") || hints[1].text.includes("图") || hints[1].text.includes("吹哨抬脚"));

    // Tier 3: 算式慢动作
    assert.match(hints[2].label, /第[3三][层阶]|算式骨架|慢动作/);
    assert.ok(hints[2].text.includes("第1步") || hints[2].text.includes("第2步") || hints[2].text.includes("计算"));

    // Ensure none of the hints simply spoil the raw final answer directly
    for (const h of hints) {
      assert.doesNotMatch(h.text, /答案就是8和4/);
    }
  });

  await t.test("Diagnostics use warm growth-mindset language and eliminate punitive phrasing", () => {
    const qTrain = {
      prompt: "一列客车长150米，穿过长650米的隧道，速度是20米/秒，全车通过需要多少秒？",
      answer: "40"
    };

    // Student forgot train length: 650 / 20 = 32.5
    const diagTrain = HintScaffold.diagnoseMistake(qTrain, "32.5");
    assert.ok(diagTrain, "Should generate diagnostic");
    assert.ok(diagTrain.includes("🌱") || diagTrain.includes("💡"), "Should have warm visual emoji badge");
    assert.ok(!diagTrain.includes("致命"), "Should not use alarming '致命' keyword");
    assert.ok(!diagTrain.includes("惩罚"), "Should not mention punishment");
    assert.ok(!diagTrain.includes("扣分"), "Should not mention score deduction");
    assert.ok(diagTrain.includes("触碰列车行程雷区"), "Preserves test-required classification token gently");
    assert.ok(diagTrain.includes("桥长/隧道长 ＋ 列车车长"), "Preserves formula anchor");

    // Average speed trap
    const qAvg = {
      prompt: "汽车去时速度40千米/时，返回时速度60千米/时，求往返的平均速度是多少？",
      answer: "48"
    };
    const diagAvg = HintScaffold.diagnoseMistake(qAvg, "50");
    assert.ok(diagAvg.includes("探索精神可嘉"), "Acknowledges student's positive attempt");
    assert.ok(diagAvg.includes("平均速度绝不是两个速度相加除以 2"), "Clears misconception clearly");
    assert.ok(!diagAvg.includes("致命雷区"), "Replaced with gentle pitfall term");

    // Square array 4 corners trap
    const qSquare = {
      prompt: "一个实心方阵最外层每边有8人，最外层一共有多少人？",
      answer: "28"
    };
    const diagSquare = HintScaffold.diagnoseMistake(qSquare, "32");
    assert.ok(diagSquare.includes("角上的4个小朋友被重复数了两次"), "Explains 4 corners double counted");
    assert.ok(diagSquare.includes("每边人数 × 4 － 4"), "Guides formula with minus 4");

    // Venn overlap trap
    const qVenn = {
      prompt: "班里有30人喜欢语文，25人喜欢数学，15人两门都喜欢，一共有多少人？",
      answer: "40"
    };
    const diagVenn = HintScaffold.diagnoseMistake(qVenn, "55");
    assert.ok(diagVenn.includes("重叠部分"), "Diagnoses double counting overlap");

    // Concentration trap
    const qConc = {
      prompt: "在100克水中加入25克糖，求糖水浓度",
      answer: "20%"
    };
    const diagConc = HintScaffold.diagnoseMistake(qConc, "25%");
    assert.ok(diagConc.includes("糖水总重"), "Explains solute + solvent in denominator");

    // Geometry counting trap
    const qGeom = {
      prompt: "一条线段上有5个端点，一共有多少条不同的线段？",
      answer: "10"
    };
    const diagGeom = HintScaffold.diagnoseMistake(qGeom, "20");
    assert.ok(diagGeom.includes("除以 2"), "Reminds child that A到B和B到A是同一条线段");
  });

  await t.test("Active thinking scaffold renders anti-anxiety comfort banner and 3 tiered cards", () => {
    const prevDoc = globalThis.document;
    function createMockEl(tagName) {
      const el = {
        tagName: tagName.toUpperCase(),
        className: "",
        dataset: {},
        innerHTML: "",
        textContent: "",
        children: [],
        style: {},
        append(...items) {
          el.children.push(...items);
        }
      };
      return el;
    }
    globalThis.document = { createElement: createMockEl };

    try {
      const question = {
        prompt: "小明和小红相距200米，同时相对跑出，小明速度6米/秒，小红速度4米/秒，几秒相遇？",
        answer: "20"
      };

      const container = HintScaffold.renderActiveThinkingScaffold(question);
      assert.ok(container, "Scaffold container should be rendered");
      const summary = container.children[0];
      assert.ok(summary.innerHTML.includes("防畏难小贴士"), "Must contain anti-anxiety encouragement in summary");
      assert.ok(summary.innerHTML.includes("小游戏") || summary.innerHTML.includes("搭积木"));
      const content = container.children[1];
      assert.equal(content.children.length, 3, "Content must have 3 progressive cards");
    } finally {
      globalThis.document = prevDoc;
    }
  });

  await t.test("KnowledgeMotionExplainer supports dynamic visual motion animations for core Olympiad models", () => {
    const prevDoc = globalThis.document;
    function createMockEl(tagName) {
      const el = {
        tagName: tagName.toUpperCase(),
        className: "",
        dataset: {},
        innerHTML: "",
        textContent: "",
        children: [],
        style: {},
        append(...items) {
          el.children.push(...items);
        }
      };
      return el;
    }
    globalThis.document = { createElement: createMockEl };

    try {
      const modelsToTest = [
        { prompt: "方阵最外层每边8人", expected: "square-array" },
        { prompt: "糖水浓度是百分之几", expected: "concentration" },
        { prompt: "按照3比2分配苹果", expected: "ratio-proportion" },
        { prompt: "在线段上数一共有多少条线段", expected: "geometry-counting" },
        { prompt: "标数法求最短路线走法", expected: "shortest-path" },
        { prompt: "平底锅烙饼统筹最少用几分钟", expected: "scheduling" }
      ];

      for (const item of modelsToTest) {
        const matched = KnowledgeMotionExplainer.matchMotionModel(item.prompt);
        assert.equal(matched.id, item.expected, `Should match model ${item.expected} for "${item.prompt}"`);

        const card = KnowledgeMotionExplainer.renderMotionCard({ prompt: item.prompt });
        assert.ok(card, `Should render motion card for ${item.expected}`);
        assert.ok(card.className.includes("knowledge-motion-card"), "Card has correct CSS class");
        assert.equal(card.dataset.motionModelId, item.expected, "Card dataset marks motionModelId");
        assert.ok(card.children.length >= 2, "Card has header and board children");
        const svgEl = card.children[1].children[0];
        assert.equal(svgEl.tagName, "SVG", "Board contains SVG canvas");
        assert.ok(svgEl.innerHTML.length > 20, "SVG contains dynamic graphical elements");
      }
    } finally {
      globalThis.document = prevDoc;
    }
  });

  await t.test("KnowledgeMotionExplainer.renderMinimalTacticalCard embeds child-friendly concrete analogy capsule", () => {
    const prevDoc = globalThis.document;
    function createMockEl(tagName) {
      const el = {
        tagName: tagName.toUpperCase(),
        className: "",
        dataset: {},
        innerHTML: "",
        textContent: "",
        children: [],
        style: {},
        append(...items) {
          el.children.push(...items);
        }
      };
      return el;
    }
    globalThis.document = { createElement: createMockEl };

    try {
      const question = {
        prompt: "笼子里有鸡和兔子共10只，一共有28只脚，问鸡和兔各有多少只？",
        answer: "鸡6只，兔4只",
        cognitiveBadge: "🎯 母题定模",
        cognitiveGoal: "基准识别与公式锚定"
      };
      const review = {
        method: "chicken-rabbit",
        observation: "圈出10只头，28只脚",
        calculation: "假定全为鸡：10×2=20只脚，多出8只脚除以2=4只兔",
        verification: "6×2 + 4×4 = 28只脚",
        pitfall: "注意计算出的是兔子还是鸡"
      };

      const board = KnowledgeMotionExplainer.renderMinimalTacticalCard(review, question);
      assert.ok(board, "Board must render");
      const analogyCard = board.children.find((c) => c.className === "tactical-analogy-capsule");
      assert.ok(analogyCard, "Board must contain tactical-analogy-capsule");
      assert.ok(analogyCard.innerHTML.includes("吹哨抬脚法"), "Must contain concrete analogy name");
      assert.ok(analogyCard.innerHTML.includes("动笔画画看"), "Must contain sketch guidance");
    } finally {
      globalThis.document = prevDoc;
    }
  });
});
