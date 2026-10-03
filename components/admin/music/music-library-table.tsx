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
    if (!confirm(`Bạn có chắc chắn muốn xóa bản nhạc "${trackTitle}"? Hành động này sẽ xóa cả tệp trong Supabase Storage.`)) {
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
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
            <Search
              size={13}
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
              placeholder="Tìm kiếm theo tiêu đề, nghệ sĩ, album..."
              className={styles.formInput}
              style={{ paddingLeft: 34, height: 36, fontSize: "0.78rem", fontFamily: "var(--font-mono), monospace" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className={styles.formSelect}
            style={{ width: "auto", height: 36, fontSize: "0.75rem", fontFamily: "var(--font-mono), monospace" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">TẤT CẢ TRẠNG THÁI</option>
            <option value="published">ĐÃ XUẤT BẢN</option>
            <option value="draft">BẢN NHÁP</option>
            <option value="archived">LƯU TRỮ</option>
          </select>

          <select
            className={styles.formSelect}
            style={{ width: "auto", height: 36, fontSize: "0.75rem", fontFamily: "var(--font-mono), monospace" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="newest">MỚI NHẤT</option>
            <option value="oldest">CŨ NHẤT</option>
            <option value="title">TÊN BÀI HÁT (A-Z)</option>
            <option value="artist">NGHỆ SĨ (A-Z)</option>
          </select>
        </div>

        <Link
          href="/admin/music/upload"
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ height: 36 }}
        >
          <Plus size={13} />
          <span>Tải lên audio</span>
        </Link>
      </div>

      {/* Table view */}
      {filteredTracks.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 44, textAlign: "center" }}>PHÁT</th>
                <th style={{ width: 48 }}>BÌA</th>
                <th>TIÊU ĐỀ & ALBUM</th>
                <th>NGHỆ SĨ</th>
                <th>THỜI LƯỢNG</th>
                <th>ĐỊNH DẠNG</th>
                <th>TRẠNG THÁI</th>
                <th style={{ textAlign: "right" }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredTracks.map((track) => {
                const isPlaying = playingTrackId === track.id;
                return (
                  <tr key={track.id}>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleTogglePreview(track)}
                        aria-label={isPlaying ? "Dừng nghe thử" : "Nghe thử"}
                        className={`${styles.btn} ${isPlaying ? styles.btnPrimary : styles.btnSecondary} ${styles.btnSm}`}
                        style={{ width: 28, height: 28, padding: 0, borderRadius: 2 }}
                      >
                        {isPlaying ? (
                          <Pause size={12} />
                        ) : (
                          <Play size={12} />
                        )}
                      </button>
                    </td>

                    <td>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          background: "var(--adm-surface-3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          border: "1px solid var(--adm-line-subtle)",
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
                          <FileAudio size={14} style={{ opacity: 0.3 }} />
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
                            fontSize: "0.7rem",
                            fontFamily: "var(--font-mono), monospace",
                            color: "var(--adm-text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {track.album}
                        </div>
                      ) : null}
                    </td>

                    <td style={{ color: "var(--adm-text-secondary)" }}>
                      {track.artist}
                    </td>

                    <td style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.74rem" }}>
                      {Math.floor(track.duration / 60)}:
                      {String(track.duration % 60).padStart(2, "0")}
                    </td>

                    <td
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        color: "var(--adm-text-muted)",
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
                          ? "● PUBLISHED"
                          : track.status === "draft"
                          ? "○ DRAFT"
                          : "× ARCHIVED"}
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
                          title="Biên tập siêu dữ liệu chi tiết"
                        >
                          <Edit2 size={11} />
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
                          style={{ padding: "5px 7px" }}
                        >
                          <Trash2 size={11} />
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
            color: "var(--adm-text-muted)",
          }}
        >
          <FileAudio size={32} style={{ margin: "0 auto 12px auto", opacity: 0.3 }} />
          <h3 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "0.95rem", fontFamily: "var(--font-mono), monospace" }}>
            {searchTerm || statusFilter !== "all"
              ? "KHÔNG TÌM THẤY BẢN NHẠC PHÙ HỢP"
              : "KHO LƯU TRỮ ÂM THANH TRỐNG"}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.74rem",
              margin: "0 0 20px 0",
              color: "var(--adm-text-muted)",
            }}
          >
            {isConfigured
              ? "Kéo và thả tệp âm thanh vào trang Tải lên để bắt đầu lưu trữ."
              : "Cần kết nối Supabase để lưu trữ và quản lý bài hát."}
          </p>
          {isConfigured ? (
            <Link
              href="/admin/music/upload"
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              <Plus size={13} />
              <span>Tải lên bản nhạc đầu tiên</span>
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
