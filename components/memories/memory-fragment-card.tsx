"use client";

import { memo } from "react";
import type { GameMemoryFragment, MemoryFragment, PlaceMemoryFragment } from "@/lib/memories-data";

interface MemoryFragmentCardProps {
  memory: MemoryFragment;
  onSelect: (memory: MemoryFragment) => void;
  priority?: boolean;
  className?: string;
}

export const MemoryFragmentCard = memo(function MemoryFragmentCard({
  memory,
  onSelect,
  priority = false,
  className = "",
}: MemoryFragmentCardProps) {
  const isGame = memory.subject === "game";
  const gameMeta = isGame ? (memory as GameMemoryFragment) : null;
  const placeMeta = !isGame ? (memory as PlaceMemoryFragment) : null;

  return (
    <article className={`mem-card mem-card--${memory.subject} ${className}`} data-motion-reveal>
      <button
        type="button"
        className="mem-card__frame"
        onClick={() => onSelect(memory)}
        aria-label={`Xem chi tiết ký ức ${memory.id}: ${memory.title}`}
      >
        {/* Maximum 800x800 presentation frame */}
        <div className="mem-card__image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={memory.image}
            alt={memory.title}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="mem-card__image"
          />
          <div className="mem-card__scrim" aria-hidden="true" />
          <span className="mem-card__tag" aria-hidden="true">
            {memory.id}
          </span>
        </div>

        {/* Disciplined, Clean Archival Metadata (Strict 2-line baseline) */}
        <div className="mem-card__meta">
          <div className="mem-card__meta-line-1">
            <span className="mem-card__id">{memory.id}</span>
            <span className="mem-card__primary">
              {isGame ? gameMeta?.gameTitle : placeMeta?.location}
            </span>
          </div>

          <div className="mem-card__meta-line-2">
            <span className="mem-card__secondary">
              {isGame
                ? [gameMeta?.area, memory.year].filter(Boolean).join(" · ")
                : [memory.date || memory.year].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
});
