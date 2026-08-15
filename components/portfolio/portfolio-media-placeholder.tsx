import { memo } from "react";

export type MediaVariant = "search" | "content" | "analytics" | "technical" | "local" | "growth";

interface PortfolioMediaPlaceholderProps {
  variant: MediaVariant;
  index?: string;
  label?: string;
  className?: string;
  aspectRatio?: "portrait" | "landscape" | "wide" | "square";
}

export const PortfolioMediaPlaceholder = memo(function PortfolioMediaPlaceholder({
  variant,
  index,
  label,
  className = "",
  aspectRatio = "landscape",
}: PortfolioMediaPlaceholderProps) {
  return (
    <div
      className={`phuc-placeholder phuc-placeholder--${variant} phuc-placeholder--${aspectRatio} ${className}`}
      role="img"
      aria-label={label || `Editorial ${variant} visual cut`}
    >
      <div className="phuc-placeholder__canvas">
        {/* Subtle Architectural Corner Registration Marks */}
        <div className="phuc-media-reg phuc-media-reg--tl" aria-hidden="true" />
        <div className="phuc-media-reg phuc-media-reg--tr" aria-hidden="true" />
        <div className="phuc-media-reg phuc-media-reg--bl" aria-hidden="true" />
        <div className="phuc-media-reg phuc-media-reg--br" aria-hidden="true" />

        {/* VARIANT 01: SEARCH & ORGANIC GROWTH */}
        {variant === "search" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--search">
            {/* Background Cropped Kinetic Typography */}
            <span className="phuc-media-bg-type" aria-hidden="true">
              SEARCH
            </span>

            <div className="phuc-editorial-graphic phuc-editorial-graphic--search">
              {/* Header Telemetry Bar */}
              <div className="phuc-edit-top-bar">
                <span className="phuc-edit-badge">INDEXED / LIVE</span>
                <span className="phuc-edit-query">site:growth-system/search-intent</span>
              </div>

              {/* Central Typographic Architecture */}
              <div className="phuc-edit-body-block">
                <span className="phuc-edit-micro-tag">01 / ARCHITECTURE</span>
                <h4 className="phuc-edit-main-title">ORGANIC SEARCH SYSTEM</h4>
              </div>

              {/* Data & KPI Strip */}
              <div className="phuc-edit-kpi-strip">
                <div className="phuc-edit-kpi-item">
                  <span className="val">+148%</span>
                  <span className="lbl">CLICKS SURGE</span>
                </div>
                <div className="phuc-edit-kpi-divider" />
                <div className="phuc-edit-kpi-item">
                  <span className="val">32</span>
                  <span className="lbl">TOP 10 KEYWORDS</span>
                </div>
                <div className="phuc-edit-kpi-divider" />
                <div className="phuc-edit-kpi-item">
                  <span className="val">#1</span>
                  <span className="lbl">POSITION CAPTURED</span>
                </div>
              </div>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {/* VARIANT 02: CONTENT CLUSTER & TOPIC GRAPH */}
        {variant === "content" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--content">
            <span className="phuc-media-bg-type" aria-hidden="true">
              CLUSTER
            </span>

            <div className="phuc-editorial-graphic phuc-editorial-graphic--content">
              {/* Top Pillar Header */}
              <div className="phuc-edit-tree-pillar">
                <span className="tag">PILLAR HUB / CORE PROTOCOL</span>
                <span className="meta">100K VOLUME TARGET</span>
              </div>

              {/* Staggered Spatial Spoke Branches */}
              <div className="phuc-edit-tree-branches">
                <div className="phuc-edit-branch-row">
                  <span className="num">01</span>
                  <span className="line">────────</span>
                  <span className="title">INTENT MATRIX (8 SUBCATEGORIES)</span>
                </div>
                <div className="phuc-edit-branch-row phuc-edit-branch-row--highlight">
                  <span className="num">02</span>
                  <span className="line">──────────────</span>
                  <span className="title">TOPIC SPOKES (24 ARTICLES · +190%)</span>
                </div>
                <div className="phuc-edit-branch-row">
                  <span className="num">03</span>
                  <span className="line">────────────────────</span>
                  <span className="title">INTERNAL LINK WEAVE (3.4X DEPTH)</span>
                </div>
              </div>

              {/* Bottom Metadata */}
              <div className="phuc-edit-cluster-footer">
                <span>HIGH-DENSITY TOPIC GRAPH</span>
                <span>VERIFIED RELEVANCE</span>
              </div>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {/* VARIANT 03: ANALYTICS & CONVERSION FUNNEL (CINEMATIC SPREAD 03 MEDIA) */}
        {variant === "analytics" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--analytics">
            <span className="phuc-media-bg-type" aria-hidden="true">
              FUNNEL
            </span>

            <div className="phuc-editorial-graphic phuc-editorial-graphic--analytics">
              {/* 3-Step Cinematic Conversion Stage Cards */}
              <div className="phuc-funnel-stages-row">
                <div className="phuc-funnel-card">
                  <div className="phuc-funnel-card-head">
                    <span className="idx">01</span>
                    <span className="stage">DISCOVERY</span>
                  </div>
                  <div className="phuc-funnel-card-val">100%</div>
                  <div className="phuc-funnel-card-lbl">INTENT SESSIONS</div>
                  <div className="phuc-funnel-bar-rail">
                    <div className="phuc-funnel-bar-fill" style={{ width: "100%" }} />
                  </div>
                </div>

                <div className="phuc-funnel-arrow">───→</div>

                <div className="phuc-funnel-card phuc-funnel-card--surge">
                  <div className="phuc-funnel-card-head">
                    <span className="idx">02</span>
                    <span className="stage">LANDING</span>
                  </div>
                  <div className="phuc-funnel-card-val">+41%</div>
                  <div className="phuc-funnel-card-lbl">CLICK-THROUGH RATE</div>
                  <div className="phuc-funnel-bar-rail">
                    <div className="phuc-funnel-bar-fill" style={{ width: "75%" }} />
                  </div>
                </div>

                <div className="phuc-funnel-arrow">───→</div>

                <div className="phuc-funnel-card phuc-funnel-card--active">
                  <div className="phuc-funnel-card-head">
                    <span className="idx">03</span>
                    <span className="stage">ACTION</span>
                  </div>
                  <div className="phuc-funnel-card-val">+28%</div>
                  <div className="phuc-funnel-card-lbl">CONVERSION ACCELERATION</div>
                  <div className="phuc-funnel-bar-rail">
                    <div className="phuc-funnel-bar-fill phuc-funnel-bar-fill--white" style={{ width: "90%" }} />
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Baseline */}
              <div className="phuc-funnel-telemetry">
                <span>INTENT-TO-CONVERSION CONTINUOUS FLOW</span>
                <span>REAL-TIME GA4 TELEMETRY</span>
              </div>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {/* VARIANT 04: TECHNICAL SEO */}
        {variant === "technical" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--technical">
            <span className="phuc-media-bg-type" aria-hidden="true">
              SYSTEM
            </span>

            <div className="phuc-editorial-graphic phuc-editorial-graphic--technical">
              <div className="phuc-edit-code-head">
                <span className="badge">HTTP/2 200 OK</span>
                <span className="meta">10,000+ URLS AUDITED</span>
              </div>
              <div className="phuc-edit-code-body">
                <div className="code-line">
                  <span className="key">TTFB:</span> <span className="val">0.08s (EXCELLENT)</span>
                </div>
                <div className="code-line">
                  <span className="key">CANONICAL:</span> <span className="val">100% MATCHED</span>
                </div>
                <div className="code-line">
                  <span className="key">SCHEMA:</span> <span className="val">STRUCTURED GRAPH VALID</span>
                </div>
              </div>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {/* VARIANT 05: LOCAL SEO */}
        {variant === "local" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--local">
            <span className="phuc-media-bg-type" aria-hidden="true">
              MAP
            </span>

            <div className="phuc-editorial-graphic phuc-editorial-graphic--local">
              <div className="phuc-edit-map-head">
                <span>LOCAL SEO & GEO VISIBILITY</span>
              </div>
              <div className="phuc-edit-map-metrics">
                <div className="map-stat">
                  <span className="num">+115%</span>
                  <span className="lbl">SEARCH IMPRESSIONS</span>
                </div>
                <div className="map-stat">
                  <span className="num">+64%</span>
                  <span className="lbl">DIRECTION REQUESTS</span>
                </div>
              </div>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {/* VARIANT 06: GROWTH & EXPERIMENT */}
        {variant === "growth" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--growth">
            <span className="phuc-media-bg-type" aria-hidden="true">
              SNIPPET
            </span>

            <div className="phuc-editorial-graphic phuc-editorial-graphic--growth">
              <div className="phuc-edit-growth-title">FEATURED SNIPPET CAPTURE</div>
              <div className="phuc-edit-growth-val">+38% CTR</div>
              <div className="phuc-edit-growth-meta">POSITION ZERO ACQUIRED</div>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {label && <div className="phuc-placeholder__caption">{label}</div>}
      </div>
    </div>
  );
});
