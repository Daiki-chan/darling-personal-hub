"use client";

import { memo, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface PortraitApertureProps {
  src?: string | null;
  alt?: string;
  objectPosition?: string;
  contrast?: number;
  brightness?: number;
  className?: string;
}

export const PortraitAperture = memo(function PortraitAperture({
  src,
  alt = "Phạm Hoàng Phúc — Professional Portrait",
  objectPosition = "center 30%",
  contrast = 1.05,
  brightness = 0.95,
  className = "",
}: PortraitApertureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      if (containerRef.current) {
        tl.fromTo(
          containerRef.current,
          { opacity: 0.7, y: 16 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
      }

      if (crosshairRef.current) {
        tl.fromTo(
          crosshairRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        );
      }
    },
    { scope: containerRef }
  );

  const imageFilter = `grayscale(1) contrast(${contrast}) brightness(${brightness})`;

  return (
    <div
      ref={containerRef}
      className={`phuc-portrait-aperture ${className}`}
      aria-label="Portrait Aperture"
    >
      {/* 4 Crisp Corner Registration Marks */}
      <div className="phuc-aperture-reg phuc-aperture-reg--tl" aria-hidden="true" />
      <div className="phuc-aperture-reg phuc-aperture-reg--tr" aria-hidden="true" />
      <div className="phuc-aperture-reg phuc-aperture-reg--bl" aria-hidden="true" />
      <div className="phuc-aperture-reg phuc-aperture-reg--br" aria-hidden="true" />

      {/* Main Aperture Canvas */}
      <div className="phuc-aperture-content">
        {src ? (
          /* Populated State — High-End Grayscale Photography */
          <div className="phuc-aperture-image-wrap">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 480px"
              className="phuc-aperture-image"
              style={{ objectPosition, filter: imageFilter }}
              priority={false}
            />
            <div className="phuc-aperture-vignette" aria-hidden="true" />
            <span className="phuc-aperture-meta phuc-aperture-meta--tag">PORTRAIT / 01</span>
          </div>
        ) : (
          /* Finished Empty State — High-End Intentional Photographic Void */
          <div className="phuc-aperture-void">
            {/* Header Data Bar */}
            <div className="phuc-aperture-void-header">
              <span className="phuc-aperture-meta phuc-aperture-meta--strong">PORTRAIT / 01</span>
              <span className="phuc-aperture-meta phuc-aperture-meta--dim">4:5 FRAME</span>
            </div>

            {/* Central Photographic Alignment Crosshair & Label */}
            <div ref={crosshairRef} className="phuc-aperture-void-center">
              <div className="phuc-aperture-crosshair" aria-hidden="true">
                <span className="crosshair-v" />
                <span className="crosshair-h" />
              </div>
              <span className="phuc-aperture-void-label">IDENTITY STUDY</span>
              <span className="phuc-aperture-void-sub">MONOCHROME ARCHIVE</span>
            </div>

            {/* Footer Metadata Bar */}
            <div className="phuc-aperture-void-footer">
              <span className="phuc-aperture-meta">FUJIWARA DAIKI</span>
              <span className="phuc-aperture-meta phuc-aperture-meta--strong">2026</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
