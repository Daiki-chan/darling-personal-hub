"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export type AuthActionResult = {
  success?: boolean;
  error?: string;
};

export async function signInAdminAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "MISSING CONFIGURATION: Supabase chưa được cấu hình biến môi trường. Vui lòng cấu hình NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Vui lòng nhập đầy đủ email và mật khẩu." };
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return { error: "Không thể khởi tạo kết nối Supabase server." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    return { error: error?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin." };
  }

  // Check admin authorization
  const { data: profile } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile && profile.role !== "admin" && profile.role !== "editor") {
    await supabase.auth.signOut();
    return { error: "Tài khoản của bạn không có quyền truy cập khu vực quản trị." };
  }

  redirect("/admin");
}

export async function signOutAdminAction() {
  if (isSupabaseConfigured()) {
    const supabase = await getServerSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
  redirect("/admin/login");
}
