/* /exp/cd — variant 6, "Site". Variant 5's storyline in the Identity Labs site's own language
   (2026-11-19): white paper, thin rules, the wordmark, small uppercase IBM Plex Mono with the
   spoken word lit in a black box (as on the home page), a light sans for headlines,
   Instrument Serif for figures, photographs in equal frames, calm eased motion.

   Layout: every frame sits on one grid (local units, vmin at camera scale 1), so things line
   up — a label row at the top (y −42), a headline row (y −28), then a left column (x −70 to
   −6) and a right column (x 30 to 70), text always anchored to the column's left edge.

   The story (variant 5's): the keynote builds inside a screen; the camera pulls back — a
   laptop beside a page where the narration is being set, word by word; then panel to panel,
   one per part; at the end, all of them. Same engine and voice-over (engine.ts, vo.ts). */

import type { ReactNode } from 'react';
import type { Key } from './engine';
import { W, WORDS } from './vo';
import { PhoneIcon, PodIcon, WebIcon } from './art';
import type { Def, FilmDef } from './timeline';

const CUTS = [0, 27.8, 38.4, 51.4, 65.2, 77.4];
const END = 84;
const FOREVER = END + 10;
const CHAPTERS = ['The keynote', 'The envelope', 'Memory', 'The work', 'The aha'];
const SRC = (n: string) => `/exp/cd/${n}.webp`;

/* the grid */
const LX = -70, RX = 30, EDGE = 70, LABEL = -42, HEAD = -28;

const defs: Def[] = [];
let n = 0;
type P = { x: number; y: number; s?: number };
function add(node: ReactNode, o: Omit<Def, 'node' | 'id' | 'keys' | 'smooth'>, ...keys: Key[][]) { defs.push({ id: `v6-${n++}`, node, smooth: true, ...o, keys: keys.flat() }); }
const rise = (t: number, p: P, d = 0.5): Key[] => [{ t: t - 0.01, o: 0, e: 'hold' }, { t, x: p.x, y: p.y + 1.2, s: p.s ?? 1, o: 0, e: 'hold' }, { t: t + d, y: p.y, o: 1, e: 'out' }];
const fadeIn = (t: number, p: P, d = 0.4): Key[] => [{ t: t - 0.01, o: 0, e: 'hold' }, { t, x: p.x, y: p.y, s: p.s ?? 1, o: 0, e: 'hold' }, { t: t + d, o: 1, e: 'lin' }];
const fadeOut = (t: number, d = 0.3, to = 0): Key[] => [{ t, o: 1, e: 'hold' }, { t: t + d, o: to, e: 'lin' }];
const moveTo = (t0: number, t1: number, from: P, to: P): Key[] => [{ t: t0, ...from, e: 'hold' }, { t: t1, ...to, e: 'io' }];
const at = (o: P, x: number, y: number): P => ({ x: o.x + x, y: o.y + y });
const word = (w: string) => { const [a, b] = w.split('#'); return W(a, b ? Number(b) : 0); };

/* ── type, anchored to a point on its left (or right) edge ── */
const left = (node: ReactNode) => <div className="v6-a">{node}</div>;
const right = (node: ReactNode) => <div className="v6-a is-r">{node}</div>;
const mono = (text: string, size = 1.4, dim = false) => <span className={`v6-mono${dim ? ' is-dim' : ''}`} style={{ fontSize: `${size}vmin` }}>{text}</span>;
const sans = (text: string, size: number, grey?: string) => <span className="v6-sans" style={{ fontSize: `${size}vmin` }}>{grey && <i>{grey} </i>}{text}</span>;
const serif = (text: string, size: number) => <span className="v6-serif" style={{ fontSize: `${size}vmin` }}>{text}</span>;
const framed = (src: string, o: { pos?: string; color?: boolean } = {}) => (
  <div className="v6-frame"><img className={`v6-photo${o.color ? '' : ' is-grey'}`} src={SRC(src)} alt="" draggable={false} style={{ objectPosition: o.pos }} /></div>
);
// a line of mono words, each lit as it is said, then left dark (the home page's highlighter)
function said(words: string[][], p: P, t1: number, size = 1.6) {
  const ws = words.map(([w, k]) => [w, word(k)] as [string, number]);
  add(left(<span className="v6-said" style={{ fontSize: `${size}vmin` }}>{ws.map(([w], i) => <span key={i}>{w} </span>)}</span>), {
    zi: 20,
    fx: (t, el) => {
      const spans = el.querySelectorAll<HTMLElement>('.v6-said > span');
      ws.forEach(([, s], i) => { const nx = ws[i + 1]?.[1] ?? s + 0.6; spans[i].className = t >= s ? (t < nx ? 'is-lit' : 'is-on') : ''; });
    },
  }, fadeIn(ws[0][1] - 0.2, p, 0.2), fadeOut(t1));
}
// the top row of a frame: number and name on the left, place and date on the right
function labels(o: P, num: string, name: string, meta: string, t: number) {
  add(left(mono(`${num} — ${name.toUpperCase()}`, 1.3, true)), { zi: 20 }, fadeIn(t, at(o, LX, LABEL)));
  add(right(mono(meta, 1.3, true)), { zi: 20 }, fadeIn(t + 0.2, at(o, EDGE, LABEL)));
}

