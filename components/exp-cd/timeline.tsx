/* /exp/cd — the film, as one timeline on the voice-over's clock (vo.ts). Not a scene-by-scene
   illustration of the script: five movements, each built around one motion idea.

   1  The keynote (0–26s)   Jobs and the 2007 keynote in newsprint; three icons, said over
                            and over, multiply into a wallpaper — the camera pulls out and
                            the wallpaper is the screen of one phone.
   2  The envelope (26–38s) A laptop slides out of an inter-office envelope and turns edge-on
                            until it is a line; the room claps, then goes quiet.
   3  Memory (38–51s)       Photos drop into a pile, the years count up to now, faces of the
                            people who watched; we dive into the envelope; "Are you getting it?"
   4  The work (51–65s)     FLUKE, struck through; the team; an iris narrows on one feature;
                            the camera flies backwards through the research.
   5  The aha (65–78s)      Products on a conveyor, one lifted out; a hard stop; AHA.
   End card (78–82s)

   x, y in vmin from the centre; z is depth (see engine.ts). Sweeps (torn sheets across the
   screen) hide each cut. */

import type { ReactNode } from 'react';
import { enter, exit, type Key, type Layer, type Pose } from './engine';
import { torn, rng } from './kit';
import { W } from './vo';
import { IPhone, PhoneIcon, PodIcon, WebIcon, Burst, Scrawl, Underline, Bars, Curve } from './art';

export type Def = Layer & { node: ReactNode; w?: number; h?: number; cls?: string };

export const CUTS = [0, 26.4, 37.9, 51.45, 65.4, 78.3];
export const END = 82;
export const CHAPTERS = ['The keynote', 'The envelope', 'Memory', 'The work', 'The aha'];

/* ── nodes ── */
const SRC = (n: string) => `/exp/cd/${n}.webp`;
const big = (text: string, size: number, color?: string) => <span className="cd-big" style={{ fontSize: `${size}vmin`, color }}>{text}</span>;
const chip = (text: string, size: number, tone: 'black' | 'white' | 'hot' | 'kraft') => (
  <span className={`cd-big cd-chip cd-chip--${tone}`} style={{ fontSize: `${size}vmin`, clipPath: torn(text.length * 7 + size, 3, 12) }}>{text}</span>
);
const mono = (text: string, size = 1.8) => <span className="cd-mono" style={{ fontSize: `${size}vmin`, clipPath: torn(text.length * 3 + 1, 6, 10) }}>{text}</span>;
const script = (text: string, size: number, color = 'var(--cd-hot)') => <span className="cd-script" style={{ fontSize: `${size}vmin`, color }}>{text}</span>;
const photo = (src: string, o: { bw?: boolean; seed?: number; pos?: string; amp?: number } = {}) => (
  <img className={`cd-photo${o.bw ? ' is-bw' : ''}`} src={SRC(src)} alt="" draggable={false} style={{ clipPath: torn(o.seed ?? 3, o.amp ?? 2.4), objectPosition: o.pos }} />
);
const cut = (src: string, bw = false) => <img className={`cd-cutimg${bw ? ' is-bw' : ''}`} src={SRC(src)} alt="" draggable={false} />;
const sheet = (src: string, o: { size?: string; pos?: string; bw?: boolean; seed?: number; tint?: string } = {}) => (
  <div className={`cd-sheet${o.bw ? ' is-bw' : ''}`} style={{ backgroundImage: `${o.tint ? `linear-gradient(${o.tint},${o.tint}),` : ''}url(${SRC(src)})`, backgroundSize: o.size ?? 'cover', backgroundPosition: o.pos, clipPath: o.seed !== undefined ? torn(o.seed, 2.6, 26) : undefined }} />
);
const polaroid = (src: string, bw = true) => <div className="cd-polaroid"><img className={`cd-photo${bw ? ' is-bw' : ''}`} src={SRC(src)} alt="" draggable={false} style={{ aspectRatio: '1' }} /></div>;
const FONTS = ['cd-f-anton', 'cd-f-serif', 'cd-f-mono', 'cd-f-ital', 'cd-f-anton', 'cd-f-sans'];
const TONES = ['#fbfaf6', '#111', '#e9dcc2', '#fbfaf6', 'var(--cd-hot)', '#d8d8d8'];
const ransom = (text: string, size: number, seed: number) => {
  const r = rng(seed);
  return (
    <span className="cd-ransom" style={{ fontSize: `${size}vmin` }}>
      {text.split('').map((ch, i) => {
        if (ch === ' ') return <span key={i} className="cd-gap" />;
        const bg = TONES[Math.floor(r() * TONES.length)];
        const dark = bg === '#111' || bg.startsWith('var');
        return <span key={i} className={`cd-letter ${FONTS[Math.floor(r() * FONTS.length)]}`} style={{ background: bg, color: dark ? '#fbfaf6' : '#111', rotate: `${(r() - 0.5) * 14}deg`, clipPath: torn(i * 13 + seed, 7, 6) }}>{ch}</span>;
      })}
    </span>
  );
};
const ICON = [PodIcon, PhoneIcon, WebIcon];

