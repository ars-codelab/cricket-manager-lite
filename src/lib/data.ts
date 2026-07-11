import type { MatchFormat, PitchProfile, Venue, WeatherProfile } from './types'

export const venues: Venue[] = [
  { id: 'wankhede', name: 'Wankhede Stadium', city: 'Mumbai', country: 'India', region: 'India', paceCarry: 8, seam: 6, swing: 7, spin: 4, battingEase: 9, outfield: 9, deterioration: 5, toss: 'Bowl First', t20Par: 185, odiPar: 290, notes: 'Red soil, evening swing, heavy dew and a quick outfield.' },
  { id: 'chepauk', name: 'M. A. Chidambaram Stadium', city: 'Chennai', country: 'India', region: 'India', paceCarry: 4, seam: 4, swing: 3, spin: 9, battingEase: 6, outfield: 7, deterioration: 8, toss: 'Bat First', t20Par: 160, odiPar: 245, notes: 'Sticky red-clay blend with major spin and late-match deterioration.' },
  { id: 'eden-gardens', name: 'Eden Gardens', city: 'Kolkata', country: 'India', region: 'India', paceCarry: 7, seam: 5, swing: 6, spin: 6, battingEase: 8, outfield: 9, deterioration: 6, toss: 'Bowl First', t20Par: 180, odiPar: 280, notes: 'Re-laid grass base, consistent bounce and a lightning-fast outfield.' },
  { id: 'arun-jaitley', name: 'Arun Jaitley Stadium', city: 'Delhi', country: 'India', region: 'India', paceCarry: 5, seam: 4, swing: 4, spin: 7, battingEase: 7, outfield: 8, deterioration: 7, toss: 'Bowl First', t20Par: 170, odiPar: 260, notes: 'Black-soil base with slow, low bounce and high friction.' },
  { id: 'chinnaswamy', name: 'M. Chinnaswamy Stadium', city: 'Bengaluru', country: 'India', region: 'India', paceCarry: 6, seam: 4, swing: 4, spin: 5, battingEase: 10, outfield: 10, deterioration: 4, toss: 'Bowl First', t20Par: 195, odiPar: 315, notes: 'Small boundaries and altitude produce a batting highway.' },
  { id: 'ahmedabad', name: 'Narendra Modi Stadium', city: 'Ahmedabad', country: 'India', region: 'India', paceCarry: 7, seam: 6, swing: 5, spin: 6, battingEase: 8, outfield: 9, deterioration: 5, toss: 'Bowl First', t20Par: 175, odiPar: 270, notes: 'Alternating red and black soil pitches create varied bounce and wear.' },
  { id: 'mcg', name: 'Melbourne Cricket Ground', city: 'Melbourne', country: 'Australia', region: 'Australia', paceCarry: 7, seam: 6, swing: 5, spin: 5, battingEase: 7, outfield: 8, deterioration: 5, toss: 'Bowl First', t20Par: 160, odiPar: 255, notes: 'Large outfield, true carry and heavy running value.' },
  { id: 'scg', name: 'Sydney Cricket Ground', city: 'Sydney', country: 'Australia', region: 'Australia', paceCarry: 5, seam: 5, swing: 5, spin: 8, battingEase: 7, outfield: 8, deterioration: 7, toss: 'Bat First', t20Par: 165, odiPar: 260, notes: 'Bulli clay dries into useful turn as matches wear on.' },
  { id: 'adelaide', name: 'Adelaide Oval', city: 'Adelaide', country: 'Australia', region: 'Australia', paceCarry: 6, seam: 7, swing: 8, spin: 5, battingEase: 8, outfield: 8, deterioration: 6, toss: 'Bowl First', t20Par: 170, odiPar: 275, notes: 'Drop-in basalt pitch with major twilight and pink-ball swing.' },
  { id: 'perth', name: 'Perth Stadium', city: 'Perth', country: 'Australia', region: 'Australia', paceCarry: 10, seam: 8, swing: 6, spin: 3, battingEase: 7, outfield: 9, deterioration: 6, toss: 'Bowl First', t20Par: 165, odiPar: 265, notes: 'Extreme pace, bounce and crack-driven late unevenness.' },
  { id: 'gabba', name: 'The Gabba', city: 'Brisbane', country: 'Australia', region: 'Australia', paceCarry: 9, seam: 8, swing: 7, spin: 4, battingEase: 7, outfield: 8, deterioration: 6, toss: 'Bowl First', t20Par: 170, odiPar: 270, notes: 'Queensland clay retains morning moisture and produces steep bounce.' },
  { id: 'lords', name: "Lord's", city: 'London', country: 'England', region: 'England', paceCarry: 6, seam: 8, swing: 9, spin: 4, battingEase: 6, outfield: 7, deterioration: 5, toss: 'Bowl First', t20Par: 155, odiPar: 245, notes: 'Slope, high swing and seam when moisture is present.' },
  { id: 'oval', name: 'The Oval', city: 'London', country: 'England', region: 'England', paceCarry: 7, seam: 5, swing: 6, spin: 7, battingEase: 8, outfield: 8, deterioration: 6, toss: 'Bowl First', t20Par: 175, odiPar: 285, notes: 'Flat early, abrasive late, with spin entering the game.' },
  { id: 'headingley', name: 'Headingley', city: 'Leeds', country: 'England', region: 'England', paceCarry: 6, seam: 8, swing: 9, spin: 3, battingEase: 6, outfield: 7, deterioration: 5, toss: 'Bowl First', t20Par: 160, odiPar: 250, notes: 'Responsive silty loam, highly sensitive to cloud and lateral seam.' },
  { id: 'old-trafford', name: 'Old Trafford', city: 'Manchester', country: 'England', region: 'England', paceCarry: 7, seam: 6, swing: 6, spin: 8, battingEase: 7, outfield: 8, deterioration: 7, toss: 'Bat First', t20Par: 165, odiPar: 265, notes: 'Abrasive compacted loam supporting reverse swing and sharp spin.' },
  { id: 'edgbaston', name: 'Edgbaston', city: 'Birmingham', country: 'England', region: 'England', paceCarry: 7, seam: 7, swing: 7, spin: 6, battingEase: 7, outfield: 8, deterioration: 6, toss: 'Bowl First', t20Par: 170, odiPar: 270, notes: 'Balanced deck with reliable carry and active lateral seam.' },
  { id: 'trent-bridge', name: 'Trent Bridge', city: 'Nottingham', country: 'England', region: 'England', paceCarry: 6, seam: 6, swing: 8, spin: 4, battingEase: 9, outfield: 9, deterioration: 4, toss: 'Bowl First', t20Par: 185, odiPar: 305, notes: 'Flat white-ball highway after early swing movement.' },
  { id: 'wanderers', name: 'The Wanderers', city: 'Johannesburg', country: 'South Africa', region: 'South Africa', paceCarry: 9, seam: 8, swing: 6, spin: 3, battingEase: 8, outfield: 9, deterioration: 6, toss: 'Bowl First', t20Par: 180, odiPar: 295, notes: 'Altitude reduces drag, aiding carry and six distance.' },
  { id: 'centurion', name: 'SuperSport Park', city: 'Centurion', country: 'South Africa', region: 'South Africa', paceCarry: 9, seam: 9, swing: 7, spin: 4, battingEase: 7, outfield: 8, deterioration: 7, toss: 'Bowl First', t20Par: 175, odiPar: 275, notes: 'Heavy clay dries quickly, opens cracks and rewards active seam.' },
  { id: 'newlands', name: 'Newlands', city: 'Cape Town', country: 'South Africa', region: 'South Africa', paceCarry: 6, seam: 7, swing: 7, spin: 7, battingEase: 6, outfield: 7, deterioration: 8, toss: 'Bat First', t20Par: 160, odiPar: 250, notes: 'Table Mountain winds, early swing and later spin turn.' },
  { id: 'kingsmead', name: 'Kingsmead', city: 'Durban', country: 'South Africa', region: 'South Africa', paceCarry: 7, seam: 7, swing: 9, spin: 5, battingEase: 6, outfield: 7, deterioration: 6, toss: 'Bowl First', t20Par: 155, odiPar: 240, notes: 'Coastal humidity and moisture generate persistent heavy swing.' },
  { id: 'dubai', name: 'Dubai International Stadium', city: 'Dubai', country: 'UAE', region: 'UAE', paceCarry: 6, seam: 5, swing: 5, spin: 7, battingEase: 7, outfield: 7, deterioration: 6, toss: 'Bowl First', t20Par: 155, odiPar: 240, notes: 'Dry surface with spin, reverse swing and major evening dew.' },
  { id: 'sharjah', name: 'Sharjah Cricket Stadium', city: 'Sharjah', country: 'UAE', region: 'UAE', paceCarry: 4, seam: 4, swing: 4, spin: 8, battingEase: 8, outfield: 8, deterioration: 8, toss: 'Bat First', t20Par: 165, odiPar: 250, notes: 'Abrasive desert clay, low bounce and dusty spin assistance.' },
  { id: 'gaddafi', name: 'Gaddafi Stadium', city: 'Lahore', country: 'Pakistan', region: 'Pakistan', paceCarry: 5, seam: 4, swing: 5, spin: 6, battingEase: 9, outfield: 9, deterioration: 5, toss: 'Bat First', t20Par: 175, odiPar: 285, notes: 'Flat alluvial clay that stays cohesive and high scoring.' },
  { id: 'karachi', name: 'National Stadium', city: 'Karachi', country: 'Pakistan', region: 'Pakistan', paceCarry: 6, seam: 4, swing: 5, spin: 7, battingEase: 8, outfield: 8, deterioration: 7, toss: 'Bat First', t20Par: 170, odiPar: 275, notes: 'Silty Indus clay scuffs the ball early for reverse swing and spin.' },
  { id: 'premadasa', name: 'R. Premadasa Stadium', city: 'Colombo', country: 'Sri Lanka', region: 'Sri Lanka', paceCarry: 4, seam: 4, swing: 5, spin: 8, battingEase: 6, outfield: 7, deterioration: 8, toss: 'Bat First', t20Par: 150, odiPar: 235, notes: 'Sticky tropical clay slows quickly and creates high spin grip.' },
  { id: 'dhaka', name: 'Sher-e-Bangla Stadium', city: 'Dhaka', country: 'Bangladesh', region: 'Bangladesh', paceCarry: 3, seam: 4, swing: 4, spin: 9, battingEase: 5, outfield: 6, deterioration: 9, toss: 'Bat First', t20Par: 140, odiPar: 220, notes: 'Slow, low, deltaic silt with immediate and increasing spin.' },
  { id: 'barbados', name: 'Kensington Oval', city: 'Bridgetown', country: 'Barbados', region: 'West Indies', paceCarry: 8, seam: 7, swing: 7, spin: 5, battingEase: 7, outfield: 8, deterioration: 6, toss: 'Bowl First', t20Par: 165, odiPar: 260, notes: 'Volcanic clay preserves true pace, carry and cross-wind swing.' },
  { id: 'wellington', name: 'Basin Reserve', city: 'Wellington', country: 'New Zealand', region: 'New Zealand', paceCarry: 7, seam: 7, swing: 9, spin: 4, battingEase: 7, outfield: 7, deterioration: 4, toss: 'Bowl First', t20Par: 165, odiPar: 270, notes: 'Wind, cool mornings and drop-in behavior favor swing early.' },
]

