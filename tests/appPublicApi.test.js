const assert = require("node:assert/strict");
const test = require("node:test");

function loadFreshApi() {
  delete global.MathLearningApp;
  delete require.cache[require.resolve("../appPublicApi.js")];
  return require("../appPublicApi.js");
}

test("exposes app navigation and storage helpers", () => {
  const previousGlobals = {
    document: global.document,
    localStorage: global.localStorage,
    location: global.location,
    MATH_LEARNING_DATA: global.MATH_LEARNING_DATA,
    setTimeout: global.setTimeout
  };

  const storedValues = new Map();
  let clickedGradeAll = false;
  let clickedModule = false;
  let scrolledToLesson = false;

  const activeModuleTitle = { textContent: "找规律" };
  const moduleButton = {
    querySelector(selector) {
      return selector === "strong" ? activeModuleTitle : null;
    },
    click() {
      clickedModule = true;
    }
  };
  const gradeAllButton = {
    textContent: "全部",
    classList: {
      contains() {
        return false;
      }
    },
    click() {
      clickedGradeAll = true;
    }
  };

  global.MATH_LEARNING_DATA = [{ id: "patterns", title: "找规律" }];
  global.setTimeout = (callback) => callback();
  global.location = { reload() {} };
  global.localStorage = {
    getItem(key) {
      return storedValues.get(key) || null;
    },
    setItem(key, value) {
      storedValues.set(key, value);
    }
  };
  global.document = {
    getElementById(id) {
      if (id === "grade-filter") {
        return {
          querySelector(selector) {
            return selector === ".is-active" ? { textContent: "二年级" } : null;
          },
          querySelectorAll() {
            return [gradeAllButton];
          }
        };
      }
      if (id === "difficulty-filter") {
        return {
          querySelector(selector) {
            return selector === ".is-active" ? { textContent: "基础" } : null;
          },
          querySelectorAll() {
            return [];
          }
        };
      }
      if (id === "lesson-panel") {
        return {
          scrollIntoView() {
            scrolledToLesson = true;
          }
        };
      }
      return null;
    },
    querySelector(selector) {
      return selector === "#module-list .module-path__item.is-active strong" ? activeModuleTitle : null;
    },
    querySelectorAll(selector) {
      return selector === "#module-list .module-path__item" ? [moduleButton] : [];
    }
  };

  try {
    const api = loadFreshApi();

    assert.equal(global.MathLearningApp, api);
    assert.equal(api.findModuleById("patterns").title, "找规律");
    assert.deepEqual(api.getActiveFilters(), { grade: "二年级", difficulty: "基础" });
    assert.equal(api.getActiveModuleId(), "patterns");
    assert.equal(api.openModule("patterns"), true);
    assert.equal(clickedGradeAll, true);
    assert.equal(clickedModule, true);
    assert.equal(scrolledToLesson, true);

    assert.equal(api.saveState({ completed: { "patterns-1": true } }), true);
    assert.deepEqual(api.getState(), { completed: { "patterns-1": true } });
  } finally {
    global.document = previousGlobals.document;
    global.localStorage = previousGlobals.localStorage;
    global.location = previousGlobals.location;
    global.MATH_LEARNING_DATA = previousGlobals.MATH_LEARNING_DATA;
    global.setTimeout = previousGlobals.setTimeout;
    delete global.MathLearningApp;
    delete require.cache[require.resolve("../appPublicApi.js")];
  }
});
