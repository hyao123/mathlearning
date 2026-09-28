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

test("QuestionVisualizer renders Sequence Track for pattern questions", () => {
  const q = {
    prompt: "观察数列：1, 4, 9, 16, 25, ( )，括号里应该填什么？",
    moduleId: "patterns"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "sequence");
  assert.ok(visual.classList.contains("question-visual--sequence"));
});

test("QuestionVisualizer renders Cycle Wheel for periodicity questions", () => {
  const q = {
    prompt: "图形按照🔴🟦🟡🔴🟦🟡……规律排列，第28个图形是什么？",
    moduleId: "periodicity"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "cycle");
  assert.ok(visual.classList.contains("question-visual--cycle"));
});

test("QuestionVisualizer renders Chicken Rabbit Pen for head and leg questions", () => {
  const q = {
    prompt: "鸡兔同笼，共有10个头，28只脚。笼中有几只兔子？",
    moduleId: "chicken-rabbit"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "chicken-rabbit");
  assert.ok(visual.classList.contains("question-visual--chicken-rabbit"));
});

test("QuestionVisualizer renders Surplus Deficit Balance for allocation questions", () => {
  const q = {
    prompt: "分苹果，每人分4个多8个，每人分6个少2个。一共有几个小朋友？",
    moduleId: "surplus-deficit"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "surplus-deficit");
  assert.ok(visual.classList.contains("question-visual--surplus-deficit"));
});

test("QuestionVisualizer renders Quick Calc Bridge for regrouping addition questions", () => {
  const q = {
    prompt: "简便计算：387 + 499 + 613 + 501 = ?",
    moduleId: "quick-calculation"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "quick-calc");
  assert.ok(visual.classList.contains("question-visual--quick-calc"));
});

test("QuestionVisualizer renders Venn Diagram for inclusion-exclusion questions", () => {
  // 1. Neither mode (求补集)
  const qNeither = {
    prompt: "全班 35 人，参加足球的有 18 人，参加篮球的有 15 人，两项都参加的有 5 人。两项都不参加的有多少人？",
    moduleId: "inclusion-exclusion",
    answer: "7"
  };
  const visualNeither = QuestionVisualizer.createQuestionVisual(qNeither);
  function getMockText(el) {
    if (!el) return "";
    let text = el.textContent || el.innerHTML || "";
    if (Array.isArray(el.children)) {
      text += " " + el.children.map(getMockText).join(" ");
    }
    return text;
  }

  assert.ok(visualNeither);
  assert.equal(visualNeither.dataset.visualType, "venn");
  assert.ok(visualNeither.classList.contains("question-visual--venn"));
  const neitherText = getMockText(visualNeither);
  assert.ok(neitherText.includes("全集补集模型"));
  assert.ok(neitherText.includes("都不选 = 35 - 28 = 7"));

  // 2. Overlap mode (反求重叠)
  const qOverlap = {
    prompt: "喜欢数学的有 16 人，喜欢科学的有 14 人，至少喜欢一项的有 24 人，两项都喜欢的有多少人？",
    moduleId: "inclusion-exclusion",
    answer: "6"
  };
  const visualOverlap = QuestionVisualizer.createQuestionVisual(qOverlap);
  assert.ok(visualOverlap);
  const overlapText = getMockText(visualOverlap);
  assert.ok(overlapText.includes("反求重叠模型"));
  assert.ok(overlapText.includes("两项都选 = A (16) + B (14) - 至少选一项 (24) = 6"));

  // 3. Only-one mode (只选一项)
  const qOnlyOne = {
    prompt: "会弹琴的有 15 人，会画画的有 13 人，两项都会的有 4 人。只会其中一项的有多少人？",
    moduleId: "inclusion-exclusion",
    answer: "20"
  };
  const visualOnlyOne = QuestionVisualizer.createQuestionVisual(qOnlyOne);
  assert.ok(visualOnlyOne);
  const onlyOneText = getMockText(visualOnlyOne);
  assert.ok(onlyOneText.includes("对称差模型"));
  assert.ok(onlyOneText.includes("只会一项 = (15 - 4) + (13 - 4) = 11 + 9 = 20"));

  // 4. Union mode (求并集)
  const qUnion = {
    prompt: "有 12 人喜欢画画，10 人喜欢唱歌，其中 4 人两项都喜欢。至少喜欢一项的有多少人？",
    moduleId: "inclusion-exclusion",
    answer: "18"
  };
  const visualUnion = QuestionVisualizer.createQuestionVisual(qUnion);
  assert.ok(visualUnion);
  const unionText = getMockText(visualUnion);
  assert.ok(unionText.includes("并集去重模型"));
  assert.ok(unionText.includes("至少选一项 = A (12) + B (10) - 重叠 (4) = 18"));
});

