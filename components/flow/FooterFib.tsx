import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { TOOLS } from './ToolsCollage';
import { PAPERS } from '../SectionThree';
import FooterFibFull from './FooterFibFull';
import './footer-fib.css';

/* Footer "Fibonacci" (Figma Zoomcast 200:4, /home-4): the dark footer with the golden-ratio
   construction faint behind it — golden squares with their inscribed circles and the section
   lines (Figma 200:22, at 12%) — then the links in four columns in a ruled box with corner
   squares, and the closing bar. Rendered inside SiteFooter's section (its ground, grain and
   chrome hooks). Design units are Figma px of a 1280 page, scaled with the frame (var(--px));
   the construction is placed from the page's left (the frame starts at 112). */

type Link = { label: string; href?: string };
// the footer's contact addresses (Contact us column), to come from the client
const CONTACT: string[] = [];
/* Analytical tools: the four tools of the tools section (ToolsCollage.tsx), linked to each; research
   papers: the two PDFs (SectionThree.tsx); Join us: the open roles on Notion; Socials: X and LinkedIn. */
const COLUMNS: { title: string; links: Link[] }[] = [
  { title: 'Analytical tools', links: TOOLS.map((t) => ({ label: t.name, href: t.href })) },
  { title: 'Research Papers', links: [{ label: 'X Algorithm', href: PAPERS[0]?.href }, { label: 'LinkedIn Algorithm', href: PAPERS[1]?.href }] },
  {
    title: 'Join us', links: [
      { label: 'About', href: '/about' }, // the firm and its co-founders (2026-11-17)
      { label: 'Creative director', href: '/careers/creative-director' },
      { label: 'Head of growth', href: '/careers/head-of-growth' },
      { label: 'Thinker-writer', href: '/careers/thinker-writer' },
    ],
  },
  // Instagram and Substack hidden for now
  { title: 'Socials', links: [{ label: 'X / Twitter', href: 'https://x.com/IdentityLabsInc' }, { label: 'LinkedIn', href: 'https://www.linkedin.com/company/theidentitylabs' }] },
  // Contact us: the two addresses, each a mail link (the column shows once it has them)
  ...(CONTACT.length ? [{ title: 'Contact us', links: CONTACT.map((m) => ({ label: m, href: `mailto:${m}` })) }] : []),
];
const OFFICES = ['San Francisco', 'London', 'Bangalore'];
const ADDRESS = '50 California Street, San Francisco, 94111';
const LEGAL = [{ label: 'Terms & Conditions', href: '/terms' }, { label: 'Privacy Policy', href: '/privacy' }];

const A = '/assets/footer-fib/';
// a box in the construction's Figma px (origin: its own top left)
const box = (x: number, y: number, w: number, h: number): CSSProperties =>
  ({ '--x': x, '--y': y, '--w': w, '--h': h } as CSSProperties);

/* Figma 200:22, edge to edge of the screen (footer-fib.css) */
/* It draws itself in when it comes on screen (data-drawn, footer-fib.css): the squares open from their
   corner, the circles from their centre, the section lines sweep across, the diagonals run along —
   one after another. Once per page view; the finished drawing for reduced motion. */
