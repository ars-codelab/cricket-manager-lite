import { describe, expect, it } from 'vitest'
import { pitchProfiles, venues, weatherProfiles } from './data'
import { validatePitchProfiles, validateVenues, validateWeatherProfiles } from './validation'

describe('fixture validation', () => {
  it('accepts current venue fixtures', () => {
    expect(validateVenues(venues)).toEqual([])
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
})
