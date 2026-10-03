"use client";

import { type CSSProperties, memo } from "react";
import { useMusicPlayer } from "@/components/music/music-player-core";

type GlyphWindowProps = {
  activeDestination: "memories" | "music" | "work" | null;
};

export const GlyphWindow = memo(function GlyphWindow({ activeDestination }: GlyphWindowProps) {
  const { state } = useMusicPlayer();

  return (
    <div
      className="glyph-window-layer"
      data-active-dest={activeDestination ?? "none"}
      aria-hidden="true"
    >
      {/* 1. Underlying Environmental Auras */}
      <div className="glyph-window-aura glyph-window-aura--memories" />
      <div
        className="glyph-window-aura glyph-window-aura--music"
        style={{
          ...(state.accent ? { "--music-accent": state.accent } : {}),
        } as CSSProperties}
      />
      <div className="glyph-window-aura glyph-window-aura--work" />

      {/* 2. Architectural Coordinate Grid Lines */}
      <div className="portal-grid-overlay">
        <span className="portal-grid-line portal-grid-line--v1" />
        <span className="portal-grid-line portal-grid-line--v2" />
        <span className="portal-grid-line portal-grid-line--h1" />
        <span className="portal-grid-line portal-grid-line--h2" />
      </div>
    </div>
  );
});
