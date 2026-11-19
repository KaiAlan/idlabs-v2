/* /exp/cd — variant 5, "Sketchbook". The storyline of the team's sketch reference
   (2026-11-19): one ink drawing on cream paper that builds up as the voice speaks — "2007"
   typed, "Apple Keynote" written and underlined, the two shrinking into the corner; the
   presenter drawn in; three icons, repeated until they crowd the page; the audience filling
   in row by row; the icons becoming one phone — and then the camera pulls back: it was a
   laptop screen on a desk, beside a notebook where the narration is being written by hand.

   The rest of the voice-over continues on that desk: each part sketched on its own sheet,
   the camera travelling from sheet to sheet while the notebook keeps being written, and at
   the end it pulls back to the whole desk. Same engine and voice-over (engine.ts, vo.ts). */

import type { ReactNode } from 'react';
import { enter, exit, type Key } from './engine';
import { rng } from './kit';
import { W, WORDS } from './vo';
import { InkAir, InkArrow, InkBurst, InkCircle, InkCrowd, InkEnvelope, InkFunnel, InkIcon, InkLaptop, InkPencil, InkPhone, InkPresenter, InkSnap, InkTeam, InkUnderline } from './sketch';
import type { Def, FilmDef } from './timeline';

const CUTS = [0, 26.9, 38.4, 51.4, 65.2, 77.4];
const END = 84;
const CHAPTERS = ['The keynote', 'The envelope', 'Memory', 'The work', 'The aha'];

const defs: Def[] = [];
let n = 0;
function add(node: ReactNode, o: Omit<Def, 'node' | 'id' | 'keys'>, ...keys: Key[][]) { defs.push({ id: `v5-${n++}`, node, ...o, keys: keys.flat() }); }
type P = { x: number; y: number; r?: number; s?: number };
const FOREVER = END + 10;
const stay = (t0: number, p: P, kind: Parameters<typeof enter>[0] = 'cut', d?: number): Key[] => enter(kind, t0, p, d);

/* ── nodes ── */
const hand = (text: string, size: number, red = false) => <span className={`v5-hand${red ? ' is-red' : ''}`} style={{ fontSize: `${size}vmin` }}>{text}</span>;
const serif = (text: string, size: number) => <span className="v5-serif" style={{ fontSize: `${size}vmin` }}>{text}</span>;
// a line drawing that strokes itself on when it appears
function ink(node: ReactNode, t0: number, p: P, w: number, o: { t1?: number; zi?: number; from?: Parameters<typeof enter>[0]; red?: boolean; extra?: Key[]; h?: number; d?: number } = {}) {
  add(node, { zi: o.zi ?? 5, w, h: o.h, cls: `cd-draw v5-ink${o.red ? ' is-red' : ''}`, boil: 0.12 }, enter(o.from ?? 'cut', t0, p, o.d ?? 0.5), o.extra ?? [], o.t1 !== undefined ? exit('fade', o.t1, p, 0.3) : []);
}
// handwriting, written left to right
function write(text: string, t0: number, p: P, size: number, o: { t1?: number; red?: boolean; d?: number; extra?: Key[]; zi?: number } = {}) {
  add(hand(text, size, o.red), { zi: o.zi ?? 8, clip: 'l', boil: 0.1 }, enter('wipe', t0, p, o.d ?? Math.min(1.4, 0.12 + text.length * 0.045)), o.extra ?? [], o.t1 !== undefined ? exit('fade', o.t1, p, 0.3) : []);
}
const underline = (t0: number, p: P, w: number, extra: Key[] = []) => ink(<InkUnderline style={{ width: '100%', height: '100%' }} />, t0, p, w, { red: true, h: w * 0.08, extra });
const sheet = (t0: number, p: P, w = 176, h = 112) => add(<div className="v5-sheet" />, { zi: 1, w, h, smooth: true }, stay(t0, p));

/* ── the desk ── */
add(<div className="v5-desk" />, { z: 0, zi: 0, w: 400, h: 640, smooth: true }, stay(0, { x: 0, y: 0 }));
// the laptop's screen is the first scene's paper; the laptop itself is drawn on the pull-back
const PULL = W('iphone', 1) + 0.9;
add(<div className="v5-screen" />, { zi: 1, w: 170, h: 106, smooth: true }, stay(0, { x: 0, y: 0 }));
ink(<InkLaptop style={{ width: '100%', height: '100%' }} />, PULL - 0.2, { x: 0, y: 8 }, 200, { h: 140, zi: 2 });

