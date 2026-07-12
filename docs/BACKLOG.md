# Cricket Manager Lite Backlog

## Milestone 1: First Playable Custom Match

Status: playable for a single generic innings with stateful over/wicket/custom simulation controls. Live batting and bowling decisions now affect future deliveries. Remaining work is stronger plausibility tuning, real teams/players, second innings/chases, and deeper player-specific captaincy impact.

### Story: Configure A Match

Status: done.

As a cricket fan, I want to choose a format, venue, pitch, and weather so that I can create a match scenario with recognizable cricket conditions.

Acceptance criteria:

- [x] User can select T20, ODI, or Test.
- [x] User can select a venue from the curated venue list.
- [x] User can select weather and pitch profiles.
- [x] UI shows venue ratings and condition notes.
- [x] Selection changes produce deterministic simulation changes.

### Story: Tune Batting Tactics

Status: done.

As a player, I want to adjust batting tactics so that I can respond to conditions like swing, spin, dew, and deteriorating pitches.

Acceptance criteria:

- [x] User can set aggression, shot selection, pace plan, spin plan, and running risk.
- [x] UI explains the current tactical approach.
- [x] Tactical changes affect simulated scoring and wicket probabilities.
- [x] Defensive choices reduce scoring risk and scoring rate.
- [x] Attacking choices increase scoring rate and dismissal risk.

### Story: Simulate A Ball-By-Ball Innings

Status: done.

As a player, I want the innings to be simulated ball by ball so that the scorecard feels like cricket instead of a projected score.

Acceptance criteria:

- [x] Engine tracks legal balls, overs, runs, wickets, extras, and innings end.
- [x] Engine supports T20 and ODI innings limits.
- [x] Engine supports simplified Test innings limits.
- [x] Same seed and inputs always produce the same innings.
- [x] Result stores engine version, ruleset version, seed, format, conditions, and tactics.

### Story: Advance A Live Innings

Status: done.

As a player, I want to continue an innings in useful chunks so that I can make captaincy decisions between phases instead of watching a whole innings at once.

Acceptance criteria:

- [x] User can advance one over, five overs, ten overs, to the next wicket, custom overs, or the full innings.
- [x] Engine advances from current state rather than revealing a precomputed innings.
- [x] User can choose the next bowler before continuing.
- [x] User can adjust batter intent, shot selection, pace plan, spin plan, and running before continuing.
- [x] User can adjust bowling length, line, field, variation use, pace plan, and spin plan before continuing.
- [x] Future deliveries change when tactical choices change.

### Story: Chase A Target

Status: done.

As a player, I want to continue into a second innings so that I can play a full chase instead of only one batting effort.

Acceptance criteria:

- [x] User can start the next innings after innings one completes.
- [x] The second innings uses a target derived from the first innings score.
- [x] The engine stops the chase when the target is reached.
- [x] The UI shows innings number and chase target context.
- [x] The innings-break action is visible near the top of the match screen.

### Story: Finish A Match

Status: done.

As a player, I want a clear game-over screen so that the match feels complete when both innings finish.

Acceptance criteria:

- [x] UI declares the winner and margin after the second innings.
- [x] UI shows both innings totals.
- [x] UI shows player of the match.
- [x] UI shows top batters and top bowlers.

### Story: Read The Scorecard

Status: done.

As a player, I want to see scorecard details so that I can understand how the innings developed.

Acceptance criteria:

- [x] UI shows innings score, overs, run rate, and par context.
- [x] UI shows batting card, bowling figures, extras, fall of wickets, and partnerships.
- [x] UI shows a recent ball log.
- [x] UI shows commentary tied to conditions and tactics.

### Story: Watch A Live Match Stream

Status: done.

As a player, I want a visually active match screen so that simulating a match feels like watching cricket unfold instead of reading a form.

Acceptance criteria:

- [x] UI shows a broadcast-style score panel with score, overs, run rate, chase context, and momentum.
- [x] UI clearly shows current striker and current bowler stats.
- [x] User can switch between ball-by-ball and over-by-over stream views.
- [x] Boundaries and wickets are visually highlighted in the stream.

### Story: Play From A Mobile Match Cockpit

Status: done for first slice.

As a mobile player, I want match decisions and simulation buttons above the fold so that I can play without repeatedly scrolling past setup or marketing content.

Acceptance criteria:

- [x] Active match view hides Home/Setup hero chrome and shows an Exit action instead.
- [x] Score, innings context, target/par, conditions, and primary actions are visible near the top of the match screen.
- [x] Batter and bowler controls move into contextual sheets instead of always-visible long forms.
- [x] User can tap the striker or bowler card to edit tactical parameters.
- [x] Score details are available through tabs instead of forcing long vertical scrolling.

