// Stunt jumps + conch shell collection.
import { sfx } from './audio.js';
export function updateStunts(G, dt) {
  const p = G.playerPos;
  // shells
  for (const s of G.world.shells) {
    if (s.taken) continue;
    s.mesh.rotation.y += dt * 2;
    if (Math.hypot(s.x - p.x, s.z - p.z) < 3.2) {
      s.taken = true; s.mesh.visible = false; G.shells++;
      sfx.pickup(); G.feed.push(`🐚 Conch shell ${G.shells}/24 collected`);
      if (G.missionHooks.onShell) G.missionHooks.onShell();
    }
  }
  // ramp launch
  if (G.inCar && !G.car.airborne) {
    for (const r of G.world.ramps) {
      if (Math.hypot(r.x - p.x, r.z - p.z) < 6 && Math.abs(G.car.speed) > 20) {
        G.car.launchVy = 11 + Math.abs(G.car.speed) * 0.12; G.atRamp = r; break;
      }
    }
  }
  if (G.car.justLanded) {
    const at = G.car.justLanded; G.car.justLanded = 0;
    if (at > 0.45) {
      const bonus = Math.round(at * 220);
      G.stunts++; G.cash += bonus; G.lastStunt = { name: G.atRamp ? G.atRamp.name : 'Bridge Jump', air: at.toFixed(2), bonus };
      G.stuntTimer = 3.2; sfx.stunt();
      G.feed.push(`STUNT — ${G.lastStunt.name}: ${G.lastStunt.air}s air, +$${bonus}`);
      if (G.missionHooks.onStunt) G.missionHooks.onStunt();
    }
  }
  if (G.stuntTimer > 0) G.stuntTimer -= dt;
}
