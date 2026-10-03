import { expect, test } from "@playwright/test";

test.describe("Portfolio Redesign — Obsidian Digital Exhibition", () => {
  test("direct /portfolio render has complete information architecture and no console errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");

    // 1. Hero verification
    const hero = page.locator(".phuc-hero-root");
    await expect(hero).toBeVisible();
    await expect(hero.locator(".phuc-hero-author")).toContainText("PHẠM HOÀNG PHÚC");
    await expect(hero.locator(".phuc-hero-title")).toContainText("DIGITAL");
    await expect(hero.locator(".phuc-hero-title")).toContainText("WORK / SYSTEMS");
    await expect(hero.locator(".phuc-hero-title")).toContainText("/ EXPERIMENTS");

    // 2. Selected Work section (#selected-work)
    const selectedWork = page.locator("#selected-work");
    await expect(selectedWork).toBeVisible();
    const exhibitCards = selectedWork.locator(".phuc-exhibit-card");
    await expect(exhibitCards).toHaveCount(4);
    await expect(exhibitCards.first()).toContainText("DARLING PERSONAL HUB");

    // 3. Archive section (#work-index)
    const archive = page.locator("#work-index");
    await expect(archive).toBeVisible();
    const rows = archive.locator(".phuc-archive-row");
    await expect(rows).toHaveCount(7);

    // 4. What I Build section (#what-i-build & #method)
    const whatIBuild = page.locator("#what-i-build");
    await expect(whatIBuild).toBeVisible();
    const pillars = whatIBuild.locator(".phuc-pillar-card");
    await expect(pillars).toHaveCount(4);
    await expect(page.locator("#method")).toBeVisible();

    // 5. Experiments section (#experiments)
    const experiments = page.locator("#experiments");
    await expect(experiments).toBeVisible();
    const expCards = experiments.locator(".phuc-exp-card");
    await expect(expCards).toHaveCount(4);
    await expect(expCards.first()).toContainText("UNKNOWN / PORTAL GATEWAY");

    // 6. About section (#about)
    const about = page.locator("#about");
    await expect(about).toBeVisible();
    await expect(about.locator(".phuc-about__headline")).toContainText(
      "I BUILD DIGITAL EXPERIENCES WHERE"
    );

    // 7. Contact section (#contact)
    const contact = page.locator("#contact");
    await expect(contact).toBeVisible();
    await expect(contact.locator(".phuc-contact__headline")).toContainText("LET'S TALK");
    await expect(contact.locator(".phuc-contact-link--github")).toHaveAttribute(
      "href",
      "https://github.com/Daiki-chan"
    );

    // Ensure no unexpected console errors occurred
    expect(consoleErrors.filter((e) => !e.includes("favicon"))).toHaveLength(0);
  });

  test("navigation flow: Portfolio → Case Study → Next Project → Return", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");

    // Click on the first exhibit card CTA
    const firstCta = page.locator(".phuc-exhibit-cta-btn").first();
    await firstCta.scrollIntoViewIfNeeded();
    await firstCta.click();

    // Should navigate to /portfolio/darling-personal-hub
    await expect(page).toHaveURL(/\/portfolio\/darling-personal-hub$/);
    const title = page.locator("#cs-title");
    await expect(title).toBeVisible();
    await expect(title).toHaveText("DARLING PERSONAL HUB");

    // Verify monograph narrative chapters
    await expect(page.locator(".phuc-cs-block").first()).toContainText("Quy mô & Bối cảnh");

    // Next Project navigation bridge
    const nextBridge = page.locator(".phuc-next-card");
    await nextBridge.scrollIntoViewIfNeeded();
    await nextBridge.click();

    // Should navigate to next project
    await expect(page).toHaveURL(/\/portfolio\/organic-search-growth-system$/);
    await expect(page.locator("#cs-title")).toHaveText("HỆ THỐNG TĂNG TRƯỞNG TÌM KIẾM TỰ NHIÊN");

    // Back button returns to /portfolio
    await page.locator(".phuc-back-btn").click();
    await expect(page).toHaveURL(/\/portfolio$/);
    await expect(page.locator("#work-index")).toBeAttached();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test("deep-linking and 404 error handling for invalid slugs", async ({ page }) => {
    const response = await page.goto("/portfolio/non-existent-project-slug");
    expect(response?.status()).toBe(404);
  });

  test("responsive viewport matrix has zero horizontal overflow", async ({ page }) => {
    const viewports = [
      { width: 320, height: 600 },
      { width: 375, height: 667 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto("/portfolio");
      await page.waitForLoadState("domcontentloaded");

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(
        hasHorizontalScroll,
        `Viewport ${vp.width}x${vp.height} should have no horizontal overflow`
      ).toBe(false);
    }
  });

  test("prefers-reduced-motion is respected without breaking layout", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator(".phuc-hero-root")).toBeVisible();
    await expect(page.locator("#selected-work")).toBeVisible();
    await expect(page.locator("#work-index")).toBeVisible();
  });
});
