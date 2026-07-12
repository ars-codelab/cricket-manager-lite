import { describe, expect, it } from 'vitest'
import { pitchProfiles, venues, weatherProfiles } from './data'
import { rosterData } from './rosters'
import { validatePitchProfiles, validateRosterData, validateVenues, validateWeatherProfiles } from './validation'

describe('fixture validation', () => {
  it('accepts current venue fixtures', () => {
    expect(validateVenues(venues)).toEqual([])
  })

  it('keeps the curated research venue matrix available', () => {
    const countries = new Set(venues.map((venue) => venue.country))

    expect(venues).toHaveLength(29)
    expect(countries).toEqual(
      new Set(['India', 'Australia', 'England', 'South Africa', 'UAE', 'Pakistan', 'Sri Lanka', 'Bangladesh', 'Barbados', 'New Zealand']),
    )
  })

  it('accepts current weather and pitch fixtures', () => {
    expect(validateWeatherProfiles(weatherProfiles)).toEqual([])
    expect(validatePitchProfiles(pitchProfiles)).toEqual([])
  })

  it('rejects duplicate venue ids and invalid ratings', () => {
    const invalid = [
      venues[0],
      {
        ...venues[0],
        paceCarry: 11,
      },
    ]

    expect(validateVenues(invalid)).toContain(`Venue id "${venues[0].id}" is duplicated`)
    expect(validateVenues(invalid)).toContain(`${venues[0].id}.paceCarry must be an integer from 1 to 10`)
  })

  it('accepts normalized roster fixtures', () => {
    expect(validateRosterData(rosterData)).toEqual([])
    expect(rosterData.teams).toHaveLength(20)
    expect(rosterData.players.length).toBeGreaterThan(150)
  })

  it('rejects broken roster references and invalid ratings', () => {
    const invalid = {
      ...rosterData,
      teams: [{ ...rosterData.teams[0], roster: ['missing-player'] }],
      players: [{ ...rosterData.players[0], battingRating: 101 }],
    }

    expect(validateRosterData(invalid)).toContain(`${rosterData.players[0].id}.battingRating must be an integer from 0 to 100`)
    expect(validateRosterData(invalid)).toContain(`${rosterData.teams[0].id}.roster references missing player missing-player`)
  })
})
