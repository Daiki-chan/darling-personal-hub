"use client";

import { useGSAP } from "@gsap/react";
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

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [isRouteReady, setIsRouteReady] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeDestination, setActiveDestination] = useState<"memories" | "music" | "work" | null>(null);
  const [fontDirection] = useState<"kinetic" | "grotesk">("kinetic");

  const isAnimatingRef = useRef(false);
  const lastClickTimeRef = useRef(0);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const navigationTimerRef = useRef<number | null>(null);
  const jpFontLoadPromiseRef = useRef<Promise<unknown> | null>(null);
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

  // Pre-load exact Japanese font face during Intro 01 with 1200ms fail-safe timeout
  useEffect(() => {
    if (typeof document !== "undefined" && "fonts" in document) {
      const loadPromise = document.fonts.load(
        `900 1em ${zenKakuGothic.style.fontFamily}`,
        "私の人生へようこそ"
      );
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1200));
      jpFontLoadPromiseRef.current = Promise.race([loadPromise, timeoutPromise]).catch(() => {
        // Fail-safe: prevent state machine freeze on network failure
      });
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

      // CLICK 01 MASTER TIMELINE: Editorial Slit / Language Reveal (~0.85s)
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          setStep(1);
          isAnimatingRef.current = false;
        },
      });
      activeTimelineRef.current = tl;

      if (intro01Ref.current && intro02Ref.current && slitMaskRef.current) {
        const partLeft = intro01Ref.current.querySelector(".typo-latin-part--left");
        const partRight = intro01Ref.current.querySelector(".typo-latin-part--right");
        const commaGlyph = intro01Ref.current.querySelector(".typo-comma-glyph");

        const line1_02 = intro02Ref.current.querySelector(".typo-jp-line--1");
        const line2_02 = intro02Ref.current.querySelector(".typo-jp-line--2");

        gsap.set(intro01Ref.current, { willChange: "transform, opacity" });
        gsap.set(slitMaskRef.current, {
          clipPath: "inset(0% 48% 0% 48%)",
          willChange: "clip-path",
        });
        if (intro02StageRef.current) {
          gsap.set(intro02StageRef.current, {
            display: "grid",
            opacity: 1,
            pointerEvents: "none",
          });
        }
        gsap.set(intro02Ref.current, {
          display: "flex",
          opacity: 0,
          willChange: "transform, opacity",
        });

        // Stage 1 (0ms - 80ms): 0ms Immediate Response - Latin tracking compression
        tl.to([partLeft, partRight], { letterSpacing: "-0.06em", scale: 0.98, duration: 0.08, ease: "power1.out" }, 0);

        // Stage 2 (60ms - 220ms): Latin structural split
        tl.to(partLeft, { x: -75, y: -12, duration: 0.42, ease: "power2.out" }, 0.06)
          .to(partRight, { x: 75, y: 12, duration: 0.42, ease: "power2.out" }, 0.06);

        if (commaGlyph) {
          tl.to(commaGlyph, { y: 4, opacity: 0.7, duration: 0.3 }, 0.06);
        }

        // Stage 3 (140ms - 300ms): Editorial Aperture Slit Opening
        tl.to(
          slitMaskRef.current,
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.52, ease: "power3.inOut" },
          0.14
        );

        // Stage 4 (220ms - 550ms): Japanese Layer Exposure with Font Gate
        const revealJapanese = () => {
          gsap.to(intro02Ref.current, { opacity: 1, duration: 0.4, ease: "power2.out" });
          gsap.fromTo(
            line1_02,
            { opacity: 0, x: -35 },
            { opacity: 1, x: 0, duration: 0.48, ease: "power3.out" }
          );
          gsap.fromTo(
            line2_02,
            { opacity: 0, x: 35 },
            { opacity: 1, x: 0, duration: 0.48, ease: "power3.out" }
          );
        };

        if (jpFontLoadPromiseRef.current) {
          tl.add(() => {
            jpFontLoadPromiseRef.current?.then(revealJapanese).catch(revealJapanese);
          }, 0.22);
        } else {
          tl.add(revealJapanese, 0.22);
        }

        // Stage 6 (500ms - 800ms): Latin Spatial Crop Exit
        tl.to(partLeft, { x: "-140%", opacity: 0, duration: 0.38, ease: "power2.in" }, 0.5)
          .to(partRight, { x: "140%", opacity: 0, duration: 0.38, ease: "power2.in" }, 0.5);

        // Stage 7 (700ms - 950ms): Slit Retraction & Settle into clean Intro 02 posture
        tl.to(intro01Ref.current, { opacity: 0, duration: 0.25 }, 0.7);
        tl.add(() => {
          if (slitMaskRef.current) {
            gsap.set(slitMaskRef.current, { clearProps: "clipPath,willChange" });
          }
        }, 0.85);
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

      // Pre-set initial hidden transforms at t=0 BEFORE revealing portal container to prevent first-paint flash
      if (identityRef.current) {
        const glyphs = identityRef.current.querySelectorAll(".identity-glyph");
        gsap.set(glyphs, { opacity: 0, scale: 0.86, y: 40, willChange: "transform, opacity" });
      }
      if (navRef.current) {
        const words = navRef.current.querySelectorAll(".dest-word");
        gsap.set(words, { opacity: 0, y: 35, willChange: "transform, opacity" });
      }
      if (portalDesktopRef.current) {
        gsap.set(portalDesktopRef.current, {
          display: "grid",
          opacity: 1,
          pointerEvents: "none",
        });
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
      if (identityRef.current) {
        const glyphs = identityRef.current.querySelectorAll(".identity-glyph");
        tl.to(
          glyphs,
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
        tl.to(
          words,
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 },
          0.65
        );
      }

      // Portal becomes interactive at ~0.95s while residual motion settles
      tl.add(() => {
        setStep(2);
        if (portalDesktopRef.current) {
          gsap.set(portalDesktopRef.current, { pointerEvents: "auto" });
        }
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
      className={`typo-portal-root ${zenKakuGothic.variable} ${portalDisplayFont.variable}`}
      data-step={step}
      data-leaving={isLeaving}
      data-font-direction={fontDirection}
    >
      <GlyphWindow activeDestination={activeDestination} />

      {/* Layer 1: Intro 01 (Darling, ohayō - Pure Typography Handoff) */}
      <div
        className="typo-intro-stage typo-intro-stage--01"
        style={{
          display: step === 0 ? "grid" : "none",
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
        </div>
      </div>

      {/* Layer 2: Intro 02 (私の人生へようこそ - Masked Editorial Aperture) */}
      <div
        ref={intro02StageRef}
        className="typo-intro-stage typo-intro-stage--02"
        style={{
          display: step === 1 ? "grid" : "none",
          opacity: step === 1 ? 1 : 0,
          pointerEvents: step === 1 ? "auto" : "none",
        }}
        onClick={advanceStep}
        onKeyDown={handleKeyboardStep}
        role="button"
        tabIndex={step === 1 ? 0 : -1}
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

      {/* Layer 3: Main Typographic World (Desktop) */}
      <div
        ref={portalDesktopRef}
        className="typo-world-desktop"
        style={{
          display: step === 2 ? "grid" : "none",
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
