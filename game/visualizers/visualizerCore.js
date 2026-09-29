// Question Representation Visualizer
// Parses and renders SVG diagrams, data tables, route maps, and bar models
// for math learning questions according to curriculum contracts.

const SVG_NS = "http://www.w3.org/2000/svg";

function createSvg(width, height, viewBox) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", viewBox || `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.classList.add("question-visual__svg");
  return svg;
}

function parseNumbers(text) {
  const matches = String(text).match(/\d+(\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

function safeAddListener(el, event, handler) {
  if (el && typeof el.addEventListener === "function") {
    el.addEventListener(event, handler);
  }
}

function createControlBtn(text, className, actionLabel) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `question-visual__btn ${className || ""}`.trim();
  btn.textContent = text;
  if (actionLabel) btn.setAttribute("aria-label", actionLabel);
  return btn;
}

function safeClassAdd(el, cls) {
  if (el && el.classList && typeof el.classList.add === "function") {
    el.classList.add(cls);
  }
}

function safeClassRemove(el, cls) {
  if (el && el.classList && typeof el.classList.remove === "function") {
    el.classList.remove(cls);
  }
}

function cleanPrompt(text) {
  if (!text) return "";
  return String(text)
    .replace(/【[^】]+】/g, "")
    .replace(/[一二三四五六七八九1-9]年级[（(]?[一二三四五六1-9]?[）)]?班/g, "")
    .replace(/[一二三四五六七八九1-9]年级/g, "")
    .replace(/[（(][1-9][)）]班/g, "")
    .replace(/(?:\b|\D)[1-9]班/g, "")
    .replace(/\d+号(?:笼子|仓库|箱|车|机器|窗口|车间|门|题|选手)/g, "")
    .replace(/第[一二三四五1-9]步/g, "")
    .replace(/第[一二三四五1-9]个?(?:方案|种)/g, "");
}

function cleanParseNumbers(text) {
  return parseNumbers(cleanPrompt(text));
}

function extractLabeledParams(text, patterns = {}) {
  const result = {};
  const cleaned = cleanPrompt(text);
  for (const [key, regex] of Object.entries(patterns)) {
    const match = cleaned.match(regex) || String(text).match(regex);
    if (match && match[1] !== undefined) {
      result[key] = Number(match[1]);
    }
  }
  return result;
}

function extractSolutionContext(question) {
  if (!question || typeof question !== "object") return {};
  const answer = Number(question.answer);
  const steps = question.solution?.steps || question.solutionReview?.steps || [];
  const numbers = [];
  if (Array.isArray(steps)) {
    for (const step of steps) {
      if (typeof step === "object" && step !== null) {
        if (Number.isFinite(step.result)) numbers.push(Number(step.result));
        if (Array.isArray(step.operands)) {
          for (const op of step.operands) {
            if (Number.isFinite(op)) numbers.push(Number(op));
          }
        }
      }
    }
  }
  return {
    answer: Number.isFinite(answer) ? answer : null,
    stepNumbers: numbers
  };
}

module.exports = {
  SVG_NS,
  createSvg,
  parseNumbers,
  cleanPrompt,
  cleanParseNumbers,
  extractLabeledParams,
  extractSolutionContext,
  safeAddListener,
  createControlBtn,
  safeClassAdd,
  safeClassRemove
};

