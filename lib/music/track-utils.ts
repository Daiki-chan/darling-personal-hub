import type { MusicTrack } from "./types";

export function getTrackIdentity(track: MusicTrack): string {
  return track.videoId;
}

export function uniqueTracks(tracks: MusicTrack[]): MusicTrack[] {
  if (!Array.isArray(tracks)) return [];
  const seen = new Set<string>();
  const result: MusicTrack[] = [];
  for (const track of tracks) {
    const key = track ? getTrackIdentity(track) : null;
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(track);
    }
  }
  return result;
}

export function mergeUniqueTracks(existing: MusicTrack[], incoming: MusicTrack[]): MusicTrack[] {
  const existingClean = uniqueTracks(existing);
  const incomingClean = uniqueTracks(incoming);
  const seen = new Set(existingClean.map((t) => getTrackIdentity(t)));
  const result = [...existingClean];
  for (const track of incomingClean) {
    const key = getTrackIdentity(track);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(track);
    }
  }
  return result.slice(0, 30);
}

export function insertPlayNextTrack(
  queue: MusicTrack[],
  currentTrack: MusicTrack | null,
  trackToInsert: MusicTrack,
): { nextQueue: MusicTrack[]; alreadyExisted: boolean } {
  const targetId = getTrackIdentity(trackToInsert);
  const alreadyExisted = queue.some((item) => getTrackIdentity(item) === targetId);
  const cleanedQueue = queue.filter((item) => getTrackIdentity(item) !== targetId);

  if (!currentTrack) {
    return {
      nextQueue: [trackToInsert, ...cleanedQueue].slice(0, 30),
      alreadyExisted,
    };
  }

  const currentId = getTrackIdentity(currentTrack);
  const currentIndex = cleanedQueue.findIndex((item) => getTrackIdentity(item) === currentId);

  if (currentIndex === -1) {
    return {
      nextQueue: [currentTrack, trackToInsert, ...cleanedQueue].slice(0, 30),
      alreadyExisted,
    };
  }

  const result = [...cleanedQueue];
  result.splice(currentIndex + 1, 0, trackToInsert);
  return {
    nextQueue: result.slice(0, 30),
    alreadyExisted,
  };
}
