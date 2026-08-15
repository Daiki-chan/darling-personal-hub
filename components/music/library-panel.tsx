"use client";

import Image from "next/image";
import { type FormEvent, useState } from "react";
import { Pencil, Play, Plus, Shuffle, Trash2, X } from "lucide-react";
import type { MusicTrack } from "@/lib/music/types";
import { useSectionMotion } from "@/components/motion/use-section-motion";
import { useMusicPlayer } from "./music-player-core";
import { TrackMenuTrigger } from "./track-actions";
import styles from "./music-app.module.css";

function EditorialTrackList({ title, tracks }: { title: string; tracks: MusicTrack[] }) {
  const { playNow } = useMusicPlayer();
  const [hoveredTrack, setHoveredTrack] = useState<MusicTrack | null>(null);

  if (!tracks.length) return null;

  return (
    <div className={styles.libraryColumn}>
      <div className={styles.chapterHeading}>
        <h3 className={styles.librarySubTitle}>{title}</h3>
        <span className={styles.chapterSub}>{tracks.length} TRACKS</span>
      </div>

      <div className={styles.editorialList}>
        {tracks.slice(0, 10).map((track, index) => {
          const formattedIdx = String(index + 1).padStart(2, "0");
          return (
            <div
              key={track.videoId}
              className={styles.editorialRow}
              onClick={() => playNow(track)}
              onPointerEnter={() => setHoveredTrack(track)}
              onPointerLeave={() => setHoveredTrack(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  playNow(track);
                }
              }}
            >
              <span className={styles.editorialIdx}>{formattedIdx}</span>
              <span className={styles.editorialTitle} title={track.title}>
                {track.title}
              </span>
              <span className={styles.editorialArtist}>{track.artist}</span>

              <div className={styles.editorialAction} onClick={(e) => e.stopPropagation()}>
                <TrackMenuTrigger surface={`library:${title}:${track.videoId}`} track={track} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed thumbnail preview container */}
      {hoveredTrack ? (
        <div className={styles.fixedHoverPreview}>
          <Image
            alt={`Preview ${hoveredTrack.title}`}
            height={80}
            src={hoveredTrack.thumbnail}
            width={80}
          />
        </div>
      ) : null}
    </div>
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
  const archiveMotionRef = useSectionMotion<HTMLElement>();
  const playlistsMotionRef = useSectionMotion<HTMLElement>();

  const submitPlaylist = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    setNewName("");
  };

  return (
    <div className={styles.libraryPanel}>
      {/* Chapter 03: Your Archive */}
      <section ref={archiveMotionRef} className={styles.editorialChapter} aria-labelledby="archive-title">
        <div className={styles.chapterHeading} data-motion-reveal>
          <h2 id="archive-title" className={styles.chapterTitle}>
            03 / YOUR ARCHIVE
          </h2>
          <span className={styles.chapterSub}>PERSONAL LISTENING HISTORY & FAVOURITES</span>
        </div>

        <div className={styles.archiveDualColumns} data-motion-reveal>
          <EditorialTrackList title="RECENTLY PLAYED" tracks={state.history} />
          <EditorialTrackList title="FAVOURITES" tracks={state.favorites} />
        </div>
      </section>

      {/* Chapter 04: Playlists */}
      <section ref={playlistsMotionRef} className={styles.editorialChapter} aria-labelledby="playlists-title">
        <div className={styles.chapterHeading} data-motion-reveal>
          <h2 id="playlists-title" className={styles.chapterTitle}>
            04 / PLAYLISTS
          </h2>
          <span className={styles.chapterSub}>INDEXEDDB PERSISTED COLLECTIONS</span>
        </div>

        <div className={styles.playlistHeaderRow} data-motion-reveal>
          <form className={styles.playlistNewForm} onSubmit={submitPlaylist}>
            <input
              id="playlist-name"
              maxLength={48}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="PLAYLIST NAME"
              value={newName}
            />
            <button disabled={!newName.trim()} type="submit">
              <Plus aria-hidden="true" size={14} /> NEW PLAYLIST
            </button>
          </form>
        </div>

        {state.playlists.length ? (
          <div className={styles.playlistIndexList}>
            {state.playlists.map((playlist) => (
              <article className={styles.playlistIndexRow} key={playlist.id}>
                <div className={styles.playlistMainInfo}>
                  {editingId === playlist.id ? (
                    <form
                      className={styles.renameFormInline}
                      onSubmit={(event) => {
                        event.preventDefault();
                        renamePlaylist(playlist.id, editingName);
                        setEditingId(null);
                      }}
                    >
                      <input
                        aria-label="Tên playlist"
                        onChange={(event) => setEditingName(event.target.value)}
                        value={editingName}
                      />
                      <button type="submit">SAVE</button>
                    </form>
                  ) : (
                    <div className={styles.playlistTitleWrap}>
                      <h3 className={styles.playlistName}>{playlist.name}</h3>
                      <span className={styles.playlistCount}>{playlist.tracks.length} TRACKS</span>
                    </div>
                  )}

                  <div className={styles.playlistMetaActions}>
                    <button
                      aria-label={`Sửa ${playlist.name}`}
                      onClick={() => {
                        setEditingId(playlist.id);
                        setEditingName(playlist.name);
                      }}
                      type="button"
                    >
                      <Pencil aria-hidden="true" size={14} />
                    </button>
                    <button
                      aria-label={`Xóa ${playlist.name}`}
                      onClick={() => deletePlaylist(playlist.id)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={14} />
                    </button>
                  </div>
                </div>

                <div className={styles.playlistPlayButtons}>
                  <button
                    disabled={!playlist.tracks.length}
                    onClick={() => playCollection(playlist.tracks)}
                    type="button"
                  >
                    <Play aria-hidden="true" fill="currentColor" size={13} /> PLAY ALL
                  </button>
                  <button
                    disabled={!playlist.tracks.length}
                    onClick={() => playCollection(playlist.tracks, true)}
                    type="button"
                  >
                    <Shuffle aria-hidden="true" size={13} /> SHUFFLE
                  </button>
                </div>

                {playlist.tracks.length ? (
                  <ul className={styles.playlistTrackList}>
                    {playlist.tracks.map((track) => (
                      <li key={track.videoId} className={styles.playlistTrackSubRow}>
                        <span>{track.title}</span>
                        <button
                          aria-label={`Xóa ${track.title} khỏi ${playlist.name}`}
                          onClick={() => removeFromPlaylist(playlist.id, track.videoId)}
                          type="button"
                        >
                          <X aria-hidden="true" size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
