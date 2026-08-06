"use client";

import { type FormEvent, useState } from "react";
import { Heart, Pencil, Play, Plus, Shuffle, Trash2, X } from "lucide-react";
import type { MusicTrack } from "@/lib/music/types";
import { useMusicPlayer } from "./music-player-core";
import { TrackActions } from "./track-actions";
import styles from "./music-app.module.css";

function TrackStrip({ title, tracks }: { title: string; tracks: MusicTrack[] }) {
  if (!tracks.length) return null;
  return (
    <section className={styles.libraryGroup}>
      <div className={styles.sectionHeading}>
        <h2>{title}</h2>
        <span>{tracks.length} bài</span>
      </div>
      <div className={styles.trackStrip}>
        {tracks.slice(0, 8).map((track) => (
          <article className={styles.stripItem} key={track.videoId}>
            <img alt={`Thumbnail ${track.title}`} height="80" loading="lazy" src={track.thumbnail} width="80" />
            <div><strong>{track.title}</strong><span>{track.artist}</span></div>
            <TrackActions track={track} />
          </article>
        ))}
      </div>
    </section>
  );
}

export function LibraryPanel() {
  const {
    createPlaylist,
    deletePlaylist,
    playCollection,
    removeFromPlaylist,
    renamePlaylist,
    state,
  } = useMusicPlayer();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const submitPlaylist = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createPlaylist(newName);
    setNewName("");
  };

  return (
    <div className={styles.libraryPanel}>
      <TrackStrip title="Nghe gần đây" tracks={state.history} />
      <TrackStrip title="Bài hát yêu thích" tracks={state.favorites} />

      {!state.history.length && !state.favorites.length ? (
        <section className={styles.libraryEmpty}>
          <div className={styles.emptyArtwork} aria-hidden="true"><Heart size={28} /></div>
          <div>
            <h2>Thư viện sẽ mang dấu vết của bạn</h2>
            <p>Bài đã nghe và bài yêu thích sẽ xuất hiện ở đây, được lưu riêng trên thiết bị này.</p>
          </div>
        </section>
      ) : null}

      <section className={styles.playlistSection}>
        <div className={styles.playlistIntro}>
          <div>
            <h2>Playlist cá nhân</h2>
            <p>Gom những bài cùng một tâm trạng. Dữ liệu được lưu bằng IndexedDB.</p>
          </div>
          <form onSubmit={submitPlaylist}>
            <label htmlFor="playlist-name">Tên playlist mới</label>
            <div>
              <input
                id="playlist-name"
                maxLength={48}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Ví dụ: Đêm mưa"
                value={newName}
              />
              <button disabled={!newName.trim()} type="submit"><Plus aria-hidden="true" size={17} />Tạo</button>
            </div>
          </form>
        </div>

        {state.playlists.length ? (
          <div className={styles.playlistList}>
            {state.playlists.map((playlist) => (
              <article className={styles.playlist} key={playlist.id}>
                <div className={styles.playlistCover} aria-hidden="true">
                  {playlist.tracks.slice(0, 4).map((track) => (
                    <img alt="" key={track.videoId} src={track.thumbnail} />
                  ))}
                  {!playlist.tracks.length ? <Heart size={22} /> : null}
                </div>
                <div className={styles.playlistContent}>
                  {editingId === playlist.id ? (
                    <form
                      className={styles.renameForm}
                      onSubmit={(event) => {
                        event.preventDefault();
                        renamePlaylist(playlist.id, editingName);
                        setEditingId(null);
                      }}
                    >
                      <input aria-label="Tên playlist" onChange={(event) => setEditingName(event.target.value)} value={editingName} />
                      <button type="submit">Lưu</button>
                    </form>
                  ) : (
                    <div className={styles.playlistTitle}>
                      <div><h3>{playlist.name}</h3><span>{playlist.tracks.length} bài</span></div>
                      <div>
                        <button
                          aria-label={`Đổi tên ${playlist.name}`}
                          onClick={() => { setEditingId(playlist.id); setEditingName(playlist.name); }}
                          type="button"
                        ><Pencil aria-hidden="true" size={16} /></button>
                        <button aria-label={`Xóa ${playlist.name}`} onClick={() => deletePlaylist(playlist.id)} type="button">
                          <Trash2 aria-hidden="true" size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className={styles.playlistControls}>
                    <button disabled={!playlist.tracks.length} onClick={() => playCollection(playlist.tracks)} type="button">
                      <Play aria-hidden="true" fill="currentColor" size={15} />Phát tất cả
                    </button>
                    <button disabled={!playlist.tracks.length} onClick={() => playCollection(playlist.tracks, true)} type="button">
                      <Shuffle aria-hidden="true" size={15} />Phát ngẫu nhiên
                    </button>
                  </div>
                  {playlist.tracks.length ? (
                    <ul className={styles.playlistTracks}>
                      {playlist.tracks.map((track) => (
                        <li key={track.videoId}>
                          <span>{track.title}</span>
                          <button
                            aria-label={`Xóa ${track.title} khỏi ${playlist.name}`}
                            onClick={() => removeFromPlaylist(playlist.id, track.videoId)}
                            type="button"
                          ><X aria-hidden="true" size={14} /></button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className={styles.playlistEmpty}>Dùng menu trên một bài hát để thêm vào playlist này.</p>}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
