import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { collectionsQuery, collectionCountsQuery } from "@/lib/queries";
import { photoUrl } from "@/lib/photo";

export const Route = createFileRoute("/collecties/")({
  head: () => ({
    meta: [
      { title: "Collecties — Dennis Hagemeijer Fotografie" },
      {
        name: "description",
        content:
          "Alle fotocollecties van Dennis Hagemeijer: macro, natuur, street en voetbal, met wedstrijden per subcollectie.",
      },
      { property: "og:title", content: "Collecties — Dennis Hagemeijer Fotografie" },
      {
        property: "og:description",
        content: "Bekijk de fotocollecties: macro, natuur, street en voetbal.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(collectionsQuery),
      context.queryClient.ensureQueryData(collectionCountsQuery),
    ]);
  },
  errorComponent: () => (
    <p className="page-shell py-24 text-sm text-muted-foreground">
      De collecties konden niet worden geladen.
    </p>
  ),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { data: collections } = useSuspenseQuery(collectionsQuery);
  const { data: counts } = useSuspenseQuery(collectionCountsQuery);

  return (
    <div className="pb-8">
      <PageHeader
        eyebrow="Werk"
        title="Collecties"
        description="Elke collectie bundelt werk rond één thema. Voetbal is verder opgedeeld per wedstrijd."
      />

      <div className="page-shell">
        {collections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Er zijn nog geen collecties aangemaakt.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => {
              const count = counts[collection.id];
              const label =
                count && count.subcollections > 0
                  ? `${count.subcollections} ${count.subcollections === 1 ? "subcollectie" : "subcollecties"}`
                  : `${count?.photos ?? 0} ${count?.photos === 1 ? "foto" : "foto's"}`;
              const cover = photoUrl(collection.cover_photo_url);

              return (
                <Link
                  key={collection.id}
                  to="/collecties/$slug"
                  params={{ slug: collection.slug }}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {cover ? (
                      <img
                        src={cover}
                        alt={collection.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        Geen omslagfoto
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <h2 className="font-display text-xl font-semibold group-hover:text-primary">
                      {collection.name}
                    </h2>
                    <span className="text-xs tracking-wider text-muted-foreground uppercase">
                      {label}
                    </span>
                  </div>
                  {collection.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {collection.description}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
