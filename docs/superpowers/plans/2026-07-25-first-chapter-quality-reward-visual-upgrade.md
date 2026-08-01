# 首章题目质量、战术复盘、奖励经济与物品视觉升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 `docs/superpowers/specs/2026-07-24-first-chapter-quality-reward-visual-upgrade-design.md`，把第一章 120 题升级为可审认知曲线 + 战术复盘，重构“固定材料 + 随机惊喜”奖励经济，并用 28 张高写实微缩模型图替换抽象物品图标。

**Architecture:** 在现有纯前端本地闯关栈上增量改造：内容源保留完整答案/复盘；运行态只暴露 `challengeQuestion`；判题与复盘走 `judgeAnswer` / `resolveQuestion` / `getResolvedReview` 受控接口。奖励拆成固定领取账本与幂等随机结算；物品视觉通过 `itemVisuals` manifest 接入 WebP，CSS 叠加品质态。现有 `ProgressionModel` 增加 `resolved` 状态机，不再在答对/跳过后立即切题。

**Tech Stack:** 原生 JS (CommonJS + Vite browser bundle)、`node:test` 单元测试、Playwright 行为脚本、本地 content modules（`data.js` + expansions + `game/chapterQuestionPacks.js`）、WebP 静态资源。

## Spec Review（设计审查结论）

### 可直接落地

| 条款 | 结论 | 现有代码落点 |
| --- | --- | --- |
| 12 关 × 10 题 | 已满足 | `chapterConfig.js` + `chapterBuilder.js` |
| 题目字段扩展 + `solutionReview` | 需新增 | practices / supplemental packs 仅有 `explanation` |
| `challengeQuestion` 裁剪 | 需新增 | `toLearnerQuestion` 已裁答案，但仍缺 `learningObjective`/`storyBeat`/`rewardPreview`，且 UI 未用统一接口 |
| 战术复盘默认折叠 | 需新增状态机 | `submitAnswer`/`skipQuestion` 当前直接 `advanceAfterAnswer` |
| 固定材料 + 首次领取账本 | 需重构 | 现 `REWARD_PLANS` 按 slot 混 fixed/random；`rewardedQuestionIds` 仅在本局 run 内 |
| 配方可从空库存模拟 J-20 | 需校验器 | 配方在 `itemCatalog.js`，但缺“120 题固定材料 → 全配方”模拟 |
| 28 物品高写实图 | 需资产 + manifest | 现 `pixel-svg` + 少量 project SVG art |
| 版本迁移 | 需扩展 serialize/hydrate | `math-quest-game-v1` 无 claim ledger / pity / resolved |

### 设计与代码的关键差距

1. **状态流断裂：** 现在答对后立即下一题并弹奖励；spec 要求 `resolved` 停留、可展开复盘、点“继续”才前进。
2. **奖励语义错误：** 现在某些 slot 只有 random、没有固定材料；spec 要求每题固定材料 + 进阶及以上额外随机。
3. **跳过补领未闭环：** 跳过会进 `skippedQuestionIds`，但没有跨局“首次领取记录”；重玩补领需独立 ledger。
4. **阶段提示过乐观：** `gameApp.js` 存在“材料已就绪”类 callout，需改为真实库存判定。
5. **内容质量缺口：** 多数题只有短 `explanation`，无 `slot` 认知任务、无 `solutionReview` 结构、Boss 题工程叙事弱。
6. **物品命名：** 保留现有 28 个 itemId（`oak-log`…`j20-sky-fighter`），不按 spec 示例重命名为 `carbon-fiber`；视觉与配方配置对齐现有 ID。

### 风险与约束

- 静态站点无法把答案从 bundle 中绝对隐藏；验收只要求默认运行态与可见 UI 不提前暴露。
- 120 题重写 + 人工审题是最大工期；计划中先搭校验器与样板关，再按优先级批量改内容。
- 图片资产生成与代码可并行，但 UI 替换必须在 manifest 与兜底图标就绪后进行。
- 旧存档迁移：`hydrate` 必须容忍缺字段，默认 `claimedFixedRewards={}`、`pityEnergy=0`、`resolvedReview=null`。

## Global Constraints

- 知识点仍是关卡骨架，每关严格 10 题；`DIFFICULTY_SLOTS` 难度标签可保留，但题位认知任务以 spec §3 为准。
- 任意答错只显示“再试一次 / 跳过”，不泄露答案或复盘。
- 主线材料确定获得；随机奖励不得进入主线必要配方（`purpose !== "mainline-required"`）。
- 故事情境服务数量关系，禁止装饰性包装。
- 物品图原创高写实微缩模型；禁止 Minecraft/官方 J-20 宣传图等第三方素材。
- 背包、固定领取、幸运能量、关卡与复盘状态支持版本迁移。
- 本轮不开放商店、装备数值、付费、对话/开放世界/战斗、在线出题。
- 测试命令：`npm test`、`npm run validate:game`、`npm run test:game-ui`、`npm run check:bundle`。
- 现有 28 个核心 itemId 保持不变，避免破坏存档。

---

## File Structure

