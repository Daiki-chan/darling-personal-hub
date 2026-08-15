import { expect, test } from "@playwright/test";
import { mockTrendingMusic, openHydratedMusic } from "./music-fixtures";

const searchResult = (title: string, videoId: string) => ({
  items: [
    {
      artist: "Search Artist",
      channelTitle: "Search Channel",
      duration: 201,
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      title,
      videoId,
    },
  ],
  nextPageToken: null,
});

test.describe("Music search request control", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.clear());
    await mockTrendingMusic(page);
  });

  test("explicit submit performs one request without a trailing debounce", async ({ page }) => {
    let requestCount = 0;
    await page.route(/\/api\/youtube\/search/, (route) => {
      requestCount += 1;
      return route.fulfill({
        body: JSON.stringify(searchResult("Explicit Search Result", "explicit-result")),
        contentType: "application/json",
        status: 200,
      });
    });

    await openHydratedMusic(page);
    const search = page.getByRole("search");
    await search.getByRole("searchbox").fill("lofi chill");
    await search.getByRole("searchbox").press("Enter");

    await expect(page.getByText("Explicit Search Result")).toBeVisible();
    await page.waitForTimeout(800);
    expect(requestCount).toBe(1);
  });

  test("typing a query performs one debounced request", async ({ page }) => {
    let requestCount = 0;
    await page.route(/\/api\/youtube\/search/, (route) => {
      requestCount += 1;
      return route.fulfill({
        body: JSON.stringify(searchResult("Debounced Search Result", "debounced-result")),
        contentType: "application/json",
        status: 200,
      });
    });

    await openHydratedMusic(page);
    await page.getByRole("searchbox").fill("city pop");

    await expect(page.getByText("Debounced Search Result")).toBeVisible();
    await page.waitForTimeout(800);
    expect(requestCount).toBe(1);
  });

  test("a 429 response exposes the cooldown through the live alert", async ({ page }) => {
    await page.route(/\/api\/youtube\/search/, (route) =>
      route.fulfill({
        body: JSON.stringify({
          error: { code: "RATE_LIMITED", message: "Bạn thao tác hơi nhanh.", retryAfter: 6 },
        }),
        contentType: "application/json",
        headers: { "Retry-After": "6" },
        status: 429,
      })
    );

    await openHydratedMusic(page);
    const search = page.getByRole("search");
    await search.getByRole("searchbox").fill("rapid search");
    await search.getByRole("button", { name: "SEARCH" }).click();

    await expect(
      page.locator('[role="alert"]').filter({ hasText: "Thao tác quá nhanh. Thử lại sau 6s." })
    ).toBeVisible();
    await expect(search.getByRole("button", { name: "SEARCH" })).toBeDisabled();
  });
});
