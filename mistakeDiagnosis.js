(function attachMistakeDiagnosis(root) {
  const mistakeTagCatalog = {
    patternRule: {
      id: "pattern-rule",
      label: "规律识别",
      description: "没有先找稳定变化或重复结构，而是直接猜答案。",
      advice: "先比较相邻变化、位置关系或重复周期，再写出规则。"
    },
    remainderPosition: {
      id: "remainder-position",
      label: "余数定位",
      description: "周期题中没有把余数对应到组内位置，尤其余 0 情况容易错。",
      advice: "先确定周期长度，再用余数定位；余 0 对应每组最后一个。"
    },
    duplicateCounting: {
      id: "duplicate-counting",
      label: "重复计数",
      description: "枚举或集合题中重复计算了同一种情况。",
      advice: "固定顺序列举，遇到重叠部分要判断是否已经算过。"
    },
    missingCases: {
      id: "missing-cases",
      label: "漏情况",
      description: "没有完整分类，导致部分可能情况没有被列出。",
      advice: "按一个稳定标准分类，例如先固定十位、先固定第一人、先固定一种选择。"
    },
    overlap: {
      id: "overlap",
      label: "重叠处理",
      description: "没有正确处理两个集合的交集，把重叠部分多算或少算。",
      advice: "至少一项 = A + B - 重叠；只会一项要把重叠从两边都去掉。"
    },
    sumDiffRelation: {
      id: "sum-diff-relation",
      label: "和差关系",
      description: "没有区分总量、差量和相等份。",
      advice: "先画线段图，把大数、小数、总和和差量放到同一把尺上。"
    },
    unitRate: {
      id: "unit-rate",
      label: "单位量",
      description: "没有先求 1 份、1 人 1 天或 1 台 1 小时的单位量。",
      advice: "先归到单位量，再按题目要求放大或反求。"
    },
    surplusDeficit: {
      id: "surplus-deficit",
      label: "盈亏方向",
      description: "没有分清“多”和“少”的方向，一盈一亏时总差处理错误。",
      advice: "一盈一亏总差相加，两次都盈或都亏比较差额。"
    },
    assumptionGap: {
      id: "assumption-gap",
      label: "假设差量",
      description: "鸡兔同笼或替换类问题中，没有算清每次替换带来的差量。",
      advice: "先统一假设，再用实际差额除以每次替换差量。"
    },
    averageTotal: {
      id: "average-total",
      label: "平均总量",
      description: "把平均数当成中间数，忽略总量重新均分。",
      advice: "先求总量，再按份数平均分。"
    },
    motionRelative: {
      id: "motion-relative",
      label: "相对速度",
      description: "相遇、追及问题中混淆速度和与速度差。",
      advice: "相向而行看速度和，追及问题看速度差。"
    },
    invariant: {
      id: "invariant",
      label: "不变量",
      description: "没有抓住年龄差、总量、面积或结构中的不变量。",
      advice: "先问：什么量一直不变？什么量同时变化？"
    },
    pointInterval: {
      id: "point-interval",
      label: "点与间隔",
      description: "植树、排队、封闭路线中把点数和间隔数混淆。",
      advice: "先求间隔数，再根据两端是否计入判断点数。"
    },
    geometryTransform: {
      id: "geometry-transform",
      label: "图形转化",
      description: "没有先分割、拼合或补全图形，直接套公式。",
      advice: "把复杂图形转成矩形、正方形、三角形等熟悉结构。"
    },
    conditionLogic: {
      id: "condition-logic",
      label: "条件推理",
      description: "逻辑题中没有逐条使用条件，或没有回代验证。",
      advice: "先列可能，再用条件排除，最后把结论回代检查。"
    },
    arithmeticCare: {
      id: "arithmetic-care",
      label: "计算细节",
      description: "模型方向基本正确，但四则运算、单位或最终表达出错。",
      advice: "列式后检查单位、运算顺序和题目问的是哪个量。"
    }
  };

  const moduleMistakeTags = {
    patterns: ["pattern-rule", "arithmetic-care"],
    periodicity: ["remainder-position", "pattern-rule"],
    enumeration: ["missing-cases", "duplicate-counting"],
    "inclusion-exclusion": ["overlap", "duplicate-counting"],
    "sum-diff": ["sum-diff-relation", "arithmetic-care"],
    "unit-rate": ["unit-rate", "arithmetic-care"],
    "surplus-deficit": ["surplus-deficit", "sum-diff-relation"],
    "chicken-rabbit": ["assumption-gap", "sum-diff-relation"],
    average: ["average-total", "unit-rate"],
    motion: ["motion-relative", "unit-rate"],
    age: ["invariant", "sum-diff-relation"],
    "tree-planting": ["point-interval", "remainder-position"],
    geometry: ["geometry-transform", "invariant"],
    logic: ["condition-logic", "missing-cases"]
  };

  const keywordRules = [
    { pattern: /余|周期|循环|第\s*\d+|星期/, tags: ["remainder-position"] },
    { pattern: /两端|间隔|封闭|植树|路灯|每隔/, tags: ["point-interval"] },
    { pattern: /平均|均分|总量/, tags: ["average-total"] },
    { pattern: /相遇|追及|速度|路程|时间/, tags: ["motion-relative"] },
    { pattern: /重叠|至少|都喜欢|都参加|两项/, tags: ["overlap"] },
    { pattern: /鸡|兔|头|腿|假设|三轮|自行车/, tags: ["assumption-gap"] },
    { pattern: /多\s*\d+|少\s*\d+|盈|亏|刚好/, tags: ["surplus-deficit"] },
    { pattern: /几种|多少种|排列|搭配|选法|握手/, tags: ["missing-cases", "duplicate-counting"] },
    { pattern: /年龄|岁|几年后|几年前/, tags: ["invariant"] },
    { pattern: /面积|周长|图形|长方形|正方形|三角形/, tags: ["geometry-transform"] }
  ];

  function unique(values = []) {
    return [...new Set(values.filter(Boolean))];
  }

  function normalizeTagId(tag) {
    if (!tag) {
      return null;
    }
    if (mistakeTagCatalog[tag]) {
      return tag;
    }
    const match = Object.values(mistakeTagCatalog).find((item) => item.id === tag || item.label === tag);
    return match?.id || null;
  }

  function normalizeTags(tags = []) {
    return unique(tags.map(normalizeTagId)).filter((tag) => mistakeTagCatalog[tag]);
  }

  function inferTagsFromText(text = "") {
    const tags = [];
    keywordRules.forEach((rule) => {
      if (rule.pattern.test(text)) {
        tags.push(...rule.tags);
      }
    });
    return normalizeTags(tags);
  }

  function getModuleForPractice(practice = {}, modules = root.MATH_LEARNING_DATA || []) {
    if (practice.moduleId) {
      return modules.find((module) => module.id === practice.moduleId) || null;
    }
    return modules.find((module) => (module.practices || []).some((item) => item.id === practice.id)) || null;
  }

  function getTagsForPractice(practice = {}, module = null) {
    const explicit = normalizeTags(practice.mistakeTags || []);
    if (explicit.length > 0) {
      return explicit;
    }
    const moduleTags = normalizeTags(moduleMistakeTags[module?.id] || moduleMistakeTags[practice.moduleId] || []);
    const textTags = inferTagsFromText(`${practice.title || ""} ${practice.prompt || ""} ${(practice.commonMistakes || []).join(" ")}`);
    const merged = unique([...textTags, ...moduleTags]);
    return merged.length > 0 ? merged.slice(0, 3) : ["arithmetic-care"];
  }

  function applyMistakeTagsToModules(modules = []) {
    return modules.map((module) => ({
      ...module,
      practices: (module.practices || []).map((practice) => ({
        ...practice,
        mistakeTags: getTagsForPractice(practice, module)
      }))
    }));
  }

  function findPracticeByWrongItem(item = {}, modules = root.MATH_LEARNING_DATA || []) {
    for (const module of modules) {
      const practice = (module.practices || []).find((candidate) => candidate.id === item.id);
      if (practice) {
        return { practice, module };
      }
    }
    return { practice: item, module: getModuleForPractice(item, modules) };
  }

  function getTagsForWrongItem(item = {}, modules = root.MATH_LEARNING_DATA || []) {
    const explicit = normalizeTags(item.mistakeTags || []);
    if (explicit.length > 0) {
      return explicit;
    }
    const { practice, module } = findPracticeByWrongItem(item, modules);
    return getTagsForPractice({ ...practice, moduleId: item.moduleId || module?.id }, module);
  }

  function getTagInfo(tagId) {
    const normalized = normalizeTagId(tagId);
    return normalized ? mistakeTagCatalog[normalized] : null;
  }

  function getTagLabel(tagId) {
    return getTagInfo(tagId)?.label || tagId;
  }

  function summarizeWrongBook(wrongBook = [], modules = root.MATH_LEARNING_DATA || []) {
    const groups = new Map();
    wrongBook.forEach((item) => {
      const tags = getTagsForWrongItem(item, modules);
      tags.forEach((tagId) => {
        const info = getTagInfo(tagId);
        if (!info) {
          return;
        }
        if (!groups.has(tagId)) {
          groups.set(tagId, { ...info, count: 0, items: [] });
        }
        const group = groups.get(tagId);
        group.count += 1;
        group.items.push(item);
      });
    });
    return [...groups.values()].sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "zh-CN"));
  }

  function getPrimaryDiagnosis(wrongBook = [], modules = root.MATH_LEARNING_DATA || []) {
    return summarizeWrongBook(wrongBook, modules)[0] || null;
  }

  const api = {
    applyMistakeTagsToModules,
    findPracticeByWrongItem,
    getModuleForPractice,
    getPrimaryDiagnosis,
    getTagInfo,
    getTagLabel,
    getTagsForPractice,
    getTagsForWrongItem,
    inferTagsFromText,
    mistakeTagCatalog,
    moduleMistakeTags,
    normalizeTags,
    summarizeWrongBook
  };

  if (Array.isArray(root.MATH_LEARNING_DATA)) {
    root.MATH_LEARNING_DATA = applyMistakeTagsToModules(root.MATH_LEARNING_DATA);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MistakeDiagnosis = api;
})(typeof window !== "undefined" ? window : globalThis);
