(function (root) {
  function matchesDifficulty(item, activeDifficulty) {
    return activeDifficulty === "全部" || item.difficulty === activeDifficulty;
  }

  function getModuleExamples(module, activeDifficulty) {
    return (module.examples || []).filter((example) => matchesDifficulty(example, activeDifficulty));
  }

  function getModulePractices(module, activeDifficulty) {
    return (module.practices || []).filter((practice) => matchesDifficulty(practice, activeDifficulty));
  }

  function getVisibleModules(modules = [], activeGrade = "全部", activeDifficulty = "全部") {
    const gradeMatchedModules = activeGrade === "全部" ? modules : modules.filter((module) => module.grades.includes(activeGrade));
    return gradeMatchedModules.filter((module) => getModuleExamples(module, activeDifficulty).length > 0 || getModulePractices(module, activeDifficulty).length > 0);
  }

  function getPracticePool(modules = [], activeGrade = "全部", activeDifficulty = "全部") {
    return getVisibleModules(modules, activeGrade, activeDifficulty).flatMap((module) =>
      getModulePractices(module, activeDifficulty).map((practice) => ({ ...practice, moduleId: module.id, moduleTitle: module.title, grades: module.grades }))
    );
  }

  function getModuleCompletedCount(module, completed = {}, visiblePractices = null) {
    const practiceIds = (visiblePractices || module?.practices || []).map((practice) => practice.id);
    return Object.entries(completed || {}).filter(([id, value]) => value && practiceIds.includes(id)).length;
  }

  function getTotalPracticeCount(modules = []) {
    return modules.reduce((sum, module) => sum + (module.practices || []).length, 0);
  }

  function getCorrectRate(stats = {}) {
    if (!stats.attempts) {
      return "0%";
    }
    return `${Math.round((Number(stats.correct || 0) / Number(stats.attempts || 0)) * 100)}%`;
  }

  function getPrimaryGrade(module, gradeOptions = []) {
    return module.grades?.find((grade) => gradeOptions.includes(grade)) || module.grades?.[0] || "其他";
  }

  function groupModulesByPrimaryGrade(modules = [], activeGrade = "全部", gradeOptions = []) {
    return modules.reduce((groups, module) => {
      const grade = activeGrade === "全部" ? getPrimaryGrade(module, gradeOptions) : activeGrade;
      if (!groups.has(grade)) {
        groups.set(grade, []);
      }
      groups.get(grade).push(module);
      return groups;
    }, new Map());
  }

  const api = {
    getCorrectRate,
    getModuleCompletedCount,
    getModuleExamples,
    getModulePractices,
    getPracticePool,
    getPrimaryGrade,
    getTotalPracticeCount,
    getVisibleModules,
    groupModulesByPrimaryGrade,
    matchesDifficulty
  };

  root.AppSelectors = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
