import type { VolumeState } from "./types";

export const DEFAULT_VOLUME = 100;

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_VOLUME;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeVolumeState(value: unknown): VolumeState {
  if (typeof value === "number") {
    const migrated = value >= 0 && value <= 1 ? value * 100 : value;
    const volume = clampVolume(migrated);
    return {
      volume,
      previousVolume: volume > 0 ? volume : DEFAULT_VOLUME,
      muted: volume === 0,
    };
  }

  if (!value || typeof value !== "object") {
    return { volume: DEFAULT_VOLUME, previousVolume: DEFAULT_VOLUME, muted: false };
  }

  const candidate = value as Partial<VolumeState>;
  const rawVolume = Number(candidate.volume);
  const rawPrevious = Number(candidate.previousVolume);
  const volume = Number.isFinite(rawVolume) ? clampVolume(rawVolume) : DEFAULT_VOLUME;
  const previousVolume = Number.isFinite(rawPrevious) && rawPrevious > 0
    ? clampVolume(rawPrevious)
    : volume > 0 ? volume : DEFAULT_VOLUME;

  return {
    volume,
    previousVolume: previousVolume || DEFAULT_VOLUME,
    muted: Boolean(candidate.muted),
  };
}

export function changeVolume(state: VolumeState, value: number): VolumeState {
  const volume = clampVolume(value);
  if (volume === 0) {
    return {
      volume: 0,
      previousVolume: state.volume > 0 ? state.volume : state.previousVolume || DEFAULT_VOLUME,
      muted: true,
    };
  }
  return { volume, previousVolume: volume, muted: false };
}

export function changeMuted(state: VolumeState, muted: boolean): VolumeState {
  if (muted) {
    return {
      ...state,
      previousVolume: state.volume > 0 ? state.volume : state.previousVolume || DEFAULT_VOLUME,
      muted: true,
    };
  }

  const restored = state.volume > 0 ? state.volume : clampVolume(state.previousVolume || DEFAULT_VOLUME);
  return {
    volume: restored || DEFAULT_VOLUME,
    previousVolume: restored || DEFAULT_VOLUME,
    muted: false,
  };
}
