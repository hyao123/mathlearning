const method = (id, label, reasoningType, representation, prompt, review, pitfall, verification, objective) => Object.freeze({
  id,
  label,
  reasoningType,
  representation,
  prompt,
  review,
  pitfall,
  verification,
  objective
});

const METHODS = Object.freeze([
  method("read-conditions", "审题找条件", "关系建模", "condition-list", "先圈出已知量、变化量和问题目标。", "观察条件→列出已知→确定目标→回读题目。", "只看到数字，没有弄清数字之间的关系。", "把答案代回题目，逐条核对条件。", "从题目中提取有效条件"),
  method("draw-bar-model", "画线段图", "关系建模", "bar-model", "把总量、部分量和差量画成有长短关系的线段。", "画图表示关系→找对应线段→列式→验证总量。", "线段长度不代表真实比例时，不能凭图长短直接计算。", "用线段相加或相减还原题目中的总量。", "用线段图表示数量关系"),
  method("diagram-model", "示意图与数形结合", "空间想象", "diagram", "把文字条件变成位置、形状或数量的示意图。", "画出关键元素→标注已知→寻找形状或数量联系→计算。", "图形没有标清单位或方向，容易把长度和面积混淆。", "用图上的边界、面积或位置关系检查结果。", "用图形帮助理解数量"),
  method("table-method", "列表整理", "分类计数", "table", "用固定顺序把条件逐行记录，避免漏掉或重复。", "确定表头→按顺序列出→逐项筛选→统计结果。", "没有固定顺序时，最容易重复计算或遗漏情况。", "检查每一行是否互斥、每一种情况是否都出现。", "用表格整理复杂条件"),
  method("enumeration-method", "枚举法", "分类计数", "enumeration", "从小到大或按固定顺序逐个尝试所有可能。", "确定范围→逐个列举→排除不合条件→计数或取值。", "只列出几个看起来合理的情况，不能证明没有遗漏。", "检查边界值和总数量，确认枚举完整。", "有序列举所有可能情况"),
  method("tree-diagram", "树状图", "分类计数", "tree", "把连续选择分成一层一层的分支。", "画第一层选择→展开下一层→标记每条路径→相加或相乘。", "不同层级的选择混在一起，容易把加法和乘法用反。", "数清每条完整路径，并检查每个分支是否同样完整。", "用分支表示连续选择"),
  method("assumption-method", "假设法", "逻辑推理", "assumption-table", "先统一假设一种情况，再用差额修正。", "统一假设→计算差额→找每次修正量→求真实数量。", "假设对象和比较的总量不一致，会让差额失去意义。", "把两类数量和总量代回题目检查。", "用统一假设化解混合数量"),
  method("reverse-thinking", "逆向思考", "关系建模", "reverse-chain", "从结果或最后一步开始，逐步倒推到最初状态。", "找最后状态→撤销最后一步→继续倒推→代回正向验证。", "倒推时加减、乘除或顺序弄反。", "把倒推结果重新正向执行一遍。", "从结果反推起点"),
  method("transformation-method", "转化与替换", "关系建模", "equation", "把复杂对象换成更熟悉、更容易计算的等量对象。", "找等量关系→替换复杂部分→完成计算→还原原问题。", "替换后忘记保留原来的数量或单位。", "比较替换前后的总量是否相等。", "把陌生问题转化为熟悉模型"),
  method("unit-method", "归一与单位化", "关系建模", "unit-rate", "先求一份、一米、一天或一件的数量，再按需要扩大。", "统一单位→求单位量→按份数计算→核对单位。", "单位不统一时直接相除，结果会失去意义。", "用单位量乘回份数，检查是否回到总量。", "用单位量建立数量关系"),
  method("estimation-method", "估算与范围", "策略选择", "number-line", "先判断结果大约在哪个范围，再进行精确计算。", "找上限下限→估计数量级→精确计算→比较范围。", "把估算值当成精确答案，或忽略题目的取整要求。", "检查答案是否落在合理范围内。", "用范围快速检查结果"),
  method("verify-eliminate", "验算与排除", "逻辑推理", "checklist", "把候选结果逐条放回条件，排除不符合者。", "列出候选→逐条代入→排除冲突→保留符合项。", "只验证一条条件就提前下结论。", "所有条件都通过后才确认答案。", "用验证和排除确定答案"),
  method("case-discussion", "分类讨论", "逻辑推理", "case-table", "按关键条件分成互不重叠的情况分别处理。", "找分类标准→分别计算→合并结果→检查是否重叠。", "分类标准不互斥，导致同一种情况被算多次。", "检查各类之和是否覆盖全部可能。", "按条件分情况解决问题"),
  method("parity-invariant", "奇偶性与不变量", "逻辑推理", "parity-check", "观察奇偶、余数或始终不变的量，先排除不可能。", "找不变特征→判断变化规律→排除冲突→验证结论。", "只看单个数字的奇偶，没有看操作前后的变化。", "检查每一步操作是否保持相同特征。", "用不变量判断可能性"),
  method("worst-case", "最不利原则", "分类计数", "boundary-case", "先考虑最不理想的取法，再加一步保证目标发生。", "确定不利情况→计算最多还能避免几次→加一步→验证必然性。", "把平均情况当成最不利情况。", "构造一个刚好还不能达成目标的反例。", "用最不利情况证明必然发生"),
  method("recurrence-strategy", "递推思考", "规律归纳", "recurrence", "从前一步推到后一步，记录数量如何连续变化。", "找初始状态→确定变化规则→逐步递推→检查末项。", "递推规则没有覆盖边界或初始状态。", "用前两步反推下一步，检查规则一致。", "用连续变化建立递推关系"),
  method("reverse-reasoning", "逆推与还原", "关系建模", "reverse-chain", "从最终结果反向撤销过程，恢复最初数量。", "确认最后结果→逆用每个操作→恢复初始量→正向复核。", "逆向操作顺序与正向顺序相同，导致还原错误。", "按原顺序正向执行验证。", "逆向恢复连续操作"),
  method("elimination-table", "表格排除", "逻辑推理", "logic-grid", "把人物、位置、物品等条件放入表格逐项排除。", "建立行列→填入确定关系→排除冲突→读取唯一结果。", "把“可能”误写成“确定”，过早排除正确情况。", "检查每个对象是否恰好对应一个位置或属性。", "用表格处理多条件逻辑"),
  method("scheduling", "统筹安排", "策略选择", "schedule", "把有限时间、资源或顺序安排得更高效。", "列出限制→确定先后→比较空档→检查总量。", "只看单个任务最快，没有检查整体是否可行。", "把安排后的每个时间段重新核对。", "在限制条件下安排任务"),
  method("shortest-path", "最短路线", "空间想象", "grid-path", "把路线拆成横向和纵向的必要步数，比较不同方案。", "标出起点终点→计算必要移动→避开障碍→比较路线。", "把绕路步数漏算，或把不能通过的格子算进路线。", "逐步数格并核对每个转弯点。", "用网格和分段求最短路线"),
  method("optimal-strategy", "最优策略", "策略选择", "strategy-tree", "比较多种选择的后续结果，寻找最有利方案。", "列出选择→预测后果→比较指标→选择最优。", "只比较第一步，没有看后续影响。", "用另一种方案复算，确认没有更优结果。", "比较策略并选择最优方案"),
  method("construction", "构造法", "逻辑推理", "construction", "主动设计一个满足所有条件的例子或结构。", "明确目标→逐条满足条件→调整结构→验证全部条件。", "只满足部分条件就停止构造。", "将构造结果逐条代回题目。", "构造满足条件的数量或图形"),
  method("contradiction", "反证启蒙", "逻辑推理", "contradiction", "先假设结论不成立，再寻找与已知条件冲突的地方。", "假设相反结论→推出后果→寻找矛盾→确认原结论。", "矛盾没有来自题目条件，而只是计算出错。", "明确指出冲突条件和冲突结果。", "用矛盾排除不可能结论"),
  method("integrated-strategy", "综合策略", "策略选择", "strategy-board", "根据题目结构组合画图、分类、逆推和验证等方法。", "识别核心关系→选择主方法→组合辅助方法→验证结果。", "方法堆得太多，没有先确定主线。", "用最短步骤重新说明解题路线。", "综合使用多种思维方法"),
  method("decompose-conditions", "多条件拆解", "关系建模", "condition-map", "把长题拆成若干个可计算的小条件。", "分段读题→标记输入输出→连接子问题→计算总结果。", "拆开后丢失小条件之间的联系。", "按原题顺序把各子结果重新串起来。", "拆解复杂生活问题"),
  method("equation-model", "线段图与方程建模", "关系建模", "equation-bar", "用未知数表示量，用等量关系建立方程。", "设未知数→表示相关量→找等量关系→解方程→检验。", "未知数单位和题目单位不一致。", "把未知数代回每个数量关系。", "用方程表达数量关系"),
  method("ratio-model", "比例模型", "关系建模", "ratio-table", "把两个量按同一比例扩大、缩小或比较。", "找对应量→统一比例→列比例表→求未知量。", "对应量位置颠倒，导致比例方向错误。", "用交叉乘积或单位量验证。", "用比例解决实际分配"),
  method("change-model", "变化关系建模", "关系建模", "change-table", "记录一个量变化时另一个量怎样变化。", "列出初始量→记录变化量→建立对应关系→求目标。", "把变化后的量和变化量混为一谈。", "用初值加变化量回代。", "用变化表分析动态问题"),
  method("data-decision", "数据图表决策", "分类计数", "data-chart", "从表格、条形图或折线图中提取证据进行比较。", "读清单位→提取数据→比较指标→作出选择。", "只看一个最高值，忽略总量、平均值或限制。", "用至少两个数据指标支持结论。", "用数据支持生活决策"),
  method("probability-risk", "概率与风险", "逻辑推理", "probability-tree", "列出所有等可能结果，再比较有利结果和总结果。", "确定样本空间→列出有利情况→化成概率→比较风险。", "分母不是全部等可能结果，或重复计算结果。", "检查所有情况概率之和是否为1。", "用概率比较风险"),
  method("geometry-decomposition", "几何分割", "空间想象", "area-decomposition", "把复杂图形拆成几个熟悉图形再求和或相减。", "画辅助线→拆分图形→计算各部分→合并结果。", "拆分部分重叠或漏掉边界。", "用外框面积减去空白或重新拼回原图。", "分割复杂图形进行测量"),
  method("motion-model", "运动与变化建模", "关系建模", "motion-table", "用路程、速度、时间或变化量建立对应关系。", "统一单位→列变化表→找总量关系→计算→回代。", "速度、时间和路程单位不一致。", "用速度×时间检查总路程。", "用模型描述运动过程"),
  method("compare-plans", "方案比较", "策略选择", "comparison-table", "把多个方案的成本、数量、时间或效果放入同一张表比较。", "统一比较单位→列出指标→计算总值→选择方案。", "不同方案的计算口径不一致。", "用同一条件重新计算两种方案。", "比较生活中的不同方案"),
  method("optimization", "最优配置", "策略选择", "optimization", "在总量、预算或空间有限时寻找最合适的配置。", "明确限制→列出配置→计算效果→比较最优。", "只追求一个指标，忽略其他限制条件。", "检查最优方案是否满足所有限制。", "在限制下寻找最优方案"),
  method("result-verification", "结果验证", "逻辑推理", "verification", "用估算、代回、逆向或单位检查结果。", "选择验证方法→代回条件→检查范围和单位→确认答案。", "只重复原来的计算，不能发现原来的错误。", "使用不同于原解法的方式验证。", "用多种方式确认结果"),
  method("integrated-modeling", "综合生活建模", "关系建模", "integrated-model", "把真实情境转成数量、图表、方程和策略组合。", "读题拆解→选择模型→计算方案→比较验证。", "模型没有对应真实情境，答案失去实际意义。", "解释答案在生活场景中的含义和单位。", "综合解决真实生活问题")
]);

