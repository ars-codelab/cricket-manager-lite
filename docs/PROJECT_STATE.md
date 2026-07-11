# Cricket Manager Lite Project State

## Goal

Build a downloadable, offline-first mobile web cricket management game inspired by Cricket Captain. The app must run entirely in the browser, be published as a public GitHub repo, deploy as a static GitHub Pages app, and be downloadable as a release ZIP.

## Current Architecture

- Frontend: Svelte 5, Vite, TypeScript.
- Runtime target: static browser app, no backend required for gameplay.
- Persistence target: IndexedDB for v1 saves, PWA cache for offline app shell and seed data.
- Engine target: deterministic TypeScript simulation, eventually wrapped in a Web Worker.
- Current Node runtime: `18.19.1`; keep tooling Node 18-compatible unless the runtime is upgraded.

## Current Files

- `research/match-conditions-tactical-simulator.md`: exported research on pitch, weather, venue, tactics, AI, DLS, and physics.
- `research/condition-model-implementation-notes.md`: implementation digest derived from the research.
- `src/lib/types.ts`: current condition and simulation types.
- `src/lib/data.ts`: current venue, weather, pitch, and format scale data.
- `src/lib/simulation.ts`: current deterministic projected-innings prototype.
- `src/App.svelte`: current mobile prototype UI.
- `src/app.css`: current visual system and responsive styling.

## Product Direction

The first playable milestone is a custom/friendly match simulator:

- Choose format: T20, ODI, Test.
- Choose venue, pitch, weather, and later day/night/dew settings.
- Adjust batting tactics.
- Simulate deterministic cricket outcomes.
- View condition readouts, tactic impacts, Test surface forecast, scorecard, and commentary.

Later milestones add:

- Full scorecards and ball logs.
- Teams, players, rosters, and squad selection.
- Series and career-lite modes.
- AI captaincy and difficulty levels.
- Offline saves and import/export.
- GitHub Pages and release ZIP distribution.

## GitHub

- GitHub namespace: `ars-codelab`.
- Git email: `anoj.infinity@gmail.com`.
- Previously shared token was verified but has broad scopes. Replace it later with a fine-grained token restricted to the project repo.

## Non-Goals For V1

- No multiplayer.
- No runtime backend.
- No official logos or copied copyrighted profile text.
- No live scraping during gameplay.
