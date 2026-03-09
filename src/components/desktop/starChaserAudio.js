// ── Star Chaser 3D — Synthesized Audio Engine ──────────────
// All sounds are procedurally generated via Web Audio API.
// No external audio files required.

let audioCtx = null;
let masterGain = null;
let ambienceNode = null;
let ambiencePlaying = false;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(audioCtx.destination);
  }
  // Resume if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

// ── Utility: create a gain-connected oscillator ────────────
const osc = (type, freq, duration, volume = 0.3) => {
  const ctx = getCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(volume, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  o.connect(g);
  g.connect(masterGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + duration);
};

// ── Utility: white noise burst ─────────────────────────────
const noiseBurst = (duration, volume = 0.2) => {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const g = ctx.createGain();
  g.gain.setValueAtTime(volume, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  // Bandpass to shape the noise
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.5;

  source.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  source.start(ctx.currentTime);
  source.stop(ctx.currentTime + duration);
};

// ── Sound Effects ──────────────────────────────────────────

export const sfxLaser = () => {
  const ctx = getCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(880, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.1);
  g.gain.setValueAtTime(0.15, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  o.connect(g);
  g.connect(masterGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.12);
};

export const sfxExplosion = (big = false) => {
  const ctx = getCtx();
  const duration = big ? 0.6 : 0.35;
  const volume = big ? 0.35 : 0.2;

  // Noise component
  noiseBurst(duration, volume);

  // Low rumble
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(big ? 80 : 120, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + duration);
  g.gain.setValueAtTime(volume * 0.8, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  o.connect(g);
  g.connect(masterGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + duration);
};

export const sfxPlayerHit = () => {
  const ctx = getCtx();
  // Heavy hit: noise + low sine
  noiseBurst(0.4, 0.3);

  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(200, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
  g.gain.setValueAtTime(0.25, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  o.connect(g);
  g.connect(masterGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.4);
};

export const sfxPowerUp = () => {
  const ctx = getCtx();
  // Ascending arpeggio chime
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    const startTime = ctx.currentTime + i * 0.07;
    g.gain.setValueAtTime(0.2, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
    o.connect(g);
    g.connect(masterGain);
    o.start(startTime);
    o.stop(startTime + 0.2);
  });
};

export const sfxGameOver = () => {
  const ctx = getCtx();
  // Descending minor tones
  const notes = [392, 349, 311, 262]; // G4 F4 Eb4 C4
  notes.forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    const startTime = ctx.currentTime + i * 0.18;
    g.gain.setValueAtTime(0.15, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
    o.connect(g);
    g.connect(masterGain);
    o.start(startTime);
    o.stop(startTime + 0.35);
  });
};

export const sfxAsteroidHit = () => {
  // Lighter thud for damaging (not destroying) an asteroid
  const ctx = getCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(300, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
  g.gain.setValueAtTime(0.12, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  o.connect(g);
  g.connect(masterGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.1);
};

// ── Ambient Space Music ────────────────────────────────────
// A slow, evolving drone pad built from layered detuned oscillators
// with an LFO-modulated filter for movement.

export const startAmbience = () => {
  if (ambiencePlaying) return;
  const ctx = getCtx();
  ambiencePlaying = true;

  const ambienceGain = ctx.createGain();
  ambienceGain.gain.value = 0;
  // Fade in over 3 seconds
  ambienceGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3);

  // Low-pass filter with LFO for subtle sweep
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  filter.Q.value = 2;

  // LFO to modulate filter cutoff
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08; // very slow sweep
  lfoGain.gain.value = 200;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  // Drone layers: detuned sines and triangles
  const drones = [];
  const frequencies = [55, 55.3, 82.4, 82.7, 110, 164.8]; // A1 variants + E2 + A2 + E3
  const types = ['sine', 'sine', 'triangle', 'sine', 'sine', 'triangle'];

  frequencies.forEach((freq, i) => {
    const o = ctx.createOscillator();
    o.type = types[i];
    o.frequency.value = freq;
    // Slight random detune for richness
    o.detune.value = (Math.random() - 0.5) * 12;
    o.connect(filter);
    o.start();
    drones.push(o);
  });

  filter.connect(ambienceGain);
  ambienceGain.connect(masterGain);

  // Store references for cleanup
  ambienceNode = { gain: ambienceGain, drones, lfo, filter, lfoGain };
};

export const stopAmbience = () => {
  if (!ambiencePlaying || !ambienceNode) return;
  const ctx = getCtx();

  // Fade out over 1 second
  ambienceNode.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);

  // Cleanup after fade
  setTimeout(() => {
    try {
      ambienceNode.drones.forEach(o => { try { o.stop(); } catch(e) {} });
      ambienceNode.lfo.stop();
    } catch(e) {}
    ambienceNode = null;
    ambiencePlaying = false;
  }, 1200);
};

export const setMasterVolume = (v) => {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
};

export const sfxBossWarning = () => {
  const ctx = getCtx();
  // Two-tone siren
  [0, 0.3].forEach((delay) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    const t = ctx.currentTime + delay;
    o.frequency.setValueAtTime(440, t);
    o.frequency.linearRampToValueAtTime(880, t + 0.15);
    o.frequency.linearRampToValueAtTime(440, t + 0.3);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g);
    g.connect(masterGain);
    o.start(t);
    o.stop(t + 0.3);
  });
};

export const sfxCombo = (level) => {
  const ctx = getCtx();
  // Higher pitch for higher combos
  const baseFreq = 600 + Math.min(level, 8) * 80;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = baseFreq;
  g.gain.setValueAtTime(0.12, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  o.connect(g);
  g.connect(masterGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.15);
};

export const sfxHazard = () => {
  const ctx = getCtx();
  // Electric buzz
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sawtooth';
  o.frequency.value = 60;
  g.gain.setValueAtTime(0.2, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  o.connect(g);
  g.connect(masterGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.25);
  noiseBurst(0.15, 0.15);
};
