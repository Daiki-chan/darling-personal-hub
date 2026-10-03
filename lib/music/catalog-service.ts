import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";
import type { MusicTrack } from "@/lib/music/types";
import type { TrackRow } from "@/lib/supabase/types";

export function mapTrackRowToMusicTrack(row: TrackRow): MusicTrack {
  return {
    videoId: `supabase_${row.id}`,
    title: row.title,
    artist: row.artist,
    channelTitle: row.artist,
    thumbnail: row.cover_url || "https://res.cloudinary.com/dndfpxmef/image/upload/v1786779542/sky_1_iunx5o.jpg",
    duration: row.duration,
    audioUrl: row.audio_url,
    isDirectAudio: true,
    source: "trending",
    album: row.album || undefined,
  };
}

export async function fetchPublishedVaultTracks(): Promise<MusicTrack[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await getServerSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapTrackRowToMusicTrack);
  } catch {
    return [];
  }
}
