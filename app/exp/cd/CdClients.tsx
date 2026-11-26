'use client';

import { useRef, useState, type CSSProperties } from 'react';

/* The clients by name (Season Mix, 48px; or the headline's 35px, ?clients=title). Hovering one turns it into its logo and blurs the others
   (as on venice.inc).
   Which name is active is tracked over the whole list, not per name: crossing the gap between two
   names (or rows) keeps the last one, so nothing flashes back on the way to the next; leaving the
   list lets go after a beat. */

export type Client = { name: string; src: string; ratio: number; boost?: number };

const AREA = 7200; // ink area of each logo (px²) at the 48px names: a little over a name's, so a logo reads as big as the type (as on venice.inc)
// height for that area, in em of the names' size, so the logos scale with the type (the title-size variant)
const fit = (ratio: number, boost = 1) => (Math.sqrt(AREA / ratio) * boost) / 48;
const LEAVE = 140; // ms before the list lets go once the pointer is off it

/* The shown logo "boils" as venice.inc's marks do: its edges wobble a little, redrawn about eight
   times a second, the shape staying put. Four displacement filters, the same noise with a different
   seed each, swapped in turn by a stepped animation (cd.css, cd-boil). */
const SEEDS = [1, 7, 13, 21];
const Boil = () => (
  <svg className="cd-boil-defs" width="0" height="0" aria-hidden="true" focusable="false">
    {SEEDS.map((seed, k) => (
      <filter key={seed} id={`cd-boil-${k}`} x="-10%" y="-20%" width="120%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    ))}
  </svg>
);

export default function CdClients({ clients }: { clients: Client[] }) {
  const [on, setOn] = useState<number | null>(null);
  const leave = useRef<number | undefined>(undefined);

  const pick = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(leave.current);
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-i]');
    if (li) setOn(Number(li.dataset.i)); // over a gap: keep the last one
  };
  const out = () => {
    window.clearTimeout(leave.current);
    leave.current = window.setTimeout(() => setOn(null), LEAVE);
  };

  return (
    <>
    <Boil />
    <ul className="cd-col cd-names" aria-label="Clients" data-reveal="rise" style={{ '--d0': '1450ms' } as CSSProperties} data-active={on !== null ? '' : undefined} onPointerMove={pick} onPointerLeave={out}>
      {clients.map((c, i) => {
        const h = fit(c.ratio, c.boost);
        return (
          <li key={c.name} data-i={i} data-on={on === i ? '' : undefined} style={{ '--i': i } as CSSProperties}>
            <span className="cd-name">{c.name}</span>
            {/* the box (sized, placed, boiled) round the ink (the logo as a mask): a filter runs before
                the mask on one element, so the wobble would be cut back to the still shape */}
            <span
              className="cd-logo"
              aria-hidden="true"
              style={{ '--src': `url('${c.src}')`, width: `${(c.ratio * h).toFixed(3)}em`, height: `${h.toFixed(3)}em` } as CSSProperties}
            ><span className="cd-logo-ink" /></span>
            {i < clients.length - 1 && <span className="cd-comma" aria-hidden="true">,</span>}
          </li>
        );
      })}
    </ul>
    </>
  );
}
