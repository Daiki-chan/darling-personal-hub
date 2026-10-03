"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FEATURED_PROJECTS } from "@/lib/portfolio-data";
import { ProjectMediaAperture } from "./project-media-aperture";
import { useSectionMotion } from "@/components/motion/use-section-motion";

export const PortfolioSelectedWork = memo(function PortfolioSelectedWork() {
  const containerRef = useSectionMotion<HTMLElement>({ distance: 20, stagger: 0.1 });

  return (
    <section
      ref={containerRef}
      id="selected-work"
      className="phuc-selected-work section-shell section-space"
      aria-label="01 / SELECTED WORK"
    >
      {/* Chapter 01 Heading Strip */}
      <div className="phuc-chapter-heading-strip" data-motion-reveal>
        <div className="phuc-chapter-heading-left">
          <span className="phuc-label">01 / SELECTED WORK</span>
          <span className="phuc-chapter-sub">DIGITAL EXHIBITION & SYSTEMS ARCHIVE</span>
        </div>
        <div className="phuc-chapter-heading-right">
          <span className="phuc-chapter-meta">2024 — 2026 // 04 EXHIBITS</span>
        </div>
      </div>

      {/* Monumental Vertical Exhibition Showcase */}
      <div className="phuc-exhibition-list">
        {FEATURED_PROJECTS.map((project, idx) => {
          const primaryMetric = project.metrics[0];
          const secondaryMetric = project.metrics[1];

          return (
            <article
              key={project.slug}
              className={`phuc-exhibit-card phuc-exhibit-card--${idx + 1}`}
              data-motion-reveal
            >
              {/* Exhibit Top Bar */}
              <div className="phuc-exhibit-top">
                <div className="phuc-exhibit-top-left">
                  <span className="phuc-exhibit-idx">{project.index}</span>
                  <span className="phuc-exhibit-sep" aria-hidden="true">/</span>
                  <span className="phuc-exhibit-cat">{project.category}</span>
                </div>
                <div className="phuc-exhibit-top-right">
                  <span className="phuc-exhibit-year">{project.year}</span>
                  <span className="phuc-exhibit-client">{project.client}</span>
                </div>
              </div>

              {/* Monumental Project Title Link */}
              <Link
                href={`/portfolio/${project.slug}`}
                className="phuc-exhibit-title-link"
                aria-label={`Xem case study: ${project.title}`}
              >
                <h2 className="phuc-exhibit-title">{project.title}</h2>
              </Link>

              {/* Large Visual Aperture Stage */}
              <div className="phuc-exhibit-media-stage">
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="phuc-exhibit-media-link"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <ProjectMediaAperture
                    variant={project.mediaVariant}
                    aspect={project.aspectRatio || "landscape"}
                    index={project.index}
                    className="phuc-exhibit-media"
                  />
                </Link>
              </div>

              {/* Lower Architectural Details Grid */}
              <div className="phuc-exhibit-details-grid">
                {/* Left Column: Summary, Capabilities, Roles */}
                <div className="phuc-exhibit-info-col">
                  <p className="phuc-exhibit-summary">{project.summary}</p>

                  {/* Capabilities Tags */}
                  {project.capabilities && project.capabilities.length > 0 && (
                    <div className="phuc-exhibit-cap-list" aria-label="Năng lực & Kỹ thuật">
                      {project.capabilities.map((cap) => (
                        <span key={cap} className="phuc-exhibit-cap-pill">
                          {cap}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="phuc-exhibit-role-row">
                    <span className="lbl">ROLE:</span>
                    <span className="val">{project.role.join(", ")}</span>
                    <span className="dot" aria-hidden="true">·</span>
                    <span className="lbl">DURATION:</span>
                    <span className="val">{project.duration}</span>
                  </div>
                </div>

                {/* Right Column: Telemetry KPI Block & High-End CTA */}
                <div className="phuc-exhibit-action-col">
                  <div className="phuc-exhibit-kpi-wrap">
                    {primaryMetric && (
                      <div className="phuc-exhibit-kpi-item">
                        <span className="val">{primaryMetric.value}</span>
                        <span className="lbl">{primaryMetric.label}</span>
                      </div>
                    )}
                    {secondaryMetric && (
                      <div className="phuc-exhibit-kpi-item phuc-exhibit-kpi-item--secondary">
                        <span className="val">{secondaryMetric.value}</span>
                        <span className="lbl">{secondaryMetric.label}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="phuc-exhibit-cta-btn"
                  >
                    <span>EXPLORE CASE STUDY</span>
                    <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
});
