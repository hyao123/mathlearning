# 第六章星海数据与概率远征实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有五章游戏框架中新增可解锁的第六章“星海数据与概率远征”，完成 120 道数值题、量子通信卫星奖励链和完整验证。

**Architecture:** 复用声明式章节配置、原生题库注册、材料精炼层、章节奖励与持久化进度；只为第六章增加数据入口、视觉变体和质量表达，不复制运行时流程。第六章使用 `chapter-05` 的 12 关模板，由 `CHAPTER_IDS` 顺序控制章节解锁。

**Tech Stack:** CommonJS 游戏模型、Vite、原生 DOM、Node `node:test`、Playwright。

## Global Constraints

- 第六章 ID 固定为 `chapter-06`，前置章节为 `chapter-05`。
- 12 个专题、每专题 10 道题，全部为数值/分数/百分数自动判定题。
- 题目难度固定为 2 基础、3 进阶、3 提高、2 挑战。
- 终极工程固定为 `quantum-communication-satellite`。
- 保留固定奖励、随机奖励、跳过不发固定奖励、重复通关不重复领取固定奖励和补给挑战规则。
- 不新增商店、装备数值、复杂养成或第七章自动解锁。
- 不重置、覆盖或清理现有未提交改动。

---

### Task 1: 注册第六章路线和题库

**Files:**
- Modify: `game/chapterConfig.js`
- Create: `game/chapter06QuestionPacks.js`
- Modify: `game/chapterBuilder.js`
- Modify: `game/chapterQualityProfiles.js`
- Modify: `game/storyMissionModel.js`
- Test: `tests/chapterBuilder.test.js`, `tests/chapterQualityProfiles.test.js`, `tests/questionAccess.test.js`

**Interfaces:**
- `CHAPTER_IDS` 增加 `chapter-06`，并在 `CHAPTERS` 中注册 12 个 module ID。
- `chapter06QuestionPacks.js` 导出 `{ chapterModules, supplementalQuestionsByModule }`。
- `GameChapterBuilder.buildChapter("chapter-06", modules)` 返回 12 个 level、每关 10 个 question。

- [ ] 添加 `chapter-06` 配置，前置为 `chapter-05`，工程为 `quantum-communication-satellite`。
- [ ] 创建 12 个模块，每个模块提供 10 道含 `id/title/prompt/answer/explanation/difficulty/answerType` 的原创题。
- [ ] 将第六章题库接入原生注册表，并让质量档案使用 `statistics-console` 表达与统计概率 reasoningType。
- [ ] 添加第六章星海观测场景与至少四种稳定 story beat。
- [ ] 先运行 `node --test tests/chapterBuilder.test.js tests/chapterQualityProfiles.test.js tests/questionAccess.test.js`，确认第六章构建和数值答案契约通过。

### Task 2: 增加量子通信卫星奖励数据

**Files:**
- Modify: `game/chapterExpansionData.js`
- Modify: `game/materialProcessingData.js`
- Modify: `game/itemCatalog.js`
- Modify: `game/levelRewardConfig.js`
- Modify: `game/itemVisuals.js`
- Modify: `game/chapterVisualManifest.js`
- Test: `tests/itemCatalog.test.js`, `tests/levelRewardConfig.test.js`, `tests/itemVisuals.test.js`

**Interfaces:**
- `GameItemCatalog.getChapterTheme("chapter-06")` 返回 `quantum-materials` 奖励主题。
- `GameItemCatalog.getSuperProject("chapter-06")` 返回 12 个 `materialRecipes`、12 个 `componentRecipes`、4 个 `partRecipes` 和最终配方。
- `LevelRewardConfig.simulateFullClearCraft("chapter-06")` 的 `canCraftFinal` 必须为 `true`。

- [ ] 添加 11 个星海原材料、12 个组件、4 个大型部件、5 个任务收藏和量子通信卫星。
- [ ] 添加第六章 12 个精炼材料与组件对应关系，所有 ID 和 recipe type 属于 `chapter-06`。
- [ ] 添加章节固定/随机奖励池；固定奖励单独可完成整条合成链。
- [ ] 为全部第六章物品加入视觉入口，量子卫星使用独立的星海通信 SVG 视觉，最终工程优先加载。
- [ ] 运行 `node --test tests/itemCatalog.test.js tests/levelRewardConfig.test.js tests/itemVisuals.test.js`。

### Task 3: 接入章节质量校验和解锁持久化

**Files:**
- Modify: `scripts/validate-game-content.js`
- Modify: `scripts/game-ui-behavior.js`
- Modify: `tests/campaignModel.test.js`
- Modify: `tests/validateGameContent.test.js`
- Modify: `tests/progressionModel.test.js`

**Interfaces:**
- `validateProjectChain("chapter-06")` 返回空错误数组。
- `CampaignModel.createCampaign` 在第五章工程未完成时不解锁第六章，完成后解锁第六章空进度。

- [ ] 扩展全章节数量断言为 6 章，并检查第六章题目数量为 120。
- [ ] 添加第六章奖励链、固定奖励模拟、11 种原材料、视觉清单和任务收藏校验。
- [ ] 验证旧存档迁移后已有物品不变，第六章仅创建空章节状态。
- [ ] 在浏览器测试中覆盖第六章锁定态、解锁态、卫星蓝图、背包精炼和同类奖励合并。

### Task 4: 全量验证与 Demo

**Files:**
- Modify: `README.md`

- [ ] 运行 `npm test`，预期所有单元测试通过。
- [ ] 运行 `npm run check`、`npm run validate:game`、`npm run test:ui`。
- [ ] 运行 `npm run build`、`npm run check:bundle`、`npm run smoke`、`git diff --check`。
- [ ] 确认 `http://127.0.0.1:5174/` 返回 HTTP 200，并反馈用户刷新 Demo 查看第六章。
