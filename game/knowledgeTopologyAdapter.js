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
      methodSummary: { label: "假设置换与差量补偿", description: "假设全部为某一对象，计算与现实的整体差额，通过单只差额反推真实数量" },
      transferTargets: [{ topicId: "logic", reason: "假设-检验反推" }, { topicId: "engineering", reason: "多工种混合效率配平" }]
    },
    engineeringAffinity: {
      subsystem: "载荷配重与升阻比平衡解算系统",
      algorithmRole: "回波残差假设推导与双自由度气动控制状态空间消元求解"
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
      transferTargets: [{ topicId: "factors-multiples", reason: "深入因数倍数与短除法" }, { topicId: "logic", reason: "构建数论反证法" }]
    },
    engineeringAffinity: {
      subsystem: "万米水声扩频抗干扰通信",
      algorithmRole: "水下低频通信奇偶校验纠错：在海流噪声干扰中利用奇偶校验码快速纠正误码"
    }
  },
    // ====== 第3章：轨道科学计划 · 天宫空间站轨道科学实验舱 ======
    "factors-multiples": {
      strand: "observation",
      prerequisiteIds: ["parity-divisibility"],
      learningBridge: {
        prerequisiteSummary: "已掌握自然数整除规律与质数、合数概念",
        methodSummary: { label: "阶梯短除法", description: "用公质因数阶梯试除，商互质时左竖列得最大公因数(GCD)，L型回路得最小公倍数(LCM)" },
        transferTargets: [{ topicId: "prime-factorization", reason: "合数唯一分解定理" }, { topicId: "periodicity", reason: "公倍周期与同余规律" }]
      },
      engineeringAffinity: {
        subsystem: "空间站椭圆轨道交会对接控制",
        algorithmRole: "双星运行公倍周期相位共振：计算追赶飞行器与目标空间站公转周期的最小公倍数，实现微重力无冲量精准交会"
      }
    },
    "ratio-proportion": {
      strand: "quantity",
      prerequisiteIds: ["factors-multiples", "unit-rate"],
      learningBridge: {
        prerequisiteSummary: "熟练掌握份数模型与公因数约分化简",
        methodSummary: { label: "比例与份数", description: "抓住比例前项后项比值恒定，外项积等于内项积，设每份为 k 进行统一放缩" },
        transferTargets: [{ topicId: "fraction-modeling", reason: "比例向分数应用题迁移" }, { topicId: "scale", reason: "平面比例尺二维缩放" }]
      },
      engineeringAffinity: {
        subsystem: "姿态轨道控制喷气配比",
        algorithmRole: "推进剂氧化剂双组元质量流率比例控制：按化学计量比精准调配推进剂，消除燃烧不稳定诱发震荡"
      }
    },
    "pigeonhole-intro": {
      strand: "counting",
      prerequisiteIds: ["factors-multiples", "enumeration"],
      learningBridge: {
        prerequisiteSummary: "理解分类计数与整除均分，能进行余数定位",
        methodSummary: { label: "抽屉原则启蒙", description: "物体数大于抽屉数时至少有一抽屉放2个；商加一原则保证最极端情况必有重叠" },
        transferTargets: [{ topicId: "case-analysis-intro", reason: "确定性存在性分类证明" }, { topicId: "worst-case", reason: "最不利极值策略" }]
      },
      engineeringAffinity: {
        subsystem: "高并发遥测通信时隙分配",
        algorithmRole: "无碰撞信道时隙调度：利用抽屉碰撞理论证明传感器数据包在突发脉冲下的防丢包信道备份容量"
      }
    },
    "recurrence-intro": {
      strand: "observation",
      prerequisiteIds: ["factors-multiples", "patterns", "arithmetic-series"],
      learningBridge: {
        prerequisiteSummary: "具备数列规律观察与前后项差值提取能力",
        methodSummary: { label: "递推与迭代", description: "从前一项或前两项状态推出当前项，建立由小到大的递推状态转移链" },
        transferTargets: [{ topicId: "square-array", reason: "递推公式与图形方阵结合" }, { topicId: "recurrence-strategy", reason: "多周期动态规划递推" }]
      },
      engineeringAffinity: {
        subsystem: "太阳翼多级自锁展开机构",
        algorithmRole: "多连杆级联展开状态递推机：逐级监控帆板铰链解锁角度递推序列，确保微重力展开姿态平稳"
      }
    },
    "plan-design": {
      strand: "logic",
      prerequisiteIds: ["ratio-proportion", "unit-rate"],
      learningBridge: {
        prerequisiteSummary: "理解单位消耗、限制条件与目标优化要求",
        methodSummary: { label: "多方案比选", description: "列出所有可行方案的成本与收益，对比临界转折点选择综合最优策略" },
        transferTargets: [{ topicId: "work-problems", reason: "多工序统筹优化" }, { topicId: "optimization", reason: "多目标规划极值" }]
      },
      engineeringAffinity: {
        subsystem: "航天员出舱活动消耗品统筹",
        algorithmRole: "生保耗材多约束方案决策：在有限储氧量与冷却水余量约束下，比选出舱检修路径最高效率方案"
      }
    },
    "square-array": {
      strand: "space-discrete",
      prerequisiteIds: ["recurrence-intro", "patterns"],
      learningBridge: {
        prerequisiteSummary: "掌握正方形四边对称性与等差数列求和",
        methodSummary: { label: "方阵层数模型", description: "实心方阵总数=边长×边长；每向外扩展一层增加 4×边长-4，抓住角块重叠" },
        transferTargets: [{ topicId: "geometry", reason: "多层网格图形剖分" }, { topicId: "composite-figures", reason: "正方形阵列割补" }]
      },
      engineeringAffinity: {
        subsystem: "空间冷原子钟光学势阱阵列",
        algorithmRole: "双向激光驻波方阵干涉：生成二维微米级正方阵势阱超高精度囚禁铷原子，实现千万年不差一秒"
      }
    },
    "tiered-pricing": {
      strand: "quantity",
      prerequisiteIds: ["ratio-proportion", "unit-rate", "sum-diff"],
      learningBridge: {
        prerequisiteSummary: "掌握基础乘除与区间划分意识",
        methodSummary: { label: "分段计费拆解", description: "找到计费断点分段计算，每段内应用各自单价，切忌将整体直接套用高阶单价" },
        transferTargets: [{ topicId: "linear-equations", reason: "分段折线函数与方程求解" }]
      },
      engineeringAffinity: {
        subsystem: "星上储能梯级深度放电控制",
        algorithmRole: "锂电池健康度分段能量调度：在阳光区与地影区根据电量百分比阶梯分级调节放电电流倍率"
      }
    },
    "prime-factorization": {
      strand: "observation",
      prerequisiteIds: ["factors-multiples"],
      learningBridge: {
        prerequisiteSummary: "熟练掌握短除法连续试除与提取公因数",
        methodSummary: { label: "质因数解构", description: "将自然数唯一拆解为质数的标准幂乘积形式，把握数的微观基因构成" },
        transferTargets: [{ topicId: "factor-count", reason: "指数加一连乘求因数个数定理" }, { topicId: "logic", reason: "数论不可逆散列与公钥加密" }]
      },
      engineeringAffinity: {
        subsystem: "空间科学实验数据密码网关",
        algorithmRole: "大质数分解单向陷门函数：基于大整数质因数分解单向计算复杂度，保护载荷下行机密数据"
      }
    },
    "case-analysis-intro": {
      strand: "logic",
      prerequisiteIds: ["pigeonhole-intro", "logic"],
      learningBridge: {
        prerequisiteSummary: "能识别不同边界条件引发的结论差异",
        methodSummary: { label: "分类讨论基准", description: "确立不重不漏的划分标准，将大问题拆分为若干子情形逐一论证后综合汇总" },
        transferTargets: [{ topicId: "restoration-problems", reason: "分支逆推与条件校验" }, { topicId: "case-discussion", reason: "高阶分类讨论与不变量" }]
      },
      engineeringAffinity: {
        subsystem: "自主交会对接多传感器故障仲裁",
        algorithmRole: "激光雷达与微波雷达分级分类决策：按不同距离区间分类切换制导敏感器工作模式"
      }
    },
    "work-problems": {
      strand: "change",
      prerequisiteIds: ["plan-design", "unit-rate"],
      learningBridge: {
        prerequisiteSummary: "熟练掌握单位效率概念，能将工作总量设为 1",
        methodSummary: { label: "工程协同效率", description: "总工作量=效率×时间；多人多机合作时总效率为各自工效之和，分步逐段扣减" },
        transferTargets: [{ topicId: "efficiency-transfer", reason: "复杂多源动态变率" }, { topicId: "rational-equations", reason: "分母含未知数的分式方程" }]
      },
      engineeringAffinity: {
        subsystem: "微重力冷凝水回收集成系统",
        algorithmRole: "多级电解制氧与水汽冷凝协同速率配平：确保三名航天员舱内氧水动态平衡率恒等于 1"
      }
    },
    "unitary-method": {
      strand: "quantity",
      prerequisiteIds: ["tiered-pricing", "unit-rate"],
      learningBridge: {
        prerequisiteSummary: "掌握归一思想，明确单一量作为放缩比例尺",
        methodSummary: { label: "单位量倍比扩展", description: "正归一先求单一量再乘目标份数，反归一先求单一量再用总量除以单一量" },
        transferTargets: [{ topicId: "ratio-proportion", reason: "构建多变量比例网络" }]
      },
      engineeringAffinity: {
        subsystem: "空间实验机柜微重力配平配重",
        algorithmRole: "单位质量转动惯量微调：按单位质量力矩梯度微调配重块位置，维持核心舱主惯性轴稳定"
      }
    },
    "restoration-problems": {
      strand: "quantity",
      prerequisiteIds: ["work-problems", "case-analysis-intro", "sum-diff"],
      learningBridge: {
        prerequisiteSummary: "深刻理解加减乘除互为逆运算的数学本质",
        methodSummary: { label: "倒推逆向还原", description: "从最终结果出发逆向倒推，加变减、减变加、乘变除、除变乘，逐层知果索因" },
        transferTargets: [{ topicId: "linear-elimination", reason: "逆向还原公理化为方程组消元" }, { topicId: "reverse-thinking", reason: "全链路逆向反思体系" }]
      },
      engineeringAffinity: {
        subsystem: "神舟飞船返回舱黑障段弹道反演",
        algorithmRole: "等离子体黑障区外推轨迹反向溯源：依据出黑障瞬间残余信标逆向反演再入角与落点走廊"
      }
    },

    // ====== 第4章：极地破冰远征 · 雪龙2号双向破冰极地科考船 ======
    angles: {
      strand: "space-discrete",
      prerequisiteIds: ["geometry"],
      learningBridge: {
        prerequisiteSummary: "具备旋转与直线相交的方向认知",
        methodSummary: { label: "方位与量角", description: "理解对顶角相等、平角180度、周角360度，利用方位角确定极区导航航向" },
        transferTargets: [{ topicId: "triangles", reason: "三角形内角和定理" }]
      },
      engineeringAffinity: {
        subsystem: "声纳探冰多波束开角校准",
        algorithmRole: "前视探冰声纳扇形波束扫描夹角解算：动态调整发射角精准测算前方陆缘冰厚度"
      }
    },
    triangles: {
      strand: "space-discrete",
      prerequisiteIds: ["angles"],
      learningBridge: {
        prerequisiteSummary: "掌握基本角度计算与几何图形闭合性",
        methodSummary: { label: "三角形稳定性与内角和", description: "任意两边之和大于第三边；内角和恒为180度；高与底垂直是面积的核心支撑" },
        transferTargets: [{ topicId: "quadrilaterals", reason: "四边形三角剖分" }, { topicId: "pythagoras-trig", reason: "直角三角形勾股弦图" }]
      },
      engineeringAffinity: {
        subsystem: "双向破冰船首三向破冰受力分解",
        algorithmRole: "船艏倾角正交矢量分解：利用三角形正弦定理将纵向推进推力分解为垂直破冰下压力"
      }
    },
    quadrilaterals: {
      strand: "space-discrete",
      prerequisiteIds: ["triangles"],
      learningBridge: {
        prerequisiteSummary: "掌握三角形性质与对边平行特征",
        methodSummary: { label: "多边形对角线剖分", description: "梯形只有一组对边平行，平行四边形两组对边平行，对角线将四边形拆为全等或同高三角形" },
        transferTargets: [{ topicId: "perimeter", reason: "四边形封闭周长" }, { topicId: "area", reason: "割补推导平行四边形面积" }]
      },
      engineeringAffinity: {
        subsystem: "高强韧极地耐低温装甲钢板拼焊结构",
        algorithmRole: "四边形箱型受力龙骨抗弯刚度优化：抵御多方向密集冰脊剧烈挤压力矩"
      }
    },
    perimeter: {
      strand: "space-discrete",
      prerequisiteIds: ["quadrilaterals", "geometry"],
      learningBridge: {
        prerequisiteSummary: "明确周长是封闭图形一周边界线段长度的总和",
        methodSummary: { label: "平移巧算周长", description: "凹凸不规则图形通过线段平移转化为规则长方形，凹陷处补齐多出竖向段" },
        transferTargets: [{ topicId: "area", reason: "周长与面积的守恒与变异" }]
      },
      engineeringAffinity: {
        subsystem: "全船电伴热循环管路沿程布设",
        algorithmRole: "防结冰热油回路总周长热损耗测算：最小化管路周长以降低极夜热传导散失"
      }
    },
    area: {
      strand: "space-discrete",
      prerequisiteIds: ["perimeter"],
      learningBridge: {
        prerequisiteSummary: "分清周长（一维长度）与面积（二维网格铺满）的本质差异",
        methodSummary: { label: "等积割补推导", description: "平行四边形底乘高，三角形底乘高除以2，梯形(上底+下底)×高÷2，抓住出入相友本质" },
        transferTargets: [{ topicId: "composite-figures", reason: "复杂组合图形割补拆拼" }]
      },
      engineeringAffinity: {
        subsystem: "船艏冰刀瞬时破碎压强监测",
        algorithmRole: "破冰接触面接触面积微元积分：根据冰压传感器阵列反推瞬时冲击破冰功率"
      }
    },
    "composite-figures": {
      strand: "space-discrete",
      prerequisiteIds: ["area"],
      learningBridge: {
        prerequisiteSummary: "熟练运用基本图形面积公式",
        methodSummary: { label: "分割加与填补减", description: "不规则图形拆分成若干已知图形相加，或补齐成大规则图形后减去空白部分" },
        transferTargets: [{ topicId: "surface-area", reason: "平面组合升华空间表面积" }]
      },
      engineeringAffinity: {
        subsystem: "双向全回转推进器非对称水下流固耦合",
        algorithmRole: "不规则导流罩截面割补优化：通过复杂多边形割补计算消除水动力阻力死角"
      }
    },
    "area-units": {
      strand: "space-discrete",
      prerequisiteIds: ["area"],
      learningBridge: {
        prerequisiteSummary: "掌握长度单位进率，理解面积是长度的平方",
        methodSummary: { label: "平方进率百倍进位", description: "1平方米=100平方分米，1公顷=10000平方米，平方单位进率是长度进率的平方倍" },
        transferTargets: [{ topicId: "scale", reason: "地图比例尺下的面积缩放" }]
      },
      engineeringAffinity: {
        subsystem: "极地卫星遥感海冰密集度像元定标",
        algorithmRole: "遥感像元面积高精度换算：平方公里与公顷网格转换监控南极冰架崩解速率"
      }
    },
    volume: {
      strand: "space-discrete",
      prerequisiteIds: ["area"],
      learningBridge: {
        prerequisiteSummary: "从二维面积网格认知升级到三维立体空间占用",
        methodSummary: { label: "底面积乘高柱体模型", description: "长方体体积=长×宽×高=底面积×高；直柱体体积通用公式 V=Sh 统一长方体正方体圆柱" },
        transferTargets: [{ topicId: "capacity", reason: "容积单位与液体容量对应" }]
      },
      engineeringAffinity: {
        subsystem: "船体双层底破冰压载水舱容积调节",
        algorithmRole: "动态水舱体积重心压载配平：根据破冰俯仰角快速注排水调正全船稳心高度"
      }
    },
    capacity: {
      strand: "space-discrete",
      prerequisiteIds: ["volume"],
      learningBridge: {
        prerequisiteSummary: "明确体积代表物体所占外部空间，容积代表内部能容纳物质体积",
        methodSummary: { label: "升与毫升立方互化", description: "1升=1立方分米，1毫升=1立方厘米；壁厚影响内部容积，排水法测不规则物体体积" },
        transferTargets: [{ topicId: "surface-area", reason: "表面积热辐射与容积容量关系" }]
      },
      engineeringAffinity: {
        subsystem: "极端低温重油加热保温日用油舱",
        algorithmRole: "燃料舱有效容量动态防冻算法：确保零下40度环境下重油持续流动性"
      }
    },
    "surface-area": {
      strand: "space-discrete",
      prerequisiteIds: ["composite-figures", "volume"],
      learningBridge: {
        prerequisiteSummary: "掌握长方形面积与立体三维结构",
        methodSummary: { label: "六面展开与组合表面", description: "长方体表面积=2×(长宽+长高+宽高)；拼接成立体后扣除接触面的两倍面积" },
        transferTargets: [{ topicId: "cube-unfolding", reason: "正方体长方体立体展开图" }]
      },
      engineeringAffinity: {
        subsystem: "全船水上部分防辐射保温隔热喷涂",
        algorithmRole: "复杂船体外表面积精确积分：优化纳米气凝胶涂层厚度最大化阻绝冷桥热损"
      }
    },
    scale: {
      strand: "space-discrete",
      prerequisiteIds: ["area-units", "ratio-proportion"],
      learningBridge: {
        prerequisiteSummary: "熟练掌握比的概念与单位统一换算",
        methodSummary: { label: "比例尺图上实地互化", description: "图上距离:实际距离=比例尺；面积比等于长度比例尺的平方，线段比缩放前必先统一度量单位" },
        transferTargets: [{ topicId: "coordinates-routes", reason: "海图坐标系与航线航程" }]
      },
      engineeringAffinity: {
        subsystem: "极地冰情雷达图与遥感海图多源融合",
        algorithmRole: "多源比例尺异构海图无缝投影匹配：将卫星冰图按比例尺与船载雷达视场精确套合"
      }
    },
    "coordinates-routes": {
      strand: "space-discrete",
      prerequisiteIds: ["scale"],
      learningBridge: {
        prerequisiteSummary: "掌握方位角与线段实际长度量化",
        methodSummary: { label: "数对网格与路线描述", description: "用(列,行)数对定位空间坐标；描述路线需方向、距离、转角三要素完整闭环" },
        transferTargets: [{ topicId: "cartesian-plane", reason: "直角坐标系与解析几何" }, { topicId: "shortest-path", reason: "网格图最短路径规划" }]
      },
      engineeringAffinity: {
        subsystem: "北斗三号极区双模惯性导航巡航系统",
        algorithmRole: "地磁死角极区格网航线解算：在近北极点地磁漂移环境下依据格网坐标精确穿越密集冰区"
      }
    },

    // ====== 第5章：装甲突击演练 · 99A 主战坦克复合突击系统 ======
    "algebraic-expressions": {
      strand: "quantity",
      prerequisiteIds: ["sum-diff", "unitary-method"],
      learningBridge: {
        prerequisiteSummary: "具备抽象概括能力，能用符号代替具体数字",
        methodSummary: { label: "用字母表示数", description: "字母能代表任意数、特定未知数或运算律；合并同类项抓住系数相加、字母与指数不变" },
        transferTargets: [{ topicId: "equations-unknowns", reason: "代数式由等号连接形成方程" }]
      },
      engineeringAffinity: {
        subsystem: "数字火控弹道多元扰动代数模型",
        algorithmRole: "射击诸元多项式代数解算：用多元代数式表达风速、气温、药温对落点弹着点的联合影响"
      }
    },
    "equations-unknowns": {
      strand: "quantity",
      prerequisiteIds: ["algebraic-expressions"],
      learningBridge: {
        prerequisiteSummary: "理解等式的基本性质（天平平衡原理）",
        methodSummary: { label: "方程天平守恒律", description: "方程是含有未知数的等式；等式两边同加减乘除相同非零数，等式保持成立" },
        transferTargets: [{ topicId: "linear-equations", reason: "移项与去括号求解一元方程" }]
      },
      engineeringAffinity: {
        subsystem: "激光测距目标跟踪角闭环配平",
        algorithmRole: "目标动态截获参数平衡方程：求解未知初速和角速度参数，锁定击发窗口"
      }
    },
    "linear-equations": {
      strand: "quantity",
      prerequisiteIds: ["equations-unknowns"],
      learningBridge: {
        prerequisiteSummary: "熟练运用等式性质与负数加减运算法则",
        methodSummary: { label: "移项与去分母五步法", description: "去分母、去括号、移项变号、合并同类项、系数化为1，严格保持等号对齐" },
        transferTargets: [{ topicId: "equation-applications", reason: "建模列方程解复杂文字题" }, { topicId: "linear-elimination", reason: "二元方程组代入与加减消元" }]
      },
      engineeringAffinity: {
        subsystem: "主炮双向高精度电液伺服稳定器",
        algorithmRole: "双向伺服反馈线性方程求解：实时解算车体起伏时的俯仰与回转角闭环修正量"
      }
    },
    "equation-applications": {
      strand: "quantity",
      prerequisiteIds: ["linear-equations"],
      learningBridge: {
        prerequisiteSummary: "掌握审题抓等量关系的能力",
        methodSummary: { label: "设元与等量守恒", description: "找准核心不变量建立等式；直接设未知数或间接设中间量，解出后务必带回原题检验" },
        transferTargets: [{ topicId: "linear-elimination", reason: "多元系统联立方程组" }]
      },
      engineeringAffinity: {
        subsystem: "行进间射击动态超前瞄准角解算",
        algorithmRole: "车速与目标速方程联立：联立车体速度矢量与目标机动方程，最大化首发命中概率"
      }
    },
    "fraction-modeling": {
      strand: "quantity",
      prerequisiteIds: ["ratio-proportion"],
      learningBridge: {
        prerequisiteSummary: "理解单位 1 与平均分的含义",
        methodSummary: { label: "分率与具体量分离", description: "抓准单位 1 对应量；求一个数的几分之几用乘法，已知一部分求单位 1 用除法" },
        transferTargets: [{ topicId: "decimal-modeling", reason: "分数与小数通分互化" }]
      },
      engineeringAffinity: {
        subsystem: "多层复合装甲质量通分优化",
        algorithmRole: "陶瓷与高硬度装甲钢分母通分：优化总面密度实现防弹效能质量比最优"
      }
    },
    "decimal-modeling": {
      strand: "quantity",
      prerequisiteIds: ["fraction-modeling"],
      learningBridge: {
        prerequisiteSummary: "掌握小数位值原则与十进制记数法",
        methodSummary: { label: "小数精确保留与运算", description: "加减对齐小数点，乘法看因数小数位数总和，除法移动除数小数点化为整数除法" },
        transferTargets: [{ topicId: "percent-basics", reason: "小数百倍化为百分数" }]
      },
      engineeringAffinity: {
        subsystem: "尾翼稳定脱壳穿甲弹钨合金弹芯动平衡",
        algorithmRole: "微米级同心度浮点解算：浮点数误差控制在微米级以保证十倍音速飞行稳定性"
      }
    },
    "percent-basics": {
      strand: "quantity",
      prerequisiteIds: ["decimal-modeling"],
      learningBridge: {
        prerequisiteSummary: "明确百分数代表两个数的比率，不带单位名称",
        methodSummary: { label: "基准百分率转化", description: "部分量÷总量=百分率；增长率=(现值-原值)÷原值，分清分母基准量是原值还是现值" },
        transferTargets: [{ topicId: "discount-tax", reason: "折扣成数与税率应用" }]
      },
      engineeringAffinity: {
        subsystem: "1500马力大功率柴油机增压效率监测",
        algorithmRole: "高原进气增压效率百分比动态补偿：实时调节进气压力抵御高原缺氧动力衰减"
      }
    },
    "discount-tax": {
      strand: "quantity",
      prerequisiteIds: ["percent-basics"],
      learningBridge: {
        prerequisiteSummary: "理解几折代表百分之几十，成数代表十分之几",
        methodSummary: { label: "现价原价折扣链", description: "现价=原价×折扣；税后价=含税基准×(1+税率)，多重折扣连乘计算" },
        transferTargets: [{ topicId: "profit-loss-modeling", reason: "成本售价利润全链模型" }]
      },
      engineeringAffinity: {
        subsystem: "全天候重装越野机动燃油折减评估",
        algorithmRole: "战场复杂地形耗油折减系数计算：依据泥泞、沙漠系数评估作战纵深极限"
      }
    },
    "profit-loss-modeling": {
      strand: "quantity",
      prerequisiteIds: ["discount-tax", "surplus-deficit"],
      learningBridge: {
        prerequisiteSummary: "分清成本、定价、售价、利润与利润率",
        methodSummary: { label: "商业利润方程链", description: "利润=售价-成本；利润率=利润÷成本；降价打折时利润率往往急剧非线性下降" },
        transferTargets: [{ topicId: "supply-integration", reason: "战时资源统筹综合运筹" }]
      },
      engineeringAffinity: {
        subsystem: "野战抢修快速备件周转库存模型",
        algorithmRole: "备件储备盈亏冗余最优化：权衡备件占用质量与抢修快速复活率最优权衡"
      }
    },
    "concentration-configuration": {
      strand: "quantity",
      prerequisiteIds: ["fraction-modeling", "percent-basics"],
      learningBridge: {
        prerequisiteSummary: "抓住溶质质量在加水加盐过程中的守恒特征",
        methodSummary: { label: "溶质守恒与十字交叉法", description: "溶液×浓度=溶质；加水溶质不变，混合溶液用十字交叉法快速求得两种溶液质量比" },
        transferTargets: [{ topicId: "supply-integration", reason: "多元化学洗消与物资混合" }]
      },
      engineeringAffinity: {
        subsystem: "超强抗核化生三防洗消液调配",
        algorithmRole: "洗消剂浓度十字交叉快速配比：根据染毒等级毫秒级调配有效活性成分浓度"
      }
    },
    "savings-interest": {
      strand: "quantity",
      prerequisiteIds: ["percent-basics"],
      learningBridge: {
        prerequisiteSummary: "理解本金、利率与时间三者的乘积关系",
        methodSummary: { label: "单利与复利递增", description: "利息=本金×利率×时间；本息和=本金×(1+利率×时间)；复利是利滚利的几何级数增长" },
        transferTargets: [{ topicId: "supply-integration", reason: "动态能量累积积分" }]
      },
      engineeringAffinity: {
        subsystem: "高能主动电磁防护超级电容充放电",
        algorithmRole: "瞬态电荷复利积累放电曲线解算：毫秒内聚积兆瓦级电磁脉冲防御破甲弹射流"
      }
    },
    "supply-integration": {
      strand: "quantity",
      prerequisiteIds: ["profit-loss-modeling", "concentration-configuration"],
      learningBridge: {
        prerequisiteSummary: "融通代数方程、百分数与统筹规划工具",
        methodSummary: { label: "多元资源平衡求解", description: "设多个未知数建立方程组，按消耗瓶颈统筹油料、弹药与补给，求综合最大续航" },
        transferTargets: [{ topicId: "linear-elimination", reason: "多元线性消元算法" }]
      },
      engineeringAffinity: {
        subsystem: "重装合成装甲营伴随保障推演",
        algorithmRole: "多源补给联调协同运筹：联立三元消耗方程组，保障装甲集群全天候闪击突贯"
      }
    },

    // ====== 第6章：星海数据与概率远征 · 墨子号量子科学实验卫星 ======
    "data-collection": {
      strand: "observation",
      prerequisiteIds: ["patterns"],
      learningBridge: {
        prerequisiteSummary: "具备细致观察与信息收集归类意识",
        methodSummary: { label: "数据收集与正字法", description: "明确调查对象与目标属性，用正字法在表格中不重不漏完成现场抽样统计" },
        transferTargets: [{ topicId: "frequency-tables", reason: "原始计数整理为频数分布" }]
      },
      engineeringAffinity: {
        subsystem: "单光子微弱信号空间采样器",
        algorithmRole: "宇宙背景噪声滤除采样算法：在亿万光子中记录并甄别单光子到达时间戳"
      }
    },
    "frequency-tables": {
      strand: "observation",
      prerequisiteIds: ["data-collection"],
      learningBridge: {
        prerequisiteSummary: "掌握原始数据的分类计数整理",
        methodSummary: { label: "频数与频率分布", description: "确定组数与组距，统计落入各区间的频数，计算各组频率占总体的百分比" },
        transferTargets: [{ topicId: "bar-charts", reason: "频数表格转化为直观图表" }]
      },
      engineeringAffinity: {
        subsystem: "地星纠缠光子保真度统计分析",
        algorithmRole: "量子纠缠信道保真度频数分级：评估大气湍流下的信道质量分布"
      }
    },
    "bar-charts": {
      strand: "observation",
      prerequisiteIds: ["frequency-tables"],
      learningBridge: {
        prerequisiteSummary: "理解直角坐标系中的长条高度与数量对应关系",
        methodSummary: { label: "条形统计图对比", description: "条形图直观反映不同类别数量的多少，单式对比绝对数量，复式两两并列找差距" },
        transferTargets: [{ topicId: "line-charts", reason: "离散条形演进为连续趋势折线" }]
      },
      engineeringAffinity: {
        subsystem: "全国五大地面接收站信号对比",
        algorithmRole: "地面站直方图多维对比：比较各观测站单光子接收计数率，动态分配接收权重"
      }
    },
    "line-charts": {
      strand: "observation",
      prerequisiteIds: ["bar-charts"],
      learningBridge: {
        prerequisiteSummary: "理解时间推移引起的数据连续变化",
        methodSummary: { label: "折线统计图趋势", description: "点代表数量，线段斜率代表增减变化快慢，复式折线对比两组变量发展趋势" },
        transferTargets: [{ topicId: "mean", reason: "折线波动中寻找集中趋势平均数" }]
      },
      engineeringAffinity: {
        subsystem: "过境仰角与接收误码率关联分析",
        algorithmRole: "动态通信窗口趋势连续拟合：根据仰角折线变化预测最佳秘钥下行时段"
      }
    },
    mean: {
      strand: "change",
      prerequisiteIds: ["line-charts", "average"],
      learningBridge: {
        prerequisiteSummary: "掌握移多补少与总量除以总份数",
        methodSummary: { label: "算术平均数代表性", description: "平均数反映一组数据的平均水平；极值会对平均数造成强烈拉动，需警惕虚高假象" },
        transferTargets: [{ topicId: "median-mode", reason: "抗极端值中位数与众数" }]
      },
      engineeringAffinity: {
        subsystem: "纳秒级空间原子光钟测距滤波",
        algorithmRole: "平均授时残差滑动均值平滑：消除多普勒效应与引力红移残差"
      }
    },
    "median-mode": {
      strand: "change",
      prerequisiteIds: ["mean"],
      learningBridge: {
        prerequisiteSummary: "理解数据排序与频数最高项特征",
        methodSummary: { label: "中位数与众数鲁棒性", description: "数据按大小排列，中间位置为中位数（抗离群值）；出现次数最多为众数（反映集中偏好）" },
        transferTargets: [{ topicId: "data-range", reason: "集中趋势与离散度指标配合" }]
      },
      engineeringAffinity: {
        subsystem: "激光雷达回波信号抗噪判决",
        algorithmRole: "中位数滤波抗强噪声干扰：剔除空间杂散光突变奇异值，保留真实中位回波"
      }
    },
    "data-range": {
      strand: "change",
      prerequisiteIds: ["median-mode"],
      learningBridge: {
        prerequisiteSummary: "掌握最大值与最小值的概念",
        methodSummary: { label: "极差与离散度", description: "极差=最大值-最小值，衡量数据波动幅度；极差越小数据越稳定集中，越大越发散" },
        transferTargets: [{ topicId: "possibility-basics", reason: "数据离散范围推导随机概率" }]
      },
      engineeringAffinity: {
        subsystem: "微弧度精跟踪机构指向误差控制",
        algorithmRole: "压电陶瓷微反光镜摆角极差约束：将光斑漂移极差锁定在微弧度衍射极限内"
      }
    },
    "possibility-basics": {
      strand: "logic",
      prerequisiteIds: ["data-range"],
      learningBridge: {
        prerequisiteSummary: "区分确定性事件与不确定性随机事件",
        methodSummary: { label: "定性可能性度量", description: "事件分为必然发生、不可能发生和可能发生；可能性有大小之分，与所占样本空间比例正相关" },
        transferTargets: [{ topicId: "probability-fractions", reason: "定性描述向量化为分数概率" }]
      },
      engineeringAffinity: {
        subsystem: "量子秘钥窃听告警状态机",
        algorithmRole: "信道窃听存在性判决逻辑：依据量子误码率阈值定性判定是否存在第三方窃听"
      }
    },
    "probability-fractions": {
      strand: "counting",
      prerequisiteIds: ["possibility-basics", "fraction-modeling"],
      learningBridge: {
        prerequisiteSummary: "熟练运用分数表达部分占整体的比例",
        methodSummary: { label: "古典概型分数化", description: "概率 P=事件包含的结果数÷所有等可能结果总数；概率值恒在 0 到 1 之间" },
        transferTargets: [{ topicId: "tree-counting", reason: "树状图求解多阶段复合概率" }]
      },
      engineeringAffinity: {
        subsystem: "物理量子真随机数发生器检验",
        algorithmRole: "单光子分束器真随机性统计检验：验证光子透射与反射概率严格收敛于 1/2"
      }
    },
    "tree-counting": {
      strand: "counting",
      prerequisiteIds: ["probability-fractions", "add-multiply-principle"],
      learningBridge: {
        prerequisiteSummary: "掌握乘法原理分步相乘与树状展开",
        methodSummary: { label: "树状图与网格概率", description: "一步一分叉画出树状图，树枝末端为样本点，同支乘法连乘、异支加法相加求总概率" },
        transferTargets: [{ topicId: "data-inference", reason: "多步条件概率与贝叶斯推断" }]
      },
      engineeringAffinity: {
        subsystem: "多级星敏感器星图匹配识别树",
        algorithmRole: "视场恒星自适应捕获概率决策树：多阶段分支统计匹配概率，完成快速自主定姿"
      }
    },
    "data-inference": {
      strand: "logic",
      prerequisiteIds: ["tree-counting"],
      learningBridge: {
        prerequisiteSummary: "能够从样本统计特征推断总体规律",
        methodSummary: { label: "统计推断与置信度", description: "用样本平均数估计总体平均数，用样本百分比估计总体概率，强调样本随机代表性" },
        transferTargets: [{ topicId: "statistics-probability-boss", reason: "综合概率与统计建模决战" }]
      },
      engineeringAffinity: {
        subsystem: "全天候空间链路通断概率预测",
        algorithmRole: "基于气象样本反推星地链路接通率：在云雾边界以高置信度抓取极限通信窗口"
      }
    },
    "statistics-probability-boss": {
      strand: "logic",
      prerequisiteIds: ["data-inference"],
      learningBridge: {
        prerequisiteSummary: "融通统计图表、集中趋势指标与古典概型",
        methodSummary: { label: "统计与概率综合决策", description: "在不确定性情境下综合多维数据分布，权衡收益与风险方差，做出数学期望最大化决策" },
        transferTargets: [{ topicId: "integrated-strategy", reason: "不确定性博弈最优策略" }]
      },
      engineeringAffinity: {
        subsystem: "千公里量子保密通信全网鲁棒拓扑",
        algorithmRole: "全网链路高可用性综合决策闭环：统筹星地链路与量子中继节点，实现全局鲁棒"
      }
    },

    // ====== 第7章：思维工具工坊 · 祝融号火星漫游车探索系统 ======
    "read-conditions": {
      strand: "logic",
      prerequisiteIds: ["logic"],
      learningBridge: {
        prerequisiteSummary: "具备细致审题习惯与提炼信息能力",
        methodSummary: { label: "条件结构化提炼", description: "圈出已知量、隐含条件与所求问题，区分有用条件与干扰噪声，用数学符号重新表述" },
        transferTargets: [{ topicId: "draw-bar-model", reason: "文字条件转化为线段模型" }]
      },
      engineeringAffinity: {
        subsystem: "火星地表光谱数据要素解构",
        algorithmRole: "多光谱遥测关键信息提取：从海量噪声反射率中剥离火星水冰矿物特征判据"
      }
    },
    "draw-bar-model": {
      strand: "quantity",
      prerequisiteIds: ["read-conditions", "sum-diff"],
      learningBridge: {
        prerequisiteSummary: "掌握长短线段对比与份数对应",
        methodSummary: { label: "线段图关系建模", description: "以较小量为标准画线段，将相差、倍数和总数标注在图上，把抽象文字变成直观图形" },
        transferTargets: [{ topicId: "diagram-model", reason: "一维线段升华为全域几何拓扑图" }]
      },
      engineeringAffinity: {
        subsystem: "火星车左右履带沙地行进力矩平衡",
        algorithmRole: "履带电机功率分配线段模型：根据两侧沙地沉陷阻力差量实时配比驱动转矩"
      }
    },
    "diagram-model": {
      strand: "space-discrete",
      prerequisiteIds: ["draw-bar-model"],
      learningBridge: {
        prerequisiteSummary: "具备空间方位感与几何图形草图绘制能力",
        methodSummary: { label: "示意图拓扑建模", description: "将行程路线、几何位置或集合重叠画成拓扑简图，标明起点方向与关键节点" },
        transferTargets: [{ topicId: "table-method", reason: "空间示意图数据矩阵化" }]
      },
      engineeringAffinity: {
        subsystem: "火星乌托邦平原立体障碍物拓扑图",
        algorithmRole: "双目立体视觉几何拓扑绘制：自动重构岩石、沙坑危险度空间拓扑网络"
      }
    },
    "table-method": {
      strand: "logic",
      prerequisiteIds: ["diagram-model"],
      learningBridge: {
        prerequisiteSummary: "理解二维表格行与列的交叉对应逻辑",
        methodSummary: { label: "表格矩阵对比", description: "多变量复杂问题按项目列出二维表，填入已知逐步推算未知，利用行和列守恒自检" },
        transferTargets: [{ topicId: "enumeration-method", reason: "表格辅助多维度有序枚举" }]
      },
      engineeringAffinity: {
        subsystem: "火星极端昼夜温差热控平衡矩阵",
        algorithmRole: "火星日照辐射与温度交变真值表：根据昼夜温差调度相变潜热蓄热流体循环"
      }
    },
    "enumeration-method": {
      strand: "counting",
      prerequisiteIds: ["table-method", "enumeration"],
      learningBridge: {
        prerequisiteSummary: "掌握无遗漏的枚举分类原则",
        methodSummary: { label: "定向有序穷举", description: "固定首项或最大项，按从小到大或特定维度推进，借助筛选条件剔除不合理情形" },
        transferTargets: [{ topicId: "tree-diagram", reason: "枚举升级为树状分支图" }]
      },
      engineeringAffinity: {
        subsystem: "火星漫游车前向自主避障步态穷举",
        algorithmRole: "六轮独立转向越障可行步态穷举：无遗漏枚举复杂岩石地形下的越障轮系组合"
      }
    },
    "tree-diagram": {
      strand: "counting",
      prerequisiteIds: ["enumeration-method", "add-multiply-principle"],
      learningBridge: {
        prerequisiteSummary: "分清分步递进与分类并列的关系",
        methodSummary: { label: "树状分步图谱", description: "从根节点出发逐级生长分支，树枝展示选择路径，树叶即最终可能，直观查重防漏" },
        transferTargets: [{ topicId: "assumption-method", reason: "分支树上设定极端假设" }]
      },
      engineeringAffinity: {
        subsystem: "火星地质采样机械臂动作规划树",
        algorithmRole: "机械臂关节运动避碰决策树：分支规划采样末端动作，避免扬尘污染光学镜头"
      }
    },
    "assumption-method": {
      strand: "quantity",
      prerequisiteIds: ["tree-diagram", "chicken-rabbit"],
      learningBridge: {
        prerequisiteSummary: "深刻理解单体差量累加导致的总量漂移",
        methodSummary: { label: "极值假设置换", description: "先假设全部为单一类型，算出假设与事实的差距，用两对象单体差值除出真实个数" },
        transferTargets: [{ topicId: "reverse-thinking", reason: "假设置换与逆向倒推融合" }]
      },
      engineeringAffinity: {
        subsystem: "次表层探测雷达地下介电常数反演",
        algorithmRole: "雷达回波层状介质假设推算：假设为均匀冰水混合层反向验证雷达脉冲时延"
      }
    },
    "reverse-thinking": {
      strand: "logic",
      prerequisiteIds: ["assumption-method"],
      learningBridge: {
        prerequisiteSummary: "理解正向顺推与逆向反求的互逆闭环",
        methodSummary: { label: "反向倒推破局", description: "正难则反，从结局状态反向推演第一步；或反设结论不成立导出矛盾证明必然性" },
        transferTargets: [{ topicId: "transformation-method", reason: "逆向探究升级为等价转化" }]
      },
      engineeringAffinity: {
        subsystem: "沙尘暴极端低功耗休眠自主唤醒",
        algorithmRole: "火星车休眠自救逆向唤醒逻辑：依据太阳能电量阈值逆向倒推除尘天线展开时机"
      }
    },
    "transformation-method": {
      strand: "space-discrete",
      prerequisiteIds: ["reverse-thinking", "geometry"],
      learningBridge: {
        prerequisiteSummary: "理解出入相友、等积平移与等量替换",
        methodSummary: { label: "等价转化降维", description: "将生疏复杂问题转化为熟悉经典模型；图形割补变规则、复杂方程换元变简单一次式" },
        transferTargets: [{ topicId: "unit-method", reason: "复杂形变归结为量化基准" }]
      },
      engineeringAffinity: {
        subsystem: "主动悬架升降等效质心变换",
        algorithmRole: "悬架蠕动爬行等效平移转化：将六轮摇臂台车动力学等价转化为平滑单质点模型"
      }
    },
    "unit-method": {
      strand: "quantity",
      prerequisiteIds: ["transformation-method", "unit-rate"],
      learningBridge: {
        prerequisiteSummary: "掌握以基准 1 为核心的放缩思维",
        methodSummary: { label: "基准化一法", description: "寻找不随变化改变的单位基准，将所有其他变量用该基准的倍数表达，统一化简" },
        transferTargets: [{ topicId: "estimation-method", reason: "单位基准推算极限量程" }]
      },
      engineeringAffinity: {
        subsystem: "火星日米级巡航单位能耗基准",
        algorithmRole: "百米机动能耗定额调度：设定每米移动耗电瓦时为标准单位量动态调度动力电池"
      }
    },
    "estimation-method": {
      strand: "logic",
      prerequisiteIds: ["unit-method"],
      learningBridge: {
        prerequisiteSummary: "掌握四舍五入与数量级快速心算",
        methodSummary: { label: "上下界极值估算", description: "放大放小界定真实答案所在区间，用数量级快速排查荒谬选项，确立安全容差边界" },
        transferTargets: [{ topicId: "verify-eliminate", reason: "估算界定后排除检验" }]
      },
      engineeringAffinity: {
        subsystem: "地火超长双向通信时延窗口快速估算",
        algorithmRole: "20分钟地火时延自主窗口数量级估算：快速估算最优自适应决策生命周期"
      }
    },
    "verify-eliminate": {
      strand: "logic",
      prerequisiteIds: ["estimation-method"],
      learningBridge: {
        prerequisiteSummary: "具备严谨的答后反思与自检习惯",
        methodSummary: { label: "代入检验排除", description: "将解题结果代回题干原条件自检；寻找反例直接排除伪命题，形成逻辑闭环" },
        transferTargets: [{ topicId: "integrated-modeling", reason: "自检闭环赋能终极建模" }]
      },
      engineeringAffinity: {
        subsystem: "火星科学探测指令上行双向校验确认",
        algorithmRole: "遥控指令奇偶闭环回显校验：排除空间单粒子翻转导致的非预期执行动作"
      }
    },

    // ====== 第8章：逻辑策略指挥部 · 天问二号深空小行星巡航舰 ======
    "case-discussion": {
      strand: "logic",
      prerequisiteIds: ["logic"],
      learningBridge: {
        prerequisiteSummary: "掌握基本的分类原则与全集思维",
        methodSummary: { label: "全域完备分类", description: "按符号正负、图形位置或整除余数完备分类，保证并集为全集且交集为空集" },
        transferTargets: [{ topicId: "parity-invariant", reason: "分类挖掘守恒不变量" }]
      },
      engineeringAffinity: {
        subsystem: "小行星弱引力场附着表面工况分类",
        algorithmRole: "微重力附着着陆模式分类讨论：区分多孔碎石与致密金属表面选用不同旋打锚栓"
      }
    },
    "parity-invariant": {
      strand: "logic",
      prerequisiteIds: ["case-discussion", "parity-divisibility"],
      learningBridge: {
        prerequisiteSummary: "掌握奇偶运算性质与状态转移规则",
        methodSummary: { label: "奇偶守恒不变量", description: "连续操作中每步可能改变数量，但总和或乘积的奇偶性保持不变，用不变性裁定不可达状态" },
        transferTargets: [{ topicId: "worst-case", reason: "不变量赋能最不利极端判定" }]
      },
      engineeringAffinity: {
        subsystem: "自旋小行星表面光照相位自平衡",
        algorithmRole: "周期光度曲线奇偶对称性反演：利用自旋光度守恒律解算小行星三维旋转轴偏角"
      }
    },
    "worst-case": {
      strand: "logic",
      prerequisiteIds: ["parity-invariant", "pigeonhole-principle"],
      learningBridge: {
        prerequisiteSummary: "深刻理解抽屉原理中极端倒霉情形的兜底逻辑",
        methodSummary: { label: "最不利极端兜底", description: "先让最糟糕、最倒霉的事情全部发生完毕，再加上 1 即可百分之百保证达成目标" },
        transferTargets: [{ topicId: "recurrence-strategy", reason: "最坏情况兜底设计递推保护" }]
      },
      engineeringAffinity: {
        subsystem: "弱引力飞溅碎石微流星体被动防御",
        algorithmRole: "最不利碰撞冲量防护评估：测算极端抛射角下微流星体对探测器主相机的最大冲击"
      }
    },
    "recurrence-strategy": {
      strand: "observation",
      prerequisiteIds: ["worst-case", "recurrence-intro"],
      learningBridge: {
        prerequisiteSummary: "掌握前后状态转移与斐波那契类递推模型",
        methodSummary: { label: "多步状态机递推", description: "将复杂 n 步决策表示为前几步状态的线性组合，通过边界初值逐步推出任意高步结果" },
        transferTargets: [{ topicId: "reverse-reasoning", reason: "递推方程与逆向索因结合" }]
      },
      engineeringAffinity: {
        subsystem: "多引力助推霍曼轨道共振递推",
        algorithmRole: "行星借力飞行多周期轨道递推：计算多次飞掠地球与金星的共振轨道序列解"
      }
    },
    "reverse-reasoning": {
      strand: "logic",
      prerequisiteIds: ["recurrence-strategy", "reverse-thinking"],
      learningBridge: {
        prerequisiteSummary: "熟练运用知果索因与回溯搜索",
        methodSummary: { label: "终局逆向推演", description: "从终局必胜态或必败态倒推前置必经步骤，明确每一步的唯一逆向约束" },
        transferTargets: [{ topicId: "elimination-table", reason: "逆向线索填入真值排除表" }]
      },
      engineeringAffinity: {
        subsystem: "深空光学敏感到位目标丢失轨迹倒推",
        algorithmRole: "星空视线角速度逆向追踪寻踪：依据丢失前最后姿态帧反演小行星相对视线速度"
      }
    },
    "elimination-table": {
      strand: "logic",
      prerequisiteIds: ["reverse-reasoning"],
      learningBridge: {
        prerequisiteSummary: "具备严密的排除法与双向唯一对应逻辑",
        methodSummary: { label: "逻辑消元表格", description: "行与列交叉画勾与叉，一行一列只有且必须有一个勾，借由勾所在行列快速排除其余格" },
        transferTargets: [{ topicId: "linear-elimination", reason: "逻辑表格升华代数消元法" }]
      },
      engineeringAffinity: {
        subsystem: "深空自主巡航全天球星图识别",
        algorithmRole: "星敏感器恒星二维真值矩阵排除：快速剔除假星与杂散光，匹配高精度恒星骨架"
      }
    },
    "scheduling": {
      strand: "change",
      prerequisiteIds: ["plan-design"],
      learningBridge: {
        prerequisiteSummary: "理解工序前后依赖与并行执行时间重叠",
        methodSummary: { label: "华罗庚统筹图谱", description: "梳理紧前紧后工序，将耗时长的并行任务与短任务重叠，关键路径决定项目最短总工时" },
        transferTargets: [{ topicId: "shortest-path", reason: "时间统筹与空间最短路径结合" }]
      },
      engineeringAffinity: {
        subsystem: "小行星采样多载荷分时开机统筹",
        algorithmRole: "仪器分时峰值功耗削峰填谷调度：平衡光谱仪、激光测距与下行高功耗通信"
      }
    },
    "shortest-path": {
      strand: "space-discrete",
      prerequisiteIds: ["scheduling"],
      learningBridge: {
        prerequisiteSummary: "掌握两点之间线段最短与对称点反射原理",
        methodSummary: { label: "轴对称将军饮马与网络标号", description: "动点到两定点距离和最小做对称点连直线；网络图从起点向外逐点标出最短距离" },
        transferTargets: [{ topicId: "optimal-strategy", reason: "几何最短路径转为博弈必胜策略" }]
      },
      engineeringAffinity: {
        subsystem: "不规则小行星势阱变轨能量最优航线",
        algorithmRole: "三体摄动多引力鞍点转移航线：求解脉冲消耗最小的低能量螺旋逼近轨道"
      }
    },
    "optimal-strategy": {
      strand: "logic",
      prerequisiteIds: ["shortest-path"],
      learningBridge: {
        prerequisiteSummary: "理解双方博弈下的互相制约与先手必胜态",
        methodSummary: { label: "对称博弈与必胜态构造", description: "抢数字找余数周期同余，取棋子构造轴对称或中心对称；把必败态留给对手" },
        transferTargets: [{ topicId: "construction", reason: "博弈策略升华为构造性证明" }]
      },
      engineeringAffinity: {
        subsystem: "主反推发动机推力衰减自主容错博弈控制",
        algorithmRole: "单推力器故障下的力矩自适应博弈重分配：动态调节冷气姿控恢复姿态平稳"
      }
    },
    construction: {
      strand: "logic",
      prerequisiteIds: ["optimal-strategy"],
      learningBridge: {
        prerequisiteSummary: "从纯粹计算走向存在性与构造性数学思维",
        methodSummary: { label: "存在性构造法", description: "不仅证明存在，更亲手给出一个满足全部条件的具体实例；染色法与分组法是构造核心" },
        transferTargets: [{ topicId: "contradiction", reason: "构造反例直接完成反证法" }]
      },
      engineeringAffinity: {
        subsystem: "小行星非均匀引力场多点跳跃着陆足拓扑构造",
        algorithmRole: "不规则表面三维凸包几何构型生成：构造三足支撑几何确保着陆不发生倾覆"
      }
    },
    contradiction: {
      strand: "logic",
      prerequisiteIds: ["construction"],
      learningBridge: {
        prerequisiteSummary: "深刻理解排中律与反证法论证体系",
        methodSummary: { label: "归谬反证法", description: "假设命题不成立，沿着逻辑严密推导，最终导出与已知条件或数学定理自相矛盾的荒谬结果" },
        transferTargets: [{ topicId: "integrated-strategy", reason: "反证法融入全要素战略决策" }]
      },
      engineeringAffinity: {
        subsystem: "深空通信拜占庭容错指令一致性证明",
        algorithmRole: "分布式多机表决逻辑自洽反证：证明在偶发故障节点下主控指令仍绝对一致"
      }
    },
    "integrated-strategy": {
      strand: "logic",
      prerequisiteIds: ["contradiction"],
      learningBridge: {
        prerequisiteSummary: "融通分类、不变量、最不利、倒推、排列表与博弈策略",
        methodSummary: { label: "高维逻辑组合破局", description: "多维度信息交叉时综合运用排除表与极端假设，层层压缩可能性空间，锁定唯一全局解" },
        transferTargets: [{ topicId: "integrated-modeling", reason: "逻辑策略直通全要素综合建模" }]
      },
      engineeringAffinity: {
        subsystem: "近地小行星取样返回全剖面智能自主控制链",
        algorithmRole: "全自主深空飞控闭环控制律：统筹巡航、附着、取样到高速再入全生命周期"
      }
    },

    // ====== 第9章：综合建模竞赛场 · 国家超算与智慧城市算力枢纽大脑 ======
    "decompose-conditions": {
      strand: "logic",
      prerequisiteIds: ["read-conditions"],
      learningBridge: {
        prerequisiteSummary: "具备长文本与复杂多重约束条件的解析能力",
        methodSummary: { label: "全要素解构树", description: "将百字复杂题干拆解为变量表、不变量关系、约束不等式与目标函数四要素" },
        transferTargets: [{ topicId: "equation-model", reason: "解构关系转化为方程模型" }]
      },
      engineeringAffinity: {
        subsystem: "超大规模特高压电网动态负荷要素解构",
        algorithmRole: "千万级智能节点瞬态功率条件解构：将海量电力需求分解为区域负荷矩阵"
      }
    },
    "equation-model": {
      strand: "quantity",
      prerequisiteIds: ["decompose-conditions", "equation-applications"],
      learningBridge: {
        prerequisiteSummary: "熟练掌握代数方程的设元与移项化简",
        methodSummary: { label: "方程组等量守恒建模", description: "抓住系统进出平衡、总量守恒或能量守恒，列出多元线性或非线性方程组" },
        transferTargets: [{ topicId: "ratio-model", reason: "方程模型与比例网络融合" }]
      },
      engineeringAffinity: {
        subsystem: "城市快速路多匝道动态流量守恒微分方程",
        algorithmRole: "早晚高峰交通流连续性方程组解算：实时求解各互通匝道最优信号放行速率"
      }
    },
    "ratio-model": {
      strand: "quantity",
      prerequisiteIds: ["equation-model", "ratio-proportion"],
      learningBridge: {
        prerequisiteSummary: "理解多对象之间的连比与交叉比例",
        methodSummary: { label: "连比与基准归一化", description: "找到公共桥梁变量统一份数化为连比 a:b:c，设每份为 x 把比例关系转为单未知数" },
        transferTargets: [{ topicId: "change-model", reason: "比例关系引入动态时间变化率" }]
      },
      engineeringAffinity: {
        subsystem: "绿色算力中心光伏、风电与市电并网能源配比",
        algorithmRole: "电价波动下多源绿电并网配比模型：毫秒级优化算力负荷消纳绿电比例"
      }
    },
    "change-model": {
      strand: "change",
      prerequisiteIds: ["ratio-model", "motion"],
      learningBridge: {
        prerequisiteSummary: "掌握速度、工效等单位时间变化率概念",
        methodSummary: { label: "动态变化率累积", description: "状态随时间连续改变，用初值+变化率×时间建立动态模型，把握相遇追及相持平衡点" },
        transferTargets: [{ topicId: "data-decision", reason: "动力学变率驱动大数据决策" }]
      },
      engineeringAffinity: {
        subsystem: "万卡GPU液冷集群散热冷量动态流动模型",
        algorithmRole: "高密度发热动态温升方程解算：根据算力利用率动态调度变频冷却泵流量"
      }
    },
    "data-decision": {
      strand: "logic",
      prerequisiteIds: ["change-model", "data-inference"],
      learningBridge: {
        prerequisiteSummary: "掌握均值、离散度与发展趋势的综合分析",
        methodSummary: { label: "大数据赋能最优决策", description: "根据历史数据统计分布，结合变化率预测未来走势，在多种可能中选定期望值最优策略" },
        transferTargets: [{ topicId: "probability-risk", reason: "决策模型中引入风险概率评估" }]
      },
      engineeringAffinity: {
        subsystem: "数字孪生水务全流域防洪排涝态势研判",
        algorithmRole: "多源雷达测雨与管网水位时空大数据决策：聚合降雨数据提前3小时发出泄洪调度"
      }
    },
    "probability-risk": {
      strand: "logic",
      prerequisiteIds: ["data-decision", "probability-fractions"],
      learningBridge: {
        prerequisiteSummary: "熟练计算古典概型并理解期望值",
        methodSummary: { label: "风险概率与损失期望", description: "风险期望损失=发生概率×损失代价；在决策中不仅看收益上限，更要控制极小概率灾难风险" },
        transferTargets: [{ topicId: "geometry-decomposition", reason: "风险评估结合空间几何网格" }]
      },
      engineeringAffinity: {
        subsystem: "关键基础设施灾难备份蒙特卡洛仿真",
        algorithmRole: "超大规模算力集群停电风险概率仿真：评估后备燃气轮机起动失败极小容许风险"
      }
    },
    "geometry-decomposition": {
      strand: "space-discrete",
      prerequisiteIds: ["probability-risk", "geometry"],
      learningBridge: {
        prerequisiteSummary: "掌握三角形五大模型与空间割补转化",
        methodSummary: { label: "几何模型高阶分解", description: "灵活应用鸟头、蝴蝶、燕尾模型与等高底比，将复杂多边形分解为成比例的三角形子网络" },
        transferTargets: [{ topicId: "motion-model", reason: "空间网格中规划动态运动路径" }]
      },
      engineeringAffinity: {
        subsystem: "低空经济城市立体空域无人机航路网格剖分",
        algorithmRole: "三维城市走廊网格几何分解：将高楼空域剖分为无碰撞微气象安全航道网"
      }
    },
    "motion-model": {
      strand: "change",
      prerequisiteIds: ["geometry-decomposition", "train-bridge"],
      learningBridge: {
        prerequisiteSummary: "熟练解决相遇、追及、环形、流水与火车过桥",
        methodSummary: { label: "复杂多元运动时空图谱", description: "画时空折线图分析多次相遇，抓住相遇时间相同路程比等于速度比的核心特征" },
        transferTargets: [{ topicId: "compare-plans", reason: "多方案比选走向全局极值最优化" }]
      },
      engineeringAffinity: {
        subsystem: "城市轨道交通多列车追踪动态移动闭塞模型",
        algorithmRole: "毫米波车车通信超密追踪制动曲线解算：压缩列车制动安全冗余，将发车间隔压入90秒"
      }
    },
    "compare-plans": {
      strand: "logic",
      prerequisiteIds: ["motion-model", "plan-design"],
      learningBridge: {
        prerequisiteSummary: "具备多目标、多约束方案的横向综合评估能力",
        methodSummary: { label: "方案优劣临界点决策", description: "建立各方案关于关键变量 x 的函数，求出转折交点划分区间，针对不同区间给出最佳方案" },
        transferTargets: [{ topicId: "optimization", reason: "方案比选升华为连续极值最优化" }]
      },
      engineeringAffinity: {
        subsystem: "全国算力东数西算跨区域调度方案比选",
        algorithmRole: "光纤通信延迟与西部绿色电力成本综合比选：实时动态分配实时交互与冷数据任务"
      }
    },
    optimization: {
      strand: "change",
      prerequisiteIds: ["compare-plans"],
      learningBridge: {
        prerequisiteSummary: "掌握不等式性质与配方法求二次最值",
        methodSummary: { label: "运筹规划极值巅峰", description: "和定差小积最大、积定差小和最小；通过配方或极端值逼近，在可行域内求得最大效益或最小成本" },
        transferTargets: [{ topicId: "result-verification", reason: "最优化解题的严密闭环校验" }]
      },
      engineeringAffinity: {
        subsystem: "国家超级计算千万级并行作业三维机架装箱",
        algorithmRole: "三维网络拓扑通信跳数最小化作业调度：优化万核通信延时，使并行计算吞吐逼近理论上限"
      }
    },
    "result-verification": {
      strand: "logic",
      prerequisiteIds: ["optimization", "verify-eliminate"],
      learningBridge: {
        prerequisiteSummary: "具备严密的数学自检意识与多解排查能力",
        methodSummary: { label: "多维交叉验证闭环", description: "运用奇偶性检验、量纲单位检验、特殊值带入与逆运算反推四重防线，确认解的合理性与完备性" },
        transferTargets: [{ topicId: "integrated-modeling", reason: "自检闭环融于终极全要素综合建模" }]
      },
      engineeringAffinity: {
        subsystem: "关键基础设施数字孪生系统实物运行校验",
        algorithmRole: "虚拟沙盘毫秒级灾备切换反演验证：在数字孪生体中预演电网断电自愈确保万无一失"
      }
    },
    "integrated-modeling": {
      strand: "logic",
      prerequisiteIds: ["result-verification"],
      learningBridge: {
        prerequisiteSummary: "融通小学至初中高阶奥数全部思维武器与模型工具",
        methodSummary: { label: "全要素综合建模巅峰", description: "面对无结构真实世界难题，自主定义变量、构建方程、设计算法、求解自检，完成知识大一统" },
        transferTargets: [{ topicId: "integrated-strategy", reason: "全要素综合建模与博弈决策相互印证，赋能全域自适应进化控制" }]
      },
      engineeringAffinity: {
        subsystem: "国家级智慧城市全域协同进化算力中枢",
        algorithmRole: "超大规模全域数字孪生算力大脑：统筹交通、能源、算力与应急防灾，实现全域自适应进化控制"
      }
    }
  });

  // 四大奥数螺旋演进主轴（全战役纵向认知脊梁）
  const OLYMPIAD_SPIRAL_AXES = Object.freeze([
    Object.freeze({
      id: "algebra-elimination",
      name: "代数建模与消元演进轴",
      title: "代数建模与消元演进轴",
      icon: "⚡",
      color: "#a855f7",
      strand: "quantity",
      description: "从线段和差走向极值假设、双向盈亏，再到消元表格、代数方程建模直至线性方程组与分式方程，形成系统的量化消元体系。",
      summary: "从线段和差走向极值假设、双向盈亏，再到消元表格、代数方程建模直至线性方程组与分式方程，形成系统的量化消元体系。",
      milestones: Object.freeze([
        { phase: "萌芽", stage: "和差基准", moduleIds: ["sum-diff"], focus: "线段图双锚点", summary: "抓住线段图与基准量，以和与差为双锚点", milestone: "以和与差为双锚点建立基准量" },
        { phase: "模型", stage: "置换假设", moduleIds: ["chicken-rabbit"], focus: "极端全量置换", summary: "全量极端假设与单体差量累加置换", milestone: "单体差量累加置换消除变量" },
        { phase: "拓展", stage: "双向盈亏", moduleIds: ["surplus-deficit"], focus: "分配差量对比", summary: "两次分配方案双向比较，同减异加", milestone: "两次分配方案双向比较同减异加" },
        { phase: "跃迁", stage: "方程与消元", moduleIds: ["linear-equations", "elimination-table"], focus: "公理化矩阵消元", summary: "设立未知数构建等量守恒，终结复杂数量关系", milestone: "未知数等量守恒与矩阵消元" }
      ]),
      levels: Object.freeze([
        { chapterId: "chapter-01", moduleId: "sum-diff", label: "和差倍模型", gradeLevel: "三年级" },
        { chapterId: "chapter-01", moduleId: "surplus-deficit", label: "盈亏问题", gradeLevel: "四年级" },
        { chapterId: "chapter-01", moduleId: "chicken-rabbit", label: "鸡兔同笼", gradeLevel: "四年级" },
        { chapterId: "chapter-03", moduleId: "unitary-method", label: "基准归一法", gradeLevel: "五年级" },
        { chapterId: "chapter-05", moduleId: "linear-equations", label: "一次方程", gradeLevel: "五年级" },
        { chapterId: "chapter-05", moduleId: "equation-applications", label: "方程应用", gradeLevel: "六年级" },
        { chapterId: "chapter-08", moduleId: "elimination-table", label: "逻辑消元表", gradeLevel: "六年级" },
        { chapterId: "chapter-09", moduleId: "equation-model", label: "多元方程建模", gradeLevel: "竞赛级" }
      ])
    }),
    Object.freeze({
      id: "geometry-transformation",
      name: "空间几何与割补演进轴",
      title: "空间几何与割补演进轴",
      icon: "📐",
      color: "#38bdf8",
      strand: "space-discrete",
      description: "从平移周长面积、格点割补，到模型比例转化、相似投影、全等辅助线与圆周动点轨迹，建立图形守恒与转化直觉。",
      summary: "从平移周长面积、格点割补，到模型比例转化、相似投影、全等辅助线与圆周动点轨迹，建立图形守恒与转化直觉。",
      milestones: Object.freeze([
        { phase: "萌芽", stage: "周长与面积基准", moduleIds: ["area", "perimeter"], focus: "等积变形与平移", summary: "长正方形网格与平移巧算周长面积", milestone: "网格平移与等积变形求面积" },
        { phase: "模型", stage: "几何展开与计数", moduleIds: ["geometry-counting", "surface-area"], focus: "立体表面与射线分割", summary: "三维立体透视、表面积与旋转体截面", milestone: "立体表面积与几何网格分类" },
        { phase: "拓展", stage: "五大面积模型", moduleIds: ["composite-figures", "triangles"], focus: "三角形割补比例", summary: "多边形分解与高底面积比", milestone: "等高底比与图形组合模型" },
        { phase: "跃迁", stage: "复杂三维与有限元", moduleIds: ["geometry-decomposition", "volume"], focus: "微元割补与降维拓扑", summary: "复杂异形结构有限元网格割补与空间投影", milestone: "异形拓扑网格割补与有限元" }
      ]),
      levels: Object.freeze([
        { chapterId: "chapter-02", moduleId: "geometry", label: "平面几何割补", gradeLevel: "四年级" },
        { chapterId: "chapter-02", moduleId: "geometry-counting", label: "几何图形计数", gradeLevel: "四年级" },
        { chapterId: "chapter-04", moduleId: "triangles", label: "三角形面积", gradeLevel: "四年级" },
        { chapterId: "chapter-04", moduleId: "composite-figures", label: "组合图形面积", gradeLevel: "五年级" },
        { chapterId: "chapter-04", moduleId: "surface-area", label: "立体表面积", gradeLevel: "五年级" },
        { chapterId: "chapter-07", moduleId: "transformation-method", label: "等价转化降维", gradeLevel: "六年级" },
        { chapterId: "chapter-08", moduleId: "shortest-path", label: "轴对称最短路径", gradeLevel: "六年级" },
        { chapterId: "chapter-09", moduleId: "geometry-decomposition", label: "复杂几何网格割补", gradeLevel: "竞赛级" }
      ])
    }),
    Object.freeze({
      id: "number-theory-structure",
      name: "数论基石与结构演进轴",
      title: "数论基石与结构演进轴",
      icon: "🔢",
      color: "#f5d06f",
      strand: "observation",
      description: "从奇偶判定、周期余数，到质因数短除分解、实数连续性、乘法公式与二次根式，掌握深层数论代数结构。",
      summary: "从奇偶判定、周期余数，到质因数短除分解、实数连续性、乘法公式与二次根式，掌握深层数论代数结构。",
      milestones: Object.freeze([
        { phase: "萌芽", stage: "周期与余数", moduleIds: ["periodicity", "patterns"], focus: "同余余数定位", summary: "同余余数定位与加乘奇偶不变性", milestone: "除法余数循环与奇偶不变性" },
        { phase: "模型", stage: "因倍数与短除法", moduleIds: ["factors-multiples", "prime-factorization"], focus: "质因数阶梯分解", summary: "质因数分解短除法，两数之积等于GCD乘LCM", milestone: "短除法两数之积恒等式" },
        { phase: "拓展", stage: "同余与奇偶", moduleIds: ["parity-divisibility", "parity-invariant"], focus: "同余类与不变量", summary: "整除特征与奇偶不变量算子", milestone: "同余类与不变量方程" },
        { phase: "跃迁", stage: "代数方程与逆推", moduleIds: ["reverse-thinking", "result-verification"], focus: "逆推与多维校验", summary: "逆向还原与多维交叉验证闭环", milestone: "逆推化简与代数自洽闭环" }
      ]),
      levels: Object.freeze([
        { chapterId: "chapter-01", moduleId: "periodicity", label: "周期问题", gradeLevel: "三年级" },
        { chapterId: "chapter-02", moduleId: "parity-divisibility", label: "奇偶与整除特征", gradeLevel: "四年级" },
        { chapterId: "chapter-03", moduleId: "factors-multiples", label: "公因数与公倍数", gradeLevel: "五年级" },
        { chapterId: "chapter-03", moduleId: "prime-factorization", label: "质因数分解", gradeLevel: "五年级" },
        { chapterId: "chapter-05", moduleId: "fraction-modeling", label: "分数转化与建模", gradeLevel: "六年级" },
        { chapterId: "chapter-07", moduleId: "reverse-thinking", label: "逆向还原与同余", gradeLevel: "六年级" },
        { chapterId: "chapter-08", moduleId: "parity-invariant", label: "奇偶不变量算子", gradeLevel: "六年级" },
        { chapterId: "chapter-09", moduleId: "result-verification", label: "多维自检与数论闭环", gradeLevel: "竞赛级" }
      ])
    }),
    Object.freeze({
      id: "combinatorics-optimization",
      name: "组合离散与极值演进轴",
      title: "组合离散与极值演进轴",
      icon: "🎲",
      color: "#10b981",
      strand: "counting",
      description: "从不重不漏的加乘穷举，到容斥原理、抽屉最不利原则、不等式可行域与二次函数抛物线极值，训练极端与最优策略。",
      summary: "从不重不漏的加乘穷举，到容斥原理、抽屉最不利原则、不等式可行域与二次函数抛物线极值，训练极端与最优策略。",
      milestones: Object.freeze([
        { phase: "萌芽", stage: "有序分类分步", moduleIds: ["enumeration", "add-multiply-principle"], focus: "树状图与加乘原理", summary: "树状图穷举与分类相加分步相乘", milestone: "不重不漏枚举与分类分步" },
        { phase: "模型", stage: "容斥与集合计数", moduleIds: ["inclusion-exclusion", "counting-transfer"], focus: "韦恩图重叠项抵消", summary: "多集合韦恩图重叠项计算与至少至多反向容斥", milestone: "集合重叠项与选拔机制" },
        { phase: "拓展", stage: "抽屉与最不利原则", moduleIds: ["pigeonhole-principle", "worst-case"], focus: "极端最差情况兜底", summary: "苹果与抽屉归宿原理、最倒霉极端情况兜底", milestone: "最差情况兜底与确定性判定" },
        { phase: "跃迁", stage: "博弈策略与最优化", moduleIds: ["optimal-strategy", "optimization"], focus: "单纯形法与帕累托前沿", summary: "对称博弈后发制人与受限资源单纯形规划", milestone: "多目标前沿与最优调度" }
      ]),
      levels: Object.freeze([
        { chapterId: "chapter-01", moduleId: "enumeration", label: "有序枚举", gradeLevel: "三年级" },
        { chapterId: "chapter-01", moduleId: "add-multiply-principle", label: "加乘原理", gradeLevel: "三年级" },
        { chapterId: "chapter-01", moduleId: "inclusion-exclusion", label: "容斥原理", gradeLevel: "三年级" },
        { chapterId: "chapter-02", moduleId: "pigeonhole-principle", label: "抽屉原理入门", gradeLevel: "四年级" },
        { chapterId: "chapter-03", moduleId: "pigeonhole-intro", label: "抽屉进阶模型", gradeLevel: "五年级" },
        { chapterId: "chapter-07", moduleId: "enumeration-method", label: "结构化穷举", gradeLevel: "六年级" },
        { chapterId: "chapter-08", moduleId: "worst-case", label: "最不利原则", gradeLevel: "六年级" },
        { chapterId: "chapter-08", moduleId: "optimal-strategy", label: "对称博弈策略", gradeLevel: "六年级" },
        { chapterId: "chapter-09", moduleId: "optimization", label: "资源分配最优化", gradeLevel: "竞赛级" }
      ])
    })
  ]);

  // 七大深层认知逻辑飞跃桥梁
  const INTRINSIC_LOGIC_BRIDGES = Object.freeze([
    Object.freeze({
      id: "chicken-rabbit-to-elimination",
      name: "假设法向消元法的公理化跃迁",
      title: "假设法向消元法的公理化跃迁",
      icon: "⚔️",
      sourceModule: "chicken-rabbit",
      targetModule: "elimination-table",
      elementaryRoot: "鸡兔同笼假设全为鸡，用单体腿数差补偿整体缺口。",
      axiomaticLeap: "二元一次方程组代入与加减消元公理，矩阵行变换消去未知数自由度。",
      mathematicalEssence: "鸡兔同笼中假设全为鸡并计算腿数差，与代入消元法中将 y=总数-x 代入腿数方程完全同构；加减消元则是盈亏两次差量相消的公理化。",
      insight: "鸡兔同笼中假设全为鸡并计算腿数差，与代入消元法中将 y=总数-x 代入腿数方程完全同构；加减消元则是盈亏两次差量相消的公理化。",
      engineeringAffinity: {
        system: "歼-20隐身战机",
        subsystem: "载荷配重与升阻比平衡解算系统",
        role: "双自由度气动控制律状态空间消元求解"
      },
      levels: Object.freeze([
        { chapterId: "chapter-01", moduleId: "chicken-rabbit", label: "鸡兔同笼假设计算" },
        { chapterId: "chapter-08", moduleId: "elimination-table", label: "消元矩阵表" },
        { chapterId: "chapter-09", moduleId: "equation-model", label: "多元方程建模" }
      ])
    }),
    Object.freeze({
      id: "hourglass-butterfly-to-similarity",
      name: "面积比模型向比例线段定理升华",
      title: "面积比模型向比例线段定理升华",
      icon: "🦋",
      sourceModule: "composite-figures",
      targetModule: "geometry-decomposition",
      elementaryRoot: "沙漏与蝴蝶模型依靠等高三角形底比等于面积比进行面积换算。",
      axiomaticLeap: "相似三角形判定与平行截线比例定理，面积比降维为对应线段成比例。",
      mathematicalEssence: "沙漏模型与蝴蝶定理依靠等高三角形面积比间接求比例；引入相似三角形与平行截割定理后，面积比直接转化为对应线段成比例，解题步数减少一半。",
      insight: "沙漏模型与蝴蝶定理依靠等高三角形面积比间接求比例；引入相似三角形与平行截割定理后，面积比直接转化为对应线段成比例，解题步数减少一半。",
      engineeringAffinity: {
        system: "奋斗者号潜水器",
        subsystem: "声呐测距与水下多波束三维测深网",
        role: "三角网格射线相交检测与深渊海沟微地形相似重构"
      },
      levels: Object.freeze([
        { chapterId: "chapter-04", moduleId: "composite-figures", label: "组合图形面积" },
        { chapterId: "chapter-07", moduleId: "transformation-method", label: "等价图形转化" },
        { chapterId: "chapter-09", moduleId: "geometry-decomposition", label: "复杂几何网格割补" }
      ])
    }),
    Object.freeze({
      id: "journey-differential-to-linear-function",
      name: "行程问题走向一次函数解析几何",
      title: "行程问题走向一次函数解析几何",
      icon: "🏎️",
      sourceModule: "motion",
      targetModule: "motion-model",
      elementaryRoot: "行程三量路程=速度×时间，相遇看和、追及看差。",
      axiomaticLeap: "平面直角坐标系一次函数 y = kx + b，斜率即速度，相遇追及即函数图像交点。",
      mathematicalEssence: "路程 s 为因变量 y，时间 t 为自变量 x，速度 v 即为直线的斜率 k；两车相遇在几何上就是两条直线的交点坐标，在代数上就是二元一次方程组的解。",
      insight: "路程 s 为因变量 y，时间 t 为自变量 x，速度 v 即为直线的斜率 k；两车相遇在几何上就是两条直线的交点坐标，在代数上就是二元一次方程组的解。",
      engineeringAffinity: {
        system: "天宫空间站",
        subsystem: "轨道动力学与交会对接自适应控制中枢",
        role: "两体轨道状态转移方程交点解算，确保毫米级软对接"
      },
      levels: Object.freeze([
        { chapterId: "chapter-02", moduleId: "motion", label: "基础行程问题" },
        { chapterId: "chapter-02", moduleId: "train-bridge", label: "列车过桥模型" },
        { chapterId: "chapter-09", moduleId: "motion-model", label: "多元运动时空轨迹" }
      ])
    }),
    Object.freeze({
      id: "geometry-dissection-to-multiplication-identity",
      name: "几何面积拼图升华为代数乘法公式",
      title: "几何面积拼图升华为代数乘法公式",
      icon: "🧩",
      sourceModule: "geometry",
      targetModule: "decompose-conditions",
      elementaryRoot: "长正方形拼图与网格割补，出入相友等积变换验证面积守恒。",
      axiomaticLeap: "完全平方公式与平方差公式 (a+b)^2 = a^2+2ab+b^2，代数展开与因式分解互逆。",
      mathematicalEssence: "长方形割补与正方形网格的等积变换，用代数语言记录就是完全平方与平方差公式；逆向拆解即是因式分解，成为方程化简的核心工具。",
      insight: "长方形割补与正方形网格的等积变换，用代数语言记录就是完全平方与平方差公式；逆向拆解即是因式分解，成为方程化简的核心工具。",
      engineeringAffinity: {
        system: "雪龙2号破冰船",
        subsystem: "破冰艏结构强度与双向破冰动力学模型",
        role: "有限元高阶形函数刚度矩阵面积积分解耦"
      },
      levels: Object.freeze([
        { chapterId: "chapter-02", moduleId: "geometry", label: "图形割补与拼接" },
        { chapterId: "chapter-03", moduleId: "square-array", label: "方阵点阵模型" },
        { chapterId: "chapter-09", moduleId: "decompose-conditions", label: "全要素解构树" }
      ])
    }),
    Object.freeze({
      id: "engineering-efficiency-to-fractional-equation",
      name: "工程效率走向分式方程与增根检验",
      title: "工程效率走向分式方程与增根检验",
      icon: "🏗️",
      sourceModule: "engineering",
      targetModule: "ratio-model",
      elementaryRoot: "总量设为单位 1，工作效率为 1/天数，轮流合作周期性推进。",
      axiomaticLeap: "分母含有未知数的分式方程，物理现实有界性导出严密的分母不为零增根过滤。",
      mathematicalEssence: "将工程问题的工作总量设为 1，工作时间为未知数 x 时，效率表达为 1/x，从而诞生分式方程；物理实际要求效率存在，导出增根检验（分母不为零）的严密性。",
      insight: "将工程问题的工作总量设为 1，工作时间为未知数 x 时，效率表达为 1/x，从而诞生分式方程；物理实际要求效率存在，导出增根检验（分母不为零）的严密性。",
      engineeringAffinity: {
        system: "99A主战坦克",
        subsystem: "动力传动与液压悬挂联合控制系统",
        role: "非线性流动分式状态方程稳定性判据与增根过滤"
      },
      levels: Object.freeze([
        { chapterId: "chapter-02", moduleId: "engineering", label: "工程问题基础" },
        { chapterId: "chapter-03", moduleId: "work-problems", label: "合作工效进阶" },
        { chapterId: "chapter-09", moduleId: "ratio-model", label: "无量纲比例模型" }
      ])
    }),
    Object.freeze({
      id: "pigeonhole-worst-case-to-linear-programming",
      name: "最不利原则跃迁为实数轴不等式可行域",
      title: "最不利原则跃迁为实数轴不等式可行域",
      icon: "🧮",
      sourceModule: "pigeonhole-principle",
      targetModule: "compare-plans",
      elementaryRoot: "抽屉原理与最倒霉极值兜底，考虑最极端分配情形下的保底确定性。",
      axiomaticLeap: "实数轴连续区间开闭交集，多约束线性不等式组可行域边界规划。",
      mathematicalEssence: "抽屉原理中的极端最倒霉情况兜底，升华为实数轴上连续区间的边界开闭与不等式组公共交集决策。",
      insight: "抽屉原理中的极端最倒霉情况兜底，升华为实数轴上连续区间的边界开闭与不等式组公共交集决策。",
      engineeringAffinity: {
        system: "墨子号量子卫星",
        subsystem: "星地量子密钥分发与偏振态校准系统",
        role: "极端信道噪声下的最坏情况纠错编码与可行域边界决策"
      },
      levels: Object.freeze([
        { chapterId: "chapter-02", moduleId: "pigeonhole-principle", label: "抽屉原理" },
        { chapterId: "chapter-08", moduleId: "worst-case", label: "最不利极端兜底" },
        { chapterId: "chapter-09", moduleId: "compare-plans", label: "方案决策边界" }
      ])
    }),
    Object.freeze({
      id: "arithmetic-second-order-to-quadratic-extremum",
      name: "等差求和二次项走向抛物线极值巅峰",
      title: "等差求和二次项走向抛物线极值巅峰",
      icon: "📈",
      sourceModule: "arithmetic-series",
      targetModule: "optimization",
      elementaryRoot: "高斯等差求和公式 (首项+末项)×项数÷2，阶梯数阵求和自然包含 n^2 项。",
      axiomaticLeap: "二次函数抛物线极值 y = ax^2 + bx + c 配方法求对称轴顶点最优解。",
      mathematicalEssence: "等差数列求和公式中自然包含 n^2 二次项，连续化后形成二次函数；通过配方法求解对称轴顶点，统一解决工程抛体轨迹与最大效益最值问题。",
      insight: "等差数列求和公式中自然包含 n^2 二次项，连续化后形成二次函数；通过配方法求解对称轴顶点，统一解决工程抛体轨迹与最大效益最值问题。",
      engineeringAffinity: {
        system: "祝融号火星车",
        subsystem: "自主越障规划与滑移率动态抑制系统",
        role: "二次代价函数最优控制（LQR）与抛物线减速制动包络"
      },
      levels: Object.freeze([
        { chapterId: "chapter-01", moduleId: "arithmetic-series", label: "等差数列求和" },
        { chapterId: "chapter-07", moduleId: "unit-method", label: "基准化一法" },
        { chapterId: "chapter-09", moduleId: "optimization", label: "极值最优化调度" }
      ])
    })
  ]);

  // 全108模块中文标准题名映射表
  const MODULE_TITLES = Object.freeze({
    "patterns": "找规律与数列递推",
    "quick-calculation": "加减法速算巧算",
    "arithmetic-series": "等差数列基础与求和",
    "periodicity": "周期问题与余数应用",
    "enumeration": "有序枚举与分类计数",
    "add-multiply-principle": "加乘原理与树状图",
    "inclusion-exclusion": "重叠问题与容斥原理",
    "sum-diff": "和差倍与年龄问题",
    "unit-rate": "归一与归总问题",
    "surplus-deficit": "盈亏问题双向建模",
    "chicken-rabbit": "鸡兔同笼假设计算",
    "average": "基准数与平均数计算",
    "cube-unfolding": "正方体展开与相对面",
    "geometry-counting": "几何图形计数与分割",
    "composite-figures": "规则与组合图形面积",
    "angle-calculation": "角度计算与多边形内角和",
    "tree-diagram": "树状图与分类计数法",
    "permutation-combination": "排列组合与选拔机制",
    "shortest-path-counting": "标数法与最短路径网",
    "geometric-probability": "几何概率与面积模型",
    "number-array-puzzle": "数阵图与幻方平衡律",
    "multi-digit-puzzle": "竖式谜与进退位逻辑",
    "matchstick-puzzle": "火柴棒几何与算式变换",
    "divisibility-properties": "整除特征与尾数分析",
    "prime-composite": "质数合数与质因数分解",
    "factors-multiples": "最大公因数与短除法",
    "modulo-arithmetic": "带余除法与同余基础",
    "fraction-addition": "分数裂项与公分母巧算",
    "equation-thinking": "逆向倒推与方程萌芽",
    "fraction-word-problems": "分数乘除与单位一转化",
    "ratio-proportion": "比与比例的性质化简",
    "scale-drawings": "比例尺与空间微缩模型",
    "gear-transmission": "反比例建模与齿轮传动",
    "speed-time-distance": "行程三量与相遇追及",
    "average-speed": "往返平均速度调和模型",
    "train-crossing": "列车过桥与错车超车",
    "river-flow": "流水行船顺逆水差量",
    "clock-angles": "时钟夹角与追及动态角",
    "fractional-engineering": "分数工程问题与工作总量",
    "efficiency-cooperation": "交替轮流合作周期工程",
    "water-tank": "注水排水管动力学模型",
    "percentage-application": "百分数应用与增减幅度",
    "profit-discount": "利润折扣与进价售价核算",
    "concentration": "溶液浓度与十字相乘法",
    "repeated-dilution": "连续稀释与守恒浓度变化",
    "triangles-parallelograms": "等底等高模型与鸟头定理",
    "trapezoid-butterfly": "梯形蝴蝶定理与比例面积",
    "circle-area": "圆与扇形面积割补重组",
    "cylinder-cone": "圆柱圆锥体积与等积变形",
    "surface-area-water": "表面积变化与浸没排开体积",
    "pigeonhole-intro": "抽屉原理最不利构造原则",
    "remainder-problems": "同余定理与中国剩余定理",
    "indefinite-equations": "不定方程整数解与可行域",
    "logic-reasoning": "逻辑推理与真假话矛盾排查",
    "binary-number": "二进制与计算机位运算编码",
    "cross-model": "沙漏模型与相似射影比例",
    "square-array": "方阵问题实心空心与圈数",
    "cryptarithm": "复杂字母算式谜与进位约束",
    "nested-brackets": "速算巧算符号重组与嵌套括号",
    "fraction-comparison": "分数比较大小与放缩夹逼法",
    "pie-chart-analysis": "统计图表多维交叉关联分析",
    "grouped-data-metrics": "加权平均数中位数极差决策",
    "tree-step-probability": "树状图多步递推复合概率",
    "geometric-sampling": "几何概型与网格蒙特卡洛抽样",
    "data-regression-trend": "散点趋势插值与离群点清洗",
    "expected-value": "数学期望与决策最优期望收益",
    "combinatorial-probability": "组合计数概率超几何分布",
    "conditional-probability": "有限样本空间条件概率收敛",
    "random-walk": "随机游走一维网格往返吸收态",
    "variance-stability": "方差标准差与控制系统稳定性",
    "correlation-analysis": "双变量协方差正负关联研判",
    "information-entropy": "信息熵编码压缩香农互信息",
    "reverse-engineering": "逆向思维知果索因倒推还原",
    "extreme-case-method": "极端化思想临界边界状态逼近",
    "construction-method": "构造法存在性反例与染色赋权",
    "invariance-principle": "不变量与单调势函数守恒研判",
    "analogy-transfer": "类比迁移高维空间降维同构",
    "coordinate-translation": "数形结合笛卡尔直角坐标平移",
    "pigeonhole-advanced": "无限抽屉连续区间狄利克雷定理",
    "induction-leap": "数学归纳递推骨牌阶梯跨越",
    "parity-coloring": "奇偶性拓扑多米诺骨牌棋盘染色",
    "reduction-to-absurdity": "反证法归谬悖论假设排除法",
    "divide-and-conquer": "化归转化分治递归子问题合并",
    "dimension-reduction": "三维降维正交投影空间展开术",
    "case-discussion": "分类讨论完备性与不漏不重边界",
    "parity-invariant": "奇偶守恒算子与可达状态空间",
    "worst-case": "最不利原则极值兜底确定性保证",
    "recurrence-strategy": "差分递推数列动态规划状态转移",
    "reverse-reasoning": "博弈逆向归纳反推必胜态策略",
    "elimination-table": "真假逻辑网格矩阵交叉消元表",
    "scheduling": "甘特统筹关键路径流水线拓扑排序",
    "shortest-path": "赋权拓扑图最短路径狄克斯特拉",
    "optimal-strategy": "对称博弈后发制人双人零和棋局",
    "construction": "反例构造鸽笼分割与极大极小值",
    "contradiction": "双重否定公理化归谬反证法核心",
    "integrated-strategy": "多重离散约束组合策略最优化",
    "decompose-conditions": "复杂实际问题解耦与因变量识别",
    "equation-model": "守恒定律驱动多元一次方程建模",
    "ratio-model": "尺度不变性与量纲齐次无量纲化",
    "change-model": "状态转移微分差分自适应动态模型",
    "data-decision": "不确定性模糊条件效用函数加权",
    "probability-risk": "小概率事件贝叶斯风险敏度分析",
    "geometry-decomposition": "复杂三维异形结构有限元网格割补",
    "motion-model": "质点动力学运动学多源轨迹拟合",
    "compare-plans": "多目标帕累托前沿Pareto优化筛选",
    "optimization": "受限资源分配单纯形线性规划松弛",
    "result-verification": "量纲检验特殊值反代鲁棒自检闭环",
    "integrated-modeling": "全要素数字孪生系统级综合建模"
  });

  // 通用模块后备配置生成器（针对未明确配置的其他模块）
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
        transferTargets: [{ topicId: "logic", reason: "综合逻辑验证", targetTitle: "综合逻辑验证" }]
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
    const raw = MODULE_TOPOLOGY[moduleId] || getFallbackModuleTopology(moduleId, chapterId);
    return {
      moduleId,
      ...raw
    };
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

  /**
   * 全战役奥数螺旋演进主轴与认知跃迁进度统计
   */
  function calculateSpineProgress(arg1 = {}, arg2 = []) {
    // 单一主轴快速计算重载: calculateSpineProgress(axisId, campaign)
    if (typeof arg1 === "string") {
      const axisId = arg1;
      const campaign = arg2 || {};
      const axis = OLYMPIAD_SPIRAL_AXES.find((a) => a.id === axisId);
      if (!axis) return { clearedCount: 0, totalCount: 0, percentage: 0 };

      const levels = axis.levels || [];
      const totalCount = levels.length;
      let clearedCount = 0;

      for (const entry of levels) {
        const chState = campaign?.chapterStates?.[entry.chapterId];
        const records = chState?.levelRecords || {};

        let isCleared = false;
        if ((records[entry.moduleId]?.starCount || 0) >= 1) {
          isCleared = true;
        } else {
          for (const [recId, rec] of Object.entries(records)) {
            if ((rec?.starCount || 0) >= 1) {
              if (
                recId === entry.moduleId ||
                recId === entry.levelId ||
                (typeof recId === "string" && recId.includes(entry.moduleId))
              ) {
                isCleared = true;
                break;
              }
            }
          }
        }

        if (!isCleared) {
          const chModuleList = {
            "chapter-01": ["patterns", "quick-calculation", "arithmetic-series", "periodicity", "enumeration", "add-multiply-principle", "inclusion-exclusion", "sum-diff", "unit-rate", "surplus-deficit", "chicken-rabbit", "average"],
            "chapter-02": ["pigeonhole-principle", "counting-transfer", "motion", "engineering", "train-bridge", "age", "efficiency-transfer", "tree-planting", "geometry", "logic", "geometry-counting", "parity-divisibility"],
            "chapter-03": ["factors-multiples", "ratio-proportion", "pigeonhole-intro", "recurrence-intro", "plan-design", "square-array", "tiered-pricing", "prime-factorization", "case-analysis-intro", "work-problems", "unitary-method", "restoration-problems"],
            "chapter-04": ["angles", "triangles", "quadrilaterals", "perimeter", "area", "composite-figures", "area-units", "volume", "capacity", "surface-area", "scale", "coordinates-routes"],
            "chapter-05": ["algebraic-expressions", "equations-unknowns", "linear-equations", "equation-applications", "fraction-modeling", "decimal-modeling", "percent-basics", "discount-tax", "profit-loss-modeling", "concentration-configuration", "savings-interest", "supply-integration"],
            "chapter-06": ["data-collection", "frequency-tables", "bar-charts", "line-charts", "mean", "median-mode", "data-range", "possibility-basics", "probability-fractions", "tree-counting", "data-inference", "statistics-probability-boss"],
            "chapter-07": ["read-conditions", "draw-bar-model", "diagram-model", "table-method", "enumeration-method", "tree-diagram", "assumption-method", "reverse-thinking", "transformation-method", "unit-method", "estimation-method", "verify-eliminate"],
            "chapter-08": ["case-discussion", "parity-invariant", "worst-case", "recurrence-strategy", "reverse-reasoning", "elimination-table", "scheduling", "shortest-path", "optimal-strategy", "construction", "contradiction", "integrated-strategy"],
            "chapter-09": ["decompose-conditions", "equation-model", "ratio-model", "change-model", "data-decision", "probability-risk", "geometry-decomposition", "motion-model", "compare-plans", "optimization", "result-verification", "integrated-modeling"]
          };
          const modIndex = chModuleList[entry.chapterId]?.indexOf(entry.moduleId);
          if (modIndex !== undefined && modIndex >= 0) {
            const expectedLvlId1 = `${entry.chapterId}-level-${modIndex + 1}`;
            const expectedLvlId2 = `${entry.chapterId}-L${String(modIndex + 1).padStart(2, "0")}`;
            const expectedLvlId3 = `${entry.chapterId}-L${modIndex + 1}`;
            if (
              (records[expectedLvlId1]?.starCount || 0) >= 1 ||
              (records[expectedLvlId2]?.starCount || 0) >= 1 ||
              (records[expectedLvlId3]?.starCount || 0) >= 1
            ) {
              isCleared = true;
            }
          }
          if (!isCleared && records["undefined"]?.starCount >= 1 && entry === levels[0]) {
            isCleared = true;
          }
          if (!isCleared && (records[`${entry.chapterId}-L01`]?.starCount || 0) >= 1 && entry === levels[0]) {
            isCleared = true;
          }
        }

        if (isCleared) {
          clearedCount++;
        }
      }

      const percentage = totalCount > 0 ? Math.round((clearedCount / totalCount) * 100) : 0;
      return {
        clearedCount,
        totalCount,
        percentage
      };
    }

    const campaign = arg1 || {};
    const allChapters = arg2 || [];
    const clearedModuleIds = new Set();
    const threeStarModuleIds = new Set();
    const unlockedModuleIds = new Set();

    for (const ch of allChapters) {
      const chState = campaign?.chapterStates?.[ch.chapterId];
      const records = chState?.levelRecords || {};
      const unlockedIds = new Set(chState?.unlockedLevelIds || []);
      for (const lvl of ch.levels || []) {
        const rec = records[lvl.levelId];
        if ((rec?.starCount || 0) >= 1) clearedModuleIds.add(lvl.moduleId);
        if ((rec?.starCount || 0) >= 3) threeStarModuleIds.add(lvl.moduleId);
        if (unlockedIds.has(lvl.levelId) || chState?.freePractice) unlockedModuleIds.add(lvl.moduleId);
      }
    }

    // 1. 评估四大螺旋主轴
    const axesProgress = OLYMPIAD_SPIRAL_AXES.map((axis) => {
      const totalMilestones = axis.milestones.length;
      let clearedCount = 0;
      let masteredCount = 0;

      const milestones = axis.milestones.map((ms) => {
        const isMastered = ms.moduleIds.every((mId) => threeStarModuleIds.has(mId));
        const isCleared = ms.moduleIds.some((mId) => clearedModuleIds.has(mId));
        const isUnlocked = ms.moduleIds.some((mId) => unlockedModuleIds.has(mId));

        let status = "locked";
        if (isMastered) status = "mastered";
        else if (isCleared) status = "cleared";
        else if (isUnlocked) status = "available";

        if (isCleared) clearedCount++;
        if (isMastered) masteredCount++;

        return {
          stage: ms.stage,
          moduleIds: ms.moduleIds,
          summary: ms.summary,
          status,
          isCleared,
          isMastered
        };
      });

      const percent = totalMilestones > 0 ? Math.round((clearedCount / totalMilestones) * 100) : 0;

      return {
        id: axis.id,
        title: axis.title,
        strand: axis.strand,
        summary: axis.summary,
        milestones,
        clearedCount,
        masteredCount,
        totalMilestones,
        percent
      };
    });

    // 2. 评估七大认知飞跃桥梁
    const bridgesProgress = INTRINSIC_LOGIC_BRIDGES.map((bridge) => {
      const sourceCleared = clearedModuleIds.has(bridge.sourceModule);
      const targetCleared = clearedModuleIds.has(bridge.targetModule);

      let status = "pending";
      if (sourceCleared && targetCleared) {
        status = "mastered";
      } else if (sourceCleared) {
        status = "bridged";
      }

      return {
        ...bridge,
        sourceCleared,
        targetCleared,
        status
      };
    });

    const totalMilestonesAll = axesProgress.reduce((sum, a) => sum + a.totalMilestones, 0);
    const clearedMilestonesAll = axesProgress.reduce((sum, a) => sum + a.clearedCount, 0);
    const overallPercent = totalMilestonesAll > 0 ? Math.round((clearedMilestonesAll / totalMilestonesAll) * 100) : 0;
    const activatedBridgesCount = bridgesProgress.filter((b) => b.status === "mastered" || b.status === "bridged").length;

    return {
      axes: axesProgress,
      bridges: bridgesProgress,
      overallPercent,
      clearedMilestonesCount: clearedMilestonesAll,
      totalMilestonesCount: totalMilestonesAll,
      activatedBridgesCount,
      totalBridgesCount: bridgesProgress.length
    };
  }

  /**
   * 模块血缘追踪与思维罗盘
   */
  function getModuleLineage(moduleId, chapterId = "") {
    const topo = getModuleTopology(moduleId, chapterId);
    const strand = getStrand(topo.strand);
    const title = MODULE_TITLES[moduleId] || moduleId;

    let matchedAxis = null;
    let matchedMilestone = null;
    for (const axis of OLYMPIAD_SPIRAL_AXES) {
      for (const ms of axis.milestones) {
        if (ms.moduleIds.includes(moduleId)) {
          matchedAxis = axis;
          matchedMilestone = ms;
          break;
        }
      }
      if (matchedAxis) break;
    }

    const sourceBridge = INTRINSIC_LOGIC_BRIDGES.find((b) => b.sourceModule === moduleId) || null;
    const targetBridge = INTRINSIC_LOGIC_BRIDGES.find((b) => b.targetModule === moduleId) || null;

    const relatedAxes = OLYMPIAD_SPIRAL_AXES.filter((axis) =>
      (axis.levels || []).some((l) => l.moduleId === moduleId) ||
      (axis.milestones || []).some((ms) => ms.moduleIds.includes(moduleId))
    );

    const relatedBridges = INTRINSIC_LOGIC_BRIDGES.filter((b) =>
      b.sourceModule === moduleId ||
      b.targetModule === moduleId ||
      (b.levels || []).some((l) => l.moduleId === moduleId)
    );

    const transferTargets = topo.learningBridge?.transferTargets || [];
    const firstTarget = transferTargets[0];
    const transferTarget = firstTarget ? {
      topicId: firstTarget.topicId,
      reason: firstTarget.reason,
      targetTitle: MODULE_TITLES[firstTarget.topicId] || firstTarget.topicId
    } : null;

    return {
      moduleId,
      chapterId,
      title,
      topo,
      strand,
      axis: matchedAxis ? { id: matchedAxis.id, title: matchedAxis.title, strand: matchedAxis.strand } : null,
      milestone: matchedMilestone ? { stage: matchedMilestone.stage, summary: matchedMilestone.summary } : null,
      prerequisiteSummary: topo.learningBridge?.prerequisiteSummary || "",
      methodSummary: topo.learningBridge?.methodSummary || null,
      transferTarget,
      transferTargets,
      engineeringAffinity: topo.engineeringAffinity || null,
      relatedAxes,
      relatedBridges,
      sourceBridge,
      targetBridge
    };
  }

  const KnowledgeTopologyAdapter = {
    STRANDS,
    MODULE_TOPOLOGY,
    OLYMPIAD_SPIRAL_AXES,
    olympiadSpiralAxes: OLYMPIAD_SPIRAL_AXES,
    INTRINSIC_LOGIC_BRIDGES,
    intrinsicLogicBridges: INTRINSIC_LOGIC_BRIDGES,
    getModuleTopology,
    getStrand,
    getAllStrands,
    calculateChapterLevelGraph,
    calculateSpineProgress,
    getModuleLineage,
    getSpiralAxes: () => OLYMPIAD_SPIRAL_AXES,
    getLogicBridges: () => INTRINSIC_LOGIC_BRIDGES
  };

  if (typeof globalThis !== "undefined") {
    globalThis.KnowledgeTopologyAdapter = KnowledgeTopologyAdapter;
  }

  export default KnowledgeTopologyAdapter;
