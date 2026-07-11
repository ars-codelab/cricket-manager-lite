# Condition Model Implementation Notes

These notes translate `match-conditions-tactical-simulator.md` into implementation decisions for Cricket Manager Lite.

## Core Model

- Use venue ratings as the baseline: `paceCarry`, `seam`, `swing`, `spin`, `battingEase`, `outfield`, `deterioration`, `tossPreference`, `t20Par`, and `odiPar`.
- Use match-day weather as a modifier layer over the venue baseline.
- Use pitch type as a surface modifier layer, especially in custom/friendly matches.
- Scale environmental impact by format: T20 around 20%, ODI around 50%, Test around 100%.
- For Tests, model pitch state day by day and session by session; do not use one static condition object.

## Test Cricket

- Store five day profiles for each Test: day, morning weather, afternoon weather, evening weather, and evolving pitch properties.
- Typical deterioration dimensions: `grass`, `moisture`, `hardness`, `cracks`, `rough`, `spinGrip`, `unevenBounce`, `battingEase`, `paceCarry`, and `seamMovement`.
- Region matters: India/Sri Lanka/Bangladesh/UAE usually move toward spin and low/variable bounce; Australia/South Africa preserve pace and crack-driven bounce; England/New Zealand depend more on moisture, cloud, and swing.
- Recalculate condition modifiers at session changes and when a new ball is taken.

## Custom Matches

- Let users choose venue, pitch type, weather, outfield speed, and day/night timing.
- Custom Test matches should optionally let users choose starting day profile or use the venue's default five-day progression.
- Friendly limited-overs matches should keep pitch deterioration low unless the user chooses an extreme/worn surface.

## Match Engine Effects

- Conditions should modify outcome probabilities, not directly force outcomes.
- Normal multipliers should usually stay in the 0.75x to 1.25x range.
- Extreme effects such as heavy dew, severe dust, altitude, short boundaries, and day-five worn surfaces may use 0.50x to 1.50x bounds.
- Important targets: dot balls, singles, boundaries, sixes, wickets, edges, LBW/bowled, deep catches, run-outs, wides/no-balls, timing, confidence, bowling-type effectiveness, fielding difficulty, and fatigue.

## Tactics

- Batting controls should affect intent and risk: aggression, shot selection, pace plan, spin plan, running risk, bowler targeting, and partnership plan.
- Bowling controls should affect method: length, line, field, variation use, pace strategy, and spin strategy.
- Good tactics should improve probabilities but never guarantee success.
- Difficulty should affect AI quality and hint clarity, not secretly rig outcomes.

## AI Rules

- AI XI selection should use a Pitch Compatibility Index using batting ease, pace/seam/swing support, and spin support.
- Toss logic should weigh early moisture/cloud against later deterioration and dew.
- AI batting should lower aggression for new-ball swing, fourth-innings survival, and high-wicket-loss states.
- AI bowling should use shorter spells in heat, preserve strike bowlers for twilight/day-night conditions, and pick death bowlers by yorker/cutter skill.

## Data Fixtures To Create

- `venues.json`: one object per venue using the master calibration matrix.
- `weatherProfiles.json`: weather condition modifiers.
- `pitchTypes.json`: surface typology modifiers.
- `formatScales.json`: T20/ODI/Test environmental, fatigue, and deterioration scaling.
- `tacticalRules.json`: recommended and risky tactic combinations by condition.
- `dlsParameters.json`: resource model parameters for rain-interrupted limited-overs matches.
