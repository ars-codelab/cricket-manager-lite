# Gemini Roster Research Audit

Source document: https://docs.google.com/document/d/1fa7YiEpbZgh26mCHJHRUmhUk52pHkzak5o7S1bVu8OY/edit

Local files:

- `research/roster-research-2026-gemini.txt`: full exported Google Doc text.
- `research/roster-research-2026-gemini.json`: extracted roster JSON block.

## Validation Result

- JSON parses successfully.
- Extracted dataset has 7 teams and 43 players.
- Included teams: India T20, Australia T20, Pakistan T20, England T20, Chennai Franchise, Mumbai Franchise, Bangalore Franchise.

## Gaps Before App Integration

- Missing international teams: South Africa, New Zealand, Sri Lanka, Bangladesh, Afghanistan, West Indies.
- Missing IPL teams: Kolkata, Hyderabad, Rajasthan, Delhi, Punjab, Gujarat, Lucknow.
- Rosters are partial, mostly 6-7 players per team.
- One key contains citation artifacts: `batting[span_117](start_span)[span_117](end_span)_rating`.
- Names are pseudonymized by design, so product needs an explicit decision before user-facing use.
- Schema does not match the originally requested shape; it uses `roster`, `batting_rating`, `bowling_rating`, and `natural_aggression` rather than the planned normalized player ratings object.

## Recommendation

Use this as a reference sample only. Before wiring rosters into gameplay, normalize it into the app schema, clean citation artifacts, complete missing teams, and decide whether v1 should show pseudonymized names or real factual names.
