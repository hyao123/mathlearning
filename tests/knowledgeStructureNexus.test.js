const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const chapterConfig = require("../game/chapterConfig.js");

// 辅助函数：在安全沙箱中加载前端 ES 模块并执行其实例方法
function loadFrontEndModule(relativePath, contextAdditions = {}) {
  const fullPath = path.join(__dirname, "..", relativePath);
  const code = fs.readFileSync(fullPath, "utf-8");
  const sandbox = {
    globalThis: {},
    console,
    appendText(parent, tag, text, className) {
      const el = sandbox.document.createElement(tag);
      if (className) el.className = className;
      if (text !== undefined && text !== null) el.textContent = text;
      parent.append(el);
      return el;
    },
    ...contextAdditions,
    document: {
      createElement(tag) {
        return {
          tagName: tag.toUpperCase(),
          className: "",
          dataset: {},
          style: {
            setProperty(prop, val) { this[prop] = val; }
          },
          attributes: {},
          children: [],
          setAttribute(name, val) { this.attributes[name] = val; },
          getAttribute(name) { return this.attributes[name]; },
          append(...els) { this.children.push(...els); },
          appendChild(el) { this.children.push(el); return el; },
          addEventListener(evt, handler) {
            this._listeners = this._listeners || {};
            this._listeners[evt] = handler;
          },
          remove() { this._removed = true; },
          classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); },
            toggle(c, force) {
              if (force === undefined) {
                if (this.classes.has(c)) this.classes.delete(c);
                else this.classes.add(c);
              } else if (force) this.classes.add(c);
              else this.classes.delete(c);
            }
          }
        };
      },
      createElementNS(ns, tag) {
        const el = this.createElement(tag);
        el.namespace = ns;
        return el;
      }
    }
  };
  sandbox.globalThis = sandbox;
  const transformed = code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, "")
                          .replace(/export\s+(async\s+)?function\s+/g, "$1function ")
                          .replace(/export\s+const\s+/g, "const ")
                          .replace(/export\s+let\s+/g, "let ")
                          .replace(/export\s+default\s+([a-zA-Z0-9_$]+);?/g, "globalThis.$1 = $1;");
  vm.runInNewContext(transformed, sandbox);
  return sandbox;
}

const topoSandbox = loadFrontEndModule("game/knowledgeTopologyAdapter.js");
const KnowledgeTopologyAdapter = topoSandbox.KnowledgeTopologyAdapter;

const constellationSandbox = loadFrontEndModule("game/knowledgeConstellationView.js", {
  KnowledgeTopologyAdapter
});
const KnowledgeConstellationView = constellationSandbox.KnowledgeConstellationView;

test("KnowledgeTopologyAdapter: 涵盖 9 大章节全部 108 个关卡模块的拓扑定义", () => {
  const chapterIds = chapterConfig.CHAPTER_IDS;
  assert.equal(chapterIds.length, 9, "Should have 9 chapters");

  let totalModulesChecked = 0;

  chapterIds.forEach((chapterId) => {
    const chapter = chapterConfig.CHAPTERS[chapterId];
    assert.ok(chapter, `Chapter ${chapterId} should exist`);
    assert.equal(chapter.levels.length, 12, `Chapter ${chapterId} should have exactly 12 levels`);

    chapter.levels.forEach((level) => {
      totalModulesChecked += 1;
      const topo = KnowledgeTopologyAdapter.getModuleTopology(level.moduleId, chapterId);
      assert.ok(topo, `Topology for module ${level.moduleId} in ${chapterId} must exist`);
      assert.equal(topo.moduleId, level.moduleId);

      // 验证思维领域
      assert.ok(topo.strand, `Module ${level.moduleId} must have strand`);
      assert.ok(["observation", "counting", "quantity", "change", "space-discrete", "logic", "geometry", "numberTheory"].includes(topo.strand),
        `Strand ${topo.strand} must be one of the core mathematical strands`);

      // 验证思维罗盘认知桥梁 (前置基石 -> 本关武器 -> 迁移目标)
      assert.ok(topo.learningBridge, `Module ${level.moduleId} must have learningBridge`);
      assert.ok(topo.learningBridge.prerequisiteSummary, `Module ${level.moduleId} must have prerequisiteSummary`);
      assert.ok(topo.learningBridge.methodSummary?.label, `Module ${level.moduleId} must have methodSummary label`);
      assert.ok(topo.learningBridge.methodSummary?.description, `Module ${level.moduleId} must have methodSummary description`);
      assert.ok(Array.isArray(topo.learningBridge.transferTargets) && topo.learningBridge.transferTargets.length > 0,
        `Module ${level.moduleId} must have at least one transfer target`);

      // 验证大国重器工程算法算力赋能
      assert.ok(topo.engineeringAffinity, `Module ${level.moduleId} must have engineeringAffinity`);
      assert.ok(topo.engineeringAffinity.subsystem, `Module ${level.moduleId} must have engineeringAffinity subsystem`);
      assert.ok(topo.engineeringAffinity.algorithmRole, `Module ${level.moduleId} must have engineeringAffinity algorithmRole`);

      // 验证前置依赖非自环
      assert.ok(Array.isArray(topo.prerequisiteIds), `Module ${level.moduleId} prerequisiteIds must be an array`);
      assert.ok(!topo.prerequisiteIds.includes(level.moduleId), `Module ${level.moduleId} cannot be a prerequisite of itself`);
    });
  });

  assert.equal(totalModulesChecked, 108, "Should check all 108 modules across 9 chapters");
});

