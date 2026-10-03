"use client";

import { type ReactNode, useState } from "react";
import styles from "@/app/admin/admin.module.css";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

type AdminShellProps = {
  children: ReactNode;
  userEmail?: string | null;
  role?: string;
};

export function AdminShell({ children, userEmail, role }: AdminShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={styles.adminRoot}>
      <div className={styles.adminShell}>
        <AdminSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <div className={styles.mainContainer}>
          <AdminHeader
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            userEmail={userEmail}
            role={role}
          />
          <main className={styles.contentArea}>{children}</main>
        </div>
      </div>
    </div>
  );
}
