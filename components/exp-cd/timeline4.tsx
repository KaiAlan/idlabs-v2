/* /exp/cd — variant 4, "The file". The keynotes as a case file, after valuable826's
   documentary grunge (2026-11-19): grey newsprint, black-and-white press photos slid in as
   torn clippings, typewriter lines, yellow highlighter, red marker circles and arrows,
   redaction bars, rubber stamps, exhibit labels; a camcorder timecode in the corner, a
   handheld camera, smear cuts and pages peeled away. "Worked backwards" is the tape
   rewinding. Same engine and voice-over as the other variants (engine.ts, vo.ts). */

import type { ReactNode } from 'react';
import { enter, exit, type Key } from './engine';
import { rng, torn } from './kit';
import { W } from './vo';
import { PhoneIcon, PodIcon, WebIcon, Scrawl } from './art';
import type { Def, FilmDef } from './timeline';

const CUTS = [0, 26.8, 38.6, 51.7, 65.6, 78.25];
const END = 82;
const CHAPTERS = ['Exhibit A', 'Exhibit B', 'Witnesses', 'The method', 'Findings'];
const SRC = (n: string) => `/exp/cd/${n}.webp`;
const C = { x: 0, y: 0 };

const defs: Def[] = [];
let n = 0;
function add(node: ReactNode, o: Omit<Def, 'node' | 'id' | 'keys'>, ...keys: Key[][]) { defs.push({ id: `v4-${n++}`, node, ...o, keys: keys.flat() }); }
type P = { x: number; y: number; r?: number; s?: number };
const span = (t0: number, t1: number, p: P = C): Key[] => [...enter('cut', t0, p), ...exit('cut', t1, p)];

/* ── grounds ── */
const paper = (t0: number, t1: number) => add(<div className="v2-ground v3-grey v2-tex-grunge" />, { z: 0, zi: 0, w: 400, h: 640, smooth: true }, span(t0, t1));
const black = (t0: number, t1: number) => add(<div className="v2-ground v4-black" />, { z: 0, zi: 0, w: 400, h: 640, smooth: true }, span(t0, t1));

/* ── type ── */
function head(text: string, t0: number, t1: number, o: { y?: number; x?: number; size?: number; on?: 'paper' | 'black'; red?: boolean; hl?: boolean; mark?: boolean; r?: number } = {}) {
  const fs = `min(${o.size ?? 38}vmin, ${(160 / Math.max(2, text.length)).toFixed(1)}vw)`;
  const p = { x: o.x ?? 0, y: o.y ?? 0, r: o.r ?? 0 };
  if (o.hl) add(<div className="v3-hl" />, { z: 0, zi: 9, w: Math.min(150, text.length * 12 * ((o.size ?? 38) / 38)), h: 12 * ((o.size ?? 38) / 38), clip: 'l', smooth: true }, enter('wipe', t0 + 0.1, { x: p.x, y: p.y + 7 * ((o.size ?? 38) / 38), r: -1.5 }, 0.2), exit('cut', t1, C));
  if (o.mark) add(<Scrawl style={{ width: '100%', height: '100%' }} />, { z: 0, zi: 11, w: Math.min(170, text.length * 15 * ((o.size ?? 38) / 38)), h: 46 * ((o.size ?? 38) / 38), cls: 'v2-mark cd-draw' }, span(t0 + 0.15, t1, p));
  const cls = o.on === 'black' ? 'v4-head is-light' : o.red ? 'v4-head is-red' : 'v2-word is-ink is-rough v4-head';
  add(<span className={cls} style={{ fontSize: fs }}>{text}</span>, { z: 0, zi: 10, boil: 0.45 },
    [{ t: t0 - 0.01, o: 0, e: 'hold' }, { t: t0, ...p, s: 1.12, o: 1, e: 'hold' }, { t: t0 + 0.14, s: 1, e: 'out' }, { t: t1, s: 1.025, e: 'lin' }], exit('cut', t1, p));
}
function type(text: string, t0: number, t1: number, x = 0, y = 0, o: { size?: number; rate?: number; light?: boolean; left?: boolean } = {}) {
  const rate = o.rate ?? 24;
  add(<span className={`v4-type${o.light ? ' is-light' : ''}${o.left ? ' is-left' : ''}`} style={{ fontSize: `${o.size ?? 3}vmin` }}>{''}</span>, {
    z: 0, zi: 12, smooth: true,
    fx: (t, el) => { const k = Math.max(0, Math.min(text.length, Math.floor((t - t0) * rate))); const s = text.slice(0, k); if (el.firstChild!.textContent !== s) el.firstChild!.textContent = s; },
  }, span(t0, t1, { x, y }));
}
// documentary lower third: a yellow bar, black type
const lower = (name: string, sub: string, t0: number, t1: number, x = -40, y = 30) =>
  add(<div className="v4-lower"><b>{name}</b><span>{sub}</span></div>, { z: 0, zi: 20, clip: 'l', smooth: true }, enter('wipe', t0, { x, y }, 0.25), exit('cut', t1, C));
