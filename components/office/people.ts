import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { gltf, ASSET } from './assets';

/* The people in the meeting room: rigged avatars (Ready Player Me, and Mixamo's Michelle from
   the three.js examples) posed procedurally, since there are no sitting clips to play.

   Posing is done in world space: each bone is turned so that the line from it to its child
   bone points where we want (aim()). That works whatever the rig's local bone axes are.
   Directions are given in the person's own frame: +z is the way they face, +x their left. */

type Dir = [number, number, number];
type Pose = Record<string, Dir>; // bone → direction to its child

const SEATED: Pose = {
  Spine: [0, 1, 0.1], Spine1: [0, 1, 0.14], Spine2: [0, 1, 0.12], Neck: [0, 1, 0.06], Head: [0, 1, 0.02],
  LeftUpLeg: [0.1, -0.06, 1], RightUpLeg: [-0.1, -0.06, 1],
  LeftLeg: [0.02, -1, 0.1], RightLeg: [-0.02, -1, 0.1],
  LeftFoot: [0.05, -0.3, 1], RightFoot: [-0.05, -0.3, 1],
  // forearms resting on the table, hands in
  LeftArm: [0.28, -0.75, 0.5], RightArm: [-0.28, -0.75, 0.5],
  LeftForeArm: [-0.3, 0.12, 1], RightForeArm: [0.3, 0.12, 1],
  LeftHand: [-0.25, 0, 1], RightHand: [0.25, 0, 1],
};

const STANDING: Pose = {
  Spine: [0, 1, 0], Spine1: [0, 1, 0.02], Spine2: [0, 1, 0.02], Neck: [0, 1, 0.04], Head: [0, 1, 0],
  LeftUpLeg: [0.04, -1, 0], RightUpLeg: [-0.04, -1, 0],
  LeftLeg: [0, -1, -0.03], RightLeg: [0, -1, -0.03],
  LeftFoot: [0.05, -0.35, 1], RightFoot: [-0.05, -0.35, 1],
  LeftArm: [0.14, -1, 0.04], RightArm: [-0.14, -1, 0.04],
  LeftForeArm: [0.05, -1, 0.25], RightForeArm: [-0.05, -1, 0.25],
  LeftHand: [0, -1, 0.1], RightHand: [0, -1, 0.1],
};

// each bone's child, the one its direction is measured to
const CHILD: Record<string, string> = {
  Spine: 'Spine1', Spine1: 'Spine2', Spine2: 'Neck', Neck: 'Head', Head: 'HeadTop_End',
  LeftUpLeg: 'LeftLeg', LeftLeg: 'LeftFoot', LeftFoot: 'LeftToeBase',
  RightUpLeg: 'RightLeg', RightLeg: 'RightFoot', RightFoot: 'RightToeBase',
  LeftArm: 'LeftForeArm', LeftForeArm: 'LeftHand', LeftHand: 'LeftHandMiddle1',
  RightArm: 'RightForeArm', RightForeArm: 'RightHand', RightHand: 'RightHandMiddle1',
};
const ORDER = ['Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot',
  'LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand'];

/* Rocketbox (3ds Max Biped) bone names → the names above. FBXLoader turns spaces into underscores. */
const BIPED: Record<string, string> = {
  Bip01_Pelvis: 'Hips', Bip01_Spine: 'Spine', Bip01_Spine1: 'Spine1', Bip01_Spine2: 'Spine2', Bip01_Neck: 'Neck',
  Bip01_Head: 'Head', Bip01_HeadNub: 'HeadTop_End',
  Bip01_L_Thigh: 'LeftUpLeg', Bip01_L_Calf: 'LeftLeg', Bip01_L_Foot: 'LeftFoot', Bip01_L_Toe0: 'LeftToeBase',
  Bip01_R_Thigh: 'RightUpLeg', Bip01_R_Calf: 'RightLeg', Bip01_R_Foot: 'RightFoot', Bip01_R_Toe0: 'RightToeBase',
  Bip01_L_UpperArm: 'LeftArm', Bip01_L_Forearm: 'LeftForeArm', Bip01_L_Hand: 'LeftHand', Bip01_L_Finger2: 'LeftHandMiddle1',
  Bip01_R_UpperArm: 'RightArm', Bip01_R_Forearm: 'RightForeArm', Bip01_R_Hand: 'RightHand', Bip01_R_Finger2: 'RightHandMiddle1',
};

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3();
const _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _wq = new THREE.Quaternion();

function aim(bone: THREE.Object3D, child: THREE.Object3D, worldDir: THREE.Vector3) {
  bone.updateWorldMatrix(true, false);
  child.updateWorldMatrix(false, false);
  bone.getWorldPosition(_a);
  child.getWorldPosition(_b);
  _d.subVectors(_b, _a).normalize();
  _q.setFromUnitVectors(_d, worldDir);
  bone.getWorldQuaternion(_wq);
  bone.parent!.getWorldQuaternion(_pq);
  bone.quaternion.copy(_pq.invert().multiply(_q.multiply(_wq)));
  bone.updateMatrixWorld(true);
}

