import { describe, expect, it } from "vitest";
import { findActiveLyricIndex, parseSyncedLyrics } from "../../lib/music/format";
import { scoreLyricsCandidate } from "../../lib/music/lyrics";
import type { LyricsRecord } from "../../lib/music/types";

const record = (overrides: Partial<LyricsRecord> = {}): LyricsRecord => ({
  albumName: "25",
  artistName: "Adele",
  duration: 285,
  id: 1,
  instrumental: false,
  plainLyrics: "Hello",
  syncedLyrics: "[00:01.00]Hello",
  trackName: "Hello",
  ...overrides,
});

describe("LRCLIB matching and parsing", () => {
  it("prefers matching metadata, duration and synced lyrics", () => {
    const exact = scoreLyricsCandidate(record(), { track: "Hello", artist: "Adele", album: "25", duration: 286 });
    const cover = scoreLyricsCandidate(record({ artistName: "Cover Band", duration: 240, syncedLyrics: null }), {
      track: "Hello",
      artist: "Adele",
      album: "25",
      duration: 286,
    });
    expect(exact.score).toBeGreaterThan(cover.score);
    expect(exact.signals).toContain("Thời lượng lệch không quá 2 giây");
  });

  it("handles offsets, multiple timestamps, duplicates, invalid seconds and sorting", () => {
    const lines = parseSyncedLyrics([
      "[offset:+500]",
      "[00:05.00][00:07.000]Điệp khúc",
      "[00:02.50]Mở đầu",
      "[00:02.50]Mở đầu",
      "[00:72.00]Sai",
      "[ar:Nghệ sĩ]",
    ].join("\n"));
    expect(lines).toEqual([
      { time: 3, text: "Mở đầu" },
      { time: 5.5, text: "Điệp khúc" },
      { time: 7.5, text: "Điệp khúc" },
    ]);
    expect(findActiveLyricIndex(lines, 5.6)).toBe(1);
  });

  it("keeps an instrumental result valid without lyric text", () => {
    const candidate = scoreLyricsCandidate(record({ instrumental: true, plainLyrics: null, syncedLyrics: null }), {
      track: "Hello",
      artist: "Adele",
      duration: 285,
    });
    expect(candidate.instrumental).toBe(true);
    expect(candidate.signals).toContain("Bản không lời");
  });
});
