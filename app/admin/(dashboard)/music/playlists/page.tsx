import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { PlaylistManager } from "@/components/admin/music/playlist-manager";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";
import type { PlaylistRow } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Danh sách phát | Darling Admin",
  description: "Quản lý tuyển tập và danh sách bài hát cá nhân",
};

export default async function AdminPlaylistsPage() {
  const isConfigured = isSupabaseConfigured();
  let playlists: PlaylistRow[] = [];

  if (isConfigured) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) playlists = data;
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageHeaderIndex}>02 · AUDIO ARCHIVE // PLAYLIST MATRIX</div>
          <h1 className={styles.pageHeaderTitle}>Danh sách phát</h1>
          <p className={styles.pageHeaderSub}>
            QUẢN LÝ CÁC DANH SÁCH BÀI HÁT THEO CHỦ ĐỀ & TUYỂN TẬP
          </p>
        </div>
        <div className={styles.pageHeaderActions}>
          <Link
            href="/admin/music"
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <ArrowLeft size={13} />
            <span>Thư viện nhạc</span>
          </Link>
        </div>
      </div>

      <PlaylistManager initialPlaylists={playlists} isConfigured={isConfigured} />
    </div>
  );
}
