const test = require("node:test");
const assert = require("node:assert/strict");
const methods = require("../game/mathThinkingMethods.js");

test("常用数学思维方法提供稳定标签、提示和复盘信息", () => {
  const method = methods.getThinkingMethod("draw-bar-model");
  assert.equal(method.id, "draw-bar-model");
  assert.equal(method.label, "画线段图");
  assert.match(method.prompt, /画|图/);
  assert.match(method.review, /观察|验证/);
  assert.ok(method.reasoningType);
});

test("未知思维方法返回空值，不影响旧题库读取", () => {
  assert.equal(methods.getThinkingMethod("unknown-method"), null);
});

test("新增三章的36个专题全部绑定合法思维方法", () => {
  for (const chapterId of ["chapter-07", "chapter-08", "chapter-09"]) {
    const modules = methods.getChapterMethodIds(chapterId);
    assert.equal(modules.length, 12);
    assert.equal(new Set(modules).size, 12);
    modules.forEach((methodId) => assert.ok(methods.getThinkingMethod(methodId), methodId));
  }
});
