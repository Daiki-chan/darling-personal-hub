import { describe, expect, it } from "vitest";
import type { PortalStage } from "@/components/portal/typographic-portal";

function getStepFromStage(stage: PortalStage): 0 | 1 | 2 {
  if (stage === "INTRO_1" || stage === "TRANSITIONING_0_1") return 0;
  if (stage === "INTRO_2" || stage === "EXITING_INTRO_2") return 1;
  return 2;
}

function shouldLockTrigger(stage: PortalStage, isTransitioning: boolean): boolean {
  if (isTransitioning) return true;
  return (
    stage === "TRANSITIONING_0_1" ||
    stage === "EXITING_INTRO_2" ||
    stage === "PORTAL_ACTIVE"
  );
}

function areIntroLayersRendered(stage: PortalStage): boolean {
  return stage !== "PORTAL_ACTIVE";
}

function isPortalRendered(stage: PortalStage): boolean {
  return stage === "PORTAL_ACTIVE";
}

describe("Portal Transition Lifecycle and Clean Scene Handoff", () => {
  it("maps stages correctly to data-step index without exposing intermediate states as active", () => {
    expect(getStepFromStage("INTRO_1")).toBe(0);
    expect(getStepFromStage("TRANSITIONING_0_1")).toBe(0);
    expect(getStepFromStage("INTRO_2")).toBe(1);
    expect(getStepFromStage("EXITING_INTRO_2")).toBe(1);
    expect(getStepFromStage("PORTAL_ACTIVE")).toBe(2);
  });

  it("strictly locks triggers during transition states to prevent race conditions", () => {
    // Idle states allow triggers
    expect(shouldLockTrigger("INTRO_1", false)).toBe(false);
    expect(shouldLockTrigger("INTRO_2", false)).toBe(false);

    // Active transitioning states lock triggers
    expect(shouldLockTrigger("TRANSITIONING_0_1", true)).toBe(true);
    expect(shouldLockTrigger("TRANSITIONING_0_1", false)).toBe(true);
    expect(shouldLockTrigger("EXITING_INTRO_2", true)).toBe(true);
    expect(shouldLockTrigger("EXITING_INTRO_2", false)).toBe(true);
    expect(shouldLockTrigger("PORTAL_ACTIVE", false)).toBe(true);
  });

  it("ensures zero visual overlap: Intro is unmounted when Portal is rendered", () => {
    // During Intro stages, Intro is rendered and Portal is NOT rendered
    expect(areIntroLayersRendered("INTRO_1")).toBe(true);
    expect(isPortalRendered("INTRO_1")).toBe(false);

    expect(areIntroLayersRendered("TRANSITIONING_0_1")).toBe(true);
    expect(isPortalRendered("TRANSITIONING_0_1")).toBe(false);

    expect(areIntroLayersRendered("INTRO_2")).toBe(true);
    expect(isPortalRendered("INTRO_2")).toBe(false);

    expect(areIntroLayersRendered("EXITING_INTRO_2")).toBe(true);
    expect(isPortalRendered("EXITING_INTRO_2")).toBe(false);

    // In PORTAL_ACTIVE, Intro is completely unmounted and Portal is rendered
    expect(areIntroLayersRendered("PORTAL_ACTIVE")).toBe(false);
    expect(isPortalRendered("PORTAL_ACTIVE")).toBe(true);
  });
});
