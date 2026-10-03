import type { Metadata } from "next";
import { Film, Image as ImageIcon } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { GAME_MEMORIES } from "@/lib/memories-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Quản lý Ký ức (Memories) | Darling Admin",
  description: "Cơ sở dữ liệu lưu trữ ảnh ký ức Game và Địa điểm",
};

export default async function AdminMemoriesPage() {
  const isConfigured = isSupabaseConfigured();
  let dbMemories: Array<{
    id: string;
    title: string;
    subject: string;
    image_url: string;
    status: string;
    year: string | null;
  }> = [];

  if (isConfigured) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data } = await supabase
        .from("memories")
        .select("id, title, subject, image_url, status, year")
        .order("created_at", { ascending: false });
      if (data) dbMemories = data;
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageHeaderTitle}>Ký ức số (Memories CMS)</h1>
          <p className={styles.pageHeaderSub}>
            HỆ THỐNG LƯU TRỮ THEMATIC ARCHIVE (GAME & ĐỊA ĐIỂM)
          </p>
        </div>
      </div>

      <div className={styles.panel} style={{ marginBottom: 28 }}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            <Film size={15} style={{ color: "var(--v2-accent, #a78bfa)" }} />
            <span>Ký ức Hiện hành trên Website (Baseline Static Dataset)</span>
          </h2>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem", opacity: 0.6 }}>
            {GAME_MEMORIES.length} FRAGMENTS
          </span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 60 }}>Ảnh</th>
                <th>Mã / Tiêu đề</th>
                <th>Chủ đề</th>
                <th>Năm</th>
                <th>Tỉ lệ</th>
                <th>Thang hiển thị</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {GAME_MEMORIES.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div
                      style={{
                        width: 44,
                        height: 30,
                        borderRadius: 4,
                        overflow: "hidden",
                        background: "#181820",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    <div>{item.title}</div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontFamily: "var(--font-mono), monospace",
                        color: "var(--v2-text-tertiary, rgba(237, 234, 242, 0.45))",
                      }}
                    >
                      {item.id} · {item.gameTitle}
                    </div>
                  </td>
                  <td style={{ textTransform: "uppercase", fontSize: "0.75rem" }}>
                    {item.subject}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem" }}>
                    {item.year || item.date || "—"}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem" }}>
                    {item.aspectRatio}
                  </td>
                  <td style={{ textTransform: "capitalize", fontSize: "0.75rem" }}>
                    {item.editorialScale}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles.statusPublished}`}>
                      PUBLISHED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database records */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            <ImageIcon size={15} style={{ color: "var(--v2-accent, #a78bfa)" }} />
            <span>Ký ức Bổ sung từ Supabase PostgreSQL</span>
          </h2>
        </div>

        {dbMemories.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Chủ đề</th>
                  <th>Năm</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {dbMemories.map((m) => (
                  <tr key={m.id}>
                    <td>{m.title}</td>
                    <td>{m.subject}</td>
                    <td>{m.year || "—"}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles.statusPublished}`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.8rem",
              color: "var(--v2-text-tertiary, rgba(237, 234, 242, 0.45))",
              margin: 0,
            }}
          >
            {isConfigured
              ? "Chưa có bản ghi ký ức bổ sung nào trong PostgreSQL. Bảng 'memories' đã sẵn sàng trong migration schema."
              : "Hạ tầng bảng 'memories' đã được thiết kế sẵn sàng trong migration schema và sẽ kết nối khi cấu hình Supabase."}
          </p>
        )}
      </div>
    </div>
  );
}
