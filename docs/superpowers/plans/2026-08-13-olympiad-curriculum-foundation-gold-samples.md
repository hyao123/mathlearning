# 小奥课程基础设施与金样关卡 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立可验证的小奥课程 V3 契约、质量引擎和兼容加载机制，并交付“鸡兔同笼、最短路线、综合建模”三个各 10 题的候选金样关卡。

**Architecture:** V3 课程内容放在独立的 `game/curriculum/` 边界内，经契约、答案策略、解题步骤复算、结构指纹和难度引擎校验后，再由兼容适配器转换成现有游戏运行时题目。候选内容默认不覆盖生产题库；只有自动门禁和带证据的人工审核都通过后，批次注册表才原子启用 `gold-v3`，失败时继续使用现有题包。

**Tech Stack:** CommonJS、Node.js 20+ 内置测试运行器、现有 Vite 游戏运行时、JSON 人工审核清单。

## Global Constraints

- 保持 9 章、每章 12 关、每关 10 题，共 1080 道生产题。
- 保留既有章节、关卡、题目槽位、奖励账本、背包和存档兼容。
- 课程覆盖三至六年级，第 9 章难度上限为杯赛入门。
- 不引入方程组、负数技巧、复杂代数恒等式、专业竞赛定理或运行时 AI 出题。
- 难度来自有效条件、推理依赖、表示转换、问题方向和模型组合；大数、长题干和情境换皮不计入难度。
- 每关至少 5 个数学结构指纹，任何单一结构最多出现 2 次。
- 第 8～10 题必须发生真实策略变化；Boss 通常不超过 4 个有效条件和 3 个核心推理动作。
- 内容包只有在自动校验和人工审核都通过后才可原子启用。
- 所有生产修改遵循 TDD：先写失败测试、确认失败、实现最小代码、确认通过、提交。

---

## Delivery Roadmap

本规格拆成四份可独立验收的实施计划：

1. **本计划：基础设施＋三个候选金样关卡。** 建立 V3 契约、质量引擎、兼容加载和人工审核 V3；产出 30 道候选题。
2. **第 1～3 章计划。** 在金样获批后重构 36 个知识点、360 题。
3. **第 4～6 章计划。** 重构几何、比例、方程、行程、工程、统计概率共 360 题。
4. **第 7～9 章计划。** 重构六年级方法、策略与杯赛入门综合共 360 题。

本计划结束时，若人工审核尚未完成，`gold-v3` 必须保持候选状态，生产仍使用旧题；人工审核通过后的原子启用是 Task 11 的显式门禁。

## File Structure

### 新建文件

- `game/curriculum/curriculumContract.js`：年级、认知动作、表示方式、问题方向和知识点契约。
- `game/curriculum/curriculumMap.js`：第一批三个金样知识点的课程定义；后续扩展为 108 点图谱。
- `game/curriculum/answerPolicy.js`：最简分数、余数、多值等答案策略校验与匹配。
- `game/curriculum/solutionEngine.js`：安全的算术步骤复算和独立验算。
- `game/curriculum/structureFingerprint.js`：数学结构指纹和同构检测。
- `game/curriculum/difficultyEngine.js`：真实难度计算及十题梯度校验。
- `game/curriculum/questionV3Quality.js`：聚合 V3 单题与单关质量门禁。
- `game/curriculum/runtimeAdapter.js`：将 V3 作者数据转换为现有游戏题目字段。
- `game/curriculum/contentBatchRegistry.js`：候选批次校验、启用和失败回退。
- `game/curriculum/compatibilityMap.js`：旧题槽位到 V3 题目的稳定映射。
- `game/curriculum/gold/chickenRabbit.js`：三年级提高“鸡兔同笼”10 题。
- `game/curriculum/gold/shortestPath.js`：六年级提高“最短路线”10 题。
- `game/curriculum/gold/integratedModeling.js`：杯赛入门“综合建模”10 题。
- `game/curriculum/gold/index.js`：`gold-v3` 内容包声明。
- `content/humanReview/candidates/gold-v3.json`：30 题候选人工审核记录。
- `scripts/validate-curriculum-batch.js`：候选批次校验 CLI。
- `tests/curriculumContract.test.js`、`tests/answerPolicy.test.js`、`tests/solutionEngine.test.js`、`tests/curriculumQuality.test.js`、`tests/curriculumBatch.test.js`：新基础设施测试。

### 修改文件

- `answerMatcher.js`：在保留旧匹配行为的前提下接入 `answerPolicy`。
- `game/questionContract.js`：允许 V3 答案格式并委托答案策略校验。
- `game/questionQuality.js`：对 `schemaVersion: 3` 路由到 V3 门禁，旧题继续走现有逻辑。
- `game/chapterBuilder.js`：优先读取已启用且有效的 V3 知识点内容包，否则使用旧题。
- `game/questionAccess.js`：判题时传递 `answerPolicy`，解析展示继续只在答题后开放。
- `scripts/generate-human-review-template.js`：生成带审核证据的 schema V3 候选清单。
- `scripts/validate-game-content.js`：生产发布时校验已启用课程批次和人工审核状态。
- `package.json`：新增 `validate:curriculum` 命令。
- `README.md`：记录候选内容、审核和原子启用流程。

---

### Task 1: 课程知识点契约与三点课程图谱

**Files:**
- Create: `game/curriculum/curriculumContract.js`
- Create: `game/curriculum/curriculumMap.js`
- Test: `tests/curriculumContract.test.js`

**Interfaces:**
- Consumes: 无。
- Produces: `validateTopicDefinition(topic): string[]`、`validateCurriculumGraph(topics): string[]`、`getCurriculumTopic(topicId): object|null`、受控常量 `GRADE_BANDS`、`REASONING_MOVES`、`REPRESENTATIONS`、`QUESTION_DIRECTIONS`。

- [ ] **Step 1: 写失败测试，锁定受控枚举、必要认知动作和前置闭包**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const contract = require("../game/curriculum/curriculumContract.js");
const map = require("../game/curriculum/curriculumMap.js");

test("三个金样知识点具有年级、主模型、必要动作和禁止捷径", () => {
  for (const id of ["chicken-rabbit", "shortest-path", "integrated-modeling"]) {
    const topic = map.getCurriculumTopic(id);
    assert.ok(topic, id);
    assert.deepEqual(contract.validateTopicDefinition(topic), [], id);
    assert.ok(topic.requiredActions.length >= 2, id);
    assert.ok(topic.excludedShortcuts.length >= 1, id);
  }
});

