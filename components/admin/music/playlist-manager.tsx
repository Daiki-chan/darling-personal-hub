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
          <Plus size={13} />
          <span>Tạo danh sách phát mới</span>
        </button>
      </div>

      {showCreateModal ? (
        <form
          onSubmit={handleCreate}
          className={styles.panel}
          style={{ marginBottom: 24, border: "1px solid var(--adm-line-medium)" }}
        >
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>
              [ TẠO DANH SÁCH PHÁT MỚI ]
            </h3>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tên danh sách phát *</label>
            <input
              required
              type="text"
              className={styles.formInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Midnight Ambient Archive"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mô tả</label>
            <input
              type="text"
              className={styles.formInput}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả tuyển tập âm thanh..."
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <input
              id="playlist-public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{ accentColor: "#ffffff" }}
            />
            <label
              htmlFor="playlist-public"
              style={{
                fontSize: "0.78rem",
                fontFamily: "var(--font-mono), monospace",
                cursor: "pointer",
                color: "var(--adm-text-secondary)",
              }}
            >
              CÔNG KHAI TRÊN KÊNH /MUSIC
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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
              {isPending ? "Đang tạo..." : "Xác nhận tạo danh sách"}
            </button>
          </div>
        </form>
      ) : null}

      {playlists.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>TÊN DANH SÁCH</th>
                <th>MÔ TẢ</th>
                <th>HIỂN THỊ</th>
                <th>NGÀY TẠO</th>
                <th style={{ textAlign: "right" }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {playlists.map((playlist) => (
                <tr key={playlist.id}>
                  <td style={{ fontWeight: 500 }}>{playlist.name}</td>
                  <td style={{ color: "var(--adm-text-secondary)" }}>
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
                      {playlist.is_public ? "● PUBLIC" : "○ PRIVATE"}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.74rem" }}>
                    {new Date(playlist.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(playlist.id, playlist.name)}
                      disabled={isPending}
                      className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                      title="Xóa danh sách phát"
                      style={{ padding: "5px 7px" }}
                    >
                      <Trash2 size={11} />
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
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "var(--adm-text-muted)",
          }}
        >
          <ListMusic size={32} style={{ margin: "0 auto 12px auto", opacity: 0.3 }} />
          <h3 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "0.95rem", fontFamily: "var(--font-mono), monospace" }}>
            CHƯA CÓ DANH SÁCH PHÁT NÀO
          </h3>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.74rem",
              margin: 0,
              color: "var(--adm-text-muted)",
            }}
          >
            Tạo tuyển tập đầu tiên để gom nhóm các bài hát theo concept.
          </p>
        </div>
      )}
    </div>
  );
}
