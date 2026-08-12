"use client";

import { forwardRef } from "react";

type IdentityAnchorProps = {
  activeDestination: "memories" | "music" | "work" | null;
  fontDirection?: "kinetic" | "grotesk";
};

export const IdentityAnchor = forwardRef<HTMLDivElement, IdentityAnchorProps>(
  function IdentityAnchor({ activeDestination, fontDirection = "kinetic" }, ref) {
    const isFocused = activeDestination !== null;

    return (
      <div
        ref={ref}
        className={`identity-anchor ${fontDirection === "kinetic" ? "identity-anchor--kinetic" : "identity-anchor--grotesk"}`}
        data-focused={isFocused}
        data-active-dest={activeDestination ?? "none"}
        aria-hidden="true"
      >
        <div className="identity-anchor__line identity-anchor__line--top">
          <span className="identity-glyph">F</span>
          <span className="identity-glyph">U</span>
          <span className="identity-glyph">J</span>
          <span className="identity-glyph">I</span>
          <span className="identity-glyph">W</span>
          <span className="identity-glyph">A</span>
          <span className="identity-glyph">R</span>
          <span className="identity-glyph">A</span>
        </div>
        <div className="identity-anchor__line identity-anchor__line--bottom">
          <span className="identity-glyph">D</span>
          <span className="identity-glyph">A</span>
          <span className="identity-glyph">I</span>
          <span className="identity-glyph">K</span>
          <span className="identity-glyph">I</span>
        </div>
      </div>
    );
  }
);
