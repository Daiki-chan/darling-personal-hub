"use client";

import Image from "next/image";
import { AlertCircle, Play, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { rankMusicTracks } from "@/lib/music/ranking";
import { fetchTrendingMusic } from "@/lib/music/trending-service";
import type { MusicTrack } from "@/lib/music/types";
import { useMusicPlayer } from "./music-player-core";
import { TrackFavoriteAction, TrackMenuTrigger } from "./track-actions";
import styles from "./music-app.module.css";

type TrendingStatus = "loading" | "ready" | "empty" | "error";

function TrackRail({ tracks, label, surface }: { tracks: MusicTrack[]; label: string; surface: string }) {
  const { playNow } = useMusicPlayer();
  if (!tracks.length) return null;
  return (
    <div className={styles.homeRail} aria-label={label}>
      {tracks.slice(0, 12).map((track) => (
        <article className={styles.homeTrack} key={`${surface}:${track.videoId}`}>
          <div className={styles.homeTrackCover}>
            <Image
              alt={`Thumbnail ${track.title}`}
              className={styles.homeTrackImage}
              height={360}
              sizes="(max-width: 767px) 78vw, 240px"
              src={track.thumbnail}
              width={360}
            />
            <button
              aria-label={`Phát ${track.title}`}
              className={styles.homeTrackPlay}
              onClick={(e) => {
                e.stopPropagation();
                playNow(track);
              }}
              type="button"
            >
              <Play aria-hidden="true" fill="currentColor" size={20} />
            </button>
          </div>

          <div className={styles.homeTrackMeta}>
            <div className={styles.homeTrackHeading}>
              <strong className={styles.trackTitle} title={track.title}>
                {track.title}
              </strong>
              <TrackMenuTrigger surface={surface} track={track} />
            </div>

            <div className={styles.homeTrackSubline}>
              <span className={styles.trackArtist}>
                {track.artist}
              </span>
              <TrackFavoriteAction track={track} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function MusicHome() {
  const { state } = useMusicPlayer();
  const [status, setStatus] = useState<TrendingStatus>("loading");
  const [trending, setTrending] = useState<MusicTrack[]>([]);

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
    if (!reference) return trending.slice(6, 16);
    return rankMusicTracks(trending, {
      targetArtist: reference.artist,
      recentVideoIds: state.history.slice(0, 20).map((track) => track.videoId),
    }).filter((track) => !state.history.some((entry) => entry.videoId === track.videoId)).slice(0, 10);
  }, [state.favorites, state.history, trending]);

  return (
    <div className={styles.musicHome}>
      <section className={styles.homeSection} aria-labelledby="trending-vn-title">
        <div className={styles.sectionHeading}>
          <h2 id="trending-vn-title">Thịnh hành tại Việt Nam</h2>
          <span>YouTube Music category</span>
        </div>
        {status === "loading" && !trending.length ? (
          <div className={styles.homeRail} aria-label="Đang tải nhạc thịnh hành">
            {Array.from({ length: 6 }, (_, index) => <div className={styles.homeSkeleton} key={index} />)}
          </div>
        ) : null}
        {status === "error" ? (
          <div className={styles.inlineState} role="alert">
            <AlertCircle aria-hidden="true" size={20} />
            <div><strong>Chưa tải được nhạc thịnh hành</strong><span>Dữ liệu đã lưu vẫn được ưu tiên khi có thể.</span></div>
            <button onClick={() => {
              setStatus("loading");
              load(new AbortController().signal);
            }} type="button"><RefreshCw aria-hidden="true" size={15} />Thử lại</button>
          </div>
        ) : null}
        {status === "empty" ? (
          <div className={styles.emptySearch}><strong>Chưa có dữ liệu thịnh hành</strong><span>Hãy thử lại sau hoặc tìm một nghệ sĩ bạn yêu thích.</span></div>
        ) : null}
        {trending.length ? <TrackRail label="Phổ biến hôm nay" surface="home-trending" tracks={trending} /> : null}
      </section>

      {/* Primary and ONLY "Dành cho bạn" section */}
      <section id="for-you-section" className={styles.homeSection} aria-labelledby="for-you-title">
        <div className={styles.sectionHeading}>
          <h2 id="for-you-title">Dành cho bạn</h2>
          <span>{recommended.length} bài gợi ý</span>
        </div>
        <TrackRail label="Gợi ý dành cho bạn" surface="home-recommended" tracks={recommended} />
      </section>
    </div>
  );
}
