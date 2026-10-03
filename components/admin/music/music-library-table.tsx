"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Edit2,
  FileAudio,
  Globe,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import {
  deleteTrackAction,
  setTrackStatusAction,
} from "@/app/admin/actions/music-actions";
import type { ContentStatus, TrackRow } from "@/lib/supabase/types";

export function MusicLibraryTable({
  initialTracks,
  isConfigured,
}: {
  initialTracks: TrackRow[];
  isConfigured: boolean;
}) {
  const [tracks, setTracks] = useState<TrackRow[]>(initialTracks);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "artist">("newest");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const [isPending, startTransition] = useTransition();

  // Audio preview handler
  const handleTogglePreview = (track: TrackRow) => {
    if (playingTrackId === track.id) {
      audioElement?.pause();
      setPlayingTrackId(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(track.audio_url);
    audio.play().catch(() => {});
    audio.onended = () => setPlayingTrackId(null);
    setAudioElement(audio);
    setPlayingTrackId(track.id);
  };

  const handleStatusChange = (trackId: string, newStatus: ContentStatus) => {
    startTransition(async () => {
      const res = await setTrackStatusAction(trackId, newStatus);
      if (res.success) {
        setTracks((prev) =>
          prev.map((t) => (t.id === trackId ? { ...t, status: newStatus } : t))
        );
      }
    });
  };

  const handleDelete = (trackId: string, trackTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bản nhạc "${trackTitle}"? Hành động này sẽ xóa cả tệp trong Storage.`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteTrackAction(trackId);
      if (res.success) {
        if (playingTrackId === trackId) {
          audioElement?.pause();
          setPlayingTrackId(null);
        }
        setTracks((prev) => prev.filter((t) => t.id !== trackId));
      }
    });
  };

  // Filter & Sort
  const filteredTracks = tracks
    .filter((track) => {
      if (statusFilter !== "all" && track.status !== statusFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        track.title.toLowerCase().includes(term) ||
        track.artist.toLowerCase().includes(term) ||
        (track.album && track.album.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "artist") return a.artist.localeCompare(b.artist);
      return 0;
    });

  return (
    <div>
      {/* Controls Bar: Search, Filters, Sort, Upload CTA */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.4,
              }}
            />
            <input
              type="text"
              placeholder="Tìm theo tên bài, nghệ sĩ, album..."
              className={styles.formInput}
              style={{ paddingLeft: 36, height: 38, fontSize: "0.8rem" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className={styles.formSelect}
            style={{ width: "auto", height: 38, fontSize: "0.8rem" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã phát hành</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Lưu trữ</option>
          </select>

          <select
            className={styles.formSelect}
            style={{ width: "auto", height: 38, fontSize: "0.8rem" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="title">Tên bài hát</option>
            <option value="artist">Nghệ sĩ</option>
          </select>
        </div>

        <Link
          href="/admin/music/upload"
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ height: 38 }}
        >
          <Plus size={15} />
          <span>Tải lên nhạc</span>
        </Link>
      </div>

      {/* Table view */}
      {filteredTracks.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 44 }}>Phát</th>
                <th style={{ width: 48 }}>Bìa</th>
                <th>Tiêu đề & Album</th>
                <th>Nghệ sĩ</th>
                <th>Thời lượng</th>
                <th>Định dạng</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTracks.map((track) => {
                const isPlaying = playingTrackId === track.id;
                return (
                  <tr key={track.id}>
                    <td>
                      <button
                        onClick={() => handleTogglePreview(track)}
                        aria-label={isPlaying ? "Dừng nghe thử" : "Nghe thử"}
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                        style={{ width: 32, height: 32, padding: 0 }}
                      >
                        {isPlaying ? (
                          <Pause size={13} style={{ color: "var(--v2-accent, #a78bfa)" }} />
                        ) : (
                          <Play size={13} />
                        )}
                      </button>
                    </td>

                    <td>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 4,
                          background: "#181820",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          border: "1px solid var(--v2-line, rgba(255, 255, 255, 0.08))",
                        }}
                      >
                        {track.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={track.cover_url}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <FileAudio size={16} style={{ opacity: 0.4 }} />
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 500 }}>
                        <Link
                          href={`/admin/music/${track.id}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {track.title}
                        </Link>
                      </div>
                      {track.album ? (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--v2-text-tertiary, rgba(237, 234, 242, 0.45))",
                            marginTop: 2,
                          }}
                        >
                          {track.album}
                        </div>
                      ) : null}
                    </td>

                    <td style={{ color: "var(--v2-text-secondary, #9895a3)" }}>
                      {track.artist}
                    </td>

                    <td style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem" }}>
                      {Math.floor(track.duration / 60)}:
                      {String(track.duration % 60).padStart(2, "0")}
                    </td>

                    <td
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        color: "var(--v2-text-tertiary, rgba(237, 234, 242, 0.45))",
                      }}
                    >
                      {track.format || "MP3"}
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
                        {track.status === "published"
                          ? "Đã phát hành"
                          : track.status === "draft"
                          ? "Bản nháp"
                          : "Lưu trữ"}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Link
                          href={`/admin/music/${track.id}`}
                          className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                          title="Chỉnh sửa chi tiết"
                        >
                          <Edit2 size={12} />
                          <span>Sửa</span>
                        </Link>

                        {track.status === "published" ? (
                          <button
                            onClick={() => handleStatusChange(track.id, "draft")}
                            disabled={isPending}
                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                            title="Chuyển thành bản nháp"
                          >
                            <span>Hạ bài</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(track.id, "published")}
                            disabled={isPending}
                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                            title="Xuất bản lên /music"
                          >
                            <Globe size={11} />
                            <span>Phát hành</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(track.id, track.title)}
                          disabled={isPending}
                          className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                          title="Xóa bản nhạc"
                          style={{ padding: "6px 8px" }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className={styles.panel}
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "var(--v2-text-tertiary, rgba(237, 234, 242, 0.45))",
          }}
        >
          <FileAudio size={36} style={{ margin: "0 auto 12px auto", opacity: 0.3 }} />
          <h3 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "1rem" }}>
            {searchTerm || statusFilter !== "all"
              ? "Không tìm thấy bài hát nào phù hợp với bộ lọc"
              : "Thư viện âm nhạc chưa có bài hát nào"}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.78rem",
              margin: "0 0 20px 0",
            }}
          >
            {isConfigured
              ? "Bắt đầu bằng cách kéo thả tệp âm thanh vào trang Tải lên."
              : "Cần cấu hình Supabase để lưu trữ và quản lý bài hát."}
          </p>
          {isConfigured ? (
            <Link
              href="/admin/music/upload"
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              <Plus size={14} />
              <span>Tải lên bài hát đầu tiên</span>
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
