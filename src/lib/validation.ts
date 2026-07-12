import type { PitchProfile, RosterData, Venue, WeatherProfile } from './types'

const ratingFields = ['paceCarry', 'seam', 'swing', 'spin', 'battingEase', 'outfield', 'deterioration'] as const
const playerRatingFields = ['battingRating', 'bowlingRating', 'fieldingRating', 'wicketkeepingRating', 'staminaRating', 'consistencyRating'] as const
const playerRoles = new Set(['Batter', 'Wicket-keeper', 'All-rounder', 'Bowler'])
const battingStyles = new Set(['Right-handed', 'Left-handed'])
const bowlingStyles = new Set([
  'None',
  'Right-arm fast',
  'Right-arm fast medium',
  'Right-arm medium fast',
  'Right-arm medium',
  'Left-arm fast',
  'Left-arm fast medium',
  'Left-arm medium fast',
  'Left-arm medium',
  'Right-arm off break',
  'Right-arm leg break',
  'Slow left-arm orthodox',
  'Left-arm wrist spin',
])
const battingOrders = new Set(['Opener', 'Top order', 'Middle order', 'Finisher', 'Tail'])

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

export const validateRosterData = (data: RosterData) => {
  const errors = [
    ...uniqueIdErrors(
      'Roster player',
      data.players.map((player) => player.id),
    ),
    ...uniqueIdErrors(
      'Roster team',
      data.teams.map((team) => team.id),
    ),
  ]
  const playerIds = new Set(data.players.map((player) => player.id))
  const teamIds = new Set(data.teams.map((team) => team.id))

  if (!data.rosterVersion.trim()) errors.push('Roster data is missing a version')

  for (const player of data.players) {
    if (!player.name.trim()) errors.push(`${player.id}.name is required`)
    if (!playerRoles.has(player.role)) errors.push(`${player.id}.role is invalid`)
    if (!battingStyles.has(player.battingStyle)) errors.push(`${player.id}.battingStyle is invalid`)
    if (!bowlingStyles.has(player.bowlingStyle)) errors.push(`${player.id}.bowlingStyle is invalid`)
    if (!battingOrders.has(player.battingOrder)) errors.push(`${player.id}.battingOrder is invalid`)
    if (!Number.isInteger(player.naturalAggression) || player.naturalAggression < 1 || player.naturalAggression > 5) {
      errors.push(`${player.id}.naturalAggression must be an integer from 1 to 5`)
    }

    for (const field of playerRatingFields) {
      const value = player[field]
      if (!Number.isInteger(value) || value < 0 || value > 100) {
        errors.push(`${player.id}.${field} must be an integer from 0 to 100`)
      }
    }

    if (player.role !== 'Wicket-keeper' && player.wicketkeepingRating !== 0) {
      errors.push(`${player.id}.wicketkeepingRating must be 0 for non-keepers`)
    }

    for (const teamId of player.sourceTeams) {
      if (!teamIds.has(teamId)) errors.push(`${player.id}.sourceTeams references missing team ${teamId}`)
    }
  }

  for (const team of data.teams) {
    if (!team.name.trim() || !team.abbreviation.trim()) errors.push(`${team.id} is missing team metadata`)
    if (team.type !== 'International' && team.type !== 'Franchise') errors.push(`${team.id}.type is invalid`)
    if (team.roster.length < 5) errors.push(`${team.id}.roster has too few players`)
    for (const playerId of team.roster) {
      if (!playerIds.has(playerId)) errors.push(`${team.id}.roster references missing player ${playerId}`)
    }
  }

  return errors
}
