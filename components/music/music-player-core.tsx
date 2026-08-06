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
  useSyncExternalStore,
} from "react";
import { extractAmbientColor } from "@/lib/music/ambient";
import { clamp } from "@/lib/music/format";
import {
  cleanLegacyMusicStorage,
  loadPersistedMusicState,
  savePersistedMusicState,
} from "@/lib/music/storage";
import type {
  MusicErrorCode,
  MusicHistoryEntry,
  MusicPlaylist,
  MusicToast,
  MusicTrack,
  PersistedMusicState,
  RepeatMode,
} from "@/lib/music/types";

type PlayerStatus = "idle" | "loading" | "ready" | "playing" | "paused" | "buffering" | "error";

type MusicPlayerState = {
  accent: string;
  currentTrack: MusicTrack | null;
  duration: number;
  expanded: boolean;
  favorites: MusicTrack[];
  history: MusicHistoryEntry[];
  isMuted: boolean;
  isPlaying: boolean;
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
  volume: number;
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
  currentTrack: null,
  duration: 0,
  expanded: false,
  favorites: [],
  history: [],
  isMuted: false,
  isPlaying: false,
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
  volume: 0.86,
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
        currentTrack,
        duration: currentTrack?.duration ?? 0,
        favorites: uniqueTracks(Array.isArray(saved.favorites) ? saved.favorites : []),
        history: Array.isArray(saved.history) ? saved.history.slice(0, 60) : [],
        lyricOffsets: saved.lyricOffsets ?? {},
        playlists: Array.isArray(saved.playlists) ? saved.playlists : [],
        queue,
        repeatMode: ["off", "one", "all"].includes(saved.repeatMode) ? saved.repeatMode : "off",
        restored: true,
        status: currentTrack ? "ready" : "idle",
        shuffleEnabled: Boolean(saved.shuffleEnabled),
        volume: clamp(Number(saved.volume) || 0.86, 0, 1),
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
      return { ...state, volume: clamp(action.value, 0, 1), isMuted: action.value <= 0 ? true : state.isMuted };
    case "SET_MUTED":
      return { ...state, isMuted: action.value };
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
    case "SET_LYRIC_OFFSET":
      return { ...state, lyricOffsets: { ...state.lyricOffsets, [action.videoId]: action.value } };
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
  next: (fromEnded?: boolean) => void;
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
  setLyricOffset: (videoId: string, value: number) => void;
  setMuted: (value: boolean) => void;
  setPanel: (value: "lyrics" | "queue") => void;
  setVolume: (value: number) => void;
  toggleFavorite: (track: MusicTrack) => void;
  togglePlayback: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  const clockRef = useRef<ReturnType<typeof createPlaybackClock> | null>(null);
  const seekIdRef = useRef(0);
  const toastIdRef = useRef(0);
  if (!clockRef.current) clockRef.current = createPlaybackClock();
  const clock = clockRef.current;
  stateRef.current = state;

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

  const next = useCallback((fromEnded = false) => {
    const current = stateRef.current;
    if (!current.currentTrack || !current.queue.length) return;
    if (fromEnded && current.repeatMode === "one") {
      seek(0);
      dispatch({ type: "SET_PLAYING", value: true });
      return;
    }
    const available = current.queue.filter((track) => !current.unavailableVideoIds.includes(track.videoId));
    if (!available.length) {
      dispatch({ type: "SET_PLAYING", value: false });
      return;
    }
    let candidate: MusicTrack | undefined;
    if (current.shuffleEnabled && available.length > 1) {
      const alternatives = available.filter((track) => track.videoId !== current.currentTrack?.videoId);
      candidate = alternatives[Math.floor(Math.random() * alternatives.length)];
    } else {
      const index = current.queue.findIndex((track) => track.videoId === current.currentTrack?.videoId);
      candidate = current.queue.slice(index + 1).find((track) => !current.unavailableVideoIds.includes(track.videoId));
      if (!candidate && current.repeatMode === "all") candidate = available[0];
    }
    if (candidate) dispatch({ type: "PLAY_TRACK", track: candidate });
    else dispatch({ type: "SET_PLAYING", value: false });
  }, [seek]);

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
    const current = stateRef.current;
    dispatch({ type: "SET_QUEUE", queue: [...current.queue, track] });
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
    if (removingCurrent) next();
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
    window.setTimeout(() => next(true), 700);
  }, [next, showToast]);

  const reportPlayerStatus = useCallback((status: PlayerStatus, playing?: boolean) => {
    dispatch({ type: "SET_STATUS", status, playing });
    const current = stateRef.current.currentTrack;
    if (status === "playing" && current) {
      dispatch({ type: "ADD_HISTORY", track: current, playedAt: Date.now() });
    }
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
  }, [clock, showToast]);

  const persist = useCallback(() => {
    const current = stateRef.current;
    if (!current.restored) return Promise.resolve();
    const snapshot = clock.getSnapshot();
    return savePersistedMusicState({
      currentTrack: current.currentTrack,
      currentTime: snapshot.currentTime,
      favorites: current.favorites,
      history: current.history,
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
  }, [persist, state.currentTrack, state.favorites, state.history, state.lyricOffsets, state.playlists, state.queue, state.repeatMode, state.restored, state.shuffleEnabled, state.volume]);

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
      navigator.mediaSession.setActionHandler("nexttrack", () => next());
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
    setExpanded: (value) => dispatch({ type: "SET_EXPANDED", value }),
    setLyricOffset: (videoId, value) => dispatch({ type: "SET_LYRIC_OFFSET", videoId, value }),
    setMuted: (value) => dispatch({ type: "SET_MUTED", value }),
    setPanel: (value) => dispatch({ type: "SET_PANEL", value }),
    setVolume: (value) => dispatch({ type: "SET_VOLUME", value }),
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
