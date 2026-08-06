import type { SyncedLyricLine } from "./types";

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function normalizeYouTubeTitle(input: string) {
  const removable = [
    "official music video",
    "official video",
    "official audio",
    "lyrics video",
    "lyric video",
    "visualizer",
    "remastered",
    "audio",
    "4k",
    "hd",
    "mv",
  ];
  const pattern = new RegExp(`(?:\\(|\\[)\\s*(?:${removable.join("|")})[^\\]\\)]*(?:\\)|\\])`, "gi");

  return input
    .replace(pattern, " ")
    .replace(/\s+-\s+(official music video|official video|official audio|lyrics? video|visualizer|audio)\s*$/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function inferTrackAndArtist(title: string, fallbackArtist: string) {
  const normalized = normalizeYouTubeTitle(title);
  const parts = normalized.split(/\s[-|:]\s/).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return { artist: parts[0], track: parts.slice(1).join(" - ") };
  return { artist: fallbackArtist, track: normalized };
}

export function parseSyncedLyrics(input: string | null): SyncedLyricLine[] {
  if (!input) return [];
  const lines: SyncedLyricLine[] = [];
  const timestamp = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const rawLine of input.split(/\r?\n/)) {
    const text = rawLine.replace(timestamp, "").trim();
    for (const match of rawLine.matchAll(timestamp)) {
      const fractionText = match[3] ?? "0";
      lines.push({
        time: Number(match[1]) * 60 + Number(match[2]) + Number(fractionText) / 10 ** fractionText.length,
        text: text || "Nhạc dạo",
      });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

export function findActiveLyricIndex(lines: SyncedLyricLine[], time: number) {
  let low = 0;
  let high = lines.length - 1;
  let answer = -1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (lines[middle].time <= time + 0.08) {
      answer = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return answer;
}
