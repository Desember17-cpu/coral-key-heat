// Key Patrol: named units, roles, pursuit AI, helicopter, dispatch feed data.
import { makeCar } from './vehicles.js';
export const UNIT_DEFS = [
  { name: 'REEF-1', role: 'PURSUIT' }, { name: 'REEF-2', role: 'RAMMING' },
  { name: 'CAYO-3', role: 'ROADBLOCK' }, { name: 'HERON-4', role: 'PURSUIT' },
  { name: 'PALM-5', role: 'SPOTLIGHT' }, { name: 'TIDE-6', role: 'ROADBLOCK' },
];
export function spawnPolice(THREE, scene) {
  const units = UNIT_DEFS.map((d, i) => {
    const c = makeCar(THREE, 0xf4f6f8, 'Key Patrol Interceptor');
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.28, 0.5),
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0x2266ff : 0xff3344 }));
    bar.position.set(0, 1.65, -0.2); c.mesh.add(bar);
    c.mesh.visible = false; scene.add(c.mesh);
    return { ...d, car: c, active: false, dist: 0 };
  });
  // helicopter HERON AIR
  const heli = new THREE.Group();
  const hb = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 7), new THREE.MeshPhongMaterial({ color: 0x2b3444 }));
  heli.add(hb);
  const rotor = new THREE.Mesh(new THREE.BoxGeometry(11, 0.12, 0.7), new THREE.MeshBasicMaterial({ color: 0x111111 }));
  rotor.position.y = 1.4; heli.add(rotor);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(4, 16, 12, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xfff6b0, transparent: true, opacity: 0.25, side: 2 }));
  beam.position.y = -8.5; heli.add(beam);
  heli.visible = false; scene.add(heli);
  return { units, heli, rotor };
}
export function updatePolice(G, dt) {
  const p = G.playerPos;
  const wantActive = G.wanted === 0 ? 0 : Math.min(6, G.wanted + 1);
  G.police.units.forEach((u, i) => {
    u.active = i < wantActive;
    u.car.mesh.visible = u.active;
    if (!u.active) return;
    const pos = u.car.mesh.position;
    const dx = p.x - pos.x, dz = p.z - pos.z;
    u.dist = Math.hypot(dx, dz);
    if (u.role === 'ROADBLOCK' && u.dist < 60) { /* hold position ahead */ }
    else {
      const sp = u.role === 'RAMMING' ? 34 : 30;
      const tx = p.x - Math.sin(G.heading) * (u.role === 'RAMMING' ? 0 : 10 + i * 3);
      const tz = p.z - Math.cos(G.heading) * (u.role === 'RAMMING' ? 0 : 10 + i * 3);
      const ddx = tx - pos.x, ddz = tz - pos.z, dd = Math.hypot(ddx, ddz) || 1;
      pos.x += (ddx / dd) * Math.min(sp * dt, dd); pos.z += (ddz / dd) * Math.min(sp * dt, dd);
      u.car.mesh.rotation.y = Math.atan2(ddx, ddz);
      u.car.mesh.position.y = G.groundH(pos.x, pos.z);
      u.car.speed = sp;
    }
    if (u.dist < 4 && G.wanted > 0) G.bustTimer += dt; else if (i === 0) G.bustTimer = Math.max(0, G.bustTimer - dt * 0.5);
  });
  const heliOn = G.wanted >= 4;
  G.police.heli.visible = heliOn;
  if (heliOn) {
    const h = G.police.heli;
    h.position.set(p.x + Math.sin(G.time * 0.4) * 22, 26, p.z + Math.cos(G.time * 0.4) * 22);
    h.lookAt(p.x, 0, p.z); G.police.rotor.rotation.y += dt * 30;
    G.sight = true;
  }
}
export function addWanted(G, n, reason) {
  const before = G.wanted;
  G.wanted = Math.max(0, Math.min(5, G.wanted + n));
  if (G.wanted > before) G.feed.push(`★ Wanted ${G.wanted}/5 — ${reason}`);
  if (G.wanted > 0) { G.sight = true; G.searchTimer = 0; }
}
