"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SelectedWorkIntro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom top+=100",
            scrub: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="phuc-work-intro section-shell" aria-label="Selected Work Introduction">
      <div className="phuc-work-intro__content">
        <div className="phuc-work-intro__left">
          <span className="phuc-work-intro__tag">DỰ ÁN NỔI BẬT</span>
          <span className="phuc-work-intro__year">2024 — 2026</span>
        </div>
        <div className="phuc-work-intro__right">
          <p className="phuc-work-intro__desc">Các thử nghiệm SEO, nội dung và tăng trưởng kỹ thuật số được chọn lọc.</p>
          <span className="phuc-work-intro__count">03 DỰ ÁN TIÊU BIỂU</span>
        </div>
      </div>

      <div className="phuc-work-intro__line-track">
        <div ref={lineRef} className="phuc-work-intro__line-fill" />
      </div>
    </section>
  );
}
