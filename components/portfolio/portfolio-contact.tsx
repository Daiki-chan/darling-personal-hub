"use client";

import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useSectionMotion } from "@/components/motion/use-section-motion";

export const PortfolioContact = memo(function PortfolioContact() {
  const containerRef = useSectionMotion<HTMLElement>({ distance: 16, stagger: 0.08 });

  return (
    <section
      ref={containerRef}
      id="contact"
      className="phuc-contact section-shell section-space"
      aria-label="06 / CONTACT"
    >
      <div className="phuc-contact__wrap">
        {/* Chapter 06 Tag */}
        <div className="phuc-chapter-heading-strip" data-motion-reveal>
          <div className="phuc-chapter-heading-left">
            <span className="phuc-label">06 / CONTACT</span>
            <span className="phuc-chapter-sub">COMMUNICATION & INQUIRIES</span>
          </div>
          <div className="phuc-chapter-heading-right">
            <span className="phuc-chapter-meta">OPEN TO NEW HORIZONS</span>
          </div>
        </div>

        {/* Minimal Monumental Statement */}
        <div className="phuc-contact__hero" data-motion-reveal>
          <h2 className="phuc-contact__headline">
            <span className="phuc-contact-line">HAVE SOMETHING IN MIND?</span>
            <span className="phuc-contact-line phuc-contact-line--bold">LET&apos;S TALK.</span>
          </h2>
        </div>

        {/* Action Direct Links Row */}
        <div className="phuc-contact__actions" data-motion-reveal>
          <div className="phuc-contact__line" aria-hidden="true" />

          <div className="phuc-contact__link-row">
            <a
              href="mailto:your-email@example.com"
              className="phuc-contact-link phuc-contact-link--email"
            >
              <span className="label">EMAIL</span>
              <span className="sub">direct contact</span>
              <ArrowUpRight size={18} strokeWidth={1.5} className="arrow" aria-hidden="true" />
            </a>

            <a
              href="https://github.com/Daiki-chan"
              target="_blank"
              rel="noopener noreferrer"
              className="phuc-contact-link phuc-contact-link--github"
            >
              <span className="label">GITHUB</span>
              <span className="sub">code & repositories</span>
              <ArrowUpRight size={18} strokeWidth={1.5} className="arrow" aria-hidden="true" />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="phuc-contact-link phuc-contact-link--linkedin"
            >
              <span className="label">LINKEDIN</span>
              <span className="sub">professional network</span>
              <ArrowUpRight size={18} strokeWidth={1.5} className="arrow" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Closing Footnote Bar */}
        <div className="phuc-contact__footnote-bar" data-motion-reveal>
          <div className="phuc-contact__footnote-left">
            <span>FUJIWARA DAIKI</span>
            <span className="dot" aria-hidden="true">·</span>
            <span>PHẠM HOÀNG PHÚC</span>
          </div>
          <div className="phuc-contact__footnote-right">
            <span>DARLING PERSONAL HUB</span>
            <span className="dot" aria-hidden="true">·</span>
            <span>2026 WORKSPACE</span>
          </div>
        </div>
      </div>
    </section>
  );
});
