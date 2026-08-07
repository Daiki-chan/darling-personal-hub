"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Heart, ListEnd, ListMusic, ListPlus, MoreHorizontal } from "lucide-react";
import type { MusicTrack } from "@/lib/music/types";
import { useMusicPlayer } from "./music-player-core";
import { useTrackMenu } from "./track-menu-context";
import styles from "./music-app.module.css";

export function TrackFavoriteAction({ track }: { track: MusicTrack }) {
  const { state, toggleFavorite } = useMusicPlayer();
  const favorite = state.favorites.some((item) => item.videoId === track.videoId);

  return (
    <button
      aria-label={favorite ? `Bỏ yêu thích ${track.title}` : `Thêm ${track.title} vào yêu thích`}
      aria-pressed={favorite}
      className={`${styles.cardFavoriteBtn} ${favorite ? styles.actionActive : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(track);
      }}
      type="button"
    >
      <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} size={16} />
    </button>
  );
}

export function TrackMenuTrigger({ surface, track }: { surface: string; track: MusicTrack }) {
  const instanceId = `${surface}:${track.videoId}`;
  const { openMenuInstanceId, setOpenMenuInstanceId } = useTrackMenu();
  const menuOpen = openMenuInstanceId === instanceId;
  const openMenuInstanceIdRef = useRef(openMenuInstanceId);

  useEffect(() => {
    openMenuInstanceIdRef.current = openMenuInstanceId;
  }, [openMenuInstanceId]);

  const [showPlaylists, setShowPlaylists] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number; alignRight: boolean }>({ top: 0, left: 0, alignRight: true });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addToPlaylist, addToQueue, playNext, state } = useMusicPlayer();

  const closeMenu = useCallback(() => {
    setOpenMenuInstanceId(null);
    setShowPlaylists(false);
  }, [setOpenMenuInstanceId]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 210;
    const viewportWidth = window.innerWidth;

    let left = rect.right - menuWidth;
    let alignRight = true;

    if (left < 10) {
      left = Math.max(10, rect.left);
      alignRight = false;
    }
    if (left + menuWidth > viewportWidth - 10) {
      left = Math.max(10, viewportWidth - menuWidth - 10);
    }

    const top = rect.bottom + window.scrollY + 6;
    setMenuCoords({ top, left, alignRight });
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (menuOpen) {
      closeMenu();
    } else {
      updatePosition();
      setOpenMenuInstanceId(instanceId);
      setShowPlaylists(false);
    }
  };

  useEffect(() => {
    return () => {
      if (openMenuInstanceIdRef.current === instanceId) {
        setOpenMenuInstanceId(null);
      }
    };
  }, [instanceId, setOpenMenuInstanceId]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [menuOpen, closeMenu, updatePosition]);

  // Focus management when menu opens
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      const firstItem = menuRef.current.querySelector<HTMLElement>('[role="menuitem"]');
      firstItem?.focus();
    }
  }, [menuOpen]);

  const handleMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!menuRef.current) return;
    const items = Array.from(menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    if (!items.length) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prevIndex]?.focus();
    }
  };

  return (
    <>
      <button
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={`Mở tùy chọn cho ${track.title}`}
        className={styles.cardMenuBtn}
        onClick={toggleMenu}
        ref={triggerRef}
        type="button"
      >
        <MoreHorizontal aria-hidden="true" size={17} />
      </button>

      {menuOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              aria-label={`Tùy chọn cho ${track.title}`}
              className={styles.portalActionMenu}
              onKeyDown={handleMenuKeyDown}
              ref={menuRef}
              role="menu"
              style={{
                position: "absolute",
                top: `${menuCoords.top}px`,
                left: `${menuCoords.left}px`,
                zIndex: 99999,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playNext(track);
                  closeMenu();
                }}
                role="menuitem"
                tabIndex={0}
                type="button"
              >
                <ListEnd aria-hidden="true" size={16} />
                <span>Phát tiếp theo</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToQueue(track);
                  closeMenu();
                }}
                role="menuitem"
                tabIndex={0}
                type="button"
              >
                <ListPlus aria-hidden="true" size={16} />
                <span>Thêm vào hàng đợi</span>
              </button>

              {state.playlists.length ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlaylists((prev) => !prev);
                    }}
                    role="menuitem"
                    tabIndex={0}
                    type="button"
                  >
                    <ListMusic aria-hidden="true" size={16} />
                    <span>Thêm vào playlist</span>
                  </button>

                  {showPlaylists ? (
                    <div className={styles.playlistSubMenu}>
                      {state.playlists.map((playlist) => (
                        <button
                          key={playlist.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToPlaylist(playlist.id, track);
                            closeMenu();
                          }}
                          role="menuitem"
                          tabIndex={0}
                          type="button"
                        >
                          {playlist.name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function TrackActions({ surface, track }: { surface: string; track: MusicTrack }) {
  return (
    <div className={styles.trackCardActions}>
      <TrackFavoriteAction track={track} />
      <TrackMenuTrigger surface={surface} track={track} />
    </div>
  );
}
