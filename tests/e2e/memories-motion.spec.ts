import { expect, test } from "@playwright/test";

test.describe("Memories recall motion", () => {
  test("Darkroom keeps its DOM during exit and restores body scroll", async ({ page }) => {
    await page.goto("/memories");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#chapter-game").evaluate((node) => {
      const element = node as HTMLElement;
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - window.innerHeight * 0.68), behavior: "instant" });
    });
    await page.locator(".mem-card__frame").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-label", /G\/001/);
    await page.keyboard.press("ArrowRight");
    await expect(dialog).toHaveAttribute("aria-label", /G\/002/);

    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await page.locator(".darkroom-modal__close-btn").click();
    await page.waitForTimeout(50);
    await expect(dialog).toHaveCount(1);
    await expect(dialog).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator(".mem-card__frame").first()).toBeFocused();
  });

  test("reduced motion keeps every chapter visible and vertical-only", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/memories");
    await page.waitForLoadState("domcontentloaded");

    const hiddenMarkers = await page.locator("[data-motion-reveal]").evaluateAll((nodes) =>
      nodes.filter((node) => {
        const style = getComputedStyle(node);
        return style.opacity === "0" || style.visibility === "hidden";
      }).length
    );

    expect(hiddenMarkers).toBe(0);
    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
});
