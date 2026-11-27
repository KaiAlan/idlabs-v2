# The /exp/careers-cd cover: Pexels 29999015 (an orchid sprig blooming on black, 3840x2160, free license)
# baked to a grey tone map (0 ink .. 1 paper, the black keyed to paper) for DitherClip: a wide band around
# the sprig, every 3rd frame, 960 wide, played forward then back so the loop is seamless; then re-encoded in
# Chromium (MediaRecorder, VP9 at 650 kbps) to ~2.6MB, as OpenCV's VP8 has no bitrate control.
# python3 scripts/bake-careers-branch.py <v29999015.mp4> <out.webm> <check.png>
import cv2, numpy as np, sys, os
src, out, chk = sys.argv[1:]
c = cv2.VideoCapture(src)
n = int(c.get(cv2.CAP_PROP_FRAME_COUNT)); W0, H0 = int(c.get(3)), int(c.get(4))
y0, y1 = int(H0 * 0.08), int(H0 * 0.92)
OW = 960; OH = int(round(OW * (y1 - y0) / W0 / 2) * 2)
frames = []
for i in range(n):
    ok = c.grab()
    if not ok: break
    if i % 3: continue
    ok, fr = c.retrieve()
    fr = cv2.resize(fr[y0:y1], (OW, OH), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    l = 0.299 * fr[..., 2] + 0.587 * fr[..., 1] + 0.114 * fr[..., 0]
    m = np.clip((l - 0.09) / 0.1, 0, 1)
    t = 1 - m * (0.06 + 0.75 * np.power(np.clip(1 - l, 0, 1), 1.2))
    g = (t * 255).round().astype(np.uint8)
    frames.append(cv2.merge([g, g, g]))
seq = frames + frames[-2:0:-1]
w = cv2.VideoWriter(out, cv2.VideoWriter_fourcc(*'VP80'), 25, (OW, OH))
for f in seq: w.write(f)
w.release()
cv2.imwrite(chk, np.vstack([frames[0], frames[len(frames) // 2], frames[-1]]))
print(OW, OH, len(seq), 'frames', round(len(seq) / 25, 1), 's', os.path.getsize(out) // 1024, 'K')
