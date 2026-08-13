const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const readability = require("../game/curriculum/readability.js");

test("grade-3 rejects an overlong prompt and too many unfamiliar terms", () => {
  const errors = readability.validateReadability({
    prompt: "a".repeat(71),
    readingProfile: { unfamiliarTerms: ["term one", "term two"] }
  }, "grade-3");

  assert.ok(errors.includes("prompt exceeds 70 characters"));
  assert.ok(errors.includes("unfamiliar terms exceed 1"));
});

test("counts Chinese and ASCII terminal punctuation as sentence delimiters", () => {
  const errors = readability.validateReadability({
    prompt: "One. Two! Three? Four;",
    readingProfile: { unfamiliarTerms: [] }
  }, "grade-4");

  assert.ok(errors.includes("prompt exceeds 3 sentences"));
});

test("accepts valid higher-grade profiles and counts Unicode code points", () => {
  assert.deepEqual(readability.validateReadability({
    prompt: "😀".repeat(100),
    readingProfile: { unfamiliarTerms: ["model", "strategy"] }
  }, "grade-5"), []);

  assert.deepEqual(readability.validateReadability({
    prompt: "Challenge. Check.",
    readingProfile: { unfamiliarTerms: ["model", "strategy", "variable"] }
  }, "cup-entry"), []);
});

test("returns errors for malformed profiles, questions, and grade bands", () => {
  assert.ok(readability.validateReadability({ prompt: "Ready", readingProfile: { unfamiliarTerms: ["valid", " "] } }, "grade-3")
    .includes("readingProfile.unfamiliarTerms must be an array of non-empty strings"));
  assert.ok(readability.validateReadability({ prompt: "Ready", readingProfile: { unfamiliarTerms: "term" } }, "grade-3")
    .includes("readingProfile.unfamiliarTerms must be an array of non-empty strings"));
  assert.ok(readability.validateReadability(null, "grade-3").includes("question must be an object"));
  assert.ok(readability.validateReadability({ prompt: "Ready" }, "grade-7").includes("invalid gradeBand: grade-7"));
});

test("browser loader registers the readability dependency before the V3 quality gate", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "src", "game-main.js"), "utf8");
  const start = source.indexOf("const Readability = await loadCommonJs");
  const end = source.indexOf("\nconst ", start + 1);
  const registration = source.slice(start, end === -1 ? source.length : end);

  assert.notEqual(registration, "", "Readability must be registered");
  assert.ok(registration.includes('"./curriculum/readability.js"'));
  assert.ok(registration.includes('"./readability.js"'));
  assert.ok(source.indexOf("const Readability = await loadCommonJs") < source.indexOf("const QuestionQualityV3 = await loadCommonJs"));
});
