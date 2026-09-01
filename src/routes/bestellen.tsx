import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearBasket, removeFromBasket, useBasket } from "@/lib/basket";
import { ProtectedPhoto } from "@/components/site/ProtectedPhoto";
import { photoUrl } from "@/lib/photo";
import { formatEuro, nextTierHint, savingsCents, totalCents, unitCents } from "@/lib/pricing";
import { createOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/bestellen")({
  head: () => ({
    meta: [
      { title: "Je selectie — Dennis Hagemeijer Fotografie" },
      {
        name: "description",
        content:
          "Bekijk je geselecteerde foto's, zie direct het staffelvoordeel en rond je bestelling af.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Je selectie — Dennis Hagemeijer Fotografie" },
      { property: "og:description", content: "Rond je fotobestelling af." },
    ],
  }),
  component: BasketPage,
});

const checkoutSchema = z.object({
  naam: z.string().trim().min(2, "Vul je naam in").max(100),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  telefoon: z.string().trim().min(6, "Vul je telefoonnummer in").max(40),
});

function BasketPage() {
  const items = useBasket();
  const submit = useServerFn(createOrder);
  const [values, setValues] = useState({ naam: "", email: "", telefoon: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [confirmation, setConfirmation] = useState<{ count: number; totalCents: number } | null>(
    null,
  );

  const count = items.length;
  const total = totalCents(count);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = checkoutSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const result = await submit({
        data: { ...parsed.data, photoIds: items.map((item) => item.id) },
      });
      setConfirmation({ count: result.count, totalCents: result.totalCents });
      clearBasket();
      setStatus("done");
    } catch (error) {
      setStatus("idle");
      toast.error(error instanceof Error ? error.message : "Bestelling mislukt");
    }
  };

  if (status === "done" && confirmation) {
    return (
      <div className="page-shell max-w-2xl py-24">
        <CheckCircle2 className="size-8 text-primary" />
        <h1 className="mt-6 font-display text-3xl">Bedankt voor je bestelling</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Ik heb je selectie van {confirmation.count} foto&apos;s ontvangen, met een totaalbedrag
          van {formatEuro(confirmation.totalCents)}. Je ontvangt een bevestiging per mail en
          binnenkort een betaalverzoek. Zodra de betaling is verwerkt, stuur ik je de downloadlink.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link to="/collecties">Verder kijken</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="page-shell py-12">
      <PageHeader
        eyebrow="Selectie"
        title="Je foto's"
        description="Voeg foto's toe terwijl je rondkijkt. Het staffelvoordeel wordt automatisch toegepast."
      />

      {count === 0 ? (
        <div className="py-20">
          <p className="text-sm text-muted-foreground">Je selectie is nog leeg.</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/collecties">Bekijk de collecties</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <ul className="space-y-4">
            {items.map((item) => {
              const src = photoUrl(item.storage_path);
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                >
                  {src ? (
                    <ProtectedPhoto
                      src={src}
                      alt={item.title || "Foto"}
                      watermark="none"
                      wrapperClassName="size-16 shrink-0"
                      className="size-16 object-cover"
                    />
                  ) : null}
                  <span className="flex-1 text-sm">{item.title || "Zonder titel"}</span>
                  <button
                    type="button"
                    aria-label="Verwijderen uit selectie"
                    onClick={() => removeFromBasket(item.id)}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="flex items-baseline justify-between">
                <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  {count} foto&apos;s
                </span>
                <span className="font-display text-3xl">{formatEuro(total)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatEuro(unitCents(count))} per foto
                {savingsCents(count) > 0 ? ` · je bespaart ${formatEuro(savingsCents(count))}` : ""}
              </p>
              {nextTierHint(count) ? (
                <p className="mt-4 text-xs text-primary">{nextTierHint(count)}</p>
              ) : null}
              <p className="mt-6 text-[0.6875rem] leading-relaxed tracking-[0.08em] text-muted-foreground uppercase">
                € 5,00 per foto · 5-pack € 22,50 · 10-pack € 40,00
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-border p-8">
              <h2 className="font-display text-2xl">Afronden</h2>
              {(["naam", "email", "telefoon"] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {field === "naam" ? "Naam" : field === "email" ? "E-mailadres" : "Telefoonnummer"}
                  </Label>
                  <Input
                    id={field}
                    type={field === "email" ? "email" : field === "telefoon" ? "tel" : "text"}
                    value={values[field]}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field]: event.target.value }))
                    }
                  />
                  {errors[field] ? <p className="text-xs text-primary">{errors[field]}</p> : null}
                </div>
              ))}
              <p className="text-xs leading-relaxed text-muted-foreground">
                Je ontvangt een bevestiging en daarna een persoonlijk betaalverzoek. Na betaling
                krijg je een downloadlink die 7 dagen geldig is.
              </p>
              <Button type="submit" disabled={status === "sending"} className="w-full">
                {status === "sending" ? "Versturen…" : `Bestellen — ${formatEuro(total)}`}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
