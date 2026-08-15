export const MOTION_DURATION = {
  quick: 0.16,
  exit: 0.22,
  enter: 0.44,
  section: 0.62,
  hero: 0.86,
} as const;

export const MOTION_DISTANCE = {
  micro: 8,
  section: 24,
  hero: 36,
} as const;

export const MOTION_STAGGER = {
  tight: 0.05,
  standard: 0.07,
  expressive: 0.12,
} as const;

export const MOTION_EASE = {
  css: [0.16, 1, 0.3, 1] as const,
  gsap: "power3.out",
  gsapInOut: "power2.inOut",
} as const;

export type MotionProfile = {
  enabled: boolean;
  distance: number;
  duration: number;
  pin: boolean;
  scrub: boolean;
  ticker: boolean;
};

export function getMotionProfile(reducedMotion: boolean): MotionProfile {
  if (reducedMotion) {
    return {
      enabled: false,
      distance: 0,
      duration: 0,
      pin: false,
      scrub: false,
      ticker: false,
    };
  }

  return {
    enabled: true,
    distance: MOTION_DISTANCE.section,
    duration: MOTION_DURATION.section,
    pin: true,
    scrub: true,
    ticker: true,
  };
}
