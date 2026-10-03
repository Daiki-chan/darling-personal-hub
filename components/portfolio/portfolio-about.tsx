"use client";

import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useSectionMotion } from "@/components/motion/use-section-motion";
import { PortraitAperture } from "./portrait-aperture";

export const PortfolioAbout = memo(function PortfolioAbout() {
  const containerRef = useSectionMotion<HTMLElement>({ distance: 18, stagger: 0.08 });

  return (
    <section
      ref={containerRef}
      id="about"
      className="phuc-about section-shell section-space"
      aria-label="05 / ABOUT"
    >
      {/* Chapter 05 Tag Bar */}
      <div className="phuc-chapter-heading-strip" data-motion-reveal>
        <div className="phuc-chapter-heading-left">
          <span className="phuc-label">05 / ABOUT</span>
          <span className="phuc-chapter-sub">IDENTITY & DISCIPLINE</span>
        </div>
        <div className="phuc-chapter-heading-right">
          <span className="phuc-chapter-meta">BASED IN VIETNAM // GMT+7</span>
        </div>
      </div>

      {/* Main 12-Column Editorial Spread */}
      <div className="phuc-about__main-grid">
        {/* Left Column: Short, High-Impact Editorial Statement */}
        <div className="phuc-about__left-col" data-motion-reveal>
          <div className="phuc-about__kicker">PHẠM HOÀNG PHÚC // PRACTICE</div>

          <h3 className="phuc-about__headline">
            I BUILD DIGITAL EXPERIENCES WHERE
            <br />
            DESIGN, TECHNOLOGY AND GROWTH MEET.
          </h3>

          <p className="phuc-about__body">
            Dựa trên nền tảng kỹ thuật số tại Việt Nam. Tôi tiếp cận mỗi dự án với tư duy hệ thống: từ kiến trúc trang, tối ưu hóa ý định tìm kiếm cho đến từng chuyển động micro-interaction nhỏ nhất.
          </p>

          <div className="phuc-about__exploring-block">
            <span className="phuc-about__exploring-label">CURRENTLY EXPLORING:</span>
            <div className="phuc-about__exploring-tags">
              <span className="tag">WEB</span>
              <span className="sep" aria-hidden="true">/</span>
              <span className="tag">SEO</span>
              <span className="sep" aria-hidden="true">/</span>
              <span className="tag">E-COMMERCE</span>
              <span className="sep" aria-hidden="true">/</span>
              <span className="tag">INTERACTION</span>
            </div>
          </div>

          <div className="phuc-about__meta-grid">
            <div className="phuc-about__meta-item">
              <span className="lbl">LOCATION</span>
              <span className="val">TP. HỒ CHÍ MINH, VIỆT NAM</span>
            </div>
            <div className="phuc-about__meta-item">
              <span className="lbl">STATUS</span>
              <span className="val">AVAILABLE FOR SELECT PROJECTS</span>
            </div>
            <div className="phuc-about__meta-item">
              <span className="lbl">TIMELINE</span>
              <span className="val">2024 — 2026 ACTIVE</span>
            </div>
          </div>

          <div className="phuc-about__links-row">
            <a
              href="https://github.com/Daiki-chan"
              target="_blank"
              rel="noopener noreferrer"
              className="phuc-about-link"
            >
              <span>GITHUB</span>
              <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="phuc-about-link"
            >
              <span>LINKEDIN</span>
              <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
            </a>

            <a
              href="mailto:your-email@example.com"
              className="phuc-about-link"
            >
              <span>EMAIL</span>
              <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Right Column: High-End Portrait Aperture */}
        <div className="phuc-about__right-col" data-motion-reveal>
          <PortraitAperture />
        </div>
      </div>
    </section>
  );
});
