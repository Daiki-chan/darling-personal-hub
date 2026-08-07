import type { MusicTrack } from "./types";

export function uniqueTracks(tracks: MusicTrack[]): MusicTrack[] {
  if (!Array.isArray(tracks)) return [];
  const seen = new Set<string>();
  const result: MusicTrack[] = [];
  for (const track of tracks) {
    if (track?.videoId && !seen.has(track.videoId)) {
      seen.add(track.videoId);
      result.push(track);
    }
  }
  return result;
}

export function mergeUniqueTracks(existing: MusicTrack[], incoming: MusicTrack[]): MusicTrack[] {
  const existingClean = uniqueTracks(existing);
  const incomingClean = uniqueTracks(incoming);
  const seen = new Set(existingClean.map((t) => t.videoId));
  const result = [...existingClean];
  for (const track of incomingClean) {
    if (!seen.has(track.videoId)) {
      seen.add(track.videoId);
      result.push(track);
    }
  }
  return result;
}