function stamp(text: string, t0: number, t1: number, x: number, y: number, r = -8, size = 5) {
  add(<span className="v4-stamp" style={{ fontSize: `${size}vmin` }}>{text}</span>, { z: 0, zi: 30, boil: 0.2 },
    [{ t: t0 - 0.01, o: 0, e: 'hold' }, { t: t0, x, y, r, s: 1.8, o: 0, e: 'hold' }, { t: t0 + 0.12, s: 1, o: 1, e: 'in' }], exit('cut', t1, { x, y }));
}
const redact = (t0: number, t1: number, x: number, y: number, w: number, h = 6, r = -1) =>
  add(<div className="v2-redact" />, { z: 0, zi: 25, w, h, clip: 'l', smooth: true }, enter('wipe', t0, { x, y, r }, 0.16), exit('cut', t1, C));
const hl = (t0: number, t1: number, x: number, y: number, w: number, h = 5) =>
  add(<div className="v3-hl" />, { z: 0, zi: 11, w, h, clip: 'l', smooth: true }, enter('wipe', t0, { x, y, r: -1 }, 0.22), exit('cut', t1, C));
const circle = (t0: number, t1: number, x: number, y: number, w: number, h: number) =>
  add(<Scrawl style={{ width: '100%', height: '100%' }} />, { z: 0, zi: 26, w, h, cls: 'v2-mark cd-draw' }, span(t0, t1, { x, y }));
const arrow = (t0: number, t1: number, x: number, y: number, r: number, w = 22) =>
  add(<svg viewBox="0 0 100 40" style={{ width: '100%', overflow: 'visible' }}><g className="ln-wrap"><path pathLength={1} className="ln" d="M2 30C30 6 60 4 92 16" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" /><path pathLength={1} className="ln" d="M78 6l15 10-14 10" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></g></svg>,
    { z: 0, zi: 27, w, cls: 'v2-mark cd-draw' }, span(t0, t1, { x, y, r }));

