import { describe, expect, it } from "vitest";
import {
  MOTION_DISTANCE,
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_STAGGER,
  getMotionProfile,
} from "@/lib/motion/tokens";

describe("shared motion contract", () => {
  it("uses an asymmetric rhythm where exits finish before entrances", () => {
    expect(MOTION_DURATION.exit).toBeLessThan(MOTION_DURATION.enter);
    expect(MOTION_DURATION.enter).toBeLessThan(MOTION_DURATION.section);
    expect(MOTION_DURATION.section).toBeLessThan(MOTION_DURATION.hero);
  });

  it("keeps distance and stagger inside the premium motion budget", () => {
    expect(MOTION_DISTANCE.micro).toBeLessThan(MOTION_DISTANCE.section);
    expect(MOTION_DISTANCE.section).toBeLessThanOrEqual(32);
    expect(MOTION_STAGGER.standard).toBeGreaterThanOrEqual(0.045);
    expect(MOTION_STAGGER.standard).toBeLessThanOrEqual(0.08);
  });

  it("exposes matching CSS and GSAP signature easing", () => {
    expect(MOTION_EASE.css).toEqual([0.16, 1, 0.3, 1]);
    expect(MOTION_EASE.gsap).toBe("power3.out");
  });

  it("collapses movement, scrub, pinning and ticker work for reduced motion", () => {
    expect(getMotionProfile(true)).toEqual({
      enabled: false,
      distance: 0,
      duration: 0,
      pin: false,
      scrub: false,
      ticker: false,
    });
  });

  it("enables the full motion system for standard preferences", () => {
    expect(getMotionProfile(false)).toEqual({
      enabled: true,
      distance: MOTION_DISTANCE.section,
      duration: MOTION_DURATION.section,
      pin: true,
      scrub: true,
      ticker: true,
    });
  });
});
