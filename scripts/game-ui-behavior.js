const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { withPage } = require("./browser-test-utils.js");

const REMOVED_SELECTORS = [
  "#daily-practice-panel",
  "#wrong-book",
  "#parent-dashboard",
  "#paper-generator-panel",
  ".student-shell",
  ".student-sidebar"
];

const RESPONSIVE_VIEWPORTS = [
  { width: 375, height: 812, columns: 2 },
  { width: 768, height: 1024, columns: 3 },
  { width: 1440, height: 1000, columns: 4 }
];

async function answerIncorrectly(page) {
  await page.locator("[data-answer-input]").fill("错误答案");
  await page.locator("[data-submit-answer]").click();
  await page.locator("[data-retry-question]").waitFor({ state: "visible" });
}

async function continueResolvedQuestion(page) {
  await page.locator("[data-continue-resolved]").click();
}

async function main() {
  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });

    await page.locator("[data-game-screen='map']").waitFor({ state: "visible", timeout: 10000 });
    assert.equal(await page.locator("[data-level-id]").count(), 12);
    assert.equal(await page.locator("[data-chapter-stage]").count(), 4, "map should show four first-chapter progress stages");
    assert.equal((await page.locator("[data-chapter-stage='1']").textContent()).includes("0 / 3"), true, "stage one should start at 0/3");
    assert.equal(await page.locator("[data-level-id='chapter-01-level-1']").getAttribute("data-status"), "current");
    assert.equal(await page.locator("[data-level-id='chapter-01-level-2']").getAttribute("data-status"), "locked");
    assert.equal(await page.locator("[data-level-id='chapter-01-level-2']").isDisabled(), true);
    for (const selector of REMOVED_SELECTORS) assert.equal(await page.locator(selector).count(), 0, `${selector} must not be rendered`);

    await page.locator("[data-open-inventory]").click();
    await page.locator("[data-game-screen='inventory']").waitFor({ state: "visible" });
    assert.match((await page.locator("[data-inventory-empty]").textContent()).trim(), /还没有收集到物品/);
    assert.equal(await page.locator("[data-super-project='j20-sky-fighter']").count(), 1, "inventory should show the J-20 super project blueprint");
    assert.equal((await page.locator("[data-project-progress]").textContent()).includes("工程进度"), true, "super project should show overall progress");
    assert.equal((await page.locator("[data-project-progress]").textContent()).includes("0 / 29"), true, "empty project should start at 0/29 crafted milestones including processing");
    assert.equal(await page.locator("[data-project-progress-meter]").getAttribute("aria-valuenow"), "0");
    const blueprintArt = page.locator("[data-super-project='j20-sky-fighter'] > [data-fighter-art='j20-sky-fighter'][data-fighter-state='blueprint']");
    assert.equal(await blueprintArt.count(), 1, "J-20 blueprint should include original fighter art");
    assert.equal(await blueprintArt.locator("[data-fighter-detail='stealth-airframe']").count(), 1, "fighter art should expose a detailed stealth airframe");
    assert.equal(await blueprintArt.locator("[data-fighter-detail='cockpit']").count(), 1, "fighter art should include a cockpit canopy");
    assert.equal(await blueprintArt.locator("[data-fighter-detail='engine-nozzles']").count(), 1, "fighter art should include twin engine nozzles");
    await page.locator("[data-close-inventory]").click();
    await page.locator("[data-game-screen='map']").waitFor({ state: "visible" });

    await page.locator("[data-level-id='chapter-01-level-1']").click();
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible" });
    assert.equal((await page.locator("[data-question-counter]").textContent()).trim(), "第 1 / 10 题");
    assert.equal(await page.evaluate(() => document.activeElement?.matches("[data-answer-input]")), true, "answer input should auto-focus when a challenge starts");
    assert.equal(await page.locator("[data-challenge-return-map]").count(), 1, "challenge screen should offer a return-to-map save action");
    assert.equal((await page.locator("[data-reward-preview]").textContent()).includes("橡木原木"), true);
    assert.equal(await page.locator("[data-reward-preview] img[alt='橡木原木的高写实微缩模型']").count(), 1);
    assert.equal((await page.locator("[data-question-story-beat]").textContent()).trim().length > 0, true, "every challenge should introduce its mission context");
    assert.equal(await page.locator("[data-answer-option]").count(), 0, "numeric questions must not render text-choice answers");
    assert.equal(await page.locator("[data-submit-answer]").isVisible(), true, "numeric questions should use the answer input submit flow");
    assert.equal(await page.locator("[data-reward-preview][data-reward-type='fixed']").count(), 1);
    assert.equal(await page.locator("[data-reward-preview] [data-reward-status='awarded']").count(), 1);
    assert.equal(await page.locator("[data-reward-preview] img").count(), 1, "item reward preview must use its generated visual");

    await page.locator("[data-answer-input]").fill("unsubmitted draft 42");
    await page.locator("[data-challenge-return-map]").click();
    await page.locator("[data-game-screen='map']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-level-id='chapter-01-level-1']").getAttribute("data-status"), "paused");
    assert.equal((await page.locator("[data-level-id='chapter-01-level-1']").textContent()).includes("继续挑战"), true);
    await page.locator("[data-level-id='chapter-01-level-1']").click();
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible" });
    assert.equal((await page.locator("[data-question-counter]").textContent()).trim(), "第 1 / 10 题");
    assert.equal(await page.locator("[data-answer-input]").inputValue(), "unsubmitted draft 42", "returning to map must preserve an unsubmitted answer draft");
    assert.equal(await page.evaluate(() => document.activeElement?.matches("[data-answer-input]")), true, "answer input should auto-focus when a paused challenge resumes");

    await page.locator("[data-open-inventory]").click();
    await page.locator("[data-game-screen='inventory']").waitFor({ state: "visible" });
    await page.locator("[data-close-inventory]").click();
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-answer-input]").inputValue(), "unsubmitted draft 42", "inventory must preserve an unsubmitted challenge answer");

    await answerIncorrectly(page);
    assert.equal(await page.locator("[data-answer-feedback='retry']").count(), 1, "incorrect submissions should show encouragement");
    assert.equal(await page.locator("[data-retry-question]").isVisible(), true);
    assert.equal(await page.locator("[data-skip-question]").isVisible(), true);
    assert.equal(await page.locator("[data-submit-answer]").isVisible(), false);
    assert.equal(await page.locator("[data-open-inventory]").count(), 0, "inventory must not be exposed after an incorrect answer");
    assert.deepEqual(
      await page.locator("[data-game-screen='challenge'] button:visible").allTextContents(),
      ["再试一次", "跳过"],
      "retry and skip must be the only visible challenge actions after an incorrect answer"
    );
    for (const forbiddenText of ["答案：", "解析：", "提示：", "错因", "学习支持"]) {
      assert.equal(await page.getByText(forbiddenText, { exact: false }).count(), 0, `${forbiddenText} must never be disclosed`);
    }

    await page.locator("[data-retry-question]").click();
    assert.equal(await page.locator("[data-submit-answer]").isVisible(), true);
    assert.equal(await page.locator("[data-answer-input]").inputValue(), "");
    await page.locator("[data-answer-input]").fill("16");
    await page.locator("[data-submit-answer]").click();
    await page.locator("[data-reward-toast]").waitFor({ state: "visible" });
    assert.equal((await page.locator("[data-reward-toast]").textContent()).includes("橡木原木"), true);
    assert.equal(await page.locator("[data-reward-toast] [data-item-id='oak-log']").count(), 1);
    assert.equal(await page.locator("[data-reward-popover]").count(), 0, "ordinary fixed rewards must not block the next action");
    assert.equal(await page.locator("[data-dismiss-reward-popover]").count(), 0, "ordinary fixed rewards need no dismissal");
    await page.locator("[data-answer-feedback='correct']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-tactical-review]").count(), 1, "correct answers should stop on a tactical review");
    assert.equal(await page.locator("[data-tactical-review] details").evaluate((details) => details.open), false, "review should be collapsed by default");
    assert.equal(await page.locator("[data-answer-input]").count(), 0, "resolved questions must not accept another answer");
    await continueResolvedQuestion(page);
    await page.locator("[data-question-counter]").filter({ hasText: "第 2 / 10 题" }).waitFor();

    for (let questionNumber = 2; questionNumber <= 10; questionNumber += 1) {
      await answerIncorrectly(page);
      await page.locator("[data-skip-question]").click();
      await continueResolvedQuestion(page);
      if (questionNumber < 10) {
        if (questionNumber === 2) {
          await page.locator("[data-reward-preview][data-reward-type='fixed-plus-random']").waitFor({ state: "visible" });
          assert.equal(await page.locator("[data-random-reward-bonus]").count(), 1, "advanced questions should advertise an extra random bonus without hiding the fixed material");
        }
        await page.locator("[data-question-counter]").filter({ hasText: `第 ${questionNumber + 1} / 10 题` }).waitFor();
      }
    }

    await page.locator("[data-game-screen='settlement']").waitFor({ state: "visible" });
    assert.equal((await page.locator("[data-settlement-celebration]").textContent()).includes("关卡突破"), true, "settlement should celebrate the cleared level");
    assert.equal((await page.locator("[data-unlocked-next-level]").textContent()).includes("第 2 关已解锁"), true, "settlement should announce the next unlocked level");
    assert.equal((await page.locator("[data-settlement-stars]").textContent()).trim(), "★☆☆");
    assert.equal((await page.locator("[data-settlement-items]").textContent()).includes("橡木原木"), true);
    assert.equal(await page.locator("[data-settlement-items] img[alt='橡木原木的高写实微缩模型']").count(), 1);

    await page.locator("[data-return-map]").click();
    await page.locator("[data-game-screen='map']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-level-id='chapter-01-level-1']").getAttribute("data-status"), "cleared");
    assert.equal(await page.locator("[data-level-id='chapter-01-level-2']").getAttribute("data-status"), "current");
    assert.equal((await page.locator("[data-chapter-stage='1']").textContent()).includes("1 / 3"), true, "stage one should update after the first cleared level");
    await page.locator("[data-open-inventory]").click();
    assert.equal((await page.locator("[data-game-screen='inventory']").textContent()).includes("橡木原木"), true);
    await page.locator("[data-close-inventory]").click();

    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-game-screen='map']").waitFor({ state: "visible" });
    await page.locator("[data-level-id='chapter-01-level-2']").click();
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible" });
    assert.equal((await page.locator("[data-question-counter]").textContent()).trim(), "第 1 / 10 题");
    assert.equal((await page.locator("[data-level-heading]").textContent()).includes("第 2 关"), true);

    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible" });
    assert.equal((await page.locator("[data-level-heading]").textContent()).includes("第 2 关"), true, "active challenge should restore locally");
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK game UI behavior test at ${baseUrl}`);
  }, { port: process.env.GAME_UI_TEST_PORT || "4176" });

  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("math-quest-game-v1", JSON.stringify({
        inventory: { "oak-log": 999 }
      }));
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-level-id='chapter-01-level-1']").click();

    for (let questionNumber = 1; questionNumber <= 9; questionNumber += 1) {
      await answerIncorrectly(page);
      await page.locator("[data-skip-question]").click();
      await continueResolvedQuestion(page);
    }

    assert.equal(
      await page.locator("[data-reward-preview] [data-item-id='oak-log'][data-reward-status='stack-capped']").count(),
      1,
      "fixed mainline reward preview must disclose a stack cap"
    );
    await answerIncorrectly(page);
    await page.locator("[data-skip-question]").click();
    await continueResolvedQuestion(page);
    await page.locator("[data-game-screen='settlement']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-settlement-items] [data-item-id]").count(), 0, "prior inventory must not appear as current-run loot");
    assert.equal(await page.locator("[data-settlement-items] .empty-state").count(), 1, "all-skip replay must show an empty earned state");
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK game replay reward disclosure test at ${baseUrl}`);
  }, { port: process.env.GAME_UI_REPLAY_PORT || "4184" });

  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.addInitScript(() => {
      Storage.prototype.getItem = function getItem() { throw new Error("blocked storage read"); };
      Storage.prototype.setItem = function setItem() { throw new Error("blocked storage write"); };
    });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator("[data-game-screen='map']").waitFor({ state: "visible" });
    await page.locator("[data-level-id='chapter-01-level-1']").click();
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-question-counter]").count(), 1, "save failure must not block rendering the new state");
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK game storage failure fallback test at ${baseUrl}`);
  }, { port: process.env.GAME_UI_STORAGE_PORT || "4185" });

  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("math-quest-game-v1", JSON.stringify({
        inventory: { "oak-log": 3 },
        unlockedLevelIds: ["chapter-01-level-1", "chapter-01-level-2"],
        levelRecords: { "chapter-01-level-1": { starCount: 1 } }
      }));
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-open-inventory]").click();
    await page.locator("[data-game-screen='inventory']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-material-recipe-card-id='refine-j20-processed-frame-plate']").count(), 1, "material processing should show its first recipe");
    await page.locator("[data-material-recipe-id='refine-j20-processed-frame-plate']").click();
    assert.equal(await page.locator("[data-project-recipe-card-id='craft-j20-frame-rib'] [data-project-art='j20-frame-rib']").count(), 1, "component recipe should show its output art");
    assert.equal(await page.locator("[data-project-recipe-id='craft-j20-frame-rib']").isEnabled(), true);
    await page.locator("[data-project-recipe-id='craft-j20-frame-rib']").click();
    assert.equal((await page.locator("[data-crafting-feedback]").textContent()).includes("机体肋梁"), true, "crafting should announce the crafted component");
    assert.equal((await page.locator("[data-project-progress]").textContent()).includes("2 / 29"), true, "processing and component crafting should advance project progress");
    assert.equal(await page.locator("[data-project-progress-meter]").getAttribute("aria-valuenow"), "2");
    assert.equal(await page.locator("[data-game-screen='inventory']").textContent().then((text) => text.includes("机体肋梁")), true);
    assert.equal(await page.locator("[data-item-id='j20-frame-rib'] [data-project-art='j20-frame-rib']").count(), 1, "crafted component should show its own item art");
    const persistentInventory = await page.evaluate(() => JSON.parse(localStorage.getItem("math-quest-inventory-v1")).inventory);
    assert.deepEqual(persistentInventory, { "j20-frame-rib": 1 });

    await page.evaluate(() => {
      localStorage.removeItem("math-quest-campaign-v2");
      localStorage.setItem("math-quest-inventory-v1", JSON.stringify({
        version: "math-quest-inventory-v1",
        inventory: { "j20-frame-rib": 1, "j20-wing-spar": 1, "j20-skin-panel": 1 }
      }));
      localStorage.setItem("math-quest-game-v1", JSON.stringify({
        unlockedLevelIds: Array.from({ length: 3 }, (_, index) => `chapter-01-level-${index + 1}`),
        levelRecords: Object.fromEntries(Array.from({ length: 3 }, (_, index) => [`chapter-01-level-${index + 1}`, { starCount: 1 }]))
      }));
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-open-inventory]").click();
    await page.locator("[data-game-screen='inventory']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-project-recipe-card-id='assemble-j20-airframe'] [data-project-art='j20-airframe']").count(), 1, "large-part recipe should show its output art");
    assert.equal(await page.locator("[data-project-recipe-id='assemble-j20-airframe']").isEnabled(), true);
    await page.locator("[data-project-recipe-id='assemble-j20-airframe']").click();
    assert.equal((await page.locator("[data-crafting-feedback]").textContent()).includes("机身结构部件"), true, "part assembly should announce the crafted part");
    assert.equal(await page.locator("[data-item-id='j20-airframe'] [data-project-art='j20-airframe']").count(), 1, "crafted large part should show its own item art");

    await page.evaluate(() => {
      localStorage.removeItem("math-quest-campaign-v2");
      const partIds = ["j20-airframe", "j20-avionics", "j20-stealth-wing", "j20-vector-engine"];
      localStorage.setItem("math-quest-inventory-v1", JSON.stringify({
        version: "math-quest-inventory-v1",
        inventory: Object.fromEntries(partIds.map((itemId) => [itemId, 1]))
      }));
      localStorage.setItem("math-quest-game-v1", JSON.stringify({
        unlockedLevelIds: Array.from({ length: 12 }, (_, index) => `chapter-01-level-${index + 1}`),
        levelRecords: Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`chapter-01-level-${index + 1}`, { starCount: 1 }]))
      }));
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-open-inventory]").click();
    await page.locator("[data-game-screen='inventory']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-super-project='j20-sky-fighter'] > [data-fighter-art='j20-sky-fighter'][data-fighter-state='blueprint']").count(), 1);
    assert.equal(await page.locator("[data-project-recipe-id='assemble-j20-sky-fighter']").isEnabled(), true);
    await page.locator("[data-project-recipe-id='assemble-j20-sky-fighter']").click();
    assert.equal((await page.locator("[data-crafting-feedback]").textContent()).includes("J-20 苍穹战机"), true, "final assembly should announce the super project");
    assert.equal(await page.locator("[data-final-project-ceremony]").count(), 1, "final assembly should trigger a dedicated first-chapter ceremony");
    assert.equal(await page.locator("[data-final-project-ceremony] [data-fighter-art='j20-sky-fighter'][data-fighter-state='completed']").count(), 1, "final ceremony should show the completed fighter art");
    assert.equal((await page.locator("[data-project-progress]").textContent()).includes("29 / 29"), true, "final fighter should complete the project progress");
    assert.equal(await page.locator("[data-project-progress-meter]").getAttribute("aria-valuenow"), "29");
    const completedBlueprintArt = page.locator("[data-super-project='j20-sky-fighter'] > [data-fighter-art='j20-sky-fighter'][data-fighter-state='completed']");
    assert.equal(await completedBlueprintArt.count(), 1);
    assert.equal(await completedBlueprintArt.locator("[data-fighter-detail='afterburner-glow']").count(), 1, "completed fighter should show a cool afterburner glow");
    assert.equal(await page.locator("[data-item-id='j20-sky-fighter'] [data-fighter-art='j20-sky-fighter']").count(), 1, "final item should use the same fighter art");
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK game J-20 crafting persistence test at ${baseUrl}`);
  }, { port: process.env.GAME_UI_CRAFTING_PORT || "4186" });

  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const clearedChapter = (chapterId) => ({
        unlockedLevelIds: Array.from({ length: 12 }, (_, index) => `${chapterId}-level-${index + 1}`),
        levelRecords: Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`${chapterId}-level-${index + 1}`, { starCount: 3 }]))
      });
      localStorage.clear();
      localStorage.setItem("math-quest-inventory-v1", JSON.stringify({
        version: "math-quest-inventory-v1",
        inventory: {
          "j20-sky-fighter": 1,
          "deep-sea-explorer": 1,
          "orbital-science-station": 1,
          "polar-icebreaker": 1
        }
      }));
      localStorage.setItem("math-quest-campaign-v2", JSON.stringify({
        version: "math-quest-campaign-v2",
        activeChapterId: "chapter-04",
        lastScreen: "map",
        chapterStates: {
          "chapter-01": clearedChapter("chapter-01"),
          "chapter-02": clearedChapter("chapter-02"),
          "chapter-03": clearedChapter("chapter-03"),
          "chapter-04": { unlockedLevelIds: ["chapter-04-level-1"], levelRecords: {} }
        }
      }));
    });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator("[data-level-id='chapter-04-level-1']").count(), 1, "fourth chapter should become the active route");
    assert.equal((await page.locator("[data-campaign-overview]").textContent()).includes("六章数学远征"), true, "campaign overview should reflect the full campaign");
    assert.match(await page.locator("[data-level-map]").getAttribute("aria-label"), /极地破冰远征/, "map label should name the active polar route");
    await page.locator("[data-open-inventory]").click();
    await page.locator("[data-game-screen='inventory']").waitFor({ state: "visible" });
    const polarBlueprint = page.locator("[data-super-project='polar-icebreaker']");
    assert.equal(await polarBlueprint.count(), 1, "inventory should show the polar icebreaker blueprint");
    const polarHero = polarBlueprint.locator(":scope > img[data-item-visual='polar-icebreaker']");
    assert.equal(await polarHero.count(), 1, "icebreaker blueprint should use its own hero visual");
    assert.equal(await polarHero.getAttribute("loading"), "eager", "final blueprint art should preload when the inventory opens");
    assert.equal(await polarBlueprint.locator("[data-fighter-art]").count(), 0, "non-fighter projects must not reuse J-20 artwork");
    await page.locator("[data-close-inventory]").click();
    await page.locator("[data-game-screen='map']").waitFor({ state: "visible" });
    await page.locator("[data-level-id='chapter-04-level-1']").click();
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible" });
    assert.match(await page.locator("[data-question-prompt]").textContent(), /极地破冰船任务/);
    assert.equal((await page.locator("[data-reward-preview]").textContent()).includes("冰晶碎片"), true, "polar challenge should preview its own fixed material");
    await page.locator("[data-answer-input]").fill("55");
    await page.locator("[data-submit-answer]").click();
    await page.locator("[data-answer-feedback='correct']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-tactical-review]").count(), 1, "polar answers should provide the standard collapsed tactical review");
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK game polar icebreaker project visual test at ${baseUrl}`);
  }, { port: process.env.GAME_UI_POLAR_PROJECT_PORT || "4191" });

  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const clearedChapter = (chapterId) => ({
        unlockedLevelIds: Array.from({ length: 12 }, (_, index) => `${chapterId}-level-${index + 1}`),
        levelRecords: Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`${chapterId}-level-${index + 1}`, { starCount: 3 }]))
      });
      localStorage.clear();
      localStorage.setItem("math-quest-inventory-v1", JSON.stringify({
        version: "math-quest-inventory-v1",
        inventory: {
          "j20-sky-fighter": 1,
          "deep-sea-explorer": 1,
          "orbital-science-station": 1,
          "polar-icebreaker": 1
        }
      }));
      localStorage.setItem("math-quest-campaign-v2", JSON.stringify({
        version: "math-quest-campaign-v2",
        activeChapterId: "chapter-05",
        lastScreen: "map",
        chapterStates: {
          "chapter-01": clearedChapter("chapter-01"),
          "chapter-02": clearedChapter("chapter-02"),
          "chapter-03": clearedChapter("chapter-03"),
          "chapter-04": clearedChapter("chapter-04"),
          "chapter-05": { unlockedLevelIds: ["chapter-05-level-1"], levelRecords: {} }
        }
      }));
    });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator("[data-level-id='chapter-05-level-1']").count(), 1, "fifth chapter should become the active route");
    assert.equal((await page.locator("[data-campaign-overview]").textContent()).includes("六章数学远征"), true, "campaign overview should reflect six chapters");
    assert.match(await page.locator("[data-level-map]").getAttribute("aria-label"), /装甲突击演练/, "map label should name the armored route");
    await page.locator("[data-open-inventory]").click();
    await page.locator("[data-game-screen='inventory']").waitFor({ state: "visible" });
    const tankBlueprint = page.locator("[data-super-project='99a-main-battle-tank']");
    assert.equal(await tankBlueprint.count(), 1, "inventory should show the 99A blueprint");
    const tankHero = tankBlueprint.locator(":scope > img[data-item-visual='99a-main-battle-tank']");
    assert.equal(await tankHero.count(), 1, "99A blueprint should use its own hero visual");
    assert.equal(await tankHero.getAttribute("loading"), "eager", "99A hero visual should preload when the inventory opens");
    await page.locator("[data-close-inventory]").click();
    await page.locator("[data-level-id='chapter-05-level-1']").click();
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible" });
    assert.match(await page.locator("[data-question-prompt]").textContent(), /装甲突击演练任务/);
    assert.equal((await page.locator("[data-reward-preview]").textContent()).includes("碳钛复合板"), true, "armored challenge should preview its own fixed material");
    assert.equal(await page.locator("[data-answer-input]").evaluate((input) => document.activeElement === input), true, "challenge answer input should autofocus");
    await page.locator("[data-answer-input]").fill("15");
    await page.locator("[data-submit-answer]").click();
    await page.locator("[data-answer-feedback='correct']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-tactical-review]").count(), 1, "99A answers should provide the standard collapsed tactical review");
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK game 99A armored project visual test at ${baseUrl}`);
  }, { port: process.env.GAME_UI_ARMORED_PROJECT_PORT || "4192" });

  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const clearedChapter = (chapterId) => ({
        unlockedLevelIds: Array.from({ length: 12 }, (_, index) => `${chapterId}-level-${index + 1}`),
        levelRecords: Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`${chapterId}-level-${index + 1}`, { starCount: 3 }]))
      });
      localStorage.clear();
      localStorage.setItem("math-quest-inventory-v1", JSON.stringify({
        version: "math-quest-inventory-v1",
        inventory: {
          "j20-sky-fighter": 1,
          "deep-sea-explorer": 1,
          "orbital-science-station": 1,
          "polar-icebreaker": 1,
          "99a-main-battle-tank": 1
        }
      }));
      localStorage.setItem("math-quest-campaign-v2", JSON.stringify({
        version: "math-quest-campaign-v2",
        activeChapterId: "chapter-06",
        lastScreen: "map",
        chapterStates: {
          "chapter-01": clearedChapter("chapter-01"),
          "chapter-02": clearedChapter("chapter-02"),
          "chapter-03": clearedChapter("chapter-03"),
          "chapter-04": clearedChapter("chapter-04"),
          "chapter-05": clearedChapter("chapter-05"),
          "chapter-06": { unlockedLevelIds: ["chapter-06-level-1"], levelRecords: {} }
        }
      }));
    });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator("[data-level-id='chapter-06-level-1']").count(), 1, "sixth chapter should become the active route");
    assert.equal((await page.locator("[data-campaign-overview]").textContent()).includes("六章数学远征"), true, "campaign overview should include the quantum route");
    assert.match(await page.locator("[data-level-map]").getAttribute("aria-label"), /星海数据与概率远征/, "map label should name the active star-sea route");
    await page.locator("[data-open-inventory]").click();
    await page.locator("[data-game-screen='inventory']").waitFor({ state: "visible" });
    const quantumBlueprint = page.locator("[data-super-project='quantum-communication-satellite']");
    assert.equal(await quantumBlueprint.count(), 1, "inventory should show the quantum satellite blueprint");
    const quantumHero = quantumBlueprint.locator(":scope > img[data-item-visual='quantum-communication-satellite']");
    assert.equal(await quantumHero.count(), 1, "quantum satellite blueprint should use its own hero visual");
    assert.equal(await quantumHero.getAttribute("loading"), "eager", "final satellite visual should preload when the inventory opens");
    assert.equal(await page.locator("[data-material-recipe-card-id='refine-satellite-truss-alloy']").count(), 1, "quantum inventory should expose its first material refinement recipe");
    assert.equal(await page.locator("[data-material-recipe-card-id]").count(), 12, "quantum inventory should expose all twelve refinement recipes");
    await page.locator("[data-close-inventory]").click();
    await page.locator("[data-game-screen='map']").waitFor({ state: "visible" });
    await page.locator("[data-level-id='chapter-06-level-1']").click();
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible" });
    assert.match(await page.locator("[data-question-prompt]").textContent(), /星海数据与概率远征任务/);
    assert.equal((await page.locator("[data-reward-preview]").textContent()).includes("星光晶体"), true, "quantum challenge should preview its own fixed material");
    assert.equal(await page.locator("[data-answer-input]").evaluate((input) => document.activeElement === input), true, "quantum challenge answer input should autofocus");
    await page.locator("[data-answer-input]").fill("20");
    await page.locator("[data-submit-answer]").click();
    await page.locator("[data-answer-feedback='correct']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-tactical-review]").count(), 1, "quantum answers should provide the standard collapsed tactical review");
    assert.equal(await page.locator("[data-tactical-review] details").evaluate((details) => details.open), false, "quantum review should be collapsed by default");
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK game quantum satellite project visual test at ${baseUrl}`);
  }, { port: process.env.GAME_UI_QUANTUM_PROJECT_PORT || "4193" });

  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("math-quest-inventory-v1", JSON.stringify({
        version: "math-quest-inventory-v1",
        inventory: { "j20-frame-rib": 1, "j20-wing-spar": 1, "j20-skin-panel": 1 }
      }));
      const legacyState = {
        lastScreen: "settlement",
        activeChapterId: "chapter-01",
        unlockedLevelIds: Array.from({ length: 4 }, (_, index) => `chapter-01-level-${index + 1}`),
        levelRecords: Object.fromEntries(Array.from({ length: 3 }, (_, index) => [`chapter-01-level-${index + 1}`, { starCount: 1 }])),
        lastSettlement: {
          levelId: "chapter-01-level-3",
          starCount: 1,
          correctCount: 1,
          skippedCount: 9,
          earnedItems: [],
          rewardTransactions: []
        }
      };
      localStorage.setItem("math-quest-game-v1", JSON.stringify(legacyState));
      localStorage.setItem("math-quest-campaign-v2", JSON.stringify({
        version: "math-quest-campaign-v2",
        activeChapterId: "chapter-01",
        lastScreen: "settlement",
        chapterStates: { "chapter-01": legacyState }
      }));
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-game-screen='settlement']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-stage-crafting-callout]").getAttribute("data-stage-crafting-status"), "ready");
    assert.equal((await page.locator("[data-stage-crafting-callout]").textContent()).includes("可以拼装"), true);
    await page.locator("[data-stage-crafting-action]").click();
    await page.locator("[data-game-screen='inventory']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-project-recipe-id='assemble-j20-airframe']").isEnabled(), true);
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK game stage crafting callout test at ${baseUrl}`);
  }, { port: process.env.GAME_UI_STAGE_CRAFTING_PORT || "4187" });

  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    const seedFinalSettlement = async (inventory) => page.evaluate((seedInventory) => {
      localStorage.clear();
      localStorage.setItem("math-quest-inventory-v1", JSON.stringify({
        version: "math-quest-inventory-v1",
        inventory: seedInventory
      }));
      const legacyState = {
        lastScreen: "settlement",
        activeChapterId: "chapter-01",
        unlockedLevelIds: Array.from({ length: 12 }, (_, index) => `chapter-01-level-${index + 1}`),
        levelRecords: Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`chapter-01-level-${index + 1}`, { starCount: 1 }])),
        lastSettlement: {
          levelId: "chapter-01-level-12",
          starCount: 1,
          correctCount: 1,
          skippedCount: 9,
          earnedItems: [],
          rewardTransactions: []
        }
      };
      localStorage.setItem("math-quest-game-v1", JSON.stringify(legacyState));
      localStorage.setItem("math-quest-campaign-v2", JSON.stringify({
        version: "math-quest-campaign-v2",
        activeChapterId: "chapter-01",
        lastScreen: "settlement",
        chapterStates: { "chapter-01": legacyState }
      }));
    }, inventory);

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await seedFinalSettlement({
      "j20-airframe": 1,
      "j20-avionics": 1,
      "j20-stealth-wing": 1,
      "j20-vector-engine": 1
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-game-screen='settlement']").waitFor({ state: "visible" });
    await page.locator("[data-chapter-finale]").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-chapter-finale]").getAttribute("data-finale-status"), "chapter-cleared");
    assert.equal((await page.locator("[data-chapter-finale]").textContent()).includes("12 / 12"), true, "chapter finale should show full route progress");
    await page.locator("[data-chapter-finale-action]").click();
    await page.locator("[data-game-screen='inventory']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-project-recipe-id='assemble-j20-sky-fighter']").isEnabled(), true);

    await seedFinalSettlement({ "j20-sky-fighter": 1 });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-game-screen='settlement']").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-chapter-finale]").getAttribute("data-finale-status"), "project-complete");
    assert.equal(await page.locator("[data-chapter-finale] [data-fighter-art='j20-sky-fighter'][data-fighter-state='completed']").count(), 1);
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK game chapter finale test at ${baseUrl}`);
  }, { port: process.env.GAME_UI_CHAPTER_FINALE_PORT || "4188" });

  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    const answerGrid = await page.evaluate(() => globalThis.GameChapterBuilder
      .buildChapter(globalThis.GameChapterConfig.FIRST_CHAPTER_ID, globalThis.MATH_LEARNING_DATA)
      .levels.map((level) => level.questions.map((question) => String(question.answer))));
    await page.locator("[data-game-screen='map']").waitFor({ state: "visible" });
    await page.locator("[data-level-id='chapter-01-level-1']").click();

    for (let levelIndex = 0; levelIndex < answerGrid.length; levelIndex += 1) {
      await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible" });
      for (let questionIndex = 0; questionIndex < answerGrid[levelIndex].length; questionIndex += 1) {
        await page.locator("[data-answer-input]").fill(answerGrid[levelIndex][questionIndex]);
        await page.locator("[data-submit-answer]").click();
        await page.locator("[data-tactical-review]").waitFor({ state: "visible" });
        if (questionIndex < answerGrid[levelIndex].length - 1) {
          const popover = page.locator("[data-reward-popover]");
          if (await popover.count()) await page.locator("[data-dismiss-reward-popover]").click();
          await continueResolvedQuestion(page);
          await page.locator("[data-question-counter]").filter({ hasText: `${questionIndex + 2} / 10` }).waitFor();
        } else {
          await continueResolvedQuestion(page);
        }
      }
      await page.locator("[data-game-screen='settlement']").waitFor({ state: "visible" });
      if (levelIndex < answerGrid.length - 1) {
        assert.equal((await page.locator("[data-unlocked-next-level]").textContent()).includes(`第 ${levelIndex + 2} 关`), true);
        await page.locator("[data-next-level]").click();
      }
    }

    await page.locator("[data-chapter-finale]").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-chapter-finale]").getAttribute("data-finale-status"), "chapter-cleared");
    assert.equal((await page.locator("[data-chapter-finale]").textContent()).includes("12 / 12"), true);
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK game full chapter playthrough test at ${baseUrl}`);
  }, { port: process.env.GAME_UI_FULL_CHAPTER_PORT || "4189" });

  for (const [index, viewport] of RESPONSIVE_VIEWPORTS.entries()) {
    await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(baseUrl, { waitUntil: "networkidle" });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: "networkidle" });
      await page.locator("[data-game-screen='map']").waitFor({ state: "visible" });
      const layout = await page.evaluate(() => ({
        bodyWidth: document.body.scrollWidth,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        mapColumns: getComputedStyle(document.querySelector("[data-level-map]")).gridTemplateColumns.split(" ").length,
        visibleScreens: Array.from(document.querySelectorAll("[data-game-screen]")).filter((element) => element.offsetParent !== null).length,
        undersizedButtons: Array.from(document.querySelectorAll("button")).filter((button) => {
          const box = button.getBoundingClientRect();
          return box.width < 44 || box.height < 44;
        }).length,
        transitionDuration: Number.parseFloat(getComputedStyle(document.querySelector("button")).transitionDuration)
      }));
      assert.ok(layout.bodyWidth <= layout.viewportWidth + 2, `body overflows at ${viewport.width}px`);
      assert.ok(layout.documentWidth <= layout.viewportWidth + 2, `document overflows at ${viewport.width}px`);
      assert.equal(layout.mapColumns, viewport.columns, `map column count at ${viewport.width}px`);
      assert.equal(layout.visibleScreens, 1, "only one game screen should be visible");
      assert.equal(layout.undersizedButtons, 0, "all touch targets should be at least 44px");
      assert.ok(layout.transitionDuration <= 0.01, "reduced-motion should minimize transitions");
      assert.deepEqual(pageErrors, [], `browser console/page errors at ${viewport.width}px:\n${pageErrors.join("\n")}`);
      console.log(`OK game responsive audit ${viewport.width}x${viewport.height}`);
    }, { port: Number(process.env.GAME_UI_AUDIT_PORT || 4177) + index, viewport });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
