const chickenRabbitQuestions = require("./chickenRabbit.js");
const shortestPathQuestions = require("./shortestPath.js");
const integratedModelingQuestions = require("./integratedModeling.js");

const GOLD_V3_BATCH_ID = "gold-v3";
const GOLD_V3_CONTENT_VERSION = "2026.08.13-gold.1";

function buildGoldV3Batch(reviewManifest = null) {
  const manifest = reviewManifest && typeof reviewManifest === "object"
    ? structuredClone(reviewManifest)
    : null;
  const status = manifest?.status === "approved" ? "approved" : "candidate";
  return {
    id: GOLD_V3_BATCH_ID,
    schemaVersion: 3,
    status,
    contentVersion: GOLD_V3_CONTENT_VERSION,
    ...(manifest ? { reviewManifest: manifest } : {}),
    topics: [
      { chapterId: "chapter-01", moduleId: "chicken-rabbit", questions: structuredClone(chickenRabbitQuestions) },
      { chapterId: "chapter-08", moduleId: "shortest-path", questions: structuredClone(shortestPathQuestions) },
      { chapterId: "chapter-09", moduleId: "integrated-modeling", questions: structuredClone(integratedModelingQuestions) }
    ]
  };
}

module.exports = {
  GOLD_V3_BATCH_ID,
  GOLD_V3_CONTENT_VERSION,
  buildGoldV3Batch
};
