/* /exp/cd — variant 3, "Mix". The same five references as variant 2, but each brought in
   with its own look rather than folded into one red palette; the film cuts between them:

   valuable826      grey grunge paper, distressed black type, yellow highlighter, red marker,
                    redaction, typewriter, motion-blur smear cuts
   ahmdalqdwr789    black starfield, glowing white silhouettes floating, white ink-splash
                    reveals, negative flips, flying through a tunnel
   novaobtzxx       a wall of CRT screens, each changing its picture on its own
   thecharleshardy  one halftone object on red, rings, a dashed orbit, wavy lines, glitch blocks
   anvika_3116      one word per beat, full frame, red ↔ cream flips, streaks and glow

   Same engine and voice-over as the other variants (engine.ts, vo.ts). */

import type { ReactNode } from 'react';
import { enter, exit, type Key } from './engine';
import { rng } from './kit';
import { W } from './vo';
import { PhoneIcon, PodIcon, WebIcon, Scrawl } from './art';
import type { Def, FilmDef } from './timeline';

const CUTS = [0, 26.8, 38.6, 51.7, 65.6, 78.25];
const END = 82;
const CHAPTERS = ['The keynote', 'The envelope', 'Memory', 'The work', 'The aha'];

type Tone = 'red' | 'cream' | 'ink' | 'grey' | 'space';
const FG: Record<Tone, string> = { red: 'var(--v2-cream)', cream: 'var(--v2-red)', ink: 'var(--v2-cream)', grey: 'var(--v2-ink)', space: 'var(--v2-cream)' };
const SRC = (n: string) => `/exp/cd/${n}.webp`;

const defs: Def[] = [];
let n = 0;
function add(node: ReactNode, o: Omit<Def, 'node' | 'id' | 'keys'>, ...keys: Key[][]) { defs.push({ id: `v3-${n++}`, node, ...o, keys: keys.flat() }); }
const C = { x: 0, y: 0 };
const span = (t0: number, t1: number, p: { x: number; y: number; r?: number } = C): Key[] => [...enter('cut', t0, p), ...exit('cut', t1, p)];

/* ── grounds and words ── */
function ground(tone: Tone, t0: number, t1: number, tex: 'grain' | 'grunge' | 'lines' = 'grain') {
  if (tone === 'space') { add(<div className="v2-ground v3-space"><i /><i /></div>, { z: 0, zi: 0, w: 400, h: 640, smooth: true }, [{ t: t0 - 0.01, o: 0, e: 'hold' }, { t: t0, x: 0, y: 0, s: 1, r: 0, o: 1, e: 'hold' }, { t: t1, s: 1.12, r: 3, e: 'lin' }], exit('cut', t1, C)); return; }
  add(<div className={`v2-ground ${tone === 'grey' ? 'v3-grey' : `v2-${tone}`} v2-tex-${tex}`} />, { z: 0, zi: 0, w: 400, h: 640, smooth: true }, span(t0, t1));
}
// a word that fills the frame, slammed in with a streak, on its own ground
function word(text: string, t0: number, t1: number, tone: Tone, o: { size?: number; outline?: boolean; y?: number; ground?: boolean; hl?: boolean; mark?: boolean } = {}) {
  if (o.ground !== false) ground(tone, t0, t1, tone === 'cream' ? 'lines' : 'grain');
  const fs = `min(${o.size ?? 40}vmin, ${(165 / Math.max(2, text.length)).toFixed(1)}vw)`;
  if (o.hl) add(<div className="v3-hl" />, { z: 0, zi: 9, w: Math.min(150, text.length * 13), h: 13, clip: 'l', smooth: true }, enter('wipe', t0 + 0.12, { x: 0, y: (o.y ?? 0) + 8, r: -1.5 }, 0.22), exit('cut', t1, C));
  if (o.mark) add(<Scrawl style={{ width: '100%', height: '100%' }} />, { z: 0, zi: 11, w: Math.min(160, text.length * 16), h: 44, cls: 'v2-mark cd-draw' }, span(t0 + 0.2, t1, { x: 0, y: o.y ?? 0 }));
  add(<span className={`v2-word${o.outline ? ' is-outline' : ''}${tone === 'grey' ? ' is-ink is-rough' : ''}`} data-t={text} style={{ fontSize: fs, color: FG[tone] }}>{text}</span>, { z: 0, zi: 10, boil: 0.5 },
    [{ t: t0 - 0.01, o: 0, e: 'hold' }, { t: t0, x: 0, y: o.y ?? 0, s: 1.14, o: 1, e: 'hold' }, { t: t0 + 0.16, s: 1, e: 'out' }, { t: t1, s: 1.03, e: 'lin' }], exit('cut', t1, C));
}
// small words, typed in as they are said
function typed(text: string, t0: number, t1: number, tone: Tone, x = 0, y = 0, size = 4.2, rate = 22) {
  add(<span className="v2-small" data-full={text} style={{ fontSize: `${size}vmin`, color: FG[tone] }}>{''}</span>, {
    z: 0, zi: 12, smooth: true,
    fx: (t, el) => { const k = Math.max(0, Math.min(text.length, Math.floor((t - t0) * rate))); const s = text.slice(0, k); if (el.firstChild!.textContent !== s) el.firstChild!.textContent = s; },
  }, span(t0, t1, { x, y }));
}
const label = (text: string, t0: number, t1: number, x: number, y: number, tone: Tone = 'red') =>
  add(<span className="v2-label" style={{ color: FG[tone] }}>{text}</span>, { z: 0, zi: 14 }, span(t0, t1, { x, y }));

