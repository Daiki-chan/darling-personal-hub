"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAuthenticatedAdmin } from "@/lib/supabase/auth-guard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export async function createPlaylistAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "MISSING CONFIGURATION" };
  }

  const guard = await getAuthenticatedAdmin();
  if (guard.status !== "authenticated") {
    return { error: "Quyền truy cập bị từ chối." };
  }

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const isPublic = formData.get("isPublic") === "true";

  if (!name) {
    return { error: "Tên danh sách phát không được để trống." };
  }

  const supabase = getAdminSupabase() || (await getServerSupabase());
  if (!supabase) return { error: "Lỗi kết nối Supabase." };

  const { error } = await supabase.from("playlists").insert({
    name,
    description,
    is_public: isPublic,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/music/playlists");
  return { success: true };
}

export async function deletePlaylistAction(id: string) {
  if (!isSupabaseConfigured()) {
    return { error: "MISSING CONFIGURATION" };
  }

  const guard = await getAuthenticatedAdmin();
  if (guard.status !== "authenticated") {
    return { error: "Quyền truy cập bị từ chối." };
  }

  const supabase = getAdminSupabase() || (await getServerSupabase());
  if (!supabase) return { error: "Lỗi kết nối Supabase." };

  const { error } = await supabase.from("playlists").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/music/playlists");
  return { success: true };
}
