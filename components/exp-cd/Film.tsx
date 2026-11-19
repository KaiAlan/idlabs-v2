'use client';

/* /exp/cd — the player. The voice-over (public/exp/cd/vo.mp3) is the clock: while it plays,
   the engine draws the frame for audio.currentTime, so picture and voice cannot drift, and
   pausing or jumping to a chapter moves both. Browsers only play sound after a click, so the
   film opens on a title card with a Play button. If the audio cannot play, a silent clock
   runs the film instead.

   Keys: space pause/play · ← → previous/next chapter · R from the start · M mute. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Engine } from './engine';
import { FILM1, type FilmDef } from './timeline';
import { FILM2 } from './timeline2';
import { FILM3 } from './timeline3';
import { FILM4 } from './timeline4';
import { FILM5 } from './timeline5';
import { FILM6 } from './timeline6';

const FILMS: FilmDef[] = [FILM1, FILM2, FILM3, FILM4, FILM5, FILM6];
import { WORDS } from './vo';


// the narration in phrases (split at commas, full stops, question marks), for subtitles
type Phrase = { a: number; b: number; words: [string, number][] };
function phrases(): Phrase[] {
  const out: Phrase[] = [];
  let cur: [string, number][] = [];
  WORDS.forEach(([w, s, e], i) => {
    cur.push([w, s]);
    const next = WORDS[i + 1];
    if (/[.,?]$/.test(w) || !next || next[1] - e > 0.9) { out.push({ a: cur[0][1], b: e, words: cur }); cur = []; }
  });
  return out;
}

export default function Film({ variant = '2' }: { variant?: string }) {
  const F = FILMS.find((f) => f.id === variant) ?? FILM2;
  const { layers: LAYERS, camera: CAMERA, cuts: CUTS, chapters: CHAPTERS, end: END, poster: POSTER, assets: ASSETS } = F;
  const root = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const clock = useRef({ t: POSTER, last: 0, silent: false });
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [sub, setSub] = useState<{ i: number; k: number }>({ i: -1, k: 0 });
  const PH = useMemo(phrases, []);
  const chapter = useRef(0);
  const [chap, setChap] = useState(0);

  // preload type and pictures, then build the engine over the rendered layers
  useEffect(() => {
    let live = true;
    const imgs = ASSETS.map((n) => { const i = new Image(); i.src = `/exp/cd/${n}.webp`; return i.decode().catch(() => {}); });
    const go = () => {
      if (!live || engine.current || !root.current) return;
      engine.current = new Engine(LAYERS, CAMERA, root.current);
      // ?t=12.5 opens paused on that frame, for reviewing one moment
      const qt = Number(new URLSearchParams(location.search).get('t'));
      if (qt > 0) { clock.current.t = qt; setStarted(true); root.current.dataset.review = '1'; }
      engine.current.render(qt > 0 ? qt : POSTER);
      setReady(true);
    };
    Promise.all([document.fonts.ready, ...imgs]).then(go);
    const fallback = setTimeout(go, 7000);
    return () => { live = false; clearTimeout(fallback); };
  }, []);

  const now = useCallback(() => {
    const a = audio.current, c = clock.current;
    if (a && !c.silent && c.t < a.duration - 0.05) return a.currentTime;
    return c.t;
  }, []);

  // the frame loop
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const tick = (ms: number) => {
      const c = clock.current;
      const dt = c.last ? Math.min(0.1, (ms - c.last) / 1000) : 0;
      c.last = ms;
      const a = audio.current;
      if (playing) {
        // past the end of the voice (end card) or without audio, the silent clock carries on
        if (!a || c.silent || a.ended || a.paused) c.t += dt; else c.t = a.currentTime;
        if (c.t >= END) { c.t = END; setPlaying(false); setEnded(true); }
      }
      const t = c.t;
      engine.current?.render(t);
      if (root.current) root.current.dataset.paused = playing ? '' : '1';
      // subtitles
      let i = -1;
      for (let j = 0; j < PH.length; j++) if (t >= PH[j].a - 0.15 && t <= (PH[j + 1]?.a ?? PH[j].b + 1) - 0.15 && t <= PH[j].b + 1.1) { i = j; break; }
      const k = i < 0 ? 0 : PH[i].words.filter(([, s]) => s <= t).length;
      setSub((p) => (p.i === i && p.k === k ? p : { i, k }));
      // chapter + progress
      let ch = 0;
      for (let j = 0; j < CHAPTERS.length; j++) if (t >= CUTS[j]) ch = j;
      if (ch !== chapter.current) { chapter.current = ch; setChap(ch); }
      if (bar.current) bar.current.style.transform = `scaleX(${(t / END).toFixed(4)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, playing, PH]);

  const seek = useCallback((t: number) => {
    const c = clock.current, a = audio.current;
    c.t = t; setEnded(false);
    if (a && !c.silent && t < a.duration) a.currentTime = t;
    if (a && !c.silent && playing && t < a.duration) a.play().catch(() => {});
  }, [playing]);

  const play = useCallback(() => {
    const a = audio.current, c = clock.current;
    if (!started || ended || c.t >= END) { c.t = 0; setEnded(false); }
    setStarted(true); setPlaying(true);
    if (a && c.t < (a.duration || 99)) {
      a.currentTime = c.t;
      a.play().then(() => { c.silent = false; }).catch(() => { c.silent = true; });
    }
  }, [ended, started]);
  const pause = useCallback(() => { audio.current?.pause(); setPlaying(false); }, []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || !started) return;
      if (e.key === ' ') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') seek(CUTS[Math.min(CHAPTERS.length - 1, chapter.current + 1)] + 0.01);
      else if (e.key === 'ArrowLeft') seek(CUTS[Math.max(0, now() - CUTS[chapter.current] < 1.5 ? chapter.current - 1 : chapter.current)] + 0.01);
      else if (e.key === 'r' || e.key === 'R') seek(0);
      else if (e.key === 'm' || e.key === 'M') setMuted((m) => !m);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, toggle, seek, now]);

  useEffect(() => { if (audio.current) audio.current.muted = muted; }, [muted]);

  const ph = sub.i >= 0 ? PH[sub.i] : null;

  return (
    <main className={`cd ${F.cls}`} data-started={started ? '' : undefined}>
      <audio ref={audio} src="/exp/cd/vo.mp3" preload="auto" onEnded={() => { /* the end card runs on the silent clock */ }} />
      <div ref={root} className="cd-world" onClick={started ? toggle : undefined} aria-hidden="true">
        <div className="cd-frame">
        {LAYERS.map((L) => (
          <div key={L.id} data-l={L.id} className={`cd-l${L.cls ? ` ${L.cls}` : ''}`} style={{ width: L.w ? `${L.w}vmin` : undefined, height: L.h ? `${L.h}vmin` : undefined, zIndex: L.zi, display: 'none' }}>
            {L.node}
          </div>
        ))}
        </div>
      </div>
      <div className="cd-grain" aria-hidden="true" />
      <div className="cd-vignette" aria-hidden="true" />

      <header className="cd-top">
        <a className="cd-wordmark" href="/" aria-label="Identity Labs home"><span>Identity</span><em>Labs</em></a>
      </header>

      {started && (
        <p className="cd-sub" aria-live="off">
          {ph?.words.map(([w], i) => <span key={`${sub.i}-${i}`} className={i < sub.k ? 'on' : undefined}>{w} </span>)}
        </p>
      )}

      {!started && (
        <div className="cd-title">
          <p className="cd-title-kicker">Identity Labs · an experiment</p>
          <h1 className="cd-title-name">Creative Director</h1>
          <button type="button" className="cd-play" onClick={play} disabled={!ready}>
            {ready ? <>Play <span aria-hidden="true">▸</span></> : 'Loading…'}
          </button>
          <p className="cd-title-note">78 seconds · sound on</p>
          <p className="cd-variants">{FILMS.map((f) => <a key={f.id} href={`/exp/cd/v${f.id}`} className={f.id === F.id ? 'is-on' : undefined}>Variant {f.id} · {f.name}</a>)}</p>
        </div>
      )}

      {started && (
        <nav className="cd-controls" aria-label="Film controls">
          <ol className="cd-chapters">
            {CHAPTERS.map((c, i) => (
              <li key={c}><button type="button" className={i === chap ? 'is-on' : undefined} onClick={() => seek(CUTS[i] + 0.01)} aria-label={`Chapter ${i + 1}: ${c}`}>{String(i + 1).padStart(2, '0')}</button></li>
            ))}
          </ol>
          <span className="cd-label">{CHAPTERS[chap]}</span>
          <button type="button" className="cd-btn" onClick={() => setMuted((m) => !m)}>{muted ? 'Sound off' : 'Sound on'}</button>
          <button type="button" className="cd-btn" onClick={toggle}>{ended ? 'Replay' : playing ? 'Pause' : 'Play'}</button>
        </nav>
      )}
      <div className="cd-progress" aria-hidden="true"><div ref={bar} /></div>
    </main>
  );
}
