# Cricket Manager Lite Project State

## Goal

Build a downloadable, offline-first mobile web cricket management game inspired by Cricket Captain. The app must run entirely in the browser, be published as a public GitHub repo, deploy as a static GitHub Pages app, and be downloadable as a release ZIP.

## Current Architecture

- Frontend: Svelte 5, Vite, TypeScript.
- Runtime target: static browser app, no backend required for gameplay.
- Persistence target: IndexedDB for v1 saves, PWA cache for offline app shell and seed data.
- Engine target: deterministic TypeScript simulation, eventually wrapped in a Web Worker.
- Current Node runtime: `18.19.1`; keep tooling Node 18-compatible unless the runtime is upgraded.
- Build target: relative Vite assets for GitHub Pages subpaths and release ZIP distribution.

## Current Files

- `research/match-conditions-tactical-simulator.md`: exported research on pitch, weather, venue, tactics, AI, DLS, and physics.
- `research/condition-model-implementation-notes.md`: implementation digest derived from the research.
- `src/lib/types.ts`: condition, scorecard, metadata, and simulation types.
- `src/lib/data.ts`: venue matrix, weather, pitch, and format scale data.
- `src/lib/rosters.ts`: normalized seed roster fixture generated from the two Gemini roster research passes.
- `src/lib/simulation.ts`: deterministic stateful ball-by-ball innings simulator.
- `src/lib/validation.ts`: fixture validation helpers.
- `src/App.svelte`: mobile custom match UI with scorecard and ball log.
- `src/app.css`: current visual system and responsive styling.
- `.github/workflows/pages.yml`: GitHub Pages build/deploy workflow.
- `.github/workflows/release-zip.yml`: downloadable build artifact workflow.

## Product Direction

The first playable milestone is a custom/friendly match simulator:

- Choose format: T20, ODI, Test.
- Choose venue, pitch, weather, match time, outfield, and difficulty.
- Adjust batting and bowling tactics before advancing play.
- Simulate deterministic ball-by-ball innings progressively by over, wicket, custom interval, or full innings.
- View condition readouts, tactic impacts, Test surface forecast, scorecard, ball log, and commentary.

Later milestones add:

- Full scorecards and ball logs.
- Teams, players, rosters, and squad selection.
- Series and career-lite modes.
- AI captaincy and difficulty levels.
- Offline saves and import/export.
- GitHub Pages and release ZIP distribution.

## Current Implementation Checkpoints

- Public project README, MIT license, data-source/legal notes, and Graphify setup docs are in place.
- Vitest is installed with deterministic simulation and fixture validation coverage.
- Full 29-venue condition matrix from the research notes is loaded as static fixtures.
- Custom match controls include format, venue, weather, pitch, match time, outfield, difficulty, and batting tactics.
- The simulator now produces ball events, batting card, bowling figures, extras, fall of wickets, partnerships, metadata, and recent commentary from a resumable `InningsState`.
- Mobile app shell includes Home, Setup, Match, and Insights views with playable scenario presets.
- Match screen now uses a dedicated mobile cockpit: active match hides global hero/nav chrome, keeps score/action controls above the fold, and exposes Exit to return to setup.
- Match screen supports progressive simulation controls: next over, next wicket, custom overs, and AI-assisted auto chunks.
- Match screen includes contextual decision sheets for current-batter plans, bowler spells, bowling line, length, field, variation, pace plan, and spin plan.
- Setup supports sandbox mode and one-player mode; one-player mode lets the user control Team A or Team B while AI controls opponent decisions using difficulty and conditions.
- Setup supports Team A and Team B selection from 20 normalized seed teams; first innings uses Team A batting, the chase uses Team B batting.
- Scorecards now use selected roster player names and the top bowling options from the selected bowling side.
- Bowler spells track planned spell overs, spell progress, fatigue, and remaining quota.
- Live batting and bowling decisions now feed future delivery probabilities instead of only changing the visible scorecard.
- Current match setup can be saved locally, loaded, exported to JSON, and imported back into the browser.
- Static distribution groundwork is in place: relative Vite paths, web manifest, service worker, Pages workflow, and release ZIP workflow.
- Engine tests cover deterministic full innings, one-over advancement, stop-at-next-wicket advancement, selected bowler application, tactical divergence, fixture validation, and scorecard accounting.
- Engine tests also cover limited-overs bowler caps, opening spells, and AI captaincy plan selection.
- Fixture tests validate normalized roster data and broken roster references.

## Known Technical Debt

- Dependency audit currently flags Vite/esbuild dev-server advisories. The automated fix jumps to a breaking Vite 8 path, so this should be handled in a dedicated Node/tooling upgrade slice.
- Current engine uses normalized seed roster names and ratings, but ratings only drive scorecard lineup/bowling pool selection so far; delivery probabilities are not yet player-rating-specific.
- Test cricket remains a simplified one-innings simulation with five-day forecast display and active-day modifiers, not full multi-innings match state.
- Service worker is basic app-shell/runtime caching and should be hardened before public beta.
- Current save implementation uses localStorage for setup data only; full match state, match history, and career saves should move to IndexedDB.
- Live decisions are currently team-level/generic-player tactics; deeper role/rating impact, true batting order choices, and richer AI should be added once real rosters and player attributes exist.

## GitHub

- GitHub namespace: `ars-codelab`.
- Git email: `anoj.infinity@gmail.com`.
- Previously shared token was verified but has broad scopes. Replace it later with a fine-grained token restricted to the project repo.

## Non-Goals For V1

- No multiplayer.
- No runtime backend.
- No official logos or copied copyrighted profile text.
- No live scraping during gameplay.
