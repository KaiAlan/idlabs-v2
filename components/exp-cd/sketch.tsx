/* /exp/cd — variant 5's ink drawings (timeline5.tsx): everything is a line drawing in one pen,
   on cream paper, stroked on as it appears (.cd-draw strokes every .ln path; see cd.css).
   Our own drawings — no logos, no likenesses beyond round glasses and a turtleneck. */

import { useId, type CSSProperties } from 'react';

type P = { className?: string; style?: CSSProperties };
const pen = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const uid = () => useId().replace(/[^a-zA-Z0-9_-]/g, '');

// dots for shading, like the reference's stipple
function Stipple({ id, gap = 3 }: { id: string; gap?: number }) {
  return <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse"><circle cx={gap / 2} cy={gap / 2} r={0.55} fill="currentColor" /></pattern>;
}

export function InkIcon({ kind, ...p }: P & { kind: 'pod' | 'phone' | 'web' }) {
  return (
    <svg viewBox="0 0 40 40" {...p} aria-hidden="true">
      <g {...pen}>
        <rect pathLength={1} className="ln" x="3" y="3" width="34" height="34" rx="8" />
        {kind === 'pod' && <><rect pathLength={1} className="ln" x="13" y="9" width="14" height="22" rx="2.5" /><rect pathLength={1} className="ln" x="16" y="12" width="8" height="6" /><circle pathLength={1} className="ln" cx="20" cy="25" r="3.6" /></>}
        {kind === 'phone' && <path pathLength={1} className="ln" d="M13 10c1.6-.8 3 0 3.6 1.4l1.2 3.4c.5 1.2 0 2-.8 2.6l-1.2 1c1.4 2.8 3.4 4.8 6.2 6.2l1-1.2c.6-.8 1.4-1.3 2.6-.8l3.4 1.2c1.4.6 2.2 2 1.4 3.6l-1 2c-.6 1.2-2 1.8-3.2 1.6C18.6 29 11 21.4 9.6 13.6c-.2-1.2.4-2.6 1.6-3.2z" />}
        {kind === 'web' && <><circle pathLength={1} className="ln" cx="20" cy="20" r="11" /><path pathLength={1} className="ln" d="M20 20l6-6-3 8zM20 20l-6 6 3-8z" /><path pathLength={1} className="ln" d="M20 9v2.5M20 28.5V31M9 20h2.5M28.5 20H31" /></>}
      </g>
    </svg>
  );
}

// the presenter: round glasses, a stippled turtleneck
export function InkPresenter(p: P) {
  const id = `stp${uid()}`;
  return (
    <svg viewBox="0 0 160 220" {...p} aria-hidden="true">
      <defs><Stipple id={id} gap={2.6} /></defs>
      <path d="M44 128c-22 8-34 30-38 60l-3 32h154l-3-32c-4-30-16-52-38-60-6 8-16 12-36 12s-30-4-36-12z" fill={`url(#${id})`} />
      <g {...pen}>
        <path pathLength={1} className="ln" d="M52 60c0-30 14-48 28-48s28 18 28 48c0 22-12 42-28 42S52 82 52 60z" />
        <path pathLength={1} className="ln" d="M56 44c6-14 16-20 24-20s18 6 24 20" />
        <circle pathLength={1} className="ln" cx="68" cy="62" r="8" />
        <circle pathLength={1} className="ln" cx="92" cy="62" r="8" />
        <path pathLength={1} className="ln" d="M76 62h8M60 60l-8-2M100 60l8-2M80 70v8l-4 2M73 88c4 2 10 2 14 0" />
        <path pathLength={1} className="ln" d="M62 98v20c0 6 8 10 18 10s18-4 18-10v-20M62 106c10 4 26 4 36 0M62 113c10 4 26 4 36 0M62 120c10 4 26 4 36 0" />
        <path pathLength={1} className="ln" d="M44 128c-22 8-34 30-38 60l-3 32M116 128c22 8 34 30 38 60l3 32M40 170l2 50M120 170l-2 50" />
      </g>
    </svg>
  );
}

export function InkPhone({ screen = true, ...p }: P & { screen?: boolean }) {
  return (
    <svg viewBox="0 0 60 112" {...p} aria-hidden="true">
      <g {...pen}>
        <rect pathLength={1} className="ln" x="2" y="2" width="56" height="108" rx="9" />
        <rect pathLength={1} className="ln" x="6" y="16" width="48" height="76" rx="1" />
        <circle pathLength={1} className="ln" cx="30" cy="101" r="5" />
        <path pathLength={1} className="ln" d="M24 9h12" />
        {screen && <><rect pathLength={1} className="ln" x="13" y="52" width="9" height="9" rx="2" /><rect pathLength={1} className="ln" x="25.5" y="52" width="9" height="9" rx="2" /><rect pathLength={1} className="ln" x="38" y="52" width="9" height="9" rx="2" /></>}
      </g>
      {screen && <text x="30" y="40" textAnchor="middle" fontFamily="var(--serif)" fontSize="13" fill="currentColor">9:42</text>}
    </svg>
  );
}

