"use client";

import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { CSSProperties } from "react";
import { LibraryPanel } from "./library-panel";
import { MusicPlayerProvider, useMusicPlayer } from "./music-player-core";
import { PlayerDock } from "./player-dock";
import { QueuePanel } from "./queue-panel";
import { SearchPanel } from "./search-panel";
import styles from "./music-app.module.css";

function MusicExperience() {
  const { dismissToast, state } = useMusicPlayer();
  const reduceMotion = Boolean(useReducedMotion());
  const style = { "--music-accent": state.accent } as CSSProperties;

  return (
    <div
      className={`${styles.hub} ${state.currentTrack ? styles.hubWithPlayer : ""}`}
      style={style}
    >
      <div className={styles.ambientBackground} aria-hidden="true" />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={styles.hubInner}
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <SearchPanel />
        {state.restored ? (
          <div className={styles.mainLayout}>
            <LibraryPanel />
            <aside className={styles.queueAside}><QueuePanel /></aside>
          </div>
        ) : (
          <div className={styles.restoreSkeleton} aria-label="Đang khôi phục thư viện">
            <span /><span /><span />
          </div>
        )}
      </motion.div>

      <PlayerDock />
      {state.toast ? (
        <div className={styles.toast} role="status">
          <span>{state.toast.message}</span>
          <button aria-label="Đóng thông báo" onClick={dismissToast} type="button">
            <X aria-hidden="true" size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function MusicApp() {
  return (
    <MusicPlayerProvider>
      <MusicExperience />
    </MusicPlayerProvider>
  );
}
