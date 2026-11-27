import { Fragment, type CSSProperties } from 'react';
import { CLIENTS, CLIPS, d0 } from '../cd/CdPage';
import CdClients from '../cd/CdClients';
import CdReveal from '../cd/CdReveal';
import LoopVideo from '../cd/LoopVideo';
import Cd3Grid from './Cd3Grid';
import Cd3Props from './Cd3Props';
import Cd3Scroll from './Cd3Scroll';
import Cd3Wrap from './Cd3Wrap';
import Cd3Clapper from './Cd3Clapper';
import Cd3Gallery from './Cd3Gallery';
import '../cd/cd.css';
import './cd3.css';

/* /exp/cd-3 (2026-11-27): the Creative Director page, editorial (the cd-33 to cd-35 frames). Big type on
   a 12-column grid: Season Mix at display size, two tones (grey for the set-up, ink for the point), IBM
   Plex Mono caps for the small labels. The wordmark stays fixed at the top centre.
   Motion, after how the big labs' pages move (measured 2026-11-27; cd3.css): words rise out of their line
   at load and as each block arrives; the ink words fill in from grey with the scroll, one after another
   (as Linear's and Apple's pages read); the clients rise a name at a time; the gallery comes in as
   /exp/cd's (shopify.design's); the film opens from an inset as it rises. Lenis smooth scroll (the root
   layout). Press G for the grid. */

const SHOWN = ['SpaceX', 'OpenAI', 'Andreessen Horowitz', 'Sequoia', 'Lightspeed', 'Cursor', 'Kleiner Perkins', 'Deel', 'Lovable', 'Airwallex', 'Gamma', 'Pocket FM', 'Wispr Flow', 'Matic']
  .map((n) => CLIENTS.find((c) => c.name === n)!);

/* Words for the text animations (cd.css [data-reveal]: each word in a clip box, the inside rising),
   numbered on from `from` so a block's words follow one another. tone="ink" words fill from grey to ink
   with the block's scroll progress (--p, Cd3Scroll), word k of n at its turn (cd3.css .cd3-ink). */
function T({ text, from = 0, tone }: { text: string; from?: number; tone?: 'ink' }) {
  const words = text.split(' ');
  const body = words.map((w, k) => (
    <Fragment key={k}>
      <span className="cd-w">
        <span className="cd-wi" style={{ '--i': from + k, '--k': k } as CSSProperties}>{w}</span>
      </span>
      {k < words.length - 1 ? ' ' : null}
    </Fragment>
  ));
  return tone ? <span className="cd3-ink" style={{ '--n': words.length } as CSSProperties}>{body}</span> : <>{body}</>;
}

// before paint: hide what will animate in (not for reduced motion); /exp/cd's primary version, for the
// hover and clip-speed rules keyed to it
const BEFORE_PAINT = "var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('cd-js');d.dataset.cdClients='title';d.dataset.cdLines='off'";

export default function Cd3Page() {
  return (
    <main className="cd cd3">
      <script dangerouslySetInnerHTML={{ __html: BEFORE_PAINT }} />
      <CdReveal />
      <Cd3Scroll />
      <Cd3Grid />
      <a className="wordmark cd-mark" href="/" aria-label="Identity Labs home">
        <span>Identity</span>
        <span className="wm-space"> </span>
        <em>Labs</em>
      </a>

      {/* 1. the headline, at the foot of the first screen */}
      <section className="cd3-grid cd3-hero" data-r="0 -0.6">
        <div className="cd3-span cd3-hero-in">
        <h1 className="cd3-display" data-reveal="" style={d0(300, 34)}>
          <span className="cd3-soft"><T text="If a film director and a product marketer had a child," /></span>{' '}
          <span className="cd3-hl"><T text="you’d probably get a Creative Director at Identity Labs." from={11} /></span>
        </h1>
        {/* the creative director's things, falling onto the headline */}
        <Cd3Props />
        </div>
      </section>

      {/* 2. the clients */}
      <section className="cd3-grid cd3-clients" aria-labelledby="cd3-clients-label" data-step="">
        <p id="cd3-clients-label" className="cd3-label cd3-span" data-reveal="fade" style={d0(0, 18)}>
          <T text="We only work with category-defining companies." />
        </p>
        <CdClients clients={SHOWN} end="." className="cd3-names cd3-span" delay={150} />
        <p className="cd3-label cd3-note" data-reveal="fade" style={d0(200, 10)}>
          <T text="Our creative directors are forward-deployed inside these companies, working directly with founders to forge the story of a product they’ve bet the entire company’s success on." />
        </p>
      </section>

      {/* 3. the claim and the gallery */}
      <section className="cd3-grid cd3-work" aria-label="Behind the scenes" data-step="">
        {/* the claim, pinned at the top of the screen with the clips as a reel turning past under it
            (Cd3Reel), or the collage bursting out of one card (Cd3Burst), by the tabs; /exp/cd's gallery
            under it on phones */}
        <div className="cd3-span cd3-gallery">
          <Cd3Gallery
            clips={CLIPS}
            head={
              <p className="cd3-lead" data-reveal="" style={d0(0, 22)} data-p="0.8 0.3">
                <T text="We’re the only company in the world with the ability and track record to guarantee" />{' '}
                <a href="/launches"><T text="10M views on any launch we do" from={15} tone="ink" /></a>
                <T text=". Our creative process is downstream of this." from={22} />
              </p>
            }
          />
        </div>
      </section>

      {/* 4. the process */}
      <section className="cd3-grid cd3-process" aria-label="Our creative process">
        {/* the clapperboard pinned mid-screen, turning; the statement scrolling up through it and parting
            round it (Cd3Wrap) */}
        <div className="cd3-span cd3-scene">
          <div className="cd3-scene-pin" aria-hidden="true">
            <Cd3Clapper />
          </div>
          <p className="cd3-lead cd3-brief" data-reveal="" style={d0(0, 22)} data-p="0.8 0.35">
            <T text="Most marketing agencies are handed a brief and then told to come up with the strategy." />{' '}
            <T text="Our creative process starts with coming up with the brief." from={16} tone="ink" />
          </p>
          <Cd3Wrap />
        </div>
        {/* ink as it arrives; back to grey as the film rises under it */}
        <p className="cd3-lead cd3-span cd3-step" data-reveal="" style={d0(0, 22)} data-p="0.95 0.7" data-r="0.55 0.3">
          <T text="Every launch begins with going deep into the product with the founder" tone="ink" />
        </p>
        <figure className="cd3-span cd3-film" data-p="1 0.25">
          <div className="cd3-film-in">
            <LoopVideo className="cd-video" src="/assets/cd/akai-bts.mp4" poster="/assets/cd/akai-bts.jpg" label="Akai: the founder on set with the crew" />
          </div>
        </figure>
      </section>
    </main>
  );
}
