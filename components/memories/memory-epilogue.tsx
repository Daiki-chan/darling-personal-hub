"use client";

import { memo } from "react";

import { useSectionMotion } from "@/components/motion/use-section-motion";
interface MemoryEpilogueProps {
  totalCount: number;
  gameCount: number;
  placeCount: number;
  onRandomRecall: () => void;
}

export const MemoryEpilogue = memo(function MemoryEpilogue({
  totalCount,
  gameCount,
  placeCount,
  onRandomRecall,
}: MemoryEpilogueProps) {
  const formattedTotal = String(totalCount).padStart(3, "0");
  const formattedGame = String(gameCount).padStart(3, "0");
  const formattedPlace = String(placeCount).padStart(3, "0");
  const isArchiveEmpty = totalCount === 0;
  const motionRef = useSectionMotion<HTMLDivElement>();

  return (
    <footer className="mem-epilogue section-shell" aria-label="Kết thúc kho lưu trữ">
      <div className="mem-epilogue__divider" aria-hidden="true" />
      
      <div ref={motionRef} className="mem-epilogue__panel">
        <div className="mem-epilogue__headline-group" data-motion-reveal>
          <span className="mem-epilogue__eyebrow">EPILOGUE</span>
          <h2 className="mem-epilogue__title">END OF ARCHIVE</h2>
        </div>

        <div className="mem-epilogue__data-grid" data-motion-reveal>
          <div className="mem-epilogue__data-item">
            <span className="mem-epilogue__data-label">01 / GAME</span>
            <span className="mem-epilogue__data-val">{formattedGame} FRAGMENTS</span>
          </div>

          <div className="mem-epilogue__data-item">
            <span className="mem-epilogue__data-label">02 / PLACE</span>
            <span className="mem-epilogue__data-val">{formattedPlace} FRAGMENTS</span>
          </div>

          <div className="mem-epilogue__data-item mem-epilogue__data-item--total">
            <span className="mem-epilogue__data-label">TOTAL ARCHIVE</span>
            <span className="mem-epilogue__data-val">{formattedTotal} FRAGMENTS RECORDED</span>
          </div>
        </div>

        <div className="mem-epilogue__action-row" data-motion-reveal>
          <button
            type="button"
            className={`mem-epilogue__shuffle-btn ${isArchiveEmpty ? "mem-epilogue__shuffle-btn--disabled" : ""}`}
            onClick={isArchiveEmpty ? undefined : onRandomRecall}
            disabled={isArchiveEmpty}
            aria-label={isArchiveEmpty ? "Chưa có ký ức để recall ngẫu nhiên" : "Kích hoạt Random Recall mở một ký ức ngẫu nhiên"}
          >
            <span className="mem-epilogue__shuffle-icon" aria-hidden="true">⟡</span>
            <span className="mem-epilogue__shuffle-text">{isArchiveEmpty ? "RECALL STANDBY" : "RANDOM RECALL"}</span>
            <span className="mem-epilogue__shuffle-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </footer>
  );
});
