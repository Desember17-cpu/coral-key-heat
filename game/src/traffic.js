// Traffic AI (cars circulating islands & bridges) and pedestrians.
import { WORLD } from './config.js';
import { bridgePoint } from './islands.js';
import { makeCar } from './vehicles.js';

export function spawnTraffic(THREE, scene, rng) {
  const cars = [];
  const routes = [];
  WORLD.islands.forEach((isl, i) => routes.push({ type: 'ring', isl: i }));
  WORLD.bridges.forEach(([a, b]) => routes.push({ type: 'bridge', a, b }));
  for (let i = 0; i < 14; i++) {
    const c = makeCar(THREE, new THREE.Color().setHSL(rng.range(0, 1), 0.55, 0.5).getHex(), 'Traffic');
    c.route = routes[i % routes.length]; c.t = rng.range(0, 1); c.dir = rng.next() > 0.5 ? 1 : -1;
    c.cruise = rng.range(9, 15); c.parked = false; scene.add(c.mesh); cars.push(c);
  }
  return cars;
}
export function updateTraffic(cars, dt) {
  for (const c of cars) {
    if (c.stolen) continue;
    const r = c.route;
    if (r.type === 'ring') {
      const isl = WORLD.islands[r.isl];
      c.t += dt * c.cruise / (isl.r * 0.63) * c.dir;
      const a = c.t * Math.PI * 2, rad = isl.r * 0.63;
      const x = isl.x + Math.cos(a) * rad, z = isl.z + Math.sin(a) * rad;
      c.mesh.position.set(x, 0, z);
      c.mesh.rotation.y = -a + (c.dir > 0 ? 0 : Math.PI);
      c.heading = c.mesh.rotation.y; c.speed = c.cruise;
    } else {
      c.t += dt * c.cruise / 340 * c.dir;
      if (c.t > 1) { c.t = 1; c.dir = -1; } if (c.t < 0) { c.t = 0; c.dir = 1; }
      const p = bridgePoint(r.a, r.b, c.t), q = bridgePoint(r.a, r.b, c.t + 0.01 * c.dir);
      c.mesh.position.set(p.x + 3.5, p.y, p.z);
      c.mesh.lookAt(q.x + 3.5, p.y, q.z); c.speed = c.cruise;
    }
  }
}
export function spawnPeds(THREE, scene, rng) {
  const peds = [];
  const cols = [0xff6b81, 0x4ecdc4, 0xffe66d, 0xa78bfa, 0x7bed9f, 0xffa502];
  for (let i = 0; i < 26; i++) {
    const isl = WORLD.islands[i % 5];
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.8, 3, 8), new THREE.MeshLambertMaterial({ color: cols[i % cols.length] }));
    body.position.y = 1; body.castShadow = true; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), new THREE.MeshLambertMaterial({ color: 0xf2c49b }));
    head.position.y = 1.95; g.add(head);
    const a = rng.range(0, Math.PI * 2), rad = rng.range(8, isl.r * 0.75);
    g.position.set(isl.x + Math.cos(a) * rad, 0, isl.z + Math.sin(a) * rad);
    scene.add(g);
    peds.push({ mesh: g, isl, ang: a, rad, speed: rng.range(0.05, 0.14) * (rng.next() > 0.5 ? 1 : -1), witnessCd: 0 });
  }
  return peds;
}
export function updatePeds(peds, dt) {
  for (const p of peds) {
    p.ang += p.speed * dt;
    p.mesh.position.x = p.isl.x + Math.cos(p.ang) * p.rad;
    p.mesh.position.z = p.isl.z + Math.sin(p.ang) * p.rad;
    p.mesh.position.y = 0;
    if (p.witnessCd > 0) p.witnessCd -= dt;
  }
}
