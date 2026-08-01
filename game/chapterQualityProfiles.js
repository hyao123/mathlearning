const PROFILE_BY_MODULE = Object.freeze({
  patterns: Object.freeze({
    objective: "识别并延续数列规律",
    reasoningType: "规律归纳",
    representation: "sequence",
    observation: "把相邻数字逐一比较，先确认每一步到底怎样变化。",
    pitfall: "不要只看最后两个数，要用前面的每一步核对同一条规律。",
    mission: "雷达刻度正在依次亮起",
    goals: ["找出第一组变化", "核对第二组变化", "继续同一规律", "区分加法和乘法", "补全中间刻度", "验证完整扫描序列", "处理两段连续变化", "在任务数据中迁移规律", "检查每一步是否一致", "完成雷达扫描 Boss 校准"]
  }),
  "quick-calculation": Object.freeze({
    objective: "选择合适的简便计算方法",
    reasoningType: "策略选择",
    representation: "equation",
    observation: "先观察数字能否凑整、配对或拆分，再决定计算顺序。",
    pitfall: "简便计算不是跳步骤，凑整后的补偿必须一并算回。",
    mission: "维修台需要快速核对零件数",
    goals: ["找出能凑整的一对", "尝试交换计算顺序", "用拆分减少口算负担", "核对补偿量", "选择最短计算路线", "把两组数量配对", "处理带括号的任务单", "比较两种计算策略", "检查估算是否合理", "完成维修台 Boss 结算"]
  }),
  "arithmetic-series": Object.freeze({
    objective: "用等差数列方法求和",
    reasoningType: "关系建模",
    representation: "sequence",
    observation: "先确认首项、末项和项数，再把首尾配对或使用等差求和关系。",
    pitfall: "项数要包含首项和末项，不能把间隔数直接当成项数。",
    mission: "跑道灯带需要统计全部灯位",
    goals: ["识别等差排列", "找出首项和末项", "数清灯位数量", "完成第一组首尾配对", "计算配对后的总数", "处理奇数个灯位", "核对间隔数和项数", "在路线灯带中迁移方法", "用估算检查总数", "完成灯带 Boss 总检"]
  }),
  periodicity: Object.freeze({
    objective: "利用周期定位重复规律",
    reasoningType: "规律归纳",
    representation: "cycle",
    observation: "先找出最短重复单元，再用除法判断目标位置落在周期的第几项。",
    pitfall: "余数为 0 时对应周期的最后一项，不是第一项。",
    mission: "信号灯正在按固定节奏闪烁",
    goals: ["圈出一个完整周期", "确认周期长度", "定位较小序号", "练习有余数的位置", "处理整除的位置", "比较两个周期", "记录周期边界", "在信号表中迁移定位", "反向检查目标项", "完成信号塔 Boss 定位"]
  }),
  enumeration: Object.freeze({
    objective: "按规则有序枚举结果",
    reasoningType: "分类计数",
    representation: "table",
    observation: "确定一种固定顺序，逐类列举并用表格或清单防止遗漏和重复。",
    pitfall: "没有固定顺序最容易漏项；每列完一类再进入下一类。",
    mission: "补给舱需要列出全部组合",
    goals: ["建立第一张分类表", "按顺序列举少量情况", "检查是否有重复", "补全一类组合", "统计全部结果", "处理附加限制", "交叉核对列表", "在补给方案中迁移枚举", "验证边界情况", "完成补给舱 Boss 清单"]
  }),
  "add-multiply-principle": Object.freeze({
    objective: "区分加法原理和乘法原理",
    reasoningType: "分类计数",
    representation: "tree",
    observation: "互斥的选择用加法，连续独立的步骤用乘法，先判断关系再计算。",
    pitfall: "同一件事不能同时既加又乘；先画出选择过程会更清楚。",
    mission: "导航台正在配置多条路线",
    goals: ["区分两种互斥选择", "识别连续两步选择", "用加法统计分支", "用乘法统计搭配", "比较两种原理", "处理三步路线", "画出路线树", "在导航配置中迁移方法", "核对分支是否重叠", "完成导航台 Boss 配置"]
  }),
  "inclusion-exclusion": Object.freeze({
    objective: "用容斥关系处理重叠计数",
    reasoningType: "分类计数",
    representation: "venn",
    observation: "先分别计算两类数量，再找出重叠部分，最后把重复的一次扣除。",
    pitfall: "重叠部分被两类都算过一次，所以只能扣除一次。",
    mission: "调度屏正在合并两份值班名单",
    goals: ["识别两份名单", "找出重叠成员", "完成一次扣重", "用图表示重叠", "处理已知总数", "检查没有重复扣除", "加入第三个限制", "在调度名单中迁移方法", "反算各类数量", "完成调度屏 Boss 合并"]
  }),
  "sum-diff": Object.freeze({
    objective: "根据和差关系求两个量",
    reasoningType: "关系建模",
    representation: "bar-model",
    observation: "把和与差对应到两个量，较小量等于（和减差）再除以 2。",
    pitfall: "先求出较小量后，还要用和或差检查另一个量。",
    mission: "双雷达需要校准两组读数",
    goals: ["画出和差关系", "求出较小读数", "补出较大读数", "核对和与差", "处理单位变化", "从文字条件提取和差", "比较两种求法", "在雷达校准中迁移方法", "反算验证全部条件", "完成双雷达 Boss 校准"]
  }),
  "unit-rate": Object.freeze({
    objective: "用单位量解决效率问题",
    reasoningType: "关系建模",
    representation: "unit-rate",
    observation: "先把总量平均到 1 份，得到单位量后再按需要的份数计算。",
    pitfall: "单位量要和题目单位一致，不能把时间、数量和路程混在一起。",
    mission: "动力站需要记录每分钟输出",
    goals: ["求出一份的量", "用单位量求少量结果", "处理更多份数", "识别总量和份数", "核对单位", "比较两种速度", "处理剩余量", "在动力记录中迁移方法", "用估算检查效率", "完成动力站 Boss 测试"]
  }),
  "surplus-deficit": Object.freeze({
    objective: "用盈亏关系求总人数或总量",
    reasoningType: "关系建模",
    representation: "bar-model",
    observation: "比较两种分配方案的总差额，再用每份的差额求出对象数量。",
    pitfall: "总差额来自所有对象，先确认是多出还是缺少再列式。",
    mission: "装备库正在调整补给分配",
    goals: ["读懂多出或缺少", "计算两种方案差额", "求出对象数量", "反算总物资", "核对每份差额", "处理不同单位", "比较两套分配", "在装备调度中迁移方法", "检查结果是否整数", "完成装备库 Boss 调配"]
  }),
  "chicken-rabbit": Object.freeze({
    objective: "用假设法解决鸡兔同笼问题",
    reasoningType: "逻辑推理",
    representation: "table",
    observation: "先统一假设为一种对象，再根据脚数差额逐步替换另一种对象。",
    pitfall: "每替换一个对象，脚数变化固定；不要忘记比较的是总脚数差。",
    mission: "巡检站正在识别两类运输机器人",
    goals: ["建立统一假设", "计算总脚数差额", "完成一次替换", "求出第二类数量", "核对两类总数", "处理更大的数据", "用表格整理替换", "在巡检报告中迁移方法", "反向验证脚数", "完成巡检站 Boss 识别"]
  }),
  average: Object.freeze({
    objective: "理解平均数并解决平均问题",
    reasoningType: "关系建模",
    representation: "bar-model",
    observation: "平均数表示均分后的每份量，先确认总量和份数的对应关系。",
    pitfall: "平均数不一定是原数据中的某一个数，不能只找中间值。",
    mission: "飞行日志正在汇总每日数据",
    goals: ["把总量均分", "根据平均数求总量", "比较平均前后变化", "处理补充一条数据", "求缺失数据", "核对份数", "用总量反算平均", "在飞行日志中迁移方法", "检查平均是否在合理范围", "完成飞行日志 Boss 汇总"]
  })
});

