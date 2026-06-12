(function attachContentExpansion(root) {
  const expansionModules = [
    {
      id: "tree-planting",
      title: "植树问题",
      grades: ["三年级", "四年级", "五年级"],
      description: "理解两端都种、只种一端、两端都不种和封闭路线中的棵数关系。",
      examples: [
        {
          title: "两端都种",
          difficulty: "基础",
          question: "一条路长 40 米，每隔 5 米种一棵树，两端都种，一共种多少棵？",
          answer: "9 棵",
          analysis: "先算间隔数：40 ÷ 5 = 8。两端都种时，棵数 = 间隔数 + 1，所以是 9 棵。"
        },
        {
          title: "两端都不种",
          difficulty: "进阶",
          question: "一条走廊长 30 米，每隔 5 米放一盆花，两端都不放，一共放多少盆？",
          answer: "5 盆",
          analysis: "间隔数是 30 ÷ 5 = 6。两端都不放时，盆数 = 间隔数 - 1，所以是 5 盆。"
        },
        {
          title: "封闭路线",
          difficulty: "提高",
          question: "圆形花坛一圈长 36 米，每隔 6 米放一盆花，一共放多少盆？",
          answer: "6 盆",
          analysis: "封闭路线首尾相接，盆数 = 间隔数，36 ÷ 6 = 6。"
        }
      ],
      practices: [
        {
          id: "tree-planting-1",
          title: "两端都种",
          difficulty: "基础",
          prompt: "一条路长 24 米，每隔 4 米种一棵树，两端都种，一共种多少棵？",
          answer: "7",
          explanation: "间隔数是 24 ÷ 4 = 6，两端都种要加 1，所以是 7 棵。",
          hints: ["先算有几个间隔。", "题目说两端都种，棵数比间隔数多 1。"],
          solutionSteps: ["24 ÷ 4 = 6，得到 6 个间隔。", "两端都种：棵数 = 间隔数 + 1。", "6 + 1 = 7，所以一共种 7 棵。"],
          commonMistakes: ["把 6 个间隔直接当成 6 棵树。", "没有区分两端都种和两端都不种。"]
        },
        {
          id: "tree-planting-2",
          title: "只种一端",
          difficulty: "基础",
          prompt: "一条小路长 35 米，每隔 5 米插一面小旗，只在起点插，终点不插，一共插多少面？",
          answer: "7",
          explanation: "间隔数是 35 ÷ 5 = 7，只种一端时，数量等于间隔数。",
          hints: ["先算 35 米里有几个 5 米。", "只种一端时，数量不加也不减。"],
          solutionSteps: ["35 ÷ 5 = 7，得到 7 个间隔。", "只在一端插旗：旗数 = 间隔数。", "所以一共插 7 面。"],
          commonMistakes: ["看到端点就习惯性加 1。", "把只种一端误判成两端都种。"]
        },
        {
          id: "tree-planting-3",
          title: "两端都不种",
          difficulty: "进阶",
          prompt: "一条走廊长 48 米，每隔 6 米放一盆花，两端都不放，一共放多少盆？",
          answer: "7",
          explanation: "间隔数是 48 ÷ 6 = 8，两端都不放要减 1，所以是 7 盆。",
          hints: ["先找间隔数。", "两端都不放时，数量比间隔数少 1。"],
          solutionSteps: ["48 ÷ 6 = 8，得到 8 个间隔。", "两端都不放：盆数 = 间隔数 - 1。", "8 - 1 = 7，所以放 7 盆。"],
          commonMistakes: ["忘记两端都不放要减 1。", "把走廊问题当成封闭路线问题。"]
        },
        {
          id: "tree-planting-4",
          title: "封闭路线",
          difficulty: "进阶",
          prompt: "一个圆形跑道长 60 米，每隔 10 米放一个标志桶，一共放多少个？",
          answer: "6",
          explanation: "封闭路线数量等于间隔数，60 ÷ 10 = 6。",
          hints: ["圆形跑道是封闭路线。", "封闭路线不要加 1。"],
          solutionSteps: ["60 ÷ 10 = 6，得到 6 个间隔。", "封闭路线首尾相接，桶数 = 间隔数。", "所以一共放 6 个标志桶。"],
          commonMistakes: ["把圆形路线当成直线两端都种而加 1。", "忘记首尾是同一个连接点。"]
        },
        {
          id: "tree-planting-5",
          title: "反求间距",
          difficulty: "提高",
          prompt: "一条路长 45 米，两端都种树，一共种 10 棵。相邻两棵树相隔多少米？",
          answer: "5",
          explanation: "两端都种时，间隔数 = 棵数 - 1 = 9，45 ÷ 9 = 5 米。",
          hints: ["这题反过来求间距。", "两端都种时，间隔数比棵数少 1。"],
          solutionSteps: ["10 棵树形成 10 - 1 = 9 个间隔。", "总长度 45 米平均分成 9 段。", "45 ÷ 9 = 5，所以间隔 5 米。"],
          commonMistakes: ["直接用 45 ÷ 10。", "没有先把棵数转换成间隔数。"]
        },
        {
          id: "tree-planting-6",
          title: "综合判断",
          difficulty: "挑战",
          prompt: "一条路每隔 8 米装一盏灯，两端都装，共装 13 盏。这条路长多少米？",
          answer: "96",
          explanation: "两端都装时，间隔数 = 13 - 1 = 12，长度 = 12 × 8 = 96 米。",
          hints: ["先由灯数反推间隔数。", "两端都装：间隔数 = 灯数 - 1。"],
          solutionSteps: ["13 盏灯形成 12 个间隔。", "每个间隔 8 米。", "12 × 8 = 96，所以路长 96 米。"],
          commonMistakes: ["用 13 × 8 得到 104。", "没有区分灯数和间隔数。"]
        }
      ]
    },
    {
      id: "chicken-rabbit",
      title: "鸡兔同笼",
      grades: ["四年级", "五年级", "六年级"],
      description: "用假设法、替换法解决头数和脚数同时已知的问题。",
      examples: [
        {
          title: "假设全是鸡",
          difficulty: "基础",
          question: "鸡兔同笼，共 8 个头，22 条腿，鸡和兔各有几只？",
          answer: "鸡 5 只，兔 3 只",
          analysis: "假设全是鸡，有 8 × 2 = 16 条腿，少 6 条。每只兔比鸡多 2 条腿，所以兔有 6 ÷ 2 = 3 只，鸡有 5 只。"
        },
        {
          title: "假设全是兔",
          difficulty: "进阶",
          question: "鸡兔同笼，共 10 个头，28 条腿，鸡有几只？",
          answer: "6 只",
          analysis: "假设全是兔，有 40 条腿，多 12 条。每只鸡比兔少 2 条腿，所以鸡有 12 ÷ 2 = 6 只。"
        },
        {
          title: "车辆轮子问题",
          difficulty: "提高",
          question: "自行车和三轮车共 9 辆，共 22 个轮子，三轮车有几辆？",
          answer: "4 辆",
          analysis: "假设全是自行车，有 18 个轮子，少 4 个。每辆三轮车比自行车多 1 个轮子，所以三轮车有 4 辆。"
        }
      ],
      practices: [
        {
          id: "chicken-rabbit-1",
          title: "基础鸡兔",
          difficulty: "基础",
          prompt: "鸡兔同笼，共 9 个头，24 条腿，兔有几只？",
          answer: "3",
          explanation: "假设全是鸡，有 9 × 2 = 18 条腿，少 6 条；每只兔多 2 条腿，所以兔有 6 ÷ 2 = 3 只。",
          hints: ["可以先假设全是鸡。", "每换成一只兔，腿数会多 2 条。"],
          solutionSteps: ["假设 9 只全是鸡：9 × 2 = 18 条腿。", "实际有 24 条腿，多出 24 - 18 = 6 条。", "每只兔比鸡多 2 条腿，所以兔有 6 ÷ 2 = 3 只。"],
          commonMistakes: ["直接用 24 ÷ 4 当兔数。", "忘记头数必须保持 9 个不变。"]
        },
        {
          id: "chicken-rabbit-2",
          title: "求鸡数量",
          difficulty: "基础",
          prompt: "鸡兔同笼，共 7 个头，20 条腿，鸡有几只？",
          answer: "4",
          explanation: "假设全是兔，有 7 × 4 = 28 条腿，多 8 条；每只鸡少 2 条腿，所以鸡有 8 ÷ 2 = 4 只。",
          hints: ["要求鸡，也可以假设全是兔。", "每把一只兔换成鸡，腿数少 2 条。"],
          solutionSteps: ["假设 7 只全是兔：7 × 4 = 28 条腿。", "比实际多 28 - 20 = 8 条。", "每只鸡比兔少 2 条腿，所以鸡有 8 ÷ 2 = 4 只。"],
          commonMistakes: ["只算出兔数后忘记用总头数减。", "多出的腿数方向判断反了。"]
        },
        {
          id: "chicken-rabbit-3",
          title: "车辆轮子",
          difficulty: "进阶",
          prompt: "自行车和三轮车共 11 辆，共 28 个轮子，三轮车有几辆？",
          answer: "6",
          explanation: "假设全是自行车，有 22 个轮子，少 6 个；每辆三轮车多 1 个轮子，所以三轮车有 6 辆。",
          hints: ["把自行车看作 2 个轮子，三轮车看作 3 个轮子。", "先假设全是自行车。"],
          solutionSteps: ["假设 11 辆全是自行车：11 × 2 = 22 个轮子。", "实际有 28 个，多出 6 个。", "每辆三轮车比自行车多 1 个轮子，所以三轮车有 6 辆。"],
          commonMistakes: ["照搬鸡兔的“多 2 条腿”，没有看轮子差是 1。", "把辆数和轮子数混在一起。"]
        },
        {
          id: "chicken-rabbit-4",
          title: "邮票面值",
          difficulty: "提高",
          prompt: "2 元和 5 元邮票共 10 张，总面值 32 元。5 元邮票有几张？",
          answer: "4",
          explanation: "假设全是 2 元，共 20 元，少 12 元；每张 5 元比 2 元多 3 元，所以 5 元邮票有 12 ÷ 3 = 4 张。",
          hints: ["这类题和鸡兔同笼同型。", "先假设全是低面值邮票。"],
          solutionSteps: ["假设 10 张全是 2 元：10 × 2 = 20 元。", "实际 32 元，多出 12 元。", "每张 5 元比 2 元多 3 元，所以 12 ÷ 3 = 4 张。"],
          commonMistakes: ["没有把面值差算成 3 元。", "把 32 ÷ 5 当作 5 元邮票张数。"]
        },
        {
          id: "chicken-rabbit-5",
          title: "竞赛得分",
          difficulty: "提高",
          prompt: "答对一题得 5 分，答错一题扣 1 分。小明做 12 题得 42 分，他答对几题？",
          answer: "9",
          explanation: "假设全答错得 -12 分，实际多 54 分；每把一题改成答对，分数增加 6 分，所以答对 54 ÷ 6 = 9 题。",
          hints: ["也可以把答对、答错看成两类对象。", "从全答错开始假设更容易。"],
          solutionSteps: ["假设 12 题全错：得 -12 分。", "实际 42 分，比 -12 多 54 分。", "一题从错改对，分数从 -1 到 5，增加 6 分。", "54 ÷ 6 = 9，所以答对 9 题。"],
          commonMistakes: ["只用 42 ÷ 5。", "忘记答错会扣 1 分。"]
        },
        {
          id: "chicken-rabbit-6",
          title: "综合反推",
          difficulty: "挑战",
          prompt: "鸡兔同笼，共 15 个头，44 条腿，鸡有几只？",
          answer: "8",
          explanation: "假设全是兔，有 60 条腿，多 16 条；每只鸡少 2 条腿，所以鸡有 16 ÷ 2 = 8 只。",
          hints: ["要求鸡，可以假设全是兔。", "多出来的腿要靠鸡来减少。"],
          solutionSteps: ["假设 15 只全是兔：15 × 4 = 60 条腿。", "实际 44 条，比假设少 16 条。", "每只鸡比兔少 2 条腿。", "16 ÷ 2 = 8，所以鸡有 8 只。"],
          commonMistakes: ["算出兔有 8 只，却把问题问的鸡看错。", "用 44 ÷ 4 近似判断。"]
        }
      ]
    },
    {
      id: "motion",
      title: "行程问题",
      grades: ["四年级", "五年级", "六年级"],
      description: "掌握路程、速度、时间之间的关系，理解相遇和追及问题。",
      examples: [
        {
          title: "基本关系",
          difficulty: "基础",
          question: "小明每分钟走 60 米，走 8 分钟，一共走多少米？",
          answer: "480 米",
          analysis: "路程 = 速度 × 时间，所以 60 × 8 = 480 米。"
        },
        {
          title: "相遇问题",
          difficulty: "进阶",
          question: "甲乙两人相距 900 米，相向而行，甲每分钟 50 米，乙每分钟 40 米，几分钟相遇？",
          answer: "10 分钟",
          analysis: "相向而行时速度相加，900 ÷ (50 + 40) = 10。"
        },
        {
          title: "追及问题",
          difficulty: "提高",
          question: "哥哥每分钟跑 120 米，弟弟每分钟跑 90 米，弟弟先出发 3 分钟，哥哥几分钟追上？",
          answer: "9 分钟",
          analysis: "弟弟先跑 270 米，哥哥每分钟多跑 30 米，270 ÷ 30 = 9。"
        }
      ],
      practices: [
        {
          id: "motion-1",
          title: "求路程",
          difficulty: "基础",
          prompt: "一辆车每小时行 45 千米，行驶 4 小时，一共行驶多少千米？",
          answer: "180",
          explanation: "路程 = 速度 × 时间，45 × 4 = 180 千米。",
          hints: ["先判断要求的是路程。", "路程 = 速度 × 时间。"],
          solutionSteps: ["速度是每小时 45 千米。", "时间是 4 小时。", "45 × 4 = 180，所以行驶 180 千米。"],
          commonMistakes: ["把 45 ÷ 4 当成路程。", "忘记单位是千米。"]
        },
        {
          id: "motion-2",
          title: "求时间",
          difficulty: "基础",
          prompt: "小华每分钟走 70 米，走完 560 米需要多少分钟？",
          answer: "8",
          explanation: "时间 = 路程 ÷ 速度，560 ÷ 70 = 8 分钟。",
          hints: ["已知路程和速度，要求时间。", "时间 = 路程 ÷ 速度。"],
          solutionSteps: ["路程是 560 米。", "速度是每分钟 70 米。", "560 ÷ 70 = 8，所以需要 8 分钟。"],
          commonMistakes: ["把速度和路程相乘。", "没有看清“每分钟”。"]
        },
        {
          id: "motion-3",
          title: "相遇时间",
          difficulty: "进阶",
          prompt: "甲乙两地相距 720 米，两人同时相向而行，甲每分钟 50 米，乙每分钟 40 米，几分钟相遇？",
          answer: "8",
          explanation: "相向而行速度相加，720 ÷ (50 + 40) = 8 分钟。",
          hints: ["相向而行时，两人的速度要相加。", "用总路程除以速度和。"],
          solutionSteps: ["速度和：50 + 40 = 90 米/分。", "总路程 720 米。", "720 ÷ 90 = 8，所以 8 分钟相遇。"],
          commonMistakes: ["只用一个人的速度去除。", "把相遇问题误算成追及问题。"]
        },
        {
          id: "motion-4",
          title: "追及时间",
          difficulty: "提高",
          prompt: "甲每分钟跑 100 米，乙每分钟跑 80 米，乙先跑 5 分钟，甲几分钟追上乙？",
          answer: "20",
          explanation: "乙先跑 80 × 5 = 400 米，甲每分钟多跑 20 米，400 ÷ 20 = 20 分钟。",
          hints: ["先算乙先跑出的距离。", "追及时用速度差。"],
          solutionSteps: ["乙先跑：80 × 5 = 400 米。", "甲每分钟比乙多跑：100 - 80 = 20 米。", "400 ÷ 20 = 20，所以甲 20 分钟追上。"],
          commonMistakes: ["追及问题用速度和。", "忘记先跑 5 分钟造成的距离差。"]
        },
        {
          id: "motion-5",
          title: "相遇求距离",
          difficulty: "提高",
          prompt: "两人同时从两地相向而行，甲每分钟 60 米，乙每分钟 55 米，8 分钟相遇。两地相距多少米？",
          answer: "920",
          explanation: "速度和是 115 米/分，8 分钟共走 115 × 8 = 920 米。",
          hints: ["相遇时两人走的路程合起来就是两地距离。", "先求速度和。"],
          solutionSteps: ["60 + 55 = 115 米/分。", "8 分钟共走 115 × 8 = 920 米。", "所以两地相距 920 米。"],
          commonMistakes: ["只算甲一个人的路程。", "把 60 和 55 相减。"]
        },
        {
          id: "motion-6",
          title: "往返速度",
          difficulty: "挑战",
          prompt: "小明上学每分钟走 60 米，15 分钟到校。放学走同一条路用了 18 分钟，放学每分钟走多少米？",
          answer: "50",
          explanation: "先求路程：60 × 15 = 900 米；放学速度 = 900 ÷ 18 = 50 米/分。",
          hints: ["同一条路，路程不变。", "先用上学速度和时间求路程。"],
          solutionSteps: ["上学路程：60 × 15 = 900 米。", "放学走同样的 900 米。", "900 ÷ 18 = 50，所以放学每分钟走 50 米。"],
          commonMistakes: ["直接比较 15 和 18。", "忘记先求共同路程。"]
        }
      ]
    },
    {
      id: "age",
      title: "年龄问题",
      grades: ["三年级", "四年级", "五年级"],
      description: "抓住年龄差不变，用现在、过去、未来之间的关系解题。",
      examples: [
        {
          title: "年龄差不变",
          difficulty: "基础",
          question: "哥哥今年 12 岁，弟弟今年 7 岁，3 年后哥哥比弟弟大几岁？",
          answer: "5 岁",
          analysis: "年龄差始终不变，现在差 12 - 7 = 5 岁，3 年后仍差 5 岁。"
        },
        {
          title: "几年后倍数",
          difficulty: "进阶",
          question: "爸爸 36 岁，小明 8 岁，几年后爸爸年龄是小明的 3 倍？",
          answer: "6 年后",
          analysis: "设 x 年后，36 + x = 3(8 + x)，解得 x = 6。"
        },
        {
          title: "几年前年龄",
          difficulty: "提高",
          question: "妈妈 35 岁，女儿 11 岁，几年前妈妈年龄是女儿的 4 倍？",
          answer: "3 年前",
          analysis: "设 x 年前，35 - x = 4(11 - x)，解得 x = 3。"
        }
      ],
      practices: [
        {
          id: "age-1",
          title: "年龄差",
          difficulty: "基础",
          prompt: "姐姐今年 14 岁，妹妹今年 9 岁，5 年后姐姐比妹妹大几岁？",
          answer: "5",
          explanation: "年龄差不变，现在相差 14 - 9 = 5 岁，5 年后仍相差 5 岁。",
          hints: ["两个人每年都会同时长 1 岁。", "年龄差不会随着时间改变。"],
          solutionSteps: ["现在年龄差：14 - 9 = 5。", "5 年后两人都加 5 岁，差仍然不变。", "所以姐姐仍比妹妹大 5 岁。"],
          commonMistakes: ["把 5 年后再加到年龄差上。", "分别算未来年龄后忘记差不变。"]
        },
        {
          id: "age-2",
          title: "未来年龄",
          difficulty: "基础",
          prompt: "小明今年 8 岁，妈妈今年 34 岁。4 年后两人年龄和是多少？",
          answer: "50",
          explanation: "4 年后小明 12 岁，妈妈 38 岁，和是 50 岁。",
          hints: ["每个人都增加 4 岁。", "两个人年龄和一共增加 8 岁。"],
          solutionSteps: ["现在年龄和：8 + 34 = 42。", "4 年后两个人都长 4 岁，年龄和增加 8。", "42 + 8 = 50。"],
          commonMistakes: ["只给一个人加 4 岁。", "把年龄差当成年龄和。"]
        },
        {
          id: "age-3",
          title: "几年后倍数",
          difficulty: "进阶",
          prompt: "爸爸今年 40 岁，小华今年 10 岁。几年后爸爸年龄是小华的 3 倍？",
          answer: "5",
          explanation: "5 年后爸爸 45 岁，小华 15 岁，45 是 15 的 3 倍。",
          hints: ["可以试着让两人同时增加同一个年数。", "爸爸和小华的年龄差一直是 30 岁。"],
          solutionSteps: ["年龄差是 40 - 10 = 30 岁。", "当爸爸是小华 3 倍时，差相当于小华的 2 倍。", "小华那时是 30 ÷ 2 = 15 岁。", "15 - 10 = 5，所以 5 年后。"],
          commonMistakes: ["只让小华长大，忘记爸爸也长大。", "直接用 40 ÷ 10 = 4 判断。"]
        },
        {
          id: "age-4",
          title: "几年前倍数",
          difficulty: "提高",
          prompt: "妈妈今年 32 岁，儿子今年 8 岁。几年前妈妈年龄是儿子的 5 倍？",
          answer: "2",
          explanation: "2 年前妈妈 30 岁，儿子 6 岁，30 是 6 的 5 倍。",
          hints: ["年龄差不变，是 24 岁。", "5 倍时，年龄差相当于儿子的 4 倍。"],
          solutionSteps: ["年龄差：32 - 8 = 24 岁。", "妈妈是儿子 5 倍时，差是儿子的 4 倍。", "儿子那时是 24 ÷ 4 = 6 岁。", "8 - 6 = 2，所以是 2 年前。"],
          commonMistakes: ["用现在的 32 ÷ 8 = 4 就结束。", "把几年前误算成几年后。"]
        },
        {
          id: "age-5",
          title: "年龄和反推",
          difficulty: "提高",
          prompt: "兄弟俩今年年龄和是 25 岁，哥哥比弟弟大 5 岁。弟弟今年几岁？",
          answer: "10",
          explanation: "弟弟 = (25 - 5) ÷ 2 = 10 岁。",
          hints: ["这是年龄中的和差问题。", "较小年龄 = (和 - 差) ÷ 2。"],
          solutionSteps: ["年龄和是 25，年龄差是 5。", "弟弟是较小数。", "(25 - 5) ÷ 2 = 10。"],
          commonMistakes: ["用 (25 + 5) ÷ 2 求成哥哥年龄。", "忘记题目问弟弟。"]
        },
        {
          id: "age-6",
          title: "倍数与差",
          difficulty: "挑战",
          prompt: "今年爸爸比儿子大 28 岁，爸爸年龄是儿子的 3 倍。儿子今年几岁？",
          answer: "14",
          explanation: "爸爸是儿子的 3 倍，年龄差相当于儿子的 2 倍，28 ÷ 2 = 14。",
          hints: ["把儿子年龄看成 1 份。", "爸爸是 3 份，差就是 2 份。"],
          solutionSteps: ["儿子年龄看成 1 份，爸爸年龄是 3 份。", "两人相差 3 - 1 = 2 份。", "2 份对应 28 岁。", "1 份是 28 ÷ 2 = 14，所以儿子 14 岁。"],
          commonMistakes: ["直接用 28 ÷ 3。", "把差当成爸爸年龄。"]
        }
      ]
    },
    {
      id: "average",
      title: "平均数问题",
      grades: ["三年级", "四年级", "五年级"],
      description: "用总量、份数、平均数三者关系解决补数、调数和反求总量问题。",
      examples: [
        {
          title: "求平均数",
          difficulty: "基础",
          question: "三次数学小测成绩是 80、90、100 分，平均分是多少？",
          answer: "90 分",
          analysis: "平均数 = 总数 ÷ 个数，(80 + 90 + 100) ÷ 3 = 90。"
        },
        {
          title: "已知平均求总数",
          difficulty: "进阶",
          question: "4 个数的平均数是 12，这 4 个数的和是多少？",
          answer: "48",
          analysis: "总数 = 平均数 × 个数，12 × 4 = 48。"
        },
        {
          title: "补一个数",
          difficulty: "提高",
          question: "前 4 次平均分是 85，第 5 次考多少分，5 次平均分才能到 88？",
          answer: "100 分",
          analysis: "目标总分是 88 × 5 = 440，前 4 次总分是 85 × 4 = 340，第 5 次要 100 分。"
        }
      ],
      practices: [
        {
          id: "average-1",
          title: "求平均",
          difficulty: "基础",
          prompt: "三个数分别是 12、18、24，它们的平均数是多少？",
          answer: "18",
          explanation: "平均数 = (12 + 18 + 24) ÷ 3 = 18。",
          hints: ["先求总和。", "平均数 = 总和 ÷ 个数。"],
          solutionSteps: ["12 + 18 + 24 = 54。", "一共有 3 个数。", "54 ÷ 3 = 18。"],
          commonMistakes: ["只用最大数和最小数平均。", "忘记除以个数。"]
        },
        {
          id: "average-2",
          title: "求总数",
          difficulty: "基础",
          prompt: "5 个数的平均数是 16，这 5 个数的和是多少？",
          answer: "80",
          explanation: "总数 = 平均数 × 个数，16 × 5 = 80。",
          hints: ["平均数乘个数就是总数。", "不要再除一次。"],
          solutionSteps: ["平均数是 16。", "一共有 5 个数。", "16 × 5 = 80，所以总和是 80。"],
          commonMistakes: ["用 16 ÷ 5。", "把平均数当成其中一个数。"]
        },
        {
          id: "average-3",
          title: "补一个数",
          difficulty: "进阶",
          prompt: "前 3 次平均分是 82 分，第 4 次考多少分，4 次平均分才能达到 85 分？",
          answer: "94",
          explanation: "目标总分 85 × 4 = 340，前 3 次总分 82 × 3 = 246，第 4 次要 340 - 246 = 94 分。",
          hints: ["先求目标总分。", "再求已经得到的总分。"],
          solutionSteps: ["4 次平均 85 分，目标总分是 85 × 4 = 340。", "前 3 次平均 82 分，总分是 82 × 3 = 246。", "第 4 次需要 340 - 246 = 94 分。"],
          commonMistakes: ["用 85 - 82 = 3 当作第 4 次分数。", "目标总分仍用 3 次来乘。"]
        },
        {
          id: "average-4",
          title: "去掉一个数",
          difficulty: "提高",
          prompt: "5 个数的平均数是 20，去掉一个数后，剩下 4 个数平均数是 18。去掉的数是多少？",
          answer: "28",
          explanation: "原总和 20 × 5 = 100，剩下总和 18 × 4 = 72，去掉的是 100 - 72 = 28。",
          hints: ["分别求去掉前和去掉后的总和。", "差就是被去掉的数。"],
          solutionSteps: ["原来总和：20 × 5 = 100。", "剩下总和：18 × 4 = 72。", "去掉的数：100 - 72 = 28。"],
          commonMistakes: ["用 20 - 18 = 2。", "没有把平均数还原成总数。"]
        },
        {
          id: "average-5",
          title: "调平均数",
          difficulty: "提高",
          prompt: "4 个数的平均数是 15，如果其中一个数增加 8，新的平均数是多少？",
          answer: "17",
          explanation: "总和增加 8，平均数增加 8 ÷ 4 = 2，所以新平均数是 17。",
          hints: ["一个数增加 8，会让总和增加 8。", "平均数增加量要平均分给 4 个数。"],
          solutionSteps: ["总和增加 8。", "4 个数的平均数增加 8 ÷ 4 = 2。", "15 + 2 = 17，所以新平均数是 17。"],
          commonMistakes: ["直接把平均数加 8。", "忘记有 4 个数共同分摊增加量。"]
        },
        {
          id: "average-6",
          title: "平均速度",
          difficulty: "挑战",
          prompt: "小明前 2 天平均每天读 18 页，后 3 天平均每天读 22 页，5 天平均每天读多少页？",
          answer: "20.4",
          acceptedAnswers: ["20.4", "20.4页", "102/5"],
          explanation: "总页数是 18 × 2 + 22 × 3 = 102 页，5 天平均 102 ÷ 5 = 20.4 页。",
          hints: ["不能直接把 18 和 22 平均。", "两段天数不同，要先求总页数。"],
          solutionSteps: ["前 2 天读 18 × 2 = 36 页。", "后 3 天读 22 × 3 = 66 页。", "总页数 36 + 66 = 102 页。", "102 ÷ 5 = 20.4，所以平均每天 20.4 页。"],
          commonMistakes: ["直接算 (18 + 22) ÷ 2 = 20。", "忽略前后天数不同。"]
        }
      ]
    }
  ];

  function mergeContentModules(existingModules = [], additions = expansionModules) {
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
    expansionModules,
    mergeContentModules
  };

  if (Array.isArray(root.MATH_LEARNING_DATA)) {
    root.MATH_LEARNING_DATA = mergeContentModules(root.MATH_LEARNING_DATA);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.ContentExpansion = api;
})(typeof window !== "undefined" ? window : globalThis);
