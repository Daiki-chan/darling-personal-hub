type LrcLibRecord = {
  albumName?: string;
  artistName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
  trackName?: string;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LRCLIB_BASE = "https://lrclib.net/api";

function errorResponse(message: string, status: number, headers?: HeadersInit) {
  return Response.json({ error: message }, { status, headers });
}

function compactRecord(record: LrcLibRecord) {
  return {
    instrumental: Boolean(record.instrumental),
    plainLyrics: record.plainLyrics ?? null,
    syncedLyrics: record.syncedLyrics ?? null,
  };
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const trackName = params.get("track_name")?.trim() ?? "";
  const artistName = params.get("artist_name")?.trim() ?? "";
  const albumName = params.get("album_name")?.trim() ?? "";
  const duration = Math.round(Number(params.get("duration")) || 0);

  if (!trackName || !artistName || !albumName || duration <= 0) {
    return errorResponse("Thiếu thông tin để tìm lời bài hát.", 400);
  }

  const exact = new URL(`${LRCLIB_BASE}/get`);
  exact.searchParams.set("track_name", trackName);
  exact.searchParams.set("artist_name", artistName);
  exact.searchParams.set("album_name", albumName);
  exact.searchParams.set("duration", duration.toString());

  const requestHeaders = {
    Accept: "application/json",
    "User-Agent": "DarlingPersonalHub/1.0 (https://darling-personal-hub.vercel.app)",
  };

  try {
    const exactResponse = await fetch(exact, {
      headers: requestHeaders,
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(12000),
    });

    if (exactResponse.status === 429) {
      const retryAfter = exactResponse.headers.get("retry-after") || "60";
      return errorResponse("Dịch vụ lời bài hát đang giới hạn lượt gọi.", 429, {
        "Retry-After": retryAfter,
      });
    }

    if (exactResponse.ok) {
      return Response.json(compactRecord((await exactResponse.json()) as LrcLibRecord), {
        headers: { "Cache-Control": "public, s-maxage=86400" },
      });
    }

    if (exactResponse.status !== 404) {
      return errorResponse("Dịch vụ lời bài hát đang bận.", 502);
    }

    const search = new URL(`${LRCLIB_BASE}/search`);
    search.searchParams.set("track_name", trackName);
    search.searchParams.set("artist_name", artistName);
    const searchResponse = await fetch(search, {
      headers: requestHeaders,
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(12000),
    });

    if (!searchResponse.ok) {
      return errorResponse("Chưa tìm thấy lời cho bài hát này.", 404);
    }

    const records = (await searchResponse.json()) as LrcLibRecord[];
    const nearest = records
      .filter((record) => record.syncedLyrics || record.plainLyrics || record.instrumental)
      .sort((a, b) => Math.abs((a.duration ?? 0) - duration) - Math.abs((b.duration ?? 0) - duration))[0];

    if (!nearest) {
      return errorResponse("Chưa tìm thấy lời cho bài hát này.", 404);
    }

    return Response.json(compactRecord(nearest), {
      headers: { "Cache-Control": "public, s-maxage=86400" },
    });
  } catch {
    return errorResponse("Không thể kết nối dịch vụ lời bài hát.", 504);
  }
}
