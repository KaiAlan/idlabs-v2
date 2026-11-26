'use client';

import { useEffect } from 'react';

/* The first screen shows exactly two rows of the clients (names or logos, whichever the tabs show;
   three for the names at the headline's size, ?clients=title).
   cd.css places them with measured constants for first paint; this measures where the second row
   really ends (once the fonts are in, and again on resize or a tab switch) and sets the space above
   the headline so it ends just above the screen's foot: 40px for the logos; 20px for the names, whose
   72px line boxes have room above the letters, so the third row's letters stay out of view. Never
   less than the CSS floor above the headline. */

const FLOOR = () => (window.innerWidth <= 640 ? 110 : 140);

export default function CdFit() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.cd-hero');
    if (!hero) return;
    let raf = 0;
    const fit = () => {
      raf = 0;
      const mode = document.documentElement.dataset.cdClients;
      const logos = mode === 'logos';
      const shown = mode === 'title' ? 3 : 2; // rows on the first screen
      const items = [...document.querySelectorAll<HTMLElement>(logos ? '.cd-home-clients .hvc-cell' : '.cd-names > li')];
      if (!items.length) return;
      // the rows, by top edge; the second row's foot. Layout positions (offsetTop up the chain), not
      // the boxes on screen: those are still being moved by the entrance animations (rise, translate)
      const pageTop = (e: HTMLElement) => { let y = 0; for (let n: HTMLElement | null = e; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop; return y; };
      const rows = items.map((e) => { const t = pageTop(e); return { t: Math.round(t), b: t + e.offsetHeight }; });
      const tops = [...new Set(rows.map((r) => r.t))].sort((a, b) => a - b);
      if (tops.length < shown) return;
      const second = Math.max(...rows.filter((r) => r.t === tops[shown - 1]).map((r) => r.b)); // the last shown row's foot
      // logos: 40px under the second row. Names: their line boxes have room above and below the letters,
      // so place the second row's box so the third row's letters start just past the screen's foot
      let target = window.innerHeight - 40;
      if (!logos) {
        const li = items[0];
        const r = document.createRange();
        r.selectNodeContents(li.querySelector('.cd-name') ?? li);
        const above = r.getBoundingClientRect().top - li.getBoundingClientRect().top; // letters' top in the line
        target = window.innerHeight - above + 2;
      }
      const now = parseFloat(getComputedStyle(hero).paddingTop) || 0;
      const next = Math.max(FLOOR(), now + (target - second));
      if (Math.abs(next - now) > 0.5) hero.style.paddingTop = `${next.toFixed(1)}px`;
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(fit); };
    ask();
    document.fonts?.ready.then(ask);
    window.addEventListener('resize', ask);
    const mo = new MutationObserver(ask);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-cd-clients'] });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', ask); mo.disconnect(); };
  }, []);
  return null;
}
