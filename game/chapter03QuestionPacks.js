const q = (id, title, prompt, answer, explanation) => Object.freeze({ id, title, difficulty: "进阶", prompt, answer: String(answer), explanation });

// 第三章已有完整的十题题库；这些进阶侦察题只补齐统一的 2/3/3/2 难度槽位。
const supplementalQuestionsByModule = Object.freeze({
  "factors-multiples": Object.freeze([q("chapter-03-factors-multiples-advance-1", "轨道编号", "48 的所有因数中，最大的两位数因数是多少？", 48, "48 本身是两位数，也是它最大的因数。")]),
  "ratio-proportion": Object.freeze([q("chapter-03-ratio-proportion-advance-1", "燃料配比", "燃料和冷却液的比是 3∶2，燃料有 18 升，冷却液有多少升？", 12, "3 份是 18 升，1 份是 6 升，2 份是 12 升。")]),
  "pigeonhole-intro": Object.freeze([q("chapter-03-pigeonhole-intro-advance-1", "舱位分配", "11 名研究员分到 3 个实验舱，至少一个实验舱至少有几人？", 4, "11÷3=3……2，所以至少一个舱有 4 人。")]),
  "recurrence-intro": Object.freeze([q("chapter-03-recurrence-intro-advance-1", "信号递推", "信号强度从 2 开始，每次加 3，第三个数是多少？", 8, "第一个是 2，第二个 5，第三个 8。")]),
  "plan-design": Object.freeze([q("chapter-03-plan-design-advance-1", "实验顺序", "实验要先校准、再采样、最后记录。若校准用 2 分钟、采样用 5 分钟、记录用 3 分钟，共需几分钟？", 10, "按顺序相加：2+5+3=10。")]),
  "square-array": Object.freeze([q("chapter-03-square-array-advance-1", "太阳能阵列", "一块正方形太阳能阵列每边排 7 块电池，一共有多少块电池？", 49, "7×7=49。")]),
  "tiered-pricing": Object.freeze([q("chapter-03-tiered-pricing-advance-1", "补给计费", "前 3 千瓦时每千瓦时 2 元，之后 2 千瓦时每千瓦时 3 元，一共多少元？", 12, "前段 3×2=6 元，后段 2×3=6 元，共 12 元。")]),
  "prime-factorization": Object.freeze([q("chapter-03-prime-factorization-advance-1", "核心拆分", "30 分解质因数后，含有几个不同的质因数？", 3, "30=2×3×5，共有 3 个不同质因数。")]),
  "case-analysis-intro": Object.freeze([q("chapter-03-case-analysis-intro-advance-1", "双路线", "任务可以走 A 路 4 千米或 B 路 6 千米，再都走 2 千米到终点。两种路线分别多长？", "6和8", "A 路是 4+2=6 千米，B 路是 6+2=8 千米。")]),
  "work-problems": Object.freeze([q("chapter-03-work-problems-advance-1", "舱外修复", "机器人每小时修复 9 块面板，4 小时修复多少块？", 36, "9×4=36。")]),
  "unitary-method": Object.freeze([q("chapter-03-unitary-method-advance-1", "单份样本", "5 份样本共重 35 克，8 份同样样本重多少克？", 56, "每份 35÷5=7 克，8 份是 7×8=56 克。")]),
  "restoration-problems": Object.freeze([q("chapter-03-restoration-problems-advance-1", "反向还原", "一个数先减 8 再乘 3 得到 30，原来的数是多少？", 18, "30÷3=10，10+8=18。")])
});

module.exports = { supplementalQuestionsByModule };
