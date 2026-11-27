'use client';

import { useEffect, useState } from 'react';

/* The 12-column grid drawn over the page (as the cd-33 to cd-35 frames show it), for checking the
   layout: press G, or open the page with ?grid=on. */
export default function Cd3Grid() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(new URLSearchParams(location.search).get('grid') === 'on');
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'g' || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return;
      setOn((v) => !v);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  if (!on) return null;
  return (
    <div className="cd3-cols" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => <span key={i} />)}
    </div>
  );
}
