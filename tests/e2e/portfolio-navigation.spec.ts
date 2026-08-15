import { expect, test } from "@playwright/test";

test.describe("Portfolio navigation", () => {
  test("archive case-study round trip preserves a usable document scroll state", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");

    const firstArchiveProject = page.locator(".phuc-archive-row").first();
    await firstArchiveProject.scrollIntoViewIfNeeded();
    await firstArchiveProject.click();

    await expect(page).toHaveURL(/\/portfolio\/[^/]+$/);
    await expect(page.locator("#cs-title")).toBeVisible();

    await page.locator(".phuc-back-btn").click();

    await expect(page).toHaveURL(/\/portfolio$/);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator("#work-index")).toBeAttached();
  });
});
