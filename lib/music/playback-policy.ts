import type { MusicHistoryEntry, MusicTrack, RepeatMode } from "./types";

export type PlaybackContinuation =
  | { kind: "track"; queue?: MusicTrack[]; track: MusicTrack }
  | { kind: "restart" }
  | { kind: "radio" }
  | { kind: "stop" };

type PlaybackPolicyInput = {
  autoRadioEnabled: boolean;
  currentTrack: MusicTrack;
  fromEnded: boolean;
  history: MusicHistoryEntry[];
  queue: MusicTrack[];
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  unavailableVideoIds: Iterable<string>;
};

function uniqueTracks(tracks: MusicTrack[]) {
  return tracks.filter((track, index, list) => list.findIndex((item) => item.videoId === track.videoId) === index);
}

export function planPlaybackContinuation(
  input: PlaybackPolicyInput,
  random: () => number = Math.random,
): PlaybackContinuation {
  const unavailable = new Set(input.unavailableVideoIds);
  const available = input.queue.filter((track) => !unavailable.has(track.videoId));
  const currentIndex = input.queue.findIndex((track) => track.videoId === input.currentTrack.videoId);

  if (input.shuffleEnabled && available.length > 1) {
    const alternatives = available.filter((track) => track.videoId !== input.currentTrack.videoId);
    const randomIndex = Math.min(alternatives.length - 1, Math.floor(Math.max(0, random()) * alternatives.length));
    const shuffled = alternatives[randomIndex];
    if (shuffled) return { kind: "track", track: shuffled };
  } else {
    const queued = input.queue.slice(currentIndex + 1).find((track) => !unavailable.has(track.videoId));
    if (queued) return { kind: "track", track: queued };
  }

  if (input.fromEnded && input.repeatMode === "one") return { kind: "restart" };

  if (input.repeatMode === "all") {
    const rebuilt = uniqueTracks([
      ...input.queue,
      ...[...input.history].reverse().map((entry) => {
        const track: Partial<MusicHistoryEntry> = { ...entry };
        delete track.playedAt;
        return track as MusicTrack;
      }),
    ]).filter((track) => !unavailable.has(track.videoId));
    const loopTrack = rebuilt.find((track) => track.videoId !== input.currentTrack.videoId) ?? rebuilt[0];
    if (loopTrack) return { kind: "track", queue: rebuilt, track: loopTrack };
  }

  if (input.fromEnded && input.autoRadioEnabled) return { kind: "radio" };
  return { kind: "stop" };
}

export function selectAutoRadioCandidate(
  candidates: MusicTrack[],
  currentVideoId: string,
  recentVideoIds: Iterable<string>,
  unavailableVideoIds: Iterable<string>,
) {
  const recent = new Set(recentVideoIds);
  const unavailable = new Set(unavailableVideoIds);
  return candidates.find((track) => (
    track.videoId !== currentVideoId
    && !recent.has(track.videoId)
    && !unavailable.has(track.videoId)
  ));
}
