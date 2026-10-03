export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AdminRole = "admin" | "editor" | "viewer";
export type ContentStatus = "draft" | "published" | "archived";

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          role: AdminRole;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: AdminRole;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: AdminRole;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tracks: {
        Row: {
          id: string;
          title: string;
          artist: string;
          album: string | null;
          album_artist: string | null;
          year: string | null;
          genre: string | null;
          track_number: number | null;
          disc_number: number | null;
          duration: number;
          format: string | null;
          mime_type: string | null;
          file_size: number | null;
          bitrate: number | null;
          sample_rate: number | null;
          cover_url: string | null;
          audio_url: string;
          storage_path: string;
          cover_storage_path: string | null;
          status: ContentStatus;
          lyrics_plain: string | null;
          lyrics_synced: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist: string;
          album?: string | null;
          album_artist?: string | null;
          year?: string | null;
          genre?: string | null;
          track_number?: number | null;
          disc_number?: number | null;
          duration?: number;
          format?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          bitrate?: number | null;
          sample_rate?: number | null;
          cover_url?: string | null;
          audio_url: string;
          storage_path: string;
          cover_storage_path?: string | null;
          status?: ContentStatus;
          lyrics_plain?: string | null;
          lyrics_synced?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          artist?: string;
          album?: string | null;
          album_artist?: string | null;
          year?: string | null;
          genre?: string | null;
          track_number?: number | null;
          disc_number?: number | null;
          duration?: number;
          format?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          bitrate?: number | null;
          sample_rate?: number | null;
          cover_url?: string | null;
          audio_url?: string;
          storage_path?: string;
          cover_storage_path?: string | null;
          status?: ContentStatus;
          lyrics_plain?: string | null;
          lyrics_synced?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      playlists: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          cover_url: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          cover_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          cover_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      playlist_tracks: {
        Row: {
          id: string;
          playlist_id: string;
          track_id: string;
          position: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          playlist_id: string;
          track_id: string;
          position?: number;
          added_at?: string;
        };
        Update: {
          id?: string;
          playlist_id?: string;
          track_id?: string;
          position?: number;
          added_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey";
            columns: ["playlist_id"];
            isOneToOne: false;
            referencedRelation: "playlists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      memories: {
        Row: {
          id: string;
          code: string | null;
          subject: "game" | "place";
          title: string;
          caption: string | null;
          image_url: string;
          storage_path: string | null;
          aspect_ratio: string;
          editorial_scale: string;
          date: string | null;
          year: string | null;
          featured: boolean;
          metadata: Json;
          status: ContentStatus;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code?: string | null;
          subject: "game" | "place";
          title: string;
          caption?: string | null;
          image_url: string;
          storage_path?: string | null;
          aspect_ratio?: string;
          editorial_scale?: string;
          date?: string | null;
          year?: string | null;
          featured?: boolean;
          metadata?: Json;
          status?: ContentStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string | null;
          subject?: "game" | "place";
          title?: string;
          caption?: string | null;
          image_url?: string;
          storage_path?: string | null;
          aspect_ratio?: string;
          editorial_scale?: string;
          date?: string | null;
          year?: string | null;
          featured?: boolean;
          metadata?: Json;
          status?: ContentStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolio_projects: {
        Row: {
          id: string;
          slug: string;
          index_number: string;
          title: string;
          category: string;
          year: string;
          client: string;
          featured: boolean;
          summary: string;
          roles: string[];
          duration: string | null;
          metrics: Json;
          media_variant: string;
          aspect_ratio: string | null;
          capabilities: string[];
          overview: string | null;
          challenge: string | null;
          insight: string | null;
          strategy: string | null;
          execution: string[];
          results: string | null;
          learnings: string | null;
          status: ContentStatus;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          index_number?: string;
          title: string;
          category: string;
          year: string;
          client: string;
          featured?: boolean;
          summary: string;
          roles?: string[];
          duration?: string | null;
          metrics?: Json;
          media_variant?: string;
          aspect_ratio?: string | null;
          capabilities?: string[];
          overview?: string | null;
          challenge?: string | null;
          insight?: string | null;
          strategy?: string | null;
          execution?: string[];
          results?: string | null;
          learnings?: string | null;
          status?: ContentStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          index_number?: string;
          title?: string;
          category?: string;
          year?: string;
          client?: string;
          featured?: boolean;
          summary?: string;
          roles?: string[];
          duration?: string | null;
          metrics?: Json;
          media_variant?: string;
          aspect_ratio?: string | null;
          capabilities?: string[];
          overview?: string | null;
          challenge?: string | null;
          insight?: string | null;
          strategy?: string | null;
          execution?: string[];
          results?: string | null;
          learnings?: string | null;
          status?: ContentStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type TrackRow = Database["public"]["Tables"]["tracks"]["Row"];
export type TrackInsert = Database["public"]["Tables"]["tracks"]["Insert"];
export type TrackUpdate = Database["public"]["Tables"]["tracks"]["Update"];

export type PlaylistRow = Database["public"]["Tables"]["playlists"]["Row"];
export type AdminUserRow = Database["public"]["Tables"]["admin_users"]["Row"];
export type MemoryRow = Database["public"]["Tables"]["memories"]["Row"];
export type PortfolioProjectRow = Database["public"]["Tables"]["portfolio_projects"]["Row"];
