import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { MusicEditorForm } from "@/components/admin/music/music-editor-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Chỉnh sửa Bài hát | Darling Admin",
  description: "Biên tập siêu dữ liệu và kiểm tra tệp âm thanh",
};

export default async function MusicEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isConfigured = isSupabaseConfigured();

  if (!isConfigured) {
    return (
      <div className={styles.panel} style={{ textAlign: "center", padding: 48 }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", color: "var(--adm-text-secondary)" }}>
          Cần kết nối Supabase để mở bài hát.
        </p>
      </div>
    );
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    notFound();
  }

  const { data: track, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !track) {
    return (
      <div className={styles.panel} style={{ textAlign: "center", padding: 48 }}>
        <h2 style={{ color: "#ffffff", marginBottom: 12, fontFamily: "var(--font-mono), monospace", fontSize: "1.1rem" }}>
          [ KHÔNG TÌM THẤY BẢN NHẠC ]
        </h2>
        <p style={{ color: "var(--adm-text-secondary)", marginBottom: 20, fontFamily: "var(--font-mono), monospace", fontSize: "0.8rem" }}>
          Bản ghi với ID <code>{id}</code> không tồn tại hoặc đã bị xóa khỏi hệ thống.
        </p>
        <Link href="/admin/music" className={`${styles.btn} ${styles.btnPrimary}`}>
          <ArrowLeft size={13} />
          <span>Quay lại Thư viện</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageHeaderIndex}>02 · AUDIO ARCHIVE // METADATA EDITOR</div>
          <h1 className={styles.pageHeaderTitle}>{track.title}</h1>
          <p className={styles.pageHeaderSub}>
            NGHỆ SĨ: {track.artist} · ID: {track.id}
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

      <MusicEditorForm track={track} />
    </div>
  );
}
