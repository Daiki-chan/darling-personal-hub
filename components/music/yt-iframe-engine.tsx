"use client";

import { useEffect, useRef } from "react";
import type { MusicTrack } from "@/lib/music";

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: {
            autoplay?: 0 | 1;
            controls?: 0 | 1;
            disablekb?: 0 | 1;
            fs?: 0 | 1;
            rel?: 0 | 1;
            modestbranding?: 0 | 1;
            iv_load_policy?: 1 | 3;
            origin?: string;
          };
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        },
      ) => YTPlayerInstance;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type YTPlayerInstance = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

type EngineProps = {
  currentTrack: MusicTrack;
  isPlaying: boolean;
  volume: number; // 0 to 1
  seekTarget?: number | null;
  onPlayStateChange: (playing: boolean, buffering: boolean) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onEnded: () => void;
  onError: (message: string) => void;
};

export function YTIFrameEngine({
  currentTrack,
  isPlaying,
  volume,
  seekTarget,
  onPlayStateChange,
  onTimeUpdate,
  onEnded,
  onError,
}: EngineProps) {
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const isYtReadyRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const currentTrackRef = useRef<MusicTrack>(currentTrack);

  isPlayingRef.current = isPlaying;
  currentTrackRef.current = currentTrack;

  // Handle direct HTML5 audio time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (currentTrackRef.current.source.kind === "direct") {
        onTimeUpdate(audio.currentTime, audio.duration || currentTrackRef.current.duration || 0);
      }
    };

    const handleEnded = () => {
      if (currentTrackRef.current.source.kind === "direct") {
        onEnded();
      }
    };

    const handleError = () => {
      if (currentTrackRef.current.source.kind === "direct") {
        onError("Direct audio playback failed.");
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [onTimeUpdate, onEnded, onError]);

  // Timer loop for YouTube player current time polling
  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      if (
        currentTrackRef.current.source.kind === "youtube" &&
        ytPlayerRef.current &&
        isYtReadyRef.current
      ) {
        try {
          const currentTime = ytPlayerRef.current.getCurrentTime() || 0;
          const duration = ytPlayerRef.current.getDuration() || currentTrackRef.current.duration || 0;
          onTimeUpdate(currentTime, duration);
        } catch {
          // Ignore polling errors
        }
      }
    }, 250);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [onTimeUpdate]);

  // Load YouTube IFrame API Script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      initYTPlayer();
      return;
    }

    const existingScript = document.getElementById("yt-iframe-api-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "yt-iframe-api-script";
      script.src = "https://www.youtube.com/iframe_api";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript?.parentNode?.insertBefore(script, firstScript);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      initYTPlayer();
    };

    function initYTPlayer() {
      if (!containerRef.current || ytPlayerRef.current) return;

      const dummyTarget = document.createElement("div");
      dummyTarget.id = "yt-player-target";
      containerRef.current.appendChild(dummyTarget);

      const initialVideoId =
        currentTrackRef.current.source.kind === "youtube"
          ? currentTrackRef.current.source.videoId
          : "";

      try {
        ytPlayerRef.current = new window.YT.Player("yt-player-target", {
          height: "1",
          width: "1",
          videoId: initialVideoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              isYtReadyRef.current = true;
              event.target.setVolume(Math.round(volume * 100));
              if (currentTrackRef.current.source.kind === "youtube" && isPlayingRef.current) {
                event.target.playVideo();
              }
            },
            onStateChange: (event) => {
              // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED
              if (event.data === 1) {
                onPlayStateChange(true, false);
              } else if (event.data === 2) {
                onPlayStateChange(false, false);
              } else if (event.data === 3) {
                onPlayStateChange(isPlayingRef.current, true);
              } else if (event.data === 0) {
                onPlayStateChange(false, false);
                onEnded();
              }
            },
            onError: () => {
              onPlayStateChange(false, false);
              onError("YouTube video playback error or restriction.");
            },
          },
        });
      } catch {
        // Player creation fallback
      }
    }

    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Cleanup error catch
        }
        ytPlayerRef.current = null;
        isYtReadyRef.current = false;
      }
    };
  }, []);

  // Track change handler
  useEffect(() => {
    const track = currentTrack;
    if (track.source.kind === "youtube") {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          if (isPlaying) {
            ytPlayerRef.current.loadVideoById(track.source.videoId);
          } else {
            ytPlayerRef.current.cueVideoById(track.source.videoId);
          }
        } catch {
          // Ignore video load errors
        }
      }
    } else if (track.source.kind === "direct") {
      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // Ignore YT pause error
        }
      }

      const audio = audioRef.current;
      if (audio) {
        audio.crossOrigin = "anonymous";
        audio.src = track.source.url;
        audio.load();
        if (isPlaying) {
          audio.play().catch(() => onPlayStateChange(false, false));
        }
      }
    }
  }, [currentTrack.id]);

  // Play/Pause sync handler
  useEffect(() => {
    const track = currentTrack;
    if (track.source.kind === "youtube") {
      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          if (isPlaying) {
            ytPlayerRef.current.playVideo();
          } else {
            ytPlayerRef.current.pauseVideo();
          }
        } catch {
          // Sync error catch
        }
      }
    } else if (track.source.kind === "direct") {
      const audio = audioRef.current;
      if (audio) {
        if (isPlaying) {
          audio.play().catch(() => onPlayStateChange(false, false));
        } else {
          audio.pause();
        }
      }
    }
  }, [isPlaying]);

  // Volume sync handler
  useEffect(() => {
    if (ytPlayerRef.current && isYtReadyRef.current) {
      try {
        ytPlayerRef.current.setVolume(Math.round(volume * 100));
      } catch {
        // Volume sync error catch
      }
    }
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Seek handler
  useEffect(() => {
    if (seekTarget === null || seekTarget === undefined) return;

    if (currentTrack.source.kind === "youtube") {
      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          ytPlayerRef.current.seekTo(seekTarget, true);
        } catch {
          // Seek error catch
        }
      }
    } else if (currentTrack.source.kind === "direct") {
      if (audioRef.current) {
        audioRef.current.currentTime = seekTarget;
      }
    }
  }, [seekTarget]);

  return (
    <div
      aria-hidden="true"
      className="fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none"
      style={{
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        width: "1px",
        height: "1px",
        opacity: 0,
        pointerEvents: "none",
        zIndex: -9999,
      }}
    >
      <div ref={containerRef} style={{ width: "1px", height: "1px" }} />
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}
