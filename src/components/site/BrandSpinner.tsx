import monogram from "@/assets/monogram.png";

export function BrandSpinner({ label = "Laden…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 bg-background">
      <img
        src={monogram}
        alt=""
        aria-hidden="true"
        width={480}
        height={309}
        className="h-10 w-auto animate-pulse opacity-70"
      />
      <span className="text-[0.6875rem] tracking-[0.22em] text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}
