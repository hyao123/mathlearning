// Question Representation Visualizer (Facade & Router)
// Coordinates specialized visualizers across geometry, algebra, discrete, and word problems.

const {
  SVG_NS,
  createSvg,
  parseNumbers,
  safeAddListener,
  createControlBtn,
  safeClassAdd,
  safeClassRemove
} = require("./visualizers/visualizerCore.js");

const {
  renderRouteMap,
  renderDiagram,
  renderGeometryCounting,
  renderAngleVisual,
  renderPolygonVisual,
  renderSolid3DVisual
} = require("./visualizers/geometryVisuals.js");

const {
  renderBarModel,
  renderEquation,
  renderQuickCalcBridge,
  renderParityDivisibilityCard,
  renderEquationBalanceVisual,
  renderFractionPercentVisual,
  renderFactorTreeVisual
} = require("./visualizers/algebraVisuals.js");

const {
  renderTable,
  renderSequenceTrack,
  renderCycleWheel,
  renderVennDiagram,
  renderEnumerationTree,
  renderPigeonholeDrawers,
  renderLogicGrid,
  renderBarChartVisual,
  renderLineChartVisual,
  renderProbabilitySpinnerVisual,
  renderSquareArrayVisual
} = require("./visualizers/discreteVisuals.js");

const {
  renderChickenRabbitPen,
  renderSurplusDeficitBalance,
  renderTreePlantingRoad,
  renderAverageLeveling,
  renderTrainBridgeTrack,
  renderUnitRateScale,
  renderMotionTrack,
  renderAgeDifferenceBar,
  renderEngineeringProgress,
  renderConcentrationVisual,
  renderTieredPricingVisual,
  renderReverseWorkflowVisual,
  renderSchedulingGanttVisual,
  renderPlanDesignVisual,
  renderCaseAnalysisVisual
} = require("./visualizers/wordProblemVisuals.js");

function hasVisualKeywords(prompt, moduleId) {
  if (moduleId && !["direct", "text"].includes(moduleId)) return true;
  const keywords = [
    "数列", "循环", "周期", "鸡", "兔", "两轮", "四轮", "三轮", "轮子", "硬币",
    "每人", "分", "多", "少", "和是", "差是", "倍", "喜欢", "两项都", "种树",
    "植树", "每隔", "长方形", "正方形", "周长", "火车", "列车", "过桥", "隧道", "平均",
    "算式", "路线", "搭配", "表格", "下表", "第", "列", "行",
    "抽屉", "潮汐", "相向", "追上", "追赶", "线段", "射线", "角", "方格", "泊位", "代号", "奇数", "偶数", "整除"
  ];
  return keywords.some((kw) => prompt.includes(kw));
}

/**
 * 题目主视觉入口：解析题干与数学思维模型，返回形象化图解/动画容器
 */