/* ── builder ── */
const defs: Def[] = [];
let n = 0;
function add(node: ReactNode, o: Omit<Def, 'node' | 'id' | 'keys'> & { id?: string }, ...keys: Key[][]) {
  defs.push({ id: o.id ?? `l${n++}`, node, ...o, keys: keys.flat() });
}
const life = (a: Parameters<typeof enter>[0], t0: number, p: Pose, b: Parameters<typeof exit>[0], t1: number, d?: number): Key[] => [...enter(a, t0, p, d), ...exit(b, t1, p)];
// a torn sheet of paper across the whole screen, hiding a cut (three layers, staggered)
function sweep(t: number, seed: number) {
  [['kraft', 0], ['news-post', 0.07], ['crumpled', 0.14]].forEach(([src, dt], i) => {
    const s = t + (dt as number);
    add(sheet(src as string, { seed: seed + i, size: src === 'kraft' ? '40vmin' : '70vmin auto', bw: src === 'news-post' }), { z: 0, zi: 90 + i, w: 230, h: 190, smooth: true },
      [{ t: s - 0.01, o: 0, e: 'hold' }, { t: s, o: 1, x: 240, y: (i - 1) * 6, r: -7 + i * 3, e: 'hold' }, { t: s + 0.36, x: 0, e: 'out' }, { t: s + 0.5, x: 0, e: 'lin' }, { t: s + 0.85, x: -260, e: 'in' }, { t: s + 0.86, o: 0, e: 'hold' }]);
  });
}
const ground = (node: ReactNode, t0: number, t1: number) => add(node, { z: 0.3, zi: 0, w: 360, h: 240, smooth: true }, enter('cut', t0, { x: 0, y: 0 }), exit('cut', t1, { x: 0, y: 0 }));

/* ═════════ 1 · The keynote ═════════ */
{
  const [, C1] = [CUTS[0], CUTS[1]];
  const grid0 = W('he'); // "He said them again…": the icons take their places on the screen
  ground(sheet('crumpled', { size: '120vmin auto' }), 0, C1);
  add(sheet('news-post', { seed: 1, size: '150%', pos: '20% 8%', bw: true }), { z: 0.55, zi: 1, w: 84, h: 132 }, life('left', 0.05, { x: -72, y: 6, r: -5 }, 'cut', grid0));
  add(sheet('kraft', { seed: 2, size: '30vmin' }), { z: 0.6, zi: 1, w: 120, h: 20 }, life('down', 0.25, { x: 46, y: -45, r: 3 }, 'cut', grid0));
  add(sheet('tattered', { seed: 5, pos: '60% 50%' }), { z: 0.5, zi: 1, w: 42, h: 74 }, life('right', 0.2, { x: 80, y: 28, r: -6 }, 'cut', grid0));
  add(sheet('letter', { seed: 3, size: '170%', pos: '30% 40%' }), { z: 0.8, zi: 2, w: 58, h: 38 }, life('up', 0.45, { x: -64, y: 40, r: 8 }, 'cut', grid0));
  add(<div className="cd-dots" />, { z: 0.4, zi: 1, w: 70 }, life('fade', 0.1, { x: 30, y: 18 }, 'cut', grid0, 1));

  add(big('2007', 30), { zi: 6, boil: 0.35 }, life('slam', W('2007') - 0.1, { x: -34, y: -17 }, 'up', W('he') - 0.35));
  add(chip('KEYNOTE', 11, 'white'), { zi: 7, boil: 0.3 }, life('slam', W('keynote'), { x: -24, y: 11, r: 3 }, 'up', W('he') - 0.3));
  add(mono('MACWORLD · SAN FRANCISCO · 9 JAN 2007'), { zi: 8, z: 1.1 }, life('pop', W('keynote') + 0.4, { x: -30, y: 25, r: -2 }, 'fade', W('he') - 0.4));
  add(photo('jobs-stage', { bw: true, seed: 6 }), { zi: 4, w: 64, h: 46, boil: 0.2 }, life('right', W('probably') - 0.2, { x: 38, y: -12, r: -3 }, 'right', W('he') - 0.4));
  add(cut('jobs-head-cut', true), { zi: 5, z: 1.08, w: 44, boil: 0.25 }, life('up', W('steve') - 0.1, { x: 63, y: 22 }, 'down', W('he') - 0.4, 0.6));
  add(ransom('STEVE JOBS', 4.4, 7), { zi: 9, z: 1.12 }, life('pop', W('jobs'), { x: 36, y: 40, r: -4 }, 'fade', W('he') - 0.4));
  add(big('3', 48, 'var(--cd-hot)'), { zi: 9, boil: 0.5 }, life('slam', W('three'), { x: -60, y: -6, r: -4 }, 'shrink', W('ipod') - 0.25));
  add(chip('PRODUCTS', 8, 'black'), { zi: 10 }, life('slam', W('products'), { x: -42, y: 18, r: 4 }, 'shrink', W('ipod') - 0.2));

  // the three, then the wallpaper: a 7 × 10 grid on the phone's screen
  const PW = 190, scrTop = -PW * 230 / 120 / 2 + PW * 38 / 120, cols = 7, rows = 10;
  const slot = (c: number, r: number) => ({ x: -67.9 + 22.62 * c, y: scrTop + 11.87 + 23.74 * r });
  const firsts: [string, number][] = [['ipod', 2], ['phone', 3], ['internet', 4]];
  firsts.forEach(([word, c], i) => {
    const I = ICON[i], s = slot(c, 5);
    const k = [...enter('pop', W(word), { x: (i - 1) * 46, y: 6, s: 1.5 }, 0.5),
      { t: grid0, x: (i - 1) * 46, y: 6, s: 1.5, e: 'hold' as const }, { t: grid0 + 0.5, x: s.x, y: s.y, s: 1, e: 'io' as const }, ...exit('cut', C1, s)];
    add(<I style={{ width: '100%' }} />, { zi: 22, w: 15, boil: 0.2, cls: 'cd-cut' }, k);
    add(mono(['an iPod.', 'a phone.', 'an internet communicator.'][i], 2), { zi: 23 }, life('pop', W(word) + 0.2, { x: (i - 1) * 46, y: 24 }, 'cut', grid0));
  });
  const againT = [W('again'), W('again', 1), W('again', 2)];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (r === 5 && c >= 2 && c <= 4) continue;
    const s = slot(c, r), d = Math.hypot(s.x, s.y - slot(3, 5).y);
    const gen = d < 40 ? 0 : d < 75 ? 1 : 2;
    const I = ICON[(c + r) % 3];
    add(<I style={{ width: '100%' }} />, { zi: 21, w: 15, boil: 0.15, cls: 'cd-cut' }, enter('pop', againT[gen] + d * 0.004, s, 0.35), exit('cut', C1, s));
  }
  add(<IPhone bare style={{ width: '100%' }} />, { zi: 20, w: PW, cls: 'cd-cut', smooth: true }, enter('cut', grid0, { x: 0, y: 0 }), exit('cut', C1, { x: 0, y: 0 }));
  againT.forEach((t, i) => add(ransom('AGAIN', 7, 30 + i), { z: 0, zi: 60, boil: 0.4 }, life('slam', t, [{ x: -42, y: -26, r: -6 }, { x: 40, y: -6, r: 5 }, { x: -8, y: 22, r: -3 }][i], 'fade', W('until'))));

  // until the audience slowly realised: pull out to the whole phone
  add(photo('applause', { bw: true, seed: 8, pos: '50% 35%' }), { z: 0, zi: 55, w: 210, h: 36, boil: 0.15 }, life('up', W('audience') - 0.15, { x: 0, y: 40, r: -1.5 }, 'down', W('one') - 0.6, 0.6));
  add(script('slowly…', 10, '#fbfaf6'), { z: 0, zi: 57 }, life('fade', W('slowly'), { x: -46, y: 24, r: -6 }, 'fade', W('one') - 0.6));
  add(script('realised.', 12), { z: 0, zi: 57, clip: 'l' }, life('wipe', W('realized'), { x: 34, y: 18, r: -6 }, 'fade', W('one') - 0.6, 0.8));
  add(big('ONE', 26), { z: 0, zi: 58, boil: 0.4 }, life('slam', W('one'), { x: -58, y: -8, r: -4 }, 'left', W('the', 2) - 0.1));
  add(chip('DEVICE', 9, 'black'), { z: 0, zi: 58, boil: 0.3 }, life('slam', W('device'), { x: 58, y: 8, r: 4 }, 'right', W('the', 2) - 0.1));
  add(<Burst style={{ width: '100%' }} />, { z: 0, zi: 19, w: 110, cls: 'cd-hot' }, life('zoom', W('iphone', 1) - 0.05, { x: 0, y: -2 }, 'cut', C1, 0.5));
  add(script('the iPhone.', 15), { z: 0, zi: 59, clip: 'l' }, life('wipe', W('iphone', 1) - 0.05, { x: 32, y: 26, r: -6 }, 'cut', C1, 0.7));
  sweep(C1 - 0.36, 11);
}