| 文件 | 职责 |
| --- | --- |
| `game/questionAccess.js` | 新建：`toChallengeQuestion`、`judgeAnswer`、`resolveQuestion`、`getResolvedReview` |
| `game/rewardEconomy.js` | 新建：固定领取、随机掉落、幸运能量、连胜箱、`attemptId` 幂等 |
| `game/levelRewardConfig.js` | 新建：每关 10 slot 固定奖励 + 组件/阶段/最终配方串联表与校验 |
| `game/itemVisuals.js` | 新建：28 物品 manifest（src/尺寸/alt/fallback/preload） |
| `game/questionQuality.js` | 新建：结构化字段校验、模板重复启发式、审题记录门槛 |
| `content/humanReview/chapter-01.json` | 新建：120 题人工审题 0/1 记录 |
| `game/progressionModel.js` | 扩展：`resolved` 状态、继续下一题、claim ledger、pity、streak、迁移 |
| `game/chapterBuilder.js` | 扩展：保留/规范化质量字段；构建后校验 |
| `game/itemCatalog.js` | 调整：随机池与固定奖励职责分离；图标默认改读 visuals |
| `game/gameApp.js` / `game/game.css` | UI：复盘折叠、奖励节奏、阶段真实库存、图片图标 |
| `game/chapterQuestionPacks.js` + content modules | 120 题质量升级数据源 |
| `public/assets/items/*.webp` | 28 张高写实物品图 |
| `tests/*.test.js` | 对应单测 |
| `scripts/validate-game-content.js` | 扩展：质量/奖励/配方/审题/visuals 阻断发布 |
| `scripts/game-ui-behavior.js` | 扩展：复盘、泄露、补领、幂等发奖行为 |

---

### Task 1: 受控题目访问层（challengeQuestion / 判题 / 复盘）

**Files:**
- Create: `game/questionAccess.js`
- Create: `tests/questionAccess.test.js`
- Modify: `game/progressionModel.js`（后续 Task 2 接入；本任务仅独立模块）

**Interfaces:**
- Produces:
  - `toChallengeQuestion(fullQuestion, { rewardPreview }) -> challengeQuestion`
  - `judgeAnswer(fullQuestion, userAnswer, answerMatcher) -> { correct: boolean }`（不返回标准答案）
  - `buildSolutionReview(fullQuestion) -> solutionReview | null`
  - `FORBIDDEN_CHALLENGE_KEYS` 常量集合

- [ ] **Step 1: Write the failing test**

```js
// tests/questionAccess.test.js
const assert = require("node:assert/strict");
const test = require("node:test");
const access = require("../game/questionAccess.js");
const matcher = require("../answerMatcher.js");

const full = {
  id: "patterns-03",
  title: "扫描范围",
  prompt: "雷达扫描范围依次为 3、6、12、24 千米，下一轮是多少千米？",
  answer: "48",
  acceptedAnswers: ["48千米"],
  difficulty: "进阶",
  slot: 3,
  learningObjective: "识别倍增规律",
  reasoningType: "观察并归纳",
  difficultyProfile: { steps: 1, conditions: 1, representation: "sequence", direction: "forward", transfer: "direct" },
  storyBeat: "校准逐轮扩大的雷达扫描范围",
  hints: ["看倍数"],
  explanation: "旧字段",
  solutionReview: {
    observation: "相邻两个数都扩大为原来的 2 倍",
    steps: ["6 ÷ 3 = 2，12 ÷ 6 = 2", "24 × 2 = 48"],
    answer: "48 千米",
    check: "48 ÷ 24 = 2，仍符合相同规律",
    pitfall: "不要把它误认为每次增加相同的数"
  }
};

test("toChallengeQuestion strips secrets and keeps learner fields", () => {
  const q = access.toChallengeQuestion(full, { rewardPreview: ["iron-ingot"] });
  assert.equal(q.id, "patterns-03");
  assert.equal(q.learningObjective, "识别倍增规律");
  assert.deepEqual(q.rewardPreview, ["iron-ingot"]);
  for (const key of ["answer", "acceptedAnswers", "hints", "solutionReview", "explanation", "difficultyProfile", "reasoningType"]) {
    assert.equal(Object.hasOwn(q, key), false, key);
  }
});

test("judgeAnswer returns only correctness", () => {
  const ok = access.judgeAnswer(full, "48千米", matcher);
  const bad = access.judgeAnswer(full, "47", matcher);
  assert.deepEqual(ok, { correct: true });
  assert.deepEqual(bad, { correct: false });
  assert.equal(Object.hasOwn(ok, "answer"), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/questionAccess.test.js`  
Expected: FAIL — `Cannot find module '../game/questionAccess.js'`

- [ ] **Step 3: Write minimal implementation**

```js
// game/questionAccess.js
const CHALLENGE_FIELDS = [
  "id", "title", "prompt", "difficulty", "slot", "isBoss",
  "learningObjective", "storyBeat"
];

function toChallengeQuestion(question, options = {}) {
  if (!question || typeof question !== "object") throw new Error("Invalid question");
  const out = {};
  for (const key of CHALLENGE_FIELDS) {
    if (Object.hasOwn(question, key)) out[key] = question[key];
  }
  if (Array.isArray(options.rewardPreview)) out.rewardPreview = [...options.rewardPreview];
  return out;
}

function judgeAnswer(question, userAnswer, answerMatcher) {
  if (!answerMatcher || typeof answerMatcher.isAnswerCorrect !== "function") {
    throw new Error("Answer matcher is required");
  }
  const correct = answerMatcher.isAnswerCorrect(userAnswer, question.answer, {
    acceptedAnswers: question.acceptedAnswers
  });
  return { correct: Boolean(correct) };
}

function buildSolutionReview(question) {
  const review = question?.solutionReview;
  if (!review || typeof review !== "object") return null;
  return {
    observation: review.observation,
    steps: Array.isArray(review.steps) ? [...review.steps] : [],
    answer: review.answer,
    check: review.check,
    pitfall: review.pitfall
  };
}

module.exports = { toChallengeQuestion, judgeAnswer, buildSolutionReview, CHALLENGE_FIELDS };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/questionAccess.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add game/questionAccess.js tests/questionAccess.test.js
git commit -m "feat: add controlled challenge question access layer"
```

---

### Task 2: Progression 增加 `resolved` 状态与继续下一题

