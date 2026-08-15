"use client";

import type { CSSProperties } from "react";
import { LibraryPanel } from "./library-panel";
import { MusicArchiveHero } from "./music-archive-hero";
import { MusicHome } from "./music-home";
import { useMusicPlayer } from "./music-player-core";
import { QueuePanel } from "./queue-panel";
import { SearchPanel } from "./search-panel";
import { TrackMenuProvider } from "./track-menu-context";
import styles from "./music-app.module.css";

export function MusicApp() {
  const { state } = useMusicPlayer();
  const style = { "--music-accent": state.accent } as CSSProperties;

  return (
    <TrackMenuProvider>
      <div className={`${styles.hub} ${state.currentTrack ? styles.hubWithPlayer : ""}`} style={style}>
        <div className={styles.ambientBackground} aria-hidden="true" />
        <div className={styles.hubInner}>
          {/* Top Hero with integrated Kinetic Signal Field */}
          <MusicArchiveHero />

          {/* Search utility section below Hero */}
          <SearchPanel />

          {state.restored ? (
            <>
              {/* Vertically separated Chapters 01 / Discover & 02 / For You */}
              <MusicHome />

              {/* Chapters 03 / Your Archive & 04 / Playlists + Queue */}
              <div className={styles.mainLayout}>
                <LibraryPanel />
                <aside className={styles.queueAside}>
                  <QueuePanel />
                </aside>
              </div>
            </>
          ) : (
            <div className={styles.restoreSkeleton} aria-label="Đang khôi phục thư viện">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      </div>
    </TrackMenuProvider>
  );
}
