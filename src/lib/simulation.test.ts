import { describe, expect, it } from 'vitest'
import { venues } from './data'
import { advanceInnings, buildTestForecast, chooseAiCaptaincyPlan, createInningsState, createSeededRandom, defaultBowlingTactics, simulateInnings } from './simulation'
import type { BattingTactics, BowlingTactics } from './types'

const tactics: BattingTactics = {
  aggression: 'Positive',
  shots: 'Mixed',
  pacePlan: 'Play late',
  spinPlan: 'Rotate strike',
  running: 'Normal',
}

const overBowlers = (balls: ReturnType<typeof simulateInnings>['scorecard']['balls']) => {
  const bowlers: string[] = []
  let legalBalls = 0

  for (const ball of balls) {
    const overNumber = Math.floor(legalBalls / 6)
    bowlers[overNumber] ??= ball.bowlerId
    if (ball.legal) legalBalls += 1
  }

  return bowlers
}

describe('createSeededRandom', () => {
  it('returns the same sequence for the same seed', () => {
    const first = createSeededRandom('wankhede-flat-humid')
    const second = createSeededRandom('wankhede-flat-humid')

    expect([first(), first(), first()]).toEqual([second(), second(), second()])
  })

  it('returns values in the unit interval', () => {
    const random = createSeededRandom('range-check')
    const values = Array.from({ length: 100 }, () => random())

    expect(values.every((value) => value >= 0 && value < 1)).toBe(true)
  })
})

