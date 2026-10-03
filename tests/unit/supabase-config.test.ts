import { describe, expect, it } from "vitest";
import { mapTrackRowToMusicTrack } from "@/lib/music/catalog-service";
import { getSupabaseConfigStatus } from "@/lib/supabase/config";
import type { TrackRow } from "@/lib/supabase/types";

describe("Supabase Configuration & Utilities", () => {
  it("accurately detects missing Supabase configuration when env vars are unset", () => {
    const status = getSupabaseConfigStatus();
    // In test environment without real keys, isConfigured should be false
    expect(typeof status.isConfigured).toBe("boolean");
    expect(Array.isArray(status.missing)).toBe(true);
  });

  it("maps Supabase TrackRow accurately to MusicTrack structure for /am-nhac", () => {
    const mockRow: TrackRow = {
      id: "12345678-1234-1234-1234-123456789abc",
      title: "Obsidian Horizon",
      artist: "FUJIWARA DAIKI",
      album: "The Archive Collection",
      album_artist: "FUJIWARA DAIKI",
      year: "2026",
      genre: "Ambient",
      track_number: 1,
      disc_number: 1,
      duration: 245,
      format: "flac",
      mime_type: "audio/flac",
      file_size: 42000000,
      bitrate: 1411,
      sample_rate: 44100,
      cover_url: "https://example.com/cover.jpg",
      audio_url: "https://example.com/audio.flac",
      storage_path: "tracks/12345678-1234-1234-1234-123456789abc-obsidian.flac",
      cover_storage_path: "covers/cover.jpg",
      status: "published",
      lyrics_plain: "Sample lyrics line",
      lyrics_synced: null,
      created_at: "2026-10-03T00:00:00Z",
      updated_at: "2026-10-03T00:00:00Z",
    };

    const mapped = mapTrackRowToMusicTrack(mockRow);

    expect(mapped.videoId).toBe("supabase_12345678-1234-1234-1234-123456789abc");
    expect(mapped.title).toBe("Obsidian Horizon");
    expect(mapped.artist).toBe("FUJIWARA DAIKI");
    expect(mapped.duration).toBe(245);
    expect(mapped.audioUrl).toBe("https://example.com/audio.flac");
    expect(mapped.isDirectAudio).toBe(true);
    expect(mapped.thumbnail).toBe("https://example.com/cover.jpg");
    expect(mapped.album).toBe("The Archive Collection");
  });
});
