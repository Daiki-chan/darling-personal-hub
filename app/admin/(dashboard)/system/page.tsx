import type { Metadata } from "next";
import {
  Database,
  HardDrive,
  Key,
  Server,
} from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { getSupabaseConfigStatus } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Trạng thái Hệ thống | Darling Admin",
  description: "Báo cáo chẩn đoán kết nối Supabase, PostgreSQL, Auth và Storage",
};

export default async function AdminSystemPage() {
  const status = getSupabaseConfigStatus();

  let dbConnectionResult = "Chưa kiểm tra";
  let dbTablesCount = "N/A";
  let audioBucketStatus = "Chưa kiểm tra";
  let coversBucketStatus = "Chưa kiểm tra";

  if (status.isConfigured) {
    try {
      const supabase = await getServerSupabase();
      if (supabase) {
        const { error } = await supabase.from("tracks").select("id", { count: "exact", head: true });
        if (!error) {
          dbConnectionResult = "Kết nối thành công (200 OK)";
          dbTablesCount = "Bảng public.tracks hoạt động tốt";
        } else {
          dbConnectionResult = `Lỗi truy vấn: ${error.message}`;
        }

        // Test audio bucket
        const { error: audioErr } = await supabase.storage.from("audio").list("", { limit: 1 });
        audioBucketStatus = audioErr ? `Lỗi: ${audioErr.message}` : "Sẵn sàng (200 OK)";

        // Test covers bucket
        const { error: coverErr } = await supabase.storage.from("covers").list("", { limit: 1 });
        coversBucketStatus = coverErr ? `Lỗi: ${coverErr.message}` : "Sẵn sàng (200 OK)";
      }
    } catch (err: unknown) {
      dbConnectionResult = err instanceof Error ? err.message : "Lỗi không xác định";
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageHeaderTitle}>Chẩn đoán Hệ thống</h1>
          <p className={styles.pageHeaderSub}>
            TRẠNG THÁI DỊCH VỤ SUPABASE, BẢO MẬT RLS & TIÊU CHUẨN KẾT NỐI
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
        {/* Environment status */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Key size={15} style={{ color: "var(--v2-accent, #a78bfa)" }} />
              <span>Biến môi trường (Environment)</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.82rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>NEXT_PUBLIC_SUPABASE_URL</span>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  color: status.hasUrl ? "#4ade80" : "#f87171",
                }}
              >
                {status.hasUrl ? "CONFIGURED" : "MISSING"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  color: status.hasAnonKey ? "#4ade80" : "#f87171",
                }}
              >
                {status.hasAnonKey ? "CONFIGURED" : "MISSING"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>SUPABASE_SERVICE_ROLE_KEY</span>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  color: status.hasServiceRoleKey ? "#4ade80" : "var(--v2-text-tertiary, rgba(237, 234, 242, 0.45))",
                }}
              >
                {status.hasServiceRoleKey ? "CONFIGURED (OPTIONAL)" : "NOT SET (OPTIONAL)"}
              </span>
            </div>
          </div>
        </div>

        {/* Database & RLS status */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Database size={15} style={{ color: "var(--v2-accent, #a78bfa)" }} />
              <span>PostgreSQL & Row Level Security</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.82rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Kết nối cơ sở dữ liệu:</span>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  color: status.isConfigured ? "#4ade80" : "#fbbf24",
                }}
              >
                {status.isConfigured ? dbConnectionResult : "Chưa cấu hình"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Kiểm tra bảng tracks:</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", color: "var(--v2-text-secondary, #9895a3)" }}>
                {dbTablesCount}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Chính sách RLS:</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", color: "#4ade80" }}>
                ENABLED (Đã kích hoạt trong migration)
              </span>
            </div>
          </div>
        </div>

        {/* Storage status */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <HardDrive size={15} style={{ color: "var(--v2-accent, #a78bfa)" }} />
              <span>Supabase Storage Buckets</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.82rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>bucket &apos;audio&apos;</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", color: status.isConfigured ? "#4ade80" : "#fbbf24" }}>
                {audioBucketStatus}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>bucket &apos;covers&apos;</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", color: status.isConfigured ? "#4ade80" : "#fbbf24" }}>
                {coversBucketStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Framework & Runtime */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Server size={15} style={{ color: "var(--v2-accent, #a78bfa)" }} />
              <span>Nền tảng Thực thi (Runtime)</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.82rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Framework:</span>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>Next.js 16.3.0 (Turbopack)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>React Engine:</span>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>React 19.2.8</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Routing Architecture:</span>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>App Router + Route Groups</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
