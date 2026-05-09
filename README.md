# ai-news

Daily AI news digest, auto-curated by a scheduled Claude agent.

**[→ Live page](https://agedtocommit.github.io/ai-news/)**

![screenshot](docs/screenshot.jpg)

Pulls from 50+ sources — YouTube channels, blogs, podcasts, and lab announcements — and runs them through a three-phase Claude pipeline tuned to a specific reader profile, producing a daily digest shaped by curation priorities rather than engagement metrics.

## How it works

Three scheduled Claude Code runs per day build the digest:

| Phase | Time (EST) | What it does |
|-------|------------|--------------|
| **Refresh** | 7am | Morning sweep — RSS + scrape, writes `am.json` |
| **Digest** | 1pm | Afternoon curation — ~15 items, writes `pm.json` |
| **Enrichment** | 2am | Overnight — deep-fetches articles, adds context |

The agent reads a [reader profile](agent/profile.md) at the start of every run. Curation follows a tier priority: model releases and lab announcements first, tools and frameworks second, product launches third.

## Sources

50+ sources across four categories:

- **YouTube** — technical educators (Karpathy, 3Blue1Brown, Yannic Kilcher), news/industry, and builder channels
- **Blogs** — Lilian Weng, Simon Willison, Sebastian Raschka, Import AI, The Batch, Latent Space, and more
- **Podcasts** — Latent Space, Dwarkesh Patel, No Priors, The Gradient, Practical AI
- **Labs** — Anthropic, OpenAI, DeepMind, Meta AI, Hugging Face, Mistral, Cohere

Full list: [`agent/sources.json`](agent/sources.json)

## Tech

- **Frontend** — vanilla JS, ES modules, no build step, served via GitHub Pages
- **Agent** — Claude Code scheduled tasks, no server, no always-on process
- **Data** — flat JSON snapshots committed to `data/` on each run

## Repo layout

```
agent/
  profile.md        # reader profile, loaded at the start of every run
  sources.json      # full source list
  control.json      # kill switch — pause or disable individual phases
  prompts/          # phase-specific prompts + shared harness (common.md)
data/               # JSON snapshots, manifest, and run log
js/                 # app.js, cycle.js — static page logic
tests/              # Node test runner unit tests + fixture snapshots
index.html
```

## Local dev

```bash
python -m http.server 8000
# open http://localhost:8000/?data=tests/fixtures/data&now=2026-05-04T15:00
```

`?now=` overrides the cycle picker; `?data=` swaps the data root.

## Tests

```bash
npm test
```

Node's built-in test runner. No dependencies.

## Who this is for

This was built for one reader — me. The reader profile, sources, and curation priorities are all tuned to what I want to see each day.

That said, the structure is generic enough to fork. Swap out [`agent/profile.md`](agent/profile.md) and [`agent/sources.json`](agent/sources.json), point the scheduled tasks at your own repo, and you have a starting point for your own version.

---

Maintained by [@AgedToCommit](https://github.com/AgedToCommit) · Spec: [`SPEC.md`](SPEC.md)
