type LrcLibRecord = {
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
  const duration = Math.round(Number(params.get("duration")) || 0);

  if (!trackName || !artistName || trackName.length > 160 || artistName.length > 120) {
    return errorResponse("Thiếu thông tin hợp lệ để tìm lời bài hát.", 400);
  }

  const search = new URL(`${LRCLIB_BASE}/search`);
  search.searchParams.set("track_name", trackName);
  search.searchParams.set("artist_name", artistName);
  const requestHeaders = {
    Accept: "application/json",
    "User-Agent": "DarlingPersonalHub/2.0 (https://darling-personal-hub.vercel.app)",
  };

  try {
    const response = await fetch(search, {
      headers: requestHeaders,
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(12000),
    });
    if (response.status === 429) {
      return errorResponse("Dịch vụ lời bài hát đang giới hạn lượt gọi.", 429, {
        "Retry-After": response.headers.get("retry-after") || "60",
      });
    }
    if (!response.ok) {
      return errorResponse("Chưa tìm thấy lời cho bài hát này.", response.status === 404 ? 404 : 502);
    }

    const records = (await response.json()) as LrcLibRecord[];
    const candidates = records.filter((record) => record.syncedLyrics || record.plainLyrics || record.instrumental);
    if (duration > 0) {
      candidates.sort((a, b) => Math.abs((a.duration ?? duration) - duration) - Math.abs((b.duration ?? duration) - duration));
    }
    const nearest = candidates[0];
    if (!nearest) return errorResponse("Chưa tìm thấy lời cho bài hát này.", 404);

    return Response.json(compactRecord(nearest), {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return errorResponse("Không thể kết nối dịch vụ lời bài hát.", 504);
  }
}