test("图谱拒绝不存在的前置知识点和循环依赖", () => {
  const errors = contract.validateCurriculumGraph([
    { ...map.getCurriculumTopic("shortest-path"), prerequisites: ["missing"] }
  ]);
  assert.match(errors.join("\n"), /unknown prerequisite: missing/);
});
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `node --test tests/curriculumContract.test.js`

Expected: FAIL with `Cannot find module '../game/curriculum/curriculumContract.js'`.

- [ ] **Step 3: 实现契约验证器**

```js
const GRADE_BANDS = Object.freeze(["grade-3", "grade-4", "grade-5", "grade-6", "cup-entry"]);
const REASONING_MOVES = Object.freeze(["identify", "classify", "diagram", "assume", "substitute", "reverse", "enumerate", "compare", "optimize", "verify"]);
const REPRESENTATIONS = Object.freeze(["text", "bar-model", "table", "route-map", "equation", "diagram"]);
const QUESTION_DIRECTIONS = Object.freeze(["forward", "reverse", "find-parameter", "find-boundary", "compare-plans"]);

function validateTopicDefinition(topic) {
  const errors = [];
  if (!topic || typeof topic !== "object") return ["topic must be an object"];
  for (const field of ["id", "title", "gradeBand", "coreModel"]) {
    if (typeof topic[field] !== "string" || !topic[field].trim()) errors.push(`missing ${field}`);
  }
  if (!GRADE_BANDS.includes(topic.gradeBand)) errors.push(`invalid gradeBand: ${topic.gradeBand}`);
  for (const field of ["prerequisites", "requiredActions", "excludedShortcuts", "misconceptionTags"]) {
    if (!Array.isArray(topic[field])) errors.push(`${field} must be an array`);
  }
  if (!topic.requiredActions?.length) errors.push("requiredActions must not be empty");
  if (topic.requiredActions?.some((move) => !REASONING_MOVES.includes(move))) errors.push("invalid required action");
  if (!topic.excludedShortcuts?.length) errors.push("excludedShortcuts must not be empty");
  return errors;
}
```

`validateCurriculumGraph` 必须先建立 ID 集合，再报告未知前置项，并用深度优先搜索报告 `prerequisite cycle: <path>`。

- [ ] **Step 4: 写入三个明确课程定义**

```js
const CURRICULUM_TOPICS = Object.freeze([
  Object.freeze({
    id: "chicken-rabbit", title: "鸡兔同笼与假设法", gradeBand: "grade-3",
    prerequisites: ["sum-diff"], coreModel: "uniform-assumption-difference",
    requiredActions: ["assume", "substitute", "verify"],
    excludedShortcuts: ["direct-given-category-count"],
    misconceptionTags: ["difference-per-object", "total-object-check"]
  }),
  Object.freeze({
    id: "shortest-path", title: "最短路线与障碍绕行", gradeBand: "grade-6",
    prerequisites: ["coordinates-routes", "compare-plans"], coreModel: "candidate-route-comparison",
    requiredActions: ["enumerate", "compare", "optimize", "verify"],
    excludedShortcuts: ["given-horizontal-plus-vertical"],
    misconceptionTags: ["missed-route", "invalid-obstacle-crossing"]
  }),
  Object.freeze({
    id: "integrated-modeling", title: "杯赛入门综合建模", gradeBand: "cup-entry",
    prerequisites: ["ratio-model", "motion-model", "geometry-decomposition"], coreModel: "multi-model-decomposition",
    requiredActions: ["identify", "substitute", "compare", "verify"],
    excludedShortcuts: ["single-expression-substitution"],
    misconceptionTags: ["wrong-primary-model", "unused-condition", "dependent-step-order"]
  })
]);
```

为尚未迁入 V3 的前置知识点增加 `externalPrerequisiteIds` 参数，图谱验证允许这些已存在的旧课程 ID，但仍拒绝拼写错误。

- [ ] **Step 5: 运行测试并确认通过**

Run: `node --test tests/curriculumContract.test.js`

Expected: PASS, 2 tests.

- [ ] **Step 6: 提交**

```bash
git add game/curriculum/curriculumContract.js game/curriculum/curriculumMap.js tests/curriculumContract.test.js
git commit -m "feat: add olympiad curriculum contract"
```

---

### Task 2: 答案策略与向后兼容判题

**Files:**
- Create: `game/curriculum/answerPolicy.js`
- Modify: `answerMatcher.js`
- Modify: `game/questionContract.js`
- Modify: `game/questionAccess.js`
- Test: `tests/answerPolicy.test.js`
- Test: `tests/answerMatcher.test.js`
- Test: `tests/questionAccess.test.js`

**Interfaces:**
- Consumes: 现有 `AnswerMatcher.normalizeText` 和 `parseNumberLike`。
- Produces: `validateAnswerPolicy(answer, policy): string[]`、`matchesAnswerPolicy(userAnswer, expectedAnswer, policy): boolean`；`AnswerMatcher.isAnswerCorrect(..., { answerPolicy })`。

- [ ] **Step 1: 写失败测试覆盖最简分数、余数、多值和旧数值行为**

```js
test("最简分数策略拒绝未约分的标准答案和用户答案", () => {
  assert.deepEqual(policy.validateAnswerPolicy("2/6", { kind: "fraction", simplified: true }), ["fraction answer must be simplified"]);
  assert.equal(policy.matchesAnswerPolicy("2/6", "1/3", { kind: "fraction", simplified: true }), false);
  assert.equal(policy.matchesAnswerPolicy("1/3", "1/3", { kind: "fraction", simplified: true }), true);
});

test("余数和顺序无关多值答案保持自动判定", () => {
  assert.equal(policy.matchesAnswerPolicy("5余2", "5...2", { kind: "quotient-remainder" }), true);
  assert.equal(policy.matchesAnswerPolicy("7,3", "3,7", { kind: "multi-number", unordered: true }), true);
});

test("未声明 answerPolicy 的旧题继续使用现有数值等价匹配", () => {
  assert.equal(matcher.isAnswerCorrect("0.5", "1/2"), true);
});
```

- [ ] **Step 2: 运行测试确认新策略模块不存在**

Run: `node --test tests/answerPolicy.test.js tests/answerMatcher.test.js tests/questionAccess.test.js`

