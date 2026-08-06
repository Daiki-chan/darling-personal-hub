import { rankMusicTracks } from "@/lib/music/ranking";
import { searchYouTubeCandidates, YouTubeUpstreamError } from "@/lib/music/youtube-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clean(value: string | null, max: number) {
  return (value ?? "").trim().slice(0, max);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const videoId = clean(params.get("videoId"), 24);
  const title = clean(params.get("title"), 160);
  const artist = clean(params.get("artist"), 120);
  const channel = clean(params.get("channel"), 120);
  const exclude = clean(params.get("exclude"), 600).split(",").filter(Boolean).slice(0, 30);
  if (!videoId || !title || !artist) {
    return Response.json({ error: "Thiếu metadata để tạo Auto Radio." }, { status: 400 });
  }

  const queries = [
    `${artist} official audio`,
    `${artist} Topic`,
    `${artist} songs`,
  ];

  try {
    const payloads = await Promise.all(
      queries.map((query) => searchYouTubeCandidates(query, { maxResults: 8, revalidate: 3600 })),
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

    return Response.json(
      { items, cachedAt: Date.now() },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
    );
  } catch (error) {
    const status = error instanceof YouTubeUpstreamError ? error.status : 502;
    return Response.json({ error: "Không thể tạo danh sách Auto Radio." }, { status });
  }
}
