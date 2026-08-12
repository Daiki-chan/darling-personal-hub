import { test, expect } from "@playwright/test";

test.describe("Portfolio Mobile Responsive & UX Interaction Suite", () => {
  test("direct load vs SPA navigation body overflow & scroll layout stability", async ({ page }) => {
    // Flow 1: Direct Load to /portfolio
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");

    const directOverflow = await page.evaluate(() => document.body.style.overflow);
    const directViewportWidth = await page.evaluate(() => window.innerWidth);
    expect(directOverflow).toBe("");

    // Flow 2: Navigation from / -> /portfolio via IntroGate
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const introStage = page.locator(".intro-stage");
    await introStage.click(); // step 0 -> 1
    await page.waitForTimeout(200);
    await introStage.click(); // step 1 -> 2
    await page.waitForTimeout(200);

    const portfolioPortal = page.locator(".portal--work");
    await expect(portfolioPortal).toBeVisible();
    await portfolioPortal.click();

    await page.waitForURL("**/portfolio");
    await page.waitForTimeout(400);

    const spaOverflow = await page.evaluate(() => document.body.style.overflow);
    const spaViewportWidth = await page.evaluate(() => window.innerWidth);

    expect(spaOverflow).toBe("");
    expect(spaViewportWidth).toBe(directViewportWidth);
  });

  test("forward and reverse scroll through Horizontal Showcase works cleanly", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");

    // Scroll to Horizontal Showcase section
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: "instant" }));
    await page.waitForTimeout(300);

    // Forward scroll deep into horizontal pin
    await page.evaluate(() => window.scrollTo({ top: 2500, behavior: "instant" }));
    await page.waitForTimeout(300);

    const progressCounter = page.locator(".phuc-progress-counter");
    if (await progressCounter.isVisible()) {
      const text = await progressCounter.textContent();
      expect(text).toContain("03");
    }

    // Reverse scroll back up to hero
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);

    const scrollYTop = await page.evaluate(() => window.scrollY);
    expect(scrollYTop).toBe(0);
  });

  test("Archive List <-> Grid view mode toggle & Case Study Back navigation state restoration", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");

    // Scroll down to Archive
    const archiveTitle = page.locator("#archive-title");
    await archiveTitle.scrollIntoViewIfNeeded();

    // Toggle to Grid view
    const gridBtn = page.getByRole("button", { name: "LƯỚI" });
    await gridBtn.click();

    const gridMatrix = page.locator(".phuc-archive__grid-matrix");
    await expect(gridMatrix).toBeVisible();

    // Click on a project card in Grid view
    const firstGridCard = gridMatrix.locator("a").first();
    await firstGridCard.click();

    // Verify Case Study page loaded
    await page.waitForURL("**/portfolio/*");
    await expect(page.locator("#cs-title")).toBeVisible();

    // Click Back button
    const backBtn = page.locator(".phuc-back-btn");
    await backBtn.click();

    await page.waitForURL("**/portfolio");
    await page.waitForTimeout(400);

    // Verify viewMode is preserved as Grid mode after Back navigation
    await expect(gridMatrix).toBeVisible();
  });

  test("mobile responsive layout audit across 360x800, 390x844, 412x915, 768x1024", async ({ page }) => {
    const viewports = [
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 412, height: 915 },
      { width: 768, height: 1024 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto("/portfolio");
      await page.waitForLoadState("domcontentloaded");

      // 1. Verify zero horizontal overflow
      const overflowInfo = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(overflowInfo.scrollWidth).toBeLessThanOrEqual(overflowInfo.clientWidth + 1);

      // 2. Verify mobile hint text & arrow
      const mobileHint = page.locator(".phuc-hint-text-mobile");
      await expect(mobileHint).toBeVisible();

      // 3. Verify Editorial Steps single column grid on mobile (P0)
      const stepGridColumns = await page.locator(".phuc-editorial-step").first().evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      // Should resolve to 1 column width (e.g., "328px" or similar single value)
      expect(stepGridColumns.split(" ").length).toBe(1);

      // 4. Verify Numbers / KPI Editorial Grid 2x2 on mobile
      const numbersGridColumns = await page.locator(".phuc-numbers__editorial-grid").evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      // Should resolve to 2 column widths
      expect(numbersGridColumns.split(" ").length).toBe(2);

      // 5. Verify Showcase Project Content Layer single column layout for all variants
      const project2Columns = await page.locator(".phuc-showcase-project--layout-2 .phuc-proj-content-layer").evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      expect(project2Columns.split(" ").length).toBe(1);
    }
  });

  test("desktop regression check on 1366x768 and 1920x1080", async ({ page }) => {
    const desktopViewports = [
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
    ];

    for (const vp of desktopViewports) {
      await page.setViewportSize(vp);
      await page.goto("/portfolio");
      await page.waitForLoadState("domcontentloaded");

      // Verify desktop hint text visible
      const desktopHint = page.locator(".phuc-hint-text-desktop");
      await expect(desktopHint).toBeVisible();

      // Verify Editorial Steps 2-column grid on desktop
      const stepGridColumns = await page.locator(".phuc-editorial-step").first().evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      expect(stepGridColumns.split(" ").length).toBe(2);

      // Verify Numbers 4-column grid on desktop
      const numbersGridColumns = await page.locator(".phuc-numbers__editorial-grid").evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      expect(numbersGridColumns.split(" ").length).toBe(4);
    }
  });
});
