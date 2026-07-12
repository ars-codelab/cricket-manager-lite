export type MatchFormat = 'T20' | 'ODI' | 'Test'
export type WeatherType = 'Sunny' | 'Hot' | 'Dry' | 'Humid' | 'Overcast' | 'Rain Threat' | 'Dew' | 'Wind' | 'Cold Morning' | 'Day-Night Evening'
export type PitchType = 'Green' | 'Hard' | 'Flat' | 'Dry' | 'Dusty' | 'Slow' | 'Low' | 'Cracked' | 'Worn' | 'Damp' | 'Two-paced'
export type TossPreference = 'Bat First' | 'Bowl First'
export type Aggression = 'Defensive' | 'Balanced' | 'Positive' | 'Aggressive' | 'Attack'
export type ShotSelection = 'Ground' | 'Mixed' | 'Aerial'
export type PacePlan = 'Play late' | 'Front-foot drive' | 'Back-foot play' | 'Short-ball caution' | 'Counterattack'
export type SpinPlan = 'Play straight' | 'Sweep' | 'Use feet' | 'Rotate strike' | 'Defend'
export type RunningRisk = 'Conservative' | 'Normal' | 'Sharp'
export type Difficulty = 'Casual' | 'Standard' | 'Expert' | 'Simulation'
export type MatchTime = 'Day' | 'Day-Night' | 'Night'
export type OutfieldCondition = 'Slow' | 'Normal' | 'Fast'
export type BowlingLength = 'Full' | 'Good' | 'Short' | 'Yorker'
export type BowlingLine = 'Stumps' | 'Fourth stump' | 'Wide channel'
export type FieldSetting = 'Attacking' | 'Balanced' | 'Defensive'
export type VariationUse = 'Stock' | 'Mixed' | 'Heavy variation'
export type PaceBowlingPlan = 'Hit deck' | 'Swing' | 'Seam' | 'Change-ups'
export type SpinBowlingPlan = 'Attack stumps' | 'Defend into pitch' | 'Use flight' | 'Fire it in'
export type ExtraType = 'wide' | 'no-ball' | 'bye' | 'leg-bye'
export type WicketType = 'bowled' | 'lbw' | 'caught' | 'caught-behind' | 'stumped' | 'run-out' | 'hit-wicket'
export type PlayerRole = 'Batter' | 'Wicket-keeper' | 'All-rounder' | 'Bowler'
export type BattingStyle = 'Right-handed' | 'Left-handed'
export type BowlingStyle =
  | 'None'
  | 'Right-arm fast'
  | 'Right-arm fast medium'
  | 'Right-arm medium fast'
  | 'Right-arm medium'
  | 'Left-arm fast'
  | 'Left-arm fast medium'
  | 'Left-arm medium fast'
  | 'Left-arm medium'
  | 'Right-arm off break'
  | 'Right-arm leg break'
  | 'Slow left-arm orthodox'
  | 'Left-arm wrist spin'
export type BattingOrderBand = 'Opener' | 'Top order' | 'Middle order' | 'Finisher' | 'Tail'
export type RosterTeamType = 'International' | 'Franchise'

export type Venue = {
  id: string
  name: string
  city: string
  country: string
  region: string
  paceCarry: number
  seam: number
  swing: number
  spin: number
  battingEase: number
  outfield: number
  deterioration: number
  toss: TossPreference
  t20Par: number
  odiPar: number
  notes: string
}

export type WeatherProfile = {
  id: WeatherType
  summary: string
  modifiers: ConditionModifiers
}

export type PitchProfile = {
  id: PitchType
  summary: string
  modifiers: ConditionModifiers
}

export type ConditionModifiers = {
  dot?: number
  single?: number
  boundary?: number
  six?: number
  wicket?: number
  edge?: number
  lbwBowled?: number
  deepCatch?: number
  runOut?: number
  wide?: number
  noBall?: number
  timing?: number
  pace?: number
  swing?: number
  seam?: number
  spin?: number
  fieldingDifficulty?: number
  fatigue?: number
}

