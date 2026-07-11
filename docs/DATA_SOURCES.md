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

These files inform the condition model, but implementation should convert them into compact, original fixtures and source notes.

## Fixture Requirements

Each curated fixture should be:

- Human-readable.
- Deterministic and stable across builds.
- Validated for duplicate IDs and missing fields.
- Clear about whether values are factual, estimated, or gameplay-tuned.

## Roster Guidance

When roster work begins:

- Use player names only where legally appropriate.
- Do not copy profile summaries from third-party websites.
- Ratings should be original gameplay estimates.
- Include source-review notes for major updates.
