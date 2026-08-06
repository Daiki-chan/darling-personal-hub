import { lyricsRecordToResult, normalizeLyricsRecord } from "./lyrics";
import { normalizeTrackMetadata } from "./metadata";
import type { LyricsCandidate, LyricsRecord, LyricsResult, MusicTrack } from "./types";

type CacheEntry = { expiresAt: number; value: LyricsResult | null };
const memoryCache = new Map<string, CacheEntry>();
const SUCCESS_TTL = 24 * 60 * 60 * 1000;
const NOT_FOUND_TTL = 30 * 60 * 1000;

function readCache(videoId: string) {
  const known = memoryCache.get(videoId);
  if (known && known.expiresAt > Date.now()) return known;
  try {
    const raw = sessionStorage.getItem(`darling-lyrics-v3:${videoId}`);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CacheEntry;
    if (!Number.isFinite(cached.expiresAt) || cached.expiresAt <= Date.now()) return null;
    memoryCache.set(videoId, cached);
    return cached;
  } catch {
    return null;
  }
}

function writeCache(videoId: string, value: LyricsResult | null) {
  const entry = { expiresAt: Date.now() + (value ? SUCCESS_TTL : NOT_FOUND_TTL), value };
  memoryCache.set(videoId, entry);
  try {
    sessionStorage.setItem(`darling-lyrics-v3:${videoId}`, JSON.stringify(entry));
  } catch {
    // Session cache is best effort only.
  }
}

export async function fetchLyrics(track: MusicTrack, signal: AbortSignal, manualRecord?: LyricsRecord) {
  if (manualRecord) return lyricsRecordToResult(manualRecord);
  const cached = readCache(track.videoId);
  if (cached) return cached.value;

  const normalized = normalizeTrackMetadata(track);
  const params = new URLSearchParams({ track_name: normalized.track, artist_name: normalized.artist });
  if (track.duration && Number.isFinite(track.duration)) params.set("duration", Math.round(track.duration).toString());
  const response = await fetch(`/api/music/lyrics?${params}`, { signal });
  if (response.status === 404) {
    writeCache(track.videoId, null);
    return null;
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || "Không thể tải lời bài hát.");
  }
  const payload = (await response.json()) as { selected?: unknown };
  const record = normalizeLyricsRecord(payload.selected);
  if (!record) {
    writeCache(track.videoId, null);
    return null;
  }
  const result = lyricsRecordToResult(record);
  writeCache(track.videoId, result);
  return result;
}

export async function searchLyricsCandidates(
  input: { track: string; artist: string; duration?: number; query?: string },
  signal: AbortSignal,
) {
  const params = new URLSearchParams({
    manual: "1",
    track_name: input.track.trim(),
    artist_name: input.artist.trim(),
  });
  if (input.duration) params.set("duration", Math.round(input.duration).toString());
  if (input.query?.trim()) params.set("q", input.query.trim());
  const response = await fetch(`/api/music/lyrics?${params}`, { signal });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || "Không thể tìm phiên bản lời khác.");
  }
  const payload = (await response.json()) as { candidates?: LyricsCandidate[] };
  return Array.isArray(payload.candidates) ? payload.candidates : [];
}

export function rememberLyricsSelection(videoId: string, record: LyricsRecord) {
  writeCache(videoId, lyricsRecordToResult(record));
}
