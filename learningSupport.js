(function attachLearningSupport(root) {
  const explicitSupport = {
    "patterns-1": {
      hints: ["先看每次相邻两项相差多少。", "4 到 7、7 到 10、10 到 13 都是同一个变化。"],
      solutionSteps: ["计算相邻差：7-4=3，10-7=3，13-10=3。", "确认规律是每次加 3。", "13+3=16。"],
      commonMistakes: ["只看到 10 和 13 就猜 15。", "忘记把答案放回数列检查。"]
    },
    "patterns-2": {
      hints: ["这些数不是等差数列，试着想一想平方数。", "1、4、9、16 分别是谁的平方？"],
      solutionSteps: ["把数列写成 1²、2²、3²、4²。", "下一项应是 5²。", "5²=25。"],
      commonMistakes: ["误以为每次增加固定数字。", "只看差 3、5、7，却没有继续找到下一差是 9。"]
    },
    "patterns-3": {
      hints: ["观察每一项和前一项的倍数关系。", "6 是 3 的 2 倍，12 是 6 的 2 倍。"],
      solutionSteps: ["发现规律：每次乘 2。", "24×2=48。", "检查：3、6、12、24、48 都是翻倍。"],
      commonMistakes: ["把翻倍看成加 3、加 6、加 12 后忘记继续翻倍。"]
    },
    "sum-diff-1": {
      hints: ["和差问题可以用公式：较大数=(和+差)÷2。", "这里和是 16，差是 2。"],
      solutionSteps: ["把和与差相加：16+2=18。", "较大的数=18÷2=9。", "检查：另一个数是 7，9+7=16，9-7=2。"],
      commonMistakes: ["把较大数公式和较小数公式混淆。", "算出 9 后没有检查和、差是否都满足。"]
    },
    "sum-diff-3": {
      hints: ["甲比乙多，乙就是较小数。", "较小数=(和-差)÷2。"],
      solutionSteps: ["和是 30，差是 6。", "较小数乙=(30-6)÷2=12。", "检查：甲是 18，18+12=30，18-12=6。"],
      commonMistakes: ["题目问乙，却算成较大的甲。", "忘记先减差再除以 2。"]
    },
    "sum-diff-5": {
      hints: ["把乙看成 1 份，甲就是 2 份。", "甲乙合起来一共有几份？"],
      solutionSteps: ["乙是 1 份，甲是 2 份，总共 3 份。", "18÷3=6，所以乙是 6。", "检查：甲是 12，12+6=18。"],
      commonMistakes: ["看到 2 倍就直接 18÷2。", "没有把总份数算成 1+2。"]
    },
    "geometry-1": {
      hints: ["线段由两个端点确定。", "3 个点中任意选 2 个点。"],
      solutionSteps: ["把 3 个点记作 A、B、C。", "可组成 AB、AC、BC。", "一共有 3 条线段。"],
      commonMistakes: ["把点的个数直接当作线段数。", "漏数两端不相邻的线段 AC。"]
    },
    "geometry-5": {
      hints: ["2×2 方格里不只小正方形。", "还要数由 4 个小正方形组成的大正方形。"],
      solutionSteps: ["先数 1×1 小正方形：4 个。", "再数 2×2 大正方形：1 个。", "总数 4+1=5。"],
      commonMistakes: ["只数小正方形，漏掉大正方形。", "把长方形也误算成正方形。"]
    },
    "logic-1": {
      hints: ["用排除法。", "A、B 都不是第一，还剩谁？"],
      solutionSteps: ["候选人是 A、B、C。", "排除 A 和 B。", "只剩 C，所以第一是 C。"],
      commonMistakes: ["没有列出所有候选人。", "排除后忘记看剩下的人。"]
    },
    "logic-2": {
      hints: ["把快慢关系排成一条线。", "甲比乙快，乙又比丙快。"],
      solutionSteps: ["根据题意：甲 > 乙 > 丙。", "最慢的是排在最后的人。", "所以丙最慢。"],
      commonMistakes: ["把“最快”和“最慢”看反。", "只比较甲乙，忘记继续比较乙丙。"]
    }
  };

  const moduleDefaults = {
    patterns: {
      hints: ["先看相邻两项的差或倍数。", "如果普通规律不明显，再看奇数位和偶数位是否分开变化。"],
      solutionIntro: "找规律题要先写出相邻变化，再按同样规律推出下一项。",
      mistakes: ["只凭感觉猜一个数。", "没有检查整列是否都符合同一个规律。"]
    },
    "sum-diff": {
      hints: ["先判断题目是和差关系还是倍数关系。", "把较小数或一份数设为基准，会更容易。"],
      solutionIntro: "和差倍问题要先找清楚和、差、倍数分别是什么。",
      mistakes: ["题目问小数却算成大数。", "看到倍数就直接除，没有先算总份数或相差份数。"]
    },
    geometry: {
      hints: ["先确定要数的是线段、角、小正方形还是全部正方形。", "可以按大小或起点分类数，避免重复和遗漏。"],
      solutionIntro: "几何计数题要先分类，再逐类相加。",
      mistakes: ["只数一类图形，漏掉更大的组合图形。", "重复数同一个图形。"]
    },
    logic: {
      hints: ["把条件逐条写下来。", "能排除的先排除，能排序的先排序。"],
      solutionIntro: "逻辑推理题要把条件串起来，而不是只看最后一句。",
      mistakes: ["把条件看反。", "只用一个条件就下结论。"]
    }
  };

  const genericDefault = {
    hints: ["先圈出题目中的关键词和数量关系。", "把已知条件转化成一步一步的算式。"],
    solutionIntro: "先读题，再列式，最后把答案代回题目检查。",
    mistakes: ["没有看清题目问的是什么。", "算完后没有回到题目中检查。"]
  };

  function hasContent(values) {
    return Array.isArray(values) && values.length > 0;
  }

  function buildDefaultSupport(module, practice) {
    const defaults = moduleDefaults[module.id] || genericDefault;
    return {
      hints: defaults.hints,
      solutionSteps: [
        defaults.solutionIntro,
        practice.explanation || "根据题目条件列式求解。",
        "把结果代回题目，确认符合所有条件。"
      ],
      commonMistakes: defaults.mistakes
    };
  }

  function mergeSupport(module, practice) {
    const defaults = buildDefaultSupport(module, practice);
    const explicit = explicitSupport[practice.id] || {};
    return {
      ...practice,
      hints: hasContent(practice.hints) ? practice.hints : explicit.hints || defaults.hints,
      solutionSteps: hasContent(practice.solutionSteps) ? practice.solutionSteps : explicit.solutionSteps || defaults.solutionSteps,
      commonMistakes: hasContent(practice.commonMistakes) ? practice.commonMistakes : explicit.commonMistakes || defaults.commonMistakes
    };
  }

  function applySupportToModules(modules = []) {
    return modules.map((module) => ({
      ...module,
      practices: module.practices.map((practice) => mergeSupport(module, practice))
    }));
  }

  function getSupportForPractice(practice = {}) {
    return {
      hints: practice.hints || [],
      solutionSteps: practice.solutionSteps || [],
      commonMistakes: practice.commonMistakes || []
    };
  }

  function hasLearningSupport(practice = {}) {
    const support = getSupportForPractice(practice);
    return hasContent(support.hints) || hasContent(support.solutionSteps) || hasContent(support.commonMistakes);
  }

  const api = {
    applySupportToModules,
    getSupportForPractice,
    hasLearningSupport,
    explicitSupport
  };

  if (Array.isArray(root.MATH_LEARNING_DATA)) {
    root.MATH_LEARNING_DATA = applySupportToModules(root.MATH_LEARNING_DATA);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.LearningSupport = api;
})(typeof window !== "undefined" ? window : globalThis);
