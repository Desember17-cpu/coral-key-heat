// World building: five coral keys, bridges, roads, buildings, marinas, ramps, shells.
import { WORLD, STUNT_SPOTS } from './config.js';

export function bridgePoint(a, b, t) {
  const A = WORLD.islands[a], B = WORLD.islands[b];
  return { x: A.x + (B.x - A.x) * t, z: A.z + (B.z - A.z) * t, y: Math.sin(t * Math.PI) * 7 };
}
export function groundHeight(x, z) {
  // bridges first
  for (const [a, b] of WORLD.bridges) {
    const A = WORLD.islands[a], B = WORLD.islands[b];
    const dx = B.x - A.x, dz = B.z - A.z, L2 = dx * dx + dz * dz;
    let t = ((x - A.x) * dx + (z - A.z) * dz) / L2; t = Math.max(0, Math.min(1, t));
    const px = A.x + dx * t, pz = A.z + dz * t;
    const d = Math.hypot(x - px, z - pz);
    if (d < 11 && t > 0.12 && t < 0.88) return Math.sin(t * Math.PI) * 7;
  }
  for (const isl of WORLD.islands) if (Math.hypot(x - isl.x, z - isl.z) < isl.r) return 0;
  return -3; // water / shallows
}
export function islandAt(x, z) {
  let best = null, bd = 1e9;
  for (const isl of WORLD.islands) { const d = Math.hypot(x - isl.x, z - isl.z); if (d < bd) { bd = d; best = isl; } }
  return bd < best.r + 40 ? best : { name: 'Open Water — The Causeways' };
}

