-- Create content authors table
CREATE TABLE IF NOT EXISTS public.content_authors (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create content items table
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL CHECK (section IN ('blog', 'help')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  body_path TEXT NOT NULL,
  cover_image_path TEXT,
  author_key TEXT REFERENCES public.content_authors(key) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (section, slug),
  CHECK (NOT is_archived OR archived_at IS NOT NULL)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS content_items_section_idx ON public.content_items (section);
CREATE INDEX IF NOT EXISTS content_items_published_at_idx ON public.content_items (published_at DESC);
CREATE INDEX IF NOT EXISTS content_items_author_key_idx ON public.content_items (author_key);
CREATE INDEX IF NOT EXISTS content_items_tags_gin_idx ON public.content_items USING gin (tags);

-- Enable RLS
ALTER TABLE public.content_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS content_authors_set_updated_at ON public.content_authors;
CREATE TRIGGER content_authors_set_updated_at BEFORE UPDATE ON public.content_authors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS content_items_set_updated_at ON public.content_items;
CREATE TRIGGER content_items_set_updated_at BEFORE UPDATE ON public.content_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create RLS policies for content_authors
DROP POLICY IF EXISTS "content_authors_select_published_only" ON public.content_authors;
CREATE POLICY "content_authors_select_published_only" ON public.content_authors
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.content_items item
    WHERE item.author_key = content_authors.key
      AND item.is_published
      AND NOT item.is_archived
      AND item.published_at IS NOT NULL
      AND item.published_at <= NOW()
  )
);

DROP POLICY IF EXISTS "content_authors_write_service_only" ON public.content_authors;
CREATE POLICY "content_authors_write_service_only" ON public.content_authors
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Create RLS policies for content_items
DROP POLICY IF EXISTS "content_items_select_published_only" ON public.content_items;
CREATE POLICY "content_items_select_published_only" ON public.content_items
FOR SELECT
TO anon, authenticated
USING (
  is_published
  AND NOT is_archived
  AND published_at IS NOT NULL
  AND published_at <= NOW()
);

DROP POLICY IF EXISTS "content_items_write_service_only" ON public.content_items;
CREATE POLICY "content_items_write_service_only" ON public.content_items
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Create storage buckets for content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('content', 'content', FALSE, 5242880, ARRAY['text/markdown', 'text/plain']),
  ('content-public', 'content-public', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
DROP POLICY IF EXISTS "content_public_assets_read" ON storage.objects;
CREATE POLICY "content_public_assets_read" ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'content-public');

DROP POLICY IF EXISTS "content_private_service_read" ON storage.objects;
CREATE POLICY "content_private_service_read" ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'content');

DROP POLICY IF EXISTS "content_storage_write_service_only" ON storage.objects;
CREATE POLICY "content_storage_write_service_only" ON storage.objects
FOR ALL
TO service_role
USING (bucket_id IN ('content', 'content-public'))
WITH CHECK (bucket_id IN ('content', 'content-public'));
