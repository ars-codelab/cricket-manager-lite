# Cricket Manager Lite Research

This folder stores source research used to design the cricket simulation engine.

## Files

- `match-conditions-tactical-simulator.md`: Markdown export of the Google Doc research brief covering venue behavior, pitch/weather effects, tactical decision rules, simulation modifiers, DLS, and physics notes.
- `match-conditions-tactical-simulator.txt`: Plain-text export of the same document for quick search and extraction.

## Source

- Google Doc: https://docs.google.com/document/d/1EcqRmZs4SQsk6SnloYIPl41sbpWxQHJU8biHBP3K0ZM/edit
- Local export date: 2026-07-11

## Implementation Notes

- Treat the research as design input, not final calibrated truth.
- Convert venue and condition claims into typed data fixtures before using them in the engine.
- Keep normal gameplay modifiers conservative and bounded; use extreme modifiers only for rare conditions.
- Preserve citations/source links when translating research into data files.
