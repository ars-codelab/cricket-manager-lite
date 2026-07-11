# Cricket Manager Lite Product Design

## Vision

Cricket Manager Lite is a downloadable, offline-first mobile web cricket management game for cricket fans who enjoy tactical decisions, match conditions, and believable simulation more than arcade controls. The game should feel like a light, fast, browser-native version of a cricket captaincy simulator.

The first version focuses on a custom/friendly match simulator. A player should be able to choose a format, venue, pitch, weather, and batting tactics, then understand how those choices affect the innings.

## Audience

- Cricket fans who understand formats, pitch behavior, and tactical tradeoffs.
- Mobile-first users who want a quick management session without installing a native app.
- Players who want explainable outcomes rather than hidden, rigged results.
- Developers and contributors who can clone, run, and improve the project without a hosted backend.

## Core Loop

1. Choose a match format and conditions.
2. Review venue, weather, pitch, and tactical intelligence.
3. Set batting tactics.
4. Simulate the innings or match.
5. Read scorecard, commentary, and condition-driven explanations.
6. Adjust setup or tactics and replay with deterministic seeds.

## First Playable Milestone

The first playable milestone is a custom/friendly single-match simulator:

- Supports T20, ODI, and simplified Test setup.
- Lets the user choose venue, pitch, weather, match time, outfield, and batting tactics.
- Uses deterministic ball-by-ball simulation.
- Produces a scorecard, ball log, commentary feed, condition readout, and Test surface forecast.
- Runs entirely in the browser as a static web app.

Success means a user can open the app on a phone, configure a match in under a minute, simulate an innings, and understand why the result happened.

## Design Principles

- Conditions shift probabilities; they do not force outcomes.
- Difficulty affects AI quality and hint clarity, not hidden result rigging.
- Outcomes must be reproducible from seed, ruleset, data version, and tactics.
- The game should explain cricket logic in plain language.
- Offline and downloadable behavior is a core requirement, not a later polish item.
- Data should be curated and reviewable; no live scraping during gameplay.

## V1 Scope

- Custom/friendly matches.
- Static venue, pitch, weather, and tactic data.
- Deterministic TypeScript simulation.
- Mobile-first Svelte UI.
- Browser-only runtime.
- Local documentation and test coverage for engine behavior.

## Later Scope

- Full teams, rosters, ratings, and squad selection.
- Series modes and career-lite modes.
- AI bowling, toss, field, and selection decisions.
- IndexedDB saves, import/export, and PWA install support.
- GitHub Pages deployment and release ZIP artifacts.
- Curated roster refresh workflow with reviewable diffs.

## Non-Goals

- No multiplayer.
- No runtime backend.
- No official logos.
- No copied copyrighted player profile text.
- No live scraping during gameplay.
- No monetization or account system in v1.

## Quality Bar

- Every stable slice must pass `npm run check` and `npm run build`.
- Engine behavior must be covered by deterministic tests once the test runner is added.
- User-facing simulation results must include enough context to audit why they happened.
- Commits should be PR-sized and easy to revert.
