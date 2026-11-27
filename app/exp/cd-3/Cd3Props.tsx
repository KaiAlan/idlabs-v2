'use client';

import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import HULLS from './props.json';

/* A creative director's things — a camera, a clapperboard, a fashion tag, a stack of books, dice, a
   mixtape — dropped as rigid bodies (Matter.js) onto the headline, each to its own place along the first
   line, with room between them (the cd-38 frame).
   The fall is part of the headline's entrance: its words rise into their lines left to right (cd.css
   [data-reveal], 300ms + 34ms a word), and each thing drops straight down from just above the screen so
   that it lands just after the word under it has risen, one after another left to right, ~140ms apart.
   The word it lands on takes the weight: it dips a little and springs back (more for a harder landing),
   so the type and the things read as one gesture. Each word of the headline is a solid block from its
   letters' top (caps and ascenders, or the x-height for words without them); the grid's content edges
   and the screen's foot close the box. Each thing collides by its outline (the convex hull of its
   picture, props.json, made from the cutouts' alpha). The pictures are DOM <img>s placed from their
   bodies every frame; the loop stops once everything is asleep. With a mouse they can be picked up and
   thrown (and the words take those landings too). Reduced motion: the fall is run ahead in one go and
   they appear at rest. On a resize (width) they are re-dropped the same way, already at rest. */

type Prop = { id: keyof typeof HULLS; src: string; w: number; at: number };

/* Widths in the frame's pixels at 1280 wide, scaled with the window, true to each other (the real
   things' sizes compressed so the small ones still read). at: the centre of its place along the
   headline (a fraction of its width), left to right as they fall. */
const PROPS: Prop[] = [
  { id: 'camera', src: '/assets/cd/props/camera.png', w: 100, at: 0.07 },
  { id: 'clapper', src: '/assets/cd/props/clapper.png', w: 140, at: 0.24 },
  { id: 'tag', src: '/assets/cd/props/tag.png', w: 64, at: 0.42 },
  { id: 'books', src: '/assets/cd/props/books.png', w: 112, at: 0.57 },
  { id: 'dice', src: '/assets/cd/props/dice.png', w: 46, at: 0.73 },
  { id: 'mixtape', src: '/assets/cd/props/mixtape.png', w: 86, at: 0.88 },
];

// the headline's word entrance (Cd3Page: d0(300, 34)); a word has mostly risen ~420ms into its 1100ms
const WORD_START = 300, WORD_STEP = 34, WORD_UP = 420;
const LAND_GAP = 140; // ms at least between two landings

/* The turn that sets a thing on its natural bottom: the photos are a little tilted, so it starts turned
   to make its bottom edge (the lowest long edge of its outline) level, and lands lying as it was shot
   rather than rolling up onto a side. */
