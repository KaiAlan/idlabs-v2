'use client';

import { useEffect, type ReactNode } from 'react';
import OptionTabs, { useOption } from '../../../components/flow/OptionTabs';
import type { Clip } from '../cd/CdGallery';
import Cd3Reel from './Cd3Reel';
import Cd3Burst from './Cd3Burst';

/* The claim and the clips, in one of two versions, switched by the option tabs shown while the
   section is pinned (?gallery=reel|collage): the reel turning past (Cd3Reel) or the collage bursting
   out of one card (Cd3Burst). */

type G = 'reel' | 'collage';
const OPTS: [G, string][] = [['reel', 'Reel'], ['collage', 'Collage']];

export default function Cd3Gallery({ clips, head }: { clips: Clip[]; head: ReactNode }) {
  const [g, pick] = useOption<G>('gallery', OPTS, 'reel');
  // the lead is mounted anew with each version, after CdReveal's one look at the page: play it in here
  useEffect(() => {
    if (!document.documentElement.classList.contains('cd-js')) return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { (e.target as HTMLElement).dataset.in = ''; io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll<HTMLElement>('.cd3-gallery [data-reveal]:not([data-in])').forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [g]);
  return (
    <>
      {g === 'reel' ? <Cd3Reel key="reel" clips={clips} head={head} /> : <Cd3Burst key="collage" clips={clips} head={head} />}
      <OptionTabs
        groups={[{ label: 'Gallery', options: OPTS, value: g, onChange: (v) => pick(v as G) }]}
        selector=".cd3-gallery .cd3-reel" label="Gallery options" />
    </>
  );
}
