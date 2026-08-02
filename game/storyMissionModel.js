const CHAPTER_SCENES = Object.freeze({
  "chapter-01": Object.freeze({ area: "星光规律花园", locations: ["刻度观测台", "规律温室", "路线灯廊", "补给记录站"] }),
  "chapter-02": Object.freeze({ area: "深海探测行动", locations: ["声呐观测舱", "耐压记录台", "海底补给站", "深潜航线图"] }),
  "chapter-03": Object.freeze({ area: "轨道科学计划", locations: ["轨道观测舱", "数据中继台", "实验记录室", "空间补给廊"] }),
  "chapter-04": Object.freeze({ area: "极地破冰远征", locations: ["冰层测绘台", "破冰船甲板", "极光观测舱", "寒区补给站"] }),
  "chapter-05": Object.freeze({ area: "装甲突击演练", locations: ["装甲校准台", "补给控制舱", "履带检修场", "战术数据室"] }),
  "chapter-06": Object.freeze({ area: "星海数据与概率远征", locations: ["星图采样舱", "概率信号台", "轨道数据穹顶", "量子通信中枢"] }),
  default: Object.freeze({ area: "数学探险营地", locations: ["任务地图台", "补给记录站", "观测帐篷", "路线控制台"] })
});

const VARIANT_LINES = Object.freeze([
  "先锁定关键数据，再发送下一条指令。",
  "把条件整理成清单，完成一次精准校准。",
  "沿着线索逐步推进，确认每一步都没有遗漏。",
  "完成最后核对，让探险路线继续开放。"
]);

const DIFFICULTY_ACTIONS = Object.freeze({
  "基础": "观察",
  "进阶": "校准",
  "提高": "推演",
  "挑战": "攻坚"
});

function stableVariantIndex(module, question = {}) {
  const slot = Math.max(1, Number(question.slot) || 1);
  const id = String(module?.id || "math");
  return [...id].reduce((sum, character) => sum + character.codePointAt(0), slot - 1) % VARIANT_LINES.length;
}

function getStoryMission(module, question = {}) {
  const chapterId = question.chapterId || module?.chapterId || "default";
  const scene = CHAPTER_SCENES[chapterId] || CHAPTER_SCENES.default;
  const variantIndex = stableVariantIndex(module, question);
  const location = scene.locations[variantIndex];
  const action = DIFFICULTY_ACTIONS[question.difficulty] || "探索";
  const topic = module?.title || "数学线索";
  return {
    scene: `${scene.area}·${location}`,
    variantIndex,
    storyBeat: `${scene.area}·${location}：${action}${topic}，${VARIANT_LINES[variantIndex]}`
  };
}

module.exports = { CHAPTER_SCENES, VARIANT_LINES, getStoryMission };
