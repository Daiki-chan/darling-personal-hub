"use client";

import Image from "next/image";
import { memo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSectionMotion } from "@/components/motion/use-section-motion";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion/tokens";
import type { GameMemoryFragment, MemoryFragment, MemorySubject, PlaceMemoryFragment } from "@/lib/memories-data";

interface MemoryHeroProps {
  gameCount: number;
  placeCount: number;
  totalCount: number;
  activeHoverSubject: MemorySubject;
  featuredMemory?: MemoryFragment | null;
  onHoverSubject: (subject: MemorySubject) => void;
  onScrollToChapter: (chapterId: string) => void;
  onSelectMemory: (memory: MemoryFragment) => void;
}

export const MemoryHero = memo(function MemoryHero({
  gameCount,
  placeCount,
  totalCount,
  activeHoverSubject,
  featuredMemory,
  onHoverSubject,
  onScrollToChapter,
  onSelectMemory,
}: MemoryHeroProps) {
  const formattedGameCount = String(gameCount).padStart(3, "0");
  const formattedPlaceCount = String(placeCount).padStart(3, "0");
  const formattedTotal = String(totalCount).padStart(3, "0");

  const isGame = featuredMemory?.subject === "game";
  const gameMeta = isGame ? (featuredMemory as GameMemoryFragment) : null;
  const placeMeta = featuredMemory && !isGame ? (featuredMemory as PlaceMemoryFragment) : null;
  const motionRef = useSectionMotion<HTMLElement>({ start: "top 92%" });
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <header ref={motionRef} className="mem-hero section-shell">
      {/* 1. Clear, Uncompromised Typography Level */}
      <div className="mem-hero__header-row" data-motion-reveal>
        <span className="mem-hero__eyebrow">FUJIWARA DAIKI · CH.01</span>
        <h1 className="mem-hero__title">
          <span className="mem-hero__title-main">MEMORIES</span>
          <span className="mem-hero__title-sub">A PERSONAL VISUAL ARCHIVE</span>
        </h1>
      </div>

      {/* 2. Structured Two-Column Stage (Independent Nav & Independent Visual Anchor) */}
      <div className="mem-hero__stage" data-motion-reveal>
        {/* Left Side: Editorial Category Navigation */}
        <div className="mem-hero__nav-col">
          <nav className="mem-hero__categories" aria-label="Danh mục chủ đề ký ức">
            <button
              type="button"
              className={`mem-hero__cat-row ${activeHoverSubject === "game" ? "mem-hero__cat-row--active" : ""}`}
              onPointerEnter={() => onHoverSubject("game")}
              onFocus={() => onHoverSubject("game")}
              onClick={() => onScrollToChapter("chapter-game")}
              aria-label={`Đi tới mục 01 Game, ${gameCount} mảnh ký ức`}
            >
              <div className="mem-hero__cat-info">
                <span className="mem-hero__cat-idx">01 / GAME</span>
                <span className="mem-hero__cat-name">VIRTUAL WORLDS</span>
              </div>
              <div className="mem-hero__cat-action">
                <span className="mem-hero__cat-count">{formattedGameCount}</span>
                <span className="mem-hero__cat-arrow" aria-hidden="true">↘</span>
              </div>
            </button>

            <button
              type="button"
              className={`mem-hero__cat-row ${activeHoverSubject === "place" ? "mem-hero__cat-row--active" : ""}`}
              onPointerEnter={() => onHoverSubject("place")}
              onFocus={() => onHoverSubject("place")}
              onClick={() => onScrollToChapter("chapter-place")}
              aria-label={`Đi tới mục 02 Place, ${placeCount} mảnh ký ức`}
            >
              <div className="mem-hero__cat-info">
                <span className="mem-hero__cat-idx">02 / PLACE</span>
                <span className="mem-hero__cat-name">PLACES I REMEMBER</span>
              </div>
              <div className="mem-hero__cat-action">
                <span className="mem-hero__cat-count">{formattedPlaceCount}</span>
                <span className="mem-hero__cat-arrow" aria-hidden="true">↘</span>
              </div>
            </button>
          </nav>

          <div className="mem-hero__tally-badge">
            <span className="mem-hero__tally-text">{formattedTotal} FRAGMENTS RECORDED</span>
          </div>
        </div>

        {/* Right Side: Clean Visual Anchor Frame (Active or Empty State) */}
        <div className="mem-hero__anchor-col">
          <AnimatePresence mode="wait" initial={false}>
          {featuredMemory ? (
            <motion.button
              type="button"
              className="mem-hero__anchor-frame"
              key={featuredMemory.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{
                duration: reduceMotion ? 0 : MOTION_DURATION.standard,
                ease: MOTION_EASE.css,
              }}
              onClick={() => onSelectMemory(featuredMemory)}
              aria-label={`Xem ảnh đại diện: ${featuredMemory.title}`}
            >
              <div className="mem-hero__anchor-media">
                <Image
                  src={featuredMemory.image}
                  alt={featuredMemory.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 540px"
                  className="mem-hero__anchor-img"
                />
                <div className="mem-hero__anchor-scrim" aria-hidden="true" />
                <span className="mem-hero__anchor-badge" aria-hidden="true">
                  FEATURED RECALL
                </span>
              </div>

              <div className="mem-hero__anchor-meta">
                <span className="mem-hero__anchor-id">{featuredMemory.id}</span>
                <span className="mem-hero__anchor-title">
                  {isGame ? gameMeta?.gameTitle : placeMeta?.location}
                </span>
                <span className="mem-hero__anchor-sub">
                  {isGame
                    ? [gameMeta?.area, featuredMemory.year].filter(Boolean).join(" · ")
                    : [featuredMemory.date || featuredMemory.year].filter(Boolean).join(" · ")}
                </span>
              </div>
            </motion.button>
          ) : (
            <div className="mem-hero__anchor-frame mem-hero__anchor-frame--empty" aria-label="Khung lưu trữ sẵn sàng">
              <div className="mem-hero__anchor-media mem-hero__anchor-media--empty">
                <div className="mem-hero__empty-indicator">
                  <span className="mem-hero__empty-code">ARCHIVE · 000</span>
                  <span className="mem-hero__empty-desc">STANDBY FOR AUTHENTIC FRAGMENTS</span>
                </div>
                <span className="mem-hero__anchor-badge" aria-hidden="true">
                  ARCHIVE STATE
                </span>
              </div>

              <div className="mem-hero__anchor-meta">
                <span className="mem-hero__anchor-id">---/---</span>
                <span className="mem-hero__anchor-title">NO ANCHOR FRAGMENT ARCHIVED</span>
                <span className="mem-hero__anchor-sub">STANDBY</span>
              </div>
            </div>
          )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mem-hero__divider" aria-hidden="true" />
    </header>
  );
});
