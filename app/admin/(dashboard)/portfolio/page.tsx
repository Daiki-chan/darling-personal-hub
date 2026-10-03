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
          <h1 className={styles.pageHeaderTitle}>Hồ sơ Case Study (Portfolio CMS)</h1>
          <p className={styles.pageHeaderSub}>
            QUẢN LÝ DỰ ÁN KỸ THUẬT & HỆ THỐNG SỐNG TẠI /PORTFOLIO
          </p>
        </div>
      </div>

      <div className={styles.panel} style={{ marginBottom: 28 }}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            <Layers size={15} style={{ color: "var(--v2-accent, #a78bfa)" }} />
            <span>Dự án Hiện hành (Baseline Architecture)</span>
          </h2>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem", opacity: 0.6 }}>
            {FEATURED_PROJECTS.length} PROJECTS
          </span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 44 }}>Mã</th>
                <th>Tên dự án</th>
                <th>Khách hàng / Hệ thống</th>
                <th>Năm</th>
                <th>Chuyên mục</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right" }}>Xem</th>
              </tr>
            </thead>
            <tbody>
              {FEATURED_PROJECTS.map((proj) => (
                <tr key={proj.slug}>
                  <td style={{ fontFamily: "var(--font-mono), monospace", color: "var(--v2-accent, #a78bfa)" }}>
                    {proj.index}
                  </td>
                  <td style={{ fontWeight: 600 }}>{proj.title}</td>
                  <td style={{ color: "var(--v2-text-secondary, #9895a3)" }}>{proj.client}</td>
                  <td style={{ fontFamily: "var(--font-mono), monospace" }}>{proj.year}</td>
                  <td style={{ fontSize: "0.75rem" }}>{proj.category}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles.statusPublished}`}>
                      PUBLISHED
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={`/portfolio/${proj.slug}`}
                      target="_blank"
                      className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                    >
                      <ExternalLink size={12} />
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
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.8rem",
            lineHeight: 1.6,
            color: "var(--v2-text-secondary, #9895a3)",
            margin: 0,
          }}
        >
          Theo nguyên tắc kiến trúc: Dữ liệu hồ sơ hiện hành được cấu trúc tĩnh có hệ thống tại <code>lib/portfolio-data.ts</code> để bảo đảm hiệu năng SSG tối đa. Bảng <code>portfolio_projects</code> đã được tạo trong Supabase migration để hỗ trợ thêm các dự án động trong tương lai mà không làm gián đoạn các bài viết hiện tại.
        </p>
      </div>
    </div>
  );
}
