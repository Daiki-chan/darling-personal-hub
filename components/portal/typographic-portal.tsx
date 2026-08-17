"use client";

import { gsap } from "gsap";
import { useReducedMotion } from "framer-motion";
import { Sora, Zen_Kaku_Gothic_New } from "next/font/google";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { consumeInitialDocumentVisit } from "@/lib/document-visit";
import { DestinationWord } from "./destination-word";
import { GlyphWindow } from "./glyph-window";
import { IdentityAnchor } from "./identity-anchor";
import { MobileChapters } from "./mobile-chapters";

// Module-level scoped Japanese font loader
const zenKakuGothic = Zen_Kaku_Gothic_New({
  weight: ["700", "900"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-zen-gothic",
  preload: false,
});

const portalDisplayFont = Sora({
  weight: "800",
  display: "swap",
  subsets: ["latin"],
  variable: "--font-portal-display",
  preload: false,
});

const DESTINATIONS = [
  { id: "memories" as const, label: "MEMORIES", href: "/memories" },
  { id: "music" as const, label: "MUSIC", href: "/music" },
  { id: "work" as const, label: "PORTFOLIO", href: "/portfolio" },
];

export type PortalStage =
  | "INTRO_1"
  | "TRANSITIONING_0_1"
  | "INTRO_2"
  | "EXITING_INTRO_2"
  | "PORTAL_ACTIVE";

export const TypographicPortal = memo(function TypographicPortal() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const identityRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const destRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const intro01Ref = useRef<HTMLDivElement>(null);
  const intro02StageRef = useRef<HTMLDivElement>(null);
  const intro02Ref = useRef<HTMLDivElement>(null);
  const slitMaskRef = useRef<HTMLDivElement>(null);
  const portalDesktopRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<PortalStage>("INTRO_1");
  const [isRouteReady, setIsRouteReady] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeDestination, setActiveDestination] = useState<"memories" | "music" | "work" | null>(null);
  const [fontDirection] = useState<"kinetic" | "grotesk">("kinetic");

  const isTransitioningRef = useRef(false);
  const isMountedRef = useRef(true);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const navigationTimerRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  // Map lifecycle stage to step index (0 | 1 | 2) for CSS attribute contract
  const stepIndex: 0 | 1 | 2 =
    stage === "INTRO_1" || stage === "TRANSITIONING_0_1"
      ? 0
      : stage === "INTRO_2" || stage === "EXITING_INTRO_2"
        ? 1
        : 2;

  // Cleanup helper to kill running timelines
  const killActiveTimeline = useCallback(() => {
    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
      activeTimelineRef.current = null;
    }
  }, []);

  // Initial Document Visit Hydration & Hash Check
  useEffect(() => {
    isMountedRef.current = true;
    const isInitialVisit = consumeInitialDocumentVisit();
    if (isInitialVisit) {
      if (window.location.hash) {
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}`
        );
      }
      setStage("INTRO_1");
    } else if (window.location.hash === "#portals") {
      setStage("PORTAL_ACTIVE");
    } else {
      setStage("INTRO_1");
    }
    setIsRouteReady(true);

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Hashchange listener to support back navigation and deep-links
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#portals") {
        killActiveTimeline();
        isTransitioningRef.current = false;
        setStage("PORTAL_ACTIVE");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [killActiveTimeline]);

  // Warm the Japanese face without letting network timing control the handoff timeline.
  useEffect(() => {
    if (typeof document !== "undefined" && "fonts" in document) {
      void document.fonts
        .load(`900 1em ${zenKakuGothic.style.fontFamily}`, "私の人生へようこそ")
        .catch(() => undefined);
    }
  }, []);

  // Prefetch target routes
  useEffect(() => {
    router.prefetch("/memories");
    router.prefetch("/music");
    router.prefetch("/portfolio");
  }, [router]);

  // Clean up timers & GSAP timelines on unmount
  useEffect(() => {
    return () => {
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current);
      }
      killActiveTimeline();
    };
  }, [killActiveTimeline]);

  // Safe Failsafe Navigation Function for Destination Clicks (Decoupled from Intro)
  const navigateWithFailsafe = useCallback(
    (targetHref: string) => {
      if (isLeaving) return;
      setIsLeaving(true);

      router.prefetch(targetHref);
      const maxWaitTimeout = reduceMotion ? 50 : 800;

      navigationTimerRef.current = window.setTimeout(() => {
        router.push(targetHref);
      }, maxWaitTimeout);
    },
    [isLeaving, reduceMotion, router]
  );

  // Controlled Step Advancement with Atomic Lock & Sequential Handoff
  const advanceStep = useCallback(() => {
    // Strict Guard:
    // Ignore if route not ready, leaving, or transition is already running
    if (!isRouteReady || isLeaving || isTransitioningRef.current) return;
    if (
      stage === "TRANSITIONING_0_1" ||
      stage === "EXITING_INTRO_2" ||
      stage === "PORTAL_ACTIVE"
    ) {
      return;
    }

    if (stage === "INTRO_1") {
      isTransitioningRef.current = true;
      setStage("TRANSITIONING_0_1");

      if (reduceMotion) {
        setStage("INTRO_2");
        isTransitioningRef.current = false;
        return;
      }

      // CLICK 01 MASTER TIMELINE: centered aperture and deliberate language handoff (~1s)
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          if (!isMountedRef.current) return;
          isTransitioningRef.current = false;
          setStage("INTRO_2");
        },
      });
      activeTimelineRef.current = tl;

      if (intro01Ref.current && intro02Ref.current && slitMaskRef.current) {
        const partLeft = intro01Ref.current.querySelector(".typo-latin-part--left");
        const partRight = intro01Ref.current.querySelector(".typo-latin-part--right");
        const commaGlyph = intro01Ref.current.querySelector(".typo-comma-glyph");

        const line1_02 = intro02Ref.current.querySelector(".typo-jp-line--1");
        const line2_02 = intro02Ref.current.querySelector(".typo-jp-line--2");

        tl.set(intro01Ref.current, { willChange: "transform, opacity" }, 0)
          .set(
            slitMaskRef.current,
            {
              "--intro-slit-inset": "48%",
              clipPath:
                "inset(0% var(--intro-slit-inset) 0% var(--intro-slit-inset))",
              willChange: "clip-path",
            },
            0
          )
          .set(
            intro02Ref.current,
            {
              display: "flex",
              autoAlpha: 0,
              willChange: "transform, opacity",
            },
            0
          );

        if (intro02StageRef.current) {
          tl.set(
            intro02StageRef.current,
            {
              display: "grid",
              opacity: 1,
              pointerEvents: "none",
            },
            0
          );
        }

        if (line1_02) {
          tl.set(line1_02, { autoAlpha: 0, x: -28 }, 0);
        }
        if (line2_02) {
          tl.set(line2_02, { autoAlpha: 0, x: 28 }, 0);
        }

        // Latin stays dominant through the initial response and creates the opening.
        tl.to(
          [partLeft, partRight],
          {
            letterSpacing: "-0.045em",
            scale: 0.985,
            duration: 0.12,
            ease: "power1.out",
          },
          0
        )
          .to(partLeft, { x: -54, y: -8, duration: 0.34, ease: "power3.out" }, 0.06)
          .to(partRight, { x: 54, y: 8, duration: 0.34, ease: "power3.out" }, 0.06)
          .to(
            slitMaskRef.current,
            {
              "--intro-slit-inset": "0%",
              duration: 0.62,
              ease: "power3.inOut",
            },
            0.18
          );

        if (commaGlyph) {
          tl.to(commaGlyph, { y: 3, opacity: 0.62, duration: 0.28 }, 0.08);
        }

        // The Japanese line enters only after the Latin title has begun to yield.
        tl.to(intro01Ref.current, { autoAlpha: 0, duration: 0.32, ease: "power2.inOut" }, 0.3)
          .to(
            partLeft,
            { xPercent: -125, autoAlpha: 0, duration: 0.4, ease: "power3.in" },
            0.26
          )
          .to(
            partRight,
            { xPercent: 125, autoAlpha: 0, duration: 0.4, ease: "power3.in" },
            0.26
          )
          .to(intro02Ref.current, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.44);

        if (line1_02) {
          tl.to(
            line1_02,
            { autoAlpha: 1, x: 0, duration: 0.48, ease: "power3.out" },
            0.44
          );
        }
        if (line2_02) {
          tl.to(
            line2_02,
            { autoAlpha: 1, x: 0, duration: 0.48, ease: "power3.out" },
            0.48
          );
        }

        tl.set(
          slitMaskRef.current,
          { clearProps: "clipPath,--intro-slit-inset,willChange" },
          1
        ).set(intro02Ref.current, { clearProps: "willChange" }, 1);
      }
    } else if (stage === "INTRO_2") {
      isTransitioningRef.current = true;
      setStage("EXITING_INTRO_2");

      if (reduceMotion) {
        killActiveTimeline();
        isTransitioningRef.current = false;
        setStage("PORTAL_ACTIVE");
        return;
      }

      // Exit sequence: Japanese lines separate & fade into depth
      const line1 = intro02Ref.current?.querySelector(".typo-jp-line--1");
      const line2 = intro02Ref.current?.querySelector(".typo-jp-line--2");

      const tl = gsap.timeline({
        defaults: { ease: "power2.in" },
        onComplete: () => {
          if (!isMountedRef.current) return;
          killActiveTimeline();
          isTransitioningRef.current = false;
          // Step handoff: Unmount Intro 2 and activate Portal
          setStage("PORTAL_ACTIVE");
        },
      });
      activeTimelineRef.current = tl;

      if (line1) {
        tl.to(line1, { x: -65, y: -35, opacity: 0, duration: 0.42 }, 0);
      }
      if (line2) {
        tl.to(line2, { x: 65, y: 35, opacity: 0, duration: 0.42 }, 0);
      }
      if (intro02Ref.current) {
        tl.to(intro02Ref.current, { opacity: 0, scale: 0.95, duration: 0.42 }, 0);
      }
    }
  }, [isLeaving, isRouteReady, killActiveTimeline, reduceMotion, stage]);

  const handleKeyboardStep = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      (stage === "INTRO_1" || stage === "INTRO_2") &&
      (e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      advanceStep();
    }
  };

  // Entrance animation for Portal when stage transitions to PORTAL_ACTIVE
  useEffect(() => {
    if (stage !== "PORTAL_ACTIVE") return;

    if (reduceMotion) {
      if (portalDesktopRef.current) {
        gsap.set(portalDesktopRef.current, { pointerEvents: "auto" });
      }
      return;
    }

    const ctx = gsap.context(() => {
      if (identityRef.current) {
        const glyphs = identityRef.current.querySelectorAll(".identity-glyph");
        gsap.fromTo(
          glyphs,
          { opacity: 0, scale: 0.9, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.03,
            ease: "power3.out",
          }
        );
      }

      if (navRef.current) {
        const words = navRef.current.querySelectorAll(".dest-word");
        gsap.fromTo(
          words,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: "power3.out",
            delay: 0.1,
            onComplete: () => {
              if (navRef.current) gsap.set(navRef.current, { clearProps: "willChange" });
              if (portalDesktopRef.current) gsap.set(portalDesktopRef.current, { pointerEvents: "auto" });
            },
          }
        );
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [stage, reduceMotion]);

  // Desktop Living Typography Pointer Gravity (gsap.quickSetter for 60fps)
  useEffect(() => {
    if (stage !== "PORTAL_ACTIVE" || reduceMotion || typeof window === "undefined") return;

    let rAfId: number | null = null;
    let mouseX = 0;
    let mouseY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (rAfId === null) {
        rAfId = requestAnimationFrame(() => {
          rAfId = null;

          for (const [, btnNode] of destRefs.current) {
            if (!btnNode) continue;
            const rect = btnNode.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(mouseX - centerX, mouseY - centerY);

            if (dist < 320) {
              const pullFactor = (1 - dist / 320) * 8;
              const moveX = (mouseX - centerX) * 0.04 * (pullFactor / 8);
              const moveY = (mouseY - centerY) * 0.04 * (pullFactor / 8);

              gsap.to(btnNode, {
                x: moveX,
                y: moveY,
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto",
              });
            } else {
              gsap.to(btnNode, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
          }

          if (identityRef.current) {
            const windowCenterX = window.innerWidth / 2;
            const windowCenterY = window.innerHeight / 2;
            const shiftX = (mouseX - windowCenterX) * 0.015;
            const shiftY = (mouseY - windowCenterY) * 0.015;

            gsap.to(identityRef.current, {
              x: shiftX,
              y: shiftY,
              duration: 0.8,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        });
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (rAfId !== null) cancelAnimationFrame(rAfId);
    };
  }, [stage, reduceMotion]);

  const setDestRef = (id: string, node: HTMLButtonElement | null) => {
    if (node) destRefs.current.set(id, node);
    else destRefs.current.delete(id);
  };

  const line1Text = "私の人生へ";
  const line2Text = "ようこそ";

  return (
    <main
      ref={containerRef}
      className={`typo-portal-root ${zenKakuGothic.variable} ${portalDisplayFont.variable}`}
      data-step={stepIndex}
      data-stage={stage}
      data-leaving={isLeaving}
      data-font-direction={fontDirection}
    >
      <GlyphWindow activeDestination={activeDestination} />

      {/* Layer 1: Intro 01 (Darling, ohayō - Pure Typography Handoff) */}
      {stage !== "PORTAL_ACTIVE" && (
        <div
          className="typo-intro-stage typo-intro-stage--01"
          style={{
            display: stage === "INTRO_1" || stage === "TRANSITIONING_0_1" ? "grid" : "none",
            opacity: stage === "INTRO_1" || stage === "TRANSITIONING_0_1" ? 1 : 0,
            pointerEvents: stage === "INTRO_1" ? "auto" : "none",
          }}
          onClick={advanceStep}
          onKeyDown={handleKeyboardStep}
          role="button"
          tabIndex={stage === "INTRO_1" ? 0 : -1}
          aria-label="Khai mở trải nghiệm Darling, ohayō"
        >
          <div className="typo-intro-copy typo-intro-copy--en" ref={intro01Ref}>
            <h1 className="typo-intro-title typo-intro-title--en">
              <span className="typo-latin-part typo-latin-part--left">
                {"Darling,".split("").map((char, index) => (
                  <span
                    key={`en-l-${index}-${char}`}
                    className={`typo-glyph ${char === "," ? "typo-comma-glyph" : ""}`}
                  >
                    {char}
                  </span>
                ))}
              </span>
              <span className="typo-latin-part typo-latin-part--right">
                {"ohayō".split("").map((char, index) => (
                  <span key={`en-r-${index}-${char}`} className="typo-glyph">
                    {char}
                  </span>
                ))}
              </span>
            </h1>
          </div>
        </div>
      )}

      {/* Layer 2: Intro 02 (私の人生へようこそ - Masked Editorial Aperture) */}
      {stage !== "PORTAL_ACTIVE" && (
        <div
          ref={intro02StageRef}
          className="typo-intro-stage typo-intro-stage--02"
          style={{
            display:
              stage === "INTRO_2" ||
              stage === "EXITING_INTRO_2" ||
              stage === "TRANSITIONING_0_1"
                ? "grid"
                : "none",
            opacity: stage === "INTRO_2" || stage === "EXITING_INTRO_2" ? 1 : 0,
            pointerEvents: stage === "INTRO_2" ? "auto" : "none",
          }}
          onClick={advanceStep}
          onKeyDown={handleKeyboardStep}
          role="button"
          tabIndex={stage === "INTRO_2" ? 0 : -1}
          aria-label="Khai mở thế giới chữ FUJIWARA DAIKI"
        >
          <div className="typo-slit-mask" ref={slitMaskRef}>
            <div className="typo-intro-copy typo-intro-copy--jp" ref={intro02Ref}>
              <h1 className="typo-intro-title typo-intro-title--jp">
                <div className="typo-jp-line typo-jp-line--1">
                  {line1Text.split("").map((char, index) => (
                    <span key={`jp1-${index}-${char}`} className="jp-glyph">
                      {char}
                    </span>
                  ))}
                </div>
                <div className="typo-jp-line typo-jp-line--2">
                  {line2Text.split("").map((char, index) => (
                    <span key={`jp2-${index}-${char}`} className="jp-glyph">
                      {char}
                    </span>
                  ))}
                </div>
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Layer 3: Main Typographic World (Desktop) - Rendered only when PORTAL_ACTIVE */}
      {stage === "PORTAL_ACTIVE" && (
        <div
          ref={portalDesktopRef}
          className="typo-world-desktop"
          style={{
            display: "grid",
            opacity: 1,
            pointerEvents: "none",
          }}
        >
          <IdentityAnchor
            ref={identityRef}
            activeDestination={activeDestination}
            fontDirection={fontDirection}
          />

          <nav
            ref={navRef}
            className="typo-world-nav"
            aria-label="Điều hướng các không gian"
          >
            {DESTINATIONS.map((d) => (
              <DestinationWord
                key={d.id}
                ref={(node) => setDestRef(d.id, node)}
                id={d.id}
                label={d.label}
                href={d.href}
                isFocused={activeDestination === d.id}
                onHover={setActiveDestination}
                onSelect={navigateWithFailsafe}
                onPrefetch={(href) => router.prefetch(href)}
              />
            ))}
          </nav>
        </div>
      )}

      {/* Layer 3: Touch-Optimized Mobile View - Rendered only when PORTAL_ACTIVE */}
      {stage === "PORTAL_ACTIVE" ? (
        <div className="typo-world-mobile">
          <MobileChapters
            onSelect={navigateWithFailsafe}
            onPrefetch={(href) => router.prefetch(href)}
          />
        </div>
      ) : null}
    </main>
  );
});
