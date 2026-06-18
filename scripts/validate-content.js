const { existsSync } = require("node:fs");
const { join, relative } = require("node:path");

const projectRoot = join(__dirname, "..");
const allowedDifficulties = new Set(["基础", "进阶", "提高", "挑战"]);
const allowedGrades = new Set(["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"]);

const contentScripts = [
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
];

function installBrowserGlobals() {
  global.window = global;
  global.document = undefined;
  global.localStorage = undefined;
}

function loadScript(scriptPath) {
  const absolutePath = join(projectRoot, scriptPath);
  if (!existsSync(absolutePath)) {
    return;
  }
  require(absolutePath);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function pathFor(...parts) {
  return parts.filter(Boolean).join(" > ");
}

function validateRequiredString(errors, value, location, fieldName) {
  if (!isNonEmptyString(value)) {
    errors.push(`${location}: missing non-empty ${fieldName}`);
  }
}

function validateStringArray(errors, values, location, fieldName, options = {}) {
  if (!Array.isArray(values) || values.length === 0) {
    errors.push(`${location}: ${fieldName} must be a non-empty array`);
    return;
  }

  values.forEach((value, index) => {
    if (!isNonEmptyString(value)) {
      errors.push(`${location}: ${fieldName}[${index}] must be a non-empty string`);
    }
    if (options.allowedValues && !options.allowedValues.has(value)) {
      errors.push(`${location}: ${fieldName}[${index}] has unknown value "${value}"`);
    }
  });
}

function validateModuleShape(module, index, errors, moduleIds) {
  const location = `module[${index}]${module?.id ? ` (${module.id})` : ""}`;
  validateRequiredString(errors, module?.id, location, "id");
  validateRequiredString(errors, module?.title, location, "title");
  validateRequiredString(errors, module?.description, location, "description");
  validateStringArray(errors, module?.grades, location, "grades", { allowedValues: allowedGrades });

  if (module?.id && moduleIds.has(module.id)) {
    errors.push(`${location}: duplicate module id "${module.id}"`);
  }
  if (module?.id) {
    moduleIds.add(module.id);
  }

  if (!Array.isArray(module?.examples) || module.examples.length === 0) {
    errors.push(`${location}: examples must be a non-empty array`);
  }

  if (!Array.isArray(module?.practices) || module.practices.length === 0) {
    errors.push(`${location}: practices must be a non-empty array`);
  }
}

function validateExample(example, module, index, errors) {
  const location = pathFor(`module ${module.id}`, `example[${index}]`);
  validateRequiredString(errors, example?.title, location, "title");
  validateRequiredString(errors, example?.question, location, "question");
  validateRequiredString(errors, example?.answer, location, "answer");
  validateRequiredString(errors, example?.analysis, location, "analysis");

  if (!allowedDifficulties.has(example?.difficulty)) {
    errors.push(`${location}: difficulty must be one of ${[...allowedDifficulties].join(", ")}`);
  }
}

function validatePractice(practice, module, index, errors, practiceIds, mistakeTagCatalog) {
  const idLabel = practice?.id || `practice[${index}]`;
  const location = pathFor(`module ${module.id}`, idLabel);

  validateRequiredString(errors, practice?.id, location, "id");
  validateRequiredString(errors, practice?.title, location, "title");
  validateRequiredString(errors, practice?.prompt, location, "prompt");
  validateRequiredString(errors, practice?.answer, location, "answer");
  validateRequiredString(errors, practice?.explanation, location, "explanation");

  if (practice?.id && practiceIds.has(practice.id)) {
    errors.push(`${location}: duplicate practice id "${practice.id}"`);
  }
  if (practice?.id) {
    practiceIds.add(practice.id);
  }

  if (!allowedDifficulties.has(practice?.difficulty)) {
    errors.push(`${location}: difficulty must be one of ${[...allowedDifficulties].join(", ")}`);
  }

  ["hints", "solutionSteps", "commonMistakes"].forEach((fieldName) => {
    validateStringArray(errors, practice?.[fieldName], location, fieldName);
  });

  if (practice?.acceptedAnswers !== undefined && !Array.isArray(practice.acceptedAnswers)) {
    errors.push(`${location}: acceptedAnswers must be an array when provided`);
  }

  if (!Array.isArray(practice?.mistakeTags) || practice.mistakeTags.length === 0) {
    errors.push(`${location}: mistakeTags must be a non-empty array`);
  } else {
    practice.mistakeTags.forEach((tag) => {
      if (!mistakeTagCatalog[tag]) {
        errors.push(`${location}: unknown mistake tag "${tag}"`);
      }
    });
  }
}

function validateTopology(module, errors, allModuleIds) {
  const topology = module.knowledgeTopology;
  const location = `module ${module.id} topology`;
  if (!topology || typeof topology !== "object") {
    errors.push(`${location}: missing knowledgeTopology`);
    return;
  }

  ["strand", "stage", "whyNow", "continuity"].forEach((fieldName) => {
    validateRequiredString(errors, topology[fieldName], location, fieldName);
  });

  ["prerequisiteIds", "nextIds"].forEach((fieldName) => {
    if (!Array.isArray(topology[fieldName])) {
      errors.push(`${location}: ${fieldName} must be an array`);
      return;
    }
    topology[fieldName].forEach((id) => {
      if (!allModuleIds.has(id)) {
        errors.push(`${location}: ${fieldName} references missing module "${id}"`);
      }
      if (id === module.id) {
        errors.push(`${location}: ${fieldName} must not reference itself`);
      }
    });
  });
}

function validateContent(modules) {
  const errors = [];
  if (!Array.isArray(modules) || modules.length === 0) {
    return ["MATH_LEARNING_DATA must be a non-empty array"];
  }

  const moduleIds = new Set();
  const practiceIds = new Set();
  modules.forEach((module, index) => validateModuleShape(module, index, errors, moduleIds));

  const mistakeTagCatalog = global.MistakeDiagnosis?.mistakeTagCatalog || {};
  if (Object.keys(mistakeTagCatalog).length === 0) {
    errors.push("MistakeDiagnosis.mistakeTagCatalog must be loaded before validation");
  }

  modules.forEach((module) => {
    (module.examples || []).forEach((example, index) => validateExample(example, module, index, errors));
    (module.practices || []).forEach((practice, index) => validatePractice(practice, module, index, errors, practiceIds, mistakeTagCatalog));
    validateTopology(module, errors, moduleIds);
  });

  return errors;
}

installBrowserGlobals();
contentScripts.forEach(loadScript);

const modules = global.MATH_LEARNING_DATA;
const errors = validateContent(modules);

if (errors.length > 0) {
  console.error("Content validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const totalPractices = modules.reduce((sum, module) => sum + module.practices.length, 0);
const totalExamples = modules.reduce((sum, module) => sum + module.examples.length, 0);
console.log(`Content validation passed for ${modules.length} modules, ${totalExamples} examples, and ${totalPractices} practices.`);
console.log(`Loaded content scripts: ${contentScripts.map((script) => relative(projectRoot, join(projectRoot, script))).join(", ")}`);
