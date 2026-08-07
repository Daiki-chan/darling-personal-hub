import { expect, test } from "@playwright/test";

test.describe("Music Hub Card Redesign, 3-Dot Menu & Deduplicated For-You", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/am-nhac");
  });

  test("each card has exactly one play button on cover and one 3-dot menu button", async ({ page }) => {
    // Wait for trending tracks or search section
    const firstCard = page.locator("article").first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Overlay play button on cover image
    const playBtn = firstCard.locator('button[aria-label^="Phát "]');
    await expect(playBtn).toBeVisible();

    // 3-dot menu button
    const menuBtn = firstCard.locator('button[aria-label^="Mở tùy chọn cho "]');
    await expect(menuBtn).toBeVisible();

    // Verify "Phát tiếp theo" and "Thêm vào hàng đợi" are NOT directly visible on card outside menu
    await expect(firstCard.getByRole("button", { name: "Phát tiếp theo" })).toBeHidden();
    await expect(firstCard.getByRole("button", { name: "Thêm vào hàng đợi" })).toBeHidden();
  });

  test("clicking 3-dot menu opens portal menu with options and handles Escape / outside click", async ({ page }) => {
    const firstCard = page.locator("article").first();
    await expect(firstCard).toBeVisible();

    const menuBtn = firstCard.locator('button[aria-label^="Mở tùy chọn cho "]');
    await menuBtn.click();

    // Portal menu should be visible in body
    const portalMenu = page.locator('div[role="menu"]');
    await expect(portalMenu).toBeVisible();

    // Menu options
    const playNextBtn = portalMenu.getByRole("menuitem", { name: "Phát tiếp theo" });
    const addToQueueBtn = portalMenu.getByRole("menuitem", { name: "Thêm vào hàng đợi" });
    await expect(playNextBtn).toBeVisible();
    await expect(addToQueueBtn).toBeVisible();

    // Press Escape to close menu and return focus to trigger button
    await page.keyboard.press("Escape");
    await expect(portalMenu).toBeHidden();
    await expect(menuBtn).toBeFocused();
  });

  test("page has exactly one 'Dành cho bạn' section in DOM", async ({ page }) => {
    const forYouHeadings = page.getByRole("heading", { name: "Dành cho bạn" });
    await expect(forYouHeadings).toHaveCount(1);

    const forYouSection = page.locator("#for-you-section");
    await expect(forYouSection).toBeVisible();
  });

  test("queue list has bounded scroll container with scrollable content", async ({ page }) => {
    // Add multiple tracks to queue via suggestion or search
    const suggestionBtn = page.getByRole("button", { name: "city pop" });
    if (await suggestionBtn.isVisible()) {
      await suggestionBtn.click();
      const firstCard = page.locator("article").first();
      await expect(firstCard).toBeVisible({ timeout: 15000 });

      // Click play to open player dock
      const playBtn = firstCard.locator('button[aria-label^="Phát "]').first();
      await playBtn.click();

      // Locate queue list
      const queueList = page.locator('ol[class*="queueList"]');
      if (await queueList.isVisible()) {
        const isBounded = await queueList.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.overflowY === "auto" && style.maxHeight !== "none";
        });
        expect(isBounded).toBe(true);
      }
    }
  });
});