test("KnowledgeTopologyAdapter: 四大奥数螺旋演进主轴完整性与科学性", () => {
  const axes = KnowledgeTopologyAdapter.OLYMPIAD_SPIRAL_AXES;
  assert.ok(Array.isArray(axes), "OLYMPIAD_SPIRAL_AXES must be an array");
  assert.equal(axes.length, 4, "Must define 4 core Olympiad spiral axes");

  const axisIds = Array.from(axes.map((a) => a.id));
  assert.deepEqual(axisIds, [
    "algebra-elimination",
    "geometry-transformation",
    "number-theory-structure",
    "combinatorics-optimization"
  ]);

  axes.forEach((axis) => {
    assert.ok(axis.name, `Axis ${axis.id} must have a name`);
    assert.ok(axis.icon, `Axis ${axis.id} must have an icon`);
    assert.ok(axis.color, `Axis ${axis.id} must have a color theme`);
    assert.ok(axis.description, `Axis ${axis.id} must have a description`);
    assert.ok(Array.isArray(axis.milestones) && axis.milestones.length >= 4,
      `Axis ${axis.id} must have at least 4 progressive milestones`);
    assert.ok(Array.isArray(axis.levels) && axis.levels.length >= 6,
      `Axis ${axis.id} must cover cross-chapter levels`);

    axis.levels.forEach((l) => {
      assert.ok(chapterConfig.CHAPTERS[l.chapterId], `Chapter ${l.chapterId} in axis ${axis.id} must exist`);
      const chapter = chapterConfig.CHAPTERS[l.chapterId];
      const hasModule = chapter.levels.some((cl) => cl.moduleId === l.moduleId);
      assert.ok(hasModule, `Module ${l.moduleId} in chapter ${l.chapterId} must exist in curriculum`);
    });
  });
});

test("KnowledgeTopologyAdapter: calculateSpineProgress 进度计算准确性", () => {
  const axes = KnowledgeTopologyAdapter.OLYMPIAD_SPIRAL_AXES;
  const algebraAxis = axes.find((a) => a.id === "algebra-elimination");
  assert.ok(algebraAxis);

  // 空存档：0%
  const cleanCampaign = {
    chapterStates: {}
  };
  const cleanProg = KnowledgeTopologyAdapter.calculateSpineProgress("algebra-elimination", cleanCampaign);
  assert.equal(cleanProg.totalCount, algebraAxis.levels.length);
  assert.equal(cleanProg.clearedCount, 0);
  assert.equal(cleanProg.percentage, 0);

  // 模拟部分通关
  const firstLevelEntry = algebraAxis.levels[0];
  const mockCampaign = {
    chapterStates: {
      [firstLevelEntry.chapterId]: {
        levelRecords: {
          [`${firstLevelEntry.chapterId}-L01`]: { starCount: 3 }
        }
      }
    }
  };
  // 注意，若匹配 moduleId，我们也可以设置对应 levelId
  const chapter = chapterConfig.CHAPTERS[firstLevelEntry.chapterId];
  const targetLevel = chapter.levels.find((l) => l.moduleId === firstLevelEntry.moduleId);
  if (targetLevel) {
    mockCampaign.chapterStates[firstLevelEntry.chapterId].levelRecords[targetLevel.levelId] = { starCount: 3 };
  }

  const partialProg = KnowledgeTopologyAdapter.calculateSpineProgress("algebra-elimination", mockCampaign);
  assert.ok(partialProg.clearedCount >= 1);
  assert.ok(partialProg.percentage > 0);
  assert.ok(partialProg.percentage <= 100);
});

