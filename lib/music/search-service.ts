import type { SearchResponse } from "./types";

export class SearchApiError extends Error {
  code: string;
  retryAfter?: number;
  status: number;

  constructor(message: string, status: number, code = "UNKNOWN_ERROR", retryAfter?: number) {
    super(message);
    this.name = "SearchApiError";
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

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
    const payload = (await response.json().catch(() => null)) as {
      error?: string | { code?: string; message?: string; retryAfter?: number };
    } | null;

    let message = "Không thể tải kết quả tìm kiếm.";
    let code = response.status === 429 ? "RATE_LIMITED" : "UNKNOWN_ERROR";
    let retryAfter: number | undefined;

    const retryHeader = response.headers.get("Retry-After");
    if (retryHeader) {
      const parsed = parseInt(retryHeader, 10);
      if (!isNaN(parsed) && parsed > 0) {
        retryAfter = parsed;
      }
    }

    if (typeof payload?.error === "object" && payload.error !== null) {
      if (payload.error.message) message = payload.error.message;
      if (payload.error.code) code = payload.error.code;
      if (payload.error.retryAfter && !retryAfter) retryAfter = payload.error.retryAfter;
    } else if (typeof payload?.error === "string") {
      message = payload.error;
    }

    throw new SearchApiError(message, response.status, code, retryAfter);
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
