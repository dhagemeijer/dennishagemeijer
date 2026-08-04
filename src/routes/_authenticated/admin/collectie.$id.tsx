import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { collectionByIdQuery } from "@/lib/queries";
import { SubcollectionsAdmin } from "@/components/admin/SubcollectionsAdmin";
import { PhotoManager } from "@/components/admin/PhotoManager";

export const Route = createFileRoute("/_authenticated/admin/collectie/$id")({
  head: () => ({
    meta: [
      { title: "Collectie beheren — Dennis Hagemeijer Fotografie" },
      { name: "description", content: "Beheer subcollecties en foto's van deze collectie." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Collectie beheren" },
      { property: "og:description", content: "Beheeromgeving." },
    ],
  }),
  component: AdminCollection,
});

function AdminCollection() {
  const { id } = Route.useParams();
  const { data: collection, isLoading } = useQuery(collectionByIdQuery(id));

  if (isLoading) {
    return <p className="page-shell py-12 text-sm text-muted-foreground">Laden…</p>;
  }
  if (!collection) {
    return (
      <div className="page-shell py-12">
        <p className="text-sm text-muted-foreground">Deze collectie bestaat niet meer.</p>
        <Link to="/admin" className="mt-4 inline-block text-sm text-primary">
          Terug naar dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-14 py-12">
      <div>
        <Link to="/admin" className="text-xs tracking-wider text-muted-foreground uppercase hover:text-primary">
          ← Dashboard
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold">{collection.name}</h1>
        {collection.description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{collection.description}</p>
        ) : null}
      </div>

      <SubcollectionsAdmin collectionId={collection.id} />

      <div className="space-y-6">
        <h2 className="font-display text-xl font-semibold">Foto&apos;s direct in deze collectie</h2>
        <PhotoManager target={{ collectionId: collection.id }} />
      </div>
    </div>
  );
}
