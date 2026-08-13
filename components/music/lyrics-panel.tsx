"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
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
import { useMusicPlayer } from "./music-player-core";
import styles from "./music-app.module.css";

type LyricsStatus = "idle" | "loading" | "ready" | "empty" | "error";
type ManualStatus = "idle" | "loading" | "ready" | "empty" | "error";

export function LyricsPanel() {
  const { clock, seek, setLyricMapping, setLyricOffset, state } = useMusicPlayer();
  const [status, setStatus] = useState<LyricsStatus>("idle");
  const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [editTrack, setEditTrack] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [manualStatus, setManualStatus] = useState<ManualStatus>("idle");
  const [manualError, setManualError] = useState("");
  const [candidates, setCandidates] = useState<LyricsCandidate[]>([]);
  const activeRef = useRef<HTMLButtonElement>(null);
  const activeIndexRef = useRef(-1);
  const manualAbortRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const track = state.currentTrack;
  const offset = track ? state.lyricOffsets[track.videoId] ?? 0 : 0;
  const mappedRecord = track ? state.lyricMappings[track.videoId] : undefined;

  // Imperative clock subscription with state guard: React re-renders ONLY when activeIndex changes
  useEffect(() => {
    const updateActiveIndex = () => {
      const snap = clock.getSnapshot();
      const curTime = snap.currentTime || 0;
      const synced = lyrics?.syncedLyrics ?? [];
      const newIndex = findActiveLyricIndex(synced, curTime + offset);
      if (newIndex !== activeIndexRef.current) {
        activeIndexRef.current = newIndex;
        setActiveIndex(newIndex);
      }
    };

    updateActiveIndex();
    const unsubscribe = clock.subscribe(updateActiveIndex);
    return () => {
      unsubscribe();
    };
  }, [clock, lyrics?.syncedLyrics, offset]);

  const resumeAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current !== null) {
      window.clearTimeout(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
    setAutoScroll(true);
  }, []);

  const pauseAutoScroll = useCallback(() => {
    if (isSeekingRef.current) return;
    setAutoScroll(false);
  }, []);

  useEffect(() => {
    let disposed = false;
    if (autoScrollTimerRef.current !== null) {
      window.clearTimeout(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
    activeIndexRef.current = -1;
    setActiveIndex(-1);

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
  }, [mappedRecord, track]);

  // Smooth Auto-Scroll to 42% Focus Anchor on Every Active Index Change
  useEffect(() => {
    if (!autoScroll || correctionOpen || activeIndex < 0) return;
    const container = scrollContainerRef.current;
    const activeLine = activeRef.current;
    if (!container || !activeLine) return;

    const frameId = requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const lineRect = activeLine.getBoundingClientRect();
      const geometry = {
        containerHeight: container.clientHeight,
        containerScrollTop: container.scrollTop,
        lineHeight: lineRect.height,
        lineTop: lineRect.top - containerRect.top,
        scrollHeight: container.scrollHeight,
      };

      if (isLyricInsideSafeZone(geometry) && !isSeekingRef.current) return;
      isSeekingRef.current = false;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const targetTop = calculateCenteredLyricScrollTop(geometry);

      container.scrollTo({
        top: targetTop,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [activeIndex, autoScroll, correctionOpen]);

  useEffect(() => () => {
    manualAbortRef.current?.abort();
    if (autoScrollTimerRef.current) window.clearTimeout(autoScrollTimerRef.current);
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

  const handleLineClick = (lineTime: number) => {
    isSeekingRef.current = true;
    seek(Math.max(0, lineTime - offset));
    resumeAutoScroll();
  };

  if (!track) {
    return (
      <div className={styles.emptyPanel}>
        <AlignVerticalSpaceAround aria-hidden="true" size={26} />
        <strong>KINETIC LYRICS DORMANT</strong>
        <span>Select a track to synchronize lyrics from LRCLIB.</span>
      </div>
    );
  }

  return (
    <section aria-labelledby="lyrics-title" className={styles.lyricsPanel}>
      <div className={styles.lyricsHeaderRoot}>
        {/* Row 1: Title & Search Alternate */}
        <div className={styles.lyricsHeaderTopRow}>
          <h2 id="lyrics-title" className={styles.chapterTitle}>KINETIC LYRICS</h2>
          <button className={styles.findLyricsButton} onClick={() => setCorrectionOpen(true)} type="button">
            <Search aria-hidden="true" size={13} />
            <span>SEARCH ALTERNATE</span>
          </button>
        </div>

        {/* Row 2: Track Metadata & Offset Controls */}
        <div className={styles.lyricsHeaderBottomRow}>
          <span className={styles.chapterSub} title={`${track.title} · ${track.artist}`}>
            {track.title}
          </span>
          <div className={styles.lyricsOffsetCluster}>
            <span className={styles.offsetBadge}>OFFSET {offset > 0 ? "+" : ""}{offset.toFixed(1)}S</span>
            <button aria-label="Giảm offset" className={styles.offsetBtn} onClick={() => setLyricOffset(track.videoId, offset - 0.5)} type="button">
              <Minus aria-hidden="true" size={12} />
            </button>
            <button aria-label="Tăng offset" className={styles.offsetBtn} onClick={() => setLyricOffset(track.videoId, offset + 0.5)} type="button">
              <Plus aria-hidden="true" size={12} />
            </button>
          </div>
        </div>
      </div>

      {correctionOpen ? (
        <div className={styles.lyricsCorrection}>
          <div className={styles.correctionHeading}>
            <div><strong>SEARCH LRCLIB VERSIONS</strong><span>Mapped individually to this video ID.</span></div>
            <button aria-label="Đóng tìm lời" onClick={() => setCorrectionOpen(false)} type="button"><X aria-hidden="true" size={15} /></button>
          </div>
          <form onSubmit={runManualSearch} className={styles.manualSearchForm}>
            <label htmlFor="lyrics-track-name">
              TITLE
              <input id="lyrics-track-name" onChange={(event) => setEditTrack(event.target.value)} value={editTrack} />
            </label>
            <label htmlFor="lyrics-artist-name">
              ARTIST
              <input id="lyrics-artist-name" onChange={(event) => setEditArtist(event.target.value)} value={editArtist} />
            </label>
            <button disabled={!editTrack.trim() || manualStatus === "loading"} type="submit">
              <Search aria-hidden="true" size={14} />{manualStatus === "loading" ? "SEARCHING..." : "QUERY"}
            </button>
          </form>
          {manualStatus === "error" ? <p className={styles.manualLyricsError} role="alert">{manualError}</p> : null}
          {manualStatus === "empty" ? <p className={styles.manualLyricsEmpty}>No matching versions found.</p> : null}
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
                  <span><small>{formatTime(candidate.duration)} · {candidate.syncedLyrics ? "SYNCED" : "PLAIN"}</small><Check aria-hidden="true" size={15} /></span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {status === "loading" ? (
        <div className={styles.lyricsSkeleton} aria-label="Đang tải lời bài hát">
          {Array.from({ length: 6 }, (_, index) => <span key={index} />)}
        </div>
      ) : null}
      {status === "empty" ? (
        <div className={styles.lyricsState}><strong>NO LYRICS FOUND</strong><span>Playback active. Use Search Alternate to correct metadata.</span></div>
      ) : null}
      {status === "error" ? (
        <div className={styles.lyricsState}><strong>LRCLIB SERVICE BUSY</strong><span>Playback remains uninterrupted.</span></div>
      ) : null}
      {status === "ready" && lyrics?.instrumental ? (
        <div className={styles.lyricsState}><strong>INSTRUMENTAL TRACK</strong><span>No synced text lines available.</span></div>
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
          onWheel={pauseAutoScroll}
          ref={scrollContainerRef}
          tabIndex={0}
        >
          {lyrics.syncedLyrics.map((line, index) => {
            const isActive = index === activeIndex;
            const distance = Math.abs(index - activeIndex);
            const isAdjacent = distance === 1 || distance === 2;

            let lineClassName = styles.lyricLine;
            if (isActive) {
              lineClassName = `${styles.lyricLine} ${styles.lyricLineActive}`;
            } else if (isAdjacent && activeIndex >= 0) {
              lineClassName = `${styles.lyricLine} ${styles.lyricLineAdjacent}`;
            }

            return (
              <button
                className={lineClassName}
                key={`${line.time}-${index}`}
                onClick={() => handleLineClick(line.time)}
                ref={isActive ? activeRef : undefined}
                type="button"
              >
                {line.text || "•••"}
              </button>
            );
          })}
        </div>
      ) : null}

      {status === "ready" && !lyrics?.syncedLyrics.length && lyrics?.plainLyrics ? (
        <div className={styles.plainLyrics}>
          {lyrics.plainLyrics.split(/\r?\n/).filter(Boolean).map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
        </div>
      ) : null}

      {!autoScroll && status === "ready" && Boolean(lyrics?.syncedLyrics.length) ? (
        <button className={styles.resumeScroll} onClick={resumeAutoScroll} type="button">
          <RotateCcw aria-hidden="true" size={14} /> RESUME AUTO SCROLL
        </button>
      ) : null}
    </section>
  );
}
