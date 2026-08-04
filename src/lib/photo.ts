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
