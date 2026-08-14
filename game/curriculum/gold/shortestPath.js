"use strict";

function deepFreeze(value, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

const REVIEW = deepFreeze({
  reviewer: "课程审阅员",
  reviewedAt: "2026-08-14T00:00:00.000Z",
  evidence: "已分别复算主解和验算路线，并核对障碍、路段和答案。"
});

const s = (id, operation, operands, result, explanation) => ({
  id, kind: "calculate", operation, operands, result, explanation
});

const q = (fields) => deepFreeze({
  schemaVersion: 3,
  topicId: "shortest-path",
  primaryConcept: "shortest-path",
  answerType: "numeric",
  answerFormat: "integer",
  answerPolicy: { kind: "integer" },
  readingProfile: { unfamiliarTerms: [] },
  reviewMetadata: REVIEW,
  reasoningMoves: ["enumerate", "compare", "optimize", "verify"],
  ...fields
});

const SHORTEST_PATH_GOLD_QUESTIONS = deepFreeze([
  q({
    id: "chapter-08-shortest-path-1", level: 1, slot: 1, title: "方格上的直达路线", difficulty: "basic", answer: "9",
    prompt: "方格图中从第3列第2行走到第8列第6行，只能向右或向上走。最短走多少格？",
    conditionRoles: ["start-coordinate", "end-coordinate"], structureFamily: "direct-manhattan", representation: "diagram", questionDirection: "find-parameter",
    supportingConcepts: [], strategyChoices: ["横竖分别相减"],
    solution: { strategy: "横竖距离相加", summary: "横着走5格，竖着走4格，共9格。", steps: [
      s("横向距离", "subtract", [8, 3], 5, "第8列比第3列多5列，所以向右走5格。"),
      s("竖向距离", "subtract", [6, 2], 4, "第6行比第2行多4行，所以向上走4格。"),
      s("答案", "add", ["$横向距离", "$竖向距离"], 9, "把横向和竖向的格数相加，最短是9格。")
    ] },
    verification: { strategy: "调换行走次序验算", summary: "先向上4格再向右5格，仍是9格。", steps: [
      s("另一条路线", "add", [4, 5], 9, "先走4格再走5格，一共也是9格。"),
      s("答案确认", "divide", ["$另一条路线", 1], 9, "没有多走或少走，所以答案是9格。")
    ] },
    commonPitfall: "不能把列数和行数直接相减后只算一次。", storyBeat: "先把横着走和竖着走分开数。"
  }),
  q({
    id: "chapter-08-shortest-path-2", level: 2, slot: 2, title: "必须经过的水站", difficulty: "basic", answer: "10",
    prompt: "路线图中从第1列第1行出发，必须先到第1列第5行的水站，再到第7列第5行。最少走多少格？",
    conditionRoles: ["start", "forced-waypoint", "end"], structureFamily: "forced-waypoint", representation: "route-map", questionDirection: "find-parameter",
    supportingConcepts: [], strategyChoices: ["分段相加"],
    solution: { strategy: "水站分段法", summary: "先上4格，再右6格，共10格。", steps: [
      s("到水站", "subtract", [5, 1], 4, "从第1行到第5行要向上走4格。"),
      s("水站到终点", "subtract", [7, 1], 6, "从第1列到第7列要向右走6格。"),
      s("答案", "add", ["$到水站", "$水站到终点"], 10, "两段路线都必须走，所以一共10格。")
    ] },
    verification: { strategy: "按路段长度验算", summary: "水站前后两段是4格和6格。", steps: [
      s("路线总长", "add", [4, 6], 10, "把路线图上的两段长度合起来得到10格。"),
      s("答案确认", "divide", ["$路线总长", 1], 10, "水站没有被跳过，答案是10格。")
    ] },
    commonPitfall: "水站是必须经过的点，不能从起点直接连到终点。", storyBeat: "到水站后再重新数下一段。"
  }),
  q({
    id: "chapter-08-shortest-path-3", level: 3, slot: 3, title: "封边的绕行", difficulty: "intermediate", answer: "7",
    prompt: "方格图有6列2行，从第0列第0行到第5列第0行只能沿格边走；第2列第0行到第3列第0行的边封闭，其他格边可走。最少走多少格？",
    conditionRoles: ["start", "end", "blocked-edge", "grid-rule"], structureFamily: "blocked-edge-detour", representation: "diagram", questionDirection: "find-parameter",
    supportingConcepts: [], strategyChoices: ["先算直达再补绕行"],
    solution: { strategy: "封边补两格法", summary: "底行直达要走5格，绕过封边多走2格，共7格。", steps: [
      s("直达横向", "subtract", [5, 0], 5, "不看封边时，横向原本要走5格。"),
      s("答案", "add", ["$直达横向", 2], 7, "为绕开封边，要先上再下，多走2格。")
    ] },
    verification: { strategy: "逐段绕行验算", summary: "右2、上1、右1、下1、右2，共7格。", steps: [
      s("绕行总长", "sum", [2, 1, 1, 1, 2], 7, "按方格图逐段相加，路线在封边上方通过，共7格。")
    ] },
    commonPitfall: "封边不能直接跨过去，绕开它会多走两格。", storyBeat: "先找到封边两端，再画出上去又下来的小绕路。"
  }),
  q({
    id: "chapter-08-shortest-path-4", level: 4, slot: 4, title: "相同最短路线的条数", difficulty: "intermediate", answer: "6",
    prompt: "方格图从左下角到右上角，要走2格向右和2格向上。路线表格：第一步向右时余下1次右、2次上；第一步向上时余下2次右、1次上。最短路线有几条？",
    conditionRoles: ["horizontal-steps", "vertical-steps", "route-count"], structureFamily: "equal-route-count", representation: "table", representationShift: true, questionDirection: "find-parameter",
    supportingConcepts: [], strategyChoices: ["按第一步分类"],
    solution: { strategy: "第一步分类计数", summary: "先向右有3条，先向上也有3条，共6条。", steps: [
      s("先向右", "add", [1, 2], 3, "第一步向右后，剩下3步里安排1次向右，有3种排法。"),
      s("先向上", "add", [2, 1], 3, "第一步向上后，剩下3步里安排2次向右，也有3种排法。"),
      s("答案", "add", ["$先向右", "$先向上"], 6, "两类路线不重复，所以共有6条。")
    ] },
    verification: { strategy: "位置排列验算", summary: "4步中选2个位置放向右，共6种。", steps: [
      s("有序位置数", "multiply", [4, 3], 12, "先选第一个向右的位置有4种，再选第二个有3种。"),
      s("答案确认", "divide", ["$有序位置数", 2], 6, "两个向右步骤交换位置不算新路线，所以除以2得到6条。")
    ] },
    commonPitfall: "先向右和先向上是两类不同路线，都要算进去。", storyBeat: "用表格把第一步的两种情况分开。"
  }),
  q({
    id: "chapter-08-shortest-path-5", level: 5, slot: 5, title: "收费不同的两条路", difficulty: "intermediate", answer: "11",
    prompt: "路线图的路段表：甲：3格每格1元和4格每格2元；乙：2格每格3元、2格每格1元、5格每格1元。选花费最少的路，要花多少元？",
    conditionRoles: ["route-a-segments", "route-b-segments", "different-segment-costs"], structureFamily: "weighted-road", representation: "route-map", questionDirection: "compare-plans",
    supportingConcepts: [], strategyChoices: ["分别求和再比较"],
    solution: { strategy: "两路总花费比较法", summary: "甲路花11元，乙路花13元，选甲路。", steps: [
      s("甲路首段花费", "multiply", [3, 1], 3, "甲路首段3格，每格1元，花3元。"),
      s("甲路末段花费", "multiply", [4, 2], 8, "甲路末段4格，每格2元，花8元。"),
      s("甲路总花费", "add", ["$甲路首段花费", "$甲路末段花费"], 11, "甲路共花11元。"),
      s("乙路首段花费", "multiply", [2, 3], 6, "乙路首段2格，每格3元，花6元。"),
      s("乙路中段花费", "multiply", [2, 1], 2, "乙路中段2格，每格1元，花2元。"),
      s("乙路前段花费", "add", ["$乙路首段花费", "$乙路中段花费"], 8, "乙路前两段共花8元。"),
      s("乙路总花费", "add", ["$乙路前段花费", 5], 13, "乙路末段5格，每格1元，所以共花13元。"),
      s("答案", "min", ["$甲路总花费", "$乙路总花费"], 11, "比较11元和13元，最少花11元。")
    ] },
    verification: { strategy: "基准价加价验算", summary: "甲路按每格1元是7元，再给末段加4元，共11元；乙路是13元。", steps: [
      s("甲路基准价", "add", [3, 4], 7, "甲路两段先都按每格1元，合计7元。"),
      s("甲路末段加价", "multiply", [4, 1], 4, "甲路末段每格多收1元，4格多收4元。"),
      s("甲路复算总价", "add", ["$甲路基准价", "$甲路末段加价"], 11, "甲路复算后是11元。"),
      s("乙路基准价", "sum", [2, 2, 5], 9, "乙路三段都先按每格1元，合计9元。"),
      s("乙路首段加价", "multiply", [2, 2], 4, "乙路首段每格多收2元，2格多收4元。"),
      s("乙路复算总价", "add", ["$乙路基准价", "$乙路首段加价"], 13, "乙路复算后是13元。"),
      s("验算答案", "min", ["$甲路复算总价", "$乙路复算总价"], 11, "两条路重新比较后，最少仍是11元。")
    ] },
    commonPitfall: "不能只看格数，要把每一段的格数和每格收费相乘。", storyBeat: "先给两条路各算一张收费账单。"
  }),
  q({
    id: "chapter-08-shortest-path-6", level: 6, slot: 6, title: "反推起点位置", difficulty: "advanced", answer: "6",
    prompt: "方格图的终点在第10列第8行，路线向右4格、向上5格。算式是起点列数加4等于10，出发点在第几列？",
    conditionRoles: ["end-coordinate", "horizontal-move", "vertical-move"], structureFamily: "reverse-endpoint", representation: "equation", representationShift: true, questionDirection: "reverse",
    supportingConcepts: [], strategyChoices: ["从终点倒着减"],
    solution: { strategy: "终点倒推起点法", summary: "终点第10列减去右移4格得到第6列；再用起点坐标和和正向复原检查，出发点仍在第6列。", steps: [
      s("起点横坐标", "subtract", [10, 4], 6, "终点在第10列，倒着减去向右的4格，起点在第6列。"),
      s("起点纵坐标", "subtract", [8, 5], 3, "终点第8行倒着减去向上的5格，起点是第3行。"),
      s("起点坐标和", "add", ["$起点横坐标", "$起点纵坐标"], 9, "起点第6列第3行，坐标和是9。"),
      s("终点列复原", "add", ["$起点横坐标", 4], 10, "从候选起点第6列向右4格，正好复原到终点第10列。"),
      s("答案", "subtract", ["$起点坐标和", "$起点纵坐标"], 6, "起点坐标和去掉第3行，出发点在第6列。")
    ] },
    verification: { strategy: "正向复原验算", summary: "从第6列向右4格到第10列，从第3行向上5格到第8行，正好回到终点。", steps: [
      s("反推起点列", "subtract", [10, 4], 6, "终点第10列倒着减4格，候选起点是第6列。"),
      s("反推起点行", "subtract", [8, 5], 3, "终点第8行倒着减5格，候选起点是第3行。"),
      s("复原终点列", "add", ["$反推起点列", 4], 10, "从第6列向右4格，正好回到第10列。"),
      s("复原终点行", "add", ["$反推起点行", 5], 8, "从第3行向上5格，正好回到第8行。"),
      s("验算答案", "subtract", ["$复原终点列", 4], 6, "复原终点列后再退4格，仍得到第6列。")
    ] },
    commonPitfall: "题目给的是终点，不能再把移动格数往终点上加。", storyBeat: "先从终点向左退4格，找到出发列。"
  }),
  q({
    id: "chapter-08-shortest-path-7", level: 7, slot: 7, title: "长方形边上的近路", difficulty: "advanced", answer: "13",
    prompt: "长方形示意图长8格、宽5格，从一个角沿边走到对角。两条边路一样短，最少走多少格？",
    conditionRoles: ["rectangle-length", "rectangle-width", "opposite-corners", "boundary-only"], structureFamily: "perimeter-shortcut", representation: "diagram", questionDirection: "find-parameter",
    supportingConcepts: [], strategyChoices: ["先求周长的一半"],
    solution: { strategy: "半周长捷径法", summary: "长加宽是13格，周长的一半也是13格。", steps: [
      s("长宽和", "add", [8, 5], 13, "沿相邻两条边走，长度就是长加宽。"),
      s("周长", "multiply", ["$长宽和", 2], 26, "长方形周长是长宽和的2倍。"),
      s("半周", "divide", ["$周长", 2], 13, "从一个角沿边到对角正好走半周。"),
      s("答案", "min", ["$长宽和", "$半周"], 13, "两种计算都得到13格，所以最短是13格。")
    ] },
    verification: { strategy: "两条边路验算", summary: "先走8再走5，或先走5再走8，都是13格。", steps: [
      s("上边路线", "add", [8, 5], 13, "沿一条长边和一条宽边共走13格。"),
      s("下边路线", "add", [5, 8], 13, "换另一侧的两条边，长度还是13格。"),
      s("答案确认", "min", ["$上边路线", "$下边路线"], 13, "两条边路相同，最短长度是13格。")
    ] },
    commonPitfall: "题目要求沿边走，不能斜着穿过长方形内部。", storyBeat: "发现对角的两条边路正好都是半个周长。"
  }),
  q({
    id: "chapter-08-shortest-path-8", level: 8, slot: 8, title: "对称线后的距离", difficulty: "advanced", answer: "3",
    prompt: "方格图的竖直对称线在第5列，甲点在第2列，乙点在第11列且和甲同一行。甲的镜像到乙有多少格？",
    conditionRoles: ["symmetry-line", "source-column", "target-column", "same-row"], structureFamily: "reflection-symmetry", representation: "diagram", questionDirection: "find-parameter",
    supportingConcepts: ["symmetry"], strategyChoices: ["先找镜像列"],
    solution: { strategy: "对称列反射法", summary: "镜像在第8列，第8列到第11列是3格。", steps: [
      s("对称线两倍", "multiply", [5, 2], 10, "第5列到对称线左边和右边的距离相等。"),
      s("镜像列", "subtract", ["$对称线两倍", 2], 8, "用第10列减去甲点的第2列，镜像在第8列。"),
      s("镜像到乙", "subtract", [11, "$镜像列"], 3, "第8列到第11列相差3列。"),
      s("答案", "divide", ["$镜像到乙", 1], 3, "同一行只数横向，所以距离是3格。")
    ] },
    verification: { strategy: "对称轴两侧验算", summary: "乙到对称线6格，甲到对称线3格，相减得3格。", steps: [
      s("乙到对称线", "subtract", [11, 5], 6, "乙点在对称线右边6格。"),
      s("甲到对称线", "subtract", [5, 2], 3, "甲点在对称线左边3格，镜像也在右边3格。"),
      s("答案确认", "subtract", ["$乙到对称线", "$甲到对称线"], 3, "同侧的6格减去3格，镜像到乙是3格。")
    ] },
    commonPitfall: "镜像点到对称线的距离和原点相等，不是把列号直接相加。", storyBeat: "先在对称线另一边标出同样远的镜像点。"
  }),
  q({
    id: "chapter-08-shortest-path-9", level: 9, slot: 9, title: "必经检查点的两段路", difficulty: "challenge", answer: "13",
    prompt: "路线图中从起点到终点必须经过检查点。起点到检查点先右4格再上2格，检查点到终点先右3格再上4格，最少走多少格？",
    conditionRoles: ["start", "checkpoint", "end", "two-stage-route"], structureFamily: "checkpoint-route", representation: "route-map", questionDirection: "find-parameter",
    supportingConcepts: ["coordinates-routes"], strategyChoices: ["两段分别求最短"],
    solution: { strategy: "检查点分段优化法", summary: "前段6格，后段7格，合起来13格。", steps: [
      s("到检查点", "add", [4, 2], 6, "起点到检查点向右4格、向上2格，共6格。"),
      s("后段", "add", [3, 4], 7, "检查点到终点横竖相加是7格。"),
      s("全程", "add", ["$到检查点", "$后段"], 13, "两段都不可少，全程最短是13格。"),
      s("答案", "min", ["$全程", 13], 13, "检查点已经过，最短长度是13格。")
    ] },
    verification: { strategy: "逐段路线复算", summary: "4加2加3加4等于13。", steps: [
      s("路线格数总和", "sum", [4, 2, 3, 4], 13, "按题目给出的四段路线直接相加，得到13格。")
    ] },
    commonPitfall: "检查点是不可避免的，不能把两段路线当成可以任选一段。", storyBeat: "把检查点当作必须换乘的中间站。"
  }),
  q({
    id: "chapter-08-shortest-path-10", level: 10, slot: 10, title: "杯赛入门路线优化", difficulty: "challenge", answer: "11",
    prompt: "杯赛入门路线表格：维修点封闭不能经过，两方案均从校门到签到点再到终点；甲方案为3格每格1分、4格每格2分、2格每格1分，乙方案为2格每格2分、3格每格1分、4格每格1分。最少花费多少分？",
    conditionRoles: ["route-a-parts", "route-b-parts", "entry-checkpoint", "finish", "cost-unit"], structureFamily: "cup-entry-route", representation: "table", questionDirection: "compare-plans",
    supportingConcepts: ["coordinates-routes", "cup-entry"], strategyChoices: ["分段算花费", "比较总花费"], transfer: "boss-integration",
    solution: { strategy: "入门路线花费优化法", summary: "甲方案花13分，乙方案花11分，杯赛应选乙方案。", steps: [
      s("甲路首尾花费", "add", [3, 2], 5, "甲方案首段3格和末段2格都是每格1分，共5分。"),
      s("甲路中段花费", "multiply", [4, 2], 8, "甲站到签到点4格，每格2分，花8分。"),
      s("甲路总花费", "add", ["$甲路首尾花费", "$甲路中段花费"], 13, "甲方案共花13分。"),
      s("乙路首段花费", "multiply", [2, 2], 4, "乙方案校门到乙站2格，每格2分，花4分。"),
      s("乙路其余花费", "add", [3, 4], 7, "乙站到签到点3格和签到点到终点4格都是每格1分，共7分。"),
      s("乙路总花费", "add", ["$乙路首段花费", "$乙路其余花费"], 11, "乙方案共花11分。"),
      s("答案", "min", ["$甲路总花费", "$乙路总花费"], 11, "比较13分和11分，杯赛入门选乙方案的11分。")
    ] },
    verification: { strategy: "基准花费验算", summary: "甲方案首尾按每格1分为5分，再加中段8分是13分；乙方案按每格1分是9分，再加首段2分是11分。", steps: [
      s("甲路中段复算", "multiply", [4, 2], 8, "甲方案中段4格，每格2分，花8分。"),
      s("甲路首尾格数", "add", [3, 2], 5, "甲方案首段和末段都是每格1分，共5分。"),
      s("甲路复算总价", "add", ["$甲路中段复算", "$甲路首尾格数"], 13, "甲方案复算共13分。"),
      s("乙路基准价", "sum", [2, 3, 4], 9, "乙方案三段都先按每格1分，合计9分。"),
      s("乙路首段加价", "multiply", [2, 1], 2, "乙方案首段每格多收1分，2格多收2分。"),
      s("乙路复算总价", "add", ["$乙路基准价", "$乙路首段加价"], 11, "乙方案复算共11分。"),
      s("验算答案", "min", ["$甲路复算总价", "$乙路复算总价"], 11, "两种完整报名方案比较后，最少是11分。")
    ] },
    commonPitfall: "维修点封闭不能穿过，且不能只比较格数，必须比较完整方案的花费。", storyBeat: "像赛前选路线一样，先核对签到点前后每段的收费。"
  })
]);

module.exports = SHORTEST_PATH_GOLD_QUESTIONS;
