'use client';

import { useEffect, useRef } from 'react';

/* The creative-process clip, driven by the scroll (after venice.inc/about): it never plays on its own.
   The section is tall (.cd-scrub) and holds a sticky, full-screen stage, the frame centred in it. While
   the stage is pinned (the frame centred on the screen), the first ZOOM of the scroll grows the frame
   from its place in the column to the whole screen, and the
   whole scroll moves the clip from its first frame to its last.

   Not a <video>: seeking one can't keep up with a scroll. The clip is a run of images drawn to a canvas
   (public/assets/cd/akai-seq: 636 WebPs, the 30fps source taken to 60fps with ffmpeg's minterpolate),
   and between two frames it draws the next one over the last at the in-between fraction, so the
   picture moves continuously. The scroll is
   eased (a lerp each animation frame) so wheel steps glide. Frames load coarse to fine — every 16th,
   then 8th, 4th, 2nd, all — so the scrub works at once and fills in. Reduced motion: the still frame. */

const ZOOM = 0.3; // share of the pinned scroll spent growing to full screen
const EASE = 0.14; // how far the drawn position moves toward the scroll's each frame
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export default function ScrubVideo({ dir, count, poster, label, caption }: { dir: string; count: number; poster: string; label: string; caption?: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const cv = canvas.current;
    if (!w || !cv) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      w.dataset.static = '';
      return;
    }
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    // the frames, loaded coarse to fine
    const frames: (HTMLImageElement | null)[] = new Array(count).fill(null);
    const order: number[] = [];
    for (let step = 16; step >= 1; step /= 2) for (let i = 0; i < count; i += step) if (!order.includes(i)) order.push(i);
    if (!order.includes(count - 1)) order.splice(1, 0, count - 1);
    let alive = true;
    let next = 0;
    const loadOne = () => {
      if (!alive || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = 'async';
      img.src = `${dir}/${String(i).padStart(3, '0')}.webp`;
      img.decode().then(() => { if (alive) frames[i] = img; }, () => {}).finally(loadOne);
    };
    let started = false;
    const start = () => { if (started) return; started = true; for (let k = 0; k < 6; k++) loadOne(); };
    // start loading when the section is a screen or two away
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { start(); io.disconnect(); } }, { rootMargin: '200% 0px' });
    io.observe(w);

    // the nearest loaded frame at or before / after i
    const before = (i: number) => { for (let k = i; k >= 0; k--) if (frames[k]) return k; return -1; };
    const after = (i: number) => { for (let k = i; k < count; k++) if (frames[k]) return k; return -1; };

    // size the canvas's pixels to its box (device pixels, capped at the frames' own 1440 wide × 2)
    const size = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; drawn = -1; }
    };
    // draw an image to cover the canvas (as object-fit: cover)
    const cover = (img: HTMLImageElement, alpha: number) => {
      const cw = cv.width, ch = cv.height, iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(cw / iw, ch / ih);
      const dw = iw * s, dh = ih * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    let raf = 0;
    let pos = -1; // the eased position, in frames
    let drawn = -1; // the position last drawn
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const r = w.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -vh || r.top > vh * 2) return; // far off screen
      const p = clamp(-r.top / (r.height - vh));
      w.style.setProperty('--z', ease(clamp(p / ZOOM)).toFixed(4));
      size();
      const target = p * (count - 1);
      pos = pos < 0 ? target : pos + (target - pos) * EASE;
      if (Math.abs(target - pos) < 0.002) pos = target;
      if (Math.abs(pos - drawn) < 0.004) return;
      const a = before(Math.floor(pos));
      if (a < 0) return;
      const b = after(Math.floor(pos) + 1);
      ctx.clearRect(0, 0, cv.width, cv.height);
      cover(frames[a]!, 1);
      if (b > a) {
        const t = (pos - a) / (b - a);
        if (t > 0.001) cover(frames[b]!, t);
      }
      ctx.globalAlpha = 1;
      drawn = pos;
    };
    raf = requestAnimationFrame(frame);
    const onResize = () => { drawn = -1; };
    window.addEventListener('resize', onResize);
    return () => { alive = false; cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', onResize); };
  }, [dir, count]);

  return (
    <div className="cd-scrub" ref={wrap}>
      <div className="cd-stage">
        {/* the line above the clip, 36px over it while it waits centred; it fades as the zoom starts */}
        {caption && <div className="cd-stage-cap">{caption}</div>}
        <div className="cd-frame" style={{ backgroundImage: `url('${poster}')` }}>
          <canvas ref={canvas} className="cd-canvas" role="img" aria-label={label} />
        </div>
      </div>
    </div>
  );
}
