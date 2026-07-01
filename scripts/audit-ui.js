const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { withPage } = require("./browser-test-utils.js");

const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 }
];

async function auditViewport(viewport, index) {
  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator("#daily-practice-panel").scrollIntoViewIfNeeded();
    await page.locator(".daily-card").first().waitFor({ state: "visible", timeout: 10000 });

    const layout = await page.evaluate(() => ({
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      unlabeledButtons: Array.from(document.querySelectorAll("button")).filter((button) => {
        const name = button.getAttribute("aria-label") || button.textContent || button.title;
        return !name.trim();
      }).length,
      unnamedLinks: Array.from(document.querySelectorAll("a")).filter((link) => {
        const name = link.getAttribute("aria-label") || link.textContent || link.title;
        return !name.trim();
      }).length,
      unidentifiableInputs: Array.from(document.querySelectorAll("input, select, textarea")).filter((input) => {
        if (input.type === "file" && input.hidden) {
          return false;
        }
        const id = input.id;
        return !input.getAttribute("aria-label")
          && !input.getAttribute("placeholder")
          && !input.closest("label")
          && !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`));
      }).length
    }));

    assert.ok(layout.bodyScrollWidth <= layout.viewportWidth + 2, `body overflows at ${viewport.width}px`);
    assert.ok(layout.documentScrollWidth <= layout.viewportWidth + 2, `document overflows at ${viewport.width}px`);
    assert.equal(layout.unlabeledButtons, 0, "all buttons should have an accessible name");
    assert.equal(layout.unnamedLinks, 0, "all links should have an accessible name");
    assert.equal(layout.unidentifiableInputs, 0, "inputs should be labeled or have placeholders");
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK UI audit ${viewport.width}x${viewport.height} at ${baseUrl}`);
  }, { port: Number(process.env.UI_AUDIT_PORT || 4180) + index, viewport });
}

async function main() {
  for (const [index, viewport] of viewports.entries()) {
    await auditViewport(viewport, index);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
