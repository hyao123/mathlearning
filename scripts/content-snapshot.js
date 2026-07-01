const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const snapshotPath = path.join(root, "content-snapshot.json");

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
].forEach((file) => require(path.join(root, file)));

const modules = globalThis.MATH_LEARNING_DATA || [];
const snapshot = {
  generatedBy: "scripts/content-snapshot.js",
  moduleCount: modules.length,
  practiceCount: modules.reduce((sum, module) => sum + module.practices.length, 0),
  exampleCount: modules.reduce((sum, module) => sum + module.examples.length, 0),
  strands: summarizeStrands(modules),
  sampleModules: modules.slice(0, 12).map((module) => ({
    id: module.id,
    title: module.title,
    strand: module.knowledgeTopology?.strand || "未分组",
    examples: module.examples.length,
    practices: module.practices.length,
    supportedPractices: module.practices.filter((practice) => practice.hints?.length && practice.solutionSteps?.length && practice.commonMistakes?.length).length,
    taggedPractices: module.practices.filter((practice) => practice.mistakeTags?.length).length
  }))
};

if (process.argv.includes("--check")) {
  const existing = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  if (JSON.stringify(existing, null, 2) !== JSON.stringify(snapshot, null, 2)) {
    console.error("FAIL content snapshot is stale. Run `npm run snapshot:content`.");
    process.exit(1);
  }
  console.log("OK content snapshot is current");
} else {
  fs.writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`OK wrote ${path.relative(root, snapshotPath)}`);
}

function summarizeStrands(items) {
  const groups = new Map();
  items.forEach((module) => {
    const strand = module.knowledgeTopology?.strand || "未分组";
    if (!groups.has(strand)) {
      groups.set(strand, { strand, modules: 0, examples: 0, practices: 0, supportedPractices: 0, taggedPractices: 0 });
    }
    const group = groups.get(strand);
    group.modules += 1;
    group.examples += module.examples.length;
    group.practices += module.practices.length;
    group.supportedPractices += module.practices.filter((practice) => practice.hints?.length && practice.solutionSteps?.length && practice.commonMistakes?.length).length;
    group.taggedPractices += module.practices.filter((practice) => practice.mistakeTags?.length).length;
  });
  return [...groups.values()].sort((left, right) => left.strand.localeCompare(right.strand, "zh-CN"));
}
