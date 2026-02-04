import { test, expect } from '@playwright/test';
import { waitForPageReady, mockApiRoute } from '../helpers/visual';
import {
  mockUser,
  mockWeeklySessions,
  mockInProgressSession,
  createPaginatedResponse,
  getAllSessions,
} from '../fixtures/mock-data';

test.describe('Log Screen (Workouts History)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
    await mockApiRoute(page, '**/api/user', mockUser);

    // Mock all sessions
    await mockApiRoute(
      page,
      '**/api/sessions',
      createPaginatedResponse(getAllSessions())
    );

    // Mock current session
    await mockApiRoute(
      page,
      '**/api/sessions?status=in_progress*',
      createPaginatedResponse([mockInProgressSession])
    );
  });

  test('displays workouts header and new workout button', async ({ page }) => {
    await page.goto('/log');
    await waitForPageReady(page);

    // Verify header
    await expect(page.getByText('Workouts')).toBeVisible();

    // Verify new workout button
    await expect(page.getByText('New Workout')).toBeVisible();
  });

  test('shows current training card for in-progress session', async ({ page }) => {
    await page.goto('/log');
    await waitForPageReady(page);

    // Should show current training section
    await expect(page.getByText('Your current training', { exact: false })).toBeVisible();

    // Should show in progress badge
    await expect(page.getByText('In Progress', { exact: false })).toBeVisible();

    // Should show resume button
    await expect(page.getByText('Resume')).toBeVisible();
  });

  test('displays history section with finished sessions', async ({ page }) => {
    await page.goto('/log');
    await waitForPageReady(page);

    // Should show history label
    await expect(page.getByText('History')).toBeVisible();

    // Should show finished sessions
    await expect(page.getByText('Upper Body Power')).toBeVisible();
    await expect(page.getByText('Leg Day (Heavy)')).toBeVisible();
  });

  test('shows session stats in history items', async ({ page }) => {
    await page.goto('/log');
    await waitForPageReady(page);

    // Check for exercise/set counts
    await expect(page.getByText(/\d+ exercises?/)).toBeVisible();
    await expect(page.getByText(/\d+ sets?/)).toBeVisible();
  });

  test('hides current training card when no in-progress session', async ({ page }) => {
    // Override to show no in-progress session
    await mockApiRoute(
      page,
      '**/api/sessions?status=in_progress*',
      createPaginatedResponse([])
    );

    await mockApiRoute(
      page,
      '**/api/sessions',
      createPaginatedResponse(mockWeeklySessions)
    );

    await page.goto('/log');
    await waitForPageReady(page);

    // Should NOT show current training section
    await expect(page.getByText('Your current training')).not.toBeVisible();
  });

  test('shows empty state when no sessions', async ({ page }) => {
    // Override to show no sessions
    await mockApiRoute(page, '**/api/sessions*', createPaginatedResponse([]));

    await page.goto('/log');
    await waitForPageReady(page);

    // Should show empty state message
    await expect(page.getByText('No workouts yet')).toBeVisible();
  });

  test('can navigate to session details', async ({ page }) => {
    await page.goto('/log');
    await waitForPageReady(page);

    // Click on a finished session
    await page.getByText('Upper Body Power').first().click();

    // Should navigate to session details (URL check)
    await expect(page).toHaveURL(/\/log\/\d+/);
  });
});
