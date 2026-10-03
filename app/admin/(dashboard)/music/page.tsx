import type { Metadata } from "next";
import Link from "next/link";
import { UploadCloud } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { MusicLibraryTable } from "@/components/admin/music/music-library-table";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";
import type { TrackRow } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Thư viện Âm nhạc | Darling Admin",
  description: "Quản lý các bản ghi âm nhạc lưu trữ trong Supabase PostgreSQL & Storage",
};

export default async function MusicLibraryPage() {
  const isConfigured = isSupabaseConfigured();
  let tracks: TrackRow[] = [];

  if (isConfigured) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        tracks = data;
      }
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageHeaderIndex}>02 · AUDIO ARCHIVE</div>
          <h1 className={styles.pageHeaderTitle}>Thư viện Âm nhạc</h1>
          <p className={styles.pageHeaderSub}>
            TỔNG SỐ {tracks.length} BẢN GHI TRONG CƠ SỞ DỮ LIỆU SUPABASE
          </p>
        </div>
        <div className={styles.pageHeaderActions}>
          <Link
            href="/admin/music/upload"
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <UploadCloud size={14} />
            <span>Tải lên audio mới</span>
          </Link>
        </div>
      </div>

      <MusicLibraryTable initialTracks={tracks} isConfigured={isConfigured} />
    </div>
  );
}
