"use client";

import { useState } from "react";
import { Heart, ListEnd, ListPlus, MoreHorizontal, Play } from "lucide-react";
import type { MusicTrack } from "@/lib/music/types";
import { useMusicPlayer } from "./music-player-core";
import styles from "./music-app.module.css";

export function TrackActions({ track }: { track: MusicTrack }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { addToPlaylist, addToQueue, playNext, playNow, state, toggleFavorite } = useMusicPlayer();
  const favorite = state.favorites.some((item) => item.videoId === track.videoId);

  return (
    <div className={styles.trackActions}>
      <button aria-label={`Phát ${track.title}`} onClick={() => playNow(track)} type="button">
        <Play aria-hidden="true" fill="currentColor" size={16} />
      </button>
      <button aria-label="Phát tiếp theo" onClick={() => playNext(track)} type="button">
        <ListEnd aria-hidden="true" size={16} />
      </button>
      <button aria-label="Thêm vào hàng đợi" onClick={() => addToQueue(track)} type="button">
        <ListPlus aria-hidden="true" size={16} />
      </button>
      <button
        aria-label={favorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
        aria-pressed={favorite}
        className={favorite ? styles.actionActive : undefined}
        onClick={() => toggleFavorite(track)}
        type="button"
      >
        <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} size={16} />
      </button>
      <div className={styles.actionMenuWrap}>
        <button
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Thêm vào playlist"
          disabled={!state.playlists.length}
          onClick={() => setMenuOpen((value) => !value)}
          type="button"
        >
          <MoreHorizontal aria-hidden="true" size={17} />
        </button>
        {menuOpen ? (
          <div className={styles.actionMenu} role="menu">
            {state.playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => {
                  addToPlaylist(playlist.id, track);
                  setMenuOpen(false);
                }}
                role="menuitem"
                type="button"
              >
                {playlist.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
