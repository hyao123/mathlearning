const fs = require("fs");
const path = require("path");
const { loadExpandedModules } = require("./validate-game-content.js");
const { CHAPTERS } = require("../game/chapterConfig.js");

const modules = loadExpandedModules();

const nativeChapterModules = {};
["chapter-01", "chapter-02", "chapter-03"].forEach((chapterId) => {
  const chapter = CHAPTERS[chapterId];
  nativeChapterModules[chapterId] = chapter.levels.map((level) => {
    const rawModule = modules.find((m) => m.id === level.moduleId);
    if (!rawModule) throw new Error("Missing module: " + level.moduleId);
    return {
      id: rawModule.id,
      title: rawModule.title,
      practices: (rawModule.practices || []).map((p) => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        prompt: p.prompt,
        answer: String(p.answer),
        explanation: p.explanation
      }))
    };
  });
});

const fileContent = `// Generated from the reviewed legacy source modules. Keep only fields required by the playable runtime.\nconst nativeChapterModules = Object.freeze(${JSON.stringify(nativeChapterModules)});\nmodule.exports = { nativeChapterModules };\n`;

const targetPath = path.resolve(__dirname, "../game/nativeQuestionPacks.js");
fs.writeFileSync(targetPath, fileContent, "utf8");
console.log("Updated game/nativeQuestionPacks.js successfully!");
