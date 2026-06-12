(function attachKnowledgeTopology(root) {
  const strandOrder = [
    "观察与周期",
    "计数与集合",
    "数量关系",
    "变化与效率",
    "空间与离散结构",
    "逻辑推理"
  ];

  const learningStrands = [
    {
      id: "observation",
      title: "观察与周期",
      purpose: "先学会发现结构，再用周期和位置关系表达规律。",
      moduleIds: ["patterns", "periodicity"]
    },
    {
      id: "counting",
      title: "计数与集合",
      purpose: "从不重不漏的枚举进入集合重叠和容斥思想。",
      moduleIds: ["enumeration", "inclusion-exclusion"]
    },
    {
      id: "quantity",
      title: "数量关系",
      purpose: "用线段、份数、差量和假设建立应用题模型。",
      moduleIds: ["sum-diff", "unit-rate", "surplus-deficit", "chicken-rabbit", "age"]
    },
    {
      id: "change",
      title: "变化与效率",
      purpose: "把数量关系放到时间、速度和平均变化中理解。",
      moduleIds: ["average", "motion"]
    },
    {
      id: "space-discrete",
      title: "空间与离散结构",
      purpose: "理解点、线、间隔、边界和图形转化。",
      moduleIds: ["tree-planting", "geometry"]
    },
    {
      id: "logic",
      title: "逻辑推理",
      purpose: "用条件、排除和验证把多个知识点组织成严密推理。",
      moduleIds: ["logic"]
    }
  ];

  const topologyByModule = {
    patterns: {
      strand: "观察与周期",
      stage: "结构观察",
      order: 10,
      prerequisiteIds: [],
      nextIds: ["periodicity", "enumeration"],
      whyNow: "找规律是奥数学习的入口，训练孩子从表面数字中发现稳定结构。",
      continuity: "先会观察变化，才能理解周期、枚举和后续模型中的结构化思考。"
    },
    periodicity: {
      strand: "观察与周期",
      stage: "余数定位",
      order: 20,
      prerequisiteIds: ["patterns"],
      nextIds: ["enumeration", "tree-planting"],
      whyNow: "周期问题把“重复规律”推进到“用余数定位”，是从观察走向抽象表达的关键一步。",
      continuity: "余数思想会在日期、排列、循环路线和分组计数中不断出现。"
    },
    enumeration: {
      strand: "计数与集合",
      stage: "不重不漏",
      order: 30,
      prerequisiteIds: ["patterns"],
      nextIds: ["inclusion-exclusion", "logic"],
      whyNow: "枚举训练有序思考，是后续计数、逻辑和组合问题的基础。",
      continuity: "先能完整列出可能，再学习如何处理重复和重叠。"
    },
    "inclusion-exclusion": {
      strand: "计数与集合",
      stage: "处理重叠",
      order: 40,
      prerequisiteIds: ["enumeration"],
      nextIds: ["logic"],
      whyNow: "容斥解决“重复计算”的问题，把枚举升级为集合计数。",
      continuity: "理解重叠后，孩子能更好处理统计、调查和复杂分类问题。"
    },
    "sum-diff": {
      strand: "数量关系",
      stage: "和差份数",
      order: 50,
      prerequisiteIds: [],
      nextIds: ["unit-rate", "surplus-deficit", "age"],
      whyNow: "和差倍是应用题建模的核心入口，帮助孩子把文字关系转成线段和份数。",
      continuity: "份数、差量和总量会继续支撑盈亏、年龄、鸡兔和行程问题。"
    },
    "unit-rate": {
      strand: "数量关系",
      stage: "单位量",
      order: 60,
      prerequisiteIds: ["sum-diff"],
      nextIds: ["average", "motion"],
      whyNow: "归一归总让孩子先找到一份量或单位效率，是应用题迁移能力的桥梁。",
      continuity: "单位量思想会直接连接平均数、速度、效率和工程类问题。"
    },
    "surplus-deficit": {
      strand: "数量关系",
      stage: "差量比较",
      order: 70,
      prerequisiteIds: ["sum-diff"],
      nextIds: ["chicken-rabbit"],
      whyNow: "盈亏问题把两种方案进行比较，强化差量和补偿思想。",
      continuity: "差量修正正是鸡兔同笼假设法的前置思想。"
    },
    "chicken-rabbit": {
      strand: "数量关系",
      stage: "假设修正",
      order: 80,
      prerequisiteIds: ["surplus-deficit", "sum-diff"],
      nextIds: ["logic"],
      whyNow: "鸡兔同笼把差量思想发展为假设法，是从算术应用题走向代数思维的关键模型。",
      continuity: "假设—比较—修正的思路可以迁移到车辆、邮票、得分和混合问题。"
    },
    average: {
      strand: "变化与效率",
      stage: "总量均分",
      order: 90,
      prerequisiteIds: ["unit-rate"],
      nextIds: ["motion"],
      whyNow: "平均数帮助孩子理解总量与份数的关系，并为速度、效率打基础。",
      continuity: "平均不是简单取中间，而是把总量重新均分。"
    },
    motion: {
      strand: "变化与效率",
      stage: "相对变化",
      order: 100,
      prerequisiteIds: ["unit-rate", "average"],
      nextIds: ["logic"],
      whyNow: "行程问题把单位量放进时间变化中，训练速度、路程、时间之间的模型化关系。",
      continuity: "相遇和追及的核心是距离如何被共同缩短或用速度差缩短。"
    },
    age: {
      strand: "数量关系",
      stage: "不变量",
      order: 110,
      prerequisiteIds: ["sum-diff"],
      nextIds: ["logic"],
      whyNow: "年龄问题突出年龄差不变，帮助孩子建立时间平移中的不变量意识。",
      continuity: "不变量意识会迁移到几何、周期、追及和逻辑推理。"
    },
    "tree-planting": {
      strand: "空间与离散结构",
      stage: "点与间隔",
      order: 120,
      prerequisiteIds: ["periodicity"],
      nextIds: ["geometry"],
      whyNow: "植树问题把长度、点和间隔区分开，是从连续长度走向离散结构的关键。",
      continuity: "点—间隔思想会迁移到钟面、排队、封闭路线和图形边界。"
    },
    geometry: {
      strand: "空间与离散结构",
      stage: "图形转化",
      order: 130,
      prerequisiteIds: ["tree-planting"],
      nextIds: ["logic"],
      whyNow: "几何题训练分割、拼合、边界和面积守恒，是空间结构理解的核心。",
      continuity: "几何中的转化思想会回到数量关系和逻辑证明中。"
    },
    logic: {
      strand: "逻辑推理",
      stage: "综合验证",
      order: 140,
      prerequisiteIds: ["enumeration", "inclusion-exclusion"],
      nextIds: [],
      whyNow: "逻辑推理把条件、可能性和验证整合起来，是综合运用各类模型的终点之一。",
      continuity: "当孩子能说明为什么排除、为什么成立，就从会算走向会论证。"
    }
  };

  function getTopologyForModule(module = {}) {
    const topology = topologyByModule[module.id];
    if (topology) {
      return { ...topology, prerequisiteIds: [...topology.prerequisiteIds], nextIds: [...topology.nextIds] };
    }
    return {
      strand: "综合拓展",
      stage: "模型迁移",
      order: 1000,
      prerequisiteIds: [],
      nextIds: [],
      whyNow: "这是对既有模型的拓展练习，重点是把旧知识迁移到新情境。",
      continuity: "先识别题目中的核心关系，再连接到已经学过的模型。"
    };
  }

  function getModuleTitleById(modules, moduleId) {
    return modules.find((module) => module.id === moduleId)?.title || moduleId;
  }

  function enrichModule(module, modules) {
    const topology = getTopologyForModule(module);
    return {
      ...module,
      knowledgeTopology: {
        ...topology,
        prerequisiteTitles: topology.prerequisiteIds.map((id) => getModuleTitleById(modules, id)),
        nextTitles: topology.nextIds.map((id) => getModuleTitleById(modules, id))
      }
    };
  }

  function orderModulesByTopology(modules = []) {
    return [...modules].sort((left, right) => {
      const leftTopology = getTopologyForModule(left);
      const rightTopology = getTopologyForModule(right);
      return leftTopology.order - rightTopology.order || left.title.localeCompare(right.title, "zh-CN");
    });
  }

  function applyKnowledgeTopology(modules = []) {
    const ordered = orderModulesByTopology(modules);
    return ordered.map((module) => enrichModule(module, ordered));
  }

  const api = {
    applyKnowledgeTopology,
    getTopologyForModule,
    knowledgeTopologyByModule: topologyByModule,
    learningStrands,
    orderModulesByTopology,
    strandOrder
  };

  if (Array.isArray(root.MATH_LEARNING_DATA)) {
    root.MATH_LEARNING_DATA = applyKnowledgeTopology(root.MATH_LEARNING_DATA);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.KnowledgeTopology = api;
})(typeof window !== "undefined" ? window : globalThis);
