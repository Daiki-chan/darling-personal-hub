import { expect, test } from "@playwright/test";
import { mockTrendingMusic } from "./music-fixtures";

test.describe("Portal Back Navigation & Direct Entry Contract", () => {
  test("fresh / load initializes INTRO_1 without jumping directly to portal active", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const portal = page.locator(".typo-portal-root");
    await expect(portal).toBeVisible();
    await expect(portal).toHaveAttribute("data-step", "0");
    await expect(portal).toHaveAttribute("data-stage", "INTRO_1");

    const intro01 = page.locator(".typo-intro-stage--01");
    await expect(intro01).toBeVisible();
  });

  test("fresh /#portals load opens directly in PORTAL_ACTIVE (step 2)", async ({ page }) => {
    await page.goto("/#portals");
    await page.waitForLoadState("domcontentloaded");

    const portal = page.locator(".typo-portal-root");
    await expect(portal).toBeVisible();
    await expect(portal).toHaveAttribute("data-step", "2");
    await expect(portal).toHaveAttribute("data-stage", "PORTAL_ACTIVE");

    // Intro stages should not be active
    await expect(page.locator(".typo-intro-stage--01")).toHaveCount(0);
    // Destination words should be rendered
    await expect(page.locator(".dest-word").first()).toBeVisible();
  });

  test("Portal -> Music -> Browser Back returns to PORTAL_ACTIVE", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Step 0 -> Step 1
    await page.locator(".typo-intro-stage--01").click();
    await expect(page.locator(".typo-portal-root")).toHaveAttribute("data-step", "1");

    // Step 1 -> Step 2 (PORTAL_ACTIVE)
    await page.locator(".typo-intro-stage--02").click();
    await expect(page.locator(".typo-portal-root")).toHaveAttribute("data-step", "2");
    await expect(page.locator(".typo-portal-root")).toHaveAttribute("data-stage", "PORTAL_ACTIVE");

    // Click Music destination
    const musicBtn = page.locator('.dest-word[data-dest-id="music"]');
    await expect(musicBtn).toBeVisible();
    await musicBtn.click();

    await page.waitForURL(/\/music$/);
    await expect(page.getByRole("heading", { name: "MUSIC ARCHIVE" })).toBeVisible();

    // Trigger Browser Back
    await page.goBack();

    await page.waitForURL(/#portals$/);
    const portal = page.locator(".typo-portal-root");
    await expect(portal).toBeVisible();
    await expect(portal).toHaveAttribute("data-step", "2");
    await expect(portal).toHaveAttribute("data-stage", "PORTAL_ACTIVE");
    await expect(page.locator(".typo-intro-stage--01")).toHaveCount(0);
  });

  test("Portal -> Memories -> Browser Back returns to PORTAL_ACTIVE", async ({ page }) => {
    await page.goto("/#portals");
    await page.waitForLoadState("domcontentloaded");

    const memoriesBtn = page.locator('.dest-word[data-dest-id="memories"]');
    await expect(memoriesBtn).toBeVisible();
    await memoriesBtn.click();

    await page.waitForURL(/\/memories$/);
    await expect(page.locator(".site-nav .brand")).toBeVisible();

    // Trigger Browser Back
    await page.goBack();

    await page.waitForURL(/#portals$/);
    const portal = page.locator(".typo-portal-root");
    await expect(portal).toBeVisible();
    await expect(portal).toHaveAttribute("data-step", "2");
    await expect(portal).toHaveAttribute("data-stage", "PORTAL_ACTIVE");
  });

  test("Portal -> Portfolio -> Browser Back returns to PORTAL_ACTIVE", async ({ page }) => {
    await page.goto("/#portals");
    await page.waitForLoadState("domcontentloaded");

    const portfolioBtn = page.locator('.dest-word[data-dest-id="work"]');
    await expect(portfolioBtn).toBeVisible();
    await portfolioBtn.click();

    await page.waitForURL(/\/portfolio$/);
    await expect(page.locator(".site-nav .brand")).toBeVisible();

    // Trigger Browser Back
    await page.goBack();

    await page.waitForURL(/#portals$/);
    const portal = page.locator(".typo-portal-root");
    await expect(portal).toBeVisible();
    await expect(portal).toHaveAttribute("data-step", "2");
    await expect(portal).toHaveAttribute("data-stage", "PORTAL_ACTIVE");
  });

  for (const route of ["/music", "/memories", "/portfolio"]) {
    test(`Reload on inner page (${route}) -> Browser Back returns to PORTAL_ACTIVE`, async ({ page }) => {
      await page.goto("/#portals");
      await page.waitForLoadState("domcontentloaded");

      // Navigate to inner route
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      // Reload inner page
      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      // Trigger Browser Back
      await page.goBack();

      await page.waitForURL(/#portals$/);
      const portal = page.locator(".typo-portal-root");
      await expect(portal).toBeVisible();
      await expect(portal).toHaveAttribute("data-step", "2");
      await expect(portal).toHaveAttribute("data-stage", "PORTAL_ACTIVE");
    });
  }

  test("Music player expanded: Back once minimizes player dock, Back twice returns to PORTAL_ACTIVE", async ({ page }) => {
    await mockTrendingMusic(page);
    await page.goto("/#portals");
    await page.waitForLoadState("domcontentloaded");

    const musicBtn = page.locator('.dest-word[data-dest-id="music"]');
    await expect(musicBtn).toBeVisible();
    await musicBtn.click();

    await page.waitForURL(/\/music$/);
    await expect(page.getByRole("heading", { name: "MUSIC ARCHIVE" })).toBeVisible();

    // Start playing a track
    await page.locator("article[role='button']").first().click();

    const playerDock = page.getByRole("region", { name: "Trình phát thu gọn" });
    await expect(playerDock).toBeVisible();

    // Open expanded player
    const expandBtn = page.getByRole("button", { name: "Mở trình phát" });
    await expandBtn.click();

    const expandedDialog = page.getByRole("dialog", { name: "Trình phát mở rộng" });
    await expect(expandedDialog).toBeVisible();

    // 1st Browser Back: Should minimize player dock, stay on /music
    await page.goBack();
    await expect(expandedDialog).toHaveCount(0);
    await expect(playerDock).toBeVisible();
    await expect(page).toHaveURL(/\/music$/);

    // 2nd Browser Back: Should return to /#portals (PORTAL_ACTIVE)
    await page.goBack();
    await page.waitForURL(/#portals$/);
    const portal = page.locator(".typo-portal-root");
    await expect(portal).toBeVisible();
    await expect(portal).toHaveAttribute("data-step", "2");
    await expect(portal).toHaveAttribute("data-stage", "PORTAL_ACTIVE");
  });
});
