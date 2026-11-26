'use client';

import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/* /exp/cd-2's headline, played in on load the way jitter.video's hero is (studied 2026-11-26 from its
   shipped Lottie, hero-animation-2026-desktop: 60fps, 2.3s):
   - each word cuts on (no fade) at 150% and slams down to 74% in 190ms, then eases back to 100% over
     720ms (Jitter's keyframes and easings); the words follow one another a few ms apart (STEP);
   - its letters land in other faces (the site's own: Plex Mono, Instrument Serif, Source Serif italic,
     Inter thin caps) and cut from face to face every 160–320ms until each settles on Season Mix, each
     at its own moment;
   - six letters are stood in for by things a creative director works with (Jitter's mascots): each
     pops in, tipping from -20° past upright, boils (the client logos' filters, cd-boil), shrinks
     away, and its letter pops in from 125% in its place. While it shows, its line parts round it
     (the pieces before it left, those after it right) and closes back as it shrinks, keeping each
     line inside the screen (planRoom); all of it on the CSS animations' clock.
   Before fonts are ready nothing shows (html.cd-js); reduced motion (no cd-js) shows the headline as
   set. Screen readers get the sentence once (the drawn version is aria-hidden). */

const BASE = 120; // ms after the fonts are ready
const STEP = 22; // ms between words
const FACES = 5; // cd2.css [data-f="1".."5"]
const OBJ_IN = 120; // an object's start after its word's
const OBJ_RUN = 1650; // its run (cd2.css, cd2-obj)
const POP_AT = 1500; // when its letter pops in, after the object's start
const CLOSE_AT = OBJ_RUN * 0.636; // when the thing starts shrinking away, and its room closing (cd2-obj)
const ROOM_PAD = 0.45; // em of air beside a thing, shared between its sides (its line and the boil need it)
const EDGE = 12; // px a line may come to the edge of the screen, no closer

