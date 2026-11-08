// Synthesised sound (Web Audio) – no recorded or copyrighted audio.
// The AudioContext is created only on the first user interaction.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let bgmTimer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<(m: boolean) => void>();

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.6;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.3) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(start: number, dur: number, vol = 0.15) {
  const c = ac();
  if (!c || !master) return;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 900;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start(c.currentTime + start);
}

// Vietnamese pentatonic (ngũ cung) – Do Re Fa Sol La
const PENTA = [261.6, 293.7, 349.2, 392.0, 440.0, 523.3, 587.3];

export const sfx = {
  click: () => tone(660, 0, 0.08, "triangle", 0.15),
  correct: () => { tone(1046, 0, 0.9, "sine", 0.3); tone(1568, 0.05, 1.1, "sine", 0.15); tone(2093, 0.1, 0.8, "sine", 0.08); },
  wrong: () => { tone(330, 0, 0.25, "triangle", 0.18); tone(262, 0.15, 0.35, "triangle", 0.15); },
  train: () => { for (let i = 0; i < 6; i++) noise(i * 0.16, 0.12, 0.18); tone(587, 0.95, 0.35, "square", 0.06); tone(740, 0.95, 0.35, "square", 0.05); },
  unlock: () => [0, 2, 4, 5].forEach((n, i) => tone(PENTA[n] * 2, i * 0.12, 0.5, "triangle", 0.2)),
  victory: () => [0, 2, 3, 4, 5, 4, 5, 6].forEach((n, i) => tone(PENTA[n] * 2, i * 0.15, 0.6, "triangle", 0.22)),
  tick: () => tone(1200, 0, 0.04, "square", 0.05),
};

export function startBgm() {
  if (bgmTimer || !ac()) return;
  const melody = [0, 2, 3, 4, 3, 2, 0, 1, 2, 4, 5, 4, 3, 2, 1, 0];
  let i = 0;
  bgmTimer = setInterval(() => {
    if (muted) return;
    const n = melody[i % melody.length];
    tone(PENTA[n], 0, 0.9, "sine", 0.05);
    if (i % 4 === 0) tone(PENTA[0] / 2, 0, 1.6, "sine", 0.04);
    i++;
  }, 600);
}
export function stopBgm() {
  if (bgmTimer) clearInterval(bgmTimer);
  bgmTimer = null;
}

export function isMuted() { return muted; }
export function setMuted(m: boolean) {
  muted = m;
  if (master && ctx) master.gain.setValueAtTime(m ? 0 : 0.6, ctx.currentTime);
  listeners.forEach((l) => l(m));
}
export function onMute(l: (m: boolean) => void) { listeners.add(l); return () => { listeners.delete(l); }; }
