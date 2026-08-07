import { inferMusicMetadata } from "@/lib/music/metadata";
import { rankMusicTracks } from "@/lib/music/ranking";
import { searchYouTubeCandidates, YouTubeUpstreamError } from "@/lib/music/youtube-server";
import { buildRateLimitHeaders, checkRateLimit } from "@/lib/server/rate-limit";
import {
  buildSearchCacheKey,
  fetchWithSingleFlight,
  getCachedData,
  setCachedData,
} from "@/lib/server/distributed-cache";
import type { SearchResponse } from "@/lib/music/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(message: string, status: number, headers?: Record<string, string>) {
  return Response.json({ error: message }, { status, headers });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  const pageToken = params.get("pageToken")?.trim() ?? "";

  if (query.length < 2 || query.length > 120) {
    return errorResponse("Từ khóa cần có từ 2 đến 120 ký tự.", 400);
  }
  if (pageToken && !/^[A-Za-z0-9_-]{1,180}$/.test(pageToken)) {
    return errorResponse("Mã phân trang không hợp lệ.", 400);
  }

  // 1. Rate Limit Check (Prior to cache lookup to prevent spam abuse)
  const rlResult = await checkRateLimit(request, { type: "search" });
  const rlHeaders = buildRateLimitHeaders(rlResult);

  if (!rlResult.success) {
    return errorResponse(
      "Bạn thao tác hơi nhanh. Vui lòng thử lại sau ít giây.",
      429,
      rlHeaders,
    );
  }

  // 2. Redis Cache Lookup
  const cacheKey = buildSearchCacheKey(query, pageToken || null, 18);
  const cached = await getCachedData<SearchResponse>(cacheKey);
  if (cached) {
    return Response.json(cached, { headers: rlHeaders });
  }

  // 3. Single-Flight & Upstream Fetch
  try {
    const result = await fetchWithSingleFlight(cacheKey, async () => {
      const payload = await searchYouTubeCandidates(query, { pageToken, maxResults: 18 });
      const target = inferMusicMetadata(query, "");
      const items = rankMusicTracks(payload.items, {
        query,
        targetArtist: target.artist,
        targetTitle: target.track,
      }).slice(0, 12).map((track) => ({ ...track, source: "search" as const }));

      return { items, nextPageToken: payload.nextPageToken };
    });

    // Write to Redis cache (TTL 15 min = 900 seconds)
    await setCachedData(cacheKey, result, 900);

    return Response.json(result, { headers: rlHeaders });
  } catch (error) {
    if (error instanceof YouTubeUpstreamError) {
      return errorResponse(error.message, error.status, rlHeaders);
    }
    return errorResponse("Không thể kết nối YouTube Data API.", 502, rlHeaders);
  }
}
