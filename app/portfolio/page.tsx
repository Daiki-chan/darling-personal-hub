"use client";

import { ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PortfolioHero } from "@/components/portfolio/portfolio-hero";
import { PortfolioSelectedWork } from "@/components/portfolio/portfolio-selected-work";
import { PortfolioArchive } from "@/components/portfolio/portfolio-archive";
import { PortfolioWhatIBuild } from "@/components/portfolio/portfolio-what-i-build";
import { PortfolioExperiments } from "@/components/portfolio/portfolio-experiments";
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
        {/* HERO */}
        <PortfolioHero />

        {/* 01 / SELECTED WORK */}
        <PortfolioSelectedWork />

        {/* 02 / ARCHIVE */}
        <PortfolioArchive />

        {/* 03 / WHAT I BUILD */}
        <PortfolioWhatIBuild />

        {/* 04 / EXPERIMENTS */}
        <PortfolioExperiments />

        {/* 05 / ABOUT */}
        <PortfolioAbout />

        {/* 06 / CONTACT */}
        <PortfolioContact />
      </main>
      <SiteFooter />
    </>
  );
}
