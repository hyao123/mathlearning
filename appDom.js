(function (root) {
  function clear(element) {
    element.innerHTML = "";
  }

  function setChildrenText(element, values, className) {
    clear(element);
    values.forEach((value) => {
      const span = document.createElement("span");
      span.className = className;
      span.textContent = value;
      element.appendChild(span);
    });
  }

  function renderEmptyBox(container, text) {
    clear(container);
    const box = document.createElement("div");
    box.className = "empty-state-box";
    box.textContent = text;
    container.appendChild(box);
  }

  const api = {
    clear,
    renderEmptyBox,
    setChildrenText
  };

  root.AppDom = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
