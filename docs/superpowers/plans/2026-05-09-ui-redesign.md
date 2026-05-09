# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve readability and visual hierarchy across the front page and article detail view, with mobile as a first-class concern.

**Architecture:** Five self-contained edits across three files — color tokens first (lowest risk), then Lead hero layout, then card density, then article detail reorder. Each task is independently verifiable in the browser by opening `index.html` via a local server.

**Tech Stack:** Vanilla React (CDN), no build step — edit files and refresh the browser. CSS custom properties, JSX, no test runner.

---

## File Map

| File | What changes |
|---|---|
| `styles.css` | Color tokens (lines 9–11); float-wrap CSS class; mobile hero override |
| `components-stories.jsx` | `Lead` — float-wrap layout; `StoryCard` — why-it-matters snippet + summary clamp |
| `components-reading.jsx` | `ReadingView` — reorder H1 / image / why-it-matters / source / summary |

---

## Task 1: Update Paper Color Tokens

**Files:**
- Modify: `styles.css:9-11`

- [ ] **Step 1: Edit the three paper tokens**

In `styles.css`, replace lines 9–11:

```css
  --paper: #faf8f4;          /* cooler off-white — less fatiguing */
  --paper-deep: #f0ece2;     /* shadow paper */
  --paper-light: #fdfcf9;    /* highlight paper */
```

- [ ] **Step 2: Verify in browser**