test("QuestionVisualizer renders Tree Planting Road for interval questions", () => {
  const q = {
    prompt: "在一条20米长的小路两旁种树，每隔4米种一棵，两端都种。一共要种多少棵树？",
    moduleId: "tree-planting"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "tree-planting");
  assert.ok(visual.classList.contains("question-visual--tree-planting"));
});

test("QuestionVisualizer renders Train Bridge Track for motion questions", () => {
  const q = {
    prompt: "一列长200米的火车穿过一座长800米的大桥，速度为20米/秒。从车头上桥到车尾离桥需要多少秒？",
    moduleId: "train-bridge"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "train-bridge");
  assert.ok(visual.classList.contains("question-visual--train-bridge"));
});

test("QuestionVisualizer renders Average Leveling for mean value questions", () => {
  const q = {
    prompt: "小华四次测验成绩分别为88分、92分、95分、97分，平均分是多少？",
    moduleId: "average"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "average");
  assert.ok(visual.classList.contains("question-visual--average"));
});

test("QuestionVisualizer renders Unit Rate Scale for proportion questions", () => {
  const q = {
    prompt: "4本笔记本售价24元，照这样计算，买7本笔记本需要多少元？",
    moduleId: "unit-rate"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "unit-rate");
  assert.ok(visual.classList.contains("question-visual--unit-rate"));
});

test("QuestionVisualizer renders Enumeration Tree for combination questions", () => {
  const q = {
    prompt: "从3件上衣和4条裤子中各选一件搭配，一共有多少种不同的搭配方法？",
    moduleId: "enumeration"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "tree");
  assert.ok(visual.classList.contains("question-visual--tree"));
});

test("QuestionVisualizer extracts sequence starting from 3 for scanning range question without capturing multiplier prefix", () => {
  const q = {
    prompt: "探测器的扫描范围每轮都扩大为原来的 2 倍：3、6、12、24。下一轮是多少？【侦察任务】",
    moduleId: "patterns"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "sequence");

  // Verify elements in SVG
  const svg = visual.children.find((c) => c.tagName === "SVG");
  assert.ok(svg, "Should contain svg element");
  const texts = svg.children.filter((c) => c.tagName === "TEXT");
  const textContents = texts.map((t) => t.textContent);

  // The first term MUST be "3", not "2"
  const itemTexts = textContents.filter((t) => ["3", "6", "12", "24", "❓"].includes(t));
  assert.deepEqual(itemTexts, ["3", "6", "12", "24", "❓"]);
  assert.equal(textContents.includes("2"), false, "Should not include '2' as first term of sequence");

  // Arcs should reflect geometric ×2 progression
  assert.ok(textContents.includes("×2"), "Should show ×2 multiplier on jump arcs");
});

test("QuestionVisualizer renders Pigeonhole Drawers for drawer extraction and worst-case questions", () => {
  const q = {
    id: "chapter-02-pigeonhole-principle-advance-1",
    moduleId: "pigeonhole-principle",
    prompt: "潮汐卡盒中有红、蓝、绿三种颜色的潮汐卡各 5 张。至少抽出几张，才能保证有 3 张卡是同一种颜色？"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "pigeonhole");
  assert.ok(visual.classList.contains("question-visual--pigeonhole"));
});

