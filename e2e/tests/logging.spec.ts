import { test, expect } from '@playwright/test';
import { waitForPageReady, mockApiRoute, setupAuthToken } from '../helpers/visual';
import { mockUser, mockSessionDetails, mockCreatedEvent } from '../fixtures/mock-data';

test.describe('Logging Screen (Active Session)', () => {
  test.beforeEach(async ({ page }) => {
    // Set up auth token in localStorage
    await setupAuthToken(page);

    // Mock authenticated user
    await mockApiRoute(page, '**/api/user', mockUser);

    // Mock session details (wrapped in data property as API expects)
    await mockApiRoute(page, '**/api/sessions/100', { data: mockSessionDetails });
  });

  test('displays session header with title and finish button', async ({ page }) => {
    await page.goto('/logging/100');
    await waitForPageReady(page);

    // Verify header elements
    await expect(page.getByText("Today's Session")).toBeVisible();
    await expect(page.getByText('Finish')).toBeVisible();
  });

  test('shows stats row with volume and duration', async ({ page }) => {
    await page.goto('/logging/100');
    await waitForPageReady(page);

    // Check for stats labels
    await expect(page.getByText('Volume')).toBeVisible();
    await expect(page.getByText('Duration')).toBeVisible();

    // Check for volume value (formatted)
    await expect(page.getByText('kg')).toBeVisible();
  });

  test('displays processing card for queued events', async ({ page }) => {
    await page.goto('/logging/100');
    await waitForPageReady(page);

    // Should show processing indicator
    await expect(page.getByText('Processing', { exact: false })).toBeVisible();

    // Should show the raw text being processed
    await expect(page.getByText('pullups 3x8 bw')).toBeVisible();
  });

  test('displays completed event cards with sets table', async ({ page }) => {
    await page.goto('/logging/100');
    await waitForPageReady(page);

    // Should show exercise names
    await expect(page.getByText('Bench Press')).toBeVisible();
    await expect(page.getByText('Squat')).toBeVisible();

    // Should show raw input
    await expect(page.getByText('bench 3x8 100kg')).toBeVisible();
    await expect(page.getByText('squat 2x5 140kg')).toBeVisible();
  });

  test('shows bottom logger panel', async ({ page }) => {
    await page.goto('/logging/100');
    await waitForPageReady(page);

    // Should show AI Logger label
    await expect(page.getByText('AI Logger', { exact: false })).toBeVisible();

    // Should show input placeholder
    await expect(page.getByPlaceholder(/describe/i)).toBeVisible();
  });

  test('shows quick chips in bottom logger', async ({ page }) => {
    await page.goto('/logging/100');
    await waitForPageReady(page);

    // Should show common chips
    await expect(page.getByText('+2.5kg')).toBeVisible();
    await expect(page.getByText('@ 8 RPE')).toBeVisible();
  });

  test('can type in the AI logger input', async ({ page }) => {
    await page.goto('/logging/100');
    await waitForPageReady(page);

    // Find and type in the input
    const input = page.getByPlaceholder(/describe/i);
    await input.fill('deadlift 3x5 180kg');

    // Verify the input has the text
    await expect(input).toHaveValue('deadlift 3x5 180kg');
  });

  test('shows empty state when no events', async ({ page }) => {
    // Mock session with no events (wrapped in data property)
    await mockApiRoute(page, '**/api/sessions/100', {
      data: {
        ...mockSessionDetails,
        session_events: [],
      },
    });

    await page.goto('/logging/100');
    await waitForPageReady(page);

    // Should show empty state message
    await expect(page.getByText('No sets logged yet')).toBeVisible();
  });

  test('back button navigates away', async ({ page }) => {
    await page.goto('/logging/100');
    await waitForPageReady(page);

    // Click back button
    await page.getByRole('button').first().click();

    // Should navigate away from logging screen
    await expect(page).not.toHaveURL(/\/logging/);
  });

  test('event persists after POST submission (no flash disappear)', async ({ page }) => {
    // Mock the POST endpoint for creating events
    await page.route('**/api/sessions/100/events', async (route) => {
      if (route.request().method() === 'POST') {
        // Return the newly created event
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: mockCreatedEvent,
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock refetch to return session WITH the new event (simulating what server returns)
    // This overrides the beforeEach mock after POST
    let refetchCount = 0;
    await page.route('**/api/sessions/100', async (route) => {
      refetchCount++;
      if (refetchCount === 1) {
        // First fetch: return original session
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockSessionDetails }),
        });
      } else {
        // Subsequent fetches: return session with new event included
        const sessionWithNewEvent = {
          ...mockSessionDetails,
          session_events: [
            mockCreatedEvent, // New event at top
            ...mockSessionDetails.session_events,
          ],
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: sessionWithNewEvent }),
        });
      }
    });

    await page.goto('/logging/100');
    await waitForPageReady(page);

    // Type in the AI logger input
    const input = page.getByPlaceholder(/describe/i);
    await input.fill('deadlift 3x5 180kg');

    // Click the send button - it's the orange circular button at bottom right of AI Logger
    await page.locator('div[class*="bg-primary"]').last().click();

    // Event should appear immediately (optimistic update)
    await expect(page.getByText('deadlift 3x5 180kg')).toBeVisible();

    // Wait 4 seconds (longer than polling interval of 3s)
    await page.waitForTimeout(4000);

    // Event should STILL be visible - this is the critical assertion
    // If the bug exists, the event would have disappeared by now
    await expect(page.getByText('deadlift 3x5 180kg')).toBeVisible();

    // Should show processing indicator for the new event (use first() since there may be multiple)
    await expect(page.getByText('Processing', { exact: false }).first()).toBeVisible();
  });
});
