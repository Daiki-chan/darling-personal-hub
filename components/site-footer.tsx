import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer section-shell">
      <span>Darling personal hub</span>
      <Link href="/">Trở về cổng chính</Link>
    </footer>
  );
}
