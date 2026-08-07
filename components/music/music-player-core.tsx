"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { extractAmbientColor } from "@/lib/music/ambient";
import { clamp } from "@/lib/music/format";
import { planPlaybackContinuation, selectAutoRadioCandidate } from "@/lib/music/playback-policy";
import {
  initialState,
  musicPlayerReducer,
  type MusicPlayerState,
  type PlayerStatus,
} from "@/lib/music/player-state";
import { fetchAutoRadioCandidates } from "@/lib/music/recommendation-service";
import {
  cleanLegacyMusicStorage,
  clearPersistedPlaybackSession,
  loadPersistedMusicState,
  savePersistedMusicState,
} from "@/lib/music/storage";
import { uniqueTracks } from "@/lib/music/track-utils";
import type {
  LyricsRecord,
  MusicErrorCode,
  MusicTrack,
  RepeatMode,
} from "@/lib/music/types";

type ClockSnapshot = { currentTime: number; duration: number };

function createPlaybackClock() {
  let snapshot: ClockSnapshot = { currentTime: 0, duration: 0 };
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => ({ currentTime: 0, duration: 0 }),
    set(currentTime: number, duration: number) {
      const nextTime = Math.max(0, currentTime || 0);
      const nextDuration = Math.max(0, duration || snapshot.duration || 0);
      if (Math.abs(snapshot.currentTime - nextTime) < 0.05 && snapshot.duration === nextDuration) return;
      snapshot = { currentTime: nextTime, duration: nextDuration };
      for (const listener of listeners) listener();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

type MusicPlayerContextValue = {
  state: MusicPlayerState;
  clock: ReturnType<typeof createPlaybackClock>;
  addToPlaylist: (playlistId: string, track: MusicTrack) => void;
  addToQueue: (track: MusicTrack) => void;
  clearQueue: () => void;
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  dismissToast: () => void;
  handlePlaybackError: (code: MusicErrorCode, message: string) => void;
  next: (fromEnded?: boolean) => Promise<void>;
  playCollection: (tracks: MusicTrack[], shuffle?: boolean) => void;
  playNext: (track: MusicTrack) => void;
  playNow: (track: MusicTrack) => void;
  previous: () => void;
  removeFromPlaylist: (playlistId: string, videoId: string) => void;
  removeFromQueue: (videoId: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  reportDuration: (duration: number) => void;
  reportPlayerStatus: (status: PlayerStatus, playing?: boolean) => void;
  seek: (seconds: number) => void;
  setExpanded: (value: boolean) => void;
  setLyricMapping: (videoId: string, record: LyricsRecord) => void;
  setLyricOffset: (videoId: string, value: number) => void;
  setMuted: (value: boolean) => void;
  setPanel: (value: "lyrics" | "queue") => void;
  setVolume: (value: number) => void;
  shutdownPlayer: () => void;
  toggleAutoRadio: () => void;
  toggleFavorite: (track: MusicTrack) => void;
  togglePlayback: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(musicPlayerReducer, initialState);
  const stateRef = useRef(state);
  const [clock] = useState(createPlaybackClock);
  const radioAbortRef = useRef<AbortController | null>(null);
  const radioTrackRef = useRef<string | null>(null);
  const seekIdRef = useRef(0);
  const toastIdRef = useRef(0);

  // Persistence epoch & serialized write queue
  const persistenceEpochRef = useRef(0);
  const persistenceWriteChainRef = useRef(Promise.resolve());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const showToast = useCallback((code: MusicErrorCode, message: string) => {
    const id = ++toastIdRef.current;
    dispatch({ type: "SHOW_TOAST", toast: { id, code, message } });
    window.setTimeout(() => dispatch({ type: "CLEAR_TOAST", id }), 4600);
  }, []);

  const playNow = useCallback((track: MusicTrack) => dispatch({ type: "PLAY_TRACK", track }), []);
  const playCollection = useCallback((tracks: MusicTrack[], shuffle = false) => {
    const queue = uniqueTracks(tracks);
    if (!queue.length) return;
    const first = shuffle ? queue[Math.floor(Math.random() * queue.length)] : queue[0];
    dispatch({ type: "SET_SHUFFLE", value: shuffle });
    dispatch({ type: "PLAY_TRACK", track: first, queue });
  }, []);

  const seek = useCallback((seconds: number) => {
    if (stateRef.current.isShutdown) return;
    const duration = clock.getSnapshot().duration || stateRef.current.duration;
    const value = clamp(seconds, 0, duration || Number.MAX_SAFE_INTEGER);
    clock.set(value, duration);
    dispatch({ type: "SEEK", seconds: value, id: ++seekIdRef.current });
  }, [clock]);

  const next = useCallback(async (fromEnded = false) => {
    const current = stateRef.current;
    if (current.isShutdown) return;
    const currentTrack = current.currentTrack;
    if (!currentTrack) return;
    const continuation = planPlaybackContinuation({
      autoRadioEnabled: current.autoRadioEnabled,
      currentTrack,
      fromEnded,
      history: current.history,
      queue: current.queue,
      repeatMode: current.repeatMode,
      shuffleEnabled: current.shuffleEnabled,
      unavailableVideoIds: current.unavailableVideoIds,
    });

    if (continuation.kind === "track") {
      if (continuation.queue) dispatch({ type: "SET_QUEUE", queue: continuation.queue });
      dispatch({ type: "PLAY_TRACK", track: continuation.track, queue: continuation.queue });
      return;
    }
    if (continuation.kind === "restart") {
      seek(0);
      dispatch({ type: "SET_PLAYING", value: true });
      return;
    }
    if (continuation.kind === "stop") {
      dispatch({ type: "SET_PLAYING", value: false });
      return;
    }

    if (radioTrackRef.current === currentTrack.videoId) return;
    dispatch({ type: "SET_STATUS", status: "buffering", playing: current.isPlaying });
    radioAbortRef.current?.abort();
    const controller = new AbortController();
    radioAbortRef.current = controller;
    radioTrackRef.current = currentTrack.videoId;
    const recentVideoIds = uniqueTracks([
      currentTrack,
      ...current.history,
    ]).slice(0, 30).map((track) => track.videoId);

    try {
      const candidates = await fetchAutoRadioCandidates(currentTrack, recentVideoIds, controller.signal);
      if (stateRef.current.currentTrack?.videoId !== currentTrack.videoId || stateRef.current.isShutdown) return;
      const selected = selectAutoRadioCandidate(
        candidates,
        currentTrack.videoId,
        recentVideoIds,
        stateRef.current.unavailableVideoIds,
      );
      if (!selected) {
        dispatch({ type: "SET_PLAYING", value: false });
        showToast("AUTO_RADIO", "Auto Radio chưa tìm thấy bài tiếp theo.");
        return;
      }
      const queue = uniqueTracks([...stateRef.current.queue, selected]);
      dispatch({ type: "PLAY_TRACK", track: selected, queue });
      showToast("AUTO_RADIO", "Auto Radio đã chọn bài tiếp theo.");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError") && !stateRef.current.isShutdown) {
        dispatch({ type: "SET_PLAYING", value: false });
        showToast("AUTO_RADIO", "Không thể tải bài tiếp theo. Vui lòng thử lại.");
      }
    } finally {
      if (radioTrackRef.current === currentTrack.videoId) radioTrackRef.current = null;
    }
  }, [seek, showToast]);

  const previous = useCallback(() => {
    if (stateRef.current.isShutdown) return;
    if (clock.getSnapshot().currentTime > 5) {
      seek(0);
      return;
    }
    const current = stateRef.current;
    const index = current.queue.findIndex((track) => track.videoId === current.currentTrack?.videoId);
    const candidate = current.queue[index - 1] ?? (current.repeatMode === "all" ? current.queue.at(-1) : null);
    if (candidate) dispatch({ type: "PLAY_TRACK", track: candidate });
    else seek(0);
  }, [clock, seek]);

  const addToQueue = useCallback((track: MusicTrack) => {
    const alreadyExisted = stateRef.current.queue.some((item) => item.videoId === track.videoId);
    dispatch({ type: "ADD_TO_QUEUE", track });
    if (alreadyExisted) {
      showToast("PLAYER_NOT_READY", "Bài hát đã có trong hàng đợi.");
    } else {
      showToast("PLAYER_NOT_READY", "Đã thêm vào cuối hàng đợi.");
    }
  }, [showToast]);

  const playNext = useCallback((track: MusicTrack) => {
    dispatch({ type: "PLAY_NEXT", track });
    showToast("PLAYER_NOT_READY", "Bài hát sẽ phát tiếp theo.");
  }, [showToast]);

  const removeFromQueue = useCallback((videoId: string) => {
    dispatch({ type: "REMOVE_TRACK_AND_ADVANCE", videoId });
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    const queue = [...stateRef.current.queue];
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= queue.length || toIndex >= queue.length) return;
    const [track] = queue.splice(fromIndex, 1);
    queue.splice(toIndex, 0, track);
    dispatch({ type: "SET_QUEUE", queue });
  }, []);

  const clearQueue = useCallback(() => {
    dispatch({ type: "SET_QUEUE", queue: stateRef.current.currentTrack ? [stateRef.current.currentTrack] : [] });
  }, []);

  const handlePlaybackError = useCallback((code: MusicErrorCode, message: string) => {
    if (stateRef.current.isShutdown) return;
    const current = stateRef.current.currentTrack;
    if (current) dispatch({ type: "MARK_UNAVAILABLE", videoId: current.videoId });
    showToast(code, message);

    if (stateRef.current.consecutiveFailures >= stateRef.current.queue.length && stateRef.current.queue.length > 0) {
      dispatch({ type: "SET_PLAYING", value: false });
      showToast("VIDEO_UNAVAILABLE", "Không thể phát các bài trong hàng đợi. Vui lòng thử lại sau.");
      return;
    }

    window.setTimeout(() => {
      if (!stateRef.current.isShutdown) void next(true);
    }, 700);
  }, [next, showToast]);

  const reportPlayerStatus = useCallback((status: PlayerStatus, playing?: boolean) => {
    if (stateRef.current.isShutdown) return;
    dispatch({ type: "SET_STATUS", status, playing });
    const current = stateRef.current.currentTrack;
    if (status === "playing" && current) dispatch({ type: "ADD_HISTORY", track: current, playedAt: Date.now() });
  }, []);

  const setExpanded = useCallback((expanded: boolean) => {
    dispatch({ type: "SET_EXPANDED", value: expanded });
  }, []);

  const shutdownPlayer = useCallback(() => {
    persistenceEpochRef.current += 1;
    radioAbortRef.current?.abort();
    clock.set(0, 0);

    // MediaSession cleanup
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = "none";
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("seekto", null);
      } catch {
        // Development log
      }
    }

    dispatch({ type: "SHUTDOWN_PLAYER" });

    // Serialized storage session clear
    persistenceWriteChainRef.current = persistenceWriteChainRef.current
      .then(() => clearPersistedPlaybackSession())
      .catch(() => undefined);
  }, [clock]);

  useEffect(() => {
    cleanLegacyMusicStorage();
    loadPersistedMusicState()
      .then((saved) => {
        dispatch({ type: "HYDRATE", payload: saved });
        if (saved) clock.set(saved.currentTime || 0, saved.currentTrack?.duration || 0);
      })
      .catch(() => {
        dispatch({ type: "HYDRATE", payload: null });
        showToast("STORAGE_FAILED", "Không thể khôi phục thư viện cục bộ.");
      });
    return () => radioAbortRef.current?.abort();
  }, [clock, showToast]);

  const persist = useCallback(() => {
    const current = stateRef.current;
    if (!current.restored || current.isShutdown) return Promise.resolve();
    const epochAtStart = persistenceEpochRef.current;
    const snapshot = clock.getSnapshot();

    persistenceWriteChainRef.current = persistenceWriteChainRef.current.then(async () => {
      if (persistenceEpochRef.current !== epochAtStart || stateRef.current.isShutdown) return;
      await savePersistedMusicState({
        autoRadioEnabled: current.autoRadioEnabled,
        currentTrack: current.currentTrack,
        currentTime: snapshot.currentTime,
        favorites: current.favorites,
        history: current.history,
        lyricMappings: current.lyricMappings,
        lyricOffsets: current.lyricOffsets,
        playlists: current.playlists,
        queue: current.queue,
        repeatMode: current.repeatMode,
        shuffleEnabled: current.shuffleEnabled,
        updatedAt: Date.now(),
        volume: current.volume,
      });
    });

    return persistenceWriteChainRef.current;
  }, [clock]);

  useEffect(() => {
    if (!state.restored || state.isShutdown) return;
    const timeout = window.setTimeout(() => void persist().catch(() => undefined), 800);
    return () => window.clearTimeout(timeout);
  }, [persist, state.autoRadioEnabled, state.currentTrack, state.favorites, state.history, state.isShutdown, state.lyricMappings, state.lyricOffsets, state.playlists, state.queue, state.repeatMode, state.restored, state.shuffleEnabled, state.volume]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (stateRef.current.isPlaying && !stateRef.current.isShutdown) void persist().catch(() => undefined);
    }, 15000);
    const onPageHide = () => {
      if (!stateRef.current.isShutdown) void persist().catch(() => undefined);
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [persist]);

  useEffect(() => {
    if (!state.currentTrack || state.isShutdown) return;
    let active = true;
    extractAmbientColor(state.currentTrack.thumbnail, state.currentTrack.videoId).then((color) => {
      if (active && !stateRef.current.isShutdown) dispatch({ type: "SET_ACCENT", value: color });
    });
    return () => { active = false; };
  }, [state.currentTrack, state.isShutdown]);

  // Media Session registration & cleanup symmetry
  useEffect(() => {
    if (state.isShutdown || !state.currentTrack || !("mediaSession" in navigator)) return;
    const track = state.currentTrack;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: "Darling Music Hub",
        artwork: [{ src: track.thumbnail }],
      });
      navigator.mediaSession.playbackState = state.isPlaying ? "playing" : "paused";
      navigator.mediaSession.setActionHandler("play", () => dispatch({ type: "SET_PLAYING", value: true }));
      navigator.mediaSession.setActionHandler("pause", () => dispatch({ type: "SET_PLAYING", value: false }));
      navigator.mediaSession.setActionHandler("nexttrack", () => void next());
      navigator.mediaSession.setActionHandler("previoustrack", previous);
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (typeof details.seekTime === "number") seek(details.seekTime);
      });
    } catch {
      return;
    }
  }, [next, previous, seek, state.currentTrack, state.isPlaying, state.isShutdown]);

  // Scoped Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (stateRef.current.isShutdown) return;
      if (event.defaultPrevented || event.ctrlKey || event.metaKey) return;

      const target = event.target as HTMLElement | null;
      const isInputTarget =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "IFRAME"].includes(target?.tagName ?? "") ||
        target?.getAttribute("type") === "range";

      if (isInputTarget) return;

      // Ensure focus or interaction is within music player container for non-modified keys
      const isInPlayer = target?.closest("[data-music-ui-state]") || target?.closest("[role='dialog']");
      if (!isInPlayer && !stateRef.current.expanded) return;

      if (event.code === "Space") {
        event.preventDefault();
        dispatch({ type: "SET_PLAYING", value: !stateRef.current.isPlaying });
      } else if (event.key === "ArrowRight") {
        seek(clock.getSnapshot().currentTime + 5);
      } else if (event.key === "ArrowLeft") {
        seek(clock.getSnapshot().currentTime - 5);
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        if (isInPlayer) {
          event.preventDefault();
          const delta = event.key === "ArrowUp" ? 5 : -5;
          dispatch({ type: "SET_VOLUME", value: stateRef.current.volume.volume + delta });
        }
      } else if (event.key.toLocaleLowerCase() === "m") {
        dispatch({ type: "SET_MUTED", value: !stateRef.current.volume.muted });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clock, seek]);

  const value = useMemo<MusicPlayerContextValue>(() => ({
    state,
    clock,
    addToPlaylist: (playlistId, track) => dispatch({ type: "ADD_TO_PLAYLIST", id: playlistId, track }),
    addToQueue,
    clearQueue,
    createPlaylist: (name) => {
      const cleanName = name.trim();
      if (!cleanName) return;
      const now = Date.now();
      dispatch({
        type: "CREATE_PLAYLIST",
        playlist: { id: globalThis.crypto?.randomUUID?.() ?? `playlist-${now}`, name: cleanName, tracks: [], createdAt: now, updatedAt: now },
      });
    },
    deletePlaylist: (id) => dispatch({ type: "DELETE_PLAYLIST", id }),
    dismissToast: () => state.toast && dispatch({ type: "CLEAR_TOAST", id: state.toast.id }),
    handlePlaybackError,
    next,
    playCollection,
    playNext,
    playNow,
    previous,
    removeFromPlaylist: (playlistId, videoId) => dispatch({ type: "REMOVE_FROM_PLAYLIST", id: playlistId, videoId }),
    removeFromQueue,
    renamePlaylist: (id, name) => name.trim() && dispatch({ type: "RENAME_PLAYLIST", id, name: name.trim() }),
    reorderQueue,
    reportDuration: (duration) => dispatch({ type: "SET_DURATION", value: duration }),
    reportPlayerStatus,
    seek,
    setExpanded,
    setLyricMapping: (videoId, record) => dispatch({ type: "SET_LYRIC_MAPPING", videoId, record }),
    setLyricOffset: (videoId, offset) => dispatch({ type: "SET_LYRIC_OFFSET", videoId, value: offset }),
    setMuted: (muted) => dispatch({ type: "SET_MUTED", value: muted }),
    setPanel: (panel) => dispatch({ type: "SET_PANEL", value: panel }),
    setVolume: (volume) => dispatch({ type: "SET_VOLUME", value: volume }),
    shutdownPlayer,
    toggleAutoRadio: () => dispatch({ type: "SET_AUTO_RADIO", value: !state.autoRadioEnabled }),
    toggleFavorite: (track) => dispatch({ type: "TOGGLE_FAVORITE", track }),
    togglePlayback: () => state.currentTrack && dispatch({ type: "SET_PLAYING", value: !state.isPlaying }),
    toggleRepeat: () => {
      const modes: RepeatMode[] = ["off", "all", "one"];
      dispatch({ type: "SET_REPEAT", value: modes[(modes.indexOf(state.repeatMode) + 1) % modes.length] });
    },
    toggleShuffle: () => dispatch({ type: "SET_SHUFFLE", value: !state.shuffleEnabled }),
  }), [addToQueue, clearQueue, clock, handlePlaybackError, next, playCollection, playNext, playNow, previous, removeFromQueue, reorderQueue, reportPlayerStatus, seek, setExpanded, shutdownPlayer, state]);

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>;
}

export function useMusicPlayer() {
  const value = useContext(MusicPlayerContext);
  if (!value) throw new Error("useMusicPlayer must be used inside MusicPlayerProvider.");
  return value;
}

export function usePlaybackClock() {
  const { clock } = useMusicPlayer();
  return useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getServerSnapshot);
}
