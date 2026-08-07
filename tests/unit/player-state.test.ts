import { describe, expect, it } from "vitest";
import { initialState, musicPlayerReducer } from "@/lib/music/player-state";
import type { MusicTrack } from "@/lib/music/types";

const mockTrack1: MusicTrack = {
  videoId: "vid1",
  title: "Track 1",
  artist: "Artist 1",
  channelTitle: "Artist 1",
  duration: 200,
  thumbnail: "https://example.com/1.jpg",
};

const mockTrack2: MusicTrack = {
  videoId: "vid2",
  title: "Track 2",
  artist: "Artist 2",
  channelTitle: "Artist 2",
  duration: 180,
  thumbnail: "https://example.com/2.jpg",
};

describe("musicPlayerReducer", () => {
  it("HYDRATE sets valid resumeSeconds when savedTime is appropriate", () => {
    const savedState = {
      autoRadioEnabled: true,
      currentTrack: mockTrack1,
      currentTime: 45,
      favorites: [],
      history: [],
      lyricMappings: {},
      lyricOffsets: {},
      playlists: [],
      queue: [mockTrack1],
      repeatMode: "off" as const,
      shuffleEnabled: false,
      updatedAt: Date.now(),
      volume: { volume: 80, previousVolume: 80, muted: false },
    };

    const hydrated = musicPlayerReducer(initialState, { type: "HYDRATE", payload: savedState });
    expect(hydrated.resumeSeconds).toBe(45);
    expect(hydrated.currentTrack?.videoId).toBe("vid1");
  });

  it("HYDRATE ignores resumeSeconds if savedTime is within 5 seconds of track end", () => {
    const savedState = {
      autoRadioEnabled: true,
      currentTrack: mockTrack1,
      currentTime: 198, // duration is 200, 198 > 200 - 5
      favorites: [],
      history: [],
      lyricMappings: {},
      lyricOffsets: {},
      playlists: [],
      queue: [mockTrack1],
      repeatMode: "off" as const,
      shuffleEnabled: false,
      updatedAt: Date.now(),
      volume: { volume: 80, previousVolume: 80, muted: false },
    };

    const hydrated = musicPlayerReducer(initialState, { type: "HYDRATE", payload: savedState });
    expect(hydrated.resumeSeconds).toBeNull();
  });

  it("REMOVE_TRACK_AND_ADVANCE advances track cleanly when current track is removed", () => {
    const stateWithQueue = {
      ...initialState,
      currentTrack: mockTrack1,
      queue: [mockTrack1, mockTrack2],
      isPlaying: true,
    };

    const nextState = musicPlayerReducer(stateWithQueue, {
      type: "REMOVE_TRACK_AND_ADVANCE",
      videoId: "vid1",
    });

    expect(nextState.queue).toHaveLength(1);
    expect(nextState.currentTrack?.videoId).toBe("vid2");
    expect(nextState.isPlaying).toBe(true);
  });

  it("SHUTDOWN_PLAYER resets state and increments shutdownGeneration", () => {
    const stateActive = {
      ...initialState,
      currentTrack: mockTrack1,
      queue: [mockTrack1, mockTrack2],
      isPlaying: true,
      expanded: true,
      shutdownGeneration: 1,
    };

    const shutdownState = musicPlayerReducer(stateActive, { type: "SHUTDOWN_PLAYER" });

    expect(shutdownState.isShutdown).toBe(true);
    expect(shutdownState.currentTrack).toBeNull();
    expect(shutdownState.queue).toHaveLength(0);
    expect(shutdownState.isPlaying).toBe(false);
    expect(shutdownState.expanded).toBe(false);
    expect(shutdownState.shutdownGeneration).toBe(2);
  });
});
