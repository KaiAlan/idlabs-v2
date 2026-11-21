import * as THREE from 'three';
import { rng } from './textures';
import { B, ground } from './geom';

/* The street around the studio: a three-storey rendered apartment block on the left, a concrete
   office on the right, a row of buildings behind for the skyline, and pavements. Windows are
   dark glass that picks up the sunset; a few are lit warm from inside. */

type Mats = { render: THREE.Material; concrete: THREE.Material; frame: THREE.Material };

const glass = new THREE.MeshPhysicalMaterial({ color: 0x1b2128, metalness: 0.6, roughness: 0.08, envMapIntensity: 1.2 });
const lit = new THREE.MeshStandardMaterial({ color: 0x2a1c10, emissive: 0xffb466, emissiveIntensity: 0.9 });

/* A grid of windows on one face. face: which side ('z+' = the street, 'x+' / 'x-' = the sides). */
function windows(
  g: THREE.Object3D, frame: THREE.Material, face: 'z+' | 'x+' | 'x-',
  plane: number, a0: number, a1: number, floors: number, floorH: number, base: number,
  w: number, h: number, gap: number, seed: number, litShare = 0.12,
) {
  const r = rng(seed);
  const n = Math.floor((a1 - a0 + gap) / (w + gap));
  const start = a0 + ((a1 - a0) - (n * w + (n - 1) * gap)) / 2;
  for (let f = 0; f < floors; f++) {
    const y0 = base + f * floorH + (floorH - h) * 0.55;
    for (let i = 0; i < n; i++) {
      const c0 = start + i * (w + gap), c1 = c0 + w;
      const mat = r() < litShare ? lit : glass;
      if (face === 'z+') {
        B(g, mat, c0, c1, y0, y0 + h, plane - 0.12, plane + 0.01, false);
        B(g, frame, c0 - 0.05, c1 + 0.05, y0 - 0.06, y0, plane - 0.02, plane + 0.08, false); // sill
      } else {
        const s = face === 'x+' ? 1 : -1;
        B(g, mat, Math.min(plane - 0.12 * s, plane + 0.01 * s), Math.max(plane - 0.12 * s, plane + 0.01 * s), y0, y0 + h, c0, c1, false);
      }
    }
  }
}

export function neighbours(g: THREE.Object3D, m: Mats) {
  const white = new THREE.MeshStandardMaterial({ color: 0xece5da, roughness: 0.9, normalMap: (m.render as THREE.MeshStandardMaterial).normalMap });
  const warmGrey = new THREE.MeshStandardMaterial({ color: 0x9a948c, roughness: 0.85, normalMap: (m.concrete as THREE.MeshStandardMaterial).normalMap });
  const railGlass = new THREE.MeshPhysicalMaterial({ color: 0x9fb0bb, metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.35 });

  // --- left: white apartment block, three floors, balconies
  B(g, white, -27, -11.2, 0, 10.4, -15, -1);
  B(g, m.frame, -27.1, -11.1, 10.4, 10.7, -15.1, -0.9); // parapet coping
  windows(g, m.frame, 'z+', -1, -26.4, -11.8, 3, 3.3, 0.2, 1.6, 2.2, 0.9, 11);
  windows(g, m.frame, 'x+', -11.2, -14, -2, 3, 3.3, 0.2, 1.2, 2.0, 1.2, 12);
  for (let f = 1; f < 3; f++) {
    const y = f * 3.3 + 0.1;
    B(g, white, -26.6, -12, y - 0.18, y, -1, 0.5); // balcony slab
    B(g, railGlass, -26.6, -12, y, y + 1.0, 0.44, 0.5, false);
  }
  // ground-floor shopfront: a dark recess with a lit interior strip
  B(g, m.frame, -26.4, -12, 0, 2.9, -1.05, -0.95, false);

  // --- right: concrete office, two tall floors, ribbon windows
  B(g, warmGrey, 11.2, 26, 0, 8.6, -13, -0.6);
  B(g, m.frame, 11.1, 26.1, 8.6, 8.85, -13.1, -0.5);
  for (const y of [1.1, 5.0]) {
    B(g, glass, 11.8, 25.4, y, y + 2.4, -0.72, -0.55, false);
    for (let x = 11.8; x <= 25.4; x += 1.7) B(g, m.frame, x - 0.04, x + 0.04, y, y + 2.4, -0.6, -0.5, false);
  }
  B(g, lit, 14.4, 17.8, 5.0, 7.4, -0.74, -0.73, false); // one office still on
  windows(g, m.frame, 'x-', 11.2, -12, -1.5, 2, 3.9, 0.6, 1.4, 2.4, 1.0, 13, 0.08);

  // --- the skyline behind: blocks of varied height, plain, with window grids on the street side
  const r = rng(77);
  for (let i = 0; i < 12; i++) {
    const x0 = -60 + i * 10 + r() * 3, w = 7 + r() * 4, d = 8 + r() * 6;
    const z1 = -24 - r() * 8, h = 7 + r() * 13;
    const mat = r() > 0.5 ? white : warmGrey;
    B(g, mat, x0, x0 + w, 0, h, z1 - d, z1, false);
    windows(g, m.frame, 'z+', z1, x0 + 0.6, x0 + w - 0.6, Math.floor(h / 3.2), 3.2, 0.3, 1.2, 1.8, 1.0, 100 + i, 0.15);
  }

  // --- pavements either side of the forecourt, and a strip of grass behind the kerb
  ground(g, m.concrete, -60, -12, -1, 5.72, 0.03);
  ground(g, m.concrete, 11, 60, -0.5, 5.72, 0.03);
}
