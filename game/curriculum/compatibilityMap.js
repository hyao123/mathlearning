const GOLD_SLOT_IDS = Object.freeze({
  "chicken-rabbit": Object.freeze([
    "chicken-rabbit-1", "chicken-rabbit-2", "chicken-rabbit-3", "chicken-rabbit-4",
    "chapter-01-chicken-rabbit-advance-1", "chicken-rabbit-5", "chicken-rabbit-6",
    "chicken-rabbit-9", "chicken-rabbit-7", "chicken-rabbit-8"
  ]),
  "shortest-path": Object.freeze(Array.from({ length: 10 }, (_, index) => `chapter-08-shortest-path-${index + 1}`)),
  "integrated-modeling": Object.freeze(Array.from({ length: 10 }, (_, index) => `chapter-09-integrated-modeling-${index + 1}`))
});

const COMPATIBLE_TOPICS = Object.freeze({
  "chapter-01:chicken-rabbit": Object.freeze({ chapterId: "chapter-01", moduleId: "chicken-rabbit", topicId: "chicken-rabbit", slotIds: GOLD_SLOT_IDS["chicken-rabbit"] }),
  "chapter-08:shortest-path": Object.freeze({ chapterId: "chapter-08", moduleId: "shortest-path", topicId: "shortest-path", slotIds: GOLD_SLOT_IDS["shortest-path"] }),
  "chapter-09:integrated-modeling": Object.freeze({ chapterId: "chapter-09", moduleId: "integrated-modeling", topicId: "integrated-modeling", slotIds: GOLD_SLOT_IDS["integrated-modeling"] })
});

function getCompatibilityEntry(chapterId, moduleId) {
  return COMPATIBLE_TOPICS[`${chapterId}:${moduleId}`] || null;
}

function validateCompatibilityMap(topicBatch) {
  if (!topicBatch || typeof topicBatch !== "object" || Array.isArray(topicBatch)) return ["topic batch must be an object"];
  const entry = getCompatibilityEntry(topicBatch.chapterId, topicBatch.moduleId);
  if (!entry) return [`no compatible slot for ${String(topicBatch.chapterId)}:${String(topicBatch.moduleId)}`];
  if (!Array.isArray(topicBatch.questions)) return ["questions must be an array"];

  const errors = [];
  if (topicBatch.questions.length !== entry.slotIds.length) errors.push(`must contain exactly ${entry.slotIds.length} questions`);
  topicBatch.questions.forEach((question, index) => {
    const slot = index + 1;
    if (!question || typeof question !== "object" || Array.isArray(question)) {
      errors.push(`question at slot ${slot} must be an object`);
      return;
    }
    if (question.id !== entry.slotIds[index]) errors.push(`question at slot ${slot} must retain compatible id ${entry.slotIds[index]}`);
    if (question.slot !== undefined && question.slot !== slot) errors.push(`question at slot ${slot} has incompatible slot ${String(question.slot)}`);
    if (question.level !== slot) errors.push(`question at slot ${slot} must have level ${slot}`);
    if (question.topicId !== entry.topicId) errors.push(`question at slot ${slot} must use topicId ${entry.topicId}`);
  });
  return errors;
}

module.exports = { GOLD_SLOT_IDS, COMPATIBLE_TOPICS, getCompatibilityEntry, validateCompatibilityMap };
