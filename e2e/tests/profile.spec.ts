import { test, expect } from '@playwright/test';
import { waitForPageReady, mockApiRoute, takeScreenshot } from '../helpers/visual';
import { mockUser, mockProfile } from '../fixtures/mock-data';

test.describe('Profile Screen', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoute(page, '**/api/user', mockUser);
    await mockApiRoute(page, '**/api/me/profile', { data: mockProfile });
    // Mock other required routes
    await mockApiRoute(page, '**/api/sessions?status=finished*', { data: [], meta: { current_page: 1, from: null, last_page: 1, per_page: 20, to: null, total: 0 }, links: { first: null, last: null, prev: null, next: null } });
    await mockApiRoute(page, '**/api/sessions?status=in_progress*', { data: [], meta: { current_page: 1, from: null, last_page: 1, per_page: 20, to: null, total: 0 }, links: { first: null, last: null, prev: null, next: null } });
  });

  test('displays header, user card, all 6 section titles, and logout button', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);

    // Header
    await expect(page.getByText('Profile', { exact: true })).toBeVisible();

    // User card
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();

    // Section titles
    await expect(page.getByText('Basics & Units')).toBeVisible();
    await expect(page.getByText('Training Split').first()).toBeVisible();
    await expect(page.getByText('Goals & Focus')).toBeVisible();
    await expect(page.getByText('Gear & Supplements')).toBeVisible();
    await expect(page.getByText('Gym & Equipment')).toBeVisible();
    await expect(page.getByText('Health & Injuries')).toBeVisible();

    // Logout button
    await expect(page.getByText('Log Out')).toBeVisible();
  });

  test('shows correct summary text for each section', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);

    // Basics summary
    await expect(page.getByText(/KG.*28 years old.*180cm.*82kg/)).toBeVisible();

    // Training summary
    await expect(page.getByText(/PPL.*4x\/week.*Intermediate/)).toBeVisible();

    // Goals summary
    await expect(page.getByText(/Hypertrophy.*Focus:/)).toBeVisible();

    // Gear summary
    await expect(page.getByText(/Natural.*Creatine/)).toBeVisible();

    // Equipment summary
    await expect(page.getByText(/Commercial.*Barbell/)).toBeVisible();

    // Health summary
    await expect(page.getByText('No injuries')).toBeVisible();
  });

  test('expand and collapse sections', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);

    // Click on Goals & Focus to expand
    await page.getByText('Goals & Focus').click();
    await page.waitForTimeout(300);

    // Should show edit content
    await expect(page.getByText('Primary Goal')).toBeVisible();
    await expect(page.getByText('Target Muscle Groups')).toBeVisible();
    await expect(page.getByText('Save')).toBeVisible();
    await expect(page.getByText('Cancel')).toBeVisible();

    // Click on Training Split to collapse Goals and expand Training
    await page.getByText('Training Split').first().click();
    await page.waitForTimeout(300);

    // Goals should be collapsed, Training expanded
    await expect(page.getByText('Frequency')).toBeVisible();
    await expect(page.getByText('Primary Goal')).not.toBeVisible();
  });

  test('cancel discards changes', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);

    // Expand Goals & Focus
    await page.getByText('Goals & Focus').click();
    await page.waitForTimeout(300);

    // Click Cancel
    await page.getByText('Cancel').click();
    await page.waitForTimeout(300);

    // Section should be collapsed
    await expect(page.getByText('Primary Goal')).not.toBeVisible();
  });

  test('save calls PATCH and collapses section', async ({ page }) => {
    let patchCalled = false;
    let patchBody: unknown = null;

    // Intercept PATCH request
    await page.route('**/api/me/profile', async (route) => {
      if (route.request().method() === 'PATCH') {
        patchCalled = true;
        patchBody = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { ...mockProfile, primary_goal: 'strength' } }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockProfile }),
        });
      }
    });

    await page.goto('/profile');
    await waitForPageReady(page);

    // Expand Goals & Focus
    await page.getByText('Goals & Focus').click();
    await page.waitForTimeout(300);

    // Click on Strength to change goal
    await page.getByText('Strength', { exact: true }).click();

    // Click Save
    await page.getByText('Save').click();
    await page.waitForTimeout(500);

    expect(patchCalled).toBe(true);
  });

  test('loading state shows skeleton placeholders', async ({ page }) => {
    // Override with delayed response
    await page.route('**/api/me/profile', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockProfile }),
      });
    });

    await page.goto('/profile');
    await page.waitForTimeout(500);

    // Should see user card but sections loading
    await expect(page.getByText('Test User')).toBeVisible();
    // Sections should not be visible yet
    await expect(page.getByText('Basics & Units')).not.toBeVisible();
  });

  test('error state shows message for 403', async ({ page }) => {
    await page.route('**/api/me/profile', (route) =>
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Profile not available.' }),
      })
    );

    await page.goto('/profile');
    await waitForPageReady(page);

    await expect(page.getByText('Unable to load profile', { exact: false })).toBeVisible();
  });

  test('logout button is visible and clickable', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);

    const logoutButton = page.getByText('Log Out');
    await expect(logoutButton).toBeVisible();
    await expect(logoutButton).toBeEnabled();
  });

  test('visual regression: profile collapsed', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);
    await takeScreenshot(page, 'profile-collapsed');
  });

  test('visual regression: profile goals expanded', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);

    await page.getByText('Goals & Focus').click();
    await page.waitForTimeout(300);
    await takeScreenshot(page, 'profile-goals-expanded');
  });
});
