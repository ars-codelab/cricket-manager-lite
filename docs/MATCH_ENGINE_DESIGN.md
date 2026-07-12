# Match Engine Design

## Purpose

The match engine turns match setup, conditions, tactics, and a seed into deterministic cricket outcomes. It must produce believable scorecards and explanations while staying simple enough to run entirely in the browser.

The current implementation target is a stateful ball-by-ball custom/friendly match with two innings, selected seed roster teams, chase completion, and a mobile match cockpit. Full Test match orchestration, playing XI selection, series, and career state come later.

## Inputs

Required inputs:

- `format`: T20, ODI, Test, or later custom overs.
- `venue`: baseline pace carry, seam, swing, spin, batting ease, outfield, deterioration, toss preference, and par scores.
- `weather`: atmospheric profile such as overcast, humid, dew, dry, or hot.
- `pitch`: surface profile such as flat, green, dusty, slow, worn, cracked, or two-paced.
- `matchTime`: day, day-night, or night.
- `outfield`: slow, normal, or fast.
- `battingTactics`: aggression, shot selection, pace plan, spin plan, and running risk.
- `bowlingTactics`: length, line, field, variation use, pace plan, and spin plan.
- `advanceCommand`: continue by legal balls, overs, wicket, or full innings from the current state.
- `battingTeamId` and `bowlingTeamId`: optional roster team IDs used to resolve scorecard names and bowling pools.
- `seed`: stable string used for deterministic randomness.
- `difficulty`: casual, standard, expert, or simulation.

Version metadata:

- `engineVersion`
- `rulesetVersion`
- `dataVersion`
- `rosterVersion`

Difficulty must not secretly rig outcomes. It may affect AI decision quality, hint detail, and later tactical assistance.

## Condition Resolution

Each delivery resolves from layered probabilities:

1. Venue baseline.
2. Format scaling.
3. Pitch profile.
4. Weather and match time.
5. Outfield condition.
6. Ball age and innings phase.
7. Player/roster ratings once fully integrated.
8. Batting and bowling tactics.
9. Match pressure.
10. Seeded random sample.

Conditions modify event probabilities, not fixed outcomes. For example, overcast weather increases swing, seam, edges, and wicket pressure; it does not guarantee wickets.

## Delivery Model

The first ball-by-ball engine should classify each delivery into one outcome:

- Legal scoring ball: 0, 1, 2, 3, 4, or 6.
- Wicket: bowled, lbw, caught, caught behind, stumped, run out, or hit wicket.
- Extra: wide, no-ball, bye, or leg bye.

Legal balls advance the over. Wides and no-balls add runs but do not advance the legal-ball count. Byes and leg byes count as legal balls unless attached to a no-ball.

The event model should store:

- Innings ball index.
- Over and ball display.
- Legal-ball flag.
- Runs bat.
- Runs extras.
- Extra type.
- Wicket type.
- Striker and non-striker IDs.
- Bowler ID.
- Commentary text.
- Condition tags that explain the event.

## Stateful Progression

The engine exposes a resumable `InningsState`:

- Current score, wickets, legal balls, striker, non-striker, next batter, and completion flag.
- Mutable scorecard with batting, bowling, extras, fall of wickets, partnerships, and ball log.
- Deterministic RNG state carried in memory for the current innings.
- Metadata for engine, ruleset, data, roster, seed, format, venue, pitch, weather, tactics, and conditions.

The UI advances the state through commands:

- `overs`: simulate N overs from the current state.
- `wicket`: simulate until the next wicket or innings completion.
- `innings`: simulate until all-out or over limit.

Before each command, the UI can supply current batting tactics, selected bowler, and bowling tactics. These inputs affect future delivery probabilities; already-simulated balls are not rewritten.

## Innings Rules

The first engine must support:

- T20 innings limit: 20 overs.
- ODI innings limit: 50 overs.
- Simplified Test innings limit: up to 90 overs for one innings.
- All-out at 10 wickets.
- End of innings at over limit.
- Striker rotation on odd runs.
- Striker rotation at over end.
- Fall of wickets.
- Partnerships.
- Extras accounting.
- Batting card and bowling figures.

Chase completion is implemented for the current two-innings flow. Declarations, follow-on, weather interruptions, DLS, and full Test match state are later features.

## Scorecard Outputs

Every simulated innings should output:

- Innings summary: score, wickets, overs, run rate, par context.
- Batting card: runs, balls, fours, sixes, dismissal.
- Bowling figures: overs, maidens, runs, wickets, wides, no-balls.
- Extras breakdown.
- Fall of wickets.
- Partnerships.
- Ball log.
- Commentary feed.
- Condition readout.
- Tactical readout.
- Simulation metadata.

The scorecard must be internally auditable: total score equals batter runs plus extras, and bowler conceded runs must match scoring rules.

## Rosters And Current Player Model

The engine can consume selected roster teams from `src/lib/rosters.ts`:

- Batting cards use ordered player names from the selected batting team.
- Bowling figures use the top bowling options from the selected bowling side.
- Roster IDs are stored in simulation metadata.
- Generic placeholder XIs remain as a fallback if a selected team cannot supply enough players.

Current limitation: player ratings primarily drive lineup ordering and bowling-pool selection. Delivery probabilities still need deeper batter-vs-bowler rating integration.

## Test Cricket Handling

For the current playable slice, Test support is simplified:

- One innings simulation, not a full match.
- Uses a five-day forecast for display.
- Uses the active day profile based on innings progress to adjust batting ease, seam, swing, spin, and uneven bounce.
- Later work adds session-by-session conditions, multi-innings match state, declarations, and draw logic.

## Determinism

Simulation must be reproducible from:

- Seed.
- Engine version.
- Ruleset version.
- Data version.
- Format.
- Venue.
- Weather.
- Pitch.
- Match time.
- Outfield.
- Tactics.
- Player/roster data.

Changing any of those inputs may change the result. Repeating the same inputs must produce the same result.

## Testing Strategy

Unit tests:

- Same seed and inputs produce identical events.
- Different seeds can produce different plausible innings.
- Legal balls and over strings are correct.
- Wides/no-balls do not consume legal balls.
- All-out ends the innings.
- Score equals batter runs plus extras.
- Fall of wickets and partnerships are consistent.
- Bowling figures match the ball log.
- One-over advancement stops after six legal balls.
- Selected bowler is reflected in the next simulated over.
- Batting and bowling tactic changes can produce different future ball logs.

Bulk tests:

- T20 scores stay within broad plausible ranges.
- ODI scores stay within broad plausible ranges.
- Simplified Test innings run rates and wicket counts stay plausible.
- Flat/dew conditions generally improve scoring.
- Green/overcast or dusty/worn conditions generally increase wicket pressure.

UI acceptance tests later:

- User can configure a match.
- User can simulate an innings.
- User can read scorecard, commentary, and ball log.
- Reloading the same scenario with the same seed preserves the same result.

## Implementation Notes

- Keep the engine dependency-free TypeScript.
- Keep browser runtime static; do not add a backend.
- Prefer small pure functions for probability calculation, delivery resolution, scorecard updates, and commentary generation.
- Add a Web Worker only after the synchronous engine becomes expensive enough to affect mobile UI.
- Keep condition explanations conservative and probabilistic.
