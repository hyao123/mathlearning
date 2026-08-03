const assert = require("node:assert/strict");
const test = require("node:test");

const { extractViteBaseUrl } = require("../scripts/browser-test-utils.js");

test("browser test server uses the actual fallback port emitted by Vite", () => {
  assert.equal(
    extractViteBaseUrl("Local:   http://127.0.0.1:4190/\n", "4189"),
    "http://127.0.0.1:4190/"
  );
  assert.equal(extractViteBaseUrl("", "4189"), "http://127.0.0.1:4189/");
});
