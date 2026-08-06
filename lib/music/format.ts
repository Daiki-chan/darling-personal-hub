import { inferMusicMetadata, normalizeTrackLabel } from "./metadata";
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
  return normalizeTrackLabel(input);
}

export function inferTrackAndArtist(title: string, fallbackArtist: string) {
  return inferMusicMetadata(title, fallbackArtist);
}

export function parseSyncedLyrics(input: string | null): SyncedLyricLine[] {
  if (!input) return [];
  const rawLines = input.split(/\r?\n/);
  const offsetTag = rawLines
    .map((line) => line.match(/^\s*\[offset\s*:\s*([+-]?\d+)\s*\]\s*$/i))
    .find(Boolean);
  const offsetSeconds = offsetTag ? Number(offsetTag[1]) / 1000 : 0;
  const timestamp = /\[(\d{1,3}):(\d{2})(?:[.:](\d{2,3}))?\]/g;
  const lines: SyncedLyricLine[] = [];
  const seen = new Set<string>();

  for (const rawLine of rawLines) {
    if (/^\s*\[(?:ar|al|ti|au|by|re|ve|length|offset)\s*:/i.test(rawLine)) continue;
    const matches = [...rawLine.matchAll(timestamp)];
    if (!matches.length) continue;
    const text = rawLine.replace(timestamp, "").trim();

    for (const match of matches) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || seconds >= 60) continue;
      const fraction = match[3] ?? "0";
      const time = Math.max(0, minutes * 60 + seconds + Number(fraction) / 10 ** fraction.length + offsetSeconds);
      if (!Number.isFinite(time)) continue;
      const key = `${time.toFixed(3)}|${text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push({ time, text });
    }
  }

  return lines.sort((left, right) => left.time - right.time || left.text.localeCompare(right.text, "vi"));
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