/* ── objects (charleshardy): one halftone cut-out, rings, an orbit ── */
function obj(node: ReactNode, t0: number, t1: number, w: number, o: { x?: number; y?: number; r?: number; spin?: boolean } = {}) {
  const p = { x: o.x ?? 0, y: o.y ?? 0, r: o.r ?? 0 };
  add(node, { zi: 8, w, boil: 0.35 }, [{ t: t0 - 0.01, o: 0, e: 'hold' }, { t: t0, ...p, s: 0.86, o: 1, e: 'hold' }, { t: t0 + 0.25, s: 1, e: 'back' }, { t: t1, s: 1.06, r: p.r + (o.spin ? 8 : 1.5), e: 'lin' }], exit('cut', t1, p));
}
const ht = (src: string) => <div className="v2-ht" style={{ ['--m' as string]: `url(${SRC(src)})` }}><img src={SRC(src)} alt="" draggable={false} /><i /></div>;
const icon = (I: typeof PodIcon) => <div className="v2-icon"><I style={{ width: '100%' }} /></div>;
function ring(t: number, size = 60, tone: Tone = 'red', thick = false) {
  add(<div className={`v2-ring${thick ? ' is-thick' : ''}`} style={{ color: FG[tone] }} />, { z: 0, zi: 6, w: size, h: size, smooth: true },
    [{ t: t - 0.01, o: 0, e: 'hold' }, { t, x: 0, y: 0, s: 0.25, o: 1, e: 'hold' }, { t: t + 0.9, s: 1.9, o: 0, e: 'out' }]);
}
function orbit(t0: number, t1: number, w: number, h: number, tone: Tone = 'red') {
  add(<svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}><ellipse cx="50" cy="50" rx="49" ry="49" fill="none" stroke={FG[tone]} strokeWidth="0.9" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" /></svg>,
    { z: 0, zi: 7, w, h, smooth: true }, [{ t: t0 - 0.01, o: 0, e: 'hold' }, { t: t0, x: 0, y: 0, r: -8, o: 1, e: 'hold' }, { t: t1, r: 30, e: 'lin' }], exit('cut', t1, C));
}
function waves(t0: number, t1: number, tone: Tone = 'red') {
  add(<svg viewBox="0 0 200 120" style={{ width: '100%' }}>{Array.from({ length: 14 }, (_, i) => <path key={i} d={`M-10 ${10 + i * 8} C40 ${-6 + i * 8} 60 ${26 + i * 8} 100 ${10 + i * 8} S160 ${-6 + i * 8} 210 ${10 + i * 8}`} fill="none" stroke={FG[tone]} strokeWidth="1.1" />)}</svg>,
    { z: 0, zi: 5, w: 90 }, [{ t: t0 - 0.01, o: 0, e: 'hold' }, { t: t0, x: -6, y: 0, r: -18, o: 0.9, e: 'hold' }, { t: t1, x: 6, e: 'lin' }], exit('cut', t1, C));
}

/* ── duotone photographs, full frame ── */
function duo(src: string, t0: number, t1: number, tone: Tone, o: { pos?: string; push?: number; neg?: number } = {}) {
  add(<div className={`v2-duo v2-${tone}`}><img src={SRC(src)} alt="" draggable={false} style={{ objectPosition: o.pos }} /></div>, {
    z: 0, zi: 2, w: 200, h: 120, smooth: true,
    fx: o.neg !== undefined ? (t, el) => { el.classList.toggle('is-neg', t >= o.neg! && t < o.neg! + 0.12); } : undefined,
  }, [{ t: t0 - 0.01, o: 0, e: 'hold' }, { t: t0, x: 0, y: 0, s: 1, o: 1, e: 'hold' }, { t: t1, s: 1 + (o.push ?? 0.08), e: 'lin' }], exit('cut', t1, C));
}

/* ── between movements: glitch blocks (charleshardy's exit) ── */
function glitch(t: number, seed: number) {
  const r = rng(seed);
  for (let i = 0; i < 16; i++) {
    const a = t + r() * 0.18, b = a + 0.06 + r() * 0.16;
    const tone: Tone = (['red', 'ink', 'cream', 'ink'] as Tone[])[i % 4];
    add(<div className={`v2-block v2-${tone}`} />, { z: 0, zi: 95, w: 20 + r() * 110, h: 3 + r() * 16, smooth: true }, span(a, b, { x: (r() - 0.5) * 170, y: (r() - 0.5) * 100 }));
  }
}

