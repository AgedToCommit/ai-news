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
