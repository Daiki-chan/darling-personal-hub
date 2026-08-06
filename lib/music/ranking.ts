import { foldMusicText, inferMusicMetadata, musicTextSimilarity, normalizeChannelArtist } from "./metadata";
import type { MusicRanking, MusicTrack } from "./types";

export type RankingContext = {
  currentVideoId?: string;
  query?: string;
  recentVideoIds?: Iterable<string>;
  targetArtist?: string;
  targetTitle?: string;
};

const NEGATIVE_TERMS = [
  ["karaoke", -44],
  ["reaction", -44],
  ["cover", -32],
  ["fanmade", -26],
  ["fan made", -26],
  ["reupload", -24],
  ["repost", -24],
] as const;

function addSignal(signals: MusicRanking["signals"], label: string, points: number, active: boolean) {
  if (active) signals.push({ label, points });
}

function requested(query: string, term: string) {
  return foldMusicText(query).includes(foldMusicText(term));
}

export function rankMusicCandidate(track: MusicTrack, context: RankingContext = {}): MusicRanking {
  const signals: MusicRanking["signals"] = [];
  const query = context.query ?? "";
  const haystack = foldMusicText(`${track.title} ${track.channelTitle} ${track.description ?? ""}`);
  const metadata = inferMusicMetadata(track.title, track.channelTitle || track.artist);
  const hasTargetArtist = Boolean(context.targetArtist?.trim());
  const targetArtist = context.targetArtist || "";
  const hasTargetTitle = Boolean(context.targetTitle?.trim());
  const targetTitle = context.targetTitle || "";
  const channelArtist = normalizeChannelArtist(track.channelTitle);
  const recent = new Set(context.recentVideoIds ?? []);

  const titleSimilarity = hasTargetTitle ? musicTextSimilarity(metadata.track, targetTitle) : 0;
  const artistSimilarity = hasTargetArtist
    ? Math.max(musicTextSimilarity(metadata.artist, targetArtist), musicTextSimilarity(channelArtist, targetArtist))
    : 0;
  const channelArtistSimilarity = musicTextSimilarity(channelArtist, metadata.artist);
  addSignal(signals, "Exact track and artist match", 34, hasTargetArtist && hasTargetTitle && titleSimilarity >= 0.9 && artistSimilarity >= 0.82);
  addSignal(signals, "Strong title match", 18, hasTargetTitle && titleSimilarity >= 0.72 && titleSimilarity < 0.9);
  addSignal(signals, "Artist channel matches artist", 22, channelArtistSimilarity >= 0.82);
  addSignal(signals, "YouTube Topic channel", 24, /-\s*Topic$/i.test(track.channelTitle));
  addSignal(signals, "Likely official artist channel", 16, /(?:VEVO|Official Artist Channel|\(Official\))$/i.test(track.channelTitle));
  addSignal(signals, "Official Audio label", 15, /official\s+audio/i.test(track.title));
  addSignal(signals, "Official Music Video label", 13, /official\s+(?:music\s+)?video/i.test(track.title));
  addSignal(signals, "Lyric or visualizer upload", 8, /(?:lyric(?:s|\s+video)?|visualizer)/i.test(track.title));
  addSignal(signals, "Music category", 8, track.categoryId === "10");
  addSignal(signals, "Music-length duration", 7, Boolean(track.duration && track.duration >= 90 && track.duration <= 540));

  if (query) {
    const queryTokens = foldMusicText(query).split(" ").filter((token) => token.length > 1);
    addSignal(signals, "Matches all search terms", 16, queryTokens.length > 0 && queryTokens.every((token) => haystack.includes(token)));
  }

  for (const [term, points] of NEGATIVE_TERMS) {
    addSignal(signals, `Penalty: ${term}`, points, haystack.includes(term) && !requested(query, term));
  }
  addSignal(signals, "Penalty: sped up", -30, /\bsped\s*up\b/i.test(haystack) && !requested(query, "sped up"));
  addSignal(signals, "Penalty: slowed or reverb", -30, /\bslowed\b|\breverb\b/i.test(haystack) && !requested(query, "slowed"));
  addSignal(signals, "Penalty: remix", -20, /\bremix\b/i.test(haystack) && !requested(query, "remix"));
  addSignal(signals, "Penalty: live version", -20, /\blive\b/i.test(haystack) && !requested(query, "live"));
  addSignal(signals, "Penalty: short video", -30, Boolean((track.duration && track.duration < 60) || /#shorts|\bshorts\b/i.test(haystack)));
  addSignal(signals, "Penalty: long compilation", -24, Boolean(track.duration && track.duration > 1200));
  addSignal(signals, "Penalty: current video", -120, track.videoId === context.currentVideoId);
  addSignal(signals, "Penalty: recently played", -34, recent.has(track.videoId));
  addSignal(signals, "Penalty: live stream", -50, track.liveBroadcastContent === "live");

  const score = signals.reduce((total, signal) => total + signal.points, 0);
  return { score, signals, titleSimilarity, artistSimilarity };
}

export function rankMusicTracks(tracks: MusicTrack[], context: RankingContext = {}) {
  return tracks
    .map((track) => ({ ...track, ranking: rankMusicCandidate(track, context) }))
    .sort((left, right) => (right.ranking?.score ?? 0) - (left.ranking?.score ?? 0));
}