/* ── the world ── */
add(<div className="v6-paper" />, { z: 0, zi: 0, w: 400, h: 640 }, [{ t: 0, x: 0, y: 0, o: 1 }]);
add(<div className="v6-grid" />, { zi: 1, w: 1400, h: 1400 }, [{ t: 0, x: 100, y: 160, o: 1 }]);

/* ═════════ 1 · The keynote, on a screen ═════════ */
const PULL = W('iphone', 1) + 0.6;
const O1 = { x: 0, y: 0 };
add(<div className="v6-screen" />, { zi: 2, w: 170, h: 108 }, [{ t: 0, x: 0, y: 0, o: 1 }]);
{
  labels(O1, '01', 'The keynote', 'MACWORLD SAN FRANCISCO · 9.1.2007', 0.3);
  add(left(serif('2007', 20)), { zi: 10 }, rise(W('2007') - 0.1, at(O1, LX, -22), 0.6));
  add(left(mono('THE APPLE KEYNOTE', 1.6)), { zi: 10 }, rise(W('keynote'), at(O1, LX, -8)));
  // the presenter, framed, right column
  add(<div className="v6-frame is-product"><img className="v6-photo is-grey is-portrait" src={SRC('jobs-head-cut')} alt="" draggable={false} /></div>, { zi: 6, w: 40, h: 50 }, rise(W('steve') - 0.1, at(O1, RX + 20, -6), 0.7));
  add(left(mono('STEVE JOBS, CEO, APPLE', 1.2, true)), { zi: 7 }, fadeIn(W('jobs'), at(O1, RX, 22)));

  // three products, named; on every "again", the three names light up once more, in turn
  const IX = [LX + 7, LX + 27, LX + 47], items: [typeof PodIcon, string, string][] = [[PodIcon, 'ipod', 'IPOD'], [PhoneIcon, 'phone', 'PHONE'], [WebIcon, 'internet', 'INTERNET']];
  const ag = [W('again'), W('again', 1), W('again', 2)], conv = W('he', 1);
  items.forEach(([I, w, label], i) => {
    add(<div className="v6-icon"><I style={{ width: '100%' }} /></div>, { zi: 8, w: 13 }, rise(W(w), at(O1, IX[i], 10)), fadeOut(conv, 0.4));
    add(left(<span className="v6-tag">{label}</span>), {
      zi: 9,
      fx: (t, el) => { const on = [W(w), ...ag.map((a) => a + i * 0.28)].some((a) => t >= a && t < a + 0.32); el.querySelector('.v6-tag')!.classList.toggle('is-lit', on); },
    }, fadeIn(W(w) + 0.1, at(O1, IX[i] - 6.5, 20)), fadeOut(conv, 0.4));
  });
  ag.forEach((t, k) => add(left(mono(`× ${k + 2}`, 1.6)), { zi: 9 }, fadeIn(t, at(O1, LX + 58, 10)), fadeOut(ag[k + 1] ?? conv, 0.15)));

  // the audience: one band of dots across the screen, three rows
  [[W('until'), 31], [W('until') + 0.3, 34.5], [W('audience'), 38]].forEach(([t, y]) =>
    add(<div className="v6-crowd" />, { zi: 7, w: 140, h: 1.2 }, fadeIn(t, at(O1, 0, y), 0.6)));
  said([['UNTIL', 'until'], ['THE', 'the#1'], ['AUDIENCE', 'audience'], ['SLOWLY', 'slowly'], ['REALISED.', 'realized']], at(O1, LX, 26), W('he', 1) - 0.1);

  // one device
  add(<img className="v6-cut" src={SRC('iphone-front')} alt="" draggable={false} />, { zi: 9, w: 30 }, rise(W('one'), at(O1, LX + 20, 9), 0.7));
  add(left(serif('iPhone.', 9)), { zi: 10 }, rise(W('iphone', 1), at(O1, LX + 42, 10), 0.6));
  said([['HE', 'he#1'], ['WAS', 'was'], ['TALKING', 'talking'], ['ABOUT', 'about'], ['ONE', 'one'], ['DEVICE,', 'device'], ['THE', 'the#2'], ['IPHONE.', 'iphone#1']], at(O1, LX, 26), FOREVER);
}

