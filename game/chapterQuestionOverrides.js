// Editorial rewrites for questions that were previously numerical substitutions of the same shell.
// The mathematics, answer, difficulty and route position stay unchanged; only the task context and
// wording become distinct, child-readable mission prompts.
const QUESTION_OVERRIDES = Object.freeze({
  "patterns-1": { title: "刻度推进", prompt: "工程尺的刻度从 4、7、10、13 依次推进。下一格应标多少？" },
  "patterns-2": { title: "方形护板", prompt: "第 1、2、3、4 块方形护板的小格数依次是 1、4、9、16。第 5 块有多少小格？" },
  "patterns-3": { title: "扫描范围", prompt: "探测器的扫描范围每轮都扩大为原来的 2 倍：3、6、12、24。下一轮是多少？" },
  "patterns-4": { title: "灯带编号", prompt: "跑道灯每隔 3 个编号亮一次：5、8、11、14、17。下一盏的编号是多少？" },
  "patterns-5": { title: "折叠翼片", prompt: "翼片每次折叠后数量翻倍：2、4、8、16。下一次折叠后有多少片？" },
  "patterns-6": { title: "装箱记录", prompt: "补给箱本轮多装 1 件、下一轮多装 2 件、再下一轮多装 3 件：1、2、4、7、11。下一箱应装多少件？" },
  "patterns-8": { title: "方阵地砖", prompt: "正方形训练区边长依次为 1、2、3、4、5 格，对应地砖数是 2、5、10、17、( )。下一块训练区需要多少块地砖？" },
  "patterns-12": { title: "螺栓累计", prompt: "装配第 1、2、3、4、5 层支架后，累计使用螺栓数是 2、6、12、20、30。第 6 层后累计是多少？" },

  "quick-calculation-1": { title: "维修台清点", prompt: "维修台先摆了 297 个小垫片，又放上 36 个，其中 3 个正好补整。现在一共有多少个？" },
  "chapter-01-quick-calculation-advance-1": { title: "三箱补给", prompt: "三箱补给分别装有 684、199 和 316 个零件。合在一起共有多少个？" },
  "quick-calculation-4": { title: "整齐排布", prompt: "装配架有 16 排，每排整齐放 25 个卡扣。一共放了多少个卡扣？" },
  "chapter-01-quick-calculation-improve-2": { title: "批量芯片", prompt: "24 组传感芯片，每组有 125 枚。共有多少枚芯片？" },
  "quick-calculation-5": { title: "连续工位", prompt: "工位编号从 21 到 29，每个工位各领取 1 张任务卡。把这些编号相加，结果是多少？" },
  "chapter-01-quick-calculation-improve-1": { title: "跑道灯编号", prompt: "跑道灯编号从 31 到 39。把这些编号相加，结果是多少？" },
  "quick-calculation-6": { title: "双向校准", prompt: "校准台的四个读数是 998、397、2、3。快速合计后是多少？" },
  "chapter-01-quick-calculation-challenge-1": { title: "整千配对", prompt: "两组数据 999 和 1 可以配成整千，278 和 722 也可以配成整千。四个数合计是多少？" },

  "arithmetic-series-2": { title: "第八盏灯", prompt: "灯带从第 1 盏起编号为 2、6、10、14……每盏比前一盏多 4。第 8 盏编号是多少？" },
  "chapter-01-arithmetic-series-advance-1": { title: "第十段轨道", prompt: "轨道段长度依次是 5、8、11、14……每段比前一段长 3。第 10 段长度是多少？" },
  "arithmetic-series-5": { title: "奇数编号牌", prompt: "把编号为 1、3、5、7、9、11、13、15 的八块标记牌相加，和是多少？" },
  "chapter-01-arithmetic-series-improve-1": { title: "偶数工具箱", prompt: "8 个工具箱的编号是 2、4、6、8、10、12、14、16。编号和是多少？" },

  "chicken-rabbit-1": { title: "四台运输车", prompt: "巡检站有两轮小车和四轮搬运车共 4 台，车轮一共 12 个。四轮搬运车有几台？" },
  "chicken-rabbit-2": { title: "五台小车", prompt: "仓库里有两轮小车和四轮搬运车共 5 台，车轮一共 14 个。两轮小车有几台？" },
  "chicken-rabbit-3": { title: "七台巡检车", prompt: "7 台巡检车由两轮车和四轮车组成，轮子一共 20 个。四轮车有几台？" },
  "chicken-rabbit-4": { title: "八台搬运车", prompt: "两轮搬运车和四轮搬运车一共 8 台，车轮一共 24 个。两轮车有几台？" },
  "chapter-01-chicken-rabbit-advance-1": { title: "车队轮数", prompt: "探测车队有两轮车和四轮车共 14 台，轮子一共 40 个。四轮车有几台？" },
  "chicken-rabbit-5": { title: "九台服务车", prompt: "服务车有两轮型和四轮型共 9 台，轮子总数是 26 个。四轮型有几台？" },
  "chicken-rabbit-6": { title: "十台巡逻车", prompt: "两轮巡逻车和四轮巡逻车一共 10 台，轮子有 32 个。两轮巡逻车有几台？" },
  "chicken-rabbit-7": { title: "十二台任务车", prompt: "任务车有两轮型和四轮型共 12 台，车轮一共 34 个。四轮型有几台？" },
  "chicken-rabbit-8": { title: "十一台推车", prompt: "推车由两轮车和四轮车组成，共 11 台，轮子总数为 30 个。两轮车有几台？" },
  "chicken-rabbit-9": { title: "十三台补给车", prompt: "补给车有两轮型和四轮型共 13 台，轮子总数为 38 个。四轮型有几台？" }
});

function getQuestionOverride(questionId) {
  const override = QUESTION_OVERRIDES[questionId];
  return override ? { ...override } : null;
}

module.exports = { QUESTION_OVERRIDES, getQuestionOverride };
