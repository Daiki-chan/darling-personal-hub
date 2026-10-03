"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Database,
  ExternalLink,
  Film,
  Layers,
  LayoutDashboard,
  ListMusic,
  Music2,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import styles from "@/app/admin/admin.module.css";

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isCurrent = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  return (
    <>
      <div
        className={`${styles.drawerOverlay} ${isOpen ? styles.drawerOverlayOpen : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandTitle}>
            <span className={styles.brandIndicator} />
            <span>DARLING // CONTROL</span>
          </div>
          <span className={styles.brandBadge}>V1.0</span>
          <button
            className={styles.mobileMenuBtn}
            onClick={onClose}
            aria-label="Đóng menu điều hướng"
          >
            <X size={15} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navSection}>
            <span className={styles.navSectionLabel}>Hệ thống</span>
            <Link
              href="/admin"
              className={`${styles.navItem} ${isCurrent("/admin") ? styles.navItemActive : ""}`}
              onClick={onClose}
            >
              <span className={styles.navItemIndex}>01</span>
              <LayoutDashboard className={styles.navItemIcon} />
              <span className={styles.navItemTitle}>Tổng quan</span>
            </Link>
          </div>

          <div className={styles.navSection}>
            <span className={styles.navSectionLabel}>Âm nhạc</span>
            <Link
              href="/admin/music"
              className={`${styles.navItem} ${pathname === "/admin/music" ? styles.navItemActive : ""}`}
              onClick={onClose}
            >
              <span className={styles.navItemIndex}>02</span>
              <Music2 className={styles.navItemIcon} />
              <span className={styles.navItemTitle}>Thư viện nhạc</span>
            </Link>
            <Link
              href="/admin/music/upload"
              className={`${styles.navItem} ${isCurrent("/admin/music/upload") ? styles.navItemActive : ""}`}
              onClick={onClose}
            >
              <span className={styles.navItemIndex}>↳</span>
              <UploadCloud className={styles.navItemIcon} />
              <span className={styles.navItemTitle}>Tải lên audio</span>
            </Link>
            <Link
              href="/admin/music/playlists"
              className={`${styles.navItem} ${isCurrent("/admin/music/playlists") ? styles.navItemActive : ""}`}
              onClick={onClose}
            >
              <span className={styles.navItemIndex}>↳</span>
              <ListMusic className={styles.navItemIcon} />
              <span className={styles.navItemTitle}>Danh sách phát</span>
            </Link>
          </div>

          <div className={styles.navSection}>
            <span className={styles.navSectionLabel}>Nội dung</span>
            <Link
              href="/admin/memories"
              className={`${styles.navItem} ${isCurrent("/admin/memories") ? styles.navItemActive : ""}`}
              onClick={onClose}
            >
              <span className={styles.navItemIndex}>03</span>
              <Film className={styles.navItemIcon} />
              <span className={styles.navItemTitle}>Ký ức số</span>
            </Link>
            <Link
              href="/admin/portfolio"
              className={`${styles.navItem} ${isCurrent("/admin/portfolio") ? styles.navItemActive : ""}`}
              onClick={onClose}
            >
              <span className={styles.navItemIndex}>04</span>
              <Layers className={styles.navItemIcon} />
              <span className={styles.navItemTitle}>Hồ sơ Case Study</span>
            </Link>
          </div>

          <div className={styles.navSection}>
            <span className={styles.navSectionLabel}>Hạ tầng</span>
            <Link
              href="/admin/system"
              className={`${styles.navItem} ${isCurrent("/admin/system") ? styles.navItemActive : ""}`}
              onClick={onClose}
            >
              <span className={styles.navItemIndex}>05</span>
              <Database className={styles.navItemIcon} />
              <span className={styles.navItemTitle}>Chẩn đoán Supabase</span>
            </Link>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.publicSiteLink} target="_blank">
            <Compass size={13} />
            <span>Xem Hub công khai</span>
            <ExternalLink size={11} style={{ marginLeft: "auto", opacity: 0.5 }} />
          </Link>
          <Link href="/music" className={styles.publicSiteLink} target="_blank">
            <Sparkles size={13} />
            <span>Kênh /music</span>
            <ExternalLink size={11} style={{ marginLeft: "auto", opacity: 0.5 }} />
          </Link>
        </div>
      </aside>
    </>
  );
}
