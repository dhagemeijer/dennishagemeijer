import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";

import { searchIndexQuery } from "@/lib/queries";
import { keywordUsage } from "@/lib/search";

export const Route = createFileRoute("/_authenticated/admin/trefwoorden")({
  head: () => ({
    meta: [
      { title: "Trefwoorden — Dennis Hagemeijer Fotografie" },
      { name: "description", content: "Overzicht van alle trefwoorden en waar ze gebruikt worden." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Trefwoorden beheren" },
      { property: "og:description", content: "Beheeromgeving." },
    ],
  }),
  component: KeywordsAdminPage,
});

function KeywordsAdminPage() {
  const { data: index, isLoading } = useQuery(searchIndexQuery);
  const [open, setOpen] = useState<string | null>(null);
  const usage = useMemo(() => (index ? keywordUsage(index) : []), [index]);

  return (
    <div className="page-shell space-y-10 py-12">
      <div>
        <Link
          to="/admin"
          className="text-xs tracking-wider text-muted-foreground uppercase hover:text-primary"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-3 font-display text-3xl">Trefwoorden</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Alle trefwoorden die in gebruik zijn, met het aantal collecties, subcollecties en
          foto&apos;s eraan gekoppeld.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden…</p>
      ) : usage.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nog geen trefwoorden. Voeg ze toe bij een collectie, subcollectie of foto.
        </p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {usage.map((entry) => {
            const expanded = open === entry.keyword;
            return (
              <li key={entry.keyword} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : entry.keyword)}
                  className="flex w-full items-center gap-3 text-left"
                >
                  {expanded ? (
                    <ChevronDown className="size-4 text-primary" />
                  ) : (
                    <ChevronRight className="size-4 text-primary" />
                  )}
                  <span className="font-medium">{entry.keyword}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {entry.total} {entry.total === 1 ? "koppeling" : "koppelingen"} ·{" "}
                    {entry.collections.length} collecties · {entry.subcollections.length}{" "}
                    subcollecties · {entry.photos.length} foto&apos;s
                  </span>
                </button>

                {expanded ? (
                  <div className="mt-4 space-y-4 pl-7">
                    {entry.collections.length > 0 ? (
                      <div>
                        <p className="text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
                          Collecties
                        </p>
                        <ul className="mt-2 space-y-1 text-sm">
                          {entry.collections.map((c) => (
                            <li key={c.id}>
                              <Link
                                to="/admin/collectie/$id"
                                params={{ id: c.id }}
                                className="hover:text-primary"
                              >
                                {c.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {entry.subcollections.length > 0 ? (
                      <div>
                        <p className="text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
                          Subcollecties
                        </p>
                        <ul className="mt-2 space-y-1 text-sm">
                          {entry.subcollections.map((s) => (
                            <li key={s.id}>
                              <Link
                                to="/admin/subcollectie/$id"
                                params={{ id: s.id }}
                                className="hover:text-primary"
                              >
                                {s.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {entry.photos.length > 0 ? (
                      <div>
                        <p className="text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
                          Foto&apos;s
                        </p>
                        <ul className="mt-2 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                          {entry.photos.map((p) => (
                            <li key={p.id} className="space-y-1">
                              <div className="aspect-[4/3] overflow-hidden bg-card">
                                {p.thumb ? (
                                  <img
                                    src={p.thumb}
                                    alt=""
                                    loading="lazy"
                                    className="size-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <p className="truncate text-xs text-muted-foreground">{p.title}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