/* ── press clippings: B&W photographs with torn edges, slid onto the page ── */
type From = 'left' | 'right' | 'up' | 'down' | 'drop' | 'cut' | 'zoom';
function clip(src: string, t0: number, t1: number, p: P & { w: number; h: number }, o: { from?: From; color?: boolean; pos?: string; seed?: number; cap?: string; out?: 'cut' | 'left' | 'right' | 'fall' } = {}) {
  const { w, h, ...pose } = p;
  add(<div className="v4-clip" style={{ clipPath: torn(o.seed ?? (w * 7 + h) % 97, 2.2, 18) }}><img className={o.color ? undefined : 'is-bw'} src={SRC(src)} alt="" draggable={false} style={{ objectPosition: o.pos }} />{o.cap && <em>{o.cap}</em>}</div>,
    { z: 1, zi: 5, w, h, boil: 0.15 }, enter(o.from ?? 'right', t0, pose, 0.32), exit(o.out ?? 'cut', t1, pose, 0.3));
}
// a colour cut-out (products), as an exhibit
function exhibit(src: string, t0: number, t1: number, p: P & { w: number }, label?: string) {
  const { w, ...pose } = p;
  add(<img className="cd-cutimg v4-cut" src={SRC(src)} alt="" draggable={false} />, { z: 1, zi: 6, w, boil: 0.2 }, enter('pop', t0, pose, 0.35), exit('cut', t1, pose));
  if (label) add(<span className="v4-tag">{label}</span>, { z: 0, zi: 28 }, span(t0 + 0.15, t1, { x: pose.x + w * 0.35, y: pose.y + w * 0.32, r: -4 }));
}
const icon = (I: typeof PodIcon, t0: number, t1: number, x: number, y: number, w = 9) =>
  add(<div className="v4-icon"><I style={{ width: '100%' }} /></div>, { z: 1, zi: 7, w, boil: 0.2 }, enter('pop', t0, { x, y }, 0.3), exit('cut', t1, { x, y }));

/* ── cuts ── */
function smear(t: number) {
  add(<div className="v3-smear v3-smear-grey" />, { z: 0, zi: 93, w: 400, h: 640, smooth: true }, [{ t: t - 0.12, o: 0, e: 'hold' }, { t: t - 0.11, x: 60, o: 1, e: 'hold' }, { t: t + 0.1, x: -60, e: 'lin' }, { t: t + 0.11, o: 0, e: 'hold' }]);
}
// the page peels away (a sheet tearing off towards the top left)
function peel(t: number) {
  add(<div className="v2-ground v3-grey v2-tex-grunge v4-peel" />, { z: 0, zi: 92, w: 230, h: 170, smooth: true },
    [{ t: t - 0.01, o: 0, e: 'hold' }, { t, x: 0, y: 0, r: 0, s: 1, o: 1, e: 'hold' }, { t: t + 0.45, x: -150, y: -130, r: -38, s: 0.9, e: 'in' }, { t: t + 0.46, o: 0, e: 'hold' }]);
}
function flash(t: number) {
  add(<div className="v2-flash" />, { z: 0, zi: 96, w: 400, h: 640, smooth: true }, [{ t: t - 0.01, o: 0, e: 'hold' }, { t, o: 0.9, e: 'hold' }, { t: t + 0.14, o: 0, e: 'lin' }]);
}

/* ── the camcorder: timecode, REC, file number, all the way through ── */
const tc = (t: number) => { const f = Math.floor((t % 1) * 25), s = Math.floor(t); return `00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`; };
let rewind0 = 0, rewind1 = 0;
add(<div className="v4-hud"><span className="v4-rec">● REC</span><span className="v4-tc">00:00:00:00</span></div>, {
  z: 0, zi: 80, smooth: true,
  fx: (t, el) => {
    // during the rewind the counter runs backwards, fast
    const shown = t > rewind0 && t < rewind1 ? rewind0 - (t - rewind0) * 14 : t;
    const s = el.querySelector('.v4-tc')!; const v = tc(Math.max(0, shown)); if (s.textContent !== v) s.textContent = v;
    el.classList.toggle('is-rw', t > rewind0 && t < rewind1);
  },
}, span(0, END + 10, { x: -62, y: -40 }));
add(<div className="v4-hud is-right"><span>FILE CD-001</span><span>CREATIVE DIRECTOR</span></div>, { z: 0, zi: 80 }, span(0, END + 10, { x: 64, y: -40 }));

