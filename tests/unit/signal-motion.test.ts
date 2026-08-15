import { describe, expect, it } from "vitest";
import { getPlayheadScale, shouldRunSignalTicker } from "@/lib/music/signal-motion";

describe("music signal motion gate", () => {
  const activeState = {
    hasTrack: true,
    inViewport: true,
    isDocumentVisible: true,
    isPlaying: true,
    reducedMotion: false,
  };

  it("runs only when the signal is visible, playing and motion is allowed", () => {
    expect(shouldRunSignalTicker(activeState)).toBe(true);

    const requiredTrueKeys = Object.keys(activeState).filter(
      (key): key is Exclude<keyof typeof activeState, "reducedMotion"> => key !== "reducedMotion"
    );

    for (const key of requiredTrueKeys) {
      expect(shouldRunSignalTicker({ ...activeState, [key]: false })).toBe(false);
    }
    expect(shouldRunSignalTicker({ ...activeState, reducedMotion: true })).toBe(false);
  });

  it("returns a clamped transform scale for the playhead", () => {
    expect(getPlayheadScale(0, 100)).toBe(0);
    expect(getPlayheadScale(50, 100)).toBe(0.5);
    expect(getPlayheadScale(120, 100)).toBe(1);
    expect(getPlayheadScale(-5, 100)).toBe(0);
    expect(getPlayheadScale(10, 0)).toBe(0);
  });
});
