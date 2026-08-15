import { expect, test } from "@playwright/test";

test.describe("Portfolio motion details", () => {
  test("Method tabs support roving keyboard focus and update the active protocol", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForLoadState("domcontentloaded");

    const method = page.locator("#method");
    await method.scrollIntoViewIfNeeded();

    const activeTab = method.getByRole("tab", { selected: true });
    await expect(activeTab).toContainText("STRUCTURE");
    await activeTab.focus();
    await activeTab.press("ArrowRight");

    const nextTab = method.getByRole("tab", { selected: true });
    await expect(nextTab).toContainText("TEST");
    await expect(nextTab).toBeFocused();
    await expect(method.getByRole("tabpanel")).toContainText("04 / TEST");
  });
});
