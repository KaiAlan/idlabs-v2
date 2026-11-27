# The covers of /careers/head-of-growth and /careers/thinker-writer: a stock clip baked to a grey tone map (0 ink .. 1 paper)
# for DitherClip, 960 wide, played forward then back so the loop is seamless; then re-encoded small in
# Chromium (MediaRecorder, VP9 at 650 kbps), as OpenCV's VP8 has no bitrate control.
#   hydrangea: Pexels 38695092, white hydrangeas on a dark ground   args: 0.15 1.0 2 dark
#   spike:     Pexels 856019, a white flowering spike on blue          args: 0 1.0 1 blue 0.15 0.65 (no longer used)
#   roses:     Pexels 12142444, a row of long-stemmed roses on black   args: 0 1.0 1 black
# python3 scripts/bake-careers-wide.py <src.mp4> <out.webm> <check.png> <y0> <y1> <every nth frame> <dark|blue> [t0 t1]
import cv2, numpy as np, sys, os
src, out, chk, y0f, y1f, step, mode = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), float(sys.argv[5]), int(sys.argv[6]), sys.argv[7]
t0f, t1f = (float(sys.argv[8]), float(sys.argv[9])) if len(sys.argv) > 9 else (0.0, 1.0)  # the stretch of the clip to keep
c = cv2.VideoCapture(src)
n = int(c.get(cv2.CAP_PROP_FRAME_COUNT)); W0, H0 = int(c.get(3)), int(c.get(4))
y0, y1 = int(H0 * y0f), int(H0 * y1f)
OW = 960; OH = int(round(OW * (y1 - y0) / W0 / 2) * 2)
frames = []
for i in range(n):
    if not c.grab(): break
    if i % step or i < n * t0f or i > n * t1f: continue
    ok, fr = c.retrieve()
    fr = cv2.resize(fr[y0:y1], (OW, OH), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    b, g, r = fr[..., 0], fr[..., 1], fr[..., 2]
    l = 0.299 * r + 0.587 * g + 0.114 * b
    if mode == 'black':  # a true black ground (as the orchid): a low key keeps the dark stems
        m = np.clip((l - 0.09) / 0.1, 0, 1)
        t = 1 - m * (0.06 + 0.75 * np.power(np.clip(1 - l, 0, 1), 1.2))
    elif mode == 'dark':   # white blooms on a dark ground: the ground keyed to paper
        m = np.clip((l - 0.2) / 0.12, 0, 1)
        t = 1 - m * (0.08 + 0.75 * np.power(np.clip(1 - l, 0, 1), 1.2))
    else:                # white on blue: keyed by the red channel (the blue has next to none)
        m = np.clip((r * 255 - 115) / 50, 0, 1)  # firm: the blue goes fully to paper
        t = 1 - m * (0.5 + 0.45 * np.clip(1 - l, 0, 1))  # the spray mid-grey at least, so it reads under the lightening tone
    gg = (t * 255).round().astype(np.uint8)
    frames.append(cv2.merge([gg, gg, gg]))
seq = frames + frames[-2:0:-1]
w = cv2.VideoWriter(out, cv2.VideoWriter_fourcc(*'VP80'), 25, (OW, OH))
for f in seq: w.write(f)
w.release()
cv2.imwrite(chk, np.vstack([frames[0], frames[len(frames) // 2], frames[-1]]))
print(os.path.basename(out), OW, OH, len(seq), round(len(seq) / 25, 1), 's')
