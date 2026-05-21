### TC-001: Book tickets for an event from the event detail page
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is authenticated and an event has enough available seats.
**Steps**:
1. Sign in and navigate to an event detail page.
2. Enter valid booking details (name, email, phone, quantity = 1).
3. Submit the booking form.
**Expected Results**:
- The booking confirmation screen displays.
- A booking reference is shown.
- The booking ref uses the event title first letter and a dash-prefixed random code.
- The total price equals event price × quantity.
- The "View My Bookings" button is visible.
**Business Rule**: On booking, seat count reduces immediately and booking reference is generated.
**Suggested Layer**: E2E

### TC-002: View the bookings list after creating a booking
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User has at least one confirmed booking.
**Steps**:
1. Sign in and go to the "My Bookings" page.
2. Confirm the booking list loads successfully.
3. Click a booking card to open its detail page.
**Expected Results**:
- The bookings page displays the user's bookings.
- Each booking card includes event title, booking ref, and quantity.
- Clicking a booking opens the booking detail screen.
**Business Rule**: After booking, user can view bookings via "View My Bookings".
**Suggested Layer**: E2E

### TC-003: Cancel a booking from the booking detail page and restore seats
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User has a confirmed booking for an event.
**Steps**:
1. Sign in and open the booking detail page for the confirmed booking.
2. Click "Cancel Booking" and confirm the cancellation.
3. Return to the related event page.
**Expected Results**:
- A success toast appears: "Booking cancelled successfully".
- The booking is removed from the user's bookings list.
- The event's available seats increase by the cancelled booking quantity.
**Business Rule**: Booking deletion immediately frees seats.
**Suggested Layer**: E2E

### TC-004: Clear all bookings from the bookings page
**Category**: Happy Path
**Priority**: P2
**Preconditions**: User has multiple bookings.
**Steps**:
1. Sign in and navigate to the "My Bookings" page.
2. Click "Clear all bookings".
3. Confirm the browser prompt.
**Expected Results**:
- All bookings are removed from the bookings page.
- The bookings list displays the empty state.
- A confirmation message is shown if available.
**Business Rule**: "Clear All Bookings" button removes all bookings in one go.
**Suggested Layer**: E2E

### TC-100: Verify booking reference begins with event title first letter
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User is authenticated and books an event.
**Steps**:
1. Sign in and book an event with a known title.
2. Observe the booking reference in the confirmation screen and booking detail.
**Expected Results**:
- The booking ref starts with the uppercase first letter of the event title.
- The reference follows the pattern `[FIRST_LETTER]-XXXXXX`.
**Business Rule**: Booking reference first character MUST match the event title's first character.
**Suggested Layer**: API / E2E

### TC-101: Creating a 10th booking removes the oldest booking (FIFO pruning)
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User already has 9 bookings.
**Steps**:
1. Sign in and confirm the user has exactly 9 bookings.
2. Book one more event.
3. Refresh the bookings list.
**Expected Results**:
- The system accepts the new booking.
- The oldest existing booking is no longer present.
- The bookings page still shows a maximum of 9 bookings.
**Business Rule**: Max 9 bookings per user; when the limit is reached, the oldest booking is automatically deleted.
**Suggested Layer**: API / E2E

### TC-102: Verify booking cancellation immediately frees seats for the same event
**Category**: Business Rule
**Priority**: P2
**Preconditions**: User has a booking on an event and the event is visible.
**Steps**:
1. Note the event's available seat count before cancellation.
2. Cancel the booking from the detail page.
3. Reopen the event page.
**Expected Results**:
- The event's available seats increase by the cancelled booking's quantity.
- The event page booking button is enabled if seats become available.
**Business Rule**: Booking deletion immediately frees seats.
**Suggested Layer**: E2E

### TC-103: Verify refund eligibility messages for single and multiple tickets
**Category**: Business Rule
**Priority**: P2
**Preconditions**: User has one single-ticket booking and one multi-ticket booking.
**Steps**:
1. Open the detail page of a booking with quantity = 1.
2. Click "Check eligibility for refund?".
3. Wait for the result.
4. Repeat for a booking with quantity > 1.
**Expected Results**:
- Single-ticket booking shows "Eligible for refund" message.
- Multi-ticket booking shows "Not eligible for refund" message including the ticket quantity.
**Business Rule**: Single ticket bookings are eligible; multi-ticket bookings are not refundable.
**Suggested Layer**: Component / E2E

### TC-200: Prevent cross-user access to another user's booking detail
**Category**: Security
**Priority**: P0
**Preconditions**: Two different authenticated users exist, each with their own bookings.
**Steps**:
1. Sign in as User A and note a booking ID.
2. Sign out and sign in as User B.
3. Navigate directly to User A's booking detail URL.
**Expected Results**:
- The page shows "Access Denied".
- The user cannot see booking details for User A.
**Business Rule**: Cross-user access to bookings returns 403 Forbidden ("Access Denied").
**Suggested Layer**: E2E

### TC-201: Prevent unauthenticated access to bookings pages
**Category**: Security
**Priority**: P0
**Preconditions**: User is not signed in.
**Steps**:
1. Open the bookings list URL while signed out.
2. Open a booking detail URL while signed out.
**Expected Results**:
- The user is redirected to or blocked by the login page.
- Bookings content is not accessible without authentication.
**Business Rule**: Booking endpoints require authentication and per-user sandbox isolation.
**Suggested Layer**: E2E