// the notebook: the narration, written by hand as it is spoken
add(<div className="v5-note"><p className="v5-date">Jan 9, 2007</p><p className="v5-text">{WORDS.map(([w], i) => <span key={i}>{w} </span>)}</p></div>, {
  zi: 3, w: 118, h: 152, smooth: true,
  fx: (t, el) => {
    const spans = el.querySelectorAll<HTMLElement>('.v5-text span');
    spans.forEach((s, i) => s.classList.toggle('on', WORDS[i][1] <= t));
  },
}, stay(PULL - 0.3, { x: 172, y: 2, r: 2 }));
ink(<InkPhone screen={false} style={{ width: '100%' }} />, PULL + 0.2, { x: 116, y: 74, r: 22 }, 16, { zi: 4 });
ink(<InkPencil style={{ width: '100%' }} />, PULL + 0.4, { x: 178, y: 86, r: -8 }, 64, { zi: 4 });

/* ═════════ 1 · The keynote, on the laptop screen ═════════ */
{
  const corner = W('steve') - 0.4;
  // "2007", typed; "Apple Keynote", written and underlined; both move to the corner
  add(serif('2007', 22), {
    zi: 8, smooth: true,
    fx: (t, el) => { const k = Math.max(0, Math.min(4, Math.floor((t - W('2007') + 0.25) * 9))); const s = '2007'.slice(0, k); if (el.firstChild!.textContent !== s) el.firstChild!.textContent = s; },
  }, stay(W('2007') - 0.25, { x: 0, y: -14 }), [{ t: corner, x: 0, y: -14, s: 1, e: 'hold' }, { t: corner + 0.7, x: -64, y: -42, s: 0.3, e: 'io' }]);
  write('Apple Keynote', W('keynote') - 0.1, { x: 0, y: 6 }, 10, { d: 0.8, extra: [{ t: corner, x: 0, y: 6, s: 1, e: 'hold' }, { t: corner + 0.7, x: -63, y: -36.5, s: 0.3, e: 'io' }] });
  underline(W('keynote') + 0.6, { x: -2, y: 13 }, 46, [{ t: corner, x: -2, y: 13, s: 1, e: 'hold' }, { t: corner + 0.7, x: -63.5, y: -34.5, s: 0.3, e: 'io' }]);

  // the presenter, drawn in from the bottom right
  ink(<InkPresenter style={{ width: '100%' }} />, W('steve') - 0.2, { x: 56, y: 22 }, 44, { from: 'right', d: 1.1, zi: 6 });

  // three icons, labelled as they are named; then shuffled with every "again"
  const X = [-42, -18, 6], icons: ['pod' | 'phone' | 'web', string, string][] = [['pod', 'ipod', 'an iPod'], ['phone', 'phone', 'a phone'], ['web', 'internet', 'an internet communicator']];
  const order = [[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1]];
  const ag = [W('again'), W('again', 1), W('again', 2)], conv = W('he', 1), one = W('one');
  icons.forEach(([kind, w, label], i) => {
    const keys: Key[] = [];
    ag.forEach((t, k) => { const from = X[order[k].indexOf(i)], to = X[order[k + 1].indexOf(i)]; keys.push({ t, x: from, y: -2, e: 'hold' }, { t: t + 0.4, x: to, y: k % 2 ? -2 : -6, e: 'back' }); });
    keys.push({ t: conv, x: X[order[3].indexOf(i)], y: -2, s: 1, o: 1, e: 'hold' }, { t: conv + 0.8, x: -14, y: -6, s: 0.2, o: 0, e: 'in' });
    ink(<InkIcon kind={kind} style={{ width: '100%' }} />, W(w), { x: X[i], y: -2 }, 15, { from: 'pop', d: 0.35, zi: 7, extra: keys });
    write(label, W(w) + 0.15, { x: X[i] + (i === 2 ? 6 : 0), y: 9 }, 3.4, { t1: W('he') });
  });
  // with each "again", more of them, smaller, all over the page — and the words echo
  const r = rng(55);
  ag.forEach((t, k) => {
    for (let j = 0; j < 7; j++) {
      const x = -74 + r() * 120, y = -40 + r() * 26, kind = (['pod', 'phone', 'web'] as const)[(j + k) % 3];
      ink(<InkIcon kind={kind} style={{ width: '100%' }} />, t + j * 0.05, { x, y, r: (r() - 0.5) * 30 }, 6, { from: 'pop', d: 0.3, t1: conv, zi: 4, extra: [{ t: conv - 0.01, x, y, e: 'lin' }] });
    }
    write(['an iPod…', 'a phone…', 'an internet communicator…'][k], t + 0.1, [{ x: -30, y: -24 }, { x: 2, y: -30 }, { x: -40, y: -16 }][k], 4, { t1: conv });
  });

  // until the audience: row by row
  [[W('until'), 29, 3, 9], [W('until') + 0.3, 36, 4, 21], [W('audience'), 43, 5, 33]].forEach(([t, y, zi, seed]) =>
    ink(<InkCrowd n={15} seed={seed} cheer={seed === 33} style={{ width: '100%', height: '100%' }} />, t, { x: 0, y }, 170, { h: 24, from: 'up', d: 0.6, zi: zi + 6 }));
  write('Are you getting it?', W('realized') - 0.2, { x: 26, y: -27, r: -3 }, 5, { t1: conv + 0.6 });
  ink(<InkArrow style={{ width: '100%' }} />, W('realized') + 0.6, { x: 44, y: -19, r: 50 }, 10, { t1: conv + 0.6 });

  // one device: the phone
  ink(<InkPhone style={{ width: '100%' }} />, one, { x: -14, y: -8 }, 24, { from: 'zoom', d: 0.6, zi: 9 });
  write('one device,', W('device'), { x: 24, y: -28, r: -3 }, 4.4, { t1: W('iphone', 1) });
  ink(<InkBurst style={{ width: '100%' }} />, W('iphone', 1), { x: -14, y: -8 }, 56, { zi: 8 });
  write('iPhone.', W('iphone', 1), { x: -52, y: -4 }, 9);
  underline(W('iphone', 1) + 0.5, { x: -53, y: 3 }, 24);
}

