<script lang="ts">
  import { parForFormat, pitchProfiles, venues, weatherProfiles } from './lib/data'
  import { simulateInnings } from './lib/simulation'
  import type { Aggression, MatchFormat, PacePlan, PitchType, RunningRisk, ShotSelection, SpinPlan, WeatherType } from './lib/types'

  const formats: MatchFormat[] = ['T20', 'ODI', 'Test']
  const aggressions: Aggression[] = ['Defensive', 'Balanced', 'Positive', 'Aggressive', 'Attack']
  const shotSelections: ShotSelection[] = ['Ground', 'Mixed', 'Aerial']
  const pacePlans: PacePlan[] = ['Play late', 'Front-foot drive', 'Back-foot play', 'Short-ball caution', 'Counterattack']
  const spinPlans: SpinPlan[] = ['Play straight', 'Sweep', 'Use feet', 'Rotate strike', 'Defend']
  const runningRisks: RunningRisk[] = ['Conservative', 'Normal', 'Sharp']

  let format: MatchFormat = 'T20'
  let venueId = 'wankhede'
  let weather: WeatherType = 'Humid'
  let pitch: PitchType = 'Flat'
  let aggression: Aggression = 'Positive'
  let shots: ShotSelection = 'Mixed'
  let pacePlan: PacePlan = 'Play late'
  let spinPlan: SpinPlan = 'Rotate strike'
  let running: RunningRisk = 'Normal'

  $: venue = venues.find((item) => item.id === venueId) ?? venues[0]
  $: result = simulateInnings(venue, format, weather, pitch, { aggression, shots, pacePlan, spinPlan, running })
  $: par = parForFormat(venue, format)
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
