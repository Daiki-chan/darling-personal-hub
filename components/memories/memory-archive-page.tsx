"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ALL_MEMORIES,
  getGameMemories,
  getMemoriesStats,
  getPlaceMemories,
  getRandomMemory,
  type MemoryFragment,
  type MemorySubject,
} from "@/lib/memories-data";
import { MemoryHero } from "./memory-hero";
import { MemoryChapter } from "./memory-chapter";
import { MemoryEpilogue } from "./memory-epilogue";
import { MemoryDarkroomViewer } from "./memory-darkroom-viewer";

export function MemoryArchivePage() {
  const gameMemories = useMemo(() => getGameMemories(), []);
  const placeMemories = useMemo(() => getPlaceMemories(), []);
  const stats = useMemo(() => getMemoriesStats(), []);

  const [activeViewerMemory, setActiveViewerMemory] = useState<MemoryFragment | null>(null);
  const [hoverSubject, setHoverSubject] = useState<MemorySubject>("game");

  const currentFeatured = hoverSubject === "game" ? stats.featuredGame : stats.featuredPlace;

  const handleScrollToChapter = useCallback((chapterId: string) => {
    const el = document.getElementById(chapterId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleSelectMemory = useCallback((memory: MemoryFragment) => {
    setActiveViewerMemory(memory);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setActiveViewerMemory(null);
  }, []);

  const handleRandomRecall = useCallback(() => {
    const memory = getRandomMemory(activeViewerMemory?.id);
    if (memory) {
      setActiveViewerMemory(memory);
    }
  }, [activeViewerMemory]);

  return (
    <div className="darling-memories-page">
      {/* 00 / HERO */}
      <MemoryHero
        gameCount={stats.gameCount}
        placeCount={stats.placeCount}
        totalCount={stats.total}
        activeHoverSubject={hoverSubject}
        featuredMemory={currentFeatured}
        onHoverSubject={setHoverSubject}
        onScrollToChapter={handleScrollToChapter}
        onSelectMemory={handleSelectMemory}
      />

      {/* 01 / CHAPTER: GAME */}
      <MemoryChapter
        id="chapter-game"
        chapterNumber="01"
        subject="game"
        title="GAME"
        subtitle="VIRTUAL WORLDS"
        memories={gameMemories}
        onSelectMemory={handleSelectMemory}
      />

      {/* 02 / CHAPTER: PLACE */}
      <MemoryChapter
        id="chapter-place"
        chapterNumber="02"
        subject="place"
        title="PLACE"
        subtitle="PLACES I REMEMBER"
        memories={placeMemories}
        onSelectMemory={handleSelectMemory}
      />

      {/* 03 / EPILOGUE & RANDOM RECALL */}
      <MemoryEpilogue
        totalCount={stats.total}
        gameCount={stats.gameCount}
        placeCount={stats.placeCount}
        onRandomRecall={handleRandomRecall}
      />

      {/* GLOBAL OVERLAY / FULLSCREEN DARKROOM VIEWER */}
      <MemoryDarkroomViewer
        memory={activeViewerMemory}
        allMemories={ALL_MEMORIES}
        onClose={handleCloseViewer}
        onSelectMemory={handleSelectMemory}
      />
    </div>
  );
}