Open `index.html` (served via local server or direct file). Confirm:
- Background reads as a clean near-white (not the old warm cream)
- Scrollbar track (`--paper-deep`) is visibly slightly darker than the page
- Card highlights (`--paper-light`) are faintly lighter
- Persimmon accents and ink text still have strong contrast

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "design: update paper color to cooler off-white (#faf8f4)"
```

---

## Task 2: Desktop Hero — Full-Width Headline + Float-Wrap Image

**Files:**
- Modify: `components-stories.jsx:6-68` (the `Lead` function)
- Modify: `styles.css` (add `.lead-hero-float` rule before the mobile breakpoints)

- [ ] **Step 1: Add the float class to styles.css**

In `styles.css`, insert before the `/* MOBILE */` comment block (before line 222):

```css
/* Lead hero float-wrap (newspaper layout) */
.lead-hero-float {
  float: right;
  width: 42%;
  margin-left: 28px;
  margin-bottom: 16px;
  position: relative;
}
.lead-float-wrap::after {
  content: "";
  display: table;
  clear: both;
}
```

- [ ] **Step 2: Rewrite the Lead component**

In `components-stories.jsx`, replace the entire `Lead` function (lines 6–68) with:

```jsx
function Lead({ item, onOpen }) {
  return (
    <section style={{ padding: "44px 0 36px" }}>
      <div className="flex center gap-m" style={{ marginBottom: 18, flexWrap: "wrap" }}>
        <span className="mono" style={{ color: "var(--persimmon)" }}>● Lead Story</span>
        <span className="eyebrow">{item._tierLabel}</span>
        <TierMark tier={item.tier}/>
        <RegionBadge region={item.region}/>
      </div>

      <h2 className="display"
          onClick={() => onOpen(item)}
          style={{
            fontSize: "clamp(44px, 5.2vw, 78px)",
            margin: "0 0 24px",
            cursor: "pointer",
            letterSpacing: "-0.02em",
            textWrap: "balance"
          }}>
        {item.title}
      </h2>

      <div className="lead-float-wrap">
        <div className="lead-hero-float">
          <HeroFigure item={item} height={340}/>
          <div style={{
            position: "absolute", top: -10, right: -10,
            background: "var(--ink)", color: "var(--paper)",
            padding: "10px 14px",
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.12em"
          }}>
            № {String(item._ordinal + 1).padStart(2, "0")}
          </div>
          <div className="mono" style={{ marginTop: 10, color: "var(--ink-faint)" }}>
            Fig. — {item.hero_image ? "From source." : "Editorial illustration."}
          </div>
        </div>

        <p style={{
          fontFamily: "var(--serif-text)",
          fontSize: 19, lineHeight: 1.5,
          color: "var(--ink-soft)",
          margin: "0 0 18px",
          textWrap: "pretty"
        }}>
          {item.summary}
        </p>

        <WhyItMatters text={item.why_it_matters}/>

        <div className="flex center gap-l" style={{ marginTop: 22, flexWrap: "wrap", rowGap: 12 }}>
          <button className="btn btn-primary" onClick={() => onOpen(item)}>Read the Story →</button>
          <span className="mono">
            {item.source.name} · {item.source.type.toUpperCase()}
          </span>
          <StatusPills item={item}/>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify in browser at desktop width (≥961px)**

Confirm:
- Headline spans the full page width
- Image floats to the right (roughly 42% wide)
- Summary and why-it-matters text sits to the left of the image and wraps below it
- Ordinal badge (№ XX) sits in the top-right corner of the image
- CTA button row appears below the wrapped text, clearing the float

- [ ] **Step 4: Commit**

```bash
git add styles.css components-stories.jsx
git commit -m "design: lead hero — full-width headline + newspaper float-wrap image"
```

---

## Task 3: Mobile Hero — Cinematic Crop Below Headline

**Files:**
- Modify: `styles.css` — inside the `@media (max-width: 640px)` block

- [ ] **Step 1: Add mobile overrides for the float**

In `styles.css`, inside the `@media (max-width: 640px)` block (after the existing rules, before the closing `}`), add:

```css
  /* Lead: collapse float to stacked cinematic strip */
  .lead-hero-float {
    float: none !important;
    width: 100% !important;
    margin-left: 0 !important;
    margin-bottom: 20px;
  }
  .lead-hero-float figure {
    height: auto !important;
    aspect-ratio: 3 / 1 !important;
  }
```

- [ ] **Step 2: Verify in browser at mobile width (≤640px)**

Use browser devtools to emulate a phone (e.g. iPhone 14, 390px wide). Confirm:
- Headline renders first, full width
- Image appears immediately below the headline as a wide, short cinematic strip (approximately 3:1 ratio)
- Summary text follows below the image
- Nothing overflows horizontally

- [ ] **Step 3: Also check tablet width (641px–960px)**

At tablet size, the float should still be active (42% width, right-floated). Confirm the layout still looks intentional — text should wrap to the left of the image.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "design: mobile lead hero — cinematic 3:1 crop stacked below headline"
```

---

## Task 4: Card View — Why-It-Matters Snippet + Summary Clamp

**Files:**
- Modify: `components-stories.jsx:70-131` (the `StoryCard` function)

- [ ] **Step 1: Rewrite the StoryCard content block**

In `components-stories.jsx`, replace lines 94–111 (from the `<h3>` through the closing `</p>` of the summary) with:

```jsx
      <h3 className="display" style={{
        fontSize: span >= 6 ? 36 : 26,
        margin: "0 0 10px",
        letterSpacing: "-0.01em",
        textWrap: "balance"
      }}>
        {item.title}
      </h3>

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
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical"
        }}>
          {item.why_it_matters}
        </p>
      )}

      <p style={{
        fontFamily: "var(--serif-text)",
        fontSize: 14, lineHeight: 1.5,
        color: "var(--ink-soft)",
        margin: "0 0 12px",
        textWrap: "pretty",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical"
      }}>
        {item.summary}
      </p>
