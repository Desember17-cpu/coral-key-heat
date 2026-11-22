// Keyboard + mouse input state.
export const keys = {};
export const pressed = {};
export function initInput() {
  addEventListener('keydown', e => { if (!keys[e.code]) pressed[e.code] = true; keys[e.code] = true; if (['Space','ArrowUp','ArrowDown'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', e => { keys[e.code] = false; });
}
export function clearPressed() { for (const k in pressed) delete pressed[k]; }
export function wasPressed(code) { return !!pressed[code]; }
