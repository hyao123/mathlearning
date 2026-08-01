const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const runtimeSources = require("../game/runtimeSources.js");
const validator = require("../scripts/validate-game-content.js");

function extractModuleSpecifiers(source) {
  const specifiers = [];
  const patterns = [
    /\bimport\s+(?:[\w*$\s{},]+\s+from\s+)?["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      specifiers.push(match[1]);
    }
  }

  return specifiers;
}

function isMainModuleSpecifier(specifier) {
  const normalized = specifier.replaceAll("\\", "/").split(/[?#]/, 1)[0];
  return normalized === "main.js" || normalized.endsWith("/main.js");
}

test("the shipped page loads the game entrypoint and not the legacy application", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

  assert.match(html, /src\/game-main\.js/);
  assert.doesNotMatch(html, /src\/main\.js/);
  assert.doesNotMatch(html, /daily-practice-panel|wrong-book|parent-dashboard|paper-generator-panel/);
  assert.doesNotMatch(html, /每日一练|错题本|家长视图|随机组卷/);
});

test("legacy student-workbench entry files have been removed", () => {
  assert.equal(fs.existsSync(path.join(root, "src", "main.js")), false);
  assert.equal(fs.existsSync(path.join(root, "src", "style.css")), false);
});

test("the game entrypoint stays independent from legacy runtime modules", () => {
  const entrypoint = fs.readFileSync(path.join(root, "src", "game-main.js"), "utf8");

  assert.doesNotMatch(entrypoint, /(?:from\s+|import\s*\()\s*["'][^"']*app\.js["']/);
  assert.ok(!extractModuleSpecifiers(entrypoint).some(isMainModuleSpecifier));
  assert.doesNotMatch(entrypoint, /(?:from\s+|import\s*\()\s*["'][^"']*styles\.css["']/);
  assert.doesNotMatch(entrypoint, /(?:from\s+|import\s*\()\s*["'][^"']*characterStory\.css["']/);
  assert.doesNotMatch(entrypoint, /(?:from\s+|import\s*\()\s*["'][^"']*views\//);
});

test("the main-module guard covers all supported import syntaxes and path forms", () => {
  const source = [
    'import "main.js";',
    'import "../src/main.js";',
    'import { boot } from "/src/main.js";',
    'import("./main.js");',
    'require("/src/main.js");',
  ].join("\n");

  assert.deepEqual(
    extractModuleSpecifiers(source).filter(isMainModuleSpecifier),
    ["main.js", "../src/main.js", "/src/main.js", "./main.js", "/src/main.js"],
  );
});

test("runtime and validator consume the same canonical game source list", () => {
  const entrypoint = fs.readFileSync(path.join(root, "src", "game-main.js"), "utf8");

  assert.deepEqual(validator.contentFiles, runtimeSources.RUNTIME_SOURCE_FILES);
  assert.match(entrypoint, /GameRuntimeSources\.RUNTIME_SOURCE_FILES/);
});
