"use client";

import { useEffect, useRef } from "react";
import { clampVolume } from "@/lib/music/volume";
import { useMusicPlayer } from "./music-player-core";
import styles from "./music-app.module.css";

type YouTubePlayer = {
  cueVideoById: (videoId: string) => void;
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVolume: () => number;
  isMuted: () => boolean;
  loadVideoById: (videoId: string) => void;
  mute: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
};

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onError: (event: { data: number }) => void;
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: {
    BUFFERING: number;
    CUED: number;
    ENDED: number;
    PAUSED: number;
    PLAYING: number;
  };
};

type YouTubeWindow = Window & {
  YT?: YouTubeApi;
  onYouTubeIframeAPIReady?: () => void;
};

let apiPromise: Promise<YouTubeApi> | null = null;

function resetYouTubeApiScript() {
  apiPromise = null;
  const existing = document.getElementById("youtube-iframe-api");
  if (existing) {
    try {
      existing.remove();
    } catch {
      // Ignore if element is already detached
    }
  }
}

function loadYouTubeApi() {
  const youtubeWindow = window as YouTubeWindow;
  if (youtubeWindow.YT?.Player) return Promise.resolve(youtubeWindow.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousReady = youtubeWindow.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => {
      resetYouTubeApiScript();
      reject(new Error("YouTube IFrame API timeout."));
    }, 15000);

    youtubeWindow.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      window.clearTimeout(timeout);
      if (youtubeWindow.YT) resolve(youtubeWindow.YT);
      else {
        resetYouTubeApiScript();
        reject(new Error("YouTube IFrame API unavailable."));
      }
    };

    const existing = document.getElementById("youtube-iframe-api");
    if (existing) return;
    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      resetYouTubeApiScript();
      reject(new Error("YouTube IFrame API failed to load."));
    };
    document.head.appendChild(script);
  });

  return apiPromise;
}

