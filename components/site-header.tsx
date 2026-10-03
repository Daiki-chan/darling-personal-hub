"use client";

import Link from "next/link";
import { ArrowUpRight, Disc } from "lucide-react";
import { PortalBackGuard } from "@/components/portal-back-guard";
import { useMusicPlayer } from "@/components/music/music-player-core";

type SiteHeaderProps = {
  active?: "gallery" | "memories" | "music" | "portfolio";
  guardInitialVisit?: boolean;
};

export function SiteHeader({ active, guardInitialVisit = true }: SiteHeaderProps) {
  const { state: musicState, setExpanded } = useMusicPlayer();
  const isAudioActive = Boolean(musicState.currentTrack);

  const getTerritoryCode = () => {
    switch (active) {
      case "gallery":
      case "memories":
        return "01 // ARCHIVE";
      case "music":
        return "02 // ACOUSTIC";
      case "portfolio":
        return "03 // MONOGRAPH";
      default:
        return null;
    }
  };

  const territoryCode = getTerritoryCode();

  return (
    <>
      {active && guardInitialVisit ? <PortalBackGuard /> : null}
      <header className="site-nav">
        <div className="brand-group">
          <Link className="brand" href="/#portals" aria-label="Về màn hình chọn không gian">
            FUJIWARA DAIKI
          </Link>
          {territoryCode && (
            <span className="brand-territory-badge" aria-hidden="true">
              {territoryCode}
            </span>
          )}
        </div>

        <nav className="nav-links" aria-label="Điều hướng chính">
          <Link
            href="/memories"
            className="nav-item"
            aria-current={active === "gallery" || active === "memories" ? "page" : undefined}
          >
            <span className="nav-item-num">01</span>
            <span className="nav-item-name">MEMORIES</span>
          </Link>
          <Link
            href="/music"
            className="nav-item"
            aria-current={active === "music" ? "page" : undefined}
          >
            <span className="nav-item-num">02</span>
            <span className="nav-item-name">MUSIC</span>
          </Link>
          <Link
            href="/portfolio"
            className="nav-item"
            aria-current={active === "portfolio" ? "page" : undefined}
          >
            <span className="nav-item-num">03</span>
            <span className="nav-item-name">PORTFOLIO</span>
          </Link>
        </nav>

        <div className="nav-end-group">
          {isAudioActive && (
            <button
              type="button"
              className="nav-audio-pill"
              onClick={() => setExpanded(!musicState.expanded)}
              aria-label={musicState.expanded ? "Thu nhỏ trình phát" : "Mở rộng trình phát nhạc"}
              title={`Đang phát: ${musicState.currentTrack?.title}`}
            >
              <Disc
                size={13}
                className={`nav-audio-icon ${musicState.isPlaying ? "nav-audio-icon--spinning" : ""}`}
                aria-hidden="true"
              />
              <span className="nav-audio-title">{musicState.currentTrack?.title}</span>
            </button>
          )}

          <Link className="nav-action" href="/portfolio#contact">
            <span>Gửi lời chào</span>
            <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </header>
    </>
  );
}
