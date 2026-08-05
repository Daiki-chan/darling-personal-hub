export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
};

type VideoItem = {
  id?: string;
  contentDetails?: { duration?: string };
};

function parseIsoDuration(value: string | undefined) {
  if (!value) return 0;
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const apiKey = process.env.YOUTUBE_DATA_API_KEY?.trim();

  if (query.length < 2 || query.length > 100) {
    return errorResponse("Từ khóa cần có từ 2 đến 100 ký tự.", 400);
  }
  if (!apiKey) {
    return errorResponse("YOUTUBE_DATA_API_KEY chưa được cấu hình trên server.", 503);
  }

  try {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoCategoryId", "10");
    searchUrl.searchParams.set("maxResults", "8");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("key", apiKey);

    const searchResponse = await fetch(searchUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!searchResponse.ok) {
      return errorResponse("YouTube search request failed.", 502);
    }

    const searchPayload = (await searchResponse.json()) as { items?: SearchItem[] };
    const searchItems = (searchPayload.items ?? []).filter((item) => item.id?.videoId && item.snippet?.title);
    const ids = searchItems.map((item) => item.id?.videoId).filter((id): id is string => Boolean(id));
    const durationById = new Map<string, number>();

    if (ids.length) {
      const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      detailsUrl.searchParams.set("part", "contentDetails");
      detailsUrl.searchParams.set("id", ids.join(","));
      detailsUrl.searchParams.set("key", apiKey);
      const detailsResponse = await fetch(detailsUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (detailsResponse.ok) {
        const detailsPayload = (await detailsResponse.json()) as { items?: VideoItem[] };
        for (const item of detailsPayload.items ?? []) {
          if (item.id) durationById.set(item.id, parseIsoDuration(item.contentDetails?.duration));
        }
      }
    }

    const items = searchItems.map((item) => {
      const videoId = item.id?.videoId as string;
      const snippet = item.snippet as NonNullable<SearchItem["snippet"]>;
      return {
        videoId,
        title: snippet.title as string,
        artist: snippet.channelTitle || "YouTube Music",
        duration: durationById.get(videoId) ?? 0,
        thumbnail:
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.high?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    });

    return Response.json(
      { items },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    return errorResponse("Không thể kết nối YouTube search.", 502);
  }
}
