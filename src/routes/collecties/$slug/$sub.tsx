import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { PhotoGrid } from "@/components/site/PhotoGrid";
import {
  collectionBySlugQuery,
  matchLabel,
  subcollectionPhotosQuery,
  subcollectionQuery,
} from "@/lib/queries";
import { formatDateNl } from "@/lib/photo";

export const Route = createFileRoute("/collecties/$slug/$sub")({
  loader: async ({ context, params }) => {
    const collection = await context.queryClient.ensureQueryData(
      collectionBySlugQuery(params.slug),
    );
    if (!collection) throw notFound();
    const subcollection = await context.queryClient.ensureQueryData(
      subcollectionQuery(collection.id, params.sub),
    );
    if (!subcollection) throw notFound();
    await context.queryClient.ensureQueryData(subcollectionPhotosQuery(subcollection.id));
    return { collection, subcollection };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Subcollectie niet gevonden" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.subcollection.name} — ${loaderData.collection.name}`;
    const description =
      loaderData.subcollection.description || `Foto's uit ${loaderData.subcollection.name}.`;
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
      <h1 className="font-display text-2xl font-semibold">Niet gevonden</h1>
      <Link to="/collecties" className="mt-4 inline-block text-sm text-primary">
        Terug naar collecties
      </Link>
    </div>
  ),
  errorComponent: () => (
    <p className="page-shell py-24 text-sm text-muted-foreground">
      Deze subcollectie kon niet worden geladen.
    </p>
  ),
  component: SubcollectionDetail,
});

function SubcollectionDetail() {
  const { collection, subcollection } = Route.useLoaderData();
  const { data: photos } = useSuspenseQuery(subcollectionPhotosQuery(subcollection.id));
  const teams = matchLabel(subcollection);

  return (
    <div className="pb-8">
      <div className="page-shell pt-10">
        <Link
          to="/collecties/$slug"
          params={{ slug: collection.slug }}
          className="text-xs tracking-wider text-muted-foreground uppercase hover:text-primary"
        >
          ← {collection.name}
        </Link>
      </div>
      <PageHeader
        eyebrow={
          [teams, subcollection.event_date ? formatDateNl(subcollection.event_date) : null]
            .filter(Boolean)
            .join(" · ") || collection.name
        }
        title={subcollection.name}
        description={subcollection.description || undefined}
      />
      <div className="page-shell">
        <PhotoGrid photos={photos} />
      </div>
    </div>
  );
}

