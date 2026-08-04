import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { PhotoGrid } from "@/components/site/PhotoGrid";
import {
  collectionBySlugQuery,
  collectionPhotosQuery,
  matchLabel,
  subcollectionPhotoCountsQuery,
  subcollectionsQuery,
} from "@/lib/queries";
import { photoUrl, formatDateNl } from "@/lib/photo";

export const Route = createFileRoute("/collecties/$slug/")({
  loader: async ({ context, params }) => {
    const collection = await context.queryClient.ensureQueryData(
      collectionBySlugQuery(params.slug),
    );
    if (!collection) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(subcollectionsQuery(collection.id)),
      context.queryClient.ensureQueryData(collectionPhotosQuery(collection.id)),
      context.queryClient.ensureQueryData(subcollectionPhotoCountsQuery(collection.id)),
    ]);
    return { collection };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Collectie niet gevonden" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.collection.name} — Dennis Hagemeijer Fotografie`;
    const description =
      loaderData.collection.description ||
      `Foto's uit de collectie ${loaderData.collection.name}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="page-shell py-24">
      <h1 className="font-display text-2xl font-semibold">Collectie niet gevonden</h1>
      <Link to="/collecties" className="mt-4 inline-block text-sm text-primary">
        Terug naar collecties
      </Link>
    </div>
  ),
  errorComponent: () => (
    <p className="page-shell py-24 text-sm text-muted-foreground">
      Deze collectie kon niet worden geladen.
    </p>
  ),
  component: CollectionDetail,
});

function CollectionDetail() {
  const { collection } = Route.useLoaderData();
  const { data: subcollections } = useSuspenseQuery(subcollectionsQuery(collection.id));
  const { data: photos } = useSuspenseQuery(collectionPhotosQuery(collection.id));
  const { data: photoCounts } = useSuspenseQuery(
    subcollectionPhotoCountsQuery(collection.id),
  );
  const hasSubcollections = subcollections.length > 0;

  return (
    <div className="pb-8">
      <div className="page-shell pt-10">
        <Link to="/collecties" className="text-xs tracking-wider text-muted-foreground uppercase hover:text-primary">
          ← Collecties
        </Link>
      </div>
      <PageHeader
        eyebrow="Collectie"
        title={collection.name}
        description={collection.description || undefined}
      />

      <div className="page-shell space-y-16">
        {hasSubcollections ? (
          <section>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {subcollections.map((sub) => {
                const cover = photoUrl(sub.cover_photo_url);
                const teams = matchLabel(sub);
                const count = photoCounts[sub.id] ?? 0;
                return (
                  <Link
                    key={sub.id}
                    to="/collecties/$slug/$sub"
                    params={{ slug: collection.slug, sub: sub.slug }}
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {cover ? (
                        <img
                          src={cover}
                          alt={sub.name}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                          Geen omslagfoto
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold group-hover:text-primary">
                      {sub.name}
                    </h3>
                    {teams ? (
                      <p className="mt-1 text-sm font-medium text-foreground">{teams}</p>
                    ) : null}
                    <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                      {[
                        sub.event_date ? formatDateNl(sub.event_date) : null,
                        `${count} ${count === 1 ? "foto" : "foto's"}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <section>
            <PhotoGrid photos={photos} />
          </section>
        )}
      </div>
    </div>
  );
}

