export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="page-shell fade-up pt-20 pb-16 sm:pt-28">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl">{title}</h1>
      <span className="rule-accent mt-8" />
      {description ? (
        <p className="mt-8 max-w-2xl text-base leading-loose text-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}