function createQuestionVisual(question, options = {}) {
  if (!question || typeof question !== "object") return null;
  const prompt = question.prompt || "";
  let moduleId = question.moduleId || question.thinkingMethodId || "";
  if (!moduleId && question.id && typeof question.id === "string") {
    const m = question.id.match(/(?:chapter-\d+-)?([a-z-]+?)(?:-(?:advance|improve|challenge))?-\d+$/);
    moduleId = m ? m[1] : question.id.replace(/-\d+$/, "");
  }
  const rep = question.representation;
  const typicalModel = question.typicalModel || question.difficultyProfile?.representation || "";

  let visual = null;

  // 1. 显式指定的几何/图表契约（高优先级保留原测例）
  if (rep === "route-map") {
    visual = renderRouteMap(question, options) || renderTable(question, options);
  } else if (rep === "table") {
    visual = renderTable(question, options);
  } else if (rep === "bar-model") {
    visual = renderBarModel(question, options);
  } else if (rep === "equation") {
    visual = renderEquation(question, options);
  } else if (rep === "diagram") {
    visual = renderDiagram(question, options) || renderPolygonVisual(question, options) || renderRouteMap(question, options);
  } else if (rep === "sequence") {
    visual = renderSequenceTrack(question, options);
  } else if (rep === "cycle") {
    visual = renderCycleWheel(question, options);
  } else if (rep === "venn") {
    visual = renderVennDiagram(question, options);
  } else if (rep === "tree") {
    visual = renderEnumerationTree(question, options);
  } else if (rep === "unit-rate") {
    visual = renderUnitRateScale(question, options);
  } else if (rep === "text" && !hasVisualKeywords(prompt, moduleId)) {
    // 2. 针对纯文字且无数学建模特征的题目严格返回 null（满足单元测试契约）
    return null;
  } else if (
    // 3. 路线地图与网格坐标 (Route Map & Coordinates)
    ["coordinates-routes", "shortest-path"].includes(moduleId) ||
    prompt.includes("坐标点") ||
    prompt.includes("最短走多少格") ||
    prompt.includes("最少走多少格") ||
    prompt.includes("沿水平和竖直航线走") ||
    (prompt.includes("第") && prompt.includes("列") && prompt.includes("行"))
  ) {
    visual = renderRouteMap(question, options);
  } else if (
    // 4. 比例尺与单位换算 (Scale & Unit Rate)
    moduleId === "scale" ||
    (prompt.includes("图上") && (prompt.includes("实际") || prompt.includes("厘米表示") || prompt.includes("1:")))
  ) {
    visual = renderUnitRateScale(question, options) || renderBarModel(question, options);
  } else if (
    // 5. 方阵问题优先于通用正方形几何（包括正方形边界植树/定位点问题）
    moduleId === "square-array" ||
    prompt.includes("方阵") ||
    prompt.includes("实心方阵") ||
    prompt.includes("空心方阵") ||
    prompt.includes("最外层") ||
    (prompt.includes("正方形") && (prompt.includes("定位点") || prompt.includes("每边放") || (prompt.includes("顶点") && prompt.includes("每边"))))
  ) {
    visual = renderSquareArrayVisual(question, options);
  } else if (
    // 比例问题优先于带“升”的体积几何
    moduleId === "ratio-proportion" ||
    prompt.includes("最简整数比") ||
    (prompt.includes("按") && prompt.includes("分成") && prompt.includes("份"))
  ) {
    visual = renderBarModel(question, options);
  } else if (
    moduleId === "angles" ||
    prompt.includes("内角和") ||
    prompt.includes("补角") ||
    prompt.includes("平角") ||
    prompt.includes("余角") ||
    (prompt.includes("角") && (prompt.includes("度") || prompt.includes("射出")))
  ) {
    visual = renderAngleVisual(question, options);
  } else if (
    (["triangles", "quadrilaterals", "perimeter", "area", "construction"].includes(moduleId) ||
    prompt.includes("三角形") ||
    prompt.includes("梯形") ||
    prompt.includes("平行四边形") ||
    prompt.includes("菱形") ||
    prompt.includes("正方形") ||
    prompt.includes("围栏") ||
    prompt.includes("火柴") ||
    (prompt.includes("长方形") && (prompt.includes("面积") || prompt.includes("宽") || prompt.includes("长")))) &&
    !prompt.includes("定位点") &&
    !prompt.includes("每边放")
  ) {
    visual = renderPolygonVisual(question, options);
  } else if (
    ["volume", "surface-area", "capacity", "area-units"].includes(moduleId) ||
    prompt.includes("长方体") ||
    prompt.includes("正方体") ||
    prompt.includes("棱长") ||
    prompt.includes("表面积") ||
    prompt.includes("体积") ||
    prompt.includes("展开图") ||
    prompt.includes("升") ||
    prompt.includes("毫升")
  ) {
    visual = renderSolid3DVisual(question, options);
  } else if (
    ["composite-figures", "geometry-decomposition"].includes(moduleId) ||
    prompt.includes("阴影") ||
    prompt.includes("组合图形") ||
    prompt.includes("割补") ||
    prompt.includes("圆的面积") ||
    prompt.includes("圆环")
  ) {
    visual = renderPolygonVisual(question, options);
  } else if (
    // 6. 统计与概率模型 (Statistics & Probability Models)
    ["line-charts"].includes(moduleId) ||
    prompt.includes("折线") ||
    prompt.includes("走势") ||
    (prompt.includes("气温") && !prompt.includes("平均"))
  ) {
    visual = renderLineChartVisual(question, options);
  } else if (
    // 平均数优先于天平方程（防止“天平均”误匹配“天平”）
    moduleId === "average" ||
    typicalModel === "average" ||
    (prompt.includes("平均") && parseNumbers(prompt).length >= 3)
  ) {
    visual = renderAverageLeveling(question, options);
  } else if (
    ["data-collection", "frequency-tables", "bar-charts", "data-range", "median-mode", "data-inference", "data-decision"].includes(moduleId) ||
    prompt.includes("条形") ||
    prompt.includes("直方图") ||
    prompt.includes("统计图") ||
    prompt.includes("频数") ||
    prompt.includes("数据")
  ) {
    visual = renderBarChartVisual(question, options);
  } else if (
    ["possibility-basics", "probability-fractions", "probability-risk", "statistics-probability-boss"].includes(moduleId) ||
    prompt.includes("转盘") ||
    prompt.includes("指针") ||
    prompt.includes("可能性") ||
    prompt.includes("摸球") ||
    prompt.includes("概率")
  ) {
    visual = renderProbabilitySpinnerVisual(question, options);
  } else if (
    // 7. 代数、方程与天平等量代换 (Algebra, Equation & Transformation Models)
    // 注意排除“3天平均”等词中的“天平”子串
    ["algebraic-expressions", "equations-unknowns", "linear-equations", "equation-applications", "equation-model", "transformation-method"].includes(moduleId) ||
    (prompt.includes("天平") && !prompt.includes("天平均")) ||
    prompt.includes("方程") ||
    prompt.includes("未知数") ||
    prompt.includes("等式") ||
    prompt.includes("能换") ||
    prompt.includes("替换成等量")
  ) {
    visual = renderEquationBalanceVisual(question, options);
  } else if (
    // 8. 分数、百分比、折扣与浓度 (Fraction, Percent & Concentration)
    moduleId === "concentration-configuration" ||
    prompt.includes("浓度") ||
    prompt.includes("盐水") ||
    prompt.includes("糖水") ||
    prompt.includes("溶质") ||
    prompt.includes("溶液") ||
    prompt.includes("加水稀释")
  ) {
    visual = renderConcentrationVisual(question, options);
  } else if (
    ["fraction-modeling", "decimal-modeling", "percent-basics", "discount-tax", "profit-loss-modeling"].includes(moduleId) ||
    prompt.includes("折") ||
    prompt.includes("百分之") ||
    prompt.includes("%") ||
    prompt.includes("利润") ||
    prompt.includes("税率") ||
    prompt.includes("分率")
  ) {
    visual = renderFractionPercentVisual(question, options);
  } else if (
    // 9. 方案设计与最优化决策 (Plan Design & Optimization)
    ["plan-design", "compare-plans"].includes(moduleId) ||
    prompt.includes("甲方案") ||
    prompt.includes("最优方案") ||
    (prompt.includes("方案") && (prompt.includes("较省") || prompt.includes("相差多少元"))) ||
    (prompt.includes("每袋") || prompt.includes("每盒") || prompt.includes("每箱"))
  ) {
    visual = renderPlanDesignVisual(question, options);
  } else if (
    // 10. 经济方案、阶梯分段与最优化 (Tiered Pricing & Optimization)
    ["tiered-pricing", "optimization"].includes(moduleId) ||
    prompt.includes("阶梯") ||
    prompt.includes("分段计费") ||
    prompt.includes("出租车") ||
    prompt.includes("起步价") ||
    prompt.includes("电费") ||
    prompt.includes("水费")
  ) {
    visual = renderTieredPricingVisual(question, options);
  } else if (
    // 11. 数论与质因数 (Number Theory & Factors)
    ["factors-multiples", "prime-factorization"].includes(moduleId) ||
    prompt.includes("最大公因数") ||
    prompt.includes("最小公倍数") ||
    prompt.includes("质因数") ||
    prompt.includes("因数") ||
    prompt.includes("短除") ||
    prompt.includes("互质")
  ) {
    visual = renderFactorTreeVisual(question, options);
  } else if (
    // 12. 逆向思维与还原回溯 (Reverse Thinking & Restoration)
    ["reverse-thinking", "reverse-reasoning", "restoration-problems"].includes(moduleId) ||
    prompt.includes("倒推") ||
    prompt.includes("还原") ||
    prompt.includes("原来有多少") ||
    prompt.includes("原数是")
  ) {
    visual = renderReverseWorkflowVisual(question, options);
  } else if (
    // 13. 统筹优化与排队甘特图 (Scheduling & Pipeline)
    ["scheduling", "optimal-strategy", "integrated-strategy"].includes(moduleId) ||
    prompt.includes("统筹") ||
    prompt.includes("烙饼") ||
    prompt.includes("沏茶") ||
    prompt.includes("排队") ||
    prompt.includes("最短时间") ||
    prompt.includes("同时进行")
  ) {
    visual = renderSchedulingGanttVisual(question, options);
  } else if (
    // 14. 鸡兔同笼优先于火车追及（避免“两轮型与四轮型补给车”被火车抢走）
    moduleId === "chicken-rabbit" ||
    moduleId === "assumption-method" ||
    (prompt.includes("鸡") && prompt.includes("兔")) ||
    (prompt.includes("轮") && (prompt.includes("车") || prompt.includes("三轮") || prompt.includes("两轮型") || prompt.includes("四轮型") || prompt.includes("轮型")))
  ) {
    visual = renderChickenRabbitPen(question, options);
  } else if (
    moduleId === "pigeonhole-principle" ||
    moduleId === "pigeonhole-intro" ||
    moduleId === "worst-case" ||
    typicalModel === "pigeonhole" ||
    prompt.includes("抽屉") ||
    prompt.includes("至少取出") ||
    prompt.includes("同一种颜色") ||
    prompt.includes("潮汐卡") ||
    prompt.includes("出生在同一个月份") ||
    (prompt.includes("放进") && prompt.includes("至少有一个")) ||
    prompt.includes("余数相同")
  ) {
    visual = renderPigeonholeDrawers(question, options);
  } else if (
    moduleId === "train-bridge" ||
    prompt.includes("火车") ||
    prompt.includes("列车") ||
    (prompt.includes("补给车") && (prompt.includes("追") || prompt.includes("列车") || prompt.includes("米/秒") || prompt.includes("车尾"))) ||
    prompt.includes("过桥") ||
    prompt.includes("隧道") ||
    prompt.includes("穿过") ||
    prompt.includes("车尾相距")
  ) {
    visual = renderTrainBridgeTrack(question, options);
  } else if (
    moduleId === "motion" ||
    moduleId === "motion-model" ||
    typicalModel === "motion" ||
    prompt.includes("相向而行") ||
    prompt.includes("几分钟相遇") ||
    prompt.includes("几小时相遇") ||
    prompt.includes("追上乙") ||
    prompt.includes("下潜") ||
    prompt.includes("航行") ||
    (prompt.includes("相距") && (prompt.includes("相向") || prompt.includes("相遇")))
  ) {
    visual = renderMotionTrack(question, options);
  } else if (
    moduleId === "geometry-counting" ||
    (moduleId === "geometry" && (prompt.includes("直线上") || prompt.includes("方格") || prompt.includes("正方形") || prompt.includes("长方形") || prompt.includes("角") || prompt.includes("三角形"))) ||
    typicalModel === "geometry-counting" ||
    prompt.includes("条线段") ||
    prompt.includes("形成多少个角") ||
    prompt.includes("多少个三角形") ||
    prompt.includes("方格图中") ||
    prompt.includes("方格中一共有多少个") ||
    prompt.includes("排成一行")
  ) {
    visual = renderGeometryCounting(question, options);
  } else if (
    ["case-analysis-intro", "case-discussion"].includes(moduleId) ||
    prompt.includes("分类讨论") ||
    prompt.includes("按奇偶分类") ||
    (prompt.includes("某题分") && prompt.includes("类")) ||
    (prompt.includes("情况") && prompt.includes("共几"))
  ) {
    visual = renderCaseAnalysisVisual(question, options);
  } else if (
    moduleId === "logic" ||
    ["elimination-table", "contradiction", "verify-eliminate"].includes(moduleId) ||
    typicalModel === "logic" ||
    prompt.includes("泊位") ||
    prompt.includes("最快") ||
    prompt.includes("最慢") ||
    prompt.includes("最重") ||
    prompt.includes("说法正确") ||
    prompt.includes("代号是多少") ||
    prompt.includes("排在第") ||
    (prompt.includes("1、2、3") && prompt.includes("不是第"))
  ) {
    visual = renderLogicGrid(question, options);
  } else if (
    moduleId === "age" ||
    typicalModel === "age" ||
    (prompt.includes("岁") && (prompt.includes("年龄") || prompt.includes("比") || prompt.includes("倍") || prompt.includes("大几岁") || prompt.includes("今年")))
  ) {
    visual = renderAgeDifferenceBar(question, options);
  } else if (
    moduleId === "engineering" ||
    moduleId === "efficiency-transfer" ||
    moduleId === "supply-integration" ||
    moduleId === "integrated-modeling" ||
    typicalModel === "engineering" ||
    (prompt.includes("完成") && (prompt.includes("单独") || prompt.includes("合作") || prompt.includes("工程") || prompt.includes("任务")))
  ) {
    visual = renderEngineeringProgress(question, options);
  } else if (
    moduleId === "parity-divisibility" ||
    moduleId === "parity-invariant" ||
    typicalModel === "parity" ||
    prompt.includes("奇数") ||
    prompt.includes("偶数") ||
    prompt.includes("整除") ||
    prompt.includes("余几") ||
    prompt.includes("倍数的数有几个") ||
    prompt.includes("开关") ||
    prompt.includes("状态编号")
  ) {
    visual = renderParityDivisibilityCard(question, options);
  } else if (
    moduleId === "patterns" ||
    moduleId === "arithmetic-series" ||
    moduleId === "recurrence-intro" ||
    moduleId === "recurrence-strategy" ||
    moduleId === "change-model" ||
    typicalModel === "sequence" ||
    prompt.includes("数列") ||
    prompt.includes("……排列") ||
    (prompt.includes("依次推进") && parseNumbers(prompt).length >= 3) ||
    (prompt.includes("原有") && prompt.includes("天后"))
  ) {
    visual = renderSequenceTrack(question, options);
  } else if (
    moduleId === "periodicity" ||
    typicalModel === "cycle" ||
    prompt.includes("循环") ||
    prompt.includes("周期") ||
    prompt.includes("星期")
  ) {
    visual = renderCycleWheel(question, options);
  } else if (
    moduleId === "surplus-deficit" ||
    (prompt.includes("每人") && (prompt.includes("多") || prompt.includes("少") || prompt.includes("刚好")))
  ) {
    visual = renderSurplusDeficitBalance(question, options);
  } else if (
    moduleId === "quick-calculation" ||
    moduleId === "estimation-method" ||
    ((prompt.includes("简便") || prompt.includes("巧算") || prompt.includes("凑整") || prompt.includes("估算")) && parseNumbers(prompt).length >= 2)
  ) {
    visual = renderQuickCalcBridge(question, options);
  } else if (
    moduleId === "inclusion-exclusion" ||
    typicalModel === "venn" ||
    (prompt.includes("喜欢") && prompt.includes("两项都")) ||
    prompt.includes("两社都") ||
    (prompt.includes("社") && prompt.includes("都参加"))
  ) {
    visual = renderVennDiagram(question, options);
  } else if (
    moduleId === "tree-planting" ||
    typicalModel === "tree-planting" ||
    prompt.includes("种树") ||
    prompt.includes("植树") ||
    prompt.includes("每隔")
  ) {
    visual = renderTreePlantingRoad(question, options);
  } else if (
    moduleId === "unit-rate" ||
    typicalModel === "unit-rate" ||
    (prompt.includes("每") && prompt.includes("照这样"))
  ) {
    visual = renderUnitRateScale(question, options);
  } else if (
    moduleId === "enumeration" ||
    moduleId === "add-multiply-principle" ||
    moduleId === "counting-transfer" ||
    moduleId === "enumeration-method" ||
    typicalModel === "tree" ||
    prompt.includes("搭配") ||
    prompt.includes("没有重复") ||
    prompt.includes("两位数") ||
    prompt.includes("三位数") ||
    prompt.includes("握手") ||
    prompt.includes("照相") ||
    prompt.includes("共有多少种走法") ||
    prompt.includes("有多少种密码") ||
    prompt.includes("有多少种顺序") ||
    prompt.includes("有多少种排法") ||
    prompt.includes("有多少种不同的凑法")
  ) {
    visual = renderEnumerationTree(question, options);
  } else if (
    moduleId === "sum-diff" ||
    moduleId === "ratio-proportion" ||
    moduleId === "ratio-model" ||
    moduleId === "read-conditions" ||
    moduleId === "decompose-conditions" ||
    moduleId === "result-verification" ||
    moduleId === "diagram-model" ||
    typicalModel === "bar-model" ||
    (prompt.includes("和是") && prompt.includes("差是")) ||
    (prompt.includes("大数") && prompt.includes("小数")) ||
    prompt.includes("比") ||
    prompt.includes("小方格") ||
    prompt.includes("份")
  ) {
    visual = renderBarModel(question, options);
  } else if (typicalModel === "table" || prompt.includes("表格") || prompt.includes("下表")) {
    visual = renderTable(question, options);
  } else if (prompt.includes("长方形") || prompt.includes("正方形") || prompt.includes("周长")) {
    visual = renderDiagram(question, options);
  }

  // 状态修饰类注入，确保 CSS 防泄题与复盘卡片精准生效
  if (visual) {
    if (options.status === "retry") {
      visual.classList.add("is-retry");
    } else if (options.status === "resolved") {
      visual.classList.add("is-resolved");
    } else if (options.status === "active") {
      visual.classList.add("is-active");
    }
  }

  return visual;
}

