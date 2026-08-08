const DIFFICULTIES = Object.freeze(["基础", "基础", "进阶", "进阶", "进阶", "提高", "提高", "提高", "挑战", "挑战"]);
const SCENE_PREFIXES = Object.freeze([
  "工坊日志写着：",
  "补给台记录：",
  "地图标记显示：",
  "观察窗发现：",
  "校准表给出：",
  "任务员核对：",
  "仓库清单提示：",
  "路线记录表显示：",
  "综合任务要求：",
  "终点报告需要："
]);

const QUESTION_VARIANT_LEADS = Object.freeze([
  "先把条件记在任务卡上：",
  "先用清单整理已知量：",
  "先在路线图上标出关系：",
  "先比较候选方案再计算：",
  "最后回到现场做一次核验："
]);

const QUESTION_TEMPLATE_FAMILIES = Object.freeze([
  "mission-card",
  "inventory-list",
  "route-map",
  "plan-compare",
  "field-verification"
]);

const n = (index) => index + 2;

function solve(methodId, index) {
  const k = n(index);
  switch (methodId) {
    case "read-conditions": {
      const boxes = k + 2;
      const each = k + 3;
      const spare = k - 1;
      return { text: `有${boxes}箱零件，每箱${each}件，另有${spare}件备用，合计有多少件？`, answer: boxes * each + spare, explanation: `${boxes}×${each}+${spare}=${boxes * each + spare}。` };
    }
    case "draw-bar-model": {
      const sum = 12 + index * 2;
      const difference = 2 + (index % 4) * 2;
      return { text: `两段线段总长${sum}米，较长的一段比短的一段多${difference}米，较长的一段长多少米？`, answer: (sum + difference) / 2, explanation: `较长线段=(${sum}+${difference})÷2=${(sum + difference) / 2}米。` };
    }
    case "diagram-model": {
      const length = 6 + index;
      const width = 3 + (index % 4);
      return { text: `示意图中的长方形花圃长${length}米、宽${width}米，面积是多少平方米？`, answer: length * width, explanation: `面积=${length}×${width}=${length * width}平方米。` };
    }
    case "table-method": {
      const total = 24 + index * 3;
      const first = 5 + index;
      const second = 3 + (index % 4);
      return { text: `表格共记录${total}项，前两类分别有${first}项和${second}项，第三类有多少项？`, answer: total - first - second, explanation: `第三类=${total}-${first}-${second}=${total - first - second}项。` };
    }
    case "enumeration-method": {
      const colors = 2 + (index % 3);
      const badges = 3 + (index % 2);
      return { text: `用${colors}种颜色和${badges}种徽章各选一种，按顺序列举后共有多少种组合？`, answer: colors * badges, explanation: `每种颜色都能配${badges}种徽章，${colors}×${badges}=${colors * badges}种。` };
    }
    case "tree-diagram": {
      const routes = 2 + (index % 3);
      const windows = 3 + (index % 3);
      const modes = 2 + (index % 2);
      return { text: `探测路线有${routes}条、发射窗口有${windows}个、功率档有${modes}种，共有多少种配置？`, answer: routes * windows * modes, explanation: `${routes}×${windows}×${modes}=${routes * windows * modes}种配置。` };
    }
    case "assumption-method": {
      const heads = 8 + index;
      const rabbits = 2 + (index % 5);
      const legs = heads * 2 + rabbits * 2;
      return { text: `农场机器人共有${heads}台，分为两足和四足两类，共有${legs}条腿，四足机器人有多少台？`, answer: rabbits, explanation: `先按全是两足计算${heads}×2=${heads * 2}条腿，多出的${legs - heads * 2}条腿每台多2条，所以四足机器人=${rabbits}台。` };
    }
    case "reverse-thinking": {
      const start = 4 + index;
      const result = start * 2 + 6;
      return { text: `一个数先乘2，再加6，结果是${result}，这个数是多少？`, answer: start, explanation: `倒推：(${result}-6)÷2=${start}。` };
    }
    case "transformation-method": {
      const groups = 3 + (index % 5);
      const perGroup = 4 + (index % 3);
      return { text: `把每组复杂零件替换成等量小片后，${groups}组各有${perGroup}片，共有多少片？`, answer: groups * perGroup, explanation: `等量替换后总数不变，${groups}×${perGroup}=${groups * perGroup}片。` };
    }
    case "unit-method": {
      const packs = 4 + index;
      const each = 5 + (index % 4);
      const total = packs * each;
      return { text: `补给箱中${total}件材料平均装入${packs}个小箱，每箱多少件？`, answer: each, explanation: `单位量=${total}÷${packs}=${each}件。` };
    }
    case "estimation-method": {
      const length = 12 + index * 2;
      const width = 4 + (index % 4);
      return { text: `先估算再精算：一块长${length}米、宽${width}米的地面需要铺多少平方米材料？`, answer: length * width, explanation: `精算面积=${length}×${width}=${length * width}平方米，结果应在约${length * width - width}到${length * width + width}之间。` };
    }
    case "verify-eliminate": {
      const value = 5 + index;
      const target = value * 4 + 3;
      return { text: `验算方程4x+3=${target}的候选结果，x应是多少？`, answer: value, explanation: `4x=${target}-3=${target - 3}，x=${target - 3}÷4=${value}。` };
    }
    case "case-discussion": {
      const morning = 2 + (index % 4);
      const afternoon = 3 + (index % 5);
      const perMorning = 3 + (index % 3);
      return { text: `把任务分成上午和下午两类：上午${morning}组、每组${perMorning}件，下午${afternoon}组、每组2件，共有多少件？`, answer: morning * perMorning + afternoon * 2, explanation: `分情况计算：${morning}×${perMorning}+${afternoon}×2=${morning * perMorning + afternoon * 2}件。` };
    }
    case "parity-invariant": {
      const start = 4 + index;
      const step = 2 + (index % 3) * 2;
      return { text: `从${start}开始，每次增加${step}，连续操作4次，最后的数是多少？`, answer: start + step * 4, explanation: `每次增加${step}，${start}+${step}×4=${start + step * 4}。` };
    }
    case "worst-case": {
      const colors = 3 + (index % 5);
      const targetCount = index < 5 ? 2 : 3;
      const answer = targetCount === 2 ? 1 : colors + 1;
      return {
        text: targetCount === 2
          ? `抽屉中有${colors}种颜色的信标，最不利时先各取到一种，至少再取几个才能保证有两个同色信标？`
          : `抽屉中有${colors}种颜色的信标，最不利时先各取到一种，至少再取几个才能保证有三个同色信标？`,
        answer,
        explanation: targetCount === 2
          ? `先取${colors}个仍可能每种一个，再取1个必与某种同色，所以答案是1个。`
          : `先取${colors}个每种一个，再让每种各多取1个仍可能只有两个同色，最后还要再取1个，所以至少再取${colors}+1=${answer}个。`
      };
    }
    case "recurrence-strategy": {
      const first = 3 + (index % 4);
      const step = 2 + (index % 3);
      return { text: `补给量从第1天的${first}份开始，每天比前一天多${step}份，第6天有多少份？`, answer: first + step * 5, explanation: `递推5次：${first}+${step}×5=${first + step * 5}份。` };
    }
    case "reverse-reasoning": {
      const start = 3 + index;
      const result = (start + 5) * 3;
      return { text: `某批材料先加5再乘3得到${result}，倒推原来有多少份？`, answer: start, explanation: `先逆除：${result}÷3=${start + 5}，再逆减：${start + 5}-5=${start}份。` };
    }
    case "elimination-table": {
      const known = 5 + (index % 6);
      const remainingPerColumn = 4 + (index % 4);
      const total = known + remainingPerColumn * 3;
      return { text: `排除表中总共有${total}个位置，已确定甲占${known}个，剩余位置平均分给3列，每列多少个？`, answer: remainingPerColumn, explanation: `剩余${total}-${known}=${total - known}个，平均每列=${total - known}÷3=${remainingPerColumn}个。` };
    }
    case "scheduling": {
      const a = 12 + index;
      const b = 8 + (index % 5);
      const c = 6 + (index % 4);
      return { text: `统筹安排三项校准任务，分别需要${a}分钟、${b}分钟和${c}分钟，连续完成共需多少分钟？`, answer: a + b + c, explanation: `总时间=${a}+${b}+${c}=${a + b + c}分钟。` };
    }
    case "shortest-path": {
      const horizontal = 4 + index;
      const vertical = 3 + (index % 4);
      return { text: `网格地图上从起点向右走${horizontal}格、向上走${vertical}格才能到终点，最短需要走多少格？`, answer: horizontal + vertical, explanation: `最短步数=${horizontal}+${vertical}=${horizontal + vertical}格。` };
    }
    case "optimal-strategy": {
      const planA = 18 + index * 2;
      const planB = planA - 3 - (index % 4);
      return { text: `两种补给方案效果相同，方案甲耗时${planA}分钟，方案乙耗时${planB}分钟，选择最优方案可节省多少分钟？`, answer: planA - planB, explanation: `节省时间=${planA}-${planB}=${planA - planB}分钟。` };
    }
    case "construction": {
      const length = 5 + index;
      const width = 2 + (index % 4);
      return { text: `构造一个长${length}米、宽${width}米的矩形场地，围一圈需要多少米围栏？`, answer: (length + width) * 2, explanation: `周长=(${length}+${width})×2=${(length + width) * 2}米。` };
    }
    case "contradiction": {
      const groups = 3 + (index % 4);
      const perGroup = 8 + (index % 5);
      const total = groups * perGroup;
      const claim = perGroup - 1;
      return { text: `若把${total}份材料平均分给${groups}组，检查“每组少于${claim}份”的说法是否可能；每组实际有多少份？`, answer: perGroup, explanation: `平均分配：${total}÷${groups}=${perGroup}份；实际数量不小于${claim}份，因此题中的说法不可能成立。` };
    }
    case "integrated-strategy": {
      const teams = 3 + (index % 4);
      const perTeam = 4 + (index % 3);
      const bonus = 2 + (index % 5);
      return { text: `综合任务中有${teams}组，每组完成${perTeam}项，另外完成${bonus}项复核，全部完成多少项？`, answer: teams * perTeam + bonus, explanation: `先分组计算${teams}×${perTeam}=${teams * perTeam}，再加复核${bonus}，共${teams * perTeam + bonus}项。` };
    }
    case "decompose-conditions": {
      const a = 8 + index;
      const b = 5 + (index % 4);
      const c = 3 + (index % 3);
      return { text: `把城市任务拆成三段：第一段完成${a}项，第二段完成${b}项，第三段完成${c}项，共完成多少项？`, answer: a + b + c, explanation: `分段相加：${a}+${b}+${c}=${a + b + c}项。` };
    }
    case "equation-model": {
      const x = 4 + index;
      const extra = 3 + (index % 4);
      const total = x + (x + extra);
      return { text: `两条街区共有${total}盏路灯，第二条比第一条多${extra}盏，第一条有多少盏？`, answer: x, explanation: `设第一条为x，则x+(x+${extra})=${total}，解得x=${x}。` };
    }
    case "ratio-model": {
      const unit = 3 + (index % 5);
      const ratioSum = 5 + (index % 4);
      const total = unit * ratioSum;
      const firstRatio = 2;
      return { text: `一批${total}件物资按${firstRatio}:${ratioSum - firstRatio}分给甲乙两队，甲队得到多少件？`, answer: unit * firstRatio, explanation: `每份=${total}÷${ratioSum}=${unit}件，甲队${unit}×${firstRatio}=${unit * firstRatio}件。` };
    }
    case "change-model": {
      const initial = 20 + index * 2;
      const change = 3 + (index % 5);
      const days = 2 + (index % 4);
      return { text: `能源仓初有${initial}格电量，每天增加${change}格，连续${days}天后有多少格？`, answer: initial + change * days, explanation: `变化后=${initial}+${change}×${days}=${initial + change * days}格。` };
    }
    case "data-decision": {
      const a1 = 10 + index;
      const a2 = 14 + index;
      const b1 = 12 + (index % 3);
      const b2 = 11 + (index % 4);
      return { text: `数据表显示方案甲两天完成${a1}、${a2}项，方案乙完成${b1}、${b2}项，甲比乙多完成多少项？`, answer: a1 + a2 - b1 - b2, explanation: `甲总数${a1}+${a2}=${a1 + a2}，乙总数${b1}+${b2}=${b1 + b2}，相差${a1 + a2 - b1 - b2}项。` };
    }
    case "probability-risk": {
      const total = 6 + index;
      const favorable = 2 + (index % 3);
      return { text: `风险盘有${total}个等可能区域，其中${favorable}个代表安全，随机一次落在安全区的概率是多少？请用分数表示。`, answer: `${favorable}/${total}`, explanation: `安全概率=有利区域数÷总区域数=${favorable}/${total}。` };
    }
    case "geometry-decomposition": {
      const outerLength = 10 + index;
      const outerWidth = 6 + (index % 3);
      const cutLength = 2 + (index % 2);
      const cutWidth = 2;
      return { text: `把长${outerLength}米、宽${outerWidth}米的矩形广场挖去一个长${cutLength}米、宽${cutWidth}米的小矩形，剩余面积是多少平方米？`, answer: outerLength * outerWidth - cutLength * cutWidth, explanation: `大面积${outerLength}×${outerWidth}=${outerLength * outerWidth}，减去${cutLength}×${cutWidth}=${cutLength * cutWidth}，剩${outerLength * outerWidth - cutLength * cutWidth}平方米。` };
    }
    case "motion-model": {
      const speed = 6 + index;
      const time = 3 + (index % 4);
      return { text: `配送车以每分钟${speed}千米的速度行驶${time}分钟，走了多少千米？`, answer: speed * time, explanation: `路程=${speed}×${time}=${speed * time}千米。` };
    }
    case "compare-plans": {
      const fixed = 8 + index;
      const per = 3 + (index % 4);
      const count = 4 + (index % 3);
      return { text: `方案甲固定花费${fixed}枚能量币，另按每项${per}枚完成${count}项；总花费是多少枚？`, answer: fixed + per * count, explanation: `总花费=${fixed}+${per}×${count}=${fixed + per * count}枚。` };
    }
    case "optimization": {
      const budget = 24 + index * 3;
      const cost = 4 + (index % 4);
      return { text: `预算有${budget}枚能量币，每个传感器${cost}枚，最多能完整安装多少个传感器？`, answer: Math.floor(budget / cost), explanation: `${budget}÷${cost}=${Math.floor(budget / cost)}……${budget % cost}，所以最多${Math.floor(budget / cost)}个。` };
    }
    case "result-verification": {
      const a = 7 + index;
      const b = 3 + (index % 5);
      return { text: `用逆向验算检查：一个数量减去${b}后再乘2得到${(a - b) * 2}，原数量是多少？`, answer: a, explanation: `逆向计算：${(a - b) * 2}÷2+${b}=${a}。` };
    }
    case "integrated-modeling": {
      const households = 3 + (index % 4);
      const perHousehold = 5 + (index % 3);
      const shared = 4 + (index % 5);
      return { text: `智慧社区有${households}组家庭，每组需要${perHousehold}份物资，公共服务还需${shared}份，一共需要多少份？`, answer: households * perHousehold + shared, explanation: `家庭物资${households}×${perHousehold}=${households * perHousehold}，加公共服务${shared}，共${households * perHousehold + shared}份。` };
    }
    default:
      throw new Error(`Unknown thinking method: ${methodId}`);
  }
}

