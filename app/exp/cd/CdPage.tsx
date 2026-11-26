import { Fragment, type CSSProperties } from 'react';
import { HomeClients } from '../../../components/HeroVertical';
import CdClients, { type Client } from './CdClients';
import CdGallery, { type Clip } from './CdGallery';
import CdFit from './CdFit';
import CdOptions from './CdOptions';
import CdReveal from './CdReveal';
import ScrubVideo from './ScrubVideo';
import '../../../components/hero-vertical.css';
import './cd.css';

/* The Creative Director page, /exp/cd (2026-11-25, from the cd-5 / cd-6 / cd-7 frames). The hero's
   clients in two versions, picked with the tabs at the bottom (CdOptions, ?clients=): by name (two rows
   showing at the bottom of the first screen; a name turns into its logo on hover, as on venice.inc), or
   as on the home page (HeroVertical's card: "Our Clients", twelve logos, the last two turning over). White, one narrow text
   column centred on the page, Season Mix for the headings, IBM Plex Mono in caps for the rest. Then the
   gallery of behind-the-scenes loops cut from the launch videos (public/assets/cd), cards entering as on
   shopify.design; and the creative process, its clip played by the scroll and growing to the whole
   screen (as on venice.inc/about). */

// the clients, with their logos (as in the hero, HeroVertical) for the hover
const C = (f: string) => `/assets/clients/${f}`;
export const CLIENTS: Client[] = [
  { name: 'SpaceX', src: C('spacex.svg'), ratio: 400 / 50 },
  { name: 'OpenAI', src: C('openai.svg'), ratio: 269.6592 / 72.5157 },
  { name: 'Andreessen Horowitz', src: C('a16z.svg'), ratio: 733.88 / 260.74, boost: 1.3 },
  { name: 'Sequoia', src: C('sequoia.svg'), ratio: 180 / 24.043 },
  { name: 'Lightspeed', src: C('lightspeed.svg'), ratio: 600.04 / 121.64, boost: 1.2 },
  { name: 'Cursor', src: C('cursor.svg'), ratio: 2193 / 545, boost: 1.06 },
  { name: 'Kleiner Perkins', src: C('kleinerperkins.svg'), ratio: 117.33 / 23.62, boost: 1.15 },
  { name: 'Deel', src: '/assets/deel.svg', ratio: 59.2933 / 20.2546 },
  { name: 'Lovable', src: C('lovable.svg'), ratio: 911 / 155 },
  { name: 'Airwallex', src: C('airwallex.svg'), ratio: 102.088 / 13.952 },
  { name: 'Gamma', src: '/assets/gamma.svg', ratio: 78.8959 / 13.6753 },
  { name: 'Pocket FM', src: C('pocketfm.svg'), ratio: 340 / 53 },
  { name: 'Wispr Flow', src: C('wispr.svg'), ratio: 446 / 125 },
  { name: 'PolyAI', src: C('polyai.svg'), ratio: 120 / 36 },
  { name: 'Matic', src: C('matic.svg'), ratio: 181 / 52, boost: 0.9 },
  { name: 'Cartesia', src: C('cartesia.svg'), ratio: 579 / 83, boost: 1.04 },
  { name: 'Fish Audio', src: C('fishaudio-mark.svg'), ratio: 434.6 / 160.9 },
  { name: 'PlayerZero', src: C('playerzero.svg'), ratio: 2551 / 373, boost: 1.04 },
  { name: 'Freehand', src: C('freehand.svg'), ratio: 164 / 35 },
  { name: 'Anything', src: C('anything.svg'), ratio: 1165 / 305 },
];

// The gallery, in reading order down each column (CSS columns). Each tile has its own shape so the
// columns stagger; the clips (16:9) fill their tile.
export const CLIPS: Clip[] = [
  ['wispr-bts', 'Wispr Flow: the crew at the Porsche', '4 / 3'],
  ['fishaudio-set', 'Fish Audio: the set', '16 / 9'],
  ['pocketfm-pitch', 'Pocket FM: Rick in the board room', '4 / 5'],
  ['matic-zoom', 'Matic: the robot up close', '16 / 9'],
  ['playerzero-red', 'PlayerZero: table tennis', '4 / 3'],
  ['lovable-200m', 'Lovable: we have raised $200M', '16 / 9'],
  ['akai-bts', 'Akai: the founder on set with the crew', '4 / 3'],
  ['matic-bts', 'Matic: the documentary shoot', '16 / 9'],
  ['matic-studio', 'Matic: the studio, nine years of prototypes', '1 / 1'],
  ['playerzero-rally', 'PlayerZero: a table tennis rally', '4 / 5'],
  ['fishaudio-rig', 'Fish Audio: the camera rig on set', '16 / 9'],
  ['matic-lab', 'Matic: the robot arm in the lab', '1 / 1'],
  ['pocketfm-phone', 'Pocket FM: Rick on the phone', '1 / 1'],
  ['wispr-opening', 'Wispr Flow: the Porsche', '16 / 9'],
  ['fishaudio-set-wide', 'Fish Audio: the set, wide', '4 / 3'],
  ['matic-spill', 'Matic: the warehouse demo', '4 / 5'],
  ['playerzero-grey', 'PlayerZero: the grey table', '4 / 3'],
];

/* Words split for the text animations (cd.css, [data-reveal]): each word in a clip box (cd-w) holding
   the part that moves (cd-wi), numbered from `from` so a block's words follow one another. */
