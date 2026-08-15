import { describe, expect, it } from "vitest";
import { getNavigationScrollBehavior } from "@/lib/motion/preferences";

describe("motion preferences", () => {
  it("uses instant native navigation for reduced motion", () => {
    expect(getNavigationScrollBehavior(true)).toBe("auto");
  });

  it("keeps smooth chapter navigation when motion is allowed", () => {
    expect(getNavigationScrollBehavior(false)).toBe("smooth");
  });
});
