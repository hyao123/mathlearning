const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("demo server launcher resolves the project root and writes ignored logs outside scripts", () => {
  const source = fs.readFileSync(path.join(root, "scripts", "start-dev-server.js"), "utf8");
  assert.match(source, /path\.resolve\(__dirname, ["']\.\.["']\)/);
  assert.match(source, /\.demo-logs/);
  assert.doesNotMatch(source, /path\.join\(root, "\.vite-dev\.log"\)/);
});

test("package exposes a low-performance browser audit", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(packageJson.scripts["audit:low-performance"], "node scripts/audit-low-performance.js");
  assert.equal(fs.existsSync(path.join(root, "scripts", "audit-low-performance.js")), true);
});