const METHOD_BY_ID = Object.freeze(Object.fromEntries(METHODS.map((entry) => [entry.id, entry])));
const CHAPTER_METHOD_IDS = Object.freeze({
  "chapter-07": Object.freeze(["read-conditions", "draw-bar-model", "diagram-model", "table-method", "enumeration-method", "tree-diagram", "assumption-method", "reverse-thinking", "transformation-method", "unit-method", "estimation-method", "verify-eliminate"]),
  "chapter-08": Object.freeze(["case-discussion", "parity-invariant", "worst-case", "recurrence-strategy", "reverse-reasoning", "elimination-table", "scheduling", "shortest-path", "optimal-strategy", "construction", "contradiction", "integrated-strategy"]),
  "chapter-09": Object.freeze(["decompose-conditions", "equation-model", "ratio-model", "change-model", "data-decision", "probability-risk", "geometry-decomposition", "motion-model", "compare-plans", "optimization", "result-verification", "integrated-modeling"])
});

const LEGACY_METHOD_BY_MODULE = Object.freeze({
  patterns: "verify-eliminate",
  "quick-calculation": "estimation-method",
  "arithmetic-series": "transformation-method",
  periodicity: "verify-eliminate",
  enumeration: "enumeration-method",
  "add-multiply-principle": "tree-diagram",
  "inclusion-exclusion": "case-discussion",
  "sum-diff": "draw-bar-model",
  "unit-rate": "unit-method",
  "surplus-deficit": "assumption-method",
  "chicken-rabbit": "assumption-method",
  average: "unit-method"
});

