# AI News Agent — Plan 1: Scaffolding & Static Page

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the repo's foundational structure (config files, data schema bootstrap files, source seed list as JSON) and a working placeholder `index.html` that fetches JSON snapshots and renders them according to the cycle-based layout rules in the spec. Output: a static GitHub Pages site that renders fixture data correctly under every cycle window, ready for the agent (Plan 2) to write real snapshots into.

**Architecture:** Static GitHub Pages site, no build step. Vanilla HTML + a small ES-module JS stack (`js/cycle.js` for time-window logic, `js/app.js` for orchestration + rendering). Cycle-selection logic is a pure function with full unit-test coverage via Node's built-in test runner. End-to-end verification is a manual checklist using fixture JSON in `tests/fixtures/data/` plus a `?now=` query-string time override.

**Tech Stack:** HTML5, CSS3 (inline in `index.html` for placeholder), vanilla ES modules, Node.js built-in test runner (`node --test`), GitHub Pages, `gh` CLI.

**Spec source of truth:** [docs/superpowers/specs/2026-05-04-ai-news-agent-design.md](../specs/2026-05-04-ai-news-agent-design.md)

---

## File Structure

**Created in this plan:**

```
ai-news/
├── GOALS.md                           # Future-scope ideas (operator notes)
├── agent/
│   ├── profile.md                     # Reader profile
│   ├── sources.json                   # Structured seed source list
│   └── control.json                   # Kill switch / phase enable flags
├── data/
│   ├── index.json                     # Manifest (initially empty)
│   └── runs.json                      # Run log (initially empty)
├── js/
│   ├── cycle.js                       # Pure time-window → snapshot picker
│   └── app.js                         # Page orchestration + DOM rendering
├── tests/
│   ├── cycle.test.js                  # Unit tests for cycle.js
│   └── fixtures/
│       └── data/
│           ├── index.json             # Fixture manifest
│           ├── runs.json              # Fixture run log
│           ├── 2026-05-03-pm.json     # Fixture: full pm snapshot
│           ├── 2026-05-04-am.json     # Fixture: am with overnight items
│           └── 2026-05-04-pm.json     # Fixture: pm with promoted item
└── package.json                       # Just for `npm test` script — no deps
```

**Modified in this plan:**

```
ai-news/
├── index.html                         # Replace placeholder with rendering version
├── README.md                          # Update setup/dev notes
└── .gitignore                         # Add node_modules even though we have no deps
```

**Each file's responsibility:**
- `agent/profile.md` — read by the agent (Plan 2); never read by the page
- `agent/sources.json` — read by the agent (Plan 2); never read by the page
- `agent/control.json` — read by the agent at every run, AND by the page (paused banner)
- `data/index.json` — manifest, read by the page on every load to know what snapshots exist
- `data/runs.json` — run log, read by the page for footer timestamp + stale banner
- `data/YYYY-MM-DD-{am,pm}.json` — snapshot files, written by the agent, read by the page on demand
- `js/cycle.js` — pure logic: given `now` (Date) + manifest, return `{topId, bottomId, banner}`
- `js/app.js` — fetches manifest, picks snapshots via cycle.js, fetches them, renders DOM
- `index.html` — page skeleton + inline placeholder CSS (replaced by Claude Design later)

---

## Task 1: Repo scaffolding — agent config files

**Files:**
- Create: `agent/profile.md`
- Create: `agent/control.json`
- Create: `GOALS.md`

- [ ] **Step 1: Create `agent/profile.md`**

```markdown
# Reader Profile

Audience: Gabe, a hobbyist coder who writes HTML, CSS, and Python.

Goal: broaden exposure outside that stack — wants to see things from React, Rust, Tauri, Docker, Go, and other ecosystems. Don't filter recommendations for "safe for a beginner." The point is broadening, not protecting.

Tone: casual, informative, slightly dry. Knowledgeable-friend-at-a-coffee-shop register. **No hype language.** Banned words include "revolutionary," "game-changing," "groundbreaking," "stunning," "incredible," "next-level." No corporate marketing voice.

When writing `why_it_matters` tags for items, connect the item to something concrete — what would Gabe learn, why is it notable, in plain English. Tie back to his HTML/CSS/Python stack when natural; don't force it.
```

- [ ] **Step 2: Create `agent/control.json`**

```json
{
  "paused": false,
  "paused_reason": null,
  "paused_until": null,
  "phases": {
    "digest": { "enabled": true },
    "enrichment": { "enabled": true },
    "refresh": { "enabled": true }
  }
}
```

- [ ] **Step 3: Create `GOALS.md`**

```markdown
# Goals — future-scope ideas

Running list of ideas deliberately not in v1. The agent never reads this file — it's purely operator notes.

## Notifications
Email/SMS/Slack ping when:
- A run fails twice in a row
- A Tier-1 model release is detected
Implementation idea: a 4th scheduled task that watches `data/runs.json`.

## Search across archive
Needs a build step or a small client-side search index (e.g., lunr.js).

## Tier/region filtering on the page
Toggle pills at the top of the layout to hide certain tiers or regions.

## Cost dashboard
Small page that reads `data/runs.json` and graphs token usage over time.

## Smarter source rotation
RSS feeds we've never gotten an item from in 30 days get demoted to weekly check.

## Mobile-only layout polish
Separate from Claude Design's responsive work — post-launch tuning.
```

- [ ] **Step 4: Verify files exist**

Run: `ls agent/profile.md agent/control.json GOALS.md`
Expected: all three paths printed, no errors.

- [ ] **Step 5: Commit**

```bash
git add agent/profile.md agent/control.json GOALS.md
git commit -m "feat: add reader profile, control file, and GOALS.md"
```

---

## Task 2: Initial empty data files

**Files:**
- Create: `data/index.json`
- Create: `data/runs.json`
- Create: `data/.gitkeep`

- [ ] **Step 1: Create `data/index.json`** with empty snapshot list

```json
{
  "schema_version": 1,
  "generated_at": null,
  "snapshots": []
}
```

- [ ] **Step 2: Create `data/runs.json`** with empty run list

```json
{
  "runs": []
}
```

- [ ] **Step 3: Create `data/.gitkeep`** (empty file — keeps the dir tracked even when no snapshots exist yet)

```bash
touch data/.gitkeep
```

- [ ] **Step 4: Verify files**

Run: `ls data/`
Expected: `.gitkeep  index.json  runs.json`

Run: `cat data/index.json | python -m json.tool`
Expected: prints valid JSON with empty `snapshots` array.

Run: `cat data/runs.json | python -m json.tool`
Expected: prints valid JSON with empty `runs` array.

- [ ] **Step 5: Commit**

```bash
git add data/
git commit -m "feat: add initial empty manifest and run log"
```

---

## Task 3: Convert source seed list to `agent/sources.json`

**Files:**
- Create: `agent/sources.json`

This task encodes the entire scrape-feasible source list into structured JSON. Each source has `name`, `url`, an `access` field (`rss` | `scrape` | `youtube` | `web-search`), an optional `rss_url` (for `rss` and `youtube` types), an optional `category`, and `notes`.

- [ ] **Step 1: Create `agent/sources.json`** with the full structured seed list

