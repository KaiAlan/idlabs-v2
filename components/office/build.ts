import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { Tree } from '@dgreenheck/ez-tree';
import { rng, leafTexture, signTexture, type screenCanvas } from './textures';
import { pbr, polyModel, fit, gltf } from './assets';
import type { Person } from './people';
import { B, ground, worldBox, v } from './geom';
import { neighbours } from './neighbours';
import { interior } from './interior';

/* The /office scene, modelled on the reference render (a two-storey studio: a mirrored glass box
   on stone piers over a timber-slatted ground floor, garage on the right, living wall, cobbled forecourt).

   Units are metres. Measurements come off the 960 x 1200 reference at about 45 px a metre:
   x = (px - 480) / 45, y = (780 - py) / 45. The glass face is z = 0, the street is +z,
   the camera starts across the road. The ground floor is set back to z = -1.8,
   and its interior (the meeting room) runs back to z = -12 at floor level y = 0.45. */

export const FLOOR = 0.45; // interior / entrance landing level

/* Place a loaded model: fitted to `size` on `axis`, at (x, y, z), turned by yaw. */
async function place(parent: THREE.Object3D, id: string, axis: 'x' | 'y' | 'z', size: number, x: number, y: number, z: number, yaw = 0) {
  const { object, size: s } = fit(await polyModel(id), axis, size);
  object.position.set(x, y, z);
  object.rotation.y = yaw;
  parent.add(object);
  return { object, size: s };
}

/* Leaf cards filling a box (the living wall's backing layer). */
function leafWall(parent: THREE.Object3D, centre: THREE.Vector3, half: THREE.Vector3, count: number, seed: number) {
  const r = rng(seed);
  const material = new THREE.MeshStandardMaterial({
    map: leafTexture([72, 128, 46], seed), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.75,
  });
  const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.42, 0.42), material, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    p.set(centre.x + (r() * 2 - 1) * half.x, centre.y + (r() * 2 - 1) * half.y, centre.z + (r() * 2 - 1) * half.z);
    q.setFromEuler(e.set(r() * Math.PI, r() * Math.PI, r() * Math.PI));
    const k = 0.7 + r() * 0.6;
    m.compose(p, q, s.set(k, k, k));
    mesh.setMatrixAt(i, m);
    const l = 0.65 + r() * 0.5;
    mesh.setColorAt(i, c.setRGB(l, l, l));
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
}

/* A procedural tree (ez-tree), scaled to `height` metres. Kept for the wind animation. */
function tree(parent: THREE.Object3D, preset: string, x: number, z: number, height: number, seed: number) {
  const t = new Tree();
  t.loadPreset(preset);
  t.options.seed = seed;
  t.generate();
  const box = new THREE.Box3().setFromObject(t);
  t.scale.setScalar(height / (box.max.y - box.min.y));
  t.position.set(x, 0, z);
  t.rotation.y = seed;
  t.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  parent.add(t);
  return t;
}

/* The car: the three.js examples' Ferrari 458, repainted. Front is +z. */
async function car(parent: THREE.Object3D, paint: number, x: number, z: number, yaw: number) {
  const g = await gltf('ferrari.glb');
  const model = g.scene.clone(true);
  const body = new THREE.MeshPhysicalMaterial({ color: paint, metalness: 0.9, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.03 });
  const details = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 1, roughness: 0.4 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x0b0d10, metalness: 0.3, roughness: 0.02, transparent: true, opacity: 0.75 });
  (model.getObjectByName('body') as THREE.Mesh).material = body;
  for (const n of ['rim_fl', 'rim_fr', 'rim_rr', 'rim_rl', 'trim']) {
    const o = model.getObjectByName(n) as THREE.Mesh | undefined;
    if (o) o.material = details;
  }
  (model.getObjectByName('glass') as THREE.Mesh).material = glass;
  model.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // the baked contact shadow that ships with the model
  const ao = new THREE.TextureLoader().load('/office/assets/models/ferrari_ao.png');
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: ao, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true, premultipliedAlpha: true }),
  );
  shadow.renderOrder = 2;
  shadow.position.y = 0.01;
  model.add(shadow);
  model.position.set(x, 0, z);
  model.rotation.y = yaw;
  parent.add(model);
}

// ---------------------------------------------------------------------------------------------

