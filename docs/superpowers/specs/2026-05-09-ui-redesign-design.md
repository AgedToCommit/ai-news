# UI Redesign — Design Spec
**Date:** 2026-05-09  
**Status:** Approved for planning

---

## Summary

A focused readability pass across the front page and article detail view. No new features — only layout, density, and color changes. Mobile experience is a first-class concern throughout.

---

## 1. Background Color

**Change:** `--paper` from `#f1ead8` → `#faf8f4`  
Also update `--paper-deep` and `--paper-light` proportionally to maintain depth relationship.

Rationale: The current warm cream competes with the persimmon accents and makes extended reading fatiguing. `#faf8f4` is cooler and lighter while preserving the paper feel.

---

## 2. Hero / Lead Story — Desktop Layout

**Current:** 7-col content left + 5-col image right, same height, no text interaction.

**New:** Classic newspaper float-wrap layout.
- Headline (`<h2>`) spans **full 12 columns** — large, edge-to-edge.
- Below the headline, the `HeroFigure` **floats right** (roughly 5-col width equivalent, `float: right`, `margin-left: 24px`, `margin-bottom: 16px`).
- Summary, why-it-matters, and CTA text **wrap alongside and below** the image.
- Clear float after the action row.

This is a CSS float pattern, not a grid change. The grid wrapper stays; the internal layout becomes float-based.

---

## 3. Hero / Lead Story — Mobile Layout

**Current:** Text stacks first, image appears below all text.

**New:**
- Headline renders first (full width).
- Hero image appears **immediately below the headline**, before the summary.
- Image uses a **cinematic crop**: `aspect-ratio: 3 / 1` (wide, short), `object-fit: cover`.
- Summary, why-it-matters, and CTA follow below the image.

Rationale: Gives the image visual context while preventing it from dominating a narrow screen.

---

## 4. Card View — "Why It Matters" Snippet

**Change:** Add a why-it-matters one-liner to story cards (both `StoryCard` and `Lead` collapsed state), positioned **between the title and the summary**.

**Rendering:**
- Pull from `item.why_it_matters`.
- Truncate to **1 line** via `overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical`.
- Style: persimmon left-border (2px), italic serif, smaller than summary (13px).
- Label "Why it matters" omitted in card view — the truncated italic stands alone.

---

## 5. Card View — Summary and Content Truncation

**Change:** Truncate all long-form text in card/collapsed views.

| Element | Clamp |
|---|---|
| Summary in card | 2 lines |
| Why-it-matters snippet in card | 1 line |
| Cross-source takes preview (if shown) | 2 lines |

Implementation: `display: -webkit-box; -webkit-line-clamp: N; -webkit-box-orient: vertical; overflow: hidden` on each element.

The value `N` should be a CSS custom property or inline style so it can be changed without hunting through JSX.

---

## 6. Article Detail View — Content Order

**Current order:**
1. Metadata eyebrow
2. H1 headline
3. Italic summary (lead)
4. Source metadata box
5. Hero image
6. Why it matters
7. Status pills / takes / revision history

**New order:**
1. Metadata eyebrow
2. H1 headline
3. Hero image (16:9 aspect ratio, unchanged)
4. Why it matters (full, not truncated)
5. Source metadata box
6. Italic summary (lead)
7. Status pills / takes / revision history

Rationale: H1 orients the reader, image reinforces it, why-it-matters answers "should I keep reading?", source establishes credibility, summary provides full detail. This matches mobile news-reading patterns.

---

## 7. Out of Scope (Deferred)

- Hero image scraping improvements (separate initiative)
- Compact/dense view toggle in masthead
- Replacing summary with why-it-matters in card view (potential future A/B test against option A)
- Any changes to the data pipeline, agent, or generation logic

---

## Files Affected

| File | Changes |
|---|---|
| `styles.css` | `--paper` color tokens; float-wrap CSS for hero; cinematic mobile crop; line-clamp utility rules |
| `components-stories.jsx` | `Lead` component layout refactor; `StoryCard` — add why-it-matters snippet, apply truncation |
| `components-reading.jsx` | `ReadingView` — reorder H1 / image / why-it-matters / source / summary |
| `components-core.jsx` | `WhyItMatters` — no structural change, verify it renders correctly in new positions |
