# Cricket Manager Lite Research

This folder stores source research used to design the cricket simulation engine.

## Files

- `match-conditions-tactical-simulator.md`: Markdown export of the Google Doc research brief covering venue behavior, pitch/weather effects, tactical decision rules, simulation modifiers, DLS, and physics notes.
- `match-conditions-tactical-simulator.txt`: Plain-text export of the same document for quick search and extraction.
- `condition-model-implementation-notes.md`: Implementation digest used to translate condition research into bounded engine fixtures.
- `roster-research-2026-gemini.txt`: First roster research export.
- `roster-research-2026-gemini.json`: Parsed JSON from the first roster research export.
- `roster-research-2026-gemini-audit.md`: Audit notes for the first roster research export.
- `roster-research-2026-gemini-pass2.txt`: Second roster research export.
- `roster-research-2026-gemini-pass2.json`: Parsed JSON from the second roster research export.
- `roster-research-2026-gemini-pass2-audit.md`: Audit notes for the second roster research export.

## Source

- Google Doc: https://docs.google.com/document/d/1EcqRmZs4SQsk6SnloYIPl41sbpWxQHJU8biHBP3K0ZM/edit
- Local export date: 2026-07-11
- Roster source docs were exported from user-shared Google Docs in July 2026 and stored locally for reviewable seed-data generation.

## Implementation Notes

- Treat the research as design input, not final calibrated truth.
- Convert venue and condition claims into typed data fixtures before using them in the engine.
- Convert roster research into normalized, validated seed fixtures before using it in the runtime bundle.
- Keep normal gameplay modifiers conservative and bounded; use extreme modifiers only for rare conditions.
- Preserve citations/source links when translating research into data files.
