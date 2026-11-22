// CORAL KEY HEAT — entry point: scene, golden-hour grade, game loop, player, crew, shots.
import { WORLD, WEAPONS, MISSIONS } from './config.js';
import { makeRng } from './rng.js';
import { keys, pressed, initInput, clearPressed, wasPressed } from './input.js';
import { initAudio, sfx } from './audio.js';
import { buildWorld, groundHeight, islandAt } from './islands.js';
import { makeCar, driveCar, CAR_MODELS } from './vehicles.js';
import { spawnTraffic, updateTraffic, spawnPeds, updatePeds } from './traffic.js';
import { spawnPolice, updatePolice, addWanted } from './police.js';
import { spawnRivals, shoot, updateCombat } from './combat.js';
import { startMission, updateMissions, missionObjective } from './missions.js';
import { updateStunts } from './stunts.js';
import { updateHUD } from './hud.js';
import { renderTitle, renderMap, renderStats } from './menus.js';
import { runAutopilot } from './autopilot.js';

const params = new URLSearchParams(location.search);
const SHOT = +(params.get('shot') || 0);
const AUTO = params.get('autopilot') === '1';
const THREE = window.THREE;

// ---------- renderer / scene / golden hour ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
renderer.domElement.className = 'webgl';
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf2a56b, 120, 620);
function skyTexture(top, mid, bot) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, bot);
  x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); scene.background = t; return t;
}
skyTexture('#5b3a8e', '#ff8c5a', '#ffc46b'); // purple → orange → gold
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 1500);
const sun = new THREE.DirectionalLight(0xffb36b, 1.6);
sun.position.set(-160, 90, 60); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -160; sun.shadow.camera.right = 160; sun.shadow.camera.top = 160; sun.shadow.camera.bottom = -160;
scene.add(sun); scene.add(new THREE.AmbientLight(0xffd9b0, 0.55));
const sunBall = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffdf8a, fog: false }));
sunBall.position.set(-420, 70, 160); scene.add(sunBall);
function applyNight() {
  skyTexture('#0b1030', '#27356b', '#4a2a5e');
  scene.fog = new THREE.Fog(0x1c2440, 90, 520);
  sun.intensity = 0.35; sun.color.set(0x8fb2ff); sunBall.visible = false;
  scene.traverse(o => { if (o.material && o.material.emissive) o.material.emissiveIntensity = 1; });
}

