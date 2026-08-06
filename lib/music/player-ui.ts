export type MusicUIState = "hidden" | "minimized" | "expanded";

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