### TC-300: Reject booking creation when quantity is invalid
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated and on an event booking form.
**Steps**:
1. Enter a booking quantity of 0.
2. Submit the form.
3. Repeat with quantity = 11.
**Expected Results**:
- The request is rejected with validation errors.
- The UI or API returns "Quantity must be an integer between 1 and 10".
**Business Rule**: Quantity must be between 1 and 10.
**Suggested Layer**: API / E2E

### TC-301: Reject booking creation with invalid contact details
**Category**: Negative
**Priority**: P2
**Preconditions**: User is authenticated and on an event booking form.
**Steps**:
1. Enter an invalid email address and submit.
2. Enter a phone number shorter than 10 digits and submit.
**Expected Results**:
- The request fails with validation errors for email or phone.
- The response includes messages like "Customer email must be a valid email address" and "Customer phone must be at least 10 digits".
**Business Rule**: Booking contact fields must validate format and length.
**Suggested Layer**: API / E2E

### TC-302: Reject booking creation when there are insufficient seats
**Category**: Negative
**Priority**: P1
**Preconditions**: An event has fewer available seats than requested quantity.
**Steps**:
1. Select an event with limited seats.
2. Request a quantity larger than available seats.
3. Submit the booking.
**Expected Results**:
- The booking fails with an insufficient seats error.
- The user is informed that only the remaining seats are available.
**Business Rule**: Booking creation fails when requested quantity exceeds available seats.
**Suggested Layer**: E2E / API

### TC-303: Show "Booking not found" after a cancelled or missing booking
**Category**: Negative
**Priority**: P2
**Preconditions**: User is authenticated and a booking has been cancelled or deleted.
**Steps**:
1. Cancel an existing booking.
2. Navigate directly to the cancelled booking's detail URL.
**Expected Results**:
- The user sees "Booking not found".
- The page includes a link back to "My Bookings".
**Business Rule**: Cancelled bookings are no longer retrievable by ID.
**Suggested Layer**: E2E

### TC-400: Book the same event twice and verify per-user availability is computed correctly
**Category**: Edge Case
**Priority**: P2
**Preconditions**: User is authenticated and event has enough seats for two bookings.
**Steps**:
1. Book Event X for quantity 1.
2. Book Event X again for quantity 1.
3. Confirm both bookings exist.
4. Check available seats for Event X.
**Expected Results**:
- Both bookings succeed.
- The available seats on Event X reflect the sum of both bookings for that user.
**Business Rule**: For dynamic events, available seats are computed as totalSeats minus the user's own booked quantities.
**Suggested Layer**: E2E

### TC-401: Create a new booking when all 9 slots exist for the same event and verify FIFO removal plus seat burn behavior
**Category**: Edge Case
**Priority**: P2
**Preconditions**: User has 9 bookings and attempts to book again for an event where the oldest booking may belong to the same event.
**Steps**:
1. Create a user booking history with 9 bookings.
2. Book one more seat for the same event as the oldest booking if possible.
3. Verify the oldest booking is deleted.
4. Confirm the event seat count still decreases by the new booking quantity.
**Expected Results**:
- The new booking succeeds.
- The oldest booking is removed even if it belongs to the same event.
- Seats remain decreased by the new booking quantity.
**Business Rule**: When max bookings reached, oldest booking is deleted; same-event fallback still burns a seat.
**Suggested Layer**: API / E2E

### TC-402: Display an empty state when no bookings exist
**Category**: UI State
**Priority**: P2
**Preconditions**: User is authenticated and has zero bookings.
**Steps**:
1. Sign in and navigate to "My Bookings".
2. Observe the page content.
**Expected Results**:
- The empty state appears with title "No bookings yet".
- The page includes a button to browse events.
**Business Rule**: Users with no bookings should see an empty bookings state.
**Suggested Layer**: E2E

### TC-403: Show loading skeletons while the bookings list is fetching
**Category**: UI State
**Priority**: P3
**Preconditions**: User navigates to the bookings page while the app fetches data.
**Steps**:
1. Open the bookings page.
2. Observe the UI while the bookings API request is in progress.
**Expected Results**:
- Skeleton booking cards are displayed during loading.
- The final bookings list replaces the skeletons after load completes.
**Business Rule**: The bookings page uses a loading state for fetch latency.
**Suggested Layer**: Component / E2E

### TC-404: Show refund eligibility spinner before revealing result
**Category**: UI State
**Priority**: P3
**Preconditions**: User is viewing a booking detail page.
**Steps**:
1. Click "Check eligibility for refund?".
2. Observe the UI before and after 4 seconds.
**Expected Results**:
- A spinner and "Checking your refund eligibility…" text appears immediately.
- After about 4 seconds, the eligibility message appears.
**Business Rule**: Refund eligibility is frontend-only and displays a 4-second spinner.
**Suggested Layer**: Component / E2E

### TC-405: Disable the "Clear all bookings" action while clearing is in progress
**Category**: UI State
**Priority**: P3
**Preconditions**: User has bookings and clicks the clear action.
**Steps**:
1. Click "Clear all bookings".
2. Accept the confirmation prompt.
3. Observe the button state while the cancellation request is in progress.
**Expected Results**:
- The clear button becomes disabled during the request.
- The button label changes to "Clearing…" while the action runs.
**Business Rule**: UI should prevent duplicate clearance actions while in flight.
**Suggested Layer**: Component / E2E
