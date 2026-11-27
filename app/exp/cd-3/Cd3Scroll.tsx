'use client';

import { useEffect } from 'react';

/* Scroll progress for the page's scrubbed effects (cd3.css). Each element with data-p="a b" gets --p,
   0 → 1 as its top moves from a to b (fractions of the screen's height from the top), clamped; and with
   data-r="a b" a second one, --r, the same way. CSS does the rest (the words filling from grey to ink, the
   film opening). Lenis drives the real window scroll, so the scroll event is enough; one read and one
   write per element a frame, only while scrolling. Not for reduced motion: then --p stays at its rest (1). */
export default function Cd3Scroll() {
  useEffect(() => {
    if (!document.documentElement.classList.contains('cd-js')) return;
    const parse = (v?: string) => (v ? v.split(' ').map(Number) as [number, number] : null);
    const items = [...document.querySelectorAll<HTMLElement>('.cd3 [data-p], .cd3 [data-r]')].map((el) => ({
      el, p: parse(el.dataset.p), r: parse(el.dataset.r),
    }));
    let raf = 0;
    const prog = (top: number, h: number, [a, b]: [number, number]) =>
      Math.min(1, Math.max(0, (top - a * h) / (b * h - a * h)));
    const tick = () => {
      raf = 0;
      const h = window.innerHeight;
      for (const { el, p, r } of items) {
        const top = el.getBoundingClientRect().top;
        if (p) el.style.setProperty('--p', prog(top, h, p).toFixed(4));
        if (r) el.style.setProperty('--r', prog(top, h, r).toFixed(4));
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
