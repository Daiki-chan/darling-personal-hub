"use client";

import { memo } from "react";
import type { MemoryFragment, MemorySubject } from "@/lib/memories-data";
import { useSectionMotion } from "@/components/motion/use-section-motion";
import { MemoryFragmentCard } from "./memory-fragment-card";

interface MemoryChapterProps {
  id: string;
  chapterNumber: string; // e.g. "01"
  subject: MemorySubject;
  title: string; // e.g. "GAME" or "PLACE"
  subtitle: string; // e.g. "VIRTUAL WORLDS" or "PLACES I REMEMBER"
  memories: MemoryFragment[];
  onSelectMemory: (memory: MemoryFragment) => void;
}

export const MemoryChapter = memo(function MemoryChapter({
  id,
  chapterNumber,
  subject,
  title,
  subtitle,
  memories,
  onSelectMemory,
}: MemoryChapterProps) {
  const formattedCount = String(memories.length).padStart(3, "0");
  const motionRef = useSectionMotion<HTMLElement>();

  return (
    <section
      ref={motionRef}
      id={id}
      className={`mem-chapter mem-chapter--${subject} section-shell`}
      aria-label={`${chapterNumber} / ${title} — ${subtitle}`}
    >
      {/* Intentional Chapter Header Break */}
      <header className="mem-chapter__header" data-motion-reveal>
        <div className="mem-chapter__title-group">
          <span className="mem-chapter__num">{chapterNumber} / {title}</span>
          <h2 className="mem-chapter__heading">{subtitle}</h2>
        </div>
        <div className="mem-chapter__tally">
          <span className="mem-chapter__tally-count">{formattedCount}</span>
          <span className="mem-chapter__tally-label">FRAGMENTS</span>
        </div>
      </header>

      {/* Auto-Positioning Responsive Grid or Elegant Empty State */}
      {memories.length > 0 ? (
        <div className="mem-chapter__grid" role="region" aria-label={`Kho ảnh ${subtitle}`}>
          {memories.map((memory, idx) => (
            <MemoryFragmentCard
              key={memory.id}
              memory={memory}
              onSelect={onSelectMemory}
              priority={idx < 2}
            />
          ))}
        </div>
      ) : (
        <div className="mem-chapter__empty-container" data-motion-reveal>
          <div className="mem-chapter__empty-card">
            <span className="mem-chapter__empty-tag">ARCHIVE SEGMENT 000 // EMPTY</span>
            <h3 className="mem-chapter__empty-title">
              {subject === "game" ? "NO GAME MEMORIES ADDED YET" : "NO PLACE MEMORIES ADDED YET"}
            </h3>
            <p className="mem-chapter__empty-desc">
              {subject === "game"
                ? "Virtual worlds, captured gameplay atmospheres, and adventures will be displayed here once personal captures are archived."
                : "Real-world travels, quiet alleys, and captured light will be displayed here once authentic photographs are archived."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
});