const LEGACY_METHOD_PATTERNS = Object.freeze([
  [/pigeonhole|worst-case/, "worst-case"],
  [/tree-counting|add-multiply/, "tree-diagram"],
  [/enumeration|counting|inclusion/, "enumeration-method"],
  [/motion|engineering|train|age|efficiency|tree-planting|work-problems|unitary|savings|interest/, "unit-method"],
  [/geometry|angles|triangles|quadrilateral|perimeter|area|volume|capacity|surface|scale|coordinate/, "diagram-model"],
  [/logic|parity|divisibility|factors|prime|restoration|case-analysis/, "verify-eliminate"],
  [/ratio|percent|discount|tax|profit|concentration|proportion|pricing/, "ratio-model"],
  [/data|frequency|chart|mean|median|mode|range|statistics/, "data-decision"],
  [/possibility|probability/, "probability-risk"],
  [/recurrence|square-array/, "recurrence-strategy"]
]);

function getThinkingMethod(methodId) {
  return METHOD_BY_ID[methodId] || null;
}

function getChapterMethodIds(chapterId) {
  return [...(CHAPTER_METHOD_IDS[chapterId] || [])];
}

function getMethodForModule(module) {
  const methodId = module?.thinkingMethodId
    || LEGACY_METHOD_BY_MODULE[module?.id]
    || LEGACY_METHOD_PATTERNS.find(([pattern]) => pattern.test(String(module?.id || "")))?.[1];
  return getThinkingMethod(methodId) || getThinkingMethod("read-conditions");
}

module.exports = { METHODS, CHAPTER_METHOD_IDS, getThinkingMethod, getChapterMethodIds, getMethodForModule };
