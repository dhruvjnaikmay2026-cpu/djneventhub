# Agents and AI Assistant Instructions for EventHub

Purpose: give AI coding agents minimal, actionable guidance to work effectively in this repo.

Quick overview
- **Run / Test**: `npm run dev`, `npm run seed`, `npm run test`, `npm run test:ui`
- **Stack**: Next.js 14 frontend (TypeScript), Express backend (Node + Prisma), Playwright E2E tests

Where to look (link, don't duplicate)
- Project conventions and architecture: [CLAUDE.md](CLAUDE.md)
- Playwright best practices: [.claude/docs/playwright-best-practices.md](.claude/docs/playwright-best-practices.md)
- Domain/business rules: [.claude/docs/eventhub-domain.md](.claude/docs/eventhub-domain.md)

Key locations to inspect
- Frontend app: `frontend/app/` — pages and feature routes
- Frontend API clients/hooks: `frontend/lib/api` and `frontend/lib/hooks`
- Backend server: `backend/server.js`, `backend/src/` (controllers/services/repositories)
- Tests: `tests/` (Playwright specs)

Conventions agents should follow
- Tests: self-contained (login→action→assert), use provided test accounts.
- Locator priority: `data-testid` → role → label/placeholder → id → class.
- Avoid `page.waitForTimeout()`; prefer explicit `expect()` waits.
- Preserve existing docs: link to them rather than copying text.

Custom slash commands (available agents)
- `/generate-tests <feature>` — generate Playwright tests for a feature (place under `tests/`).
- `/review-tests <file>` — review Playwright test quality, suggest improvements.
- `/create-scenarios <area>` — produce test scenario lists or matrices.
- `/test-strategy <scenarios>` — recommend test-layer decomposition and priorities.

If you need to extend agent capabilities
- Create per-area instruction files in `.claude/docs/` for large domains (frontend, backend, seeding).
- Add small helper skills under `.claude/commands/` for repetitive tasks (seed, run subset tests).

Contact/Notes
- This repo already includes a high-level reference at [CLAUDE.md](CLAUDE.md). Follow its conventions first.
