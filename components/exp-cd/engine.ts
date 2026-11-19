/* /exp/cd — the film engine. One clock (the voice-over's currentTime) drives everything:
   every layer has keyframes in absolute seconds, and each frame the engine writes each
   layer's transform straight to the DOM (no React renders), so the picture is always exactly
   where the voice is, through pauses and seeks.

   Space: x, y in vmin from the centre of the screen. A camera (x, y, scale, rotate) looks at
   that space; each layer sits at a depth z — the camera moves a layer z times as far and
   scales it by scale^z, so near and far things part as the camera moves (parallax). z = 0 is
   glued to the screen (titles, captions-level graphics).

   Stop-motion: layer motion is sampled at 12 frames a second, like the reference reel, and
   cut-outs "boil" (a tiny jitter that changes every frame). The camera stays smooth. */

export type Ease = 'lin' | 'out' | 'in' | 'io' | 'back' | 'expo' | 'hold';
export type Props = { x: number; y: number; s: number; r: number; o: number; c: number };
export type Key = Partial<Props> & { t: number; e?: Ease };

export type Layer = {
  id: string;
  z?: number;          // depth; 1 = the action plane, < 1 farther, 0 = the screen
  zi?: number;         // stacking
  keys: Key[];
  boil?: number;       // jitter amount (vmin), stepped at 12 fps
  clip?: 'l' | 'r' | 't' | 'b' | 'iris'; // what `c` (0 → 1) reveals
  smooth?: boolean;    // skip the 12 fps stepping
  fx?: (t: number, el: HTMLElement) => void; // per-frame extras (counters, masks)
};

const EASE: Record<Ease, (u: number) => number> = {
  lin: (u) => u,
  out: (u) => 1 - (1 - u) ** 3,
  in: (u) => u ** 3,
  io: (u) => (u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2),
  back: (u) => { const c = 1.9; return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2; },
  expo: (u) => (u >= 1 ? 1 : 1 - 2 ** (-10 * u)),
  hold: (u) => (u >= 1 ? 1 : 0),
};
const DEF: Props = { x: 0, y: 0, s: 1, r: 0, o: 1, c: 1 };
const PROPS = ['x', 'y', 's', 'r', 'o', 'c'] as const;

// per-prop tracks, built once per layer
type Track = { t: number; v: number; e: Ease }[];
export function compile(keys: Key[]) {
  const sorted = [...keys].sort((a, b) => a.t - b.t);
  const tracks = {} as Record<keyof Props, Track>;
  for (const p of PROPS) tracks[p] = sorted.filter((k) => k[p] !== undefined).map((k) => ({ t: k.t, v: k[p] as number, e: k.e ?? 'out' }));
  return tracks;
}
export function sample(tr: Track, t: number, def: number) {
  if (!tr.length) return def;
  if (t <= tr[0].t) return tr[0].v;
  const last = tr[tr.length - 1];
  if (t >= last.t) return last.v;
  let i = 1;
  while (tr[i].t < t) i++;
  const a = tr[i - 1], b = tr[i];
  const u = (t - a.t) / Math.max(1e-6, b.t - a.t);
  return a.v + (b.v - a.v) * EASE[b.e](u);
}
export function at(tracks: Record<keyof Props, Track>, t: number): Props {
  return { x: sample(tracks.x, t, DEF.x), y: sample(tracks.y, t, DEF.y), s: sample(tracks.s, t, DEF.s), r: sample(tracks.r, t, DEF.r), o: sample(tracks.o, t, DEF.o), c: sample(tracks.c, t, DEF.c) };
}

const hash = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x) - 0.5; };

