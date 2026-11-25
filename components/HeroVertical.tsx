import type { CSSProperties } from 'react';
import './hero-vertical.css';
import FibLines from './flow/FibLines';
import HtmlMark from './HtmlMark';

/* /home-4 hero — Figma "new hero light theme" (183:3). The golden construction stood upright
   (577 × 980, centred in the frame): the headline and body copy sit in its large square, the client
   logos of 16 launch-reel clients in a 4 × 4 grid filling the band under it, down to the construction's
   bottom line, which is the hero's bottom edge (the whole drawing shows; it runs on below the
   first screen). Drawn 1:1 — no scaling to fit the screen. Light only. Same page material, rails and .hero wrapper as Hero.tsx, so the theme
   switch and Section 2 work unchanged. Positions are Figma px inside the construction (× --px). */

const LINES = ['Identity Labs is a', 'consulting firm based', 'in London.'];
/* The last line's city turns over, San Francisco (5s) → London (5s) → Bangalore (2s) (client, 2026-11-23; was
   London → Bangalore → San Francisco, 2s each); the offices in the footer. CSS-only loop (hero-vertical.css
   .hv-city); reduced motion keeps San Francisco. */
const CITIES = ['San Francisco.', 'London.', 'Bangalore.'];
const HEADLINE = 'Identity Labs is a consulting firm based in London, Bangalore and San Francisco.';

type Part = { src: string; inset: string };
type Masked = Part & { box: string; mx: number; my: number };

/* Client logos. Every logo is drawn at the same visual size: scaled so its visible ink box covers
   the same area (AREA, px²) — a wide wordmark comes out lower, a compact one taller — rather than
   all at one height, which makes long wordmarks look big and short ones small. `boost` lifts a
   light, thin-stroked logo a little so it carries the same weight as the rest, and eases a heavy,
   solid one (Deel, Matic) down.
     design  the eight in Figma 183:34: the box (w × h) holding its parts by inset; vw × vh is the
             ink inside it (the exported SVG's size)
     file    a launch client's logo file (/assets/clients, as LaunchesSlides.tsx), masked in grey;
             ratio from its viewBox
     lockup  an icon file next to the name in type, where that is the brand's own header lockup
             (Fish Audio)
     text    a client with no logo file: its name set in type, the font size from the same area
             rule (clamped). None in use now. */
type Logo =
  | { kind: 'design'; name: string; w: number; h: number; vw: number; vh: number; parts: Part[]; masked?: Masked[]; boost?: number }
  | { kind: 'file'; name: string; src: string; ratio: number; boost?: number }
  | { kind: 'lockup'; name: string; src: string; ratio: number }
  | { kind: 'text'; name: string };

const AREA = 1300;

// From Figma 183:34 (Cursor, Ramp, OpenAI, Lovable and Stripe left out: 16 of the launch reel's
// clients, with room around them).
const DESIGN: Logo[] = [
  {
    kind: 'design', name: 'Airwallex', w: 102.088, h: 13.952, vw: 102.088, vh: 13.952,
    parts: [
      { src: 'airwallex-word.svg', inset: '0.11% 0 -0.01% 23.31%' },
      { src: 'airwallex-mark.svg', inset: '-0.06% 79.44% 0.13% 0' },
    ],
  },
  { kind: 'design', name: 'Gamma', w: 78.585, h: 13.621, vw: 78.585, vh: 13.621, parts: [{ src: 'gamma.svg', inset: '0' }] },
  { kind: 'design', name: 'Deel', w: 53.124, h: 18.389, vw: 53.122, vh: 17.986, boost: 0.9, parts: [{ src: 'deel.svg', inset: '0.01% 0 2.18% 0' }] },
];

