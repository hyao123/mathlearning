# Curriculum V3 Authoritative Interface Contracts

This file is normative for the Curriculum V3 implementation plans. If a shorthand snippet in another plan omits a field, use the signatures and return shapes below.

## Curriculum

```ts
type GradeBand = "grade-3" | "grade-4" | "grade-5" | "grade-6" | "cup-entry";

validateTopicDefinition(topic: CurriculumTopic): string[];
validateCurriculumGraph(
  topics: CurriculumTopic[],
  options?: { externalPrerequisiteIds?: string[] }
): string[];
getCurriculumTopic(topicId: string): CurriculumTopic | null;
```

`validateCurriculumGraph` treats an ID as valid only when it exists in `topics` or `externalPrerequisiteIds`; cycle detection applies to edges whose endpoints both exist in `topics`.

## Answers

```ts
type AnswerPolicy =
  | { kind: "integer" }
  | { kind: "decimal"; precision?: number }
  | { kind: "fraction"; simplified: boolean }
  | { kind: "percent" }
  | { kind: "quotient-remainder" }
  | { kind: "multi-number"; count: number; unordered: boolean };

validateAnswerPolicy(answer: string, policy: AnswerPolicy): string[];
matchesAnswerPolicy(userAnswer: string, expectedAnswer: string, policy: AnswerPolicy): boolean;
```

`game/questionContract.js` must extend `ANSWER_FORMATS` with `quotient-remainder` and `multi-number`. For schema V3, `answerFormat` equals `answerPolicy.kind`. Legacy schema continues accepting its current four formats.

## Solution Evaluation

```ts
type StepOperand = number | string; // "$stepId" is the only reference syntax
type SolutionStep = {
  id: string;
  kind: "observe" | "model" | "calculate" | "verify";
  operation: "add" | "subtract" | "multiply" | "divide" | "sum" | "min" | "max" | "ceilDivide" | "remainder";
  operands: StepOperand[];
  result: number;
  explanation: string;
};

evaluateSteps(steps: SolutionStep[]): { values: Map<string, number>; finalValue: number };
validateSolution(question: QuestionV3): string[];
```

The verification block uses the same step structure, but its `strategy` must differ from `solution.strategy`.

## Difficulty

```ts
type ComputedDifficulty = {
  score: number;
  steps: number;
  conditions: number;
  representation: string;
  direction: string;
  transfer: "direct" | "representation-shift" | "cross-concept" | "boss-integration";
};

evaluateDifficulty(question: QuestionV3): ComputedDifficulty;
validateTopicProgression(questions: QuestionV3[]): string[];
```

`runtimeAdapter.adaptQuestionV3` must call `evaluateDifficulty(question)` directly and assign the result to `difficultyProfile`; authored content must not provide or override `computedDifficulty`.

## Runtime Adaptation

```ts
adaptQuestionV3(question: QuestionV3, topic: CurriculumTopic): RuntimeQuestion;
```

`solutionReview.stepKinds` is derived from each solution step's `kind`, never from slot. Schema V3 review output may use the existing four UI kinds (`observe`, `model`, `calculate`, `verify`) so no presentation branch is required.

## Content Batches

```ts
type ActiveTopicContent = {
  questions: QuestionV3[];
  contentVersion: string;
};

getActiveTopicQuestions(chapterId: string, moduleId: string): ActiveTopicContent | null;
validateContentBatch(batch: ContentBatch): string[];
```

`chapterBuilder` uses `versioned.questions` and copies `versioned.contentVersion` onto the compiled level. Candidate, rejected, malformed or unreviewed batches always return `null` from the active lookup.

## Review Integrity

```ts
getQuestionContentHash(question: LegacyQuestion | QuestionV3): string;
validateCurriculumBatch(batch: ContentBatch, manifest: ReviewManifestV3): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  questionCount: number;
};
```

For V3, the hash includes every pedagogical field listed in the mandatory addendum and excludes reviewer metadata, rewards and UI-derived fields.
