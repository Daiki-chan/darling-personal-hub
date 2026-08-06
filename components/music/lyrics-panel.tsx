"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlignVerticalSpaceAround, Check, Minus, Plus, RotateCcw, Search, X } from "lucide-react";
import { findActiveLyricIndex, formatTime } from "@/lib/music/format";
import { lyricsRecordToResult } from "@/lib/music/lyrics";
import { calculateCenteredLyricScrollTop, isLyricInsideSafeZone } from "@/lib/music/lyrics-scroll";
import {
  fetchLyrics,
  rememberLyricsSelection,
  searchLyricsCandidates,
} from "@/lib/music/lyrics-service";
import { normalizeTrackMetadata } from "@/lib/music/metadata";
import type { LyricsCandidate, LyricsResult } from "@/lib/music/types";
import { useMusicPlayer, usePlaybackClock } from "./music-player-core";
import styles from "./music-app.module.css";

type LyricsStatus = "idle" | "loading" | "ready" | "empty" | "error";
type ManualStatus = "idle" | "loading" | "ready" | "empty" | "error";

export function LyricsPanel() {
  const { seek, setLyricMapping, setLyricOffset, state } = useMusicPlayer();
  const { currentTime } = usePlaybackClock();
  const [status, setStatus] = useState<LyricsStatus>("idle");
  const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [editTrack, setEditTrack] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [manualStatus, setManualStatus] = useState<ManualStatus>("idle");
  const [manualError, setManualError] = useState("");
  const [candidates, setCandidates] = useState<LyricsCandidate[]>([]);
  const activeRef = useRef<HTMLButtonElement>(null);
  const manualAbortRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<number | null>(null);
  const smoothScrollTimerRef = useRef<number | null>(null);
  const track = state.currentTrack;
  const offset = track ? state.lyricOffsets[track.videoId] ?? 0 : 0;
  const mappedRecord = track ? state.lyricMappings[track.videoId] : undefined;
  const activeIndex = useMemo(
    () => findActiveLyricIndex(lyrics?.syncedLyrics ?? [], currentTime + offset),
    [currentTime, lyrics?.syncedLyrics, offset],
  );

  const stopSmoothScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (smoothScrollTimerRef.current !== null) {
      window.clearTimeout(smoothScrollTimerRef.current);
      smoothScrollTimerRef.current = null;
    }
    if (container) {
      container.scrollTo({ top: container.scrollTop, behavior: "auto" });
    }
  }, []);

  const resumeAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current !== null) {
      window.clearTimeout(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
    setAutoScroll(true);
  }, []);

  const pauseAutoScroll = useCallback(() => {
    stopSmoothScroll();
    setAutoScroll(false);
    if (autoScrollTimerRef.current !== null) window.clearTimeout(autoScrollTimerRef.current);
    autoScrollTimerRef.current = window.setTimeout(() => {
      autoScrollTimerRef.current = null;
      setAutoScroll(true);
    }, 5000);
  }, [stopSmoothScroll]);

  useEffect(() => {
    let disposed = false;
    stopSmoothScroll();
    if (autoScrollTimerRef.current !== null) {
      window.clearTimeout(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
    if (!track) {
      queueMicrotask(() => {
        if (disposed) return;
        setStatus("idle");
        setLyrics(null);
      });
      return () => { disposed = true; };
    }
    const normalized = normalizeTrackMetadata(track);
    const controller = new AbortController();
    queueMicrotask(() => {
      if (disposed) return;
      setEditTrack(normalized.track);
      setEditArtist(normalized.artist);
      setCorrectionOpen(false);
      setCandidates([]);
      setManualStatus("idle");
      setStatus("loading");
      setAutoScroll(true);
    });
    fetchLyrics(track, controller.signal, mappedRecord)
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
    return () => {
      disposed = true;
      controller.abort();
    };
  }, [mappedRecord, stopSmoothScroll, track]);

  useEffect(() => {
    if (!autoScroll || correctionOpen || activeIndex < 0) return;
    const container = scrollContainerRef.current;
    const activeLine = activeRef.current;
    if (!container || !activeLine) return;
    const containerRect = container.getBoundingClientRect();
    const lineRect = activeLine.getBoundingClientRect();
    const geometry = {
      containerHeight: container.clientHeight,
      containerScrollTop: container.scrollTop,
      lineHeight: lineRect.height,
      lineTop: lineRect.top - containerRect.top,
      scrollHeight: container.scrollHeight,
    };
    if (isLyricInsideSafeZone(geometry)) return;
    stopSmoothScroll();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
    container.scrollTo({
      top: calculateCenteredLyricScrollTop(geometry),
      behavior,
    });
    if (behavior === "smooth") {
      smoothScrollTimerRef.current = window.setTimeout(() => {
        smoothScrollTimerRef.current = null;
      }, 650);
    }
  }, [activeIndex, autoScroll, correctionOpen, stopSmoothScroll]);

  useEffect(() => () => {
    manualAbortRef.current?.abort();
    if (autoScrollTimerRef.current !== null) window.clearTimeout(autoScrollTimerRef.current);
    if (smoothScrollTimerRef.current !== null) window.clearTimeout(smoothScrollTimerRef.current);
  }, []);

  const runManualSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!track || !editTrack.trim()) return;
    manualAbortRef.current?.abort();
    const controller = new AbortController();
    manualAbortRef.current = controller;
    setManualStatus("loading");
    setManualError("");
    try {
      const results = await searchLyricsCandidates({
        track: editTrack,
        artist: editArtist,
        duration: track.duration || state.duration,
        query: `${editTrack} ${editArtist}`.trim(),
      }, controller.signal);
      setCandidates(results);
      setManualStatus(results.length ? "ready" : "empty");
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setManualError(reason instanceof Error ? reason.message : "Không thể tìm phiên bản lời khác.");
      setManualStatus("error");
    }
  };

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
          <button className={styles.findLyricsButton} onClick={() => setCorrectionOpen(true)} type="button">
            <Search aria-hidden="true" size={15} />Tìm bản khác
          </button>
          <span>Offset {offset > 0 ? "+" : ""}{offset.toFixed(1)}s</span>
          <button aria-label="Giảm offset lời" onClick={() => setLyricOffset(track.videoId, offset - 0.5)} type="button">
            <Minus aria-hidden="true" size={15} />
          </button>
          <button aria-label="Tăng offset lời" onClick={() => setLyricOffset(track.videoId, offset + 0.5)} type="button">
            <Plus aria-hidden="true" size={15} />
          </button>
        </div>
      </div>

      {correctionOpen ? (
        <div className={styles.lyricsCorrection}>
          <div className={styles.correctionHeading}>
            <div><strong>Tìm phiên bản lời phù hợp</strong><span>Lựa chọn được lưu riêng cho video này.</span></div>
            <button aria-label="Đóng tìm lời" onClick={() => setCorrectionOpen(false)} type="button"><X aria-hidden="true" size={16} /></button>
          </div>
          <form onSubmit={runManualSearch}>
            <label htmlFor="lyrics-track-name">
              Tên bài hát
              <input id="lyrics-track-name" onChange={(event) => setEditTrack(event.target.value)} value={editTrack} />
            </label>
            <label htmlFor="lyrics-artist-name">
              Nghệ sĩ
              <input id="lyrics-artist-name" onChange={(event) => setEditArtist(event.target.value)} value={editArtist} />
            </label>
            <button disabled={!editTrack.trim() || manualStatus === "loading"} type="submit">
              <Search aria-hidden="true" size={15} />{manualStatus === "loading" ? "Đang tìm" : "Tìm trên LRCLIB"}
            </button>
          </form>
          {manualStatus === "error" ? <p className={styles.manualLyricsError} role="alert">{manualError}</p> : null}
          {manualStatus === "empty" ? <p className={styles.manualLyricsEmpty}>Không tìm thấy phiên bản phù hợp với metadata này.</p> : null}
          {manualStatus === "ready" ? (
            <div className={styles.lyricsCandidates}>
              {candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => {
                    setLyricMapping(track.videoId, candidate);
                    rememberLyricsSelection(track.videoId, candidate);
                    setLyrics(lyricsRecordToResult(candidate));
                    setStatus("ready");
                    setCorrectionOpen(false);
                  }}
                  type="button"
                >
                  <span><strong>{candidate.trackName}</strong><small>{candidate.artistName}</small></span>
                  <span><small>{formatTime(candidate.duration)} · {candidate.syncedLyrics ? "Đồng bộ" : "Lời thường"}</small><Check aria-hidden="true" size={16} /></span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {status === "loading" ? (
        <div className={styles.lyricsSkeleton} aria-label="Đang tải lời bài hát">
          {Array.from({ length: 7 }, (_, index) => <span key={index} />)}
        </div>
      ) : null}
      {status === "empty" ? (
        <div className={styles.lyricsState}><strong>Chưa tìm thấy lời</strong><span>Playback vẫn hoạt động. Dùng “Tìm bản khác” để sửa metadata.</span></div>
      ) : null}
      {status === "error" ? (
        <div className={styles.lyricsState}><strong>LRCLIB đang bận</strong><span>Không thể tải lời lúc này. Nhạc không bị gián đoạn.</span></div>
      ) : null}
      {status === "ready" && lyrics?.instrumental ? (
        <div className={styles.lyricsState}><strong>Bản nhạc không lời</strong><span>Không có dòng lời cần đồng bộ.</span></div>
      ) : null}

      {status === "ready" && lyrics?.syncedLyrics.length ? (
        <div
          aria-label="Lời bài hát đồng bộ"
          className={styles.syncedLyrics}
          data-auto-scroll={autoScroll}
          onKeyDown={(event) => {
            if ([" ", "ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp"].includes(event.key)) {
              pauseAutoScroll();
            }
          }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) pauseAutoScroll();
          }}
          onTouchMove={pauseAutoScroll}
          onPointerMove={(event) => {
            if (event.buttons) pauseAutoScroll();
          }}
          onWheel={pauseAutoScroll}
          ref={scrollContainerRef}
          tabIndex={0}
        >
          {lyrics.syncedLyrics.map((line, index) => (
            <button
              className={index === activeIndex ? styles.lyricActive : undefined}
              key={`${line.time}-${index}`}
              onClick={() => seek(Math.max(0, line.time - offset))}
              ref={index === activeIndex ? activeRef : undefined}
              type="button"
            >
              {line.text || "Nhạc dạo"}
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
        <button className={styles.resumeScroll} onClick={resumeAutoScroll} type="button">
          <RotateCcw aria-hidden="true" size={15} />Tiếp tục tự cuộn
        </button>
      ) : null}
    </section>
  );
}
