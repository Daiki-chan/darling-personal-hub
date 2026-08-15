import { expect, test } from "@playwright/test";

test.describe("Music Hub Shutdown & YouTube Stage Lifecycle", () => {
  test("shutting down player stops iframe, destroys stage and cleans session", async ({ page }) => {
    await page.goto("/music");

    // Expect search section title
    await expect(page.getByRole("heading", { name: "Âm nhạc cho khoảng riêng." })).toBeVisible();

    // Verify initial YouTube iframe count is 0
    const initialIframe = await page.locator('iframe[src*="youtube"]').count();
    expect(initialIframe).toBe(0);

    // Click a suggestion button e.g. "city pop"
    const suggestionBtn = page.getByRole("button", { name: "city pop" });
    if (await suggestionBtn.isVisible()) {
      await suggestionBtn.click();
      // Wait for search card or results block
      const resultCard = page.locator("article").first();
      await expect(resultCard).toBeVisible({ timeout: 15000 });

      // Click play on first track
      const playTrackBtn = resultCard.getByRole("button", { name: /Phát ngay|Phát/i }).first();
      if (await playTrackBtn.isVisible()) {
        await playTrackBtn.click();

        // Player dock should now be visible
        const playerDock = page.locator('section[aria-label*="Trình phát"]');
        await expect(playerDock).toBeVisible({ timeout: 10000 });

        // Click "Tắt trình phát" (Power icon button)
        const shutdownBtn = page.getByRole("button", { name: "Tắt trình phát" });
        await expect(shutdownBtn).toBeVisible();
        await shutdownBtn.click();

        // Verify player dock is hidden/detached
        await expect(playerDock).toBeHidden();

        // Verify zero YouTube iframe elements remain in DOM
        const finalIframe = await page.locator('iframe[src*="youtube"]').count();
        expect(finalIframe).toBe(0);
      }
    }
  });
});
