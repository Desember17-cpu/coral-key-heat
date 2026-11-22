// HUD: four-side layout — mission/dispatch TL, clock/cash/wanted/weapon wheel TR,
// minimap + respect BL, radio + vehicle BR, dialogue BC, crew cards, banners, feed.
import { WEAPONS, CREW, RADIO, RANKS, MISSIONS } from './config.js';
import { drawMinimap } from './minimap.js';
const $ = id => document.getElementById(id);
export function rankFor(rep) {
  let cur = RANKS[0], next = null;
  for (let i = 0; i < RANKS.length; i++) { if (rep >= RANKS[i].at) cur = RANKS[i]; else { next = RANKS[i]; break; } }
  return { cur, next };
}
export function updateHUD(G) {
  // TL mission panel
  const obj = G.objective;
  if (obj && !obj.done) {
    $('mission-panel').innerHTML = `<div class="mp-title">📋 ${obj.m.title}</div>` +
      `<div class="mp-stage">STAGE ${obj.stage + 1}/${obj.total} — ${obj.s.text}</div>` +
      `<div class="mp-next">NEXT: ${obj.s.mech}</div>` +
      `<div class="mp-dist">Objective ${Math.round(Math.hypot(obj.s.at[0] - G.playerPos.x, obj.s.at[1] - G.playerPos.z))} m</div>`;
    G.objectivePos = obj.s.at;
  } else if (obj && obj.done) {
    $('mission-panel').innerHTML = `<div class="mp-title">📋 ${obj.m.title} — COMPLETE</div><div class="mp-stage">All 7 story jobs run through Captain Ivo Marchetti.</div><div class="mp-next">NEXT: Free-roam the Keys — shells, stunts, exports.</div>`;
    G.objectivePos = null;
  }
  // dispatch under mission panel
  const units = G.police.units.filter(u => u.active);
  $('dispatch').innerHTML = `<div class="dp-head">📻 KEY PATROL DISPATCH ${G.wanted ? '' : '— all quiet'}</div>` +
    (units.length ? units.map(u => `<div class="dp-row"><b>${u.name}</b> <span>${u.role}</span> <i>${Math.round(u.dist)} m</i></div>`).join('') +
      (G.police.heli.visible ? `<div class="dp-row"><b>HERON AIR</b> <span>SPOTLIGHT</span> <i>${Math.round(Math.hypot(G.police.heli.position.x - G.playerPos.x, G.police.heli.position.z - G.playerPos.z))} m</i></div>` : '')
      : '<div class="dp-row">No units dispatched. The Keys are calm.</div>') +
    `<div class="dp-feed">${G.feed.slice(-4).map(f => `<div>› ${f}</div>`).join('')}</div>`;
  // TR clock / cash / wanted / weapon wheel
  const hh = String(Math.floor(G.clock / 60)).padStart(2, '0'), mm = String(Math.floor(G.clock % 60)).padStart(2, '0');
  $('clock').textContent = `🕕 ${hh}:${mm} • ${G.district}`;
  $('cash').textContent = '$' + G.cash.toLocaleString('en-US');
  $('wanted').innerHTML = '★'.repeat(G.wanted) + '<span class="dim">' + '★'.repeat(5 - G.wanted) + '</span>' +
    (G.wanted ? `<div class="wstate">${G.sight ? 'IN SIGHT' : 'SEARCHING'}</div>` : '');
  $('health').innerHTML = `❤ ${Math.ceil(G.health)} <span class="armor">🛡 ${Math.ceil(G.armor)}</span>` +
    `<div class="hbar"><i style="width:${G.health}%"></i></div>`;
  $('wheel').innerHTML = WEAPONS.map((w, i) =>
    `<div class="wslot ${i === G.weapon ? 'sel' : ''} ${w.locked ? 'locked' : ''}"><span>${w.locked ? '🔒' : w.icon}</span><b>${w.name}</b><i>${w.locked ? '$' + w.price : w.ammo + ' rnd'}</i></div>`).join('');
  // BL minimap + respect
  drawMinimap(G, $('minimap'));
  $('district').textContent = '📍 ' + G.district;
  const { cur, next } = rankFor(G.rep);
  const totalRep = 755;
  $('respect').innerHTML = `RESPECT — ${cur.title} <div class="rbar"><i style="width:${Math.min(100, G.rep / totalRep * 100)}%"></i></div><span>${G.rep}/${totalRep} REP ${next ? '• next: ' + next.title : '• MAX RANK'}</span>`;
  // BR radio + vehicle
  const st = RADIO[G.radio];
  $('radio').innerHTML = `📻 <b>${st.name}</b><br>♪ ${st.track}`;
  if (G.inCar) {
    $('vehicle').innerHTML = `<b>${G.car.model}</b> • CONDITION ${Math.round(G.car.condition)}%` +
      `<div class="speed">${Math.round(Math.abs(G.car.speed) * 3.6)}</div><span>km/h • GEAR ${G.car.speed < -0.5 ? 'R' : G.car.speed < 1 ? 'N' : G.car.speed < 14 ? '1' : G.car.speed < 26 ? '2' : G.car.speed < 38 ? '3' : '4'}</span>`;
  } else $('vehicle').innerHTML = `<b>ON FOOT</b> • Coral Keys<br><span>Find a car — press E to steal</span>`;
  // crew cards
  $('crew').innerHTML = CREW.map((c, i) => {
    const cd = Math.max(0, Math.ceil(G.crewCd[i] - G.time));
    return `<div class="crew ${cd ? 'oncd' : ''}"><div class="avatar" style="background:${['#ff9f43', '#54a0ff', '#1dd1a1'][i]}">${c.name[0]}</div><div><b>${c.name} — ${c.role} [${c.key}]</b><br><span>${cd ? 'Cooldown ' + cd + 's' : c.desc}</span></div></div>`;
  }).join('');
  // shells + prompt + dialogue + banner + stunt
  $('shells').textContent = `🐚 ${G.shells}/24`;
  $('prompt').textContent = G.prompt || '';
  $('prompt').style.opacity = G.prompt ? 1 : 0;
  if (G.dialogue && G.dialogue.t > 0) {
    $('dialogue').style.display = 'flex';
    $('dlg-name').textContent = G.dialogue.name; $('dlg-role').textContent = G.dialogue.role; $('dlg-line').textContent = '“' + G.dialogue.line + '”';
  } else $('dialogue').style.display = 'none';
  if (G.banner && G.banner.t > 0) {
    $('banner').style.display = 'block';
    $('banner').innerHTML = `<div class="b-title">${G.banner.title}</div><div class="b-sub">${G.banner.sub}</div>`;
  } else $('banner').style.display = 'none';
  if (G.stuntTimer > 0 && G.lastStunt) {
    $('stunt').style.display = 'block';
    $('stunt').innerHTML = `🌀 STUNT — ${G.lastStunt.name}<br>AIR TIME ${G.lastStunt.air}s • BONUS +$${G.lastStunt.bonus} • STUNTS ${G.stunts}/8`;
  } else $('stunt').style.display = 'none';
  if (G.muzzle > 0) $('muzzle').style.opacity = 1; else $('muzzle').style.opacity = 0;
}
export function percentComplete(G) {
  const m = G.completed.filter(Boolean).length;
  return Math.round((m / 7) * 55 + (G.stunts / 8) * 15 + (G.shells / 24) * 20 + Math.min(10, G.exports * 2));
}
