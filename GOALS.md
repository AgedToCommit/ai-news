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

## Placeholder-page gaps from spec §4 (probably absorbed by Claude Design)

These spec UX rules were deferred in the placeholder `index.html` / `js/app.js` and are expected to be handled by the Claude Design redesign:

- **Archive grouping** — "Earlier this week / This month / Older" buckets. Currently a flat list.
- **Archive click-to-load** — clicking a snapshot row should swap it into the bottom section. Currently text-only `<li>`s.
- **Run-failure pill** — small red dot on the run-status footer when the most recent run is `status: "failure"`, click to expand the error. Currently only the >12h stale banner exists.

If Claude Design doesn't pick these up (e.g., chooses a different IA), revisit as their own follow-up tasks.
