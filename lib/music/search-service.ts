import type { SearchResponse } from "./types";

const memoryCache = new Map<string, SearchResponse>();

export async function searchYouTubeMusic(query: string, pageToken: string | null, signal: AbortSignal) {
  const key = `${query.trim().toLocaleLowerCase("vi")}::${pageToken ?? "first"}`;
  const inMemory = memoryCache.get(key);
  if (inMemory) return inMemory;
  try {
    const cached = sessionStorage.getItem(`darling-search:${key}`);
    if (cached) {
      const payload = JSON.parse(cached) as SearchResponse;
      memoryCache.set(key, payload);
      return payload;
    }
  } catch {
    // Session cache is an optimization only.
  }

  const params = new URLSearchParams({ q: query.trim() });
  if (pageToken) params.set("pageToken", pageToken);
  const response = await fetch(`/api/youtube/search?${params}`, { signal });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || "Không thể tải kết quả tìm kiếm.");
  }
  const payload = (await response.json()) as SearchResponse;
  memoryCache.set(key, payload);
  try {
    sessionStorage.setItem(`darling-search:${key}`, JSON.stringify(payload));
  } catch {
    // Session cache is an optimization only.
  }
  return payload;
}
