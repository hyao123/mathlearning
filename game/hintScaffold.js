// Tiered Hint Scaffold System
// 阶梯式通俗易懂思维脚手架：
// 1. 通俗易懂：融入儿童生活化比喻（如吹哨抬脚、长短积木、贪吃蛇过桥等），告别冰冷说教
// 2. 循序渐进：三大缓坡阶梯（第一阶读懂故事 ➔ 第二阶妙招画图 ➔ 第三阶算式慢动作），不剧透最终数字
// 3. 消除畏难：成长型思维诊断与心理安全感防护，把错误转化为“发现思维盲盒”，消除挫败感

const CONCRETE_ANALOGIES = Object.freeze({
  "chicken-rabbit": {
    name: "吹哨抬脚法",
    analogy: "想象小动物们都在玩抬脚游戏！哨声一响，每只动物都抬起 2 只脚。地上剩下的脚全都是兔子多长出来的后腿，每只兔子刚好贡献 2 只！",
    sketch: "在草稿纸上画两排圆圈代表头，先每只点两只脚，再把剩下的脚两个两个补给兔子。"
  },
  "sum-diff": {
    name: "长短积木截齐法",
    analogy: "想象两根长短不齐的积木棒。把长积木多出来的那一截轻轻切掉，剩下的两根就一样长啦！除以 2 就能得到短的那根。",
    sketch: "画一长一短两条线段，在长线段末尾用虚线画出多出的差额，一目了然。"
  },
  "tree-planting": {
    name: "手掌指缝法",
    analogy: "伸出小手掌数数看：5根手指之间，只有 4 个指缝！两端都种树，树就像手指，间隔就像指缝，树的棵数永远比间隔段数多 1 棵！",
    sketch: "画一条线段，用小竖线标出每一棵树，数数小树和它们中间的空格。"
  },
  "surplus-deficit": {
    name: "分糖果比差法",
    analogy: "就像分糖果游戏：第一回每人分几个多出了一些，第二回每人多分几个却不够了。把‘多出的’和‘还差的’合在一起，就是两次分配总共差的糖果数！",
    sketch: "在草稿纸上画出两次分糖果的对比，用天平或方框看清楚总差额。"
  },
  "pigeonhole-principle": {
    name: "最倒霉摸袜法",
    analogy: "闭上眼睛往最倒霉的情况想：先把每种颜色都摸了一只，只要再多摸 1 只，无论是什么颜色，都必定能和之前的一只凑成一双！",
    sketch: "画几个小抽屉，先给每个抽屉分 1 个苹果，多出来的苹果必定要挤进某个抽屉。"
  },
  "average": {
    name: "沙堆铲平法",
    analogy: "就像把高低不平的沙堆抹平：从高沙堆上铲下一小捧，填平低处的小坑，最后大家站在同一条水平线上！",
    sketch: "画几个不同高低的柱子，画一条横线看看多出来的部分能不能填补凹陷的部分。"
  },
  "train-bridge": {
    name: "贪吃蛇过桥法",
    analogy: "火车就像一条长长的贪吃蛇！从蛇头刚刚上桥，一直到蛇尾完全离开桥，蛇爬过的路程必须是【大桥长度 ＋ 火车自己的身长】！",
    sketch: "画一座长方形桥，在桥头和桥尾分别画出火车头和火车尾，标注总路程。"
  },
  "river-flow": {
    name: "商场顺逆扶梯法",
    analogy: "就像在商场顺着自动扶梯走，扶梯推着你走得特别快（船速＋水速）；逆着扶梯走，扶梯拉你后退（船速－水速）！",
    sketch: "画两个箭头：船速向右，水速也向右时箭头相加；水速向左时箭头相减。"
  },
  "age": {
    name: "时间车轮法",
    analogy: "太阳升起一天，所有人都在同时长大。不管过了 3 年还是 10 年，两人的年龄差永远一动不动，牢牢锁死！",
    sketch: "画两条平行线代表两人的年龄，中间的差距永远不变宽也不变窄。"
  },
  "engineering": {
    name: "吃大蛋糕法",
    analogy: "把整个大工程看作一块美味的大蛋糕（总量是 1）。小明每天吃 1/5 块，小红每天吃 1/3 块，两人合起来每天吃的加在一起！",
    sketch: "画一个大圆代表工作总量 1，涂色表示每天各自完成的几分之几。"
  },
  "reverse-thinking": {
    name: "倒放录像带法",
    analogy: "就像按下了时光倒流按钮：原来加上的就减去，原来乘的就除以，一步一步逆着找回最初的神秘宝藏！",
    sketch: "从最后的结果画箭头往回指，加号变减号，乘号变除号，一步步倒推。"
  },
  "periodicity": {
    name: "红绿灯转圈法",
    analogy: "红绿黄灯不断循环。算一算转了多少个整圈，直接看最后剩下的余数是几，就知道停在哪一盏灯啦！",
    sketch: "画一个圆圈，标出周期里的几个图案，顺时针数余数几步。"
  },
  "factors-multiples": {
    name: "乐高积木拼拆法",
    analogy: "每个大数字都是用不可拆分的‘质数小原子’拼出来的。短除法就像拆积木，一层一层除以公因数，直到商互质（公因数只有1）！",
    sketch: "画倒过来的除号阶梯，左边放公因数，底边放商，一清二楚。"
  },
  "geometry": {
    name: "七巧板移花接木法",
    analogy: "复杂的怪怪图形不要害怕！拿小剪刀把突出的角剪下来，平移拼到缺损的坑里，神奇地变成规则的长方形啦！",
    sketch: "在图形上画一条虚线辅助线，标出哪些部分可以剪下并挪到另一边。"
  },
  "motion": {
    name: "捉迷藏相向同向法",
    analogy: "相遇是两人面对面跑，彼此距离飞快缩短（速度加起来）；追及是一前一后跑，后车一点点拉近距离（快车速度减慢车速度）！",
    sketch: "画一条笔直的跑道，标出两人的起点和运动方向箭头。"
  },
  "square-array": {
    name: "洋葱剥皮切角法",
    analogy: "方阵就像一层层裹紧的洋葱！站在方阵最外层四条边上的同学，4个角上的同学被两条边重复抢夺（数了两次！）。所以最外层一圈总人数是【(每边人数 - 1) × 4】或者【每边人数 × 4 - 4】！如果要剥掉最外层看里面一层，每边人数刚好减少 2 人！",
    sketch: "在草稿纸上画一个正方形网格，用荧光笔圈出4个角落的小圆圈，一眼看出它们被两条边重复计算。"
  },
  "inclusion-exclusion": {
    name: "双圈交叠套圈圈法",
    analogy: "就像在地上丢了两个交叠的呼啦圈：喜欢唱歌的跳进左圈，喜欢跳舞的跳进右圈，两样都喜欢的挤在中间交叠的‘小橄榄球’里！计算总人数时，把两圈人数加起来后，中间的小朋友被数了两次，必须狠狠‘减去一份重叠’！",
    sketch: "画两个交叠的圆圈（韦恩图），在左月牙、中间交集、右月牙分别标出数字，重叠部分涂深色。"
  },
  "add-multiply-principle": {
    name: "小衣橱穿衣戴帽法",
    analogy: "出门挑衣服：从3件T恤或2件衬衫中只挑1件上衣，这叫【分类挑】，用加法 3+2=5 种；如果挑了上衣还要配裤子，两步缺一不可，这叫【分步配】，选法相乘 3×4=12 种！分类用加法，分步用乘法！",
    sketch: "画树状分支图：左边画几件上衣，从每件上衣伸出小树枝连到不同的裤子上，数清末端叶子数。"
  },
  "ratio-proportion": {
    name: "按配方切蛋糕分份法",
    analogy: "甲和乙的钱数是 3:2，意思就是把所有的钱看成一块切成 5 份（3+2）的大蛋糕！甲分 3 小块，乙分 2 小块。先算出‘1小份是多少’（总量 ÷ 5），再乘以各自占的份数，分配秒懂！",
    sketch: "画一根分成 5 个小格子的长条积木，甲涂 3 格，乙涂 2 格，标出总数和每一格的数值。"
  },
  "concentration": {
    name: "甜甜糖水稀释法",
    analogy: "无论加多少白开水，杯子里的【纯白糖克数】永远一粒没变！糖水有多甜（浓度），等于【纯糖 ÷ (纯糖 ＋ 水)】！加水只变淡、糖量锁死；加糖水变甜，紧紧盯住不变的‘纯糖量’，题目就迎刃而解！",
    sketch: "画一个量杯，底部沉淀的是‘纯糖’，上面是‘水’，合在一起是‘总糖水’，标注纯糖质量不变。"
  },
  "shortest-path": {
    name: "小蜜蜂顺风标数法",
    analogy: "小蜜蜂只能向右或向上飞。飞到每个十字路口的方法数，正好是它‘左边路口’和‘下边路口’两个数字加起来！从起点开始给每个路口标上数字：1, 1, 2, 3, 5... 一路顺风加到终点！",
    sketch: "在网格线的每个十字交叉点画小圆圈，填上从相邻点汇合相加的数字。"
  },
  "geometry-counting": {
    name: "小朋友握手排队法",
    analogy: "一条线上有 5 个点，能连出几条线段？就像 5 个小朋友排队握手：第1个人和其余4人握手，第2个人和其余3人握手... 算式就是 4+3+2+1！或者握手公式：点数 × (点数 - 1) ÷ 2！数角、数三角形底边完全一样！",
    sketch: "画一条线段和上面的点，像小彩虹一样在每两个点之间画彩色弧线连接。"
  },
  "divisibility": {
    name: "尾巴与肚子拆装法",
    analogy: "看一个大数字能不能整除，不用费劲硬算！能被 2 或 5 整除只看【小尾巴最后一位】；能被 3 或 9 整除看【肚子里所有数字相加的和】（各位数字之和）；能被 4 整除看【末尾两位数】！",
    sketch: "把大数字像切积木一样切开，圈出末尾一位或两位，或者用小加号把每个数字连起来求和。"
  },
  "scheduling": {
    name: "烙饼翻面满负荷法",
    analogy: "平底锅一次只能放2张饼，两面都要烙。千万不要等一张烙熟再放下一张！第1次烙A和B正面，第2次翻A烙C，第3次烙B反面和C反面，平底锅一分钟也不空闲，时间并联最省时！",
    sketch: "画一张时间流水表，横排写锅里的2个位置，竖列写每分钟放哪张饼的哪一面。"
  },
  "elimination-table": {
    name: "柯南办案打叉叉法",
    analogy: "列一张方格大表格，横排写嫌疑人，竖列写线索道具。根据‘小明不带钥匙’在格子里画大红叉❌，根据‘小红肯定带钥匙’画对勾✔，同行同列立刻全画叉！排除所有不可能，剩下的唯一空格就是真相！",
    sketch: "画一个 3×3 的九宫格，用 ✔ 和 ❌ 逐格排查，找出唯一的答案。"
  },
  "patterns": {
    name: "跳房子阶梯法",
    analogy: "就像玩跳房子游戏：从一个数跳到下一个数，观察每一步跳跃的固定步长！每一步增加或减少相同差额，按相同节奏再跳一步就能命中目标！",
    sketch: "在草稿纸上把数字排开，在相邻两数之间画出跳跃小弧线，标出每次增加或减少的固定步长（如 +3）。"
  }
});

