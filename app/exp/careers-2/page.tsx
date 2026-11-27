import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import SiteChrome from '../../../components/SiteChrome';
import SiteFooter from '../../../components/flow/SiteFooter';
import HtmlMark from '../../../components/HtmlMark';
import { NOINDEX } from '../../../components/seo';
import { HIRING, ROLES } from '../../../components/careers/content';
import CareersStage from './CareersStage';
import '../../../components/sections.css';
import '../../../components/flow/flow.css';
import '../../../components/legal/legal.css';
import './careers2.css';

/* /exp/careers-2 (2026-11-27), variant C of /careers: the pitch told by the scroll. A pinned screen on
   which the pitch's sentences take turns, one idea each, the figures very large in Season Mix
   (CareersStage); then who we hire, the three open roles, and "Join us." The pitch word for word, its
   sentences split across the scenes. The white page, chrome and footer as /careers. */

export const metadata: Metadata = { title: 'Careers, scroll — Identity Labs', robots: NOINDEX };

type Scene = { kicker?: string; big: string; sub?: string; figure?: boolean };

const SCENES: Scene[] = [
  { kicker: 'In the last 2 years,', big: '$1T', sub: 'was spent on paid marketing on Meta and Google.', figure: true },
  { big: 'Paid reach is getting more expensive', sub: 'with diminishing returns.' },
  { big: 'Companies now need organic distribution', sub: 'faster than we can hire and build systems to provide it.' },
  { kicker: 'Identity Labs has grown', big: '7x', sub: 'in revenue to $20M ARR because of this demand.', figure: true },
  { kicker: 'We will soon get to', big: '$100M', sub: 'revenue with 30 people,', figure: true },
  { big: '12', sub: 'spots left:', figure: true },
];

// a line as words, each its own piece for the stage's wave
const Words = ({ text }: { text: string }) =>
  text.split(' ').map((w, i) => (
    <span key={i} className="c2-w">{w}{' '}</span>
  ));

export default function CareersScroll() {
  const pad = (k: number) => String(k).padStart(2, '0');
  return (
    <>
      {/* before paint: the light page, and (unless reduced motion) only the first scene showing */}
      <script dangerouslySetInnerHTML={{ __html: "var d=document.documentElement;d.dataset.theme='light';if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('c2-js')" }} />
      <span className="s2-flow" hidden />
      <HtmlMark name="s2" />
      <CareersStage />
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-dark"><div className="texture" /></div>
        <div className="backdrop-light" />
      </div>
      <div className="frame rails" aria-hidden="true"><span className="rails-light" /></div>
      <div className="frame lg-ticks" aria-hidden="true">
        <div className="site-header"><span className="tick tick-l" /><span className="tick tick-r" /></div>
      </div>
      <div className="frame lg-veil" aria-hidden="true" />

      <main className="c2">
        <h1 className="c2-sr">Careers at Identity Labs</h1>
        <section className="c2-stage" style={{ '--n': SCENES.length } as CSSProperties}>
          <div className="c2-pin">
            {SCENES.map((s, k) => (
              <div key={k} className={`c2-scene${s.figure ? ' c2-scene-fig' : ''}`}>
                <div className="c2-col">
                  {s.kicker && <p className="c2-kick"><Words text={s.kicker} /></p>}
                  <p className="c2-big">{s.figure ? <span className="c2-w">{s.big}</span> : <Words text={s.big} />}</p>
                  {s.sub && <p className="c2-sub"><Words text={s.sub} /></p>}
                </div>
              </div>
            ))}
            <div className="c2-hud" aria-hidden="true">
              <span className="c2-count"><b>01</b> / {pad(SCENES.length)}</span>
              <span className="c2-bar"><i /></span>
              <span>Careers</span>
            </div>
          </div>
        </section>

        <section className="c2-hiring" aria-labelledby="c2-hiring-h">
          <p id="c2-hiring-h" className="c2-label" data-rise="">We’re hiring</p>
          <ul className="c2-list">
            {HIRING.map((h, i) => (
              <li key={h} data-rise="" style={{ '--d': `${i * 60}ms` } as CSSProperties}>
                {h}{i === HIRING.length - 2 ? ', and' : i < HIRING.length - 1 ? ',' : ''}
              </li>
            ))}
          </ul>
          <p className="c2-sub c2-tail" data-rise="">to work on hands-on with our clients.</p>
        </section>

        <section className="c2-open" aria-labelledby="c2-open-h">
          <h2 id="c2-open-h" className="c2-label c2-label-rule" data-rise=""><span>Open roles</span><span>{pad(ROLES.length)}</span></h2>
          <ul className="c2-roles">
            {ROLES.map((r, i) => (
              <li key={r.n} data-rise="" style={{ '--d': `${i * 90}ms` } as CSSProperties}>
                <a href={r.href} target="_blank" rel="noopener noreferrer">
                  <span className="c2-n">{r.n}</span>
                  <span className="c2-role">{r.title}</span>
                  <span className="c2-go" aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="c2-join" data-rise="">Join us.</p>
      </main>
      <SiteFooter layout="fib" />
      <SiteChrome />
    </>
  );
}
