// Autopilot: deterministically completes mission 1 to a WIN state.
// Uses only seeded state — no wall-clock in logic — so two runs print identical strings.
export function runAutopilot(G) {
  const steps = [];
  const settle = n => { for (let i = 0; i < n; i++) G.tickLogic(1 / 60); };
  // Stage 1: walk to the marina crate and grab the cargo
  G.teleport(18, 30); steps.push('pickup'); settle(30);
  // Stage 2: drive the causeway to Palmetto Key
  G.enterCarAt(-235, -128); steps.push('causeway'); settle(30);
  // Stage 3: deliver at the Palmetto dock house
  G.teleport(-268, -168); steps.push('deliver'); settle(90);
  const errs = (window.__errors || []).length;
  const result = G.missionDone
    ? `AUTOPILOT WIN mission=1 cash=${G.cash} rep=${G.rep} steps=${steps.join(',')} errors=${errs}`
    : `AUTOPILOT FAIL mission=1 stage=${G.stage} errors=${errs}`;
  document.title = result;
  const el = document.getElementById('autopilot-result');
  if (el) el.textContent = result;
  return result;
}
