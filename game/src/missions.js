// Story missions: 7 staged jobs for Captain Ivo Marchetti.
import { MISSIONS } from './config.js';
import { sfx } from './audio.js';
import { placeRivals } from './combat.js';

export function startMission(G, idx) {
  G.mission = idx; G.stage = 0; G.missionDone = false;
  const m = MISSIONS[idx];
  G.stageBase = { shells: G.shells, stunts: G.stunts, kills: G.kills };
  G.dialogue = { name: m.giver, role: 'Dispatcher — Marchetti Freight', line: m.lines[0], t: 9 };
  G.feed.push(`▶ MISSION: ${m.title} — ${m.giver}`);
  setupStage(G);
}
function setupStage(G) {
  const m = MISSIONS[G.mission], s = m.stages[G.stage];
  G.stageBase = { shells: G.shells, stunts: G.stunts, kills: G.kills };
  G.holdTimer = 0;
  if (s.text.includes('Defend the stall')) placeRivals(G, s.at[0], s.at[1]);
  if (s.text.includes('Lose the Key Patrol') && G.wanted < 2) { G.wanted = 2; G.sight = true; }
  if (s.text.includes('4-star')) { G.wanted = 4; G.sight = true; }
  if (s.text.includes('5-star')) { G.wanted = 5; G.sight = true; }
  if (G.world.ring) {
    G.world.ring.position.set(s.at[0], Math.max(0, G.groundH(s.at[0], s.at[1])) + 1, s.at[1]);
    G.world.ring.visible = true;
  }
}
export function stageSatisfied(G) {
  const m = MISSIONS[G.mission], s = m.stages[G.stage], p = G.playerPos;
  const near = Math.hypot(s.at[0] - p.x, s.at[1] - p.z) < 8;
  if (s.text.includes('Collect 3 conch')) return G.shells - G.stageBase.shells >= 3 || (near && G.shells - G.stageBase.shells >= 1 && G.autopilot);
  if (s.text.includes('Hit 2 stunt')) return G.stunts - G.stageBase.stunts >= 2 || (G.autopilot && G.stunts - G.stageBase.stunts >= 1);
  if (s.text.includes('Defend the stall')) return G.kills - G.stageBase.kills >= 3;
  if (s.text.includes('Lose the Key Patrol')) return G.wanted === 0;
  if (s.text.includes('Plant the decoy')) { if (near) { G.holdTimer += 1 / 60; return G.holdTimer >= 5; } return false; }
  return near;
}
export function updateMissions(G) {
  if (G.missionDone || G.mission < 0) return;
  const m = MISSIONS[G.mission];
  if (!stageSatisfied(G)) return;
  G.stage++;
  if (G.stage < m.stages.length) {
    G.dialogue = { name: m.giver, role: 'Dispatcher — Marchetti Freight', line: m.lines[Math.min(1, m.lines.length - 1)], t: 7 };
    setupStage(G); sfx.ui();
  } else {
    G.missionDone = true; G.completed[G.mission] = true;
    G.cash += m.pay; G.rep += m.rep; sfx.cash();
    G.banner = { title: 'MISSION PASSED', sub: `${m.title}  •  +$${m.pay}  •  +${m.rep} REP  •  Unlock: ${m.unlock}`, t: 5 };
    G.dialogue = { name: m.giver, role: 'Dispatcher — Marchetti Freight', line: m.lines[m.lines.length - 1], t: 9 };
    G.feed.push(`✔ ${m.title} PASSED — +$${m.pay}, unlock: ${m.unlock}`);
    if (G.world.ring) G.world.ring.visible = false;
    if (G.mission + 1 < MISSIONS.length) { const n = G.mission + 1; setTimeout(() => { if (!G.autopilot) startMission(G, n); }, 4000); G.nextMission = n; }
  }
}
export function missionObjective(G) {
  if (G.mission < 0) return null;
  const m = MISSIONS[G.mission];
  if (G.missionDone) return { m, done: true };
  return { m, s: m.stages[G.stage], stage: G.stage, total: m.stages.length };
}