function getConcreteAnalogy(question) {
  if (!question || typeof question !== "object") return null;
  const prompt = String(question.prompt || "");
  const mod = String(question.moduleId || "");
  const method = String(question.thinkingMethodId || question.typicalModel || "");

  if (/规律|等差|数列|递增|递减|推进|下一格/.test(prompt) || mod.includes("patterns") || method.includes("patterns")) {
    return CONCRETE_ANALOGIES["patterns"];
  }
  if (/鸡|兔|头|腿|足|门票|大船小船/.test(prompt) || mod.includes("chicken-rabbit") || method.includes("chicken-rabbit")) {
    return CONCRETE_ANALOGIES["chicken-rabbit"];
  }
  if (/和差|和倍|差倍|大数|小数|(?:和.*差|差.*和)/.test(prompt) || mod.includes("sum-diff") || method.includes("sum-diff")) {
    return CONCRETE_ANALOGIES["sum-diff"];
  }
  if (/植树|间隔|锯木|爬楼|电线杆|路灯|敲钟/.test(prompt) || mod.includes("tree-planting")) {
    return CONCRETE_ANALOGIES["tree-planting"];
  }
  if (/盈|亏|剩余|不足|多出|还差|(?:每人.*多.*少)|(?:多\s*\d.*少\s*\d)/.test(prompt) || mod.includes("surplus-deficit")) {
    return CONCRETE_ANALOGIES["surplus-deficit"];
  }
  if (/抽屉|鸽巢|最不利|至少|保证/.test(prompt) || mod.includes("pigeonhole")) {
    return CONCRETE_ANALOGIES["pigeonhole-principle"];
  }
  if (/平均数|均值|平均分|平均重量/.test(prompt) || mod.includes("average")) {
    return CONCRETE_ANALOGIES["average"];
  }
  if (/列车|火车|客车|货车|动车|高铁|过桥|隧道|车身|车长/.test(prompt) || mod.includes("train-bridge")) {
    return CONCRETE_ANALOGIES["train-bridge"];
  }
  if (/顺水|逆水|水流|流水|行船|漂流/.test(prompt) || mod.includes("river-flow")) {
    return CONCRETE_ANALOGIES["river-flow"];
  }
  if (/年龄|几年前|几年后|岁/.test(prompt) || mod.includes("age")) {
    return CONCRETE_ANALOGIES["age"];
  }
  if (/(?:工程队|大工程|工程合作|工程总量|修路|注水|排水|合作|工效)/.test(prompt) || (mod.includes("engineering") && !/工程尺/.test(prompt))) {
    return CONCRETE_ANALOGIES["engineering"];
  }
  if (/倒推|逆推|反推|还原|原来|又放入|又拿走|倒着算|(?:一个数.*等于.*求这个数)/.test(prompt) || mod.includes("reverse-thinking")) {
    return CONCRETE_ANALOGIES["reverse-thinking"];
  }
  if (/周期|循环|第几个|排列|重复/.test(prompt) || mod.includes("periodicity")) {
    return CONCRETE_ANALOGIES["periodicity"];
  }
  if (/方阵|实心方阵|空心方阵|最外层|四周每边/.test(prompt) || mod.includes("square-array")) {
    return CONCRETE_ANALOGIES["square-array"];
  }
  if (/容斥|韦恩|重叠|两样都|都参加|都喜欢|集合/.test(prompt) || mod.includes("inclusion") || mod.includes("venn")) {
    return CONCRETE_ANALOGIES["inclusion-exclusion"];
  }
  if (/加乘原理|加法原理|乘法原理|分步|搭配|穿衣|路线搭配|有多少种不同走法|有多少种搭配/.test(prompt) || mod.includes("add-multiply") || mod.includes("tree-counting")) {
    return CONCRETE_ANALOGIES["add-multiply-principle"];
  }
  if (/(?:按|成)?\s*\d+\s*比\s*\d+|按比例|比例|几比几|比是|按份数|按.*比.*分配/.test(prompt) || mod.includes("ratio") || mod.includes("proportion")) {
    return CONCRETE_ANALOGIES["ratio-proportion"];
  }
  if (/浓度|糖水|盐水|稀释|加水|加糖|溶质|溶液/.test(prompt) || mod.includes("concentration")) {
    return CONCRETE_ANALOGIES["concentration"];
  }
  if (/标数法|最短路线|最短路径|最短走法|走格子|最少走几步|顺风标数|向右或向上|从[A-Za-z]点?到|从[A-Za-z]点?走/.test(prompt) || mod.includes("shortest-path") || mod.includes("coordinates-routes")) {
    return CONCRETE_ANALOGIES["shortest-path"];
  }
  if (/数线段|数角|数三角形|数长方形|多少条.*线段|多少个.*角|多少个.*三角形|线段上有.*点|握手/.test(prompt) || mod.includes("geometry-counting")) {
    return CONCRETE_ANALOGIES["geometry-counting"];
  }
  if (/整除|能被.*整除|各位数字之和|余数问题|奇偶性/.test(prompt) || mod.includes("divisibility") || mod.includes("parity")) {
    return CONCRETE_ANALOGIES["divisibility"];
  }
  if (/统筹|烙.*饼|平底锅|烙饼|排队|煎饼|洗车|最少需要.*分|合理安排/.test(prompt) || mod.includes("scheduling")) {
    return CONCRETE_ANALOGIES["scheduling"];
  }
  if (/真话|假话|逻辑推理|排除法|对应关系|小明.*小红.*小刚/.test(prompt) || mod.includes("elimination-table") || mod.includes("logic")) {
    return CONCRETE_ANALOGIES["elimination-table"];
  }
  if (/最大公因|最小公倍|短除|质因数|分解|互质|因数个数/.test(prompt) || mod.includes("factors") || mod.includes("prime")) {
    return CONCRETE_ANALOGIES["factors-multiples"];
  }
  if (/周长|面积|剪去|拼成|长方形|正方形|割补/.test(prompt) || mod.includes("geometry") || mod.includes("figures")) {
    return CONCRETE_ANALOGIES["geometry"];
  }
  if (/相遇|追及|速度|路程|时间|跑道/.test(prompt) || mod.includes("motion") || mod.includes("speed")) {
    return CONCRETE_ANALOGIES["motion"];
  }
  return null;
}

