import { expect, test } from "@playwright/test";

test.describe("Search Rate Limit & Request Control E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.clear();
      } catch {
        // ignore
      }
    });
  });

  test("submitting search form triggers search without duplicate request", async ({ page }) => {
    let searchRequestCount = 0;

    await page.route(/\/api\/youtube\/search/, (route) => {
      searchRequestCount++;
      void route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              videoId: "test-vid-1",
              title: "Test Track 1",
              artist: "Test Artist 1",
              channelTitle: "Test Channel",
              thumbnail: "https://example.com/thumb.jpg",
              duration: 180,
            },
          ],
          nextPageToken: null,
        }),
      });
    });

    await page.goto("/am-nhac");
    const searchInput = page.locator("#music-search");
    await expect(searchInput).toBeVisible();

    await searchInput.fill("lofi chill");
    await searchInput.press("Enter");

    await expect(page.getByText("Test Track 1")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    expect(searchRequestCount).toBe(1);
  });

  test("clicking search suggestion triggers search without secondary debounced request", async ({ page }) => {
    let searchRequestCount = 0;

    await page.route(/\/api\/youtube\/search/, (route) => {
      searchRequestCount++;
      void route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              videoId: "suggestion-vid-1",
              title: "Suggestion Track 1",
              artist: "Suggestion Artist",
              channelTitle: "Channel",
              thumbnail: "https://example.com/thumb.jpg",
              duration: 200,
            },
          ],
          nextPageToken: null,
        }),
      });
    });

    await page.goto("/am-nhac");
    const suggestionBtn = page.locator('button:has-text("city pop")').first();
    await expect(suggestionBtn).toBeVisible();
    await suggestionBtn.click();

    await expect(page.getByText("Suggestion Track 1")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    expect(searchRequestCount).toBe(1);
  });

  test("handles 429 rate limit response and displays countdown timer", async ({ page }) => {
    await page.route(/\/api\/youtube\/search/, (route) => {
      void route.fulfill({
        status: 429,
        contentType: "application/json",
        headers: {
          "Retry-After": "6",
        },
        body: JSON.stringify({
          error: {
            code: "RATE_LIMITED",
            message: "Bạn thao tác hơi nhanh.",
            retryAfter: 6,
          },
        }),
      });
    });

    await page.goto("/am-nhac");
    const searchInput = page.locator("#music-search");
    await searchInput.fill("rapid search");
    await page.locator('button:has-text("Tìm nhạc")').click();

    await expect(page.getByText("Chưa thể tìm kiếm")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Bạn thao tác hơi nhanh/)).toBeVisible({ timeout: 10000 });
  });
});
