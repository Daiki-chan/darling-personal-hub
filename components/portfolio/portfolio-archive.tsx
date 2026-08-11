"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ARCHIVE_PROJECTS, savePortfolioNavigationState, type Project } from "@/lib/portfolio-data";
import { PortfolioMediaPlaceholder } from "./portfolio-media-placeholder";
import { setGlobalCursor } from "./custom-cursor";

gsap.registerPlugin(ScrollTrigger);

export function PortfolioArchive() {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"index" | "grid">("index");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Phase C Bridge & Takeover: Archive heading ghost-in then takeover as horizontal unpins
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0.15, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
              end: "top 50%",
              scrub: true,
            },
          }
        );
      }

      // Archive rows enter LATER (only after horizontal unpin is complete and header is primary)
      if (listRef.current) {
        const items = listRef.current.children;
        gsap.fromTo(
          items,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 55%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    },
    { scope: containerRef, dependencies: [viewMode] }
  );

  const handleProjectClick = () => {
    savePortfolioNavigationState(viewMode);
  };

  const handleRowMouseEnter = (project: Project) => {
    setHoveredSlug(project.slug);
    setGlobalCursor({
      active: true,
      variant: "archive-preview",
      mediaVariant: project.mediaVariant,
      title: project.title,
      category: project.category,
      year: project.year,
    });
  };

  const handleRowMouseLeave = () => {
    setHoveredSlug(null);
    setGlobalCursor({ active: false });
  };

  return (
    <section ref={containerRef} id="archive" className="phuc-archive section-shell section-space" aria-labelledby="archive-title">
      <div ref={headerRef} className="phuc-archive__header">
        <div>
          <span className="phuc-label">02 / KHO LƯU TRỮ</span>
          <h2 id="archive-title" className="phuc-archive__headline">
            NHIỀU DỰ ÁN HƠN.
            <br />
            NHIỀU THỬ NGHIỆM HƠN.
          </h2>
        </div>

        <div className="phuc-archive__toggle" role="group" aria-label="Archive view layout options">
          <button
            type="button"
            className={`phuc-toggle-btn ${viewMode === "index" ? "phuc-toggle-btn--active" : ""}`}
            onClick={() => setViewMode("index")}
            aria-pressed={viewMode === "index"}
          >
            DANH SÁCH
          </button>
          <button
            type="button"
            className={`phuc-toggle-btn ${viewMode === "grid" ? "phuc-toggle-btn--active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
          >
            LƯỚI
          </button>
        </div>
      </div>

      {viewMode === "index" && (
        <div ref={listRef} className="phuc-archive__index-list" role="list">
          {ARCHIVE_PROJECTS.map((proj) => {
            const isHovered = hoveredSlug === proj.slug;
            const isOtherDimmed = hoveredSlug !== null && !isHovered;

            return (
              <Link
                key={proj.slug}
                href={`/portfolio/${proj.slug}`}
                className={`phuc-archive-row ${isHovered ? "phuc-archive-row--hover" : ""} ${
                  isOtherDimmed ? "phuc-archive-row--dim" : ""
                }`}
                onClick={handleProjectClick}
                onMouseEnter={() => handleRowMouseEnter(proj)}
                onMouseLeave={handleRowMouseLeave}
                role="listitem"
              >
                <span className="phuc-row-num">{proj.index}</span>
                <span className="phuc-row-title">{proj.title}</span>
                <span className="phuc-row-cat">{proj.category}</span>
                <span className="phuc-row-year">{proj.year}</span>
                <span className="phuc-row-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {viewMode === "grid" && (
        <div ref={listRef} className="phuc-archive__grid-matrix">
          {ARCHIVE_PROJECTS.map((proj) => (
            <Link
              key={proj.slug}
              href={`/portfolio/${proj.slug}`}
              className="phuc-archive-grid-card"
              onClick={handleProjectClick}
              onMouseEnter={() => setGlobalCursor({ active: true, text: "ĐỌC CASE STUDY" })}
              onMouseLeave={() => setGlobalCursor({ active: false })}
            >
              <PortfolioMediaPlaceholder
                variant={proj.mediaVariant}
                aspectRatio="landscape"
                index={proj.index}
                label={proj.title}
              />
              <div className="phuc-grid-card-copy">
                <span className="phuc-grid-cat">{proj.category} · {proj.year}</span>
                <h3 className="phuc-grid-title">{proj.title}</h3>
                <p className="phuc-grid-summary">{proj.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
