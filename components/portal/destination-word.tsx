"use client";

import { forwardRef } from "react";

type DestinationWordProps = {
  id: "memories" | "music" | "work";
  label: string;
  href: string;
  isFocused: boolean;
  onHover: (id: "memories" | "music" | "work" | null) => void;
  onSelect: (href: string) => void;
  onPrefetch: (href: string) => void;
};

const TERRITORY_NUM: Record<string, string> = {
  memories: "01",
  music: "02",
  work: "03",
};

const TERRITORY_TAG: Record<string, string> = {
  memories: "VISUAL ARCHIVE",
  music: "ACOUSTIC CONSOLE",
  work: "SELECTED PRACTICE",
};

const TERRITORY_CATEGORY: Record<string, string> = {
  memories: "PHOTOGRAPHY / GAME / PLACE",
  music: "PLAYLISTS / DISCOVERY / LYRICS",
  work: "MONOGRAPH / PROJECTS / WORK",
};

const TERRITORY_SUB: Record<string, string> = {
  memories: "DARKROOM",
  music: "SANCTUARY",
  work: "MONOGRAPH",
};

export const DestinationWord = forwardRef<HTMLButtonElement, DestinationWordProps>(
  function DestinationWord(
    { id, label, href, isFocused, onHover, onSelect, onPrefetch },
    ref
  ) {
    const characters = label.split("");

    const handlePointerEnter = () => {
      onHover(id);
      onPrefetch(href);
    };

    const handlePointerLeave = () => {
      onHover(null);
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(href);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(href);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        className={`dest-word dest-word--${id}`}
        data-dest-id={id}
        data-focused={isFocused}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handlePointerEnter}
        onBlur={handlePointerLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Đi tới không gian ${label}`}
      >
        {/* Top micro-metadata: index + tag */}
        <div className="dest-word__header" aria-hidden="true">
          <span className="dest-word__num">{TERRITORY_NUM[id]}</span>
          <span className="dest-word__tag">{TERRITORY_TAG[id]}</span>
        </div>

        {/* Body: monumental title + hairline + category + subtitle */}
        <div className="dest-word__body">
          <span className="dest-word__glyphs">
            {characters.map((char, index) => (
              <span key={`${id}-${index}-${char}`} className="dest-glyph">
                {char}
              </span>
            ))}
          </span>

          {/* Thin hairline — revealed on hover for all territories */}
          <span className="dest-word__hairline" aria-hidden="true" />

          {/* Category navigation metadata */}
          <span className="dest-word__category" aria-hidden="true">
            {TERRITORY_CATEGORY[id]}
          </span>

          {/* Subtitle */}
          <span className="dest-word__sub" aria-hidden="true">
            {TERRITORY_TAG[id]} · {TERRITORY_SUB[id]}
          </span>
        </div>

        {/* Bottom decorative line */}
        <span className="dest-word__line" aria-hidden="true" />
      </button>
    );
  }
);
