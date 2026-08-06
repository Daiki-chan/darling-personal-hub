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
  | "STORAGE_FAILED";

export type MusicTrack = {
  videoId: string;
  title: string;
  artist: string;
  channelTitle: string;
  thumbnail: string;
  duration?: number;
  publishedAt?: string;
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

export type LyricsResult = {
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: SyncedLyricLine[];
};

export type SearchResponse = { items: MusicTrack[]; nextPageToken: string | null };

export type MusicToast = {
  id: number;
  code: MusicErrorCode;
  message: string;
};

export type PersistedMusicState = {
  currentTrack: MusicTrack | null;
  currentTime: number;
  favorites: MusicTrack[];
  history: MusicHistoryEntry[];
  lyricOffsets: Record<string, number>;
  playlists: MusicPlaylist[];
  queue: MusicTrack[];
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  updatedAt: number;
  volume: number;
};
