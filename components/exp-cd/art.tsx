/* /exp/cd — drawn stand-ins for the film's objects. Every product and person here is our own
   simple illustration (no logos, no photographs), so the experiment can run before the real
   cut-outs exist. Line drawings use pathLength={1} so .draw can stroke them on. */

import { useId, type CSSProperties, type ReactNode } from 'react';

type P = { className?: string; style?: CSSProperties };

/* ── 2007-style home-screen icons: rounded tile, gradient, gloss ── */
function Tile({ id: base, from, to, children, ...p }: P & { id: string; from: string; to: string; children: ReactNode }) {
  // ids unique per instance: a gradient defined inside a hidden copy would not resolve for the others
  const id = `${base}${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg viewBox="0 0 64 64" {...p} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={from} /><stop offset="1" stopColor={to} /></linearGradient>
        <clipPath id={`${id}-c`}><rect width="64" height="64" rx="14" /></clipPath>
      </defs>
      <g clipPath={`url(#${id}-c)`}>
        <rect width="64" height="64" fill={`url(#${id}-g)`} />
        {children}
        <ellipse cx="32" cy="6" rx="46" ry="30" fill="#fff" opacity=".28" />
      </g>
    </svg>
  );
}

export const PhoneIcon = (p: P) => (
  <Tile id="ic-ph" from="#7be35a" to="#1c9a12" {...p}>
    <path d="M22 16c2-1 4 0 5 2l2 6c1 2 0 3-1 4l-2 2c2 4 5 7 9 9l2-2c1-1 2-2 4-1l6 2c2 1 3 3 2 5l-2 4c-1 2-3 3-5 3-13-2-23-12-25-25 0-2 1-4 3-5z" fill="#fff" />
  </Tile>
);

export const PodIcon = (p: P) => (
  <Tile id="ic-pod" from="#ffb34a" to="#e66a00" {...p}>
    <rect x="21" y="12" width="22" height="40" rx="4" fill="none" stroke="#fff" strokeWidth="3" />
    <rect x="25" y="16" width="14" height="11" rx="1.5" fill="#fff" />
    <circle cx="32" cy="40" r="6.5" fill="none" stroke="#fff" strokeWidth="3" />
  </Tile>
);

export const WebIcon = (p: P) => (
  <Tile id="ic-web" from="#7fd0ff" to="#0a6fd8" {...p}>
    <circle cx="32" cy="32" r="19" fill="none" stroke="#fff" strokeWidth="2.5" />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1="32" y1="14.5" x2="32" y2="18" stroke="#fff" strokeWidth="1.6" transform={`rotate(${i * 30} 32 32)`} />
    ))}
    <path d="M32 32 44 20 35 35z" fill="#ff3b30" />
    <path d="M32 32 20 44 29 29z" fill="#fff" />
  </Tile>
);

