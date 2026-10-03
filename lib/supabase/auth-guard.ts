import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getAdminSupabase } from "./admin";
import { isSupabaseConfigured } from "./config";
import { getServerSupabase } from "./server";
import type { AdminRole, AdminUserRow } from "./types";

export type AuthGuardResult =
  | { status: "unconfigured"; message: string }
  | { status: "unauthenticated"; user: null }
  | { status: "unauthorized"; user: User; role: string; message: string }
  | { status: "authenticated"; user: User; role: AdminRole; profile: AdminUserRow | null };

export async function getAuthenticatedAdmin(): Promise<AuthGuardResult> {
  if (!isSupabaseConfigured()) {
    return {
      status: "unconfigured",
      message: "Supabase credentials are not configured in environment variables.",
    };
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return {
      status: "unconfigured",
      message: "Could not initialize Supabase server client.",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "unauthenticated", user: null };
  }

  // Check admin_users table for role
  const { data: profile, error: profileError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // Check if admin_users is empty using admin client or if user is initial admin
    const adminClient = getAdminSupabase();
    if (adminClient) {
      const { count } = await adminClient
        .from("admin_users")
        .select("*", { count: "exact", head: true });

      // If no admin users exist yet, bootstrap first authenticated user as admin
      if (count === 0) {
        const { data: newAdmin } = await adminClient
          .from("admin_users")
          .insert({
            id: user.id,
            email: user.email || "admin@darling.internal",
            role: "admin",
            display_name: user.user_metadata?.full_name || "Admin",
          })
          .select()
          .single();

        if (newAdmin) {
          return {
            status: "authenticated",
            user,
            role: "admin",
            profile: newAdmin,
          };
        }
      }
    }

    return {
      status: "unauthorized",
      user,
      role: "none",
      message: "Tài khoản của bạn chưa được cấp quyền quản trị viên.",
    };
  }

  if (profile.role !== "admin" && profile.role !== "editor") {
    return {
      status: "unauthorized",
      user,
      role: profile.role,
      message: "Quyền truy cập bị từ chối.",
    };
  }

  return {
    status: "authenticated",
    user,
    role: profile.role,
    profile,
  };
}

export async function requireAdminOrRedirect(redirectTo = "/admin/login") {
  const guard = await getAuthenticatedAdmin();

  if (guard.status === "unauthenticated") {
    redirect(redirectTo);
  }

  return guard;
}
