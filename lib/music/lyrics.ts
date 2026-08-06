import { musicTextSimilarity } from "./metadata";
import { parseSyncedLyrics } from "./format";
import type { LyricsCandidate, LyricsRecord, LyricsResult } from "./types";

export function normalizeLyricsRecord(value: unknown): LyricsRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<LyricsRecord>;
  const id = Number(record.id);
  const duration = Number(record.duration);
  if (!Number.isFinite(id) || !record.trackName || !record.artistName) return null;
  return {
    albumName: typeof record.albumName === "string" ? record.albumName : null,
    artistName: String(record.artistName).trim(),
    duration: Number.isFinite(duration) ? duration : 0,
    id,
    instrumental: Boolean(record.instrumental),
    plainLyrics: typeof record.plainLyrics === "string" ? record.plainLyrics : null,
    syncedLyrics: typeof record.syncedLyrics === "string" ? record.syncedLyrics : null,
    trackName: String(record.trackName).trim(),
  };
}

export function scoreLyricsCandidate(
  record: LyricsRecord,
  target: { track: string; artist: string; album?: string; duration?: number },
): LyricsCandidate {
  const signals: string[] = [];
  const titleSimilarity = musicTextSimilarity(record.trackName, target.track);
  const artistSimilarity = musicTextSimilarity(record.artistName, target.artist);
  const albumSimilarity = target.album ? musicTextSimilarity(record.albumName ?? "", target.album) : 0;
  let score = titleSimilarity * 52 + artistSimilarity * 34 + albumSimilarity * 10;
  if (titleSimilarity >= 0.92) signals.push("Tên bài khớp chính xác");
  if (artistSimilarity >= 0.84) signals.push("Nghệ sĩ khớp");
  if (albumSimilarity >= 0.8) signals.push("Album khớp");

  if (target.duration && record.duration) {
    const difference = Math.abs(record.duration - target.duration);
    if (difference <= 2) { score += 20; signals.push("Thời lượng lệch không quá 2 giây"); }
    else if (difference <= 5) { score += 12; signals.push("Thời lượng gần khớp"); }
    else if (difference <= 10) score += 4;
    else if (difference > 20) score -= 18;
  }
  if (record.syncedLyrics) { score += 12; signals.push("Có lời đồng bộ"); }
  else if (record.plainLyrics) { score += 4; signals.push("Có lời thường"); }
  if (record.instrumental) signals.push("Bản không lời");

  return { ...record, score: Math.round(score), signals };
}

export function lyricsRecordToResult(record: LyricsRecord): LyricsResult {
  return {
    instrumental: record.instrumental,
    plainLyrics: record.plainLyrics,
    record,
    syncedLyrics: parseSyncedLyrics(record.syncedLyrics),
  };
}