/* the things, drawn in the headline's ink with a 1.6 line; sized in em (cd2.css) */
const S = { stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const PAPER = '#fff';
const GREY = '#e6e6e6';

const Lamp = () => (
  <svg viewBox="4 2.5 35 45" fill="none">
    <rect x="6" y="41.5" width="22" height="4.5" rx="2.25" fill={GREY} {...S} />
    <path d="M17 41.5 L9.5 25 L23 12.5" {...S} />
    <circle cx="9.5" cy="25" r="2.2" fill={PAPER} {...S} />
    <path d="M20.5 8.5 L28 4.5 L36.5 19 L26 22.5 Z" fill={GREY} {...S} />
    <path d="M30 25.5 l2 3.5 M25.5 26.5 l0.5 4 M34.5 23 l3 2.5" {...S} />
  </svg>
);
const Lens = () => (
  <svg viewBox="2 2 36 36" fill="none">
    <circle cx="20" cy="20" r="17" fill={PAPER} {...S} />
    <circle cx="20" cy="20" r="12.5" fill={GREY} {...S} />
    <circle cx="20" cy="20" r="7" fill="currentColor" {...S} />
    <path d="M16.5 16.8 a4.5 4.5 0 0 1 3.5 -2" stroke={PAPER} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M20 3 v3 M37 20 h-3 M20 37 v-3 M3 20 h3" {...S} />
  </svg>
);
const Sticky = () => (
  <svg viewBox="3.5 3 33 35" fill="none">
    <path d="M5 6.5 L34 4.5 L35.5 26 L27 35 L7 36.5 Z" fill="#f6e27a" {...S} />
    <path d="M35.5 26 L28 27 L27 35" fill="#e9cf5c" {...S} />
    <path d="M11 14 q4 -2 8 0 t9 -0.5 M11 20.5 q3 -1.5 6.5 0 t6 0" {...S} />
  </svg>
);
const Pencil = () => (
  <svg viewBox="13.5 0.5 13 46.5" fill="none">
    <rect x="15" y="2" width="10" height="6" rx="1.5" fill={GREY} {...S} />
    <path d="M15 8 h10 M15 10.5 h10" {...S} />
    <path d="M15 10.5 V33 L20 45.5 L25 33 V10.5" fill={PAPER} {...S} />
    <path d="M18.3 10.5 V33 M21.7 10.5 V33 M15 33 h10" {...S} />
    <path d="M18.2 41 L20 45.5 L21.8 41 Z" fill="currentColor" {...S} />
  </svg>
);
const Camera = () => (
  <svg viewBox="3 1.5 49 43" fill="none">
    <circle cx="13" cy="10" r="7.5" fill={PAPER} {...S} />
    <circle cx="13" cy="10" r="2" {...S} />
    <circle cx="28" cy="10" r="7.5" fill={PAPER} {...S} />
    <circle cx="28" cy="10" r="2" {...S} />
    <rect x="4" y="18" width="34" height="19" rx="3" fill={GREY} {...S} />
    <path d="M38 23 L50 18 V37 L38 32 Z" fill={PAPER} {...S} />
    <path d="M14 37 L10 43 M28 37 L32 43" {...S} />
    <circle cx="11" cy="24" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);
const Marker = () => (
  <svg viewBox="11.5 0.5 19.5 47" fill="none">
    <rect x="13" y="2" width="14" height="15" rx="3" fill="currentColor" {...S} />
    <path d="M27 5 h2.5 v9" {...S} />
    <path d="M14 17 H26 V37 L23 40 H17 L14 37 Z" fill={PAPER} {...S} />
    <path d="M14 22 h12 M14 33 h12" {...S} />
    <path d="M17.5 40 L18.5 46 L22.5 44 L22.5 40" fill="currentColor" {...S} />
  </svg>
);

/* h: its height in em, at most the line's (1.3) less a little, so it never reaches into the line above;
   r: its drawing's width over height (the viewBox); low: how far below the baseline it stands (em) */
type Obj = { word: number; char: number; draw: ReactNode; h: number; r: number; low: number; name: string };

/* which letters the things stand in for: one or two a line, kept apart (word index, letter index) */
const OBJECTS: Obj[] = [
  { word: 0, char: 1, draw: <Lamp />, h: 1.2, r: 35 / 45, low: 0.14, name: 'lamp' }, //            the f of "If"
  { word: 6, char: 2, draw: <Lens />, h: 0.98, r: 1, low: 0.04, name: 'lens' }, //                the o of "product"
  { word: 9, char: 0, draw: <Sticky />, h: 1.0, r: 33 / 35, low: 0.04, name: 'sticky' }, //       "a" (had a child)
  { word: 12, char: 6, draw: <Pencil />, h: 1.2, r: 13 / 46.5, low: 0.14, name: 'pencil' }, //    the l of "probably"
  { word: 15, char: 0, draw: <Camera />, h: 1.0, r: 49 / 43, low: 0.12, name: 'camera' }, //      the C of "Creative"
  { word: 18, char: 0, draw: <Marker />, h: 1.2, r: 19.5 / 47, low: 0.14, name: 'marker' }, //    the I of "Identity"
];

/* the sentence in runs (the first two in the soft grey), broken in three lines on desktop as the
   design (cd - 32, 2026-11-26): after "product" and after "probably" */
const LINES: { text: string; soft?: boolean }[] = [
  { text: 'If a film director and a product', soft: true },
  { text: 'marketer had a child,', soft: true },
  { text: 'you’d probably' },
  { text: 'get a Creative Director at Identity Labs.' },
];
const BREAK_AFTER = new Set([0, 2]); // a <br> after these runs (desktop)
const SENTENCE = LINES.map((l) => l.text).join(' ');

// a fixed scramble, so the server and the browser agree (mulberry32)
const rand = (seed: number) => {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const wordAt = (w: number) => BASE + w * STEP;

/* a letter's faces in turn: [ms after the start, face] ..., ending on 0 (Season Mix) */
function schedule(w: number, c: number): [number, number][] {
  const seed = w * 97 + c * 13 + 7;
  const swaps = 2 + Math.floor(rand(seed) * 4); // 2–5 faces before it settles
  const out: [number, number][] = [];
  let t = wordAt(w);
  let face = 1 + Math.floor(rand(seed + 1) * FACES);
  out.push([0, face]);
  for (let k = 1; k <= swaps; k++) {
    t += 160 + Math.round(rand(seed + 10 + k) * 160);
    let next = 1 + Math.floor(rand(seed + 20 + k) * FACES);
    if (next === face) next = (next % FACES) + 1;
    face = k === swaps ? 0 : next;
    out.push([t, face]);
  }
  return out;
}

/* cubic-bezier(x1, y1, x2, y2) as a function of t (0 → 1), so the room follows the thing's own
   scale (cd2.css, cd2-obj) */
const bezier = (x1: number, y1: number, x2: number, y2: number) => (t: number) => {
  const f = (a: number, b: number, u: number) => 3 * a * u * (1 - u) ** 2 + 3 * b * u * u * (1 - u) + u ** 3;
  let lo = 0, hi = 1, u = t;
  for (let n = 0; n < 24; n++) {
    u = (lo + hi) / 2;
    if (f(x1, x2, u) < t) lo = u;
    else hi = u;
  }
  return f(y1, y2, u);
};
const popIn = bezier(0, 0, 0.2, 1); // cd2-obj's first segment, 0 → 13.6%
const shrink = bezier(0.74, 0, 0, 1); // its last, 63.6% → 100%
const POP = OBJ_RUN * 0.136;
// how open the room around a thing is (0 → 1 → 0), ms after its start: as wide as the thing is, but
// never less than its letter needs once it is back (the shrink ends just as the letter pops in)
const openAt = (t: number) =>
  t <= 0 || t >= OBJ_RUN ? 0 : t < POP ? popIn(t / POP) : t < CLOSE_AT ? 1 : 1 - shrink((t - CLOSE_AT) / (OBJ_RUN - CLOSE_AT));

/* Room for the things. Measured before the headline plays (laid out as set, in Season Mix): every
   line's pieces (whole words; letter by letter in a word holding a thing) and how far the line may
   grow each way before it comes within EDGE of the screen's side. Each thing needs its width plus a
   little air, less its letter's; the line gives that by parting at the thing, the pieces before it
   moving left and those after it right, evenly where both sides have the room, more to one side where
   the other is short, and the thing shrinking when the line hasn't the room for it at all. */
type Piece = { el: HTMLElement; shift: { k: number; dx: number }[]; x: number };
function planRoom(h1: HTMLElement) {
  const fs = parseFloat(getComputedStyle(h1).fontSize);
  const scene = (h1.closest('.cd2-scene') as HTMLElement | null) ?? document.body;
  const sb = scene.getBoundingClientRect();
  const [minX, maxX] = [sb.left + EDGE, sb.right - EDGE];
  type Raw = { el: HTMLElement; top: number; x0: number; x1: number; obj?: HTMLElement };
  const raw: Raw[] = [];
  h1.querySelectorAll<HTMLElement>('.cd-w').forEach((word) => {
    const top = word.getBoundingClientRect().top;
    const parts = word.querySelector('.cd2-lo') ? [...word.querySelectorAll<HTMLElement>('.cd2-tw > span')] : [word];
    for (const el of parts) {
      const r = el.getBoundingClientRect();
      raw.push({ el, top, x0: r.left, x1: r.right, obj: el.classList.contains('cd2-lo') ? el.querySelector<HTMLElement>('.cd2-obj')! : undefined });
    }
  });
  const lines: Raw[][] = [];
  for (const p of raw) {
    const line = lines.find((l) => Math.abs(l[0].top - p.top) < fs * 0.5);
    if (line) line.push(p);
    else lines.push([p]);
  }
  const pieces: Piece[] = raw.map((p) => ({ el: p.el, shift: [], x: 0 }));
  const things: { el: HTMLElement; at: number }[] = [];
  for (const line of lines) {
    const objs = line.map((p, i) => ({ p, i })).filter(({ p }) => p.obj);
    if (!objs.length) continue;
    const left = Math.max(0, line[0].x0 - minX), right = Math.max(0, maxX - line[line.length - 1].x1);
    // how far each side of a thing must open: half its width and half the air, less what is already
    // there between its letter's middle and the next piece's edge (a word space counts)
    const half = ROOM_PAD * fs * 0.5;
    const need = objs.map(({ p, i }) => {
      const w = parseFloat(p.obj!.dataset.w!) * fs;
      const cx = (p.x0 + p.x1) / 2;
      const prev = i > 0 ? line[i - 1].x1 : p.x0;
      const next = i < line.length - 1 ? line[i + 1].x0 : p.x1;
      return { l: Math.max(0, w / 2 + half - (cx - prev)), r: Math.max(0, w / 2 + half - (next - cx)), w, lw: p.x1 - p.x0 };
    });
    const sl = need.reduce((s, n) => s + n.l, 0), sr = need.reduce((s, n) => s + n.r, 0);
    // not room enough on the line for all of it: everything opens by the same share, the things shrink to fit
    const fit = sl + sr > left + right && sl + sr > 0 ? (left + right) / (sl + sr) : 1;
    // the whole line slides over when one side would run past the edge
    const c = Math.min(Math.max(0, sl * fit - left), Math.max(0, right - sr * fit));
    objs.forEach(({ p, i }, n) => {
      const o = p.obj!;
      const k = things.length;
      things.push({ el: o, at: parseFloat(o.style.getPropertyValue('--at')) });
      const { l, r, w } = need[n];
      if (fit < 1) {
        const s = Math.max(0.5, fit);
        o.style.width = `${(w * s) / fs}em`;
        o.style.height = `${parseFloat(o.dataset.h!) * s}em`;
        o.style.marginLeft = `${(-w * s) / 2 / fs}em`;
      }
      line.forEach((q, j) => {
        const piece = pieces[raw.indexOf(q)];
        piece.shift.push({ k, dx: (j === i ? 0 : j < i ? -l * fit : r * fit) + c / objs.length });
      });
    });
  }
  return { pieces: pieces.filter((p) => p.shift.length), things };
}

export default function Cd2Title() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const h1 = ref.current;
    if (!h1 || !document.documentElement.classList.contains('cd-js')) return;
    const letters = [...h1.querySelectorAll<HTMLElement>('.cd2-l[data-f]')].map((el) => ({
      el,
      steps: schedule(Number(el.dataset.w), Number(el.dataset.i)),
      k: 0,
    }));
    const room = planRoom(h1);
    const end = Math.max(0, ...room.things.map((o) => o.at + OBJ_RUN));
    let raf = 0, t0 = 0, alive = true;
    // the clock: the CSS animations' own (the last thing's, which runs to the end), so the room and
    // the faces keep step with them even when the browser starts them a few frames late
    let clock: Animation | undefined;
    const tick = (now: number) => {
      if (!alive) return;
      const ct = clock?.currentTime;
      const t = clock ? (ct == null ? 0 : Number(ct)) : now - t0;
      let left = t < end ? 1 : 0;
      // the lines parting round the things and closing back as their letters return
      const open = room.things.map((o) => openAt(t - o.at));
      for (const p of room.pieces) {
        let x = 0;
        for (const { k, dx } of p.shift) x += open[k] * dx;
        x = Math.round(x * 10) / 10;
        if (x !== p.x) { p.x = x; p.el.style.translate = x ? `${x}px 0` : ''; }
      }
      for (const l of letters) {
        while (l.k + 1 < l.steps.length && l.steps[l.k + 1][0] <= t) {
          l.k++;
          const f = l.steps[l.k][1];
          if (f) l.el.dataset.f = String(f);
          else delete l.el.dataset.f;
        }
        if (l.k + 1 < l.steps.length) left++;
      }
      if (left) raf = requestAnimationFrame(tick);
    };
    const go = () => {
      if (!alive) return;
      h1.classList.add('cd2-go');
      clock = room.things.at(-1)?.el.getAnimations().find((a) => (a as CSSAnimation).animationName === 'cd2-obj');
      raf = requestAnimationFrame((now) => { t0 = now; tick(now); });
    };
    // as Jitter's: once the faces are in, so the first frame is drawn in them
    let started = false;
    const once = () => { if (!started) { started = true; go(); } };
    document.fonts.ready.then(once);
    const fallback = window.setTimeout(once, 1200);
    return () => { alive = false; cancelAnimationFrame(raf); window.clearTimeout(fallback); };
  }, []);

  let w = -1;
  return (
    <h1 className="cd-title cd2-title" ref={ref}>
      <span className="sr-only">{SENTENCE}</span>
      <span aria-hidden="true">
        {LINES.map((line, li) => {
          const words = line.text.split(' ');
          const body = words.map((word, k) => {
            w++;
            const wi = w;
            return (
              <Fragment key={k}>
                <span className="cd-w">
                  <span className="cd2-tw" style={{ '--dl': `${wordAt(wi)}ms` } as CSSProperties}>
                    {[...word].map((ch, ci, all) => {
                      const hasObj = OBJECTS.some((o) => o.word === wi && o.char < all.length);
                      const obj = OBJECTS.find((o) => o.word === wi && o.char === ci);
                      if (obj) {
                        const at = wordAt(wi) + OBJ_IN;
                        return (
                          <span key={ci} className="cd2-lo">
                            <span className="cd2-lc" style={{ '--pop': `${at + POP_AT}ms` } as CSSProperties}>{ch}</span>
                            <span
                              className={`cd2-obj cd2-obj-${obj.name}`}
                              data-w={obj.h * obj.r}
                              data-h={obj.h}
                              style={{ '--at': `${at}ms`, '--run': `${OBJ_RUN}ms`, width: `${obj.h * obj.r}em`, height: `${obj.h}em`, marginLeft: `${(-obj.h * obj.r) / 2}em`, bottom: `${-obj.low}em` } as CSSProperties}
                            >
                              {obj.draw}
                            </span>
                          </span>
                        );
                      }
                      // punctuation stays as set; letters take their first face from the schedule
                      const first = /[\p{L}]/u.test(ch) ? schedule(wi, ci)[0][1] : 0;
                      return (
                        <span key={ci} className={hasObj ? 'cd2-l cd2-lb' : 'cd2-l'} data-ch={ch} data-w={wi} data-i={ci} data-f={first || undefined}>
                          {ch}
                        </span>
                      );
                    })}
                  </span>
                </span>
                {k < words.length - 1 ? ' ' : null}
              </Fragment>
            );
          });
          return (
            <Fragment key={li}>
              <span className={line.soft ? 'cd-soft' : undefined}>{body}</span>
              {BREAK_AFTER.has(li) ? <br className="cd-br" /> : null}
              {li < LINES.length - 1 ? ' ' : null}
            </Fragment>
          );
        })}
      </span>
    </h1>
  );
}
