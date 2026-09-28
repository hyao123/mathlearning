// Lightweight zero-dependency Web Audio sound engine for retro/pixel math adventure.
// Synthesizes tones directly in-browser using AudioContext (0 KB audio assets).

const STORAGE_KEY = "math-quest-sound-muted";

let audioCtx = null;
let muted = false;

if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
  try {
    muted = window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    muted = false;
  }
}

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function isMuted() {
  return muted;
}

function setMuted(nextMuted) {
  muted = Boolean(nextMuted);
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(muted));
    } catch {}
  }
  return muted;
}

function toggleMute() {
  return setMuted(!muted);
}

function scheduleNote(ctx, { freq, type = "sine", startTime, duration, gain = 0.15 }) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

function triggerHaptic(pattern = 30) {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
}

function playClick() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  scheduleNote(ctx, { freq: 700, type: "triangle", startTime: now, duration: 0.04, gain: 0.1 });
}

function playCorrect() {
  triggerHaptic([25, 20, 35]);
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  // C5 - E5 - G5 - C6 rapid joyful arpeggio
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, index) => {
    scheduleNote(ctx, {
      freq,
      type: "triangle",
      startTime: now + index * 0.07,
      duration: 0.18,
      gain: 0.18
    });
  });
}

function playRetry() {
  triggerHaptic([50]);
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Gentle warm low pulse (E4 -> C4)
  scheduleNote(ctx, { freq: 329.63, type: "sine", startTime: now, duration: 0.12, gain: 0.1 });
  scheduleNote(ctx, { freq: 261.63, type: "sine", startTime: now + 0.1, duration: 0.2, gain: 0.12 });
}

function playStreak() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Brilliant fanfare for streak rewards (C5, G5, C6, E6)
  const notes = [523.25, 783.99, 1046.5, 1318.51];
  notes.forEach((freq, index) => {
    scheduleNote(ctx, {
      freq,
      type: "triangle",
      startTime: now + index * 0.08,
      duration: 0.25,
      gain: 0.2
    });
  });
}

function playCraft() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Metallic resonance chime
  scheduleNote(ctx, { freq: 440, type: "square", startTime: now, duration: 0.06, gain: 0.08 });
  scheduleNote(ctx, { freq: 880, type: "triangle", startTime: now + 0.05, duration: 0.22, gain: 0.18 });
  scheduleNote(ctx, { freq: 1760, type: "sine", startTime: now + 0.1, duration: 0.28, gain: 0.12 });
}

function playLevelClear() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Victory fanfare
  const melody = [
    { freq: 523.25, offset: 0, dur: 0.12 },
    { freq: 659.25, offset: 0.12, dur: 0.12 },
    { freq: 783.99, offset: 0.24, dur: 0.12 },
    { freq: 1046.5, offset: 0.38, dur: 0.35 }
  ];
  melody.forEach(({ freq, offset, dur }) => {
    scheduleNote(ctx, {
      freq,
      type: "triangle",
      startTime: now + offset,
      duration: dur,
      gain: 0.2
    });
  });
}

function playAssemblySnap() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Two-stage mechanical latch and pneumatic lock
  scheduleNote(ctx, { freq: 320, type: "square", startTime: now, duration: 0.04, gain: 0.14 });
  scheduleNote(ctx, { freq: 780, type: "triangle", startTime: now + 0.03, duration: 0.07, gain: 0.22 });
  scheduleNote(ctx, { freq: 1440, type: "sine", startTime: now + 0.05, duration: 0.12, gain: 0.16 });
}

function playLaserCircuit() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  // High-frequency holographic circuit tracing
  const sweep = [980, 1310, 1750, 2620];
  sweep.forEach((freq, idx) => {
    scheduleNote(ctx, {
      freq,
      type: "sine",
      startTime: now + idx * 0.035,
      duration: 0.1,
      gain: 0.12
    });
  });
}

function playSuperProjectIgnition() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Low engine rumble buildup
  scheduleNote(ctx, { freq: 92, type: "sawtooth", startTime: now, duration: 0.5, gain: 0.22 });
  scheduleNote(ctx, { freq: 138, type: "triangle", startTime: now + 0.15, duration: 0.6, gain: 0.25 });
  // Epic ignition fanfare chord (C4, E4, G4, C5, E5)
  const chord = [261.63, 329.63, 392.00, 523.25, 659.25];
  chord.forEach((freq) => {
    scheduleNote(ctx, {
      freq,
      type: "triangle",
      startTime: now + 0.28,
      duration: 0.85,
      gain: 0.18
    });
  });
  scheduleNote(ctx, { freq: 1046.5, type: "sine", startTime: now + 0.35, duration: 1.1, gain: 0.15 });
}

function playAchievementUnlocked() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Triumphant military brass fanfare
  const fanfare = [
    { freq: 349.23, offset: 0, dur: 0.14, gain: 0.2 },       // F4
    { freq: 440.00, offset: 0.1, dur: 0.14, gain: 0.22 },     // A4
    { freq: 523.25, offset: 0.2, dur: 0.16, gain: 0.25 },     // C5
    { freq: 698.46, offset: 0.32, dur: 0.45, gain: 0.3 }      // F5 high climax
  ];
  fanfare.forEach((note) => {
    scheduleNote(ctx, { freq: note.freq, type: "triangle", startTime: now + note.offset, duration: note.dur, gain: note.gain });
    scheduleNote(ctx, { freq: note.freq * 2, type: "sine", startTime: now + note.offset + 0.02, duration: note.dur * 0.8, gain: note.gain * 0.4 });
  });
}

function playQuantumCrateOpen() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Cybernetic opening charge + high-frequency shimmer
  scheduleNote(ctx, { freq: 150, type: "sawtooth", startTime: now, duration: 0.18, gain: 0.15 });
  scheduleNote(ctx, { freq: 300, type: "triangle", startTime: now + 0.08, duration: 0.22, gain: 0.18 });
  const shimmer = [880, 1174.66, 1567.98, 2093.0];
  shimmer.forEach((freq, i) => {
    scheduleNote(ctx, { freq, type: "sine", startTime: now + 0.16 + i * 0.05, duration: 0.35, gain: 0.12 });
  });
}

function playPityFull() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Capacitor full resonance ping
  scheduleNote(ctx, { freq: 440, type: "sine", startTime: now, duration: 0.15, gain: 0.14 });
  scheduleNote(ctx, { freq: 880, type: "triangle", startTime: now + 0.08, duration: 0.25, gain: 0.18 });
  scheduleNote(ctx, { freq: 1760, type: "sine", startTime: now + 0.16, duration: 0.35, gain: 0.15 });
}

const SoundEngine = {
  isMuted,
  setMuted,
  toggleMute,
  playClick,
  playUi: playClick,
  playCorrect,
  playRetry,
  playStreak,
  playCraft,
  playLevelClear,
  playAssemblySnap,
  playLaserCircuit,
  playSuperProjectIgnition,
  playAchievementUnlocked,
  playQuantumCrateOpen,
  playPityFull,
  triggerHaptic
};
module.exports = SoundEngine;

