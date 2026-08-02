const CONTRACT_FIXES = Object.freeze({
  "periodicity-1": { prompt: "按红、黄、蓝循环排列，编号规则为红=1、黄=2、蓝=3。第 20 个颜色对应的循环编号是多少？", answer: "2" },
  "periodicity-2": { prompt: "按○、□、△循环排列，编号规则为○=1、□=2、△=3。第 17 个图形对应的循环编号是多少？", answer: "2" },
  "periodicity-3": { prompt: "按周一=1、周二=2、……、周日=7 编号。今天是周五，10 天后的星期编号是多少？", answer: "1" },
  "periodicity-4": { prompt: "按甲=1、乙=2、丙=3、丁=4 循环排列。第 32 个位置的编号是多少？", answer: "4" },
  "chapter-01-periodicity-advance-1": { prompt: "按春=1、夏=2、秋=3、冬=4 循环排列。第 18 个位置的循环编号是多少？", answer: "2" },
  "chapter-01-periodicity-improve-1": { prompt: "按 A=1、B=2、C=3、D=4、E=5 循环排列。第 43 个位置的循环编号是多少？", answer: "3" },
  "chapter-01-periodicity-improve-2": { prompt: "按★=1、●=2、▲=3、■=4、♥=5 循环排列。第 35 个位置的循环编号是多少？", answer: "5" },
  "chapter-01-periodicity-challenge-1": { prompt: "按周一=1、周二=2、……、周日=7 编号。今天是周二，100 天后的星期编号是多少？", answer: "4" },

  "logic-1": { prompt: "A、B、C 三人的编号分别为 1、2、3。A 不是第一，B 也不是第一，那么第一位置的编号是多少？", answer: "3" },
  "logic-2": { prompt: "甲比乙快，乙比丙快。按最快=1、最慢=3 编号，最慢者的编号是多少？", answer: "3" },
  "logic-3": { prompt: "红、黄、蓝三个盒子的编号分别为 1、2、3，只有一个有奖品。红盒和蓝盒都没有，奖品盒的编号是多少？", answer: "2" },
  "logic-4": { prompt: "小丽、小华、小美的编号分别为 1、2、3。小丽不是第三，小华不是第三，那么第三位置的编号是多少？", answer: "3" },
  "chapter-02-logic-advance-1": { prompt: "把“说法正确”编号为 1，把“说法错误”编号为 0。乙的信号灯确实是蓝色，甲说乙是蓝色，这句话的编号是多少？", answer: "1" },
  "logic-5": { prompt: "甲比乙重，乙比丙重。按最重=1、最轻=3 编号，最重者的编号是多少？", answer: "1" },
  "logic-8": { prompt: "A、B、C、D 的编号分别为 1、2、3、4。A、B、C 都不是最后，那么最后位置的编号是多少？", answer: "4" },
  "logic-9": { prompt: "红、黄、蓝三个盒子的编号分别为 1、2、3，已知红盒有球。装有球的盒子编号是多少？", answer: "1" },
  "logic-6": { prompt: "甲、乙、丙的编号分别为 1、2、3。甲不是最后，乙和丙都不是第一，那么第一位置的编号是多少？", answer: "1" },
  "logic-12": { prompt: "A、B、C 的编号分别为 1、2、3。A、C 都不是第一，B 不是第二，那么第一位置的编号是多少？", answer: "2" },

  "parity-divisibility-1": { prompt: "把奇数编号为 1、偶数编号为 2。偶数加奇数的结果编号是多少？", answer: "1" },
  "parity-divisibility-2": { prompt: "把奇数编号为 1、偶数编号为 2。奇数乘偶数的结果编号是多少？", answer: "2" },
  "parity-divisibility-3": { prompt: "把“能被整除”编号为 1，把“不能被整除”编号为 0。528 能被 3 整除，结果编号是多少？", answer: "1" },
  "parity-divisibility-4": { prompt: "把“能被整除”编号为 1，把“不能被整除”编号为 0。783 能被 9 整除，结果编号是多少？", answer: "1" },
  "parity-divisibility-5": { prompt: "把奇数编号为 1、偶数编号为 2。3 个偶数和 4 个奇数相加，结果编号是多少？", answer: "2" },
  "chapter-02-parity-divisibility-improve-1": { prompt: "把奇数编号为 1、偶数编号为 2。连续两个整数相乘，结果一定的编号是多少？", answer: "2" },
  "chapter-02-parity-divisibility-improve-2": { prompt: "把“能被整除”编号为 1，把“不能被整除”编号为 0。54 能被 9 整除，结果编号是多少？", answer: "1" },

  "factors-multiples-1": { prompt: "把“是”编号为 1，把“不是”编号为 0。15 是 5 的倍数，结果编号是多少？", answer: "1" },
  "factors-multiples-2": { prompt: "把“是”编号为 1，把“不是”编号为 0。3 不是 14 的因数，结果编号是多少？", answer: "0" },
  "factors-multiples-4": { prompt: "把“是”编号为 1，把“不是”编号为 0。18 是 6 的倍数，结果编号是多少？", answer: "1" },
  "pigeonhole-intro-1": { prompt: "把“必然有”编号为 1，把“不一定有”编号为 0。4 个球放进 3 个盒子，至少有一个盒子有 2 个球，结果编号是多少？", answer: "1" },
  "pigeonhole-intro-2": { prompt: "把“必然有”编号为 1，把“不一定有”编号为 0。2 只小鸟飞到 2 棵树上，至少有一棵树有 2 只，结果编号是多少？", answer: "0" },
  "pigeonhole-intro-3": { prompt: "把“必然有”编号为 1，把“不一定有”编号为 0。6 个学生分到 5 张桌子，至少有一张桌子坐 2 人，结果编号是多少？", answer: "1" },
  "pigeonhole-intro-4": { prompt: "把“必然有”编号为 1，把“不一定有”编号为 0。3 个数除以 2，至少有两个数余数相同，结果编号是多少？", answer: "1" },
  "pigeonhole-intro-5": { prompt: "把“必然有”编号为 1，把“不一定有”编号为 0。7 本书放进 3 个书包，至少有一个书包装 3 本，结果编号是多少？", answer: "1" },
  "pigeonhole-intro-6": { prompt: "把“必然有”编号为 1，把“不一定有”编号为 0。5 个整数除以 4，至少有两个数余数相同，结果编号是多少？", answer: "1" },
  "pigeonhole-intro-9": { prompt: "把“必然有”编号为 1，把“不一定有”编号为 0。8 个苹果放进 3 个篮子，至少有一个篮子装 3 个，结果编号是多少？", answer: "1" },
  "pigeonhole-intro-7": { prompt: "把“必然有”编号为 1，把“不一定有”编号为 0。10 支笔放进 4 个盒子，至少有一个盒子装 3 支，结果编号是多少？", answer: "1" },
  "pigeonhole-intro-8": { prompt: "把“必然有”编号为 1，把“不一定有”编号为 0。6 个小朋友只有 5 种出生月份，至少有两人同月，结果编号是多少？", answer: "1" },
  "plan-design-2": { prompt: "甲方案和乙方案的编号分别为 1、2。甲用 2 个箱子，乙用 5 个箱子，较省箱子的方案编号是多少？", answer: "1" },
  "plan-design-6": { prompt: "甲方案和乙方案的编号分别为 1、2。甲方案要 12 元，乙方案要 10 元，较省钱的方案编号是多少？", answer: "2" },

  "pigeonhole-principle-6": { prompt: "把 1 到 20 配成 10 对，每对数的和都是 21。任取 11 个数，至少能保证有多少对数被同时取到？", answer: "1" },
  "ratio-proportion-1": { prompt: "8 和 4 的最简整数比中，前项是多少？", answer: "2" },
  "ratio-proportion-2": { prompt: "10 和 5 的最简整数比中，前项是多少？", answer: "2" },
  "ratio-proportion-6": { prompt: "12:18 的最简整数比中，前项是多少？", answer: "2" },
  "ratio-proportion-8": { prompt: "18:27 的最简整数比中，后项是多少？", answer: "3" },
  "plan-design-9": { prompt: "买 3 元票 4 张共 12 元，买 5 元票 2 张共 10 元，两种方案的总价相差多少元？", answer: "2" },
  "prime-factorization-1": { prompt: "8 分解质因数后，各质因数的和是多少？", answer: "6" },
  "prime-factorization-2": { prompt: "15 分解质因数后，各质因数的和是多少？", answer: "8" },
  "prime-factorization-4": { prompt: "27 分解质因数后，各质因数的和是多少？", answer: "9" },
  "prime-factorization-6": { prompt: "45 分解质因数后，各质因数的和是多少？", answer: "11" },
  "prime-factorization-7": { prompt: "49 分解质因数后，各质因数的和是多少？", answer: "14" },
  "chapter-03-case-analysis-intro-advance-1": { prompt: "A 路线长 4 千米，B 路线长 6 千米，两条路线都要再走 2 千米到终点。两条完整路线的长度之和是多少千米？", answer: "14" }
});

function getQuestionContractFix(questionId) {
  const fix = CONTRACT_FIXES[questionId];
  return fix ? { ...fix, answerType: "numeric", answerFormat: "integer" } : null;
}

module.exports = { CONTRACT_FIXES, getQuestionContractFix };
