import { matchLabel, type SearchIndex, type Subcollection } from "@/lib/queries";
import { photoUrl } from "@/lib/photo";

export type SearchResult =
  | {
      kind: "collection";
      id: string;
      title: string;
      context: string;
      thumb: string | null;
      keywords: string[];
      slug: string;
    }
  | {
      kind: "subcollection";
      id: string;
      title: string;
      context: string;
      thumb: string | null;
      keywords: string[];
      slug: string;
      subSlug: string;
    }
  | {
      kind: "photo";
      id: string;
      title: string;
      context: string;
      thumb: string | null;
      keywords: string[];
      slug: string;
      subSlug: string | null;
    };

function score(term: string, title: string, keywords: string[]): number {
  const name = title.toLowerCase();
  if (keywords.some((k) => k === term)) return 0;
  if (keywords.some((k) => k.includes(term))) return 1;
  if (name.startsWith(term)) return 2;
  if (name.includes(term)) return 3;
  return -1;
}

/** Search collections, subcollections and photos by keyword and by title. */
export function searchAll(index: SearchIndex, query: string, limit = 24): SearchResult[] {
  const term = query.trim().toLowerCase();
  if (term.length < 2) return [];

  const collectionById = new Map(index.collections.map((c) => [c.id, c]));
  const subById = new Map<string, Subcollection>(index.subcollections.map((s) => [s.id, s]));
  const scored: { result: SearchResult; rank: number }[] = [];

  for (const collection of index.collections) {
    const rank = score(term, collection.name, collection.keywords ?? []);
    if (rank < 0) continue;
    scored.push({
      rank,
      result: {
        kind: "collection",
        id: collection.id,
        title: collection.name,
        context: "Collectie",
        thumb: photoUrl(collection.cover_photo_url),
        keywords: collection.keywords ?? [],
        slug: collection.slug,
      },
    });
  }

  for (const sub of index.subcollections) {
    const label = [sub.name, matchLabel(sub)].filter(Boolean).join(" ");
    const rank = score(term, label, sub.keywords ?? []);
    if (rank < 0) continue;
    const parent = collectionById.get(sub.collection_id);
    if (!parent) continue;
    scored.push({
      rank,
      result: {
        kind: "subcollection",
        id: sub.id,
        title: sub.name,
        context: parent.name,
        thumb: photoUrl(sub.cover_photo_url),
        keywords: sub.keywords ?? [],
        slug: parent.slug,
        subSlug: sub.slug,
      },
    });
  }

  for (const photo of index.photos) {
    const rank = score(term, photo.title, photo.keywords ?? []);
    if (rank < 0) continue;
    const parent = photo.collection_id ? collectionById.get(photo.collection_id) : undefined;
    if (!parent) continue;
    const sub = photo.subcollection_id ? subById.get(photo.subcollection_id) : undefined;
    scored.push({
      rank: rank + 0.5,
      result: {
        kind: "photo",
        id: photo.id,
        title: photo.title || "Zonder titel",
        context: [parent.name, sub?.name].filter(Boolean).join(" · "),
        thumb: photoUrl(photo.storage_path),
        keywords: photo.keywords ?? [],
        slug: parent.slug,
        subSlug: sub ? sub.slug : null,
      },
    });
  }

  return scored
    .sort((a, b) => a.rank - b.rank || a.result.title.localeCompare(b.result.title))
    .slice(0, limit)
    .map((entry) => entry.result);
}

export type KeywordUsage = {
  keyword: string;
  collections: { id: string; name: string; slug: string }[];
  subcollections: { id: string; name: string; slug: string; collectionSlug: string }[];
  photos: { id: string; title: string; thumb: string | null }[];
  total: number;
};

/** Aggregate every keyword in use with the items it is attached to. */
export function keywordUsage(index: SearchIndex): KeywordUsage[] {
  const map = new Map<string, KeywordUsage>();
  const get = (keyword: string) => {
    let entry = map.get(keyword);
    if (!entry) {
      entry = { keyword, collections: [], subcollections: [], photos: [], total: 0 };
      map.set(keyword, entry);
    }
    return entry;
  };

  const collectionById = new Map(index.collections.map((c) => [c.id, c]));

  for (const collection of index.collections) {
    for (const keyword of collection.keywords ?? []) {
      const entry = get(keyword);
      entry.collections.push({ id: collection.id, name: collection.name, slug: collection.slug });
      entry.total += 1;
    }
  }
  for (const sub of index.subcollections) {
    const parent = collectionById.get(sub.collection_id);
    for (const keyword of sub.keywords ?? []) {
      const entry = get(keyword);
      entry.subcollections.push({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        collectionSlug: parent?.slug ?? "",
      });
      entry.total += 1;
    }
  }
  for (const photo of index.photos) {
    for (const keyword of photo.keywords ?? []) {
      const entry = get(keyword);
      entry.photos.push({
        id: photo.id,
        title: photo.title || "Zonder titel",
        thumb: photoUrl(photo.storage_path),
      });
      entry.total += 1;
    }
  }

  return [...map.values()].sort(
    (a, b) => b.total - a.total || a.keyword.localeCompare(b.keyword),
  );
}

/** All keywords currently in use, for autocomplete suggestions. */
export function allKeywords(index: SearchIndex): string[] {
  const set = new Set<string>();
  for (const list of [
    ...index.collections.map((c) => c.keywords ?? []),
    ...index.subcollections.map((s) => s.keywords ?? []),
    ...index.photos.map((p) => p.keywords ?? []),
  ]) {
    for (const keyword of list) set.add(keyword);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
