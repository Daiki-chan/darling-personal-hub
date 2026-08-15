"use client";

import { memo, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const METHOD_STEPS = [
  {
    idx: "01",
    name: "SEARCH",
    sub: "DISCOVERY",
    desc: "Tìm kiếm cơ hội tăng trưởng từ hành vi thực tế và nhu cầu chưa được đáp ứng của người dùng.",
  },
  {
    idx: "02",
    name: "INTENT",
    sub: "ANALYSIS",
    desc: "Giải mã mục đích tìm kiếm (Intent) đằng sau từng cụm từ khóa và truy vấn dữ liệu thực tế.",
  },
  {
    idx: "03",
    name: "STRUCTURE",
    sub: "ARCHITECTURE",
    desc: "Xây dựng kiến trúc nội dung và cụm chủ đề chuẩn SEO có khả năng mở rộng quy mô bền vững.",
  },
  {
    idx: "04",
    name: "TEST",
    sub: "EXPERIMENT",
    desc: "Thử nghiệm A/B tiêu đề, cấu trúc trang đích và các điểm chuyển đổi trọng yếu.",
  },
  {
    idx: "05",
    name: "MEASURE",
    sub: "TELEMETRY",
    desc: "Đo lường tỷ lệ chuyển đổi GA4 và tinh chỉnh chiến lược tăng trưởng theo thời gian thực.",
  },
];

export const PortfolioApproach = memo(function PortfolioApproach() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(2); // Default to Step 03 Structure

  const currentStep = METHOD_STEPS[activeStepIdx] || METHOD_STEPS[2];

  return (
    <section
      ref={containerRef}
      id="method"
      className="phuc-approach section-shell section-space"
      aria-label="03 / METHOD"
    >
      {/* Chapter 03 Tag & Headline (Calm / Precise) */}
      <div className="phuc-method__hero">
        <div className="phuc-method__chapter-bar">
          <span className="phuc-label">03 / METHOD</span>
          <span className="phuc-method__chapter-desc">SYSTEMATIC EXECUTION SYSTEM</span>
        </div>
        <h2 className="phuc-method__headline">
          QUY TRÌNH THỰC THI 5 BƯỚC DỰA TRÊN DỮ LIỆU.
        </h2>
      </div>

      {/* 5-Stage Visible System Grid (All 5 Steps Visibly Present on Desktop) */}
      <div className="phuc-method__grid-system">
        <div className="phuc-method__top-hairline" aria-hidden="true" />

        <div className="phuc-method__steps-grid" role="tablist" aria-label="Method Steps">
          {METHOD_STEPS.map((step, index) => {
            const isActive = activeStepIdx === index;

            return (
              <button
                key={step.idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`phuc-method-card ${isActive ? "phuc-method-card--active" : ""}`}
                onClick={() => setActiveStepIdx(index)}
                onPointerEnter={() => setActiveStepIdx(index)}
                aria-label={`Bước ${step.idx}: ${step.name}`}
              >
                <div className="phuc-method-card__top">
                  <span className="phuc-method-card__idx">{step.idx}</span>
                  <span className="phuc-method-card__sub">{step.sub}</span>
                </div>
                <h3 className="phuc-method-card__name">{step.name}</h3>
                <div className="phuc-method-card__indicator" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div className="phuc-method__bottom-hairline" aria-hidden="true" />

        {/* Dynamic 1-Sentence Active Protocol Descriptor */}
        <div className="phuc-method__descriptor-panel">
          <div className="phuc-method__desc-tag">ACTIVE PROTOCOL</div>
          <p className="phuc-method__descriptor-text">
            <span className="phuc-method__desc-prefix">{currentStep.idx} / {currentStep.name} — </span>
            {currentStep.desc}
          </p>
        </div>
      </div>

      {/* Restrained Philosophy Concluding Note (Quiet, Medium Scale, 2 Lines) */}
      <div className="phuc-approach__statement-block">
        <div className="phuc-approach__statement-hairline" aria-hidden="true" />
        <p className="phuc-approach__quote">
          “DỮ LIỆU NÓI CHO TÔI BIẾT ĐIỀU GÌ ĐÃ XẢY RA.
          <br />
          SỰ TÒ MÒ BẢO TÔI NÊN THỬ NGHIỆM GÌ TIẾP THEO.”
        </p>
      </div>
    </section>
  );
});
