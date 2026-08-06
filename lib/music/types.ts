export type RepeatMode = "off" | "one" | "all";

export type MusicErrorCode =
  | "SEARCH_FAILED"
  | "PLAYER_NOT_READY"
  | "VIDEO_UNAVAILABLE"
  | "VIDEO_NOT_EMBEDDABLE"
  | "NETWORK_ERROR"
  | "LYRICS_NOT_FOUND"
  | "LYRICS_FAILED"
  | "AUTOPLAY_BLOCKED"
  | "STORAGE_FAILED"
  | "AUTO_RADIO";

export type VolumeState = {
  volume: number;
  previousVolume: number;
  muted: boolean;
};

export type MusicRanking = {
  score: number;
  signals: Array<{ label: string; points: number }>;
  titleSimilarity: number;
  artistSimilarity: number;
};

export type MusicTrack = {
  videoId: string;
  title: string;
  artist: string;
  channelTitle: string;
  channelId?: string;
  categoryId?: string;
  description?: string;
  thumbnail: string;
  duration?: number;
  liveBroadcastContent?: "none" | "live" | "upcoming";
  publishedAt?: string;
  ranking?: MusicRanking;
  source?: "search" | "trending" | "auto-radio";
  tags?: string[];
};

export type MusicHistoryEntry = MusicTrack & { playedAt: number };

export type MusicPlaylist = {
  id: string;
  name: string;
  tracks: MusicTrack[];
  createdAt: number;
  updatedAt: number;
};

export type SyncedLyricLine = { time: number; text: string };

export type LyricsRecord = {
  albumName: string | null;
  artistName: string;
  duration: number;
  id: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
  trackName: string;
};

export type LyricsCandidate = LyricsRecord & {
  score: number;
  signals: string[];
};

export type LyricsResult = {
  instrumental: boolean;
  plainLyrics: string | null;
  record: LyricsRecord | null;
  syncedLyrics: SyncedLyricLine[];
};

export type SearchResponse = { items: MusicTrack[]; nextPageToken: string | null };
export type TrendingResponse = { items: MusicTrack[]; cachedAt: number; region: "VN" };
export type RadioResponse = { items: MusicTrack[]; cachedAt: number };

export type MusicToast = {
  id: number;
  code: MusicErrorCode;
  message: string;
};

export type PersistedMusicState = {
  autoRadioEnabled?: boolean;
  currentTrack: MusicTrack | null;
  currentTime: number;
  favorites: MusicTrack[];
  history: MusicHistoryEntry[];
  lyricMappings?: Record<string, LyricsRecord>;
  lyricOffsets: Record<string, number>;
  playlists: MusicPlaylist[];
  queue: MusicTrack[];
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  updatedAt: number;
  volume: VolumeState | number;
};
