"use client";

import { memo, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EvidenceField } from "./evidence-field";

gsap.registerPlugin(ScrollTrigger);

export const PortfolioHero = memo(function PortfolioHero() {
  const containerRef = useRef<HTMLElement>(null);
  const titleLeftRef = useRef<HTMLDivElement>(null);
  const evidenceRightRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (titleLeftRef.current) {
        const meta = titleLeftRef.current.querySelector(".phuc-hero-meta");
        const titleLines = titleLeftRef.current.querySelectorAll(".phuc-hero-title-line");

        tl.fromTo(
          meta,
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.6 }
        ).fromTo(
          titleLines,
          { opacity: 0, y: 32, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 0.9,
            stagger: 0.12,
          },
          "-=0.4"
        );
      }

      if (evidenceRightRef.current) {
        tl.fromTo(
          evidenceRightRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <header ref={containerRef} className="phuc-hero-root">
      <div className="phuc-hero-main-grid section-shell">
        {/* Left Column: World Anchor & Monumental H1 (WORK + ARCHIVE Legible) */}
        <div ref={titleLeftRef} className="phuc-hero-left">
          <div className="phuc-hero-meta">
            <span className="phuc-hero-anchor-tag">FUJIWARA DAIKI</span>
            <span className="phuc-hero-chapter-index">WORK / 03</span>
          </div>

          <h1 className="phuc-hero-title">
            <span className="phuc-hero-title-line">WORK</span>
            <span className="phuc-hero-title-line">ARCHIVE</span>
          </h1>
        </div>

        {/* Right Column: Signature Evidence Field Space */}
        <div ref={evidenceRightRef} className="phuc-hero-right">
          <EvidenceField dormantLabel="EVIDENCE FIELD" />
        </div>
      </div>

      {/* Bottom Structural Hairline & Metadata Strip */}
      <div className="phuc-hero-bottom-strip section-shell">
        <div className="phuc-hero-strip-line" />
        <div className="phuc-hero-strip-meta">
          <span className="phuc-hero-strip-label">SELECTED PRACTICE</span>
          <span className="phuc-hero-strip-disc">SEO / CONTENT / PERFORMANCE</span>
          <span className="phuc-hero-strip-year">2024 — 2026</span>
        </div>
      </div>
    </header>
  );
});


