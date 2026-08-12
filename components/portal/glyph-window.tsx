"use client";

import type { CSSProperties } from "react";
import { useMusicPlayer } from "@/components/music/music-player-core";

type GlyphWindowProps = {
  activeDestination: "memories" | "music" | "work" | null;
};

export function GlyphWindow({ activeDestination }: GlyphWindowProps) {
  const { state } = useMusicPlayer();

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
    </div>
  );
}
