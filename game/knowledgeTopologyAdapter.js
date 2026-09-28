/**
 * Knowledge Topology Adapter
 * 知识拓扑与认知衔接适配器：
 * 1. 6大数学思维主轴定义（色彩、图示、认知目标）
 * 2. 知识专题 DAG 先验依赖与分支拓扑
 * 3. 认知衔接桥梁（思维罗盘：已掌握基石 -> 本关核心思维武器 -> 未来迁移目标）
 * 4. 大国重器工程子系统算法算力赋能矩阵（数学与工程共振）
 */

const STRANDS = Object.freeze({
  observation: {
    id: "observation",
    title: "观察与周期",
    color: "#38bdf8", // 亮青
    accentColor: "rgba(56, 189, 248, 0.25)",
    icon: "👁️",
    summary: "从表象中发现规律，用周期与等差抽象动态变化。"
  },
  counting: {
    id: "counting",
    title: "计数与集合",
    color: "#f5d06f", // 金黄
    accentColor: "rgba(245, 208, 111, 0.25)",
    icon: "🔢",
    summary: "从不重不漏的枚举走向加乘原理与容斥，掌握排列与分类。"
  },
  quantity: {
    id: "quantity",
    title: "数量关系",
    color: "#a855f7", // 紫晶
    accentColor: "rgba(168, 85, 247, 0.25)",
    icon: "⚖️",
    summary: "用线段图、份数模型与差量假设化解复杂生活应用题。"
  },
  change: {
    id: "change",
    title: "变化与效率",
    color: "#10b981", // 翡翠绿
    accentColor: "rgba(16, 185, 129, 0.25)",
    icon: "⚡",
    summary: "将数量关系拓展至时间、速度、效率与工程协同。"
  },
  "space-discrete": {
    id: "space-discrete",
    title: "空间与离散",
    color: "#f97316", // 赤金橙
    accentColor: "rgba(249, 115, 22, 0.25)",
    icon: "📐",
    summary: "点、线、间隔、边界割补与空间图形结构转化。"
  },
  logic: {
    id: "logic",
    title: "逻辑与策略",
    color: "#f43f5e", // 绯红
    accentColor: "rgba(244, 63, 94, 0.25)",
    icon: "🧩",
    summary: "条件排除、反证不变量、边界探索与最优决策。"
  }
});

