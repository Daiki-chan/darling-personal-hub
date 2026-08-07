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
  return result;
}

export function insertTrackNext(
  queue: MusicTrack[],
  currentVideoId: string | null,
  track: MusicTrack,
): MusicTrack[] {
  if (!track || !track.videoId) return queue;
  if (track.videoId === currentVideoId) {
    return queue;
  }

  const cleanQueue = queue.filter((item) => item.videoId !== track.videoId);
  if (!currentVideoId) {
    return [track, ...cleanQueue];
  }

  const currentIndex = cleanQueue.findIndex((item) => item.videoId === currentVideoId);
  if (currentIndex === -1) {
    return [track, ...cleanQueue];
  }

  const result = [...cleanQueue];
  result.splice(currentIndex + 1, 0, track);
  return result;
}

export function insertPlayNextTrack(
  queue: MusicTrack[],
  currentTrack: MusicTrack | null,
  trackToInsert: MusicTrack,
): { nextQueue: MusicTrack[]; alreadyExisted: boolean } {
  const targetId = getTrackIdentity(trackToInsert);
  const alreadyExisted = queue.some((item) => getTrackIdentity(item) === targetId);
  const currentId = currentTrack ? getTrackIdentity(currentTrack) : null;
  const nextQueue = insertTrackNext(queue, currentId, trackToInsert);

  return {
    nextQueue,
    alreadyExisted,
  };
}
