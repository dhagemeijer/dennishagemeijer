import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";

import portret from "@/assets/portret.png.asset.json";
import { PageHeader } from "@/components/site/PageHeader";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { photoUrl } from "@/lib/photo";
import { siteContentQuery } from "@/lib/queries";

export const Route = createFileRoute("/over")({
  head: () => ({
    meta: [
      { title: "Over de fotograaf — Dennis Hagemeijer Fotografie" },
      {
        name: "description",
        content:
          "Maak kennis met Dennis Hagemeijer: fotograaf van macro, natuur, street en voetbal in Nederland.",
      },
      { property: "og:title", content: "Over de fotograaf — Dennis Hagemeijer" },
      {
        property: "og:description",
        content: "Het verhaal achter de foto's: macro, natuur, street en voetbal.",
      },
    ],
  }),
  component: AboutPage,
});

const FALLBACK_BODY = `Mijn naam is Dennis Hagemeijer. Fotografie begon voor mij als een manier om beter te kijken: naar het licht op een dauwdruppel, naar de spanning op een gezicht in de zestien, naar het ritme van een straat op een gewone dinsdagmiddag.

Ik werk het liefst rustig en dichtbij, met natuurlijk licht en zo min mogelijk bewerking.`;

function AboutPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { data: content } = useQuery(siteContentQuery("about"));
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);

  useEffect(() => {
    setBody(content?.body ?? FALLBACK_BODY);
    setImagePath(content?.image_path ?? portret.url);
  }, [content]);

  const save = useMutation({
    mutationFn: async () => {
      const text = body.trim();
      if (text.length < 10) throw new Error("Vul een tekst in");
      const { error } = await supabase
        .from("site_content")
        .upsert({ key: "about", body: text, image_path: imagePath }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Pagina bijgewerkt");
      setEditing(false);
      void queryClient.invalidateQueries({ queryKey: ["site-content", "about"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const displayBody = content?.body?.trim() ? content.body : FALLBACK_BODY;
  const displayImage = photoUrl(content?.image_path ?? portret.url);
  const paragraphs = displayBody.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <div className="pb-8">
      <PageHeader eyebrow="Over" title="Over de fotograaf" />

      {isAdmin ? (
        <div className="page-shell mb-8 flex justify-end">
          <Button variant="outline" onClick={() => setEditing((v) => !v)}>
            {editing ? (
              <>
                <X className="mr-2 size-4" /> Annuleren
              </>
            ) : (
              <>
                <Pencil className="mr-2 size-4" /> Pagina bewerken
              </>
            )}
          </Button>
        </div>
      ) : null}

      {isAdmin && editing ? (
        <div className="page-shell mb-12 space-y-6 rounded-xl border border-border bg-card p-8">
          <ImageUploadField
            label="Portretfoto"
            value={imagePath}
            folder="site/over"
            onChange={setImagePath}
          />
          <div className="space-y-2">
            <Label htmlFor="about-body">Tekst (lege regel = nieuwe alinea)</Label>
            <Textarea
              id="about-body"
              rows={14}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              Opslaan
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Annuleren
            </Button>
          </div>
        </div>
      ) : null}

      <div className="page-shell grid gap-16 md:grid-cols-[2fr_3fr] md:items-start lg:gap-24">
        <div className="aspect-[4/5] overflow-hidden bg-card">
          {displayImage ? (
            <img
              src={displayImage}
              alt="Portret van Dennis Hagemeijer"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="space-y-8 text-base leading-loose text-muted-foreground">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
