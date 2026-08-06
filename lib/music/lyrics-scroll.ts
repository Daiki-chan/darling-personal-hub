import { clamp } from "./format";

export type LyricScrollGeometry = {
  containerHeight: number;
  containerScrollTop: number;
  lineHeight: number;
  lineTop: number;
  scrollHeight: number;
};

export function isLyricInsideSafeZone(
  geometry: Pick<LyricScrollGeometry, "containerHeight" | "lineHeight" | "lineTop">,
) {
  const lineCenter = geometry.lineTop + geometry.lineHeight / 2;
  const safeStart = geometry.containerHeight * 0.28;
  const safeEnd = geometry.containerHeight * 0.72;
  return lineCenter >= safeStart && lineCenter <= safeEnd;
}

export function calculateCenteredLyricScrollTop(geometry: LyricScrollGeometry) {
  const target = geometry.containerScrollTop
    + geometry.lineTop
    + geometry.lineHeight / 2
    - geometry.containerHeight / 2;
  const maxScrollTop = Math.max(0, geometry.scrollHeight - geometry.containerHeight);
  return clamp(target, 0, maxScrollTop);
}
