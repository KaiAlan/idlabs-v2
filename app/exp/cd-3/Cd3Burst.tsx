'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import CdGallery, { type Clip } from '../cd/CdGallery';
import LoopVideo from '../cd/LoopVideo';

/* The gallery as a collage bursting out of one card (2026-11-27), after a reference reel (Base 44's
   intro): a small card in the middle flicks through pictures, grows, and the rest slide out from
   behind it into a tight collage round it, ring by ring, hold, then fold back behind it, outer ones
   first. Here over the whole screen (the lead scrolls past first), driven by the scroll while it is
   pinned. Its last screen overlaps the next section (margin-bottom: -100vh, cd3.css), so the
   clapperboard rises in under the collage and comes to rest mid-screen as the cards fold in; the
   middle card then shrinks away off it:
     0    – 0.2   the middle card flicks through the clips' posters, growing as it goes
     0.2  – 0.52  the cards come out, inner ring first (each over a stretch, expo-out)
     0.52 – 0.7   the collage holds
     0.7  – 0.92  they fold back behind it, outer ring first
     0.92 – 0.99  the middle card shrinks away, leaving the clapperboard
   Positions are in units of the middle card's height (--c), worked out for the room under the lead.
   The middle and the two inner rings are clips (playing while on screen); the small outer ones posters.
   Phones, reduced motion: /exp/cd's gallery (.cd3-reel-flat). */

// slug, x, y (card centre from the middle card's, + down), height, ring
type Slot = [slug: string, x: number, y: number, h: number, ring: 1 | 2 | 3];
const CENTRE = 'matic-studio';
const SLOTS: Slot[] = [
  ['pocketfm-pitch', -0.82, 0.12, 1, 1],
  ['akai-bts', 0.97, -0.05, 0.8, 1],
  ['lovable-200m', 0.15, -0.7, 0.5, 1],
  ['fishaudio-set-wide', -0.1, 0.77, 0.62, 1],
  ['wispr-bts', -1.55, -0.62, 0.75, 2],
  ['matic-zoom', 1.75, -0.78, 0.55, 2],
  ['matic-spill', -1.45, 0.78, 0.8, 2],
  ['fishaudio-set', 1.35, 0.8, 0.72, 2],
  ['matic-lab', -2.35, 0.05, 0.5, 2],
  ['playerzero-red', 2.45, 0, 0.6, 2],
  ['pocketfm-phone', -0.55, -1.45, 0.3, 3],
  ['playerzero-rally', -2.55, -1, 0.38, 3],
  ['wispr-opening', 0.95, -1.5, 0.3, 3],
  ['matic-bts', 0.55, 1.55, 0.32, 3],
  ['fishaudio-rig', -2.45, 1.2, 0.3, 3],
  ['playerzero-grey', 2.6, 1.35, 0.34, 3],
];
const EXTENT_X = 2.9, EXTENT_Y = 1.75; // the collage's half-size, in --c
const LAND = 0.86; // where in the pinned stretch the clapperboard below has come to rest mid-screen
const FLICK = ['wispr-bts', 'pocketfm-phone', 'matic-zoom', 'playerzero-red', 'lovable-200m', 'akai-bts', 'fishaudio-rig', 'matic-lab', 'pocketfm-pitch'];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const cubicIn = (t: number) => t * t * t;

// the order they come out: by ring, then round the clock
const ORDER = SLOTS.map((s, i) => [i, s[4] * 10 + (Math.atan2(s[2], s[1]) + Math.PI) / (2 * Math.PI)] as const)
  .sort((a, b) => a[1] - b[1]).map(([i]) => i);
const RANK = SLOTS.map((_, i) => ORDER.indexOf(i));