/* ── ahmdalqdwr789: glowing white figures floating in the dark ── */
const FIG = [
  'M50 8a9 9 0 1 1 0 18a9 9 0 1 1 0-18zM40 30h20l8 34-6 2-6-24-2 30 6 50h-8l-6-44-6 44h-8l6-50-2-30-6 24-6-2z',
  'M50 8a9 9 0 1 1 0 18a9 9 0 1 1 0-18zM40 30h20l18 22-5 5-15-16-2 30 14 44-8 3-14-38-12 36-8-3 12-42-2-30-15 16-5-5z',
];
function figures(t0: number, t1: number, count: number, seed: number, spread = 1) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = (r() - 0.5) * 150 * spread, y = (r() - 0.5) * 80 * spread, rot = r() < 0.4 ? (r() - 0.5) * 160 : (r() - 0.5) * 16;
    const dx = (r() - 0.5) * 16, dy = -4 - r() * 8, w = 7 + r() * 9, at = t0 + i * 0.07;
    if (at >= t1 - 0.1) continue;
    add(<svg viewBox="0 0 100 150" className="v3-fig" style={{ width: '100%' }}><path d={FIG[i % 2]} /></svg>, { z: 0, zi: 6, w, smooth: true },
      [{ t: at - 0.01, o: 0, e: 'hold' }, { t: at, x, y, r: rot, o: 0, e: 'hold' }, { t: Math.min(at + 0.35, t1 - 0.05), o: 1, e: 'lin' }, { t: t1, x: x + dx, y: y + dy, r: rot + (r() - 0.5) * 30, e: 'lin' }], exit('cut', t1, C));
  }
}
// a white ink splash that spreads to fill the frame (ahmd's reveal)
function splat(t: number, seed: number) {
  const r = rng(seed);
  const pts = Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2, d = (i % 2 ? 26 : 34) + r() * 16; return `${(50 + Math.cos(a) * d).toFixed(1)},${(50 + Math.sin(a) * d).toFixed(1)}`; }).join(' ');
  add(<svg viewBox="0 0 100 100" style={{ width: '100%' }}><polygon points={pts} fill="#f6f1e7" style={{ filter: 'blur(.6px)' }} /></svg>, { z: 0, zi: 94, w: 60, smooth: true },
    [{ t: t - 0.01, o: 0, e: 'hold' }, { t, x: 0, y: 0, s: 0.05, r: 0, o: 1, e: 'hold' }, { t: t + 0.32, s: 4.4, r: 40, e: 'in' }, { t: t + 0.42, o: 0, e: 'lin' }]);
}
// valuable826's cut: a horizontal motion-blur smear across the frame
function smear(t: number, tone: Tone = 'grey') {
  add(<div className={`v3-smear v3-smear-${tone}`} />, { z: 0, zi: 93, w: 400, h: 640, smooth: true },
    [{ t: t - 0.12, o: 0, e: 'hold' }, { t: t - 0.11, x: 60, o: 1, e: 'hold' }, { t: t + 0.1, x: -60, e: 'lin' }, { t: t + 0.11, o: 0, e: 'hold' }]);
}

