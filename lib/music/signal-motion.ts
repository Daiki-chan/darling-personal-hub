type SignalTickerState = {
  hasTrack: boolean;
  inViewport: boolean;
  isDocumentVisible: boolean;
  isPlaying: boolean;
  reducedMotion: boolean;
};

export function shouldRunSignalTicker({
  hasTrack,
  inViewport,
  isDocumentVisible,
  isPlaying,
  reducedMotion,
}: SignalTickerState) {
  return hasTrack && inViewport && isDocumentVisible && isPlaying && !reducedMotion;
}

export function getPlayheadScale(currentTime: number, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  if (!Number.isFinite(currentTime)) return 0;

  return Math.min(1, Math.max(0, currentTime / duration));
}
