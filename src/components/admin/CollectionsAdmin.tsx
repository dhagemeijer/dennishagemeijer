import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Settings2, Trash2 } from "lucide-react";

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
import { collectionsQuery, collectionCountsQuery, type Collection } from "@/lib/queries";
import { photoUrl, slugify } from "@/lib/photo";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export function CollectionsAdmin() {
  const queryClient = useQueryClient();
  const { data: collections = [] } = useQuery(collectionsQuery);
  const { data: counts = {} } = useQuery(collectionCountsQuery);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    cover: string | null;
  }>({ name: "", description: "", cover: null });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["collections"] });
    void queryClient.invalidateQueries({ queryKey: ["collection-counts"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const name = form.name.trim();
      if (name.length < 2) throw new Error("Vul een naam in");
      if (editing) {
        const { error } = await supabase
          .from("collections")
          .update({
            name,
            description: form.description.trim(),
            cover_photo_url: form.cover,
          })
          .eq("id", editing.id);
        if (error) throw new Error(error.message);
        return;
      }
      const { error } = await supabase.from("collections").insert({
        name,
        slug: slugify(name) || crypto.randomUUID().slice(0, 8),
        description: form.description.trim(),
        cover_photo_url: form.cover,
        sort_order: collections.length,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success(editing ? "Collectie bijgewerkt" : "Collectie aangemaakt");
      setOpen(false);
      setEditing(null);
      setForm({ name: "", description: "", cover: null });
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Collectie verwijderd");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const startCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", cover: null });
    setOpen(true);
  };

  const startEdit = (collection: Collection) => {
    setEditing(collection);
    setForm({
      name: collection.name,
      description: collection.description,
      cover: collection.cover_photo_url,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Collecties</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startCreate}>
              <Plus className="mr-2 size-4" /> Nieuwe collectie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Collectie bewerken" : "Nieuwe collectie"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collection-name">Naam</Label>
                <Input
                  id="collection-name"
                  value={form.name}
                  maxLength={80}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-description">Omschrijving</Label>
                <Textarea
                  id="collection-description"
                  rows={4}
                  maxLength={600}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <ImageUploadField
                label="Omslagfoto"
                value={form.cover}
                folder="covers/collecties"
                onChange={(cover) => setForm((f) => ({ ...f, cover }))}
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

      {collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nog geen collecties. Maak bijvoorbeeld Macro, Natuur, Street en Voetbal aan.
        </p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {collections.map((collection) => {
            const count = counts[collection.id];
            const cover = photoUrl(collection.cover_photo_url);
            return (
              <li key={collection.id} className="flex items-center gap-4 py-4">
                <div className="size-16 shrink-0 overflow-hidden bg-muted">
                  {cover ? (
                    <img src={cover} alt="" loading="lazy" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/admin/collectie/$id"
                    params={{ id: collection.id }}
                    className="font-medium hover:text-primary"
                  >
                    {collection.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {count?.subcollections ?? 0} subcollecties · {count?.photos ?? 0} losse
                    foto&apos;s
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/collectie/$id" params={{ id: collection.id }}>
                    <Settings2 className="mr-2 size-4" /> Beheren
                  </Link>
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Bewerken"
                  onClick={() => startEdit(collection)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Verwijderen"
                  className="text-primary"
                  onClick={() => {
                    if (confirm(`"${collection.name}" en alle inhoud verwijderen?`)) {
                      remove.mutate(collection.id);
                    }
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
