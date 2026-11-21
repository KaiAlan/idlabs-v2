import * as THREE from 'three';
import { B, ground, v } from './geom';
import { rng, screenCanvas } from './textures';
import { pbr, polyModel, fit } from './assets';
import { makePerson, type Person } from './people';

/* Inside the studio. Through the doors: a low lobby under a mezzanine (the glass box's floor),
   which opens into a double-height hall, 13 m wide, 12 m deep, 7 m to the ceiling, lit by
   three long skylights and a fully glazed back wall onto a garden.
   In the hall: the meeting table in front of a timber partition carrying the screen (Lovable and
   our team, reviewing the cut), workstations on the right, a lounge by the glass at the back,
   a full-height bookcase on the left, and the timber slat wall on the right.

   x: -6.5 (left wall) .. 6.5 (right wall). z: -1.95 (inside of the facade) .. -18 (back glazing).
   The garage occupies x 1.67..6.58, z > -6.2; the hall starts behind it. */

export const IN = { floor: 0.45, lobbyTop: 3.4, mezz: 3.62, ceiling: 7.1, hallFront: -6.2, back: -18, left: -6.5, right: 6.5 };

async function place(parent: THREE.Object3D, id: string, axis: 'x' | 'y' | 'z', size: number, x: number, y: number, z: number, yaw = 0) {
  const { object, size: s } = fit(await polyModel(id), axis, size);
  object.position.set(x, y, z);
  object.rotation.y = yaw;
  parent.add(object);
  return { object, size: s };
}

export type Interior = { people: Person[]; screen: ReturnType<typeof screenCanvas>; screenPoint: THREE.Vector3 };

