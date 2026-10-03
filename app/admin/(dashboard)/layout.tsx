import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ConfigAlert } from "@/components/admin/config-alert";
import { getAuthenticatedAdmin } from "@/lib/supabase/auth-guard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const isConfigured = isSupabaseConfigured();

  if (!isConfigured) {
    // If Supabase is unconfigured, render the Admin Shell with a persistent missing configuration alert
    return (
      <AdminShell userEmail="chua-cau-hinh@supabase" role="unconfigured">
        <ConfigAlert />
        {children}
      </AdminShell>
    );
  }

  const guard = await getAuthenticatedAdmin();

  if (guard.status !== "authenticated") {
    if (guard.status === "unauthenticated") {
      redirect("/admin/login");
    }

    if (guard.status === "unauthorized") {
      return (
        <AdminShell userEmail={guard.user.email} role="unauthorized">
          <div
            role="alert"
            style={{
              background: "var(--adm-surface-3)",
              border: "1px solid var(--adm-line-strong)",
              color: "#ffffff",
              padding: "20px 24px",
              borderRadius: 2,
              marginTop: 20,
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            <h2 style={{ margin: "0 0 8px 0", fontSize: "1rem", letterSpacing: "0.06em" }}>
              [ ! ] TRUY CẬP BỊ TỪ CHỐI — UNAUTHORIZED
            </h2>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--adm-text-secondary)" }}>
              {guard.message}
            </p>
          </div>
        </AdminShell>
      );
    }

    return (
      <AdminShell userEmail="chua-cau-hinh@supabase" role="unconfigured">
        <ConfigAlert />
        {children}
      </AdminShell>
    );
  }

  return (
    <AdminShell
      userEmail={guard.user.email}
      role={guard.role}
    >
      {children}
    </AdminShell>
  );
}
