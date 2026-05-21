**Test Strategy — Booking Scenarios**

Summary: layer assignments for booking scenarios defined in [docs/test-scenarios.md](docs/test-scenarios.md).

**Distribution Table**

| Layer | Count | Primary Focus | Estimated Time/Test |
|---|---:|---|---:|
| Unit | 6 | Pure functions, validators (no I/O) | ~10–50ms |
| API / Integration | 10 | Business rules, DB interactions, auth, pruning | ~50–300ms |
| Component | 9 | UI rendering, state, spinners, disabled states | ~30–200ms |
| E2E | 8 | Full-stack critical journeys (auth + UI + API) | ~2–10s |

Notes: totals aim for a test pyramid shape — many quick unit tests, fewer slow E2E tests.

**Layer Assignments (ID → Layer) with source file references**

- TC-001 — E2E
  - Sources: `backend/src/controllers/bookingController.js`, `backend/src/services/bookingService.js`, `frontend/app/events/[id]/page.tsx`.
  - Focus: full booking flow (UI form → `POST /bookings` → DB persistence) — requires end-to-end verification.

- TC-002 — E2E + Component
  - Sources: `frontend/app/bookings/page.tsx`, `frontend/components/bookings/BookingCard.jsx`, `backend/src/services/bookingService.js` (`getBookings`).
  - Focus: bookings list rendering, pagination, and booking detail navigation; component tests for `BookingCard` props and layout.

- TC-003 — API + E2E
  - Sources: `backend/src/services/bookingService.js` (`cancelBooking`), `backend/src/repositories/bookingRepository.js`, `frontend/app/bookings/[id]/page.tsx`.
  - Focus: cancel deletion semantics and seat restore behavior; API tests for repository-side effects, E2E for toast/navigation and UX.

- TC-004 — E2E + Component
  - Sources: `backend/src/controllers/bookingController.js` (`clearAllBookings`), `frontend/app/bookings/page.tsx`.
  - Focus: clear-all operation and UI disabled/label state while in progress.

- TC-100 — Unit + API
  - Sources: `backend/src/services/bookingService.js` (`randomRef`, `generateUniqueRef`).
  - Focus: `randomRef` pattern (unit) and `generateUniqueRef` uniqueness with DB checks (integration).

- TC-101 — API
  - Sources: `backend/src/services/bookingService.js` (FIFO pruning logic), `backend/src/repositories/bookingRepository.js` (`findOldestUserBookingExcludingEvent`, `delete`).
  - Focus: verify automatic deletion of oldest booking when limit reached.

- TC-102 — API + E2E
  - Sources: `backend/src/services/bookingService.js` (personalAvailable computation).
  - Focus: per-user seat accounting and rejection when insufficient.

- TC-103 — Component (+ E2E smoke)
  - Sources: `frontend/app/bookings/[id]/page.tsx` (`RefundEligibility` component).
  - Focus: 4s spinner, eligible/ineligible messages — component tests with timers preferred.

- TC-200 — API + E2E
  - Sources: `backend/src/services/bookingService.js` (service-level `ForbiddenError` checks), `backend/src/controllers/bookingController.js`.
  - Focus: cross-user access forbidden (403) and UI shows `Access Denied`.

- TC-201 — API + E2E
  - Sources: `backend/src/middleware/authMiddleware.js`, frontend auth guards/pages (bookings).
  - Focus: unauthenticated access blocked and redirect to login.

- TC-300 / TC-301 — Unit + API
  - Sources: `backend/src/validators/bookingValidator.js`, `backend/src/controllers/bookingController.js`.
  - Focus: validate `quantity`, `customerEmail`, `customerPhone` at validator level; unit tests for validators and API tests for error payloads.

- TC-302 — API
  - Sources: `backend/src/services/bookingService.js` (throws `InsufficientSeatsError`).
  - Focus: insufficient seats rejection and clear error message.

- TC-303 — E2E + API
  - Sources: `frontend/app/bookings/[id]/page.tsx`, `backend/src/services/bookingService.js` (`getBookingById`).
  - Focus: missing/cancelled booking displays `Booking not found` and links back to My Bookings.

- TC-400 / TC-401 — API + E2E
  - Sources: `backend/src/services/bookingService.js`, `backend/src/repositories/bookingRepository.js`.
  - Focus: booking same event twice, combined FIFO removal, and seat-burn fallback behavior.

- TC-402 / TC-403 / TC-404 / TC-405 — Component (+ minimal E2E)
  - Sources: `frontend/app/bookings/page.tsx`, `frontend/components/bookings/BookingCard.jsx`, `frontend/app/bookings/[id]/page.tsx`.
  - Focus: empty state UI, loading skeletons, refund spinner, disabling/labeling during clearing.

**Decision rationale for contested assignments**

- Booking reference (TC-100): `randomRef` is pure and deterministic in format — unit tests validate pattern and edge cases. `generateUniqueRef` checks DB for collisions (calls `bookingRepository.findByRef`) so it requires integration tests when exercising uniqueness over persistence.

- FIFO pruning (TC-101 / TC-401): logic deletes DB rows (`bookingRepository.delete`) and selects oldest with repository helpers — integration tests required to validate correctness and race conditions; E2E adds coverage for UX side-effects.

- Seat accounting (TC-102 / TC-302): the `personalAvailable` computation happens server-side in `createBooking` and uses grouped booking sums (`bookingRepository.getBookedQuantitiesForEvents`) — test at API level for correctness and concurrency; E2E only for user-visible outcomes.

- Refund eligibility (TC-103 / TC-404): implemented purely in the frontend `RefundEligibility` component (4s timeout) — component tests with controlled timers are fastest and most reliable; only a single E2E smoke test is needed.

**Anti-patterns found in existing tests**

- Pure-logic tested at E2E: `tests/booking-management.spec.js` asserts booking-ref regex and other server-side rules via Playwright. These belong at unit/API levels for speed and determinism.
- Validation only tested via UI: input validation for `quantity`, `customerEmail`, and `customerPhone` is asserted in E2E flows; this should be unit-tested in `bookingValidator.js` and API-tested for error payloads.
- Large E2E surface area: many scenarios currently covered by slow Playwright tests — reduce E2E count to critical journeys and push stable checks down.

**Concrete next steps (recommended priorities)**

1. Unit tests (fast, immediate wins):
   - `randomRef` and `generateUniqueRef` behavior (`backend/src/services/bookingService.js`).
   - `bookingValidator` rules (`backend/src/validators/bookingValidator.js`).
   - `RefundEligibility` component behavior with fake timers (`frontend/app/bookings/[id]/page.tsx`).

2. API / Integration tests (DB-backed):
   - `createBooking` happy path, uniqueness, `InsufficientSeatsError`, FIFO pruning behavior.
   - Auth / 403 behaviors for `getBookingById`.

3. E2E: keep a focused suite for:
   - TC-001 (book flow), TC-003 (cancel + seat restore), TC-200 (cross-user access), TC-201 (unauthenticated access).

**References**
- Scenarios: `docs/test-scenarios.md`
- Services/controllers: `backend/src/services/bookingService.js`, `backend/src/controllers/bookingController.js`
- Repositories: `backend/src/repositories/bookingRepository.js`, `backend/src/repositories/eventRepository.js`
- Frontend booking UI: `frontend/app/bookings/page.tsx`, `frontend/components/bookings/BookingCard.jsx`, `frontend/app/bookings/[id]/page.tsx`
- Existing E2E: `tests/booking-management.spec.js`

If you'd like, I can now generate test stubs for the top-priority unit and API tests (booking ref, validators, createBooking edge cases). Which set should I create first?
