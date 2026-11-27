import type { ReactNode } from 'react';
import SiteFooter from '../flow/SiteFooter';
import SiteChrome from '../SiteChrome';
import HtmlMark from '../HtmlMark';
import DitherClip from './DitherClip';
import { CAREERS_EMAIL, ROLES } from './content';
import '../sections.css';
import '../flow/flow.css';
import '../legal/legal.css';
import './ed.css';

/* A role as a long read (/careers/creative-director, /head-of-growth, /thinker-writer; 2026-11-27): the white page with the rails and the
   site's chrome; a cover from rail to rail, as a Notion page's, filled by the role's clip as a 1-bit
   dither (DitherClip); the title and the ways to apply (form, cold email) below, in the 512px column; the role's text (children:
   EdPart sections, word for word from its posting); the title and the ways to apply again; the footer.
   Styles: ed.css. */

export type Cover = { src: string; focus?: [number, number]; tone?: [number, number] };

const INK: [number, number, number] = [0.36, 0.36, 0.36]; // a soft grey: the covers stay light

// the two ways to apply: the role's form (its posting, from content.ts), and a cold email; both
// outlined at the top, the form black at the foot (`solid`)
const Ctas = ({ title, solid }: { title: string; solid?: boolean }) => {
  const form = ROLES.find((r) => r.title === title)?.apply;
  return (
    <div className="ed-ctas">
      {form && <a className={`ed-btn${solid ? ' ed-btn-solid' : ''}`} href={form} target="_blank" rel="noopener noreferrer">Apply via form <span aria-hidden="true">↗</span></a>}
      <a className="ed-btn" href={`mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(title)}`}>Cold email <span aria-hidden="true">↗</span></a>
    </div>
  );
};

// a part of the text: its number in brackets over a rule, the title in Season Mix
export function EdPart({ n, id, title, children }: { n: number; id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="ed-part">
      <h2 className="ed-part-h"><span className="ed-part-n">[{String(n).padStart(2, '0')}]</span>{title}</h2>
      {children}
    </section>
  );
}

// a step within a part: its number pale before the title (when the posting numbers its steps)
export function EdStep({ n, id, title, children }: { n?: number; id?: string; title: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="ed-ch">
      <h3 className="ed-ch-h">{n !== undefined && <><span className="ed-ch-n">{n}.</span> </>}{title}</h3>
      {children}
    </section>
  );
}

// a link out of the text, in a new tab
export const Ref = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
);

// "the type of person" list, as a checklist the reader ticks
export function EdChecklist({ note, items }: { note: ReactNode; items: ReactNode[] }) {
  return (
    <>
      <p className="ed-aside">{note}</p>
      <div className="ed-check">
        <ul>
          {items.map((t, i) => (
            <li key={i}><label><input type="checkbox" /><span className="ed-box" aria-hidden="true" /><span>{t}</span></label></li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function EdRole({ title, cover, children }: { title: string; cover: Cover; children: ReactNode }) {
  return (
    <div className="ed">
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme='light'" }} />
      <span className="s2-flow" hidden />
      <HtmlMark name="s2" />
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-dark"><div className="texture" /></div>
        <div className="backdrop-light" />
      </div>
      <div className="frame rails" aria-hidden="true"><span className="rails-light" /></div>
      <div className="frame lg-ticks" aria-hidden="true">
        <div className="site-header"><span className="tick tick-l" /><span className="tick tick-r" /></div>
      </div>
      <div className="frame lg-veil" aria-hidden="true" />

      <header className="ed-hero">
        <div className="frame ed-cover">
          <DitherClip src={cover.src} focus={cover.focus ?? [0.5, 0.5]} tone={cover.tone ?? [0, 0.4]} ink={INK} label="" />
        </div>
        <div className="ed-hero-text">
          <a className="ed-back" href="/careers"><span aria-hidden="true">←</span> Careers</a>
          <h1 className="ed-title"><span>{title}</span><span className="ed-pale">at Identity Labs</span></h1>
          <Ctas title={title} />
        </div>
      </header>

      <div className="ed-body">
        <article className="ed-article">{children}</article>
      </div>

      <section className="ed-end" aria-label="Apply">
        <p className="ed-end-title">{title}<span className="ed-pale">at Identity Labs</span></p>
        <Ctas title={title} solid />
      </section>
      <SiteFooter layout="fib" />
      <SiteChrome />
    </div>
  );
}
