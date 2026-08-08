const { createPack } = require("./methodQuestionPackFactory.js");

const topics = Object.freeze([
  { id: "decompose-conditions", title: "多条件拆解", methodId: "decompose-conditions" },
  { id: "equation-model", title: "线段图与方程建模", methodId: "equation-model" },
  { id: "ratio-model", title: "比例模型", methodId: "ratio-model" },
  { id: "change-model", title: "变化关系建模", methodId: "change-model" },
  { id: "data-decision", title: "数据图表决策", methodId: "data-decision" },
  { id: "probability-risk", title: "概率与风险", methodId: "probability-risk" },
  { id: "geometry-decomposition", title: "几何分割", methodId: "geometry-decomposition" },
  { id: "motion-model", title: "运动与变化建模", methodId: "motion-model" },
  { id: "compare-plans", title: "方案比较", methodId: "compare-plans" },
  { id: "optimization", title: "最优配置", methodId: "optimization" },
  { id: "result-verification", title: "结果验证", methodId: "result-verification" },
  { id: "integrated-modeling", title: "综合生活建模 Boss", methodId: "integrated-modeling" }
]);

const { chapterModules } = createPack("chapter-09", topics);
const supplementalQuestionsByModule = Object.freeze(Object.fromEntries(chapterModules.map(({ id }) => [id, []])));
module.exports = { chapterModules, supplementalQuestionsByModule };