function createQuestion(chapterId, moduleId, title, methodId, index) {
  const solved = solve(methodId, index);
  const answerText = String(solved.answer);
  const integerAnswer = /^[-+]?\d+$/.test(answerText);
  return Object.freeze({
    id: `${chapterId}-${moduleId}-${index + 1}`,
    title,
    difficulty: DIFFICULTIES[index],
    answerType: "numeric",
    thinkingMethodId: methodId,
    prompt: `${SCENE_PREFIXES[index]}${QUESTION_VARIANT_LEADS[index % QUESTION_VARIANT_LEADS.length]}【${title}】${solved.text}`,
    answer: answerText,
    explanation: solved.explanation,
    semanticProfile: Object.freeze({
      templateFamily: `${methodId}:${QUESTION_TEMPLATE_FAMILIES[index % QUESTION_TEMPLATE_FAMILIES.length]}`,
      variantId: index % QUESTION_TEMPLATE_FAMILIES.length,
      unit: integerAnswer ? "discrete-count" : "fractional-probability",
      integerAnswer
    })
  });
}

function buildChapterModules(chapterId, topics) {
  return Object.freeze(topics.map(({ id, title, methodId }) => Object.freeze({
    id,
    title,
    thinkingMethodId: methodId,
    practices: Object.freeze(Array.from({ length: 10 }, (_, index) => createQuestion(chapterId, id, title, methodId, index)))
  })));
}

function createPack(chapterId, topics) {
  const chapterModules = buildChapterModules(chapterId, topics);
  return {
    chapterModules,
    supplementalQuestionsByModule: Object.freeze({})
  };
}

module.exports = { DIFFICULTIES, buildChapterModules, createPack, QUESTION_TEMPLATE_FAMILIES };
