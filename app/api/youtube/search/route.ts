import { inferMusicMetadata } from "@/lib/music/metadata";
import { rankMusicTracks } from "@/lib/music/ranking";
import { searchYouTubeCandidates, YouTubeUpstreamError } from "@/lib/music/youtube-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  const pageToken = params.get("pageToken")?.trim() ?? "";

  if (query.length < 2 || query.length > 100) {
    return errorResponse("Từ khóa cần có từ 2 đến 100 ký tự.", 400);
  }
  if (pageToken && !/^[A-Za-z0-9_-]{1,180}$/.test(pageToken)) {
    return errorResponse("Mã phân trang không hợp lệ.", 400);
  }

  try {
    const payload = await searchYouTubeCandidates(query, { pageToken, maxResults: 18, revalidate: 300 });
    const target = inferMusicMetadata(query, "");
    const items = rankMusicTracks(payload.items, {
      query,
      targetArtist: target.artist,
      targetTitle: target.track,
    }).slice(0, 12).map((track) => ({ ...track, source: "search" as const }));

    return Response.json(
      { items, nextPageToken: payload.nextPageToken },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    if (error instanceof YouTubeUpstreamError) return errorResponse(error.message, error.status);
    return errorResponse("Không thể kết nối YouTube Data API.", 502);
  }
}
