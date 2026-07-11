<script lang="ts">
  import { onMount } from 'svelte'
  import { parForFormat, pitchProfiles, venues, weatherProfiles } from './lib/data'
  import { advanceInnings, createInningsState, defaultBowlerForOver, defaultBowlingTactics, inningsStateToResult } from './lib/simulation'
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
  type MatchResultSummary = {
    winner: string
    margin: string
    playerOfTheMatch: string
    playerReason: string
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
  let saveMessage = 'No saved setup loaded.'
  let importInput: HTMLInputElement | null = null
  let customOvers = 2
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
  $: setupKey = `${venue.id}-${format}-${weather}-${pitch}-${matchTime}-${outfield}-${difficulty}-${aggression}-${shots}-${pacePlan}-${spinPlan}-${running}`
  $: if (setupKey !== lastSimulationKey) {
    lastSimulationKey = setupKey
    inningsState = createInningsState(venue, format, weather, pitch, currentBattingTactics(), { matchTime, outfield, difficulty })
    firstInningsResult = null
    batterPlans = {}
    lastNextBallKey = ''
    nextBowlerId = defaultBowlerForOver(inningsState)
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
  $: isComplete = inningsState.completed
  $: currentStriker = isComplete ? null : result.scorecard.batting[inningsState.strikerIndex]
  $: currentPartner = isComplete ? null : result.scorecard.batting[inningsState.nonStrikerIndex]
  $: currentOverNumber = Math.floor(inningsState.legalBalls / 6)
  $: inningsLabel = `${ordinal(inningsState.inningsNumber)} innings`
  $: chaseLabel = typeof inningsState.targetScore === 'number' ? `Target ${inningsState.targetScore}` : 'No target'
  $: matchResult = firstInningsResult && isComplete && inningsState.inningsNumber === 2 ? buildMatchResult(firstInningsResult, result) : null
  $: nextBallKey = `${lastSimulationKey}-${progress.legalBalls}-${progress.wickets}-${currentStriker?.id ?? 'complete'}`
  $: if (nextBallKey !== lastNextBallKey) {
    const storedPlan = currentStriker?.id ? batterPlans[currentStriker.id] : null
    lastNextBallKey = nextBallKey
    nextBowlerId = defaultBowlerForOver(inningsState)
    liveAggression = storedPlan?.aggression ?? aggression
    liveShots = storedPlan?.shots ?? shots
    livePacePlan = storedPlan?.pacePlan ?? pacePlan
    liveSpinPlan = storedPlan?.spinPlan ?? spinPlan
    liveRunning = storedPlan?.running ?? running
  }
  $: venueSummary = `${venue.city}, ${venue.country} · ${weather} · ${pitch} pitch`

  const bowlingOvers = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`

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
    const candidates = [
      ...first.scorecard.batting.map((batter) => ({
        name: `Defending batter ${batter.name}`,
        reason: `${batter.runs} runs off ${batter.balls} balls`,
        points: batterPoints(batter),
      })),
      ...first.scorecard.bowling.map((bowler) => ({
        name: `Defending bowler ${bowler.name}`,
        reason: `${bowler.wickets}/${bowler.runs} in ${bowlingOvers(bowler.balls)} overs`,
        points: bowlerPoints(bowler),
      })),
      ...second.scorecard.batting.map((batter) => ({
        name: `Chasing batter ${batter.name}`,
        reason: `${batter.runs} runs off ${batter.balls} balls`,
        points: batterPoints(batter),
      })),
      ...second.scorecard.bowling.map((bowler) => ({
        name: `Chasing bowler ${bowler.name}`,
        reason: `${bowler.wickets}/${bowler.runs} in ${bowlingOvers(bowler.balls)} overs`,
        points: bowlerPoints(bowler),
      })),
    ]
    const bestPlayer = candidates.reduce((best, current) => (current.points > best.points ? current : best), candidates[0])

    return {
      winner,
      margin,
      playerOfTheMatch: bestPlayer.name,
      playerReason: bestPlayer.reason,
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

  const advanceSimulation = (mode: 'overs' | 'wicket' | 'innings', overs?: number) => {
    const battingTactics = commitLivePlan()
    advanceInnings(inningsState, {
      mode,
      overs,
      battingTactics,
      bowlerId: nextBowlerId,
      bowlingTactics: currentLiveBowlingTactics(),
    })
    inningsState = inningsState
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
      { inningsNumber: 2, targetScore },
    )
    batterPlans = {}
    lastNextBallKey = ''
    nextBowlerId = defaultBowlerForOver(inningsState)
  }

  const revealOvers = (overs: number) => {
    advanceSimulation('overs', overs)
  }

  const revealNextWicket = () => {
    advanceSimulation('wicket')
  }

  const resetInnings = () => {
    inningsState = createInningsState(venue, format, weather, pitch, currentBattingTactics(), { matchTime, outfield, difficulty })
    firstInningsResult = null
    batterPlans = {}
    lastNextBallKey = ''
    nextBowlerId = defaultBowlerForOver(inningsState)
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
  }
</script>

<main class="app-shell">
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
    <button class:active={view === 'match'} type="button" on:click={() => (view = 'match')}>Match</button>
    <button class:active={view === 'insights'} type="button" on:click={() => (view = 'insights')}>Insights</button>
  </nav>

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

        <button class="wide-action" type="button" on:click={() => { resetInnings(); view = 'match' }}>Start match</button>
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
    <section class="scorecard-panel">
      <div class="panel-heading">
        <span>Match Centre</span>
        <strong>{progress.score}/{progress.wickets} in {progress.overs}</strong>
      </div>
      <p class="muted">{inningsLabel}{typeof inningsState.targetScore === 'number' ? ` · ${chaseLabel}` : ''}</p>

      <div class="sim-controls">
        <button type="button" on:click={() => revealOvers(1)} disabled={isComplete}>+1 over</button>
        <button type="button" on:click={() => revealOvers(5)} disabled={isComplete}>+5 overs</button>
        <button type="button" on:click={() => revealOvers(10)} disabled={isComplete}>+10 overs</button>
        <button type="button" on:click={revealNextWicket} disabled={isComplete}>To wicket</button>
        <button type="button" on:click={() => advanceSimulation('innings')} disabled={isComplete}>Innings</button>
        <button type="button" on:click={resetInnings} disabled={result.scorecard.balls.length === 0}>Reset</button>
      </div>

      <div class="custom-sim">
        <label>
          Custom overs
          <input bind:value={customOvers} min="1" max="30" type="number" />
        </label>
        <button type="button" on:click={() => revealOvers(Number(customOvers) || 1)} disabled={isComplete}>Sim custom</button>
        <span>{result.scorecard.balls.length === 0 ? 'Ready to start.' : isComplete ? 'Innings complete.' : `${result.scorecard.balls.length} events simulated.`}</span>
      </div>

      {#if isComplete && inningsState.inningsNumber === 1}
        <div class="custom-sim">
          <span>First innings done. Start the chase at {progress.score + 1}.</span>
          <button type="button" on:click={startNextInnings}>Start next innings</button>
        </div>
      {/if}

      {#if isComplete && inningsState.inningsNumber === 2 && matchResult}
        <div class="custom-sim">
          <span>
            {matchResult.winner} {matchResult.margin}. 1st innings {firstInningsResult?.score}/{firstInningsResult?.wickets}, 2nd innings {progress.score}/{progress.wickets}.
          </span>
        </div>
        <div class="custom-sim">
          <span>Player of the match: {matchResult.playerOfTheMatch} for {matchResult.playerReason}.</span>
          <button type="button" on:click={resetInnings}>New match</button>
        </div>
      {/if}

      {#if !isComplete}
        <div class="live-plan">
          <article>
            <div class="panel-heading">
              <span>Current Batters</span>
              <strong>{currentStriker?.name ?? 'Innings complete'}</strong>
            </div>
            <p class="muted">Partner: {currentPartner?.name ?? 'none'} · plans are saved per striker before each advance.</p>

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
          </article>

          <article>
            <div class="panel-heading">
              <span>Next Over</span>
              <strong>Over {currentOverNumber + 1}</strong>
            </div>
            <p class="muted">Choose the bowler and plan before continuing. These decisions feed the next simulated deliveries.</p>

            <label>
              Bowler
              <select bind:value={nextBowlerId}>
                {#each result.scorecard.bowling as bowler}
                  <option value={bowler.id}>{bowler.name}</option>
                {/each}
              </select>
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

            <button class="wide-action" type="button" on:click={commitLivePlan}>Apply live plan</button>
          </article>
        </div>
      {/if}

      <div class="scorecard-grid">
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
      </div>

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

      <article class="ball-log">
        <h2>Recent Ball Log</h2>
        <div class="ball-strip">
          {#each recentBalls as ball}
            <span class:wicket={Boolean(ball.wicketType)} class:boundary={ball.runsBat === 4 || ball.runsBat === 6}>
              <b>{ball.over}</b>
              {ball.wicketType ? 'W' : ball.extraType ? ball.extraType : ball.runsBat}
            </span>
          {/each}
        </div>
      </article>
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
