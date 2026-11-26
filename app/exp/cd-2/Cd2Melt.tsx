'use client';

import { useEffect } from 'react';
import { melt } from './Cd2Stage';

/* "downstream" melting into the page like the "WILD" poster: the tops of the letters stay as set;
   from part way down, each letter runs on as a liquid ribbon of its own shape that meanders down in
   broad waves, swelling and fanning out as it goes until the ribbons all but merge and fill the
   screen below, darkening from the word's grey to the dark the page then turns. The paragraph rises
   meanwhile (Cd2Stage). Drawn with WebGL on a canvas over the pinned screen (.cd2-drips), in place of
   the word (whose own text goes transparent while this draws; without WebGL the word stays as it is).

   The word is drawn once into a texture. A shader draws every pixel: above the melt line (through the
   middle of the lowercase letters), the word itself; below it, the letters' cross-section near their
   feet carried down: every point reads the word at a point that is
   - fanned in toward the word's centre the deeper it is (so the ribbons spread wider and wider apart
     and fill the width),
   - shifted back along the meander (two sines over depth and across, so neighbouring ribbons sway
     together but not in lockstep, drifting slowly in time),
   - and widened (the ink taken over a span that grows with depth, so each ribbon swells),
   and the result is cut at one level, so the edges stay clean like poured paint. How far the ribbons
   have run, how far they swing, spread and swell all follow the scroll (Cd2Stage's melt.d, 0 → 1), so
   it runs as you scroll and draws back as you scroll up; at the end solid dark spreads out from the
   ribbons below the word: they swell into each other until the foot of the screen is solid dark, and
   the page then scrolls on into the dark below it. The word stays whole and grey.
   melt.show is the lead's own visibility. Nothing moves on its own: it is still when the scroll is. */

const SOFT = [152, 152, 152]; // the lead's grey
const INK = [13, 13, 13]; // the dark the page turns (cd2.css, .cd2-dark)
const TEX_W = 1024, TEX_H = 256;

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;      // screen, css px
uniform float uDpr;
uniform vec2 uOrigin;   // the word's box, top left, css px
uniform vec2 uSize;     // its size, css px
uniform vec2 uUv;       // the box's extent in the texture
uniform float uYb;      // the baseline, within the box
uniform float uEm;
uniform float uD;       // the melt, 0 -> 1
uniform float uT;
uniform vec3 uColor;
uniform vec3 uInk;
uniform float uShow;

