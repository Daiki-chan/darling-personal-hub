import { extractVideoId, getPipedApiBases, type PipedSearchResponse } from "@/lib/piped";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < 2 || query.length > 100) {
    return errorResponse("Từ khóa cần có từ 2 đến 100 ký tự.", 400);
  }

  for (const base of getPipedApiBases()) {
    const endpoint = new URL(`${base}/search`);
    endpoint.searchParams.set("q", query);
    endpoint.searchParams.set("filter", "music_songs");

    try {
      const upstream = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
          "User-Agent": "DarlingPersonalHub/1.0",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });

      if (!upstream.ok) {
        continue;
      }

      const payload = (await upstream.json()) as PipedSearchResponse;
      const items = (payload.items ?? [])
        .map((item) => {
          const videoId = extractVideoId(item.url);
          if (!videoId || !item.title) {
            return null;
          }

          return {
            videoId,
            title: item.title,
            artist: item.uploaderName || "YouTube Music",
            duration: Math.max(0, Number(item.duration) || 0),
            thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .slice(0, 8);

      return Response.json(
        { items },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        },
      );
    } catch {
      continue;
    }
  }

  return errorResponse("Không thể kết nối nguồn tìm kiếm nhạc.", 502);
}
