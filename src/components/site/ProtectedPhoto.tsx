import watermarkAsset from "@/assets/watermark.png.asset.json";

const watermarkSrc = watermarkAsset.url;

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
          src={watermarkSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute bottom-4 left-1/2 w-[55%] max-w-[220px] -translate-x-1/2 opacity-80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]"
        />
      ) : null}

      {watermark === "full" ? (
        <>
          <img
            src={watermarkSrc}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute inset-0 m-auto w-1/2 max-w-[420px] opacity-25"
          />
          <img
            src={watermarkSrc}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute bottom-5 left-1/2 w-[30%] max-w-[240px] -translate-x-1/2 opacity-85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]"
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