// ---------- game state ----------
const rng = makeRng(WORLD.seed);
const world = buildWorld(THREE, scene, rng);
const traffic = spawnTraffic(THREE, scene, rng);
const peds = spawnPeds(THREE, scene, rng);
// parked stealable cars near spawn
const parked = [];
[[14, 18], [-20, 8], [30, -14], [-235, -128], [238, -170], [205, 180], [-228, 158]].forEach(([x, z], i) => {
  const c = makeCar(THREE, new THREE.Color().setHSL(rng.range(0, 1), 0.6, 0.52).getHex(), CAR_MODELS[i % CAR_MODELS.length]);
  c.mesh.position.set(x, groundHeight(x, z), z); c.heading = rng.range(0, 6.28); c.mesh.rotation.y = c.heading;
  scene.add(c.mesh); parked.push(c);
});
parked[0].mesh.children[0].material.color.set(0xff5a2a); // hero car: vivid sunset orange
parked[1].mesh.children[0].material.color.set(0x22b8cf); // stunt car: reef cyan
const G = {
  rng, world, traffic, peds, police: spawnPolice(THREE, scene), rivals: spawnRivals(THREE, scene, rng),
  weapons: WEAPONS, groundH: groundHeight,
  time: 0, clock: 17 * 60 + 42, cash: 250, rep: 0, health: 100, armor: 50,
  wanted: 0, sight: false, searchTimer: 0, searchPos: { x: 0, z: 0 }, bustTimer: 0, busts: 0,
  shells: 0, stunts: 0, kills: 0, exports: 0, topSpeed: 0,
  mission: -1, stage: 0, missionDone: false, completed: MISSIONS.map(() => false), nextMission: -1,
  stageBase: { shells: 0, stunts: 0, kills: 0 }, holdTimer: 0,
  feed: ['Welcome to the Coral Keys, courier.'], dialogue: null, banner: null,
  inCar: false, car: parked[0], weapon: 1, radio: 0, crewCd: [0, 0, 0], sefTimer: 0, niaTimer: 0,
  heading: 0, playerPos: new THREE.Vector3(6, 0, 22), district: 'Key Arena', prompt: '',
  muzzle: 0, stuntTimer: 0, lastStunt: null, atRamp: null, started: false, autopilot: AUTO,
  objective: null, objectivePos: null, missionHooks: {},
  teleport(x, z) { const p = G.inCar ? G.car.mesh.position : G.playerMesh.position; p.x = x; p.z = z; p.y = groundHeight(x, z); syncPos(); },
  enterCarAt(x, z) { if (!G.inCar) { G.inCar = true; G.car = parked[0]; } G.car.mesh.position.set(x, groundHeight(x, z), z); syncPos(); },
  respawn() { G.teleport(6, 22); G.wanted = 0; },
  witnessCheck(reason) { witness(reason); },
  tickLogic(dt) { G.time += dt; updateMissions(G); updateStunts(G); G.objective = missionObjective(G); },
};
window.__G = G;
// player mesh
const playerMesh = new THREE.Group();
{
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.9, 3, 10), new THREE.MeshLambertMaterial({ color: 0xff8c42 }));
  body.position.y = 1.05; body.castShadow = true; playerMesh.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 10), new THREE.MeshLambertMaterial({ color: 0xf2c49b }));
  head.position.y = 2.05; playerMesh.add(head);
  const gun = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.7), new THREE.MeshBasicMaterial({ color: 0x222831 }));
  gun.position.set(0.35, 1.35, 0.4); gun.name = 'gun'; playerMesh.add(gun);
}
playerMesh.position.copy(G.playerPos); scene.add(playerMesh);
G.playerMesh = playerMesh;
function syncPos() {
  if (G.inCar) G.playerPos.copy(G.car.mesh.position); else G.playerPos.copy(playerMesh.position);
  G.district = islandAt(G.playerPos.x, G.playerPos.z).name;
}
function witness(reason) {
  let nearest = 1e9;
  for (const p of peds) { const d = Math.hypot(p.mesh.position.x - G.playerPos.x, p.mesh.position.z - G.playerPos.z); if (d < nearest) nearest = d; }
  if (nearest < 26) {
    G.feed.push(`📞 Witness called the Key Patrol — "${reason}"`);
    addWanted(G, 1, reason);
  }
}
// crew abilities
function useCrew(i) {
  if (G.time < G.crewCd[i]) return;
  G.crewCd[i] = G.time + [20, 30, 25][i]; sfx.ui();
  if (i === 0) { G.niaTimer = 12; const clear = G.police.units.filter(u => !u.active).length; G.feed.push(`🧭 Nia — BRIDGE SCOUT: causeways scouted, ${clear} patrol gaps marked for 12s`); }
  if (i === 1) { if (G.inCar) { G.car.condition = Math.min(100, G.car.condition + 45); G.feed.push('🔧 Ruy — QUICK FIX: vehicle condition +45%'); } else G.feed.push('🔧 Ruy — QUICK FIX: get in a car first'); }
  if (i === 2) { G.sefTimer = 15; G.feed.push('👁 Sef — EYES OUT: shells & ramps marked on minimap for 15s'); }
}
// stealing / entering
function nearestStealable() {
  let best = null, bd = 5;
  for (const c of [...parked, ...traffic]) {
    if (c === G.car && G.inCar) continue;
    const d = Math.hypot(c.mesh.position.x - G.playerPos.x, c.mesh.position.z - G.playerPos.z);
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}
function stealOrEnter() {
  if (G.inCar) { G.inCar = false; playerMesh.position.set(G.car.mesh.position.x + 2.5, G.groundH(G.car.mesh.position.x, G.car.mesh.position.z), G.car.mesh.position.z); playerMesh.visible = true; syncPos(); return; }
  const c = nearestStealable();
  if (!c) return;
  const wasTraffic = traffic.includes(c) && !c.stolen;
  c.stolen = true; c.parked = false; G.car = c; G.inCar = true; playerMesh.visible = false;
  G.feed.push(`🚗 Driving: ${c.model}`);
  if (wasTraffic) { G.feed.push('🚨 Car stolen in plain sight!'); witness('Grand theft auto'); }
  syncPos();
}
// ---------- fixed-timestep update ----------
function step(dt) {
  G.time += dt; G.clock += dt * 0.35;
  if (G.dialogue) G.dialogue.t -= dt;
  if (G.banner) G.banner.t -= dt;
  if (G.sefTimer > 0) G.sefTimer -= dt;
  if (G.niaTimer > 0) G.niaTimer -= dt;
  // movement
  const fwd = keys.KeyW || keys.ArrowUp, back = keys.KeyS || keys.ArrowDown, left = keys.KeyA || keys.ArrowLeft, right = keys.KeyD || keys.ArrowRight;
  if (G.inCar) {
    driveCar(G.car, { fwd, back, left, right }, dt, groundHeight);
    G.heading = G.car.heading;
    G.topSpeed = Math.max(G.topSpeed, Math.abs(G.car.speed));
    if (Math.abs(G.car.speed) > 30 && rng.next() < dt * 0.1) G.car.condition = Math.max(5, G.car.condition - 1);
    sfx.engine(G.car.speed / 46, true);
  } else {
    const sp = keys.ShiftLeft ? 20 : 12;
    if (left) G.heading += dt * 2.6; if (right) G.heading -= dt * 2.6;
    const mv = (fwd ? 1 : back ? -0.6 : 0) * sp * dt;
    playerMesh.position.x += Math.sin(G.heading) * mv;
    playerMesh.position.z += Math.cos(G.heading) * mv;
    playerMesh.position.y = groundHeight(playerMesh.position.x, playerMesh.position.z);
    playerMesh.rotation.y = G.heading;
    sfx.engine(0, false);
  }
  syncPos();
  // prompt + steal
  const near = !G.inCar && nearestStealable();
  G.prompt = G.inCar ? 'E — EXIT VEHICLE' : near ? `E — STEAL ${near.model.toUpperCase()}` : '';
  if (wasPressed('KeyE')) stealOrEnter();
  if (wasPressed('KeyZ')) useCrew(0);
  if (wasPressed('KeyX')) useCrew(1);
  if (wasPressed('KeyC')) useCrew(2);
  if (wasPressed('KeyR')) { G.radio = (G.radio + 1) % 2; G.feed.push('📻 Radio: ' + ['Reef FM 98.9', 'Cayo Nights 105.3'][G.radio]); sfx.ui(); }
  for (let i = 1; i <= 6; i++) if (wasPressed('Digit' + i) && !WEAPONS[i - 1].locked) G.weapon = i - 1;
  // wanted sight/search
  if (G.wanted > 0) {
    let seen = G.police.heli.visible;
    for (const u of G.police.units) if (u.active && u.dist < 48) seen = true;
    G.sight = seen;
    if (seen) { G.searchTimer = 0; G.searchPos = { x: G.playerPos.x, z: G.playerPos.z }; }
    else { G.searchTimer += dt; if (G.searchTimer > 12) { addWanted(G, -1, ''); G.searchTimer = 0; if (G.wanted === 0) G.feed.push('✔ Key Patrol lost you — heat cleared'); } }
    if (G.bustTimer > 3) { G.bustTimer = 0; G.busts++; G.cash = Math.max(0, G.cash - 300); G.wanted = 0; G.feed.push('🚔 BUSTED — $300 fine. The Keys forgive, eventually.'); G.respawn(); }
  }
  updateTraffic(traffic, dt); updatePeds(peds, dt);
  updatePolice(G, dt); updateCombat(G, dt); updateStunts(G, dt); updateMissions(G);
  if (G.missionDone && G.completed[G.mission]) { /* exports tally once */ }
  G.objective = missionObjective(G);
  sfx.siren(G.wanted > 0, G.time);
  // camera
  if (!SHOT) {
    const back = G.inCar ? 13 : 8, h = G.inCar ? 5 : 3.4;
    const cx = G.playerPos.x - Math.sin(G.heading) * back, cz = G.playerPos.z - Math.cos(G.heading) * back;
    camera.position.lerp(new THREE.Vector3(cx, G.playerPos.y + h, cz), 0.12);
    camera.lookAt(G.playerPos.x + Math.sin(G.heading) * 8, G.playerPos.y + 1.5, G.playerPos.z + Math.cos(G.heading) * 8);
  }
  // objective ring pulse + shell spin handled in stunts
  if (world.ring) world.ring.rotation.z += dt;
  clearPressed();
}
// ---------- menus / keys ----------
initInput(); initAudio();
addEventListener('mousedown', () => { if (G.started && !SHOT) shoot(G, document.getElementById('dmg-layer')); });
addEventListener('keydown', e => {
  if (e.code === 'KeyM') { const s = document.getElementById('mapscreen'); const open = s.style.display === 'flex'; s.style.display = open ? 'none' : 'flex'; if (!open) renderMap(G); }
  if (e.code === 'Tab') { e.preventDefault(); const s = document.getElementById('statsscreen'); const open = s.style.display === 'flex'; s.style.display = open ? 'none' : 'flex'; if (!open) renderStats(G); }
  if (e.code === 'Escape') { document.getElementById('mapscreen').style.display = 'none'; document.getElementById('statsscreen').style.display = 'none'; }
});
document.getElementById('startbtn').onclick = () => { G.started = true; document.getElementById('title').style.display = 'none'; sfx.ui(); };
renderTitle(G);
startMission(G, 0);
// exports = completed delivery-style missions (cap display at 5)
Object.defineProperty(G, 'exports', { get() { return Math.min(5, G.completed.filter(Boolean).length); }, set() {} });

// ---------- shot setups ----------
function shotSetup() {
  G.started = true; document.getElementById('title').style.display = 'none';
  if (SHOT === 1) {
    // golden-hour bridge chase, low close cam, roadblock ahead, heli, named units
    G.inCar = true; G.car = parked[0]; playerMesh.visible = false;
    const bx = 128, bz = -96; G.car.mesh.position.set(bx, groundHeight(bx, bz), bz);
    G.car.heading = Math.atan2(250 - bx, -190 - bz); G.car.mesh.rotation.y = G.car.heading; G.car.speed = 34; G.heading = G.car.heading;
    G.wanted = 4; G.sight = true;
    const fx = Math.sin(G.car.heading), fz = Math.cos(G.car.heading);
    G.police.units[0].car.mesh.position.set(bx - fx * 15 + fz * 6, groundHeight(bx - fx * 15, bz - fz * 15), bz - fz * 15 - fx * 6);
    G.police.units[0].car.mesh.rotation.y = G.car.heading;
    G.police.units[1].car.mesh.position.set(bx - fx * 26 - fz * 5, groundHeight(bx - fx * 26, bz - fz * 26), bz - fz * 26 + fx * 5);
    G.police.units[1].car.mesh.rotation.y = G.car.heading;
    G.police.units[2].car.mesh.position.set(bx + fx * 40, groundHeight(bx + fx * 40, bz + fz * 40), bz + fz * 40); // roadblock ahead
    G.police.units[2].car.mesh.rotation.y = G.car.heading + Math.PI / 2;
    syncPos(); updatePolice(G, 0.1);
    G.police.heli.position.set(bx + fx * 34, 19, bz + fz * 34); G.police.heli.lookAt(bx, 0, bz);
    G.feed = ['📞 Witness called the Key Patrol — "Grand theft auto"', '★ Wanted 4/5 — Bridge chase on the Fort Cayo causeway', '🚁 HERON AIR overhead — spotlight live', 'REEF-2 is ramming! CAYO-3 roadblock ahead'];
    camera.position.set(bx - Math.sin(G.heading) * 13, G.playerPos.y + 3.0, bz - Math.cos(G.heading) * 13);
    camera.lookAt(bx + Math.sin(G.heading) * 20, G.playerPos.y + 1.0, bz + Math.cos(G.heading) * 20);
  }
  if (SHOT === 2) {
    G.clock = 21 * 60 + 15; applyNight();
    G.teleport(214, 190); G.heading = 2.4; playerMesh.rotation.y = 2.4;
    startMission(G, 2); G.stage = 1; G.objective = missionObjective(G);
    import('./combat.js').then(m => m.placeRivals(G, 222, 198));
    G.muzzle = 5; G.wanted = 2; G.sight = true;
    G.police.units[0].car.mesh.position.set(196, 0, 176);
    G.police.units[1].car.mesh.position.set(232, 0, 168);
    updatePolice(G, 0.01);
    G.feed.push('★ Wanted 2/5 — Shots fired at the Heron night market');
    G.dialogue = { name: 'Captain Ivo Marchetti', role: 'Dispatcher — Marchetti Freight', line: 'Guns out, courier. Protect the neon, protect the money.', t: 99 };
    const d = document.createElement('div'); d.className = 'dmgnum'; d.textContent = '-24'; d.style.left = '54%'; d.style.top = '33%'; d.style.animation = 'none'; d.style.fontSize = '30px'; document.getElementById('dmg-layer').appendChild(d);
    const d2 = document.createElement('div'); d2.className = 'dmgnum'; d2.textContent = '-18'; d2.style.left = '61%'; d2.style.top = '43%'; d2.style.animation = 'none'; d2.style.fontSize = '26px'; document.getElementById('dmg-layer').appendChild(d2);
    camera.position.set(206, 3.2, 178); camera.lookAt(220, 1.6, 196);
  }
  if (SHOT === 3) {
    G.inCar = true; G.car = parked[1]; playerMesh.visible = false;
    G.car.mesh.position.set(-40, 6.5, 120); G.car.airborne = true; G.car.vy = 6; G.car.speed = 38;
    G.car.heading = 0.5; G.car.mesh.rotation.set(-0.3, 0.5, 0.08); G.heading = 0.5;
    G.shells = 7; G.stunts = 3; G.lastStunt = { name: 'Arena South Rooftop', air: '1.24', bonus: 273 }; G.stuntTimer = 99;
    syncPos();
    G.feed.push('🌀 STUNT — Arena South Rooftop in progress…');
    camera.position.set(-50, 8, 110); camera.lookAt(-39.5, 6.2, 120.5);
  }
  if (SHOT === 4) {
    G.cash = 12480; G.rep = 385; G.shells = 14; G.stunts = 5; G.completed = [true, true, true, false, false, false, false]; G.kills = 9;
    const ms = document.getElementById('mapscreen'), ss = document.getElementById('statsscreen');
    ms.style.display = 'flex'; ms.style.width = '55%'; ms.style.right = 'auto'; ms.style.justifyContent = 'flex-start'; ms.style.paddingTop = '8px';
    document.getElementById('bigmap').style.width = '660px'; document.getElementById('bigmap').style.maxWidth = '96%';
    renderMap(G);
    ss.style.display = 'flex'; ss.style.left = '55%'; ss.style.width = '45%'; ss.style.background = '#0a0e18'; ss.style.justifyContent = 'flex-start'; ss.style.paddingTop = '8px'; ss.style.overflow = 'hidden';
    document.getElementById('stats-body').style.fontSize = '12px'; document.getElementById('stats-body').style.width = '96%';
    renderStats(G);
    document.querySelector('#statsscreen .bigpct').style.fontSize = '40px';
    document.querySelectorAll('#slots-stats .slot').forEach(s => { s.style.width = '96%'; s.style.padding = '5px 9px'; });
  }
  for (let i = 0; i < 20; i++) { updateTraffic(traffic, 0.5); updatePeds(peds, 0.5); }
  G.objective = missionObjective(G);
  updateHUD(G);
}
// ---------- loop ----------
let last = 0, acc = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  const now = ts / 1000; let dt = Math.min(0.1, now - (last || now)); last = now; acc += dt;
  if (G.started && !AUTO && !SHOT) { while (acc > 1 / 60) { step(1 / 60); acc -= 1 / 60; } updateHUD(G); }
  renderer.render(scene, camera);
}
if (SHOT) { shotSetup(); }
if (AUTO) { G.started = true; document.getElementById('title').style.display = 'none'; runAutopilot(G); updateHUD(G); }
requestAnimationFrame(frame);
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