**Files:**
- Modify: `game/progressionModel.js`
- Modify: `tests/progressionModel.test.js`

**Interfaces:**
- Consumes: `questionAccess.toChallengeQuestion`, `judgeAnswer`, `buildSolutionReview`
- Produces:
  - `activeRun.status`: `"active" | "retry" | "resolved"`
  - `activeRun.resolved`: `{ questionId, resolution: "correct"|"skipped", attemptId, resolvedAt, advanced: false, reviewExpanded?: boolean }`
  - `continueFromResolved(state) -> state`：清除复盘并前进
  - `getResolvedReview(state) -> solutionReview | null`：仅 `status==="resolved"` 时返回
  - serialize/hydrate 持久化 `resolved`（不含 review 正文）

- [ ] **Step 1: Write the failing tests**

在 `tests/progressionModel.test.js` 追加：

```js
test("correct answer enters resolved without advancing question index", () => {
  const chapter = createChapter();
  let state = model.startLevel(model.createInitialState(chapter), "chapter-01-level-1");
  state = model.submitAnswer(state, getCurrentAnswer(state, chapter), matcher, { random: () => 0, now: () => 1000 });
  assert.equal(state.activeRun.status, "resolved");
  assert.equal(state.activeRun.questionIndex, 0);
  assert.equal(state.activeRun.resolved.resolution, "correct");
  assert.equal(typeof state.activeRun.resolved.attemptId, "string");
  const review = model.getResolvedReview(state);
  assert.ok(review === null || typeof review === "object"); // full questions may lack solutionReview yet
});

test("wrong answer stays retry and never exposes review", () => {
  const chapter = createChapter();
  let state = model.startLevel(model.createInitialState(chapter), "chapter-01-level-1");
  state = model.submitAnswer(state, "wrong", matcher);
  assert.equal(state.activeRun.status, "retry");
  assert.equal(model.getResolvedReview(state), null);
});

test("continueFromResolved advances to next question", () => {
  const chapter = createChapter();
  let state = model.startLevel(model.createInitialState(chapter), "chapter-01-level-1");
  state = model.submitAnswer(state, getCurrentAnswer(state, chapter), matcher, { random: () => 0, now: () => 1 });
  state = model.continueFromResolved(state);
  assert.equal(state.activeRun.status, "active");
  assert.equal(state.activeRun.questionIndex, 1);
  assert.equal(state.activeRun.resolved, null);
});

test("skip enters resolved with skipped resolution and no fixed reward claim", () => {
  const chapter = createChapter();
  let state = model.startLevel(model.createInitialState(chapter), "chapter-01-level-1");
  const beforeInv = { ...state.inventory };
  state = model.skipQuestion(state, { now: () => 2 });
  assert.equal(state.activeRun.status, "resolved");
  assert.equal(state.activeRun.resolved.resolution, "skipped");
  // inventory unchanged until economy task lands; at minimum no crash
  assert.deepEqual(state.inventory, beforeInv);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/progressionModel.test.js`  
Expected: FAIL on `status === "resolved"` / missing `continueFromResolved`

- [ ] **Step 3: Implement state machine changes**

关键改动（保持现有测试能逐步迁移）：

1. `ACTIVE_STATUSES` 增加 `"resolved"` 仅用于 hydrate 校验集合拆分：
   - `ANSWERABLE = active|retry`
   - `PERSISTABLE_RUN = active|retry|resolved`
2. `toLearnerQuestion` 改为调用 `toChallengeQuestion`。
3. `submitAnswer`：
   - 错误 → `status: "retry"`（不变）
   - 正确 → 写 `resolved`，**不**调用旧的立即前进逻辑；奖励结算放在 resolve 时（Task 4 接入）
4. `skipQuestion`：同样进入 `resolved`，`resolution: "skipped"`。
5. 新增：

```js
function createAttemptId(levelId, questionId, state) {
  // Persisted monotonic sequence avoids collisions when two resolutions share a clock tick.
  const attemptSequence = Number.isInteger(state.attemptSequence) ? state.attemptSequence + 1 : 1;
  return { attemptId: `${levelId}:${questionId}:${attemptSequence}`, attemptSequence };
}

function enterResolved(state, run, chapter, { resolution, now = Date.now() }) {
  const level = getLevel(chapter, run.levelId);
  const question = getQuestion(level, run.questionIndex);
  const { attemptId, attemptSequence } = createAttemptId(level.levelId, question.id, state);
  const resolved = {
    questionId: question.id,
    resolution,
    attemptId,
    resolvedAt: now,
    advanced: false
  };
  return attachChapter({
    ...state,
    attemptSequence,
    activeRun: {
      ...run,
      status: "resolved",
      resolved,
      question: toChallengeQuestion(question, { rewardPreview: run.question?.rewardPreview || [] })
    }
  }, chapter);
}

function getResolvedReview(state) {
  const run = state?.activeRun;
  if (!run || run.status !== "resolved" || !run.resolved) return null;
  const chapter = getAttachedChapter(state);
  const level = getLevel(chapter, run.levelId);
  const question = getQuestion(level, run.questionIndex);
  if (question.id !== run.resolved.questionId) return null;
  return QuestionAccess.buildSolutionReview(question);
}

function continueFromResolved(state) {
  const chapter = getAttachedChapter(state);
  const run = requireActiveRun(state);
  if (run.status !== "resolved" || !run.resolved || run.resolved.advanced) {
    throw new Error("No resolved question to continue from");
  }
  const correct = run.resolved.resolution === "correct";
  const skipped = run.resolved.resolution === "skipped";
  // Resolve-time settlement is authoritative. Continue only advances, never awards again.
  return advanceAfterAnswer(state, { ...run, status: "active", resolved: null }, chapter, {
    correct,
    skipped,
    rewardOptions: { alreadySettled: true } // Task 4 will settle on resolve instead
  });
}
```

