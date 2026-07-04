(function attachLearningEffectEnhancements(root) {
  const genericHintKey = "先圈出题目中的关键词和数量关系。|把已知条件转化成一步一步的算式。";

  const strandProfiles = {
    numberTheory: {
      strand: "数论与整除",
      phase: "入门模型 -> 标准题型 -> 变式迁移 -> 综合应用",
      methodChoices: ["整除特征", "因数倍数", "余数周期", "质因数分解"],
      modules: [
        "factors-multiples",
        "prime-factorization",
        "base-systems-intro",
        "congruence-intro",
        "square-numbers",
        "remainders",
        "factor-count",
        "parity-divisibility",
        "divisibility",
        "primes",
        "gcd-lcm",
        "parity",
        "digit-sum"
      ]
    },
    counting: {
      strand: "计数与组合",
      phase: "有序枚举 -> 分类分步 -> 去重补漏 -> 组合迁移",
      methodChoices: ["有序枚举", "加法原理", "乘法原理", "容斥", "抽屉原理"],
      modules: [
        "enumeration",
        "add-multiply-principle",
        "inclusion-exclusion",
        "pigeonhole-principle",
        "counting-transfer",
        "pigeonhole-intro",
        "counting-principles",
        "enumeration-strategy",
        "combinatorics-intro",
        "inclusion-exclusion-intro"
      ]
    },
    quantity: {
      strand: "数量关系建模",
      phase: "数量翻译 -> 份数线段 -> 假设修正 -> 应用迁移",
      methodChoices: ["线段图", "份数法", "假设法", "方程思路", "列表比较"],
      modules: [
        "sum-diff",
        "unit-rate",
        "surplus-deficit",
        "chicken-rabbit",
        "age",
        "ratio-proportion",
        "tiered-pricing",
        "unitary-method",
        "restoration-problems",
        "application",
        "profit-loss",
        "profit-loss-advanced",
        "age-problems",
        "concentration-problems"
      ]
    },
    change: {
      strand: "变化与效率",
      phase: "单位量 -> 速度效率 -> 相对变化 -> 统筹优化",
      methodChoices: ["速度关系", "效率和", "单位量", "相对速度", "列表统筹"],
      modules: [
        "average",
        "motion",
        "engineering",
        "train-bridge",
        "efficiency-transfer",
        "work-problems",
        "scheduling-intro",
        "travel-problems",
        "grass-eating-intro",
        "average-problems",
        "capacity-volume-intro"
      ]
    },
    logicStrategy: {
      strand: "逻辑与策略",
      phase: "条件整理 -> 分类讨论 -> 极端构造 -> 策略证明",
      methodChoices: ["排除法", "分类讨论", "反向推理", "最坏情况", "极端构造"],
      modules: [
        "logic",
        "plan-design",
        "case-analysis-intro",
        "truth-lie-logic",
        "custom-operations",
        "optimization-strategy",
        "extreme-value",
        "reverse-thinking",
        "logic-fill-intro"
      ]
    },
    space: {
      strand: "图形与空间",
      phase: "点线间隔 -> 图形计数 -> 面积转化 -> 空间迁移",
      methodChoices: ["点线间隔", "分类计数", "图形分割", "整体减局部", "平移转化"],
      modules: [
        "tree-planting",
        "geometry",
        "geometry-counting",
        "square-array",
        "chart-reading",
        "chart-patterns-advanced",
        "planting-trees",
        "coloring-covering",
        "geometry-numbers-intro"
      ]
    },
    observation: {
      strand: "观察与周期",
      phase: "观察变化 -> 凑整结构 -> 周期定位 -> 规律迁移",
      methodChoices: ["相邻差", "分组观察", "凑整", "周期余数", "配对求和"],
      modules: ["patterns", "quick-calculation", "arithmetic-series", "periodicity", "cycle-patterns", "recurrence-intro", "clock-problems", "number-grids", "mental-math-tricks"]
    }
  };

  const profileByModuleId = Object.values(strandProfiles).reduce((map, profile) => {
    profile.modules.forEach((moduleId) => {
      map[moduleId] = profile;
    });
    return map;
  }, {});

  const gradePath = {
    "二年级": ["patterns", "quick-calculation", "sum-diff", "logic", "periodicity"],
    "三年级": ["enumeration", "unit-rate", "tree-planting", "average", "geometry"],
    "四年级": ["inclusion-exclusion", "pigeonhole-principle", "surplus-deficit", "motion", "factors-multiples"],
    "五年级": ["ratio-proportion", "engineering", "train-bridge", "combinatorics-intro", "extreme-value"],
    "六年级": ["congruence-intro", "gcd-lcm", "custom-operations", "truth-lie-logic", "optimization-strategy"]
  };

  const coreModuleIds = new Set([
    "patterns",
    "sum-diff",
    "unit-rate",
    "surplus-deficit",
    "motion",
    "engineering",
    "ratio-proportion",
    "geometry",
    "enumeration",
    "inclusion-exclusion",
    "pigeonhole-principle",
    "logic"
  ]);

  const workUnitModuleIds = new Set([
    "engineering",
    "work-problems",
    "efficiency-transfer"
  ]);

  const allowedFallbackModuleIds = [];

  const remediationPolicies = {
    restrictedTags: {
      "work-unit": Array.from(workUnitModuleIds)
    }
  };

  const moduleMethodProfiles = {
    "unit-rate": {
      methodChoices: ["单位量", "列表比较", "方程思路", "线段图"],
      recommendedMethod: "单位量",
      acceptedMethods: ["单位量", "列表比较", "方程思路"]
    },
    "motion": {
      methodChoices: ["速度关系", "相对速度", "线段图", "列表比较"],
      recommendedMethod: "速度关系",
      acceptedMethods: ["速度关系", "相对速度", "线段图"]
    },
    "engineering": {
      methodChoices: ["效率和", "单位量", "列表统筹", "方程思路"],
      recommendedMethod: "效率和",
      acceptedMethods: ["效率和", "单位量", "方程思路"]
    },
    "train-bridge": {
      methodChoices: ["速度关系", "相对速度", "画图分析", "列表比较"],
      recommendedMethod: "速度关系",
      acceptedMethods: ["速度关系", "相对速度", "画图分析"]
    },
    "ratio-proportion": {
      methodChoices: ["份数法", "比例关系", "方程思路", "线段图"],
      recommendedMethod: "份数法",
      acceptedMethods: ["份数法", "比例关系", "方程思路"]
    }
  };

  const remediationCatalog = {
    "arithmetic-care": {
      title: "计算检查专项",
      action: "先估算范围，再逐步验算关键算式。",
      drills: ["重算原题关键一步", "换一个数字做同模型题", "把答案代回题目检查"]
    },
    "missing-cases": {
      title: "枚举补漏专项",
      action: "使用表格按第一条件分行、第二条件分列，逐格检查。",
      drills: ["列全可能", "划掉不合条件", "数剩余情况"]
    },
    "sum-diff-relation": {
      title: "线段图回炉",
      action: "先画总量，再标出差量，最后判断求大数还是小数。",
      drills: ["画线段图", "写出大数公式", "用和差回代检查"]
    },
    "motion-relative": {
      title: "相对速度判断",
      action: "先判断相向、同向追及还是背向，再决定速度和或速度差。",
      drills: ["圈出运动方向", "写相对速度", "用路程差/总路程列式"]
    },
    "work-unit": {
      title: "工程总量为 1",
      action: "把总工程看成 1，先求每天完成几分之几。",
      drills: ["写单独效率", "写合作效率", "用总量除以效率"]
    },
    "efficiency-sum": {
      title: "效率和专项",
      action: "合作时效率相加，不能把天数直接相加。",
      drills: ["求甲效率", "求乙效率", "求效率和"]
    }
  };

  const profileHints = {
    "数论与整除": {
      hints: ["先判断题目在问整除、因数倍数、余数还是质因数。", "把条件改写成整除关系或余数关系，再决定使用哪个数论工具。"],
      steps: ["识别数论模型。", "写出整除、因数或余数关系。", "用模型检验答案是否满足所有条件。"],
      mistakes: ["只看数字大小，没有判断整除结构。", "把倍数、因数、约数个数混为一谈。"]
    },
    "计数与组合": {
      hints: ["先判断是分类、分步、去重，还是至少保证类问题。", "能列举时先列出小样本，再抽象成计数方法。"],
      steps: ["确定计数对象。", "选择分类、分步、容斥或抽屉模型。", "检查有没有重复或遗漏。"],
      mistakes: ["把分类相加和分步相乘混用。", "没有处理重复计数或漏掉边界情况。"]
    },
    "数量关系建模": {
      hints: ["先找总量、差量、倍数或单价等核心关系。", "能画线段图或份数图时，先把文字翻译成图。"],
      steps: ["圈出关键数量关系。", "建立线段、份数或假设模型。", "把结果代回题目检查。"],
      mistakes: ["直接套算式，没有判断求的是哪一个量。", "把总量、差量和一份数混淆。"]
    },
    "变化与效率": {
      hints: ["先找单位时间内的变化量，例如速度或效率。", "相遇、追及、合作都要先判断变化方向。"],
      steps: ["确定单位量。", "判断速度和、速度差或效率和。", "用总路程、路程差或总工作量列式。"],
      mistakes: ["同向追及用成速度和。", "工程问题把天数直接相加。"]
    },
    "逻辑与策略": {
      hints: ["先把条件逐条列出来，不急着猜结论。", "如果情况很多，先分类或考虑最极端的情况。"],
      steps: ["列出所有可能。", "按条件排除或分类。", "说明为什么剩下的情况必然成立。"],
      mistakes: ["只用一个条件就下结论。", "没有验证所有情况。"]
    },
    "图形与空间": {
      hints: ["先判断要数点、线段、间隔、面积还是图形个数。", "按大小、位置或起点分类，避免重复和遗漏。"],
      steps: ["明确计数或转化对象。", "按结构分类处理。", "检查是否重复、遗漏或边界算错。"],
      mistakes: ["把点数当成间隔数。", "只数小图形，漏掉组合图形。"]
    },
    "观察与周期": {
      hints: ["先看相邻变化、分组变化或周期重复。", "如果出现循环，先找周期长度，再用余数定位。"],
      steps: ["找出稳定变化规则。", "判断是递推、凑整、配对还是周期。", "把答案放回规则中检查。"],
      mistakes: ["只看最后两项就猜答案。", "周期题忘记处理余数为 0 的情况。"]
    }
  };

  function getProfile(module) {
    return profileByModuleId[module.id] || {
      strand: "综合迁移",
      phase: "模型识别 -> 多步整合 -> 迁移验证",
      methodChoices: ["模型识别", "分类讨论", "画图分析", "列表比较"]
    };
  }

  function getTransferLevel(practice) {
    if (practice.difficulty === "基础") return "标准题";
    if (practice.difficulty === "进阶") return "仿练题";
    if (practice.difficulty === "提高") return "变式题";
    return "迁移题";
  }

  function getMethodProfile(module, profile) {
    const override = moduleMethodProfiles[module.id] || {};
    const methodChoices = override.methodChoices || profile.methodChoices;
    const recommendedMethod = override.recommendedMethod || methodChoices[0] || "";
    const acceptedMethods = Array.from(new Set(override.acceptedMethods || [recommendedMethod])).filter((method) => methodChoices.includes(method));
    return {
      methodChoices,
      recommendedMethod,
      acceptedMethods: acceptedMethods.length > 0 ? acceptedMethods : [recommendedMethod].filter(Boolean)
    };
  }

  function buildLearningPlan(module, profile) {
    const methodProfile = getMethodProfile(module, profile);
    return {
      targetGrades: (module.grades || []).filter((grade) => grade !== "一年级"),
      targetSkill: `${profile.strand}中的${module.title}模型`,
      phase: profile.phase,
      goals: [
        `识别${module.title}的核心条件和题型信号。`,
        `选择合适的${methodProfile.methodChoices.slice(0, 2).join("或")}方法。`,
        "能把答案代回题目，说明为什么成立。"
      ],
      masteryCriteria: [
        "基础和进阶题连续做对 3 题。",
        "能说出至少 1 个常见错因。",
        "遇到变式题时能先选对方法再计算。"
      ],
      nextAbility: "进入相邻模型的混合判断与迁移练习。"
    };
  }

  function buildExampleFading(module) {
    if (!coreModuleIds.has(module.id)) return [];
    const example = module.examples?.[0];
    const practice = module.practices?.[0];
    if (!example || !practice) return [];
    return [
      {
        type: "完整例题",
        prompt: example.question,
        support: example.analysis
      },
      {
        type: "半完成例题",
        prompt: `${example.question} 先写出题型信号，再补出关键算式。`,
        support: "保留模型判断，让学生补关键步骤。"
      },
      {
        type: "仿练题",
        prompt: practice.prompt,
        support: "数字或情境变化，核心结构保持不变。"
      },
      {
        type: "迁移提醒",
        prompt: "换一种问法时，先判断模型是否仍然相同。",
        support: "要求学生说明为什么选择这个方法。"
      }
    ];
  }

  function enhancePractice(practice, module, profile) {
    const hints = (practice.hints || []).join("|") === genericHintKey ? profileHints[profile.strand]?.hints || practice.hints : practice.hints;
    const support = profileHints[profile.strand] || {};
    const methodProfile = getMethodProfile(module, profile);
    const remediationTags = Array.from(new Set([
      ...(practice.mistakeTags || []),
      ...(workUnitModuleIds.has(module.id) ? ["work-unit"] : [])
    ])).filter((tag) => {
      const allowedModuleIds = remediationPolicies.restrictedTags[tag];
      return remediationCatalog[tag] && (!allowedModuleIds || allowedModuleIds.includes(module.id));
    });
    return {
      ...practice,
      hints,
      solutionSteps: (practice.solutionSteps || []).length > 0 && (practice.hints || []).join("|") !== genericHintKey ? practice.solutionSteps : support.steps || practice.solutionSteps,
      commonMistakes: (practice.commonMistakes || []).length > 0 && (practice.hints || []).join("|") !== genericHintKey ? practice.commonMistakes : support.mistakes || practice.commonMistakes,
      tieredHints: [
        `题型识别：先判断它属于${profile.strand}中的哪一种模型。`,
        `模型提示：优先尝试${methodProfile.methodChoices.slice(0, 2).join("或")}。`,
        `关键步骤：把答案代回题目，检查条件是否全部满足。`
      ],
      methodChoices: methodProfile.methodChoices,
      recommendedMethod: methodProfile.recommendedMethod,
      acceptedMethods: methodProfile.acceptedMethods,
      targetSkill: `${module.title}模型识别`,
      modelType: profile.strand,
      transferLevel: getTransferLevel(practice),
      diagnosticGoal: practice.difficulty === "挑战" ? "检验迁移能力和方法选择" : "检验模型识别和标准解法",
      remediationTags
    };
  }

  function buildMixedReviewSets(modules) {
    return Object.values(strandProfiles).map((profile) => {
      const strandModules = modules.filter((module) => getProfile(module).strand === profile.strand);
      return {
        strand: profile.strand,
        title: `${profile.strand}阶段小测`,
        methodChoices: profile.methodChoices,
        moduleIds: strandModules.map((module) => module.id),
        practiceIds: strandModules.flatMap((module) => module.practices.slice(0, 2).map((practice) => practice.id)).slice(0, 12),
        requirements: ["先选方法", "再列式作答", "最后说明错因或检查方式"]
      };
    });
  }

  function enhanceModule(module, index) {
    const profile = getProfile(module);
    const learningPlan = buildLearningPlan(module, profile);
    const topology = module.knowledgeTopology || {};
    return {
      ...module,
      knowledgeTopology: {
        ...topology,
        strand: profile.strand,
        stage: topology.stage || learningPlan.phase.split(" -> ")[0],
        order: index + 1,
        whyNow: topology.whyNow || `这是${profile.strand}路线中的${learningPlan.phase.split(" -> ")[0]}阶段。`,
        continuity: topology.continuity || `学完后进入${learningPlan.nextAbility}`
      },
      mathEssence: {
        ...(module.mathEssence || {}),
        bigIdea: module.mathEssence?.bigIdea && !module.mathEssence.bigIdea.includes("具体题目")
          ? module.mathEssence.bigIdea
          : `${module.title}的本质是把题目条件归入${profile.strand}模型，再选择合适方法解释为什么成立。`,
        essentialQuestion: module.mathEssence?.essentialQuestion || `这道题应该用${profile.methodChoices.join("、")}中的哪一种方法？`
      },
      learningPlan,
      exampleFading: buildExampleFading(module),
      practices: (module.practices || []).map((practice) => enhancePractice(practice, module, profile))
    };
  }

  function applyLearningEffectEnhancements(modules = []) {
    const enhanced = modules.map(enhanceModule);
    root.LEARNING_EFFECT_REVIEW_SETS = buildMixedReviewSets(enhanced);
    root.LEARNING_EFFECT_GRADE_PATH = gradePath;
    return enhanced;
  }

  const api = {
    applyLearningEffectEnhancements,
    genericHintKey,
    gradePath,
    allowedFallbackModuleIds,
    profileByModuleId,
    remediationCatalog,
    remediationPolicies,
    strandProfiles
  };

  if (Array.isArray(root.MATH_LEARNING_DATA)) {
    root.MATH_LEARNING_DATA = applyLearningEffectEnhancements(root.MATH_LEARNING_DATA);
  }

  root.LearningEffectEnhancements = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
