import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
const out = process.argv[2]; const only = process.argv[3];
// tone: per pixel → 0 (ink) .. 1 (paper); the subject kept, its ground cut to paper
const JOBS = [
  // a white chrysanthemum on black, whole with its stem: the black keyed to paper; the petals near paper, only
  // their shadows and the heart in dots (the reference's pale dahlia)
  { id: '5647343', name: 'flower', cx: 0.47, cy: 0.5, fit: 1, tone: `(r,g,b)=>{const l=(.299*r+.587*g+.114*b)/255; const m=Math.min(1,Math.max(0,(l-.09)/.1)); return 1-m*(.06+.75*Math.pow(Math.max(0,1-l),1.2));}` },
  // a dandelion opening on black (timelapse): the black keyed to paper, the bud and stem by their light
  { id: '37443245', name: 'dandelion', cx: 0.58, cy: 0.5, fit: 1, tone: `(r,g,b)=>{const l=(.299*r+.587*g+.114*b)/255; const m=Math.min(1,Math.max(0,(l-.06)/.1)); return 1-m*(1-Math.min(1,l*1.15));}` },
  // a white jellyfish trailing its tentacles through dark water (Mixkit 45404, 720p; free under the Mixkit license):
  // the blue keyed to paper (by its red, near none); the white bell and tentacles as light dots, their shade denser
  { id: 'mix45404', name: 'jelly', cx: 0.56, cy: 0.5, fit: 1, tone: `(r,g,b)=>{const m=Math.min(1,Math.max(0,(r-95)/60)); const l=(.299*r+.587*g+.114*b)/255; return 1-m*(.18+.7*Math.max(0,1-l));}` },
].filter(j => !only || j.name === only);
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('http://127.0.0.1:8765/');
for (const j of JOBS) {
  const b64 = await p.evaluate(async ({ id, cx, cy, fit, end = 1, flip = false, tone }) => {
    const f = eval(tone);
    const v = document.createElement('video'); v.src = 'v'+id+'.mp4'; v.muted = true; v.preload = 'auto';
    await new Promise(r => v.addEventListener('loadeddata', r, { once: true }));
    // 4:5 (640x800), cropped inside the frame around (cx, cy): `fit` is the crop's share of the frame's height
    const W = 640, H = 800, vw = v.videoWidth, vh = v.videoHeight;
    const sh = Math.min(vh, fit * vh, vw * H / W), sw = sh * W / H;
    const sx = Math.min(vw - sw, Math.max(0, cx * vw - sw / 2)), sy = Math.min(vh - sh, Math.max(0, cy * vh - sh / 2));
    const dw = W, dh = H, dy = 0;
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true });
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 1_800_000 });
    const chunks = []; rec.ondataavailable = e => chunks.push(e.data);
    const frame = () => {
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
      x.save(); if (flip) { x.translate(0, H); x.scale(1, -1); } x.drawImage(v, sx, sy, sw, sh, 0, dy, dw, dh); x.restore();
      const im = x.getImageData(0, 0, W, H), d = im.data;
      const bg = (.299 * d[(8 * W + 8) * 4] + .587 * d[(8 * W + 8) * 4 + 1] + .114 * d[(8 * W + 8) * 4 + 2]) / 255; // the ground's tone, at a corner
      const y0 = dy, y1 = dy + dh, F = 64; // the clip's own rows only; the padding left as paper
      for (let i = 0; i < d.length; i += 4) {
        const px = (i >> 2) % W, py = (i >> 2) / W | 0;
        let t = 1;
        if (py >= y0 && py < y1) {
          t = f(d[i], d[i+1], d[i+2], bg); // hard edges: no feather
        }
        d[i] = d[i+1] = d[i+2] = Math.round(255 * t);
      }
      x.putImageData(im, 0, 0);
    };
    frame(); rec.start();
    await new Promise(res => {
      const stopAt = v.duration * end;
      const step = () => { frame(); if (v.currentTime >= stopAt) { v.pause(); res(); } else if (!v.ended) v.requestVideoFrameCallback(step); };
      v.requestVideoFrameCallback(step); v.play(); v.addEventListener('ended', res, { once: true });
    });
    rec.stop(); await new Promise(r => rec.onstop = r);
    const buf = await new Blob(chunks, { type: 'video/webm' }).arrayBuffer();
    let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
    return btoa(s);
  }, j);
  writeFileSync(out + '/' + j.name + '.webm', Buffer.from(b64, 'base64')); console.log(j.name, Math.round(b64.length * .75 / 1024) + 'K');
}
await b.close();
