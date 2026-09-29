const builder = require("../game/chapterBuilder.js");
const { loadExpandedModules } = require("./validate-game-content.js");
const { CHAPTER_IDS } = require("../game/chapterConfig.js");

const modules = loadExpandedModules();

function auditDetailed() {
  const issues = [];
  for (const chapterId of CHAPTER_IDS) {
    const chapter = builder.buildChapter(chapterId, modules);
    for (const level of chapter.levels) {
      const qList = level.questions;
      const skeletonMap = new Map();
      qList.forEach((q) => {
        const s = q.prompt.replace(/【[^】]+任务】$/g, "").replace(/\d+/g, "N").replace(/[，。？！、\s]/g, "");
        if (!skeletonMap.has(s)) skeletonMap.set(s, []);
        skeletonMap.get(s).push(q);
      });
      for (const [s, list] of skeletonMap.entries()) {
        if (list.length >= 2 && s.length >= 8) {
          issues.push({
            type: "INTRA_LEVEL_REDUNDANT",
            chapterId,
            levelTitle: level.title,
            moduleId: level.moduleId,
            skeleton: s,
            questions: list.map((q) => ({ id: q.id, slot: q.slot, prompt: q.prompt.replace(/【[^】]+任务】$/, ""), answer: q.answer, explanation: q.explanation }))
          });
        }
      }
    }
  }
  return issues;
}

const detailedIssues = auditDetailed();
console.log("详细重复/同质化关卡数:", detailedIssues.length);
detailedIssues.forEach((issue, idx) => {
  console.log(`\n=== 问题 ${idx + 1} [${issue.chapterId} · ${issue.levelTitle} (${issue.moduleId})] 模板 (${issue.questions.length}题): ${issue.skeleton} ===`);
  issue.questions.forEach((q) => {
    console.log(`  [Slot ${q.slot} | ${q.id} | Ans:${q.answer}] ${q.prompt}`);
    console.log(`     解析: ${q.explanation}`);
  });
});
