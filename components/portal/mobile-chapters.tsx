"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMusicPlayer } from "@/components/music/music-player-core";
import { GAME_MEMORIES } from "@/lib/memories-data";

type MobileChaptersProps = {
  onSelect: (href: string) => void;
  onPrefetch: (href: string) => void;
};

const CHAPTERS = [
  {
    id: "memories" as const,
    title: "MEMORIES",
    href: "/memories",
    num: "01",
    tag: "VISUAL ARCHIVE",
    desc: "Kỷ niệm · Ánh sáng tĩnh lặng · 35mm",
  },
  {
    id: "music" as const,
    title: "MUSIC",
    href: "/music",
    num: "02",
    tag: "ACOUSTIC SANCTUARY",
    desc: "Tần số âm thanh · Lời bài hát · YouTube Stream",
  },
  {
    id: "work" as const,
    title: "PORTFOLIO",
    href: "/portfolio",
    num: "03",
    tag: "SELECTED PRACTICE",
    desc: "Chiến lược tăng trưởng · Cụm chủ đề · SEO",
  },
] as const;

export function MobileChapters({ onSelect, onPrefetch }: MobileChaptersProps) {
  const [activeId, setActiveId] = useState<string>("memories");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const chapterRefs = useRef<Map<string, HTMLElement>>(new Map());
  const { state: musicState } = useMusicPlayer();

  useEffect(() => {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: "-20% 0px -20% 0px",
      threshold: 0.3,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("data-chapter-id");
          if (id) setActiveId(id);
        }
      }
    }, options);

    for (const [, node] of chapterRefs.current) {
      if (node) observerRef.current.observe(node);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const setRef = (id: string, node: HTMLElement | null) => {
    if (node) chapterRefs.current.set(id, node);
    else chapterRefs.current.delete(id);
  };

  const sampleMemory = GAME_MEMORIES[0];

  return (
    <div className="mobile-portal-shell">
      {/* Structural Identity Header for Mobile */}
      <header className="mobile-identity">
        <div className="mobile-identity__eyebrow">PERSONAL DIGITAL ENVIRONMENT</div>
        <div className="mobile-identity__line">FUJIWARA</div>
        <div className="mobile-identity__line mobile-identity__line--offset">DAIKI</div>
      </header>

      {/* Tactile Vertical Chapters */}
      <nav className="mobile-chapters" aria-label="Điều hướng các không gian">
        {CHAPTERS.map((ch) => {
          const isActive = activeId === ch.id;

          return (
            <article
              key={ch.id}
              ref={(node) => setRef(ch.id, node)}
              data-chapter-id={ch.id}
              data-active={isActive}
              className={`mobile-chapter mobile-chapter--${ch.id}`}
            >
              <button
                type="button"
                className="mobile-chapter__btn"
                onTouchStart={() => onPrefetch(ch.href)}
                onClick={() => onSelect(ch.href)}
                aria-label={`Đi tới không gian ${ch.title}`}
              >
                <div className="mobile-chapter__header-row">
                  <span className="mobile-chapter__num">{ch.num}</span>
                  <span className="mobile-chapter__tag">{ch.tag}</span>
                  <span className="mobile-chapter__arrow">↗</span>
                </div>

                <h2 className="mobile-chapter__title">{ch.title}</h2>
                <p className="mobile-chapter__desc">{ch.desc}</p>

                {/* Mobile Territory Preview Snippet */}
                <div className="mobile-chapter__preview-snippet">
                  {ch.id === "memories" && sampleMemory && (
                    <div className="mobile-memory-preview">
                      <div className="mobile-memory-thumb">
                        <Image
                          src={sampleMemory.image}
                          alt={sampleMemory.title}
                          fill
                          sizes="90vw"
                          className="mobile-thumb-img"
                        />
                      </div>
                      <span className="mobile-preview-label">
                        {sampleMemory.title} · {sampleMemory.year}
                      </span>
                    </div>
                  )}

                  {ch.id === "music" && (
                    <div className="mobile-music-preview">
                      <div className="mobile-music-wave">
                        <span className="wave-dot wave-dot--1" />
                        <span className="wave-dot wave-dot--2" />
                        <span className="wave-dot wave-dot--3" />
                        <span className="wave-dot wave-dot--4" />
                      </div>
                      <span className="mobile-preview-label">
                        {musicState.currentTrack
                          ? `Đang phát: ${musicState.currentTrack.title}`
                          : "Hệ thống âm thanh sẵn sàng"}
                      </span>
                    </div>
                  )}

                  {ch.id === "work" && (
                    <div className="mobile-work-preview">
                      <span className="mobile-work-badge">03</span>
                      <span className="mobile-preview-label">MONOGRAPH / PROJECTS / WORK</span>
                    </div>
                  )}
                </div>
              </button>
            </article>
          );
        })}
      </nav>
    </div>
  );
}
