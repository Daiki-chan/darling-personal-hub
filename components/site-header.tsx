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
          <Link href="/memories" aria-current={active === "gallery" || active === "memories" ? "page" : undefined}>
            MEMORIES
          </Link>
          <Link href="/music" aria-current={active === "music" ? "page" : undefined}>
            MUSIC
          </Link>
          <Link href="/portfolio" aria-current={active === "portfolio" ? "page" : undefined}>
            PORTFOLIO
          </Link>
        </nav>
        <Link className="nav-action" href="/portfolio#contact">
          Gửi lời chào
          <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
        </Link>
      </header>
    </>
  );
}
