# Gemini Roster Research Pass 2 Audit

Source document: https://docs.google.com/document/d/1f-I9K3LT4dFlZv1cx278KTKZxnKzfVXe49h7_taokjA/edit

Local files:

- `research/roster-research-2026-gemini-pass2.txt`: full exported Google Doc text.
- `research/roster-research-2026-gemini-pass2.json`: JSON-only roster export.

## Validation Result

- JSON parses successfully.
- Dataset has 13 teams and 143 roster entries.
- Each requested missing team is present.
- Each team has 11 players.
- No malformed `[span_*]` citation artifacts found.
- No invalid role, batting style, bowling style, batting order, rating range, or aggression values found.

## Included Teams

- International: South Africa, New Zealand, Sri Lanka, Bangladesh, Afghanistan, West Indies.
- Franchise: Kolkata, Hyderabad, Rajasthan, Delhi, Punjab, Gujarat, Lucknow.

## Integration Notes

- There are repeated player IDs across international and franchise rosters. This is desirable for real-world-style squad overlap and should be modeled as a shared player pool plus team roster references.
- This pass complements `roster-research-2026-gemini.json`, which contains India, Australia, Pakistan, England, Chennai, Mumbai, and Bangalore.
- Short/pseudonymized player names are accepted for default in-game display.

## Recommendation

Use this pass as the primary source for the missing teams. Next implementation should normalize pass 1 and pass 2 into a single app roster schema, clean pass 1 artifacts, preserve repeated player IDs as shared players, and add roster validation tests before exposing team selection in the UI.
