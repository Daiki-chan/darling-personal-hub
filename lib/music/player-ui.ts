export type MusicUIState = "hidden" | "minimized" | "expanded";

const EXPANDED_PLAYER_HISTORY_KEY = "__darlingMusicPlayerExpanded";

export function resolveMusicUIState(hasTrack: boolean, expanded: boolean): MusicUIState {
  if (!hasTrack) return "hidden";
  return expanded ? "expanded" : "minimized";
}

export function shouldMinimizeAfterNavigation(
  previousPathname: string,
  nextPathname: string,
  uiState: MusicUIState,
) {
  return previousPathname !== nextPathname && uiState === "expanded";
}

export function createExpandedPlayerHistoryState(currentState: unknown): Record<string, unknown> {
  const state = currentState && typeof currentState === "object"
    ? currentState as Record<string, unknown>
    : {};
  return { ...state, [EXPANDED_PLAYER_HISTORY_KEY]: true };
}

export function isExpandedPlayerHistoryState(currentState: unknown) {
  return Boolean(
    currentState
      && typeof currentState === "object"
      && (currentState as Record<string, unknown>)[EXPANDED_PLAYER_HISTORY_KEY] === true,
  );
}
