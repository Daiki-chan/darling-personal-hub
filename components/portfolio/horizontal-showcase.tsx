"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FEATURED_PROJECTS, type Project } from "@/lib/portfolio-data";
import { PortfolioMediaPlaceholder } from "./portfolio-media-placeholder";
import { setGlobalCursor } from "./custom-cursor";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressDotRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(
    () => {
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.matchMedia("(max-width: 768px)").matches
      ) {
        return;
      }

      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const getScrollDistance = () => track.scrollWidth - window.innerWidth;

      const horizontalTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressDotRef.current) {
              gsap.to(progressDotRef.current, {
                xPercent: self.progress * 200,
                duration: 0.2,
                overwrite: "auto",
              });
            }

            const projectCount = FEATURED_PROJECTS.length;
            const newIndex = Math.min(
              projectCount - 1,
              Math.floor(self.progress * projectCount)
            );
            setActiveIndex(newIndex);
          },
        },
      });

      const projectEls = gsap.utils.toArray<HTMLElement>(".phuc-showcase-project");
      projectEls.forEach((proj) => {
        const bg = proj.querySelector(".phuc-proj-bg-layer");
        const num = proj.querySelector(".phuc-proj-fg-num");

        if (bg) {
          gsap.to(bg, {
            x: -40,
            ease: "none",
            scrollTrigger: {
              trigger: proj,
              containerAnimation: horizontalTween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          });
        }

        if (num) {
          gsap.to(num, {
            x: 60,
            ease: "none",
            scrollTrigger: {
              trigger: proj,
              containerAnimation: horizontalTween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          });
        }
      });
    },
    { scope: sectionRef }
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (y / rect.height) * -1.6;
    const rotY = (x / rect.width) * 2.4;

    gsap.to(card, {
      rotateX: rotX,
      rotateY: rotY,
      x: x * 0.05,
      y: y * 0.05,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setGlobalCursor({ active: false });
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  return (
    <section ref={sectionRef} className="phuc-showcase-wrapper" aria-label="Featured Projects Showcase">
      <div ref={trackRef} className="phuc-showcase-track">
        {/* Track Intro Panel */}
        <div className="phuc-showcase-intro-card">
          <span className="phuc-tag">KHÔNG GIAN LƯU TRỮ NỔI BẬT</span>
          <h2>NHỮNG HÀNH TRÌNH TÌM KIẾM & CHUYỂN ĐỔI.</h2>
          <p>Cuộn xuống để khám phá các case study nổi bật theo chiều ngang.</p>
        </div>

        {/* Featured Projects List */}
        {FEATURED_PROJECTS.map((project: Project, idx: number) => {
          const isActive = activeIndex === idx;
          const layoutClass = `phuc-showcase-project--layout-${idx + 1}`;

          return (
            <article
              key={project.slug}
              className={`phuc-showcase-project ${layoutClass} ${
                isActive ? "phuc-showcase-project--active" : ""
              }`}
            >
              <div className="phuc-proj-bg-layer" aria-hidden="true" />

              <Link
                href={`/portfolio/${project.slug}`}
                className="phuc-proj-content-layer"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setGlobalCursor({ active: true, text: "XEM CASE STUDY" })}
                onMouseLeave={handleMouseLeave}
              >
                <div className="phuc-proj-media-wrap">
                  <PortfolioMediaPlaceholder
                    variant={project.mediaVariant}
                    aspectRatio={project.aspectRatio}
                    index={project.index}
                    label={project.title}
                  />
                </div>

                <div className="phuc-proj-copy">
                  <div className="phuc-proj-header">
                    <span className="phuc-proj-index">{project.index}</span>
                    <span className="phuc-proj-cat">{project.category} · {project.year}</span>
                  </div>

                  <h3 className="phuc-proj-title">{project.title}</h3>
                  <p className="phuc-proj-summary">{project.summary}</p>

                  <div className="phuc-proj-metrics-row">
                    {project.metrics.map((m) => (
                      <div key={m.label} className="phuc-proj-metric">
                        <span className="phuc-metric-val">{m.value}</span>
                        <span className="phuc-metric-lbl">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>

              <div className="phuc-proj-fg-num" aria-hidden="true">
                {project.index}
              </div>
            </article>
          );
        })}

        {/* Track Exit Transition Card */}
        <div className="phuc-showcase-exit-card">
          <span className="phuc-tag">KẾT THÚC KHÔNG GIAN TRÌNH DIỄN</span>
          <h3>KHO LƯU TRỮ TOÀN BỘ PHÍA TRƯỚC</h3>
          <p>Đang trở lại luồng cuộn dọc của trang...</p>
        </div>
      </div>

      <div className="phuc-showcase-progress-bar">
        <span className="phuc-progress-step">01</span>
        <div className="phuc-progress-track">
          <div ref={progressDotRef} className="phuc-progress-dot" />
        </div>
        <span className="phuc-progress-step">03</span>
        <span className="phuc-progress-counter">0{activeIndex + 1} / 03</span>
      </div>
    </section>
  );
}