```

- [ ] **Step 2: Verify in browser**

Open the front page and check the story cards (Tier 2 and Tier 3 sections). Confirm:
- Each card shows: image → title → why-it-matters (1 line, italic, persimmon left border) → summary (2 lines, cut off with ellipsis if longer)
- Cards are noticeably shorter than before — less scrolling required to see multiple stories
- Stories without `why_it_matters` data skip the snippet gracefully (no empty element)

- [ ] **Step 3: Commit**

```bash
git add components-stories.jsx
git commit -m "design: cards — add why-it-matters snippet, clamp summary to 2 lines"
```

---

## Task 5: Article Detail View — Reorder Content

**Files:**
- Modify: `components-reading.jsx:54-102` (the `<article>` block inside `ReadingView`)

**Target order:** metadata eyebrow → H1 → hero image + caption → why-it-matters → source box → summary → status pills

- [ ] **Step 1: Rewrite the article content block**

In `components-reading.jsx`, replace lines 54–102 (from `<article className="page"` through `<div style={{ marginTop: 26 }}><StatusPills...`) with:

```jsx
      <article className="page" style={{ padding: "60px var(--margin) 100px", maxWidth: 980 }}>
        <div className="flex center gap-m" style={{ marginBottom: 22, flexWrap: "wrap" }}>
          <span className="eyebrow" style={{ color: "var(--persimmon)" }}>{item._tierLabel}</span>
          <span className="dot" style={{ background: "var(--ink)" }} />
          <TierMark tier={item.tier} />
          <span className="dot" style={{ background: "var(--ink)" }} />
          <RegionBadge region={item.region} />
          <span className="mono" style={{ color: "var(--ink-faint)" }}>
            № {String(item._ordinal + 1).padStart(2, "0")}
          </span>
        </div>

        <h1 className="display" style={{
          fontSize: "clamp(40px, 5.2vw, 80px)",
          margin: "0 0 28px", letterSpacing: "-0.02em", textWrap: "balance"
        }}>
          {item.title}
        </h1>

        <HeroFigure item={item} aspect="16/9" style={{ marginBottom: 12 }} />
        <div className="mono" style={{ color: "var(--ink-faint)", marginBottom: 32 }}>
          {item.hero_image ?
            "Fig. — From source." :
            "Fig. — Editorial illustration. Drawn for this dispatch."}
        </div>

        <WhyItMatters text={item.why_it_matters} />

        <div className="flex between center" style={{
          padding: "12px 0",
          borderTop: "1px solid var(--ink)",
          borderBottom: "1px solid var(--ink)",
          margin: "26px 0 32px", flexWrap: "wrap", gap: 12
        }}>
          <span className="mono">Source · {item.source.name}</span>
          <span className="mono">{item.source.type.toUpperCase()}</span>
          <span className="mono">Added {new Date(item.added_at).toLocaleDateString()}</span>
        </div>

        <p style={{
          fontFamily: "var(--serif-text)", fontStyle: "italic",
          fontSize: 21, lineHeight: 1.45,
          color: "var(--ink-soft)", margin: "0 0 26px",
          textWrap: "pretty", maxWidth: 780
        }}>
          {item.summary}
        </p>

        <div style={{ marginTop: 0 }}><StatusPills item={item} /></div>
```

- [ ] **Step 2: Verify in browser — open any story**

Click into any story from the front page. Confirm the reading order is:
1. Eyebrow metadata (tier, region, ordinal)
2. Big headline (H1)
3. Hero image (16:9)
4. Figure caption
5. Why it matters (persimmon left border, italic)
6. Source metadata bar (bordered top/bottom)
7. Full italic summary
8. Status pills (if any)

- [ ] **Step 3: Check mobile reading view**

Emulate a phone in devtools. Confirm the reading order is the same and nothing overflows. The image should be full-width at 16:9 — that's fine for the detail view (only the Lead card gets the cinematic crop).

- [ ] **Step 4: Commit**

```bash
git add components-reading.jsx
git commit -m "design: article detail — reorder to H1 → image → why-it-matters → source → summary"
```

---

## Done

All five tasks produce a working, visually verifiable result independently. Suggested browser test after all tasks complete:

1. Open front page at full desktop width — check Lead hero, card density
2. Open front page at 390px (iPhone) — check cinematic crop, card density
3. Open any Tier 1 story — verify new reading view order
4. Open any Tier 2/3 story — verify card snippet and truncation