/* ═════════ Exhibit A · the 2007 keynote ═════════ */
{
  const C1 = CUTS[1];
  black(0, W('2007'));
  type('IF YOU’VE WATCHED THE', 0.05, W('2007'), 0, 0, { size: 3.6, light: true });
  paper(W('2007'), W('you'));
  head('2007', W('2007'), W('iphone'), { hl: true, y: -4 });
  clip('jobs-stage', W('2007') + 0.15, W('iphone'), { x: 52, y: -18, r: 5, w: 40, h: 28 }, { from: 'right' });
  smear(W('iphone'));
  head('IPHONE', W('iphone'), W('keynote'), { y: -4 });
  clip('macworld-iphone', W('iphone') + 0.1, W('keynote'), { x: -54, y: 20, r: -6, w: 36, h: 28 }, { from: 'left', color: true });
  smear(W('keynote'));
  head('KEYNOTE', W('keynote'), W('you'), { mark: true, y: -4 });
  stamp('MACWORLD · S.F.', W('keynote') + 0.35, W('you'), 44, 26, -10, 4.4);
  type('9 JAN 2007 — MOSCONE CENTER', W('keynote') + 0.5, W('you'), -36, 30, { size: 2.2 });

  // you probably remember Steve Jobs announcing
  black(W('you'), W('three'));
  clip('jobs-stage', W('you'), W('three'), { x: 6, y: 0, r: -1.5, w: 118, h: 76 }, { from: 'cut', pos: '50% 40%' });
  type('YOU PROBABLY REMEMBER', W('you'), W('three'), -44, -32, { size: 2.6, light: true, left: true });
  lower('STEVE JOBS', 'CEO, APPLE INC. · MACWORLD 2007', W('steve'), W('three'), -36, 30);
  circle(W('announcing'), W('three'), 2, -4, 30, 40);
  arrow(W('announcing') + 0.2, W('three'), 34, -24, 150);

  // three products: an inventory
  paper(W('three'), W('he'));
  head('3', W('three'), W('he'), { red: true, size: 70, x: -50, y: -2 });
  type('PRODUCTS:', W('products'), W('he'), 10, -26, { size: 3.6, left: true });
  const items: [string, string, typeof PodIcon][] = [['ipod', '01  AN IPOD', PodIcon], ['phone', '02  A PHONE', PhoneIcon], ['internet', '03  AN INTERNET COMMUNICATOR', WebIcon]];
  items.forEach(([w, txt, I], i) => {
    type(txt, W(w) - 0.05, W('he'), 10, -12 + i * 12, { size: 3, left: true, rate: 40 });
    icon(I, W(w), W('he'), 2, -12 + i * 12, 8);
    hl(W(w) + 0.25, W('he'), 30, -12 + i * 12, 44, 4.6);
  });

  // again and again and again: the inventory, filed three more times, then AGAIN
  black(W('he'), W('until'));
  type('HE SAID THEM', W('he'), W('until'), 0, -30, { size: 3, light: true });
  [W('again'), W('again', 1), W('again', 2)].forEach((t, k) => {
    flash(t);
    const r = rng(60 + k);
    for (let j = 0; j <= k; j++) {
      add(<div className="v4-card"><b>INVENTORY</b>{['01 AN IPOD', '02 A PHONE', '03 AN INTERNET COMMUNICATOR'].map((s) => <span key={s}>{s}</span>)}</div>, { z: 1, zi: 6 + j, w: 46, boil: 0.25 },
        span(t, k === 2 ? W('until') : [W('again', 1), W('again', 2)][k], { x: -40 + j * 26 + (r() - 0.5) * 8, y: 4 + (r() - 0.5) * 12, r: (r() - 0.5) * 16 }));
    }
    add(<span className="v4-head is-light" style={{ fontSize: 'min(26vmin, 30vw)' }}>AGAIN</span>, { z: 0, zi: 20, boil: 0.5 }, span(t, k === 2 ? W('until') : [W('again', 1), W('again', 2)][k], { x: [-28, 20, 0][k], y: [-10, 14, 26][k], r: [-4, 3, -2][k] }));
  });

  // until the audience slowly realised
  paper(W('until'), W('he', 1));
  clip('applause', W('until'), W('he', 1), { x: 0, y: -2, r: 1.5, w: 120, h: 72 }, { from: 'up', pos: '50% 30%' });
  type('UNTIL THE AUDIENCE', W('until'), W('he', 1), -44, -40, { size: 2.6, left: true });
  type('slowly…', W('slowly'), W('he', 1), 30, -40, { size: 3 });
  stamp('REALISED.', W('realized'), W('he', 1), 4, 4, -9, 10);

  // one device, the iPhone
  paper(W('he', 1), W('the', 2));
  type('HE WAS TALKING ABOUT', W('he', 1), W('one'), 0, 0, { size: 3.4 });
  head('ONE', W('one'), W('device'), { size: 60, hl: true });
  head('DEVICE', W('device'), W('the', 2), { mark: true });
  black(W('the', 2), C1);
  type('THE', W('the', 2), W('iphone', 1), 0, 0, { size: 4, light: true });
  paper(W('iphone', 1), C1);
  exhibit('iphone-front', W('iphone', 1), C1, { x: 0, y: -2, r: -12, w: 46 }, 'EXHIBIT A');
  circle(W('iphone', 1) + 0.25, C1, 0, -2, 64, 52);
  type('THE IPHONE · 9.1.2007', W('iphone', 1) + 0.4, C1, -36, 32, { size: 2.6 });
  peel(C1);
}