/* ═════════ 2 · The envelope ═════════ */
{
  const C1 = CUTS[1], C2 = CUTS[2];
  ground(sheet('kraft', { size: '46vmin' }), C1, C2);
  add(sheet('news-express', { seed: 21, bw: true }), { z: 0.6, zi: 1, w: 86, h: 62 }, life('left', C1 + 0.05, { x: -58, y: -26, r: -4 }, 'cut', C2));
  add(sheet('crumpled', { seed: 22 }), { z: 0.5, zi: 1, w: 62, h: 116 }, life('right', C1 + 0.1, { x: 72, y: 24, r: 6 }, 'cut', C2));
  add(sheet('news-kronen', { seed: 23, size: '160%', pos: '40% 80%' }), { z: 0.8, zi: 2, w: 42, h: 42 }, life('up', C1 + 0.2, { x: -72, y: 38, r: 9 }, 'cut', C2));
  add(<div className="cd-dots" />, { z: 0.45, zi: 1, w: 60 }, life('fade', C1, { x: 40, y: -30 }, 'cut', C2, 1));

  add(<div className="cd-strip" style={{ clipPath: torn(7, 3, 30) }} />, { zi: 5, w: 200, h: 22 }, life('left', W('macbook') - 0.3, { x: 0, y: -37, r: -1.5 }, 'cut', C2));
  add(big('MACBOOK', 15, '#fbfaf6'), { zi: 6, boil: 0.3 }, life('slam', W('macbook'), { x: -26, y: -37, r: -1.5 }, 'cut', C2));
  add(chip('AIR', 15, 'hot'), { zi: 7, boil: 0.3 }, life('slam', W('air'), { x: 44, y: -38, r: 3 }, 'cut', C2));
  add(ransom('LAUNCH', 5, 41), { zi: 7, z: 1.1 }, life('pop', W('launch'), { x: 62, y: -18, r: 4 }, 'cut', C2));
  add(ransom('2008', 5, 8), { zi: 7, z: 1.1 }, life('pop', W('year'), { x: -64, y: -16, r: -5 }, 'cut', C2));

  // out of the envelope, then edge-on until it is a line
  const pt = W('paper-thin');
  add(<div className="cd-lid"><div /></div>, {
    zi: 9, w: 40, h: 27, smooth: true,
    fx: (t, el) => { const k = Math.max(0, Math.min(1, (t - pt) / 0.5)); (el.firstChild as HTMLElement).style.transform = `scaleY(${(1 - k * 0.94).toFixed(3)})`; },
  }, enter('cut', W('pulled') - 0.05, { x: 0, y: 12 }), [{ t: W('pulled'), y: 12, e: 'hold' }, { t: W('pulled') + 0.9, y: -18, e: 'out' }], exit('cut', C2, { x: 0, y: -18 }));
  add(photo('envelope', { seed: 24, amp: 1.2, pos: '50% 30%' }), { zi: 10, w: 46, h: 64, boil: 0.15 }, life('drop', W('where'), { x: 0, y: 14, r: -2 }, 'cut', C2, 0.5));
  add(script('paper-thin', 12), { zi: 11, z: 1.1, clip: 'l' }, life('wipe', pt + 0.1, { x: 50, y: -22, r: -6 }, 'cut', C2, 0.7));
  add(chip('MANILA', 6, 'kraft'), { zi: 12, boil: 0.3 }, life('slam', W('manila'), { x: -50, y: 8, r: -6 }, 'cut', C2));
  add(chip('OFFICE', 6, 'white'), { zi: 12, boil: 0.3 }, life('slam', W('office'), { x: -44, y: 22, r: 4 }, 'cut', C2));
  add(chip('ENVELOPE', 6, 'black'), { zi: 12, boil: 0.3 }, life('slam', W('envelope'), { x: 48, y: 28, r: -3 }, 'cut', C2));
  add(<Scrawl style={{ width: '100%', height: '100%' }} />, { zi: 11, w: 76, h: 88, cls: 'cd-hot cd-draw' }, life('cut', W('envelope'), { x: 0, y: 12 }, 'cut', C2));
  add(photo('applause', { bw: true, seed: 26, pos: '50% 30%' }), { z: 0, zi: 50, w: 210, h: 38, boil: 0.15 }, life('up', W('left') - 0.1, { x: 0, y: 40, r: 1.5 }, 'cut', C2, 0.5));
  [[-64, 18], [62, 14], [14, 28]].forEach(([x, y], i) => add(<Burst style={{ width: '100%' }} />, { z: 0, zi: 51, w: 22, cls: 'cd-hot cd-draw', boil: 0.6 }, life('pop', W('audience', 1) + i * 0.12, { x, y }, 'cut', W('speechless'))));
  // speechless: the room goes dark and still
  add(<div className="cd-hush" />, { z: 0, zi: 70, w: 400, h: 300, smooth: true }, [{ t: W('speechless') - 0.01, o: 0, e: 'hold' }, { t: W('speechless') + 0.5, o: 0.78, e: 'lin' }], exit('cut', C2, { x: 0, y: 0 }));
  add(big('SPEECHLESS.', 14, '#fbfaf6'), { z: 0, zi: 71 }, life('slam', W('speechless') + 0.15, { x: 0, y: -4 }, 'cut', C2));
  sweep(C2 - 0.36, 31);
}

