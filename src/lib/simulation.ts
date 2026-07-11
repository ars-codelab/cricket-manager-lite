import { formatScale, parForFormat, pitchProfiles, weatherProfiles } from './data'
import type {
  BallEvent,
  BatterScore,
  BattingTactics,
  BowlerFigures,
  ConditionModifiers,
  FallOfWicket,
  InningsScorecard,
  MatchConditions,
  MatchFormat,
  OutfieldCondition,
  Partnership,
  PitchType,
  SimulationMetadata,
  SimulationResult,
  TestDayCondition,
  Venue,
  WeatherType,
} from './types'

const ENGINE_VERSION = '0.2.0'
const RULESET_VERSION = '0.1.0'
const DATA_VERSION = '0.1.0'
const ROSTER_VERSION = 'generic-0.1.0'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const multiply = (base: number, modifier = 1, scale = 1) => base * (1 + (modifier - 1) * scale)

export const createSeededRandom = (seed: string) => {
  let h = 2166136261
  for (const char of seed) {
    h ^= char.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }

  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const tacticModifiers = (tactics: BattingTactics): ConditionModifiers => {
  const aggression = {
    Defensive: { boundary: 0.72, six: 0.55, wicket: 0.7, dot: 1.22, single: 1.03 },
    Balanced: { boundary: 1, six: 1, wicket: 1, dot: 1, single: 1 },
    Positive: { boundary: 1.12, six: 1.18, wicket: 1.12, dot: 0.92, single: 1.02 },
    Aggressive: { boundary: 1.28, six: 1.42, wicket: 1.28, dot: 0.85, single: 0.95 },
    Attack: { boundary: 1.48, six: 1.7, wicket: 1.55, dot: 0.78, single: 0.85 },
  }[tactics.aggression]

  const shots = {
    Ground: { boundary: 0.86, six: 0.25, deepCatch: 0.55, single: 1.1 },
    Mixed: { boundary: 1, six: 1, deepCatch: 1, single: 1 },
    Aerial: { boundary: 1.2, six: 1.45, deepCatch: 1.35, wicket: 1.12 },
  }[tactics.shots]

  const running = {
    Conservative: { single: 0.9, runOut: 0.65 },
    Normal: { single: 1, runOut: 1 },
    Sharp: { single: 1.12, runOut: 1.28 },
  }[tactics.running]

  return {
    dot: aggression.dot,
    single: (aggression.single ?? 1) * (running.single ?? 1),
    boundary: (aggression.boundary ?? 1) * (shots.boundary ?? 1),
    six: (aggression.six ?? 1) * (shots.six ?? 1),
    wicket: (aggression.wicket ?? 1) * (shots.wicket ?? 1),
    deepCatch: shots.deepCatch,
    runOut: running.runOut,
  }
}

const combineModifiers = (base: ConditionModifiers, next: ConditionModifiers, scale = 1): ConditionModifiers => {
  const merged: ConditionModifiers = { ...base }
  for (const key of Object.keys(next) as (keyof ConditionModifiers)[]) {
    merged[key] = multiply(merged[key] ?? 1, next[key], scale)
  }
  return merged
}

const defaultConditions: MatchConditions = {
  matchTime: 'Day',
  outfield: 'Normal',
  difficulty: 'Standard',
}

const matchTimeModifiers: Record<MatchConditions['matchTime'], ConditionModifiers> = {
  Day: { timing: 1, swing: 1, seam: 1 },
  'Day-Night': { swing: 1.15, seam: 1.08, timing: 0.92, edge: 1.08 },
  Night: { swing: 1.08, timing: 0.95, fieldingDifficulty: 1.08 },
}

const outfieldModifiers: Record<OutfieldCondition, ConditionModifiers> = {
  Slow: { boundary: 0.88, single: 1.08, timing: 0.96 },
  Normal: { boundary: 1, single: 1, timing: 1 },
  Fast: { boundary: 1.12, single: 0.96, timing: 1.04 },
}

type Outcome = 'dot' | 'single' | 'two' | 'three' | 'four' | 'six' | 'wicket' | 'wide' | 'no-ball' | 'bye' | 'leg-bye'

const genericBatters = Array.from({ length: 11 }, (_, index) => ({
  id: `bat-${index + 1}`,
  name: `Batter ${index + 1}`,
}))

const genericBowlers = Array.from({ length: 5 }, (_, index) => ({
  id: `bowler-${index + 1}`,
  name: `Bowler ${index + 1}`,
}))

const overString = (legalBalls: number) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`

const maxLegalBalls = (format: MatchFormat) => {
  if (format === 'T20') return 120
  if (format === 'ODI') return 300
  return 540
}

const formatBaseWeights = (format: MatchFormat) => {
  if (format === 'T20') {
    return { dot: 0.31, single: 0.34, two: 0.075, three: 0.01, four: 0.12, six: 0.045, wicket: 0.042, wide: 0.022, noBall: 0.004, bye: 0.006, legBye: 0.006 }
  }

  if (format === 'ODI') {
    return { dot: 0.4, single: 0.36, two: 0.065, three: 0.008, four: 0.085, six: 0.018, wicket: 0.028, wide: 0.018, noBall: 0.003, bye: 0.006, legBye: 0.006 }
  }

  return { dot: 0.54, single: 0.29, two: 0.045, three: 0.005, four: 0.055, six: 0.008, wicket: 0.02, wide: 0.01, noBall: 0.002, bye: 0.006, legBye: 0.006 }
}

const chooseOutcome = (random: () => number, weights: Record<Outcome, number>): Outcome => {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0)
  let cursor = random() * total

  for (const [outcome, weight] of Object.entries(weights) as [Outcome, number][]) {
    cursor -= weight
    if (cursor <= 0) return outcome
  }

  return 'dot'
}

const pickWicketType = (random: () => number, modifiers: ConditionModifiers): BallEvent['wicketType'] => {
  const weights = [
    ['bowled', 0.18 * (modifiers.lbwBowled ?? 1)],
    ['lbw', 0.16 * (modifiers.lbwBowled ?? 1)],
    ['caught', 0.34 * (modifiers.deepCatch ?? 1)],
    ['caught-behind', 0.18 * (modifiers.edge ?? 1)],
    ['stumped', 0.05 * (modifiers.spin ?? 1)],
    ['run-out', 0.08 * (modifiers.runOut ?? 1)],
    ['hit-wicket', 0.01],
  ] as const
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0)
  let cursor = random() * total

  for (const [type, weight] of weights) {
    cursor -= weight
    if (cursor <= 0) return type
  }

  return 'caught'
}

const updatePartnerships = (
  partnerships: Partnership[],
  startWicket: number,
  startScore: number,
  startBalls: number,
  endWicket: number,
  endScore: number,
  endBalls: number,
  batters: string[],
) => {
  partnerships.push({
    wicket: endWicket,
    runs: endScore - startScore,
    balls: endBalls - startBalls,
    batters,
  })
}

export const buildTestForecast = (venue: Venue, weather: WeatherType): TestDayCondition[] => {
  const spinArc = venue.region === 'India' || venue.region === 'UAE' || venue.region === 'Bangladesh' || venue.region === 'Sri Lanka' ? 1.25 : 0.75
  const paceArc = venue.region === 'Australia' || venue.region === 'South Africa' ? 1.05 : 0.8
  const swingArc = venue.region === 'England' || venue.region === 'New Zealand' ? 1.15 : 0.85
  const weatherSwing = weather === 'Overcast' || weather === 'Cold Morning' || weather === 'Day-Night Evening' ? 1 : 0

  return [1, 2, 3, 4, 5].map((day) => {
    const wear = (day - 1) / 4
    const battingPeak = day === 2 || day === 3 ? 0.7 : 0
    return {
      day,
      label: day <= 2 ? 'settling' : day === 3 ? 'wear emerging' : day === 4 ? 'worn' : 'deteriorated',
      battingEase: clamp(venue.battingEase + battingPeak - wear * venue.deterioration * 0.45, 1, 10),
      paceCarry: clamp(venue.paceCarry + paceArc * wear * venue.deterioration * 0.25, 1, 10),
      seam: clamp(venue.seam + (day === 1 ? 1 : 0) - wear * 1.2 + weatherSwing, 1, 10),
      swing: clamp(venue.swing + (day === 1 ? 0.8 : 0) + weatherSwing * swingArc, 1, 10),
      spin: clamp(venue.spin + wear * venue.deterioration * spinArc, 1, 10),
      unevenBounce: clamp(2 + wear * venue.deterioration * (venue.region === 'Australia' || venue.region === 'South Africa' ? 1.05 : 0.9), 1, 10),
    }
  })
}

const buildMetadata = (
  seed: string,
  format: MatchFormat,
  venue: Venue,
  weatherId: WeatherType,
  pitchId: PitchType,
  tactics: BattingTactics,
  conditions: MatchConditions,
): SimulationMetadata => ({
  engineVersion: ENGINE_VERSION,
  rulesetVersion: RULESET_VERSION,
  dataVersion: DATA_VERSION,
  rosterVersion: ROSTER_VERSION,
  seed,
  format,
  venueId: venue.id,
  weatherId,
  pitchId,
  tactics,
  conditions,
})

export const simulateInnings = (
  venue: Venue,
  format: MatchFormat,
  weatherId: WeatherType,
  pitchId: PitchType,
  tactics: BattingTactics,
  conditions: Partial<MatchConditions> = {},
): SimulationResult => {
  const matchConditions = { ...defaultConditions, ...conditions }
  const weather = weatherProfiles.find((item) => item.id === weatherId) ?? weatherProfiles[0]
  const pitch = pitchProfiles.find((item) => item.id === pitchId) ?? pitchProfiles[0]
  const scale = formatScale[format]
  const seed = `${venue.id}-${format}-${weatherId}-${pitchId}-${JSON.stringify(tactics)}-${JSON.stringify(matchConditions)}`
  const random = createSeededRandom(seed)
  const par = parForFormat(venue, format)
  const forecast = buildTestForecast(venue, weatherId)
  const activeDay = format === 'Test' ? forecast[0] : null

  let modifiers: ConditionModifiers = {}
  modifiers = combineModifiers(modifiers, weather.modifiers, scale)
  modifiers = combineModifiers(modifiers, pitch.modifiers, scale)
  modifiers = combineModifiers(modifiers, matchTimeModifiers[matchConditions.matchTime], scale)
  modifiers = combineModifiers(modifiers, outfieldModifiers[matchConditions.outfield], 1)
  modifiers = combineModifiers(modifiers, tacticModifiers(tactics), 1)

  const venueBatting = venue.battingEase / 7
  const venueBowlingThreat = Math.max(venue.paceCarry, venue.seam, venue.swing, venue.spin) / 7
  const testDayBatting = activeDay ? activeDay.battingEase / venue.battingEase : 1
  const testDayThreat = activeDay ? Math.max(activeDay.seam, activeDay.swing, activeDay.spin, activeDay.unevenBounce) / Math.max(venue.seam, venue.swing, venue.spin, 1) : 1
  const battingFactor = clamp(venueBatting * testDayBatting * (modifiers.timing ?? 1), 0.45, 1.8)
  const wicketPressure = clamp(
    venueBowlingThreat *
      testDayThreat *
      (modifiers.wicket ?? 1) *
      (((modifiers.edge ?? 1) + (modifiers.lbwBowled ?? 1) + (modifiers.deepCatch ?? 1)) / 3),
    0.35,
    2.5,
  )

  const batting: BatterScore[] = genericBatters.map((batter) => ({ ...batter, runs: 0, balls: 0, fours: 0, sixes: 0 }))
  const bowling: BowlerFigures[] = genericBowlers.map((bowler) => ({ ...bowler, balls: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0 }))
  const events: BallEvent[] = []
  const fallOfWickets: FallOfWicket[] = []
  const partnerships: Partnership[] = []
  const extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0, total: 0 }
  const overRuns = new Map<string, number>()
  const overLegalBalls = new Map<string, number>()

  let score = 0
  let wickets = 0
  let legalBalls = 0
  let strikerIndex = 0
  let nonStrikerIndex = 1
  let nextBatterIndex = 2
  let partnershipStartScore = 0
  let partnershipStartBalls = 0
  let partnershipBatters = [batting[strikerIndex].name, batting[nonStrikerIndex].name]

  const maxBalls = maxLegalBalls(format)

  while (legalBalls < maxBalls && wickets < 10) {
    const phase = legalBalls / maxBalls
    const overNumber = Math.floor(legalBalls / 6)
    const bowlerIndex = overNumber % bowling.length
    const bowler = bowling[bowlerIndex]
    const base = formatBaseWeights(format)
    const deathOvers = format !== 'Test' && phase > 0.8
    const newBall = phase < 0.12
    const weights: Record<Outcome, number> = {
      dot: base.dot * (modifiers.dot ?? 1) * clamp(wicketPressure / battingFactor, 0.65, 1.45),
      single: base.single * (modifiers.single ?? 1) * clamp(battingFactor, 0.75, 1.25),
      two: base.two * (venue.outfield <= 7 ? 1.08 : 0.95) * (modifiers.single ?? 1),
      three: base.three * (venue.outfield >= 8 ? 1.1 : 0.85),
      four: base.four * (modifiers.boundary ?? 1) * battingFactor * (deathOvers ? 1.12 : 1),
      six: base.six * (modifiers.six ?? 1) * battingFactor * (deathOvers ? 1.18 : 1),
      wicket: base.wicket * wicketPressure * (newBall ? clamp((venue.seam + venue.swing) / 12, 0.9, 1.25) : 1),
      wide: base.wide * (matchConditions.difficulty === 'Casual' ? 0.9 : 1),
      'no-ball': base.noBall,
      bye: base.bye * (modifiers.fieldingDifficulty ?? 1),
      'leg-bye': base.legBye,
    }
    const outcome = chooseOutcome(random, weights)
    const legal = outcome !== 'wide' && outcome !== 'no-ball'
    const overAfterBall = legal ? legalBalls + 1 : legalBalls
    const event: BallEvent = {
      inningsBall: events.length + 1,
      over: overString(legal ? overAfterBall : legalBalls),
      legal,
      strikerId: batting[strikerIndex].id,
      nonStrikerId: batting[nonStrikerIndex].id,
      bowlerId: bowler.id,
      runsBat: 0,
      runsExtras: 0,
      totalRuns: 0,
      tags: [],
      commentary: '',
    }

    if (outcome === 'wide') {
      event.runsExtras = 1
      event.extraType = 'wide'
      event.tags.push('line-error')
      extras.wides += 1
      bowler.wides += 1
      bowler.runs += 1
    } else if (outcome === 'no-ball') {
      event.runsExtras = 1
      event.extraType = 'no-ball'
      event.tags.push('overstep')
      extras.noBalls += 1
      bowler.noBalls += 1
      bowler.runs += 1
    } else if (outcome === 'bye' || outcome === 'leg-bye') {
      event.runsExtras = outcome === 'bye' ? 1 : 1
      event.extraType = outcome
      event.tags.push(outcome === 'bye' ? 'keeper-miss' : 'body-line')
      extras[outcome === 'bye' ? 'byes' : 'legByes'] += event.runsExtras
    } else if (outcome === 'wicket') {
      const dismissal = pickWicketType(random, modifiers)
      const dismissed = batting[strikerIndex]
      event.wicketType = dismissal
      event.dismissedBatterId = dismissed.id
      event.tags.push(dismissal === 'caught-behind' ? 'edge' : dismissal === 'lbw' || dismissal === 'bowled' ? 'stumps' : 'wicket')
      dismissed.balls += 1
      dismissed.dismissal = `${dismissal} b ${bowler.name}`
      if (dismissal !== 'run-out') {
        bowler.wickets += 1
      }
      wickets += 1
      fallOfWickets.push({ wicket: wickets, score, over: event.over, batter: dismissed.name })
      updatePartnerships(partnerships, wickets - 1, partnershipStartScore, partnershipStartBalls, wickets, score, legalBalls + 1, partnershipBatters)
      partnershipStartScore = score
      partnershipStartBalls = legalBalls + 1
      strikerIndex = nextBatterIndex
      nextBatterIndex += 1
      partnershipBatters = wickets < 10 ? [batting[strikerIndex].name, batting[nonStrikerIndex].name] : partnershipBatters
    } else {
      const runs = outcome === 'single' ? 1 : outcome === 'two' ? 2 : outcome === 'three' ? 3 : outcome === 'four' ? 4 : outcome === 'six' ? 6 : 0
      const striker = batting[strikerIndex]
      event.runsBat = runs
      striker.runs += runs
      striker.balls += 1
      if (runs === 4) striker.fours += 1
      if (runs === 6) striker.sixes += 1
      bowler.runs += runs
      if (runs === 4 || runs === 6) event.tags.push('boundary')
      if (runs % 2 === 1) {
        ;[strikerIndex, nonStrikerIndex] = [nonStrikerIndex, strikerIndex]
      }
    }

    event.totalRuns = event.runsBat + event.runsExtras
    score += event.totalRuns
    extras.total += event.runsExtras
    const overKey = `${bowler.id}-${overNumber}`
    const bowlerConceded = event.runsBat + (event.extraType === 'wide' || event.extraType === 'no-ball' ? event.runsExtras : 0)
    overRuns.set(overKey, (overRuns.get(overKey) ?? 0) + bowlerConceded)

    if (legal) {
      legalBalls += 1
      bowler.balls += 1
      overLegalBalls.set(overKey, (overLegalBalls.get(overKey) ?? 0) + 1)
      if (legalBalls % 6 === 0) {
        ;[strikerIndex, nonStrikerIndex] = [nonStrikerIndex, strikerIndex]
      }
    }

    event.commentary =
      outcome === 'wicket'
        ? `${event.over}: wicket, ${event.wicketType} under ${pitch.id.toLowerCase()} ${weather.id.toLowerCase()} pressure.`
        : event.totalRuns === 0
          ? `${event.over}: dot ball, ${venue.name} conditions keep the batter honest.`
          : `${event.over}: ${event.totalRuns} run${event.totalRuns === 1 ? '' : 's'}${event.extraType ? ` (${event.extraType})` : ''}.`
    events.push(event)
  }

  if (wickets < 10) {
    updatePartnerships(partnerships, wickets, partnershipStartScore, partnershipStartBalls, wickets + 1, score, legalBalls, partnershipBatters)
  }

  for (const bowler of bowling) {
    bowler.maidens = Array.from(overRuns.entries()).filter(
      ([key, runs]) => key.startsWith(`${bowler.id}-`) && runs === 0 && overLegalBalls.get(key) === 6,
    ).length
  }

  const scorecard: InningsScorecard = {
    batting,
    bowling,
    extras,
    fallOfWickets,
    partnerships,
    balls: events,
  }
  const oversUsed = legalBalls / 6
  const metadata = buildMetadata(seed, format, venue, weatherId, pitchId, tactics, matchConditions)

  return {
    score,
    wickets,
    overs: overString(legalBalls),
    par,
    runRate: oversUsed > 0 ? (score / oversUsed).toFixed(2) : '0.00',
    forecast,
    scorecard,
    metadata,
    conditionReadout: [
      `${venue.name}: pace ${venue.paceCarry}/10, swing ${venue.swing}/10, spin ${venue.spin}/10, batting ${venue.battingEase}/10.`,
      `${weather.id}: ${weather.summary}`,
      `${pitch.id} pitch: ${pitch.summary}`,
      `${matchConditions.matchTime} match with ${matchConditions.outfield.toLowerCase()} outfield.`,
      `Format scale: ${format} applies ${Math.round(scale * 100)}% of environmental force.`,
    ],
    tacticalReadout: [
      `${tactics.aggression} intent with ${tactics.shots.toLowerCase()} shots.`,
      `Pace plan: ${tactics.pacePlan}; spin plan: ${tactics.spinPlan}.`,
      `Running risk: ${tactics.running}.`,
      `Difficulty: ${matchConditions.difficulty} changes guidance/AI quality later, not hidden result rigging.`,
    ],
    log: [
      `Powerplay read: ${venue.swing + venue.seam >= 14 || weatherId === 'Overcast' ? 'new ball threat is high' : 'batters can settle normally'}.`,
      `Middle phase: ${venue.spin >= 7 || pitchId === 'Dusty' ? 'spin matchups matter' : 'pace changes and field settings carry more value'}.`,
      `Toss lean: ${venue.toss}${weatherId === 'Dew' ? ' with extra chase value under dew' : ''}.`,
      ...events.slice(-8).map((event) => event.commentary),
    ],
  }
}
