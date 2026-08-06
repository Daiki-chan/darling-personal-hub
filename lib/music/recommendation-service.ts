import type { MusicTrack, RadioResponse } from "./types";

const memoryCache = new Map<string, { expiresAt: number; payload: RadioResponse }>();

export async function fetchAutoRadioCandidates(
  track: MusicTrack,
  recentVideoIds: string[],
  signal: AbortSignal,
) {
  const key = `${track.videoId}:${recentVideoIds.slice(0, 20).join(",")}`;
  const known = memoryCache.get(key);
  if (known && known.expiresAt > Date.now()) return known.payload.items;

  const params = new URLSearchParams({
    videoId: track.videoId,
    title: track.title,
    artist: track.artist,
    channel: track.channelTitle,
    exclude: recentVideoIds.slice(0, 30).join(","),
  });
  const response = await fetch(`/api/youtube/radio?${params}`, { signal });
  if (!response.ok) throw new Error("Auto Radio chưa tìm được bài phù hợp.");
  const payload = (await response.json()) as RadioResponse;
  memoryCache.set(key, { expiresAt: Date.now() + 30 * 60 * 1000, payload });
  return payload.items;
}
