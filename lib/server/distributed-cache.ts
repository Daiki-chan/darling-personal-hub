import "server-only";
import { createHash } from "node:crypto";
import { getRedisClient } from "./redis";

export const CURRENT_SEARCH_CACHE_VERSION = "yt-search-v1";
export const CURRENT_RADIO_CACHE_VERSION = "yt-radio-v1";

type InFlightMap = Map<string, Promise<unknown>>;
const inFlightMap: InFlightMap = new Map();

// Local memory cache fallback
type CacheEntry<T> = { data: T; expiresAt: number };
const memoryCache = new Map<string, CacheEntry<unknown>>();

function getCacheNamespace(): string {
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
  const rawBranch = process.env.VERCEL_GIT_COMMIT_REF?.trim() || "main";
  const normalizedBranch = rawBranch.toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 30);
  return env === "preview" ? `darling:preview:${normalizedBranch}:cache` : `darling:${env}:cache`;
}

export function buildSearchCacheKey(query: string, pageToken: string | null, maxResults = 18): string {
  const payload = {
    version: CURRENT_SEARCH_CACHE_VERSION,
    query: query.trim().toLowerCase(),
    pageToken: pageToken?.trim() || null,
    maxResults,
  };
  const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  return `${getCacheNamespace()}:search:${hash}`;
}

export function buildRadioCacheKey(
  videoId: string,
  artist: string,
  title: string,
  exclude: string[],
): string {
  const sortedExclude = [...new Set(exclude.map((item) => item.trim()))].sort();
  const payload = {
    version: CURRENT_RADIO_CACHE_VERSION,
    videoId: videoId.trim(),
    artist: artist.trim().toLowerCase(),
    title: title.trim().toLowerCase(),
    exclude: sortedExclude,
  };
  const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  return `${getCacheNamespace()}:radio:${hash}`;
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const data = await redis.get<T>(key);
      if (data !== null && data !== undefined) return data;
    } catch (error) {
      console.error("[Redis Cache Get Error]", error);
    }
  }

  // Memory fallback
  const entry = memoryCache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data as T;
  }
  if (entry) {
    memoryCache.delete(key);
  }

  return null;
}

export async function setCachedData<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  if (!data) return;

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
    } catch (error) {
      console.error("[Redis Cache Set Error]", error);
    }
  }

  // Memory fallback
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function fetchWithSingleFlight<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const existingPromise = inFlightMap.get(key);
  if (existingPromise) {
    return existingPromise as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    inFlightMap.delete(key);
  });

  inFlightMap.set(key, promise);
  return promise;
}