/* ═════════ 2 · The envelope ═════════ */
{
  const X = 0, Y = 190;
  sheet(CUTS[1] - 0.6, { x: X, y: Y, r: -0.8 });
  write('MacBook Air', W('macbook'), { x: X - 44, y: Y - 40 }, 8);
  write('launch', W('launch'), { x: X - 6, y: Y - 38 }, 4.4);
  add(serif('2008', 10), { zi: 8, boil: 0.1 }, enter('fade', W('year'), { x: X + 60, y: Y - 40 }, 0.4));
  write('a year later', W('later') - 0.2, { x: X + 60, y: Y - 30 }, 3.4);
  // a thin laptop slides out of an inter-office envelope
  ink(<InkAir style={{ width: '100%' }} />, W('pulled') - 0.05, { x: X, y: Y + 6 }, 40, { zi: 5, extra: [{ t: W('pulled'), x: X, y: Y + 6, e: 'hold' }, { t: W('pulled') + 0.9, y: Y - 18, e: 'out' }] });
  ink(<InkEnvelope style={{ width: '100%' }} />, W('where'), { x: X, y: Y + 14, r: -2 }, 38, { from: 'drop', d: 0.5, zi: 6 });
  write('paper-thin', W('paper-thin'), { x: X + 50, y: Y - 18 }, 5, { red: true });
  ink(<InkArrow flip style={{ width: '100%' }} />, W('paper-thin') + 0.3, { x: X + 28, y: Y - 14, r: 10 }, 14, { red: true });
  [['manila', -52, Y + 2], ['office', -54, Y + 14], ['envelope', -48, Y + 26]].forEach(([w, x, y]) => {
    write(w as string, W(w as string), { x: X + (x as number), y: y as number }, 4.4);
    ink(<InkArrow style={{ width: '100%' }} />, W(w as string) + 0.25, { x: X + (x as number) + 22, y: (y as number) - 1, r: 6 }, 10);
  });
  ink(<InkCrowd n={9} seed={71} cheer style={{ width: '100%', height: '100%' }} />, W('left'), { x: X + 46, y: Y + 40 }, 76, { h: 13, from: 'up', zi: 7 });
  write('( speechless )', W('speechless'), { x: X + 50, y: Y + 26 }, 4.4, { red: true });
}

