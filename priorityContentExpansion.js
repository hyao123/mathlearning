(function attachPriorityContentExpansion(root) {
  const priorityModules = [
    {
      id: "quick-calculation",
      title: "巧算与凑整",
      grades: ["二年级", "三年级", "四年级"],
      description: "通过凑整、拆补、配对和结构观察，把硬算变成有策略的计算。",
      examples: [
        {
          title: "凑整相加",
          difficulty: "基础",
          question: "计算 398 + 47 + 2。",
          answer: "447",
          analysis: "先把 398 和 2 凑成 400，再加 47，得到 447。"
        },
        {
          title: "拆数补数",
          difficulty: "进阶",
          question: "计算 125 + 98。",
          answer: "223",
          analysis: "98 可以看成 100 - 2，125 + 100 - 2 = 223。"
        },
        {
          title: "配对求和",
          difficulty: "提高",
          question: "计算 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19。",
          answer: "135",
          analysis: "首尾配对：11+19、12+18、13+17、14+16 都是 30，再加中间 15，共 135。"
        }
      ],
      practices: [
        {
          id: "quick-calculation-1",
          title: "凑成整百",
          difficulty: "基础",
          prompt: "计算 297 + 36 + 3。",
          answer: "336",
          explanation: "297 + 3 = 300，再加 36，得到 336。",
          hints: ["找一找哪个数能和 297 凑整。", "先凑成 300 再加剩下的数。"],
          solutionSteps: ["297 和 3 可以凑成 300。", "300 + 36 = 336。", "所以答案是 336。"],
          commonMistakes: ["按顺序硬算时进位出错。", "没有发现 297 和 3 可以凑整。"]
        },
        {
          id: "quick-calculation-2",
          title: "接近整百",
          difficulty: "基础",
          prompt: "计算 456 + 99。",
          answer: "555",
          explanation: "99 = 100 - 1，所以 456 + 99 = 456 + 100 - 1 = 555。",
          hints: ["99 离哪个整百最近？", "先加 100，再减多加的 1。"],
          solutionSteps: ["把 99 看成 100 - 1。", "456 + 100 = 556。", "556 - 1 = 555。"],
          commonMistakes: ["加 100 后忘记减 1。", "把 99 看成 90 + 9 后计算出错。"]
        },
        {
          id: "quick-calculation-3",
          title: "加减凑整",
          difficulty: "进阶",
          prompt: "计算 1000 - 398 - 2。",
          answer: "600",
          explanation: "398 + 2 = 400，所以 1000 - 398 - 2 = 1000 - 400 = 600。",
          hints: ["连续减两个数，可以先看它们的和。", "398 和 2 能凑成多少？"],
          solutionSteps: ["398 + 2 = 400。", "1000 - 398 - 2 = 1000 - 400。", "结果是 600。"],
          commonMistakes: ["先算 1000 - 398 时借位出错。", "把减去两个数误算成减差。"]
        },
        {
          id: "quick-calculation-4",
          title: "乘法拆分",
          difficulty: "进阶",
          prompt: "计算 25 × 16。",
          answer: "400",
          explanation: "16 = 4 × 4，25 × 4 = 100，再乘 4 得 400。",
          hints: ["25 乘几容易凑成 100？", "把 16 拆成 4 × 4。"],
          solutionSteps: ["16 = 4 × 4。", "25 × 4 = 100。", "100 × 4 = 400。"],
          commonMistakes: ["直接列竖式时漏乘一位。", "拆成 10 + 6 后计算过程变复杂。"]
        },
        {
          id: "quick-calculation-5",
          title: "首尾配对",
          difficulty: "提高",
          prompt: "计算 21 + 22 + 23 + 24 + 25 + 26 + 27 + 28 + 29。",
          answer: "225",
          explanation: "首尾配对都是 50：21+29、22+28、23+27、24+26 共 4 对，再加 25，得 225。",
          hints: ["从两端开始配对。", "每一对的和是否相同？"],
          solutionSteps: ["21+29=50，22+28=50，23+27=50，24+26=50。", "4 对共 200。", "再加中间 25，得到 225。"],
          commonMistakes: ["漏掉中间的 25。", "只配了三对，少算一对。"]
        },
        {
          id: "quick-calculation-6",
          title: "综合凑整",
          difficulty: "挑战",
          prompt: "计算 998 + 397 + 2 + 3。",
          answer: "1400",
          explanation: "998 + 2 = 1000，397 + 3 = 400，所以总和是 1400。",
          hints: ["不要急着从左到右算。", "找两组能凑整的数。"],
          solutionSteps: ["998 和 2 凑成 1000。", "397 和 3 凑成 400。", "1000 + 400 = 1400。"],
          commonMistakes: ["只凑出一组，另一组仍然硬算。", "改变运算顺序时漏掉某个数。"]
        }
      ],
      mathEssence: {
        bigIdea: "巧算的本质是看见数字结构。不是少算步骤，而是通过凑整、拆补和配对，让计算变得更稳定。",
        essentialQuestion: "哪些数可以先组合成整十、整百或相同的和？有没有一个数可以拆开来帮助凑整？",
        coreModels: ["凑整模型", "拆补模型", "首尾配对", "乘法拆分"],
        representations: ["配对圈", "拆数箭头", "整十整百台阶"],
        transferTips: ["先观察数字，不急着竖式。", "接近整十整百的数，常常可以先补再还。"],
        misconceptions: ["为了凑整随意改变数值，忘记补回或减回。", "只追求快，忽略每一步等值变形。"],
        progression: ["观察数字", "寻找凑整", "等值拆补", "检查总量不变"]
      }
    },
    {
      id: "arithmetic-series",
      title: "等差数列与配对求和",
      grades: ["三年级", "四年级", "五年级"],
      description: "从相邻差相同出发，理解第 n 项、项数和首尾配对求和。",
      examples: [
        {
          title: "找第 n 项",
          difficulty: "基础",
          question: "数列 3，7，11，15……第 6 项是多少？",
          answer: "23",
          analysis: "公差是 4，第 6 项比第 1 项多 5 个 4，所以是 3 + 5 × 4 = 23。"
        },
        {
          title: "求项数",
          difficulty: "进阶",
          question: "5，8，11，14，……，32 一共有多少项？",
          answer: "10 项",
          analysis: "从 5 到 32 相差 27，每次加 3，说明有 9 个间隔，所以项数是 10。"
        },
        {
          title: "首尾配对求和",
          difficulty: "提高",
          question: "1 + 2 + 3 + …… + 20 等于多少？",
          answer: "210",
          analysis: "首尾配对 1+20=21，共 10 对，所以总和是 210。"
        }
      ],
      practices: [
        {
          id: "arithmetic-series-1",
          title: "下一项",
          difficulty: "基础",
          prompt: "数列 4，9，14，19，下一项是多少？",
          answer: "24",
          explanation: "相邻两项都相差 5，所以 19 + 5 = 24。",
          hints: ["先看相邻两项的差。", "差保持不变。"],
          solutionSteps: ["9-4=5，14-9=5，19-14=5。", "公差是 5。", "下一项是 19+5=24。"],
          commonMistakes: ["只看最后一项随便加。", "把差看成 4。"]
        },
        {
          id: "arithmetic-series-2",
          title: "第 8 项",
          difficulty: "基础",
          prompt: "数列 2，6，10，14……第 8 项是多少？",
          answer: "30",
          explanation: "第 8 项比第 1 项多 7 个公差 4，所以 2 + 7 × 4 = 30。",
          hints: ["第 8 项和第 1 项之间有几个间隔？", "间隔数是项数差。"],
          solutionSteps: ["公差是 4。", "第 8 项比第 1 项多 8-1=7 个公差。", "2+7×4=30。"],
          commonMistakes: ["用 8 个公差而不是 7 个。", "把第一项漏掉。"]
        },
        {
          id: "arithmetic-series-3",
          title: "求项数",
          difficulty: "进阶",
          prompt: "数列 6，10，14，18，……，46 一共有多少项？",
          answer: "11",
          explanation: "46 - 6 = 40，40 ÷ 4 = 10 个间隔，所以有 11 项。",
          hints: ["先求首尾相差多少。", "间隔数比项数少 1。"],
          solutionSteps: ["公差是 4。", "首尾差是 46-6=40。", "40÷4=10 个间隔，项数是 10+1=11。"],
          commonMistakes: ["把 10 个间隔当成 10 项。", "没有确认 46 是否在数列中。"]
        },
        {
          id: "arithmetic-series-4",
          title: "从 1 加到 30",
          difficulty: "进阶",
          prompt: "1 + 2 + 3 + …… + 30 的和是多少？",
          answer: "465",
          explanation: "1+30=31，共 15 对，所以总和是 31 × 15 = 465。",
          hints: ["首尾配对。", "30 个数可以配成几对？"],
          solutionSteps: ["首尾和是 1+30=31。", "共有 30 个数，可以配成 15 对。", "31×15=465。"],
          commonMistakes: ["配对后还多加一次中间数。", "把 30 个数看成 30 对。"]
        },
        {
          id: "arithmetic-series-5",
          title: "奇数求和",
          difficulty: "提高",
          prompt: "1 + 3 + 5 + 7 + 9 + 11 + 13 + 15 的和是多少？",
          answer: "64",
          explanation: "首尾和 16，共 4 对，所以总和 16 × 4 = 64。",
          hints: ["这也是等差数列。", "首尾配对的和相同。"],
          solutionSteps: ["1+15=16，3+13=16，5+11=16，7+9=16。", "共有 4 对。", "16×4=64。"],
          commonMistakes: ["认为奇数求和不能配对。", "漏掉中间 7 和 9。"]
        },
        {
          id: "arithmetic-series-6",
          title: "综合求和",
          difficulty: "挑战",
          prompt: "数列 7，12，17，22，……，52 的所有项之和是多少？",
          answer: "295",
          explanation: "公差 5，52-7=45，有 9 个间隔、10 项；首尾和 59，共 5 对，所以和是 295。",
          hints: ["先求项数，再配对。", "项数由间隔数加 1 得到。"],
          solutionSteps: ["公差是 5。", "52-7=45，45÷5=9 个间隔，所以有 10 项。", "首尾和 7+52=59，10 项配成 5 对，59×5=295。"],
          commonMistakes: ["直接用首尾和乘 10。", "忘记先确认项数。"]
        }
      ],
      mathEssence: {
        bigIdea: "等差数列的本质是“每一步变化相同”。求项看间隔，求和看首尾配对。",
        essentialQuestion: "相邻两项的差是否稳定？目标项和第一项之间有几个间隔？首尾能否配成相同的和？",
        coreModels: ["公差", "间隔数", "第 n 项", "首尾配对"],
        representations: ["数轴", "差值表", "首尾连线图"],
        transferTips: ["第 n 项多的是 n-1 个公差。", "求和先判断项数，再看能否配对。"],
        misconceptions: ["把项数当成间隔数。", "首尾配对后忘记除以 2 或看成太多对。"],
        progression: ["找公差", "数间隔", "定位项", "配对求和"]
      }
    },
    {
      id: "add-multiply-principle",
      title: "加法原理与乘法原理",
      grades: ["三年级", "四年级", "五年级"],
      description: "区分分类还是分步，建立计数问题中“加”和“乘”的判断标准。",
      examples: [
        {
          title: "分类用加法",
          difficulty: "基础",
          question: "书架上有 3 本故事书和 4 本科普书，只选 1 本，有多少种选法？",
          answer: "7 种",
          analysis: "选故事书或科普书是两类选择，3 + 4 = 7。"
        },
        {
          title: "分步用乘法",
          difficulty: "进阶",
          question: "2 件上衣和 3 条裤子搭配，一共有多少套？",
          answer: "6 套",
          analysis: "先选上衣，再选裤子，每件上衣配 3 条裤子，共 2 × 3 = 6。"
        },
        {
          title: "分类分步混合",
          difficulty: "提高",
          question: "从 A 地到 B 地有 2 条路，从 B 到 C 有 3 条路；也可以从 A 直接到 C 有 1 条路。共有多少种走法？",
          answer: "7 种",
          analysis: "经 B 走是 2×3=6 种，直接走是 1 种，分类相加得 7 种。"
        }
      ],
      practices: [
        {
          id: "add-multiply-principle-1",
          title: "只选一种",
          difficulty: "基础",
          prompt: "盒子里有 5 支铅笔和 3 支钢笔，只选 1 支笔，一共有多少种选法？",
          answer: "8",
          explanation: "选铅笔或钢笔是分类选择，5 + 3 = 8 种。",
          hints: ["只选 1 支。", "铅笔和钢笔是两类。"],
          solutionSteps: ["选铅笔有 5 种。", "选钢笔有 3 种。", "两类相加：5+3=8。"],
          commonMistakes: ["误用 5×3。", "以为必须铅笔和钢笔各选一支。"]
        },
        {
          id: "add-multiply-principle-2",
          title: "一套搭配",
          difficulty: "基础",
          prompt: "有 4 件上衣和 2 条裤子，每次选 1 件上衣和 1 条裤子，一共有多少种搭配？",
          answer: "8",
          explanation: "先选上衣 4 种，再选裤子 2 种，共 4 × 2 = 8 种。",
          hints: ["搭配需要两个步骤。", "每件上衣都能配 2 条裤子。"],
          solutionSteps: ["选上衣有 4 种。", "选裤子有 2 种。", "分步相乘：4×2=8。"],
          commonMistakes: ["用 4+2 得到 6。", "只固定一件上衣而忘了所有上衣。"]
        },
        {
          id: "add-multiply-principle-3",
          title: "路线选择",
          difficulty: "进阶",
          prompt: "从家到学校必须经过公园。家到公园有 3 条路，公园到学校有 2 条路，一共有多少种走法？",
          answer: "6",
          explanation: "先走家到公园，再走公园到学校，是分步选择，3 × 2 = 6。",
          hints: ["必须经过公园。", "先后两个步骤都要完成。"],
          solutionSteps: ["第一步：家到公园有 3 种。", "第二步：公园到学校有 2 种。", "分步相乘，3×2=6。"],
          commonMistakes: ["用 3+2。", "把两段路当成任选其中一段。"]
        },
        {
          id: "add-multiply-principle-4",
          title: "两种方案",
          difficulty: "进阶",
          prompt: "小明去图书馆，可以坐 2 路公交，也可以坐 5 路公交；2 路有 3 个班次，5 路有 4 个班次。共有多少种乘车选择？",
          answer: "7",
          explanation: "坐 2 路或 5 路是分类选择，所以 3 + 4 = 7 种。",
          hints: ["最终只坐一种公交。", "两条公交路线是两类方案。"],
          solutionSteps: ["2 路有 3 种班次选择。", "5 路有 4 种班次选择。", "两类相加：3+4=7。"],
          commonMistakes: ["误以为先坐 2 路再坐 5 路。", "看到两个数字就相乘。"]
        },
        {
          id: "add-multiply-principle-5",
          title: "混合计数",
          difficulty: "提高",
          prompt: "早餐可以选中式或西式。中式有 2 种主食和 3 种饮品；西式有 3 种套餐。共有多少种早餐选择？",
          answer: "9",
          explanation: "中式是分步：2×3=6 种；西式是 3 种；分类相加 6+3=9。",
          hints: ["先分别计算中式和西式。", "中式要选主食和饮品，是分步。"],
          solutionSteps: ["中式：2 种主食 × 3 种饮品 = 6 种。", "西式：3 种套餐。", "两类相加：6+3=9。"],
          commonMistakes: ["把所有数直接相加得到 8。", "把西式套餐也错误乘进去。"]
        },
        {
          id: "add-multiply-principle-6",
          title: "密码组合",
          difficulty: "挑战",
          prompt: "一个两位密码，十位可选 1、2、3，个位可选 0、5、8、9，一共有多少种密码？",
          answer: "12",
          explanation: "十位和个位都要选，是分步计数，3 × 4 = 12。",
          hints: ["密码有两个位置。", "每个十位都能配 4 个个位。"],
          solutionSteps: ["十位有 3 种选择。", "个位有 4 种选择。", "分步相乘：3×4=12。"],
          commonMistakes: ["用 3+4。", "认为个位不能选 0，但题目允许。"]
        }
      ],
      mathEssence: {
        bigIdea: "计数原理的本质是判断选择结构：分类完成一件事用加法，分步完成一件事用乘法。",
        essentialQuestion: "这是几类互不重叠的方案，还是必须连续完成几个步骤？每个选择是否都要同时发生？",
        coreModels: ["分类加法", "分步乘法", "树状图", "路线模型"],
        representations: ["分类表", "树状图", "路线图"],
        transferTips: ["看到“或”多想分类，看到“先后都要”多想分步。", "混合题先分大类，再在每类内部判断加或乘。"],
        misconceptions: ["所有数字都相加。", "看到两个数就相乘，不判断选择结构。"],
        progression: ["判断目标", "区分分类/分步", "选择加法/乘法", "检查是否重复或遗漏"]
      }
    },
    {
      id: "engineering",
      title: "工程问题",
      grades: ["五年级", "六年级"],
      description: "把总工作量看作 1，比较单独效率与合作效率，理解效率相加。",
      examples: [
        {
          title: "单独效率",
          difficulty: "基础",
          question: "甲单独做一项工程 5 天完成，甲每天完成这项工程的几分之几？",
          answer: "1/5",
          analysis: "把整项工程看作 1，5 天完成，每天完成 1 ÷ 5 = 1/5。"
        },
        {
          title: "合作完成",
          difficulty: "进阶",
          question: "甲 6 天完成，乙 3 天完成，两人合作每天完成几分之几？",
          answer: "1/2",
          analysis: "甲每天 1/6，乙每天 1/3，合作每天 1/6 + 1/3 = 1/2。"
        },
        {
          title: "合作时间",
          difficulty: "提高",
          question: "甲 4 天完成，乙 6 天完成，两人合作几天完成？",
          answer: "12/5 天",
          analysis: "合作效率是 1/4 + 1/6 = 5/12，时间 = 1 ÷ 5/12 = 12/5 天。"
        }
      ],
      practices: [
        {
          id: "engineering-1",
          title: "每天做几分之一",
          difficulty: "基础",
          prompt: "一项工作，甲单独做 8 天完成。甲每天完成这项工作的几分之几？",
          answer: "1/8",
          acceptedAnswers: ["八分之一", "1÷8"],
          explanation: "把整项工作看作 1，8 天完成，每天完成 1/8。",
          hints: ["把总工作量看成 1。", "每天完成总量的平均一份。"],
          solutionSteps: ["总工作量看作 1。", "8 天完成，所以每天做 1÷8。", "答案是 1/8。"],
          commonMistakes: ["把 8 当成效率。", "忘记工程问题常把总量看成 1。"]
        },
        {
          id: "engineering-2",
          title: "合作效率",
          difficulty: "基础",
          prompt: "甲每天完成 1/6，乙每天完成 1/3，两人合作每天完成几分之几？",
          answer: "1/2",
          acceptedAnswers: ["二分之一", "3/6"],
          explanation: "合作效率相加：1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2。",
          hints: ["合作时每天完成的量可以相加。", "先通分。"],
          solutionSteps: ["甲每天 1/6。", "乙每天 1/3=2/6。", "合起来 3/6=1/2。"],
          commonMistakes: ["把时间相加。", "分母相加得到 1/9。"]
        },
        {
          id: "engineering-3",
          title: "两人合作几天",
          difficulty: "进阶",
          prompt: "甲单独 6 天完成，乙单独 3 天完成。两人合作几天完成？",
          answer: "2",
          explanation: "甲每天 1/6，乙每天 1/3，合作每天 1/2，所以 1 ÷ 1/2 = 2 天。",
          hints: ["先求两人的工作效率。", "总量 ÷ 合作效率 = 时间。"],
          solutionSteps: ["甲效率是 1/6。", "乙效率是 1/3。", "合作效率是 1/2。", "1 ÷ 1/2 = 2。"],
          commonMistakes: ["用 6+3=9 天。", "直接平均 6 和 3 得到 4.5 天。"]
        },
        {
          id: "engineering-4",
          title: "先做再合作",
          difficulty: "进阶",
          prompt: "一项工作甲单独 10 天完成，甲先做 2 天，还剩几分之几？",
          answer: "4/5",
          acceptedAnswers: ["五分之四", "8/10"],
          explanation: "甲每天做 1/10，2 天做 2/10=1/5，还剩 4/5。",
          hints: ["先求甲每天做多少。", "剩下 = 1 - 已做。"],
          solutionSteps: ["甲每天完成 1/10。", "2 天完成 2/10=1/5。", "还剩 1-1/5=4/5。"],
          commonMistakes: ["用 10-2=8 天当答案。", "没有把剩余量表示成总工程的几分之几。"]
        },
        {
          id: "engineering-5",
          title: "效率比较",
          difficulty: "提高",
          prompt: "甲单独 4 天完成，乙单独 12 天完成。甲每天比乙多完成这项工程的几分之几？",
          answer: "1/6",
          acceptedAnswers: ["六分之一", "2/12"],
          explanation: "甲每天 1/4=3/12，乙每天 1/12，差是 2/12=1/6。",
          hints: ["先分别求每天完成的量。", "比较效率差。"],
          solutionSteps: ["甲效率是 1/4。", "乙效率是 1/12。", "1/4-1/12=3/12-1/12=2/12=1/6。"],
          commonMistakes: ["比较 12 和 4 的差。", "认为天数少效率也少。"]
        },
        {
          id: "engineering-6",
          title: "三人合作",
          difficulty: "挑战",
          prompt: "甲 6 天完成，乙 12 天完成，丙 4 天完成。三人合作每天完成几分之几？",
          answer: "1/2",
          acceptedAnswers: ["二分之一", "6/12"],
          explanation: "1/6 + 1/12 + 1/4 = 2/12 + 1/12 + 3/12 = 6/12 = 1/2。",
          hints: ["三个人的效率都要相加。", "统一通分到 12。"],
          solutionSteps: ["甲效率 1/6=2/12。", "乙效率 1/12。", "丙效率 1/4=3/12。", "合计 6/12=1/2。"],
          commonMistakes: ["只加了两个人。", "分数通分错误。"]
        }
      ],
      mathEssence: {
        bigIdea: "工程问题的本质是把总工作量单位化。时间不同，是因为每单位时间完成的份额不同。合作时效率相加。",
        essentialQuestion: "总工作量能否看作 1？每个人每天完成几分之几？要求的是效率、剩余量还是时间？",
        coreModels: ["工作总量 = 1", "工作效率", "合作效率", "总量 ÷ 效率 = 时间"],
        representations: ["单位量条", "效率表", "进度条"],
        transferTips: ["先求每人每天做几分之一。", "合作完成的不是天数相加，而是每天完成量相加。"],
        misconceptions: ["把完成天数当成效率。", "合作时把完成时间直接相加或平均。"],
        progression: ["单位化总量", "求个人效率", "合并效率", "反求时间或剩余量"]
      }
    }
  ];

  function mergeModules(existing = [], additions = []) {
    const byId = new Map(existing.map((module) => [module.id, module]));
    additions.forEach((module) => byId.set(module.id, module));
    return [...byId.values()];
  }

  if (Array.isArray(root.MATH_LEARNING_DATA)) {
    root.MATH_LEARNING_DATA = mergeModules(root.MATH_LEARNING_DATA, priorityModules);
  } else {
    root.MATH_LEARNING_DATA = priorityModules;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { priorityModules, mergeModules };
  }

  root.PriorityContentExpansion = { priorityModules, mergeModules };
})(typeof window !== "undefined" ? window : globalThis);