function Construction() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { el.setAttribute('data-drawn', ''); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.setAttribute('data-drawn', ''); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="ftf-gold" ref={ref} aria-hidden="true">
      {/* the big golden square with its circle (Frame 56) */}
      <span className="ftf-g" style={box(0, 0, 787.692, 787.692)}><img src={`${A}frame56.svg`} alt="" /></span>
      {/* the column to its right: 492 square, then 98 · 98 / 197 beside 295 */}
      <span className="ftf-g ftf-sq" style={box(787.69, 0, 492.308, 492.308)}><span className="ftf-g" style={box(0.03, -0.27, 492, 492)}><img src={`${A}ellipse13.svg`} alt="" /></span></span>
      <span className="ftf-g ftf-sq" style={box(787.69, 492.308, 98.462, 98.462)}><span className="ftf-g" style={box(-0.97, -0.58, 99, 99)}><img src={`${A}ellipse15.svg`} alt="" /></span></span>
      <span className="ftf-g ftf-sq" style={box(886.152, 492.308, 98.462, 98.462)}><span className="ftf-g" style={box(-0.43, -0.58, 99, 99)}><img src={`${A}ellipse15.svg`} alt="" /></span></span>
      <span className="ftf-g ftf-sq" style={box(787.69, 590.77, 196.923, 196.923)}><span className="ftf-g" style={box(0.03, -0.04, 197, 197)}><img src={`${A}ellipse16.svg`} alt="" /></span></span>
      <span className="ftf-g ftf-sq" style={box(984.613, 492.308, 295.385, 295.385)}><span className="ftf-g" style={box(0.11, -0.58, 295, 295)}><img src={`${A}ellipse17.svg`} alt="" /></span></span>
      {/* the section lines: three upright bands, three across (200:39, 200:43) */}
      <span className="ftf-g ftf-band" style={box(0, 0, 322.394, 788)} />
      <span className="ftf-g ftf-band" style={box(957.61, 0, 322.394, 788)} />
      <span className="ftf-g ftf-band" style={box(322, 0, 636, 788)} />
      <span className="ftf-g ftf-band" style={box(0, 0, 1280, 198.222)} />
      <span className="ftf-g ftf-band" style={box(0, 588.78, 1280, 198.222)} />
      <span className="ftf-g ftf-band" style={box(0, 197.98, 1280, 391.041)} />
      {/* 200:47: one upright line */}
      <span className="ftf-g ftf-vline" style={box(520.71, -1.06, 842.291, 839.097)} />
      {/* the diagonals (200:48–50), each a line turned about the centre of its box */}
      <span className="ftf-g ftf-diag" style={{ ...box(0, -1.06, 1400.34, 861.495), '--len': 1644.119, '--r': '31.6deg' } as CSSProperties}><img src={`${A}line97.svg`} alt="" /></span>
      <span className="ftf-g ftf-diag" style={{ ...box(-177.17, -270.47, 858.705, 1395.805), '--len': 1638.795, '--r': '121.6deg' } as CSSProperties}><img src={`${A}line98.svg`} alt="" /></span>
      <span className="ftf-g ftf-diag" style={{ ...box(669.78, -270.47, 858.705, 1395.805), '--len': 1638.795, '--r': '121.6deg' } as CSSProperties}><img src={`${A}line98.svg`} alt="" /></span>
    </div>
  );
}

/* `top`: something in place of the empty band at the top (/footer's "Fibonacci + Focus": FooterGolden's
   Focus) — then no construction behind (tried behind the whole, and behind the links only: neither
   looked right), the links box under it */
/* `full` (/footer's "Fibonacci · full", FooterFibFull.tsx): the construction whole inside the frame, the
   statement and this links box over it, the box's bottom on the drawing's */
/* `full` 'low' (/footer's "Fibonacci · low"): the same without the statement, the drawing down to the footer's
   very bottom (behind the closing bar), the footer only as tall as it */
/* `behind` (with `top`, /footer's "Moneyball"): the construction kept behind the top band */
/* `fullTop` (with `full`, /footer's "Moneyball"): Fibonacci · full's drawing, quiet, with this in its open part */
export default function FooterFib({ top, full = false, behind = false, fullTop }: { top?: ReactNode; full?: boolean | 'low'; behind?: boolean; fullTop?: ReactNode } = {}) {
  const nav = (
        <nav className="ftf-box" aria-label="Site">
          {COLUMNS.map((c) => (
            <div className="ftf-col" key={c.title}>
              <h3 className="ftf-h">{c.title}</h3>
              <ul>{c.links.map((l) => (
                <li key={l.label}>
                  {l.href
                    ? <a href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{l.label}</a>
                    : <a href="#">{l.label}</a>}
                </li>
              ))}</ul>
            </div>
          ))}
          <span className="ftf-sqs ftf-sqs-t" aria-hidden="true"><i /><i /></span>
          <span className="ftf-sqs ftf-sqs-b" aria-hidden="true"><i /><i /></span>
        </nav>
  );
  const bar = (
        <div className="ftf-bar">
          <span className="ftf-status">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${A}ellipse71.svg`} alt="" width={6} height={6} />
            All systems operational
          </span>
          <span className="ftf-where">
            <span className="ftf-offices">{OFFICES.map((o) => <span key={o}>{o}</span>)}</span>
            {/* the San Francisco office (2026-11-17) */}
            <address className="ftf-address">{ADDRESS}</address>
          </span>
          <span className="ftf-legal">{LEGAL.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}</span>
        </div>
  );
  return (
    <>
      {top ? <>{behind && <Construction />}<div className="ftf-top">{top}</div></> : full ? null : <Construction />}
      <div className={top ? 'ftf ftf-after-top' : full ? `ftf ftf-full${full === 'low' ? ' ftf-low' : ''}` : 'ftf'}>
        {full === 'low' ? <FooterFibFull say={false}>{nav}{bar}</FooterFibFull> : <>
        {full ? <FooterFibFull top={fullTop}>{nav}</FooterFibFull> : nav}
        {bar}
        </>}
      </div>
      {/* the frame's squares at the top (Figma 200:19, y 59) */}
      <span className="ftf-sqs ftf-sqs-frame" aria-hidden="true"><i /><i /></span>
    </>
  );
}
