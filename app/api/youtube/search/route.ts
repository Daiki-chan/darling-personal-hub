export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: {
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
};

type VideoItem = {
  id?: string;
  contentDetails?: { duration?: string };
  status?: { embeddable?: boolean; privacyStatus?: string };
};

function parseIsoDuration(value: string | undefined) {
  if (!value) return 0;
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

function decodeHtml(value: string) {
  const named: Record<string, string> = {
    "&amp;": "&",
    "&apos;": "'",
    "&#39;": "'",
    "&quot;": "\"",
    "&lt;": "<",
    "&gt;": ">",
  };
  return value
    .replace(/&(amp|apos|quot|lt|gt);|&#39;/g, (entity) => named[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  const pageToken = params.get("pageToken")?.trim() ?? "";
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (query.length < 2 || query.length > 100) {
    return errorResponse("Từ khóa cần có từ 2 đến 100 ký tự.", 400);
  }
  if (pageToken && !/^[A-Za-z0-9_-]{1,180}$/.test(pageToken)) {
    return errorResponse("Mã phân trang không hợp lệ.", 400);
  }
  if (!apiKey) {
    return errorResponse("YOUTUBE_API_KEY chưa được cấu hình trên server.", 503);
  }

  try {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoCategoryId", "10");
    searchUrl.searchParams.set("maxResults", "12");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("key", apiKey);
    if (pageToken) searchUrl.searchParams.set("pageToken", pageToken);

    const searchResponse = await fetch(searchUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!searchResponse.ok) {
      return errorResponse("YouTube Data API từ chối yêu cầu tìm kiếm.", searchResponse.status === 403 ? 429 : 502);
    }

    const searchPayload = (await searchResponse.json()) as {
      items?: SearchItem[];
      nextPageToken?: string;
    };
    const searchItems = (searchPayload.items ?? []).filter((item) => item.id?.videoId && item.snippet?.title);
    const ids = searchItems.map((item) => item.id?.videoId).filter((id): id is string => Boolean(id));
    const details = new Map<string, VideoItem>();

    if (ids.length) {
      const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      detailsUrl.searchParams.set("part", "contentDetails,status");
      detailsUrl.searchParams.set("id", ids.join(","));
      detailsUrl.searchParams.set("key", apiKey);
      const detailsResponse = await fetch(detailsUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (detailsResponse.ok) {
        const payload = (await detailsResponse.json()) as { items?: VideoItem[] };
        for (const item of payload.items ?? []) if (item.id) details.set(item.id, item);
      }
    }

    const items = searchItems.flatMap((item) => {
      const videoId = item.id?.videoId as string;
      const snippet = item.snippet as NonNullable<SearchItem["snippet"]>;
      const detail = details.get(videoId);
      if (detail?.status?.embeddable === false || detail?.status?.privacyStatus === "private") return [];
      return [{
        videoId,
        title: decodeHtml(snippet.title as string),
        artist: decodeHtml(snippet.channelTitle || "YouTube Music"),
        channelTitle: decodeHtml(snippet.channelTitle || "YouTube Music"),
        duration: parseIsoDuration(detail?.contentDetails?.duration),
        publishedAt: snippet.publishedAt,
        thumbnail:
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      }];
    });

    return Response.json(
      { items, nextPageToken: searchPayload.nextPageToken ?? null },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    return errorResponse("Không thể kết nối YouTube Data API.", 502);
  }
}