// the laptop on the desk: a bezel with an open screen (the first scene plays inside it) and a base
export function InkLaptop(p: P) {
  return (
    <svg viewBox="0 0 200 140" preserveAspectRatio="none" {...p} aria-hidden="true">
      <g {...pen} strokeWidth={1.2} vectorEffect="non-scaling-stroke">
        <rect pathLength={1} className="ln" x="6" y="2" width="188" height="122" rx="5" vectorEffect="non-scaling-stroke" />
        <rect pathLength={1} className="ln" x="15" y="9" width="170" height="106" rx="1" vectorEffect="non-scaling-stroke" />
        <path pathLength={1} className="ln" d="M1 128h198l-8 9H9z" vectorEffect="non-scaling-stroke" />
        <path pathLength={1} className="ln" d="M85 128v3h30v-3" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

export function InkEnvelope(p: P) {
  return (
    <svg viewBox="0 0 120 160" {...p} aria-hidden="true">
      <g {...pen}>
        <rect x="3" y="10" width="114" height="146" rx="2" fill="var(--v5-paper, #f5f0e6)" stroke="none" />
        <rect pathLength={1} className="ln" x="3" y="10" width="114" height="146" rx="2" />
        <path pathLength={1} className="ln" d="M3 10l57 34 57-34" />
        <circle pathLength={1} className="ln" cx="60" cy="44" r="5" />
        <path pathLength={1} className="ln" d="M60 49c-14 8-16 20-2 26" />
        <path pathLength={1} className="ln" d="M16 88h88M16 100h88M16 112h88M16 124h88M16 136h88M60 88v52" strokeWidth={0.9} />
      </g>
    </svg>
  );
}

// a closed thin laptop, slightly in perspective
export function InkAir(p: P) {
  return (
    <svg viewBox="0 0 140 90" {...p} aria-hidden="true">
      <g {...pen}>
        <path pathLength={1} className="ln" d="M8 70L30 6h102l-22 64z" />
        <path pathLength={1} className="ln" d="M8 70v4h102l22-64v-4" />
        <path pathLength={1} className="ln" d="M64 34c2-4 8-4 8 0s-6 6-8 4" strokeWidth={1} />
      </g>
    </svg>
  );
}

// a row of the audience: heads and shoulders, some with dark hair
export function InkCrowd({ n = 14, seed = 1, cheer = false, ...p }: P & { n?: number; seed?: number; cheer?: boolean }) {
  let a = seed * 9301 + 49297;
  const r = () => { a = (a * 16807) % 2147483647; return (a % 1000) / 1000; };
  const w = 300 / n;
  return (
    <svg viewBox="0 0 300 46" preserveAspectRatio="none" {...p} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const x = +(w * (i + 0.5) + (r() - 0.5) * 4).toFixed(2), hr = +(7 + r() * 2.5).toFixed(2), dark = r() < 0.45, up = cheer && r() < 0.5;
        return (
          <g key={i} {...pen} strokeWidth={1.3}>
            {dark && <path d={`M${x - hr} ${18}a${hr} ${hr} 0 0 1 ${hr * 2} 0c0-2-2-5-${hr} -5s-${hr} 3-${hr} 5z`} fill="currentColor" />}
            <circle pathLength={1} className="ln" cx={x} cy={18} r={hr} style={{ animationDelay: `${(i * 0.03).toFixed(2)}s` }} />
            <path pathLength={1} className="ln" d={`M${x - w * 0.52} 46c0-12 ${w * 0.2}-${18 - hr} ${w * 0.52}-${18 - hr}s${w * 0.52} ${6} ${w * 0.52} ${18 - hr + 12}`} style={{ animationDelay: `${(i * 0.03).toFixed(2)}s` }} />
            {up && <path pathLength={1} className="ln" d={`M${x - hr - 2} 30l-4-24M${x + hr + 2} 30l4-24`} />}
          </g>
        );
      })}
    </svg>
  );
}

