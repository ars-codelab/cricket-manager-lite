# Cricket Manager Lite

Cricket Manager Lite is an offline-first mobile web cricket management simulator. It is inspired by cricket captaincy games, but built as a lightweight static browser app that anyone can clone, download, or host on GitHub Pages.

The current prototype focuses on custom/friendly matches where venue, pitch, weather, and tactics influence a deterministic simulation.

## Current Status

This project is in early active development.

Implemented now:

- Svelte 5 + Vite + TypeScript mobile web app.
- Venue, pitch, weather, and batting tactic controls.
- Deterministic projected-innings prototype.
- Test match five-day surface forecast prototype.
- Local design docs and backlog.

Next major work:

- Ball-by-ball innings engine.
- Scorecards, ball log, and commentary.
- Expanded venue matrix and fixture validation.
- Offline saves and GitHub Pages distribution.

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
- Later PWA install/offline cache.

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
