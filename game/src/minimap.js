// Round textured minimap + full-map helpers: islands, roads/bridges, blips, search zone.
import { WORLD } from './config.js';
export function worldToMap(x, z, size, range) {
  return [size / 2 + (x / range) * size / 2, size / 2 + (z / range) * size / 2];
}
export function drawMinimap(G, canvas, full = false) {
  const ctx = canvas.getContext('2d');
  const S = canvas.width, range = full ? 720 : 260;
  const cx = full ? 0 : G.playerPos.x, cz = full ? 0 : G.playerPos.z;
  // water texture
  const grd = ctx.createRadialGradient(S/2, S/2, 10, S/2, S/2, S/2);
  grd.addColorStop(0, '#2ad4c8'); grd.addColorStop(1, '#0e7d94');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(S/2, S/2, (i+1)*S/14, 0, 7); ctx.stroke(); }
  const px = (x) => S/2 + ((x - cx) / range) * S;
  const pz = (z) => S/2 + ((z - cz) / range) * S;
  // bridges as roads
  ctx.strokeStyle = '#454b58'; ctx.lineWidth = full ? 7 : 5;
  for (const [a, b] of WORLD.bridges) {
    const A = WORLD.islands[a], B = WORLD.islands[b];
    ctx.beginPath(); ctx.moveTo(px(A.x), pz(A.z)); ctx.lineTo(px(B.x), pz(B.z)); ctx.stroke();
  }
  // islands
  for (const isl of WORLD.islands) {
    ctx.fillStyle = '#f2d492'; ctx.beginPath(); ctx.arc(px(isl.x), pz(isl.z), isl.r / range * S, 0, 7); ctx.fill();
    ctx.fillStyle = '#bfe3a0'; ctx.beginPath(); ctx.arc(px(isl.x), pz(isl.z), isl.r * 0.82 / range * S, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3a3f4a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px(isl.x), pz(isl.z), isl.r * 0.63 / range * S, 0, 7); ctx.stroke();
    if (full) { ctx.fillStyle = '#20303a'; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center'; ctx.fillText(isl.name, px(isl.x), pz(isl.z) + 4); }
  }
  // search zone
  if (G.wanted > 0 && !G.sight) {
    ctx.fillStyle = 'rgba(255,60,60,.25)';
    ctx.beginPath(); ctx.arc(px(G.searchPos.x), pz(G.searchPos.z), 60 / range * S, 0, 7); ctx.fill();
  }
  // shells (when Sef active or full map)
  if (full || G.sefTimer > 0) {
    ctx.fillStyle = '#ff9fb2';
    for (const s of G.world.shells) if (!s.taken) { ctx.beginPath(); ctx.arc(px(s.x), pz(s.z), 3, 0, 7); ctx.fill(); }
  }
  // police blips
  ctx.fillStyle = '#2266ff';
  for (const u of G.police.units) if (u.active) { const p = u.car.mesh.position; ctx.fillRect(px(p.x) - 3, pz(p.z) - 3, 6, 6); }
  if (G.police.heli.visible) { ctx.fillStyle = '#ff3344'; ctx.beginPath(); ctx.arc(px(G.police.heli.position.x), pz(G.police.heli.position.z), 4, 0, 7); ctx.fill(); }
  // traffic dots
  ctx.fillStyle = '#ffffff';
  for (const c of G.traffic) { ctx.beginPath(); ctx.arc(px(c.mesh.position.x), pz(c.mesh.position.z), 2, 0, 7); ctx.fill(); }
  // objective + GPS route
  const obj = G.objectivePos;
  if (obj) {
    ctx.strokeStyle = '#ffd23e'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(px(G.playerPos.x), pz(G.playerPos.z)); ctx.lineTo(px(obj[0]), pz(obj[1])); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ffd23e'; ctx.beginPath(); ctx.arc(px(obj[0]), pz(obj[1]), 6, 0, 7); ctx.fill();
  }
  // player arrow
  ctx.save(); ctx.translate(px(G.playerPos.x), pz(G.playerPos.z)); ctx.rotate(-G.heading);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(5, 6); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill(); ctx.restore();
}
