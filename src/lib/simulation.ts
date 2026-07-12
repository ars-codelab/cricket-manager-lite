import { formatScale, parForFormat, pitchProfiles, venues, weatherProfiles } from './data'
import type {
  BallEvent,
  BatterScore,
  BattingTactics,
  BowlingLength,
  BowlingTactics,
  BowlerFigures,
  ConditionModifiers,
  AdvanceInningsCommand,
  Difficulty,
  FieldSetting,
  InningsState,
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

const ENGINE_VERSION = '0.3.0'
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

export const defaultBowlingTactics: BowlingTactics = {
  length: 'Good',
  line: 'Fourth stump',
  field: 'Balanced',
  variation: 'Mixed',
  pacePlan: 'Seam',
  spinPlan: 'Attack stumps',
}

export type AiCaptaincyPlan = {
  battingTactics: BattingTactics
  bowlingTactics: BowlingTactics
  bowlerId: string
  spellOvers: number
  reason: string
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

const bowlingTacticModifiers = (tactics: BowlingTactics): ConditionModifiers => {
  const length = {
    Full: { boundary: 1.08, lbwBowled: 1.12, swing: 1.05 },
    Good: { dot: 1.05, wicket: 1.04, edge: 1.08 },
    Short: { dot: 0.92, boundary: 1.08, deepCatch: 1.12, wicket: 1.02 },
    Yorker: { boundary: 0.9, wicket: 1.06, lbwBowled: 1.18, noBall: 1.08 },
  }[tactics.length]

  const line = {
    Stumps: { dot: 1.04, lbwBowled: 1.16, wide: 0.82 },
    'Fourth stump': { edge: 1.14, wicket: 1.04, dot: 1.02 },
    'Wide channel': { boundary: 0.94, edge: 1.06, wide: 1.32, dot: 1.05 },
  }[tactics.line]

  const field = {
    Attacking: { wicket: 1.16, boundary: 1.12, single: 0.94, deepCatch: 0.9 },
    Balanced: { wicket: 1, boundary: 1, single: 1 },
    Defensive: { wicket: 0.86, boundary: 0.86, single: 1.12, deepCatch: 1.14 },
  }[tactics.field]

  const variation = {
    Stock: { wide: 0.84, noBall: 0.9, timing: 1.04 },
    Mixed: { timing: 1, wicket: 1 },
    'Heavy variation': { timing: 0.92, wicket: 1.08, wide: 1.18, noBall: 1.08 },
  }[tactics.variation]

  const pace = {
    'Hit deck': { pace: 1.12, deepCatch: 1.08, boundary: 1.04 },
    Swing: { swing: 1.18, edge: 1.14, lbwBowled: 1.05 },
    Seam: { seam: 1.18, edge: 1.1, dot: 1.04 },
    'Change-ups': { timing: 0.9, wicket: 1.03, wide: 1.08 },
  }[tactics.pacePlan]

  const spin = {
    'Attack stumps': { spin: 1.08, lbwBowled: 1.1, wicket: 1.04 },
    'Defend into pitch': { spin: 1.04, dot: 1.08, boundary: 0.92 },
    'Use flight': { spin: 1.12, wicket: 1.1, six: 1.1 },
    'Fire it in': { dot: 1.07, boundary: 0.95, wicket: 0.94 },
  }[tactics.spinPlan]

  return { ...length, ...line, ...field, ...variation, ...pace, ...spin }
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

export const maxBallsPerBowler = (format: MatchFormat) => {
  if (format === 'T20') return 24
  if (format === 'ODI') return 60
  return Number.POSITIVE_INFINITY
}

const bowlerForPartialOver = (state: InningsState, targetOverNumber: number) => {
  let legalBalls = 0

  for (const ball of state.scorecard.balls) {
    const overNumber = Math.floor(legalBalls / 6)
    if (overNumber === targetOverNumber) return ball.bowlerId
    if (ball.legal) legalBalls += 1
  }

  return null
}

const lastLegalBowlerId = (state: InningsState) => {
  for (const ball of state.scorecard.balls.slice().reverse()) {
    if (ball.legal) return ball.bowlerId
  }

  return null
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
  const state = createInningsState(venue, format, weatherId, pitchId, tactics, conditions)
  advanceInnings(state, { mode: 'innings', battingTactics: tactics })
  return inningsStateToResult(state)
}

export const createInningsState = (
  venue: Venue,
  format: MatchFormat,
  weatherId: WeatherType,
  pitchId: PitchType,
  tactics: BattingTactics,
  conditions: Partial<MatchConditions> = {},
  options: { inningsNumber?: number; targetScore?: number } = {},
): InningsState => {
  const matchConditions = { ...defaultConditions, ...conditions }
  const weather = weatherProfiles.find((item) => item.id === weatherId) ?? weatherProfiles[0]
  const pitch = pitchProfiles.find((item) => item.id === pitchId) ?? pitchProfiles[0]
  const scale = formatScale[format]
  const seed = `${venue.id}-${format}-${weatherId}-${pitchId}-${JSON.stringify(tactics)}-${JSON.stringify(matchConditions)}`
  const random = createSeededRandom(seed)
  const par = parForFormat(venue, format)
  const forecast = buildTestForecast(venue, weatherId)
  const batting: BatterScore[] = genericBatters.map((batter) => ({ ...batter, runs: 0, balls: 0, fours: 0, sixes: 0 }))
  const bowling: BowlerFigures[] = genericBowlers.map((bowler) => ({ ...bowler, balls: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0 }))

  return {
    inningsNumber: options.inningsNumber ?? 1,
    score: 0,
    wickets: 0,
    legalBalls: 0,
    strikerIndex: 0,
    nonStrikerIndex: 1,
    nextBatterIndex: 2,
    partnershipStartScore: 0,
    partnershipStartBalls: 0,
    partnershipBatters: [batting[0].name, batting[1].name],
    completed: false,
    maxLegalBalls: maxLegalBalls(format),
    targetScore: options.targetScore,
    par,
    metadata: buildMetadata(seed, format, venue, weatherId, pitchId, tactics, matchConditions),
    forecast,
    scorecard: {
      batting,
      bowling,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, total: 0 },
      fallOfWickets: [],
      partnerships: [],
      balls: [],
    },
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
    random,
  }
}

const venueForState = (state: InningsState) => venues.find((item) => item.id === state.metadata.venueId) ?? venues[0]

const modifiersForDelivery = (
  state: InningsState,
  battingTactics: BattingTactics,
  bowlingTactics: BowlingTactics,
): { modifiers: ConditionModifiers; battingFactor: number; wicketPressure: number } => {
  const venue = venueForState(state)
  const weather = weatherProfiles.find((item) => item.id === state.metadata.weatherId) ?? weatherProfiles[0]
  const pitch = pitchProfiles.find((item) => item.id === state.metadata.pitchId) ?? pitchProfiles[0]
  const scale = formatScale[state.metadata.format]
  const activeDay = state.metadata.format === 'Test' ? state.forecast[Math.min(4, Math.floor(state.legalBalls / 90))] : null
  let modifiers: ConditionModifiers = {}

  modifiers = combineModifiers(modifiers, weather.modifiers, scale)
  modifiers = combineModifiers(modifiers, pitch.modifiers, scale)
  modifiers = combineModifiers(modifiers, matchTimeModifiers[state.metadata.conditions.matchTime], scale)
  modifiers = combineModifiers(modifiers, outfieldModifiers[state.metadata.conditions.outfield], 1)
  modifiers = combineModifiers(modifiers, tacticModifiers(battingTactics), 1)
  modifiers = combineModifiers(modifiers, bowlingTacticModifiers(bowlingTactics), 1)

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

  return { modifiers, battingFactor, wicketPressure }
}

const recalculateMaidens = (scorecard: InningsScorecard) => {
  const overRuns = new Map<string, number>()
  const overLegalBalls = new Map<string, number>()
  let legalBalls = 0

  for (const event of scorecard.balls) {
    const overNumber = Math.floor(legalBalls / 6)
    const overKey = `${event.bowlerId}-${overNumber}`
    const bowlerConceded = event.runsBat + (event.extraType === 'wide' || event.extraType === 'no-ball' ? event.runsExtras : 0)
    overRuns.set(overKey, (overRuns.get(overKey) ?? 0) + bowlerConceded)

    if (event.legal) {
      legalBalls += 1
      overLegalBalls.set(overKey, (overLegalBalls.get(overKey) ?? 0) + 1)
    }
  }

  for (const bowler of scorecard.bowling) {
    bowler.maidens = Array.from(overRuns.entries()).filter(
      ([key, runs]) => key.startsWith(`${bowler.id}-`) && runs === 0 && overLegalBalls.get(key) === 6,
    ).length
  }
}

const rebuildOpenPartnership = (state: InningsState) => {
  const completedPartnerships = state.scorecard.partnerships.filter((partnership) => partnership.wicket <= state.wickets)
  state.scorecard.partnerships = completedPartnerships

  if (!state.scorecard.balls.length || state.wickets >= 10) return

  updatePartnerships(
    state.scorecard.partnerships,
    state.wickets,
    state.partnershipStartScore,
    state.partnershipStartBalls,
    state.wickets + 1,
    state.score,
    state.legalBalls,
    state.partnershipBatters,
  )
}

export const defaultBowlerForOver = (state: InningsState, overNumber = Math.floor(state.legalBalls / 6)) => {
  const existingBowler = bowlerForPartialOver(state, overNumber)
  if (existingBowler) return existingBowler

  const maxBalls = maxBallsPerBowler(state.metadata.format)
  const previousBowler = state.legalBalls % 6 === 0 ? lastLegalBowlerId(state) : null
  const eligible = state.scorecard.bowling.filter((bowler) => bowler.balls < maxBalls && bowler.id !== previousBowler)
  const pool = eligible.length ? eligible : state.scorecard.bowling.filter((bowler) => bowler.balls < maxBalls)
  const openingSpellOvers = state.metadata.format === 'T20' ? 4 : state.metadata.format === 'ODI' ? 10 : 0
  const preferredOpeningBowler = state.scorecard.bowling[overNumber % 2]?.id

  if (overNumber < openingSpellOvers && pool.some((bowler) => bowler.id === preferredOpeningBowler)) {
    return preferredOpeningBowler
  }

  return [...pool].sort((first, second) => first.balls - second.balls)[0]?.id ?? state.scorecard.bowling[0]?.id ?? ''
}

export const chooseAiCaptaincyPlan = (state: InningsState, difficulty: Difficulty): AiCaptaincyPlan => {
  const venue = venueForState(state)
  const weather = weatherProfiles.find((item) => item.id === state.metadata.weatherId) ?? weatherProfiles[0]
  const pitch = pitchProfiles.find((item) => item.id === state.metadata.pitchId) ?? pitchProfiles[0]
  const phase = state.legalBalls / state.maxLegalBalls
  const targetScore = state.targetScore
  const chasing = typeof targetScore === 'number'
  const requiredRate = chasing ? (Math.max(targetScore - state.score, 1) / Math.max((state.maxLegalBalls - state.legalBalls) / 6, 0.1)) : 0
  const currentRate = state.legalBalls > 0 ? state.score / (state.legalBalls / 6) : state.par / (state.maxLegalBalls / 6)
  const needsRuns = chasing ? requiredRate > currentRate + 1.2 : phase > 0.72
  const conservativeAi = difficulty === 'Casual'
  const sharpAi = difficulty === 'Expert' || difficulty === 'Simulation'
  const spinHelp = venue.spin >= 7 || pitch.id === 'Dusty' || pitch.id === 'Worn' || pitch.id === 'Dry'
  const seamHelp = venue.seam + venue.swing >= 13 || weather.id === 'Overcast' || pitch.id === 'Green'
  const death = state.metadata.format !== 'Test' && phase > 0.78
  const bowlerId = defaultBowlerForOver(state)
  const selectedBowler = state.scorecard.bowling.find((bowler) => bowler.id === bowlerId)
  const bowlerIndex = Math.max(0, state.scorecard.bowling.findIndex((bowler) => bowler.id === bowlerId))
  const likelySpinner = bowlerIndex >= 2
  const length: BowlingLength = death ? 'Yorker' : seamHelp && !likelySpinner ? 'Good' : likelySpinner && spinHelp ? 'Full' : 'Good'
  const field: FieldSetting = conservativeAi ? 'Balanced' : state.wickets >= 7 || death ? 'Defensive' : seamHelp || spinHelp ? 'Attacking' : 'Balanced'

  const battingTactics: BattingTactics = {
    aggression: conservativeAi ? 'Balanced' : needsRuns ? (sharpAi ? 'Aggressive' : 'Positive') : seamHelp && phase < 0.18 ? 'Balanced' : 'Positive',
    shots: needsRuns && !seamHelp ? 'Mixed' : seamHelp ? 'Ground' : 'Mixed',
    pacePlan: seamHelp ? 'Play late' : death ? 'Counterattack' : 'Front-foot drive',
    spinPlan: spinHelp ? (needsRuns ? 'Sweep' : 'Rotate strike') : 'Rotate strike',
    running: sharpAi && !death ? 'Sharp' : 'Normal',
  }
  const bowlingTactics: BowlingTactics = {
    length,
    line: death ? 'Stumps' : seamHelp ? 'Fourth stump' : 'Stumps',
    field,
    variation: death || sharpAi ? 'Mixed' : 'Stock',
    pacePlan: seamHelp ? (weather.id === 'Overcast' ? 'Swing' : 'Seam') : death ? 'Change-ups' : 'Hit deck',
    spinPlan: spinHelp ? 'Use flight' : 'Defend into pitch',
  }
  const spellOvers = state.metadata.format === 'T20' ? 2 : state.metadata.format === 'ODI' ? (phase < 0.22 ? 5 : 3) : 6
  const reason = `${difficulty} AI picks ${selectedBowler?.name ?? 'best bowler'}: ${seamHelp ? 'seam/swing help' : spinHelp ? 'spin help' : death ? 'death-over control' : 'phase balance'}.`

  return { battingTactics, bowlingTactics, bowlerId, spellOvers, reason }
}

const resolveBowlerId = (state: InningsState, requestedBowlerId: string | undefined, requestedBowlerOver: number) => {
  const overNumber = Math.floor(state.legalBalls / 6)
  const existingBowler = bowlerForPartialOver(state, overNumber)
  if (existingBowler) return existingBowler

  if (requestedBowlerId && overNumber === requestedBowlerOver) {
    const bowler = state.scorecard.bowling.find((item) => item.id === requestedBowlerId)
    const previousBowler = state.legalBalls % 6 === 0 ? lastLegalBowlerId(state) : null
    if (bowler && bowler.balls < maxBallsPerBowler(state.metadata.format) && bowler.id !== previousBowler) return bowler.id
  }

  return defaultBowlerForOver(state, overNumber)
}

const simulateDelivery = (state: InningsState, command: AdvanceInningsCommand, requestedBowlerOver: number) => {
  const venue = venueForState(state)
  const weather = weatherProfiles.find((item) => item.id === state.metadata.weatherId) ?? weatherProfiles[0]
  const pitch = pitchProfiles.find((item) => item.id === state.metadata.pitchId) ?? pitchProfiles[0]
  const bowlingTactics = command.bowlingTactics ?? defaultBowlingTactics
  const { modifiers, battingFactor, wicketPressure } = modifiersForDelivery(state, command.battingTactics, bowlingTactics)
  const phase = state.legalBalls / state.maxLegalBalls
  const overNumber = Math.floor(state.legalBalls / 6)
  const bowlerId = resolveBowlerId(state, command.bowlerId, requestedBowlerOver)
  const bowler = state.scorecard.bowling.find((item) => item.id === bowlerId) ?? state.scorecard.bowling[0]
  const base = formatBaseWeights(state.metadata.format)
  const deathOvers = state.metadata.format !== 'Test' && phase > 0.8
  const newBall = phase < 0.12
  const weights: Record<Outcome, number> = {
    dot: base.dot * (modifiers.dot ?? 1) * clamp(wicketPressure / battingFactor, 0.65, 1.45),
    single: base.single * (modifiers.single ?? 1) * clamp(battingFactor, 0.75, 1.25),
    two: base.two * (venue.outfield <= 7 ? 1.08 : 0.95) * (modifiers.single ?? 1),
    three: base.three * (venue.outfield >= 8 ? 1.1 : 0.85),
    four: base.four * (modifiers.boundary ?? 1) * battingFactor * (deathOvers ? 1.12 : 1),
    six: base.six * (modifiers.six ?? 1) * battingFactor * (deathOvers ? 1.18 : 1),
    wicket: base.wicket * wicketPressure * (newBall ? clamp((venue.seam + venue.swing) / 12, 0.9, 1.25) : 1),
    wide: base.wide * (state.metadata.conditions.difficulty === 'Casual' ? 0.9 : 1) * (modifiers.wide ?? 1),
    'no-ball': base.noBall * (modifiers.noBall ?? 1),
    bye: base.bye * (modifiers.fieldingDifficulty ?? 1),
    'leg-bye': base.legBye,
  }
  const outcome = chooseOutcome(state.random, weights)
  const legal = outcome !== 'wide' && outcome !== 'no-ball'
  const overAfterBall = legal ? state.legalBalls + 1 : state.legalBalls
  const event: BallEvent = {
    inningsBall: state.scorecard.balls.length + 1,
    over: overString(legal ? overAfterBall : state.legalBalls),
    legal,
    strikerId: state.scorecard.batting[state.strikerIndex].id,
    nonStrikerId: state.scorecard.batting[state.nonStrikerIndex].id,
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
    state.scorecard.extras.wides += 1
    bowler.wides += 1
    bowler.runs += 1
  } else if (outcome === 'no-ball') {
    event.runsExtras = 1
    event.extraType = 'no-ball'
    event.tags.push('overstep')
    state.scorecard.extras.noBalls += 1
    bowler.noBalls += 1
    bowler.runs += 1
  } else if (outcome === 'bye' || outcome === 'leg-bye') {
    event.runsExtras = 1
    event.extraType = outcome
    event.tags.push(outcome === 'bye' ? 'keeper-miss' : 'body-line')
    state.scorecard.extras[outcome === 'bye' ? 'byes' : 'legByes'] += event.runsExtras
  } else if (outcome === 'wicket') {
    const dismissal = pickWicketType(state.random, modifiers)
    const dismissed = state.scorecard.batting[state.strikerIndex]
    event.wicketType = dismissal
    event.dismissedBatterId = dismissed.id
    event.tags.push(dismissal === 'caught-behind' ? 'edge' : dismissal === 'lbw' || dismissal === 'bowled' ? 'stumps' : 'wicket')
    dismissed.balls += 1
    dismissed.dismissal = `${dismissal} b ${bowler.name}`
    if (dismissal !== 'run-out') bowler.wickets += 1
    state.wickets += 1
    state.scorecard.fallOfWickets.push({ wicket: state.wickets, score: state.score, over: event.over, batter: dismissed.name })
    updatePartnerships(
      state.scorecard.partnerships,
      state.wickets - 1,
      state.partnershipStartScore,
      state.partnershipStartBalls,
      state.wickets,
      state.score,
      state.legalBalls + 1,
      state.partnershipBatters,
    )
    state.partnershipStartScore = state.score
    state.partnershipStartBalls = state.legalBalls + 1
    state.strikerIndex = state.nextBatterIndex
    state.nextBatterIndex += 1
    state.partnershipBatters =
      state.wickets < 10
        ? [state.scorecard.batting[state.strikerIndex].name, state.scorecard.batting[state.nonStrikerIndex].name]
        : state.partnershipBatters
  } else {
    const runs = outcome === 'single' ? 1 : outcome === 'two' ? 2 : outcome === 'three' ? 3 : outcome === 'four' ? 4 : outcome === 'six' ? 6 : 0
    const striker = state.scorecard.batting[state.strikerIndex]
    event.runsBat = runs
    striker.runs += runs
    striker.balls += 1
    if (runs === 4) striker.fours += 1
    if (runs === 6) striker.sixes += 1
    bowler.runs += runs
    if (runs === 4 || runs === 6) event.tags.push('boundary')
    if (runs % 2 === 1) {
      ;[state.strikerIndex, state.nonStrikerIndex] = [state.nonStrikerIndex, state.strikerIndex]
    }
  }

  event.totalRuns = event.runsBat + event.runsExtras
  state.score += event.totalRuns
  state.scorecard.extras.total += event.runsExtras

  if (legal) {
    state.legalBalls += 1
    bowler.balls += 1
    if (state.legalBalls % 6 === 0) {
      ;[state.strikerIndex, state.nonStrikerIndex] = [state.nonStrikerIndex, state.strikerIndex]
    }
  }

  event.commentary =
    outcome === 'wicket'
      ? `${event.over}: wicket, ${event.wicketType} from ${bowlingTactics.length.toLowerCase()} ${bowlingTactics.line.toLowerCase()} bowling under ${pitch.id.toLowerCase()} ${weather.id.toLowerCase()} pressure.`
      : event.totalRuns === 0
        ? `${event.over}: dot ball, ${venue.name} conditions and ${bowlingTactics.field.toLowerCase()} field keep the batter honest.`
        : `${event.over}: ${event.totalRuns} run${event.totalRuns === 1 ? '' : 's'}${event.extraType ? ` (${event.extraType})` : ''}.`
  state.scorecard.balls.push(event)
  recalculateMaidens(state.scorecard)
  state.completed =
    state.legalBalls >= state.maxLegalBalls ||
    state.wickets >= 10 ||
    (typeof state.targetScore === 'number' && state.score >= state.targetScore)
}

export const advanceInnings = (state: InningsState, command: AdvanceInningsCommand): InningsState => {
  if (state.completed) return state
  state.scorecard.partnerships = state.scorecard.partnerships.filter((partnership) => partnership.wicket <= state.wickets)

  const startLegalBalls = state.legalBalls
  const requestedBowlerOver = Math.floor(startLegalBalls / 6)
  const targetLegalBalls =
    command.mode === 'legal-balls'
      ? startLegalBalls + Math.max(0, command.legalBalls ?? 0)
      : command.mode === 'overs'
        ? startLegalBalls + Math.max(0, command.overs ?? 0) * 6
        : state.maxLegalBalls
  const startWickets = state.wickets

  while (!state.completed) {
    simulateDelivery(state, command, requestedBowlerOver)
    if (command.mode === 'wicket' && state.wickets > startWickets) break
    if ((command.mode === 'legal-balls' || command.mode === 'overs') && state.legalBalls >= targetLegalBalls) break
  }

  state.completed =
    state.legalBalls >= state.maxLegalBalls ||
    state.wickets >= 10 ||
    (typeof state.targetScore === 'number' && state.score >= state.targetScore)
  rebuildOpenPartnership(state)
  return state
}

export const inningsStateToResult = (state: InningsState): SimulationResult => {
  const venue = venueForState(state)
  const weatherId = state.metadata.weatherId
  const pitchId = state.metadata.pitchId
  const oversUsed = state.legalBalls / 6

  return {
    score: state.score,
    wickets: state.wickets,
    overs: overString(state.legalBalls),
    par: state.par,
    runRate: oversUsed > 0 ? (state.score / oversUsed).toFixed(2) : '0.00',
    forecast: state.forecast,
    scorecard: state.scorecard,
    metadata: state.metadata,
    conditionReadout: state.conditionReadout,
    tacticalReadout: state.tacticalReadout,
    log: [
      `Powerplay read: ${venue.swing + venue.seam >= 14 || weatherId === 'Overcast' ? 'new ball threat is high' : 'batters can settle normally'}.`,
      `Middle phase: ${venue.spin >= 7 || pitchId === 'Dusty' ? 'spin matchups matter' : 'pace changes and field settings carry more value'}.`,
      `Toss lean: ${venue.toss}${weatherId === 'Dew' ? ' with extra chase value under dew' : ''}.`,
      ...(typeof state.targetScore === 'number' ? [`Target: ${state.targetScore}.`] : []),
      ...state.scorecard.balls.slice(-8).map((event) => event.commentary),
    ],
  }
}
