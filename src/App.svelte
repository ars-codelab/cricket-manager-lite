<script lang="ts">
  import { parForFormat, pitchProfiles, venues, weatherProfiles } from './lib/data'
  import { simulateInnings } from './lib/simulation'
  import type {
    Aggression,
    Difficulty,
    MatchFormat,
    MatchTime,
    OutfieldCondition,
    PacePlan,
    PitchType,
    RunningRisk,
    ShotSelection,
    SpinPlan,
    WeatherType,
  } from './lib/types'

  const formats: MatchFormat[] = ['T20', 'ODI', 'Test']
  const matchTimes: MatchTime[] = ['Day', 'Day-Night', 'Night']
  const outfields: OutfieldCondition[] = ['Slow', 'Normal', 'Fast']
  const difficulties: Difficulty[] = ['Casual', 'Standard', 'Expert', 'Simulation']
  const aggressions: Aggression[] = ['Defensive', 'Balanced', 'Positive', 'Aggressive', 'Attack']
  const shotSelections: ShotSelection[] = ['Ground', 'Mixed', 'Aerial']
  const pacePlans: PacePlan[] = ['Play late', 'Front-foot drive', 'Back-foot play', 'Short-ball caution', 'Counterattack']
  const spinPlans: SpinPlan[] = ['Play straight', 'Sweep', 'Use feet', 'Rotate strike', 'Defend']
  const runningRisks: RunningRisk[] = ['Conservative', 'Normal', 'Sharp']

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

  $: venue = venues.find((item) => item.id === venueId) ?? venues[0]
  $: result = simulateInnings(venue, format, weather, pitch, { aggression, shots, pacePlan, spinPlan, running }, { matchTime, outfield, difficulty })
  $: par = parForFormat(venue, format)
  $: activeBatters = result.scorecard.batting.filter((batter) => batter.balls > 0 || batter.dismissal).slice(0, 8)
  $: activeBowlers = result.scorecard.bowling.filter((bowler) => bowler.balls > 0)
  $: recentBalls = result.scorecard.balls.slice(-12)

  const bowlingOvers = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`
</script>

<main class="app-shell">
  <section class="hero-panel">
    <div>
      <p class="eyebrow">Cricket Manager Lite</p>
      <h1>Build a match around venue, weather, pitch and tactics.</h1>
    </div>
    <div class="score-tile">
      <span>Projected innings</span>
      <strong>{result.score}/{result.wickets}</strong>
      <small>{result.overs} overs · RR {result.runRate}</small>
    </div>
  </section>

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
    </div>
  </section>

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

  <section class="scorecard-panel">
    <div class="panel-heading">
      <span>Scorecard</span>
      <strong>{result.score}/{result.wickets} in {result.overs}</strong>
    </div>

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
          {result.scorecard.extras.total}
          <span class="muted">
            wides {result.scorecard.extras.wides}, no-balls {result.scorecard.extras.noBalls}, byes {result.scorecard.extras.byes}, leg-byes {result.scorecard.extras.legByes}
          </span>
        </p>
      </article>

      <article>
        <h2>Fall / Partnerships</h2>
        <p>
          {#if result.scorecard.fallOfWickets.length}
            {result.scorecard.fallOfWickets.map((item) => `${item.score}/${item.wicket} (${item.batter}, ${item.over})`).join(' · ')}
          {:else}
            No wickets lost.
          {/if}
        </p>
        <p class="muted">
          {result.scorecard.partnerships.slice(-3).map((item) => `${item.runs} off ${item.balls}`).join(' · ')}
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
</main>