/* ═════════ Exhibit B · the envelope ═════════ */
{
  const C2 = CUTS[2];
  paper(CUTS[1], W('where'));
  type('OR THE', W('or'), W('macbook'), 0, 0, { size: 3.6 });
  head('MACBOOK', W('macbook'), W('air'), { y: -6 });
  head('AIR', W('air'), W('launch'), { size: 64, hl: true, y: -4 });
  smear(W('launch'));
  head('LAUNCH', W('launch'), W('year'), { y: -6 });
  head('2008', W('year'), W('where'), { mark: true, y: -6 });
  type('A YEAR LATER', W('year') + 0.1, W('where'), 0, 28, { size: 2.6 });

  black(W('where'), W('paper-thin'));
  clip('jobs-air-front', W('where'), W('paper-thin'), { x: 18, y: -4, r: 2, w: 96, h: 64 }, { from: 'right' });
  clip('envelope', W('pulled'), W('paper-thin'), { x: -50, y: 12, r: -8, w: 26, h: 40 }, { from: 'left', color: true, cap: 'INTER-OFFICE' });
  arrow(W('laptop'), W('paper-thin'), -22, -14, -20, 26);
  type('WHERE HE PULLED THE LAPTOP OUT OF', W('where'), W('paper-thin'), -42, -40, { size: 2.4, light: true, left: true });

  paper(W('paper-thin'), W('manila'));
  clip('jobs-air-side', W('paper-thin'), W('manila'), { x: 0, y: -6, r: -1, w: 110, h: 60 }, { from: 'cut', pos: '50% 45%' });
  add(<div className="v2-hair" />, { z: 0, zi: 20, w: 160, h: 0.6, clip: 'l', smooth: true }, enter('wipe', W('paper-thin') + 0.2, { x: 0, y: 30 }, 0.3), exit('cut', W('manila'), C));
  type('PAPER-THIN · 0.16 IN', W('paper-thin') + 0.3, W('manila'), -50, 35, { size: 2.6, left: true });

  paper(W('manila'), W('left'));
  clip('envelope', W('manila'), W('left'), { x: 0, y: 0, r: -3, w: 44, h: 76 }, { from: 'drop', color: true });
  [['MANILA', 'manila', -46, -18], ['OFFICE', 'office', 46, -4], ['ENVELOPE', 'envelope', -40, 22]].forEach(([txt, w, x, y]) => {
    type(txt as string, W(w as string), W('left'), x as number, y as number, { size: 4, rate: 40 });
    hl(W(w as string) + 0.1, W('left'), x as number, (y as number) + 0.6, (txt as string).length * 3.4, 5);
  });
  circle(W('envelope') + 0.1, W('left'), 0, 0, 56, 86);

  black(W('left'), C2);
  clip('applause', W('left'), W('speechless'), { x: 0, y: 0, r: -1, w: 120, h: 72 }, { from: 'cut', pos: '50% 30%' });
  type('AND LEFT THE AUDIENCE', W('left'), W('speechless'), -44, -40, { size: 2.6, light: true, left: true });
  type('SPEECHLESS.', W('speechless'), C2, 0, 0, { size: 4, light: true, rate: 12 });
  peel(C2);
}

