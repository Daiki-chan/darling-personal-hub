-- ==============================================================================
-- DARLING PERSONAL HUB — SUPABASE INITIAL DATABASE SCHEMA & STORAGE POLICIES
-- ==============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ADMIN USERS & RBAC
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the executing user is an active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper function to check if user has any dashboard access (admin or editor)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$;

-- RLS: admin_users can only be viewed and managed by admins
CREATE POLICY "Admins can view and manage admin users"
    ON public.admin_users
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Allow users to view their own profile row
CREATE POLICY "Users can view their own admin profile"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 2. MUSIC TRACKS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    album_artist TEXT,
    year TEXT,
    genre TEXT,
    track_number INTEGER,
    disc_number INTEGER,
    duration INTEGER NOT NULL DEFAULT 0, -- Duration in seconds
    format TEXT,                        -- mp3, flac, wav, m4a, ogg
    mime_type TEXT,                     -- audio/mpeg, audio/flac, etc.
    file_size BIGINT,                   -- in bytes
    bitrate INTEGER,                    -- in kbps
    sample_rate INTEGER,                -- in Hz
    cover_url TEXT,                     -- Public URL for track/album artwork
    audio_url TEXT NOT NULL,            -- Public or signed URL for audio playback
    storage_path TEXT NOT NULL,         -- Path in Supabase Storage 'audio' bucket
    cover_storage_path TEXT,            -- Path in Supabase Storage 'covers' bucket
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    lyrics_plain TEXT,
    lyrics_synced JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tracks_status ON public.tracks(status);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON public.tracks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_artist_album ON public.tracks(artist, album);

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Public can only view published tracks
CREATE POLICY "Public can view published tracks"
    ON public.tracks
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published');

-- Admins and staff have full access to all tracks
CREATE POLICY "Staff can manage all tracks"
    ON public.tracks
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ------------------------------------------------------------------------------
-- 3. PLAYLISTS & PLAYLIST TRACKS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_playlists_is_public ON public.playlists(is_public);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public playlists"
    ON public.playlists
    FOR SELECT
    TO anon, authenticated
    USING (is_public = true);

CREATE POLICY "Staff can manage playlists"
    ON public.playlists
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE TABLE IF NOT EXISTS public.playlist_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_playlist_track UNIQUE (playlist_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON public.playlist_tracks(playlist_id, position ASC);

ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public playlist tracks"
    ON public.playlist_tracks
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.playlists p
            WHERE p.id = playlist_tracks.playlist_id AND p.is_public = true
        )
        AND
        EXISTS (
            SELECT 1 FROM public.tracks t
            WHERE t.id = playlist_tracks.track_id AND t.status = 'published'
        )
    );

CREATE POLICY "Staff can manage playlist tracks"
    ON public.playlist_tracks
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ------------------------------------------------------------------------------
-- 4. MEMORIES CMS FOUNDATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE,                   -- e.g. 'G/001' or 'P/001'
    subject TEXT NOT NULL CHECK (subject IN ('game', 'place')),
    title TEXT NOT NULL,
    caption TEXT,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    aspect_ratio TEXT NOT NULL DEFAULT '16:9',
    editorial_scale TEXT NOT NULL DEFAULT 'standard',
    date TEXT,
    year TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- { gameTitle, area, character, location, coordinates }
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_memories_status ON public.memories(status);
CREATE INDEX IF NOT EXISTS idx_memories_subject ON public.memories(subject);
CREATE INDEX IF NOT EXISTS idx_memories_sort ON public.memories(sort_order ASC, created_at DESC);

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published memories"
    ON public.memories
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published');

CREATE POLICY "Staff can manage memories"
    ON public.memories
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ------------------------------------------------------------------------------
-- 5. PORTFOLIO CMS FOUNDATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    index_number TEXT NOT NULL DEFAULT '01',
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    year TEXT NOT NULL,
    client TEXT NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT false,
    summary TEXT NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{}',
    duration TEXT,
    metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    media_variant TEXT NOT NULL DEFAULT 'system',
    aspect_ratio TEXT DEFAULT 'landscape',
    capabilities TEXT[] NOT NULL DEFAULT '{}',
    overview TEXT,
    challenge TEXT,
    insight TEXT,
    strategy TEXT,
    execution TEXT[] NOT NULL DEFAULT '{}',
    results TEXT,
    learnings TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_portfolio_status ON public.portfolio_projects(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_slug ON public.portfolio_projects(slug);

ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published portfolio projects"
    ON public.portfolio_projects
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published');

CREATE POLICY "Staff can manage portfolio projects"
    ON public.portfolio_projects
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ------------------------------------------------------------------------------
-- 6. AUTOMATIC UPDATED_AT TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_tracks_updated_at
    BEFORE UPDATE ON public.tracks
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE OR REPLACE TRIGGER set_playlists_updated_at
    BEFORE UPDATE ON public.playlists
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE OR REPLACE TRIGGER set_memories_updated_at
    BEFORE UPDATE ON public.memories
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE OR REPLACE TRIGGER set_portfolio_updated_at
    BEFORE UPDATE ON public.portfolio_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE OR REPLACE TRIGGER set_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ------------------------------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKETS SETUP & STORAGE POLICIES
-- ------------------------------------------------------------------------------
-- Insert buckets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('audio', 'audio', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/x-flac', 'audio/wav', 'audio/x-wav', 'audio/x-m4a', 'audio/mp4', 'audio/ogg', 'audio/aac']),
    ('covers', 'covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Public read for audio and covers
CREATE POLICY "Public can read audio files"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'audio');

CREATE POLICY "Public can read cover images"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'covers');

-- Storage RLS: Staff can upload/update/delete audio files
CREATE POLICY "Staff can manage audio files"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'audio' AND public.is_staff())
    WITH CHECK (bucket_id = 'audio' AND public.is_staff());

-- Storage RLS: Staff can upload/update/delete cover images
CREATE POLICY "Staff can manage cover images"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'covers' AND public.is_staff())
    WITH CHECK (bucket_id = 'covers' AND public.is_staff());