Expected: FAIL with `Cannot find module '../game/curriculum/answerPolicy.js'`.

- [ ] **Step 3: 实现安全解析和策略匹配**

```js
const POLICY_KINDS = Object.freeze(["integer", "decimal", "fraction", "percent", "quotient-remainder", "multi-number"]);

function gcd(left, right) {
  let a = Math.abs(left); let b = Math.abs(right);
  while (b) [a, b] = [b, a % b];
  return a;
}

function parseFraction(value) {
  const match = String(value).trim().match(/^([+-]?\d+)\/(\d+)$/);
  if (!match || Number(match[2]) === 0) return null;
  return { numerator: Number(match[1]), denominator: Number(match[2]) };
}

function parseQuotientRemainder(value) {
  const match = String(value).replace(/\s+/g, "").match(/^([+-]?\d+)(?:余|\.\.\.)(\d+)$/);
  return match ? { quotient: Number(match[1]), remainder: Number(match[2]) } : null;
}
```

`validateAnswerPolicy` 必须验证策略类型、最简分数、余数非负和多值数量；`matchesAnswerPolicy` 只在显式策略存在时接管匹配，否则返回 `null` 让旧 matcher 继续执行。

- [ ] **Step 4: 接入旧契约和判题链路**

```js
function isAnswerCorrect(userAnswer, expectedAnswer, options = {}) {
  if (options.answerPolicy) {
    return AnswerPolicy.matchesAnswerPolicy(userAnswer, expectedAnswer, options.answerPolicy);
  }
  // 保留当前 acceptedAnswers / exact / numeric / boolean / unordered 匹配顺序
}
```

在 `questionAccess.judgeAnswer` 的 options 中增加 `answerPolicy: question.answerPolicy`。`questionContract.validateQuestionContract` 对有 `answerPolicy` 的 V3 题调用新验证器，对旧题保持原四种格式规则。

- [ ] **Step 5: 运行目标测试与旧回归**

Run: `node --test tests/answerPolicy.test.js tests/answerMatcher.test.js tests/questionAccess.test.js tests/questionQuality.test.js`

Expected: PASS, including all pre-existing matcher and access tests.

- [ ] **Step 6: 提交**

```bash
git add game/curriculum/answerPolicy.js answerMatcher.js game/questionContract.js game/questionAccess.js tests/answerPolicy.test.js tests/answerMatcher.test.js tests/questionAccess.test.js
git commit -m "feat: support structured numeric answer policies"
```

---

### Task 3: 可复算解题步骤与独立验算引擎

**Files:**
- Create: `game/curriculum/solutionEngine.js`
- Test: `tests/solutionEngine.test.js`

**Interfaces:**
- Consumes: Task 2 的 `AnswerPolicy.matchesAnswerPolicy`。
- Produces: `evaluateSteps(steps): { values: Map, finalValue: number|string }`、`validateSolution(question): string[]`。

- [ ] **Step 1: 写失败测试，覆盖依赖步骤、安全运算和独立验算**

```js
test("按依赖关系复算假设法答案", () => {
  const result = engine.evaluateSteps([
    { id: "allChickenLegs", operation: "multiply", operands: [14, 2], result: 28 },
    { id: "extraLegs", operation: "subtract", operands: [40, "$allChickenLegs"], result: 12 },
    { id: "rabbits", operation: "divide", operands: ["$extraLegs", 2], result: 6 }
  ]);
  assert.equal(result.finalValue, 6);
});

test("拒绝循环引用、除零、伪造中间结果和重复主路径验算", () => {
  assert.match(() => engine.evaluateSteps([{ id: "a", operation: "divide", operands: [1, 0], result: 0 }]), /division by zero/);
  const errors = engine.validateSolution({
    answer: "6", answerPolicy: { kind: "integer" },
    solution: { steps: [{ id: "x", operation: "add", operands: [2, 2], result: 5 }], verification: [] }
  });
  assert.match(errors.join("\n"), /declared result 5 does not equal 4/);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test tests/solutionEngine.test.js`

Expected: FAIL with missing `solutionEngine.js`.

- [ ] **Step 3: 实现受控运算表和引用解析**

```js
const OPERATIONS = Object.freeze({
  add: ([a, b]) => a + b,
  subtract: ([a, b]) => a - b,
  multiply: ([a, b]) => a * b,
  divide: ([a, b]) => { if (b === 0) throw new Error("division by zero"); return a / b; },
  sum: (values) => values.reduce((sum, value) => sum + value, 0),
  min: (values) => Math.min(...values),
  max: (values) => Math.max(...values),
  ceilDivide: ([a, b]) => { if (b === 0) throw new Error("division by zero"); return Math.ceil(a / b); },
  remainder: ([a, b]) => { if (b === 0) throw new Error("division by zero"); return a % b; }
});
```

引用只允许 `$<已完成 step id>`，不使用 `eval`、`Function` 或任意表达式解析。数值比较使用 `1e-9` 容差。

- [ ] **Step 4: 实现主解和验算的独立性检查**

`validateSolution` 必须验证：步骤 ID 唯一、依赖只指向先前步骤、声明结果正确、最后结果匹配答案、verification 非空、verification 的 `strategy` 与 `solution.strategy` 不同、验算结果同样匹配答案策略。

- [ ] **Step 5: 运行测试确认通过**

Run: `node --test tests/solutionEngine.test.js tests/answerPolicy.test.js`

Expected: PASS.

- [ ] **Step 6: 提交**

```bash
git add game/curriculum/solutionEngine.js tests/solutionEngine.test.js
git commit -m "feat: add deterministic solution evaluator"
```

---

### Task 4: 数学结构指纹和真实难度引擎

**Files:**
- Create: `game/curriculum/structureFingerprint.js`
- Create: `game/curriculum/difficultyEngine.js`
- Test: `tests/curriculumQuality.test.js`

**Interfaces:**
- Consumes: V3 题目字段 `structureFamily`、`conditionRoles`、`reasoningMoves`、`representation`、`questionDirection`、`solution.steps`。
- Produces: `createStructureFingerprint(question): string`、`evaluateDifficulty(question): object`、`validateTopicProgression(questions): string[]`。

- [ ] **Step 1: 写失败测试证明换数字和换场景不产生新结构**