6. `serialize` 写入 `resolved` 元数据；**禁止**写入 `solutionReview` 正文。
7. `hydrateActiveRun` 允许 `status === "resolved"`，并恢复 `resolved` 对象。
8. 更新所有因“答对立即前进”而断言 `questionIndex` 的旧测试：答对后需再 `continueFromResolved`。

- [ ] **Step 4: Run tests**

Run: `node --test tests/progressionModel.test.js`  
Expected: PASS（含迁移后的旧用例）

- [ ] **Step 5: Commit**

```bash
git add game/progressionModel.js tests/progressionModel.test.js
git commit -m "feat: add resolved state and continue-from-review flow"
```

---

### Task 3: 战术复盘 UI（默认折叠，不破节奏）

**Files:**
- Modify: `game/gameApp.js`
- Modify: `game/game.css`
- Modify: `scripts/game-ui-behavior.js`

**Interfaces:**
- Consumes: `ProgressionModel.getResolvedReview`, `continueFromResolved`
- Produces: challenge 屏在 `resolved` 时渲染鼓励语 + 奖励摘要 + 折叠复盘 + “继续下一题”

- [ ] **Step 1: 扩展 UI 行为测试**

在 `scripts/game-ui-behavior.js` 增加断言流程（伪代码步骤，实现时写入真实 Playwright 选择器）：

1. 打开第一章第 1 关。
2. 提交错误答案 → 仅见“再试一次/跳过”，DOM 中无 `solutionReview` 文本、无标准答案。
3. 提交正确答案 → 仍停留本 slot；出现 `data-tactical-review`；默认 `details` 未 open。
4. 展开复盘 → 可见观察/步骤/答案/检查/易错（当内容具备时）。
5. 点“继续下一题” → `questionIndex` 前进或进入结算。
6. 在 resolved 时返回地图再进入 → 仍 resolved 且可看复盘。

- [ ] **Step 2: Run behavior test to see current failure**

Run: `npm run test:game-ui`  
Expected: FAIL on new selectors / still auto-advances

- [ ] **Step 3: Implement UI**

在 `renderChallenge`：

```js
if (run.status === "resolved") {
  const review = ProgressionModel.getResolvedReview(state);
  const panel = document.createElement("section");
  panel.dataset.tacticalReview = "";
  panel.className = "tactical-review";
  appendText(panel, "p", pickEncouragement(run.resolved.resolution), "tactical-review__cheer");
  // 展示本题实际奖励 chips（来自最近 settlement 事务 / run.pendingRewards）
  const details = document.createElement("details");
  details.dataset.reviewDetails = "";
  const summary = document.createElement("summary");
  summary.textContent = "展开战术复盘";
  details.append(summary);
  if (review) {
    appendText(details, "p", `关键观察：${review.observation}`);
    const ol = document.createElement("ol");
    review.steps.forEach((step) => appendText(ol, "li", step));
    details.append(ol);
    appendText(details, "p", `正确答案：${review.answer}`);
    appendText(details, "p", `检查方法：${review.check}`);
    appendText(details, "p", `易错提醒：${review.pitfall}`);
  } else {
    appendText(details, "p", "本题复盘内容即将补齐。");
  }
  panel.append(details);
  const cont = appendText(panel, "button", "继续下一题", "pixel-button pixel-button--primary");
  cont.dataset.continueResolved = "";
  challenge.append(panel);
  // hide answer form / disable input
}
```

点击处理：

```js
else if (target.matches("[data-continue-resolved]")) {
  rewardReveal = null;
  answerFeedback = null;
  state = ProgressionModel.continueFromResolved(state);
  screen = state.activeRun ? "challenge" : "settlement";
  persist();
  render();
}
```

CSS：`.tactical-review` 紧凑卡片；`details` 默认折叠；移动端不遮挡主按钮。

- [ ] **Step 4: Re-run UI test**

Run: `npm run test:game-ui`  
Expected: PASS for review flow

- [ ] **Step 5: Commit**

```bash
git add game/gameApp.js game/game.css scripts/game-ui-behavior.js
git commit -m "feat: render collapsible tactical review on resolved questions"
```

---

### Task 4: 奖励经济核心（固定账本 + 随机幂等 + 幸运能量 + 连胜）

**Files:**
- Create: `game/levelRewardConfig.js`
- Create: `game/rewardEconomy.js`
- Create: `tests/levelRewardConfig.test.js`
- Create: `tests/rewardEconomy.test.js`
- Modify: `game/itemCatalog.js`（随机池元数据）
- Modify: `game/progressionModel.js`（接入结算事务）
- Modify: `tests/progressionModel.test.js`
- Modify: `tests/itemCatalog.test.js`

**Interfaces:**
- Produces:
  - `getLevelRewardConfig(levelId) -> { fixedRewards[10], componentId, componentRecipe, stagePartId, stageRecipe }`
  - `validateMainlineEconomy(chapter) -> { ok, errors }` 含空库存模拟 120 题首次答对后可组装 J-20
  - `settleResolution({ state, question, resolution, attemptId, difficulty, streakBefore, pityBefore, random }) -> { inventory, claimedFixedRewards, pityEnergy, streak, transactions, attemptSettlements }`
  - 随机池条目：`{ itemId, rarity, minDifficulty, weight, purpose }` 且 `purpose !== "mainline-required"`

- [ ] **Step 1: Write failing economy tests**

