(function attachMathEssence(root) {
  const defaultEssence = {
    bigIdea: "把具体题目翻译成数量关系，再用稳定的数学模型解决。",
    essentialQuestion: "这道题里哪些量是不变的？哪些量在变化？它们之间有什么关系？",
    coreModels: ["数量关系", "等量关系", "分类讨论"],
    representations: ["画图", "列表", "列式"],
    transferTips: ["先说清楚每个数表示什么，再列式。", "遇到新题型时，先找不变量和对应关系。"],
    misconceptions: ["只记公式，不理解公式来自哪里。", "看到相似题就套步骤，忽略条件变化。"],
    progression: ["读懂情境", "抽象数量关系", "选择模型", "解释答案"]
  };

  const essenceByModule = {
    patterns: {
      bigIdea: "规律题的本质是寻找“变化中的不变规则”。不是猜下一个数，而是解释为什么它必须这样变。",
      essentialQuestion: "相邻项、隔项或位置编号之间，是否存在稳定的变化规则？",
      coreModels: ["等差变化", "等比变化", "隔项分组", "位置与数值的对应"],
      representations: ["差值表", "位置编号表", "奇偶位分组", "箭头变化图"],
      transferTips: ["先算相邻差，再看差是否也有规律。", "如果相邻看不出规律，就按奇数位、偶数位分组。"],
      misconceptions: ["只凭最后两个数猜答案。", "只找一个能凑出答案的规律，不检查前面所有项。"],
      progression: ["观察数列", "记录变化", "验证规则", "推广到下一项"]
    },
    "sum-diff": {
      bigIdea: "和差倍问题的本质是“把两个量拉回到同一把尺子上比较”。和表示总量，差表示不平衡，倍表示份数结构。",
      essentialQuestion: "题目给的是总量、差量还是倍数？能不能把未知量看成若干份？",
      coreModels: ["线段图", "份数模型", "和差模型", "倍数模型"],
      representations: ["线段图", "份数条", "等量关系式"],
      transferTips: ["有倍数先画份数，有和差先找大数和小数。", "先判断要求大数、小数还是一份量。"],
      misconceptions: ["把差当成一份。", "求较小数时误用 (和 + 差) ÷ 2。"],
      progression: ["识别关系", "画线段", "找一份", "还原未知量"]
    },
    geometry: {
      bigIdea: "几何题的本质是研究图形中长度、面积、角度之间的不变关系。先看结构，再算数值。",
      essentialQuestion: "这个图形能否分割、拼合或转化成熟悉图形？哪些边、角或面积保持不变？",
      coreModels: ["分割与拼合", "周长模型", "面积模型", "对称与等量"],
      representations: ["标边图", "辅助线", "面积分割图"],
      transferTips: ["复杂图形先拆成熟悉图形。", "周长看边界，面积看覆盖区域，不要混淆。"],
      misconceptions: ["把面积和周长公式混用。", "看到缺口就只减面积，忘记周长边界变化。"],
      progression: ["识别图形", "选择公式", "转化结构", "检验单位"]
    },
    logic: {
      bigIdea: "逻辑推理的本质是用确定条件不断缩小可能性。关键不是猜结论，而是说明排除过程。",
      essentialQuestion: "哪些条件一定成立？哪些可能性会导致矛盾？",
      coreModels: ["列表排除", "真假判断", "对应关系", "分类讨论"],
      representations: ["表格", "条件链", "排除标记"],
      transferTips: ["先找最确定、限制最多的条件。", "每排除一种可能，都要说明依据。"],
      misconceptions: ["凭直觉选一个可能答案。", "只用部分条件，没有检查所有条件。"],
      progression: ["列出可能", "代入条件", "排除矛盾", "验证结论"]
    },
    "tree-planting": {
      bigIdea: "植树问题的本质是区分“点”和“间隔”。数量变化不是由长度直接决定，而是由间隔数和端点规则共同决定。",
      essentialQuestion: "这是直线还是封闭路线？端点是否计入？题目要求点数、间隔数还是总长度？",
      coreModels: ["点-间隔模型", "端点规则", "封闭路线模型", "反求间距"],
      representations: ["点线图", "间隔标记", "端点示意图"],
      transferTips: ["先算间隔数，再根据端点规则调整。", "封闭路线首尾相接，点数通常等于间隔数。"],
      misconceptions: ["把间隔数直接当成棵数。", "所有题都机械加 1。"],
      progression: ["判断路线类型", "求间隔数", "套端点规则", "回答实际对象数量"]
    },
    "chicken-rabbit": {
      bigIdea: "鸡兔同笼的本质是“基准假设 + 差量修正”。先制造一个简单世界，再用差额反推有多少对象被替换。",
      essentialQuestion: "如果全看成同一种对象，会比实际多多少或少多少？每替换一个对象会改变多少？",
      coreModels: ["假设法", "差量修正", "替换模型", "二元分类"],
      representations: ["假设表", "差量表", "对象替换图"],
      transferTips: ["先选低值或高值对象作为统一假设。", "差额 ÷ 每次替换差 = 需要替换的数量。"],
      misconceptions: ["直接用脚数除以 4 或 2。", "算出差额后忘记除以每次替换的差。"],
      progression: ["统一假设", "计算假设总量", "比较实际差额", "反推分类数量"]
    },
    motion: {
      bigIdea: "行程问题的本质是“距离如何随时间积累”。相遇看共同缩短，追及看差距缩短。",
      essentialQuestion: "距离是在增加、减少，还是两者之间的差距在变化？应该用速度和还是速度差？",
      coreModels: ["路程 = 速度 × 时间", "相遇模型", "追及模型", "相对速度"],
      representations: ["线段图", "时间轴", "相对运动图"],
      transferTips: ["相向而行通常用速度和。", "同向追及通常用速度差。", "先找需要消掉的距离。"],
      misconceptions: ["相遇和追及都用速度相加。", "没有先算先行者制造的距离差。"],
      progression: ["确定运动方向", "找初始距离", "求相对速度", "计算时间或路程"]
    },
    age: {
      bigIdea: "年龄问题的本质是“年龄差不变”。每个人同时增长或减少同样的时间，差保持稳定，倍数会变化。",
      essentialQuestion: "题目中真正不变的是年龄差、年龄和，还是某个倍数关系？",
      coreModels: ["年龄差不变", "时间平移", "倍数与差", "和差模型"],
      representations: ["时间轴", "线段图", "份数图"],
      transferTips: ["遇到几年前、几年后，要让所有人一起变化。", "倍数关系出现时，把小年龄看成 1 份。"],
      misconceptions: ["只让一个人的年龄变化。", "用现在的倍数关系判断过去或未来。"],
      progression: ["找年龄差", "定位时间", "建立倍数或和差关系", "反推年数或年龄"]
    },
    average: {
      bigIdea: "平均数的本质是“总量重新均分”。平均数不是简单凑中间，而是总量除以份数。",
      essentialQuestion: "总量是多少？要平均分成几份？有没有新增、减少或分组权重不同？",
      coreModels: ["总量 ÷ 份数", "平均数 × 份数", "补差模型", "加权平均"],
      representations: ["总量条", "均分图", "表格"],
      transferTips: ["复杂平均数先还原总量。", "分组人数或天数不同，不能直接平均两个平均数。"],
      misconceptions: ["把几个平均数直接再平均。", "看到增加 8 就让平均数也增加 8。"],
      progression: ["还原总量", "确认份数", "均分", "解释平均数含义"]
    }
  };

  function cloneEssence(essence) {
    return {
      bigIdea: essence.bigIdea,
      essentialQuestion: essence.essentialQuestion,
      coreModels: [...essence.coreModels],
      representations: [...essence.representations],
      transferTips: [...essence.transferTips],
      misconceptions: [...essence.misconceptions],
      progression: [...essence.progression]
    };
  }

  function getEssenceForModule(module = {}) {
    return cloneEssence(essenceByModule[module.id] || defaultEssence);
  }

  function applyMathEssenceToModules(modules = []) {
    return modules.map((module) => ({
      ...module,
      mathEssence: module.mathEssence || getEssenceForModule(module)
    }));
  }

  function hasMathEssence(module = {}) {
    const essence = module.mathEssence || getEssenceForModule(module);
    return Boolean(
      essence.bigIdea &&
        essence.essentialQuestion &&
        Array.isArray(essence.coreModels) &&
        essence.coreModels.length > 0 &&
        Array.isArray(essence.representations) &&
        essence.representations.length > 0 &&
        Array.isArray(essence.transferTips) &&
        essence.transferTips.length > 0 &&
        Array.isArray(essence.misconceptions) &&
        essence.misconceptions.length > 0 &&
        Array.isArray(essence.progression) &&
        essence.progression.length > 0
    );
  }

  const api = {
    applyMathEssenceToModules,
    defaultEssence,
    essenceByModule,
    getEssenceForModule,
    hasMathEssence
  };

  if (Array.isArray(root.MATH_LEARNING_DATA)) {
    root.MATH_LEARNING_DATA = applyMathEssenceToModules(root.MATH_LEARNING_DATA);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MathEssence = api;
})(typeof window !== "undefined" ? window : globalThis);
