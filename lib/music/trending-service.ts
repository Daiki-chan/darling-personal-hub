import type { TrendingResponse } from "./types";

const CACHE_KEY = "darling-trending-vn:v1";
const MAX_AGE = 30 * 60 * 1000;
let memoryCache: TrendingResponse | null = null;

function readCached() {
  if (memoryCache && Date.now() - memoryCache.cachedAt < MAX_AGE) return memoryCache;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as TrendingResponse;
    if (!Array.isArray(cached.items)) return null;
    memoryCache = cached;
    return cached;
  } catch {
    return null;
  }
}

export async function fetchTrendingMusic(signal: AbortSignal) {
  const cached = readCached();
  if (cached && Date.now() - cached.cachedAt < MAX_AGE) return cached;
  const response = await fetch("/api/youtube/trending", { signal });
  if (!response.ok) {
    if (cached) return cached;
    throw new Error("Không thể tải nhạc thịnh hành lúc này.");
  }
  const payload = (await response.json()) as TrendingResponse;
  memoryCache = payload;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Session cache is best effort only.
  }
  return payload;
}
