import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
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
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Terminal Header */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.68rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--adm-text-muted)",
              marginBottom: 12,
              padding: "4px 10px",
              background: "var(--adm-surface-2)",
              border: "1px solid var(--adm-line-hairline)",
              borderRadius: 2,
            }}
          >
            <Shield size={12} style={{ color: "#ffffff" }} />
            <span>DARLING // RESTRICTED ACCESS</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-editorial), serif",
              fontSize: "2.1rem",
              fontWeight: 400,
              color: "#ffffff",
              margin: "0 0 8px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Quản trị Hệ thống
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.72rem",
              color: "var(--adm-text-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            OBSIDIAN OPERATIONAL CONTROL ROOM
          </p>
        </div>

        <ConfigAlert />

        {/* Machined Card Frame */}
        <div
          style={{
            background: "var(--adm-surface-1)",
            border: "1px solid var(--adm-line-subtle)",
            borderRadius: 3,
            padding: "28px 24px",
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              paddingBottom: 12,
              borderBottom: "1px solid var(--adm-line-hairline)",
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--adm-text-muted)",
            }}
          >
            <span>[ AUTHENTICATION GATE ]</span>
            <span>NODE: SUPABASE AUTH</span>
          </div>

          <LoginForm isConfigured={isConfigured} />
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link
            href="/"
            className={styles.publicSiteLink}
            style={{ display: "inline-flex", justifyContent: "center", fontSize: "0.72rem" }}
          >
            <ArrowLeft size={13} />
            <span>Quay lại cổng chính Darling Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
