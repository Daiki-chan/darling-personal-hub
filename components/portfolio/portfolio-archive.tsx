"use client";

import { useState } from "react";
import Link from "next/link";
import { ARCHIVE_PROJECTS, type Project } from "@/lib/portfolio-data";
import { PortfolioMediaPlaceholder } from "./portfolio-media-placeholder";
import { setGlobalCursor } from "./custom-cursor";

export function PortfolioArchive() {
  const [viewMode, setViewMode] = useState<"index" | "grid">("index");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

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
    <section id="archive" className="phuc-archive section-shell section-space" aria-labelledby="archive-title">
      <div className="phuc-archive__header">
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
        <div className="phuc-archive__index-list" role="list">
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
        <div className="phuc-archive__grid-matrix">
          {ARCHIVE_PROJECTS.map((proj) => (
            <Link
              key={proj.slug}
              href={`/portfolio/${proj.slug}`}
              className="phuc-archive-grid-card"
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
