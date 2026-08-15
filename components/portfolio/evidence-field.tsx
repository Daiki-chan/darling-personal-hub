"use client";

import { memo } from "react";
import type { Project } from "@/lib/portfolio-data";

interface EvidenceFieldProps {
  activeProject?: Project | null;
  dormantLabel?: string;
  className?: string;
}

export const EvidenceField = memo(function EvidenceField({
  activeProject,
  dormantLabel = "WORK ARCHIVE",
  className = "",
}: EvidenceFieldProps) {
  const isDormant = !activeProject;
  const metrics = activeProject?.metrics || [];
  const primaryMetric = metrics[0];

  return (
    <div
      className={`phuc-evidence-field ${isDormant ? "phuc-evidence-field--dormant" : "phuc-evidence-field--active"} ${className}`}
      aria-label="Khung bằng chứng hiệu suất dự án"
    >
      {/* Structural Top Hairline (Open Field, No 4-Sided Frame) */}
      <div className="phuc-evidence-top-hairline" aria-hidden="true" />

      {/* Header Metadata Strip */}
      <div className="phuc-evidence-header">
        <div className="phuc-evidence-tag-group">
          <span className="phuc-evidence-anchor">EVIDENCE</span>
          <span className="phuc-evidence-slash">/</span>
          <span className="phuc-evidence-index">
            {isDormant ? "00" : String(activeProject.index).padStart(2, "0")}
          </span>
        </div>
        <span className="phuc-evidence-demo-badge">PROJECT SAMPLE DATA</span>
      </div>

      {/* Center Dominant Typographic Sculpture (No Cards, Pure Space) */}
      <div className="phuc-evidence-sculpture">
        {isDormant ? (
          <div className="phuc-evidence-dormant-state">
            <span className="phuc-evidence-dormant-title">{dormantLabel}</span>
            <span className="phuc-evidence-dormant-sub">SEO / CONTENT / PERFORMANCE</span>
          </div>
        ) : (
          <div className="phuc-evidence-active-state">
            {primaryMetric && (
              <div className="phuc-evidence-kpi-block">
                <span className="phuc-evidence-kpi-val">{primaryMetric.value}</span>
                <span className="phuc-evidence-kpi-lbl">{primaryMetric.label}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Title & Practice Bar */}
      <div className="phuc-evidence-footer">
        <span className="phuc-evidence-footer-title">
          {isDormant ? "FUJIWARA DAIKI · 2026" : `${activeProject.title.toUpperCase()} · ${activeProject.year}`}
        </span>
        <span className="phuc-evidence-footer-cat">
          {isDormant ? "PORTFOLIO / 03" : activeProject.category}
        </span>
      </div>
    </div>
  );
});