// 模块知识库：先验关系、思维罗盘、大国重器工程算法共振
const MODULE_TOPOLOGY = Object.freeze({
  // ====== 第1章：启程试炼 · 歼-20 威龙隐身歼击机 ======
  patterns: {
    strand: "observation",
    prerequisiteIds: [],
    learningBridge: {
      prerequisiteSummary: "具备自然数数感与简单序数理解能力",
      methodSummary: { label: "特征识别", description: "从表面数字跳跃中识别出稳定的递增或循环结构" },
      transferTargets: [{ topicId: "quick-calculation", reason: "规律提取支持凑整拆补" }, { topicId: "periodicity", reason: "循环规律升级为余数定位" }]
    },
    engineeringAffinity: {
      subsystem: "隐身外形与吸波折角",
      algorithmRole: "隐身曲率递变模型：通过机身折角连续规律最小化雷达波前向反射"
    }
  },
  "quick-calculation": {
    strand: "observation",
    prerequisiteIds: ["patterns"],
    learningBridge: {
      prerequisiteSummary: "已掌握连续数字差值规律，能快速识别互补数（如 7 与 3、25 与 4）",
      methodSummary: { label: "凑整拆补", description: "重构运算顺序，利用加减乘除交换结合律将繁算转化为整十整百口算" },
      transferTargets: [{ topicId: "arithmetic-series", reason: "配对求和的基石" }, { topicId: "sum-diff", reason: "应用题列式简算" }]
    },
    engineeringAffinity: {
      subsystem: "机载综合高速航电",
      algorithmRole: "总线位运算拆补算法：重组多通道航电遥测数据包，实现微秒级通信响应"
    }
  },
  "arithmetic-series": {
    strand: "observation",
    prerequisiteIds: ["patterns", "quick-calculation"],
    learningBridge: {
      prerequisiteSummary: "熟练掌握首尾数字特征与凑整配对思想",
      methodSummary: { label: "高斯配对", description: "推导项数公式与首尾配对求和公式，把离散求和转化为高效乘除" },
      transferTargets: [{ topicId: "tree-planting", reason: "项数与间隔的离散对应" }, { topicId: "periodicity", reason: "序列位置与步长预测" }]
    },
    engineeringAffinity: {
      subsystem: "有源相控阵雷达 (AESA)",
      algorithmRole: "波束步进扫描算法：数千个发射单元等差延迟相位调制，无惯性瞬时锁定目标"
    }
  },
  periodicity: {
    strand: "observation",
    prerequisiteIds: ["patterns"],
    learningBridge: {
      prerequisiteSummary: "能识别一组物品或数字的循环重复特征",
      methodSummary: { label: "余数定位", description: "计算循环周期长度，用带余除法中的余数精准定位最终状态" },
      transferTargets: [{ topicId: "tree-planting", reason: "封闭圆周与周期点位分布" }, { topicId: "parity-divisibility", reason: "整除与余数同余思想" }]
    },
    engineeringAffinity: {
      subsystem: "三余度电传飞控系统",
      algorithmRole: "时钟周期同步协议：多备份主控计算机以固定微秒时钟余数保持严格指令锁步"
    }
  },
  enumeration: {
    strand: "counting",
    prerequisiteIds: ["patterns"],
    learningBridge: {
      prerequisiteSummary: "能够按大小顺序依次罗列常见数值",
      methodSummary: { label: "有序分类", description: "确定单一维度的排列基准，不重不漏地穷举所有可能情况" },
      transferTargets: [{ topicId: "add-multiply-principle", reason: "升级为加乘结构化计数" }, { topicId: "logic", reason: "构建穷举排除检验树" }]
    },
    engineeringAffinity: {
      subsystem: "内埋弹舱构型决策",
      algorithmRole: "武器挂载组合穷举：无遗漏枚举格斗弹、中距弹与辅助油箱的质量最优组合"
    }
  },
  "add-multiply-principle": {
    strand: "counting",
    prerequisiteIds: ["enumeration"],
    learningBridge: {
      prerequisiteSummary: "掌握无遗漏的枚举分类基础",
      methodSummary: { label: "分类与分步", description: "识别彼此独立的类别（加法）与前后相继的环节（乘法）" },
      transferTargets: [{ topicId: "inclusion-exclusion", reason: "处理存在交叉的集合" }, { topicId: "motion", reason: "多路段路径规划" }]
    },
    engineeringAffinity: {
      subsystem: "超低空突防航路规划",
      algorithmRole: "突防航线分步组合优化：分段串联地形匹配点与战术变向，避开防空预警雷达"
    }
  },
  "inclusion-exclusion": {
    strand: "counting",
    prerequisiteIds: ["enumeration", "add-multiply-principle"],
    learningBridge: {
      prerequisiteSummary: "理解分类计数，能明确两组数据的交集现象",
      methodSummary: { label: "重叠抵消", description: "绘制集合重叠示意图，利用总数 = A + B - 重叠部分 剔除重复计算" },
      transferTargets: [{ topicId: "logic", reason: "多条件交叉排除" }]
    },
    engineeringAffinity: {
      subsystem: "多传感器融合探测",
      algorithmRole: "雷达与光电重叠区去重：剔除红外与雷达重合探测区的虚警重复目标"
    }
  },
  "sum-diff": {
    strand: "quantity",
    prerequisiteIds: ["quick-calculation"],
    learningBridge: {
      prerequisiteSummary: "掌握已知加减逆运算，能理解大小数的基本差额",
      methodSummary: { label: "线段图建模", description: "把抽象文字关系画成长短线段，通过补齐或切除差额求得一份标准量" },
      transferTargets: [{ topicId: "unit-rate", reason: "延伸为份数单倍量" }, { topicId: "surplus-deficit", reason: "比较两次方案差额" }]
    },
    engineeringAffinity: {
      subsystem: "主翼燃油动态配平",
      algorithmRole: "左右机翼重心配平：根据主油箱和值与差额实时调度油泵，维持机体跨音速横滚平衡"
    }
  },
  "unit-rate": {
    strand: "quantity",
    prerequisiteIds: ["sum-diff"],
    learningBridge: {
      prerequisiteSummary: "熟练利用线段图理解多份相等的总量模型",
      methodSummary: { label: "单位量归一", description: "先求出一份、一天或一单位的标准量，再按需缩放求目标总量" },
      transferTargets: [{ topicId: "average", reason: "各份重新均分" }, { topicId: "motion", reason: "速度即单位时间路程" }]
    },
    engineeringAffinity: {
      subsystem: "矢量发动机推重比控制",
      algorithmRole: "单位推力能耗优化：实时测算超音速巡航单耗，动态扩展最大作战半径"
    }
  },
  "surplus-deficit": {
    strand: "quantity",
    prerequisiteIds: ["sum-diff"],
    learningBridge: {
      prerequisiteSummary: "理解份数与差量关系",
      methodSummary: { label: "双方案差额对比", description: "对比两次分配中的盈（多出）与亏（不足），用总差除以单差求份数" },
      transferTargets: [{ topicId: "chicken-rabbit", reason: "为统一假设法提供差额修正思想" }]
    },
    engineeringAffinity: {
      subsystem: "短距起飞推力校准",
      algorithmRole: "滑跑推力冗余平衡：对比不同迎角下的升力盈余与阻力亏损，校准加力点火时机"
    }
  },
  "chicken-rabbit": {
    strand: "quantity",
    prerequisiteIds: ["surplus-deficit", "sum-diff"],
    learningBridge: {
      prerequisiteSummary: "深刻理解差量比较，能体会“替换其中一个将导致总数发生固定变化”",
      methodSummary: { label: "假设修正法", description: "假设全部为某一对象，计算与现实的整体差额，通过单只差额反推真实数量" },
      transferTargets: [{ topicId: "logic", reason: "假设-检验反推" }, { topicId: "engineering", reason: "多工种混合效率配平" }]
    },
    engineeringAffinity: {
      subsystem: "空战威胁目标特征识别",
      algorithmRole: "回波残差假设推导：假设空中机群全为某一机型，根据反射总量残差精准反推目标编队"
    }
  },
  average: {
    strand: "change",
    prerequisiteIds: ["unit-rate"],
    learningBridge: {
      prerequisiteSummary: "熟练掌握总量除以份数得到单位单一量",
      methodSummary: { label: "移多补少", description: "把高低不平的数量拉平均分，掌握“总量 = 平均数 × 份数”的双向转化" },
      transferTargets: [{ topicId: "motion", reason: "全程平均速度计算" }, { topicId: "engineering", reason: "团队人均合作效率" }]
    },
    engineeringAffinity: {
      subsystem: "综合热工环控温平衡",
      algorithmRole: "机身热沉均温散热：将相控阵与超算产生的高温峰值均匀导向机体吸热涂层，避免局部热过载"
    }
  },

  // ====== 第2章：深海探测行动 · 奋斗者号万米载人深潜器 ======
  "pigeonhole-principle": {
    strand: "counting",
    prerequisiteIds: ["enumeration"],
    learningBridge: {
      prerequisiteSummary: "理解分类计数与整除均分",
      methodSummary: { label: "最不利原则", description: "当物品数量超过抽屉数量时，保证至少有一个抽屉含有大于等于商加一的物品" },
      transferTargets: [{ topicId: "counting-transfer", reason: "综合抽屉与极值判定" }, { topicId: "logic", reason: "确定性存在证明" }]
    },
    engineeringAffinity: {
      subsystem: "钛合金耐压球舱密封冗余",
      algorithmRole: "深潜极值承压判定：证明极端压力分布下多重密封圈至少有两级处于绝对弹性区间"
    }
  },
  "counting-transfer": {
    strand: "counting",
    prerequisiteIds: ["pigeonhole-principle", "add-multiply-principle"],
    learningBridge: {
      prerequisiteSummary: "掌握枚举、加乘与容斥等多种单项计数工具",
      methodSummary: { label: "计数工具链选", description: "在复杂场景中组合分类、分步、排除与最不利原则，精准求得方案总数" },
      transferTargets: [{ topicId: "geometry-counting", reason: "空间网格的组合统计" }]
    },
    engineeringAffinity: {
      subsystem: "万米深海测控综合总线",
      algorithmRole: "多路水声信号解复用：从杂乱微弱声波中结构化重组深度、方位与生命体征数据"
    }
  },
  motion: {
    strand: "change",
    prerequisiteIds: ["average", "unit-rate"],
    learningBridge: {
      prerequisiteSummary: "熟练掌握速度作为单位时间的单位位移概念",
      methodSummary: { label: "相对速度建模", description: "应用路程 = 速度 × 时间，构建相遇问题（速度和）与追及问题（速度差）" },
      transferTargets: [{ topicId: "train-bridge", reason: "物体自身长度参与位移" }, { topicId: "engineering", reason: "协同工作速度" }]
    },
    engineeringAffinity: {
      subsystem: "深潜航迹推算与洋流导航",
      algorithmRole: "万米垂直下潜位移矩阵：叠加横向深海洋流速度矢量，精确导航至马里亚纳海沟着陆点"
    }
  },
  engineering: {
    strand: "change",
    prerequisiteIds: ["unit-rate", "average"],
    learningBridge: {
      prerequisiteSummary: "理解单位效率概念，能进行分步求和计算",
      methodSummary: { label: "工程总量化一", description: "将未知总任务量设为单位 1，求出各自工效后通过工效相加求协同工作时间" },
      transferTargets: [{ topicId: "efficiency-transfer", reason: "多系统复合工作效率" }]
    },
    engineeringAffinity: {
      subsystem: "高密动力电池并联供电",
      algorithmRole: "多组固态电池协同放电效率：按各组内阻效率优化放电速率，保障12小时水下巡航"
    }
  },
  "train-bridge": {
    strand: "change",
    prerequisiteIds: ["motion"],
    learningBridge: {
      prerequisiteSummary: "掌握标准行程问题中的速度与路程关系",
      methodSummary: { label: "长度参与运动", description: "将质点运动升级为有长度物体：完全通过路程 = 桥长 + 车长" },
      transferTargets: [{ topicId: "efficiency-transfer", reason: "相对运动与长度叠加" }]
    },
    engineeringAffinity: {
      subsystem: "母船水面吊放机械臂对接",
      algorithmRole: "母船海浪起伏相对运动抓取：综合缆绳长度与升沉速度，实现高海况下平稳脱钩与回收"
    }
  },
  age: {
    strand: "quantity",
    prerequisiteIds: ["sum-diff"],
    learningBridge: {
      prerequisiteSummary: "熟练运用和差倍线段图分析多个变量",
      methodSummary: { label: "差值不变量", description: "抓住时间流逝中两对象年龄差永远不变的守恒特征，将动态问题转化为静态差倍" },
      transferTargets: [{ topicId: "logic", reason: "不变量逻辑证明" }]
    },
    engineeringAffinity: {
      subsystem: "深海温盐深浮力自动平衡",
      algorithmRole: "海水密度差值恒定追踪：根据海水盐度深度曲线，保持深潜器下潜净浮力差恒定"
    }
  },
  "efficiency-transfer": {
    strand: "change",
    prerequisiteIds: ["motion", "engineering"],
    learningBridge: {
      prerequisiteSummary: "融通速度与工效概念",
      methodSummary: { label: "多源效率协同", description: "将多台设备、多个水泵或充放电速率统一为变化率方程求解" },
      transferTargets: [{ topicId: "logic", reason: "系统状态转移分析" }]
    },
    engineeringAffinity: {
      subsystem: "应急上浮抛载压载水舱",
      algorithmRole: "压载铁抛弃与高压注气排水效率：毫秒级响应确保万米紧急自救上浮加速度"
    }
  },
  "tree-planting": {
    strand: "space-discrete",
    prerequisiteIds: ["periodicity", "arithmetic-series"],
    learningBridge: {
      prerequisiteSummary: "掌握等差间隔与周期计算",
      methodSummary: { label: "点与间隔模型", description: "分清两端都种（棵数=段数+1）、只种一端（棵数=段数）与封闭环形（棵数=段数）" },
      transferTargets: [{ topicId: "geometry", reason: "周长与顶点点位分布" }]
    },
    engineeringAffinity: {
      subsystem: "海底超短基线声学定位阵",
      algorithmRole: "应答器几何间隔标定：利用等距阵元接收时间差，将水下定位误差缩小至厘米级"
    }
  },
  geometry: {
    strand: "space-discrete",
    prerequisiteIds: ["tree-planting"],
    learningBridge: {
      prerequisiteSummary: "理解长度、线段相加与封闭图形周长概念",
      methodSummary: { label: "割补转化", description: "通过平移、旋转、拼合将不规则图形转化为熟悉的长方形或正方形求面积与周长" },
      transferTargets: [{ topicId: "geometry-counting", reason: "网格多图形有序分类" }]
    },
    engineeringAffinity: {
      subsystem: "耐压水动力低阻线型外壳",
      algorithmRole: "流体外轮廓割补阻力最小化：通过几何流线曲面拼接，将万米下潜摩擦阻力降低 35%"
    }
  },
  logic: {
    strand: "logic",
    prerequisiteIds: ["chicken-rabbit", "inclusion-exclusion", "pigeonhole-principle"],
    learningBridge: {
      prerequisiteSummary: "掌握分类枚举、假设法与反例排除",
      methodSummary: { label: "网格矩阵排除", description: "建立二维真值表格，根据线索逐项排除矛盾情况，推导出唯一确定结论" },
      transferTargets: [{ topicId: "parity-divisibility", reason: "奇偶同余逻辑裁定" }]
    },
    engineeringAffinity: {
      subsystem: "深潜应急智能故障决策树",
      algorithmRole: "多重传感器矛盾仲裁：在声呐与光学信号冲突时，通过逻辑真值表判断真实海况"
    }
  },
  "geometry-counting": {
    strand: "space-discrete",
    prerequisiteIds: ["geometry", "enumeration"],
    learningBridge: {
      prerequisiteSummary: "掌握图形割补与分类枚举",
      methodSummary: { label: "分层网格计数", description: "按基本图形、复合图形尺寸从小到大分层分类统计，杜绝空间漏计" },
      transferTargets: [{ topicId: "logic", reason: "空间几何命题求证" }]
    },
    engineeringAffinity: {
      subsystem: "高分辨率多波束测深声呐",
      algorithmRole: "三维海底微地形网格重建：自动分割并统计海山、海沟地质断裂带网格特征"
    }
  },
  "parity-divisibility": {
    strand: "logic",
    prerequisiteIds: ["patterns", "pigeonhole-principle"],
    learningBridge: {
      prerequisiteSummary: "理解偶数、奇数与整除乘除性质",
      methodSummary: { label: "奇偶不变量", description: "利用奇+偶=奇、奇×奇=奇等运算守恒律，无需精确计算直接判定结果的不可能性" },
      transferTargets: [{ topicId: "logic", reason: "构建数论反证法" }]
    },
    engineeringAffinity: {
      subsystem: "万米水声扩频抗干扰通信",
      algorithmRole: "水下低频通信奇偶校验纠错：在海流噪声干扰中利用奇偶校验码快速纠正误码"
    }
  }
});

