import "server-only";

import { decodeMusicText, inferMusicMetadata } from "./metadata";
import type { MusicTrack } from "./types";

type ThumbnailSet = {
  default?: { url?: string };
  medium?: { url?: string };
  high?: { url?: string };
  standard?: { url?: string };
  maxres?: { url?: string };
};

type YouTubeSnippet = {
  title?: string;
  channelTitle?: string;
  channelId?: string;
  categoryId?: string;
  description?: string;
  liveBroadcastContent?: "none" | "live" | "upcoming";
  publishedAt?: string;
  tags?: string[];
  thumbnails?: ThumbnailSet;
};

type SearchItem = { id?: { videoId?: string }; snippet?: YouTubeSnippet };
type VideoItem = {
  id?: string;
  snippet?: YouTubeSnippet;
  contentDetails?: { duration?: string };
  status?: { embeddable?: boolean; privacyStatus?: string };
};

export class YouTubeUpstreamError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function getYouTubeApiKey() {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) throw new YouTubeUpstreamError(503, "YOUTUBE_API_KEY chưa được cấu hình trên server.");
  return key;
}

export function parseIsoDuration(value: string | undefined) {
  if (!value) return 0;
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

async function fetchYouTube<T>(url: URL, revalidate: number): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new YouTubeUpstreamError(response.status === 403 ? 429 : 502, "YouTube Data API từ chối yêu cầu.");
  }
  return response.json() as Promise<T>;
}

function thumbnailFor(videoId: string, thumbnails?: ThumbnailSet) {
  return thumbnails?.maxres?.url
    || thumbnails?.standard?.url
    || thumbnails?.high?.url
    || thumbnails?.medium?.url
    || thumbnails?.default?.url
    || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function toTrack(videoId: string, detail: VideoItem, fallback?: YouTubeSnippet): MusicTrack | null {
  const snippet = detail.snippet ?? fallback;
  if (!snippet?.title || detail.status?.embeddable === false || detail.status?.privacyStatus === "private") return null;
  const title = decodeMusicText(snippet.title);
  const channelTitle = decodeMusicText(snippet.channelTitle || "YouTube Music");
  const metadata = inferMusicMetadata(title, channelTitle);
  return {
    videoId,
    title,
    artist: metadata.artist || channelTitle,
    channelTitle,
    channelId: snippet.channelId,
    categoryId: snippet.categoryId,
    description: decodeMusicText(snippet.description || ""),
    duration: parseIsoDuration(detail.contentDetails?.duration),
    liveBroadcastContent: snippet.liveBroadcastContent ?? "none",
    publishedAt: snippet.publishedAt,
    tags: snippet.tags?.slice(0, 30),
    thumbnail: thumbnailFor(videoId, snippet.thumbnails),
  };
}

async function hydrateVideos(ids: string[], fallbacks: Map<string, YouTubeSnippet>, revalidate: number) {
  if (!ids.length) return [];
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,contentDetails,status");
  url.searchParams.set("id", ids.join(","));
  url.searchParams.set("key", getYouTubeApiKey());
  const payload = await fetchYouTube<{ items?: VideoItem[] }>(url, revalidate);
  const byId = new Map((payload.items ?? []).filter((item) => item.id).map((item) => [item.id as string, item]));
  return ids.flatMap((id) => {
    const detail = byId.get(id);
    const track = detail ? toTrack(id, detail, fallbacks.get(id)) : null;
    return track ? [track] : [];
  });
}

export async function searchYouTubeCandidates(
  query: string,
  options: { maxResults?: number; pageToken?: string; revalidate?: number } = {},
) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("videoCategoryId", "10");
  url.searchParams.set("maxResults", String(options.maxResults ?? 12));
  url.searchParams.set("q", query);
  url.searchParams.set("key", getYouTubeApiKey());
  if (options.pageToken) url.searchParams.set("pageToken", options.pageToken);
  const revalidate = options.revalidate ?? 300;
  const payload = await fetchYouTube<{ items?: SearchItem[]; nextPageToken?: string }>(url, revalidate);
  const fallbacks = new Map<string, YouTubeSnippet>();
  const ids: string[] = [];
  for (const item of payload.items ?? []) {
    const id = item.id?.videoId;
    if (!id || !item.snippet?.title) continue;
    ids.push(id);
    fallbacks.set(id, item.snippet);
  }
  return {
    items: await hydrateVideos(ids, fallbacks, revalidate),
    nextPageToken: payload.nextPageToken ?? null,
  };
}

export async function trendingYouTubeMusic() {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,contentDetails,statistics,status");
  url.searchParams.set("chart", "mostPopular");
  url.searchParams.set("regionCode", "VN");
  url.searchParams.set("videoCategoryId", "10");
  url.searchParams.set("maxResults", "24");
  url.searchParams.set("key", getYouTubeApiKey());
  const payload = await fetchYouTube<{ items?: VideoItem[] }>(url, 1800);
  return (payload.items ?? []).flatMap((item) => {
    const id = item.id;
    const track = id ? toTrack(id, item) : null;
    return track ? [track] : [];
  });
}