/* ═════════ 1 · The keynote ═════════ */
{
  const C1 = CUTS[1];
  // the file opens (valuable826): typewriter, distressed type, highlighter, smears between
  ground('grey', 0, W('2007'), 'grunge');
  typed('if you’ve watched the', 0.02, W('2007'), 'grey', 0, 0, 4.4);
  label('FILE 001 · MACWORLD SAN FRANCISCO', 0.3, W('2007'), 0, 30, 'grey');
  word('2007', W('2007'), W('iphone'), 'grey', { hl: true });
  smear(W('iphone'));
  word('IPHONE', W('iphone'), W('keynote'), 'grey', { mark: true });
  smear(W('keynote'));
  word('KEYNOTE', W('keynote'), W('you') - 0.02, 'grey', { hl: true });
  add(<div className="v2-redact" />, { z: 0, zi: 12, w: 60, h: 7, clip: 'l', smooth: true }, enter('wipe', W('keynote') + 0.6, { x: 30, y: 26, r: -1 }, 0.2), exit('cut', W('you') - 0.02, C));
  label('CLASSIFIED: THE ONE DEVICE', W('keynote') + 0.6, W('you') - 0.02, -30, 27, 'grey');

  // you probably remember Steve Jobs announcing — one cut-out, rings on the beat
  const s0 = W('you'), s1 = W('three');
  ground('red', s0, s1);
  waves(W('announcing'), s1);
  orbit(W('steve'), s1, 64, 30);
  obj(ht('jobs-head-cut'), s0 + 0.05, s1, 34, { y: 4 });
  [s0, W('steve'), W('jobs'), W('announcing')].forEach((t) => ring(t, 62));
  typed('you probably remember', s0, s1, 'red', -26, 36, 2.6, 28);
  label('STEVE JOBS', W('steve'), s1, 34, -32);
  label('MACWORLD · 9.1.2007', W('jobs'), s1, 34, -27);

  word('THREE', W('three'), W('products'), 'cream');
  word('PRODUCTS', W('products'), W('an'), 'red');

  // an iPod / a phone / an internet communicator: one object per beat, the ground flips
  const prods: [string, string, Tone, typeof PodIcon, string][] = [['an', 'ipod', 'red', PodIcon, 'AN IPOD'], ['a', 'phone', 'cream', PhoneIcon, 'A PHONE'], ['an#1', 'internet', 'red', WebIcon, 'AN INTERNET COMMUNICATOR']];
  prods.forEach(([lead, w, tone, I, txt], i) => {
    const t0 = lead.includes('#') ? W('an', 1) : W(lead), t1 = i < 2 ? (i === 0 ? W('a') : W('an', 1)) : W('he');
    ground(tone, t0, t1);
    obj(icon(I), W(w) - 0.05, t1, 30, { r: (i - 1) * 6 });
    ring(W(w), 56, tone); ring(W(w) + 0.25, 56, tone);
    label(txt, W(w), t1, 0, 30, tone);
  });

  // again and again and again: 3 → 9 → 27 → 81, the ground flipping with every "again"
  const ag = [W('he'), W('again'), W('again', 1), W('again', 2)], until = W('until');
  ag.forEach((t, k) => {
    const t1 = ag[k + 1] ?? until;
    const tone: Tone = k % 2 ? 'cream' : 'red';
    ground(tone, t, t1);
    const cols = [3, 6, 9, 15][k], rows = [1, 3, 5, 9][k];
    const cell = Math.min(150 / cols, 88 / rows);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const I = [PodIcon, PhoneIcon, WebIcon][(c + r) % 3];
      add(icon(I), { z: 0, zi: 8, w: cell * 0.78, boil: 0.25 }, span(t + (r * cols + c) * 0.004, t1, { x: (c - (cols - 1) / 2) * cell, y: (r - (rows - 1) / 2) * cell }));
    }
    if (k) add(<span className="v2-word" data-t="AGAIN" style={{ fontSize: 'min(30vmin, 32vw)', color: FG[tone] }}>AGAIN</span>, { z: 0, zi: 20, boil: 0.6 }, [{ t: t - 0.01, o: 0, e: 'hold' }, { t, x: 0, y: 0, s: 1.3, o: 1, e: 'hold' }, { t: t + 0.18, s: 1, e: 'out' }], exit('cut', t1, C));
  });

  // until the audience slowly realised
  // until the audience slowly realised (ahmdalqdwr789): figures adrift in the dark, then a splash
  ground('space', until, W('realized'));
  typed('until the audience', until, W('realized'), 'space', 0, 34, 3.2, 20);
  figures(W('audience') - 0.2, W('realized'), 12, 77);
  typed('slowly', W('slowly'), W('realized'), 'space', 0, -2, 6, 10);
  splat(W('realized') - 0.12, 78);
  duo('applause', W('realized'), W('he', 1), 'red', { pos: '50% 35%', push: 0.12, neg: W('realized') + 0.1 });
  add(<div className="v3-negative" />, { z: 0, zi: 3, w: 400, h: 640, smooth: true }, span(W('realized') + 0.45, W('realized') + 0.6));
  add(<span className="v2-word" data-t="REALISED." style={{ fontSize: 'min(26vmin, 18vw)', color: 'var(--v2-cream)' }}>REALISED.</span>, { z: 0, zi: 12, boil: 0.5 }, span(W('realized'), W('he', 1), { x: 0, y: 14 }));

  ground('grey', W('he', 1), W('one'), 'grunge');
  typed('he was talking about', W('he', 1), W('one'), 'grey', 0, 0, 4.4);
  smear(W('one'), 'red');
  word('ONE', W('one'), W('device'), 'cream', { size: 60 });
  word('DEVICE', W('device'), W('the', 2), 'red');
  ground('space', W('the', 2), W('iphone', 1));
  typed('the', W('the', 2), W('iphone', 1), 'space', 0, 0, 5);
  figures(W('the', 2), W('iphone', 1), 6, 79, 0.8);
  splat(W('iphone', 1) - 0.1, 80);
  const ip = W('iphone', 1);
  add(<div className="v2-ground v2-red v2-tex-grain" />, { z: 0, zi: 1, w: 400, h: 640, smooth: true }, span(ip, C1));
  obj(ht('iphone-front'), ip, C1, 46, { r: -10, spin: true });
  orbit(ip + 0.1, C1, 90, 40);
  [ip, ip + 0.18, ip + 0.36, ip + 1.0].forEach((t, i) => ring(t, 70 + i * 6, 'red', i === 0));
  label('THE IPHONE · 2007', ip + 0.3, C1, 0, 34);
  glitch(C1 - 0.2, 101);
}

