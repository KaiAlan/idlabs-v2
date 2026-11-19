/* /exp/cd — small shared helpers: a seeded random (the same frame every play, on the server
   and the client) and torn-paper outlines as clip-path polygons. */

export function rng(seed: number) {
  let a = seed * 9301 + 49297;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// a torn-paper outline; `amp` is how deep the tears bite, in %
export function torn(seed: number, amp = 2.4, n = 22) {
  const r = rng(seed);
  const pts: string[] = [];
  const f = (v: number) => v.toFixed(2);
  for (let i = 0; i <= n; i++) pts.push(`${f((i / n) * 100)}% ${f(r() * amp)}%`);
  for (let i = 1; i < n; i++) pts.push(`${f(100 - r() * amp * 0.5)}% ${f((i / n) * 100)}%`);
  for (let i = n; i >= 0; i--) pts.push(`${f((i / n) * 100)}% ${f(100 - r() * amp)}%`);
  for (let i = n - 1; i > 0; i--) pts.push(`${f(r() * amp * 0.5)}% ${f((i / n) * 100)}%`);
  return `polygon(${pts.join(',')})`;
}
