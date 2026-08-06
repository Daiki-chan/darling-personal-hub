"use client";

import { useEffect, useRef } from "react";
import {
  Captions,
  ChevronDown,
  ChevronUp,
  Heart,
  ListMusic,
  LoaderCircle,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatTime } from "@/lib/music/format";
import { LyricsPanel } from "./lyrics-panel";
import { useMusicPlayer, usePlaybackClock } from "./music-player-core";
import { QueuePanel } from "./queue-panel";
import { SimulatedVisualizer } from "./simulated-visualizer";
import { YouTubeVideoStage } from "./youtube-video-stage";
import styles from "./music-app.module.css";

function ProgressControl() {
  const { seek, state } = useMusicPlayer();
  const { currentTime, duration: clockDuration } = usePlaybackClock();
  const duration = clockDuration || state.duration || 0;
  const progress = duration ? Math.min(100, currentTime / duration * 100) : 0;
  return (
    <div className={styles.progressControl}>
      <input
        aria-label="Vị trí phát"
        disabled={!duration}
        max={duration || 1}
        min="0"
        onChange={(event) => seek(Number(event.currentTarget.value))}
        style={{ "--progress": `${progress}%` } as React.CSSProperties}
        type="range"
        value={Math.min(currentTime, duration || 1)}
      />
      <div><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
    </div>
  );
}

export function PlayerDock() {
  const {
    next,
    previous,
    setExpanded,
    setMuted,
    setPanel,
    setVolume,
    state,
    toggleFavorite,
    togglePlayback,
    toggleRepeat,
    toggleShuffle,
  } = useMusicPlayer();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const track = state.currentTrack;
  const favorite = track ? state.favorites.some((item) => item.videoId === track.videoId) : false;

  useEffect(() => {
    if (!state.expanded) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [state.expanded]);

  if (!track) return null;
  const queueHasNavigation = state.queue.length > 1;
  const buffering = state.status === "loading" || state.status === "buffering";

  return (
    <section
      aria-label={state.expanded ? "Trình phát mở rộng" : "Trình phát thu gọn"}
      aria-modal={state.expanded || undefined}
      className={`${styles.playerDock} ${state.expanded ? styles.playerDockExpanded : ""}`}
      role={state.expanded ? "dialog" : "region"}
    >
      <div className={styles.dockAmbient} aria-hidden="true" />
      <div className={styles.dockShell}>
        <div className={styles.videoColumn}>
          <YouTubeVideoStage />
          {state.expanded ? <SimulatedVisualizer /> : null}
        </div>

        <div className={styles.controlColumn}>
          <div className={styles.dockHeader}>
            <div className={styles.nowPlaying}>
              <img alt="" height="52" src={track.thumbnail} width="52" />
              <div>
                <strong title={track.title}>{track.title}</strong>
                <span>{track.artist}</span>
              </div>
            </div>
            <button
              aria-label={favorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              aria-pressed={favorite}
              className={favorite ? styles.controlActive : undefined}
              onClick={() => toggleFavorite(track)}
              type="button"
            >
              <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} size={18} />
            </button>
            <button
              aria-label={state.expanded ? "Thu gọn trình phát" : "Mở trình phát"}
              onClick={() => setExpanded(!state.expanded)}
              ref={closeButtonRef}
              type="button"
            >
              {state.expanded ? <ChevronDown aria-hidden="true" size={21} /> : <ChevronUp aria-hidden="true" size={21} />}
            </button>
          </div>

          <ProgressControl />

          <div className={styles.transport}>
            <button
              aria-label="Phát ngẫu nhiên"
              aria-pressed={state.shuffleEnabled}
              className={state.shuffleEnabled ? styles.controlActive : undefined}
              disabled={!queueHasNavigation}
              onClick={toggleShuffle}
              type="button"
            ><Shuffle aria-hidden="true" size={18} /></button>
            <button aria-label="Bài trước" disabled={!queueHasNavigation} onClick={previous} type="button">
              <SkipBack aria-hidden="true" fill="currentColor" size={22} />
            </button>
            <button
              aria-label={state.isPlaying ? "Tạm dừng" : "Phát"}
              className={styles.playButton}
              onClick={togglePlayback}
              type="button"
            >
              {buffering ? (
                <LoaderCircle aria-hidden="true" className={styles.spinner} size={24} />
              ) : state.isPlaying ? (
                <Pause aria-hidden="true" fill="currentColor" size={24} />
              ) : (
                <Play aria-hidden="true" fill="currentColor" size={24} />
              )}
            </button>
            <button aria-label="Bài tiếp theo" disabled={!queueHasNavigation} onClick={() => next()} type="button">
              <SkipForward aria-hidden="true" fill="currentColor" size={22} />
            </button>
            <button
              aria-label={`Lặp: ${state.repeatMode}`}
              aria-pressed={state.repeatMode !== "off"}
              className={state.repeatMode !== "off" ? styles.controlActive : undefined}
              disabled={!state.queue.length}
              onClick={toggleRepeat}
              type="button"
            >
              {state.repeatMode === "one" ? <Repeat1 aria-hidden="true" size={18} /> : <Repeat aria-hidden="true" size={18} />}
            </button>
          </div>

          <div className={styles.dockUtilities}>
            <button aria-label={state.isMuted ? "Bật âm thanh" : "Tắt âm thanh"} onClick={() => setMuted(!state.isMuted)} type="button">
              {state.isMuted ? <VolumeX aria-hidden="true" size={17} /> : <Volume2 aria-hidden="true" size={17} />}
            </button>
            <input
              aria-label="Âm lượng"
              max="1"
              min="0"
              onChange={(event) => setVolume(Number(event.currentTarget.value))}
              step="0.01"
              type="range"
              value={state.volume}
            />
            <span>{state.status === "error" ? "Không thể phát" : state.status === "playing" ? "Đang phát" : "Sẵn sàng"}</span>
          </div>
        </div>

        {state.expanded ? (
          <div className={styles.expandedPanel}>
            <div className={styles.panelTabs} role="tablist" aria-label="Nội dung trình phát">
              <button
                aria-selected={state.panel === "lyrics"}
                className={state.panel === "lyrics" ? styles.tabActive : undefined}
                onClick={() => setPanel("lyrics")}
                role="tab"
                type="button"
              ><Captions aria-hidden="true" size={17} />Lời bài hát</button>
              <button
                aria-selected={state.panel === "queue"}
                className={state.panel === "queue" ? styles.tabActive : undefined}
                onClick={() => setPanel("queue")}
                role="tab"
                type="button"
              ><ListMusic aria-hidden="true" size={17} />Hàng đợi</button>
            </div>
            <div className={styles.panelBody} role="tabpanel">
              {state.panel === "lyrics" ? <LyricsPanel /> : <QueuePanel compact />}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
