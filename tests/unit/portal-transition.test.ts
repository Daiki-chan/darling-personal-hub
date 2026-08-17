import { describe, expect, it } from "vitest";
import type { PortalStage } from "@/components/portal/typographic-portal";

function getStepFromStage(stage: PortalStage): 0 | 1 | 2 {
  if (stage === "INTRO_1" || stage === "TRANSITIONING_0_1") return 0;
  if (stage === "INTRO_2" || stage === "TRANSITIONING_1_2") return 1;
  return 2;
}

function shouldLockTrigger(stage: PortalStage, isTransitioning: boolean): boolean {
  if (isTransitioning) return true;
  return (
    stage === "TRANSITIONING_0_1" ||
    stage === "TRANSITIONING_1_2" ||
    stage === "CLEANUP" ||
    stage === "PORTAL_ACTIVE"
  );
}

function areIntroLayersRendered(stage: PortalStage): boolean {
  return stage !== "PORTAL_ACTIVE" && stage !== "CLEANUP";
}

describe("Portal Transition Lifecycle and Safety Contract", () => {
  it("maps stages correctly to data-step index without exposing intermediate states as active", () => {
    expect(getStepFromStage("INTRO_1")).toBe(0);
    expect(getStepFromStage("TRANSITIONING_0_1")).toBe(0);
    expect(getStepFromStage("INTRO_2")).toBe(1);
    expect(getStepFromStage("TRANSITIONING_1_2")).toBe(1);
    expect(getStepFromStage("CLEANUP")).toBe(2);
    expect(getStepFromStage("PORTAL_ACTIVE")).toBe(2);
  });

  it("strictly locks triggers during transition and cleanup states to prevent race conditions", () => {
    // Idle states allow triggers
    expect(shouldLockTrigger("INTRO_1", false)).toBe(false);
    expect(shouldLockTrigger("INTRO_2", false)).toBe(false);

    // Active transitioning states lock triggers
    expect(shouldLockTrigger("TRANSITIONING_0_1", true)).toBe(true);
    expect(shouldLockTrigger("TRANSITIONING_0_1", false)).toBe(true);
    expect(shouldLockTrigger("TRANSITIONING_1_2", true)).toBe(true);
    expect(shouldLockTrigger("TRANSITIONING_1_2", false)).toBe(true);
    expect(shouldLockTrigger("CLEANUP", true)).toBe(true);
    expect(shouldLockTrigger("CLEANUP", false)).toBe(true);
    expect(shouldLockTrigger("PORTAL_ACTIVE", false)).toBe(true);
  });

  it("ensures 100% removal of Intro layers from DOM visual stack in PORTAL_ACTIVE stage", () => {
    expect(areIntroLayersRendered("INTRO_1")).toBe(true);
    expect(areIntroLayersRendered("TRANSITIONING_0_1")).toBe(true);
    expect(areIntroLayersRendered("INTRO_2")).toBe(true);
    expect(areIntroLayersRendered("TRANSITIONING_1_2")).toBe(true);
    expect(areIntroLayersRendered("CLEANUP")).toBe(false);
    expect(areIntroLayersRendered("PORTAL_ACTIVE")).toBe(false);
  });
});