test("QuestionVisualizer renders Train Bridge Track with chase gap for rear-distance questions", () => {
  const q = {
    id: "chapter-02-train-bridge-challenge-1",
    moduleId: "train-bridge",
    prompt: "一列长 100 米的列车以 25 米/秒追赶前方以 15 米/秒行驶的补给车。初始时列车车尾与前方补给车车尾相距 200 米（即列车车头距离前方补给车车尾 100 米），列车车头追上补给车车尾需要多少秒？"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "train-bridge");
  const legend = visual.children.find(c => c.className === "question-visual__legend");
  assert.ok(legend && legend.textContent.includes("追及"));
});

test("QuestionVisualizer renders Motion Track for encounter and chase questions", () => {
  const q = {
    id: "motion-1",
    moduleId: "motion",
    prompt: "甲、乙两艘探测艇相距 720 米相向而行，甲速 50 米/分，乙速 40 米/分。几分钟后相遇？"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "motion");
  assert.ok(visual.classList.contains("question-visual--motion"));
});

test("QuestionVisualizer renders Geometry Counting for line segments and squares", () => {
  const q = {
    id: "geometry-1",
    moduleId: "geometry-counting",
    prompt: "一条直线上有 5 个点，可以组成多少条线段？"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "geometry-counting");
  assert.ok(visual.classList.contains("question-visual--geometry-counting"));
});

test("QuestionVisualizer renders Logic Grid for deduction matrix", () => {
  const q = {
    id: "logic-1",
    moduleId: "logic",
    prompt: "深海补给站有 3 个编号为 1、2、3 的停泊位，甲、乙、丙三艘潜艇分别停入不同泊位。甲说：“我不在 1 号泊位”，乙说：“我不在 1 号也不在 2 号泊位”。丙停在几号泊位？"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "logic");
  assert.ok(visual.classList.contains("question-visual--logic"));
});

test("QuestionVisualizer renders Age Difference Bar for constant gap model", () => {
  const q = {
    id: "age-1",
    moduleId: "age",
    prompt: "母女现在的年龄和是 48 岁，母亲比女儿大 24 岁。女儿今年多少岁？"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "age");
  assert.ok(visual.classList.contains("question-visual--age"));
});

test("QuestionVisualizer renders Engineering Progress for work efficiency model", () => {
  const q = {
    id: "engineering-1",
    moduleId: "engineering",
    prompt: "一项工程甲单独做要 12 天完成，乙单独做要 24 天完成。两人合作几天能完成这项工程？"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "engineering");
  assert.ok(visual.classList.contains("question-visual--engineering"));
});

test("QuestionVisualizer renders Parity Divisibility Card for odd-even and multiples", () => {
  const q = {
    id: "parity-divisibility-1",
    moduleId: "parity-divisibility",
    prompt: "把“能被整除”编号为 1，把“不能被整除”编号为 0。528 能被 3 整除吗？"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "parity");
  assert.ok(visual.classList.contains("question-visual--parity"));
});