/* the pull-back: a laptop, and beside it the narration being set */
add(<div className="v6-laptop" />, { zi: 3, w: 196, h: 132 }, fadeIn(PULL - 0.3, { x: 0, y: 9 }, 0.8));
add(<div className="v6-page"><p className="v6-page-head"><span>NARRATION</span><span>CREATIVE DIRECTOR</span></p><p className="v6-page-text">{WORDS.map(([w], i) => <span key={i}>{w.toUpperCase()} </span>)}</p></div>, {
  zi: 4, w: 120, h: 150,
  fx: (t, el) => {
    const spans = el.querySelectorAll<HTMLElement>('.v6-page-text span');
    spans.forEach((s, i) => { const st = WORDS[i][1], nx = WORDS[i + 1]?.[1] ?? st + 0.6; s.className = t >= st ? (t < nx ? 'is-lit' : 'is-on') : ''; });
  },
}, fadeIn(PULL - 0.2, { x: 172, y: 2 }, 0.8));

/* ── panels, one per part ── */
const panel = (o: P, i: number) => add(<div className="v6-panel" />, { zi: 2, w: 170, h: 108 }, fadeIn(CUTS[i - 1] - 0.8, o, 0.6));

/* ═════════ 2 · The envelope ═════════ */
{
  const O = { x: 0, y: 190 };
  panel(O, 2);
  labels(O, '02', 'The envelope', 'MACWORLD SAN FRANCISCO · 15.1.2008', CUTS[1] + 0.2);
  add(left(sans('MacBook Air.', 5.4, 'A year later,')), { zi: 10 }, rise(W('macbook'), at(O, LX, HEAD), 0.6));
  add(framed('jobs-air-front', { pos: '50% 30%' }), { zi: 6, w: 60, h: 40 }, rise(W('where'), at(O, LX + 30, 4), 0.6));
  add(framed('envelope', { color: true }), { zi: 6, w: 22, h: 40 }, rise(W('pulled'), at(O, RX - 15, 4), 0.6));
  add(left(<span className="v6-lit">PAPER-THIN</span>), { zi: 10 }, fadeIn(W('paper-thin'), at(O, RX, -12)));
  add(<div className="v6-rule" />, { zi: 9, w: 40, h: 0.25, clip: 'l' }, [{ t: W('paper-thin') + 0.09, o: 0, e: 'hold' }, { t: W('paper-thin') + 0.1, ...at(O, RX + 20, -6), c: 0, o: 1, e: 'hold' }, { t: W('paper-thin') + 0.6, c: 1, e: 'io' }]);
  add(left(mono('0.16 IN AT ITS THINNEST', 1.2, true)), { zi: 10 }, fadeIn(W('paper-thin') + 0.4, at(O, RX, -2)));
  [['MANILA', 'manila', 8], ['OFFICE', 'office', 12.5], ['ENVELOPE', 'envelope', 17]].forEach(([txt, w, y]) =>
    add(left(mono(txt as string, 1.4)), { zi: 10 }, fadeIn(W(w as string), at(O, RX, y as number))));
  said([['AND', 'and#3'], ['LEFT', 'left'], ['THE', 'the#5'], ['AUDIENCE', 'audience#1'], ['SPEECHLESS.', 'speechless']], at(O, LX, 32), FOREVER);
}