/* ═════════ Witnesses · why we remember ═════════ */
{
  const C2 = CUTS[2], C3 = CUTS[3];
  paper(C2, W('ask'));
  type('WHY DO PEOPLE STILL REMEMBER THESE MOMENTS', W('why'), W('20'), 0, -38, { size: 2.6 });
  const board: [string, string, P & { w: number; h: number }, From][] = [
    ['jobs-stage', 'why', { x: -48, y: -6, r: -6, w: 38, h: 28 }, 'left'], ['macworld-iphone', 'people', { x: 0, y: -14, r: 3, w: 32, h: 26 }, 'up'],
    ['jobs-air-front', 'still', { x: 48, y: -4, r: 5, w: 38, h: 26 }, 'right'], ['audience', 'remember#1', { x: -24, y: 20, r: 4, w: 36, h: 24 }, 'down'],
    ['envelope', 'moments', { x: 28, y: 22, r: -7, w: 18, h: 28 }, 'drop'],
  ];
  board.forEach(([src, w, p, from], i) => clip(src, w.includes('#') ? W(w.split('#')[0], 1) : W(w), W('20'), p, { from, color: src === 'envelope' || src === 'macworld-iphone', seed: 30 + i }));
  head('20 YEARS', W('20'), W('ask'), { hl: true, y: -6 });
  type('2007 → 2026', W('years'), W('ask'), 0, 22, { size: 3.4 });
  stamp('LATER?', W('later', 1), W('ask'), 40, 26, -8, 6);

  // ask anyone who watched them: witness photos, one after another
  black(W('ask'), W('exact'));
  type('ASK ANYONE WHO WATCHED THEM', W('ask'), W('exact'), -44, -40, { size: 2.6, light: true, left: true });
  const wit = ['20% 40%', '70% 45%', '40% 70%', '85% 30%', '30% 25%'];
  wit.forEach((pos, i) => {
    const t0 = W('anyone') + i * 0.42, t1 = i < wit.length - 1 ? W('anyone') + (i + 1) * 0.42 + 0.3 : W('exact');
    clip(i % 2 ? 'audience' : 'applause', t0, Math.min(t1, W('exact')), { x: (i - 2) * 22, y: (i % 2 ? -4 : 6), r: (i % 2 ? 4 : -4), w: 54, h: 40 }, { from: i % 2 ? 'right' : 'left', pos, seed: 40 + i });
    add(<span className="v4-tag">{`WITNESS ${String(i + 1).padStart(2, '0')}`}</span>, { z: 0, zi: 28 }, span(t0 + 0.1, Math.min(t1, W('exact')), { x: (i - 2) * 22 + 14, y: (i % 2 ? -4 : 6) + 18, r: -4 }));
  });
  paper(W('exact'), W('envelope', 1));
  head('EXACT', W('exact'), W('envelope', 1), { hl: true, y: -10 });
  head('MOMENTS', W('moments', 1), W('envelope', 1), { y: 16, size: 24, mark: true });

  // the envelope, and the question
  black(W('envelope', 1), W('are'));
  add(<div className="v4-clip"><img src={SRC('envelope')} alt="" draggable={false} /></div>, { z: 1, zi: 6, w: 34, h: 52, smooth: true },
    [{ t: W('envelope', 1) - 0.01, o: 0, e: 'hold' }, { t: W('envelope', 1), x: 0, y: 0, s: 0.6, r: -6, o: 1, e: 'hold' }, { t: W('are') - 0.02, s: 3.2, r: 0, e: 'in' }], exit('cut', W('are'), C));
  const q: [string, string, number][] = [['ARE', 'are', 0], ['YOU', 'you', 1], ['GETTING', 'getting', 0], ['IT?', 'it', 0]];
  q.forEach(([word, w, nth], i) => {
    const t0 = W(w, nth), t1 = i < 3 ? W(q[i + 1][1], q[i + 1][2]) : C3;
    (i % 2 ? black : paper)(t0, t1);
    head(word, t0, t1, { size: 56, on: i % 2 ? 'black' : 'paper', red: i === 3 });
  });
  smear(C3);
}

