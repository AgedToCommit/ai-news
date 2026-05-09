# Enrichment Phase — 2am EST

You are running the **enrichment** phase.

**FIRST: read `agent/prompts/common.md`** end-to-end.

## Phase-specific inputs

- **Yesterday's `data/YYYY-(MM)-(DD-1)-pm.json`**. Compute yesterday's date in EST and read that file. This is your primary input.

If yesterday's pm file does NOT exist (e.g., bootstrap day, or yesterday's 1pm digest failed): skip prune+enrich and go straight to a small late-breaking pass on the last 12 hours of news. Treat it like a mini-digest. Note this in the run log entry's `error` field as `"no yesterday pm file — performed mini-digest only"`.

## Phase-specific behavior

This phase has TWO sub-tasks. Do them in order.

### Sub-task 1: Prune + enrich yesterday's pm

Iterate through yesterday's pm `items[]`:

For each item:
1. Do a focused web search: `<item.title> OR <relevant keywords> last:24h` (or use the canonical URL as a search anchor). Look for new context, comments, follow-up posts, benchmark numbers, contradicting takes.
2. **Decide:**
   - **KEEP + ENRICH** if there's meaningful new info → update `summary` to incorporate it. If `why_it_matters` changes, also update `why_it_matters_brief`. Append a revision entry: `{at: <now>, by: "enrichment", change: "<one-line description — mention both if brief was updated, e.g. 'updated why_it_matters and brief'>"}`. Set `enriched_overnight: true`. Set `last_revision_by: "enrichment"`.
   - **DROP** if no new substance → record in `dropped_in_phase` with `reason: "<short>"`. Don't include this item in the new file.

Goal: every item Gabe sees in the morning has either survived enrichment (got new context) or been added by enrichment/refresh.

### Sub-task 2: Late-breaking pass

Run a small light pass: RSS sweep filtered to the last 12 hours (since `now - 12h`), focused on Tier-1 sources (lab blogs, model release announcements). Tightly capped — add at most 2 items.

For each new item: same standard schema, with `added_by: "enrichment"`, `enriched_overnight: true`.

## Output

Write to `data/YYYY-MM-DD-am.json` where `YYYY-MM-DD` is today's calendar date in EST. **This is a NEW file** — the morning file begins here. (Refresh at 7am will overwrite this with the appended overnight items.)

If today's am file already exists (which would be rare — only if enrichment is being re-run): overwrite.

## Caps

| Cap | Value |
|---|---|
| Tokens | 100,000 |
| Wall time | 45 minutes |
| Web fetches | 30 |

## Run log entry

```json
{
  "run_id": "<ISO ts>-enrichment",
  "phase": "enrichment",
  "status": "success" | "failure" | "partial",
  "started_at": "...",
  "ended_at": "...",
  "wall_time_ms": ...,
  "tokens_used": ...,
  "tokens_breakdown": { ... },
  "fetches_made": ...,
  "items_input": <count from yesterday-pm + late-breaking candidates>,
  "items_output": <count in final am file>,
  "items_added": <count of late-breaking items added>,
  "items_kept": <count from yesterday-pm that survived>,
  "items_dropped": <count from yesterday-pm pruned>,
  "snapshot_written": "YYYY-MM-DD-am",
  "error": null,
  "partial": false
}
```

## Commit message

```
agent: enrichment run <ISO ts>
```