/* ── the first iPhone, front: black glass, aluminium rim, icon grid, home button ── */
const GRID = ['#3cc3ff', '#ffcc00', '#7be35a', '#ff6b5a', '#c6c6c6', '#ff9f0a', '#5ac8fa', '#af52de', '#34c759', '#ff375f', '#8e8e93', '#ffd60a', '#64d2ff', '#30b0c7', '#ff9500', '#a2845e'];
export function IPhone({ bare, ...p }: P & { bare?: boolean }) {
  const u = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <svg viewBox="0 0 120 230" {...p} aria-hidden="true">
      <defs>
        <linearGradient id={`iph-rim${u}`} x1="0" x2="1"><stop offset="0" stopColor="#d9d9d9" /><stop offset=".5" stopColor="#8a8a8a" /><stop offset="1" stopColor="#e6e6e6" /></linearGradient>
        <linearGradient id={`iph-scr${u}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d2b4a" /><stop offset="1" stopColor="#05070c" /></linearGradient>
      </defs>
      <rect x="1" y="1" width="118" height="228" rx="18" fill={`url(#iph-rim${u})`} />
      <rect x="4" y="4" width="112" height="222" rx="16" fill="#0b0b0c" />
      <rect x="10" y="38" width="100" height="150" fill={`url(#iph-scr${u})`} />
      {!bare && GRID.map((c, i) => (
        <rect key={i} x={16 + (i % 4) * 23} y={46 + Math.floor(i / 4) * 27} width="16" height="16" rx="4" fill={c} />
      ))}
      {!bare && <rect x="10" y="164" width="100" height="24" fill="#ffffff22" />}
      {!bare && ['#7be35a', '#3cc3ff', '#0a6fd8', '#ff9f0a'].map((c, i) => <rect key={c} x={16 + i * 23} y="168" width="16" height="16" rx="4" fill={c} />)}
      <rect x="48" y="18" width="24" height="4" rx="2" fill="#2a2a2c" />
      <circle cx="60" cy="207" r="10" fill="none" stroke="#3a3a3c" strokeWidth="2" />
      <rect x="55.5" y="202.5" width="9" height="9" rx="2" fill="none" stroke="#5a5a5c" strokeWidth="1.2" />
      <path d="M10 38h100L10 120z" fill="#fff" opacity=".06" />
    </svg>
  );
}

/* ── the first iPhone, back: brushed aluminium, black band at the foot ── */
export function IPhoneBack(p: P) {
  return (
    <svg viewBox="0 0 120 230" {...p} aria-hidden="true">
      <defs>
        <linearGradient id="iphb" x1="0" x2="1"><stop offset="0" stopColor="#b9b9bb" /><stop offset=".45" stopColor="#ececee" /><stop offset="1" stopColor="#a6a6a8" /></linearGradient>
        <clipPath id="iphb-c"><rect x="1" y="1" width="118" height="228" rx="18" /></clipPath>
      </defs>
      <g clipPath="url(#iphb-c)">
        <rect width="120" height="230" fill="url(#iphb)" />
        <rect y="186" width="120" height="44" fill="#111" />
      </g>
      <circle cx="18" cy="18" r="5" fill="#222" />
      <circle cx="18" cy="18" r="2.4" fill="#4a5568" />
    </svg>
  );
}

/* ── MacBook Air, open ── */
export function MacBookAir(p: P) {
  return (
    <svg viewBox="0 0 300 190" {...p} aria-hidden="true">
      <defs>
        <linearGradient id="mba-scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1b1e5a" /><stop offset=".55" stopColor="#7a3fa0" /><stop offset="1" stopColor="#e07ab8" /></linearGradient>
        <linearGradient id="mba-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0f0f2" /><stop offset="1" stopColor="#a9a9ad" /></linearGradient>
      </defs>
      <rect x="40" y="4" width="220" height="150" rx="9" fill="#d7d7da" />
      <rect x="44" y="8" width="212" height="142" rx="6" fill="#111" />
      <rect x="52" y="16" width="196" height="126" fill="url(#mba-scr)" />
      <path d="M52 110c40-30 90-40 196-20v52H52z" fill="#ffffff" opacity=".12" />
      <rect x="52" y="16" width="196" height="7" fill="#e9e9ee" opacity=".85" />
      <path d="M2 162h296l-14 16H16z" fill="url(#mba-base)" />
      <rect x="2" y="158" width="296" height="5" rx="2" fill="#e4e4e7" />
      <rect x="128" y="158" width="44" height="3" rx="1.5" fill="#bcbcc0" />
    </svg>
  );
}

/* ── MacBook Air, closed and seen edge-on: the wedge ── */
export const Wedge = (p: P) => (
  <svg viewBox="0 0 300 40" {...p} aria-hidden="true">
    <defs><linearGradient id="wdg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2f2f4" /><stop offset="1" stopColor="#9d9da2" /></linearGradient></defs>
    <path d="M6 18 294 8c3 0 4 2 4 4v14c0 2-1 4-4 4H6c-3 0-4-2-4-4v-4c0-2 1-4 4-4z" fill="url(#wdg)" />
  </svg>
);

/* ── iPod classic ── */
export const IPod = (p: P) => (
  <svg viewBox="0 0 100 165" {...p} aria-hidden="true">
    <defs><linearGradient id="ipd" x1="0" x2="1"><stop offset="0" stopColor="#f4f4f6" /><stop offset="1" stopColor="#cfcfd4" /></linearGradient></defs>
    <rect x="2" y="2" width="96" height="161" rx="12" fill="url(#ipd)" stroke="#b5b5ba" />
    <rect x="12" y="12" width="76" height="58" rx="3" fill="#27466e" />
    <rect x="16" y="17" width="44" height="5" fill="#fff" opacity=".7" />
    <rect x="16" y="27" width="56" height="4" fill="#fff" opacity=".35" />
    <rect x="16" y="35" width="50" height="4" fill="#fff" opacity=".35" />
    <rect x="16" y="43" width="58" height="4" fill="#fff" opacity=".35" />
    <circle cx="50" cy="115" r="31" fill="#fff" stroke="#c8c8cd" />
    <circle cx="50" cy="115" r="11" fill="#e9e9ed" stroke="#c8c8cd" />
  </svg>
);

/* ── the inter-office envelope: manila, string-and-button closure, routing grid ── */
export function Envelope({ open = false, ...p }: P & { open?: boolean }) {
  return (
    <svg viewBox="0 0 260 340" {...p} aria-hidden="true">
      <rect x="2" y="30" width="256" height="308" rx="3" fill="#d8b778" />
      <rect x="2" y="30" width="256" height="308" rx="3" fill="url(#env-tex)" opacity=".5" />
      <defs>
        <pattern id="env-tex" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#8a6a2e" /></pattern>
      </defs>
      {!open && <path d="M2 30h256l-20 52H22z" fill="#cfa962" />}
      {open && <path d="M2 30h256l-20-26H22z" fill="#cfa962" />}
      <g stroke="#7a5a22" strokeWidth="1" opacity=".55">
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1="28" x2="232" y1={128 + i * 22} y2={128 + i * 22} />)}
        <line x1="130" x2="130" y1="128" y2="304" />
      </g>
      <text x="130" y="116" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="11" fill="#6a4c1a" letterSpacing="2">INTER-OFFICE</text>
      <circle cx="130" cy="72" r="9" fill="#b8924c" stroke="#7a5a22" />
      <path d="M130 72c-20 10-26 26-6 34" fill="none" stroke="#6a4c1a" strokeWidth="1.4" />
    </svg>
  );
}

