import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";

import { searchIndexQuery } from "@/lib/queries";
import { searchAll, type SearchResult } from "@/lib/search";

function ResultBody({ result }: { result: SearchResult }) {
  return (
    <>
      <div className="size-16 shrink-0 overflow-hidden bg-card">
        {result.thumb ? (
          <img
            src={result.thumb}
            alt=""
            loading="lazy"
            className="size-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg transition-colors duration-300 group-hover:text-primary">
          {result.title}
        </p>
        <p className="truncate text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
          {result.context}
        </p>
        {result.keywords.length > 0 ? (
          <p className="mt-1 truncate text-xs text-muted-foreground/70">
            {result.keywords.join(" · ")}
          </p>
        ) : null}
      </div>
    </>
  );
}

const rowClass =
  "group flex items-center gap-4 border-b border-border py-4 transition-colors duration-300";

function ResultRow({ result }: { result: SearchResult }) {
  if (result.kind === "collection") {
    return (
      <Link to="/collecties/$slug" params={{ slug: result.slug }} className={rowClass}>
        <ResultBody result={result} />
      </Link>
    );
  }
  if (result.kind === "subcollection") {
    return (
      <Link
        to="/collecties/$slug/$sub"
        params={{ slug: result.slug, sub: result.subSlug }}
        className={rowClass}
      >
        <ResultBody result={result} />
      </Link>
    );
  }
  if (result.subSlug) {
    return (
      <Link
        to="/collecties/$slug/$sub"
        params={{ slug: result.slug, sub: result.subSlug }}
        hash={`foto-${result.id}`}
        className={rowClass}
      >
        <ResultBody result={result} />
      </Link>
    );
  }
  return (
    <Link
      to="/collecties/$slug"
      params={{ slug: result.slug }}
      hash={`foto-${result.id}`}
      className={rowClass}
    >
      <ResultBody result={result} />
    </Link>
  );
}

export function SiteSearch({ placeholder }: { placeholder?: string }) {
  const [term, setTerm] = useState("");
  const active = term.trim().length >= 2;
  const { data: index } = useQuery({ ...searchIndexQuery, enabled: active });

  const results = useMemo(
    () => (active && index ? searchAll(index, term) : []),
    [active, index, term],
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Search className="size-4 shrink-0 text-primary" />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder ?? "Zoek op trefwoord, collectie of titel"}
          aria-label="Zoeken"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {term ? (
          <button
            type="button"
            onClick={() => setTerm("")}
            aria-label="Zoekopdracht wissen"
            className="text-muted-foreground transition-colors duration-300 hover:text-primary"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {active ? (
        results.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">
            Geen resultaten voor &ldquo;{term.trim()}&rdquo;.
          </p>
        ) : (
          <ul className="mt-2">
            {results.map((result) => (
              <li key={`${result.kind}-${result.id}`}>
                <ResultRow result={result} />
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