export const weatherProfiles: WeatherProfile[] = [
  { id: 'Sunny', summary: 'True bounce, faster outfield, lower swing and more heat fatigue.', modifiers: { timing: 1.1, boundary: 1.06, spin: 1.05, fatigue: 1.15 } },
  { id: 'Hot', summary: 'Low drag, fast outfield, rapid cracking and heavy fatigue.', modifiers: { boundary: 1.08, six: 1.1, spin: 1.1, fatigue: 1.3 } },
  { id: 'Dry', summary: 'Abrasive surface, better spin grip and earlier reverse swing.', modifiers: { spin: 1.15, swing: 0.92, boundary: 1.03 } },
  { id: 'Humid', summary: 'Persistent conventional swing, slower outfield and harder timing.', modifiers: { swing: 1.15, seam: 1.08, timing: 0.9, boundary: 0.94, spin: 0.85, fatigue: 1.2 } },
  { id: 'Overcast', summary: 'Late swing, active seam, edges and difficult early batting.', modifiers: { swing: 1.3, seam: 1.2, timing: 0.85, edge: 1.25, wicket: 1.08 } },
  { id: 'Rain Threat', summary: 'Moisture under covers, sticky pace and DLS pressure.', modifiers: { swing: 1.2, seam: 1.2, timing: 0.75, boundary: 0.85, wicket: 1.1 } },
  { id: 'Dew', summary: 'Wet ball, reduced spin and swing, quick outfield and harder fielding.', modifiers: { spin: 0.55, swing: 0.65, seam: 0.7, boundary: 1.15, timing: 1.12, fieldingDifficulty: 1.25 } },
  { id: 'Wind', summary: 'Crosswind and headwind change swing, drift and aerial distance.', modifiers: { swing: 1.15, spin: 1.08, six: 1.06 } },
  { id: 'Cold Morning', summary: 'Dense air, surface moisture and strong new-ball movement.', modifiers: { swing: 1.2, seam: 1.25, timing: 0.8, boundary: 0.88, spin: 0.8 } },
  { id: 'Day-Night Evening', summary: 'Twilight swing and seam with difficult timing under lights.', modifiers: { swing: 1.25, seam: 1.2, timing: 0.75, edge: 1.18 } },
]

