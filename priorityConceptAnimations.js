(function attachPriorityConceptAnimations(root) {
  const animations = {
    "quick-calculation": {
      id: "quick-calculation-make-ten",
      title: "凑整让计算更稳定",
      sceneType: "flow",
      intro: "巧算不是跳步骤，而是先观察哪些数能组合成整十、整百。",
      steps: [
        { label: "观察数字", narration: "先看 297 + 36 + 3，发现 297 离 300 只差 3。", tokens: ["297", "36", "3"] },
        { label: "先凑整", narration: "把 297 和 3 先合在一起，得到 300。", tokens: ["297 + 3", "= 300"] },
        { label: "再计算", narration: "300 + 36 = 336，计算变得简单且不容易出错。", tokens: ["300", "+36", "336"] }
      ]
    },
    "arithmetic-series": {
      id: "arithmetic-series-pairing",
      title: "等差数列中的间隔与配对",
      sceneType: "bars",
      intro: "等差数列先看公差，再看项数，求和时可以首尾配对。",
      steps: [
        { label: "找公差", narration: "7，12，17，22 每次都增加 5。", values: [7, 12, 17, 22], deltas: [5, 5, 5], highlightIndex: 1 },
        { label: "数间隔", narration: "从第 1 项到第 10 项，中间有 9 个间隔。", values: [7, 12, 17, 22, 27, 32, 37, 42, 47, 52], highlightIndex: 9 },
        { label: "首尾配对", narration: "7+52=59，12+47=59，共 5 对，所以总和是 295。", values: [59, 59, 59, 59, 59], formula: "59 × 5 = 295", highlightIndex: 2 }
      ]
    },
    "add-multiply-principle": {
      id: "add-multiply-principle-choice",
      title: "分类用加法，分步用乘法",
      sceneType: "tree",
      intro: "计数前先判断：是任选一类，还是几个步骤都要完成。",
      steps: [
        { label: "分类", narration: "只选 1 支笔：铅笔或钢笔，是两类方案，用加法。", levels: [["铅笔 5 种", "钢笔 3 种"]], activeLevel: 0 },
        { label: "分步", narration: "搭配衣服：上衣和裤子都要选，是两个步骤，用乘法。", levels: [["4 件上衣"], ["每件配 2 条裤子"]], activeLevel: 1 },
        { label: "混合", narration: "复杂题先分大类，再在每类内部判断加法还是乘法。", levels: [["中式", "西式"], ["2×3", "3"]], activeLevel: 2 }
      ]
    },
    engineering: {
      id: "engineering-work-rate",
      title: "把总工程看作 1",
      sceneType: "flow",
      intro: "工程问题的关键是先求每人每天完成几分之几，再合并效率。",
      steps: [
        { label: "单位化", narration: "把整项工程看作 1。甲 6 天完成，所以每天做 1/6。", tokens: ["总量 1", "甲效率 1/6"] },
        { label: "合并效率", narration: "乙 3 天完成，每天做 1/3；合作效率是 1/6 + 1/3 = 1/2。", tokens: ["乙效率 1/3", "合作 1/2"] },
        { label: "反求时间", narration: "总量 1 除以合作效率 1/2，得到 2 天完成。", tokens: ["1 ÷ 1/2", "= 2 天"] }
      ]
    }
  };

  function installAnimations() {
    if (!root.ConceptAnimations?.animationsByModule) {
      return;
    }
    Object.assign(root.ConceptAnimations.animationsByModule, animations);
  }

  installAnimations();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { animations, installAnimations };
  }

  root.PriorityConceptAnimations = { animations, installAnimations };
})(typeof window !== "undefined" ? window : globalThis);
