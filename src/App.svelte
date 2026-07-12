<script lang="ts">
  import { onMount } from 'svelte'
  import { parForFormat, pitchProfiles, venues, weatherProfiles } from './lib/data'
  import { rosterData } from './lib/rosters'
  import { advanceInnings, chooseAiCaptaincyPlan, createInningsState, defaultBowlerForOver, defaultBowlingTactics, inningsStateToResult, maxBallsPerBowler } from './lib/simulation'
  import type {
    Aggression,
    BattingTactics,
    BowlerFigures,
    BatterScore,
    BowlingLength,
    BowlingLine,
    BowlingTactics,
    Difficulty,
    FieldSetting,
    InningsState,
    MatchFormat,
    MatchTime,
    OutfieldCondition,
    PacePlan,
    PaceBowlingPlan,
    PitchType,
    RunningRisk,
    ShotSelection,
    SimulationResult,
    SpinPlan,
    SpinBowlingPlan,
    VariationUse,
    WeatherType,
  } from './lib/types'

  type View = 'home' | 'setup' | 'match' | 'insights'
  type ControlMode = 'sandbox' | 'one-player'
  type UserSide = 'teamA' | 'teamB'
  type DecisionSheet = 'batter-plan' | 'bowler-spell' | 'auto-sim' | null
  type ScoreTab = 'stream' | 'batting' | 'bowling' | 'fall' | 'conditions'
  type AutoSpeed = 'Instant' | 'Fast' | 'Watch'
  type MatchResultSummary = {
    winner: string
    margin: string
    playerOfTheMatch: string
    playerReason: string
    topBatters: { name: string; detail: string; points: number }[]
    topBowlers: { name: string; detail: string; points: number }[]
  }
  type SavedSetup = {
    format: MatchFormat
    venueId: string
    weather: WeatherType
    pitch: PitchType
    matchTime: MatchTime
    outfield: OutfieldCondition
    difficulty: Difficulty
    aggression: Aggression
    shots: ShotSelection
    pacePlan: PacePlan
    spinPlan: SpinPlan
    running: RunningRisk
    controlMode?: ControlMode
    userSide?: UserSide
    teamAId?: string
    teamBId?: string
    savedAt: string
  }

  const saveKey = 'cricket-manager-lite:last-setup'

  const formats: MatchFormat[] = ['T20', 'ODI', 'Test']
  const matchTimes: MatchTime[] = ['Day', 'Day-Night', 'Night']
  const outfields: OutfieldCondition[] = ['Slow', 'Normal', 'Fast']
  const difficulties: Difficulty[] = ['Casual', 'Standard', 'Expert', 'Simulation']
  const aggressions: Aggression[] = ['Defensive', 'Balanced', 'Positive', 'Aggressive', 'Attack']
  const shotSelections: ShotSelection[] = ['Ground', 'Mixed', 'Aerial']
  const pacePlans: PacePlan[] = ['Play late', 'Front-foot drive', 'Back-foot play', 'Short-ball caution', 'Counterattack']
  const spinPlans: SpinPlan[] = ['Play straight', 'Sweep', 'Use feet', 'Rotate strike', 'Defend']
  const runningRisks: RunningRisk[] = ['Conservative', 'Normal', 'Sharp']
  const bowlingLengths: BowlingLength[] = ['Full', 'Good', 'Short', 'Yorker']
  const bowlingLines: BowlingLine[] = ['Stumps', 'Fourth stump', 'Wide channel']
  const fieldSettings: FieldSetting[] = ['Attacking', 'Balanced', 'Defensive']
  const variationUses: VariationUse[] = ['Stock', 'Mixed', 'Heavy variation']
  const paceBowlingPlans: PaceBowlingPlan[] = ['Hit deck', 'Swing', 'Seam', 'Change-ups']
  const spinBowlingPlans: SpinBowlingPlan[] = ['Attack stumps', 'Defend into pitch', 'Use flight', 'Fire it in']
  const controlModes: ControlMode[] = ['sandbox', 'one-player']
  const userSides: UserSide[] = ['teamA', 'teamB']
  const autoSpeeds: AutoSpeed[] = ['Instant', 'Fast', 'Watch']
  const rosterTeams = rosterData.teams

  let view: View = 'home'
  let format: MatchFormat = 'T20'
  let venueId = 'wankhede'
  let weather: WeatherType = 'Humid'
  let pitch: PitchType = 'Flat'
  let matchTime: MatchTime = 'Day-Night'
  let outfield: OutfieldCondition = 'Normal'
  let difficulty: Difficulty = 'Standard'
  let aggression: Aggression = 'Positive'
  let shots: ShotSelection = 'Mixed'
  let pacePlan: PacePlan = 'Play late'
  let spinPlan: SpinPlan = 'Rotate strike'
  let running: RunningRisk = 'Normal'
  let controlMode: ControlMode = 'sandbox'
  let userSide: UserSide = 'teamA'
  let teamAId = 'ind_int'
  let teamBId = 'aus_int'
  let saveMessage = 'No saved setup loaded.'
  let importInput: HTMLInputElement | null = null
  let customOvers = 2
  let plannedSpellOvers = 2
  let spellBowlerId = ''
  let spellStartBalls = 0
  let streamMode: 'ball' | 'over' = 'ball'
  let scoreTab: ScoreTab = 'stream'
  let autoSpeed: AutoSpeed = 'Fast'
  let activeSheet: DecisionSheet = null
  let lastPromptKey = ''
  let aiNotice = 'Manual controls ready.'
  let lastSimulationKey = ''
  let lastNextBallKey = ''
  let nextBowlerId = ''
  let liveAggression: Aggression = 'Positive'
  let liveShots: ShotSelection = 'Mixed'
  let livePacePlan: PacePlan = 'Play late'
  let liveSpinPlan: SpinPlan = 'Rotate strike'
  let liveRunning: RunningRisk = 'Normal'
  let liveBowlingLength: BowlingLength = defaultBowlingTactics.length
  let liveBowlingLine: BowlingLine = defaultBowlingTactics.line
  let liveField: FieldSetting = defaultBowlingTactics.field
  let liveVariation: VariationUse = defaultBowlingTactics.variation
  let livePaceBowlingPlan: PaceBowlingPlan = defaultBowlingTactics.pacePlan
  let liveSpinBowlingPlan: SpinBowlingPlan = defaultBowlingTactics.spinPlan
  let batterPlans: Record<string, BattingTactics> = {}
  let bowlerPlans: Record<string, BowlingTactics> = {}
  let firstInningsResult: SimulationResult | null = null
  let inningsState: InningsState = createInningsState(
    venues.find((item) => item.id === 'wankhede') ?? venues[0],
    'T20',
    'Humid',
    'Flat',
    { aggression: 'Positive', shots: 'Mixed', pacePlan: 'Play late', spinPlan: 'Rotate strike', running: 'Normal' },
    { matchTime: 'Day-Night', outfield: 'Normal', difficulty: 'Standard' },
  )

  $: venue = venues.find((item) => item.id === venueId) ?? venues[0]
  $: teamA = rosterTeams.find((team) => team.id === teamAId) ?? rosterTeams[0]
  $: teamB = rosterTeams.find((team) => team.id === teamBId) ?? rosterTeams[1] ?? rosterTeams[0]
  $: setupKey = `${venue.id}-${format}-${weather}-${pitch}-${matchTime}-${outfield}-${difficulty}-${aggression}-${shots}-${pacePlan}-${spinPlan}-${running}-${controlMode}-${userSide}-${teamA.id}-${teamB.id}`
  $: if (setupKey !== lastSimulationKey) {
    lastSimulationKey = setupKey
    inningsState = createInningsState(venue, format, weather, pitch, currentBattingTactics(), { matchTime, outfield, difficulty }, { battingTeamId: teamA.id, bowlingTeamId: teamB.id })
    firstInningsResult = null
    batterPlans = {}
    bowlerPlans = {}
    lastNextBallKey = ''
    nextBowlerId = defaultBowlerForOver(inningsState)
    spellBowlerId = nextBowlerId
    spellStartBalls = 0
    plannedSpellOvers = defaultSpellOvers(format)
    activeSheet = null
  }
  $: result = inningsStateToResult(inningsState)
  $: par = parForFormat(venue, format)
  $: progress = {
    score: result.score,
    wickets: result.wickets,
    legalBalls: inningsState.legalBalls,
    overs: result.overs,
    runRate: result.runRate,
    batting: result.scorecard.batting,
    bowling: result.scorecard.bowling,
    extras: result.scorecard.extras,
    fallOfWickets: result.scorecard.fallOfWickets,
    partnerships: result.scorecard.partnerships,
  }
  $: activeBatters = progress.batting.filter((batter) => batter.balls > 0 || batter.dismissal).slice(0, 8)
  $: activeBowlers = progress.bowling.filter((bowler) => bowler.balls > 0 || bowler.wides > 0 || bowler.noBalls > 0)
  $: recentBalls = result.scorecard.balls.slice(-18)
  $: ballStream = recentBalls.slice().reverse()
  $: overStream = buildOverStream(result.scorecard.balls).slice(-6).reverse()
  $: isComplete = inningsState.completed
  $: currentStriker = isComplete ? null : result.scorecard.batting[inningsState.strikerIndex]
  $: currentPartner = isComplete ? null : result.scorecard.batting[inningsState.nonStrikerIndex]
  $: bowlerUsage = buildBowlerUsage(result.scorecard.bowling, inningsState.metadata.format)
  $: if (!isComplete && bowlerUsage[nextBowlerId]?.exhausted) {
    nextBowlerId = defaultBowlerForOver(inningsState)
  }
  $: currentBowler = result.scorecard.bowling.find((bowler) => bowler.id === nextBowlerId) ?? result.scorecard.bowling[0]
  $: currentBowlerUsage = bowlerUsage[currentBowler?.id ?? '']
  $: currentOverNumber = Math.floor(inningsState.legalBalls / 6)
  $: battingSide = inningsState.inningsNumber === 1 ? 'teamA' : 'teamB'
  $: bowlingSide = inningsState.inningsNumber === 1 ? 'teamB' : 'teamA'
  $: userBatting = controlMode === 'sandbox' || battingSide === userSide
  $: userBowling = controlMode === 'sandbox' || bowlingSide === userSide
  $: currentBowlerSpellBalls = currentBowler?.id === spellBowlerId ? Math.max(0, (currentBowler?.balls ?? 0) - spellStartBalls) : 0
  $: currentBowlerSpellOvers = Math.floor(currentBowlerSpellBalls / 6)
  $: spellComplete = currentBowlerSpellOvers >= plannedSpellOvers || Boolean(currentBowlerUsage?.exhausted)
  $: controlLabel = controlMode === 'sandbox' ? 'Sandbox: control both teams' : userSide === 'teamA' ? 'One-player: Team A' : 'One-player: Team B'
  $: inningsLabel = `${ordinal(inningsState.inningsNumber)} innings`
  $: chaseLabel = typeof inningsState.targetScore === 'number' ? `Target ${inningsState.targetScore}` : 'No target'
  $: matchResult = firstInningsResult && isComplete && inningsState.inningsNumber === 2 ? buildMatchResult(firstInningsResult, result) : null
  $: requiredRate =
    typeof inningsState.targetScore === 'number'
      ? (Math.max(inningsState.targetScore - progress.score, 0) / Math.max((inningsState.maxLegalBalls - inningsState.legalBalls) / 6, 0.1)).toFixed(2)
      : null
  $: recentRuns = recentBalls.slice(-12).reduce((total, ball) => total + ball.totalRuns, 0)
  $: recentWickets = recentBalls.slice(-12).filter((ball) => ball.wicketType).length
  $: momentumLabel = recentWickets >= 2 ? 'Bowling pressure' : recentRuns >= 18 ? 'Batters on top' : recentRuns >= 10 ? 'Batting edge' : 'Even contest'
  $: nextBallKey = `${lastSimulationKey}-${progress.legalBalls}-${progress.wickets}-${currentStriker?.id ?? 'complete'}`
  $: if (nextBallKey !== lastNextBallKey) {
    const storedPlan = currentStriker?.id ? batterPlans[currentStriker.id] : null
    const preferredBowlerId = spellBowlerId && !bowlerUsage[spellBowlerId]?.exhausted ? spellBowlerId : defaultBowlerForOver(inningsState)
    const storedBowlingPlan = bowlerPlans[preferredBowlerId]
    lastNextBallKey = nextBallKey
    nextBowlerId = preferredBowlerId
    liveAggression = storedPlan?.aggression ?? aggression
    liveShots = storedPlan?.shots ?? shots
    livePacePlan = storedPlan?.pacePlan ?? pacePlan
    liveSpinPlan = storedPlan?.spinPlan ?? spinPlan
    liveRunning = storedPlan?.running ?? running
    if (storedBowlingPlan) {
      liveBowlingLength = storedBowlingPlan.length
      liveBowlingLine = storedBowlingPlan.line
      liveField = storedBowlingPlan.field
      liveVariation = storedBowlingPlan.variation
      livePaceBowlingPlan = storedBowlingPlan.pacePlan
      liveSpinBowlingPlan = storedBowlingPlan.spinPlan
    }
  }
  $: promptKey = `${lastSimulationKey}-${inningsState.inningsNumber}-${progress.wickets}-${currentOverNumber}-${spellBowlerId}-${spellComplete}-${isComplete}`
  $: if (!isComplete && promptKey !== lastPromptKey) {
    lastPromptKey = promptKey
    const needsBatterPlan = userBatting && (result.scorecard.balls.length === 0 || (progress.wickets > 0 && currentStriker?.balls === 0))
    const needsBowlerPlan = userBowling && (!spellBowlerId || spellComplete || result.scorecard.balls.length === 0)
    if (needsBatterPlan) activeSheet = 'batter-plan'
    else if (needsBowlerPlan) activeSheet = 'bowler-spell'
  }
  $: venueSummary = `${venue.city}, ${venue.country} · ${weather} · ${pitch} pitch`

  const bowlingOvers = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`
  const strikeRate = (batter: BatterScore | null) => (batter && batter.balls > 0 ? ((batter.runs / batter.balls) * 100).toFixed(1) : '0.0')
  const economyRate = (bowler: BowlerFigures | undefined) => (bowler && bowler.balls > 0 ? (bowler.runs / (bowler.balls / 6)).toFixed(2) : '0.00')
  const deliveryLabel = (runs: number) => (runs === 0 ? 'dot' : `${runs}`)
  const fatigueLabel = (fatigue: number) => (fatigue >= 82 ? 'Spent' : fatigue >= 58 ? 'Tiring' : fatigue >= 32 ? 'Warm' : 'Fresh')
  const defaultSpellOvers = (activeFormat: MatchFormat) => (activeFormat === 'T20' ? 2 : activeFormat === 'ODI' ? 4 : 6)
  const sideLabel = (side: UserSide) => (side === 'teamA' ? 'Team A' : 'Team B')

  const buildBowlerUsage = (bowlers: BowlerFigures[], activeFormat: MatchFormat) => {
    const maxBalls = maxBallsPerBowler(activeFormat)

    return Object.fromEntries(
      bowlers.map((bowler) => {
        const fatigue = Number.isFinite(maxBalls) ? Math.min(100, Math.round((bowler.balls / maxBalls) * 100)) : Math.min(100, Math.round((bowler.balls / 72) * 100))
        const remainingBalls = Number.isFinite(maxBalls) ? Math.max(0, maxBalls - bowler.balls) : Number.POSITIVE_INFINITY
        return [
          bowler.id,
          {
            fatigue,
            fatigueLabel: fatigueLabel(fatigue),
            remainingOvers: Number.isFinite(remainingBalls) ? bowlingOvers(remainingBalls) : 'open',
            exhausted: Number.isFinite(maxBalls) && remainingBalls <= 0,
          },
        ]
      }),
    )
  }

  const buildOverStream = (balls: SimulationResult['scorecard']['balls']) => {
    const overs: { over: number; runs: number; wickets: number; balls: string[] }[] = []
    let legalBalls = 0

    for (const ball of balls) {
      const overNumber = Math.floor(legalBalls / 6)
      const over = overs[overNumber] ?? { over: overNumber + 1, runs: 0, wickets: 0, balls: [] }
      over.runs += ball.totalRuns
      if (ball.wicketType) over.wickets += 1
      over.balls.push(ball.wicketType ? 'W' : ball.extraType ? ball.extraType : deliveryLabel(ball.runsBat))
      overs[overNumber] = over
      if (ball.legal) legalBalls += 1
    }

    return overs.filter((over) => over.balls.length)
  }

  const ordinal = (value: number) => {
    if (value === 1) return '1st'
    if (value === 2) return '2nd'
    if (value === 3) return '3rd'
    return `${value}th`
  }

  const currentBattingTactics = (): BattingTactics => ({ aggression, shots, pacePlan, spinPlan, running })

  const batterPoints = (batter: BatterScore) =>
    batter.runs + batter.fours * 1.5 + batter.sixes * 3 + (batter.runs >= 50 ? 8 : 0) + (batter.runs >= 100 ? 12 : 0)

  const bowlerPoints = (bowler: BowlerFigures) =>
    bowler.wickets * 24 + bowler.maidens * 8 - bowler.runs * 0.08 + bowler.balls / 6

  const buildMatchResult = (first: SimulationResult, second: SimulationResult): MatchResultSummary => {
    const target = first.score + 1
    const chasingSideWon = second.score >= target
    const remainingWickets = Math.max(0, 10 - second.wickets)
    const winner = chasingSideWon ? 'Chasing side won' : 'Defending side won'
    const margin = chasingSideWon ? `by ${remainingWickets} wickets` : `by ${target - second.score - 1} runs`
    const battingCandidates = [
      ...first.scorecard.batting.map((batter) => ({
        name: `Defending batter ${batter.name}`,
        detail: `${batter.runs} runs off ${batter.balls} balls`,
        points: batterPoints(batter),
      })),
      ...second.scorecard.batting.map((batter) => ({
        name: `Chasing batter ${batter.name}`,
        detail: `${batter.runs} runs off ${batter.balls} balls`,
        points: batterPoints(batter),
      })),
    ]
    const bowlingCandidates = [
      ...first.scorecard.bowling.map((bowler) => ({
        name: `Defending bowler ${bowler.name}`,
        detail: `${bowler.wickets}/${bowler.runs} in ${bowlingOvers(bowler.balls)} overs`,
        points: bowlerPoints(bowler),
      })),
      ...second.scorecard.bowling.map((bowler) => ({
        name: `Chasing bowler ${bowler.name}`,
        detail: `${bowler.wickets}/${bowler.runs} in ${bowlingOvers(bowler.balls)} overs`,
        points: bowlerPoints(bowler),
      })),
    ]
    const candidates = [...battingCandidates, ...bowlingCandidates]
    const bestPlayer = candidates.reduce((best, current) => (current.points > best.points ? current : best), candidates[0])

    return {
      winner,
      margin,
      playerOfTheMatch: bestPlayer.name,
      playerReason: bestPlayer.detail,
      topBatters: battingCandidates.sort((first, second) => second.points - first.points).slice(0, 3),
      topBowlers: bowlingCandidates.sort((first, second) => second.points - first.points).slice(0, 3),
    }
  }

  const currentLiveBattingTactics = (): BattingTactics => ({
    aggression: liveAggression,
    shots: liveShots,
    pacePlan: livePacePlan,
    spinPlan: liveSpinPlan,
    running: liveRunning,
  })

  const currentLiveBowlingTactics = (): BowlingTactics => ({
    length: liveBowlingLength,
    line: liveBowlingLine,
    field: liveField,
    variation: liveVariation,
    pacePlan: livePaceBowlingPlan,
    spinPlan: liveSpinBowlingPlan,
  })

  const loadBowlerPlan = (bowlerId: string) => {
    const plan = bowlerPlans[bowlerId]
    if (!plan) return
    liveBowlingLength = plan.length
    liveBowlingLine = plan.line
    liveField = plan.field
    liveVariation = plan.variation
    livePaceBowlingPlan = plan.pacePlan
    liveSpinBowlingPlan = plan.spinPlan
  }

  const applyAiPlanToLiveState = () => {
    const plan = chooseAiCaptaincyPlan(inningsState, difficulty)
    nextBowlerId = plan.bowlerId
    plannedSpellOvers = plan.spellOvers
    liveAggression = plan.battingTactics.aggression
    liveShots = plan.battingTactics.shots
    livePacePlan = plan.battingTactics.pacePlan
    liveSpinPlan = plan.battingTactics.spinPlan
    liveRunning = plan.battingTactics.running
    liveBowlingLength = plan.bowlingTactics.length
    liveBowlingLine = plan.bowlingTactics.line
    liveField = plan.bowlingTactics.field
    liveVariation = plan.bowlingTactics.variation
    livePaceBowlingPlan = plan.bowlingTactics.pacePlan
    liveSpinBowlingPlan = plan.bowlingTactics.spinPlan
    aiNotice = plan.reason

    return plan
  }

  const commitLivePlan = () => {
    const plan = currentLiveBattingTactics()
    if (currentStriker?.id) {
      batterPlans = {
        ...batterPlans,
        [currentStriker.id]: plan,
      }
    }

    return plan
  }

  const commitBowlerSpell = () => {
    const selected = result.scorecard.bowling.find((bowler) => bowler.id === nextBowlerId) ?? result.scorecard.bowling[0]
    if (!selected) return
    spellBowlerId = selected.id
    spellStartBalls = selected.balls
    nextBowlerId = selected.id
    bowlerPlans = {
      ...bowlerPlans,
      [selected.id]: currentLiveBowlingTactics(),
    }
    activeSheet = null
  }

  const startMatch = () => {
    resetInnings()
    view = 'match'
    activeSheet = userBatting ? 'batter-plan' : userBowling ? 'bowler-spell' : null
  }

  const exitMatch = () => {
    activeSheet = null
    view = 'setup'
  }

  const advanceSimulation = (mode: 'overs' | 'wicket' | 'innings', overs?: number) => {
    const aiPlan = !userBatting || !userBowling ? applyAiPlanToLiveState() : null
    const battingTactics = userBatting ? commitLivePlan() : (aiPlan?.battingTactics ?? currentLiveBattingTactics())
    const bowlingTactics = userBowling ? currentLiveBowlingTactics() : (aiPlan?.bowlingTactics ?? currentLiveBowlingTactics())
    const bowlerId = userBowling ? nextBowlerId : (aiPlan?.bowlerId ?? nextBowlerId)
    const beforeBowler = result.scorecard.bowling.find((bowler) => bowler.id === bowlerId)
    if (!userBowling && aiPlan) {
      plannedSpellOvers = aiPlan.spellOvers
      spellBowlerId = aiPlan.bowlerId
      spellStartBalls = beforeBowler?.balls ?? 0
    }
    advanceInnings(inningsState, {
      mode,
      overs,
      battingTactics,
      bowlerId,
      bowlingTactics,
    })
    inningsState = inningsState
    const afterBowler = inningsState.scorecard.bowling.find((bowler) => bowler.id === bowlerId)
    if (userBowling && afterBowler && afterBowler.balls - spellStartBalls >= plannedSpellOvers * 6) activeSheet = 'bowler-spell'
  }

  const startNextInnings = () => {
    if (!inningsState.completed || inningsState.inningsNumber >= 2) return

    firstInningsResult = result
    const targetScore = progress.score + 1
    inningsState = createInningsState(
      venue,
      format,
      weather,
      pitch,
      currentBattingTactics(),
      { matchTime, outfield, difficulty },
      { inningsNumber: 2, targetScore, battingTeamId: teamB.id, bowlingTeamId: teamA.id },
    )
    batterPlans = {}
    bowlerPlans = {}
    lastNextBallKey = ''
    nextBowlerId = defaultBowlerForOver(inningsState)
    spellBowlerId = nextBowlerId
    spellStartBalls = 0
    plannedSpellOvers = defaultSpellOvers(format)
    activeSheet = null
  }

  const revealOvers = (overs: number) => {
    advanceSimulation('overs', overs)
  }

  const revealNextWicket = () => {
    advanceSimulation('wicket')
  }

  const resetInnings = () => {
    inningsState = createInningsState(venue, format, weather, pitch, currentBattingTactics(), { matchTime, outfield, difficulty }, { battingTeamId: teamA.id, bowlingTeamId: teamB.id })
    firstInningsResult = null
    batterPlans = {}
    bowlerPlans = {}
    lastNextBallKey = ''
    nextBowlerId = defaultBowlerForOver(inningsState)
    spellBowlerId = nextBowlerId
    spellStartBalls = 0
    plannedSpellOvers = defaultSpellOvers(format)
    activeSheet = null
  }

  const currentSetup = (): SavedSetup => ({
    format,
    venueId,
    weather,
    pitch,
    matchTime,
    outfield,
    difficulty,
    aggression,
    shots,
    pacePlan,
    spinPlan,
    running,
    controlMode,
    userSide,
    teamAId: teamA.id,
    teamBId: teamB.id,
    savedAt: new Date().toISOString(),
  })

  const applySetup = (setup: SavedSetup) => {
    format = setup.format
    venueId = setup.venueId
    weather = setup.weather
    pitch = setup.pitch
    matchTime = setup.matchTime
    outfield = setup.outfield
    difficulty = setup.difficulty
    aggression = setup.aggression
    shots = setup.shots
    pacePlan = setup.pacePlan
    spinPlan = setup.spinPlan
    running = setup.running
    controlMode = setup.controlMode ?? 'sandbox'
    userSide = setup.userSide ?? 'teamA'
    teamAId = setup.teamAId ?? 'ind_int'
    teamBId = setup.teamBId ?? 'aus_int'
  }

  const saveSetup = () => {
    const setup = currentSetup()
    localStorage.setItem(saveKey, JSON.stringify(setup))
    saveMessage = `Saved ${new Date(setup.savedAt).toLocaleString()}.`
  }

  const loadSetup = () => {
    const raw = localStorage.getItem(saveKey)
    if (!raw) {
      saveMessage = 'No saved setup found.'
      return
    }

    try {
      const setup = JSON.parse(raw) as SavedSetup
      applySetup(setup)
      saveMessage = `Loaded setup from ${new Date(setup.savedAt).toLocaleString()}.`
    } catch {
      saveMessage = 'Saved setup is not readable.'
    }
  }

  const exportSetup = () => {
    const blob = new Blob([JSON.stringify(currentSetup(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'cricket-manager-lite-setup.json'
    anchor.click()
    URL.revokeObjectURL(url)
    saveMessage = 'Exported setup JSON.'
  }

  const importSetup = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    try {
      const setup = JSON.parse(await file.text()) as SavedSetup
      applySetup(setup)
      localStorage.setItem(saveKey, JSON.stringify({ ...setup, savedAt: new Date().toISOString() }))
      saveMessage = `Imported ${file.name}.`
    } catch {
      saveMessage = 'Import failed. Use a Cricket Manager Lite setup JSON file.'
    } finally {
      input.value = ''
    }
  }

  onMount(() => {
    if (localStorage.getItem(saveKey)) {
      loadSetup()
    }
  })

  const applyPreset = (preset: 'mumbai-chase' | 'lords-seamer' | 'chepauk-day-five') => {
    if (preset === 'mumbai-chase') {
      format = 'T20'
      venueId = 'wankhede'
      weather = 'Dew'
      pitch = 'Flat'
      matchTime = 'Day-Night'
      outfield = 'Fast'
      aggression = 'Aggressive'
      shots = 'Mixed'
      pacePlan = 'Front-foot drive'
      spinPlan = 'Rotate strike'
      running = 'Sharp'
    }

    if (preset === 'lords-seamer') {
      format = 'Test'
      venueId = 'lords'
      weather = 'Overcast'
      pitch = 'Green'
      matchTime = 'Day'
      outfield = 'Slow'
      aggression = 'Defensive'
      shots = 'Ground'
      pacePlan = 'Play late'
      spinPlan = 'Defend'
      running = 'Conservative'
    }

    if (preset === 'chepauk-day-five') {
      format = 'Test'
      venueId = 'chepauk'
      weather = 'Dry'
      pitch = 'Worn'
      matchTime = 'Day'
      outfield = 'Normal'
      aggression = 'Balanced'
      shots = 'Ground'
      pacePlan = 'Short-ball caution'
      spinPlan = 'Sweep'
      running = 'Normal'
    }

    view = 'match'
    activeSheet = userBatting ? 'batter-plan' : userBowling ? 'bowler-spell' : null
  }
</script>

<main class="app-shell">
  {#if view !== 'match'}
    <section class="hero-panel">
      <div>
        <p class="eyebrow">Cricket Manager Lite</p>
        <h1>Captain the conditions, not just the scoreboard.</h1>
        <p class="hero-copy">{venueSummary}</p>
      </div>
      <div class="score-tile">
        <span>{result.scorecard.balls.length === 0 ? 'Ready innings' : 'Current innings'}</span>
        <strong>{progress.score}/{progress.wickets}</strong>
        <small>{progress.overs} overs · RR {progress.runRate} · par {par}</small>
      </div>
    </section>

    <nav class="bottom-nav" aria-label="Primary sections">
      <button class:active={view === 'home'} type="button" on:click={() => (view = 'home')}>Home</button>
      <button class:active={view === 'setup'} type="button" on:click={() => (view = 'setup')}>Setup</button>
      <button type="button" on:click={() => (view = 'match')}>Match</button>
      <button class:active={view === 'insights'} type="button" on:click={() => (view = 'insights')}>Insights</button>
    </nav>
  {/if}

  {#if view === 'home'}
    <section class="home-grid">
      <article class="feature-card primary">
        <p class="eyebrow">First playable</p>
        <h2>Custom match simulator</h2>
        <p>
          Pick a ground, shape the weather and surface, set batting intent, then watch a deterministic ball-by-ball innings unfold.
        </p>
        <button type="button" on:click={() => (view = 'setup')}>Build custom match</button>
      </article>

      <article class="feature-card">
        <h2>Resume saved setup</h2>
        <p>{saveMessage}</p>
        <button type="button" on:click={loadSetup}>Load setup</button>
      </article>

      <article class="feature-card">
        <h2>Mumbai dew chase</h2>
        <p>Fast outfield, heavy dew, batting-friendly Wankhede night scenario.</p>
        <button type="button" on:click={() => applyPreset('mumbai-chase')}>Play preset</button>
      </article>

      <article class="feature-card">
        <h2>Lord's seamer</h2>
        <p>Overcast green-top where survival matters more than boundaries.</p>
        <button type="button" on:click={() => applyPreset('lords-seamer')}>Play preset</button>
      </article>

    </section>
  {/if}

  {#if view === 'setup'}
    <section class="workspace">
      <div class="control-panel">
        <div class="panel-heading">
          <span>Match Setup</span>
          <strong>{format} par {par}</strong>
        </div>

        <label>
          Format
          <select bind:value={format}>
            {#each formats as item}
              <option value={item}>{item}</option>
            {/each}
          </select>
        </label>

        <label>
          Venue
          <select bind:value={venueId}>
            {#each venues as item}
              <option value={item.id}>{item.city} · {item.name}</option>
            {/each}
          </select>
        </label>

        <label>
          Weather
          <select bind:value={weather}>
            {#each weatherProfiles as item}
              <option value={item.id}>{item.id}</option>
            {/each}
          </select>
        </label>

        <label>
          Pitch
          <select bind:value={pitch}>
            {#each pitchProfiles as item}
              <option value={item.id}>{item.id}</option>
            {/each}
          </select>
        </label>

        <label>
          Match time
          <select bind:value={matchTime}>
            {#each matchTimes as item}
              <option value={item}>{item}</option>
            {/each}
          </select>
        </label>

        <label>
          Outfield
          <select bind:value={outfield}>
            {#each outfields as item}
              <option value={item}>{item}</option>
            {/each}
          </select>
        </label>

        <label>
          Difficulty
          <select bind:value={difficulty}>
            {#each difficulties as item}
              <option value={item}>{item}</option>
            {/each}
          </select>
        </label>

        <label>
          Team A bats first
          <select bind:value={teamAId}>
            {#each rosterTeams as team}
              <option value={team.id}>{team.abbreviation} · {team.name}</option>
            {/each}
          </select>
        </label>

        <label>
          Team B chases
          <select bind:value={teamBId}>
            {#each rosterTeams as team}
              <option value={team.id}>{team.abbreviation} · {team.name}</option>
            {/each}
          </select>
        </label>

        <label>
          Control mode
          <select bind:value={controlMode}>
            {#each controlModes as item}
              <option value={item}>{item === 'sandbox' ? 'Sandbox: control both teams' : 'One-player: control one team'}</option>
            {/each}
          </select>
        </label>

        {#if controlMode === 'one-player'}
          <label>
            Your side
            <select bind:value={userSide}>
              {#each userSides as item}
                <option value={item}>{sideLabel(item)} {item === 'teamA' ? '(bats first)' : '(chases)'}</option>
              {/each}
            </select>
          </label>
        {/if}

        <div class="venue-grid" aria-label="Venue ratings">
          <span>Pace <b>{venue.paceCarry}</b></span>
          <span>Seam <b>{venue.seam}</b></span>
          <span>Swing <b>{venue.swing}</b></span>
          <span>Spin <b>{venue.spin}</b></span>
          <span>Batting <b>{venue.battingEase}</b></span>
          <span>Wear <b>{venue.deterioration}</b></span>
        </div>
      </div>

      <div class="control-panel tactics">
        <div class="panel-heading">
          <span>Batting Tactics</span>
          <strong>{aggression}</strong>
        </div>

        <label>
          Aggression
          <select bind:value={aggression}>
            {#each aggressions as item}
              <option value={item}>{item}</option>
            {/each}
          </select>
        </label>

        <label>
          Shot selection
          <select bind:value={shots}>
            {#each shotSelections as item}
              <option value={item}>{item}</option>
            {/each}
          </select>
        </label>

        <label>
          Pace plan
          <select bind:value={pacePlan}>
            {#each pacePlans as item}
              <option value={item}>{item}</option>
            {/each}
          </select>
        </label>

        <label>
          Spin plan
          <select bind:value={spinPlan}>
            {#each spinPlans as item}
              <option value={item}>{item}</option>
            {/each}
          </select>
        </label>

        <label>
          Running
          <select bind:value={running}>
            {#each runningRisks as item}
              <option value={item}>{item}</option>
            {/each}
          </select>
        </label>

        <button class="wide-action" type="button" on:click={startMatch}>Start match</button>
        <div class="save-actions">
          <button type="button" on:click={saveSetup}>Save</button>
          <button type="button" on:click={loadSetup}>Load</button>
          <button type="button" on:click={exportSetup}>Export</button>
          <button type="button" on:click={() => importInput?.click()}>Import</button>
        </div>
        <p class="save-message">{saveMessage}</p>
        <input bind:this={importInput} class="hidden-input" type="file" accept="application/json,.json" on:change={importSetup} />
      </div>
    </section>
  {/if}

  {#if view === 'match'}
    <section class="scorecard-panel match-stage">
      <div class="cockpit-header">
        <button class="exit-match" type="button" on:click={exitMatch}>Exit</button>
        <div>
          <span>{inningsLabel} · {inningsState.inningsNumber === 1 ? teamA.abbreviation : teamB.abbreviation} batting</span>
          <strong>{progress.score}/{progress.wickets}</strong>
          <small>{progress.overs} ov · RR {progress.runRate}{requiredRate ? ` · Req ${requiredRate}` : ''} · {controlLabel}</small>
        </div>
        <div>
          <span>{typeof inningsState.targetScore === 'number' ? chaseLabel : `${format} par ${par}`}</span>
          <strong>{venue.city}</strong>
          <small>{teamA.abbreviation} v {teamB.abbreviation} · {weather} · {pitch}</small>
        </div>
      </div>

      <div class="cockpit-actions">
        <button class="primary-action" type="button" on:click={() => revealOvers(1)} disabled={isComplete}>Play over</button>
        <button type="button" on:click={() => (activeSheet = 'auto-sim')} disabled={isComplete}>Auto</button>
        <button type="button" on:click={revealNextWicket} disabled={isComplete}>Wicket</button>
        <button type="button" on:click={() => revealOvers(Number(customOvers) || 1)} disabled={isComplete}>Custom</button>
      </div>

      {#if isComplete && inningsState.inningsNumber === 1}
        <section class="innings-break-panel">
          <div>
            <span>Innings break</span>
            <strong>Target {progress.score + 1}</strong>
            <small>First innings closed at {progress.score}/{progress.wickets} in {progress.overs}.</small>
          </div>
          <button type="button" on:click={startNextInnings}>Start chase</button>
        </section>
      {/if}

      {#if isComplete && inningsState.inningsNumber === 2 && matchResult}
        <section class="game-over-panel">
          <div class="result-banner">
            <span>Game over</span>
            <strong>{matchResult.winner} {matchResult.margin}</strong>
            <small>1st innings {firstInningsResult?.score}/{firstInningsResult?.wickets} · 2nd innings {progress.score}/{progress.wickets}</small>
          </div>

          <div class="result-grid">
            <article>
              <span>Player of the match</span>
              <strong>{matchResult.playerOfTheMatch}</strong>
              <small>{matchResult.playerReason}</small>
            </article>
            <article>
              <span>Top batters</span>
              {#each matchResult.topBatters as player}
                <small><b>{player.name}</b> · {player.detail}</small>
              {/each}
            </article>
            <article>
              <span>Top bowlers</span>
              {#each matchResult.topBowlers as player}
                <small><b>{player.name}</b> · {player.detail}</small>
              {/each}
            </article>
          </div>
          <button type="button" on:click={resetInnings}>New match</button>
        </section>
      {/if}

      <div class="match-dashboard">
        <button class="matchup-card striker" type="button" on:click={() => (activeSheet = userBatting && !isComplete ? 'batter-plan' : activeSheet)}>
          <span>On strike</span>
          <strong>{currentStriker?.name ?? 'Innings complete'}</strong>
          <div class="stat-line">
            <b>{currentStriker?.runs ?? 0}</b>
            <small>{currentStriker?.balls ?? 0} balls · SR {strikeRate(currentStriker)}</small>
          </div>
          <small>{currentPartner?.name ? `Partner ${currentPartner.name} ${currentPartner.runs} (${currentPartner.balls})` : 'No partner'}{userBatting && !isComplete ? ' · tap to edit' : ''}</small>
        </button>

        <button class="matchup-card bowler" type="button" on:click={() => (activeSheet = userBowling && !isComplete ? 'bowler-spell' : activeSheet)}>
          <span>With the ball</span>
          <strong>{currentBowler?.name ?? 'Bowler'}</strong>
          <div class="stat-line">
            <b>{currentBowler?.wickets ?? 0}/{currentBowler?.runs ?? 0}</b>
            <small>{bowlingOvers(currentBowler?.balls ?? 0)} ov · Econ {economyRate(currentBowler)}</small>
          </div>
          <small>
            {liveBowlingLength} · {liveBowlingLine} · {liveField}
            {#if currentBowlerUsage}
              · spell {currentBowlerSpellOvers}/{plannedSpellOvers} · Fatigue {currentBowlerUsage.fatigue}% · {currentBowlerUsage.remainingOvers} left
            {/if}
          </small>
          {#if currentBowlerUsage}
            <div class="fatigue-meter" aria-label={`Fatigue ${currentBowlerUsage.fatigue}%`}>
              <span style={`width: ${currentBowlerUsage.fatigue}%`}></span>
            </div>
          {/if}
        </button>
      </div>

      <div class="match-context-strip">
        <span>{userBatting ? 'You control batting' : 'AI controls batting'}</span>
        <span>{userBowling ? 'You control bowling' : 'AI controls bowling'}</span>
        <span>{aiNotice}</span>
      </div>

      <div class="score-tabs" aria-label="Scorecard tabs">
        <button class:active={scoreTab === 'stream'} type="button" on:click={() => (scoreTab = 'stream')}>Stream</button>
        <button class:active={scoreTab === 'batting'} type="button" on:click={() => (scoreTab = 'batting')}>Batting</button>
        <button class:active={scoreTab === 'bowling'} type="button" on:click={() => (scoreTab = 'bowling')}>Bowling</button>
        <button class:active={scoreTab === 'fall'} type="button" on:click={() => (scoreTab = 'fall')}>FOW</button>
        <button class:active={scoreTab === 'conditions'} type="button" on:click={() => (scoreTab = 'conditions')}>Read</button>
      </div>

      {#if scoreTab === 'stream'}
      <article class="game-stream">
        <div class="stream-heading">
          <div>
            <span>Live stream</span>
            <strong>{streamMode === 'ball' ? 'Ball by ball' : 'Over by over'}</strong>
          </div>
          <div class="stream-toggle" aria-label="Stream mode">
            <button class:active={streamMode === 'ball'} type="button" on:click={() => (streamMode = 'ball')}>Ball</button>
            <button class:active={streamMode === 'over'} type="button" on:click={() => (streamMode = 'over')}>Over</button>
          </div>
        </div>

        {#if streamMode === 'ball'}
          <div class="stream-list">
            {#if ballStream.length}
              {#each ballStream as ball}
                <div class:wicket-row={Boolean(ball.wicketType)} class:boundary-row={ball.runsBat === 4 || ball.runsBat === 6} class="stream-row">
                  <b>{ball.over}</b>
                  <span>{ball.wicketType ? 'Wicket' : ball.extraType ? ball.extraType : deliveryLabel(ball.runsBat)}</span>
                  <small>{ball.commentary}</small>
                </div>
              {/each}
            {:else}
              <p class="muted">Awaiting first ball.</p>
            {/if}
          </div>
        {:else}
          <div class="stream-list">
            {#if overStream.length}
              {#each overStream as over}
                <div class:wicket-row={over.wickets > 0} class:boundary-row={over.runs >= 10} class="stream-row over-row">
                  <b>Over {over.over}</b>
                  <span>{over.runs}/{over.wickets}</span>
                  <small>{over.balls.join(' · ')}</small>
                </div>
              {/each}
            {:else}
              <p class="muted">Awaiting first over.</p>
            {/if}
          </div>
        {/if}
      </article>
      {/if}

      {#if scoreTab === 'batting' || scoreTab === 'bowling'}
      <div class="scorecard-grid">
        {#if scoreTab === 'batting'}
        <article>
          <h2>Batting</h2>
          <div class="table-list">
            {#each activeBatters as batter}
              <div class="table-row">
                <span>
                  <b>{batter.name}</b>
                  <small>{batter.dismissal ?? 'not out'}</small>
                </span>
                <strong>{batter.runs} ({batter.balls})</strong>
              </div>
            {/each}
          </div>
        </article>
        {/if}

        {#if scoreTab === 'bowling'}
        <article>
          <h2>Bowling</h2>
          <div class="table-list">
            {#each activeBowlers as bowler}
              <div class="table-row">
                <span>
                  <b>{bowler.name}</b>
                  <small>{bowlingOvers(bowler.balls)} ov · {bowler.wides}w {bowler.noBalls}nb</small>
                </span>
                <strong>{bowler.wickets}/{bowler.runs}</strong>
              </div>
            {/each}
          </div>
        </article>
        {/if}
      </div>
      {/if}

      {#if scoreTab === 'fall'}
      <div class="scorecard-grid compact">
        <article>
          <h2>Extras</h2>
          <p>
            {progress.extras.total}
            <span class="muted">
              wides {progress.extras.wides}, no-balls {progress.extras.noBalls}, byes {progress.extras.byes}, leg-byes {progress.extras.legByes}
            </span>
          </p>
        </article>

        <article>
          <h2>Fall / Partnerships</h2>
          <p>
            {#if progress.fallOfWickets.length}
              {progress.fallOfWickets.map((item) => `${item.score}/${item.wicket} (${item.batter}, ${item.over})`).join(' · ')}
            {:else}
              No wickets lost.
            {/if}
          </p>
          <p class="muted">
            {progress.partnerships.slice(-3).map((item) => `${item.runs} off ${item.balls}`).join(' · ')}
          </p>
        </article>
      </div>
      {/if}

      {#if scoreTab === 'conditions'}
      <article class="ball-log">
        <h2>Conditions And Tactical Read</h2>
        {#each result.conditionReadout as line}
          <p>{line}</p>
        {/each}
        {#each result.log.slice(0, 4) as line}
          <p class="muted">{line}</p>
        {/each}
      </article>
      {/if}

      {#if activeSheet && !isComplete}
        <div class="sheet-backdrop" role="presentation" on:click={() => (activeSheet = null)}></div>
        <section class="decision-sheet" aria-label="Match decision sheet">
          <div class="sheet-heading">
            <div>
              <span>{activeSheet === 'batter-plan' ? 'Batter plan' : activeSheet === 'bowler-spell' ? 'Bowler spell' : 'Auto simulate'}</span>
              <strong>{activeSheet === 'batter-plan' ? currentStriker?.name : activeSheet === 'bowler-spell' ? `Over ${currentOverNumber + 1}` : 'System captaincy'}</strong>
            </div>
            <button type="button" on:click={() => (activeSheet = null)}>Close</button>
          </div>

          {#if activeSheet === 'batter-plan'}
            <p class="muted">Set the striker plan. New batters open here automatically; tap a batter card later to change it.</p>
            <label>
              Batter intent
              <select bind:value={liveAggression}>
                {#each aggressions as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <label>
              Shot selection
              <select bind:value={liveShots}>
                {#each shotSelections as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <label>
              Pace plan
              <select bind:value={livePacePlan}>
                {#each pacePlans as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <label>
              Spin plan
              <select bind:value={liveSpinPlan}>
                {#each spinPlans as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <label>
              Running
              <select bind:value={liveRunning}>
                {#each runningRisks as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <button class="wide-action" type="button" on:click={() => { commitLivePlan(); activeSheet = userBowling && result.scorecard.balls.length === 0 ? 'bowler-spell' : null }}>Apply batter plan</button>
          {/if}

          {#if activeSheet === 'bowler-spell'}
            <p class="muted">Pick the next bowler and spell target. A spell means this bowler's next planned overs, not consecutive overs.</p>
            <label>
              Bowler
              <select bind:value={nextBowlerId} on:change={() => loadBowlerPlan(nextBowlerId)}>
                {#each result.scorecard.bowling as bowler}
                  <option value={bowler.id} disabled={bowlerUsage[bowler.id]?.exhausted}>
                    {bowler.name} · {bowlingOvers(bowler.balls)} ov · {bowlerUsage[bowler.id]?.remainingOvers ?? 'open'} left · {bowlerUsage[bowler.id]?.fatigueLabel ?? 'Fresh'}
                  </option>
                {/each}
              </select>
            </label>
            <label>
              Spell overs
              <input bind:value={plannedSpellOvers} min="1" max={format === 'T20' ? 4 : format === 'ODI' ? 10 : 12} type="number" />
            </label>
            <label>
              Length
              <select bind:value={liveBowlingLength}>
                {#each bowlingLengths as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <label>
              Line
              <select bind:value={liveBowlingLine}>
                {#each bowlingLines as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <label>
              Field
              <select bind:value={liveField}>
                {#each fieldSettings as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <label>
              Variation
              <select bind:value={liveVariation}>
                {#each variationUses as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <label>
              Pace plan
              <select bind:value={livePaceBowlingPlan}>
                {#each paceBowlingPlans as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <label>
              Spin plan
              <select bind:value={liveSpinBowlingPlan}>
                {#each spinBowlingPlans as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <button class="wide-action" type="button" on:click={commitBowlerSpell}>Start spell</button>
          {/if}

          {#if activeSheet === 'auto-sim'}
            <p class="muted">Let the system pick condition-aware options. In one-player mode, AI controls only opponent decisions unless your side is not involved in the current skill.</p>
            <label>
              Speed
              <select bind:value={autoSpeed}>
                {#each autoSpeeds as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </label>
            <label>
              Custom overs
              <input bind:value={customOvers} min="1" max="30" type="number" />
            </label>
            <div class="sheet-actions">
              <button type="button" on:click={() => { revealOvers(5); activeSheet = null }}>5 overs</button>
              <button type="button" on:click={() => { revealOvers(Number(customOvers) || 1); activeSheet = null }}>Custom</button>
              <button type="button" on:click={() => { advanceSimulation('innings'); activeSheet = null }}>Innings</button>
            </div>
          {/if}
        </section>
      {/if}
    </section>
  {/if}

  {#if view === 'insights'}
    <section class="insight-grid">
      <article>
        <h2>Condition Read</h2>
        {#each result.conditionReadout as line}
          <p>{line}</p>
        {/each}
        <p class="note">{venue.notes}</p>
      </article>

      <article>
        <h2>Tactical Read</h2>
        {#each result.tacticalReadout as line}
          <p>{line}</p>
        {/each}
        {#each result.log as line}
          <p>{line}</p>
        {/each}
      </article>
    </section>

    {#if format === 'Test'}
      <section class="forecast">
        <div class="panel-heading">
          <span>Five-Day Test Surface</span>
          <strong>{venue.region}</strong>
        </div>
        <div class="day-strip">
          {#each result.forecast as day}
            <article>
              <span>Day {day.day}</span>
              <strong>{day.label}</strong>
              <small>Bat {day.battingEase.toFixed(1)} · Seam {day.seam.toFixed(1)} · Spin {day.spin.toFixed(1)} · Uneven {day.unevenBounce.toFixed(1)}</small>
            </article>
          {/each}
        </div>
      </section>
    {/if}
  {/if}
</main>