```json
{
  "schema_version": 1,
  "tiers": {
    "tier_1_focus": ["model_releases", "lab_announcements"],
    "tier_2_focus": ["tools", "libraries", "frameworks"],
    "tier_3_focus": ["product_launches"]
  },
  "out_of_scope_platforms": ["twitter_x", "instagram", "tiktok", "twitch_live"],
  "out_of_scope_reason": "Login walls, anti-bot, no clean RSS path. Long-form content from these creators captured via their YouTube + blogs with a few-day lag.",
  "youtube": {
    "technical": [
      { "name": "Andrej Karpathy", "url": "https://www.youtube.com/@AndrejKarpathy", "access": "youtube", "channel_id": null, "notes": "Foundational tutorials, nanoGPT, from-scratch series" },
      { "name": "Yannic Kilcher", "url": "https://www.youtube.com/@YannicKilcher", "access": "youtube", "channel_id": null, "notes": "Paper breakdowns, ML research" },
      { "name": "Two Minute Papers", "url": "https://www.youtube.com/@TwoMinutePapers", "access": "youtube", "channel_id": null, "notes": "Research highlights" },
      { "name": "3Blue1Brown", "url": "https://www.youtube.com/@3blue1brown", "access": "youtube", "channel_id": null, "notes": "Neural nets / transformers explainers" },
      { "name": "Sebastian Raschka", "url": "https://www.youtube.com/@SebastianRaschka", "access": "youtube", "channel_id": null, "notes": "LLM tutorials" },
      { "name": "Jeremy Howard / fast.ai", "url": "https://www.youtube.com/@howardjeremyp", "access": "youtube", "channel_id": null, "notes": "Practical deep learning" },
      { "name": "AI Coffee Break with Letitia", "url": "https://www.youtube.com/@AICoffeeBreak", "access": "youtube", "channel_id": null, "notes": "Paper explainers" },
      { "name": "Umar Jamil", "url": "https://www.youtube.com/@umarjamilai", "access": "youtube", "channel_id": null, "notes": "Implementation walkthroughs" },
      { "name": "Aleksa Gordić — The AI Epiphany", "url": "https://www.youtube.com/@TheAIEpiphany", "access": "youtube", "channel_id": null, "notes": "Paper deep dives" },
      { "name": "Edan Meyer", "url": "https://www.youtube.com/@EdanMeyer", "access": "youtube", "channel_id": null, "notes": "RL and ML research" }
    ],
    "news_industry": [
      { "name": "AI Explained", "url": "https://www.youtube.com/@aiexplained-official", "access": "youtube", "channel_id": null, "notes": "High-quality news + benchmark analysis" },
      { "name": "Wes Roth", "url": "https://www.youtube.com/@WesRoth", "access": "youtube", "channel_id": null, "notes": "Daily-ish frontier lab tracking" },
      { "name": "Matthew Berman", "url": "https://www.youtube.com/@matthew_berman", "access": "youtube", "channel_id": null, "notes": "Hands-on model testing" },
      { "name": "Matt Wolfe", "url": "https://www.youtube.com/@mreflow", "access": "youtube", "channel_id": null, "notes": "Weekly news roundup" },
      { "name": "TheAIGRID", "url": "https://www.youtube.com/@TheAiGrid", "access": "youtube", "channel_id": null, "notes": "News and breakdowns" },
      { "name": "Sabine Hossenfelder", "url": "https://www.youtube.com/@SabineHossenfelder", "access": "youtube", "channel_id": null, "notes": "Critical AI takes alongside science" },
      { "name": "Computerphile", "url": "https://www.youtube.com/@Computerphile", "access": "youtube", "channel_id": null, "notes": "Long-running CS, regular AI segments" },
      { "name": "Robert Miles AI Safety", "url": "https://www.youtube.com/@RobertMilesAI", "access": "youtube", "channel_id": null, "notes": "Alignment, accessible but rigorous" },
      { "name": "Dwarkesh Patel", "url": "https://www.youtube.com/@DwarkeshPatel", "access": "youtube", "channel_id": null, "notes": "Long-form interviews" },
      { "name": "Lex Fridman", "url": "https://www.youtube.com/@lexfridman", "access": "youtube", "channel_id": null, "notes": "Interviews" },
      { "name": "No Priors", "url": "https://www.youtube.com/@NoPriorsPodcast", "access": "youtube", "channel_id": null, "notes": "Founder/researcher interviews" },
      { "name": "Latent Space", "url": "https://www.youtube.com/@LatentSpacePod", "access": "youtube", "channel_id": null, "notes": "Engineer-focused" }
    ],
    "builders_applied": [
      { "name": "David Ondrej", "url": "https://www.youtube.com/@DavidOndrej", "access": "youtube", "channel_id": null, "notes": "Agent building" },
      { "name": "AI Jason", "url": "https://www.youtube.com/@AIJasonZ", "access": "youtube", "channel_id": null, "notes": "Practical agent tutorials" },
      { "name": "1littlecoder", "url": "https://www.youtube.com/@1littlecoder", "access": "youtube", "channel_id": null, "notes": "Open-source model demos" },
      { "name": "Sam Witteveen", "url": "https://www.youtube.com/@samwitteveenai", "access": "youtube", "channel_id": null, "notes": "LangChain, agents, RAG" },
      { "name": "James Briggs", "url": "https://www.youtube.com/@jamesbriggs", "access": "youtube", "channel_id": null, "notes": "Vector DBs, RAG, embeddings" },
      { "name": "Greg Kamradt", "url": "https://www.youtube.com/@DataIndependent", "access": "youtube", "channel_id": null, "notes": "LLM engineering, evals" },
      { "name": "Riley Brown", "url": "https://www.youtube.com/@rileybrownai", "access": "youtube", "channel_id": null, "notes": "Vibe coding, Cursor" },
      { "name": "Indy Dev Dan", "url": "https://www.youtube.com/@indydevdan", "access": "youtube", "channel_id": null, "notes": "Claude Code, Aider, agentic dev" },
      { "name": "AI Engineer", "url": "https://www.youtube.com/@aiDotEngineer", "access": "youtube", "channel_id": null, "notes": "Conference talks" },
      { "name": "Cole Medin", "url": "https://www.youtube.com/@ColeMedin", "access": "youtube", "channel_id": null, "notes": "n8n agents, RAG systems" },
      { "name": "ThePrimeagen", "url": "https://www.youtube.com/@ThePrimeagen", "access": "youtube", "channel_id": null, "notes": "Coding/AI dev tools" },
      { "name": "Theo - t3.gg", "url": "https://www.youtube.com/@t3dotgg", "access": "youtube", "channel_id": null, "notes": "AI coding tools coverage" },
      { "name": "George Hotz / tinygrad", "url": "https://www.youtube.com/@geohotarchive", "access": "youtube", "channel_id": null, "notes": "tinygrad, ML systems streams" }
    ]
  },
  "blogs": [
    { "name": "Import AI (Jack Clark)", "url": "https://importai.substack.com/", "rss_url": "https://importai.substack.com/feed", "access": "rss" },
    { "name": "The Batch (DeepLearning.AI)", "url": "https://www.deeplearning.ai/the-batch/", "rss_url": "https://www.deeplearning.ai/the-batch/rss/", "access": "rss" },
    { "name": "Latent Space", "url": "https://www.latent.space/", "rss_url": "https://www.latent.space/feed", "access": "rss" },
    { "name": "Ahead of AI (Sebastian Raschka)", "url": "https://magazine.sebastianraschka.com/", "rss_url": "https://magazine.sebastianraschka.com/feed", "access": "rss" },
    { "name": "Interconnects (Nathan Lambert)", "url": "https://www.interconnects.ai/", "rss_url": "https://www.interconnects.ai/feed", "access": "rss" },
    { "name": "One Useful Thing (Ethan Mollick)", "url": "https://www.oneusefulthing.org/", "rss_url": "https://www.oneusefulthing.org/feed", "access": "rss" },
    { "name": "AI Snake Oil", "url": "https://www.aisnakeoil.com/", "rss_url": "https://www.aisnakeoil.com/feed", "access": "rss" },
    { "name": "Last Week in AI", "url": "https://lastweekin.ai/", "rss_url": "https://lastweekin.ai/feed", "access": "rss" },
    { "name": "The Rundown AI", "url": "https://www.therundown.ai/", "rss_url": null, "access": "scrape" },
    { "name": "TLDR AI", "url": "https://tldr.tech/ai", "rss_url": null, "access": "scrape" },
    { "name": "Don't Worry About the Vase (Zvi)", "url": "https://thezvi.substack.com/", "rss_url": "https://thezvi.substack.com/feed", "access": "rss" },
    { "name": "Chip Huyen", "url": "https://huyenchip.com/blog/", "rss_url": "https://huyenchip.com/feed.xml", "access": "rss" },
    { "name": "Eugene Yan", "url": "https://eugeneyan.com/", "rss_url": "https://eugeneyan.com/rss/", "access": "rss" },
    { "name": "Hamel Husain", "url": "https://hamel.dev/", "rss_url": "https://hamel.dev/index.xml", "access": "rss" },
    { "name": "Lilian Weng", "url": "https://lilianweng.github.io/", "rss_url": "https://lilianweng.github.io/index.xml", "access": "rss" },
    { "name": "Simon Willison", "url": "https://simonwillison.net/", "rss_url": "https://simonwillison.net/atom/everything/", "access": "rss" },
    { "name": "Jay Alammar", "url": "https://jalammar.github.io/", "rss_url": "https://jalammar.github.io/feed.xml", "access": "rss" },
    { "name": "Sebastian Raschka (personal)", "url": "https://sebastianraschka.com/blog/", "rss_url": "https://sebastianraschka.com/rss_feed.xml", "access": "rss" },
    { "name": "Andrej Karpathy", "url": "https://karpathy.github.io/", "rss_url": "https://karpathy.github.io/feed.xml", "access": "rss" },
    { "name": "Anthropic Engineering", "url": "https://www.anthropic.com/engineering", "rss_url": null, "access": "scrape" },
    { "name": "Hugging Face Blog", "url": "https://huggingface.co/blog", "rss_url": "https://huggingface.co/blog/feed.xml", "access": "rss" },
    { "name": "OpenAI Blog", "url": "https://openai.com/blog", "rss_url": null, "access": "scrape" },
    { "name": "Google DeepMind Blog", "url": "https://deepmind.google/discover/blog/", "rss_url": null, "access": "scrape" }
  ],
  "podcasts": [
    { "name": "Dwarkesh Podcast", "url": "https://www.dwarkeshpatel.com/", "rss_url": "https://api.substack.com/feed/podcast/68003.rss", "access": "rss" },
    { "name": "Latent Space Podcast", "url": "https://www.latent.space/podcast", "rss_url": "https://api.substack.com/feed/podcast/1084089.rss", "access": "rss" },
    { "name": "No Priors", "url": "https://www.no-priors.com/", "rss_url": null, "access": "scrape", "notes": "Find via listennotes" },
    { "name": "The Cognitive Revolution", "url": "https://www.cognitiverevolution.ai/", "rss_url": null, "access": "scrape", "notes": "Find via listennotes" },
    { "name": "Last Week in AI Podcast", "url": "https://lastweekin.ai/", "rss_url": "https://lastweekin.ai/feed", "access": "rss" },
    { "name": "The Gradient Podcast", "url": "https://thegradientpub.substack.com/", "rss_url": "https://thegradientpub.substack.com/feed", "access": "rss" },
    { "name": "Practical AI", "url": "https://changelog.com/practicalai", "rss_url": "https://changelog.com/practicalai/feed", "access": "rss" },
    { "name": "TWIML AI Podcast", "url": "https://twimlai.com/podcast/", "rss_url": "https://feeds.megaphone.fm/MLN2155636147", "access": "rss" },
    { "name": "Doom Debates", "url": "https://doomdebates.com/", "rss_url": null, "access": "scrape", "notes": "Find via listennotes" }
  ],
  "labs": [
    { "name": "Anthropic News", "url": "https://www.anthropic.com/news", "rss_url": null, "access": "scrape" },
    { "name": "OpenAI Blog", "url": "https://openai.com/blog", "rss_url": null, "access": "scrape" },
    { "name": "Google DeepMind", "url": "https://deepmind.google/discover/blog/", "rss_url": null, "access": "scrape" },
    { "name": "Meta AI Research", "url": "https://ai.meta.com/blog/", "rss_url": null, "access": "scrape" },
    { "name": "Hugging Face Blog", "url": "https://huggingface.co/blog", "rss_url": "https://huggingface.co/blog/feed.xml", "access": "rss" },
    { "name": "Mistral News", "url": "https://mistral.ai/news", "rss_url": null, "access": "scrape" },
    { "name": "Cohere Blog", "url": "https://cohere.com/blog", "rss_url": null, "access": "scrape" },
    { "name": "LangChain Blog", "url": "https://blog.langchain.dev/", "rss_url": "https://blog.langchain.dev/rss/", "access": "rss" },
    { "name": "LlamaIndex Blog", "url": "https://www.llamaindex.ai/blog", "rss_url": null, "access": "scrape" },
    { "name": "Weights & Biases", "url": "https://wandb.ai/fully-connected", "rss_url": null, "access": "scrape" },
    { "name": "Scale AI Blog", "url": "https://scale.com/blog", "rss_url": null, "access": "scrape" },
    { "name": "Surge AI Blog", "url": "https://www.surgehq.ai/blog", "rss_url": null, "access": "scrape" }
  ],
  "conferences": [
    { "name": "AI Engineer", "url": "https://www.youtube.com/@aiDotEngineer", "access": "youtube", "channel_id": null },
    { "name": "NeurIPS", "url": "https://www.youtube.com/@NeurIPSConference", "access": "youtube", "channel_id": null },
    { "name": "ICML", "url": "https://www.youtube.com/@ICMLConf", "access": "youtube", "channel_id": null },
    { "name": "ICLR", "url": "https://www.youtube.com/@ICLRConference", "access": "youtube", "channel_id": null },
    { "name": "MLSys", "url": "https://www.youtube.com/@MLSysConf", "access": "youtube", "channel_id": null }
  ]
}
```