/* ── line-drawn people ── */
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

// the presenter: round glasses, turtleneck — a drawing, not a likeness
export const Presenter = (p: P) => (
  <svg viewBox="0 0 220 300" {...p} aria-hidden="true">
    <g {...stroke}>
      <path pathLength={1} className="ln" d="M70 96c0-44 22-70 40-70s40 26 40 70c0 30-16 58-40 58S70 126 70 96z" />
      <path pathLength={1} className="ln" d="M76 76c10-20 24-26 34-26s26 6 34 26" />
      <circle pathLength={1} className="ln" cx="94" cy="100" r="11" />
      <circle pathLength={1} className="ln" cx="126" cy="100" r="11" />
      <path pathLength={1} className="ln" d="M105 100h10M83 98l-12-3M137 98l12-3" />
      <path pathLength={1} className="ln" d="M110 108v16l-6 4M100 138c6 4 14 4 20 0" />
      <path pathLength={1} className="ln" d="M84 128c6 20 16 28 26 28s20-8 26-28" />
      <path pathLength={1} className="ln" d="M92 150v18c0 6 8 10 18 10s18-4 18-10v-18" />
      <path pathLength={1} className="ln" d="M92 166c-40 6-70 26-78 60l-6 74M128 166c40 6 70 26 78 60l6 74" />
      <path pathLength={1} className="ln" d="M60 230l2 70M160 230l-2 70" />
    </g>
    <path d="M92 166c-40 6-70 26-78 60l-6 74h204l-6-74c-8-34-38-54-78-60 0 8-8 14-18 14s-18-6-18-14z" fill="#141414" className="fill-in" />
  </svg>
);

// one audience head-and-shoulders, varied by seed
export function Head({ v = 0, cheer = false, ...p }: P & { v?: number; cheer?: boolean }) {
  const r = 15 + (v % 3) * 2;
  const hair = ['M', 'M', 'L', 'B'][v % 4];
  return (
    <svg viewBox="0 0 100 110" {...p} aria-hidden="true">
      <g {...stroke}>
        <circle pathLength={1} className="ln" cx="50" cy={40} r={r} />
        {hair === 'L' && <path pathLength={1} className="ln" d={`M${50 - r} 44c-2-22 8-${r + 6} 16-${r + 6}s18 ${r - 4} 18 ${r + 2}`} />}
        {hair === 'B' && <path pathLength={1} className="ln" d={`M${50 - r - 2} 46c0 14 4 22 8 26M${50 + r + 2} 46c0 14-4 22-8 26`} />}
        <path pathLength={1} className="ln" d={`M14 110c2-26 16-${40 - r} 36-${40 - r}s34 ${14 - r} 36 ${40 - r + 26}`} />
        {cheer && <path pathLength={1} className="ln" d="M18 92 6 30M82 92l12-62M2 28l4-10M8 30l6-8M98 28l-4-10M92 30l-6-8" />}
      </g>
    </svg>
  );
}

