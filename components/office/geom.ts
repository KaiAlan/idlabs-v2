import * as THREE from 'three';

/* Geometry helpers shared by the /office modules. Units are metres. */

/* Box from world bounds with UVs in metres (u, v from the two axes the face spans), so tiled
   textures keep their real-world scale and line up from one mesh to the next. */
export function worldBox(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
    if (nx > 0.5) uv.setXY(i, p.getZ(i), p.getY(i));
    else if (ny > 0.5) uv.setXY(i, p.getX(i), p.getZ(i));
    else uv.setXY(i, p.getX(i), p.getY(i));
  }
  return g;
}

export function B(parent: THREE.Object3D, mat: THREE.Material, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, shadows = true) {
  const m = new THREE.Mesh(worldBox(x0, x1, y0, y1, z0, z1), mat);
  m.castShadow = shadows;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

/* Flat ground patch in the xz plane with metre UVs. */
export function ground(parent: THREE.Object3D, mat: THREE.Material, x0: number, x1: number, z0: number, z1: number, y = 0) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  g.rotateX(-Math.PI / 2);
  g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i), p.getZ(i));
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
