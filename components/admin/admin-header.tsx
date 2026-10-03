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
    if (pathname === "/admin") return "Tổng quan";
    if (pathname === "/admin/music") return "Thư viện nhạc";
    if (pathname === "/admin/music/upload") return "Tải lên nhạc";
    if (pathname === "/admin/music/playlists") return "Danh sách phát";
    if (pathname.startsWith("/admin/music/")) return "Chỉnh sửa bài hát";
    if (pathname === "/admin/memories") return "Ký ức (Memories)";
    if (pathname === "/admin/portfolio") return "Hồ sơ (Portfolio)";
    if (pathname === "/admin/system") return "Trạng thái hệ thống";
    return pathname.replace("/admin/", "");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.mobileMenuBtn}
          onClick={onOpenMobileMenu}
          aria-label="Mở menu quản trị"
        >
          <Menu size={18} />
        </button>

        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <Link href="/admin" style={{ color: "inherit", textDecoration: "none" }}>
            ADMIN
          </Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>{getBreadcrumb()}</span>
        </nav>
      </div>

      <div className={styles.headerRight}>
        {userEmail ? (
          <div className={styles.userBadge}>
            <div className={styles.userAvatar} title={userEmail}>
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail}
            </span>
            <span className={styles.brandBadge} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <Shield size={10} />
              {role.toUpperCase()}
            </span>

            <form action={signOutAdminAction}>
              <button type="submit" className={styles.logoutBtn} title="Đăng xuất">
                <LogOut size={13} />
                <span>Thoát</span>
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
