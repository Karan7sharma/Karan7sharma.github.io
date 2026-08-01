import type { State } from './physics';

export interface Theme {
  /** Ball body — stays light in both themes. A football is white. */
  ball: string;
  /** Ball panels — stays dark in both themes. */
  panel: string;
  /** Ground line, from the page tokens. */
  line: string;
  accent: string;
}

// Warm off-white and warm near-black, tuned to sit on the paper palette
// without looking like pure #fff / #000 pasted onto it.
const BALL_BODY = '#FBF7F0';
const BALL_PANEL = '#231D19';

export function readTheme(el: HTMLElement): Theme {
  const cs = getComputedStyle(el);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return {
    ball: BALL_BODY,
    panel: BALL_PANEL,
    line: v('--line-strong') || '#2c3a34',
    accent: v('--accent') || '#34d399',
  };
}

/* ─────────────────────────────────────────────────────────── geometry */

type Vec3 = [number, number, number];

/**
 * The 12 pentagon centres of a truncated icosahedron — i.e. the vertices of
 * an icosahedron. This is the actual geometry of a Telstar football, which
 * is why projecting these reads as a real ball rather than a spinning decal.
 */
const PENTAGONS: Vec3[] = (() => {
  const p = (1 + Math.sqrt(5)) / 2;
  const raw: Vec3[] = [];
  for (const s1 of [1, -1])
    for (const s2 of [1, -1]) {
      raw.push([0, s1, s2 * p], [s1, s2 * p, 0], [s2 * p, 0, s1]);
    }
  const len = Math.hypot(1, p);
  return raw.map(([x, y, z]) => [x / len, y / len, z / len] as Vec3);
})();

/** Angular radius of a pentagon on the sphere, in radians (~23°). */
const PENT_ALPHA = 0.4;

function rotate(v: Vec3, ax: number, az: number): Vec3 {
  // about X (tumble)
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const y1 = v[1] * cx - v[2] * sx;
  const z1 = v[1] * sx + v[2] * cx;
  // about Z (roll)
  const cz = Math.cos(az);
  const sz = Math.sin(az);
  return [v[0] * cz - y1 * sz, v[0] * sz + y1 * cz, z1];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function norm(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

/* ───────────────────────────────────────────────────────────── drawing */

function drawBall(
  ctx: CanvasRenderingContext2D,
  s: State,
  theme: Theme,
): void {
  const R = s.r;

  ctx.save();
  ctx.translate(s.x, s.y);

  // Clip everything to the sphere so panels wrap cleanly at the limb.
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.clip();

  // Body — lit from the upper left.
  const body = ctx.createRadialGradient(
    -R * 0.4,
    -R * 0.45,
    R * 0.05,
    0,
    0,
    R * 1.2,
  );
  body.addColorStop(0, '#ffffff');
  body.addColorStop(0.45, theme.ball);
  body.addColorStop(1, '#c9bfb0');
  ctx.fillStyle = body;
  ctx.fillRect(-R, -R, R * 2, R * 2);

  // Panels, back-face culled and projected orthographically.
  ctx.fillStyle = theme.panel;
  for (const base of PENTAGONS) {
    const n = rotate(base, s.tumble, s.angle);
    if (n[2] < 0.04) continue; // facing away

    const up: Vec3 = Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
    const t1 = norm(cross(n, up));
    const t2 = cross(n, t1);

    const ca = Math.cos(PENT_ALPHA);
    const sa = Math.sin(PENT_ALPHA);

    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const th = (k / 5) * Math.PI * 2;
      const c = Math.cos(th) * sa;
      const d = Math.sin(th) * sa;
      const px = n[0] * ca + t1[0] * c + t2[0] * d;
      const py = n[1] * ca + t1[1] * c + t2[1] * d;
      // canvas y grows downward, so flip
      k === 0
        ? ctx.moveTo(px * R, -py * R)
        : ctx.lineTo(px * R, -py * R);
    }
    ctx.closePath();

    // Panels near the limb sit in shadow — fade them into the body so the
    // sphere doesn't look like a flat disc with stickers on it.
    ctx.globalAlpha = 0.55 + 0.45 * Math.min(1, n[2] * 1.8);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Terminator — darkens the lower right into shadow.
  const shade = ctx.createRadialGradient(
    -R * 0.35,
    -R * 0.4,
    R * 0.1,
    0,
    0,
    R * 1.08,
  );
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(0.55, 'rgba(20,14,10,0.08)');
  shade.addColorStop(1, 'rgba(20,14,10,0.52)');
  ctx.fillStyle = shade;
  ctx.fillRect(-R, -R, R * 2, R * 2);

  // Specular highlight.
  const spec = ctx.createRadialGradient(
    -R * 0.36,
    -R * 0.42,
    0,
    -R * 0.36,
    -R * 0.42,
    R * 0.42,
  );
  spec.addColorStop(0, 'rgba(255,255,255,0.5)');
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = spec;
  ctx.fillRect(-R, -R, R * 2, R * 2);

  // Bounced light along the lower-left edge.
  const bounce = ctx.createRadialGradient(
    R * 0.3,
    R * 0.55,
    0,
    R * 0.3,
    R * 0.55,
    R * 0.7,
  );
  bounce.addColorStop(0, 'rgba(255,240,220,0.16)');
  bounce.addColorStop(1, 'rgba(255,240,220,0)');
  ctx.fillStyle = bounce;
  ctx.fillRect(-R, -R, R * 2, R * 2);

  ctx.restore();

  // Rim, drawn outside the clip so it stays crisp.
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.beginPath();
  ctx.arc(0, 0, R - 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(60,45,32,0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

export function render(
  ctx: CanvasRenderingContext2D,
  s: State,
  theme: Theme,
): void {
  ctx.clearRect(0, 0, s.w, s.h);

  // Ground line
  ctx.beginPath();
  ctx.moveTo(0, s.h - 1);
  ctx.lineTo(s.w, s.h - 1);
  ctx.strokeStyle = s.phase === 'over' ? theme.accent : theme.line;
  ctx.lineWidth = s.phase === 'over' ? 2 : 1;
  ctx.stroke();

  // Contact shadow — tightens and darkens as the ball nears the floor.
  const t = Math.max(0, Math.min(1, (s.y + s.r) / s.h));
  const rx = s.r * (1.25 - t * 0.5);
  const ry = Math.max(2.5, s.r * 0.16 * (0.6 + t * 0.6));
  ctx.save();
  ctx.translate(s.x, s.h - ry - 1);
  ctx.scale(1, ry / rx);
  const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  sh.addColorStop(0, `rgba(0,0,0,${0.3 * t * t})`);
  sh.addColorStop(0.6, `rgba(0,0,0,${0.13 * t * t})`);
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawBall(ctx, s, theme);
}
