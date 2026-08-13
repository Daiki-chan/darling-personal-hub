"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Search, X } from "lucide-react";
import { searchYouTubeMusic, SearchApiError } from "@/lib/music/search-service";
import type { MusicTrack } from "@/lib/music/types";
import { formatTime } from "@/lib/music/format";
import { mergeUniqueTracks } from "@/lib/music/track-utils";
import { useMusicPlayer } from "./music-player-core";
import { TrackMenuTrigger } from "./track-actions";
import styles from "./music-app.module.css";

type SearchStatus = "idle" | "loading" | "ready" | "empty" | "error";

export function SearchPanel() {
  const { playNow } = useMusicPlayer();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MusicTrack[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextDebounceQueryRef = useRef<string | null>(null);
  const cooldownUntilRef = useRef<number>(0);
  const searchGenerationRef = useRef(0);
  const activePageRequestKeysRef = useRef<Set<string>>(new Set());
  const lastSuccessfulQueryRef = useRef("");

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownUntilRef.current - Date.now()) / 1000));
      setCooldownRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const runSearch = useCallback(async (searchQuery: string, append = false) => {
    const cleanQuery = searchQuery.trim();
    if (cleanQuery.length < 2) {
      setError("Từ khóa cần từ 2 đến 120 ký tự.");
      setStatus("error");
      return;
    }

    if (Date.now() < cooldownUntilRef.current) {
      const remaining = Math.max(1, Math.ceil((cooldownUntilRef.current - Date.now()) / 1000));
      setCooldownRemaining(remaining);
      setError(`Vui lòng chờ ${remaining}s.`);
      setStatus("error");
      return;
    }

    const pageToken = append ? nextPageToken : null;
    const pageKey = `${cleanQuery.toLowerCase()}::${pageToken ?? "first"}`;

    if (append) {
      if (activePageRequestKeysRef.current.has(pageKey)) return;
      activePageRequestKeysRef.current.add(pageKey);
    } else {
      activePageRequestKeysRef.current.clear();
      abortRef.current?.abort();
    }

    const controller = new AbortController();
    if (!append) abortRef.current = controller;
    const generation = ++searchGenerationRef.current;

    setStatus("loading");
    setError("");

    try {
      const payload = await searchYouTubeMusic(cleanQuery, pageToken, controller.signal);
      if (generation !== searchGenerationRef.current) return;

      setItems((current) => (append ? mergeUniqueTracks(current, payload.items) : payload.items));
      setNextPageToken(payload.nextPageToken);
      setStatus(payload.items.length || append ? "ready" : "empty");
      lastSuccessfulQueryRef.current = cleanQuery;
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      if (generation !== searchGenerationRef.current) return;

      if (reason instanceof SearchApiError && reason.code === "RATE_LIMITED") {
        const retrySec = reason.retryAfter || 6;
        cooldownUntilRef.current = Date.now() + retrySec * 1000;
        setCooldownRemaining(retrySec);
        setError(`Thao tác quá nhanh. Thử lại sau ${retrySec}s.`);
      } else {
        setError(reason instanceof Error ? reason.message : "Không thể tìm kiếm.");
      }
      setStatus("error");
    } finally {
      if (append) activePageRequestKeysRef.current.delete(pageKey);
    }
  }, [nextPageToken]);

  const triggerSearch = useCallback((searchQuery: string, append = false) => {
    clearDebounceTimer();
    void runSearch(searchQuery, append);
  }, [clearDebounceTimer, runSearch]);

  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 3 || cleanQuery === lastSuccessfulQueryRef.current) return;

    if (skipNextDebounceQueryRef.current !== null) {
      if (skipNextDebounceQueryRef.current === cleanQuery) {
        skipNextDebounceQueryRef.current = null;
        return;
      }
      skipNextDebounceQueryRef.current = null;
    }

    clearDebounceTimer();
    debounceTimerRef.current = setTimeout(() => {
      void runSearch(cleanQuery);
    }, 650);

    return () => clearDebounceTimer();
  }, [query, runSearch, clearDebounceTimer]);

  useEffect(() => {
    return () => {
      clearDebounceTimer();
      searchGenerationRef.current += 1;
    };
  }, [clearDebounceTimer]);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    triggerSearch(query);
  };

  const reset = () => {
    clearDebounceTimer();
    abortRef.current?.abort();
    searchGenerationRef.current += 1;
    activePageRequestKeysRef.current.clear();
    lastSuccessfulQueryRef.current = "";
    skipNextDebounceQueryRef.current = null;
    setQuery("");
    setItems([]);
    setNextPageToken(null);
    setError("");
    setStatus("idle");
    setCooldownRemaining(0);
    cooldownUntilRef.current = 0;
  };

  const isButtonDisabled = query.trim().length < 2 || status === "loading" || cooldownRemaining > 0;

  return (
    <section aria-label="Tìm kiếm kho nhạc" className={styles.searchSection}>
      <form className={styles.searchForm} onSubmit={handleSubmit} role="search">
        <div className={styles.searchPromptRow}>
          <input
            autoComplete="off"
            className={styles.searchInput}
            id="music-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="SEARCH THE ARCHIVE"
            type="search"
            value={query}
          />
          {query ? (
            <button aria-label="Xóa từ khóa" className={styles.searchClearBtn} onClick={reset} type="button">
              <X aria-hidden="true" size={16} />
            </button>
          ) : null}
          <button className={styles.searchSubmitBtn} disabled={isButtonDisabled} type="submit">
            {status === "loading" ? "SEARCHING..." : "SEARCH"}
          </button>
        </div>
      </form>

      {status === "loading" && !items.length ? (
        <div className={styles.searchResultsList} aria-label="Đang tìm kiếm">
          {Array.from({ length: 4 }, (_, index) => (
            <div className={styles.searchRowSkeleton} key={index} />
          ))}
        </div>
      ) : null}

      {status === "error" ? (
        <div className={styles.inlineState} role="alert">
          <AlertCircle aria-hidden="true" size={18} />
          <span>{error}</span>
          <button disabled={cooldownRemaining > 0} onClick={() => triggerSearch(query)} type="button">
            RETRY
          </button>
        </div>
      ) : null}

      {status === "empty" ? (
        <div className={styles.emptySearch}>
          <strong>NO RESULTS FOUND</strong>
          <span>Try searching for artist name, song title, or a shorter query.</span>
        </div>
      ) : null}

      {items.length ? (
        <div className={styles.resultsBlock}>
          <div className={styles.sectionHeading}>
            <h2>SEARCH RESULTS</h2>
            <span>{items.length} TRACKS FOUND</span>
          </div>

          <div className={styles.searchResultsList}>
            {items.map((track, index) => {
              const formattedIdx = String(index + 1).padStart(2, "0");
              return (
                <div
                  key={track.videoId}
                  className={styles.searchRow}
                  onClick={() => playNow(track)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      playNow(track);
                    }
                  }}
                >
                  <span className={styles.searchRowIdx}>{formattedIdx}</span>
                  <span className={styles.searchRowTitle} title={track.title}>
                    {track.title}
                  </span>
                  <span className={styles.searchRowArtist}>{track.artist}</span>
                  <span className={styles.searchRowDuration}>
                    {track.duration ? formatTime(track.duration) : "--:--"}
                  </span>

                  <div className={styles.searchRowTrigger} onClick={(e) => e.stopPropagation()}>
                    <TrackMenuTrigger surface={`search:${track.videoId}`} track={track} />
                  </div>
                </div>
              );
            })}
          </div>

          {nextPageToken ? (
            <button
              className={styles.loadMore}
              disabled={status === "loading" || cooldownRemaining > 0}
              onClick={() => triggerSearch(lastSuccessfulQueryRef.current || query, true)}
              type="button"
            >
              {status === "loading" ? "LOADING MORE" : "LOAD MORE RESULTS"}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