// The rest of the launch reel's clients (LaunchesCloud.tsx); Airwallex, Deel and Gamma are in
// DESIGN. Lovable, Akai and Icon left out (16 in all).
const MORE: Logo[] = [
  // the five headline names, first in the grid (November 2026): OpenAI's 2025 wordmark (Wikimedia
  // Commons), Cursor, Sequoia and a16z from their own site headers, and Kleiner Perkins' header
  // mark and letters set as its stacked two-line lockup
  { kind: 'file', name: 'OpenAI', src: 'openai.svg', ratio: 269.6592 / 72.5157 },
  { kind: 'file', name: 'Cursor', src: 'cursor.svg', ratio: 2193 / 545, boost: 1.06 },
  { kind: 'file', name: 'Sequoia', src: 'sequoia.svg', ratio: 180 / 24.043 },
  { kind: 'file', name: 'Andreessen Horowitz', src: 'a16z.svg', ratio: 733.88 / 260.74, boost: 1.3 },
  { kind: 'file', name: 'Kleiner Perkins', src: 'kleinerperkins.svg', ratio: 117.33 / 23.62, boost: 1.15 },
  { kind: 'file', name: 'Cartesia', src: 'cartesia.svg', ratio: 579 / 83, boost: 1.04 },
  { kind: 'file', name: 'Matic Robots', src: 'matic.svg', ratio: 181 / 52, boost: 0.9 },
  { kind: 'file', name: 'PlayerZero', src: 'playerzero.svg', ratio: 2551 / 373, boost: 1.04 },
  { kind: 'file', name: 'PolyAI', src: 'polyai.svg', ratio: 120 / 36 },
  { kind: 'file', name: 'Pocket FM', src: 'pocketfm.svg', ratio: 340 / 53 },
  { kind: 'file', name: 'Wispr Flow', src: 'wispr.svg', ratio: 446 / 125 },
  // from each company's own site header (November 2026)
  { kind: 'file', name: 'Triple Whale', src: 'triplewhale.svg', ratio: 1030 / 150 },
  { kind: 'file', name: 'Superblocks', src: 'superblocks.svg', ratio: 137 / 26 },
  { kind: 'file', name: 'Lindy', src: 'lindy.svg', ratio: 78 / 26 },
  { kind: 'file', name: 'Enterpret', src: 'enterpret.svg', ratio: 120 / 24 },
  { kind: 'file', name: 'Freehand', src: 'freehand.svg', ratio: 164 / 35 },
  { kind: 'file', name: 'Anything', src: 'anything.svg', ratio: 1165 / 305 },
  { kind: 'lockup', name: 'Fish Audio', src: 'fishaudio-mark.svg', ratio: 434.6 / 160.9 },
  // for the client's list of 12 (PICKED): from Wikimedia Commons (November 2026)
  { kind: 'file', name: 'SpaceX', src: 'spacex.svg', ratio: 400 / 50 },
  { kind: 'file', name: 'Lovable', src: 'lovable.svg', ratio: 911 / 155 },
  { kind: 'file', name: 'Lightspeed', src: 'lightspeed.svg', ratio: 600.04 / 121.64, boost: 1.2 },
];

/* Placement, in the construction's px. Four even columns across its 577 width (centres at 1/8,
   3/8, 5/8, 7/8) and four even rows filling the band under the square (660 → 980, under its title), each logo in
   the middle of its cell. ORDER: the five headline names first, then the clients from the design.
   Superblocks, Lindy, PlayerZero, Enterpret and Pocket FM are kept in MORE but not shown (4 × 4). */
const COLS = [1, 3, 5, 7].map((k) => (577.663 * k) / 8);
// (the band's top 54 — 606 → 660 — holds the "Our Clients" title, .hv-zoom-title)
const ROWS = Array.from({ length: 4 }, (_, r) => 660 + ((979.999 - 660) * (r + 0.5)) / 4);
const ORDER_ALL = [
  'OpenAI', 'Cursor', 'Sequoia', 'Andreessen Horowitz',
  'Kleiner Perkins', 'Airwallex', 'Gamma', 'Deel',
  'Triple Whale', 'Cartesia', 'Matic Robots', 'PolyAI',
  'Fish Audio', 'Wispr Flow', 'Freehand', 'Anything',
];
// 2026-11-25, for the time being (client): SpaceX, OpenAI and Cursor hidden from every client grid.
// Stand-ins from the clients a grid doesn't otherwise show keep each grid full. Empty HIDDEN to bring them back.
const HIDDEN = new Set(['SpaceX', 'OpenAI', 'Cursor']);
const withHidden = (names: string[], standIns: string[]) =>
  [...names.filter((n) => !HIDDEN.has(n)), ...standIns].slice(0, names.length);
const ORDER = withHidden(ORDER_ALL, ['Lightspeed', 'Lovable', 'PlayerZero']);
const BY_NAME = new Map([...DESIGN, ...MORE].map((l) => [l.name, l]));
const PLACED = ORDER.map((name, i) => ({ l: BY_NAME.get(name)!, cx: COLS[i % 4], cy: ROWS[Math.floor(i / 4)] }));
/* The client's list (2026-11-21 feedback): Andreessen Horowitz and Lovable lead, Pocket FM out. Ten that
   stay, then two cells that keep turning over through the rest of the launch reel's clients (ROT_A, ROT_B),
   so it reads as more than twelve. Shown in place of ORDER when html[data-clients='picked'] (/home-4's
   Clients tab, which also hides Our Network); other pages keep ORDER. Pocket FM stays out. 2026-11-23: ordered by size, largest first (valuation, or assets under management for the
   investment firms): the ten that stay, then the next ten through the two turning cells, alternating so each
   cell opens on the next in line (Wispr Flow, PolyAI). Freehand is out of the turn-over. */
