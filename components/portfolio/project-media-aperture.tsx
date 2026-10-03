import { memo } from "react";
import Image from "next/image";
import type { MediaVariant } from "@/lib/portfolio-data";

export type MediaAspect = "landscape" | "portrait" | "wide" | "square";

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
  variant = "system",
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
        /* Real Media Insertion with Grayscale Filter */
        <div className="phuc-aperture-media-container">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1100px"
            className="phuc-aperture-image"
            style={{
              objectPosition,
              filter: `grayscale(1) brightness(${brightness}) contrast(${contrast})`,
            }}
          />
          <div className="phuc-aperture-vignette" aria-hidden="true" />
        </div>
      ) : (
        /* Obsidian Technical Schematic Architecture */
        <div className="phuc-aperture-fallback">
          {/* VARIANT 01: SYSTEM / DARLING PERSONAL HUB TOPOLOGY */}
          {variant === "system" && (
            <div className="phuc-art-editorial phuc-art-editorial--system">
              <span className="phuc-art-bg-type" aria-hidden="true">
                SYSTEM
              </span>

              <div className="phuc-art-inner">
                {/* Header System Telemetry Bar */}
                <div className="phuc-art-bar">
                  <span className="phuc-art-badge">ARCHITECTURE // 01</span>
                  <span className="phuc-art-tag">darling-personal-hub / runtime-v2</span>
                </div>

                {/* Central Topological Node Network */}
                <div className="phuc-art-system-grid">
                  <div className="phuc-art-sys-node phuc-art-sys-node--core">
                    <span className="node-tag">CORE ENGINE</span>
                    <h4 className="node-title">NEXT.JS + VIEW TRANSITIONS</h4>
                    <span className="node-sub">ZERO RUNTIME REFLOWS</span>
                  </div>

                  <div className="phuc-art-sys-tree">
                    <div className="phuc-art-sys-spoke">
                      <span className="spoke-idx">01</span>
                      <span className="spoke-hairline">───</span>
                      <span className="spoke-name">PORTAL GATEWAY</span>
                    </div>
                    <div className="phuc-art-sys-spoke">
                      <span className="spoke-idx">02</span>
                      <span className="spoke-hairline">───</span>
                      <span className="spoke-name">ACOUSTIC ENGINE</span>
                    </div>
                    <div className="phuc-art-sys-spoke">
                      <span className="spoke-idx">03</span>
                      <span className="spoke-hairline">───</span>
                      <span className="spoke-name">MONOGRAPH ARCHIVE</span>
                    </div>
                  </div>
                </div>

                {/* Spatial 3-Column Performance Telemetry Strip */}
                <div className="phuc-art-kpi-row">
                  <div className="phuc-art-kpi-col">
                    <span className="val">0.08s</span>
                    <span className="lbl">TTFB LATENCY</span>
                  </div>
                  <div className="phuc-art-kpi-hairline" />
                  <div className="phuc-art-kpi-col">
                    <span className="val">100/100</span>
                    <span className="lbl">LIGHTHOUSE</span>
                  </div>
                  <div className="phuc-art-kpi-hairline" />
                  <div className="phuc-art-kpi-col">
                    <span className="val">60 FPS</span>
                    <span className="lbl">GPU COMPOSITOR</span>
                  </div>
                </div>
              </div>
              {index && <span className="phuc-art-ghost-index">{index}</span>}
            </div>
          )}

          {/* VARIANT 02: SEARCH GROWTH EDITORIAL CUT */}
          {variant === "search" && (
            <div className="phuc-art-editorial phuc-art-editorial--search">
              <span className="phuc-art-bg-type" aria-hidden="true">
                SEARCH
              </span>

              <div className="phuc-art-inner">
                {/* Header Intent Telemetry */}
                <div className="phuc-art-bar">
                  <span className="phuc-art-badge">INDEXED // PROTOCOL 02</span>
                  <span className="phuc-art-tag">site:growth-system / high-intent</span>
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
                    <span className="val">02</span>
                    <span className="lbl">SERP AUTHORITY</span>
                  </div>
                </div>
              </div>
              {index && <span className="phuc-art-ghost-index">{index}</span>}
            </div>
          )}

          {/* VARIANT 03: CONTENT CLUSTER EDITORIAL DIAGRAM */}
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

          {/* VARIANT 04: WIDE CINEMATIC CONVERSION FUNNEL */}
          {variant === "analytics" && (
            <div className="phuc-art-editorial phuc-art-editorial--analytics">
              <span className="phuc-art-bg-type" aria-hidden="true">
                FUNNEL
              </span>

              <div className="phuc-art-inner">
                {/* High-Authority 3-Stage Horizontal Funnel */}
                <div className="phuc-art-funnel-grid">
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

          {/* VARIANT 05: TECHNICAL SEO */}
          {variant === "technical" && (
            <div className="phuc-art-editorial phuc-art-editorial--technical">
              <span className="phuc-art-bg-type" aria-hidden="true">
                SYSTEM
              </span>
              <div className="phuc-art-inner">
                <div className="phuc-art-bar">
                  <span className="phuc-art-badge">HTTP/2 200 OK</span>
                  <span className="phuc-art-tag">10,000+ URLS AUDITED</span>
                </div>
                <div className="phuc-art-center">
                  <div className="phuc-art-line-group">
                    <div className="phuc-art-structural-line" />
                    <div className="phuc-art-title-box">
                      <span className="sub">CRAWL BUDGET & ARCHITECTURE</span>
                      <h4 className="title">CANONICALIZATION GRAPH</h4>
                    </div>
                  </div>
                </div>
                <div className="phuc-art-kpi-row">
                  <div className="phuc-art-kpi-col">
                    <span className="val">-45%</span>
                    <span className="lbl">CRAWL ERRORS</span>
                  </div>
                  <div className="phuc-art-kpi-hairline" />
                  <div className="phuc-art-kpi-col">
                    <span className="val">+80%</span>
                    <span className="lbl">INDEX RATE</span>
                  </div>
                  <div className="phuc-art-kpi-hairline" />
                  <div className="phuc-art-kpi-col">
                    <span className="val">100%</span>
                    <span className="lbl">CANONICAL MATCH</span>
                  </div>
                </div>
              </div>
              {index && <span className="phuc-art-ghost-index">{index}</span>}
            </div>
          )}

          {/* VARIANT 06: LOCAL SEO */}
          {variant === "local" && (
            <div className="phuc-art-editorial phuc-art-editorial--local">
              <span className="phuc-art-bg-type" aria-hidden="true">
                MAP
              </span>
              <div className="phuc-art-inner">
                <div className="phuc-art-bar">
                  <span className="phuc-art-badge">LOCAL GEO MATRIX</span>
                  <span className="phuc-art-tag">GOOGLE BUSINESS PROFILE</span>
                </div>
                <div className="phuc-art-center">
                  <div className="phuc-art-title-box">
                    <span className="sub">MULTI-LOCATION DISCOVERY</span>
                    <h4 className="title">MAP PACK VISIBILITY</h4>
                  </div>
                </div>
                <div className="phuc-art-kpi-row">
                  <div className="phuc-art-kpi-col">
                    <span className="val">+115%</span>
                    <span className="lbl">MAP IMPRESSIONS</span>
                  </div>
                  <div className="phuc-art-kpi-hairline" />
                  <div className="phuc-art-kpi-col">
                    <span className="val">+64%</span>
                    <span className="lbl">DIRECTIONS</span>
                  </div>
                </div>
              </div>
              {index && <span className="phuc-art-ghost-index">{index}</span>}
            </div>
          )}

          {/* VARIANT 07: GROWTH & SNIPPET */}
          {variant === "growth" && (
            <div className="phuc-art-editorial phuc-art-editorial--growth">
              <span className="phuc-art-bg-type" aria-hidden="true">
                SNIPPET
              </span>
              <div className="phuc-art-inner">
                <div className="phuc-art-bar">
                  <span className="phuc-art-badge">SERP POSITION ZERO</span>
                  <span className="phuc-art-tag">FEATURED SNIPPET</span>
                </div>
                <div className="phuc-art-center">
                  <div className="phuc-art-title-box">
                    <span className="sub">CONTENT REFRESH & SPRINT</span>
                    <h4 className="title">HIGH-INTENT CTR RECOVERY</h4>
                  </div>
                </div>
                <div className="phuc-art-kpi-row">
                  <div className="phuc-art-kpi-col">
                    <span className="val">14</span>
                    <span className="lbl">SNIPPETS WON</span>
                  </div>
                  <div className="phuc-art-kpi-hairline" />
                  <div className="phuc-art-kpi-col">
                    <span className="val">+38%</span>
                    <span className="lbl">CTR SURGE</span>
                  </div>
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
