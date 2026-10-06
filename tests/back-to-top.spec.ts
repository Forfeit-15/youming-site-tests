import { test, expect, type Page, type Locator } from '@playwright/test';

// Requirements from SPEC.md, "## Issue #4: back-to-top button" (lines 14-16).

// The spec does not name the button, so it is found by its accessible name.
function backToTop(page: Page): Locator {
  return page.getByRole('button', { name: /top/i });
}

// "Hidden" from the user's point of view: Playwright counts opacity:0 as
// visible, so check opacity and visibility as well.
async function isShown(button: Locator): Promise<boolean> {
  if ((await button.count()) === 0 || !(await button.first().isVisible())) return false;
  return button.first().evaluate((el) => {
    const style = getComputedStyle(el);
    return style.visibility !== 'hidden' && Number(style.opacity) > 0;
  });
}

async function scrollPastHero(page: Page): Promise<void> {
  await page.evaluate(() => {
    const hero = document.querySelector('#hero');
    if (!hero) throw new Error('#hero not found');
    const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({ top: heroBottom + 1, behavior: 'instant' });
  });
}

test.beforeEach(async ({ page }) => {
  test.info().annotations.push({
    type: 'spec-unclear',
    description: 'SPEC.md:14-16 do not name the button; these tests assume a button whose accessible name contains "top".',
  });
  await page.goto('./');
});

test('SPEC.md:14 - the back-to-top button appears after scrolling past the hero section', async ({ page }) => {
  await scrollPastHero(page);
  await expect.poll(() => isShown(backToTop(page)), { message: 'button should be shown' }).toBe(true);
});

test('SPEC.md:15 - the back-to-top button is hidden at the top of the page', async ({ page }) => {
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect.poll(() => isShown(backToTop(page)), { message: 'button should be hidden' }).toBe(false);
});

test('SPEC.md:16 - clicking the back-to-top button returns to the top', async ({ page }) => {
  await scrollPastHero(page);
  await expect.poll(() => isShown(backToTop(page))).toBe(true);
  await backToTop(page).first().click();
  await expect.poll(() => page.evaluate(() => window.scrollY), { message: 'page should be at the top' }).toBe(0);
});
