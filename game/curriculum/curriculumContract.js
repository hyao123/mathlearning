const GRADE_BANDS = Object.freeze(["grade-3", "grade-4", "grade-5", "grade-6", "cup-entry"]);
const REASONING_MOVES = Object.freeze([
  "identify", "classify", "diagram", "assume", "substitute",
  "reverse", "enumerate", "compare", "optimize", "verify"
]);
const REPRESENTATIONS = Object.freeze(["text", "bar-model", "table", "route-map", "equation", "diagram"]);
const QUESTION_DIRECTIONS = Object.freeze(["forward", "reverse", "find-parameter", "find-boundary", "compare-plans"]);

function validateTopicDefinition(topic) {
  const errors = [];
  if (!topic || typeof topic !== "object" || Array.isArray(topic)) return ["topic must be an object"];

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

function validateCurriculumGraph(topics, options = {}) {
  const errors = [];
  if (!Array.isArray(topics)) return ["topics must be an array"];

  const topicIds = new Set();
  const externalIds = new Set(options.externalPrerequisiteIds || []);

  for (const topic of topics) {
    errors.push(...validateTopicDefinition(topic));
    if (typeof topic?.id === "string" && topic.id.trim()) {
      if (topicIds.has(topic.id)) errors.push(`duplicate topic id: ${topic.id}`);
      topicIds.add(topic.id);
    }
  }

  for (const topic of topics) {
    if (!Array.isArray(topic?.prerequisites)) continue;
    for (const prerequisite of topic.prerequisites) {
      if (!topicIds.has(prerequisite) && !externalIds.has(prerequisite)) {
        errors.push(`unknown prerequisite: ${prerequisite}`);
      }
    }
  }

  const topicById = new Map(
    topics
      .filter((topic) => typeof topic?.id === "string" && topic.id.trim())
      .map((topic) => [topic.id, topic])
  );
  const visiting = new Set();
  const visited = new Set();
  const path = [];

  function visit(topicId) {
    if (visited.has(topicId)) return;
    if (visiting.has(topicId)) {
      const cycleStart = path.indexOf(topicId);
      errors.push(`prerequisite cycle: ${[...path.slice(cycleStart), topicId].join(" -> ")}`);
      return;
    }

    visiting.add(topicId);
    path.push(topicId);
    const topic = topicById.get(topicId);
    for (const prerequisite of topic.prerequisites || []) {
      if (topicById.has(prerequisite)) visit(prerequisite);
    }
    path.pop();
    visiting.delete(topicId);
    visited.add(topicId);
  }

  for (const topicId of topicById.keys()) visit(topicId);
  return errors;
}

module.exports = {
  GRADE_BANDS,
  REASONING_MOVES,
  REPRESENTATIONS,
  QUESTION_DIRECTIONS,
  validateTopicDefinition,
  validateCurriculumGraph
};