// 2026-11-23: SpaceX back, first (client); Gamma moves into the turn-over and PlayerZero, the
// smallest, leaves it, so the grid stays at twelve
const PICKED_STILL_ALL = [
  'SpaceX', 'OpenAI', 'Andreessen Horowitz', 'Sequoia',
  'Lightspeed', 'Cursor', 'Kleiner Perkins', 'Deel',
  'Lovable', 'Airwallex',
];
// SpaceX, OpenAI and Cursor hidden for now (HIDDEN, above); three not otherwise shown keep it at twelve
const PICKED_STILL = withHidden(PICKED_STILL_ALL, ['PlayerZero', 'Freehand', 'Anything']);
// five each: the turn-over keyframes (hero-vertical.css .hvc-rot) assume five per cell
const ROT_A = ['Gamma', 'PolyAI', 'Triple Whale', 'Fish Audio', 'Lindy'];
const ROT_B = ['Wispr Flow', 'Matic Robots', 'Cartesia', 'Superblocks', 'Enterpret'];
const PICKED = [...PICKED_STILL, ROT_A[0], ROT_B[0]];
const ROTATING = new Map([[ROT_A[0], ROT_A], [ROT_B[0], ROT_B]]);
const ROWS3 = Array.from({ length: 3 }, (_, r) => 660 + ((979.999 - 660) * (r + 0.5)) / 3);
const PLACED_PICKED = PICKED.map((name, i) => ({ l: BY_NAME.get(name)!, cx: COLS[i % 4], cy: ROWS3[Math.floor(i / 4)] }));

const fit = (vw: number, vh: number, boost = 1) => Math.sqrt(AREA / (vw * vh)) * boost;
// Inter Medium: ~0.56em per character, ink ~0.72em tall
const textSize = (name: string) => Math.min(18, Math.max(15, Math.sqrt(AREA / (0.56 * name.length * 0.72))));

const vars = (v: Record<string, string | number>) => v as CSSProperties;
const delay = (ms: number) => vars({ '--d': `${ms}ms` });
const src = (f: string) => `/assets/hero-v/${f}`;

function Ticks() {
  return (
    <>
      <span className="tick tick-l" aria-hidden="true" />
      <span className="tick tick-r" aria-hidden="true" />
    </>
  );
}

function LogoPart({ src: s, inset }: Part) {
  return (
    <span className="part" style={{ inset }}>
      <img src={src(s)} alt="" />
    </span>
  );
}

/* One logo's visual (design box, file mask or type-set name), no position of its own — used both
   in the golden-ratio grid (Zoom) and the plain card grid (Fade, HeroClients). */
function LogoVisual({ l }: { l: Logo }) {
  if (l.kind === 'design') {
    return (
      <span className="hv-logo" role="img" aria-label={l.name} style={vars({ '--w': l.w, '--h': l.h, '--s': fit(l.vw, l.vh, l.boost) })}>
        {l.parts.map((p) => <LogoPart key={p.src} {...p} />)}
        {l.masked?.map((m) => (
          <span className="hv-lv" key={m.src} style={{ inset: m.box, ...vars({ '--mx': m.mx, '--my': m.my }) }}>
            <LogoPart src={m.src} inset={m.inset} />
          </span>
        ))}
      </span>
    );
  }
  if (l.kind === 'file') {
    const k = fit(l.ratio, 1, l.boost); // ink of 1 × ratio, scaled to the area
    return <span className="hv-more-mark" role="img" aria-label={l.name} style={vars({ '--src': `url('/assets/clients/${l.src}')`, '--w': l.ratio * k, '--h': k })} />;
  }
  if (l.kind === 'lockup') {
    return (
      <span className="hv-lockup" role="img" aria-label={l.name}>
        <span className="hv-more-mark" style={vars({ '--src': `url('/assets/clients/${l.src}')`, '--w': l.ratio * 11, '--h': 11 })} />
        <span className="hv-text-mark" aria-hidden="true" style={vars({ '--fs': 14 })}>{l.name}</span>
      </span>
    );
  }
  return <span className="hv-text-mark" style={vars({ '--fs': textSize(l.name) })}>{l.name}</span>;
}

/* /home-4, Fade (html[data-intro='fade']): the clients as a titled card (Zoom keeps the
   golden-ratio grid above; this renders alongside it and the two are shown one at a time by CSS)
   — a centred "Our Clients" label, then the 16 logos in a plain 4-column grid on a soft grey
   card. The same logos and order as the golden-ratio grid (ORDER, above). */
