/** Public URL for a photo stored in the private "photos" bucket. */
export function photoUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  if (storagePath.startsWith("http") || storagePath.startsWith("/")) return storagePath;
  return `/api/public/img/${storagePath.split("/").map(encodeURIComponent).join("/")}`;
}

export function formatDateNl(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

/** Upload a single image to the private "photos" bucket, returns the storage path. */
export async function uploadImage(
  supabase: {
    storage: {
      from: (b: string) => {
        upload: (
          path: string,
          file: File,
          options: { contentType: string; upsert: boolean },
        ) => Promise<{ error: { message: string } | null }>;
      };
    };
  },
  file: File,
  folder: string,
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage
    .from("photos")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}
