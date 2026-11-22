// Title screen, full map (M), stats/save screen (Tab) with 3 localStorage slots.
import { WORLD, MISSIONS, RANKS } from './config.js';
import { drawMinimap } from './minimap.js';
import { percentComplete, rankFor } from './hud.js';
const $ = id => document.getElementById(id);
const SAVE_KEY = 'coral-key-heat-save-';
export function saveSlot(G, i) {
  const data = { cash: G.cash, rep: G.rep, shells: G.shells, stunts: G.stunts, completed: G.completed, exports: G.exports, pct: percentComplete(G) };
  localStorage.setItem(SAVE_KEY + i, JSON.stringify(data)); return data;
}
export function loadSlot(G, i) {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY + i));
    if (!d) return false;
    G.cash = d.cash; G.rep = d.rep; G.shells = d.shells; G.stunts = d.stunts; G.completed = d.completed; G.exports = d.exports || 0;
    return true;
  } catch (e) { return false; }
}
export function slotSummary(i) {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY + i));
    if (!d) return `SLOT ${i + 1} — EMPTY<br><span>Start a new run on the Keys</span>`;
    return `SLOT ${i + 1} — $${d.cash.toLocaleString('en-US')} • ${d.pct}% COMPLETE<br><span>${d.completed.filter(Boolean).length}/7 missions • 🐚 ${d.shells}/24 • REP ${d.rep}</span>`;
  } catch (e) { return `SLOT ${i + 1} — EMPTY`; }
}
export function renderTitle(G) {
  $('slots-title').innerHTML = [0, 1, 2].map(i => `<button class="slot" data-slot="${i}">${slotSummary(i)}</button>`).join('');
  document.querySelectorAll('#slots-title .slot').forEach(b => b.onclick = () => { loadSlot(G, +b.dataset.slot); G.started = true; $('title').style.display = 'none'; });
}
export function renderMap(G) {
  drawMinimap(G, $('bigmap'), true);
  $('map-standings').innerHTML = WORLD.islands.map(i => `<div class="stand"><b>${i.name}</b><div class="rbar"><i style="width:${i.standing}%"></i></div><span>Standing ${i.standing}%</span></div>`).join('');
}
export function renderStats(G) {
  const pct = percentComplete(G);
  const { cur, next } = rankFor(G.rep);
  $('stats-body').innerHTML =
    `<div class="bigpct">${pct}% COMPLETE</div>` +
    `<div class="check">✔ Missions ${G.completed.filter(Boolean).length}/7 &nbsp; ✔ Stunts ${G.stunts}/8 &nbsp; ✔ Shells 🐚 ${G.shells}/24 &nbsp; ✔ Exports ${G.exports}/5</div>` +
    `<h3>PER-MISSION MEDALS</h3>` + MISSIONS.map((m, i) => `<div class="medal">${G.completed[i] ? '🥇' : '⬜'} ${m.title} — ${G.completed[i] ? 'GOLD • $' + m.pay + ' • +' + m.rep + ' REP' : 'not run yet'}</div>`).join('') +
    `<h3>CAREER</h3><div class="career">Cash $${G.cash.toLocaleString('en-US')} • Kills ${G.kills} • Busts ${G.busts} • Top speed ${Math.round(G.topSpeed * 3.6)} km/h • Playtime ${Math.floor(G.time / 60)}m ${Math.floor(G.time % 60)}s</div>` +
    `<h3>RANK LADDER</h3>` + RANKS.map(r => `<div class="rank ${G.rep >= r.at ? 'got' : ''}">${r.at} REP — ${r.title}</div>`).join('') +
    `<div class="next-unlock">NEXT UNLOCK: ${next ? next.title + ' at ' + next.at + ' REP' : 'Storm Cannon — finish The Storm Run'}</div>` +
    `<h3>SAVE SLOTS</h3><div id="slots-stats">${[0, 1, 2].map(i => `<button class="slot" data-s="${i}">${slotSummary(i)}</button>`).join('')}</div>` +
    `<div class="hint">Click a slot to SAVE • S = screenshot-friendly pause • Esc closes</div>`;
  document.querySelectorAll('#slots-stats .slot').forEach(b => b.onclick = () => { saveSlot(G, +b.dataset.s); renderStats(G); });
}
