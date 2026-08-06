"use client";

import Image from "next/image";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Search, X } from "lucide-react";
import { searchYouTubeMusic } from "@/lib/music/search-service";
import type { MusicTrack } from "@/lib/music/types";
import { formatTime } from "@/lib/music/format";
import { TrackActions } from "./track-actions";
import styles from "./music-app.module.css";

type SearchStatus = "idle" | "loading" | "ready" | "empty" | "error";
const suggestions = ["nhạc Việt đêm khuya", "lofi acoustic", "city pop", "indie chill"];

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MusicTrack[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const requestRef = useRef(0);
  const lastQueryRef = useRef("");

  const runSearch = useCallback(async (searchQuery: string, append = false) => {
    const cleanQuery = searchQuery.trim();
    if (cleanQuery.length < 2) {
      setError("Nhập ít nhất 2 ký tự để tìm kiếm.");
      setStatus("error");
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestRef.current;
    setStatus("loading");
    setError("");
    const pageToken = append ? nextPageToken : null;
    try {
      const payload = await searchYouTubeMusic(cleanQuery, pageToken, controller.signal);
      if (requestId !== requestRef.current) return;
      setItems((current) => append ? [...current, ...payload.items] : payload.items);
      setNextPageToken(payload.nextPageToken);
      setStatus(payload.items.length || append ? "ready" : "empty");
      lastQueryRef.current = cleanQuery;
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      if (requestId !== requestRef.current) return;
      setError(reason instanceof Error ? reason.message : "Không thể tải kết quả tìm kiếm.");
      setStatus("error");
    }
  }, [nextPageToken]);

  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 3 || cleanQuery === lastQueryRef.current) return;
    const timeout = window.setTimeout(() => void runSearch(cleanQuery), 650);
    return () => window.clearTimeout(timeout);
  }, [query, runSearch]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runSearch(query);
  };

  const reset = () => {
    abortRef.current?.abort();
    requestRef.current += 1;
    lastQueryRef.current = "";
    setQuery("");
    setItems([]);
    setNextPageToken(null);
    setError("");
    setStatus("idle");
  };

  return (
    <section aria-labelledby="music-search-title" className={styles.searchSection}>
      <div className={styles.searchHeading}>
        <div>
          <p className={styles.kicker}>YouTube-powered</p>
          <h1 id="music-search-title">Âm nhạc cho khoảng riêng.</h1>
          <p>Tìm một bài hát, giữ lại những gì đáng nghe và để Darling lo phần còn lại.</p>
        </div>
        <form className={styles.searchForm} onSubmit={submit} role="search">
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
          <button disabled={query.trim().length < 2 || status === "loading"} type="submit">
            {status === "loading" ? "Đang tìm" : "Tìm nhạc"}
          </button>
        </form>
      </div>

      {status === "idle" ? (
        <div className={styles.suggestions} aria-label="Gợi ý tìm kiếm">
          {suggestions.map((suggestion) => (
            <button key={suggestion} onClick={() => { setQuery(suggestion); void runSearch(suggestion); }} type="button">
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
          <button onClick={() => void runSearch(query)} type="button">Thử lại</button>
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
                </div>
                <div className={styles.searchCardCopy}>
                  <strong title={track.title}>{track.title}</strong>
                  <span>{track.artist}</span>
                  <small
                    title={track.ranking?.signals.map((signal) => `${signal.points > 0 ? "+" : ""}${signal.points} ${signal.label}`).join("\n")}
                  >
                    {track.duration ? formatTime(track.duration) : "Thời lượng chưa rõ"}{track.ranking ? ` · Điểm ưu tiên ${track.ranking.score}` : ""}
                  </small>
                </div>
                <TrackActions track={track} />
              </article>
            ))}
          </div>
          {nextPageToken ? (
            <button
              className={styles.loadMore}
              disabled={status === "loading"}
              onClick={() => void runSearch(lastQueryRef.current || query, true)}
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
