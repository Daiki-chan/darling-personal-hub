"use client";

import Image from "next/image";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { rankMusicTracks } from "@/lib/music/ranking";
import { useSectionMotion } from "@/components/motion/use-section-motion";
import { fetchTrendingMusic } from "@/lib/music/trending-service";
import type { MusicTrack } from "@/lib/music/types";
import { useMusicPlayer } from "./music-player-core";
import { TrackMenuTrigger } from "./track-actions";
import styles from "./music-app.module.css";

type TrendingStatus = "loading" | "ready" | "empty" | "error";

// 01 / DISCOVER Catalogue Rail
function DiscoverRail({ tracks }: { tracks: MusicTrack[] }) {
  const { playNow } = useMusicPlayer();
  if (!tracks.length) return null;

  return (
    <div className={styles.discoverRail} aria-label="Danh sách nhạc thịnh hành">
      {tracks.slice(0, 12).map((track, index) => {
        const formattedIndex = String(index + 1).padStart(2, "0");
        return (
          <article
            className={styles.discoverCard}
            key={`trending:${track.videoId}`}
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
            <div className={styles.discoverCoverWrap}>
              <Image
                loading={index === 0 ? "eager" : undefined}
                alt={`Thumbnail ${track.title}`}
                className={styles.discoverImage}
                height={280}
                sizes="(max-width: 767px) 70vw, 240px"
                src={track.thumbnail}
                width={280}
              />
              <span className={styles.discoverIndexTag}>{formattedIndex}</span>
            </div>

            <div className={styles.discoverMeta}>
              <div className={styles.discoverTitleRow}>
                <strong className={styles.discoverTitle} title={track.title}>
                  {track.title}
                </strong>
                <div onClick={(e) => e.stopPropagation()}>
                  <TrackMenuTrigger surface="trending" track={track} />
                </div>
              </div>
              <span className={styles.discoverArtist}>{track.artist}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

// 02 / FOR YOU Editorial Chapter with Track Index List & Large Artwork Preview
function ForYouChapter({ tracks }: { tracks: MusicTrack[] }) {
  const { playNow } = useMusicPlayer();
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);

  if (!tracks.length) return null;

  const previewTrack = tracks[activeTrackIndex] || tracks[0];

  return (
    <div className={styles.forYouLayout} data-motion-reveal>
      {/* Left Column: Track Index List */}
      <div className={styles.forYouList}>
        {tracks.slice(0, 8).map((track, index) => {
          const formattedIdx = String(index + 1).padStart(2, "0");
          const isCurrentHover = index === activeTrackIndex;

          return (
            <div
              key={`foryou:${track.videoId}`}
              className={styles.forYouRow}
              data-active={isCurrentHover}
              onPointerEnter={() => setActiveTrackIndex(index)}
              onFocus={() => setActiveTrackIndex(index)}
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
              <span className={styles.forYouIdx}>{formattedIdx}</span>
              <div className={styles.forYouText}>
                <strong className={styles.forYouTitle} title={track.title}>
                  {track.title}
                </strong>
                <span className={styles.forYouArtist}>{track.artist}</span>
              </div>
              <div className={styles.forYouActions} onClick={(e) => e.stopPropagation()}>
                <TrackMenuTrigger surface="foryou" track={track} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Large Active Artwork Preview */}
      <div className={styles.forYouPreviewContainer}>
        {previewTrack ? (
          <div className={styles.forYouPreviewCard}>
            <div className={styles.forYouImageWrap}>
              <Image
                alt={`Preview ${previewTrack.title}`}
                className={styles.forYouPreviewImage}
                fill
                src={previewTrack.thumbnail}
                sizes="(max-width: 767px) calc(100vw - 32px), 400px"
              />
            </div>
            <div className={styles.forYouPreviewMeta}>
              <span className={styles.forYouTag}>CURATED SELECTION</span>
              <h3 className={styles.forYouPreviewTitle}>{previewTrack.title}</h3>
              <p className={styles.forYouPreviewArtist}>{previewTrack.artist}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MusicHome() {
  const { state } = useMusicPlayer();
  const [status, setStatus] = useState<TrendingStatus>("loading");
  const [trending, setTrending] = useState<MusicTrack[]>([]);
  const discoverMotionRef = useSectionMotion<HTMLElement>();
  const forYouMotionRef = useSectionMotion<HTMLElement>();

  const load = useCallback((signal: AbortSignal) => {
    fetchTrendingMusic(signal)
      .then((payload) => {
        setTrending(payload.items);
        setStatus(payload.items.length ? "ready" : "empty");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const recommended = useMemo(() => {
    const reference = state.history[0] ?? state.favorites[0];
    if (!reference) return trending.slice(6, 14);
    return rankMusicTracks(trending, {
      targetArtist: reference.artist,
      recentVideoIds: state.history.slice(0, 20).map((track) => track.videoId),
    }).filter((track) => !state.history.some((entry) => entry.videoId === track.videoId)).slice(0, 8);
  }, [state.favorites, state.history, trending]);

  return (
    <div className={styles.musicHomeContainer}>
      {/* Chapter 01: Discover */}
      <section ref={discoverMotionRef} className={styles.editorialChapter} id="discover" aria-labelledby="discover-title">
        <div className={styles.chapterHeading} data-motion-reveal>
          <h2 id="discover-title" className={styles.chapterTitle}>
            01 / DISCOVER
          </h2>
          <span className={styles.chapterSub}>TRENDING CATALOGUE · VIETNAM</span>
        </div>

        {status === "loading" && !trending.length ? (
          <div className={styles.discoverRail} aria-label="Đang tải nhạc thịnh hành">
            {Array.from({ length: 6 }, (_, index) => (
              <div className={styles.discoverSkeleton} key={index} />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <div className={styles.inlineState} role="alert">
            <AlertCircle aria-hidden="true" size={20} />
            <div>
              <strong>CHƯA TẢI ĐƯỢC DỮ LIỆU THỊNH HÀNH</strong>
              <span>Dữ liệu đã lưu vẫn được ưu tiên khi có thể.</span>
            </div>
            <button
              onClick={() => {
                setStatus("loading");
                load(new AbortController().signal);
              }}
              type="button"
            >
              <RefreshCw aria-hidden="true" size={15} /> THỬ LẠI
            </button>
          </div>
        ) : null}

        {status === "empty" ? (
          <div className={styles.emptySearch}>
            <strong>CHƯA CÓ DỮ LIỆU THỊNH HÀNH</strong>
            <span>Thử tìm kiếm trực tiếp tên bài hát hoặc nghệ sĩ yêu thích.</span>
          </div>
        ) : null}

        {trending.length ? <DiscoverRail tracks={trending} /> : null}
      </section>

      {/* Chapter 02: For You */}
      <section ref={forYouMotionRef} className={styles.editorialChapter} aria-labelledby="for-you-title">
        <div className={styles.chapterHeading} data-motion-reveal>
          <h2 id="for-you-title" className={styles.chapterTitle}>
            02 / FOR YOU
          </h2>
          <span className={styles.chapterSub}>CURATED RECOMMENDATIONS</span>
        </div>
        <ForYouChapter tracks={recommended} />
      </section>
    </div>
  );
}
