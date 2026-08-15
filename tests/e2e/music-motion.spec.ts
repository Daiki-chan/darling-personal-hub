import { expect, test } from "@playwright/test";

test.describe("Music motion system", () => {
  test("reveals hero and chapters while keeping native vertical scroll", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/music");
    await page.waitForLoadState("domcontentloaded");

    const hero = page.locator("header [data-motion-reveal]");
    await expect(hero).toHaveCount(2);
    await expect(hero.first()).toBeVisible();

    const discover = page.locator("#discover");
    await discover.evaluate((node) => {
      const element = node as HTMLElement;
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - window.innerHeight * 0.68), behavior: "instant" });
    });
    await expect(discover.locator("[data-motion-reveal]").first()).toBeVisible();

    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });

  test("reduced motion leaves all chapter content immediately visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/music");
    await page.waitForLoadState("domcontentloaded");

    const hiddenMarkers = await page.locator("[data-motion-reveal]").evaluateAll((nodes) =>
      nodes.filter((node) => {
        const style = getComputedStyle(node);
        return style.opacity === "0" || style.visibility === "hidden";
      }).length
    );

    expect(hiddenMarkers).toBe(0);
    await expect(page.locator('[data-ticker-active="true"]')).toHaveCount(0);
  });
});
