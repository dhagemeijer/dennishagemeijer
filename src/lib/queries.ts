import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_photo_url: string | null;
  sort_order: number;
  created_at: string;
};

export type Subcollection = {
  id: string;
  collection_id: string;
  name: string;
  slug: string;
  description: string;
  event_date: string | null;
  home_team: string | null;
  away_team: string | null;
  cover_photo_url: string | null;
  sort_order: number;
  created_at: string;
};

/** "Team A — Team B" when both teams are filled in, otherwise null. */
export function matchLabel(sub: {
  home_team: string | null;
  away_team: string | null;
}): string | null {
  const home = sub.home_team?.trim();
  const away = sub.away_team?.trim();
  if (home && away) return `${home} — ${away}`;
  return home || away || null;
}

export type Photo = {
  id: string;
  collection_id: string | null;
  subcollection_id: string | null;
  title: string;
  storage_path: string;
  image_url: string;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
};

export type NewsPost = {
  id: string;
  title: string;
  body: string;
  published_at: string;
  image_path: string | null;
  created_at: string;
};

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export const collectionsQuery = queryOptions({
  queryKey: ["collections"],
  queryFn: async () =>
    unwrap<Collection[]>(
      await supabase
        .from("collections")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ),
});

export const collectionCountsQuery = queryOptions({
  queryKey: ["collection-counts"],
  queryFn: async () => {
    const [subs, photos] = await Promise.all([
      supabase.from("subcollections").select("id, collection_id"),
      supabase.from("photos").select("id, collection_id").is("subcollection_id", null),
    ]);
    if (subs.error) throw new Error(subs.error.message);
    if (photos.error) throw new Error(photos.error.message);
    const counts: Record<string, { subcollections: number; photos: number }> = {};
    for (const row of subs.data ?? []) {
      const key = row.collection_id as string;
      counts[key] ??= { subcollections: 0, photos: 0 };
      counts[key].subcollections += 1;
    }
    for (const row of photos.data ?? []) {
      const key = row.collection_id as string | null;
      if (!key) continue;
      counts[key] ??= { subcollections: 0, photos: 0 };
      counts[key].photos += 1;
    }
    return counts;
  },
});

export const newsQuery = queryOptions({
  queryKey: ["news"],
  queryFn: async () =>
    unwrap<NewsPost[]>(
      await supabase
        .from("news_posts")
        .select("*")
        .order("published_at", { ascending: false })
        .order("created_at", { ascending: false }),
    ),
});

export const recentPhotosQuery = queryOptions({
  queryKey: ["photos", "recent"],
  queryFn: async () =>
    unwrap<Photo[]>(
      await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8),
    ),
});

export function collectionBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["collection", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as Collection | null) ?? null;
    },
  });
}

export function subcollectionsQuery(collectionId: string) {
  return queryOptions({
    queryKey: ["subcollections", collectionId],
    queryFn: async () =>
      unwrap<Subcollection[]>(
        await supabase
          .from("subcollections")
          .select("*")
          .eq("collection_id", collectionId)
          .order("sort_order", { ascending: true })
          .order("event_date", { ascending: false }),
      ),
  });
}

export function collectionPhotosQuery(collectionId: string) {
  return queryOptions({
    queryKey: ["photos", "collection", collectionId],
    queryFn: async () =>
      unwrap<Photo[]>(
        await supabase
          .from("photos")
          .select("*")
          .eq("collection_id", collectionId)
          .is("subcollection_id", null)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
      ),
  });
}

export function subcollectionPhotosQuery(subcollectionId: string) {
  return queryOptions({
    queryKey: ["photos", "subcollection", subcollectionId],
    queryFn: async () =>
      unwrap<Photo[]>(
        await supabase
          .from("photos")
          .select("*")
          .eq("subcollection_id", subcollectionId)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
      ),
  });
}

export function subcollectionQuery(collectionId: string, slug: string) {
  return queryOptions({
    queryKey: ["subcollection", collectionId, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcollections")
        .select("*")
        .eq("collection_id", collectionId)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as Subcollection | null) ?? null;
    },
  });
}

export function subcollectionByIdQuery(id: string) {
  return queryOptions({
    queryKey: ["subcollection-id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcollections")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as Subcollection | null) ?? null;
    },
  });
}

export function collectionByIdQuery(id: string) {
  return queryOptions({
    queryKey: ["collection-id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as Collection | null) ?? null;
    },
  });
}

export type SiteContent = {
  key: string;
  body: string;
  image_path: string | null;
  updated_at: string;
};

export function siteContentQuery(key: string) {
  return queryOptions({
    queryKey: ["site-content", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("key", key)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as SiteContent | null) ?? null;
    },
  });
}

/** Photo count per subcollection within one collection. */
export function subcollectionPhotoCountsQuery(collectionId: string) {
  return queryOptions({
    queryKey: ["subcollection-photo-counts", collectionId],
    queryFn: async () => {
      const { data: subs, error: subsError } = await supabase
        .from("subcollections")
        .select("id")
        .eq("collection_id", collectionId);
      if (subsError) throw new Error(subsError.message);
      const ids = (subs ?? []).map((s) => s.id as string);
      const counts: Record<string, number> = {};
      for (const id of ids) counts[id] = 0;
      if (ids.length === 0) return counts;
      const { data, error } = await supabase
        .from("photos")
        .select("id, subcollection_id")
        .in("subcollection_id", ids);
      if (error) throw new Error(error.message);
      for (const row of data ?? []) {
        const key = row.subcollection_id as string | null;
        if (!key) continue;
        counts[key] = (counts[key] ?? 0) + 1;
      }
      return counts;
    },
  });
}
