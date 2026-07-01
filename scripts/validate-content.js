const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const allowedGrades = new Set(["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"]);
const allowedDifficulties = new Set(["基础", "进阶", "提高", "挑战"]);

global.window = globalThis;

[
  "data.js",
  "contentExpansion.js",
  "knowledgeContinuityExpansion.js",
  "priorityContentExpansion.js",
  "supplementalContentExpansion.js",
  "supplementalContentFixes.js",
  "knowledgeTopology.js",
  "supplementalTopologyExpansion.js",
  "mathEssence.js",
  "conceptAnimations.js",
  "priorityConceptAnimations.js",
  "supplementalConceptAnimations.js",
  "mistakeDiagnosis.js",
  "supplementalMistakeTags.js",
  "learningSupport.js"
].forEach((file) => {
  require(path.join(root, file));
});

const modules = globalThis.MATH_LEARNING_DATA;
const errors = [];
const moduleIds = new Set();
const practiceIds = new Set();

function addError(pathLabel, message) {
  errors.push(`${pathLabel}: ${message}`);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateString(pathLabel, key, value) {
  if (!hasText(value)) {
    addError(pathLabel, `missing ${key}`);
  }
}

function validateTextArray(pathLabel, key, values) {
  if (!Array.isArray(values) || values.length === 0 || values.some((value) => !hasText(value))) {
    addError(pathLabel, `${key} must be a non-empty string array`);
  }
}

function validateDifficulty(pathLabel, value) {
  if (!allowedDifficulties.has(value)) {
    addError(pathLabel, `invalid difficulty "${value}"`);
  }
}

function validateMistakeTags(pathLabel, practice) {
  validateTextArray(pathLabel, "mistakeTags", practice.mistakeTags);
  (practice.mistakeTags || []).forEach((tagId) => {
    if (!globalThis.MistakeDiagnosis.getTagInfo(tagId)) {
      addError(pathLabel, `unknown mistake tag "${tagId}"`);
    }
  });
}

function validateExample(modulePath, example, index) {
  const pathLabel = `${modulePath}.examples[${index}]`;
  validateString(pathLabel, "title", example.title);
  validateDifficulty(pathLabel, example.difficulty);
  validateString(pathLabel, "question", example.question);
  validateString(pathLabel, "answer", example.answer);
  validateString(pathLabel, "analysis", example.analysis);
}

function validatePractice(modulePath, practice, index) {
  const pathLabel = `${modulePath}.practices[${index}]`;
  validateString(pathLabel, "id", practice.id);
  validateString(pathLabel, "title", practice.title);
  validateDifficulty(pathLabel, practice.difficulty);
  validateString(pathLabel, "prompt", practice.prompt);
  validateString(pathLabel, "answer", practice.answer);
  validateString(pathLabel, "explanation", practice.explanation);
  validateTextArray(pathLabel, "hints", practice.hints);
  validateTextArray(pathLabel, "solutionSteps", practice.solutionSteps);
  validateTextArray(pathLabel, "commonMistakes", practice.commonMistakes);
  validateMistakeTags(pathLabel, practice);

  if (practice.acceptedAnswers !== undefined) {
    validateTextArray(pathLabel, "acceptedAnswers", practice.acceptedAnswers);
  }

  if (practiceIds.has(practice.id)) {
    addError(pathLabel, `duplicate practice id "${practice.id}"`);
  }
  practiceIds.add(practice.id);
}

function validateModule(module, index) {
  const pathLabel = `modules[${index}](${module.id || "missing-id"})`;
  validateString(pathLabel, "id", module.id);
  validateString(pathLabel, "title", module.title);
  validateString(pathLabel, "description", module.description);

  if (moduleIds.has(module.id)) {
    addError(pathLabel, `duplicate module id "${module.id}"`);
  }
  moduleIds.add(module.id);

  if (!Array.isArray(module.grades) || module.grades.length === 0) {
    addError(pathLabel, "grades must be a non-empty array");
  } else {
    module.grades.forEach((grade) => {
      if (!allowedGrades.has(grade)) {
        addError(pathLabel, `invalid grade "${grade}"`);
      }
    });
  }

  if (!Array.isArray(module.examples) || module.examples.length === 0) {
    addError(pathLabel, "examples must be a non-empty array");
  } else {
    module.examples.forEach((example, exampleIndex) => validateExample(pathLabel, example, exampleIndex));
  }

  if (!Array.isArray(module.practices) || module.practices.length === 0) {
    addError(pathLabel, "practices must be a non-empty array");
  } else {
    module.practices.forEach((practice, practiceIndex) => validatePractice(pathLabel, practice, practiceIndex));
  }
}

try {
  assert.ok(Array.isArray(modules), "MATH_LEARNING_DATA must be an array");
  assert.ok(modules.length > 0, "MATH_LEARNING_DATA must not be empty");
  modules.forEach(validateModule);
} catch (error) {
  addError("content", error.message);
}

if (errors.length > 0) {
  console.error(`FAIL content validation found ${errors.length} issue(s):`);
  errors.slice(0, 80).forEach((error) => console.error(`- ${error}`));
  if (errors.length > 80) {
    console.error(`...and ${errors.length - 80} more`);
  }
  process.exit(1);
}

console.log(`OK content validation: ${modules.length} modules, ${practiceIds.size} practices`);
