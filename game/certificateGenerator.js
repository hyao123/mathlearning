// Certificate Generator for Knowledge Quest Super Projects
// Dynamically renders a high-resolution honor certificate onto an HTML5 Canvas.

export function generateProjectCertificate({ project, chapter, campaign, state }) {
  const canvas = document.createElement("canvas");
  const width = 1200;
  const height = 800;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Background - Deep space military dark blue gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#081026");
  bgGrad.addColorStop(0.5, "#0d1b3e");
  bgGrad.addColorStop(1, "#050b1a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. High-tech coordinate grid pattern
  ctx.strokeStyle = "rgba(56, 189, 248, 0.04)";
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. Luxurious double gold border
  ctx.save();
  ctx.strokeStyle = "#eab308";
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.strokeStyle = "rgba(234, 179, 8, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(46, 46, width - 92, height - 92);

  // Corner tech crosshairs
  const drawCorner = (cx, cy) => {
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy);
    ctx.lineTo(cx + 16, cy);
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx, cy + 16);
    ctx.stroke();
  };
  drawCorner(36, 36);
  drawCorner(width - 36, 36);
  drawCorner(36, height - 36);
  drawCorner(width - 36, height - 36);
  ctx.restore();

  // 4. Header: Issuing Authority
  ctx.textAlign = "center";
  ctx.font = "bold 16px 'Courier New', monospace, sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.letterSpacing = "6px";
  ctx.fillText("NATIONAL DEFENSE & AEROSPACE SCIENCE · ENGINEERING COUNCIL", width / 2, 90);

  ctx.font = "15px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("国家国防与前沿科技重大战略工程 · 卓越工程师勋章委员会", width / 2, 118);

  // 5. Main Title: 特级总装工程荣誉证书
  ctx.font = "bold 44px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  const titleGrad = ctx.createLinearGradient(width / 2 - 250, 0, width / 2 + 250, 0);
  titleGrad.addColorStop(0, "#fef08a");
  titleGrad.addColorStop(0.5, "#eab308");
  titleGrad.addColorStop(1, "#f59e0b");
  ctx.fillStyle = titleGrad;
  ctx.fillText("大国重器 · 特级总装工程师结项证书", width / 2, 176);

  // 6. Subtitle / Honor Project
  const projectName = project?.name || chapter?.title || "国家重大科技工程";
  ctx.font = "bold 26px sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(`【 ${projectName} 】战略任务圆满交付`, width / 2, 226);

  // Divider Line with diamond center
  ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 280, 246);
  ctx.lineTo(width / 2 + 280, 246);
  ctx.stroke();

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(width / 2, 246, 5, 0, Math.PI * 2);
  ctx.fill();

  // 7. Citation Body
  ctx.font = "18px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#e2e8f0";
  const leadP1 = "兹证明 小奥数领航员 在《知识远征》国家重点战略工程中，";
  const leadP2 = "连续突破 12 项重难点数学思维关隘，成功掌握核心几何拓扑、模型还原与数论推演算法，";
  const leadP3 = "圆满完成大国重器全部 29 个关键构件的高精度锻造与总装测试，性能指标全线达标！";
  const leadP4 = "特授予：特级总装总工程师荣誉称号 及 大国重器终身领航勋章！";

  ctx.fillText(leadP1, width / 2, 295);
  ctx.fillText(leadP2, width / 2, 330);
  ctx.fillText(leadP3, width / 2, 365);

  ctx.font = "bold 20px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#facc15";
  ctx.fillText(leadP4, width / 2, 415);

  // 8. Operational Metrics Box
  const boxX = 140;
  const boxY = 460;
  const boxW = width - 280;
  const boxH = 130;

  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Metrics items
  const metrics = [
    { label: "攻坚战果", val: "12 / 12 关", sub: "全战区满星通关" },
    { label: "战略构件", val: "29 件完备", sub: "100% 结构总装" },
    { label: "逻辑思维", val: "SS 级 卓越", sub: "数形结合高阶推导" },
    { label: "工程认证", val: "战略入列", sub: "正式编入国家重器序列" }
  ];

  const colW = boxW / metrics.length;
  metrics.forEach((m, idx) => {
    const cx = boxX + colW * idx + colW / 2;
    ctx.textAlign = "center";
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(m.label, cx, boxY + 32);

    ctx.font = "bold 22px 'PingFang SC', sans-serif";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(m.val, cx, boxY + 68);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(m.sub, cx, boxY + 98);

    if (idx < metrics.length - 1) {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
      ctx.beginPath();
      ctx.moveTo(boxX + colW * (idx + 1), boxY + 20);
      ctx.lineTo(boxX + colW * (idx + 1), boxY + boxH - 20);
      ctx.stroke();
    }
  });

  // 9. Red Wax Seal Stamp
  const stampX = width - 220;
  const stampY = height - 140;
  const stampRadius = 55;

  ctx.save();
  ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(stampX, stampY, stampRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(stampX, stampY, stampRadius - 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
  ctx.font = "bold 13px 'PingFang SC', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("国家重器总装局", stampX, stampY - 14);
  ctx.font = "bold 18px 'PingFang SC', sans-serif";
  ctx.fillText("★ 认证 ★", stampX, stampY + 8);
  ctx.font = "bold 12px 'PingFang SC', sans-serif";
  ctx.fillText("特级工程专用章", stampX, stampY + 28);
  ctx.restore();

  // 10. Footer Security Code & Timestamp
  const certId = `CERT-KQ-${chapter?.chapterId?.toUpperCase() || "GLOBAL"}-${Date.now().toString(36).toUpperCase()}`;
  ctx.textAlign = "left";
  ctx.font = "13px 'Courier New', monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText(`防伪编号: ${certId}`, 70, height - 75);

  const dateStr = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
  ctx.fillText(`签署入列日期: ${dateStr}`, 70, height - 52);

  return canvas;
}

export function openCertificateModal(canvas, projectTitle = "大国重器") {
  if (!canvas) return;
  const overlay = document.createElement("div");
  overlay.className = "certificate-modal-overlay";
  overlay.dataset.certificateModalOverlay = "";

  const modal = document.createElement("div");
  modal.className = "certificate-modal";
  modal.dataset.certificateModal = "";

  const header = document.createElement("div");
  header.className = "certificate-modal__header";
  header.innerHTML = `
    <h2>📜 大国重器 · 特级总装工程师结项证书</h2>
    <button type="button" class="pixel-button pixel-button--quiet certificate-modal__close-btn" data-close-certificate="">✕ 关闭</button>
  `;

  const body = document.createElement("div");
  body.className = "certificate-modal__body";

  const img = document.createElement("img");
  img.className = "certificate-modal__image";
  img.src = canvas.toDataURL("image/png");
  img.alt = `${projectTitle} 特级总装工程师证书`;
  body.append(img);

  const footer = document.createElement("div");
  footer.className = "certificate-modal__footer";
  const downloadBtn = document.createElement("a");
  downloadBtn.className = "pixel-button pixel-button--primary certificate-modal__download-btn";
  downloadBtn.href = img.src;
  downloadBtn.download = `${projectTitle}-特级总装工程师荣誉证书.png`;
  downloadBtn.textContent = "💾 保存证书海报图片 (PNG)";
  footer.append(downloadBtn);

  modal.append(header, body, footer);
  overlay.append(modal);

  const closeHandler = (e) => {
    if (e.target === overlay || e.target.closest("[data-close-certificate]")) {
      overlay.remove();
      window.removeEventListener("keydown", escHandler);
    }
  };
  const escHandler = (e) => {
    if (e.key === "Escape") {
      overlay.remove();
      window.removeEventListener("keydown", escHandler);
    }
  };

  overlay.addEventListener("click", closeHandler);
  window.addEventListener("keydown", escHandler);
  document.body.append(overlay);
}
