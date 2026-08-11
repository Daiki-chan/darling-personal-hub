"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function PortfolioStatement() {
  const containerRef = useRef<HTMLElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null);
  const l2Ref = useRef<HTMLDivElement>(null);
  const l3Ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const lines = [l1Ref.current, l2Ref.current, l3Ref.current];

      gsap.fromTo(
        lines,
        { opacity: 0.38, y: 24, letterSpacing: "-0.04em" },
        {
          opacity: 1,
          y: 0,
          letterSpacing: "-0.01em",
          stagger: 0.2,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "bottom 35%",
            scrub: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="phuc-statement section-shell section-space" aria-label="Personal Manifesto">
      <div className="phuc-statement__wrap">
        <div ref={l1Ref} className="phuc-stmt-line">
          MARKETING THU HÚT SỰ CHÚ Ý.
        </div>
        <div ref={l2Ref} className="phuc-stmt-line phuc-stmt-line--highlight">
          SEO XÂY DỰNG SỰ KHÁM PHÁ.
        </div>
        <div ref={l3Ref} className="phuc-stmt-line">
          TRẢI NGHIỆM TỐT CHINH PHỤC LƯỢT CLICK TIẾP THEO.
        </div>
      </div>
    </section>
  );
}
