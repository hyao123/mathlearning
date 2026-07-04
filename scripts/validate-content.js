const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contentFiles = [
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
  "learningSupport.js",
  "learningEffectEnhancements.js"
];

const allowedGrades = new Set(["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"]);
const allowedDifficulties = new Set(["基础", "进阶", "提高", "挑战"]);
const fallbackStrand = "综合迁移";
const legacyBroadStrand = "综合拓展";
const minReviewSetModules = 3;
const minReviewSetPractices = 6;

function loadContentState() {
  global.window = globalThis;
  contentFiles.forEach((file) => {
    require(path.join(root, file));
  });
  return {
    modules: globalThis.MATH_LEARNING_DATA || [],
    gradePath: globalThis.LEARNING_EFFECT_GRADE_PATH || {},
    reviewSets: globalThis.LEARNING_EFFECT_REVIEW_SETS || [],
    enhancements: globalThis.LearningEffectEnhancements || {},
    mistakeDiagnosis: globalThis.MistakeDiagnosis
  };
}

function createValidationContext(state) {
  return {
    errors: [],
    genericHintCount: 0,
    moduleIds: new Set(),
    practiceIds: new Set(),
    state
  };
}

function addError(context, pathLabel, message) {
  context.errors.push(`${pathLabel}: ${message}`);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateString(context, pathLabel, key, value) {
  if (!hasText(value)) {
    addError(context, pathLabel, `missing ${key}`);
  }
}

function validateTextArray(context, pathLabel, key, values) {
  if (!Array.isArray(values) || values.length === 0 || values.some((value) => !hasText(value))) {
    addError(context, pathLabel, `${key} must be a non-empty string array`);
  }
}

function validateDifficulty(context, pathLabel, value) {
  if (!allowedDifficulties.has(value)) {
    addError(context, pathLabel, `invalid difficulty "${value}"`);
  }
}

function validateMistakeTags(context, pathLabel, practice) {
  validateTextArray(context, pathLabel, "mistakeTags", practice.mistakeTags);
  (practice.mistakeTags || []).forEach((tagId) => {
    if (!context.state.mistakeDiagnosis?.getTagInfo?.(tagId)) {
      addError(context, pathLabel, `unknown mistake tag "${tagId}"`);
    }
  });
}

function validateExample(context, modulePath, example, index) {
  const pathLabel = `${modulePath}.examples[${index}]`;
  validateString(context, pathLabel, "title", example.title);
  validateDifficulty(context, pathLabel, example.difficulty);
  validateString(context, pathLabel, "question", example.question);
  validateString(context, pathLabel, "answer", example.answer);
  validateString(context, pathLabel, "analysis", example.analysis);
}

function validatePractice(context, module, modulePath, practice, index) {
  const pathLabel = `${modulePath}.practices[${index}]`;
  validateString(context, pathLabel, "id", practice.id);
  validateString(context, pathLabel, "title", practice.title);
  validateDifficulty(context, pathLabel, practice.difficulty);
  validateString(context, pathLabel, "prompt", practice.prompt);
  validateString(context, pathLabel, "answer", practice.answer);
  validateString(context, pathLabel, "explanation", practice.explanation);
  validateTextArray(context, pathLabel, "hints", practice.hints);
  validateTextArray(context, pathLabel, "solutionSteps", practice.solutionSteps);
  validateTextArray(context, pathLabel, "commonMistakes", practice.commonMistakes);
  validateTextArray(context, pathLabel, "tieredHints", practice.tieredHints);
  validateTextArray(context, pathLabel, "methodChoices", practice.methodChoices);
  validateString(context, pathLabel, "recommendedMethod", practice.recommendedMethod);
  validateTextArray(context, pathLabel, "acceptedMethods", practice.acceptedMethods);
  validateString(context, pathLabel, "targetSkill", practice.targetSkill);
  validateString(context, pathLabel, "modelType", practice.modelType);
  validateString(context, pathLabel, "transferLevel", practice.transferLevel);
  validateString(context, pathLabel, "diagnosticGoal", practice.diagnosticGoal);
  validateMistakeTags(context, pathLabel, practice);

  if (practice.recommendedMethod && !practice.methodChoices?.includes(practice.recommendedMethod)) {
    addError(context, pathLabel, `recommendedMethod "${practice.recommendedMethod}" must be included in methodChoices`);
  }

  (practice.acceptedMethods || []).forEach((method) => {
    if (!practice.methodChoices?.includes(method)) {
      addError(context, pathLabel, `accepted method "${method}" must be included in methodChoices`);
    }
  });

  if ((practice.hints || []).join("|") === context.state.enhancements?.genericHintKey) {
    context.genericHintCount += 1;
  }

  validateRemediationTags(context, pathLabel, module, practice);

  if (practice.acceptedAnswers !== undefined) {
    validateTextArray(context, pathLabel, "acceptedAnswers", practice.acceptedAnswers);
  }

  if (context.practiceIds.has(practice.id)) {
    addError(context, pathLabel, `duplicate practice id "${practice.id}"`);
  }
  context.practiceIds.add(practice.id);
}

function validateRemediationTags(context, pathLabel, module, practice) {
  const catalog = context.state.enhancements?.remediationCatalog || {};
  const restrictedTags = context.state.enhancements?.remediationPolicies?.restrictedTags || {};
  (practice.remediationTags || []).forEach((tagId) => {
    if (!catalog[tagId]) {
      addError(context, pathLabel, `unknown remediation tag "${tagId}"`);
      return;
    }
    const allowedModuleIds = restrictedTags[tagId];
    if (Array.isArray(allowedModuleIds) && !allowedModuleIds.includes(module.id)) {
      addError(context, pathLabel, `remediation tag "${tagId}" is not allowed for module "${module.id}"`);
    }
  });
}

function validateModule(context, module, index) {
  const pathLabel = `modules[${index}](${module.id || "missing-id"})`;
  validateString(context, pathLabel, "id", module.id);
  validateString(context, pathLabel, "title", module.title);
  validateString(context, pathLabel, "description", module.description);
  validateLearningPlan(context, pathLabel, module.learningPlan);

  if (context.moduleIds.has(module.id)) {
    addError(context, pathLabel, `duplicate module id "${module.id}"`);
  }
  context.moduleIds.add(module.id);

  validateGrades(context, pathLabel, module.grades);
  validateFallbackStrand(context, pathLabel, module);

  if (!Array.isArray(module.examples) || module.examples.length === 0) {
    addError(context, pathLabel, "examples must be a non-empty array");
  } else {
    module.examples.forEach((example, exampleIndex) => validateExample(context, pathLabel, example, exampleIndex));
  }

  if (!Array.isArray(module.practices) || module.practices.length === 0) {
    addError(context, pathLabel, "practices must be a non-empty array");
  } else {
    module.practices.forEach((practice, practiceIndex) => validatePractice(context, module, pathLabel, practice, practiceIndex));
  }
}

function validateLearningPlan(context, pathLabel, learningPlan) {
  if (!learningPlan) {
    addError(context, pathLabel, "missing learningPlan");
    return;
  }
  validateTextArray(context, pathLabel, "learningPlan.goals", learningPlan.goals);
  validateTextArray(context, pathLabel, "learningPlan.masteryCriteria", learningPlan.masteryCriteria);
  validateString(context, pathLabel, "learningPlan.targetSkill", learningPlan.targetSkill);
  validateString(context, pathLabel, "learningPlan.phase", learningPlan.phase);
}

function validateGrades(context, pathLabel, grades) {
  if (!Array.isArray(grades) || grades.length === 0) {
    addError(context, pathLabel, "grades must be a non-empty array");
    return;
  }
  grades.forEach((grade) => {
    if (!allowedGrades.has(grade)) {
      addError(context, pathLabel, `invalid grade "${grade}"`);
    }
  });
}

function validateFallbackStrand(context, pathLabel, module) {
  if (module.knowledgeTopology?.strand !== fallbackStrand) {
    return;
  }
  const allowedFallbackModuleIds = context.state.enhancements?.allowedFallbackModuleIds || [];
  if (!allowedFallbackModuleIds.includes(module.id)) {
    addError(context, pathLabel, `unexpected fallback strand "${fallbackStrand}"`);
  }
}

function validateLearningEffectReferences(context) {
  const modules = context.state.modules || [];
  const moduleIds = new Set(modules.map((module) => module.id));
  const practiceIds = new Set(modules.flatMap((module) => (module.practices || []).map((practice) => practice.id)));
  validateGradePathReferences(context, moduleIds);
  validateReviewSetReferences(context, moduleIds, practiceIds);
}

function validateGradePathReferences(context, moduleIds) {
  Object.entries(context.state.gradePath || {}).forEach(([grade, modulePath]) => {
    if (!allowedGrades.has(grade)) {
      addError(context, `gradePath.${grade}`, `invalid grade path grade "${grade}"`);
    }
    if (!Array.isArray(modulePath) || modulePath.length === 0) {
      addError(context, `gradePath.${grade}`, "grade path must be a non-empty module id array");
      return;
    }
    modulePath.forEach((moduleId) => {
      if (!moduleIds.has(moduleId)) {
        addError(context, `gradePath.${grade}`, `unknown grade path module id "${moduleId}"`);
      }
    });
  });
}

function validateReviewSetReferences(context, moduleIds, practiceIds) {
  const reviewSets = context.state.reviewSets || [];
  if (!Array.isArray(reviewSets) || reviewSets.length === 0) {
    addError(context, "reviewSets", "missing learning effect review sets");
    return;
  }
  reviewSets.forEach((reviewSet, index) => {
    const pathLabel = `reviewSets[${index}](${reviewSet.strand || "missing-strand"})`;
    validateString(context, pathLabel, "strand", reviewSet.strand);
    validateString(context, pathLabel, "title", reviewSet.title);
    validateTextArray(context, pathLabel, "methodChoices", reviewSet.methodChoices);
    validateTextArray(context, pathLabel, "requirements", reviewSet.requirements);
    if (!Array.isArray(reviewSet.moduleIds) || reviewSet.moduleIds.length < minReviewSetModules) {
      addError(context, pathLabel, `moduleIds must include at least ${minReviewSetModules} modules`);
    }
    if (!Array.isArray(reviewSet.practiceIds) || reviewSet.practiceIds.length < minReviewSetPractices) {
      addError(context, pathLabel, `practiceIds must include at least ${minReviewSetPractices} practices`);
    }
    (reviewSet.moduleIds || []).forEach((moduleId) => {
      if (!moduleIds.has(moduleId)) {
        addError(context, pathLabel, `unknown review set module id "${moduleId}"`);
      }
    });
    (reviewSet.practiceIds || []).forEach((practiceId) => {
      if (!practiceIds.has(practiceId)) {
        addError(context, pathLabel, `unknown review set practice id "${practiceId}"`);
      }
    });
  });
}

function validateContentState(state) {
  const context = createValidationContext(state);
  try {
    assert.ok(Array.isArray(state.modules), "MATH_LEARNING_DATA must be an array");
    assert.ok(state.modules.length > 0, "MATH_LEARNING_DATA must not be empty");
    state.modules.forEach((module, index) => validateModule(context, module, index));
    validateLearningEffectReferences(context);
    assert.ok(context.genericHintCount <= 100, `too many generic hints: ${context.genericHintCount}`);
    assert.ok((state.modules.filter((module) => module.knowledgeTopology?.strand === legacyBroadStrand).length) <= 5, `${legacyBroadStrand} should not be the main content container`);
  } catch (error) {
    addError(context, "content", error.message);
  }
  return {
    errors: context.errors,
    moduleCount: state.modules?.length || 0,
    practiceCount: context.practiceIds.size,
    genericHintCount: context.genericHintCount
  };
}

function runCli() {
  const result = validateContentState(loadContentState());
  if (result.errors.length > 0) {
    console.error(`FAIL content validation found ${result.errors.length} issue(s):`);
    result.errors.slice(0, 80).forEach((error) => console.error(`- ${error}`));
    if (result.errors.length > 80) {
      console.error(`...and ${result.errors.length - 80} more`);
    }
    process.exit(1);
  }

  console.log(`OK content validation: ${result.moduleCount} modules, ${result.practiceCount} practices`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  loadContentState,
  validateContentState
};
