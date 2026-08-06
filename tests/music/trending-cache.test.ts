import { afterEach, describe, expect, it, vi } from "vitest";

describe("Trending Vietnam client cache", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("reuses a fresh response without a second request", async () => {
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    });
    const payload = { cachedAt: Date.now(), items: [], region: "VN" as const };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", fetchMock);
    const { fetchTrendingMusic } = await import("../../lib/music/trending-service");
    const signal = new AbortController().signal;
    await fetchTrendingMusic(signal);
    await fetchTrendingMusic(signal);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