// a person standing at the table: head, shoulders, an arm holding a page
export function Member({ v = 0, ...p }: P & { v?: number }) {
  return (
    <svg viewBox="0 0 120 200" {...p} aria-hidden="true">
      <g {...stroke}>
        <circle pathLength={1} className="ln" cx="60" cy="34" r={18 + (v % 2) * 2} />
        {v % 3 === 1 && <path pathLength={1} className="ln" d="M42 30c4-20 30-22 36 0" />}
        {v % 3 === 2 && <><circle pathLength={1} className="ln" cx="53" cy="34" r="5" /><circle pathLength={1} className="ln" cx="68" cy="34" r="5" /></>}
        <path pathLength={1} className="ln" d="M22 200c0-80 12-136 38-136s38 56 38 136" />
        <path pathLength={1} className="ln" d={v % 2 ? 'M30 110c14 10 30 14 46 6' : 'M90 108c-14 12-30 16-48 8'} />
      </g>
      <rect x={v % 2 ? 66 : 20} y={96} width="30" height="38" rx="2" fill="#fbfaf6" stroke="currentColor" strokeWidth="1.6" transform={`rotate(${v % 2 ? -10 : 12} 60 110)`} />
      <g stroke="currentColor" strokeWidth="1" opacity=".55" transform={`rotate(${v % 2 ? -10 : 12} 60 110)`}>
        {[104, 110, 116, 122].map((y) => <line key={y} x1={(v % 2 ? 66 : 20) + 5} x2={(v % 2 ? 66 : 20) + 24} y1={y} y2={y} />)}
      </g>
    </svg>
  );
}

// a burst of hand-drawn marks: cheers, applause
export const Burst = (p: P) => (
  <svg viewBox="0 0 120 120" {...p} aria-hidden="true">
    <g {...stroke} strokeWidth="2.4">
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        const x1 = 60 + Math.cos(a) * 26, y1 = 60 + Math.sin(a) * 26, x2 = 60 + Math.cos(a) * (46 + (i % 2) * 10), y2 = 60 + Math.sin(a) * (46 + (i % 2) * 10);
        return <path key={i} pathLength={1} className="ln" d={`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`} />;
      })}
    </g>
  </svg>
);

// a marker circle scrawled around something
export const Scrawl = (p: P) => (
  <svg viewBox="0 0 400 300" preserveAspectRatio="none" {...p} aria-hidden="true">
    <path pathLength={1} className="ln" d="M210 18C110 10 20 60 18 146s92 140 196 136 176-60 168-140S300 14 180 26 60 70 70 90" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

// a hand-drawn underline
export const Underline = (p: P) => (
  <svg viewBox="0 0 300 30" preserveAspectRatio="none" {...p} aria-hidden="true">
    <path pathLength={1} className="ln" d="M4 20C70 8 160 6 296 14M30 26c80-6 160-8 230-4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

/* ── research scraps for the tunnel ── */
export const Bars = (p: P) => (
  <svg viewBox="0 0 120 80" {...p} aria-hidden="true">
    <path d="M10 70h104M10 70V8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    {[18, 34, 26, 50, 42, 60].map((h, i) => <rect key={i} x={18 + i * 16} y={70 - h} width="10" height={h} fill={i === 5 ? 'var(--cd-hot)' : 'currentColor'} opacity={i === 5 ? 1 : 0.75} />)}
  </svg>
);
export const Curve = (p: P) => (
  <svg viewBox="0 0 120 80" {...p} aria-hidden="true">
    <path d="M10 70h104M10 70V8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M12 64C34 60 46 52 60 40s30-28 52-30" stroke="var(--cd-hot)" strokeWidth="2.5" fill="none" />
    {[20, 40, 60, 80, 100].map((x) => <circle key={x} cx={x} cy={70 - x * 0.5} r="2.5" fill="currentColor" />)}
  </svg>
);
