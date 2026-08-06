import type { MusicTrack } from "./types";

const CONTEXT_LABELS = [
  "official music video",
  "official video",
  "official audio",
  "lyric video",
  "lyrics",
  "visualizer",
  "remastered",
  "provided to youtube by",
  "hd",
  "4k",
];

const CONTEXT_PATTERN = new RegExp(`^(?:${CONTEXT_LABELS.join("|")})(?:\\s+[^\\]\\)]*)?$`, "i");

export function decodeMusicText(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    quot: "\"",
    lt: "<",
    gt: ">",
  };
  return value
    .replace(/&([a-z]+);/gi, (entity, name: string) => named[name.toLowerCase()] ?? entity)
    .replace(/&#(x?[0-9a-f]+);/gi, (_, code: string) => {
      const radix = code.toLowerCase().startsWith("x") ? 16 : 10;
      const parsed = Number.parseInt(code.replace(/^x/i, ""), radix);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : "";
    });
}

export function foldMusicText(value: string) {
  return decodeMusicText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("vi")
    .replace(/[’‘`]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeChannelArtist(channelTitle: string) {
  return decodeMusicText(channelTitle)
    .replace(/\s*-\s*Topic\s*$/i, "")
    .replace(/\s+VEVO\s*$/i, "")
    .replace(/\s*\((?:official|official artist channel)\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeTrackLabel(input: string) {
  let value = decodeMusicText(input)
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  value = value.replace(/[\[(]([^\])]+)[\])]/g, (full, content: string) => (
    CONTEXT_PATTERN.test(content.trim()) ? " " : full
  ));

  const trailing = new RegExp(`\\s*(?:[-|:]\\s*)?(?:${CONTEXT_LABELS.join("|")})\\s*$`, "i");
  let previous = "";
  while (previous !== value) {
    previous = value;
    value = value.replace(trailing, " ").trim();
  }

  return value.replace(/\s+/g, " ").trim();
}

function similarity(left: string, right: string) {
  const a = foldMusicText(left);
  const b = foldMusicText(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) / Math.max(a.length, b.length);
  const aTokens = new Set(a.split(" "));
  const bTokens = new Set(b.split(" "));
  const shared = [...aTokens].filter((token) => bTokens.has(token)).length;
  return shared / Math.max(aTokens.size, bTokens.size, 1);
}

export function inferMusicMetadata(
  title: string,
  channelTitle: string,
  override?: { artist?: string; track?: string },
) {
  if (override?.artist?.trim() && override.track?.trim()) {
    return { artist: override.artist.trim(), track: override.track.trim() };
  }

  const cleanTitle = normalizeTrackLabel(title);
  const channelArtist = normalizeChannelArtist(channelTitle);
  const parts = cleanTitle.split(/\s+(?:-|\||:)\s+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return { artist: channelArtist || channelTitle, track: cleanTitle };

  const first = parts[0];
  const last = parts.at(-1) as string;
  const firstMatch = similarity(first, channelArtist);
  const lastMatch = similarity(last, channelArtist);
  if (lastMatch > firstMatch && lastMatch >= 0.58) {
    return { artist: last, track: parts.slice(0, -1).join(" - ") };
  }
  if (firstMatch >= 0.45 || /-\s*Topic$/i.test(channelTitle)) {
    return { artist: first, track: parts.slice(1).join(" - ") };
  }
  return { artist: first, track: parts.slice(1).join(" - ") };
}

export function normalizeTrackMetadata(track: MusicTrack, override?: { artist?: string; track?: string }) {
  return inferMusicMetadata(track.title, track.channelTitle || track.artist, override);
}

export function musicTextSimilarity(left: string, right: string) {
  return similarity(left, right);
}
