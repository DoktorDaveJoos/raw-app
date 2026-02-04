import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const REFERENCE_DIR = path.join(__dirname, '../reference');
const OUTPUT_DIR = path.join(__dirname, '../output');

export interface VisualCompareOptions {
  /** Threshold for pixel difference (0-1), default 0.1 (10% difference allowed) */
  threshold?: number;
  /** Areas to ignore during comparison */
  mask?: { x: number; y: number; width: number; height: number }[];
}

/**
 * Takes a screenshot and saves it to the output directory
 */
export async function takeScreenshot(page: Page, name: string): Promise<string> {
  const outputPath = path.join(OUTPUT_DIR, `${name}.png`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Wait for animations to complete
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: outputPath, fullPage: false });

  return outputPath;
}

/**
 * Compare a screenshot to a reference image
 */
export async function compareToReference(
  page: Page,
  name: string,
  options: VisualCompareOptions = {}
): Promise<{
  match: boolean;
  diffPercent: number;
  outputPath: string;
  diffPath?: string;
}> {
  const { threshold = 0.1 } = options;

  const outputPath = await takeScreenshot(page, name);
  const referencePath = path.join(REFERENCE_DIR, `${name}.png`);

  // Check if reference exists
  if (!fs.existsSync(referencePath)) {
    console.warn(`Reference image not found: ${referencePath}`);
    return { match: false, diffPercent: 100, outputPath };
  }

  // Load images
  const output = PNG.sync.read(fs.readFileSync(outputPath));
  const reference = PNG.sync.read(fs.readFileSync(referencePath));

  // Check dimensions
  if (output.width !== reference.width || output.height !== reference.height) {
    console.warn(
      `Image dimensions don't match: ${output.width}x${output.height} vs ${reference.width}x${reference.height}`
    );
    return { match: false, diffPercent: 100, outputPath };
  }

  // Create diff image
  const diff = new PNG({ width: output.width, height: output.height });

  const numDiffPixels = pixelmatch(
    reference.data,
    output.data,
    diff.data,
    output.width,
    output.height,
    { threshold: 0.1 }
  );

  const totalPixels = output.width * output.height;
  const diffPercent = (numDiffPixels / totalPixels) * 100;

  // Save diff image if there are differences
  let diffPath: string | undefined;
  if (numDiffPixels > 0) {
    diffPath = path.join(OUTPUT_DIR, `${name}-diff.png`);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }

  return {
    match: diffPercent <= threshold * 100,
    diffPercent,
    outputPath,
    diffPath,
  };
}

/**
 * Assert that the current page matches the reference screenshot
 */
export async function expectMatchesReference(
  page: Page,
  name: string,
  options: VisualCompareOptions = {}
) {
  const result = await compareToReference(page, name, options);

  if (!result.match) {
    throw new Error(
      `Visual regression failed for "${name}"\n` +
        `Difference: ${result.diffPercent.toFixed(2)}%\n` +
        `Output: ${result.outputPath}\n` +
        `Diff: ${result.diffPath || 'N/A'}\n` +
        `To update reference: copy output to e2e/reference/${name}.png`
    );
  }
}

/**
 * Wait for the page to be fully loaded and ready for screenshots
 */
export async function waitForPageReady(page: Page) {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Extra time for animations
  await page.waitForTimeout(300);
}

/**
 * Wait for a specific element to be visible
 */
export async function waitForElement(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible' });
}

/**
 * Mock API responses for testing
 */
export async function mockApiRoute(
  page: Page,
  urlPattern: string | RegExp,
  response: object,
  status: number = 200
) {
  await page.route(urlPattern, (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  );
}

/**
 * Set up common API mocks for authenticated state
 */
export async function setupAuthenticatedMocks(page: Page, user: object) {
  await mockApiRoute(page, '**/api/user', user);
}

/**
 * Set up auth token in localStorage before navigation
 * Must be called after page.goto() or after setting up a context
 */
export async function setupAuthToken(page: Page, token: string = 'test-auth-token') {
  await page.addInitScript((authToken) => {
    localStorage.setItem('auth_token', authToken);
  }, token);
}
