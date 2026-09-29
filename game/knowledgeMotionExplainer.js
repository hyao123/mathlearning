/**
 * Knowledge Motion Explainer Engine
 * 知识点趣味动图与极简图解引擎
 * 
 * 核心宗旨：
 * 1. 【不要文字说教】：绝不输出大段枯燥文字解析
 * 2. 【趣味动图演示】：纯 SVG + 60fps CSS 关键帧动画，生动演绎数学本质
 * 3. 【极简三拍卡片】：🎯 圈已知 ➔ ⚡ 动手算 ➔ 💡 秒懂诀
 */

const SVG_NS = "http://www.w3.org/2000/svg";

// 模型元数据：动态动图配置、极简思维口诀、核心公式胶囊
export const MOTION_MODELS = Object.freeze({
  "patterns": {
    id: "patterns",
    title: "特征识别 · 规律递推模型",
    spark: "找前后跳跃差，锁定递增步长！",
    formula: "当前项 + 规律步长 = 下一项",
    keywords: ["特征识别", "找规律", "递推", "规律", "连续变化", "跳跃", "步长", "patterns", "recurrence-strategy"],
    type: "patterns"
  },
  "quick-calculation": {
    id: "quick-calculation",
    title: "凑整拆补 · 互补合并模型",
    spark: "找好友凑整十，打散重组快口算！",
    formula: "(a + b) 凑整十整百，繁算秒变口算",
    keywords: ["凑整拆补", "凑整", "拆补", "结合律", "交换律", "互补", "简算", "quick-calculation", "estimation-method"],
    type: "quick-calculation"
  },
  "arithmetic-series": {
    id: "arithmetic-series",
    title: "高斯配对 · 阶梯倒扣模型",
    spark: "两套阶梯反扣，秒变规整长方形！",
    formula: "(首项 + 末项) × 项数 ÷ 2",
    keywords: ["高斯配对", "等差", "数列", "连续", "求和", "高斯", "加到", "arithmetic-series", "transformation-method"],
    type: "arithmetic-series"
  },
  "periodicity": {
    id: "periodicity",
    title: "周期循环 · 余数定位模型",
    spark: "周而复始滚动，看余数锁定目标！",
    formula: "总位置 ÷ 周期长度 = 组数 ... 余数",
    keywords: ["余数定位", "周期", "循环", "重复", "第几个", "余数", "排期", "periodicity"],
    type: "periodicity"
  },
  "enumeration": {
    id: "enumeration",
    title: "有序分类 · 穷举树状模型",
    spark: "基准排队不漏不错，有序展开无死角！",
    formula: "确定基准 ➔ 按从小到大依次枚举不重不漏",
    keywords: ["有序分类", "枚举", "穷举", "分类计数", "列表整理", "不重不漏", "enumeration", "enumeration-method", "table-method"],
    type: "enumeration"
  },
  "add-multiply-principle": {
    id: "add-multiply-principle",
    title: "分类与分步 · 加乘计数模型",
    spark: "独立类别用加法，相继步骤用乘法！",
    formula: "分类相加：N = A + B；分步相乘：N = A × B",
    keywords: ["分类与分步", "加乘原理", "分步", "乘法原理", "加法原理", "路线", "搭配", "树状图", "add-multiply-principle", "tree-diagram"],
    type: "add-multiply-principle"
  },
  "venn-diagram": {
    id: "venn-diagram",
    title: "容斥集合 · 重叠抵消模型",
    spark: "两圈重叠算了两次，必须扣掉一份！",
    formula: "总数 = A + B - 重叠部分(A∩B)",
    keywords: ["重叠抵消", "重叠", "都参加", "容斥", "集合", "语文数学", "至少", "inclusion-exclusion", "venn"],
    type: "venn-diagram"
  },
  "sum-diff": {
    id: "sum-diff",
    title: "线段图建模 · 和差截断模型",
    spark: "多的砍掉，剩下除以2！",
    formula: "(和 - 差) ÷ 2 = 较小数",
    keywords: ["线段图建模", "和差截断", "和差问题", "和倍问题", "差倍问题", "截长补短", "画线段图", "sum-diff", "draw-bar-model"],
    type: "sum-diff"
  },
  "unit-rate": {
    id: "unit-rate",
    title: "单位量归一 · 单倍基准模型",
    spark: "先求一份是多少，按需缩放算全部！",
    formula: "单位量 = 总量 ÷ 份数 ➔ 目标总量 = 单位量 × 目标份数",
    keywords: ["单位量归一", "归一问题", "单倍基准", "单位量", "单价", "每天", "一份", "归一与单位化", "unit-rate", "unit-method"],
    type: "unit-rate"
  },
  "surplus-deficit": {
    id: "surplus-deficit",
    title: "双方案对比 · 盈亏差额平衡模型",
    spark: "比两次分配盈与亏，总差除以单差得份数！",
    formula: "份数(人数) = (盈 + 亏) ÷ 两次分配差",
    keywords: ["双方案差额对比", "盈亏差额平衡", "双方案对比", "盈亏问题", "盈亏", "盈余", "亏欠", "多出", "不足", "两次分配", "surplus-deficit"],
    type: "surplus-deficit"
  },
  "chicken-rabbit": {
    id: "chicken-rabbit",
    title: "置换假设 · 差额修正模型",
    spark: "全当成小鸡，借脚变兔子！",
    formula: "兔数 = (总脚数 - 假定脚数) ÷ (4 - 2)",
    keywords: ["假设修正法", "置换假设", "差额修正", "假设法", "鸡兔同笼", "鸡兔问题", "大船小船", "门票置换", "置换", "chicken-rabbit", "assumption-method"],
    type: "chicken-rabbit"
  },
  "average": {
    id: "average",
    title: "移多补少 · 均值对齐模型",
    spark: "高的切掉填进低洼，齐刷刷抹成一条线！",
    formula: "平均数 = 总数量 ÷ 总份数 (多出量 = 补入量)",
    keywords: ["移多补少", "平均数", "均值", "拉平", "抹平", "多补少", "average"],
    type: "average"
  },
  "pigeonhole-principle": {
    id: "pigeonhole-principle",
    title: "最不利原则 · 极值抽屉模型",
    spark: "往最倒霉去想，多抓1个必定重复！",
    formula: "至少保证数 = 最倒霉未达成数 + 1",
    keywords: ["最不利原则", "最不利", "抽屉", "鸽巢", "至少", "保证", "pigeonhole-principle", "worst-case"],
    type: "pigeonhole-principle"
  },
  "train-bridge": {
    id: "train-bridge",
    title: "长度参与 · 火车过桥模型",
    spark: "车头进到车尾出，路程必须加车长！",
    formula: "完全通过路程 = 桥长 + 车长",
    keywords: ["长度参与运动", "火车", "过桥", "隧道", "车长", "桥长", "车身", "train-bridge"],
    type: "train-bridge"
  },
  "age": {
    id: "age",
    title: "差值不变量 · 年龄守恒模型",
    spark: "岁月流逝一起长，年龄差值永不变！",
    formula: "年龄差恒定：现在的差 = 过去的差 = 未来的差",
    keywords: ["差值不变量", "年龄", "岁数", "几年后", "几年前", "差值不变", "age"],
    type: "age"
  },
  "engineering": {
    id: "engineering",
    title: "工程问题 · 总量化一协同模型",
    spark: "未知总工程设为1，各自工效加起来！",
    formula: "合作时间 = 1 ÷ (工效甲 + 工效乙)",
    keywords: ["工程总量化一", "工程", "工效", "水管", "注水", "合作", "效率协同", "engineering", "efficiency-transfer"],
    type: "engineering"
  },
  "perimeter-area": {
    id: "perimeter-area",
    title: "几何割补 · 平移转化模型",
    spark: "凹进去向外弹，异形秒变大长方形！",
    formula: "凹边向外平移 = 标准矩形周长 (长+宽)×2",
    keywords: ["割补转化", "周长", "面积", "割补", "平移", "长方形", "正方形", "图形", "geometry", "perimeter-area", "diagram-model"],
    type: "perimeter-area"
  },
  "encounter-chasing": {
    id: "encounter-chasing",
    title: "相对速度 · 相遇追及模型",
    spark: "相向跑拼合速度，同向追耗速度差！",
    formula: "相遇时间 = 路程 ÷ 速度和；追及时间 = 距离差 ÷ 速度差",
    keywords: ["相对速度建模", "相遇", "追及", "同向", "相向", "速度", "出发", "motion", "encounter-chasing", "motion-model"],
    type: "encounter-chasing"
  },
  "tree-planting": {
    id: "tree-planting",
    title: "点与间隔 · 植树排布模型",
    spark: "两头插旗两头栽，树永远比段多1！",
    formula: "两端都栽：棵数 = 间隔数 + 1",
    keywords: ["点与间隔模型", "植树", "路灯", "锯木头", "爬楼梯", "间隔", "每隔", "tree-planting"],
    type: "tree-planting"
  },
  "reverse-thinking": {
    id: "reverse-thinking",
    title: "逆流倒推 · 还原回溯模型",
    spark: "倒带看结局：加变减、乘变除！",
    formula: "从终点逆序回推：运算符号全面反转",
    keywords: ["逆向思考", "逆推与还原", "倒推", "原来", "还原", "又拿走", "剩下", "逆向", "reverse-thinking", "reverse-reasoning"],
    type: "reverse-thinking"
  },
  "equation-balance": {
    id: "equation-balance",
    title: "等量代换 · 天平平衡模型",
    spark: "天平两边拿掉一样的，依然稳稳平衡！",
    formula: "消去同类未知项 = 核心变量显形",
    keywords: ["等量代换", "代换", "天平", "等于", "相当于", "换算", "equation-balance", "transformation-method", "equation-model"],
    type: "equation-balance"
  },
  "parity-divisibility": {
    id: "parity-divisibility",
    title: "奇偶特性 · 运算守恒模型",
    spark: "奇偶运算法则牢，无需硬算判可能！",
    formula: "奇 + 奇 = 偶；奇 + 偶 = 奇；奇 × 奇 = 奇",
    keywords: ["奇偶不变量", "奇偶性与不变量", "奇数", "偶数", "整除", "奇偶", "parity-divisibility", "parity-invariant"],
    type: "parity-divisibility"
  },
  "factors-multiples": {
    id: "factors-multiples",
    title: "短除梯级 · 因倍数分解模型",
    spark: "公质因数连续除，左列乘GCD，L型环乘LCM！",
    formula: "左侧竖列相乘 = 最大公因数(GCD)；“L”型回路整环连乘 = 最小公倍数(LCM)",
    keywords: ["短除梯级", "质因数分解与短除法", "短除法", "最大公因数", "最小公倍数", "最大公约数", "公倍数", "公因数", "质因数", "因数", "倍数", "互质", "分解质因数", "factors-multiples", "prime-factorization", "factor-decomposition", "gcd", "lcm"],
    type: "factors-multiples"
  },
  "general-logic": {
    id: "general-logic",
    title: "网格矩阵 · 逻辑排除模型",
    spark: "真话假话列阵排，锁定矛盾破案！",
    formula: "二维表格打叉排除 ➔ 锁定唯一对勾真相",
    keywords: ["网格矩阵排除", "表格排除", "侦探", "推理", "真话", "假话", "逻辑", "猜测", "logic", "elimination-table", "verify-eliminate", "case-discussion"],
    type: "general-logic"
  }
});

