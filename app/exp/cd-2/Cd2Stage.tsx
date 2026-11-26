'use client';

import { useEffect } from 'react';

/* /exp/cd-2's motion, all of it following the scroll (scrubbed), the way scroll-told sites do it
   (GSAP ScrollTrigger's `scrub`, Codrops' blur reveals): nothing runs on a clock, so the page moves
   exactly as much as you scroll, forward and back.

   The opening: a tall section (.cd2-stage) pins one screen on which three scenes take turns: the
   headline, the clients, the lead. The scroll through it (0 → 1) is cut in three. In its third a
   scene comes in over the first IN, holds, and goes out over the last OUT; its pieces (the words, the
   client names) each take their own slice of that, one after another (STAGGER), so the text arrives
   and leaves as a wave: in from below, out upward, fading. The scene itself blurs and eases its scale
   while it changes, and drifts upward the whole time (DRIFT), so the scroll always moves something.
   Only the scene showing takes the pointer (the names' hover, the lead's).

   The scenes take the first SCENES of the section's scroll. The rest is the melt: "downstream" (in the
   lead) melts a little from the start, and here runs down the screen, its letters flowing in wavy,
   slanting bands that widen, darken and merge until the dark fills the screen (Cd2Melt draws it,
   from melt.d set here). The page after it is dark (cd2.css, .cd2-dark), so the switch is seamless.

   Drawn straight from the scroll position: the glide comes from the site's Lenis wheel smoothing (and
   the phone's own momentum). A second smoothing here left a long sub-pixel tail after the scroll
   stopped, which the text showed as a step-by-step creep into place. Reduced motion: plain fades, no
   movement. */

const IN = 0.34; // share of a scene's third spent coming in (from its start)
const OUT = 0.34; // ... and going out (up to its end)
const STAGGER = 0.55; // how spread out the pieces are within that (0: together)
const RISE = 46; // px a piece comes up from
const LIFT = 34; // px a piece goes up by on the way out
const BLUR = 10; // px of blur on a scene at the edge of its change
const DRIFT = 70; // px a scene drifts up over its third
// shared with the drips (Cd2Melt): how far the melt has gone (d, 0 → 1) and how visible the lead is
export const melt = { d: 0, show: 0 };

const AUTO = 1.6; // seconds the melt plays for once it is set off (Cd2Stage's auto-play)
const SCENES = 0.6; // share of the section's scroll the three scenes take; the melt has the rest

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;
// the progress of piece i of n within a change running 0 → 1
const piece = (t: number, i: number, n: number) => clamp(t * (1 + STAGGER) - (n > 1 ? (i / (n - 1)) * STAGGER : 0));

