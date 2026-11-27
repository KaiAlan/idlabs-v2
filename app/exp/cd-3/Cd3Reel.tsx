'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import CdGallery, { type Clip } from '../cd/CdGallery';

/* The gallery as a reel (2026-11-27): the behind-the-scenes clips in one row on the inside of a cylinder
   round the viewer, after Jesper Landberg's portfolio (the row turning past, the cards flexing with the
   speed) laid out as Suffice's (a light page, the card in front square on, the ones to the sides curving
   in towards you); the clips leaving to the sides drain to black and white with a grey double. The section pins for the row's length and the
   scroll carries the row sideways; the page then carries on, continuous.

   One WebGL canvas (raw WebGL, as Cd2Melt). Each card is a fine mesh; its vertex shader wraps it round
   the cylinder (radius R) and projects it from a viewer D away, so the sides come closer and grow. The
   smoothed scroll speed bows the cards' middles back and grows the fringe; at rest they settle flat.
   The cards draw into a framebuffer, then one pass over the screen bends it a little like a wide lens
   and splits the colours towards the edges. The clips are the cards' textures: only the ones on screen
   play and upload. Phones, reduced motion and no WebGL get /exp/cd's gallery (.cd3-reel-flat). */

const SPEED = 1.6; // px of row per px of scroll
const SEG_X = 48, SEG_Y = 12;
/* the row is loose, not a band (after the Blink reference): each card its own height and its own
   height on the screen, in a pattern of seven so seventeen cards don't repeat side by side.
   size: of the base card height; lift: its centre from the screen's middle, of the screen height (+ down) */
const SIZE = [1, 0.78, 0.92, 0.7, 1.04, 0.82, 0.88];
const LIFT = [-0.06, 0.12, -0.11, 0.08, 0.02, -0.12, 0.1];

const VERT = `
attribute vec2 aUv;
uniform vec2 uRes;      // screen, css px
uniform vec4 uBox;      // card centre from the screen centre (y down), size; css px
uniform float uR, uD, uVel;
varying vec2 vUv;
varying float vLit;
void main(){
  vec2 l=(aUv-.5)*uBox.zw;
  float X=uBox.x+l.x;
  float th=clamp(X/uR,-1.15,1.15); // past the screen's edge anyway; kept short of the eye
  float x3=uR*sin(th);
  float z3=uR*(1.-cos(th));
  // the speed bows the card's middle back, most at its centre, a little more along the middle row
  float bow=sin(aUv.x*3.14159)*(.75+.25*sin(aUv.y*3.14159));
  z3-=uVel*bow*uRes.x*.13;
  float y=uBox.y+l.y;
  float w=(uD-z3)/uD;
  gl_Position=vec4(x3*2./uRes.x,-y*2./uRes.y,0.,w);
  vUv=aUv;
  vLit=smoothstep(.35,1.,abs(th));
}`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uCover, uSize;
uniform float uRad, uHas;
varying vec2 vUv;
varying float vLit;
void main(){
  vec2 uv=(vUv-.5)*uCover+.5;
  vec3 c=mix(vec3(.957),texture2D(uTex,uv).rgb,uHas);
  // the cards at the sides catch the light as they turn towards you
  c=mix(c,vec3(1.),vLit*.16);
  vec2 q=abs(vUv-.5)*uSize-(uSize*.5-uRad);
  float d=length(max(q,0.))+min(max(q.x,q.y),0.)-uRad;
  float a=1.-smoothstep(-.75,.75,d);
  gl_FragColor=vec4(c*a,a);
}`;

const POST_V = `attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
const POST_F = `
precision mediump float;
uniform sampler2D uScene;
uniform float uAspect, uBarrel, uFringe;
uniform vec2 uPx;     // the drawing buffer, px
vec3 at(vec2 p){
  vec2 uv=p*.5+.5;
  if(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.) return vec3(1.);
  return texture2D(uScene,uv).rgb;
}
void main(){
  vec2 p=gl_FragCoord.xy/uPx*2.-1.;
  vec2 q=p*vec2(uAspect,1.);
  float r2=dot(q,q)/(1.+uAspect*uAspect);
  vec2 b=p*(1.-uBarrel*r2);
  // the colours split sideways, from nothing at the middle to most at the left and right edges,
  // smeared over a few taps so it reads as a lens's fringe, not a double image
  // the card in front in colour; the ones going out to the left and right drain to black and white,
  // and split into a grey ghost of themselves (a narrow, hard double) as they near the edge
  float ax=abs(p.x);
  float e=smoothstep(.71,1.,ax);
  vec2 o=vec2(sign(p.x)*e*uFringe,0.);
  const vec3 L=vec3(.299,.587,.114);
  vec3 c=at(b);
  float g=dot(c,L)*.5+dot(at(b+o),L)*.3+dot(at(b-o),L)*.2;
  float bw=smoothstep(.64,.81,ax);
  gl_FragColor=vec4(mix(c,vec3(g),bw),1.);
}`;