/* ═════════ The method ═════════ */
{
  const C3 = CUTS[3], C4 = CUTS[4];
  const fl = W('fluke'), they = W('they'), narrow = W('narrowed'), back = W('worked'), find = W('find');
  paper(C3, they);
  type('THESE WEREN’T MOMENTS BORN AS A', W('these', 2), they, 0, -26, { size: 3.2 });
  head('FLUKE', fl, they, { size: 44, y: 6 });
  redact(fl + 0.35, they, 0, 6, 120, 18, -1.5);
  stamp('NOT A FLUKE', fl + 0.6, they, 40, 28, -10, 4.4);

  paper(they, narrow);
  clip('team-1', they, narrow, { x: -22, y: -2, r: -2, w: 92, h: 62 }, { from: 'left' });
  lower('THE TEAM', 'APOLLO 13 · MISSION CONTROL · 1970', W('team'), narrow, -40, 32);
  type('THEY TOOK A TEAM', they, narrow, 30, -22, { size: 2.8, left: true });
  type('THAT UNDERSTOOD', W('understood'), narrow, 30, -12, { size: 2.8, left: true });
  type('THE PRODUCT', W('product'), narrow, 30, -2, { size: 2.8, left: true });
  hl(W('product') + 0.2, narrow, 40, -1.4, 22, 4.6);
  head('IN DEPTH', W('in'), narrow, { size: 13, x: 44, y: 16, red: true });
  circle(W('depth'), narrow, -30, -8, 40, 30);

  paper(narrow, back);
  type('NARROWED DOWN TO', narrow, back, -44, -36, { size: 2.6, left: true });
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
  }, span(narrow, back, { x: -10, y: 2 }));
  circle(W('exceptional'), back, -10, 9.5, 62, 16);
  stamp('EXCEPTIONAL', W('exceptional') + 0.1, back, 42, 18, -8, 4);

  // worked backwards: the tape rewinds
  rewind0 = back; rewind1 = find;
  black(back, find);
  const strip = ['team-3', 'jobs-stage', 'macworld-iphone', 'envelope', 'audience', 'jobs-air-front', 'applause', 'team-1', 'jobs-stage', 'macworld-iphone'];
  add(<div className="v4-strip">{[...strip, ...strip].map((s, i) => <img key={i} src={SRC(s)} alt="" draggable={false} />)}</div>, { z: 0, zi: 4, smooth: true },
    [{ t: back - 0.01, o: 0, e: 'hold' }, { t: back, x: -120, y: 2, o: 1, e: 'hold' }, { t: find, x: 120, e: 'in' }], exit('cut', find, C));
  add(<span className="v4-head is-light v4-rw">◀◀ WORKED BACKWARDS</span>, { z: 0, zi: 20, boil: 0.5 }, span(W('backwards') - 0.1, find, { x: 0, y: -32 }));
  paper(find, C4);
  head('FIND', find, W('best'), { size: 56 });
  smear(W('best'));
  head('THE BEST WAY', W('best'), W('show'), { hl: true });
  head('TO SHOW IT.', W('show'), C4, { mark: true });
  peel(C4);
}

