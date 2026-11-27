'use client';

import { useState } from 'react';
import DitherClip from './DitherClip';
import { ROLES } from './content';

/* /careers, below the roles' table (trying it, 2026-11-27): a card per role after the dithered
   flower and moth cards — the role's clip as a 1-bit Bayer dither on white (DitherClip), the name in Season Mix, a line, and an arrow. Hovering a card pushes its clip in. The
   subjects: a white flower (Creative Director), a dandelion opening (Head of Growth), a jellyfish (Thinker-Writer). */

// stock footage from Pexels and Mixkit (free licenses), baked to tone maps by scripts/bake-careers-clips.mjs: a white
// chrysanthemum (5647343), a dandelion opening (37443245), a white jellyfish (Mixkit 45404). The lines, two at most and
// alike in length: cut down from the Creative Director page and the Head of Growth and Thinker-Writer postings.
const CARDS: Record<string, { src: string; tone: [number, number]; rate: number; line: string }> = {
  '01': { src: '/assets/careers/clips/flower.webm?v=8', tone: [0, 0.45], rate: 2.5,
    line: 'Find each product’s aha moment, then show it to 10 million people.' },
  '02': { src: '/assets/careers/clips/dandelion.webm?v=6', tone: [0.3, 0.65], rate: 2.5,
    line: 'Attention and audience: the most durable leverage of the 21st century.' },
  '03': { src: '/assets/careers/clips/jelly.webm?v=12', tone: [0, 1], rate: 0.7,
    line: 'Of the 100 ideas that will shape this century, you may contribute one.' },
};
const INK: [number, number, number] = [0.17, 0.17, 0.17];

export default function RoleCards({ size = 'large' }: { size?: 'large' | 'small' }) {
  const [hot, setHot] = useState<string | null>(null);
  return (
    <div className={`rc rc--${size}`}>
      <ul className="rc-list" aria-label="Open roles, as cards">
      {ROLES.map((r) => {
        const ext = r.href.startsWith('http');
        return (
          <li key={r.n}>
            <a
              href={r.href}
              className="rc-card"
              {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onPointerEnter={() => setHot(r.n)} onPointerLeave={() => setHot(null)}
              onFocus={() => setHot(r.n)} onBlur={() => setHot(null)}
            >
              <div className="rc-media">
                <DitherClip src={CARDS[r.n].src} ink={INK} tone={CARDS[r.n].tone} rate={CARDS[r.n].rate} active={hot === r.n} label="" />
              </div>
              {size === 'small' ? (
                <>
                  <h3 className="rc-name">{r.title}</h3>
                  <div className="rc-foot">
                    <span>View role</span>
                    <span className="rc-arrow" aria-hidden="true">{ext ? '↗' : '→'}</span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="rc-title">{r.title}</h3>
                  <p className="rc-line">{CARDS[r.n].line}</p>
                  <div className="rc-foot">
                    <span>View role</span>
                    <span className="rc-arrow" aria-hidden="true">{ext ? '↗' : '→'}</span>
                  </div>
                </>
              )}
            </a>
          </li>
        );
      })}
      </ul>
    </div>
  );
}
