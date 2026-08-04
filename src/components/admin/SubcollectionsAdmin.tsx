import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

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
import { subcollectionsQuery, type Subcollection } from "@/lib/queries";
import { formatDateNl, slugify } from "@/lib/photo";

export function SubcollectionsAdmin({ collectionId }: { collectionId: string }) {
  const queryClient = useQueryClient();
  const { data: subcollections = [] } = useQuery(subcollectionsQuery(collectionId));
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subcollection | null>(null);
  const [form, setForm] = useState({ name: "", description: "", event_date: "" });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["subcollections"] });
    void queryClient.invalidateQueries({ queryKey: ["collection-counts"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const name = form.name.trim();
      if (name.length < 2) throw new Error("Vul een naam in");
      const payload = {
        name,
        description: form.description.trim(),
        event_date: form.event_date || null,
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
      setForm({ name: "", description: "", event_date: "" });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Subcollecties</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                setForm({ name: "", description: "", event_date: "" });
              }}
            >
              <Plus className="mr-2 size-4" /> Nieuwe subcollectie
            </Button>
          </DialogTrigger>
          <DialogContent>
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
              <div className="space-y-2">
                <Label htmlFor="sub-date">Datum</Label>
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
          {subcollections.map((sub) => (
            <li key={sub.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <Link
                  to="/admin/subcollectie/$id"
                  params={{ id: sub.id }}
                  className="font-medium hover:text-primary"
                >
                  {sub.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {sub.event_date ? formatDateNl(sub.event_date) : "Geen datum"}
                </p>
              </div>
              <Button
                size="icon"
                variant="outline"
                aria-label="Bewerken"
                onClick={() => {
                  setEditing(sub);
                  setForm({
                    name: sub.name,
                    description: sub.description,
                    event_date: sub.event_date?.slice(0, 10) ?? "",
                  });
                  setOpen(true);
                }}
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
          ))}
        </ul>
      )}
    </div>
  );
}
