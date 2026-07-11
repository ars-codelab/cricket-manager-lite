<script lang="ts">
  import { onMount } from 'svelte'
  import { parForFormat, pitchProfiles, venues, weatherProfiles } from './lib/data'
  import { simulateInnings } from './lib/simulation'
  import type {
    Aggression,
    BallEvent,
    BatterScore,
    BattingTactics,
    BowlerFigures,
    Difficulty,
    FallOfWicket,
    MatchFormat,
    MatchTime,
    OutfieldCondition,
    Partnership,
    PacePlan,
    PitchType,
    RunningRisk,
    ShotSelection,
    SpinPlan,
    WeatherType,
  } from './lib/types'

  type View = 'home' | 'setup' | 'match' | 'insights'
  type BowlerOverrides = Record<number, string>
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
  let visibleEventCount = 0
  let customOvers = 2
  let lastSimulationKey = ''
  let lastNextBallKey = ''
  let nextBowlerId = ''
  let liveAggression: Aggression = 'Positive'
  let liveShots: ShotSelection = 'Mixed'
  let livePacePlan: PacePlan = 'Play late'
  let liveSpinPlan: SpinPlan = 'Rotate strike'
  let liveRunning: RunningRisk = 'Normal'
  let batterPlans: Record<string, BattingTactics> = {}
  let bowlerOverrides: BowlerOverrides = {}

  $: venue = venues.find((item) => item.id === venueId) ?? venues[0]
  $: result = simulateInnings(venue, format, weather, pitch, { aggression, shots, pacePlan, spinPlan, running }, { matchTime, outfield, difficulty })
  $: if (result.metadata.seed !== lastSimulationKey) {
    lastSimulationKey = result.metadata.seed
    visibleEventCount = 0
    batterPlans = {}
    bowlerOverrides = {}
    lastNextBallKey = ''
  }
  $: par = parForFormat(venue, format)
  $: rawVisibleBalls = result.scorecard.balls.slice(0, visibleEventCount)
  $: visibleBalls = applyBowlerOverrides(rawVisibleBalls)
  $: progress = buildProgress(visibleBalls)
  $: activeBatters = progress.batting.filter((batter) => batter.balls > 0 || batter.dismissal).slice(0, 8)
  $: activeBowlers = progress.bowling.filter((bowler) => bowler.balls > 0 || bowler.wides > 0 || bowler.noBalls > 0)
  $: recentBalls = visibleBalls.slice(-18)
  $: isComplete = visibleEventCount >= result.scorecard.balls.length
  $: nextBall = result.scorecard.balls[visibleEventCount]
  $: currentStriker = result.scorecard.batting.find((batter) => batter.id === nextBall?.strikerId)
  $: currentPartner = result.scorecard.batting.find((batter) => batter.id === nextBall?.nonStrikerId)
  $: currentOverNumber = Math.floor(legalBallCount(rawVisibleBalls) / 6)
  $: nextBallKey = `${lastSimulationKey}-${visibleEventCount}-${nextBall?.strikerId ?? 'complete'}-${nextBall?.bowlerId ?? 'complete'}`
  $: if (nextBallKey !== lastNextBallKey) {
    const storedPlan = nextBall?.strikerId ? batterPlans[nextBall.strikerId] : null
    lastNextBallKey = nextBallKey
    nextBowlerId = bowlerOverrides[currentOverNumber] ?? nextBall?.bowlerId ?? result.scorecard.bowling[0]?.id ?? ''
    liveAggression = storedPlan?.aggression ?? aggression
    liveShots = storedPlan?.shots ?? shots
    livePacePlan = storedPlan?.pacePlan ?? pacePlan
    liveSpinPlan = storedPlan?.spinPlan ?? spinPlan
    liveRunning = storedPlan?.running ?? running
  }
  $: venueSummary = `${venue.city}, ${venue.country} · ${weather} · ${pitch} pitch`

  const bowlingOvers = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`

  const legalBallCount = (balls: BallEvent[]) => balls.filter((ball) => ball.legal).length

  const applyBowlerOverrides = (balls: BallEvent[]) => {
    let legalBalls = 0

    return balls.map((ball) => {
      const overNumber = Math.floor(legalBalls / 6)
      const bowlerId = bowlerOverrides[overNumber] ?? ball.bowlerId
      if (ball.legal) legalBalls += 1
      return bowlerId === ball.bowlerId ? ball : { ...ball, bowlerId }
    })
  }

  const buildProgress = (balls: BallEvent[]) => {
    const batting: BatterScore[] = result.scorecard.batting.map((batter) => ({
      id: batter.id,
      name: batter.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
    }))
    const bowling: BowlerFigures[] = result.scorecard.bowling.map((bowler) => ({
      id: bowler.id,
      name: bowler.name,
      balls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      wides: 0,
      noBalls: 0,
    }))
    const fallOfWickets: FallOfWicket[] = []
    const partnerships: Partnership[] = []
    const extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0, total: 0 }
    const overRuns = new Map<string, number>()
    const overLegalBalls = new Map<string, number>()
    let score = 0
    let wickets = 0
    let legalBalls = 0
    let partnershipStartScore = 0
    let partnershipStartBalls = 0
    let currentPair = ['Batter 1', 'Batter 2']

    for (const ball of balls) {
      const batter = batting.find((item) => item.id === ball.strikerId)
      const bowler = bowling.find((item) => item.id === ball.bowlerId)
      const overNumber = Math.floor(legalBalls / 6)
      const overKey = `${ball.bowlerId}-${overNumber}`

      if (ball.legal) {
        legalBalls += 1
        if (batter) batter.balls += 1
        if (bowler) bowler.balls += 1
        overLegalBalls.set(overKey, (overLegalBalls.get(overKey) ?? 0) + 1)
      }

      if (batter) {
        batter.runs += ball.runsBat
        if (ball.runsBat === 4) batter.fours += 1
        if (ball.runsBat === 6) batter.sixes += 1
      }

      if (ball.extraType === 'wide') extras.wides += ball.runsExtras
      if (ball.extraType === 'no-ball') extras.noBalls += ball.runsExtras
      if (ball.extraType === 'bye') extras.byes += ball.runsExtras
      if (ball.extraType === 'leg-bye') extras.legByes += ball.runsExtras
      extras.total += ball.runsExtras

      if (bowler) {
        const bowlerConceded = ball.runsBat + (ball.extraType === 'wide' || ball.extraType === 'no-ball' ? ball.runsExtras : 0)
        bowler.runs += bowlerConceded
        if (ball.extraType === 'wide') bowler.wides += ball.runsExtras
        if (ball.extraType === 'no-ball') bowler.noBalls += ball.runsExtras
        overRuns.set(overKey, (overRuns.get(overKey) ?? 0) + bowlerConceded)
      }

      score += ball.totalRuns

      if (ball.wicketType && ball.dismissedBatterId) {
        wickets += 1
        const dismissed = batting.find((item) => item.id === ball.dismissedBatterId)
        if (dismissed) {
          dismissed.dismissal = `${ball.wicketType} b ${bowler?.name ?? 'Bowler'}`
          fallOfWickets.push({ wicket: wickets, score, over: ball.over, batter: dismissed.name })
        }
        if (bowler && ball.wicketType !== 'run-out') bowler.wickets += 1
        partnerships.push({
          wicket: wickets,
          runs: score - partnershipStartScore,
          balls: legalBalls - partnershipStartBalls,
          batters: currentPair,
        })
        partnershipStartScore = score
        partnershipStartBalls = legalBalls
        currentPair = [batting.find((item) => item.id === ball.strikerId)?.name ?? 'Batter', batting.find((item) => item.id === ball.nonStrikerId)?.name ?? 'Batter']
      }
    }

    if (balls.length && wickets < 10) {
      partnerships.push({
        wicket: wickets + 1,
        runs: score - partnershipStartScore,
        balls: legalBalls - partnershipStartBalls,
        batters: currentPair,
      })
    }

    for (const bowler of bowling) {
      bowler.maidens = Array.from(overRuns.entries()).filter(
        ([key, runs]) => key.startsWith(`${bowler.id}-`) && runs === 0 && overLegalBalls.get(key) === 6,
      ).length
    }

    return {
      score,
      wickets,
      legalBalls,
      overs: bowlingOvers(legalBalls),
      runRate: legalBalls > 0 ? (score / (legalBalls / 6)).toFixed(2) : '0.00',
      batting,
      bowling,
      extras,
      fallOfWickets,
      partnerships,
    }
  }

  const revealToLegalBalls = (targetLegalBalls: number) => {
    let legalBalls = 0
    const target = Math.max(0, targetLegalBalls)

    for (const [index, ball] of result.scorecard.balls.entries()) {
      if (ball.legal) legalBalls += 1
      if (legalBalls >= target) {
        visibleEventCount = index + 1
        return
      }
    }

    visibleEventCount = result.scorecard.balls.length
  }

  const commitLivePlan = () => {
    if (nextBall?.strikerId) {
      batterPlans = {
        ...batterPlans,
        [nextBall.strikerId]: {
          aggression: liveAggression,
          shots: liveShots,
          pacePlan: livePacePlan,
          spinPlan: liveSpinPlan,
          running: liveRunning,
        },
      }
    }

    if (nextBowlerId) {
      bowlerOverrides = {
        ...bowlerOverrides,
        [currentOverNumber]: nextBowlerId,
      }
    }
  }

  const revealOvers = (overs: number) => {
    commitLivePlan()
    revealToLegalBalls(legalBallCount(visibleBalls) + overs * 6)
  }

  const revealNextWicket = () => {
    commitLivePlan()
    const index = result.scorecard.balls.findIndex((ball, ballIndex) => ballIndex >= visibleEventCount && Boolean(ball.wicketType))
    visibleEventCount = index >= 0 ? index + 1 : result.scorecard.balls.length
  }

  const resetInnings = () => {
    visibleEventCount = 0
    batterPlans = {}
    bowlerOverrides = {}
    lastNextBallKey = ''
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
      <span>{visibleEventCount === 0 ? 'Ready innings' : 'Current innings'}</span>
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

      <div class="sim-controls">
        <button type="button" on:click={() => revealOvers(1)} disabled={isComplete}>+1 over</button>
        <button type="button" on:click={() => revealOvers(5)} disabled={isComplete}>+5 overs</button>
        <button type="button" on:click={() => revealOvers(10)} disabled={isComplete}>+10 overs</button>
        <button type="button" on:click={revealNextWicket} disabled={isComplete}>To wicket</button>
        <button type="button" on:click={() => (visibleEventCount = result.scorecard.balls.length)} disabled={isComplete}>Innings</button>
        <button type="button" on:click={resetInnings} disabled={visibleEventCount === 0}>Reset</button>
      </div>

      <div class="custom-sim">
        <label>
          Custom overs
          <input bind:value={customOvers} min="1" max="30" type="number" />
        </label>
        <button type="button" on:click={() => revealOvers(Number(customOvers) || 1)} disabled={isComplete}>Sim custom</button>
        <span>{visibleEventCount === 0 ? 'Ready to start.' : isComplete ? 'Innings complete.' : `${result.scorecard.balls.length - visibleEventCount} events remaining.`}</span>
      </div>

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
            <p class="muted">Choose the bowler before continuing. This applies to the next over in the visible scorecard.</p>

            <label>
              Bowler
              <select bind:value={nextBowlerId}>
                {#each result.scorecard.bowling as bowler}
                  <option value={bowler.id}>{bowler.name}</option>
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