export type BattingTactics = {
  aggression: Aggression
  shots: ShotSelection
  pacePlan: PacePlan
  spinPlan: SpinPlan
  running: RunningRisk
}

export type BowlingTactics = {
  length: BowlingLength
  line: BowlingLine
  field: FieldSetting
  variation: VariationUse
  pacePlan: PaceBowlingPlan
  spinPlan: SpinBowlingPlan
}

export type MatchConditions = {
  matchTime: MatchTime
  outfield: OutfieldCondition
  difficulty: Difficulty
}

export type PlayerProfile = {
  id: string
  name: string
  role: PlayerRole
  battingStyle: BattingStyle
  bowlingStyle: BowlingStyle
  battingRating: number
  bowlingRating: number
  fieldingRating: number
  wicketkeepingRating: number
  staminaRating: number
  consistencyRating: number
  naturalAggression: number
  battingOrder: BattingOrderBand
  traits: string[]
  sourceTeams: string[]
}

export type RosterTeam = {
  id: string
  name: string
  abbreviation: string
  type: RosterTeamType
  roster: string[]
}

export type RosterData = {
  rosterVersion: string
  generatedFrom: string[]
  players: PlayerProfile[]
  teams: RosterTeam[]
}

export type BallEvent = {
  inningsBall: number
  over: string
  legal: boolean
  strikerId: string
  nonStrikerId: string
  bowlerId: string
  runsBat: number
  runsExtras: number
  totalRuns: number
  extraType?: ExtraType
  wicketType?: WicketType
  dismissedBatterId?: string
  commentary: string
  tags: string[]
}

export type BatterScore = {
  id: string
  name: string
  runs: number
  balls: number
  fours: number
  sixes: number
  dismissal?: string
}

export type BowlerFigures = {
  id: string
  name: string
  balls: number
  maidens: number
  runs: number
  wickets: number
  wides: number
  noBalls: number
}

export type FallOfWicket = {
  wicket: number
  score: number
  over: string
  batter: string
}

export type Partnership = {
  wicket: number
  runs: number
  balls: number
  batters: string[]
}

export type ExtrasBreakdown = {
  wides: number
  noBalls: number
  byes: number
  legByes: number
  total: number
}

export type InningsScorecard = {
  batting: BatterScore[]
  bowling: BowlerFigures[]
  extras: ExtrasBreakdown
  fallOfWickets: FallOfWicket[]
  partnerships: Partnership[]
  balls: BallEvent[]
}

export type SimulationMetadata = {
  engineVersion: string
  rulesetVersion: string
  dataVersion: string
  rosterVersion: string
  seed: string
  format: MatchFormat
  venueId: string
  weatherId: WeatherType
  pitchId: PitchType
  battingTeamId?: string
  bowlingTeamId?: string
  tactics: BattingTactics
  conditions: MatchConditions
}

export type TestDayCondition = {
  day: number
  label: string
  battingEase: number
  paceCarry: number
  seam: number
  swing: number
  spin: number
  unevenBounce: number
}

export type SimulationResult = {
  score: number
  wickets: number
  overs: string
  par: number
  runRate: string
  scorecard: InningsScorecard
  metadata: SimulationMetadata
  conditionReadout: string[]
  tacticalReadout: string[]
  forecast: TestDayCondition[]
  log: string[]
}

export type InningsState = {
  inningsNumber: number
  score: number
  wickets: number
  legalBalls: number
  strikerIndex: number
  nonStrikerIndex: number
  nextBatterIndex: number
  partnershipStartScore: number
  partnershipStartBalls: number
  partnershipBatters: string[]
  completed: boolean
  maxLegalBalls: number
  targetScore?: number
  par: number
  metadata: SimulationMetadata
  forecast: TestDayCondition[]
  scorecard: InningsScorecard
  conditionReadout: string[]
  tacticalReadout: string[]
  random: () => number
}

export type AdvanceInningsCommand = {
  mode: 'legal-balls' | 'overs' | 'wicket' | 'innings'
  legalBalls?: number
  overs?: number
  battingTactics: BattingTactics
  bowlerId?: string
  bowlingTactics?: BowlingTactics
}
