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

const TOPICS_BY_ID = new Map(CURRICULUM_TOPICS.map((topic) => [topic.id, topic]));

function getCurriculumTopic(topicId) {
  return TOPICS_BY_ID.get(topicId) || null;
}

module.exports = { CURRICULUM_TOPICS, getCurriculumTopic };
