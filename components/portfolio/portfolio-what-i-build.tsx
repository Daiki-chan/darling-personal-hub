"use client";

import { memo, type KeyboardEvent, useState, useRef } from "react";
import { WHAT_I_BUILD_DATA, APPROACH_STEPS } from "@/lib/portfolio-data";
import { useSectionMotion } from "@/components/motion/use-section-motion";

export const PortfolioWhatIBuild = memo(function PortfolioWhatIBuild() {
  const containerRef = useSectionMotion<HTMLElement>({ distance: 18, stagger: 0.08 });
  const [activeStepIdx, setActiveStepIdx] = useState<number>(2); // Default to 03 STRUCTURE
  const tabListRef = useRef<HTMLDivElement>(null);

  const currentStep = APPROACH_STEPS[activeStepIdx] || APPROACH_STEPS[2];

  const handleStepKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const last = APPROACH_STEPS.length - 1;
    let next = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % APPROACH_STEPS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + APPROACH_STEPS.length) % APPROACH_STEPS.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    } else {
      return;
    }

    event.preventDefault();
    setActiveStepIdx(next);

    const tabs = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[next]?.focus();
  };

  return (
    <section
      ref={containerRef}
      id="what-i-build"
      className="phuc-what-i-build section-shell section-space"
      aria-label="03 / WHAT I BUILD"
    >
      {/* Chapter 03 Header */}
      <div className="phuc-chapter-heading-strip" data-motion-reveal>
        <div className="phuc-chapter-heading-left">
          <span className="phuc-label">03 / WHAT I BUILD</span>
          <h2 className="phuc-what-headline">
            CAPABILITIES & SYSTEMS
          </h2>
        </div>
        <div className="phuc-chapter-heading-right">
          <span className="phuc-chapter-meta">DISCIPLINE MATRIX // 04 PILLARS</span>
        </div>
      </div>

      {/* 4 Architectural Domain Pillars Grid */}
      <div className="phuc-pillars-grid" data-motion-reveal>
        {WHAT_I_BUILD_DATA.map((pillar) => (
          <div key={pillar.index} className="phuc-pillar-card">
            <div className="phuc-pillar-top">
              <span className="phuc-pillar-idx">{pillar.index}</span>
              <span className="phuc-pillar-sub">{pillar.subtitle}</span>
            </div>

            <h3 className="phuc-pillar-title">{pillar.title}</h3>

            <p className="phuc-pillar-desc">{pillar.description}</p>

            <div className="phuc-pillar-divider" aria-hidden="true" />

            <ul className="phuc-pillar-list">
              {pillar.deliverables.map((item) => (
                <li key={item} className="phuc-pillar-item">
                  <span className="bullet" aria-hidden="true">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Systematic Execution Protocol Sub-section (Preserves #method and roving keyboard tabs for tests) */}
      <div id="method" className="phuc-method-protocol-block" data-motion-reveal>
        <div className="phuc-protocol-header">
          <div className="phuc-protocol-tag-group">
            <span className="tag">EXECUTION METHODOLOGY</span>
            <span className="sep">{"//"}</span>
            <span className="sub">SYSTEMATIC 5-STAGE PROTOCOL</span>
          </div>
          <span className="phuc-protocol-meta">KEYBOARD NAVIGABLE (ARROWS)</span>
        </div>

        {/* 5-Stage Interactive Tabs Grid */}
        <div
          ref={tabListRef}
          className="phuc-protocol-steps-grid"
          role="tablist"
          aria-label="Method Steps"
        >
          {APPROACH_STEPS.map((step, index) => {
            const isActive = activeStepIdx === index;

            return (
              <button
                key={step.idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                id={`method-tab-${step.idx}`}
                aria-controls="method-active-protocol"
                className={`phuc-protocol-tab ${isActive ? "phuc-protocol-tab--active" : ""}`}
                onClick={() => setActiveStepIdx(index)}
                tabIndex={isActive ? 0 : -1}
                onPointerEnter={() => setActiveStepIdx(index)}
                onKeyDown={(event) => handleStepKeyDown(event, index)}
                aria-label={`Bước ${step.idx}: ${step.name}`}
              >
                <div className="phuc-tab-top">
                  <span className="phuc-tab-idx">{step.idx}</span>
                  <span className="phuc-tab-sub">{step.sub}</span>
                </div>
                <h4 className="phuc-tab-name">{step.name}</h4>
                <div className="phuc-tab-indicator" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        {/* Dynamic 1-Sentence Active Protocol Descriptor Panel */}
        <div
          id="method-active-protocol"
          role="tabpanel"
          className="phuc-protocol-descriptor-panel"
        >
          <div className="phuc-protocol-panel-tag">ACTIVE PROTOCOL SPEC</div>
          <p className="phuc-protocol-descriptor-text">
            <span className="phuc-protocol-prefix">
              {currentStep.idx} / {currentStep.name} —{" "}
            </span>
            {currentStep.desc}
          </p>
        </div>
      </div>
    </section>
  );
});