/* ═════════ 3 · Memory ═════════ */
{
  const O = { x: 205, y: 195 }, env = W('envelope', 1), ask = W('ask');
  panel(O, 3);
  labels(O, '03', 'Memory', '2007 — 2026', CUTS[2] + 0.2);
  add(left(sans('remember these moments?', 5, 'Why do people still')), { zi: 10 }, rise(W('why'), at(O, LX, HEAD), 0.6));
  const snaps: [string, string, boolean][] = [['jobs-stage', 'people', false], ['macworld-iphone', 'still', true], ['envelope', 'remember#1', true], ['audience', 'these', false], ['jobs-air-side', 'moments', false]];
  snaps.forEach(([src, w, color], i) => {
    const p = at(O, LX + 13 + i * 28.5, -4);
    const extra: Key[] = src === 'envelope' ? moveTo(env, env + 0.8, { ...p, s: 1 }, { ...at(O, 0, -2), s: 1.9 }) : [{ t: env - 0.01, o: 1, e: 'hold' }, { t: env + 0.4, o: 0.12, e: 'lin' }];
    add(framed(src, { color }), { zi: src === 'envelope' ? 9 : 6, w: 26, h: 18 }, rise(word(w), p, 0.5), extra);
  });
  // twenty years, measured
  add(<div className="v6-rule" />, { zi: 7, w: 140, h: 0.25, clip: 'l' }, [{ t: W('20') - 0.01, o: 0, e: 'hold' }, { t: W('20'), ...at(O, 0, 14), c: 0, o: 1, e: 'hold' }, { t: W('20') + 0.6, c: 1, e: 'io' }], fadeOut(ask));
  add(left(mono('2007', 1.3)), { zi: 8 }, fadeIn(W('20'), at(O, LX, 18)), fadeOut(ask));
  add(right(mono('2026', 1.3)), { zi: 8 }, fadeIn(W('years'), at(O, EDGE, 18)), fadeOut(ask));
  add(<div className="v6-dot" />, { zi: 9, w: 1.4, h: 1.4 }, fadeIn(W('20'), at(O, LX, 14)), moveTo(W('years'), W('later', 1), at(O, LX, 14), at(O, EDGE, 14)), fadeOut(ask));
  add(serif('20 years', 4.4), { zi: 9 }, rise(W('20'), at(O, 0, 9)), fadeOut(ask));
  // ask anyone: what they remember, under the pictures
  [['“ONE DEVICE.”', 'anyone', 1], ['“THE ENVELOPE.”', 'watched#1', 2], ['“ARE YOU GETTING IT?”', 'remember#2', 3]].forEach(([q, w, i]) =>
    add(left(mono(q as string, 1.3)), { zi: 10 }, rise(word(w as string), at(O, LX + (i as number) * 28.5, 10)), fadeOut(env)));
  said([['ARE', 'are'], ['YOU', 'you#1'], ['GETTING', 'getting'], ['IT?', 'it']], at(O, LX, 32), FOREVER, 2);
}

/* ═════════ 4 · The work ═════════ */
{
  const O = { x: 0, y: 330 }, narrow = W('narrowed'), oneT = W('one', 1);
  panel(O, 4);
  labels(O, '04', 'The work', 'NOT A FLUKE', CUTS[3] + 0.2);
  add(left(<span className="v6-sans" style={{ fontSize: '5vmin' }}><i>These weren’t moments born as </i><s className="v6-st">a fluke.</s></span>), {
    zi: 10, fx: (t, el) => el.querySelector('.v6-st')!.classList.toggle('is-struck', t >= W('fluke') + 0.35),
  }, rise(W('these', 2), at(O, LX, HEAD), 0.6));
  add(framed('team-1'), { zi: 6, w: 60, h: 40 }, rise(W('team'), at(O, LX + 30, 4), 0.6), [{ t: narrow, o: 1, e: 'hold' }, { t: narrow + 0.5, o: 0.3, e: 'lin' }]);
  said([['A', 'a#4'], ['TEAM', 'team'], ['THAT', 'that'], ['UNDERSTOOD', 'understood'], ['THE', 'the#7'], ['PRODUCT', 'product'], ['IN', 'in'], ['DEPTH.', 'depth']], at(O, LX, 32), W('worked') - 0.3);
  // narrowed down: a list, struck through to one
  const feats = ['PRICE', 'COLOURS', 'STORAGE', 'BATTERY', 'CAMERA', 'THE ONE FEATURE', 'SPEED', 'SOFTWARE'];
  add(left(<div className="v6-list">{feats.map((f) => <span key={f}>{f}</span>)}</div>), {
    zi: 10,
    fx: (t, el) => el.querySelectorAll<HTMLElement>('.v6-list span').forEach((s, i) => {
      s.classList.toggle('is-in', t >= narrow + i * 0.07);
      s.classList.toggle('is-out', i !== 5 && t >= oneT - 0.3 + i * 0.04);
      s.classList.toggle('is-lit', i === 5 && t >= oneT);
    }),
  }, fadeIn(narrow - 0.1, at(O, RX, -12), 0.2));
  add(left(mono('— EXCEPTIONAL', 1.3, true)), { zi: 10 }, fadeIn(W('exceptional'), at(O, RX + 22, 0.6)));
  said([['WORKED', 'worked'], ['BACKWARDS', 'backwards'], ['TO', 'to'], ['FIND', 'find'], ['THE', 'the#9'], ['BEST', 'best'], ['WAY', 'way'], ['TO', 'to#1'], ['SHOW', 'show'], ['IT.', 'it#2']], at(O, LX, 32), FOREVER);
}

