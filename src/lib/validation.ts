import type { PitchProfile, Venue, WeatherProfile } from './types'

const ratingFields = ['paceCarry', 'seam', 'swing', 'spin', 'battingEase', 'outfield', 'deterioration'] as const

const uniqueIdErrors = (label: string, ids: string[]) => {
  const seen = new Set<string>()
  const errors: string[] = []

  for (const id of ids) {
    if (!id.trim()) {
      errors.push(`${label} has a blank id`)
      continue
    }

    if (seen.has(id)) {
      errors.push(`${label} id "${id}" is duplicated`)
      continue
    }

    seen.add(id)
  }

  return errors
}

export const validateVenues = (venues: Venue[]) => {
  const errors = uniqueIdErrors(
    'Venue',
    venues.map((venue) => venue.id),
  )

  for (const venue of venues) {
    for (const field of ratingFields) {
      const value = venue[field]
      if (!Number.isInteger(value) || value < 1 || value > 10) {
        errors.push(`${venue.id}.${field} must be an integer from 1 to 10`)
      }
    }

    if (venue.t20Par < 100 || venue.t20Par > 230) {
      errors.push(`${venue.id}.t20Par is outside the supported range`)
    }

    if (venue.odiPar < 180 || venue.odiPar > 380) {
      errors.push(`${venue.id}.odiPar is outside the supported range`)
    }

    if (!venue.name.trim() || !venue.city.trim() || !venue.country.trim() || !venue.region.trim()) {
      errors.push(`${venue.id} is missing location metadata`)
    }
  }

  return errors
}

export const validateWeatherProfiles = (profiles: WeatherProfile[]) =>
  uniqueIdErrors(
    'Weather profile',
    profiles.map((profile) => profile.id),
  )

export const validatePitchProfiles = (profiles: PitchProfile[]) =>
  uniqueIdErrors(
    'Pitch profile',
    profiles.map((profile) => profile.id),
  )