```js
test("同一数学结构换数字和场景仍得到相同指纹", () => {
  const base = {
    structureFamily: "uniform-assumption-difference",
    conditionRoles: ["object-total", "attribute-total", "attribute-difference"],
    reasoningMoves: ["assume", "substitute", "verify"],
    representation: "text", questionDirection: "find-parameter",
    solution: { steps: [{ operation: "multiply" }, { operation: "subtract" }, { operation: "divide" }] }
  };
  assert.equal(fingerprint.createStructureFingerprint({ ...base, prompt: "鸡兔 14 只" }), fingerprint.createStructureFingerprint({ ...base, prompt: "车辆 20 辆" }));
});

test("单关少于五种结构、单结构超过两题或 Boss 同构基础题时失败", () => {
  const questions = Array.from({ length: 10 }, (_, index) => makeQuestion({ slot: index + 1, structureFamily: "same" }));
  const errors = difficulty.validateTopicProgression(questions);
  assert.match(errors.join("\n"), /at least 5 structure fingerprints/);
  assert.match(errors.join("\n"), /appears 10 times/);
});
```

- [ ] **Step 2: 运行测试确认缺少模块**

Run: `node --test tests/curriculumQuality.test.js`

Expected: FAIL with missing fingerprint module.

- [ ] **Step 3: 实现稳定指纹**

```js
function createStructureFingerprint(question) {
  const operations = question.solution?.steps?.map((step) => step.operation) || [];
  return JSON.stringify({
    family: question.structureFamily,
    roles: [...question.conditionRoles].sort(),
    direction: question.questionDirection,
    representation: question.representation,
    answerKind: question.answerPolicy.kind,
    moves: question.reasoningMoves,
    operations
  });
}
```

不得读取 `prompt`、题目数字、故事场景、`title` 或题位前缀。

- [ ] **Step 4: 实现可解释难度评分**

```js
const MIN_SCORE_BY_SLOT = Object.freeze([1, 1, 2, 2, 2, 3, 3, 3, 4, 5]);

function evaluateDifficulty(question) {
  const dependentMoves = Math.max(0, question.reasoningMoves.length - 1);
  const representationShift = question.representationShift ? 1 : 0;
  const reverse = question.questionDirection === "reverse" || question.questionDirection === "find-parameter" ? 1 : 0;
  const supportingModels = question.supportingConcepts?.length || 0;
  const strategyChoice = question.strategyChoices?.length >= 2 ? 1 : 0;
  return { score: 1 + dependentMoves + representationShift + reverse + supportingModels + strategyChoice };
}
```

`validateTopicProgression` 还必须检查 10 个连续 slot、既定难度标签、至少 5 个指纹、单指纹最多 2 次、slot 4～10 不与 slot 1～2 同构、slot 8～10 有 `strategyChoices` 或辅助模型、slot 10 的有效条件不超过 4 且核心动作不超过 3。

- [ ] **Step 5: 运行测试确认通过**

Run: `node --test tests/curriculumQuality.test.js`

Expected: PASS.

- [ ] **Step 6: 提交**

```bash
git add game/curriculum/structureFingerprint.js game/curriculum/difficultyEngine.js tests/curriculumQuality.test.js
git commit -m "feat: validate mathematical structure and difficulty"
```

---

### Task 5: V3 单题门禁与现有运行时适配器

**Files:**
- Create: `game/curriculum/questionV3Quality.js`
- Create: `game/curriculum/runtimeAdapter.js`
- Modify: `game/questionQuality.js`
- Test: `tests/curriculumQuality.test.js`
- Test: `tests/questionQuality.test.js`
- Test: `tests/questionAccess.test.js`

**Interfaces:**
- Consumes: Tasks 1～4 的验证器。
- Produces: `validateQuestionV3(question, topic): string[]`、`adaptQuestionV3(question, topic): object`。

- [ ] **Step 1: 写失败测试，禁止缺字段、知识点错配和通用模板伪造解析**

```js
test("V3 题必须由作者提供认知动作、结构和可复算解析", () => {
  const errors = quality.validateQuestionV3({ schemaVersion: 3, id: "bad" }, curriculum.getCurriculumTopic("chicken-rabbit"));
  assert.match(errors.join("\n"), /missing prompt/);
  assert.match(errors.join("\n"), /missing reasoningMoves/);
  assert.match(errors.join("\n"), /missing solution/);
});

test("适配器保留作者字段并生成旧 UI 可读的 solutionReview", () => {
  const runtime = adapter.adaptQuestionV3(validQuestion(), curriculum.getCurriculumTopic("chicken-rabbit"));
  assert.equal(runtime.schemaVersion, 3);
  assert.equal(runtime.solutionReview.schemaVersion, 3);
  assert.deepEqual(runtime.reasoningMoves, validQuestion().reasoningMoves);
  assert.equal(runtime.solutionReview.verification, validQuestion().verification.summary);
});
```

- [ ] **Step 2: 运行测试确认缺少 V3 模块**

Run: `node --test tests/curriculumQuality.test.js tests/questionQuality.test.js tests/questionAccess.test.js`

Expected: FAIL with missing `questionV3Quality.js`.

- [ ] **Step 3: 实现 V3 聚合门禁**

`validateQuestionV3` 必须逐字段验证：`schemaVersion === 3`、稳定 ID、题干、答案策略、主辅知识点、结构、条件角色、认知动作、表示方式、问题方向、作者解析、独立验算和真实易错点。随后验证：

```js
const missingActions = topic.requiredActions.filter((move) => !question.reasoningMoves.includes(move));
if (missingActions.length) errors.push(`missing required actions: ${missingActions.join(", ")}`);
if (topic.excludedShortcuts.includes(question.shortcutType)) errors.push(`excluded shortcut: ${question.shortcutType}`);
```

- [ ] **Step 4: 实现运行时适配器，禁止用 slot 填充作者推理**

```js
function adaptQuestionV3(question, topic) {
  return {
    ...question,
    answerType: "numeric",
    answerFormat: question.answerPolicy.kind,
    learningObjective: topic.title,
    knowledgeGoal: topic.coreModel,
    typicalModel: question.solution.strategy,
    commonPitfall: question.commonPitfall,
    transferType: question.supportingConcepts.length ? "cross-concept" : "direct",
    verificationMethod: question.verification.summary,
    reasoningType: question.reasoningType,
    difficultyProfile: question.computedDifficulty,
    solutionReview: {
      schemaVersion: 3,
      method: question.solution.strategy,
      observation: question.solution.observation,
      steps: question.solution.steps.map((step) => step.explanation),
      stepKinds: question.solution.steps.map((step) => step.kind),
      calculation: question.solution.summary,
      answer: question.answer,
      answerFormat: question.answerPolicy.kind,
      verification: question.verification.summary,
      check: question.verification.summary,
      errorTrap: question.commonPitfall,
      pitfall: question.commonPitfall
    }
  };
}
```

