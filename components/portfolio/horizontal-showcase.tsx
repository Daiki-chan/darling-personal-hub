"use client";

import { memo, useRef, useState } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { FEATURED_PROJECTS } from "@/lib/portfolio-data";
import { ProjectMediaAperture } from "./project-media-aperture";

export const HorizontalShowcase = memo(function HorizontalShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number>(0);

  const activeProjectIndexRef = useRef(0);
  useGSAP(
    () => {
      if (typeof window === "undefined" || !trackRef.current) return;

      const mm = gsap.matchMedia();

      // Desktop Only Horizontal Scrubbing Track
      mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current;
        if (!track) return;

        const getScrollDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: () => `+=${getScrollDistance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const idx = Math.min(
                Math.round(self.progress * (FEATURED_PROJECTS.length - 1)),
                FEATURED_PROJECTS.length - 1
              );

              if (idx === activeProjectIndexRef.current) return;
              activeProjectIndexRef.current = idx;
              setActiveProjectIndex(idx);
            },
          },
        });

        pinTl.to(track, {
          x: () => -getScrollDistance(),
          ease: "none",
        });

        return () => {
          pinTl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const project1 = FEATURED_PROJECTS[0];
  const project2 = FEATURED_PROJECTS[1];
  const project3 = FEATURED_PROJECTS[2];

  return (
    <section
      ref={containerRef}
      id="selected-work"
      className="phuc-showcase-wrapper"
      aria-label="01 / SELECTED WORK"
    >
      {/* Chapter 01 Heading Strip with increased breathing room */}
      <div className="phuc-chapter-heading-strip section-shell">
        <div className="phuc-chapter-heading-left">
          <span className="phuc-label">01 / SELECTED WORK</span>
          <span className="phuc-chapter-sub">THREE BLACK & WHITE EDITORIAL SPREADS</span>
        </div>
        <div className="phuc-chapter-heading-right">
          <span className="phuc-chapter-meta">2024 — 2026 ARCHIVE</span>
        </div>
      </div>

      <div ref={trackRef} className="phuc-showcase-track">
        {/* =========================================================================
            SPREAD 01 — ORGANIC SEARCH (LANDSCAPE / IMAGE-DOMINANT COMPOSITION)
            ========================================================================= */}
        <article
          className={`phuc-editorial-spread phuc-editorial-spread--01 ${
            activeProjectIndex === 0 ? "phuc-editorial-spread--active" : ""
          }`}
          onPointerEnter={() => {
            activeProjectIndexRef.current = 0;
            setActiveProjectIndex(0);
          }}
        >
          <div className="phuc-spread-inner">
            <Link href={`/portfolio/${project1.slug}`} className="phuc-spread-link">
              <div className="phuc-spread-01-grid">
                {/* Top Section: Index & Overlapping Monumental Title */}
                <div className="phuc-spread-01-top">
                  <div className="phuc-spread-idx-row">
                    <span className="phuc-spread-idx">01 / 03</span>
                    <span className="phuc-spread-cat-tag">SEO / CONTENT STRATEGY</span>
                  </div>
                  <h2 className="phuc-spread-01-title">
                    <span className="word-top">ORGANIC SEARCH</span>
                  </h2>
                </div>

                {/* Center Main Stage: 55–65% Width Dominant Landscape Media */}
                <div className="phuc-spread-01-media-wrap">
                  <ProjectMediaAperture
                    variant="search"
                    aspect="landscape"
                    index="01"
                    className="phuc-spread-01-media"
                  />
                  <div className="phuc-spread-01-sub-title" aria-hidden="true">
                    GROWTH
                  </div>
                </div>

                {/* Bottom Architectural Row: Large Typographic KPI & Two-Zone Footer */}
                <div className="phuc-spread-01-bottom">
                  <div className="phuc-spread-01-kpi-block">
                    <div className="phuc-spread-kpi-huge">{project1.metrics[0]?.value}</div>
                    <div className="phuc-spread-kpi-sub">{project1.metrics[0]?.label}</div>
                  </div>

                  <div className="phuc-spread-01-meta-block">
                    <div className="phuc-spread-tag-year">
                      <span>{project1.category}</span>
                      <span className="dot" aria-hidden="true">·</span>
                      <span>{project1.year}</span>
                    </div>

                    <div className="phuc-spread-footer-bar">
                      <span className="phuc-spread-sample-badge">PROJECT SAMPLE DATA</span>
                      <span className="phuc-spread-cta">
                        <span>XEM CASE STUDY</span>
                        <span className="arrow" aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </article>

        {/* =========================================================================
            SPREAD 02 — CONTENT CLUSTER (VERTICAL TENSION / TALL PORTRAIT APERTURE)
            ========================================================================= */}
        <article
          className={`phuc-editorial-spread phuc-editorial-spread--02 ${
            activeProjectIndex === 1 ? "phuc-editorial-spread--active" : ""
          }`}
          onPointerEnter={() => {
            activeProjectIndexRef.current = 1;
            setActiveProjectIndex(1);
          }}
        >
          <div className="phuc-spread-inner">
            <Link href={`/portfolio/${project2.slug}`} className="phuc-spread-link">
              <div className="phuc-spread-02-grid">
                {/* Left Column: Typographic Stack, Huge KPI & Metadata */}
                <div className="phuc-spread-02-left">
                  <div className="phuc-spread-idx-row">
                    <span className="phuc-spread-idx">02 / 03</span>
                    <span className="phuc-spread-cat-tag">TOPIC ARCHITECTURE</span>
                  </div>

                  <h2 className="phuc-spread-02-title">
                    <span>CONTENT</span>
                    <span>CLUSTER</span>
                  </h2>

                  <div className="phuc-spread-02-kpi-wrap">
                    <div className="phuc-spread-kpi-huge">{project2.metrics[0]?.value}</div>
                    <div className="phuc-spread-kpi-sub">{project2.metrics[0]?.label}</div>
                  </div>

                  <div className="phuc-spread-02-meta">
                    <div className="phuc-spread-tag-year">
                      <span>{project2.category}</span>
                      <span className="dot" aria-hidden="true">·</span>
                      <span>{project2.year}</span>
                    </div>

                    <div className="phuc-spread-footer-bar">
                      <span className="phuc-spread-sample-badge">PROJECT SAMPLE DATA</span>
                      <span className="phuc-spread-cta">
                        <span>XEM CASE STUDY</span>
                        <span className="arrow" aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Tall 4:5 Portrait Media Aperture (Vertical Tension) */}
                <div className="phuc-spread-02-right">
                  <ProjectMediaAperture
                    variant="content"
                    aspect="portrait"
                    index="02"
                    className="phuc-spread-02-media"
                  />
                </div>
              </div>
            </Link>
          </div>
        </article>

        {/* =========================================================================
            SPREAD 03 — SEARCH ──→ CONVERSION (WIDE CINEMATIC SPREAD / HORIZONTAL FLOW)
            ========================================================================= */}
        <article
          className={`phuc-editorial-spread phuc-editorial-spread--03 ${
            activeProjectIndex === 2 ? "phuc-editorial-spread--active" : ""
          }`}
          onPointerEnter={() => {
            activeProjectIndexRef.current = 2;
            setActiveProjectIndex(2);
          }}
        >
          <div className="phuc-spread-inner">
            <Link href={`/portfolio/${project3.slug}`} className="phuc-spread-link">
              <div className="phuc-spread-03-grid">
                {/* Top Section: Index Tag */}
                <div className="phuc-spread-idx-row">
                  <span className="phuc-spread-idx">03 / 03</span>
                  <span className="phuc-spread-cat-tag">INTENT TO CONVERSION FLOW</span>
                </div>

                {/* Center Top: Wide Cinematic Media Aperture */}
                <div className="phuc-spread-03-media-wrap">
                  <ProjectMediaAperture
                    variant="analytics"
                    aspect="wide"
                    index="03"
                    className="phuc-spread-03-media"
                  />
                </div>

                {/* Bottom Floor: Typographic Title ──→ Split Metrics & Two-Zone Footer */}
                <div className="phuc-spread-03-bottom">
                  <div className="phuc-spread-03-title-col">
                    <h2 className="phuc-spread-03-title">
                      <span>SEARCH</span>
                      <span className="arrow-sep">──→</span>
                      <span>CONVERSION</span>
                    </h2>
                  </div>

                  <div className="phuc-spread-03-metrics-col">
                    <div className="phuc-spread-03-split-kpi">
                      <div className="kpi-item">
                        <span className="val">{project3.metrics[0]?.value}</span>
                        <span className="lbl">{project3.metrics[0]?.label}</span>
                      </div>
                      <div className="kpi-divider" aria-hidden="true" />
                      {project3.metrics[1] && (
                        <div className="kpi-item">
                          <span className="val">{project3.metrics[1].value}</span>
                          <span className="lbl">{project3.metrics[1].label}</span>
                        </div>
                      )}
                    </div>

                    <div className="phuc-spread-footer-bar">
                      <span className="phuc-spread-sample-badge">PROJECT SAMPLE DATA</span>
                      <span className="phuc-spread-cta">
                        <span>XEM CASE STUDY</span>
                        <span className="arrow" aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
});
