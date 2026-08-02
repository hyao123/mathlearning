# 题型契约与故事复盘质量升级 Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with tests before production changes.

**Goal:** 修复五章题型契约，并升级 600 道题的故事引导与战术复盘质量，不启动第六章。

**Architecture:** 新增独立的题型契约校验与故事文案模型；章节构建器只负责组合题目、契约、故事和复盘。题目覆盖层负责少量内容改写，保留题目 ID、奖励和进度兼容性。

**Tech Stack:** CommonJS game domain modules, Vite browser entry, Node built-in test runner, Playwright UI tests.

## Global Constraints

- 不改动五章路线、600 道题的数量、奖励账本、章节进度和背包存档键。
- 不启动第六章，不开放商店、装备和数值养成。
- 故事短、稳定、可跳过；数学条件和自动判定优先。
- 生产代码必须先有失败测试，再实现最小改动。

### Task 1: 题型契约模型与失败测试

**Files:**
- Create: `game/questionContract.js`
- Modify: `tests/questionQuality.test.js`
- Modify: `game/questionQuality.js`

**Steps:**

- [ ] 增加测试：数值、分数、小数、百分数答案合法；人物/颜色/是非/解释句非法。
- [ ] 运行 `node --test tests/questionQuality.test.js`，确认新测试失败。
- [ ] 实现 `validateNumericAnswer(answer)` 与 `validateQuestionContract(question)`。
- [ ] 运行同一测试并确认通过。

### Task 2: 修复现有非数值题

**Files:**
- Create: `game/questionContractFixes.js`
- Modify: `game/chapterBuilder.js`
- Modify: `tests/chapterBuilder.test.js`

**Steps:**

- [ ] 增加测试：构建五章后所有题目均为 numeric 且答案含数值。
- [ ] 运行测试确认失败，并输出违规题 ID。
- [ ] 为现有 51 道非数值答案题增加稳定覆盖，将问法改为编号/位置/数量/数值答案。
- [ ] 在 `enrichQuestion` 中应用覆盖并保留原题 ID、difficulty 和 reward 位置。
- [ ] 运行测试确认通过。

### Task 3: 专题故事文案模型

**Files:**
- Create: `game/storyMissionModel.js`
- Modify: `game/chapterQualityProfiles.js`
- Modify: `game/chapterBuilder.js`
- Modify: `tests/chapterQualityProfiles.test.js`

**Steps:**

- [ ] 增加测试：同一专题 10 题至少产生 4 个稳定故事变体，重复构建结果一致。
- [ ] 运行测试确认失败。
- [ ] 实现按 chapter/theme/module/slot 选择场景、动作和任务阶段的纯函数。
- [ ] 用 `storyMissionModel` 生成 `storyBeat`，不修改数学 prompt 主体。
- [ ] 运行测试确认通过。

### Task 4: 分难度战术复盘

**Files:**
- Modify: `game/chapterQualityProfiles.js`
- Modify: `game/questionQuality.js`
- Modify: `tests/questionQuality.test.js`

**Steps:**

- [ ] 增加测试：基础/进阶/提高/Boss 复盘步骤数分别满足 3/4/4/4 的最低结构。
- [ ] 运行测试确认失败。
- [ ] 生成目标、识别关系、计算、检查和易错点结构；保留现有 explanation 作为计算依据。
- [ ] 增加复盘结构校验和答案一致性校验。
- [ ] 运行测试确认通过。

### Task 5: 题目访问与界面契约

**Files:**
- Modify: `game/gameApp.js`
- Modify: `game/questionAccess.js`
- Modify: `tests/questionAccess.test.js`
- Modify: `scripts/game-ui-behavior.js`

**Steps:**

- [ ] 增加测试：数字题只显示输入框，不生成文本选项；未作答不可读复盘字段。
- [ ] 运行测试确认失败。
- [ ] 删除文本答案选择项兜底，统一数字输入与自动聚焦。
- [ ] 保留答错“再试一次 / 跳过”和答对奖励流程。
- [ ] 运行游戏 UI 测试确认通过。

### Task 6: 内容门禁与全量验证

**Files:**
- Modify: `scripts/validate-game-content.js`
- Modify: `tests/validateGameContent.test.js`
- Modify: `README.md`

**Steps:**

- [ ] 增加严格内容校验测试，覆盖 600 题契约、故事变体和复盘结构。
- [ ] 运行测试确认失败。
- [ ] 接入题型契约和复盘校验；更新 README 的五章/600 题说明。
- [ ] 运行 `npm test`、`npm run check`、`npm run validate:game`、`npm run test:game-ui`、`npm run build`、`npm run check:bundle`。
- [ ] 检查 `git diff --check` 和工作区状态。