// a small polaroid doodle
export function InkSnap({ kind, ...p }: P & { kind: 'stage' | 'phone' | 'envelope' | 'crowd' | 'laptop' }) {
  return (
    <svg viewBox="0 0 60 70" {...p} aria-hidden="true">
      <rect x="1" y="1" width="58" height="68" fill="#fbf8f1" />
      <g {...pen} strokeWidth={1.2}>
        <rect pathLength={1} className="ln" x="1" y="1" width="58" height="68" />
        <rect pathLength={1} className="ln" x="6" y="6" width="48" height="44" />
        {kind === 'stage' && <><circle pathLength={1} className="ln" cx="30" cy="22" r="5" /><path pathLength={1} className="ln" d="M22 50c0-12 4-18 8-18s8 6 8 18M10 14h40" /></>}
        {kind === 'phone' && <><rect pathLength={1} className="ln" x="22" y="12" width="16" height="32" rx="3" /><circle pathLength={1} className="ln" cx="30" cy="40" r="1.6" /></>}
        {kind === 'envelope' && <><rect pathLength={1} className="ln" x="16" y="14" width="28" height="32" /><path pathLength={1} className="ln" d="M16 14l14 9 14-9" /></>}
        {kind === 'crowd' && <path pathLength={1} className="ln" d="M10 50c0-6 3-9 6-9s6 3 6 9M22 50c0-6 3-9 6-9s6 3 6 9M34 50c0-6 3-9 6-9s6 3 6 9M16 41a3 3 0 1 1 0-6a3 3 0 1 1 0 6M28 41a3 3 0 1 1 0-6a3 3 0 1 1 0 6M40 41a3 3 0 1 1 0-6a3 3 0 1 1 0 6" />}
        {kind === 'laptop' && <path pathLength={1} className="ln" d="M14 40l6-22h26l-6 22zM14 40v2h26l6-22" />}
      </g>
    </svg>
  );
}

export function InkTeam(p: P) {
  const xs = [30, 70, 110, 150, 190];
  return (
    <svg viewBox="0 0 220 120" {...p} aria-hidden="true">
      <g {...pen}>
        {xs.map((x, i) => (
          <g key={x}>
            <circle pathLength={1} className="ln" cx={x} cy={22 + (i % 2) * 4} r={9} />
            {i % 3 === 1 && <><circle pathLength={1} className="ln" cx={x - 3.5} cy={22 + (i % 2) * 4} r={2.6} /><circle pathLength={1} className="ln" cx={x + 3.5} cy={22 + (i % 2) * 4} r={2.6} /></>}
            <path pathLength={1} className="ln" d={`M${x - 15} 84c0-30 6-48 15-48s15 18 15 48`} />
            <path pathLength={1} className="ln" d={i % 2 ? `M${x - 6} 52l-10 14 12 4` : `M${x + 6} 52l10 14-12 4`} />
            <rect pathLength={1} className="ln" x={i % 2 ? x - 22 : x + 8} y={60} width="12" height="15" />
          </g>
        ))}
        <ellipse pathLength={1} className="ln" cx="110" cy="92" rx="104" ry="20" />
        <rect pathLength={1} className="ln" x="70" y="84" width="22" height="12" rx="1" />
        <path pathLength={1} className="ln" d="M66 96h30" />
        <rect pathLength={1} className="ln" x="126" y="86" width="7" height="13" rx="1.5" />
      </g>
    </svg>
  );
}

export function InkFunnel(p: P) {
  return (
    <svg viewBox="0 0 120 100" {...p} aria-hidden="true">
      <g {...pen}>
        <path pathLength={1} className="ln" d="M4 6h112L70 56v38H50V56z" />
        <path pathLength={1} className="ln" d="M14 14h92" strokeWidth={0.9} />
      </g>
    </svg>
  );
}

export function InkArrow({ flip, ...p }: P & { flip?: boolean }) {
  return (
    <svg viewBox="0 0 100 40" {...p} style={{ overflow: 'visible', ...(p.style ?? {}), transform: flip ? 'scaleX(-1)' : undefined }} aria-hidden="true">
      <g {...pen} strokeWidth={2}>
        <path pathLength={1} className="ln" d="M4 28C30 8 64 6 92 18" />
        <path pathLength={1} className="ln" d="M80 8l13 10-14 8" />
      </g>
    </svg>
  );
}

export function InkCircle(p: P) {
  return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" {...p} aria-hidden="true">
      <path pathLength={1} className="ln" d="M104 8C50 4 8 30 8 62s44 54 98 52 88-28 86-56S150 6 90 12 30 34 38 46" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function InkUnderline(p: P) {
  return (
    <svg viewBox="0 0 200 20" preserveAspectRatio="none" {...p} aria-hidden="true">
      <path pathLength={1} className="ln" d="M4 12C60 6 130 5 196 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function InkBurst(p: P) {
  return (
    <svg viewBox="0 0 100 100" {...p} aria-hidden="true">
      <g {...pen} strokeWidth={1.8}>
        {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; const f = (v: number) => v.toFixed(2); return <path key={i} pathLength={1} className="ln" d={`M${f(50 + Math.cos(a) * 30)} ${f(50 + Math.sin(a) * 30)}L${f(50 + Math.cos(a) * (42 + (i % 2) * 6))} ${f(50 + Math.sin(a) * (42 + (i % 2) * 6))}`} />; })}
      </g>
    </svg>
  );
}

export function InkPencil(p: P) {
  return (
    <svg viewBox="0 0 160 20" {...p} aria-hidden="true">
      <g {...pen} strokeWidth={1.3}>
        <path pathLength={1} className="ln" d="M20 3h132v14H20L4 10z" />
        <path pathLength={1} className="ln" d="M20 3v14M140 3v14M4 10l6-2v4z" />
      </g>
    </svg>
  );
}
