"use client";

import { memo, useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from "@/lib/motion/tokens";

export const PortfolioHero = memo(function PortfolioHero() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const sideCardRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({ defaults: { ease: MOTION_EASE.gsap } });

      if (metaRef.current) {
        tl.fromTo(
          metaRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: MOTION_DURATION.standard }
        );
      }

      if (titleRef.current) {
        const lines = titleRef.current.querySelectorAll(".phuc-hero-title-line");
        tl.fromTo(
          lines,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: MOTION_DURATION.hero,
            stagger: MOTION_STAGGER.standard,
            clearProps: "transform,opacity",
          },
          "-=0.25"
        );
      }

      if (sideCardRef.current) {
        tl.fromTo(
          sideCardRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: MOTION_DURATION.section, clearProps: "transform,opacity" },
          "-=0.4"
        );
      }

      if (bottomBarRef.current) {
        tl.fromTo(
          bottomBarRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: MOTION_DURATION.standard, clearProps: "transform,opacity" },
          "-=0.3"
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <header ref={containerRef} className="phuc-hero-root">
      {/* Top Technical Metadata Bar */}
      <div className="section-shell phuc-hero-top-strip">
        <div ref={metaRef} className="phuc-hero-top-inner">
          <div className="phuc-hero-top-left">
            <span className="phuc-hero-brand-tag">PORTFOLIO</span>
            <span className="phuc-hero-sep" aria-hidden="true">/</span>
            <span className="phuc-hero-node-tag">WORKSPACE EDITION</span>
          </div>

          <div className="phuc-hero-top-right">
            <div className="phuc-hero-status-pill">
              <span className="phuc-hero-status-dot" aria-hidden="true" />
              <span className="phuc-hero-status-text">SYSTEM ACTIVE // 2026</span>
            </div>
            <span className="phuc-hero-year-tag">2026</span>
          </div>
        </div>
      </div>

      {/* Main Asymmetrical Grid */}
      <div className="section-shell phuc-hero-main-grid">
        {/* Left Column: Monumental Identity & Title */}
        <div className="phuc-hero-left">
          <div className="phuc-hero-identity">
            <span className="phuc-hero-kicker">CREATIVE TECHNOLOGIST & SEO SPECIALIST</span>
            <span className="phuc-hero-author">PHẠM HOÀNG PHÚC</span>
          </div>

          <h1 ref={titleRef} className="phuc-hero-title">
            <span className="phuc-hero-title-line">DIGITAL</span>
            <span className="phuc-hero-title-line phuc-hero-title-line--accent">WORK / SYSTEMS</span>
            <span className="phuc-hero-title-line">/ EXPERIMENTS</span>
          </h1>

          <div className="phuc-hero-domains">
            <span className="phuc-hero-domain-tag">E-commerce</span>
            <span className="dot" aria-hidden="true">·</span>
            <span className="phuc-hero-domain-tag">SEO</span>
            <span className="dot" aria-hidden="true">·</span>
            <span className="phuc-hero-domain-tag">Digital Marketing</span>
            <span className="dot" aria-hidden="true">·</span>
            <span className="phuc-hero-domain-tag">Web</span>
            <span className="dot" aria-hidden="true">·</span>
            <span className="phuc-hero-domain-tag">Creative</span>
            <span className="dot" aria-hidden="true">·</span>
            <span className="phuc-hero-domain-tag">Interactive</span>
          </div>
        </div>

        {/* Right Column: Technical Telemetry & Spatial Specimen Box */}
        <div ref={sideCardRef} className="phuc-hero-right">
          <div className="phuc-hero-specimen-card">
            {/* Corner Marks */}
            <div className="phuc-specimen-reg phuc-specimen-reg--tl" aria-hidden="true" />
            <div className="phuc-specimen-reg phuc-specimen-reg--tr" aria-hidden="true" />
            <div className="phuc-specimen-reg phuc-specimen-reg--bl" aria-hidden="true" />
            <div className="phuc-specimen-reg phuc-specimen-reg--br" aria-hidden="true" />

            <div className="phuc-specimen-header">
              <span className="phuc-specimen-label">TELEMETRY // COORDINATES</span>
              <span className="phuc-specimen-coords">10.8231° N, 106.6297° E</span>
            </div>

            <p className="phuc-specimen-statement">
              Xây dựng các không gian số cá nhân nơi thẩm mỹ tối giản gặp gỡ năng lực kỹ thuật và tăng trưởng tự nhiên bền vững.
            </p>

            <div className="phuc-specimen-metrics-grid">
              <div className="phuc-specimen-metric">
                <span className="num">04</span>
                <span className="lbl">SELECTED WORK</span>
              </div>
              <div className="phuc-specimen-metric">
                <span className="num">04</span>
                <span className="lbl">EXPERIMENTS</span>
              </div>
              <div className="phuc-specimen-metric">
                <span className="num">07</span>
                <span className="lbl">SYSTEM ARCHIVE</span>
              </div>
            </div>

            <div className="phuc-specimen-footer">
              <span className="phuc-specimen-status">AVAILABLE FOR SELECT INQUIRIES</span>
              <span className="phuc-specimen-loc">SGN // VN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Structural Hairline & Action Anchor */}
      <div ref={bottomBarRef} className="section-shell phuc-hero-bottom-bar">
        <div className="phuc-hero-bottom-line" aria-hidden="true" />
        <div className="phuc-hero-bottom-inner">
          <a href="#selected-work" className="phuc-hero-explore-link">
            <span className="phuc-hero-explore-arrow" aria-hidden="true">↓</span>
            <span className="phuc-hero-explore-text">EXPLORE WORK</span>
          </a>

          <div className="phuc-hero-bottom-meta">
            <span>INDEX // 01 — 07</span>
            <span className="phuc-hero-meta-sep" aria-hidden="true">·</span>
            <span>OBSIDIAN DIGITAL EXHIBITION</span>
          </div>
        </div>
      </div>
    </header>
  );
});
