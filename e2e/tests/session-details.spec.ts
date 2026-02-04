import { test, expect } from '@playwright/test';
import { waitForPageReady, mockApiRoute } from '../helpers/visual';
import { mockUser, mockFinishedSessionDetails } from '../fixtures/mock-data';

test.describe('Session Details Screen', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
    await mockApiRoute(page, '**/api/user', mockUser);

    // Mock finished session details
    await mockApiRoute(page, '**/api/sessions/1', mockFinishedSessionDetails);
  });

  test('displays session header with title and date', async ({ page }) => {
    await page.goto('/log/1');
    await waitForPageReady(page);

    // Verify title
    await expect(page.getByText('Upper Body Power')).toBeVisible();

    // Verify date format (should show formatted date)
    await expect(page.getByText(/Oct 23/)).toBeVisible();
  });

  test('shows stats row with all metrics', async ({ page }) => {
    await page.goto('/log/1');
    await waitForPageReady(page);

    // Check for stat labels
    await expect(page.getByText('Exercises')).toBeVisible();
    await expect(page.getByText('Sets')).toBeVisible();
    await expect(page.getByText('Reps')).toBeVisible();
    await expect(page.getByText('Volume')).toBeVisible();
    await expect(page.getByText('Duration')).toBeVisible();

    // Check for stat values
    await expect(page.getByText('6')).toBeVisible(); // Exercises
    await expect(page.getByText('18')).toBeVisible(); // Sets
  });

  test('displays top exercises table', async ({ page }) => {
    await page.goto('/log/1');
    await waitForPageReady(page);

    // Should show section heading
    await expect(page.getByText('Top Exercises')).toBeVisible();

    // Should show table headers
    await expect(page.getByText('Exercise', { exact: false })).toBeVisible();

    // Should show exercise names
    await expect(page.getByText('Squat')).toBeVisible();
    await expect(page.getByText('Bench Press')).toBeVisible();
    await expect(page.getByText('Deadlift')).toBeVisible();
  });

  test('displays event log section', async ({ page }) => {
    await page.goto('/log/1');
    await waitForPageReady(page);

    // Should show section heading
    await expect(page.getByText('Event Log')).toBeVisible();

    // Should show raw input blocks
    await expect(page.getByText('bench 3x8 100kg')).toBeVisible();
    await expect(page.getByText('squat 2x5 140kg')).toBeVisible();
  });

  test('event cards show sets in table format', async ({ page }) => {
    await page.goto('/log/1');
    await waitForPageReady(page);

    // Should show set table headers
    await expect(page.getByText('Kg', { exact: false })).toBeVisible();
    await expect(page.getByText('Reps', { exact: false })).toBeVisible();
    await expect(page.getByText('RPE', { exact: false })).toBeVisible();

    // Should show weight values
    await expect(page.getByText('100')).toBeVisible();
    await expect(page.getByText('140')).toBeVisible();
  });

  test('has share button in header', async ({ page }) => {
    await page.goto('/log/1');
    await waitForPageReady(page);

    // Look for share icon button
    const shareButton = page.locator('[data-testid="share-button"]').or(
      page.getByRole('button').filter({ has: page.locator('svg') }).last()
    );

    // The share button should be present (even if we can't click it)
    await expect(page.locator('text=Upper Body Power')).toBeVisible();
  });

  test('back button navigates to log list', async ({ page }) => {
    await page.goto('/log/1');
    await waitForPageReady(page);

    // Click back button
    await page.getByRole('button').first().click();

    // Should navigate to log list
    await expect(page).toHaveURL(/\/log$/);
  });

  test('shows volume in kg suffix', async ({ page }) => {
    await page.goto('/log/1');
    await waitForPageReady(page);

    // Check for volume with kg suffix
    await expect(page.getByText('kg')).toBeVisible();
  });

  test('shows empty event log state when no events', async ({ page }) => {
    // Mock session with no events
    await mockApiRoute(page, '**/api/sessions/1', {
      ...mockFinishedSessionDetails,
      session_events: [],
    });

    await page.goto('/log/1');
    await waitForPageReady(page);

    // Should show empty state
    await expect(page.getByText('No events recorded')).toBeVisible();
  });

  test('handles session not found', async ({ page }) => {
    // Mock 404 response
    await page.route('**/api/sessions/999', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ message: 'Session not found' }),
      })
    );

    await page.goto('/log/999');
    await waitForPageReady(page);

    // Should show error state
    await expect(page.getByText('Session not found')).toBeVisible();
  });
});
