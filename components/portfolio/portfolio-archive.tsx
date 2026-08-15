"use client";

import { memo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ARCHIVE_PROJECTS } from "@/lib/portfolio-data";

gsap.registerPlugin(ScrollTrigger);

export const PortfolioArchive = memo(function PortfolioArchive() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { opacity: 0, y: 24, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 0.8,
            ease: "power3.out",
          }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="work-index"
      className="phuc-archive section-shell section-space"
      aria-label="02 / WORK INDEX"
    >
      {/* Chapter 02 Tag & Headline */}
      <div className="phuc-archive__header">
        <span className="phuc-label">02 / WORK INDEX</span>
        <h2 ref={headlineRef} className="phuc-archive__headline">
          TOÀN BỘ TÁC PHẨM & DỰ ÁN
        </h2>
      </div>

      {/* Editorial List Manifest (Sibling of Music Track List) */}
      <div className="phuc-archive__index-list" role="list">
        {ARCHIVE_PROJECTS.map((project) => {
          const isHovered = hoveredId === project.slug;
          const isDimmed = hoveredId !== null && !isHovered;

          return (
            <Link
              key={project.slug}
              href={`/portfolio/${project.slug}`}
              className={`phuc-archive-row ${isHovered ? "phuc-archive-row--hover" : ""} ${
                isDimmed ? "phuc-archive-row--dim" : ""
              }`}
              onPointerEnter={() => setHoveredId(project.slug)}
              onPointerLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(project.slug)}
              onBlur={() => setHoveredId(null)}
              role="listitem"
            >
              <span className="phuc-row-num">{project.index}</span>

              <span className="phuc-row-title">
                {project.title.toUpperCase()}
              </span>

              <span className="phuc-row-cat">{project.category}</span>

              <span className="phuc-row-year">{project.year}</span>

              <span className="phuc-row-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
});