// 通用模块后备配置生成器（针对章节 3~9 中的其他模块）
function getFallbackModuleTopology(moduleId, chapterId) {
  let strand = "quantity";
  if (/patterns|periodicity|series|factor|multiple|prime/.test(moduleId)) strand = "observation";
  else if (/counting|pigeonhole|enumeration|multiply|set|tree-counting/.test(moduleId)) strand = "counting";
  else if (/geometry|angle|triangle|area|perimeter|volume|surface|scale|shape/.test(moduleId)) strand = "space-discrete";
  else if (/motion|speed|engineering|time|rate|work|train|average/.test(moduleId)) strand = "change";
  else if (/logic|parity|divisibility|case|verify|estimate|decision|risk/.test(moduleId)) strand = "logic";

  return {
    strand,
    prerequisiteIds: [],
    learningBridge: {
      prerequisiteSummary: "已掌握前置基础算术与逻辑模型",
      methodSummary: { label: "专项建模", description: "分析核心变量关联，选择对应工具列式求解" },
      transferTargets: [{ topicId: "logic", reason: "综合逻辑验证" }]
    },
    engineeringAffinity: {
      subsystem: "工程核心计算模组",
      algorithmRole: "关键参数矩阵计算与实时状态监控"
    }
  };
}

/**
 * 获取模块的完整拓扑定义
 */