function buildTieredHints(question) {
  if (!question || typeof question !== "object") return [];

  const hints = [];
  const prompt = String(question.prompt || "");
  const moduleId = String(question.moduleId || "");
  const mod = moduleId;
  const isFactorCountProblem = /因数个数|多少个(?:不同)?(?:的正)?因数|因数一共有多少个|正因数有几个|多少个正因数/.test(prompt);
  const isPrimeFactorProblem = /分解质因数|质因数(?:的形式|连乘|分解|之和|积)|质因数的和/.test(prompt) && !isFactorCountProblem;
  const isGcdLcmProblem = /最大公因数|最大公约数|最小公倍数|公倍数|公因数|公约数/.test(prompt);
  const isFactorProblem = isFactorCountProblem || isPrimeFactorProblem || isGcdLcmProblem || /短除|互质/.test(prompt) || ["factors-multiples", "prime-factorization"].includes(moduleId);
  const analogy = getConcreteAnalogy(question);

  // ==========================================
  // Tier 1: 第一阶 · 读懂故事 · 圈已知（降低阅读负担，消除畏难）
  // ==========================================
  const cognitiveTag = question.cognitiveBadge ? `【${question.cognitiveBadge} · ${question.cognitiveGoal || "核心攻坚"}】\n` : "";
  let tier1Text = "";
  if (question.commonPitfall) {
    tier1Text = `${cognitiveTag}🌱 审题锦囊：先在题目里圈出关键数字！\n⚠️ 避坑提醒：${question.commonPitfall}`;
  } else if (question.solutionReview?.pitfall) {
    tier1Text = `${cognitiveTag}🌱 审题锦囊：读慢一点，圈出已知数与未知问题。\n⚠️ 避坑提醒：${question.solutionReview.pitfall}`;
  } else if (question.storyBeat) {
    tier1Text = `${cognitiveTag}🔍 审题线索：${question.storyBeat}`;
  } else if (isFactorCountProblem) {
    tier1Text = `${cognitiveTag}🔍 审题线索：明确题目求的是【全部正因数的总个数】。正因数包含 1、合数和自身；小数可用“成对列举”，大数或已分解数首选“因数个数定理”。`;
  } else if (isPrimeFactorProblem) {
    tier1Text = `${cognitiveTag}🔍 审题线索：明确要把合数拆解成底层的“质数原子”连乘形式，结果中所有因数必须全是质数。`;
  } else if (isFactorProblem) {
    tier1Text = `${cognitiveTag}🔍 审题线索：圈出题目中的两个关键数字，明确求的是【最大公因数 (GCD)】还是【最小公倍数 (LCM)】，倍数因数关系莫混淆。`;
  } else if (/方阵|四周|实心方阵|空心方阵/.test(prompt) || mod.includes("square-array")) {
    tier1Text = `${cognitiveTag}🔍 审题线索：明确是实心方阵还是空心方阵，圈出已知的是‘每边人数’还是‘最外层总人数’。注意 4 个角上的位置被相邻两条边重复占用！`;
  } else if (/容斥|韦恩|重叠|都参加|都喜欢/.test(prompt) || mod.includes("inclusion") || mod.includes("venn")) {
    tier1Text = `${cognitiveTag}🔍 审题线索：圈出两类活动各自的人数，注意寻找‘两样都参加’与‘两样都不参加’的对应数字，明确所求是全部总人数还是重叠人数。`;
  } else if (/按比例|几比几|比是|份数/.test(prompt) || mod.includes("ratio")) {
    tier1Text = `${cognitiveTag}🔍 审题线索：圈出题目中的比例关系（如 a:b）和总数量，明确把总量分成了多少份，求的是其中哪一份或差额。`;
  } else if (/浓度|糖水|盐水|稀释/.test(prompt) || mod.includes("concentration")) {
    tier1Text = `${cognitiveTag}🔍 审题线索：圈出纯白糖（溶质）和总糖水（溶液）各自的质量。加水或蒸发时，紧紧盯住不变的纯溶质克数！`;
  } else if (/数线段|数角|数三角形|握手/.test(prompt) || mod.includes("geometry-counting")) {
    tier1Text = `${cognitiveTag}🔍 审题线索：数清图形的基本端点、顶点或射线总数，明确求的是基本线段/角，还是由它们组合成的复合图形。`;
  } else if (/标数法|最短路线|走格子/.test(prompt) || mod.includes("shortest-path")) {
    tier1Text = `${cognitiveTag}🔍 审题线索：圈出起点和终点，确认移动方向限制（如只能向右或向上），注意观察是否有不可通过的障碍或必经点。`;
  } else if (/统筹|烙饼|排队|煎饼/.test(prompt) || mod.includes("scheduling")) {
    tier1Text = `${cognitiveTag}🔍 审题线索：圈出每项任务的耗时与工具容量（如锅里能放几张饼），寻找可以同时‘并联’进行的空档步骤。`;
  } else if (/真话|假话|逻辑推理|排除法/.test(prompt) || mod.includes("elimination-table") || mod.includes("logic")) {
    tier1Text = `${cognitiveTag}🔍 审题线索：先圈出‘确定成立’或‘确定不成立’的硬性线索，作为推理突破口，在草稿纸上画表格打叉排查。`;
  } else {
    tier1Text = `${cognitiveTag}🔍 审题线索：圈出题目中的已知数字和单位，明确最终所求的单一量还是总量。`;
  }

  hints.push({
    tier: 1,
    label: "第一阶 · 关键审题（读懂故事）",
    text: tier1Text
  });

  // ==========================================
  // Tier 2: 第二阶 · 思维模型 · 画画看（生活具象类比，搭思维梯子）
  // ==========================================
  let tier2Text = "";
  if (question.methodPrompt) {
    tier2Text = `💡 思维方法：${question.methodPrompt}`;
  } else if (question.solutionReview?.method) {
    tier2Text = `💡 推荐策略【${question.solutionReview.method}】：${question.solutionReview.observation || "先找出最核心的数量对应关系与差量。"}`;
  } else if (question.solution?.strategy) {
    tier2Text = `💡 推荐策略【${question.solution.strategy}】：${question.solution.summary || "先抓住题目中最核心的一对数量差量或对应关系。"}`;
  } else if (question.thinkingMethodLabel) {
    tier2Text = `💡 思维模型：本题可运用【${question.thinkingMethodLabel}】进行结构化分析。`;
  } else if (question.typicalModel) {
    tier2Text = `💡 思维模型：本题对应【${question.typicalModel}】经典数学模型。`;
  } else if (isFactorCountProblem) {
    tier2Text = "💡 推荐策略【质因数分解与因数个数定理】：把目标数写成质数幂次连乘式 N = p₁^a × p₂^b...。根据乘法原理，每个质因数可选 0 到 a 次幂，共有 (a+1) 种可能。";
  } else if (isPrimeFactorProblem) {
    tier2Text = "💡 推荐策略【短除阶梯法】：用最小质数 2、3、5... 依次试除，直到商也是质数为止，写成连续质因数乘积。";
  } else if (isFactorProblem) {
    tier2Text = "💡 推荐策略【短除法与因倍数分解】：两数并排画出短除阶梯，从公质因数 2、3、5... 依次试除，直到商互质（公因数只有 1）为止。";
  } else {
    tier2Text = "💡 思维模型：通过画线段图或列表，对比前后变化量或建立等量关系。";
  }

  // 附送通俗生动的生活类比锦囊
  if (analogy) {
    tier2Text += `\n\n🎨 生活妙趣锦囊【${analogy.name}】：\n${analogy.analogy}\n✏️ 动笔画画看：${analogy.sketch}`;
  }

  hints.push({
    tier: 2,
    label: "第二阶 · 思维模型（妙招点拨）",
    text: tier2Text
  });

  // ==========================================
  // Tier 3: 第三阶 · 算式骨架 · 慢动作（分步推进，留出临门一脚）
  // ==========================================
  let tier3Text = "";
  const solSteps = question.solution?.steps;
  const reviewSteps = question.solutionReview?.steps;

  if (Array.isArray(solSteps) && solSteps.length > 0) {
    const stepLines = solSteps.map((s, idx) => {
      const stepName = s.name || `第 ${idx + 1} 步`;
      const stepExpl = s.explanation || "";
      return `• 步骤 ${idx + 1}【${stepName}】：${stepExpl}`;
    });
    tier3Text = `📐 计算骨架（慢动作分解）：\n${stepLines.join("\n")}\n\n✨ 最后的临门一脚留给你，算一算就是胜利！`;
  } else if (Array.isArray(reviewSteps) && reviewSteps.length > 0) {
    const rawAnswer = String(question.answer ?? "").trim();
    const stepLines = reviewSteps.map((stepText, idx) => {
      let masked = stepText;
      if (rawAnswer && rawAnswer.length > 0 && masked.includes(rawAnswer)) {
        masked = masked.split(rawAnswer).join("(待求结果)");
      }
      return `• 步骤 ${idx + 1}：${masked}`;
    });
    tier3Text = `📐 算式骨架（分步推进）：\n${stepLines.join("\n")}\n\n• 最终关键步骤：根据上述中间算式，独立计算得出最终数值，享受攻克难题的成就感！`;
  } else if (question.solutionReview?.calculation) {
    const calc = question.solutionReview.calculation;
    const rawAnswer = String(question.answer ?? "").trim();
    const maskedCalc = rawAnswer ? calc.split(rawAnswer).join("?") : calc;
    tier3Text = `📐 算式骨架：解题运算路径为【${maskedCalc}】，请独立计算得出最终数值。`;
  } else if (question.verification?.summary) {
    tier3Text = `📐 验算指引：${question.verification.summary}，可根据此对应关系倒推算式。`;
  } else if (isFactorCountProblem) {
    tier3Text = "📐 算式骨架：\n• 核心公式：因数个数 ＝ (指数1 ＋ 1) × (指数2 ＋ 1) × ...；\n• 验算方法：成对列举 1×N, 2×(N/2)... 核对因数对数，确保不重不漏。";
  } else if (isPrimeFactorProblem) {
    tier3Text = "📐 算式骨架：\n• 短除各层除数与最终质数商连乘：N = p₁ × p₂ × ...；\n• 相同质数可合并为指数幂形式。";
  } else if (isFactorProblem) {
    tier3Text = "📐 算式骨架：\n• 半边（左竖列公质因数）相乘 ＝ 最大公因数 (GCD)；\n• 一圈（“L”型整环所有因数）连乘 ＝ 最小公倍数 (LCM)；\n• 恒等定理验算：两数之积 ＝ GCD × LCM。";
  } else if (/方阵|四周|实心方阵|空心方阵/.test(prompt) || mod.includes("square-array")) {
    tier3Text = "📐 算式骨架（慢动作分解）：\n• 步骤 1（第1步）：确认方阵每边点数 n；\n• 步骤 2（第2步）：最外层四周点数 ＝ (n － 1) × 4 或 n × 4 － 4（扣除 4 个重叠角）；\n• 步骤 3：若求总点数，实心方阵 ＝ n × n；若剥开一层看次外层，每边点数变为 (n － 2)。";
  } else if (/容斥|韦恩|重叠|都参加|都喜欢/.test(prompt) || mod.includes("inclusion") || mod.includes("venn")) {
    tier3Text = "📐 算式骨架（慢动作分解）：\n• 步骤 1（第1步）：将两个群体人数相加：A ＋ B；\n• 步骤 2（第2步）：减去被重复计算的重叠部分：A ＋ B － (两样都参加)；\n• 步骤 3：若包含两样都不参加的人数，再加上外围人数得出全班总人数。";
  } else if (/按比例|几比几|比是|份数/.test(prompt) || mod.includes("ratio")) {
    tier3Text = "📐 算式骨架（慢动作分解）：\n• 步骤 1（第1步）：求出总份数 ＝ 前项 ＋ 后项；\n• 步骤 2（第2步）：求出 1 份对应的具体数值 ＝ 总量 ÷ 总份数；\n• 步骤 3：求各部分实际量 ＝ 1 份的量 × 对应份数。";
  } else if (/浓度|糖水|盐水|稀释/.test(prompt) || mod.includes("concentration")) {
    tier3Text = "📐 算式骨架（慢动作分解）：\n• 步骤 1（第1步）：计算不变的纯溶质 ＝ 溶液 × 原浓度；\n• 步骤 2（第2步）：计算变化后的总溶液 ＝ 溶质 ＋ 溶剂（加水或加溶质后的总重量）；\n• 步骤 3：新浓度 ＝ 纯溶质 ÷ 新溶液总量。";
  } else if (/数线段|数角|数三角形|握手/.test(prompt) || mod.includes("geometry-counting")) {
    tier3Text = "📐 算式骨架（慢动作分解）：\n• 步骤 1（第1步）：数出基本端点或射线数 n；\n• 步骤 2（第2步）：套用握手公式：线段数(角数) ＝ n × (n － 1) ÷ 2；\n• 步骤 3：或用连续自然数相加：(n － 1) ＋ (n － 2) ＋ ... ＋ 1。";
  } else if (/标数法|最短路线|走格子/.test(prompt) || mod.includes("shortest-path")) {
    tier3Text = "📐 算式骨架（慢动作分解）：\n• 步骤 1（第1步）：从起点出发，在相邻边缘格点标上 1；\n• 步骤 2（第2步）：内部交叉点标数 ＝ 左边点数字 ＋ 下边点数字；\n• 步骤 3：沿着格子顺藤摸瓜一路加到终点！";
  } else if (/统筹|烙饼|排队|煎饼/.test(prompt) || mod.includes("scheduling")) {
    tier3Text = "📐 算式骨架（慢动作分解）：\n• 步骤 1（第1步）：计算所有工件需要加工的总面数（或总工时）；\n• 步骤 2（第2步）：保持设备满负荷运转，每次都放满工位（如锅里始终放满 2 张饼）；\n• 步骤 3：最优总时间 ＝ 总工时 ÷ 满载并行能力。";
  } else if (/加乘原理|加法原理|乘法原理|搭配|穿衣/.test(prompt) || mod.includes("add-multiply")) {
    tier3Text = "📐 算式骨架（慢动作分解）：\n• 步骤 1（第1步）：判断各部分关系（分步还是分类）；\n• 步骤 2（第2步）：分步相继完成用乘法：N ＝ 选法1 × 选法2 × ...；\n• 步骤 3：独立类别挑选用加法：N ＝ 类别1 ＋ 类别2 ＋ ...。";
  } else {
    tier3Text = "📐 算式指引：分步列出算式，第1步先计算中间差量或单位量，第2步再计算最终所求。每走一步都离答案更近一步！";
  }

  hints.push({
    tier: 3,
    label: "第三阶 · 算式骨架（慢动作）",
    text: tier3Text
  });

  return hints;
}