export default function Cd3Burst({ clips, head }: { clips: Clip[]; head?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const byslug = new Map(clips.map((c) => [c[0], c]));

  useEffect(() => {
    const el = root.current;
    if (!el || !document.documentElement.classList.contains('cd-js')) return;
    const stage = el.querySelector<HTMLElement>('.cd3-burst-stage')!;
    const cards = [...el.querySelectorAll<HTMLElement>('.cd3-burst-card')];
    const mid = el.querySelector<HTMLElement>('.cd3-burst-mid')!;
    const flick = el.querySelector<HTMLImageElement>('.cd3-burst-flick')!;
    const wide = window.matchMedia('(min-width: 761px)');
    // the posters for the flicking, loaded ahead
    FLICK.forEach((s) => { new Image().src = `/assets/cd/${s}.jpg`; });

    let raf = 0, last = -1;
    const layout = () => {
      if (!wide.matches) return;
      const H = window.innerHeight, W = document.documentElement.clientWidth;
      const m = 64 * (W / 1280);
      const c = Math.min((H * 0.9) / (2 * EXTENT_Y), (W / 2 - m) / EXTENT_X);
      stage.style.setProperty('--c', `${c.toFixed(1)}px`);
      // the overlap with the next section: just enough that its clapperboard has come to rest mid-screen
      // (its sticky top) by LAND, under the folding collage. Measured: where the scene's top sits
      // below this block's foot now, against where it has to.
      const scene = document.querySelector<HTMLElement>('.cd3-scene[data-on]');
      const pin = scene?.querySelector<HTMLElement>('.cd3-scene-pin');
      if (!scene || !pin) { el.style.marginBottom = ''; return; }
      const { travel } = span();
      const now = scene.getBoundingClientRect().top - el.getBoundingClientRect().bottom;
      const want = parseFloat(getComputedStyle(pin).top) - H - travel * (1 - LAND);
      const m0 = parseFloat(getComputedStyle(el).marginBottom) || 0;
      el.style.marginBottom = `${(m0 + want - now).toFixed(1)}px`;
    };
    // the pinned stretch: from the stage reaching the top (after the lead) to its release
    const span = () => {
      const r = el.getBoundingClientRect(), H = window.innerHeight;
      const hd = el.querySelector<HTMLElement>('.cd3-reel-head')!;
      const lead = hd.offsetHeight + (parseFloat(getComputedStyle(hd).marginBottom) || 0);
      return { travel: r.height - lead - H, at: -r.top - lead };
    };
    const frame = () => {
      raf = 0;
      if (!wide.matches) return;
      const { travel, at } = span();
      const p = travel > 0 ? clamp(at / travel) : 0;
      // the middle card: flicking and growing, then its own clip
      const f = clamp(p / 0.2);
      const k = Math.min(FLICK.length - 1, Math.floor(f * FLICK.length));
      if (f < 1) {
        if (k !== last) { flick.src = `/assets/cd/${FLICK[k]}.jpg`; last = k; }
        flick.style.opacity = '1';
      } else flick.style.opacity = '0';
      const gone = cubicIn(clamp((p - 0.92) / 0.07));
      mid.style.setProperty('--g', ((0.45 + 0.55 * expoOut(clamp((p - 0.1) / 0.12))) * (1 - gone)).toFixed(4));
      mid.style.opacity = gone > 0.9 ? String((1 - gone) * 10) : '1';
      // the others: out, hold, back
      cards.forEach((card, i) => {
        const o = RANK[i], n = SLOTS.length - 1;
        const out = expoOut(clamp((p - (0.2 + (o / n) * 0.18)) / 0.14));
        const back = cubicIn(clamp((p - (0.7 + ((n - o) / n) * 0.12)) / 0.1));
        card.style.setProperty('--e', (out * (1 - back)).toFixed(4));
      });
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const start = () => { layout(); frame(); };

    let alive = true;
    document.fonts.ready.then(() => { if (alive) { start(); window.setTimeout(() => { if (alive) start(); }, 300); } });
    start();
    let rt = 0;
    const onResize = () => { window.clearTimeout(rt); rt = window.setTimeout(start, 150); };
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(rt);
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const centre = byslug.get(CENTRE)!;
  return (
    <div className="cd3-reel cd3-burst" ref={root}>
      <div className="cd3-reel-head">{head}</div>
      <div className="cd3-reel-pin cd3-burst-pin">
        <div className="cd3-burst-stage" aria-hidden="true">
          {SLOTS.map(([slug, x, y, h, ring]) => {
            const [, label, ratio] = byslug.get(slug)!;
            return (
              <div key={slug} className="cd3-burst-card" data-ring={ring}
                style={{ '--x': x, '--y': y, '--h': h, '--ar': ratio } as CSSProperties}>
                {ring < 3
                  ? <LoopVideo className="cd-video" src={`/assets/cd/${slug}.mp4`} poster={`/assets/cd/${slug}.jpg`} label={label} />
                  // eslint-disable-next-line @next/next/no-img-element
                  : <img className="cd-video" src={`/assets/cd/${slug}.jpg`} alt="" loading="lazy" />}
              </div>
            );
          })}
          <div className="cd3-burst-mid" style={{ '--ar': centre[2] } as CSSProperties}>
            <LoopVideo className="cd-video" src={`/assets/cd/${centre[0]}.mp4`} poster={`/assets/cd/${centre[0]}.jpg`} label={centre[1]} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="cd3-burst-flick" src={`/assets/cd/${FLICK[0]}.jpg`} alt="" />
            <i className="cd3-tick" /><i className="cd3-tick" /><i className="cd3-tick" /><i className="cd3-tick" />
          </div>
        </div>
      </div>
      <div className="cd3-reel-flat"><CdGallery clips={clips} /></div>
    </div>
  );
}
