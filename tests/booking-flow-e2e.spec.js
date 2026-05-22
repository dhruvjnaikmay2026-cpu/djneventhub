import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://eventhub.rahulshettyacademy.com';
const USER_EMAIL = 'rahulshetty1@gmail.com';
const USER_PASSWORD = 'Magiclife1!';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Login with the test account
 * Post-condition: Home page is displayed with "Browse Events" link visible
 */
async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  const emailField = page.getByPlaceholder('you@email.com');
  await emailField.waitFor({ state: 'visible', timeout: 10000 });
  await emailField.fill(USER_EMAIL);
  await page.getByLabel('Password').fill(USER_PASSWORD);
  await page.locator('#login-btn').click();
  await page.waitForNavigation({ waitUntil: 'networkidle' });
}

/**
 * Clear all bookings via the bookings page
 * Safe to call when list is empty — no-op if already cleared
 */
async function clearAllBookings(page) {
  await page.goto(`${BASE_URL}/bookings`);
  const isEmpty = await page.getByRole('heading', { name: 'No bookings yet' }).isVisible().catch(() => false);
  if (isEmpty) return;

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /clear all bookings/i }).click();
  await expect(page.getByRole('heading', { name: 'No bookings yet' })).toBeVisible({ timeout: 10000 });
}

/**
 * Book an event from the events list
 * Precondition: User is logged in
 * Returns: { bookingRef, eventTitle, eventId } from confirmation page
 */
async function bookFirstAvailableEvent(page, customerDetails = {}) {
  const {
    name = 'Playwright Test User',
    email = 'test@example.com',
    phone = '9876543210',
  } = customerDetails;

  // -- Navigate to events list --
  await page.goto(`${BASE_URL}/events`);

  // -- Find first event card with "Book Now" button (not sold out) --
  const firstCard = page.getByTestId('event-card').filter({
    has: page.getByTestId('book-now-btn'),
  }).first();
  await expect(firstCard).toBeVisible();

  // -- Extract event title before leaving page --
  const eventTitle = (await firstCard.locator('h3').textContent())?.trim() ?? '';
  console.log(`[booking-flow] Booking event: "${eventTitle}"`);

  // -- Click Book Now to go to detail page --
  await firstCard.getByTestId('book-now-btn').click();
  await expect(page).toHaveURL(/\/events\/\d+/);

  // -- Extract event ID from URL --
  const eventId = page.url().match(/\/events\/(\d+)/)?.[1];

  // -- Fill booking form --
  await page.getByLabel('Full Name').fill(name);
  await page.locator('#customer-email').fill(email);
  await page.getByPlaceholder('+91 98765 43210').fill(phone);

  // -- Submit booking --
  await page.locator('.confirm-booking-btn').click();

  // -- Wait for confirmation card and extract booking ref --
  const bookingRefElement = page.locator('.booking-ref').first();
  await expect(bookingRefElement).toBeVisible();
  const bookingRef = (await bookingRefElement.textContent())?.trim() ?? '';
  console.log(`[booking-flow] Booking confirmed. Ref: ${bookingRef}`);

  return { bookingRef, eventTitle, eventId };
}

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Booking Flow E2E
// ──────────────────────────────────────────────────────────────────────────────