/* ═════════ 3 · Memory ═════════ */
{
  const X = 205, Y = 195, env = W('envelope', 1), ask = W('ask');
  sheet(CUTS[2] - 0.6, { x: X, y: Y, r: 1.2 });
  write('why do people still remember?', W('why'), { x: X - 22, y: Y - 42 }, 4.6);
  const snaps: ['stage' | 'phone' | 'envelope' | 'crowd' | 'laptop', number, number, number][] = [['stage', W('people'), -54, -8], ['phone', W('still'), -26, 6], ['envelope', W('remember', 1), 2, -6], ['crowd', W('these'), 30, 5], ['laptop', W('moments'), 58, -7]];
  snaps.forEach(([kind, t, dx, rot]) => {
    const p = { x: X + dx, y: Y - 14, r: rot };
    const extra: Key[] = kind === 'envelope' ? [{ t: env, x: p.x, y: p.y, s: 1, r: rot, e: 'hold' }, { t: env + 0.5, x: X, y: Y - 6, s: 2.2, r: 0, e: 'back' }] : [{ t: env - 0.01, o: 1, e: 'hold' }, { t: env + 0.3, o: 0.18, e: 'lin' }];
    ink(<InkSnap kind={kind} style={{ width: '100%' }} />, t, p, 20, { from: 'drop', d: 0.4, zi: kind === 'envelope' ? 9 : 5, extra });
  });
  // twenty years: a timeline, a dot travelling along it
  ink(<InkUnderline style={{ width: '100%', height: '100%' }} />, W('20'), { x: X, y: Y + 18 }, 120, { h: 6, t1: ask });
  add(serif('2007', 3.6), { zi: 8 }, enter('fade', W('20'), { x: X - 60, y: Y + 25 }, 0.3), exit('fade', ask, { x: X - 60, y: Y + 25 }, 0.3));
  add(serif('2026', 3.6), { zi: 8 }, enter('fade', W('years'), { x: X + 60, y: Y + 25 }, 0.3), exit('fade', ask, { x: X + 60, y: Y + 25 }, 0.3));
  add(<div className="v5-dot" />, { zi: 9, w: 2.4, h: 2.4 }, enter('cut', W('20'), { x: X - 60, y: Y + 17 }), [{ t: W('years'), x: X - 60, e: 'hold' }, { t: W('later', 1), x: X + 60, e: 'io' }], exit('fade', ask, { x: X + 60, y: Y + 17 }, 0.3));
  write('20 years', W('20'), { x: X - 8, y: Y + 10 }, 5);
  write('later?', W('later', 1), { x: X + 34, y: Y + 9 }, 5, { red: true, t1: ask });
  // ask anyone: they still say the lines
  ink(<InkCrowd n={8} seed={88} style={{ width: '100%', height: '100%' }} />, ask, { x: X, y: Y + 40 }, 90, { h: 14, from: 'up', zi: 7 });
  [['“the envelope!”', -52, 22, 'anyone'], ['“one device”', 2, 26, 'watched#1'], ['“are you getting it?”', 54, 22, 'remember#2']].forEach(([txt, dx, dy, w]) => {
    const [ww, nth] = (w as string).split('#');
    write(txt as string, W(ww, nth ? Number(nth) : 0), { x: X + (dx as number), y: Y + (dy as number) }, 3.8, { t1: env });
  });
  ink(<InkCircle style={{ width: '100%', height: '100%' }} />, W('exact'), { x: X + 2, y: Y - 12 }, 150, { h: 36, red: true, t1: env });
  write('Are you getting it?', W('are'), { x: X, y: Y + 30 }, 7, { red: true, zi: 12 });
}

