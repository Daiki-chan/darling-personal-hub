"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import {
  Captions,
  ChevronDown,
  ChevronUp,
  Heart,
  ListMusic,
  LoaderCircle,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
  Power,
  Radio,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatTime } from "@/lib/music/format";
import {
  createExpandedPlayerHistoryState,
  isExpandedPlayerHistoryState,
  resolveMusicUIState,
} from "@/lib/music/player-ui";
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
  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  return (
    <div className={styles.progressControl}>
      <span className={styles.timeDigit}>{formatTime(currentTime)}</span>
      <input
        aria-label="Vị trí phát"
        disabled={!duration}
        max={duration || 1}
        min="0"
        onChange={(event) => seek(Number(event.target.value))}
        onInput={(event) => seek(Number(event.currentTarget.value))}
        style={{ "--progress": `${progress}%` } as React.CSSProperties}
        type="range"
        value={Math.min(currentTime, duration || 1)}
      />
      <span className={styles.timeDigit}>{formatTime(duration)}</span>
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
    shutdownPlayer,
    state,
    toggleAutoRadio,
    toggleFavorite,
    togglePlayback,
    toggleRepeat,
    toggleShuffle,
  } = useMusicPlayer();

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const track = state.currentTrack;
  const favorite = track ? state.favorites.some((item) => item.videoId === track.videoId) : false;
  const uiState = resolveMusicUIState(Boolean(track), state.expanded);
  const expanded = uiState === "expanded";

  const volumeDown = useCallback(() => {
    const nextVal = Math.max(0, state.volume.volume - 5);
    if (state.volume.muted) setMuted(false);
    setVolume(nextVal);
  }, [setMuted, setVolume, state.volume.muted, state.volume.volume]);

  const volumeUp = useCallback(() => {
    const nextVal = Math.min(100, state.volume.volume + 5);
    if (state.volume.muted) setMuted(false);
    setVolume(nextVal);
  }, [setMuted, setVolume, state.volume.muted, state.volume.volume]);

  const handleVolumeChange = useCallback((value: number) => {
    if (state.volume.muted && value > 0) setMuted(false);
    setVolume(value);
  }, [setMuted, setVolume, state.volume.muted]);

  const requestMinimize = useCallback(() => {
    if (isExpandedPlayerHistoryState(window.history.state)) {
      window.history.back();
      return;
    }
    setExpanded(false);
  }, [setExpanded]);

  useEffect(() => {
    if (!expanded) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;

    if (!isExpandedPlayerHistoryState(window.history.state)) {
      window.history.pushState(
        createExpandedPlayerHistoryState(window.history.state),
        "",
        window.location.href,
      );
    }
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestMinimize();
    };
    const onPopState = () => setExpanded(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [expanded, requestMinimize, setExpanded]);

  if (!track || state.isShutdown) return null;
  const queueHasNavigation = state.queue.length > 1;
  const canPlayNext = queueHasNavigation || state.autoRadioEnabled || state.repeatMode === "all";
  const buffering = state.status === "loading" || state.status === "buffering";

  const effectiveVol = state.volume.muted ? 0 : state.volume.volume;

  return (
    <>
      {expanded ? (
        <div
          aria-hidden="true"
          className={styles.expandedBackdrop}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) requestMinimize();
          }}
        />
      ) : null}
      <section
        aria-label={expanded ? "Trình phát mở rộng" : "Trình phát thu gọn"}
        aria-modal={expanded || undefined}
        className={`${styles.playerDock} ${expanded ? styles.playerDockExpanded : ""}`}
        data-ui-state={uiState}
        role={expanded ? "dialog" : "region"}
      >
        <div className={styles.dockAmbient} aria-hidden="true" />
        {expanded ? (
          <button
            aria-label="Thu nhỏ trình phát"
            className={styles.expandedClose}
            onClick={requestMinimize}
            ref={closeButtonRef}
            type="button"
          >
            <Minimize2 aria-hidden="true" size={16} />
            <span>MINIMIZE SOUNDSPACE</span>
          </button>
        ) : null}
        <div className={styles.dockShell}>
          {/* Column 1: Video Stage & Visualizer */}
          <div className={styles.videoColumn}>
            <YouTubeVideoStage />
            {expanded ? <SimulatedVisualizer /> : null}
          </div>

          {/* Column 2: Controls & Info Column */}
          <div className={styles.controlColumn}>
            <div className={styles.dockHeader}>
              <div className={styles.nowPlaying}>
                <Image alt="" height={44} sizes="44px" src={track.thumbnail} width={44} />
                <div className={styles.nowPlayingMeta}>
                  <strong title={track.title}>{track.title}</strong>
                  <span>{track.artist}</span>
                </div>
              </div>

              {/* Tertiary Actions */}
              <div className={styles.tertiaryActions}>
                <button
                  aria-label={favorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                  aria-pressed={favorite}
                  className={favorite ? styles.controlActive : undefined}
                  onClick={() => toggleFavorite(track)}
                  type="button"
                >
                  <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} size={16} />
                </button>
                <button
                  aria-label="Tắt trình phát"
                  title="Tắt trình phát"
                  onClick={shutdownPlayer}
                  type="button"
                >
                  <Power aria-hidden="true" size={16} />
                </button>
                <button
                  aria-label={expanded ? "Thu gọn trình phát" : "Mở trình phát"}
                  onClick={() => (expanded ? requestMinimize() : setExpanded(true))}
                  type="button"
                >
                  {expanded ? (
                    <ChevronDown aria-hidden="true" size={18} />
                  ) : (
                    <ChevronUp aria-hidden="true" size={18} />
                  )}
                </button>
              </div>
            </div>

            <ProgressControl />

            <div className={styles.transportRow}>
              {/* Secondary Controls */}
              <div className={styles.secondaryControls}>
                <button
                  aria-label="Phát ngẫu nhiên"
                  aria-pressed={state.shuffleEnabled}
                  className={state.shuffleEnabled ? styles.controlActive : undefined}
                  disabled={!queueHasNavigation}
                  onClick={toggleShuffle}
                  type="button"
                >
                  <Shuffle aria-hidden="true" size={15} />
                </button>
                <button
                  aria-label={`Lặp: ${state.repeatMode}`}
                  aria-pressed={state.repeatMode !== "off"}
                  className={state.repeatMode !== "off" ? styles.controlActive : undefined}
                  disabled={!state.queue.length}
                  onClick={toggleRepeat}
                  type="button"
                >
                  {state.repeatMode === "one" ? (
                    <Repeat1 aria-hidden="true" size={15} />
                  ) : (
                    <Repeat aria-hidden="true" size={15} />
                  )}
                </button>
                <button
                  aria-label={state.autoRadioEnabled ? "Tắt Auto Radio" : "Bật Auto Radio"}
                  aria-pressed={state.autoRadioEnabled}
                  className={state.autoRadioEnabled ? styles.controlActive : undefined}
                  onClick={toggleAutoRadio}
                  type="button"
                >
                  <Radio aria-hidden="true" size={15} />
                </button>
              </div>

              {/* Primary Transport: Prev / Play / Next */}
              <div className={styles.primaryTransport}>
                <button
                  aria-label="Bài trước"
                  disabled={!queueHasNavigation}
                  onClick={previous}
                  type="button"
                >
                  <SkipBack aria-hidden="true" fill="currentColor" size={20} />
                </button>
                <button
                  aria-label={state.isPlaying ? "Tạm dừng" : "Phát"}
                  className={styles.playButtonPrimary}
                  onClick={togglePlayback}
                  type="button"
                >
                  {buffering ? (
                    <LoaderCircle aria-hidden="true" className={styles.spinner} size={22} />
                  ) : state.isPlaying ? (
                    <Pause aria-hidden="true" fill="currentColor" size={22} />
                  ) : (
                    <Play aria-hidden="true" fill="currentColor" size={22} />
                  )}
                </button>
                <button
                  aria-label="Bài tiếp theo"
                  disabled={!canPlayNext}
                  onClick={() => void next()}
                  type="button"
                >
                  <SkipForward aria-hidden="true" fill="currentColor" size={20} />
                </button>
              </div>

              {/* Volume Cluster: Mute | Vol- | Range Slider | Vol+ */}
              <div className={styles.volumeCluster}>
                <button
                  aria-label={state.volume.muted ? "Bật âm thanh" : "Tắt âm thanh"}
                  className={state.volume.muted ? styles.controlActive : undefined}
                  onClick={() => setMuted(!state.volume.muted)}
                  type="button"
                >
                  {state.volume.muted || effectiveVol === 0 ? (
                    <VolumeX aria-hidden="true" size={15} />
                  ) : effectiveVol < 50 ? (
                    <Volume1 aria-hidden="true" size={15} />
                  ) : (
                    <Volume2 aria-hidden="true" size={15} />
                  )}
                </button>

                <button
                  aria-label="Giảm âm lượng"
                  className={styles.volumeStepBtn}
                  onClick={volumeDown}
                  type="button"
                >
                  <Minus aria-hidden="true" size={13} />
                </button>

                <input
                  aria-label="Âm lượng"
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={effectiveVol}
                  aria-valuetext={`${effectiveVol}%`}
                  className={styles.volumeSliderInput}
                  max="100"
                  min="0"
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  onInput={(e) => handleVolumeChange(Number(e.currentTarget.value))}
                  step="1"
                  style={{ "--progress": `${effectiveVol}%` } as React.CSSProperties}
                  type="range"
                  value={state.volume.volume}
                />

                <button
                  aria-label="Tăng âm lượng"
                  className={styles.volumeStepBtn}
                  onClick={volumeUp}
                  type="button"
                >
                  <Plus aria-hidden="true" size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Column 3: Expanded Content Panel */}
          {expanded ? (
            <div className={styles.expandedPanel}>
              <div className={styles.panelTabs} role="tablist" aria-label="Nội dung trình phát">
                <button
                  aria-selected={state.panel === "lyrics"}
                  className={state.panel === "lyrics" ? styles.tabActive : undefined}
                  onClick={() => setPanel("lyrics")}
                  role="tab"
                  type="button"
                >
                  <Captions aria-hidden="true" size={16} />
                  <span>KINETIC LYRICS</span>
                </button>
                <button
                  aria-selected={state.panel === "queue"}
                  className={state.panel === "queue" ? styles.tabActive : undefined}
                  onClick={() => setPanel("queue")}
                  role="tab"
                  type="button"
                >
                  <ListMusic aria-hidden="true" size={16} />
                  <span>QUEUE MANIFEST</span>
                </button>
              </div>
              <div className={styles.panelBody} role="tabpanel">
                {state.panel === "lyrics" ? <LyricsPanel /> : <QueuePanel compact />}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