const aspect = (r: string) => { const [w, h] = r.split('/').map(Number); return w / h; };

export default function Cd3Reel({ clips, head }: { clips: Clip[]; head?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current, canvas = cv.current;
    if (!el || !canvas) return;
    const html = document.documentElement;
    if (!html.classList.contains('cd-js')) return;
    const wide = window.matchMedia('(min-width: 761px)');
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false, premultipliedAlpha: false });
    const off = () => { el.setAttribute('data-off', ''); el.style.height = ''; };
    if (!gl) { off(); return; }

    // programs
    const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = (v: string, f: string) => {
      const p = gl.createProgram()!;
      gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f));
      gl.linkProgram(p);
      return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
    };
    const card = prog(VERT, FRAG), post = prog(POST_V, POST_F);
    if (!card || !post) { off(); return; }
    const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
    const cu = Object.fromEntries(['uRes', 'uBox', 'uR', 'uD', 'uVel', 'uTex', 'uCover', 'uSize', 'uRad', 'uHas'].map((n) => [n, U(card, n)]));
    const pu = Object.fromEntries(['uScene', 'uAspect', 'uBarrel', 'uFringe', 'uPx'].map((n) => [n, U(post, n)]));

    // the card mesh (unit square, fine across so it curves smoothly)
    const verts: number[] = [], idx: number[] = [];
    for (let j = 0; j <= SEG_Y; j++) for (let i = 0; i <= SEG_X; i++) verts.push(i / SEG_X, j / SEG_Y);
    for (let j = 0; j < SEG_Y; j++) for (let i = 0; i < SEG_X; i++) {
      const a = j * (SEG_X + 1) + i, b = a + 1, c = a + SEG_X + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aUv = gl.getAttribLocation(card, 'aUv'), aP = gl.getAttribLocation(post, 'aP');

    const tex = () => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };

    // the clips: a poster first, then the video's frames while it plays
    let alive = true;
    const rate = html.dataset.cdClients === 'title' ? 1.2 : 1;
    type Card = { ar: number; t: WebGLTexture; v: HTMLVideoElement; img: HTMLImageElement; ta: number; has: boolean; dirty: boolean; on: boolean; x: number; w: number; h: number; y: number };
    const cards: Card[] = clips.map(([slug, , ratio]) => {
      const c: Card = { ar: aspect(ratio), t: tex(), v: document.createElement('video'), img: new Image(), ta: aspect(ratio), has: false, dirty: false, on: false, x: 0, w: 0, h: 0, y: 0 };
      c.img.onload = () => {
        if (c.has || !alive) return;
        gl.bindTexture(gl.TEXTURE_2D, c.t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, c.img);
        c.ta = c.img.naturalWidth / c.img.naturalHeight; c.has = true; kick();
      };
      c.img.src = `/assets/cd/${slug}.jpg`;
      Object.assign(c.v, { muted: true, loop: true, playsInline: true, preload: 'none', src: `/assets/cd/${slug}.mp4` });
      c.v.setAttribute('muted', ''); c.v.setAttribute('playsinline', '');
      const v = c.v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
      if (v.requestVideoFrameCallback) {
        const tick = () => { c.dirty = true; v.requestVideoFrameCallback!(tick); };
        v.requestVideoFrameCallback(tick);
      }
      return c;
    });
    const rvfc = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

    // the framebuffer the cards draw into
    let fbo: WebGLFramebuffer | null = null, ftex: WebGLTexture | null = null;
    let W = 0, H = 0, dpr = 1, edge = 0, R = 1, D = 1, ch = 0, gap = 0, s0 = 0, s1 = 0;
    const layout = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      if (ftex) gl.deleteTexture(ftex);
      if (fbo) gl.deleteFramebuffer(fbo);
      ftex = tex();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, ftex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      // the cylinder and the eye; the row
      const u = W / 1280;
      R = W * 0.82; D = W * 0.95;
      // the room under the lead: the cards are sized to it and centred in it
      const head = el.querySelector<HTMLElement>('.cd3-reel-head');
      const T = head ? Math.min(H * 0.5, head.getBoundingClientRect().bottom - r.top) : 0;
      const room = H - T;
      ch = Math.min(room * 0.5, W * 0.17);
      gap = 64 * u;
      let x = 0;
      cards.forEach((c, i) => {
        c.h = ch * SIZE[i % 7]; c.w = c.h * c.ar; c.y = T / 2 + room * LIFT[i % 7];
        c.x = x; x += c.w + gap * (0.6 + ((i * 5) % 7) / 7.5); // the gaps vary too
      });
      // the row starts and ends with its outer card's edge on the margin as drawn (the cylinder grows
      // the sides, so the margin is found back through the projection)
      const total = x, m = 64 * u;
      const proj = (X: number) => { const t = X / R; return (R * Math.sin(t) * D) / (D - R * (1 - Math.cos(t))); };
      const back = (sx: number) => {
        let lo = 0, hi = R * 1.1;
        for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (proj(mid) < sx) lo = mid; else hi = mid; }
        return lo;
      };
      const lo = back(W / 2 - m);
      edge = back(W / 2 + 24);
      s0 = -(W / 2 - lo); s1 = total - W / 2 - lo;
      el.style.height = `${H + (s1 - s0) / SPEED}px`;
    };

    let raf = 0, visible = false, prev = NaN, vel = 0;
    const frame = () => {
      raf = 0;
      if (!fbo) return;
      const rr = el.getBoundingClientRect();
      const travel = rr.height - H;
      const p = travel > 0 ? Math.min(1, Math.max(0, -rr.top / travel)) : 0;
      const s = s0 + (s1 - s0) * p;
      const ds = Number.isNaN(prev) ? 0 : s - prev;
      prev = s;
      vel += (Math.max(-1, Math.min(1, ds / 70)) - vel) * 0.1;
      if (Math.abs(vel) < 1e-4) vel = 0;

      // the cards
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(1, 1, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(card);
      gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.enableVertexAttribArray(aUv); gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(cu.uRes, W, H); gl.uniform1f(cu.uR, R); gl.uniform1f(cu.uD, D); gl.uniform1f(cu.uVel, vel);
      gl.uniform1i(cu.uTex, 0); gl.activeTexture(gl.TEXTURE0);
      const rad = Math.max(2, 3 * (W / 1280));
      let playing = false;
      for (const c of cards) {
        const X = c.x - s - W / 2 + c.w / 2;
        const on = X - c.w / 2 < edge && X + c.w / 2 > -edge; // any of it on screen
        if (on !== c.on) {
          c.on = on;
          if (on) { c.v.preload = 'auto'; c.v.playbackRate = c.v.defaultPlaybackRate = rate; c.v.play().catch(() => {}); }
          else c.v.pause();
        }
        if (!on) continue;
        if (!c.v.paused) playing = true;
        gl.bindTexture(gl.TEXTURE_2D, c.t);
        if (c.v.readyState >= 2 && (c.dirty || !rvfc)) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, c.v);
          c.ta = c.v.videoWidth / c.v.videoHeight || c.ta; c.has = true; c.dirty = false;
        }
        const cover = c.ta > c.ar ? [c.ar / c.ta, 1] : [1, c.ta / c.ar];
        gl.uniform2f(cu.uCover, cover[0], cover[1]);
        gl.uniform2f(cu.uSize, c.w, c.h);
        gl.uniform1f(cu.uRad, rad);
        gl.uniform1f(cu.uHas, c.has ? 1 : 0);
        gl.uniform4f(cu.uBox, X, c.y, c.w, c.h);
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      }
      gl.disableVertexAttribArray(aUv);

      // the lens
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.disable(gl.BLEND);
      gl.useProgram(post);
      gl.bindBuffer(gl.ARRAY_BUFFER, qb);
      gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, ftex); gl.uniform1i(pu.uScene, 0);
      gl.uniform1f(pu.uAspect, W / H); gl.uniform2f(pu.uPx, canvas.width, canvas.height);
      gl.uniform1f(pu.uBarrel, 0.05);
      gl.uniform1f(pu.uFringe, 0.006 + Math.abs(vel) * 0.012);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(aP);

      // keep going while it is on screen and something moves (the clips, the settling)
      if (visible && (playing || vel !== 0)) kick();
    };
    function kick() { if (!raf && visible && alive) raf = requestAnimationFrame(frame); }

    const start = () => {
      if (!wide.matches) {
        el.removeAttribute('data-on'); el.style.height = '';
        cards.forEach((c) => { c.on = false; c.v.pause(); });
        return;
      }
      el.setAttribute('data-on', '');
      layout();
      prev = NaN;
      kick();
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
      else cards.forEach((c) => { c.on = false; c.v.pause(); });
    }, { rootMargin: '100px 0px' });
    io.observe(el);
    let rt = 0;
    const onResize = () => { window.clearTimeout(rt); rt = window.setTimeout(start, 150); };
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', onResize);
    canvas.addEventListener('webglcontextlost', off);
    start();
    document.fonts.ready.then(() => { if (alive) start(); });

    return () => {
      alive = false;
      cancelAnimationFrame(raf); raf = 0; visible = false;
      window.clearTimeout(rt);
      io.disconnect();
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('webglcontextlost', off);
      cards.forEach((c) => { c.v.pause(); c.v.removeAttribute('src'); c.v.load(); gl.deleteTexture(c.t); });
      if (ftex) gl.deleteTexture(ftex);
      if (fbo) gl.deleteFramebuffer(fbo);
    };
  }, [clips]);

  return (
    <div className="cd3-reel" ref={root}>
      {/* the lead holds the top of the pinned screen; the row runs under it */}
      <div className="cd3-reel-pin">
        <div className="cd3-reel-head">{head}</div>
        <canvas ref={cv} className="cd3-reel-gl" aria-hidden="true" />
      </div>
      <div className="cd3-reel-flat"><CdGallery clips={clips} /></div>
    </div>
  );
}
