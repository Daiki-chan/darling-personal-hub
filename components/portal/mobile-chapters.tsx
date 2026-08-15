"use client";

import { useEffect, useRef, useState } from "react";

type MobileChaptersProps = {
  onSelect: (href: string) => void;
  onPrefetch: (href: string) => void;
};

const CHAPTERS = [
  { id: "memories", title: "MEMORIES", href: "/memories", num: "01" },
  { id: "music", title: "MUSIC", href: "/music", num: "02" },
  { id: "work", title: "PORTFOLIO", href: "/portfolio", num: "03" },
] as const;

export function MobileChapters({ onSelect, onPrefetch }: MobileChaptersProps) {
  const [activeId, setActiveId] = useState<string>("memories");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const chapterRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: "-35% 0px -35% 0px",
      threshold: 0.2,
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

  return (
    <div className="mobile-portal-shell">
      {/* Structural Identity Header for Mobile */}
      <header className="mobile-identity">
        <div className="mobile-identity__line">FUJIWARA</div>
        <div className="mobile-identity__line mobile-identity__line--offset">DAIKI</div>
      </header>

      {/* 3 Asymmetrical Typographic Chapters */}
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
                <span className="mobile-chapter__num">{ch.num}</span>
                <h2 className="mobile-chapter__title">{ch.title}</h2>
              </button>
            </article>
          );
        })}
      </nav>
    </div>
  );
}
