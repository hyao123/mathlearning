const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { withPage } = require("./browser-test-utils.js");

async function main() {
  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    await assertVisibleText(page, "h1", "小学奥数学习系统");
    assert.match(await page.title(), /小学奥数学习系统/);

    const moduleCount = await page.locator("#module-list button, #knowledge-mode-list button").count();
    assert.ok(moduleCount > 0, "expected at least one learning module");

    await page.locator("#daily-practice-panel").scrollIntoViewIfNeeded();
    await page.locator(".daily-card").first().waitFor({ state: "visible", timeout: 10000 });
    const dailyCount = await page.locator(".daily-card").count();
    assert.ok(dailyCount > 0, "expected daily practice cards");

    const answerInputs = await page.locator(".answer-input").count();
    assert.ok(answerInputs > 0, "expected answer inputs");

    const submitButtons = await page.locator(".submit-answer, .submit-daily-answer, .submit-paper-answer").count();
    assert.ok(submitButtons > 0, "expected answer submit buttons");

    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK browser smoke test at ${baseUrl}`);
  });
}

async function assertVisibleText(page, selector, expectedText) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: "visible", timeout: 10000 });
  const text = await locator.textContent();
  assert.equal(text?.trim(), expectedText);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
