"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useReducedMotion } from "framer-motion";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { consumeInitialDocumentVisit } from "@/lib/document-visit";
import { DestinationWord } from "./destination-word";
import { GlyphWindow } from "./glyph-window";
import { IdentityAnchor } from "./identity-anchor";
import { MobileChapters } from "./mobile-chapters";

// Module-level scoped Japanese font loader (preload disabled to prevent payload bloat)
const zenKakuGothic = Zen_Kaku_Gothic_New({
  weight: ["700", "900"],
  display: "swap",
  preload: false,
  subsets: ["latin"],
  variable: "--font-zen-gothic",
});

const DESTINATIONS = [
  { id: "memories" as const, label: "MEMORIES", href: "/thu-vien" },
  { id: "music" as const, label: "MUSIC", href: "/am-nhac" },
  { id: "work" as const, label: "WORK", href: "/portfolio" },
];

export const TypographicPortal = memo(function TypographicPortal() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const identityRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const destRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const intro01Ref = useRef<HTMLDivElement>(null);
  const intro02Ref = useRef<HTMLDivElement>(null);
  const portalDesktopRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [isRouteReady, setIsRouteReady] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeDestination, setActiveDestination] = useState<"memories" | "music" | "work" | null>(null);
  const [fontDirection] = useState<"kinetic" | "grotesk">("kinetic");

  const isAnimatingRef = useRef(false);
  const lastClickTimeRef = useRef(0);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const navigationTimerRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  // Initial Document Visit Hydration & Hash Check
  useEffect(() => {
    const isInitialVisit = consumeInitialDocumentVisit();
    if (isInitialVisit) {
      if (window.location.hash) {
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}`
        );
      }
    } else if (window.location.hash === "#portals") {
      setStep(2);
    }
    setIsRouteReady(true);
  }, []);

  // Prefetch target routes
  useEffect(() => {
    router.prefetch("/thu-vien");
    router.prefetch("/am-nhac");
    router.prefetch("/portfolio");
  }, [router]);

  // Clean up timers & GSAP timelines on unmount
  useEffect(() => {
    return () => {
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current);
      }
      activeTimelineRef.current?.kill();
    };
  }, []);

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

  // Controlled Step Advancement & State Machine Safety across Persistent Mounted Layers
  const advanceStep = useCallback(() => {
    if (!isRouteReady || isLeaving) return;

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    // Debounce rapid double clicks within 350ms
    if (isAnimatingRef.current && timeSinceLastClick < 350) {
      return;
    }

    // Intentional skip after 350ms during transition completes timeline directly to Step 2
    if (isAnimatingRef.current && timeSinceLastClick >= 350) {
      activeTimelineRef.current?.progress(1);
      setStep(2);
      isAnimatingRef.current = false;
      return;
    }

    if (step === 0) {
      isAnimatingRef.current = true;
      if (reduceMotion) {
        setStep(1);
        isAnimatingRef.current = false;
        return;
      }

      // CLICK 01 MASTER TIMELINE: Typographic Handoff (Darling, ohayō → 私の人生へようこそ ~0.75s)
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          setStep(1);
          isAnimatingRef.current = false;
        },
      });
      activeTimelineRef.current = tl;

      if (intro01Ref.current && intro02Ref.current) {
        const partLeft = intro01Ref.current.querySelector(".typo-latin-part--left");
        const partRight = intro01Ref.current.querySelector(".typo-latin-part--right");
        const commaGlyph = intro01Ref.current.querySelector(".typo-comma-glyph");
        const guideTop = intro01Ref.current.querySelector(".typo-guide-line--top");
        const guideBottom = intro01Ref.current.querySelector(".typo-guide-line--bottom");

        const line1_02 = intro02Ref.current.querySelector(".typo-jp-line--1");
        const line2_02 = intro02Ref.current.querySelector(".typo-jp-line--2");

        gsap.set(intro01Ref.current, { willChange: "transform, opacity" });
        gsap.set(intro02Ref.current, {
          display: "flex",
          opacity: 0,
          pointerEvents: "auto",
          willChange: "transform, opacity",
        });

        // Phase 1: 0ms Immediate Response - Latin text structural separation
        tl.to(partLeft, { x: -35, y: -16, duration: 0.45, ease: "power2.out" }, 0)
          .to(partRight, { x: 35, y: 16, duration: 0.45, ease: "power2.out" }, 0);

        if (commaGlyph) {
          tl.to(commaGlyph, { y: 4, opacity: 0.6, duration: 0.3 }, 0);
        }

        // Phase 2: 0.10s - Construction baseline guide lines reveal
        if (guideTop && guideBottom) {
          tl.fromTo(guideTop, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 0.22, duration: 0.35 }, 0.1)
            .fromTo(guideBottom, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 0.22, duration: 0.35 }, 0.12);
        }

        // Phase 3: 0.22s - Japanese reveals along structural axes (VISIBLE COEXISTENCE 300ms–550ms!)
        tl.to(intro02Ref.current, { opacity: 1, duration: 0.4 }, 0.22)
          .fromTo(
            line1_02,
            { opacity: 0, x: -45, y: -10 },
            { opacity: 1, x: 0, y: 0, duration: 0.5, ease: "power3.out" },
            0.22
          )
          .fromTo(
            line2_02,
            { opacity: 0, x: 45, y: 10 },
            { opacity: 1, x: 0, y: 0, duration: 0.5, ease: "power3.out" },
            0.28
          );

        // Phase 4: 0.48s - Handoff & Latin retreat
        tl.to(intro01Ref.current, { opacity: 0, scale: 0.96, duration: 0.35 }, 0.48);
        if (guideTop && guideBottom) {
          tl.to([guideTop, guideBottom], { scaleX: 0, opacity: 0, duration: 0.3 }, 0.48);
        }
      }
    } else if (step === 1) {
      isAnimatingRef.current = true;
      if (reduceMotion) {
        setStep(2);
        isAnimatingRef.current = false;
        return;
      }

      // CLICK 02 MASTER TIMELINE: Deconstruct -> Spatial Coexistence -> Reveal FUJIWARA DAIKI -> Portal (~1.25s)
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          setStep(2);
          isAnimatingRef.current = false;
          // Clear will-change after sequence settles
          if (identityRef.current) gsap.set(identityRef.current, { clearProps: "willChange" });
          if (navRef.current) gsap.set(navRef.current, { clearProps: "willChange" });
        },
      });
      activeTimelineRef.current = tl;

      const line1 = intro02Ref.current?.querySelector(".typo-jp-line--1");
      const line2 = intro02Ref.current?.querySelector(".typo-jp-line--2");

      if (intro02Ref.current) {
        gsap.set(intro02Ref.current, { willChange: "transform, opacity" });
      }

      // Phase A: Controlled Editorial Deconstruction & Baseline Separation (0.0s - 0.65s)
      if (line1) {
        tl.to(line1, { x: -75, y: -40, opacity: 0.4, duration: 0.65, ease: "power2.inOut" }, 0);
      }
      if (line2) {
        tl.to(line2, { x: 75, y: 40, opacity: 0.4, duration: 0.65, ease: "power2.inOut" }, 0);
      }

      // Phase B: COEXISTENCE PHASE! (0.2s - 0.7s)
      // While Japanese lines are separated & visible, FUJIWARA DAIKI emerges through the spatial gap!
      if (portalDesktopRef.current) {
        gsap.set(portalDesktopRef.current, {
          display: "grid",
          opacity: 1,
          pointerEvents: "auto",
        });
      }

      if (identityRef.current) {
        const glyphs = identityRef.current.querySelectorAll(".identity-glyph");
        gsap.set(identityRef.current, { willChange: "transform, opacity" });

        tl.fromTo(
          glyphs,
          { opacity: 0, scale: 0.86, y: 40 },
          { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.03 },
          0.2
        );
      }

      // Phase C: Japanese layer retreats into depth (0.5s - 0.95s)
      if (intro02Ref.current) {
        tl.to(intro02Ref.current, { opacity: 0, scale: 0.94, duration: 0.45 }, 0.5);
      }

      // Phase D: Destination Words stagger in (0.65s - 1.1s)
      if (navRef.current) {
        const words = navRef.current.querySelectorAll(".dest-word");
        gsap.set(navRef.current, { willChange: "transform, opacity" });

        tl.fromTo(
          words,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 },
          0.65
        );
      }

      // Portal becomes interactive at ~0.95s while residual motion settles
      tl.add(() => {
        setStep(2);
      }, 0.95);
    }
  }, [isLeaving, isRouteReady, reduceMotion, step]);

  const handleKeyboardStep = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (step < 2 && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      advanceStep();
    }
  };

  // Desktop Living Typography Pointer Gravity (gsap.quickSetter for 60fps)
  useEffect(() => {
    if (step !== 2 || reduceMotion || typeof window === "undefined") return;

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
  }, [step, reduceMotion]);

  const setDestRef = (id: string, node: HTMLButtonElement | null) => {
    if (node) destRefs.current.set(id, node);
    else destRefs.current.delete(id);
  };

  const line1Text = "私の人生へ";
  const line2Text = "ようこそ";

  return (
    <main
      ref={containerRef}
      className={`typo-portal-root ${zenKakuGothic.variable}`}
      data-step={step}
      data-leaving={isLeaving}
      data-font-direction={fontDirection}
    >
      <GlyphWindow activeDestination={activeDestination} />

      {/* Layer 1: Intro 01 (Darling, ohayō - Pure Typography Handoff) */}
      <div
        className="typo-intro-stage typo-intro-stage--01"
        style={{
          display: step === 0 || isAnimatingRef.current ? "grid" : "none",
          opacity: step === 0 ? 1 : 0,
          pointerEvents: step === 0 ? "auto" : "none",
        }}
        onClick={advanceStep}
        onKeyDown={handleKeyboardStep}
        role="button"
        tabIndex={step === 0 ? 0 : -1}
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
          {/* Subtle editorial baseline construction guides */}
          <div className="typo-guide-line typo-guide-line--top" aria-hidden="true" />
          <div className="typo-guide-line typo-guide-line--bottom" aria-hidden="true" />
        </div>
      </div>

      {/* Layer 2: Intro 02 (私の人生へようこそ - Asymmetrical Architectural Statement) */}
      <div
        className="typo-intro-stage typo-intro-stage--02"
        style={{
          display: step === 1 || isAnimatingRef.current ? "grid" : "none",
          opacity: step === 1 ? 1 : 0,
          pointerEvents: step === 1 ? "auto" : "none",
        }}
        onClick={advanceStep}
        onKeyDown={handleKeyboardStep}
        role="button"
        tabIndex={step === 1 ? 0 : -1}
        aria-label="Khai mở thế giới chữ FUJIWARA DAIKI"
      >
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

      {/* Layer 3: Main Typographic World (Desktop) */}
      <div
        ref={portalDesktopRef}
        className="typo-world-desktop"
        style={{
          display: step === 2 || isAnimatingRef.current ? "grid" : "none",
          opacity: step === 2 ? 1 : 0,
          pointerEvents: step === 2 ? "auto" : "none",
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

      {/* Layer 3: Touch-Optimized Mobile View */}
      {step === 2 ? (
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