export async function interior(g: THREE.Object3D, m: { frame: THREE.Material; teak: THREE.Material; fascia: THREE.Material }): Promise<Interior> {
  const F = IN.floor;
  const pending: Promise<unknown>[] = [];
  const wall = new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: 0.92, envMapIntensity: 0.45 });
  const floor = pbr('floor', 2.2, { envMapIntensity: 0.4 });
  const oak = pbr('teak', 1.4, { color: 0xffe9d2, roughness: 0.45, envMapIntensity: 0.6 });
  const concrete = pbr('concrete', 2, { color: 0xd9d6cf });

  // --- floor, walls
  ground(g, floor, IN.left, 1.6, IN.hallFront, -1.86, F + 0.002); // lobby
  ground(g, floor, IN.left, IN.right, IN.back, IN.hallFront, F + 0.002); // hall
  B(g, concrete, IN.left, IN.right, -0.2, F, IN.back - 0.2, IN.hallFront); // the hall's slab, under the floor
  B(g, wall, IN.left - 0.15, IN.left, F, IN.ceiling, IN.back, -1.86);
  B(g, wall, IN.right, IN.right + 0.15, F, IN.ceiling, IN.back, IN.hallFront + 0.2);
  B(g, wall, 1.6, 1.75, F, IN.lobbyTop, IN.hallFront, -1.86); // lobby | garage
  B(g, wall, 1.6, IN.right, F, IN.ceiling, IN.hallFront - 0.05, IN.hallFront + 0.15); // hall | garage, full height
  // inside face of the facade, the full height of the building, doorway cut out
  const front = new THREE.Shape();
  front.moveTo(IN.left, F); front.lineTo(1.6, F); front.lineTo(1.6, IN.ceiling); front.lineTo(IN.left, IN.ceiling); front.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-5.44, F); hole.lineTo(-3.53, F); hole.lineTo(-3.53, 2.18); hole.lineTo(-5.44, 2.18); hole.closePath();
  front.holes.push(hole);
  const frontWall = new THREE.Mesh(new THREE.ShapeGeometry(front), Object.assign(wall.clone(), { side: THREE.DoubleSide }));
  frontWall.position.z = -1.95;
  frontWall.castShadow = true;
  g.add(frontWall);
  B(g, m.fascia, IN.left, 1.7, 2.26, IN.ceiling, -1.95, -1.86); // fills the gap behind the facade

  // --- mezzanine over the lobby: slab, glass balustrade, a desk or two up there
  B(g, concrete, IN.left, 1.6, IN.lobbyTop, IN.mezz, IN.hallFront, -1.95);
  const balGlass = new THREE.MeshPhysicalMaterial({ color: 0xc8d4dc, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.22, depthWrite: false });
  B(g, balGlass, IN.left, 1.6, IN.mezz, IN.mezz + 1.05, IN.hallFront - 0.02, IN.hallFront + 0.0, false);
  B(g, m.frame, IN.left, 1.6, IN.mezz + 1.05, IN.mezz + 1.09, IN.hallFront - 0.04, IN.hallFront + 0.02, false);
  B(g, oak, -5.6, -3.2, IN.mezz + 0.72, IN.mezz + 0.76, -4.4, -3.6);
  B(g, oak, -1.6, 0.8, IN.mezz + 0.72, IN.mezz + 0.76, -4.4, -3.6);

  // --- ceiling: a slab with three long skylights over the hall
  B(g, wall, IN.left, 1.6, IN.ceiling, IN.ceiling + 0.3, IN.hallFront, -1.86);
  const sky = [[-5, -3.2], [-1, 0.8], [3, 4.8]];
  let x = IN.left;
  for (const [a, b] of sky) { B(g, wall, x, a, IN.ceiling, IN.ceiling + 0.3, IN.back, IN.hallFront); x = b; }
  B(g, wall, x, IN.right, IN.ceiling, IN.ceiling + 0.3, IN.back, IN.hallFront);
  for (const [a, b] of sky) {
    B(g, wall, a, b, IN.ceiling, IN.ceiling + 0.3, IN.back, -16);
    B(g, wall, a, b, IN.ceiling, IN.ceiling + 0.3, -8, IN.hallFront);
    for (let z = -15.4; z < -8; z += 1.2) B(g, m.frame, a, b, IN.ceiling + 0.25, IN.ceiling + 0.3, z, z + 0.05, false);
  }

  // --- back wall: floor-to-ceiling glazing, and the garden beyond
  const glazing = new THREE.MeshPhysicalMaterial({ color: 0xdfe8ee, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.12, depthWrite: false });
  B(g, glazing, IN.left, IN.right, F, IN.ceiling, IN.back - 0.02, IN.back, false);
  for (let gx = IN.left; gx <= IN.right + 0.01; gx += 1.625) B(g, m.frame, gx - 0.04, gx + 0.04, F, IN.ceiling, IN.back - 0.08, IN.back + 0.02, false);
  for (const gy of [F, 3.6, IN.ceiling - 0.05]) B(g, m.frame, IN.left, IN.right, gy, gy + 0.08, IN.back - 0.08, IN.back + 0.02, false);
  const grass = new THREE.MeshStandardMaterial({ color: 0x5d6b3e, roughness: 1 });
  ground(g, grass, -14, 14, -27, IN.back - 0.1, 0.02);
  B(g, concrete, -14, 14, 0, 2.6, -27.4, -27); // garden wall

  // --- right: timber slats, full height
  for (let i = 0; i < 150; i++) {
    const z = IN.back + 0.1 + i * 0.077;
    if (z > IN.hallFront - 0.1) break;
    B(g, m.teak, IN.right - 0.07, IN.right, F, IN.ceiling, z, z + 0.045);
  }

  // --- left: a full-height bookcase
  {
    const r = rng(99);
    const cols = [0x9b2f2f, 0x2f4f7b, 0xd6c7a1, 0x37383b, 0x6f8a5d, 0xc8a24a, 0xe8e2d4, 0x8a5a3c];
    const bookMats = cols.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }));
    const z0 = -16.6, z1 = -7.4;
    B(g, oak, IN.left, IN.left + 0.4, F, F + 0.05, z0, z1);
    for (let y = F + 0.45; y < 6.2; y += 0.55) {
      B(g, oak, IN.left, IN.left + 0.4, y - 0.035, y, z0, z1);
      let z = z0 + 0.05;
      while (z < z1 - 0.1) {
        const w = 0.03 + r() * 0.045, h = 0.24 + r() * 0.14;
        if (r() > 0.08) B(g, bookMats[Math.floor(r() * bookMats.length)], IN.left + 0.05, IN.left + 0.33, y, y + h, z, z + w, false);
        z += w + (r() > 0.9 ? 0.35 : 0.004);
      }
    }
    for (let z = z0; z <= z1 + 0.01; z += 1.84) B(g, oak, IN.left, IN.left + 0.4, F, 6.2, z - 0.02, z + 0.02);
  }

  // --- meeting area: rug, table, chairs, laptops, pendants, the screen on a timber partition
  const TABLE = { x: -2.4, z: -10.5, len: 3.2, top: F + 0.76 };
  const rug = new THREE.MeshStandardMaterial({ color: 0x8c8276, roughness: 1 });
  B(g, rug, -4.6, -0.2, F, F + 0.012, -13.0, -8.0, false);
  B(g, oak, TABLE.x - 0.58, TABLE.x + 0.58, TABLE.top - 0.045, TABLE.top, TABLE.z - TABLE.len / 2, TABLE.z + TABLE.len / 2);
  for (const dz of [-1, 1]) {
    const z = TABLE.z + dz * (TABLE.len / 2 - 0.4);
    B(g, m.frame, TABLE.x - 0.45, TABLE.x + 0.45, F, TABLE.top - 0.045, z - 0.03, z + 0.03);
  }
  const seats = [
    { x: -3.42, z: -9.85, yaw: Math.PI / 2 }, { x: -3.42, z: -11.15, yaw: Math.PI / 2 },
    { x: -1.38, z: -9.85, yaw: -Math.PI / 2 }, { x: -1.38, z: -11.15, yaw: -Math.PI / 2 },
  ];
  for (const s of seats) pending.push(place(g, 'dining_chair_02', 'y', 0.86, s.x - Math.sin(s.yaw) * 0.08, F, s.z, s.yaw));
  pending.push(place(g, 'classic_laptop', 'x', 0.34, -2.78, TABLE.top, -9.9, -Math.PI / 2)); // the model's screen faces -z
  pending.push(place(g, 'classic_laptop', 'x', 0.34, -2.02, TABLE.top, -11.2, Math.PI / 2));
  const cup = new THREE.MeshStandardMaterial({ color: 0xf5f5f2, roughness: 0.35 });
  for (const [cx, cz] of [[-2.1, -9.6], [-2.75, -11.4], [-2.35, -10.6]]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.1, 20), cup);
    c.position.set(cx, TABLE.top + 0.05, cz);
    c.castShadow = true;
    g.add(c);
  }
  for (const z of [-9.5, -10.5, -11.5]) {
    pending.push((async () => {
      const l = await place(g, 'hanging_industrial_lamp', 'y', 0.7, TABLE.x, 0, z);
      l.object.position.y = 3.2;
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, IN.ceiling - 3.2 - l.size.y), m.frame);
      cable.position.set(TABLE.x, (IN.ceiling + 3.2 + l.size.y) / 2, z);
      g.add(cable);
    })());
  }
  for (const z of [-9.6, -11.4]) {
    const l = new THREE.PointLight(0xffcf9e, 5, 6, 1.6);
    l.position.set(TABLE.x, 3.05, z);
    g.add(l);
  }
  // partition with the screen
  B(g, m.teak, -4.7, -0.1, F, 3.5, -13.75, -13.55);
  const screen = screenCanvas();
  B(g, m.frame, -3.78, -1.02, 1.45, 3.05, -13.55, -13.5, false);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.66, 1.5), new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false }));
  scr.position.set(-2.4, 2.25, -13.495);
  g.add(scr);
  const glow = new THREE.RectAreaLight(0xff9ec8, 3, 2.66, 1.5);
  glow.position.set(-2.4, 2.25, -13.45);
  glow.lookAt(-2.4, 2.25, 0);
  g.add(glow);
  const screenPoint = v(-2.0, 2.3, -13.5);

  // --- workstations: two oak benches with monitors, right of the hall
  const monitor = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.4, metalness: 0.4 });
  const monitorLit = new THREE.MeshBasicMaterial({ color: 0xd8e2f0 });
  for (const z of [-8.6, -11.6]) {
    B(g, oak, 2.3, 5.7, F + 0.72, F + 0.75, z - 0.42, z + 0.42);
    for (const lx of [2.45, 5.55]) B(g, m.frame, lx - 0.03, lx + 0.03, F, F + 0.72, z - 0.38, z + 0.38);
    for (const mx of [3.0, 4.95]) {
      for (const side of [-1, 1]) {
        const mz = z + side * 0.12;
        B(g, monitor, mx - 0.32, mx + 0.32, F + 0.95, F + 1.32, mz - 0.015, mz + 0.015, false);
        const face = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.34), monitorLit);
        face.position.set(mx, F + 1.135, mz + side * 0.017);
        if (side < 0) face.rotation.y = Math.PI;
        g.add(face);
        B(g, monitor, mx - 0.02, mx + 0.02, F + 0.75, F + 0.95, mz - 0.02, mz + 0.02, false);
        pending.push(place(g, 'dining_chair_02', 'y', 0.86, mx, F, z + side * 0.75, side > 0 ? Math.PI : 0));
      }
    }
    pending.push(place(g, 'desk_lamp_arm_01', 'y', 0.5, 2.6, F + 0.75, z - 0.2));
  }

  // --- lounge by the back glazing
  pending.push(place(g, 'sofa_02', 'x', 2.4, 3.9, F, -16.9));
  pending.push(place(g, 'coffee_table_round_01', 'x', 0.9, 3.9, F, -15.6));
  pending.push(place(g, 'modern_arm_chair_01', 'x', 0.85, 2.2, F, -15.2, Math.PI / 2 + 0.3));
  B(g, rug, 2.0, 5.8, F, F + 0.012, -17.6, -14.4, false);

  // --- plants
  pending.push(place(g, 'potted_plant_01', 'y', 1.9, -5.7, F, -17.2));
  pending.push(place(g, 'pachira_aquatica_01', 'y', 2.4, 5.8, F, -13.4));
  pending.push(place(g, 'potted_plant_04', 'y', 1.3, 0.9, F, -2.6));
  pending.push(place(g, 'potted_plant_02', 'y', 1.4, -0.6, F, -17.3));
  pending.push(place(g, 'potted_plant_01', 'y', 1.6, -5.9, F, -2.6));

  // --- light: soft daylight panels at the skylights, warm fill in the lobby
  for (const [a, b] of sky) {
    const l = new THREE.RectAreaLight(0xfff0e0, 3.5, b - a, 8);
    l.position.set((a + b) / 2, IN.ceiling - 0.05, -12);
    l.lookAt((a + b) / 2, 0, -12);
    g.add(l);
  }
  const lobby = new THREE.RectAreaLight(0xffe2c0, 4, 4, 2);
  lobby.position.set(-2.5, IN.lobbyTop - 0.02, -4);
  lobby.lookAt(-2.5, 0, -4);
  g.add(lobby);

  // --- people. Left of the table (facing +x): Lovable's CEO and a colleague. Right (facing -x):
  //     our creative director and producer. Standing by the screen: our editor.
  const people = await Promise.all([
    makePerson('ceo', { model: 'rb:Male_Adult_09' }),
    makePerson('lovable-2', { model: 'rb:Female_Adult_05' }),
    makePerson('cd', { model: 'rb:Male_Adult_08' }),
    makePerson('producer', { model: 'rb:Female_Adult_14' }),
    makePerson('editor', { model: 'rb:Male_Adult_12' }, true),
    // the rest of the studio, getting on with their day
    makePerson('desk', { model: 'rb:Male_Adult_14' }),
    makePerson('lounge', { model: 'rb:Female_Adult_02' }),
  ]);
  const at = [...seats, { x: -0.6, z: -13.0, yaw: -0.4 }, { x: 3.0, z: -7.85, yaw: Math.PI }, { x: 3.9, z: -16.55, yaw: 0 }];
  people.forEach((p, i) => {
    p.root.position.set(at[i].x, F, at[i].z);
    p.root.rotation.y = at[i].yaw;
    g.add(p.root);
  });
  people[5].lookAt.set(3.0, F + 1.1, -8.48); // their monitor
  people[6].lookAt.set(2.2, F + 1.0, -15.2); // the armchair

  await Promise.all(pending);
  return { people, screen, screenPoint };
}
