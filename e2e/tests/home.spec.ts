import { test, expect } from '@playwright/test';
import { waitForPageReady, mockApiRoute } from '../helpers/visual';
import {
  mockUser,
  mockWeeklySessions,
  mockInProgressSession,
  createPaginatedResponse,
} from '../fixtures/mock-data';

test.describe('Home Screen', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
    await mockApiRoute(page, '**/api/user', mockUser);

    // Mock sessions for weekly stats (finished sessions)
    await mockApiRoute(
      page,
      '**/api/sessions?status=finished*',
      createPaginatedResponse(mockWeeklySessions)
    );

    // Mock current session check (no in-progress session by default)
    await mockApiRoute(
      page,
      '**/api/sessions?status=in_progress*',
      createPaginatedResponse([])
    );
  });

  test('displays home screen with weekly stats', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Verify header
    await expect(page.getByText('Today')).toBeVisible();

    // Verify weekly stats section
    await expect(page.getByText('Weekly Stats', { exact: false })).toBeVisible();
  });

  test('displays today focus card', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Verify today's focus section
    await expect(page.getByText("Today's Focus", { exact: false })).toBeVisible();

    // Verify workout card elements
    await expect(page.getByText('Start Workout')).toBeVisible();
    await expect(page.getByText('Start Free Workout')).toBeVisible();
  });

  test('shows resume button when session in progress', async ({ page }) => {
    // Override to show in-progress session
    await mockApiRoute(
      page,
      '**/api/sessions?status=in_progress*',
      createPaginatedResponse([mockInProgressSession])
    );

    await page.goto('/');
    await waitForPageReady(page);

    // Should show resume indicator
    await expect(page.getByText('workout in progress', { exact: false })).toBeVisible();
  });

  test('weekly stats carousel displays correctly', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Check for stats labels (case-insensitive partial match)
    await expect(page.getByText('Volume', { exact: false })).toBeVisible();
    await expect(page.getByText('Workouts', { exact: false })).toBeVisible();
  });

  test('can navigate to log tab', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Click on Log tab
    await page.getByRole('link', { name: /log/i }).click();

    // Should show workouts header
    await expect(page.getByText('Workouts')).toBeVisible();
  });
});