function diagnoseMistake(question, studentAnswer) {
  if (!question || studentAnswer === undefined || studentAnswer === null) return null;
  const prompt = String(question.prompt || "");
  const sAnsStr = String(studentAnswer).trim();
  const cAnsStr = String(question.answer ?? "").trim();
  if (!sAnsStr || !cAnsStr) return null;

  const sNum = parseFloat(sAnsStr);
  const cNum = parseFloat(cAnsStr);
  const isNumeric = !isNaN(sNum) && !isNaN(cNum);

  // 1. 单位转换与数量级偏差 (10x, 60x, 100x, 1000x)
  if (isNumeric && cNum !== 0 && sNum !== 0) {
    const ratio = sNum / cNum;
    if (Math.abs(ratio - 10) < 0.001 || Math.abs(ratio - 0.1) < 0.001) {
      return "🌱 你的解题思路非常棒，不过计算数值相差 10 倍啦！请仔细核对题目单位是否统一（例如厘米与分米，或十进制进退位）。调整一下零的位置就对啦！";
    }
    if (Math.abs(ratio - 60) < 0.001 || Math.abs(ratio - (1 / 60)) < 0.001) {
      return "🌱 离胜利就差一小步！计算数值相差 60 倍，记得检查时间单位换算哦（1 小时 = 60 分钟，1 分钟 = 60 秒）。换算后再试一次吧！";
    }
    if (Math.abs(ratio - 100) < 0.001 || Math.abs(ratio - 0.01) < 0.001) {
      return "🌱 很有潜力的探索！计算数值相差 100 倍，请检查面积单位换算（1 平方米 = 100 平方分米）或百分数/小数转换，调整后再算算看！";
    }
    if (Math.abs(ratio - 1000) < 0.001 || Math.abs(ratio - 0.001) < 0.001) {
      return "🌱 运算的大方向很准！计算数值相差 1000 倍，请检查长度（千米与米）或重量（千克与克）单位换算。";
    }
  }

  // 2. 植树问题 / 间隔问题 (端点差一)
  if (/植树|路灯|电线杆|锯木|切段|爬楼|阶梯|敲钟|间隔/.test(prompt) && isNumeric) {
    const diff = sNum - cNum;
    if (diff === -1) {
      return "🌱 你的思考非常深入，只比正确答案少了 1 呢！请检查是否漏算了端点？两端都植树时：棵数 = 间隔数 + 1；敲钟问题从第 1 下开始算起。把这 1 补上就全对啦！";
    }
    if (diff === 1) {
      return "🌱 已经非常接近目标了，只比正确答案多了 1 哦！请检查是否多算了端点？两端都不植树（如两座楼之间）时：棵数 = 间隔数 - 1；锯木头次数 = 段数 - 1。减去这 1 就是胜利！";
    }
  }

  // 3. 鸡兔同笼 / 置换问题 (算成了另一种动物)
  if (/鸡|兔|头|腿|足|自行车|三轮车|蜘蛛|蜻蜓|轮子/.test(prompt) && isNumeric) {
    const headMatch = prompt.match(/共(?:有)?\s*(\d+)\s*(?:只|头|辆)/);
    if (headMatch) {
      const totalHeads = parseInt(headMatch[1], 10);
      if (Math.abs(sNum + cNum - totalHeads) < 0.001) {
        return `💡 哇，你离胜利只差一步！你算出的可能是另一种对象的数量（二者之和为 ${totalHeads}）。题目问的是特定对象，记得用总数减去你算出的量，就大功告成啦！`;
      }
    }
  }

  // 4. 列车过桥与车身长度
  if (/列车|火车|客车|货车|动车|高铁|过桥|隧道|车身|车长|错车|超车/.test(prompt) && isNumeric) {
    if (/过桥|穿过.*(?:桥|隧道)|通过.*(?:桥|隧道)|过隧道|全车通过/.test(prompt)) {
      return "💡 小侦探提醒：不小心触碰列车行程雷区啦～其实火车就像一条长长的贪吃蛇：列车过桥或穿隧道时，从车头上桥到车尾离桥，列车实际行驶的总路程 ＝【桥长/隧道长 ＋ 列车车长】！把车身长度补上，马上就能得出正确答案啦！";
    }
    if (/完全在桥上|完全在隧道内/.test(prompt)) {
      return "💡 小侦探提醒：不小心触碰列车行程雷区啦～列车完全在桥上（或隧道内）时，行驶路程 ＝【桥长/隧道长 － 列车车长】！请检查是否多算或误算了车长。";
    }
    if (/错车|相向而行/.test(prompt)) {
      return "💡 别着急，相向错车并不难：不小心触碰错车行程雷区啦！两列车相向错车，从车头相遇到车尾离开，相对行驶路程 ＝【两车车长之和】，相对速度 ＝【速度之和】！两项合在一起算算看！";
    }
    if (/超车|追及/.test(prompt)) {
      return "💡 超车问题就像捉迷藏：不小心触碰超车行程雷区啦！快车追及慢车并完全超车，相对行驶路程 ＝【两车车长之和】，相对速度 ＝【快车速 － 慢车速】！再试一次准行！";
    }
  }

  // 5. 平均速度
  if (/平均速度|往返/.test(prompt) && isNumeric) {
    const speeds = [];
    const speedMatches = prompt.matchAll(/(\d+(?:\.\d+)?)\s*(?:千米\/时|km\/h|米\/秒|m\/s|米\/分)/g);
    for (const m of speedMatches) {
      speeds.push(parseFloat(m[1]));
    }
    if (speeds.length >= 2) {
      const avgSpeed = (speeds[0] + speeds[1]) / 2;
      if (Math.abs(sNum - avgSpeed) < 0.1 && Math.abs(cNum - avgSpeed) > 0.1) {
        return "💡 探索精神可嘉！这里踩到了经典的平均速度小陷阱：平均速度绝不是两个速度相加除以 2！由于往返（或两段路）耗时不同，必须严格用公式【总路程 ÷ 总时间】进行计算！先分别算出时间再算总平均吧！";
      }
    }
    if (/平均速度/.test(prompt)) {
      return "💡 平均速度核心要诀：平均速度 ＝【总路程 ÷ 总时间】！切忌直接取速度的算术平均值，先分别求出各段所用时间再求总平均。";
    }
  }

  // 6. 行程问题 (相遇与追及速度混淆)
  if (/相遇|追及|相向|同向|背向|迎面|速度/.test(prompt)) {
    if (isNumeric && /相遇|相向/.test(prompt) && !/追及|追上/.test(prompt)) {
      return "🌱 相向而行、面对面跑的时候，距离在快速缩短哦！求解相遇时间应用【路程和 ÷ 速度和】，记得把两人的速度加在一起！";
    }
    if (isNumeric && /追及|追上|同向/.test(prompt)) {
      return "🌱 同向追及、一前一后跑的时候，后车一点点拉近距离！求解追及时间应用【路程差 ÷ 速度差】，用快车速度减去慢车速度哦！";
    }
  }

  // 7. 盈亏问题同异判定 (同类相减，异类相加)
  if (/(?:盈|亏|剩余|多出|还剩|缺少|不足|还差)/.test(prompt) && isNumeric) {
    const conditionText = prompt.replace(/(?:多少|几[个只位两本条块棵辆支朵台]|有多[少女])/g, "");
    const hasSurplus = /(?:剩|多出|多|盈)/.test(conditionText);
    const hasDeficit = /(?:还差|缺少|不足|亏|少\s*\d+)/.test(conditionText);
    const isSurplusDeficit = hasSurplus && hasDeficit;
    if (isSurplusDeficit) {
      return "💡 盈亏小口诀【一盈一亏，两次差量相加求总差】！一盈一亏时总差额 ＝ 盈 ＋ 亏，再除以两次分配的单人差量即可得出人数。";
    }
    return "💡 盈亏小口诀【同盈同亏，两次差量相减求总差】！若两次都是剩余（双盈）或都是不足（双亏），总差额应用大数减小数！";
  }

  // 8. 几何图形面积与高 (三角形/梯形遗漏除以 2)
  if (/(?:三角形|梯形)/.test(prompt) && isNumeric && cNum > 0 && sNum > 0) {
    if (Math.abs(sNum - cNum * 2) < 0.01) {
      return "🌱 哇，你算出的数值正好是正确答案的 2 倍！三角形面积 ＝ 底 × 高 ÷ 2，梯形面积 ＝ (上底 ＋ 下底) × 高 ÷ 2，只差最后除以 2 这一步就通关啦（切勿漏除了 2 哦）！";
    }
    if (Math.abs(sNum - cNum / 2) < 0.01) {
      return "🌱 你的计算只差最后一步：你算出的数值正好是正确答案的一半！逆求高或底时，请先将面积乘 2（即 高 ＝ 面积 × 2 ÷ 底），再进行后续除法计算。";
    }
  }

  // 9. 年龄问题核心铁律 (年龄差永恒不变)
  if (/(?:年龄|岁|父子|母女|兄弟|姐妹|爸爸.*儿子|妈妈.*女儿)/.test(prompt) && isNumeric) {
    return "💡 年龄问题核心铁律：两人的【年龄差永恒不变】！就像两辆匀速并排开的车，距离永远固定。倍数关系每一年都在动态改变，解题切记以‘恒定年龄差’为基准量！";
  }

  // 10. 和倍与差倍问题 (份数多算或少算 1 份)
  if (/倍/.test(prompt) && isNumeric) {
    const diff = sNum - cNum;
    if (Math.abs(diff) === 1) {
      return "🌱 倍数问题贴心提示：较小数作为 1 倍基准量；求和时总份数为 (倍数 + 1)，求差时总份数为 (倍数 - 1)。调整一下份数就好啦！";
    }
  }

  // 11. 还原 / 逆推问题
  if (/还原|倒推|原来|又拿走|又放入/.test(prompt)) {
    return "💡 还原逆推就像倒放录像带：从最后的结果倒着推回去，加变减、减变加、乘变除、除变乘！一步一步顺藤摸瓜！";
  }

  // 12. 求因数个数错因诊断
  if (/因数个数|多少个(?:不同)?(?:的正)?因数|因数一共有多少个|正因数有几个|多少个正因数/.test(prompt) && isNumeric) {
    if (Math.abs(sNum * 2 - cNum) < 0.01) {
      return "🌱 很有想法！你的答案正好是正确答案的一半，只填了因数对数（成对遗漏了另一半）。因数是成对出现的（例如 1×12, 2×6, 3×4），请记得把每对中的两个因数都计入（共 3 对 × 2 = 6 个）！";
    }
    if (sNum < cNum && sNum <= 4) {
      return "💡 概念辨析小锦囊：你计算的可能是【不同质因数的种数】！求【全部因数个数】时，必须将各质因数指数【分别加 1 后再相乘】：(指数1 + 1) × (指数2 + 1)...，因为每个质数可以取 0 次幂（贡献因数 1）！";
    }
    return "💡 因数个数求解关键：推荐使用【成对列举法】（从 1 开始成对寻找：1×N, 2×... 直到两数靠拢）或【因数个数定理】（质因数指数分别加 1 再相乘），确保 1 和自身不被遗漏。";
  }

  // 13. 最大公因数与最小公倍数混淆
  if (/最大公因数|最大公约数|最小公倍数|公因数|公约数|公倍数|短除|质因数|互质/.test(prompt) && isNumeric) {
    if (/最大公因数|最大公约数/.test(prompt) && sNum > cNum) {
      return "🌱 别担心，你计算的可能是【最小公倍数(LCM)】或两者乘积！短除法中，最大公因数(GCD)只乘【左侧竖列】的公质因数，结果不会大于任何一个原数。";
    }
    if (/最小公倍数|公倍数/.test(prompt) && sNum < cNum) {
      return "🌱 你计算的可能是【最大公因数(GCD)】！求最小公倍数(LCM)时，必须把【左侧竖列公质因数】和【底行互质商】呈“L”型全部连乘。再乘一下底部的商就对啦！";
    }
    return "💡 短除法关键警示：必须连续除以公质因数，直到商【互质】（公因数只有 1）为止！检查底部的商是否还能继续提取公因数。";
  }

  // 14. 方阵四周角点重复 (计算外层人数时乘以 4，忘了减去 4 个角)
  if (/方阵|四周|最外层/.test(prompt) && isNumeric) {
    const sideMatch = prompt.match(/每边(?:有|站|排)?\s*(\d+)/);
    if (sideMatch) {
      const side = parseInt(sideMatch[1], 10);
      if (Math.abs(sNum - side * 4) < 0.01 && cNum === (side - 1) * 4) {
        return "💡 哇，你离胜利只差一步！你算的是不是【每边人数 × 4】？角上的4个小朋友被重复数了两次（两条边都占用了角点）！记得减去多算的 4 个角：最外层人数 ＝ 每边人数 × 4 － 4 ＝ (每边 － 1) × 4 哟！";
      }
    }
  }

  // 15. 容斥原理集合重叠 (直接相加 A + B 忘记扣除交集)
  if (/(?:容斥|重叠|都参加|都喜欢|语文.*数学|英语.*数学)/.test(prompt) && isNumeric) {
    const nums = [];
    for (const m of prompt.matchAll(/(\d+)\s*(?:人|名|个)/g)) {
      nums.push(parseInt(m[1], 10));
    }
    if (nums.length >= 2 && Math.abs(sNum - (nums[0] + nums[1])) < 0.01 && sNum > cNum) {
      return "💡 很有想法！不过两样都参加的小朋友被你数了两次哦！就像两只重叠的手掌，必须把中间重叠部分（交集人数）减去一份：总人数 ＝ A ＋ B － 两样都参加的人数！";
    }
  }

  // 16. 浓度问题分母混淆 (把水当成分母，或误当纯水)
  if (/(?:浓度|糖水|盐水|稀释)/.test(prompt) && isNumeric) {
    return "💡 探索方向很准！注意浓度计算的分母必须是【糖水总重（溶质 ＋ 水）】，而不能只除以水哦！公式是：浓度 ＝ 纯溶质 ÷ (纯溶质 ＋ 水) × 100%！先算糖水总重吧！";
  }

  // 17. 图形计数 / 握手模型重复 (忘了除以 2)
  if (/(?:数线段|数角|数三角形|握手|多少条.*线段|多少个.*角|线段上有.*端点)/.test(prompt) && isNumeric) {
    if (Math.abs(sNum - cNum * 2) < 0.01) {
      return "🌱 你的感觉非常敏锐！算出来的数值正好是正确答案的 2 倍！因为从 A 到 B 和从 B 到 A 是同一条线段（同两个人握手），只算一次，最后记得除以 2 消除重复哦！公式：n × (n － 1) ÷ 2！";
    }
  }

  // 18. 加法原理与乘法原理混淆
  if (/(?:搭配|多少种不同|路线搭配|穿衣)/.test(prompt) && isNumeric) {
    const nums = [];
    for (const m of prompt.matchAll(/(\d+)\s*(?:件|条|顶|种)/g)) {
      nums.push(parseInt(m[1], 10));
    }
    if (nums.length >= 2) {
      const sum = nums[0] + nums[1];
      const prod = nums[0] * nums[1];
      if (Math.abs(sNum - sum) < 0.01 && Math.abs(cNum - prod) < 0.01) {
        return "💡 区分加法与乘法的小妙招：选了上衣【还要】选裤子，这是两步连续完成（分步），选法必须用【乘法相乘】（3×4＝12种），而不是加法相加哦！";
      }
      if (Math.abs(sNum - prod) < 0.01 && Math.abs(cNum - sum) < 0.01) {
        return "💡 区分加法与乘法的小妙招：如果只是从几件T恤或几件衬衫中【任选1件】（分类选其一），互斥选择用【加法相加】，不能用乘法哦！";
      }
    }
  }

  // 19. 比和比例分配
  if (/(?:比是|按\s*\d+\s*:\s*\d+|份数)/.test(prompt) && isNumeric) {
    return "💡 比和比例小口诀：把比 a:b 看成切蛋糕分小份！总份数 ＝ a ＋ b；先用【总数 ÷ 总份数】求出 1 小份是多少，再乘各自的份数！";
  }

  // 20. 若有针对性的 commonPitfall 则作为暖心提示
  if (question.commonPitfall) {
    return `🌱 暖心提示：${question.commonPitfall}`;
  }

  return "🌱 别灰心，深呼吸！仔细对比题目所求量与中间量，拿草稿纸画一条小线段或表格，一步步推导就能解开它～";
}

