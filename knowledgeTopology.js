(function attachKnowledgeTopology(root) {
  const strandOrder = [
    "观察与周期",
    "计数与集合",
    "数量关系",
    "变化与效率",
    "空间与离散结构",
    "逻辑推理"
  ];

  const learningStrands = [
    {
      id: "observation",
      title: "观察与周期",
      purpose: "先学会发现结构，再用周期、等差和位置关系表达规律。",
      moduleIds: ["patterns", "quick-calculation", "arithmetic-series", "periodicity"]
    },
    {
      id: "counting",
      title: "计数与集合",
      purpose: "从不重不漏的枚举进入加乘原理、集合重叠和容斥思想。",
      moduleIds: ["enumeration", "add-multiply-principle", "inclusion-exclusion"]
    },
    {
      id: "quantity",
      title: "数量关系",
      purpose: "用线段、份数、差量和假设建立应用题模型。",
      moduleIds: ["sum-diff", "unit-rate", "surplus-deficit", "chicken-rabbit", "age"]
    },
    {
      id: "change",
      title: "变化与效率",
      purpose: "把数量关系放到时间、速度、平均变化和工作效率中理解。",
      moduleIds: ["average", "motion", "engineering"]
    },
    {
      id: "space-discrete",
      title: "空间与离散结构",
      purpose: "理解点、线、间隔、边界和图形转化。",
      moduleIds: ["tree-planting", "geometry"]
    },
    {
      id: "logic",
      title: "逻辑推理",
      purpose: "用条件、排除和验证把多个知识点组织成严密推理。",
      moduleIds: ["logic"]
    }
  ];

  const topologyByModule = {
    patterns: {
      strand: "观察与周期",
      stage: "结构观察",
      order: 10,
      prerequisiteIds: [],
      nextIds: ["quick-calculation", "periodicity", "enumeration"],
      whyNow: "找规律是奥数学习的入口，训练孩子从表面数字中发现稳定结构。",
      continuity: "先会观察变化，才能理解巧算、周期、枚举和后续模型中的结构化思考。"
    },
    "quick-calculation": {
      strand: "观察与周期",
      stage: "数字结构",
      order: 20,
      prerequisiteIds: ["patterns"],
      nextIds: ["arithmetic-series", "sum-diff"],
      whyNow: "巧算让孩子先观察数字结构，再决定运算顺序，是从会算走向会想的关键一步。",
      continuity: "凑整、拆补和配对会继续支撑等差求和、应用题简算和复杂计算。"
    },
    "arithmetic-series": {
      strand: "观察与周期",
      stage: "等差与配对",
      order: 30,
      prerequisiteIds: ["patterns", "quick-calculation"],
      nextIds: ["periodicity", "add-multiply-principle"],
      whyNow: "等差数列把规律观察推进到项数、间隔和配对求和，是公式意识的早期入口。",
      continuity: "项数与间隔思想会迁移到植树、图形计数和综合求和问题中。"
    },
    periodicity: {
      strand: "观察与周期",
      stage: "余数定位",
      order: 40,
      prerequisiteIds: ["patterns"],
      nextIds: ["enumeration", "tree-planting"],
      whyNow: "周期问题把“重复规律”推进到“用余数定位”，是从观察走向抽象表达的关键一步。",
      continuity: "余数思想会在日期、排列、循环路线和分组计数中不断出现。"
    },
    enumeration: {
      strand: "计数与集合",
      stage: "不重不漏",
      order: 50,
      prerequisiteIds: ["patterns"],
      nextIds: ["add-multiply-principle", "inclusion-exclusion", "logic"],
      whyNow: "枚举训练有序思考，是后续计数、逻辑和组合问题的基础。",
      continuity: "先能完整列出可能，再学习如何处理分步、分类、重复和重叠。"
    },
    "add-multiply-principle": {
      strand: "计数与集合",
      stage: "分类与分步",
      order: 60,
      prerequisiteIds: ["enumeration"],
      nextIds: ["inclusion-exclusion", "logic"],
      whyNow: "加法原理和乘法原理把枚举升级为结构化计数，帮助孩子判断什么时候加、什么时候乘。",
      continuity: "分类与分步是排列组合、路线计数、图形计数和概率启蒙的基础。"
    },
    "inclusion-exclusion": {
      strand: "计数与集合",
      stage: "处理重叠",
      order: 70,
      prerequisiteIds: ["enumeration", "add-multiply-principle"],
      nextIds: ["logic"],
      whyNow: "容斥解决“重复计算”的问题，把枚举升级为集合计数。",
      continuity: "理解重叠后，孩子能更好处理统计、调查和复杂分类问题。"
    },
    "sum-diff": {
      strand: "数量关系",
      stage: "和差份数",
      order: 80,
      prerequisiteIds: ["quick-calculation"],
      nextIds: ["unit-rate", "surplus-deficit", "age"],
      whyNow: "和差倍是应用题建模的核心入口，帮助孩子把文字关系转成线段和份数。",
      continuity: "份数、差量和总量会继续支撑盈亏、年龄、鸡兔和行程问题。"
    },
    "unit-rate": {
      strand: "数量关系",
      stage: "单位量",
      order: 90,
      prerequisiteIds: ["sum-diff"],
      nextIds: ["average", "motion", "engineering"],
      whyNow: "归一归总让孩子先找到一份量或单位效率，是应用题迁移能力的桥梁。",
      continuity: "单位量思想会直接连接平均数、速度、效率和工程类问题。"
    },
    "surplus-deficit": {
      strand: "数量关系",
      stage: "差量比较",
      order: 100,
      prerequisiteIds: ["sum-diff"],
      nextIds: ["chicken-rabbit"],
      whyNow: "盈亏问题把两种方案进行比较，强化差量和补偿思想。",
      continuity: "差量修正正是鸡兔同笼假设法的前置思想。"
    },
    "chicken-rabbit": {
      strand: "数量关系",
      stage: "假设修正",
      order: 110,
      prerequisiteIds: ["surplus-deficit", "sum-diff"],
      nextIds: ["logic"],
      whyNow: "鸡兔同笼把差量思想发展为假设法，是从算术应用题走向代数思维的关键模型。",
      continuity: "假设—比较—修正的思路可以迁移到车辆、邮票、得分和混合问题。"
    },
    average: {
      strand: "变化与效率",
      stage: "总量均分",
      order: 120,
      prerequisiteIds: ["unit-rate"],
      nextIds: ["motion", "engineering"],
      whyNow: "平均数帮助孩子理解总量与份数的关系，并为速度、效率打基础。",
      continuity: "平均不是简单取中间，而是把总量重新均分。"
    },
    motion: {
      strand: "变化与效率",
      stage: "相对变化",
      order: 130,
      prerequisiteIds: ["unit-rate", "average"],
      nextIds: ["engineering", "logic"],
      whyNow: "行程问题把单位量放进时间变化中，训练速度、路程、时间之间的模型化关系。",
      continuity: "相遇和追及的核心是距离如何被共同缩短或用速度差缩短。"
    },
    engineering: {
      strand: "变化与效率",
      stage: "工作效率",
      order: 140,
      prerequisiteIds: ["unit-rate", "average"],
      nextIds: ["logic"],
      whyNow: "工程问题把单位量思想迁移到工作效率中，训练“总量为 1”和合作效率相加。",
      continuity: "工程模型会继续连接合作、进出水、效率比较和分数应用题。"
    },
    age: {
      strand: "数量关系",
      stage: "不变量",
      order: 150,
      prerequisiteIds: ["sum-diff"],
      nextIds: ["logic"],
      whyNow: "年龄问题突出年龄差不变，帮助孩子建立时间平移中的不变量意识。",
      continuity: "不变量意识会迁移到几何、周期、追及和逻辑推理。"
    },
    "tree-planting": {
      strand: "空间与离散结构",
      stage: "点与间隔",
      order: 160,
      prerequisiteIds: ["periodicity", "arithmetic-series"],
      nextIds: ["geometry"],
      whyNow: "植树问题把长度、点和间隔区分开，是从连续长度走向离散结构的关键。",
      continuity: "点—间隔思想会迁移到钟面、排队、封闭路线和图形边界。"
    },
    geometry: {
      strand: "空间与离散结构",
      stage: "图形转化",
      order: 170,
      prerequisiteIds: ["tree-planting"],
      nextIds: ["logic"],
      whyNow: "几何题训练分割、拼合、边界和面积守恒，是空间结构理解的核心。",
      continuity: "几何中的转化思想会回到数量关系和逻辑证明中。"
    },
    logic: {
      strand: "逻辑推理",
      stage: "综合验证",
      order: 180,
      prerequisiteIds: ["enumeration", "add-multiply-principle", "inclusion-exclusion"],
      nextIds: [],
      whyNow: "逻辑推理把条件、可能性和验证整合起来，是综合运用各类模型的终点之一。",
      continuity: "当孩子能说明为什么排除、为什么成立，就从会算走向会论证。"
    },
    "rational-axis": {
      strand: "观察与周期",
      stage: "方向与距离",
      order: 210,
      prerequisiteIds: ["quick-calculation", "sum-diff", "periodicity"],
      nextIds: ["polynomial-geometry", "cartesian-plane"],
      whyNow: "负数与数轴将单纯的大小比较升级为具有几何方向性的度量，绝对值|x-a|对应数轴两点距离。",
      continuity: "数轴上的两点距离是解析几何、折线最值和不等式区间的底层基石。"
    },
    "polynomial-geometry": {
      strand: "空间与离散结构",
      stage: "几何代数化",
      order: 220,
      prerequisiteIds: ["geometry", "quick-calculation"],
      nextIds: ["factoring-structures", "pythagoras-trig"],
      whyNow: "几何面积拼图升华为乘法公式，将长方形割补用完全平方与平方差公式精确刻画。",
      continuity: "乘法公式是多项式运算与因式分解的结构原点。"
    },
    "factoring-structures": {
      strand: "代数与方程思想",
      stage: "逆向还原分解",
      order: 230,
      prerequisiteIds: ["polynomial-geometry"],
      nextIds: ["rational-equations", "quadratic-extremum"],
      whyNow: "因式分解是整式乘法的逆向操作，通过提取公因式、十字相乘将复杂高次多项式化为乘积结构。",
      continuity: "因式分解是方程降次求解与分式化简的命脉。"
    },
    "linear-elimination": {
      strand: "数量关系",
      stage: "消元公理化",
      order: 240,
      prerequisiteIds: ["chicken-rabbit", "surplus-deficit"],
      nextIds: ["rational-equations", "linear-functions"],
      whyNow: "将鸡兔同笼的假设置换与盈亏差量比较，公理化为代入消元与加减消元法求解多元线性系统。",
      continuity: "消元思想直接支撑多元约束、物理平衡及解析几何交点解算。"
    },
    "rational-equations": {
      strand: "变化与效率",
      stage: "变率与分母约束",
      order: 250,
      prerequisiteIds: ["linear-elimination", "engineering"],
      nextIds: ["inverse-functions"],
      whyNow: "工程与行程问题中引入未知时间分母变量，形成分式方程，并树立增根检验的严密意识。",
      continuity: "分式方程与变量增根是后续反比例函数与动力学变率分析的桥梁。"
    },
    "inequality-systems": {
      strand: "逻辑推理",
      stage: "区间与可行域",
      order: 260,
      prerequisiteIds: ["pigeonhole-principle", "linear-elimination"],
      nextIds: ["quadratic-extremum"],
      whyNow: "最不利原则与抽屉极值走向实数轴连续解集交集，掌握边界开闭与可行域优化决策。",
      continuity: "不等式组是极值规划、临界状态判定与区间最值分析的利器。"
    },
    "similarity-triangles": {
      strand: "空间与离散结构",
      stage: "比例截线与相似",
      order: 270,
      prerequisiteIds: ["geometry", "geometry-counting"],
      nextIds: ["congruence-auxiliary", "pythagoras-trig"],
      whyNow: "沙漏与蝴蝶模型的等高面积比升华为平行截割定理与相似三角形，维度从二维面积归并为一维线段比。",
      continuity: "相似模型是射影定理、平面几何计算与三角测量的前置基石。"
    },
    "congruence-auxiliary": {
      strand: "空间与离散结构",
      stage: "刚体对称与三大构造",
      order: 280,
      prerequisiteIds: ["similarity-triangles"],
      nextIds: ["circle-locus", "pythagoras-trig"],
      whyNow: "全等是图形变换的叠合，倍长中线、截长补短与旋转变换构成几何证明的三大核心骨架。",
      continuity: "全等变换是平面几何演绎公理化证明体系的最高支柱。"
    },
    "pythagoras-trig": {
      strand: "空间与离散结构",
      stage: "直角度量与三角比",
      order: 290,
      prerequisiteIds: ["polynomial-geometry", "similarity-triangles"],
      nextIds: ["circle-locus", "cartesian-plane"],
      whyNow: "赵爽弦图面积拼图代数化为勾股定理，结合相似边比固定诞生锐角三角比(sin, cos, tan)。",
      continuity: "勾股与三角比彻底打通了几何空间与代数度量的边界。"
    },
    "circle-locus": {
      strand: "空间与离散结构",
      stage: "圆周公理与轨迹最值",
      order: 300,
      prerequisiteIds: ["congruence-auxiliary", "pythagoras-trig"],
      nextIds: ["quadratic-extremum"],
      whyNow: "垂径定理与圆周角定理揭示圆中几何不变量，定弦定角与阿氏圆将静态图形升华为动点轨迹最值。",
      continuity: "圆周与动点轨迹是最具综合深度的平面几何巅峰。"
    },
    "cartesian-plane": {
      strand: "空间与离散结构",
      stage: "空间坐标化",
      order: 310,
      prerequisiteIds: ["rational-axis", "pythagoras-trig"],
      nextIds: ["linear-functions", "inverse-functions"],
      whyNow: "由一维数轴扩展至二维平面直角坐标系，将几何位置与代数有序数对(x, y)一一对应。",
      continuity: "直角坐标系是现代数学将几何问题代数化（解析几何）的终极载体。"
    },
    "linear-functions": {
      strand: "变化与效率",
      stage: "斜率变率与交点",
      order: 320,
      prerequisiteIds: ["cartesian-plane", "motion", "linear-elimination"],
      nextIds: ["quadratic-extremum"],
      whyNow: "匀速运动在坐标系中呈现为一次函数直线，速度即斜率，两车相遇即两直线交点与方程组解。",
      continuity: "一次函数是连续变量分析与变化率量化的起点。"
    },
    "inverse-functions": {
      strand: "变化与效率",
      stage: "守恒乘积与双曲线",
      order: 330,
      prerequisiteIds: ["cartesian-plane", "rational-equations"],
      nextIds: ["quadratic-extremum"],
      whyNow: "做功恒定与面积不变性在坐标系中展开为反比例双曲线，曲线上点引出的矩形面积恒等于|k|。",
      continuity: "反比例函数刻画自然界最广泛的反比守恒规律。"
    },
    "quadratic-extremum": {
      strand: "变化与效率",
      stage: "抛物线顶点与工程极值",
      order: 340,
      prerequisiteIds: ["linear-functions", "factoring-structures", "inequality-systems"],
      nextIds: [],
      whyNow: "等差求和的二次项在坐标系中展开为二次函数抛物线，配方求对称轴顶点解决最大收益与弹道极值。",
      continuity: "二次函数是初等数学中综合度最高、工程应用最广泛的函数极值模型。"
    }
  };

  function getTopologyForModule(module = {}) {
    const topology = topologyByModule[module.id];
    if (topology) {
      return { ...topology, prerequisiteIds: [...topology.prerequisiteIds], nextIds: [...topology.nextIds] };
    }
    return {
      strand: "综合拓展",
      stage: "模型迁移",
      order: 1000,
      prerequisiteIds: [],
      nextIds: [],
      whyNow: "这是对既有模型的拓展练习，重点是把旧知识迁移到新情境。",
      continuity: "先识别题目中的核心关系，再连接到已经学过的模型。"
    };
  }

  function getModuleTitleById(modules, moduleId) {
    return modules.find((module) => module.id === moduleId)?.title || moduleId;
  }

  function enrichModule(module, modules) {
    const topology = getTopologyForModule(module);
    return {
      ...module,
      knowledgeTopology: {
        ...topology,
        prerequisiteTitles: topology.prerequisiteIds.map((id) => getModuleTitleById(modules, id)),
        nextTitles: topology.nextIds.map((id) => getModuleTitleById(modules, id))
      }
    };
  }

  function orderModulesByTopology(modules = []) {
    return [...modules].sort((left, right) => {
      const leftTopology = getTopologyForModule(left);
      const rightTopology = getTopologyForModule(right);
      return leftTopology.order - rightTopology.order || left.title.localeCompare(right.title, "zh-CN");
    });
  }

  function applyKnowledgeTopology(modules = []) {
    const ordered = orderModulesByTopology(modules);
    return ordered.map((module) => enrichModule(module, ordered));
  }

  const INTRINSIC_LOGIC_BRIDGES = Object.freeze([
    Object.freeze({
      id: "chicken-rabbit-to-linear-elimination",
      sourceModule: "chicken-rabbit",
      targetModule: "linear-elimination",
      bridgeType: "algorithm-axiomatization",
      title: "假设法向消元法的公理化跃迁",
      insight: "鸡兔同笼中假设全为鸡并计算腿数差，与代入消元法中将 y=总数-x 代入腿数方程完全同构；加减消元则是盈亏两次差量相消的公理化。"
    }),
    Object.freeze({
      id: "sandglass-butterfly-to-similarity",
      sourceModule: "geometry-decomposition",
      targetModule: "similarity-triangles",
      bridgeType: "geometric-reduction",
      title: "面积比模型向比例线段定理升华",
      insight: "沙漏模型与蝴蝶定理依靠等高三角形面积比间接求比例；引入相似三角形与平行截割定理后，面积比直接转化为对应线段成比例，解题步数减少一半。"
    }),
    Object.freeze({
      id: "motion-to-linear-functions",
      sourceModule: "motion",
      targetModule: "linear-functions",
      bridgeType: "continuous-coordinate-mapping",
      title: "行程问题走向一次函数解析几何",
      insight: "路程 s 为因变量 y，时间 t 为自变量 x，速度 v 即为直线的斜率 k；两车相遇在几何上就是两条直线的交点坐标，在代数上就是二元一次方程组的解。"
    }),
    Object.freeze({
      id: "area-puzzle-to-polynomial-identities",
      sourceModule: "geometry",
      targetModule: "polynomial-geometry",
      bridgeType: "geometric-algebraic-isomorphism",
      title: "几何面积拼图升华为代数乘法公式",
      insight: "长方形割补与正方形网格的等积变换，用代数语言记录就是完全平方与平方差公式；逆向拆解即是因式分解，成为方程化简的核心工具。"
    }),
    Object.freeze({
      id: "work-problems-to-rational-equations",
      sourceModule: "engineering",
      targetModule: "rational-equations",
      bridgeType: "denominator-constraint-extension",
      title: "工程效率走向分式方程与增根检验",
      insight: "将工程问题的工作总量设为 1，工作时间为未知数 x 时，效率表达为 1/x，从而诞生分式方程；物理实际要求效率存在，导出增根检验（分母不为零）的严密性。"
    }),
    Object.freeze({
      id: "pigeonhole-to-inequality-systems",
      sourceModule: "pigeonhole-principle",
      targetModule: "inequality-systems",
      bridgeType: "discrete-to-continuous-boundary",
      title: "最不利原则跃迁为实数轴不等式可行域",
      insight: "抽屉原理中的极端最倒霉情况兜底，升华为实数轴上连续区间的边界开闭与不等式组公共交集决策。"
    }),
    Object.freeze({
      id: "arithmetic-series-to-quadratic-extremum",
      sourceModule: "arithmetic-series",
      targetModule: "quadratic-extremum",
      bridgeType: "discrete-sum-to-continuous-parabola",
      title: "等差求和二次项走向抛物线极值巅峰",
      insight: "等差数列求和公式中自然包含 n^2 二次项，连续化后形成二次函数；通过配方法求解对称轴顶点，统一解决工程抛体轨迹与最大效益最值问题。"
    })
  ]);

  const OLYMPIAD_SPIRAL_AXES = Object.freeze([
    Object.freeze({
      id: "algebra-elimination",
      title: "代数建模与消元演进轴",
      strand: "代数与方程思想",
      summary: "从线段和差走向极值假设、双向盈亏，再到消元表格、代数方程建模直至线性方程组与分式方程，形成系统的量化消元体系。",
      milestones: Object.freeze([
        { stage: "和差基准", moduleIds: ["sum-diff"], summary: "抓住线段图与基准量，以和与差为双锚点" },
        { stage: "置换假设", moduleIds: ["chicken-rabbit"], summary: "全量极端假设与单体差量累加置换" },
        { stage: "双向盈亏", moduleIds: ["surplus-deficit"], summary: "两次分配方案双向比较，同减异加" },
        { stage: "倒推消元", moduleIds: ["restoration-problems", "elimination-table"], summary: "知果索因逆向还原与多未知量消元表格" },
        { stage: "方程建模", moduleIds: ["equation-model", "integrated-modeling"], summary: "设立未知数构建等量守恒，终结复杂数量关系" },
        { stage: "消元公理化", moduleIds: ["linear-elimination"], summary: "二元方程组代入与加减消元，公理化假设置换算法" },
        { stage: "变率与分式方程", moduleIds: ["rational-equations"], summary: "工作效率与行程变率引入分母未知数，严密增根检验" },
        { stage: "函数映射与交点", moduleIds: ["linear-functions"], summary: "进入平面直角坐标系，斜率即速率，相遇即交点" }
      ])
    }),
    Object.freeze({
      id: "geometry-transformation",
      title: "空间几何与割补演进轴",
      strand: "空间与图形转化",
      summary: "从平移周长面积、格点割补，到模型比例转化、相似投影、全等辅助线与圆周动点轨迹，建立图形守恒与转化直觉。",
      milestones: Object.freeze([
        { stage: "周长与面积基准", moduleIds: ["geometry"], summary: "长正方形网格与平移巧算周长面积" },
        { stage: "格点与割补等积", moduleIds: ["geometry-counting"], summary: "三角形梯形出入相友、旋转平移与等积变形" },
        { stage: "模型分解与比例", moduleIds: ["geometry-decomposition"], summary: "鸟头、蝴蝶、燕尾模型与高底面积比" },
        { stage: "空间展开与截面", moduleIds: ["cube-unfolding"], summary: "三维立体透视、展开图对立面与旋转体截面" },
        { stage: "平行截线与相似", moduleIds: ["similarity-triangles"], summary: "沙漏与蝴蝶模型升华，从面积比跃迁为线段比例定理" },
        { stage: "刚体对称与全等", moduleIds: ["congruence-auxiliary"], summary: "倍长中线、截长补短与旋转变换三大几何辅助线" },
        { stage: "勾股弦图与三角比", moduleIds: ["pythagoras-trig"], summary: "赵爽弦图代数化与直角三角形锐角三角比投影" },
        { stage: "圆周公理与隐圆最值", moduleIds: ["circle-locus"], summary: "垂径定理、圆周角定理与定弦定角动点轨迹阿氏圆" }
      ])
    }),
    Object.freeze({
      id: "number-theory-structure",
      title: "数论基石与结构演进轴",
      strand: "数论与整除体系",
      summary: "从奇偶判定、周期余数，到质因数短除分解、实数连续性、乘法公式与二次根式，掌握深层数论代数结构。",
      milestones: Object.freeze([
        { stage: "奇偶与周期余数", moduleIds: ["periodicity", "parity-divisibility"], summary: "同余余数定位与加乘奇偶不变性" },
        { stage: "因倍数与短除法", moduleIds: ["factors-multiples", "prime-factorization"], summary: "质因数分解短除法，两数之积等于GCD乘LCM" },
        { stage: "奇偶不变量与状态", moduleIds: ["parity-invariant"], summary: "操作变化中的奇偶守恒与周期状态判定" },
        { stage: "整除特征与构造", moduleIds: ["congruence-intro"], summary: "高位整除特征判定与同余定理同余类" },
        { stage: "实数连续与数轴距离", moduleIds: ["rational-axis"], summary: "负数方向性与数轴绝对值距离|x-a|，折线中位数极值" },
        { stage: "面积代数与乘法公式", moduleIds: ["polynomial-geometry", "factoring-structures"], summary: "正方形拼图升华乘法公式与因式分解逆向还原" },
        { stage: "二次根式化简", moduleIds: ["radicals-exact"], summary: "开方运算的不尽根式精确化简与分母有理化" }
      ])
    }),
    Object.freeze({
      id: "combinatorics-optimization",
      title: "组合离散与极值演进轴",
      strand: "组合与运筹优化",
      summary: "从不重不漏的加乘穷举，到容斥原理、抽屉最不利原则、不等式可行域与二次函数抛物线极值，训练极端与最优策略。",
      milestones: Object.freeze([
        { stage: "有序分类分步", moduleIds: ["enumeration", "add-multiply-principle"], summary: "树状图穷举与分类相加分步相乘" },
        { stage: "容斥重叠抵消", moduleIds: ["inclusion-exclusion"], summary: "多集合韦恩图重叠项计算与至少至多反向容斥" },
        { stage: "抽屉与最不利原则", moduleIds: ["pigeonhole-principle", "worst-case"], summary: "苹果与抽屉归宿原理、最倒霉极端情况兜底" },
        { stage: "博弈策略与构造", moduleIds: ["optimal-strategy", "construction", "integrated-strategy"], summary: "倒推必胜态对称构造与最优统筹调度" },
        { stage: "连续区间与不等式组", moduleIds: ["inequality-systems"], summary: "抽屉极值走向实数轴连续解集交集与可行域边界决策" },
        { stage: "反比例守恒与双曲线", moduleIds: ["inverse-functions"], summary: "做功乘积守恒模型与双曲线矩形面积不变性" },
        { stage: "二次加速与抛物线极值", moduleIds: ["quadratic-extremum"], summary: "等差二次项走向抛物线顶点坐标与工程物理包络极值" }
      ])
    })
  ]);

  const api = {
    applyKnowledgeTopology,
    getTopologyForModule,
    knowledgeTopologyByModule: topologyByModule,
    learningStrands,
    olympiadSpiralAxes: OLYMPIAD_SPIRAL_AXES,
    OLYMPIAD_SPIRAL_AXES,
    INTRINSIC_LOGIC_BRIDGES,
    intrinsicLogicBridges: INTRINSIC_LOGIC_BRIDGES,
    orderModulesByTopology,
    strandOrder
  };

  if (Array.isArray(root.MATH_LEARNING_DATA)) {
    root.MATH_LEARNING_DATA = applyKnowledgeTopology(root.MATH_LEARNING_DATA);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.KnowledgeTopology = api;
})(typeof window !== "undefined" ? window : globalThis);
