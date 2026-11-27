'use client';

import { useEffect, useRef } from 'react';

/* The "Most marketing agencies…" scene (the cd-39 to cd-42 frames, after the reference reel from
   details.so: a coin pinned mid-screen, turning with the scroll, the lines parting round it).
   The clapperboard (Cd3Clapper) pins at the middle of the screen (sticky, cd3.css) and turns about its
   upright axis with the scroll, a full turn over the scene (its front square on at the middle), its arm clapping twice; its faces catch the
   light as they come round (--lit).
   The statement scrolls up through it. Its words never change line: it is set once in short lines
   (short enough to open by the board's widest), each split at the word boundary nearest its middle. A
   line the board comes level with slides its two halves apart, left and right, just far enough to clear
   the board's current outline (so the gap breathes as the board turns edge-on and back), easing open over
   a line and a half as the board nears and closed again after. Driven straight by the (smoothed) scroll,
   no transitions of its own.
   Off on phones and for reduced motion: there the board sits above the statement, still. */

const GAP_EM = 0.4; // clear space either side of the board, in em of the text
const RAMP = 1.5; // lines over which a line eases open as the board nears

type Line = { idx: number[]; split: number; wl: number; wr: number };

const smooth = (t: number) => t * t * (3 - 2 * t);

export default function Cd3Wrap() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scene = ref.current?.closest<HTMLElement>('.cd3-scene');
    const p = scene?.querySelector<HTMLElement>('.cd3-brief');
    const cb = scene?.querySelector<HTMLElement>('.cb');
    if (!scene || !p || !cb) return;
    if (!document.documentElement.classList.contains('cd-js')) return;
    const wide = window.matchMedia('(min-width: 761px)');

    let words: HTMLElement[] = [], widths: number[] = [], space = 0, lh = 0, fs = 0, W = 0;
    let lines: Line[] = [];
    let raf = 0, on = false;

    const measure = () => {
      words = [...p.querySelectorAll<HTMLElement>('.cd-w')];
      const cs = getComputedStyle(p);
      fs = parseFloat(cs.fontSize);
      lh = parseFloat(cs.lineHeight) || fs * 1.24;
      W = p.clientWidth;
      widths = words.map((w) => w.getBoundingClientRect().width);
      const ctx = document.createElement('canvas').getContext('2d')!;
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      space = ctx.measureText(' ').width + (parseFloat(cs.letterSpacing) || 0);
      // the widest the board gets (its turned box, tilted) and the room either side
      const most = cb.offsetWidth * 1.2 + 2 * GAP_EM * fs;
      const max = Math.max(W * 0.45, W - most);
      // short lines, greedy
      lines = [];
      let cur: number[] = [], used = 0;
      words.forEach((_, i) => {
        const add = (cur.length ? space : 0) + widths[i];
        if (cur.length && used + add > max) { lines.push(split(cur)); cur = []; used = 0; }
        used += (cur.length ? space : 0) + widths[i];
        cur.push(i);
      });
      if (cur.length) lines.push(split(cur));
      p.style.height = `${lines.length * lh}px`;
    };
    // the word boundary nearest the line's middle
    function split(idx: number[]): Line {
      const total = idx.reduce((a, i, k) => a + widths[i] + (k ? space : 0), 0);
      let best = idx.length > 1 ? 1 : idx.length, bestD = Infinity, wl = 0;
      for (let k = 1; k < idx.length; k++) {
        const left = idx.slice(0, k).reduce((a, i, j) => a + widths[i] + (j ? space : 0), 0);
        const d = Math.abs(left - (total - left - space));
        if (d < bestD) { bestD = d; best = k; wl = left; }
      }
      if (idx.length === 1) wl = total;
      return { idx, split: best, wl, wr: Math.max(0, total - wl - space) };
    }

    const frame = () => {
      raf = 0;
      if (!on) return;
      // the turn: a whole one over the scene's pass through the screen; the arm claps twice
      const vh = window.innerHeight;
      const sr = scene.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (vh - sr.top) / (sr.height + vh)));
      // the turn centred on the middle of the pass, so the slate faces us while the text parts round it
      const turn = t - 0.5, a = turn * Math.PI * 2;
      cb.style.setProperty('--spin', turn.toFixed(4));
      cb.style.setProperty('--lit', Math.cos(a).toFixed(3));
      cb.style.setProperty('--clap', Math.pow(Math.abs(Math.sin(a * 2)), 0.6).toFixed(3));
      // the board as drawn now, in the text's frame
      const o = cb.getBoundingClientRect(), pr = p.getBoundingClientRect();
      const cx = (o.left + o.right) / 2 - pr.left;
      const G = o.width + 2 * GAP_EM * fs;
      const top = o.top - pr.top, bot = o.bottom - pr.top;
      lines.forEach((ln, li) => {
        const y = li * lh;
        // how far the line is from the board (0 when level with it), eased over RAMP lines
        const d = Math.max(0, top - (y + lh), y - bot);
        const f = smooth(Math.max(0, 1 - d / (RAMP * lh)));
        const closedL = (W - (ln.wl + (ln.wr ? space + ln.wr : 0))) / 2;
        const closedR = closedL + ln.wl + space;
        let openL = cx - G / 2 - ln.wl, openR = cx + G / 2;
        if (!ln.wr) openL = Math.min(openL, closedL); // a one-word line: steps left of the board
        openL = Math.max(0, openL); openR = Math.min(W - ln.wr, openR);
        const xl = closedL + (openL - closedL) * f, xr = closedR + (openR - closedR) * f;
        let x = xl;
        ln.idx.forEach((wi, k) => {
          if (k === ln.split) x = xr;
          words[wi].style.transform = `translate(${x.toFixed(1)}px, ${y}px)`;
          x += widths[wi] + space;
        });
      });
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const start = () => {
      on = wide.matches;
      scene.toggleAttribute('data-on', on);
      if (!on) {
        p.style.height = '';
        words.forEach((w) => { w.style.transform = ''; });
        return;
      }
      measure();
      frame();
    };

    let alive = true;
    document.fonts.ready.then(() => { if (alive) start(); });
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

  return <span ref={ref} hidden />;
}
