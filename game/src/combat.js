// Combat: on-foot shooting, muzzle glow, floating damage numbers, rivals, health/armor.
import { sfx } from './audio.js';
export function spawnRivals(THREE, scene, rng) {
  const rivals = [];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.85, 3, 8), new THREE.MeshLambertMaterial({ color: 0x333a45 }));
    body.position.y = 1; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), new THREE.MeshLambertMaterial({ color: 0xe8b48c }));
    head.position.y = 1.95; g.add(head);
    g.visible = false; scene.add(g);
    rivals.push({ mesh: g, hp: 60, active: false, x: 0, z: 0 });
  }
  return rivals;
}
export function placeRivals(G, cx, cz) {
  G.rivals.forEach((r, i) => {
    r.active = true; r.hp = 60; r.mesh.visible = true;
    r.x = cx + Math.cos(i * 2.1) * (6 + i * 2); r.z = cz + Math.sin(i * 2.1) * (6 + i * 2);
    r.mesh.position.set(r.x, G.groundH(r.x, r.z), r.z);
  });
}
export function shoot(G, dmgLayer) {
  if (G.inCar || G.weapon === 0) return;
  sfx.shot();
  G.muzzle = 0.07;
  // nearest rival in front within 40m
  let best = null, bd = 40;
  for (const r of G.rivals) {
    if (!r.active) continue;
    const d = Math.hypot(r.x - G.playerPos.x, r.z - G.playerPos.z);
    if (d < bd) { bd = d; best = r; }
  }
  const dmg = G.weapons[G.weapon].dmg + Math.floor(G.rng.range(0, 6));
  if (best) {
    best.hp -= dmg;
    const el = document.createElement('div');
    el.className = 'dmgnum'; el.textContent = '-' + dmg;
    el.style.left = (44 + G.rng.range(0, 12)) + '%'; el.style.top = (34 + G.rng.range(0, 10)) + '%';
    dmgLayer.appendChild(el); setTimeout(() => el.remove(), 800);
    if (best.hp <= 0) { best.active = false; best.mesh.visible = false; G.feed.push('Rival down at the market stall'); G.kills++; if (G.onRivalDown) G.onRivalDown(); }
  }
  if (G.witnessCheck) G.witnessCheck('Shots fired');
}
export function updateCombat(G, dt) {
  if (G.muzzle > 0) G.muzzle -= dt;
  // rivals shoot back when close
  for (const r of G.rivals) {
    if (!r.active) continue;
    const d = Math.hypot(r.x - G.playerPos.x, r.z - G.playerPos.z);
    if (d < 18 && G.rng.next() < dt * 0.5) {
      const absorbed = Math.min(G.armor, 4); G.armor -= absorbed; G.health -= (4 - absorbed);
      if (G.health <= 0) { G.health = 100; G.armor = 50; G.cash = Math.max(0, G.cash - 200); G.feed.push('WASTED — hospital bill $200, back on the keys'); G.respawn(); }
    }
  }
}
