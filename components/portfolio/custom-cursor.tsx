"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { PortfolioMediaPlaceholder, type MediaVariant } from "./portfolio-media-placeholder";

export interface CursorState {
  active: boolean;
  text?: string;
  variant?: "badge" | "archive-preview";
  mediaVariant?: MediaVariant;
  title?: string;
  category?: string;
  year?: string;
}

const emptySubscribe = () => () => {};

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<CursorState>({ active: false });
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isTouchDevice = isClient
    ? window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window
    : false;

  useEffect(() => {
    if (!isClient || isTouchDevice) return;

    const el = cursorRef.current;
    if (!el) return;

    // Use GSAP quickTo for smooth 60fps inertia tracking
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const handleCursorChange = (e: CustomEvent<CursorState>) => {
      if (e.detail) {
        setCursorState(e.detail);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("phuc-cursor", handleCursorChange as EventListener);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("phuc-cursor", handleCursorChange as EventListener);
    };
  }, [isClient, isTouchDevice]);

  if (!isClient || isTouchDevice) return null;

  const isPreview = cursorState.variant === "archive-preview";
  const isBadge = cursorState.variant === "badge" || Boolean(cursorState.text);

  return (
    <div
      ref={cursorRef}
      className={`phuc-custom-cursor ${cursorState.active ? "phuc-custom-cursor--active" : ""} ${
        isPreview ? "phuc-custom-cursor--preview" : ""
      }`}
      aria-hidden="true"
    >
      {isBadge && <span className="phuc-cursor-label">{cursorState.text || "VIEW CASE"}</span>}

      {isPreview && cursorState.mediaVariant && (
        <div className="phuc-cursor-preview-card">
          <PortfolioMediaPlaceholder
            variant={cursorState.mediaVariant}
            aspectRatio="landscape"
            className="phuc-cursor-preview-media"
          />
          <div className="phuc-cursor-preview-meta">
            <span className="phuc-cursor-preview-title">{cursorState.title}</span>
            <span className="phuc-cursor-preview-cat">{cursorState.category} · {cursorState.year}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function to dispatch custom cursor events cleanly
export function setGlobalCursor(state: CursorState) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("phuc-cursor", { detail: state }));
}
