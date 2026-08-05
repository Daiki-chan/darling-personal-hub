import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PortalBackGuard } from "@/components/portal-back-guard";

type SiteHeaderProps = {
  active?: "gallery" | "music" | "portfolio";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <>
      {active ? <PortalBackGuard /> : null}
      <header className="site-nav">
        <Link className="brand" href="/#portals" aria-label="Về màn hình chọn không gian">
          Darling
        </Link>
        <nav className="nav-links" aria-label="Điều hướng chính">
          <Link href="/thu-vien" aria-current={active === "gallery" ? "page" : undefined}>
            Thư viện ảnh
          </Link>
          <Link href="/am-nhac" aria-current={active === "music" ? "page" : undefined}>
            Thư viện nhạc
          </Link>
          <Link href="/portfolio" aria-current={active === "portfolio" ? "page" : undefined}>
            Portfolio
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