export const pitchProfiles: PitchProfile[] = [
  { id: 'Green', summary: 'Grass, seam and early edges. Batters should play late.', modifiers: { wicket: 1.25, edge: 1.35, seam: 1.25, swing: 1.12, boundary: 0.8, timing: 0.88 } },
  { id: 'Hard', summary: 'Carry, bounce and true pace. Back-foot batting matters.', modifiers: { pace: 1.15, six: 1.25, boundary: 1.06, timing: 1.04 } },
  { id: 'Flat', summary: 'Predictable bounce and high scoring with little lateral movement.', modifiers: { dot: 0.8, timing: 1.2, boundary: 1.18, wicket: 0.82, seam: 0.85, swing: 0.9 } },
  { id: 'Dry', summary: 'Abrasive, good for spin and reverse swing.', modifiers: { spin: 1.15, lbwBowled: 1.12, boundary: 0.96 } },
  { id: 'Dusty', summary: 'Loose surface, sharp turn and low-bounce dismissals.', modifiers: { wicket: 1.3, spin: 1.4, lbwBowled: 1.25, timing: 0.86, boundary: 0.88 } },
  { id: 'Slow', summary: 'Cutters and patience. Timing suffers and strike rotation matters.', modifiers: { dot: 1.12, single: 1.08, boundary: 0.82, timing: 0.86, pace: 0.9 } },
  { id: 'Low', summary: 'Low carry and stump-to-stump bowling. Horizontal bat shots suffer.', modifiers: { lbwBowled: 1.18, boundary: 0.86, timing: 0.9, pace: 0.88 } },
  { id: 'Cracked', summary: 'Unpredictable bounce and crack targeting.', modifiers: { wicket: 1.22, edge: 1.12, lbwBowled: 1.2, timing: 0.82, boundary: 0.86 } },
  { id: 'Worn', summary: 'Late-match rough, reverse swing and increasing spin.', modifiers: { wicket: 1.25, spin: 1.25, lbwBowled: 1.2, timing: 0.86 } },
  { id: 'Damp', summary: 'Sticky surface and seam/cutter assistance.', modifiers: { seam: 1.15, wicket: 1.08, boundary: 0.8, timing: 0.82 } },
  { id: 'Two-paced', summary: 'Uneven pace, cutter value and risky committed shots.', modifiers: { dot: 1.08, wicket: 1.1, boundary: 0.84, timing: 0.8 } },
]

export const formatScale: Record<MatchFormat, number> = {
  T20: 0.2,
  ODI: 0.5,
  Test: 1,
}

export const parForFormat = (venue: Venue, format: MatchFormat) => {
  if (format === 'T20') return venue.t20Par
  if (format === 'ODI') return venue.odiPar
  return Math.round((venue.odiPar / 50) * 90)
}
