(function attachSupplementalMistakeTags(root) {
  const tagPatch = {
    "worst-case": {
      id: "worst-case",
      label: "最坏情况",
      description: "抽屉原理中没有先构造最不容易满足条件的情况。",
      advice: "看到“至少、保证、一定”，先想最坏能放多少，再多 1 就必然发生。"
    },
    "drawer-model": {
      id: "drawer-model",
      label: "抽屉建模",
      description: "没有分清什么是物品、什么是抽屉。",
      advice: "先把颜色、月份、余数、配对等看成抽屉，再把对象放进去。"
    },
    "train-length": {
      id: "train-length",
      label: "车长遗漏",
      description: "火车过桥或过隧道时只看桥长、隧道长，忘记火车本身长度。",
      advice: "完全通过时要让车尾也离开，所以常用车长 + 桥长/隧道长。"
    },
    "relative-speed-choice": {
      id: "relative-speed-choice",
      label: "相对速度选择",
      description: "两车相向、同向追及时混淆速度和与速度差。",
      advice: "相向错车用速度和，同向超过用速度差。"
    },
    "shape-duplicate": {
      id: "shape-duplicate",
      label: "图形重漏",
      description: "图形计数中只数小图形、漏掉组合图形，或重复数同一个图形。",
      advice: "先编号，再按大小、起点终点或边界分层计数。"
    },
    "parity-rule": {
      id: "parity-rule",
      label: "奇偶规则",
      description: "把加法奇偶和乘法奇偶混用，或没有看奇数个数。",
      advice: "加法看奇数的个数；乘法只要有偶数因数，积就是偶数。"
    },
    "divisibility-rule": {
      id: "divisibility-rule",
      label: "整除特征",
      description: "判断 2、3、5、9 的整除时选错规则。",
      advice: "2 和 5 看个位，3 和 9 看数字和。"
    },
    "transfer-tool-choice": {
      id: "transfer-tool-choice",
      label: "工具选择",
      description: "换乘站综合题中没有判断该用枚举、加乘原理、容斥、速度和还是效率和。",
      advice: "先拆题型结构，再选择工具；分类/分步/重叠/相对变化分别处理。"
    }
  };

  const modulePatch = {
    "pigeonhole-principle": ["worst-case", "drawer-model", "missing-cases"],
    "train-bridge": ["train-length", "relative-speed-choice", "motion-relative"],
    "geometry-counting": ["shape-duplicate", "missing-cases", "duplicate-counting"],
    "parity-divisibility": ["parity-rule", "divisibility-rule", "arithmetic-care"],
    "counting-transfer": ["transfer-tool-choice", "add-multiply-confusion", "overlap", "duplicate-counting"],
    "efficiency-transfer": ["transfer-tool-choice", "unit-rate", "motion-relative", "efficiency-sum"]
  };

  const keywordRules = [
    { pattern: /抽屉|至少|保证|一定|最坏|同色|同一个月份|余数相同/, tags: ["worst-case", "drawer-model"] },
    { pattern: /火车|过桥|过隧道|车长|完全通过|错开|超过/, tags: ["train-length", "relative-speed-choice"] },
    { pattern: /数线段|数角|数三角形|数长方形|数正方形|图形计数/, tags: ["shape-duplicate"] },
    { pattern: /奇数|偶数|整除|倍数|个位|数字和/, tags: ["parity-rule", "divisibility-rule"] },
    { pattern: /换乘|综合|限制|不符合|只参加|至少参加/, tags: ["transfer-tool-choice"] }
  ];

  function patchMistakeTags() {
    if (!root.MistakeDiagnosis?.mistakeTagCatalog || !root.MistakeDiagnosis?.moduleMistakeTags) {
      return;
    }
    Object.assign(root.MistakeDiagnosis.mistakeTagCatalog, tagPatch);
    Object.assign(root.MistakeDiagnosis.moduleMistakeTags, modulePatch);

    const originalInfer = root.MistakeDiagnosis.inferTagsFromText;
    if (typeof originalInfer === "function" && !root.MistakeDiagnosis.__supplementalInferPatched) {
      root.MistakeDiagnosis.inferTagsFromText = function inferSupplementalTags(text = "") {
        const inferred = originalInfer(text) || [];
        const extra = [];
        keywordRules.forEach((rule) => {
          if (rule.pattern.test(text)) {
            extra.push(...rule.tags);
          }
        });
        return root.MistakeDiagnosis.normalizeTags([...inferred, ...extra]);
      };
      root.MistakeDiagnosis.__supplementalInferPatched = true;
    }

    if (Array.isArray(root.MATH_LEARNING_DATA) && typeof root.MistakeDiagnosis.applyMistakeTagsToModules === "function") {
      root.MATH_LEARNING_DATA = root.MistakeDiagnosis.applyMistakeTagsToModules(root.MATH_LEARNING_DATA);
    }
  }

  patchMistakeTags();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { keywordRules, modulePatch, patchMistakeTags, tagPatch };
  }

  root.SupplementalMistakeTags = { keywordRules, modulePatch, patchMistakeTags, tagPatch };
})(typeof window !== "undefined" ? window : globalThis);
