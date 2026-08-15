"use client";

import { memo, useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from "@/lib/motion/tokens";


export const PortfolioContact = memo(function PortfolioContact() {
  const containerRef = useRef<HTMLElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 65%",
          toggleActions: "play none none none",
        },
      });

      if (tagRef.current) {
        tl.fromTo(
          tagRef.current,
          { autoAlpha: 0, y: -10 },
          { autoAlpha: 1, y: 0, duration: MOTION_DURATION.standard, ease: MOTION_EASE.gsap }
        );
      }

      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current.children,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: MOTION_STAGGER.expressive,
            duration: MOTION_DURATION.section,
            ease: MOTION_EASE.gsap,
          },
          "-=0.2"
        );
      }

      if (actionsRef.current) {
        tl.fromTo(
          actionsRef.current,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: MOTION_DURATION.enter, ease: MOTION_EASE.gsap },
          "-=0.3"
        );
      }

      if (footerRef.current) {
        tl.fromTo(
          footerRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: MOTION_DURATION.standard, ease: MOTION_EASE.gsap },
          "-=0.2"
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="contact"
      className="phuc-contact section-shell"
      aria-label="05 / CONTACT"
    >
      <div className="phuc-contact__wrap">
        {/* Chapter 05 Tag Bar */}
        <div ref={tagRef} className="phuc-contact__chapter-bar">
          <span className="phuc-label">05 / CONTACT</span>
          <span className="phuc-contact__chapter-desc">OUTRO & DIRECT INQUIRIES</span>
        </div>

        {/* Asymmetric Monumental Statement: MAKE IT (left) -> VISIBLE. (right) */}
        <h2 ref={headlineRef} className="phuc-contact__headline">
          <span className="phuc-contact-word phuc-contact-word--make">MAKE</span>
          <span className="phuc-contact-word phuc-contact-word--it">IT</span>
          <span className="phuc-contact-word phuc-contact-word--visible">VISIBLE.</span>
        </h2>

        {/* Asymmetric Direct Action Links (Left / Right Split) */}
        <div ref={actionsRef} className="phuc-contact__actions">
          <div className="phuc-contact__line" aria-hidden="true" />

          <div className="phuc-contact__link-row">
            <a href="mailto:your-email@example.com" className="phuc-contact-link phuc-contact-link--email">
              <span>EMAIL</span>
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="phuc-contact-link phuc-contact-link--linkedin"
            >
              <span>LINKEDIN</span>
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </div>

        {/* Closing Footnote Bar */}
        <div ref={footerRef} className="phuc-contact__footnote-bar">
          <div className="phuc-contact__footnote-left">
            <span>FUJIWARA DAIKI</span>
            <span className="dot" aria-hidden="true">·</span>
            <span>PHẠM HOÀNG PHÚC</span>
          </div>
          <div className="phuc-contact__footnote-right">
            <span>WORK / 03</span>
            <span className="dot" aria-hidden="true">·</span>
            <span>2026</span>
          </div>
        </div>
      </div>
    </section>
  );
});


