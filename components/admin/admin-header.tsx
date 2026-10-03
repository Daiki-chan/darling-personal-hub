"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Shield } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { signOutAdminAction } from "@/app/admin/actions/auth-actions";

type AdminHeaderProps = {
  onOpenMobileMenu: () => void;
  userEmail?: string | null;
  role?: string;
};

export function AdminHeader({
  onOpenMobileMenu,
  userEmail,
  role = "admin",
}: AdminHeaderProps) {
  const pathname = usePathname();

  const getBreadcrumb = () => {
    if (pathname === "/admin") return "01 // TỔNG QUAN";
    if (pathname === "/admin/music") return "02 // THƯ VIỆN NHẠC";
    if (pathname === "/admin/music/upload") return "02 // TẢI LÊN AUDIO";
    if (pathname === "/admin/music/playlists") return "02 // DANH SÁCH PHÁT";
    if (pathname.startsWith("/admin/music/")) return "02 // BIÊN TẬP BẢN NHẠC";
    if (pathname === "/admin/memories") return "03 // KÝ ỨC SỐ (MEMORIES)";
    if (pathname === "/admin/portfolio") return "04 // HỒ SƠ CASE STUDY";
    if (pathname === "/admin/system") return "05 // CHẨN ĐOÁN HỆ THỐNG";
    return pathname.replace("/admin/", "").toUpperCase();
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.mobileMenuBtn}
          onClick={onOpenMobileMenu}
          aria-label="Mở menu quản trị"
        >
          <Menu size={16} />
        </button>

        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <Link href="/admin" style={{ color: "inherit", textDecoration: "none" }}>
            CONTROL ROOM
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{getBreadcrumb()}</span>
        </nav>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.systemStatusPill}>
          <span className={styles.statusDot} />
          <span>SYS.ONLINE</span>
        </div>

        {userEmail ? (
          <div className={styles.userBadge}>
            <div className={styles.userAvatar} title={userEmail}>
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail}
            </span>
            <span className={styles.brandBadge} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Shield size={10} />
              {role.toUpperCase()}
            </span>

            <form action={signOutAdminAction}>
              <button type="submit" className={styles.logoutBtn} title="Đăng xuất khỏi hệ thống">
                <LogOut size={12} />
                <span>Thoát</span>
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
