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
  const pageContentRef = useRef<HTMLDivElement>(null);
  const uiState = resolveMusicUIState(Boolean(state.currentTrack), state.expanded);
  const expanded = uiState === "expanded";
  const style = { "--music-accent": state.accent } as CSSProperties;

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;
    if (shouldMinimizeAfterNavigation(previousPathname, pathname, uiState)) {
      setExpanded(false);
    }
  }, [pathname, setExpanded, uiState]);

  // Focus trap / inert management on page content wrapper
  useEffect(() => {
    const contentNode = pageContentRef.current;
    if (!contentNode) return;

    const hadInert = contentNode.hasAttribute("inert");
    const initialAriaHidden = contentNode.getAttribute("aria-hidden");

    if (expanded) {
      contentNode.setAttribute("inert", "");
      contentNode.setAttribute("aria-hidden", "true");
    } else {
      if (!hadInert) contentNode.removeAttribute("inert");
      if (initialAriaHidden !== null) {
        contentNode.setAttribute("aria-hidden", initialAriaHidden);
      } else {
        contentNode.removeAttribute("aria-hidden");
      }
    }

    return () => {
      if (!hadInert) contentNode.removeAttribute("inert");
      if (initialAriaHidden !== null) {
        contentNode.setAttribute("aria-hidden", initialAriaHidden);
      } else {
        contentNode.removeAttribute("aria-hidden");
      }
    };
  }, [expanded]);

  return (
    <div
      className={styles.musicGlobal}
      data-music-page={pathname === "/music"}
      data-music-ui-state={uiState}
      style={style}
    >
      <div className="page-content-wrapper" ref={pageContentRef}>
        {children}
      </div>
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
