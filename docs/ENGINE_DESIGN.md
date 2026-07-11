# Cricket Manager Lite Engine Design

## Core Principle

Conditions shift probabilities; they do not force outcomes. Good cricket decisions improve odds without guaranteeing success.

## Condition Stack

Each delivery should be resolved from layered inputs:

1. Venue baseline.
2. Match format scaling.
3. Pitch surface.
4. Weather and time of day.
5. Ball age and innings phase.
6. Batter and bowler ratings.
7. User or AI tactics.
8. Match state pressure.
9. Seeded random sampling.

## Venue Baseline

Each venue stores:

- `paceCarry`
- `seam`
- `swing`
- `spin`
- `battingEase`
- `outfield`
- `deterioration`
- `tossPreference`
- `t20Par`
- `odiPar`
- notes and source metadata

## Weather Layer

Supported weather types:

- Sunny
- Hot
- Dry
- Humid
- Overcast
- Rain Threat
- Dew
- Wind
- Cold Morning
- Day-Night Evening

Weather modifies targets such as swing, seam, spin, timing, boundary rate, wicket rate, fielding difficulty, ball wear, and fatigue.

## Pitch Layer

Supported pitch types:

- Green
- Hard
- Flat
- Dry
- Dusty
- Slow
- Low
- Cracked
- Worn
- Damp
- Two-paced

Pitch modifies dot balls, singles, boundaries, sixes, wickets, edges, LBW/bowled, deep catches, timing, and bowling-type effectiveness.

## Format Scaling

- T20: 20% environmental force, 5% pitch wear, 10% fatigue.
- ODI: 50% environmental force, 20-30% pitch wear, 40% fatigue.
- Test: 100% environmental force, 100% pitch wear, 100% fatigue.

## Test Cricket Model

Tests use a day-by-day and session-by-session model:

- Five day profiles.
- Morning, afternoon, and evening weather blocks.
- Evolving pitch dimensions: grass, moisture, hardness, cracks, rough, spin grip, uneven bounce, batting ease, pace carry, seam movement.
- Region-specific deterioration:
  - India, Sri Lanka, Bangladesh, UAE: spin and low/variable bounce grow strongly.
  - Australia, South Africa: pace, carry, cracks, and uneven bounce stay important.
  - England, New Zealand: moisture, cloud, swing, and seam carry more of the effect.

## User Tactics

Batting controls:

- Aggression: Defensive, Balanced, Positive, Aggressive, Attack.
- Shot selection: Ground, Mixed, Aerial.
- Pace plan: Play late, Front-foot drive, Back-foot play, Short-ball caution, Counterattack.
- Spin plan: Play straight, Sweep, Use feet, Rotate strike, Defend.
- Running risk: Conservative, Normal, Sharp.
- Bowler targeting: See off, Normal, Target.
- Partnership plan: Stabilize, Rotate, Rebuild, Accelerate.

Bowling controls:

- Length: Yorker, Full, Good, Back of length, Short.
- Line: Outside off, At stumps, Body/leg-side, Wide yorker.
- Field: Attacking, Balanced, Defensive, Close catchers, Boundary riders.
- Variation use: Low, Normal, High.
- Pace strategy: Swing, Seam, Hit deck, Short ball, Cutters.
- Spin strategy: Flight, Flat, Attack stumps, Outside edge, Defensive darts.

## AI

AI should use:

- Pitch Compatibility Index for XI selection.
- Toss Advantage Score for bat/bowl decisions.
- Match-state batting aggression.
- Spell-length and fatigue rules.
- Condition-aware field settings.
- Difficulty-scaled tactical quality.

## Scorecard Outputs

Every simulated match should generate:

- Batting card.
- Bowling figures.
- Extras.
- Fall of wickets.
- Partnerships.
- Ball log.
- Commentary.
- Result summary.
