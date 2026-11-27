import SiteChrome from './SiteChrome';
import SiteFooter from './flow/SiteFooter';
import './sections.css';
import './flow/flow.css';
import './legal/legal.css';
import './coming-soon.css';
import HtmlMark from './HtmlMark';

/* /manifesto, until it is written: the legal pages' clean hero style (white, the hero's rails and
   markers, the fixed wordmark and nav) with one screen in the middle — the page's name pale over
   "Coming soon." in the hero's headline face, a line in IBM Plex Mono caps, and a way back. The
   Fibonacci footer below, as the live pages. (/careers has its own page since 2026-11-27.) */


export default function ComingSoon({ page }: { page: 'manifesto' }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme='light'" }} />
      {/* page marker: the fixed chrome's light-page styles key off html[data-s2] (HtmlMark) */}
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
      <main className="lg cs">
        <h1 className="lg-title">
          <span className="lg-title-pale">Manifesto</span>
          <span>Coming soon.</span>
        </h1>
        <p className="cs-line">
          We are writing down what we believe about distribution, and why we work the way we do.
        </p>
        <a className="cs-back" href="/"><span aria-hidden="true">←</span> Back to home</a>
      </main>
      <SiteFooter layout="fib" />
      <SiteChrome />
    </>
  );
}
