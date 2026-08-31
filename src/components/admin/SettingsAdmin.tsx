import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { siteContentQuery } from "@/lib/queries";

const emailSchema = z.string().trim().email("Ongeldig e-mailadres").max(255);

export function SettingsAdmin() {
  const queryClient = useQueryClient();
  const { data: setting } = useQuery(siteContentQuery("contact_email"));
  const { data: mailSetting } = useQuery(siteContentQuery("notify_orders_email"));
  const { data: pushSetting } = useQuery(siteContentQuery("notify_orders_push"));
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(setting?.body ?? "");
  }, [setting]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = emailSchema.parse(email);
      const { error } = await supabase
        .from("site_content")
        .upsert({ key: "contact_email", body: parsed }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Instellingen opgeslagen");
      void queryClient.invalidateQueries({ queryKey: ["site-content", "contact_email"] });
    },
    onError: (error: Error) =>
      toast.error(error instanceof z.ZodError ? "Ongeldig e-mailadres" : error.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ key, on }: { key: string; on: boolean }) => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, body: on ? "on" : "off" }, { onConflict: "key" });
      if (error) throw new Error(error.message);
      return key;
    },
    onSuccess: (key) => {
      toast.success("Notificatie-instelling bijgewerkt");
      void queryClient.invalidateQueries({ queryKey: ["site-content", key] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const mailOn = (mailSetting?.body ?? "on") !== "off";
  const pushOn = (pushSetting?.body ?? "on") !== "off";

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Instellingen</p>
        <h2 className="font-display text-2xl">Contact &amp; notificaties</h2>
      </div>

      <div className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-8">
        <div className="space-y-2">
          <Label htmlFor="contact-email">Ontvanger contactformulier</Label>
          <Input
            id="contact-email"
            type="email"
            maxLength={255}
            value={email}
            placeholder="naam@voorbeeld.nl"
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Berichten via het contactformulier en meldingen van nieuwe bestellingen gaan naar dit
            adres. Dit adres staat ook op de contactpagina.
          </p>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          Opslaan
        </Button>
      </div>

      <div className="max-w-xl space-y-6 rounded-xl border border-border bg-card p-8">
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          Melding bij nieuwe bestelling
        </p>
        <div className="flex items-center justify-between gap-6">
          <div>
            <Label htmlFor="notify-mail">E-mailmelding</Label>
            <p className="text-xs text-muted-foreground">
              Stuurt een mail naar het adres hierboven bij elke nieuwe bestelling.
            </p>
          </div>
          <Switch
            id="notify-mail"
            checked={mailOn}
            disabled={toggle.isPending}
            onCheckedChange={(on) => toggle.mutate({ key: "notify_orders_email", on })}
          />
        </div>
        <div className="flex items-center justify-between gap-6">
          <div>
            <Label htmlFor="notify-push">Pushmelding</Label>
            <p className="text-xs text-muted-foreground">
              Stuurt een korte pushmelding via de bestaande meldingsinfrastructuur.
            </p>
          </div>
          <Switch
            id="notify-push"
            checked={pushOn}
            disabled={toggle.isPending}
            onCheckedChange={(on) => toggle.mutate({ key: "notify_orders_push", on })}
          />
        </div>
      </div>
    </section>
  );
}
