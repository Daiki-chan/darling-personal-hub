import { describe, expect, it } from "vitest";
import { planPlaybackContinuation, selectAutoRadioCandidate } from "../../lib/music/playback-policy";
import type { MusicTrack } from "../../lib/music/types";

const track = (videoId: string): MusicTrack => ({
  artist: videoId,
  channelTitle: `${videoId} - Topic`,
  thumbnail: "https://example.com/thumbnail.jpg",
  title: videoId,
  videoId,
});

const current = track("current");

describe("playback continuation priority", () => {
  const base = {
    autoRadioEnabled: true,
    currentTrack: current,
    fromEnded: true,
    history: [],
    queue: [current],
    repeatMode: "off" as const,
    shuffleEnabled: false,
    unavailableVideoIds: [],
  };

  it("uses the existing queue before repeat or Auto Radio", () => {
    expect(planPlaybackContinuation({ ...base, queue: [current, track("queued")] })).toMatchObject({ kind: "track", track: { videoId: "queued" } });
  });

  it("uses repeat-one before Auto Radio only when a track ended", () => {
    expect(planPlaybackContinuation({ ...base, repeatMode: "one" })).toEqual({ kind: "restart" });
    expect(planPlaybackContinuation({ ...base, fromEnded: false, repeatMode: "one" })).toEqual({ kind: "radio" });
  });

  it("uses repeat-all before Auto Radio, then radio on natural end or manual next", () => {
    const repeated = planPlaybackContinuation({
      ...base,
      history: [{ ...track("history"), playedAt: 1 }],
      repeatMode: "all",
    });
    expect(repeated).toMatchObject({ kind: "track", track: { videoId: "history" } });
    expect(planPlaybackContinuation(base)).toEqual({ kind: "radio" });
    expect(planPlaybackContinuation({ ...base, fromEnded: false })).toEqual({ kind: "radio" });
    expect(planPlaybackContinuation({ ...base, autoRadioEnabled: false, fromEnded: false })).toEqual({ kind: "stop" });
  });

  it("excludes current, recent and unavailable radio candidates", () => {
    const selected = selectAutoRadioCandidate(
      [current, track("recent"), track("blocked"), track("fresh")],
      current.videoId,
      ["recent"],
      ["blocked"],
    );
    expect(selected?.videoId).toBe("fresh");
  });
});
