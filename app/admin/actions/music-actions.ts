"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAuthenticatedAdmin } from "@/lib/supabase/auth-guard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";
import type { ContentStatus, TrackRow } from "@/lib/supabase/types";

// Supported audio formats
const ALLOWED_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/flac",
  "audio/x-flac",
  "audio/wav",
  "audio/x-wav",
  "audio/x-m4a",
  "audio/mp4",
  "audio/ogg",
  "audio/aac",
];

const ALLOWED_EXTENSIONS = [".mp3", ".flac", ".wav", ".m4a", ".ogg", ".aac"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
}

export type MusicActionResult<T = unknown> = {
  success?: boolean;
  data?: T;
  error?: string;
};

export async function uploadTrackAction(
  formData: FormData
): Promise<MusicActionResult<{ trackId: string }>> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "MISSING CONFIGURATION: Cần cấu hình Supabase URL và keys trong biến môi trường trước khi tải lên nhạc.",
    };
  }

  const guard = await getAuthenticatedAdmin();
  if (guard.status !== "authenticated") {
    return { error: "Yêu cầu quyền quản trị viên để tải lên tệp âm thanh." };
  }

  const audioFile = formData.get("audioFile") as File | null;
  if (!audioFile || !(audioFile instanceof File)) {
    return { error: "Vui lòng chọn một tệp âm thanh hợp lệ." };
  }

  // 1. Validate File Size
  if (audioFile.size > MAX_FILE_SIZE) {
    return {
      error: `Kích thước tệp vượt quá giới hạn tối đa (100MB). Kích thước hiện tại: ${(
        audioFile.size /
        (1024 * 1024)
      ).toFixed(1)}MB`,
    };
  }

  // 2. Validate MIME type & Extension
  const mimeType = audioFile.type.toLowerCase();
  const fileName = audioFile.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!hasValidExt && !ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      error: "Định dạng tệp không được hỗ trợ. Vui lòng sử dụng MP3, FLAC, WAV, M4A hoặc OGG.",
    };
  }

  // Extract Form Metadata
  const title = (formData.get("title") as string)?.trim() || audioFile.name.replace(/\.[^/.]+$/, "");
  const artist = (formData.get("artist") as string)?.trim() || "FUJIWARA DAIKI";
  const album = (formData.get("album") as string)?.trim() || null;
  const albumArtist = (formData.get("albumArtist") as string)?.trim() || null;
  const year = (formData.get("year") as string)?.trim() || null;
  const genre = (formData.get("genre") as string)?.trim() || null;
  const duration = Math.max(0, parseInt((formData.get("duration") as string) || "0", 10));
  const status = ((formData.get("status") as string) || "draft") as ContentStatus;
  const lyricsPlain = (formData.get("lyricsPlain") as string)?.trim() || null;

  // Supabase Client (Use admin client if available to ensure storage bucket writes succeed with service role, otherwise server client)
  const supabase = getAdminSupabase() || (await getServerSupabase());
  if (!supabase) {
    return { error: "Không thể kết nối đến dịch vụ Supabase." };
  }

  const trackUuid = crypto.randomUUID();
  const cleanAudioName = `${trackUuid}-${sanitizeFileName(audioFile.name)}`;
  const audioStoragePath = `tracks/${cleanAudioName}`;

  // 3. Upload Audio to Storage
  const audioBuffer = await audioFile.arrayBuffer();
  const { error: audioUploadError } = await supabase.storage
    .from("audio")
    .upload(audioStoragePath, audioBuffer, {
      contentType: audioFile.type || "audio/mpeg",
      upsert: false,
    });

  if (audioUploadError) {
    return { error: `Lỗi tải lên audio: ${audioUploadError.message}` };
  }

  // Get Audio Public URL
  const {
    data: { publicUrl: audioUrl },
  } = supabase.storage.from("audio").getPublicUrl(audioStoragePath);

  // 4. Handle Cover Upload (if provided)
  let coverUrl: string | null = null;
  let coverStoragePath: string | null = null;
  const coverFile = formData.get("coverFile") as File | null;

  if (coverFile && coverFile instanceof File && coverFile.size > 0) {
    const cleanCoverName = `${trackUuid}-${sanitizeFileName(coverFile.name)}`;
    coverStoragePath = `covers/${cleanCoverName}`;
    const coverBuffer = await coverFile.arrayBuffer();

    const { error: coverUploadError } = await supabase.storage
      .from("covers")
      .upload(coverStoragePath, coverBuffer, {
        contentType: coverFile.type || "image/jpeg",
        upsert: false,
      });

    if (!coverUploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("covers").getPublicUrl(coverStoragePath);
      coverUrl = publicUrl;
    }
  }

  // 5. Insert Record into PostgreSQL
  const { data: newTrack, error: dbError } = await supabase
    .from("tracks")
    .insert({
      id: trackUuid,
      title,
      artist,
      album,
      album_artist: albumArtist,
      year,
      genre,
      duration,
      format: audioFile.name.split(".").pop()?.toLowerCase() || "mp3",
      mime_type: audioFile.type || "audio/mpeg",
      file_size: audioFile.size,
      cover_url: coverUrl,
      cover_storage_path: coverStoragePath,
      audio_url: audioUrl,
      storage_path: audioStoragePath,
      status,
      lyrics_plain: lyricsPlain,
    })
    .select("id")
    .single();

  if (dbError || !newTrack) {
    // Attempt rollback of storage file
    await supabase.storage.from("audio").remove([audioStoragePath]);
    if (coverStoragePath) {
      await supabase.storage.from("covers").remove([coverStoragePath]);
    }
    return { error: `Lỗi lưu trữ bản ghi vào cơ sở dữ liệu: ${dbError?.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/music");
  revalidatePath("/music");

  return { success: true, data: { trackId: newTrack.id } };
}

export async function updateTrackAction(
  trackId: string,
  formData: FormData
): Promise<MusicActionResult<TrackRow>> {
  if (!isSupabaseConfigured()) {
    return { error: "MISSING CONFIGURATION: Cần cấu hình Supabase URL và keys." };
  }

  const guard = await getAuthenticatedAdmin();
  if (guard.status !== "authenticated") {
    return { error: "Yêu cầu quyền quản trị viên." };
  }

  const title = (formData.get("title") as string)?.trim();
  const artist = (formData.get("artist") as string)?.trim();
  const album = (formData.get("album") as string)?.trim() || null;
  const albumArtist = (formData.get("albumArtist") as string)?.trim() || null;
  const year = (formData.get("year") as string)?.trim() || null;
  const genre = (formData.get("genre") as string)?.trim() || null;
  const duration = Math.max(0, parseInt((formData.get("duration") as string) || "0", 10));
  const status = (formData.get("status") as string) as ContentStatus;
  const lyricsPlain = (formData.get("lyricsPlain") as string)?.trim() || null;

  if (!title || !artist) {
    return { error: "Tiêu đề và nghệ sĩ không được để trống." };
  }

  const supabase = getAdminSupabase() || (await getServerSupabase());
  if (!supabase) {
    return { error: "Không thể kết nối Supabase." };
  }

  // Check if replacement cover file was provided
  const coverFile = formData.get("coverFile") as File | null;
  let coverUrlUpdate: { cover_url?: string; cover_storage_path?: string } = {};

  if (coverFile && coverFile instanceof File && coverFile.size > 0) {
    const cleanCoverName = `${trackId}-${sanitizeFileName(coverFile.name)}`;
    const coverStoragePath = `covers/${cleanCoverName}`;
    const coverBuffer = await coverFile.arrayBuffer();

    const { error: coverErr } = await supabase.storage
      .from("covers")
      .upload(coverStoragePath, coverBuffer, {
        contentType: coverFile.type || "image/jpeg",
        upsert: true,
      });

    if (!coverErr) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("covers").getPublicUrl(coverStoragePath);
      coverUrlUpdate = {
        cover_url: publicUrl,
        cover_storage_path: coverStoragePath,
      };
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("tracks")
    .update({
      title,
      artist,
      album,
      album_artist: albumArtist,
      year,
      genre,
      duration,
      status,
      lyrics_plain: lyricsPlain,
      ...coverUrlUpdate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", trackId)
    .select()
    .single();

  if (updateError || !updated) {
    return { error: `Lỗi cập nhật: ${updateError?.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/music");
  revalidatePath(`/admin/music/${trackId}`);
  revalidatePath("/music");

  return { success: true, data: updated };
}

export async function deleteTrackAction(trackId: string): Promise<MusicActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "MISSING CONFIGURATION" };
  }

  const guard = await getAuthenticatedAdmin();
  if (guard.status !== "authenticated") {
    return { error: "Quyền truy cập bị từ chối." };
  }

  const supabase = getAdminSupabase() || (await getServerSupabase());
  if (!supabase) {
    return { error: "Không thể kết nối Supabase." };
  }

  // Get track to retrieve storage paths
  const { data: track } = await supabase
    .from("tracks")
    .select("storage_path, cover_storage_path")
    .eq("id", trackId)
    .single();

  if (track) {
    if (track.storage_path) {
      await supabase.storage.from("audio").remove([track.storage_path]);
    }
    if (track.cover_storage_path) {
      await supabase.storage.from("covers").remove([track.cover_storage_path]);
    }
  }

  const { error: deleteError } = await supabase
    .from("tracks")
    .delete()
    .eq("id", trackId);

  if (deleteError) {
    return { error: `Lỗi xóa bản ghi: ${deleteError.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/music");
  revalidatePath("/music");

  return { success: true };
}

export async function setTrackStatusAction(
  trackId: string,
  newStatus: ContentStatus
): Promise<MusicActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "MISSING CONFIGURATION" };
  }

  const guard = await getAuthenticatedAdmin();
  if (guard.status !== "authenticated") {
    return { error: "Quyền truy cập bị từ chối." };
  }

  const supabase = getAdminSupabase() || (await getServerSupabase());
  if (!supabase) {
    return { error: "Không thể kết nối Supabase." };
  }

  const { error } = await supabase
    .from("tracks")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", trackId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/music");
  revalidatePath(`/admin/music/${trackId}`);
  revalidatePath("/music");

  return { success: true };
}
