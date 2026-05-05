# Refresh Phase — 7am EST

You are running the **refresh** phase. This is the smallest, cheapest run of the day.

**FIRST: read `agent/prompts/common.md`** end-to-end.

## Phase-specific inputs

- **This morning's `data/YYYY-MM-DD-am.json` if it exists** (today's calendar date in EST). Written by the 2am enrichment run.

If today's am file does NOT exist (i.e., 2am enrichment failed): see "Resilience fallback" below.

## Phase-specific behavior

### Standard path (am file exists)

1. Read this morning's am file.
2. Run a tightly-scoped late-breaking sweep:
   - RSS sweep filtered to the last 5 hours (since the 2am run's `ended_at`)
   - Scrape sweep filtered to anything posted after the 2am run's `ended_at`
3. Append up to **3** new items. Each gets `added_by: "refresh"`, `enriched_overnight: true`.
4. Optional small re-pass: for items in the existing am file where `tier == 1` and overnight chatter appeared since 2am, refine the `summary` and append a revision entry with `by: "refresh"`.
5. Write the merged file back to the SAME path: `data/YYYY-MM-DD-am.json`.

### Resilience fallback (am file does NOT exist)

This means the 2am enrichment run failed. Refresh takes over — do BOTH jobs in one run:

1. Read yesterday's pm (`data/YYYY-(MM)-(DD-1)-pm.json`).
2. Run enrichment.md's full sub-task 1 (prune + enrich yesterday's items).
3. Run enrichment.md's sub-task 2 (late-breaking pass on last 12 hours).
4. Run refresh's standard sub-task 2 (the last-5-hour sweep, ~1–3 fresh items).
5. Write the resulting am file to `data/YYYY-MM-DD-am.json` (today's date).

This may exceed the standard refresh caps. If so, raise to enrichment's caps for this run only (100K tokens, 45min wall, 30 fetches). Mark the run log entry's `phase` as `refresh` but set a custom field `fallback_did_enrichment: true`.

## Output

`data/YYYY-MM-DD-am.json` (today's date, EST) — same file as 2am enrichment, overwritten with the appended content.

## Caps (standard path)

| Cap | Value |
|---|---|
| Tokens | 60,000 |
| Wall time | 25 minutes |
| Web fetches | 20 |

## Caps (resilience fallback)

| Cap | Value |
|---|---|
| Tokens | 100,000 |
| Wall time | 45 minutes |
| Web fetches | 30 |

## Run log entry

```json
{
  "run_id": "<ISO ts>-refresh",
  "phase": "refresh",
  "status": "success" | "failure" | "partial",
  "started_at": "...",
  "ended_at": "...",
  "wall_time_ms": ...,
  "tokens_used": ...,
  "tokens_breakdown": { ... },
  "fetches_made": ...,
  "items_input": <count of new candidates>,
  "items_output": <count in final am file>,
  "items_added": <count newly added by refresh>,
  "items_kept": <items already in am file that stayed>,
  "items_dropped": <items removed during fallback enrichment, if applicable>,
  "snapshot_written": "YYYY-MM-DD-am",
  "fallback_did_enrichment": <bool>,
  "error": null,
  "partial": false
}
```

## Commit message

```
agent: refresh run <ISO ts>
```

If fallback was triggered: `agent: refresh+enrichment fallback run <ISO ts>`.