- [ ] **Step 2: Validate JSON parses**

Run: `cat agent/sources.json | python -m json.tool > /dev/null && echo "VALID JSON"`
Expected: prints `VALID JSON`. If it errors out, the file has a syntax issue — fix and re-run.

- [ ] **Step 3: Spot-check counts**

Run: `python -c "import json; d = json.load(open('agent/sources.json')); print('youtube_total:', sum(len(v) for v in d['youtube'].values())); print('blogs:', len(d['blogs'])); print('podcasts:', len(d['podcasts'])); print('labs:', len(d['labs'])); print('conferences:', len(d['conferences']))"`

Expected output (approximate, from the spec's seed list):
```
youtube_total: 35
blogs: 23
podcasts: 9
labs: 12
conferences: 5
```

The exact counts may vary slightly if duplicate entries were collapsed; flag if any category is empty.

- [ ] **Step 4: Commit**

```bash
git add agent/sources.json
git commit -m "feat: add structured source seed list"
```

---

## Task 4: Test fixtures — sample snapshot files

**Files:**
- Create: `tests/fixtures/data/index.json`
- Create: `tests/fixtures/data/runs.json`
- Create: `tests/fixtures/data/2026-05-03-pm.json`
- Create: `tests/fixtures/data/2026-05-04-am.json`
- Create: `tests/fixtures/data/2026-05-04-pm.json`

These fixtures cover all the edge cases the page must handle: an item without `hero_image`, an item with `takes.length >= 2`, an item with `promoted_from_am: true`, multiple tiers, regional badges, and a previous-day pm so the cycle picker has something to choose between.

- [ ] **Step 1: Create `tests/fixtures/data/index.json`**

```json
{
  "schema_version": 1,
  "generated_at": "2026-05-04T17:01:00Z",
  "snapshots": [
    { "id": "2026-05-04-pm", "type": "pm", "calendar_date": "2026-05-04", "file": "tests/fixtures/data/2026-05-04-pm.json", "tier_counts": {"1":2,"2":2,"3":1}, "item_count": 5 },
    { "id": "2026-05-04-am", "type": "am", "calendar_date": "2026-05-04", "file": "tests/fixtures/data/2026-05-04-am.json", "tier_counts": {"1":1,"2":2,"3":1}, "item_count": 4 },
    { "id": "2026-05-03-pm", "type": "pm", "calendar_date": "2026-05-03", "file": "tests/fixtures/data/2026-05-03-pm.json", "tier_counts": {"1":2,"2":2,"3":1}, "item_count": 5 }
  ]
}
```

- [ ] **Step 2: Create `tests/fixtures/data/runs.json`**

```json
{
  "runs": [
    {
      "run_id": "2026-05-04T17:00:00Z-digest",
      "phase": "digest",
      "status": "success",
      "started_at": "2026-05-04T17:00:00Z",
      "ended_at": "2026-05-04T17:08:42Z",
      "wall_time_ms": 522000,
      "tokens_used": 78440,
      "tokens_breakdown": {"rss_sweep": 4200, "scrape_sweep": 8800, "tier_ranking": 3100, "deep_fetch": 51000, "discovery_search": 4500, "curation": 6800, "output_write": 40},
      "fetches_made": 38,
      "items_input": 102,
      "items_output": 5,
      "snapshot_written": "2026-05-04-pm",
      "error": null,
      "partial": false
    },
    {
      "run_id": "2026-05-04T11:00:00Z-refresh",
      "phase": "refresh",
      "status": "success",
      "started_at": "2026-05-04T11:00:00Z",
      "ended_at": "2026-05-04T11:03:11Z",
      "wall_time_ms": 191000,
      "tokens_used": 41812,
      "tokens_breakdown": {"rss_sweep": 4200, "scrape_sweep": 8800, "tier_ranking": 3100, "deep_fetch": 19000, "discovery_search": 4500, "curation": 2200, "output_write": 12},
      "fetches_made": 18,
      "items_input": 47,
      "items_output": 4,
      "snapshot_written": "2026-05-04-am",
      "error": null,
      "partial": false
    }
  ]
}
```

- [ ] **Step 3: Create `tests/fixtures/data/2026-05-03-pm.json`**

```json
{
  "snapshot_id": "2026-05-03-pm",
  "snapshot_type": "pm",
  "calendar_date": "2026-05-03",
  "generated_at": "2026-05-03T17:02:00Z",
  "generated_at_local": "2026-05-03T13:02:00-04:00",
  "phase_history": [{"phase": "digest", "ran_at": "2026-05-03T17:02:00Z", "duration_ms": 480000}],
  "tier_counts": {"1": 2, "2": 2, "3": 1},
  "items": [
    {
      "id": "openai-gpt-5-rumor",
      "tier": 1,
      "title": "OpenAI hints at GPT-5 release window in upcoming earnings call",
      "summary": "OpenAI's CFO suggested in a conference appearance that the next-generation flagship is targeted for Q3 — earlier than analysts expected.",
      "link": "https://example.com/openai-gpt5-rumor",
      "why_it_matters": "Shorter release cycles mean the API patterns you write today may need adjusting more often. Worth watching for breaking changes in the Python SDK.",
      "source": {"name": "TechCrunch", "type": "scrape", "url": "https://techcrunch.com"},
      "region": "US",
      "hero_image": {"url": "https://example.com/og-openai.jpg", "alt": "OpenAI logo banner", "source": "og:image"},
      "added_at": "2026-05-03T17:02:00Z",
      "added_by": "digest",
      "last_revision_by": "digest",
      "enriched_overnight": false,
      "promoted_from_am": false,
      "revisions": [{"at": "2026-05-03T17:02:00Z", "by": "digest", "change": "created"}],
      "takes": []
    },
    {
      "id": "tauri-2-1-release",
      "tier": 2,
      "title": "Tauri 2.1 ships with smaller binary footprint",
      "summary": "Tauri 2.1 reduces minimum binary size by 18% via tree-shaking improvements and a leaner default WebView shim.",
      "link": "https://example.com/tauri-2-1",
      "why_it_matters": "If you've been curious about shipping a desktop app from web tech, Tauri is the sane Rust-backed alternative to Electron — smaller binaries make the on-ramp friendlier.",
      "source": {"name": "Tauri Blog", "type": "rss", "url": "https://tauri.app/blog"},
      "region": "Global",
      "hero_image": null,
      "added_at": "2026-05-03T17:02:00Z",
      "added_by": "digest",
      "last_revision_by": "digest",
      "enriched_overnight": false,
      "promoted_from_am": false,
      "revisions": [{"at": "2026-05-03T17:02:00Z", "by": "digest", "change": "created"}],
      "takes": []
    },
    {
      "id": "anthropic-claude-opus-4-7",
      "tier": 1,
      "title": "Anthropic ships Claude Opus 4.7 with 1M context window",
      "summary": "Claude Opus 4.7 expands the context window to 1M tokens for the API and Claude apps. Early benchmark numbers show stronger long-context retrieval and a price drop on cached input.",
      "link": "https://www.anthropic.com/news/claude-opus-4-7",
      "why_it_matters": "1M context means dropping a full codebase or a long book in one shot is now practical. Relevant if you ever try to use it on your own multi-file Python projects.",
      "source": {"name": "Anthropic News", "type": "scrape", "url": "https://www.anthropic.com/news"},
      "region": "US",
      "hero_image": {"url": "https://example.com/og-claude-4-7.jpg", "alt": "Anthropic Claude Opus 4.7 announcement banner", "source": "og:image"},
      "added_at": "2026-05-03T17:02:00Z",
      "added_by": "digest",
      "last_revision_by": "digest",
      "enriched_overnight": false,
      "promoted_from_am": false,
      "revisions": [{"at": "2026-05-03T17:02:00Z", "by": "digest", "change": "created"}],
      "takes": [
        {"source": "Simon Willison", "url": "https://simonwillison.net/2026/May/3/claude-opus-4-7/", "take": "Notes the throughput numbers and a real-world long-context retrieval test."},
        {"source": "Hacker News", "url": "https://news.ycombinator.com/item?id=12345", "take": "Top comment is mostly skepticism on price-vs-capability vs. competitors."}
      ]
    },
    {
      "id": "deepseek-r2-open-weights",
      "tier": 2,
      "title": "DeepSeek R2 open-weights release lands on Hugging Face",
      "summary": "DeepSeek pushed the R2 model weights to Hugging Face under an MIT-style license. Includes both base and instruct variants.",
      "link": "https://example.com/deepseek-r2",
      "why_it_matters": "Open-weights models you can run locally are the closest thing to building a model on your own laptop without renting GPUs. Worth a look even if you don't have the hardware to run it.",
      "source": {"name": "Hugging Face Blog", "type": "rss", "url": "https://huggingface.co/blog"},
      "region": "Asia",
      "hero_image": null,
      "added_at": "2026-05-03T17:02:00Z",
      "added_by": "digest",
      "last_revision_by": "digest",
      "enriched_overnight": false,
      "promoted_from_am": false,
      "revisions": [{"at": "2026-05-03T17:02:00Z", "by": "digest", "change": "created"}],
      "takes": []
    },
    {
      "id": "github-copilot-spaces",
      "tier": 3,
      "title": "GitHub Copilot adds Spaces — shareable contexts for repos",
      "summary": "GitHub launched Copilot Spaces — bundles of files, docs, and notes that an AI assistant can pin to as a long-running context.",
      "link": "https://example.com/copilot-spaces",
      "why_it_matters": "If you eventually want a persistent assistant that knows your project without re-explaining it every time, this is one shape of how that gets productized.",
      "source": {"name": "GitHub Blog", "type": "scrape", "url": "https://github.blog"},
      "region": "US",
      "hero_image": {"url": "https://example.com/og-copilot-spaces.jpg", "alt": "GitHub Copilot Spaces feature graphic", "source": "og:image"},
      "added_at": "2026-05-03T17:02:00Z",
      "added_by": "digest",
      "last_revision_by": "digest",
      "enriched_overnight": false,
      "promoted_from_am": false,
      "revisions": [{"at": "2026-05-03T17:02:00Z", "by": "digest", "change": "created"}],
      "takes": []
    }
  ],
  "dropped_in_phase": []
}
```

- [ ] **Step 4: Create `tests/fixtures/data/2026-05-04-am.json`** (yesterday's pm enriched + 2 new items)

```json
{
  "snapshot_id": "2026-05-04-am",
  "snapshot_type": "am",
  "calendar_date": "2026-05-04",
  "generated_at": "2026-05-04T11:03:11Z",
  "generated_at_local": "2026-05-04T07:03:11-04:00",
  "phase_history": [
    {"phase": "enrichment", "ran_at": "2026-05-04T06:01:00Z", "duration_ms": 240000},
    {"phase": "refresh", "ran_at": "2026-05-04T11:00:00Z", "duration_ms": 191000}
  ],
  "tier_counts": {"1": 1, "2": 2, "3": 1},
  "items": [
    {
      "id": "anthropic-claude-opus-4-7",
      "tier": 1,
      "title": "Anthropic ships Claude Opus 4.7 with 1M context window",
      "summary": "Claude Opus 4.7 expands the context window to 1M tokens. Overnight: independent benchmark numbers (LongBench, RULER) confirm strong retrieval at 800K+ tokens; pricing drops 15% on cached input vs. 4.6.",
      "link": "https://www.anthropic.com/news/claude-opus-4-7",
      "why_it_matters": "1M context means dropping a full codebase or a long book in one shot is now practical. Cached pricing makes long-context patterns affordable enough to actually try in your Python projects.",
      "source": {"name": "Anthropic News", "type": "scrape", "url": "https://www.anthropic.com/news"},
      "region": "US",
      "hero_image": {"url": "https://example.com/og-claude-4-7.jpg", "alt": "Anthropic Claude Opus 4.7 announcement banner", "source": "og:image"},
      "added_at": "2026-05-03T17:02:00Z",
      "added_by": "digest",
      "last_revision_by": "enrichment",
      "enriched_overnight": true,
      "promoted_from_am": false,
      "revisions": [
        {"at": "2026-05-03T17:02:00Z", "by": "digest", "change": "created"},
        {"at": "2026-05-04T06:01:00Z", "by": "enrichment", "change": "added independent benchmark context + pricing detail"}
      ],
      "takes": [
        {"source": "Simon Willison", "url": "https://simonwillison.net/2026/May/3/claude-opus-4-7/", "take": "Notes the throughput numbers and a real-world long-context retrieval test."},
        {"source": "Hacker News", "url": "https://news.ycombinator.com/item?id=12345", "take": "Top comment is mostly skepticism on price-vs-capability vs. competitors."},
        {"source": "Latent Space", "url": "https://www.latent.space/p/claude-4-7-takeaways", "take": "Independent test on a 700K-token codebase shows strong retrieval but slow first-token latency."}
      ]
    },
    {
      "id": "tauri-2-1-release",
      "tier": 2,
      "title": "Tauri 2.1 ships with smaller binary footprint",
      "summary": "Tauri 2.1 reduces minimum binary size by 18% via tree-shaking improvements. Comments overnight focused on the iOS-side regression that 2.1.1 will likely patch within the week.",
      "link": "https://example.com/tauri-2-1",
      "why_it_matters": "If you're curious about shipping a desktop app from web tech, Tauri is the sane Rust-backed alternative to Electron. Wait a few days for 2.1.1 if you're starting fresh.",
      "source": {"name": "Tauri Blog", "type": "rss", "url": "https://tauri.app/blog"},
      "region": "Global",
      "hero_image": null,
      "added_at": "2026-05-03T17:02:00Z",
      "added_by": "digest",
      "last_revision_by": "enrichment",
      "enriched_overnight": true,
      "promoted_from_am": false,
      "revisions": [
        {"at": "2026-05-03T17:02:00Z", "by": "digest", "change": "created"},
        {"at": "2026-05-04T06:01:00Z", "by": "enrichment", "change": "noted iOS regression chatter"}
      ],
      "takes": []
    },
    {
      "id": "alibaba-qwen3-update",
      "tier": 2,
      "title": "Alibaba's Qwen3 gets a coder-specialized variant",
      "summary": "Alibaba released Qwen3-Coder, a specialized fork tuned on a curated code dataset. Asia-time release means the Western news cycle picks it up tomorrow.",
      "link": "https://example.com/qwen3-coder",
      "why_it_matters": "Coder-specialized open models are good for offline / private use cases. If you ever want code completion that doesn't talk to a cloud, this is the kind of model to look at.",
      "source": {"name": "Hugging Face Blog", "type": "rss", "url": "https://huggingface.co/blog"},
      "region": "Asia",
      "hero_image": null,
      "added_at": "2026-05-04T11:00:00Z",
      "added_by": "refresh",
      "last_revision_by": "refresh",
      "enriched_overnight": true,
      "promoted_from_am": false,
      "revisions": [
        {"at": "2026-05-04T11:00:00Z", "by": "refresh", "change": "created from overnight Asia cycle"}
      ],
      "takes": []
    },
    {
      "id": "vercel-ai-sdk-5",
      "tier": 3,
      "title": "Vercel AI SDK 5.0 adds streaming to React Server Components",
      "summary": "Vercel's AI SDK 5.0 lets you stream model output directly into React Server Components, removing a layer of plumbing that used to live in API routes.",
      "link": "https://example.com/vercel-ai-sdk-5",
      "why_it_matters": "If you ever explore React for a side project, this is the easiest way to wire in a model. The plumbing it removes is the kind of boilerplate that used to be a tutorial in itself.",
      "source": {"name": "Vercel Blog", "type": "scrape", "url": "https://vercel.com/blog"},
      "region": "US",
      "hero_image": {"url": "https://example.com/og-vercel-ai-5.jpg", "alt": "Vercel AI SDK 5.0 graphic", "source": "og:image"},
      "added_at": "2026-05-04T06:01:00Z",
      "added_by": "enrichment",
      "last_revision_by": "enrichment",
      "enriched_overnight": true,
      "promoted_from_am": false,
      "revisions": [
        {"at": "2026-05-04T06:01:00Z", "by": "enrichment", "change": "added as 2am late-breaking"}
      ],
      "takes": []
    }
  ],
  "dropped_in_phase": [
    {"phase": "enrichment", "id": "openai-gpt-5-rumor", "reason": "rumor with no follow-up substance overnight, low signal"},
    {"phase": "enrichment", "id": "deepseek-r2-open-weights", "reason": "no new context overnight; original coverage stands"},
    {"phase": "enrichment", "id": "github-copilot-spaces", "reason": "no overnight chatter, shallow product launch"}
  ]
}
```

- [ ] **Step 5: Create `tests/fixtures/data/2026-05-04-pm.json`** (today's fresh digest, with one promoted item)

```json
{
  "snapshot_id": "2026-05-04-pm",
  "snapshot_type": "pm",
  "calendar_date": "2026-05-04",
  "generated_at": "2026-05-04T17:08:42Z",
  "generated_at_local": "2026-05-04T13:08:42-04:00",
  "phase_history": [{"phase": "digest", "ran_at": "2026-05-04T17:00:00Z", "duration_ms": 522000}],
  "tier_counts": {"1": 2, "2": 2, "3": 1},
  "items": [
    {
      "id": "anthropic-claude-opus-4-7",
      "tier": 1,
      "title": "Anthropic ships Claude Opus 4.7 with 1M context window",
      "summary": "Claude Opus 4.7 hit 1M context. Day-of update: Anthropic also published a follow-up post detailing prompt-caching savings, and three independent labs replicated the LongBench numbers. Pricing tier for cached input dropped further than initial announcement implied.",
      "link": "https://www.anthropic.com/news/claude-opus-4-7",
      "why_it_matters": "Promoted because afternoon coverage materially deepened the picture: cached pricing is now ~30% cheaper than 4.6, which changes the long-context economics meaningfully for hobby projects.",
      "source": {"name": "Anthropic News", "type": "scrape", "url": "https://www.anthropic.com/news"},
      "region": "US",
      "hero_image": {"url": "https://example.com/og-claude-4-7.jpg", "alt": "Anthropic Claude Opus 4.7 announcement banner", "source": "og:image"},
      "added_at": "2026-05-03T17:02:00Z",
      "added_by": "digest",
      "last_revision_by": "digest",
      "enriched_overnight": false,
      "promoted_from_am": true,
      "revisions": [
        {"at": "2026-05-03T17:02:00Z", "by": "digest", "change": "created"},
        {"at": "2026-05-04T06:01:00Z", "by": "enrichment", "change": "added benchmark context"},
        {"at": "2026-05-04T17:00:00Z", "by": "digest", "change": "promoted from am with afternoon pricing follow-up"}
      ],
      "takes": [
        {"source": "Simon Willison", "url": "https://simonwillison.net/2026/May/3/claude-opus-4-7/", "take": "Notes the throughput numbers and a real-world long-context retrieval test."},
        {"source": "Latent Space", "url": "https://www.latent.space/p/claude-4-7-takeaways", "take": "Independent test on a 700K-token codebase shows strong retrieval but slow first-token latency."},
        {"source": "Anthropic Engineering", "url": "https://www.anthropic.com/engineering/cached-prompt-economics", "take": "Follow-up engineering post breaks down cached vs. uncached cost across realistic patterns."}
      ]
    },
    {
      "id": "google-gemini-2-5-deep-think",
      "tier": 1,
      "title": "Google launches Gemini 2.5 Deep Think mode",
      "summary": "Gemini 2.5 gains a Deep Think mode that runs multiple parallel reasoning paths and self-evaluates before answering. Available in AI Studio first.",
      "link": "https://example.com/gemini-deep-think",
      "why_it_matters": "Test-time compute (running the model harder for tougher questions) is becoming the expected default. Worth knowing about even if you only ever touch the API for short tasks.",
      "source": {"name": "Google DeepMind", "type": "scrape", "url": "https://deepmind.google"},
      "region": "US",
      "hero_image": {"url": "https://example.com/og-gemini-deep-think.jpg", "alt": "Gemini Deep Think announcement", "source": "og:image"},
      "added_at": "2026-05-04T17:00:00Z",
      "added_by": "digest",
      "last_revision_by": "digest",
      "enriched_overnight": false,
      "promoted_from_am": false,
      "revisions": [{"at": "2026-05-04T17:00:00Z", "by": "digest", "change": "created"}],
      "takes": []
    },
    {
      "id": "rust-cargo-script-stable",
      "tier": 2,
      "title": "Rust ships `cargo script` to stable",
      "summary": "Single-file Rust scripts now have first-class tooling — `cargo script run foo.rs` will resolve dependencies inline from a comment block at the top of the file.",
      "link": "https://example.com/cargo-script-stable",
      "why_it_matters": "Closer to the Python script-it-out-quick experience, but with Rust's performance and type safety. A reasonable on-ramp if you've been Rust-curious.",
      "source": {"name": "Rust Blog", "type": "rss", "url": "https://blog.rust-lang.org"},
      "region": "Global",
      "hero_image": null,
      "added_at": "2026-05-04T17:00:00Z",
      "added_by": "digest",
      "last_revision_by": "digest",
      "enriched_overnight": false,
      "promoted_from_am": false,
      "revisions": [{"at": "2026-05-04T17:00:00Z", "by": "digest", "change": "created"}],
      "takes": []
    },
    {
      "id": "docker-init-ai",
      "tier": 2,
      "title": "Docker ships AI-powered `docker init` for new projects",
      "summary": "`docker init` now uses an AI model to scaffold Dockerfiles by reading the project's actual files instead of from templates. Supports Python, Node, Rust, Go.",
      "link": "https://example.com/docker-init-ai",
      "why_it_matters": "Containerizing your Python projects without writing a Dockerfile from scratch — useful if you've been wanting to learn Docker but kept stalling on syntax.",
      "source": {"name": "Docker Blog", "type": "scrape", "url": "https://www.docker.com/blog"},
      "region": "US",
      "hero_image": {"url": "https://example.com/og-docker-init.jpg", "alt": "Docker init AI feature", "source": "og:image"},
      "added_at": "2026-05-04T17:00:00Z",
      "added_by": "digest",
      "last_revision_by": "digest",
      "enriched_overnight": false,
      "promoted_from_am": false,
      "revisions": [{"at": "2026-05-04T17:00:00Z", "by": "digest", "change": "created"}],
      "takes": []
    },
    {
      "id": "perplexity-ios-launch",
      "tier": 3,
      "title": "Perplexity launches a redesigned iOS app",
      "summary": "Perplexity rolled out a redesigned iOS app with offline-readable saved threads and a new voice mode.",
      "link": "https://example.com/perplexity-ios-redesign",
      "why_it_matters": "Mobile-first AI search products are still working out their patterns. Useful to see what they pick — saved threads is a feature you'll want in your own static page eventually.",
      "source": {"name": "Perplexity Blog", "type": "scrape", "url": "https://perplexity.ai/blog"},
      "region": "US",
      "hero_image": null,
      "added_at": "2026-05-04T17:00:00Z",
      "added_by": "digest",
      "last_revision_by": "digest",
      "enriched_overnight": false,
      "promoted_from_am": false,
      "revisions": [{"at": "2026-05-04T17:00:00Z", "by": "digest", "change": "created"}],
      "takes": []
    }
  ],
  "dropped_in_phase": []
}
```

- [ ] **Step 6: Validate all fixtures parse**

Run: `for f in tests/fixtures/data/*.json; do python -m json.tool "$f" > /dev/null && echo "OK $f" || echo "FAIL $f"; done`
Expected: every file prints `OK`. Any `FAIL` means the file has a JSON syntax error — fix and re-run.

- [ ] **Step 7: Commit**

```bash
git add tests/fixtures/data/
git commit -m "test: add fixture snapshots covering page rendering edge cases"
```

---

## Task 5: Cycle-selection logic — `js/cycle.js` with unit tests

**Files:**
- Create: `js/cycle.js`
- Create: `tests/cycle.test.js`
- Create: `package.json`

The cycle picker is a pure function: given a `Date` (current time, EST) and the manifest, returns `{ topId, bottomId, banner }`. Encapsulating it lets us test every time window without touching the DOM.

**Time-window contract** (from spec §4):

| Window (EST hours) | Top | Bottom | Banner |
|---|---|---|---|
| 13:00–01:59 | newest pm same day | newest am same day (if any) | none |
| 02:00–06:59 | none | newest pm | "Today's morning refresh runs at 7am EST." |
| 07:00–12:59 | newest am same day | most recent pm before today | "Today's afternoon digest runs at 1pm EST." |

"Same day" is determined by the local-EST calendar date of the snapshot. The picker treats 00:00–01:59 as still belonging to "today (yesterday cycle)" — the previous day's pm is still labeled "Today (afternoon)" until the 2am enrichment runs.

- [ ] **Step 1: Create `package.json`** with just a test script

```json
{
  "name": "ai-news",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 2: Write failing tests in `tests/cycle.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickSnapshots } from '../js/cycle.js';

const manifest = {
  schema_version: 1,
  generated_at: '2026-05-04T17:01:00Z',
  snapshots: [
    { id: '2026-05-04-pm', type: 'pm', calendar_date: '2026-05-04' },
    { id: '2026-05-04-am', type: 'am', calendar_date: '2026-05-04' },
    { id: '2026-05-03-pm', type: 'pm', calendar_date: '2026-05-03' }
  ]
};

// Helper: build a Date in EST for a given local-time string
const est = (s) => new Date(`${s}-04:00`); // EDT in May 2026 (UTC-4)

test('1pm EST: top = today pm, bottom = today am, no banner', () => {
  const r = pickSnapshots(est('2026-05-04T13:30:00'), manifest);
  assert.equal(r.topId, '2026-05-04-pm');
  assert.equal(r.bottomId, '2026-05-04-am');
  assert.equal(r.banner, null);
});

test('11pm EST: still pm/am with no banner', () => {
  const r = pickSnapshots(est('2026-05-04T23:59:00'), manifest);
  assert.equal(r.topId, '2026-05-04-pm');
  assert.equal(r.bottomId, '2026-05-04-am');
  assert.equal(r.banner, null);
});

test('1am EST (after midnight, before 2am): still showing yesterday pm/am as Today', () => {
  // 1am on May 5, but the cycle hasn't transitioned yet — May 4 pm/am still labeled "Today"
  const r = pickSnapshots(est('2026-05-05T01:30:00'), manifest);
  assert.equal(r.topId, '2026-05-04-pm');
  assert.equal(r.bottomId, '2026-05-04-am');
  assert.equal(r.banner, null);
});

test('2am EST: top hidden, bottom = newest pm, banner about 7am refresh', () => {
  const r = pickSnapshots(est('2026-05-05T02:30:00'), manifest);
  assert.equal(r.topId, null);
  assert.equal(r.bottomId, '2026-05-04-pm');
  assert.match(r.banner, /morning refresh runs at 7am/i);
});

test('6:59am EST: still in the 2am-7am window', () => {
  const r = pickSnapshots(est('2026-05-05T06:59:00'), manifest);
  assert.equal(r.topId, null);
  assert.equal(r.bottomId, '2026-05-04-pm');
  assert.match(r.banner, /morning refresh runs at 7am/i);
});

test('7am EST when am file exists for today: top = today am, bottom = yesterday pm, banner about 1pm digest', () => {
  // Add a May 5 am snapshot for this test
  const m = {
    ...manifest,
    snapshots: [
      { id: '2026-05-05-am', type: 'am', calendar_date: '2026-05-05' },
      ...manifest.snapshots
    ]
  };
  const r = pickSnapshots(est('2026-05-05T07:30:00'), m);
  assert.equal(r.topId, '2026-05-05-am');
  assert.equal(r.bottomId, '2026-05-04-pm');
  assert.match(r.banner, /afternoon digest runs at 1pm/i);
});

test('7am EST when am file does NOT exist yet: top hidden, bottom = newest pm, banner unchanged from 2am-7am', () => {
  // 7am but no May 5 am file (e.g., 2am run failed) — treat like still in the in-between window
  const r = pickSnapshots(est('2026-05-05T07:30:00'), manifest);
  assert.equal(r.topId, null);
  assert.equal(r.bottomId, '2026-05-04-pm');
});

test('1pm EST after a fresh digest: top = today pm, bottom = today am', () => {
  const m = {
    ...manifest,
    snapshots: [
      { id: '2026-05-05-pm', type: 'pm', calendar_date: '2026-05-05' },
      { id: '2026-05-05-am', type: 'am', calendar_date: '2026-05-05' },
      ...manifest.snapshots
    ]
  };
  const r = pickSnapshots(est('2026-05-05T13:30:00'), m);
  assert.equal(r.topId, '2026-05-05-pm');
  assert.equal(r.bottomId, '2026-05-05-am');
  assert.equal(r.banner, null);
});

test('Empty manifest: both null, no crash', () => {
  const r = pickSnapshots(est('2026-05-04T13:30:00'), { schema_version: 1, snapshots: [] });
  assert.equal(r.topId, null);
  assert.equal(r.bottomId, null);
});

test('Bootstrap state — only one pm snapshot exists: shows it as top, bottom is null', () => {
  const m = { schema_version: 1, snapshots: [{ id: '2026-05-04-pm', type: 'pm', calendar_date: '2026-05-04' }] };
  const r = pickSnapshots(est('2026-05-04T15:00:00'), m);
  assert.equal(r.topId, '2026-05-04-pm');
  assert.equal(r.bottomId, null);
  assert.equal(r.banner, null);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: all tests fail with "Cannot find module" or "pickSnapshots is not a function" — `js/cycle.js` doesn't exist yet.

- [ ] **Step 4: Create `js/cycle.js`** with the implementation

```js
// Time-window aware snapshot picker.
// Inputs:
//   now: Date (any timezone — we convert to EST hours/date internally)
//   manifest: { snapshots: [{ id, type, calendar_date }] }
// Output: { topId, bottomId, banner }
// Where banner is null or a string to display.

const EST_TZ = 'America/New_York';

// Get hour (0-23) and YYYY-MM-DD calendar date in EST for a given Date.
function estParts(d) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: EST_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: parseInt(parts.hour, 10)
  };
}

// "Cycle date" = the date label the page treats as "today". Between midnight and 2am EST,
// the cycle date is still the previous calendar day (the previous afternoon's content is
// still labeled "Today" until the 2am enrichment runs).
function cycleDate(estDate, estHour) {
  if (estHour < 2) {
    const d = new Date(`${estDate}T12:00:00`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  return estDate;
}

function findSnapshot(manifest, type, date) {
  return manifest.snapshots.find(s => s.type === type && s.calendar_date === date) || null;
}

function findMostRecentPmBefore(manifest, date) {
  return manifest.snapshots
    .filter(s => s.type === 'pm' && s.calendar_date < date)
    .sort((a, b) => b.calendar_date.localeCompare(a.calendar_date))[0] || null;
}

export function pickSnapshots(now, manifest) {
  if (!manifest || !Array.isArray(manifest.snapshots) || manifest.snapshots.length === 0) {
    return { topId: null, bottomId: null, banner: null };
  }

  const { date: estDate, hour } = estParts(now);
  const today = cycleDate(estDate, hour);

  // Window 1: 13:00–01:59 — show today's pm + today's am
  if (hour >= 13 || hour < 2) {
    const pm = findSnapshot(manifest, 'pm', today);
    const am = findSnapshot(manifest, 'am', today);
    return {
      topId: pm ? pm.id : null,
      bottomId: am ? am.id : null,
      banner: null
    };
  }

  // Window 2: 02:00–06:59 — top hidden, bottom = newest pm (yesterday's), banner about 7am
  if (hour >= 2 && hour < 7) {
    const pmYesterday = findSnapshot(manifest, 'pm', today);
    return {
      topId: null,
      bottomId: pmYesterday ? pmYesterday.id : null,
      banner: "Today's morning refresh runs at 7am EST."
    };
  }

  // Window 3: 07:00–12:59 — top = today's am if exists, else fall through to window 2 behavior
  if (hour >= 7 && hour < 13) {
    // After 7am, "today" is the calendar date. The am file we want is for today's calendar date.
    const todayCal = estDate;
    const am = findSnapshot(manifest, 'am', todayCal);
    if (am) {
      const pmPrev = findMostRecentPmBefore(manifest, todayCal);
      return {
        topId: am.id,
        bottomId: pmPrev ? pmPrev.id : null,
        banner: "Today's afternoon digest runs at 1pm EST."
      };
    } else {
      // 2am or 7am run failed — no am file. Treat like 2am-7am window.
      const pmYesterday = findMostRecentPmBefore(manifest, todayCal);
      return {
        topId: null,
        bottomId: pmYesterday ? pmYesterday.id : null,
        banner: "Today's morning refresh runs at 7am EST."
      };
    }
  }

  return { topId: null, bottomId: null, banner: null };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: all 10 tests pass. Output ends with something like `# pass 10` and exit code 0.

If any test fails, read the assertion message carefully — most likely cause is a timezone-handling bug in `estParts`. The pure logic above intentionally avoids UTC arithmetic; if it's off, double-check the `Intl.DateTimeFormat` output structure.

- [ ] **Step 6: Commit**

```bash
git add js/cycle.js tests/cycle.test.js package.json
git commit -m "feat: add cycle-selection logic with full unit-test coverage"
```

---

## Task 6: Page implementation — `index.html` + `js/app.js`

**Files:**
- Modify: `index.html` (replace placeholder content)
- Create: `js/app.js`

The page is intentionally minimal — placeholder visuals, complete data-rendering logic. Claude Design replaces the styling later (see SPEC §6); the structure here is the contract.

- [ ] **Step 1: Replace `index.html`** with the rendering version

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI News — for Gabe</title>
<style>
  :root { --bg:#0b0d10; --panel:#14181d; --ink:#e8eaed; --muted:#8b95a1; --accent:#7cc5ff; --warn:#ffb86b; --danger:#ff7b7b; --tier1:#ff7b7b; --tier2:#7cc5ff; --tier3:#8b95a1; --border:#1f262d; }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; background:var(--bg); color:var(--ink); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif; line-height:1.55; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 32px 20px 80px; }
  h1 { font-size: 28px; margin: 0 0 8px; letter-spacing:-0.02em; }
  h2 { font-size: 18px; margin: 32px 0 16px; }
  .sub { color: var(--muted); margin: 0 0 32px; }
  .banner { background: var(--panel); border:1px solid var(--border); border-left:3px solid var(--accent); padding: 12px 16px; border-radius: 6px; margin-bottom: 24px; color: var(--muted); font-size: 14px; }
  .banner.warn { border-left-color: var(--warn); }
  .banner.danger { border-left-color: var(--danger); color: var(--ink); }
  .item { background: var(--panel); border:1px solid var(--border); border-radius:8px; padding: 18px 20px; margin-bottom: 14px; }
  .item .meta { display:flex; gap:8px; font-size:12px; color:var(--muted); margin-bottom:8px; flex-wrap:wrap; }
  .tag { background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 999px; }
  .tag.tier1 { color: var(--tier1); border:1px solid var(--tier1); }
  .tag.tier2 { color: var(--tier2); border:1px solid var(--tier2); }
  .tag.tier3 { color: var(--tier3); border:1px solid var(--tier3); }
  .tag.region { color: var(--muted); }
  .tag.updated { color: var(--accent); }
  .tag.promoted { color: var(--warn); }
  .item h3 { font-size: 17px; margin: 0 0 8px; }
  .item .summary { color: var(--ink); margin: 0 0 8px; }
  .item .why { color: var(--muted); font-style: italic; font-size: 14px; margin: 8px 0; padding: 8px 12px; border-left: 2px solid var(--border); }
  .item .source-row { color: var(--muted); font-size: 13px; }
  .item .source-row a { color: var(--accent); text-decoration: none; }
  .item .source-row a:hover { text-decoration: underline; }
  .item .hero { width: 100%; max-height: 280px; object-fit: cover; border-radius: 6px; margin-bottom: 12px; display: block; background: #1a1f24; }
  .archive { margin-top: 48px; }
  .archive summary { cursor: pointer; color: var(--muted); padding: 12px 0; }
  .archive ul { list-style: none; padding-left: 0; }
  .archive li { padding: 6px 0; color: var(--muted); font-size: 14px; }
  .archive li button { background: none; border: none; color: var(--accent); cursor: pointer; padding: 0; font: inherit; }
  footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--border); color: var(--muted); font-size: 12px; }
  .takes { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
  .takes blockquote { margin: 8px 0; padding: 8px 12px; border-left: 2px solid var(--accent); color: var(--ink); font-size: 14px; }
  .takes blockquote cite { display: block; color: var(--muted); font-size: 12px; margin-top: 4px; font-style: normal; }
  a { color: var(--accent); }
  .empty { color: var(--muted); font-style: italic; }
</style>
</head>
<body>
<div class="wrap">
  <h1>AI News</h1>
  <p class="sub">Curated daily for Gabe. <a href="#" id="back-link" hidden>← back</a></p>

  <div id="banner-area"></div>
  <div id="top-section"></div>
  <div id="bottom-section"></div>

  <details class="archive">
    <summary>Archive</summary>
    <div id="archive-content"></div>
  </details>

  <footer id="footer"></footer>
</div>
<script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `js/app.js`** — orchestration layer

```js
import { pickSnapshots } from './cycle.js';

// Allow `?now=2026-05-04T15:00` query override for testing the time-based cycle picker
function getNow() {
  const params = new URLSearchParams(window.location.search);
  const override = params.get('now');
  if (override) return new Date(override + (override.includes('Z') || override.includes('+') || override.includes('-') ? '' : '-04:00'));
  return new Date();
}

// Allow `?data=tests/fixtures/data` query override for testing with fixture data
function getDataDir() {
  const params = new URLSearchParams(window.location.search);
  return params.get('data') || 'data';
}

async function fetchJson(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`fetch ${path}: ${r.status}`);
  return r.json();
}

function relativeTime(isoString) {
  if (!isoString) return 'never';
  const then = new Date(isoString).getTime();
  const now = Date.now();
  const minutes = Math.round((now - then) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function escape(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function renderItem(item) {
  const tags = [];
  tags.push(`<span class="tag tier${item.tier}">Tier ${item.tier}</span>`);
  if (item.region && item.region !== 'US' && item.region !== 'Global') {
    tags.push(`<span class="tag region">${escape(item.region)}</span>`);
  }
  if (item.enriched_overnight && item.last_revision_by !== 'digest') {
    tags.push(`<span class="tag updated">Updated overnight</span>`);
  }
  if (item.promoted_from_am) {
    tags.push(`<span class="tag promoted">↑ Promoted from morning</span>`);
  }

  const hero = item.hero_image
    ? `<img class="hero" src="${escape(item.hero_image.url)}" alt="${escape(item.hero_image.alt)}" onerror="this.remove()">`
    : '';

  const detailsLink = (item.takes && item.takes.length >= 2)
    ? ` · <a href="#item-${escape(item.id)}">Details →</a>`
    : '';

  return `
    <article class="item" id="item-${escape(item.id)}">
      <div class="meta">${tags.join('')}</div>
      ${hero}
      <h3>${escape(item.title)}</h3>
      <p class="summary">${escape(item.summary)}</p>
      <p class="why">Why this matters: ${escape(item.why_it_matters)}</p>
      <p class="source-row">
        <a href="${escape(item.link)}" target="_blank" rel="noopener">${escape(item.source && item.source.name || 'source')}</a>${detailsLink}
      </p>
    </article>
  `;
}

function renderItemDetail(item) {
  const takesHtml = (item.takes || []).map(t => `
    <blockquote>
      ${escape(t.take)}
      <cite>— <a href="${escape(t.url)}" target="_blank" rel="noopener">${escape(t.source)}</a></cite>
    </blockquote>
  `).join('');

  return `
    ${renderItem(item)}
    <div class="takes">
      <h2>Takes (${(item.takes || []).length})</h2>
      ${takesHtml}
    </div>
  `;
}

function renderSection(title, snapshot) {
  if (!snapshot) return '';
  if (!snapshot.items || snapshot.items.length === 0) {
    return `<h2>${escape(title)}</h2><p class="empty">No items.</p>`;
  }
  return `<h2>${escape(title)}</h2>${snapshot.items.map(renderItem).join('')}`;
}

function renderBanner(text, level) {
  if (!text) return '';
  const cls = level === 'danger' ? 'banner danger' : level === 'warn' ? 'banner warn' : 'banner';
  return `<div class="${cls}">${escape(text)}</div>`;
}

function renderFooter(runs) {
  const lastSuccess = runs.find(r => r.status === 'success');
  if (!lastSuccess) return 'No successful runs yet.';
  return `Last refresh: ${relativeTime(lastSuccess.ended_at)} (${escape(lastSuccess.phase)}, ${escape(lastSuccess.tokens_used.toLocaleString())} tokens)`;
}

function renderArchive(manifest, currentTopId, currentBottomId) {
  const others = manifest.snapshots.filter(s => s.id !== currentTopId && s.id !== currentBottomId);
  if (others.length === 0) return '<p class="empty">No archived snapshots yet.</p>';
  return '<ul>' + others.map(s => `
    <li>${escape(s.calendar_date)} ${escape(s.type)} — ${s.item_count || 0} items
      (T1: ${(s.tier_counts && s.tier_counts['1']) || 0},
       T2: ${(s.tier_counts && s.tier_counts['2']) || 0},
       T3: ${(s.tier_counts && s.tier_counts['3']) || 0})
    </li>
  `).join('') + '</ul>';
}

function getStaleBanner(runs) {
  const lastSuccess = runs.find(r => r.status === 'success');
  if (!lastSuccess) return null;
  const hoursStale = (Date.now() - new Date(lastSuccess.ended_at).getTime()) / 3600000;
  if (hoursStale > 12) {
    return { text: `⚠ Last successful refresh was ${Math.round(hoursStale)} hours ago — agent may be stuck.`, level: 'warn' };
  }
  return null;
}

function getPausedBanner(control) {
  if (!control || !control.paused) return null;
  const until = control.paused_until ? new Date(control.paused_until) : null;
  if (until && until.getTime() < Date.now()) return null;
  const reason = control.paused_reason || 'No reason given';
  const resumeText = until ? `Resumes ${until.toISOString().slice(0, 16).replace('T', ' ')} UTC` : 'Indefinite';
  return { text: `Agent paused — ${resumeText}. Reason: ${reason}`, level: 'danger' };
}

function findSnapshotMeta(manifest, id) {
  return manifest.snapshots.find(s => s.id === id) || null;
}

async function renderItemDetailPage(itemId, manifest, dataDir) {
  // Find the most recent snapshot containing this item
  for (const s of manifest.snapshots) {
    const snap = await fetchJson(s.file.startsWith(dataDir) ? s.file : `${dataDir}/${s.id}.json`);
    const item = (snap.items || []).find(i => i.id === itemId);
    if (item) return renderItemDetail(item);
  }
  return `<p class="empty">Item not found.</p>`;
}

async function render() {
  const dataDir = getDataDir();
  const banner = document.getElementById('banner-area');
  const top = document.getElementById('top-section');
  const bottom = document.getElementById('bottom-section');
  const archive = document.getElementById('archive-content');
  const footer = document.getElementById('footer');
  const backLink = document.getElementById('back-link');

  let manifest, runsLog, control;
  try {
    [manifest, runsLog, control] = await Promise.all([
      fetchJson(`${dataDir}/index.json`),
      fetchJson(`${dataDir}/runs.json`),
      fetchJson('agent/control.json').catch(() => ({ paused: false, phases: {} }))
    ]);
  } catch (e) {
    banner.innerHTML = renderBanner(`Failed to load page data: ${e.message}`, 'danger');
    return;
  }

  const runs = (runsLog && runsLog.runs) || [];

  // Banner stack: paused > stale > cycle
  const banners = [];
  const paused = getPausedBanner(control);
  if (paused) banners.push(renderBanner(paused.text, paused.level));
  const stale = getStaleBanner(runs);
  if (stale) banners.push(renderBanner(stale.text, stale.level));

  // Sub-page deep-link?
  const hash = window.location.hash;
  if (hash.startsWith('#item-')) {
    const itemId = hash.slice('#item-'.length);
    const detailHtml = await renderItemDetailPage(itemId, manifest, dataDir);
    banner.innerHTML = banners.join('');
    top.innerHTML = detailHtml;
    bottom.innerHTML = '';
    backLink.hidden = false;
    backLink.onclick = (e) => { e.preventDefault(); window.location.hash = ''; };
    archive.innerHTML = '';
    footer.textContent = renderFooter(runs);
    return;
  }

  // Standard cycle-based view
  backLink.hidden = true;
  const { topId, bottomId, banner: cycleBanner } = pickSnapshots(getNow(), manifest);
  if (cycleBanner && !paused) banners.push(renderBanner(cycleBanner));
  banner.innerHTML = banners.join('');

  // Determine labels based on time window
  const { hour } = (() => {
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', hour: '2-digit', hour12: false });
    return { hour: parseInt(fmt.formatToParts(getNow()).find(p => p.type === 'hour').value, 10) };
  })();

  let topLabel, bottomLabel;
  if (hour >= 13 || hour < 2) {
    topLabel = 'Today (afternoon)';
    bottomLabel = 'Today (morning)';
  } else if (hour < 7) {
    topLabel = null;
    bottomLabel = "Yesterday's afternoon";
  } else {
    topLabel = 'Today (morning)';
    bottomLabel = "Yesterday's afternoon";
  }

  const topSnap = topId ? await fetchJson(manifest.snapshots.find(s => s.id === topId).file.startsWith(dataDir) ? manifest.snapshots.find(s => s.id === topId).file : `${dataDir}/${topId}.json`) : null;
  const bottomSnap = bottomId ? await fetchJson(manifest.snapshots.find(s => s.id === bottomId).file.startsWith(dataDir) ? manifest.snapshots.find(s => s.id === bottomId).file : `${dataDir}/${bottomId}.json`) : null;

  top.innerHTML = topLabel ? renderSection(topLabel, topSnap) : '';
  bottom.innerHTML = bottomLabel ? renderSection(bottomLabel, bottomSnap) : '';
  archive.innerHTML = renderArchive(manifest, topId, bottomId);
  footer.textContent = renderFooter(runs);
}

window.addEventListener('hashchange', render);
render();
```

- [ ] **Step 3: Verify the page loads in a browser**

Manually open: `index.html?data=tests/fixtures/data&now=2026-05-04T15:00`

Expected behavior:
- Top section shows "Today (afternoon)" with 5 items from `2026-05-04-pm.json`
- Bottom section shows "Today (morning)" with 4 items from `2026-05-04-am.json`
- The Anthropic Claude 4.7 item shows "↑ Promoted from morning" tag (because `promoted_from_am: true`)
- The Vercel AI SDK 5 item shows "Updated overnight" tag in the morning section
- Items with `takes.length >= 2` show "Details →" link
- No banners (we're in the 1pm–1:59am window)
- Footer shows "Last refresh: ... ago"

Note: opening `file://` URLs may block `fetch` due to CORS. If so, run a local server first: `python -m http.server 8000` then open `http://localhost:8000/?data=tests/fixtures/data&now=2026-05-04T15:00`

- [ ] **Step 4: Commit**

```bash
git add index.html js/app.js
git commit -m "feat: page renders cycle-based snapshot data with full edge-case handling"
```

---

## Task 7: Manual verification checklist

**Files:**
- None (manual verification only)

This task is a structured manual run-through. Each row is one cycle window or edge case to verify in a browser.

- [ ] **Step 1: Start the local server**

Run: `python -m http.server 8000`
Leave running in a separate terminal.

- [ ] **Step 2: Verify each cycle window**

Open each URL and confirm the expected behavior matches:

| URL | Expected top section | Expected bottom section | Expected banner |
|---|---|---|---|
| `http://localhost:8000/?data=tests/fixtures/data&now=2026-05-04T15:00` | "Today (afternoon)" — 5 items | "Today (morning)" — 4 items | none |
| `http://localhost:8000/?data=tests/fixtures/data&now=2026-05-04T23:30` | "Today (afternoon)" — 5 items | "Today (morning)" — 4 items | none |
| `http://localhost:8000/?data=tests/fixtures/data&now=2026-05-05T01:30` | "Today (afternoon)" — May 4 pm | "Today (morning)" — May 4 am | none |
| `http://localhost:8000/?data=tests/fixtures/data&now=2026-05-05T04:00` | hidden | "Yesterday's afternoon" — May 4 pm | "Today's morning refresh runs at 7am EST." |
| `http://localhost:8000/?data=tests/fixtures/data&now=2026-05-05T08:00` | "Today (morning)" — May 4 am (no May 5 am exists in fixtures, so falls back) | "Yesterday's afternoon" — May 4 pm | "Today's morning refresh runs at 7am EST." (because no May 5 am) |

- [ ] **Step 3: Verify edge-case rendering**

Open `http://localhost:8000/?data=tests/fixtures/data&now=2026-05-04T15:00` and visually confirm:

- [ ] Items with `hero_image: null` (Tauri, DeepSeek, Rust cargo script) render without an `<img>` element
- [ ] Items with `hero_image` set render the image (even if URL 404s, layout doesn't break — `<img>` removed by `onerror`)
- [ ] Anthropic Claude 4.7 item shows "↑ Promoted from morning" tag in the pm section
- [ ] In the am section, items with `last_revision_by: enrichment` or `refresh` show "Updated overnight" tag
- [ ] Region badges appear for Asia (DeepSeek, Qwen3) and Global (Tauri, Rust) items; not for US items
- [ ] Items with 2+ takes show "Details →" link

- [ ] **Step 4: Verify sub-page deep-link**

Click a "Details →" link, e.g., on the Anthropic item.

Expected:
- URL changes to `#item-anthropic-claude-opus-4-7`
- Page replaces the cycle layout with just that item + a "Takes (3)" section showing all 3 quoted takes
- "← back" link appears next to the subtitle
- Clicking "← back" returns to the cycle view

- [ ] **Step 5: Verify paused-banner**

Edit `agent/control.json` temporarily:

```json
{
  "paused": true,
  "paused_reason": "Testing paused banner",
  "paused_until": null,
  "phases": { "digest": {"enabled": true}, "enrichment": {"enabled": true}, "refresh": {"enabled": true} }
}
```

Reload `http://localhost:8000/?data=tests/fixtures/data&now=2026-05-04T15:00`.

Expected: a danger-styled banner at the top reading "Agent paused — Indefinite. Reason: Testing paused banner". Cycle banner suppressed. Content still renders below.

After verifying, **revert `agent/control.json`** to the unpaused state.

- [ ] **Step 6: Verify stale-banner**

The fixture `runs.json` has `ended_at: 2026-05-04T17:08:42Z`. To trigger the stale banner, set `now` ahead by 13+ hours:

`http://localhost:8000/?data=tests/fixtures/data&now=2026-05-05T07:00`

Wait — that's in the 7am window, which has its own banner. Try `?now=2026-05-05T15:00`:

Actually the stale check uses real `Date.now()`, not the `?now=` override. To genuinely test stale: temporarily edit a fixture run's `ended_at` to be 24h ago from real now, reload, confirm stale banner. Then revert.

Skip this step if the manual edit isn't worth it — the logic is unit-tested via `getStaleBanner` shape, and we'll see real stale behavior in production.

- [ ] **Step 7: Verify archive disclosure**

On the standard cycle view, click "Archive" to expand. Expected: a list including `2026-05-03-pm` (the only fixture not currently shown).

- [ ] **Step 8: Stop the server**

Ctrl+C in the server terminal.

- [ ] **Step 9: No-op commit (record verification done)**

```bash
git commit --allow-empty -m "verify: page rendering checklist passed against fixture data"
```

---

## Task 8: Update README and ship the PR

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`

- [ ] **Step 1: Update `README.md`**

```markdown
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
```

- [ ] **Step 2: Update `.gitignore`** to add `node_modules/` defensively (we have no deps now, but future plans may add some)

```
node_modules/
.DS_Store
*.log
```

- [ ] **Step 3: Run `npm test` once more**

Run: `npm test`
Expected: all 10 tests pass.

- [ ] **Step 4: Commit and push branch**

```bash
git add README.md .gitignore
git commit -m "docs: update README with layout, dev, and test instructions"
git push -u origin <current-branch>
```

(Replace `<current-branch>` with the actual branch name — e.g., `feat/scaffolding-and-page` or whatever was created at the start of execution.)

- [ ] **Step 5: Open PR**

```bash
gh pr create --title "Plan 1: scaffolding + static page" --base main --body "$(cat <<'EOF'
## Summary

Implements Plan 1 from the design spec: repo scaffolding (config files, source list, initial data files) and a placeholder static page that fetches JSON snapshots and renders them according to the cycle-based layout rules.

## What works after merge

- `index.html` renders fixture snapshots correctly under every cycle window (verified manually with `?now=` time overrides)
- Cycle-selection logic has full unit-test coverage (`npm test`)
- The agent (Plan 2) can now write into `data/` against a defined contract
- Pause banner, stale banner, archive disclosure, and sub-page deep-link views all functional

## What does NOT work yet (Plan 2)

- No agent prompts or scheduled tasks — the page only has fixture data, not real digests
- Manual one-off agent runs not yet wired up

## Test plan

- [ ] `npm test` passes
- [ ] Manual rendering checklist in Plan 1 Task 7 passed
- [ ] No `node_modules` or other accidental artifacts in the diff

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 6: Report PR URL**

The `gh pr create` command prints the PR URL. Report it back to the user wrapped in a `<pr-created>` tag for the UI status card.

---

## Self-Review Checklist (writer fills in before marking plan done)

**Spec coverage** — does every spec section have at least one task?

- §1 Architecture & data flow → Tasks 1–4 (all components scaffolded)
- §2 Repo layout & JSON schema → Tasks 1–4 (every file path listed in spec layout exists; schemas are exercised by fixtures)
- §3 The three agent runs → DEFERRED to Plan 2 (out of scope for Plan 1)
- §4 Page rendering & UX rules → Tasks 5–7 (every UX rule from the spec is verified manually or via unit test)
- §5 Operations → Partially covered (kill switch file shape in Task 1; scheduled-task config DEFERRED to Plan 2; bootstrap DEFERRED to Plan 2; failure handling visual verified in Task 7)
- §6 Claude Design handoff → Not applicable to Plan 1; the placeholder is what gets handed off

**Placeholder scan** — searching for "TBD", "TODO", "implement later", "Add appropriate", "similar to":

- No occurrences of any of those phrases in this plan.

**Type consistency** — function names and shapes match across tasks:

- `pickSnapshots(now, manifest)` defined Task 5, used Task 6. ✓
- `{ topId, bottomId, banner }` shape consistent Task 5 → Task 6. ✓
- `manifest.snapshots[i]` shape: `{ id, type, calendar_date, file?, item_count?, tier_counts? }` — consistent across fixtures (Task 4) and access (Task 6). ✓
- `runs[i]` shape consistent fixture (Task 4) → access (Task 6). ✓
- `agent/control.json` shape consistent Task 1 → Task 6. ✓

**Scope** — focused enough for one plan?

- Plan 1 produces working software (a static page rendering JSON correctly)
- Total tasks: 8, total steps: ~50, well within "one implementation plan" scope
- No external infra dependencies (no scheduled tasks, no PAT, no Anthropic API) — those are Plan 2

**Ambiguity** — could any requirement be interpreted two ways?

- Time-window edge cases (midnight rollover, missing am file at 7am) explicitly tested in Task 5 with named test cases
- Banner stacking order (paused > stale > cycle) explicitly defined in `app.js` (Task 6 Step 2)
- Hero image fallback: `onerror="this.remove()"` is the documented fallback (Task 6)

Plan ready.
