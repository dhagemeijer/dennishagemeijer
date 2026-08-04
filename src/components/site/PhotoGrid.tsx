import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import monogram from "@/assets/monogram.png";
import { photoUrl, formatDateNl } from "@/lib/photo";
import type { Photo } from "@/lib/queries";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const active = index === null ? null : photos[index];

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setIndex((current) =>
        current === null ? current : (current + delta + photos.length) % photos.length,
      ),
    [photos.length],
  );

  // Open the lightbox directly when arriving from search with a #foto-<id> hash.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#foto-")) return;
    const target = photos.findIndex((photo) => photo.id === hash.slice("#foto-".length));
    if (target >= 0) setIndex(target);
  }, [photos]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, step]);

  if (photos.length === 0) {
    return (
      <p className="py-20 text-sm text-muted-foreground">
        Er zijn nog geen foto&apos;s in deze collectie.
      </p>
    );
  }

  return (
    <>
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
        {photos.map((photo, i) => {
          const src = photoUrl(photo.storage_path);
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden bg-card"
            >
              {src ? (
                <img
                  src={src}
                  alt={photo.title || "Foto"}
                  loading="lazy"
                  className="w-full object-cover opacity-95 transition-all duration-[350ms] ease-out group-hover:scale-[1.02] group-hover:opacity-100"
                />
              ) : null}
              <img
                src={monogram}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="pointer-events-none absolute right-3 bottom-3 h-4 w-auto opacity-0 transition-opacity duration-300 group-hover:opacity-40"
              />
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title || "Foto"}
          className="fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-6 py-5">
            <span className="text-[0.6875rem] tracking-[0.22em] text-muted-foreground uppercase">
              {index !== null ? `${index + 1} / ${photos.length}` : null}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Sluiten"
              className="text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Vorige foto"
              className="absolute left-2 z-10 p-3 text-muted-foreground transition-colors duration-300 hover:text-primary sm:left-6"
            >
              <ChevronLeft className="size-7" />
            </button>
            <img
              src={photoUrl(active.storage_path) ?? ""}
              alt={active.title || "Foto"}
              className="max-h-[82vh] max-w-full object-contain"
            />
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Volgende foto"
              className="absolute right-2 z-10 p-3 text-muted-foreground transition-colors duration-300 hover:text-primary sm:right-6"
            >
              <ChevronRight className="size-7" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-6 pb-8 text-xs text-muted-foreground">
            <span className="font-display text-base text-foreground">
              {active.title || "Zonder titel"}
            </span>
            <span className="tracking-[0.14em] uppercase">
              {[(active.keywords ?? []).join(" · "), formatDateNl(active.created_at)]
                .filter(Boolean)
                .join("  —  ")}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