export function YouTubeVideoStage() {
  const { clock, handlePlaybackError, next, reportDuration, reportPlayerStatus, state } = useMusicPlayer();
  const targetRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const readyRef = useRef(false);
  const loadedVideoIdRef = useRef<string | null>(null);
  const playerGenerationRef = useRef(0);
  const resumeHandledRef = useRef(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Teardown when shutdown action is dispatched
  useEffect(() => {
    if (state.isShutdown) {
      playerGenerationRef.current += 1;
      readyRef.current = false;
      loadedVideoIdRef.current = null;
      resumeHandledRef.current = false;
      try {
        playerRef.current?.stopVideo();
      } catch {
        // Player may already be stopped
      }
      try {
        playerRef.current?.destroy();
      } catch {
        // Player may already be destroyed
      }
      playerRef.current = null;
    }
  }, [state.isShutdown, state.shutdownGeneration]);

  useEffect(() => {
    if (stateRef.current.isShutdown) return;
    let active = true;
    const target = targetRef.current;
    const track = stateRef.current.currentTrack;
    if (!target || !track) return;

    const generation = ++playerGenerationRef.current;
    reportPlayerStatus("loading", stateRef.current.isPlaying);

    loadYouTubeApi()
      .then((YT) => {
        if (!active || generation !== playerGenerationRef.current || playerRef.current || !targetRef.current) return;
        playerRef.current = new YT.Player(targetRef.current, {
          videoId: track.videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            disablekb: 0,
            enablejsapi: 1,
            fs: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            origin: window.location.origin,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              if (generation !== playerGenerationRef.current) return;
              readyRef.current = true;
              loadedVideoIdRef.current = stateRef.current.currentTrack?.videoId ?? null;

              // Handle resume seek if valid
              const resumeSec = stateRef.current.resumeSeconds;
              if (resumeSec && resumeSec > 0 && !resumeHandledRef.current) {
                resumeHandledRef.current = true;
                event.target.seekTo(resumeSec, true);
                clock.set(resumeSec, track.duration ?? 0);
              }

              const desired = stateRef.current.volume;
              event.target.setVolume(clampVolume(desired.volume));
              if (desired.muted) event.target.mute();
              else event.target.unMute();

              reportPlayerStatus("ready", stateRef.current.isPlaying);
              if (stateRef.current.isPlaying) event.target.playVideo();
            },
            onStateChange: (event) => {
              if (generation !== playerGenerationRef.current) return;
              if (event.data === YT.PlayerState.PLAYING) reportPlayerStatus("playing", true);
              else if (event.data === YT.PlayerState.PAUSED) reportPlayerStatus("paused", false);
              else if (event.data === YT.PlayerState.BUFFERING) reportPlayerStatus("buffering", true);
              else if (event.data === YT.PlayerState.CUED) reportPlayerStatus("ready", false);
              else if (event.data === YT.PlayerState.ENDED) void next(true);
            },
            onError: (event) => {
              if (generation !== playerGenerationRef.current) return;
              const blocked = event.data === 101 || event.data === 150;
              handlePlaybackError(
                blocked ? "VIDEO_NOT_EMBEDDABLE" : "VIDEO_UNAVAILABLE",
                blocked
                  ? "Video này không cho phép phát nhúng. Đang chuyển bài tiếp theo."
                  : "Video này không thể phát. Đang chuyển bài tiếp theo.",
              );
            },
          },
        });
      })
      .catch(() => {
        if (active && generation === playerGenerationRef.current) {
          handlePlaybackError("NETWORK_ERROR", "Không thể tải YouTube Player. Kiểm tra kết nối và thử lại.");
        }
      });

    return () => {
      active = false;
      readyRef.current = false;
      try {
        playerRef.current?.destroy();
      } catch {
        // Route teardown may remove the iframe
      }
      playerRef.current = null;
    };
  }, [handlePlaybackError, next, reportPlayerStatus, state.currentTrack?.videoId, state.isShutdown]);

  useEffect(() => {
    const track = state.currentTrack;
    const player = playerRef.current;
    if (state.isShutdown || !track || !player || !readyRef.current || loadedVideoIdRef.current === track.videoId) return;
    loadedVideoIdRef.current = track.videoId;
    clock.set(0, track.duration ?? 0);
    try {
      if (state.isPlaying) player.loadVideoById(track.videoId);
      else player.cueVideoById(track.videoId);
    } catch {
      handlePlaybackError("PLAYER_NOT_READY", "YouTube Player chưa sẵn sàng. Vui lòng thử lại.");
    }
  }, [clock, handlePlaybackError, state.currentTrack, state.isPlaying, state.isShutdown]);

  useEffect(() => {
    const player = playerRef.current;
    if (state.isShutdown || !player || !readyRef.current) return;
    try {
      if (state.isPlaying) player.playVideo();
      else player.pauseVideo();
    } catch {
      handlePlaybackError("PLAYER_NOT_READY", "YouTube Player chưa sẵn sàng. Vui lòng thử lại.");
    }
  }, [handlePlaybackError, state.isPlaying, state.isShutdown]);

  useEffect(() => {
    const player = playerRef.current;
    if (state.isShutdown || !player || !readyRef.current) return;
    const desired = clampVolume(state.volume.volume);
    player.setVolume(desired);
    if (state.volume.muted) player.mute();
    else player.unMute();
  }, [state.volume, state.isShutdown]);

  useEffect(() => {
    const request = state.seekRequest;
    if (state.isShutdown || !request || !playerRef.current || !readyRef.current) return;
    playerRef.current.seekTo(request.seconds, true);
  }, [state.seekRequest, state.isShutdown]);

  useEffect(() => {
    const syncClock = () => {
      if (document.hidden || stateRef.current.isShutdown) return;
      const player = playerRef.current;
      if (!player || !readyRef.current) return;
      try {
        const currentTime = player.getCurrentTime() || 0;
        const duration = player.getDuration() || stateRef.current.duration || 0;
        clock.set(currentTime, duration);
        if (duration > 0 && Math.abs(duration - stateRef.current.duration) > 0.5) reportDuration(duration);
      } catch {
        // Transient getter unavailabilities
      }
    };
    const interval = window.setInterval(syncClock, 750);
    document.addEventListener("visibilitychange", syncClock);
    syncClock();
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", syncClock);
    };
  }, [clock, reportDuration]);

  if (state.isShutdown || !state.currentTrack) return null;

  return (
    <div
      className={styles.videoStage}
      data-muted={state.volume.muted}
      data-player-status={state.status}
      data-volume={state.volume.volume}
      ref={stageRef}
    >
      <div className={styles.videoMount} ref={targetRef} />
      <div className={styles.videoStatus} aria-live="polite">
        {state.status === "loading" || state.status === "buffering" ? "Đang kết nối video" : "YouTube Player"}
      </div>
    </div>
  );
}
