/* A clapperboard built as a 3D object (cd3.css .cb): three slabs with thickness — the board, the striped
   bar fixed on top of it, and the striped arm hinged at the left that claps open and shut — each a front
   face, a back face and four edges, in one preserve-3d group that the scene turns (Cd3Wrap sets --spin,
   --clap, --lit). The faces are vector drawings, sharp at any size. The board is slated for this page:
   Identity Labs, the creative director. */

const STRIPES = (w: number, h: number, flip = false) => {
  const s = [];
  const step = w / 6;
  for (let x = -step; x < w + step; x += step) {
    const a = flip ? x + h * 0.9 : x, b = flip ? x : x + h * 0.9;
    s.push(<path key={x} d={`M${a} 0H${a + step / 2}L${b + step / 2} ${h}H${b}Z`} fill="#f4f4f2" />);
  }
  return s;
};

const Stick = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 240 26" preserveAspectRatio="none" aria-hidden="true">
    <defs><clipPath id={flip ? 'cb-arm' : 'cb-bar'}><rect width="240" height="26" rx="3" /></clipPath></defs>
    <g clipPath={`url(#${flip ? 'cb-arm' : 'cb-bar'})`}>
      <rect width="240" height="26" fill="#141414" />
      {STRIPES(240, 26, flip)}
    </g>
  </svg>
);

const T = { fontFamily: 'IBM Plex Mono, ui-monospace, monospace', fill: '#f4f4f2' } as const;
const Board = () => (
  <svg viewBox="0 0 240 150" aria-hidden="true">
    <rect width="240" height="150" rx="7" fill="#141414" />
    <g stroke="#f4f4f2" strokeWidth="1.1" opacity="0.92">
      <path d="M10 36H230M10 76H230M10 100H230M10 124H230M86 36V76M160 36V76" />
    </g>
    <g style={T} fontSize="6.4" letterSpacing="0.6">
      <text x="12" y="13">PROD.</text>
      <text x="12" y="46">ROLL</text><text x="90" y="46">SCENE</text><text x="164" y="46">TAKE</text>
      <text x="12" y="88">DIRECTOR:</text><text x="12" y="112">CAMERA:</text><text x="12" y="136">DATE:</text>
    </g>
    <g style={T}>
      <text x="12" y="30" fontSize="14" fontFamily="'Season Mix', Georgia, serif">Identity<tspan fontStyle="italic">Labs</tspan></text>
      <text x="48" y="70" fontSize="17" textAnchor="middle">A</text>
      <text x="123" y="70" fontSize="17" textAnchor="middle">01</text>
      <text x="195" y="70" fontSize="17" textAnchor="middle">3</text>
      <text x="66" y="95" fontSize="9" letterSpacing="0.5">CREATIVE DIRECTOR</text>
      <text x="56" y="119" fontSize="9" letterSpacing="0.5">35MM / 4K</text>
      <text x="44" y="143" fontSize="9" letterSpacing="0.5">27.11.26</text>
    </g>
    <g style={T} fontSize="5" letterSpacing="0.4" opacity="0.8">
      <text x="150" y="138">DAY · NIGHT · INT · EXT</text>
      <text x="150" y="145">MOS · SYNC · FILTER</text>
    </g>
  </svg>
);
const Back = () => (
  <svg viewBox="0 0 240 150" aria-hidden="true">
    <rect width="240" height="150" rx="7" fill="#1b1b1b" />
    <rect x="8" y="8" width="224" height="134" rx="4" fill="none" stroke="#2c2c2c" />
    <text x="120" y="80" textAnchor="middle" fontSize="12" fill="#3a3a3a" fontFamily="'Season Mix', Georgia, serif">Identity<tspan fontStyle="italic">Labs</tspan></text>
  </svg>
);

// a slab: front, back and the four edges
const Slab = ({ className, front, back }: { className: string; front: React.ReactNode; back: React.ReactNode }) => (
  <div className={`cb-slab ${className}`}>
    <div className="cb-face cb-front">{front}<span className="cb-sheen" /></div>
    <div className="cb-face cb-back">{back}</div>
    <span className="cb-edge cb-l" /><span className="cb-edge cb-r" /><span className="cb-edge cb-t" /><span className="cb-edge cb-b" />
  </div>
);

export default function Cd3Clapper() {
  return (
    <div className="cb" aria-hidden="true">
      <Slab className="cb-arm" front={<Stick flip />} back={<Stick />} />
      <Slab className="cb-bar" front={<Stick />} back={<Stick flip />} />
      <Slab className="cb-board" front={<Board />} back={<Back />} />
    </div>
  );
}
