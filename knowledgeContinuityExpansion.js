(function attachKnowledgeContinuityExpansion(root) {
  const continuityModules = [
    {
      id: "periodicity",
      title: "周期问题",
      grades: ["二年级", "三年级", "四年级"],
      description: "从重复结构出发，理解余数表示周期中的位置。",
      examples: [
        {
          title: "颜色周期",
          difficulty: "基础",
          question: "红、黄、蓝、红、黄、蓝……第 14 个是什么颜色？",
          answer: "黄",
          analysis: "3 个一组，14 ÷ 3 = 4 余 2，余 2 表示每组第 2 个，是黄色。"
        },
        {
          title: "星期周期",
          difficulty: "进阶",
          question: "今天是星期二，20 天后是星期几？",
          answer: "星期一",
          analysis: "星期 7 天一个周期，20 ÷ 7 = 2 余 6，从星期二往后数 6 天是星期一。"
        },
        {
          title: "数列周期",
          difficulty: "提高",
          question: "数列 1，2，4，1，2，4……第 35 项是多少？",
          answer: "2",
          analysis: "3 项一组，35 ÷ 3 = 11 余 2，所以第 35 项是每组第 2 项 2。"
        }
      ],
      practices: [
        {
          id: "periodicity-1",
          title: "颜色循环",
          difficulty: "基础",
          prompt: "按“红、黄、蓝、红、黄、蓝……”排列，第 20 个是什么颜色？",
          answer: "黄",
          explanation: "3 个一组，20 ÷ 3 = 6 余 2，第 20 个是每组第 2 个：黄。",
          hints: ["先找一组有几个。", "余数表示落在一组里的第几个。"],
          solutionSteps: ["周期是红、黄、蓝，共 3 个。", "20 ÷ 3 = 6 余 2。", "余 2 表示每组第 2 个，所以是黄。"],
          commonMistakes: ["把商 6 当作答案位置。", "余 0 时才看成每组最后一个，这题余 2。"]
        },
        {
          id: "periodicity-2",
          title: "图形周期",
          difficulty: "基础",
          prompt: "按“○、□、△、○、□、△……”排列，第 17 个图形是什么？",
          answer: "□",
          acceptedAnswers: ["方形", "正方形", "□"],
          explanation: "3 个一组，17 ÷ 3 = 5 余 2，第 17 个是每组第 2 个 □。",
          hints: ["圈出重复的一组。", "看 17 除以周期长度的余数。"],
          solutionSteps: ["周期长度是 3。", "17 ÷ 3 = 5 余 2。", "每组第 2 个是 □。"],
          commonMistakes: ["数到第 17 个时漏掉一个图形。", "把余数 2 看成第三个。"]
        },
        {
          id: "periodicity-3",
          title: "星期推算",
          difficulty: "进阶",
          prompt: "今天是星期五，10 天后是星期几？",
          answer: "星期一",
          acceptedAnswers: ["周一", "礼拜一", "星期1"],
          explanation: "10 ÷ 7 = 1 余 3，从星期五往后数 3 天是星期一。",
          hints: ["星期问题 7 天一周期。", "只需要看余数。"],
          solutionSteps: ["10 天里有 1 个完整星期，还余 3 天。", "从星期五往后数 3 天：六、日、一。", "所以是星期一。"],
          commonMistakes: ["把今天也算作第 1 天。", "没有用 7 天周期化简。"]
        },
        {
          id: "periodicity-4",
          title: "余 0 情况",
          difficulty: "进阶",
          prompt: "按“甲、乙、丙、丁”循环排列，第 32 个是谁？",
          answer: "丁",
          explanation: "4 个一组，32 ÷ 4 = 8 余 0，余 0 表示每组最后一个，所以是丁。",
          hints: ["周期长度是 4。", "整除时看每组最后一个。"],
          solutionSteps: ["一组是甲、乙、丙、丁，共 4 个。", "32 ÷ 4 = 8 余 0。", "余 0 对应每组最后一个丁。"],
          commonMistakes: ["余 0 时误以为是第 1 个。", "忘记整除代表刚好落在组尾。"]
        },
        {
          id: "periodicity-5",
          title: "数字周期",
          difficulty: "提高",
          prompt: "数列 2，5，8，2，5，8……第 41 项是多少？",
          answer: "5",
          explanation: "3 项一组，41 ÷ 3 = 13 余 2，第 41 项是每组第 2 项 5。",
          hints: ["先确认重复组是 2、5、8。", "用项数除以周期长度。"],
          solutionSteps: ["周期长度是 3。", "41 ÷ 3 = 13 余 2。", "每组第 2 项是 5。"],
          commonMistakes: ["把数列当成等差数列。", "只看相邻差，没有发现重复。"]
        },
        {
          id: "periodicity-6",
          title: "复杂周期",
          difficulty: "挑战",
          prompt: "按“1，1，2，3，1，1，2，3……”排列，第 50 个数是多少？",
          answer: "1",
          explanation: "4 个一组，50 ÷ 4 = 12 余 2，第 50 个是每组第 2 个 1。",
          hints: ["重复组不是 1、2、3，而是 1、1、2、3。", "余数对应组内位置。"],
          solutionSteps: ["一组是 1，1，2，3，共 4 个。", "50 ÷ 4 = 12 余 2。", "第 2 个是 1，所以答案是 1。"],
          commonMistakes: ["把两个连续的 1 合并，只看成 3 个一组。", "没有完整识别周期。"]
        }
      ]
    },
    {
      id: "enumeration",
      title: "有序枚举",
      grades: ["三年级", "四年级", "五年级"],
      description: "学会不重不漏地列出所有可能，是计数、逻辑和组合问题的基础。",
      examples: [
        {
          title: "分类列举",
          difficulty: "基础",
          question: "用 1、2、3 可以组成多少个没有重复数字的两位数？",
          answer: "6 个",
          analysis: "十位有 3 种选法，个位剩 2 种，共 3 × 2 = 6 个。"
        },
        {
          title: "列表枚举",
          difficulty: "进阶",
          question: "买 1 元和 2 元邮票共 4 张，一共有多少种总价？",
          answer: "5 种",
          analysis: "2 元邮票可取 0、1、2、3、4 张，对应总价 4、5、6、7、8 元，共 5 种。"
        },
        {
          title: "树状图",
          difficulty: "提高",
          question: "上衣 2 件，裤子 3 条，一共有多少种搭配？",
          answer: "6 种",
          analysis: "每件上衣都能配 3 条裤子，共 2 × 3 = 6 种。"
        }
      ],
      practices: [
        {
          id: "enumeration-1",
          title: "两位数",
          difficulty: "基础",
          prompt: "用 4、5、6 可以组成多少个没有重复数字的两位数？",
          answer: "6",
          explanation: "十位有 3 种选法，个位剩 2 种，所以 3 × 2 = 6 个。",
          hints: ["先选十位，再选个位。", "不能重复使用数字。"],
          solutionSteps: ["十位可以选 4、5、6，共 3 种。", "十位选定后，个位还剩 2 种。", "3 × 2 = 6。"],
          commonMistakes: ["把 44、55、66 也算进去。", "只列出 45、56、64 等少数几个。"]
        },
        {
          id: "enumeration-2",
          title: "三种搭配",
          difficulty: "基础",
          prompt: "有 2 顶帽子和 4 件上衣，每次选一顶帽子和一件上衣，一共有多少种搭配？",
          answer: "8",
          explanation: "每顶帽子可搭配 4 件上衣，2 顶帽子共 2 × 4 = 8 种。",
          hints: ["固定一顶帽子，看有几种上衣。", "再乘帽子数量。"],
          solutionSteps: ["每顶帽子有 4 种搭配。", "一共有 2 顶帽子。", "2 × 4 = 8。"],
          commonMistakes: ["把 2 和 4 相加得到 6。", "没有理解“每次选一顶和一件”。"]
        },
        {
          id: "enumeration-3",
          title: "分类计数",
          difficulty: "进阶",
          prompt: "从 A、B、C、D 四人中选 1 人当组长，有多少种选法？",
          answer: "4",
          explanation: "组长只选 1 人，可以是 A、B、C、D，共 4 种。",
          hints: ["这是单步选择。", "每个人都对应一种选法。"],
          solutionSteps: ["列出可能：A、B、C、D。", "共有 4 个可能。", "所以有 4 种选法。"],
          commonMistakes: ["把排列顺序也算进去。", "误以为要选多人。"]
        },
        {
          id: "enumeration-4",
          title: "选两人握手",
          difficulty: "提高",
          prompt: "4 个人两两握手，每两人握一次，一共握手多少次？",
          answer: "6",
          explanation: "A 可和 3 人握，B 再和 2 人握，C 再和 1 人握，共 3 + 2 + 1 = 6 次。",
          hints: ["握手不分先后，A-B 和 B-A 是同一次。", "可以按人逐步列举。"],
          solutionSteps: ["A 与 B、C、D 握手：3 次。", "B 与 C、D 握手：2 次。", "C 与 D 握手：1 次。", "3 + 2 + 1 = 6。"],
          commonMistakes: ["用 4 × 3 = 12，重复计算了两次。", "漏掉最后 C 和 D 的一次。"]
        },
        {
          id: "enumeration-5",
          title: "有序安排",
          difficulty: "提高",
          prompt: "甲、乙、丙三人排成一排，一共有多少种不同排法？",
          answer: "6",
          explanation: "第 1 个位置 3 种，第 2 个位置 2 种，第 3 个位置 1 种，共 3 × 2 × 1 = 6 种。",
          hints: ["排队是有顺序的。", "从第一个位置开始选择。"],
          solutionSteps: ["第 1 个位置有 3 种选法。", "第 2 个位置剩 2 种选法。", "第 3 个位置剩 1 种选法。", "3 × 2 × 1 = 6。"],
          commonMistakes: ["把排队当成选人，只算 3 种。", "重复列举时没有固定顺序。"]
        },
        {
          id: "enumeration-6",
          title: "不重不漏",
          difficulty: "挑战",
          prompt: "用 0、1、2、3 可以组成多少个没有重复数字的两位数？",
          answer: "9",
          explanation: "十位不能是 0，有 1、2、3 共 3 种；个位可从剩下 3 个数字中选，共 3 × 3 = 9 个。",
          hints: ["两位数的十位不能是 0。", "十位选好后，个位还能选剩下 3 个数字。"],
          solutionSteps: ["十位可选 1、2、3，共 3 种。", "每种十位下，个位从剩下 3 个数字中选。", "3 × 3 = 9。"],
          commonMistakes: ["把 0 放在十位，算出 12 个。", "完全排除 0，少算含 0 的数。"]
        }
      ]
    },
    {
      id: "inclusion-exclusion",
      title: "容斥初步",
      grades: ["四年级", "五年级", "六年级"],
      description: "理解重叠部分不能重复计算，是集合计数和逻辑统计的基础。",
      examples: [
        {
          title: "两类重叠",
          difficulty: "基础",
          question: "班里有 18 人喜欢足球，15 人喜欢篮球，其中 6 人两项都喜欢，至少喜欢一项的有多少人？",
          answer: "27 人",
          analysis: "18 + 15 把两项都喜欢的人算了两次，所以要减去 6，得到 27。"
        },
        {
          title: "反求重叠",
          difficulty: "进阶",
          question: "喜欢 A 的有 20 人，喜欢 B 的有 16 人，至少喜欢一项的有 30 人，两项都喜欢的有多少人？",
          answer: "6 人",
          analysis: "20 + 16 = 36，比 30 多出的 6 人就是被重复计算的重叠部分。"
        },
        {
          title: "总人数与都不喜欢",
          difficulty: "提高",
          question: "全班 40 人，喜欢足球或篮球的有 28 人，两项都不喜欢的有多少人？",
          answer: "12 人",
          analysis: "都不喜欢 = 总人数 - 至少喜欢一项 = 40 - 28 = 12。"
        }
      ],
      practices: [
        {
          id: "inclusion-exclusion-1",
          title: "求并集",
          difficulty: "基础",
          prompt: "有 12 人喜欢画画，10 人喜欢唱歌，其中 4 人两项都喜欢。至少喜欢一项的有多少人？",
          answer: "18",
          explanation: "12 + 10 - 4 = 18，因为两项都喜欢的人被重复算了一次。",
          hints: ["先相加，再减去重复部分。", "两项都喜欢的人被算了两遍。"],
          solutionSteps: ["喜欢画画和唱歌的人数相加：12 + 10 = 22。", "两项都喜欢的 4 人被重复算了。", "22 - 4 = 18。"],
          commonMistakes: ["直接 12 + 10 = 22。", "把重叠部分又加了一次。"]
        },
        {
          id: "inclusion-exclusion-2",
          title: "反求重叠",
          difficulty: "进阶",
          prompt: "喜欢数学的有 16 人，喜欢科学的有 14 人，至少喜欢一项的有 24 人，两项都喜欢的有多少人？",
          answer: "6",
          explanation: "16 + 14 = 30，比 24 多 6，多出来的是重复计算的重叠部分。",
          hints: ["两类人数相加会重复计算重叠部分。", "相加结果比实际并集多多少，就重叠多少。"],
          solutionSteps: ["先加：16 + 14 = 30。", "实际至少喜欢一项的是 24。", "30 - 24 = 6，所以两项都喜欢的有 6 人。"],
          commonMistakes: ["用 24 - 16。", "把至少喜欢一项当成总人数。"]
        },
        {
          id: "inclusion-exclusion-3",
          title: "都不参加",
          difficulty: "进阶",
          prompt: "全班 35 人，参加足球的有 18 人，参加篮球的有 15 人，两项都参加的有 5 人。两项都不参加的有多少人？",
          answer: "7",
          explanation: "至少参加一项的有 18 + 15 - 5 = 28 人，都不参加的是 35 - 28 = 7 人。",
          hints: ["先求至少参加一项的人数。", "再用全班人数减去。"],
          solutionSteps: ["至少参加一项：18 + 15 - 5 = 28。", "全班 35 人。", "35 - 28 = 7。"],
          commonMistakes: ["只算 35 - 18 - 15。", "忘记两项都参加的人被重复减了。"]
        },
        {
          id: "inclusion-exclusion-4",
          title: "调查统计",
          difficulty: "提高",
          prompt: "有 25 人订语文报，22 人订数学报，10 人两种都订，至少订一种报纸的有多少人？",
          answer: "37",
          explanation: "25 + 22 - 10 = 37。",
          hints: ["订两种的人在两个数字里都出现了。", "合起来时要减一次。"],
          solutionSteps: ["25 + 22 = 47。", "两种都订的 10 人重复算一次。", "47 - 10 = 37。"],
          commonMistakes: ["认为两种都订要排除掉。", "没有理解至少订一种包含两种都订。"]
        },
        {
          id: "inclusion-exclusion-5",
          title: "至少一项",
          difficulty: "提高",
          prompt: "全班 42 人，20 人会游泳，18 人会滑冰，8 人两项都会，至少会一项的有多少人？",
          answer: "30",
          explanation: "20 + 18 - 8 = 30。",
          hints: ["全班 42 人在这题中不一定都用上。", "先求会游泳或会滑冰的人。"],
          solutionSteps: ["会游泳和滑冰相加：20 + 18 = 38。", "两项都会的 8 人重复算了。", "38 - 8 = 30。"],
          commonMistakes: ["看到全班 42 人就直接做减法。", "把至少一项误解为只会一项。"]
        },
        {
          id: "inclusion-exclusion-6",
          title: "只会一项",
          difficulty: "挑战",
          prompt: "会弹琴的有 15 人，会画画的有 13 人，两项都会的有 4 人。只会其中一项的有多少人？",
          answer: "20",
          explanation: "只会弹琴 15 - 4 = 11，只会画画 13 - 4 = 9，共 20 人。",
          hints: ["只会一项不包括两项都会的人。", "分别求只会 A 和只会 B。"],
          solutionSteps: ["只会弹琴：15 - 4 = 11。", "只会画画：13 - 4 = 9。", "11 + 9 = 20。"],
          commonMistakes: ["用 15 + 13 - 4 = 24，这是至少会一项。", "把两项都会的人也算入只会一项。"]
        }
      ]
    },
    {
      id: "unit-rate",
      title: "归一归总问题",
      grades: ["三年级", "四年级", "五年级"],
      description: "先找一份量或总量，再迁移到新的数量，是应用题建模的核心桥梁。",
      examples: [
        {
          title: "先归一",
          difficulty: "基础",
          question: "3 本练习本 12 元，买 5 本多少钱？",
          answer: "20 元",
          analysis: "先求 1 本 12 ÷ 3 = 4 元，再求 5 本 4 × 5 = 20 元。"
        },
        {
          title: "先归总",
          difficulty: "进阶",
          question: "4 人 3 天吃 24 个苹果，1 人 1 天吃几个？",
          answer: "2 个",
          analysis: "总量 24 个对应 4 × 3 = 12 人天，1 人 1 天吃 24 ÷ 12 = 2 个。"
        },
        {
          title: "同效率迁移",
          difficulty: "提高",
          question: "6 台机器 5 小时生产 300 个零件，1 台机器 1 小时生产多少个？",
          answer: "10 个",
          analysis: "300 ÷ 6 ÷ 5 = 10。先把多台多小时归到一台一小时。"
        }
      ],
      practices: [
        {
          id: "unit-rate-1",
          title: "单价归一",
          difficulty: "基础",
          prompt: "4 支铅笔 12 元，买 7 支铅笔多少元？",
          answer: "21",
          explanation: "1 支铅笔 12 ÷ 4 = 3 元，7 支是 3 × 7 = 21 元。",
          hints: ["先求 1 支多少钱。", "再乘 7 支。"],
          solutionSteps: ["12 ÷ 4 = 3，1 支 3 元。", "3 × 7 = 21。", "买 7 支需要 21 元。"],
          commonMistakes: ["直接 12 × 7。", "没有先求一份量。"]
        },
        {
          id: "unit-rate-2",
          title: "速度归一",
          difficulty: "基础",
          prompt: "小明 5 分钟走 300 米，照这样走，8 分钟走多少米？",
          answer: "480",
          explanation: "每分钟走 300 ÷ 5 = 60 米，8 分钟走 60 × 8 = 480 米。",
          hints: ["照这样走表示速度不变。", "先求 1 分钟走多少米。"],
          solutionSteps: ["300 ÷ 5 = 60 米/分。", "60 × 8 = 480 米。", "所以 8 分钟走 480 米。"],
          commonMistakes: ["用 300 ÷ 8。", "忘记先求单位时间。"]
        },
        {
          id: "unit-rate-3",
          title: "多人多天",
          difficulty: "进阶",
          prompt: "3 人 4 天吃 36 个苹果，平均 1 人 1 天吃几个苹果？",
          answer: "3",
          explanation: "3 人 4 天共有 12 人天，36 ÷ 12 = 3 个。",
          hints: ["先求一共有多少个人天。", "再把总量平均到 1 人 1 天。"],
          solutionSteps: ["3 × 4 = 12 人天。", "36 ÷ 12 = 3。", "平均 1 人 1 天吃 3 个苹果。"],
          commonMistakes: ["只除以 3 或只除以 4。", "没有理解人天这个总份数。"]
        },
        {
          id: "unit-rate-4",
          title: "机器效率",
          difficulty: "提高",
          prompt: "5 台机器 6 小时生产 240 个零件，1 台机器 1 小时生产多少个？",
          answer: "8",
          explanation: "总机器小时是 5 × 6 = 30，240 ÷ 30 = 8 个。",
          hints: ["先求机器小时。", "总产量除以总机器小时。"],
          solutionSteps: ["5 台机器工作 6 小时，共 5 × 6 = 30 台时。", "240 ÷ 30 = 8。", "1 台机器 1 小时生产 8 个。"],
          commonMistakes: ["先 240 ÷ 5 后忘记再除以 6。", "把 5 + 6 当成总份数。"]
        },
        {
          id: "unit-rate-5",
          title: "归一再放大",
          difficulty: "提高",
          prompt: "6 个工人 3 天修路 90 米，照这样，4 个工人 5 天修路多少米？",
          answer: "100",
          explanation: "1 个工人 1 天修 90 ÷ 6 ÷ 3 = 5 米，4 个工人 5 天修 5 × 4 × 5 = 100 米。",
          hints: ["先归到 1 人 1 天。", "再放大到 4 人 5 天。"],
          solutionSteps: ["90 ÷ 6 ÷ 3 = 5 米。", "1 人 1 天修 5 米。", "5 × 4 × 5 = 100 米。"],
          commonMistakes: ["只按人数变化，不按天数变化。", "直接 90 ÷ 6 × 4。"]
        },
        {
          id: "unit-rate-6",
          title: "反求数量",
          difficulty: "挑战",
          prompt: "3 台机器 4 小时生产 96 个零件，照这样，2 台机器生产 64 个零件需要几小时？",
          answer: "4",
          explanation: "1 台机器 1 小时生产 96 ÷ 3 ÷ 4 = 8 个；2 台机器每小时生产 16 个，64 ÷ 16 = 4 小时。",
          hints: ["先求 1 台机器 1 小时效率。", "再求 2 台机器每小时效率。"],
          solutionSteps: ["96 ÷ 3 ÷ 4 = 8 个/台时。", "2 台机器 1 小时生产 8 × 2 = 16 个。", "64 ÷ 16 = 4 小时。"],
          commonMistakes: ["只用 64 ÷ 8。", "没有把 2 台机器合起来的效率算出来。"]
        }
      ]
    },
    {
      id: "surplus-deficit",
      title: "盈亏问题",
      grades: ["四年级", "五年级", "六年级"],
      description: "通过两种分配方案的差异，反推出份数或人数，是差量思想的重要应用。",
      examples: [
        {
          title: "一盈一亏",
          difficulty: "基础",
          question: "把苹果分给小朋友，每人 3 个多 6 个，每人 4 个少 2 个，有几个小朋友？",
          answer: "8 个",
          analysis: "两种分法每人相差 1 个，总差是 6 + 2 = 8 个，所以有 8 个小朋友。"
        },
        {
          title: "两次都盈",
          difficulty: "进阶",
          question: "每人 3 个多 10 个，每人 5 个多 2 个，有几个人？",
          answer: "4 个",
          analysis: "每人多分 2 个，总剩余少了 8 个，所以人数是 8 ÷ 2 = 4。"
        },
        {
          title: "两次都亏",
          difficulty: "提高",
          question: "每人 6 个少 8 个，每人 4 个少 2 个，有几个人？",
          answer: "3 个",
          analysis: "每人少分 2 个，总缺少减少 6 个，所以人数是 6 ÷ 2 = 3。"
        }
      ],
      practices: [
        {
          id: "surplus-deficit-1",
          title: "一盈一亏",
          difficulty: "基础",
          prompt: "分糖果，每人 5 颗多 12 颗，每人 6 颗少 3 颗。有几个小朋友？",
          answer: "15",
          explanation: "每人多分 1 颗，总差是 12 + 3 = 15 颗，所以有 15 个小朋友。",
          hints: ["一盈一亏时，总差要相加。", "每人差 1 颗。"],
          solutionSteps: ["两种方案每人相差 6 - 5 = 1 颗。", "总差是多 12 到少 3，共 12 + 3 = 15 颗。", "15 ÷ 1 = 15 人。"],
          commonMistakes: ["用 12 - 3。", "没有理解“多”和“少”在相反方向。"]
        },
        {
          id: "surplus-deficit-2",
          title: "求人数",
          difficulty: "基础",
          prompt: "分铅笔，每人 4 支多 8 支，每人 5 支刚好分完。有几个人？",
          answer: "8",
          explanation: "每人多分 1 支，原来多出的 8 支刚好补上，所以有 8 人。",
          hints: ["刚好分完可以看作多 0 支。", "每人多分 1 支。"],
          solutionSteps: ["两种方案每人相差 1 支。", "剩余从多 8 支变成多 0 支，差 8 支。", "8 ÷ 1 = 8 人。"],
          commonMistakes: ["把刚好分完当作少 1。", "直接用 8 ÷ 5。"]
        },
        {
          id: "surplus-deficit-3",
          title: "两次都盈",
          difficulty: "进阶",
          prompt: "分练习本，每人 3 本多 15 本，每人 6 本多 3 本。有几个学生？",
          answer: "4",
          explanation: "每人多分 3 本，剩余减少 12 本，人数是 12 ÷ 3 = 4。",
          hints: ["两次都多，比较剩余减少了多少。", "每个人多拿了 3 本。"],
          solutionSteps: ["每人差：6 - 3 = 3 本。", "剩余差：15 - 3 = 12 本。", "12 ÷ 3 = 4 人。"],
          commonMistakes: ["把剩余 15 和 3 相加。", "没区分一盈一亏和两次都盈。"]
        },
        {
          id: "surplus-deficit-4",
          title: "两次都亏",
          difficulty: "提高",
          prompt: "分书，每人 7 本少 10 本，每人 5 本少 2 本。有几个学生？",
          answer: "4",
          explanation: "每人少分 2 本，缺少量从 10 本减少到 2 本，差 8 本，8 ÷ 2 = 4 人。",
          hints: ["两次都少，比较缺少量的差。", "每人分法差 2 本。"],
          solutionSteps: ["每人差：7 - 5 = 2 本。", "缺少量差：10 - 2 = 8 本。", "8 ÷ 2 = 4 人。"],
          commonMistakes: ["用 10 + 2。", "把缺少量差和每人差混淆。"]
        },
        {
          id: "surplus-deficit-5",
          title: "求总量",
          difficulty: "提高",
          prompt: "分苹果，每人 4 个多 6 个，每人 6 个少 4 个。一共有多少个苹果？",
          answer: "26",
          explanation: "人数是 (6 + 4) ÷ (6 - 4) = 5 人，总数是 4 × 5 + 6 = 26 个。",
          hints: ["先求人数，再求总数。", "一盈一亏，总差相加。"],
          solutionSteps: ["每人差：6 - 4 = 2 个。", "总差：6 + 4 = 10 个。", "人数：10 ÷ 2 = 5 人。", "总数：4 × 5 + 6 = 26 个。"],
          commonMistakes: ["求出人数后忘记继续求苹果总数。", "用 6 × 5 + 4。"]
        },
        {
          id: "surplus-deficit-6",
          title: "方案比较",
          difficulty: "挑战",
          prompt: "分卡片，每人 8 张少 12 张，每人 5 张多 9 张。共有多少张卡片？",
          answer: "44",
          explanation: "人数是 (12 + 9) ÷ (8 - 5) = 7 人，总数是 5 × 7 + 9 = 44 张。",
          hints: ["一亏一盈，总差相加。", "题目问总卡片数，不是人数。"],
          solutionSteps: ["每人差：8 - 5 = 3 张。", "总差：12 + 9 = 21 张。", "人数：21 ÷ 3 = 7 人。", "总卡片数：5 × 7 + 9 = 44 张。"],
          commonMistakes: ["只回答 7 人。", "少 12 和多 9 的方向处理错。"]
        }
      ]
    }
  ];

  function mergeContinuityModules(existingModules = [], additions = continuityModules) {
    const knownIds = new Set(existingModules.map((module) => module.id));
    const nextModules = [...existingModules];
    additions.forEach((module) => {
      if (!knownIds.has(module.id)) {
        nextModules.push(module);
        knownIds.add(module.id);
      }
    });
    return nextModules;
  }

  const api = {
    continuityModules,
    mergeContinuityModules
  };

  if (Array.isArray(root.MATH_LEARNING_DATA)) {
    root.MATH_LEARNING_DATA = mergeContinuityModules(root.MATH_LEARNING_DATA);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.KnowledgeContinuityExpansion = api;
})(typeof window !== "undefined" ? window : globalThis);