- [ ] **Step 5: 在旧质量入口中按 schemaVersion 路由**

`validateQuestionQuality(question, topic)` 遇到 `schemaVersion === 3` 时只调用 V3 验证器；旧题逻辑保持原样，确保当前 1080 题不被新门禁误伤。

- [ ] **Step 6: 运行目标测试与现有质量回归**

Run: `node --test tests/curriculumQuality.test.js tests/questionQuality.test.js tests/questionAccess.test.js`

Expected: PASS.

- [ ] **Step 7: 提交**

```bash
git add game/curriculum/questionV3Quality.js game/curriculum/runtimeAdapter.js game/questionQuality.js tests/curriculumQuality.test.js tests/questionQuality.test.js tests/questionAccess.test.js
git commit -m "feat: add versioned question quality contract"
```

---

### Task 6: 兼容槽位与原子内容批次注册

**Files:**
- Create: `game/curriculum/compatibilityMap.js`
- Create: `game/curriculum/contentBatchRegistry.js`
- Modify: `game/chapterBuilder.js`
- Test: `tests/curriculumBatch.test.js`
- Test: `tests/chapterBuilder.test.js`

**Interfaces:**
- Consumes: V3 质量门禁和运行时适配器。
- Produces: `validateCompatibilityMap(batch): string[]`、`getActiveTopicQuestions(chapterId, moduleId): object[]|null`、`validateContentBatch(batch): string[]`。

- [ ] **Step 1: 写失败测试，锁定稳定 ID、整包覆盖和失败回退**

```js
test("金样槽位映射保留三个现有关卡的全部题目 ID", () => {
  assert.deepEqual(map.GOLD_SLOT_IDS["chicken-rabbit"], [
    "chicken-rabbit-1", "chicken-rabbit-2", "chicken-rabbit-3", "chicken-rabbit-4",
    "chapter-01-chicken-rabbit-advance-1", "chicken-rabbit-5", "chicken-rabbit-6",
    "chicken-rabbit-9", "chicken-rabbit-7", "chicken-rabbit-8"
  ]);
  assert.equal(map.GOLD_SLOT_IDS["shortest-path"].length, 10);
  assert.equal(map.GOLD_SLOT_IDS["integrated-modeling"].length, 10);
});

test("无效或未审核批次不覆盖现有题库", () => {
  const before = builder.buildChapter("chapter-08", []).levels.find((level) => level.moduleId === "shortest-path").questions;
  registry.setBatchForTest({ id: "bad", status: "candidate", topics: [] });
  const after = builder.buildChapter("chapter-08", []).levels.find((level) => level.moduleId === "shortest-path").questions;
  assert.deepEqual(after.map((q) => q.id), before.map((q) => q.id));
});
```

- [ ] **Step 2: 运行测试确认缺少兼容模块**

Run: `node --test tests/curriculumBatch.test.js tests/chapterBuilder.test.js`

Expected: FAIL with missing `compatibilityMap.js`.

- [ ] **Step 3: 实现映射和批次状态机**

```js
const BATCH_STATUSES = Object.freeze(["candidate", "approved", "active", "rejected"]);

function canActivateBatch(batch, automatedErrors, reviewManifest) {
  return batch.status === "approved"
    && automatedErrors.length === 0
    && reviewManifest?.schemaVersion === 3
    && reviewManifest?.status === "approved";
}
```

批次必须包含恰好 10 题的完整知识点包；任何 ID 缺失、重复、顺序变化或质量错误都使整个批次不可用。

- [ ] **Step 4: 在 chapterBuilder 中增加单一回退入口**

```js
const versioned = ContentBatchRegistry.getActiveTopicQuestions(chapterId, module.id);
const allPractices = versioned
  ? versioned.map((question) => RuntimeAdapter.adaptQuestionV3(question, topic))
  : [...(module.practices || []), ...supplemental].map((practice) => ({ ...practice }));
```

V3 题已经按 1～10 槽位排序时，builder 必须按 `slot` 选择，不能再次按难度 `find` 导致同难度题顺序漂移。

- [ ] **Step 5: 运行测试确认旧题完全不变**

Run: `node --test tests/curriculumBatch.test.js tests/chapterBuilder.test.js tests/chapter07to09.test.js`

Expected: PASS；候选批次不改变当前生产题目 ID、答案或数量。

- [ ] **Step 6: 提交**

```bash
git add game/curriculum/compatibilityMap.js game/curriculum/contentBatchRegistry.js game/chapterBuilder.js tests/curriculumBatch.test.js tests/chapterBuilder.test.js
git commit -m "feat: add atomic curriculum content batches"
```

---

### Task 7: 三年级“鸡兔同笼”10 题候选金样

**Files:**
- Create: `game/curriculum/gold/chickenRabbit.js`
- Modify: `tests/curriculumBatch.test.js`

**Interfaces:**
- Consumes: Tasks 1～6 的 V3 契约。
- Produces: `CHICKEN_RABBIT_GOLD_QUESTIONS`，按兼容槽位顺序提供 10 个冻结对象。

- [ ] **Step 1: 写失败测试锁定十题结构蓝图**

```js
test("鸡兔同笼金样从识别差量递进到跨点验证", () => {
  const questions = require("../game/curriculum/gold/chickenRabbit.js");
  assert.equal(questions.length, 10);
  assert.deepEqual(questions.map((q) => q.slot), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(new Set(questions.map(createStructureFingerprint)).size >= 5, true);
  assert.deepEqual(validateTopicProgression(questions), []);
  assert.equal(questions[9].supportingConcepts.includes("sum-diff"), true);
});
```

- [ ] **Step 2: 运行测试确认内容文件不存在**

Run: `node --test tests/curriculumBatch.test.js`

Expected: FAIL with missing `gold/chickenRabbit.js`.

- [ ] **Step 3: 按以下十题蓝图写入完整 V3 对象**

