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
  test("Intro 1 establishes a centered aperture before Intro 2 becomes dominant", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 920 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(350);
    await page.evaluate(() => document.fonts.ready);

    await page.locator(".typo-intro-stage--01").click();
    await page.waitForTimeout(360);

    const handoff = await page.evaluate(() => {
      const intro02 = document.querySelector<HTMLElement>(".typo-intro-copy--jp");
      const slit = document.querySelector<HTMLElement>(".typo-slit-mask");
      if (!intro02 || !slit) throw new Error("Intro handoff layers are missing");

      const insetValues = getComputedStyle(slit).clipPath
        .match(/-?\d*\.?\d+%/g)
        ?.map((value) => Number.parseFloat(value)) ?? [];
      const rightInset = insetValues[1] ?? 0;
      const leftInset = insetValues.length >= 4
        ? insetValues[3]
        : insetValues[1] ?? 0;

      return {
        intro02Opacity: Number.parseFloat(getComputedStyle(intro02).opacity),
        apertureInset: rightInset,
        apertureImbalance: Math.abs(rightInset - leftInset),
      };
    });

    expect(handoff.intro02Opacity).toBeLessThan(0.15);
    expect(handoff.apertureInset).toBeGreaterThan(1);
    expect(handoff.apertureImbalance).toBeLessThan(0.5);

    await page.waitForTimeout(200);
    const crossing = await page.evaluate(() => {
      const intro01 = document.querySelector<HTMLElement>(".typo-intro-copy--en");
      const intro02 = document.querySelector<HTMLElement>(".typo-intro-copy--jp");
      if (!intro01 || !intro02) throw new Error("Intro copy is missing");

      return {
        intro01Opacity: Number.parseFloat(getComputedStyle(intro01).opacity),
        intro02Opacity: Number.parseFloat(getComputedStyle(intro02).opacity),
      };
    });

    expect(crossing.intro01Opacity).toBeLessThan(0.35);
    expect(crossing.intro02Opacity).toBeGreaterThan(0.25);

    await page.waitForTimeout(260);
    const resolution = await page.evaluate(() => {
      const intro01 = document.querySelector<HTMLElement>(".typo-intro-copy--en");
      const intro02 = document.querySelector<HTMLElement>(".typo-intro-copy--jp");
      if (!intro01 || !intro02) throw new Error("Intro copy is missing");

      return {
        intro01Opacity: Number.parseFloat(getComputedStyle(intro01).opacity),
        intro02Opacity: Number.parseFloat(getComputedStyle(intro02).opacity),
      };
    });

    expect(resolution.intro01Opacity).toBeLessThan(0.45);
    expect(resolution.intro02Opacity).toBeGreaterThan(0.55);
  });

  test("first-visit portal leaves every destination hit-testable after its entrance settles", async ({ page }) => {
    await page.setViewportSize({ width: 1914, height: 858 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const portal = page.locator(".typo-portal-root");
    await expect(portal).toHaveAttribute("data-step", "0");
    await page.waitForTimeout(350);

    await page.locator(".typo-intro-stage--01").click();
    await expect(portal).toHaveAttribute("data-step", "1");
    await page.locator(".typo-intro-stage--02").click();
    await expect(portal).toHaveAttribute("data-step", "2");
    await page.waitForTimeout(800);

    const hitTargets = await page.locator(".dest-word").evaluateAll((buttons) =>
      buttons.map((button) => {
        const glyphs = button.querySelector<HTMLElement>(".dest-word__glyphs");
        if (!glyphs) throw new Error("Destination glyphs are missing");

        const rect = glyphs.getBoundingClientRect();
        const hitTarget = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );

        return {
          destination: button.getAttribute("data-dest-id"),
          hitDestination: hitTarget
            ?.closest("[data-dest-id]")
            ?.getAttribute("data-dest-id") ?? null,
        };
      })
    );

    expect(hitTargets).toEqual([
      { destination: "memories", hitDestination: "memories" },
      { destination: "music", hitDestination: "music" },
      { destination: "work", hitDestination: "work" },
    ]);
  });

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
