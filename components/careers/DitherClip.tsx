'use client';

import { useEffect, useRef } from 'react';

/* A clip drawn as a 1-bit ordered (Bayer 8x8) dither in WebGL, ink dots on white, as the dithered
   flower cards (the reference, 2026-11-27). The clips are baked beforehand to a grey tone map
   (public/assets/careers/clips: cropped 4:5, the ground keyed to white, 0 ink .. 1 paper), so this
   only dithers. It breathes slowly and pushes in while its card is hovered (`active`). Plays only
   while on screen; one still frame for reduced motion. */

const VERT = `attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `precision mediump float;
varying vec2 v;
uniform sampler2D tex;
uniform vec2 res;      // canvas, device px
uniform vec2 vid;      // video size
uniform vec2 focus;    // crop centre in the video, 0..1
uniform float zoom;
uniform float dotPx;   // dot size, device px
uniform vec3 ink;
uniform vec2 tone;     // x: the darkest tone kept (lifts solid masses), y: gamma (<1 lightens)
float b2(vec2 a){ a = floor(a); return fract(a.x / 2. + a.y * a.y * .75); }
float b4(vec2 a){ return b2(.5 * a) * .25 + b2(a); }
float b8(vec2 a){ return b4(.5 * a) * .25 + b2(a); }
void main(){
  vec2 cell = floor(gl_FragCoord.xy / dotPx);
  vec2 uv = (cell + .5) * dotPx / res;            // sample at the cell's centre: square dots
  uv.y = 1. - uv.y;                             // the video's rows run top-down
  // cover-fit the canvas into the video, around the focus point
  float ca = res.x / res.y, va = vid.x / vid.y;
  vec2 span = ca < va ? vec2(ca / va, 1.) : vec2(1., va / ca);
  span /= zoom;
  vec2 c = clamp(focus, span * .5, 1. - span * .5);
  vec2 t = c + (uv - .5) * span;
  float l = texture2D(tex, t).r;                // the clip is baked to tone: 0 ink .. 1 paper
  vec2 px = span / res * dotPx * 1.5;           // ~1.5 cells, in the video's uv
  float blur = .25 * (texture2D(tex, t + vec2(px.x, 0.)).r + texture2D(tex, t - vec2(px.x, 0.)).r
                    + texture2D(tex, t + vec2(0., px.y)).r + texture2D(tex, t - vec2(0., px.y)).r);
  l = clamp(l + 1.4 * (l - blur), 0., 1.);      // unsharp: edges and veins stay crisp
  l = pow(mix(tone.x, 1., l), tone.y);
  float on = step(b8(cell) + .02, 1. - l);      // dark enough → a dot
  gl_FragColor = vec4(mix(vec3(1.), ink, on), 1.);
}`;

type Props = { src: string; focus?: [number, number]; tone?: [number, number]; rate?: number; active?: boolean; ink?: [number, number, number]; label: string };

export default function DitherClip({ src, focus = [0.5, 0.5], tone = [0, 1], rate = 1, active = false, ink = [0.17, 0.17, 0.17], label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sh = (type: number, s: string) => { const o = gl.createShader(type)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u('res'), uVid = u('vid'), uFocus = u('focus'), uZoom = u('zoom'), uDot = u('dotPx'), uInk = u('ink'), uTone = u('tone');

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const video = document.createElement('video');
    video.src = src; video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'auto';
    video.defaultPlaybackRate = rate; video.playbackRate = rate;
    video.crossOrigin = 'anonymous';

    let raf = 0, visible = false, ready = false, push = 0, last = performance.now();
    const t0 = last;

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uDot, Math.max(1, Math.round(dpr))); // fine: 1 css px
    };

    const draw = (now: number) => {
      if (!ready) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      push += ((activeRef.current ? 1 : 0) - push) * (1 - Math.exp(-dt * 3));
      const breathe = reduce ? 0 : 0.5 - 0.5 * Math.cos(((now - t0) / 1000) * (Math.PI * 2 / 14));
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      gl.uniform1f(uZoom, 1 + 0.06 * breathe + 0.14 * push);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const loop = (now: number) => { draw(now); raf = requestAnimationFrame(loop); };
    const start = () => { if (raf || !ready || reduce) return; video.play().catch(() => {}); last = performance.now(); raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; video.pause(); };

    gl.uniform2f(uFocus, focus[0], focus[1]);
    gl.uniform3f(uInk, ink[0], ink[1], ink[2]);
    gl.uniform2f(uTone, tone[0], tone[1]);
    size();

    video.addEventListener('loadeddata', () => {
      ready = true;
      gl.uniform2f(uVid, video.videoWidth, video.videoHeight);
      if (reduce) { video.currentTime = video.duration * 0.4; video.addEventListener('seeked', () => draw(performance.now()), { once: true }); }
      else { draw(performance.now()); if (visible) start(); }
    }, { once: true });

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop(); }, { rootMargin: '120px' });
    io.observe(canvas);
    const ro = new ResizeObserver(() => { size(); draw(performance.now()); });
    ro.observe(canvas);

    return () => { stop(); io.disconnect(); ro.disconnect(); video.removeAttribute('src'); video.load(); };
  }, [src, focus[0], focus[1], ink[0], ink[1], ink[2], tone[0], tone[1], rate]); // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvasRef} className="dc-canvas" {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })} />;
}
