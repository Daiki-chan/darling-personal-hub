import { expect, test } from "@playwright/test";

const VERTICAL_ROUTES = ["/music", "/memories"] as const;

async function documentMetrics(page: import("@playwright/test").Page) {
  return page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    pinSpacers: document.querySelectorAll(".pin-spacer").length,
    scrollWidth: document.documentElement.scrollWidth,
  }));
}

test.describe("cross-page motion and scroll contract", () => {
  for (const route of VERTICAL_ROUTES) {
    test(`${route} remains native vertical-only`, async ({ page }) => {
      await page.setViewportSize({ width: 1366, height: 768 });
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const metrics = await documentMetrics(page);
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
      expect(metrics.pinSpacers).toBe(0);
    });
  }

  test("Portfolio owns the only desktop horizontal storytelling section", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");

    const showcase = page.locator("#selected-work");
    const track = page.locator(".phuc-showcase-track");
    await expect(showcase).toBeVisible();

    await expect
      .poll(async () => showcase.evaluate((node) => node.parentElement?.classList.contains("pin-spacer")))
      .toBe(true);

    const range = await showcase.evaluate((node) => {
      const element = node as HTMLElement;
      const spacer = element.parentElement;
      return {
        start: spacer?.offsetTop ?? element.offsetTop,
        distance: Math.max(0, (spacer?.offsetHeight ?? element.offsetHeight) - window.innerHeight),
      };
    });

    await page.evaluate(
      ({ start, distance }) => window.scrollTo({ top: start + distance * 0.55, behavior: "instant" }),
      range
    );

    await expect
      .poll(() => track.evaluate((node) => getComputedStyle(node).transform))
      .not.toBe("none");

    const spreadFilters = await page
      .locator(".phuc-editorial-spread")
      .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).filter));
    expect(spreadFilters.every((filter) => filter === "none")).toBe(true);
    await expect(page.locator(".phuc-custom-cursor")).toHaveCount(0);
  });

  test("Portfolio falls back to a vertical stack on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");

    const metrics = await documentMetrics(page);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.pinSpacers).toBe(0);

    const trackStyle = await page.locator(".phuc-showcase-track").evaluate((node) => {
      const style = getComputedStyle(node);
      return { direction: style.flexDirection, transform: style.transform };
    });
    expect(trackStyle.direction).toBe("column");
    expect(trackStyle.transform).toBe("none");
  });

  test("reduced motion disables Portfolio pinning and horizontal transforms", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");

    const metrics = await documentMetrics(page);
    expect(metrics.pinSpacers).toBe(0);
    await expect(page.locator(".phuc-showcase-track")).toHaveCSS("transform", "none");
  });
});
