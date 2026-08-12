"use client";

import { type CSSProperties } from "react";
import { useMusicPlayer } from "@/components/music/music-player-core";

type GlyphWindowProps = {
  activeDestination: "memories" | "music" | "work" | null;
};

export function GlyphWindow({ activeDestination }: GlyphWindowProps) {
  const { state } = useMusicPlayer();

  // Dynamic image source for Music if available
  const musicThumbnail = state.currentTrack?.thumbnail;

  return (
    <div
      className="glyph-window-layer"
      data-active-dest={activeDestination ?? "none"}
      aria-hidden="true"
    >
      <div className="glyph-window-aura glyph-window-aura--memories" />
      <div
        className="glyph-window-aura glyph-window-aura--music"
        style={{
          ...(state.accent ? { "--music-accent": state.accent } : {}),
        } as CSSProperties}
      />
      <div className="glyph-window-aura glyph-window-aura--work" />


      {/* Visual background reveal texture */}
      <div className="glyph-window-visual">
        {musicThumbnail && activeDestination === "music" ? (
          <div
            className="glyph-window-media"
            style={{ backgroundImage: `url(${musicThumbnail})` }}
          />
        ) : null}
      </div>
    </div>
  );
}