export type Built = {
  doors: THREE.Object3D[];
  doorX: number[];
  reflector: Reflector;
  people: Person[];
  trees: Tree[];
  screen: ReturnType<typeof screenCanvas>;
  screenPoint: THREE.Vector3;
};

export async function buildOffice(scene: THREE.Scene, pixelWidth: number): Promise<Built> {
  await Promise.all([
    document.fonts.load('600 160px "Source Serif 4"'),
    document.fonts.load('64px "Instrument Serif"'),
    document.fonts.load('22px "IBM Plex Mono"'),
  ]).catch(() => undefined);
  RectAreaLightUniformsLib.init();

  // materials: Poly Haven scans, at their real-world scale
  const stone = pbr('stone', 2.4, { color: 0xd6d6d2 });
  const render = pbr('render', 2.5, { color: 0xb9b9b6 });
  const concrete = pbr('concrete', 2, { color: 0xe4e2dc });
  const asphalt = pbr('asphalt', 4, { color: 0xcfcac4 });
  const cobble = pbr('cobble', 1.4, { color: 0xd9d7d0 });
  const floorMat = pbr('floor', 2.2, { envMapIntensity: 0.5 });
  const teak = pbr('teak', 1, { color: 0xffe2c4, roughness: 0.6 });
  const soffit = new THREE.MeshStandardMaterial({ color: 0xdedbd4, roughness: 0.9 });
  const fascia = new THREE.MeshStandardMaterial({ color: 0x35373a, roughness: 0.45, metalness: 0.5 });
  const frame = new THREE.MeshStandardMaterial({ color: 0x1f2124, roughness: 0.35, metalness: 0.7 });
  const darkBack = new THREE.MeshStandardMaterial({ color: 0x241d18, roughness: 0.9 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f2ef, roughness: 0.6 });
  const led = new THREE.MeshStandardMaterial({ color: 0xffe2b8, emissive: 0xffd49a, emissiveIntensity: 3 });
  const verge = new THREE.MeshStandardMaterial({ color: 0x4f5a39, roughness: 1 });
  const entranceGlass = new THREE.MeshPhysicalMaterial({
    color: 0x2a3036, metalness: 0.1, roughness: 0.03, transparent: true, opacity: 0.32, envMapIntensity: 1.4, depthWrite: false,
  });

  const g = new THREE.Group();
  scene.add(g);
  const pending: Promise<unknown>[] = [];

  // --- street and forecourt
  ground(g, asphalt, -120, 120, 6, 140);
  B(g, concrete, -120, 120, 0, 0.13, 5.72, 6.05, false); // kerb
  ground(g, cobble, -12, 11, -6.2, 5.72, 0.005);
  ground(g, verge, -120, 120, -80, 5.72, -0.01); // under everything; pavements and gardens sit on it

  // --- left: low rendered wall with three small wall lights
  B(g, render, -10.1, -7.4, 0, 3.9, -4, 0.6);
  for (const x of [-9.6, -8.9, -8.2]) B(g, frame, x, x + 0.12, 1.0, 1.08, 0.6, 0.66, false);

  // --- piers (stone), capped
  B(g, stone, -7.4, -6.6, 0, 7.6, -6, 0.45);
  B(g, fascia, -7.45, -6.55, 7.6, 7.68, -6.05, 0.5);
  B(g, stone, 6.58, 7.67, 0, 7.7, -6, 0.45);
  B(g, fascia, 6.53, 7.72, 7.7, 7.78, -6.05, 0.5);

  // --- the glass box: one planar mirror, desaturated and darkened (smoked glass), mullions in front
  // ReflectorShader is a static the types don't declare
  const baseShader = (Reflector as unknown as { ReflectorShader: { fragmentShader: string } }).ReflectorShader;
  const smoked = {
    ...baseShader,
    fragmentShader: baseShader.fragmentShader.replace(
      'gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',
      'vec3 c = base.rgb; float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); gl_FragColor = vec4(mix(vec3(l), c, 0.5) * color, 1.0);',
    ),
  };
  const reflector = new Reflector(new THREE.PlaneGeometry(11.98, 4.78), {
    shader: smoked,
    color: 0x7c8794,
    textureWidth: Math.min(2048, pixelWidth),
    textureHeight: Math.min(2048, Math.round(pixelWidth * 0.4)),
    clipBias: 0.003,
  });
  reflector.position.set(-0.61, 4.88, 0);
  g.add(reflector);
  const cols = [-6.6, -5.44, -3.89, -2.29, -0.73, 0.82, 2.33, 3.89, 5.38];
  const rows = [2.5, 4.18, 5.44, 7.27];
  for (const x of cols) B(g, frame, x - 0.03, x + 0.03, 2.5, 7.27, -0.02, 0.06, false);
  for (const y of rows) B(g, frame, -6.6, 5.38, y - 0.03, y + 0.03, -0.02, 0.06, false);
  B(g, fascia, -6.6, 5.38, 7.27, 7.36, -6, 0.08); // roof edge
  B(g, fascia, -6.6, 5.38, 2.26, 2.5, -0.25, 0.06); // underside fascia
  B(g, led, -6.6, 5.38, 2.245, 2.26, -0.2, -0.05, false); // the warm light line under the box
  B(g, fascia, -6.6, 5.38, 7.18, 7.27, -6, -0.05); // roof slab

  // the client's name on the glass (a set wordmark; swap in their logo file when we have it)
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.9, 0.72),
    new THREE.MeshBasicMaterial({ map: signTexture('Wispr Flow', '"Source Serif 4", serif'), transparent: true, toneMapped: false }),
  );
  sign.position.set(3.85, 3.15, 0.03);
  g.add(sign);

  // --- slatted timber: upper right panel and the ground floor
  function slats(x0: number, x1: number, y0: number, y1: number, z: number) {
    B(g, darkBack, x0, x1, y0, y1, z - 0.12, z - 0.02);
    const w = 0.045, gap = 0.03;
    const n = Math.floor((x1 - x0) / (w + gap));
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(w, y1 - y0, 0.05), teak, n);
    const m = new THREE.Matrix4();
    const r = rng(Math.round(x0 * 100));
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      m.makeTranslation(x0 + gap / 2 + w / 2 + i * (w + gap), (y0 + y1) / 2, z + 0.005);
      mesh.setMatrixAt(i, m);
      const l = 0.88 + r() * 0.2;
      mesh.setColorAt(i, c.setRGB(l, l * 0.97, l * 0.94));
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
  }
  slats(5.38, 6.58, 2.5, 6.9, -0.15);
  slats(-3.47, 1.67, 0, 2.26, -1.8);

  B(g, stone, -6.6, -5.44, 0, 2.26, -6, -1.0); // ground floor, left of the entrance

  // soffits under the box, with downlights
  B(g, soffit, -6.6, 1.67, 2.18, 2.26, -1.85, 0.0, false);
  B(g, soffit, 1.67, 6.58, 2.18, 2.26, -6, 0.0, false);
  for (const [x, z] of [[-4.5, -0.9], [-2, -0.9], [0.5, -0.9], [3, -1.5], [5.2, -1.5], [3, -4], [5.2, -4]])
    B(g, led, x - 0.08, x + 0.08, 2.17, 2.18, z - 0.08, z + 0.08, false);

  // --- entrance: landing, steps, low wall, planter, railing
  B(g, concrete, -5.44, -0.55, 0, FLOOR, -1.85, -0.4);
  B(g, concrete, -5.1, -1.6, 0, 0.3, -0.4, 0.2);
  B(g, concrete, -5.1, -1.6, 0, 0.15, 0.2, 0.8);
  B(g, concrete, -5.44, -5.1, 0, 0.8, -1.85, 1.2);
  B(g, concrete, -1.6, -0.55, 0, 0.7, -0.4, 1.2);
  leafWall(g, v(-1.07, 0.98, 0.4), v(0.5, 0.28, 0.78), 1400, 31);
  const rail = new THREE.MeshStandardMaterial({ color: 0x6e4a30, roughness: 0.45, metalness: 0.6 });
  for (const z of [-1.6, -0.95, -0.3, 0.35, 0.95]) {
    const base = z < -0.4 ? FLOOR : z < 0.2 ? 0.3 : 0.15;
    B(g, rail, -4.98, -4.94, base, base + 1.0, z - 0.02, z + 0.02);
  }
  B(g, rail, -4.99, -4.93, FLOOR + 0.98, FLOOR + 1.02, -1.7, -0.35);
  {
    // the sloped top rail down the steps
    const a = v(-4.96, FLOOR + 1.0, -0.35), b = v(-4.96, 1.15, 1.0);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, a.distanceTo(b), 8), rail);
    r.position.copy(a).add(b).multiplyScalar(0.5);
    r.quaternion.setFromUnitVectors(v(0, 1, 0), b.clone().sub(a).normalize());
    g.add(r);
  }

  // entrance glazing: frame + two sliding leaves (opened by the camera path)
  B(g, frame, -5.5, -5.44, FLOOR, 2.26, -1.86, -1.76);
  B(g, frame, -3.53, -3.47, FLOOR, 2.26, -1.86, -1.76);
  B(g, frame, -5.44, -3.53, 2.18, 2.26, -1.86, -1.76);
  const doors: THREE.Object3D[] = [];
  const doorX = [-4.965, -4.005];
  for (const x of doorX) {
    const d = new THREE.Group();
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.94, 1.72, 0.02), entranceGlass);
    const bars = [
      worldBox(-0.47, -0.43, -0.86, 0.86, -0.02, 0.02), worldBox(0.43, 0.47, -0.86, 0.86, -0.02, 0.02),
      worldBox(-0.47, 0.47, -0.86, -0.8, -0.02, 0.02), worldBox(-0.47, 0.47, 0.8, 0.86, -0.02, 0.02),
    ].map((geo) => new THREE.Mesh(geo, frame));
    d.add(pane, ...bars);
    d.position.set(x, FLOOR + 0.87, -1.8);
    g.add(d);
    doors.push(d);
  }

  // --- garage: walls, a white panel, two cars nose-in
  B(g, render, 1.67, 1.85, 0, 2.18, -6, -1.8);
  B(g, render, 1.85, 6.58, 0, 2.18, -6.2, -6);
  B(g, white, 4.33, 5.67, 1.62, 2.12, -6.0, -5.92);
  const garageLight = new THREE.PointLight(0xffe0b8, 8, 9, 1.6);
  garageLight.position.set(4.2, 2.0, -3);
  g.add(garageLight);
  pending.push(car(g, 0xe9e9e6, 2.95, -3.4, Math.PI));
  pending.push(car(g, 0xbfc3c8, 5.3, -3.5, Math.PI));
  // the blue one, nose out at the lower left
  pending.push(car(g, 0x2f86c9, -8.4, 2.9, -0.55));

  // --- living wall: a dense layer of leaves
  B(g, darkBack, 7.4, 10.1, 0, 4.0, -0.4, 0.3);
  B(g, stone, 10.1, 10.45, 0, 4.15, -1, 0.6);
  leafWall(g, v(8.75, 1.98, 0.4), v(1.32, 1.95, 0.1), 5200, 41);

  // --- trees and shrubs (procedural, with wind): behind the building, either side, across the street
  const trees: Tree[] = [
    // in the gaps either side, behind
    tree(g, 'Ash Large', -9, -10, 12, 2),
    tree(g, 'Aspen Large', 9.2, -12, 11, 5),
    tree(g, 'Oak Large', -8.9, -16.5, 10, 1),
    // street trees on the pavements
    tree(g, 'Oak Medium', -15, 4, 8, 6),
    tree(g, 'Oak Medium', 16, 4, 8, 7),
    tree(g, 'Oak Medium', -30, 4, 8, 8),
    tree(g, 'Oak Medium', 31, 4, 8, 9),
  ];
  // the garden behind the studio, seen through the back glazing
  for (let i = 0; i < 4; i++) trees.push(tree(g, i % 2 ? 'Oak Large' : 'Aspen Large', -10 + i * 7, -22.5 - (i % 2) * 1.5, 9 + (i % 2) * 2, 20 + i));
  // across the street, behind the camera: their shade on the road, their crowns in the glass
  for (let i = 0; i < 5; i++) trees.push(tree(g, i % 2 ? 'Oak Large' : 'Ash Large', -18 + i * 9, 31 + (i % 2) * 3, 11 + (i % 3), 40 + i));
  pending.push(place(g, 'shrub_02', 'x', 2.6, -10.6, 0.03, 1.4));
  pending.push(place(g, 'shrub_02', 'x', 2.4, 11.6, 0.03, 1.8, 1.4));

  // --- the street around, and the studio inside
  neighbours(g, { render, concrete, frame });
  const inside = await interior(g, { frame, teak, fascia });

  await Promise.all(pending);
  return { doors, doorX, reflector, people: inside.people, trees, screen: inside.screen, screenPoint: inside.screenPoint };
}
