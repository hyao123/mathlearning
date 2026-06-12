(function attachConceptAnimations(root) {
  const defaultAnimation = {
    id: "generic-model",
    title: "把题目翻译成模型",
    sceneType: "flow",
    intro: "先读懂情境，再找数量关系，最后把关系转成可计算的模型。",
    steps: [
      {
        label: "读题",
        narration: "先圈出题目中的对象、条件和问题，不急着列式。",
        tokens: ["对象", "条件", "问题"]
      },
      {
        label: "建模",
        narration: "找到不变量、总量、差量或对应关系，把文字翻译成模型。",
        tokens: ["不变量", "总量", "关系"]
      },
      {
        label: "计算",
        narration: "用模型列式计算，并回到题目情境解释答案。",
        tokens: ["列式", "计算", "解释"]
      }
    ]
  };

  const animationsByModule = {
    patterns: {
      id: "patterns-difference",
      title: "差值如何揭示规律",
      sceneType: "bars",
      intro: "规律题不是猜答案，而是让相邻变化变得可见。",
      steps: [
        { label: "原数列", narration: "先把每一项按顺序摆出来。", values: [4, 7, 10, 13], highlightIndex: 0 },
        { label: "看变化", narration: "比较相邻两项，发现每次都增加 3。", values: [4, 7, 10, 13], deltas: [3, 3, 3], highlightIndex: 2 },
        { label: "推下一项", narration: "稳定变化继续保持，13 再加 3 得到 16。", values: [4, 7, 10, 13, 16], deltas: [3, 3, 3, 3], highlightIndex: 4 }
      ]
    },
    periodicity: {
      id: "periodicity-remainder",
      title: "余数定位周期位置",
      sceneType: "cycle",
      intro: "周期问题的关键是把长序列压缩成一组重复结构。",
      steps: [
        { label: "找周期", narration: "红、黄、蓝 3 个一组重复。", cycle: ["红", "黄", "蓝"], target: 20, activeIndex: 0 },
        { label: "除以周期", narration: "20 ÷ 3 = 6 余 2，只需要看余数 2。", cycle: ["红", "黄", "蓝"], target: 20, quotient: 6, remainder: 2, activeIndex: 1 },
        { label: "定位答案", narration: "余 2 表示落在每组第 2 个，所以是黄色。", cycle: ["红", "黄", "蓝"], target: 20, quotient: 6, remainder: 2, activeIndex: 1 }
      ]
    },
    enumeration: {
      id: "enumeration-tree",
      title: "有序枚举做到不重不漏",
      sceneType: "tree",
      intro: "枚举不是随便列，而是固定顺序逐层选择。",
      steps: [
        { label: "先选十位", narration: "十位可以选 4、5、6，共 3 种。", levels: [["4", "5", "6"]], activeLevel: 0 },
        { label: "再选个位", narration: "十位确定后，个位从剩下 2 个数字里选。", levels: [["4", "5", "6"], ["剩 2 种", "剩 2 种", "剩 2 种"]], activeLevel: 1 },
        { label: "乘法计数", narration: "每个十位都有 2 个分支，所以 3 × 2 = 6。", levels: [["3 种十位"], ["每种 2 个个位"], ["共 6 个"]], activeLevel: 2 }
      ]
    },
    "inclusion-exclusion": {
      id: "inclusion-exclusion-overlap",
      title: "重叠部分为什么要减一次",
      sceneType: "venn",
      intro: "两个集合相加时，中间重叠部分会被算两次。",
      steps: [
        { label: "分别计数", narration: "喜欢画画 12 人，喜欢唱歌 10 人。", left: 12, right: 10, overlap: 0, active: "left-right" },
        { label: "发现重叠", narration: "两项都喜欢的 4 人同时出现在两边。", left: 12, right: 10, overlap: 4, active: "overlap" },
        { label: "减去重复", narration: "12 + 10 - 4 = 18，减掉一次重复计算。", left: 12, right: 10, overlap: 4, active: "result", formula: "12 + 10 - 4 = 18" }
      ]
    },
    "sum-diff": {
      id: "sum-diff-segments",
      title: "和差问题中的两条线段",
      sceneType: "segments",
      intro: "和差问题要先把大数和小数放到同一条线段尺上比较。",
      steps: [
        { label: "总和", narration: "两个数合起来是总量。", bars: [{ label: "小数", units: 3 }, { label: "大数", units: 4 }], active: 0 },
        { label: "差量", narration: "大数比小数多出来的部分就是差。", bars: [{ label: "小数", units: 3 }, { label: "大数", units: 4, extra: 1 }], active: 1 },
        { label: "求较小数", narration: "从总和中去掉差量，剩下两份相等的小数。", bars: [{ label: "小数", units: 3 }, { label: "小数", units: 3 }], formula: "小数 = (和 - 差) ÷ 2", active: 2 }
      ]
    },
    "unit-rate": {
      id: "unit-rate-one",
      title: "先归一，再放大",
      sceneType: "flow",
      intro: "归一归总的关键是先找到 1 份量，再迁移到新数量。",
      steps: [
        { label: "整体", narration: "4 支铅笔 12 元，这是一个整体关系。", tokens: ["4 支", "12 元"] },
        { label: "归一", narration: "先求 1 支铅笔：12 ÷ 4 = 3 元。", tokens: ["1 支", "3 元"] },
        { label: "放大", narration: "再求 7 支：3 × 7 = 21 元。", tokens: ["7 支", "21 元"] }
      ]
    },
    "surplus-deficit": {
      id: "surplus-deficit-gap",
      title: "两种分法之间的总差",
      sceneType: "segments",
      intro: "盈亏问题比较的是两种分配方案造成的总差。",
      steps: [
        { label: "少分方案", narration: "每人 5 颗多 12 颗，说明还有剩余。", bars: [{ label: "每人 5", units: 5 }, { label: "多 12", units: 3 }], active: 0 },
        { label: "多分方案", narration: "每人 6 颗少 3 颗，说明还缺一些。", bars: [{ label: "每人 6", units: 6 }, { label: "少 3", units: 1 }], active: 1 },
        { label: "总差除以每人差", narration: "总差 12 + 3 = 15，每人差 1，所以有 15 人。", bars: [{ label: "总差", units: 6 }, { label: "每人差", units: 1 }], formula: "(12 + 3) ÷ (6 - 5) = 15", active: 2 }
      ]
    },
    "chicken-rabbit": {
      id: "chicken-rabbit-replace",
      title: "假设法：用差量反推替换次数",
      sceneType: "replacement",
      intro: "先假设全是鸡，再看实际多出来的腿来自几只兔。",
      steps: [
        { label: "统一假设", narration: "9 个头都假设成鸡，就有 9 × 2 = 18 条腿。", base: "鸡", count: 9, legs: 18, rabbits: 0 },
        { label: "比较差额", narration: "实际 24 条腿，比假设多 6 条。", base: "鸡", count: 9, legs: 24, diff: 6, rabbits: 0 },
        { label: "替换成兔", narration: "每换一只兔多 2 条腿，6 ÷ 2 = 3，所以兔有 3 只。", base: "混合", count: 9, legs: 24, diff: 6, rabbits: 3 }
      ]
    },
    average: {
      id: "average-leveling",
      title: "平均数是把总量重新均分",
      sceneType: "bars",
      intro: "平均数不是中间数，而是总量被重新均分后的每份量。",
      steps: [
        { label: "原始总量", narration: "三个数 12、18、24 的高度不同。", values: [12, 18, 24], highlightIndex: 0 },
        { label: "合并总量", narration: "总量是 12 + 18 + 24 = 54。", values: [54], highlightIndex: 0 },
        { label: "重新均分", narration: "54 平均分成 3 份，每份 18。", values: [18, 18, 18], highlightIndex: 1 }
      ]
    },
    motion: {
      id: "motion-relative-speed",
      title: "相遇就是距离被共同缩短",
      sceneType: "motion",
      intro: "相向而行时，两个人一起缩短中间距离，所以速度要相加。",
      steps: [
        { label: "初始距离", narration: "两人相距 720 米。", distance: 720, leftSpeed: 50, rightSpeed: 40, progress: 0 },
        { label: "共同接近", narration: "每分钟距离缩短 50 + 40 = 90 米。", distance: 720, leftSpeed: 50, rightSpeed: 40, progress: 0.55 },
        { label: "相遇时间", narration: "720 ÷ 90 = 8 分钟。", distance: 720, leftSpeed: 50, rightSpeed: 40, progress: 1, formula: "720 ÷ (50 + 40) = 8" }
      ]
    },
    age: {
      id: "age-invariant",
      title: "年龄差是不变量",
      sceneType: "segments",
      intro: "时间同时流动，每个人都增加同样岁数，所以年龄差保持不变。",
      steps: [
        { label: "今年", narration: "姐姐 14 岁，妹妹 9 岁，相差 5 岁。", bars: [{ label: "妹妹", units: 9 }, { label: "姐姐", units: 14, extra: 5 }], active: 0 },
        { label: "同时增长", narration: "5 年后两人都增加 5 岁。", bars: [{ label: "妹妹 +5", units: 14 }, { label: "姐姐 +5", units: 19, extra: 5 }], active: 1 },
        { label: "差仍不变", narration: "年龄差仍然是 5 岁。", bars: [{ label: "差", units: 5 }], formula: "年龄差不随时间改变", active: 2 }
      ]
    },
    "tree-planting": {
      id: "tree-planting-points",
      title: "点和间隔的关系",
      sceneType: "points",
      intro: "植树问题要先区分点和间隔，再看端点是否计入。",
      steps: [
        { label: "找间隔", narration: "24 米每隔 4 米，有 24 ÷ 4 = 6 个间隔。", points: 7, intervals: 6, active: "intervals" },
        { label: "看端点", narration: "两端都种时，左右端点都算作树。", points: 7, intervals: 6, active: "endpoints" },
        { label: "棵数", narration: "棵数 = 间隔数 + 1，所以是 7 棵。", points: 7, intervals: 6, active: "points", formula: "6 + 1 = 7" }
      ]
    },
    geometry: {
      id: "geometry-transform",
      title: "复杂图形转成熟悉图形",
      sceneType: "flow",
      intro: "几何题先看能否分割、拼合或补全，再用熟悉公式。",
      steps: [
        { label: "观察图形", narration: "先辨认边界、缺口和已知长度。", tokens: ["边界", "缺口", "已知量"] },
        { label: "转化", narration: "把复杂图形切成或补成矩形、正方形、三角形。", tokens: ["分割", "拼合", "补全"] },
        { label: "计算", narration: "用熟悉图形的周长或面积公式求解。", tokens: ["周长", "面积", "单位"] }
      ]
    },
    logic: {
      id: "logic-elimination",
      title: "用条件逐步排除可能",
      sceneType: "flow",
      intro: "逻辑题不是猜，而是把可能性放进条件里检验。",
      steps: [
        { label: "列可能", narration: "先把所有可能情况列出来。", tokens: ["可能 A", "可能 B", "可能 C"] },
        { label: "代条件", narration: "每次使用一个条件，排除矛盾的可能。", tokens: ["条件 1", "排除 B", "保留 A/C"] },
        { label: "验证", narration: "剩下的结论还要回到所有条件中检查。", tokens: ["结论", "回代", "成立"] }
      ]
    }
  };

  function cloneAnimation(animation) {
    return {
      ...animation,
      steps: animation.steps.map((step) => ({ ...step }))
    };
  }

  function getAnimationForModule(module = {}) {
    return cloneAnimation(animationsByModule[module.id] || defaultAnimation);
  }

  function normalizeStepIndex(index, total) {
    if (!Number.isFinite(index) || total <= 0) {
      return 0;
    }
    return Math.min(Math.max(0, index), total - 1);
  }

  function getStep(animation, index) {
    const steps = Array.isArray(animation?.steps) ? animation.steps : [];
    return steps[normalizeStepIndex(index, steps.length)] || null;
  }

  function hasAnimation(module = {}) {
    return Boolean(getAnimationForModule(module).steps.length);
  }

  const api = {
    animationsByModule,
    defaultAnimation,
    getAnimationForModule,
    getStep,
    hasAnimation,
    normalizeStepIndex
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.ConceptAnimations = api;
})(typeof window !== "undefined" ? window : globalThis);