/**
 * 识别题目或模块对应的最佳解题动图模型
 */
export function matchMotionModel(hint = {}) {
  const methodId = String(hint.methodId || hint.moduleId || hint.thinkingMethodId || "").toLowerCase().trim();
  const methodLabel = String(hint.method || hint.thinkingMethodLabel || "").trim();
  const prompt = String(hint.prompt || hint.title || "").toLowerCase();
  const combined = `${methodId} ${methodLabel} ${prompt}`.toLowerCase();

  // 1. 最高优先级：精确 ID 匹配（传入已知准确的 moduleId / methodId 时零误判）
  if (methodId && MOTION_MODELS[methodId]) {
    return MOTION_MODELS[methodId];
  }

  // 2. 强匹配：明确的思维要诀标签（如 "双方案差额对比"、"特征识别"、"凑整拆补"、"有序分类" 等）
  if (methodLabel) {
    // 2.1 精确匹配关键词或标题包含标签
    for (const model of Object.values(MOTION_MODELS)) {
      if (model.title.includes(methodLabel) || model.keywords.some((kw) => kw === methodLabel)) {
        return model;
      }
    }
    // 2.2 包含匹配（关键词长度 >= 2，避免单字误匹配）
    for (const model of Object.values(MOTION_MODELS)) {
      if (model.keywords.some((kw) => kw.length >= 2 && (methodLabel.includes(kw) || kw.includes(methodLabel)))) {
        return model;
      }
    }
  }

  // 3. 模块与方法 ID 别名映射（特殊关键字优先，如 surplus 先于 sum-diff）
  if (methodId.includes("factor") || methodId.includes("multiple") || methodId.includes("prime") || methodId.includes("gcd") || methodId.includes("lcm")) return MOTION_MODELS["factors-multiples"];
  if (methodId.includes("pattern") || methodId.includes("recurrence")) return MOTION_MODELS["patterns"];
  if (methodId.includes("quick") || methodId.includes("calc")) return MOTION_MODELS["quick-calculation"];
  if (methodId.includes("series") || methodId.includes("arithmetic") || methodId.includes("gauss")) return MOTION_MODELS["arithmetic-series"];
  if (methodId.includes("period") || methodId.includes("cycle")) return MOTION_MODELS["periodicity"];
  if (methodId.includes("enumeration") || methodId.includes("table-method") || methodId.includes("enum")) return MOTION_MODELS["enumeration"];
  if (methodId.includes("add-multiply") || methodId.includes("tree-diagram") || methodId.includes("counting-transfer")) return MOTION_MODELS["add-multiply-principle"];
  if (methodId.includes("venn") || methodId.includes("overlap") || methodId.includes("inclusion") || methodId.includes("exclusion") || methodId.includes("set")) return MOTION_MODELS["venn-diagram"];
  if (methodId.includes("surplus") || methodId.includes("deficit")) return MOTION_MODELS["surplus-deficit"];
  if (methodId.includes("sum-diff") || methodId.includes("draw-bar") || methodId.includes("difference")) return MOTION_MODELS["sum-diff"];
  if (methodId.includes("unit-rate") || methodId.includes("unit-method") || methodId.includes("unitary")) return MOTION_MODELS["unit-rate"];
  if (methodId.includes("chicken") || methodId.includes("rabbit") || methodId.includes("hypo") || methodId.includes("assumption")) return MOTION_MODELS["chicken-rabbit"];
  if (methodId.includes("average") || methodId.includes("mean")) return MOTION_MODELS["average"];
  if (methodId.includes("pigeon") || methodId.includes("worst") || methodId.includes("drawer")) return MOTION_MODELS["pigeonhole-principle"];
  if (methodId.includes("train") || methodId.includes("bridge")) return MOTION_MODELS["train-bridge"];
  if (methodId.includes("age")) return MOTION_MODELS["age"];
  if (methodId.includes("engineer") || methodId.includes("efficiency")) return MOTION_MODELS["engineering"];
  if (methodId.includes("perimeter") || methodId.includes("area") || methodId.includes("geometry") || methodId.includes("diagram")) return MOTION_MODELS["perimeter-area"];
  if (methodId.includes("encounter") || methodId.includes("chasing") || methodId.includes("speed") || methodId.includes("motion")) return MOTION_MODELS["encounter-chasing"];
  if (methodId.includes("tree") || methodId.includes("planting") || methodId.includes("interval")) return MOTION_MODELS["tree-planting"];
  if (methodId.includes("reverse") || methodId.includes("invert") || methodId.includes("reasoning")) return MOTION_MODELS["reverse-thinking"];
  if (methodId.includes("balance") || methodId.includes("substitut") || methodId.includes("equation") || methodId.includes("transform")) return MOTION_MODELS["equation-balance"];
  if (methodId.includes("parity") || methodId.includes("divisib")) return MOTION_MODELS["parity-divisibility"];
  if (methodId.includes("logic") || methodId.includes("matrix") || methodId.includes("eliminate") || methodId.includes("condition")) return MOTION_MODELS["general-logic"];

  // 4. 文本关键词智能匹配 (匹配词长度降序，最精准者获胜)
  const candidateMatches = [];
  for (const model of Object.values(MOTION_MODELS)) {
    for (const kw of model.keywords) {
      if (kw.length >= 2 && combined.includes(kw.toLowerCase())) {
        candidateMatches.push({ model, weight: kw.length });
      }
    }
  }
  if (candidateMatches.length > 0) {
    candidateMatches.sort((a, b) => b.weight - a.weight);
    return candidateMatches[0].model;
  }

  return MOTION_MODELS["patterns"]; // 启程第一关默认模型
}

/**
 * 创建 SVG 基础画板
 */
function createMotionSvg(viewBox = "0 0 360 170") {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("role", "img");
  svg.setAttribute("class", "motion-graphic__svg");
  return svg;
}

/**
 * 1. 和差问题动图：动态不等长光条，剪刀咔嚓切掉多的“差”，两条光条拉平对齐，平均分成2份
 */
function renderSumDiffAnimation() {
  const svg = createMotionSvg("0 0 360 170");

  svg.innerHTML = `
    <!-- 背景坐标网格 -->
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 线段A：较大数 (基准 + 差) -->
    <g class="motion-group--bar-a">
      <text x="24" y="44" fill="#94a3b8" font-size="12" font-family="monospace">较大数</text>
      <!-- 基准段 -->
      <rect class="motion-bar motion-bar--base" x="72" y="30" width="140" height="20" rx="4" fill="#38bdf8" />
      <text x="142" y="45" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">较小数</text>
      <!-- 多出的差值段（动态闪烁与平移切下） -->
      <g class="motion-bar-diff-group">
        <rect class="motion-bar motion-bar--diff" x="214" y="30" width="70" height="20" rx="4" fill="#f5d06f" stroke="#fef08a" stroke-dasharray="3,3" />
        <text x="249" y="45" fill="#78350f" font-size="11" font-weight="bold" text-anchor="middle">多的【差】</text>
        <!-- 剪刀切断光标 -->
        <path class="motion-scissors" d="M 214 20 L 214 56" stroke="#f43f5e" stroke-width="2.5" stroke-dasharray="4,2" />
        <text class="motion-cut-icon" x="208" y="16" font-size="14">✂️</text>
      </g>
    </g>

    <!-- 线段B：较小数 -->
    <g class="motion-group--bar-b">
      <text x="24" y="88" fill="#94a3b8" font-size="12" font-family="monospace">较小数</text>
      <rect class="motion-bar motion-bar--equal" x="72" y="74" width="140" height="20" rx="4" fill="#38bdf8" />
      <text x="142" y="89" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">较小数</text>
    </g>

    <!-- 动态动作演绎标识 -->
    <g class="motion-action-callout">
      <!-- 动态括号表示两段拉平 -->
      <path d="M 68 102 L 68 114 L 214 114 L 214 102" fill="none" stroke="#38bdf8" stroke-width="1.5" />
      <text x="141" y="132" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">两段完全拉平 ➔ (和 - 差) ÷ 2</text>
      <!-- 差移走指示 -->
      <path class="motion-arrow-drop" d="M 249 55 Q 260 85 249 115" fill="none" stroke="#f5d06f" stroke-width="2" stroke-dasharray="4,3" />
      <text x="285" y="100" fill="#f5d06f" font-size="11" font-weight="bold">移走多出的差</text>
    </g>
  `;

  return svg;
}

/**
 * 2. 鸡兔同笼置换动图：全当成小鸡（2只脚），警报少算脚数，机械臂补上2只脚变长耳兔子跳跃
 */
