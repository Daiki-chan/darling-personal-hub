import type {
  LyricsRecord,
  MusicHistoryEntry,
  MusicPlaylist,
  MusicToast,
  MusicTrack,
  PersistedMusicState,
  RepeatMode,
  VolumeState,
} from "./types";
import { clamp } from "./format";
import { insertPlayNextTrack, mergeUniqueTracks, uniqueTracks } from "./track-utils";
import { changeMuted, changeVolume, normalizeVolumeState } from "./volume";

export type PlayerStatus = "idle" | "loading" | "ready" | "playing" | "paused" | "buffering" | "error";

export type MusicPlayerState = {
  accent: string;
  autoRadioEnabled: boolean;
  consecutiveFailures: number;
  currentTrack: MusicTrack | null;
  duration: number;
  expanded: boolean;
  favorites: MusicTrack[];
  history: MusicHistoryEntry[];
  isPlaying: boolean;
  isShutdown: boolean;
  lyricMappings: Record<string, LyricsRecord>;
  lyricOffsets: Record<string, number>;
  panel: "lyrics" | "queue";
  playlists: MusicPlaylist[];
  queue: MusicTrack[];
  repeatMode: RepeatMode;
  restored: boolean;
  resumeSeconds: number | null;
  seekRequest: { id: number; seconds: number } | null;
  shuffleEnabled: boolean;
  shutdownGeneration: number;
  status: PlayerStatus;
  toast: MusicToast | null;
  unavailableVideoIds: string[];
  volume: VolumeState;
};

export type Action =
  | { type: "HYDRATE"; payload: PersistedMusicState | null }
  | { type: "PLAY_TRACK"; track: MusicTrack; queue?: MusicTrack[] }
  | { type: "PLAY_NEXT"; track: MusicTrack }
  | { type: "ADD_TO_QUEUE"; track: MusicTrack }
  | { type: "SET_QUEUE"; queue: MusicTrack[] }
  | { type: "REMOVE_TRACK_AND_ADVANCE"; videoId: string }
  | { type: "SHUTDOWN_PLAYER" }
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
  | { type: "RESET_CONSECUTIVE_FAILURES" }
  | { type: "INCREMENT_CONSECUTIVE_FAILURES" }
  | { type: "SHOW_TOAST"; toast: MusicToast }
  | { type: "CLEAR_TOAST"; id: number };

export const initialState: MusicPlayerState = {
  accent: "#8f8a82",
  autoRadioEnabled: true,
  consecutiveFailures: 0,
  currentTrack: null,
  duration: 0,
  expanded: false,
  favorites: [],
  history: [],
  isPlaying: false,
  isShutdown: false,
  lyricMappings: {},
  lyricOffsets: {},
  panel: "lyrics",
  playlists: [],
  queue: [],
  repeatMode: "off",
  restored: false,
  resumeSeconds: null,
  seekRequest: null,
  shuffleEnabled: false,
  shutdownGeneration: 0,
  status: "idle",
  toast: null,
  unavailableVideoIds: [],
  volume: normalizeVolumeState(null),
};

