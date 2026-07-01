(function (root) {
  const initializers = [];
  let booted = false;

  function onReady(initializer) {
    if (typeof initializer !== "function") {
      return;
    }
    if (booted || document.readyState !== "loading") {
      initializer();
      return;
    }
    initializers.push(initializer);
  }

  function boot() {
    if (booted) {
      return;
    }
    booted = true;
    while (initializers.length > 0) {
      initializers.shift()();
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
      boot();
    }
  }

  const api = { boot, onReady };
  root.AppBoot = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