```js
// tests/levelRewardConfig.test.js
const assert = require("node:assert/strict");
const test = require("node:test");
const config = require("../game/levelRewardConfig.js");
const catalog = require("../game/itemCatalog.js");

test("each first-chapter level has exactly 10 fixed reward slots", () => {
  const levels = config.listLevelIds("chapter-01");
  assert.equal(levels.length, 12);
  for (const levelId of levels) {
    const row = config.getLevelRewardConfig(levelId);
    assert.equal(row.fixedRewards.length, 10);
    const slots = row.fixedRewards.map((r) => r.questionSlot).sort((a, b) => a - b);
    assert.deepEqual(slots, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }
});

test("simulating all 120 first clears can craft final J-20", () => {
  const report = config.simulateFullClearCraft("chapter-01");
  assert.equal(report.canCraftFinal, true, report.errors.join("; "));
  assert.equal(report.usedOnlyFixedRewards, true);
});

// tests/rewardEconomy.test.js
const economy = require("../game/rewardEconomy.js");

test("fixed reward claimed once per questionId", () => {
  const first = economy.settleResolution({
    inventory: {},
    claimedFixedRewards: {},
    pityEnergy: 0,
    streak: 0,
    attemptSettlements: {},
    questionId: "q1",
    questionSlot: 1,
    levelId: "chapter-01-level-1",
    difficulty: "基础",
    resolution: "correct",
    attemptId: "a1",
    random: () => 0
  });
  assert.equal(first.transactions.some((t) => t.rewardType === "fixed"), true);
  const second = economy.settleResolution({
    ...first,
    questionId: "q1",
    attemptId: "a2",
    resolution: "correct",
    random: () => 0
  });
  assert.equal(second.transactions.filter((t) => t.rewardType === "fixed" && t.status === "awarded").length, 0);
});

test("skip grants no fixed or random and does not change pity", () => {
  const result = economy.settleResolution({
    inventory: {},
    claimedFixedRewards: {},
    pityEnergy: 3,
    streak: 2,
    attemptSettlements: {},
    questionId: "q2",
    questionSlot: 2,
    levelId: "chapter-01-level-1",
    difficulty: "进阶",
    resolution: "skipped",
    attemptId: "s1",
    random: () => 0
  });
  assert.equal(result.pityEnergy, 3);
  assert.equal(result.streak, 0); // 跳过中断完美连胜，但不改 pity
  assert.equal(result.transactions.length, 0);
});

test("same attemptId is idempotent", () => {
  const args = {
    inventory: {},
    claimedFixedRewards: {},
    pityEnergy: 0,
    streak: 0,
    attemptSettlements: {},
    questionId: "q3",
    questionSlot: 3,
    levelId: "chapter-01-level-1",
    difficulty: "进阶",
    resolution: "correct",
    attemptId: "same",
    random: () => 0
  };
  const a = economy.settleResolution(args);
  const b = economy.settleResolution({ ...a, attemptId: "same", resolution: "correct", questionId: "q3", questionSlot: 3, levelId: args.levelId, difficulty: "进阶", random: () => 0 });
  assert.deepEqual(a.inventory, b.inventory);
  assert.equal(b.transactions.length, 0);
});
```

- [ ] **Step 2: Run to verify fail**

Run: `node --test tests/levelRewardConfig.test.js tests/rewardEconomy.test.js`  
Expected: FAIL missing modules

- [ ] **Step 3: Implement config table**

`levelRewardConfig.js` 用现有 itemId 建表。设计原则：

- 每关 10 个 fixedRewards 的材料总量 ≥ 该关 `componentRecipe`。
- 阶段部件配方 = 本阶段 3 个组件。
- 最终配方 = 4 个阶段部件。
- 对齐现有 `J20_COMPONENT_RECIPES` / `PART_RECIPES` / `FINAL`，必要时微调每题 quantity，使 `simulateFullClearCraft` 通过。

示例结构：

```js
{
  levelId: "chapter-01-level-1",
  moduleId: "patterns",
  componentId: "j20-frame-rib",
  fixedRewards: [
    { questionSlot: 1, itemId: "oak-log", quantity: 1 },
    // ... slots 2-10, totals enough for recipe oak-log×2
  ],
  componentRecipe: [{ itemId: "oak-log", quantity: 2 }],
  stagePartId: "j20-airframe",
  stageRecipe: [
    { itemId: "j20-frame-rib", quantity: 1 },
    { itemId: "j20-wing-spar", quantity: 1 },
    { itemId: "j20-skin-panel", quantity: 1 }
  ]
}
```

`simulateFullClearCraft`：空库存 → 累加全部 fixedRewards → 依次 craft 12 组件 → 4 部件 → final。

- [ ] **Step 4: Implement rewardEconomy**

```js
// 核心算法要点
// 1. if attemptSettlements[attemptId] return empty delta
// 2. if resolution !== "correct": streak=0; if skipped pity unchanged; record attempt; return
// 3. fixed: if !claimedFixedRewards[questionId] grant from config; mark claimed
// 4. random: only if difficulty in 进阶/提高/挑战; roll pool filtered by minDifficulty; pity++ on non-rare, hard pity at threshold (e.g. 10)
// 5. streak: on correct streak+1; at 3/6/10 grant chest items (define chest itemIds in catalog or map to existing materials with rewardType streak-chest)
// 6. mark attemptSettlements[attemptId] = { questionId, resolution, transactionIds }
// 7. return full next state slices + transactions
```

随机池条目放在 `itemCatalog` 或 `rewardEconomy` 常量：

```js
{ itemId: "emerald", rarity: "rare", minDifficulty: "提高", weight: 3, purpose: "collection" }
```

- [ ] **Step 5: Wire into progression**

- `createInitialState` 增加：
  - `claimedFixedRewards: {}`
  - `pityEnergy: 0`
  - `attemptSettlements: {}`
