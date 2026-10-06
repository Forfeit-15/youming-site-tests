import { test, expect } from '@playwright/test';

// Requirements from SPEC.md, "## Conventions" (lines 4-7).

test('SPEC.md:4 - sections #hero #about #skills #projects #repos #contact all exist', async ({ page }) => {
  await page.goto('./');
  for (const id of ['hero', 'about', 'skills', 'projects', 'repos', 'contact']) {
    await expect.soft(page.locator(`#${id}`), `#${id} should exist`).toBeAttached();
  }
});

test('SPEC.md:5 - no horizontal scroll at a viewport width of 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('./');
  // Let late content (such as the repo cards) render before measuring.
  await page.waitForLoadState('networkidle');
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, 'page is wider than the viewport').toBeLessThanOrEqual(clientWidth);
});

test('SPEC.md:6 - #repos shows repo cards or a plain message', async ({ page }) => {
  test.info().annotations.push({
    type: 'spec-unclear',
    description:
      'SPEC.md:6 does not say what a "card" is (element/class) or what the message says, ' +
      'so this only checks that #repos shows some text once loading has finished.',
  });
  await page.goto('./');
  await page.waitForLoadState('networkidle');
  const repos = page.locator('#repos');
  await expect(repos).toBeVisible();
  await expect(repos).toHaveText(/\S/);
});

test('SPEC.md:7 - #hero and #contact contain email, GitHub and LinkedIn links', async ({ page }) => {
  await page.goto('./');
  const links = {
    email: 'a[href^="mailto:"]',
    GitHub: 'a[href*="github.com"]',
    LinkedIn: 'a[href*="linkedin.com"]',
  };
  for (const section of ['hero', 'contact']) {
    for (const [name, selector] of Object.entries(links)) {
      await expect
        .soft(page.locator(`#${section} ${selector}`).first(), `#${section} should have a ${name} link`)
        .toBeVisible();
    }
  }
});
