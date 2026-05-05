# Digest Phase — 1pm EST

You are running the **digest** phase.

**FIRST: read `agent/prompts/common.md`** end-to-end. It contains the harness: identity, environment, pre-flight, config reads, schemas, source-fetching pattern, curation rules, hero-image extraction, failure handling, and the git commit/push contract. Do not skip the common harness.

## Phase-specific inputs

In addition to the config files in common.md's pre-flight:

- **This morning's `data/YYYY-MM-DD-am.json` if it exists** (today's calendar date). If yes, read its `items[]` — these items are already shown to Gabe in the morning section of the page, and the promotion rule below applies.

## Phase-specific behavior

Run all 7 passes from common.md (RSS sweep → scrape → ranking → deep fetch → discovery search → curate/dedup → write). Tier 1 emphasis. Up to ~15 items total in the output, flexible per tier.

### Promotion rule (only applies if today's am file exists)

Items already in today's am file are **excluded by default** from the pm output. Gabe sees them in the morning section already.

**Exception (rare):** If a Tier-1 item from the am file has *materially deepened* during the day (more sources covering it, accumulated commentary, follow-up posts from the originating org), promote it into the pm with:
- `promoted_from_am: true`
- A richer `summary` reflecting the afternoon context
- A new entry in `revisions[]` with `change: "promoted from am with afternoon context: <one-line>"`

Default behavior: do not promote. Promotion is the exception, not the rule.

### Edge case: no am file exists for today

Likely means the 2am or 7am run failed (or it's the first day after bootstrap). Just run the digest normally — no promotion logic to apply.

## Output

Write to `data/YYYY-MM-DD-pm.json` where `YYYY-MM-DD` is today's calendar date in EST.

If the file already exists (e.g., a prior digest run partially completed today), overwrite it — only the latest digest is canonical.

## Caps

| Cap | Value |
|---|---|
| Tokens | 100,000 |
| Wall time | 60 minutes |
| Web fetches (combined RSS + scrape + deep fetch + discovery) | 50 |

## Run log entry

```json
{
  "run_id": "<ISO ts>-digest",
  "phase": "digest",
  "status": "success" | "failure" | "partial",
  "started_at": "...",
  "ended_at": "...",
  "wall_time_ms": ...,
  "tokens_used": ...,
  "tokens_breakdown": { ... },
  "fetches_made": ...,
  "items_input": <count of candidates after Pass 3 ranking>,
  "items_output": <count in final snapshot>,
  "items_added": <count newly created (not in am file)>,
  "items_kept": 0,
  "items_dropped": 0,
  "snapshot_written": "YYYY-MM-DD-pm",
  "error": null,
  "partial": false
}
```

(`items_kept` and `items_dropped` are zero for digest — those fields apply to enrichment.)

## Commit message

```
agent: digest run <ISO ts>
```
