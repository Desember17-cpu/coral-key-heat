# CORAL KEY HEAT

[![badge](https://make.fun/api/badge/Desember17-cpu/gta6)](https://make.fun/bounty/gta6-01)
[![badge](https://make.fun/api/badge/Desember17-cpu/gta6)](https://make.fun/bounty/gta6-01)
[![badge](https://make.fun/api/badge/Desember17-cpu/gta6)](https://make.fun/bounty/gta6-01)

**Pitch:** An archipelago of five coral keys joined by long bridges over turquoise water. You are a courier-turned-smuggler running packages between islands for dispatcher Captain Ivo Marchetti while the Key Patrol closes in. Signature systems: bridge chases against named patrol units, 8 stunt jumps with printed air-time bonuses, and 24 collectible conch shells scattered across Key Arena, Palmetto Key, Fort Cayo, Heron Key and The Shallows.

## Features (all real, all in-game)

- 3D open world (Three.js): 5 islands with distinct skylines, 6 bridges, ring roads, traffic AI, 26 pedestrians, marinas with boats, water all around, golden-hour grade (low sun, long shadows, warm fog, orange→pink→purple sky, ACES exposure 1.25, emissive windows)
- On foot + drivable, stealable cars ("E — STEAL" prompt) with a witness system — a nearby witness phones the Key Patrol and it is printed in the dispatch feed
- Wanted 0–5 stars; Key Patrol AI with named units REEF-1, REEF-2, CAYO-3, HERON-4, PALM-5, TIDE-6 in PURSUIT / RAMMING / ROADBLOCK / SPOTLIGHT roles, live dispatch panel with distances, and the HERON AIR helicopter at 4+ stars
- Combat: on-foot shooting, muzzle glow, floating damage numbers, health + armor
- 7 story missions in stages for Captain Ivo Marchetti, escalating to The Storm Run across all five keys — portrait dialogue, STAGE x/y objective panel with NEXT line, MISSION PASSED banner with money + REP + unlocks
- Four-side HUD: mission panel + dispatch (top-left); clock, cash, wanted IN SIGHT/SEARCHING, 6-slot weapon wheel (top-right); round textured minimap + district + RESPECT bar (bottom-left); Reef FM 98.9 / Cayo Nights 105.3 radio + vehicle panel with CONDITION, big speed and gear (bottom-right); dialogue portrait (bottom-centre)
- Crew cards that work: Nia — BRIDGE SCOUT [Z], Ruy — QUICK FIX [X], Sef — EYES OUT [C], each with cooldowns
- Full map screen (M) with per-district standing, POI legend and GPS route; stats/save screen (Tab) with % COMPLETE, checklist (missions/stunts/shells/exports), per-mission medals, career stats, rank ladder, named next unlock and 3 working localStorage save slots
- Title screen with giant display type, skyline and 3 informative save slots
- 8 stunt jumps tracked with on-screen STUNT + air-time printout; conch shell counter 0/24
- WebAudio synth sound (engine, siren, shots, UI); deterministic seeded RNG and fixed-timestep logic

## Controls

- **WASD / arrows** — walk / drive • **Shift** — sprint • **E** — steal / enter / exit car
- **Mouse click** — shoot • **1–6** — weapon wheel • **Z / X / C** — crew abilities
- **R** — switch radio • **M** — full map • **Tab** — stats & save slots • **Esc** — close screens

## Run it

Open `game/index.html` via any static server. `?autopilot=1` proves mission 1 completes deterministically; `?shot=1..4` frames the screenshot scenes.
