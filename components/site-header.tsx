import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PortalBackGuard } from "@/components/portal-back-guard";

type SiteHeaderProps = {
  active?: "gallery" | "memories" | "music" | "portfolio";
  guardInitialVisit?: boolean;
};

export function SiteHeader({ active, guardInitialVisit = true }: SiteHeaderProps) {
  return (
    <>
      {active && guardInitialVisit ? <PortalBackGuard /> : null}
      <header className="site-nav">
        <Link className="brand" href="/#portals" aria-label="Về màn hình chọn không gian">
          FUJIWARA DAIKI
        </Link>
        <nav className="nav-links" aria-label="Điều hướng chính">
          <Link
            href="/memories"
            className="nav-item"
            aria-current={active === "gallery" || active === "memories" ? "page" : undefined}
          >
            <span className="nav-item-num">01</span>
            <span className="nav-item-name">MEMORIES</span>
          </Link>
          <Link
            href="/music"
            className="nav-item"
            aria-current={active === "music" ? "page" : undefined}
          >
            <span className="nav-item-num">02</span>
            <span className="nav-item-name">MUSIC</span>
          </Link>
          <Link
            href="/portfolio"
            className="nav-item"
            aria-current={active === "portfolio" ? "page" : undefined}
          >
            <span className="nav-item-num">03</span>
            <span className="nav-item-name">PORTFOLIO</span>
          </Link>
        </nav>
        <Link className="nav-action" href="/portfolio#contact">
          <span>Gửi lời chào</span>
          <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.5} />
        </Link>
      </header>
    </>
  );
}
