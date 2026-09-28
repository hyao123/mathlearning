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

/**
 * Renders an interactive or visual Route Map / Grid Diagram
 */

module.exports = {
  SVG_NS,
  createSvg,
  parseNumbers,
  safeAddListener,
  createControlBtn,
  safeClassAdd,
  safeClassRemove
};
