// Fetch the /exp/office scene's third-party assets into public/office/assets/.
//   node scripts/office-assets.mjs
//
// Poly Haven (CC0): PBR textures (1k: colour, normal, roughness), models (1k glTF), the sky HDRI.
// three.js examples (MIT repo; models under their own licences, see public/office/assets/CREDITS.md):
//   readyplayer.me.glb and Michelle.glb (people), ferrari.glb (the car) + its AO shadow.
// The DRACO decoder (for ferrari.glb) is copied from node_modules/three.
import { mkdir, writeFile, copyFile, readdir, access, unlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';

const OUT = 'public/office/assets';
const UA = { 'User-Agent': 'asset-fetch/1.0' }; // Poly Haven refuses clients without one

const TEXTURES = {
  stone: 'stone_tile_wall',
  asphalt: 'asphalt_02',
  cobble: 'patterned_cobblestone',
  teak: 'teak_veneer',
  floor: 'wood_floor',
  plaster: 'white_plaster_02',
  render: 'grey_plaster',
  concrete: 'brushed_concrete',
};
const MODELS = [
  'shrub_02', 'shrub_04', 'fern_02', 'potted_plant_01', 'potted_plant_02', 'pachira_aquatica_01',
  'dining_table', 'dining_chair_02', 'classic_laptop', 'television_02', 'hanging_industrial_lamp',
  'wooden_display_shelves_01', 'side_table_01',
  'sofa_02', 'modern_arm_chair_01', 'coffee_table_round_01', 'steel_frame_shelves_02', 'potted_plant_04', 'desk_lamp_arm_01',
];
const HDRI = 'industrial_sunset_02_puresky';
const THREE_MODELS = ['readyplayer.me.glb', 'Michelle.glb', 'ferrari.glb', 'ferrari_ao.png'];

async function get(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
}
async function save(path, url) {
  try { await access(path); return; } catch { /* not there yet */ }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, await get(url));
  console.log('  ', path);
}
const files = async (id) => JSON.parse((await get(`https://api.polyhaven.com/files/${id}`)).toString());

for (const [name, id] of Object.entries(TEXTURES)) {
  const f = await files(id);
  console.log('texture', name, id);
  await save(join(OUT, 'tex', `${name}_diff.jpg`), f.Diffuse['1k'].jpg.url);
  await save(join(OUT, 'tex', `${name}_nor.jpg`), f.nor_gl['1k'].jpg.url);
  await save(join(OUT, 'tex', `${name}_rough.jpg`), f.Rough['1k'].jpg.url);
}

for (const id of MODELS) {
  const g = (await files(id)).gltf['1k'].gltf;
  console.log('model', id);
  await save(join(OUT, 'models', id, `${id}.gltf`), g.url);
  for (const [rel, inc] of Object.entries(g.include ?? {})) await save(join(OUT, 'models', id, rel), inc.url);
}

console.log('hdri', HDRI);
await save(join(OUT, 'hdri', 'sky_2k.hdr'), (await files(HDRI)).hdri['2k'].hdr.url);

for (const f of THREE_MODELS) {
  console.log('three.js model', f);
  await save(join(OUT, 'models', f), `https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/${f}`);
}

// Rocketbox people (Microsoft, MIT): FBX + 2k TGA textures, converted to 1k JPG (PNG for the
// hair/lash opacity sheet) with ffmpeg (set FFMPEG if it isn't on the PATH).
const RB = 'https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/master/Assets/Avatars/Adults';
const PEOPLE = ['Male_Adult_09', 'Male_Adult_08', 'Male_Adult_12', 'Male_Adult_14', 'Female_Adult_05', 'Female_Adult_14', 'Female_Adult_02'];
const ffmpeg = process.env.FFMPEG ?? 'ffmpeg';
for (const id of PEOPLE) {
  console.log('person', id);
  const dir = join(OUT, 'people', id);
  await save(join(dir, `${id}.fbx`), `${RB}/${id}/Export/${id}.fbx`);
  const list = JSON.parse((await get(`https://api.github.com/repos/microsoft/Microsoft-Rocketbox/contents/Assets/Avatars/Adults/${id}/Textures`)).toString());
  for (const { name } of list) {
    if (!/(color|normal)\.tga$/i.test(name)) continue; // specular unused
    const out = join(dir, name.replace(/\.tga$/i, /opacity/i.test(name) ? '.png' : '.jpg'));
    try { await access(out); continue; } catch { /* convert */ }
    const tga = join(dir, name);
    await save(tga, `${RB}/${id}/Textures/${name}`);
    execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', tga, '-vf', 'scale=1024:1024', ...(out.endsWith('.jpg') ? ['-q:v', '3'] : []), '-y', out]);
    await unlink(tga);
    console.log('  ', out);
  }
}

const draco = 'node_modules/three/examples/jsm/libs/draco/gltf';
await mkdir(join(OUT, 'draco'), { recursive: true });
for (const f of await readdir(draco)) await copyFile(join(draco, f), join(OUT, 'draco', f));
console.log('done');