export function buildWorld(THREE, scene, rng) {
  const out = { shells: [], ramps: [], rings: [] };
  // sky gradient via large sphere shader-free: fog + background handled in main; water:
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshPhongMaterial({ color: 0x1fb6b2, shininess: 120, specular: 0xbfefff }));
  water.rotation.x = -Math.PI / 2; water.position.y = WORLD.waterLevel; scene.add(water);
  const sandMat = new THREE.MeshLambertMaterial({ color: 0xf2d492 });
  WORLD.islands.forEach((isl, ii) => {
    const sand = new THREE.Mesh(new THREE.CylinderGeometry(isl.r + 10, isl.r + 16, 3, 28), sandMat);
    sand.position.set(isl.x, -1.6, isl.z); scene.add(sand);
    const grass = new THREE.Mesh(new THREE.CylinderGeometry(isl.r, isl.r + 4, 3.2, 28), new THREE.MeshLambertMaterial({ color: isl.color }));
    grass.position.set(isl.x, -1.4, isl.z); grass.receiveShadow = true; scene.add(grass);
    // ring road
    const road = new THREE.Mesh(new THREE.RingGeometry(isl.r * 0.55, isl.r * 0.72, 28), new THREE.MeshBasicMaterial({ color: 0x3a3f4a }));
    road.rotation.x = -Math.PI / 2; road.position.set(isl.x, 0.06, isl.z); scene.add(road);
    const spoke = new THREE.Mesh(new THREE.PlaneGeometry(isl.r * 1.8, 10), new THREE.MeshBasicMaterial({ color: 0x3a3f4a }));
    spoke.rotation.x = -Math.PI / 2; spoke.position.set(isl.x, 0.05, isl.z); scene.add(spoke);
    // buildings with emissive windows
    const n = 14 + ii * 3;
    for (let i = 0; i < n; i++) {
      const ang = rng.range(0, Math.PI * 2), rad = rng.range(isl.r * 0.15, isl.r * 0.85);
      const bx = isl.x + Math.cos(ang) * rad, bz = isl.z + Math.sin(ang) * rad;
      if (Math.abs(((ang % (Math.PI * 2)) )) < 0.01) continue;
      const h = rng.range(6, 26 + ii * 4), w = rng.range(5, 10);
      const bmat = new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(rng.range(0.02, 0.13), 0.45, rng.range(0.45, 0.7)) });
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), bmat);
      b.position.set(bx, h / 2, bz); b.castShadow = true; scene.add(b);
      const win = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, h * 0.7, w + 0.2),
        new THREE.MeshBasicMaterial({ color: isl.skyline, transparent: true, opacity: 0.28 }));
      win.position.copy(b.position); scene.add(win);
    }
    // palms
    for (let i = 0; i < 10; i++) {
      const ang = rng.range(0, Math.PI * 2), rad = rng.range(isl.r * 0.8, isl.r * 0.98);
      const px = isl.x + Math.cos(ang) * rad, pz = isl.z + Math.sin(ang) * rad;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 6, 6), new THREE.MeshLambertMaterial({ color: 0x8a5a33 }));
      trunk.position.set(px, 3, pz); scene.add(trunk);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.4, 7), new THREE.MeshLambertMaterial({ color: 0x2e9e5b }));
      crown.position.set(px, 6.8, pz); scene.add(crown);
    }
    // marina: dock + boats
    const dock = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 6), new THREE.MeshLambertMaterial({ color: 0x9a6b45 }));
    dock.position.set(isl.x + 16, 0.4, isl.z + isl.r * 0.9); scene.add(dock);
    for (let i = 0; i < 3; i++) {
      const boat = new THREE.Mesh(new THREE.BoxGeometry(3, 1.4, 7), new THREE.MeshLambertMaterial({ color: [0xffffff, 0xff6b81, 0x4ecdc4][i] }));
      boat.position.set(isl.x + 8 + i * 8, 0.2, isl.z + isl.r * 0.9 + 7); scene.add(boat);
    }
  });
  // bridges: deck segments following arc
  const deckMat = new THREE.MeshLambertMaterial({ color: 0x565d6b });
  const railMat = new THREE.MeshBasicMaterial({ color: 0xffcf6e });
  for (const [a, b] of WORLD.bridges) {
    for (let s = 0; s < 20; s++) {
      const t = (s + 0.5) / 20, p = bridgePoint(a, b, t), q = bridgePoint(a, b, (s + 1) / 20);
      const seg = new THREE.Mesh(new THREE.BoxGeometry(16, 1.2, Math.hypot(q.x - p.x, q.z - p.z) + 2), deckMat);
      seg.position.set(p.x, p.y - 0.6, p.z); seg.lookAt(q.x, p.y - 0.6, q.z); scene.add(seg);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(16.6, 0.5, 1), railMat);
      rail.position.set(p.x, p.y + 0.4, p.z); rail.lookAt(q.x, p.y + 0.4, q.z); scene.add(rail);
    }
  }
  // stunt ramps
  const rampMat = new THREE.MeshLambertMaterial({ color: 0xff8c42 });
  for (const s of STUNT_SPOTS) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(9, 2.4, 12), rampMat);
    const gy = Math.max(0, groundHeight(s.x, s.z));
    r.position.set(s.x, gy + 1, s.z); r.rotation.x = -0.32; scene.add(r);
    out.ramps.push({ ...s, mesh: r, used: false });
  }
  // conch shells: 24 collectibles (spiral-ish: torus + sphere)
  const shellMat = new THREE.MeshPhongMaterial({ color: 0xff9fb2, emissive: 0x228888, shininess: 80 });
  for (let i = 0; i < 24; i++) {
    const isl = WORLD.islands[i % 5];
    const ang = rng.range(0, Math.PI * 2), rad = rng.range(10, isl.r * 0.8);
    const sx = isl.x + Math.cos(ang) * rad, sz = isl.z + Math.sin(ang) * rad;
    const grp = new THREE.Group();
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.42, 8, 14), shellMat); grp.add(t);
    const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), shellMat); s2.position.x = 0.9; grp.add(s2);
    grp.position.set(sx, 1.1, sz); scene.add(grp);
    out.shells.push({ mesh: grp, x: sx, z: sz, taken: false });
  }
  // objective ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4, 0.35, 8, 24), new THREE.MeshBasicMaterial({ color: 0xffd23e }));
  ring.rotation.x = Math.PI / 2; scene.add(ring); out.ring = ring;
  return out;
}