/* ═════════ 4 · The work ═════════ */
{
  const X = 0, Y = 330, narrow = W('narrowed'), oneT = W('one', 1);
  sheet(CUTS[3] - 0.6, { x: X, y: Y, r: -1 });
  write('born as a', W('born'), { x: X - 46, y: Y - 42 }, 4.4);
  write('fluke', W('fluke'), { x: X - 16, y: Y - 40 }, 9);
  ink(<InkUnderline style={{ width: '100%', height: '100%' }} />, W('fluke') + 0.4, { x: X - 15, y: Y - 40, r: -6 }, 30, { red: true, h: 3 });
  write('not a', W('fluke') + 0.6, { x: X - 34, y: Y - 48 }, 4.4, { red: true });
  // the team, round a table
  const dim: Key[] = [{ t: narrow - 0.01, o: 1, e: 'hold' }, { t: narrow + 0.4, o: 0.22, e: 'lin' }];
  ink(<InkTeam style={{ width: '100%' }} />, W('team'), { x: X - 34, y: Y + 4 }, 104, { zi: 5, extra: dim });
  write('understood the product', W('understood'), { x: X + 46, y: Y - 22 }, 4.2, { extra: dim });
  write('in depth ↓', W('depth'), { x: X + 52, y: Y - 12 }, 4.2, { red: true, extra: dim });
  // narrowed down: the funnel
  ink(<InkFunnel style={{ width: '100%' }} />, narrow, { x: X + 50, y: Y + 6 }, 36, { zi: 7 });
  ['price', 'colours', 'storage', 'camera', 'speed'].forEach((f, i) => {
    const x = X + 30 + i * 10, y = Y - 20 - (i % 2) * 5;
    write(f, narrow + 0.1 + i * 0.12, { x, y }, 3.2, { extra: [{ t: oneT - 0.5 + i * 0.06, x, y, s: 1, o: 1, e: 'hold' }, { t: oneT + i * 0.06, x: X + 50, y: Y + 10, s: 0.3, o: 0, e: 'in' }] });
  });
  write('the one feature', oneT, { x: X + 50, y: Y + 32 }, 5, { red: true });
  ink(<InkCircle style={{ width: '100%', height: '100%' }} />, W('exceptional'), { x: X + 50, y: Y + 32 }, 48, { h: 14, red: true });
  ink(<InkBurst style={{ width: '100%' }} />, W('exceptional'), { x: X + 76, y: Y + 26 }, 14, { zi: 7 });
  // worked backwards: a chain written right to left
  write('worked backwards ←', W('worked'), { x: X + 46, y: Y + 46 }, 4.2);
  [['find', W('find'), X + 10], ['the best way', W('best'), X - 30], ['to show it.', W('show'), X - 70]].forEach(([txt, t, x]) => {
    ink(<InkArrow flip style={{ width: '100%' }} />, (t as number) - 0.05, { x: (x as number) + 22, y: Y + 46 }, 10);
    write(txt as string, t as number, { x: x as number, y: Y + 46 }, 4.2, { red: txt === 'to show it.' });
  });
}

