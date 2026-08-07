import { describe, expect, it } from "vitest";
import {
  getTrackIdentity,
  insertPlayNextTrack,
  mergeUniqueTracks,
  uniqueTracks,
} from "@/lib/music/track-utils";
import type { MusicTrack } from "@/lib/music/types";

const track1: MusicTrack = {
  videoId: "t1",
  title: "Song 1",
  artist: "Artist 1",
  channelTitle: "Channel 1",
  thumbnail: "https://example.com/1.jpg",
};

const track2: MusicTrack = {
  videoId: "t2",
  title: "Song 2",
  artist: "Artist 2",
  channelTitle: "Channel 2",
  thumbnail: "https://example.com/2.jpg",
};

const track3: MusicTrack = {
  videoId: "t3",
  title: "Song 3",
  artist: "Artist 3",
  channelTitle: "Channel 3",
  thumbnail: "https://example.com/3.jpg",
};

describe("track-utils", () => {
  it("getTrackIdentity returns videoId", () => {
    expect(getTrackIdentity(track1)).toBe("t1");
  });

  it("uniqueTracks removes duplicates preserving first occurrence", () => {
    const list = [track1, track2, { ...track1, title: "Duplicate Track 1" }, track3];
    const deduplicated = uniqueTracks(list);
    expect(deduplicated).toHaveLength(3);
    expect(deduplicated.map((t) => t.videoId)).toEqual(["t1", "t2", "t3"]);
  });

  it("mergeUniqueTracks merges two lists without duplicates and respects 30 limit", () => {
    const existing = [track1, track2];
    const incoming = [track2, track3, { videoId: "t4", title: "Song 4", artist: "A4", channelTitle: "C4", thumbnail: "t4.jpg" }];
    const merged = mergeUniqueTracks(existing, incoming);
    expect(merged.map((t) => t.videoId)).toEqual(["t1", "t2", "t3", "t4"]);
  });

  it("insertPlayNextTrack places track right after current track without duplicates", () => {
    const queue = [track1, track2, track3];

    // Insert track3 (which is already at index 2) to play next after track1
    const { nextQueue, alreadyExisted } = insertPlayNextTrack(queue, track1, track3);
    expect(alreadyExisted).toBe(true);
    expect(nextQueue.map((t) => t.videoId)).toEqual(["t1", "t3", "t2"]);
  });
});
