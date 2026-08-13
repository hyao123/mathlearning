# Task 2 Report: Answer Policies and Backward-Compatible Judging

## Implementation

- Added `game/curriculum/answerPolicy.js` with explicit policies for integer, decimal (optional fixed precision), fraction (required simplification), percent, quotient-remainder, and multi-number responses.
- Policy validation reports invalid policy configuration, invalid answer shape, non-simplified fractions, negative remainders, and incorrect multi-number counts.
- Policy matching accepts Chinese `余` and `...` quotient-remainder notation, numeric multi-number values, optional unordered results, and returns `null` when no policy is supplied so legacy matching remains authoritative.
- `AnswerMatcher.isAnswerCorrect` delegates only when `options.answerPolicy` is present; its exact/unit, numeric-equivalence, boolean, unordered-token, and accepted-answer flow is otherwise unchanged.
- Schema V3 question contracts require `answerPolicy`, validate the policy against the authored answer, and require `answerFormat === answerPolicy.kind`. Legacy questions retain the original four-format numeric validation.
- `questionAccess.judgeAnswer` forwards `question.answerPolicy`.
- Added the minimal CommonJS browser-loader registration in `src/game-main.js` so the shipped application can load the policy before question contract and matcher modules.

## TDD Evidence

### RED 1: new module

Command:

```powershell
node --test tests/answerPolicy.test.js tests/answerMatcher.test.js tests/questionAccess.test.js
```

Result: failed as expected with `Cannot find module '../game/curriculum/answerPolicy.js'`.

### RED 2: integration routing

After adding the policy module and then temporarily restoring the three integration points, ran:

```powershell
node --test tests/answerPolicy.test.js tests/answerMatcher.test.js tests/questionAccess.test.js tests/questionQuality.test.js
```

Result: three expected failures:

- legacy numeric equivalence incorrectly accepted `2/6` for a simplified-fraction policy;
- `judgeAnswer` did not forward the policy;
- V3 `quotient-remainder` answers were rejected by legacy answer-format validation.

### RED 3: no-policy fallback

Command:

```powershell
node --test tests/answerPolicy.test.js
```

Result: failed as expected because `matchesAnswerPolicy("0.5", "1/2")` returned `false`, before the policy-null fallback was added.

### GREEN

Focused command:

```powershell
node --test tests/answerPolicy.test.js tests/answerMatcher.test.js tests/questionAccess.test.js tests/questionQuality.test.js
```

Result: passed, 24 tests passed and 0 failed.

## Verification

```powershell
npm test
npm run build
git diff --check
```

Results:

- `npm test`: passed, 190 tests passed and 0 failed.
- `npm run build`: passed; Vite emitted the production bundle, including answer-policy chunks.
- `git diff --check`: no whitespace errors.

## Self-Review

- Checked that policy routing is opt-in, preserving all legacy matcher behavior when `answerPolicy` is absent.
- Checked that a malformed explicit policy rejects rather than falling back to legacy numeric matching.
- Checked that V3 only gains its extended formats; legacy `answerFormat` validation still permits exactly its original four values.
- Checked that the browser CommonJS registry loads the policy before its two consumers, avoiding a runtime-only missing-dependency error.

## Concerns

None.