function renderChickenRabbitAnimation() {
  const svg = createMotionSvg("0 0 360 170");

  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 栅栏地面 -->
    <line x1="20" y1="120" x2="340" y2="120" stroke="#334155" stroke-width="3" />

    <!-- 角色1：小鸡 (2脚) -->
    <g class="motion-cr-creature motion-cr--chicken" transform="translate(60, 50)">
      <circle cx="30" cy="30" r="18" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
      <polygon points="46,28 54,32 46,36" fill="#f97316" />
      <circle cx="36" cy="24" r="2.5" fill="#0f172a" />
      <!-- 两只脚 -->
      <line x1="24" y1="48" x2="24" y2="70" stroke="#ca8a04" stroke-width="3" />
      <line x1="36" y1="48" x2="36" y2="70" stroke="#ca8a04" stroke-width="3" />
      <text x="30" y="86" fill="#fef08a" font-size="11" text-anchor="middle">假定全是鸡(2脚)</text>
    </g>

    <!-- 中间动态置换过程：机械手添上2只脚 -->
    <g class="motion-cr-transform" transform="translate(180, 45)">
      <!-- 能量加号与脚 -->
      <text x="0" y="35" fill="#f5d06f" font-size="22" font-weight="bold" text-anchor="middle">➔</text>
      <g class="motion-add-legs">
        <text x="0" y="10" fill="#f43f5e" font-size="12" font-weight="bold" text-anchor="middle">每添 +2 脚</text>
        <line x1="-8" y1="18" x2="-8" y2="40" stroke="#f43f5e" stroke-width="3" stroke-dasharray="3,2" />
        <line x1="8" y1="18" x2="8" y2="40" stroke="#f43f5e" stroke-width="3" stroke-dasharray="3,2" />
      </g>
      <text x="0" y="70" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">变出 1 只兔！</text>
    </g>

    <!-- 角色2：兔子 (4脚，长耳朵蹦跳) -->
    <g class="motion-cr-creature motion-cr--rabbit" transform="translate(260, 40)">
      <!-- 长耳朵 -->
      <ellipse cx="22" cy="10" rx="4" ry="14" fill="#e2e8f0" />
      <ellipse cx="34" cy="10" rx="4" ry="14" fill="#e2e8f0" />
      <!-- 身体 -->
      <ellipse cx="28" cy="36" rx="20" ry="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
      <circle cx="36" cy="30" r="2.5" fill="#0f172a" />
      <!-- 四只脚 -->
      <line x1="15" y1="52" x2="15" y2="80" stroke="#94a3b8" stroke-width="2.5" />
      <line x1="23" y1="52" x2="23" y2="80" stroke="#94a3b8" stroke-width="2.5" />
      <line x1="33" y1="52" x2="33" y2="80" stroke="#f43f5e" stroke-width="2.5" />
      <line x1="41" y1="52" x2="41" y2="80" stroke="#f43f5e" stroke-width="2.5" />
      <text x="28" y="96" fill="#f8fafc" font-size="11" text-anchor="middle">化为兔(4脚)</text>
    </g>

    <text x="180" y="152" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      缺的脚数 ÷ (4 - 2) = 兔子只数 🎯
    </text>
  `;

  return svg;
}

/**
 * 3. 行程相遇与追及动图：跑道、相向小车碰撞会合/同向尾焰追及
 */
function renderEncounterChasingAnimation() {
  const svg = createMotionSvg("0 0 360 170");

  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 跑道与标尺 -->
    <line x1="30" y1="80" x2="330" y2="80" stroke="#475569" stroke-width="4" stroke-dasharray="10,6" />
    <circle cx="30" cy="80" r="4" fill="#38bdf8" />
    <circle cx="330" cy="80" r="4" fill="#f43f5e" />
    <text x="30" y="100" fill="#94a3b8" font-size="11" text-anchor="middle">甲起点</text>
    <text x="330" y="100" fill="#94a3b8" font-size="11" text-anchor="middle">乙起点</text>

    <!-- 跑道总长标记 -->
    <path d="M 30 50 L 30 42 L 330 42 L 330 50" fill="none" stroke="#64748b" stroke-width="1.5" />
    <text x="180" y="36" fill="#f5d06f" font-size="12" font-weight="bold" text-anchor="middle">全程总路程 S</text>

    <!-- 左侧红车 (甲) -->
    <g class="motion-car motion-car--left" transform="translate(30, 60)">
      <rect x="0" y="0" width="34" height="16" rx="4" fill="#38bdf8" />
      <circle cx="8" cy="18" r="4" fill="#0284c7" />
      <circle cx="26" cy="18" r="4" fill="#0284c7" />
      <!-- 速度向量箭头 -->
      <path class="motion-arrow-speed" d="M 36 8 L 52 8" stroke="#38bdf8" stroke-width="2.5" />
      <text x="17" y="-4" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">速度 V甲</text>
    </g>

    <!-- 右侧蓝车 (乙) -->
    <g class="motion-car motion-car--right" transform="translate(300, 60)">
      <rect x="0" y="0" width="34" height="16" rx="4" fill="#f43f5e" />
      <circle cx="8" cy="18" r="4" fill="#be123c" />
      <circle cx="26" cy="18" r="4" fill="#be123c" />
      <!-- 速度向量箭头 -->
      <path class="motion-arrow-speed" d="M -2 8 L -18 8" stroke="#f43f5e" stroke-width="2.5" />
      <text x="17" y="-4" fill="#f43f5e" font-size="10" font-weight="bold" text-anchor="middle">速度 V乙</text>
    </g>

    <!-- 相遇点光圈爆发效果 -->
    <g class="motion-encounter-point" transform="translate(195, 78)">
      <circle class="motion-pulse-ring" cx="0" cy="0" r="14" fill="none" stroke="#f5d06f" stroke-width="2" />
      <text x="0" y="-18" fill="#fef08a" font-size="12" font-weight="bold" text-anchor="middle">✨ 相遇会合</text>
    </g>

    <text x="180" y="145" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">
      相遇时间 = 总路程 ÷ (V甲 + V乙) ⚡
    </text>
  `;

  return svg;
}

/**
 * 4. 周期传送带动图：彩色方块循环移动，扫描线高亮锁定余数方块
 */
function renderPeriodicityAnimation() {
  const svg = createMotionSvg("0 0 360 170");

  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 传送带轨道 -->
    <rect x="20" y="60" width="320" height="36" rx="18" fill="#1e293b" stroke="#475569" stroke-width="2" />
    
    <!-- 传送带循环方块组 -->
    <g class="motion-conveyor-belt">
      <!-- 第1组 (周期=4) -->
      <g transform="translate(30, 64)">
        <rect x="0" y="0" width="28" height="28" rx="4" fill="#f43f5e" /><text x="14" y="18" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">1</text>
        <rect x="34" y="0" width="28" height="28" rx="4" fill="#38bdf8" /><text x="48" y="18" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">2</text>
        <rect x="68" y="0" width="28" height="28" rx="4" fill="#f5d06f" /><text x="82" y="18" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">3</text>
        <rect x="102" y="0" width="28" height="28" rx="4" fill="#10b981" /><text x="116" y="18" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">4</text>
      </g>
      <!-- 第2组 -->
      <g transform="translate(170, 64)">
        <rect x="0" y="0" width="28" height="28" rx="4" fill="#f43f5e" /><text x="14" y="18" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">1</text>
        <rect x="34" y="0" width="28" height="28" rx="4" fill="#38bdf8" /><text x="48" y="18" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">2</text>
        <rect class="motion-target-period" x="68" y="0" width="28" height="28" rx="4" fill="#f5d06f" stroke="#fef08a" stroke-width="3" />
        <text x="82" y="18" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">3</text>
        <rect x="102" y="0" width="28" height="28" rx="4" fill="#10b981" /><text x="116" y="18" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">4</text>
      </g>
    </g>

    <!-- 周期长度标注 -->
    <path d="M 30 46 L 30 38 L 160 38 L 160 46" fill="none" stroke="#38bdf8" stroke-width="1.5" />
    <text x="95" y="32" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">1个完整周期 (长度=4)</text>

    <!-- 激光扫描指针：锁定余数 -->
    <g class="motion-scanner" transform="translate(252, 45)">
      <polygon points="0,0 -8,-14 8,-14" fill="#f5d06f" />
      <line x1="0" y1="0" x2="0" y2="55" stroke="#f5d06f" stroke-width="2" stroke-dasharray="3,2" />
      <text x="0" y="-20" fill="#fef08a" font-size="11" font-weight="bold" text-anchor="middle">余数是 3 ➔ 锁定第 3 个！</text>
    </g>

    <text x="180" y="146" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="middle">
      第 N 个位置 = 总数 ÷ 周期 ➔ <tspan fill="#f5d06f">看余数定位置</tspan>
    </text>
  `;

  return svg;
}

/**
 * 5. 高斯阶梯倒扣动图：阶梯积木，互补阶梯倒扣嵌入拼成规整矩形
 */
function renderArithmeticSeriesAnimation() {
  const svg = createMotionSvg("0 0 360 170");

  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 正置阶梯 (1+2+3+4) -->
    <g class="motion-stair-base" transform="translate(80, 20)">
      <rect x="0" y="60" width="20" height="20" fill="#38bdf8" stroke="#0284c7" stroke-width="1" />
      <rect x="20" y="40" width="20" height="40" fill="#38bdf8" stroke="#0284c7" stroke-width="1" />
      <rect x="40" y="20" width="20" height="60" fill="#38bdf8" stroke="#0284c7" stroke-width="1" />
      <rect x="60" y="0" width="20" height="80" fill="#38bdf8" stroke="#0284c7" stroke-width="1" />
      <text x="40" y="100" fill="#38bdf8" font-size="11" text-anchor="middle">1+2+3+4</text>
    </g>

    <!-- 动态倒扣阶梯 (旋转180度嵌入) -->
    <g class="motion-stair-invert" transform="translate(180, 20)">
      <rect x="0" y="0" width="20" height="80" fill="#f5d06f" stroke="#d97706" stroke-width="1" />
      <rect x="20" y="20" width="20" height="60" fill="#f5d06f" stroke="#d97706" stroke-width="1" />
      <rect x="40" y="40" width="20" height="40" fill="#f5d06f" stroke="#d97706" stroke-width="1" />
      <rect x="60" y="60" width="20" height="20" fill="#f5d06f" stroke="#d97706" stroke-width="1" />
      <text x="40" y="100" fill="#f5d06f" font-size="11" text-anchor="middle">倒置拼合</text>
    </g>

    <!-- 动态合成规整矩形框 -->
    <rect class="motion-stair-rect" x="80" y="20" width="160" height="80" rx="4" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4,3" />

    <text x="180" y="146" fill="#10b981" font-size="13" font-weight="bold" text-anchor="middle">
      拼成大矩形 ➔ (首项 + 末项) × 项数 ÷ 2 📐
    </text>
  `;

  return svg;
}

/**
 * 6. 几何割补平移周长动图：凹陷边向外平移对齐，凹形瞬间平移还原为标准大长方形
 */
