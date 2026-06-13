(function attachSupplementalContentFixes(root) {
  function fixEfficiencyTransferAnswer() {
    const modules = Array.isArray(root.MATH_LEARNING_DATA) ? root.MATH_LEARNING_DATA : [];
    const module = modules.find((item) => item.id === "efficiency-transfer");
    const practice = module?.practices?.find((item) => item.id === "efficiency-transfer-6");
    if (!practice) {
      return;
    }
    practice.answer = "15/7";
    practice.acceptedAnswers = ["15/7", "2又1/7", "2 1/7", "二又七分之一", "约2.14"];
    practice.explanation = "相遇时间是 360÷(70+50)=3 小时。相遇点到乙出发地还有乙已走过的 50×3=150 千米，甲继续走需要 150÷70=15/7 小时。";
  }

  fixEfficiencyTransferAnswer();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { fixEfficiencyTransferAnswer };
  }

  root.SupplementalContentFixes = { fixEfficiencyTransferAnswer };
})(typeof window !== "undefined" ? window : globalThis);
