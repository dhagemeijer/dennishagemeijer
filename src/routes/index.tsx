import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import heroImage from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { newsQuery, recentPhotosQuery, collectionsQuery } from "@/lib/queries";
import { photoUrl, formatDateNl } from "@/lib/photo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dennis Hagemeijer Fotografie — Macro, natuur, street & voetbal" },
      {
        name: "description",
        content:
          "Fotografie van Dennis Hagemeijer: macro, natuur, street en voetbal. Bekijk de collecties en het laatste nieuws.",
      },
      { property: "og:title", content: "Dennis Hagemeijer Fotografie" },
      {
        property: "og:description",
        content: "Macro, natuur, street en voetbalfotografie uit Nederland.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(newsQuery),
      context.queryClient.ensureQueryData(recentPhotosQuery),
      context.queryClient.ensureQueryData(collectionsQuery),
    ]);
  },
  errorComponent: () => (
    <p className="page-shell py-24 text-sm text-muted-foreground">
      De pagina kon niet worden geladen.
    </p>
  ),
  component: Home,
});

function Home() {
  const { data: news } = useSuspenseQuery(newsQuery);
  const { data: photos } = useSuspenseQuery(recentPhotosQuery);
  const { data: collections } = useSuspenseQuery(collectionsQuery);

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroImage}
          alt="Fotograaf in de mist bij zonsopkomst"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="page-shell relative flex min-h-[70vh] flex-col justify-end py-20">
          <p className="text-[0.6875rem] tracking-[0.28em] text-primary uppercase">
            Fotografie uit Nederland
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] font-semibold sm:text-6xl">
            Momenten in macro, natuur, street en voetbal.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-foreground/80">
            Ik ben Dennis Hagemeijer. Ik fotografeer wat me raakt — van het kleinste insect tot de
            grootste ontlading langs de lijn. Bekijk mijn werk per collectie.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/collecties">
                Bekijk collecties <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ink-foreground/30 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
            >
              <Link to="/contact">Neem contact op</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="page-shell pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Recent werk</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Uitgelichte foto&apos;s</h2>
          </div>
          <Link
            to="/collecties"
            className="text-sm text-muted-foreground underline decoration-primary decoration-2 underline-offset-4 hover:text-foreground"
          >
            Alle collecties
          </Link>
        </div>

        {photos.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Er zijn nog geen foto&apos;s geüpload. Voeg werk toe via het beheer.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {photos.map((photo) => (
              <figure key={photo.id} className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={photoUrl(photo.storage_path) ?? ""}
                  alt={photo.title || "Foto"}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </figure>
            ))}
          </div>
        )}
      </section>

      {collections.length > 0 ? (
        <section className="page-shell pt-20">
          <p className="eyebrow">Collecties</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to="/collecties/$slug"
                params={{ slug: collection.slug }}
                className="border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                {collection.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="page-shell pt-20">
        <p className="eyebrow">Nieuws</p>
        <h2 className="mt-3 font-display text-3xl font-semibold">Laatste updates</h2>
        <span className="rule-accent mt-6" />
        {news.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">Er is nog geen nieuws geplaatst.</p>
        ) : (
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {news.slice(0, 5).map((post) => (
              <li key={post.id} className="grid gap-2 py-8 md:grid-cols-[10rem_1fr] md:gap-8">
                <time className="text-sm text-muted-foreground">
                  {formatDateNl(post.published_at)}
                </time>
                <div>
                  <h3 className="font-display text-xl font-semibold">{post.title}</h3>
                  <p className="mt-2 leading-relaxed whitespace-pre-line text-muted-foreground">
                    {post.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
