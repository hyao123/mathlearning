// Virtual Scratchpad Canvas for Knowledge Quest
// High-DPI interactive handwriting and diagram scratchpad for math thinking

export function createScratchpad({ onToggle } = {}) {
  const container = document.createElement("aside");
  container.className = "quest-scratchpad quest-scratchpad--collapsed";
  container.dataset.scratchpadDrawer = "";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "quest-scratchpad__toggle-btn pixel-button";
  toggleBtn.dataset.toggleScratchpad = "";
  toggleBtn.innerHTML = `<span class="scratchpad-icon">📝</span> <span class="scratchpad-label">草稿纸</span>`;
  toggleBtn.title = "打开/收起奥数演算草稿纸 (快捷键 D)";

  const panel = document.createElement("div");
  panel.className = "quest-scratchpad__panel";

  const toolbar = document.createElement("div");
  toolbar.className = "quest-scratchpad__toolbar";

  // Tool buttons
  const titleSpan = document.createElement("span");
  titleSpan.className = "quest-scratchpad__title";
  titleSpan.textContent = "📝 奥数演算草稿";

  const toolGroup = document.createElement("div");
  toolGroup.className = "quest-scratchpad__tools";

  const penBtn = document.createElement("button");
  penBtn.type = "button";
  penBtn.className = "scratchpad-tool-btn is-active";
  penBtn.dataset.scratchpadTool = "pen";
  penBtn.textContent = "✏️ 铅笔";
  penBtn.title = "铅笔画线";

  const eraserBtn = document.createElement("button");
  eraserBtn.type = "button";
  eraserBtn.className = "scratchpad-tool-btn";
  eraserBtn.dataset.scratchpadTool = "eraser";
  eraserBtn.textContent = "🧽 橡皮";
  eraserBtn.title = "橡皮擦除";

  const undoBtn = document.createElement("button");
  undoBtn.type = "button";
  undoBtn.className = "scratchpad-tool-btn";
  undoBtn.dataset.scratchpadAction = "undo";
  undoBtn.textContent = "↩️ 撤销";
  undoBtn.title = "撤销上一笔";

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "scratchpad-tool-btn";
  clearBtn.dataset.scratchpadAction = "clear";
  clearBtn.textContent = "🧹 清空";
  clearBtn.title = "清空当前草稿";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "scratchpad-tool-btn scratchpad-tool-btn--close";
  closeBtn.dataset.scratchpadAction = "close";
  closeBtn.textContent = "✕";
  closeBtn.title = "收起草稿纸";

  toolGroup.append(penBtn, eraserBtn, undoBtn, clearBtn, closeBtn);

  // Color & Size palette
  const optionsGroup = document.createElement("div");
  optionsGroup.className = "quest-scratchpad__options";

  const colors = [
    { label: "白", val: "#f8fafc" },
    { label: "青", val: "#38bdf8" },
    { label: "黄", val: "#facc15" },
    { label: "红", val: "#f87171" }
  ];

  const colorGroup = document.createElement("div");
  colorGroup.className = "scratchpad-colors";
  colors.forEach(({ label, val }, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `scratchpad-color-dot ${i === 0 ? "is-selected" : ""}`;
    dot.dataset.scratchpadColor = val;
    dot.style.backgroundColor = val;
    dot.title = `颜色：${label}`;
    colorGroup.append(dot);
  });

  const sizes = [
    { label: "细", val: 2 },
    { label: "中", val: 4 },
    { label: "粗", val: 8 }
  ];
  const sizeGroup = document.createElement("div");
  sizeGroup.className = "scratchpad-sizes";
  sizes.forEach(({ label, val }, i) => {
    const sBtn = document.createElement("button");
    sBtn.type = "button";
    sBtn.className = `scratchpad-size-btn ${i === 1 ? "is-selected" : ""}`;
    sBtn.dataset.scratchpadSize = String(val);
    sBtn.textContent = label;
    sizeGroup.append(sBtn);
  });

  optionsGroup.append(colorGroup, sizeGroup);
  toolbar.append(titleSpan, toolGroup, optionsGroup);

  const canvasWrapper = document.createElement("div");
  canvasWrapper.className = "quest-scratchpad__canvas-wrapper";

  const canvas = document.createElement("canvas");
  canvas.className = "quest-scratchpad__canvas";
  canvasWrapper.append(canvas);

  panel.append(toolbar, canvasWrapper);
  container.append(toggleBtn, panel);

  // Scratchpad State
  let isExpanded = false;
  let currentTool = "pen"; // "pen" | "eraser"
  let currentColor = "#f8fafc";
  let currentLineWidth = 4;
  let isDrawing = false;
  let currentStroke = null;
  const strokes = []; // Array of { tool, color, width, points: [{x, y}] }

  function resizeCanvas() {
    const rect = canvasWrapper.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    redraw();
  }

  function redraw() {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = stroke.width;

      if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = stroke.color;
      }

      const pts = stroke.points;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i += 1) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function getCanvasCoords(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function handlePointerDown(e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    canvas.setPointerCapture?.(e.pointerId);
    isDrawing = true;
    const pt = getCanvasCoords(e);
    currentStroke = {
      tool: currentTool,
      color: currentColor,
      width: currentLineWidth,
      points: [pt]
    };
    strokes.push(currentStroke);
  }

  function handlePointerMove(e) {
    if (!isDrawing || !currentStroke) return;
    const pt = getCanvasCoords(e);
    currentStroke.points.push(pt);

    // Progressive direct draw to avoid full redraw during active stroke
    const ctx = canvas.getContext("2d");
    if (ctx && currentStroke.points.length >= 2) {
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = currentStroke.width;

      if (currentStroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = currentStroke.color;
      }

      const len = currentStroke.points.length;
      ctx.moveTo(currentStroke.points[len - 2].x, currentStroke.points[len - 2].y);
      ctx.lineTo(currentStroke.points[len - 1].x, currentStroke.points[len - 1].y);
      ctx.stroke();
      ctx.restore();
    }
  }

  function handlePointerUp(e) {
    if (!isDrawing) return;
    isDrawing = false;
    currentStroke = null;
    canvas.releasePointerCapture?.(e.pointerId);
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);

  // Toggle button & events
  function toggle(forced) {
    isExpanded = typeof forced === "boolean" ? forced : !isExpanded;
    if (isExpanded) {
      container.classList.remove("quest-scratchpad--collapsed");
      container.classList.add("quest-scratchpad--expanded");
      setTimeout(resizeCanvas, 50);
    } else {
      container.classList.remove("quest-scratchpad--expanded");
      container.classList.add("quest-scratchpad--collapsed");
    }
    onToggle?.(isExpanded);
  }

  toggleBtn.addEventListener("click", () => toggle());
  closeBtn.addEventListener("click", () => toggle(false));

  penBtn.addEventListener("click", () => {
    currentTool = "pen";
    penBtn.classList.add("is-active");
    eraserBtn.classList.remove("is-active");
  });

  eraserBtn.addEventListener("click", () => {
    currentTool = "eraser";
    eraserBtn.classList.add("is-active");
    penBtn.classList.remove("is-active");
  });

  undoBtn.addEventListener("click", () => {
    if (strokes.length > 0) {
      strokes.pop();
      redraw();
    }
  });

  clearBtn.addEventListener("click", () => {
    strokes.length = 0;
    redraw();
  });

  colorGroup.addEventListener("click", (e) => {
    const dot = e.target.closest("[data-scratchpad-color]");
    if (!dot) return;
    currentColor = dot.dataset.scratchpadColor;
    colorGroup.querySelectorAll(".scratchpad-color-dot").forEach((d) => d.classList.remove("is-selected"));
    dot.classList.add("is-selected");
    if (currentTool === "eraser") penBtn.click();
  });

  sizeGroup.addEventListener("click", (e) => {
    const sBtn = e.target.closest("[data-scratchpad-size]");
    if (!sBtn) return;
    currentLineWidth = parseInt(sBtn.dataset.scratchpadSize, 10) || 4;
    sizeGroup.querySelectorAll(".scratchpad-size-btn").forEach((b) => b.classList.remove("is-selected"));
    sBtn.classList.add("is-selected");
  });

  const handleResize = () => {
    if (isExpanded) resizeCanvas();
  };
  window.addEventListener("resize", handleResize);

  return {
    element: container,
    toggle,
    open: () => toggle(true),
    close: () => toggle(false),
    isExpanded: () => isExpanded,
    clear: () => {
      strokes.length = 0;
      redraw();
    },
    destroy: () => {
      window.removeEventListener("resize", handleResize);
      container.remove();
    }
  };
}
