"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useRef, useState, useTransition } from "react";
import {
  FileAudio,
  Globe,
  ImageIcon,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import {
  deleteTrackAction,
  updateTrackAction,
} from "@/app/admin/actions/music-actions";
import type { ContentStatus, TrackRow } from "@/lib/supabase/types";

export function MusicEditorForm({ track }: { track: TrackRow }) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [album, setAlbum] = useState(track.album || "");
  const [albumArtist, setAlbumArtist] = useState(track.album_artist || "");
  const [year, setYear] = useState(track.year || "");
  const [genre, setGenre] = useState(track.genre || "");
  const [duration, setDuration] = useState(track.duration);
  const [status, setStatus] = useState<ContentStatus>(track.status);
  const [lyricsPlain, setLyricsPlain] = useState(track.lyrics_plain || "");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(track.cover_url);

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent, desiredStatus?: ContentStatus) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const targetStatus = desiredStatus || status;

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("album", album);
      formData.append("albumArtist", albumArtist);
      formData.append("year", year);
      formData.append("genre", genre);
      formData.append("duration", String(duration));
      formData.append("status", targetStatus);
      formData.append("lyricsPlain", lyricsPlain);

      if (coverFile) {
        formData.append("coverFile", coverFile);
      }

      const res = await updateTrackAction(track.id, formData);

      if (res.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setStatus(targetStatus);
        setFeedback({ type: "success", text: "Đã cập nhật siêu dữ liệu bản nhạc thành công!" });
        router.refresh();
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!confirm(`Xóa vĩnh viễn bản nhạc "${track.title}" khỏi hệ thống?`)) return;

    startTransition(async () => {
      const res = await deleteTrackAction(track.id);
      if (res.success) {
        router.push("/admin/music");
      } else {
        setFeedback({ type: "error", text: res.error || "Lỗi xóa bản nhạc." });
      }
    });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      {/* Notifications */}
      {feedback ? (
        <div
          role="alert"
          style={{
            background: "var(--adm-surface-3)",
            border: "1px solid var(--adm-line-strong)",
            color: "#ffffff",
            padding: "12px 18px",
            borderRadius: 2,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.8rem",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          <span style={{ fontWeight: 700 }}>
            {feedback.type === "success" ? "[ OK ]" : "[ ! ]"}
          </span>
          <span>{feedback.text}</span>
        </div>
      ) : null}

      <div className={styles.panel} style={{ marginBottom: 24 }}>
        <div className={styles.panelHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileAudio size={16} style={{ color: "#ffffff" }} />
            <h2 className={styles.panelTitle}>Trình phát & Tệp âm thanh gốc</h2>
          </div>
          <span
            className={`${styles.statusBadge} ${
              status === "published"
                ? styles.statusPublished
                : status === "draft"
                ? styles.statusDraft
                : styles.statusArchived
            }`}
          >
            {status === "published" ? "● PUBLISHED" : "○ DRAFT"}
          </span>
        </div>

        {/* Audio Player Preview Container */}
        <div
          style={{
            background: "var(--adm-surface-2)",
            border: "1px solid var(--adm-line-subtle)",
            borderRadius: 2,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.68rem",
              color: "var(--adm-text-muted)",
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              letterSpacing: "0.06em",
            }}
          >
            <span>SUPABASE STORAGE: {track.storage_path}</span>
            <span>ĐỊNH DẠNG: {track.format?.toUpperCase() || "MP3"}</span>
          </div>

          <audio
            controls
            src={track.audio_url}
            style={{ width: "100%", height: 36 }}
            preload="metadata"
          />
        </div>

        {/* Cover Artwork & Metadata Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 1fr",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          {/* Cover upload */}
          <div>
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: 2,
                background: "var(--adm-surface-3)",
                border: "1px solid var(--adm-line-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {coverPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverPreview}
                  alt="Track cover"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <ImageIcon size={36} style={{ opacity: 0.3 }} />
              )}
            </div>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleCoverChange}
            />

            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
              style={{ width: "100%", marginTop: 10 }}
            >
              <ImageIcon size={11} />
              <span>Đổi ảnh bìa</span>
            </button>
          </div>

          {/* Core Fields */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-title">
                Tiêu đề bài hát *
              </label>
              <input
                id="edit-title"
                required
                type="text"
                className={styles.formInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-artist">
                Nghệ sĩ biểu diễn *
              </label>
              <input
                id="edit-artist"
                required
                type="text"
                className={styles.formInput}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-album">
                Album / Tuyển tập
              </label>
              <input
                id="edit-album"
                type="text"
                className={styles.formInput}
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-album-artist">
                Nghệ sĩ Album
              </label>
              <input
                id="edit-album-artist"
                type="text"
                className={styles.formInput}
                value={albumArtist}
                onChange={(e) => setAlbumArtist(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-genre">
                Thể loại âm nhạc
              </label>
              <input
                id="edit-genre"
                type="text"
                className={styles.formInput}
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-year">
                Năm phát hành
              </label>
              <input
                id="edit-year"
                type="text"
                className={styles.formInput}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-duration">
                Thời lượng (giây)
              </label>
              <input
                id="edit-duration"
                type="number"
                min="0"
                className={styles.formInput}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value || "0", 10))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-status">
                Trạng thái hiển thị *
              </label>
              <select
                id="edit-status"
                className={styles.formSelect}
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
              >
                <option value="published">Xuất bản công khai (Hiển thị tại /music)</option>
                <option value="draft">Bản nháp (Chỉ lưu trữ trong Admin)</option>
                <option value="archived">Lưu trữ (Ẩn khỏi công khai)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lyrics */}
        <div className={styles.formGroup} style={{ marginTop: 24 }}>
          <label className={styles.formLabel} htmlFor="edit-lyrics">
            Lời bài hát (Plain text lyrics)
          </label>
          <textarea
            id="edit-lyrics"
            className={styles.formTextarea}
            rows={5}
            value={lyricsPlain}
            onChange={(e) => setLyricsPlain(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid var(--adm-line-hairline)",
          }}
        >
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving || isPending}
            className={`${styles.btn} ${styles.btnDanger}`}
          >
            <Trash2 size={12} />
            <span>Xóa bài hát</span>
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => router.push("/admin/music")}
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              <span>Hủy thay đổi</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              {isSaving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              <span>Lưu thông tin</span>
            </button>

            {status !== "published" ? (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, "published")}
                disabled={isSaving}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                <Globe size={12} />
                <span>Lưu & Xuất bản ngay</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
