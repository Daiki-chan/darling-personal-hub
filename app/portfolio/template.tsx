import { PageTransitionShell } from "@/components/motion/page-transition-shell";

export default function PortfolioTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransitionShell>{children}</PageTransitionShell>;
}
