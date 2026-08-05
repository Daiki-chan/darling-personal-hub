const PUBLIC_PIPED_APIS = [
  "https://api.piped.private.coffee",
  "https://pipedapi.orangenet.cc",
  "https://pipedapi.kavin.rocks",
];

export type PipedAudioStream = {
  bitrate?: number;
  codec?: string;
  format?: string;
  mimeType?: string;
  url?: string;
  videoOnly?: boolean;
};

export type PipedStreamResponse = {
  audioStreams?: PipedAudioStream[];
  duration?: number;
  thumbnailUrl?: string;
  title?: string;
  uploader?: string;
};

export type PipedSearchItem = {
  duration?: number;
  thumbnail?: string;
  title?: string;
  type?: string;
  uploaderName?: string;
  uploaderUrl?: string;
  url?: string;
};

export type PipedSearchResponse = {
  items?: PipedSearchItem[];
};

export function getPipedApiBases() {
  const configured = process.env.PIPED_API_BASE_URL?.trim();
  if (configured) {
    return [configured.replace(/\/+$/, "")];
  }

  return PUBLIC_PIPED_APIS;
}

export function extractVideoId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const directMatch = value.match(/^[A-Za-z0-9_-]{11}$/);
  if (directMatch) {
    return directMatch[0];
  }

  try {
    const parsed = new URL(value, "https://www.youtube.com");
    const queryId = parsed.searchParams.get("v");
    if (queryId && /^[A-Za-z0-9_-]{11}$/.test(queryId)) {
      return queryId;
    }

    const finalSegment = parsed.pathname.split("/").filter(Boolean).at(-1);
    return finalSegment && /^[A-Za-z0-9_-]{11}$/.test(finalSegment) ? finalSegment : null;
  } catch {
    return null;
  }
}

export function selectAudioStream(streams: PipedAudioStream[] | undefined) {
  const candidates = (streams ?? []).filter(
    (stream) => !stream.videoOnly && stream.url && stream.mimeType?.startsWith("audio/"),
  );

  return candidates.sort((a, b) => {
    const aMp4 = a.mimeType?.includes("mp4") || a.format === "M4A" ? 1 : 0;
    const bMp4 = b.mimeType?.includes("mp4") || b.format === "M4A" ? 1 : 0;
    if (aMp4 !== bMp4) {
      return bMp4 - aMp4;
    }

    return (b.bitrate ?? 0) - (a.bitrate ?? 0);
  })[0];
}

export function isSafeRemoteUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const blocked =
      hostname === "localhost" ||
      hostname === "0.0.0.0" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

    return url.protocol === "https:" && !blocked;
  } catch {
    return false;
  }
}