export function Words({ text, from = 0 }: { text: string; from?: number }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, k) => (
        <Fragment key={k}>
          <span className="cd-w">
            <span className="cd-wi" style={{ '--i': from + k } as CSSProperties}>{w}</span>
          </span>
          {k < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}
export const d0 = (ms: number, step?: number) => ({ '--d0': `${ms}ms`, ...(step ? { '--st': `${step}ms` } : {}) }) as CSSProperties;

// before paint: hide what will animate in (not for reduced motion), so the first frame is the start;
// and the hero's clients version from the address (?clients=names|logos; the names at the headline's size, title, by default; CdOptions), so it never flashes
// and whether the margin lines show (off unless ?lines=on)
const BEFORE_PAINT = "var d=document.documentElement,q=new URLSearchParams(location.search);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('cd-js');var c=q.get('clients');d.dataset.cdClients=c==='logos'||c==='names'?c:'title';d.dataset.cdLines=q.get('lines')==='on'?'on':'off'";

/* a pair of the small squares on the margin lines, at this point of the page (cd.css .cd-ticks) */
const Ticks = ({ at }: { at?: 'top' | 'bottom' }) => (
  <span className="cd-ticks" data-at={at} aria-hidden="true"><span /><span /></span>
);

export default function CdPage() {
  return (
    <main className="cd">
      <script dangerouslySetInnerHTML={{ __html: BEFORE_PAINT }} />
      <CdReveal />
      <CdOptions />
      <CdFit />
      {/* the margin lines, fixed down the whole page at the home page's frame edges */}
      <div className="cd-rails" aria-hidden="true" />
      <a className="wordmark cd-mark" href="/" aria-label="Identity Labs home">
        <span>Identity</span>
        <span className="wm-space"> </span>
        <em>Labs</em>
      </a>

      <section className="cd-intro">
        <Ticks />
        {/* the first screen ends two rows into the clients */}
        <div className="cd-col cd-hero">
          <h1 className="cd-title" data-reveal="" style={d0(250)}>
            <span className="cd-soft"><Words text="If a film director and a product" /><br className="cd-br" /> <Words text="marketer had a child," from={7} /></span>{' '}
            <Words text="you’d" from={11} /><br className="cd-br" /> <Words text="probably get a Creative Director" from={12} /><br className="cd-br" /> <Words text="at Identity Labs." from={17} />
          </h1>
          <div className="cd-copy">
            <p data-reveal="fade" style={d0(900, 22)}><Words text="We only work with category-defining companies." /></p>
            <p data-reveal="fade" style={d0(1050, 12)}>
              <Words text="Our creative directors are forward-deployed inside these companies. They work directly with founders and their creative teams to forge the story of a product they’ve bet the entire company’s success on." />
            </p>
          </div>
        </div>
        {/* both versions; html[data-cd-clients] (the tabs, CdOptions) shows one */}
        <CdClients clients={CLIENTS} />
        {/* the home page's card (HeroVertical), its own classes kept so its styles apply */}
        <div className="cd-col hv cd-home-clients"><HomeClients /></div>
      </section>

      <section className="cd-work" aria-label="Behind the scenes">
        <Ticks />
        <div className="cd-col">
          <p className="cd-lead" data-reveal="" style={d0(0, 30)}>
            {/* broken as the frame (desktop); its longest line runs a little past the column */}
            <Words text="We’re the only company in the world" /><br className="cd-br" />{' '}
            <Words text="with the ability and track record to" from={7} /><br className="cd-br" />{' '}
            <Words text="guarantee" from={14} />{' '}
            <a href="/launches"><Words text="10M views on any launch" from={15} /><br className="cd-br" /> <Words text="we do" from={20} /></a>
            <Words text=". Our creative process is" from={22} /><br className="cd-br" /> <Words text="downstream of this." from={27} />
          </p>
        </div>
        <CdGallery clips={CLIPS} />
      </section>

      <CdProcess />
    </main>
  );
}

/* the creative process: the heading, its copy, and the clip played by the scroll (also /exp/cd-2) */
export function CdProcess() {
  return (
    <section className="cd-process" aria-labelledby="cd-process-title">
      <Ticks />
      <Ticks at="bottom" />
      <div className="cd-col">
        <h2 id="cd-process-title" className="cd-h2" data-reveal="" style={d0(0)}><Words text="Our creative process" /></h2>
        <div className="cd-copy cd-process-copy">
          <p data-reveal="fade" style={d0(300, 10)}>
            <Words text="It starts with coming up with the brief. We’re not handed a brief. Creative brainstorming is very fun (the ideas in the room can range from let’s hire Charlie Puth to make this video, to let’s give a Porche as a challenge, we find inspiration in unexpected places." />
          </p>
          <p data-reveal="fade" style={d0(450, 10)}>
            <Words text="We obsess over the details, challenge the expected, and push beyond what’s comfortable. Exceptional work doesn’t need an explanation. It speaks for itself" />
          </p>
        </div>
      </div>
      <ScrubVideo
        dir="/assets/cd/akai-seq" count={636} poster="/assets/cd/process-akai.jpg" label="Akai: the founder on set with the director"
        caption={
          <p className="cd-step" data-reveal="fade" style={d0(0, 18)}>
            <Words text="Every launch begins with going deep into the product with the founder" />
          </p>
        } />
    </section>
  );
}
