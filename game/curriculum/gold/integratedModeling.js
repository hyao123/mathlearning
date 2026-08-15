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
  evidence: "已分别复算主解、反向验算和每道题的整数答案。"
});

const s = (id, operation, operands, result, explanation) => ({
  id, kind: "calculate", operation, operands, result, explanation
});

const q = (fields) => deepFreeze({
  schemaVersion: 3,
  topicId: "integrated-modeling",
  primaryConcept: "integrated-modeling",
  answerType: "numeric",
  answerFormat: "integer",
  answerPolicy: { kind: "integer" },
  readingProfile: { unfamiliarTerms: [] },
  reviewMetadata: REVIEW,
  reasoningMoves: ["identify", "substitute", "compare", "verify"],
  ...fields
});

const INTEGRATED_MODELING_GOLD_QUESTIONS = deepFreeze([
  q({
    id: "chapter-09-integrated-modeling-1", level: 1, slot: 1,
    title: "彩带长度合并", difficulty: "basic", answer: "480",
    prompt: "材料表格：红彩带2.4米，蓝彩带180厘米，绿彩带60厘米。把它们接起来一共多少厘米？",
    conditionRoles: ["red-length-meters", "blue-length-centimeters", "green-length-centimeters"],
    structureFamily: "unit-conversion-total", representation: "table", questionDirection: "find-parameter",
    supportingConcepts: [], strategyChoices: ["先统一长度单位"],
    solution: { strategy: "换成厘米后逐段相加", summary: "红彩带是240厘米，再加180厘米和60厘米，共480厘米。", steps: [
      s("红彩带厘米数", "multiply", [2.4, 100], 240, "1米是100厘米，2.4米是240厘米。"),
      s("红蓝合长", "add", ["$红彩带厘米数", 180], 420, "红彩带和蓝彩带合起来长420厘米。"),
      s("答案", "add", ["$红蓝合长", 60], 480, "再接上60厘米绿彩带，共480厘米。")
    ] },
    verification: { strategy: "先合并同单位长度验算", summary: "蓝、绿彩带共240厘米，正好和红彩带一样长，所以总长480厘米。", steps: [
      s("蓝绿合长", "add", [180, 60], 240, "两条本来就是厘米单位，先合起来是240厘米。"),
      s("红彩带复算", "multiply", [2.4, 100], 240, "红彩带换算后也是240厘米。"),
      s("验算答案", "add", ["$蓝绿合长", "$红彩带复算"], 480, "两份240厘米相加，得到480厘米。")
    ] },
    commonPitfall: "不能把米和厘米直接相加。", storyBeat: "先把所有彩带都写成厘米再合并。"
  }),
  q({
    id: "chapter-09-integrated-modeling-2", level: 2, slot: 2,
    title: "接力铺跑道", difficulty: "basic", answer: "10",
    prompt: "工序示意图：跑道长24米。甲组每分钟铺3米，先铺4分钟；乙组每分钟铺2米，接着铺完。两组共用多少分钟？",
    conditionRoles: ["total-length", "first-stage-rate-time", "second-stage-rate"],
    structureFamily: "staged-work-rate", representation: "diagram", questionDirection: "find-parameter",
    supportingConcepts: [], strategyChoices: ["按先后阶段分开算"],
    solution: { strategy: "先算甲组完成量", summary: "甲组铺12米，乙组还要铺12米，用6分钟，共10分钟。", steps: [
      s("甲组完成量", "multiply", [3, 4], 12, "甲组每分钟铺3米，4分钟铺12米。"),
      s("乙组任务", "subtract", [24, "$甲组完成量"], 12, "从全长24米中去掉甲组铺的12米，还剩12米。"),
      s("乙组时间", "divide", ["$乙组任务", 2], 6, "乙组每分钟铺2米，铺12米要6分钟。"),
      s("答案", "add", [4, "$乙组时间"], 10, "甲组4分钟加乙组6分钟，共10分钟。")
    ] },
    verification: { strategy: "按总时间倒推验算", summary: "总共10分钟，去掉甲组4分钟，乙组有6分钟；两段各铺12米，正好24米。", steps: [
      s("乙组分钟数", "subtract", [10, 4], 6, "若共用10分钟，乙组应有6分钟。"),
      s("乙组完成量", "multiply", ["$乙组分钟数", 2], 12, "乙组6分钟每分钟铺2米，能铺12米。"),
      s("甲组复算量", "multiply", [4, 3], 12, "甲组4分钟每分钟铺3米，也铺12米。"),
      s("总长度", "add", ["$乙组完成量", "$甲组复算量"], 24, "两组完成量相加正好是24米。"),
      s("验算答案", "add", [4, "$乙组分钟数"], 10, "所以总时间确为10分钟。")
    ] },
    commonPitfall: "乙组不是从24米开始铺，要先扣掉甲组完成的部分。", storyBeat: "把跑道分成甲组已铺和乙组剩余两段。"
  }),
  q({
    id: "chapter-09-integrated-modeling-3", level: 3, slot: 3,
    title: "橙子装箱", difficulty: "intermediate", answer: "7",
    prompt: "装箱表格：有53个橙子，每箱装8个，最后不足一箱也要用一箱。至少要几箱？",
    conditionRoles: ["orange-total", "box-capacity", "partial-box-rule", "minimum-boxes"],
    structureFamily: "packing-ceil-division", representation: "table", representationShift: true, questionDirection: "find-parameter",
    supportingConcepts: ["capacity-model"], strategyChoices: ["最后不满一箱也进位"],
    solution: { strategy: "向上取整装箱法", summary: "6箱只能装48个，53个要向上取整为7箱。", steps: [
      s("六箱容量", "multiply", [6, 8], 48, "6箱每箱8个，只能装48个。"),
      s("超过六箱的橙子", "subtract", [53, "$六箱容量"], 5, "还剩5个橙子，必须再用一箱。"),
      s("答案", "ceilDivide", [53, 8], 7, "53除以8向上取整，至少需要7箱。")
    ] },
    verification: { strategy: "检查相邻箱数验算", summary: "6箱只能装48个，不足53个；7箱能装56个，已经够装53个。", steps: [
      s("六箱容量复算", "multiply", [6, 8], 48, "6箱一共只能装48个，装不下53个。"),
      s("七箱容量", "multiply", [7, 8], 56, "7箱一共能装56个，装得下53个。"),
      s("最少箱数", "ceilDivide", [53, 8], 7, "既然6箱不够而7箱够装，53个按每箱8个向上取整，最少是7箱。")
    ] },
    commonPitfall: "不能把余下的5个橙子当作不用箱子。", storyBeat: "先看6箱是否够装，再决定是否增加一箱。"
  }),
  q({
    id: "chapter-09-integrated-modeling-4", level: 4, slot: 4,
    title: "反推原价", difficulty: "intermediate", answer: "120",
    prompt: "价签算式：原价×（1－20%）＝96元。商品打八折后是96元，原价多少元？",
    conditionRoles: ["discount-rate", "discounted-price", "reverse-price"],
    structureFamily: "reverse-percent-discount", representation: "equation", representationShift: true, questionDirection: "reverse",
    supportingConcepts: ["percent-model"], strategyChoices: ["先找折后占原价的百分比"],
    solution: { strategy: "折后比例反推法", summary: "打八折表示付原价的80%，96元对应100%时是120元。", steps: [
      s("折后百分比", "subtract", [100, 20], 80, "原价的100%减去优惠20%，折后是原价的80%。"),
      s("每百分之一的价钱", "divide", [96, "$折后百分比"], 1.2, "96元对应80%，每1%是1.2元。"),
      s("答案", "multiply", ["$每百分之一的价钱", 100], 120, "100%就是原价，原价为120元。")
    ] },
    verification: { strategy: "用候选原价扣优惠验算", summary: "120元的20%是24元，扣掉后正好是96元。", steps: [
      s("优惠金额的百分数积", "multiply", [120, 20], 2400, "先算120乘20，得到2400。"),
      s("优惠金额", "divide", ["$优惠金额的百分数积", 100], 24, "2400除以100，优惠金额是24元。"),
      s("折后价", "subtract", [120, "$优惠金额"], 96, "120元减24元，折后正好96元。"),
      s("验算答案", "add", [96, "$优惠金额"], 120, "折后价加回优惠金额，原价是120元。")
    ] },
    commonPitfall: "八折不是减去80%，而是付原价的80%。", storyBeat: "把96元看成80份中的80份，再还原到100份。"
  }),
  q({
    id: "chapter-09-integrated-modeling-5", level: 5, slot: 5,
    title: "三轮平均成绩", difficulty: "intermediate", answer: "86",
    prompt: "成绩表格：三轮平均至少84分，前两轮是80分和86分。第三轮至少要得多少分？",
    conditionRoles: ["round-count", "target-average", "first-score", "second-score"],
    structureFamily: "multi-condition-average", representation: "table", questionDirection: "find-parameter",
    supportingConcepts: ["average-model"], strategyChoices: ["先还原总分"],
    solution: { strategy: "平均数还原总分法", summary: "平均84分的三轮总分是252分，前两轮共166分，第三轮至少86分。", steps: [
      s("目标总分", "multiply", [84, 3], 252, "三轮平均84分时，总分应是252分。"),
      s("前两轮总分", "add", [80, 86], 166, "前两轮一共得到166分。"),
      s("答案", "subtract", ["$目标总分", "$前两轮总分"], 86, "252分减去166分，第三轮至少得86分。")
    ] },
    verification: { strategy: "目标差额与最高参考分验算", summary: "三轮目标总分为252分，前两轮共166分，还差86分；80分、86分和目标平均84分中最高也是86分。", steps: [
      s("验算目标总分", "multiply", [84, 3], 252, "三轮平均84分时，目标总分是252分。"),
      s("验算前两轮总分", "add", [80, 86], 166, "前两轮一共得到166分。"),
      s("已知分数最高值", "max", [80, 86, 84], 86, "把第一轮80分、第二轮86分和目标平均84分比较，最高是86分。"),
      s("应得第三轮", "subtract", ["$验算目标总分", "$验算前两轮总分"], 86, "目标总分252分减去前两轮166分，第三轮至少要得86分。"),
      s("第三轮至少得分", "max", ["$应得第三轮", "$已知分数最高值"], 86, "应得的86分不低于每个已知分数和目标平均分，所以第三轮至少得86分。")
    ] },
    commonPitfall: "平均84分不是第三轮直接写84分，要先补足前两轮的差额。", storyBeat: "先把平均数变成三轮必须达到的总分。"
  }),
  q({
    id: "chapter-09-integrated-modeling-6", level: 6, slot: 6,
    title: "配送路线与车次", difficulty: "advanced", answer: "20",
    prompt: "配送表格：要送45箱物资。车辆方案｜每趟容量｜每趟耗资源：甲车｜9箱｜4点；乙车｜15箱｜7点。选耗资源最少的方案，要多少点？",
    conditionRoles: ["delivery-total", "route-a-capacity-cost", "route-b-capacity-cost", "minimum-resource"],
    structureFamily: "route-resource-tradeoff", representation: "table", questionDirection: "compare-plans",
    supportingConcepts: [], strategyChoices: ["先算两条路线的车次", "再比较资源"],
    solution: { strategy: "车次乘单趟资源比较法", summary: "甲车要5趟耗20点，乙车要3趟耗21点，应选甲车的20点。", steps: [
      s("甲车趟数", "divide", [45, 9], 5, "45箱按每趟9箱，需要5趟。"),
      s("甲车资源", "multiply", ["$甲车趟数", 4], 20, "甲车5趟每趟耗4点，共耗20点。"),
      s("乙车趟数", "divide", [45, 15], 3, "45箱按每趟15箱，需要3趟。"),
      s("乙车资源", "multiply", ["$乙车趟数", 7], 21, "乙车3趟每趟耗7点，共耗21点。"),
      s("答案", "min", ["$甲车资源", "$乙车资源"], 20, "比较20点和21点，最少是20点。")
    ] },
    verification: { strategy: "按候选趟数复原物资验算", summary: "甲车5趟正好送45箱且耗20点；乙车3趟也送45箱但耗21点。", steps: [
      s("甲车物资", "multiply", [5, 9], 45, "甲车5趟每趟9箱，正好送45箱。"),
      s("甲车资源复算", "multiply", [5, 4], 20, "甲车5趟每趟4点，共20点。"),
      s("乙车物资", "multiply", [3, 15], 45, "乙车3趟每趟15箱，也正好送45箱。"),
      s("乙车资源复算", "multiply", [3, 7], 21, "乙车3趟每趟7点，共21点。"),
      s("验算答案", "min", ["$甲车资源复算", "$乙车资源复算"], 20, "两种完成配送的方案中，20点更少。")
    ] },
    commonPitfall: "车次少不一定资源少，还要乘上每趟的资源。", storyBeat: "给两种车辆各写一张车次和资源账单。"
  }),
  q({
    id: "chapter-09-integrated-modeling-7", level: 7, slot: 7,
    title: "器材分批排班", difficulty: "advanced", answer: "5",
    prompt: "班次表格：74件器材每车最多运9件，每天安排2车次，最后不足9件仍要安排车次。至少需要几天？",
    conditionRoles: ["equipment-total", "trip-capacity", "trips-per-day", "partial-trip-rule"],
    structureFamily: "remainder-quotient-scheduling", representation: "table", questionDirection: "find-parameter",
    supportingConcepts: ["remainder-scheduling"], strategyChoices: ["先算车次再算天数"],
    solution: { strategy: "两次向上取整排班法", summary: "74件分成9件一车要9车次，每天2车次，要5天。", steps: [
      s("最后一车器材", "remainder", [74, 9], 2, "74除以9余2，最后一车还有2件也要安排。"),
      s("所需车次", "ceilDivide", [74, 9], 9, "74件按每车9件向上取整，共要9车次。"),
      s("答案", "ceilDivide", ["$所需车次", 2], 5, "9车次按每天2车次向上取整，需要5天。")
    ] },
    verification: { strategy: "用四天和五天的容量验算", summary: "每天最多18件，4天只能运72件，5天才够运74件。", steps: [
      s("每天最大运输量", "multiply", [2, 9], 18, "每天2车次、每车9件，最多运18件。"),
      s("四天运输量", "multiply", [4, "$每天最大运输量"], 72, "4天最多只能运72件。"),
      s("四天还差器材", "subtract", [74, "$四天运输量"], 2, "4天还差2件，不能完成。"),
      s("验算答案", "ceilDivide", [74, "$每天最大运输量"], 5, "74件按每天18件向上取整，确实要5天。")
    ] },
    commonPitfall: "余下2件也要占用一次车次，不能只数装满的车。", storyBeat: "先把每天的最大运输量看成18件。"
  }),
  q({
    id: "chapter-09-integrated-modeling-8", level: 8, slot: 8,
    title: "大小箱总容量", difficulty: "challenge", answer: "176",
    prompt: "条形图表示大箱比小箱多3个，两种箱共17个；大箱每个装12瓶，小箱每个装8瓶。一共能装多少瓶？",
    conditionRoles: ["box-total", "box-difference", "large-box-capacity", "small-box-capacity"],
    structureFamily: "sum-difference-capacity", representation: "bar-model", questionDirection: "find-parameter",
    supportingConcepts: ["sum-difference"], strategyChoices: ["先由和差求箱数", "再按容量合计"], transfer: "boss-integration",
    solution: { strategy: "和差分组后计算容量", summary: "小箱7个、大箱10个，容量是56瓶加120瓶，共176瓶。", steps: [
      s("去掉箱数差", "subtract", [17, 3], 14, "总数去掉大箱多出的3个，剩下14个可平均分。"),
      s("小箱个数", "divide", ["$去掉箱数差", 2], 7, "14平均分成两份，小箱有7个。"),
      s("大箱个数", "add", ["$小箱个数", 3], 10, "大箱比小箱多3个，所以有10个。"),
      s("大箱容量", "multiply", ["$大箱个数", 12], 120, "10个大箱每个装12瓶，共120瓶。"),
      s("小箱容量", "multiply", ["$小箱个数", 8], 56, "7个小箱每个装8瓶，共56瓶。"),
      s("答案", "add", ["$大箱容量", "$小箱容量"], 176, "120瓶加56瓶，一共能装176瓶。")
    ] },
    verification: { strategy: "先由和加差求大箱数验算", summary: "大箱10个、小箱7个，箱数合计17个且相差3个，容量共176瓶。", steps: [
      s("加上箱数差", "add", [17, 3], 20, "总数加上大箱多出的3个，得到20。"),
      s("大箱个数复算", "divide", ["$加上箱数差", 2], 10, "20平均分成两份，大箱有10个。"),
      s("大箱容量复算", "multiply", ["$大箱个数复算", 12], 120, "10个大箱装120瓶。"),
      s("小箱个数复算", "subtract", [17, "$大箱个数复算"], 7, "17个箱中去掉10个大箱，小箱有7个。"),
      s("小箱容量复算", "multiply", ["$小箱个数复算", 8], 56, "7个小箱装56瓶。"),
      s("验算答案", "add", ["$大箱容量复算", "$小箱容量复算"], 176, "两类容量合起来还是176瓶。")
    ] },
    commonPitfall: "先求出两种箱的个数，不能把17个箱都按同一种容量计算。", storyBeat: "用条形图先补齐多出的3个大箱。"
  }),
  q({
    id: "chapter-09-integrated-modeling-9", level: 9, slot: 9,
    title: "两种补给箱的最省方案", difficulty: "challenge", answer: "86",
    prompt: "补给表格：甲箱装8瓶需20元，乙箱装5瓶需13元。必须买5箱且至少有34瓶水。满足两项条件的最少花费是多少元？",
    conditionRoles: ["exact-box-count", "minimum-bottles", "type-a-capacity-cost", "type-b-capacity-cost"],
    structureFamily: "two-constraint-optimization", representation: "table", questionDirection: "compare-plans",
    supportingConcepts: ["integer-optimization", "capacity-constraint"], strategyChoices: ["枚举满足数量的组合", "比较总价"], transfer: "boss-integration",
    solution: { strategy: "列出达标组合后取最小价", summary: "3甲2乙正好34瓶花86元；4甲1乙花93元，5甲花100元，最少86元。", steps: [
      s("三甲装水", "multiply", [3, 8], 24, "3个甲箱装24瓶。"),
      s("两乙装水", "multiply", [2, 5], 10, "2个乙箱装10瓶。"),
      s("三甲两乙总水", "add", ["$三甲装水", "$两乙装水"], 34, "3甲2乙共34瓶，刚好达标。"),
      s("三甲花费", "multiply", [3, 20], 60, "3个甲箱花60元。"),
      s("两乙花费", "multiply", [2, 13], 26, "2个乙箱花26元。"),
      s("三甲两乙总价", "add", ["$三甲花费", "$两乙花费"], 86, "3甲2乙一共花86元。"),
      s("四甲一乙甲价", "multiply", [4, 20], 80, "4个甲箱花80元。"),
      s("四甲一乙总价", "add", ["$四甲一乙甲价", 13], 93, "4甲1乙一共花93元。"),
      s("五甲总价", "multiply", [5, 20], 100, "5个甲箱一共花100元。"),
      s("答案", "min", ["$三甲两乙总价", "$四甲一乙总价", "$五甲总价"], 86, "达标的三种组合中，86元最少。")
    ] },
    verification: { strategy: "从不足组合和替换成本验算", summary: "2甲3乙只有31瓶不达标；从3甲2乙起，每多1个甲箱替换1个乙箱多花7元，所以86元最少。", steps: [
      s("两甲装水", "multiply", [2, 8], 16, "2个甲箱装16瓶。"),
      s("三乙装水", "multiply", [3, 5], 15, "3个乙箱装15瓶。"),
      s("两甲三乙总水", "add", ["$两甲装水", "$三乙装水"], 31, "2甲3乙只有31瓶，达不到34瓶。"),
      s("一甲替一乙多装", "subtract", [8, 5], 3, "把一个乙箱换成甲箱，会多装3瓶。"),
      s("一甲替一乙多花", "subtract", [20, 13], 7, "同样替换一次会多花7元。"),
      s("三甲两乙容量复算", "add", [24, 10], 34, "从2甲3乙替换一次后，水量达到34瓶。"),
      s("三甲两乙价格复算", "sum", [20, 20, 20, 13, 13], 86, "3个20元和2个13元相加，是86元。"),
      s("四甲一乙价格复算", "sum", [20, 20, 20, 20, 13], 93, "再替换一次要多花7元，成为93元。"),
      s("五甲价格复算", "sum", [20, 20, 20, 20, 20], 100, "继续替换后5甲要100元。"),
      s("验算答案", "min", ["$三甲两乙价格复算", "$四甲一乙价格复算", "$五甲价格复算"], 86, "所有达标组合中，86元仍是最小值。")
    ] },
    commonPitfall: "既要满足5箱，又要满足至少34瓶；只比较单价或只比较瓶数都不够。", storyBeat: "先排除水量不足的组合，再比较每个达标组合的总价。"
  }),
  q({
    id: "chapter-09-integrated-modeling-10", level: 10, slot: 10,
    title: "杯赛彩带总工时", difficulty: "challenge", answer: "11",
    prompt: "杯赛布置表格：3.6米彩带每段剪15厘米，甲组每分钟剪3段并先剪4分钟，乙组每分钟剪2段，负责把全部彩带每5段装一盒，每盒装好需1分钟。所有彩带都剪完后才能开始装盒，剪裁和装盒不能同时进行。乙组开始后到全部完成至少几分钟？",
    conditionRoles: ["ribbon-length-conversion", "segment-length", "first-stage-rate-time", "second-stage-rate", "packing-capacity-time"],
    structureFamily: "cup-entry-three-concept-boss", representation: "table", questionDirection: "find-parameter",
    supportingConcepts: ["unit-conversion", "work-rate", "capacity", "cup-entry"], strategyChoices: ["先统一单位", "分阶段求剪裁时间", "容量向上取整"], transfer: "boss-integration",
    solution: { strategy: "换算、接力和装盒综合法", summary: "共24段，甲组剪12段，乙组剪余下12段要6分钟；全部剪完后再装5盒要5分钟，串行共11分钟。", steps: [
      s("彩带总厘米数", "multiply", [3.6, 100], 360, "3.6米换成360厘米。"),
      s("彩带总段数", "divide", ["$彩带总厘米数", 15], 24, "360厘米每段15厘米，共能剪24段。"),
      s("甲组段数", "multiply", [3, 4], 12, "甲组每分钟3段，4分钟剪12段。"),
      s("乙组剩余段数", "subtract", ["$彩带总段数", "$甲组段数"], 12, "24段去掉甲组的12段，乙组还要剪12段。"),
      s("乙组剪裁时间", "divide", ["$乙组剩余段数", 2], 6, "乙组每分钟剪2段，剪12段要6分钟。"),
      s("最后一盒段数", "remainder", ["$彩带总段数", 5], 4, "24段除以5余4，最后一盒装4段也要花时间。"),
      s("装盒数", "ceilDivide", ["$彩带总段数", 5], 5, "24段每盒5段向上取整，要装5盒。"),
      s("答案", "add", ["$乙组剪裁时间", "$装盒数"], 11, "剪裁和装盒不能同时进行，乙组剪6分钟后再装5盒用5分钟，共11分钟。")
    ] },
    verification: { strategy: "按剪裁全部结束后再装盒的顺序验算", summary: "乙组若用11分钟，先剪6分钟得12段；全部24段剪完后再用5分钟装5盒，两个阶段串行相加。", steps: [
      s("乙组剪裁分钟", "subtract", [11, 5], 6, "从候选11分钟中先扣掉装5盒的5分钟，剪裁有6分钟。"),
      s("乙组剪出段数", "multiply", ["$乙组剪裁分钟", 2], 12, "乙组6分钟每分钟2段，剪出12段。"),
      s("全部段数复算", "add", [12, "$乙组剪出段数"], 24, "甲组12段加乙组12段，正好24段。"),
      s("全部彩带厘米数复算", "multiply", ["$全部段数复算", 15], 360, "24段每段15厘米，正好用360厘米彩带。"),
      s("四盒容量", "multiply", [4, 5], 20, "4盒只能装20段，不够装24段。"),
      s("装盒容量", "multiply", [5, 5], 25, "5盒每盒5段，能装下24段。"),
      s("验算答案", "add", ["$乙组剪裁分钟", 5], 11, "剪裁全部结束后才能装盒，6分钟剪裁和5分钟装盒不能重叠，合计11分钟。")
    ] },
    commonPitfall: "乙组的时间既包括剪剩余彩带，也包括最后不足一盒时的装盒时间。", storyBeat: "像杯赛现场排任务一样，先统一长度，再接力剪裁，最后安排装盒。"
  })
]);

module.exports = INTEGRATED_MODELING_GOLD_QUESTIONS;
