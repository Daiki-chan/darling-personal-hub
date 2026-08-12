"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FEATURED_PROJECTS, savePortfolioNavigationState, type Project } from "@/lib/portfolio-data";
import { PortfolioMediaPlaceholder } from "./portfolio-media-placeholder";
import { setGlobalCursor } from "./custom-cursor";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressDotRef = useRef<HTMLDivElement>(null);
  const progressCounterRef = useRef<HTMLSpanElement>(null);

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

      // 1. Primary ScrollTrigger: Pure Horizontal X Translation (Pinned & Vertically Stable)
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
            // Update progress dot position & counter (01/03, 02/03, 03/03)
            if (progressDotRef.current) {
              gsap.to(progressDotRef.current, {
                xPercent: self.progress * 200,
                duration: 0.1,
                overwrite: "auto",
              });
            }

            if (progressCounterRef.current) {
              const num = Math.min(3, Math.max(1, Math.ceil(self.progress * 3.2)));
              progressCounterRef.current.textContent = `0${num} / 03`;
            }
          },
        },
      });

      // 2. Project Active/Inactive Scale & Opacity via ContainerAnimation (Continuous 0-85% Horizontal Journey)
      const projectEls = gsap.utils.toArray<HTMLElement>(".phuc-showcase-project");
      projectEls.forEach((proj, idx) => {
        const bg = proj.querySelector(".phuc-proj-bg-layer");
        const num = proj.querySelector(".phuc-proj-fg-num");
        const body = proj.querySelector(".phuc-proj-summary");
        const metrics = proj.querySelector(".phuc-proj-metrics-row");
        const title = proj.querySelector(".phuc-proj-title");

        // Entrance: project approaches viewport center -> opacity 1, scale 1
        gsap.fromTo(
          proj,
          { opacity: 0.4, scale: 0.94 },
          {
            opacity: 1,
            scale: 1,
            ease: "power1.out",
            scrollTrigger: {
              trigger: proj,
              containerAnimation: horizontalTween,
              start: "left 85%",
              end: "center center",
              scrub: true,
            },
          }
        );

        // Exit phase for Projects 01 & 02: project leaves center -> opacity 0.4, scale 0.94
        if (idx < projectEls.length - 1) {
          gsap.fromTo(
            proj,
            { opacity: 1, scale: 1 },
            {
              opacity: 0.4,
              scale: 0.94,
              ease: "power1.in",
              scrollTrigger: {
                trigger: proj,
                containerAnimation: horizontalTween,
                start: "center center",
                end: "right 15%",
                scrub: true,
              },
            }
          );
        } else {
          // Phase B — 85-92%: Project 03 Outro (Local element fade, NO outer panel vertical translation!)
          if (body && metrics && title) {
            gsap.to(body, {
              opacity: 0.2,
              y: -12,
              ease: "power1.inOut",
              scrollTrigger: {
                trigger: proj,
                containerAnimation: horizontalTween,
                start: "center center",
                end: "right 35%",
                scrub: true,
              },
            });

            gsap.to(metrics, {
              opacity: 0.25,
              ease: "power1.inOut",
              scrollTrigger: {
                trigger: proj,
                containerAnimation: horizontalTween,
                start: "center center",
                end: "right 30%",
                scrub: true,
              },
            });

            gsap.to(title, {
              opacity: 0.4,
              y: -8,
              ease: "power1.inOut",
              scrollTrigger: {
                trigger: proj,
                containerAnimation: horizontalTween,
                start: "center center",
                end: "right 20%",
                scrub: true,
              },
            });
          }
        }

        // Small local X parallax for background and giant index number
        if (bg) {
          gsap.to(bg, {
            x: -30,
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
            x: 50,
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

  const handleProjectClick = () => {
    savePortfolioNavigationState();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (y / rect.height) * -1.4;
    const rotY = (x / rect.width) * 2.2;

    gsap.to(card, {
      rotateX: rotX,
      rotateY: rotY,
      x: x * 0.04,
      y: y * 0.04,
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
          <div className="phuc-intro-scroll-hint">
            <span className="phuc-hint-text-desktop">CUỘN ĐỂ DI CHUYỂN</span>
            <span className="phuc-hint-text-mobile">CUỘN ĐỂ KHÁM PHÁ</span>
            <span className="phuc-hint-arrow phuc-hint-arrow--desktop">→</span>
            <span className="phuc-hint-arrow phuc-hint-arrow--mobile">↓</span>
          </div>
        </div>

        {/* Featured Projects List */}
        {FEATURED_PROJECTS.map((project: Project, idx: number) => {
          const layoutClass = `phuc-showcase-project--layout-${idx + 1}`;

          return (
            <article key={project.slug} className={`phuc-showcase-project ${layoutClass}`}>
              <div className="phuc-proj-bg-layer" aria-hidden="true" />

              <Link
                href={`/portfolio/${project.slug}`}
                className="phuc-proj-content-layer"
                onClick={handleProjectClick}
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

        {/* Track Exit Transition Card - Secondary Bridge Cue */}
        <div className="phuc-showcase-exit-card">
          <span className="phuc-tag-sub">CHUYỂN TIẾP KHÔNG GIAN</span>
          <div className="phuc-exit-cue">
            <span>KHO LƯU TRỮ PHÍA TRƯỚC</span>
            <span className="arrow">↘</span>
          </div>
        </div>
      </div>

      {/* Showcase Progress Motif */}
      <div className="phuc-showcase-progress-bar">
        <span className="phuc-progress-step">01</span>
        <div className="phuc-progress-track">
          <div ref={progressDotRef} className="phuc-progress-dot" />
        </div>
        <span className="phuc-progress-step">03</span>
        <span ref={progressCounterRef} className="phuc-progress-counter">
          01 / 03
        </span>
      </div>
    </section>
  );
}