function getModuleTopology(moduleId, chapterId = "") {
  return MODULE_TOPOLOGY[moduleId] || getFallbackModuleTopology(moduleId, chapterId);
}

/**
 * 获取主轴配置
 */
function getStrand(strandId) {
  return STRANDS[strandId] || STRANDS.quantity;
}

/**
 * 获取所有主轴列表
 */
function getAllStrands() {
  return Object.values(STRANDS);
}

/**
 * 计算章内各关卡在星图中的多分支可用状态
 * 规则：
 * 1. 关卡记录中已有星级记录（starCount >= 1）判定为 cleared；
 * 2. 根节点（在章内无前置依赖，如第一关）无条件 unlocked；
 * 3. 分支节点：只要该关卡在章内对应的前置节点中有至少一个已被通关（cleared），即解锁该分支；
 * 4. 如果是 customUnlockedLevelIds 包含的关卡，也判定为 unlocked。
 */
function calculateChapterLevelGraph(chapter, state = {}) {
  const levels = chapter.levels || [];
  const records = state?.levelRecords || {};
  const customUnlocked = new Set(state?.unlockedLevelIds || []);
  const clearedSet = new Set(Object.keys(records).filter((id) => (records[id]?.starCount || 0) >= 1));

  // 映射 moduleId -> levelId
  const moduleToLevel = new Map();
  levels.forEach((l) => moduleToLevel.set(l.moduleId, l.levelId));

  return levels.map((level, index) => {
    const topo = getModuleTopology(level.moduleId, chapter.chapterId);
    const strand = getStrand(topo.strand);
    const isCleared = clearedSet.has(level.levelId);
    const record = records[level.levelId];
    const starCount = record?.starCount || 0;

    // 解析章内的前置 levelId 列表
    const internalPrereqLevelIds = (topo.prerequisiteIds || [])
      .map((modId) => moduleToLevel.get(modId))
      .filter((id) => Boolean(id) && id !== level.levelId);

    // 解锁规则：首关根节点、或外部自定义解锁列表、或前置依赖中任一已通关、或自由练习模式开启
    const isFreePractice = state?.freePractice === true;
    const isRoot = index === 0 || internalPrereqLevelIds.length === 0;
    const isPrereqSatisfied = isRoot || internalPrereqLevelIds.some((pId) => clearedSet.has(pId));
    const isUnlocked = isFreePractice || customUnlocked.has(level.levelId) || isPrereqSatisfied;

    // 当前关卡状态
    let status = "locked";
    if (isCleared) {
      status = starCount === 3 ? "full-star" : "cleared";
    } else if (isUnlocked) {
      status = "available";
    }

    return {
      levelId: level.levelId,
      moduleId: level.moduleId,
      title: level.title || `第 ${index + 1} 关`,
      index,
      levelNumber: index + 1,
      strand,
      topo,
      isRoot,
      isUnlocked,
      isCleared,
      starCount,
      status,
      internalPrereqLevelIds,
      learningBridge: topo.learningBridge,
      engineeringAffinity: topo.engineeringAffinity
    };
  });
}

const KnowledgeTopologyAdapter = {
  STRANDS,
  MODULE_TOPOLOGY,
  getModuleTopology,
  getStrand,
  getAllStrands,
  calculateChapterLevelGraph
};

if (typeof globalThis !== "undefined") {
  globalThis.KnowledgeTopologyAdapter = KnowledgeTopologyAdapter;
}

export default KnowledgeTopologyAdapter;
