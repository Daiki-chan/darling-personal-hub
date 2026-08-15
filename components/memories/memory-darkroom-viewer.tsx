"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MemoryFragment } from "@/lib/memories-data";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion/tokens";

interface MemoryDarkroomViewerProps {
  memory: MemoryFragment | null;
  allMemories: MemoryFragment[];
  onClose: () => void;
  onSelectMemory: (memory: MemoryFragment) => void;
}

export const MemoryDarkroomViewer = function MemoryDarkroomViewer({
  memory,
  allMemories,
  onClose,
  onSelectMemory,
}: MemoryDarkroomViewerProps) {
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [direction, setDirection] = useState(1);
  const reduceMotion = Boolean(useReducedMotion());

  const currentIndex = memory
    ? allMemories.findIndex((m) => m.id === memory.id)
    : -1;

  const totalInSubject = memory
    ? allMemories.filter((m) => m.subject === memory.subject).length
    : 0;

  const currentSubjectIndex = memory
    ? allMemories
        .filter((m) => m.subject === memory.subject)
        .findIndex((m) => m.id === memory.id) + 1
    : 0;

  const handlePrev = useCallback(() => {
    if (currentIndex === -1) return;
    const nextIdx = (currentIndex - 1 + allMemories.length) % allMemories.length;
    onSelectMemory(allMemories[nextIdx]);
    setDirection(-1);
  }, [currentIndex, allMemories, onSelectMemory]);

  const handleNext = useCallback(() => {
    if (currentIndex === -1) return;
    const nextIdx = (currentIndex + 1) % allMemories.length;
    onSelectMemory(allMemories[nextIdx]);
    setDirection(1);
  }, [currentIndex, allMemories, onSelectMemory]);

  // Keyboard navigation & escape listener
  useEffect(() => {
    if (!memory) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [memory, onClose, handlePrev, handleNext]);

  // Lock background scroll when viewer is open
  const isOpen = Boolean(memory);
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [isOpen]);

  // Touch gesture swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Horizontal swipe threshold: 50px
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    // Vertical swipe down threshold: 80px (close modal)
    else if (deltaY > 80 && Math.abs(deltaX) < 40) {
      onClose();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };


  const isGame = memory?.subject === "game";
  const gameMeta = memory && isGame ? (memory as import("@/lib/memories-data").GameMemoryFragment) : null;
  const placeMeta = memory && !isGame ? (memory as import("@/lib/memories-data").PlaceMemoryFragment) : null;

  const formattedSubjectIdx = String(currentSubjectIndex).padStart(3, "0");
  const formattedSubjectTotal = String(totalInSubject).padStart(3, "0");

  return (
    <AnimatePresence>
      {memory ? (
      <motion.div
        key="darkroom"
        className="darkroom-modal"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : MOTION_DURATION.exit, ease: MOTION_EASE.css }}
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết ảnh ${memory.id}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Backdrop Scrim */}
        <div
          className="darkroom-modal__backdrop"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Window Core Container */}
        <div className="darkroom-modal__shell">
          {/* Top Bar Header Chrome */}
          <header className="darkroom-modal__header">
            <div className="darkroom-modal__id-group">
              <span className="darkroom-modal__id">{memory.id}</span>
              <span className="darkroom-modal__subject-tag">
                {isGame ? "VIRTUAL RECALL" : "PLACE RECALL"}
              </span>
            </div>

            <div className="darkroom-modal__header-actions">
              <span className="darkroom-modal__tally">
                {formattedSubjectIdx} / {formattedSubjectTotal}
              </span>
              <button
                ref={closeBtnRef}
                type="button"
                className="darkroom-modal__close-btn"
                onClick={onClose}
                aria-label="Đóng khung xem ảnh (ESC)"
              >
                <span>✕</span>
                <span className="darkroom-modal__close-label">CLOSE</span>
              </button>
            </div>
          </header>

          {/* Main Stage Image Frame (75-85% Dominance, 100% Original Aspect Ratio Contain) */}
          <div className="darkroom-modal__stage">
            <button
              type="button"
              className="darkroom-modal__nav-btn darkroom-modal__nav-btn--prev"
              onClick={handlePrev}
              aria-label="Ảnh trước đó (Mũi tên trái)"
            >
              ←
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={memory.id}
                className="darkroom-modal__image-wrapper"
                initial={reduceMotion ? false : { opacity: 0, x: direction * 20, scale: 0.985 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: direction * -20, scale: 0.99 }}
                transition={{
                  duration: reduceMotion ? 0 : MOTION_DURATION.standard,
                  ease: MOTION_EASE.css,
                }}
              >
              <Image
                src={memory.image}
                alt={memory.title}
                fill
                sizes="(max-width: 1400px) 95vw, 1400px"
                priority
                className="darkroom-modal__img"
              />
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              className="darkroom-modal__nav-btn darkroom-modal__nav-btn--next"
              onClick={handleNext}
              aria-label="Ảnh tiếp theo (Mũi tên phải)"
            >
              →
            </button>
          </div>

          {/* Bottom Context & Adaptive Metadata Panel */}
          <footer className="darkroom-modal__footer">
            <div className="darkroom-modal__info-left">
              <h3 className="darkroom-modal__title">
                {isGame ? gameMeta?.gameTitle : placeMeta?.location}
              </h3>
              <div className="darkroom-modal__subline">
                {isGame ? (
                  <span>
                    {[gameMeta?.area, gameMeta?.character, memory.year]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                ) : (
                  <span>
                    {[placeMeta?.coordinates, memory.date || memory.year]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </div>
              {memory.caption ? (
                <p className="darkroom-modal__caption">{memory.caption}</p>
              ) : null}
            </div>

            <div className="darkroom-modal__info-right">
              <span className="darkroom-modal__original-title">{memory.title}</span>
              <div className="darkroom-modal__mobile-nav">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="darkroom-modal__mobile-arrow"
                  aria-label="Ảnh trước"
                >
                  ← PREV
                </button>
                <span className="darkroom-modal__mobile-sep">/</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="darkroom-modal__mobile-arrow"
                  aria-label="Ảnh sau"
                >
                  NEXT →
                </button>
              </div>
            </div>
          </footer>
        </div>
      </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
