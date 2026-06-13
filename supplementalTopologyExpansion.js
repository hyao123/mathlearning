(function attachSupplementalTopologyExpansion(root) {
  const topologyPatch = {
    "pigeonhole-principle": {
      strand: "计数与集合",
      stage: "保证至少",
      order: 80,
      prerequisiteIds: ["enumeration", "add-multiply-principle"],
      nextIds: ["counting-transfer", "logic"],
      whyNow: "抽屉原理把计数从“数有多少种”推进到“证明一定发生”，训练最坏情况思维。",
      continuity: "抽屉思想会迁移到余数、配对、颜色、生日和不可能性判断。"
    },
    "counting-transfer": {
      strand: "计数与集合",
      stage: "计数换乘",
      order: 90,
      prerequisiteIds: ["enumeration", "add-multiply-principle", "inclusion-exclusion", "pigeonhole-principle"],
      nextIds: ["logic", "geometry-counting"],
      whyNow: "计数换乘站把枚举、加乘原理、容斥和限制条件放在一起，训练综合选择工具的能力。",
      continuity: "能处理重漏、限制和重叠后，孩子可以进入图形计数、逻辑推理和组合综合题。"
    },
    "train-bridge": {
      strand: "变化与效率",
      stage: "长度参与运动",
      order: 145,
      prerequisiteIds: ["motion"],
      nextIds: ["efficiency-transfer", "logic"],
      whyNow: "火车过桥把行程问题中的“点运动”升级为“有长度物体运动”，强化相对速度和完全通过。",
      continuity: "车长、桥长和相对速度会继续连接追及、相遇和复杂行程题。"
    },
    "efficiency-transfer": {
      strand: "变化与效率",
      stage: "效率换乘",
      order: 150,
      prerequisiteIds: ["unit-rate", "motion", "engineering"],
      nextIds: ["logic"],
      whyNow: "效率换乘站把单位量、速度和工作效率统一成“每单位时间变化多少”。",
      continuity: "掌握效率统一模型后，孩子能处理工程、行程、追及和合作类综合题。"
    },
    "geometry-counting": {
      strand: "空间与离散结构",
      stage: "空间枚举",
      order: 180,
      prerequisiteIds: ["geometry", "enumeration", "counting-transfer"],
      nextIds: ["logic"],
      whyNow: "图形计数把几何结构和有序枚举结合起来，训练空间中的不重不漏。",
      continuity: "编号、分层和边界选择会迁移到长方形计数、三角形计数和组合图形问题。"
    },
    "parity-divisibility": {
      strand: "逻辑推理",
      stage: "数论判断",
      order: 190,
      prerequisiteIds: ["patterns", "pigeonhole-principle"],
      nextIds: ["logic"],
      whyNow: "奇偶性与整除让孩子不用完整计算也能判断结构，是数论和不可能性证明的入口。",
      continuity: "奇偶、整除和余数会继续支撑抽屉、周期、博弈和逻辑证明。"
    }
  };

  const strandModulePatch = {
    "计数与集合": ["enumeration", "add-multiply-principle", "inclusion-exclusion", "pigeonhole-principle", "counting-transfer"],
    "变化与效率": ["average", "motion", "engineering", "train-bridge", "efficiency-transfer"],
    "空间与离散结构": ["tree-planting", "geometry", "geometry-counting"],
    "逻辑推理": ["parity-divisibility", "logic"]
  };

  function patchTopology() {
    if (!root.KnowledgeTopology?.knowledgeTopologyByModule) {
      return;
    }
    Object.assign(root.KnowledgeTopology.knowledgeTopologyByModule, topologyPatch);
    (root.KnowledgeTopology.learningStrands || []).forEach((strand) => {
      const patchedModules = strandModulePatch[strand.title];
      if (patchedModules) {
        strand.moduleIds = patchedModules;
      }
    });
    if (Array.isArray(root.MATH_LEARNING_DATA) && typeof root.KnowledgeTopology.applyKnowledgeTopology === "function") {
      root.MATH_LEARNING_DATA = root.KnowledgeTopology.applyKnowledgeTopology(root.MATH_LEARNING_DATA);
    }
  }

  patchTopology();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { patchTopology, strandModulePatch, topologyPatch };
  }

  root.SupplementalTopologyExpansion = { patchTopology, strandModulePatch, topologyPatch };
})(typeof window !== "undefined" ? window : globalThis);
