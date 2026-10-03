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
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              padding: "20px 24px",
              borderRadius: 12,
              marginTop: 20,
            }}
          >
            <h2 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>Truy cập bị từ chối</h2>
            <p style={{ margin: 0, fontSize: "0.85rem" }}>{guard.message}</p>
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
