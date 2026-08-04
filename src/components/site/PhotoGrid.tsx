import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { photoUrl, formatDateNl } from "@/lib/photo";
import type { Photo } from "@/lib/queries";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <p className="py-12 text-sm text-muted-foreground">
        Er zijn nog geen foto&apos;s in deze collectie.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => {
          const src = photoUrl(photo.storage_path);
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActive(photo)}
              className="group relative aspect-square overflow-hidden bg-muted"
            >
              {src ? (
                <img
                  src={src}
                  alt={photo.title || "Foto"}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
              <span className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/20" />
            </button>
          );
        })}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-5xl border-none bg-ink p-2 sm:p-4">
          <DialogTitle className="sr-only">{active?.title || "Foto"}</DialogTitle>
          {active ? (
            <figure>
              <img
                src={photoUrl(active.storage_path) ?? ""}
                alt={active.title || "Foto"}
                className="max-h-[75vh] w-full object-contain"
              />
              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2 pb-1 text-xs text-ink-foreground/70">
                <span className="text-ink-foreground">{active.title || "Zonder titel"}</span>
                <span>{formatDateNl(active.created_at)}</span>
              </figcaption>
            </figure>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