### Story: One-Player Match Control

Status: started.

As a player, I want to control one side while the system controls the other so that the game feels like captaincy rather than a two-team sandbox.

Acceptance criteria:

- [x] Setup supports sandbox mode and one-player mode.
- [x] User can choose Team A or Team B in one-player mode.
- [x] AI can choose batting tactics, bowling tactics, bowler, spell length, and a concise reason.
- [x] AI choices use match difficulty, conditions, format phase, and target pressure.
- [ ] Add visible team names once real teams/rosters are introduced.
- [ ] Add deeper AI evaluation after player ratings exist.

### Story: Manage Bowler Spells

Status: started.

As a bowling captain, I want to plan a bowler's spell and see fatigue/quota so that bowling changes feel like cricket decisions.

Acceptance criteria:

- [x] Bowler sheet supports planned spell overs.
- [x] Current bowler card shows spell progress, fatigue, and remaining quota.
- [x] System prompts for a bowler when a spell completes or a bowler is exhausted.
- [x] AI generates spell targets for automated/opponent bowling.
- [ ] Refine spell tracking once real bowler roles and stamina ratings exist.

### Story: Understand Conditions

Status: done.

As a cricket fan, I want the game to explain how venue, pitch, and weather influenced the innings so that outcomes feel fair.

Acceptance criteria:

- [x] UI shows condition readout before and after simulation.
- [x] Test format shows five-day surface forecast.
- [x] Overcast, dew, spin-friendly, pace-friendly, and slow-pitch scenarios produce distinct advice.
- [x] Explanations avoid claiming certainty for probabilistic outcomes.

## Milestone 2: Engine Confidence

Status: started. Vitest is installed with deterministic RNG, stateful innings advancement, tactical divergence, fixture validation, scorecard accounting, bowling quota, and AI captaincy tests.

### Story: Validate Fixtures

Status: done.

As a contributor, I want fixture validation so that venue and condition data stays consistent.

Acceptance criteria:

- [x] Duplicate IDs are detected.
- [x] Venue ratings are restricted to the supported range.
- [x] Missing required fields are detected.
- [x] Validation can run in tests.

### Story: Test Simulation Accounting

Status: done.

As a developer, I want engine tests so that scorecards remain internally consistent.

Acceptance criteria:

- [x] Seeded randomness is deterministic.
- [x] Legal-ball counts match overs.
- [x] Score equals batter runs plus extras.
- [x] Wickets, fall of wickets, and partnerships are consistent.
- [x] Bulk simulations stay within plausible scoring ranges.
- [x] One-over advancement stops after six legal balls.
- [x] Next-wicket advancement stops when a wicket falls or innings completes.
- [x] Selected bowler is applied to the next simulated over.
- [x] Different live tactics can produce different future ball logs from the same starting state.
- [x] T20 bowlers are capped at four overs.
- [x] ODI bowlers are capped at ten overs.
- [x] Opening bowlers are preferred in realistic early spells.
- [x] Manual bowler choice applies to the next over, not every over in a multi-over simulation.
- [x] AI captaincy avoids exhausted limited-overs bowlers.
- [x] AI captaincy produces condition-aware plans with finite spell targets.

## Milestone 3: Teams And Rosters

Status: started. Normalized seed roster fixtures are loaded from research data and selectable in match setup.

### Story: Add Static Teams

As a player, I want recognizable teams and squads so that matches feel grounded in real cricket.

Acceptance criteria:

- [x] App includes curated seed teams for IPL and top international sides.
- [x] Player data avoids copied copyrighted profile text.
- [x] Roster IDs and ratings validate successfully.
- [x] Match engine can consume generic player ratings for scorecard names and bowling pools.
- [ ] Player ratings influence delivery probabilities beyond lineup names.
- [ ] Add source review workflow before future roster refreshes.

### Story: Select Match Teams

Status: started.

As a player, I want to choose the two teams before starting a match so that scorecards use recognizable player names.

Acceptance criteria:

- [x] Setup screen lets the user choose Team A and Team B.
- [x] First innings uses Team A batting and Team B bowling.
- [x] Chase innings swaps batting and bowling teams.
- [x] Saved setup includes selected team IDs.
- [ ] Prevent or warn when the same team is selected twice.
- [ ] Show team rosters before starting the match.

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
Setup save/load/export/import is available through localStorage and JSON files. Full match history still needs IndexedDB.

### Story: Install And Download The Game

As a user, I want the game to be downloadable and installable so that I can play without the developer running a server.

Acceptance criteria:

- Static app deploys on GitHub Pages.
- Production build can be downloaded as a ZIP release artifact.
- PWA cache supports offline reload.
- README explains clone, local run, Pages, and ZIP usage.
