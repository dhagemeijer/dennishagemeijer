import monogram from "@/assets/monogram.png";

type ProtectedPhotoProps = {
  src: string;
  alt: string;
  className?: string;
  /** Wrapper classes; the wrapper is relative so watermark + shield can stack. */
  wrapperClassName?: string;
  /** "corner" for thumbnails/covers, "full" for the fullscreen viewer. */
  watermark?: "corner" | "full" | "none";
  loading?: "lazy" | "eager";
};

/**
 * Photo renderer with a visible logo watermark and basic save/copy deterrents:
 * right-click, drag and long-press are blocked and a transparent shield sits on
 * top of the image so "afbeelding opslaan" targets an empty layer.
 */
export function ProtectedPhoto({
  src,
  alt,
  className,
  wrapperClassName,
  watermark = "corner",
  loading = "lazy",
}: ProtectedPhotoProps) {
  return (
    <span className={`relative block select-none ${wrapperClassName ?? ""}`}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        draggable={false}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
        className={`pointer-events-none select-none ${className ?? ""}`}
        style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
      />

      {watermark === "corner" ? (
        <img
          src={monogram}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute right-3 bottom-3 h-5 w-auto opacity-55 mix-blend-screen"
        />
      ) : null}

      {watermark === "full" ? (
        <>
          <img
            src={monogram}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute inset-0 m-auto h-1/4 w-auto opacity-[0.14]"
          />
          <img
            src={monogram}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute right-4 bottom-4 h-7 w-auto opacity-60 mix-blend-screen"
          />
        </>
      ) : null}

      {/* Transparent shield: intercepts right-click / long-press on the image. */}
      <span
        aria-hidden="true"
        onContextMenu={(event) => event.preventDefault()}
        className="absolute inset-0 block"
        style={{ WebkitTouchCallout: "none" }}
      />
    </span>
  );
}
