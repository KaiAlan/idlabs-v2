'use client';

import { useEffect } from 'react';

/* Plays the page's text in (cd.css, [data-reveal]): each block gets data-in when it comes into view,
   once. The hero's blocks are in view at load, so they play on every load, in the order their delays
   set; the rest play as the page reaches them. Nothing to do without the html.cd-js class (set before
   paint by the page's inline script, and not for reduced motion), as then nothing was hidden. */
export default function CdReveal() {
  useEffect(() => {
    if (!document.documentElement.classList.contains('cd-js')) return;
    // blocks inside [data-reveal-own] are played by their own section (/exp/cd-2's stage, Cd2Stage)
    const blocks = [...document.querySelectorAll<HTMLElement>('.cd [data-reveal]')].filter((b) => !b.closest('[data-reveal-own]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.in = '';
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, []);
  return null;
}