/* ═════════ 2 · The envelope ═════════ */
{
  const C1 = CUTS[1], C2 = CUTS[2];
  ground('grey', C1, W('macbook'), 'grunge');
  typed('or the', W('or'), W('macbook'), 'grey', 0, 0, 4.4);
  label('FILE 002 · MACWORLD 2008', W('or'), W('macbook'), 0, 30, 'grey');
  word('MACBOOK', W('macbook'), W('air'), 'grey', { hl: true });
  word('AIR', W('air'), W('launch'), 'red', { size: 62 });
  smear(W('launch'));
  word('LAUNCH', W('launch'), W('year'), 'grey', { outline: true });
  word('2008', W('year'), W('where'), 'grey', { mark: true });
  typed('a year later', W('year'), W('where'), 'grey', 0, 30, 3);

  // out of the envelope
  const e0 = W('where'), e1 = W('paper-thin');
  ground('red', e0, e1);
  orbit(e0, e1, 70, 86);
  add(<div className="v2-lid" />, { zi: 7, w: 26, h: 18, boil: 0.2 }, enter('cut', W('pulled') - 0.02, { x: 0, y: 8 }), [{ t: W('pulled'), y: 8, e: 'hold' }, { t: W('pulled') + 0.8, y: -30, e: 'out' }], exit('cut', e1, { x: 0, y: -30 }));
  obj(ht('envelope'), e0, e1, 30, { y: 6, r: -3 });
  ring(e0, 70); ring(W('pulled'), 70); ring(W('laptop'), 74);
  label('WHERE HE PULLED THE LAPTOP OUT', W('pulled'), e1, -20, 38);

  // paper-thin: a single hairline across the frame
  const p1 = W('manila');
  ground('cream', e1, p1, 'lines');
  add(<div className="v2-hair" />, { z: 0, zi: 8, w: 170, h: 0.5, smooth: true, clip: 'l' }, enter('wipe', e1, C, 0.35), exit('cut', p1, C));
  label('PAPER-THIN', e1 + 0.2, p1, -60, -6, 'cream');
  label('0.16 IN', e1 + 0.35, p1, 64, 6, 'cream');

  word('MANILA', W('manila'), W('office'), 'red');
  word('OFFICE', W('office'), W('envelope'), 'cream');
  word('ENVELOPE', W('envelope'), W('left'), 'red', { outline: true });
  add(<span className="v2-word" style={{ fontSize: 'min(40vmin, 20.6vw)', color: 'var(--v2-cream)', clipPath: 'inset(0 0 0 40%)' }}>ENVELOPE</span>, { z: 0, zi: 11, boil: 0.5 }, span(W('envelope') + 0.4, W('left')));

  // the audience as a document (valuable826), then silence in the dark (ahmdalqdwr789)
  ground('grey', W('left'), W('speechless'), 'grunge');
  add(<div className="v2-doc"><img src={SRC('applause')} alt="" draggable={false} style={{ objectPosition: '50% 30%' }} /></div>, { z: 0, zi: 4, w: 100, h: 58, boil: 0.2 }, span(W('left'), W('speechless'), { x: 0, y: -6, r: 1 }));
  [[-26, -14, 30], [18, -8, 26]].forEach(([x, y, w], i) => add(<div className="v2-redact" />, { z: 0, zi: 6, w, h: 5, clip: 'l', smooth: true }, enter('wipe', W('audience', 1) + i * 0.12, { x, y, r: -2 }, 0.16), exit('cut', W('speechless'), C)));
  typed('AND LEFT THE AUDIENCE', W('left'), W('speechless'), 'grey', 0, 32, 3.2, 30);
  add(<div className="v3-hl" />, { z: 0, zi: 11, w: 30, h: 5.4, clip: 'l', smooth: true }, enter('wipe', W('audience', 1) + 0.1, { x: 10, y: 32 }, 0.25), exit('cut', W('speechless'), C));
  ground('space', W('speechless'), C2);
  figures(W('speechless'), C2, 9, 81, 1.1);
  typed('speechless.', W('speechless'), C2, 'space', 0, 0, 4, 14);
  glitch(C2 - 0.2, 202);
}