export function musicPlayerReducer(state: MusicPlayerState, action: Action): MusicPlayerState {
  switch (action.type) {
    case "HYDRATE": {
      const saved = action.payload;
      if (!saved) return { ...state, restored: true };
      const queue = uniqueTracks(Array.isArray(saved.queue) ? saved.queue : []);
      const currentTrack = saved.currentTrack?.videoId ? saved.currentTrack : queue[0] ?? null;
      const savedTime = typeof saved.currentTime === "number" ? saved.currentTime : 0;
      const duration = currentTrack?.duration ?? 0;
      const validResumeTime = (duration > 0 && savedTime > duration - 5) ? null : (savedTime > 2 ? savedTime : null);

      return {
        ...state,
        autoRadioEnabled: saved.autoRadioEnabled !== false,
        currentTrack,
        duration,
        favorites: uniqueTracks(Array.isArray(saved.favorites) ? saved.favorites : []),
        history: Array.isArray(saved.history) ? saved.history.slice(0, 60) : [],
        isShutdown: false,
        lyricMappings: saved.lyricMappings ?? {},
        lyricOffsets: saved.lyricOffsets ?? {},
        playlists: Array.isArray(saved.playlists) ? saved.playlists : [],
        queue,
        repeatMode: ["off", "one", "all"].includes(saved.repeatMode) ? saved.repeatMode : "off",
        restored: true,
        resumeSeconds: validResumeTime,
        status: currentTrack ? "ready" : "idle",
        shuffleEnabled: Boolean(saved.shuffleEnabled),
        volume: normalizeVolumeState(saved.volume),
      };
    }
    case "PLAY_TRACK": {
      const isNewQueue = Boolean(action.queue);
      const nextQueue = uniqueTracks(action.queue ?? [...state.queue, action.track]);
      return {
        ...state,
        consecutiveFailures: 0,
        currentTrack: action.track,
        duration: action.track.duration ?? 0,
        isPlaying: true,
        isShutdown: false,
        queue: nextQueue,
        resumeSeconds: null,
        seekRequest: null,
        status: "loading",
        unavailableVideoIds: isNewQueue ? [] : state.unavailableVideoIds,
      };
    }
    case "PLAY_NEXT": {
      const { nextQueue } = insertPlayNextTrack(state.queue, state.currentTrack, action.track);
      return { ...state, queue: nextQueue };
    }
    case "ADD_TO_QUEUE": {
      const nextQueue = mergeUniqueTracks(state.queue, [action.track]);
      return { ...state, queue: nextQueue };
    }
    case "SET_QUEUE":
      return { ...state, queue: uniqueTracks(action.queue) };

    case "REMOVE_TRACK_AND_ADVANCE": {
      const nextQueue = state.queue.filter((item) => item.videoId !== action.videoId);
      const isRemovingCurrent = state.currentTrack?.videoId === action.videoId;

      if (!isRemovingCurrent) {
        return { ...state, queue: nextQueue };
      }

      if (!nextQueue.length) {
        return {
          ...state,
          currentTrack: null,
          duration: 0,
          isPlaying: false,
          queue: [],
          status: "idle",
        };
      }

      const currentIndex = state.queue.findIndex((item) => item.videoId === action.videoId);
      const nextTrack = nextQueue[currentIndex] ?? nextQueue[currentIndex - 1] ?? nextQueue[0];

      return {
        ...state,
        currentTrack: nextTrack,
        duration: nextTrack.duration ?? 0,
        isPlaying: true,
        queue: nextQueue,
        status: "loading",
      };
    }

    case "SHUTDOWN_PLAYER":
      return {
        ...state,
        consecutiveFailures: 0,
        currentTrack: null,
        duration: 0,
        expanded: false,
        isPlaying: false,
        isShutdown: true,
        queue: [],
        resumeSeconds: null,
        seekRequest: null,
        shutdownGeneration: state.shutdownGeneration + 1,
        status: "idle",
        toast: null,
        unavailableVideoIds: [],
      };

    case "SET_PLAYING":
      if (state.isShutdown) return state;
      return { ...state, isPlaying: action.value, status: action.value ? "loading" : "paused" };
    case "SET_STATUS":
      if (state.isShutdown) return state;
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
      return { ...state, expanded: state.isShutdown ? false : action.value };
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
      return { ...state, lyricOffsets: { ...state.lyricOffsets, [action.value]: clamp(action.value, -10, 10) } };
    case "MARK_UNAVAILABLE":
      return {
        ...state,
        consecutiveFailures: state.consecutiveFailures + 1,
        isPlaying: false,
        status: "error",
        unavailableVideoIds: state.unavailableVideoIds.includes(action.videoId)
          ? state.unavailableVideoIds
          : [...state.unavailableVideoIds, action.videoId],
      };
    case "RESET_CONSECUTIVE_FAILURES":
      return { ...state, consecutiveFailures: 0 };
    case "INCREMENT_CONSECUTIVE_FAILURES":
      return { ...state, consecutiveFailures: state.consecutiveFailures + 1 };
    case "SHOW_TOAST":
      return { ...state, toast: action.toast };
    case "CLEAR_TOAST":
      return state.toast?.id === action.id ? { ...state, toast: null } : state;
    default:
      return state;
  }
}