test("KnowledgeTopologyAdapter: 7大跨域底层逻辑跃迁桥梁定义与重器赋能", () => {
  const bridges = KnowledgeTopologyAdapter.INTRINSIC_LOGIC_BRIDGES;
  assert.ok(Array.isArray(bridges), "INTRINSIC_LOGIC_BRIDGES must be an array");
  assert.equal(bridges.length, 7, "Must define 7 intrinsic logic bridges");

  const expectedBridgeIds = [
    "chicken-rabbit-to-elimination",
    "hourglass-butterfly-to-similarity",
    "journey-differential-to-linear-function",
    "geometry-dissection-to-multiplication-identity",
    "engineering-efficiency-to-fractional-equation",
    "pigeonhole-worst-case-to-linear-programming",
    "arithmetic-second-order-to-quadratic-extremum"
  ];

  bridges.forEach((bridge, idx) => {
    assert.equal(bridge.id, expectedBridgeIds[idx]);
    assert.ok(bridge.name, `Bridge ${bridge.id} must have a title`);
    assert.ok(bridge.elementaryRoot, `Bridge ${bridge.id} must specify elementaryRoot`);
    assert.ok(bridge.axiomaticLeap, `Bridge ${bridge.id} must specify axiomaticLeap`);
    assert.ok(bridge.mathematicalEssence, `Bridge ${bridge.id} must specify mathematicalEssence`);
    assert.ok(bridge.engineeringAffinity?.system, `Bridge ${bridge.id} must have engineeringAffinity system`);
    assert.ok(bridge.engineeringAffinity?.subsystem, `Bridge ${bridge.id} must have engineeringAffinity subsystem`);
    assert.ok(bridge.engineeringAffinity?.role, `Bridge ${bridge.id} must have engineeringAffinity role`);
    assert.ok(Array.isArray(bridge.levels) && bridge.levels.length > 0, `Bridge ${bridge.id} must map to levels`);
  });
});

test("KnowledgeTopologyAdapter: getModuleLineage 关卡认知脉络反查", () => {
  const lineage = KnowledgeTopologyAdapter.getModuleLineage("chicken-rabbit", "chapter-01");
  assert.ok(lineage, "chicken-rabbit in chapter-01 should have lineage");
  assert.equal(lineage.title, "鸡兔同笼假设计算");
  assert.equal(lineage.strand.id, "quantity");
  assert.ok(lineage.prerequisiteSummary);
  assert.equal(lineage.methodSummary.label, "假设置换与差量补偿");
  assert.ok(lineage.transferTarget);
  assert.equal(lineage.engineeringAffinity.subsystem, "载荷配重与升阻比平衡解算系统");

  // 验证它关联了代数消元主轴和消元桥梁
  const axisIds = (lineage.relatedAxes || []).map((a) => a.id);
  assert.ok(axisIds.includes("algebra-elimination"), "Should belong to algebra-elimination axis");

  const bridgeIds = (lineage.relatedBridges || []).map((b) => b.id);
  assert.ok(bridgeIds.includes("chicken-rabbit-to-elimination"), "Should belong to chicken-rabbit-to-elimination bridge");
});

test("KnowledgeConstellationView: 9大章节均配置专属拓扑星图坐标", () => {
  const coordsByChapter = KnowledgeConstellationView.CONSTELLATION_COORDINATES_BY_CHAPTER;
  assert.ok(coordsByChapter, "CONSTELLATION_COORDINATES_BY_CHAPTER must exist");

  chapterConfig.CHAPTER_IDS.forEach((chId) => {
    const coords = coordsByChapter[chId];
    assert.ok(coords, `Chapter ${chId} must have coordinates in CONSTELLATION_COORDINATES_BY_CHAPTER`);
    assert.equal(coords.length, 12, `Chapter ${chId} must define 12 coordinate pairs for its 12 levels`);

    coords.forEach((c, idx) => {
      assert.ok(Number.isFinite(c.x) && c.x >= 60 && c.x <= 920,
        `Chapter ${chId} node ${idx} x=${c.x} must be within canvas bounds [60, 920]`);
      assert.ok(Number.isFinite(c.y) && c.y >= 60 && c.y <= 500,
        `Chapter ${chId} node ${idx} y=${c.y} must be within canvas bounds [60, 500]`);
    });
  });
});

test("KnowledgeConstellationView: createKnowledgeNexusModal 生成符合无障碍规范的模态窗", () => {
  const allChapters = chapterConfig.CHAPTER_IDS.map((id) => chapterConfig.CHAPTERS[id]);
  const campaign = { chapterStates: {} };

  let tabSwitched = null;
  let levelSelected = null;
  let closed = false;

  const modalOverlay = KnowledgeConstellationView.createKnowledgeNexusModal({
    campaign,
    allChapters,
    activeTab: "axes",
    onClose: () => { closed = true; },
    onSelectLevel: (chId, lvlId) => { levelSelected = { chId, lvlId }; },
    onSwitchTab: (tab) => { tabSwitched = tab; }
  });

  assert.ok(modalOverlay, "Should create modal overlay");
  assert.equal(modalOverlay.className, "knowledge-nexus-modal-overlay");
  assert.equal(modalOverlay.getAttribute("role"), "dialog");
  assert.equal(modalOverlay.getAttribute("aria-label"), "战略数学思维知识全景图鉴与认知跃迁");

  // 验证内部包含模态框本体
  const modal = modalOverlay.children.find((c) => c.className === "knowledge-nexus-modal");
  assert.ok(modal, "Modal container must exist");

  // 验证选项卡存在
  const tabsNav = modal.children.find((c) => c.className === "knowledge-nexus-tabs");
  assert.ok(tabsNav, "Tabs navigation must exist");
  assert.equal(tabsNav.children.length, 2, "Must have 2 tabs: axes and bridges");
});
