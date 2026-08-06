import { describe, expect, it } from "vitest";
import { rankMusicCandidate, rankMusicTracks } from "../../lib/music/ranking";
import type { MusicTrack } from "../../lib/music/types";

const track = (overrides: Partial<MusicTrack>): MusicTrack => ({
  artist: "Adele",
  channelTitle: "Adele - Topic",
  duration: 285,
  thumbnail: "https://example.com/thumbnail.jpg",
  title: "Adele - Hello (Official Audio)",
  videoId: "official",
  ...overrides,
});

describe("official music ranking", () => {
  it("ranks Topic and official audio above covers and karaoke", () => {
    const ranked = rankMusicTracks([
      track({ videoId: "cover", channelTitle: "Fan Music", title: "Adele Hello cover karaoke" }),
      track({}),
    ], { query: "Adele Hello", targetArtist: "Adele", targetTitle: "Hello" });
    expect(ranked[0].videoId).toBe("official");
    expect(ranked[0].ranking?.signals.some((signal) => signal.label === "YouTube Topic channel")).toBe(true);
    expect(ranked[1].ranking?.signals.some((signal) => signal.points < 0)).toBe(true);
  });

  it("does not fabricate an exact artist match when no target artist was supplied", () => {
    const ranking = rankMusicCandidate(track({}), { query: "Hello", targetTitle: "Hello" });
    expect(ranking.signals.some((signal) => signal.label === "Exact track and artist match")).toBe(false);
  });

  it("penalizes current, recently played and unavailable-style results deterministically", () => {
    const ranking = rankMusicCandidate(track({ liveBroadcastContent: "live" }), {
      currentVideoId: "official",
      recentVideoIds: ["official"],
    });
    expect(ranking.signals.filter((signal) => signal.points < 0).map((signal) => signal.label)).toEqual(expect.arrayContaining([
      "Penalty: current video",
      "Penalty: recently played",
      "Penalty: live stream",
    ]));
  });
});