float ink(vec2 q){
  if(q.x<0.||q.y<0.||q.x>uSize.x||q.y>uSize.y) return 0.;
  return texture2D(uTex,q/uSize*uUv,-1.).a;
}
// the same, from a softened copy (the texture's smaller levels): b 0 is crisp
float inkSoft(vec2 q,float b){
  if(q.x<0.||q.y<0.||q.x>uSize.x||q.y>uSize.y) return 0.;
  return texture2D(uTex,q/uSize*uUv,b-1.).a;
}
void main(){
  vec2 p=vec2(gl_FragCoord.x/uDpr,uRes.y-gl_FragCoord.y/uDpr);
  vec2 l=p-uOrigin;
  float dc=uD;                                     // the scroll's melt: sets the colour
  float d=max(uD,.04);                            // the shape: a little melted even at rest
  float raw=ink(l);
  // the melt line: a third of the way up the lowercase. Above it the word as set; below it the
  // letters soften, sag and sway into the flow, easing in from nothing at the line to the full flow
  // at their feet, so the word itself melts (as WILD's letters do) and runs on as ribbons
  float line=uYb-uEm*.32;
  float rib=0., fillA=0., dark=0.;
  float m=1.;                                      // the shape always melts (a little at rest)
  float mc=smoothstep(.02,.1,dc);                  // the colour waits for the scroll
  bool inMelt=m>0. && l.y>=line;
  if(inMelt){
    float depth=l.y-line, z=depth/uEm;
    float w=smoothstep(0.,uEm*.42,depth)*m;        // how far into the melt: none at the line, all by the feet
    // near the word it only ever melts a little (it stays the word); the flow further down keeps going
    float dd=mix(min(d,.22),d,smoothstep(uEm*.8,uEm*4.,depth));
    float cx=uSize.x*.5;
    // fanning out: the deeper, the wider the ribbons spread
    float s=mix(1.,1.+dd*(.22*z+.025*z*z),w);
    // the meander: broad swings growing with depth, neighbours swaying together but not in step
    float A=uEm*(.12+.88*dd)*min(.25+.22*z,4.)*w*mix(.12,1.,smoothstep(.04,.15,d)); // barely swaying at rest
    float dx=A*sin(z*.6+l.x*.003-uT*.35)+A*.3*sin(z*1.5-l.x*.008+uT*.25+1.3);
    float sx=cx+(l.x-cx-dx)/s;
    // the row it reads: the letter itself near the line, then their feet, carried down
    float feet=mix(uYb-uEm*.16,uYb-uEm*.03,.5+.45*sin(z*.6+l.x*.008));
    float sy=mix(l.y,feet,w);
    // swelling: each ribbon widens as it runs; late in the melt they swell into each other and fill
    // toward the foot, read from a softened copy so neighbours merge into one body without seams
    float late=smoothstep(.62,.94,d)*smoothstep(uEm*1.5,uEm*5.,depth); // the swelling and merging: well below the word
    float R=uEm*(mix(.026,.03,smoothstep(.04,.15,d))+dd*min(.05*z,.35)+late*min(.14*z,2.4)+late*late*late*z*.6)/s*w;
    // how far it has run: the letters' height at first, then down past the foot of the screen; each
    // ribbon at its own pace (some race ahead, some lag, as drips do), all past the foot at the end
    float reach=uRes.y-(uOrigin.y+line)+uEm*2.;
    float pace=.35+.65*(.5+.3*sin(sx*.13+1.1)+.2*sin(sx*.29+4.2));
    float run=d*d*(3.-2.*d);
    float len=(uYb-line)+uEm*mix(.06,.12,smoothstep(.04,.15,d))+reach*1.25*run*pace+late*reach;
    // a swollen, rounded head leading it
    float head=smoothstep(len-uEm*1.4,len-uEm*.35,depth)*w;
    float Rh=R*(1.+.9*head)+uEm*.05*head/s;
    float soft=late*3.2;
    float acc=0.;
    for(int i=-12;i<=12;i++){ acc=max(acc,inkSoft(vec2(sx+float(i)/12.*Rh,sy),soft)); }
    acc*=smoothstep(len,len-uEm*.3,depth);
    float th=mix(.5,.12,late);
    rib=smoothstep(th-.12,th+.12,acc);
    rib=mix(ink(l),rib,m);                          // the word as set, into the melt
    dark=smoothstep(uYb-line+uEm*.3,uYb-line+uEm*2.2,depth)*mc; // leaving the word in its grey, dark within a couple of lines
  }
  // where the flow collects at the foot, the last gaps close: a pool under the ribbons, its crisp edge
  // low and hidden in their mass, only at the end
  float pool=smoothstep(.75,1.,d);
  if(pool>0.){
    float edge=uRes.y+uEm-pool*pool*uRes.y*.38+uEm*.5*sin(p.x*.007+.6)+uEm*.3*sin(p.x*.019-1.2);
    fillA=max(fillA,smoothstep(edge-1.2,edge+1.2,p.y));
  }
  float melted=max(rib,fillA);
  // at rest the letters stay exactly as set, the little drips only added under them; once the scroll
  // melts it, the melted shape takes over
  float a=max(inMelt?raw*(1.-smoothstep(.0,.12,uD)):raw,melted);               // the word: as set above the line; melting below it
  float dk=max(dark*rib,fillA);
  vec3 col=mix(uColor,uInk,max(mc,clamp(dk/max(a,1e-3),0.,1.))); // the word turns dark as it starts to melt; the flow is dark end to end
  a*=uShow;
  gl_FragColor=vec4(col*a,a);
}`;

export default function Cd2Melt() {
  useEffect(() => {
    const cv = document.querySelector<HTMLCanvasElement>('.cd2-drips');
    const word = document.querySelector<HTMLElement>('.cd2-down .cd-wi');
    if (!cv || !word) return;
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('cd2 melt shader:', gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = {
      res: U('uRes'), dpr: U('uDpr'), origin: U('uOrigin'), size: U('uSize'), uv: U('uUv'), yb: U('uYb'),
      em: U('uEm'), d: U('uD'), t: U('uT'), color: U('uColor'), ink: U('uInk'), show: U('uShow'),
    };
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // the word into the texture's top left; its box in css px
    let ascent = 0, textW = 1, boxW = 1, boxH = 1, pad = 0, size = 16, k = 1, ready = false;
    const measure = () => {
      const cs = getComputedStyle(word);
      size = parseFloat(cs.fontSize) || 16;
      const off = document.createElement('canvas');
      off.width = TEX_W; off.height = TEX_H;
      const o = off.getContext('2d');
      if (!o) return;
      o.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      const m = o.measureText(word.textContent || '');
      ascent = m.fontBoundingBoxAscent;
      textW = m.width;
      pad = size * 0.6;
      boxW = textW + pad * 2;
      boxH = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
      k = Math.min((TEX_W - 4) / boxW, (TEX_H - 4) / boxH, 4);
      o.font = `${cs.fontWeight} ${size * k}px ${cs.fontFamily}`;
      o.fillStyle = '#000';
      o.fillText(word.textContent || '', pad * k, ascent * k);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off);
      gl.generateMipmap(gl.TEXTURE_2D); // its blurred copies, for the dark spreading at the end
      ready = true;
    };
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform1f(u.dpr, dpr);
    };
    fit();
    measure();
    document.fonts?.ready.then(measure);

    let raf = 0, hidden = false;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!ready || melt.show <= 0.01) {
        if (hidden) { word.style.color = ''; hidden = false; }
        return;
      }
      if (!hidden) { word.style.color = 'transparent'; hidden = true; } // the shader draws the word now
      const r0 = word.getBoundingClientRect();
      // while the lead's words rise in (cd2.css), draw the word at its place, fading in with its rise
      const ty = new DOMMatrixReadOnly(getComputedStyle(word).transform).m42;
      const rise = Math.min(1, Math.max(0, 1 - ty / Math.max(1, r0.height)));
      const r = { left: r0.left, top: r0.top - ty, width: r0.width, height: r0.height };
      const c = cv.getBoundingClientRect(); // the word's place on the canvas, which scrolls away at the end
      const sc = r.width / textW;
      gl.uniform2f(u.res, c.width, c.height);
      gl.uniform2f(u.origin, r.left - c.left - pad * sc, r.top - c.top);
      gl.uniform2f(u.size, boxW * sc, boxH * sc);
      gl.uniform2f(u.uv, (boxW * k) / TEX_W, (boxH * k) / TEX_H);
      gl.uniform1f(u.yb, ascent * sc);
      gl.uniform1f(u.em, size * sc);
      gl.uniform1f(u.d, melt.d);
      gl.uniform1f(u.t, 0); // it only moves with the scroll: still when the page is still
      gl.uniform3f(u.color, SOFT[0] / 255, SOFT[1] / 255, SOFT[2] / 255);
      gl.uniform3f(u.ink, INK[0] / 255, INK[1] / 255, INK[2] / 255);
      gl.uniform1f(u.show, melt.show * rise);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);
    const resize = () => { fit(); measure(); };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); word.style.color = ''; };
  }, []);
  return null;
}
