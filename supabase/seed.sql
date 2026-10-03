-- ==============================================================================
-- DARLING PERSONAL HUB — SUPABASE SEED DATA (LOCAL / STAGING)
-- ==============================================================================

-- Example: Seed an initial playlist or placeholder metadata
INSERT INTO public.playlists (id, name, description, is_public)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Darling Selects', 'Curated personal recordings and releases', true)
ON CONFLICT (id) DO NOTHING;
