"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { resolveMusicUIState, shouldMinimizeAfterNavigation } from "@/lib/music/player-ui";
import { MusicPlayerProvider, useMusicPlayer } from "./music-player-core";
import { PlayerDock } from "./player-dock";
import styles from "./music-app.module.css";

function PersistentMusicSurface({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { dismissToast, setExpanded, state } = useMusicPlayer();
  const previousPathnameRef = useRef(pathname);
  const uiState = resolveMusicUIState(Boolean(state.currentTrack), state.expanded);
  const style = { "--music-accent": state.accent } as CSSProperties;

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;
    if (shouldMinimizeAfterNavigation(previousPathname, pathname, uiState)) {
      setExpanded(false);
    }
  }, [pathname, setExpanded, uiState]);

  return (
    <div
      className={styles.musicGlobal}
      data-music-page={pathname === "/am-nhac"}
      data-music-ui-state={uiState}
      style={style}
    >
      {children}
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

export function MusicShell({ children }: { children: ReactNode }) {
  return (
    <MusicPlayerProvider>
      <PersistentMusicSurface>{children}</PersistentMusicSurface>
    </MusicPlayerProvider>
  );
}
