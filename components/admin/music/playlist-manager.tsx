"use client";

import { useState, useTransition } from "react";
import { ListMusic, Plus, Trash2 } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import {
  createPlaylistAction,
  deletePlaylistAction,
} from "@/app/admin/actions/playlist-actions";
import type { PlaylistRow } from "@/lib/supabase/types";

export function PlaylistManager({
  initialPlaylists,
  isConfigured,
}: {
  initialPlaylists: PlaylistRow[];
  isConfigured: boolean;
}) {
  const [playlists, setPlaylists] = useState<PlaylistRow[]>(initialPlaylists);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("isPublic", String(isPublic));

      const res = await createPlaylistAction(formData);
      if (res.success) {
        setName("");
        setDescription("");
        setShowCreateModal(false);
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string, playlistName: string) => {
    if (!confirm(`Xóa danh sách phát "${playlistName}"?`)) return;

    startTransition(async () => {
      const res = await deletePlaylistAction(id);
      if (res.success) {
        setPlaylists((prev) => prev.filter((p) => p.id !== id));
      }
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button
          onClick={() => setShowCreateModal(true)}
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={!isConfigured}
        >
          <Plus size={14} />
          <span>Tạo danh sách phát mới</span>
        </button>
      </div>

      {showCreateModal ? (
        <form
          onSubmit={handleCreate}
          className={styles.panel}
          style={{ marginBottom: 24 }}
        >
          <h3 className={styles.panelTitle} style={{ marginBottom: 16 }}>
            Tạo Danh sách phát mới
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tên danh sách phát *</label>
            <input
              required
              type="text"
              className={styles.formInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Night Ambient Selects"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mô tả</label>
            <input
              type="text"
              className={styles.formInput}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả danh sách phát..."
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <input
              id="playlist-public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label htmlFor="playlist-public" style={{ fontSize: "0.82rem", cursor: "pointer" }}>
              Công khai trên /music
            </label>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              {isPending ? "Đang tạo..." : "Tạo danh sách"}
            </button>
          </div>
        </form>
      ) : null}

      {playlists.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên danh sách</th>
                <th>Mô tả</th>
                <th>Hiển thị</th>
                <th>Tạo lúc</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {playlists.map((playlist) => (
                <tr key={playlist.id}>
                  <td style={{ fontWeight: 600 }}>{playlist.name}</td>
                  <td style={{ color: "var(--v2-text-secondary, #9895a3)" }}>
                    {playlist.description || "—"}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        playlist.is_public
                          ? styles.statusPublished
                          : styles.statusDraft
                      }`}
                    >
                      {playlist.is_public ? "Công khai" : "Riêng tư"}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem" }}>
                    {new Date(playlist.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(playlist.id, playlist.name)}
                      disabled={isPending}
                      className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                    >
                      <Trash2 size={12} />
                      <span>Xóa</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className={styles.panel}
          style={{ textAlign: "center", padding: 48, color: "var(--v2-text-tertiary, rgba(237, 234, 242, 0.45))" }}
        >
          <ListMusic size={36} style={{ margin: "0 auto 12px auto", opacity: 0.3 }} />
          <h3 style={{ color: "#ffffff", margin: "0 0 6px 0" }}>Chưa có danh sách phát nào</h3>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.78rem", margin: 0 }}>
            {isConfigured
              ? "Tạo danh sách phát mới để nhóm các bài hát trong cơ sở dữ liệu."
              : "Cần cấu hình Supabase để lưu trữ danh sách phát."}
          </p>
        </div>
      )}
    </div>
  );
}
