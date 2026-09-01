import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

import heroImage from "@/assets/hero.jpg";
import wordmark from "@/assets/wordmark.png";
import { Button } from "@/components/ui/button";
import { newsQuery, recentPhotosQuery, collectionsQuery } from "@/lib/queries";
import { SiteSearch } from "@/components/site/SiteSearch";
import { ProtectedPhoto } from "@/components/site/ProtectedPhoto";
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

  const heroSrc = photoUrl(photos[0]?.storage_path ?? null) ?? heroImage;

  return (
    <div>
      {/* Hero — one strong photo, wordmark, tagline */}
      <section className="relative isolate -mt-24 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
        <img
          src={heroSrc}
          alt="Fotografie van Dennis Hagemeijer"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-background/40" />
        <div className="fade-up relative flex flex-col items-center px-6 text-center">
          <img
            src={wordmark}
            alt="Dennis Hagemeijer Fotografie"
            width={1780}
            height={844}
            className="w-[min(30rem,78vw)]"
          />
          <p className="mt-10 max-w-md text-sm leading-loose tracking-[0.06em] text-muted-foreground">
            Macro, natuur, street en voetbal — stil vastgelegd, met aandacht voor licht en
            vakmanschap.
          </p>
          <Button asChild size="lg" className="mt-12">
            <Link to="/collecties">Bekijk portfolio</Link>
          </Button>
        </div>
        <span className="scroll-hint absolute bottom-10 text-muted-foreground">
          <ChevronDown className="size-5" />
        </span>
      </section>

      {/* Search — keyword-first entry into the archive */}
      <section className="page-shell pt-32">
        <SiteSearch placeholder="Zoek op trefwoord, collectie of foto" />
      </section>

      {/* Collections — large photography, minimal chrome */}
      {collections.length > 0 ? (
        <section className="page-shell pt-32">
          <div className="flex flex-wrap items-baseline justify-between gap-6">
            <div>
              <p className="eyebrow">Portfolio</p>
              <h2 className="mt-5 font-display text-4xl sm:text-5xl">Collecties</h2>
            </div>
            <Link
              to="/collecties"
              className="text-[0.6875rem] tracking-[0.22em] text-muted-foreground uppercase transition-colors duration-300 hover:text-primary"
            >
              Alles bekijken
            </Link>
          </div>

          <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2">
            {collections.slice(0, 4).map((collection) => {
              const cover = photoUrl(collection.cover_photo_url);
              return (
                <Link
                  key={collection.id}
                  to="/collecties/$slug"
                  params={{ slug: collection.slug }}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-card">
                    {cover ? (
                      <ProtectedPhoto
                        src={cover}
                        alt={collection.name}
                        wrapperClassName="size-full"
                        className="size-full object-cover opacity-90 transition-all duration-[350ms] ease-out group-hover:scale-[1.02] group-hover:opacity-100"
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-6 font-display text-2xl transition-colors duration-300 group-hover:text-primary">
                    {collection.name}
                  </h3>
                  {collection.description ? (
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                      {collection.description}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Recent work — quiet strip */}
      {photos.length > 1 ? (
        <section className="page-shell pt-32">
          <p className="eyebrow">Recent werk</p>
          <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4">
            {photos.slice(0, 4).map((photo) => (
              <figure key={photo.id} className="relative aspect-square overflow-hidden bg-card">
                <ProtectedPhoto
                  src={photoUrl(photo.storage_path) ?? ""}
                  alt={photo.title || "Foto"}
                  wrapperClassName="size-full"
                  className="size-full object-cover opacity-90 transition-all duration-[350ms] ease-out hover:scale-[1.02] hover:opacity-100"
                />
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* News — editorial, no cards */}
      <section className="page-shell pt-32">
        <p className="eyebrow">Nieuws</p>
        <h2 className="mt-5 font-display text-4xl sm:text-5xl">Laatste updates</h2>
        <span className="rule-accent mt-8" />
        {news.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">Er is nog geen nieuws geplaatst.</p>
        ) : (
          <ul className="mt-12 divide-y divide-border border-t border-border">
            {news.slice(0, 5).map((post) => {
              const image = post.image_path ? photoUrl(post.image_path) : null;
              return (
                <li key={post.id} className="grid gap-6 py-12 md:grid-cols-[9rem_1fr] md:gap-12">
                  <time className="text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
                    {formatDateNl(post.published_at)}
                  </time>
                  <div className="grid gap-6 sm:grid-cols-[16rem_1fr] sm:gap-8">
                    {image ? (
                      <img
                        src={image}
                        alt={post.title}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : null}
                    <div>
                      <h3 className="font-display text-2xl">{post.title}</h3>
                      <p className="mt-4 line-clamp-4 leading-loose whitespace-pre-line text-muted-foreground">
                        {post.body}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