function renderPerimeterAreaAnimation() {
  const svg = createMotionSvg("0 0 360 170");

  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 凹陷多边形主体 -->
    <g transform="translate(70, 25)">
      <!-- 基础固定外框边 -->
      <path d="M 30 15 L 30 95 L 170 95 L 170 55" fill="none" stroke="#38bdf8" stroke-width="3" />
      
      <!-- 凹进去的垂直边（动态向右平移对齐到外边界） -->
      <line class="motion-shift-vertical" x1="100" y1="15" x2="100" y2="55" stroke="#f43f5e" stroke-width="3" />
      <text class="motion-tag-v" x="80" y="40" fill="#f43f5e" font-size="11" font-weight="bold">向右推 ➔</text>
      
      <!-- 凹进去的水平边（动态向上平移对齐到顶边界） -->
      <line class="motion-shift-horizontal" x1="100" y1="55" x2="170" y2="55" stroke="#f5d06f" stroke-width="3" />
      <text class="motion-tag-h" x="135" y="75" fill="#f5d06f" font-size="11" font-weight="bold">向上弹 ⬆</text>

      <!-- 目标还原的完整长方形虚线轮廓 -->
      <rect class="motion-perfect-rect" x="30" y="15" width="140" height="80" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5,4" />
    </g>

    <text x="180" y="146" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      凹边向外平移 ➔ 周长等同于标准矩形 (长+宽)×2 📐
    </text>
  `;

  return svg;
}

/**
 * 7. 容斥与集合动图：两个半透明圆滑动重叠，交叉阴影脉冲警告“算了两次”，剔除一份
 */
function renderVennAnimation() {
  const svg = createMotionSvg("0 0 360 170");

  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 集合A -->
    <g class="motion-venn-circle motion-venn--a" transform="translate(130, 70)">
      <circle cx="0" cy="0" r="48" fill="rgba(56, 189, 248, 0.3)" stroke="#38bdf8" stroke-width="2" />
      <text x="-24" y="5" fill="#e0f2fe" font-size="13" font-weight="bold" text-anchor="middle">集合 A</text>
    </g>

    <!-- 集合B -->
    <g class="motion-venn-circle motion-venn--b" transform="translate(230, 70)">
      <circle cx="0" cy="0" r="48" fill="rgba(245, 208, 111, 0.3)" stroke="#f5d06f" stroke-width="2" />
      <text x="24" y="5" fill="#fef08a" font-size="13" font-weight="bold" text-anchor="middle">集合 B</text>
    </g>

    <!-- 重叠交集高亮与动态剔除警告 -->
    <g class="motion-venn-overlap" transform="translate(180, 70)">
      <ellipse cx="0" cy="0" rx="18" ry="32" fill="rgba(244, 63, 94, 0.4)" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,2" />
      <text x="0" y="-38" fill="#f43f5e" font-size="11" font-weight="bold" text-anchor="middle">⚠️ 重合算了2次！</text>
      <text x="0" y="5" fill="#fecdd3" font-size="11" font-weight="bold" text-anchor="middle">A∩B</text>
      <text x="0" y="44" fill="#f43f5e" font-size="11" font-weight="bold" text-anchor="middle">必须扣除 - 1次</text>
    </g>

    <text x="180" y="148" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      总数 = 集合A + 集合B - 重叠部分 🎯
    </text>
  `;

  return svg;
}

/**
 * 8. 植树与间隔动图：两端插旗，树木一棵棵破土而出，路段编号直观对比
 */
function renderTreePlantingAnimation() {
  const svg = createMotionSvg("0 0 360 170");

  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 道路地面 -->
    <line x1="30" y1="100" x2="330" y2="100" stroke="#475569" stroke-width="4" />

    <!-- 3个间隔段 -->
    <g fill="#94a3b8" font-size="11" font-weight="bold" text-anchor="middle">
      <!-- 段1 -->
      <line x1="45" y1="110" x2="135" y2="110" stroke="#38bdf8" stroke-width="2" />
      <text x="90" y="126" fill="#38bdf8">段 ①</text>
      <!-- 段2 -->
      <line x1="135" y1="110" x2="225" y2="110" stroke="#38bdf8" stroke-width="2" />
      <text x="180" y="126" fill="#38bdf8">段 ②</text>
      <!-- 段3 -->
      <line x1="225" y1="110" x2="315" y2="110" stroke="#38bdf8" stroke-width="2" />
      <text x="270" y="126" fill="#38bdf8">段 ③</text>
    </g>

    <!-- 4棵动态破土而出的树 -->
    <g class="motion-trees">
      <g class="motion-tree motion-tree--1" transform="translate(45, 55)">
        <polygon points="0,30 -12,45 12,45" fill="#10b981" />
        <polygon points="0,15 -10,32 10,32" fill="#34d399" />
        <rect x="-3" y="45" width="6" height="12" fill="#78350f" />
        <text x="0" y="70" fill="#a7f3d0" font-size="10" text-anchor="middle">第1棵</text>
      </g>
      <g class="motion-tree motion-tree--2" transform="translate(135, 55)">
        <polygon points="0,30 -12,45 12,45" fill="#10b981" />
        <polygon points="0,15 -10,32 10,32" fill="#34d399" />
        <rect x="-3" y="45" width="6" height="12" fill="#78350f" />
        <text x="0" y="70" fill="#a7f3d0" font-size="10" text-anchor="middle">第2棵</text>
      </g>
      <g class="motion-tree motion-tree--3" transform="translate(225, 55)">
        <polygon points="0,30 -12,45 12,45" fill="#10b981" />
        <polygon points="0,15 -10,32 10,32" fill="#34d399" />
        <rect x="-3" y="45" width="6" height="12" fill="#78350f" />
        <text x="0" y="70" fill="#a7f3d0" font-size="10" text-anchor="middle">第3棵</text>
      </g>
      <g class="motion-tree motion-tree--4" transform="translate(315, 55)">
        <polygon points="0,30 -12,45 12,45" fill="#10b981" />
        <polygon points="0,15 -10,32 10,32" fill="#34d399" />
        <rect x="-3" y="45" width="6" height="12" fill="#78350f" />
        <text x="0" y="70" fill="#a7f3d0" font-size="10" text-anchor="middle">第4棵</text>
      </g>
    </g>

    <text x="180" y="152" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">
      两端都栽：3 个间隔段 ➔ 需种 4 棵树 (棵数 = 段数 + 1) 🌲
    </text>
  `;

  return svg;
}

/**
 * 9. 倒推逆运算动图：传送带倒流，+ 变 -，× 变 ÷
 */
function renderReverseThinkingAnimation() {
  const svg = createMotionSvg("0 0 360 170");

  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 正向箭头 -->
    <g transform="translate(40, 45)">
      <rect x="0" y="0" width="40" height="24" rx="4" fill="#334155" />
      <text x="20" y="16" fill="#94a3b8" font-size="11" text-anchor="middle">起点？</text>
      
      <text x="56" y="17" fill="#64748b" font-size="12">➔ +5 ➔</text>
      
      <rect x="105" y="0" width="40" height="24" rx="4" fill="#334155" />
      <text x="125" y="16" fill="#94a3b8" font-size="11" text-anchor="middle">过程</text>
      
      <text x="160" y="17" fill="#64748b" font-size="12">➔ ×2 ➔</text>
      
      <rect x="210" y="0" width="45" height="24" rx="4" fill="#38bdf8" />
      <text x="232" y="16" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">终点 30</text>
    </g>

    <!-- 逆向倒退回溯动效 (金色发光反转) -->
    <g class="motion-reverse-stream" transform="translate(40, 95)">
      <rect x="210" y="0" width="45" height="24" rx="4" fill="#f5d06f" />
      <text x="232" y="16" fill="#78350f" font-size="11" font-weight="bold" text-anchor="middle">从 30</text>

      <text x="160" y="17" fill="#f5d06f" font-size="13" font-weight="bold">⬅ ÷2 ⬅</text>

      <rect x="105" y="0" width="40" height="24" rx="4" fill="#f5d06f" />
      <text x="125" y="16" fill="#78350f" font-size="11" font-weight="bold" text-anchor="middle">得 15</text>

      <text x="56" y="17" fill="#f5d06f" font-size="13" font-weight="bold">⬅ -5 ⬅</text>

      <rect class="motion-pulse-target" x="0" y="0" width="40" height="24" rx="4" fill="#10b981" />
      <text x="20" y="16" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">真相 10</text>
    </g>

    <text x="180" y="148" fill="#f5d06f" font-size="12" font-weight="bold" text-anchor="middle">
      时光倒流反向算：加变减，乘变除，步步还原！⏪
    </text>
  `;

  return svg;
}

/**
 * 10. 等量天平代换动图：左右拿掉相同物品保持平衡
 */