| 槽位 | 数学结构 | 题意与答案 | 主方法/独立验算 |
|---|---|---|---|
| 1 | 统一假设识别 | 8 辆两轮/三轮车共 21 个轮，三轮车 5 辆 | 全按两轮；回代轮数 |
| 2 | 标准鸡兔 | 10 只、28 只脚，兔 4 只 | 全按鸡；头脚回代 |
| 3 | 表格表示转换 | 12 个模型、32 个轮，四轮模型 4 个 | 差量表；逐类计数 |
| 4 | 逆向求总属性 | 14 只中兔 6 只，共 40 只脚 | 分类求和；假设法反验 |
| 5 | 条件辨析 | 题干含“笼子编号”干扰，16 只、44 脚，龟 6 只 | 排除无关条件；回代 |
| 6 | 属性差非 2 | 12 辆自行车/三轮车共 30 轮，三轮车 6 辆 | 每辆差 1；分类求和 |
| 7 | 两步依赖 | 20 枚 2 元/5 元币总值 64 元，5 元币 8 枚 | 先假设总值再求差；总枚数和总值回代 |
| 8 | 两种方法选择 | 18 个大小盒共装 66 件，大盒 5、小盒 3，大盒 6 个 | 假设法或方程；选择假设法并用分类求和验算 |
| 9 | 和差辅助迁移 | 两类机器人共 24 台，四足比两足少 8 台，四足 8 台 | 和差先求分类；脚数作为验证 |
| 10 | Boss 条件转化 | 22 辆两/三轮车，修好 5 辆三轮后已知总轮数 49，原三轮车 5 辆 | 先还原完整轮数 54，再假设；分类回代 |

每题对象必须显式包含 `schemaVersion: 3`、兼容 ID、slot、difficulty、answerPolicy、primaryConcept、supportingConcepts、structureFamily、conditionRoles、reasoningMoves、representation、questionDirection、strategyChoices、solution、verification、commonPitfall 和 `storyBeat`。不得从 slot 生成推理字段。

- [ ] **Step 4: 运行自动质量测试**

Run: `node --test tests/curriculumBatch.test.js tests/curriculumQuality.test.js tests/solutionEngine.test.js`

Expected: PASS；10 题答案均可复算，结构不少于 5 种。

- [ ] **Step 5: 提交**

```bash
git add game/curriculum/gold/chickenRabbit.js tests/curriculumBatch.test.js
git commit -m "content: add chicken rabbit gold questions"
```

---

### Task 8: 六年级“最短路线”10 题候选金样

**Files:**
- Create: `game/curriculum/gold/shortestPath.js`
- Modify: `tests/curriculumBatch.test.js`

**Interfaces:**
- Consumes: Tasks 1～6 的 V3 契约。
- Produces: `SHORTEST_PATH_GOLD_QUESTIONS`。

- [ ] **Step 1: 写失败测试，确保不退化为横纵步数直接相加**

```js
test("最短路线每题都包含候选路线或约束，且不命中禁止捷径", () => {
  for (const question of require("../game/curriculum/gold/shortestPath.js")) {
    assert.notEqual(question.shortcutType, "given-horizontal-plus-vertical", question.id);
    assert.ok(question.strategyChoices.length >= 2 || question.conditionRoles.includes("route-constraint"), question.id);
  }
});
```

- [ ] **Step 2: 运行测试确认内容文件不存在**

Run: `node --test tests/curriculumBatch.test.js`

Expected: FAIL with missing `gold/shortestPath.js`.

- [ ] **Step 3: 按以下十题蓝图写入完整 V3 对象**

| 槽位 | 数学结构 | 题意与答案 | 策略变化 |
|---|---|---|---|
| 1 | 两路线比较 | A 路 6+5，B 路 4+8，最短 11 格 | 分别求和后取小 |
| 2 | 必经点 | 起点到补给点 7 格，再到终点 6 格；直达 15 格，最短 13 格 | 识别必经路线 |
| 3 | 表格转路线 | 表给三条路线 18、16、19 分钟，选第 2 条 | 表示转换 |
| 4 | 逆向补段 | 最短总长 17，前段 9，后段 8 | 从总路程反求缺段 |
| 5 | 障碍约束 | 12 格直路封闭；绕行 5+4+5=14，另一绕行 6+3+6=15，最短 14 | 排除非法直路 |
| 6 | 不同代价 | 路线甲 8 平地；乙 5 平地+2 楼梯，每楼梯折 2 格，甲 8、乙 9，选甲 | 统一代价单位 |
| 7 | 两级依赖 | 先选到中转站的短路 7，再比较后段 8/10，总长 15 | 局部最优与依赖 |
| 8 | 方法选择 | 小网格含一个禁行方格，枚举上绕/下绕均 10，答案 10 | 列表或画图，选择列表 |
| 9 | 比例迁移 | 地图比例 1 格=200 米，最短 13 格，实际 2600 米 | 最短路线＋比例尺 |
| 10 | Boss 多约束 | 三路线分别 12 格含 3 格慢行、14 格无慢行、11 格含 5 格慢行；慢行每格多 1 分钟，总耗时 15、14、16，最短 14 | 路长与时间模型组合并复核三候选 |

- [ ] **Step 4: 运行自动质量测试**

Run: `node --test tests/curriculumBatch.test.js tests/curriculumQuality.test.js tests/solutionEngine.test.js`

Expected: PASS；不存在 `given-horizontal-plus-vertical` 捷径。

- [ ] **Step 5: 提交**

```bash
git add game/curriculum/gold/shortestPath.js tests/curriculumBatch.test.js
git commit -m "content: add shortest path gold questions"
```

---

### Task 9: 杯赛入门“综合建模”10 题候选金样

**Files:**
- Create: `game/curriculum/gold/integratedModeling.js`
- Create: `game/curriculum/gold/index.js`
- Modify: `tests/curriculumBatch.test.js`

**Interfaces:**
- Consumes: 前两套金样和批次接口。
- Produces: `INTEGRATED_MODELING_GOLD_QUESTIONS`、`GOLD_V3_BATCH`。

- [ ] **Step 1: 写失败测试，Boss 必须组合模型而非单式代入**

```js
test("综合建模金样逐步增加辅助模型且 Boss 不退化为单式", () => {
  const questions = require("../game/curriculum/gold/integratedModeling.js");
  assert.equal(questions.length, 10);
  assert.equal(questions[8].supportingConcepts.length >= 1, true);
  assert.equal(questions[9].supportingConcepts.length >= 2, true);
  assert.notEqual(questions[9].shortcutType, "single-expression-substitution");
});
```

