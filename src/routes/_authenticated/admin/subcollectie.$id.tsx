import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { subcollectionByIdQuery } from "@/lib/queries";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { formatDateNl } from "@/lib/photo";

export const Route = createFileRoute("/_authenticated/admin/subcollectie/$id")({
  head: () => ({
    meta: [
      { title: "Subcollectie beheren — Dennis Hagemeijer Fotografie" },
      { name: "description", content: "Upload en beheer de foto's van deze subcollectie." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Subcollectie beheren" },
      { property: "og:description", content: "Beheeromgeving." },
    ],
  }),
  component: AdminSubcollection,
});

function AdminSubcollection() {
  const { id } = Route.useParams();
  const { data: sub, isLoading } = useQuery(subcollectionByIdQuery(id));

  if (isLoading) {
    return <p className="page-shell py-12 text-sm text-muted-foreground">Laden…</p>;
  }
  if (!sub) {
    return (
      <div className="page-shell py-12">
        <p className="text-sm text-muted-foreground">Deze subcollectie bestaat niet meer.</p>
        <Link to="/admin" className="mt-4 inline-block text-sm text-primary">
          Terug naar dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-10 py-12">
      <div>
        <Link
          to="/admin/collectie/$id"
          params={{ id: sub.collection_id }}
          className="text-xs tracking-wider text-muted-foreground uppercase hover:text-primary"
        >
          ← Collectie
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold">{sub.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sub.event_date ? formatDateNl(sub.event_date) : "Geen datum"}
        </p>
      </div>

      <PhotoManager target={{ collectionId: sub.collection_id, subcollectionId: sub.id }} />
    </div>
  );
}