/* ═════════ 3 · Memory ═════════ */
{
  const C2 = CUTS[2], C3 = CUTS[3];
  const envT = W('envelope', 1);
  ground(sheet('news-post', { size: '70vmin auto', tint: 'rgb(236 226 210 / .55)' }), C2, C3);
  add(sheet('crumpled', { seed: 31 }), { z: 0.6, zi: 1, w: 120, h: 92 }, life('fade', C2, { x: 0, y: 0, r: -3 }, 'cut', envT));
  add(sheet('kraft', { seed: 32, size: '30vmin' }), { z: 0.5, zi: 1, w: 36, h: 60 }, life('left', C2 + 0.1, { x: -78, y: -22, r: -8 }, 'cut', envT));
  add(<div className="cd-dots" />, { z: 0.4, zi: 1, w: 60 }, life('fade', C2, { x: 60, y: -30 }, 'cut', envT, 1));
  const pile: [string, string, number, number, number, boolean][] = [
    ['jobs-stage', 'why', -14, -4, -9, true], ['macworld-iphone', 'people', 12, -8, 7, false], ['jobs-air-front', 'still', -4, 6, -3, true],
    ['audience', 'remember#1', 16, 8, 11, true], ['envelope', 'moments', -16, 10, -14, false],
  ];
  pile.forEach(([src, w, x, y, r, bw], i) => add(polaroid(src, bw), { zi: 3 + i, w: 34, boil: 0.25, cls: 'cd-cut' }, life('drop', w.includes('#') ? W(w.split('#')[0], 1) : W(w), { x, y, r }, 'fall', W('ask') - 0.3 + i * 0.05, 0.5)));
  // the years count up to now
  const y0 = W('20'), y1 = W('later', 1);
  add(<span className="cd-big cd-count" style={{ fontSize: '30vmin' }}>2007</span>, {
    z: 0, zi: 30, boil: 0.3,
    fx: (t, el) => { const k = Math.max(0, Math.min(1, (t - y0) / Math.max(0.3, y1 - y0))); el.firstChild!.textContent = String(2007 + Math.round(k * 19)); },
  }, life('slam', y0 - 0.15, { x: -6, y: -4 }, 'up', W('ask') - 0.15));
  add(chip('YEARS', 8, 'black'), { z: 0, zi: 31 }, life('slam', W('years'), { x: 46, y: 12, r: -4 }, 'up', W('ask') - 0.1));
  add(script('later.', 12), { z: 0, zi: 31, clip: 'l' }, life('wipe', y1, { x: 40, y: -22, r: -8 }, 'fade', W('ask') - 0.1, 0.5));
  // the people who watched
  const faces: [string, string, number, number, number][] = [
    ['audience', '20% 40%', -58, -18, -6], ['applause', '30% 30%', -18, -26, 4], ['audience', '70% 50%', 26, -20, -3],
    ['applause', '80% 40%', 62, -8, 6], ['audience', '45% 70%', -40, 20, 5], ['applause', '55% 60%', 34, 22, -5],
  ];
  faces.forEach(([src, pos, x, y, r], i) => add(photo(src, { bw: true, seed: 50 + i, pos }), { zi: 10 + i, z: 1 + (i % 3) * 0.15, w: 38, h: 28, boil: 0.2 }, life('pop', W('anyone') + i * 0.22, { x, y, r }, 'fall', envT - 0.25 + i * 0.03, 0.4)));
  add(mono('ASK ANYONE WHO WATCHED THEM', 2.2), { z: 0, zi: 32 }, life('pop', W('ask'), { x: 0, y: -40, r: -2 }, 'fade', envT - 0.3));
  add(chip('EXACT', 9, 'hot'), { z: 0, zi: 33, boil: 0.3 }, life('slam', W('exact'), { x: -14, y: 2, r: -4 }, 'shrink', envT - 0.2));
  add(chip('MOMENTS', 9, 'black'), { z: 0, zi: 33, boil: 0.3 }, life('slam', W('moments', 1), { x: 18, y: 14, r: 3 }, 'shrink', envT - 0.15));
  // into the envelope
  add(photo('envelope', { seed: 34, amp: 1, pos: '50% 30%' }), { zi: 40, w: 50, h: 72, smooth: true },
    enter('zoom', envT, { x: 0, y: 0, r: -3 }, 0.5), [{ t: W('are') - 0.5, s: 1, r: -3, e: 'hold' }, { t: W('are') + 0.1, s: 3.4, r: 0, e: 'io' }], exit('cut', C3, { x: 0, y: 0 }));
  ([['ARE', 'are', -46, -4], ['YOU', 'you', -14, -6], ['GETTING', 'getting', 30, -2], ['IT?', 'it', 18, 18]] as const).forEach(([word, w, x, y], i) =>
    add(ransom(word, 8, 60 + i), { z: 0, zi: 60 + i, boil: 0.35 }, life('slam', W(w, w === 'you' ? 1 : 0), { x, y, r: (i % 2 ? 4 : -4) }, 'cut', C3)));
  sweep(C3 - 0.36, 41);
}

