/**
 * Footy-juggle physics. Pure — no DOM, no canvas, no globals.
 * Everything is in CSS pixels and seconds.
 */

export const STEP = 1 / 120; // fixed 120Hz physics tick
export const MAX_FRAME = 0.05; // clamp tab-switch gaps

export const CONFIG = {
  gravityBase: 1800, // px/s²
  gravityPerLevel: 90, // ramp, applied every `levelEvery` kicks
  gravityMax: 3000,
  levelEvery: 10,
  wallRestitution: 0.8,
  ceilingRestitution: 0.5,
  kickImpulse: -860, // upward vy on a dead-centre strike
  /** Fraction of lift traded away by a strike right on the rim. */
  liftLoss: 0.34,
  /** Sideways speed from a full rim strike, px/s. */
  sideImpulse: 580,
  /** How much of the ball's existing sideways speed survives a new strike.
   *  Low, so a clean centre hit straightens it back up. */
  carryOver: 0.22,
  /** Rotation kick from an off-centre strike, rad/s. */
  spinImpulse: 15,
  /** Spin bleeds off at this rate per second. */
  spinDecay: 1.6,
  vxClamp: 640,
  hitRadiusFactor: 1.9, // how forgiving the tap target is
  radius: 26,
} as const;

export type Phase = 'idle' | 'playing' | 'over';

/** What happened during the last step — drives sound. */
export type Impact = 'none' | 'wall' | 'ceiling' | 'floor';

export interface State {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Spin about the screen-normal axis — the rolling component. */
  angle: number;
  /** Extra rotation rate imparted by an off-centre strike, rad/s. Decays. */
  spin: number;
  /** Tumble about the horizontal axis. Real juggled balls don't spin flat. */
  tumble: number;
  score: number;
  phase: Phase;
  /** Set by the last step(); consumed by the caller for sound. */
  impact: Impact;
  /** Speed of that impact, for velocity-scaled sound. */
  impactSpeed: number;
  /** seconds since the ball entered idle — drives the float animation */
  t: number;
  w: number;
  h: number;
  r: number;
}

export function createState(w: number, h: number): State {
  return {
    x: w / 2,
    y: h * 0.45,
    vx: 0,
    vy: 0,
    angle: 0,
    spin: 0,
    tumble: 0,
    score: 0,
    phase: 'idle',
    impact: 'none',
    impactSpeed: 0,
    t: 0,
    w,
    h,
    r: CONFIG.radius,
  };
}

export function gravityFor(score: number): number {
  const level = Math.floor(score / CONFIG.levelEvery);
  return Math.min(
    CONFIG.gravityBase + level * CONFIG.gravityPerLevel,
    CONFIG.gravityMax,
  );
}

/** Advance one fixed step. Mutates and returns `s`. */
export function step(s: State, dt: number): State {
  s.t += dt;
  s.impact = 'none';
  s.impactSpeed = 0;

  if (s.phase === 'idle') {
    // Gentle float so the ball reads as interactive before first contact.
    s.y = s.h * 0.45 + Math.sin(s.t * 1.6) * 10;
    s.angle += dt * 0.22;
    s.tumble += dt * 0.15;
    return s;
  }

  if (s.phase === 'over') return s;

  s.vy += gravityFor(s.score) * dt;
  s.x += s.vx * dt;
  s.y += s.vy * dt;

  // Rolling spin follows horizontal speed; tumble follows vertical, which is
  // what makes it read as a ball in flight rather than a spinning sticker.
  // On top of that sits the spin imparted by an off-centre strike, bleeding
  // off over about a second.
  s.angle += (s.vx / s.r) * dt * 0.6 + s.spin * dt;
  s.tumble += (s.vy / s.r) * dt * 0.32;
  s.spin *= Math.max(0, 1 - CONFIG.spinDecay * dt);

  // Side walls
  if (s.x < s.r) {
    s.x = s.r;
    s.impact = 'wall';
    s.impactSpeed = Math.abs(s.vx);
    s.vx = -s.vx * CONFIG.wallRestitution;
  } else if (s.x > s.w - s.r) {
    s.x = s.w - s.r;
    s.impact = 'wall';
    s.impactSpeed = Math.abs(s.vx);
    s.vx = -s.vx * CONFIG.wallRestitution;
  }

  // Ceiling
  if (s.y < s.r) {
    s.y = s.r;
    s.impact = 'ceiling';
    s.impactSpeed = Math.abs(s.vy);
    s.vy = -s.vy * CONFIG.ceilingRestitution;
  }

  // Floor — game over
  if (s.y > s.h - s.r) {
    s.y = s.h - s.r;
    s.impact = 'floor';
    s.impactSpeed = Math.abs(s.vy);
    s.phase = 'over';
    s.vx = 0;
    s.vy = 0;
  }

  return s;
}

/** True if a pointer at (px, py) is close enough to count as a hit. */
export function isHit(s: State, px: number, py: number): boolean {
  const dx = px - s.x;
  const dy = py - s.y;
  const reach = s.r * CONFIG.hitRadiusFactor;
  return dx * dx + dy * dy <= reach * reach;
}

/** Apply a kick. Returns true if the kick connected. */
export function kick(s: State, px: number, py: number): boolean {
  if (s.phase === 'over') return false;
  if (!isHit(s, px, py)) return false;

  if (s.phase === 'idle') {
    s.phase = 'playing';
    s.score = 0;
  }

  // The impulse runs along the line from the contact point through the
  // centre — strike the right-hand side and the ball leaves to the left,
  // the same way a real one does. Dead centre goes straight up.
  const dx = s.x - px;
  const dy = s.y - py;
  const dist = Math.hypot(dx, dy);

  // 0 at dead centre, 1 at the rim. Clamped, because the tap target is
  // deliberately larger than the ball itself.
  const offset = Math.min(1, dist / s.r);
  const nx = dist > 0.001 ? dx / dist : 0;

  // A glancing strike near the rim trades lift for sideways travel.
  s.vy = CONFIG.kickImpulse * (1 - CONFIG.liftLoss * offset);

  // Mostly replace rather than accumulate: without this, sideways speed
  // piles up across strikes and the ball becomes impossible to recover.
  s.vx = s.vx * CONFIG.carryOver + nx * CONFIG.sideImpulse * offset;
  s.vx = Math.max(-CONFIG.vxClamp, Math.min(CONFIG.vxClamp, s.vx));

  // Off-centre contact also sets it spinning.
  s.spin = nx * offset * CONFIG.spinImpulse;

  s.score += 1;

  return true;
}

export function reset(s: State): State {
  const fresh = createState(s.w, s.h);
  Object.assign(s, fresh);
  return s;
}

/** Keep the ball inside the box after a container resize. */
export function resize(s: State, w: number, h: number): void {
  s.w = w;
  s.h = h;
  s.x = Math.max(s.r, Math.min(w - s.r, s.x));
  s.y = Math.max(s.r, Math.min(h - s.r, s.y));
}
