import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, MapPin, Instagram, CheckCircle2, AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteContentQuery } from "@/lib/queries";
import { sendContactMessage } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Dennis Hagemeijer Fotografie" },
      {
        name: "description",
        content:
          "Neem contact op met Dennis Hagemeijer Fotografie voor prints, opdrachten of vragen over een serie.",
      },
      { property: "og:title", content: "Contact — Dennis Hagemeijer Fotografie" },
      {
        property: "og:description",
        content: "Vragen over prints of opdrachten? Stuur een bericht.",
      },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  naam: z.string().trim().min(2, "Vul je naam in").max(100, "Naam is te lang"),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  bericht: z.string().trim().min(10, "Schrijf een iets langer bericht").max(2000),
});

const FALLBACK_EMAIL = "dennimageai@gmail.com";

function ContactPage() {
  const { data: setting } = useQuery(siteContentQuery("contact_email"));
  const EMAIL = setting?.body?.trim() || FALLBACK_EMAIL;
  const send = useServerFn(sendContactMessage);

  const [values, setValues] = useState({ naam: "", email: "", bericht: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const response = await send({ data: result.data });
      if (response.ok) {
        setStatus("success");
        setStatusMessage("Bedankt! Je bericht is verstuurd, ik reageer zo snel mogelijk.");
        setValues({ naam: "", email: "", bericht: "" });
        toast.success("Bericht verstuurd");
        return;
      }
      setStatus("error");
      setStatusMessage(
        `Het bericht kon nog niet automatisch verzonden worden. Mail rechtstreeks naar ${EMAIL}.`,
      );
      toast.error("Verzenden mislukt");
    } catch {
      setStatus("error");
      setStatusMessage(
        `Er ging iets mis bij het verzenden. Probeer het later opnieuw of mail naar ${EMAIL}.`,
      );
      toast.error("Verzenden mislukt");
    }
  };

  return (
    <div className="pb-8">
      <PageHeader
        eyebrow="Contact"
        title="Neem contact op"
        description="Vragen over een serie, een print of een opdracht? Stuur een bericht en ik reageer zo snel mogelijk."
      />

      <div className="page-shell grid gap-12 md:grid-cols-[2fr_3fr]">
        <div className="space-y-6 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="font-medium">E-mail</p>
              <a href={`mailto:${EMAIL}`} className="text-muted-foreground hover:text-primary">
                {EMAIL}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="font-medium">Standplaats</p>
              <p className="text-muted-foreground">Nederland — werkt landelijk</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Instagram className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="font-medium">Social</p>
              <p className="text-muted-foreground">Volgt binnenkort</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-5 border border-border p-6 sm:p-8"
        >
          <div className="space-y-2">
            <Label htmlFor="naam">Naam</Label>
            <Input
              id="naam"
              value={values.naam}
              maxLength={100}
              onChange={(e) => setValues((v) => ({ ...v, naam: e.target.value }))}
            />
            {errors['naam'] ? <p className="text-xs text-primary">{errors['naam']}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              maxLength={255}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            />
            {errors['email'] ? <p className="text-xs text-primary">{errors['email']}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bericht">Bericht</Label>
            <Textarea
              id="bericht"
              rows={6}
              maxLength={2000}
              value={values.bericht}
              onChange={(e) => setValues((v) => ({ ...v, bericht: e.target.value }))}
            />
            {errors['bericht'] ? <p className="text-xs text-primary">{errors['bericht']}</p> : null}
          </div>
          <Button type="submit" size="lg">
            Verstuur bericht
          </Button>
        </form>
      </div>
    </div>
  );
}
