(function attachSupplementalContentExpansion(root) {
  const supplementalModules = [
    {
      id: "pigeonhole-principle",
      title: "抽屉原理",
      grades: ["四年级", "五年级", "六年级"],
      description: "用最坏情况和平均分配思想，理解“至少有一个抽屉里放得更多”。",
      examples: [
        { title: "袜子问题", difficulty: "基础", question: "红袜子和蓝袜子各很多，至少摸几只袜子，才能保证有 2 只同色？", answer: "3 只", analysis: "最坏先摸到一红一蓝，再摸第 3 只一定和其中一只同色。" },
        { title: "生日月份", difficulty: "进阶", question: "13 个同学中，至少有几个人出生在同一个月份？", answer: "2 人", analysis: "12 个月是 12 个抽屉，13 人放进去，至少一个月份有 2 人。" },
        { title: "余数抽屉", difficulty: "提高", question: "任取 6 个整数，为什么至少有两个数除以 5 的余数相同？", answer: "因为余数只有 5 种", analysis: "余数 0、1、2、3、4 是 5 个抽屉，6 个整数放进去，至少一个抽屉有 2 个。" }
      ],
      practices: [
        { id: "pigeonhole-principle-1", title: "同色球", difficulty: "基础", prompt: "袋中有红球、黄球、蓝球各若干个。至少取出多少个球，才能保证有 2 个颜色相同？", answer: "4", explanation: "最坏先取出红、黄、蓝各 1 个，第 4 个一定和其中一种颜色相同。", hints: ["先想最坏情况。", "颜色有 3 种。"], solutionSteps: ["3 种颜色看作 3 个抽屉。", "最坏前 3 个颜色都不同。", "第 4 个一定造成某个颜色有 2 个。"], commonMistakes: ["直接答 2，忽略可能取到不同颜色。", "没有考虑保证二字。"] },
        { id: "pigeonhole-principle-2", title: "生日月份", difficulty: "基础", prompt: "班里有 25 人，至少有几个人出生在同一个月份？", answer: "3", explanation: "12 个月每月最多先放 2 人可放 24 人，第 25 人会让某个月达到 3 人。", hints: ["12 个月是抽屉。", "用最平均的最坏情况。"], solutionSteps: ["把 25 人放进 12 个月。", "若每个月最多 2 人，只能放 24 人。", "所以至少有 1 个月有 3 人。"], commonMistakes: ["只说至少 2 人，没用完 25 人条件。", "把 25 ÷ 12 的商当答案，忘记余数。"] },
        { id: "pigeonhole-principle-3", title: "同余数", difficulty: "进阶", prompt: "任意取 8 个整数，至少有几个数除以 3 的余数相同？", answer: "3", explanation: "除以 3 只有 0、1、2 三种余数。8 个数平均放进 3 类，至少一类有 3 个。", hints: ["余数种类是抽屉。", "8 个物品放进 3 个抽屉。"], solutionSteps: ["余数只有 3 种。", "若每类最多 2 个，只能放 6 个。", "第 7、8 个会使至少一类达到 3 个。"], commonMistakes: ["以为至少 2 个，因为 8 > 3。", "没有求“至少几个”，只判断有重复。"] },
        { id: "pigeonhole-principle-4", title: "保证有 3 个", difficulty: "进阶", prompt: "有黑、白两种棋子。至少取多少枚，才能保证有 3 枚颜色相同？", answer: "5", explanation: "最坏先取黑 2 枚、白 2 枚，第 5 枚一定让某种颜色达到 3 枚。", hints: ["每种颜色最多先放 2 枚。", "再多 1 枚就保证 3 枚同色。"], solutionSteps: ["两种颜色是 2 个抽屉。", "最坏每个抽屉先放 2 枚，共 4 枚。", "第 5 枚必然让某个抽屉有 3 枚。"], commonMistakes: ["答 3，忽略可能颜色分散。", "答 6，误以为两种颜色都要有 3 枚。"] },
        { id: "pigeonhole-principle-5", title: "分组保证", difficulty: "提高", prompt: "把 31 本书放进 5 个书架，至少有一个书架上有多少本书？", answer: "7", explanation: "若每个书架最多 6 本，共能放 30 本；第 31 本会让某个书架达到 7 本。", hints: ["平均分配是最不容易出现很多的情况。", "先看每个书架 6 本能放多少。"], solutionSteps: ["5 个书架是 5 个抽屉。", "每个放 6 本可放 30 本。", "31 本必有一个书架至少 7 本。"], commonMistakes: ["31 ÷ 5 = 6 余 1 后只答 6。", "没有把余数推出“再多 1 本”。"] },
        { id: "pigeonhole-principle-6", title: "综合保证", difficulty: "挑战", prompt: "从 1 到 20 中任取 11 个数，为什么一定有两个数的和是 21？", answer: "因为可分成 10 对", explanation: "把数字分成 (1,20)、(2,19)、……、(10,11) 共 10 个抽屉，取 11 个数，必有一对都被取到。", hints: ["先把和为 21 的数配对。", "10 对就是 10 个抽屉。"], solutionSteps: ["把 1 到 20 分成 10 对和为 21 的数。", "任取 11 个数放进 10 对。", "必有一对中两个数都被取到，所以和为 21。"], commonMistakes: ["只举例，不说明保证。", "没有把配对看成抽屉。"] }
      ],
      mathEssence: {
        bigIdea: "抽屉原理的本质是用最坏情况证明“必然发生”。当物品比抽屉多时，至少有一个抽屉要承担更多。",
        essentialQuestion: "什么是物品？什么是抽屉？最平均、最不容易满足条件的情况能放多少个？",
        coreModels: ["抽屉模型", "最坏情况", "平均分配", "保证至少"],
        representations: ["抽屉图", "分类盒", "配对表"],
        transferTips: ["看到“至少、保证、一定”要想最坏情况。", "余数、颜色、月份、配对都可以成为抽屉。"],
        misconceptions: ["只找一个例子，没有证明一定。", "把可能发生当成保证发生。"],
        progression: ["确定抽屉", "确定物品", "构造最坏情况", "多 1 推出必然"]
      }
    },
    {
      id: "train-bridge",
      title: "火车过桥",
      grades: ["五年级", "六年级"],
      description: "把火车自身长度纳入行程模型，理解通过桥、人、隧道和两车相遇追及。",
      examples: [
        { title: "过桥", difficulty: "基础", question: "一列火车长 120 米，每秒行 20 米，通过 280 米长的大桥需要几秒？", answer: "20 秒", analysis: "火车完全过桥要走车长加桥长：120+280=400 米，400÷20=20 秒。" },
        { title: "过人", difficulty: "进阶", question: "火车长 150 米，每秒 25 米，通过路边一个人要几秒？", answer: "6 秒", analysis: "通过一个点只需车身全部过去，路程是车长 150 米，150÷25=6 秒。" },
        { title: "两车相遇", difficulty: "提高", question: "两列火车长 100 米和 140 米，相向而行速度分别 20 米/秒和 30 米/秒，从车头相遇到车尾离开要几秒？", answer: "4.8 秒", analysis: "共走两车长度 240 米，相对速度 50 米/秒，时间 240÷50=4.8 秒。" }
      ],
      practices: [
        { id: "train-bridge-1", title: "火车过桥", difficulty: "基础", prompt: "一列火车长 100 米，每秒行 20 米，通过 300 米长的桥需要几秒？", answer: "20", explanation: "完全过桥要走 100+300=400 米，400÷20=20 秒。", hints: ["完全通过桥时，车尾也要离开桥。", "路程是车长加桥长。"], solutionSteps: ["总路程是 100+300=400 米。", "速度是 20 米/秒。", "400÷20=20 秒。"], commonMistakes: ["只用桥长 300 米。", "忘记加上车长。"] },
        { id: "train-bridge-2", title: "通过路灯", difficulty: "基础", prompt: "一列火车长 180 米，每秒行 30 米，通过路边一根电线杆需要几秒？", answer: "6", explanation: "电线杆看成一个点，火车走过自身长度 180 米即可，180÷30=6 秒。", hints: ["电线杆没有长度。", "通过一个点只看车长。"], solutionSteps: ["路程是火车长 180 米。", "速度是 30 米/秒。", "180÷30=6 秒。"], commonMistakes: ["以为需要加一个额外长度。", "把过桥模型机械套用。"] },
        { id: "train-bridge-3", title: "过隧道", difficulty: "进阶", prompt: "火车长 160 米，每秒行 40 米，完全通过 640 米长的隧道要几秒？", answer: "20", explanation: "路程是 160+640=800 米，800÷40=20 秒。", hints: ["隧道和桥一样有长度。", "完全通过要车尾离开隧道。"], solutionSteps: ["总路程 160+640=800 米。", "800÷40=20 秒。"], commonMistakes: ["只用 640÷40。", "没有理解“完全通过”。"] },
        { id: "train-bridge-4", title: "反求桥长", difficulty: "进阶", prompt: "火车长 120 米，每秒行 15 米，完全通过一座桥用了 18 秒。这座桥长多少米？", answer: "150", explanation: "18 秒走 15×18=270 米，这是车长加桥长，所以桥长 270-120=150 米。", hints: ["先求火车一共走了多远。", "总路程 = 车长 + 桥长。"], solutionSteps: ["火车走了 15×18=270 米。", "桥长 = 270-120。", "桥长是 150 米。"], commonMistakes: ["直接用 15×18 当桥长。", "把车长加回去。"] },
        { id: "train-bridge-5", title: "两车相向", difficulty: "提高", prompt: "甲车长 90 米，乙车长 110 米，相向而行速度分别为 15 米/秒和 25 米/秒。从车头相遇到完全错开要几秒？", answer: "5", explanation: "两车合长 200 米，相对速度 40 米/秒，200÷40=5 秒。", hints: ["完全错开要走两车长度之和。", "相向而行用速度和。"], solutionSteps: ["总长度 90+110=200 米。", "相对速度 15+25=40 米/秒。", "200÷40=5 秒。"], commonMistakes: ["只用一列车长度。", "相向而行用了速度差。"] },
        { id: "train-bridge-6", title: "同向追及", difficulty: "挑战", prompt: "快车长 120 米，每秒 30 米；慢车长 100 米，每秒 20 米。快车从追上慢车车尾到完全超过慢车需要几秒？", answer: "22", explanation: "快车要相对多走两车长度 220 米，相对速度 30-20=10 米/秒，220÷10=22 秒。", hints: ["同向超过用速度差。", "完全超过需要多走两车长度之和。"], solutionSteps: ["两车长度和是 120+100=220 米。", "相对速度是 30-20=10 米/秒。", "220÷10=22 秒。"], commonMistakes: ["用速度和。", "只用快车长度 120 米。"] }
      ],
      mathEssence: {
        bigIdea: "火车过桥的本质是“物体有长度”。完全通过时，车头到达不够，车尾也必须离开。",
        essentialQuestion: "通过的是点、桥、隧道还是另一列车？需要走车长、车长加桥长，还是两车长度和？",
        coreModels: ["车长参与路程", "完全通过", "相对速度", "追及超过"],
        representations: ["线段图", "相对运动图", "车头车尾示意"],
        transferTips: ["通过一个点只看车长，通过有长度的物体要加长度。", "两车相向用速度和，同向超过用速度差。"],
        misconceptions: ["只看桥长或隧道长。", "相遇、追及都用同一种速度处理。"],
        progression: ["判断对象长度", "确定总路程", "选择相对速度", "求时间或反求长度"]
      }
    },
    {
      id: "geometry-counting",
      title: "图形计数",
      grades: ["四年级", "五年级", "六年级"],
      description: "用有序枚举和分层计数，数清线段、角、三角形和长方形。",
      examples: [
        { title: "数线段", difficulty: "基础", question: "一条直线上有 A、B、C、D 四个点，一共有多少条线段？", answer: "6 条", analysis: "任意两点确定一条线段：AB、AC、AD、BC、BD、CD，共 6 条。" },
        { title: "数三角形", difficulty: "进阶", question: "一个大三角形被从顶点到底边分成 3 个小三角形，一共有多少个三角形？", answer: "6 个", analysis: "连续 1 个小三角形有 3 个，连续 2 个有 2 个，连续 3 个有 1 个，共 6 个。" },
        { title: "数长方形", difficulty: "提高", question: "2 行 3 列小方格组成的长方形中，一共有多少个长方形？", answer: "18 个", analysis: "横向选两条竖线有 6 种，纵向选两条横线有 3 种，共 18 个。" }
      ],
      practices: [
        { id: "geometry-counting-1", title: "四点线段", difficulty: "基础", prompt: "一条直线上有 5 个点，一共可以组成多少条线段？", answer: "10", explanation: "任意两个点确定一条线段，按起点数：4+3+2+1=10。", hints: ["固定左端点逐个数。", "不要重复数 AB 和 BA。"], solutionSteps: ["第 1 个点可连 4 条。", "第 2 个点向右连 3 条。", "第 3、4 个点向右连 2、1 条。", "4+3+2+1=10。"], commonMistakes: ["用 5×4=20，重复计算。", "只数相邻线段。"] },
        { id: "geometry-counting-2", title: "数角", difficulty: "基础", prompt: "从同一个顶点射出 4 条射线，一共形成多少个角？", answer: "6", explanation: "任意两条射线形成一个角，3+2+1=6 个。", hints: ["固定一条边，和后面的射线配对。", "角由两条射线组成。"], solutionSteps: ["第 1 条射线可与后面 3 条成角。", "第 2 条可与后面 2 条成角。", "第 3 条可与后面 1 条成角。", "共 6 个。"], commonMistakes: ["只数相邻小角。", "把顺序不同重复计算。"] },
        { id: "geometry-counting-3", title: "分割三角形", difficulty: "进阶", prompt: "一个大三角形从顶点向底边画 4 条分割线，把底边分成 5 段。一共有多少个三角形？", answer: "15", explanation: "底边连续 1 段有 5 个，连续 2 段有 4 个，……连续 5 段有 1 个，共 15 个。", hints: ["所有三角形都共用顶点。", "按底边包含几段分类。"], solutionSteps: ["底边 1 段：5 个。", "底边 2 段：4 个。", "底边 3、4、5 段分别 3、2、1 个。", "5+4+3+2+1=15。"], commonMistakes: ["只数小三角形 5 个。", "没有数由多个小三角形合成的大三角形。"] },
        { id: "geometry-counting-4", title: "一行方格", difficulty: "进阶", prompt: "一行 4 个小正方形组成的长方形中，一共有多少个长方形？", answer: "10", explanation: "长度为 1 格有 4 个，2 格有 3 个，3 格有 2 个，4 格有 1 个，共 10 个。", hints: ["按长方形占几格来数。", "连续几个小格可以组成长方形。"], solutionSteps: ["1 格长方形 4 个。", "2 格 3 个，3 格 2 个，4 格 1 个。", "4+3+2+1=10。"], commonMistakes: ["只数 4 个小正方形。", "漏数 3 格或 4 格组成的长方形。"] },
        { id: "geometry-counting-5", title: "方格长方形", difficulty: "提高", prompt: "2 行 2 列小方格组成的正方形中，一共有多少个长方形？", answer: "9", explanation: "横向选两条竖线有 3 种，纵向选两条横线有 3 种，共 3×3=9。", hints: ["长方形由两条竖线和两条横线决定。", "2 列方格有 3 条竖线。"], solutionSteps: ["3 条竖线选 2 条，有 3 种。", "3 条横线选 2 条，有 3 种。", "3×3=9。"], commonMistakes: ["只数 4 个小正方形和 1 个大正方形。", "忘记 1×2 和 2×1 的长方形。"] },
        { id: "geometry-counting-6", title: "综合方格", difficulty: "挑战", prompt: "2 行 3 列小方格组成的长方形中，一共有多少个正方形？", answer: "8", explanation: "1×1 正方形有 6 个，2×2 正方形有 2 个，共 8 个。", hints: ["这题只数正方形。", "按边长是 1 格或 2 格分类。"], solutionSteps: ["1×1 正方形：2×3=6 个。", "2×2 正方形：横向有 2 个位置，纵向有 1 个位置，共 2 个。", "总数 6+2=8。"], commonMistakes: ["把所有长方形都算进去。", "漏掉 2×2 大正方形。"] }
      ],
      mathEssence: {
        bigIdea: "图形计数的本质是把空间图形转成有序枚举。真正难点不是算，而是不重不漏。",
        essentialQuestion: "这个图形由哪些基本元素决定？可以按长度、层数、边界或起点终点分类吗？",
        coreModels: ["有序枚举", "分层计数", "组合边界", "连续片段"],
        representations: ["编号图", "分层表", "起点终点表"],
        transferTips: ["先给点、线或格子编号。", "复杂图形按大小、位置或边界逐层数。"],
        misconceptions: ["只数最小图形，漏掉组合图形。", "同一个图形从不同方向重复数。"],
        progression: ["编号元素", "确定计数对象", "分类枚举", "合并检查"]
      }
    },
    {
      id: "parity-divisibility",
      title: "奇偶性与整除",
      grades: ["四年级", "五年级", "六年级"],
      description: "用奇偶、倍数和整除特征，判断数的结构和不可能情况。",
      examples: [
        { title: "奇偶判断", difficulty: "基础", question: "奇数 + 奇数 是奇数还是偶数？", answer: "偶数", analysis: "两个奇数各多 1，合起来多 2，所以是偶数。" },
        { title: "整除特征", difficulty: "进阶", question: "372 能被 3 整除吗？", answer: "能", analysis: "各位数字和 3+7+2=12，12 能被 3 整除，所以 372 能被 3 整除。" },
        { title: "不可能判断", difficulty: "提高", question: "5 个奇数的和可能是偶数吗？", answer: "不可能", analysis: "奇数个奇数相加仍是奇数，所以不可能是偶数。" }
      ],
      practices: [
        { id: "parity-divisibility-1", title: "奇偶加法", difficulty: "基础", prompt: "偶数 + 奇数 的结果是奇数还是偶数？", answer: "奇数", explanation: "偶数不改变奇偶性，加上一个奇数后结果是奇数。", hints: ["可以用 2+3 举例。", "偶数是成对的，奇数多 1。"], solutionSteps: ["偶数可以成对。", "奇数比成对多 1。", "合起来仍然多 1，所以是奇数。"], commonMistakes: ["只背口诀，不会解释。", "把加法和乘法规则混淆。"] },
        { id: "parity-divisibility-2", title: "奇偶乘法", difficulty: "基础", prompt: "奇数 × 偶数 的结果是奇数还是偶数？", answer: "偶数", explanation: "乘数中有偶数，表示可以分成成对的组，结果一定是偶数。", hints: ["试试 3×4。", "有一个因数是偶数。"], solutionSteps: ["偶数因数可以写成 2 的倍数。", "乘积也含有因数 2。", "所以乘积是偶数。"], commonMistakes: ["认为奇数乘什么都是奇数。", "没有区分加法规则和乘法规则。"] },
        { id: "parity-divisibility-3", title: "能否被 3 整除", difficulty: "进阶", prompt: "数 528 能被 3 整除吗？", answer: "能", explanation: "5+2+8=15，15 能被 3 整除，所以 528 能被 3 整除。", hints: ["看各位数字和。", "15 是否是 3 的倍数？"], solutionSteps: ["求数字和：5+2+8=15。", "15 能被 3 整除。", "所以 528 能被 3 整除。"], commonMistakes: ["只看个位 8。", "把 528÷3 算错后否定整除。"] },
        { id: "parity-divisibility-4", title: "能否被 9 整除", difficulty: "进阶", prompt: "数 783 能被 9 整除吗？", answer: "能", explanation: "7+8+3=18，18 能被 9 整除，所以 783 能被 9 整除。", hints: ["9 的整除也看数字和。", "18 是 9 的倍数。"], solutionSteps: ["数字和是 18。", "18÷9=2。", "所以 783 能被 9 整除。"], commonMistakes: ["把 18 只看成 3 的倍数。", "忘记 9 的整除特征。"] },
        { id: "parity-divisibility-5", title: "不可能性", difficulty: "提高", prompt: "3 个偶数和 4 个奇数相加，结果是奇数还是偶数？", answer: "偶数", explanation: "偶数不影响奇偶性；4 个奇数相加是偶数，所以总和是偶数。", hints: ["只看奇数的个数。", "偶数个奇数相加是偶数。"], solutionSteps: ["3 个偶数相加仍是偶数。", "4 个奇数相加是偶数。", "偶数+偶数=偶数。"], commonMistakes: ["看到有奇数就答奇数。", "没有看奇数个数是偶数个。"] },
        { id: "parity-divisibility-6", title: "填数字", difficulty: "挑战", prompt: "三位数 45□ 能被 5 整除，方框里可以填几个不同数字？", answer: "2", explanation: "能被 5 整除的数个位只能是 0 或 5，所以可填 0、5，共 2 个。", hints: ["5 的整除看个位。", "个位是 0 或 5。"], solutionSteps: ["能被 5 整除，个位必须是 0 或 5。", "方框在个位。", "所以有 2 种填法。"], commonMistakes: ["只填 5，漏掉 0。", "误用 3 的整除特征去看数字和。"] }
      ],
      mathEssence: {
        bigIdea: "奇偶和整除的本质是看数的结构，而不是每次都完整计算。它能帮助我们判断可能与不可能。",
        essentialQuestion: "这个数能否分成若干个 2、3、5、9 的倍数？只需要看个位、数字和还是因数结构？",
        coreModels: ["奇偶性", "整除特征", "倍数结构", "不可能性判断"],
        representations: ["成对图", "数字和表", "倍数筛选表"],
        transferTips: ["奇偶题先看奇数个数。", "3 和 9 看数字和，2 和 5 看个位。"],
        misconceptions: ["只凭个位判断 3 或 9。", "把加法奇偶和乘法奇偶混用。"],
        progression: ["识别结构", "选择规则", "快速判断", "解释可能性"]
      }
    },
    {
      id: "counting-transfer",
      title: "计数换乘站",
      grades: ["五年级", "六年级"],
      description: "综合枚举、加乘原理和容斥，处理分类、分步、重复与重叠。",
      examples: [
        { title: "先乘后减", difficulty: "基础", question: "用 1、2、3、4 组成没有重复数字的两位数，且个位不是 4，有多少个？", answer: "9 个", analysis: "全部两位数 4×3=12 个，个位是 4 的有 3 个，所以 12-3=9。" },
        { title: "分类分步", difficulty: "进阶", question: "早餐可选中式或西式，中式 2 种主食配 2 种饮品，西式 3 种套餐，共多少种？", answer: "7 种", analysis: "中式 2×2=4 种，西式 3 种，分类相加 7 种。" },
        { title: "容斥综合", difficulty: "提高", question: "30 人中喜欢画画 16 人，喜欢唱歌 14 人，两项都喜欢 5 人，至少喜欢一项的有多少人？", answer: "25 人", analysis: "16+14-5=25。" }
      ],
      practices: [
        { id: "counting-transfer-1", title: "限制位置", difficulty: "基础", prompt: "用 1、2、3 可以组成多少个没有重复数字的两位数？", answer: "6", explanation: "十位 3 种，个位剩 2 种，共 3×2=6。", hints: ["先选十位。", "不能重复。"], solutionSteps: ["十位有 3 种。", "个位有 2 种。", "3×2=6。"], commonMistakes: ["把 11、22、33 算进去。", "只列部分情况。"] },
        { id: "counting-transfer-2", title: "分类路线", difficulty: "基础", prompt: "从 A 到 C，可以直达有 2 条路；也可以经 B，A 到 B 有 2 条路，B 到 C 有 3 条路。共有多少种走法？", answer: "8", explanation: "直达 2 种，经 B 有 2×3=6 种，共 8 种。", hints: ["先分成直达和经 B 两类。", "经 B 是分步。"], solutionSteps: ["直达：2 种。", "经 B：2×3=6 种。", "总数 2+6=8 种。"], commonMistakes: ["把 2、2、3 全部相乘。", "只算经 B 的路线。"] },
        { id: "counting-transfer-3", title: "至少一项", difficulty: "进阶", prompt: "全班 28 人，参加数学社 15 人，参加科学社 12 人，两社都参加 4 人。至少参加一个社团的有多少人？", answer: "23", explanation: "15+12-4=23。", hints: ["两社都参加的人被加了两次。", "要减去一次重叠。"], solutionSteps: ["数学社 15 人。", "科学社 12 人。", "重叠 4 人减一次。", "15+12-4=23。"], commonMistakes: ["直接 15+12=27。", "把重叠减了两次。"] },
        { id: "counting-transfer-4", title: "不符合条件", difficulty: "进阶", prompt: "用 0、1、2、3 组成没有重复数字的两位数，一共有多少个？", answer: "9", explanation: "十位不能是 0，有 3 种；个位剩 3 种，共 9 个。", hints: ["两位数十位不能为 0。", "十位确定后个位还剩 3 种。"], solutionSteps: ["十位可选 1、2、3，共 3 种。", "个位可从剩下 3 个数字中选。", "3×3=9。"], commonMistakes: ["把 0 放到十位。", "用 4×3=12。"] },
        { id: "counting-transfer-5", title: "只参加一项", difficulty: "提高", prompt: "30 人中喜欢篮球 18 人，喜欢足球 15 人，两项都喜欢 6 人。只喜欢一项的有多少人？", answer: "21", explanation: "只喜欢篮球 18-6=12，只喜欢足球 15-6=9，共 21 人。", hints: ["只喜欢要从每一类中去掉重叠。", "不要把两项都喜欢的人算进去。"], solutionSteps: ["只篮球：18-6=12。", "只足球：15-6=9。", "只一项：12+9=21。"], commonMistakes: ["用 18+15-6=27，那是至少一项。", "把重叠算进只一项。"] },
        { id: "counting-transfer-6", title: "综合换乘", difficulty: "挑战", prompt: "用 1、2、3、4 组成没有重复数字的三位数，要求百位是奇数，且个位不是 4，一共有多少个？", answer: "8", explanation: "百位可选 1 或 3。若百位确定，剩 3 个数，个位不能是 4：当 4 还在可选中时个位 2 种，十位 2 种，共每个百位 4 种，两种百位共 8 种。", hints: ["先选百位。", "再处理个位限制。"], solutionSteps: ["百位可选 1、3，共 2 种。", "百位确定后，剩 3 个数字。", "个位不能选 4，所以个位有 2 种。", "十位剩 2 种。", "2×2×2=8。"], commonMistakes: ["先算全部再乱减。", "忘记百位奇数限制。"] }
      ],
      mathEssence: {
        bigIdea: "计数换乘站的本质是把枚举、分类分步和容斥放到同一道题里协调使用。",
        essentialQuestion: "先分类还是先分步？有没有限制条件？有没有重复计算或重叠部分？",
        coreModels: ["有序枚举", "加乘原理", "容斥", "补集思想"],
        representations: ["树状图", "分类表", "韦恩图"],
        transferTips: ["先判断题目结构，再选择工具。", "有限制时可正面分类，也可先算全部再排除。"],
        misconceptions: ["只会套一种计数方法。", "忘记检查重复和遗漏。"],
        progression: ["拆解条件", "选择计数工具", "处理限制", "检查重漏"]
      }
    },
    {
      id: "efficiency-transfer",
      title: "效率换乘站",
      grades: ["五年级", "六年级"],
      description: "综合归一归总、行程问题和工程问题，把单位量、速度和效率统一起来。",
      examples: [
        { title: "单位速度", difficulty: "基础", question: "汽车 3 小时行 180 千米，5 小时行多少千米？", answer: "300 千米", analysis: "先求每小时 60 千米，再乘 5。" },
        { title: "合作效率", difficulty: "进阶", question: "甲 6 天完成，乙 12 天完成，两人合作几天完成？", answer: "4 天", analysis: "合作效率 1/6+1/12=1/4，时间是 4 天。" },
        { title: "行程工程对比", difficulty: "提高", question: "甲乙相向而行，速度分别 50 和 40 米/分，相距 720 米，几分钟相遇？", answer: "8 分钟", analysis: "相遇效率是每分钟共同缩短 90 米，720÷90=8。" }
      ],
      practices: [
        { id: "efficiency-transfer-1", title: "归一速度", difficulty: "基础", prompt: "小明 4 分钟走 240 米，照这样 7 分钟走多少米？", answer: "420", explanation: "每分钟走 240÷4=60 米，7 分钟走 60×7=420 米。", hints: ["先求 1 分钟走多少。", "再乘 7。"], solutionSteps: ["240÷4=60 米/分。", "60×7=420 米。"], commonMistakes: ["用 240×7。", "没有先求单位量。"] },
        { id: "efficiency-transfer-2", title: "相遇效率", difficulty: "基础", prompt: "两人相距 540 米，相向而行，速度分别是 50 米/分和 40 米/分，几分钟相遇？", answer: "6", explanation: "每分钟共同缩短 90 米，540÷90=6 分钟。", hints: ["相向而行用速度和。", "距离被两人共同缩短。"], solutionSteps: ["速度和 50+40=90 米/分。", "540÷90=6 分钟。"], commonMistakes: ["用速度差。", "只用一个人的速度。"] },
        { id: "efficiency-transfer-3", title: "合作工程", difficulty: "进阶", prompt: "甲 8 天完成，乙 12 天完成。两人合作每天完成这项工程的几分之几？", answer: "5/24", explanation: "甲每天 1/8=3/24，乙每天 1/12=2/24，合计 5/24。", hints: ["先求两人的效率。", "通分到 24。"], solutionSteps: ["甲效率 1/8。", "乙效率 1/12。", "1/8+1/12=3/24+2/24=5/24。"], commonMistakes: ["把 8 和 12 相加。", "分数通分错误。"] },
        { id: "efficiency-transfer-4", title: "追及效率", difficulty: "进阶", prompt: "甲每分钟走 80 米，乙每分钟走 60 米，甲在乙后面 100 米，同向追乙，几分钟追上？", answer: "5", explanation: "每分钟缩短 80-60=20 米，100÷20=5 分钟。", hints: ["同向追及用速度差。", "差距每分钟缩小多少？"], solutionSteps: ["速度差 80-60=20 米/分。", "初始差距 100 米。", "100÷20=5 分钟。"], commonMistakes: ["用速度和。", "把 100 米当成两人都要走的距离。"] },
        { id: "efficiency-transfer-5", title: "先做后合作", difficulty: "提高", prompt: "一项工程甲 10 天完成，乙 15 天完成。甲先做 2 天后，两人合作，还要几天完成？", answer: "4.8", acceptedAnswers: ["24/5"], explanation: "甲先做 2/10=1/5，还剩 4/5。合作效率 1/10+1/15=1/6，时间是 4/5÷1/6=24/5 天。", hints: ["先算已完成和剩余。", "剩余量除以合作效率。"], solutionSteps: ["甲 2 天完成 2×1/10=1/5。", "剩余 4/5。", "合作效率 1/10+1/15=1/6。", "4/5÷1/6=24/5=4.8 天。"], commonMistakes: ["直接求全程合作时间。", "剩余量没有参与计算。"] },
        { id: "efficiency-transfer-6", title: "综合效率", difficulty: "挑战", prompt: "甲乙两车相距 360 千米相向而行，甲每小时 70 千米，乙每小时 50 千米。相遇后甲继续按原速行驶，到乙出发地还要几小时？", answer: "3", explanation: "相遇时间 360÷(70+50)=3 小时。相遇时甲走 210 千米，离乙出发地还剩 150 千米，150÷50? 注意甲到乙出发地还要走乙已走过的 150 千米，按甲速 150÷70=15/7 小时。", acceptedAnswers: ["15/7", "2又1/7"], hints: ["先求相遇时间。", "再求相遇点到乙出发地的距离。"], solutionSteps: ["相遇时间：360÷120=3 小时。", "乙 3 小时走 50×3=150 千米。", "相遇点到乙出发地还有 150 千米。", "甲继续走需 150÷70=15/7 小时。"], commonMistakes: ["把相遇时间 3 小时当成最终答案。", "用乙的速度计算甲继续行驶时间。"] }
      ],
      mathEssence: {
        bigIdea: "效率换乘站的本质是统一“每单位时间完成多少”。速度、工作效率、单位量都是同一种思想的不同外壳。",
        essentialQuestion: "每 1 个时间单位变化多少？两个对象是在共同增加、共同减少，还是缩小差距？",
        coreModels: ["单位量", "速度效率", "合作效率", "相对速度"],
        representations: ["时间轴", "效率表", "进度条", "线段图"],
        transferTips: ["先求单位时间的变化量。", "合作看效率和，追及看效率差，相遇看共同缩短。"],
        misconceptions: ["把时间相加或平均。", "没有判断效率是在相加还是相减。"],
        progression: ["确定单位时间", "求效率", "合并或比较效率", "反求时间或总量"]
      }
    }
  ];

  function mergeModules(existing = [], additions = []) {
    const byId = new Map(existing.map((module) => [module.id, module]));
    additions.forEach((module) => byId.set(module.id, module));
    return [...byId.values()];
  }

  if (Array.isArray(root.MATH_LEARNING_DATA)) {
    root.MATH_LEARNING_DATA = mergeModules(root.MATH_LEARNING_DATA, supplementalModules);
  } else {
    root.MATH_LEARNING_DATA = supplementalModules;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { supplementalModules, mergeModules };
  }

  root.SupplementalContentExpansion = { supplementalModules, mergeModules };
})(typeof window !== "undefined" ? window : globalThis);
