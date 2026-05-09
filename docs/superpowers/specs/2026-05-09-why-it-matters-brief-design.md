# Spec: why_it_matters_brief + Agent Prompts Map

**Date:** 2026-05-09  
**Status:** Approved for implementation

---

## Problem

The card view shows a 2-line clamped excerpt of `why_it_matters` as a hook between the
title and summary. The existing field is written as a multi-sentence detail-view paragraph,
so even 2 lines can cut off mid-thought. The brief needs a different writing intent —
sharpest possible take, nothing cut off — not just a truncation of the longer version.

---

## What Ships

### 1. `agent/prompts/brief.md` (new file)

On-demand writing guide for `why_it_matters_brief`. Read during the curation pass (Pass 6),
before writing the field for any item. Contains:

- Purpose: card scannability, not a truncation of the full version
- Soft length guidance: ~150 characters, one complete sentence, fits 2 card lines
- Rule: re-write brief whenever `why_it_matters` is updated (enrichment)
- 3 validated examples:
  1. "Agentic AI for business is arriving as preconfigured workflow bundles, not chat —
     this is the clearest look yet at what that actually ships as."
  2. "Frontier-level capability, MIT licensed, no NVIDIA required — the 1M-token window
     is no longer an Anthropic/Google exclusive."
  3. "A frontier lab publicly turned down a Pentagon contract rather than weaken its usage
     policy — the first real test of whether AI safety terms survive government procurement."

### 2. `agent/prompts/index.md` (new file)

Agent-readable map of the prompts directory. Read during pre-flight alongside `profile.md`
and `sources.json`. Table of every file in `agent/prompts/`: what it governs, when it's
read (pre-flight vs. on-demand), harness vs. modular guidance. Concise — does not burn
meaningful tokens.

### 3. `agent/prompts/common.md` (two edits)

**Item schema** — add optional field directly after `why_it_matters`:
```
"why_it_matters_brief": "..."
```

**Curation pass (Pass 6)** — add one instruction:
> At the start of Pass 6, read `agent/prompts/brief.md` once. Use that guidance for all
> `why_it_matters_brief` fields written during this pass.

### 4. `agent/prompts/enrichment.md` (one addition)

When updating `why_it_matters` with new overnight context, also update
`why_it_matters_brief`. Fold into the same revision log entry
(e.g., `"updated why_it_matters and brief"`). No separate revision tracking for brief.

### 5. `components-stories.jsx` (one line)

Card render: `item.why_it_matters_brief ?? item.why_it_matters`

Existing items without the field continue to work via fallback.

---

## What Does NOT Change

- `digest.md` — no change. Brief is governed by common.md's Pass 6 instruction.
- `refresh.md` — no change. Same reason.
- Revision log structure — brief folds into existing enrichment revision entries.
- Hero image logic, source fetching, tier ranking — untouched.

---

## Future Work (tracked separately)

- `docs/future-modular-prompts.md` — full modularization of common.md
- `docs/future-architecture-html.md` — human-readable HTML architecture page

---

## Non-Goals

- No character limit enforcement (soft guidance + examples only)
- No separate brief revision tracking
- No backfill of existing snapshot data (fallback handles it)
