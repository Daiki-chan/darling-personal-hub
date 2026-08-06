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
import { fetchAutoRadioCandidates } from "@/lib/music/recommendation-service";
import {
  cleanLegacyMusicStorage,
  loadPersistedMusicState,
  savePersistedMusicState,
} from "@/lib/music/storage";
import type {
  LyricsRecord,
  MusicErrorCode,
  MusicHistoryEntry,
  MusicPlaylist,
  MusicToast,
  MusicTrack,
  PersistedMusicState,
  RepeatMode,
  VolumeState,
} from "@/lib/music/types";
import { changeMuted, changeVolume, normalizeVolumeState } from "@/lib/music/volume";

type PlayerStatus = "idle" | "loading" | "ready" | "playing" | "paused" | "buffering" | "error";

type MusicPlayerState = {
  accent: string;
  autoRadioEnabled: boolean;
  currentTrack: MusicTrack | null;
  duration: number;
  expanded: boolean;
  favorites: MusicTrack[];
  history: MusicHistoryEntry[];
  isPlaying: boolean;
  lyricMappings: Record<string, LyricsRecord>;
  lyricOffsets: Record<string, number>;
  panel: "lyrics" | "queue";
  playlists: MusicPlaylist[];
  queue: MusicTrack[];
  repeatMode: RepeatMode;
  restored: boolean;
  seekRequest: { id: number; seconds: number } | null;
  shuffleEnabled: boolean;
  status: PlayerStatus;
  toast: MusicToast | null;
  unavailableVideoIds: string[];
  volume: VolumeState;
};

type Action =
  | { type: "HYDRATE"; payload: PersistedMusicState | null }
  | { type: "PLAY_TRACK"; track: MusicTrack; queue?: MusicTrack[] }
  | { type: "SET_QUEUE"; queue: MusicTrack[] }
  | { type: "SET_PLAYING"; value: boolean }
  | { type: "SET_STATUS"; status: PlayerStatus; playing?: boolean }
  | { type: "SET_DURATION"; value: number }
  | { type: "SET_VOLUME"; value: number }
  | { type: "SET_MUTED"; value: boolean }
  | { type: "SET_AUTO_RADIO"; value: boolean }
  | { type: "SET_REPEAT"; value: RepeatMode }
  | { type: "SET_SHUFFLE"; value: boolean }
  | { type: "SET_EXPANDED"; value: boolean }
  | { type: "SET_PANEL"; value: "lyrics" | "queue" }
  | { type: "SEEK"; seconds: number; id: number }
  | { type: "SET_ACCENT"; value: string }
  | { type: "TOGGLE_FAVORITE"; track: MusicTrack }
  | { type: "ADD_HISTORY"; track: MusicTrack; playedAt: number }
  | { type: "CREATE_PLAYLIST"; playlist: MusicPlaylist }
  | { type: "RENAME_PLAYLIST"; id: string; name: string }
  | { type: "DELETE_PLAYLIST"; id: string }
  | { type: "ADD_TO_PLAYLIST"; id: string; track: MusicTrack }
  | { type: "REMOVE_FROM_PLAYLIST"; id: string; videoId: string }
  | { type: "SET_LYRIC_MAPPING"; videoId: string; record: LyricsRecord }
  | { type: "SET_LYRIC_OFFSET"; videoId: string; value: number }
  | { type: "MARK_UNAVAILABLE"; videoId: string }
  | { type: "SHOW_TOAST"; toast: MusicToast }
  | { type: "CLEAR_TOAST"; id: number };

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

const initialState: MusicPlayerState = {
  accent: "#8f8a82",
  autoRadioEnabled: true,
  currentTrack: null,
  duration: 0,
  expanded: false,
  favorites: [],
  history: [],
  isPlaying: false,
  lyricMappings: {},
  lyricOffsets: {},
  panel: "lyrics",
  playlists: [],
  queue: [],
  repeatMode: "off",
  restored: false,
  seekRequest: null,
  shuffleEnabled: false,
  status: "idle",
  toast: null,
  unavailableVideoIds: [],
  volume: normalizeVolumeState(null),
};