function renderActiveThinkingScaffold(question) {
  if (!question || typeof question !== "object" || typeof document === "undefined") return null;
  const hints = buildTieredHints(question);
  if (!hints || hints.length === 0) return null;

  const container = document.createElement("details");
  container.className = "active-hints-scaffold";
  container.dataset.activeHintsScaffold = "";

  const summary = document.createElement("summary");
  summary.className = "active-hints-scaffold__summary";
  summary.innerHTML = `
    <span class="active-hints-scaffold__title">🌱 读题卡壳了？点这里获取【通俗小锦囊】</span>
    <span class="active-hints-scaffold__badge">分步缓坡 · 生活比喻 · 保护独立思考</span>
    <span class="active-hints-scaffold__comfort-banner">🛡️ <strong>防畏难小贴士：</strong>难题只是披着复杂外衣的小游戏！跟着下面三个小台阶，一次只做一小步，搭积木就能通关～</span>
  `;
  container.append(summary);

  const content = document.createElement("div");
  content.className = "active-hints-scaffold__content";

  hints.forEach((hint) => {
    const card = document.createElement("div");
    card.className = `active-hints-scaffold__card active-hints-scaffold__card--tier${hint.tier}`;
    const header = document.createElement("div");
    header.className = "active-hints-scaffold__card-header";
    header.textContent = hint.label;
    const body = document.createElement("div");
    body.className = "active-hints-scaffold__card-body";
    if (body.style) {
      body.style.whiteSpace = "pre-line";
    }
    body.textContent = hint.text;
    card.append(header, body);
    content.append(card);
  });

  container.append(content);
  return container;
}

