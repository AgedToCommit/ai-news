# AI News Agent — Design Spec

**Status:** Draft for review
**Author:** Gabe (AgedToCommit) + Claude
**Date:** 2026-05-04
**Repo:** [AgedToCommit/ai-news](https://github.com/AgedToCommit/ai-news)
**Live page:** https://agedtocommit.github.io/ai-news/

---

## 0. One-paragraph summary

A personal, twice-daily AI-news digest auto-curated by three Anthropic-hosted scheduled tasks (1pm digest, 2am enrichment, 7am refresh — all EST). The agent reads a configurable list of RSS feeds, lab blogs, and creator channels, curates ~15 items per digest across three tiers (model releases, tools/libraries, product launches), and writes one immutable JSON snapshot per run into a public GitHub Pages repo. A static `index.html` fetches the JSON and renders a cycle-based two-section layout (today / yesterday-updated). The visual design is left as a placeholder until handed off to Claude Design after 5–7 days of real data exists. The agent supports a soft kill switch via `agent/control.json`. Full token usage is logged publicly to `data/runs.json` for debugging.

---

## 1. Architecture & data flow

### Components

1. **Static page** — `index.html` at the repo root, served by GitHub Pages. Self-contained: HTML + CSS + a small JS module that fetches JSON and renders. No build step. The visual design is a *placeholder* now — Claude Design output replaces it later (see §6).

2. **Data layer** — `data/` directory of JSON files in the same repo. Each file is one immutable snapshot of one run. `data/index.json` is a manifest listing every snapshot file in chronological order so the page knows what exists without a directory listing.

3. **Run log** — `data/runs.json` records every scheduled-task run: timestamps, run type, status, token usage breakdown, items added/dropped, errors. Used by the page for the footer timestamp + stale banner, and by the operator for debugging.

4. **Config** — two human-editable files committed to the repo:
   - `agent/profile.md` — the reader profile (audience context for `why_it_matters` writing)
   - `agent/sources.json` — structured seed source list, by category and access method (`rss` / `scrape` / `web-search`)

5. **Three scheduled agents** — Anthropic-hosted scheduled tasks via `mcp__scheduled-tasks`, one per phase. Each task has its own prompt that reads config, does its job, and commits the resulting JSON file + updated manifest + appended run log back to the repo via `gh` CLI.

6. **Kill switch** — `agent/control.json` lets the operator pause the whole agent or individual phases without touching the scheduled-task definitions (see §5).

### Data flow per run

```
scheduled task fires
  → reads agent/profile.md + agent/sources.json + agent/control.json from the repo
  → if paused → log to runs.json and exit
  → reads previous snapshot file(s) as input (varies per phase)
  → fetches sources (RSS first, scrape second, web-search last)
  → curates items into the run's output JSON
  → commits to repo:
      - data/<new-or-updated>.json
      - data/index.json (manifest update)
      - data/runs.json (run log entry)
  → push to main branch → GitHub Pages serves immediately
```

### Why this shape

- Every run produces one JSON file → atomic, easy to revert one bad run with `git revert`.
- Manifest decouples the page from directory listings (GitHub Pages doesn't expose directory indexes).
- Config files in-repo means the operator edits profile + sources without touching scheduled-task prompts.
- Run log is itself a JSON file → page renders "last update X ago" without any backend.

---

## 2. Repository layout & JSON schema

### Repo layout

```
ai-news/
├── index.html                          # placeholder (Claude Design replaces later)
├── README.md
├── SPEC.md                             # → links to docs/superpowers/specs/ source of truth
├── GOALS.md                            # future-scope ideas (see §5)
├── .gitignore
├── agent/
│   ├── profile.md                      # reader profile
│   ├── sources.json                    # seed source list
│   ├── control.json                    # kill switch / phase enable
│   └── prompts/
│       ├── digest.md                   # 1pm prompt
│       ├── enrichment.md               # 2am prompt
│       └── refresh.md                  # 7am prompt
├── data/
│   ├── index.json                      # manifest of all snapshots
│   ├── runs.json                       # run log
│   ├── 2026-05-04-pm.json              # snapshot files
│   ├── 2026-05-05-am.json
│   ├── 2026-05-05-pm.json
│   └── ...
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-04-ai-news-agent-design.md   # this design doc
```

### Snapshot file schema (`data/YYYY-MM-DD-{am,pm}.json`)

```json
{
  "snapshot_id": "2026-05-05-am",
  "snapshot_type": "am",
  "calendar_date": "2026-05-05",
  "generated_at": "2026-05-05T12:14:08Z",
  "generated_at_local": "2026-05-05T07:14:08-05:00",
  "phase_history": [
    { "phase": "enrichment", "ran_at": "2026-05-05T07:02:11Z", "duration_ms": 312488 },
    { "phase": "refresh",    "ran_at": "2026-05-05T12:14:08Z", "duration_ms": 187220 }
  ],
  "tier_counts": { "1": 4, "2": 6, "3": 2 },
  "items": [
    {
      "id": "anthropic-claude-4-7-opus-release",
      "tier": 1,
      "title": "Anthropic ships Claude Opus 4.7 with 1M context",
      "summary": "Anthropic released Claude Opus 4.7 to API and the Claude apps...",
      "link": "https://www.anthropic.com/news/claude-opus-4-7",
      "why_it_matters": "1M context means you can drop entire codebases or full books in one shot — relevant if you ever try to use it on your full Ai News Agent repo.",
      "source": { "name": "Anthropic News", "type": "scrape", "url": "https://www.anthropic.com/news" },
      "region": "US",
      "hero_image": {
        "url": "https://www.anthropic.com/_next/image?url=...og-claude-4-7.jpg",
        "alt": "Anthropic's Claude Opus 4.7 announcement banner",
        "source": "og:image"
      },
      "added_at": "2026-05-04T18:01:33Z",
      "added_by": "digest",
      "last_revision_by": "enrichment",
      "enriched_overnight": true,
      "promoted_from_am": false,
      "revisions": [
        { "at": "2026-05-04T18:01:33Z", "by": "digest",     "change": "created" },
        { "at": "2026-05-05T07:02:11Z", "by": "enrichment", "change": "added benchmark context + why_it_matters update" }
      ],
      "takes": [
        { "source": "Simon Willison", "url": "https://simonwillison.net/2026/May/4/claude-opus-4-7/", "take": "Notes the throughput numbers and a real-world long-context test." },
        { "source": "Hacker News",    "url": "https://news.ycombinator.com/item?id=...",            "take": "Top comment thread is mostly skepticism on price-vs-capability." }
      ]
    }
  ],
  "dropped_in_phase": [
    { "phase": "enrichment", "id": "minor-saas-launch-x", "reason": "no new substance overnight, low signal" }
  ]
}
```

**Per-item field reference:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable, slugified — used for cross-day dedup and sub-page deep links |
| `tier` | int (1\|2\|3) | 1 = model releases, 2 = tools/libs, 3 = product launches |
| `title` | string | Item headline |
| `summary` | string | 1–2 sentences |
| `link` | url | Canonical article link |
| `why_it_matters` | string | Connects to reader profile in plain language; no hype |
| `source` | object | `{name, type, url}` — `type` ∈ `rss` \| `scrape` \| `web-search` |
| `region` | string | `US` / `EU` / `Asia` / `Global` etc. |
| `hero_image` | object \| null | `{url, alt, source}` — see image extraction rules in §3 |
| `added_at` | ISO datetime | When this item first entered any snapshot |
| `added_by` | string | `digest` \| `enrichment` \| `refresh` |
| `last_revision_by` | string | Which phase touched it most recently |
| `enriched_overnight` | bool | True if last revision was `enrichment` or `refresh` |
| `promoted_from_am` | bool | Pm-file only; true when 1pm digest re-listed an item already in the morning file with deeper context |
| `revisions` | array | Append-only `{at, by, change}` log per item |
| `takes` | array | `{source, url, take}` — cross-source coverage of the same canonical story |

### Manifest (`data/index.json`)

```json
{
  "schema_version": 1,
  "generated_at": "2026-05-05T12:14:08Z",
  "snapshots": [
    { "id": "2026-05-05-am", "type": "am", "calendar_date": "2026-05-05", "file": "data/2026-05-05-am.json", "tier_counts": {"1":4,"2":6,"3":2}, "item_count": 12 },
    { "id": "2026-05-04-pm", "type": "pm", "calendar_date": "2026-05-04", "file": "data/2026-05-04-pm.json", "tier_counts": {"1":5,"2":7,"3":3}, "item_count": 15 }
  ]
}
```

Newest first. Page reads this once on load and decides which two snapshots to render based on current EST time.

### Run log (`data/runs.json`)

```json
{
  "runs": [
    {
      "run_id": "2026-05-05T12:14:08Z-refresh",
      "phase": "refresh",
      "status": "success",
      "started_at": "2026-05-05T12:11:01Z",
      "ended_at": "2026-05-05T12:14:08Z",
      "wall_time_ms": 187220,
      "tokens_used": 41812,
      "tokens_breakdown": {
        "rss_sweep": 4200,
        "scrape_sweep": 8800,
        "tier_ranking": 3100,
        "deep_fetch": 19000,
        "discovery_search": 4500,
        "curation": 2200,
        "output_write": 12
      },
      "fetches_made": 18,
      "items_input": 47,
      "items_output": 11,
      "items_added": 2,
      "items_kept": 10,
      "items_dropped": 1,
      "snapshot_written": "2026-05-05-am",
      "error": null,
      "partial": false
    }
  ]
}
```

Newest first. Bounded log size — keeps last 90 days, older trimmed.

`status` ∈ `success` \| `failure` \| `paused` \| `partial`. The `partial` flag is set when a wall-time or token cap was hit mid-run but the agent still wrote a usable snapshot.

---

## 3. The three agent runs

Each run is a separate scheduled task with its own prompt file in `agent/prompts/`. All three share a common harness.

### Common harness

**Inputs read at start of every run:**
- `agent/profile.md`
- `agent/sources.json`
- `agent/control.json` — kill-switch check (exit early if paused)
- `data/index.json`
- Prior snapshots specified by the run type (see below)

**Cost-aware fetch order** (cheapest → most expensive):
1. **Pass 1 — RSS sweep.** Fetch all RSS feeds in parallel. Parse headers + summaries only (no body fetch). Filter to entries published since the last run of any type. Output: a candidate pool of ~50–150 light entries.
2. **Pass 2 — Scrape sweep.** For non-RSS sources (OpenAI, Anthropic News, DeepMind, Meta, Mistral blogs), fetch post-list pages, diff against last-known post URLs, only fetch full bodies for new posts.
3. **Pass 3 — Tier ranking.** Score candidates against tier criteria. Drop bottom 60% before deep-fetch.
4. **Pass 4 — Deep fetch.** For top ~30 candidates, fetch full article + extract `og:image`. Biggest token chunk.
5. **Pass 5 — Discovery (web search).** Tier-2/3 only — query for "popping off" creator content from the seeded creator list. Tightly capped (max 5 search queries per run).
6. **Pass 6 — Curate + dedup.** Group by canonical content URL; fold cross-posts into `takes[]`; write 1–2 sentence summaries + `why_it_matters` tags.
7. **Pass 7 — Write output.** Atomic write of snapshot JSON + manifest update + run-log append + git commit + `gh` push.

**Hero image extraction** (during pass 4, in priority order):
1. `<meta property="og:image">` — Open Graph standard, hits ~95% of news/blog articles
2. `<meta name="twitter:image">` — fallback
3. RSS `<media:thumbnail>` / `<enclosure type="image/...">` / `<media:content medium="image">`
4. YouTube RSS — `<media:thumbnail url="https://i.ytimg.com/vi/.../hqdefault.jpg">`
5. First inline `<img>` in the article body, only if larger than ~600px (skip avatars/icons)
6. **No image found → `hero_image: null`.** Never synthesize, never use a generic stock image.

Storage: hot-link the URL. Don't download/mirror to the repo. Some images will eventually 404 as sources rotate; the page hides broken `<img>` via `onerror`. Alt text generated from article context when not provided in the meta tag — required field for accessibility.

**Hard caps** (in every prompt):
- Max web fetches per run
- Max wall-clock time per run (real-world elapsed time, kill switch — not a target)
- Max tokens per run (graceful early-stop near the cap)
- If any cap is hit → write what's been curated, mark run as `partial: true`, exit cleanly.

**On failure** (any uncaught error): write `{status: "failure", error: "..."}` to run log, do NOT push a half-written snapshot, exit cleanly. Page falls back to previous successful snapshot.

### Run A — Digest (1:00 PM EST daily)

**Goal:** Fresh full digest of the day's AI news.

**Inputs:** config files + today's `data/YYYY-MM-DD-am.json` if it exists.

**Behavior:** Full pipeline. Tier-1 emphasis. Up to ~15 items total, flexible per tier (no floor — if a tier yields 2 strong items, that's fine; if another yields 8, also fine).

**Promotion rule:** Items already in today's am file are *excluded by default* from the pm output (the user already sees them in the morning section). However, if a Tier-1 item in the am file has materially deepened during the day (more sources covering it, accumulated commentary, follow-up posts), the agent MAY promote it into the pm with `promoted_from_am: true` and a richer summary. Promotion is the exception — default is to exclude.

**Output:** `data/YYYY-MM-DD-pm.json` (today's date, EST).

**Caps:** 100K tokens, 60 min wall, 50 fetches.

### Run B — Enrichment (2:00 AM EST daily)

**Goal:** Read yesterday's pm digest, prune stale items, deepen survivors with more context, add 1–2 late-breaking items. *Begins* the new day's am file.

**Inputs:** config files + yesterday's `data/YYYY-(MM)-(DD-1)-pm.json`.

**Behavior:**
1. Read each item from yesterday's pm. For each, do a focused web search for new context, comments, follow-ups, benchmark numbers. If meaningful new info → add to `summary` + append revision entry. If no new substance → drop the item (record in `dropped_in_phase`).
2. Run a small light pass (RSS sweep filtered to the last 12h) for genuinely late-breaking items. Add up to 2.
3. Each kept or new item gets `enriched_overnight: true` and `last_revision_by: "enrichment"`.

**Output:** `data/YYYY-MM-DD-am.json` (today's date — *the new file starts here*).

**Caps:** 100K tokens, 45 min wall, 30 fetches.

### Run C — Refresh (7:00 AM EST daily)

**Goal:** Catch news that broke between 2 AM and 7 AM (Asia AM / Europe midday cycles), append to the morning file. Light-touch.

**Inputs:** config files + this morning's `data/YYYY-MM-DD-am.json` (from the 2 AM run; this run finalizes it).

**Behavior:**
1. RSS sweep filtered to the last 5 hours.
2. Scrape sweep filtered to anything posted after the 2 AM run's `ended_at` timestamp.
3. Append up to 3 new items to the existing am file. Each new item gets `added_by: "refresh"`.
4. Optional small re-pass on items where scoring is borderline.

**Output:** `data/YYYY-MM-DD-am.json` (overwrites the 2 AM version with appended content).

**Caps:** 60K tokens, 25 min wall, 20 fetches.

### Resilience tie-in

If `runs.json` shows the prior run failed:
- **Refresh sees enrichment failed** → does both jobs in one shot (read yesterday-pm directly, prune + enrich + add late-breaking + refresh items, write fresh am file).
- **Digest sees prior runs failed** → just runs normally; the page falls back to the last successful snapshot + the broken-banner.
- **Digest sees its own previous-day digest failed** → just runs normally; archive has a 24h gap, that's fine.

---

## 4. Page rendering & UX rules

### What the page does on load

1. Fetch `data/index.json` (manifest)
2. Fetch `data/runs.json` (run log)
3. Fetch `agent/control.json` (pause state)
4. Determine current EST time and pick which two snapshots to render
5. Fetch the chosen snapshot file(s)
6. Render in the cycle-based layout (top section + bottom section + optional banner + footer)

All client-side — no build step, no server.

### Cycle-based layout selection

| Time window (EST) | Top section label | Top file | Bottom section label | Bottom file | Banner |
|---|---|---|---|---|---|
| 1:00pm – 1:59am | "Today (afternoon)" | newest pm | "Today (morning)" | newest am, same date | none |
| 2:00am – 6:59am | (empty / hidden) | — | "Yesterday's afternoon" | newest pm | *"Today's morning refresh runs at 7am EST."* |
| 7:00am – 12:59pm | "Today (morning)" | newest am | "Yesterday's afternoon" | most recent pm | *"Today's afternoon digest runs at 1pm EST."* |

Page always shows `last refresh: <relative time>` in the footer (read from `runs.json`).

### Item rendering

Each item card surfaces:
- **Tier indicator** (visual, color-coded — Claude Design decides exact treatment)
- **Title + 1–2 sentence summary**
- **Hero image** if present (graceful fallback if URL 404s)
- **`why_it_matters` tag** (small, secondary text, callout-style)
- **Region badge** when not `US` or `Global`
- **"Updated overnight" marker** when `enriched_overnight: true` and `last_revision_by` is `enrichment` or `refresh`
- **"↑ promoted from morning" marker** when `promoted_from_am: true`
- **Source name + link** to the original article
- **"Details →" link** when `takes.length >= 2`, opening the sub-page (deep-link `index.html#item-<id>`)

### Sub-page (multi-take expanded view)

Triggered by `#item-<id>` URL hash. Renders:
- The full item card at the top
- Below: each entry in `takes[]` as a quoted block — "{take} — {source}, [link]"
- Back link to main view (clears hash, scrolls to item)

No separate HTML file generated. Pure client-side routing on hash change.

### Archive

Below the two-section layout, an **"Archive"** disclosure (collapsed by default). When opened:
- Lists all snapshots from `data/index.json`, newest first, grouped as:
  - "Earlier this week" (last 7 days, excluding the two currently displayed)
  - "This month"
  - "Older" (further grouping by month)
- Each entry: `<date> <am|pm> — <item count>, <tier breakdown>` — clicking loads that snapshot into the bottom section.

### Failure UX

- **Footer timestamp** — always present: `Last refresh: 2 hours ago`
- **Stale banner** — displayed prominently above the cycle banner if `(now - lastSuccessfulRun) > 12h`: *"⚠ Last successful refresh was 14 hours ago — agent may be stuck."*
- **Run-failure pill** — if the most recent run is `status: "failure"`, show a small red dot, click to expand the error message
- **Paused banner** — if `agent/control.json` has `paused: true`, big banner with reason and resume time

### Bootstrap state

- **Day 0 (today, post-bootstrap-1pm-run):** Only `2026-05-04-pm.json` exists. Page shows it as "Today (afternoon)." Bottom section hidden. No banner.
- **Day 1 morning, after 7am:** Both `2026-05-05-am.json` and `2026-05-04-pm.json` exist. Normal cadence begins.

### Out of scope for the placeholder (and v1)

- Search across archive
- Filtering by tier or region
- Per-item bookmarking / read flags
- Per-item sharing UI (sub-page deep-link IS the share mechanism)
- Mobile-specific layout (Claude Design will handle responsive design)

---

## 5. Operations

### Scheduled task configuration

Three Anthropic-hosted scheduled tasks via `mcp__scheduled-tasks`, all timezone `America/New_York` (handles DST):

| Task name | Cron (NYC TZ) | Prompt file | Model | Wall cap |
|---|---|---|---|---|
| `ai-news-digest` | `0 13 * * *` | `agent/prompts/digest.md` | Claude Opus 4.7 (1M) | 60 min |
| `ai-news-enrichment` | `0 2 * * *` | `agent/prompts/enrichment.md` | Claude Opus 4.7 (1M) | 45 min |
| `ai-news-refresh` | `0 7 * * *` | `agent/prompts/refresh.md` | Claude Sonnet 4.6 | 25 min |

Refresh uses Sonnet (cheaper, smaller pass); the others use Opus 4.7 1M for curation/judgment that benefits from long context. Tune later from real run data.

### Repo access from the scheduled task

- **GitHub Personal Access Token (PAT)** scoped to **only `AgedToCommit/ai-news`** with `contents:write` permission
- Stored as a secret env var in each scheduled task config (all three use the same token)
- Token rotation: manual, every 90 days — calendar reminder, not automated
- The agent uses `gh auth login --with-token` at the start of each run, then `gh repo clone` + `git commit` + `git push`

If the PAT is leaked or revoked: agent runs fail cleanly, stale banner kicks in, operator regenerates and updates the secret.

### Tools each task needs

- `WebFetch` — for RSS feeds, blog post bodies
- `WebSearch` — for discovery passes
- `Bash` — for `gh` CLI operations
- File read/write within the run's sandboxed workspace

No MCP servers needed beyond what's standard.

### Kill switch — `agent/control.json`

```json
{
  "paused": false,
  "paused_reason": null,
  "paused_until": null,
  "phases": {
    "digest":     { "enabled": true },
    "enrichment": { "enabled": true },
    "refresh":    { "enabled": true }
  }
}
```

**Behavior at the start of each run:**
1. Agent fetches `agent/control.json`
2. If `paused == true` AND (`paused_until` is null OR `paused_until > now`):
   - Append `status: "paused"` entry to `data/runs.json` (~few hundred tokens — minimal cost)
   - Exit cleanly. No source fetches, no curation, no snapshot write.
3. If `paused_until` is set and has elapsed: agent auto-resumes (treats `paused: false`)
4. If `phases[<this-phase>].enabled == false`: skip just this phase

**Pause UX:**
- Pause forever: edit `paused: true`, commit, push.
- Pause for a week: set `paused_until: "2026-05-11T00:00:00Z"`. Agent auto-resumes.
- Pause overnight only: set `phases.enrichment.enabled: false` and `phases.refresh.enabled: false`.

**Page UX when paused:** big banner — *"Agent paused — last update X ago. Resumes: <time>. Reason: <text>."* Page still serves last successful snapshots so historical content is browsable.

**Deep kill (long pauses or shutdown):** use `mcp__scheduled-tasks` API to disable/delete the three tasks entirely. Avoids the few-hundred-token-per-run cost of the soft pause. Cron expressions in this spec make reconstitution trivial.

### Failure handling — end-to-end

| Layer | Mechanism | Where it shows up |
|---|---|---|
| In-run | Try/catch in the agent prompt: if it can't write the snapshot, log to `runs.json` as `failure`, exit cleanly | `data/runs.json` |
| Cross-run resilience | Refresh detects enrichment failure, does both jobs. Digest just runs normally regardless of prior failures. | `agent/prompts/refresh.md` logic |
| User-visible | Footer timestamp; >12h-stale banner; red dot on run-status pill | `index.html` reads `runs.json` |
| Notifications | None in v1 — listed in `GOALS.md` for later | — |

### Bootstrap — going live

1. **Pre-flight**
   - Generate the GitHub PAT (90-day expiry), copy securely
   - Write `agent/sources.json` from the seed list (markdown table → structured JSON during implementation)
   - Write `agent/profile.md`
   - Write `agent/control.json` with default values (unpaused, all phases enabled)
   - Write the three prompt files in `agent/prompts/`
   - Push everything to `main`

2. **First-run validation** — manual one-off invocation of the digest task at whatever real time we trigger it
   - Watch the run, verify it produces a sensible `data/2026-05-04-pm.json` and pushes successfully
   - Verify the placeholder `index.html` renders correctly on `https://agedtocommit.github.io/ai-news/`

3. **Schedule activation** — register the three recurring tasks with the cron schedules above

4. **Day 2 verification** — wake at 7am next morning, confirm:
   - `2026-05-05-am.json` exists and contains yesterday's enriched + 7am items
   - Page renders both sections correctly
   - Banner says "Today's afternoon digest runs at 1pm EST"
   - Footer shows recent timestamp

If any step fails, debug from `runs.json` and re-run manually.

### Source list updates (operator, post-launch)

- Edit `agent/sources.json` locally, push to `main`
- Next scheduled run picks it up automatically — no need to touch task configs
- Same pattern for `agent/profile.md` and `agent/control.json`

### Manual one-off runs

If a digest is wanted out-of-band (e.g., a major announcement just dropped):
- Trigger via `mcp__scheduled-tasks__create_scheduled_task` with a one-shot config, OR
- Tell a Claude session "run the digest now" and it dispatches directly via the SDK

The same prompt files run regardless of trigger source.

### Cost ceiling

- ~3 runs/day × ~80K avg tokens = ~240K tokens/day = ~7.2M tokens/month
- Fits comfortably within the stated 100–300K/day budget
- `data/runs.json` keeps a rolling sum so actuals are easy to spot-check

### Future scope — `GOALS.md`

A running list of ideas deliberately not in v1, kept at the repo root. Initial entries:

- **Notifications** — email/SMS/Slack ping when (a) a run fails twice in a row, (b) a Tier-1 model release is detected. Implementation could be a 4th scheduled task that watches `runs.json`.
- **Search across archive** — needs a build step or small client-side search index
- **Tier/region filtering** on the page
- **Cost dashboard** — small page that reads `runs.json` and graphs token usage over time
- **Smarter source rotation** — RSS feeds we've never gotten an item from in 30 days get demoted to weekly check
- **Mobile-only layout polish** — separate from Claude Design's responsive work, post-launch

The agent never reads `GOALS.md`. It's purely operator notes.

---

## 6. Claude Design handoff

The placeholder `index.html` shipped at launch is functional but visually minimal. Once the agent has been running for **5–7 days** (real snapshot data — multiple mornings, afternoons, items with takes, items with hero images, items without, items with regions), the page design is handed over to Claude Design.

### When to hand off

Wait at least 5–7 days because:
- Claude Design reads the repo and learns from real data — empty/synthetic data produces a worse design system
- Real data exposes edge cases (no hero image, single-source items, 8-take items, very long titles)
- Token cost on Claude Design itself is higher when content shape is uncertain

### What to ship to Claude Design

1. **Repo URL** — `https://github.com/AgedToCommit/ai-news`. Claude Design ingests the entire repo:
   - This SPEC
   - `agent/profile.md`
   - `data/index.json` + several real snapshot files
   - The current placeholder `index.html`

2. **Handoff prompt** (paste into Claude Design):

   > I'm building a personal daily AI-news digest page. The data and rendering rules are fully defined in the SPEC at `docs/superpowers/specs/2026-05-04-ai-news-agent-design.md` — please read it first.
   >
   > **Audience:** see `agent/profile.md` — a hobbyist who codes HTML/CSS/Python, reading to broaden exposure to the field. Casual, informative tone. **No hype language.**
   >
   > **Mood:** dark theme, readable typography, calm — closer to a personal reading newsletter than a news portal.
   >
   > **Information impact** — every item has these signals; please find a visual treatment for each that's clear without being loud:
   > - Tier (1/2/3) — most → least important
   > - Region badge — when not US/Global, surface lightly
   > - "Updated overnight" marker — `enriched_overnight: true` items
   > - "↑ promoted from morning" marker — `promoted_from_am: true` items in pm files
   > - Multi-take indicator — items with `takes.length >= 2` need a "Details →" affordance to the deep-link sub-page
   > - Hero image — present ~70% of the time, must look fine when missing
   > - Source name + link
   > - Stale-page banner at top when applicable; cycle-based label banners during the in-between windows
   > - Footer "last refresh X ago"
   >
   > **Page regions:**
   > - Cycle-based two-section layout (top + bottom + optional banner) — see SPEC §4
   > - Sub-page deep-link view (`#item-<id>`) for items with multiple takes
   > - Archive disclosure below the two-section layout
   >
   > **Constraints:** static GitHub Pages — no build step, no server, no framework. Vanilla HTML/CSS + a small JS module that fetches JSON. Mobile-responsive.
   >
   > Please produce a polished `index.html` that I can drop in to replace the placeholder. Use real snapshot data from `data/` to validate edge cases as you design.

3. **Reader profile re-paste** (also at `agent/profile.md`):
   - HTML/CSS/Python hobbyist
   - Goal: broaden exposure outside that stack — Tauri, React, Rust, Docker, etc.
   - Hates hype language and corporate marketing tone
   - Will read once or twice a day on desktop, occasionally on mobile

### What Claude Design produces

A standalone `index.html` (Claude Design supports HTML export). CSS inline or as a `style.css` sibling — either is fine for GitHub Pages.

### Integration step

1. Take the Claude Design output, drop it in as `index.html` in a branch first
2. Verify it correctly fetches `data/index.json` + snapshots and renders all cycle states (use a `?now=YYYY-MM-DDTHH:MM` query-string time override for testing the in-between windows without waiting)
3. Test real snapshot data — check edge cases (missing hero, 0 items in a tier, paused state, stale state, multi-take sub-page deep link)
4. Push to `main` → GitHub Pages serves it
5. Bump `schema_version` in `data/index.json` if data consumption changes

### Future Claude Design sessions

The design is living — minor refreshes when data shape evolves. Any new field added to the schema later should:
- Be backward-compatible (page works without it on old snapshots)
- Get a Claude Design pass if it has visual significance
- Be noted in `GOALS.md` until the design pass happens

---

## Appendix A — Source seed list

The full scrape-feasible source seed list lives in `agent/sources.json` (structured JSON) and is derived from the operator-curated markdown table compiled in collaboration with another Claude session. Categories covered:

- **YouTube — Technical / Tutorials / Engineering** (Karpathy, Yannic Kilcher, Two Minute Papers, 3Blue1Brown, Sebastian Raschka, Jeremy Howard, AI Coffee Break, Umar Jamil, Aleksa Gordić, Edan Meyer)
- **YouTube — News / Industry / Commentary** (AI Explained, Wes Roth, Matthew Berman, Matt Wolfe, TheAIGRID, Sabine Hossenfelder, Computerphile, Robert Miles, Dwarkesh, Lex Fridman, No Priors, Latent Space)
- **YouTube — Builders / Applied AI / Agents** (David Ondrej, AI Jason, 1littlecoder, Sam Witteveen, James Briggs, Greg Kamradt, Riley Brown, Indy Dev Dan, AI Engineer, Cole Medin, ThePrimeagen, Theo, George Hotz)
- **Newsletters / Substacks / Blogs** (Import AI, The Batch, Latent Space, Ahead of AI, Interconnects, One Useful Thing, AI Snake Oil, Last Week in AI, The Rundown, TLDR AI, Zvi, Chip Huyen, Eugene Yan, Hamel Husain, Lilian Weng, Simon Willison, Jay Alammar, Sebastian Raschka personal, Karpathy blog, Anthropic Engineering, Hugging Face, OpenAI, DeepMind)
- **Podcasts** (Dwarkesh, Latent Space, No Priors, Cognitive Revolution, Last Week in AI, ML Street Talk, The Gradient, Practical AI, TWIML, Doom Debates)
- **Lab/Org blogs** (Anthropic News, OpenAI, DeepMind, Meta AI, Hugging Face, Mistral, Cohere, LangChain, LlamaIndex, W&B, Scale AI, Surge AI)
- **Conference channels** (AI Engineer, NeurIPS, ICML, ICLR, MLSys)

**Explicitly out of scope:** Twitter/X, Instagram, TikTok, Twitch live (login walls, anti-bot, no clean RSS path). Long-form YouTube and blog content from creators who are also active on those platforms captures the substantive ideas with a few-day lag — acceptable trade-off.

**YouTube channel-ID resolution:** fetch the `@handle` URL, parse for `"channelId":"UC..."`, cache the mapping. Then `https://www.youtube.com/feeds/videos.xml?channel_id=UC...` returns last 15 videos with metadata, no auth.

**RSS fallback chain:** for each blog, try in order: `/feed`, `/rss`, `/feed.xml`, `/index.xml`, `/atom.xml`, `/rss.xml`. ~90% hit rate.

**Sites without RSS** (OpenAI, Anthropic News, DeepMind, etc.) need headless browser scraping. Their post-list pages are server-rendered enough that Playwright (or equivalent) with `waitUntil: 'networkidle'` plus a CSS selector for post cards is sufficient. Cache aggressively — these update slowly.

**Substack quirk:** all Substack-hosted sites support `/feed` reliably; one parser handles the whole substack tier.

**Cross-platform dedup:** key entries by canonical content URL (when a creator's newsletter + podcast + YouTube cover the same story, fold into one item with `takes[]`).

---

## Appendix B — Open questions / explicit non-decisions

These were considered during design and explicitly deferred:

- **Notification mechanism** — email/SMS/Slack on run failures or Tier-1 events. Logged in `GOALS.md`.
- **Read-state per user** — explicitly rejected; would require persistent client state without a backend. Replaced by stateless `enriched_overnight` and `promoted_from_am` markers.
- **Repo size growth from snapshot files** — accepted (~7 MB/year). Keep all archives forever.
- **Hero image mirroring** — explicitly rejected. Hot-link only. Some images will eventually 404; page handles gracefully.
- **Token model selection** — currently Opus 4.7 (1M) for digest + enrichment, Sonnet 4.6 for refresh. Will be re-evaluated after first week of real run data.

---

*End of spec.*
