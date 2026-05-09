# Future: Modularize agent/prompts/common.md

common.md is currently a monolith (~280 lines). The brief.md pattern (added 2026-05-09)
proves the model handles on-demand file reads cleanly. Good candidates for splitting:

- agent/prompts/schema.md       — full JSON snapshot/manifest/run-log schemas
- agent/prompts/hero-image.md   — hero image extraction priority chain + rules
- agent/prompts/sources-guide.md — how to process each source type (rss, scrape, youtube)
- agent/prompts/curation.md     — tier ranking rules, dedup logic, no-hype-language list

common.md would become a short harness: identity, pre-flight checklist, cap tables,
and READ instructions pointing to the modular files.