/* ═════════ 4 · The work ═════════ */
{
  const C3 = CUTS[3], C4 = CUTS[4];
  const back = W('worked') - 0.1, narrow = W('narrowed');
  ground(sheet('crumpled', { size: '120vmin auto' }), C3, C4);
  add(sheet('letter', { seed: 43, size: '180%', pos: '20% 50%' }), { z: 0.6, zi: 1, w: 48, h: 60 }, life('left', C3 + 0.1, { x: -74, y: 18, r: -6 }, 'cut', back));
  add(sheet('news-kronen', { seed: 42, size: '130%', pos: '50% 60%', bw: true }), { z: 0.5, zi: 1, w: 46, h: 78 }, life('right', C3 + 0.05, { x: 76, y: -14, r: 5 }, 'cut', back));

  add(mono('THESE WEREN’T MOMENTS BORN AS A', 2.2), { zi: 3 }, life('pop', W('these', 2) + 0.1, { x: -6, y: -30, r: -2 }, 'up', W('they')));
  add(big('FLUKE', 36), { zi: 4, boil: 0.4 }, life('slam', W('fluke') - 0.05, { x: 0, y: -2 }, 'up', W('team') - 0.3));
  add(<Underline style={{ width: '100%' }} />, { zi: 5, w: 92, cls: 'cd-hot cd-draw' }, life('cut', W('fluke') + 0.3, { x: 0, y: 0, r: -4 }, 'up', W('team') - 0.3));

  add(photo('team-1', { seed: 46 }), { zi: 6, w: 124, h: 80, clip: 'l' }, life('wipe', W('team') - 0.15, { x: 0, y: -2, r: -1.5 }, 'fade', narrow - 0.2, 0.6));
  add(photo('team-2', { seed: 47 }), { zi: 7, z: 1.25, w: 58, h: 37, boil: 0.15 }, life('right', W('product') - 0.2, { x: 46, y: 24, r: 5 }, 'fade', narrow - 0.2));
  add(mono('A TEAM THAT UNDERSTOOD THE PRODUCT', 2.2), { zi: 8, z: 1.3 }, life('pop', W('understood'), { x: -40, y: 34, r: -2 }, 'fade', narrow - 0.2));
  add(chip('IN DEPTH', 7, 'hot'), { z: 0, zi: 9, boil: 0.3 }, life('slam', W('in', 0) > 56 ? W('in', 0) : W('in', 1), { x: -48, y: -30, r: -5 }, 'fade', narrow - 0.2));

  // narrowed down: an iris closes on one feature
  const feats = ['PRICE', 'COLOURS', 'STORAGE', 'BATTERY', 'CAMERA', 'SPEED', 'SIZE', 'SOFTWARE'];
  const fr = rng(81);
  feats.forEach((f, i) => {
    const a = (i / feats.length) * Math.PI * 2, rad = 30 + fr() * 14;
    add(chip(f, 4.6, i % 2 ? 'white' : 'kraft'), { zi: 10, boil: 0.25 }, life('pop', narrow - 0.3 + i * 0.07, { x: Math.cos(a) * rad * 1.5, y: Math.sin(a) * rad, r: (fr() - 0.5) * 18 }, 'cut', back));
  });
  add(<div className="cd-iris" />, {
    z: 0, zi: 40, w: 400, h: 300, smooth: true,
    fx: (t, el) => { const k = Math.max(0, Math.min(1, (t - narrow) / (W('one', 1) - narrow))); const e = 1 - (1 - k) ** 3; el.style.setProperty('--iris', `${(110 - e * 92).toFixed(1)}vmin`); },
  }, enter('fade', narrow, { x: 0, y: 0 }, 0.3), exit('cut', back, { x: 0, y: 0 }));
  add(chip('THE ONE FEATURE', 6.5, 'hot'), { z: 0, zi: 41, boil: 0.3 }, life('slam', W('one', 1), { x: 0, y: 0, r: -2 }, 'cut', back));
  add(<Burst style={{ width: '100%' }} />, { z: 0, zi: 41, w: 60, cls: 'cd-hot cd-draw' }, life('zoom', W('exceptional'), { x: 0, y: 0 }, 'cut', back, 0.4));
  add(script('exceptional', 10, '#fbfaf6'), { z: 0, zi: 42, clip: 'l' }, life('wipe', W('exceptional'), { x: 26, y: 20, r: -6 }, 'cut', back, 0.6));

  // worked backwards: we fly back through the research
  const tr = rng(91);
  const kinds = ['team-3', 'macworld-iphone', 'jobs-stage', 'news-express', 'envelope', 'audience'];
  for (let i = 0; i < 22; i++) {
    const a = i * 2.39996, rad = 26 + tr() * 40, z = 0.35 + tr() * 1.4;
    const k = i % 4;
    const node = k === 0 ? <div className="cd-card cd-ink"><Bars style={{ width: '100%' }} /></div>
      : k === 1 ? <div className="cd-card cd-ink"><Curve style={{ width: '100%' }} /></div>
      : k === 2 ? <div className="cd-sticky">v{24 - i}<br />show it<br />in one move</div>
      : polaroid(kinds[i % kinds.length], i % 3 !== 1);
    add(node, { z, zi: Math.round(z * 10) + 2, w: 20, boil: 0.2, cls: 'cd-cut' }, life('cut', back, { x: Math.cos(a) * rad * 1.5, y: Math.sin(a) * rad, r: (tr() - 0.5) * 24 }, 'cut', C4));
  }
  add(chip('◀◀ WORKED BACKWARDS', 7, 'hot'), { z: 0, zi: 60, boil: 0.3 }, life('slam', W('worked'), { x: 0, y: -16, r: -2 }, 'cut', C4));
  add(mono('TO FIND', 2.6), { z: 0, zi: 61 }, life('pop', W('find'), { x: -30, y: 2, r: -3 }, 'cut', C4));
  add(chip('THE BEST WAY', 6, 'white'), { z: 0, zi: 61, boil: 0.3 }, life('slam', W('best'), { x: 6, y: 4, r: 2 }, 'cut', C4));
  add(chip('TO SHOW IT.', 6, 'black'), { z: 0, zi: 61, boil: 0.3 }, life('slam', W('show'), { x: 10, y: 17, r: -3 }, 'cut', C4));
  sweep(C4 - 0.36, 51);
}

