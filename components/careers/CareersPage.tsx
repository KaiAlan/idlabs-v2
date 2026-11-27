import type { ReactNode } from 'react';
import SiteChrome from '../SiteChrome';
import SiteFooter from '../flow/SiteFooter';
import HtmlMark from '../HtmlMark';
import { MARKS, PITCH } from './content';
import RoleCards from './RoleCards';
import '../sections.css';
import '../flow/flow.css';
import '../legal/legal.css';
import './careers.css';

/* The /careers page's body, shared by /careers (the cards small, within the 512px column: clip, name, View role)
   and /exp/careers (the cards large, 1000px wide, with a line each). */

// the pitch's figures in ink within its grey
function mark(text: string): ReactNode[] {
  const re = new RegExp(`(${MARKS.map((m) => m.replace(/[$.]/g, '\\$&')).join('|')})`);
  return text.split(re).map((part, i) => (MARKS.includes(part) ? <b key={i}>{part}</b> : part));
}

export default function CareersPage({ cards = 'large' }: { cards?: 'large' | 'small' }) {
  return (
    <>
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
      <main className="lg cr">
        <header className="lg-head cr-head">
          <h1 className="lg-title">
            <span>Careers</span>
            <span className="lg-title-pale">at Identity Labs</span>
          </h1>
        </header>

        <section className="cr-pitch" aria-label="Why we are hiring">
          {PITCH.map((p, i) => <p key={i}>{mark(p)}</p>)}
        </section>

        <section className={`cr-open cr-open--${cards}`} aria-label="Open roles">
          <RoleCards size={cards} />
        </section>
      </main>
      <SiteFooter layout="fib" />
      <SiteChrome />
    </>
  );
}
