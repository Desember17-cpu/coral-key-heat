// CORAL KEY HEAT — central configuration: keys, bridges, missions, weapons, crew, radio.
export const WORLD = {
  seed: 1792026,
  waterLevel: -1.2,
  islands: [
    { id: 'arena',    name: 'Key Arena',    x: 0,    z: 0,    r: 95,  color: 0xe8c98a, skyline: 0xffb36b, standing: 62 },
    { id: 'palmetto', name: 'Palmetto Key', x: -260, z: -150, r: 80,  color: 0xd9e6a3, skyline: 0x7fe0c3, standing: 41 },
    { id: 'fortcayo', name: 'Fort Cayo',    x: 250,  z: -190, r: 85,  color: 0xf0b28a, skyline: 0xff7e5f, standing: 28 },
    { id: 'heron',    name: 'Heron Key',    x: 210,  z: 190,  r: 78,  color: 0xa8d8ea, skyline: 0x9db4ff, standing: 47 },
    { id: 'shallows', name: 'The Shallows', x: -240, z: 170,  r: 70,  color: 0xf7e3a1, skyline: 0xffe29a, standing: 15 },
  ],
  // bridges connect island index pairs
  bridges: [[0,1],[0,2],[0,3],[0,4],[1,4],[2,3]],
};
export const WEAPONS = [
  { name: 'Fists',      icon: '✊', ammo: '∞', price: 0,    locked: false, dmg: 6 },
  { name: 'Reef Pistol',icon: '🔫', ammo: '48', price: 0,   locked: false, dmg: 18 },
  { name: 'Cayo SMG',   icon: '💥', ammo: '120', price: 2400, locked: false, dmg: 12 },
  { name: 'Tide Rifle', icon: '🎯', ammo: '90', price: 5200,  locked: true,  dmg: 26 },
  { name: 'Harpoon X',  icon: '🗡️', ammo: '12', price: 8900,  locked: true,  dmg: 55 },
  { name: 'Storm Cannon',icon:'⚡', ammo: '6',  price: 15000, locked: true,  dmg: 90 },
];
export const CREW = [
  { name: 'Nia', role: 'BRIDGE SCOUT', key: 'Z', cd: 20, desc: 'Reveals the clearest bridge + patrol gaps for 12s.' },
  { name: 'Ruy', role: 'QUICK FIX',    key: 'X', cd: 30, desc: 'Field-repairs your vehicle by 45% condition.' },
  { name: 'Sef', role: 'EYES OUT',     key: 'C', cd: 25, desc: 'Marks shells & stunt ramps on the minimap for 15s.' },
];
export const RADIO = [
  { name: 'Reef FM 98.9',   track: 'Turquoise Static — Low Tide Love' },
  { name: 'Cayo Nights 105.3', track: 'Marina Violeta — Neon on the Causeway' },
];
export const DISPATCHER = { name: 'Captain Ivo Marchetti', role: 'Dispatcher — Marchetti Freight', color: '#ffb36b' };
export const MISSIONS = [
  { title: 'First Tide Run', giver: 'Captain Ivo Marchetti', pay: 850, rep: 40, unlock: 'Reef Pistol holster + Palmetto Key routes',
    stages: [
      { text: 'Pick up the sealed crate at the Key Arena marina', mech: 'Follow the gold blip; walk into the ring to grab cargo.', at: [18, 30] },
      { text: 'Drive the causeway to Palmetto Key', mech: 'Bridges are fast but patrolled — watch the dispatch panel.', at: [-235, -128] },
      { text: 'Drop the crate at the Palmetto dock house', mech: 'Park inside the green ring and hold position to unload.', at: [-268, -168] },
    ],
    lines: ['Ivo here. One crate, no questions, Palmetto before the tide turns.', 'Causeway is hot today — Key Patrol loves a bridge. Keep it smooth.', 'Delivered clean. The Keys are starting to know your name.'] },
  { title: 'Conch Money', giver: 'Captain Ivo Marchetti', pay: 1200, rep: 55, unlock: 'Shell tracker on minimap',
    stages: [
      { text: 'Collect 3 conch shells on Key Arena', mech: 'Shells glow teal — Sef [C] can mark them for you.', at: [40, -40] },
      { text: 'Meet the buyer at Fort Cayo', mech: 'Cross the east bridge; a witness may call the patrol.', at: [238, -170] },
      { text: 'Lose the Key Patrol', mech: 'Break line of sight until IN SIGHT flips to SEARCHING, then hide.', at: [250, -210] },
    ],
    lines: ['Shells are currency out here, courier. Three, then Fort Cayo.', 'The buyer pays in cash and silence. Mostly silence.', 'Patrol lost, shells sold. Beautiful work.'] },
  { title: 'Neon Market Run', giver: 'Captain Ivo Marchetti', pay: 1750, rep: 70, unlock: 'Cayo SMG at the market stall',
    stages: [
      { text: 'Reach the Heron Key night market', mech: 'On-foot sections are safer after dark — use alleys.', at: [205, 175] },
      { text: 'Defend the stall from 3 rivals', mech: 'Click to shoot; floating numbers show your damage.', at: [222, 198] },
      { text: 'Escape to the Heron marina', mech: 'Steal a car if you must — witnesses will phone it in.', at: [188, 214] },
    ],
    lines: ['Heron market, after dark. Rivals want my stall — persuade them otherwise.', 'Guns out, courier. Protect the neon, protect the money.', 'Market saved. Heron Key respects you now.'] },
  { title: 'Bridge Kings', giver: 'Captain Ivo Marchetti', pay: 2400, rep: 90, unlock: 'Stunt bonus x2 on bridge ramps',
    stages: [
      { text: 'Hit 2 stunt jumps', mech: 'Full speed at a ramp — air-time prints your bonus on screen.', at: [120, -80] },
      { text: 'Outrun REEF-2 across two bridges', mech: 'Nia [Z] scouts the clearest bridge for you.', at: [-120, 80] },
      { text: 'Deliver to The Shallows', mech: 'Shallow water slows cars — stay on the causeway.', at: [-228, 158] },
    ],
    lines: ['Time to fly, courier. Two ramps, two bridges, one legend.', 'REEF-2 is their best driver. Prove he is second-best.', 'The Shallows bows to the Bridge King.'] },
  { title: 'Fort Cayo Lockdown', giver: 'Captain Ivo Marchetti', pay: 3200, rep: 110, unlock: 'Tide Rifle unlock',
    stages: [
      { text: 'Breach the Fort Cayo roadblock', mech: 'Roadblock units hold lanes — ram a gap or go around.', at: [228, -196] },
      { text: 'Grab the fort manifest', mech: 'On foot inside the fort yard; patrol spotlights sweep it.', at: [262, -178] },
      { text: 'Escape with 4-star heat', mech: 'HERON AIR joins at 4 stars — use bridge cover.', at: [120, -60] },
    ],
    lines: ['The fort holds a manifest with all our names. Bring it home.', 'Spotlights, roadblocks, the whole choir. Stay low.', 'Manifest secured. They will feel that one.'] },
  { title: 'Shallows Ghost', giver: 'Captain Ivo Marchetti', pay: 4100, rep: 130, unlock: 'Harpoon X unlock',
    stages: [
      { text: 'Cross The Shallows unseen', mech: 'SEARCHING patrols sweep the search zone on your minimap.', at: [-252, 182] },
      { text: 'Plant the decoy transponder', mech: 'Hold in the ring for 5 seconds without being spotted.', at: [-218, 148] },
      { text: 'Return to Key Arena', mech: 'Any route home — the decoy draws REEF units west.', at: [10, 10] },
    ],
    lines: ['Become a ghost in The Shallows. Plant the decoy, vanish.', 'Patience, courier. Let the search zone slide past you.', 'They chased a ghost all night. Flawless.'] },
  { title: 'The Storm Run', giver: 'Captain Ivo Marchetti', pay: 6500, rep: 200, unlock: 'Storm Cannon + King of the Keys title',
    stages: [
      { text: 'Storm Run: Palmetto checkpoint', mech: 'Hit every key in order as the storm closes in.', at: [-260, -150] },
      { text: 'Storm Run: Fort Cayo checkpoint', mech: '5-star heat — every named unit is on the water.', at: [250, -190] },
      { text: 'Storm Run: Heron + Shallows checkpoints', mech: 'Crew abilities recharge faster in the storm. Use them.', at: [-240, 170] },
      { text: 'Storm Run: finish at Key Arena marina', mech: 'One last bridge. Make it sing.', at: [18, 30] },
    ],
    lines: ['The Storm Run. All five keys, one tank of nerve. Go.', 'Every patrol boat and HERON AIR — the whole Keys are watching.', 'LEGEND. The Coral Keys are yours, courier.'] },
];
export const RANKS = [
  { at: 0, title: 'Dock Runner' }, { at: 100, title: 'Causeway Courier' }, { at: 250, title: 'Bridge Scout' },
  { at: 450, title: 'Key Smuggler' }, { at: 700, title: 'Reef Baron' }, { at: 1000, title: 'King of the Keys' },
];
export const STUNT_SPOTS = [
  { x: 120, z: -80, name: 'Arena East Ramp' }, { x: -120, z: -70, name: 'Palmetto Causeway Ramp' },
  { x: 130, z: 90, name: 'Heron Bridge Ramp' }, { x: -110, z: 85, name: 'Shallows Bridge Ramp' },
  { x: 30, z: -120, name: 'Fort Cayo Rooftop' }, { x: -40, z: 120, name: 'Arena South Rooftop' },
  { x: 235, z: -60, name: 'Cayo Cliff Ramp' }, { x: -235, z: 40, name: 'West Key Ramp' },
];
