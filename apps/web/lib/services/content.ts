import { createAdminClient, createServerSupabaseClient } from "@meet4coffee/supabase";

import type {
  ContentAuthorRecord,
  ContentItemRecord,
  ContentSection,
  PublishedContentItem,
  PublishedContentListItem,
} from "@/lib/app-types";

type ContentListRow = Pick<
  ContentItemRecord,
  "id" | "section" | "slug" | "title" | "excerpt" | "tags" | "cover_image_path" | "published_at" | "updated_at"
> & {
  author: Pick<ContentAuthorRecord, "key" | "name" | "avatar_path"> | null;
};

type ContentItemRow = ContentItemRecord & {
  author: ContentAuthorRecord | null;
};

async function getContentClient() {
  try {
    return { client: createAdminClient(), canReadPrivateStorage: true };
  } catch {
    return { client: await createServerSupabaseClient(), canReadPrivateStorage: false };
  }
}

function withPublishedScope<TBuilder extends { eq: (...args: unknown[]) => TBuilder }>(builder: TBuilder) {
  return builder.eq("is_published", true).eq("is_archived", false);
}

export async function listPublishedContent(section: ContentSection): Promise<PublishedContentListItem[]> {
  const { client } = await getContentClient();
  const now = new Date().toISOString();
  const builder = client
    .from("content_items")
    .select(
      "id, section, slug, title, excerpt, tags, cover_image_path, published_at, updated_at, author:content_authors!content_items_author_key_fkey(key, name, avatar_path)",
    )
    .eq("section", section)
    .lte("published_at", now)
    .order("published_at", { ascending: false });

  const { data } = await withPublishedScope(builder);
  return ((data ?? []) as ContentListRow[]).map((item) => ({
    ...item,
    tags: item.tags ?? [],
  }));
}

export async function getPublishedContentBySlug(
  section: ContentSection,
  slug: string,
): Promise<PublishedContentItem | null> {
  const { client, canReadPrivateStorage } = await getContentClient();
  const now = new Date().toISOString();
  const builder = client
    .from("content_items")
    .select(
      "id, section, slug, title, excerpt, seo_title, seo_description, tags, body_path, cover_image_path, author_key, is_published, published_at, is_archived, archived_at, created_at, updated_at, author:content_authors!content_items_author_key_fkey(*)",
    )
    .eq("section", section)
    .eq("slug", slug)
    .lte("published_at", now)
    .maybeSingle();

  const { data } = await withPublishedScope(builder);

  if (!data) {
    return null;
  }

  const item = data as ContentItemRow;
  let body = "";

  if (item.body_path && canReadPrivateStorage) {
    const { data: bodyFile } = await client.storage.from("content").download(item.body_path);
    if (bodyFile) {
      body = await bodyFile.text();
    }
  }

  return {
    ...item,
    tags: item.tags ?? [],
    body,
  };
}
