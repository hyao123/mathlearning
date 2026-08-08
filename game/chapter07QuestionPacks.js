const { createPack } = require("./methodQuestionPackFactory.js");

const topics = Object.freeze([
  { id: "read-conditions", title: "审题与提取条件", methodId: "read-conditions" },
  { id: "draw-bar-model", title: "线段图", methodId: "draw-bar-model" },
  { id: "diagram-model", title: "示意图与数形结合", methodId: "diagram-model" },
  { id: "table-method", title: "列表整理", methodId: "table-method" },
  { id: "enumeration-method", title: "枚举法", methodId: "enumeration-method" },
  { id: "tree-diagram", title: "树状图", methodId: "tree-diagram" },
  { id: "assumption-method", title: "假设法", methodId: "assumption-method" },
  { id: "reverse-thinking", title: "逆向思考", methodId: "reverse-thinking" },
  { id: "transformation-method", title: "转化与替换", methodId: "transformation-method" },
  { id: "unit-method", title: "归一与单位化", methodId: "unit-method" },
  { id: "estimation-method", title: "估算与范围", methodId: "estimation-method" },
  { id: "verify-eliminate", title: "验算与排除", methodId: "verify-eliminate" }
]);

const { chapterModules } = createPack("chapter-07", topics);
const supplementalQuestionsByModule = Object.freeze(Object.fromEntries(chapterModules.map(({ id }) => [id, []])));
module.exports = { chapterModules, supplementalQuestionsByModule };
