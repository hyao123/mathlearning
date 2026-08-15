const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const reviewTemplate = require("./generate-human-review-template.js");
const { validateCurriculumBatch } = require("./validate-game-content.js");
const GoldBatch = require(path.join(root, "game", "curriculum", "gold", "index.js"));
const ContentBatchRegistry = require(path.join(root, "game", "curriculum", "contentBatchRegistry.js"));

function runCli(argv = process.argv) {
  const batchIndex = argv.indexOf("--batch");
  const batchId = batchIndex === -1 ? null : argv[batchIndex + 1];
  if (batchId !== "gold-v3") {
    console.error("Usage: node scripts/validate-curriculum-batch.js --batch gold-v3");
    return 1;
  }

  const reviewPath = path.join(root, "content", "humanReview", "candidates", `${batchId}.json`);
  if (!fs.existsSync(reviewPath)) {
    console.error(`FAIL curriculum batch ${batchId}: missing candidate manifest ${path.relative(root, reviewPath)}`);
    return 1;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  } catch (error) {
    console.error(`FAIL curriculum batch ${batchId}: cannot read candidate manifest: ${error.message}`);
    return 1;
  }

  const batch = GoldBatch.buildGoldV3Batch(manifest);
  const report = validateCurriculumBatch(batch, manifest);
  if (report.automatedErrors.length) {
    console.error(`FAIL curriculum batch ${batchId}: automated question errors: ${report.automatedErrors.length}`);
    report.automatedErrors.forEach((error) => console.error(`- ${error}`));
  } else {
    console.log(`OK curriculum batch ${batchId}: automated question errors: 0 (${report.questionCount} questions)`);
  }
  if (report.publishable) {
    if (!ContentBatchRegistry.registerContentBatch(batch)) {
      console.error(`FAIL curriculum batch ${batchId}: approved batch could not become active`);
      return 1;
    }
    const active = ContentBatchRegistry.getActiveBatch(batchId);
    console.log(`OK curriculum batch ${batchId}: active, ${active.topicCount} topics, ${active.questionCount} questions`);
    return 0;
  }

  console.error(`PENDING curriculum batch ${batchId}: review status ${manifest.status || "unknown"} is not publishable`);
  report.errors
    .filter((error) => !report.automatedErrors.includes(error))
    .slice(0, 8)
    .forEach((error) => console.error(`- ${error}`));
  if (report.errors.length > 8) console.error(`- ${report.errors.length - 8} additional review issue(s)`);
  return 1;
}

if (require.main === module) process.exitCode = runCli();

module.exports = { runCli };
