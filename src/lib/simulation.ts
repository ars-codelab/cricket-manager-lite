import { formatScale, parForFormat, pitchProfiles, weatherProfiles } from './data'
import type {
  BattingTactics,
  ConditionModifiers,
  MatchConditions,
  MatchFormat,
  OutfieldCondition,
  PitchType,
  SimulationResult,
  TestDayCondition,
  Venue,
  WeatherType,
} from './types'

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

export const buildTestForecast = (venue: Venue, weather: WeatherType): TestDayCondition[] => {
  const spinArc = venue.region === 'India' || venue.region === 'UAE' || venue.region === 'Bangladesh' ? 1.25 : 0.75
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
  const random = createSeededRandom(`${venue.id}-${format}-${weatherId}-${pitchId}-${JSON.stringify(tactics)}-${JSON.stringify(matchConditions)}`)
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

  const baseBalls = format === 'T20' ? 120 : format === 'ODI' ? 300 : 540
  const baseRunRate = format === 'T20' ? par / 20 : format === 'ODI' ? par / 50 : par / 90
  const runRate = clamp(
    baseRunRate *
      venueBatting *
      testDayBatting *
      (modifiers.timing ?? 1) *
      (((modifiers.boundary ?? 1) + (modifiers.single ?? 1)) / 2) *
      (0.92 + random() * 0.18),
    format === 'T20' ? 4.5 : 1.8,
    format === 'T20' ? 13.5 : format === 'ODI' ? 8.5 : 5.8,
  )

  const wicketPressure = clamp(
    venueBowlingThreat *
      testDayThreat *
      (modifiers.wicket ?? 1) *
      (((modifiers.edge ?? 1) + (modifiers.lbwBowled ?? 1) + (modifiers.deepCatch ?? 1)) / 3) *
      (0.82 + random() * 0.36),
    0.45,
    2.2,
  )

  const oversUsed = format === 'Test' ? clamp(58 + random() * 32, 35, 90) : baseBalls / 6
  const rawScore = runRate * oversUsed
  const wickets = Math.min(10, Math.max(1, Math.round((format === 'Test' ? 4.2 : format === 'ODI' ? 5.6 : 6.1) * wicketPressure + random() * 2 - 1)))
  const allOutPenalty = wickets >= 10 ? 0.82 + random() * 0.1 : 1
  const score = Math.max(42, Math.round(rawScore * allOutPenalty))
  const fullOvers = Math.floor(oversUsed)
  const balls = Math.floor((oversUsed - fullOvers) * 6)

  return {
    score,
    wickets,
    overs: `${fullOvers}.${balls}`,
    par,
    runRate: (score / oversUsed).toFixed(2),
    forecast,
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
    ],
  }
}