const SLOT_PHASES = Object.freeze(["启动", "校准", "推进", "扩展", "整合", "提高", "提高", "迁移", "挑战", "Boss"]);

function createGeneratedProfile(module) {
  const id = module?.id || "math";
  const isDeepSea = /pigeonhole-principle|counting-transfer|motion|engineering|train-bridge|age|efficiency-transfer|tree-planting|geometry|logic|parity/.test(id);
  const isPolar = /angles|triangles|quadrilaterals|perimeter|area|composite-figures|area-units|volume|capacity|surface-area|scale|coordinates-routes/.test(id);
  const isArmor = /algebraic-expressions|equations-unknowns|linear-equations|equation-applications|fraction-modeling|decimal-modeling|percent-basics|discount-tax|profit-loss-modeling|concentration-configuration|savings-interest|supply-integration/.test(id);
  const context = isArmor
    ? { mission: "装甲突击演练正在校准补给、编组与工程数据", representation: "armor-console", reasoningType: /equation|algebra|supply/.test(id) ? "关系建模" : "直接计算" }
    : isPolar
    ? { mission: "极地破冰船正在校准冰原测绘数据", representation: "polar-chart", reasoningType: /angles|triangles|quadrilaterals|coordinates/.test(id) ? "空间想象" : "直接计算" }
    : isDeepSea
    ? { mission: "深海探测艇正在校准任务数据", representation: "mission-log", reasoningType: /logic|parity/.test(id) ? "逻辑推理" : /count|pigeonhole/.test(id) ? "分类计数" : "关系建模" }
    : { mission: "轨道科学站正在整理观测任务", representation: "mission-log", reasoningType: /recurrence|square/.test(id) ? "规律归纳" : /case|plan/.test(id) ? "策略选择" : "关系建模" };
  return {
    objective: `掌握${module?.title || "本专题"}的核心解题方法`,
    reasoningType: context.reasoningType,
    representation: context.representation,
    observation: "先圈出已知数量和要求的结果，再选择与本专题相符的方法逐步计算。",
    pitfall: "不要只计算中间结果；最后要回到题目条件检查单位、数量和所问内容。",
    mission: context.mission,
    goals: SLOT_PHASES.map((phase, index) => `${phase}：完成第 ${index + 1} 个知识线索`)
  };
}

