const { createPack } = require("./methodQuestionPackFactory.js");

const topics = Object.freeze([
  { id: "case-discussion", title: "分类讨论", methodId: "case-discussion" },
  { id: "parity-invariant", title: "奇偶性与不变量", methodId: "parity-invariant" },
  { id: "worst-case", title: "最不利原则", methodId: "worst-case" },
  { id: "recurrence-strategy", title: "递推思考", methodId: "recurrence-strategy" },
  { id: "reverse-reasoning", title: "逆推与还原", methodId: "reverse-reasoning" },
  { id: "elimination-table", title: "表格排除", methodId: "elimination-table" },
  { id: "scheduling", title: "统筹安排", methodId: "scheduling" },
  { id: "shortest-path", title: "最短路线", methodId: "shortest-path" },
  { id: "optimal-strategy", title: "最优策略", methodId: "optimal-strategy" },
  { id: "construction", title: "构造法", methodId: "construction" },
  { id: "contradiction", title: "反证启蒙", methodId: "contradiction" },
  { id: "integrated-strategy", title: "综合策略 Boss", methodId: "integrated-strategy" }
]);

const { chapterModules } = createPack("chapter-08", topics);
const supplementalQuestionsByModule = Object.freeze(Object.fromEntries(chapterModules.map(({ id }) => [id, []])));
module.exports = { chapterModules, supplementalQuestionsByModule };
