'use client';

import { useEffect } from 'react';

/* /exp/careers-2's motion, following the scroll (scrubbed, as /exp/cd-2's Cd2Stage): the tall section
   (.c2-stage) pins one screen on which the pitch's scenes take turns. The scroll through it (0 → 1) is
   cut in equal parts, one per scene; in its part a scene comes in over the first IN, holds, and goes
   out over the last OUT, its pieces (words, the figure) each taking their own slice, so the text arrives
   from below and leaves upward as a wave. The scene blurs slightly while it changes and drifts up the
   whole time, so the scroll always moves something. A counter and a rule show how far through it is.
   After the stage, the sections rise in once as they enter the screen.
   Reduced motion: no pinning, the scenes stack as plain sections (careers2.css). */

const IN = 0.34;
const OUT = 0.3;
const STAGGER = 0.5;
const RISE = 48;
const LIFT = 36;
const BLUR = 8;
const DRIFT = 60;
const LEAD = 0.07; // share of a scene's part by which the next one starts early

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;
const piece = (t: number, i: number, n: number) => clamp(t * (1 + STAGGER) - (n > 1 ? (i / (n - 1)) * STAGGER : 0));

export default function CareersStage() {
  useEffect(() => {
    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).dataset.in = ''; io.unobserve(e.target); } }),
      { rootMargin: '0px 0px -12% 0px' },
    );
    document.querySelectorAll('[data-rise]').forEach((el) => io.observe(el));

    const section = document.querySelector<HTMLElement>('.c2-stage');
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => io.disconnect();
    root.classList.add('c2-js');

    const scenes = [...section.querySelectorAll<HTMLElement>('.c2-scene')].map((el) => ({
      el,
      parts: [...el.querySelectorAll<HTMLElement>('.c2-w')],
    }));
    const count = section.querySelector<HTMLElement>('.c2-count b');
    const bar = section.querySelector<HTMLElement>('.c2-bar i');
    const n = scenes.length;

    const draw = () => {
      const r = section.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = run > 0 ? clamp(-r.top / run) : 0;
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      if (count) count.textContent = String(Math.min(n, Math.floor(p * n) + 1)).padStart(2, '0');
      scenes.forEach(({ el, parts }, k) => {
        const t = p * n - k;
        const e = k === 0 ? 1 : clamp((t + LEAD) / IN); // a little before its turn, so the screen is never empty
        const x = k === n - 1 ? 0 : clamp((t - (1 - OUT)) / OUT);
        const visible = e > 0 && x < 1;
        el.style.visibility = visible ? 'visible' : 'hidden';
        if (!visible) return;
        el.style.opacity = '1';
        const change = Math.max(1 - easeOut(e), easeIn(x));
        el.style.filter = change > 0.002 ? `blur(${(BLUR * change).toFixed(2)}px)` : 'none';
        const drift = DRIFT * ((k === 0 ? 0 : 0.5) - Math.min(t, 1.2));
        el.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0)`;
        const m = parts.length;
        parts.forEach((part, i) => {
          const pi = easeOut(piece(e, i, m));
          const po = easeIn(piece(x, i, m));
          part.style.opacity = (pi * (1 - po)).toFixed(3);
          part.style.transform = `translate3d(0, ${(RISE * (1 - pi) - LIFT * po).toFixed(1)}px, 0)`;
        });
      });
    };

    let raf = 0;
    const ask = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };
    draw();
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', ask);
      window.removeEventListener('resize', ask);
      root.classList.remove('c2-js');
    };
  }, []);
  return null;
}