function getQuestionQualityProfile(module, question, slot) {
  const profile = PROFILE_BY_MODULE[module?.id] || createGeneratedProfile(module);
  const safeSlot = Math.min(Math.max(Number(slot) || 1, 1), 10);
  const goal = profile.goals[safeSlot - 1];
  const steps = safeSlot >= 10 ? 4 : safeSlot >= 7 ? 3 : safeSlot >= 3 ? 2 : 1;
  const conditions = safeSlot >= 8 ? 3 : safeSlot >= 4 ? 2 : 1;
  return {
    learningObjective: profile.objective,
    reasoningType: profile.reasoningType,
    difficultyProfile: {
      steps,
      conditions,
      representation: profile.representation,
      direction: safeSlot >= 8 ? "transfer" : "forward",
      transfer: safeSlot >= 10 ? "boss-integration" : safeSlot >= 8 ? "contextual" : "direct"
    },
    storyBeat: `${SLOT_PHASES[safeSlot - 1]}：${profile.mission}。本题任务是${goal}。`,
    solutionReview: {
      observation: profile.observation,
      steps: [
        `任务目标：${goal}。`,
        question.explanation || "按题目条件一步一步计算。"
      ],
      answer: String(question.answer),
      check: "把结果代回题目条件，确认每个数量和单位都吻合。",
      pitfall: profile.pitfall
    }
  };
}

module.exports = { PROFILE_BY_MODULE, getQuestionQualityProfile };
