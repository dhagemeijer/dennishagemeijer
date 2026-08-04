import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  matchLabel,
  subcollectionPhotoCountsQuery,
  searchIndexQuery,
  subcollectionsQuery,
  type Subcollection,
} from "@/lib/queries";
import { formatDateNl, photoUrl, slugify } from "@/lib/photo";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { KeywordInput } from "@/components/admin/KeywordInput";
import { keywordsError, normalizeKeywords } from "@/lib/keywords";
import { allKeywords } from "@/lib/search";

type Form = {
  name: string;
  description: string;
  event_date: string;
  home_team: string;
  away_team: string;
  cover: string | null;
  keywords: string[];
};

const emptyForm: Form = {
  name: "",
  description: "",
  event_date: "",
  home_team: "",
  away_team: "",
  cover: null,
  keywords: [],
};

export function SubcollectionsAdmin({ collectionId }: { collectionId: string }) {
  const queryClient = useQueryClient();
  const { data: subcollections = [] } = useQuery(subcollectionsQuery(collectionId));
  const { data: photoCounts = {} } = useQuery(subcollectionPhotoCountsQuery(collectionId));
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subcollection | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [showKeywordError, setShowKeywordError] = useState(false);
  const { data: index } = useQuery(searchIndexQuery);
  const suggestions = index ? allKeywords(index) : [];

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["subcollections"] });
    void queryClient.invalidateQueries({ queryKey: ["subcollection-photo-counts"] });
    void queryClient.invalidateQueries({ queryKey: ["collection-counts"] });
    void queryClient.invalidateQueries({ queryKey: ["search-index"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const name = form.name.trim();
      if (name.length < 2) throw new Error("Vul een naam in");
      const keywordProblem = keywordsError(form.keywords);
      if (keywordProblem) {
        setShowKeywordError(true);
        throw new Error(keywordProblem);
      }
      const payload = {
        name,
        description: form.description.trim(),
        event_date: form.event_date || null,
        home_team: form.home_team.trim() || null,
        away_team: form.away_team.trim() || null,
        cover_photo_url: form.cover,
        keywords: normalizeKeywords(form.keywords),
      };
      if (editing) {
        const { error } = await supabase
          .from("subcollections")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw new Error(error.message);
        return;
      }
      const { error } = await supabase.from("subcollections").insert({
        ...payload,
        collection_id: collectionId,
        slug: slugify(name) || crypto.randomUUID().slice(0, 8),
        sort_order: subcollections.length,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success(editing ? "Subcollectie bijgewerkt" : "Subcollectie aangemaakt");
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setShowKeywordError(false);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subcollections").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Subcollectie verwijderd");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const move = useMutation({
    mutationFn: async ({ index, direction }: { index: number; direction: -1 | 1 }) => {
      const target = index + direction;
      const a = subcollections[index];
      const b = subcollections[target];
      if (!a || !b) return;
      const results = await Promise.all([
        supabase.from("subcollections").update({ sort_order: target }).eq("id", a.id),
        supabase.from("subcollections").update({ sort_order: index }).eq("id", b.id),
      ]);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw new Error(failed.error.message);
    },
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message),
  });

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowKeywordError(false);
  };

  const startEdit = (sub: Subcollection) => {
    setEditing(sub);
    setForm({
      name: sub.name,
      description: sub.description,
      event_date: sub.event_date?.slice(0, 10) ?? "",
      home_team: sub.home_team ?? "",
      away_team: sub.away_team ?? "",
      cover: sub.cover_photo_url,
      keywords: sub.keywords ?? [],
    });
    setShowKeywordError(false);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Subcollecties</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={startCreate}>
              <Plus className="mr-2 size-4" /> Nieuwe subcollectie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Subcollectie bewerken" : "Nieuwe subcollectie"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sub-name">Naam (bijv. Ajax — Feyenoord)</Label>
                <Input
                  id="sub-name"
                  value={form.name}
                  maxLength={120}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sub-home">Thuisteam (optioneel)</Label>
                  <Input
                    id="sub-home"
                    value={form.home_team}
                    maxLength={80}
                    onChange={(e) => setForm((f) => ({ ...f, home_team: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-away">Uitteam (optioneel)</Label>
                  <Input
                    id="sub-away"
                    value={form.away_team}
                    maxLength={80}
                    onChange={(e) => setForm((f) => ({ ...f, away_team: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-date">Datum (optioneel)</Label>
                <Input
                  id="sub-date"
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-description">Omschrijving</Label>
                <Textarea
                  id="sub-description"
                  rows={3}
                  maxLength={600}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <ImageUploadField
                label="Omslagfoto"
                value={form.cover}
                folder="covers/subcollecties"
                onChange={(cover) => setForm((f) => ({ ...f, cover }))}
              />
              <KeywordInput
                id="sub-keywords"
                value={form.keywords}
                suggestions={suggestions}
                showError={showKeywordError}
                onChange={(keywords) => setForm((f) => ({ ...f, keywords }))}
              />
            </div>
            <DialogFooter>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                Opslaan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {subcollections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nog geen subcollecties. Foto&apos;s kunnen ook direct in de collectie staan.
        </p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {subcollections.map((sub, index) => {
            const cover = photoUrl(sub.cover_photo_url);
            const teams = matchLabel(sub);
            const count = photoCounts[sub.id] ?? 0;
            return (
              <li key={sub.id} className="flex items-center gap-4 py-3">
                <div className="size-16 shrink-0 overflow-hidden bg-muted">
                  {cover ? (
                    <img src={cover} alt="" loading="lazy" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/admin/subcollectie/$id"
                    params={{ id: sub.id }}
                    className="font-medium hover:text-primary"
                  >
                    {sub.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {[teams, sub.event_date ? formatDateNl(sub.event_date) : null]
                      .filter(Boolean)
                      .join(" · ") || "Geen wedstrijdgegevens"}
                    {" · "}
                    {count} {count === 1 ? "foto" : "foto's"}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Omhoog"
                  disabled={index === 0 || move.isPending}
                  onClick={() => move.mutate({ index, direction: -1 })}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Omlaag"
                  disabled={index === subcollections.length - 1 || move.isPending}
                  onClick={() => move.mutate({ index, direction: 1 })}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Bewerken"
                  onClick={() => startEdit(sub)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Verwijderen"
                  className="text-primary"
                  onClick={() => {
                    if (confirm(`"${sub.name}" en de foto's erin verwijderen?`)) remove.mutate(sub.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
