import Link from "next/link";
import {
  ArrowUpRight,
  Database,
  Film,
  HardDrive,
  Layers,
  Music2,
  Radio,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const isConfigured = isSupabaseConfigured();

  let totalTracks = "—";
  let publishedTracks = "0";
  let draftTracks = "0";
  let totalMemories = "—";
  const totalProjects = "7";
  let recentTracks: Array<{
    id: string;
    title: string;
    artist: string;
    album: string | null;
    status: string;
    created_at: string;
    duration: number;
  }> = [];

  if (isConfigured) {
    const supabase = await getServerSupabase();
    if (supabase) {
      // Fetch tracks count
      const { count: tCount } = await supabase
        .from("tracks")
        .select("*", { count: "exact", head: true });
      totalTracks = tCount !== null ? String(tCount) : "0";

      // Fetch published tracks count
      const { count: pCount } = await supabase
        .from("tracks")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");
      publishedTracks = pCount !== null ? String(pCount) : "0";

      // Fetch draft tracks count
      const { count: dCount } = await supabase
        .from("tracks")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft");
      draftTracks = dCount !== null ? String(dCount) : "0";

      // Fetch memories count
      const { count: mCount } = await supabase
        .from("memories")
        .select("*", { count: "exact", head: true });
      totalMemories = mCount !== null ? String(mCount) : "0";

      // Fetch recent tracks
      const { data: recents } = await supabase
        .from("tracks")
        .select("id, title, artist, album, status, created_at, duration")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recents) {
        recentTracks = recents;
      }
    }
  }

  return (
    <div>
      {/* Editorial Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageHeaderIndex}>01 · SYSTEM OVERVIEW</div>
          <h1 className={styles.pageHeaderTitle}>Tổng quan Hệ thống</h1>
          <p className={styles.pageHeaderSub}>
            HẠ TẦNG QUẢN TRỊ NỘI DUNG SỐ & LUỒNG PHÁT HÀNH ÂM NHẠC
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
          <Link
            href="/admin/music"
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <Music2 size={14} />
            <span>Thư viện nhạc</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span>01 · TỔNG AUDIO ARCHIVE</span>
            <Music2 size={12} style={{ opacity: 0.4 }} />
          </div>
          <div className={styles.statValue}>{totalTracks}</div>
          <div className={styles.statSub}>
            <span className={styles.statusDot} />
            <span>{isConfigured ? `${publishedTracks} đã xuất bản công khai` : "Yêu cầu kết nối Supabase"}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span>02 · BẢN NHÁP (DRAFT)</span>
            <Radio size={12} style={{ opacity: 0.4 }} />
          </div>
          <div className={styles.statValue}>{draftTracks}</div>
          <div className={styles.statSub}>
            <span className={styles.statusDotMuted} />
            <span>{isConfigured ? "Chỉ lưu trữ trong Admin" : "Chưa kích hoạt"}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span>03 · KÝ ỨC SỐ (MEMORIES)</span>
            <Film size={12} style={{ opacity: 0.4 }} />
          </div>
          <div className={styles.statValue}>{totalMemories === "—" ? "4" : totalMemories}</div>
          <div className={styles.statSub}>
            <span>Baseline game & địa điểm</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span>04 · HỒ SƠ CASE STUDY</span>
            <Layers size={12} style={{ opacity: 0.4 }} />
          </div>
          <div className={styles.statValue}>{totalProjects}</div>
          <div className={styles.statSub}>
            <span>Dự án kỹ thuật hiện hành</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span>05 · TRẠNG THÁI SUPABASE</span>
            <Database size={12} style={{ opacity: 0.4 }} />
          </div>
          <div
            className={styles.statValue}
            style={{
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              letterSpacing: "0.04em",
              marginTop: 4,
            }}
          >
            {isConfigured ? (
              <>
                <span className={styles.statusDot} />
                <span>ONLINE / ACTIVE</span>
              </>
            ) : (
              <>
                <span className={styles.statusDotMuted} />
                <span>STANDBY / REQ CONFIG</span>
              </>
            )}
          </div>
          <div className={styles.statSub}>
            <span>{isConfigured ? "PostgreSQL & RLS Active" : "Xem thẻ cấu hình hệ thống"}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Architecture Flow */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 20 }}>
        {/* Recent Tracks Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Music2 size={14} style={{ color: "#ffffff" }} />
              <span>Bản nhạc tải lên gần đây</span>
            </h2>
            <Link
              href="/admin/music"
              className={styles.publicSiteLink}
              style={{ fontSize: "0.68rem" }}
            >
              <span>Xem toàn bộ</span>
              <ArrowUpRight size={11} />
            </Link>
          </div>

          {recentTracks.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Nghệ sĩ</th>
                    <th>Thời lượng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTracks.map((track) => (
                    <tr key={track.id}>
                      <td style={{ fontWeight: 500 }}>
                        <Link
                          href={`/admin/music/${track.id}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {track.title}
                        </Link>
                      </td>
                      <td style={{ color: "var(--adm-text-secondary)" }}>
                        {track.artist}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem" }}>
                        {Math.floor(track.duration / 60)}:
                        {String(track.duration % 60).padStart(2, "0")}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            track.status === "published"
                              ? styles.statusPublished
                              : track.status === "draft"
                              ? styles.statusDraft
                              : styles.statusArchived
                          }`}
                        >
                          {track.status === "published" ? "● PUBLISHED" : "○ DRAFT"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                padding: "36px 20px",
                textAlign: "center",
                color: "var(--adm-text-muted)",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.78rem",
              }}
            >
              <p style={{ margin: "0 0 16px 0" }}>
                {isConfigured
                  ? "Chưa có bản ghi âm nhạc nào trong kho lưu trữ."
                  : "Chưa kết nối Supabase — dữ liệu bản ghi chưa thể truy vấn."}
              </p>
              {isConfigured ? (
                <Link
                  href="/admin/music/upload"
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                >
                  <UploadCloud size={12} />
                  <span>Tải lên bản nhạc đầu tiên</span>
                </Link>
              ) : null}
            </div>
          )}
        </div>

        {/* Architecture Flow Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Sparkles size={14} style={{ color: "#ffffff" }} />
              <span>Kiến trúc dữ liệu / Data Flow</span>
            </h2>
            <span className={styles.panelMeta}>ARCHITECTURE V1</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.74rem",
              lineHeight: 1.6,
            }}
          >
            <div
              style={{
                padding: 12,
                borderRadius: 2,
                background: "var(--adm-surface-2)",
                border: "1px solid var(--adm-line-hairline)",
              }}
            >
              <div style={{ color: "#ffffff", fontWeight: 600, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <HardDrive size={12} />
                <span>[01] INGESTION CONSOLE (/admin/music/upload)</span>
              </div>
              <div style={{ color: "var(--adm-text-secondary)" }}>
                Audio binary truyền trực tiếp vào bucket <code>audio</code> (Max 50MB/file). Artwork lưu trữ trong bucket <code>covers</code> (Max 10MB/file).
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 2,
                background: "var(--adm-surface-2)",
                border: "1px solid var(--adm-line-hairline)",
              }}
            >
              <div style={{ color: "#ffffff", fontWeight: 600, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <Database size={12} />
                <span>[02] STORAGE & RLS MATRIX (public.tracks)</span>
              </div>
              <div style={{ color: "var(--adm-text-secondary)" }}>
                Metadata (Title, Artist, Duration, Bitrate, Storage Path, Status) lưu trữ an toàn trong PostgreSQL. RLS chỉ cấp quyền SELECT cho khách với trạng thái <code>published</code>.
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 2,
                background: "var(--adm-surface-2)",
                border: "1px solid var(--adm-line-hairline)",
              }}
            >
              <div style={{ color: "#ffffff", fontWeight: 600, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <Music2 size={12} />
                <span>[03] CONSUMER PIPELINE (/music & /am-nhac)</span>
              </div>
              <div style={{ color: "var(--adm-text-secondary)" }}>
                Trang công khai fetch trực tiếp danh sách nhạc đã phát hành và phát thông qua HTML5 Audio player, đồng bộ state mượt mà với YouTube stage.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
