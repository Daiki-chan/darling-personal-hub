import { expect, type Page } from "@playwright/test";

export const MUSIC_TRACKS = Array.from({ length: 12 }, (_, index) => ({
  artist: `Test Artist ${index + 1}`,
  channelTitle: `Test Channel ${index + 1}`,
  duration: 180 + index,
  thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  title: `Test Track ${index + 1}`,
  videoId: `test-track-${index + 1}`,
}));

export async function mockTrendingMusic(page: Page) {
  await page.route(/\/api\/youtube\/trending/, (route) =>
    route.fulfill({
      body: JSON.stringify({
        cachedAt: Date.now(),
        items: MUSIC_TRACKS,
        region: "VN",
      }),
      contentType: "application/json",
      status: 200,
    })
  );
}

export async function openHydratedMusic(page: Page) {
  await page.goto("/music");
  await expect(page.getByRole("heading", { name: "MUSIC ARCHIVE" })).toBeVisible();
  await expect(page.locator("article[role='button']").first()).toBeVisible();
}
