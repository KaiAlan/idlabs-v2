'use client';

import { useEffect, useRef, useState } from 'react';
import './office.css';

/* /exp/office — the studio, in 3D (three.js), entered by scrolling. After venice.inc/about:
   the building first sits as a card, centred on a white page; scrolling grows the
   card to full screen while the camera crosses the road, climbs the steps, goes through the
   sliding doors and settles on the meeting room, where Lovable and our team review the film.

   Scroll drives everything: the section is 700vh tall with a sticky stage; progress p (0..1)
   goes to the scene (camera, doors) and to the overlay (card size, captions). */

const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: 0.18, to: 0.4, text: 'Identity Labs — the studio' },
  { from: 0.44, to: 0.64, text: 'Come in' },
  { from: 0.72, to: 0.9, text: 'Monday, 10:04 — Lovable are in to review the launch film' },
  { from: 0.9, to: 1.01, text: 'Cut 03 is on the screen' },
];

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function Office() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let disposed = false;
    let scene: import('./scene').OfficeScene | undefined;
    let raf = 0;

    const progress = () => {
      const el = section.current;
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, r.height - window.innerHeight));
    };

    // overlay: card scale, hint, captions, all from p
    const paint = () => {
      raf = 0;
      const p = progress();
      scene?.setProgress(p);
      const s = stage.current;
      if (!s) return;
      const c = smooth(0, 0.16, p);
      s.style.setProperty('--card', String(c));
      s.style.setProperty('--hint', String(1 - smooth(0.01, 0.05, p)));
      s.querySelectorAll<HTMLElement>('[data-cap]').forEach((el, i) => {
        const { from, to } = CAPTIONS[i];
        el.style.opacity = String(smooth(from, from + 0.03, p) * (1 - smooth(to - 0.03, to, p)));
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };

    import('./scene').then(async ({ OfficeScene }) => {
      if (disposed || !canvas.current) return;
      scene = new OfficeScene(canvas.current);
      (window as unknown as { __office?: unknown }).__office = scene; // for scripts/office-shots
      paint();
      await scene.ready;
      if (!disposed) setLoaded(true);
    });

    const onResize = () => { scene?.resize(); paint(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    paint();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      scene?.dispose();
    };
  }, []);

  return (
    <main className="of">
      <section ref={section} className="of-pin">
        <div ref={stage} className="of-stage" data-loaded={loaded || undefined}>
          <div className="of-card">
            <canvas ref={canvas} className="of-canvas" />
            <div className="of-loading" aria-hidden={loaded}>Opening the studio…</div>
          </div>

          <p className="of-hint">Scroll to come in</p>

          <div className="of-captions">
            {CAPTIONS.map((c) => (
              <p key={c.text} data-cap>{c.text}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="of-next">
        <h2>Next: the creative director&apos;s view</h2>
        <p>The handshake, the whiteboard, the set. Coming in the next scene.</p>
      </section>
    </main>
  );
}
