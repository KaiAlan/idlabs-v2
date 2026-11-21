import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { buildOffice, type Built } from './build';
import { sky } from './assets';

/* The camera's route, keyed to scroll progress p (0..1) through the pinned section.
   A Catmull-Rom spline through the positions and another through the look targets;
   each key's p says where along the scroll the camera reaches it.
   Phases: across the road (the card grows to full screen) → up the forecourt to the steps →
   through the sliding doors → the lobby → the double-height hall → round to the meeting table. */
type Key = { p: number; pos: [number, number, number]; look: [number, number, number]; fov: number };
const KEYS: Key[] = [
  { p: 0.0, pos: [0.6, 1.5, 26], look: [0.6, 4.4, 0], fov: 33 },
  { p: 0.2, pos: [0.2, 1.6, 22], look: [-0.2, 3.9, 0], fov: 35 },
  { p: 0.42, pos: [-3.6, 1.9, 10], look: [-4.4, 1.9, -2], fov: 44 },
  { p: 0.56, pos: [-4.49, 2.0, 2.2], look: [-4.49, 1.8, -6], fov: 54 },
  // through the lobby, under the mezzanine
  { p: 0.66, pos: [-4.4, 2.0, -3.2], look: [-3.4, 2.4, -12], fov: 60 },
  // out into the hall: the height opens up, the skylights, the bookcase, the garden
  { p: 0.77, pos: [-3.4, 2.5, -6.9], look: [-0.2, 3.9, -16], fov: 62 },
  // round to the table
  { p: 0.89, pos: [-0.3, 2.2, -8.1], look: [-2.4, 1.4, -11.6], fov: 52 },
  { p: 1.0, pos: [0.7, 1.95, -9.4], look: [-2.5, 1.3, -11.3], fov: 46 },
];

const DOOR_OPEN = [0.46, 0.58]; // the leaves slide apart over this stretch of scroll
// where the sun sits, seen from the building: low, on the left and out over the street, so golden
// light rakes across the facade and everything throws a long shadow to the right
const SUN_AZIMUTH = Math.atan2(0.75, -1); // atan2(z, x) of the direction towards the sun
const SUN_MIN_ELEVATION = THREE.MathUtils.degToRad(8);

