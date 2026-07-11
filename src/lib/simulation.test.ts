import { describe, expect, it } from 'vitest'
import { venues } from './data'
import { buildTestForecast, createSeededRandom, simulateInnings } from './simulation'
import type { BattingTactics } from './types'

const tactics: BattingTactics = {
  aggression: 'Positive',
  shots: 'Mixed',
  pacePlan: 'Play late',
  spinPlan: 'Rotate strike',
  running: 'Normal',
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

  it('keeps limited overs innings within expected bounds', () => {
    const venue = venues.find((item) => item.id === 'chepauk') ?? venues[0]
    const result = simulateInnings(venue, 'ODI', 'Dry', 'Dusty', tactics)

    expect(result.wickets).toBeGreaterThanOrEqual(1)
    expect(result.wickets).toBeLessThanOrEqual(10)
    expect(result.score).toBeGreaterThanOrEqual(42)
    expect(result.overs).toBe('50.0')
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
