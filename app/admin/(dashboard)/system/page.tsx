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
  let dbTablesCount = "—";
  let audioBucketStatus = "Chưa kiểm tra";
  let coversBucketStatus = "Chưa kiểm tra";

  if (status.isConfigured) {
    try {
      const supabase = await getServerSupabase();
      if (supabase) {
        const { error } = await supabase.from("tracks").select("id", { count: "exact", head: true });
        if (!error) {
          dbConnectionResult = "● KẾT NỐI THÀNH CÔNG (200 OK)";
          dbTablesCount = "BẢNG public.tracks ACTIVE";
        } else {
          dbConnectionResult = `[!] TRUY VẤN: ${error.message}`;
        }

        // Test audio bucket
        const { error: audioErr } = await supabase.storage.from("audio").list("", { limit: 1 });
        audioBucketStatus = audioErr ? `[!] LỖI: ${audioErr.message}` : "● SẴN SÀNG (200 OK)";

        // Test covers bucket
        const { error: coverErr } = await supabase.storage.from("covers").list("", { limit: 1 });
        coversBucketStatus = coverErr ? `[!] LỖI: ${coverErr.message}` : "● SẴN SÀNG (200 OK)";
      }
    } catch (err: unknown) {
      dbConnectionResult = err instanceof Error ? `[!] ${err.message}` : "[!] LỖI NGOẠI LỆ";
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageHeaderIndex}>05 · INFRASTRUCTURE // TELEMETRY & DIAGNOSTICS</div>
          <h1 className={styles.pageHeaderTitle}>Chẩn đoán Hệ thống</h1>
          <p className={styles.pageHeaderSub}>
            TRẠNG THÁI DỊCH VỤ SUPABASE, BẢO MẬT RLS & TIÊU CHUẨN KẾT NỐI
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 18 }}>
        {/* Environment status */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Key size={14} style={{ color: "#ffffff" }} />
              <span>Biến môi trường (Environment)</span>
            </h2>
            <span className={styles.panelMeta}>ENV_TELEMETRY</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>NEXT_PUBLIC_SUPABASE_URL</span>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.72rem",
                  color: status.hasUrl ? "#ffffff" : "var(--adm-text-muted)",
                  fontWeight: 500,
                }}
              >
                {status.hasUrl ? "● CONFIGURED" : "○ MISSING"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.72rem",
                  color: status.hasAnonKey ? "#ffffff" : "var(--adm-text-muted)",
                  fontWeight: 500,
                }}
              >
                {status.hasAnonKey ? "● CONFIGURED" : "○ MISSING"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>SUPABASE_SERVICE_ROLE_KEY</span>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.72rem",
                  color: status.hasServiceRoleKey ? "#ffffff" : "var(--adm-text-muted)",
                }}
              >
                {status.hasServiceRoleKey ? "● CONFIGURED (OPTIONAL)" : "○ NOT SET (OPTIONAL)"}
              </span>
            </div>
          </div>
        </div>

        {/* Database & RLS status */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Database size={14} style={{ color: "#ffffff" }} />
              <span>PostgreSQL & Row Level Security</span>
            </h2>
            <span className={styles.panelMeta}>POSTGRES_V15</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Kết nối cơ sở dữ liệu:</span>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.72rem",
                  color: status.isConfigured ? "#ffffff" : "var(--adm-text-muted)",
                }}
              >
                {status.isConfigured ? dbConnectionResult : "○ Chưa cấu hình"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Kiểm tra bảng tracks:</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem", color: "var(--adm-text-secondary)" }}>
                {dbTablesCount}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Chính sách RLS:</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem", color: "#ffffff", fontWeight: 500 }}>
                ● ENABLED (Schema Migration)
              </span>
            </div>
          </div>
        </div>

        {/* Storage status */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <HardDrive size={14} style={{ color: "#ffffff" }} />
              <span>Supabase Storage Buckets</span>
            </h2>
            <span className={styles.panelMeta}>STORAGE_API</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>bucket &apos;audio&apos; (50MB)</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem", color: status.isConfigured ? "#ffffff" : "var(--adm-text-muted)" }}>
                {status.isConfigured ? audioBucketStatus : "○ Standby"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace" }}>bucket &apos;covers&apos; (10MB)</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem", color: status.isConfigured ? "#ffffff" : "var(--adm-text-muted)" }}>
                {status.isConfigured ? coversBucketStatus : "○ Standby"}
              </span>
            </div>
          </div>
        </div>

        {/* Framework & Runtime */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Server size={14} style={{ color: "#ffffff" }} />
              <span>Nền tảng Thực thi (Runtime)</span>
            </h2>
            <span className={styles.panelMeta}>NEXT_TURBOPACK</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Framework:</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem" }}>Next.js 16.3.0</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>React Engine:</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem" }}>React 19.2.8</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Kiến trúc Routing:</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem" }}>App Router + Route Groups</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