function HeroClients({ names, set }: { names: string[]; set: 'all' | 'picked' }) {
  return (
    <div className="hv-clients" data-set={set}>
      <p className="hv-clients-title">Our Clients</p>
      <ul className="hvc-grid" aria-label="Clients">
        {names.map((name, i) => {
          const l = BY_NAME.get(name)!;
          const rot = set === 'picked' ? ROTATING.get(name) : undefined;
          return (
            <li className="hvc-cell" key={l.name} style={delay(i * 40)}>
              {rot ? (
                // the two turning cells: their logos stacked, one showing at a time (.hvc-rot); the
                // second cell runs half a step behind the first, so they never change together
                <span className="hvc-rot" data-lane={rot === ROT_A ? 'a' : 'b'}>
                  {rot.map((n, k) => (
                    <span className="hvc-rot-item" key={n} style={vars({ '--k': k })} aria-hidden={k > 0 || undefined}>
                      <LogoVisual l={BY_NAME.get(n)!} />
                    </span>
                  ))}
                </span>
              ) : <LogoVisual l={l} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* The home page's client card on its own (the client's twelve, two turning over), for /exp/cd/logos. */
export function HomeClients() {
  return <HeroClients names={PICKED} set="picked" />;
}

export default function HeroVertical() {
  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-dark"><div className="texture" /></div>
        <div className="backdrop-light" />
      </div>
      <div className="frame rails" aria-hidden="true"><span className="rails-light" /></div>

      {/* html[data-hv]: the pages with this hero (styles keyed off it, not body:has(.hero.hv)) */}
      <HtmlMark name="hv" />
      <div className="hero hv">
        {/* /home-4 ?loader=videobg: the loader's Fibonacci diagram kept as the hero's background, in the
            same place as it is under the loader (the first screen), so the white lifts off it
            (hero-vertical.css .hv-fib; hidden otherwise) */}
        <FibLines className="hv-fib" fit="slice" />
        <div className="frame">
          <header className="site-header">
            {/* wordmark and nav: the fixed header in SiteChrome.tsx */}
            <Ticks />
          </header>

          <main className="hv-main">
            <div className="hv-golden">
              {/* construction (Figma 183:18): the golden rectangle upright, 12% grey lines */}
              <img className="hv-construction" src={src('construction.svg')} width={577.663} height={980.663} alt="" aria-hidden="true" />

              <div className="hv-copy">
                <h1 className="hv-headline" aria-label={HEADLINE}>
                  {LINES.map((l, i) => (
                    <span className="hv-line" key={l} aria-hidden="true">
                      <span className="hv-li" style={delay(380 + i * 90)}>
                        {i < LINES.length - 1 ? l : (
                          <>in <span className="hv-city">{CITIES.map((c) => <span key={c}>{c}</span>)}</span></>
                        )}
                      </span>
                    </span>
                  ))}
                </h1>

                <div className="hv-body">
                  <p className="rise" style={delay(760)}>
                    The largest tech companies on earth rely on our algorithm research, analytics software, and deployed
                    services to reach a billion people.
                  </p>
                  <div>
                    <p className="rise" style={delay(840)}>We do three things:</p>
                    <ul>
                      <li className="rise" style={delay(920)}>
                        Algorithm research on the largest weighted engagement datasets (1T+ views) to reverse engineer X
                        and LI algorithms and predictably go viral
                      </li>
                      <li className="rise" style={delay(990)}>
                        Build analytics software that can model acceleration/<wbr />decay of engagement and can predict if
                        something will cross 1M views in the first 30 minutes, account-level audience identification, etc.
                      </li>
                      <li className="rise" style={delay(1060)}>
                        Forward deploy our Creative + Growth team within our clients&apos; orgs to run the biggest product
                        launches and scale company brand.
                      </li>
                    </ul>
                  </div>
                  <p className="rise" style={delay(1140)}>
                    In the last 2 years, $1T was spent on paid marketing on Meta and Google. Paid reach is getting more
                    expensive with diminishing returns. Companies now need organic distribution faster than we can hire
                    and build systems to provide it. Identity Labs has grown 7x in revenue to $20M ARR because of this
                    demand.
                  </p>
                </div>
              </div>

              {/* Zoom: the grid's title, as Fade's card has — at the top of the logos' band, under the square */}
              <p className="hv-zoom-title rise" style={delay(1200)}>Our Clients</p>
              {([['all', PLACED], ['picked', PLACED_PICKED]] as const).map(([set, placed]) => (
                <ul className="hv-logos" aria-label="Clients" data-set={set} key={set}>
                  {placed.map(({ l, cx, cy }, i) => (
                    <li className={l.kind === 'design' ? 'hv-logo-slot' : 'hv-more'} key={l.name}
                      style={vars({ '--cx': cx, '--cy': cy, '--d': `${1240 + i * 40}ms` })}>
                      <LogoVisual l={l} />
                    </li>
                  ))}
                </ul>
              ))}

              {/* Fade only (html[data-intro='fade']): the same clients as a titled card, shown in
                  place of the golden-ratio grid above */}
              <HeroClients names={ORDER} set="all" />
              <HeroClients names={PICKED} set="picked" />
            </div>

            <Ticks />
          </main>
        </div>
      </div>
    </>
  );
}
