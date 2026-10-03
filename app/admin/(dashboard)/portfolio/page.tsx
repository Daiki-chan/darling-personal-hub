import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Layers } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { FEATURED_PROJECTS } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "Quản lý Hồ sơ (Portfolio) | Darling Admin",
  description: "Quản lý các Case Study và dự án được tuyển chọn",
};

export default function AdminPortfolioPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageHeaderIndex}>04 · CASE STUDIES // SYSTEM ARCHIVE</div>
          <h1 className={styles.pageHeaderTitle}>Hồ sơ Case Study (Portfolio CMS)</h1>
          <p className={styles.pageHeaderSub}>
            QUẢN LÝ DỰ ÁN KỸ THUẬT & HỆ THỐNG SỐNG TẠI /PORTFOLIO
          </p>
        </div>
      </div>

      <div className={styles.panel} style={{ marginBottom: 28 }}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            <Layers size={14} style={{ color: "#ffffff" }} />
            <span>Dự án Hiện hành (Baseline Architecture)</span>
          </h2>
          <span className={styles.panelMeta}>
            {FEATURED_PROJECTS.length} PRODUCTION RELEASES
          </span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 44 }}>MÃ</th>
                <th>TÊN DỰ ÁN</th>
                <th>KHÁCH HÀNG / HỆ THỐNG</th>
                <th>NĂM</th>
                <th>CHUYÊN MỤC</th>
                <th>TRẠNG THÁI</th>
                <th style={{ textAlign: "right" }}>XEM</th>
              </tr>
            </thead>
            <tbody>
              {FEATURED_PROJECTS.map((proj) => (
                <tr key={proj.slug}>
                  <td style={{ fontFamily: "var(--font-mono), monospace", color: "#ffffff", fontWeight: 600 }}>
                    {proj.index}
                  </td>
                  <td style={{ fontWeight: 500 }}>{proj.title}</td>
                  <td style={{ color: "var(--adm-text-secondary)" }}>{proj.client}</td>
                  <td style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.74rem" }}>{proj.year}</td>
                  <td style={{ fontSize: "0.74rem", fontFamily: "var(--font-mono), monospace" }}>{proj.category}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles.statusPublished}`}>
                      ● PUBLISHED
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={`/portfolio/${proj.slug}`}
                      target="_blank"
                      className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                    >
                      <ExternalLink size={11} />
                      <span>Xem</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            <span>Kiến trúc Mở rộng Database Abstraction</span>
          </h2>
          <span className={styles.panelMeta}>
            SCHEMA: public.portfolio_projects
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.76rem",
            lineHeight: 1.6,
            color: "var(--adm-text-secondary)",
            margin: 0,
          }}
        >
          Theo nguyên tắc kiến trúc bảo toàn: Dữ liệu hồ sơ hiện hành được cấu trúc tĩnh có hệ thống tại <code>lib/portfolio-data.ts</code> để bảo đảm hiệu năng SSG tối đa. Bảng <code>portfolio_projects</code> đã được tạo trong Supabase migration schema để hỗ trợ mở rộng thêm các dự án động trong tương lai mà không làm ảnh hưởng đến các case study hiện hành.
        </p>
      </div>
    </div>
  );
}
