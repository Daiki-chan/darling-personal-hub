import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { ConfigAlert } from "@/components/admin/config-alert";
import { getAuthenticatedAdmin } from "@/lib/supabase/auth-guard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Đăng nhập Quản trị | Darling CMS",
  description: "Xác thực Supabase cho hệ thống quản trị cá nhân Darling",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const guard = await getAuthenticatedAdmin();

  if (guard.status === "authenticated") {
    redirect("/admin");
  }

  const isConfigured = isSupabaseConfigured();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--v2-bg, #050507)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
        }}
      >
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.74rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--v2-text-tertiary, rgba(237, 234, 242, 0.45))",
              marginBottom: 10,
            }}
          >
            <ShieldCheck size={14} style={{ color: "var(--v2-accent, #a78bfa)" }} />
            <span>DARLING / CONSOLE</span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-editorial), serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Quản trị Hệ thống
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--v2-text-secondary, #9895a3)",
              margin: 0,
            }}
          >
            Khu vực riêng tư dành cho quản trị viên và phát hành nội dung
          </p>
        </div>

        <ConfigAlert />

        <div
          style={{
            background: "var(--v2-surface, #0e0e13)",
            border: "1px solid var(--v2-line, rgba(255, 255, 255, 0.08))",
            borderRadius: 14,
            padding: "28px 24px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
          }}
        >
          <LoginForm isConfigured={isConfigured} />
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link
            href="/"
            className={styles.publicSiteLink}
            style={{ justifyContent: "center", fontSize: "0.78rem" }}
          >
            <ArrowLeft size={14} />
            <span>Quay lại cổng chính Darling Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
