(function attachSupplementalConceptAnimations(root) {
  const animations = {
    "pigeonhole-principle": {
      id: "pigeonhole-worst-case",
      title: "最坏情况推出必然发生",
      sceneType: "flow",
      intro: "抽屉原理不是猜，而是先把最不容易满足条件的情况摆出来。",
      steps: [
        { label: "找抽屉", narration: "红、黄、蓝 3 种颜色就是 3 个抽屉。", tokens: ["红", "黄", "蓝"] },
        { label: "最坏情况", narration: "先各取 1 个，暂时没有 2 个同色。", tokens: ["红 1", "黄 1", "蓝 1"] },
        { label: "多 1 必然", narration: "第 4 个球一定落进某个已有颜色，所以保证 2 个同色。", tokens: ["第 4 个", "必有同色"] }
      ]
    },
    "train-bridge": {
      id: "train-bridge-length",
      title: "完全通过要加上车长",
      sceneType: "motion",
      intro: "火车不是一个点，车尾离开桥才叫完全通过。",
      steps: [
        { label: "车头上桥", narration: "车头到桥头时，车身还在桥外。", distance: 400, leftSpeed: 20, rightSpeed: 0, progress: 0.2 },
        { label: "车身经过", narration: "火车要走过桥长，还要让自己的车身全部过去。", distance: 400, leftSpeed: 20, rightSpeed: 0, progress: 0.65, formula: "车长 + 桥长" },
        { label: "车尾离桥", narration: "总路程 100 + 300 = 400 米，400 ÷ 20 = 20 秒。", distance: 400, leftSpeed: 20, rightSpeed: 0, progress: 1, formula: "400 ÷ 20 = 20" }
      ]
    },
    "geometry-counting": {
      id: "geometry-counting-layered",
      title: "图形计数要分层不重漏",
      sceneType: "flow",
      intro: "图形计数要把图形编号，再按大小或边界有序数。",
      steps: [
        { label: "编号", narration: "先给点、线或方格编号，避免重复。", tokens: ["1", "2", "3", "4"] },
        { label: "分层", narration: "先数小图形，再数由多个小图形组成的大图形。", tokens: ["1 格", "2 格", "3 格"] },
        { label: "合并", narration: "把各层数量相加，再检查有没有重复或遗漏。", tokens: ["分层表", "总数", "检查"] }
      ]
    },
    "parity-divisibility": {
      id: "parity-divisibility-rules",
      title: "用结构判断奇偶与整除",
      sceneType: "flow",
      intro: "奇偶和整除让我们不用完整计算，也能判断可能性。",
      steps: [
        { label: "奇偶", narration: "加法看奇数的个数；偶数个奇数相加是偶数。", tokens: ["奇数个数", "成对", "剩 1"] },
        { label: "整除", narration: "3 和 9 看数字和，2 和 5 看个位。", tokens: ["个位", "数字和", "倍数"] },
        { label: "判断", narration: "用规则快速判断能否整除，或判断某种结果不可能。", tokens: ["可能", "不可能", "解释"] }
      ]
    },
    "counting-transfer": {
      id: "counting-transfer-tools",
      title: "计数题先选工具",
      sceneType: "tree",
      intro: "换乘站要先判断题目结构，再选择枚举、加乘原理或容斥。",
      steps: [
        { label: "分类还是分步", narration: "先判断是互斥方案相加，还是连续步骤相乘。", levels: [["分类 +"], ["分步 ×"]], activeLevel: 0 },
        { label: "是否重叠", narration: "如果两个集合有重叠，要用容斥减掉重复。", levels: [["A"], ["B"], ["重叠 -1 次"]], activeLevel: 2 },
        { label: "处理限制", narration: "有限制条件时，可以先算全部，再排除不符合的情况。", levels: [["全部"], ["不符合"], ["剩余"]], activeLevel: 1 }
      ]
    },
    "efficiency-transfer": {
      id: "efficiency-transfer-unify",
      title: "速度、效率和单位量是一件事",
      sceneType: "flow",
      intro: "效率换乘站把每小时走多少、每天做多少、每分钟缩短多少统一起来。",
      steps: [
        { label: "单位时间", narration: "先求每 1 个时间单位变化多少。", tokens: ["每分钟", "每小时", "每天"] },
        { label: "合并效率", narration: "合作或相向时，变化量常常相加。", tokens: ["合作效率", "速度和", "共同缩短"] },
        { label: "比较效率", narration: "追及时看差距每单位时间缩小多少。", tokens: ["速度差", "效率差", "追上"] }
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

  root.SupplementalConceptAnimations = { animations, installAnimations };
})(typeof window !== "undefined" ? window : globalThis);
