// Lightweight zero-dependency Canvas Particle & 3D Tilt FX for Super Project Assembly
// Optimized for 60fps performance and zero memory leaks.

function triggerAssemblyShockwave(canvas, options = {}) {
  if (!canvas || !canvas.getContext) return { stop: () => {} };
  const ctx = canvas.getContext("2d");
  if (!ctx) return { stop: () => {} };

  const width = canvas.width = canvas.offsetWidth || 400;
  const height = canvas.height = canvas.offsetHeight || 400;
  const cx = width / 2;
  const cy = height / 2;

  const themeColors = options.colors || ["#f5d06f", "#8ce7ff", "#ffffff", "#ff8a45"];
  const particleCount = options.count || 55;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
    const speed = 2.5 + Math.random() * 6.5;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3.5,
      color: themeColors[Math.floor(Math.random() * themeColors.length)],
      alpha: 1,
      decay: 0.016 + Math.random() * 0.022,
      drag: 0.94 + Math.random() * 0.03
    });
  }

  let shockwaveRadius = 10;
  let shockwaveAlpha = 0.95;
  let shockwave2Radius = 5;
  let shockwave2Alpha = 0.8;
  let animId = null;
  let running = true;

  function renderFrame() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    // Expand primary shockwave ring
    if (shockwaveAlpha > 0.01) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, shockwaveRadius, 0, Math.PI * 2);
      ctx.lineWidth = 3.5 * (shockwaveAlpha);
      ctx.strokeStyle = themeColors[0];
      ctx.globalAlpha = shockwaveAlpha;
      ctx.stroke();
      ctx.restore();

      shockwaveRadius += 6.8;
      shockwaveAlpha *= 0.93;
    }

    // Secondary delayed shockwave ring
    if (shockwave2Alpha > 0.01 && shockwaveRadius > 45) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, shockwave2Radius, 0, Math.PI * 2);
      ctx.lineWidth = 2.5 * (shockwave2Alpha);
      ctx.strokeStyle = themeColors[1] || themeColors[0];
      ctx.globalAlpha = shockwave2Alpha;
      ctx.stroke();
      ctx.restore();

      shockwave2Radius += 8.2;
      shockwave2Alpha *= 0.92;
    }

    // Render & update sparks
    let activeParticles = 0;
    particles.forEach((p) => {
      if (p.alpha <= 0.02) return;
      activeParticles++;

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.alpha -= p.decay;
    });

    if (activeParticles > 0 || shockwaveAlpha > 0.01 || shockwave2Alpha > 0.01) {
      animId = requestAnimationFrame(renderFrame);
    } else {
      running = false;
      ctx.clearRect(0, 0, width, height);
    }
  }

  animId = requestAnimationFrame(renderFrame);

  return {
    stop: () => {
      running = false;
      if (animId) cancelAnimationFrame(animId);
      ctx.clearRect(0, 0, width, height);
    }
  };
}

function bindCardTilt(element) {
  if (!element) return () => {};

  let isHovered = false;

  function onMouseMove(e) {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -11; // Up/down tilt
    const rotateY = ((x - centerX) / centerX) * 11;  // Left/right tilt

    const sheenX = Math.round((x / rect.width) * 100);
    const sheenY = Math.round((y / rect.height) * 100);

    element.style.setProperty("--sheen-x", `${sheenX}%`);
    element.style.setProperty("--sheen-y", `${sheenY}%`);
    element.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) scale3d(1.02, 1.02, 1.02)`;
  }

  function onMouseEnter() {
    isHovered = true;
    element.style.transition = "transform 0.1s ease-out, box-shadow 0.2s ease-out";
  }

  function onMouseLeave() {
    isHovered = false;
    element.style.transition = "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease";
    element.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    element.style.setProperty("--sheen-x", "50%");
    element.style.setProperty("--sheen-y", "50%");
  }

  element.addEventListener("mouseenter", onMouseEnter);
  element.addEventListener("mousemove", onMouseMove);
  element.addEventListener("mouseleave", onMouseLeave);

  return () => {
    element.removeEventListener("mouseenter", onMouseEnter);
    element.removeEventListener("mousemove", onMouseMove);
    element.removeEventListener("mouseleave", onMouseLeave);
  };
}

const AssemblyFX = {
  triggerAssemblyShockwave,
  bindCardTilt
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = AssemblyFX;
}
if (typeof globalThis !== "undefined") {
  globalThis.AssemblyFX = AssemblyFX;
}
