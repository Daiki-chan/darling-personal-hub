import { expect, test } from "@playwright/test";
import { mockTrendingMusic, openHydratedMusic } from "./music-fixtures";

test.describe("Music track interactions", () => {
  test.beforeEach(async ({ page }) => {
    await mockTrendingMusic(page);
    await openHydratedMusic(page);
  });

  test("a Discover card has one primary card action and one overflow menu", async ({ page }) => {
    const card = page.locator("article[role='button']").first();
    await expect(card).toBeVisible();
    await expect(card.locator('button[aria-label^="Mở tùy chọn cho "]')).toHaveCount(1);
    await expect(page.getByRole("menu")).toHaveCount(0);
  });

  test("the overflow menu is singular and restores focus on Escape", async ({ page }) => {
    const trigger = page
      .locator("article[role='button']")
      .first()
      .locator('button[aria-label^="Mở tùy chọn cho "]');
    await trigger.click();

    await expect(page.getByRole("menu")).toHaveCount(1);
    await expect(page.getByRole("menuitem", { name: "Phát tiếp theo" })).toHaveCount(1);
    await expect(page.getByRole("menuitem", { name: "Thêm vào hàng đợi" })).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("the FOR YOU menu opens without changing the document scroll position", async ({ page }) => {
    const section = page.getByRole("region", { name: "02 / FOR YOU" });
    await section.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);

    const trigger = section.locator('[role="button"]').first().locator('button[aria-label^="Mở tùy chọn cho "]');
    await trigger.click();

    await expect(page.getByRole("menu")).toHaveCount(1);
    const after = await page.evaluate(() => window.scrollY);
    expect(Math.abs(after - before)).toBeLessThan(3);
    expect(await page.evaluate(() => location.hash)).toBe("");
  });

  test("only one FOR YOU chapter exists", async ({ page }) => {
    await expect(page.locator("#for-you-title")).toHaveCount(1);
    await expect(page.getByRole("region", { name: "02 / FOR YOU" })).toHaveCount(1);
  });

  test("playing a card creates a bounded queue manifest", async ({ page }) => {
    await page.locator("article[role='button']").first().click();
    const queue = page.locator('ol[class*="queueList"]');
    await expect(queue).toBeVisible();

    const style = await queue.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { maxHeight: computed.maxHeight, overflowY: computed.overflowY };
    });
    expect(style.overflowY).toBe("auto");
    expect(style.maxHeight).not.toBe("none");
  });

  for (const viewport of [
    { height: 900, name: "desktop", width: 1440 },
    { height: 1024, name: "tablet", width: 768 },
    { height: 844, name: "mobile", width: 390 },
  ]) {
    test(`${viewport.name} keeps cards inside a vertical-only document`, async ({ page }) => {
      await page.setViewportSize({ height: viewport.height, width: viewport.width });
      await page.reload();
      await expect(page.locator("article[role='button']").first()).toBeVisible();

      const metrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);

      const card = await page.locator("article[role='button']").first().boundingBox();
      expect(card).not.toBeNull();
      expect(card?.width ?? 0).toBeGreaterThan(120);
      expect(card?.width ?? Infinity).toBeLessThanOrEqual(metrics.clientWidth);
    });
  }
});
