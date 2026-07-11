# Git And Release Workflow

## Local Git Policy

- Initialize Git before further feature work.
- Configure repo-local user email as `anoj.infinity@gmail.com`.
- Commit after every stable slice.
- Do not commit secrets, tokens, `node_modules`, build output, or local environment files.
- Keep commits small enough to revert cleanly.

## Required Pre-Commit Checks

Run before every checkpoint commit:

```bash
npm run check
npm run build
git status --short
```

Only commit intended files.

## Suggested Commit Sequence

```text
chore: initialize cricket manager lite project
docs: capture project plan and engine design
feat: add condition model fixtures
feat: implement deterministic match engine
feat: add scorecards and ball log
feat: add custom match setup UI
feat: add offline save storage
ci: add github pages deployment
```

## GitHub Distribution

- Public repo under `ars-codelab`.
- GitHub Pages hosts the static app.
- GitHub Releases attach a production build ZIP.
- Users can play on GitHub Pages, install as PWA, clone and run locally, or download the release ZIP.

## Token Safety

Use a fine-grained GitHub token for future pushes:

- Repository: only this project repo.
- Permissions: Contents read/write, Actions read/write if workflows must be managed.
- Avoid broad classic PATs with org/admin/delete scopes.