- [ ] **Step 2: 运行测试确认内容文件不存在**

Run: `node --test tests/curriculumBatch.test.js`

Expected: FAIL with missing `gold/integratedModeling.js`.

- [ ] **Step 3: 按以下十题蓝图写入完整 V3 对象**

| 槽位 | 数学结构 | 题意与答案 | 模型组合 |
|---|---|---|---|
| 1 | 模型识别 | 48 份物资按 1:3 分配，少的一组 12 份 | 比例 |
| 2 | 单模型两步 | 每 4 户需 3 箱，20 户需 15 箱 | 归一＋归总 |
| 3 | 表格转换 | 两方案成本表：固定费与单价，代入 6 件后甲 38、乙 36，选方案 2 | 表格＋算式 |
| 4 | 逆向参数 | 总费用 50，固定 8，每件 6，购买 7 件 | 逆向方程 |
| 5 | 条件辨析 | 含建筑颜色干扰；84 平方米中 1/3 绿化，剩 56 | 分数＋面积 |
| 6 | 结构变式 | 长方形 12×8 挖去 4×3，再按每平方米 2 块铺装，共 168 块 | 几何分割＋归总 |
| 7 | 多步依赖 | 甲速 60、乙速 40 相向，距离 300，1.5 小时相遇 | 行程＋和速 |
| 8 | 方法选择 | 两运输方案：3 辆×8 箱与 4 辆×6 箱同为 24，再比较费用 90/84，选方案 2 | 等效比较＋优化 |
| 9 | 跨点迁移 | 60 人按 2:3 分组，甲组每 4 人一桌，甲组需 6 桌 | 比例＋最不利整桌数 |
| 10 | Boss 综合 | 240 米路线按 3:5 分两段；前段每分钟 30 米、后段每分钟 25 米，总时间 9 分钟 | 比例分配＋分段行程；用总路程回验 |

Boss 只使用小学范围内的比例分配和分段行程，核心推理动作固定为 `identify → substitute → verify`，有效条件不超过 4 个。

- [ ] **Step 4: 组装候选批次，保持默认不激活**

```js
const GOLD_V3_BATCH = Object.freeze({
  id: "gold-v3",
  schemaVersion: 3,
  status: "candidate",
  contentVersion: "2026.08.13-gold.1",
  topics: Object.freeze([
    { chapterId: "chapter-01", moduleId: "chicken-rabbit", questions: CHICKEN_RABBIT_GOLD_QUESTIONS },
    { chapterId: "chapter-08", moduleId: "shortest-path", questions: SHORTEST_PATH_GOLD_QUESTIONS },
    { chapterId: "chapter-09", moduleId: "integrated-modeling", questions: INTEGRATED_MODELING_GOLD_QUESTIONS }
  ])
});
```

- [ ] **Step 5: 运行三个金样的完整自动门禁**

Run: `node --test tests/curriculumBatch.test.js tests/curriculumQuality.test.js tests/solutionEngine.test.js`

Expected: PASS；批次为 candidate，30 题自动质量错误为 0。

- [ ] **Step 6: 提交**

```bash
git add game/curriculum/gold/integratedModeling.js game/curriculum/gold/index.js tests/curriculumBatch.test.js
git commit -m "content: add cup entry modeling gold questions"
```

---

### Task 10: 带证据的人工审核 V3 与候选校验 CLI

**Files:**
- Modify: `scripts/generate-human-review-template.js`
- Modify: `scripts/validate-game-content.js`
- Create: `scripts/validate-curriculum-batch.js`
- Create: `content/humanReview/candidates/gold-v3.json`
- Modify: `tests/validateGameContent.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `GOLD_V3_BATCH`、现有内容哈希工具。
- Produces: schema V3 review manifest、`validateCurriculumBatch(batch, manifest): report`、`npm run validate:curriculum`。

- [ ] **Step 1: 写失败测试，审核必须有证据且内容变化自动失效**

```js
test("V3 审核记录必须逐题给出六项结论和审核证据", () => {
  const manifest = reviewTemplate.buildCurriculumBatchReviewTemplate(GOLD_V3_BATCH);
  assert.equal(manifest.schemaVersion, 3);
  assert.equal(manifest.status, "pending");
  assert.equal(manifest.records.length, 30);
  assert.equal(manifest.records.every((record) => record.evidence === ""), true);
  const report = validation.validateCurriculumBatch(GOLD_V3_BATCH, { ...manifest, status: "approved" });
  assert.match(report.errors.join("\n"), /missing review evidence/);
});

test("V3 题目哈希变化后 approved 审核失效", () => {
  const approved = makeApprovedV3Manifest();
  const changed = structuredClone(GOLD_V3_BATCH);
  changed.topics[0].questions[0].prompt += "修改";
  assert.match(validation.validateCurriculumBatch(changed, approved).errors.join("\n"), /content hash mismatch/);
});
```

- [ ] **Step 2: 运行测试确认缺少 V3 审核接口**

Run: `node --test tests/validateGameContent.test.js`

Expected: FAIL with `buildCurriculumBatchReviewTemplate is not a function`.

- [ ] **Step 3: 实现 V3 审核记录**

```js
const V3_REVIEW_CRITERIA = Object.freeze([
  "conceptAccurate", "difficultyValid", "contextNecessary",
  "answerUnique", "solutionChildExecutable", "pitfallAuthentic"
]);

