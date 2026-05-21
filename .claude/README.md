# .claude

Purpose: host agent customization files and small skill/docs for AI assistants working in this repo.

Structure:
- `commands/` — slash-command handlers and short scripts for agents (e.g., generate-tests)
- `docs/` — small skill documents and per-area instructions (frontend, backend, tests)

Guidance:
- Keep documents short and link to existing docs (see [CLAUDE.md](../CLAUDE.md)).
- Prefer single-purpose skill files under `docs/` (e.g., `playwright-best-practices.md`).

Add skills by creating files in `docs/` and command definitions in `commands/`.
