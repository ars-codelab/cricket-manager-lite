# Cricket Manager Lite Backlog

## Milestone 1: First Playable Custom Match

Status: mostly implemented for a single generic innings. Remaining work is polish, stronger plausibility tuning, and real teams/players.

### Story: Configure A Match

As a cricket fan, I want to choose a format, venue, pitch, and weather so that I can create a match scenario with recognizable cricket conditions.

Acceptance criteria:

- User can select T20, ODI, or Test.
- User can select a venue from the curated venue list.
- User can select weather and pitch profiles.
- UI shows venue ratings and condition notes.
- Selection changes produce deterministic simulation changes.

### Story: Tune Batting Tactics

As a player, I want to adjust batting tactics so that I can respond to conditions like swing, spin, dew, and deteriorating pitches.

Acceptance criteria:

- User can set aggression, shot selection, pace plan, spin plan, and running risk.
- UI explains the current tactical approach.
- Tactical changes affect simulated scoring and wicket probabilities.
- Defensive choices reduce scoring risk and scoring rate.
- Attacking choices increase scoring rate and dismissal risk.

### Story: Simulate A Ball-By-Ball Innings

As a player, I want the innings to be simulated ball by ball so that the scorecard feels like cricket instead of a projected score.

Acceptance criteria:

- Engine tracks legal balls, overs, runs, wickets, extras, and innings end.
- Engine supports T20 and ODI innings limits.
- Engine supports simplified Test innings limits.
- Same seed and inputs always produce the same innings.
- Result stores engine version, ruleset version, seed, format, conditions, and tactics.

### Story: Read The Scorecard

As a player, I want to see scorecard details so that I can understand how the innings developed.

Acceptance criteria:

- UI shows innings score, overs, run rate, and par context.
- UI shows batting card, bowling figures, extras, fall of wickets, and partnerships.
- UI shows a recent ball log.
- UI shows commentary tied to conditions and tactics.

### Story: Understand Conditions

As a cricket fan, I want the game to explain how venue, pitch, and weather influenced the innings so that outcomes feel fair.

Acceptance criteria:

- UI shows condition readout before and after simulation.
- Test format shows five-day surface forecast.
- Overcast, dew, spin-friendly, pace-friendly, and slow-pitch scenarios produce distinct advice.
- Explanations avoid claiming certainty for probabilistic outcomes.

## Milestone 2: Engine Confidence

Status: started. Vitest is installed with deterministic RNG, fixture validation, and scorecard accounting tests.

### Story: Validate Fixtures

As a contributor, I want fixture validation so that venue and condition data stays consistent.

Acceptance criteria:

- Duplicate IDs are detected.
- Venue ratings are restricted to the supported range.
- Missing required fields are detected.
- Validation can run in tests.

### Story: Test Simulation Accounting

As a developer, I want engine tests so that scorecards remain internally consistent.

Acceptance criteria:

- Seeded randomness is deterministic.
- Legal-ball counts match overs.
- Score equals batter runs plus extras.
- Wickets, fall of wickets, and partnerships are consistent.
- Bulk simulations stay within plausible scoring ranges.

## Milestone 3: Teams And Rosters

### Story: Add Static Teams

As a player, I want recognizable teams and squads so that matches feel grounded in real cricket.

Acceptance criteria:

- App includes curated seed teams for IPL and top international sides.
- Player data avoids copied copyrighted profile text.
- Roster IDs and ratings validate successfully.
- Match engine can consume generic player ratings.

### Story: Pick A Playing XI

As a player, I want to pick a playing XI so that selection matters before simulation.

Acceptance criteria:

- User can choose a balanced XI.
- App highlights role imbalance.
- Conditions recommend pace, spin, or batting depth.
- Invalid XIs are blocked or clearly warned.

## Milestone 4: Series And Career-Lite

### Story: Play A Series

As a player, I want to play a T20, ODI, Test, or mixed series so that conditions and form matter across matches.

Acceptance criteria:

- Series generator creates fixtures.
- System chooses venue and match conditions.
- Test matches use day/session condition evolution.
- Results update series standings.

### Story: Manage A Career-Lite Save

As a player, I want a persistent save so that I can manage a team over time.

Acceptance criteria:

- Saves are stored locally in IndexedDB.
- User can export and import saves.
- Save includes versions for engine, ruleset, roster, and fixtures.
- App handles incompatible saves with a clear message.

## Milestone 5: Offline Distribution

Status: started. Relative production builds, PWA manifest, basic service worker, GitHub Pages workflow, and release ZIP artifact workflow are in place.

### Story: Install And Download The Game

As a user, I want the game to be downloadable and installable so that I can play without the developer running a server.

Acceptance criteria:

- Static app deploys on GitHub Pages.
- Production build can be downloaded as a ZIP release artifact.
- PWA cache supports offline reload.
- README explains clone, local run, Pages, and ZIP usage.
