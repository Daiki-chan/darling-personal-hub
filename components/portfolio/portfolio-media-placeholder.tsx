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
      aria-label={label || `Abstract ${variant} graphic placeholder`}
    >
      <div className="phuc-placeholder__canvas">
        {/* Subtle grid pattern background */}
        <div className="phuc-placeholder__grid" />

        {/* Variant Graphic Content */}
        {variant === "search" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--search">
            <div className="phuc-serp-box">
              <div className="phuc-serp-search-bar">
                <span className="phuc-serp-dot" />
                <span className="phuc-serp-query">site:growth-system/search-intent</span>
              </div>
              <div className="phuc-serp-result">
                <span className="phuc-serp-url">https://domain.com › search-growth</span>
                <span className="phuc-serp-title">Organic Search Growth Framework (Top 10)</span>
                <div className="phuc-serp-lines">
                  <span className="line line--80" />
                  <span className="line line--60" />
                </div>
              </div>
              <div className="phuc-serp-badge-row">
                <span className="phuc-badge">+148% Clicks</span>
                <span className="phuc-badge phuc-badge--violet">32 Top-10 Keywords</span>
              </div>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {variant === "content" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--content">
            <div className="phuc-cluster-tree">
              <div className="phuc-node phuc-node--pillar">
                <span>PILLAR HUB</span>
              </div>
              <div className="phuc-cluster-branches">
                <div className="phuc-branch-line line-left" />
                <div className="phuc-branch-line line-mid" />
                <div className="phuc-branch-line line-right" />
              </div>
              <div className="phuc-cluster-leaves">
                <div className="phuc-node phuc-node--leaf">ARTICLE 01</div>
                <div className="phuc-node phuc-node--leaf phuc-node--active">ARTICLE 02</div>
                <div className="phuc-node phuc-node--leaf">ARTICLE 03</div>
              </div>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {variant === "analytics" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--analytics">
            <div className="phuc-funnel-flow">
              <div className="phuc-funnel-step">
                <span className="phuc-funnel-tag">SEARCH INTENT</span>
                <div className="phuc-funnel-bar bar-100">100% VISITS</div>
              </div>
              <div className="phuc-funnel-arrow">↓</div>
              <div className="phuc-funnel-step">
                <span className="phuc-funnel-tag">LANDING PAGE</span>
                <div className="phuc-funnel-bar bar-70">+41% CTR</div>
              </div>
              <div className="phuc-funnel-arrow">↓</div>
              <div className="phuc-funnel-step phuc-funnel-step--goal">
                <span className="phuc-funnel-tag">ACTION / CONVERSION</span>
                <div className="phuc-funnel-bar bar-40">+28% CONV</div>
              </div>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {variant === "technical" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--technical">
            <div className="phuc-crawl-matrix">
              <div className="phuc-crawl-status">
                <span className="status-pill status-pill--200">200 OK</span>
                <span className="status-pill status-pill--301">301 REDIRECT</span>
                <span className="status-pill status-pill--index">INDEXED</span>
              </div>
              <div className="phuc-crawl-nodes">
                <span className="crawl-node" />
                <span className="crawl-line" />
                <span className="crawl-node crawl-node--pulse" />
                <span className="crawl-line" />
                <span className="crawl-node" />
              </div>
              <span className="phuc-crawl-code">Sitemap: 10,000+ endpoints verified</span>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {variant === "local" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--local">
            <div className="phuc-local-grid">
              <div className="phuc-map-pin-badge">
                <span className="pin-icon">📍</span>
                <span>MAP PACK #1</span>
              </div>
              <div className="phuc-geo-metrics">
                <div className="geo-metric-box">
                  <span className="geo-val">+115%</span>
                  <span className="geo-lbl">Local Impressions</span>
                </div>
                <div className="geo-metric-box">
                  <span className="geo-val">+64%</span>
                  <span className="geo-lbl">Map Directions</span>
                </div>
              </div>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {variant === "growth" && (
          <div className="phuc-placeholder__art phuc-placeholder__art--growth">
            <div className="phuc-growth-matrix">
              <div className="growth-sparkline">
                <svg viewBox="0 0 200 60" fill="none" className="spark-svg">
                  <path
                    d="M 10 50 Q 50 45, 90 25 T 190 8"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle cx="190" cy="8" r="4" fill="#a855f7" />
                </svg>
              </div>
              <div className="growth-labels">
                <span className="growth-stat">FEATURED SNIPPET CAPTURED</span>
                <span className="growth-num">+38% CTR</span>
              </div>
            </div>
            {index && <span className="phuc-placeholder__giant-num">{index}</span>}
          </div>
        )}

        {label && <div className="phuc-placeholder__caption">{label}</div>}
      </div>
    </div>
  );
});
