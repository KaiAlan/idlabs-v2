import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

/* Loading for the /exp/office scene. Everything lives in public/office/assets/ (fetched by
   scripts/office-assets.mjs): Poly Haven PBR textures, models and the sky HDRI, plus the
   people and the car from the three.js examples. */

export const ASSET = '/office/assets';

const draco = new DRACOLoader().setDecoderPath(`${ASSET}/draco/`);
const gltfLoader = new GLTFLoader().setDRACOLoader(draco);
const texLoader = new THREE.TextureLoader();

const gltfCache = new Map<string, Promise<GLTF>>();
export function gltf(path: string) {
  if (!gltfCache.has(path)) gltfCache.set(path, gltfLoader.loadAsync(`${ASSET}/models/${path}`));
  return gltfCache.get(path)!;
}

/* A Poly Haven model, by id: models/<id>/<id>.gltf. Returns a fresh clone each call. */
export async function polyModel(id: string) {
  const g = await gltf(`${id}/${id}.gltf`);
  const o = g.scene.clone(true);
  o.traverse((c) => { if ((c as THREE.Mesh).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  return o;
}

/* Scale an object uniformly so its bounding box matches `size` on the given axis, and sit it
   on y = 0 (centred in x and z). Returns the scaled size. */
export function fit(o: THREE.Object3D, axis: 'x' | 'y' | 'z', size: number) {
  const box = new THREE.Box3().setFromObject(o);
  const s = box.getSize(new THREE.Vector3());
  const k = size / s[axis];
  o.scale.multiplyScalar(k);
  box.setFromObject(o);
  const c = box.getCenter(new THREE.Vector3());
  o.position.x -= c.x;
  o.position.z -= c.z;
  o.position.y -= box.min.y;
  const wrap = new THREE.Group();
  wrap.add(o);
  return { object: wrap, size: s.multiplyScalar(k) };
}

/* A Poly Haven PBR material (colour, normal, roughness at 1k). `tile` is the texture's
   real-world size in metres; the geometry's UVs are in metres (see worldBox in build.ts). */
export function pbr(name: string, tile: number, extra: THREE.MeshStandardMaterialParameters = {}) {
  const t = (map: string, srgb: boolean) => {
    const tx = texLoader.load(`${ASSET}/tex/${name}_${map}.jpg`);
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(1 / tile, 1 / tile);
    tx.anisotropy = 8;
    if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  };
  return new THREE.MeshStandardMaterial({
    map: t('diff', true), normalMap: t('nor', false), roughnessMap: t('rough', false), ...extra,
  });
}

/* The sky: a Poly Haven HDRI. Returns the equirect texture and the direction of its sun
   (the brightest texel), in the texture's own frame. */
export async function sky() {
  const tex = await new HDRLoader().loadAsync(`${ASSET}/hdri/sky_2k.hdr`);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  const { data, width, height } = tex.image as { data: Uint16Array | Float32Array; width: number; height: number };
  const half = data instanceof Uint16Array;
  let best = -1, bi = 0;
  for (let i = 0; i < width * height; i++) {
    const r = half ? THREE.DataUtils.fromHalfFloat(data[i * 4]) : data[i * 4];
    const g = half ? THREE.DataUtils.fromHalfFloat(data[i * 4 + 1]) : data[i * 4 + 1];
    const b = half ? THREE.DataUtils.fromHalfFloat(data[i * 4 + 2]) : data[i * 4 + 2];
    const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
    if (l > best) { best = l; bi = i; }
  }
  // texel → direction, matching three's equirectUv(): u = atan(z, x) / 2π + 0.5, v = asin(y) / π + 0.5
  const x = bi % width, row = Math.floor(bi / width);
  const u = (x + 0.5) / width;
  const v = tex.flipY ? 1 - (row + 0.5) / height : (row + 0.5) / height;
  const phi = (u - 0.5) * Math.PI * 2, lat = (v - 0.5) * Math.PI;
  const sun = new THREE.Vector3(Math.cos(phi) * Math.cos(lat), Math.sin(lat), Math.sin(phi) * Math.cos(lat));
  return { texture: tex, sun };
}