const QuestionVisualizer = {
  createQuestionVisual,
  renderRouteMap,
  renderTable,
  renderBarModel,
  renderEquation,
  renderDiagram,
  renderSequenceTrack,
  renderCycleWheel,
  renderChickenRabbitPen,
  renderSurplusDeficitBalance,
  renderQuickCalcBridge,
  renderVennDiagram,
  renderTreePlantingRoad,
  renderAverageLeveling,
  renderTrainBridgeTrack,
  renderUnitRateScale,
  renderEnumerationTree,
  renderPigeonholeDrawers,
  renderMotionTrack,
  renderGeometryCounting,
  renderLogicGrid,
  renderAgeDifferenceBar,
  renderEngineeringProgress,
  renderParityDivisibilityCard,
  renderAngleVisual,
  renderPolygonVisual,
  renderSolid3DVisual,
  renderBarChartVisual,
  renderLineChartVisual,
  renderProbabilitySpinnerVisual,
  renderEquationBalanceVisual,
  renderFractionPercentVisual,
  renderConcentrationVisual,
  renderSquareArrayVisual,
  renderTieredPricingVisual,
  renderFactorTreeVisual,
  renderReverseWorkflowVisual,
  renderSchedulingGanttVisual,
  renderPlanDesignVisual,
  renderCaseAnalysisVisual,
  SVG_NS,
  createSvg,
  parseNumbers,
  safeAddListener,
  createControlBtn,
  safeClassAdd,
  safeClassRemove
};

if (typeof globalThis !== "undefined") {
  globalThis.QuestionVisualizer = QuestionVisualizer;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = QuestionVisualizer;
}
