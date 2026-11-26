import type { CSSProperties } from 'react';
import { CLIENTS, CLIPS, CdProcess, Words, d0 } from '../cd/CdPage';
import CdClients from '../cd/CdClients';
import CdGallery from '../cd/CdGallery';
import CdReveal from '../cd/CdReveal';
import Cd2Stage from './Cd2Stage';
import Cd2Melt from './Cd2Melt';
import Cd2Scale from './Cd2Scale';
import Cd2Title from './Cd2Title';
import '../../../components/hero-vertical.css';
import '../cd/cd.css';
import './cd2.css';

/* /exp/cd-2 (2026-11-26): the Creative Director page told by the scroll. The first screen pins and its
   three scenes take turns as the page scrolls (Cd2Stage, all of it scrubbed), each centred on the screen: the headline
   alone; the clients by name, larger than /exp/cd's (48px), under their label, ending at Matic with a
   full stop (as the frame); the lead. Then the page scrolls normally: the gallery coming up from below,
   the creative process, the page gone dark ("downstream" melts down and fills the screen at the opening's
   end). As /exp/cd's primary version otherwise (?clients=title there): a name hovered
   turns into its boiling logo, the lead hovered pales and its claim boils, the clips at 1.2x. */

/* A solid black building before "company" in the lead, as heavy as the client logos, and boiling as
   they do on hover, all the time (cd.css's cd-boil filters; cd2.css). Windows and door cut out. */
const Building = () => (
  <svg className="cd2-building" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fillRule="evenodd"
      fill="currentColor"
      d="M4 2h9a1 1 0 0 1 1 1v19H3V3a1 1 0 0 1 1-1zm1.6 3.2v2.4H8V5.2zm3.4 0v2.4h2.4V5.2zM5.6 9.4v2.4H8V9.4zm3.4 0v2.4h2.4V9.4zm-3.4 4.2V16H8v-2.4zm3.4 0V16h2.4v-2.4zM7.3 18.2V22h2.4v-3.8zM15.2 8.5H20a1 1 0 0 1 1 1V22h-5.8zm1.6 3v2.2H19v-2.2zm0 4v2.2H19v-2.2z"
    />
  </svg>
);

/* "downstream", which melts (Cd2Melt draws it, melting, on the pinned screen's canvas) */
const Downstream = () => (
  <span className="cd-w cd2-down"><span className="cd-wi" style={{ '--i': 27 } as CSSProperties}>downstream</span></span>
);

/* blueprint furniture for the dark part: a dimension line across the gallery, and the crosshair mark */
const Dim = ({ label }: { label: string }) => (
  <div className="cd2-dim" aria-hidden="true"><span>{label}</span></div>
);
const Crosshair = () => (
  <svg className="cd2-cross" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path d="M2 12V2h10M36 2h10v10M46 36v10H36M12 46H2V36" fill="none" stroke="currentColor" strokeWidth="1" />
    <circle cx="24" cy="24" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
    <path d="M24 10v28M10 24h28" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const SHOWN = CLIENTS.slice(0, CLIENTS.findIndex((c) => c.name === 'Matic') + 1);

// before paint: hide what will animate in (not for reduced motion); /exp/cd's primary version, for the
// hover and clip-speed rules keyed to it
const BEFORE_PAINT = "var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('cd-js');d.dataset.cdClients='title';d.dataset.cdLines='off'";

export default function Cd2Page() {
  return (
    <main className="cd cd2">
      <script dangerouslySetInnerHTML={{ __html: BEFORE_PAINT }} />
      <CdReveal />
      <Cd2Stage />
      <Cd2Melt />

      <section className="cd2-stage">
        <div className="cd2-pin">
          <a className="wordmark cd-mark" href="/" aria-label="Identity Labs home">
            <span>Identity</span>
            <span className="wm-space"> </span>
            <em>Labs</em>
          </a>

          {/* 1. the headline, alone: it plays in on load as jitter.video's (Cd2Title), and the scroll takes it out (Cd2Stage) */}
          <div className="cd2-scene cd2-scene-title" data-on="">
            <div className="cd-col">
              <Cd2Title />
            </div>
          </div>

          {/* 2. the clients */}
          <div className="cd2-scene cd2-scene-clients">
            <div className="cd2-clients">
              <p className="cd2-label"><Words text="We only work with category-defining companies." /></p>
              <CdClients clients={SHOWN} end="." className="cd2-names" delay={150} />
            </div>
          </div>

          {/* 3. the lead */}
          <div className="cd2-scene cd2-scene-lead">
            <div className="cd-col">
              <p className="cd-lead">
                <Words text="We’re the only" />{' '}<span className="cd2-bld"><Building /></span><Words text="company in the world" from={4} /><br className="cd-br" />{' '}
                <Words text="with the ability and track record to" from={7} /><br className="cd-br" />{' '}
                <Words text="guarantee" from={14} />{' '}
                <a href="/launches"><Words text="10M views on any launch" from={15} /><br className="cd-br" /> <Words text="we do" from={20} /></a>
                <Words text=". Our creative process is" from={22} /><br className="cd-br" /> <Downstream /> <Words text="of this." from={28} />
              </p>
            </div>
          </div>

          {/* "downstream" melting down the screen until it fills it dark (Cd2Melt) */}
          <canvas className="cd2-drips" aria-hidden="true" />
        </div>
      </section>

      {/* from here the page is dark: the melt has filled the screen */}
      <div className="cd2-dark">
        {/* the blueprint, in black: a drafting grid (fading in below the melt, so the hand-off from its
            flat dark stays seamless), the sheet's frame lines with ruler ticks, under the content */}
        <div className="cd2-bp" aria-hidden="true" />
        <div className="cd2-bp-frame" aria-hidden="true" />
        <Cd2Scale />
        <div className="cd2-bp-fade" aria-hidden="true" />

        <section className="cd2-work" aria-label="Behind the scenes">
          <div className="cd2-bp-row">
            <span>Identity Labs — Creative Director</span>
            <span>Sheet 01 / 02</span>
          </div>
          <div className="cd2-bp-row cd2-bp-sec">
            <span><i>01.</i> Behind the scenes</span>
            <span>{CLIPS.length} loops, cut from the launch films</span>
          </div>
          <Dim label={`${CLIPS.length} loops · 3 col`} />
          <CdGallery clips={CLIPS} />
        </section>

        <div className="cd2-bp-row cd2-bp-sec cd2-bp-sec-process">
          <span><i>02.</i> Creative process</span>
          <span>Sheet 02 / 02</span>
        </div>
        <CdProcess />

        <div className="cd2-bp-row cd2-bp-foot">
          <span>London · San Francisco · Bangalore</span>
          <Crosshair />
        </div>
      </div>
    </main>
  );
}
