import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Film,
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

  let totalTracks = "N/A";
  let publishedTracks = "N/A";
  let draftTracks = "N/A";
  let totalMemories = "N/A";
  const totalProjects = "7 (Baseline)";
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
      <div className={styles.pageHeader}>
        <div>
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
            <UploadCloud size={15} />
            <span>Tải lên audio mới</span>
          </Link>
          <Link
            href="/admin/music"
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <Music2 size={15} />
            <span>Thư viện nhạc</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng bản ghi audio</div>
          <div className={styles.statValue}>{totalTracks}</div>
          <div className={styles.statSub}>
            <Music2 size={12} />
            <span>{isConfigured ? `${publishedTracks} đã phát hành` : "Cần kết nối Supabase"}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Bản nháp chờ duyệt</div>
          <div className={styles.statValue}>{draftTracks}</div>
          <div className={styles.statSub}>
            <Radio size={12} />
            <span>{isConfigured ? "Chỉ hiển thị trong admin" : "N/A"}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Ký ức số (Memories)</div>
          <div className={styles.statValue}>{totalMemories}</div>
          <div className={styles.statSub}>
            <Film size={12} />
            <span>{isConfigured ? "Game & Địa điểm" : "Đang dùng static dataset"}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Hồ sơ Case Study</div>
          <div className={styles.statValue}>{totalProjects}</div>
          <div className={styles.statSub}>
            <Layers size={12} />
            <span>Bảo toàn cấu trúc hiện hành</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Trạng thái Supabase</div>
          <div
            className={styles.statValue}
            style={{
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: isConfigured ? "#4ade80" : "#fbbf24",
              marginTop: 6,
            }}
          >
            {isConfigured ? (
              <>
                <CheckCircle2 size={18} />
                <span>KẾT NỐI SẴN SÀNG</span>
              </>
            ) : (
              <>
                <AlertCircle size={18} />
                <span>CHƯA CẤU HÌNH</span>
              </>
            )}
          </div>
          <div className={styles.statSub}>
            <Database size={12} />
            <span>{isConfigured ? "PostgreSQL & RLS Active" : "Xem thẻ thông báo bên trên"}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Architecture Flow */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24 }}>
        {/* Recent Tracks Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Music2 size={15} style={{ color: "var(--v2-accent, #a78bfa)" }} />
              <span>Bản nhạc tải lên gần đây</span>
            </h2>
            <Link
              href="/admin/music"
              className={styles.publicSiteLink}
              style={{ fontSize: "0.74rem" }}
            >
              <span>Xem tất cả</span>
              <ArrowUpRight size={12} />
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
                      <td style={{ color: "var(--v2-text-secondary, #9895a3)" }}>
                        {track.artist}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono), monospace" }}>
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
                          {track.status}
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
                color: "var(--v2-text-tertiary, rgba(237, 234, 242, 0.45))",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.8rem",
              }}
            >
              <p style={{ margin: "0 0 12px 0" }}>
                {isConfigured
                  ? "Chưa có bản ghi âm nhạc nào trong cơ sở dữ liệu."
                  : "Chưa cấu hình Supabase — dữ liệu bản ghi chưa thể truy vấn."}
              </p>
              {isConfigured ? (
                <Link
                  href="/admin/music/upload"
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                >
                  <UploadCloud size={13} />
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
              <Sparkles size={15} style={{ color: "var(--v2-accent, #a78bfa)" }} />
              <span>Kiến trúc dữ liệu / Data Flow</span>
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.78rem",
              lineHeight: 1.6,
            }}
          >
            <div
              style={{
                padding: 14,
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--v2-line, rgba(255, 255, 255, 0.06))",
              }}
            >
              <div style={{ color: "#ffffff", fontWeight: 600, marginBottom: 4 }}>
                1. /admin/music/upload
              </div>
              <div style={{ color: "var(--v2-text-secondary, #9895a3)" }}>
                Audio file được tải lên bucket <code>audio</code> trên Supabase Storage. File artwork tải lên bucket <code>covers</code>.
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--v2-line, rgba(255, 255, 255, 0.06))",
              }}
            >
              <div style={{ color: "#ffffff", fontWeight: 600, marginBottom: 4 }}>
                2. PostgreSQL / Row Level Security (RLS)
              </div>
              <div style={{ color: "var(--v2-text-secondary, #9895a3)" }}>
                Metadata (Title, Artist, Duration, Bitrate, Storage Path, Status) lưu vào bảng <code>tracks</code>. RLS chỉ cấp quyền SELECT cho công khai với trạng thái <code>published</code>.
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--v2-line, rgba(255, 255, 255, 0.06))",
              }}
            >
              <div style={{ color: "#ffffff", fontWeight: 600, marginBottom: 4 }}>
                3. /music (/am-nhac) Consumer
              </div>
              <div style={{ color: "var(--v2-text-secondary, #9895a3)" }}>
                Trang công khai truy vấn các bản ghi <code>published</code> và phát trực tiếp qua Immersive Audio Player bằng thẻ audio HTML5 đồng bộ với YouTube stage.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