/* ═════════ 3 · Memory: the wall of screens ═════════ */
{
  const C2 = CUTS[2], C3 = CUTS[3];
  const y20 = W('20'), ask = W('ask'), env = W('envelope', 1), are = W('are');
  const pics = ['jobs-stage', 'macworld-iphone', 'audience', 'applause', 'jobs-air-front', 'envelope', 'team-3', 'jobs-air-side', 'audience', 'jobs-stage', 'applause', 'macworld-iphone'];
  const cols = 4, rows = 3, cw = 46, ch = 34;
  // the wall: screens switch on as the question is asked, then show faces, then all the envelope
  const wall = (t0: number, t1: number, pick: (i: number) => string, stagger: number, camX: number, swap = true) => {
    ground('ink', t0, t1);
    for (let i = 0; i < cols * rows; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const x = (c - (cols - 1) / 2) * cw + camX, y = (r - (rows - 1) / 2) * ch;
      const on = t0 + i * stagger;
      const alt = pics[(i * 5 + 3) % pics.length], every = 0.9 + (i % 5) * 0.37;
      add(<div className="v2-tv"><div className="v2-tv-scr"><img src={SRC(pick(i))} alt="" draggable={false} /><img className="v3-alt" src={SRC(alt)} alt="" draggable={false} /></div></div>, {
        z: 0, zi: 4, w: cw - 3, h: ch - 3, smooth: true,
        fx: (t, el) => {
          // each screen changes channel on its own beat (novaobtzxx)
          const k = Math.floor((t - on) / every);
          const flick = t >= on && (t - on) % every < 0.08;
          el.classList.toggle('is-off', t < on); el.classList.toggle('is-flick', flick); el.classList.toggle('is-alt', swap && t >= on && k % 2 === 1);
        },
      }, [{ t: t0 - 0.01, o: 0, e: 'hold' }, { t: t0, x, y, o: 1, e: 'hold' }, { t: t1, x: x - 8, e: 'lin' }], exit('cut', t1, { x, y }));
    }
  };
  wall(C2, y20, (i) => pics[i], (W('moments') - C2) / 12, 4);
  word('2007', y20, W('years'), 'grey', { hl: true });
  smear(W('years'));
  add(<span className="v2-word v2-count is-ink is-rough" style={{ fontSize: 'min(40vmin, 40vw)' }}>2007</span>, {
    z: 0, zi: 10, boil: 0.4,
    fx: (t, el) => { const k = Math.max(0, Math.min(1, (t - W('years')) / (W('later', 1) - W('years')))); el.firstChild!.textContent = String(2007 + Math.round(k * 19)); },
  }, span(W('years'), W('later', 1) + 0.4));
  ground('grey', W('years'), W('later', 1) + 0.4, 'grunge');
  label('FOLDER 023 · 20 YEARS', W('years'), W('later', 1) + 0.4, 0, 30, 'grey');
  word('LATER?', W('later', 1) + 0.4, ask, 'red');
  wall(ask, env, (i) => (i % 2 ? 'audience' : 'applause'), 0.06, 0);
  typed('ask anyone who watched them', ask, env, 'ink', 0, 44, 2.6, 28);
  add(<span className="v2-word" data-t="EXACT" style={{ fontSize: 'min(30vmin, 30vw)', color: 'var(--v2-cream)' }}>EXACT</span>, { z: 0, zi: 20, boil: 0.5 }, span(W('exact'), env));
  wall(env, are, () => 'envelope', 0.015, 0, false);
  add(<div className="v2-zoom" />, { z: 0, zi: 30, w: 46, h: 34, smooth: true }, [{ t: env + 0.55, x: 0, y: 0, s: 1, o: 1, e: 'hold' }, { t: are - 0.05, s: 6, e: 'in' }, { t: are, o: 0, e: 'hold' }, { t: env + 0.54, o: 0, e: 'hold' }]);
  word('ARE', are, W('you', 1), 'red', { size: 60 });
  word('YOU', W('you', 1), W('getting'), 'cream', { size: 60 });
  word('GETTING', W('getting'), W('it'), 'red');
  word('IT?', W('it'), C3, 'cream', { size: 64 });
  glitch(C3 - 0.2, 303);
}