export type Look = {
  /** 'rpm' / 'michelle' (three.js examples) or a Rocketbox adult, e.g. 'rb:Male_Adult_05' */
  model: string;
  top?: number; bottom?: number; shoes?: number; skin?: number; beard?: boolean; hair?: number;
};

export class Person {
  root = new THREE.Group();
  private bones: Record<string, THREE.Object3D> = {};
  private rest = new Map<THREE.Object3D, THREE.Quaternion>(); // bind pose, restored every frame
  private mouths: { mesh: THREE.Mesh; index: number }[] = [];
  private pose: Pose;
  /** world point this person looks at; set by the scene */
  lookAt = new THREE.Vector3();
  speaking = false;
  gesture = 0; // 0..1, how much the right hand is raised mid-sentence
  pointAt?: THREE.Vector3; // standing presenter: the right arm points here

  constructor(object: THREE.Object3D, public name: string, standing: boolean) {
    this.pose = standing ? STANDING : SEATED;
    this.root.add(object);
    object.traverse((o) => {
      const n = BIPED[o.name] ?? o.name.replace(/^mixamorig:?/, '');
      if ((o as THREE.Bone).isBone && !(n in this.bones)) this.bones[n] = o;
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        m.frustumCulled = false; // skinned bounds don't follow the pose
        const dict = m.morphTargetDictionary;
        if (dict && 'mouthOpen' in dict) this.mouths.push({ mesh: m, index: dict.mouthOpen });
      }
    });
    for (const b of Object.values(this.bones)) this.rest.set(b, b.quaternion.clone());
    // seat the hips: standing hip height → chair height
    object.updateMatrixWorld(true);
    const hipY = this.bones.Hips.getWorldPosition(new THREE.Vector3()).y - this.root.position.y;
    if (!standing) object.position.y = 0.56 - hipY;
  }

  /* Short hair: a cap over the crown and back of the head, on the head bone so it follows.
     (The avatar's own hair is a hat-shaped mesh we hide.) Placed from the bind pose. */
  addHair(color: number) {
    const head = this.bones.Head, top = this.bones.HeadTop_End;
    if (!head || !top) return;
    this.root.updateMatrixWorld(true);
    const a = head.getWorldPosition(new THREE.Vector3()), b = top.getWorldPosition(new THREE.Vector3());
    const len = a.distanceTo(b); // neck-top to crown
    const centre = a.clone().lerp(b, 0.48).add(new THREE.Vector3(0, 0, -0.012));
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
    const cap = new THREE.Mesh(new THREE.SphereGeometry(len * 0.56, 32, 20, 0, Math.PI * 2, 0, 1.75), mat);
    cap.scale.set(0.9, 1.0, 1.06);
    cap.rotation.x = -0.5; // tip back: more cover at the back, a hairline at the front
    cap.castShadow = true;
    const holder = new THREE.Group();
    holder.position.copy(centre).add(new THREE.Vector3(0, len * 0.06, 0));
    holder.add(cap);
    // into the head bone's frame
    head.updateWorldMatrix(true, false);
    const inv = head.matrixWorld.clone().invert();
    holder.applyMatrix4(inv);
    head.add(holder);
  }

  /* Pose for this frame. t: seconds. */
  update(t: number) {
    // start from the bind pose: aim() only fixes a bone's direction, never its twist, so
    // without this the head's turn would stack frame on frame (the heads spun)
    for (const [b, q] of this.rest) b.quaternion.copy(q);
    this.root.updateMatrixWorld(true);
    const rootQ = this.root.getWorldQuaternion(new THREE.Quaternion());
    const toWorld = (d: Dir) => new THREE.Vector3(...d).normalize().applyQuaternion(rootQ);
    const seed = this.root.position.x * 3.1 + this.root.position.z;
    for (const name of ORDER) {
      const bone = this.bones[name], child = this.bones[CHILD[name]];
      if (!bone || !child) continue;
      let d = this.pose[name];
      // breathing / weight shifts on the spine
      if (name === 'Spine1') d = [Math.sin(t * 0.4 + seed) * 0.03, 1, d[2] + Math.sin(t * 1.6 + seed) * 0.015];
      // talking: the right forearm lifts and turns
      if (name === 'RightForeArm' && this.gesture > 0 && !this.pointAt) {
        const g = this.gesture * (0.6 + 0.4 * Math.sin(t * 3.3 + seed));
        d = [d[0] + 0.1 * g, d[1] + 0.9 * g, d[2]];
      }
      if (name === 'RightHand' && this.gesture > 0 && !this.pointAt) d = [0.1, 0.4 * this.gesture, 1];
      let w = toWorld(d);
      if (this.pointAt && (name === 'RightArm' || name === 'RightForeArm' || name === 'RightHand')) {
        const from = this.bones.RightArm.getWorldPosition(new THREE.Vector3());
        w = this.pointAt.clone().sub(from).normalize();
        if (name === 'RightArm') w.lerp(toWorld([-0.3, -1, 0.2]), 0.25).normalize(); // elbow a little bent
      }
      if (name === 'Head') {
        // face the look target: yaw and a little pitch, layered on the upright head
        const head = this.bones.Head.getWorldPosition(new THREE.Vector3());
        const want = this.lookAt.clone().sub(head);
        const local = want.clone().applyQuaternion(rootQ.clone().invert());
        const yaw = THREE.MathUtils.clamp(Math.atan2(local.x, local.z), -1.2, 1.2);
        const pitch = THREE.MathUtils.clamp(Math.atan2(local.y, Math.hypot(local.x, local.z)), -0.4, 0.3);
        aim(bone, child, w);
        const nod = this.speaking ? Math.sin(t * 4.2 + seed) * 0.05 : Math.sin(t * 0.9 + seed) * 0.02;
        const turn = new THREE.Quaternion().setFromEuler(new THREE.Euler(-(pitch * 0.6) + nod, yaw, 0, 'YXZ'));
        const wq = rootQ.clone().multiply(turn).multiply(rootQ.clone().invert());
        const pq = bone.parent!.getWorldQuaternion(new THREE.Quaternion());
        const bw = bone.getWorldQuaternion(new THREE.Quaternion());
        bone.quaternion.copy(pq.invert().multiply(wq.multiply(bw)));
        bone.updateMatrixWorld(true);
        continue;
      }
      aim(bone, child, w);
    }
    const open = this.speaking ? Math.max(0, Math.sin(t * 13 + seed) * 0.5 + Math.sin(t * 7.3) * 0.3) : 0;
    for (const m of this.mouths) m.mesh.morphTargetInfluences![m.index] = open * 0.7;
  }
}