- 在 `enterResolved` 时若 `resolution==="correct"` 调用 `settleResolution`；skip 也调用以登记 attempt（无发奖）。
- `continueFromResolved` 不再二次发奖（`alreadySettled`）。
- `serialize`/`hydrate` 清洗并迁移上述字段。
- 阶段结算 UI 改用真实 `canCraft` 与 missing list（Task 6 可并行，但 ledger 字段本任务完成）。

- [ ] **Step 6: Run all related tests**

Run: `node --test tests/levelRewardConfig.test.js tests/rewardEconomy.test.js tests/progressionModel.test.js tests/itemCatalog.test.js`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add game/levelRewardConfig.js game/rewardEconomy.js game/itemCatalog.js game/progressionModel.js tests
git commit -m "feat: split fixed claims and idempotent random reward economy"
```

---

### Task 5: 题目质量模型与自动验证器

**Files:**
- Create: `game/questionQuality.js`
- Create: `tests/questionQuality.test.js`
- Modify: `game/chapterBuilder.js`
- Modify: `scripts/validate-game-content.js`
- Create: `content/humanReview/chapter-01.json`（先放 schema + 空/样板，Task 7 填满）

**Interfaces:**
- Produces:
  - `REASONING_TYPES` 受控枚举
  - `validateQuestionQuality(question) -> errors[]`
  - `detectTemplateDuplicates(questions) -> suspects[]`
  - `validateHumanReviewRecords(records, questionIds) -> errors[]`
  - 发布门槛：缺审题或任一项 0 → `validate:game` 失败（可先用 env `REQUIRE_HUMAN_REVIEW=1`，默认在 Task 7 全量通过后强制）

- [ ] **Step 1: Failing tests for schema**

```js
test("requires solutionReview consistency with answer", () => {
  const errors = quality.validateQuestionQuality({
    id: "x", title: "t", prompt: "p", answer: "1", difficulty: "基础", slot: 1,
    learningObjective: "目标", reasoningType: "直接计算",
    difficultyProfile: { steps: 1, conditions: 1, representation: "equation", direction: "forward", transfer: "direct" },
    storyBeat: "s",
    solutionReview: { observation: "o", steps: ["1"], answer: "2", check: "c", pitfall: "p" }
  });
  assert.ok(errors.some((e) => /solutionReview\.answer/.test(e)));
});
```

- [ ] **Step 2: Implement validator**

校验：

- 必填质量字段存在且非空
- `learningObjective` 单句、无“以及/并且”堆砌目标（启发式）
- `reasoningType ∈ REASONING_TYPES`
- `difficultyProfile.steps/conditions` 正整数
- `solutionReview.steps` 长度：slot≤4 → 1–2；slot=10 → 1–5；其余 1–4
- `solutionReview.answer` 与 `answer`/`acceptedAnswers` 经 answerMatcher 一致
- 模板重复：同关 normalize(prompt) 去数字后完全相同 → suspect

人工审题记录结构：

```json
{
  "questionId": "patterns-1",
  "scores": {
    "singleObjective": true,
    "nonTemplate": true,
    "necessaryContext": true,
    "clearProgression": true,
    "executableReview": true,
    "realPitfall": true
  },
  "reviewer": "pending",
  "reviewedAt": "2026-07-25",
  "notes": ""
}
```

- [ ] **Step 3: Hook validate:game**

在 `validate-game-content.js`：build chapter 后对 120 题跑 `validateQuestionQuality`；报告 suspects；若 `content/humanReview/chapter-01.json` 存在则校验覆盖。

- [ ] **Step 4: Commit**

```bash
git add game/questionQuality.js tests/questionQuality.test.js game/chapterBuilder.js scripts/validate-game-content.js content/humanReview
git commit -m "feat: add question quality validator and human review gate"
```

---

### Task 6: 阶段结算与材料提示修正

**Files:**
- Modify: `game/gameApp.js`
- Modify: `game/inventoryModel.js`（如需 `getMissingIngredients`）
- Modify: `tests/inventoryModel.test.js`
- Modify: `scripts/game-ui-behavior.js`

- [ ] **Step 1: Test missing ingredients helper**

```js
test("lists missing recipe inputs from inventory", () => {
  const missing = InventoryModel.getMissingIngredients(
    { "oak-log": 1 },
    { inputs: [{ itemId: "oak-log", quantity: 2 }, { itemId: "iron-ingot", quantity: 1 }], outputs: [{ itemId: "j20-frame-rib", quantity: 1 }] },
    { crafting: true }
  );
  assert.deepEqual(missing, [
    { itemId: "oak-log", need: 2, have: 1, missing: 1 },
    { itemId: "iron-ingot", need: 1, have: 0, missing: 1 }
  ]);
});
```

- [ ] **Step 2: Replace optimistic stage callout**

第 3/6/9/12 关结算时：

| 条件 | UI |
| --- | --- |
| 已拥有 stage part | “部件已完成” |
| canCraft stage recipe | “可以拼装” + 去背包 |
| 组件材料不足 | 列出缺少物品与数量 |
| 有未领取 fixed（claimed 缺 questionId） | “有题未领取，可重玩补领” + 题目入口列表 |

删除无条件 “材料已就绪”。

- [ ] **Step 3: Commit**

```bash
git add game/gameApp.js game/inventoryModel.js tests/inventoryModel.test.js scripts/game-ui-behavior.js
git commit -m "fix: stage prompts reflect real inventory and claim gaps"
```

---

### Task 7: 120 题质量升级（分批内容任务）

**Files:**
- Modify: content modules（`data.js` / expansions）与 `game/chapterQuestionPacks.js`
- Modify: `content/humanReview/chapter-01.json`
- Prefer keeping `chapterBuilder` selection rules; enrich selected 10 per module rather than inventing parallel bank unless needed

**Batch order（spec 优先级）：**

1. `patterns`（找规律）
2. `sum-diff`（和差倍）
3. `chicken-rabbit`（鸡兔同笼）
4. 其余 9 关：`quick-calculation` → `arithmetic-series` → `periodicity` → `enumeration` → `add-multiply-principle` → `inclusion-exclusion` → `unit-rate` → `surplus-deficit` → `average`

每关交付标准：

- 选中的 10 题（或重写后仍能被 DIFFICULTY_SLOTS 选中的 10 题）具备完整质量字段 + `solutionReview`
- 题位 1–10 对应 spec §3 认知任务
- 题 10 = Boss 综合工程场景（航空科技/实验，无战斗用语）
- 故事标准符合 §5
- 人工审题 6 项全 true
- `npm run validate:game` 对该关 0 error

- [ ] **Step 1: 建立单题样板（patterns slot 3）**

按 spec 示例写入真实数据源字段（注意现有 id 体系如 `patterns-1` / `chapter-01-patterns-advance-1`）：

```js
{
  id: "patterns-3", // 使用实际 id
  title: "扫描范围",
  difficulty: "进阶",
  prompt: "雷达扫描范围依次为 3、6、12、24 千米，下一轮是多少千米？",
  answer: "48",
  acceptedAnswers: ["48千米", "48 千米"],
  learningObjective: "识别倍增规律",
  reasoningType: "观察并归纳",
  difficultyProfile: {
    steps: 1,
    conditions: 1,
    representation: "sequence",
    direction: "forward",
    transfer: "direct"
  },
  storyBeat: "校准逐轮扩大的雷达扫描范围",
  solutionReview: {
    observation: "相邻两个数都扩大为原来的 2 倍",
    steps: ["6 ÷ 3 = 2，12 ÷ 6 = 2", "24 × 2 = 48"],
    answer: "48 千米",
    check: "48 ÷ 24 = 2，仍符合相同规律",
    pitfall: "不要把它误认为每次增加相同的数"
  }
}
```

- [ ] **Step 2: 逐关重写**

对每一关：

1. 列出当前 10 选中题（`buildLevel` 结果）。
2. 按 slot 诊断认知任务是否匹配。
3. 重写 prompt/story/solutionReview；禁止纯换数字。
4. 写 10 条 humanReview。
5. 跑 `node --test tests/questionQuality.test.js` + `npm run validate:game`。
6. 单独 commit：`content: upgrade <moduleId> questions with reviews`

- [ ] **Step 3: 全量门槛打开**

当 120 条 humanReview 齐备后，在 `validate-game-content.js` 强制：

- 120 题 quality pass
- 120 条审题 6 项全 true

- [ ] **Step 4: Final content commit**

```bash
git add data.js contentExpansion.js priorityContentExpansion.js supplementalContentExpansion.js supplementalContentFixes.js knowledgeContinuityExpansion.js knowledgeTopology.js supplementalTopologyExpansion.js game/chapterQuestionPacks.js content/humanReview/chapter-01.json
git commit -m "content: complete chapter-01 quality upgrade with human review"
```

---

### Task 8: `itemVisuals` manifest + 图片接入 + 兜底

**Files:**
- Create: `game/itemVisuals.js`
- Create: `tests/itemVisuals.test.js`
- Create: `public/assets/items/`（28 webp；生成前可先放占位并让测试在 CI 检查存在性）
- Modify: `game/gameApp.js` `createItemIcon`
- Modify: `game/game.css`（品质边框、数量角标、锁定/可合成态）
- Modify: `scripts/check-bundle-size.js`（如需要计入 public assets 策略）

**Interfaces:**

```js
{
  itemId: "oak-log",
  src: "/assets/items/oak-log.webp",
  width: 256,
  height: 256,
  alt: "橡木原木的高写实微缩模型",
  fallbackIcon: "material-generic",
  preloadPriority: "lazy" // or current-reward | reveal | stage
}
```

尺寸规则：

- 11 原材料 + 12 组件：256
- 4 大型部件：512
- 最终战机：1024（或庆典横图，manifest 如实声明）

- [ ] **Step 1: Manifest tests**

```js
test("all 28 core items have complete visual entries", () => {
  const ids = visuals.listCoreItemIds();
  assert.equal(ids.length, 28);
  for (const id of ids) {
    const v = visuals.getItemVisual(id);
    assert.equal(v.itemId, id);
    assert.ok(v.src.endsWith(".webp"));
    assert.ok(v.alt && /[\u4e00-\u9fff]/.test(v.alt));
    assert.ok(v.width >= 256 && v.height >= 256);
    assert.ok(catalog.getItem(id));
  }
});
```

- [ ] **Step 2: Implement createItemIcon with img + fallback**

```js
function createItemIcon(item, className = "item-icon") {
  const visual = ItemVisuals.getItemVisual(item.id);
  if (visual?.src) {
    const img = document.createElement("img");
    img.className = className;
    img.alt = visual.alt;
    img.width = 64;
    img.height = 64;
    img.loading = visual.preloadPriority === "lazy" ? "lazy" : "eager";
    img.src = visual.src;
    img.onerror = () => {
      img.replaceWith(createPixelIcon(item, className)); // generic fallback only
    };
    return img;
  }
  return createPixelIcon(item, className);
}
```

品质边框用 CSS：`.item-chip[data-rarity="rare"]` 等，图片本身无边框文字。

- [ ] **Step 3: Asset production checklist（人工/Imagine 流程）**

统一 prompt 约束（写入 `docs` 或脚本注释即可，不新建多余 md 除非需要）：

- 3/4 俯视、主体居中、棚拍主光、暖中性台面，保留清晰材质细节和可读轮廓
- 真实材质；无像素/体素；无水印文字品质框
- 导出 WebP；48–64px 缩略可辨

生成顺序：原材料 11 → 组件 12 → 部件 4 → 战机 1。

- [ ] **Step 4: Preload hooks**

- 当前题 `rewardPreview` eager
- 稀有揭晓 / 阶段拼装时 preload 对应 src
- 背包列表 lazy

- [ ] **Step 5: Commit code first, assets in follow-up commits per batch**

```bash
git add game/itemVisuals.js tests/itemVisuals.test.js game/gameApp.js game/game.css public/assets/items
git commit -m "feat: wire high-realism item visuals manifest with fallbacks"
```

---

### Task 9: 奖励展示节奏（轻量飞入 vs 稀有揭晓）

**Files:**
- Modify: `game/gameApp.js`
- Modify: `game/game.css`

- [ ] **Step 1: 分类展示**

- 普通 fixed：非阻塞 toast / 飞入背包动画（`reward-fly`），不强制点继续
- 稀有+、连胜箱、组件完成、部件拼装、最终战机：全屏/模态揭晓（`reward-reveal--full`）

- [ ] **Step 2: 连胜提示**

resolved 面板显示当前连胜；达到 3/6/10 时展示对应补给箱名：

- 3 普通补给箱
- 6 精良补给箱
- 10 完美作战箱

- [ ] **Step 3: Commit**

```bash
git add game/gameApp.js game/game.css
git commit -m "feat: differentiate light reward feedback and full reveals"
```

---

### Task 10: 答案泄露防护与持久化迁移验收

**Files:**
- Modify: `tests/progressionModel.test.js`
- Modify: `scripts/game-ui-behavior.js`
- Modify: `game/storageAdapter.js`（若 inventory 外字段需协同）

- [ ] **Step 1: Leak tests**

```js
test("serialized active run never contains answer or solutionReview text", () => {
  const chapter = createChapterWithReview(); // helper with solutionReview
  let state = model.startLevel(model.createInitialState(chapter), chapter.levels[0].levelId);
  const json = model.serialize(state);
  assert.equal(json.includes(chapter.levels[0].questions[0].answer), false);
  assert.equal(json.includes("关键观察"), false);
  state = model.submitAnswer(state, chapter.levels[0].questions[0].answer, matcher, { now: () => 1 });
  const resolvedJson = model.serialize(state);
  assert.equal(resolvedJson.includes(chapter.levels[0].questions[0].solutionReview.observation), false);
  assert.ok(JSON.parse(resolvedJson).activeRun.resolved.questionId);
});
```

- [ ] **Step 2: Migration tests**

旧 `math-quest-game-v1` 缺 `claimedFixedRewards` 的存档 hydrate 后字段默认可用；不丢 inventory/unlockedLevelIds。

- [ ] **Step 3: Commit**

```bash
git add tests/progressionModel.test.js scripts/game-ui-behavior.js game/progressionModel.js
git commit -m "test: enforce no answer leakage and save migration defaults"
```

---

### Task 11: 整体验收闸门

**Files:**
- Modify: `scripts/validate-game-content.js`
- Modify: `package.json` scripts if adding `validate:economy`
- No product code unless gaps found

- [ ] **Step 1: Run full verification matrix**

```bash
npm test
npm run validate:game
npm run check
npm run build
npm run check:bundle
npm run test:game-ui
npm run smoke
```

Expected:

- 12×10 题
- 120 solutionReview + 120 humanReview pass
- 泄露用例 0
- 空库存模拟 J-20 100%
- 随机池无 mainline-required
- 28 visuals 文件存在且 alt 完整
- 关键路径：跳过 → 无奖励 → 重玩答对补领 fixed → 不重复领取

- [ ] **Step 2: Manual responsive pass**

手机/平板/桌面检查挑战页复盘、背包图、阶段提示。

- [ ] **Step 3: Final commit if script tweaks needed**

```bash
git add scripts package.json
git commit -m "chore: tighten release validation for chapter-01 upgrade"
```

---

## Self-Review

### Spec coverage

| Spec 章节 | Task |
| --- | --- |
| §3 认知曲线 | Task 5 + 7 |
| §4 数据模型 / challengeQuestion | Task 1–2 |
| §4.1 受控接口 | Task 1–2 |
| §4.2 人工审题 | Task 5 + 7 |
| §5 故事标准 | Task 7 |
| §6 战术复盘 | Task 2–3 |
| §7 奖励经济 | Task 4 + 6 + 9 |
| §8 物品视觉 | Task 8 |
| §9 阶段一–五 | Tasks 1–11 映射 |
| §10 验收指标 | Task 10–11 |
| §11 非目标 | Global Constraints |

### Placeholder scan

计划内步骤均给出接口、测试骨架与关键实现片段；120 题正文不在计划中逐字展开，而是以“逐关 commit + 校验门槛”执行，避免计划文件不可维护。

### Type consistency

- `resolved.resolution`: `"correct" | "skipped"`
- `attemptId`: string，在 enterResolved 生成，在 rewardEconomy 幂等
- `claimedFixedRewards`: `{ [questionId]: true }`
- `challengeQuestion` 永不含 answer/solutionReview
- 物品 ID 沿用现有 catalog，不用 spec 示例中的别名

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-07-25-first-chapter-quality-reward-visual-upgrade.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** — 每个 Task 派生子代理，任务间审查，适合 Task 1–6 与 8–11  
2. **Inline Execution** — 本会话按 executing-plans 连续推进，适合先打通 Task 1–4 骨架  

**内容批处理建议：** Task 7 可再拆 12 个 module 子任务并行（patterns / sum-diff / chicken-rabbit 优先）。  
**资产批处理建议：** Task 8 的 28 图可与 Task 7 后半并行。

Which approach?
