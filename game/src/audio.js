// WebAudio synth: engine hum, sirens, shots, UI blips — no audio files.
let ctx = null, engineOsc = null, engineGain = null, sirenOsc = null;
export function initAudio() {
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    engineOsc = ctx.createOscillator(); engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth'; engineOsc.frequency.value = 55; engineGain.gain.value = 0;
    engineOsc.connect(engineGain).connect(ctx.destination); engineOsc.start();
    sirenOsc = ctx.createOscillator(); const sg = ctx.createGain(); sg.gain.value = 0;
    sirenOsc.type = 'triangle'; sirenOsc.connect(sg).connect(ctx.destination); sirenOsc.start();
    sirenOsc._gain = sg;
  } catch (e) { ctx = null; }
}
function blip(freq, dur, type = 'square', vol = 0.08) {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
}
export const sfx = {
  shot() { blip(180, 0.12, 'sawtooth', 0.15); blip(90, 0.08, 'square', 0.1); },
  ui() { blip(880, 0.06, 'sine', 0.06); },
  pickup() { blip(660, 0.1, 'sine', 0.09); setTimeout(() => blip(990, 0.12, 'sine', 0.09), 60); },
  stunt() { blip(520, 0.15, 'triangle', 0.12); setTimeout(() => blip(780, 0.2, 'triangle', 0.12), 90); },
  cash() { blip(1200, 0.08, 'sine', 0.08); setTimeout(() => blip(1500, 0.1, 'sine', 0.08), 50); },
  engine(speedRatio, inCar) {
    if (!ctx || !engineOsc) return;
    engineOsc.frequency.value = 55 + Math.abs(speedRatio) * 140;
    engineGain.gain.value = inCar ? 0.035 : 0;
  },
  siren(on, t) {
    if (!ctx || !sirenOsc) return;
    sirenOsc._gain.gain.value = on ? 0.02 : 0;
    if (on) sirenOsc.frequency.value = 700 + Math.sin(t * 6) * 250;
  },
};