describe('simulateInnings', () => {
  it('is deterministic for identical inputs', () => {
    const venue = venues.find((item) => item.id === 'wankhede') ?? venues[0]
    const first = simulateInnings(venue, 'T20', 'Humid', 'Flat', tactics)
    const second = simulateInnings(venue, 'T20', 'Humid', 'Flat', tactics)

    expect(second).toEqual(first)
  })

  it('lets custom match conditions change the deterministic outcome', () => {
    const venue = venues.find((item) => item.id === 'wankhede') ?? venues[0]
    const day = simulateInnings(venue, 'T20', 'Humid', 'Flat', tactics, { matchTime: 'Day', outfield: 'Normal', difficulty: 'Standard' })
    const night = simulateInnings(venue, 'T20', 'Humid', 'Flat', tactics, { matchTime: 'Day-Night', outfield: 'Fast', difficulty: 'Standard' })

    expect(night).not.toEqual(day)
    expect(night.conditionReadout).toContain('Day-Night match with fast outfield.')
  })

  it('keeps limited overs innings within expected bounds', () => {
    const venue = venues.find((item) => item.id === 'chepauk') ?? venues[0]
    const result = simulateInnings(venue, 'ODI', 'Dry', 'Dusty', tactics)

    expect(result.wickets).toBeGreaterThanOrEqual(1)
    expect(result.wickets).toBeLessThanOrEqual(10)
    expect(result.score).toBeGreaterThanOrEqual(42)
    expect(result.overs).toBe('50.0')
  })

  it('keeps scorecard accounting internally consistent', () => {
    const venue = venues.find((item) => item.id === 'lords') ?? venues[0]
    const result = simulateInnings(venue, 'T20', 'Overcast', 'Green', tactics)
    const batterRuns = result.scorecard.batting.reduce((total, batter) => total + batter.runs, 0)
    const legalBalls = result.scorecard.balls.filter((ball) => ball.legal).length
    const bowlerBalls = result.scorecard.bowling.reduce((total, bowler) => total + bowler.balls, 0)

    expect(result.score).toBe(batterRuns + result.scorecard.extras.total)
    expect(result.scorecard.balls.reduce((total, ball) => total + ball.totalRuns, 0)).toBe(result.score)
    expect(bowlerBalls).toBe(legalBalls)
    expect(result.overs).toBe(`${Math.floor(legalBalls / 6)}.${legalBalls % 6}`)
    expect(result.metadata.engineVersion).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('enforces limited-overs bowler caps', () => {
    const venue = venues.find((item) => item.id === 'wankhede') ?? venues[0]
    const t20 = simulateInnings(venue, 'T20', 'Humid', 'Flat', tactics)
    const odi = simulateInnings(venue, 'ODI', 'Humid', 'Flat', tactics)

    expect(Math.max(...t20.scorecard.bowling.map((bowler) => bowler.balls))).toBeLessThanOrEqual(24)
    expect(Math.max(...odi.scorecard.bowling.map((bowler) => bowler.balls))).toBeLessThanOrEqual(60)
  })
})

describe('stateful innings engine', () => {
  it('advances one over without precomputing the rest of the innings', () => {
    const venue = venues.find((item) => item.id === 'wankhede') ?? venues[0]
    const state = createInningsState(venue, 'T20', 'Humid', 'Flat', tactics)

    advanceInnings(state, { mode: 'overs', overs: 1, battingTactics: tactics })

    expect(state.legalBalls).toBe(6)
    expect(state.scorecard.balls.length).toBeGreaterThanOrEqual(6)
    expect(state.completed).toBe(false)
  })

  it('can stop on the next wicket', () => {
    const venue = venues.find((item) => item.id === 'lords') ?? venues[0]
    const state = createInningsState(venue, 'T20', 'Overcast', 'Green', {
      ...tactics,
      aggression: 'Attack',
      shots: 'Aerial',
    })

    advanceInnings(state, { mode: 'wicket', battingTactics: { ...tactics, aggression: 'Attack', shots: 'Aerial' } })

    expect(state.wickets).toBeGreaterThanOrEqual(1)
    expect(state.scorecard.balls.at(-1)?.wicketType).toBeTruthy()
  })

  it('applies a selected bowler to the next simulated over', () => {
    const venue = venues.find((item) => item.id === 'chepauk') ?? venues[0]
    const state = createInningsState(venue, 'T20', 'Dry', 'Dusty', tactics)

    advanceInnings(state, { mode: 'overs', overs: 1, battingTactics: tactics, bowlerId: 'bowler-4' })

    expect(new Set(state.scorecard.balls.map((ball) => ball.bowlerId))).toEqual(new Set(['bowler-4']))
    expect(state.scorecard.bowling.find((bowler) => bowler.id === 'bowler-4')?.balls).toBe(6)
  })

  it('uses opening bowlers up front and only applies manual bowler choice to the next over', () => {
    const venue = venues.find((item) => item.id === 'wankhede') ?? venues[0]
    const state = createInningsState(venue, 'T20', 'Humid', 'Flat', tactics)

    advanceInnings(state, { mode: 'overs', overs: 4, battingTactics: tactics, bowlerId: 'bowler-4' })

    expect(overBowlers(state.scorecard.balls).slice(0, 4)).toEqual(['bowler-4', 'bowler-2', 'bowler-1', 'bowler-2'])
    expect(state.scorecard.bowling.find((bowler) => bowler.id === 'bowler-4')?.balls).toBe(6)
  })

  it('lets live batting and bowling plans change future deterministic outcomes', () => {
    const venue = venues.find((item) => item.id === 'wankhede') ?? venues[0]
    const defensive = createInningsState(venue, 'T20', 'Humid', 'Flat', tactics)
    const attacking = createInningsState(venue, 'T20', 'Humid', 'Flat', tactics)
    const defensiveBowling: BowlingTactics = { ...defaultBowlingTactics, field: 'Defensive', length: 'Good' }
    const attackingBowling: BowlingTactics = { ...defaultBowlingTactics, field: 'Attacking', length: 'Yorker' }

    advanceInnings(defensive, {
      mode: 'overs',
      overs: 4,
      battingTactics: { ...tactics, aggression: 'Defensive', shots: 'Ground' },
      bowlingTactics: defensiveBowling,
    })
    advanceInnings(attacking, {
      mode: 'overs',
      overs: 4,
      battingTactics: { ...tactics, aggression: 'Attack', shots: 'Aerial' },
      bowlingTactics: attackingBowling,
    })

    expect(attacking.scorecard.balls).not.toEqual(defensive.scorecard.balls)
  })

  it('stops a chase once the target is reached', () => {
    const venue = venues.find((item) => item.id === 'wankhede') ?? venues[0]
    const chase = createInningsState(venue, 'T20', 'Humid', 'Flat', tactics, {}, { inningsNumber: 2, targetScore: 1 })

    advanceInnings(chase, { mode: 'innings', battingTactics: tactics })

    expect(chase.completed).toBe(true)
    expect(chase.score).toBeGreaterThanOrEqual(1)
    expect(chase.scorecard.balls.length).toBeGreaterThan(0)
  })
})

describe('AI captaincy plan', () => {
  it('chooses condition-aware plans and finite limited-overs spell targets', () => {
    const venue = venues.find((item) => item.id === 'lords') ?? venues[0]
    const state = createInningsState(venue, 'T20', 'Overcast', 'Green', tactics, { difficulty: 'Expert' })
    const plan = chooseAiCaptaincyPlan(state, 'Expert')

    expect(plan.bowlerId).toMatch(/^bowler-/)
    expect(plan.spellOvers).toBeGreaterThanOrEqual(1)
    expect(plan.spellOvers).toBeLessThanOrEqual(4)
    expect(plan.bowlingTactics.pacePlan).toBe('Swing')
    expect(plan.battingTactics.pacePlan).toBe('Play late')
    expect(plan.reason).toContain('Expert AI')
  })

  it('avoids exhausted limited-overs bowlers', () => {
    const venue = venues.find((item) => item.id === 'wankhede') ?? venues[0]
    const state = createInningsState(venue, 'T20', 'Humid', 'Flat', tactics)
    state.scorecard.bowling[0].balls = 24
    state.scorecard.bowling[1].balls = 24
    const plan = chooseAiCaptaincyPlan(state, 'Standard')

    expect(plan.bowlerId).not.toBe('bowler-1')
    expect(plan.bowlerId).not.toBe('bowler-2')
  })
})

describe('buildTestForecast', () => {
  it('models increasing spin and decreasing batting ease on deteriorating subcontinental pitches', () => {
    const venue = venues.find((item) => item.id === 'chepauk') ?? venues[0]
    const forecast = buildTestForecast(venue, 'Dry')
    const dayOne = forecast[0]
    const dayFive = forecast[4]

    expect(dayFive.spin).toBeGreaterThan(dayOne.spin)
    expect(dayFive.battingEase).toBeLessThan(dayOne.battingEase)
  })
})