const record = {
  questionId: question.id,
  contentHash: getQuestionContentHash(question),
  reviewer: "",
  reviewedAt: "",
  decisions: Object.fromEntries(V3_REVIEW_CRITERIA.map((criterion) => [criterion, null])),
  evidence: ""
};
```

状态仅允许 `pending`、`approved`、`rejected`。`approved` 要求每项 decision 为 `true`、reviewer/reviewedAt/evidence 非空且哈希一致；`rejected` 至少有一项 false 和具体 evidence。

- [ ] **Step 4: 生成候选清单并接入 CLI**

Run: `node scripts/generate-human-review-template.js --batch gold-v3`

Expected: 创建 `content/humanReview/candidates/gold-v3.json`，状态 `pending`，30 条记录，所有 decision 为 `null`。

`package.json` 增加：

```json
"validate:curriculum": "node scripts/validate-curriculum-batch.js --batch gold-v3"
```

- [ ] **Step 5: 验证候选状态不会误报为可发布**

Run: `npm run validate:curriculum`

Expected: exit 1，输出 `gold-v3: human review status is pending`，同时自动质量错误为 0。

- [ ] **Step 6: 运行旧审核回归**

Run: `node --test tests/validateGameContent.test.js && npm run validate:game`

Expected: PASS；现有 schema V2 生产清单仍有效，候选批次不影响生产发布。

- [ ] **Step 7: 提交**

```bash
git add scripts/generate-human-review-template.js scripts/validate-game-content.js scripts/validate-curriculum-batch.js content/humanReview/candidates/gold-v3.json tests/validateGameContent.test.js package.json
git commit -m "feat: require evidence for curriculum review"
```

---

### Task 11: 人工审核门禁与金样批次原子启用

**Files:**
- Modify: `content/humanReview/candidates/gold-v3.json`
- Modify: `game/curriculum/gold/index.js`
- Modify: `game/curriculum/contentBatchRegistry.js`
- Modify: `tests/curriculumBatch.test.js`
- Modify: `tests/chapterBuilder.test.js`

**Interfaces:**
- Consumes: 课程负责人逐题审核后的 schema V3 manifest。
- Produces: 可回退的 `gold-v3` active 批次。

- [ ] **Step 1: 暂停执行并请求用户/课程负责人审核 30 道候选题**

审核者必须逐题填写真实 `reviewer`、ISO 8601 `reviewedAt`、六项 boolean decision 和至少一句针对本题的 `evidence`。禁止脚本批量写入统一证据或统一通过。

Expected checkpoint: 用户明确回复审核通过，或指出需修改的题目 ID。若有驳回项，回到 Tasks 7～9 修改内容，内容哈希变化后重新审核。

- [ ] **Step 2: 写失败测试，要求 active 批次实际替换三个知识点且保留 ID**

```js
test("获批金样批次原子替换三个知识点且保留兼容槽位", () => {
  for (const [chapterId, moduleId] of [["chapter-01", "chicken-rabbit"], ["chapter-08", "shortest-path"], ["chapter-09", "integrated-modeling"]]) {
    const level = builder.buildChapter(chapterId, []).levels.find((entry) => entry.moduleId === moduleId);
    assert.equal(level.questions.every((question) => question.schemaVersion === 3), true);
    assert.deepEqual(level.questions.map((question) => question.id), GOLD_SLOT_IDS[moduleId]);
  }
});
```

- [ ] **Step 3: 运行测试确认批次仍为 candidate**

Run: `node --test tests/curriculumBatch.test.js tests/chapterBuilder.test.js`

Expected: FAIL because built questions still use legacy schema.

- [ ] **Step 4: 仅在审核清单有效时切换状态**

将 `GOLD_V3_BATCH.status` 改为 `approved`；registry 在启动时调用 `canActivateBatch`，通过后在内存中暴露为 `active`。不得把人工审核结果硬编码在 JS 中。

- [ ] **Step 5: 运行批次和生产发布校验**

Run: `npm run validate:curriculum && npm run validate:release`

Expected: 两个命令均 exit 0；输出 `gold-v3: active, 3 topics, 30 questions`，生产总题数仍为 1080。

- [ ] **Step 6: 运行兼容回归**

Run: `node --test tests/curriculumBatch.test.js tests/chapterBuilder.test.js tests/progressionModel.test.js tests/rewardEconomy.test.js tests/storageAdapter.test.js`

Expected: PASS；题目 ID、奖励幂等和旧存档均保持兼容。

- [ ] **Step 7: 提交**

```bash
git add content/humanReview/candidates/gold-v3.json game/curriculum/gold/index.js game/curriculum/contentBatchRegistry.js tests/curriculumBatch.test.js tests/chapterBuilder.test.js
git commit -m "feat: activate approved olympiad gold batch"
```

---

### Task 12: 文档、全量验证与下一批输入

**Files:**
- Modify: `README.md`
- Create: `docs/curriculum/content-authoring-v3.md`
- Create: `docs/curriculum/gold-v3-review-summary.md`
- Modify: `docs/superpowers/plans/2026-08-13-olympiad-curriculum-foundation-gold-samples.md`（只勾选实际完成步骤）

**Interfaces:**
- Consumes: 已激活或仍处于候选状态的 `gold-v3` 批次。
- Produces: 后续 360 题计划可复用的作者规范、命令和金样基线。

- [ ] **Step 1: 写作者规范，提供一个完整 V3 题目示例**

文档必须解释知识点契约、答案策略、结构指纹、难度评分、解题步骤、独立验算、审核证据、候选验证和原子启用。示例直接引用已审核的鸡兔同笼第 2 题，不另造一个可能漂移的示例。

- [ ] **Step 2: 写金样审核摘要**

摘要按三个知识点记录：10 题结构分布、难度分布、审核者、审核日期、被驳回后修改过的题目 ID、最终内容哈希。若 Task 11 尚未获批，文档必须明确写 `status: candidate`，不得宣称已发布。

- [ ] **Step 3: 更新 README 命令和内容工作流**

```markdown
npm run validate:curriculum   # 校验 gold-v3 自动门禁与人工审核状态
npm run validate:release      # 校验全部生产题、奖励链和已激活课程批次
```

- [ ] **Step 4: 运行全量验证**

Run: `npm test`

Expected: PASS，原 179 项测试和新增测试全部通过。

Run: `npm run check && npm run validate:release && npm run build && npm run check:bundle`

Expected: 全部 exit 0。

Run: `git diff --check && git status --short`

Expected: 无空白错误；只包含本计划的预期文档改动。

- [ ] **Step 5: 提交文档**

```bash
git add README.md docs/curriculum/content-authoring-v3.md docs/curriculum/gold-v3-review-summary.md docs/superpowers/plans/2026-08-13-olympiad-curriculum-foundation-gold-samples.md
git commit -m "docs: document curriculum v3 authoring workflow"
```

- [ ] **Step 6: 为第 1～3 章计划记录确定输入**

下一份计划必须直接消费本批确定的接口：`validateTopicDefinition`、`validateQuestionV3`、`validateTopicProgression`、`GOLD_SLOT_IDS`、`validateCurriculumBatch` 和 schema V3 人工审核记录，不得创建第二套并行质量系统。