function level(v: Matter.Vector[]) {
  const W = Math.max(...v.map((p) => p.x)) - Math.min(...v.map((p) => p.x));
  let best = 0, low = -Infinity;
  v.forEach((a, i) => {
    const b = v[(i + 1) % v.length];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len < W * 0.3) return;
    const y = (a.y + b.y) / 2;
    if (y > low) { low = y; best = Math.atan2(b.y - a.y, b.x - a.x); }
  });
  // an edge's direction may run either way: the smaller turn that levels it
  if (best > Math.PI / 2) best -= Math.PI; else if (best < -Math.PI / 2) best += Math.PI;
  return -best;
}
const STEP = 1000 / 60;
// the fall is the same on every visit (a seeded random, chosen for how the things land; ?seed= to try others)
const SEED = 3;
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export default function Cd3Props() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layer.current;
    const wrap = el?.parentElement;
    const section = wrap?.closest('section');
    const h1 = wrap?.querySelector('h1');
    if (!el || !wrap || !section || !h1) return;
    const imgs = [...el.querySelectorAll<HTMLImageElement>('img')];
    const animate = document.documentElement.classList.contains('cd-js');
    const { Engine, Events, Bodies, Body, Composite, Constraint, Vertices, Sleeping } = Matter;

    let engine: Matter.Engine;
    let bodies: { body: Matter.Body; off: Matter.Vector; w: number; h: number; img: HTMLImageElement }[] = [];
    let raf = 0, last = 0, acc = 0, running = false;
    const timers: number[] = [];
    let grab: Matter.Constraint | null = null;
    let stopWatch = () => {};

    const draw = () => {
      for (const { body, off, w, h, img } of bodies) {
        const c = Math.cos(body.angle), s = Math.sin(body.angle);
        const x = body.position.x + off.x * c - off.y * s;
        const y = body.position.y + off.x * s + off.y * c;
        img.style.transform = `translate(${(x - w / 2).toFixed(2)}px, ${(y - h / 2).toFixed(2)}px) rotate(${body.angle.toFixed(4)}rad)`;
      }
    };
    const frame = (t: number) => {
      acc += Math.min(t - (last || t), 100);
      last = t;
      while (acc >= STEP) { Engine.update(engine, STEP); acc -= STEP; }
      draw();
      const settled = !grab && bodies.length === PROPS.length && bodies.every((b) => b.body.isSleeping);
      if (settled) { running = false; return; }
      raf = requestAnimationFrame(frame);
    };
    const run = () => { if (!running) { running = true; last = 0; acc = 0; raf = requestAnimationFrame(frame); } };

    const build = (instant: boolean) => {
      cancelAnimationFrame(raf); running = false;
      timers.splice(0).forEach(clearTimeout);
      stopWatch();
      if (engine) { Composite.clear(engine.world, false); Engine.clear(engine); }
      const seed = Number(new URLSearchParams(location.search).get('seed')) || SEED;
      const random = rng(seed);
      (Matter.Common as unknown as { _seed: number })._seed = seed; // Matter's own random too
      engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = 2.4; // a quick, heavy fall
      bodies = [];

      const wr = wrap.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const k = Math.max(vw / 1280, 0.5);
      // the box: the grid's content edges (the margins stay clear), the first screen's foot, all in the
      // wrapper's frame
      const top = -(wrap.offsetTop - section.offsetTop);
      const floor = section.offsetHeight + top;
      const left = 0, right = wr.width;
      const T = 400;
      const walls = [
        Bodies.rectangle((left + right) / 2, floor + T / 2, right - left + 2 * T, T, { isStatic: true }),
        Bodies.rectangle(left - T / 2, top, T, (floor - top) * 4, { isStatic: true }),
        Bodies.rectangle(right + T / 2, top, T, (floor - top) * 4, { isStatic: true }),
      ];
      // the words: solid from their letters' top down
      const cs = getComputedStyle(h1);
      const fs = parseFloat(cs.fontSize);
      // the letters' real tops, from the font: where the baseline sits in the line, and how far each word's
      // ink rises above it; the surfaces stand a little clear of them, so nothing ever touches the type
      const ctx = document.createElement('canvas').getContext('2d')!;
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const fm = ctx.measureText('Hg');
      const lh = parseFloat(cs.lineHeight) || fs * 1.17;
      const base = (lh - (fm.fontBoundingBoxAscent + fm.fontBoundingBoxDescent)) / 2 + fm.fontBoundingBoxAscent;
      const GAP = fs * 0.09;
      const wordEls = [...h1.querySelectorAll<HTMLElement>('.cd-w')];
      const wordOf = new Map<number, HTMLElement>();
      const words = wordEls.map((w) => {
        const r = w.getBoundingClientRect();
        const ink = ctx.measureText(w.textContent ?? '').actualBoundingBoxAscent;
        const y0 = r.top - wr.top + base - ink - GAP;
        const y1 = r.top - wr.top + base;
        const b = Bodies.rectangle(r.left - wr.left + r.width / 2, (y0 + y1) / 2, r.width, y1 - y0, { isStatic: true, chamfer: { radius: Math.min(6, fs * 0.08) }, friction: 0.9, frictionStatic: 1 });
        wordOf.set(b.id, w);
        return b;
      });
      // the first line as one flat shelf at its letters' cap height, so a wide thing doesn't catch on the
      // step from a tall word to a short one ("a") and tip up on end
      const firstTop = words[0].bounds.min.y;
      const line1 = words.map((b, j) => ({ b, j, el: wordEls[j] })).filter(({ b }) => b.bounds.min.y < firstTop + fs * 0.5);
      const capTop = Math.min(...line1.map(({ b }) => b.bounds.min.y));
      const x0s = line1[0].b.bounds.min.x, x1s = line1[line1.length - 1].b.bounds.max.x;
      const shelf = Bodies.rectangle((x0s + x1s) / 2, capTop + fs * 0.3, x1s - x0s, fs * 0.6, { isStatic: true, chamfer: { radius: Math.min(6, fs * 0.08) }, friction: 0.9, frictionStatic: 1 });
      const rest = words.filter((_, j) => !line1.some((l) => l.j === j));
      Composite.add(engine.world, [...walls, shelf, ...rest]);
      // which word of the first line a landing at x is on
      const wordAt = (x: number) => line1.reduce((a, c) => (Math.abs(c.b.position.x - x) < Math.abs(a.b.position.x - x) ? c : a));

      const make = (i: number) => {
        const p = PROPS[i], img = imgs[i];
        const w = p.w * k;
        const hull = HULLS[p.id];
        const h = (w * hull.h) / hull.w;
        const verts = hull.hull.map(([x, y]) => ({ x: x * w, y: y * h }));
        const centre = Vertices.centre(verts);
        const off = { x: w / 2 - centre.x, y: h / 2 - centre.y };
        const tx = Math.min(right - w / 2, Math.max(left + w / 2, wr.width * p.at + (random() - 0.5) * 12 * k));
        // the word under it (nearest along the first line)
        const under = wordAt(tx);
        const y0 = top - h - 10;
        const body = Bodies.fromVertices(tx, y0, [verts], {
          restitution: 0.06, friction: 0.8, frictionStatic: 1, frictionAir: 0.018, density: 0.008,
          angle: level(verts) + (random() - 0.5) * 0.12, sleepThreshold: 50,
        });
        // how long the fall takes, stepped as the engine will (gravity, the air's drag)
        const g = engine.gravity.y * engine.gravity.scale * STEP * STEP, dist = capTop - (y0 + h / 2);
        let y = 0, v = 0, n = 0;
        while (y < dist && n < 600) { v = (v + g) * (1 - body.frictionAir); y += v; n++; }
        return { i, p, img, w, h, off, body, word: under.j, fall: n * STEP };
      };
      const add = (m: ReturnType<typeof make>) => {
        Body.setVelocity(m.body, { x: (random() - 0.5) * 0.6, y: 0 });
        Body.setAngularVelocity(m.body, (random() - 0.5) * 0.05);
        Composite.add(engine.world, m.body);
        bodies.push({ body: m.body, off: m.off, w: m.w, h: m.h, img: m.img });
        m.img.style.width = `${m.w}px`; m.img.style.height = `${m.h}px`;
        m.img.dataset.on = '';
      };
      const all = PROPS.map((_, i) => make(i));

      if (instant) {
        all.forEach(add);
        for (let s = 0; s < 900; s++) Engine.update(engine, STEP);
        draw();
        return;
      }

      // the word it lands on dips under the weight and springs back
      const dipped = new Map<HTMLElement, number>();
      Events.on(engine, 'collisionStart', (e) => {
        for (const { bodyA, bodyB } of e.pairs) {
          const onShelf = bodyA === shelf || bodyB === shelf;
          const thing = bodyA.isStatic ? bodyB : bodyA;
          const word = onShelf ? wordAt(thing.position.x).el : wordOf.get(bodyA.id) ?? wordOf.get(bodyB.id);
          if (!word || thing.isStatic) continue;
          const hit = Math.abs(thing.velocity.y);
          const now = performance.now();
          if (hit < 2 || now - (dipped.get(word) ?? 0) < 250) continue;
          dipped.set(word, now);
          const d = Math.min(fs * 0.07, hit * 0.5 * k);
          word.animate(
            [{ transform: 'none' }, { transform: `translateY(${d.toFixed(1)}px)`, offset: 0.22 }, { transform: `translateY(${(-d * 0.22).toFixed(1)}px)`, offset: 0.58 }, { transform: 'none' }],
            { duration: 520, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
          );
        }
      });

      // land in the headline's rhythm: just after the word under it has risen, left to right, apart; the
      // clock starts when the headline's entrance does (CdReveal sets its data-in)
      const schedule = () => {
        let lastLand = 0;
        for (const m of all) {
          const land = Math.max(WORD_START + m.word * WORD_STEP + WORD_UP, lastLand + LAND_GAP);
          lastLand = land;
          timers.push(window.setTimeout(() => { add(m); run(); }, Math.max(0, land - m.fall)));
        }
      };
      if (h1.hasAttribute('data-in')) schedule();
      else {
        const mo = new MutationObserver(() => { if (h1.hasAttribute('data-in')) { mo.disconnect(); schedule(); } });
        mo.observe(h1, { attributes: true, attributeFilter: ['data-in'] });
        stopWatch = () => mo.disconnect();
      }
    };

    imgs.forEach((img) => { delete img.dataset.on; });
    // after the fonts, so the letters are measured in Season Mix
    let alive = true;
    document.fonts.ready.then(() => { if (alive) build(!animate); });

    // re-drop, at rest, when the width changes
    let lastW = document.documentElement.clientWidth, rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        const w = document.documentElement.clientWidth;
        if (w !== lastW) { lastW = w; build(true); }
      }, 200);
    };
    window.addEventListener('resize', onResize);

    // pick up and throw (mouse)
    const at = (e: PointerEvent) => { const r = wrap.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const i = imgs.indexOf(e.target as HTMLImageElement);
      const b = bodies.find((x) => x.img === imgs[i]);
      if (!b) return;
      e.preventDefault();
      const p = at(e);
      // held where it was picked up (Matter turns pointB with the body)
      grab = Constraint.create({ pointA: p, bodyB: b.body, pointB: Matter.Vector.sub(p, b.body.position), stiffness: 0.06, damping: 0.25, length: 0 });
      Composite.add(engine.world, grab);
      Sleeping.set(b.body, false);
      el.dataset.grabbing = '';
      run();
    };
    const move = (e: PointerEvent) => {
      if (!grab) return;
      grab.pointA = at(e);
    };
    const up = () => {
      if (!grab) return;
      Composite.remove(engine.world, grab);
      // let go with weight: a throw carries only so far, and only so much spin
      const b = grab.bodyB!, v = b.velocity, sp = Math.hypot(v.x, v.y), MAX = 9;
      if (sp > MAX) Body.setVelocity(b, { x: (v.x / sp) * MAX, y: (v.y / sp) * MAX });
      Body.setAngularVelocity(b, Math.max(-0.12, Math.min(0.12, b.angularVelocity)));
      grab = null;
      delete el.dataset.grabbing;
      run();
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      stopWatch();
      window.clearTimeout(rt);
      window.removeEventListener('resize', onResize);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      if (engine) Engine.clear(engine);
    };
  }, []);

  return (
    <div className="cd3-props" ref={layer} aria-hidden="true">
      {PROPS.map((p) => <img key={p.id} src={p.src} alt="" draggable={false} />)}
    </div>
  );
}
