"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { MOTION_DISTANCE, MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from "@/lib/motion/tokens";

type SectionMotionOptions = {
  distance?: number;
  duration?: number;
  stagger?: number;
  start?: string;
};

export function useSectionMotion<T extends HTMLElement>({
  distance = MOTION_DISTANCE.section,
  duration = MOTION_DURATION.section,
  stagger = MOTION_STAGGER.standard,
  start = "top 82%",
}: SectionMotionOptions = {}) {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      if (!scope.current) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = gsap.utils.toArray<HTMLElement>("[data-motion-reveal]");
        if (targets.length === 0) return;

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: distance },
          {
            autoAlpha: 1,
            y: 0,
            duration,
            ease: MOTION_EASE.gsap,
            stagger,
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: scope.current,
              start,
              once: true,
            },
          }
        );
      });

      return () => media.revert();
    },
    { scope }
  );

  return scope;
}
