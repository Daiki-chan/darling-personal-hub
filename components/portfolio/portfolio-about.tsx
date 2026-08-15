"use client";

import { memo } from "react";
import { useSectionMotion } from "@/components/motion/use-section-motion";
import { PortraitAperture } from "./portrait-aperture";

const CAPABILITIES_TABLE = [
  {
    group: "STRATEGY & SEARCH",
    items: [
      "Chiến lược SEO & Kiến trúc từ khóa",
      "Nghiên cứu Ý định Tìm kiếm (Intent)",
      "Tối ưu hóa On-page & Internal Link",
      "Phân tích Đối thủ & Market Share",
    ],
  },
  {
    group: "CONTENT & ARCHITECTURE",
    items: [
      "Cấu trúc Topic Cluster / Pillar-Hub",
      "Xây dựng Content Brief chuẩn SEO",
      "Tối ưu hóa Trải nghiệm Đọc (UX Writing)",
      "Đánh giá & Tái cấu trúc Nội dung cũ",
    ],
  },
  {
    group: "ANALYTICS & CONVERSION",
    items: [
      "Báo cáo Hiệu suất GA4 & Search Console",
      "Tối ưu Tỷ lệ Chuyển đổi (CRO cơ bản)",
      "Thử nghiệm A/B Tiêu đề & Landing Page",
      "Theo dõi Hành vi & Luồng Chuyển đổi",
    ],
  },
  {
    group: "TECHNICAL & PLATFORM",
    items: [
      "Audit Kỹ thuật & Tốc độ Tải trang",
      "Quản lý Indexing & Canonicalization",
      "Dữ liệu cấu trúc Schema.org",
      "Tối ưu Hiển thị Local & Thương mại điện tử",
    ],
  },
];

const TIMELINE_ENTRIES = [
  { year: "2026", desc: "E-COMMERCE & TECHNICAL SEO GROWTH SPRINT" },
  { year: "2025", desc: "CONTENT CLUSTER & CONVERSION RATE OPTIMIZATION" },
  { year: "2024", desc: "ORGANIC SEARCH VISIBILITY & ON-PAGE ARCHITECTURE" },
];

export const PortfolioAbout = memo(function PortfolioAbout() {
  const containerRef = useSectionMotion<HTMLElement>();

  return (
    <section
      ref={containerRef}
      id="about"
      className="phuc-about section-shell section-space"
      aria-label="04 / ABOUT"
    >
      {/* Chapter 04 Tag */}
      <div className="phuc-about__chapter-bar" data-motion-reveal>
        <span className="phuc-label">04 / ABOUT</span>
        <span className="phuc-about__chapter-desc">IDENTITY & EVIDENCE</span>
      </div>

      {/* Main 12-Column Editorial Spread: Name Plate ↔ Portrait Aperture */}
      <div className="phuc-about__main-grid">
        {/* Left Column: Monumental Typographic Name & Professional Metadata */}
        <div className="phuc-about__left-col" data-motion-reveal>
          <div className="phuc-about__name-plate">
            <h2 className="phuc-about__name">
              <span className="phuc-about__name-line">PHẠM</span>
              <span className="phuc-about__name-line">HOÀNG</span>
              <span className="phuc-about__name-line">PHÚC</span>
            </h2>
            <div className="phuc-about__role-block">
              <span className="phuc-about__role-title">MARKETING / SEO SPECIALIST</span>
              <span className="phuc-about__role-sub">E-COMMERCE & PERFORMANCE SYSTEMS</span>
            </div>
          </div>

          <div className="phuc-about__divider-line" aria-hidden="true" />

          <div className="phuc-about__meta-row">
            <div className="phuc-about__meta-item">
              <span className="lbl">STATUS</span>
              <span className="val">AVAILABLE FOR COLLABORATION</span>
            </div>
            <div className="phuc-about__meta-item">
              <span className="lbl">LOCATION</span>
              <span className="val">TP. HỒ CHÍ MINH, VIỆT NAM</span>
            </div>
            <div className="phuc-about__meta-item">
              <span className="lbl">PRACTICE</span>
              <span className="val">2024 — 2026</span>
            </div>
          </div>
        </div>

        {/* Right Column: High-End Portrait Aperture (4:5 Ratio) */}
        <div className="phuc-about__right-col">
          <PortraitAperture />
        </div>
      </div>

      {/* Static Editorial Capabilities Table (No Marquee, No Stars, No Pills) */}
      <div className="phuc-about__capabilities-section" data-motion-reveal>
        <div className="phuc-about__section-header">
          <span className="phuc-about__sub-title">NĂNG LỰC THỰC THI</span>
          <span className="phuc-about__sub-desc">CORE DOMAINS</span>
        </div>

        <div className="phuc-capabilities-grid">
          {CAPABILITIES_TABLE.map((group) => (
            <div key={group.group} className="phuc-cap-group">
              <h4 className="phuc-cap-group__title">{group.group}</h4>
              <ul className="phuc-cap-group__list">
                {group.items.map((item) => (
                  <li key={item} className="phuc-cap-item">
                    <span className="dash" aria-hidden="true">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Experience Timeline (3 Clean 1-Line Hairline Entries) */}
      <div className="phuc-about__timeline-wrap" data-motion-reveal>
        <div className="phuc-about__section-header">
          <span className="phuc-about__sub-title">HÀNH TRÌNH CHUYÊN MÔN</span>
          <span className="phuc-about__sub-desc">CHRONOLOGY</span>
        </div>

        <div className="phuc-about__timeline-list">
          {TIMELINE_ENTRIES.map((entry) => (
            <div key={entry.year} className="phuc-about-tl-item">
              <span className="phuc-tl-year">{entry.year}</span>
              <p className="phuc-tl-desc">{entry.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
