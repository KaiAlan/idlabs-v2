'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* The role pages' image viewer (2026-11-28): a click on a posting's image (.ed-fig a) opens it large in a
   dialog over a white veil, instead of a new tab. In the dialog: scroll (or pinch, on a trackpad or a
   phone) zooms toward the pointer, 1x–8x; drag pans once zoomed; a click on the image zooms in to 2.5x
   there, or back out; the % button resets. Esc, Close or a click on the veil closes it.
   The links stay real links, so without JS (or with a modifier key) they still open the file. */

const MIN = 1;
const MAX = 8;
const STEP = 2.5; // a click's zoom

type View = { s: number; x: number; y: number };

export default function EdLightbox() {
  const dlg = useRef<HTMLDialogElement>(null);
  const im = useRef<HTMLImageElement>(null);
  const view = useRef<View>({ s: 1, x: 0, y: 0 });
  const [img, setImg] = useState<{ src: string; alt: string } | null>(null);
  const [pct, setPct] = useState(100);

  // apply a view: the scale clamped, the pan kept so the image always covers its own box
  const apply = useCallback((v: View, animate = false) => {
    const el = im.current;
    if (!el) return;
    const s = Math.min(MAX, Math.max(MIN, v.s));
    const w = el.offsetWidth, h = el.offsetHeight;
    const x = Math.min(0, Math.max(w * (1 - s), v.x));
    const y = Math.min(0, Math.max(h * (1 - s), v.y));
    view.current = { s, x, y };
    el.style.transition = animate ? 'transform 240ms cubic-bezier(.2, .8, .2, 1)' : 'none';
    el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    el.dataset.zoomed = s > 1.001 ? 'true' : 'false';
    setPct(Math.round(s * 100));
  }, []);

  // zoom to scale `s` keeping the client point (cx, cy) still under the pointer
  const zoomAt = useCallback((s: number, cx: number, cy: number, animate = false) => {
    const el = im.current;
    if (!el) return;
    const { s: s0, x, y } = view.current;
    const ns = Math.min(MAX, Math.max(MIN, s));
    const px = cx - el.offsetLeft, py = cy - el.offsetTop; // the dialog is fixed at 0,0: its offsets are client coords
    const u = (px - x) / s0, v = (py - y) / s0;
    apply({ s: ns, x: px - u * ns, y: py - v * ns }, animate);
  }, [apply]);

  const reset = useCallback((animate = true) => apply({ s: 1, x: 0, y: 0 }, animate), [apply]);

  // open on a click on a posting's image
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.('.ed-fig a') as HTMLAnchorElement | null;
      if (!a) return;
      e.preventDefault();
      setImg({ src: a.href, alt: a.querySelector('img')?.alt ?? '' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const d = dlg.current;
    if (!d || !img || d.open) return;
    view.current = { s: 1, x: 0, y: 0 };
    setPct(100);
    d.showModal();
    document.documentElement.classList.add('ed-lb-open');
  }, [img]);

  // wheel and trackpad pinch (ctrlKey wheel); a non-passive listener so the page never scrolls
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    const onWheel = (e: WheelEvent) => {
      if (!d.open) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const k = e.ctrlKey ? 0.01 : 0.002;
      zoomAt(view.current.s * Math.exp(-e.deltaY * unit * k), e.clientX, e.clientY);
    };
    d.addEventListener('wheel', onWheel, { passive: false });
    return () => d.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  // drag to pan, two fingers to pinch; a press that moves is not a click
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(false);
  const pinch = useRef<{ d: number; s: number } | null>(null);

  const onDown = (e: React.PointerEvent<HTMLImageElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.current.size === 1) moved.current = false;
    if (pts.current.size === 2) {
      const [a, b] = [...pts.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: view.current.s };
    }
  };
  const onMove = (e: React.PointerEvent<HTMLImageElement>) => {
    const p = pts.current.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (Math.abs(dx) + Math.abs(dy) > 0) moved.current ||= Math.abs(dx) + Math.abs(dy) > 3;
    if (pts.current.size === 2 && pinch.current) {
      const [a, b] = [...pts.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      moved.current = true;
      zoomAt(pinch.current.s * (dist / pinch.current.d), (a.x + b.x) / 2, (a.y + b.y) / 2);
    } else if (pts.current.size === 1 && view.current.s > 1) {
      const v = view.current;
      apply({ s: v.s, x: v.x + dx, y: v.y + dy });
    }
  };
  const onUp = (e: React.PointerEvent<HTMLImageElement>) => {
    pts.current.delete(e.pointerId);
    if (pts.current.size < 2) pinch.current = null;
  };

  const close = () => dlg.current?.close();

  return (
    <dialog
      ref={dlg}
      className="ed-lb"
      aria-label={img?.alt || 'Image'}
      data-lenis-prevent
      onClose={() => { document.documentElement.classList.remove('ed-lb-open'); setImg(null); }}
      onClick={(e) => {
        if (e.target === im.current) {
          if (moved.current) return; // the end of a drag or a pinch
          if (view.current.s > 1.001) reset();
          else zoomAt(STEP, e.clientX, e.clientY, true);
          return;
        }
        if (e.target === dlg.current) close();
      }}
    >
      {img && (
        <>
          <div className="ed-lb-bar">
            <button className="ed-lb-btn" type="button" onClick={() => reset()} aria-label="Reset zoom" disabled={pct === 100}>{pct}%</button>
            <button className="ed-lb-btn" type="button" onClick={close} aria-label="Close">Close <span aria-hidden="true">×</span></button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={im}
            src={img.src}
            alt={img.alt}
            draggable={false}
            data-zoomed="false"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        </>
      )}
    </dialog>
  );
}
