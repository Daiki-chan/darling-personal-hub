import { normalizeLyricsRecord, scoreLyricsCandidate } from "@/lib/music/lyrics";
import { normalizeChannelArtist, normalizeTrackLabel } from "@/lib/music/metadata";
import type { LyricsRecord } from "@/lib/music/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LRCLIB_BASE = "https://lrclib.net/api";
const REQUEST_HEADERS = {
  Accept: "application/json",
  "User-Agent": "DarlingPersonalHub/3.0 (https://darling-personal-hub.vercel.app)",
};

class LrcLibError extends Error {
  constructor(public status: number, message: string, public retryAfter?: string) {
    super(message);
  }
}

async function requestLrcLib(url: URL) {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(12000),
  });
  if (response.status === 404) return null;
  if (response.status === 429) {
    throw new LrcLibError(429, "Dịch vụ lời bài hát đang giới hạn lượt gọi.", response.headers.get("retry-after") || "60");
  }
  if (!response.ok) throw new LrcLibError(502, "LRCLIB từ chối yêu cầu.");
  return response.json() as Promise<unknown>;
}

function recordsFrom(value: unknown) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.map(normalizeLyricsRecord).filter((record): record is LyricsRecord => Boolean(record));
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const track = normalizeTrackLabel(params.get("track_name")?.trim() ?? "");
  const artist = normalizeChannelArtist(params.get("artist_name")?.trim() ?? "");
  const album = normalizeTrackLabel(params.get("album_name")?.trim() ?? "");
  const durationValue = Number(params.get("duration"));
  const duration = Number.isFinite(durationValue) && durationValue > 0 ? Math.round(durationValue) : 0;
  const manual = params.get("manual") === "1";
  const query = normalizeTrackLabel(params.get("q")?.trim() ?? "");

  if ((!track && !query) || (!artist && !manual) || track.length > 160 || artist.length > 120) {
    return Response.json({ error: "Thiếu metadata hợp lệ để tìm lời bài hát." }, { status: 400 });
  }

  try {
    const collected = new Map<number, LyricsRecord>();

    if (!manual && album && duration) {
      const exactUrl = new URL(`${LRCLIB_BASE}/get`);
      exactUrl.searchParams.set("track_name", track);
      exactUrl.searchParams.set("artist_name", artist);
      exactUrl.searchParams.set("album_name", album);
      exactUrl.searchParams.set("duration", String(duration));
      for (const record of recordsFrom(await requestLrcLib(exactUrl))) collected.set(record.id, record);
    }

    if (track) {
      const fieldSearch = new URL(`${LRCLIB_BASE}/search`);
      fieldSearch.searchParams.set("track_name", track);
      if (artist) fieldSearch.searchParams.set("artist_name", artist);
      if (album) fieldSearch.searchParams.set("album_name", album);
      for (const record of recordsFrom(await requestLrcLib(fieldSearch))) collected.set(record.id, record);
    }

    const hasReliableCandidate = () => [...collected.values()].some((record) => (
      scoreLyricsCandidate(record, { track: track || query, artist, album, duration }).score >= 42
    ));

    if (track && (manual || !hasReliableCandidate())) {
      const trackOnlySearch = new URL(`${LRCLIB_BASE}/search`);
      trackOnlySearch.searchParams.set("track_name", track);
      for (const record of recordsFrom(await requestLrcLib(trackOnlySearch))) collected.set(record.id, record);
    }

    const broadQuery = query || `${track} ${artist}`.trim();
    if (broadQuery && (manual || !hasReliableCandidate())) {
      const broadSearch = new URL(`${LRCLIB_BASE}/search`);
      broadSearch.searchParams.set("q", broadQuery);
      for (const record of recordsFrom(await requestLrcLib(broadSearch))) collected.set(record.id, record);
    }

    const candidates = [...collected.values()]
      .map((record) => scoreLyricsCandidate(record, { track: track || query, artist, album, duration }))
      .sort((left, right) => right.score - left.score || Math.abs(left.duration - duration) - Math.abs(right.duration - duration));
    const selected = candidates.find((candidate) => candidate.score >= 42) ?? null;

    if (!selected && !manual) {
      return Response.json({ error: "Chưa tìm thấy lời phù hợp." }, {
        status: 404,
        headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
      });
    }

    return Response.json(
      { selected, candidates: candidates.slice(0, manual ? 20 : 6) },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (error) {
    if (error instanceof LrcLibError) {
      return Response.json({ error: error.message }, {
        status: error.status,
        headers: error.retryAfter ? { "Retry-After": error.retryAfter } : undefined,
      });
    }
    return Response.json({ error: "Không thể kết nối dịch vụ lời bài hát." }, { status: 504 });
  }
}
