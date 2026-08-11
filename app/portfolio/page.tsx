"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CustomCursor } from "@/components/portfolio/custom-cursor";
import { PortfolioHero } from "@/components/portfolio/portfolio-hero";
import { PortfolioProfile } from "@/components/portfolio/portfolio-profile";
import { SelectedWorkIntro } from "@/components/portfolio/selected-work-intro";
import { HorizontalShowcase } from "@/components/portfolio/horizontal-showcase";
import { PortfolioArchive } from "@/components/portfolio/portfolio-archive";
import { PortfolioApproach } from "@/components/portfolio/portfolio-approach";
import { PortfolioCapabilities } from "@/components/portfolio/portfolio-capabilities";
import { PortfolioExperience } from "@/components/portfolio/portfolio-experience";
import { PortfolioNumbers } from "@/components/portfolio/portfolio-numbers";
import { PortfolioStatement } from "@/components/portfolio/portfolio-statement";
import { PortfolioContact } from "@/components/portfolio/portfolio-contact";

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioPage() {
  // Navigation & Scroll Restoration Lifecycle (Rules 24, 25, 26, 29, 30, 31)
  useGSAP(() => {
    if (typeof window === "undefined") return;

    const rawState = sessionStorage.getItem("portfolio:return-state");
    if (!rawState) return;

    try {
      const saved = JSON.parse(rawState);
      // Consume state so manual reloads do not trigger stale scroll jumps
      sessionStorage.removeItem("portfolio:return-state");

      // Verify timestamp freshness (within 2 hours)
      if (saved.scrollY && Date.now() - saved.timestamp < 7200000) {
        // Wait for DOM layout and ScrollTrigger pin measurements to stabilize
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          window.scrollTo({ top: saved.scrollY, behavior: "instant" });

          // Secondary refresh pass after scroll position is restored
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });
        });
      }
    } catch {
      sessionStorage.removeItem("portfolio:return-state");
    }
  });

  return (
    <>
      <CustomCursor />
      <SiteHeader active="portfolio" />
      <main className="phuc-portfolio-page inner-page">
        <PortfolioHero />
        <PortfolioProfile />
        <SelectedWorkIntro />
        <HorizontalShowcase />
        <PortfolioArchive />
        <PortfolioApproach />
        <PortfolioCapabilities />
        <PortfolioExperience />
        <PortfolioNumbers />
        <PortfolioStatement />
        <PortfolioContact />
      </main>
      <SiteFooter />
    </>
  );
}