/* A Rocketbox avatar (Microsoft, MIT): FBX in centimetres, Biped rig, textures converted from
   TGA to 1k JPG/PNG by scripts/office-assets.mjs (the FBX still names the .tga files; the
   URL modifier points them at the conversions). */
const BLANK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const rbCache = new Map<string, Promise<THREE.Group>>();
function rocketbox(id: string) {
  if (!rbCache.has(id)) {
    const dir = `${ASSET}/people/${id}/`;
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      const file = url.split(/[\\/]/).pop()!;
      if (!/\.tga$/i.test(file)) return url;
      if (/specular/i.test(file)) return BLANK; // not converted (unused)
      return dir + file.replace(/\.tga$/i, /opacity/i.test(file) ? '.png' : '.jpg');
    });
    rbCache.set(id, new FBXLoader(manager).loadAsync(`${dir}${id}.fbx`));
  }
  return rbCache.get(id)!;
}

function rocketboxMaterials(o: THREE.Object3D) {
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (!m.isMesh) return;
    const conv = (src: THREE.Material) => {
      const p = src as THREE.MeshPhongMaterial;
      const hair = /opacity/i.test(p.name) || /opacity/i.test(p.map?.name ?? '') || /opacity/i.test(String((p.map?.image as HTMLImageElement | undefined)?.src ?? ''));
      if (p.map) p.map.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshStandardMaterial({
        name: p.name, map: p.map, normalMap: p.normalMap, roughness: hair ? 0.7 : 0.62, metalness: 0,
        transparent: false, alphaTest: hair ? 0.45 : 0, side: hair ? THREE.DoubleSide : THREE.FrontSide,
      });
    };
    m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material);
  });
}

/* Load one person, dressed. */
export async function makePerson(name: string, look: Look, standing = false) {
  if (look.model.startsWith('rb:')) {
    const src = await rocketbox(look.model.slice(3));
    const o = cloneSkinned(src) as THREE.Group;
    rocketboxMaterials(o);
    o.scale.setScalar(0.01); // centimetres
    const holder = new THREE.Group();
    holder.add(o);
    return new Person(holder, name, standing);
  }
  const src = await gltf(look.model === 'rpm' ? 'readyplayer.me.glb' : 'Michelle.glb');
  const o = cloneSkinned(src.scene);
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = (m.material as THREE.MeshStandardMaterial).clone();
    const n = mat.name;
    // plain fabric colours for the outfit; the texture's folds stay in the normal map
    const plain = (hex?: number) => { if (hex === undefined) return; mat.map = null; mat.color.setHex(hex); mat.roughness = 0.9; mat.metalness = 0; };
    if (n.includes('Outfit_Top')) plain(look.top);
    if (n.includes('Outfit_Bottom')) plain(look.bottom);
    if (n.includes('Footwear')) plain(look.shoes);
    if ((n.includes('Skin') || n.includes('Body')) && look.skin !== undefined) mat.color.setHex(look.skin);
    if (n.includes('Beard') && look.beard === false) m.visible = false;
    if (n.includes('Headwear')) m.visible = false; // the avatar ships in a hat
    m.material = mat;
  });
  const person = new Person(o, name, standing);
  if (look.hair !== undefined) person.addHair(look.hair);
  return person;
}
