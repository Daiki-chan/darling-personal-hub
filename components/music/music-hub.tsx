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
  VolumeX,
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
import { YTIFrameEngine } from "@/components/music/yt-iframe-engine";
import {
  findActiveLyricIndex,
  formatTime,
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
  currentTime: number;
  duration: number;
  error: string | null;
  expanded: boolean;
  lyricsOpen: boolean;
  lyrics: LyricsState;
  playing: boolean;
  queue: MusicTrack[];
  searchItems: SearchItem[];
  searchQuery: string;
  searchStatus: "idle" | "loading" | "ready" | "empty" | "error";
  seekTarget: number | null;
  volume: number;
};

type PlayerAction =
  | { type: "SELECT_TRACK"; track: MusicTrack }
  | { type: "SET_PLAYING"; value: boolean }
  | { type: "SET_BUFFERING"; value: boolean }
  | { type: "SET_PLAYSTATE"; playing: boolean; buffering: boolean }
  | { type: "SET_TIME"; currentTime: number; duration: number }
  | { type: "SET_SEEK_TARGET"; value: number | null }
  | { type: "SET_VOLUME"; value: number }
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
  | { type: "SET_ACTIVE_LYRIC"; value: number };

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
  currentTime: 0,
  duration: personalTracks[0]?.duration ?? 0,
  error: null,
  expanded: false,
  lyricsOpen: false,
  lyrics: initialLyrics,
  playing: false,
  queue: personalTracks,
  searchItems: [],
  searchQuery: "",
  searchStatus: "idle",
  seekTarget: null,
  volume: 0.9,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "SELECT_TRACK": {
      const alreadyQueued = state.queue.some((track) => track.id === action.track.id);
      return {
        ...state,
        currentId: action.track.id,
        currentTime: 0,
        duration: action.track.duration || 0,
        error: null,
        lyrics: initialLyrics,
        playing: true,
        buffering: true,
        queue: alreadyQueued ? state.queue : [...state.queue, action.track],
        seekTarget: null,
      };
    }
    case "SET_PLAYING":
      return { ...state, playing: action.value };
    case "SET_BUFFERING":
      return { ...state, buffering: action.value };
    case "SET_PLAYSTATE":
      return { ...state, playing: action.playing, buffering: action.buffering };
    case "SET_TIME":
      return {
        ...state,
        currentTime: action.currentTime,
        duration: action.duration > 0 ? action.duration : state.duration,
      };
    case "SET_SEEK_TARGET":
      return { ...state, seekTarget: action.value };
    case "SET_VOLUME":
      return { ...state, volume: action.value };
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
  const prefersReducedMotion = Boolean(useReducedMotion());
  const lyricsLinesRef = useRef<SyncedLyricLine[]>([]);
  const activeLyricRef = useRef(-1);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeLyricElementRef = useRef<HTMLParagraphElement>(null);

  lyricsLinesRef.current = state.lyrics.lines;

  const currentTrack = useMemo(
    () => state.queue.find((track) => track.id === state.currentId) ?? state.queue[0],
    [state.currentId, state.queue],
  );

  // Sync lyrics active line
  useEffect(() => {
    const nextActive = findActiveLyricIndex(lyricsLinesRef.current, state.currentTime);
    if (nextActive !== activeLyricRef.current) {
      activeLyricRef.current = nextActive;
      dispatch({ type: "SET_ACTIVE_LYRIC", value: nextActive });
    }
  }, [state.currentTime]);

  const selectTrack = useCallback((track: MusicTrack) => {
    dispatch({ type: "SELECT_TRACK", track });
  }, []);

  const moveInQueue = useCallback(
    (offset: number) => {
      if (!state.queue.length) return;
      const currentIndex = Math.max(
        0,
        state.queue.findIndex((track) => track.id === state.currentId),
      );
      const nextIndex = (currentIndex + offset + state.queue.length) % state.queue.length;
      selectTrack(state.queue[nextIndex]);
    },
    [selectTrack, state.currentId, state.queue],
  );

  const togglePlayback = useCallback(() => {
    dispatch({ type: "SET_PLAYING", value: !state.playing });
  }, [state.playing]);

  // Extract color accent from artwork
  useEffect(() => {
    if (!currentTrack) return;

    dispatch({ type: "SET_ACCENT", value: currentTrack.accentFallback });
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;

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

  // Fetch LRCLIB Synced Lyrics
  useEffect(() => {
    if (!currentTrack) return;

    const controller = new AbortController();
    const params = new URLSearchParams({
      track_name: currentTrack.title,
      artist_name: currentTrack.artist,
      album_name: currentTrack.album,
      duration: Math.round(currentTrack.duration || state.duration || 0).toString(),
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

  // Keyboard navigation for expanded view
  useEffect(() => {
    if (!state.expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dispatch({ type: "SET_EXPANDED", value: false });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [state.expanded]);

  // Auto scroll synced lyrics line into view
  useEffect(() => {
    if (state.lyrics.activeIndex < 0 || !state.lyricsOpen) return;

    activeLyricElementRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
    });
  }, [prefersReducedMotion, state.lyrics.activeIndex, state.lyricsOpen]);

  // MediaSession integration
  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [{ src: currentTrack.artwork, sizes: "512x512" }],
      });
      navigator.mediaSession.setActionHandler("play", () => dispatch({ type: "SET_PLAYING", value: true }));
      navigator.mediaSession.setActionHandler("pause", () => dispatch({ type: "SET_PLAYING", value: false }));
      navigator.mediaSession.setActionHandler("previoustrack", () => moveInQueue(-1));
      navigator.mediaSession.setActionHandler("nexttrack", () => moveInQueue(1));
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
  }, [currentTrack, moveInQueue]);

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetSeconds = Number(event.currentTarget.value);
    dispatch({ type: "SET_SEEK_TARGET", value: targetSeconds });
  };

  const handleVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.currentTarget.value);
    dispatch({ type: "SET_VOLUME", value: nextVolume });
    event.currentTarget.style.setProperty("--track-progress", `${nextVolume * 100}%`);
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
    selectTrack(track);
  };

  const hubStyle = { "--music-accent": state.accent } as CSSProperties;
  const progressPercent =
    state.duration > 0 ? Math.min(100, (state.currentTime / state.duration) * 100) : 0;

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
      return <p className={styles.lyricsMessage}>Chưa có lời bài hát cho bản nhạc này.</p>;
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

  if (!currentTrack) return null;

  return (
    <div className={styles.hub} style={hubStyle}>
      <YTIFrameEngine
        currentTrack={currentTrack}
        isPlaying={state.playing}
        onEnded={() => moveInQueue(1)}
        onError={(msg) => dispatch({ type: "SET_ERROR", value: msg })}
        onPlayStateChange={(playing, buffering) =>
          dispatch({ type: "SET_PLAYSTATE", playing, buffering })
        }
        onTimeUpdate={(currentTime, duration) =>
          dispatch({ type: "SET_TIME", currentTime, duration })
        }
        seekTarget={state.seekTarget}
        volume={state.volume}
      />

      <div className={styles.glow} aria-hidden="true" />

      <div className="layout-shell">
        <motion.div
          animate="visible"
          className={styles.header}
          initial="hidden"
          variants={revealVariants}
        >
          <div className={styles.headerTop}>
            <Link className={styles.backLink} href="/">
              <ArrowLeft aria-hidden="true" size={18} />
              <span>Quay lại cổng chính</span>
            </Link>

            <div className={styles.headerBadge}>
              <Sparkles aria-hidden="true" size={14} />
              <span>YouTube Music Engine</span>
            </div>
          </div>

          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIcon}>
              <Headphones aria-hidden="true" size={28} />
            </div>
            <div>
              <h1 className={styles.title}>Âm nhạc</h1>
              <p className={styles.subtitle}>
                Không gian âm thanh cá nhân. Tìm kiếm bài hát trên YouTube Music hoặc lắng nghe các bản nhạc mẫu.
              </p>
            </div>
          </div>

          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchInputWrapper}>
              <Search aria-hidden="true" className={styles.searchIcon} size={18} />
              <input
                className={styles.searchInput}
                onChange={(e) => dispatch({ type: "SET_SEARCH_QUERY", value: e.target.value })}
                placeholder="Tìm bài hát, nghệ sĩ trên YouTube Music..."
                type="text"
                value={state.searchQuery}
              />
              {state.searchQuery ? (
                <button
                  className={styles.clearSearch}
                  onClick={() => dispatch({ type: "SET_SEARCH_QUERY", value: "" })}
                  type="button"
                >
                  <X aria-hidden="true" size={16} />
                </button>
              ) : null}
            </div>
            <button className={styles.searchButton} type="submit">
              Tìm kiếm
            </button>
          </form>

          {state.searchStatus === "loading" ? (
            <div className={styles.searchStatusMessage}>
              <LoaderCircle aria-hidden="true" className={styles.spinner} size={18} />
              <span>Đang kết nối YouTube Music...</span>
            </div>
          ) : null}

          {state.searchStatus === "error" ? (
            <p className={styles.searchStatusMessage}>Không thể tìm kiếm nhạc lúc này. Hãy thử từ khóa khác.</p>
          ) : null}

          {state.searchStatus === "empty" ? (
            <p className={styles.searchStatusMessage}>Không tìm thấy kết quả phù hợp trên YouTube Music.</p>
          ) : null}

          {state.searchItems.length > 0 ? (
            <div className={styles.searchResults}>
              <h2 className={styles.sectionTitle}>Kết quả tìm kiếm</h2>
              <div className={styles.searchGrid}>
                {state.searchItems.map((item) => (
                  <button
                    className={styles.searchCard}
                    key={item.videoId}
                    onClick={() => selectSearchItem(item)}
                    type="button"
                  >
                    <img alt="" className={styles.searchArt} src={item.thumbnail} />
                    <div className={styles.searchMeta}>
                      <strong>{item.title}</strong>
                      <span>{item.artist}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </motion.div>

        <div className={styles.contentGrid}>
          <div className={styles.queueSection}>
            <h2 className={styles.sectionTitle}>
              <ListMusic aria-hidden="true" size={20} />
              <span>Danh sách phát</span>
            </h2>

            <div className={styles.queueList}>
              {state.queue.map((track) => {
                const isActive = track.id === state.currentId;
                return (
                  <button
                    className={`${styles.queueCard} ${isActive ? styles.queueCardActive : ""}`}
                    key={track.id}
                    onClick={() => selectTrack(track)}
                    type="button"
                  >
                    <img alt="" className={styles.queueArt} src={track.artwork} />
                    <div className={styles.queueMeta}>
                      <strong>{track.title}</strong>
                      <span>{track.artist}</span>
                    </div>
                    {isActive ? (
                      <span className={styles.playingIndicator}>
                        <Disc3
                          aria-hidden="true"
                          className={state.playing ? styles.spinner : undefined}
                          size={18}
                        />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.visualizerSection}>
            <div className={styles.visualizerCard}>
              <h3 className={styles.visualizerTitle}>Sóng âm & Lời nhạc</h3>
              <div className={styles.visualizerCanvasHolder}>
                <AudioVisualizer
                  active={state.playing}
                  analyser={null}
                  reducedMotion={prefersReducedMotion}
                />
              </div>
              <button
                className={styles.lyricsToggleBtn}
                onClick={() => dispatch({ type: "SET_LYRICS_OPEN", value: !state.lyricsOpen })}
                type="button"
              >
                <Music2 aria-hidden="true" size={18} />
                <span>{state.lyricsOpen ? "Ẩn lời bài hát" : "Xem lời bài hát"}</span>
              </button>

              {state.lyricsOpen ? <div className={styles.lyricsContainer}>{renderLyrics()}</div> : null}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mini Player */}
      <div className={styles.miniPlayer}>
        <div
          className={styles.miniProgressBar}
          style={{ "--track-progress": `${progressPercent}%` } as CSSProperties}
        />
        <div className={styles.miniContent}>
          <button
            className={styles.miniTrackInfo}
            onClick={() => dispatch({ type: "SET_EXPANDED", value: true })}
            type="button"
          >
            <img alt="" className={styles.miniArt} src={currentTrack.artwork} />
            <div className={styles.miniMeta}>
              <strong>{currentTrack.title}</strong>
              <span>{currentTrack.artist}</span>
            </div>
          </button>

          <div className={styles.miniControls}>
            <button
              aria-label="Bài trước"
              className={styles.miniButton}
              onClick={() => moveInQueue(-1)}
              type="button"
            >
              <SkipBack aria-hidden="true" size={20} />
            </button>
            <button
              aria-label={state.playing ? "Tạm dừng" : "Phát"}
              className={`${styles.miniButton} ${styles.miniButtonPlay}`}
              onClick={togglePlayback}
              type="button"
            >
              <PlayStateIcon buffering={state.buffering} playing={state.playing} />
            </button>
            <button
              aria-label="Bài kế tiếp"
              className={styles.miniButton}
              onClick={() => moveInQueue(1)}
              type="button"
            >
              <SkipForward aria-hidden="true" size={20} />
            </button>
          </div>

          <div className={styles.miniRightActions}>
            <div className={styles.volumeWrapper}>
              <button
                aria-label="Âm lượng"
                className={styles.miniButton}
                onClick={() => dispatch({ type: "SET_VOLUME", value: state.volume === 0 ? 0.9 : 0 })}
                type="button"
              >
                {state.volume === 0 ? (
                  <VolumeX aria-hidden="true" size={18} />
                ) : (
                  <Volume2 aria-hidden="true" size={18} />
                )}
              </button>
              <input
                aria-label="Chỉnh âm lượng"
                className={styles.volumeSlider}
                max="1"
                min="0"
                onChange={handleVolume}
                step="0.01"
                type="range"
                value={state.volume}
              />
            </div>

            <button
              aria-label="Mở rộng trình phát"
              className={styles.miniButton}
              onClick={() => dispatch({ type: "SET_EXPANDED", value: true })}
              type="button"
            >
              <ChevronUp aria-hidden="true" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Expanded Player Overlay */}
      <AnimatePresence>
        {state.expanded ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={styles.overlay}
            exit={{ opacity: 0, y: "100%" }}
            initial={{ opacity: 0, y: "100%" }}
            ref={overlayRef}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.overlayHeader}>
              <button
                aria-label="Thu nhỏ trình phát"
                className={styles.closeButton}
                onClick={() => dispatch({ type: "SET_EXPANDED", value: false })}
                ref={closeButtonRef}
                type="button"
              >
                <Minimize2 aria-hidden="true" size={20} />
              </button>
              <span className={styles.overlayBadge}>Đang phát từ YouTube Music</span>
            </div>

            <div className={styles.overlayBody}>
              <div className={styles.overlayArtWrapper}>
                <motion.div
                  animate={
                    state.playing && !prefersReducedMotion ? { rotate: 360 } : { rotate: 0 }
                  }
                  className={styles.vinylDisc}
                  transition={{ duration: 22, ease: "linear", repeat: Infinity }}
                >
                  <img alt="" className={styles.overlayArt} src={currentTrack.artwork} />
                </motion.div>
              </div>

              <div className={styles.overlayInfoGroup}>
                <h2 className={styles.overlayTitle}>{currentTrack.title}</h2>
                <p className={styles.overlayArtist}>{currentTrack.artist}</p>
                <span className={styles.overlayAlbum}>{currentTrack.album}</span>
              </div>

              <div className={styles.overlayProgressGroup}>
                <input
                  aria-label="Thanh thời gian"
                  className={styles.progressSlider}
                  max={state.duration > 0 ? state.duration : 1}
                  min="0"
                  onChange={handleSeek}
                  step="0.1"
                  style={{ "--track-progress": `${progressPercent}%` } as CSSProperties}
                  type="range"
                  value={state.currentTime}
                />
                <div className={styles.timeLabels}>
                  <span>{formatTime(state.currentTime)}</span>
                  <span>{formatTime(state.duration)}</span>
                </div>
              </div>

              <div className={styles.overlayMainControls}>
                <button
                  aria-label="Bài trước"
                  className={styles.overlayControlBtn}
                  onClick={() => moveInQueue(-1)}
                  type="button"
                >
                  <SkipBack aria-hidden="true" size={28} />
                </button>
                <button
                  aria-label={state.playing ? "Tạm dừng" : "Phát"}
                  className={`${styles.overlayControlBtn} ${styles.overlayPlayBtn}`}
                  onClick={togglePlayback}
                  type="button"
                >
                  <PlayStateIcon buffering={state.buffering} playing={state.playing} />
                </button>
                <button
                  aria-label="Bài kế tiếp"
                  className={styles.overlayControlBtn}
                  onClick={() => moveInQueue(1)}
                  type="button"
                >
                  <SkipForward aria-hidden="true" size={28} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
