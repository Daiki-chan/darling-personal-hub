"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROFILE_DATA } from "@/lib/portfolio-data";

gsap.registerPlugin(ScrollTrigger);

export function PortfolioHero() {
  const containerRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const growthSpanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(glow, "x", { duration: 1.2, ease: "power2.out" });
    const yTo = gsap.quickTo(glow, "y", { duration: 1.2, ease: "power2.out" });

    const handlePointerMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      xTo(clientX - 200);
      yTo(clientY - 200);
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // 1. Initial clip-path text reveal timeline
      const revealTl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.1 } });

      revealTl.fromTo(
        [line1Ref.current, line2Ref.current, line3Ref.current],
        { yPercent: 120, opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
        {
          yPercent: 0,
          opacity: 1,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          stagger: 0.14,
          delay: 0.1,
        }
      );

      // 2. Pointer inertia on active word
      if (growthSpanRef.current && !window.matchMedia("(pointer: coarse)").matches) {
        const growth = growthSpanRef.current;
        const gX = gsap.quickTo(growth, "x", { duration: 0.8, ease: "power2.out" });
        const gY = gsap.quickTo(growth, "y", { duration: 0.8, ease: "power2.out" });

        const handleGrowthMove = (e: MouseEvent) => {
          const rect = growth.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (e.clientX - centerX) * 0.08;
          const deltaY = (e.clientY - centerY) * 0.08;
          gX(deltaX);
          gY(deltaY);
        };

        window.addEventListener("mousemove", handleGrowthMove, { passive: true });
      }

      // 3. Scroll Exit Parallax & Ghost Typography Timeline (Rules 3, 4, 5)
      const heroScrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 0-65% scroll: Lines 1 & 2 transition to readable Ghost Typography
      heroScrollTl
        .to(
          [line1Ref.current, line2Ref.current],
          {
            y: -25,
            opacity: 0.16,
            scale: 0.985,
            ease: "power1.out",
            duration: 0.65,
          },
          0
        )
        // 65-100% scroll: Ghost lines fade gently out as hero exits
        .to(
          [line1Ref.current, line2Ref.current],
          {
            y: -45,
            opacity: 0,
            ease: "power1.in",
            duration: 0.35,
          },
          0.65
        );

      // Line 3 (TĂNG TRƯỞNG.) shifts upward 6vh to compose with ghost text above
      heroScrollTl.to(
        line3Ref.current,
        {
          y: "-6vh",
          scale: 1.04,
          letterSpacing: "0.015em",
          ease: "none",
          duration: 1,
        },
        0
      );
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="phuc-hero" aria-label="Portfolio Hero">
      <div ref={glowRef} className="phuc-hero__glow" aria-hidden="true" />

      <div className="phuc-hero__top section-shell">
        <div className="phuc-hero__brand">
          <span className="phuc-tag">{PROFILE_DATA.name}</span>
        </div>
        <div className="phuc-hero__meta-top">
          <span className="phuc-tag">{PROFILE_DATA.role.toUpperCase()}</span>
          <span className="phuc-tag-sub">PORTFOLIO 2026</span>
        </div>
      </div>

      <div className="phuc-hero__center section-shell">
        <h1 className="phuc-hero__title">
          <div className="phuc-hero__mask">
            <div ref={line1Ref} className="phuc-hero__line phuc-hero__line--ghostable">
              TÔI BIẾN
            </div>
          </div>
          <div className="phuc-hero__mask">
            <div ref={line2Ref} className="phuc-hero__line phuc-hero__line--ghostable">
              TÌM KIẾM THÀNH
            </div>
          </div>
          <div className="phuc-hero__mask">
            <div ref={line3Ref} className="phuc-hero__line phuc-hero__line--accent">
              <span ref={growthSpanRef} className="phuc-growth-text">
                TĂNG TRƯỞNG.
              </span>
            </div>
          </div>
        </h1>

        <div className="phuc-hero__sub-block">
          <p className="phuc-hero__copy">
            Chuyên viên Marketing & SEO tập trung xây dựng độ hiển thị tự nhiên, nội dung giá trị và sự tăng trưởng kỹ thuật số đo lường được.
          </p>
          <div className="phuc-hero__metadata-strip">
            <span>{PROFILE_DATA.experience.toUpperCase()}</span>
            <span className="dot">•</span>
            <span>{PROFILE_DATA.location}</span>
          </div>
        </div>
      </div>

      <div className="phuc-hero__bottom section-shell">
        <a href="#profile" className="phuc-scroll-prompt">
          <span>CUỘN ĐỂ KHÁM PHÁ</span>
          <span className="arrow">↓</span>
        </a>
      </div>
    </section>
  );
}
