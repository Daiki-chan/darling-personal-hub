import { rankMusicTracks } from "@/lib/music/ranking";
import type { MusicTrack } from "@/lib/music/types";
import { trendingYouTubeMusic, YouTubeUpstreamError } from "@/lib/music/youtube-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let staleItems: MusicTrack[] = [];
let staleAt = 0;

export async function GET() {
  try {
    const candidates = await trendingYouTubeMusic();
    const items = rankMusicTracks(candidates)
      .filter((track) => track.liveBroadcastContent !== "live" && (track.duration ?? 0) <= 1200)
      .slice(0, 18)
      .map((track) => ({ ...track, source: "trending" as const }));
    staleItems = items;
    staleAt = Date.now();
    return Response.json(
      { items, cachedAt: staleAt, region: "VN" },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
    );
  } catch (error) {
    if (staleItems.length) {
      return Response.json(
        { items: staleItems, cachedAt: staleAt, region: "VN", stale: true },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=1800" } },
      );
    }
    const status = error instanceof YouTubeUpstreamError ? error.status : 502;
    const message = error instanceof Error ? error.message : "Không thể tải nhạc thịnh hành.";
    return Response.json({ error: message }, { status });
  }
}
