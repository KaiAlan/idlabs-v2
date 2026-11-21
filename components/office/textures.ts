import * as THREE from 'three';

/* Procedural canvas textures for the /office building. Every texture is drawn once
   at load, seeded, so the facade looks the same on every visit. All are "per metre":
   the geometry's UVs are in metres (see worldUV in build.ts), so `repeat` = 1 / tile size. */

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function tex(c: HTMLCanvasElement, metres: [number, number], srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / metres[0], 1 / metres[1]);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, r: () => number) {
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * amount;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

/* Stone cladding: large light-grey slabs, 0.6 x 0.3 m, staggered, each a slightly different tone. */
export function stoneTexture() {
  const r = rng(11);
  const [c, ctx] = canvas(1024, 1024); // 2.4 m x 2.4 m
  const ppm = 1024 / 2.4;
  const tw = 0.6 * ppm, th = 0.3 * ppm;
  ctx.fillStyle = '#8d8d8a';
  ctx.fillRect(0, 0, 1024, 1024);
  for (let row = 0; row * th < 1024; row++) {
    const off = row % 2 ? tw / 2 : 0;
    for (let x = -off; x < 1024; x += tw) {
      const v = 150 + r() * 30;
      ctx.fillStyle = `rgb(${v},${v - 1},${v - 4})`;
      ctx.fillRect(x + 2, row * th + 2, tw - 4, th - 4);
      // soft mottling inside each slab
      for (let k = 0; k < 40; k++) {
        const a = 0.04 + r() * 0.05;
        ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(60,60,55,${a})`;
        ctx.beginPath();
        ctx.ellipse(x + r() * tw, row * th + r() * th, 4 + r() * 22, 3 + r() * 10, r() * 3, 0, 7);
        ctx.fill();
      }
    }
  }
  grain(ctx, 1024, 1024, 26, r);
  return tex(c, [2.4, 2.4]);
}

/* Smooth light concrete / render for the low walls and the soffit. */
export function concreteTexture(base = 178) {
  const r = rng(base);
  const [c, ctx] = canvas(512, 512);
  ctx.fillStyle = `rgb(${base},${base},${base - 2})`;
  ctx.fillRect(0, 0, 512, 512);
  for (let k = 0; k < 260; k++) {
    const a = 0.02 + r() * 0.04;
    ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(40,40,40,${a})`;
    ctx.beginPath();
    ctx.ellipse(r() * 512, r() * 512, 10 + r() * 60, 6 + r() * 30, r() * 3, 0, 7);
    ctx.fill();
  }
  grain(ctx, 512, 512, 18, r);
  return tex(c, [3, 3]);
}

/* Warm timber for the slats: vertical grain. */
export function woodTexture() {
  const r = rng(5);
  const [c, ctx] = canvas(256, 1024); // 0.25 m x 1 m
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, '#a36b3f');
  g.addColorStop(0.5, '#b67a49');
  g.addColorStop(1, '#9c6438');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 1024);
  for (let k = 0; k < 90; k++) {
    let x = r() * 256;
    ctx.strokeStyle = r() > 0.5 ? `rgba(70,35,15,${0.1 + r() * 0.2})` : `rgba(230,170,110,${0.08 + r() * 0.12})`;
    ctx.lineWidth = 0.5 + r() * 2.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= 1024; y += 32) {
      x += (r() - 0.5) * 3;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  grain(ctx, 256, 1024, 14, r);
  return tex(c, [0.25, 1]);
}

/* Interior oak floor boards. */
export function floorTexture() {
  const r = rng(77);
  const [c, ctx] = canvas(1024, 1024); // 2 m x 2 m, boards 0.2 m wide, 1-2 m long
  const ppm = 512;
  for (let col = 0; col < 10; col++) {
    let y = -r() * ppm;
    while (y < 1024) {
      const len = (1 + r()) * ppm;
      const v = r();
      ctx.fillStyle = `rgb(${196 + v * 20},${160 + v * 18},${118 + v * 14})`;
      ctx.fillRect(col * 0.2 * ppm, y, 0.2 * ppm - 2, len - 2);
      for (let k = 0; k < 14; k++) {
        ctx.strokeStyle = `rgba(110,70,35,${0.05 + r() * 0.1})`;
        ctx.lineWidth = 1;
        const x = col * 0.2 * ppm + r() * 0.2 * ppm;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (r() - 0.5) * 6, y + len);
        ctx.stroke();
      }
      y += len;
    }
  }
  grain(ctx, 1024, 1024, 10, r);
  return tex(c, [2, 2]);
}

/* Portuguese-style cobbles for the forecourt: small irregular grey setts. */
export function cobbleTexture() {
  const r = rng(3);
  const [c, ctx] = canvas(1024, 1024); // 1.5 m square
  ctx.fillStyle = '#5b5b58';
  ctx.fillRect(0, 0, 1024, 1024);
  const s = 26;
  for (let y = 0; y < 1024 + s; y += s * 0.85) {
    for (let x = 0; x < 1024 + s; x += s * 0.9) {
      const v = 150 + r() * 80;
      ctx.fillStyle = `rgb(${v},${v},${v - 6})`;
      ctx.beginPath();
      ctx.ellipse(x + (r() - 0.5) * 8, y + (r() - 0.5) * 8, s * (0.36 + r() * 0.12), s * (0.3 + r() * 0.12), r() * 3, 0, 7);
      ctx.fill();
    }
  }
  grain(ctx, 1024, 1024, 30, r);
  return tex(c, [1.5, 1.5]);
}

/* Worn asphalt with lighter patched areas and a few cracks. */
export function asphaltTexture() {
  const r = rng(9);
  const [c, ctx] = canvas(1024, 1024); // 8 m square
  ctx.fillStyle = '#77736e';
  ctx.fillRect(0, 0, 1024, 1024);
  for (let k = 0; k < 50; k++) {
    ctx.fillStyle = r() > 0.4 ? `rgba(190,186,180,${0.05 + r() * 0.08})` : `rgba(60,58,56,${0.05 + r() * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(r() * 1024, r() * 1024, 40 + r() * 200, 20 + r() * 80, r() * 3, 0, 7);
    ctx.fill();
  }
  for (let k = 0; k < 18; k++) {
    ctx.strokeStyle = `rgba(25,25,25,${0.3 + r() * 0.3})`;
    ctx.lineWidth = 1 + r() * 1.5;
    let x = r() * 1024, y = r() * 1024;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < 12; i++) {
      x += (r() - 0.5) * 60;
      y += (r() - 0.3) * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  grain(ctx, 1024, 1024, 46, r);
  return tex(c, [8, 8]);
}

/* A cluster of leaves on transparent ground, for the alpha-tested foliage cards. */
export function leafTexture(hue: [number, number, number], seed = 1) {
  const r = rng(seed);
  const [c, ctx] = canvas(256, 256);
  for (let k = 0; k < 70; k++) {
    const x = 128 + (r() - 0.5) * 190 * Math.sqrt(r());
    const y = 128 + (r() - 0.5) * 190 * Math.sqrt(r());
    const l = 0.75 + r() * 0.5;
    ctx.fillStyle = `rgb(${hue[0] * l | 0},${hue[1] * l | 0},${hue[2] * l | 0})`;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r() * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 + r() * 10, 5 + r() * 4, 0, 0, 7);
    ctx.fill();
    ctx.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* The sign on the glass: "Identity Labs" in white, set in the site's serif. */
export function signTexture(text: string, font: string) {
  const [c, ctx] = canvas(1024, 256);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 160px ${font}`;
  ctx.fillText(text, 512, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* The meeting-room screen: a paused edit of the client's launch film, drawn each frame
   by the caller through `draw(t)`. */
export function screenCanvas() {
  const [c, ctx] = canvas(960, 540);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const draw = (time: number) => {
    const g = ctx.createLinearGradient(0, 0, 960, 540);
    const h = (time * 8) % 360;
    g.addColorStop(0, `hsl(${(h + 330) % 360},80%,62%)`);
    g.addColorStop(0.5, `hsl(${(h + 15) % 360},85%,60%)`);
    g.addColorStop(1, `hsl(${(h + 260) % 360},70%,55%)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 960, 540);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = '64px "Instrument Serif", serif';
    ctx.textAlign = 'center';
    ctx.fillText('Build it in a weekend.', 480, 250);
    ctx.font = '22px "IBM Plex Mono", monospace';
    ctx.fillText('LOVABLE — LAUNCH FILM — CUT 03', 480, 300);
    // scrubber
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 490, 960, 50);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(40, 512, 880, 4);
    const p = (time * 0.05) % 1;
    ctx.fillStyle = '#fff';
    ctx.fillRect(40, 512, 880 * p, 4);
    ctx.beginPath();
    ctx.arc(40 + 880 * p, 514, 8, 0, 7);
    ctx.fill();
    t.needsUpdate = true;
  };
  draw(0);
  return { texture: t, draw };
}
