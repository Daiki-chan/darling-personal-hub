"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = Boolean(useReducedMotion());
  const style = { "--music-accent": state.accent } as CSSProperties;

  return (
    <TrackMenuProvider>
      <div className={`${styles.hub} ${state.currentTrack ? styles.hubWithPlayer : ""}`} style={style}>
        <div className={styles.ambientBackground} aria-hidden="true" />
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={styles.hubInner}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
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
        </motion.div>
      </div>
    </TrackMenuProvider>
  );
}
