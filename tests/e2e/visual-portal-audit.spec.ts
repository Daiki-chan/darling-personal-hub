import { test, expect } from "@playwright/test";

test.describe("Portal Visual and Interaction Redesign Audit", () => {
  test("Desktop: stable 1fr/1fr/1fr grid, consistent hover model, no media cards", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#portals");

    const nav = page.locator(".typo-world-nav");
    await expect(nav).toBeVisible();

    const memoriesBtn = page.locator('.dest-word[data-dest-id="memories"]');
    const musicBtn = page.locator('.dest-word[data-dest-id="music"]');
    const workBtn = page.locator('.dest-word[data-dest-id="work"]');

    await expect(memoriesBtn).toBeVisible();
    await expect(musicBtn).toBeVisible();
    await expect(workBtn).toBeVisible();

    // Verify NO media card classes exist in DOM
    await expect(page.locator(".dest-media--memories")).toHaveCount(0);
    await expect(page.locator(".dest-media--music")).toHaveCount(0);
    await expect(page.locator(".dest-media--work")).toHaveCount(0);
    await expect(page.locator(".dest-word__arch-guide")).toHaveCount(0);
    await expect(page.locator(".dest-word__practice-title")).toHaveCount(0);
    await expect(page.locator(".dest-word__nav-meta")).toHaveCount(0);

    await page.screenshot({ path: "test-results/portal-resting-desktop.png" });

    // 1. Hover MEMORIES
    await memoriesBtn.hover();
    await page.waitForTimeout(400);

    // Consistent hover model: hairline + category visible
    await expect(memoriesBtn.locator(".dest-word__hairline")).toBeVisible();
    await expect(memoriesBtn.locator(".dest-word__category")).toBeVisible();
    await expect(memoriesBtn.locator(".dest-word__category")).toContainText("PHOTOGRAPHY");

    // Verify no case-study or fake metadata
    await expect(page.locator("text=HỆ THỐNG TĂNG TRƯỞNG TÌM KIẾM TỰ NHIÊN")).toHaveCount(0);
    await expect(page.locator("text=SEO STRATEGY")).toHaveCount(0);

    await page.screenshot({ path: "test-results/portal-memories-hover.png" });

    // 2. Hover MUSIC
    await musicBtn.hover();
    await page.waitForTimeout(400);

    await expect(musicBtn.locator(".dest-word__hairline")).toBeVisible();
    await expect(musicBtn.locator(".dest-word__category")).toBeVisible();
    await expect(musicBtn.locator(".dest-word__category")).toContainText("PLAYLISTS");

    await page.screenshot({ path: "test-results/portal-music-hover.png" });

    // 3. Hover PORTFOLIO
    await workBtn.hover();
    await page.waitForTimeout(400);

    // Verify consistent model: hairline + category
    await expect(workBtn.locator(".dest-word__hairline")).toBeVisible();
    await expect(workBtn.locator(".dest-word__category")).toBeVisible();
    await expect(workBtn.locator(".dest-word__category")).toContainText("MONOGRAPH");

    // Titles must be single-line: check no overflow / wrapping
    const glyphs = workBtn.locator(".dest-word__glyphs");
    await expect(glyphs).toBeVisible();

    await page.screenshot({ path: "test-results/portal-portfolio-hover.png" });

    // 4. Move cursor out — hover reverses
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);
    await page.screenshot({ path: "test-results/portal-idle-after-leave.png" });

    // 5. Rapid hover stability test
    for (let i = 0; i < 3; i++) {
      await memoriesBtn.hover();
      await page.waitForTimeout(80);
      await musicBtn.hover();
      await page.waitForTimeout(80);
      await workBtn.hover();
      await page.waitForTimeout(80);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(80);
    }
  });

  test("Desktop: title wrapping check at 1280px, 1440px, 1920px", async ({ page }) => {
    const widths = [1280, 1440, 1920];

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/#portals");

      const nav = page.locator(".typo-world-nav");
      await expect(nav).toBeVisible();

      // Check all three title glyphs are single-line (clientHeight ≤ ~1.1× fontSize)
      const titlesWrapped = await page.evaluate(() => {
        const glyphs = document.querySelectorAll(".dest-word__glyphs");
        return Array.from(glyphs).map((el) => {
          const h = el.getBoundingClientRect().height;
          return { text: el.textContent?.trim(), height: h };
        });
      });

      for (const t of titlesWrapped) {
        // Height should be less than 120px (single line at our font sizes)
        expect(t.height).toBeLessThan(120);
      }

      await page.screenshot({ path: `test-results/portal-titles-${width}px.png` });
    }
  });

  test("Mobile view: clean chapter flow, no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#portals");

    const mobileShell = page.locator(".typo-world-mobile");
    await expect(mobileShell).toBeVisible();

    const chapters = page.locator(".mobile-chapter");
    await expect(chapters).toHaveCount(3);

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    await page.screenshot({ path: "test-results/portal-mobile-chapters.png" });

    // Scroll to Portfolio chapter
    await chapters.nth(2).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(chapters.nth(2).locator("text=MONOGRAPH / PROJECTS / WORK")).toBeVisible();
    await page.screenshot({ path: "test-results/portal-mobile-portfolio-chapter.png" });
  });
});