/* ═════════ 4 · The work: the file ═════════ */
{
  const C3 = CUTS[3], C4 = CUTS[4];
  const fl = W('fluke'), they = W('they'), narrow = W('narrowed'), back = W('worked');
  ground('cream', C3, they, 'grunge');
  typed('THESE WEREN’T MOMENTS BORN AS A', W('these', 2), they, 'cream', 0, -24, 3.6, 30);
  add(<span className="v2-word is-ink" style={{ fontSize: 'min(44vmin, 30vw)' }}>FLUKE</span>, { z: 0, zi: 10, boil: 0.6 }, span(fl, they, { x: 0, y: 6 }));
  add(<div className="v2-redact" />, { z: 0, zi: 11, w: 120, h: 18, clip: 'l', smooth: true }, enter('wipe', fl + 0.4, { x: 0, y: 6, r: -1.5 }, 0.3), exit('cut', they, C));
  label('FILE 023 · NOT A FLUKE', fl + 0.6, they, 50, 34, 'cream');

  // the team: a document, typed and highlighted
  ground('cream', they, narrow, 'grunge');
  add(<div className="v2-doc"><img src={SRC('team-1')} alt="" draggable={false} /></div>, { z: 0, zi: 4, w: 96, h: 62, boil: 0.2 }, span(they, narrow, { x: -24, y: -4 }));
  add(<Scrawl style={{ width: '100%', height: '100%' }} />, { z: 0, zi: 6, w: 50, h: 40, cls: 'v2-mark cd-draw' }, span(W('team'), narrow, { x: -40, y: -12 }));
  typed('THEY TOOK A TEAM', they, narrow, 'cream', 48, -24, 3, 26);
  typed('THAT UNDERSTOOD', W('understood'), narrow, 'cream', 48, -12, 3, 26);
  typed('THE PRODUCT', W('product'), narrow, 'cream', 48, 0, 3, 26);
  add(<div className="v2-hl" />, { z: 0, zi: 11, w: 40, h: 5.4, clip: 'l', smooth: true }, enter('wipe', W('product') + 0.2, { x: 48, y: 0 }, 0.3), exit('cut', narrow, C));
  add(<span className="v2-word" style={{ fontSize: 'min(16vmin, 16vw)', color: 'var(--v2-red)' }}>IN DEPTH</span>, { z: 0, zi: 12, boil: 0.5 }, span(W('in'), narrow, { x: 34, y: 24 }));

  // narrowed down: a list, every line redacted but one
  ground('cream', narrow, back, 'grunge');
  const feats = ['PRICE', 'COLOURS', 'STORAGE', 'BATTERY', 'CAMERA', 'THE ONE FEATURE', 'SPEED', 'SIZE', 'SOFTWARE'];
  const oneT = W('one', 1);
  add(<div className="v2-list">{feats.map((f) => <div key={f} className={`v2-li${f === 'THE ONE FEATURE' ? ' is-one' : ''}`}><span>{f}</span><i /></div>)}</div>, {
    z: 0, zi: 12, smooth: true,
    fx: (t, el) => {
      Array.from(el.firstChild!.childNodes as NodeListOf<HTMLElement>).forEach((li, i) => {
        li.classList.toggle('is-in', t >= narrow + i * 0.08);
        li.classList.toggle('is-out', i !== 5 && t >= oneT - 0.4 + i * 0.05);
        li.classList.toggle('is-hl', i === 5 && t >= oneT);
      });
    },
  }, span(narrow, back, { x: -14, y: -2 }));
  add(<Scrawl style={{ width: '100%', height: '100%' }} />, { z: 0, zi: 14, w: 62, h: 16, cls: 'v2-mark cd-draw' }, span(W('exceptional'), back, { x: -14, y: 6.5 }));
  typed('— exceptional', W('exceptional'), back, 'cream', 40, 6.5, 3.2, 26);

  // worked backwards: through the tunnel, the word reversed
  const t0 = back - 0.02, t1 = W('find');
  ground('space', t0, t1);
  ground('ink', t1, C4);
  splat(back - 0.1, 405);
  const r = rng(404);
  for (let i = 0; i < 9; i++) {
    const d = i / 9;
    add(<div className="v2-frame v3-glow" />, { z: 0, zi: 3, w: 150, h: 90, smooth: true }, [{ t: t0 - 0.01, o: 0, e: 'hold' }, { t: t0, x: 0, y: 0, s: 1.6 - d * 1.5, o: 1, e: 'hold' }, { t: t1, s: Math.max(0.02, 1.6 - d * 1.5 - 0.9) , e: 'in' }], exit('cut', t1, C));
  }
  ['team-3', 'macworld-iphone', 'jobs-stage', 'audience', 'envelope', 'applause'].forEach((src, i) => {
    const a = r() * Math.PI * 2;
    add(<div className="v2-duo v2-red v2-snap"><img src={SRC(src)} alt="" draggable={false} /></div>, { z: 0, zi: 4, w: 26, h: 18, smooth: true },
      [{ t: t0 - 0.01, o: 0, e: 'hold' }, { t: t0, x: Math.cos(a) * 70, y: Math.sin(a) * 42, s: 2.4 - i * 0.25, o: 1, e: 'hold' }, { t: t1, x: Math.cos(a) * 6, y: Math.sin(a) * 4, s: 0.12, e: 'in' }], exit('cut', t1, C));
  });
  add(<span className="v2-word is-mirror" style={{ fontSize: 'min(24vmin, 17vw)', color: 'var(--v2-red)' }}><span>BACKWARDS</span></span>, {
    z: 0, zi: 12, boil: 0.5,
    fx: (t, el) => { el.classList.toggle('is-flipped', t >= W('backwards') + 0.35); },
  }, span(W('backwards') - 0.05, t1));
  typed('worked', back, t1, 'space', 0, -24, 4, 20);
  word('FIND', t1, W('best'), 'red', { size: 56 });
  smear(W('best'));
  word('THE BEST WAY', W('best'), W('show'), 'grey', { hl: true });
  word('TO SHOW IT.', W('show'), C4, 'red');
  glitch(C4 - 0.2, 404);
}

