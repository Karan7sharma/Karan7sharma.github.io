import {
  createState,
  kick,
  MAX_FRAME,
  reset,
  resize,
  step,
  STEP,
  type State,
} from './physics';
import { readTheme, render, type Theme } from './render';
import { playBounce, playDrop, playKick, setVolume } from './sound';

const BEST_KEY = 'kickups:best';
const VOL_KEY = 'kickups:vol';

export function mount(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-canvas]');
  const scoreEl = root.querySelector<HTMLElement>('[data-score]');
  const bestEl = root.querySelector<HTMLElement>('[data-best]');
  const hintEl = root.querySelector<HTMLElement>('[data-hint]');
  const overEl = root.querySelector<HTMLElement>('[data-over]');
  const overScore = root.querySelector<HTMLElement>('[data-over-score]');
  const retryBtn = root.querySelector<HTMLButtonElement>('[data-retry]');
  const muteBtn = root.querySelector<HTMLButtonElement>('[data-mute]');
  const volEl = root.querySelector<HTMLInputElement>('[data-vol]');
  const soundWrap = muteBtn?.closest<HTMLElement>('.sound') ?? null;

  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let best = Number(localStorage.getItem(BEST_KEY) ?? 0) || 0;

  // Volume, 0..1. Replaces the old boolean mute — 0 is simply silent.
  // Read the raw string first: Number(null) is 0, which is a *valid* volume,
  // so coercing straight away would silence every first-time visitor.
  const rawVol = localStorage.getItem(VOL_KEY);
  const storedVol = rawVol === null ? NaN : Number(rawVol);
  let vol =
    Number.isFinite(storedVol) && storedVol >= 0 && storedVol <= 1
      ? storedVol
      : 0.7;
  // Remembered so the mute button has something to restore to.
  let lastAudible = vol > 0 ? vol : 0.7;

  let theme: Theme = readTheme(document.documentElement);
  let state: State = createState(
    canvas.clientWidth || 320,
    canvas.clientHeight || 420,
  );

  let raf = 0;
  let running = false;
  let last = 0;
  let acc = 0;

  const setBest = (n: number) => {
    best = n;
    localStorage.setItem(BEST_KEY, String(n));
    if (bestEl) bestEl.textContent = String(n);
  };
  if (bestEl) bestEl.textContent = String(best);

  const applyVolume = (v: number, syncSlider = true) => {
    vol = Math.max(0, Math.min(1, v));
    if (vol > 0) lastAudible = vol;

    setVolume(vol);
    localStorage.setItem(VOL_KEY, String(vol));

    if (syncSlider && volEl) volEl.value = String(Math.round(vol * 100));

    if (soundWrap) {
      soundWrap.toggleAttribute('data-muted', vol === 0);
      soundWrap.dataset.level = vol > 0 && vol < 0.4 ? 'low' : 'normal';
    }
    if (muteBtn) {
      muteBtn.setAttribute(
        'aria-label',
        vol === 0 ? 'Unmute game sound' : 'Mute game sound',
      );
      muteBtn.setAttribute('aria-pressed', String(vol === 0));
    }
    if (volEl) {
      volEl.setAttribute('aria-valuetext', `${Math.round(vol * 100)}%`);
    }
  };
  applyVolume(vol);

  const toggleMute = () => applyVolume(vol === 0 ? lastAudible : 0);

  // ------------------------------------------------------------- sizing
  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas!.clientWidth;
    const h = canvas!.clientHeight;
    if (!w || !h) return;
    canvas!.width = Math.round(w * dpr);
    canvas!.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    resize(state, w, h);
    render(ctx!, state, theme);
  }

  const ro = new ResizeObserver(fit);
  ro.observe(canvas);
  fit();

  // -------------------------------------------------------------- loop
  function frame(now: number) {
    if (!running) return;
    const delta = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    acc += delta;

    while (acc >= STEP) {
      const wasPlaying = state.phase === 'playing';
      step(state, STEP);
      acc -= STEP;

      // Wall and ceiling contacts get their own, duller sound. Gated on
      // speed so a ball dribbling along a wall doesn't machine-gun.
      if (
        vol > 0 &&
        (state.impact === 'wall' || state.impact === 'ceiling') &&
        state.impactSpeed > 90
      ) {
        playBounce(state.impactSpeed / 700);
      }

      if (wasPlaying && state.phase === 'over') gameOver();
    }

    render(ctx!, state, theme);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    acc = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // ------------------------------------------------------------ actions
  function gameOver() {
    if (vol > 0) playDrop();
    if (state.score > best) setBest(state.score);
    if (overScore) overScore.textContent = String(state.score);
    overEl?.removeAttribute('hidden');
    hintEl?.setAttribute('hidden', '');
  }

  function onPointer(e: PointerEvent) {
    if (state.phase === 'over') return;
    const r = canvas!.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;

    // How far off-centre the contact was — a toe-poke on the edge should
    // sound weaker than one struck through the middle.
    const off = Math.hypot(px - state.x, py - state.y) / state.r;

    if (kick(state, px, py)) {
      e.preventDefault();
      if (vol > 0) playKick(1 - Math.min(0.55, off * 0.3));
      if (scoreEl) scoreEl.textContent = String(state.score);
      hintEl?.setAttribute('hidden', '');
      if (state.score > best) setBest(state.score);
    }
  }

  function restart() {
    reset(state);
    fit();
    if (scoreEl) scoreEl.textContent = '0';
    overEl?.setAttribute('hidden', '');
    hintEl?.removeAttribute('hidden');
    start();
  }

  canvas.addEventListener('pointerdown', onPointer);
  retryBtn?.addEventListener('click', restart);
  muteBtn?.addEventListener('click', toggleMute);

  // The slider drives volume live while dragging. syncSlider is false so we
  // don't write back into the element mid-drag and fight the user's pointer.
  volEl?.addEventListener('input', () => {
    applyVolume(Number(volEl.value) / 100, false);
  });

  // Keyboard: space pauses, Enter kicks straight up (accessible fallback),
  // M mutes — a shortcut for the button, which is the primary control.
  function onKey(e: KeyboardEvent) {
    if (document.activeElement !== canvas) return;
    if (e.code === 'KeyM') {
      e.preventDefault();
      toggleMute();
    }
    if (e.code === 'Space') {
      e.preventDefault();
      running ? stop() : start();
    }
    if (e.code === 'Enter') {
      e.preventDefault();
      if (kick(state, state.x, state.y)) {
        if (vol > 0) playKick(1);
        if (scoreEl) scoreEl.textContent = String(state.score);
        hintEl?.setAttribute('hidden', '');
        if (state.score > best) setBest(state.score);
      }
    }
  }
  canvas.addEventListener('keydown', onKey);

  // -------------------------------------------- pause when out of view
  const vis = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !document.hidden) start();
      else stop();
    },
    { threshold: 0.15 },
  );
  vis.observe(root);

  const onVisibility = () => {
    if (document.hidden) stop();
    else if (
      root.getBoundingClientRect().top < window.innerHeight &&
      root.getBoundingClientRect().bottom > 0
    )
      start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  // Theme swap — re-read the CSS custom properties
  const themeObserver = new MutationObserver(() => {
    theme = readTheme(document.documentElement);
    render(ctx, state, theme);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  if (reduce) {
    // Don't autostart an animation loop; the ball waits for a click.
    render(ctx, state, theme);
  }

  return () => {
    stop();
    ro.disconnect();
    vis.disconnect();
    themeObserver.disconnect();
    canvas.removeEventListener('pointerdown', onPointer);
    canvas.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
