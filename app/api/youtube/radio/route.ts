import { rankMusicTracks } from "@/lib/music/ranking";
import { searchYouTubeCandidates, YouTubeUpstreamError } from "@/lib/music/youtube-server";
import { buildRateLimitHeaders, checkRateLimit } from "@/lib/server/rate-limit";
import {
  buildRadioCacheKey,
  fetchWithSingleFlight,
  getCachedData,
  setCachedData,
} from "@/lib/server/distributed-cache";
import type { RadioResponse } from "@/lib/music/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clean(value: string | null, max: number) {
  return (value ?? "").trim().slice(0, max);
}

function errorResponse(message: string, status: number, headers?: Record<string, string>) {
  return Response.json({ error: message }, { status, headers });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const videoId = clean(params.get("videoId"), 24);
  const title = clean(params.get("title"), 160);
  const artist = clean(params.get("artist"), 120);
  const channel = clean(params.get("channel"), 120);
  const exclude = clean(params.get("exclude"), 600).split(",").filter(Boolean).slice(0, 30);

  if (!videoId || !title || !artist) {
    return errorResponse("Thiếu metadata để tạo Auto Radio.", 400);
  }

  // 1. Rate Limit Check
  const rlResult = await checkRateLimit(request, { type: "radio" });
  const rlHeaders = buildRateLimitHeaders(rlResult);

  if (!rlResult.success) {
    return errorResponse(
      "Bạn thao tác hơi nhanh. Vui lòng thử lại sau ít giây.",
      429,
      rlHeaders,
    );
  }

  // 2. Cache Lookup
  const cacheKey = buildRadioCacheKey(videoId, artist, title, exclude);
  const cached = await getCachedData<RadioResponse>(cacheKey);
  if (cached) {
    return Response.json(cached, { headers: rlHeaders });
  }

  // 3. Single-Flight & Upstream Search
  const queries = [
    `${artist} official audio`,
    `${artist} Topic`,
    `${artist} songs`,
  ];

  try {
    const result = await fetchWithSingleFlight(cacheKey, async () => {
      const payloads = await Promise.all(
        queries.map((query) => searchYouTubeCandidates(query, { maxResults: 8 })),
      );
      const seen = new Set<string>();
      const candidates = payloads.flatMap((payload) => payload.items).filter((track) => {
        if (seen.has(track.videoId)) return false;
        seen.add(track.videoId);
        return true;
      });
      const items = rankMusicTracks(candidates, {
        currentVideoId: videoId,
        query: `${artist} ${title}`,
        recentVideoIds: exclude,
        targetArtist: artist || channel,
      })
        .filter((track) => (track.ranking?.score ?? -100) >= 8)
        .slice(0, 12)
        .map((track) => ({ ...track, source: "auto-radio" as const }));

      return { items, cachedAt: Date.now() };
    });

    // Write to Redis cache (TTL 30 min = 1800 seconds)
    await setCachedData(cacheKey, result, 1800);

    return Response.json(result, { headers: rlHeaders });
  } catch (error) {
    const status = error instanceof YouTubeUpstreamError ? error.status : 502;
    return errorResponse("Không thể tạo danh sách Auto Radio.", status, rlHeaders);
  }
}
