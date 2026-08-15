import { ViewTransition, type ReactNode } from "react";
import styles from "./page-transition-shell.module.css";

type PageTransitionShellProps = {
  children: ReactNode;
};

export function PageTransitionShell({ children }: PageTransitionShellProps) {
  return (
    <ViewTransition default="none" enter="route-page" exit="route-page">
      <div className={styles.page}>{children}</div>
    </ViewTransition>
  );
}
