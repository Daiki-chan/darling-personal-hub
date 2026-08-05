export type TrackSource =
  | { kind: "direct"; url: string }
  | { kind: "youtube"; videoId: string };

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: number;
  accentFallback: string;
  source: TrackSource;
};

export type SyncedLyricLine = {
  time: number;
  text: string;
};

export const personalTracks: MusicTrack[] = [
  {
    id: "moonlit-signal",
    title: "Moonlit Signal",
    artist: "Darling Archive",
    album: "Night Notes",
    artwork: "/music/covers/violet-city.webp",
    duration: 238,
    accentFallback: "#8b5cf6",
    source: {
      kind: "direct",
      url: process.env.NEXT_PUBLIC_MUSIC_TRACK_ONE_URL ?? "",
    },
  },
  {
    id: "last-car-home",
    title: "Last Car Home",
    artist: "Darling Archive",
    album: "Rain Memory",
    artwork: "/music/covers/midnight-carriage.webp",
    duration: 204,
    accentFallback: "#6366f1",
    source: {
      kind: "direct",
      url: process.env.NEXT_PUBLIC_MUSIC_TRACK_TWO_URL ?? "",
    },
  },
];

export function getTrackAudioUrl(track: MusicTrack) {
  if (track.source.kind === "youtube") {
    return `/api/yt-stream?videoId=${encodeURIComponent(track.source.videoId)}`;
  }

  return track.source.url.trim();
}

export function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function parseSyncedLyrics(input: string | null): SyncedLyricLine[] {
  if (!input) {
    return [];
  }

  const lines: SyncedLyricLine[] = [];
  const timestamp = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const rawLine of input.split(/\r?\n/)) {
    const text = rawLine.replace(timestamp, "").trim();
    const matches = [...rawLine.matchAll(timestamp)];

    for (const match of matches) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const fractionText = match[3] ?? "0";
      const fraction = Number(fractionText) / 10 ** fractionText.length;

      lines.push({
        time: minutes * 60 + seconds + fraction,
        text: text || "♪",
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
