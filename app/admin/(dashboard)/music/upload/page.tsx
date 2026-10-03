import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { MusicDropzone } from "@/components/admin/music/music-dropzone";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Tải lên Âm nhạc | Darling Admin",
  description: "Tải lên tệp âm thanh vào Supabase Storage và lưu trữ siêu dữ liệu",
};

export default function MusicUploadPage() {
  const isConfigured = isSupabaseConfigured();

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageHeaderTitle}>Tải lên Âm thanh</h1>
          <p className={styles.pageHeaderSub}>
            SUPABASE STORAGE PIPELINE · HỖ TRỢ MP3, FLAC, WAV, M4A, OGG
          </p>
        </div>
        <div className={styles.pageHeaderActions}>
          <Link
            href="/admin/music"
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <ArrowLeft size={14} />
            <span>Thư viện nhạc</span>
          </Link>
        </div>
      </div>

      <MusicDropzone isConfigured={isConfigured} />
    </div>
  );
}
