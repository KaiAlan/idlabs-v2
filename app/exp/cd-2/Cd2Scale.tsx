'use client';

import { useEffect, useRef, useState } from 'react';

/* The blueprint's scales (cd2.css, .cd2-scale): numbers down both sides of the sheet's frame, one at
   every heavy grid line (every 120px, five 24px cells), counting in cells: 0, 5, 10, … As many as the
   dark part is tall, measured. */
const STEP = 120;

export default function Cd2Scale() {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const ro = new ResizeObserver(() => setN(Math.floor(host.offsetHeight / STEP) + 1));
    ro.observe(host);
    return () => ro.disconnect();
  }, []);
  const marks = Array.from({ length: n }, (_, i) => <span key={i} style={{ top: i * STEP }}>{i * 5}</span>);
  return (
    <div className="cd2-scale" ref={ref} aria-hidden="true">
      <div className="cd2-scale-l">{marks}</div>
      <div className="cd2-scale-r">{marks}</div>
    </div>
  );
}
