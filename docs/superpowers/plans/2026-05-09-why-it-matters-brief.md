# why_it_matters_brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `why_it_matters_brief` — a one-sentence card-preview field — to the agent's data schema and card render, backed by a modular `brief.md` writing guide and an `index.md` prompts map.

**Architecture:** Two new prompt files (`brief.md`, `index.md`) are added to `agent/prompts/`. `common.md` is updated to reference them at the right moments (pre-flight for `index.md`, once at the start of Pass 6 for `brief.md`). `enrichment.md` gets one addition: re-write the brief when the full `why_it_matters` changes. The card in `components-stories.jsx` falls back to `why_it_matters` when `brief` is absent, so existing snapshot data is unaffected.

**Tech Stack:** Markdown (agent prompts), JSX (card component)

---

### Task 1: Create `agent/prompts/brief.md`

**Files:**
- Create: `agent/prompts/brief.md`

- [ ] **Step 1: Create the file**

Write `agent/prompts/brief.md` with this exact content:

```markdown
# why_it_matters_brief — Writing Guide

`why_it_matters_brief` is the card-preview field. It renders as a 2-line italic hook on
story cards, between the headline and summary. It is NOT a truncation of `why_it_matters`
— it is a different write with a different intent: one complete sentence, sharpest possible
take, written to be fully readable at card width (~150 characters).

## Rules

- One sentence. Complete thought — nothing cut off.
- Aim for ~150 characters. If two short sentences prevent a dangling thought, use two —
  but prefer one.
- No hype language (same rule as `why_it_matters`).
- Lead with the concrete claim, then the threshold-moment framing.
- Re-write this field whenever `why_it_matters` is updated during enrichment.

## Pattern that works

Concrete claim — em dash — why this is a first or threshold moment.

## Examples

"Agentic AI for business is arriving as preconfigured workflow bundles, not chat — this is
the clearest look yet at what that actually ships as."

"Frontier-level capability, MIT licensed, no NVIDIA required — the 1M-token window is no
longer an Anthropic/Google exclusive."

"A frontier lab publicly turned down a Pentagon contract rather than weaken its usage
policy — the first real test of whether AI safety terms survive government procurement."
```

- [ ] **Step 2: Commit**

```bash
git add agent/prompts/brief.md
git commit -m "feat: add agent/prompts/brief.md — why_it_matters_brief writing guide"
```

---

### Task 2: Create `agent/prompts/index.md`

**Files:**
- Create: `agent/prompts/index.md`

- [ ] **Step 1: Create the file**

Write `agent/prompts/index.md` with this exact content:

```markdown
# agent/prompts — Directory Map

Read this file during pre-flight (after config files). It maps every file in this
directory: what it governs, when to read it, and whether it is a harness, phase, or
modular guidance file.

| File | Governs | Read when | Type |
|---|---|---|---|
| common.md | Identity, pre-flight checklist, hard caps, source-fetching passes 1–7, curation rules, all schemas | First, every run | Harness |
| digest.md | Digest phase behavior, output path, caps | Phase entry point — digest | Phase |
| enrichment.md | Enrichment phase behavior, prune/enrich logic, caps | Phase entry point — enrichment | Phase |
| refresh.md | Refresh phase behavior, fallback logic, caps | Phase entry point — refresh | Phase |
| brief.md | How to write `why_it_matters_brief` | On-demand — once at the start of Pass 6 | Modular guidance |
| index.md | This map | Pre-flight, after config files | Map |
```

- [ ] **Step 2: Commit**

```bash
git add agent/prompts/index.md
git commit -m "feat: add agent/prompts/index.md — agent-readable prompts directory map"
```

---

### Task 3: Update `common.md` — pre-flight + Pass 6 + schema

**Files:**
- Modify: `agent/prompts/common.md`

Three surgical edits to this file. Make them in order.

#### Edit A: Pre-flight — add index.md to the config read list

Find the pre-flight section (around line 30). The current list reads:

```
- `agent/profile.md` — reader profile. Use this to write `why_it_matters` tags in the right voice.
- `agent/sources.json` — structured source list ...
- `agent/control.json` — kill switch. ...
- `data/index.json` — manifest of existing snapshots.
- `data/runs.json` — run log. ...
```

Add one line at the top of that list:

```
- `agent/prompts/index.md` — map of every prompt file and when to read it. Read this before the phase-specific prompt.
```

So the list becomes:

```
- `agent/prompts/index.md` — map of every prompt file and when to read it. Read this before the phase-specific prompt.
- `agent/profile.md` — reader profile. Use this to write `why_it_matters` tags in the right voice.
- `agent/sources.json` — structured source list ...
- `agent/control.json` — kill switch. ...
- `data/index.json` — manifest of existing snapshots.
- `data/runs.json` — run log. ...
```

- [ ] **Step 1: Make Edit A**

