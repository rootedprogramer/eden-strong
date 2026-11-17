// A soft two-note bell for the end of timers, made in the browser (no sound file).
// Phones only allow sound after a tap, so call primeDing() from the button that
// starts a timer; ding() can then play when the countdown ends.
let ctx = null;

export function primeDing() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    // A silent blip unlocks audio on iPhone
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch {
    /* sound is a nice-to-have */
  }
}

function bell(at, freq) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.35, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.4);
  gain.connect(ctx.destination);
  // The note plus a quieter overtone gives it a bell-like ring
  [[freq, 1], [freq * 2.76, 0.25]].forEach(([f, level]) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, at);
    g.gain.value = level;
    osc.connect(g).connect(gain);
    osc.start(at);
    osc.stop(at + 1.5);
  });
}

export function ding() {
  try {
    navigator.vibrate?.([200, 100, 200]);
  } catch {}
  try {
    if (!ctx) primeDing();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime + 0.02;
    bell(now, 1318.5); // E6
    bell(now + 0.22, 1760); // A6
  } catch {
    /* ignore */
  }
}
