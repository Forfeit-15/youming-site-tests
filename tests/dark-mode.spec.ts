import { test, expect, type Page, type Locator } from '@playwright/test';

// Requirements from SPEC.md, "## Issue #1: dark-mode toggle" (lines 10-11).

const DARK = /(^|\s)dark(\s|$)/;

async function bodyIsDark(page: Page): Promise<boolean> {
  return page.evaluate(() => document.body.classList.contains('dark'));
}

// The spec says "a button in the nav" but not which one, so try each nav
// button and return the first whose click flips the 'dark' class on <body>.
async function findDarkToggle(page: Page): Promise<Locator> {
  const buttons = page.getByRole('navigation').getByRole('button');
  const count = await buttons.count();
  expect(count, 'there should be at least one button in the nav').toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    if (!(await button.isVisible())) continue;
    const before = await bodyIsDark(page);
    await button.click();
    if ((await bodyIsDark(page)) !== before) return button;
  }
  throw new Error("no button in the nav toggles the 'dark' class on <body>");
}

test.use({ colorScheme: 'light' });

test("SPEC.md:10 - a button in the nav toggles a 'dark' class on <body>", async ({ page }) => {
  await page.goto('./');
  const startDark = await bodyIsDark(page);

  // findDarkToggle leaves the class flipped once.
  const toggle = await findDarkToggle(page);
  expect(await bodyIsDark(page)).toBe(!startDark);

  await toggle.click();
  if (startDark) await expect(page.locator('body')).toHaveClass(DARK);
  else await expect(page.locator('body')).not.toHaveClass(DARK);
});

test('SPEC.md:11 - the dark-mode choice is kept for the session', async ({ page }) => {
  await page.goto('./');
  const startDark = await bodyIsDark(page);
  await findDarkToggle(page);

  await page.reload();
  if (startDark) await expect(page.locator('body')).not.toHaveClass(DARK);
  else await expect(page.locator('body')).toHaveClass(DARK);
});
