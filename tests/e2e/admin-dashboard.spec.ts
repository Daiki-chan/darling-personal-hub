import { expect, test } from "@playwright/test";

test.describe("Admin Dashboard Subsystem & Authentication Protection", () => {
  test("renders admin login page with obsidian visual elements", async ({ page }) => {
    await page.goto("/admin/login");

    await expect(page.locator("h1")).toContainText("Quản trị Hệ thống");
    await expect(page.locator("input[name='email']")).toBeVisible();
    await expect(page.locator("input[name='password']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("unauthenticated access to /admin redirects to /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("h1")).toContainText("Quản trị Hệ thống");
  });

  test("unauthenticated access to /admin/music redirects to /admin/login", async ({ page }) => {
    await page.goto("/admin/music");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("h1")).toContainText("Quản trị Hệ thống");
  });

  test("unauthenticated access to /admin/music/upload redirects to /admin/login", async ({ page }) => {
    await page.goto("/admin/music/upload");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("h1")).toContainText("Quản trị Hệ thống");
  });

  test("unauthenticated access to /admin/system redirects to /admin/login", async ({ page }) => {
    await page.goto("/admin/system");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("h1")).toContainText("Quản trị Hệ thống");
  });

  test("ensures public /music continues to function properly without auth gate", async ({ page }) => {
    await page.goto("/music");

    await expect(page.locator("h1, h2").first()).toBeVisible();
    // Verify search input on public /music exists
    await expect(page.locator("input").first()).toBeVisible();
  });
});
