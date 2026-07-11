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

export type MatchConditions = {
  matchTime: MatchTime
  outfield: OutfieldCondition
  difficulty: Difficulty
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
  conditionReadout: string[]
  tacticalReadout: string[]
  forecast: TestDayCondition[]
  log: string[]
}