/* ═════════ 5 · The aha ═════════ */
{
  const C4 = CUTS[4], C5 = CUTS[5];
  const stop = W('stop'), lift = W('sets'), call = W('we', 0) > 70 ? W('we', 0) : W('we', 1);
  ground(sheet('tattered', { tint: 'rgb(205 120 90 / .35)' }), C4, C5);
  add(sheet('news-post', { seed: 51, size: '200%', pos: '10% 30%', bw: true }), { z: 0.55, zi: 1, w: 40, h: 96 }, life('left', C4 + 0.05, { x: -80, y: -8, r: -6 }, 'cut', C5));
  add(sheet('news-kronen', { seed: 52, size: '200%' }), { z: 0.5, zi: 1, w: 36, h: 80 }, life('right', C4 + 0.1, { x: 82, y: 22, r: 6 }, 'cut', C5));
  add(<div className="cd-dots" />, { z: 0.4, zi: 1, w: 56 }, life('fade', C4, { x: 60, y: -34 }, 'cut', C5, 1));

  add(chip('EVERY', 8, 'white'), { zi: 20, boil: 0.3 }, life('slam', W('every'), { x: -44, y: -36, r: -4 }, 'up', W('feature', 1) - 0.2));
  add(chip('GREAT', 8, 'hot'), { zi: 20, boil: 0.3 }, life('slam', W('great'), { x: -6, y: -38, r: 3 }, 'up', W('feature', 1) - 0.15));
  add(chip('PRODUCT', 8, 'black'), { zi: 20, boil: 0.3 }, life('slam', W('product', 1), { x: 38, y: -35, r: -2 }, 'up', W('feature', 1) - 0.1));

  // the conveyor: everything slides by; one is lifted out of line; a hard stop
  const items: [ReactNode, number][] = [
    [cut('ipod'), 22], [polaroid('jobs-stage'), 24], [cut('macbook-air'), 34], [cut('iphone-front'), 30], [polaroid('audience'), 24],
    [cut('ipod'), 22], [photo('envelope', { seed: 61 }), 18], [polaroid('macworld-iphone', false), 24], [cut('macbook-air'), 34],
  ];
  const t0 = C4 + 0.2, v = 26, x0 = -40;
  items.forEach(([node, w], i) => {
    const X = (t: number) => x0 + i * 46 - v * (Math.min(t, stop) - t0);
    const y = 10 + (i % 2) * 4;
    const keys: Key[] = [...enter('cut', t0, { x: X(t0), y, r: (i % 3 - 1) * 4 })];
    if (i === 3) {
      keys.push({ t: lift, x: X(lift), y, s: 1, e: 'lin' }, { t: lift + 0.6, x: 0, y: -10, s: 1.6, r: -6, e: 'back' });
      keys.push(...exit('shrink', call - 0.1, { x: 0, y: -10, s: 1.6 }));
    } else {
      keys.push({ t: stop, x: X(stop), e: 'lin' }, { t: stop + 0.12, x: X(stop) - 2.5, e: 'out' }, { t: stop + 0.24, x: X(stop), e: 'out' });
      keys.push({ t: W('everything') - 0.01, o: 1, e: 'hold' }, { t: W('everything') + 0.4, o: 0.45, e: 'lin' });
      keys.push(...exit('fall', call - 0.3 + (i % 4) * 0.05, { x: X(stop), y }));
    }
    add(node, { zi: i === 3 ? 30 : 10 + i, w, boil: 0.2, cls: 'cd-cut' }, keys);
  });
  add(chip('A FEATURE', 6.5, 'hot'), { zi: 31, z: 1.1, boil: 0.3 }, life('slam', W('feature', 1), { x: -36, y: 26, r: -4 }, 'shrink', call - 0.1));
  add(ransom('SETS IT APART', 4.6, 71), { zi: 32, z: 1.1 }, life('pop', W('apart'), { x: 30, y: -32, r: 3 }, 'shrink', call - 0.1));
  add(mono('EVERYTHING ELSE OUT THERE', 2.4), { zi: 32 }, life('pop', W('everything'), { x: 0, y: 36, r: -2 }, 'fade', stop));
  add(big('STOP.', 30, 'var(--cd-hot)'), { z: 0, zi: 50, boil: 0.5 }, life('slam', stop, { x: 0, y: -14, r: -3 }, 'fade', call - 0.2));
  add(mono('IN THEIR TRACKS', 2.6), { z: 0, zi: 51 }, life('pop', W('tracks'), { x: 0, y: 12, r: 2 }, 'fade', call - 0.2));

  // the aha: a ring of everything, turning
  const ring: [ReactNode, number][] = [[cut('iphone-front'), 20], [polaroid('envelope', false), 13], [cut('ipod'), 15], [cut('macbook-air'), 24], [<PhoneIcon key="p" style={{ width: '100%' }} />, 9], [cut('jobs-air-cut', true), 18], [<WebIcon key="w" style={{ width: '100%' }} />, 9], [polaroid('macworld-iphone'), 15]];
  ring.forEach(([node, w], i) => {
    const keys: Key[] = [{ t: call - 0.01, o: 0, e: 'hold' }];
    for (let t = call; t <= C5 + 0.01; t += 0.25) {
      const a = (i / ring.length) * Math.PI * 2 + (t - call) * 0.55, R = t - call < 0.6 ? 34 + (1 - (t - call) / 0.6) * 60 : 34;
      keys.push({ t, x: Math.cos(a) * R * 1.45, y: Math.sin(a) * R, o: 1, e: 'lin' });
    }
    add(node, { zi: 20 + i, w, boil: 0.2, cls: 'cd-cut', smooth: true }, keys, exit('cut', C5, { x: 0, y: 0 }));
  });
  add(mono('WE CALL IT', 2.6), { z: 0, zi: 60 }, life('pop', W('call'), { x: -22, y: -18, r: -4 }, 'cut', C5));
  const aha = W('aha');
  ['A', 'H', 'A'].forEach((ch, i) => add(big(ch, 30), { z: 0, zi: 61 + i, boil: 0.45 }, life('slam', aha + i * 0.16, { x: (i - 1) * 21, y: -2, r: (i - 1) * 4 }, 'cut', C5)));
  add(<Burst style={{ width: '100%' }} />, { z: 0, zi: 59, w: 100, cls: 'cd-hot cd-draw' }, life('zoom', aha, { x: 0, y: -2 }, 'cut', C5, 0.5));
  add(script('moment.', 14), { z: 0, zi: 64, clip: 'l' }, life('wipe', W('moment'), { x: 22, y: 20, r: -6 }, 'cut', C5, 0.7));
  sweep(C5 - 0.36, 61);
}

