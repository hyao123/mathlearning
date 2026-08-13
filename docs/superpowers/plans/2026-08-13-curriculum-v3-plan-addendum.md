# Curriculum V3 Implementation Plan Addendum

> **For agentic workers:** This addendum is mandatory when executing `2026-08-13-olympiad-curriculum-foundation-gold-samples.md` and `2026-08-13-curriculum-content-version.md`. It resolves cross-plan interfaces and adds two spec requirements found during self-review.

## Execution Order

1. Execute foundation plan Tasks 1～6.
2. Execute this addendum Tasks A～B.
3. Execute the complete content-version plan.
4. Resume foundation plan Tasks 7～10.
5. Stop for the Task 11 human-review gate.
6. After approval, execute foundation plan Tasks 11～12.

## Mandatory Corrections

- In foundation Task 3, use `assert.throws(() => engine.evaluateSteps(...), /division by zero/)`; `assert.match` only accepts strings.
- The authoritative batch lookup signature is:

```ts
getActiveTopicQuestions(chapterId: string, moduleId: string): {
  questions: object[];
  contentVersion: string;
} | null
```

- In foundation Task 6, replace direct array use with `versioned.questions`, and attach `versioned.contentVersion` to the compiled level as specified by the content-version plan.
- In foundation Task 10, `scripts/humanReviewIntegrity.js` is also a modified file. V3 hashes must cover all pedagogical content, not only title and prompt.

---

### Task A: 年级可读性门禁

**Files:**
- Create: `game/curriculum/readability.js`
- Modify: `game/curriculum/questionV3Quality.js`
- Modify: `tests/curriculumQuality.test.js`

**Interfaces:**
- Consumes: `topic.gradeBand`、`question.prompt`、`question.readingProfile.unfamiliarTerms`。
- Produces: `validateReadability(question, gradeBand): string[]`。

- [ ] **Step 1: 写失败测试**

```js
test("三年级题拒绝超长题干和过多陌生词", () => {
  const errors = readability.validateReadability({
    prompt: "甲".repeat(71),
    readingProfile: { unfamiliarTerms: ["折返线", "优先级"] }
  }, "grade-3");
  assert.match(errors.join("\n"), /prompt exceeds 70 characters/);
  assert.match(errors.join("\n"), /unfamiliar terms exceed 1/);
});
```

- [ ] **Step 2: 运行测试确认模块不存在**

Run: `node --test tests/curriculumQuality.test.js`

Expected: FAIL with missing `readability.js`.

- [ ] **Step 3: 实现明确年级限制**

```js
const LIMITS = Object.freeze({
  "grade-3": { promptChars: 70, sentences: 2, unfamiliarTerms: 1 },
  "grade-4": { promptChars: 85, sentences: 3, unfamiliarTerms: 1 },
  "grade-5": { promptChars: 100, sentences: 3, unfamiliarTerms: 2 },
  "grade-6": { promptChars: 120, sentences: 4, unfamiliarTerms: 2 },
  "cup-entry": { promptChars: 120, sentences: 4, unfamiliarTerms: 3 }
});

function validateReadability(question, gradeBand) {
  const errors = [];
  const limit = LIMITS[gradeBand];
  const prompt = String(question.prompt || "");
  const sentenceCount = prompt.split(/[。！？；]/).filter((part) => part.trim()).length;
  const unfamiliarTerms = question.readingProfile?.unfamiliarTerms;
  if (!Array.isArray(unfamiliarTerms)) errors.push("readingProfile.unfamiliarTerms must be an array");
  if ([...prompt].length > limit.promptChars) errors.push(`prompt exceeds ${limit.promptChars} characters`);
  if (sentenceCount > limit.sentences) errors.push(`prompt exceeds ${limit.sentences} sentences`);
  if (Array.isArray(unfamiliarTerms) && unfamiliarTerms.length > limit.unfamiliarTerms) errors.push(`unfamiliar terms exceed ${limit.unfamiliarTerms}`);
  return errors;
}
```

- [ ] **Step 4: 接入 V3 门禁并运行测试**

`validateQuestionV3` 必须追加 `validateReadability(question, topic.gradeBand)` 的错误。

Run: `node --test tests/curriculumQuality.test.js`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add game/curriculum/readability.js game/curriculum/questionV3Quality.js tests/curriculumQuality.test.js
git commit -m "feat: enforce grade readability limits"
```

---

### Task B: V3 完整内容哈希

**Files:**
- Modify: `scripts/humanReviewIntegrity.js`
- Modify: `tests/validateGameContent.test.js`

**Interfaces:**
- Consumes: schema V3 question。
- Produces: `getQuestionContentHash(question)` 对所有教学字段的稳定 SHA-256。

- [ ] **Step 1: 写失败测试，任一教学字段变化都使审核失效**

```js
test("V3 hash covers reasoning, solution, verification and answer policy", () => {
  const base = validV3Question();
  const fields = [
    ["reasoningMoves", [...base.reasoningMoves, "compare"]],
    ["answerPolicy", { kind: "integer", min: 0 }],
    ["solution", { ...base.solution, strategy: "changed" }],
    ["verification", { ...base.verification, summary: "changed" }]
  ];
  for (const [field, value] of fields) {
    assert.notEqual(integrity.getQuestionContentHash({ ...base, [field]: value }), integrity.getQuestionContentHash(base), field);
  }
});
```

- [ ] **Step 2: 运行测试确认当前哈希遗漏 V3 字段**

Run: `node --test tests/validateGameContent.test.js`

Expected: FAIL on at least `reasoningMoves` or `solution`.

- [ ] **Step 3: 实现排序稳定的 canonical payload**

```js
function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortObject(value[key])]));
}

function getReviewedQuestionPayload(question) {
  if (question.schemaVersion !== 3) return getLegacyReviewedQuestionPayload(question);
  const {
    id, title, prompt, answer, answerPolicy, difficulty, primaryConcept,
    supportingConcepts, structureFamily, conditionRoles, reasoningMoves,
    representation, questionDirection, solution, verification,
    commonPitfall, readingProfile
  } = question;
  return sortObject({
    schemaVersion: 3, id, title, prompt, answer, answerPolicy, difficulty,
    primaryConcept, supportingConcepts, structureFamily, conditionRoles,
    reasoningMoves, representation, questionDirection, solution,
    verification, commonPitfall, readingProfile
  });
}
```

不得把 `reviewer`、`reviewedAt`、奖励预览、运行时 slot 文案或 UI 派生字段写入内容哈希。

- [ ] **Step 4: 运行审核与旧清单回归**

Run: `node --test tests/validateGameContent.test.js && npm run validate:game`

Expected: PASS；schema V2 清单哈希不变，V3 任一教学字段变化都会失效。

- [ ] **Step 5: 提交**

```bash
git add scripts/humanReviewIntegrity.js tests/validateGameContent.test.js
git commit -m "feat: hash complete curriculum review content"
```
