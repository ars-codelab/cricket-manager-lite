# Data Sources And Legal Notes

## Policy

Cricket Manager Lite should use curated, reviewable seed data. Runtime gameplay must not depend on live scraping or a hosted data service.

Allowed data practices:

- Use public cricket knowledge to create original ratings and venue profiles.
- Store source notes and assumptions beside curated data.
- Refresh data through a dev-only workflow that outputs reviewable diffs.
- Keep generated or scraped raw research out of runtime bundles unless it is explicitly curated.

Avoid:

- Official team or tournament logos.
- Copied player biographies or copyrighted profile text.
- Live scraping during gameplay.
- Shipping broad, unreviewed scraped datasets.
- Committing API tokens, cookies, or private credentials.

## Current Research Inputs

Local research files:

- `research/match-conditions-tactical-simulator.md`
- `research/condition-model-implementation-notes.md`
- `research/roster-research-2026-gemini.txt`
- `research/roster-research-2026-gemini.json`
- `research/roster-research-2026-gemini-audit.md`
- `research/roster-research-2026-gemini-pass2.txt`
- `research/roster-research-2026-gemini-pass2.json`
- `research/roster-research-2026-gemini-pass2-audit.md`

These files inform the condition model and initial roster seed data, but runtime implementation should use compact, original, reviewed fixtures rather than raw scraped or generated research text.

## Fixture Requirements

Each curated fixture should be:

- Human-readable.
- Deterministic and stable across builds.
- Validated for duplicate IDs and missing fields.
- Clear about whether values are factual, estimated, or gameplay-tuned.

## Current Roster Fixture

The current app ships a normalized seed fixture in `src/lib/rosters.ts`:

- 20 selectable teams.
- 160 shared player profiles.
- Player names and short names are retained from the reviewed JSON research.
- Ratings are original gameplay estimates from the research pass and are validated before use.
- The current roster version is `research-2026-07-v1`.

Current limitation: ratings are used for lineup ordering and bowling-pool selection, but delivery probabilities are not yet player-rating-specific.

## Roster Guidance

- Use player names only where legally appropriate.
- Do not copy profile summaries from third-party websites.
- Ratings should be original gameplay estimates.
- Include source-review notes for major updates.
- Future refreshes should be dev-only, diffable, and manually reviewed before changing `src/lib/rosters.ts`.