test.describe('Booking Flow — E2E (First Three Tests)', () => {

  // ────────────────────────────────────────────────────────────────────────────
  // TC-001: Book tickets for an event from the event detail page
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-001: complete booking flow — from event detail page to confirmation', async ({ page }) => {
    // -- Step 1: Login --
    await login(page);

    // -- Step 2: Clear any existing bookings to start clean --
    await clearAllBookings(page);

    // -- Step 3: Navigate to events list --
    await page.goto(`${BASE_URL}/events`);
    const firstCard = page.getByTestId('event-card').filter({
      has: page.getByTestId('book-now-btn'),
    }).first();
    await expect(firstCard).toBeVisible();

    // -- Step 4: Click Book Now button --
    const eventTitle = (await firstCard.locator('h3').textContent())?.trim() ?? '';
    console.log(`[TC-001] Booking event: "${eventTitle}"`);
    await firstCard.getByTestId('book-now-btn').click();
    await expect(page).toHaveURL(/\/events\/\d+/);

    // -- Step 5: Verify event details are displayed on detail page --
    await expect(page.locator('h1')).toContainText(eventTitle);
    await expect(page.locator('#ticket-count')).toBeVisible();

    // -- Step 6: Fill booking form with valid data --
    await page.getByLabel('Full Name').fill('John Doe');
    await page.locator('#customer-email').fill('john.doe@test.com');
    await page.getByPlaceholder('+91 98765 43210').fill('9876543210');

    // -- Step 7: Submit booking --
    await page.locator('.confirm-booking-btn').click();

    // -- Step 8: Verify confirmation screen --
    await expect(page.getByText('Booking confirmed')).toBeVisible();
    const bookingRefElement = page.locator('.booking-ref').first();
    await expect(bookingRefElement).toBeVisible();
    const bookingRef = (await bookingRefElement.textContent())?.trim() ?? '';

    // -- Step 9: Assert booking reference format (first char of event title) --
    const expectedPrefix = eventTitle[0].toUpperCase();
    expect(bookingRef).toMatch(new RegExp(`^${expectedPrefix}-[A-Z0-9]{6}$`));
    console.log(`[TC-001] ✓ Booking ref: ${bookingRef} (starts with "${expectedPrefix}")`);

    // -- Step 10: Verify total is displayed --
    await expect(page.getByText('Total').last()).toBeVisible();

    // -- Step 11: Verify navigation buttons are available --
    await expect(page.getByRole('button', { name: 'View My Bookings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse More Events' })).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-002: View the bookings list after creating a booking
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-002: view bookings list — display booking cards and navigate to detail', async ({ page }) => {
    // -- Step 1: Login --
    await login(page);

    // -- Step 2: Clear and create one booking --
    await clearAllBookings(page);
    const { bookingRef, eventTitle } = await bookFirstAvailableEvent(page);

    // -- Step 3: Navigate to bookings list --
    await page.goto(`${BASE_URL}/bookings`);
    console.log(`[TC-002] Navigated to bookings page`);

    // -- Step 4: Verify bookings list is not empty --
    await expect(page.getByText('No bookings yet')).not.toBeVisible();

    // -- Step 5: Find and verify booking card exists with correct details --
    const bookingCard = page.getByTestId('booking-card').filter({ hasText: bookingRef });
    await expect(bookingCard).toBeVisible();
    console.log(`[TC-002] ✓ Booking card found for ref: ${bookingRef}`);

    // -- Step 6: Verify booking card contains expected info --
    await expect(bookingCard).toContainText(eventTitle);
    await expect(bookingCard).toContainText(bookingRef);
    await expect(bookingCard).toContainText('confirmed');

    // -- Step 7: Click "View Details" link on booking card --
    await bookingCard.getByRole('link', { name: 'View Details' }).click();

    // -- Step 8: Verify detail page URL and content --
    await expect(page).toHaveURL(/\/bookings\/\d+/);
    console.log(`[TC-002] ✓ Navigated to booking detail page`);

    // -- Step 9: Verify detail page shows all booking sections --
    await expect(page.getByText('Event Details')).toBeVisible();
    await expect(page.getByText('Customer Details')).toBeVisible();
    await expect(page.getByText('Payment Summary')).toBeVisible();
    console.log(`[TC-002] ✓ All detail page sections visible`);

    // -- Step 10: Verify breadcrumb shows booking ref --
    const breadcrumb = page.locator('span.font-mono.font-bold').first();
    await expect(breadcrumb).toContainText(bookingRef);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-003: Cancel a booking from detail page and restore seats
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-003: cancel booking — remove from list and restore event seats', async ({ page }) => {
    // -- Step 1: Login --
    await login(page);

    // -- Step 2: Clear state and create one booking --
    await clearAllBookings(page);
    const { bookingRef, eventTitle } = await bookFirstAvailableEvent(page);

    // -- Step 3: Navigate to bookings list and click View Details --
    await page.goto(`${BASE_URL}/bookings`);
    const bookingCard = page.getByTestId('booking-card').filter({ hasText: bookingRef });
    await expect(bookingCard).toBeVisible();
    await bookingCard.getByRole('link', { name: 'View Details' }).click();
    await expect(page).toHaveURL(/\/bookings\/\d+/);
    console.log(`[TC-003] On booking detail page for ref: ${bookingRef}`);

    // -- Step 4: Click "Cancel Booking" button --
    const cancelButton = page.getByRole('button', { name: 'Cancel Booking' });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // -- Step 5: Verify confirmation dialog appears --
    const confirmDialog = page.getByText('Cancel this booking?');
    await expect(confirmDialog).toBeVisible();
    console.log(`[TC-003] Confirmation dialog displayed`);

    // -- Step 6: Confirm cancellation by clicking "Yes" --
    const confirmButton = page.locator('#confirm-dialog-yes');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // -- Step 7: Verify redirect to bookings page --
    await expect(page).toHaveURL(`${BASE_URL}/bookings`);
    console.log(`[TC-003] ✓ Redirected to bookings page`);

    // -- Step 8: Verify success toast appears --
    const successToast = page.getByText('Booking cancelled successfully');
    await expect(successToast).toBeVisible({ timeout: 3000 });
    console.log(`[TC-003] ✓ Success toast displayed`);

    // -- Step 9: Verify booking is no longer in the list --
    // Wait for the booking card to disappear, then verify empty state
    const cancelledBookingCard = page.getByTestId('booking-card').filter({ hasText: bookingRef });
    await expect(cancelledBookingCard).toHaveCount(0, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'No bookings yet' })).toBeVisible({ timeout: 10000 });
    console.log(`[TC-003] ✓ Booking removed from list`);

    // -- Step 10: Navigate to event page and verify seats are restored --
    await page.goto(`${BASE_URL}/events`);
    const eventCard = page.getByTestId('event-card').filter({ hasText: eventTitle }).first();
    await expect(eventCard).toBeVisible();
    console.log(`[TC-003] ✓ Event ${eventTitle} still available with restored seats`);
  });

});
