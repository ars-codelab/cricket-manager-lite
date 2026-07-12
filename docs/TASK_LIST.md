# Cricket Manager Lite Task List

## Foundation

- Initialize local Git and configure repo-local identity.
- Remove unused starter scaffold files.
- Keep `node_modules`, secrets, caches, and build output untracked.
- Run `npm run check` and `npm run build` before every checkpoint commit.
- Add public README, license, data-source notes, and contribution notes.

## First Playable Slice

- Stabilize the current venue/weather/pitch/tactics prototype.
- Expand venue data to the full research venue matrix.
- Keep custom/friendly match controls for format, venue, pitch, weather, and batting tactics.
- Add day/night, dew, and outfield controls.
- Replace projected innings with deterministic ball-by-ball simulation.
- Add scorecard, ball log, and commentary output.

## Rules And Scorecards

- Implement legal balls, extras, wickets, striker rotation, over completion, bowler restrictions, all-out, innings end, and chase completion.
- Support T20, ODI, custom overs, and simplified Test match rules.
- Generate batting card, bowling figures, fall of wickets, partnerships, extras, and innings summary.
- Store engine version, ruleset version, roster version, and seed with every simulated match.

## Conditions Engine

- Venue baseline: pace carry, seam, swing, spin, batting ease, outfield, deterioration, toss preference, T20 par, ODI par.
- Weather layer: sunny, hot, dry, humid, overcast, rain threat, dew, wind, cold morning, day-night evening.
- Pitch layer: green, hard, flat, dry, dusty, slow, low, cracked, worn, damp, two-paced.
- Format scaling: T20 20%, ODI 50%, Test 100%.
- Test cricket: five-day surface model plus morning, afternoon, and evening session weather.

## Tactics And AI

- Batting controls: aggression, shot selection, pace plan, spin plan, running risk, bowler targeting, partnership plan.
- Bowling controls: length, line, field, variation use, pace strategy, spin strategy.
- AI decisions: XI selection, toss, batting aggression, bowling changes, spell management, field settings, and condition-aware tactics.
- First AI slice: condition-aware batting/bowling tactics, bowler choice, spell target, and concise reasoning for one-player mode.
- Difficulty levels: Casual, Standard, Expert, Simulation.
- Difficulty should affect AI quality and hint clarity, not hidden result rigging.

## Game Modes

- Single match: T20, ODI, Test, custom overs.
- Custom/friendly match with user-selected conditions.
- One-player match mode where the user controls Team A or Team B and AI controls the other side.
- Series: T20I series, ODI series, Test series, mixed tour, IPL-style league, knockout cup.
- Career-lite: IPL team management and international team management.

## Teams And Rosters

- Define Player, Team, Squad, Rating, Fixture, Series, SaveGame, Scorecard, and BallEvent types.
- Add seed rosters for IPL plus top 10 international teams. Current normalized fixture includes 20 teams from the Gemini research passes.
- Add validation for duplicate IDs, missing required fields, invalid squads, invalid ratings, and broken references. Current validation covers roster IDs, references, enum values, and rating ranges.
- Add dev-only roster refresh workflow that outputs reviewable diffs before curated seed data changes.

## Mobile UI

- Build app sections: New Game, Career, Squad, Pick XI, Match, Series, Stats.
- Use mobile bottom navigation and sticky match controls.
- Active match cockpit hides setup chrome, keeps score/actions above the fold, and uses contextual decision sheets.
- Show condition intelligence before and during matches.
- Show Test day/session forecast and live condition changes.
- Add tactics drawer, scorecard tabs, commentary feed, and simulation speed controls.

## Offline And Distribution

- Add IndexedDB saves.
- Add save import/export.
- Add PWA manifest and service worker caching.
- Configure static build for GitHub Pages.
- Add GitHub Actions workflow for Pages deploy.
- Add GitHub Actions workflow for release ZIP artifacts.

## Tests

- Unit tests for seeded randomness, condition modifiers, state transitions, innings rules, and scorecard accounting.
- Bulk simulation tests for plausible T20, ODI, and Test scoring and wicket ranges.
- Validation tests for venues, weather, pitch, teams, and rosters.
- Playwright mobile tests for creating matches, changing conditions, simulating, reading scorecards, saving/loading, and offline reload.