/* ═════════ 5 · The aha ═════════ */
{
  const C4 = CUTS[4], C5 = CUTS[5];
  const sets = W('sets'), stop = W('stop'), call = W('we');
  // every great product — one object per word, rings on the beat
  ground('red', C4, sets);
  waves(W('every'), sets);
  const beats: [string, ReactNode, number, number][] = [['every', ht('ipod'), 30, 4], ['great', ht('macbook-air'), 48, -4], ['product', ht('iphone-front'), 40, -10], ['has', ht('jobs-air-cut'), 34, 0], ['feature', ht('envelope'), 26, -4]];
  beats.forEach(([w, node, size, rot], i) => {
    const t0 = w === 'product' ? W('product', 1) : w === 'feature' ? W('feature', 1) : W(w);
    const t1 = i < beats.length - 1 ? (beats[i + 1][0] === 'product' ? W('product', 1) : beats[i + 1][0] === 'feature' ? W('feature', 1) : W(beats[i + 1][0])) : sets;
    obj(node, t0, t1, size, { r: rot });
    ring(t0, 64);
  });
  orbit(W('every'), sets, 80, 36);
  typed('every great product has a feature', W('every'), sets, 'red', -18, 38, 2.6, 30);

  // that sets it apart: a row in ink, one in red, lifted
  ground('cream', sets, W('kind'), 'lines');
  const row: [string, number][] = [['ipod', 20], ['macbook-air', 30], ['iphone-front', 24], ['jobs-air-cut', 20], ['envelope', 16]];
  row.forEach(([src, w], i) => {
    const x = (i - 2) * 34, hero = i === 2;
    const keys: Key[] = [{ t: sets - 0.01, o: 0, e: 'hold' }, { t: sets, x, y: 6, s: 1, o: 1, e: 'hold' }];
    if (hero) keys.push({ t: W('apart'), x, y: 6, s: 1, e: 'hold' }, { t: W('apart') + 0.35, y: -6, s: 1.5, e: 'back' });
    else keys.push({ t: W('everything'), x, e: 'hold' }, { t: W('everything') + 0.6, x: x + Math.sign(x) * 120, e: 'in' });
    add(<div className={hero ? 'v2-ht v2-hero' : 'v2-ht'} style={{ ['--m' as string]: `url(${SRC(src)})` }}><img src={SRC(src)} alt="" draggable={false} /><i /></div>, { z: 0, zi: hero ? 9 : 8, w, boil: 0.3 }, keys, exit('cut', W('kind'), C));
  });
  ring(W('apart'), 50, 'cream', true);
  label('SETS IT APART', W('apart'), W('kind'), 0, -36, 'cream');
  typed('from everything else out there', W('everything'), W('kind'), 'cream', 0, 34, 2.8, 30);

  ground('red', W('kind'), stop);
  typed('the kind that makes people', W('kind'), stop, 'red', 0, 0, 4.4, 24);
  word('STOP.', stop, W('tracks'), 'cream', { size: 60 });
  add(<div className="v2-flash" />, { z: 0, zi: 96, w: 400, h: 640, smooth: true }, [{ t: stop - 0.01, o: 0, e: 'hold' }, { t: stop, o: 1, e: 'hold' }, { t: stop + 0.12, o: 0, e: 'lin' }]);
  smear(W('tracks'));
  ground('grey', W('tracks'), call, 'grunge');
  typed('IN THEIR TRACKS.', W('tracks'), call, 'grey', 0, 0, 4.4, 20);
  add(<div className="v2-redact" />, { z: 0, zi: 13, w: 74, h: 8, clip: 'l', smooth: true }, enter('wipe', W('tracks') + 0.9, { x: 0, y: 0, r: -1 }, 0.25), exit('cut', call, C));

  // we call it the — the figures gather in the dark; a splash, and AHA
  ground('space', call, W('aha'));
  figures(call, W('aha'), 14, 501, 0.9);
  typed('we call it the', call, W('aha'), 'space', 0, 0, 5, 18);
  splat(W('aha') - 0.1, 502);
  const aha = W('aha');
  word('AHA', aha, C5, 'red', { size: 66, y: -4 });
  [aha, aha + 0.2, aha + 0.4, aha + 1.1, aha + 1.8].forEach((t, i) => ring(t, 80 + i * 8, 'red', i === 0));
  add(<span className="v2-script">moment.</span>, { z: 0, zi: 13, clip: 'l' }, enter('wipe', W('moment'), { x: 26, y: 26, r: -6 }, 0.6), exit('cut', C5, C));
}

/* ═════════ End card (charleshardy's ending: small type on red) ═════════ */
{
  const C5 = CUTS[5];
  ground('red', C5, END + 10);
  glitch(C5 - 0.15, 505);
  add(<span className="v2-word" style={{ fontSize: 'min(17vmin, 9.6vw)', color: 'var(--v2-cream)' }}>CREATIVE DIRECTOR</span>, { z: 0, zi: 10, boil: 0.4 }, span(C5 + 0.2, END + 10, { x: 0, y: -6 }));
  add(<div className="v2-endtext"><span>IDENTITY LABS</span><span>LONDON · SAN FRANCISCO · BANGALORE</span></div>, { z: 0, zi: 10 }, span(C5 + 0.7, END + 10, { x: 0, y: 14 }));
  add(<span className="v2-script">find the aha.</span>, { z: 0, zi: 11, clip: 'l' }, enter('wipe', C5 + 1.1, { x: 14, y: 26, r: -6 }, 0.8), exit('cut', END + 10, C));
}

/* the camera barely moves; a slow push inside each movement */
const CAM: Key[] = [];
CUTS.forEach((c, i) => { CAM.push({ t: c, x: 0, y: 0, s: 1, r: 0, e: 'hold' }); if (CUTS[i + 1]) CAM.push({ t: CUTS[i + 1] - 0.01, s: 1.05, e: 'lin' }); });
CAM.push({ t: END, s: 1.04, e: 'lin' });

export const FILM3: FilmDef = {
  id: '3', name: 'Mix', layers: defs, camera: CAM, cuts: CUTS, chapters: CHAPTERS, end: END, poster: 1.3, cls: 'v2 v3',
  assets: ['crumpled', 'news-post', 'applause', 'audience', 'envelope', 'iphone-front', 'ipod', 'jobs-air-cut', 'jobs-air-front', 'jobs-air-side', 'jobs-head-cut', 'jobs-stage', 'macbook-air', 'macworld-iphone', 'team-1', 'team-3'],
};