function getVariantTransferGuide(question) {
  if (!question || typeof question !== "object") return null;
  const prompt = String(question.prompt || "");
  const mod = String(question.moduleId || "");
  const method = String(question.thinkingMethodId || question.typicalModel || "");
  const pitfall = question.commonPitfall || question.solutionReview?.pitfall || question.solutionReview?.errorTrap;
  const analogy = getConcreteAnalogy(question);

  let category = "default";
  if (/鸡|兔|头|腿|足|门票|大船小船/.test(prompt) || /(chicken-rabbit)/.test(mod) || /(chicken-rabbit)/.test(method)) {
    category = "chicken-rabbit";
  } else if (/方阵|四周|实心方阵|空心方阵/.test(prompt) || /(square-array)/.test(mod) || /(square-array)/.test(method)) {
    category = "square-array";
  } else if (/植树|间隔|锯木|爬楼|电线杆|路灯|敲钟/.test(prompt) || /(tree-planting)/.test(mod) || /(tree-planting)/.test(method)) {
    category = "tree-planting";
  } else if (/列车|火车|客车|货车|动车|高铁|过桥|隧道|车身|车长|顺水|逆水|相遇|追及|速度|路程/.test(prompt) || /(motion|speed|train-bridge|river-flow)/.test(mod) || /(motion|speed|train-bridge|river-flow)/.test(method)) {
    category = "motion";
  } else if (/容斥|韦恩|重叠|两样都|都参加|都喜欢|集合/.test(prompt) || /(inclusion|venn)/.test(mod) || /(inclusion|venn)/.test(method)) {
    category = "inclusion-exclusion";
  } else if (/年龄|和差|和倍|差倍|大数|小数/.test(prompt) || /(sum-diff|age)/.test(mod) || /(sum-diff|age)/.test(method)) {
    category = "sum-diff";
  } else if (/周期|循环|规律|等差|数列|递增|递减|推进|下一格|第几个/.test(prompt) || /(periodicity|patterns|arithmetic-series|sequence)/.test(mod) || /(periodicity|patterns|arithmetic-series|sequence)/.test(method)) {
    category = "periodicity";
  } else if (/盈|亏|剩余|不足|多出|还差/.test(prompt) || /(surplus-deficit)/.test(mod) || /(surplus-deficit)/.test(method)) {
    category = "surplus-deficit";
  } else if (/因数|倍数|最大公因|最小公倍|短除|质因数/.test(prompt) || /(factors|multiples|prime)/.test(mod) || /(factors|multiples|prime)/.test(method)) {
    category = "factors-multiples";
  } else if (/加乘原理|加法原理|乘法原理|搭配|分步|选法/.test(prompt) || /(add-multiply|tree-counting)/.test(mod) || /(add-multiply|tree-counting)/.test(method)) {
    category = "add-multiply-principle";
  } else if (/平均数|均值|平均分|平均重量/.test(prompt) || /(average)/.test(mod) || /(average)/.test(method)) {
    category = "average";
  } else if (/数线段|数角|数三角形|握手/.test(prompt) || /(geometry-counting)/.test(mod) || /(geometry-counting)/.test(method)) {
    category = "geometry-counting";
  } else if (/浓度|糖水|盐水|稀释/.test(prompt) || /(concentration)/.test(mod) || /(concentration)/.test(method)) {
    category = "concentration";
  } else if (/抽屉|鸽巢|最不利|至少|保证/.test(prompt) || /(pigeonhole)/.test(mod) || /(pigeonhole)/.test(method)) {
    category = "pigeonhole-principle";
  }

  const GUIDES = {
    "chicken-rabbit": {
      modelTitle: "假设替换模型 · 吹哨抬脚法",
      coreEssence: "假定全部属于某一种对象，计算整体特征差额，再除以单体替换产生的单位差量。",
      difficultyBreakthrough: "难点在于两种未知对象相互交织，无法直接除尽。先假设全是其中一种，再把总差额除以单差，一步锁定数量！",
      defaultPitfall: "不要把每只兔子多出的脚算成 4 只，兔子比鸡多出的是 (4 - 2 = 2) 只腿！",
      sketchGuide: analogy?.sketch || "在草稿纸上画两排圆圈代表头，先每只点两只脚，再把剩下的脚分配给兔子。",
      variants: [
        { tag: "变式 1 · 车轮与机器", desc: "三轮车与自行车共 10 辆，轮子共 24 个。把三轮车看作兔子，自行车看作鸡！" },
        { tag: "变式 2 · 得分与倒扣", desc: "答对加5分，答错倒扣2分。答错不仅没拿5分还倒扣2分，单题差额是 5 + 2 = 7 分！" },
        { tag: "变式 3 · 租船与包装", desc: "大船坐6人小船坐4人。换一艘大船比小船多坐 2 人，用差额迅速定数量！" }
      ],
      generalizationTip: "只要题目出现【两种对象、两种特征量、已知总数】，不管外衣是鸡兔、车轮还是租船，全部套用假设替换法！"
    },
    "tree-planting": {
      modelTitle: "点与间隔模型 · 手掌指缝法",
      coreEssence: "伸出小手看手指与指缝：物体数量与相邻间隔段数的对应关系。分清两端都种、只种一端与封闭环形。",
      difficultyBreakthrough: "难点在于容易把间隔数直接当成棵数。两端都植树时，树的棵数永远比间隔段数多 1 棵！",
      defaultPitfall: "两端都植树时，千万别忘了加 1；敲钟问题钟声次数比间隔数多 1！",
      sketchGuide: analogy?.sketch || "画一条线段，用小竖线标出每一棵树，数一数小树和它们中间的空格段数。",
      variants: [
        { tag: "变式 1 · 木头锯段", desc: "把木头锯成 5 段只需锯 4 次，锯木耗时按锯次（段数 - 1）计算。" },
        { tag: "变式 2 · 楼层攀登", desc: "从 1 楼爬到 5 楼只爬了 4 层楼梯（层数 = 目标楼层 - 1）。" },
        { tag: "变式 3 · 钟楼敲钟", desc: "敲 6 下钟声之间只有 5 个时间间隔，每个间隔时长保持恒定。" }
      ],
      generalizationTip: "分清‘点’与‘段’：两端都种多1棵，只种一端正好等，封闭环形点段平！"
    },
    "square-array": {
      modelTitle: "方阵角点去重 · 洋葱剥皮法",
      coreEssence: "四周边界排布时，四个角上的顶点被相邻两条边重复占用，计算周界必须扣除重复。",
      difficultyBreakthrough: "最外层四周人数 = (每边人数 - 1) × 4 或 每边人数 × 4 - 4，切勿直接边长乘以 4！",
      defaultPitfall: "角上的 4 个小朋友被两条边重复计算，四周总人数切记减去 4 个角！",
      sketchGuide: analogy?.sketch || "在草稿纸上画正方形网格，圈出 4 个角落的小圆圈，一眼看清两条边抢夺角点。",
      variants: [
        { tag: "变式 1 · 剥层看内层", desc: "方阵向内剥去一层，每边人数少 2，外层人数比相邻内层永远多 8 人。" },
        { tag: "变式 2 · 空心方阵", desc: "空心方阵总人数 = 大实心方阵总数减去内部中空实心方阵总数。" },
        { tag: "变式 3 · 花坛四周摆花", desc: "正方形花坛四周摆花盆，4个拐角摆花同样被两条边共享，切记去重。" }
      ],
      generalizationTip: "遇到多边形四周排布，先圈出角点，防止拐角重复计算！"
    },
    "motion": {
      modelTitle: "相对运动模型 · 位移叠加法",
      coreEssence: "相向而行距离快速缩短（速度和），同向追及后车拉近差距（速度差）。物体有长时路程叠加身长。",
      difficultyBreakthrough: "火车过桥路程不是单纯桥长，而是【桥长 + 车长】；相遇是合走总路程，追及是缩短路程差。",
      defaultPitfall: "相遇速度相加，追及速度相减；火车过桥别漏了车身自己的长度！",
      sketchGuide: analogy?.sketch || "画一条笔直跑道线段图，用箭头标出两人起点、运动方向与相对速度。",
      variants: [
        { tag: "变式 1 · 环形跑道", desc: "同向跑是追及（快车多跑一圈拉开差距），反向跑是相遇（两人合跑一整圈）。" },
        { tag: "变式 2 · 两车错车", desc: "两列火车迎面错过，相对路程等于两车车长之和，相对速度为两车速度相加。" },
        { tag: "变式 3 · 顺逆水行船", desc: "顺水速度 = 船速 + 水速；逆水速度 = 船速 - 水速；水速 = (顺水速 - 逆水速) ÷ 2。" }
      ],
      generalizationTip: "画跑道线段图，标出相对距离与速度箭头，路程公式一目了然！"
    },
    "inclusion-exclusion": {
      modelTitle: "集合容斥模型 · 韦恩重叠法",
      coreEssence: "把两个交叠集合合并时，中间重叠的交集被数了两次，必须扣除一份重复。",
      difficultyBreakthrough: "总人数 = A组人数 + B组人数 - 两组都参加人数；若有两组都不参加的，最后补加上。",
      defaultPitfall: "两类人数直接相加后，中间两样都参加的小朋友被多算了一次，必须减去一份！",
      sketchGuide: analogy?.sketch || "画两个交叠的圆圈（韦恩图），左月牙、中间交集、右月牙分别标上数字。",
      variants: [
        { tag: "变式 1 · 双科竞赛", desc: "语文及格人数 + 数学及格人数 - 双科及格人数 = 至少一科及格人数。" },
        { tag: "变式 2 · 买书订报", desc: "只订A刊人数 + 只订B刊人数 + 两样都订人数 = 全体订户总数。" },
        { tag: "变式 3 · 三集合容斥", desc: "三圈相加，减去三对两两交集，再加上中间重叠的三重交集。" }
      ],
      generalizationTip: "在草稿纸上画韦恩图，把每个月牙和交集区域分别标数，不重不漏！"
    },
    "sum-diff": {
      modelTitle: "和差差倍模型 · 积木截齐法",
      coreEssence: "利用差量把长线段截齐或短线段补齐，使多个未知量转化为单一等量基准份数。",
      difficultyBreakthrough: "较小数 = (和 - 差) ÷ 2；较大数 = (和 + 差) ÷ 2；年龄差永远锁死不变。",
      defaultPitfall: "先求出较小量后，还要用和或差检查另一个量，算年龄差时差额永远恒定！",
      sketchGuide: analogy?.sketch || "画一长一短两条线段，在长线段末尾用虚线画出多出的差额，一目了然。",
      variants: [
        { tag: "变式 1 · 年龄不变量", desc: "无论经过多少年，两人的年龄差永远不变，将动态问题转化为静态差倍。" },
        { tag: "变式 2 · 移多补少", desc: "甲给乙 5 本后两人相等，说明甲原本比乙多 5×2=10 本。" },
        { tag: "变式 3 · 绳子对折", desc: "绳子对折或剪去一段，对比剩余长度与倍数差，求全长。" }
      ],
      generalizationTip: "画一长一短线段，截齐除以2得小数，补齐除以2得大数！"
    },
    "periodicity": {
      modelTitle: "周期余数模型 · 规律阶梯法",
      coreEssence: "将循环节打包成整周期，用除法求整圈数与余数，余数精准定位最终项。",
      difficultyBreakthrough: "余数为 0 时对应周期的最后一项，而不是第一项；等差数列项数 = (末项 - 首项) ÷ 公差 + 1。",
      defaultPitfall: "余数为 0 时对应周期的最后一项，不是第一项；算等差项数切记最后要加 1！",
      sketchGuide: analogy?.sketch || "画一个圆圈标出周期图案，或者在数字间画跳跃小弧线标出步长。",
      variants: [
        { tag: "变式 1 · 彩灯与排队", desc: "红绿黄灯不断循环，计算整周期次数，看余数几步决定对应颜色。" },
        { tag: "变式 2 · 星期推算", desc: "经过天数除以 7，看余数是几，从今天开始往后数几天。" },
        { tag: "变式 3 · 等差数列求和", desc: "求和 = (首项 + 末项) × 项数 ÷ 2，倒序相加凑成相同的大配对。" }
      ],
      generalizationTip: "抓住不变的循环节长度或固定公差步长，整圈打包后只看余数定位！"
    },
    "surplus-deficit": {
      modelTitle: "盈亏差额模型 · 分糖比差法",
      coreEssence: "比较两种分配方案的盈亏状态，两次总差额除以两次单体分配量之差，求分配对象数。",
      difficultyBreakthrough: "一盈一亏时总差额为两者相加（多出的 + 还差的）；两盈或两亏时总差额为大数减小数。",
      defaultPitfall: "一盈一亏总差额要相加，同盈同亏总差额要相减；别混淆分配对象和分配总量！",
      sketchGuide: analogy?.sketch || "在草稿纸上画出两次分糖果的对比，用天平或方框看清楚总差额。",
      variants: [
        { tag: "变式 1 · 租车租船", desc: "每车坐40人空出2车，每车坐30人差10个座位，两次分配差额定车辆数。" },
        { tag: "变式 2 · 买书购物", desc: "买5本差8元，买3本余12元，总差额 8+12=20 元除以单本差 5-3=2 元。" },
        { tag: "变式 3 · 修路排班", desc: "每天修20米提前2天，每天修15米推迟3天，转化成总量盈亏。" }
      ],
      generalizationTip: "总差额（一盈一亏相加，同盈同亏相减）÷ 两次每份之差 = 分配对象总数！"
    },
    "factors-multiples": {
      modelTitle: "因数倍数模型 · 短除阶梯法",
      coreEssence: "质因数是数理底层积木。短除法左竖列乘积为最大公因数(GCD)，整圈连乘为最小公倍数(LCM)。",
      difficultyBreakthrough: "短除必须除到商互质为止；求全部因数个数时，质因数指数分别加 1 再相乘。",
      defaultPitfall: "求最大公约数只乘左侧公质因数，求最小公倍数必须乘到底部互质商！",
      sketchGuide: analogy?.sketch || "画倒过来的除号阶梯，左边放公因数，底边放商，一清二楚。",
      variants: [
        { tag: "变式 1 · 等长裁木裁纸", desc: "把两根不同长木条截成同样长的小段且不浪费，求最长小段长度（求最大公因数）。" },
        { tag: "变式 2 · 班车同站相遇", desc: "两路公交车分别每6分钟和每8分钟发车，下一次同时发车时间（求最小公倍数）。" },
        { tag: "变式 3 · 积木方砖拼正方形", desc: "用长12宽8的长方形拼成最小的正方形（求两边长最小公倍数）。" }
      ],
      generalizationTip: "分东西不剩余求最大公约数(半边乘)；排队转圈重遇求最小公倍数(一圈乘)！"
    },
    "add-multiply-principle": {
      modelTitle: "加乘计数模型 · 分类分步法",
      coreEssence: "分类互斥用加法，分步连续用乘法。同一任务看是一步搞定还是多步接力。",
      difficultyBreakthrough: "容易混淆加与乘。选了上衣还要选裤子必须用乘法；几件T恤任选一件互斥用加法。",
      defaultPitfall: "同一件事不能同时既加又乘；分步完成用乘法，分类任选用加法！",
      sketchGuide: analogy?.sketch || "画树状分支图：从每件上衣伸出小树枝连到不同的裤子上，数清末端叶子数。",
      variants: [
        { tag: "变式 1 · 穿衣搭配", desc: "3件上衣配4条裤子，分步完成，搭配数 3×4=12 种。" },
        { tag: "变式 2 · 路线走法", desc: "从甲地经乙地到丙地，甲到乙有2条路，乙到丙有3条路，共 2×3=6 种走法。" },
        { tag: "变式 3 · 组数填空", desc: "用 1, 2, 3 组成无重复两位数，百位有3种选法，十位有2种选法，共 3×2=6 个。" }
      ],
      generalizationTip: "做一件事：一步到位用加法，多步接力用乘法！"
    },
    "average": {
      modelTitle: "均值平移模型 · 移多补少法",
      coreEssence: "平均数代表整体平衡水平。移高补低使各份齐平，总和 = 平均数 × 总份数。",
      difficultyBreakthrough: "平均数不能直接简单相加再除以2；必须牢牢抓住总和守恒与总份数。",
      defaultPitfall: "平均数不一定是原数据中的某一个数，不能只找中间值，牢牢抓住总和！",
      sketchGuide: analogy?.sketch || "画几个不同高低的柱子，画一条横线看看多出的部分能不能填补凹陷的部分。",
      variants: [
        { tag: "变式 1 · 补齐目标总分", desc: "前四门平均85，想让五门平均达到88，第五门必须考 88×5 - 85×4 分。" },
        { tag: "变式 2 · 基准数法", desc: "一组数在90上下波动，以90为基准，算超出与不足的差额再均摊。" },
        { tag: "变式 3 · 加权平均", desc: "两班人数不同求总平均分，必须算出两班总分之和再除以两班总人数。" }
      ],
      generalizationTip: "平均数就像水面找平，牢牢盯住【总数 = 均值 × 份数】！"
    },
    "geometry-counting": {
      modelTitle: "图形计数模型 · 握手排队法",
      coreEssence: "一条线上 n 个点产生线段数 = n×(n-1)÷2。数角、数三角形底边完全相同。",
      difficultyBreakthrough: "从A到B和从B到A是同一条线段，往返算一次必须除以 2 消除重复。",
      defaultPitfall: "从A到B与从B到A是同一条线段，只算一次，最后千万别忘了除以 2！",
      sketchGuide: analogy?.sketch || "画一条线段和上面的点，像小彩虹一样在每两个点之间画彩色弧线连接。",
      variants: [
        { tag: "变式 1 · 互通电话与握手", desc: "6个同学互相通电话一次，通话总次数 = 6×5÷2 = 15 次。" },
        { tag: "变式 2 · 单循环球赛", desc: "8支球队打单循环比赛，总比赛场数 = 8×7÷2 = 28 场。" },
        { tag: "变式 3 · 车站车票印制", desc: "一条铁路线有5个车站，需要准备多少种不同的往返车票。" }
      ],
      generalizationTip: "握手公式记心中：点数 × (点数 - 1) ÷ 2，数线段数角一把抓！"
    },
    "concentration": {
      modelTitle: "浓度溶质守恒 · 纯糖不变量",
      coreEssence: "加水稀释只变淡、纯糖一粒没少；蒸发水分只变浓、纯糖质量锁死。",
      difficultyBreakthrough: "浓度分母是【糖水总重（溶质 + 水）】，切勿只拿水当分母。",
      defaultPitfall: "浓度计算的分母必须是糖水总重（纯糖 + 水），不能只拿水作分母！",
      sketchGuide: analogy?.sketch || "画一个量杯，底部沉淀的是纯糖，上面是水，合在一起是总糖水。",
      variants: [
        { tag: "变式 1 · 加水稀释", desc: "往糖水里加水，纯糖质量不变，用原来纯糖质量除以新浓度求新糖水总重。" },
        { tag: "变式 2 · 加糖增浓", desc: "往糖水里加糖，水分质量保持不变，抓住不变的水克数反向求解。" },
        { tag: "变式 3 · 两种溶液混合", desc: "两杯糖水混合，将两份纯糖相加除以两份总糖水质量求新浓度。" }
      ],
      generalizationTip: "做浓度题先找不变量：加水盯纯糖，加糖盯纯水！"
    },
    "pigeonhole-principle": {
      modelTitle: "抽屉极端模型 · 最倒霉摸球法",
      coreEssence: "往最倒霉的情况逼近。先把每种单色全摸一只，再多摸 1 只必定成双凑对。",
      difficultyBreakthrough: "保证必定发生，必须考虑极端最不利情况，最倒霉总数加 1 即是底线。",
      defaultPitfall: "求【至少】能保证的情况，必须往最倒霉的极限情况考虑，不能侥幸！",
      sketchGuide: analogy?.sketch || "画几个小抽屉，先给每个抽屉分 1 个苹果，多出来的苹果必定挤进某个抽屉。",
      variants: [
        { tag: "变式 1 · 摸袜摸手套", desc: "黑白红袜子各5只，在黑暗中至少摸出多少只才能保证有一双同色袜子。" },
        { tag: "变式 2 · 月份与生日", desc: "班里至少有几人才能保证有 2 人同月出生（12个月+1人 = 13人）。" },
        { tag: "变式 3 · 同色扑克牌", desc: "一副扑克牌抽多少张才能保证有4张同一花色。" }
      ],
      generalizationTip: "闭上眼睛想最倒霉：把不同花样摸个遍，最后再多摸 1 只必中大奖！"
    },
    "default": {
      modelTitle: "数理关系模型 · 等量转换法",
      coreEssence: "理清已知条件与待求问题的数量联系，画图或列表建立对应等量关系。",
      difficultyBreakthrough: "先圈出已知条件，分步推演中间过渡量，最后验算所求量是否与题目单位一致。",
      defaultPitfall: "不要省略最后的验算，核对题目所求数量与单位是否完全一致！",
      sketchGuide: analogy?.sketch || "在草稿纸上标出已知数据，画出对应线段或表格，逐步推演。",
      variants: [
        { tag: "变式 1 · 逆向倒推", desc: "从最终结果倒着推回去，加变减、乘变除，顺藤摸瓜找回原数。" },
        { tag: "变式 2 · 条件代换", desc: "把较复杂的对象用简单的等价对象替换，化繁为简。" },
        { tag: "变式 3 · 表格排查", desc: "将多条件列成二维表格，逐项排除不可能的情况。" }
      ],
      generalizationTip: "审题圈已知，动笔画草稿，把复杂大题拆解成两三个简单小步骤！"
    }
  };

  const item = GUIDES[category] || GUIDES["default"];
  return {
    ...item,
    category,
    pitfallWarning: pitfall || item.defaultPitfall
  };
}

const HintScaffold = {
  CONCRETE_ANALOGIES,
  getConcreteAnalogy,
  getVariantTransferGuide,
  buildTieredHints,
  diagnoseMistake,
  renderActiveThinkingScaffold
};
if (typeof globalThis !== "undefined") {
  globalThis.HintScaffold = HintScaffold;
}
if (typeof window !== "undefined") {
  window.HintScaffold = HintScaffold;
}
module.exports = HintScaffold;

