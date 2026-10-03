"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ARCHIVE_PROJECTS, type Project } from "@/lib/portfolio-data";
import { useSectionMotion } from "@/components/motion/use-section-motion";
import { ProjectMediaAperture } from "./project-media-aperture";

export const PortfolioArchive = memo(function PortfolioArchive() {
  const containerRef = useSectionMotion<HTMLElement>({ distance: 16, stagger: 0.05 });
  const [hoveredProject, setHoveredProject] = useState<Project | null>(ARCHIVE_PROJECTS[0] || null);

  return (
    <section
      ref={containerRef}
      id="work-index"
      className="phuc-archive section-shell section-space"
      aria-label="02 / ARCHIVE"
    >
      {/* Chapter 02 Header */}
      <div className="phuc-archive__header" data-motion-reveal>
        <div className="phuc-archive__header-left">
          <span className="phuc-label">02 / ARCHIVE</span>
          <h2 className="phuc-archive__headline">
            SYSTEM INDEX & ALL PROJECTS
          </h2>
        </div>
        <div className="phuc-archive__header-right">
          <span className="phuc-archive__meta">CHRONOLOGY // 2024 — 2026</span>
          <span className="phuc-archive__count">{ARCHIVE_PROJECTS.length} RECORDS</span>
        </div>
      </div>

      {/* Main Archive Layout: Index Table + Desktop Interactive Preview Pane */}
      <div className="phuc-archive__main-layout" data-motion-reveal>
        {/* Table / List Column */}
        <div className="phuc-archive__table-col">
          {/* Table Header Bar (Desktop Only) */}
          <div className="phuc-archive-thead" aria-hidden="true">
            <span className="col-idx">INDEX</span>
            <span className="col-year">YEAR</span>
            <span className="col-title">PROJECT / SYSTEM</span>
            <span className="col-cat">DOMAIN</span>
            <span className="col-impact">METRIC IMPACT</span>
            <span className="col-action">LINK</span>
          </div>

          {/* List items */}
          <div className="phuc-archive__index-list" role="list">
            {ARCHIVE_PROJECTS.map((project) => {
              const isHovered = hoveredProject?.slug === project.slug;
              const primaryMetric = project.metrics[0];

              return (
                <Link
                  key={project.slug}
                  href={`/portfolio/${project.slug}`}
                  className={`phuc-archive-row ${isHovered ? "phuc-archive-row--hover" : ""}`}
                  onPointerEnter={() => setHoveredProject(project)}
                  onFocus={() => setHoveredProject(project)}
                  role="listitem"
                  aria-label={`${project.index} ${project.title} (${project.year})`}
                >
                  <span className="phuc-row-num">{project.index}</span>

                  <span className="phuc-row-year">{project.year}</span>

                  <span className="phuc-row-title">
                    {project.title.toUpperCase()}
                  </span>

                  <span className="phuc-row-cat">{project.category}</span>

                  <span className="phuc-row-metric">
                    {primaryMetric ? `${primaryMetric.value} ${primaryMetric.label}` : "VERIFIED CASE"}
                  </span>

                  <span className="phuc-row-arrow" aria-hidden="true">
                    <ArrowUpRight size={16} strokeWidth={1.5} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop Interactive Preview Stage */}
        {hoveredProject && (
          <aside className="phuc-archive__preview-col" aria-hidden="true">
            <div className="phuc-archive-preview-card">
              <div className="phuc-preview-header">
                <span className="tag">SYSTEM PREVIEW // {hoveredProject.index}</span>
                <span className="year">{hoveredProject.year}</span>
              </div>

              <div className="phuc-preview-media">
                <ProjectMediaAperture
                  variant={hoveredProject.mediaVariant}
                  aspect="wide"
                  index={hoveredProject.index}
                  className="phuc-preview-aperture"
                />
              </div>

              <div className="phuc-preview-info">
                <h4 className="title">{hoveredProject.title}</h4>
                <p className="summary">{hoveredProject.summary}</p>
                <div className="kpi">
                  <span className="num">{hoveredProject.metrics[0]?.value}</span>
                  <span className="lbl">{hoveredProject.metrics[0]?.label}</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
});
