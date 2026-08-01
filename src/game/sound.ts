/**
 * Synthesised football sounds. Beats shipping audio files: no assets, no
 * licence, works offline, ~150 lines.
 *
 * A real boot-on-ball contact is three things stacked:
 *   1. a broadband transient — the leather slap, gone in ~25ms
 *   2. a short pitched body — the ball's air cavity resonating, ~350-500Hz
 *   3. a low thud — the mass of it
 * Getting all three, with per-hit variation so repeats don't sound cloned,
 * is what separates this from a kick-drum sample.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

/** 0..1. Held outside the graph so it can be set before any AudioContext
 *  exists — constructing one before a user gesture warns in most browsers. */
let volume = 0.7;

export function setVolume(v: number): void {
  volume = Math.max(0, Math.min(1, v));
  if (master) master.gain.value = volume;
}

export function getVolume(): number {
  return volume;
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (volume === 0) return null; // nothing to hear; don't spin up a context
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Cached noise buffer — regenerating white noise per hit is wasteful. */
let noiseBuf: AudioBuffer | null = null;
function noise(ac: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    const len = Math.floor(ac.sampleRate * 0.4);
    noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * @param strength 0..1 — how hard the contact was. Scales level, brightness
 *        and body pitch, the way a real hit does.
 */
export function playKick(strength = 1): void {
  const ac = audio();
  if (!ac || !master) return;

  const now = ac.currentTime;
  const v = Math.max(0.25, Math.min(1, strength));
  const detune = rand(0.92, 1.09); // no two kicks identical

  const out = ac.createGain();
  out.gain.value = 0.5 * v;
  out.connect(master);

  // 1 — leather slap. Bandpassed noise, very fast decay.
  const slap = ac.createBufferSource();
  slap.buffer = noise(ac);
  slap.playbackRate.value = rand(0.9, 1.15);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = rand(1900, 2900) * (0.85 + v * 0.3);
  bp.Q.value = 0.9;
  const slapGain = ac.createGain();
  slapGain.gain.setValueAtTime(0, now);
  slapGain.gain.linearRampToValueAtTime(0.85 * v, now + 0.002);
  slapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
  slap.connect(bp).connect(slapGain).connect(out);
  slap.start(now);
  slap.stop(now + 0.06);

  // 2 — the pock. Ball cavity, pitch drops as the panel flexes back.
  const body = ac.createOscillator();
  body.type = 'triangle';
  const f0 = rand(400, 500) * detune;
  body.frequency.setValueAtTime(f0, now);
  body.frequency.exponentialRampToValueAtTime(f0 * 0.42, now + 0.07);
  const bodyGain = ac.createGain();
  bodyGain.gain.setValueAtTime(0, now);
  bodyGain.gain.linearRampToValueAtTime(0.5 * v, now + 0.003);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
  body.connect(bodyGain).connect(out);
  body.start(now);
  body.stop(now + 0.13);

  // 3 — mass. Barely audible alone, but its absence reads as "toy".
  const thud = ac.createOscillator();
  thud.type = 'sine';
  thud.frequency.setValueAtTime(120 * detune, now);
  thud.frequency.exponentialRampToValueAtTime(62, now + 0.1);
  const thudGain = ac.createGain();
  thudGain.gain.setValueAtTime(0, now);
  thudGain.gain.linearRampToValueAtTime(0.42 * v, now + 0.004);
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  thud.connect(thudGain).connect(out);
  thud.start(now);
  thud.stop(now + 0.18);
}

/** Glancing hit off a wall — duller and quieter than a struck ball. */
export function playBounce(strength = 0.5): void {
  const ac = audio();
  if (!ac || !master) return;

  const now = ac.currentTime;
  const v = Math.max(0.08, Math.min(0.7, strength));

  const out = ac.createGain();
  out.gain.value = 0.34 * v;
  out.connect(master);

  const n = ac.createBufferSource();
  n.buffer = noise(ac);
  n.playbackRate.value = rand(0.8, 1.05);
  const lp = ac.createBiquadFilter();
  lp.type = 'bandpass';
  lp.frequency.value = rand(700, 1200);
  lp.Q.value = 1.1;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.7, now + 0.003);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
  n.connect(lp).connect(g).connect(out);
  n.start(now);
  n.stop(now + 0.09);

  const o = ac.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(rand(180, 240), now);
  o.frequency.exponentialRampToValueAtTime(95, now + 0.09);
  const og = ac.createGain();
  og.gain.setValueAtTime(0.5, now);
  og.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  o.connect(og).connect(out);
  o.start(now);
  o.stop(now + 0.14);
}

/** Ball hits the deck. Dead, damped, no ring — the run is over. */
export function playDrop(): void {
  const ac = audio();
  if (!ac || !master) return;

  const now = ac.currentTime;
  const out = ac.createGain();
  out.gain.value = 0.5;
  out.connect(master);

  // dull impact
  const n = ac.createBufferSource();
  n.buffer = noise(ac);
  n.playbackRate.value = 0.65;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1400, now);
  lp.frequency.exponentialRampToValueAtTime(320, now + 0.22);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.6, now + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  n.connect(lp).connect(g).connect(out);
  n.start(now);
  n.stop(now + 0.32);

  // low body, falling — reads as "that's it"
  const o = ac.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, now);
  o.frequency.exponentialRampToValueAtTime(48, now + 0.34);
  const og = ac.createGain();
  og.gain.setValueAtTime(0.55, now);
  og.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  o.connect(og).connect(out);
  o.start(now);
  o.stop(now + 0.42);
}
