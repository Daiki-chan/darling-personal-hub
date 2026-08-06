"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlignVerticalSpaceAround, Minus, Plus, RotateCcw } from "lucide-react";
import { findActiveLyricIndex } from "@/lib/music/format";
import { fetchLyrics } from "@/lib/music/lyrics-service";
import type { LyricsResult } from "@/lib/music/types";
import { useMusicPlayer, usePlaybackClock } from "./music-player-core";
import styles from "./music-app.module.css";

type LyricsStatus = "idle" | "loading" | "ready" | "empty" | "error";

export function LyricsPanel() {
  const { seek, setLyricOffset, state } = useMusicPlayer();
  const { currentTime } = usePlaybackClock();
  const [status, setStatus] = useState<LyricsStatus>("idle");
  const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const activeRef = useRef<HTMLButtonElement>(null);
  const programmaticScrollRef = useRef(false);
  const track = state.currentTrack;
  const offset = track ? state.lyricOffsets[track.videoId] ?? 0 : 0;
  const activeIndex = useMemo(
    () => findActiveLyricIndex(lyrics?.syncedLyrics ?? [], currentTime + offset),
    [currentTime, lyrics?.syncedLyrics, offset],
  );

  useEffect(() => {
    if (!track) {
      setStatus("idle");
      setLyrics(null);
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    setAutoScroll(true);
    fetchLyrics(track, controller.signal)
      .then((result) => {
        if (!result) {
          setLyrics(null);
          setStatus("empty");
          return;
        }
        setLyrics(result);
        setStatus("ready");
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setLyrics(null);
        setStatus("error");
      });
    return () => controller.abort();
  }, [track]);

  useEffect(() => {
    if (!autoScroll || activeIndex < 0 || !activeRef.current) return;
    programmaticScrollRef.current = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeRef.current.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    const timeout = window.setTimeout(() => { programmaticScrollRef.current = false; }, 500);
    return () => window.clearTimeout(timeout);
  }, [activeIndex, autoScroll]);

  if (!track) {
    return (
      <div className={styles.emptyPanel}>
        <AlignVerticalSpaceAround aria-hidden="true" size={28} />
        <strong>Lời bài hát đang chờ</strong>
        <span>Phát một bài để Darling tìm lời đồng bộ từ LRCLIB.</span>
      </div>
    );
  }

  return (
    <section aria-labelledby="lyrics-title" className={styles.lyricsPanel}>
      <div className={styles.lyricsHeader}>
        <div><h2 id="lyrics-title">Lời bài hát</h2><span>{track.title}</span></div>
        <div className={styles.offsetControls}>
          <span>Offset {offset > 0 ? "+" : ""}{offset.toFixed(1)}s</span>
          <button aria-label="Giảm offset lời" onClick={() => setLyricOffset(track.videoId, offset - 0.5)} type="button">
            <Minus aria-hidden="true" size={15} />
          </button>
          <button aria-label="Tăng offset lời" onClick={() => setLyricOffset(track.videoId, offset + 0.5)} type="button">
            <Plus aria-hidden="true" size={15} />
          </button>
        </div>
      </div>

      {status === "loading" ? (
        <div className={styles.lyricsSkeleton} aria-label="Đang tải lời bài hát">
          {Array.from({ length: 7 }, (_, index) => <span key={index} />)}
        </div>
      ) : null}
      {status === "empty" ? (
        <div className={styles.lyricsState}><strong>Chưa tìm thấy lời</strong><span>Playback vẫn hoạt động bình thường.</span></div>
      ) : null}
      {status === "error" ? (
        <div className={styles.lyricsState}><strong>LRCLIB đang bận</strong><span>Không thể tải lời lúc này. Nhạc không bị gián đoạn.</span></div>
      ) : null}
      {status === "ready" && lyrics?.instrumental ? (
        <div className={styles.lyricsState}><strong>Bản nhạc không lời</strong><span>Không có dòng lời cần đồng bộ.</span></div>
      ) : null}

      {status === "ready" && lyrics?.syncedLyrics.length ? (
        <div
          className={styles.syncedLyrics}
          onScroll={() => {
            if (!programmaticScrollRef.current) setAutoScroll(false);
          }}
        >
          {lyrics.syncedLyrics.map((line, index) => (
            <button
              className={index === activeIndex ? styles.lyricActive : undefined}
              key={`${line.time}-${index}`}
              onClick={() => seek(Math.max(0, line.time - offset))}
              ref={index === activeIndex ? activeRef : undefined}
              type="button"
            >
              {line.text}
            </button>
          ))}
        </div>
      ) : null}

      {status === "ready" && !lyrics?.syncedLyrics.length && lyrics?.plainLyrics ? (
        <div className={styles.plainLyrics}>
          {lyrics.plainLyrics.split(/\r?\n/).filter(Boolean).map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
        </div>
      ) : null}

      {!autoScroll && status === "ready" && Boolean(lyrics?.syncedLyrics.length) ? (
        <button className={styles.resumeScroll} onClick={() => setAutoScroll(true)} type="button">
          <RotateCcw aria-hidden="true" size={15} />Theo dòng hiện tại
        </button>
      ) : null}
    </section>
  );
}
