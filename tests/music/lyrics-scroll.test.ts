import { describe, expect, it } from "vitest";
import { calculateCenteredLyricScrollTop, isLyricInsideSafeZone } from "../../lib/music/lyrics-scroll";

describe("lyrics container scrolling", () => {
  it("keeps a centered line still inside the safe reading zone", () => {
    expect(isLyricInsideSafeZone({ containerHeight: 500, lineHeight: 40, lineTop: 230 })).toBe(true);
    expect(isLyricInsideSafeZone({ containerHeight: 500, lineHeight: 40, lineTop: 20 })).toBe(false);
  });

  it("calculates a container-relative center without touching document scroll", () => {
    expect(calculateCenteredLyricScrollTop({
      containerHeight: 500,
      containerScrollTop: 1000,
      lineHeight: 40,
      lineTop: 50,
      scrollHeight: 3000,
    })).toBe(820);
  });

  it("clamps scroll targets to the container bounds", () => {
    expect(calculateCenteredLyricScrollTop({
      containerHeight: 500,
      containerScrollTop: 0,
      lineHeight: 30,
      lineTop: 0,
      scrollHeight: 3000,
    })).toBe(0);
    expect(calculateCenteredLyricScrollTop({
      containerHeight: 500,
      containerScrollTop: 2600,
      lineHeight: 30,
      lineTop: 480,
      scrollHeight: 3000,
    })).toBe(2500);
  });
});
