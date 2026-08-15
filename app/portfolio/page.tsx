"use client";

import { ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PortfolioHero } from "@/components/portfolio/portfolio-hero";
import { HorizontalShowcase } from "@/components/portfolio/horizontal-showcase";
import { PortfolioArchive } from "@/components/portfolio/portfolio-archive";
import { PortfolioApproach } from "@/components/portfolio/portfolio-approach";
import { PortfolioAbout } from "@/components/portfolio/portfolio-about";
import { PortfolioContact } from "@/components/portfolio/portfolio-contact";

export default function PortfolioPage() {
  // Navigation & Scroll Restoration Lifecycle
  useGSAP(() => {
    if (typeof window === "undefined") return;

    const rawState = sessionStorage.getItem("portfolio:return-state");
    if (rawState) {
      try {
        const saved = JSON.parse(rawState);
        sessionStorage.removeItem("portfolio:return-state");

        if (saved.scrollY && Date.now() - saved.timestamp < 7200000) {
          requestAnimationFrame(() => {
            ScrollTrigger.refresh(true);
            window.scrollTo({ top: saved.scrollY, behavior: "instant" });

            requestAnimationFrame(() => {
              ScrollTrigger.refresh(true);
            });
          });
          return;
        }
      } catch {
        sessionStorage.removeItem("portfolio:return-state");
      }
    }

    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });
  });

  return (
    <>
      <SiteHeader active="portfolio" />
      <main className="phuc-portfolio-page inner-page">
        {/* WORLD HERO HEADER */}
        <PortfolioHero />

        {/* 01 / SELECTED WORK */}
        <HorizontalShowcase />

        {/* 02 / WORK INDEX */}
        <PortfolioArchive />

        {/* 03 / METHOD */}
        <PortfolioApproach />

        {/* 04 / ABOUT */}
        <PortfolioAbout />

        {/* 05 / CONTACT */}
        <PortfolioContact />
      </main>
      <SiteFooter />
    </>
  );
}


