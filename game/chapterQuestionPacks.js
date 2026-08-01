const supplementalQuestionsByModule = Object.freeze({
  patterns: Object.freeze([
    { id: "chapter-01-patterns-advance-1", title: "递增步数", difficulty: "进阶", prompt: "数列 1，4，9，16，( ) 的下一项是多少？", answer: "25", explanation: "相邻两项依次加 3、5、7，下一次加 9，所以是 25。" },
    { id: "chapter-01-patterns-advance-2", title: "两组轮流", difficulty: "进阶", prompt: "数列 2，10，4，12，6，14，( ) 的下一项是多少？", answer: "8", explanation: "奇数位是 2、4、6，依次加 2；下一项在奇数位，所以是 8。" },
    { id: "chapter-01-patterns-advance-3", title: "连续加数", difficulty: "进阶", prompt: "数列 6，8，11，15，( ) 的下一项是多少？", answer: "20", explanation: "依次加 2、3、4，下一次加 5，所以是 20。" },
    { id: "chapter-01-patterns-challenge-1", title: "方格数列", difficulty: "挑战", prompt: "按 1，4，9，16，25……排列，第 6 个数是多少？", answer: "36", explanation: "这些数是 1²、2²、3²……第 6 个是 6²=36。" }
  ]),
  "sum-diff": Object.freeze([
    { id: "chapter-01-sum-diff-advance-1", title: "和与差", difficulty: "进阶", prompt: "两个数的和是 44，差是 8，较小的数是多少？", answer: "18", explanation: "较小数=(44-8)÷2=18。" },
    { id: "chapter-01-sum-diff-improve-1", title: "倍数关系", difficulty: "提高", prompt: "甲数是乙数的 4 倍，两个数的和是 35，乙数是多少？", answer: "7", explanation: "一共是 4+1=5 份，乙数是 35÷5=7。" },
    { id: "chapter-01-sum-diff-improve-2", title: "差倍问题", difficulty: "提高", prompt: "大数是小数的 3 倍，两数相差 18，小数是多少？", answer: "9", explanation: "相差 3-1=2 份，18÷2=9。" },
    { id: "chapter-01-sum-diff-challenge-1", title: "总数反求", difficulty: "挑战", prompt: "甲比乙多 14，甲是乙的 3 倍，甲和乙的和是多少？", answer: "28", explanation: "甲比乙多 2 份，乙是 14÷2=7，甲是 21，和是 28。" }
  ]),
  "quick-calculation": Object.freeze([
    { id: "chapter-01-quick-calculation-advance-1", title: "补成整千", difficulty: "进阶", prompt: "计算 684 + 199 + 316。", answer: "1199", explanation: "684+316=1000，再加 199，得到 1199。" },
    { id: "chapter-01-quick-calculation-improve-1", title: "首尾配对", difficulty: "提高", prompt: "计算 31+32+33+34+35+36+37+38+39。", answer: "315", explanation: "31+39、32+38、33+37、34+36 都是 70，再加中间的 35，得到 315。" },
    { id: "chapter-01-quick-calculation-improve-2", title: "巧拆乘法", difficulty: "提高", prompt: "计算 125×24。", answer: "3000", explanation: "24=3×8，125×8=1000，再乘 3，得到 3000。" },
    { id: "chapter-01-quick-calculation-challenge-1", title: "双向凑整", difficulty: "挑战", prompt: "计算 999+278+1+722。", answer: "2000", explanation: "999+1=1000，278+722=1000，所以总和是 2000。" }
  ]),
  "arithmetic-series": Object.freeze([
    { id: "chapter-01-arithmetic-series-advance-1", title: "第几项", difficulty: "进阶", prompt: "数列 5，8，11，14……第 10 项是多少？", answer: "32", explanation: "第 10 项比第 1 项多 9 个公差 3：5+9×3=32。" },
    { id: "chapter-01-arithmetic-series-improve-1", title: "偶数求和", difficulty: "提高", prompt: "2+4+6+8+10+12+14+16 的和是多少？", answer: "72", explanation: "首尾相加都是 18，共有 4 对，所以和是 18×4=72。" },
    { id: "chapter-01-arithmetic-series-improve-2", title: "中间项", difficulty: "提高", prompt: "等差数列的第 1 项是 7，第 9 项是 39，第 5 项是多少？", answer: "23", explanation: "第 5 项正好在第 1 项和第 9 项中间，所以是 (7+39)÷2=23。" },
    { id: "chapter-01-arithmetic-series-challenge-1", title: "连续数求和", difficulty: "挑战", prompt: "从 18 加到 42，一共有多少？", answer: "750", explanation: "有 42-18+1=25 个数，首尾和是 60，25 个数可看成 12 对再加中间 30，得到 750。" }
  ]),
  periodicity: Object.freeze([
    { id: "chapter-01-periodicity-advance-1", title: "余数定位", difficulty: "进阶", prompt: "按“春、夏、秋、冬”循环，第 18 个是什么？", answer: "夏", explanation: "18÷4余 2，所以是每组第 2 个“夏”。" },
    { id: "chapter-01-periodicity-improve-1", title: "循环字母", difficulty: "提高", prompt: "按“A、B、C、D、E”循环，第 43 个字母是什么？", answer: "C", explanation: "43÷5余 3，所以是每组第 3 个 C。" },
    { id: "chapter-01-periodicity-improve-2", title: "整除位置", difficulty: "提高", prompt: "按“★、●、▲、■、♥”循环，第 35 个图形是什么？", answer: "♥", explanation: "35÷5余 0，余 0 表示每组最后一个，所以是 ♥。" },
    { id: "chapter-01-periodicity-challenge-1", title: "两层周期", difficulty: "挑战", prompt: "今天是星期二，100 天后是星期几？", answer: "星期四", explanation: "100÷7余 2，从星期二往后数 2 天是星期四。" }
  ]),
  enumeration: Object.freeze([
    { id: "chapter-01-enumeration-advance-1", title: "三位排列", difficulty: "进阶", prompt: "用 1、2、3 组成没有重复数字的三位数，有多少个？", answer: "6", explanation: "百位有 3 种，十位有 2 种，个位有 1 种，3×2×1=6。" },
    { id: "chapter-01-enumeration-advance-2", title: "有序列表", difficulty: "进阶", prompt: "从 A、B、C 三张卡片中选两张并排成一列，有多少种排法？", answer: "6", explanation: "第一个位置有 3 种选法，第二个位置有 2 种，共 3×2=6 种。" },
    { id: "chapter-01-enumeration-improve-1", title: "不重复号码", difficulty: "提高", prompt: "用 1、2、3、4 组成没有重复数字的三位数，有多少个？", answer: "24", explanation: "百位、十位、个位依次有 4、3、2 种选法，4×3×2=24。" },
    { id: "chapter-01-enumeration-challenge-1", title: "首位限制", difficulty: "挑战", prompt: "用 0、1、2、3、4 组成没有重复数字的三位数，百位不能是 0，有多少个？", answer: "48", explanation: "百位有 4 种，后两位依次有 4、3 种，所以共有 4×4×3=48 个。" }
  ]),
  "add-multiply-principle": Object.freeze([
    { id: "chapter-01-add-multiply-principle-advance-1", title: "两类路线", difficulty: "进阶", prompt: "去公园可以坐公交（3 条线）或骑车（2 条路线），一共有多少种去法？", answer: "5", explanation: "公交和骑车只选一种，是分类选择：3+2=5。" },
    { id: "chapter-01-add-multiply-principle-improve-1", title: "菜单搭配", difficulty: "提高", prompt: "一份午餐选 1 种主食（3 种）和 1 种汤（4 种），另有 2 种单独套餐。一共有多少种选择？", answer: "14", explanation: "搭配午餐有 3×4=12 种，再加 2 种套餐，共 14 种。" },
    { id: "chapter-01-add-multiply-principle-improve-2", title: "分步再分类", difficulty: "提高", prompt: "参加游戏可选跳绳（2 种玩法）或拼图（3 种难度），每种都要选 1 个队友（4 人）。一共有多少种参加方法？", answer: "20", explanation: "游戏玩法共有 2+3=5 种，每种选队友有 4 种，共 5×4=20 种。" },
    { id: "chapter-01-add-multiply-principle-challenge-1", title: "车票组合", difficulty: "挑战", prompt: "去动物园先选 2 种交通方式之一，再选上午或下午入园；其中第 1 种交通有 3 个班次，第 2 种有 2 个班次。一共有多少种安排？", answer: "10", explanation: "交通班次共有 3+2=5 种，每种可选上午或下午，共 5×2=10 种。" }
  ]),
  "inclusion-exclusion": Object.freeze([
    { id: "chapter-01-inclusion-exclusion-basic-1", title: "两项爱好", difficulty: "基础", prompt: "有 9 人喜欢足球，8 人喜欢绘画，3 人两项都喜欢。至少喜欢一项的有多少人？", answer: "14", explanation: "9+8-3=14，重叠的 3 人只算一次。" },
    { id: "chapter-01-inclusion-exclusion-advance-1", title: "反求重叠", difficulty: "进阶", prompt: "喜欢读书的有 18 人，喜欢运动的有 15 人，至少喜欢一项的有 27 人。两项都喜欢的有多少人？", answer: "6", explanation: "18+15=33，比 27 多出的 6 人就是被重复算到的重叠部分。" },
    { id: "chapter-01-inclusion-exclusion-improve-1", title: "都不喜欢", difficulty: "提高", prompt: "全班 40 人，16 人喜欢棋类，19 人喜欢球类，5 人两项都喜欢。两项都不喜欢的有多少人？", answer: "10", explanation: "至少喜欢一项的有 16+19-5=30 人，所以都不喜欢的有 40-30=10 人。" },
    { id: "chapter-01-inclusion-exclusion-challenge-1", title: "只喜欢一项", difficulty: "挑战", prompt: "有 20 人会游泳，17 人会骑车，7 人两项都会。只会其中一项的有多少人？", answer: "23", explanation: "只会游泳有 20-7=13 人，只会骑车有 17-7=10 人，共 23 人。" }
  ]),
  "unit-rate": Object.freeze([
    { id: "chapter-01-unit-rate-advance-1", title: "每本价格", difficulty: "进阶", prompt: "6 本练习册共 48 元，买 9 本同样的练习册需要多少元？", answer: "72", explanation: "每本 48÷6=8 元，9 本是 8×9=72 元。" },
    { id: "chapter-01-unit-rate-advance-2", title: "每分钟速度", difficulty: "进阶", prompt: "小红 4 分钟跳了 120 下，照这样 7 分钟跳多少下？", answer: "210", explanation: "每分钟跳 120÷4=30 下，7 分钟跳 30×7=210 下。" },
    { id: "chapter-01-unit-rate-improve-1", title: "每人每天", difficulty: "提高", prompt: "4 个同学 5 天读完 200 页书，平均每人每天读多少页？", answer: "10", explanation: "共有 4×5=20 人天，200÷20=10 页。" },
    { id: "chapter-01-unit-rate-challenge-1", title: "反求天数", difficulty: "挑战", prompt: "3 台打印机 2 小时打印 180 张，照这样 5 台打印机打印 450 张需要几小时？", answer: "3", explanation: "每台每小时打印 180÷3÷2=30 张，5 台每小时打印 150 张，450÷150=3 小时。" }
  ]),
  "surplus-deficit": Object.freeze([
    { id: "chapter-01-surplus-deficit-advance-1", title: "一次刚好", difficulty: "进阶", prompt: "分贴纸，每人 3 张多 10 张；每人 5 张刚好分完。有几个小朋友？", answer: "5", explanation: "每人多分 2 张，10÷2=5，所以有 5 人。" },
    { id: "chapter-01-surplus-deficit-advance-2", title: "两次都多", difficulty: "进阶", prompt: "分彩笔，每人 2 支多 18 支；每人 5 支多 6 支。有几个人？", answer: "4", explanation: "每人多分 3 支，剩余少了 18-6=12 支，12÷3=4 人。" },
    { id: "chapter-01-surplus-deficit-improve-1", title: "一多一少", difficulty: "提高", prompt: "分贝壳，每人 4 个多 8 个；每人 6 个少 2 个。有几个人？", answer: "5", explanation: "两种分法每人相差 2 个，总差是 8+2=10 个，10÷2=5 人。" },
    { id: "chapter-01-surplus-deficit-challenge-1", title: "求总数", difficulty: "挑战", prompt: "分奖券，每人 3 张多 12 张；每人 5 张少 4 张。一共有多少张奖券？", answer: "36", explanation: "人数是 (12+4)÷(5-3)=8 人，总数是 3×8+12=36 张。" }
  ]),
  "chicken-rabbit": Object.freeze([
    { id: "chapter-01-chicken-rabbit-advance-1", title: "脚数反推", difficulty: "进阶", prompt: "鸡兔共有 14 只，脚有 40 只，兔有几只？", answer: "6", explanation: "全是鸡有 28 只脚，多出 12 只脚；每只兔多 2 只脚，所以有 6 只兔。" },
    { id: "chapter-01-chicken-rabbit-improve-1", title: "自行车与三轮车", difficulty: "提高", prompt: "停车场里有自行车和三轮车共 12 辆，轮子共 30 个。三轮车有几辆？", answer: "6", explanation: "全是自行车有 24 个轮子，多出 6 个；每辆三轮车多 1 个轮子，所以有 6 辆。" },
    { id: "chapter-01-chicken-rabbit-improve-2", title: "鹤与龟", difficulty: "提高", prompt: "鹤和龟共 16 只，脚共 44 只。龟有几只？", answer: "6", explanation: "全是鹤有 32 只脚，多出 12 只；每只龟多 2 只脚，所以有 6 只龟。" },
    { id: "chapter-01-chicken-rabbit-challenge-1", title: "硬币组合", difficulty: "挑战", prompt: "有 1 元和 5 元硬币共 12 枚，总值 32 元。5 元硬币有几枚？", answer: "5", explanation: "全是 1 元共有 12 元，多出 20 元；每枚 5 元硬币多 4 元，所以有 20÷4=5 枚。" }
  ]),
  average: Object.freeze([
    { id: "chapter-01-average-advance-1", title: "补齐总分", difficulty: "进阶", prompt: "4 次测验平均 75 分，前 3 次共 210 分，第 4 次是多少分？", answer: "90", explanation: "4 次总分是 75×4=300 分，第 4 次是 300-210=90 分。" },
    { id: "chapter-01-average-advance-2", title: "增加一个数", difficulty: "进阶", prompt: "3 个数的平均数是 14，再加一个数 20，4 个数的平均数是多少？", answer: "15.5", explanation: "原来总和是 14×3=42，加上 20 后是 62，62÷4=15.5。" },
    { id: "chapter-01-average-improve-1", title: "替换一个数", difficulty: "提高", prompt: "5 个数的平均数是 18，其中一个数从 12 改成 22，新的平均数是多少？", answer: "20", explanation: "总和增加 10，平均数增加 10÷5=2，所以新平均数是 20。" },
    { id: "chapter-01-average-challenge-1", title: "分组平均", difficulty: "挑战", prompt: "第一组 4 人平均 16 分，第二组 6 人平均 20 分，两个组合在一起平均多少分？", answer: "18.4", explanation: "总分是 4×16+6×20=184 分，共 10 人，平均 184÷10=18.4 分。" }
  ])
});

module.exports = { supplementalQuestionsByModule };
