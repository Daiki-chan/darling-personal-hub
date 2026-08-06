import { describe, expect, it } from "vitest";
import { changeMuted, changeVolume, normalizeVolumeState } from "../../lib/music/volume";

describe("VolumeState", () => {
  it("defaults invalid or missing values to audible 100 percent", () => {
    expect(normalizeVolumeState(null)).toEqual({ volume: 100, previousVolume: 100, muted: false });
    expect(normalizeVolumeState({ volume: Number.NaN })).toEqual({ volume: 100, previousVolume: 100, muted: false });
  });

  it("migrates the previous 0 to 1 persistence format", () => {
    expect(normalizeVolumeState(0.86)).toEqual({ volume: 86, previousVolume: 86, muted: false });
  });

  it("clamps direct changes and mutes at zero", () => {
    const initial = normalizeVolumeState(null);
    expect(changeVolume(initial, 140)).toMatchObject({ volume: 100, muted: false });
    expect(changeVolume(initial, -5)).toEqual({ volume: 0, previousVolume: 100, muted: true });
  });

  it("restores the prior audible volume after mute", () => {
    const atForty = changeVolume(normalizeVolumeState(null), 40);
    const muted = changeMuted(atForty, true);
    expect(muted).toEqual({ volume: 40, previousVolume: 40, muted: true });
    expect(changeMuted(muted, false)).toEqual({ volume: 40, previousVolume: 40, muted: false });
  });
});
