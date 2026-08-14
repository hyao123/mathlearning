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
    id: "chapter-08-shortest-path-3", level: 3, slot: 3, title: "封边的绕行", difficulty: "intermediate", answer: "10",
    prompt: "方格图从第0列第0行到第5列第3行，底边第2列到第3列封闭。必须绕开封边，最少走多少格？",
    conditionRoles: ["start", "end", "blocked-edge", "grid-rule"], structureFamily: "blocked-edge-detour", representation: "diagram", questionDirection: "find-parameter",
    supportingConcepts: [], strategyChoices: ["先算直达再补绕行"],
    solution: { strategy: "封边补两格法", summary: "原来要走8格，绕过封边多走2格，共10格。", steps: [
      s("直达横向", "subtract", [5, 0], 5, "不看封边时，横向原本要走5格。"),
      s("直达竖向", "subtract", [3, 0], 3, "竖向原本要走3格。"),
      s("直达长度", "add", ["$直达横向", "$直达竖向"], 8, "直达路线原本共8格。"),
      s("答案", "add", ["$直达长度", 2], 10, "为绕开一条封边，要先上再下，多走2格。")
    ] },
    verification: { strategy: "逐段绕行验算", summary: "右2、上1、右1、下1、右2、上3，共10格。", steps: [
      s("绕行总长", "sum", [2, 1, 1, 1, 2, 3], 10, "按方格图逐段相加，绕行路线共10格。"),
      s("答案确认", "divide", ["$绕行总长", 1], 10, "这条路线没有经过封边，所以答案是10格。")
    ] },
    commonPitfall: "封边不能直接跨过去，绕开它会多走两格。", storyBeat: "先找到封边两端，再画出上去又下来的小绕路。"
  }),
  q({
    id: "chapter-08-shortest-path-4", level: 4, slot: 4, title: "相同最短路线的条数", difficulty: "intermediate", answer: "6",
    prompt: "方格图从左下角到右上角，要走2格向右和2格向上。表格列出第一步的两种选择，最短路线有几条？",
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
    id: "chapter-08-shortest-path-5", level: 5, slot: 5, title: "收费不同的两条路", difficulty: "intermediate", answer: "7",
    prompt: "路线图有两条路：甲路分成3格和4格，乙路分成2格、2格和5格。每格收费相同，选哪条最短路要走多少格？",
    conditionRoles: ["route-a-segments", "route-b-segments", "equal-cost"], structureFamily: "weighted-road", representation: "route-map", questionDirection: "compare-plans",
    supportingConcepts: [], strategyChoices: ["分别求和再比较"],
    solution: { strategy: "两路总长比较法", summary: "甲路7格，乙路9格，选甲路走7格。", steps: [
      s("甲路", "add", [3, 4], 7, "甲路两段相加是7格。"),
      s("乙路前两段", "add", [2, 2], 4, "乙路前两段一共4格。"),
      s("乙路", "add", ["$乙路前两段", 5], 9, "乙路三段一共9格。"),
      s("答案", "min", ["$甲路", "$乙路"], 7, "比较7和9，较短的是7格。")
    ] },
    verification: { strategy: "差额回推验算", summary: "两路共16格，相差2格，乙路减2格就是7格。", steps: [
      s("两路合计", "add", [7, 9], 16, "把两条路的总长相加是16格。"),
      s("相差", "subtract", [9, 7], 2, "乙路比甲路多2格。"),
      s("答案确认", "subtract", [9, "$相差"], 7, "从较长的乙路减去差额，得到较短的7格。")
    ] },
    commonPitfall: "不能只看路段的条数，要把每段格数加起来。", storyBeat: "先给两条路各算一张小账单。"
  }),
  q({
    id: "chapter-08-shortest-path-6", level: 6, slot: 6, title: "反推终点位置", difficulty: "advanced", answer: "6",
    prompt: "方格图从第2列第3行出发，向右4格、向上5格。算式可写成横坐标2加4，终点在第几列？",
    conditionRoles: ["start-coordinate", "horizontal-move", "vertical-move"], structureFamily: "reverse-endpoint", representation: "equation", representationShift: true, questionDirection: "reverse",
    supportingConcepts: [], strategyChoices: ["先写终点坐标"],
    solution: { strategy: "终点坐标反推法", summary: "横坐标是6，纵坐标是8，因此终点在第6列。", steps: [
      s("终点横坐标", "add", [2, 4], 6, "起点在第2列，向右4格后到第6列。"),
      s("终点纵坐标", "add", [3, 5], 8, "起点在第3行，向上5格后到第8行。"),
      s("坐标和", "add", ["$终点横坐标", "$终点纵坐标"], 14, "终点两个坐标相加是14，便于检查。"),
      s("答案", "subtract", ["$坐标和", "$终点纵坐标"], 6, "从坐标和去掉纵坐标，横坐标仍是6。")
    ] },
    verification: { strategy: "坐标和复原验算", summary: "6加8等于14，再去掉8仍是6。", steps: [
      s("终点坐标和", "add", [6, 8], 14, "终点第6列第8行的两个数相加是14。"),
      s("答案确认", "subtract", ["$终点坐标和", 8], 6, "去掉第8行，留下第6列。")
    ] },
    commonPitfall: "向上改变的是行，向右改变的是列。", storyBeat: "先把终点的列和行分别写出来。"
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
      s("前段横向", "add", [4, 0], 4, "起点到检查点横向走4格。"),
      s("前段纵向", "add", [2, 0], 2, "起点到检查点纵向走2格。"),
      s("到检查点", "add", ["$前段横向", "$前段纵向"], 6, "前段最短路线是6格。"),
      s("后段", "add", [3, 4], 7, "检查点到终点横竖相加是7格。"),
      s("全程", "add", ["$到检查点", "$后段"], 13, "两段都不可少，全程最短是13格。"),
      s("答案", "divide", ["$全程", 1], 13, "检查点已经过，所以答案是13格。")
    ] },
    verification: { strategy: "逐段路线复算", summary: "4加2加3加4等于13。", steps: [
      s("前两段", "add", [4, 2], 6, "到检查点的两个方向共6格。"),
      s("后两段", "add", [3, 4], 7, "离开检查点的两个方向共7格。"),
      s("答案确认", "add", ["$前两段", "$后两段"], 13, "逐段复算仍得到13格。")
    ] },
    commonPitfall: "检查点是不可避免的，不能把两段路线当成可以任选一段。", storyBeat: "把检查点当作必须换乘的中间站。"
  }),
  q({
    id: "chapter-08-shortest-path-10", level: 10, slot: 10, title: "杯赛入门路线优化", difficulty: "challenge", answer: "12",
    prompt: "杯赛入门表格中，甲路经签到点为4格、3格、6格；乙路经签到点为2格、6格、4格。两路都必须签到，选最短路要走多少格？",
    conditionRoles: ["route-a-parts", "route-b-parts", "entry-checkpoint", "finish", "cost-unit"], structureFamily: "cup-entry-route", representation: "table", questionDirection: "compare-plans",
    supportingConcepts: ["coordinates-routes", "cup-entry"], strategyChoices: ["分段求和", "比较总长度"], transfer: "boss-integration",
    solution: { strategy: "入门路线优化法", summary: "甲路13格，乙路12格，杯赛应选乙路。", steps: [
      s("甲路前段", "add", [4, 3], 7, "甲路到签到点前两段共7格。"),
      s("甲路总长", "add", ["$甲路前段", 6], 13, "甲路经过签到点后共13格。"),
      s("乙路前段", "add", [2, 6], 8, "乙路到签到点前两段共8格。"),
      s("乙路总长", "add", ["$乙路前段", 4], 12, "乙路经过签到点后共12格。"),
      s("答案", "min", ["$甲路总长", "$乙路总长"], 12, "比较13和12，杯赛入门选12格的乙路。")
    ] },
    verification: { strategy: "差额复原验算", summary: "甲路比乙路多1格，13减1等于12。", steps: [
      s("甲路复算", "sum", [4, 3, 6], 13, "按路线表复算甲路三段，得到13格。"),
      s("乙路复算", "sum", [2, 6, 4], 12, "按路线表复算乙路三段，得到12格。"),
      s("两路差额", "subtract", ["$甲路复算", "$乙路复算"], 1, "甲路确实比乙路多1格。"),
      s("答案确认", "subtract", ["$甲路复算", "$两路差额"], 12, "从甲路减去多出的1格，得到乙路的12格。")
    ] },
    commonPitfall: "两条路都要经过签到点，不能省掉表格中的任一段。", storyBeat: "像赛前选路线一样，先核对每段再比较总长。"
  })
]);

module.exports = SHORTEST_PATH_GOLD_QUESTIONS;