/* ═════════ End card ═════════ */
{
  const C5 = CUTS[5];
  ground(<div className="cd-endground" />, C5, END + 10);
  add(sheet('news-post', { seed: 71, bw: true, size: '70vmin auto' }), { z: 0.6, zi: 1, w: 60, h: 100 }, life('left', C5 + 0.05, { x: -70, y: 10, r: -6 }, 'cut', END + 10));
  add(big('CREATIVE', 17, '#fbfaf6'), { zi: 3, boil: 0.3 }, life('slam', C5 + 0.3, { x: 6, y: -14, r: -2 }, 'cut', END + 10));
  add(chip('DIRECTOR', 17, 'hot'), { zi: 4, boil: 0.3 }, life('slam', C5 + 0.6, { x: 14, y: 6, r: 2 }, 'cut', END + 10));
  add(script('find the aha.', 9, '#fbfaf6'), { zi: 5, clip: 'l' }, life('wipe', C5 + 1.1, { x: 30, y: 24, r: -6 }, 'cut', END + 10, 0.8));
}

export const LAYERS = defs;

/* the camera: x, y (vmin), s (zoom), r (deg); cuts are holds hidden by the sweeps */
const c1 = W('he'), c2 = CUTS[1];
export const CAMERA: Key[] = [
  { t: 0, x: 0, y: 0, s: 1, r: 0 },
  { t: c1 - 0.05, s: 1.14, r: -1, e: 'lin' },
  { t: c1, x: 0, y: 8.7, s: 1, r: 0, e: 'hold' },
  { t: W('until'), s: 1.05, e: 'lin' },
  { t: W('until') + 2.4, x: 0, y: 0, s: 0.22, e: 'io' },
  { t: W('iphone', 1) - 0.1, s: 0.25, e: 'lin' },
  { t: W('iphone', 1) + 0.25, s: 0.3, e: 'out' },
  { t: c2 - 0.05, s: 0.31, e: 'lin' },
  { t: c2, x: 0, y: 0, s: 1, r: 0, e: 'hold' },
  { t: CUTS[2] - 0.05, s: 1.14, r: -1.5, e: 'lin' },
  { t: CUTS[2], x: 0, y: 0, s: 1, r: 0, e: 'hold' },
  { t: W('envelope', 1) - 0.05, x: 14, s: 1.1, r: 1, e: 'lin' },
  { t: W('envelope', 1), x: 0, s: 1, r: 0, e: 'hold' },
  { t: CUTS[3] - 0.05, s: 1.05, e: 'lin' },
  { t: CUTS[3], x: 0, y: 0, s: 1, r: 0, e: 'hold' },
  { t: W('team'), x: -14, s: 1.02, e: 'lin' },
  { t: W('in'), x: 8, s: 1.06, e: 'lin' },
  { t: W('depth') + 0.6, x: 12, s: 1.45, e: 'io' },
  { t: W('narrowed'), x: 0, s: 1, e: 'hold' },
  { t: W('worked') - 0.1, s: 2.4, x: 0, y: 0, e: 'hold' },
  { t: W('it', 2) + 0.3, s: 0.45, e: 'io' },
  { t: CUTS[4] - 0.05, s: 0.42, e: 'lin' },
  { t: CUTS[4], x: 0, y: 0, s: 1, r: 0, e: 'hold' },
  { t: W('stop') - 0.02, s: 1.08, r: 0.6, e: 'lin' },
  { t: W('stop'), x: 3, s: 1.16, e: 'hold' }, { t: W('stop') + 0.08, x: -3, e: 'hold' }, { t: W('stop') + 0.16, x: 2, e: 'hold' }, { t: W('stop') + 0.24, x: -1, e: 'hold' }, { t: W('stop') + 0.32, x: 0, e: 'hold' },
  { t: W('call') - 0.1, s: 1.04, r: 0, e: 'lin' },
  { t: W('aha'), s: 1.2, e: 'hold' },
  { t: W('aha') + 0.6, s: 1.06, e: 'out' },
  { t: CUTS[5] - 0.05, s: 1.12, e: 'lin' },
  { t: CUTS[5], x: 0, y: 0, s: 1, r: 0, e: 'hold' },
  { t: END, s: 1.08, e: 'lin' },
];

export type FilmDef = { id: string; name: string; layers: Def[]; camera: Key[]; cuts: number[]; chapters: string[]; end: number; poster: number; assets: string[]; cls: string };
export const FILM1: FilmDef = {
  id: '1', name: 'Collage', layers: LAYERS, camera: CAMERA, cuts: CUTS, chapters: CHAPTERS, end: END, poster: 6.2, cls: 'v1',
  assets: ['applause', 'audience', 'crumpled', 'envelope', 'iphone-front', 'ipod', 'jobs-air-cut', 'jobs-air-front', 'jobs-head-cut', 'jobs-stage', 'kraft', 'letter', 'macbook-air', 'macworld-iphone', 'news-express', 'news-kronen', 'news-post', 'tattered', 'team-1', 'team-2', 'team-3'],
};
