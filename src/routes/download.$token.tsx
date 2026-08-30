import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { getDownloadBundle } from "@/lib/orders.functions";
import { formatDateNl } from "@/lib/photo";

export const Route = createFileRoute("/download/$token")({
  head: () => ({
    meta: [
      { title: "Je downloads — Dennis Hagemeijer Fotografie" },
      { name: "description", content: "Download de foto's uit je bestelling." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Je downloads — Dennis Hagemeijer Fotografie" },
      { property: "og:description", content: "Download de foto's uit je bestelling." },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  const { token } = Route.useParams();
  const fetchBundle = useServerFn(getDownloadBundle);
  const { data, isLoading } = useQuery({
    queryKey: ["download", token],
    queryFn: () => fetchBundle({ data: { token } }),
  });

  return (
    <div className="page-shell max-w-2xl py-16">
      <PageHeader eyebrow="Downloads" title="Je foto's" />
      {isLoading ? (
        <p className="py-12 text-sm text-muted-foreground">Laden…</p>
      ) : !data?.ok ? (
        <p className="py-12 text-sm text-muted-foreground">
          Deze downloadlink is niet (meer) geldig. Laat het me weten en ik stuur een nieuwe.
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-muted-foreground">
            Geldig tot {formatDateNl(data.expiresAt)}. Elke download kan één keer worden gebruikt.
          </p>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {data.files.map((file) => (
              <li key={file.token} className="flex items-center justify-between gap-4 p-5">
                <span className="text-sm">{file.title}</span>
                {file.used ? (
                  <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                    Gedownload
                  </span>
                ) : (
                  <a
                    href={`/api/public/download/${file.token}`}
                    className="inline-flex items-center gap-2 text-xs tracking-[0.14em] text-primary uppercase"
                  >
                    <Download className="size-4" /> Download
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
