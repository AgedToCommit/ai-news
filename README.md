# ai-news

Daily AI news digest, auto-curated by a scheduled Claude agent.

- **Live page:** https://agedtocommit.github.io/ai-news/
- **Schedule:** runs three times daily — 1pm EST (digest), 2am EST (enrichment), 7am EST (refresh)
- **Spec:** [`SPEC.md`](SPEC.md)

This repo is owned and maintained by [@AgedToCommit](https://github.com/AgedToCommit).

## Layout

- `index.html` + `js/` — the static page (vanilla ES modules, no build step)
- `agent/profile.md` — reader profile the agent reads at the start of every run
- `agent/sources.json` — source seed list, structured
- `agent/control.json` — kill switch (pause / per-phase enable)
- `data/` — JSON snapshots, manifest, run log
- `tests/` — Node test runner unit tests + fixture snapshots
- `docs/superpowers/` — design specs and implementation plans

## Local development

Open the page locally with fixture data:

```bash
python -m http.server 8000
# then open http://localhost:8000/?data=tests/fixtures/data&now=2026-05-04T15:00
```

The `?now=` query param time-overrides the cycle picker; `?data=` swaps the data root.

## Tests

```bash
npm test
```

Runs the cycle-selection unit tests via Node's built-in test runner. No dependencies.
