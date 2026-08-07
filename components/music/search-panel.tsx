"use client";

import Image from "next/image";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Play, Search, X } from "lucide-react";
import { searchYouTubeMusic, SearchApiError } from "@/lib/music/search-service";
import type { MusicTrack } from "@/lib/music/types";
import { formatTime } from "@/lib/music/format";
import { mergeUniqueTracks } from "@/lib/music/track-utils";
import { useMusicPlayer } from "./music-player-core";
import { TrackActions } from "./track-actions";
import styles from "./music-app.module.css";

type SearchStatus = "idle" | "loading" | "ready" | "empty" | "error";
const suggestions = ["nhạc Việt đêm khuya", "lofi acoustic", "city pop", "indie chill"];

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

  // Cooldown countdown effect based on deadline
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownUntilRef.current - Date.now()) / 1000));
      setCooldownRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const runSearch = useCallback(async (searchQuery: string, append = false) => {
    const cleanQuery = searchQuery.trim();
    if (cleanQuery.length < 2) {
      setError("Từ khóa cần có từ 2 đến 120 ký tự.");
      setStatus("error");
      return;
    }

    if (Date.now() < cooldownUntilRef.current) {
      const remaining = Math.max(1, Math.ceil((cooldownUntilRef.current - Date.now()) / 1000));
      setCooldownRemaining(remaining);
      setError(`Bạn thao tác hơi nhanh. Vui lòng thử lại sau ${remaining} giây.`);
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
        setError(`Bạn thao tác hơi nhanh. Vui lòng thử lại sau ${retrySec} giây.`);
      } else {
        setError(reason instanceof Error ? reason.message : "Không thể tải kết quả tìm kiếm.");
      }
      setStatus("error");
    } finally {
      if (append) {
        activePageRequestKeysRef.current.delete(pageKey);
      }
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
      abortRef.current?.abort();
    };
  }, [clearDebounceTimer]);

  const handleSuggestionClick = (suggestion: string) => {
    const cleanSuggestion = suggestion.trim();
    clearDebounceTimer();
    if (cleanSuggestion !== query.trim()) {
      skipNextDebounceQueryRef.current = cleanSuggestion;
      setQuery(suggestion);
    } else {
      skipNextDebounceQueryRef.current = null;
    }
    triggerSearch(cleanSuggestion);
  };

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
    <section aria-labelledby="music-search-title" className={styles.searchSection}>
      <div className={styles.searchHeading}>
        <div>
          <p className={styles.kicker}>YouTube-powered</p>
          <h1 id="music-search-title">Âm nhạc cho khoảng riêng.</h1>
          <p>Tìm một bài hát, giữ lại những gì đáng nghe và để Darling lo phần còn lại.</p>
        </div>
        <form className={styles.searchForm} onSubmit={handleSubmit} role="search">
          <label htmlFor="music-search">Tìm bài hát hoặc nghệ sĩ</label>
          <div className={styles.searchControl}>
            <Search aria-hidden="true" size={20} />
            <input
              autoComplete="off"
              id="music-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ví dụ: Vũ, Taylor Swift, city pop"
              type="search"
              value={query}
            />
            {query ? (
              <button aria-label="Xóa từ khóa" onClick={reset} type="button">
                <X aria-hidden="true" size={18} />
              </button>
            ) : null}
          </div>
          <button disabled={isButtonDisabled} type="submit">
            {status === "loading" ? "Đang tìm" : cooldownRemaining > 0 ? `Chờ ${cooldownRemaining}s` : "Tìm nhạc"}
          </button>
        </form>
      </div>

      {status === "idle" ? (
        <div className={styles.suggestions} aria-label="Gợi ý tìm kiếm">
          {suggestions.map((suggestion) => (
            <button key={suggestion} onClick={() => handleSuggestionClick(suggestion)} type="button">
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      {status === "loading" && !items.length ? (
        <div className={styles.searchGrid} aria-label="Đang tải kết quả">
          {Array.from({ length: 6 }, (_, index) => <div className={styles.searchSkeleton} key={index} />)}
        </div>
      ) : null}

      {status === "error" ? (
        <div className={styles.inlineState} role="alert">
          <AlertCircle aria-hidden="true" size={20} />
          <div><strong>Chưa thể tìm kiếm</strong><span>{error}</span></div>
          <button disabled={cooldownRemaining > 0} onClick={() => triggerSearch(query)} type="button">Thử lại</button>
        </div>
      ) : null}

      {status === "empty" ? (
        <div className={styles.emptySearch}>
          <Search aria-hidden="true" size={26} />
          <strong>Không tìm thấy bài phù hợp</strong>
          <span>Thử tên nghệ sĩ, tên bài hát hoặc một cách viết ngắn hơn.</span>
        </div>
      ) : null}

      {items.length ? (
        <div className={styles.resultsBlock}>
          <div className={styles.sectionHeading}>
            <h2>Kết quả tìm kiếm</h2>
            <span>{items.length} video có thể phát nhúng</span>
          </div>
          <div className={styles.searchGrid}>
            {items.map((track) => (
              <article className={styles.searchCard} key={track.videoId}>
                <div className={styles.searchCardMain}>
                  <Image
                    alt={`Thumbnail ${track.title}`}
                    height={360}
                    sizes="(max-width: 767px) 100vw, (max-width: 1120px) 50vw, 33vw"
                    src={track.thumbnail}
                    width={480}
                  />
                  <button
                    aria-label={`Phát ${track.title}`}
                    className={styles.cardOverlayPlay}
                    onClick={(e) => {
                      e.stopPropagation();
                      playNow(track);
                    }}
                    type="button"
                  >
                    <Play fill="currentColor" size={20} />
                  </button>
                </div>
                <div className={styles.searchCardCopy}>
                  <div className={styles.trackHeading}>
                    <div className={styles.trackMeta}>
                      <strong className={styles.trackTitle} title={track.title}>{track.title}</strong>
                      <span className={styles.trackArtist}>{track.artist}</span>
                    </div>
                    <TrackActions surface={`search:${track.videoId}`} track={track} />
                  </div>
                  <small
                    title={track.ranking?.signals.map((signal) => `${signal.points > 0 ? "+" : ""}${signal.points} ${signal.label}`).join("\n")}
                  >
                    {track.duration ? formatTime(track.duration) : "Thời lượng chưa rõ"}{track.ranking ? ` · Điểm ưu tiên ${track.ranking.score}` : ""}
                  </small>
                </div>
              </article>
            ))}
          </div>
          {nextPageToken ? (
            <button
              className={styles.loadMore}
              disabled={status === "loading" || cooldownRemaining > 0}
              onClick={() => triggerSearch(lastSuccessfulQueryRef.current || query, true)}
              type="button"
            >
              {status === "loading" ? "Đang tải thêm" : "Tải thêm kết quả"}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
