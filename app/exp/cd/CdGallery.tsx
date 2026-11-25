'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import LoopVideo from './LoopVideo';

/* The gallery of behind-the-scenes loops, with shopify.design's entrance (its hero grid, read from its
   code on 2026-11-25). Each card waits off its place: pushed out sideways by column (−1, 0, +1 × 350px),
   down by 300px + 100px a row, at 1.5×, invisible. When its slot (the untransformed box around it)
   enters the screen, it plays one tween home: opacity in over the first 5%, the move and scale on an
   expo-out curve over 1.5–2.1s (the length varies card to card, so neighbours don't move in step).
   Cards already on screen when the page opens wait 0.2s + 0.06s a column + 0.2s a row; later ones go
   at once, so a row coming up together settles together. Two columns under 768px wide (±80px, 120px +
   40px a row, 1.15×). Cards go to the shortest column, as there. Reduced motion: no entrance. */

export type Clip = [slug: string, label: string, ratio: string];

const aspect = (r: string) => { const [w, h] = r.split('/').map(Number); return w / h; };

// the card's start, after shopify.design's B5(column, row, columns)
function start(n: number, e: number, cols: number): CSSProperties {
  const r = n * 7 + e * 13;
  const side = cols === 1 ? 0 : (n / (cols - 1)) * 2 - 1;
  const small = cols <= 2;
  const x = small ? 80 : 350, y = small ? 120 : 300, step = small ? 40 : 100;
  return {
    '--card-delay': `${(0.2 + n * 0.06 + e * 0.2).toFixed(2)}s`,
    '--card-x': `${side * x}px`,
    '--card-y': `${y + e * step}px`,
    '--card-s': small ? 1.15 : 1.5,
    '--card-dur': `${(1.5 + (r % 4) * 0.2).toFixed(1)}s`,
  } as CSSProperties;
}

// each clip to the shortest column so far (heights in widths: 1 / aspect)
function columns(clips: Clip[], n: number) {
  const cols = Array.from({ length: n }, () => ({ h: 0, items: [] as Clip[] }));
  for (const c of clips) {
    const k = cols.reduce((best, col, i) => (col.h < cols[best].h ? i : best), 0);
    cols[k].items.push(c);
    cols[k].h += 1 / aspect(c[2]);
  }
  return cols.map((c) => c.items);
}

export default function CdGallery({ clips }: { clips: Clip[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(3);

  // two columns on narrow screens
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => { if (e.contentRect.width) setN(e.contentRect.width < 700 ? 2 : 3); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the entrances (once each; re-armed only if the columns change before a card has come in)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const cards = [...el.querySelectorAll<HTMLElement>('.cd-card')];
    if (!document.documentElement.classList.contains('cd-js')) {
      cards.forEach((c) => c.classList.add('card-static'));
      return;
    }
    const play = (c: HTMLElement) => {
      c.classList.add('card-in');
      c.addEventListener('animationend', () => { c.classList.remove('card-in'); c.classList.add('card-static'); }, { once: true });
    };
    const offs: (() => void)[] = [];
    for (const c of cards) {
      if (c.classList.contains('card-static') || c.classList.contains('card-in')) continue;
      let first = true;
      const io = new IntersectionObserver(([e]) => {
        if (first) {
          first = false;
          if (e.isIntersecting) { io.disconnect(); play(c); } // on screen at load: its stagger delay
          return;
        }
        if (e.isIntersecting) { io.disconnect(); c.style.setProperty('--card-delay', '0s'); play(c); }
      }, { threshold: 0 });
      io.observe(c.parentElement ?? c);
      offs.push(() => io.disconnect());
    }
    return () => offs.forEach((f) => f());
  }, [n]);

  return (
    <div className="cd-gallery" ref={root} style={{ '--cols': n } as CSSProperties}>
      {columns(clips, n).map((col, ci) => (
        <div className="cd-gcol" key={ci}>
          {col.map(([slug, label, ratio], ri) => (
            <div className="cd-slot" key={slug}>
              <div className="cd-card" style={{ ...start(ci, ri, n), '--ar': ratio } as CSSProperties}>
                <LoopVideo className="cd-video" src={`/assets/cd/${slug}.mp4`} poster={`/assets/cd/${slug}.jpg`} label={label} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