export default function Cd2Stage() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.cd2-stage');
    if (!section) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scenes = [...section.querySelectorAll<HTMLElement>('.cd2-scene')].map((el) => ({
      el,
      // its pieces, in reading order: the words, and the client names as whole names
      parts: [...el.querySelectorAll<HTMLElement>('.cd-w, .cd2-names > li')].filter((p) => !p.closest('.cd2-names > li') || p.matches('li')),
    }));
    const n = scenes.length;

    let raf = 0, alive = true;
    const target = () => {
      const r = section.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      return run > 0 ? clamp(-r.top / run) : 0;
    };

    const draw = (pAll: number) => {
      const p = Math.min(1, pAll / SCENES); // the scenes' own progress
      const mp = clamp((pAll - SCENES) / (1 - SCENES)); // the melt's progress
      scenes.forEach(({ el, parts }, k) => {
        const t = p * n - k; // through its own third: 0 → 1 (beyond either way when it isn't its turn)
        const e = k === 0 ? 1 : clamp(t / IN); // coming in
        const x = k === n - 1 ? 0 : clamp((t - (1 - OUT)) / OUT); // going out
        const on = e >= 1 && x <= 0;
        if (k === n - 1) melt.show = e;
        el.toggleAttribute('data-on', e > 0.85 && x < 0.15);
        if (still) {
          el.style.opacity = String(Math.min(e, 1 - x));
          return;
        }
        el.style.opacity = e > 0 && x < 1 ? '1' : '0';
        if (e <= 0 || x >= 1) return; // out of sight: leave it be
        const change = Math.max(1 - easeOut(e), easeIn(x));
        el.style.filter = change > 0.002 ? `blur(${(BLUR * change).toFixed(2)}px)` : 'none';
        const scale = 1 + 0.035 * (1 - easeOut(e)) - 0.03 * easeIn(x);
        // the lead rises as the melt runs (like a normal scroll), leaving the screen below to the flow
        // it picks up speed as the melt runs and ends moving exactly as the page then scrolls, so it never
        // stalls: rate mp² of the scroll, so lift = run · mp³ / 3 (run: the melt's share of the stage scroll)
        const run = (section.offsetHeight - window.innerHeight) * (1 - SCENES);
        const lift = k === n - 1 ? (run * mp * mp * mp) / 3 : 0;
        const drift = DRIFT * ((k === 0 ? 0 : 0.5) - Math.min(t, 1.2)) - lift;
        el.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
        // the lead plays its own timed sequence once it is mostly in (cd2.css, [data-play]): words in, the
        // building, the highlight; it resets once it has gone, to play again next time
        if (k === n - 1) {
          if (e > 0.6) el.setAttribute('data-play', '');
          else if (e < 0.05) el.removeAttribute('data-play');
          return;
        }
        const m = parts.length;
        parts.forEach((part, i) => {
          if (on) { part.style.opacity = ''; part.style.transform = ''; return; }
          const pi = easeOut(piece(e, i, m));
          const po = easeIn(piece(x, i, m));
          part.style.opacity = (pi * (1 - po)).toFixed(3);
          part.style.transform = `translate3d(0, ${(RISE * (1 - pi) - LIFT * po).toFixed(1)}px, 0)`;
        });
      });

      // the melt: "downstream" runs down the screen and darkens until it fills it (Cd2Melt)
      melt.d = mp; // the melt follows the scroll evenly, start to end (Cd2Melt)

    };

    const frame = () => {
      raf = 0;
      if (alive) draw(target());
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(frame); };
    frame();
    // The melt plays by itself: one scroll into it (down from the lead) and the page glides through
    // the whole melt section (and on until the dark page fills the screen) in AUTO seconds, locked against input, so the melt, the lead's rise and
    // the hand-off to the gallery all play out; one scroll back into it from below plays it back the
    // same way. Through Lenis where it runs (the site's smooth scroll); otherwise a glide of our own.
    // Reduced motion: left to the scroll.
    type LenisLike = { scrollTo: (t: number, o: object) => void };
    const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const bounds = () => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const run = section.offsetHeight - window.innerHeight;
      // a: the melt starts; b: the pinned screen has scrolled fully away (the dark page fills the screen)
      return { a: top + run * SCENES, b: top + run + window.innerHeight };
    };
    let lastY = window.scrollY, playing = false;
    const glide = (to: number) => {
      playing = true;
      const done = () => { playing = false; lastY = window.scrollY; };
      const l = lenis();
      if (l) { l.scrollTo(to, { duration: AUTO, easing: ease, lock: true, force: true, onComplete: done }); return; }
      const from = window.scrollY, t0 = performance.now(), html = document.documentElement;
      const prev = html.style.overflow; html.style.overflow = 'hidden';
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / (AUTO * 1000));
        window.scrollTo(0, from + (to - from) * ease(t));
        if (t < 1) requestAnimationFrame(tick); else { html.style.overflow = prev; done(); }
      };
      requestAnimationFrame(tick);
    };
    const auto = () => {
      if (playing || still) { lastY = window.scrollY; return; }
      const y = window.scrollY, { a: A, b: B } = bounds();
      if (lastY <= A + 2 && y > A + 2) glide(B); // into the melt from above: play it through, onto the dark page
      else if (lastY >= B - 2 && y < B - 2) glide(A - 2); // into it from below: play it back
      lastY = y;
    };
    window.addEventListener('scroll', auto, { passive: true });
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener('scroll', ask); window.removeEventListener('scroll', auto); window.removeEventListener('resize', ask); };
  }, []);
  return null;
}
