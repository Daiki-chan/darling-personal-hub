"use client";

import Image from "next/image";
import { AlertCircle, Play, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { rankMusicTracks } from "@/lib/music/ranking";
import { fetchTrendingMusic } from "@/lib/music/trending-service";
import type { MusicTrack } from "@/lib/music/types";
import { useMusicPlayer } from "./music-player-core";
import { TrackActions } from "./track-actions";
import styles from "./music-app.module.css";

type TrendingStatus = "loading" | "ready" | "empty" | "error";

function TrackRail({ tracks, label }: { tracks: MusicTrack[]; label: string }) {
  const { playNow } = useMusicPlayer();
  if (!tracks.length) return null;
  return (
      <div className={styles.homeRail} aria-label={label}>
        {tracks.slice(0, 12).map((track) => (
          <article className={styles.homeTrack} key={track.videoId}>
            <button className={styles.homeTrackPlay} onClick={() => playNow(track)} type="button">
              <Image alt={`Thumbnail ${track.title}`} height={360} sizes="(max-width: 767px) 78vw, 290px" src={track.thumbnail} width={480} />
              <span aria-hidden="true"><Play fill="currentColor" size={18} /></span>
            </button>
            <div className={styles.homeTrackCopy}>
              <strong title={track.title}>{track.title}</strong>
              <span>{track.artist}</span>
            </div>
            <TrackActions track={track} />
          </article>
        ))}
      </div>
  );
}

function MusicRail({ title, tracks }: { title: string; tracks: MusicTrack[] }) {
  if (!tracks.length) return null;
  return (
    <section className={styles.homeSection} aria-label={title}>
      <div className={styles.sectionHeading}>
        <h2>{title}</h2>
        <span>{tracks.length} bài</span>
      </div>
      <TrackRail label={title} tracks={tracks} />
    </section>
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
      {state.currentTrack ? <MusicRail title="Tiếp tục nghe" tracks={[state.currentTrack]} /> : null}

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
        {trending.length ? <TrackRail label="Phổ biến hôm nay" tracks={trending} /> : null}
      </section>

      <MusicRail title="Dành cho bạn" tracks={recommended} />
      <MusicRail title="Nghe gần đây" tracks={state.history} />
      <MusicRail title="Yêu thích" tracks={state.favorites} />
    </div>
  );
}