function uniqueTracks(tracks: MusicTrack[]) {
  return tracks.filter((track, index, list) => list.findIndex((item) => item.videoId === track.videoId) === index);
}

function reducer(state: MusicPlayerState, action: Action): MusicPlayerState {
  switch (action.type) {
    case "HYDRATE": {
      const saved = action.payload;
      if (!saved) return { ...state, restored: true };
      const queue = uniqueTracks(Array.isArray(saved.queue) ? saved.queue : []);
      const currentTrack = saved.currentTrack?.videoId ? saved.currentTrack : queue[0] ?? null;
      return {
        ...state,
        autoRadioEnabled: saved.autoRadioEnabled !== false,
        currentTrack,
        duration: currentTrack?.duration ?? 0,
        favorites: uniqueTracks(Array.isArray(saved.favorites) ? saved.favorites : []),
        history: Array.isArray(saved.history) ? saved.history.slice(0, 60) : [],
        lyricMappings: saved.lyricMappings ?? {},
        lyricOffsets: saved.lyricOffsets ?? {},
        playlists: Array.isArray(saved.playlists) ? saved.playlists : [],
        queue,
        repeatMode: ["off", "one", "all"].includes(saved.repeatMode) ? saved.repeatMode : "off",
        restored: true,
        status: currentTrack ? "ready" : "idle",
        shuffleEnabled: Boolean(saved.shuffleEnabled),
        volume: normalizeVolumeState(saved.volume),
      };
    }
    case "PLAY_TRACK":
      return {
        ...state,
        currentTrack: action.track,
        duration: action.track.duration ?? 0,
        isPlaying: true,
        queue: uniqueTracks(action.queue ?? [...state.queue, action.track]),
        seekRequest: null,
        status: "loading",
      };
    case "SET_QUEUE":
      return { ...state, queue: uniqueTracks(action.queue) };
    case "SET_PLAYING":
      return { ...state, isPlaying: action.value, status: action.value ? "loading" : "paused" };
    case "SET_STATUS":
      return { ...state, status: action.status, isPlaying: action.playing ?? state.isPlaying };
    case "SET_DURATION":
      return { ...state, duration: action.value };
    case "SET_VOLUME":
      return { ...state, volume: changeVolume(state.volume, action.value) };
    case "SET_MUTED":
      return { ...state, volume: changeMuted(state.volume, action.value) };
    case "SET_AUTO_RADIO":
      return { ...state, autoRadioEnabled: action.value };
    case "SET_REPEAT":
      return { ...state, repeatMode: action.value };
    case "SET_SHUFFLE":
      return { ...state, shuffleEnabled: action.value };
    case "SET_EXPANDED":
      return { ...state, expanded: action.value };
    case "SET_PANEL":
      return { ...state, panel: action.value };
    case "SEEK":
      return { ...state, seekRequest: { id: action.id, seconds: action.seconds } };
    case "SET_ACCENT":
      return { ...state, accent: action.value };
    case "TOGGLE_FAVORITE": {
      const exists = state.favorites.some((track) => track.videoId === action.track.videoId);
      return {
        ...state,
        favorites: exists
          ? state.favorites.filter((track) => track.videoId !== action.track.videoId)
          : [action.track, ...state.favorites],
      };
    }
    case "ADD_HISTORY": {
      const entry = { ...action.track, playedAt: action.playedAt };
      return {
        ...state,
        history: [entry, ...state.history.filter((item) => item.videoId !== action.track.videoId)].slice(0, 60),
      };
    }
    case "CREATE_PLAYLIST":
      return { ...state, playlists: [action.playlist, ...state.playlists] };
    case "RENAME_PLAYLIST":
      return {
        ...state,
        playlists: state.playlists.map((playlist) =>
          playlist.id === action.id ? { ...playlist, name: action.name, updatedAt: Date.now() } : playlist,
        ),
      };
    case "DELETE_PLAYLIST":
      return { ...state, playlists: state.playlists.filter((playlist) => playlist.id !== action.id) };
    case "ADD_TO_PLAYLIST":
      return {
        ...state,
        playlists: state.playlists.map((playlist) =>
          playlist.id === action.id
            ? { ...playlist, tracks: uniqueTracks([...playlist.tracks, action.track]), updatedAt: Date.now() }
            : playlist,
        ),
      };
    case "REMOVE_FROM_PLAYLIST":
      return {
        ...state,
        playlists: state.playlists.map((playlist) =>
          playlist.id === action.id
            ? { ...playlist, tracks: playlist.tracks.filter((track) => track.videoId !== action.videoId), updatedAt: Date.now() }
            : playlist,
        ),
      };
    case "SET_LYRIC_MAPPING":
      return { ...state, lyricMappings: { ...state.lyricMappings, [action.videoId]: action.record } };
    case "SET_LYRIC_OFFSET":
      return { ...state, lyricOffsets: { ...state.lyricOffsets, [action.videoId]: clamp(action.value, -10, 10) } };
    case "MARK_UNAVAILABLE":
      return {
        ...state,
        unavailableVideoIds: state.unavailableVideoIds.includes(action.videoId)
          ? state.unavailableVideoIds
          : [...state.unavailableVideoIds, action.videoId],
        status: "error",
        isPlaying: false,
      };
    case "SHOW_TOAST":
      return { ...state, toast: action.toast };
    case "CLEAR_TOAST":
      return state.toast?.id === action.id ? { ...state, toast: null } : state;
    default:
      return state;
  }
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
  toggleAutoRadio: () => void;
  toggleFavorite: (track: MusicTrack) => void;
  togglePlayback: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  const [clock] = useState(createPlaybackClock);
  const radioAbortRef = useRef<AbortController | null>(null);
  const radioTrackRef = useRef<string | null>(null);
  const seekIdRef = useRef(0);
  const toastIdRef = useRef(0);

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
    const duration = clock.getSnapshot().duration || stateRef.current.duration;
    const value = clamp(seconds, 0, duration || Number.MAX_SAFE_INTEGER);
    clock.set(value, duration);
    dispatch({ type: "SEEK", seconds: value, id: ++seekIdRef.current });
  }, [clock]);

  const next = useCallback(async (fromEnded = false) => {
    const current = stateRef.current;
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
      if (stateRef.current.currentTrack?.videoId !== currentTrack.videoId) return;
      const selected = selectAutoRadioCandidate(
        candidates,
        currentTrack.videoId,
        recentVideoIds,
        stateRef.current.unavailableVideoIds,
      );
      if (!selected) {
        dispatch({ type: "SET_PLAYING", value: false });
        return;
      }
      const queue = uniqueTracks([...stateRef.current.queue, selected]);
      dispatch({ type: "PLAY_TRACK", track: selected, queue });
      showToast("AUTO_RADIO", "Auto Radio đã chọn bài tiếp theo.");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        dispatch({ type: "SET_PLAYING", value: false });
      }
    } finally {
      if (radioTrackRef.current === currentTrack.videoId) radioTrackRef.current = null;
    }
  }, [seek, showToast]);

  const previous = useCallback(() => {
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
    dispatch({ type: "SET_QUEUE", queue: [...stateRef.current.queue, track] });
    showToast("PLAYER_NOT_READY", "Đã thêm vào cuối hàng đợi.");
  }, [showToast]);

  const playNext = useCallback((track: MusicTrack) => {
    const current = stateRef.current;
    const queue = current.queue.filter((item) => item.videoId !== track.videoId);
    const index = Math.max(0, queue.findIndex((item) => item.videoId === current.currentTrack?.videoId));
    queue.splice(index + 1, 0, track);
    dispatch({ type: "SET_QUEUE", queue });
    showToast("PLAYER_NOT_READY", "Bài hát sẽ phát tiếp theo.");
  }, [showToast]);

  const removeFromQueue = useCallback((videoId: string) => {
    const current = stateRef.current;
    const removingCurrent = current.currentTrack?.videoId === videoId;
    dispatch({ type: "SET_QUEUE", queue: current.queue.filter((track) => track.videoId !== videoId) });
    if (removingCurrent) void next();
  }, [next]);

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
    const current = stateRef.current.currentTrack;
    if (current) dispatch({ type: "MARK_UNAVAILABLE", videoId: current.videoId });
    showToast(code, message);
    window.setTimeout(() => void next(true), 700);
  }, [next, showToast]);

  const reportPlayerStatus = useCallback((status: PlayerStatus, playing?: boolean) => {
    dispatch({ type: "SET_STATUS", status, playing });
    const current = stateRef.current.currentTrack;
    if (status === "playing" && current) dispatch({ type: "ADD_HISTORY", track: current, playedAt: Date.now() });
  }, []);

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
    if (!current.restored) return Promise.resolve();
    const snapshot = clock.getSnapshot();
    return savePersistedMusicState({
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
  }, [clock]);

  useEffect(() => {
    if (!state.restored) return;
    const timeout = window.setTimeout(() => void persist().catch(() => undefined), 800);
    return () => window.clearTimeout(timeout);
  }, [persist, state.autoRadioEnabled, state.currentTrack, state.favorites, state.history, state.lyricMappings, state.lyricOffsets, state.playlists, state.queue, state.repeatMode, state.restored, state.shuffleEnabled, state.volume]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (stateRef.current.isPlaying) void persist().catch(() => undefined);
    }, 15000);
    const onPageHide = () => void persist().catch(() => undefined);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [persist]);

  useEffect(() => {
    if (!state.currentTrack) return;
    let active = true;
    extractAmbientColor(state.currentTrack.thumbnail, state.currentTrack.videoId).then((color) => {
      if (active) dispatch({ type: "SET_ACCENT", value: color });
    });
    return () => { active = false; };
  }, [state.currentTrack]);

  useEffect(() => {
    const track = state.currentTrack;
    if (!track || !("mediaSession" in navigator)) return;
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
  }, [next, previous, seek, state.currentTrack, state.isPlaying]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target?.tagName ?? "")) return;
      if (event.code === "Space") {
        event.preventDefault();
        dispatch({ type: "SET_PLAYING", value: !stateRef.current.isPlaying });
      } else if (event.key === "ArrowRight") {
        seek(clock.getSnapshot().currentTime + 5);
      } else if (event.key === "ArrowLeft") {
        seek(clock.getSnapshot().currentTime - 5);
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const delta = event.key === "ArrowUp" ? 5 : -5;
        dispatch({ type: "SET_VOLUME", value: stateRef.current.volume.volume + delta });
      } else if (event.key.toLocaleLowerCase() === "m") {
        dispatch({ type: "SET_MUTED", value: !stateRef.current.volume.muted });
      } else if (event.key === "Escape" && stateRef.current.expanded) {
        dispatch({ type: "SET_EXPANDED", value: false });
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
    setExpanded: (expanded) => dispatch({ type: "SET_EXPANDED", value: expanded }),
    setLyricMapping: (videoId, record) => dispatch({ type: "SET_LYRIC_MAPPING", videoId, record }),
    setLyricOffset: (videoId, offset) => dispatch({ type: "SET_LYRIC_OFFSET", videoId, value: offset }),
    setMuted: (muted) => dispatch({ type: "SET_MUTED", value: muted }),
    setPanel: (panel) => dispatch({ type: "SET_PANEL", value: panel }),
    setVolume: (volume) => dispatch({ type: "SET_VOLUME", value: volume }),
    toggleAutoRadio: () => dispatch({ type: "SET_AUTO_RADIO", value: !state.autoRadioEnabled }),
    toggleFavorite: (track) => dispatch({ type: "TOGGLE_FAVORITE", track }),
    togglePlayback: () => state.currentTrack && dispatch({ type: "SET_PLAYING", value: !state.isPlaying }),
    toggleRepeat: () => {
      const modes: RepeatMode[] = ["off", "all", "one"];
      dispatch({ type: "SET_REPEAT", value: modes[(modes.indexOf(state.repeatMode) + 1) % modes.length] });
    },
    toggleShuffle: () => dispatch({ type: "SET_SHUFFLE", value: !state.shuffleEnabled }),
  }), [addToQueue, clearQueue, clock, handlePlaybackError, next, playCollection, playNext, playNow, previous, removeFromQueue, reorderQueue, reportPlayerStatus, seek, state]);

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