test("QuestionVisualizer renders Angle Visual for angle calculation", () => {
  const q = {
    id: "chapter-04-angles-1",
    moduleId: "angles",
    prompt: "极地破冰船任务·已知一个角是 35 度，它的余角是多少度？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "angle");
  assert.ok(visual.classList.contains("question-visual--angle"));
});

test("QuestionVisualizer renders Polygon Visual for perimeter and area questions", () => {
  const q = {
    id: "chapter-04-triangles-1",
    moduleId: "triangles",
    prompt: "极地破冰船任务·三角形底边长 8 厘米，高 5 厘米；面积是多少平方厘米？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "polygon");
  assert.ok(visual.classList.contains("question-visual--polygon"));
});

test("QuestionVisualizer renders Solid 3D Visual for volume and surface area", () => {
  const q = {
    id: "chapter-04-volume-1",
    moduleId: "volume",
    prompt: "极地破冰船任务·长方体长 6 厘米、宽 4 厘米、高 5 厘米；它的体积是多少立方厘米？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "solid3d");
  assert.ok(visual.classList.contains("question-visual--solid3d"));
});

test("QuestionVisualizer renders Bar Chart for frequency and statistics", () => {
  const q = {
    id: "chapter-06-bar-charts-1",
    moduleId: "bar-charts",
    prompt: "量子实验·条形统计图中甲组 12 次、乙组 18 次；两组一共有多少次？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "barchart");
  assert.ok(visual.classList.contains("question-visual--barchart"));
});

test("QuestionVisualizer renders Line Chart for trend data", () => {
  const q = {
    id: "chapter-06-line-charts-1",
    moduleId: "line-charts",
    prompt: "量子实验·折线统计图记录 5 天气温，前 3 天分别是 10℃、12℃、14℃；这 3 天平均气温是多少？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "linechart");
  assert.ok(visual.classList.contains("question-visual--linechart"));
});

test("QuestionVisualizer renders Probability Spinner for chance questions", () => {
  const q = {
    id: "chapter-06-possibility-1",
    moduleId: "possibility-basics",
    prompt: "量子实验·一个转盘分为红蓝两区域，指针停在红色区域的可能性是 1/2。转动 4 次，停在红色的预期次数？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "spinner");
  assert.ok(visual.classList.contains("question-visual--spinner"));
});

test("QuestionVisualizer renders Balance Model for algebraic equations", () => {
  const q = {
    id: "chapter-05-linear-equations-1",
    moduleId: "linear-equations",
    prompt: "特种战车任务·天平左边放 2 个未知数 x 和 5 克砝码，右边放 15 克砝码刚好平衡。未知数 x 是多少？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "balance");
  assert.ok(visual.classList.contains("question-visual--balance"));
});

test("QuestionVisualizer renders Fraction & Percent Model", () => {
  const q = {
    id: "chapter-05-percent-basics-1",
    moduleId: "percent-basics",
    prompt: "特种战车任务·装甲钢板打八折后售价 80 万元，原价是多少万元？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "fraction");
  assert.ok(visual.classList.contains("question-visual--fraction"));
});

test("QuestionVisualizer renders Concentration Visual for solution mixing", () => {
  const q = {
    id: "chapter-05-concentration-1",
    moduleId: "concentration-configuration",
    prompt: "特种战车任务·现有 100 克含盐量 10% 的盐水，加入 10 克盐后，溶液总质量是多少克？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "concentration");
  assert.ok(visual.classList.contains("question-visual--concentration"));
});

test("QuestionVisualizer renders Tiered Pricing Visual for tiered billing", () => {
  const q = {
    id: "chapter-03-tiered-pricing-1",
    moduleId: "tiered-pricing",
    prompt: "空间站补给·货运阶梯计费：前 3 公里起步价 10 元，超出后每公里 2 元。运送 8 公里需要多少元？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "tiered-pricing");
  assert.ok(visual.classList.contains("question-visual--tiered-pricing"));
});

test("QuestionVisualizer renders Square Array Visual for hollow/solid arrays", () => {
  const q = {
    id: "chapter-03-square-array-1",
    moduleId: "square-array",
    prompt: "空间站补给·探测仪排成一个实心方阵，最外层每边有 5 个探测仪。这个方阵一共有多少个探测仪？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "square-array");
  assert.ok(visual.classList.contains("question-visual--square-array"));
});

test("QuestionVisualizer renders Factor Tree Visual for prime factors", () => {
  const q = {
    id: "chapter-03-factors-1",
    moduleId: "factors-multiples",
    prompt: "空间站补给·求 24 和 36 的最大公因数是多少？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "factor-tree");
  assert.ok(visual.classList.contains("question-visual--factor-tree"));
});

test("QuestionVisualizer renders Reverse Flow Visual for restoration problems", () => {
  const q = {
    id: "chapter-07-reverse-1",
    moduleId: "reverse-thinking",
    prompt: "火星探测任务·一个数加上 5，再乘 2，得到 24。倒推回去，原数是多少？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "reverse-flow");
  assert.ok(visual.classList.contains("question-visual--reverse-flow"));
});

test("QuestionVisualizer renders Gantt Chart Visual for scheduling problems", () => {
  const q = {
    id: "chapter-09-scheduling-1",
    moduleId: "scheduling",
    prompt: "智慧城市任务·统筹烧水泡茶：烧水 8 分钟，洗茶杯 2 分钟，拿茶叶 1 分钟。合理安排最短几分钟可以喝上茶？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  assert.equal(visual.dataset.visualType, "gantt");
  assert.ok(visual.classList.contains("question-visual--gantt"));
});

test("QuestionVisualizer renders Chicken Rabbit Pen with interactive manipulative controls", () => {
  const q = {
    prompt: "鸡兔同笼，共有10个头，28只脚。笼中有几只兔子？",
    moduleId: "chicken-rabbit"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  const controls = visual.children.find((c) => c.dataset?.manipulative === "chicken-rabbit");
  assert.ok(controls, "Should render chicken-rabbit manipulative controls container");
  const buttons = controls.children.find((c) => c.className === "question-visual__control-row");
  assert.ok(buttons && buttons.children.length >= 4, "Should provide 4 substitution quick-action buttons");
  const sliderRow = controls.children.find((c) => c.className === "question-visual__slider-row");
  assert.ok(sliderRow, "Should provide substitution slider row");
  const metrics = controls.children.find((c) => c.className === "question-visual__metrics");
  assert.ok(metrics && metrics.children.length === 3, "Should provide 3 real-time metrics");
  const status = controls.children.find((c) => c.className && c.className.includes("question-visual__status"));
  assert.ok(status, "Should provide dynamic balance status feedback");
});

test("QuestionVisualizer renders Motion Track with interactive simulation controls", () => {
  const q = {
    id: "motion-encounter-test",
    moduleId: "motion",
    prompt: "甲、乙两艘探测艇相距 720 米相向而行，甲速 50 米/分，乙速 40 米/分。几分钟后相遇？"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  const controls = visual.children.find((c) => c.dataset?.manipulative === "motion-encounter");
  assert.ok(controls, "Should render motion-encounter simulation controls container");
  const btnRow = controls.children.find((c) => c.className === "question-visual__control-row");
  assert.ok(btnRow, "Should contain simulation control buttons");
  const sliderRow = controls.children.find((c) => c.className === "question-visual__slider-row");
  assert.ok(sliderRow, "Should contain interactive motion timeline slider");
});

test("QuestionVisualizer renders Balance Model with interactive lever manipulative controls", () => {
  const q = {
    id: "balance-test",
    moduleId: "linear-equations",
    prompt: "特种战车任务·天平左边放 2 个未知数 x 和 5 克砝码，右边放 15 克砝码刚好平衡。未知数 x 是多少？【启航任务】"
  };
  const visual = QuestionVisualizer.createQuestionVisual(q);
  assert.ok(visual);
  const controls = visual.children.find((c) => c.dataset?.manipulative === "equation-balance");
  assert.ok(controls, "Should render equation-balance manipulative controls container");
  const sliderRow = controls.children.find((c) => c.className === "question-visual__slider-row");
  assert.ok(sliderRow, "Should contain interactive variable x slider");
});

test("QuestionVisualizer applies active vs retry anti-leak state correctly", () => {
  function getMockText(el) {
    if (!el) return "";
    let text = el.textContent || el.innerHTML || "";
    if (Array.isArray(el.children)) {
      text += " " + el.children.map(getMockText).join(" ");
    }
    return text;
  }

  const qMotion = {
    id: "motion-test",
    moduleId: "motion",
    prompt: "甲、乙两艘探测艇相距 720 米相向而行，甲速 50 米/分，乙速 40 米/分。几分钟后相遇？"
  };

  // 1. In active status: does not leak answer
  const visualActive = QuestionVisualizer.createQuestionVisual(qMotion, { status: "active" });
  assert.ok(visualActive.classList.contains("is-active"));
  assert.ok(!visualActive.classList.contains("is-retry"));
  const textActive = getMockText(visualActive);
  assert.ok(textActive.includes("相遇点 (? 分)"), "Active status should not show calculated encounter time");

  // 2. In retry status: reveals calculation
  const visualRetry = QuestionVisualizer.createQuestionVisual(qMotion, { status: "retry" });
  assert.ok(visualRetry.classList.contains("is-retry"));
  const textRetry = getMockText(visualRetry);
  assert.ok(textRetry.includes("相遇点 (8分)"), "Retry status should reveal encounter time");

  // 3. Chicken Rabbit active status: hides cheat buttons and answers
  const qCR = {
    id: "cr-test",
    moduleId: "chicken-rabbit",
    prompt: "鸡兔同笼，共有头 10 个，脚 28 只。兔子有多少只？"
  };
  const visualCR = QuestionVisualizer.createQuestionVisual(qCR, { status: "active" });
  assert.ok(visualCR.classList.contains("is-active"));
  const crButtons = visualCR.children.find((c) => c.dataset?.manipulative === "chicken-rabbit")
    .children.find((c) => c.className === "question-visual__control-row");
  const solveBtns = crButtons.children.filter((btn) => btn.attributes?.["data-solve-btn"] === "true");
  assert.ok(solveBtns.length >= 2, "All-A and All-B buttons should have data-solve-btn tag");

  // 4. Surplus deficit active status: no final answer
  const qSD = {
    id: "sd-test",
    moduleId: "surplus-deficit",
    prompt: "每人分 4 个剩 8 个，每人分 6 个少 2 个。共有多少人？"
  };
  const visualSD = QuestionVisualizer.createQuestionVisual(qSD, { status: "active" });
  const textSD = getMockText(visualSD);
  assert.ok(textSD.includes("人数 ?"), "Active status should not reveal calculated headcount");

  // 5. Square Array active status: no final outer count
  const qArray = {
    id: "sq-test",
    moduleId: "square-array",
    prompt: "正方形方阵每边 6 人，最外层一共多少人？"
  };
  const visualArray = QuestionVisualizer.createQuestionVisual(qArray, { status: "active" });
  const textArray = getMockText(visualArray);
  assert.ok(textArray.includes("最外层总人数: 6 × 4 - 4 = ? 人"), "Active status should not reveal square array answer");
});

test("QuestionVisualizer routing fixes: avoids misrouting chicken-rabbit, average, square-array", () => {
  function getMockText(el) {
    if (!el) return "";
    let text = el.textContent || el.innerHTML || "";
    if (Array.isArray(el.children)) {
      text += " " + el.children.map(getMockText).join(" ");
    }
    return text;
  }

  // chicken-rabbit-9 with wheels should route to chicken-rabbit, not train-bridge
  const qCR = {
    id: "chicken-rabbit-9",
    prompt: "工程车库有两轮巡检车和四轮救援车共 12 辆，总轮数 32 个。四轮救援车有多少辆？",
    moduleId: "chicken-rabbit"
  };
  const vCR = QuestionVisualizer.createQuestionVisual(qCR);
  assert.equal(vCR.dataset.visualType, "chicken-rabbit", "Should route to chicken-rabbit");

  // average-6 with '天平均' should route to average, not balance
  const qAvg = {
    id: "average-6",
    prompt: "前2天平均每天采集 30 份样本，后3天共采集 115 份，这5天平均每天采集多少份？",
    moduleId: "average"
  };
  const vAvg = QuestionVisualizer.createQuestionVisual(qAvg);
  assert.equal(vAvg.dataset.visualType, "average", "Should route to average, not balance");

  // chapter-02-tree-planting-advance-1 square patrol points should route to square-array
  const qAdvance = {
    id: "chapter-02-tree-planting-advance-1",
    prompt: "正方形巡航线每边放 6 个定位点，四个顶点都只算一次，一共多少个定位点？",
    moduleId: "tree-planting"
  };
  const vAdvance = QuestionVisualizer.createQuestionVisual(qAdvance);
  assert.equal(vAdvance.dataset.visualType, "square-array", "Should route to square-array");

  // Circular pond floats should route to tree-planting with closed loop
  const qClosed = {
    id: "chapter-02-tree-planting-improve-2",
    prompt: "圆形水池边放 12 个浮标，相邻浮标间隔相同，共有多少段间隔？",
    moduleId: "tree-planting"
  };
  const vClosed = QuestionVisualizer.createQuestionVisual(qClosed);
  assert.equal(vClosed.dataset.visualType, "tree-planting", "Should route to tree-planting");
  const closedText = getMockText(vClosed);
  assert.ok(closedText.includes("封闭环形"), "Should render closed loop tree planting model");
});






