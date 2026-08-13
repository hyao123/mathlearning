"use strict";

function deepFreeze(value, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

const REVIEW = deepFreeze({ reviewer: "课程审阅员", reviewedAt: "2026-08-13T00:00:00.000Z", evidence: "已独立复算题目中的数量关系。" });
const s = (id, operation, operands, result, explanation) => ({ id, kind: "calculate", operation, operands, result, explanation });
const q = (fields) => deepFreeze({
  schemaVersion: 3, topicId: "chicken-rabbit", answerType: "numeric", answerFormat: "integer", answerPolicy: { kind: "integer" },
  primaryConcept: "chicken-rabbit", readingProfile: { unfamiliarTerms: [] }, reviewMetadata: REVIEW, ...fields
});

const CHICKEN_RABBIT_GOLD_QUESTIONS = deepFreeze([
  q({
    id: "chicken-rabbit-1", level: 1, slot: 1, title: "自行车和三轮车", difficulty: "basic", answer: "5",
    prompt: "停车场里共有8辆自行车和三轮车，共有21个轮子。三轮车有多少辆？",
    conditionRoles: ["vehicle-total", "wheel-total"], structureFamily: "uniform-difference", representation: "text", questionDirection: "forward", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["assume-all-bikes"],
    solution: { strategy: "assume-all-bikes", summary: "先把8辆都看成自行车：21－16＝5。", steps: [s("全是自行车", "multiply", [8, 2], 16, "先把每辆车都看成有2个轮子的自行车。"), s("答案", "subtract", [21, "$全是自行车"], 5, "多出的5个轮子各对应1辆三轮车。")] },
    verification: { strategy: "count-by-kind", summary: "5×3＋3×2＝21。", steps: [s("自行车", "subtract", [8, 5], 3, "剩下3辆是自行车。"), s("三轮车轮子", "multiply", [5, 3], 15, "5辆三轮车有15个轮子。"), s("自行车轮子", "multiply", ["$自行车", 2], 6, "3辆自行车有6个轮子。"), s("轮子总数", "add", ["$三轮车轮子", "$自行车轮子"], 21, "轮子总数正好是21个。"), s("答案", "divide", ["$三轮车轮子", 3], 5, "所以有5辆三轮车。")] },
    commonPitfall: "三轮车比自行车多1个轮子，不是多3个轮子。", storyBeat: "找出多出的轮子。"
  }),
  q({
    id: "chicken-rabbit-2", level: 2, slot: 2, title: "鸡和兔子", difficulty: "basic", answer: "4",
    prompt: "院子里共有10只鸡和兔子，共有28条腿。兔子有多少只？",
    conditionRoles: ["animal-total", "leg-total"], structureFamily: "uniform-difference", representation: "text", questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["assume-all-chickens"],
    solution: { strategy: "assume-all-chickens", summary: "先全看成鸡：28－20＝8，8÷2＝4。", steps: [s("全是鸡", "multiply", [10, 2], 20, "先把每只动物都看成有2条腿的鸡。"), s("多出的腿", "subtract", [28, "$全是鸡"], 8, "兔子一共多出了8条腿。"), s("答案", "divide", ["$多出的腿", 2], 4, "每只兔子比鸡多2条腿，所以有4只兔子。")] },
    verification: { strategy: "head-and-leg-check", summary: "4×4＋6×2＝28。", steps: [s("鸡", "subtract", [10, 4], 6, "另外6只动物是鸡。"), s("兔子腿", "multiply", [4, 4], 16, "4只兔子有16条腿。"), s("鸡腿", "multiply", ["$鸡", 2], 12, "6只鸡有12条腿。"), s("腿总数", "add", ["$兔子腿", "$鸡腿"], 28, "腿的总数正好是28条。"), s("答案", "divide", ["$兔子腿", 4], 4, "所以有4只兔子。")] },
    commonPitfall: "一只兔子比一只鸡只多2条腿。", storyBeat: "把鸡当作开始的样子。"
  }),
  q({
    id: "chicken-rabbit-3", level: 3, slot: 3, title: "玩具车轮子表", difficulty: "basic", answer: "4",
    prompt: "表格中两轮车每辆2个轮子，四轮车每辆4个轮子，共有12辆玩具车和32个轮子。四轮车有多少辆？",
    conditionRoles: ["model-total", "wheel-total", "wheel-types"], structureFamily: "difference-table", representation: "table", representationShift: true, questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["difference-table"],
    solution: { strategy: "difference-table", summary: "先按每辆2个轮子算：32－24＝8，8÷2＝4。", steps: [s("全是两轮车", "multiply", [12, 2], 24, "表格中先按每辆2个轮子来算。"), s("多出的轮子", "subtract", [32, "$全是两轮车"], 8, "四轮车一共多出8个轮子。"), s("答案", "divide", ["$多出的轮子", 2], 4, "每辆四轮车多2个轮子，所以有4辆。")] },
    verification: { strategy: "table-column-total", summary: "4×4＋8×2＝32。", steps: [s("两轮车", "subtract", [12, 4], 8, "表格中有8辆两轮车。"), s("四轮车轮子", "multiply", [4, 4], 16, "4辆四轮车有16个轮子。"), s("两轮车轮子", "multiply", ["$两轮车", 2], 16, "8辆两轮车有16个轮子。"), s("轮子总数", "add", ["$四轮车轮子", "$两轮车轮子"], 32, "表格两列合起来正好是32个轮子。"), s("答案", "divide", ["$四轮车轮子", 4], 4, "四轮车这一列有4辆。")] },
    commonPitfall: "四轮车比两轮车多2个轮子，不是多4个。", storyBeat: "按表格的两列来数。"
  }),
  q({
    id: "chicken-rabbit-4", level: 4, slot: 4, title: "已知兔子数", difficulty: "intermediate", answer: "40",
    prompt: "笼子里共有14只鸡和兔子，其中有6只兔子。它们共有多少条腿？",
    conditionRoles: ["animal-total", "known-rabbits", "leg-rates"], structureFamily: "reverse-total", representation: "text", questionDirection: "reverse", reasoningMoves: ["assume", "reverse", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["classify-then-sum"],
    solution: { strategy: "classify-then-sum", summary: "6×4＋8×2＝40。", steps: [s("鸡", "subtract", [14, 6], 8, "另外8只动物是鸡。"), s("兔子腿", "multiply", [6, 4], 24, "6只兔子有24条腿。"), s("鸡腿", "multiply", ["$鸡", 2], 16, "8只鸡有16条腿。"), s("答案", "add", ["$兔子腿", "$鸡腿"], 40, "一共是40条腿。")] },
    verification: { strategy: "all-chicken-plus-extra", summary: "14×2＋6×2＝40。", steps: [s("全是鸡", "multiply", [14, 2], 28, "先把14只都看成鸡，有28条腿。"), s("兔子多出的腿", "multiply", [6, 2], 12, "6只兔子各多2条腿，共多12条。"), s("答案", "add", ["$全是鸡", "$兔子多出的腿"], 40, "合起来正好是40条腿。")] },
    commonPitfall: "先用总只数减去兔子数，才能知道鸡的只数。", storyBeat: "从已经知道的一组开始。"
  }),
  q({
    id: "chapter-01-chicken-rabbit-advance-1", level: 5, slot: 5, title: "带编号的笼子", difficulty: "intermediate", answer: "3",
    prompt: "工厂里共有16个两脚或六脚机器人，共有44只脚。6号笼子的编号不用算，六脚机器人有多少个？",
    conditionRoles: ["robot-total", "foot-total", "irrelevant-label"], structureFamily: "irrelevant-condition", representation: "text", questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["ignore-label-and-assume"],
    solution: { strategy: "ignore-label-and-assume", summary: "先按全是两脚算：44－32＝12，12÷4＝3。", steps: [s("全是两脚", "multiply", [16, 2], 32, "不用管笼子编号，先按每个机器人2只脚算。"), s("多出的脚", "subtract", [44, "$全是两脚"], 12, "六脚机器人一共多出12只脚。"), s("答案", "divide", ["$多出的脚", 4], 3, "每个六脚机器人多4只脚，所以有3个。")] },
    verification: { strategy: "separate-foot-count", summary: "3×6＋13×2＝44。", steps: [s("两脚机器人", "subtract", [16, 3], 13, "其余13个是两脚机器人。"), s("六脚机器人脚", "multiply", [3, 6], 18, "3个六脚机器人有18只脚。"), s("两脚机器人脚", "multiply", ["$两脚机器人", 2], 26, "13个两脚机器人有26只脚。"), s("脚总数", "add", ["$六脚机器人脚", "$两脚机器人脚"], 44, "有用的总数正好是44只脚。"), s("答案", "divide", ["$六脚机器人脚", 6], 3, "所以有3个六脚机器人。")] },
    commonPitfall: "6号是笼子的编号，不是每个机器人的脚数。", storyBeat: "只留下算题有用的条件。"
  }),
  q({
    id: "chicken-rabbit-5", level: 6, slot: 6, title: "两轮车和三轮车", difficulty: "intermediate", answer: "6",
    prompt: "车棚里共有12辆自行车和三轮车，共有30个轮子。三轮车有多少辆？",
    conditionRoles: ["vehicle-total", "wheel-total", "one-wheel-difference"], structureFamily: "one-extra-wheel", representation: "text", questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["one-extra-wheel"],
    solution: { strategy: "one-extra-wheel", summary: "30－24＝6。", steps: [s("全是自行车", "multiply", [12, 2], 24, "先把12辆都看成自行车。"), s("答案", "subtract", [30, "$全是自行车"], 6, "每辆三轮车只多1个轮子，所以有6辆三轮车。")] },
    verification: { strategy: "category-wheel-sum", summary: "6×3＋6×2＝30。", steps: [s("自行车", "subtract", [12, 6], 6, "另外6辆是自行车。"), s("三轮车轮子", "multiply", [6, 3], 18, "6辆三轮车有18个轮子。"), s("自行车轮子", "multiply", ["$自行车", 2], 12, "6辆自行车有12个轮子。"), s("轮子总数", "add", ["$三轮车轮子", "$自行车轮子"], 30, "轮子总数正好是30个。"), s("答案", "divide", ["$三轮车轮子", 3], 6, "所以有6辆三轮车。")] },
    commonPitfall: "这里每辆三轮车只比自行车多1个轮子。", storyBeat: "注意轮子数相差1。"
  }),
  q({
    id: "chicken-rabbit-6", level: 7, slot: 7, title: "硬币面值表", difficulty: "advanced", answer: "8",
    prompt: "表格中2元硬币每枚2元，5元硬币每枚5元，共有20枚硬币，共64元。5元硬币有多少枚？",
    conditionRoles: ["coin-total", "value-total", "coin-values"], structureFamily: "value-difference", representation: "table", questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["assume-all-2-yuan"],
    solution: { strategy: "assume-all-2-yuan", summary: "先都按2元算：64－40＝24，24÷3＝8。", steps: [s("全是2元", "multiply", [20, 2], 40, "表格中先把每枚硬币都按2元算。"), s("多出的元数", "subtract", [64, "$全是2元"], 24, "5元硬币一共多出24元。"), s("答案", "divide", ["$多出的元数", 3], 8, "每枚5元硬币多3元，所以有8枚。")] },
    verification: { strategy: "coin-count-and-value", summary: "8×5＋12×2＝64。", steps: [s("2元硬币", "subtract", [20, 8], 12, "另外12枚是2元硬币。"), s("5元硬币钱数", "multiply", [8, 5], 40, "8枚5元硬币共40元。"), s("2元硬币钱数", "multiply", ["$2元硬币", 2], 24, "12枚2元硬币共24元。"), s("钱数总和", "add", ["$5元硬币钱数", "$2元硬币钱数"], 64, "钱数总和正好是64元。"), s("答案", "divide", ["$5元硬币钱数", 5], 8, "所以有8枚5元硬币。")] },
    commonPitfall: "一枚5元硬币比一枚2元硬币多3元。", storyBeat: "把钱数变成相差的元数。"
  }),
  q({
    id: "chicken-rabbit-9", level: 8, slot: 8, title: "大箱和小箱", difficulty: "advanced", answer: "6",
    prompt: "仓库里共有18个大箱和小箱，大箱装5件，小箱装3件，共装66件。大箱有多少个？",
    conditionRoles: ["box-total", "item-total", "box-capacities"], structureFamily: "two-method-boxes", representation: "text", questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["assume-all-small", "equation"],
    solution: { strategy: "assume-all-small", summary: "先都按小箱算：66－54＝12，12÷2＝6。", steps: [s("全是小箱", "multiply", [18, 3], 54, "先把每个箱子都按装3件的小箱算。"), s("多出的件数", "subtract", [66, "$全是小箱"], 12, "大箱一共多装12件。"), s("答案", "divide", ["$多出的件数", 2], 6, "每个大箱多装2件，所以有6个。")] },
    verification: { strategy: "capacity-sum", summary: "6×5＋12×3＝66。", steps: [s("小箱", "subtract", [18, 6], 12, "另外12个是小箱。"), s("大箱件数", "multiply", [6, 5], 30, "6个大箱装30件。"), s("小箱件数", "multiply", ["$小箱", 3], 36, "12个小箱装36件。"), s("件数总和", "add", ["$大箱件数", "$小箱件数"], 66, "件数总和正好是66件。"), s("答案", "divide", ["$大箱件数", 5], 6, "所以有6个大箱。")] },
    commonPitfall: "大箱和小箱每个装的件数不能直接相加。", storyBeat: "先选择全按小箱来算。"
  }),
  q({
    id: "chicken-rabbit-7", level: 9, slot: 9, title: "机器人数量差", difficulty: "advanced", answer: "8",
    prompt: "共有24个机器人，有两脚和四脚两种。四脚机器人比两脚机器人少8个，四脚机器人有多少个？",
    conditionRoles: ["robot-total", "difference-between-groups", "foot-rates"], structureFamily: "sum-difference-transfer", representation: "text", questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: ["sum-diff"], strategyChoices: ["bar-model"],
    solution: { strategy: "sum-difference-bar-model", summary: "24－8＝16，16÷2＝8。", steps: [s("去掉差", "subtract", [24, 8], 16, "从总数中去掉多出的8个，两组就一样多。"), s("答案", "divide", ["$去掉差", 2], 8, "相等的两份各有8个，所以四脚机器人有8个。")] },
    verification: { strategy: "sum-difference-and-feet-check", summary: "先算两组数量：8和16；相加是24，相差8。", steps: [s("去掉差", "subtract", [24, 8], 16, "从24个中去掉相差的8个，剩下16个。"), s("四脚", "divide", ["$去掉差", 2], 8, "剩下的两份相等，四脚机器人有8个。"), s("两脚", "add", ["$四脚", 8], 16, "两脚机器人比四脚机器人多8个，所以有16个。"), s("总数", "add", ["$四脚", "$两脚"], 24, "两组相加正好是24个。"), s("数量差", "subtract", ["$两脚", "$四脚"], 8, "两组数量正好相差8个。"), s("四脚轮子", "multiply", ["$四脚", 4], 32, "8个四脚机器人有32只脚。"), s("两脚轮子", "multiply", ["$两脚", 2], 32, "16个两脚机器人有32只脚。"), s("脚总数", "add", ["$四脚轮子", "$两脚轮子"], 64, "两种机器人一共有64只脚。"), s("答案", "divide", ["$四脚轮子", 4], 8, "所以四脚机器人有8个。")] },
    commonPitfall: "相差8个说的是机器人数量，不是脚的数量。", storyBeat: "先用总数和相差的数量来分组。"
  }),
  q({
    id: "chicken-rabbit-8", level: 10, slot: 10, title: "修车店挑战", difficulty: "challenge", answer: "10",
    prompt: "修车店里共有22辆自行车和三轮车，其中5辆三轮车各少了1个轮子。现在共数到49个轮子，原来有多少辆三轮车？",
    conditionRoles: ["vehicle-total", "damaged-wheel-total", "restored-wheels", "wheel-rates"], structureFamily: "restoration-boss", representation: "text", questionDirection: "reverse", reasoningMoves: ["assume", "reverse", "substitute", "verify"], supportingConcepts: ["sum-diff"], strategyChoices: ["restore-total", "assume-all-bikes"], transfer: "boss-integration",
    solution: { strategy: "restore-then-assume", summary: "先补回5个轮子：49＋5＝54；54－44＝10，所以有10辆三轮车。", steps: [s("原来轮子", "add", [49, 5], 54, "先补回5辆三轮车各少的1个轮子，原来有54个轮子。"), s("全是自行车", "multiply", [22, 2], 44, "如果22辆全是自行车，就有44个轮子。"), s("多出的轮子", "subtract", ["$原来轮子", "$全是自行车"], 10, "原来多出的10个轮子来自三轮车。"), s("答案", "divide", ["$多出的轮子", 1], 10, "每辆三轮车比自行车多1个轮子，所以有10辆三轮车。")] },
    verification: { strategy: "restore-and-separate-count", summary: "10×3＋12×2＝54，54－5＝49。", steps: [s("自行车", "subtract", [22, 10], 12, "另外12辆是自行车。"), s("三轮车轮子", "multiply", [10, 3], 30, "10辆三轮车原来有30个轮子。"), s("自行车轮子", "multiply", ["$自行车", 2], 24, "12辆自行车有24个轮子。"), s("原来轮子", "add", ["$三轮车轮子", "$自行车轮子"], 54, "原来的轮子总数是54个。"), s("现在轮子", "subtract", ["$原来轮子", 5], 49, "少掉5个轮子后，正好数到49个。"), s("答案", "divide", ["$三轮车轮子", 3], 10, "所以原来有10辆三轮车。")] },
    commonPitfall: "要先补回少掉的5个轮子，再和全是自行车的情况比较。", storyBeat: "先补轮子，再解决修车店的难题。"
  })
]);

module.exports = CHICKEN_RABBIT_GOLD_QUESTIONS;