#### Edit B: Pass 6 — add brief.md read + why_it_matters_brief instruction

Find the Pass 6 section (around line 110). It currently reads:

```markdown
### Pass 6: Curate + dedup

- Group candidate items by canonical content URL
- When 2+ sources cover the same story, fold them into a single item with `takes[]` populated
- Write 1–2 sentence summaries
- Write the `why_it_matters` tag — connect to Gabe's stack when natural; don't force it. NO HYPE LANGUAGE.
- Assign tier (1, 2, or 3)
- Assign region (`US` | `EU` | `Asia` | `Global`)
- Generate alt text for hero images if `og:image` doesn't include one
```

Replace with:

```markdown
### Pass 6: Curate + dedup

- Group candidate items by canonical content URL
- When 2+ sources cover the same story, fold them into a single item with `takes[]` populated
- Write 1–2 sentence summaries
- Write the `why_it_matters` tag — connect to Gabe's stack when natural; don't force it. NO HYPE LANGUAGE.
- **Read `agent/prompts/brief.md` once now.** Use that guidance to write `why_it_matters_brief` for every item in this pass.
- Assign tier (1, 2, or 3)
- Assign region (`US` | `EU` | `Asia` | `Global`)
- Generate alt text for hero images if `og:image` doesn't include one
```

- [ ] **Step 2: Make Edit B**

#### Edit C: Schema — add `why_it_matters_brief` field

Find the item schema in the Schemas section (around line 157). It currently has:

```json
"why_it_matters": "Plain-English connection to Gabe.",
```

Add the new optional field immediately after it:

```json
"why_it_matters": "Plain-English connection to Gabe.",
"why_it_matters_brief": "One sharp sentence for card preview — complete thought, ~150 chars.",
```

- [ ] **Step 3: Make Edit C**

- [ ] **Step 4: Commit**

```bash
git add agent/prompts/common.md
git commit -m "feat: add why_it_matters_brief to common.md schema and Pass 6 read instruction"
```

---

### Task 4: Update `enrichment.md` — re-write brief on why_it_matters change

**Files:**
- Modify: `agent/prompts/enrichment.md`

#### Edit: KEEP + ENRICH block

Find the KEEP + ENRICH decision in Sub-task 1 (around line 24). It currently reads:

```markdown
   - **KEEP + ENRICH** if there's meaningful new info → update `summary` to incorporate it. Append a revision entry: `{at: <now>, by: "enrichment", change: "<one-line description>"}`. Set `enriched_overnight: true`. Set `last_revision_by: "enrichment"`.
```

Replace with:

```markdown
   - **KEEP + ENRICH** if there's meaningful new info → update `summary` to incorporate it. If `why_it_matters` changes, also update `why_it_matters_brief`. Append a revision entry: `{at: <now>, by: "enrichment", change: "<one-line description — mention both if brief was updated, e.g. 'updated why_it_matters and brief'>"}`. Set `enriched_overnight: true`. Set `last_revision_by: "enrichment"`.
```

- [ ] **Step 1: Make the edit**

- [ ] **Step 2: Commit**

```bash
git add agent/prompts/enrichment.md
git commit -m "feat: enrichment re-writes why_it_matters_brief when full field changes"
```

---

### Task 5: Update `components-stories.jsx` — card render fallback

**Files:**
- Modify: `components-stories.jsx:102-119`

The card currently renders (lines 102–119):

```jsx
{item.why_it_matters && (
  <p style={{
    fontFamily: "var(--serif-text)",
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 1.5,
    color: "var(--ink-soft)",
    margin: "0 0 8px",
    paddingLeft: 10,
    borderLeft: "2px solid var(--persimmon)",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical"
  }}>
    {item.why_it_matters}
  </p>
)}
```

- [ ] **Step 1: Update the card render**

Replace the two occurrences of `item.why_it_matters` in that block with `item.why_it_matters_brief ?? item.why_it_matters`:

```jsx
{(item.why_it_matters_brief ?? item.why_it_matters) && (
  <p style={{
    fontFamily: "var(--serif-text)",
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 1.5,
    color: "var(--ink-soft)",
    margin: "0 0 8px",
    paddingLeft: 10,
    borderLeft: "2px solid var(--persimmon)",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical"
  }}>
    {item.why_it_matters_brief ?? item.why_it_matters}
  </p>
)}
```

- [ ] **Step 2: Visual verification**

Open the site in a browser and confirm:
- Cards with existing data (no `why_it_matters_brief`) still show the full `why_it_matters` text, clamped to 2 lines — fallback working.
- Cards with `why_it_matters_brief` populated show the brief instead.
- No console errors.

- [ ] **Step 3: Commit**

```bash
git add components-stories.jsx
git commit -m "feat: card render uses why_it_matters_brief with fallback to why_it_matters"
```
