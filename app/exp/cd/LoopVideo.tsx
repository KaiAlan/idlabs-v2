'use client';

import { useEffect, useRef } from 'react';

/* A silent looping clip that plays only while it is on screen (and not at all for people who ask
   for reduced motion: they see the poster). Keeps sixteen gallery videos from all decoding at once.
   In the names-at-title-size version (html[data-cd-clients="title"], the tabs) the clips run at 1.5x. */
const rate = () => (document.documentElement.dataset.cdClients === 'title' ? 1.5 : 1);
export default function LoopVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    v.playbackRate = v.defaultPlaybackRate = rate();
    // the tabs can switch version while it plays
    const mo = new MutationObserver(() => { v.playbackRate = v.defaultPlaybackRate = rate(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-cd-clients'] });
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload !== 'auto') v.preload = 'auto';
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(v);
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  );
}
