import { describe, expect, it } from "vitest";
import {
  createExpandedPlayerHistoryState,
  isExpandedPlayerHistoryState,
  resolveMusicUIState,
  shouldMinimizeAfterNavigation,
} from "../../lib/music/player-ui";

describe("music UI lifecycle", () => {
  it("derives the three player UI states without persisting overlay state", () => {
    expect(resolveMusicUIState(false, false)).toBe("hidden");
    expect(resolveMusicUIState(true, false)).toBe("minimized");
    expect(resolveMusicUIState(true, true)).toBe("expanded");
  });

  it("minimizes only when an expanded player crosses a route boundary", () => {
    expect(shouldMinimizeAfterNavigation("/am-nhac", "/thu-vien", "expanded")).toBe(true);
    expect(shouldMinimizeAfterNavigation("/am-nhac", "/am-nhac", "expanded")).toBe(false);
    expect(shouldMinimizeAfterNavigation("/am-nhac", "/portfolio", "minimized")).toBe(false);
  });

  it("marks an expanded-player history entry without losing Next.js router state", () => {
    const nextState = createExpandedPlayerHistoryState({ __NA: true, tree: "router-tree" });

    expect(nextState).toMatchObject({ __NA: true, tree: "router-tree" });
    expect(isExpandedPlayerHistoryState(nextState)).toBe(true);
    expect(isExpandedPlayerHistoryState(null)).toBe(false);
    expect(isExpandedPlayerHistoryState({})).toBe(false);
  });
});
