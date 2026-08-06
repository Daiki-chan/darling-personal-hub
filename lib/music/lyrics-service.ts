import { inferTrackAndArtist, parseSyncedLyrics } from "./format";
import type { LyricsResult, MusicTrack } from "./types";

const memoryCache = new Map<string, LyricsResult>();

export async function fetchLyrics(track: MusicTrack, signal: AbortSignal) {
  const known = memoryCache.get(track.videoId);
  if (known) return known;
  try {
    const cached = sessionStorage.getItem(`darling-lyrics:${track.videoId}`);
    if (cached) {
      const payload = JSON.parse(cached) as LyricsResult;
      memoryCache.set(track.videoId, payload);
      return payload;
    }
  } catch {
    // Session cache is an optimization only.
  }

  const inferred = inferTrackAndArtist(track.title, track.artist);
  const params = new URLSearchParams({ track_name: inferred.track, artist_name: inferred.artist });
  if (track.duration) params.set("duration", Math.round(track.duration).toString());
  const response = await fetch(`/api/music/lyrics?${params}`, { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Không thể tải lời bài hát.");
  const raw = (await response.json()) as {
    instrumental: boolean;
    plainLyrics: string | null;
    syncedLyrics: string | null;
  };
  const payload: LyricsResult = {
    instrumental: raw.instrumental,
    plainLyrics: raw.plainLyrics,
    syncedLyrics: parseSyncedLyrics(raw.syncedLyrics),
  };
  memoryCache.set(track.videoId, payload);
  try {
    sessionStorage.setItem(`darling-lyrics:${track.videoId}`, JSON.stringify(payload));
  } catch {
    // Session cache is an optimization only.
  }
  return payload;
}
