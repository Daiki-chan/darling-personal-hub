import { memo } from "react";
import Image from "next/image";

export type MediaAspect = "landscape" | "portrait" | "wide" | "square";
export type MediaVariant = "search" | "content" | "analytics" | "technical" | "local" | "growth";

export interface ProjectMediaApertureProps {
  src?: string;
  alt?: string;
  aspect?: MediaAspect;
  objectPosition?: string;
  brightness?: number;
  contrast?: number;
  variant?: MediaVariant;
  index?: string;
  className?: string;
}

export const ProjectMediaAperture = memo(function ProjectMediaAperture({
  src,
  alt = "Project media visual",
  aspect = "landscape",
  objectPosition = "center",
  brightness = 1,
  contrast = 1,
  variant = "search",
  index,
  className = "",
}: ProjectMediaApertureProps) {
  return (
    <div
      className={`phuc-media-aperture phuc-media-aperture--${aspect} ${className}`}
      data-variant={variant}
    >
      {/* 4 Crisp Corner Registration Marks */}
      <div className="phuc-aperture-reg phuc-aperture-reg--tl" aria-hidden="true" />
      <div className="phuc-aperture-reg phuc-aperture-reg--tr" aria-hidden="true" />
      <div className="phuc-aperture-reg phuc-aperture-reg--bl" aria-hidden="true" />
      <div className="phuc-aperture-reg phuc-aperture-reg--br" aria-hidden="true" />

      {src ? (
        /* Real Media Insertion with Guaranteed Strict Grayscale */
        <div className="phuc-aperture-media-container">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
            className="phuc-aperture-image"
            style={{
              objectPosition,
              filter: `grayscale(1) brightness(${brightness}) contrast(${contrast})`,
            }}
          />
          <div className="phuc-aperture-vignette" aria-hidden="true" />
        </div>
      ) : (
        /* High-End Monochrome Editorial Fallback Composition */
        <div className="phuc-aperture-fallback">
          {/* SPREAD 01: LANDSCAPE / SEARCH GROWTH EDITORIAL CUT */}
          {variant === "search" && (
            <div className="phuc-art-editorial phuc-art-editorial--search">
              <span className="phuc-art-bg-type" aria-hidden="true">
                SEARCH
              </span>

              <div className="phuc-art-inner">
                {/* Header Intent Telemetry */}
                <div className="phuc-art-bar">
                  <span className="phuc-art-badge">INDEXED / PROTOCOL 01</span>
                  <span className="phuc-art-tag">site:growth-system/high-intent</span>
                </div>

                {/* Main Graphic Architecture */}
                <div className="phuc-art-center">
                  <div className="phuc-art-line-group">
                    <div className="phuc-art-structural-line" />
                    <div className="phuc-art-title-box">
                      <span className="sub">SYSTEM ARCHITECTURE</span>
                      <h4 className="title">ORGANIC SEARCH PROTOCOL</h4>
                    </div>
                  </div>
                </div>

                {/* Spatial 3-Column Data Strip */}
                <div className="phuc-art-kpi-row">
                  <div className="phuc-art-kpi-col">
                    <span className="val">+148%</span>
                    <span className="lbl">CLICKS SURGE</span>
                  </div>
                  <div className="phuc-art-kpi-hairline" />
                  <div className="phuc-art-kpi-col">
                    <span className="val">32</span>
                    <span className="lbl">TOP 10 TARGETS</span>
                  </div>
                  <div className="phuc-art-kpi-hairline" />
                  <div className="phuc-art-kpi-col">
                    <span className="val">01</span>
                    <span className="lbl">SERP AUTHORITY</span>
                  </div>
                </div>
              </div>
              {index && <span className="phuc-art-ghost-index">{index}</span>}
            </div>
          )}

          {/* SPREAD 02: PORTRAIT / CONTENT CLUSTER EDITORIAL DIAGRAM */}
          {variant === "content" && (
            <div className="phuc-art-editorial phuc-art-editorial--content">
              <span className="phuc-art-bg-type" aria-hidden="true">
                CLUSTER
              </span>

              <div className="phuc-art-inner">
                {/* Pillar Core Block */}
                <div className="phuc-art-pillar-node">
                  <div className="phuc-art-pillar-header">
                    <span className="tag">CORE PILLAR</span>
                    <span className="metric">100K VOLUME TARGET</span>
                  </div>
                  <div className="phuc-art-pillar-title">CONTENT CLUSTER HUB</div>
                </div>

                {/* Spatial Editorial Diagram with White Hairlines */}
                <div className="phuc-art-diagram-tree">
                  <div className="phuc-art-diagram-node">
                    <span className="idx">01</span>
                    <span className="line">──────────────</span>
                    <span className="name">INTENT MATRIX</span>
                  </div>
                  <div className="phuc-art-diagram-node phuc-art-diagram-node--highlight">
                    <span className="idx">02</span>
                    <span className="line">──────────────────────</span>
                    <span className="name">TOPIC SPOKES (+190%)</span>
                  </div>
                  <div className="phuc-art-diagram-node">
                    <span className="idx">03</span>
                    <span className="line">────────────────────────────</span>
                    <span className="name">LINK WEAVE (3.4X)</span>
                  </div>
                </div>

                {/* Bottom Graph Verification */}
                <div className="phuc-art-footer-meta">
                  <span>SEMANTIC TOPIC AUTHORITY</span>
                  <span>24 VERIFIED NODES</span>
                </div>
              </div>
              {index && <span className="phuc-art-ghost-index">{index}</span>}
            </div>
          )}

          {/* SPREAD 03: WIDE CINEMATIC / CONVERSION FUNNEL EDITORIAL OBJECT */}
          {variant === "analytics" && (
            <div className="phuc-art-editorial phuc-art-editorial--analytics">
              <span className="phuc-art-bg-type" aria-hidden="true">
                FUNNEL
              </span>

              <div className="phuc-art-inner">
                {/* High-Authority 3-Stage Horizontal Cinematic Funnel */}
                <div className="phuc-art-funnel-grid">
                  {/* Stage 01 */}
                  <div className="phuc-art-funnel-card">
                    <div className="phuc-art-funnel-top">
                      <span className="idx">01</span>
                      <span className="stage">DISCOVERY</span>
                    </div>
                    <div className="phuc-art-funnel-val">100%</div>
                    <div className="phuc-art-funnel-lbl">INTENT SESSIONS</div>
                    <div className="phuc-art-funnel-rail">
                      <div className="phuc-art-funnel-fill" style={{ width: "100%" }} />
                    </div>
                  </div>

                  <div className="phuc-art-funnel-vector" aria-hidden="true">
                    ───→
                  </div>

                  {/* Stage 02 */}
                  <div className="phuc-art-funnel-card phuc-art-funnel-card--highlight">
                    <div className="phuc-art-funnel-top">
                      <span className="idx">02</span>
                      <span className="stage">LANDING</span>
                    </div>
                    <div className="phuc-art-funnel-val">+41%</div>
                    <div className="phuc-art-funnel-lbl">CTR ACCELERATION</div>
                    <div className="phuc-art-funnel-rail">
                      <div className="phuc-art-funnel-fill" style={{ width: "75%" }} />
                    </div>
                  </div>

                  <div className="phuc-art-funnel-vector" aria-hidden="true">
                    ───→
                  </div>

                  {/* Stage 03 */}
                  <div className="phuc-art-funnel-card phuc-art-funnel-card--active">
                    <div className="phuc-art-funnel-top">
                      <span className="idx">03</span>
                      <span className="stage">ACTION</span>
                    </div>
                    <div className="phuc-art-funnel-val">+28%</div>
                    <div className="phuc-art-funnel-lbl">CONVERSION VELOCITY</div>
                    <div className="phuc-art-funnel-rail">
                      <div className="phuc-art-funnel-fill phuc-art-funnel-fill--white" style={{ width: "92%" }} />
                    </div>
                  </div>
                </div>

                {/* Bottom Real-time Telemetry Strip */}
                <div className="phuc-art-footer-meta">
                  <span>CONTINUOUS USER JOURNEY FLOW</span>
                  <span>MEASURED GA4 TELEMETRY</span>
                </div>
              </div>
              {index && <span className="phuc-art-ghost-index">{index}</span>}
            </div>
          )}

          {/* FALLBACK FOR OTHER VARIANTS */}
          {variant !== "search" && variant !== "content" && variant !== "analytics" && (
            <div className="phuc-art-editorial phuc-art-editorial--generic">
              <span className="phuc-art-bg-type" aria-hidden="true">
                DATA
              </span>
              <div className="phuc-art-inner">
                <div className="phuc-art-bar">
                  <span className="phuc-art-badge">CASE EVIDENCE</span>
                  <span className="phuc-art-tag">VERIFIED STUDY</span>
                </div>
                <div className="phuc-art-center">
                  <h4 className="title">SYSTEM PERFORMANCE RECORD</h4>
                </div>
                <div className="phuc-art-footer-meta">
                  <span>PORTFOLIO EDITORIAL SPREAD</span>
                  <span>2026 ARCHIVE</span>
                </div>
              </div>
              {index && <span className="phuc-art-ghost-index">{index}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
