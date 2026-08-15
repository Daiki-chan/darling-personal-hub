import { expect, test } from "@playwright/test";
import { mockTrendingMusic, openHydratedMusic } from "./music-fixtures";

test.describe("Music player lifecycle", () => {
  test("shutdown removes the active player stage and restores the dormant shell", async ({ page }) => {
    await mockTrendingMusic(page);
    await openHydratedMusic(page);

    await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
    await page.locator("article[role='button']").first().click();

    const playerDock = page.getByRole("region", { name: "Trình phát thu gọn" });
    await expect(playerDock).toBeVisible();
    await page.getByRole("button", { name: "Tắt trình phát" }).click();

    await expect(playerDock).toHaveCount(0);
    await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
  });
});