/* Golden-hour grade, in linear light before tone mapping: warm the mids and highlights,
   keep the shadows a little cool, add a touch of contrast. */
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float amount; varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
      vec3 warm = c.rgb * vec3(1.12, 0.98, 0.82);
      vec3 cool = c.rgb * vec3(0.95, 0.98, 1.06);
      vec3 g = mix(cool, warm, smoothstep(0.02, 0.5, l));
      g = mix(vec3(l), g, 1.08); // a little more saturation
      gl_FragColor = vec4(mix(c.rgb, g, amount), c.a);
    }`,
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export class OfficeScene {
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private gtao: GTAOPass;
  private grade: ShaderPass;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, 0.05, 1200);
  private posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal');
  private lookCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.look)), false, 'centripetal');
  private built?: Built;
  private target = 0; // scroll progress, as set
  private p = 0; // eased progress, what is drawn
  private last = performance.now();
  private t = 0;
  private paused = false;
  private disposed = false;
  ready: Promise<void>;

  constructor(private canvas: HTMLCanvasElement) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }));
    r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.08;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    // the street is static: draw its shadows once (the Reflector would otherwise redo them every frame)
    r.shadowMap.autoUpdate = false;

    this.composer = new EffectComposer(r, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }));
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.gtao = new GTAOPass(this.scene, this.camera, 1, 1);
    this.gtao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.5, thickness: 1.2, scale: 1.1, samples: 16 });
    this.gtao.blendIntensity = 0.9;
    this.composer.addPass(this.gtao);
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.12, 0.4, 1.1));
    this.grade = new ShaderPass(GradeShader);
    this.composer.addPass(this.grade);
    this.composer.addPass(new OutputPass());
    this.composer.addPass(new SMAAPass());

    this.resize();
    this.ready = this.load();
  }

  private async load() {
    const s = this.scene;
    const { texture, sun: sunDir } = await sky();
    // turn the sky so its sun sits where we want it; light, background and reflections agree
    const turn = Math.atan2(sunDir.z, sunDir.x) - SUN_AZIMUTH;
    s.background = texture;
    s.environment = texture;
    s.backgroundRotation.set(0, turn, 0);
    s.environmentRotation.set(0, turn, 0);
    s.environmentIntensity = 0.5;
    s.fog = new THREE.Fog(0xe0b493, 70, 420); // warm evening haze
    const dir = sunDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), turn);
    const el = Math.max(SUN_MIN_ELEVATION, Math.asin(dir.y));
    const h = Math.hypot(dir.x, dir.z);
    dir.set((dir.x / h) * Math.cos(el), Math.sin(el), (dir.z / h) * Math.cos(el));

    const sun = new THREE.DirectionalLight(0xff9650, 6.5);
    sun.position.copy(dir).multiplyScalar(80).add(new THREE.Vector3(0, 0, 4));
    sun.target.position.set(0, 0, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    const sc = sun.shadow.camera;
    sc.left = -45; sc.right = 45; sc.top = 45; sc.bottom = -45; sc.near = 1; sc.far = 200;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    s.add(sun, sun.target);

    this.built = await buildOffice(s, this.renderer.domElement.width);
    this.renderer.shadowMap.needsUpdate = true;
    this.p = this.target;
    this.renderer.setAnimationLoop(() => this.frame());
  }

  setProgress(p: number) {
    this.target = Math.min(1, Math.max(0, p));
  }

  /* Jump straight to p, skipping the easing (screenshots, tests). */
  jump(p: number) {
    this.setProgress(p);
    this.p = this.target;
  }

  /* Stop drawing while nothing of the canvas is seen. */
  setPaused(paused: boolean) {
    this.paused = paused;
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
  }

  /* Render one frame at p and return it as a JPEG data URL, with the loop held
     (scripts/office-shots: software WebGL is far too slow to screenshot a running loop). */
  capture(p: number, time = 4) {
    this.paused = true;
    this.jump(p);
    this.t = time;
    this.step(0);
    return this.canvas.toDataURL('image/jpeg', 0.9);
  }

  private frame() {
    if (this.disposed || !this.built || this.paused) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.step(dt);
  }

  private step(dt: number) {
    if (!this.built) return;
    const t = (this.t += dt);
    // ease towards the scroll position so wheel steps glide
    this.p += (this.target - this.p) * (1 - Math.exp(-dt * 6));
    const p = this.p;

    // where along the keys are we
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
    const f = Math.min(1, Math.max(0, (p - KEYS[i].p) / (KEYS[i + 1].p - KEYS[i].p)));
    const u = (i + f) / (KEYS.length - 1);
    const cam = this.camera;
    this.posCurve.getPoint(u, cam.position);
    const look = this.lookCurve.getPoint(u);
    // gentle hand-held drift
    cam.position.x += Math.sin(t * 0.5) * 0.015;
    cam.position.y += Math.sin(t * 0.7) * 0.01;
    cam.lookAt(look);
    // keep the whole building in frame on narrow (portrait) screens: hold the horizontal field of view
    let fov = KEYS[i].fov + (KEYS[i + 1].fov - KEYS[i].fov) * f;
    const minAspect = 1.5;
    if (cam.aspect < minAspect) {
      const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov) / 2) * minAspect);
      fov = Math.min(95, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hfov / 2) / cam.aspect)) * (1 - smooth(0.6, 0.75, p) * 0.35));
    }
    cam.fov = fov;
    cam.updateProjectionMatrix();

    const b = this.built;
    const open = smooth(DOOR_OPEN[0], DOOR_OPEN[1], p);
    b.doors[0].position.x = b.doorX[0] - open * 0.92;
    b.doors[1].position.x = b.doorX[1] + open * 0.92;
    // inside, the facade's mirror is behind us: skip its extra render
    b.reflector.visible = cam.position.z > -1.5;
    // ambient occlusion matters most indoors and up close; skip it across the road
    this.gtao.enabled = cam.position.z < 12;
    // the grade belongs to the street at sunset; indoors it eases off
    this.grade.uniforms.amount.value = 1 - smooth(-2, -6, cam.position.z) * 0.6;
    for (const tr of b.trees) tr.update(t);

    // the conversation: the CEO, the CD and the editor take turns; everyone else looks at
    // whoever is talking, the speaker looks at the CEO or the CD, the editor points at the cut
    const [ceo, , cd, , editor] = b.people;
    const turn = Math.floor(t / 3.6) % 3;
    const speaker = [ceo, cd, editor][turn];
    const head = (q: typeof ceo) => q.root.position.clone().setY(q.root.position.y + (q === editor ? 1.6 : 1.2));
    for (const person of b.people.slice(0, 5)) {
      person.speaking = person === speaker;
      const target = person === speaker
        ? (person === ceo ? head(cd) : person === cd ? head(ceo) : head(ceo).lerp(head(cd), 0.5))
        : speaker === editor && Math.sin(t * 0.7) > 0 ? b.screenPoint : head(speaker);
      person.lookAt.lerp(target, 1 - Math.exp(-dt * 3));
      person.gesture += ((person.speaking ? 1 : 0) - person.gesture) * (1 - Math.exp(-dt * 3));
      person.pointAt = person === editor && person.speaking ? b.screenPoint : undefined;
      person.update(t);
    }
    for (const person of b.people.slice(5)) person.update(t);
    b.screen.draw(t);

    this.composer.render(dt);
  }

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
        mat.dispose();
      }
    });
    this.composer.dispose();
    this.renderer.dispose();
  }
}
