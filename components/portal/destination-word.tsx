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
        <span className="dest-word__glyphs">
          {characters.map((char, index) => (
            <span key={`${id}-${index}-${char}`} className="dest-glyph">
              {char}
            </span>
          ))}
        </span>
      </button>
    );
  }
);