function renderBalanceAnimation() {
  const svg = createMotionSvg("0 0 360 170");

  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 支架底座 -->
    <polygon points="180,65 170,120 190,120" fill="#475569" />
    <circle cx="180" cy="65" r="5" fill="#f5d06f" />

    <!-- 天平横梁 (微动平衡) -->
    <g class="motion-balance-beam">
      <line x1="80" y1="65" x2="280" y2="65" stroke="#f5d06f" stroke-width="4" stroke-linecap="round" />
      
      <!-- 左盘 -->
      <line x1="80" y1="65" x2="80" y2="95" stroke="#94a3b8" stroke-width="1.5" />
      <path d="M 50 95 Q 80 110 110 95 Z" fill="#334155" />
      <!-- 左盘物品 (1星 + 1圆) -->
      <circle cx="70" cy="88" r="8" fill="#38bdf8" />
      <polygon points="90,80 93,87 100,87 94,92 97,99 90,94 83,99 86,92 80,87 87,87" fill="#f43f5e" />

      <!-- 右盘 -->
      <line x1="280" y1="65" x2="280" y2="95" stroke="#94a3b8" stroke-width="1.5" />
      <path d="M 250 95 Q 280 110 310 95 Z" fill="#334155" />
      <!-- 右盘物品 (3圆 + 1星) -->
      <circle cx="265" cy="88" r="8" fill="#38bdf8" />
      <circle cx="280" cy="88" r="8" fill="#38bdf8" />
      <polygon points="295,80 298,87 305,87 299,92 302,99 295,94 288,99 291,92 285,87 292,87" fill="#f43f5e" />
    </g>

    <!-- 动态移除相同物品指示 -->
    <g class="motion-remove-pair">
      <line x1="90" y1="78" x2="90" y2="100" stroke="#f43f5e" stroke-width="2" />
      <line x1="295" y1="78" x2="295" y2="100" stroke="#f43f5e" stroke-width="2" />
      <text x="180" y="40" fill="#f5d06f" font-size="11" font-weight="bold" text-anchor="middle">两边同时拿掉相同的【⭐】</text>
    </g>

    <text x="180" y="148" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      等量代换：消去相同未知项 ➔ 1星 = 2圆 ⚖️
    </text>
  `;

  return svg;
}

/**
 * 11. 特征识别与找规律动图：数字阶梯跳跃，光芒弧线标示规律步长 +4，问号框破晓揭晓
 */
function renderPatternsAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 序列基准线 -->
    <line x1="20" y1="110" x2="340" y2="110" stroke="#334155" stroke-width="2" stroke-dasharray="6,4" />

    <!-- 数字方块组 -->
    <!-- 项1: 3 -->
    <g transform="translate(30, 75)">
      <rect x="0" y="0" width="38" height="34" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
      <text x="19" y="22" fill="#38bdf8" font-size="15" font-weight="bold" text-anchor="middle">3</text>
    </g>

    <!-- 跳跃弧线 1: +4 -->
    <path class="motion-pattern-hop motion-pattern-hop--1" d="M 49 70 Q 75 25 101 70" fill="none" stroke="#38bdf8" stroke-width="2" />
    <text x="75" y="38" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">+4</text>

    <!-- 项2: 7 -->
    <g transform="translate(85, 75)">
      <rect x="0" y="0" width="38" height="34" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
      <text x="19" y="22" fill="#38bdf8" font-size="15" font-weight="bold" text-anchor="middle">7</text>
    </g>

    <!-- 跳跃弧线 2: +4 -->
    <path class="motion-pattern-hop motion-pattern-hop--2" d="M 104 70 Q 130 25 156 70" fill="none" stroke="#38bdf8" stroke-width="2" />
    <text x="130" y="38" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">+4</text>

    <!-- 项3: 11 -->
    <g transform="translate(140, 75)">
      <rect x="0" y="0" width="38" height="34" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
      <text x="19" y="22" fill="#38bdf8" font-size="15" font-weight="bold" text-anchor="middle">11</text>
    </g>

    <!-- 跳跃弧线 3: +4 -->
    <path class="motion-pattern-hop motion-pattern-hop--3" d="M 159 70 Q 185 25 211 70" fill="none" stroke="#38bdf8" stroke-width="2" />
    <text x="185" y="38" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">+4</text>

    <!-- 项4: 15 -->
    <g transform="translate(195, 75)">
      <rect x="0" y="0" width="38" height="34" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
      <text x="19" y="22" fill="#38bdf8" font-size="15" font-weight="bold" text-anchor="middle">15</text>
    </g>

    <!-- 关键跳跃弧线 4 (金色聚光灯): +4 步长 -->
    <path class="motion-pattern-hop motion-pattern-hop--target" d="M 214 70 Q 248 18 282 70" fill="none" stroke="#f5d06f" stroke-width="3" stroke-dasharray="4,2" />
    <text x="248" y="32" fill="#fef08a" font-size="12" font-weight="bold" text-anchor="middle">步长 +4</text>

    <!-- 目标未知项 (动态破晓显形 19) -->
    <g class="motion-pattern-target" transform="translate(265, 70)">
      <rect x="0" y="0" width="46" height="42" rx="8" fill="rgba(245, 208, 111, 0.2)" stroke="#f5d06f" stroke-width="2.5" />
      <text class="motion-pattern-target__q" x="23" y="28" fill="#fef08a" font-size="18" font-weight="bold" text-anchor="middle">?</text>
      <text class="motion-pattern-target__ans" x="23" y="28" fill="#10b981" font-size="18" font-weight="bold" text-anchor="middle">19</text>
    </g>

    <text x="180" y="148" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      识别特征：步长稳定增加 4 ➔ 15 + 4 = 19 🔍
    </text>
  `;
  return svg;
}

/**
 * 12. 凑整拆补动图：两个分散数字在磁场引力下相向滑动吸附，融合为金色整百光柱
 */
function renderQuickCalculationAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 运算表达式提示 -->
    <text x="180" y="30" fill="#94a3b8" font-size="11" text-anchor="middle">
      原式：356 + <tspan fill="#38bdf8">28</tspan> + <tspan fill="#f5d06f">72</tspan>
    </text>

    <!-- 磁力吸附两极方块 -->
    <!-- 左极方块 (28) -->
    <g class="motion-snap-left" transform="translate(60, 52)">
      <rect x="0" y="0" width="60" height="38" rx="6" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2" />
      <text x="30" y="24" fill="#38bdf8" font-size="16" font-weight="bold" text-anchor="middle">28</text>
      <text x="30" y="-6" fill="#38bdf8" font-size="10" text-anchor="middle">互补数 🧲</text>
    </g>

    <!-- 中间磁力引力线 -->
    <g class="motion-magnetic-flux">
      <path d="M 125 71 Q 180 50 235 71" fill="none" stroke="#f5d06f" stroke-width="2" stroke-dasharray="4,3" />
      <path d="M 125 71 Q 180 92 235 71" fill="none" stroke="#f5d06f" stroke-width="2" stroke-dasharray="4,3" />
      <text x="180" y="76" fill="#fef08a" font-size="14" font-weight="bold" text-anchor="middle">⚡</text>
    </g>

    <!-- 右极方块 (72) -->
    <g class="motion-snap-right" transform="translate(240, 52)">
      <rect x="0" y="0" width="60" height="38" rx="6" fill="rgba(245, 208, 111, 0.2)" stroke="#f5d06f" stroke-width="2" />
      <text x="30" y="24" fill="#f5d06f" font-size="16" font-weight="bold" text-anchor="middle">72</text>
      <text x="30" y="-6" fill="#f5d06f" font-size="10" text-anchor="middle">🧲 互补数</text>
    </g>

    <!-- 融合后的整百金条能量块 (脉冲爆发) -->
    <g class="motion-snap-result" transform="translate(130, 52)">
      <rect x="0" y="0" width="100" height="38" rx="8" fill="#f5d06f" stroke="#fef08a" stroke-width="2" />
      <text x="50" y="25" fill="#78350f" font-size="16" font-weight="bold" text-anchor="middle">= 100 整数</text>
    </g>

    <text x="180" y="146" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">
      凑整结合：(28 + 72 = 100) ➔ 356 + 100 = 456 口算秒解 🎯
    </text>
  `;
  return svg;
}

/**
 * 13. 有序分类动图：主基准分枝展开，逐项点亮绿色对勾，严密无遗漏
 */
function renderEnumerationAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 树状分枝穷举 -->
    <!-- 根节点：分类基准 -->
    <g transform="translate(25, 62)">
      <rect x="0" y="0" width="70" height="34" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
      <text x="35" y="22" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">基准排序</text>
    </g>

    <!-- 分枝 1: 类别 A -->
    <path class="motion-tree-stem motion-tree-stem--1" d="M 95 72 C 120 72 130 40 155 40" fill="none" stroke="#64748b" stroke-width="2" />
    <g transform="translate(155, 26)">
      <rect x="0" y="0" width="76" height="28" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
      <text x="38" y="18" fill="#e0f2fe" font-size="11" text-anchor="middle">第①类 (小)</text>
      <text class="motion-tree-check motion-tree-check--1" x="65" y="19" fill="#10b981" font-size="12" font-weight="bold">✔</text>
    </g>

    <!-- 分枝 2: 类别 B -->
    <path class="motion-tree-stem motion-tree-stem--2" d="M 95 79 L 155 79" fill="none" stroke="#64748b" stroke-width="2" />
    <g transform="translate(155, 65)">
      <rect x="0" y="0" width="76" height="28" rx="4" fill="#1e293b" stroke="#f5d06f" stroke-width="1.5" />
      <text x="38" y="18" fill="#fef08a" font-size="11" text-anchor="middle">第②类 (中)</text>
      <text class="motion-tree-check motion-tree-check--2" x="65" y="19" fill="#10b981" font-size="12" font-weight="bold">✔</text>
    </g>

    <!-- 分枝 3: 类别 C -->
    <path class="motion-tree-stem motion-tree-stem--3" d="M 95 86 C 120 86 130 118 155 118" fill="none" stroke="#64748b" stroke-width="2" />
    <g transform="translate(155, 104)">
      <rect x="0" y="0" width="76" height="28" rx="4" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5" />
      <text x="38" y="18" fill="#fecdd3" font-size="11" text-anchor="middle">第③类 (大)</text>
      <text class="motion-tree-check motion-tree-check--3" x="65" y="19" fill="#10b981" font-size="12" font-weight="bold">✔</text>
    </g>

    <!-- 右侧严密核验标识卡 -->
    <g class="motion-enum-summary" transform="translate(255, 36)">
      <rect x="0" y="0" width="85" height="85" rx="8" fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" stroke-width="1.5" />
      <text x="42" y="24" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">不重不漏</text>
      <line x1="12" y1="34" x2="73" y2="34" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2" />
      <text x="42" y="52" fill="#e2e8f0" font-size="10" text-anchor="middle">有序枚举</text>
      <text x="42" y="72" fill="#fef08a" font-size="13" font-weight="bold" text-anchor="middle">覆盖率 100%</text>
    </g>

    <text x="180" y="152" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">
      有序展开：单一基准从小到大 ➔ 穷举全部可能不遗漏 🌲
    </text>
  `;
  return svg;
}

/**
 * 14. 分类与分步加乘计数动图：双级路径网络，光子沿分步线路流动，演示 2 x 3 = 6
 */
function renderAddMultiplyAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 起点 -->
    <circle cx="45" cy="80" r="14" fill="#38bdf8" />
    <text x="45" y="84" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">起点</text>

    <!-- 阶段1: 2 条主路线 (独立分类) -->
    <!-- 上主路 A -->
    <path class="motion-path-light" d="M 59 74 L 140 48" stroke="#38bdf8" stroke-width="2.5" />
    <g transform="translate(140, 36)">
      <rect x="0" y="0" width="55" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
      <text x="27" y="16" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">方案 ①</text>
    </g>

    <!-- 下主路 B -->
    <path class="motion-path-light" d="M 59 86 L 140 112" stroke="#38bdf8" stroke-width="2.5" />
    <g transform="translate(140, 100)">
      <rect x="0" y="0" width="55" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
      <text x="27" y="16" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">方案 ②</text>
    </g>

    <!-- 阶段2: 每路分出 3 个后续步骤 (相继环节) -->
    <!-- 上分支 3 条 -->
    <path d="M 195 48 L 265 28" stroke="#f5d06f" stroke-width="1.5" stroke-dasharray="3,2" />
    <path d="M 195 48 L 265 48" stroke="#f5d06f" stroke-width="1.5" stroke-dasharray="3,2" />
    <path d="M 195 48 L 265 68" stroke="#f5d06f" stroke-width="1.5" stroke-dasharray="3,2" />

    <!-- 下分支 3 条 -->
    <path d="M 195 112 L 265 92" stroke="#f5d06f" stroke-width="1.5" stroke-dasharray="3,2" />
    <path d="M 195 112 L 265 112" stroke="#f5d06f" stroke-width="1.5" stroke-dasharray="3,2" />
    <path d="M 195 112 L 265 132" stroke="#f5d06f" stroke-width="1.5" stroke-dasharray="3,2" />

    <!-- 终点 6 个出口圆点 -->
    <g fill="#10b981">
      <circle cx="270" cy="28" r="4" /><circle cx="270" cy="48" r="4" /><circle cx="270" cy="68" r="4" />
      <circle cx="270" cy="92" r="4" /><circle cx="270" cy="112" r="4" /><circle cx="270" cy="132" r="4" />
    </g>
    <text x="285" y="84" fill="#10b981" font-size="11" font-weight="bold">共 6 种</text>

    <!-- 光子流沿路径动画 -->
    <circle class="motion-photon motion-photon--upper" cx="0" cy="0" r="4" fill="#fef08a" />
    <circle class="motion-photon motion-photon--lower" cx="0" cy="0" r="4" fill="#fef08a" />

    <text x="180" y="152" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      分类相加，分步相乘 ➔ 2 种第一步 × 3 种第二步 = 6 种路径 ⚡
    </text>
  `;
  return svg;
}

/**
 * 15. 单位量归一动图：整体分割为标准基准单份，随后缩放克隆求目标总量
 */
function renderUnitRateAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 第1步：总量平均切成 3 份 -->
    <g transform="translate(30, 30)">
      <text x="0" y="16" fill="#94a3b8" font-size="11">已知总量：</text>
      <!-- 3个小箱子组合 -->
      <g transform="translate(70, 0)">
        <rect x="0" y="0" width="36" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
        <rect x="40" y="0" width="36" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
        <rect x="80" y="0" width="36" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
        <text x="58" y="16" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">3 份共 18</text>
      </g>
    </g>

    <!-- 动态向下箭头：求出 1 份标准量 -->
    <g class="motion-unit-isolate" transform="translate(180, 68)">
      <path d="M 0 -8 L 0 8 M -4 4 L 0 8 L 4 4" stroke="#f5d06f" stroke-width="2" />
      <!-- 独立出 1 份基准箱 -->
      <rect x="-45" y="10" width="90" height="26" rx="6" fill="#f5d06f" stroke="#fef08a" stroke-width="2" />
      <text x="0" y="27" fill="#78350f" font-size="12" font-weight="bold" text-anchor="middle">1 份 = 18 ÷ 3 = 6</text>
    </g>

    <!-- 第2步：按目标份数 (5 份) 缩放克隆 -->
    <g class="motion-unit-multiply" transform="translate(45, 118)">
      <text x="0" y="16" fill="#94a3b8" font-size="11">目标 5 份：</text>
      <g transform="translate(65, 0)">
        <rect x="0" y="0" width="30" height="22" rx="3" fill="#10b981" />
        <rect x="34" y="0" width="30" height="22" rx="3" fill="#10b981" />
        <rect x="68" y="0" width="30" height="22" rx="3" fill="#10b981" />
        <rect x="102" y="0" width="30" height="22" rx="3" fill="#10b981" />
        <rect x="136" y="0" width="30" height="22" rx="3" fill="#10b981" />
        <text x="83" y="15" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">5 份 × 6</text>
      </g>
      <text x="245" y="16" fill="#10b981" font-size="13" font-weight="bold">= 30 🎯</text>
    </g>

    <text x="180" y="156" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      先求单一量：18 ÷ 3 = 6 ➔ 目标总量：6 × 5 = 30 份量归一 📏
    </text>
  `;
  return svg;
}

/**
 * 16. 双方案盈亏差额动图：方案一盈余与方案二亏欠对比，双向差额汇聚求份数
 */
function renderSurplusDeficitAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 方案一：每人分 4 个，多出 6 个 (盈) -->
    <g transform="translate(30, 30)">
      <text x="0" y="18" fill="#94a3b8" font-size="11" font-weight="bold">方案① (每人4个)</text>
      <!-- 分配条 -->
      <rect x="110" y="4" width="100" height="18" rx="4" fill="#38bdf8" />
      <text x="160" y="17" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">基准分配量</text>
      <!-- 多出来的盈余 (动态高亮) -->
      <rect class="motion-surplus-glow" x="216" y="4" width="60" height="18" rx="4" fill="#10b981" stroke="#34d399" stroke-width="1.5" />
      <text x="246" y="17" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">盈 +6</text>
    </g>

    <!-- 方案二：每人分 6 个，缺少 4 个 (亏) -->
    <g transform="translate(30, 68)">
      <text x="0" y="18" fill="#94a3b8" font-size="11" font-weight="bold">方案② (每人6个)</text>
      <!-- 分配条 (需要更多) -->
      <rect x="110" y="4" width="166" height="18" rx="4" fill="#38bdf8" />
      <text x="180" y="17" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">单人多要 (6 - 4 = 2)</text>
      <!-- 缺少的亏损虚线框 -->
      <rect class="motion-deficit-pulse" x="240" y="4" width="36" height="18" rx="4" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,2" />
      <text x="258" y="17" fill="#f43f5e" font-size="11" font-weight="bold" text-anchor="middle">亏 -4</text>
    </g>

    <!-- 盈亏差额汇聚对比大括号与动效 -->
    <g class="motion-bracket-merge" transform="translate(140, 96)">
      <!-- 汇总差额 -->
      <path d="M 76 0 L 76 10 L 136 10 L 136 0" fill="none" stroke="#f5d06f" stroke-width="2" />
      <text x="106" y="24" fill="#fef08a" font-size="11" font-weight="bold" text-anchor="middle">总差额 = 6 + 4 = 10 个</text>
    </g>

    <text x="180" y="148" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">
      总差额 ÷ 单差 = 份数 ➔ (6 + 4) ÷ (6 - 4) = 5 人 ⚖️
    </text>
  `;
  return svg;
}

/**
 * 17. 移多补少动图：高柱切下多余顶端，平移落入低柱低洼，金色均值线拉平对齐
 */
function renderAverageAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 地面基准线 -->
    <line x1="40" y1="125" x2="320" y2="125" stroke="#334155" stroke-width="2" />

    <!-- 柱1: 矮柱 (初始高度 30) -->
    <g transform="translate(70, 0)">
      <rect x="0" y="95" width="45" height="30" rx="4" fill="#38bdf8" />
      <text x="22" y="115" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">30</text>
      <!-- 虚线补充槽 (高度 30 ➔ 60) -->
      <rect x="0" y="65" width="45" height="30" rx="4" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,2" />
      <text x="22" y="55" fill="#94a3b8" font-size="10" text-anchor="middle">待补 +30</text>
    </g>

    <!-- 柱2: 中间柱 (高度刚好 60) -->
    <g transform="translate(155, 0)">
      <rect x="0" y="65" width="45" height="60" rx="4" fill="#38bdf8" />
      <text x="22" y="100" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">60</text>
    </g>

    <!-- 柱3: 高柱 (高度 90，基准 60 + 多出 30) -->
    <g transform="translate(240, 0)">
      <rect x="0" y="65" width="45" height="60" rx="4" fill="#38bdf8" />
      <text x="22" y="100" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">60</text>
      <!-- 多出来的顶部 (多出 30，动态切下并平移到柱1) -->
      <g class="motion-bar-excess">
        <rect x="0" y="35" width="45" height="30" rx="4" fill="#f5d06f" stroke="#fef08a" stroke-width="1.5" />
        <text x="22" y="55" fill="#78350f" font-size="11" font-weight="bold" text-anchor="middle">多 30</text>
        <line x1="-5" y1="65" x2="50" y2="65" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,2" />
      </g>
    </g>

    <!-- 平移轨迹弧线 (从高柱顶部滑向矮柱凹槽) -->
    <path class="motion-slice-fall" d="M 240 50 Q 180 15 115 65" fill="none" stroke="#f5d06f" stroke-width="2.5" stroke-dasharray="4,3" />
    <text x="180" y="26" fill="#fef08a" font-size="11" font-weight="bold" text-anchor="middle">移多补少 ➔</text>

    <!-- 金色均值拉平参考线 -->
    <line class="motion-mean-line" x1="45" y1="65" x2="315" y2="65" stroke="#10b981" stroke-width="2" stroke-dasharray="5,3" />
    <text x="325" y="69" fill="#10b981" font-size="11" font-weight="bold">平均线 60</text>

    <text x="180" y="152" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">
      削峰填谷拉平：(30 + 60 + 90) ÷ 3 = 60 🌊
    </text>
  `;
  return svg;
}

/**
 * 18. 最不利原则与抽屉原理动图：最倒霉占满边界后，+1 必现重复
 */
function renderPigeonholeAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 3个抽屉格子 -->
    <g transform="translate(45, 60)">
      <!-- 抽屉 1 -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="75" height="50" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2" />
        <circle cx="37" cy="25" r="10" fill="#38bdf8" />
        <text x="37" y="29" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">1个</text>
        <text x="37" y="-6" fill="#94a3b8" font-size="10" text-anchor="middle">抽屉 ①</text>
      </g>
      <!-- 抽屉 2 (目标抽屉，即将被空降命中) -->
      <g class="motion-target-drawer" transform="translate(95, 0)">
        <rect x="0" y="0" width="75" height="50" rx="6" fill="#1e293b" stroke="#f5d06f" stroke-width="2" />
        <circle cx="25" cy="25" r="10" fill="#38bdf8" />
        <text x="25" y="29" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">1个</text>
        <!-- 动态掉入的第4个钥匙物品 -->
        <circle class="motion-pigeon-drop" cx="50" cy="25" r="10" fill="#f5d06f" stroke="#fef08a" stroke-width="2" />
        <text x="37" y="-6" fill="#fef08a" font-size="10" font-weight="bold" text-anchor="middle">抽屉 ② ⭐</text>
      </g>
      <!-- 抽屉 3 -->
      <g transform="translate(190, 0)">
        <rect x="0" y="0" width="75" height="50" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2" />
        <circle cx="37" cy="25" r="10" fill="#38bdf8" />
        <text x="37" y="29" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">1个</text>
        <text x="37" y="-6" fill="#94a3b8" font-size="10" text-anchor="middle">抽屉 ③</text>
      </g>
    </g>

    <!-- 状态指示 -->
    <text x="180" y="36" fill="#f5d06f" font-size="12" font-weight="bold" text-anchor="middle">
      最不利情况：3 个抽屉各装 1 个 ➔ 必须再抓 +1 个必定重复！
    </text>

    <text x="180" y="148" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      极值保证：4 个物品放入 3 个抽屉 ➔ 至少有 1 个抽屉 ≥ 2 个 🕊️
    </text>
  `;
  return svg;
}

/**
 * 19. 火车过桥动图：列车驶过桥梁，总位移涵盖桥长加列车身长
 */
function renderTrainBridgeAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 铁轨与桥梁 -->
    <line x1="20" y1="100" x2="340" y2="100" stroke="#475569" stroke-width="3" stroke-dasharray="6,4" />
    <!-- 桥面主体 -->
    <g transform="translate(90, 85)">
      <rect x="0" y="0" width="160" height="15" rx="2" fill="#334155" stroke="#64748b" stroke-width="1.5" />
      <line x1="30" y1="15" x2="20" y2="40" stroke="#64748b" stroke-width="4" />
      <line x1="80" y1="15" x2="80" y2="40" stroke="#64748b" stroke-width="4" />
      <line x1="130" y1="15" x2="140" y2="40" stroke="#64748b" stroke-width="4" />
      <text x="80" y="11" fill="#94a3b8" font-size="10" text-anchor="middle">大桥长度 L桥 = 400m</text>
    </g>

    <!-- 动态行进的高铁列车 -->
    <g class="motion-train-drive" transform="translate(30, 72)">
      <rect x="0" y="0" width="70" height="16" rx="4" fill="#38bdf8" />
      <!-- 车头流线 -->
      <polygon points="70,0 80,8 70,16" fill="#38bdf8" />
      <circle cx="15" cy="18" r="3" fill="#0284c7" />
      <circle cx="35" cy="18" r="3" fill="#0284c7" />
      <circle cx="55" cy="18" r="3" fill="#0284c7" />
      <text x="35" y="12" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle">车长 100m</text>
    </g>

    <!-- 总路程大括号 -->
    <path d="M 90 45 L 90 38 L 245 38 L 245 45 M 167 38 L 167 30" fill="none" stroke="#f5d06f" stroke-width="2" />
    <text x="167" y="24" fill="#fef08a" font-size="11" font-weight="bold" text-anchor="middle">
      完全过桥总路程 S = 桥长(400) + 车长(100) = 500m
    </text>

    <text x="180" y="152" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      从车头上桥到车尾完全离桥 ➔ 总位移必须加上车身长度 🚄
    </text>
  `;
  return svg;
}

/**
 * 20. 差值不变量动图：父母与孩子两条时间轴同步推进，年龄差值卡尺恒定不变
 */
function renderAgeAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 父亲时间轴 -->
    <g transform="translate(40, 35)">
      <text x="0" y="16" fill="#94a3b8" font-size="11">父亲年龄：</text>
      <line x1="65" y1="12" x2="280" y2="12" stroke="#334155" stroke-width="3" />
      <!-- 标记点 (动态向前推进) -->
      <g class="motion-timeline-node">
        <circle cx="160" cy="12" r="7" fill="#38bdf8" />
        <text x="160" y="-4" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">36岁</text>
      </g>
    </g>

    <!-- 孩子时间轴 -->
    <g transform="translate(40, 85)">
      <text x="0" y="16" fill="#94a3b8" font-size="11">孩子年龄：</text>
      <line x1="65" y1="12" x2="280" y2="12" stroke="#334155" stroke-width="3" />
      <g class="motion-timeline-node">
        <circle cx="100" cy="12" r="7" fill="#f5d06f" />
        <text x="100" y="30" fill="#f5d06f" font-size="10" font-weight="bold" text-anchor="middle">12岁</text>
      </g>
    </g>

    <!-- 差值恒定卡尺 (锁定 24 岁不变) -->
    <g class="motion-timeline-node" transform="translate(40, 0)">
      <line x1="100" y1="47" x2="160" y2="47" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,2" />
      <rect x="110" y="55" width="80" height="22" rx="4" fill="#10b981" />
      <text x="150" y="70" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">年龄差 = 24 岁</text>
    </g>

    <text x="180" y="152" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">
      差值不变量：不管过去还是未来，两人的年龄差永远守恒 ⏳
    </text>
  `;
  return svg;
}

/**
 * 21. 工程总量化一动图：将整体设为单位 1，多方工效协同汇流
 */
function renderEngineeringAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 总工程量单位 1 容器条 -->
    <g transform="translate(50, 50)">
      <rect x="0" y="0" width="260" height="34" rx="8" fill="#1e293b" stroke="#475569" stroke-width="2" />
      <!-- 动态注入的完成度 (双向协同汇合) -->
      <rect class="motion-flow-fill" x="0" y="0" width="260" height="34" rx="8" fill="rgba(56, 189, 248, 0.25)" />
      <text x="130" y="22" fill="#e2e8f0" font-size="13" font-weight="bold" text-anchor="middle">总工程量 = 单位 1</text>
    </g>

    <!-- 甲工人/水管注入 (工效 1/4) -->
    <g transform="translate(60, 25)">
      <text x="0" y="14" fill="#38bdf8" font-size="11" font-weight="bold">甲工效：1/4 (每天做 1/4)</text>
    </g>

    <!-- 乙工人/水管注入 (工效 1/6) -->
    <g transform="translate(200, 25)">
      <text x="0" y="14" fill="#f5d06f" font-size="11" font-weight="bold">乙工效：1/6</text>
    </g>

    <!-- 协同加和指示 -->
    <g transform="translate(180, 102)">
      <text x="0" y="14" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">
        合作总效率 = 1/4 + 1/6 = 5/12 ⚡
      </text>
    </g>

    <text x="180" y="148" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      合作时间 = 总工程 1 ÷ 合作效率(5/12) = 2.4 天完成 🛠️
    </text>
  `;
  return svg;
}

/**
 * 22. 奇偶特性与不变量动图：成对圆点与单飞点合并配对，奇 + 奇 = 偶
 */
function renderParityDivisibilityAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 奇数 A (5个点: 4成双 + 1单飞) -->
    <g transform="translate(50, 40)">
      <rect x="0" y="0" width="80" height="55" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
      <circle cx="25" cy="20" r="6" fill="#38bdf8" /><circle cx="55" cy="20" r="6" fill="#38bdf8" />
      <circle cx="25" cy="40" r="6" fill="#38bdf8" /><circle cx="55" cy="40" r="6" fill="#38bdf8" />
      <!-- 单飞点 -->
      <circle class="motion-odd-dot-a" cx="80" cy="30" r="7" fill="#f43f5e" />
      <text x="40" y="-8" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">奇数 (余 1)</text>
    </g>

    <!-- 加号与引力指示 -->
    <text x="160" y="72" fill="#f5d06f" font-size="20" font-weight="bold" text-anchor="middle">＋</text>

    <!-- 奇数 B (3个点: 2成双 + 1单飞) -->
    <g transform="translate(190, 40)">
      <rect x="0" y="0" width="80" height="55" rx="6" fill="#1e293b" stroke="#f5d06f" stroke-width="1.5" />
      <circle cx="25" cy="28" r="6" fill="#f5d06f" /><circle cx="55" cy="28" r="6" fill="#f5d06f" />
      <!-- 单飞点 -->
      <circle class="motion-odd-dot-b" cx="0" cy="28" r="7" fill="#f43f5e" />
      <text x="40" y="-8" fill="#f5d06f" font-size="11" font-weight="bold" text-anchor="middle">奇数 (余 1)</text>
    </g>

    <!-- 配对成功指示 (单飞点合为完整偶数对) -->
    <g transform="translate(160, 110)">
      <rect x="-65" y="0" width="130" height="22" rx="4" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="1.5" />
      <text x="0" y="15" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">两个单点配对 ➔ 变偶数！</text>
    </g>

    <text x="180" y="152" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      奇偶守恒律：奇 + 奇 = 偶；奇 + 偶 = 奇 ➔ 快速判断可能性 🔢
    </text>
  `;
  return svg;
}

/**
 * 23. 网格矩阵排除动图：二维真值表逐个盖红叉，锁定唯一真相对勾
 */
function renderGeneralLogicAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 逻辑矩阵表格 -->
    <g transform="translate(70, 25)">
      <!-- 表头 -->
      <text x="65" y="14" fill="#94a3b8" font-size="10" text-anchor="middle">红队</text>
      <text x="115" y="14" fill="#94a3b8" font-size="10" text-anchor="middle">蓝队</text>
      <text x="165" y="14" fill="#94a3b8" font-size="10" text-anchor="middle">绿队</text>

      <!-- 行 1: 甲 -->
      <text x="20" y="38" fill="#94a3b8" font-size="10" text-anchor="middle">小明</text>
      <rect x="45" y="22" width="40" height="24" fill="#1e293b" stroke="#334155" />
      <text class="motion-cross-stamp" x="65" y="39" fill="#f43f5e" font-size="14" font-weight="bold" text-anchor="middle">❌</text>
      <rect x="95" y="22" width="40" height="24" fill="#1e293b" stroke="#334155" />
      <!-- 正确结论锁定点 -->
      <g class="motion-check-glow">
        <rect x="145" y="22" width="40" height="24" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="2" />
        <text x="165" y="39" fill="#10b981" font-size="16" font-weight="bold" text-anchor="middle">✔</text>
      </g>

      <!-- 行 2: 乙 -->
      <text x="20" y="66" fill="#94a3b8" font-size="10" text-anchor="middle">小华</text>
      <rect x="45" y="50" width="40" height="24" fill="#1e293b" stroke="#334155" />
      <text class="motion-cross-stamp" x="65" y="67" fill="#f43f5e" font-size="14" font-weight="bold" text-anchor="middle">❌</text>
      <rect x="95" y="50" width="40" height="24" fill="#1e293b" stroke="#334155" />
      <rect x="145" y="50" width="40" height="24" fill="#1e293b" stroke="#334155" />
      <text class="motion-cross-stamp" x="165" y="67" fill="#f43f5e" font-size="14" font-weight="bold" text-anchor="middle">❌</text>
    </g>

    <!-- 排除提示 -->
    <text x="180" y="122" fill="#f5d06f" font-size="11" font-weight="bold" text-anchor="middle">
      线索冲突排除 ➔ 锁定小明只能是【绿队】！
    </text>

    <text x="180" y="150" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      矩阵排除法：在真值表中排除所有不可能，剩下的就是唯一真相 🧩
    </text>
  `;
  return svg;
}