/* ═════════ 5 · The aha ═════════ */
{
  const X = 205, Y = 335, call = W('call') - 0.1, apart = W('apart');
  sheet(CUTS[4] - 0.6, { x: X, y: Y, r: 0.8 });
  write('every great product has a feature', W('every'), { x: X, y: Y - 42 }, 4.8, { d: 1.6, t1: call });
  const row: [ReactNode, number, string, number][] = [
    [<InkIcon key="a" kind="pod" style={{ width: '100%' }} />, 12, 'every', -60], [<InkAir key="b" style={{ width: '100%' }} />, 26, 'great', -32],
    [<InkPhone key="c" style={{ width: '100%' }} />, 12, 'product#1', 0], [<InkEnvelope key="d" style={{ width: '100%' }} />, 15, 'has', 30], [<InkIcon key="e" kind="web" style={{ width: '100%' }} />, 12, 'feature#1', 58],
  ];
  row.forEach(([node, w, word, dx]) => {
    const [ww, nth] = word.split('#'), t = W(ww, nth ? Number(nth) : 0);
    const p = { x: X + dx, y: Y - 10 };
    const extra: Key[] = dx === 0 ? [{ t: apart, x: p.x, y: p.y, s: 1, e: 'hold' }, { t: apart + 0.5, y: Y - 16, s: 1.5, e: 'back' }]
      : [{ t: W('everything') - 0.01, o: 1, e: 'hold' }, { t: W('everything') + 0.4, o: 0.22, e: 'lin' }];
    ink(node, t, p, w, { from: 'pop', d: 0.35, zi: dx === 0 ? 8 : 6, extra, t1: call });
  });
  ink(<InkCircle style={{ width: '100%', height: '100%' }} />, apart + 0.4, { x: X, y: Y - 16 }, 34, { h: 40, red: true, t1: call });
  write('sets it apart', apart, { x: X + 26, y: Y + 10 }, 4.2, { red: true, t1: call });
  ink(<InkCrowd n={10} seed={99} style={{ width: '100%', height: '100%' }} />, W('kind'), { x: X, y: Y + 38 }, 110, { h: 16, from: 'up', zi: 7 });
  write('STOP.', W('stop'), { x: X + 56, y: Y + 22 }, 8, { red: true, t1: call });
  write('in their tracks', W('tracks'), { x: X - 46, y: Y + 22 }, 4.2, { t1: call });
  write('we call it the', W('call'), { x: X - 34, y: Y - 30 }, 5.2);
  write('aha', W('aha') - 0.05, { x: X + 4, y: Y - 6 }, 26, { red: true, d: 0.5 });
  ink(<InkCircle style={{ width: '100%', height: '100%' }} />, W('aha') + 0.35, { x: X + 4, y: Y - 6 }, 80, { h: 46 });
  ink(<InkBurst style={{ width: '100%' }} />, W('aha') + 0.1, { x: X + 4, y: Y - 6 }, 110, { zi: 4 });
  write('moment.', W('moment'), { x: X + 46, y: Y + 14 }, 6);
}

/* ═════════ End: the whole desk, and a note on top ═════════ */
{
  const t0 = CUTS[5] + 1.6;
  add(<div className="v5-card"><span className="v5-hand">Creative Director</span><span className="v5-sub">Identity Labs — find the aha.</span></div>, { z: 0, zi: 70, boil: 0.1 }, enter('drop', t0, { x: 0, y: 0, r: -2 }, 0.6));
}

/* the camera: inside the laptop screen, back to the desk, then sheet to sheet, then everything */
export const CAMERA5: Key[] = [
  { t: 0, x: 0, y: 0, s: 1.04, r: 0 },
  { t: PULL - 0.3, x: 0, y: 0, s: 1, e: 'lin' },
  { t: PULL + 1.6, x: 66, y: 6, s: 0.42, e: 'io' },
  { t: CUTS[1], x: 64, y: 8, s: 0.43, e: 'lin' },
  { t: CUTS[1] + 1.0, x: 0, y: 190, s: 0.86, r: 0.8, e: 'io' },
  { t: CUTS[2] - 0.2, x: 2, y: 190, s: 0.9, r: 0.8, e: 'lin' },
  { t: CUTS[2] + 0.9, x: 205, y: 195, s: 0.86, r: -1.2, e: 'io' },
  { t: CUTS[3] - 0.2, x: 207, y: 195, s: 0.9, r: -1.2, e: 'lin' },
  { t: CUTS[3] + 0.9, x: 0, y: 330, s: 0.86, r: 1, e: 'io' },
  { t: CUTS[4] - 0.2, x: 2, y: 330, s: 0.9, r: 1, e: 'lin' },
  { t: CUTS[4] + 0.9, x: 205, y: 335, s: 0.86, r: -0.8, e: 'io' },
  { t: W('aha'), x: 205, y: 335, s: 0.9, e: 'lin' },
  { t: CUTS[5], x: 205, y: 335, s: 0.92, e: 'lin' },
  { t: CUTS[5] + 2.2, x: 100, y: 160, s: 0.2, r: 0, e: 'io' },
  { t: END, x: 100, y: 160, s: 0.21, e: 'lin' },
];

export const FILM5: FilmDef = {
  id: '5', name: 'Sketchbook', layers: defs, camera: CAMERA5, cuts: CUTS, chapters: CHAPTERS, end: END, poster: 5.4, cls: 'v5',
  assets: [],
};
