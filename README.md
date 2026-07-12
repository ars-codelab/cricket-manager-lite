# Cricket Manager Lite

Cricket Manager Lite is an offline-first mobile web cricket management simulator. It is inspired by cricket captaincy games, but built as a lightweight static browser app that anyone can clone, download, or host on GitHub Pages.

The current playable slice focuses on custom/friendly matches where selected teams, venue, pitch, weather, tactics, and difficulty influence a deterministic ball-by-ball simulation.

## Current Status

This project is in early active development, with the first playable custom-match loop running in the browser and deployed through GitHub Pages.

Implemented now:

- Svelte 5 + Vite + TypeScript mobile web app.
- Venue, pitch, weather, match-time, outfield, difficulty, and team-selection controls.
- Deterministic stateful ball-by-ball engine with progressive simulation by over, wicket, custom interval, or innings.
- Two-innings chase flow with winner, margin, player of the match, top batters, and top bowlers.
- Mobile match cockpit with score, current players, action controls, decision sheets, scorecard, and live stream.
- Normalized seed roster fixture with 20 teams and 160 shared player profiles from reviewed research imports.
- Test match five-day surface forecast prototype.
- Local design docs, backlog, fixture validation, and engine tests.

Next major work:

- Make player ratings affect delivery probabilities, not only lineup/bowling-pool selection.
- Add playing XI selection, roster previews, and richer team AI.
- Add IndexedDB match/career saves.
- Add series and career-lite modes.

## Development

Requirements:

- Node.js 18.x or compatible.
- npm.

Install and run:

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run check
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Docs

- [Product design](docs/PRODUCT_DESIGN.md)
- [Backlog](docs/BACKLOG.md)
- [Engine design](docs/ENGINE_DESIGN.md)
- [Match engine design](docs/MATCH_ENGINE_DESIGN.md)
- [Project state](docs/PROJECT_STATE.md)
- [Git and release workflow](docs/GIT_AND_RELEASE.md)
- [Graphify setup](docs/GRAPHIFY.md)

## Distribution Goal

The app is designed to run without a runtime backend. The intended distribution paths are:

- GitHub Pages for hosted play.
- Release ZIP for download.
- Local clone with `npm install && npm run build`.
- PWA install/offline cache through the current basic service worker, with hardening still planned.

## Data And Licensing

The game uses curated cricket knowledge and manually reviewed seed data. It does not use official logos, copied player biographies, or live scraping during gameplay.

See [data sources](docs/DATA_SOURCES.md) for source and legal guidance.

## Repository Policy

- Keep commits small and reversible.
- Run checks before every stable commit.
- Do not commit secrets, broad GitHub tokens, `node_modules`, `dist`, or generated Graphify output.
- Prefer deterministic simulation and reviewable data changes.

## License

MIT. See [LICENSE](LICENSE).
