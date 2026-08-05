"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronUp,
  Disc3,
  Headphones,
  ListMusic,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Music2,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type CSSProperties,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { AudioVisualizer } from "@/components/music/audio-visualizer";
import {
  findActiveLyricIndex,
  formatTime,
  getTrackAudioUrl,
  parseSyncedLyrics,
  personalTracks,
  type MusicTrack,
  type SyncedLyricLine,
} from "@/lib/music";
import styles from "./music-hub.module.css";

type SearchItem = {
  artist: string;
  duration: number;
  thumbnail: string;
  title: string;
  videoId: string;
};

type LyricsState = {
  activeIndex: number;
  instrumental: boolean;
  lines: SyncedLyricLine[];
  plainLyrics: string | null;
  status: "idle" | "loading" | "ready" | "empty" | "error";
};

type PlayerState = {
  accent: string;
  buffering: boolean;
  currentId: string;
  error: string | null;
  expanded: boolean;
  lyricsOpen: boolean;
  lyrics: LyricsState;
  playing: boolean;
  queue: MusicTrack[];
  searchItems: SearchItem[];
  searchQuery: string;
  searchStatus: "idle" | "loading" | "ready" | "empty" | "error";
};

type PlayerAction =
  | { type: "SELECT_TRACK"; track: MusicTrack }
  | { type: "SET_PLAYING"; value: boolean }
  | { type: "SET_BUFFERING"; value: boolean }
  | { type: "SET_EXPANDED"; value: boolean }
  | { type: "SET_LYRICS_OPEN"; value: boolean }
  | { type: "SET_ACCENT"; value: string }
  | { type: "SET_ERROR"; value: string | null }
  | { type: "SET_SEARCH_QUERY"; value: string }
  | { type: "CLEAR_SEARCH" }
  | { type: "SEARCH_START" }
  | { type: "SEARCH_SUCCESS"; items: SearchItem[] }
  | { type: "SEARCH_ERROR" }
  | { type: "LYRICS_START" }
  | {
      type: "LYRICS_SUCCESS";
      instrumental: boolean;
      lines: SyncedLyricLine[];
      plainLyrics: string | null;
    }
  | { type: "LYRICS_EMPTY" }
  | { type: "LYRICS_ERROR" }
  | { type: "SET_ACTIVE_LYRIC"; value: number }
  | { type: "UPDATE_DURATION"; id: string; duration: number };

const initialLyrics: LyricsState = {
  activeIndex: -1,
  instrumental: false,
  lines: [],
  plainLyrics: null,
  status: "idle",
};

const initialState: PlayerState = {
  accent: personalTracks[0]?.accentFallback ?? "#8b5cf6",
  buffering: false,
  currentId: personalTracks[0]?.id ?? "",
  error: null,
  expanded: false,
  lyricsOpen: false,
  lyrics: initialLyrics,
  playing: false,
  queue: personalTracks,
  searchItems: [],
  searchQuery: "",
  searchStatus: "idle",
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "SELECT_TRACK": {
      const alreadyQueued = state.queue.some((track) => track.id === action.track.id);
      return {
        ...state,
        currentId: action.track.id,
        error: null,
        lyrics: initialLyrics,
        queue: alreadyQueued ? state.queue : [...state.queue, action.track],
      };
    }
    case "SET_PLAYING":
      return { ...state, playing: action.value };
    case "SET_BUFFERING":
      return { ...state, buffering: action.value };
    case "SET_EXPANDED":
      return { ...state, expanded: action.value };
    case "SET_LYRICS_OPEN":
      return { ...state, lyricsOpen: action.value };
    case "SET_ACCENT":
      return { ...state, accent: action.value };
    case "SET_ERROR":
      return { ...state, error: action.value };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.value };
    case "CLEAR_SEARCH":
      return { ...state, searchItems: [], searchStatus: "idle" };
    case "SEARCH_START":
      return { ...state, searchStatus: "loading", searchItems: [] };
    case "SEARCH_SUCCESS":
      return {
        ...state,
        searchItems: action.items,
        searchStatus: action.items.length ? "ready" : "empty",
      };
    case "SEARCH_ERROR":
      return { ...state, searchItems: [], searchStatus: "error" };
    case "LYRICS_START":
      return { ...state, lyrics: { ...initialLyrics, status: "loading" } };
    case "LYRICS_SUCCESS":
      return {
        ...state,
        lyrics: {
          activeIndex: -1,
          instrumental: action.instrumental,
          lines: action.lines,
          plainLyrics: action.plainLyrics,
          status: "ready",
        },
      };
    case "LYRICS_EMPTY":
      return { ...state, lyrics: { ...initialLyrics, status: "empty" } };
    case "LYRICS_ERROR":
      return { ...state, lyrics: { ...initialLyrics, status: "error" } };
    case "SET_ACTIVE_LYRIC":
      return { ...state, lyrics: { ...state.lyrics, activeIndex: action.value } };
    case "UPDATE_DURATION":
      return {
        ...state,
        queue: state.queue.map((track) =>
          track.id === action.id ? { ...track, duration: action.duration } : track,
        ),
      };
    default:
      return state;
  }
}

const revealVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.36 } },
  exit: { opacity: 0, transition: { duration: 0.26 } },
};

function deterministicAccent(seed: string) {
  let value = 0;
  for (const character of seed) {
    value = (value * 31 + character.charCodeAt(0)) % 360;
  }
  const hues = [246, 254, 263, 270];
  return `hsl(${hues[value % hues.length]} 72% 64%)`;
}

function PlayStateIcon({ buffering, playing }: { buffering: boolean; playing: boolean }) {
  if (buffering) {
    return <LoaderCircle aria-hidden="true" className={styles.spinner} size={21} />;
  }

  return playing ? (
    <Pause aria-hidden="true" size={21} fill="currentColor" />
  ) : (
    <Play aria-hidden="true" size={21} fill="currentColor" />
  );
}

export function MusicHub() {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const prefersReducedMotion = Boolean(useReducedMotion());
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const stateRef = useRef(state);
  const lyricsLinesRef = useRef<SyncedLyricLine[]>([]);
  const activeLyricRef = useRef(-1);
  const collapsedProgressRef = useRef<HTMLInputElement>(null);
  const expandedProgressRef = useRef<HTMLInputElement>(null);
  const collapsedTimeRef = useRef<HTMLSpanElement>(null);
  const expandedTimeRef = useRef<HTMLSpanElement>(null);
  const collapsedDurationRef = useRef<HTMLSpanElement>(null);
  const expandedDurationRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeLyricElementRef = useRef<HTMLParagraphElement>(null);
  const retryCountRef = useRef(0);

  stateRef.current = state;
  lyricsLinesRef.current = state.lyrics.lines;

  const currentTrack = useMemo(
    () => state.queue.find((track) => track.id === state.currentId) ?? state.queue[0],
    [state.currentId, state.queue],
  );

  const syncTimeline = useCallback((audio: HTMLAudioElement) => {
    const knownDuration = stateRef.current.queue.find(
      (track) => track.id === stateRef.current.currentId,
    )?.duration;
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : knownDuration || 0;
    const progress = duration > 0 ? Math.min(100, (audio.currentTime / duration) * 100) : 0;

    for (const slider of [collapsedProgressRef.current, expandedProgressRef.current]) {
      if (slider) {
        slider.max = duration > 0 ? duration.toString() : "1";
        slider.value = audio.currentTime.toString();
        slider.style.setProperty("--track-progress", `${progress}%`);
      }
    }

    for (const label of [collapsedTimeRef.current, expandedTimeRef.current]) {
      if (label) {
        label.textContent = formatTime(audio.currentTime);
      }
    }

    for (const label of [collapsedDurationRef.current, expandedDurationRef.current]) {
      if (label) {
        label.textContent = formatTime(duration);
      }
    }

    const nextActive = findActiveLyricIndex(lyricsLinesRef.current, audio.currentTime);
    if (nextActive !== activeLyricRef.current) {
      activeLyricRef.current = nextActive;
      dispatch({ type: "SET_ACTIVE_LYRIC", value: nextActive });
    }
  }, []);

  const ensureAudioGraph = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) {
      return null;
    }

    try {
      if (!audioContextRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;

        const context = new AudioCtx();
        const source = context.createMediaElementSource(audio);
        const nextAnalyser = context.createAnalyser();
        nextAnalyser.fftSize = 256;
        nextAnalyser.smoothingTimeConstant = 0.84;
        source.connect(nextAnalyser);
        nextAnalyser.connect(context.destination);
        audioContextRef.current = context;
        sourceNodeRef.current = source;
        setAnalyser(nextAnalyser);
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      return audioContextRef.current;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    return () => {
      const context = audioContextRef.current;
      if (context && context.state !== "closed") {
        void context.close().catch(() => undefined);
      }
      sourceNodeRef.current?.disconnect();
      audioContextRef.current = null;
      sourceNodeRef.current = null;
    };
  }, []);

  const handleAudioError = useCallback((reason?: string) => {
    const snapshot = stateRef.current;
    const currentTrackObj = snapshot.queue.find((item) => item.id === snapshot.currentId);
    dispatch({ type: "SET_BUFFERING", value: false });
    dispatch({ type: "SET_PLAYING", value: false });

    if (retryCountRef.current < 2) {
      retryCountRef.current += 1;
      dispatch({ type: "SET_BUFFERING", value: true });
      dispatch({
        type: "SET_ERROR",
        value: `Đang kết nối lại nguồn phát (lần ${retryCountRef.current}/2)...`,
      });
      setTimeout(() => {
        const updatedTrack = stateRef.current.queue.find((t) => t.id === snapshot.currentId);
        if (updatedTrack && audioRef.current) {
          audioRef.current.pause();
          audioRef.current.crossOrigin = "anonymous";
          const src = getTrackAudioUrl(updatedTrack);
          if (src) {
            audioRef.current.src = src;
            audioRef.current.load();
            void audioRef.current.play().catch(() => handleAudioError(reason));
          }
        }
      }, 700);
    } else {
      retryCountRef.current = 0;
      if (currentTrackObj?.source.kind === "youtube") {
        const directFallback =
          personalTracks.find((t) => t.source.kind === "direct") || personalTracks[0];
        dispatch({
          type: "SET_ERROR",
          value: "Nguồn phát YouTube không phản hồi. Tự động chuyển sang bản nhạc mẫu trực tiếp.",
        });
        if (directFallback && directFallback.id !== currentTrackObj.id) {
          setTimeout(() => {
            const audio = audioRef.current;
            if (audio) {
              dispatch({ type: "SELECT_TRACK", track: directFallback });
              const fallbackSource = getTrackAudioUrl(directFallback);
              if (fallbackSource) {
                audio.pause();
                audio.crossOrigin = "anonymous";
                audio.src = fallbackSource;
                audio.load();
                void audio.play().catch(() => undefined);
              }
            }
          }, 1000);
        }
      } else {
        dispatch({
          type: "SET_ERROR",
          value: reason || "Không thể phát nguồn này. Hãy kiểm tra URL, CORS hoặc thử một bài khác.",
        });
      }
    }
  }, []);

  const loadTrack = useCallback(
    async (track: MusicTrack, autoplay: boolean) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      dispatch({ type: "SELECT_TRACK", track });
      const source = getTrackAudioUrl(track);

      if (!source) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        dispatch({
          type: "SET_ERROR",
          value: "Track mẫu chưa có URL. Hãy gắn URL R2 hoặc MP3 trong biến môi trường.",
        });
        return;
      }

      audio.pause();
      audio.crossOrigin = "anonymous";
      audio.src = source;
      audio.load();
      syncTimeline(audio);

      if (autoplay) {
        dispatch({ type: "SET_BUFFERING", value: true });
        try {
          await ensureAudioGraph();
          await audio.play();
          retryCountRef.current = 0;
        } catch {
          handleAudioError();
        }
      }
    },
    [ensureAudioGraph, handleAudioError, syncTimeline],
  );

  const moveInQueue = useCallback(
    (offset: number, autoplay = true) => {
      const snapshot = stateRef.current;
      if (!snapshot.queue.length) {
        return;
      }

      const currentIndex = Math.max(
        0,
        snapshot.queue.findIndex((track) => track.id === snapshot.currentId),
      );
      const nextIndex = (currentIndex + offset + snapshot.queue.length) % snapshot.queue.length;
      void loadTrack(snapshot.queue[nextIndex], autoplay);
    },
    [loadTrack],
  );

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    const track = stateRef.current.queue.find((item) => item.id === stateRef.current.currentId);
    if (!audio || !track) {
      return;
    }

    if (audio.paused) {
      if (!getTrackAudioUrl(track)) {
        dispatch({
          type: "SET_ERROR",
          value: "Track mẫu chưa có URL. Hãy tìm một bài trên YouTube Music hoặc thêm URL R2.",
        });
        return;
      }

      dispatch({ type: "SET_BUFFERING", value: true });
      try {
        await ensureAudioGraph();
        await audio.play();
        retryCountRef.current = 0;
      } catch {
        handleAudioError("Trình duyệt không thể bắt đầu phát. Hãy thử chọn lại bài hát.");
      }
    } else {
      audio.pause();
    }
  }, [ensureAudioGraph, handleAudioError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const initialTrack = stateRef.current.queue.find(
      (track) => track.id === stateRef.current.currentId,
    );
    const initialSource = initialTrack ? getTrackAudioUrl(initialTrack) : "";
    if (initialSource) {
      audio.crossOrigin = "anonymous";
      audio.src = initialSource;
      audio.load();
    }

    const onPlay = () => {
      retryCountRef.current = 0;
      dispatch({ type: "SET_PLAYING", value: true });
      dispatch({ type: "SET_BUFFERING", value: false });
      dispatch({ type: "SET_ERROR", value: null });
    };
    const onPause = () => dispatch({ type: "SET_PLAYING", value: false });
    const onWaiting = () => dispatch({ type: "SET_BUFFERING", value: true });
    const onCanPlay = () => dispatch({ type: "SET_BUFFERING", value: false });
    const onTimeUpdate = () => syncTimeline(audio);
    const onLoadedMetadata = () => {
      const snapshot = stateRef.current;
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        dispatch({
          type: "UPDATE_DURATION",
          id: snapshot.currentId,
          duration: audio.duration,
        });
      }
      syncTimeline(audio);
    };
    const onEnded = () => moveInQueue(1, true);
    const onError = () => handleAudioError();

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [handleAudioError, moveInQueue, syncTimeline]);

  useEffect(() => {
    if (!currentTrack) {
      return;
    }

    dispatch({ type: "SET_ACCENT", value: currentTrack.accentFallback });
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          return;
        }

        canvas.width = 28;
        canvas.height = 28;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let red = 0;
        let green = 0;
        let blue = 0;
        let weight = 0;

        for (let index = 0; index < pixels.length; index += 16) {
          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];
          const alpha = pixels[index + 3] / 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          const brightness = (r + g + b) / 3;
          if (alpha < 0.5 || brightness < 24 || brightness > 238 || saturation < 0.12) {
            continue;
          }

          const sampleWeight = alpha * (0.4 + saturation);
          red += r * sampleWeight;
          green += g * sampleWeight;
          blue += b * sampleWeight;
          weight += sampleWeight;
        }

        if (weight > 0) {
          const color = `rgb(${Math.round(red / weight)} ${Math.round(green / weight)} ${Math.round(
            blue / weight,
          )})`;
          dispatch({ type: "SET_ACCENT", value: color });
        }
      } catch {
        dispatch({ type: "SET_ACCENT", value: currentTrack.accentFallback });
      }
    };

    image.onerror = () => {
      dispatch({ type: "SET_ACCENT", value: currentTrack.accentFallback });
    };
    image.src = currentTrack.artwork;
  }, [currentTrack]);

  useEffect(() => {
    if (!currentTrack) {
      return;
    }

    const source = getTrackAudioUrl(currentTrack);
    if (!source || currentTrack.duration <= 0) {
      dispatch({ type: "LYRICS_EMPTY" });
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      track_name: currentTrack.title,
      artist_name: currentTrack.artist,
      album_name: currentTrack.album,
      duration: Math.round(currentTrack.duration).toString(),
    });
    dispatch({ type: "LYRICS_START" });

    fetch(`/api/lyrics?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) {
          dispatch({ type: "LYRICS_EMPTY" });
          return;
        }
        if (!response.ok) {
          dispatch({ type: "LYRICS_ERROR" });
          return;
        }

        const payload = (await response.json()) as {
          instrumental: boolean;
          plainLyrics: string | null;
          syncedLyrics: string | null;
        };
        dispatch({
          type: "LYRICS_SUCCESS",
          instrumental: payload.instrumental,
          lines: parseSyncedLyrics(payload.syncedLyrics),
          plainLyrics: payload.plainLyrics,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        dispatch({ type: "LYRICS_ERROR" });
      });

    return () => controller.abort();
  }, [currentTrack]);

  useEffect(() => {
    if (!state.expanded) {
      return;
    }

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dispatch({ type: "SET_EXPANDED", value: false });
        return;
      }

      if (event.key !== "Tab" || !overlayRef.current) {
        return;
      }

      const focusable = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [state.expanded]);

  useEffect(() => {
    if (state.lyrics.activeIndex < 0 || !state.lyricsOpen) {
      return;
    }

    activeLyricElementRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
    });
  }, [prefersReducedMotion, state.lyrics.activeIndex, state.lyricsOpen]);

  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [{ src: currentTrack.artwork, sizes: "512x512" }],
      });
      navigator.mediaSession.setActionHandler("play", () => void togglePlayback());
      navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
      navigator.mediaSession.setActionHandler("previoustrack", () => moveInQueue(-1, true));
      navigator.mediaSession.setActionHandler("nexttrack", () => moveInQueue(1, true));
    } catch {
      return;
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      } catch {
        return;
      }
    };
  }, [currentTrack, moveInQueue, togglePlayback]);

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = Number(event.currentTarget.value);
    syncTimeline(audio);
  };

  const handleVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.volume = Number(event.currentTarget.value);
    event.currentTarget.style.setProperty("--track-progress", `${audio.volume * 100}%`);
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = state.searchQuery.trim();
    if (query.length < 2) {
      dispatch({ type: "SEARCH_ERROR" });
      return;
    }

    dispatch({ type: "SEARCH_START" });
    try {
      const response = await fetch(`/api/yt-search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        dispatch({ type: "SEARCH_ERROR" });
        return;
      }

      const payload = (await response.json()) as { items: SearchItem[] };
      dispatch({ type: "SEARCH_SUCCESS", items: payload.items ?? [] });
    } catch {
      dispatch({ type: "SEARCH_ERROR" });
    }
  };

  const selectSearchItem = (item: SearchItem) => {
    const track: MusicTrack = {
      id: `youtube-${item.videoId}`,
      title: item.title,
      artist: item.artist,
      album: "YouTube Music",
      artwork: item.thumbnail,
      duration: item.duration,
      accentFallback: deterministicAccent(item.videoId),
      source: { kind: "youtube", videoId: item.videoId },
    };
    void loadTrack(track, true);
  };

  const hubStyle = { "--music-accent": state.accent } as CSSProperties;
  const displayDuration = currentTrack?.duration ?? 0;

  const renderLyrics = () => {
    if (state.lyrics.status === "loading") {
      return (
        <div className={styles.lyricsMessage}>
          <LoaderCircle aria-hidden="true" className={styles.spinner} size={24} />
          <span>Đang tìm lời khớp với bản nhạc</span>
        </div>
      );
    }

    if (state.lyrics.status === "error") {
      return <p className={styles.lyricsMessage}>Dịch vụ lời bài hát đang bận. Nhạc vẫn phát bình thường.</p>;
    }

    if (state.lyrics.status === "empty" || state.lyrics.status === "idle") {
      return <p className={styles.lyricsMessage}>Chưa có lời đồng bộ cho bản nhạc này.</p>;
    }

    if (state.lyrics.instrumental) {
      return <p className={styles.lyricsMessage}>Bản nhạc không lời. Cứ để âm thanh trôi.</p>;
    }

    if (state.lyrics.lines.length) {
      return state.lyrics.lines.map((line, index) => (
        <p
          className={index === state.lyrics.activeIndex ? styles.activeLyric : undefined}
          key={`${line.time}-${index}`}
          ref={index === state.lyrics.activeIndex ? activeLyricElementRef : undefined}
        >
          {line.text}
        </p>
      ));
    }

    return (state.lyrics.plainLyrics || "Chưa có lời bài hát.")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line, index) => <p key={`${line}-${index}`}>{line}</p>);
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <div className={styles.hub} style={hubStyle}>
      <audio ref={audioRef} crossOrigin="anonymous" preload="metadata" />
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.ambientSecondary} aria-hidden="true" />

      <section className={styles.shell} aria-labelledby="music-hub-title">
        <motion.div
          className={styles.intro}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={revealVariants}
        >
          <div>
            <span className={styles.kicker}>Personal frequency</span>
            <h1 id="music-hub-title">Nhạc giữa đêm.</h1>
          </div>
          <div className={styles.introAside}>
            <p>Kho nhạc riêng, tìm kiếm nhanh và một player luôn ở đúng nhịp của bạn.</p>
            <Link href="/#portals" className={styles.backLink}>
              <ArrowLeft aria-hidden="true" size={17} />
              Trở về cổng chính
            </Link>
          </div>
        </motion.div>

        <motion.div
          className={styles.stage}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={revealVariants}
        >
          <div className={styles.nowPlaying}>
            <div className={styles.stageLabel}>
              <span>Đang chọn</span>
              <span>{currentTrack.source.kind === "youtube" ? "YouTube Music" : "Personal archive"}</span>
            </div>

            <motion.button
              type="button"
              className={styles.coverButton}
              onClick={() => dispatch({ type: "SET_EXPANDED", value: true })}
              aria-label="Mở player toàn màn hình"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.012 }}
              whileTap={{ scale: 0.988 }}
            >
              <motion.div className={styles.coverFrame} layoutId="music-cover">
                <img src={currentTrack.artwork} alt={`Bìa của ${currentTrack.title}`} crossOrigin="anonymous" />
                <div className={styles.coverShade} />
                <div className={styles.coverVisualizer}>
                  <AudioVisualizer
                    analyser={analyser}
                    active={state.playing}
                    reducedMotion={prefersReducedMotion}
                  />
                </div>
              </motion.div>
            </motion.button>

            <div className={styles.nowMeta}>
              <div>
                <h2>{currentTrack.title}</h2>
                <p>
                  {currentTrack.artist} <span aria-hidden="true">·</span> {currentTrack.album}
                </p>
              </div>
              <button
                type="button"
                className={styles.roundButton}
                onClick={() => void togglePlayback()}
                aria-label={state.playing ? "Tạm dừng" : "Phát nhạc"}
              >
                <PlayStateIcon buffering={state.buffering} playing={state.playing} />
              </button>
            </div>
          </div>

          <aside className={styles.discovery} aria-label="Khám phá và thư viện nhạc">
            <div className={styles.discoveryHeader}>
              <div>
                <h2>Tìm một tần số.</h2>
              </div>
              <Headphones aria-hidden="true" size={25} strokeWidth={1.4} />
            </div>

            <form className={styles.searchForm} onSubmit={handleSearch} role="search">
              <Search aria-hidden="true" size={19} />
              <input
                value={state.searchQuery}
                onChange={(event) => dispatch({ type: "SET_SEARCH_QUERY", value: event.target.value })}
                placeholder="Tên bài hát hoặc nghệ sĩ"
                aria-label="Tìm trên YouTube Music"
              />
              <button type="submit" disabled={state.searchStatus === "loading"}>
                {state.searchStatus === "loading" ? (
                  <LoaderCircle aria-hidden="true" className={styles.spinner} size={19} />
                ) : (
                  "Tìm"
                )}
              </button>
            </form>

            <div className={styles.sourceNote}>
              <Sparkles aria-hidden="true" size={15} />
              <span>Tìm kiếm qua Piped. Nhạc cá nhân phát trực tiếp từ URL của bạn.</span>
            </div>

            <div className={styles.trackList} aria-live="polite">
              {state.searchStatus === "ready" ? (
                <>
                  <div className={styles.listTitle}>
                    <span>Kết quả tìm kiếm</span>
                    <button type="button" onClick={() => dispatch({ type: "CLEAR_SEARCH" })}>
                      Xóa
                    </button>
                  </div>
                  {state.searchItems.map((item, index) => (
                    <button
                      type="button"
                      className={styles.trackRow}
                      onClick={() => selectSearchItem(item)}
                      key={item.videoId}
                    >
                      <span className={styles.trackIndex}>{String(index + 1).padStart(2, "0")}</span>
                      <img src={item.thumbnail} alt="" />
                      <span className={styles.trackCopy}>
                        <strong>{item.title}</strong>
                        <span>{item.artist}</span>
                      </span>
                      <span className={styles.trackDuration}>{formatTime(item.duration)}</span>
                      <Play aria-hidden="true" size={17} />
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <div className={styles.listTitle}>
                    <span>Trong thư viện</span>
                    <span>{state.queue.length.toString().padStart(2, "0")} tracks</span>
                  </div>
                  {state.queue.map((track, index) => {
                    const selected = track.id === currentTrack.id;
                    const available = Boolean(getTrackAudioUrl(track));
                    return (
                      <button
                        type="button"
                        className={`${styles.trackRow} ${selected ? styles.trackRowActive : ""}`}
                        onClick={() => void loadTrack(track, true)}
                        key={track.id}
                        aria-current={selected ? "true" : undefined}
                      >
                        <span className={styles.trackIndex}>
                          {selected && state.playing ? (
                            <Music2 aria-hidden="true" size={16} />
                          ) : (
                            String(index + 1).padStart(2, "0")
                          )}
                        </span>
                        <img src={track.artwork} alt="" crossOrigin="anonymous" />
                        <span className={styles.trackCopy}>
                          <strong>{track.title}</strong>
                          <span>{track.artist}</span>
                        </span>
                        <span className={styles.trackDuration}>{available ? formatTime(track.duration) : "Gắn URL"}</span>
                        {selected && state.playing ? (
                          <Pause aria-hidden="true" size={17} />
                        ) : (
                          <Play aria-hidden="true" size={17} />
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {state.searchStatus === "loading" ? (
                <div className={styles.listMessage}>
                  <LoaderCircle aria-hidden="true" className={styles.spinner} size={20} />
                  Đang lắng nghe tín hiệu
                </div>
              ) : null}
              {state.searchStatus === "empty" ? (
                <p className={styles.listMessage}>Không thấy kết quả phù hợp. Hãy thử từ khóa khác.</p>
              ) : null}
              {state.searchStatus === "error" ? (
                <p className={styles.listMessage}>Không thể tìm lúc này. Kiểm tra cấu hình Piped rồi thử lại.</p>
              ) : null}
            </div>
          </aside>
        </motion.div>
      </section>

      <AnimatePresence>
        {state.error ? (
          <motion.div
            className={styles.toast}
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <span>{state.error}</span>
            <button type="button" onClick={() => dispatch({ type: "SET_ERROR", value: null })}>
              <X aria-hidden="true" size={17} />
              <span className={styles.srOnly}>Đóng thông báo</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className={styles.miniPlayer} aria-label="Trình phát nhạc thu gọn">
        <div className={styles.miniTrack}>
          <img src={currentTrack.artwork} alt="" crossOrigin="anonymous" />
          <div>
            <strong>{currentTrack.title}</strong>
            <span>{currentTrack.artist}</span>
          </div>
        </div>

        <div className={styles.miniTransport}>
          <div className={styles.transportButtons}>
            <button type="button" onClick={() => moveInQueue(-1)} aria-label="Bài trước">
              <SkipBack aria-hidden="true" size={18} fill="currentColor" />
            </button>
            <button
              type="button"
              className={styles.primaryControl}
              onClick={() => void togglePlayback()}
              aria-label={state.playing ? "Tạm dừng" : "Phát nhạc"}
            >
              <PlayStateIcon buffering={state.buffering} playing={state.playing} />
            </button>
            <button type="button" onClick={() => moveInQueue(1)} aria-label="Bài tiếp theo">
              <SkipForward aria-hidden="true" size={18} fill="currentColor" />
            </button>
          </div>
          <div className={styles.miniTimeline}>
            <span ref={collapsedTimeRef}>0:00</span>
            <input
              ref={collapsedProgressRef}
              type="range"
              min="0"
              max={displayDuration || 1}
              defaultValue="0"
              onChange={handleSeek}
              aria-label="Tiến độ bài hát"
            />
            <span ref={collapsedDurationRef}>{formatTime(displayDuration)}</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.expandButton}
          onClick={() => dispatch({ type: "SET_EXPANDED", value: true })}
          aria-label="Mở player toàn màn hình"
        >
          <Maximize2 aria-hidden="true" size={19} />
        </button>
      </div>

      <AnimatePresence>
        {state.expanded ? (
          <motion.div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={`Đang phát ${currentTrack.title}`}
            ref={overlayRef}
            variants={overlayVariants}
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            exit="exit"
          >
            <div className={styles.overlayAmbient} aria-hidden="true" />
            <header className={styles.overlayHeader}>
              <div>
                <Disc3 aria-hidden="true" size={19} />
                <span>Darling frequencies</span>
              </div>
              <button
                type="button"
                ref={closeButtonRef}
                onClick={() => dispatch({ type: "SET_EXPANDED", value: false })}
              >
                <Minimize2 aria-hidden="true" size={19} />
                Thu gọn
              </button>
            </header>

            <div className={`${styles.fullPlayer} ${state.lyricsOpen ? styles.fullPlayerWithLyrics : ""}`}>
              <div className={styles.vinylStage}>
                <motion.div
                  className={styles.vinyl}
                  animate={
                    state.playing && !prefersReducedMotion ? { rotate: 360 } : { rotate: 0 }
                  }
                  transition={
                    state.playing && !prefersReducedMotion
                      ? { duration: 16, ease: "linear", repeat: Infinity }
                      : { duration: 0.5 }
                  }
                >
                  <img src={currentTrack.artwork} alt={`Bìa của ${currentTrack.title}`} crossOrigin="anonymous" />
                  <span aria-hidden="true" />
                </motion.div>

                {!prefersReducedMotion && state.playing ? (
                  <div className={styles.notes} aria-hidden="true">
                    {[0, 1, 2, 3].map((item) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, y: 12, scale: 0.8 }}
                        animate={{ opacity: [0, 0.55, 0], y: [12, -38, -80], x: [0, item % 2 ? 18 : -18] }}
                        transition={{ duration: 5.5 + item, delay: item * 0.9, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Music2 size={16 + item * 2} />
                      </motion.span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className={styles.fullControls}>
                <div className={styles.fullMeta}>
                  <h2>{currentTrack.title}</h2>
                  <p>{currentTrack.artist}</p>
                </div>

                <div className={styles.fullVisualizer}>
                  <AudioVisualizer
                    analyser={analyser}
                    active={state.playing}
                    reducedMotion={prefersReducedMotion}
                  />
                </div>

                <div className={styles.fullTimeline}>
                  <input
                    ref={expandedProgressRef}
                    type="range"
                    min="0"
                    max={displayDuration || 1}
                    defaultValue="0"
                    onChange={handleSeek}
                    aria-label="Tiến độ bài hát"
                  />
                  <div>
                    <span ref={expandedTimeRef}>0:00</span>
                    <span ref={expandedDurationRef}>{formatTime(displayDuration)}</span>
                  </div>
                </div>

                <div className={styles.fullTransport}>
                  <button type="button" onClick={() => moveInQueue(-1)} aria-label="Bài trước">
                    <SkipBack aria-hidden="true" size={23} fill="currentColor" />
                  </button>
                  <button
                    type="button"
                    className={styles.fullPlay}
                    onClick={() => void togglePlayback()}
                    aria-label={state.playing ? "Tạm dừng" : "Phát nhạc"}
                  >
                    <PlayStateIcon buffering={state.buffering} playing={state.playing} />
                  </button>
                  <button type="button" onClick={() => moveInQueue(1)} aria-label="Bài tiếp theo">
                    <SkipForward aria-hidden="true" size={23} fill="currentColor" />
                  </button>
                </div>

                <div className={styles.utilityControls}>
                  <label>
                    <Volume2 aria-hidden="true" size={18} />
                    <span className={styles.srOnly}>Âm lượng</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      defaultValue="1"
                      onChange={handleVolume}
                      aria-label="Âm lượng"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_LYRICS_OPEN", value: !state.lyricsOpen })}
                    aria-expanded={state.lyricsOpen}
                  >
                    <ListMusic aria-hidden="true" size={18} />
                    Lời bài hát
                    <ChevronUp
                      aria-hidden="true"
                      className={state.lyricsOpen ? styles.chevronOpen : undefined}
                      size={16}
                    />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {state.lyricsOpen ? (
                  <motion.aside
                    className={styles.lyricsPanel}
                    aria-label="Lời bài hát"
                    initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 18 }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={styles.lyricsHeader}>
                      <div>
                        <h3>Lời bài hát</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "SET_LYRICS_OPEN", value: false })}
                        aria-label="Đóng lời bài hát"
                      >
                        <X aria-hidden="true" size={18} />
                      </button>
                    </div>
                    <div className={styles.lyricsScroll}>{renderLyrics()}</div>
                  </motion.aside>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
