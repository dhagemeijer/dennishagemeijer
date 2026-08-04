import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_KEYWORDS,
  MIN_KEYWORDS,
  keywordsError,
  normalizeKeyword,
} from "@/lib/keywords";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  id?: string;
  showError?: boolean;
};

export function KeywordInput({
  value,
  onChange,
  suggestions = [],
  id = "keywords",
  showError = false,
}: Props) {
  const [draft, setDraft] = useState("");
  const error = keywordsError(value);

  const matches = useMemo(() => {
    const term = normalizeKeyword(draft);
    if (!term) return [];
    return suggestions
      .filter((s) => s.includes(term) && !value.includes(s))
      .slice(0, 6);
  }, [draft, suggestions, value]);

  const add = (raw: string) => {
    const keyword = normalizeKeyword(raw);
    if (!keyword) return;
    if (value.includes(keyword)) {
      setDraft("");
      return;
    }
    if (value.length >= MAX_KEYWORDS) return;
    onChange([...value, keyword]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>Trefwoorden</Label>
        <span className="text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase">
          {value.length}/{MAX_KEYWORDS}
        </span>
      </div>

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((keyword) => (
            <li key={keyword}>
              <button
                type="button"
                onClick={() => onChange(value.filter((k) => k !== keyword))}
                className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-foreground transition-colors duration-300 hover:border-primary hover:text-primary"
                aria-label={`Trefwoord ${keyword} verwijderen`}
              >
                {keyword}
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Input
        id={id}
        value={draft}
        placeholder={
          value.length >= MAX_KEYWORDS ? "Maximum bereikt" : "Typ een trefwoord en druk op Enter"
        }
        disabled={value.length >= MAX_KEYWORDS}
        maxLength={40}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          }
          if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => add(draft)}
      />

      {matches.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {matches.map((keyword) => (
            <li key={keyword}>
              <button
                type="button"
                onClick={() => add(keyword)}
                className="rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors duration-300 hover:border-primary hover:text-primary"
              >
                + {keyword}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className={`text-xs ${showError && error ? "text-primary" : "text-muted-foreground"}`}>
        {showError && error
          ? error
          : `Minimaal ${MIN_KEYWORDS}, maximaal ${MAX_KEYWORDS} trefwoorden.`}
      </p>
    </div>
  );
}