export class Engine {
  private items: { L: Layer; tr: ReturnType<typeof compile>; el: HTMLElement; shown: boolean; i: number }[] = [];
  private cam: ReturnType<typeof compile>;
  constructor(layers: Layer[], camera: Key[], root: HTMLElement) {
    this.cam = compile(camera);
    layers.forEach((L, i) => {
      const el = root.querySelector<HTMLElement>(`[data-l="${L.id}"]`);
      if (el) { el.style.display = 'none'; this.items.push({ L, tr: compile(L.keys), el, shown: false, i }); }
    });
  }
  render(t: number) {
    const C = at(this.cam, t);
    const tq = Math.floor(t * 12) / 12;
    for (const it of this.items) {
      const { L, el } = it;
      const p = at(it.tr, L.smooth ? t : tq);
      if (p.o <= 0.001) { if (it.shown) { el.style.display = 'none'; it.shown = false; } continue; }
      if (!it.shown) { el.style.display = ''; it.shown = true; }
      const z = L.z ?? 1;
      const S = C.s ** z;
      let x = (p.x - C.x * z) * S, y = (p.y - C.y * z) * S, r = p.r + C.r * z;
      if (L.boil) { const f = Math.floor(t * 12); x += hash(f, it.i) * L.boil; y += hash(f + 7, it.i) * L.boil; r += hash(f + 3, it.i) * L.boil * 2.2; }
      // rotate the layer's position with the camera too, so the whole world turns
      if (C.r && z) { const a = (C.r * z * Math.PI) / 180, cx = x, cy = y; x = cx * Math.cos(a) - cy * Math.sin(a); y = cx * Math.sin(a) + cy * Math.cos(a); }
      el.style.transform = `translate(-50%,-50%) translate(${x.toFixed(2)}vmin,${y.toFixed(2)}vmin) rotate(${r.toFixed(2)}deg) scale(${(p.s * S).toFixed(4)})`;
      el.style.opacity = p.o >= 0.999 ? '' : p.o.toFixed(3);
      if (L.clip) {
        const k = ((1 - Math.max(0, Math.min(1, p.c))) * 100).toFixed(1);
        el.style.clipPath = L.clip === 'iris' ? `circle(${(Math.min(1, p.c) * 75).toFixed(1)}% at 50% 50%)`
          : L.clip === 'l' ? `inset(-5% ${k}% -5% -5%)` : L.clip === 'r' ? `inset(-5% -5% -5% ${k}%)` : L.clip === 't' ? `inset(-5% -5% ${k}% -5%)` : `inset(${k}% -5% -5% -5%)`;
      }
      L.fx?.(t, el);
    }
    return C;
  }
}

/* ── builders: base pose + entrances, moves and exits, as keyframes ── */
export type Pose = { x: number; y: number; s?: number; r?: number };
type In = 'pop' | 'slam' | 'fade' | 'cut' | 'wipe' | 'left' | 'right' | 'up' | 'down' | 'drop' | 'zoom' | 'spin';
type Out = 'fade' | 'cut' | 'shrink' | 'left' | 'right' | 'up' | 'down' | 'fall';

export function enter(kind: In, t: number, b: Pose, d = 0.45): Key[] {
  const s = b.s ?? 1, r = b.r ?? 0;
  const pose = { x: b.x, y: b.y, s, r, o: 1 };
  const hide: Key = { t: t - 0.01, o: 0, e: 'hold' };
  const D = 150;
  switch (kind) {
    case 'cut': return [hide, { t, ...pose, e: 'hold' }];
    case 'fade': return [hide, { t, ...pose, o: 0, e: 'hold' }, { t: t + d, o: 1, e: 'lin' }];
    case 'pop': return [hide, { t, ...pose, s: 0, r: r - 25, e: 'hold' }, { t: t + d, s, r, e: 'back' }];
    case 'slam': return [hide, { t, ...pose, s: s * 2.6, o: 0, e: 'hold' }, { t: t + d * 0.6, s, o: 1, e: 'out' }];
    case 'zoom': return [hide, { t, ...pose, s: s * 0.1, e: 'hold' }, { t: t + d, s, e: 'expo' }];
    case 'spin': return [hide, { t, ...pose, s: 0, r: r - 200, e: 'hold' }, { t: t + d, s, r, e: 'out' }];
    case 'wipe': return [hide, { t, ...pose, c: 0, e: 'hold' }, { t: t + d, c: 1, e: 'io' }];
    case 'drop': return [hide, { t, ...pose, y: b.y - D, r: r - 20, e: 'hold' }, { t: t + d, y: b.y, r, e: 'back' }];
    default: {
      const dx = kind === 'left' ? -D : kind === 'right' ? D : 0, dy = kind === 'up' ? -D : kind === 'down' ? D : 0;
      return [hide, { t, ...pose, x: b.x + dx, y: b.y + dy, r: r + (dx ? Math.sign(dx) * 12 : 8), e: 'hold' }, { t: t + d, x: b.x, y: b.y, r, e: 'expo' }];
    }
  }
}

export function exit(kind: Out, t: number, b: Pose, d = 0.4): Key[] {
  const D = 170;
  switch (kind) {
    case 'cut': return [{ t, o: 0, e: 'hold' }];
    case 'fade': return [{ t, o: 1, e: 'hold' }, { t: t + d, o: 0, e: 'lin' }];
    case 'shrink': return [{ t, s: b.s ?? 1, e: 'hold' }, { t: t + d, s: 0, e: 'in' }, { t: t + d + 0.01, o: 0, e: 'hold' }];
    case 'fall': return [{ t, y: b.y, r: b.r ?? 0, e: 'hold' }, { t: t + d, y: b.y + D, r: (b.r ?? 0) + 30, e: 'in' }, { t: t + d + 0.01, o: 0, e: 'hold' }];
    default: {
      const dx = kind === 'left' ? -D : kind === 'right' ? D : 0, dy = kind === 'up' ? -D : kind === 'down' ? D : 0;
      return [{ t, x: b.x, y: b.y, e: 'hold' }, { t: t + d, x: b.x + dx, y: b.y + dy, e: 'in' }, { t: t + d + 0.01, o: 0, e: 'hold' }];
    }
  }
}
