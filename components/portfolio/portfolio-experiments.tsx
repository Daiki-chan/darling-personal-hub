"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EXPERIMENTS_DATA } from "@/lib/portfolio-data";
import { useSectionMotion } from "@/components/motion/use-section-motion";

export const PortfolioExperiments = memo(function PortfolioExperiments() {
  const containerRef = useSectionMotion<HTMLElement>({ distance: 18, stagger: 0.08 });

  return (
    <section
      ref={containerRef}
      id="experiments"
      className="phuc-experiments section-shell section-space"
      aria-label="04 / EXPERIMENTS"
    >
      {/* Chapter 04 Header */}
      <div className="phuc-chapter-heading-strip" data-motion-reveal>
        <div className="phuc-chapter-heading-left">
          <span className="phuc-label">04 / EXPERIMENTS</span>
          <h2 className="phuc-exp-headline">
            CREATIVE SYSTEMS & PROTOTYPES
          </h2>
        </div>
        <div className="phuc-chapter-heading-right">
          <span className="phuc-chapter-meta">RESEARCH LAB // 04 LIVING ARTIFACTS</span>
        </div>
      </div>

      {/* 2x2 Bento Experiment Cards Grid */}
      <div className="phuc-experiments-grid" data-motion-reveal>
        {EXPERIMENTS_DATA.map((exp) => (
          <Link
            key={exp.index}
            href={exp.href}
            className="phuc-exp-card"
            aria-label={`Khám phá thử nghiệm: ${exp.title}`}
          >
            {/* Top Registration Marks */}
            <div className="phuc-exp-card-reg phuc-exp-card-reg--tl" aria-hidden="true" />
            <div className="phuc-exp-card-reg phuc-exp-card-reg--tr" aria-hidden="true" />

            <div className="phuc-exp-card-top">
              <div className="phuc-exp-idx-wrap">
                <span className="idx">{exp.index}</span>
                <span className="sep">{"//"}</span>
                <span className="tag">{exp.tag}</span>
              </div>

              <div className="phuc-exp-status-pill">
                <span className="dot" aria-hidden="true" />
                <span>{exp.status}</span>
              </div>
            </div>

            <div className="phuc-exp-body">
              <h3 className="phuc-exp-title">
                <span>{exp.title}</span>
                <ArrowUpRight size={18} strokeWidth={1.5} className="arrow" aria-hidden="true" />
              </h3>

              <p className="phuc-exp-desc">{exp.description}</p>
            </div>

            <div className="phuc-exp-footer">
              <div className="phuc-exp-tech-list">
                {exp.technologies.map((tech) => (
                  <span key={tech} className="phuc-exp-tech-pill">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
});
