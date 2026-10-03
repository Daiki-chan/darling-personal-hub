"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import {
  Check,
  FileAudio,
  ImageIcon,
  Loader2,
  RotateCcw,
  UploadCloud,
  X,
} from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { uploadTrackAction } from "@/app/admin/actions/music-actions";

type UploadStatus = "idle" | "reading" | "ready" | "uploading" | "success" | "error";

interface DetectedMetadata {
  file: File;
  name: string;
  size: number;
  format: string;
  duration: number;
  title: string;
  artist: string;
  album: string;
  year: string;
  genre: string;
  coverFile: File | null;
  coverPreviewUrl: string | null;
}

export function MusicDropzone({ isConfigured }: { isConfigured: boolean }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successTrackId, setSuccessTrackId] = useState<string | null>(null);

  const [meta, setMeta] = useState<DetectedMetadata | null>(null);
  const [statusValue, setStatusValue] = useState<"draft" | "published">("published");
  const [lyricsPlain, setLyricsPlain] = useState("");

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processAudioFile = async (file: File) => {
    setErrorMessage(null);
    setStatus("reading");

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    // Read audio duration using HTML5 Audio object
    let duration = 0;
    try {
      const objectUrl = URL.createObjectURL(file);
      const audio = new Audio(objectUrl);
      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => {
          duration = Math.round(audio.duration || 0);
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
      });
    } catch {
      // Fallback if audio decode fails
    }

    setMeta({
      file,
      name: file.name,
      size: file.size,
      format: ext,
      duration,
      title: cleanTitle,
      artist: "FUJIWARA DAIKI",
      album: "",
      year: new Date().getFullYear().toString(),
      genre: "Ambient / Electronic",
      coverFile: null,
      coverPreviewUrl: null,
    });

    setStatus("ready");
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processAudioFile(file);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processAudioFile(e.target.files[0]);
    }
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && meta) {
      const coverFile = e.target.files[0];
      const previewUrl = URL.createObjectURL(coverFile);
      setMeta({
        ...meta,
        coverFile,
        coverPreviewUrl: previewUrl,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meta || !isConfigured) return;

    setStatus("uploading");
    setUploadProgress(20);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("audioFile", meta.file);
      formData.append("title", meta.title);
      formData.append("artist", meta.artist);
      formData.append("album", meta.album);
      formData.append("year", meta.year);
      formData.append("genre", meta.genre);
      formData.append("duration", String(meta.duration));
      formData.append("status", statusValue);
      formData.append("lyricsPlain", lyricsPlain);

      if (meta.coverFile) {
        formData.append("coverFile", meta.coverFile);
      }

      setUploadProgress(50);

      const res = await uploadTrackAction(formData);

      if (res.error) {
        setStatus("error");
        setErrorMessage(res.error);
        return;
      }

      setUploadProgress(100);
      setStatus("success");
      setSuccessTrackId(res.data?.trackId || null);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Đã xảy ra lỗi trong quá trình tải lên máy chủ."
      );
    }
  };

  const resetAll = () => {
    setStatus("idle");
    setMeta(null);
    setUploadProgress(0);
    setErrorMessage(null);
    setSuccessTrackId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      {/* Upload Dropzone */}
      {status === "idle" || status === "reading" ? (
        <div>
          <div
            className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.flac,.wav,.m4a,.ogg"
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />

            <UploadCloud size={36} style={{ color: "#ffffff", opacity: 0.8 }} />
            <h3 className={styles.dropzoneTitle}>KÉO VÀ THẢ TỆP ÂM THANH VÀO ĐÂY</h3>
            <p className={styles.dropzoneSub}>
              hoặc nhấn để duyệt tệp từ thiết bị của bạn
            </p>
            <span className={styles.dropzoneFormats}>
              MP3 · FLAC · WAV · M4A · OGG · TỐI ĐA 100MB
            </span>
          </div>

          {status === "reading" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 16,
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.75rem",
                color: "var(--adm-text-secondary)",
              }}
            >
              <Loader2 size={14} className="animate-spin" />
              <span>[ ĐANG GIẢI MÃ THÔNG SỐ TỆP ÂM THANH... ]</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Error state */}
      {status === "error" && errorMessage ? (
        <div
          role="alert"
          style={{
            background: "var(--adm-surface-3)",
            border: "1px solid var(--adm-line-strong)",
            color: "#ffffff",
            padding: "16px 20px",
            borderRadius: 2,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 700 }}>[ ! ]</span>
            <span>LỖI TẢI LÊN: {errorMessage}</span>
          </div>
          <button
            onClick={() => setStatus("ready")}
            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
          >
            <RotateCcw size={11} />
            <span>Thử lại</span>
          </button>
        </div>
      ) : null}

      {/* Success State */}
      {status === "success" ? (
        <div
          className={styles.panel}
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "var(--adm-surface-2)",
            borderColor: "var(--adm-line-medium)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#ffffff",
              color: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
            }}
          >
            <Check size={22} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-editorial), serif",
              fontSize: "1.9rem",
              fontWeight: 400,
              color: "#ffffff",
              margin: "0 0 8px 0",
            }}
          >
            Tải lên thành công!
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.76rem",
              color: "var(--adm-text-secondary)",
              margin: "0 0 28px 0",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            BẢN GHI ĐÃ ĐƯỢC LƯU TRỮ VÀO SUPABASE STORAGE & CƠ SỞ DỮ LIỆU POSTGRESQL
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button
              onClick={resetAll}
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              <span>Tải lên bản khác</span>
            </button>
            <button
              onClick={() => router.push(successTrackId ? `/admin/music/${successTrackId}` : "/admin/music")}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              <span>Biên tập chi tiết</span>
            </button>
            <button
              onClick={() => router.push("/music")}
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              <span>Nghe trên /music</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Metadata Review & Edit Form */}
      {(status === "ready" || status === "uploading") && meta ? (
        <form onSubmit={handleSubmit} className={styles.panel}>
          <div className={styles.panelHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileAudio size={16} style={{ color: "#ffffff" }} />
              <h2 className={styles.panelTitle}>[ THÔNG TIN BIÊN TẬP BẢN NHẠC ]</h2>
            </div>
            <button
              type="button"
              onClick={resetAll}
              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
              disabled={status === "uploading"}
            >
              <X size={12} />
              <span>Hủy bỏ</span>
            </button>
          </div>

          {/* Upload progress bar if uploading */}
          {status === "uploading" ? (
            <div className={styles.uploadItem} style={{ marginBottom: 24 }}>
              <div className={styles.uploadItemHeader}>
                <span className={styles.uploadItemName}>Đang truyền dữ liệu lên Supabase Storage...</span>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem" }}>
                  {uploadProgress}%
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : null}

          {/* Form Fields Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="track-title">
                Tiêu đề bài hát *
              </label>
              <input
                id="track-title"
                required
                type="text"
                className={styles.formInput}
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                disabled={status === "uploading"}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="track-artist">
                Nghệ sĩ biểu diễn *
              </label>
              <input
                id="track-artist"
                required
                type="text"
                className={styles.formInput}
                value={meta.artist}
                onChange={(e) => setMeta({ ...meta, artist: e.target.value })}
                disabled={status === "uploading"}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="track-album">
                Album / Tuyển tập
              </label>
              <input
                id="track-album"
                type="text"
                className={styles.formInput}
                placeholder="VD: Night Drive / Single"
                value={meta.album}
                onChange={(e) => setMeta({ ...meta, album: e.target.value })}
                disabled={status === "uploading"}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="track-genre">
                Thể loại âm nhạc
              </label>
              <input
                id="track-genre"
                type="text"
                className={styles.formInput}
                value={meta.genre}
                onChange={(e) => setMeta({ ...meta, genre: e.target.value })}
                disabled={status === "uploading"}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="track-year">
                Năm phát hành
              </label>
              <input
                id="track-year"
                type="text"
                className={styles.formInput}
                value={meta.year}
                onChange={(e) => setMeta({ ...meta, year: e.target.value })}
                disabled={status === "uploading"}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="track-status">
                Trạng thái phát hành *
              </label>
              <select
                id="track-status"
                className={styles.formSelect}
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value as "draft" | "published")}
                disabled={status === "uploading"}
              >
                <option value="published">Xuất bản công khai (Hiển thị trên /music)</option>
                <option value="draft">Bản nháp (Chỉ lưu trữ trong Admin)</option>
              </select>
            </div>
          </div>

          {/* Cover image picker & file summary telemetry */}
          <div
            style={{
              marginTop: 12,
              padding: 16,
              borderRadius: 2,
              background: "var(--adm-surface-2)",
              border: "1px solid var(--adm-line-hairline)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  background: "var(--adm-surface-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "1px solid var(--adm-line-subtle)",
                }}
              >
                {meta.coverPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={meta.coverPreviewUrl}
                    alt="Cover preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <ImageIcon size={20} style={{ opacity: 0.3 }} />
                )}
              </div>

              <div>
                <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.78rem", fontWeight: 500 }}>
                  {meta.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.7rem",
                    color: "var(--adm-text-muted)",
                    marginTop: 3,
                  }}
                >
                  {(meta.size / (1024 * 1024)).toFixed(2)} MB · {meta.format.toUpperCase()} · Thời lượng: {Math.floor(meta.duration / 60)}:{String(meta.duration % 60).padStart(2, "0")}
                </div>
              </div>
            </div>

            <div>
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
                disabled={status === "uploading"}
              >
                <ImageIcon size={12} />
                <span>{meta.coverFile ? "Thay đổi ảnh bìa" : "Chọn ảnh bìa (Cover)"}</span>
              </button>
            </div>
          </div>

          {/* Plain lyrics field */}
          <div className={styles.formGroup} style={{ marginTop: 18 }}>
            <label className={styles.formLabel} htmlFor="track-lyrics">
              Lời bài hát (Plain text lyrics - tùy chọn)
            </label>
            <textarea
              id="track-lyrics"
              className={styles.formTextarea}
              placeholder="Nhập lời bài hát tại đây nếu có..."
              value={lyricsPlain}
              onChange={(e) => setLyricsPlain(e.target.value)}
              disabled={status === "uploading"}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
            <button
              type="button"
              onClick={resetAll}
              className={`${styles.btn} ${styles.btnSecondary}`}
              disabled={status === "uploading"}
            >
              <span>Hủy</span>
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={status === "uploading" || !isConfigured}
            >
              {status === "uploading" ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Đang tải lên...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={13} />
                  <span>Xác nhận & Tải lên Storage</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