/* ═════════ 5 · The aha ═════════ */
{
  const O = { x: 205, y: 335 }, apart = W('apart'), call = W('call') - 0.2;
  panel(O, 5);
  labels(O, '05', 'The aha', 'FINDINGS', CUTS[4] + 0.2);
  add(left(sans('has a feature that sets it apart.', 5, 'Every great product')), { zi: 10 }, rise(W('every'), at(O, LX, HEAD), 0.6), fadeOut(call));
  const row: [string, string, boolean][] = [['ipod', 'every', false], ['macbook-air', 'great', false], ['iphone-front', 'product#1', true], ['jobs-air-cut', 'has', false], ['envelope', 'feature#1', false]];
  row.forEach(([src, w, hero], i) => {
    const p = at(O, LX + 13 + i * 28.5, -2);
    add(<div className={`v6-frame is-product${hero ? ' is-hero' : ''}`}><img className={`v6-photo is-contain${hero ? '' : ' is-grey'}`} src={SRC(src)} alt="" draggable={false} /></div>, {
      zi: 6, w: 26, h: 22, fx: hero ? (t, el) => el.firstElementChild!.classList.toggle('is-picked', t >= apart) : undefined,
    }, rise(word(w), p, 0.5), hero ? [] : [{ t: W('everything') - 0.01, o: 1, e: 'hold' }, { t: W('everything') + 0.5, o: 0.2, e: 'lin' }], fadeOut(call));
  });
  said([['THE', 'the#10'], ['KIND', 'kind'], ['THAT', 'that#3'], ['MAKES', 'makes'], ['PEOPLE', 'people#1'], ['STOP', 'stop'], ['IN', 'in#1'], ['THEIR', 'their'], ['TRACKS.', 'tracks']], at(O, LX, 32), call);
  add(left(mono('WE CALL IT THE', 1.6)), { zi: 10 }, rise(W('call'), at(O, LX, -18)));
  add(left(serif('aha', 30)), { zi: 10 }, rise(W('aha'), at(O, LX - 1, 2), 0.7));
  add(left(<span className="v6-lit" style={{ fontSize: '2vmin' }}>MOMENT.</span>), { zi: 11 }, rise(W('moment'), at(O, LX, 22)));
}

/* ═════════ End: every panel, and the role ═════════ */
add(<div className="v6-card"><span className="v6-mono is-dim" style={{ fontSize: '1.4vmin' }}>IDENTITY LABS · LONDON</span><span className="v6-serif" style={{ fontSize: '9vmin' }}>Creative Director</span><span className="v6-lit" style={{ fontSize: '1.6vmin' }}>FIND THE AHA.</span></div>, { z: 0, zi: 85 }, rise(CUTS[5] + 1.8, { x: 0, y: 0 }, 0.8));

/* the camera: inside the screen; back to the desk; panel to panel; then all of it */
const CAM: Key[] = [
  { t: 0, x: 0, y: 0, s: 1 },
  { t: PULL - 0.2, x: 0, y: 0, s: 1, e: 'lin' },
  { t: PULL + 1.4, x: 72, y: 6, s: 0.44, e: 'io' },
  { t: CUTS[1] - 0.1, x: 72, y: 6, s: 0.45, e: 'lin' },
  { t: CUTS[1] + 1.0, x: 0, y: 190, s: 0.94, e: 'io' },
  { t: CUTS[2] - 0.2, x: 0, y: 190, s: 0.95, e: 'lin' },
  { t: CUTS[2] + 1.1, x: 205, y: 195, s: 0.94, e: 'io' },
  { t: CUTS[3] - 0.2, x: 205, y: 195, s: 0.95, e: 'lin' },
  { t: CUTS[3] + 1.1, x: 0, y: 330, s: 0.94, e: 'io' },
  { t: CUTS[4] - 0.2, x: 0, y: 330, s: 0.95, e: 'lin' },
  { t: CUTS[4] + 1.1, x: 205, y: 335, s: 0.94, e: 'io' },
  { t: CUTS[5], x: 205, y: 335, s: 0.95, e: 'lin' },
  { t: CUTS[5] + 2.4, x: 100, y: 165, s: 0.2, e: 'io' },
  { t: END, x: 100, y: 165, s: 0.205, e: 'lin' },
];

export const FILM6: FilmDef = {
  id: '6', name: 'Site', layers: defs, camera: CAM, cuts: CUTS, chapters: CHAPTERS, end: END, poster: 5.6, cls: 'v6',
  assets: ['jobs-head-cut', 'audience', 'envelope', 'iphone-front', 'ipod', 'jobs-air-cut', 'jobs-air-front', 'jobs-air-side', 'jobs-stage', 'macbook-air', 'macworld-iphone', 'team-1'],
};