/* ═════════ Findings · the aha ═════════ */
{
  const C4 = CUTS[4], C5 = CUTS[5];
  const sets = W('sets'), stop = W('stop'), call = W('we'), aha = W('aha');
  paper(C4, W('kind'));
  type('EVERY GREAT PRODUCT HAS A FEATURE', W('every'), W('kind'), 0, -38, { size: 2.8 });
  const row: [string, number, string][] = [['ipod', 24, 'EXHIBIT B'], ['macbook-air', 34, 'EXHIBIT C'], ['iphone-front', 30, 'EXHIBIT D'], ['jobs-air-cut', 24, 'EXHIBIT E']];
  const at = [W('every'), W('great'), W('product', 1), W('feature', 1)];
  row.forEach(([src, w, tag], i) => {
    const x = (i - 1.5) * 38;
    exhibit(src, at[i], W('kind'), { x, y: 4, r: (i - 1.5) * 4, w }, tag);
    if (i !== 2) redact(W('everything') + i * 0.1, W('kind'), x, 4, w * 0.95, w * 0.45, -2);
  });
  circle(sets, W('kind'), (2 - 1.5) * 38, 4, 46, 40);
  stamp('SETS IT APART', W('apart'), W('kind'), 22, -22, -8, 4.4);
  type('— FROM EVERYTHING ELSE OUT THERE', W('everything'), W('kind'), 0, 34, { size: 2.6 });

  black(W('kind'), stop);
  type('THE KIND THAT MAKES PEOPLE', W('kind'), stop, 0, 0, { size: 3.6, light: true });
  paper(stop, call);
  flash(stop);
  stamp('STOP.', stop, call, 0, -6, -6, 22);
  type('IN THEIR TRACKS.', W('tracks'), call, 0, 26, { size: 3.4 });

  black(call, aha);
  type('WE CALL IT THE', call, aha, 0, 0, { size: 4, light: true, rate: 16 });
  paper(aha, C5);
  flash(aha);
  head('AHA', aha, C5, { size: 66, hl: true, y: -6 });
  circle(aha + 0.25, C5, 0, -6, 120, 64);
  type('moment.', W('moment'), C5, 30, 28, { size: 4.4, rate: 14 });
  stamp('CASE CLOSED', aha + 0.9, C5, -48, 30, -10, 3.6);
}

/* ═════════ End card ═════════ */
{
  const C5 = CUTS[5];
  black(C5, END + 10);
  add(<span className="v4-head is-light" style={{ fontSize: 'min(16vmin, 9.4vw)' }}>CREATIVE DIRECTOR</span>, { z: 0, zi: 10, boil: 0.35 }, span(C5 + 0.15, END + 10, { x: 0, y: -8 }));
  type('FILE CD-001 · IDENTITY LABS · LONDON / SAN FRANCISCO / BANGALORE', C5 + 0.5, END + 10, 0, 12, { size: 2, light: true, rate: 40 });
  stamp('OPEN', C5 + 1.2, END + 10, 36, 22, -8, 4.4);
}

/* the camera: handheld, a little drift and wobble the whole time */
const CAM: Key[] = [];
{
  const r = rng(909);
  for (let t = 0; t <= END; t += 0.6) CAM.push({ t, x: (r() - 0.5) * 2.2, y: (r() - 0.5) * 1.6, r: (r() - 0.5) * 0.6, s: 1.02 + r() * 0.02, e: 'io' });
}

export const FILM4: FilmDef = {
  id: '4', name: 'The file', layers: defs, camera: CAM, cuts: CUTS, chapters: CHAPTERS, end: END, poster: 1.4, cls: 'v2 v4',
  assets: ['crumpled', 'news-post', 'applause', 'audience', 'envelope', 'iphone-front', 'ipod', 'jobs-air-cut', 'jobs-air-front', 'jobs-air-side', 'jobs-stage', 'macbook-air', 'macworld-iphone', 'team-1', 'team-3'],
};
