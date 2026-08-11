import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Phạm Hoàng Phúc — Marketing / SEO Specialist Portfolio",
  description:
    "Marketing & SEO Specialist focused on building organic search visibility, intent-driven content frameworks and measurable digital growth.",
};

export default function PortfolioPage() {
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
