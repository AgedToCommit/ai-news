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
