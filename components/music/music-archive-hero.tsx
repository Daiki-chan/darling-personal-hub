"use client";

import { memo } from "react";
import { KineticSignalField } from "./kinetic-signal-field";
import styles from "./music-app.module.css";

export const MusicArchiveHero = memo(function MusicArchiveHero() {
  return (
    <header className={styles.heroRoot}>
      <div className={styles.heroLeft}>
        <div className={styles.heroMetaLine}>
          <span className={styles.heroAnchorTag}>FUJIWARA DAIKI</span>
          <span className={styles.heroChapterIndex}>MUSIC / 02</span>
        </div>
        <h1 className={styles.heroTitle}>
          <span>MUSIC</span>
          <span>ARCHIVE</span>
        </h1>
      </div>

      <div className={styles.heroRight}>
        <KineticSignalField />
      </div>
    </header>
  );
});
