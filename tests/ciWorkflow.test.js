const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("CI only invokes declared release scripts and uses the strict game checks", () => {
  const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "ci.yml"), "utf8");
  const scripts = require(path.join(root, "package.json")).scripts;
  const commands = [...workflow.matchAll(/npm run ([A-Za-z0-9:_-]+)/g)].map((match) => match[1]);

  commands.forEach((command) => assert.equal(Object.hasOwn(scripts, command), true, `CI references missing npm script: ${command}`));
  assert.match(workflow, /npm run validate:release/);
  assert.match(workflow, /npm run test:game-ui/);
  assert.doesNotMatch(workflow, /npm run (?:validate:content|check:content-snapshot)/);
});
