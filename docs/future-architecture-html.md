# Future: Human-Readable Architecture Page (HTML)

A standalone HTML page (not part of the main app) that maps the full agent architecture
for any human reader who isn't Gabe — collaborators, future maintainers, etc.

Should cover:
- The 3 phases (digest / enrichment / refresh) and their schedule, caps, and data flow
- Which prompt files govern which behaviors (common.md, phase files, modular files)
- The snapshot file lifecycle (pm → am enrichment → am refresh)
- Data shapes (item schema, manifest, run log)
- The modular prompts pattern (index.md + on-demand files like brief.md)

Design notes:
- Visual flow diagram preferred over walls of prose
- File relationship map (what reads what, what writes what)
- Can live at docs/architecture.html or as a linked page in the site nav
- Build this after the common.md modularization is done (that work will finalize the file map)