/**
 * 24. 质因数分解与短除法动图：阶梯试除、左竖列最大公因数光轨、L型最小公倍数光轨
 */
function renderFactorsMultiplesAnimation() {
  const svg = createMotionSvg("0 0 360 170");
  svg.innerHTML = `
    <rect width="360" height="170" rx="8" fill="#131b2e" />
    
    <!-- 左半区：短除阶梯 (24 与 36) -->
    <g transform="translate(18, 16)">
      <!-- 阶梯 1: 除以 2 -->
      <path class="motion-ladder-bracket" d="M 32 10 L 32 26 L 105 26" stroke="#38bdf8" stroke-width="2" fill="none" />
      <text x="24" y="22" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="end">2</text>
      <text x="44" y="22" fill="#f8fafc" font-size="12" font-weight="bold">24   36</text>

      <!-- 阶梯 2: 除以 2 -->
      <path class="motion-ladder-bracket" d="M 32 30 L 32 46 L 105 46" stroke="#38bdf8" stroke-width="2" fill="none" />
      <text x="24" y="42" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="end">2</text>
      <text x="44" y="42" fill="#f8fafc" font-size="12" font-weight="bold">12   18</text>

      <!-- 阶梯 3: 除以 3 -->
      <path class="motion-ladder-bracket" d="M 32 50 L 32 66 L 105 66" stroke="#38bdf8" stroke-width="2" fill="none" />
      <text x="24" y="62" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="end">3</text>
      <text x="44" y="62" fill="#f8fafc" font-size="12" font-weight="bold"> 6    9</text>

      <!-- 底行：互质商 2 和 3 -->
      <text x="44" y="82" fill="#22c55e" font-size="13" font-weight="bold"> 2    3</text>
      
      <!-- 互质微标签 -->
      <rect x="75" y="72" width="46" height="14" rx="7" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" stroke-width="1" />
      <text x="98" y="83" fill="#22c55e" font-size="8" font-weight="bold" text-anchor="middle">✔ 互质停</text>

      <!-- 动态高亮 1: 左竖列 GCD 光轨 -->
      <rect class="motion-gcd-glow" x="8" y="8" width="22" height="60" rx="4" fill="rgba(56, 189, 248, 0.18)" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,2" />

      <!-- 动态高亮 2: L型 LCM 光轨 -->
      <path class="motion-lcm-loop-glow" d="M 6 8 L 6 90 L 72 90" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,3" fill="none" />
    </g>

    <!-- 右半区：数学原理分解卡片 -->
    <g transform="translate(150, 14)">
      <!-- GCD 卡片 -->
      <rect x="0" y="0" width="195" height="42" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2" />
      <text x="8" y="16" fill="#38bdf8" font-size="11" font-weight="bold">🔵 最大公因数 (GCD)：左竖列乘积</text>
      <text x="8" y="32" fill="#f8fafc" font-size="11" font-family="monospace">2 × 2 × 3 = <tspan fill="#38bdf8" font-weight="bold">12</tspan> <tspan fill="#94a3b8" font-size="9">（公有交集）</tspan></text>

      <!-- LCM 卡片 -->
      <rect x="0" y="48" width="195" height="42" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.2" />
      <text x="8" y="64" fill="#f59e0b" font-size="11" font-weight="bold">🟡 最小公倍数 (LCM)：“L”型回路连乘</text>
      <text x="8" y="80" fill="#f8fafc" font-size="10" font-family="monospace">12 × 2 × 3 = <tspan fill="#22c55e" font-weight="bold">72</tspan> <tspan fill="#94a3b8" font-size="9">（完全并集）</tspan></text>

      <!-- 恒等式条 -->
      <rect x="0" y="96" width="195" height="24" rx="4" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1" />
      <text x="97" y="112" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">✨ 24 × 36 = 12 × 72 = 864 恒等自检</text>
    </g>

    <!-- 底部结论口诀 -->
    <text x="180" y="154" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">
      短除法口诀：除到互质为止，半边相乘是公因数，一圈相乘是公倍数 🔢
    </text>
  `;
  return svg;
}

/**
 * 渲染趣味动态动图卡片组件
 * @param {Object} hint - 题型或模块提示
 * @param {Object} options - 可选配置 (title, compact, autoplay)
 */
export function renderMotionCard(hint = {}, options = {}) {
  const model = matchMotionModel(hint);
  const card = document.createElement("div");
  card.className = `knowledge-motion-card ${options.compact ? "knowledge-motion-card--compact" : ""}`;
  card.dataset.motionModelId = model.id;

  // 1. 顶部极简标题与思维火花
  const header = document.createElement("div");
  header.className = "knowledge-motion-card__header";
  
  const title = document.createElement("strong");
  title.className = "knowledge-motion-card__title";
  title.textContent = `🎬 ${options.title || model.title}`;
  header.append(title);

  const spark = document.createElement("span");
  spark.className = "knowledge-motion-card__spark";
  spark.textContent = model.spark;
  header.append(spark);

  card.append(header);

  // 2. 核心 SVG 动态演示画板
  const visualWrapper = document.createElement("div");
  visualWrapper.className = "knowledge-motion-card__viewport";

  let svgElement = null;
  switch (model.type) {
    case "patterns": svgElement = renderPatternsAnimation(); break;
    case "quick-calculation": svgElement = renderQuickCalculationAnimation(); break;
    case "arithmetic-series": svgElement = renderArithmeticSeriesAnimation(); break;
    case "periodicity": svgElement = renderPeriodicityAnimation(); break;
    case "enumeration": svgElement = renderEnumerationAnimation(); break;
    case "add-multiply-principle": svgElement = renderAddMultiplyAnimation(); break;
    case "venn-diagram": svgElement = renderVennAnimation(); break;
    case "sum-diff": svgElement = renderSumDiffAnimation(); break;
    case "unit-rate": svgElement = renderUnitRateAnimation(); break;
    case "surplus-deficit": svgElement = renderSurplusDeficitAnimation(); break;
    case "chicken-rabbit": svgElement = renderChickenRabbitAnimation(); break;
    case "average": svgElement = renderAverageAnimation(); break;
    case "pigeonhole-principle": svgElement = renderPigeonholeAnimation(); break;
    case "train-bridge": svgElement = renderTrainBridgeAnimation(); break;
    case "age": svgElement = renderAgeAnimation(); break;
    case "engineering": svgElement = renderEngineeringAnimation(); break;
    case "perimeter-area": svgElement = renderPerimeterAreaAnimation(); break;
    case "encounter-chasing": svgElement = renderEncounterChasingAnimation(); break;
    case "tree-planting": svgElement = renderTreePlantingAnimation(); break;
    case "reverse-thinking": svgElement = renderReverseThinkingAnimation(); break;
    case "equation-balance": svgElement = renderBalanceAnimation(); break;
    case "parity-divisibility": svgElement = renderParityDivisibilityAnimation(); break;
    case "factors-multiples": svgElement = renderFactorsMultiplesAnimation(); break;
    case "general-logic": svgElement = renderGeneralLogicAnimation(); break;
    default: svgElement = renderPatternsAnimation(); break;
  }
  visualWrapper.append(svgElement);
  card.append(visualWrapper);

  // 3. 极简公式胶囊
  const formulaPill = document.createElement("div");
  formulaPill.className = "knowledge-motion-card__formula-pill";
  formulaPill.innerHTML = `<strong>核心公式：</strong><code>${model.formula}</code>`;
  card.append(formulaPill);

  return card;
}

/**
 * 渲染极简三拍复盘卡片（圈已知、动手算、秒懂诀、避坑雷区）
 * 彻底替换原有的段落文字说教
 */
export function renderMinimalTacticalCard(review = {}, question = {}) {
  const container = document.createElement("div");
  container.className = "minimal-tactical-board";

  // 1. 插入该题型专属趣味动图
  const motionCard = renderMotionCard(
    {
      methodId: question.thinkingMethodId || review.method,
      moduleId: question.moduleId,
      questionId: question.id,
      prompt: question.prompt,
      method: review.method,
      title: question.title,
      thinkingMethodLabel: question.thinkingMethodLabel
    },
    { compact: true, title: `${question.thinkingMethodLabel || "核心解题模型"} · 动图演示` }
  );
  container.append(motionCard);

  // 2. 极简三拍流程卡片
  const stepsGrid = document.createElement("div");
  stepsGrid.className = "minimal-tactical-beats";

  // 第1拍：🎯 圈已知
  const beat1 = document.createElement("div");
  beat1.className = "tactical-beat-card tactical-beat--observe";
  beat1.innerHTML = `
    <div class="tactical-beat__tag">🎯 第1拍 · 圈已知</div>
    <div class="tactical-beat__content">${review.observation || "快速找出题目中的总数与核心变量"}</div>
  `;
  stepsGrid.append(beat1);

  // 第2拍：⚡ 动手算
  const beat2 = document.createElement("div");
  beat2.className = "tactical-beat-card tactical-beat--calculate";
  beat2.innerHTML = `
    <div class="tactical-beat__tag">⚡ 第2拍 · 动手算</div>
    <div class="tactical-beat__calc"><code>${review.calculation || review.answer || "套用模型一步计算"}</code></div>
  `;
  stepsGrid.append(beat2);

  // 第3拍：💡 验结果
  const beat3 = document.createElement("div");
  beat3.className = "tactical-beat-card tactical-beat--verify";
  beat3.innerHTML = `
    <div class="tactical-beat__tag">💡 第3拍 · 验结果</div>
    <div class="tactical-beat__content">${review.verification || review.check || "把答案代回题目快速核验"}</div>
  `;
  stepsGrid.append(beat3);

  container.append(stepsGrid);

  // 3. 避坑雷区警示（极简短句）
  if (review.errorTrap || review.pitfall) {
    const trapCard = document.createElement("div");
    trapCard.className = "tactical-pitfall-alert";
    trapCard.innerHTML = `
      <span class="tactical-pitfall__icon">🚨</span>
      <strong class="tactical-pitfall__label">避坑警示：</strong>
      <span class="tactical-pitfall__text">${review.errorTrap || review.pitfall}</span>
    `;
    container.append(trapCard);
  }

  return container;
}

const KnowledgeMotionExplainer = {
  MOTION_MODELS,
  matchMotionModel,
  renderMotionCard,
  renderMinimalTacticalCard
};

if (typeof globalThis !== "undefined") {
  globalThis.KnowledgeMotionExplainer = KnowledgeMotionExplainer;
}

export default KnowledgeMotionExplainer;

